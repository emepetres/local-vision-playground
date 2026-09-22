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

from vision.benchmark import (
    REPETITIONS,
    Benchmark,
    measure,
    refuse_a_live_camera,
    require_a_benchmark_run,
)
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
from vision.errors import VisionError, one_line
from vision.inference import (
    DEFAULT_ALIAS,
    DEFAULT_VARIANTS,
    PROMPT,
    STRUCTURED_PROMPT,
    Observation,
    StructuredObservation,
    Timings,
    Workload,
    require_a_scene_question,
)
from vision.record import Now, Recorded, benchmarks_directory, record, resolve_machine
from vision.reporting import (
    render_benchmark,
    render_observation,
    render_recorded,
    render_structured_observation,
    render_watch_header,
    render_watch_line,
    render_watch_summary,
)
from vision.router import Router
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
    Announce,
    Produced,
    Questions,
    Watch,
    WatchStart,
    keep_watch,
    refuse_an_image_file,
    require_a_cadence,
    require_an_observation,
)


def main(
    argv: Sequence[str] | None = None,
    *,
    camera: Camera | None = None,
    open_feed: OpenFeed | None = None,
    router: Router | None = None,
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
        # Asked before Foundry Local is started, as a Watch asks its own invariants; the
        # normalised question it hands back is what the model is asked, so --ask and a typed
        # line stand for one question and not two. Not asked at all in structured mode: the
        # request is the fixed shape, so --structured overrides --ask and an empty --ask
        # beside it is not the mistake it is on its own.
        question = None if args.structured else require_a_scene_question(args.ask)
        default_camera, keep_in = _source(args, open_feed, frames_dir)
        if camera is None:
            camera = default_camera
        router = _resolve_router(router, owned)
        clock = _resolve_clock(clock)

        workload, observation, saved = _observe(
            camera=camera,
            router=router,
            clock=clock,
            model_name=args.model,
            question=question,
            out=out,
            keep_in=keep_in,
        )
    except Exception as error:
        return _fail(error, debug=args.debug, err=err)
    finally:
        for close in owned:
            close()

    if isinstance(observation, StructuredObservation):
        print(render_structured_observation(observation, workload, saved), file=out, end="")
    else:
        print(render_observation(observation, workload, saved), file=out, end="")
    return 0


def benchmark_main(
    argv: Sequence[str] | None = None,
    *,
    camera: Camera | None = None,
    router: Router | None = None,
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
        refuse_a_live_camera(args.camera)
        require_a_benchmark_run(args.repetitions)
        # Asked here for the reason ``observe`` asks it before its own model load, with one
        # more behind it: a Benchmark that took the mistake to the hardware would download
        # and load every Variant before saying anything. Not asked at all in structured
        # mode: the request is the fixed shape, so --structured overrides --ask and an empty
        # --ask beside it is not the mistake it is on its own — the same rule ``observe`` keeps.
        prompt = STRUCTURED_PROMPT if args.structured else require_a_scene_question(args.ask)
        if camera is None:
            camera = _benchmark_source(args.image)
        router = _resolve_router(router, owned)
        clock = _resolve_clock(clock)

        # Read once, and reuse these exact bytes: re-reading the file per repetition would
        # re-encode it, and a Workload is the Frame's bytes rather than its resolution.
        # The prompt joins them here and nowhere else, so one Workload stands over the whole
        # sitting; what that costs and what it buys is in ``_add_ask``. The fixed shape is a
        # prompt like any other, which is what keeps two structured runs comparable only when
        # they share it, as they must share the Frame and the limits (ADR-0011).
        workload = Workload(prompt=prompt, frame=camera.capture())
        benchmark = measure(
            router=router,
            clock=clock,
            variants=variants,
            workload=workload,
            repetitions=args.repetitions,
            out=out,
            structured=args.structured,
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
    router: Router | None = None,
    clock: Clock | None = None,
    sleep: Sleep | None = None,
    questions: Questions | None = None,
    stdin: TextIO | None = None,
    out: TextIO | None = None,
    err: TextIO | None = None,
    frames_dir: Path | None = None,
) -> int:
    """Run ``watch``. One Feed, one Variant, Observations at the Cadence until it is stopped.

    The Feed and the model are brought up before the first Observation and taken back down
    once the Watch is over, in that order, however it ended — an interruption included.

    An interruption that arrives before the Watch has begun is a different thing: it still
    releases the camera and unloads the model, but there is no Watch yet to report, so it
    is said as its own line and exits non-zero — the ordinary answer for a Watch that
    produced no Observation. One that arrives during the take-down of a Watch that ran is
    not that: the Observations were produced, so it is reported as the Watch it was.
    Neither is ever a traceback: an Operator who pressed Ctrl+C in front of an audience
    knows what happened, and there is nothing ``--debug`` could add.
    Everything else in the run-up ends the process as it does in ``observe`` — a name that
    names no model, a task that is not ``vision-language-chat``, a Variant that will not
    load. There is nothing to degrade to.

    Where the Operator's questions are read from is a port like the rest: the keyboard
    where ``stdin`` is a terminal, and nobody where it is not — a Watch in a pipe or in CI
    runs on what ``--ask`` gave it for as long as it lasts (ADR-0009). It is stopped
    whichever way the run ended — the Watch itself, a Variant that would not load, an
    interruption in the run-up — because there is nothing left for a question to steer in
    any of them.

    The summary is printed after the camera has been released and the model unloaded, so
    that the last thing an Operator reads is not written while the machine is still held.
    It is printed however the Watch ended, a Feed that died included: what the run produced
    is not the failure's to take away.
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
    watched: Watch | None = None
    try:
        # Refused before Foundry Local is started: an Operator who pointed a Watch at a file
        # should be told so immediately, not once the model is on the hardware.
        refuse_an_image_file(args.image)
        require_a_cadence(args.every)
        require_an_observation(args.count)
        # Asked here with the other invariants of a Watch, and for the sharper version of
        # the reason ``observe`` asks it early: a Watch that took the mistake to the
        # hardware would settle a camera and load the model before saying the question
        # the whole run was to stand on was never there. Not asked at all in structured
        # mode: the request is the fixed shape, so --structured overrides --ask and an empty
        # --ask beside it is not the mistake it is on its own — the same rule observe and
        # benchmark keep. The Watch still reads a composed question while structured is on,
        # but the fixed shape overrides it, so it steers nothing (issue #32).
        question = STRUCTURED_PROMPT if args.structured else require_a_scene_question(args.ask)
        router = _resolve_router(router, owned)
        clock = _resolve_clock(clock)
        sleep = _resolve_sleep(sleep)

        model = accept_variant(router, args.model)
        providers = register_execution_providers(router, clock=clock, out=out)
        # Named before the Feed is opened because both endings are about it: the camera
        # that was never there, and the one that stopped answering half way through.
        provenance = camera_provenance(args.camera)

        # An ExitStack rather than the list of closers the other commands keep, because
        # here the order matters and it is the reverse of the order things were acquired
        # in: the reader comes off the Feed and the camera is released, then the model is
        # taken off the hardware, and only then is Foundry Local itself closed.
        with ExitStack() as lifetime:
            # Registered before anything is brought up, so that the paths this stack exists
            # for — a Variant that will not load, a camera that is not there, Ctrl+C during
            # either — take the reader of the Operator's keystrokes down with them rather
            # than leaving one reading a keyboard nobody is watching the output of.
            questions = _resolve_questions(questions, stdin, out)
            lifetime.callback(questions.stop)
            ready = bring_up(model, clock=clock, out=out)
            lifetime.callback(ready.model.unload)
            # Timed here rather than inside the held Feed, because what an Operator waits
            # through is opening the camera *and* settling it, and only this side of the
            # port knows the clock the rest of the run-up was timed with.
            opened, settling = timed(clock, lambda: _live_feed(args.camera, open_feed, make_reader))
            feed = lifetime.enter_context(opened)

            start = WatchStart(
                model=ready.identity,
                provenance=provenance,
                cadence=args.every,
                question=question,
                providers=providers,
                load=ready.load,
                settling=settling,
                settling_discards=feed.settling_discards,
            )
            print(render_watch_header(start), file=out, end="", flush=True)
            watched = keep_watch(
                start=start,
                model=ready.model,
                feed=feed,
                count=args.count,
                clock=clock,
                sleep=sleep,
                keep_in=frames_dir if args.keep_frames else None,
                announce=_announcing(out),
                questions=questions,
                structured=args.structured,
            )
    except KeyboardInterrupt:
        # Caught rather than raised, and then asked which interruption it was: the Watch
        # itself already treats Ctrl+C as its ordinary ending, so one arriving here came
        # either from the run-up or from the take-down of a Watch that had finished. The
        # second is not that Watch failing — it produced what it produced, and the summary
        # is still owed — so it falls through to it below.
        pass
    except Exception as error:
        return _fail(error, debug=args.debug, err=err)
    finally:
        for close in owned:
            close()

    if watched is None:
        # No traceback and no --debug offer: an Operator who pressed Ctrl+C knows what
        # happened, and a stack ending a demo is exactly what --debug exists to keep off
        # the screen. Non-zero because no Observation was produced, which is the one
        # question the exit status of a Watch answers.
        return _refuse("the Watch was stopped before it produced an Observation", err=err)

    print(render_watch_summary(watched), file=out, end="")
    return _watch_status(watched, provenance=provenance, err=err)


def _watch_status(watched: Watch, *, provenance: str, err: TextIO) -> int:
    """Zero for a Watch that produced something over a Feed that survived it.

    A demo and a failure have to be tellable apart by a script, and the line between them
    is not how many things went wrong: a Watch that failed an inference and then went on
    to describe the room did what it was run for. What it is not is a Watch that produced
    no Observation at all — there is nothing to have watched — or one whose Feed was taken
    away, which produced whatever it produced and then stopped being able to.

    The dead Feed is reported ahead of the empty Watch where both are true, because it is
    the reason there was nothing: two lines would have an Operator looking for two faults.
    """
    if watched.feed_died:
        return _refuse(_feed_died(provenance), err=err)
    if watched.produced_nothing:
        # Two ways to have produced nothing, and an Operator handed the wrong one goes
        # looking for the wrong thing: the reasons are above, or there were never any.
        why = (
            "no Observation succeeded — each one is reported above with the reason it failed"
            if watched.failures
            else "the Watch ended before it produced an Observation"
        )
        return _refuse(why, err=err)
    return 0


def _feed_died(provenance: str) -> str:
    """A Feed that was open and stopped, which is neither of the ways one fails to open.

    The other two are about *opening* a Feed — there is no camera at that index, or there
    is one and another application is holding it — and neither fits a camera that was
    producing Frames a moment ago. An Operator handed one of those would go looking for a
    problem that was not there at start-up, so this says what actually happened and offers
    no flag: there is nothing to pass that would have kept the camera plugged in.
    """
    return (
        f"{provenance} stopped giving Frames — it was unplugged, or another application"
        " took it; a Watch cannot go on without a Feed"
    )


def _announcing(out: TextIO) -> Announce:
    """Write each Cadence down as it arrives, flushed so an audience sees it arrive."""

    def announce(produced: Produced) -> None:
        print(render_watch_line(produced), file=out, end="", flush=True)

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
            machine=resolve_machine(declared),
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
    _add_camera(source)
    _add_ask(parser)
    _add_structured(parser)
    _add_pinned_variant(parser)
    _add_keep_frames(parser)
    _add_debug(parser)
    return parser


def _add_structured(parser: argparse.ArgumentParser) -> None:
    """Ask for the fixed shape instead of prose — the objects present, each with a count.

    It overrides ``--ask`` rather than combining with it: a Structured Observation has no
    free-text Scene Question, the request *is* the shape (CONTEXT.md, "Structured
    Observation"). A model that does not answer in the shape is reported as a "no shape"
    outcome rather than degraded to prose, so what comes back is always either the list or
    the reason there is none (ADR-0011).
    """
    parser.add_argument(
        "--structured",
        action="store_true",
        help=(
            "list the objects present in the Frame — each a name and a count — instead of"
            " describing it in prose. Overrides --ask: the request is the fixed shape, not a"
            " question. Default: describe the Frame in prose"
        ),
    )


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
    # Offered only to be refused; see ``refuse_a_live_camera`` for what it is told.
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
    _add_ask(
        parser,
        what_it_means=(
            " The question is the Workload, so two Benchmarks asked different questions"
            " measured different amounts of generation and are not comparable."
        ),
    )
    _add_structured(parser)
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
        help=(
            "end the Watch after N Cadences, one whose inference failed included"
            " (default: run until you interrupt it)"
        ),
    )
    _add_camera(parser)
    _add_ask(
        parser,
        what_it_means=(
            " Stands from the first Observation onward, so a rehearsed demo starts on the"
            " question it is about rather than on the plain description."
        ),
    )
    # Offered only to be refused; see ``refuse_an_image_file`` for what it is told.
    parser.add_argument(
        "--image",
        type=Path,
        default=None,
        help="refused: a Watch observes a live Feed, and one file would never change",
    )
    _add_structured(parser)
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


def _add_camera(container: argparse._ActionsContainer) -> None:
    """The camera index a Feed is opened on, for the two commands that open one.

    Takes the container rather than the parser because ``observe`` declares it inside a
    mutually exclusive group — a Frame comes from a camera or from a file, never both —
    while a Watch has nothing to be exclusive with: it refuses ``--image`` outright.

    ``benchmark`` declares its own ``--camera`` instead of using this. It is a different
    flag that happens to share a name: offered with no default so that passing it can be
    told apart from not passing it, and answered by a refusal rather than by a Feed.
    """
    container.add_argument(
        "--camera",
        type=int,
        default=0,
        metavar="N",
        help="index of the camera to open the Feed on (default: 0)",
    )


def _add_ask(parser: argparse.ArgumentParser, *, what_it_means: str = "") -> None:
    """The Scene Question, which is the prompt — so the fixed prompt is its default.

    Written as a default rather than as a branch on ``None`` because there is no third
    state: a command either sends the question it was given or sends the one it has always
    sent, and a Workload carries a prompt either way. Leaving the flag off therefore
    reaches the model as exactly the bytes it reached it as before this flag existed,
    which is what keeps a command already on a slide working — and, for ``benchmark``,
    what keeps a new record comparable with the ones already in ``docs/benchmarks/``.

    Shared by the commands that carry a Scene Question, because the question means the
    same thing to each of them. ``what_it_means`` is what asking one means for *that*
    command, where it means more than the one Frame in front of it: a Benchmark measures
    the generation the question asks for, so two Benchmarks asked different questions
    measured different work and are not comparable — which an Operator should be able to
    read where the flag is offered, as they can read the divergence note where the
    latencies are; and a Watch keeps the question standing over every Cadence it reaches
    rather than answering it once.
    """
    parser.add_argument(
        "--ask",
        metavar="QUESTION",
        default=PROMPT,
        help=(
            "ask this about the Frame instead of having it described"
            ' (--ask "is anyone looking at the camera?") — answered from that one Frame'
            f" alone, so there are no follow-ups.{what_it_means} Default: describe the Frame"
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


def _resolve_router(router: Router | None, owned: list[Callable[[], None]]) -> Router:
    """The real router over the real Foundry Local when none was injected.

    A command holds a router over the Runtimes, not a bare Foundry Local (ADR-0013). When
    nothing is injected it is a router over both real Runtimes: Foundry Local, whose close is
    registered so the manager is torn down with the rest, and OpenVINO GenAI, which owns no
    process-wide resource and so has nothing to tear down. OpenVINO is constructed eagerly but
    imports nothing of its own until a Variant it claims is loaded, so a sitting that names no
    OpenVINO Variant pays nothing for it being there.
    """
    if router is not None:
        return router

    from vision.inference import InProcessFoundryLocal
    from vision.openvino_runtime import InProcessOpenVINO

    real = InProcessFoundryLocal()
    owned.append(real.close)
    return Router(real, InProcessOpenVINO())


def _resolve_questions(questions: Questions | None, stdin: TextIO | None, out: TextIO) -> Questions:
    """The keyboard a Watch is steered from, unless a caller handed one in.

    ``stdin`` rather than a caller's stream is the default for the reason the real clock
    and the real sleep are: this is where the machine the command runs on is named, and a
    test names its own. The keyboard is given the Watch's own ``out`` so the prompt it draws
    and the keystrokes it echoes land in the same stream the Observations do. Imported here,
    beside the resolving, as the rest of them are.
    """
    if questions is not None:
        return questions

    from vision.keyboard import read_the_keyboard

    return read_the_keyboard(stdin if stdin is not None else sys.stdin, out)


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
    return _refuse(_fatal_line(error), err=err)


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
    router: Router,
    clock: Clock,
    model_name: str,
    question: str | None,
    out: TextIO,
    keep_in: Path | None,
) -> tuple[Workload, Observation | StructuredObservation, Path | None]:
    # Accepted before the Execution Providers are registered, and so before anything at
    # all is downloaded: a first run fetches the providers too, and waiting for those to
    # be told the model was never a vision-language model is the failure the refusal
    # exists to prevent.
    model = accept_variant(router, model_name)
    providers = register_execution_providers(router, clock=clock, out=out)
    ready = bring_up(model, clock=clock, out=out)

    frame, capture = timed(clock, camera.capture)
    # Kept before inference runs: a Frame worth explaining is worth keeping even when the
    # Observation that would have prompted the question never arrives.
    saved = save_frame(frame, keep_in) if keep_in is not None else None

    # A structured request carries the fixed shape as its prompt rather than a Scene
    # Question; ``question is None`` is how ``main`` signals it asked for one (--structured
    # overrides --ask). The two paths cross the model port through sibling methods, so each
    # returns its own shape and neither type's fields go optional (ADR-0011).
    if question is None:
        workload = Workload(prompt=STRUCTURED_PROMPT, frame=frame)
        raw_structured, inference = timed(clock, lambda: ready.model.observe_structured(workload))
        structured = StructuredObservation(
            shape=raw_structured.shape,
            model=ready.identity,
            finish_reason=raw_structured.finish_reason,
            timings=Timings(
                providers=providers, load=ready.load, capture=capture, inference=inference
            ),
        )
        return workload, structured, saved

    workload = Workload(prompt=question, frame=frame)
    raw, inference = timed(clock, lambda: ready.model.observe(workload))
    observation = Observation(
        text=raw.text,
        model=ready.identity,
        finish_reason=raw.finish_reason,
        timings=Timings(providers=providers, load=ready.load, capture=capture, inference=inference),
    )
    return workload, observation, saved


def _fatal_line(error: Exception) -> str:
    """The failure as the line a command ends on, with the way to get the rest of it.

    Only for a failure that is ending the process: ``--debug`` re-raises what was about to
    be printed here, and a Watch that carried on past a failed Observation has nothing left
    to re-raise — so it says the same line without the offer.
    """
    line = one_line(error)
    if isinstance(error, VisionError):
        return line
    return f"{line} — rerun with --debug for the full traceback"
