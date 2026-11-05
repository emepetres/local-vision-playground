# Local-first physical AI on Intel — a whitepaper series

Three whitepapers, written by Plain Concepts and reviewed and approved by Intel before
publication, that draw on the work in this repository. Each one stands on its own, but read
in order they describe a single architecture: what runs on the **device**, what a **plant**
decides on site, and what the **cloud** receives. The thread joining them is that the image
stays where it was taken and only text leaves it.

**What "physical AI" means here.** AI that perceives the physical world and decides about it
on site. The thing that acts is a person or a plant system — a notification, an incident
record, a message to the line — not a motor. Closed-loop control in milliseconds (a robot's
brake, a sprayer nozzle) is out of scope, and the series says so rather than implying it.

Every paper follows the stance of [`business-value.md`](../business-value.md): **limits are
measured, not hidden**. Each one opens with an executive summary for decision-makers, and its
body is written for architects.

## 1. On-device vision AI: CPU, GPU and NPU on Intel Core Ultra

_Working title. Leans technical; readers are architects and developers._

When does a vision-language model belong on the client's own silicon, and which engine on
that silicon should run it? This paper answers with measurements, not datasheets. It runs the
same Qwen3-VL model on an Intel Core Ultra PC through two runtimes — Foundry Local and
OpenVINO GenAI — across CPU, Arc iGPU and NPU. Then it reports what the numbers say, even
where that cuts against the expected story. The integrated GPU wins throughput (56 tok/s
against the NPU's 21.8). The NPU's case is warm start and power, not peak speed. And the INT4
recipe an accelerator demands can cost more accuracy than the bit width alone suggests. It
gives practitioners a method for repeating the comparison on their own hardware (a fixed
workload, a pinned model variant, results kept as files) and a decision guide for matching
model, quantisation and engine to the job. It deliberately says nothing about factories.

## 2. Edge manufacturing: watching the work cell without the image leaving it

_Working title. Leans business; readers are plant, IT/OT and data-protection leads._

A manufacturer wants each assembly station watched for a handful of events: a worker without
gloves, a foreign object in the work zone, a part missing from the tray. The line lead should
also be able to ask in plain language about what the camera sees, without anyone training a
new detector. This paper argues that, for this workload, running on the station's own edge PC
is the requirement, not a compromise. The camera films workers, which makes the images
personal data under GDPR and usually a matter for the works council. Plant networks are
segmented by design. And a camera observed every few seconds, all shift, is the load that
per-call cloud APIs bill worst. It describes an architecture in which a local vision-language
model turns frames into text Observations and an agent decides and acts only on that text, so
it cannot leak an image it never received. It names the levers it claims (data residency,
cost of a continuous camera, offline operation) and the one it does not (actuation latency).

## 3. Intel Xeon in the cloud: the other half of a local-first architecture

_Working title. Leans architectural; readers are cloud architects and IT decision-makers._

If the image never leaves the station, what does the cloud still do, and on what hardware?
This paper covers the cloud half of the hybrid. Stations send only text upward, and in Azure
the latest-generation Intel Xeon processors (Xeon 6 and successors) run the work that spans
the whole fleet: aggregating Observations across plants, agents that reason over them, and
analytics on top. It also examines when a small multimodal model can be served on Xeon with
AMX instead of a GPU, and what that means for availability and cost. Its claims will rest on
a new measurement taken with this repository's Benchmark tool: Qwen3-VL and the agent on an
Azure Xeon VM against a GPU VM, compared on cost per Observation. That measurement does not
exist yet, and the paper is not published with numbers until it does.
