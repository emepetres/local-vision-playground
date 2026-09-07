"""A Watch: independent Observations over one held Feed, on a fixed grid of Cadences.

A Watch is a continuous run of Observations over a live Feed, produced at a requested
Cadence for as long as the Operator lets it run (CONTEXT.md, "Watch"). This module is the
rhythm and the record. It is handed a model that is already on the hardware and a Feed that
is already open and settled, and it owns neither: whoever brought them up takes them back
down, whichever way the Watch ends.

The Cadence is a **fixed grid** of instants from the moment the Watch starts — ``t0``,
``t0 + N``, ``t0 + 2N`` — and not a pause between Observations, so "one every two seconds"
means that and not "two seconds plus however long inference took" (ADR-0006). Waiting for
the next instant goes through an injected ``Sleep``, which is what lets a whole Watch be
driven to its summary with no wall-clock time in the test at all.

Nothing here lays out a report: the rendering lives in ``reporting``, and each Observation
is handed to whoever is writing them down as it is produced, because a Watch that printed
its lines only at the end would be a Watch nobody could watch.

Every Observation stands on its own Frame with no memory of the last, as any Observation
does. And nothing here is a measurement: each one runs against a different Frame by
construction, so a Watch's numbers are never comparable to another run's and are never
persisted — ``benchmark`` owns that question.
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path
from statistics import median

from vision.capture import HeldFeed, save_frame
from vision.errors import VisionError
from vision.inference import PROMPT, FinishReason, ModelIdentity, VisionModel, Workload
from vision.startup import Clock, Sleep, timed

CADENCE = 2.0
"""Seconds between Observations when the Operator does not say otherwise.

Slow enough that an audience can read one Observation before the next arrives, and slow
enough that a machine worth demonstrating can nearly keep it — a default Cadence nothing
could keep would make the shortfall the only thing the command ever showed.
"""


@dataclass(frozen=True)
class WatchedObservation:
    """One Observation a Watch produced, and what producing it cost.

    Only the inference is timed. Registering the Execution Providers and loading the model
    were paid once before the first Observation, and taking the present off a held Feed is
    not a cost worth a column — what an Operator is watching for is the one number that
    changes from line to line.

    The output limit travels with the Observation rather than with the Watch, for the
    reason it travels on a Workload (ADR-0005): the limit worth naming is the one this
    Observation was actually generated under.
    """

    order: int
    """Which Observation of the Watch this was, counting from one."""

    inference: float
    text: str
    finish_reason: FinishReason
    max_output_tokens: int
    saved: Path | None = None
    """Where the observed Frame was kept, when the Operator asked for it to be kept."""

    @property
    def truncated(self) -> bool:
        return self.finish_reason is FinishReason.TRUNCATED


@dataclass(frozen=True)
class WatchStart:
    """What a Watch cost before its first Observation, and what it was asked for.

    Reported once, at the top, because every one of these is paid or decided once: the
    Cadence the Operator asked for, the Variant that answered, the machine set-up in front
    of it, and the Frames the Feed discarded while it settled. Repeating them per
    Observation would bury the one line that changes.
    """

    model: ModelIdentity
    provenance: str
    """Where the Frames come from, in the words a single Observation names it by too."""

    cadence: float
    providers: float
    load: float
    settling_discards: int
    """Frames the Feed discarded to settle — a start-up cost, and never a Stale Frame."""


@dataclass(frozen=True)
class Watch:
    """Every Observation one Watch produced, and what they add up to.

    What the Watch was asked for is not here: the Cadence and the set-up in front of it are
    reported once, at the top, before the first Observation exists — so they are known to
    whoever started the Watch and this is what is only known once it is over.
    """

    observations: tuple[WatchedObservation, ...]

    @property
    def median_inference(self) -> float | None:
        """The inference this Watch sustained, or nothing where it produced none.

        A median rather than a mean, for the reason a Benchmark takes one: it is what
        survives a single Observation that ran while the machine was busy with something
        else. Nothing rather than zero where there were no Observations — a Watch that
        produced none did not produce an instant one.
        """
        if not self.observations:
            return None
        return median(observed.inference for observed in self.observations)


Announce = Callable[["WatchedObservation"], None]
"""Says what one Observation was, as it happens rather than once the Watch is over."""


def require_a_cadence(seconds: float) -> None:
    """Refuse a Cadence that is not a rhythm, before a camera or a model is touched.

    Zero is not refused: it is the Cadence that asks for every Observation the model can
    produce (ADR-0006), and the grid answers it with no special case at all — an instant
    that has already passed is never waited for.
    """
    if seconds < 0:
        raise VisionError(
            f"a Cadence of {seconds:g} seconds is not a rhythm — pass --every 0 to ask for"
            " Observations as fast as the model allows, or a positive number of seconds"
        )


def require_an_observation(count: int | None) -> None:
    """Refuse a Watch that would end before it had produced anything."""
    if count is not None and count < 1:
        raise VisionError(
            f"a Watch of {count} Observations is not a Watch — ask for at least one with"
            " --count N, or leave --count off to run until you stop it"
        )


def refuse_an_image_file(image: Path | None) -> None:
    """Say why a Watch cannot be pointed at a file, rather than watching one for ever.

    A Watch observes a live Feed, and an image file does not change: an Operator who passed
    ``--image`` would sit through the same sentence about the same bytes and reasonably
    conclude something was broken. Both other commands do take a file, so the refusal names
    which of them answers which question.
    """
    if image is None:
        return
    raise VisionError(
        f"a Watch cannot run over {image} — a Watch observes a live Feed, and every"
        " Observation of one file would be about the same bytes; measure a file with"
        " `benchmark --image <path>`, or look at one with `observe --image <path>`"
    )


def watch(
    *,
    start: WatchStart,
    model: VisionModel,
    feed: HeldFeed,
    count: int | None,
    clock: Clock,
    sleep: Sleep,
    keep_in: Path | None,
    announce: Announce,
) -> Watch:
    """Produce Observations on the grid until the Operator stops it, or ``count`` is met.

    An interruption ends the Watch rather than the process: ending a demo is not itself an
    error, so it comes back as the Observations that were produced and the caller reports
    them and exits zero. It is caught around the whole body because Ctrl+C arrives whenever
    the Operator presses it — inside the wait, or half way through an inference.

    ``count`` exists so that the whole command is drivable to its summary in a test with no
    signals and no wall-clock time; a Watch with no count runs until it is interrupted.
    """
    observations: list[WatchedObservation] = []
    began = clock()
    try:
        while count is None or len(observations) < count:
            # The first Observation is due at t0, which is now, so there is nothing to wait
            # for. Every later one is due on the grid rather than a Cadence after the last.
            if observations:
                _wait_until(began + len(observations) * start.cadence, clock=clock, sleep=sleep)
            observed = _observe(
                model,
                feed=feed,
                start=start,
                order=len(observations) + 1,
                clock=clock,
                keep_in=keep_in,
            )
            observations.append(observed)
            announce(observed)
    except KeyboardInterrupt:
        pass

    return Watch(observations=tuple(observations))


def _wait_until(instant: float, *, clock: Clock, sleep: Sleep) -> None:
    """Wait for the next instant on the grid, and not at all when it has already arrived.

    What is waited for is the distance from now to that instant, which is what makes the
    Cadence a grid: an inference that took one second of a two-second Cadence is followed by
    one second of waiting, not by two.
    """
    remaining = instant - clock()
    if remaining > 0:
        sleep(remaining)


def _observe(
    model: VisionModel,
    *,
    feed: HeldFeed,
    start: WatchStart,
    order: int,
    clock: Clock,
    keep_in: Path | None,
) -> WatchedObservation:
    """Take the present off the Feed and ask the model about it, once.

    The Workload is built fresh from this Frame and carries the same fixed prompt every
    other command sends. An Observation is what the model reports about *a* Frame, and a
    Watch that let a conversation grow across its Observations would be describing its own
    history as much as the room in front of the camera.
    """
    frame = feed.present().frame(provenance=start.provenance)
    if frame is None:
        raise VisionError(
            f"{start.provenance} stopped giving Frames — it was unplugged, or another"
            " application took it; a Watch cannot go on without a Feed"
        )
    # Kept before inference runs, as the single-shot path keeps it: a Frame worth explaining
    # is worth keeping even when the Observation that would have prompted the question never
    # arrives. Only the observed Frame is ever written — a Stale Frame explains nothing,
    # because nobody observed it.
    saved = save_frame(frame, keep_in) if keep_in is not None else None
    workload = Workload(prompt=PROMPT, frame=frame)
    raw, inference = timed(clock, lambda: model.observe(workload))
    return WatchedObservation(
        order=order,
        inference=inference,
        text=raw.text,
        finish_reason=raw.finish_reason,
        max_output_tokens=workload.max_output_tokens,
        saved=saved,
    )
