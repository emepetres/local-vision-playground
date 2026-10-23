# Intel Industry Solution Builders Challenge — Overview

Working document for the **Overview** section of the project form
(AI Edge track, `builders.intel.com`). The form must be answered in **American English**.
The draft answers below are proposals under discussion, not final text. Character limits are
the form's own; the count next to each draft is measured, not estimated.

Form notes:

- Q1–Q4 and Q6 are free text; Q3 and Q4 also accept up to 5 PDFs (20 MB each) — optional.
- Q5 is a pick-up-to-3 list. Q6 refers to Intel's use-case list (v3.4, 08/2026), reproduced
  below.
- "Please do not post any confidential information about your product."

## Settled framing

- **Submitted by Plain Concepts**, written in the first person plural ("we").
- **Framed as an open-source accelerator**: Plain Concepts' technology base for
  monitoring an assembly station on a production line with a vision-language model on the
  station's own PC, an agent that acts on what it reports, and nothing leaving the machine.
  It demonstrates the technology, and Plain Concepts adapts it to each commercial use case.
  That it began as a teaching playground is said, not led with.
- **Why we enter at all**: the programme's requirements (v3.4, 08/2026) ask for a
  commercially deployed application on a purpose-built edge device, not a consumer PC.
  Intel's own people invited Plain Concepts to enter with this project, so we enter as an
  accelerator and do not ask isbc@intel.com first. Plain Concepts is an active Intel Partner
  Alliance member. The Foundational deadline is 2026-12-15.
- **Intel first**: Core Ultra with its Arc iGPU and NPU, reached through OpenVINO GenAI,
  with the measured numbers; Foundry Local and Microsoft Agent Framework are the
  application layer on top.
- **Limits are measured, not hidden**: mentioned briefly and as a strength, with one or two
  concrete examples. The full account belongs in Details or the PDFs.
- **Only what is built counts as a feature**: Observations, Scene Questions, the Watch,
  Structured Observations, two Runtimes, the Benchmark, the working-without-gloves Trigger,
  the C# Agent with its notification, incident log and safety net, and offline operation.
  Capacity and cost (backlog item 9) is at most a one-line next step.
- **Hardware is an edge PC, never a laptop**: "an Intel Core Ultra edge PC at the station",
  developed and benchmarked on a Core Ultra 7 258V, portable to fanless industrial Core
  Ultra edge systems through OpenVINO GenAI. The Zenbook appears only in the Benchmark PDF.
- **Prior work, without client names**: worker-safety computer vision on a plant floor and
  HoloLens inspection of electrical substations for an energy group. Clients are named only
  if they authorise it; no years are given.
- **Ethics is said outright**: it never identifies people — Intel may decline applications
  that do.
- **PDFs**: `docs/business-value.md` attached to Q3; the Zenbook Benchmark and the Work
  Cell spike attached to Q4. Exported to `pdf/`, with the Plain Concepts logo top right on
  every page; relative links point at the files on GitHub's `main`.

## Q1: Project Name (60 characters)

```text
Local Vision Accelerator: On-Device Work Cell Safety
```

The repository keeps its name, `local-vision-playground`; it is linked from Details.

## Q2: Project Description (150 characters)

```text
A vision-language model watches a factory work cell on an Intel edge PC; a local agent flags safety incidents. No image ever leaves the machine.
```

## Q3: Business problem (2000 characters)

PDF: [`pdf/business-value.pdf`](./pdf/business-value.pdf), from `docs/business-value.md`.

```text
Manufacturers want every assembly station watched for a handful of events: someone working the cell without gloves, a foreign object left in the work zone, a part missing from the tray. When one happens, the line supervisor should know at once and the event should be on record. The line lead at the station should also be able to ask, in plain language, about what the camera sees right now, without anyone training a new detector.

Three facts about a real plant make the cloud the wrong answer, not just a more expensive one:

- The camera films workers. Images of identifiable employees are personal data under GDPR in Europe and comparable workplace-privacy rules elsewhere, and continuous monitoring of staff usually needs the works council's or union's agreement. "The images never leave this PC" gets such a project approved; "the images go to a third-party API" starts a negotiation.
- The plant floor network is segmented. Operational-technology networks are commonly cut off from the internet by design. A solution that needs a cloud round-trip needs a hole in that design.
- The load is continuous. A camera asking for an observation every few seconds, all shift, every shift, is exactly the workload per-call cloud APIs bill worst. Industry estimates put continuous analysis at roughly $2.50 per camera per month on edge hardware, against about $4,320 on a per-minute cloud video API: a thousandfold spread, in order of magnitude.

Today's edge answer is a fixed-class detector: accurate on the list it was trained for, retrained whenever that list changes, and blind to any question nobody anticipated. What the plant lacks is a system that understands the scene in language, runs on hardware already at the station, and keeps every image on the machine that took it.
```

## Q4: How it solves the problem, with 3 or 4 key features (2000 characters)

PDFs: [`pdf/benchmark-intel-core-ultra-7-258v.pdf`](./pdf/benchmark-intel-core-ultra-7-258v.pdf),
from `docs/benchmarks/asus-zenbook-s14-intel-core-ultra-7-258v-20260922-090814.md`, and
[`pdf/work-cell-spike.pdf`](./pdf/work-cell-spike.pdf), from
`docs/research/2026-09-24-work-cell-spike.md`.

```text
Local Vision Accelerator is Plain Concepts' open-source (MIT) base for on-device vision agents, which we adapt to each customer's use case. It runs the whole loop (observe, ask, decide, act) on one Intel Core Ultra edge PC at the station: a camera feeds a small vision-language model (Qwen3-VL, INT4), and a C# agent built with Microsoft Agent Framework acts on what it reports. We have delivered worker-safety computer vision on plant floors and HoloLens inspection of electrical substations; this brings that work to on-device generative AI.

1. The whole loop on one Intel PC, offline. Vision runs on the Arc GPU or the NPU through OpenVINO GenAI, or on the CPU through Microsoft Foundry Local; the agent runs its own small language model on the CPU. Once prepared, it keeps working with the network gone and telemetry off.

2. Ask in plain language, no retraining. The line lead types a question ("is there a phone or a cup on the green mat?") and every observation from then on answers it. It can also list the objects in the cell and where each one is, for the agent's triggers to test. Changing what is watched means writing a sentence, not training a detector.

3. Privacy by architecture. Vision and action are separate processes that meet at a local file of text observations: the agent never receives an image. When a worker is seen without gloves on consecutive observations, the agent notifies the supervisor and logs the incident as a sentence. It never identifies people: no faces, no images stored, no data leaves the station.

4. Measured on Intel CPU, GPU and NPU. A built-in benchmark records every run against its hardware profile. On the Core Ultra 7 258V we develop on, the Arc GPU sustains 56 tokens/s against 21.8 on the NPU and 11.5 on the CPU through Foundry Local, and OpenVINO GenAI carries it to fanless industrial Core Ultra edge systems. Limits are measured too: small parts on a tray are beyond a 2B-4B model, so that trigger ships switched off.
```

## Q5: Industry (select up to 3)

Options: Agriculture · Education · Energy · Financial Services and Banking · Government ·
Healthcare · Hospitality and Restaurants · Life Sciences · Manufacturing · Retail · Robotics ·
Safety and Security · Transportation and Warehousing

Answer: **Manufacturing**, **Safety and Security**.

## Q6: Use cases (2000 characters)

Intel's list of use cases, by industry (the form's "click here" link):

- **Robotics** — Industrial Robot Arm, Collaborative Robot, AGV, AMR, Robotics Vision Control,
  Humanoid & Vision Language Action (VLA)
- **Manufacturing** — Anomaly Detection, Operations Diagnostics, Predictive Maintenance,
  Process Optimization, Quality Inspection & Assurance, Worker Safety
- **Retail** — Loss Prevention, Order Accuracy, Self-Checkout
- **Healthcare & Life Sciences** — Patient Monitoring, Image Analysis, Clinical decision
  support, Surgical Instruments, Microscopy and digital pathology, Lab automation
- **Education** — Smart Classroom, Shared Compute / VLABS, Smart Campus, Offline LLMs
- **Security and Surveillance** — Advanced Video Search, Smart NVR, Live Video Stream
  Analysis, Perimeter and access monitoring, Loitering Detection, Video Summarization
- **Smart Cities & Transportation** — Intersection management, Smart Parking & Tolling,
  Fleet and heavy equipment telematics and operations, Critical infrastructure monitoring,
  Predictive maintenance & Anomaly detection, Emergency Response
- **Smart Buildings** — Energy & HVAC Optimization, Occupancy & Space Utilization,
  Predictive Maintenance, Access Control & Security Monitoring
- **Federal and Aerospace** — Handheld Speech-to-Text Device, Avionics and Flight Control,
  Unmanned Systems and Drones

```text
Primary use case: Worker Safety (Manufacturing). PPE compliance at an assembly station. The system watches the work cell continuously and opens an incident when someone works the cell without gloves on consecutive observations; the incident closes on its own once gloves are back on. The supervisor gets a desktop notification, and the incident goes to a local log as text, with no image. This runs today on Intel Core Ultra, with the 4B model on the Arc GPU.

Second use case: Live Video Stream Analysis (Safety and Security). Natural-language questions over a live camera feed. The line lead asks "is there a phone or a cup on the green mat?" and every following observation answers it until the question is replaced; on our work cell photos that question was answered correctly 13 times out of 13. Each answer is about the present frame: when the hardware cannot keep up, the watch skips ahead rather than queuing, and reports what it missed.

The same pipeline extends to:
- Quality Inspection & Assurance and Anomaly Detection: a foreign object left in the work zone, a tool missing from the tray. Small parts need a larger model or a closer camera, and we have measured where today's 2B-4B models stop.
- Retail: shelf gaps and planogram checks on the store's own back-office PC, where the cost of continuous cameras is the deciding factor.
- Energy: critical infrastructure monitoring at transformer substations and other unmanned, often disconnected sites, where the network cannot be relied on when a decision is due.

It deploys in three shapes: a Windows PC already at the station; a fanless industrial Core Ultra edge box beside the camera, with OpenVINO GenAI on Linux; or an on-premises server serving several stations. Because the agent consumes text, not images, a plant can send incidents to a central dashboard while every frame stays at the station that took it.
```

## Measured lengths

Counted on the text blocks above; the second figure counts each line break as two
characters, in case the form does.

| Question | Characters | Limit |
| -------- | ---------: | ----: |
| Q1       |         52 |    60 |
| Q2       |        144 |   150 |
| Q3       | 1781/1789  |  2000 |
| Q4       | 1977/1985  |  2000 |
| Q6       | 1881/1890  |  2000 |

Q4 is near its limit: a further edit there has to give characters back.
