# Local Vision Playground

A demo and teaching playground for multimodal vision running entirely on the operator's own machine, with no cloud involved. It exists to show what local-first multimodal inference feels like in practice — what it takes to load a vision model, how it performs across different hardware, and how its output can drive an agent.

## Language

### Capture

**Feed**:
The continuous stream of images coming from a camera attached to the local machine.
_Avoid_: stream, video, source, input

**Frame**:
A single still image taken from the Feed at one point in time. The unit of work everything downstream operates on.
_Avoid_: snapshot, capture, still, photo

### Understanding

**Observation**:
What the model reports about a Frame — what is present in it and how it is described.
_Avoid_: detection, caption, description, result, inference

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

**Local-First**:
The constraint that every stage — capture, understanding and action — runs on the Operator's machine, with no request leaving it. It is the reason the project exists, not an optimisation applied to it.
_Avoid_: offline, on-prem, edge, air-gapped

### Measurement

**Benchmark Run**:
One measured execution of a fixed workload against one model on one Execution Provider.
_Avoid_: test, trial, profile, benchmark

**Hardware Profile**:
The machine-and-Execution-Provider combination a Benchmark Run is attributed to. Two Benchmark Runs are only comparable when named against their Hardware Profiles.
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
