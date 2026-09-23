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

**Present**:
What a reader of a held [[Feed]] hands over when it is asked for an image: the one the
camera produced most recently, together with the count of [[Stale Frame]]s it discarded to
reach it. The two are one thing because neither is worth having alone — an image with no
count might be the past, and a count with no image is arithmetic about nothing.
_Avoid_: latest, current frame, newest image, live frame

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
A natural-language question an Operator asks about a Frame, answered from that Frame alone —
from no earlier Frame and no earlier answer. There is no follow-up: *and what colour is it?*
is not a question this project can answer, because nothing the model was told a moment ago is
still there to be referred back to.

A Scene Question outlives the Observation that answers it. Once it stands over a [[Watch]] it
is what that Watch asks from its next [[Cadence]] onward, until the Operator replaces it — a
*standing* question steers the Watch rather than interrupting it. *Composing* one is the other
half and does interrupt: the Operator suspends the Watch to compose the question, and the Watch
produces nothing until the question is composed or the composing is abandoned. One act seen at
two moments — the composing stops the Watch, the question that results steers it.
_Avoid_: prompt, query, ask

### Watching

**Watch**:
A continuous run of Observations over a live [[Feed]], produced at a requested [[Cadence]]
for as long as the Operator lets it run. A Watch produces Observations in series; it does
not relate them to one another. Noticing that something changed between two of them is a
[[Trigger]], not a Watch — every Observation a Watch produces stands on its own Frame, as
any Observation does. Every Observation a Watch produces answers the [[Scene Question]]
standing when its Frame was taken — the plain description, until an Operator asks for
something else. It runs continuously except where the Operator suspends it to compose a
[[Scene Question]], which is the one thing that stops it short of the Operator ending it.
_Avoid_: loop, monitor, stream, session, live mode

**Cadence**:
How often a Watch is asked to produce an Observation. A request, never a guarantee: when
inference takes longer than the Cadence a Watch does not fall behind by queuing, it skips
the moments it has already passed and observes the present. Cadence is therefore the one
number that makes a machine's shortfall countable — what it costs to be too slow is a
count of skipped Cadences, not a growing delay.
_Avoid_: interval, rate, fps, frequency, period

**Shortfall**:
What reaching one [[Cadence]] cost a machine that could not reach it on time: the Cadences
abandoned on the way and the [[Stale Frame]]s discarded to observe the present. One thing
rather than two numbers, because one skip forward incurred both. A Shortfall belongs to the
moment it happened and is reported there, on the [[Observation]] it was paid for — averaging
it over a [[Watch]] would take away the half an [[Operator]] can act on. A Cadence reached on
time has no Shortfall, and says nothing about either count. Nor does a Cadence the Operator
suspended the Watch across to compose a [[Scene Question]]: the machine did not fall short,
the Operator chose to stop, and when the Watch resumes it starts its grid afresh so that the
time spent composing is never a skipped Cadence.
_Avoid_: lag, delay, drift, overrun, backlog

### Runtime

**Runtime**:
What loads a model onto the machine and runs it on an [[Execution Provider]]. This project
uses two: [[Foundry Local]] and [[OpenVINO GenAI]]. A Runtime is not an implementation
detail of a [[Variant]] — it is the reason naming the hardware is no longer enough: the
same Execution Provider reached through two Runtimes is two different measurements, which
is why a [[Hardware Profile]] names one.
_Avoid_: engine, framework, backend, provider

**Foundry Local**:
Microsoft's on-device model runtime, which serves models from the local machine over a
local endpoint. The Runtime *with a catalogue*: it publishes [[Variant]]s, and given an
[[Alias]] it chooses the [[Execution Provider]] for you.
_Avoid_: Local Foundry, the runtime, the service

**OpenVINO GenAI**:
Intel's on-device inference runtime, and the second [[Runtime]] this project uses. It has
no catalogue: it runs a model already on disk, on the [[Execution Provider]] it is told to
use, and never chooses one. It is here because Foundry Local's catalogue on the demo
machine publishes no vision build beyond CPU — the NPU and the Arc iGPU are reachable only
through it.
_Avoid_: OpenVINO, OV, the Intel runtime

**Execution Provider**:
The hardware backend the model is dispatched to — NPU, GPU or CPU. The term is this
project's own rather than any one [[Runtime]]'s: Foundry Local carries it inside a Variant
id, OpenVINO GenAI receives it as the device it is told to run on. Which one is used is
what a Benchmark Run is measuring.
_Avoid_: accelerator, device, backend, target

The avoided words belong to one Runtime or another. "Device" in particular is OpenVINO's
own word for this, which is exactly why it is not ours.

**Alias**:
The name of a model without a hardware or a version attached — `qwen3-vl-2b-instruct`.
Naming one leaves the choice of Execution Provider to Foundry Local, which is why an
Alias alone cannot name a Hardware Profile. An Alias is a [[Foundry Local]] concept only:
the second [[Runtime]] has no catalogue to ask and never chooses hardware for you.
_Avoid_: model name, model id, family

**Variant**:
One build of a model for one Execution Provider, belonging to exactly one [[Runtime]].
Naming a Variant instead of an Alias is the only lever there is over which hardware the
work runs on; nothing selects an Execution Provider directly.

What identifies a Variant is whatever its Runtime can say about it. [[Foundry Local]]
publishes them, so one of its Variants is *identified* by its **Variant id**, which carries
the version — `qwen3-vl-2b-instruct-generic-cpu:2` — and *named* by its **Variant name**,
which does not — `qwen3-vl-2b-instruct-generic-cpu`. The name is the Variant across every
version of it, so naming one leaves the version to the catalogue, exactly as an Alias
leaves the Execution Provider to Foundry Local. That is what lets a Variant be named in
source without a version being written there with it — and it is why the id that was
actually resolved is always reported.

A Variant we built ourselves has no catalogue behind it and therefore no id to resolve. It
is identified by its [[Provenance]] instead.
_Avoid_: build, flavour, SKU, model version

**Provenance**:
What a [[Variant]] no catalogue published is identified by: the weights it came from, the
recipe it was exported with, and the [[Execution Provider]] it was exported for. It is the
half of a Variant's identity that a Variant id hands over for free — so a [[Foundry Local]]
Variant satisfies it by naming its id, and one of ours has to state it. A path on disk is
not an identity, and a Benchmark is persisted to be read months later.

The *recipe* is one named part of a Provenance — the export command and its arguments, and
the field of that name the conversion step writes into `provenance.json` — not another word
for the whole: calling the whole "the recipe" would lose the weights and the Execution
Provider standing beside it, which is why only the part carries the name.
_Avoid_: source, origin, lineage

**Local-First**:
The constraint that every stage — capture, understanding and action — runs on the Operator's machine, with no request leaving it. It is the reason the project exists, not an optimisation applied to it.

It governs *operating* the machine, not *preparing* it. Obtaining a model, exporting a
[[Variant]], refreshing a catalogue and running a [[Benchmark]] may all use the network;
once the machine is prepared, observing and watching must go on with the network gone.
"No request" is literal — it includes the telemetry a [[Runtime]] would send on its own,
not only the Frames.
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
not. It covers a Variant that would not *load* or would not *run*, not one that would not
*export*: a Variant that never exported is not one a Benchmark can name, so that failure
belongs to the conversion that produced it, not to the Benchmark. It is part of the
Benchmark, not an error that ended one: a published Variant that will not load on this
machine is exactly the sort of thing an Operator runs a Benchmark to find out, and the
other Variants' numbers are worth more than the traceback. A Benchmark
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
The machine, [[Runtime]] and [[Execution Provider]] combination a Benchmark Run is
attributed to. The Runtime is part of it rather than bookkeeping around it: a Hardware
Profile exists to authorise a comparison, and two Benchmark Runs on the same CPU through
different Runtimes are not the same measurement — they are the calibration between the two
Runtimes, which is the one pair a Benchmark most needs to keep apart. The Runtime names the
Execution Provider; the machine is whatever the Operator declares it to be, so a Hardware
Profile is only as trustworthy as what they wrote down. Two Benchmark Runs are only
comparable when named against their Hardware Profiles — and only then if their Workloads
match. A Hardware Profile authorises a comparison; it does not identify a Benchmark Run —
that is the [[Measured Variant]]'s work. A Benchmark is one sitting on one machine, so the
machine is constant across it and only the Runtime and Execution Provider vary from Run to
Run; comparing across machines is comparing two Benchmarks.
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
