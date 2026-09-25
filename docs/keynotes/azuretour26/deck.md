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
D1. `uv run observe --camera 0 --variant qwen3-vl-2b-instruct-generic-cpu:2`. Read the sentence it writes aloud.
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
src: images/work-cell.png
description: "the desk-scale work cell as seen from above: a green cutting mat on the left with a circuit board on it, a white mesh tray on the right holding a soldering iron, a solder spool, a brush, tweezers and jumper wires, a pair of white work gloves with grey palms, a camera on a tripod pointing down at them"
alt: desk-scale work cell with a green mat, a parts tray, gloves and a camera

the work cell, at desk scale

::: notes
The green mat is the Zone, the white tray holds the six parts.
The supervisor wants to know three things: a part goes missing, someone works without gloves, something is left on the mat.
Only gloves are live today. The spike, later, says why.
:::

---

type: image
src: images/system-map.png
description: "the whole system inside one laptop outline with an airplane-mode icon in its corner: a camera, then a box labelled vision (Python, Qwen3-VL), then a single sheet labelled observations.jsonl, then a box labelled Agent (C#, Agent Framework), then a notification bell and a log file; a dashed boundary around the camera and the vision box marks where the image stops; only text flows past it"
alt: camera, vision, a JSON Lines file, the agent, a toast and a log, all on one laptop

the whole system, on one laptop

::: script
This is the whole system. Two processes on one laptop.
The first one sees: it turns a camera frame into text. The second one decides and acts.
Between them there is a file. Remember where the dashed line is: the image never crosses it.
:::

---

type: bullets

## The stack
- Qwen3-VL, 2B and 4B, the model that sees
- Foundry Local 2.0.1, in-process
- OpenVINO GenAI 2026.3, for the GPU and the NPU
- Microsoft Agent Framework 1.22, on .NET 10
- Python for vision, C# for the Agent

::: notes
Every piece is a released version, nothing preview. Agent Framework is on its stable 1.x line.
Qwen3-VL, not Phi-4-multimodal: ADR-0001. Two runtimes: ADR-0012.
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
Reported as microsoft/foundry-local#1075. If asked: fixed by the publisher five days later, as a new version (:4). Nothing the caller did fixed it.
:::

::: script
I asked for a model by its alias, and Foundry Local chose the build for my hardware.
It chose one that cannot load, and nothing I could do as a caller fixed it.
The model you ask for is not the model you get. So name the exact Variant. The whole demo rests on that.
:::

---

type: bullets

## Foundry Local 2.0, in-process
- no service, no HTTP hop
- the image as a typed item, not base64 smuggled in
- one package, no `-winml` split
- telemetry you can switch off
- [+] a pinned Variant starts with no network

::: notes
2.0.1 shipped on 1 September. In 1.x the image went as untyped base64 inside extra_body; now it is an ImageItem, bytes plus a codec hint, in every SDK including C#.
Learn still documents 1.2.x, and no first-party sample combines ChatSession with ImageItem. ADR-0004.
Trap if asked: a ChatSession accumulates turns, so we rebuild it for every request.
:::

::: script
Most of what you will find online is Foundry Local 1.x. This is 2.0, and it changes the shape.
It runs inside my process. The image is a typed object, not a string hidden in a field.
And the last line is the one that matters today: pin the Variant, and it starts in airplane mode.
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
D2. `uv run watch --camera 2 --variant qwen3-vl-4b-instruct-int4-sym-gpu`. This is the 4B on the iGPU: "you will see why".
Type "Is there a phone or a cup on the green mat? Answer in one or two sentences." Cup beside the mat first: the "no" says where the cup is, which is the reasoning moment. Then onto the mat.
Then "What is the person doing? Answer in one sentence."
A question takes effect at the next Cadence. Say so rather than waiting in silence.
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
Here I typed a new question, with no new model and no data scientist.
That flexibility is the reason to run a VLM at all. It is also why its accuracy must be measured.
:::

---

type: statement

# "Answer in one sentence."

::: notes
The cup question: 13 of 13 photos right, 1.3 to 2.3 s per answer on the 4B iGPU. docs/research/2026-09-24-d2-scene-questions.md.
Discarded, notes only: "Is it safe to solder like this?" answers "No" to every photo, with a lecture on eye protection.
:::

::: script
Every question I type ends the same way. Without that bound, a small model keeps talking.
It truncates, it loops, it invents. Bound the answer, and it stays on the photo.
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
- `qwen3-vl` on the CPU
- no GPU build
- no NPU build

::: notes
Verified with `foundry model list` on this machine. The catalogue is filtered per device.
The laptop has an Arc 140V iGPU and an Intel AI Boost NPU. Foundry Local's NPU builds here are all chat models, none with vision.
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
The recipe verified on this laptop, not a general rule. Two exports with the same recipe: the 2B and the 4B.
It runs once, on the CPU, and needs no NPU. OpenVINO is told its device, so one IR serves CPU, GPU and NPU.
If asked: transformers must stay >=4.57,<5.0; convert.py scrubs a system-wide OpenVINO install that shadows the right one; provenance.json records the recipe beside the IR; CACHE_DIR takes the NPU's first compile from ~32 s to ~2 s.
:::

---

type: image
src: images/int4-one-ir.png
description: "one model weight drawn as a row of 16 bits shrinking to a row of 4 bits, then a single file labelled IR feeding three chips side by side: CPU, GPU, NPU"
alt: 16-bit weights compressed to 4-bit, one file for three engines

sixteen bits to four, one file for three engines

::: script
Each weight goes from sixteen bits to four.
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
Same image, same prompt, from the Benchmark of 2026-09-22. Every OpenVINO row repeats like this, on every engine.
Greedy decoding is the setting most prone to loops. On the spike's checklist prompt, 16 of 32 OpenVINO replies looped against 2 of 32 on Foundry Local.
:::

---

type: statement

# The recipe sets the price
[+] not INT4

::: notes
Foundry Local's build is INT4 too: 1.34 GB for the 2B, block-wise, one scale per 32 weights. docs/research/2026-09-25-int4-quantisation.md.
Ours is the coarsest INT4 there is: channel-wise (group-size -1), symmetric, and no INT8 layers (ratio 1.0; optimum keeps 20% by default). ~1.7 GB, larger and still worse.
:::

::: script
Both of these are four bits per weight. So four bits is not the problem. The recipe is.
Ours is the coarsest there is, because the NPU asks for that shape.
And one file serves all three engines, so the GPU and the CPU pay a price only the NPU demands.
:::

---

type: bullets

## Quantising better
- [+] one IR per engine, not one for all
- [+] group-wise INT4 or INT8 for the GPU and the CPU
- [+] group-wise, or AWQ and scale estimation, for the NPU
- [+] a repetition penalty at decode time
- [+] count the loops, not only the tokens per second

::: notes
Each one is a ticket in the repo: #72 (GPU and CPU IR), #73 (NPU recipe), #74 (repetition penalty). #75 looks at reaching the iGPU through Foundry Local's own GPU builds.
How AWQ and scale estimation work stays out of the talk.
:::

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
uv run watch --variant qwen3-vl-2b-instruct-generic-cpu:2
uv run watch --variant qwen3-vl-2b-instruct-int4-sym-gpu
uv run watch --variant qwen3-vl-2b-instruct-int4-sym-npu
```

::: notes
D3, on the 2B and the webcam, each with --ask "What is the person doing? Answer in one sentence."
Same watch, three engines. Only the Variant name changes. Point at the timings as they come in.
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

type: stat

# 2.8x
performance per watt of the NPU over the GPU, measured by Intel on Panther Lake

::: notes
Intel's own lab: Gemma 4 E2B on Core Ultra 7 355, power measured with SocWatch. There the NPU was also faster than the GPU.
Next generation, different model, not this app. Say all three.
For this chip generation Intel's claim is qualitative: sustained AI workloads while remaining energy-efficient.
:::

::: script
Intel has measured where this is going. On Panther Lake, the next generation, the NPU does 2.8 times the work per watt of the GPU.
Different chip, different model, not my app. But that is the direction.
I did not measure energy for this app. Last year, in a talk with Intel, we measured it on this very laptop.
Then a driver update made that impossible, and it still is. So you get Intel's figure, labelled as Intel's.
:::

---

type: statement

# What crosses the wire?
[+] Nothing. Changing engines is changing a name.

---

type: section

# 5. The seam

---

type: stat

# 0 of 11
forced tool calls with an image that the model honoured

::: notes
Spike of 2026-09-15. The model never honoured a forced tool call when the request carried an image.
ADR-0011 records the mechanism that did not survive.
:::

::: script
The Agent needs more than prose. It needs a shape it can test.
I first asked the vision model to call a tool with that shape. It never did, not once in eleven.
So I stopped forcing it. I ask for the shape in the prompt, and parse what comes back.
:::

---

type: code
file: vision/src/vision/inference.py

```
This is a work bench seen from above. The work zone is the green
cutting mat. The tray is the white mesh tray beside it.
List every distinct object you can see, and where it is:
"tray", "zone", "hand" or "elsewhere".
Name each visible hand "bare hand" (skin showing) or "gloved hand".
Reply with ONLY a JSON array of {"name", "count", "where"}.
```

::: notes
The `described` prompt, cut to its key sentences. The full text carries a worked example and "If nothing is there, reply with []".
It names this mat and this tray. That is a debt, recorded in ADR-0016; a --scene flag is the way out.
Structured output gets 256 tokens, prose 128, temperature 0. At 128, only 12 of 32 4B lists fitted.
:::

---

type: comparison

::: Asked in prose
- "Is each visible hand bare or gloved?"
- "bare" on 4 of 6 photos with no hands at all
:::

::: Asked for a shape
- a list of objects and where each one is
- 0 false Triggers on 17 photos with no bare hand
:::

::: notes
Both on the 4B iGPU, the same photos. Prose: 7 of 13 right overall. docs/research/2026-09-24-d2-scene-questions.md.
:::

::: script
A question is flexible, and you saw that in the demo. But a Trigger cannot rest on it.
Asked in prose about hands, the model found bare hands in photos that had no hands.
Asked for a list, it made no false Trigger at all. Asking is for people. A Trigger needs the shape.
:::

---

type: code
file: docs/fixtures/watch-emit-contract.jsonl

```json
{"type": "cadence", "cadence": 1,
 "time": "2026-09-24T10:30:02+02:00",
 "variant": "qwen3-vl-2b-instruct-cuda-gpu:2",
 "outcome": "objects",
 "objects": [
   {"name": "soldering iron", "count": 1, "where": "tray"},
   {"name": "bare hand", "count": 1, "where": "hand"}],
 "truncated": false, "shortfall": null}
```

::: notes
One line of the contract fixture, wrapped for the slide. Both sides test against this file. ADR-0014.
Outcome is exactly one of: objects, no_shape with its reason, failed with its error. The first line of each file describes the Watch.
The file is recreated at every Watch start. Never a Frame, never a path to one, even under --keep-frames.
:::

::: script
This is everything that crosses from vision to the Agent. One line of JSON per Cadence, in a file.
No socket, no shared endpoint. Each process loads its own model.
You can open this file and read everything the Agent ever received. I will, in the demo.
:::

---

type: code
file: agent/work-cell.json

```json
"hands": {
  "bare":   ["bare hand"],
  "gloved": ["gloved hand", "white glove", "glove"],
  "plain":  ["hand"]
},
"triggers": {
  "no_gloves": { "n": 2 }
}
```

::: notes
Excerpt. The file also lists the six parts of the Tray and the Zone, each with the synonyms the model uses: "solder spool", "spool", "solder wire".
A plain "hand" counts as bare unless a gloved hand is named in the same Observation: live, the 4B says "hand", almost never "bare hand".
missing_part is off (refuted), foreign_object deferred (#70). An unknown Trigger or an N below one is refused at start.
:::

::: script
The scenario lives in a text file. What the tray holds, what may lie on the mat, the names the model uses for each.
And which Triggers are on. Today, one: working without gloves, confirmed twice.
Change the scenario, and you edit this file. You do not touch the code.
:::

---

type: bullets

## When a Trigger fires
- [+] its condition holds on N Observations in a row
- [+] it re-arms after N in a row without it
- [+] an Observation with no shape counts neither way
- [+] each firing is one Incident

::: notes
A small model is wrong on single Frames. N consecutive is what keeps its noise off a worker's record.
A failed inference or a reply in prose is never read as evidence either way.
:::

---

type: statement

# What crosses the wire?
[+] One line of JSON

---

type: section

# 6. The action

---

type: statement

# I measured it before I promised it

::: notes
Spike #58: 32 photos, three Variants, four prompts. docs/research/2026-09-24-work-cell-spike.md.
The 2B never says "bare hand" on OpenVINO. The 4B, with the described prompt: 8 of 9 bare hands, 5 of 5 mixed, 0 false.
A missing part: at best 2 of 6 caught, with 9 to 16 false "missing" on 16 photos. The brush and the tweezers are missed systematically.
:::

::: script
This is why the demo runs the 4B. The 2B could not see the work cell.
And I planned the demo on a part going missing from the tray. No local model this size sees that.
So the Trigger is working without gloves. I measured it before I promised it on this stage.
:::

---

type: image
src: images/two-engines.png
description: "the same laptop outline as the system map, zoomed in: on the left the vision process running on a chip labelled Arc iGPU (OpenVINO), on the right the Agent process running on a chip labelled CPU (Foundry Local), a JSON Lines sheet passing between them, and a third chip labelled NPU greyed out with a note 'demo 3'"
alt: vision on the iGPU, the agent on the CPU, a JSON Lines file between them

two processes, two engines

::: notes
The Watch and the Agent never share an Execution Provider by default. The Watch: 4B on the iGPU, ~8 s per structured Frame, a 10 s Cadence.
The Agent: qwen2.5-1.5b-instruct-generic-cpu:4. It is consulted only when a Trigger fires, never per Observation.
:::

---

type: image
src: images/maf-bridge.png
description: "three stacked layers as blocks: at the top 'Microsoft Agent Framework 1.x', in the middle a small highlighted block 'our IChatClient', at the bottom 'Foundry Local 2.0.1'; beside the middle block a faded outline labelled 'the pattern: Bruno Capuano's adapter'"
alt: Agent Framework over our own IChatClient over Foundry Local 2.0.1

Agent Framework, on Foundry Local 2.0.1

::: notes
ADR-0015. Bruno's ElBruno.MAF.FoundryLocal set the pattern: an IChatClient bridge where no first-party one exists. Credit him.
Why we wrote our own: his pins Foundry Local 1.2.1, has no telemetry switch, and drops tool calls when streaming.
Ours: tools map to Foundry Local's tool definitions and back to function-call contents, a fresh ChatSession per call, telemetry off. It is the only class that knows Foundry Local.
In 2.0.1, GetChatClientAsync returns an OpenAI client that implements no IChatClient.
:::

::: script
Agent Framework speaks IChatClient. Foundry Local 2.0 does not give you one in .NET.
Bruno Capuano solved this for 1.x with an adapter, and I followed his pattern.
But 1.x sends telemetry you cannot switch off, and it loses tool calls. So I wrote the same bridge for 2.0.1.
:::

---

type: stat

# 10 of 10
Incidents where the 1.5B model called both tools, on the CPU. On the GPU and the NPU: 0 of 10.

::: notes
docs/benchmarks/tool-call-reliability-zenbook-20260925-114415.md. The GPU build called only log_incident, the NPU build only notify_supervisor.
qwen3-1.7b on the CPU: empty replies. qwen3-4b: prose reasoning, 50 to 100 s. ~15 to 25 s per Incident on the winner.
:::

::: script
The model that sees is not the model that acts.
The vision model runs on the GPU. The model that calls tools reliably only did it on the CPU.
So each one runs where it works, and the laptop uses two engines at once.
:::

---

type: statement

# No system prompt scored best

::: notes
Every system prompt tried scored 0 to 8 of 10. No instructions at all: 10 of 10. The tool descriptions carry the intent.
:::

::: script
I wrote the Agent careful instructions. Every version made it worse.
With no system prompt at all, it called both tools every time. Measure before you polish a prompt.
:::

---

type: section

# Demo: gloves off

::: notes
D5, three panes: the Agent, the Watch with --structured --emit, and the emitted file.
Gloves off, bare hands on the mat. no gloves 1/2, then the Incident, the toast and the log. ~40 s: narrate over the file, never wait in silence.
Fallback: the recording.
:::

---

type: bullets

## The incident log
- the Trigger that fired
- the Observation that fired it
- the model's sentence and the time
- whether the model acted
- [+] never a Frame

::: notes
Point at agent_acted. If the model does not call both tools, throws or takes over 60 s, a template sentence goes through the same two Actions: agent_acted false, with the reason.
An Incident is never lost, and the model's failure is visible, not hidden. Gloves back on: two Cadences, then "Incident cleared", no model turn.
:::

---

type: statement

# What crosses the wire?
[+] Text. The Agent never sees an image.

::: script
The Agent cannot leak a picture it was never given. That is not a promise. It is the architecture.
:::

---

type: bullets

## What this laptop taught me
- pin the Variant
- measure the NPU with its own ruler
- the recipe sets the price
- bound every answer
- a Trigger needs a shape, not a question
- the model that sees is not the model that acts

::: script
Six things I did not know when I started, all measured on this machine.
None of them is on a spec sheet. Each one cost me a wrong assumption first.
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
at most, on this laptop's iGPU, with the 2B at one Observation every 10 seconds

::: notes
10 s divided by a 2.3 s median, rounded down. An upper bound, one model serving the Feeds in series, for this Hardware Profile only.
With the 4B the demo runs, ~8 s per structured Frame: one camera.
:::

---

type: bullets

## Where it runs, and what it costs
- the PC already at the station, an edge box, an on-premises server
- at the edge: ~$2.50 per camera per month
- rented cloud GPU: ~$29
- per-minute video API: ~$4,320

::: notes
Costs: order-of-magnitude model by Fora Soft on AWS list prices, for a continuously watched camera. Not an invoice.
Continuous load is the shape a per-call API bills worst. For bursty load, the cloud is cheaper and simpler.
Edge boxes from Advantech, OnLogic, ASRock Industrial, Lenovo, Neousys, Vecow run OpenVINO GenAI. Their Series 1 and 2 NPUs are 11 to 13 TOPS against this laptop's 48; Series 3 edge parts reach 50. Laptop figures do not transfer. Measure the box.
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
src: images/stations-to-azure.png
description: "several factory stations, each keeping its camera images inside a small local boundary, sending only short text sentences up to a single agent in Azure"
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
