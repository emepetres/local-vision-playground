# Local Vision Playground

A demo and teaching playground for multimodal vision running entirely on your own machine,
with no cloud. [Foundry Local](https://learn.microsoft.com/en-us/azure/foundry-local/) serves
a local vision-language model on ONNX Runtime; a camera feed is turned into observations;
those observations drive an agent written in C# with Microsoft Agent Framework.

The point is not that it works — it is what it _feels like_: how fast local inference
actually is, what it costs on different hardware, and where the line sits between what a
local model can do and what still wants the cloud. Why that matters outside a demo — a
production-line workstation whose camera films workers, on a plant network with no way out,
watched all shift — is argued in [`docs/business-value.md`](./docs/business-value.md).

## What we learned

- **The integrated GPU is the throughput winner; the NPU is not.** On the demo laptop the
  Arc iGPU sustains 56 tok/s against the NPU's 21.8. The NPU's case is time-to-first-token
  and warm start, not peak throughput. → [the numbers](#the-numbers)
- **Foundry Local's catalogue here serves vision on the CPU only.** No GPU build, no NPU
  build — so the machine's own accelerators are reached through a second runtime, OpenVINO
  GenAI. → [`docs/stack.md`](./docs/stack.md), Constraint 3
- **The NPU's quantisation recipe buys the accelerator, not the accuracy.** Both runtimes
  run INT4, but the OpenVINO export is quantised channel-wise, the shape the NPU wants, and
  the same 2B model degrades into repetition under it, while Foundry Local's block-wise INT4
  build answers cleanly. → [the INT4 note](./docs/research/2026-09-25-int4-quantisation.md)
- **A published model variant can simply be broken**, and no caller can fix it — only the
  publisher, as Foundry Local did five days later with a new version — which is
  why pinning a variant by hand is the lever the whole demo rests on.
  → [`docs/stack.md`](./docs/stack.md)
- **This model never honours a forced tool call with an image** — 0 of 11 trials — so a
  fixed-shape answer has to be asked for in the prompt and parsed back.
  → [the spike](./docs/research/2026-09-15-forced-tool-call-with-image.md)

## The numbers

The same image, the same prompt, five times each, on an ASUS Zenbook S14 (Intel Core Ultra 7
258V). Read the runtime column, not just the hardware — the two CPU rows are the same silicon
reached two ways, which is the calibration between them:

| Hardware | Runtime        | Median inference | Tokens/second |
| -------- | -------------- | ---------------: | ------------: |
| CPU      | Foundry Local  |           7.97 s |          11.5 |
| CPU      | OpenVINO GenAI |           4.61 s |          27.8 |
| Arc iGPU | OpenVINO GenAI |           2.29 s |      **56.0** |
| NPU      | OpenVINO GenAI |           5.89 s |          21.8 |

Every row is INT4, but the OpenVINO rows run a coarser recipe that loops to the token limit,
so they did not do the same amount of work as the Foundry Local row: tokens/second is the figure that survives that, and latency is not a
hardware comparison here. The full record is in
[`docs/benchmarks/`](./docs/benchmarks/asus-zenbook-s14-intel-core-ultra-7-258v-20260922-090814.md),
and how to take your own is in [the benchmark guide](./docs/guide/benchmark.md).

## Quick start

You need [Foundry Local](https://learn.microsoft.com/en-us/azure/foundry-local/) with a
vision-language model available (`foundry model list` — look for a `vision-language-chat`
task; this project builds on `qwen3-vl-2b-instruct`), Python managed with
[uv](https://docs.astral.sh/uv/), and a camera. Without a camera everything still works
except `watch`: pass `--image <path>` instead. The C# agent, when it lands, needs .NET.

**One look at what the camera sees**, with what each stage cost:

```bash
cd vision
uv run observe
```

```
Model      qwen3-vl-2b-instruct-generic-cpu:2 (alias qwen3-vl-2b-instruct, CPU / CPUExecutionProvider)
Frame      640x480 jpeg, fit to 640x480, from camera 0
Providers  4.138 s
Load       3.251 s
Capture    5.125 s (including 5 Frames discarded while the Feed settled)
Inference  1.201 s

A man with a beard is sitting in a room in front of a wooden bookshelf filled with books
and model rockets. A white door is open behind him, and a blue mesh chair is behind him.
```

**Ask it something instead**, or ask for a list of objects rather than a description:

```bash
uv run observe --ask "is anyone looking at the camera?"
uv run observe --structured
```

**Keep looking**, once every two seconds, until you stop it — and type a new question at it
while it runs, without stopping it:

```bash
uv run watch
```

That ran on the CPU. To reach the integrated GPU and the NPU there is one preparation step
first — a model export of about 1.7 GB — and then it is the same commands with the hardware
named: → [Reaching the NPU and the Arc GPU](./docs/guide/runtimes.md).

## Map of the project

**Start here**

- [`docs/business-value.md`](./docs/business-value.md) — the anchor scenario, which value
  levers this demo claims and which it deliberately does not.
- [`docs/stack.md`](./docs/stack.md) — the Microsoft stack it is built on and the
  constraints that shaped everything, each dated and verified.

**Guides — one per thing you can run**

- [`observe`](./docs/guide/observe.md) — one look at one image, and what each stage cost.
- [`--structured`](./docs/guide/structured.md) — the list of objects present, instead of prose.
- [`watch`](./docs/guide/watch.md) — a continuous series, a cadence, and what a machine that
  cannot keep up looks like.
- [`benchmark`](./docs/guide/benchmark.md) — the same fixed workload across hardware, written
  down so the numbers outlive the demo.
- [Reaching the NPU and the Arc GPU](./docs/guide/runtimes.md) — the second runtime, and how
  to name the hardware you want.
- [`vision/tools/convert/README.md`](./vision/tools/convert/README.md) — exporting the model
  to an OpenVINO IR: prerequisites, the recipe, and the trap it defends against.
- [`agent`](./docs/guide/agent.md) — running the Agent next to the Watch: Triggers,
  Incidents, and the safety net when the model does not act.

**Why it is the way it is — the decisions**

- [ADR-0001](./docs/adr/0001-qwen3-vl-as-the-local-vision-model.md) — Qwen3-VL is the local
  vision model, not Phi-4-multimodal.
- [ADR-0002](./docs/adr/0002-custom-ichatclient-adapter-for-foundry-local.md) — the C# agent
  needs a hand-written `IChatClient` adapter; there is no first-party bridge.
- [ADR-0003](./docs/adr/0003-the-agent-consumes-observations-not-images.md) — the agent
  consumes observations, never images.
- [ADR-0004](./docs/adr/0004-target-foundry-local-2x-in-process.md) — target Foundry Local
  2.x in-process, not the 1.x API every quickstart shows.
- [ADR-0005](./docs/adr/0005-the-workload-crosses-the-model-port.md) — the workload is what
  crosses the model port.
- [ADR-0006](./docs/adr/0006-a-watch-discards-it-never-queues.md) — a watch discards, it
  never queues.
- [ADR-0007](./docs/adr/0007-a-variant-that-will-not-load-is-a-row.md) — a variant that will
  not load is a row in the table, not a crash.
- [ADR-0008](./docs/adr/0008-a-benchmark-is-two-files-written-together.md) — a benchmark is
  two files written together, JSON and Markdown.
- [ADR-0009](./docs/adr/0009-a-scene-question-changes-what-a-watch-asks.md) — a question
  changes what a watch asks; it does not interrupt it.
- [ADR-0010](./docs/adr/0010-composing-a-scene-question-suspends-the-watch.md) — composing a
  question suspends the watch.
- [ADR-0011](./docs/adr/0011-a-structured-observation-is-obtained-by-tool-calling.md) — how a
  fixed-shape answer is obtained, and why the original mechanism did not survive contact.
- [ADR-0012](./docs/adr/0012-two-runtimes-foundry-local-is-not-the-only-source.md) — there
  are two runtimes; Foundry Local is not the only source.
- [ADR-0013](./docs/adr/0013-the-second-runtime-is-an-adapter-behind-an-unchanged-model-port.md)
  — the second runtime is an adapter behind an unchanged model port.
- [ADR-0014](./docs/adr/0014-observations-cross-as-a-json-lines-file.md) — observations
  cross to the agent as a JSON Lines file, not an endpoint.

**What was verified, and when**

- [2026-09-05 — stack verification](./docs/research/2026-09-05-stack-verification.md)
- [2026-09-15 — forcing a tool call with an image](./docs/research/2026-09-15-forced-tool-call-with-image.md)
- [2026-09-22 — value scenarios for local multimodal vision](./docs/research/2026-09-22-local-multimodal-vision-value-scenarios.md)
- [2026-09-23 — Intel NPU edge devices](./docs/research/2026-09-23-intel-npu-edge-devices.md)
- [2026-09-24 — can the 2B model see the Work Cell?](./docs/research/2026-09-24-work-cell-spike.md)
- [2026-09-24 — which Scene Questions the 4B model can answer on the Work Cell](./docs/research/2026-09-24-d2-scene-questions.md)
- [2026-09-25 — both runtimes run INT4; the recipe is what differs](./docs/research/2026-09-25-int4-quantisation.md)

**What was measured**

- [ASUS Zenbook S14, Intel Core Ultra 7 258V](./docs/benchmarks/asus-zenbook-s14-intel-core-ultra-7-258v-20260922-090814.md)
  — four rows across two runtimes.
- [RTX 4090 + i7-13700KF](./docs/benchmarks/rtx-4090-i7-13700kf-20260907-170005.md) — GPU
  against CPU on a desktop.

**Where it is going**

- [`docs/backlog.md`](./docs/backlog.md) — the thread of the demo, item by item: what is
  built, what is next, and what is written down but not promised.

**Working on it**

- [`docs/development.md`](./docs/development.md) — running the checks, and what the tests
  prove and do not prove.
- [`CONTEXT.md`](./CONTEXT.md) — the vocabulary, when you want the precise word: Feed,
  Frame, Observation, Variant, Cadence, Execution Provider, Workload.
- [`CLAUDE.md`](./CLAUDE.md) — the house rules, including the repository layout convention.
- [`docs/agents/`](./docs/agents/) — how issues, triage labels and the domain docs are
  handled.
