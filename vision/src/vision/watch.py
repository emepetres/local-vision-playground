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

The grid is also what makes falling behind countable. An inference that overruns the
Cadence passes one or more instants, and a Watch abandons them rather than deferring them:
it skips forward to the next instant that has not arrived yet, takes the present off the
Feed — discarding as Stale Frames whatever the Feed produced meanwhile — and carries on
the grid it was asked for. What that cost travels on the Observation it cost, as a count of
skipped Cadences and a count of discarded Stale Frames, rather than being averaged into a
figure about the whole run: the shortfall happened at a moment, and the moment is the half
of it an Operator can act on.

The two failures a live demo hits do not mean the same thing (ADR-0006). A failed
inference is one line the Watch carries on past, because the next Cadence can still produce
something. A Feed that dies ends the Watch, because it cannot produce anything again — and
either way the Watch comes back as what it managed, with the failures counted on it, rather
than as an exception that would take the Observations already produced down with it.

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
from math import ceil
from pathlib import Path
from statistics import median
from typing import Protocol

from vision.capture import Frame, HeldFeed, save_frame
from vision.errors import VisionError, one_line
from vision.inference import PROMPT, FinishReason, ModelIdentity, VisionModel, Workload
from vision.startup import Clock, Sleep, timed

CADENCE = 2.0
"""Seconds between Observations when the Operator does not say otherwise.

Slow enough that an audience can read one Observation before the next arrives, and slow
enough that a machine worth demonstrating can nearly keep it — a default Cadence nothing
could keep would make the shortfall the only thing the command ever showed.
"""

GRID_TOLERANCE = 1e-9
"""How close to an instant on the grid counts as having arrived at it, in instants.

Small enough that no shortfall a machine could produce falls inside it — a nanosecond of a
Cadence is nothing any camera or model works in — and large enough to absorb the rounding
a Cadence that is not a binary fraction accumulates (see ``_first_instant_from``).
"""


@dataclass(frozen=True)
class Shortfall:
    """What reaching one Cadence cost, where the machine could not reach it on time.

    The two counts are one value because they are one event: the instants were abandoned
    and the Stale Frames were discarded by the same skip forward, they are only ever
    reported together, and whether they are worth reporting at all is one question asked
    of both (see ``late``). Written once so that a Cadence that produced an Observation
    and one that failed cannot answer it differently.
    """

    skipped_cadences: int = 0
    """Instants on the grid that had already passed when the model came free. Usually none.

    A count rather than a delay, which is the whole of ADR-0006: a Watch that queued would
    have this be an ever-growing lateness with nothing to report it as. Zero is the
    ordinary case and says nothing — an Observation on time skipped nothing.
    """

    stale_frames: int = 0
    """Images the Feed produced while the model was busy, discarded to reach the present.

    Never the Frames discarded while the Feed settled: those are a start-up cost, paid once
    and reported once (CONTEXT.md, "Stale Frame").
    """

    @property
    def late(self) -> bool:
        """Whether this Cadence was reached by skipping forward to be about the present.

        Asked of the skipped Cadences alone, and it is what decides whether *either* count
        is worth reporting. A reader draining the Feed discards images between every pair
        of handouts, timely or not — a camera yields a good many more images than a Watch
        asks Observations of — so a Stale Frame on its own says nothing about the machine.
        What makes the count news is the Cadence having been missed, and that is this
        question. Whoever writes a Cadence down asks it rather than comparing two numbers
        to zero and inventing its own rule for what late means.
        """
        return self.skipped_cadences > 0


@dataclass(frozen=True)
class QuestionChanged:
    """What a Watch has just been steered onto, on the Cadence it was steered at.

    A value rather than the question itself, because "the question changed" and "this is
    the question" are two facts and only one of them is a sentence: an Operator who typed
    an empty line stopped asking, and what the Watch does then is not something they wrote
    down. Told apart here, where the line was read, so that whoever writes the change down
    is not left comparing a prompt against a constant to work out which of the two happened
    (ADR-0009).
    """

    question: str | None
    """The Scene Question now standing, or nothing where the Watch went back to describing."""


@dataclass(frozen=True, kw_only=True)
class ReachedCadence:
    """One Cadence a Watch reached: which it was, what reaching it cost, what it asked.

    Everything true of a Cadence whether or not the model then answered at it, held once
    so that the two ways one ends cannot drift apart — a Watch that counted a Shortfall on
    its Observations and not on its failures would under-report the machine precisely where
    it was worst, and one that echoed a changed question only on the Cadences that produced
    something would let a change go unsaid altogether.

    Keyword-only, as both of its two shapes already were at every call site: what a Cadence
    is carries defaults and what makes an Observation an Observation does not, and an
    inherited field order that put the defaults first would otherwise be unwritable.
    """

    order: int
    """Which Cadence of the Watch this was, counting from one.

    A turn in one series rather than a count of Observations, because a Cadence the model
    did not answer at still happened: an Operator reading ``#4`` after ``#2`` is being told
    that something took place at ``#3``.
    """

    shortfall: Shortfall = Shortfall()
    """What reaching this Cadence cost, where it cost anything."""

    changed_question: QuestionChanged | None = None
    """The Scene Question this Cadence is the first to ask, where it just changed.

    Nothing on every other Cadence, which is nearly all of them: the question stands until
    the Operator replaces it (ADR-0009), so this is news exactly once per change and a
    value repeated on every line would be furniture. It travels on the Cadence rather than
    being announced the moment it was typed so that the report has one writer and the echo
    cannot race the answers it belongs above.
    """


@dataclass(frozen=True, kw_only=True)
class WatchedObservation(ReachedCadence):
    """One Observation a Watch produced, and what producing it cost.

    Only the inference is timed. Registering the Execution Providers and loading the model
    were paid once before the first Observation, and taking the present off a held Feed is
    not a cost worth a column — what an Operator is watching for is the one number that
    changes from line to line.

    The output limit travels with the Observation rather than with the Watch, for the
    reason it travels on a Workload (ADR-0005): the limit worth naming is the one this
    Observation was actually generated under.
    """

    inference: float
    text: str
    finish_reason: FinishReason
    max_output_tokens: int

    saved: Path | None = None
    """Where the observed Frame was kept, when the Operator asked for it to be kept."""

    @property
    def truncated(self) -> bool:
        return self.finish_reason is FinishReason.TRUNCATED


@dataclass(frozen=True, kw_only=True)
class FailedInference(ReachedCadence):
    """A Cadence at which the model was asked about a Frame and did not answer.

    Not a failed Observation: an Observation is what the model *reports* about a Frame
    (CONTEXT.md), and this one reported nothing. What failed is the inference — the act of
    running the model over a Frame, which is the thing CONTEXT.md keeps that word for and
    the thing ADR-0006 says a Watch carries on past.

    The exception is kept rather than only its message, so that nothing about the fault is
    thrown away by the value that reports it. Everything else about the Cadence — its turn
    in the series, what it cost to reach, what it asked — is the Cadence's rather than this
    failure's, and is inherited from it unchanged.
    """

    error: Exception

    @property
    def reason(self) -> str:
        """The one line this failure is worth, in the shape every other failure is said in."""
        return one_line(self.error)


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
    question: str
    """The Scene Question this Watch starts on, answered by every Observation it produces.

    Part of the start rather than of the loop because it is what the Watch was *asked for*,
    as the Cadence is: chosen before the first Frame was taken, and read by the loop rather
    than owned by it. Not that it is settled for ever — ADR-0009 has an Operator replace
    the question while the Watch runs, and the last question wins. This is the one the
    Watch starts on, and it is not somewhere the Watch returns to: a line typed at it
    replaces this, and an empty line typed at it goes to the plain description rather than
    back here (see ``_standing_question``).

    Not reported in the header, which is the costs and the Cadence: an Operator who typed
    the question is looking at it already, and one who typed none is reading the prompt
    this command has always sent.
    """

    providers: float
    load: float
    settling: float
    """What opening the Feed and settling it cost, in seconds.

    Reported because it is the whole of the delay before the first Observation, and an
    Operator not told about it reads that wait as the model being slow — which is the one
    thing a Watch exists to be honest about. Kept beside the discards rather than folded
    into them: the count says what was thrown away, and only this says how long for.
    """

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

    failures: tuple[FailedInference, ...] = ()
    """The Cadences at which the model was asked and did not answer.

    Kept beside the Observations rather than among them: an Observation is what the model
    reported about a Frame (CONTEXT.md), and a median inference taken over runs that
    produced no text would be a number about nothing. They are still the same series —
    every one of them carries the turn it took in it.
    """

    feed_died: bool = False
    """Whether the Feed stopped giving Frames, which is what ended this Watch.

    A Watch is over either way, and this is what makes the two endings tell apart: an
    Operator who stopped a Watch got what they asked for, and one whose camera was taken
    away did not. It is a fact about the run rather than a message about it — what to tell
    them is the caller's, as it is for a camera that was never there.
    """

    skipped_cadences: int = 0
    """Every instant this Watch passed without observing, over the whole run.

    Totalled rather than averaged, and reported beside the median inference, because
    together they are the lesson: this is the rate the machine was asked for and this is
    how often it could not manage it.

    Kept here rather than summed back out of the Observations, even though every one of
    them carries its own count, because the two do not always add up to the same number: an
    instant is abandoned before the Observation that follows it is asked for, and where
    that Observation never arrives — the Operator pressed Ctrl+C during the inference, the
    camera was taken away — the skip still happened. Summing the Observations would let a
    Watch look as though it kept a Cadence it was failing at the moment it ended.
    """

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

    @property
    def produced_nothing(self) -> bool:
        """Whether this Watch has nothing at all to show for having been run.

        Asked rather than compared against an empty tuple, because it is the question the
        exit status is decided on and there is exactly one right way to ask it: a Watch
        that produced no Observation is a failure however it came to produce none.
        """
        return not self.observations


Produced = WatchedObservation | FailedInference
"""What one Cadence came to: the Observation it produced, or the inference that failed.

Named once because four places speak of it — the port below, the rendering of a line, and
the two ends of ``_observe`` — and a union respelled at each of them is a union that grows
a fourth member in three of them.
"""


Announce = Callable[[Produced], None]
"""Says what one Cadence came to, as it happens rather than once the Watch is over.

One port for both outcomes rather than two, because a Watch produces its Observations in
series and a failure took a turn in that series: reported anywhere else, it would leave an
Operator reading a column whose numbering skips for no reason they can see.
"""


class Questions(Protocol):
    """Whatever the Operator is typing at a running Watch, read one line at a time.

    Shaped like the Feed's reader (``capture.Reader``) because it is the same problem: what
    is being read arrives on its own schedule and the Watch reads it on the grid, so this
    answers with what is there *now* and never waits for more. A Watch that blocked on a
    line would stop being a Watch the moment nobody typed.

    **The last question wins**, and that rule is this port's rather than the loop's
    (ADR-0009): whatever arrived since the last poll collapses to the most recent line and
    the rest is discarded here, so the loop never sees a queue and cannot grow one. What an
    empty line *means* is not this port's — it answers with the raw text, and the Watch
    reads it (see ``_standing_question``).
    """

    def pending(self) -> str | None:
        """The most recent line typed since the last poll, or nothing where none was."""
        ...

    def stop(self) -> None:
        """Stop reading. Whatever the lines are read from is the caller's to close."""
        ...


class NoQuestions:
    """A Watch nobody can steer: whatever it started on stands until it ends.

    What a Watch runs on wherever there is no terminal to read the Operator's keystrokes
    from: a pipe, CI, output redirected to a file (ADR-0009). Reading a real keyboard is
    ``keyboard.TypedLines``, and which of the two a command gets is decided once, in
    ``keyboard.read_the_keyboard``.

    It lives here rather than beside that reader because it is the port's own answer to
    having nobody at it, so the loop is written against a port and never against a
    ``None`` — a Watch handed no keyboard at all is still a Watch.
    """

    def pending(self) -> str | None:
        return None

    def stop(self) -> None:
        return None


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


def keep_watch(
    *,
    start: WatchStart,
    model: VisionModel,
    feed: HeldFeed,
    count: int | None,
    clock: Clock,
    sleep: Sleep,
    keep_in: Path | None,
    announce: Announce,
    questions: Questions,
) -> Watch:
    """Produce Observations on the grid until the Operator stops it, or ``count`` is met.

    An interruption ends the Watch rather than the process: ending a demo is not itself an
    error, so it comes back as the Observations that were produced and the caller reports
    them. What the caller then exits with is the ordinary question of whether the Watch
    produced anything, asked of an interrupted Watch exactly as of any other. The
    interruption is caught around the whole body because Ctrl+C arrives whenever the
    Operator presses it — inside the wait, or half way through an inference.

    A failed inference is one line and the next Cadence is taken as though nothing had
    happened: a transient runtime fault must not end a demo that was going fine, and the
    grid does not move for it — the Cadence it happened at is spent, not deferred. A Feed
    that has stopped giving Frames ends the Watch instead, because it cannot produce
    anything again and an Operator should not be left watching a Watch that never will.
    Neither is raised: both come back on the Watch, so that whatever was produced is
    reported and the caller decides what to exit with.

    ``count`` is the number of Cadences the Watch takes, a failed one included, which is
    what makes a Watch whose every inference fails end rather than run for ever. It exists
    so that the whole command is drivable to its summary in a test with no signals and no
    wall-clock time; a Watch with no count runs until it is interrupted.

    The Scene Question is read on the grid — once per Cadence, after the wait and before
    the Frame is taken — so a question always applies from a Frame taken after it was
    typed, and one typed while an inference is running does not reach back into it. It then
    stands until it is replaced (ADR-0009): the Watch is steered rather than interrupted,
    and nothing about a question is ever counted against the machine, so no skipped Cadence
    and no Stale Frame is ever attributable to somebody having typed.

    The instant an Observation was taken at is tracked apart from how many Cadences the
    Watch has reached, because on a machine short of the Cadence the two come apart: that
    is what skipping *is*. A Watch that counted its way along the grid would have every
    Observation after an overrun be about an instant that had already gone by, which is the
    queuing ADR-0006 refuses, arrived at by arithmetic rather than by choice.
    """
    observations: list[WatchedObservation] = []
    failures: list[FailedInference] = []
    question = start.question
    began = clock()
    instant, skipped, skipped_in_total, cadences = 0, 0, 0, 0
    died = False
    try:
        while count is None or cadences < count:
            # The first Observation is due at t0, which is now, so there is nothing to wait
            # for and nothing can have been skipped to reach it. Every later one is due on
            # the grid rather than a Cadence after the last — and where the grid has moved
            # on past the next instant, on the first one that has not arrived yet.
            if cadences:
                instant, skipped = _wait_for_the_next_instant(
                    instant + 1,
                    began=began,
                    cadence=start.cadence,
                    clock=clock,
                    sleep=sleep,
                )
                # Counted the moment the instants are given up on, rather than once the
                # Observation that follows them has been produced: a Watch that ended
                # part-way through that inference still passed them.
                skipped_in_total += skipped
            cadences += 1
            # Read here, between the wait and the Frame, which is what makes a question
            # take effect from the next Cadence rather than from the middle of one. Read on
            # the first Cadence too: there is no wait before it, but a Watch that only
            # started listening at its second Observation would silently drop a question
            # typed while the camera was still settling.
            question, changed = _standing_question(question, typed=questions.pending())
            present = feed.present()
            frame = present.frame(provenance=start.provenance)
            # A Feed with nothing left to give is the end of the Watch, and it is decided
            # here rather than anywhere below because it is the one failure the next
            # Cadence cannot recover from.
            if frame is None:
                died = True
                break
            produced = _observe(
                model,
                frame=frame,
                order=cadences,
                question=question,
                changed_question=changed,
                shortfall=Shortfall(skipped_cadences=skipped, stale_frames=present.stale_frames),
                clock=clock,
                keep_in=keep_in,
            )
            if isinstance(produced, FailedInference):
                failures.append(produced)
            else:
                observations.append(produced)
            announce(produced)
    except KeyboardInterrupt:
        pass

    return Watch(
        observations=tuple(observations),
        failures=tuple(failures),
        feed_died=died,
        skipped_cadences=skipped_in_total,
    )


def _wait_for_the_next_instant(
    due: int, *, began: float, cadence: float, clock: Clock, sleep: Sleep
) -> tuple[int, int]:
    """Wait for the instant an Observation is next due at, and say what was passed to reach it.

    What is waited for is the distance from now to that instant, which is what makes the
    Cadence a grid: an inference that took one second of a two-second Cadence is followed by
    one second of waiting, not by two.

    ``due`` is the instant that would be next if nothing had overrun. Where it and others
    after it have already gone by, the Watch skips to the first that has not — it does not
    run them all late, one after another (ADR-0006). Comes back as the instant actually
    waited for and the number of them abandoned on the way, which is what the Observation
    that follows reports.

    The clock is read once: two readings would be two different nows, and the wait would be
    computed against an instant chosen at the other one.
    """
    now = clock()
    instant = _first_instant_from(due, now=now, began=began, cadence=cadence)
    remaining = began + instant * cadence - now
    if remaining > 0:
        sleep(remaining)
    return instant, instant - due


def _first_instant_from(due: int, *, now: float, began: float, cadence: float) -> int:
    """Which instant on the grid is the next one not yet arrived, counting from ``due``.

    Never earlier than ``due``: the grid only ever moves forward, and an Observation is
    never taken twice at one instant. An instant that falls exactly on ``now`` has arrived
    and is therefore the one to take, which is why this rounds up rather than past.

    A Cadence of zero has no grid to skip on — every instant is now, so nothing is ever
    passed and there is nothing to divide by (see ``require_a_cadence``).

    The tolerance is what keeps the count a quantity rather than an artefact of binary
    floating point. A Cadence an Operator can ask for is not necessarily one a float can
    hold — ``--every 0.1`` is three instants that land a fraction of a nanosecond past
    where the arithmetic says they should — and without it an Observation that arrived
    exactly on its instant would round up to the next one, wait out a whole Cadence and
    report a skip that never happened. It is a tolerance in instants rather than in
    seconds, so it means the same thing at every Cadence.
    """
    if cadence <= 0:
        return due
    return max(due, ceil((now - began) / cadence - GRID_TOLERANCE))


def _standing_question(standing: str, *, typed: str | None) -> tuple[str, QuestionChanged | None]:
    """What the Watch asks from this Cadence on, and the change worth saying out loud.

    The meaning of the line is decided here rather than in the port, because the port reads
    keystrokes and this is where a Watch's prompt is: an empty or whitespace-only line is a
    return to the plain description, not a question that asks nothing. ``--ask ""`` is
    refused on the command line for the opposite reason — there, a question was meant and
    the shell ate it, and there is nothing to go back to.

    Which of the two happened is settled here as well, where the line was read, rather than
    left for the report to deduce from the prompt: an Operator who typed a question gets
    their own words back, and one who stopped asking is not quoted a sentence they never
    wrote.

    Retyping the question already standing is not a change and is not echoed. The echo says
    what the Watch is now asking, and an Operator handed the same sentence twice would
    start looking for the difference between them.
    """
    if typed is None:
        return standing, None
    asked = typed.strip()
    prompt = asked or PROMPT
    if prompt == standing:
        return standing, None
    return prompt, QuestionChanged(question=asked or None)


def _observe(
    model: VisionModel,
    *,
    frame: Frame,
    order: int,
    question: str,
    changed_question: QuestionChanged | None,
    shortfall: Shortfall,
    clock: Clock,
    keep_in: Path | None,
) -> Produced:
    """Ask the model about one Frame, once, and come back with whichever way it went.

    Every fault is caught, not a chosen few: what breaks an inference on a local runtime is
    Foundry Local's business and the shapes it raises in are not ours to enumerate, while
    what a Watch does about any of them is the same — say so at the Cadence it happened at
    and take the next one (ADR-0006). Catching narrowly would mean a Watch that survived
    the faults we had thought of and ended on the first one we had not, in front of an
    audience. ``KeyboardInterrupt`` is not among them: it is not a fault of the inference
    but the Operator ending the Watch, and it passes through to whoever runs the grid.

    The Workload is built fresh from this Frame and carries the Scene Question standing
    over the Watch at this Cadence, which the loop has just read off the keyboard.
    An Observation is what the model reports about *a* Frame, and a Watch that let a
    conversation grow across its Observations would be describing its own history as much
    as the room in front of the camera: the question is carried from one Cadence to the
    next, never the answers.

    Handed the Frame rather than the Feed, and deliberately: a Feed with nothing left to
    give is the end of the Watch and every fault in here is not, so the two are decided in
    different places. What reaching the present cost is counted by the reader that
    discarded them rather than deduced here (ADR-0006) — this only carries the number onto
    the Observation it was paid for.
    """
    try:
        # Kept before inference runs, as the single-shot path keeps it: a Frame worth
        # explaining is worth keeping even when the Observation that would have prompted
        # the question never arrives. Only the observed Frame is ever written — a Stale
        # Frame explains nothing, because nobody observed it.
        saved = save_frame(frame, keep_in) if keep_in is not None else None
        workload = Workload(prompt=question, frame=frame)
        raw, inference = timed(clock, lambda: model.observe(workload))
    except Exception as error:
        return FailedInference(
            order=order, error=error, shortfall=shortfall, changed_question=changed_question
        )
    return WatchedObservation(
        order=order,
        inference=inference,
        text=raw.text,
        finish_reason=raw.finish_reason,
        max_output_tokens=workload.max_output_tokens,
        shortfall=shortfall,
        saved=saved,
        changed_question=changed_question,
    )
