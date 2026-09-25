# A Variant that will not load is a row, not a crash

A Benchmark that raised on the first Variant it could not load threw away every number it
had already paid for. That is not a rare accident to be tidied up later:
`qwen3.5-0.8b-cuda-gpu:3` is published in the Foundry Local catalogue and fails to load with
an invalid-graph error that no caller can work around
([microsoft/foundry-local#1075](https://github.com/microsoft/foundry-local/issues/1075)).
An Operator who names that Variant alongside a working one has asked a question — *can this
machine run these builds, and what do they cost?* — and "no, and here is nothing else" is a
worse answer than the table.

(Foundry Local republished the Qwen3.5 models as `:4` on 2026-09-11 and that variant now
loads. The decision does not depend on it: the fix came from the publisher, never from the
caller, and the next broken build will be a row on the same terms.)

So a Variant that will not go onto the hardware becomes an **Unmeasured Variant**: a row in
the report carrying the reason, in the turn it would have taken, and the sitting carries on
to the next Variant. **The exit status follows the Benchmark, not the Variants**: zero when
at least one Variant was measured, non-zero only when none was. A partial Benchmark reported
to the shell as a failure is a script that discards the numbers that did survive.

Only *getting the Variant onto the hardware* fails softly — and both steps of that count,
the fetch as well as the load. Weights that never arrive are the same answer as a graph that
will not load, seen a moment earlier, and the Operator's lever is the same one either way,
so both are reported as a `VisionError` and both become a row.

A Benchmark Run that fails once the model is loaded still ends the Benchmark, because that
is a different fault: the Variant was measurable, and something went wrong while it was
being measured. Folding the two together would let a bug in this code be rendered as a
property of the catalogue.

## Considered Options

- **Raise on the first Variant that will not load.** Rejected: it is what the code did, and
  it makes the demo's headline comparison unrunnable the moment one half of the catalogue
  entry is broken — with nothing on screen to say which half.
- **Survive the failure but exit non-zero anyway.** Rejected: the exit status is the only
  thing a script reads. A `benchmark || exit` wrapper would then bin a complete set of CPU
  numbers because the GPU build was republished badly.
- **Survive every failure, Benchmark Runs included.** Rejected: it turns "the model returned
  something this code could not read" into a row that reads like a hardware verdict. A
  traceback is the right answer to a fault in this code.

## Consequences

**The report holds two kinds of Variant block.** `Benchmark.variants` is a union, and the
renderer walks it rather than zipping tables to Variants positionally. An Unmeasured Variant
says `Attempted` where a Measured Variant says `Measured`, so the turn is still recorded
without the row claiming a measurement it does not have.

**A Benchmark can be worth reading and still be a failure.** When nothing could be measured
the reasons are printed anyway — with no numbers to report they are the entire answer — and
the non-zero status is accompanied by a line on stderr, so a shell user who only sees stderr
is not left with an exit code and silence.

**A comparison the Benchmark cannot vouch for says so.** The same reasoning applies to two
Variants that generated materially different amounts of text: the numbers are real, the
comparison is not, and the Benchmark carries a `divergence` alongside them rather than only
printing a warning — so it travels into the persisted record instead of living in a terminal
that has since scrolled.
