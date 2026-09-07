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
uv run observe
```

```
Registering Execution Providers — the first run also downloads them

Model      qwen3-vl-2b-instruct-cuda-gpu:2 (alias qwen3-vl-2b-instruct, GPU / CUDAExecutionProvider)
Frame      640x480 jpeg, fit to 640x480, from camera 0
Saved      D:\dev\local-vision-playground\vision\frames\frame-20260906-110354-829440.jpg
Providers  4.138 s
Load       3.251 s
Capture    5.125 s (including 5 Frames discarded while the Feed settled)
Inference  1.201 s

A man with a beard is sitting in a room in front of a wooden bookshelf filled with books
and model rockets. A white door is open behind him, and a blue mesh chair is behind him.
```

`--camera N` picks between cameras where the machine has more than one; `--image <path>`
takes the Frame from a file instead, and is the way to run the whole playground with no
camera at all.

A Feed does not yield a usable Frame the instant it opens — the camera exposes and
white-balances for a moment first — so **five Frames are read and discarded** before the
one that is observed. That wait is not hidden in a sleep in front of the capture: it
happens inside the capture and is counted in the Capture number, which is why that number
is the wait the Operator actually sat through, and why it dwarfs the same number for an
image file.

Every Frame the camera takes is written to `vision/frames/` (git-ignored) and its path
printed. A surprising Observation can then be explained afterwards, instead of vanishing
with the process.

The two failures a live demo actually hits each get one line and a non-zero exit: no
camera at that index — which points at `--image` — and a camera another application is
holding, which opens and then yields nothing.

The first run downloads the model, and reports that time separately — it is not one of
the latencies. Nothing is warmed up afterwards either: the first Observation is the
honest one.

**Providers** is what registering this machine's Execution Providers cost. It is timed on
its own because it is machine setup rather than part of the Observation — but it is not
optional: it is what makes a GPU variant loadable at all, and skipping it would leave a
pinned CUDA variant with nothing to load onto. Registration is per-process, so every run
pays it; only the first run on a machine also downloads the providers. That download is
why it happens *after* the model has been resolved and checked: nothing is fetched before
the model has said it can see a Frame.

By default the model is resolved by **alias**, letting Foundry Local pick the hardware.
`--variant` pins a **variant**, and with it the Execution Provider the work runs on —
`--variant qwen3-vl-2b-instruct-generic-cpu` runs the same workload on the CPU, on whatever
version the catalogue offers today, and adding `:2` pins that version too. That is the only
lever there is; nothing selects an Execution Provider directly (see
[`docs/stack.md`](./docs/stack.md), Constraint 3), which is why the Model line names the
variant that was actually resolved and what it was built for — that pair is what a Benchmark
Run is attributed to. `--debug` restores the full traceback behind a one-line failure.

Pinning is also the answer when a model will not load at all. An alias picks the hardware,
and it can pick a variant that cannot run — `qwen3.5-0.8b-cuda-gpu:3` ships a graph ONNX
Runtime refuses to load, and no caller can fix that
([microsoft/foundry-local#1075](https://github.com/microsoft/foundry-local/issues/1075)).
`observe` says which variant failed and why in one line, exits non-zero, and tells you to
name another; a `-generic-cpu` one is the safe bet.

`docs/fixtures/reference-frame.jpg` is the reference Frame — one still taken from the
camera at 1280×720 and put through the same rescale-and-encode every Frame goes through.
It is 640×360, and that is not a mistake: a 16:9 camera fits the 640×480 working
resolution at 640×360, because a Frame is **rescaled on its long edge, never cropped**.
Which is why the report names both numbers.

It does mean the fixture is not interchangeable with a Frame from a 4:3 camera: at 640×360
it carries a quarter fewer pixels, and image tokens scale with area. The working
resolution bounds the workload; it does not by itself fix it. A Benchmark Run therefore
has to hold the Frame size constant as well as the working resolution — which is what
[`CONTEXT.md`](./CONTEXT.md) already requires of a Hardware Profile comparison — and the
fixture is the right Frame to hold it at.

> **Note on the SDK.** Microsoft Learn documents the **1.x** Foundry Local API — the
> `get_chat_client()` shape every quickstart shows. This code targets **2.x** and calls
> the model in-process through `ChatSession`, with images as typed items carrying raw
> bytes and a codec hint. That is deliberate; see
> [ADR-0004](./docs/adr/0004-target-foundry-local-2x-in-process.md). A reader comparing
> this against Learn will find Learn describing a different API.

### What it costs

The same Workload against several Variants, several times each. By default the CUDA-GPU one
and the CPU one — the GPU-versus-CPU answer the demo is about, without orchestrating two
runs by hand and hoping they were measured under the same conditions:

```bash
cd vision
uv run benchmark
```

```
Frame        640x360 jpeg, fit to 640x480, from D:\dev\local-vision-playground\docs\fixtures\reference-frame.jpg
Prompt       Describe what you see in this image in two or three sentences.
Limits       at most 128 tokens, temperature 0.0
Providers    4.070 s
Repetitions  5 per Variant — the first reported apart, the median, minimum and maximum taken over the other 4

Model        qwen3-vl-2b-instruct-cuda-gpu:2 (alias qwen3-vl-2b-instruct, GPU / CUDAExecutionProvider)
Measured     1st of 2
Load         2.917 s

                  First    Median       Min       Max
Inference       1.770 s   1.382 s   1.348 s   1.481 s
Tokens               96        96        96        96
Tokens/second      54.2      69.5      64.8      71.2

Model        qwen3-vl-2b-instruct-generic-cpu:2 (alias qwen3-vl-2b-instruct, CPU / CPUExecutionProvider)
Measured     2nd of 2
Load         4.397 s

                  First    Median       Min       Max
Inference       5.037 s   5.040 s   4.970 s   5.058 s
Tokens              104       104       104       104
Tokens/second      20.6      20.6      20.6      20.9

Recorded     D:\dev\local-vision-playground\docs\benchmarks\rtx-4090-i7-13700kf-20260907-140311.json
             D:\dev\local-vision-playground\docs\benchmarks\rtx-4090-i7-13700kf-20260907-140311.md
```

Taken on the development machine (RTX 4090 + i7-13700KF) with both Variants already
downloaded. Note the two columns of Tokens differ — 96 against 104 — so this is not quite a
like-for-like comparison of the same amount of work. Tokens/second is the number to read.

The **Frame is read once** and those exact bytes go to every repetition of every Variant —
that is what makes the whole sitting comparable, and it is why the live camera is refused: a
different Frame each time is not a Workload. `--image <path>` measures a file of your own
instead of the reference Frame; `--debug` behaves as it does for `observe`.

**Variants are resolved through the catalogue**, not by a version suffix written into the
source, so the command does not break the day the catalogue publishes a new version — and
the Model line names the exact Variant id that was resolved, so the numbers say which build
produced them. `--variant` takes an alias (`qwen3-vl-2b-instruct`), a variant name whose
version the catalogue picks (`qwen3-vl-2b-instruct-generic-cpu`), or a variant id, which
pins the version too (`…-generic-cpu:2`). Repeating it measures several, and **any use of it
replaces the default pair entirely** — which is what lets two model sizes be compared on
fixed hardware, or an NPU Variant added later, without changing code:

```bash
uv run benchmark --variant qwen3-vl-2b-instruct-generic-cpu --variant qwen3-vl-4b-instruct-generic-cpu
```

Each Variant is **unloaded before the next is loaded** — two loaded models compete for the
same device, and a Benchmark that left the first one resident would be measuring the second
under conditions it cannot report. **Measured** records which turn each one took, so a
result you suspect was contaminated by the previously loaded model can be checked by naming
the Variants the other way round.

**Providers** sits above every table because registering the Execution Providers is machine
set-up paid once per process, not the price of an Execution Provider. **Load** sits above
its own table for the other reason: it is paid once per Variant, so a per-run column would
invite it to be read as one. Every table is laid out to the same column widths, so the GPU's
median sits directly above the CPU's.

The **first repetition gets its own column** rather than being dropped — a cold model is
the honest number — and the median, minimum and maximum are taken over the repetitions
*after* it, so the summary describes the steady state. No mean and no standard deviation: a
handful of samples does not support them. **Tokens/second** sits next to the latency so
that a Variant which generated twice as much text is not credited with being twice as slow.
`--repetitions N` takes more or fewer than the default five.

Two Variants including a CPU one takes minutes, so each gets a **progress bar** while it
runs, carrying the last latency and the running median so the numbers are visibly moving
while an audience waits. The median on the bar is the one the table is about to print —
over the repetitions after the first — because a bar quoting a different median would be
worse than no bar. It takes itself off when the output is not a terminal, exactly as the
download bar does, so output captured in a pipe or in CI is just the report above.

#### When a Variant will not load

A **Variant that will not go onto the hardware is a row, not a crash** — the Benchmark
carries on to the next one, so the other Variant's numbers still survive:

```
Model        qwen3.5-0.8b-cuda-gpu:3 (alias qwen3.5-0.8b, GPU / CUDAExecutionProvider)
Attempted    1st of 2
Not measured qwen3.5-0.8b-cuda-gpu:3 would not load on GPU / CUDAExecutionProvider — pin a different variant with --variant (run `foundry model list`; a -generic-cpu variant is the safe one). Foundry Local said: …
```

That is not hypothetical: `qwen3.5-0.8b-cuda-gpu:3` is published and fails to load with an
invalid-graph error no caller can work around
([foundry-local#1075](https://github.com/microsoft/foundry-local/issues/1075)). It says
`Attempted` rather than `Measured` because the turn is still worth recording while the row
is not a measurement. **The exit status follows the Benchmark, not the Variants**: zero when
at least one Variant was measured, non-zero only when none was — a partial result reported
to the shell as a failure is a script that bins the numbers that did survive. See
[ADR-0007](./docs/adr/0007-a-variant-that-will-not-load-is-a-row.md).

Weights that never arrive are a row on the same terms — a fetch that fails is a load that
fails seen a moment earlier, and `--variant` is the lever either way. But only *getting the
Variant onto the hardware* fails this softly: a Benchmark Run that fails once the model is
loaded still ends the Benchmark, because that is a fault in this code rather than a verdict
on the catalogue, and it gets a traceback.

A model whose task is not `vision-language-chat` is **refused before anything is
downloaded** — a Benchmark aimed at a text-only sibling fails in seconds rather than after
fetching gigabytes.

#### When the comparison is not a comparison

Two Variants that generated materially different amounts of text were not doing the same
amount of work, and a table of seconds looks like a hardware result whether or not it is
one. More than **ten percent apart on completion tokens** and the Benchmark says so:

```
(qwen3-vl-2b-instruct-generic-cpu:2 generated 104 tokens against qwen3-vl-2b-instruct-cuda-gpu:2's 88 — 18% more, so these Variants did not do the same amount of work and their latencies are not a hardware comparison; Tokens/second is the figure that survives it)
```

Ten percent is deliberately loose: a decoder is not deterministic across Execution
Providers, so a few tokens either way is the normal state of affairs — the 96-against-104 in
the report above is inside it — and a warning on every Benchmark is a warning nobody reads.
The divergence is carried on the Benchmark rather than only printed, so it travels into the
persisted record instead of living in a terminal that has since scrolled.

#### What a Benchmark leaves behind

A Benchmark that measured something is written to **`docs/benchmarks/`** as two files, in one
call and from the same value: a **JSON record** and a **Markdown document**. The numbers are
then in git — they can be shown when the live demo fails, cited in a talk, and compared
against the same Benchmark taken on another machine later. See
[ADR-0008](./docs/adr/0008-a-benchmark-is-two-files-written-together.md).

```bash
uv run benchmark --hardware "RTX 4090 + i7-13700KF"
```

`--hardware` is how the **Hardware Profile** is declared, in words. A reader six months from
now needs "RTX 4090 + i7-13700KF"; a hostname means nothing to them. Leave it off and it
falls back to what the standard library reports about the machine — host, platform,
architecture, CPU count — so a Benchmark is never anonymous. Nothing probes the hardware:
there is no portable way to ask a machine what GPU it has.

The file name is a slug of that Hardware Profile plus a full timestamp
(`rtx-4090-i7-13700kf-20260907-140311.json`), so two machines' records never collide, and
three Benchmarks taken while tuning the demo on the same afternoon are three pairs of files
rather than one overwritten twice.

The **JSON is the record**: a schema version, the instant, the Hardware Profile, the Workload
— including the SHA-256 of the Frame's bytes, so that "the same Workload" is a claim a reader
can check rather than one they take on trust — the repetition count, the registration cost,
and per Variant the resolved id, the alias, the Execution Provider and device type, whether
it loaded and why not, the load time, **every** Benchmark Run's seconds and completion
tokens, and one Observation. That last one is what lets an Operator answer whether the CPU
said the same thing as the GPU — the more interesting half of the comparison once the latency
gap turns out to be eightfold.

The **Markdown is the same Benchmark as one comparison table**, with the Observations under
it and the token-divergence warning in it as well as in the terminal — the caveat travels
with the number to whoever reads the file months later. Reading a record back, and
cross-machine comparison tables, are deliberately not built here; the schema version is what
keeps that door open.

A Benchmark in which nothing at all could be measured is not written down: a Benchmark of
only Unmeasured Variants has nothing to report, and a file with no numbers in it would sit
beside the ones you compare machines with. Its reasons are printed to the terminal, where
they are the whole answer.

### Development

```bash
cd vision
uv run pytest       # the whole suite, no model needed
uv run mypy
uv run ruff check .
```

The tests drive both commands end to end through a fake camera, a fake Foundry
and a fake clock. A fourth fake stands in for the Feed itself: it is what lets a test
assert that the settling Frames really are discarded, and that the Frame observed is the
one after them rather than the first one. They do **not** prove the Foundry Local SDK
behaves as we believe — the fakes encode our reading of the 2.x type signatures. Running
the command against the real model is the only thing that validates that.

## Backlog

The high-level thread of the demo. Each item is one demonstrable feature, small enough to
show in a single sitting. Issues are opened per item as it is picked up — they are not
mirrored here.

### Committed

- [x] **1. One Observation, on demand.** Capture a Frame from the camera (or take an
      image file), send it to the local model, print the Observation and the latency it
      took. Runs and exits.
- [x] **2. Benchmark Runs across Execution Providers.** The same fixed workload against
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
