"""Measuring what several Variants cost: N Benchmark Runs each, over one Workload.

A Benchmark Run is one measured execution of one Workload against one model on one
Execution Provider; a Benchmark is the set of comparable Benchmark Runs carried out in one
sitting — every model, every repetition (CONTEXT.md). The Workload is handed in already
built, and the same one — the same Frame bytes, prompt and generation limits — is sent to
every repetition of every Variant, because a Workload that differs between them makes the
numbers incomparable and nothing in the table would say so.

The Variants are measured one at a time, and each is taken off the hardware before the
next is put on it: two loaded models compete for the same device, so a Benchmark that left
the first one resident would be measuring the second under conditions it cannot report.
The order they were measured in is kept, which is what lets a result suspected of being
contaminated by the previously loaded model be checked by reversing it.

A Variant that will not go onto the hardware ends the Benchmark for that Variant and for
no other: it becomes an Unmeasured Variant carrying its reason, and the sitting carries on.
A published Variant whose ONNX graph is invalid is a real thing an Operator meets and
cannot work around (microsoft/foundry-local#1075), and throwing away the other Variant's
numbers over it would be trading a result for a traceback. A name no Runtime claims — an
OpenVINO slug whose IR is not on this machine, say — is a row on the same terms.

Nothing here lays out a report: the rendering lives in ``reporting``, which is what lets
the table be exercised without a clock or a model. The one thing this module does write is
the progress bar, which is not a report of the result but a sign that a machine with
minutes of work ahead of it is still working.
"""

from __future__ import annotations

from collections.abc import Sequence
from contextlib import suppress
from dataclasses import dataclass
from statistics import median
from typing import TextIO

from tqdm import tqdm

from vision.errors import VisionError
from vision.formatting import format_seconds
from vision.inference import (
    FinishReason,
    ModelIdentity,
    Shape,
    VisionModel,
    Workload,
    require_vision_task,
    unresolved_identity,
)
from vision.router import Router
from vision.startup import (
    Clock,
    bring_up,
    register_execution_providers,
    timed,
)

REPETITIONS = 5
"""Benchmark Runs per Variant when the Operator does not say otherwise.

Enough that one throttled inference does not become the headline number, few enough that
a demo does not stall — and few enough that a median, a minimum and a maximum are the only
statistics the samples support.
"""

TOKEN_DIVERGENCE = 0.10
"""How far apart two Variants' completion tokens may be before the Benchmark says so.

Two Variants that generated materially different amounts of text were not doing the same
amount of work, and their latencies are not a hardware result — but nothing in a table of
seconds says that. Ten percent is deliberately loose: a decoder is not deterministic across
Execution Providers, so a few tokens either way is the normal state of affairs and a
warning raised on every Benchmark is a warning nobody reads.
"""


@dataclass(frozen=True)
class BenchmarkRun:
    """One measured execution of one Workload, and what the model generated under it.

    The Observation is kept as well as its size. A Benchmark is a comparison, and the
    question a comparison of Execution Providers eventually runs into is not how far apart
    the latencies were but whether the CPU said the same thing as the GPU — which nothing
    but the text can answer. Counting its tokens and throwing it away would leave that
    question unanswerable the moment the process exits.
    """

    inference: float
    completion_tokens: int
    finish_reason: FinishReason
    text: str

    @property
    def truncated(self) -> bool:
        return self.finish_reason is FinishReason.TRUNCATED

    @property
    def tokens_per_second(self) -> float:
        """What the Variant generated per second — the latency read per unit of work.

        A Variant that generated twice as much text is not twice as slow, and this is the
        number that says so. A run that took no measurable time has no rate to report;
        zero is the honest answer rather than an exception, because it is a clock
        resolution artefact and not a failure of the Benchmark.
        """
        if self.inference <= 0.0:
            return 0.0
        return self.completion_tokens / self.inference


@dataclass(frozen=True)
class StructuredBenchmarkRun:
    """One measured execution of the structured Workload, and the shape it came to.

    The sibling of ``BenchmarkRun``: where that carries the prose ``text``, this carries the
    ``shape`` the model returned — the objects present, or the reason there was no shape
    (ADR-0011). Neither field is made optional to accommodate the other, which is what makes
    them siblings rather than one overloaded run type.

    The numbers are the same numbers, measured the same way: ``completion_tokens`` is what
    the model generated for the fixed-shape request rather than for prose, which is what makes
    two structured latencies comparable, exactly as it does for prose. ADR-0011 reached the
    fixed shape by a forced tool call and counts the tokens over its arguments; the adapter
    since took the prompt-and-parse fall-back the ADR named (the model never honours the tool
    call), so the tokens are the whole structured reply's — the accounting is unchanged. A
    "no shape" run is a measured run like any other: it was observed, it generated tokens, and
    the shape it came to is simply that there was none.
    """

    inference: float
    completion_tokens: int
    finish_reason: FinishReason
    shape: Shape

    @property
    def truncated(self) -> bool:
        return self.finish_reason is FinishReason.TRUNCATED

    @property
    def tokens_per_second(self) -> float:
        """What the Variant generated per second — the latency read per unit of work.

        The prose run's rate seen for the fixed shape: a run that generated twice as much
        JSON is not twice as slow, and a run that took no measurable time reports zero rather
        than dividing by it, for the reason the prose run does.
        """
        if self.inference <= 0.0:
            return 0.0
        return self.completion_tokens / self.inference


AnyBenchmarkRun = BenchmarkRun | StructuredBenchmarkRun
"""One Benchmark Run, whichever shape was asked of it: prose text or the fixed shape.

Every Variant in one Benchmark is measured the same way, so a ``MeasuredVariant`` holds one
kind or the other rather than a mix — the union is what lets the numeric machinery (the
spreads, the truncation count, the Token Divergence) be written once over the fields the two
share, while each place that renders the *answer* — the record and the Markdown — dispatches
on which kind it is holding.
"""


@dataclass(frozen=True)
class Spread:
    """The median, minimum and maximum of one quantity over several Benchmark Runs.

    No mean and no standard deviation: a handful of samples does not support them, and a
    median is what survives a single throttled repetition.
    """

    median: float
    minimum: float
    maximum: float

    @classmethod
    def over(cls, values: Sequence[float]) -> Spread | None:
        """The spread of these values, or nothing at all when there are none to spread."""
        if not values:
            return None
        return cls(median=median(values), minimum=min(values), maximum=max(values))


@dataclass(frozen=True)
class MeasuredVariant:
    """Every Benchmark Run taken against one Variant, and what putting it there cost.

    ``order`` is which turn this Variant took, counting from one. It is kept rather than
    left implicit in the sequence because it answers a real doubt: a Variant measured
    second was measured on a machine that had just had another model unloaded from it, and
    the only way to check whether that mattered is to reverse the order and look again.
    """

    model: ModelIdentity
    order: int
    load: float
    runs: tuple[AnyBenchmarkRun, ...]

    @property
    def first(self) -> AnyBenchmarkRun:
        """The cold repetition, kept rather than dropped — it is the honest number.

        What this Variant *said* is read from here — the cold Benchmark Run's prose or its
        shape, one rather than all of them, because the repetitions answer the same Workload
        and the first is the one both reports already single out. The kind of answer it is
        depends on which shape the sitting asked of it, so the one place that renders it
        dispatches on the run type; where the repetitions disagree, the Tokens spread says so.
        """
        return self.runs[0]

    @property
    def steady(self) -> tuple[AnyBenchmarkRun, ...]:
        """The repetitions after the first, which are what the statistics describe."""
        return self.runs[1:]

    @property
    def inference(self) -> Spread | None:
        return Spread.over([run.inference for run in self.steady])

    @property
    def completion_tokens(self) -> Spread | None:
        return Spread.over([run.completion_tokens for run in self.steady])

    @property
    def tokens_per_second(self) -> Spread | None:
        return Spread.over([run.tokens_per_second for run in self.steady])

    @property
    def truncated(self) -> int:
        """How many Benchmark Runs hit the output limit rather than finishing.

        Worth counting rather than hiding: a truncated run generated exactly the token
        limit, so it is the one repetition whose amount of work was decided by the limit
        instead of by the model.
        """
        return sum(1 for run in self.runs if run.truncated)

    @property
    def typical_completion_tokens(self) -> float:
        """How much text this Variant generated, as one number to compare Variants by.

        The median over every Benchmark Run, the cold one included: how much a model
        generates is not a warm-up effect, and taking it over the steady state alone would
        leave a Variant measured once out of the comparison entirely.
        """
        return float(median(run.completion_tokens for run in self.runs))


@dataclass(frozen=True)
class UnmeasuredVariant:
    """A Variant that never got onto the hardware, and the reason it did not.

    It belongs to the Benchmark rather than ending one, because a published Variant that
    will not run on this machine is exactly what an Operator runs a Benchmark to find out.
    They learn the same thing from a report as from a traceback — except that the report
    still carries what the other Variants cost.
    """

    model: ModelIdentity
    order: int
    reason: str
    """Why it never ran, on a single line, because both reports render it inline."""


@dataclass(frozen=True)
class TokenDivergence:
    """Two Variants that generated materially different amounts of text.

    The two extremes rather than every pair: what makes a comparison unsafe to quote is the
    widest gap in the sitting, and naming the two Variants at its ends is what lets a reader
    see which numbers not to put side by side.
    """

    fewest: ModelIdentity
    fewest_tokens: float
    most: ModelIdentity
    most_tokens: float

    @property
    def fraction(self) -> float:
        """How far the larger overshoots the smaller, as a fraction of the smaller.

        Measured against the smaller because that is the reading a comparison is quoted as
        — "the CPU one generated half as much again" — rather than a symmetric distance
        nobody states out loud.
        """
        return (self.most_tokens - self.fewest_tokens) / self.fewest_tokens


@dataclass(frozen=True)
class Benchmark:
    """One sitting: every Variant, every repetition, over one Workload.

    ``providers`` is a Benchmark-level figure rather than a per-Variant one: registering
    the Execution Providers is machine set-up, paid once per process, and charging it to a
    Variant would read as the price of that Execution Provider. The Workload sits here for
    the same reason seen from the other side — one Workload for the whole sitting is what
    makes the Variants comparable at all.

    ``repetitions`` is what was asked for rather than what any Variant took, so that a
    sitting in which nothing could be measured still says what it was going to measure.
    """

    workload: Workload
    providers: float
    repetitions: int
    variants: tuple[MeasuredVariant | UnmeasuredVariant, ...]
    structured: bool = False
    """Whether this sitting measured the fixed shape rather than prose (ADR-0011).

    A discriminator, not a data field: it says which Workload discipline the whole sitting
    ran under, so the record and the Markdown render each Variant's *answer* as a list of
    objects rather than a paragraph — and so that an Unmeasured Variant, which has no run to
    read the kind off, is written down in the same shape as the measured ones beside it. Two
    structured runs are comparable only when they share the fixed shape as well as the Frame
    and the limits; the shape is the prompt the Workload already carries, and this says a
    reader is looking at that kind of Benchmark.
    """

    @property
    def measured(self) -> tuple[MeasuredVariant, ...]:
        """The Variants that produced numbers — the ones there is anything to report about."""
        return tuple(variant for variant in self.variants if isinstance(variant, MeasuredVariant))

    @property
    def divergence(self) -> TokenDivergence | None:
        """The widest gap in generated text, when it is wide enough to invalidate a quote.

        Read off the Benchmark rather than printed by the report, so that it travels
        wherever the Benchmark travels — a persisted record that carried the numbers but
        not the reason they are not comparable would be the worst of both. Derived rather
        than stored for the same reason the spreads are: a warning that could drift out of
        step with the runs it is about is a warning that cannot be trusted.

        A Variant that generated nothing at all has no proportion to overshoot, so it is
        left out of this rather than reported as an infinite divergence; its Tokens row
        already reads zero, which says it more plainly than any note would.
        """
        measured = self.measured
        if len(measured) < 2:
            return None

        fewest = min(measured, key=lambda variant: variant.typical_completion_tokens)
        most = max(measured, key=lambda variant: variant.typical_completion_tokens)
        if fewest.typical_completion_tokens <= 0:
            return None

        divergence = TokenDivergence(
            fewest=fewest.model,
            fewest_tokens=fewest.typical_completion_tokens,
            most=most.model,
            most_tokens=most.typical_completion_tokens,
        )
        if divergence.fraction <= TOKEN_DIVERGENCE:
            return None
        return divergence


def require_a_benchmark_run(repetitions: int) -> None:
    """Refuse a Benchmark that would measure nothing.

    It lives beside ``measure``, which enforces it, because it is an invariant of a
    Benchmark rather than a property of the flag that happens to carry the number. A
    caller with a machine to set up is welcome to ask first, and the command does — there
    is no sense starting Foundry Local to find out.
    """
    if repetitions < 1:
        raise VisionError(
            f"{repetitions} repetitions measures nothing — a Benchmark needs at least one"
            " Benchmark Run (--repetitions N)"
        )


def require_a_variant(variants: Sequence[str]) -> None:
    """Refuse a Benchmark with nothing to measure, and for the same reason as the above."""
    if not variants:
        raise VisionError(
            "a Benchmark needs at least one Variant to measure — name one with --variant ID"
        )


def refuse_a_live_camera(camera: int | None) -> None:
    """A Feed is not a Workload's Frame source, and saying so is better than dropping it.

    Every Benchmark Run has to see the same bytes (CONTEXT.md, "Workload"), and a Feed
    gives a different Frame each time — so the numbers would look like a hardware result
    while comparing different work.

    It lives here, beside the invariants above and mirroring ``watch.refuse_an_image_file``,
    because which sources a Benchmark can be taken over is a fact about a Benchmark rather
    than about the flag that carried one. The command asks before it starts Foundry Local.
    """
    if camera is None:
        return
    raise VisionError(
        f"camera {camera} cannot be a Benchmark's Frame source — every Benchmark Run"
        " has to see the same bytes, and a Feed gives a different Frame each time; measure"
        " the reference Frame by leaving --camera off, or pass --image <path>"
    )


def measure(
    *,
    router: Router,
    clock: Clock,
    variants: Sequence[str],
    workload: Workload,
    repetitions: int,
    out: TextIO,
    structured: bool = False,
) -> Benchmark:
    """Measure each Variant against the same Workload, one on the hardware at a time.

    Every Variant is accepted before the first one is measured, so that a model which cannot
    see a Frame is a failure an Operator hears about immediately rather than two minutes into
    a Benchmark whose earlier numbers are about to be thrown away. That one is refused because
    it is the Operator's mistake and costs nothing to catch.

    A Variant that never gets onto the hardware is neither: it is the machine's answer, and it
    arrives once the other Variants have already been paid for — so it comes back as an
    Unmeasured Variant and the sitting carries on. A name no Runtime claims is the same answer
    read a moment earlier and is a row on the same terms (see ``_accept``).

    ``structured`` chooses which shape is asked of every Variant — the fixed list of objects
    or prose. It is one choice for the whole sitting because it is part of the Workload
    discipline: two structured runs are comparable only when they share the fixed shape, the
    same way they must share the Frame and the limits (ADR-0011). A model that declines the
    shape is a "no shape" run, not a failed one — the Variant was measured, so it does not
    raise and it does not become prose.
    """
    require_a_benchmark_run(repetitions)
    require_a_variant(variants)

    accepted = [_accept(router, name, order=order) for order, name in enumerate(variants, start=1)]
    providers = register_execution_providers(router, clock=clock, out=out)
    measured = tuple(
        variant
        if isinstance(variant, UnmeasuredVariant)
        else _measure_one(
            variant,
            order=order,
            clock=clock,
            workload=workload,
            repetitions=repetitions,
            out=out,
            structured=structured,
        )
        for order, variant in enumerate(accepted, start=1)
    )

    return Benchmark(
        workload=workload,
        providers=providers,
        repetitions=repetitions,
        variants=measured,
        structured=structured,
    )


def _accept(router: Router, name: str, *, order: int) -> VisionModel | UnmeasuredVariant:
    """Resolve one Variant, or turn the refusal into a row rather than the end of the sitting.

    A name no Runtime claims — a typo, or an OpenVINO provenance slug whose IR is not on this
    machine — is the verdict a Variant that will not load gives, arriving a moment earlier:
    this one will not be measured, and the others still can be (ADR-0007). So it comes back as
    an Unmeasured Variant naming itself, carrying the router's one-line refusal as its reason
    and no Runtime, because neither claimed it. An Operator whose four-row Benchmark named one
    stale slug still gets the other three rows, and the exit status still follows the Benchmark.

    A model that cannot see a Frame is not this and still ends the sitting: it is refused
    before any weights are fetched, which is what keeps a Benchmark aimed at a text-only
    sibling failing in seconds.
    """
    try:
        model = router.resolve(name)
    except VisionError as error:
        return UnmeasuredVariant(
            model=unresolved_identity(name), order=order, reason=_single_line(str(error))
        )
    require_vision_task(model.identity)
    return model


def _single_line(reason: str) -> str:
    """Flatten a failure reason onto one line, keeping it renderable where it is read.

    A native message from Foundry Local routinely spans several lines, and both reports
    put the reason inline: in the table it would land under the wrong column, and in the
    Markdown notes a blank line inside it would merge the rest of the document into the
    note. The reason is worth carrying whole, so it is folded rather than truncated.
    """
    return " ".join(reason.split())


def _measure_one(
    model: VisionModel,
    *,
    order: int,
    clock: Clock,
    workload: Workload,
    repetitions: int,
    out: TextIO,
    structured: bool,
) -> MeasuredVariant | UnmeasuredVariant:
    """Bring one Variant up, run the Workload against it, and take it back off again.

    Only getting the Variant onto the hardware is allowed to fail softly. A Benchmark Run
    that fails once the model is loaded still ends the Benchmark: the Variant was measurable
    and something went wrong while it was being measured, which is a fault worth a traceback
    rather than a verdict on what this machine can run.

    The model comes off the hardware whatever happens. A Benchmark that leaves a model
    resident is measuring whatever runs next under conditions it cannot report — and that
    is true of the next Variant in the sitting as much as of the next process on the
    machine.
    """
    try:
        ready = bring_up(model, clock=clock, out=out)
    except VisionError as error:
        # A load that failed is not necessarily a load that left nothing behind: the port
        # loads the model and then opens a session on it, and a failure between the two
        # leaves the weights on the device with nobody holding them. Unload on the way out
        # of a failed bring-up, so the next Variant in the sitting is measured on the
        # hardware this one promised to give back.
        with suppress(Exception):
            model.unload()
        return UnmeasuredVariant(model=model.identity, order=order, reason=_single_line(str(error)))

    try:
        runs = _repeat(
            ready.model,
            workload=workload,
            clock=clock,
            repetitions=repetitions,
            out=out,
            structured=structured,
        )
    except BaseException:
        # Take the model off the hardware, but never at the cost of the reason the
        # measurement failed: a native unload that fails on the way out of a failed
        # Benchmark Run would replace the one message worth reading.
        with suppress(Exception):
            ready.model.unload()
        raise
    ready.model.unload()

    return MeasuredVariant(model=ready.identity, order=order, load=ready.load, runs=runs)


def _repeat(
    model: VisionModel,
    *,
    workload: Workload,
    clock: Clock,
    repetitions: int,
    out: TextIO,
    structured: bool,
) -> tuple[AnyBenchmarkRun, ...]:
    """Take the repetitions, showing the numbers moving while an audience waits.

    A two-Variant Benchmark including a CPU Variant takes minutes, and a terminal that
    says nothing for minutes looks like a hang. The bar takes itself off
    when nothing is watching (``disable=None`` means "disable when this is not a TTY"),
    exactly as the download bar does, so output captured in a pipe or in CI is just the
    table.

    ``structured`` picks which shape each repetition asks of the model. The bar reads the
    same off either run — the last latency and the running median — because the progress an
    Operator watches is the clock, not the shape.
    """
    run_once = _run_structured if structured else _run
    runs: list[AnyBenchmarkRun] = []
    with tqdm(
        total=repetitions,
        desc=f"Measuring {model.identity.variant}",
        unit="run",
        # tqdm writes its own ", " in front of a postfix, so `{postfix}` closes the format
        # with no separator of its own.
        bar_format="{desc} |{bar}| {n:.0f}/{total:.0f} runs [{elapsed}]{postfix}",
        file=out,
        disable=None,
    ) as bar:
        for _ in range(repetitions):
            runs.append(run_once(model, workload, clock))
            bar.set_postfix_str(_so_far(runs), refresh=False)
            bar.update(1)
        drawn = not bar.disable

    # A blank line only where there is a bar to separate from what follows. Printing it
    # regardless would put it in the output of a run that has no bar, which is the output
    # that is meant to be nothing but the report.
    if drawn:
        print(file=out)
    return tuple(runs)


def _so_far(runs: Sequence[AnyBenchmarkRun]) -> str:
    """The last latency and the running median, so the numbers are visibly moving.

    The median is taken over the repetitions after the first, which is what the table's
    median means too — a bar quoting a different median from the one about to be printed
    would be worse than no bar at all.
    """
    last = f"last {format_seconds(runs[-1].inference)}"
    steady = [run.inference for run in runs[1:]]
    if not steady:
        return f"{last} (cold)"
    return f"{last}, median {format_seconds(median(steady))}"


def _run(model: VisionModel, workload: Workload, clock: Clock) -> BenchmarkRun:
    raw, inference = timed(clock, lambda: model.observe(workload))
    return BenchmarkRun(
        inference=inference,
        completion_tokens=raw.completion_tokens,
        finish_reason=raw.finish_reason,
        text=raw.text,
    )


def _run_structured(model: VisionModel, workload: Workload, clock: Clock) -> StructuredBenchmarkRun:
    """One structured Benchmark Run: ask for the fixed shape, and keep what it came to.

    The sibling of ``_run``, crossing the model port through ``observe_structured`` so the
    tokens are counted over the fixed-shape request. Only the inference is inside the clock,
    exactly as for prose; a model that declined the shape returns a ``NoShape`` here rather
    than raising, so a "no shape" run is timed and measured like any other (ADR-0011).
    """
    raw, inference = timed(clock, lambda: model.observe_structured(workload))
    return StructuredBenchmarkRun(
        inference=inference,
        completion_tokens=raw.completion_tokens,
        finish_reason=raw.finish_reason,
        shape=raw.shape,
    )
