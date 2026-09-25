"""End-to-end tests for the ``watch`` command, driven through the ports it is given.

There is no camera here, no model and no wall-clock time. The Cadence is asserted through
what the injected ``Sleep`` was asked to wait for, which is what makes "a fixed grid of
instants" a claim a test can check rather than a sentence in a docstring: a Watch that
paused for the whole Cadence after each Observation would ask to wait for two seconds where
this one asks for the second that is left of them.
"""

from __future__ import annotations

import io
from dataclasses import dataclass
from pathlib import Path

import pytest

from tests.fakes import (
    SETTLING_COLOURS,
    FakeCameras,
    FakeClock,
    FakeFeed,
    FakeFoundry,
    FakeOpenVINO,
    FakeReaders,
    FakeSleep,
    FakeVisionModel,
    HandTurnedReaders,
    TypedQuestions,
    abandons,
    asks,
    colour_of,
    make_identity,
    make_images,
    make_observation,
    make_provenance_identity,
    make_structured_observation,
)
from vision.capture import SETTLING_FRAMES
from vision.cli import watch_main
from vision.inference import (
    PROMPT,
    STRUCTURED_PROMPT,
    FinishReason,
    NoShape,
    ObjectsPresent,
    PresentObject,
    RawObservation,
    Shape,
    Where,
    Workload,
)
from vision.record import Now
from vision.router import Router

SETUP_READINGS = (0.0, 0.5)
"""Registering the Execution Providers: 0.500 s."""

LOAD_READINGS = (10.0, 11.25)
"""Loading the model: 1.250 s."""

SETTLE_READINGS = (20.0, 20.3)
"""Opening the Feed and settling it: 0.300 s, the wait before the first Observation."""

T0 = 100.0
"""The instant the Watch starts, and so the instant its first Observation is due."""

INFERENCE = 1.0
"""What every Observation's inference costs, so that every wait is the Cadence less this."""

CADENCE = 2.0
"""The default Cadence, written down here so a test can assert the wait it implies."""

SETTLED = f"Feed       camera 0, settled in 0.300 s, {SETTLING_FRAMES} Frames discarded\n"
"""The header's Feed line: what the Feed cost to be usable, and what that threw away."""

HEADER = (
    "Model      qwen3-vl-2b-instruct-cuda-gpu:2"
    " (alias qwen3-vl-2b-instruct, GPU / NvTensorRtRtxExecutionProvider)\n"
    "Cadence    one Observation every 2.000 s\n" + SETTLED + "Providers  0.500 s\n"
    "Load       1.250 s\n"
)

TEXTS = ("An empty desk.", "A hand holding a coffee mug.", "The mug, put down again.")
"""One Observation apiece, told apart so that the order they were printed in is assertable."""

STANDING = "is anyone looking at the camera?"
"""A Scene Question a Watch is started on, standing over every Cadence it then reaches."""


def readings(
    observations: int, *, cadence: float = CADENCE, inference: float = INFERENCE
) -> tuple[float, ...]:
    """Every clock reading a Watch of this many Observations makes, in the order it makes them.

    Set-up, the load, the instant the Watch began, and then per Observation the reading
    taken to work out how long is left until its instant — none for the first, which is due
    at once — and the two the inference is timed with.
    """
    values = [*SETUP_READINGS, *LOAD_READINGS, *SETTLE_READINGS, T0]
    for order in range(observations):
        due = T0 + order * cadence
        if order:
            # Now, which is when the Observation before this one finished.
            values.append(T0 + (order - 1) * cadence + inference)
        values += [due, due + inference]
    return tuple(values)


WATCHED_COLOURS = ((200, 40, 40), (40, 200, 40), (40, 40, 200))
"""One colour per Observation, far enough apart that the encoded Frames cannot match."""


def watching_feed(observations: int = len(TEXTS)) -> FakeFeed:
    """A Feed that settles and then has one image for each Observation that is coming."""
    return FakeFeed(make_images([*SETTLING_COLOURS, *WATCHED_COLOURS[:observations]]))


@dataclass
class Run:
    """One invocation of the command, and everything it was driven through."""

    code: int
    out: str
    err: str
    cameras: FakeCameras
    readers: FakeReaders | HandTurnedReaders
    feeds: dict[int, FakeFeed]
    model: FakeVisionModel
    sleep: FakeSleep
    questions: TypedQuestions

    @property
    def feed(self) -> FakeFeed:
        """The one Feed this run was given, which is the one the Watch opened.

        Unpacked rather than indexed, so that a test asking about "the Feed" of a run
        given several — or given none, which is how the missing camera is expressed —
        fails here saying so instead of quietly answering about the first.
        """
        (only,) = self.feeds.values()
        return only


def run(
    argv: list[str],
    *,
    model: FakeVisionModel | None = None,
    feeds: dict[int, FakeFeed] | None = None,
    observations: int = len(TEXTS),
    clock: FakeClock | None = None,
    sleep: FakeSleep | None = None,
    readers: FakeReaders | HandTurnedReaders | None = None,
    questions: TypedQuestions | None = None,
    frames_dir: Path | None = None,
    now: Now | None = None,
) -> Run:
    """One invocation, over a Feed read on demand rather than drained by a thread.

    The reader is a port of the held Feed's (see ``MakeReader``), which is what keeps this
    whole suite free of concurrency: one read, one image, and the Stale Frames a draining
    reader would count are a different question from keeping a Cadence, which is the one
    most of this suite asks. The tests about a Watch that fell behind ask the other one,
    and hand in ``readers`` — a reader that really drains, with the test turning its loop.
    """
    if feeds is None:
        feeds = {0: watching_feed(observations)}
    model = (
        model
        if model is not None
        else FakeVisionModel(make_identity(), [make_observation(text) for text in TEXTS])
    )
    cameras = FakeCameras(feeds)
    readers = readers if readers is not None else FakeReaders()
    sleep = sleep if sleep is not None else FakeSleep()
    questions = questions if questions is not None else TypedQuestions()
    out, err = io.StringIO(), io.StringIO()
    code = watch_main(
        argv,
        open_feed=cameras,
        make_reader=readers,
        router=Router(FakeFoundry.resolving_everything_to(model)),
        clock=clock if clock is not None else FakeClock(readings(observations)),
        sleep=sleep,
        now=now,
        questions=questions,
        out=out,
        err=err,
        frames_dir=frames_dir,
    )
    return Run(
        code, out.getvalue(), err.getvalue(), cameras, readers, feeds, model, sleep, questions
    )


def observation_block(order: int, text: str, extra: str = "") -> str:
    return f"\n#{order}  inference 1.000 s{extra}\n{text}\n"


def test_writes_a_header_then_one_line_and_the_text_per_observation_then_a_summary() -> None:
    result = run(["--count", "3"])

    assert result.code == 0
    assert result.err == ""
    assert result.out == (
        HEADER
        + observation_block(1, TEXTS[0])
        + observation_block(2, TEXTS[1])
        + observation_block(3, TEXTS[2])
        + "\n3 Observations, median inference 1.000 s\n"
    )


def test_asks_for_the_observations_on_a_fixed_grid_rather_than_pausing_after_each() -> None:
    """The Cadence is two seconds and each inference takes one, so one second is left.

    A Watch that paused for the Cadence after each Observation would ask for two, and would
    produce an Observation every three seconds while claiming to produce one every two.
    """
    result = run(["--count", "3"])

    assert result.sleep.waits == [1.0, 1.0]


def test_holds_the_grid_when_one_inference_takes_longer_than_another() -> None:
    """The instants stay where they were: what changes is how much of each is left to wait."""
    slow = FakeClock(
        (
            *SETUP_READINGS,
            *LOAD_READINGS,
            *SETTLE_READINGS,
            T0,
            T0,
            T0 + 1.5,  # the first Observation took 1.500 s of the Cadence
            T0 + 1.5,
            T0 + CADENCE,
            T0 + CADENCE + 0.25,  # the second took 0.250 s of it
            T0 + CADENCE + 0.25,
            T0 + 2 * CADENCE,
            T0 + 2 * CADENCE + 1.0,
        )
    )
    result = run(["--count", "3"], clock=slow)

    assert result.code == 0
    assert result.sleep.waits == [0.5, 1.75]


def test_defaults_to_a_cadence_of_two_seconds_so_no_flags_at_all_is_worth_running() -> None:
    result = run(["--count", "2"])

    assert "Cadence    one Observation every 2.000 s\n" in result.out
    assert result.sleep.waits == [CADENCE - INFERENCE]


def test_every_zero_asks_for_observations_as_fast_as_the_model_allows() -> None:
    result = run(["--count", "3", "--every", "0"], clock=FakeClock(readings(3, cadence=0.0)))

    assert result.code == 0
    assert "Cadence    as fast as the model allows\n" in result.out
    assert result.sleep.waits == []


def test_every_zero_has_no_grid_to_skip_on_however_slow_the_model_is() -> None:
    """No Cadence, no shortfall: an Observation asked for the moment the model is free
    cannot be late for an instant nobody named.
    """
    result = run(
        ["--count", "3", "--every", "0"],
        clock=FakeClock(readings(3, cadence=0.0, inference=60.0)),
    )

    assert result.code == 0
    assert "skipped" not in result.out


def test_a_watch_that_keeps_its_cadence_says_nothing_about_skipping() -> None:
    result = run(["--count", "3"])

    assert "skip" not in result.out
    assert "Stale" not in result.out


OVERRUN_COLOURS = (
    (200, 40, 40),
    (40, 200, 40),
    (40, 40, 200),
    (200, 200, 40),
    (40, 200, 200),
    (200, 40, 200),
    (200, 200, 200),
    (255, 255, 255),
)
"""One colour per image the Feed produces once the Watch is short of its Cadence.

Every one of them survives the JPEG round-trip exactly, which is what lets a test name the
colour it expects rather than allow a tolerance around it — and a tolerance is the last
thing wanted here, where the whole question is *which* image was encoded.
"""

OVERRUN_READS = (1, 3, 4)
"""What arrived between handouts: one, then three while the overrunning inference ran.

Two of those three are Stale Frames — the reader holds only the most recent — so the
Observation that follows the overrun is about the last colour of the three, not the first.

Four before the third handout, and that one is *timely*: a camera yields many more images
than a Watch asks Observations of, so discarding some of them is the ordinary case and not
a shortfall. That is the case worth having in the suite, because it is the one where the
rule about what a timely Observation says can actually be got wrong.
"""

OVERRUN = 5.0
"""What the first inference costs: two and a half Cadences, so two instants are passed."""


def overrun_feed() -> FakeFeed:
    return FakeFeed(make_images([*SETTLING_COLOURS, *OVERRUN_COLOURS]))


def overrun_clock() -> FakeClock:
    """A machine that cannot keep the Cadence on its first Observation and then can.

    The first Observation is due at ``T0`` and takes 5.000 s of a 2.000 s Cadence, so the
    instants at ``T0 + 2`` and ``T0 + 4`` have both passed by the time the model is free.
    The next one is therefore due at ``T0 + 6``, one second away — a Watch that queued the
    passed instants would run the second Observation at once and stay a Cadence behind for
    every Observation after it.
    """
    return FakeClock(
        (
            *SETUP_READINGS,
            *LOAD_READINGS,
            *SETTLE_READINGS,
            T0,
            T0,
            T0 + OVERRUN,
            T0 + OVERRUN,
            T0 + 3 * CADENCE,
            T0 + 3 * CADENCE + INFERENCE,
            T0 + 3 * CADENCE + INFERENCE,
            T0 + 4 * CADENCE,
            T0 + 4 * CADENCE + INFERENCE,
        )
    )


def overrun(
    argv: list[str],
    *,
    frames_dir: Path | None = None,
    questions: TypedQuestions | None = None,
) -> Run:
    """The Watch of three Observations whose first one overran the Cadence by two instants."""
    return run(
        argv,
        feeds={0: overrun_feed()},
        clock=overrun_clock(),
        readers=HandTurnedReaders(OVERRUN_READS),
        questions=questions,
        frames_dir=frames_dir,
    )


def test_a_watch_that_overran_skips_the_passed_instants_and_resumes_on_the_grid() -> None:
    """Five seconds of a two-second Cadence: the next instant is the sixth, not the second.

    A Watch that deferred the instants it passed would ask to wait for nothing at all and
    then be permanently a Cadence behind; this one waits out the second that is left of the
    instant it skipped forward to.
    """
    result = overrun(["--count", "3"])

    assert result.code == 0
    assert result.sleep.waits == [1.0, 1.0]


def test_says_on_the_late_observations_line_what_it_skipped_and_what_it_discarded() -> None:
    result = overrun(["--count", "3"])

    assert result.out == (
        HEADER
        + f"\n#1  inference {OVERRUN:.3f} s\n{TEXTS[0]}\n"
        + observation_block(
            2,
            TEXTS[1],
            extra=(
                ", late — skipped 2 Cadences and discarded 2 Stale Frames to observe the present"
            ),
        )
        + observation_block(3, TEXTS[2])
        + "\n3 Observations, median inference 1.000 s, 2 Cadences skipped\n"
    )


def test_reports_the_stale_frames_apart_from_the_settling_discards() -> None:
    """The same read, two different facts (CONTEXT.md, "Stale Frame") — so two sentences."""
    result = overrun(["--count", "3"])

    header, *blocks = result.out.split("\n\n")
    assert SETTLED in header
    assert "settled" not in "\n\n".join(blocks)
    assert "Stale Frames" not in header


def test_observes_the_most_recent_frame_after_an_overrun_and_not_the_oldest() -> None:
    """The lie ADR-0006 exists to refuse: a confident description of a room already gone."""
    result = overrun(["--count", "3"])

    colours = [colour_of(workload.frame.data) for workload in result.model.observed]
    assert colours == [OVERRUN_COLOURS[0], OVERRUN_COLOURS[3], OVERRUN_COLOURS[7]]


def test_a_timely_observation_that_discarded_stale_frames_reports_neither() -> None:
    """The third Observation is on time and still discarded three images on its way.

    Which is every timely Observation on a real camera: a Feed yields Frames far faster
    than a Watch asks Observations of it, so a Stale Frame on its own is not a shortfall
    and saying so on every line would bury the lines where it is one.
    """
    result = overrun(["--count", "3"])

    lines = [line for line in result.out.splitlines() if line.startswith("#")]
    assert lines[2] == "#3  inference 1.000 s"
    # And it really did discard them: the Frame it observed is the last of the four that
    # arrived, not the first.
    assert colour_of(result.model.observed[2].frame.data) == OVERRUN_COLOURS[7]


def test_the_observations_that_kept_the_cadence_say_nothing_about_being_late() -> None:
    result = overrun(["--count", "3"])

    lines = [line for line in result.out.splitlines() if line.startswith("#")]
    assert "late" not in lines[0]
    assert "late" not in lines[2]


def test_summarises_the_cadences_the_machine_could_not_keep() -> None:
    """The lesson an Operator leaves with: the rate this machine actually sustained."""
    result = overrun(["--count", "3"])

    assert result.out.endswith("\n3 Observations, median inference 1.000 s, 2 Cadences skipped\n")


def test_still_reports_the_skipped_cadences_when_the_watch_ended_inside_the_inference() -> None:
    """An instant is abandoned before the Observation that follows it is asked for.

    So a Watch interrupted during that inference still passed those instants, and a
    summary that only added up the Observations it produced would report the machine as
    having kept a Cadence it was failing at the very moment the Operator gave up on it.
    """
    interrupted = InterruptedModel(make_identity(), [make_observation(TEXTS[0])])
    result = run(
        ["--count", "3"],
        model=interrupted,
        feeds={0: overrun_feed()},
        clock=overrun_clock(),
        readers=HandTurnedReaders(OVERRUN_READS),
    )

    assert result.code == 0
    assert len(interrupted.observed) == 1
    assert result.out.endswith("\n1 Observation, median inference 5.000 s, 2 Cadences skipped\n")


def test_an_instant_arrived_at_exactly_is_not_reported_as_one_more_skipped() -> None:
    """A Cadence no float can hold is still a grid, and a skip is still a real count.

    ``--every 0.1`` puts its instants a fraction of a nanosecond off where the arithmetic
    says they are. An Observation that overran to land exactly on one of them skipped the
    instants before it and no more — a Watch that rounded up would claim a skip that never
    happened and then wait out a whole Cadence for it.
    """
    fine = 0.1
    result = run(
        ["--count", "2", "--every", str(fine)],
        observations=2,
        clock=FakeClock(
            (
                *SETUP_READINGS,
                *LOAD_READINGS,
                *SETTLE_READINGS,
                T0,
                T0,
                T0 + fine * 2,  # the first Observation overran onto the second instant
                T0 + fine * 2,
                T0 + fine * 2,
                T0 + fine * 2 + 0.05,
            )
        ),
    )

    assert result.code == 0
    assert result.sleep.waits == []
    assert ", late — skipped 1 Cadence and discarded 0 Stale Frames" in result.out
    assert result.out.endswith("\n2 Observations, median inference 0.125 s, 1 Cadence skipped\n")


def test_turns_none_of_what_it_lost_into_a_benchmark(benchmarks: Path) -> None:
    """A Watch is not a measurement, and a Watch that fell behind is not one either."""
    overrun(["--count", "3"])

    assert not benchmarks.exists()


def test_keeps_the_observed_frames_after_an_overrun_and_never_a_stale_one(
    tmp_path: Path,
) -> None:
    """Three Observations, five images read: the two nobody observed explain nothing."""
    result = overrun(["--count", "3", "--keep-frames"], frames_dir=tmp_path)

    kept = list(tmp_path.glob("*.jpg"))
    assert len(kept) == 3
    observed = {workload.frame.data for workload in result.model.observed}
    assert {path.read_bytes() for path in kept} == observed


def test_opens_and_settles_the_feed_once_however_many_observations_follow() -> None:
    result = run(["--count", "3"])

    assert result.cameras.opened == [0]
    assert result.feed.reads == SETTLING_FRAMES + 3
    assert len(result.readers.readers) == 1


def test_reports_the_settling_discards_at_start_up_and_on_no_observation() -> None:
    """The same read, a different fact: settling says *the camera was not ready yet*."""
    result = run(["--count", "3"])

    header, *blocks = result.out.split("\n\n")
    assert SETTLED in header
    assert "discarded" not in "\n\n".join(blocks)


def test_selects_the_camera_and_names_it_as_the_other_commands_name_it() -> None:
    result = run(["--count", "1", "--camera", "2"], feeds={2: watching_feed(1)}, observations=1)

    assert result.cameras.opened == [2]
    assert "Feed       camera 2, " in result.out
    (workload,) = result.model.observed
    assert workload.frame.provenance == "camera 2"


def test_summarises_how_many_observations_and_the_inference_the_machine_sustained() -> None:
    result = run(["--count", "3"])

    assert result.out.endswith("\n3 Observations, median inference 1.000 s\n")


def test_counts_one_observation_in_the_singular() -> None:
    result = run(["--count", "1"], observations=1)

    assert result.out.endswith("\n1 Observation, median inference 1.000 s\n")


def test_count_ends_the_watch_closing_the_feed_unloading_the_model_and_exiting_zero() -> None:
    result = run(["--count", "2"])

    assert result.code == 0
    assert len(result.model.observed) == 2
    assert result.feed.closed
    assert result.readers.readers[0].stopped
    assert result.model.unloads == 1
    assert "2 Observations, median inference 1.000 s\n" in result.out


def test_an_interruption_ends_the_watch_the_same_way_and_still_exits_zero() -> None:
    """Ending a demo is not itself an error, and the Observations already produced are the
    point of having run it.
    """
    result = run(["--count", "3"], sleep=FakeSleep(interrupts_on=1))

    assert result.code == 0
    assert result.err == ""
    assert result.out == (
        HEADER + observation_block(1, TEXTS[0]) + "\n1 Observation, median inference 1.000 s\n"
    )
    assert result.feed.closed
    assert result.readers.readers[0].stopped
    assert result.model.unloads == 1


class InterruptedModel(FakeVisionModel):
    """A model the Operator interrupts half way through its second inference."""

    def observe(self, workload: Workload) -> RawObservation:
        if len(self.observed) == 1:
            raise KeyboardInterrupt
        return super().observe(workload)


def test_an_interruption_during_an_inference_ends_the_watch_just_as_cleanly() -> None:
    """Ctrl+C does not wait for a convenient moment, so nor does the way out of a Watch."""
    model = InterruptedModel(make_identity(), [make_observation(TEXTS[0])])
    result = run(["--count", "3"], model=model, observations=2)

    assert result.code == 0
    assert result.err == ""
    assert result.out.endswith("\n1 Observation, median inference 1.000 s\n")
    assert result.feed.closed
    assert result.readers.readers[0].stopped
    assert model.unloads == 1


class InterruptedTeardownModel(FakeVisionModel):
    """A model the Operator interrupts a second time, as the Watch is being taken down."""

    def unload(self) -> None:
        super().unload()
        raise KeyboardInterrupt


def test_an_interruption_during_the_take_down_still_reports_the_watch_that_ran() -> None:
    """A Ctrl+C that lands on the way out is not the Watch failing.

    The Observations were produced and the summary is what an Operator was promised for
    them, so a second interruption arriving while the camera is being released and the
    model taken off the hardware must not turn a Watch that ran into one that never did.
    """
    model = InterruptedTeardownModel(
        make_identity(), [make_observation(text) for text in TEXTS[:2]]
    )
    result = run(["--count", "2"], model=model, observations=2)

    assert result.code == 0
    assert result.err == ""
    assert result.out == (
        HEADER
        + observation_block(1, TEXTS[0])
        + observation_block(2, TEXTS[1])
        + "\n2 Observations, median inference 1.000 s\n"
    )
    assert result.feed.closed
    assert model.unloads == 1


class NeverLoadsModel(FakeVisionModel):
    """A model the Operator interrupts while it is still going onto the hardware."""

    def load(self) -> None:
        raise KeyboardInterrupt


def test_an_interruption_before_the_watch_began_is_said_as_its_own_line() -> None:
    """There is no Watch to report yet, so it is the one ending that has nothing to print."""
    model = NeverLoadsModel(make_identity(), [])
    result = run(["--count", "3"], model=model)

    assert result.code == 1
    assert result.out == ""
    assert result.err == "error: the Watch was stopped before it produced an Observation\n"
    assert model.unloads == 0
    assert result.cameras.opened == []


def test_sends_every_observation_on_its_own_frame_with_the_one_fixed_prompt() -> None:
    result = run(["--count", "3"])

    prompts = {workload.prompt for workload in result.model.observed}
    assert prompts == {"Describe what you see in this image in two or three sentences."}
    frames = [workload.frame.data for workload in result.model.observed]
    assert len(set(frames)) == 3
    # And each one is the image the Feed produced for it, in the order it produced them.
    assert [colour_of(frame) for frame in frames] == list(WATCHED_COLOURS)


def test_asks_the_standing_scene_question_from_the_very_first_observation() -> None:
    """A Watch started on a question is on it at once: there is no first Observation that
    describes the room before the question the Operator meant takes effect."""
    result = run(["--count", "3", "--ask", STANDING])

    assert result.code == 0
    assert [workload.prompt for workload in result.model.observed] == [STANDING] * 3


def test_a_standing_question_moves_nothing_else_about_the_watch() -> None:
    """The one thing --ask replaces is the prompt sent at each Cadence.

    Asserted against the whole output rather than one line, because the claim is that a
    standing question changes nothing an Operator reads: the header, every Observation's
    line and the summary are the ones a Watch without a question writes.
    """
    asked = run(["--count", "3", "--ask", STANDING])
    described = run(["--count", "3"])

    assert asked.code == described.code == 0
    # The two runs really did ask different things — without this the equality below would
    # hold for a --ask that never reached the model at all.
    assert [workload.prompt for workload in asked.model.observed] != [
        workload.prompt for workload in described.model.observed
    ]
    assert asked.out == described.out
    assert asked.sleep.waits == described.sleep.waits


def test_a_watch_that_fell_behind_on_a_standing_question_counts_what_it_lost_as_ever() -> None:
    """The shortfall is about the machine, never about what was being asked of it.

    Driven through the Watch that overran its Cadence by two instants, because that is the
    only place the skipped Cadences and the Stale Frames are anything but zero: a standing
    question must leave both counts, and the lines they are said on, exactly where they
    were (ADR-0006).
    """
    asked = overrun(["--count", "3", "--ask", STANDING])
    described = overrun(["--count", "3"])

    assert asked.code == described.code == 0
    assert all(workload.prompt == STANDING for workload in asked.model.observed)
    assert asked.out == described.out
    assert (
        ", late — skipped 2 Cadences and discarded 2 Stale Frames to observe the present"
    ) in asked.out
    assert asked.out.endswith("\n3 Observations, median inference 1.000 s, 2 Cadences skipped\n")


def test_keeps_the_observed_frames_of_a_watch_on_a_standing_question(tmp_path: Path) -> None:
    """The Frames a Watch keeps are kept regardless of what it was asking about them."""
    result = run(["--count", "3", "--keep-frames", "--ask", STANDING], frames_dir=tmp_path)

    assert result.code == 0
    assert len(list(tmp_path.glob("*.jpg"))) == 3


def test_persists_nothing_it_produced_on_a_standing_question(benchmarks: Path) -> None:
    """A standing question does not make a Watch a measurement: every Observation still
    ran against a different Frame, so there is still nothing comparable to write down."""
    run(["--count", "3", "--ask", STANDING])

    assert not benchmarks.exists()


TYPED = "how many people are in the room?"
"""A Scene Question composed at a Watch that is already running."""

ASKING_TYPED = f"\nAsking: {TYPED}\n"
"""The echo a changed question is announced by, above the first Observation to answer it."""

ASKING_PLAINLY = "\nAsking: for a plain description\n"
"""The echo of the way back: the default prompt named rather than quoted at an audience."""


def test_a_question_composed_mid_watch_applies_from_the_next_observation_and_then_stands() -> None:
    """The Observation in flight is not reached back into, and the next is not a one-off.

    Composed at the first Observation, so it is the plain description the Watch started on
    and every Observation from the second onwards answers the question — which is the whole
    demonstration: the same question asked again as the scene moves (ADR-0010).
    """
    result = run(["--count", "3"], questions=TypedQuestions([asks(TYPED), None, None]))

    assert result.code == 0
    assert [workload.prompt for workload in result.model.observed] == [PROMPT, TYPED, TYPED]


def test_an_abandoned_composition_leaves_the_standing_question_untouched() -> None:
    """Escape is *keep what stood*: the Watch was suspended and resumed, and what it asks is
    exactly what it asked before — no new question, and no echo of one (ADR-0010)."""
    result = run(
        ["--count", "3", "--ask", STANDING],
        questions=TypedQuestions([abandons(), None, None]),
    )

    assert result.code == 0
    assert [workload.prompt for workload in result.model.observed] == [STANDING] * 3
    assert "Asking:" not in result.out


@pytest.mark.parametrize("blank", ["", "   ", "\t"])
def test_an_empty_line_goes_back_to_the_plain_description(blank: str) -> None:
    """Nothing typed is not a question that asks nothing — it is the way back.

    ``--ask ""`` is refused for the opposite reason: there a question was meant and the
    shell ate it, and there is nothing standing to go back from.
    """
    result = run(
        ["--count", "3", "--ask", STANDING],
        questions=TypedQuestions([asks(blank), None, None]),
    )

    assert result.code == 0
    assert [workload.prompt for workload in result.model.observed] == [STANDING, PROMPT, PROMPT]


def test_echoes_each_change_once_above_the_first_answer_to_it_and_never_again() -> None:
    """The echo is the reporting module's, so it lands in the series rather than beside it.

    Asserted against the whole output because the claim is about *where* the sentence goes:
    above the first Observation that answers the question, and not repeated over the ones
    that follow it — a Watch that echoed on every line would bury the answers changing.
    """
    result = run(["--count", "3"], questions=TypedQuestions([asks(TYPED), None, None]))

    assert result.out == (
        HEADER
        + observation_block(1, TEXTS[0])
        + ASKING_TYPED
        + observation_block(2, TEXTS[1])
        + observation_block(3, TEXTS[2])
        + "\n3 Observations, median inference 1.000 s\n"
    )


def test_echoes_the_return_to_plain_description_as_a_change_of_its_own() -> None:
    """A recording of the talk should show every time the Watch changed what it asked."""
    result = run(["--count", "3"], questions=TypedQuestions([asks(TYPED), asks(""), None]))

    assert result.out == (
        HEADER
        + observation_block(1, TEXTS[0])
        + ASKING_TYPED
        + observation_block(2, TEXTS[1])
        + ASKING_PLAINLY
        + observation_block(3, TEXTS[2])
        + "\n3 Observations, median inference 1.000 s\n"
    )


def test_retyping_the_question_already_standing_is_not_a_change_and_is_not_echoed() -> None:
    """An Operator handed the same sentence twice goes looking for the difference.

    Composed once so it stands, then composed again unchanged: the second time is not a
    change, so the question is not echoed a second time and the answers go on unbroken.
    """
    result = run(["--count", "3"], questions=TypedQuestions([asks(TYPED), asks(TYPED), None]))

    assert result.code == 0
    assert result.out.count(ASKING_TYPED) == 1
    assert [workload.prompt for workload in result.model.observed] == [PROMPT, TYPED, TYPED]


def test_echoes_a_change_that_took_effect_at_a_cadence_whose_inference_then_failed() -> None:
    """The question took effect whether or not the model answered, and the Observations
    after it answer something an Operator would otherwise never have been told about — so
    the echo is on the Cadence rather than on the answer.
    """
    broken = FakeVisionModel(
        make_identity(),
        [
            make_observation(TEXTS[0]),
            RuntimeError("the runtime gave up"),
            make_observation(TEXTS[2]),
        ],
    )
    result = run(
        ["--count", "3"], model=broken, questions=TypedQuestions([asks(TYPED), None, None])
    )

    assert result.out == (
        HEADER
        + observation_block(1, TEXTS[0])
        + ASKING_TYPED
        + "\n#2  failed — RuntimeError: the runtime gave up\n"
        + observation_block(3, TEXTS[2])
        + "\n2 Observations, median inference 1.000 s, 1 failed\n"
    )


def test_composing_a_question_is_not_a_fault_of_the_hardware_and_skips_no_cadence() -> None:
    """Suspending a Watch to compose is not the machine falling behind (ADR-0010).

    The Watch is re-anchored to the moment composing ended, so the resumed Observation is
    on time: nothing spent composing is a skipped Cadence or a Stale Frame, no line reads as
    late, and the summary counts no skip. The one thing composing adds to the report is the
    echo of the question it changed to.
    """
    result = run(["--count", "3"], questions=TypedQuestions([asks(TYPED), None, None]))

    assert result.code == 0
    assert [workload.prompt for workload in result.model.observed] == [PROMPT, TYPED, TYPED]
    assert "late" not in result.out
    assert "skipped" not in result.out
    assert result.out.endswith("\n3 Observations, median inference 1.000 s\n")


def test_checks_for_an_interrupt_once_per_observation_rather_than_between_them() -> None:
    """Once an Observation, and after it has been shown: one look at the keyboard per Cadence
    and not one more. A Watch that looked inside the wait would let a question take effect
    from a Frame taken before it was composed — which is the one thing this is placed to
    rule out.
    """
    result = run(["--count", "3"])

    assert result.questions.checks == 3


def test_stops_reading_the_keyboard_when_the_watch_ends() -> None:
    result = run(["--count", "3"])

    assert result.code == 0
    assert result.questions.stopped


def test_stops_reading_the_keyboard_when_there_was_never_a_watch_to_steer() -> None:
    """The run-up is where a Watch fails, and a reader left on a keyboard nobody is
    watching the output of is exactly what the Watch's take-down order exists to prevent.
    """
    result = run(["--count", "1"], feeds={})

    assert result.code == 1
    assert result.questions.stopped
    assert result.model.unloads == 1


def test_stops_reading_the_keyboard_after_an_interruption_too() -> None:
    """Ctrl+C is how a Watch ordinarily ends, so it is the ending this has to survive."""
    result = run(["--count", "3"], sleep=FakeSleep(interrupts_on=1))

    assert result.code == 0
    assert result.questions.stopped
    assert result.feed.closed
    assert result.model.unloads == 1


def test_a_watch_nobody_types_at_runs_exactly_as_it_did_before() -> None:
    """The port is not a behaviour: a Watch given a keyboard nobody touches is the Watch
    that had no keyboard at all.
    """
    result = run(["--count", "3"])

    assert result.out == (
        HEADER
        + observation_block(1, TEXTS[0])
        + observation_block(2, TEXTS[1])
        + observation_block(3, TEXTS[2])
        + "\n3 Observations, median inference 1.000 s\n"
    )
    assert [workload.prompt for workload in result.model.observed] == [PROMPT] * 3


@pytest.mark.parametrize("question", ["", "   ", "\t\n"])
def test_refuses_an_empty_scene_question_before_foundry_local_is_started(question: str) -> None:
    """Refused as the other commands refuse it, and ahead of the camera as well as the
    model: a Watch that took the mistake to the hardware would settle a Feed and load
    several gigabytes of weights before saying the question was never there."""
    result = run(["--count", "1", "--ask", question])

    assert result.code == 1
    assert result.out == ""
    assert result.err == (
        "error: --ask was given no question — pass one in quotes"
        ' (--ask "is anyone looking at the camera?"), or leave --ask off to have the'
        " Frame described\n"
    )
    assert result.cameras.opened == []
    assert not result.model.loaded
    assert result.model.observed == []


def test_fixes_the_generation_limits_on_every_workload_it_sends() -> None:
    result = run(["--count", "2"])

    for workload in result.model.observed:
        assert workload.max_output_tokens == 128
        assert workload.temperature == 0.0


def test_says_when_an_observation_was_cut_short_by_the_output_limit() -> None:
    model = FakeVisionModel(
        make_identity(),
        [
            make_observation("An empty desk and an", FinishReason.TRUNCATED),
            make_observation(TEXTS[1]),
        ],
    )
    result = run(["--count", "2"], model=model, observations=2)

    assert result.out == (
        HEADER
        + observation_block(
            1, "An empty desk and an", extra=", truncated — it hit the 128-token output limit"
        )
        + observation_block(2, TEXTS[1])
        + "\n2 Observations, median inference 1.000 s\n"
    )


def test_pins_a_variant_and_reports_the_one_that_answered() -> None:
    cpu = FakeVisionModel(
        make_identity(
            variant="qwen3-vl-2b-instruct-generic-cpu:2",
            execution_provider="CPUExecutionProvider",
            device_type="CPU",
        ),
        [make_observation(TEXTS[0])],
    )
    result = run(
        ["--count", "1", "--variant", "qwen3-vl-2b-instruct-generic-cpu:2"],
        model=cpu,
        observations=1,
    )

    assert (
        "Model      qwen3-vl-2b-instruct-generic-cpu:2"
        " (alias qwen3-vl-2b-instruct, CPU / CPUExecutionProvider)\n"
    ) in result.out


def test_persists_nothing_it_produced(benchmarks: Path) -> None:
    """A Watch is not a measurement: every Observation ran against a different Frame."""
    run(["--count", "3"])

    assert not benchmarks.exists()


def test_writes_no_frame_unless_it_is_asked_to(tmp_path: Path) -> None:
    result = run(["--count", "3"], frames_dir=tmp_path)

    assert result.code == 0
    assert list(tmp_path.glob("*.jpg")) == []
    assert "saved" not in result.out


def test_keeps_the_observed_frames_and_says_where_each_one_went(tmp_path: Path) -> None:
    """Every observed Frame gets a file of its own, and every file is named in the output.

    Compared as a set rather than in order: two Frames written inside one tick of the
    Windows clock share a stamp, and the ``-1`` that keeps the second from overwriting the
    first sorts ahead of the name it disambiguates.
    """
    result = run(["--count", "3", "--keep-frames"], frames_dir=tmp_path)

    kept = list(tmp_path.glob("*.jpg"))
    assert len(kept) == 3
    observed = {workload.frame.data for workload in result.model.observed}
    assert {path.read_bytes() for path in kept} == observed
    for path in kept:
        assert f", saved {path}\n" in result.out


def test_keeps_no_stale_frame_because_nobody_observed_one(tmp_path: Path) -> None:
    """Only the Frames that were observed are written: a Stale Frame explains nothing."""
    run(["--count", "2", "--keep-frames"], observations=2, frames_dir=tmp_path)

    assert len(list(tmp_path.glob("*.jpg"))) == 2


def test_refuses_an_image_file_and_names_the_command_that_takes_one() -> None:
    result = run(["--image", "desk.jpg"])

    assert result.code == 1
    assert result.out == ""
    assert result.err == (
        "error: a Watch cannot run over desk.jpg — a Watch observes a live Feed, and every"
        " Observation of one file would be about the same bytes; measure a file with"
        " `benchmark --image <path>`, or look at one with `observe --image <path>`\n"
    )


def test_refuses_an_image_file_before_it_opens_a_camera_or_starts_a_model() -> None:
    result = run(["--image", "desk.jpg"])

    assert result.cameras.opened == []
    assert result.model.observed == []
    assert not result.model.loaded


def test_refuses_a_cadence_that_is_not_a_rhythm() -> None:
    result = run(["--every", "-1"])

    assert result.code == 1
    assert result.err == (
        "error: a Cadence of -1 seconds is not a rhythm — pass --every 0 to ask for"
        " Observations as fast as the model allows, or a positive number of seconds\n"
    )


def test_refuses_a_watch_that_would_end_before_producing_anything() -> None:
    result = run(["--count", "0"])

    assert result.code == 1
    assert result.err == (
        "error: a Watch of 0 Observations is not a Watch — ask for at least one with"
        " --count N, or leave --count off to run until you stop it\n"
    )


def test_points_at_observe_when_there_is_no_camera_to_watch() -> None:
    result = run(["--count", "1"], feeds={})

    assert result.code == 1
    assert result.err == (
        "error: there is no camera at index 0 — attach one, or select another with"
        " --camera N; a Watch has to have a live Feed, so to look at an image file"
        " instead run `observe --image <path>`\n"
    )


def test_takes_the_model_off_the_hardware_when_there_was_no_camera_to_watch() -> None:
    result = run(["--count", "1"], feeds={})

    assert result.model.unloads == 1


FEED_DIED = (
    "error: camera 0 stopped giving Frames — it was unplugged, or another application"
    " took it; a Watch cannot go on without a Feed\n"
)
"""What a Feed that died mid-Watch is reported as — and none of it is about opening one."""

NOTHING_PRODUCED = "\nNo Observations — the Watch ended before the model produced one\n"


def dying_feed(observations: int) -> FakeFeed:
    """A Feed that settles, hands out this many images and then stops giving any."""
    return FakeFeed(
        make_images([*SETTLING_COLOURS, *WATCHED_COLOURS[:observations]]),
        stops_after=SETTLING_FRAMES + observations,
    )


def test_ends_the_watch_when_the_feed_stops_giving_frames() -> None:
    result = run(["--count", "3"], feeds={0: dying_feed(0)})

    assert result.code == 1
    assert result.err == FEED_DIED
    assert result.feed.closed
    assert result.readers.readers[0].stopped
    assert result.model.unloads == 1


def test_a_dead_feed_is_not_reported_as_either_of_the_ways_a_feed_fails_to_open() -> None:
    """A Feed that was open and stopped is a third thing, and the words say so.

    The other two are about *opening* one — there is no camera at that index, or there is
    and another application is holding it — and an Operator told either of those about a
    camera that had been producing Frames for a minute would go looking for the wrong
    problem.
    """
    result = run(["--count", "3"], feeds={0: dying_feed(1)})

    assert "there is no camera at index" not in result.err
    assert "opened but gave no Frame" not in result.err
    assert result.err == FEED_DIED


def test_a_watch_ended_by_a_dead_feed_still_reports_what_it_produced() -> None:
    """The Observations are not lost with the Feed that was giving them."""
    result = run(["--count", "3"], feeds={0: dying_feed(2)})

    assert result.code == 1
    assert result.out == (
        HEADER
        + observation_block(1, TEXTS[0])
        + observation_block(2, TEXTS[1])
        + "\n2 Observations, median inference 1.000 s\n"
    )
    assert result.err == FEED_DIED
    assert result.feed.closed
    assert result.readers.readers[0].stopped
    assert result.model.unloads == 1


def test_a_dead_feed_ends_the_watch_rather_than_being_asked_again() -> None:
    """It cannot produce anything again, so there is no next Cadence worth waiting for."""
    result = run(["--count", "3"], feeds={0: dying_feed(1)})

    assert len(result.model.observed) == 1
    assert result.sleep.waits == [CADENCE - INFERENCE]


BROKEN = RuntimeError("the model server went away")
"""A native fault mid-inference — not a VisionError, because Foundry Local raises its own."""

FAILED = "\n#{order}  failed — RuntimeError: the model server went away\n"


def failing_model(*outcomes: str | Exception | RawObservation) -> FakeVisionModel:
    """A model that answers or fails, one outcome per Cadence the Watch reaches."""
    return FakeVisionModel(
        make_identity(),
        [
            make_observation(outcome) if isinstance(outcome, str) else outcome
            for outcome in outcomes
        ],
    )


def failing_readings(*failed: int, cadence: float = CADENCE) -> FakeClock:
    """Every clock reading a Watch of these outcomes makes — a failed inference is one.

    An inference that raises is timed from its start and never reaches the reading that
    would end it, so a Cadence that failed costs one reading where one that produced an
    Observation costs two.
    """
    values = [*SETUP_READINGS, *LOAD_READINGS, *SETTLE_READINGS, T0]
    finished = T0
    for order, broke in enumerate(failed):
        if order:
            values.append(finished)
        due = T0 + order * cadence
        values.append(due)
        finished = due if broke else due + INFERENCE
        if not broke:
            values.append(finished)
    return FakeClock(values)


def test_a_failed_inference_is_one_line_and_the_watch_goes_on_to_the_next_cadence() -> None:
    """A transient fault does not end a demo that was going fine: the next Cadence can
    still produce something, and the Cadence it happened at is the one worth naming.
    """
    result = run(
        ["--count", "3"],
        model=failing_model(TEXTS[0], BROKEN, TEXTS[2]),
        clock=failing_readings(0, 1, 0),
    )

    assert result.code == 0
    assert result.err == ""
    assert result.out == (
        HEADER
        + observation_block(1, TEXTS[0])
        + FAILED.format(order=2)
        + observation_block(3, TEXTS[2])
        + "\n2 Observations, median inference 1.000 s, 1 failed\n"
    )


def test_a_watch_that_carried_on_past_a_failure_still_comes_down_cleanly() -> None:
    """The way out is the same one every other ending takes: reader, camera, model."""
    result = run(
        ["--count", "3"],
        model=failing_model(TEXTS[0], BROKEN, TEXTS[2]),
        clock=failing_readings(0, 1, 0),
    )

    assert result.feed.closed
    assert result.readers.readers[0].stopped
    assert result.model.unloads == 1


def test_a_failed_inference_holds_the_grid_rather_than_shifting_it() -> None:
    """The Cadence a failure happened at is spent, not deferred — the grid does not move."""
    result = run(
        ["--count", "3"],
        model=failing_model(TEXTS[0], BROKEN, TEXTS[2]),
        clock=failing_readings(0, 1, 0),
    )

    assert result.sleep.waits == [CADENCE - INFERENCE, CADENCE]


def test_a_cadence_reached_late_says_what_it_lost_even_when_the_inference_then_failed() -> None:
    """The instants were passed and the Stale Frames discarded before the model was asked.

    So they are as true of this Cadence as of one that produced something, and a Watch that
    reported them only where the model answered would under-report the shortfall exactly
    where the machine was worst (ADR-0006).
    """
    result = run(
        ["--count", "3"],
        model=failing_model(make_observation(TEXTS[0]), BROKEN, TEXTS[2]),
        feeds={0: overrun_feed()},
        readers=HandTurnedReaders(OVERRUN_READS),
        clock=FakeClock(
            (
                *SETUP_READINGS,
                *LOAD_READINGS,
                *SETTLE_READINGS,
                T0,
                T0,
                T0 + OVERRUN,
                T0 + OVERRUN,
                T0 + 3 * CADENCE,
                T0 + 3 * CADENCE,
                T0 + 4 * CADENCE,
                T0 + 4 * CADENCE + INFERENCE,
            )
        ),
    )

    assert result.code == 0
    assert (
        "\n#2  failed — RuntimeError: the model server went away,"
        " late — skipped 2 Cadences and discarded 2 Stale Frames to observe the present\n"
    ) in result.out
    assert result.out.endswith(
        "\n2 Observations, median inference 3.000 s, 2 Cadences skipped, 1 failed\n"
    )


def test_a_watch_with_one_observation_among_failures_is_a_demo_and_exits_zero() -> None:
    result = run(
        ["--count", "2"],
        model=failing_model(BROKEN, TEXTS[1]),
        clock=failing_readings(1, 0),
    )

    assert result.code == 0
    assert result.err == ""
    assert result.out.endswith("\n1 Observation, median inference 1.000 s, 1 failed\n")


def test_a_watch_in_which_every_observation_failed_exits_non_zero() -> None:
    """Nothing was produced, so there is nothing the run can be called a success on."""
    result = run(
        ["--count", "2"],
        model=failing_model(BROKEN, BROKEN),
        clock=failing_readings(1, 1),
    )

    assert result.code == 1
    assert result.out == (
        HEADER + FAILED.format(order=1) + FAILED.format(order=2) + "\nNo Observations — 2 failed\n"
    )
    assert result.err == (
        "error: no Observation succeeded — each one is reported above with the reason it failed\n"
    )
    assert result.feed.closed
    assert result.readers.readers[0].stopped
    assert result.model.unloads == 1


class NeverObservesModel(FakeVisionModel):
    """A model the Operator interrupts before it has produced its first Observation."""

    def observe(self, workload: Workload) -> RawObservation:
        raise KeyboardInterrupt


def test_a_watch_that_produced_no_observations_at_all_exits_non_zero() -> None:
    """Even ended by the Operator: a scripted run has to tell a demo from a failure."""
    model = NeverObservesModel(make_identity(), [])
    result = run(["--count", "3"], model=model)

    assert result.code == 1
    assert result.out == HEADER + NOTHING_PRODUCED
    assert result.err == "error: the Watch ended before it produced an Observation\n"
    assert result.feed.closed
    assert result.readers.readers[0].stopped
    assert model.unloads == 1


def test_a_feed_that_never_gave_a_frame_reports_the_dead_feed_and_not_the_empty_watch() -> None:
    """One failure, one message: the Feed is why there was nothing, so it is what is said."""
    result = run(["--count", "3"], feeds={0: dying_feed(0)})

    assert result.code == 1
    assert result.out == HEADER + NOTHING_PRODUCED
    assert result.err == FEED_DIED


def test_a_variant_that_will_not_load_still_ends_the_process_before_the_watch() -> None:
    """Nothing to degrade to: a Watch with no model on the hardware has no Cadence to reach.

    The failures a Watch carries on past are the ones it meets *inside* the loop, and this
    is not one of them — there is no summary to print because there is no Watch.
    """
    unloadable = FakeVisionModel(
        make_identity(), [make_observation()], load_error=RuntimeError("no CUDA device")
    )
    result = run(["--count", "3"], model=unloadable)

    assert result.code == 1
    assert result.out == ""
    assert result.err.startswith(
        "error: qwen3-vl-2b-instruct-cuda-gpu:2 would not load on GPU"
        " / NvTensorRtRtxExecutionProvider — pin a different variant"
    )
    assert result.model.observed == []


def test_debug_restores_the_traceback() -> None:
    with pytest.raises(Exception, match="cannot run over"):
        run(["--image", "desk.jpg", "--debug"])


def test_reads_no_keyboard_where_stdin_is_not_a_terminal() -> None:
    """A pipe, CI, output redirected to a file: nobody is typing, and lines arriving on
    ``stdin`` are a script rather than an Operator. No reader is started — this is the one
    test that gives the command no ``Questions`` of its own — and the Watch runs on what
    ``--ask`` gave it (ADR-0010).
    """
    out, err = io.StringIO(), io.StringIO()
    model = FakeVisionModel(make_identity(), [make_observation(text) for text in TEXTS])

    code = watch_main(
        ["--count", "3", "--ask", STANDING],
        open_feed=FakeCameras({0: watching_feed(len(TEXTS))}),
        make_reader=FakeReaders(),
        router=Router(FakeFoundry.resolving_everything_to(model)),
        clock=FakeClock(readings(len(TEXTS))),
        sleep=FakeSleep(),
        stdin=io.StringIO(f"{TYPED}\n"),
        out=out,
        err=err,
    )

    assert code == 0
    assert "Asking:" not in out.getvalue()
    assert [workload.prompt for workload in model.observed] == [STANDING] * 3


DESK = ObjectsPresent((PresentObject("cup", 2, Where.ZONE), PresentObject("laptop", 1, Where.ZONE)))
"""A Structured Observation's shape: the objects present on the desk, with their counts."""

DESK_LINES = "2  cup  (zone)\n1  laptop  (zone)"
"""How ``DESK`` is rendered under a Cadence's line — the aligned list of count, name and where."""

HAND = ObjectsPresent((PresentObject("mug", 1, Where.HAND),))
"""A second shape, so a run of them can be told apart in the order they were produced."""

HAND_LINES = "1  mug  (hand)"


def structured_model(*shapes: Shape | Exception) -> FakeVisionModel:
    """A model that answers each structured Cadence with a prepared shape, or raises.

    A ``Shape`` is what the model came to — the objects present, an empty list, or a "no
    shape" — and an ``Exception`` is an inference that failed rather than one that produced
    no shape: the two are different outcomes, and only the second is a ``FailedInference``.
    """
    return FakeVisionModel(
        make_identity(),
        [],
        structured=[
            shape if isinstance(shape, Exception) else make_structured_observation(shape)
            for shape in shapes
        ],
    )


def structured_block(order: int, body: str, extra: str = "") -> str:
    """One structured Cadence: the ``#N`` line of facts, then the shape it came to."""
    return f"\n#{order}  inference 1.000 s{extra}\n{body}\n"


def test_structured_lists_the_objects_present_at_each_cadence() -> None:
    """--structured answers each Cadence with the aligned list rather than prose."""
    result = run(
        ["--count", "2", "--structured"], model=structured_model(DESK, HAND), observations=2
    )

    assert result.code == 0
    assert result.err == ""
    assert result.out == (
        HEADER
        + structured_block(1, DESK_LINES)
        + structured_block(2, HAND_LINES)
        + "\n2 Observations, median inference 1.000 s\n"
    )
    # The fixed shape crosses the port through observe_structured, never observe.
    assert result.model.observed == []
    assert [workload.prompt for workload in result.model.observed_structured] == [
        STRUCTURED_PROMPT
    ] * 2


def test_structured_reports_a_no_shape_cadence_with_its_reason_and_carries_on() -> None:
    """A "no shape" Cadence is reported and the Watch goes on to the next, which succeeds."""
    reason = "the model answered in prose instead of the list of objects the shape asks for"
    result = run(
        ["--count", "2", "--structured"],
        model=structured_model(NoShape(reason), DESK),
        observations=2,
    )

    assert result.code == 0
    assert result.err == ""
    assert result.out == (
        HEADER
        + structured_block(1, reason)
        + structured_block(2, DESK_LINES)
        + "\n2 Observations, median inference 1.000 s\n"
    )


def test_structured_renders_an_empty_list_as_nothing_present() -> None:
    """An empty list is a success — the model saying nothing is present — not a "no shape"."""
    result = run(
        ["--count", "1", "--structured"],
        model=structured_model(ObjectsPresent(())),
        observations=1,
    )

    assert result.code == 0
    assert result.out == (
        HEADER
        + structured_block(1, "nothing present")
        + "\n1 Observation, median inference 1.000 s\n"
    )


def test_structured_carries_the_per_cadence_shortfall_exactly_as_prose_does() -> None:
    """A late structured Cadence says what it skipped and discarded, on its own line.

    Driven through the Watch that overran its Cadence by two instants — the one place the
    counts are anything but zero — so switching the shape of the answer is shown to cost the
    machine nothing of its honesty about falling behind (ADR-0006).
    """
    result = run(
        ["--count", "3", "--structured"],
        model=structured_model(DESK, HAND, DESK),
        feeds={0: overrun_feed()},
        clock=overrun_clock(),
        readers=HandTurnedReaders(OVERRUN_READS),
    )

    assert result.code == 0
    assert result.out == (
        HEADER
        + f"\n#1  inference {OVERRUN:.3f} s\n{DESK_LINES}\n"
        + structured_block(
            2,
            HAND_LINES,
            extra=(
                ", late — skipped 2 Cadences and discarded 2 Stale Frames to observe the present"
            ),
        )
        + structured_block(3, DESK_LINES)
        + "\n3 Observations, median inference 1.000 s, 2 Cadences skipped\n"
    )


def test_a_structured_inference_that_raised_is_a_failure_the_watch_goes_on_past() -> None:
    """An inference that actually raised is a ``FailedInference`` — distinct from a "no shape".

    A "no shape" is a Structured Observation the model produced; this is one it never
    produced, so it is one line the Watch carries on past, exactly as a failed prose
    Observation is (ADR-0006).
    """
    result = run(
        ["--count", "2", "--structured"],
        model=structured_model(BROKEN, DESK),
        clock=failing_readings(1, 0),
        observations=2,
    )

    assert result.code == 0
    assert result.err == ""
    assert result.out == (
        HEADER
        + FAILED.format(order=1)
        + structured_block(2, DESK_LINES)
        + "\n1 Observation, median inference 1.000 s, 1 failed\n"
    )


def test_structured_notes_on_the_line_a_list_cut_short_by_the_output_limit() -> None:
    """A parseable list can still be truncated; the line says so, as the prose line does."""
    model = FakeVisionModel(
        make_identity(),
        [],
        structured=[
            make_structured_observation(
                ObjectsPresent((PresentObject("cup", 2, Where.ZONE),)), FinishReason.TRUNCATED
            )
        ],
    )
    result = run(["--count", "1", "--structured"], model=model, observations=1)

    assert result.code == 0
    assert result.out == (
        HEADER
        + structured_block(
            1,
            "2  cup  (zone)",
            extra=", truncated — the list may be incomplete, it hit the 256-token output limit",
        )
        + "\n1 Observation, median inference 1.000 s\n"
    )


def test_structured_does_not_note_an_empty_list_cut_short() -> None:
    """ "Nothing present" under truncation stays that: the "may be incomplete" note would
    contradict it, so an empty list carries no truncation clause."""
    model = FakeVisionModel(
        make_identity(),
        [],
        structured=[make_structured_observation(ObjectsPresent(()), FinishReason.TRUNCATED)],
    )
    result = run(["--count", "1", "--structured"], model=model, observations=1)

    assert result.code == 0
    assert result.out == (
        HEADER
        + structured_block(1, "nothing present")
        + "\n1 Observation, median inference 1.000 s\n"
    )


def test_structured_overrides_ask_and_sends_the_fixed_shape() -> None:
    """Passing both --structured and --ask uses the fixed shape, not the question."""
    result = run(
        ["--count", "1", "--structured", "--ask", STANDING],
        model=structured_model(DESK),
        observations=1,
    )

    assert result.code == 0
    assert result.model.observed == []
    (workload,) = result.model.observed_structured
    assert workload.prompt == STRUCTURED_PROMPT


def test_structured_does_not_refuse_an_empty_ask_beside_it() -> None:
    """--ask "" is a mistake on its own, but --structured ignores --ask entirely."""
    result = run(
        ["--count", "1", "--structured", "--ask", ""],
        model=structured_model(ObjectsPresent(())),
        observations=1,
    )

    assert result.code == 0
    assert result.err == ""
    assert "nothing present" in result.out


def test_structured_still_suspends_to_compose_but_the_shape_overrides_the_question() -> None:
    """Composing suspends the Watch, but what is composed steers nothing while structured is on.

    Space is pressed at the first Observation and a question is composed. The Watch still
    suspends and re-anchors its grid across the composing — nothing is counted as a skip — but
    the fixed shape overrides the question: every Cadence still asks for the shape, and there
    is no echo of a question that changed nothing (issue #32).
    """
    result = run(
        ["--count", "3", "--structured"],
        model=structured_model(DESK, HAND, DESK),
        questions=TypedQuestions([asks(TYPED), None, None]),
        observations=3,
    )

    assert result.code == 0
    # The composed question steered nothing: every Cadence asked for the fixed shape.
    assert result.model.observed == []
    assert [workload.prompt for workload in result.model.observed_structured] == [
        STRUCTURED_PROMPT
    ] * 3
    # It was still read, and it changed neither the request nor the report.
    assert result.questions.checks == 3
    assert "Asking:" not in result.out
    # Suspending to compose is not the machine falling behind: nothing reads as late or skipped.
    assert "late" not in result.out
    assert "skipped" not in result.out
    assert result.out.endswith("\n3 Observations, median inference 1.000 s\n")


def test_structured_keeps_the_observed_frames_when_asked(tmp_path: Path) -> None:
    """--keep-frames works whichever shape is asked: an observed Frame is worth keeping."""
    result = run(
        ["--count", "2", "--structured", "--keep-frames"],
        model=structured_model(DESK, HAND),
        observations=2,
        frames_dir=tmp_path,
    )

    assert result.code == 0
    kept = list(tmp_path.glob("*.jpg"))
    assert len(kept) == 2
    observed = {workload.frame.data for workload in result.model.observed_structured}
    assert {path.read_bytes() for path in kept} == observed
    for path in kept:
        assert f", saved {path}\n" in result.out


def test_structured_persists_nothing_it_produced(benchmarks: Path) -> None:
    """A structured Watch is no more a measurement than a prose one: nothing is written down."""
    run(["--count", "2", "--structured"], model=structured_model(DESK, HAND), observations=2)

    assert not benchmarks.exists()


# --- The second Runtime: a Watch runs on an OpenVINO Variant behind the unchanged port ---

OV_SLUG = "qwen3-vl-2b-instruct-int4-sym-npu"


def watch_openvino(
    argv: list[str],
    *,
    model: FakeVisionModel,
    observations: int = 2,
    frames_dir: Path | None = None,
) -> tuple[int, str, FakeFoundry]:
    """Drive a Watch with an OpenVINO Variant named, over a router that also holds Foundry Local.

    The command is unchanged; only the router discriminates. The Foundry Local beside OpenVINO
    is handed back so a test can pin that it was never resolved or asked to register — a Watch
    of only an OpenVINO Variant registers no Execution Providers (ADR-0013).
    """
    foundry = FakeFoundry({})
    openvino = FakeOpenVINO({OV_SLUG: model})
    cameras = FakeCameras({0: watching_feed(observations)})
    out, err = io.StringIO(), io.StringIO()
    code = watch_main(
        [*argv, "--variant", OV_SLUG],
        open_feed=cameras,
        make_reader=FakeReaders(),
        router=Router(foundry, openvino),
        clock=FakeClock(readings(observations)),
        sleep=FakeSleep(),
        questions=TypedQuestions(),
        out=out,
        err=err,
        frames_dir=frames_dir,
    )
    return code, out.getvalue(), foundry


def test_watches_on_an_openvino_variant_and_registers_no_execution_providers() -> None:
    """A Watch reaches OpenVINO by naming a Variant it claims, with Foundry Local untouched.

    The header's Model line reads the provenance identity — the slug and the device, no Alias —
    and the Foundry Local beside it is never resolved or asked to register: a Watch of only an
    OpenVINO Variant registers no Execution Providers (ADR-0013).
    """
    model = FakeVisionModel(
        make_provenance_identity(), [make_observation(text) for text in TEXTS[:2]]
    )

    code, out, foundry = watch_openvino(["--count", "2"], model=model)

    assert code == 0
    assert f"Model      {OV_SLUG} (NPU)\n" in out
    assert TEXTS[0] in out
    assert TEXTS[1] in out
    assert foundry.events == []


def test_structured_and_keep_frames_cross_the_second_runtime(tmp_path: Path) -> None:
    """A structured Watch that keeps its Frames runs the same off OpenVINO as off Foundry Local.

    The fixed shape and --keep-frames are Runtime-agnostic — the shape crosses the port through
    ``observe_structured`` and the Frame is kept by the command — so this pins the acceptance
    that a Watch of an OpenVINO Variant carries --structured and --keep-frames (issue #49).
    """
    model = FakeVisionModel(
        make_provenance_identity(),
        [],
        structured=[make_structured_observation(shape) for shape in (DESK, HAND)],
    )

    code, out, foundry = watch_openvino(
        ["--count", "2", "--structured", "--keep-frames"],
        model=model,
        frames_dir=tmp_path,
    )

    assert code == 0
    assert f"Model      {OV_SLUG} (NPU)\n" in out
    # The aligned list crossed the second Runtime, and each observed Frame was kept.
    assert DESK_LINES in out
    assert HAND_LINES in out
    assert len(sorted(tmp_path.glob("*.jpg"))) == 2
    assert "saved " in out
    assert foundry.events == []
