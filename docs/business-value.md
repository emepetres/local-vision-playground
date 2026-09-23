# Business Value

Why an app like this one — a vision-language model reading a camera, an Agent acting on
what it reports, everything on the machine next to the camera — earns its place in a real
business, and where it does not. The technical demo is the evidence; this document is the
case it is evidence _for_.

It is written as if every **Committed** item in the [backlog](./backlog.md)
were built. The research behind it is in
[the value-scenarios note](./research/2026-09-22-local-multimodal-vision-value-scenarios.md)
and [the edge-devices note](./research/2026-09-23-intel-npu-edge-devices.md); vocabulary in
bold is defined in [`CONTEXT.md`](../CONTEXT.md).

## The claim, in one paragraph

Some camera workloads are continuous, and the images they produce may not leave the
premises — by law, by contract, or because the network is not there to take them. For those
workloads a small vision-language model running on hardware already on site is not a
compromise but the requirement, and this demo shows the whole loop working that way:
observe, ask, decide, act, with the network unplugged. It does **not** claim to be what
production already runs. Production today runs small detectors; running a
_vision-language model_ at the edge is where Microsoft and Intel are taking the platform,
and this demo stands about one release cycle ahead of the field — with its limits measured,
not hidden.

## The anchor scenario: a workstation on a production line

A manufacturing plant wants each assembly station watched for a handful of things: a part
missing from the tray, someone working the cell without gloves, a foreign object left in
the work zone. When one of them happens, the line supervisor should know and the event
should be on record. The line lead at the station should also be able to ask, in plain
language, about what the camera sees right now — _is the left tray empty?_ — without
anyone writing a new detector.

Three facts about this plant make the cloud the wrong answer, not merely a more expensive
one:

- **The camera films workers.** Images of identifiable employees are personal data under
  GDPR, and continuous video monitoring of staff usually needs the works council's
  agreement. "The images never leave this PC" is a sentence that gets such a project
  approved; "the images go to a third-party API, under a data processing agreement" is one
  that starts a negotiation.
- **The plant floor network is segmented.** Operational-technology networks are commonly
  cut off from the internet by design. A system that needs a cloud round-trip needs a hole
  in that design; one that runs on the station PC does not.
- **The load is continuous.** A **Watch** asks for an **Observation** every few seconds,
  all shift, every shift. That is the shape of workload a per-call cloud API bills worst.

### Who is who

The scenario has three people where the demo has one:

| In the scenario | What they do                                                           | In the demo                               |
| --------------- | ---------------------------------------------------------------------- | ----------------------------------------- |
| **Worker**      | Works the cell; appears on camera; the one whose privacy is at stake   | The person in front of the camera         |
| **Line lead**   | Starts the Watch at the station and asks Scene Questions               | The **Operator**                          |
| **Supervisor**  | Receives the notification when a Trigger fires; reads the incident log | The desktop notification and the log file |

On a plant floor "operator" means the worker on the line. This document never uses it for
plant staff: the **Operator** is the glossary's term for whoever runs the app, which in the
scenario is the line lead.

## The value levers — which ones this demo claims, and which it does not

| Lever                                     | Claimed?          | Why                                                                                                                                                                 |
| ----------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Data residency** (legal or contractual) | **Primary**       | The images of workers cannot leave the site; here they do not even leave the machine.                                                                               |
| **Cost of a continuous camera**           | **Primary**       | The best-evidenced lever in the research. A Watch is exactly the continuous load that makes cloud vision expensive.                                                 |
| **Operating offline**                     | Secondary         | Shown, not assumed: once the machine is prepared, the demo runs with the network gone.                                                                              |
| **Actuation latency**                     | **Not claimed**   | Real latency cases close a physical loop in tens of milliseconds (a sprayer nozzle, a robot's brake). This demo takes seconds per Observation and actuates nothing. |
| "Privacy" in general                      | Only as residency | Privacy as a vague virtue is a marketing line; privacy as "this data category may not go to a third party" is a requirement.                                        |

### Residency — and why the demo draws the line tighter than the plant needs

**Local-First** in this project means _no request leaves the machine_ while it operates —
not the images, not the Observations, and not the telemetry a **Runtime** would otherwise
send on its own. A plant needs less than that: its boundary is the site network, and an
Agent posting an incident to the plant's own MES or MQTT broker would still keep the data
on site. The demo proves the stricter boundary, so the looser one follows.

Two design decisions make residency a property of the architecture rather than a promise:

- **The Agent never sees an image**
  ([ADR-0003](./adr/0003-the-agent-consumes-observations-not-images.md)). What crosses from
  vision to action is text. Whatever the Agent does, and wherever it might one day run, it
  cannot leak a frame it was never given.
- **Nothing visual is kept.** An incident is a sentence — the Trigger that fired, the
  Observation that caused it, the time — never a picture. A Frame is observed and then it
  is gone. This is data minimisation by construction: _what is kept is a sentence, never a
  face._ Keeping the triggering Frame as evidence is a legitimate production extension, but
  it is the customer's decision to take with their data-protection officer, not a default.

### Cost — made concrete on the machine itself

The research's cost figures are order-of-magnitude models, not audited invoices: for a
continuously watched camera, roughly **$2.50 per camera per month** of compute at the edge,
**~$29** on a rented cloud GPU, and **~$4,320** on a per-minute cloud video API — about a
thousandfold spread (Fora Soft's model built on AWS list prices; see the research note,
§1.1). The demo turns that argument into its own numbers with **Capacity and cost**
(backlog item 9): from a **Benchmark**, at a requested **Cadence**, how many cameras this
**Hardware Profile** could serve at most, next to what the same number of Observations
would cost from a cloud vision API at dated, cited prices.

As an illustration of the arithmetic only: on the demo laptop the Arc iGPU produced a
description in a median of 2.3 s
([Benchmark of 2026-09-22](./benchmarks/asus-zenbook-s14-intel-core-ultra-7-258v-20260922-090814.md)),
so at a Cadence of 10 s one machine could serve at most ⌊10 / 2.3⌋ = 4 cameras in series.
That figure is an upper bound — it assumes one model serving the Feeds one after another,
and concurrency on an NPU or GPU does not scale linearly — and it holds for that Hardware
Profile only.

### Offline — shown by pulling the cable

Local-First governs _operating_ the machine, not _preparing_ it. Downloading the model,
exporting a **Variant**, refreshing the Foundry Local catalogue and running a Benchmark may
all use the network. Once prepared — catalogue cached, Variant id pinned, telemetry off —
`observe` and `watch` go on with Wi-Fi off. Backlog item 10 makes that a rehearsed moment
of the demo rather than a claim: the network is switched off in front of the audience and
the Watch, the Triggers and the Agent carry on.

## What it runs on in production

The demo runs on one laptop. In production the same software lands on one of three shapes,
in order of how directly the demo proves them:

1. **A Windows PC already at the station.** A line workstation, a kiosk, a mini-PC under the
   bench. No new hardware; the app installs like any other. This is Foundry Local's own
   thesis — inference embedded in the app, on the fleet the customer already owns — and it
   is literally what the demo is.
2. **An industrial edge box beside the camera.** Fanless Intel Core Ultra systems from
   Advantech, OnLogic, ASRock Industrial, Lenovo ThinkEdge, Neousys and Vecow ship today
   with 64–128 GB of RAM, Windows 11 IoT Enterprise LTSC and/or Ubuntu 24.04, extended
   temperature ranges and PoE for IP cameras. Here the Runtime that travels is **OpenVINO
   GenAI**, which has an Intel NPU driver on Linux; Foundry Local is tied to Windows and,
   on this hardware, publishes `qwen3-vl` for the CPU only. This is the second reason the
   project has two Runtimes
   ([ADR-0012](./adr/0012-two-runtimes-foundry-local-is-not-the-only-source.md)): not only
   to reach the laptop's NPU, but because it is the path to the edge.
3. **An on-premises server serving several stations** — the evolution of (1) at plant
   scale, where the capacity figure of item 9 stops fitting on one PC.

**An honest caveat about the NPU.** The demo laptop's Lunar Lake NPU is rated at 48 TOPS.
The NPU in the Core Ultra Series 1 and 2 edge parts most boxes ship with today is rated at
11–13 TOPS; only Series 3 (Panther Lake) edge parts reach 50. The laptop's NPU figures do
not transfer to those boxes — which is the rule the project already keeps: a Hardware
Profile authorises no comparison across machines, and comparing machines means comparing
two Benchmarks.

## How the backlog maps onto the scenario

| Backlog item                                   | What it gives the plant                                                                  | Lever                                  |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------- |
| 1. One Observation, on demand                  | A spot check of the cell, from the station PC                                            | Residency                              |
| 2. Benchmark Runs across Execution Providers   | Sizing: which PC or edge box a station needs, measured rather than guessed               | Cost                                   |
| 3. A continuous series of Observations         | The cell watched all shift, with an honest count of what a too-slow machine missed       | Cost                                   |
| 4. Scene Questions                             | The line lead asks a new question in plain language — no new detector, no data scientist | — (the case for a VLM over a detector) |
| 5. Structured Observations                     | The list of objects in the cell, in a shape a Trigger can test                           | —                                      |
| 6. Triggers                                    | _A part is missing; someone is working without gloves; a foreign object is in the zone_  | —                                      |
| 7. The Agent, in C#                            | The supervisor is notified and the incident is logged — as a sentence, with no image     | Residency                              |
| 8. A second Runtime                            | The NPU and iGPU of the laptop, and the Runtime that runs on industrial edge boxes       | Cost, deployment                       |
| 9. Capacity and cost                           | Cameras per machine at a Cadence, next to the cloud bill for the same work               | Cost                                   |
| 10. Runs without a network once prepared       | The Watch and the Agent carry on with the cable pulled                                   | Offline, residency                     |
| 11. Spike: can the 2B model see the work cell? | Knowing which of the plant's conditions the model resolves before any is promised        | — (honesty about quality)              |

Item 4 deserves a word. The existing edge products in the research are detectors: trained
for a fixed list of things, retrained when the list changes. A vision-language model trades
accuracy on that fixed list for a list anyone can change by typing. That trade is the
reason to run a VLM here at all — and the reason its accuracy has to be measured, not
assumed.

## What this demo does not claim

- **It does not match a cloud model's quality.** Every edge system found in the research
  runs a small model, and so does this one — `qwen3-vl-2b-instruct`. The project has
  already measured where that shows: the model does not honour forced tool calls
  ([spike](./research/2026-09-15-forced-tool-call-with-image.md)), and on the demo laptop
  all three int4 OpenVINO Variants fell into repetition loops within 128 tokens
  ([Benchmark of 2026-09-22](./benchmarks/asus-zenbook-s14-intel-core-ultra-7-258v-20260922-090814.md)).
  Whether the 2B model resolves the scenario's Triggers is exactly what the spike (item 11)
  measures; if it does not, the larger 4B and 8B models (Exploratory) are the next
  lever, and the cloud comparison (Exploratory) is where quality is weighed against
  everything above.
- **It is not what production already runs.** Shipping systems — John Deere's See &
  Spray, electronics inspection lines, retail shelf appliances — run YOLO-class detectors
  or narrow small models. Aizip's VLM camera hub, the closest match to this project, is
  still in development. The demo shows the pattern those systems are moving towards, on
  hardware available today.
- **It does not scale elastically.** A station is capped by the machine it runs on. The
  cost lever holds for steady, continuous load; for bursty or occasional load a cloud API
  is cheaper and simpler.
- **It does not solve fleet management.** Updating a model across hundreds of stations is a
  real problem the cloud solves for free, and the reason most production edge systems are
  hybrids.

## The hybrid evolution the architecture already allows

Real industrial edge systems are rarely purely local: they decide at the edge and use a
central system for oversight and retraining. Because the Agent consumes Observations, not
images (ADR-0003), the same architecture allows exactly that split without giving up
residency: **the image never leaves the station; the conclusion may.** A plant could send
Observations and incidents — text — to a central dashboard or an Agent in the cloud while
every Frame stays on the machine that took it. The demo does not do this; it stays
Local-First. But it answers the question a customer asks next — _how do I see all my
stations from head office?_ — without redesigning anything.

## Secondary scenarios

The same mechanism, leaning on a different lever:

- **Care homes, non-clinical.** A resident's corridor, a door left open at night. Residency
  is at its hardest here — health-adjacent data is a special category under GDPR — which
  makes local processing close to mandatory. The boundary is sharp: anything that detects
  a fall or informs care is a medical device under the MDR, and a 2B model cannot carry
  that promise. Lever: residency.
- **Retail shelves.** Gaps on a shelf, planogram compliance, across many stores and many
  cameras. The privacy argument is soft — mostly marketing — but the cost argument is
  strong, and a store's back-office PC is already there. Lever: cost.
- **Disconnected sites.** A substation, a vessel, a farm, a disaster zone: places where the
  network is absent or cannot be trusted to be there when a decision is due, as in the
  defence DDIL and agricultural cases of the research. Lever: offline.
- **Personal: describing surroundings to a blind or low-vision person.** A strong values
  fit for fully local processing — but the most prominent assistive product today, Be My
  Eyes on Meta's glasses, is cloud-dependent by design, so this is a well-motivated
  scenario rather than an established local market.
