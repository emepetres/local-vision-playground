# Intel Industry Solution Builders Challenge — Additional Info

Working document for the **Additional Info** section of the project form (AI Edge track,
`builders.intel.com`). The form must be answered in **American English**. The draft answers
below are proposals under discussion, not final text.

## What the form asks

The section is marked **optional**. Its only prompt, verbatim:

> Use this section to provide us with any additional information that can help us
> understand how your application works and the value it provides to your customers.
> Please use the guidance principals as a reference. Please enter your information in
> English language.

Form notes:

- There are no fixed questions. The section is a list of free blocks, labelled
  "Section 1", "Section 2", … in order, added with **+ Add New Section** and removed with a
  bin icon. A block has **no title field**: any heading has to be written inside its body.
- Each block is a rich-text editor: Heading 1, Heading 2, Heading 3 or Normal; numbered and
  bulleted lists; bold, italic, underline and strikethrough. No links, images or tables.
- Each block shows a character counter ("0 characters") with no visible limit.
- No PDF upload in this section.
- "The guidance principals" is not a link on the page, and no document of that name is
  listed under the challenge's Resources or Help pages.
- "Please do not post any confidential information about your product."

## Settled framing

Inherited from [`overview.md`](./overview.md) and [`details.md`](./details.md): submitted
by Plain Concepts in the first person plural; framed as an open-source accelerator that
Plain Concepts adapts to each commercial use case; Intel first; only what is built counts
as a feature; the hardware is an edge PC, never a laptop; limits are measured, not hidden;
it never identifies people.

Settled for this section:

- **Only what Overview and Details leave out.** Depth and measured evidence, never a
  restatement of the business problem, the features or the use cases.
- **Four blocks**: (1) why it is built this way, (2) measured on Intel hardware, (3) the
  limits we measured and how the design absorbs them, (4) roadmap. Privacy is told inside
  block 1, as a consequence of the architecture, not as a block of its own.
- **No step-by-step sequence here.** [Application Steps](./application-steps.md) is a
  numbered list of steps ("Solution Title" + "Solution Description") that describes how
  the application works in sequence: camera → Observation → Trigger → Action belongs
  there. Block 1 says *why* the pieces are shaped as they are, not the order they run in.
- **Today's findings, not hard limits.** What the agent's model does on the GPU and NPU,
  and the repetition in our INT4 export, are told as where the project stands now, each
  with the work that addresses it. Only numbers measured on Intel hardware are cited; the RTX 4090
  Benchmark is left out.
- **At most ~2000 characters per block**, with bullets and bold lead-ins so it can be
  scanned.
- **Each block opens with a Heading 2.** In the text blocks below, `## ` marks the line to
  set as Heading 2 and `**…**` marks bold; neither is typed literally.

## Section 1: Why it is built this way

```text
## Why it is built this way

- **Two processes, one text seam.** Vision (Python) turns camera frames into Observations, short descriptions in text, and writes them to a local JSON Lines file. The Agent (C#, Microsoft Agent Framework) reads that file and nothing else. The agent never receives an image, so privacy is a property of the architecture, not a policy someone has to follow. The same seam lets a plant forward incidents to a central dashboard while every frame stays at the station that took it.
- **One model port, two runtimes.** The application talks to the vision model through a single interface. Behind it, OpenVINO GenAI reaches the Arc GPU, the NPU and the CPU, and Microsoft Foundry Local runs on the CPU. Moving to another Intel device is a configuration change, not a rewrite.
- **A watch discards, it never queues.** Every Observation describes the present frame. When the hardware cannot keep up with the requested cadence, the watch skips ahead and reports how many moments it missed. A safety alert about a scene thirty seconds old is worse than none.
- **Rules decide when, the model decides what to say.** Triggers are deterministic rules over consecutive Observations ("a bare hand on two in a row"), so a single misread frame raises nothing. The agent's language model runs once per incident, not once per frame: it writes the sentence the supervisor reads and calls the notification and logging tools. If it fails to call them, a safety net acts for it, exactly once, and the log records which of the two acted.
- **Nothing leaves the machine.** Once the models are prepared, it runs with the network off and runtime telemetry disabled. What is kept is a sentence in a local log, never a frame and never a face.
```

## Section 2: Measured on Intel hardware

Source: the Benchmark of 2026-09-22 (`docs/benchmarks/asus-zenbook-s14-…-090814.md`), the
Work Cell spike (`docs/research/2026-09-24-work-cell-spike.md`) and the tool-call
reliability measurement (`docs/benchmarks/tool-call-reliability-zenbook-20260925-114415.md`).

```text
## Measured on Intel Core Ultra

Every number below was measured with the application's own benchmark on an Intel Core Ultra 7 258V (Arc 140V GPU, Intel AI Boost NPU), and each run is stored in the repository with its hardware profile.

**Vision model throughput** (Qwen3-VL-2B, INT4, one 640x360 frame, median of four warm runs):
- Arc GPU, OpenVINO GenAI: 2.3 s per Observation, 56.0 tokens/s
- CPU, OpenVINO GenAI: 4.6 s, 27.8 tokens/s
- NPU, OpenVINO GenAI: 5.9 s, 21.8 tokens/s, and the fastest to load (2.3 s)
- CPU, Microsoft Foundry Local: 8.0 s, 11.5 tokens/s

Moving from the CPU to the Arc GPU through OpenVINO GenAI gives almost five times the throughput, on the same machine.

**Accuracy on the real work cell** (Qwen3-VL-4B on the Arc GPU, 32 photos taken with the station's camera):
- Bare hands recognized on 8 of 9 photos, with no false alarm on gloved hands or any other photo
- A phone or cup on the work mat answered correctly on 6 of 6 photos, on the mat and off it
- 4 to 10 s for a full list of the objects in the cell; 3.9 s for nine yes/no questions about one frame

**Agent reliability**: the agent's small language model (Qwen2.5-1.5B, CPU) called both of its tools on 10 of 10 test incidents.
```

## Section 3: Limits we measured, and how the design absorbs them

```text
## Where it stands today, and how we handle it

We measure what a small model at the edge can do before we promise a feature. What follows is where the project stands today, not a ceiling: most of it is open engineering work, and the design keeps it from reaching the line supervisor meanwhile.

- **Small parts are beyond a 2B-4B model.** A thin brush and a pair of tweezers on the tray go unseen on many photos, so a "part missing from the tray" trigger would fire constantly. We built and tested it, and it ships switched off. A larger model, a closer camera or a crop of the tray are the ways forward, and the benchmark will tell which one a given site needs.
- **The 2B model is not enough for gloves.** It rarely tells a bare hand from a gloved one, so the gloves trigger runs on the 4B model on the Arc GPU.
- **Our INT4 export can repeat itself, for now.** We traced it to the quantization recipe the NPU requires, which our current export applies to every device. It is a property of today's export, not of the hardware: a finer recipe for the GPU and CPU is our next step, and a guard in the parser already stops a reply at its first repeat.
- **One device per job, today.** In our current tests the agent's small model called its tools reliably only on the CPU, so for now the agent runs there and the vision model keeps the Arc GPU to itself. Bringing the agent onto the GPU or NPU is open work on model choice and configuration, not a ceiling.
- **Every site is different.** Our photos come from one camera position, one lighting setup and one glove type. Validating the triggers on the customer's own cell is the first step of every adaptation.
```

## Section 4: Roadmap

```text
## What comes next

- **Capacity and cost per station**: from a benchmark and the cadence a site needs, how many cameras one Intel edge PC can serve, next to what the same Observations would cost from a cloud vision API.
- **Better quantization**: a finer INT4 recipe for the Arc GPU and the CPU, a better one for the NPU, and a repetition penalty in generation.
- **The agent on Intel accelerators**: other small language models and configurations, so the agent can run on the NPU or the Arc GPU alongside the vision model.
- **More of the work cell**: a trigger for any foreign object left in the work zone, not only the ones named in advance.
- **Larger and newer models**: Qwen3-VL-8B through OpenVINO, and newer Qwen vision models as they reach the Intel GPU, for the small parts that 2B-4B models miss.
- **Intel verification**: the Application Ready Verification on the Edge AI Testbed, running the real application on a qualified Intel AI Edge System.
- **A first pilot** on a fanless Intel Core Ultra edge system at a customer's assembly station.
```

## Measured lengths

Counted on the text blocks above as they will be pasted, without the `## ` and `**`
markers; the second figure counts each line break as two characters.

| Section | Characters | Limit |
| ------- | ---------: | ----: |
| 1       | 1718/1724  |     — |
| 2       | 1205/1222  |     — |
| 3       | 1635/1643  |     — |
| 4       | 1024/1032  |     — |
