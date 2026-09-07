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
    FakeReaders,
    FakeSleep,
    FakeVisionModel,
    HandTurnedReaders,
    colour_of,
    make_identity,
    make_images,
    make_observation,
)
from vision.capture import SETTLING_FRAMES
from vision.cli import watch_main
from vision.inference import FinishReason, RawObservation, Workload

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
    frames_dir: Path | None = None,
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
    out, err = io.StringIO(), io.StringIO()
    code = watch_main(
        argv,
        open_feed=cameras,
        make_reader=readers,
        foundry=FakeFoundry.resolving_everything_to(model),
        clock=clock if clock is not None else FakeClock(readings(observations)),
        sleep=sleep,
        out=out,
        err=err,
        frames_dir=frames_dir,
    )
    return Run(code, out.getvalue(), err.getvalue(), cameras, readers, feeds, model, sleep)


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


def overrun(argv: list[str], *, frames_dir: Path | None = None) -> Run:
    """The Watch of three Observations whose first one overran the Cadence by two instants."""
    return run(
        argv,
        feeds={0: overrun_feed()},
        clock=overrun_clock(),
        readers=HandTurnedReaders(OVERRUN_READS),
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
