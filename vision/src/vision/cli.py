"""The three console entry points: ``observe``, ``benchmark`` and ``watch``.

Each one composes capture, inference and reporting and owns nothing else. The camera,
Foundry, the clock and — for a Watch — the sleep arrive as ports rather than being
constructed here, which is what lets the tests drive any of the three end to end with
fakes.

``observe`` answers *what do you see?* — one Frame, one Observation, and what each stage
cost. The latency is not one number: registering the Execution Providers is machine set-up
rather than part of any Observation; loading the model, preparing the Frame and running
inference are three further costs of wildly different magnitude, and only the last is the
latency of the Observation. Nothing is warmed up: the first run is the honest run.

``benchmark`` answers *what does it cost?* — the same Workload against several Variants,
several times each, printed as a table apiece and then written down — a sitting that took
minutes should outlive the terminal it scrolled past in. Where ``observe`` will take a Frame
from the live camera, ``benchmark`` refuses one: a different Frame per repetition is not a
Workload.

``watch`` answers *what does it feel like?* — Observations over a held Feed at a Cadence,
one after another, until the Operator stops it. It is a third entry point rather than a
flag on ``observe`` because a command that sometimes returns and sometimes does not is two
commands, and because the flags a Watch carries mean nothing for a single shot. What the
two share is the model bring-up, not the command. Nothing a Watch produces is a Benchmark:
every Observation runs against a different Frame, so there is nothing to compare.
"""

from __future__ import annotations

import argparse
import sys
from collections.abc import Callable, Sequence
from contextlib import ExitStack
from pathlib import Path
from typing import TextIO

from vision.benchmark import REPETITIONS, Benchmark, measure, require_a_benchmark_run
from vision.capture import (
    FRAMES_DIRECTORY,
    REFERENCE_FRAME,
    Camera,
    HeldFeed,
    ImageFileCamera,
    LiveCamera,
    MakeReader,
    OpenFeed,
    camera_provenance,
    drain_in_background,
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
from vision.record import Now, Recorded, benchmarks_directory, hardware_profile, record
from vision.reporting import (
    render_benchmark,
    render_observation,
    render_recorded,
    render_watch_header,
    render_watch_observation,
    render_watch_summary,
)
from vision.startup import (
    Clock,
    Sleep,
    accept_variant,
    bring_up,
    register_execution_providers,
    timed,
)
from vision.watch import (
    CADENCE,
    WatchedObservation,
    WatchStart,
    refuse_an_image_file,
    require_a_cadence,
    require_an_observation,
    watch,
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
    now: Now | None = None,
    out: TextIO | None = None,
    err: TextIO | None = None,
    benchmarks_dir: Path | None = None,
) -> int:
    """Run ``benchmark``. Several Variants, N Benchmark Runs each over one Workload."""
    args = _benchmark_parser().parse_args(argv)
    out, err = _streams(out, err)
    variants = args.variants if args.variants else DEFAULT_VARIANTS
    if benchmarks_dir is None:
        benchmarks_dir = benchmarks_directory()

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

    # Printed before the Benchmark is written down, and deliberately: a directory that
    # cannot be written to should cost an Operator a file, never the minutes of numbers
    # already in hand.
    print(render_benchmark(benchmark), file=out, end="")
    try:
        recorded = _record_benchmark(
            benchmark,
            declared=args.hardware,
            now=_resolve_now(now),
            directory=benchmarks_dir,
        )
    except Exception as error:
        return _fail(error, debug=args.debug, err=err)

    if recorded is not None:
        print(render_recorded(record=recorded.json, document=recorded.markdown), file=out, end="")
    return _benchmark_status(benchmark, err=err)


def watch_main(
    argv: Sequence[str] | None = None,
    *,
    open_feed: OpenFeed | None = None,
    make_reader: MakeReader | None = None,
    foundry: FoundryLocal | None = None,
    clock: Clock | None = None,
    sleep: Sleep | None = None,
    out: TextIO | None = None,
    err: TextIO | None = None,
    frames_dir: Path | None = None,
) -> int:
    """Run ``watch``. One Feed, one Variant, Observations at the Cadence until it is stopped.

    The Feed and the model are brought up before the first Observation and taken back down
    once the Watch is over, in that order, however it ended — an interruption included.

    An interruption that arrives before the Watch has begun is a different thing: it still
    releases the camera and unloads the model, but it ends the process rather than a Watch,
    because there is no Watch yet to report. Everything else in the run-up ends the process
    as it does in ``observe`` — a name that names no model, a task that is not
    ``vision-language-chat``, a Variant that will not load. There is nothing to degrade to.

    The summary is printed after the camera has been released and the model unloaded, so
    that the last thing an Operator reads is not written while the machine is still held.
    """
    args = _watch_parser().parse_args(argv)
    out, err = _streams(out, err)

    if open_feed is None:
        open_feed = open_camera_feed
    if make_reader is None:
        make_reader = drain_in_background
    if frames_dir is None:
        frames_dir = FRAMES_DIRECTORY

    owned: list[Callable[[], None]] = []
    try:
        # Refused before Foundry Local is started: an Operator who pointed a Watch at a file
        # should be told so immediately, not once the model is on the hardware.
        refuse_an_image_file(args.image)
        require_a_cadence(args.every)
        require_an_observation(args.count)
        foundry = _resolve_foundry(foundry, owned)
        clock = _resolve_clock(clock)
        sleep = _resolve_sleep(sleep)

        model = accept_variant(foundry, args.model)
        providers = register_execution_providers(foundry, clock=clock, out=out)

        # An ExitStack rather than the list of closers the other commands keep, because
        # here the order matters and it is the reverse of the order things were acquired
        # in: the reader comes off the Feed and the camera is released, then the model is
        # taken off the hardware, and only then is Foundry Local itself closed.
        with ExitStack() as lifetime:
            ready = bring_up(model, clock=clock, out=out)
            lifetime.callback(ready.model.unload)
            feed = lifetime.enter_context(_live_feed(args.camera, open_feed, make_reader))

            start = WatchStart(
                model=ready.identity,
                provenance=camera_provenance(args.camera),
                cadence=args.every,
                providers=providers,
                load=ready.load,
                settling_discards=feed.settling_discards,
            )
            print(render_watch_header(start), file=out, end="", flush=True)
            watched = watch(
                start=start,
                model=ready.model,
                feed=feed,
                count=args.count,
                clock=clock,
                sleep=sleep,
                keep_in=frames_dir if args.keep_frames else None,
                announce=_announcing(out),
            )
    except Exception as error:
        return _fail(error, debug=args.debug, err=err)
    finally:
        for close in owned:
            close()

    print(render_watch_summary(watched), file=out, end="")
    return 0


def _announcing(out: TextIO) -> Callable[[WatchedObservation], None]:
    """Write each Observation down as it arrives, flushed so an audience sees it arrive."""

    def announce(observed: WatchedObservation) -> None:
        print(render_watch_observation(observed), file=out, end="", flush=True)

    return announce


def _live_feed(index: int, open_feed: OpenFeed, make_reader: MakeReader) -> HeldFeed:
    """Open and settle the Feed a Watch runs on, or say there is no camera there.

    Its own message rather than ``LiveCamera``'s: that one offers ``--image`` as the way
    out, and a Watch has no such way out — a Watch over a file is refused, so what is worth
    saying here is which other command answers that question instead.
    """
    held = HeldFeed.open(index, open_feed, make_reader=make_reader)
    if held is None:
        raise VisionError(
            f"there is no camera at index {index} — attach one, or select another with"
            " --camera N; a Watch has to have a live Feed, so to look at an image file"
            " instead run `observe --image <path>`"
        )
    return held


def _record_benchmark(
    benchmark: Benchmark,
    *,
    declared: str | None,
    now: Now,
    directory: Path,
) -> Recorded | None:
    """Write the Benchmark down, unless there was no Benchmark to write down.

    A sitting in which every Variant failed to load is reported in full on screen — with
    nothing measured, the reasons are the whole answer — but a Benchmark of only Unmeasured
    Variants has nothing to report (CONTEXT.md, "Benchmark"), and keeping it would put a
    file with no numbers in it beside the ones an Operator compares machines with.
    """
    if not benchmark.measured:
        return None
    try:
        return record(
            benchmark,
            profile=hardware_profile(declared),
            at=now(),
            directory=directory,
        )
    except OSError as error:
        raise VisionError(
            f"the Benchmark was measured but could not be written to {directory} —"
            f" its numbers are in the report above, and nothing else was lost. {error}"
        ) from error


def _benchmark_status(benchmark: Benchmark, *, err: TextIO) -> int:
    """Zero for a Benchmark that measured something, whether or not it measured everything.

    A partially successful Benchmark is a result: a Variant that will not load on this
    machine is reported as the row it is, and reporting the whole sitting to the shell as a
    failure would have a script throw away the numbers that did survive. Only a Benchmark in
    which nothing at all could be measured is a failure — and the reasons are still printed,
    because with no numbers to report they are the entire answer.
    """
    if benchmark.measured:
        return 0
    return _refuse(
        "no Variant could be measured — every one of them is reported above with"
        " the reason it was not",
        err=err,
    )


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
    _add_keep_frames(parser)
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
    parser.add_argument(
        "--hardware",
        metavar="TEXT",
        default=None,
        help=(
            "describe the machine these numbers were taken on, in words"
            ' ("RTX 4090 + i7-13700KF") — it names the persisted record and is what a'
            " reader six months from now has to go on. Default: what the standard library"
            " reports about this machine, which tells two machines apart and no more"
        ),
    )
    _add_variants(parser)
    _add_debug(parser)
    return parser


def _watch_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="watch",
        description=(
            "Keep asking the local model what it sees through the camera, at a Cadence"
            " you choose, until you stop it."
        ),
    )
    parser.add_argument(
        "--every",
        type=float,
        default=CADENCE,
        metavar="SECONDS",
        help=(
            "the Cadence: how often to ask for an Observation, measured on a fixed grid"
            " from the moment the Watch starts rather than as a pause after each one"
            f" (default: {CADENCE:g}; 0 asks for them as fast as the model allows)"
        ),
    )
    parser.add_argument(
        "--count",
        type=int,
        default=None,
        metavar="N",
        help="end the Watch after N Observations (default: run until you interrupt it)",
    )
    parser.add_argument(
        "--camera",
        type=int,
        default=0,
        metavar="N",
        help="index of the camera to open the Feed on (default: 0)",
    )
    # Offered only so that an Operator arriving from `observe` is told why a Watch cannot
    # take one, rather than finding the flag missing and guessing.
    parser.add_argument(
        "--image",
        type=Path,
        default=None,
        help="refused: a Watch observes a live Feed, and one file would never change",
    )
    _add_pinned_variant(parser)
    _add_keep_frames(parser)
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


def _add_keep_frames(parser: argparse.ArgumentParser) -> None:
    """Opting in to keeping the Frame, which is not the same choice as --debug.

    Kept apart deliberately: an Operator who wants a surprising Observation to stay
    explainable afterwards should not have to accept a stack trace in front of an
    audience to get it — and the Observation worth explaining is precisely the one that
    did not raise.
    """
    parser.add_argument(
        "--keep-frames",
        action="store_true",
        help=(
            "write the observed camera Frame to disk and report the path, so that a"
            " surprising Observation can still be explained after the process is gone"
            " (default: nothing is written; a Frame that came from an image file is already"
            " on disk and is never written out)"
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


def _resolve_sleep(sleep: Sleep | None) -> Sleep:
    if sleep is not None:
        return sleep

    from time import sleep as real_sleep

    return real_sleep


def _resolve_now(now: Now | None) -> Now:
    """The wall clock, which is a different port from the one the latencies are taken with.

    ``perf_counter`` is monotonic and says nothing about what day it is; a record names the
    instant it was taken at, and it is a local instant carrying its offset — an Operator
    recognises the afternoon they ran it, and a reader elsewhere can still place it.
    """
    if now is not None:
        return now

    from datetime import datetime

    return lambda: datetime.now().astimezone()


def _fail(error: Exception, *, debug: bool, err: TextIO) -> int:
    if debug:
        raise error
    return _refuse(_one_line(error), err=err)


def _refuse(message: str, *, err: TextIO) -> int:
    """Say why the command is failing, in the one shape every failure is written in.

    Both callers go through here so that the ``error:`` prefix is written down once: a
    command whose failures announce themselves two different ways is one an Operator cannot
    grep, and the exit status belongs with the line that explains it.
    """
    print(f"error: {message}", file=err)
    return 1


def _source(
    args: argparse.Namespace, open_feed: OpenFeed, frames_dir: Path
) -> tuple[Camera, Path | None]:
    """Where the Frame comes from, and where — if anywhere — it has to be kept.

    One decision rather than two: a Frame from an image file is already on disk, so it is
    the same fact that says which Camera to build and that only the camera's Frame could
    need writing out. Whether it is then kept is the Operator's own choice, made with
    ``--keep-frames`` and defaulting to keeping nothing.
    """
    if args.image is not None:
        return ImageFileCamera(args.image), None
    return LiveCamera(args.camera, open_feed), (frames_dir if args.keep_frames else None)


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
