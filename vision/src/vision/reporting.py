"""How a whole report is laid out — the ``observe`` block and the ``benchmark`` table.

Rendering is kept out of the modules that measure, so that a report can be exercised
without a model, a camera or a clock: everything here takes a finished value and returns
text. Nothing in this module reads the clock or touches a stream.
"""

from __future__ import annotations

from collections.abc import Callable
from pathlib import Path

from vision.benchmark import Benchmark, Spread
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
    """A Benchmark as a table: the cold repetition apart, the steady state summarised.

    The Execution Provider registration and the model load sit above the table rather than
    in it. Neither is the cost of a Benchmark Run — registration is machine set-up paid
    once per process, and the load is paid once per Variant — and a column holding a figure
    that has no per-run meaning invites it to be read as one.
    """
    lines = _labelled(_benchmark_rows(benchmark), BENCHMARK_LABEL_WIDTH)
    lines += ["", *_table(benchmark)]
    if benchmark.truncated:
        lines += ["", _truncation_note(benchmark)]
    return "\n".join(lines) + "\n"


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
    """What the table is not: the Workload it ran, and the two one-off costs in front of it.

    The prompt and the limits are named because they are the Workload — two Benchmarks are
    only comparable when those match, and a reader who cannot see them cannot check.
    """
    workload = benchmark.workload
    return [
        ("Model", format_model(benchmark.model)),
        ("Frame", format_frame(workload.frame)),
        ("Prompt", workload.prompt),
        (
            "Limits",
            f"at most {workload.max_output_tokens} tokens, temperature {workload.temperature}",
        ),
        ("Providers", format_seconds(benchmark.providers)),
        ("Load", format_seconds(benchmark.load)),
        ("Repetitions", _repetitions(benchmark)),
    ]


def _repetitions(benchmark: Benchmark) -> str:
    steady = len(benchmark.steady)
    if steady == 0:
        return "1 — a cold model, and no steady state to summarise"
    return (
        f"{len(benchmark.runs)} — the first reported apart,"
        f" the median, minimum and maximum taken over the other {steady}"
    )


def _table(benchmark: Benchmark) -> list[str]:
    """One row per measured quantity, one column per figure.

    Each row is summarised on its own terms rather than by following the median run
    across: the fastest repetition is not necessarily the one that generated the most
    tokens per second, and pretending otherwise would put a rate next to a latency it was
    never computed from.
    """
    rows = [
        ("Inference", format_seconds, benchmark.first.inference, benchmark.inference),
        (
            "Tokens",
            format_tokens,
            float(benchmark.first.completion_tokens),
            benchmark.completion_tokens,
        ),
        (
            "Tokens/second",
            format_tokens_per_second,
            benchmark.first.tokens_per_second,
            benchmark.tokens_per_second,
        ),
    ]

    headers = ["First"] if benchmark.inference is None else ["First", "Median", "Min", "Max"]
    cells = [[render(first), *_spread_cells(render, spread)] for _, render, first, spread in rows]
    return _aligned([label for label, *_ in rows], headers, cells)


def _spread_cells(render: _Render, spread: Spread | None) -> list[str]:
    if spread is None:
        return []
    return [render(spread.median), render(spread.minimum), render(spread.maximum)]


def _aligned(labels: list[str], headers: list[str], cells: list[list[str]]) -> list[str]:
    """Lay the table out with every column as wide as the widest thing in it."""
    label_width = max(len(label) for label in labels)
    widths = [
        max(len(header), *(len(row[column]) for row in cells))
        for column, header in enumerate(headers)
    ]
    lines = [_row(" " * label_width, headers, widths)]
    lines += [
        _row(label.ljust(label_width), row, widths)
        for label, row in zip(labels, cells, strict=True)
    ]
    return lines


def _row(label: str, cells: list[str], widths: list[int]) -> str:
    return (
        label
        + GUTTER
        + GUTTER.join(cell.rjust(width) for cell, width in zip(cells, widths, strict=True))
    )


def _truncation_note(benchmark: Benchmark) -> str:
    """Say when the output limit, rather than the model, decided how much work was done.

    A truncated Benchmark Run generated exactly the limit, so its tokens per second is a
    property of the limit as much as of the hardware.
    """
    return (
        f"({benchmark.truncated} of {len(benchmark.runs)} Benchmark Runs hit the"
        f" {benchmark.workload.max_output_tokens}-token output limit, so the limit decided"
        " how much text they generated)"
    )


def _labelled(rows: list[tuple[str, str]], width: int) -> list[str]:
    return [f"{label:<{width}}{value}" for label, value in rows]
