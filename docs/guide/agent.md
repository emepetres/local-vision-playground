# `agent` — running the Agent next to the Watch

The Agent is a second process, in `agent/`. It never opens the camera and never sees a
Frame — it reads the file a Watch writes and decides what to do about what it says
([ADR-0003](../adr/0003-the-agent-consumes-observations-not-images.md),
[ADR-0014](../adr/0014-observations-cross-as-a-json-lines-file.md)). Run the two side by
side, in two terminal panes:

```bash
# pane 1, from vision/
uv run watch --structured --emit ../vision/observations.jsonl

# pane 2, from agent/
dotnet run
```

```
Agent watching Work Cell 'work cell' (D:\dev\local-vision-playground\agent\work-cell.json)
  Model: qwen2.5-1.5b-instruct-generic-cpu:4 (CPUExecutionProvider)
  Tray expects: soldering iron, solder, brush, tweezers, jumper wires, circuit board
  Zone allows: soldering iron, solder, brush, tweezers, jumper wires, circuit board
Triggers in force:
  - working without gloves (N=2): a bare hand is visible
Watching D:\dev\local-vision-playground\vision\observations.jsonl for the present onward...
New Watch — variant qwen3-vl-2b-instruct-cuda-gpu:2, every 2s. Every Trigger re-armed.
no gloves: 1/2
Incident fired — A bare hand is visible without gloves. Actions: notified supervisor, logged incident.
Incident cleared — gloves on.
^C
```

The Agent starts before the Watch does and waits for the file to exist; a Watch that is
restarted mid-run is picked up as a new one and every Trigger re-arms, so a streak never
survives a Cadence the Agent never saw. Nothing about this pairing is a network call: the
two processes meet only at the file on disk, and the Agent's own model runs locally like
the Watch's does.

## How to read the header

**Model** is which model actually answered the last Incident's turn and its Execution
Provider — printed once, resolved before the first Observation is read, the same stance
`watch`'s own header takes toward the model it loaded. It is pinned rather than chosen at
random: `qwen2.5-1.5b-instruct-generic-cpu:4` is the only candidate that called both
Actions reliably on this machine, on the CPU — the NPU and GPU Variants of the same
candidate dropped one of the two, every run (see the
[tool-call reliability measurement](../benchmarks/tool-call-reliability-zenbook-20260925-114415.md)).
That is also why the Watch and the Agent are told apart by hardware: the Watch runs the
vision model on the iGPU, the Agent runs its own text model on the CPU, and the two never
share an Execution Provider.

**Tray expects** and **Zone allows** are the Work Cell's own lists, read from
`work-cell.json`. **Triggers in force** is what the file turned on, each with its N — the
number of consecutive Observations a condition has to hold before it becomes an Incident.

## What happens when a Trigger fires

A Trigger does not fire on one Observation. It builds a streak — `no gloves: 1/2` — and
only becomes an **Incident** once the condition has held for N Observations in a row. That
is the moment, and only that moment, the model is asked to do anything: a turn runs once
per Incident, never once per Observation.

The Incident is handed to the model as text — the Trigger, its condition in words, the
Observation line exactly as it crossed, and the time. Never a Frame. Alongside it the model
gets two Actions as tools, `notify_supervisor` and `log_incident` — a Windows toast and an
entry in `agent/incidents/incidents.jsonl` — each taking the one sentence a Supervisor will
read. Nothing else: no system prompt. Every one measured made this small model write the
calls out as text instead of making them, and the tools' own descriptions are enough (see
[ADR-0015](../adr/0015-our-own-ichatclient-over-foundry-local.md#no-system-prompt)).

**If the model does not act — and the Agent always checks — it acts for it.** A tool call
never made, one written out as prose instead of invoked, an exception, or a turn that does
not finish inside its bound (about 60 s, comfortably above the ~15-25 s this model takes)
all fall back to the same path: a template sentence, the same two Actions, performed once.
The incident log's `agent_acted` field says which happened, and `agent_acted_reason` says
why when it did not — so a run where the model never once wrote its own sentence is visible
in the log, not just in a terminal an audience may not be watching. Either way the Incident
is notified exactly once and logged exactly once: never both the model's attempt and the
safety net's.

Clearing takes no model turn at all: when the condition has failed for N Observations in a
row, the Incident just closes, logged with its id so it can be matched back to the entry
that opened it.

## The flags

- `--observations PATH` — the file to follow. Default: `vision/observations.jsonl`,
  resolved against the repository root so neither pane needs to be started from a
  particular directory.
- `--work-cell PATH` — the Work Cell file. Default: `agent/work-cell.json`.
- `--incidents PATH` — the directory the incident log is written to. Default:
  `agent/incidents`.
- `--variant ID` — pin the Agent's own text model, exactly as `--variant` does for `watch`.
  Default: `qwen2.5-1.5b-instruct-generic-cpu:4`, the pinned candidate above.

## What is not unit-tested

Our own `IChatClient` against the real Foundry Local, and the Windows toast itself — the
same stance the rest of the codebase takes
([ADR-0015](../adr/0015-our-own-ichatclient-over-foundry-local.md)). The whole-Agent tests
drive every safety-net path — a tool call never made, one written as text, an exception, a
timeout — through a scripted fake `IChatClient` instead; they prove the Agent's own logic,
not the SDK underneath it.
