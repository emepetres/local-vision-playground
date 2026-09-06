"""The two console entry points: ``observe`` and ``benchmark``.

Each one composes capture, inference and reporting and owns nothing else. The camera,
Foundry and the clock arrive as ports rather than being constructed here, which is what
lets the tests drive either command end to end with fakes.

``observe`` answers *what do you see?* — one Frame, one Observation, and what each stage
cost. The latency is not one number: registering the Execution Providers is machine set-up
rather than part of any Observation; loading the model, preparing the Frame and running
inference are three further costs of wildly different magnitude, and only the last is the
latency of the Observation. Nothing is warmed up: the first run is the honest run.

``benchmark`` answers *what does it cost?* — the same Workload against several Variants,
several times each, printed as a table apiece. Where ``observe`` will take a Frame from the
live camera, ``benchmark`` refuses one: a different Frame per repetition is not a Workload.
"""

from __future__ import annotations

import argparse
import sys
from collections.abc import Callable, Sequence
from pathlib import Path
from typing import TextIO

from vision.benchmark import REPETITIONS, measure, require_a_benchmark_run
from vision.capture import (
    FRAMES_DIRECTORY,
    REFERENCE_FRAME,
    Camera,
    ImageFileCamera,
    LiveCamera,
    OpenFeed,
    open_camera_feed,
    save_frame,
)
from vision.errors import VisionError
from vision.inference import (
    DEFAULT_ALIAS,
    DEFAULT_VARIANTS,
    PROMPT,
    FoundryLocal,
    Observation,
    Timings,
    Workload,
)
from vision.reporting import render_benchmark, render_observation
from vision.startup import (
    Clock,
    accept_variant,
    bring_up,
    register_execution_providers,
    timed,
)


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
    """Run ``observe``. Every port defaults to the real thing when it is not injected."""
    args = _observe_parser().parse_args(argv)
    out, err = _streams(out, err)

    if open_feed is None:
        open_feed = open_camera_feed
    if frames_dir is None:
        frames_dir = FRAMES_DIRECTORY

    owned: list[Callable[[], None]] = []
    try:
        default_camera, keep_in = _source(args, open_feed, frames_dir)
        if camera is None:
            camera = default_camera
        foundry = _resolve_foundry(foundry, owned)
        clock = _resolve_clock(clock)

        workload, observation, saved = _observe(
            camera=camera,
            foundry=foundry,
            clock=clock,
            model_name=args.model,
            out=out,
            keep_in=keep_in,
        )
    except Exception as error:
        return _fail(error, debug=args.debug, err=err)
    finally:
        for close in owned:
            close()

    print(render_observation(observation, workload, saved), file=out, end="")
    return 0


def benchmark_main(
    argv: Sequence[str] | None = None,
    *,
    camera: Camera | None = None,
    foundry: FoundryLocal | None = None,
    clock: Clock | None = None,
    out: TextIO | None = None,
    err: TextIO | None = None,
) -> int:
    """Run ``benchmark``. Several Variants, N Benchmark Runs each over one Workload."""
    args = _benchmark_parser().parse_args(argv)
    out, err = _streams(out, err)
    variants = args.variants if args.variants else DEFAULT_VARIANTS

    owned: list[Callable[[], None]] = []
    try:
        _refuse_a_live_camera(args)
        require_a_benchmark_run(args.repetitions)
        if camera is None:
            camera = _benchmark_source(args.image)
        foundry = _resolve_foundry(foundry, owned)
        clock = _resolve_clock(clock)

        # Read once, and reuse these exact bytes: re-reading the file per repetition would
        # re-encode it, and a Workload is the Frame's bytes rather than its resolution.
        workload = Workload(prompt=PROMPT, frame=camera.capture())
        benchmark = measure(
            foundry=foundry,
            clock=clock,
            variants=variants,
            workload=workload,
            repetitions=args.repetitions,
            out=out,
        )
    except Exception as error:
        return _fail(error, debug=args.debug, err=err)
    finally:
        for close in owned:
            close()

    print(render_benchmark(benchmark), file=out, end="")
    return 0


def _observe_parser() -> argparse.ArgumentParser:
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
    _add_pinned_variant(parser)
    _add_debug(parser)
    return parser


def _benchmark_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="benchmark",
        description=(
            "Run the same Workload against several Variants, several times each,"
            " and print what each one cost."
        ),
    )
    source = parser.add_mutually_exclusive_group()
    source.add_argument(
        "--image",
        type=Path,
        help=(
            "measure this image file instead of the reference Frame"
            f" ({REFERENCE_FRAME.name}, kept in the repository)"
        ),
    )
    # Offered only so that an Operator arriving from `observe` is told why it cannot be
    # used, rather than finding the flag missing and guessing.
    source.add_argument(
        "--camera",
        type=int,
        default=None,
        metavar="N",
        help="refused: a Feed gives a different Frame each repetition, which is not a Workload",
    )
    parser.add_argument(
        "--repetitions",
        type=int,
        default=REPETITIONS,
        metavar="N",
        help=(
            "how many Benchmark Runs to take against each Variant"
            f" (default: {REPETITIONS}; the first is reported apart from the rest)"
        ),
    )
    _add_variants(parser)
    _add_debug(parser)
    return parser


def _add_variants(parser: argparse.ArgumentParser) -> None:
    """The Variants to measure, replacing the default pair rather than adding to it.

    Repeatable, and repeating it is the whole point: naming two Variants of two different
    aliases compares two model sizes on fixed hardware, and naming an NPU one compares an
    Execution Provider this catalogue does not offer yet — neither needing a change here.
    Replacing rather than extending is what makes that possible: a flag that only added to
    the default pair could never measure anything without the CUDA-GPU Variant in it.
    """
    parser.add_argument(
        "--variant",
        metavar="ID",
        dest="variants",
        action="append",
        help=(
            "measure this Variant instead of the default pair, and repeat the flag to"
            " measure several — an alias (qwen3-vl-2b-instruct), a variant name, whose"
            " version the catalogue picks (qwen3-vl-2b-instruct-generic-cpu), or a variant"
            " id, which pins the version too (qwen3-vl-2b-instruct-generic-cpu:2)."
            f" Default: {', '.join(DEFAULT_VARIANTS)}"
        ),
    )


def _add_pinned_variant(parser: argparse.ArgumentParser) -> None:
    """The single Variant ``observe`` runs against. ``benchmark`` takes a list instead."""
    parser.add_argument(
        "--variant",
        metavar="ID",
        dest="model",
        default=DEFAULT_ALIAS,
        help=(
            "pin the model variant, and with it the Execution Provider the work runs on"
            " — a variant name, whose version the catalogue picks"
            " (qwen3-vl-2b-instruct-generic-cpu), or a variant id, which pins the version"
            f" too (…-generic-cpu:2). Default: resolve the alias {DEFAULT_ALIAS},"
            " letting Foundry Local pick the hardware"
        ),
    )


def _add_debug(parser: argparse.ArgumentParser) -> None:
    parser.add_argument(
        "--debug",
        action="store_true",
        help="re-raise failures with their full traceback",
    )


def _refuse_a_live_camera(args: argparse.Namespace) -> None:
    """A Feed is not a Workload's Frame source, and saying so is better than dropping it.

    Every Benchmark Run has to see the same bytes (CONTEXT.md, "Workload"), and a Feed
    gives a different Frame each time — so the numbers would look like a hardware result
    while comparing different work.
    """
    if args.camera is None:
        return
    raise VisionError(
        f"camera {args.camera} cannot be a Benchmark's Frame source — every Benchmark Run"
        " has to see the same bytes, and a Feed gives a different Frame each time; measure"
        " the reference Frame by leaving --camera off, or pass --image <path>"
    )


def _benchmark_source(image: Path | None) -> Camera:
    """The image file named, or the reference Frame — which is only in a source checkout.

    Falling through to "there is no image at <path>" would point an Operator at a flag
    they never passed, so the reference Frame's own absence gets its own message.
    """
    if image is not None:
        return ImageFileCamera(image)
    if not REFERENCE_FRAME.exists():
        raise VisionError(
            f"the reference Frame is not at {REFERENCE_FRAME} — it is kept in the"
            " repository and found relative to the installed package, so it is only there"
            " when the project is installed from a source checkout (which is what"
            " `uv run` gives you); pass --image <path> to measure a Frame of your own"
        )
    return ImageFileCamera(REFERENCE_FRAME)


def _streams(out: TextIO | None, err: TextIO | None) -> tuple[TextIO, TextIO]:
    return (out if out is not None else sys.stdout, err if err is not None else sys.stderr)


def _resolve_foundry(foundry: FoundryLocal | None, owned: list[Callable[[], None]]) -> FoundryLocal:
    """The real Foundry Local when none was injected, with its close registered."""
    if foundry is not None:
        return foundry

    from vision.inference import InProcessFoundryLocal

    real = InProcessFoundryLocal()
    owned.append(real.close)
    return real


def _resolve_clock(clock: Clock | None) -> Clock:
    if clock is not None:
        return clock

    from time import perf_counter

    return perf_counter


def _fail(error: Exception, *, debug: bool, err: TextIO) -> int:
    if debug:
        raise error
    print(f"error: {_one_line(error)}", file=err)
    return 1


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


def _observe(
    *,
    camera: Camera,
    foundry: FoundryLocal,
    clock: Clock,
    model_name: str,
    out: TextIO,
    keep_in: Path | None,
) -> tuple[Workload, Observation, Path | None]:
    # Accepted before the Execution Providers are registered, and so before anything at
    # all is downloaded: a first run fetches the providers too, and waiting for those to
    # be told the model was never a vision-language model is the failure the refusal
    # exists to prevent.
    model = accept_variant(foundry, model_name)
    providers = register_execution_providers(foundry, clock=clock, out=out)
    ready = bring_up(model, clock=clock, out=out)

    frame, capture = timed(clock, camera.capture)
    # Kept before inference runs: a Frame worth explaining is worth keeping even when the
    # Observation that would have prompted the question never arrives.
    saved = save_frame(frame, keep_in) if keep_in is not None else None
    workload = Workload(prompt=PROMPT, frame=frame)
    raw, inference = timed(clock, lambda: ready.model.observe(workload))

    observation = Observation(
        text=raw.text,
        model=ready.identity,
        finish_reason=raw.finish_reason,
        timings=Timings(providers=providers, load=ready.load, capture=capture, inference=inference),
    )
    return workload, observation, saved


def _one_line(error: Exception) -> str:
    if isinstance(error, VisionError):
        return str(error)
    return f"{type(error).__name__}: {error} — rerun with --debug for the full traceback"
