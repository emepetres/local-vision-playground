# Development

## Running the checks

```bash
cd vision
uv run pytest       # the whole suite, no model needed
uv run mypy
uv run ruff check .
```

## What the tests do, and what they do not

The tests drive all three commands end to end through fakes: a camera, Foundry and a
clock, and then the Feed itself — which is what lets a test assert that the settling
Frames really are discarded, and that the Frame observed is the one after them rather
than the first one. A Watch needs three more. The reader that drains a held Feed is faked,
so a test can hand an Observation the Stale Frames it had to discard to reach the
present; so is the sleep between one Cadence and the next, so that the grid and the
Cadences skipped off it are asserted in full without a suite that waits in real seconds;
and so is the Operator's keyboard, as a schedule of what was typed before each Cadence,
so that steering a Watch is pinned without a thread or a race in the suite.

They do **not** prove the Foundry Local SDK behaves as we believe — the fakes encode our
reading of the 2.x type signatures. Running the command against the real model is the only
thing that validates that.

## The export toolchain

`uv sync --group convert` installs an opt-in dependency group carrying the export toolchain
and the OpenVINO runtime libraries. Nothing in `observe` / `watch` / `benchmark` imports the
toolchain, and the OpenVINO libraries are imported lazily, only when an OpenVINO Variant is
named. See [the second Runtime guide](./guide/runtimes.md) and
[`vision/tools/convert/README.md`](../vision/tools/convert/README.md).

## Repository layout

The convention — one folder per domain, named for the part of the problem it owns, with the
project manifests inside — is in [`CLAUDE.md`](../CLAUDE.md), because it is a rule anything
creating files in this repo has to follow.
