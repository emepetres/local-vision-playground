# Intel Industry Solution Builders Challenge — Details

Working document for the **Details** section of the project form (AI Edge track,
`builders.intel.com`). The form must be answered in **American English**. The draft answers
below are proposals under discussion, not final text. Character limits are the form's own;
the count next to each draft is measured, not estimated.

Form notes:

- All twelve questions carry the form's "required" marker, but Q12 says of itself that it is
  "optional and only applicable for applications that have already been deployed".
- Q1 and Q9 are 100-character plain-text boxes; Q5 and Q11 are 2000-character rich-text
  boxes; Q12 is 5000 characters and accepts up to 5 PDFs (20 MB each).
- Q2, Q3, Q4 and Q8 are multi-select lists; Q6, Q7 and Q10 are Yes/No.
- Q3's "Other (specify below)" option shows no text box until it is selected.
- "Please do not post any confidential information about your product."

## Settled framing

Inherited from [`overview.md`](./overview.md): submitted by Plain Concepts in the first
person plural; framed as an open-source accelerator that Plain Concepts adapts to each
commercial use case; Intel first; only what is built counts as a feature; the hardware is
an edge PC, never a laptop; limits are measured, not hidden; it never identifies people.

## Reference: Intel's documents behind Q5 and Q6

### Open Software Platform (v3.4, 08/2026) — the Q5 "click here" list

| Function | Components |
| --- | --- |
| AI Algorithm Implementation | 3D Diffusion Policy (for robotics) · Anomalib (for anomaly detection) · Diffusion Policy (for robotics) · Diffusion Transformer (for robotics) · Time Series Analytics (microservice) |
| AI Inference and Model Deployment | Model Registry microservice · Multi-modal Embedding Serving (microservice) · OpenVINO for GenAI · OpenVINO Toolkit (Runtime, Model Server, Model API) · Optimum Intel (for GenAI) · Pytorch (version 2.7 and newer) · Tensorflow (with Intel Extension for Tensorflow) · vLLM with OpenVINO · llama.cpp with OpenVINO · VLM Inference Service |
| Data Analytics & Machine Learning | Gradient Boosting Optimizations · High Performance Python components · Intel Extension for Scikit-Learn · Isolation Forest microservice · Modin (including Intel optimizations) · Random Forest microservice |
| Media Handling and Processing | Audio Analyzer microservice · Deep Learning Streamer (or Pipeline Server) · Document Ingestion microservice · FFmpeg with Intel optimization (QSV/VA-API) · Gstreamer with Intel optimization (QSV/VA-API) · MediaPipe with OpenVINO calculator · Multi-level Video Understanding microservice · OpenCV optimized with oneAPI · Vector Retriever microservice · Video Chunking Utilities · Video Processing Libraries · Visual Data Preparation microservice |
| Miscellaneous | GenAI microservices (OPEA) · Intel Scenescape (spatial intelligence engine) · Intel toolkit for Local AI Assistant (SuperBuilder) · Intel toolkit for Hybrid AI Agents (SuperClaw) · Edge Node Infrastructure Blueprint · Other software components optimized with oneAPI libraries |

What `vision/pyproject.toml` pins from that list: `openvino-genai`, `openvino` and
`optimum-intel` (with `optimum`). OpenCV is the stock `opencv-python` wheel, not a
oneAPI-optimised build.

### Application Ready Verification Guide (Rev 2.1, January 2026) — the Q6 "click here" link

Five steps: (1) acquire a system from Intel's Recommended Systems Catalog, or request access
to the Edge AI Testbed; (2) install the Edge AI Sizing Tool (`intel/edge-ai-sizing-tool`);
(3) configure a workload that mimics the application — "Computer Vision" with Object
Detection (DLStreamer), or "Natural Language Processing" with Text Generation — uploading
the model as an OpenVINO IR zip, then export the tool's report as PDF; (4) submit the
Application Ready Verification Form (system details, pipeline description, a photo of the
system, a block diagram and the report); (5) Intel reviews and may meet the team.

Appendix A replaces steps 2–3 with running the real application: capture the hardware
(`msinfo32` / `dmidecode`), the runtime libraries in use (`tasklist /m` / `lsof`), and
CPU/GPU/NPU utilisation at light, medium and heavy load. Software baseline: Ubuntu 22.04/24.04
or Windows 11, OpenVINO (latest), Python 3.10+, Node.js 22+, the Intel GPU and NPU drivers.
Support: intel.edge.ai.application.qualification@intel.com.

## Q1: Type of AI workload (100 characters)

```text
Agentic AI on generative computer vision: a local VLM describes the camera feed; an agent acts on it
```

## Q2: Where the AI workload takes place (select all that apply)

Options: Edge Compute Device · Client/PC · Cloud Service Provider · Data Center (On Prem)

Answer: **Edge Compute Device**, **Client/PC**. The Windows PC already at the station is the
Client/PC; the fanless industrial Core Ultra box is the Edge Compute Device. An on-premises
server for several stations is a deployment shape, not something built or measured, so Data
Center is left out.

## Q3: Hardware components that run the AI workload (select all that apply)

Options: Intel CPU · Intel CPU with integrated NPU · Intel GPU (integrated) · Intel GPU
(discrete) · Intel® Gaudi® AI accelerator · Other (specify below)

Answer: **Intel CPU**, **Intel CPU with integrated NPU**, **Intel GPU (integrated)** — the
three measured in the Benchmark (CPU, NPU and Arc iGPU).

## Q4: Hardware the application runs on (select all that apply)

Options: Intel Atom® x7 processor or newer · 13th Gen Intel® Core™ processors or newer ·
Intel® Core™ Ultra processors series 1 or series 2 · 5th Gen Intel® Xeon® Scalable processors
or Intel® Xeon® 6 processors · Intel® Xeon® D-1800 or D-2800 processor product family ·
Intel® Xeon® E-2400 processor product family · Intel® Xeon® W-2400 or W-3000 processor
product family · Intel® Arc™ B-series graphics · Intel® Gaudi® AI accelerator · None of the
above

Answer: **Intel® Core™ Ultra processors series 1 or series 2** (the Core Ultra 7 258V is a
Core Ultra 200V, measured on CPU, Arc GPU and NPU) and **13th Gen Intel® Core™ processors or
newer** (an i7-13700KF Benchmark, CPU path through Foundry Local).

## Q5: Ingredients from the Open Software Platform (2000 characters)

Placeholder: "Please list each software ingredients on a separate row. If you don't use any
ingredients, then type "N/A"."

One row per ingredient, with Intel's own name and what it does here. OpenCV is left out
(the stock wheel, not the oneAPI build), and so is NNCF, which is not on Intel's list.
PyTorch is used only by the export toolchain, and the row says so.

```text
OpenVINO for GenAI: runs Qwen3-VL (INT4) on the Intel Arc GPU, the NPU and the CPU
OpenVINO Toolkit (Runtime): the inference runtime beneath OpenVINO GenAI
Optimum Intel (for GenAI): exports Qwen3-VL to OpenVINO IR with INT4 weights
Pytorch (version 2.7 and newer): PyTorch 2.14, used by the model export toolchain
```

## Q6: Onboarded on a qualified Intel® AI Edge System? (Yes / No)

Answer: **No**. Verification through the Edge AI Testbed (Appendix A, running the real
application) is a separate step; if it completes before submission, this becomes Yes.

## Q7: Commercially available today? (Yes / No)

Answer: **No**. It is an open-source (MIT) accelerator that Plain Concepts adapts per
project, not a priced product.

Selecting No opens a required text box, "If no, when will it be available?", with no
visible character limit:

```text
The open-source base is available today on GitHub under the MIT license. It reaches customers as a Plain Concepts engagement rather than an off-the-shelf product: we adapt it to each customer's use case, cameras and edge hardware, so it is commercially available as soon as a project is scoped. Our next step is a first pilot on a fanless Intel Core Ultra edge system.
```

## Q8: Geographies where it will be available (select all that apply)

Options: Central & South America · APJ - Asia Pacific, Japan, Australia, New Zealand ·
EMEA - Europe, Middle East, Africa · India · North America - USA, Canada · PRC - People's
Republic of China · None of the above

Answer: **EMEA - Europe, Middle East, Africa**, **North America - USA, Canada**, **Central &
South America** — where Plain Concepts delivers projects.

## Q9: Hardware ODMs/OEMs it is qualified to operate on (100 characters)

Placeholder: "Please provide each ODM/OEM name on a separate row. If this question does not
apply to you, then type "N/A"."

```text
N/A
```

No OEM qualification exists; naming the edge vendors would imply one.

## Q10: Contracted Distribution Partners or Value-Added Resellers? (No / Yes)

Answer: **No**. Delivery is through Plain Concepts' own professional services.

## Q11: How customer support is managed — technical, sales and marketing (2000 characters)

Placeholder: "For example: phone support, dedicated account, sales, marketing and technical
support people, etc."

Facts behind it: many Plain Concepts projects carry a support agreement, not all; Plain
Concepts has alliances with Intel and Microsoft and co-markets with both. No SLA figure or
24/7 promise is made.

```text
Plain Concepts delivers and supports every adaptation of the accelerator directly, with no reseller between us and the customer.

- Sales: each customer has an account manager who owns the relationship, from the first scoping workshop through delivery and any follow-on work. Our alliances with Intel, as an Intel Partner Alliance member, and with Microsoft bring us into joint opportunities and let us involve their field teams when a deal needs it.
- Technical support: the engineers who adapt the accelerator to the customer's use case are the ones who support it. Many projects carry a support and maintenance agreement, with service levels sized to the customer's operation and its hours; where one is not contracted, support is provided under the project itself. Because the base is open source (MIT), its issues and fixes are tracked publicly on GitHub, and a fix made for one customer reaches every other.
- Marketing: we co-market with both Intel and Microsoft, through joint customer stories, events and webinars. We also present the accelerator ourselves at developer conferences, where it runs live with the network switched off.
```

## Q12: Success stories with measurable improvement and business value (5000 characters)

"(Note: Response is optional and only applicable for applications that have already been
deployed)". Up to 5 PDFs.

```text
N/A
```

The application has not been deployed. The form marks the question required, so `N/A`
keeps it from blocking publication; prior Plain Concepts work is told in Overview, not here.

## Measured lengths

Counted on the text blocks above; the second figure counts each line break as two
characters, in case the form does.

| Question | Characters | Limit |
| -------- | ---------: | ----: |
| Q1       |        100 |   100 |
| Q5       |    314/317 |  2000 |
| Q7 (No)  |        368 |     — |
| Q9       |          3 |   100 |
| Q11      |  1141/1145 |  2000 |
| Q12      |          3 |  5000 |
