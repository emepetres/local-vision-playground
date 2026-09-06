"""The ``observe`` command: one Observation, on demand.

It composes capture and inference and owns nothing else. The camera, Foundry and the clock
arrive as ports rather than being constructed here, which is the injection point the
benchmarking feature will need — and what lets the tests drive the whole command with
fakes.

The latency is not one number. Registering the Execution Providers is machine setup rather
than part of any Observation; loading the model, preparing the Frame and running inference
are three further costs of wildly different magnitude, and only the last is the latency of
the Observation. Nothing is warmed up: the first run is the honest run.
"""

from __future__ import annotations

import argparse
import sys
from collections.abc import Callable, Sequence
from pathlib import Path
from typing import TextIO

from tqdm import tqdm

from vision.capture import (
    FRAMES_DIRECTORY,
    WORKING_RESOLUTION,
    Camera,
    Frame,
    ImageFileCamera,
    LiveCamera,
    OpenFeed,
    open_camera_feed,
    save_frame,
)
from vision.errors import VisionError
from vision.inference import (
    DEFAULT_ALIAS,
    PROMPT,
    FoundryLocal,
    ModelIdentity,
    Observation,
    Timings,
    VisionModel,
    Workload,
    require_vision_task,
)

Clock = Callable[[], float]
"""Reads a monotonic number of seconds. Injected so latencies are deterministic in tests."""

LABEL_WIDTH = 11


def main(
    argv: Sequence[str] | None = None,
    *,
    camera: Camera | None = None,
    open_feed: OpenFeed | None = None,
    foundry: FoundryLocal | None = None,
    clock: Clock | None = None,
    out: TextIO | None = None,
    err: TextIO | None = None,
    frames_dir: Path | None = None,
) -> int:
    """Run the command. Every port defaults to the real thing when it is not injected."""
    args = _parser().parse_args(argv)
    out = out if out is not None else sys.stdout
    err = err if err is not None else sys.stderr

    if open_feed is None:
        open_feed = open_camera_feed
    if frames_dir is None:
        frames_dir = FRAMES_DIRECTORY

    owned: list[Callable[[], None]] = []
    try:
        default_camera, keep_in = _source(args, open_feed, frames_dir)
        if camera is None:
            camera = default_camera
        if foundry is None:
            foundry, close = _foundry()
            owned.append(close)
        if clock is None:
            from time import perf_counter

            clock = perf_counter

        workload, observation, saved = _observe(
            camera=camera,
            foundry=foundry,
            clock=clock,
            model_name=args.model,
            out=out,
            keep_in=keep_in,
        )
    except Exception as error:
        if args.debug:
            raise
        print(f"error: {_one_line(error)}", file=err)
        return 1
    finally:
        for close in owned:
            close()

    _render(observation, workload, saved, out=out)
    return 0


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="observe",
        description="Take one Frame, ask the local model what it sees, print the Observation.",
    )
    source = parser.add_mutually_exclusive_group()
    source.add_argument(
        "--image",
        type=Path,
        help="take the Frame from this image file instead of from a camera",
    )
    source.add_argument(
        "--camera",
        type=int,
        default=0,
        metavar="N",
        help="index of the camera to open the Feed on (default: 0)",
    )
    parser.add_argument(
        "--variant",
        metavar="ID",
        dest="model",
        default=DEFAULT_ALIAS,
        help=(
            "pin this exact model variant, version suffix included, and with it the"
            " Execution Provider the work runs on (default: resolve the alias"
            f" {DEFAULT_ALIAS}, letting Foundry Local pick the hardware)"
        ),
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="re-raise failures with their full traceback",
    )
    return parser


def _source(
    args: argparse.Namespace, open_feed: OpenFeed, frames_dir: Path
) -> tuple[Camera, Path | None]:
    """Where the Frame comes from, and where — if anywhere — it has to be kept.

    One decision rather than two: a Frame from an image file is already on disk, so it is
    the same fact that says which Camera to build and that only the camera's Frame needs
    writing out.
    """
    if args.image is not None:
        return ImageFileCamera(args.image), None
    return LiveCamera(args.camera, open_feed), frames_dir


def _foundry() -> tuple[FoundryLocal, Callable[[], None]]:
    from vision.inference import InProcessFoundryLocal

    foundry = InProcessFoundryLocal()
    return foundry, foundry.close


def _observe(
    *,
    camera: Camera,
    foundry: FoundryLocal,
    clock: Clock,
    model_name: str,
    out: TextIO,
    keep_in: Path | None,
) -> tuple[Workload, Observation, Path | None]:
    # Refusing a model that cannot see a Frame comes first, ahead of every download this
    # command can start — the Execution Providers are fetched on a first run too, and
    # waiting for those in order to be told the model was never a vision-language model
    # is the same failure the refusal exists to prevent.
    model = foundry.resolve(model_name)
    identity = model.identity
    require_vision_task(identity)

    providers = _register_execution_providers(foundry, clock=clock, out=out)
    _download(model, clock=clock, out=out)

    _, load = _timed(clock, lambda: _load(model))
    frame, capture = _timed(clock, camera.capture)
    # Kept before inference runs: a Frame worth explaining is worth keeping even when the
    # Observation that would have prompted the question never arrives.
    saved = save_frame(frame, keep_in) if keep_in is not None else None
    workload = Workload(prompt=PROMPT, frame=frame)
    raw, inference = _timed(clock, lambda: model.observe(workload))

    observation = Observation(
        text=raw.text,
        model=identity,
        finish_reason=raw.finish_reason,
        timings=Timings(providers=providers, load=load, capture=capture, inference=inference),
    )
    return workload, observation, saved


def _register_execution_providers(
    foundry: FoundryLocal,
    *,
    clock: Clock,
    out: TextIO,
) -> float:
    """Register the Execution Providers, timing and announcing what the port reports.

    Timed apart from the three latencies because it is not one of them: it is paid once
    per process, before a model is loaded. Why it is not optional is on the port.
    """
    announced = False

    def announce(line: str) -> None:
        nonlocal announced
        announced = True
        print(line, file=out, flush=True)

    _, seconds = _timed(clock, lambda: foundry.register_execution_providers(announce))
    if announced:
        print(file=out)
    return seconds


def _load(model: VisionModel) -> None:
    """Load the model, turning a native load failure into something to act on.

    A variant that will not load is not a rare accident: Foundry Local picks the hardware
    when the model is named by alias, and it can pick a variant this machine cannot run —
    including one whose ONNX graph is invalid as published. The only lever an Operator has
    is to name a different variant (see docs/stack.md, Constraint 3), so the message says
    that rather than leaving them with a native stack.
    """
    try:
        model.load()
    except VisionError:
        raise
    except Exception as error:
        identity = model.identity
        on = f" on {identity.runtime}" if identity.runtime is not None else ""
        raise VisionError(
            f"{identity.variant} would not load{on} — pin a different variant with"
            " --variant (run `foundry model list`; a -generic-cpu variant is the safe one)."
            f" Foundry Local said: {error}"
        ) from error


def _download(model: VisionModel, *, clock: Clock, out: TextIO) -> None:
    """Fetch the weights on first run. Its cost is reported outside the three latencies."""
    if model.is_cached:
        return

    # Foundry Local reports progress as a percentage, and calls back far more often than
    # a screen can usefully be redrawn; tqdm does the rate limiting, and takes itself off
    # when nothing is watching (`disable=None` means "disable when this is not a TTY"),
    # which is what keeps the rendered output assertable in the tests.
    with tqdm(
        total=100,
        desc=f"Downloading {model.identity.variant}",
        unit="%",
        bar_format="{desc} |{bar}| {n:.0f}% [{elapsed}<{remaining}]",
        file=out,
        disable=None,
    ) as bar:

        def on_progress(percent: float) -> None:
            bar.update(max(0.0, min(percent, 100.0) - bar.n))

        _, seconds = _timed(clock, lambda: model.download(on_progress))

    print(f"Downloaded in {_format_seconds(seconds)}\n", file=out, flush=True)


def _timed[T](clock: Clock, work: Callable[[], T]) -> tuple[T, float]:
    start = clock()
    result = work()
    return result, clock() - start


def _render(
    observation: Observation, workload: Workload, saved: Path | None, *, out: TextIO
) -> None:
    """Print the report, the Observation, and the limit it ran into if it ran into one.

    The token limit is read off the Workload rather than off a constant: the number an
    Operator is shown is the one the Observation was actually generated under.
    """
    for label, value in _report(observation, workload.frame, saved):
        print(f"{label:<{LABEL_WIDTH}}{value}", file=out)
    print(file=out)
    print(observation.text, file=out)
    if observation.truncated:
        print(file=out)
        print(
            f"(truncated: the Observation hit the {workload.max_output_tokens}-token output limit)",
            file=out,
        )


def _report(observation: Observation, frame: Frame, saved: Path | None) -> list[tuple[str, str]]:
    timings = observation.timings
    rows = [
        ("Model", _format_model(observation.model)),
        ("Frame", _format_frame(frame)),
    ]
    if saved is not None:
        rows.append(("Saved", str(saved)))
    rows += [
        ("Providers", _format_seconds(timings.providers)),
        ("Load", _format_seconds(timings.load)),
        ("Capture", _format_capture(timings.capture, frame)),
        ("Inference", _format_seconds(timings.inference)),
    ]
    return rows


def _format_capture(seconds: float, frame: Frame) -> str:
    """Name the settling discards where their cost is, rather than beside it.

    They are not overhead around the capture: they are the capture, and the number the
    Operator is shown is the wait they actually sat through.
    """
    if frame.settling_discards == 0:
        return _format_seconds(seconds)
    return (
        f"{_format_seconds(seconds)} (including {frame.settling_discards} Frames discarded"
        " while the Feed settled)"
    )


def _format_model(identity: ModelIdentity) -> str:
    detail = f"alias {identity.alias}"
    if identity.runtime is not None:
        detail = f"{detail}, {identity.runtime}"
    return f"{identity.variant} ({detail})"


def _format_frame(frame: Frame) -> str:
    """Name the working resolution as well as this Frame's own.

    They only coincide for a 4:3 Frame — a 16:9 one fits the same box at 640x360 — and it
    is the working resolution that fixes the workload.
    """
    working = "x".join(str(edge) for edge in WORKING_RESOLUTION)
    return f"{frame.width}x{frame.height} {frame.codec}, fit to {working}, from {frame.provenance}"


def _format_seconds(seconds: float) -> str:
    return f"{seconds:.3f} s"


def _one_line(error: Exception) -> str:
    if isinstance(error, VisionError):
        return str(error)
    return f"{type(error).__name__}: {error} — rerun with --debug for the full traceback"
