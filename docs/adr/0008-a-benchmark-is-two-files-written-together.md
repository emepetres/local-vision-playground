# A Benchmark is two files, written together

A Benchmark took minutes and lived in a terminal. The sitting an Operator paid for was gone
when the process exited — and with it the answer to the question the playground exists to
raise, leaving the demo with nothing to fall back on the day the model will not download in
front of an audience.

So a Benchmark that measured something is now written down as **two files under
`docs/benchmarks/`, in one call, from the same value**: a JSON record and a Markdown
document. The JSON is everything the Benchmark knows — every Benchmark Run rather than the
spread over them, because a spread can be recomputed from the runs and the runs cannot be
recovered from a spread. The Markdown is the same Benchmark laid out for a person, in a
pull request or on a projector.

They are written together rather than by two commands because **a Markdown table that could
disagree with its own JSON is worse than either file alone**. Both renderings take their
numbers and their caveats from the same `Benchmark` and, for the caveats, from the same
sentence: the Token Divergence warning and the truncation note are written once in
`reporting` and punctuated twice.

The JSON carries a **`schema_version`**. Reading a record back and comparing two machines'
Benchmarks are deliberately not built here; the version is the whole of what keeps that door
open, by making today's files identifiable to the tool that will one day want them.

The file name is a **slug of the Hardware Profile plus a full timestamp** —
`rtx-4090-i7-13700kf-20260907-140311.json`. Two machines' records then never collide, an
Operator can tell at a glance which machine a file came from, and three Benchmarks taken
while tuning the demo on the same afternoon are three pairs of files rather than one
overwritten twice. Both files are created exclusively and the pair falls through to a `-1`
suffix if either half of the name is taken — a Benchmark that silently replaced another
one's record, or its document, would be the one failure this is all here to prevent. A name
is only claimed when both halves of it were free, and a record whose document could not be
written is taken back off disk rather than left there alone.

**The Hardware Profile is what the Operator says it is.** `--hardware "RTX 4090 +
i7-13700KF"` is what a reader six months from now needs; a hostname means nothing to them.
With none given it falls back to what the standard library reports — host, platform,
architecture, CPU count — so a Benchmark is never anonymous. Nothing probes the hardware:
there is no portable way to ask a machine what GPU it has, and a Benchmark that shelled out
to a vendor tool to find out would fail differently on every machine, for a string.

## Considered Options

- **One file.** Rejected in both directions. JSON alone cannot be read on a projector or
  reviewed in a pull request, which is half of why the record exists; Markdown alone throws
  away the per-run numbers and would have to be parsed by whatever compares two machines.
- **Write the Markdown later, from the JSON.** Rejected for now: it is a second command that
  can be forgotten, and until it exists the two files can only disagree if one of them is
  stale. Regenerating a document from an existing record stays possible — the schema version
  is what makes it possible — but it is not how the file that ships is produced.
- **Probe the machine for a real Hardware Profile.** Rejected: see above. The honest
  fallback is a name and a platform, and the honest answer is the Operator's own words.
- **Record a Benchmark in which nothing could be measured.** Rejected: a Benchmark of
  only Unmeasured Variants has nothing to report (CONTEXT.md), and a file with no numbers
  in it would sit in `docs/benchmarks/` beside the ones an Operator compares machines with.
  The reasons are still printed, where they are the whole answer.

## Consequences

**A Variant is identified by its Execution Provider and its device type separately.**
`ModelIdentity` no longer holds the one string a report prints; it holds the two facts and
composes them. *CUDA* is not *GPU*, and a later reader grouping records by Execution
Provider should not have to split a display string on a slash.

**A Benchmark Run carries its Observation.** Counting a Variant's tokens and discarding what
it said would leave the more interesting half of a comparison unanswerable the moment the
process exits — whether the CPU says the same thing as the GPU, which matters more than the
latency gap once that gap turns out to be eightfold. One Observation per Variant reaches the
files: the cold Benchmark Run's, which is the one both reports already single out.

**A Frame is identified by the SHA-256 of its bytes.** A Workload is the Frame's bytes
rather than its resolution ([ADR-0005](./0005-the-workload-crosses-the-model-port.md)), so
"the same Workload" is only a claim a reader can check if the bytes are named. The hash, the
dimensions and the byte length all travel in the record.

**The whole test suite writes its records to a temporary directory.** An autouse fixture
points the destination away from the repository, because a test that forgot would commit a
Benchmark of a fake model into `docs/benchmarks/`, where an Operator would find it beside
the real ones with no way to tell.
