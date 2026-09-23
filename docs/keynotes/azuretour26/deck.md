---
title: Computer Vision in Airplane Mode
language: en
accent: "#0078D4"
---

type: title

# Computer Vision in Airplane Mode
A camera, a local model and an agent, with nothing leaving the laptop

::: notes
Azure Tour Sevilla 2026. Javier Carnero, Plain Concepts.
Laptop on stage, camera on, work cell on the desk.
:::

---

type: statement

# Airplane mode: on
[+] and it stays on until the last slide

::: notes
Switch it on in full view. Leave the airplane icon visible on the projected screen.
:::

::: script
Before anything else, I am switching this laptop to airplane mode.
No Wi-Fi, no cable, no cloud. It stays like this for the whole talk.
:::

---

type: section

# Demo: one look

::: notes
D1. `uv run observe` on Foundry Local, CPU. Read the sentence it writes aloud.
:::

---

type: code
file: README.md

```
$ uv run observe
Model      qwen3-vl-2b-instruct-generic-cpu:2 (CPU / CPUExecutionProvider)
Frame      640x480 jpeg, from camera 0
Inference  1.201 s

A man with a beard is sitting in a room in front of a wooden bookshelf
filled with books and model rockets.
```

::: notes
Backup of D1: a real run from the repo's README, abridged. Show it only if the live run fails.
:::

---

type: statement

# It wrote a sentence about me
[+] and the picture never left this laptop

::: script
That sentence is the whole talk. A model looked at me and wrote about what it saw.
The image went nowhere. What came out was a sentence, and a sentence can travel.
Keep an eye on that sentence. It comes back every few minutes.
:::

---

type: statement

# "Local AI is a chat toy. Real AI lives in the cloud."

::: notes
The room's belief, said as theirs. Bridge from the 11:35 talk.
:::

::: script
You have just seen an agent in production on Microsoft Foundry. Good. Now we unplug the cable.
Most local AI demos end up as a text chat on a laptop. So we assume serious work lives in the cloud.
And we assume the choice is binary: everything in Azure, or everything on your own box.
:::

---

type: statement

# What crosses the wire?

::: notes
Plant the question. It closes every section of the body. Do not answer it yet.
:::

---

type: section

# A workstation on a production line

---

type: bullets

## Three facts about this plant
- The camera films workers
- The plant network is cut off by design
- The camera watches all shift, every shift

::: notes
Residency was covered at 10:25. One sentence on GDPR and the works council, then move on.
The third fact is the one that matters for cost later.
:::

---

type: image
src: !todo "the desk-scale work cell as seen from above: a parts tray with one slot empty, a pair of work gloves, a camera on a small arm pointing down at them"
alt: desk-scale work cell with a parts tray, gloves and a camera

the work cell, at desk scale

::: notes
The supervisor wants to know when a part is missing, when someone works without gloves, when something is left in the zone.
Only the first one is live today.
:::

---

type: section

# 1. The frame

---

type: code

```
This is an invalid model.
Error: Duplicate definition of name (pad_CUDAExecutionProvider).
```

::: notes
qwen3.5-0.8b-cuda-gpu:3 on my desktop. The defect is in the published artifact, not in the caller.
Reported as microsoft/foundry-local#1075.
:::

---

type: bullets

## The model you ask for is not the model you get
- An alias lets Foundry Local pick the hardware
- It picked a published build that does not load
- [+] Pin the Variant by name

::: script
I asked for a model by its alias, and Foundry Local chose the build for my hardware.
It chose one that cannot load, and nothing I could do as a caller fixed it.
The lever is to name the exact Variant. The whole demo rests on that.
:::

---

type: statement

# What crosses the wire?
[+] A sentence

---

type: section

# 2. The question

---

type: section

# Demo: ask the watch

::: notes
D2. `uv run watch`, then type "is the left tray empty?" while it runs.
The question takes effect at the next Cadence and stays until replaced.
:::

---

type: comparison

::: A detector
- a fixed list of classes
- retrained when the list changes
:::

::: A vision-language model
- a list anyone changes by typing
- an accuracy you have to measure
:::

::: script
Production today runs detectors, trained for a fixed list and retrained when it changes.
Here the line lead typed a new question, with no new model and no data scientist.
That flexibility is the reason to run a VLM at all. It is also why its accuracy must be measured.
:::

---

type: statement

# What crosses the wire?
[+] A question in, a sentence out

---

type: section

# 3. The model

---

type: bullets

## What the catalogue offers this laptop
- `qwen3-vl-2b-instruct` on the CPU
- no GPU build
- no NPU build

::: notes
Verified with `foundry model list` on this machine. The catalogue is filtered per device.
The laptop has an Arc 140V iGPU and an Intel AI Boost NPU. Foundry Local reaches neither for vision today.
:::

::: script
This laptop has a GPU and an NPU. The catalogue offers this model for the CPU only.
So if you want the accelerators, you build the model yourself.
:::

---

type: code
file: vision/tools/convert/convert.py

```bash
optimum-cli export openvino \
  --model Qwen/Qwen3-VL-2B-Instruct \
  --weight-format int4 --sym --ratio=1.0 --group-size=-1 \
  qwen3-vl-2b-instruct-int4-sym
```

::: notes
The recipe verified on this laptop, not a general rule. It runs once, on the CPU, and needs no NPU.
If asked: NNCF does the compression; symmetric, channel-wise INT4 is what ran first try on the NPU;
transformers must stay >=4.57,<5.0; convert.py scrubs a system-wide OpenVINO install that shadows the right one;
provenance.json records the recipe beside the IR.
:::

---

type: image
src: !todo "one model weight drawn as a row of 16 bits shrinking to a row of 4 bits, with a large box labelled ~5 GB becoming a small box labelled ~1.7 GB that feeds three chips: CPU, GPU, NPU"
alt: 16-bit weights compressed to 4-bit, one file for three engines

~5 GB downloaded, ~1.7 GB on disk, one file for three engines

::: script
Each weight goes from sixteen bits to four. The model shrinks to about a third.
One exported file serves the CPU, the GPU and the NPU through OpenVINO.
:::

---

type: comparison

::: Foundry Local, CPU
> This is a dimly lit room with a tall wooden bookshelf filled with books and various items on the shelves. A blue and gray office chair is in the foreground.
:::

::: OpenVINO, INT4
> A bookshelf is on the left, and a white door is in the center. A white door is in the center. A white door is in the center. A white door is in the center.
:::

::: notes
Same image, same prompt, from the Benchmark of 2026-09-22. Every INT4 row repeats like this, on every engine.
The price belongs to the quantisation, not to any one chip.
:::

---

type: statement

# Quantising buys the accelerator
[+] not the accuracy

---

type: statement

# What crosses the wire?
[+] The model, once, while you prepare the machine

::: script
The weights came down once, while I prepared this laptop. Since then, nothing.
Preparing may use the network. Operating may not.
:::

---

type: section

# 4. The hardware

---

type: code

```bash
uv run watch --variant qwen3-vl-2b-instruct-generic-cpu
uv run watch --variant qwen3-vl-2b-instruct-int4-sym-gpu
uv run watch --variant qwen3-vl-2b-instruct-int4-sym-npu
```

::: notes
D3. Same watch, three engines. Only the Variant name changes. Point at the timings as they come in.
:::

---

type: bullets

## Same image, same prompt, tokens per second
- Arc iGPU, OpenVINO: 56.0
- CPU, OpenVINO: 27.8
- NPU, OpenVINO: 21.8
- CPU, Foundry Local: 11.5

::: notes
Benchmark of 2026-09-22 on this laptop, five runs each. Tokens per second, because the INT4 rows did more work.
The two CPU rows are the same silicon reached two ways.
:::

---

type: statement

# I measured the NPU with the GPU's ruler

::: script
I came in expecting the NPU to win. By tokens per second, it does not, on this model.
That was my mistake. I only found out after building a second runtime to reach it.
I was asking the wrong question of the wrong engine.
:::

---

type: statement

# Which engine is fastest?
[+] Which engine suits a station that watches all shift?

::: script
A station does not sprint. It watches the same cell for eight hours, then does it again.
For that job, peak speed is not the whole story.
:::

---

type: bullets

## What the NPU showed on this laptop
- loads fastest of the four: 2.3 s
- no cold-start penalty: 5.8 s first run, 5.9 s warm
- the exported model ran on it at the first attempt
- leaves the CPU and the GPU free for the rest of the station

::: notes
All from the Benchmark record. For contrast: the OpenVINO CPU row goes from 9.1 s cold to 4.6 s warm; the iGPU loads in 6.2 s.
Earlier spike, a different model (Qwen2.5-VL-3B INT4, issue #38): NPU 6.0 s to first token against 23.7 s on the CPU.
:::

---

type: quote

> The fourth-generation NPU is up to 4x more powerful than the previous generation and is ideal for running sustained AI workloads while remaining energy-efficient.
— Intel, Core Ultra 200V launch

::: notes
Intel's words about this chip generation. A claim about the platform, not a measurement of this app.
:::

---

type: stat

# 2.8x
performance per watt of the NPU over the GPU, measured by Intel on Panther Lake

::: notes
Intel's own lab: Gemma 4 E2B on Core Ultra 7 355, power measured with SocWatch. There the NPU was also faster than the GPU.
Next generation, different model, not this app. Say all three.
:::

::: script
Intel has measured where this is going. On Panther Lake, the next generation, the NPU does 2.8 times the work per watt of the GPU.
Different chip, different model, not my app. But that is the direction.
:::

---

type: statement

# I did not measure energy for this app
[+] and I will not pretend I did

::: script
Last year I gave a talk together with Intel. We measured energy on this very laptop.
Then a driver update made that measurement impossible, and it still is.
So today you get Intel's figures, labelled as Intel's, and my honesty about the gap.
:::

---

type: statement

# What crosses the wire?
[+] Nothing. Changing engines is changing a name.

---

type: section

# 5. The shape

---

type: stat

# 0 of 11
forced tool calls with an image that the model honoured

::: notes
Spike of 2026-09-15. The model never honoured a forced tool call when the request carried an image.
ADR-0011 records the mechanism that did not survive.
:::

---

type: code

```
12  book
 2  cup
 1  chair
 1  door
```

::: notes
`observe --structured`. The prompt asks for ONLY a JSON array of {name, count}, with a worked example.
Three outcomes, never a silent fallback to prose: the list, nothing present, or no shape with its reason.
:::

::: script
So I stopped forcing it. I ask for the shape in the prompt, with an example, and parse what comes back.
When the model answers in prose, the app says so. It never pretends a paragraph is a list.
:::

---

type: statement

# What crosses the wire?
[+] A sentence with a shape

---

type: section

# 6. The action

---

type: section

# Demo: a part goes missing

::: notes
D5, with the Structured Observation on screen. Take a part out of the tray.
The Trigger fires, the C# Agent notifies the supervisor and writes the log entry.
Fallback if the Agent is not stable: the recording.
:::

---

type: image
src: !todo "left to right: camera, a Python box labelled vision, a speech-bubble with a sentence, a C# box labelled Agent Framework, then a notification bell and a log file; a dashed boundary around the camera and the vision box marks where the image stops"
alt: the image stops at the vision boundary; only text reaches the agent

the image stops here; the agent gets a sentence

::: notes
Two processes, joined at the OpenAI-compatible endpoint Foundry Local serves on localhost.
The Agent is C# on Microsoft Agent Framework, through a hand-written IChatClient adapter, as Bruno Capuano did.
:::

---

type: bullets

## The incident log
- the Trigger that fired
- the Observation that fired it
- the time
- [+] never a Frame

---

type: statement

# What crosses the wire?
[+] Text. The Agent never sees an image.

::: script
The Agent cannot leak a picture it was never given. That is not a promise. It is the architecture.
:::

---

type: section

# What stays at the edge

---

type: bullets

## Three questions
- [+] May the image leave the site?
- [+] Is the load continuous?
- [+] Is the network there when the decision is due?

::: script
Three questions. If any answer pushes you local, the image stays where it was taken.
And only text leaves.
:::

---

type: stat

# 4 cameras
at most, served by this laptop's iGPU at one Observation every 10 seconds

::: notes
10 s divided by a 2.3 s median, rounded down. An upper bound, one model serving the Feeds in series, for this Hardware Profile only.
:::

---

type: comparison

::: At the edge
- ~$2.50 per camera per month
:::

::: Rented cloud GPU
- ~$29 per camera per month
:::

::: Per-minute video API
- ~$4,320 per camera per month
:::

::: notes
Order-of-magnitude model by Fora Soft on AWS list prices, for a continuously watched camera. Not an invoice.
Continuous load is the shape a per-call API bills worst. For bursty load, the cloud is cheaper and simpler.
:::

---

type: bullets

## Where it runs in production
- the PC already at the station
- an industrial Intel edge box beside the camera
- an on-premises server for many stations

::: notes
Edge boxes from Advantech, OnLogic, ASRock Industrial, Lenovo, Neousys, Vecow ship today with Windows IoT or Ubuntu.
There the runtime that travels is OpenVINO GenAI. Their Series 1 and 2 NPUs are 11 to 13 TOPS against this laptop's 48; Series 3 edge parts reach 50.
Laptop figures do not transfer to those boxes. Measure the box.
:::

---

type: statement

# The image stays.
[+] The conclusion may leave.

::: script
So the question was never local or cloud. It was what crosses the wire.
:::

---

type: image
src: !todo "several factory stations, each keeping its camera images inside a small local boundary, sending only short text sentences up to a single agent in Azure"
alt: stations keep their frames and send sentences to a cloud agent

the agent you saw at 11:35, fed sentences, never frames

::: script
Want to see all your stations from head office? Send the sentences to a Foundry agent.
Every frame stays on the machine that took it. Nothing in this design has to change.
:::

---

type: statement

# This is not about switching off the Wi-Fi
[+] It is about deciding what leaves the machine

---

type: statement

# Airplane mode has been on the whole time

::: notes
Payoff. Point at the icon that has been on screen since the second slide.
:::

---

type: statement

# What is kept is a sentence
[+] never a face

---

type: statement
link: https://github.com/emepetres/local-vision-playground

# Clone it. Measure your own machine.

::: notes
Everything shown is in the repo, with the benchmarks and the decisions behind them.
:::

---

type: section

# Questions
