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
falls on run 4, in the middle third of the deck by position.

1. Open — the laptop goes into airplane mode in full view (plant). `observe` describes the
   speaker live: the first sentence. Bridge from the 11:35 talk: "you have just seen the
   agent in the cloud; now we unplug the cable". The room's belief, stated aloud.
2. demo D1 — `observe` on Foundry Local, CPU. Proves it is real and local; plants the
   sentence.
3. Scenario — a workstation on a production line, three facts only: the camera films
   workers, the plant network is segmented, the load is continuous. Kept short: residency
   was covered at 10:25.
4. Run 1, the frame — image to sentence. The stumble: an alias picks a published variant
   that will not load (#1075). Lesson: the model you ask for is not the model you get; pin
   the variant.
5. Run 2, the question — a question typed into a running Watch on the desk-scale work cell
   ("is the left tray empty?"). The case for a VLM over a detector: anyone changes the list
   of what is watched by typing.
   demo D2 — `watch` with a typed Scene Question. Proves the flexibility a detector lacks.
6. Run 3, the model — the catalogue does not have it, so you build it. On this laptop
   Foundry Local publishes `qwen3-vl` for CPU only; the iGPU and the NPU are reached by
   exporting and quantising the weights with OpenVINO. The model crosses the wire once,
   while the machine is prepared, and never again while it operates (ties to airplane
   mode). Four slides, middle depth: why (the catalogue line), how (one command, "the
   recipe verified on this laptop"), what it means (16 → 4 bits per weight, ~5 GB
   downloaded → ~1.7 GB IR serving all three OpenVINO EPs), the price (the same question,
   a clean paragraph from Foundry Local's CPU build against the OpenVINO IR repeating
   itself: quantising buys the accelerator, not the accuracy — a price every OpenVINO row
   pays, NPU no more than the others. Both are INT4; the price is the NPU-shaped recipe's,
   channel-wise against Foundry Local's block-wise, see
   [the INT4 note](../../research/2026-09-25-int4-quantisation.md)). NNCF, `--sym`/`--group-size`, the transformers window,
   the system OpenVINO trap and `provenance.json` live in the notes only.
7. Run 4, the hardware — TURN.
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
8. Run 5, the shape — what crosses must have a shape. The model honoured a forced tool
   call with an image 0 times in 11, so the shape is asked for in the prompt and parsed
   back (ADR-0011).
9. Run 6, the action — a Trigger fires ("a part is missing from the tray"); the C# Agent on
   Microsoft Agent Framework notifies the supervisor and writes a local log entry. The
   Agent never sees an image.
   demo D5 — Trigger → Agent → notification and log, with the Structured Observation it
   consumed visible (D4, `--structured`, merged in here). Proves the loop closes and only
   text crosses into the Agent.
10. The criterion — the three questions (the takeaway), with capacity arithmetic under
    "is the load continuous?" (⌊10 / 2.3⌋ = 4 cameras at most on the iGPU, next to the
    cloud bill, as an upper bound for this Hardware Profile only). Where it runs in
    production: the station PC, an industrial Intel edge box, an on-prem server — with the
    edge boxes' NPU at 11–13 TOPS against the laptop's 48, and Series 3 edge parts at 50.
    The hybrid: the image stays, the conclusion may leave — for instance to a Foundry agent
    like the one in the previous talk.
11. Close — deny the small reading ("this is not about switching off the Wi-Fi"), assert the
    large one ("it is about deciding what leaves the machine"). Payoff: everything seen ran
    in airplane mode. "What is kept is a sentence, never a face." Call to action: the repo.
12. qa

Carrier: the sentence — the Observation the model writes about the image. It opens the
talk, answers "what crosses the wire?" in every body run, and closes it: what is kept is
a sentence, never a face.
Mechanics: airplane mode switched on at the open (1) → paid off at the close (11). The
first sentence about the speaker (2) → "a sentence, never a face" (11). "What crosses the
wire?" asked at the end of runs 1–6 → answered as the criterion (10).
Demos (in order): D1 `observe` on FL-CPU — local and real → D2 `watch` + Scene Question —
a VLM over a detector → D3 Variant switch CPU/iGPU/NPU + Benchmark slide — the hardware
axis is real → D5 Trigger → C# Agent → notification and log (D4 merged in) — the loop
closes, only text crosses.

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
- Quantisation internals (NNCF, symmetric vs asymmetric, group size) — notes only.

## Offline rehearsal (backlog item 10)
The Wi-Fi-off moment at the open (beat 1) and its payoff at the close (beat 11) are only
honest if they were rehearsed with the network actually gone, on the stage laptop, not
assumed from the code. Three things have to be true before airplane mode goes on in front
of the room:
- The Foundry Local catalogue is cached — `observe` once, on network, so the catalogue
  lookup that follows reads the disk cache and never reaches out.
- Every Variant the demo runs is pinned by id, not by alias — an alias leaves the
  Execution Provider, and the catalogue lookup that picks it, to Foundry Local; a pinned
  id (`qwen3-vl-2b-instruct-generic-cpu:2`, and the OpenVINO slugs D3 switches through)
  is what the run-up resolves with nothing to ask a catalogue for.
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
