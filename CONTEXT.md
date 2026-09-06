# Local Vision Playground

A demo and teaching playground for multimodal vision running entirely on the operator's own machine, with no cloud involved. It exists to show what local-first multimodal inference feels like in practice — what it takes to load a vision model, how it performs across different hardware, and how its output can drive an agent.

## Language

### Capture

**Feed**:
The continuous stream of images coming from a camera attached to the local machine. A Feed
does not yield usable Frames the instant it opens — the camera needs a moment to settle
before what it reports is what is actually in front of it.
_Avoid_: stream, video, source, input

**Frame**:
A single still image the rest of the system reasons over — normally taken from the Feed at
one point in time, though an image file on disk is a Frame too. The Feed is the canonical
source of Frames, not the only one. The unit of work everything downstream operates on.
_Avoid_: snapshot, capture, still, photo

### Understanding

**Observation**:
What the model reports about a Frame — what is present in it and how it is described.
_Avoid_: detection, caption, description, result, inference

**Structured Observation**:
An Observation the model is asked to return as a fixed shape — a list of the objects
present in a Frame rather than free-form prose. Same concept as an Observation, asked
for differently. Whether an object being present *matters* is a [[Trigger]], not this.
_Avoid_: object detection, bounding boxes, labels, classification

**Scene Question**:
A natural-language question an Operator asks about a Frame, answered from that Frame alone.
_Avoid_: prompt, query, ask

### Runtime

**Foundry Local**:
Microsoft's on-device model runtime, which serves models from the local machine over a local endpoint.
_Avoid_: Local Foundry, the runtime, the service

**Execution Provider**:
The hardware backend the model is dispatched to — NPU, GPU or CPU. Which one is chosen is what a Benchmark Run is measuring.
_Avoid_: accelerator, device, backend, target

**Alias**:
The name of a model without a hardware or a version attached — `qwen3-vl-2b-instruct`.
Naming one leaves the choice of Execution Provider to Foundry Local, which is why an
Alias alone cannot name a Hardware Profile.
_Avoid_: model name, model id, family

**Variant**:
One build of a model for one Execution Provider, version suffix included —
`qwen3-vl-2b-instruct-generic-cpu:2`. Naming a Variant instead of an Alias is the only
lever there is over which hardware the work runs on; nothing selects an Execution
Provider directly.
_Avoid_: build, flavour, SKU, model version

**Local-First**:
The constraint that every stage — capture, understanding and action — runs on the Operator's machine, with no request leaving it. It is the reason the project exists, not an optimisation applied to it.
_Avoid_: offline, on-prem, edge, air-gapped

### Measurement

**Workload**:
Everything that has to be identical for two Benchmark Runs to be comparable: the prompt, the
exact Frame — its bytes, not merely its resolution — and the limits the model generates
under. A larger Frame is more work for the model, so the working resolution *bounds* a
Workload; it does not on its own fix one.
_Avoid_: task, job, prompt, request

**Benchmark Run**:
One measured execution of one Workload against one model on one Execution Provider.
_Avoid_: test, trial, profile, benchmark

**Benchmark**:
The set of comparable Benchmark Runs carried out in one sitting — every model, every
repetition — and the unit that is persisted and read back later. A Benchmark Run is one
number; a Benchmark is what is worth keeping.
_Avoid_: run, suite, comparison, benchmark run

**Hardware Profile**:
The machine-and-Execution-Provider combination a Benchmark Run is attributed to. Foundry
Local names the Execution Provider; the machine is whatever the Operator declares it to be,
so a Hardware Profile is only as trustworthy as what they wrote down. Two Benchmark Runs are
only comparable when named against their Hardware Profiles — and only then if their
Workloads match.
_Avoid_: rig, environment, setup, config

### Action

**Agent**:
The process that decides what to do in response to Observations. It consumes Observations; it does not produce them.
_Avoid_: assistant, bot, orchestrator, copilot

**Trigger**:
A condition over Observations that causes the Agent to act.
_Avoid_: rule, event, condition, hook

**Action**:
A discrete side-effecting operation the Agent can invoke once a Trigger fires.
_Avoid_: tool, command, function, skill, task

### People

**Operator**:
The person running the playground on their own machine — the one whose camera, hardware and privacy are in question.
_Avoid_: user, presenter, audience, viewer
