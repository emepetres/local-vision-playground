"""The ``observe`` command: one Observation, on demand.

It composes capture and inference and owns nothing else. The camera, Foundry and the clock
arrive as ports rather than being constructed here, which is the injection point the
benchmarking feature will need — and what lets the tests drive the whole command with
fakes.

The latency is not one number. Loading the model, preparing the Frame and running
inference are three costs of wildly different magnitude, and only the third is the latency
of the Observation. Nothing is warmed up: the first run is the honest run.
"""

from __future__ import annotations

import argparse
import sys
from collections.abc import Callable, Sequence
from pathlib import Path
from typing import TextIO

from vision.capture import WORKING_RESOLUTION, Camera, Frame, ImageFileCamera
from vision.errors import VisionError
from vision.inference import (
    DEFAULT_MODEL,
    MAX_OUTPUT_TOKENS,
    PROMPT,
    FoundryLocal,
    ModelIdentity,
    Observation,
    Timings,
    VisionModel,
    require_vision_task,
)

Clock = Callable[[], float]
"""Reads a monotonic number of seconds. Injected so latencies are deterministic in tests."""

LABEL_WIDTH = 11


def main(
    argv: Sequence[str] | None = None,
    *,
    camera: Camera | None = None,
    foundry: FoundryLocal | None = None,
    clock: Clock | None = None,
    out: TextIO | None = None,
    err: TextIO | None = None,
) -> int:
    """Run the command. Every port defaults to the real thing when it is not injected."""
    args = _parser().parse_args(argv)
    out = out if out is not None else sys.stdout
    err = err if err is not None else sys.stderr

    owned: list[Callable[[], None]] = []
    try:
        if camera is None:
            camera = _camera_from(args)
        if foundry is None:
            foundry, close = _foundry(out)
            owned.append(close)
        if clock is None:
            from time import perf_counter

            clock = perf_counter

        frame, observation = _observe(
            camera=camera,
            foundry=foundry,
            clock=clock,
            model_name=args.model,
            out=out,
        )
    except Exception as error:
        if args.debug:
            raise
        print(f"error: {_one_line(error)}", file=err)
        return 1
    finally:
        for close in owned:
            close()

    _render(observation, frame, out=out)
    return 0


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="observe",
        description="Take one Frame, ask the local model what it sees, print the Observation.",
    )
    parser.add_argument(
        "--image",
        type=Path,
        help="the image file to take the Frame from",
    )
    parser.add_argument(
        "--model",
        default=DEFAULT_MODEL,
        help=(
            "model to resolve: an alias lets Foundry Local pick the hardware,"
            f" a variant id pins it (default: {DEFAULT_MODEL})"
        ),
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="re-raise failures with their full traceback",
    )
    return parser


def _camera_from(args: argparse.Namespace) -> Camera:
    if args.image is None:
        raise VisionError(
            "--image is required — capturing from a live camera Feed is not built yet"
        )
    return ImageFileCamera(args.image)


def _foundry(out: TextIO) -> tuple[FoundryLocal, Callable[[], None]]:
    from vision.inference import InProcessFoundryLocal

    announced = False

    def on_setup(line: str) -> None:
        nonlocal announced
        announced = True
        print(line, file=out, flush=True)

    foundry = InProcessFoundryLocal(on_setup=on_setup)
    if announced:
        print(file=out)
    return foundry, foundry.close


def _observe(
    *,
    camera: Camera,
    foundry: FoundryLocal,
    clock: Clock,
    model_name: str,
    out: TextIO,
) -> tuple[Frame, Observation]:
    model = foundry.resolve(model_name)
    identity = model.identity
    require_vision_task(identity)

    _download(model, identity, clock=clock, out=out)

    _, load = _timed(clock, model.load)
    frame, capture = _timed(clock, camera.capture)
    raw, inference = _timed(clock, lambda: model.observe(frame, PROMPT))

    observation = Observation(
        text=raw.text,
        model=identity,
        finish_reason=raw.finish_reason,
        timings=Timings(load=load, capture=capture, inference=inference),
    )
    return frame, observation


def _download(
    model: VisionModel,
    identity: ModelIdentity,
    *,
    clock: Clock,
    out: TextIO,
) -> None:
    """Fetch the weights on first run. Its cost is reported outside the three latencies."""
    if model.is_cached:
        return

    on_progress = _whole_percent_only(f"Downloading {identity.variant}", out=out)
    _, seconds = _timed(clock, lambda: model.download(on_progress))
    print(f"Downloaded in {_format_seconds(seconds)}\n", file=out, flush=True)


def _whole_percent_only(prefix: str, *, out: TextIO) -> Callable[[float], None]:
    """Report progress once per whole percent.

    Foundry Local calls back far more often than that — a couple of hundred times for a
    2B model — and an Operator watching a download does not need tenths of a percent.
    """
    reported = -1

    def on_progress(percent: float) -> None:
        nonlocal reported
        whole = int(percent)
        if whole <= reported:
            return
        reported = whole
        print(f"{prefix} {whole:3d}%", file=out, flush=True)

    return on_progress


def _timed[T](clock: Clock, work: Callable[[], T]) -> tuple[T, float]:
    start = clock()
    result = work()
    return result, clock() - start


def _render(observation: Observation, frame: Frame, *, out: TextIO) -> None:
    for label, value in _report(observation, frame):
        print(f"{label:<{LABEL_WIDTH}}{value}", file=out)
    print(file=out)
    print(observation.text, file=out)
    if observation.truncated:
        print(file=out)
        print(
            f"(truncated: the Observation hit the {MAX_OUTPUT_TOKENS}-token output limit)", file=out
        )


def _report(observation: Observation, frame: Frame) -> list[tuple[str, str]]:
    timings = observation.timings
    return [
        ("Model", _format_model(observation.model)),
        ("Frame", _format_frame(frame)),
        ("Load", _format_seconds(timings.load)),
        ("Capture", _format_seconds(timings.capture)),
        ("Inference", _format_seconds(timings.inference)),
    ]


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
