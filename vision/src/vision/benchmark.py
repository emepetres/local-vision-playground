"""Measuring what one Variant costs: N Benchmark Runs over one Workload.

A Benchmark Run is one measured execution of one Workload against one model on one
Execution Provider (CONTEXT.md). The Workload is handed in already built, and the same
one — the same Frame bytes, prompt and generation limits — is sent to every repetition,
because a Workload that differs between repetitions makes the numbers incomparable and
nothing in the table would say so.

Nothing here formats anything: the rendering lives in ``reporting``, which is what lets
the table be exercised without a clock or a model.
"""

from __future__ import annotations

from collections.abc import Sequence
from contextlib import suppress
from dataclasses import dataclass
from statistics import median
from typing import TextIO

from vision.errors import VisionError
from vision.inference import FinishReason, FoundryLocal, ModelIdentity, VisionModel, Workload
from vision.startup import Clock, prepare, timed

REPETITIONS = 5
"""Benchmark Runs per Variant when the Operator does not say otherwise.

Enough that one throttled inference does not become the headline number, few enough that
a demo does not stall — and few enough that a median, a minimum and a maximum are the only
statistics the samples support.
"""


@dataclass(frozen=True)
class BenchmarkRun:
    """One measured execution of one Workload, and what the model generated under it."""

    inference: float
    completion_tokens: int
    finish_reason: FinishReason

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
class Benchmark:
    """Every Benchmark Run taken against one Variant in one sitting, and what set it up.

    ``providers`` is a Benchmark-level figure rather than a per-Variant one: registering
    the Execution Providers is machine set-up, paid once per process, and charging it to a
    Variant would read as the price of that Execution Provider.
    """

    model: ModelIdentity
    workload: Workload
    providers: float
    load: float
    runs: tuple[BenchmarkRun, ...]

    @property
    def first(self) -> BenchmarkRun:
        """The cold repetition, kept rather than dropped — it is the honest number."""
        return self.runs[0]

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


def measure(
    *,
    foundry: FoundryLocal,
    clock: Clock,
    model_name: str,
    workload: Workload,
    repetitions: int,
    out: TextIO,
) -> Benchmark:
    """Bring one Variant up and run the same Workload against it ``repetitions`` times.

    The model is taken back off the hardware whatever happens. A Benchmark that leaves a
    model resident is measuring whatever runs next under conditions it cannot report — and
    that is true of the next process on the machine as much as of the next Variant.
    """
    require_a_benchmark_run(repetitions)
    ready = prepare(foundry=foundry, clock=clock, model_name=model_name, out=out)

    try:
        runs = tuple(_run(ready.model, workload, clock) for _ in range(repetitions))
    except BaseException:
        # Take the model off the hardware, but never at the cost of the reason the
        # measurement failed: a native unload that fails on the way out of a failed
        # Benchmark Run would replace the one message worth reading.
        with suppress(Exception):
            ready.model.unload()
        raise
    ready.model.unload()

    return Benchmark(
        model=ready.identity,
        workload=workload,
        providers=ready.providers,
        load=ready.load,
        runs=runs,
    )


def _run(model: VisionModel, workload: Workload, clock: Clock) -> BenchmarkRun:
    raw, inference = timed(clock, lambda: model.observe(workload))
    return BenchmarkRun(
        inference=inference,
        completion_tokens=raw.completion_tokens,
        finish_reason=raw.finish_reason,
    )
