# Local Vision Playground

A demo and teaching playground for multimodal vision running entirely on the Operator's
own machine, with no cloud. [Foundry Local](https://learn.microsoft.com/en-us/azure/foundry-local/)
serves a local vision-language model on ONNX Runtime; a camera Feed is turned into
Observations; those Observations drive an Agent written in C# with Microsoft Agent
Framework.

The point is not that it works — it is what it *feels like*: how fast local inference
actually is, what it costs on different hardware, and where the line sits between what a
local model can do and what still wants the cloud.

See [`CONTEXT.md`](./CONTEXT.md) for the vocabulary (Feed, Frame, Observation, Trigger,
Execution Provider…), [`docs/stack.md`](./docs/stack.md) for the Microsoft stack and its
known constraints, and [`docs/adr/`](./docs/adr/) for the decisions that shaped it.

## Layout

One folder at the root per **domain** — named for the part of the problem it owns, never
for a language or a runtime. Inside a domain sit its **code projects**.

A project folder is the project's own root: its manifest and tooling live there
(`pyproject.toml`, a `.csproj`, lockfiles, config), with `src/` as one folder inside it.

A domain folder may *be* a single project, in which case the manifest sits directly in the
domain folder. Or it may hold several projects side by side. Nothing says the projects
under one domain share a language: a domain is a boundary in the problem, not in the
toolchain.

```
vision/                 domain — turning Frames into Observations
    pyproject.toml          currently also the project root itself
    src/
agent/                  domain — deciding and acting on Observations
    Agent.csproj            likewise
    src/
docs/                   ADRs, stack notes, agent-facing docs
```

As the playground grows, a domain gains project folders rather than spilling into the
root — and the manifests move down with them:

```
vision/
    capture/                for example: a project owning the Feed
        pyproject.toml
        src/
    inference/              ... and one owning the model
        pyproject.toml
        src/
```

The two domains are separate processes. They meet at the OpenAI-compatible endpoint that
Foundry Local serves on localhost — that seam is deliberate, and it is part of what the
playground demonstrates. See [ADR-0003](./docs/adr/0003-the-agent-consumes-observations-not-images.md).

## Requirements

- **Foundry Local**, with a vision-language model available locally. Confirm with
  `foundry model list` — you are looking for a `vision-language-chat` task. The project
  builds on `qwen3-vl-2b-instruct` ([ADR-0001](./docs/adr/0001-qwen3-vl-as-the-local-vision-model.md)).
- **Python** for `vision/`, managed with [uv](https://docs.astral.sh/uv/); **.NET** for `agent/`.
- A camera. Not strictly required: every stage accepts an image file instead of a live
  Frame, so the playground can be developed and demonstrated without one.

## Running

One Observation of one Frame, printed with what each stage cost:

```bash
cd vision
uv run observe --image ../docs/fixtures/reference-frame.jpg
```

```
Model      qwen3-vl-2b-instruct-cuda-gpu:2 (alias qwen3-vl-2b-instruct, GPU / CUDAExecutionProvider)
Frame      640x360 jpeg, fit to 640x480, from ../docs/fixtures/reference-frame.jpg
Load       3.050 s
Capture    0.015 s
Inference  2.046 s

This is a view of a home office or study area. A tall, light-colored wooden bookshelf is
filled with books and various decorative items... In the foreground, a modern ergonomic
office chair with a blue mesh back is partially visible.
```

The first run downloads the model and the execution providers, and reports that time
separately — it is not one of the three latencies. Nothing is warmed up afterwards
either: the first Observation is the honest one.

`--model` takes an **alias**, letting Foundry Local pick the hardware, or a **variant
id**, which pins it — `--model qwen3-vl-2b-instruct-generic-cpu:2` runs the same workload
on the CPU. That is the only lever there is; nothing selects an Execution Provider
directly (see [`docs/stack.md`](./docs/stack.md), Constraint 3). `--debug` restores the
full traceback behind a one-line failure.

Pinning is also the answer when a model will not load at all. An alias picks the hardware,
and it can pick a variant that cannot run — `qwen3.5-0.8b-cuda-gpu:3` ships a graph ONNX
Runtime refuses to load, and no caller can fix that
([microsoft/foundry-local#1075](https://github.com/microsoft/foundry-local/issues/1075)).
`observe` says which variant failed and tells you to name another; a `-generic-cpu` one is
the safe bet.

`docs/fixtures/reference-frame.jpg` is the reference Frame — one still taken from the
camera at 1280×720 and put through the same rescale-and-encode every Frame goes through.
It is 640×360, and that is not a mistake: a 16:9 camera fits the 640×480 working
resolution at 640×360, because a Frame is **rescaled on its long edge, never cropped**.
Which is why the report names both numbers.

> **Note on the SDK.** Microsoft Learn documents the **1.x** Foundry Local API — the
> `get_chat_client()` shape every quickstart shows. This code targets **2.x** and calls
> the model in-process through `ChatSession`, with images as typed items carrying raw
> bytes and a codec hint. That is deliberate; see
> [ADR-0004](./docs/adr/0004-target-foundry-local-2x-in-process.md). A reader comparing
> this against Learn will find Learn describing a different API.

### Development

```bash
cd vision
uv run pytest       # the whole suite, no model needed
uv run mypy
uv run ruff check .
```

The tests drive the `observe` command end to end through a fake camera, a fake Foundry
and a fake clock. They do **not** prove the Foundry Local SDK behaves as we believe — the
fakes encode our reading of the 2.x type signatures. Running the command against the real
model is the only thing that validates that.

## Backlog

The high-level thread of the demo. Each item is one demonstrable feature, small enough to
show in a single sitting. Issues are opened per item as it is picked up — they are not
mirrored here.

### Committed

- [ ] **1. One Observation, on demand.** Capture a Frame from the camera (or take an
      image file), send it to the local model, print the Observation and the latency it
      took. Runs and exits.
- [ ] **2. Benchmark Runs across Execution Providers.** The same fixed workload against
      the CUDA-GPU variant and the CPU variant, N times each, printed as a table and
      persisted to the repo so the numbers survive a demo that goes wrong. Each Benchmark
      Run is named against its Hardware Profile.
- [ ] **3. A continuous Feed.** Observations in a loop over the live camera, and a
      deliberate answer to what happens when inference is slower than the capture
      interval.
- [ ] **4. Scene Questions.** Ask a natural-language question about the current Frame and
      get an answer from that Frame alone.
- [ ] **5. Structured Observations.** Ask the model for a fixed shape — the list of
      objects present in a Frame — instead of prose.
- [ ] **6. Triggers.** Fire when a condition over Observations holds: an object appears,
      a scene changes.
- [ ] **7. The Agent, in C#.** Microsoft Agent Framework consuming Observations over the
      local endpoint and invoking Actions when Triggers fire. The Agent never sees an
      image ([ADR-0003](./docs/adr/0003-the-agent-consumes-observations-not-images.md)).
- [ ] **8. NPU as a third Execution Provider.** Blocked on hardware: no vision-language
      model in the local catalogue currently ships an NPU variant, and the development
      machine has no NPU. Committed, but it needs a Copilot+ PC before it can be
      rehearsed.

### Exploratory

Written down so it is not lost. Not promised.

- [ ] **Model comparison on fixed hardware.** `qwen3-vl` at 2B / 4B / 8B, and against
      other local VLMs (`qwen3.5-*`, `ministral-3-3b`, `gemma-4-e2b`) — the variable an
      Operator can actually change on their own machine.
- [ ] **The cloud comparison.** Phi-4-reasoning-vision in Microsoft Foundry, not to run
      it as part of the demo but to make "when does local actually compensate?" concrete.
- [ ] **Live transcription.** The Live Transcription API added in Foundry Local 1.1,
      putting vision and speech on the same laptop with nothing leaving it.
- [ ] **Phi-4-multimodal, compiled by hand** for Foundry Local — the path
      [ADR-0001](./docs/adr/0001-qwen3-vl-as-the-local-vision-model.md) rejected as the
      primary route but kept as a comparison exercise.
