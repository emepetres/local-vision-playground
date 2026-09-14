"""How a whole report is laid out — the ``observe`` block, the ``benchmark`` table, and
the append-only series a ``watch`` writes.

Rendering is kept out of the modules that measure, so that a report can be exercised
without a model, a camera or a clock: everything here takes a finished value and returns
text. Nothing in this module reads the clock or prints anything — a Watch, which prints
as it goes, is handed each finished Observation and asks for its line here.

A Benchmark is laid out twice: once for the terminal an Operator is watching, and once as
the Markdown that is persisted beside the record. They are two renderings rather than two
reports — every number and every caveat in one comes from the same value and the same
sentence as in the other, because a file that disagreed with the terminal it came from
would be worse than having no file at all.
"""

from __future__ import annotations

from collections.abc import Callable, Sequence
from datetime import datetime
from pathlib import Path

from vision.benchmark import (
    Benchmark,
    MeasuredVariant,
    Spread,
    TokenDivergence,
    UnmeasuredVariant,
)
from vision.capture import Frame
from vision.formatting import (
    format_capture,
    format_frame,
    format_model,
    format_seconds,
    format_tokens,
    format_tokens_per_second,
)
from vision.inference import PROMPT, Observation, Workload
from vision.watch import (
    FailedInference,
    Produced,
    Shortfall,
    Watch,
    WatchedObservation,
    WatchStart,
)

OBSERVE_LABEL_WIDTH = 11
BENCHMARK_LABEL_WIDTH = 13
WATCH_LABEL_WIDTH = OBSERVE_LABEL_WIDTH
"""The Watch header is laid out to the ``observe`` block's label column, deliberately.

They report the same facts about the same run-up — the Variant, the Feed, the set-up and
the load — and an Operator moving between the two commands should be reading one shape.
"""

ORDINAL_SUFFIXES = {1: "st", 2: "nd", 3: "rd"}
"""Enough of the rule for the handful of Variants one sitting compares."""

GUTTER = "   "
"""What separates two columns of the table. Wide enough that two numbers never merge."""

MARKDOWN_COLUMNS = (
    "Variant",
    "Runs on",
    "Turn",
    "Load",
    "First",
    "Median",
    "Min",
    "Max",
    "Tokens",
    "Tokens/second",
)
"""The persisted table's columns: one row per Variant, so the sitting reads as one table."""

MISSING = "—"
"""What a cell holds where there is no number — never a zero, which would be a claim."""

MARKDOWN_LEGEND = (
    "First is the cold Benchmark Run; Median, Min and Max are the inference seconds over"
    " the repetitions after it, and Tokens and Tokens/second are medians over those same"
    " repetitions — over the cold one where it is the only one there was. Every Benchmark"
    " Run is in the JSON beside this file."
)
"""What the columns mean, said once under the table rather than crammed into headers."""

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
        limit = _output_limit(workload.max_output_tokens)
        lines += ["", f"(truncated: the Observation hit {limit})"]
    return "\n".join(lines) + "\n"


def render_watch_header(start: WatchStart) -> str:
    """What a Watch was asked for and what it paid to begin, written once above the series.

    The settling wait and the Frames it discarded are here rather than on any Observation's
    line: they were paid once, when the Feed was opened, and together they are the whole of
    the delay before the first Observation arrives. An Operator not told about them reads
    that wait as the model being slow. The discards are also not Stale Frames — the same
    read, a different fact (CONTEXT.md, "Stale Frame") — which is why nothing else in this
    report says "discarded" without saying what was discarded and when.
    """
    rows = [
        ("Model", format_model(start.model)),
        ("Cadence", _cadence(start.cadence)),
        ("Feed", _settled(start)),
        ("Providers", format_seconds(start.providers)),
        ("Load", format_seconds(start.load)),
    ]
    return "\n".join(_labelled(rows, WATCH_LABEL_WIDTH)) + "\n"


def render_watch_line(produced: Produced) -> str:
    """What one Cadence of a Watch came to, whichever of the two things it came to.

    One entry point because both are written down in the order the Watch reached them: an
    Operator following a column of Observations reads the turn numbers, and a failure
    reported anywhere else would leave a gap in them with nothing to explain it.

    It is also where a changed Scene Question is echoed, because the echo belongs above the
    first answer to it and this is the one place that knows where that is: an announcement
    written from anywhere else would race the series it is about (ADR-0009).
    """
    body = (
        render_watch_failure(produced)
        if isinstance(produced, FailedInference)
        else render_watch_observation(produced)
    )
    return render_question_changed(produced.changed_question) + body


def render_watch_failure(failed: FailedInference) -> str:
    """A Cadence the model did not answer at: its turn, and the reason, and no more.

    One line rather than a block, because there is no Observation under it — and no advice
    about what to do, because there is nothing to do: the Watch has already gone on to the
    next Cadence by the time this is read, and a line telling an Operator so on every
    failure would be furniture.

    What it cost to reach this Cadence is said here on the terms it is said on an
    Observation's line: the instants were passed and the Stale Frames were discarded before
    the model was asked, so they are as true of a Cadence that failed as of one that did
    not, and leaving them out would have a Watch under-report the shortfall precisely where
    it was worst.
    """
    clauses = [f"failed — {failed.reason}"]
    if failed.shortfall.late:
        clauses.append(_lateness(failed.shortfall))
    return f"\n#{failed.order}  {', '.join(clauses)}\n"


def render_watch_observation(observed: WatchedObservation) -> str:
    """One Observation of a Watch: a short line of facts, and then what the model said.

    Append-only, and one block per Observation rather than a panel redrawn in place: a
    panel loses the history an audience is following and breaks the moment the output is
    redirected. The line leads with the Observation's turn, so that a series an audience
    has been watching for a minute can still be counted.
    """
    return f"\n#{observed.order}  {', '.join(_observation_clauses(observed))}\n{observed.text}\n"


def render_question_changed(question: str | None) -> str:
    """The Scene Question a Watch has just been steered onto, said once, above the answers.

    Above rather than beside, because what follows it is a run of Observations all
    answering it and an Operator scrolling back wants the sentence that explains the
    column. Said on the way back to the plain description too — a recording of the talk
    should show every time the Watch changed what it asked, and stopping asking is such a
    time (ADR-0009). The default prompt is named for what it is rather than quoted, because
    it is not something the Operator typed.

    Nothing at all where the question did not change at this Cadence, which is nearly every
    Cadence: the question stands until it is replaced, and repeating it on every line would
    bury the one line that changes.
    """
    if question is None:
        return ""
    asking = "for a plain description" if question == PROMPT else question
    return f"\nAsking: {asking}\n"


def render_watch_summary(watch: Watch) -> str:
    """How many Observations a Watch produced and the inference it sustained.

    The lesson the Operator leaves with, which is why it is a sentence rather than a table:
    the rate this machine actually managed. A Watch that produced nothing has no median to
    report, and says that rather than writing a zero that would read as an instant answer.

    The skipped Cadences are the other half of that rate, and they are here in total
    because a total is the one thing the per-Observation lines cannot be read as: a Watch
    left running through a demo has scrolled by the time it ends. A Watch that kept its
    Cadence says nothing about them — a "0 Cadences skipped" on every timely run would
    make the number furniture rather than news. The failed Observations are here on the
    same terms, and for the further reason that they are what the median is *not* over:
    a Watch that reported six Observations having attempted ten would be overstating the
    rate it sustained.

    Printed whatever ended the Watch, a Feed that died included: the Observations that were
    produced are not lost with the failure, and why the Watch ended is said beside this
    rather than in place of it.
    """
    median = watch.median_inference
    if median is None:
        return f"\n{_nothing_produced(watch)}\n"
    sentence = (
        f"{_counted(len(watch.observations), 'Observation')},"
        f" median inference {format_seconds(median)}"
    )
    if watch.skipped_cadences:
        sentence += f", {_counted(watch.skipped_cadences, 'Cadence')} skipped"
    if watch.failures:
        sentence += f", {len(watch.failures)} failed"
    return f"\n{sentence}\n"


def _nothing_produced(watch: Watch) -> str:
    """A Watch with no median to report, saying which of the two nothings it is.

    A zero would read as an instant answer, and "the Watch ended before the model produced
    one" would be true of a Watch whose every inference failed while saying nothing about
    the reasons standing above it.
    """
    if watch.failures:
        return f"No Observations — {len(watch.failures)} failed"
    return "No Observations — the Watch ended before the model produced one"


def _observation_clauses(observed: WatchedObservation) -> list[str]:
    """What is worth saying about one Observation beyond the text it produced.

    The inference always, and then only what actually happened: an Observation that hit the
    output limit generated exactly that limit rather than what the model had to say, and a
    Frame that was kept is worth nothing to an Operator who is not told where it went. A
    line that carried empty clauses for the ordinary case would be a line nobody reads.
    """
    clauses = [f"inference {format_seconds(observed.inference)}"]
    if observed.truncated:
        clauses.append(f"truncated — it hit {_output_limit(observed.max_output_tokens)}")
    if observed.shortfall.late:
        clauses.append(_lateness(observed.shortfall))
    if observed.saved is not None:
        clauses.append(f"saved {observed.saved}")
    return clauses


def _lateness(shortfall: Shortfall) -> str:
    """What a Cadence that could not be reached on time cost, as two counts.

    Said here rather than in the summary, and only on the line it happened on: the whole
    point of counting a shortfall instead of averaging it is that an Operator can see
    *when* the machine fell behind (ADR-0006). Both numbers are named because they are
    different losses — the skipped Cadences are Observations that will never exist, the
    Stale Frames are images nobody looked at — and a line reporting one of them would
    leave the other looking like the same fact under another name.

    "Stale Frames" rather than "discarded Frames", because the Feed also discarded Frames
    while it settled and that is reported once, at the top, about the camera rather than
    about the model (CONTEXT.md, "Stale Frame").
    """
    return (
        f"late — skipped {_counted(shortfall.skipped_cadences, 'Cadence')} and discarded"
        f" {_counted(shortfall.stale_frames, 'Stale Frame')} to observe the present"
    )


def _cadence(seconds: float) -> str:
    """The Cadence as the request it is. Zero is a request too, and it has words of its own."""
    if seconds <= 0:
        return "as fast as the model allows"
    return f"one Observation every {format_seconds(seconds)}"


def _settled(start: WatchStart) -> str:
    """The Feed, the wait it cost to become usable, and what that wait threw away.

    The seconds lead, because they are the half of it an Operator is sitting through:
    the delay before the first Observation is this, and a header that reported only the
    count would leave them reading that delay as the model being slow.
    """
    discarded = _counted(start.settling_discards, "Frame")
    return f"{start.provenance}, settled in {format_seconds(start.settling)}, {discarded} discarded"


def _output_limit(limit: int) -> str:
    """The output limit in the one phrase every report names it by.

    Three reports name it — the ``observe`` block, a Watch's line and a Benchmark's
    truncation note — and each of them is telling an Operator the same thing: this text
    stopped where the limit was, not where the model had finished. Written once so that
    reading two of them side by side is not an exercise in deciding whether they agree.
    """
    return f"the {limit}-token output limit"


def _counted(count: int, noun: str) -> str:
    """N of something, in the singular where there is one of them."""
    return f"{count} {noun}" if count == 1 else f"{count} {noun}s"


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

    A Variant that never got onto the hardware gets a block too, in the turn it would have
    taken, saying so. The divergence warning is last because it is the only thing here that
    is about two blocks at once, and a note about a comparison has to sit below the things
    being compared.
    """
    total = len(benchmark.variants)
    limit = benchmark.workload.max_output_tokens
    lines = _labelled(_benchmark_rows(benchmark), BENCHMARK_LABEL_WIDTH)
    tables = _tables(benchmark.measured)
    for variant in benchmark.variants:
        lines += ["", *_variant_block(variant, tables, total=total, limit=limit)]
    if benchmark.divergence is not None:
        lines += ["", _divergence_note(benchmark.divergence)]
    return "\n".join(lines) + "\n"


def render_recorded(*, record: Path, document: Path) -> str:
    """Say where the Benchmark was written down, under the table it was written from.

    Laid out to the same label column as the rows above it, because it is one more fact
    about the sitting — and an Operator who is not told where the file went has to go and
    look for it.
    """
    rows = [("Recorded", str(record)), ("", str(document))]
    return "\n" + "\n".join(_labelled(rows, BENCHMARK_LABEL_WIDTH)) + "\n"


def render_benchmark_markdown(benchmark: Benchmark, *, profile: str, at: datetime) -> str:
    """A Benchmark as a document: one table over every Variant, and what each one said.

    Where the terminal gives each Variant its own table and relies on shared column widths
    to be read against each other, Markdown can put them in one table — which is what the
    sitting was for. The cost is that each Variant's spread has to fit one row, so the
    table carries the inference spread and the medians of the other two quantities; every
    Benchmark Run is in the JSON beside it, in full.

    The Hardware Profile is the title. A file whose name says which machine it came from
    and whose first line did not would have a reader checking that the two matched.
    """
    lines = [
        f"# Benchmark — {profile}",
        "",
        *_markdown_facts(benchmark, at),
        "",
        *_markdown_table(benchmark),
    ]
    notes = _markdown_notes(benchmark)
    if notes:
        lines += ["", *notes]
    observations = _markdown_observations(benchmark)
    if observations:
        lines += ["", *observations]
    return "\n".join(lines) + "\n"


def _variant_block(
    variant: MeasuredVariant | UnmeasuredVariant,
    tables: dict[int, list[str]],
    *,
    total: int,
    limit: int,
) -> list[str]:
    """One Variant: which one it was, when it was measured, and what it cost."""
    if isinstance(variant, UnmeasuredVariant):
        return _labelled(_unmeasured_rows(variant, total), BENCHMARK_LABEL_WIDTH)
    lines = _labelled(_variant_rows(variant, total), BENCHMARK_LABEL_WIDTH)
    lines += ["", *tables[variant.order]]
    if variant.truncated:
        lines += ["", _truncation_note(variant, limit)]
    return lines


def _unmeasured_rows(variant: UnmeasuredVariant, total: int) -> list[tuple[str, str]]:
    """A Variant that produced no numbers, and the reason there are none to lay out.

    It says *attempted* rather than *measured*: the turn is still worth recording, because
    a Variant that would not load second was asked to load onto a machine that had just had
    another model taken off it — but calling that turn a measurement would be a lie about
    the row it labels.
    """
    rows = [("Model", format_model(variant.model))]
    if total > 1:
        rows.append(("Attempted", f"{_ordinal(variant.order)} of {total}"))
    rows.append(("Not measured", variant.reason))
    return rows


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


def _tables(variants: Sequence[MeasuredVariant]) -> dict[int, list[str]]:
    """Every measured Variant's table, laid out to one set of column widths, by its turn.

    Independently aligned tables cannot be read against each other, and reading them
    against each other is the only reason to measure two Variants in one sitting. Every
    Variant took the same number of Benchmark Runs, so they share their headers too.

    Keyed by turn rather than returned in order, because the Variants that were measured
    are not necessarily all of them: a caller walking the whole sitting has to be able to
    ask for one Variant's table without counting past the ones that have none.
    """
    if not variants:
        return {}

    headers = _headers(variants[0])
    grids = [_cells(variant) for variant in variants]
    widths = [
        max(len(header), *(len(cells[column]) for grid in grids for _, cells in grid))
        for column, header in enumerate(headers)
    ]
    label_width = max(len(label) for label, _ in grids[0])
    return {
        variant.order: _aligned(label_width, headers, widths, grid)
        for variant, grid in zip(variants, grids, strict=True)
    }


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
    return f"({_truncation_sentence(variant, limit)})"


def _truncation_sentence(variant: MeasuredVariant, limit: int) -> str:
    """The words of that note, which the persisted Markdown punctuates its own way.

    Written once and read by both renderings: a caveat that reached the file in different
    words from the terminal would leave a reader comparing the two wondering which of them
    was about a different Benchmark.
    """
    return (
        f"{variant.truncated} of {len(variant.runs)} Benchmark Runs hit"
        f" {_output_limit(limit)}, so the limit decided how much text they generated"
    )


def _divergence_note(divergence: TokenDivergence) -> str:
    """Say out loud that two Variants did different amounts of work, and what to read instead.

    A table of seconds looks like a hardware comparison whether or not it is one, and this
    is the only line in the report that can tell a reader it is not. It names both Variants
    and both figures rather than merely warning, because the Tokens rows are already there
    and a note that does not point at them leaves a reader hunting for what it meant.
    """
    return f"({_divergence_sentence(divergence)})"


def _divergence_sentence(divergence: TokenDivergence) -> str:
    """The words of the warning, so that it travels into the file in the terminal's words.

    The caveat has to reach whoever reads the persisted record months later — a table of
    seconds looks like a hardware comparison wherever it is read, and the file is where it
    will be read once the terminal has scrolled.
    """
    return (
        f"{divergence.most.variant} generated {format_tokens(divergence.most_tokens)} tokens"
        f" against {divergence.fewest.variant}'s {format_tokens(divergence.fewest_tokens)}"
        f" — {divergence.fraction:.0%} more, so these Variants did not do the same amount of"
        " work and their latencies are not a hardware comparison; Tokens/second is the"
        " figure that survives it"
    )


def _labelled(rows: list[tuple[str, str]], width: int) -> list[str]:
    return [f"{label:<{width}}{value}" for label, value in rows]


def _markdown_facts(benchmark: Benchmark, at: datetime) -> list[str]:
    """What every row of the table shares, including the instant it was all taken at.

    The same facts the terminal writes above its blocks, and one more: the Frame's bytes,
    named by their hash and their length. On screen the Frame is in front of the Operator
    and its path is enough; in a file read on another machine six months later, the path
    is a claim and the hash is what makes it checkable (ADR-0005).
    """
    frame = benchmark.workload.frame
    bytes_row = ("Frame bytes", f"sha256 {frame.digest}, {len(frame.data)} bytes")
    rows = [("Recorded", at.isoformat(sep=" ", timespec="seconds"))]
    for label, value in _benchmark_rows(benchmark):
        rows.append((label, value))
        # Keyed off the label rather than counted to, so that a header row added to the
        # terminal's block cannot silently move the hash away from the Frame it is of.
        if label == "Frame":
            rows.append(bytes_row)
    return [f"- **{label}** — {value}" for label, value in rows]


def _markdown_table(benchmark: Benchmark) -> list[str]:
    """Every Variant in one table, measured or not, in the order they were taken in."""
    total = len(benchmark.variants)
    rows = [_markdown_cells(variant, total) for variant in benchmark.variants]
    return [
        _markdown_row(MARKDOWN_COLUMNS),
        _markdown_row(["---"] * len(MARKDOWN_COLUMNS)),
        *(_markdown_row(row) for row in rows),
        "",
        MARKDOWN_LEGEND,
    ]


def _markdown_cells(variant: MeasuredVariant | UnmeasuredVariant, total: int) -> list[str]:
    """One Variant's row. A Variant that was never measured is one too (ADR-0007).

    Its numbers are written as dashes rather than as zeros or blanks: a Variant that never
    got onto the hardware did not take zero seconds, and the reason it has no numbers is
    printed under the table, where there is room for it.
    """
    identity = variant.model
    head = [
        f"`{identity.variant}`",
        identity.runtime or MISSING,
        f"{_ordinal(variant.order)} of {total}",
    ]
    if isinstance(variant, UnmeasuredVariant):
        return head + [MISSING] * 7
    return head + [
        format_seconds(variant.load),
        format_seconds(variant.first.inference),
        *_markdown_spread(format_seconds, variant.inference),
        _markdown_summary(
            format_tokens, variant.first.completion_tokens, variant.completion_tokens
        ),
        _markdown_summary(
            format_tokens_per_second, variant.first.tokens_per_second, variant.tokens_per_second
        ),
    ]


def _markdown_spread(render: _Render, spread: Spread | None) -> list[str]:
    """The median, minimum and maximum, or three dashes where there is no steady state."""
    if spread is None:
        return [MISSING] * 3
    return [render(spread.median), render(spread.minimum), render(spread.maximum)]


def _markdown_summary(render: _Render, cold: float, spread: Spread | None) -> str:
    """One quantity as one number: its steady-state median, or the cold run where there is
    no steady state to take one over.

    The same number the terminal's Tokens and Tokens/second medians are, so that a reader
    holding both does not have to work out why they differ. Where a single repetition
    leaves no median, the cold value is written rather than a dash: it is the only number
    there is, and the Inference columns beside it already say there was one repetition.
    """
    if spread is None:
        return render(cold)
    return render(spread.median)


def _markdown_row(cells: Sequence[str]) -> str:
    return f"| {' | '.join(cells)} |"


def _markdown_notes(benchmark: Benchmark) -> list[str]:
    """Everything the table could not hold: why a row is empty, and what not to quote.

    The divergence warning is here as well as in the terminal, and last, for the reason it
    is last on screen: it is the only note about two rows at once. Whoever reads this file
    months from now reads it without the terminal that carried the caveat, so the caveat
    has to travel with the numbers.
    """
    limit = benchmark.workload.max_output_tokens
    notes = [
        f"**{variant.model.variant} was not measured.** {variant.reason}"
        for variant in benchmark.variants
        if isinstance(variant, UnmeasuredVariant)
    ]
    notes += [
        f"**{variant.model.variant}:** {_truncation_sentence(variant, limit)}."
        for variant in benchmark.measured
        if variant.truncated
    ]
    if benchmark.divergence is not None:
        divergence = _divergence_sentence(benchmark.divergence)
        notes.append(f"**Not a hardware comparison.** {divergence}.")
    return _spaced(notes)


def _markdown_observations(benchmark: Benchmark) -> list[str]:
    """What each Variant said, which is the half of the comparison a table cannot show.

    Whether the CPU says the same thing as the GPU is the more interesting question once
    the latency gap turns out to be eightfold, and a table of seconds cannot be asked it.
    """
    if not benchmark.measured:
        return []
    lines = ["## What each Variant saw"]
    for variant in benchmark.measured:
        lines += ["", f"**{variant.model.variant}**", "", *_quoted(variant.observation)]
    return lines


def _quoted(text: str) -> list[str]:
    """The Observation as a block quote, so that it cannot be read as this file's own prose."""
    return [f"> {line}" if line else ">" for line in text.splitlines() or [""]]


def _spaced(paragraphs: list[str]) -> list[str]:
    """Blank-line-separated paragraphs, which is the only way Markdown keeps them apart."""
    spaced: list[str] = []
    for paragraph in paragraphs:
        if spaced:
            spaced.append("")
        spaced.append(paragraph)
    return spaced
