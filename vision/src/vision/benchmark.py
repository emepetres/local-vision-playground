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
numbers over it would be trading a result for a traceback.

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
from vision.inference import FinishReason, FoundryLocal, ModelIdentity, VisionModel, Workload
from vision.startup import (
    Clock,
    accept_variant,
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
    runs: tuple[BenchmarkRun, ...]

    @property
    def first(self) -> BenchmarkRun:
        """The cold repetition, kept rather than dropped — it is the honest number."""
        return self.runs[0]

    @property
    def observation(self) -> str:
        """What this Variant said about the Frame, taken from the cold Benchmark Run.

        One rather than all of them: the repetitions answer the same Workload, so what is
        worth keeping is what *this Variant* said, and the first is the one the report
        already singles out. Where the repetitions disagree, the Tokens spread is what
        says so.
        """
        return self.first.text

    @property
    def steady(self) -> tuple[BenchmarkRun, ...]:
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


def measure(
    *,
    foundry: FoundryLocal,
    clock: Clock,
    variants: Sequence[str],
    workload: Workload,
    repetitions: int,
    out: TextIO,
) -> Benchmark:
    """Measure each Variant against the same Workload, one on the hardware at a time.

    Every Variant is resolved and accepted before the first one is measured. A name that
    names nothing, or that names a model which cannot see a Frame, is then a failure an
    Operator hears about immediately, rather than two minutes into a Benchmark whose
    earlier numbers are about to be thrown away.

    Those two are refused because they are the Operator's mistake and cost nothing to
    catch. A Variant that will not load is neither: it is the machine's answer, and it
    arrives after the other Variants have already been paid for — so it comes back as an
    Unmeasured Variant rather than as an exception, and the sitting goes on.
    """
    require_a_benchmark_run(repetitions)
    require_a_variant(variants)

    models = [accept_variant(foundry, name) for name in variants]
    providers = register_execution_providers(foundry, clock=clock, out=out)
    measured = tuple(
        _measure_one(
            model,
            order=order,
            clock=clock,
            workload=workload,
            repetitions=repetitions,
            out=out,
        )
        for order, model in enumerate(models, start=1)
    )

    return Benchmark(
        workload=workload, providers=providers, repetitions=repetitions, variants=measured
    )


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
            ready.model, workload=workload, clock=clock, repetitions=repetitions, out=out
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
) -> tuple[BenchmarkRun, ...]:
    """Take the repetitions, showing the numbers moving while an audience waits.

    A two-Variant Benchmark including a CPU Variant takes minutes, and a terminal that
    says nothing for minutes looks like a hang. The bar takes itself off
    when nothing is watching (``disable=None`` means "disable when this is not a TTY"),
    exactly as the download bar does, so output captured in a pipe or in CI is just the
    table.
    """
    runs: list[BenchmarkRun] = []
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
            runs.append(_run(model, workload, clock))
            bar.set_postfix_str(_so_far(runs), refresh=False)
            bar.update(1)
        drawn = not bar.disable

    # A blank line only where there is a bar to separate from what follows. Printing it
    # regardless would put it in the output of a run that has no bar, which is the output
    # that is meant to be nothing but the report.
    if drawn:
        print(file=out)
    return tuple(runs)


def _so_far(runs: Sequence[BenchmarkRun]) -> str:
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
