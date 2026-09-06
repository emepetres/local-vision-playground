"""How a whole report is laid out — the ``observe`` block and the ``benchmark`` table.

Rendering is kept out of the modules that measure, so that a report can be exercised
without a model, a camera or a clock: everything here takes a finished value and returns
text. Nothing in this module reads the clock or touches a stream.
"""

from __future__ import annotations

from collections.abc import Callable, Sequence
from pathlib import Path

from vision.benchmark import Benchmark, MeasuredVariant, Spread
from vision.capture import Frame
from vision.formatting import (
    format_capture,
    format_frame,
    format_model,
    format_seconds,
    format_tokens,
    format_tokens_per_second,
)
from vision.inference import Observation, Workload

OBSERVE_LABEL_WIDTH = 11
BENCHMARK_LABEL_WIDTH = 13

ORDINAL_SUFFIXES = {1: "st", 2: "nd", 3: "rd"}
"""Enough of the rule for the handful of Variants one sitting compares."""

GUTTER = "   "
"""What separates two columns of the table. Wide enough that two numbers never merge."""

_Render = Callable[[float], str]
"""How one row of the table writes its own numbers — seconds, tokens, or a rate."""


def render_observation(observation: Observation, workload: Workload, saved: Path | None) -> str:
    """The ``observe`` report, the Observation, and the limit it ran into if it hit one.

    The token limit is read off the Workload rather than off a constant: the number an
    Operator is shown is the one the Observation was actually generated under.
    """
    lines = _labelled(_observation_rows(observation, workload.frame, saved), OBSERVE_LABEL_WIDTH)
    lines += ["", observation.text]
    if observation.truncated:
        limit = workload.max_output_tokens
        lines += ["", f"(truncated: the Observation hit the {limit}-token output limit)"]
    return "\n".join(lines) + "\n"


def render_benchmark(benchmark: Benchmark) -> str:
    """A Benchmark as one block per Variant, under what every Variant shared.

    The Workload, the repetition count and the Execution Provider registration are written
    once at the top, because they are what makes the blocks below comparable and repeating
    them per Variant would invite a reader to check they matched instead of knowing it. The
    registration also has no per-Variant meaning at all — it is machine set-up paid once
    per process, and charging it to a Variant would read as the price of that Execution
    Provider.

    Each Variant then gets its own table, and every table is laid out to one set of column
    widths, so that the GPU's median sits directly above the CPU's. The model load stays
    above its table rather than in it: it is paid once per Variant, so a per-run column
    would invite it to be read as one.
    """
    total = len(benchmark.variants)
    limit = benchmark.workload.max_output_tokens
    lines = _labelled(_benchmark_rows(benchmark), BENCHMARK_LABEL_WIDTH)
    for variant, table in zip(benchmark.variants, _tables(benchmark.variants), strict=True):
        lines += ["", *_variant_block(variant, table, total=total, limit=limit)]
    return "\n".join(lines) + "\n"


def _variant_block(
    variant: MeasuredVariant, table: list[str], *, total: int, limit: int
) -> list[str]:
    """One Variant: which one it was, when it was measured, and what it cost."""
    lines = _labelled(_variant_rows(variant, total), BENCHMARK_LABEL_WIDTH)
    lines += ["", *table]
    if variant.truncated:
        lines += ["", _truncation_note(variant, limit)]
    return lines


def _variant_rows(variant: MeasuredVariant, total: int) -> list[tuple[str, str]]:
    """The resolved Variant id — the build these numbers came from — and its turn.

    The turn is written down whenever there was more than one Variant, because a Variant
    measured second was measured on a machine that had just had another model taken off
    it. A reader who suspects that mattered can reverse the order and look again; a reader
    who cannot see the order has nothing to suspect with. It sits beside the numbers it
    casts doubt on rather than in a summary line above them all.
    """
    rows = [("Model", format_model(variant.model))]
    if total > 1:
        rows.append(("Measured", f"{_ordinal(variant.order)} of {total}"))
    rows.append(("Load", format_seconds(variant.load)))
    return rows


def _ordinal(order: int) -> str:
    # Two or three Variants is what a Benchmark is for; the general rule is not worth
    # writing until something asks for it.
    return f"{order}{ORDINAL_SUFFIXES.get(order, 'th')}"


def _observation_rows(
    observation: Observation, frame: Frame, saved: Path | None
) -> list[tuple[str, str]]:
    timings = observation.timings
    rows = [
        ("Model", format_model(observation.model)),
        ("Frame", format_frame(frame)),
    ]
    if saved is not None:
        rows.append(("Saved", str(saved)))
    rows += [
        ("Providers", format_seconds(timings.providers)),
        ("Load", format_seconds(timings.load)),
        ("Capture", format_capture(timings.capture, frame)),
        ("Inference", format_seconds(timings.inference)),
    ]
    return rows


def _benchmark_rows(benchmark: Benchmark) -> list[tuple[str, str]]:
    """What every Variant below shared: the Workload, and the set-up in front of it.

    The prompt and the limits are named because they are the Workload — two Benchmarks are
    only comparable when those match, and a reader who cannot see them cannot check.
    """
    workload = benchmark.workload
    return [
        ("Frame", format_frame(workload.frame)),
        ("Prompt", workload.prompt),
        (
            "Limits",
            f"at most {workload.max_output_tokens} tokens, temperature {workload.temperature}",
        ),
        ("Providers", format_seconds(benchmark.providers)),
        ("Repetitions", _repetitions(benchmark)),
    ]


def _repetitions(benchmark: Benchmark) -> str:
    """How many Benchmark Runs each Variant took, and which of them the statistics cover."""
    each = " per Variant" if len(benchmark.variants) > 1 else ""
    steady = benchmark.repetitions - 1
    if steady == 0:
        return f"1{each} — a cold model, and no steady state to summarise"
    return (
        f"{benchmark.repetitions}{each} — the first reported apart,"
        f" the median, minimum and maximum taken over the other {steady}"
    )


def _tables(variants: Sequence[MeasuredVariant]) -> list[list[str]]:
    """Every Variant's table, laid out to one set of column widths.

    Independently aligned tables cannot be read against each other, and reading them
    against each other is the only reason to measure two Variants in one sitting. Every
    Variant took the same number of Benchmark Runs, so they share their headers too.
    """
    headers = _headers(variants[0])
    grids = [_cells(variant) for variant in variants]
    widths = [
        max(len(header), *(len(cells[column]) for grid in grids for _, cells in grid))
        for column, header in enumerate(headers)
    ]
    label_width = max(len(label) for label, _ in grids[0])
    return [_aligned(label_width, headers, widths, grid) for grid in grids]


def _headers(variant: MeasuredVariant) -> list[str]:
    """One column for the cold repetition, and three for the steady state if there is one."""
    if variant.inference is None:
        return ["First"]
    return ["First", "Median", "Min", "Max"]


def _cells(variant: MeasuredVariant) -> list[tuple[str, list[str]]]:
    """One labelled row of figures per measured quantity.

    Each row carries its own label and its own way of writing a number, because those two
    only make sense together: a row relabelled without its renderer would put seconds under
    Tokens. And each is summarised on its own terms rather than by following the median run
    across — the fastest repetition is not necessarily the one that generated the most
    tokens per second, and pretending otherwise would put a rate next to a latency it was
    never computed from.
    """
    rows: list[tuple[str, _Render, float, Spread | None]] = [
        ("Inference", format_seconds, variant.first.inference, variant.inference),
        (
            "Tokens",
            format_tokens,
            float(variant.first.completion_tokens),
            variant.completion_tokens,
        ),
        (
            "Tokens/second",
            format_tokens_per_second,
            variant.first.tokens_per_second,
            variant.tokens_per_second,
        ),
    ]
    return [
        (label, [render(first), *_spread_cells(render, spread)])
        for label, render, first, spread in rows
    ]


def _spread_cells(render: _Render, spread: Spread | None) -> list[str]:
    if spread is None:
        return []
    return [render(spread.median), render(spread.minimum), render(spread.maximum)]


def _aligned(
    label_width: int, headers: list[str], widths: list[int], rows: list[tuple[str, list[str]]]
) -> list[str]:
    """Write the header row and one labelled row per quantity, to the widths given."""
    lines = [_row(" " * label_width, headers, widths)]
    lines += [_row(label.ljust(label_width), cells, widths) for label, cells in rows]
    return lines


def _row(label: str, cells: list[str], widths: list[int]) -> str:
    return (
        label
        + GUTTER
        + GUTTER.join(cell.rjust(width) for cell, width in zip(cells, widths, strict=True))
    )


def _truncation_note(variant: MeasuredVariant, limit: int) -> str:
    """Say when the output limit, rather than the model, decided how much work was done.

    A truncated Benchmark Run generated exactly the limit, so its tokens per second is a
    property of the limit as much as of the hardware. The note sits under the Variant it
    is about: two Variants do not truncate the same number of times, and a note floated to
    the bottom of the report would leave a reader guessing which one it accused.
    """
    return (
        f"({variant.truncated} of {len(variant.runs)} Benchmark Runs hit the"
        f" {limit}-token output limit, so the limit decided how much text they generated)"
    )


def _labelled(rows: list[tuple[str, str]], width: int) -> list[str]:
    return [f"{label:<{width}}{value}" for label, value in rows]
