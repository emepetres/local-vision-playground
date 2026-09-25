# `observe` — one Observation of one Frame

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

## Where the Frame comes from

`--camera N` picks between cameras where the machine has more than one; `--image <path>`
takes the Frame from a file instead, and is the way to run everything but a Watch with no
camera at all.

A Feed does not yield a usable Frame the instant it opens — the camera exposes and
white-balances for a moment first — so **five Frames are read and discarded** before the
one that is observed. That wait is not hidden in a sleep in front of the capture: it
happens inside the capture and is counted in the Capture number, which is why that number
is the wait the Operator actually sat through, and why it dwarfs the same number for an
image file.

## Asking a question

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
answer, and so no follow-ups. _And what colour is it?_ is not a question this can ask —
put the whole question in the one `--ask`. An empty or whitespace-only `--ask` is refused
in one line before anything is downloaded, because a shell-quoting mistake should cost a
line rather than a model load.

`--structured` asks for the list of objects present instead of prose, and overrides
`--ask`. See [the Structured Observations guide](./structured.md).

## Keeping the Frame

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

## Choosing the hardware

By default the model is resolved by **alias**, letting Foundry Local pick the hardware.
`--variant` pins a **variant**, and with it the Execution Provider the work runs on —
`--variant qwen3-vl-2b-instruct-generic-cpu` runs the same workload on the CPU, on whatever
version the catalogue offers today, and adding `:2` pins that version too. That is the only
lever there is; nothing selects an Execution Provider directly (see
[`docs/stack.md`](../stack.md), Constraint 3), which is why the Model line names the
variant that was actually resolved and what it was built for — that pair is what a Benchmark
Run is attributed to. `--debug` restores the full traceback behind a one-line failure.

Naming a Variant is also how the NPU and the Arc iGPU are reached, through a second
Runtime — see [Reaching the NPU and the Arc GPU](./runtimes.md).

## When it fails

The two failures a live demo actually hits each get one line and a non-zero exit: no
camera at that index — which points at `--image` — and a camera another application is
holding, which opens and then yields nothing.

Pinning is also the answer when a model will not load at all. An alias picks the hardware,
and it can pick a variant that cannot run — `qwen3.5-0.8b-cuda-gpu:3` shipped a graph ONNX
Runtime refused to load, and no caller could fix that; only a republished `:4` did
([microsoft/foundry-local#1075](https://github.com/microsoft/foundry-local/issues/1075)).
`observe` says which variant failed and why in one line, exits non-zero, and tells you to
name another; a `-generic-cpu` one is the safe bet.

## Why it behaves this way

**Nothing is warmed up.** The first run downloads the model, and reports that time
separately — it is not one of the latencies. Nothing is warmed up afterwards either: the
first Observation is the honest one.

**Providers is timed on its own.** It is what registering this machine's Execution
Providers cost. It is timed apart because it is machine setup rather than part of the
Observation — but it is not optional: it is what makes a GPU variant loadable at all, and
skipping it would leave a pinned CUDA variant with nothing to load onto. Registration is
per-process, so every run pays it; only the first run on a machine also downloads the
providers. That download is why it happens _after_ the model has been resolved and checked:
nothing is fetched before the model has said it can see a Frame.

**The settling wait is inside Capture, not in front of it.** A sleep before the capture
would make Capture a lie; counting the discarded Frames inside it makes that number the
wait the Operator sat through.

**`--keep-frames` is not implied by `--debug`.** Wanting the evidence should not also mean
accepting a stack trace in front of an audience, and a demo should not leave hundreds of
images of the room behind by default.

**A Frame is rescaled on its long edge, never cropped** — which is why the Frame line names
both the source size and the size it was fit to. What that means for comparability is in
[the benchmark guide](./benchmark.md#the-reference-frame).

> **Note on the SDK.** Microsoft Learn documents the **1.x** Foundry Local API — the
> `get_chat_client()` shape every quickstart shows. This code targets **2.x** and calls
> the model in-process through `ChatSession`, with images as typed items carrying raw
> bytes and a codec hint. That is deliberate; see
> [ADR-0004](../adr/0004-target-foundry-local-2x-in-process.md). A reader comparing
> this against Learn will find Learn describing a different API.
