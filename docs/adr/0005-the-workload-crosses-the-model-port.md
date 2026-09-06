# The Workload crosses the model port

`VisionModel.observe` took a Frame and a prompt, and the rest of what makes one Observation
comparable to another — the token limit and the temperature — was fixed inside the Foundry
Local implementation, out of every caller's reach. That is survivable while one command asks
one question. It stops being survivable the moment a second caller measures the first: a
Benchmark whose token limit is set somewhere the Benchmark cannot see is a Benchmark that
cannot say what it measured. So the port now takes a **Workload** — prompt, Frame and
generation limits together — and `observe` and `benchmark` pass the same one.

The point is not tidiness. `CONTEXT.md` defines a Benchmark Run as one measured execution of
one Workload, and two Benchmark Runs as comparable only when their Workloads match. Passing
the Workload through the port is what makes that definition enforceable by the type system
rather than by a comment: there is no longer a place where one caller's generation limits can
drift from another's, because there is no longer a second place where they are written down.

## Considered Options

- **Leave the port at `(frame, prompt)` and have the benchmark set the limits itself.**
  Rejected: it puts the same two numbers in two modules and makes the divergence silent. The
  failure mode is a table that reports a CPU variant as slower than it is because it was
  quietly allowed more tokens.
- **Keep the limits as module constants and have both callers import them.** Rejected: it
  fixes the duplication but not the reach. A caller can still call `observe` with limits that
  are not the ones the constant names, and a Benchmark still has nothing it can record as
  "the Workload this actually ran".

## Consequences

**The Frame is inside the Workload, and the Workload is what gets recorded.** A persisted
Benchmark carries a hash of the Frame's bytes rather than its dimensions, because the
glossary's claim about comparability is only checkable if the exact Frame is identified.

**The fakes carry the same shape.** They encode our reading of the SDK signatures
([ADR-0004](./0004-target-foundry-local-2x-in-process.md)), so the port widening is felt in
the test doubles first — which is the point at which a mismatch is cheap to find.
