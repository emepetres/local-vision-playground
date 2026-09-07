# Local Vision Playground

A demo and teaching playground for multimodal vision running entirely on the operator's own machine, with no cloud involved. It exists to show what local-first multimodal inference feels like in practice — what it takes to load a vision model, how it performs across different hardware, and how its output can drive an agent.

## Language

### Capture

**Feed**:
The continuous stream of images coming from a camera attached to the local machine. A Feed
does not yield usable Frames the instant it opens — the camera needs a moment to settle
before what it reports is what is actually in front of it. Nor does it wait: it goes on
producing images while nothing is reading it, so a reader that comes back after a pause is
handed the past until it has discarded the [[Stale Frame]]s standing between it and now.
_Avoid_: stream, video, source, input

**Frame**:
A single still image the rest of the system reasons over — normally taken from the Feed at
one point in time, though an image file on disk is a Frame too. The Feed is the canonical
source of Frames, not the only one. The unit of work everything downstream operates on.
_Avoid_: snapshot, capture, still, photo

**Stale Frame**:
An image the Feed produced while nobody was reading it, discarded unobserved so that the
Frame observed is the present. Not the same thing as the Frames a Feed discards while it
settles: those say *the camera is not ready yet*, a Stale Frame says *what you are being
handed is no longer now*. The same read, a different fact — which is why a [[Watch]] counts
them apart.
_Avoid_: dropped frame, skipped frame, backlog, buffered frame

### Understanding

**Observation**:
What the model reports about a Frame — what is present in it and how it is described.
_Avoid_: detection, caption, description, result, inference

The avoided words name the Observation. "Inference" is still the name of the *act* of
running the model over a Frame, which is a different thing and has no other name: hence
the `inference` module and the inference latency, which is the cost of that act and the
one cost that is the latency of the Observation.

**Structured Observation**:
An Observation the model is asked to return as a fixed shape — a list of the objects
present in a Frame rather than free-form prose. Same concept as an Observation, asked
for differently. Whether an object being present *matters* is a [[Trigger]], not this.
_Avoid_: object detection, bounding boxes, labels, classification

**Scene Question**:
A natural-language question an Operator asks about a Frame, answered from that Frame alone.
_Avoid_: prompt, query, ask

### Watching

**Watch**:
A continuous run of Observations over a live [[Feed]], produced at a requested [[Cadence]]
for as long as the Operator lets it run. A Watch produces Observations in series; it does
not relate them to one another. Noticing that something changed between two of them is a
[[Trigger]], not a Watch — every Observation a Watch produces stands on its own Frame, as
any Observation does.
_Avoid_: loop, monitor, stream, session, live mode

**Cadence**:
How often a Watch is asked to produce an Observation. A request, never a guarantee: when
inference takes longer than the Cadence a Watch does not fall behind by queuing, it skips
the moments it has already passed and observes the present. Cadence is therefore the one
number that makes a machine's shortfall countable — what it costs to be too slow is a
count of skipped Cadences, not a growing delay.
_Avoid_: interval, rate, fps, frequency, period

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

A Variant is *identified* by its **Variant id**, which carries the version, and *named* by
its **Variant name**, which does not — `qwen3-vl-2b-instruct-generic-cpu`. The name is the
Variant across every version of it, so naming one leaves the version to the catalogue,
exactly as an Alias leaves the Execution Provider to Foundry Local. That is what lets a
Variant be named in source without a version being written there with it — and it is why
the id that was actually resolved is always reported.
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

**Measured Variant**:
Every Benchmark Run taken against one [[Variant]] within one Benchmark, what loading it
cost, and which turn it took. The turn is part of it, not bookkeeping around it: a Variant
measured second was measured on a machine that had just had another model taken off it,
and reversing the order is the only way to check whether that mattered.
_Avoid_: result, entry, row, per-variant benchmark

**Unmeasured Variant**:
A [[Variant]] that never got onto the hardware within a Benchmark, and the reason it did
not. It is part of the Benchmark, not an error that ended one: a published Variant that
will not load on this machine is exactly the sort of thing an Operator runs a Benchmark to
find out, and the other Variants' numbers are worth more than the traceback. A Benchmark
that measured nothing at all is still a failure — a Benchmark of only Unmeasured Variants
has no result to report.
_Avoid_: failed variant, error, skipped variant, crash

**Token Divergence**:
Two [[Measured Variant]]s within one Benchmark that generated materially different amounts
of text, and therefore did materially different amounts of work. It is a property of the
Benchmark rather than of either Variant — it is the *comparison* it invalidates, not the
numbers, which are each true of the Variant that produced them. A Benchmark carries its
Token Divergence so that a reader cannot be handed the latencies without it.
_Avoid_: warning, token mismatch, unfair comparison, drift

**Benchmark**:
The set of comparable Benchmark Runs carried out in one sitting — every model, every
repetition — and the unit that is persisted and read back later. One Workload for the
whole sitting is what makes its Measured Variants comparable at all. A Benchmark Run is
one number; a Benchmark is what is worth keeping.
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
