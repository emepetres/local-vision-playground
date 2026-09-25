# Computer Vision in Airplane Mode — demo script

The run sheet for demos D1, D2, D3 and D5 of the Azure Tour Sevilla 2026 keynote
(2026-09-26, 12:25). Used for the offline rehearsal
([#67](https://github.com/emepetres/local-vision-playground/issues/67)) and on stage. The
arc and the reasons behind each demo live in [`beat-sheet.md`](./beat-sheet.md); this file
is only what to set up, what to type and what should appear.

All commands are PowerShell, in Windows Terminal. `<repo>` is the clone's root.

## Cameras

Two Feeds, told apart by index:

| Camera                                      | Used by    | Index   |
| ------------------------------------------- | ---------- | ------- |
| Laptop's own webcam, facing the speaker     | D1, D3     | `0` |
| USB camera on the tripod, over the Work Cell (through logi capture) | D2, D5     | `2` |

## The Work Cell (D2, D5)

As photographed in [`docs/fixtures/work-cell/`](../../fixtures/work-cell/) — the setup the
model was validated on. Move nothing from it without re-checking on camera.

- **Camera** on its tripod at the near edge of the desk, looking down and across it. The
  Worker sits at the far side; their hands enter the frame from the top.
- **Green cutting mat** on the left — the Zone. The structured prompt names it, so it must
  be this mat.
- **White mesh tray** on the right, holding the six parts: soldering iron (with its cord),
  solder spool, brush, tweezers, jumper wires, Arduino board.
- **White gloves with the grey palm coating** — the only glove type the model was validated
  on. Not the grey electrical gloves.
- **Red mug** and **phone** for D2, kept off camera until needed.
- Even, steady light; no direct sun patch across the mat.

## Pre-flight — the evening before and on site, on network

Do all of this with the network **on**. Nothing below may run for the first time in airplane
mode.

```powershell
# vision: dependencies, including the OpenVINO runtime the iGPU and NPU Variants need
cd <repo>\vision
uv sync --group convert

# run logi capture and adjust parameters to optimize output quality

# the Foundry Local catalogue cached, and the camera indexes confirmed
uv run observe --camera 0 --variant qwen3-vl-2b-instruct-generic-cpu:2
uv run observe --camera 2 --variant qwen3-vl-4b-instruct-int4-sym-gpu

# agent: built once, and its model resolved once on network
cd <repo>\agent
dotnet build Agent.slnx
dotnet run --project Agent --no-build     # wait for the header, then Ctrl+C
```

Then, on the laptop:

- [ ] The four IRs exist under `%LOCALAPPDATA%\local-vision-playground\ir\`:
      `qwen3-vl-2b-instruct-int4-sym-{cpu,gpu,npu}` and `qwen3-vl-4b-instruct-int4-sym-gpu`.
- [ ] **Notifications will show while projecting.** Settings → System → Notifications:
      Do not disturb off, and under "Turn on do not disturb automatically" untick
      "when duplicating your display" and "when using an app in full-screen mode".
      Otherwise D5's toast never appears.
- [ ] Old rehearsal Incidents moved out of `agent\incidents\incidents.jsonl`, so the log
      shown on stage starts empty.
- [ ] Windows Update paused, OneDrive and Teams quit, battery saver off, charger plugged in.
- [ ] Terminal font large enough to read from the back of the room.
- [ ] The fallback video is on the laptop's disk (not in the cloud) and opens offline.

### Terminal layout

One Windows Terminal window, three panes (`Alt+Shift+D` to split). In every pane, first:

```powershell
$env:PYTHONUTF8 = "1"     # belt and braces for #69: an emoji in a reply never kills a run
$env:UV_OFFLINE = "1"     # uv never reaches for the network, even if it thinks it should
```

- **Pane A** — `cd <repo>\vision` — D1, D2, D3, and the Watch in D5.
- **Pane B** — `cd <repo>\agent` — the Agent in D5.
- **Pane C** — `cd <repo>` — the emitted file and the incident log in D5.

## Airplane mode — the open

Switch airplane mode on in full view (deck slide 2) and leave the icon visible on the
projected screen. It stays on until the last slide.

---

## D1 — one look

**What it shows.** `observe` takes one Frame from the webcam and Qwen3-VL, on Foundry Local
on the CPU, writes a sentence about the speaker. It proves the model is real and local, and
plants the carrier: the sentence.

**Setup.** Webcam facing the speaker; stand where it sees you. Pane A.

```powershell
uv run observe --camera 0 --variant qwen3-vl-2b-instruct-generic-cpu:2
```

**What should appear.** The header (Model `qwen3-vl-2b-instruct-generic-cpu:2`, CPU), the
stage timings, then one paragraph describing you. Read the sentence aloud.

**If it fails.** Deck backup slide after "Demo: one look" (the README run).

---

## D2 — ask the Watch

**What it shows.** A Watch on the Work Cell, answering a Scene Question typed into it while
it runs — anyone changes what is watched by typing, which a detector cannot do. It runs the
**4B** model on the Arc iGPU; the 2B cannot see the Work Cell
([#59](https://github.com/emepetres/local-vision-playground/issues/59), decision 3).

**Setup.** The Work Cell as above, Worker at the far side with gloves on, hands working on
the board on the mat. Red mug in hand, off camera. Pane A.

```powershell
uv run watch --camera 2 --variant qwen3-vl-4b-instruct-int4-sym-gpu
```

Wait for `#1` (the plain description). Then type, and press Enter:

```
Is there a phone or a cup on the green mat? Answer in one or two sentences.
```

1. **Mug beside the mat** (on the desk, below the mat's bottom edge, as in
   `foreign-off-zone-cup.png`). Expect a "no" that says *where* the cup is — this is the
   reasoning moment; point at it.
2. **Mug onto the mat.** Expect "yes" at the next Cadence or the one after.
3. Take the mug away. Then type:

```
What is the person doing? Answer in one sentence.
```

Expect one sentence about the Worker's hands and the board. `Ctrl+C` to stop; the summary
line gives the median inference.

**Notes.** A typed question takes effect at the **next** Cadence, not immediately — say so
rather than waiting in silence. Keep "Answer in one sentence" in every question: without it
the 4B truncates and loops. No follow-ups: every question must stand on its own.

---

## D3 — the same Watch, three engines

**What it shows.** The hardware axis is real and switchable by naming a Variant: the same
Watch on Foundry Local CPU, then OpenVINO on the Arc iGPU, then OpenVINO on the NPU, timings
on screen. Then the Benchmark slide. This is the turn: "which is fastest?" becomes "which
suits a station that watches all shift?".

**Setup.** Back to the webcam on the speaker (the 2B describes a person well; it cannot see
the Work Cell). Pane A. Let each run reach 3–4 Observations, then `Ctrl+C` and run the next.

```powershell
uv run watch --camera 0 --variant qwen3-vl-2b-instruct-generic-cpu:2 --ask "What is the person doing? Answer in one sentence."
uv run watch --camera 0 --variant qwen3-vl-2b-instruct-int4-sym-gpu --ask "What is the person doing? Answer in one sentence."
uv run watch --camera 0 --variant qwen3-vl-2b-instruct-int4-sym-npu --ask "What is the person doing? Answer in one sentence."
```

**What should appear.**

- **CPU (Foundry Local):** inference ~5–8 s against a 2 s Cadence, so lines read
  `late — skipped N Cadences and discarded M Stale Frames`. The machine visibly cannot keep
  up — that is the point.
- **iGPU:** ~2 s, keeps the Cadence. Note the Load line (~6 s).
- **NPU:** slower than the iGPU per Observation; point at its **Load**, the fastest of the
  three (~2.3 s). Say the weakness once, as the speaker's wrong ruler, and move on (NPU
  balance rule, beat-sheet).

**Why `--ask`.** The OpenVINO IRs of the 2B are quantised channel-wise and a plain
description loops to the token limit; a one-sentence answer leaves it no room to. The
repetition is shown as a captured slide in run 3, never live. **Check in rehearsal** that
this question answers cleanly on all three; if one still loops, fall back to the Benchmark
slide for that row.

---

## D5 — gloves off, the Agent acts

**What it shows.** The loop closes and only text crosses. The Watch writes a Structured
Observation per Cadence to a JSON Lines file; the C# Agent on Microsoft Agent Framework
reads it, and when a bare hand holds for two Observations in a row it opens an Incident,
writes the Supervisor's sentence, raises a Windows toast and logs it. The Agent never sees
an image. D4 (`--structured`) is merged in here: the emitted file is on screen.

The Watch runs the 4B on the **iGPU**, the Agent runs `qwen2.5-1.5b-instruct-generic-cpu:4`
on the **CPU** — the two never share an Execution Provider. The NPU appeared in D3.

**Setup.** The Work Cell, Worker with **gloves on**, hands on the mat working the board.
No mug, no phone. Start in this order:

**1. Pane B — the Agent first** (it waits for the file to exist):

```powershell
dotnet run --project Agent --no-build
```

Expect the header: Model `qwen2.5-1.5b-instruct-generic-cpu:4 (CPUExecutionProvider)`,
the Tray and Zone lists, `Triggers in force: working without gloves (N=2)`, then
`Watching …\vision\observations.jsonl`.

**2. Pane A — the Watch:**

```powershell
uv run watch --camera 2 --variant qwen3-vl-4b-instruct-int4-sym-gpu --structured --every 10 --emit observations.jsonl
```

**3. Pane C — the emitted file**, only once the Watch's header is up (the Watch deletes
and recreates the file when it starts, which would cut off a tail started earlier):

```powershell
Get-Content vision\observations.jsonl -Wait -Tail 3
```

The Agent prints `New Watch — variant qwen3-vl-4b-instruct-int4-sym-gpu, every 10s. Every
Trigger re-armed.`

**The beat.**

1. Let one or two Cadences pass with gloves on. Point at a line in pane C: the list of
   objects, `gloved hand` among them. That is all the Agent ever receives.
2. **Worker takes both gloves off** and keeps the bare hands on the mat, in view.
3. Next Cadence: pane C shows `hand` (the 4B rarely says `bare hand` live; the Work Cell
   file counts a plain `hand` as bare unless a `gloved hand` is beside it); pane B prints
   `no gloves: 1/2`. A Cadence that names no hand at all neither advances nor breaks it.
4. The Cadence after: `Incident fired — <the model's sentence>. Actions: notified
   supervisor, logged incident.` The **toast** appears. Expected ~40 s from gloves off
   (two Cadences plus a ~15–25 s Agent turn) — narrate over it, do not wait in silence.
5. Show the log gaining a line:

   ```powershell
   Get-Content agent\incidents\incidents.jsonl -Tail 1
   ```

   Point at `agent_acted` (true: the model wrote the sentence and made the calls itself)
   and at what is **not** there: no Frame, no image path.
6. **Gloves back on**, hands in view. After two Cadences: `Incident cleared — gloves on.`
   No model turn for that.
7. `Ctrl+C` in pane A, then in pane B.

**Notes.**

- If the model does not act — no tool call, a call written as text, or no answer within
  ~60 s — the safety net sends a template sentence through the same two Actions. The toast
  and the log line still appear, exactly once; `agent_acted` is `false` with a reason.
  Nothing to rescue on stage; say it is the design.
- Keep the bare hands visible and still on the mat: a hand out of frame is not a bare hand.
- Starting the Watch again mid-demo is safe: the Agent treats it as a new Watch and
  re-arms every Trigger.

**If it fails.** Play the fallback video recorded for #67.

---

## Rehearsal record

Fill in during the airplane-mode rehearsal. The slower of two cold starts goes here and
into the beat-sheet's offline-rehearsal section.

| Measurement                                                           | Run 1 | Run 2 |
| --------------------------------------------------------------------- | ----- | ----- |
| D1 cold start to sentence (`observe`, FL CPU)                         |       |       |
| D2 cold start to `#1` (`watch`, 4B iGPU)                              |       |       |
| D3 Load per Variant (CPU / iGPU / NPU)                                |       |       |
| D3 `--ask` answers cleanly on all three? (y/n, which looped)          |       |       |
| D5 Agent cold start to header                                         |       |       |
| D5 gloves off → toast                                                 |       |       |
| D5 gloves on → `Incident cleared`                                     |       |       |
| D5 `agent_acted` true or false                                        |       |       |
