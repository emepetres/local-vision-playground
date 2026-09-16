# A Structured Observation is obtained by tool-calling

> **Update — 2026-09-15: the mechanism below was verified against the real runtime and does
> not hold; the adapter takes the named fall-back instead.** The spike this ADR called for
> (issue [#30], written up in
> [docs/research/2026-09-15-forced-tool-call-with-image.md](../research/2026-09-15-forced-tool-call-with-image.md))
> forced a tool call with an image on `qwen3-vl-2b-instruct` and got **no native tool call in
> 11/11 trials** — the model returns text imitating a tool call, and ignores the tool's JSON
> schema. So a Structured Observation is obtained by the fall-back this ADR already named:
> **ask for the fixed shape as JSON in the prompt and parse it.** That path returned the exact
> `{name, count}` shape in every one of 22 replies. Crucially, everything below survives the
> switch unchanged — the sibling types, the model port, the rendering, and the stance that a
> failure to produce a shape is an ordinary "no shape" outcome. Only what the adapter does
> *internally* moves from `add_tool_definition` + forced `tool_choice` to prompt-and-parse.
> The rest of this record is kept as the reasoning that led to the spike.
>
> [#30]: https://github.com/emepetres/local-vision-playground/issues/30

A Structured Observation asks the model for a fixed shape — a list of the objects present in
a Frame, each with a count — rather than prose. The obvious way to pin a shape is a
response-format constraint, and Foundry Local's SDK has none: `SearchOptions` carries only
sampling parameters and `RequestOptions` only `tool_choice`. What the SDK does offer is tool
definitions — `add_tool_definition(name, description, json_schema)` with forced
`tool_choice`. So a Structured Observation defines a single tool whose JSON schema *is* the
fixed shape, forces the model to call it, and reads the tool call's arguments as the
Observation. A future reader who reaches for `response_format` and finds a tool instead
should know it was the only lever the runtime gave us, not a preference for function calling.

The arguments are copied out inside the response scope, exactly as the prose path copies
text, so nothing outlives the native response (ADR-0004). The request carries no free-text
Scene Question: the shape is fixed by the adapter, and the Workload that crosses the model
port (ADR-0005) carries the Frame and the generation limits without a prompt.

**A failure to produce a shape is an ordinary outcome, not a fall-back and not a crash.**
When the model declines the tool, answers in prose, or returns arguments that do not
validate against the schema, that is a defined "no shape" result carrying its reason — the
same stance ADR-0007 takes for a Variant that will not load. It does not raise, and it does
not silently degrade to a prose Observation: a Watch or a Benchmark that quietly mixed shapes
would report a comparison it cannot vouch for.

## Considered Options

- **A response-format / JSON-schema constraint on the request.** Rejected because the SDK
  exposes none; there is nothing to set.
- **Ask for JSON in the prompt and parse it.** The fall-back, not the default: it puts no
  shape on the wire and relies on the model volunteering valid JSON, so malformed answers are
  common and the "fixed shape" is a hope. It remains the named contingency if a small local
  VLM proves unable to honour a forced tool call with an image — a real risk, unverified on
  `qwen3-vl-2b-instruct` at the time of writing, and **since confirmed to be the case** (see
  the 2026-09-15 update at the top) — and it reaches the same sibling types, so every other
  decision survives the switch. The spike also found the model's own failure mode: it returns
  the JSON in a markdown code fence and over-enumerates, so the parser must strip the fence
  and treat a truncated array as a "no shape" outcome.
- **Degrade a non-compliant structured request to a prose Observation.** Rejected: it hides
  the failure and lets a Benchmark or a Watch mix shapes without the Operator knowing.

## Consequences

Token accounting in structured mode — completion tokens, truncation, Token Divergence — is
measured over the tool call's arguments rather than over prose. The Structured Observation is
a sibling type to the prose Observation rather than an overloaded one, so neither shape's
fields have to become optional to accommodate the other, and the model port gains a sibling
method whose single return type suits the strict-typing house style.
