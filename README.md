# Local Vision Playground

A demo and teaching playground for multimodal vision running entirely on the Operator's
own machine, with no cloud. [Foundry Local](https://learn.microsoft.com/en-us/azure/foundry-local/)
serves a local vision-language model on ONNX Runtime; a camera Feed is turned into
Observations; those Observations drive an Agent written in C# with Microsoft Agent
Framework.

The point is not that it works — it is what it *feels like*: how fast local inference
actually is, what it costs on different hardware, and where the line sits between what a
local model can do and what still wants the cloud.

Why that matters outside a demo — a production-line workstation whose camera films workers,
on a plant network with no way out, watched all shift — is argued in
[`docs/business-value.md`](./docs/business-value.md): which value levers it claims
(data residency and the cost of a continuous camera), which it does not (actuation
latency, cloud-level quality), and what it would run on in production.

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
- A camera — for `watch` only. A Watch observes a live Feed and refuses an image file, so
  it is the one command that cannot be run without one. `observe` takes a Frame from a file
  with `--image <path>`, and `benchmark` measures the reference Frame in the repository by
  default and refuses a camera outright, so everything except the Watch can be developed
  and demonstrated with no camera attached.

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
Providers  4.138 s
Load       3.251 s
Capture    5.125 s (including 5 Frames discarded while the Feed settled)
Inference  1.201 s

A man with a beard is sitting in a room in front of a wooden bookshelf filled with books
and model rockets. A white door is open behind him, and a blue mesh chair is behind him.
```

`--camera N` picks between cameras where the machine has more than one; `--image <path>`
takes the Frame from a file instead, and is the way to run everything but a Watch with no
camera at all.

`--ask "<question>"` aims the Observation at something in particular — a **Scene Question**
— instead of having the Frame described:

```bash
uv run observe --ask "is anyone looking at the camera?"
```

```
Model      qwen3-vl-2b-instruct-cuda-gpu:2 (alias qwen3-vl-2b-instruct, GPU / CUDAExecutionProvider)
Frame      640x480 jpeg, fit to 640x480, from camera 0
Providers  4.138 s
Load       3.251 s
Capture    5.125 s (including 5 Frames discarded while the Feed settled)
Inference  0.642 s

Yes. The man in front of the bookshelf is facing the camera directly.
```

The answer is an Observation and is reported as one: same layout, same timings, same note
when the output limit cut it short. Nothing else about the request changes, so `--ask`
composes with `--image`, `--variant` and `--keep-frames` — rehearse a question against a
fixed Frame, then ask the same one of the CPU build and the GPU build. Leaving the flag off
sends the prompt it has always sent, so a command already on a slide keeps working.

A Scene Question is answered from that one Frame alone: no earlier Frame, no earlier
answer, and so no follow-ups. *And what colour is it?* is not a question this can ask —
put the whole question in the one `--ask`. An empty or whitespace-only `--ask` is refused
in one line before anything is downloaded, because a shell-quoting mistake should cost a
line rather than a model load.

A Feed does not yield a usable Frame the instant it opens — the camera exposes and
white-balances for a moment first — so **five Frames are read and discarded** before the
one that is observed. That wait is not hidden in a sleep in front of the capture: it
happens inside the capture and is counted in the Capture number, which is why that number
is the wait the Operator actually sat through, and why it dwarfs the same number for an
image file.

`--keep-frames` writes the observed camera Frame to `vision/frames/` (git-ignored) and
prints its path, so that a surprising Observation can be explained afterwards instead of
vanishing with the process:

```
Saved      D:\dev\local-vision-playground\vision\frames\frame-20260906-110354-829440.jpg
```

Without it nothing is written — a demo run should not leave hundreds of images of the
room behind. It is a separate choice from `--debug`: neither flag implies the other,
because wanting the evidence should not also mean accepting a stack trace in front of an
audience. A Frame taken from `--image` is already on disk and is never written out, with
or without the flag. `watch` takes the same flag on the same terms, and keeps the Frame of
every Cadence it reached.

The two failures a live demo actually hits each get one line and a non-zero exit: no
camera at that index — which points at `--image` — and a camera another application is
holding, which opens and then yields nothing. A Watch has no `--image` to point at, so
it words the first of those for itself and meets the second further on — see below.

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

The same Workload against several Variants, several times each. The default pair is the
CUDA-GPU Variant and the CPU one — the GPU-versus-CPU answer on a machine that has CUDA. The
demo machine does not: Foundry Local's vision path there is CPU-only
([`docs/stack.md`](./docs/stack.md), Constraint 3), so the Benchmark that matters on it is
**four rows across two Runtimes** — Foundry Local's CPU build, and the same weights on
OpenVINO GenAI's CPU, Arc iGPU and NPU — named explicitly:

```bash
cd vision
uv run benchmark \
  --variant qwen3-vl-2b-instruct-generic-cpu \
  --variant qwen3-vl-2b-instruct-int4-sym-cpu \
  --variant qwen3-vl-2b-instruct-int4-sym-gpu \
  --variant qwen3-vl-2b-instruct-int4-sym-npu \
  --hardware "ASUS Zenbook S14, Intel Core Ultra 7 258V"
```

```
Frame        640x360 jpeg, fit to 640x480, from C:\Users\jcarnero\dev\local-vision-playground\docs\fixtures\reference-frame.jpg
Prompt       Describe what you see in this image in two or three sentences.
Limits       at most 128 tokens, temperature 0.0
Providers    0.206 s
Repetitions  5 per Variant — the first reported apart, the median, minimum and maximum taken over the other 4

Model        qwen3-vl-2b-instruct-generic-cpu:2 (alias qwen3-vl-2b-instruct, CPU / CPUExecutionProvider)
Runtime      Foundry Local
Measured     1st of 4
Load         4.596 s

                  First    Median       Min       Max
Inference       9.589 s   7.972 s   7.801 s   8.321 s
Tokens               92        92        92        92
Tokens/second       9.6      11.5      11.1      11.8

Model        qwen3-vl-2b-instruct-int4-sym-cpu (CPU)
Runtime      OpenVINO GenAI
Measured     2nd of 4
Load         4.551 s

                  First    Median       Min       Max
Inference       9.056 s   4.611 s   4.456 s   4.666 s
Tokens              128       128       128       128
Tokens/second      14.1      27.8      27.4      28.7

(5 of 5 Benchmark Runs hit the 128-token output limit, so the limit decided how much text they generated)

Model        qwen3-vl-2b-instruct-int4-sym-gpu (GPU)
Runtime      OpenVINO GenAI
Measured     3rd of 4
Load         6.188 s

                  First    Median       Min       Max
Inference       2.768 s   2.286 s   2.262 s   2.491 s
Tokens              128       128       128       128
Tokens/second      46.2      56.0      51.4      56.6

(5 of 5 Benchmark Runs hit the 128-token output limit, so the limit decided how much text they generated)

Model        qwen3-vl-2b-instruct-int4-sym-npu (NPU)
Runtime      OpenVINO GenAI
Measured     4th of 4
Load         2.251 s

                  First    Median       Min       Max
Inference       5.765 s   5.885 s   5.577 s   6.133 s
Tokens              128       128       128       128
Tokens/second      22.2      21.8      20.9      23.0

(5 of 5 Benchmark Runs hit the 128-token output limit, so the limit decided how much text they generated)

(qwen3-vl-2b-instruct-int4-sym-cpu generated 128 tokens against qwen3-vl-2b-instruct-generic-cpu:2's 92 — 39% more, so these Variants did not do the same amount of work and their latencies are not a hardware comparison; Tokens/second is the figure that survives it)

Recorded     C:\Users\jcarnero\dev\local-vision-playground\docs\benchmarks\asus-zenbook-s14-intel-core-ultra-7-258v-20260922-090814.json
             C:\Users\jcarnero\dev\local-vision-playground\docs\benchmarks\asus-zenbook-s14-intel-core-ultra-7-258v-20260922-090814.md
```

Taken on the demo machine (ASUS Zenbook S14, Intel Core Ultra 7 258V). Read the **Runtime**
line, not just the hardware: the two CPU rows are the same silicon reached through two
Runtimes — Foundry Local's own build against the INT4 IR on OpenVINO GenAI — and that pair is
the calibration between them, the one comparison a four-row Benchmark most needs to keep
apart. Two things the numbers say plainly, and neither flatters the NPU:

- **The NPU is not the throughput winner.** The Arc iGPU leads at 56 tok/s, the INT4 build
  on the CPU sustains 27.8, and the NPU trails both at 21.8 — a third Execution Provider with
  its own profile, whose case is TTFT and warm-start rather than peak tokens/second (issue
  [#38](https://github.com/emepetres/local-vision-playground/issues/38)), which this
  Benchmark does not measure.
- **This is not a like-for-like comparison.** The three OpenVINO rows run an **INT4** IR,
  Foundry Local's row an unquantised build; the INT4 Variants degrade into repetition and run
  to the 128-token limit (see *What each Variant saw* in the record), while Foundry Local's
  stops at 92 tokens with a clean description. Different amounts of work, so Tokens/second is
  the figure to read — and the token-divergence note above says so in the report itself.

The **Frame is read once** and those exact bytes go to every repetition of every Variant —
that is what makes the whole sitting comparable, and it is why the live camera is refused: a
different Frame each time is not a Workload. `--image <path>` measures a file of your own
instead of the reference Frame; `--debug` behaves as it does for `observe`.

`--ask "<question>"` makes the **Scene Question** part of the Workload, so that what is
measured is the work an Operator actually cares about — a two-word answer and a request for
a paragraph are wildly different amounts of generation:

```bash
uv run benchmark --ask "how many cups are on that desk?"
```

The question travels unchanged to every Benchmark Run of every Variant — one Workload for
the whole sitting, which is what keeps the Variants comparable with each other — and it is
printed on the `Prompt` line above the tables, written into the JSON record and into the
Markdown beside the Frame's hash and the generation limits. Nothing else moves: the limits
are the ones they always were, and an answer that hits the output limit gets the same
truncation note.

**Two Benchmarks taken under different questions are not comparable**, however alike their
hardware — they measured different amounts of generation, which is the whole reason the
flag exists. That is why the question is in both files: a reader months later can see which
question produced which numbers. Leaving `--ask` off measures the prompt it has always
measured, so a new record is still comparable with the ones already in `docs/benchmarks/`.
An empty or whitespace-only `--ask` is refused before any weights are fetched, exactly as
`observe` refuses it.

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
uv run benchmark --hardware "ASUS Zenbook S14, Intel Core Ultra 7 258V"
```

`--hardware` is how the **Hardware Profile** is declared, in words. A reader six months from
now needs "ASUS Zenbook S14, Intel Core Ultra 7 258V"; a hostname means nothing to them. Leave it off and it
falls back to what the standard library reports about the machine — host, platform,
architecture, CPU count — so a Benchmark is never anonymous. Nothing probes the hardware:
there is no portable way to ask a machine what GPU it has.

The file name is a slug of that Hardware Profile plus a full timestamp
(`asus-zenbook-s14-intel-core-ultra-7-258v-20260922-090814.json`), so two machines' records never collide, and
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

### What it feels like

The same question asked of the room over and over, at a **Cadence**, for as long as the
Operator lets it run. It is the one command that does not return on its own: unless
`--count` is given a number of Cadences to stop at, it runs until it is interrupted.

```bash
cd vision
uv run watch
```

```
Registering Execution Providers — the first run also downloads them

Model      qwen3-vl-2b-instruct-cuda-gpu:2 (alias qwen3-vl-2b-instruct, GPU / CUDAExecutionProvider)
Cadence    one Observation every 2.000 s
Feed       camera 0, settled in 0.418 s, 5 Frames discarded
Providers  4.108 s
Load       3.184 s

#1  inference 1.284 s
A man with a beard is sitting at a desk in front of a wooden bookshelf.

#2  inference 1.196 s
The same man, now holding a white coffee mug in his right hand.

#3  inference 1.312 s
The desk is empty; the blue mesh chair in front of the bookshelf is unoccupied.
^C

3 Observations, median inference 1.284 s
```

A Watch needs a **live Feed**: `--image` is refused, and the refusal names the commands
that do take a file. It is a third command rather than a flag on `observe` because a
command that sometimes returns and sometimes does not is two commands.

The **header** is everything paid or decided once, written above the Observations so
that the line which changes is the only one repeated. **Model** is the Variant that actually
answered and what it was built for, as `observe` reports it. **Cadence** is what was asked
for, in words rather than as a number, because it is a request and not a guarantee.
**Feed** is where the Frames come from and how many the camera discarded while it exposed
and white-balanced — that is the wait before `#1` arrives, and an Operator not told about
it reads that wait as the model being slow. **Providers** and **Load** are the same two
set-up costs `observe` reports, and for the same reason: neither is the latency of any
Observation.

Each **Observation** is then a short line of facts with the text under it, appended rather
than redrawn in place — a panel loses the history an audience is following, and breaks the
moment the output is redirected. The number leads the line so that a column of
Observations an audience has been following for a minute can still be counted, and it
counts every Cadence the Watch
reached: a `#4` after a `#2` says something happened at `#3`. Only the **inference** is
timed, because taking the present off a held Feed is not a cost worth a column. An
Observation that hit the output limit says so as a further clause on that same line —
`observe`, with one Observation and room under it, gets a note of its own instead.

The **summary** is a sentence rather than a table, and it is the lesson the Operator leaves
with: how many Observations this machine produced, and the median inference it sustained.
It is printed however the Watch ended — after the camera has been released and the model
unloaded, so that the last thing read is not written while the machine is still held.

#### Starting a Watch on a question

`--ask "<question>"` starts the Watch on a **Scene Question** rather than on the plain
description, and it stands: every Observation from `#1` onward answers it, on its own
Frame.

```bash
uv run watch --ask "is anyone looking at the camera?"
```

```
Model      qwen3-vl-2b-instruct-cuda-gpu:2 (alias qwen3-vl-2b-instruct, GPU / CUDAExecutionProvider)
Cadence    one Observation every 2.000 s
Feed       camera 0, settled in 0.411 s, 5 Frames discarded
Providers  4.102 s
Load       3.207 s

#1  inference 1.271 s
Yes. The man in front of the bookshelf is facing the camera directly.

#2  inference 1.238 s
No. He has turned to his left and is looking at the bookshelf.

#3  inference 1.305 s
No one is in front of the camera.
^C

3 Observations, median inference 1.284 s
```

Nothing else about the Watch moves: the header, the per-Observation lines and the summary
are the ones above, the Cadence is still a grid, and a Watch that falls behind still skips
and says so. Each Observation still stands on its own Frame — the question is carried from
one Cadence to the next, never the answers, so there are no follow-ups inside a Watch any
more than there are inside a single `observe`. Leaving the flag off sends the prompt it has
always sent. An empty or whitespace-only `--ask` is refused before the camera is opened or
the model is loaded, because a shell-quoting mistake should cost an Operator a line rather
than a whole run-up.

A standing question does not make a Watch a measurement: the Frames still differ from one
Observation to the next, so there is still nothing to compare and nothing is written down.

#### Asking a question while the Watch runs

Type a question at the running Watch and press Enter. **Nothing stops**: the Feed goes on
being read and the Cadence goes on being kept while the question is being typed, and the
new question takes effect at the **next Cadence** — it is a change of what the Watch asks,
not an interruption of what it was doing
([ADR-0009](./docs/adr/0009-a-scene-question-changes-what-a-watch-asks.md)). It then stands
until it is replaced, exactly as `--ask` does.

The Watch says once, above the Observations that answer it, what it has been steered onto:

```
#2  inference 1.238 s
A man sitting at a desk in front of a bookshelf.

Asking: how many people are there?

#3  inference 1.305 s
One.
```

The question is never counted against the machine. No Cadence is skipped and no Stale Frame
is discarded because somebody typed, and the summary reports what the hardware did with no
tally of how often the keyboard was used.

**Press Enter on an empty line to stop asking** — the Watch goes back to describing the
Frame from the next Cadence, and says so (`Asking: for a plain description`). Retyping the
question already standing changes nothing and is not echoed twice.

**There are no follow-up questions.** Every Observation stands on its own Frame and on the
standing question alone, so *and what colour is it?* is not a question this project can
answer — nothing the model was told a moment ago is still there to refer back to. Ask whole
questions, and build the demo on that.

A line typed while the Watch is mid-inference is read at the next Cadence, not pushed into
the inference already running. Of several lines typed between two Cadences **only the last
survives**: the questions are not queued, for the same reason Frames are not
([ADR-0006](./docs/adr/0006-a-watch-discards-it-never-queues.md)). Typed characters
interleave with the Observations being printed — this is a terminal in a talk, not a TUI.

**Where `stdin` is not a terminal there is no keyboard**: a pipe, CI, output redirected to a
file. No reader is started at all and the Watch runs on whatever `--ask` gave it, in the
same spirit as the progress bars taking themselves off when the output is not a terminal.
Lines arriving on a redirected `stdin` are a script rather than an Operator, and are never
read as questions.

#### When the machine cannot keep the Cadence

Pin the CPU Variant and the same Watch stops keeping its Cadence, in front of the audience
and without a table:

```bash
uv run watch --variant qwen3-vl-2b-instruct-generic-cpu
```

```
Model      qwen3-vl-2b-instruct-generic-cpu:2 (alias qwen3-vl-2b-instruct, CPU / CPUExecutionProvider)
Cadence    one Observation every 2.000 s
Feed       camera 0, settled in 0.402 s, 5 Frames discarded
Providers  4.070 s
Load       4.412 s

#1  inference 5.037 s
A man with a beard is sitting at a desk in front of a wooden bookshelf.

#2  inference 5.104 s, late — skipped 2 Cadences and discarded 149 Stale Frames to observe the present
The same man, now holding a white coffee mug in his right hand.

#3  inference 4.970 s, late — skipped 2 Cadences and discarded 147 Stale Frames to observe the present
The desk is empty; the blue mesh chair in front of the bookshelf is unoccupied.
^C

3 Observations, median inference 5.037 s, 4 Cadences skipped
```

The Cadence is a **fixed grid** — `t0`, `t0 + N`, `t0 + 2N` — and not a pause after each
Observation, so an inference that overran it leaves instants behind it that have already
gone. A Watch does not queue them. It **skips the moments it has passed, discards the
Stale Frames the Feed buffered meanwhile, and observes the present**, and it says how
many of each it lost on the line where it lost them. The two counts are two different
losses:

- **skipped 2 Cadences** — two Observations that will never exist. This machine was asked
  for one every two seconds and could answer once every five.
- **discarded 147 Stale Frames** — images the camera produced while the model was busy,
  read and thrown away to reach the present. A **Stale Frame** is not one of the Frames
  discarded while the Feed settled: the same read, a different fact. The settling ones are
  a start-up cost, reported once in the header; these are the price of being late, and
  their number follows how fast the camera produces Frames rather than the size of the
  shortfall.

An Observation that kept its Cadence says nothing about either — a `skipped 0` on every
timely line would be furniture. The summary carries the **total** of the skipped Cadences,
because a total is the one thing the per-Observation lines cannot be read as once a Watch
left running through a demo has scrolled past.

Why a Watch discards rather than queues — and why the shortfall is reported as two
counts rather than as a delay — is
[ADR-0006](./docs/adr/0006-a-watch-discards-it-never-queues.md).

#### A Watch is not a measurement

**Nothing a Watch produces is a Benchmark, and it never becomes one.** Every Observation
runs against a different Frame, so there is nothing to compare: the median inference in the
summary describes what this machine sustained on whatever happened to be in front of the
camera, not what a Variant costs. A Watch is the *feel* of the shortfall; `benchmark` is
the question of what it costs, over a Workload held fixed and written down — that is the
number to cite, and the two are the same fact seen from either side.

#### When an inference fails, and when the Feed goes away

A single inference that fails is **one line and then the next Cadence**: the Watch has
already moved on by the time it is read, so there is no advice under it. What that Cadence
cost to reach is said on the same terms as on an Observation's line, because the instants
were passed and the Stale Frames discarded before the model was asked:

```
#3  failed — RuntimeError: the model returned no text, late — skipped 1 Cadence and discarded 32 Stale Frames to observe the present
```

Failed Cadences are counted in the summary too (`, 1 failed`), and are deliberately *not*
in the median: a Watch reporting six Observations having attempted ten would be
overstating what this machine sustained.

A Feed that never opens ends the process rather than a Watch, as it does for `observe` —
but in its own words, because there is no `--image` here to fall back on: it names
`observe --image <path>` as the way to look at a file instead. A camera another
application is holding arrives differently. It opens, so the Watch begins; what it never
does is hand over a Frame, which is the ending the next paragraph is about.

A **Feed that dies** is the other thing entirely — the camera was unplugged, or another
application took it — and it ends the Watch, because a Watch cannot go on without a Feed.
The Observations already produced are still printed and summarised; the failure does not
get to take them away. The exit status follows that split: zero for a Watch that produced
at least one Observation over a Feed that survived it, non-zero for a Watch whose Feed died
or which produced nothing at all.

#### The flags

- `--every SECONDS` — the Cadence, measured on the fixed grid rather than as a pause after
  each Observation. Default `2`. `--every 0` asks for Observations as fast as the model
  allows, which cannot be late for an instant nobody named. A negative number is refused.
- `--count N` — end the Watch after N Cadences, one whose inference failed included.
  Cadences rather than Observations, and deliberately: it is what makes a Watch whose every
  inference fails end rather than run for ever. Default: run until it is interrupted.
  Anything below one is refused: it is not a Watch.
- `--camera N` — index of the camera to open the Feed on. Default `0`.
- `--ask "<question>"` — the Scene Question the Watch *starts* on, standing over every
  Cadence it then reaches. Default: the fixed prompt, which describes the Frame. An
  empty or whitespace-only question is refused, before the camera or the model. It is only
  the question the Watch begins with: typing one at the keyboard replaces it from the next
  Cadence, and an empty line at the keyboard goes back to the plain description.
- `--variant ID` — pin the Variant, and with it the Execution Provider, exactly as for
  `observe`. Default: resolve the alias `qwen3-vl-2b-instruct` and let Foundry Local pick
  the hardware. This is the lever the demo above turns.
- `--keep-frames` — write the Frame of every Cadence to `vision/frames/` (git-ignored) and
  report its path on the Observation's line, so that a surprising Observation stays
  explainable after the process is gone. Default: nothing is written, here as in `observe`
  — a Watch left running through a demo would otherwise leave hundreds of images of the
  room behind. It is written before the model is asked, so a Cadence whose inference
  failed leaves its Frame behind too; that line has no path on it, because there is no
  Observation to hang one from. A **Stale Frame** is never written: nobody observed it, so
  it explains nothing.

  ```
  #1  inference 1.284 s, saved D:\dev\local-vision-playground\vision\frames\frame-20260907-181204-114887.jpg
  An empty desk.
  ```

- `--image PATH` — refused, and offered only so that an Operator arriving from `observe` is
  told why rather than finding the flag missing and guessing.
- `--debug` — re-raise failures with their full traceback, as everywhere else.

### Reaching the NPU and the Arc GPU (the second Runtime)

Everything above runs through **Foundry Local**, the default Runtime. On the demo machine
its catalogue publishes `qwen3-vl` for the **CPU only** — no Arc iGPU build, no NPU build
([`docs/stack.md`](./docs/stack.md), Constraint 3) — so the machine's own accelerators are
reached through a **second Runtime, OpenVINO GenAI**, running the same weights exported once
to an OpenVINO IR ([ADR-0012](./docs/adr/0012-two-runtimes-foundry-local-is-not-the-only-source.md),
[ADR-0013](./docs/adr/0013-the-second-runtime-is-an-adapter-behind-an-unchanged-model-port.md)).
A Variant that names an on-disk IR is sent to OpenVINO GenAI; an alias, a variant name or a
variant id goes to Foundry Local. That is the only switch — the Runtime rides in the Variant
token, so `observe`, `watch` and `benchmark` all reach a given Execution Provider by naming
the same Variant.

#### 1. Produce the IR — the opt-in `convert` step

The opt-in `convert` dependency group carries two things a plain `uv sync` never installs:
the **export toolchain** (`optimum-intel`, `nncf`, `transformers`), which only the conversion
step uses and which nothing in `observe` / `watch` / `benchmark` imports
([`tools/convert/README.md`](./vision/tools/convert/README.md)); and the **OpenVINO runtime
libraries** (`openvino`, `openvino-genai`), which the second Runtime imports lazily when an
OpenVINO Variant is named. So `uv sync --group convert` is what both the export machine and
the run machine need — one to produce the IR, the other to run it.

```bash
cd vision
uv sync --group convert                                            # once — toolchain + OpenVINO libraries
uv run --group convert tools/convert/convert.py --ep NPU           # export the INT4-sym IR, tagged for the NPU
uv run --group convert tools/convert/convert.py --ep GPU           # …the Arc iGPU
uv run --group convert tools/convert/convert.py --ep CPU           # …the CPU (the OpenVINO calibration row)
```

One INT4-symmetric export serves all three OpenVINO Execution Providers — `--ep` fixes only
the [Provenance](./CONTEXT.md) slug the IR is named by and the Execution Provider it is told
to run on, not the export itself. Each IR lands **outside the repo** (it is ~1.7 GB) under
`%LOCALAPPDATA%\local-vision-playground\ir\<slug>` (override with `$LVP_IR_CACHE`), with a
`provenance.json` beside it — the identity a Variant with no catalogue behind it carries.
`--dry-run` prints the plan and checks the NPU driver; the export is CPU-bound and needs no
NPU, but the smoke run does. See [`tools/convert/README.md`](./vision/tools/convert/README.md)
for the prerequisites, the recipe and the trap it defends against.

#### 2. Name the Variant for each Execution Provider

The provenance slug is the Variant name. With the exports above:

| Execution Provider | Runtime | Variant to name |
| --- | --- | --- |
| CPU | Foundry Local | `qwen3-vl-2b-instruct-generic-cpu` |
| CPU | OpenVINO GenAI | `qwen3-vl-2b-instruct-int4-sym-cpu` |
| Arc iGPU | OpenVINO GenAI | `qwen3-vl-2b-instruct-int4-sym-gpu` |
| NPU | OpenVINO GenAI | `qwen3-vl-2b-instruct-int4-sym-npu` |

A path to an IR directory works anywhere a slug does. The two CPU rows are the same silicon
through two Runtimes — the calibration between them.

#### 3. Run each command on the hardware you name

`observe` and `watch` take one Variant with `--variant`; `benchmark` takes the four together
(the run under [What it costs](#what-it-costs) above). The Arc iGPU, one Frame:

```bash
uv run observe --image ../docs/fixtures/reference-frame.jpg --variant qwen3-vl-2b-instruct-int4-sym-gpu
```

```
Model      qwen3-vl-2b-instruct-int4-sym-gpu (GPU)
Frame      640x360 jpeg, fit to 640x480, from ..\docs\fixtures\reference-frame.jpg
Providers  0.000 s
Load       3.165 s
Capture    0.014 s
Inference  2.648 s

This is a low-light, slightly blurry, and darkly lit room. The room has a white door, a white
bookshelf, and a white bookshelf. The bookshelf has a white and black book. …
```

**Providers reads `0.000 s`** on any OpenVINO-only run: registering Execution Providers is
Foundry Local's alone, and OpenVINO GenAI is told its Execution Provider rather than registering one
([ADR-0013](./docs/adr/0013-the-second-runtime-is-an-adapter-behind-an-unchanged-model-port.md)).
A Watch on the NPU, and the same on the iGPU, are the same command with the Variant swapped:

```bash
uv run watch --variant qwen3-vl-2b-instruct-int4-sym-npu
uv run watch --variant qwen3-vl-2b-instruct-int4-sym-gpu
```

One honest caveat carries across all three commands. The IR is **INT4-quantised**, and this
2B model degrades under it: the description above runs to the token limit repeating itself,
where Foundry Local's unquantised CPU build stops with a clean paragraph. The second Runtime
buys the accelerator, not accuracy — the Arc iGPU is the throughput winner (see the Benchmark
above), the NPU leads only on TTFT, and the quality trade-off is the INT4 IR's, not the
Runtime's.

### Development

```bash
cd vision
uv run pytest       # the whole suite, no model needed
uv run mypy
uv run ruff check .
```

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
- [x] **3. A continuous series of Observations.** A Watch: Observations one after another
      over a live Feed, at a requested Cadence, and a deliberate answer to what happens
      when inference is slower than the Cadence — it skips the moments it has passed,
      discards the Stale Frames and says how many of each it lost
      ([ADR-0006](./docs/adr/0006-a-watch-discards-it-never-queues.md)).
- [x] **4. Scene Questions.** Ask a natural-language question about the current Frame and
      get an answer from that Frame alone — no follow-ups, because nothing the model was
      told a moment ago is still there. Three surfaces: `observe --ask` replaces the fixed
      prompt for one Frame; `benchmark --ask` makes the question a Workload, so that a
      short answer and a description are measured as the different amounts of work they
      are; and a Watch accepts a question typed while it runs, without stopping. In a Watch
      the question is not an interruption — it takes effect at the next Cadence and stays
      in effect until it is replaced, so that a skipped Cadence goes on meaning *this
      machine could not keep up* and nothing else
      ([ADR-0009](./docs/adr/0009-a-scene-question-changes-what-a-watch-asks.md)).
- [x] **5. Structured Observations.** Ask the model for a fixed shape — the list of
      objects present in a Frame — instead of prose.
- [ ] **6. Triggers.** Fire when a condition over Observations holds — the conditions of
      the [anchor scenario](./docs/business-value.md#the-anchor-scenario-a-workstation-on-a-production-line),
      staged as a desk-scale work cell: a part is missing from the tray, someone is working
      the cell without gloves, a foreign object is in the zone. Preceded by a spike that
      measures whether `qwen3-vl-2b` resolves those conditions through Structured
      Observations on real photos of the cell — before any of them is promised. Those
      photos then become the Benchmark's fixed Workload, so that what is measured is the
      scenario's work rather than a generic room.
- [ ] **7. The Agent, in C#.** Microsoft Agent Framework consuming Observations over the
      local endpoint and invoking Actions when Triggers fire. The Agent never sees an
      image ([ADR-0003](./docs/adr/0003-the-agent-consumes-observations-not-images.md)).
      Its Actions stay on the machine: a desktop notification — the supervisor finds out —
      and an entry in a local incident log holding the Trigger, the Observation that fired
      it and the time. Never a Frame: what is kept is a sentence, never a face.
- [x] **8. A second Runtime: the NPU and the Arc GPU via OpenVINO GenAI.** Foundry
      Local's vision path on the demo machine is CPU-only — `qwen3-vl` ships no GPU or NPU
      build there — so the machine's own accelerators are reached through a second Runtime,
      OpenVINO GenAI, running the same weights it exports once. That turns the Execution
      Provider axis into a Benchmark of four rows across two Runtimes (FL-CPU, OV-CPU,
      OV-GPU, OV-NPU), with the two CPU rows as the calibration between them. Built and
      specified behind
      [ADR-0012](./docs/adr/0012-two-runtimes-foundry-local-is-not-the-only-source.md) (two
      Runtimes) and
      [ADR-0013](./docs/adr/0013-the-second-runtime-is-an-adapter-behind-an-unchanged-model-port.md)
      (the second Runtime is an adapter behind an unchanged model port). On a model this
      small the NPU is **not** the throughput winner — it leads only on TTFT — so its story
      is a third Execution Provider with its own profile, not peak tokens/second. See
      [Reaching the NPU and the Arc GPU](#reaching-the-npu-and-the-arc-gpu-the-second-runtime)
      for how to run it.
- [ ] **9. Capacity and cost.** From a Benchmark and a requested Cadence, how many cameras
      a Hardware Profile could serve at most — ⌊Cadence / median inference latency⌋, one
      model serving the Feeds in series — next to what the same Observations would cost
      from a cloud vision API, priced per image from a versioned data file that cites each
      price and the date it was read. An upper bound per Hardware Profile, stated as one:
      concurrency on an NPU or GPU does not scale linearly, and no figure transfers to
      another machine. Nothing is requested from the cloud to produce it.
- [ ] **10. Runs without a network once prepared.** Preparing the machine may use the
      network — downloading the model, exporting a Variant, caching the Foundry Local
      catalogue, benchmarking. Operating it may not: once prepared, `observe` and `watch`
      run with Wi-Fi off. Runtime telemetry is disabled by default (`ORT_TELEMETRY_DISABLED`,
      since Foundry Local otherwise sends a process event even with non-essential telemetry
      off), the demo pins its Variant id, and the airplane-mode rehearsal — including how
      long a start takes with no catalogue to reach — is documented as a moment of the
      demo script.

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
