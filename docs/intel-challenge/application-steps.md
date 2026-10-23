# Intel Industry Solution Builders Challenge — Application Steps

Working document for the **Application Steps** section of the project form (AI Edge track,
`builders.intel.com`). The form must be answered in **American English**. The draft answers
below are proposals under discussion, not final text. Character limits are the form's own;
the count next to each draft is measured, not estimated.

## What the form asks

The section is marked **optional**. Its only prompt, verbatim:

> Use this section to describe how your application works in a step-by-step sequence.
> Please enter your information in English language.

Form notes:

- There are no fixed questions. The section is a numbered list of steps, added with
  **+ Add New Steps** and removed with a bin icon. The form numbers them 1, 2, 3, … in order.
- Each step has two required fields:
  - **Step Title**: plain text, 50 characters.
  - **Step Description**: rich text, 1000 characters. Heading 1, Heading 2, Heading 3 or
    Normal; numbered and bulleted lists; bold, italic, underline and strikethrough. No links,
    images or tables.
- No visible limit on the number of steps.
- No PDF upload in this section.
- "Please do not post any confidential information about your product."

## Settled framing

Inherited from [`overview.md`](./overview.md), [`details.md`](./details.md) and
[`additional-info.md`](./additional-info.md): submitted by Plain Concepts in the first
person plural; framed as an open-source accelerator that Plain Concepts adapts to each
commercial use case; Intel first; only what is built counts as a feature; the hardware is
an edge PC, never a laptop; limits are measured, not hidden; it never identifies people.

From `additional-info.md`: this section carries the sequence, camera → Observation →
Trigger → Action; Additional Info says *why* the pieces are shaped as they are, not the
order they run in.

Settled for this section:

- **Prepare, then operate.** One step for preparing the edge PC (the only time the network
  is used, and where the Benchmark picks the hardware), then the running loop. Adapting the
  accelerator to a customer's cell is a Plain Concepts process, not an application step, and
  is told in Details Q7 and Additional Info.
- **One worked example throughout**: a worker reaches into the cell without gloves. Each
  step says what happens to that moment, until the incident closes when gloves are back on.
- **Eight steps**: prepare the edge PC; describe the work cell in text; capture the present
  frame; observe on the Arc GPU; hand over text, never images; a trigger opens an incident;
  the agent notifies and logs; ask the camera in plain language.
- **The Scene Question is the Watch's other mode.** An emitting Watch must be structured
  (`--emit` needs `--structured`), and under `--structured` the standing question steers
  nothing. Step 8 presents asking in plain language as a second mode of the same Watch, never
  as something that raises incidents.
- **Frames on disk**: step 5 says no frame is written to disk by default. The opt-in flag
  that keeps observed frames is a developer's debugging aid and is not mentioned.
- **Figures sparingly**: at most one per step, and only where it clarifies. The gloves
  example runs on the 4B model, so the 2B's 2.3 s per Observation is never cited for it.
- **Format**: a short Normal paragraph, then 2–4 bullets with a bold lead-in; no headings;
  about 500–800 characters per step. In the text blocks below, `**…**` marks bold and is not
  typed literally.

## Step 1

Title:

```text
Prepare the Intel edge PC once
```

Description:

```text
Preparing the station is the only time the network is used. We export Qwen3-VL to OpenVINO IR with INT4 weights using Optimum Intel, and pull the agent's small language model from Microsoft Foundry Local.

- **The benchmark picks the hardware.** It runs the same frame and prompt on the Arc GPU, the NPU and the CPU, and stores every run with its hardware profile, so the device is chosen from measurements, not guessed.
- **Then the network can go.** From here on the station observes and acts offline, with runtime telemetry disabled.
```

## Step 2

Title:

```text
Describe the work cell in plain text
```

Description:

```text
What the station watches is written down, not trained. The vision prompt names the work zone (a green mat in our cell) and the tray beside it. A work cell file lists the names that count as a bare or a gloved hand, and which triggers are on and how many observations in a row each one needs.

- **No dataset, no retraining.** Watching for something new means editing a sentence or a list.
- **Triggers ship only when measured.** A missing-part trigger is built and tested, and ships switched off: a 2B-4B model misses small parts on the tray too often to rely on it.
```

## Step 3

Title:

```text
Capture the present frame
```

Description:

```text
The camera feeds a watch that asks for one observation at a set cadence, such as every few seconds. In our example, a worker reaches into the cell without gloves.

- **Always the present.** When inference takes longer than the cadence, the watch skips ahead instead of queuing, so every observation describes what is in front of the camera now, not a backlog.
- **Shortfall is reported.** Each observation records how many cadences and frames it skipped to reach the present, so a site can see whether its hardware keeps up.
```

## Step 4

Title:

```text
Observe the cell on the Intel Arc GPU
```

Description:

```text
Qwen3-VL-4B (INT4) runs on the Arc GPU through OpenVINO GenAI and returns a structured observation: every object it sees, how many, and where it is (in the tray, on the zone, held in a hand, or elsewhere).

- **Hands are objects too.** The model names each hand bare or gloved. In our example it reports a bare hand on the zone.
- **A malformed reply is not a guess.** If the model does not answer in the expected shape, the observation says so and counts as no evidence either way.
- **Any Intel device.** The same step runs on the NPU or the CPU by configuration.
```

## Step 5

Title:

```text
Hand over text, never images
```

Description:

```text
The vision process writes each observation as one line of JSON to a local file: the time, the objects and where they are, and any shortfall. The agent is a separate process that reads this file and nothing else.

- **The agent never sees an image.** Privacy follows from the architecture, not from a policy someone has to follow.
- **No frame is kept.** By default no frame is written to disk; it is discarded once observed.
- **Nobody is identified.** An observation lists objects and hands; nothing in it identifies a person.
```

## Step 6

Title:

```text
A trigger opens an incident
```

Description:

```text
The agent tests each observation against the triggers in the work cell file. A trigger is a deterministic rule, never a decision left to the model.

- **Two in a row.** A bare hand on two consecutive observations opens one incident, so a single misread frame raises nothing.
- **One episode, one incident.** The same bare hand seen again raises no new alert. The incident closes on its own after two consecutive observations without a bare hand, once gloves are back on.
- **Doubt counts for nothing.** An observation the model could not shape, or one that failed, neither advances nor clears the streak.
```

## Step 7

Title:

```text
The agent notifies the supervisor and logs it
```

Description:

```text
When an incident opens, a C# agent built with Microsoft Agent Framework hands it to a small language model, Qwen2.5-1.5B on the CPU through Foundry Local. The model writes the sentence the supervisor reads and calls two tools: notify the supervisor and log the incident.

- **Once per incident, not per frame.** The language model runs only when a trigger fires.
- **A safety net.** If the model does not call both tools, times out or fails, a template sentence is used and the agent still notifies and logs exactly once. The log records which of the two acted.
- **What is kept is a sentence.** The log holds the trigger, the observation that fired it and the time, never an image. Today the notification is a Windows desktop notification.
```

## Step 8

Title:

```text
Ask the camera a question in plain language
```

Description:

```text
The same watch has a second mode for the line lead. Instead of listing objects for the agent, it answers a question typed in plain language, such as "is there a phone or a cup on the green mat?"

- **The question stands.** Every following observation answers it from its own frame, until the line lead replaces it.
- **A new question, not a new model.** Nothing is trained or redeployed. On our work cell photos, that question was answered correctly 13 times out of 13, in 1.3 to 2.3 seconds on the Arc GPU.
- **Same station, same privacy.** The same model on the same Intel PC answers, and the frame never leaves the machine.
```

## Measured lengths

Counted on the text blocks above as they will be pasted, without the `**` markers; the
second figure counts each line break as two characters.

| Step | Title | Limit | Description | Limit |
| ---- | ----: | ----: | ----------: | ----: |
| 1    |    30 |    50 |     528/531 |  1000 |
| 2    |    36 |    50 |     558/561 |  1000 |
| 3    |    25 |    50 |     516/519 |  1000 |
| 4    |    37 |    50 |     553/557 |  1000 |
| 5    |    28 |    50 |     515/519 |  1000 |
| 6    |    27 |    50 |     592/596 |  1000 |
| 7    |    45 |    50 |     728/732 |  1000 |
| 8    |    43 |    50 |     614/618 |  1000 |
