# `--structured` — the objects present, instead of prose

A **Structured Observation** asks the model for a fixed shape — the list of objects present
in a Frame, each with a count — rather than a paragraph. It is the same Observation asked
for differently, so it is a flag on all three commands rather than a command of its own.

```bash
cd vision
uv run observe --structured
```

```
Model      qwen3-vl-2b-instruct-cuda-gpu:2 (alias qwen3-vl-2b-instruct, GPU / CUDAExecutionProvider)
Frame      640x480 jpeg, fit to 640x480, from camera 0
Providers  4.138 s
Load       3.251 s
Capture    5.125 s (including 5 Frames discarded while the Feed settled)
Inference  0.907 s

12  book
 2  cup
 1  chair
 1  door
```

The facts block is the prose Observation's, unchanged — Model, Frame, the set-up costs and
the latencies — because getting the Frame onto the hardware cost the same whichever shape
was asked of it. Only what sits below it changes: an aligned list of count and name, with
the counts right-aligned so a column of them can be read down.

## It overrides `--ask`

A Structured Observation has **no free-text Scene Question**: the request _is_ the shape. So
`--structured` overrides `--ask` rather than combining with it, and under `--structured` an
empty `--ask` is not even rejected, because it is not read.

The shape is not the Operator's to change either. It is one fixed prompt — "list every
distinct object you can see in this image, reply with ONLY a JSON array of
`{"name": <string>, "count": <integer >= 1>}`" — spelled out with a worked example, because
without one the model answers with an array of bare strings.

## What comes back is always the list or the reason there is none

Three outcomes, and **never a silent degrade to prose**
([ADR-0011](../adr/0011-a-structured-observation-is-obtained-by-tool-calling.md)):

- **The list.** What is above.
- **Nothing present.** An empty list is a success, and says so in those words rather than as
  a blank the Operator has to read as either an answer or a failure.
- **No shape.** The model answered in prose, returned JSON that was not well-formed, returned
  something that was not a list of objects, or was cut off by the output limit before the
  array closed. That is an _ordinary outcome carrying its reason_, printed where the list
  would have been:

  ```
  the model answered in prose instead of the list of objects the shape asks for
  ```

  It does not raise, and it does not fall back to a description. A Watch or a Benchmark that
  quietly mixed shapes would report a comparison it cannot vouch for.

A list that **parsed cleanly can still have been cut short** — the model closes the array and
goes on generating until the limit stops it — so a shown list that hit the limit carries a
note of its own:

```
(truncated: the list may be incomplete — the Observation hit the 128-token output limit)
```

The note is owed only where objects were actually listed: an empty list means _nothing
present_, which the note would flatly contradict, and a "no shape" already carries the limit
inside its own reason.

An array the limit cut mid-object still carries **the objects it closed before that**, so a
truncated reply is salvaged down to the last complete `{name, count}` rather than thrown
away. Only when nothing at all closed is it a "no shape".

## In a Watch

```bash
uv run watch --structured
```

Every Cadence asks for the shape. The `#N` line is the prose Watch's, unchanged — the
inference, the lateness if the Cadence was reached late, the saved path under
`--keep-frames` — and the list sits below it where the text would:

```
#1  inference 0.914 s
12  book
 2  cup

#2  inference 0.902 s, truncated — the list may be incomplete, it hit the 128-token output limit
12  book
 3  cup
 1  laptop
```

A Cadence that came to **no shape is produced, reported, and gone on from** — it is an
Observation, not a failed inference, so it counts in the series and in the median like any
other. `--structured` overrides `--ask` here too, and the keyboard still works: a question
composed while a structured Watch runs is read on the Watch's ordinary terms.

## In a Benchmark

```bash
uv run benchmark --structured
```

`--structured` fixes the shape for the **whole sitting**: every Variant is asked for the list,
so the rows stay comparable. Two structured Benchmarks are comparable only when they share
the fixed shape _as well as_ the Frame — and a structured Benchmark is not comparable with a
prose one, for the same reason two Benchmarks asked different questions are not.

Token accounting is unchanged in principle and different in substance: completion tokens,
truncation and the Token Divergence warning are all measured over **the JSON reply** rather
than over prose. A run that came to no shape is a **measured run like any other** — it was
observed and it generated tokens — not a failed one; it does not make the Variant Unmeasured.

In the persisted record, a structured Variant carries `objects` — the list as data, so a later
tool reads the objects rather than parsing them back out of a quoted paragraph — and a
no-shape run carries `no_shape` with its reason instead. The Markdown shows the same list
under _What each Variant saw_:

```
- 12 × book
- 2 × cup
```

or, where there was none:

```
_No shape — the model answered in prose instead of the list of objects the shape asks for._
```

Every Variant in one record carries the same one of those two shapes, because the shape is
the sitting's rather than the Variant's.

## Why it behaves this way

**The shape is asked for in the prompt and parsed back, not constrained on the wire.**
[ADR-0011](../adr/0011-a-structured-observation-is-obtained-by-tool-calling.md) originally
reached it by a forced tool call — the only lever Foundry Local's SDK offers, since it has no
response-format constraint. The spike behind
[issue #30](https://github.com/emepetres/local-vision-playground/issues/30), written up in
[`docs/research/2026-09-15-forced-tool-call-with-image.md`](../research/2026-09-15-forced-tool-call-with-image.md),
forced a tool call with an image on `qwen3-vl-2b-instruct` and got **no native tool call in
11 of 11 trials**: the model returns text imitating one and ignores the tool's schema. The
named fall-back — JSON in the prompt — returned the exact shape in all 22 replies, so that is
what ships. Everything else in the ADR survived the switch untouched.

**A failure to produce a shape is an ordinary outcome, not a crash and not a fall-back.**
The same stance [ADR-0007](../adr/0007-a-variant-that-will-not-load-is-a-row.md) takes for a
Variant that will not load. Degrading to prose would hide the failure and let a Benchmark or a
Watch mix shapes without the Operator knowing.

**A Structured Observation is a sibling type, not an overloaded one.** Neither shape's fields
have to become optional to accommodate the other, and the model port gains a sibling method
whose single return type suits the strict-typing house style.

**The model's own failure mode shaped the parser.** It wraps the JSON in a markdown code
fence and over-enumerates, so the parser strips the fence and treats a truncated array as
salvageable down to its last complete element.
