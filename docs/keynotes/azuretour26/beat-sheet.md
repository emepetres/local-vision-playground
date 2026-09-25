# Computer Vision in Airplane Mode — beat sheet

Azure Tour Sevilla 2026, Saturday 2026-09-26, 12:25–13:10, Sala Principal (single track).
Level 300. Delivered in Spanish; every file in the repo, the deck included, is written in
English.

## Thesis
The question is not local or cloud, but what crosses the wire: the image stays on the
machine, and the conclusion may leave.
Refutes: "Local or cloud is a binary choice — either everything runs in Azure, or you build
it yourself at the edge and give up the cloud." Underneath it, the room's default belief
that local AI is a text-chat toy and serious AI goes to the cloud.
Only this speaker: numbers measured on the stage laptop across two runtimes and four
execution providers; a Foundry Local variant published broken (reported as #1075); a
vision model that honoured a forced tool call 0 times in 11; INT4 builds that degrade into
repetition. The criterion for what stays at the edge is earned from these, not asserted.

## Audience
Azure / .NET developers and architects who have used LLMs in the cloud; many have run a
local text chat on a laptop and little more. By 12:25 they have already seen "Azure Local:
Mi IA no sale de casa" (10:25, data sovereignty on on-prem Azure infrastructure) and, just
before this talk, cloud agents on Microsoft Foundry (11:35). What they believe: local AI is
a text-chat toy; local versus cloud is all-or-nothing. They do not yet have a picture of AI
on the device itself, offline.

## Takeaway
A three-question criterion for what stays at the edge: may the image leave the site? Is
the load continuous? Is the network there when the decision is due? When any answer
pushes local, the image stays and only text leaves. The mechanism that makes it possible:
the agent consumes Observations, never images (ADR-0003), so where the agent runs stops
being a privacy decision. The call to action on the last slide, not the takeaway: clone the
repo and measure your own machine.

## Arc
Body unit: one stage of the pipeline, closed each time by the same question — "what
crosses the wire?" — whose answer is always a sentence (the carrier). Six runs; the turn
falls on run 4, in the middle third of the deck by position. Each technology the talk
teaches (Foundry Local 2.0, OpenVINO, Agent Framework 1.x) is told in the run where it
solves a problem of the argument, never as a catalogue.

1. Open — the laptop goes into airplane mode in full view (plant). `observe` describes the
   speaker live: the first sentence. Bridge from the 11:35 talk: "you have just seen the
   agent in the cloud; now we unplug the cable". The room's belief, stated aloud.
2. demo D1 — `observe` on Foundry Local, CPU. Proves it is real and local; plants the
   sentence.
3. Scenario — a workstation on a production line, three facts only: the camera films
   workers, the plant network is segmented, the load is continuous. Kept short: residency
   was covered at 10:25. The Work Cell photo; the supervisor's three wishes (a part
   missing, no gloves, something left on the mat), only gloves live today.
4. The map — the whole system at high level, one image: camera → vision (Python) → a JSON
   Lines file → Agent (C#) → toast and incident log, the image stopping at the vision
   boundary, all of it inside the laptop. Then "the stack" as bullets with versions:
   Qwen3-VL 2B/4B, Foundry Local 2.0.1, OpenVINO GenAI 2026.3, Microsoft Agent Framework
   1.22 on .NET 10. The map is zoomed into at mid level in runs 5 and 6.
   → slides "the whole system, on one laptop", "The stack"
5. Run 1, the frame — image to sentence. The stumble: an alias picks a published variant
   that will not load (#1075), one slide. Lesson: the model you ask for is not the model
   you get; pin the variant. Then Foundry Local 2.0 against 1.x, one slide: in-process with
   no service, the image as a typed `ImageItem` (base64 in `extra_body` in 1.x), one
   package with no `-winml` split, telemetry that can be switched off, a pinned id that
   starts with no network. → slides "This is an invalid model.", "Foundry Local 2.0,
   in-process"
6. Run 2, the question — two validated Scene Questions typed into a running Watch on the
   Work Cell, on the 4B on the iGPU ("you will see why" — plant): the cup beside the mat
   and then on it, then "what is the person doing?". The case for a VLM over a detector:
   anyone changes what is watched by typing. One-line lesson: every question ends in
   "answer in one sentence", or the answer runs to the token limit.
   demo D2 — `watch` with typed Scene Questions. Proves the flexibility a detector lacks.
7. Run 3, the model — the catalogue does not have it, so you build it. On this laptop
   Foundry Local publishes `qwen3-vl` for CPU only; the iGPU and the NPU are reached by
   exporting and quantising the weights with OpenVINO — two exports, 2B and 4B, one
   recipe. The model crosses the wire once, while the machine is prepared, and never again
   while it operates (ties to airplane mode). Middle depth: why (the catalogue line), how
   (one command, "the recipe verified on this laptop"), what it means (16 → 4 bits per
   weight, one IR serving all three OpenVINO EPs), the price (the same question, a clean
   paragraph from Foundry Local's CPU build against the OpenVINO IR repeating itself).
   Both are INT4: **the recipe sets the price, not INT4**. Ours is the coarsest INT4 there
   is (channel-wise, symmetric, no INT8 layers) because the NPU asks for it and one IR
   serves all three engines, so the GPU and the CPU inherit an NPU-only constraint. Then
   the recommendations, one slide: one IR per engine, group-wise for the GPU and the CPU;
   group-wise or AWQ / scale estimation for the NPU; a repetition penalty; measure the
   loops. See [the INT4 note](../../research/2026-09-25-int4-quantisation.md). NNCF, AWQ
   internals, the transformers window, the system OpenVINO trap and `provenance.json` live
   in the notes only.
8. Run 4, the hardware — TURN.
   demo D3 — the same `watch`, switching Variant live: Foundry Local CPU → OpenVINO iGPU →
   OpenVINO NPU, timings on screen; then the Benchmark table as a slide, figures from the
   record. Proves the axis is real and switchable by naming a Variant.
   The mistake with a named cost is the speaker's own: measuring the NPU with the GPU's
   ruler. By tokens per second the iGPU leads (56) and the CPU edges the NPU (27.8 vs
   21.8), said once and not dwelt on. The turn changes the question from "which is
   fastest?" to "which suits a station that watches all shift?". Balanced with what was
   measured in the NPU's favour and what Intel publishes, each labelled — see the NPU
   balance rule below. Credited fact: last year, in a joint talk with Intel, energy was
   measured on this very laptop until a driver change made it impossible, which is why
   the talk cites Intel instead of giving its own figure.
9. Run 5, the seam — the map at mid level: what crosses between vision and the Agent, and
   how it is parametrised. In order: why the shape is asked for in the prompt (the model
   honoured a forced tool call with an image 0 times in 11, ADR-0011); the `described`
   prompt, cut to its key sentences (it names the mat and the tray — a debt, ADR-0016);
   prose against shape (asked in prose whether hands are bare, the 4B says "bare" on 4 of
   6 photos with no hands; the list gave 0 false Triggers on 17); one real line of
   `observations.jsonl` (ADR-0014: the file is the whole boundary); the Work Cell file's
   `hands` and `triggers` (a plain `hand` counts as bare, `no_gloves` with N = 2); the
   Trigger rule (fires on N in a row, re-arms on N failures in a row, an Observation with
   no shape counts neither way). → slides "0 of 11" … "One line of JSON"
10. Run 6, the action — the spike first: measured before promised (the 2B could not see
    the Work Cell, which pays off the 4B planted in run 2; and no local model this size
    sees a small part go missing — A2 refuted, so the Trigger is working without gloves).
    Then the map zoomed in: two processes on two engines (Watch on the iGPU through
    OpenVINO, Agent on the CPU through Foundry Local; the NPU was D3). Agent Framework 1.x
    and our own `IChatClient` over Foundry Local 2.0.1, credited to Bruno Capuano's
    adapter, which set the pattern but pins Foundry Local 1.2.1, has no telemetry switch
    and drops tool calls when streaming (ADR-0015). Two findings: the 1.5B text model
    called both tools 10 of 10 on the CPU and 0 of 10 on the GPU and the NPU — the model
    that sees is not the model that acts; and no system prompt tried reached 10 of 10,
    while none at all did.
    demo D5 — gloves off → two Observations → Incident → Agent → toast and log, with the
    emitted file on screen (D4, `--structured`, merged in here); ~40 s narrated over the
    file. Then the log line (`agent_acted`, never a Frame) and the safety net. Proves the
    loop closes and only text crosses into the Agent.
11. Findings — one slide, what this laptop taught: pin the Variant; measure the NPU with
    its own ruler; the recipe sets the price; bound every answer; a Trigger needs a shape,
    not a question; the model that sees is not the model that acts. Each already earned in
    its run; the bridge to the call to action.
12. The criterion — the three questions (the takeaway), with capacity arithmetic under
    "is the load continuous?" (⌊10 / 2.3⌋ = 4 cameras at most on the iGPU with the 2B,
    one with the 4B the demo runs, as an upper bound for this Hardware Profile only).
    Where it runs and what it costs, one slide: the station PC, an industrial Intel edge
    box, an on-prem server, beside the per-camera monthly bill; the edge boxes' NPU at
    11–13 TOPS against the laptop's 48, and Series 3 edge parts at 50, in the notes. The
    hybrid: the image stays, the conclusion may leave — for instance to a Foundry agent
    like the one in the previous talk.
13. Close — deny the small reading ("this is not about switching off the Wi-Fi"), assert the
    large one ("it is about deciding what leaves the machine"). Payoff: everything seen ran
    in airplane mode. "What is kept is a sentence, never a face." Call to action: the repo.
14. qa

Carrier: the sentence — the Observation the model writes about the image. It opens the
talk, answers "what crosses the wire?" in every body run, and closes it: what is kept is
a sentence, never a face.
Mechanics: airplane mode switched on at the open (1) → paid off at the close (13). The
first sentence about the speaker (2) → "a sentence, never a face" (13). "What crosses the
wire?" asked at the end of runs 1–6 → answered as the criterion (12). The 4B on the iGPU,
"you will see why", at D2 (6) → the spike, "the 2B could not see the Work Cell" (10). The
map (4) → zoomed into in runs 5 and 6 (9, 10).
Demos (in order): D1 `observe` on FL-CPU — local and real → D2 `watch` + two Scene
Questions on the 4B iGPU — a VLM over a detector → D3 Variant switch CPU/iGPU/NPU on the
2B + Benchmark slide — the hardware axis is real → D5 no gloves → C# Agent → toast and log
(D4 merged in) — the loop closes, only text crosses.

NPU balance rule (Intel is a principal client of the speaker; truth first, the NPU not
left looking bad): its weakness on this model is stated once, plainly, and never dwelt
on. It is always framed as the speaker's wrong ruler, not the NPU's failure, and set
against:
- measured here: the NPU loads fastest of the four rows (2.25 s, against 4.6 s CPU and
  6.2 s iGPU) and shows no cold-start penalty (first run 5.8 s, warm median 5.9 s, where
  the OpenVINO CPU row goes 9.1 s cold → 4.6 s warm); the exported IR ran first-try on
  the NPU; the INT4 quality price is the quantisation's, shared by every row;
- measured earlier, different model: Qwen2.5-VL-3B INT4 on the NPU, 6.0 s TTFT and
  22–25 tok/s against 23.7 s and 8.4 tok/s on the CPU (issue #38) — cited with its model
  named;
- Intel's, labelled as Intel's: sustained AI workloads at low power (Lunar Lake,
  qualitative); on Panther Lake, Intel measures the NPU at 2.8x the GPU's performance per
  watt on Gemma 4 E2B, and faster than it too — the next generation, a different model,
  not this app;
- the platform direction: Series 3 edge parts reach 50 TOPS; the NPU leaves the CPU and
  iGPU free for the rest of the station's software.
The talk never claims the NPU is the most energy-efficient engine for this app: that was
not measured.

## Out of scope
- Training or fine-tuning; YOLO-class detectors appear only as "what production runs
  today".
- Azure Local (covered at 10:25) and cloud agents on Microsoft Foundry (covered at 11:35),
  beyond the bridge and the hybrid.
- A quality comparison against a cloud model (Phi-4-reasoning-vision).
- Fleet management and model updates across hundreds of stations — one sentence as an
  honest limit.
- Speech and live transcription.
- An energy measurement of this app.
- Quantisation internals (NNCF, how AWQ and scale estimation work) — notes only. The
  recipe's choices (channel-wise against group-wise, symmetric, INT8 layers) and the
  recommendations are in scope, in run 3.
- The Foreign Object Trigger (#70, after the talk).
- The missing part as a Trigger — it appears only as a negative finding, in the spike.
- A comparison with Bruno Capuano's adapter beyond why it was replaced.

## Offline rehearsal (backlog item 10)
The Wi-Fi-off moment at the open (beat 1) and its payoff at the close (beat 11) are only
honest if they were rehearsed with the network actually gone, on the stage laptop, not
assumed from the code. Three things have to be true before airplane mode goes on in front
of the room:
- The Foundry Local catalogue is cached — `observe` once, on network, so the catalogue
  lookup that follows can read the disk cache. With the network gone, Foundry Local 2.0.1
  still tries every region first and then throws that cache away, leaving only scanned
  models that declare no task; the vision process notices and starts a second manager that
  reads the cache alone (`vision.inference._reached_the_catalogue`). `UV_OFFLINE` has no
  part in this — it only keeps uv from fetching packages.
- Every Variant the demo runs is pinned by id, not by alias — an alias leaves the
  Execution Provider, and the catalogue lookup that picks it, to Foundry Local; a pinned
  id is what the run-up resolves with nothing to ask a catalogue for. The pinned
  Variants: `qwen3-vl-2b-instruct-generic-cpu:2` (D1, D3), the OpenVINO slugs
  `qwen3-vl-2b-instruct-int4-sym-{gpu,npu}` (D3), `qwen3-vl-4b-instruct-int4-sym-gpu`
  (D2, and the Watch in D5), and `qwen2.5-1.5b-instruct-generic-cpu:4` (the Agent in D5).
  The run sheet is [`demo-script.md`](./demo-script.md).
- Runtime telemetry is off — `ORT_TELEMETRY_DISABLED` and Foundry Local's own
  `disable_nonessential_telemetry`, both set unconditionally by this process now
  (`vision.inference._disable_runtime_telemetry`, `_foundry_configuration`), not a manual
  step before the talk.
Rehearsal itself: switch the laptop to airplane mode, then time the run-up of `observe`
and of `watch --variant <pinned id>` from a cold process start — the moment worth knowing
in advance is how much longer a start takes with no catalogue to reach than the warm,
on-network number already in [`docs/business-value.md`](../../business-value.md), since
that gap is what the speaker stands through in silence on stage. **Not yet rehearsed on
the stage laptop** — the figure belongs here once it is: run it airplane-mode, twice, and
record the slower of the two starts next to the on-network one it is being compared
against.

## Decisions
- 2026-09-25 — Arc reopened (#71) to follow spike #58, the D2 validation and #59's
  Saturday reorientation, and to make room for the system's design and the technology.
  Thesis, audience and takeaway re-confirmed unchanged: the JSON Lines file is literally
  what crosses the wire.
  - The architecture is a high-level map after the scenario, zoomed into in runs 5 and 6.
    Dropped a seventh run "the wiring" (breaks the 3–6 invariant and lengthens the talk)
    and putting all of it inside run 6 (overloads the run right before D5).
  - Run 5 "the shape" becomes "the seam": the shape, the JSON Lines line, the Work Cell
    file, the `described` prompt and the Trigger rule. Its answer: one line of JSON.
  - The technology is told where it solves a problem (Foundry Local 2.0 in run 1,
    OpenVINO in run 3, Agent Framework and our `IChatClient` in run 6), plus one "stack"
    slide beside the map. Dropped a dedicated "stack" run, which reads as a catalogue.
  - Quantisation enters scope: the recipe's choices and one recommendations slide in run
    3. The message moves from "quantising buys the accelerator, not the accuracy" to "the
    recipe sets the price, not INT4", since both runtimes run INT4. Dropped two or three
    slides of rationale per recommendation.
  - Cuts for 45 minutes: Intel's launch quote and the "I did not measure energy" slide
    fold into the 2.8x stat's script; the cost comparison and "where it runs in
    production" become one slide; the #1075 stumble becomes one slide.
  - Real code on stage for the `described` prompt, one emitted line and the Work Cell
    file; the architecture, the two-engine view and the `IChatClient` bridge are images.
  - Run 6 tells the technology before D5 so the room knows what it watches, and the
    safety net after it, beside the log line where `agent_acted` shows.
  - The 4B enters at D2 as a plant ("you will see why"), paid off by the spike.
  - A findings slide sits before the criterion.
  - Settled by #59 and #71, not re-grilled: D2's two validated questions, D5 on working
    without gloves, the spike slide before D5, the prose-vs-shape slide, "answer in one
    sentence" as a one-line lesson, the Agent's model on the CPU.
- 2026-09-24 — Runtime telemetry off is no longer a manual pre-talk step: it is
  unconditional in `InProcessFoundryLocal.__init__` (`ORT_TELEMETRY_DISABLED`, since
  Foundry Local's own `disable_nonessential_telemetry` still lets through one ProcessInfo
  event) — see backlog item 10. What is still owed before Saturday is the rehearsal
  itself: the cold, airplane-mode start time is not yet measured.
- 2026-09-23 — NPU balance rule adopted (see Arc). Dropped saying "the NPU leads on
  TTFT" unqualified: the Zenbook Benchmark does not measure TTFT; the only TTFT figure
  is issue #38, on Qwen2.5-VL-3B against the CPU, and is cited with its model named.
- 2026-09-23 — A "where it runs in production" slide sits inside the criterion.
- 2026-09-23 — D3 is a live Variant switch in one Watch; the INT4 quality contrast is a
  captured slide, not live, since repetition live reads as a failed demo. Dropped a live
  export: long, and it needs the network.
- 2026-09-23 — The hardware gets two runs: "the model" (quantising, middle depth, four
  slides) and "the hardware" (the turn). Dropped a single hardware run, because the
  speaker wants the CPU/GPU/NPU switch and quantisation to carry more weight.
- 2026-09-23 — D4 (`--structured`) merged into D5, to spare a context switch.
- 2026-09-23 — Airplane mode is switched on at the open and paid off at the close.
  Dropped a standalone Wi-Fi-off demo at the end.
- 2026-09-23 — Energy is not measured for the talk. Dropped measuring on the Zenbook
  before Saturday: there is no standard sensor that reliably reports NPU power, and on
  this laptop the speaker's joint talk with Intel last year saw Intel's own measurement
  stop working after a driver change. Intel's published figures are used, labelled as
  Intel's. Note that the only quantified NPU-vs-GPU efficiency figures Intel publishes
  are for Panther Lake, not Lunar Lake; for Lunar Lake Intel's claim is qualitative.
- 2026-09-23 — Carrier is the sentence (the Observation). Dropped a plugged/unplugged
  cable icon; the cable stays as the thesis image.
- 2026-09-23 — Takeaway is the three-question criterion with ADR-0003 as its mechanism.
  Dropped the pattern alone and "measure your machine" as takeaways; the latter becomes
  the call to action.
- 2026-09-23 — The NPU is the mistake and the turn, told as "the myth itself", which
  holds whatever the energy result. The forced tool call (0 of 11) becomes a body run.
  Dropped the 0-of-11 case as the main mistake.
- 2026-09-23 — All repository files, `deck.md` included, are written in English, even
  though the talk is delivered in Spanish. Dropped writing `deck.md` in Spanish as an
  exception to `CLAUDE.md`, because the speaker chose English.
- 2026-09-23 — Build commitment for Saturday: backlog item 10 (runs with Wi-Fi off) is
  mandatory. Item 7 (the Agent) is minimal: one Trigger, a desktop notification and a
  local log, with a recorded fallback and slides if it is not stable by Friday. Item 9
  (capacity and cost) appears only as arithmetic on a slide. Dropped making items 11, 6
  and 7 fully mandatory, because the talk is three days away.
- 2026-09-23 — Thesis (B), "what crosses the wire". Dropped (A), "local is the only
  design that gets approved when the camera films people", because residency is covered
  at 10:25 by "Azure Local" and it sets up an Azure room against Azure. Dropped (C),
  "measurement over the spec sheet", as too narrow for a thesis. It survives as the
  evidence behind the thesis.
- 2026-09-23 — Opening on `observe` describing the speaker live. Dropped opening on the
  benchmark day or on the broken variant, because both stay in the body.

## Sign-off
- thesis-signed: yes — 2026-09-23 (thesis, audience, takeaway)
- arc-signed: yes — 2026-09-23 (arc, demos, out of scope)
- thesis-signed: yes — 2026-09-25 (re-confirmed unchanged, #71)
- arc-signed: yes — 2026-09-25 (arc, demos, out of scope re-signed after #58 / #59, #71)
