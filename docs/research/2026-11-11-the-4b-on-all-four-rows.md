# Qwen3-VL-4B on all four rows, for the keynote's face-off (#86)

Taken on the demo machine (ASUS Zenbook S14, Core Ultra 7 258V, on mains power, NPU driver
`32.0.100.4512`, OpenVINO and GenAI `2026.4.0`) on 2026-11-11. The ticket's three Benchmarks, back
to back, one Workload each:

- **Prose** — `docs/benchmarks/asus-zenbook-s14-intel-core-ultra-7-258v-openvino-2026-4-0-n-20261111-182016.*`.
  The same Workload as #82: the reference Frame, the default prompt, 128 tokens, temperature 0,
  5 repetitions, `--work-cell`.
- **Structured, Work Cell Frame** — `docs/benchmarks/asus-zenbook-s14-intel-core-ultra-7-258v-openvino-2026-4-0-n-20261111-182814.*`.
  `--structured` (256 tokens, temperature 0, 5 repetitions) on
  `docs/fixtures/work-cell/bare_hand_1.png`. This is the latency D4 and the capacity slide use.
- **Structured, reference Frame** — `docs/benchmarks/asus-zenbook-s14-intel-core-ultra-7-258v-openvino-2026-4-0-n-20261111-183518.*`.
  The same, on the reference Frame, kept as the negative result (see below).

And two follow-ups taken the same evening, after the ticket's Benchmarks: [runtime or
Recipe](#runtime-or-recipe-on-the-same-cpu) on the CPU, and [structured latency over six Work
Cell scenes](#structured-latency-over-six-work-cell-scenes) on the iGPU.

## The four rows

| Row | Variant | Median | Tokens | Tokens/s | Loops | Work Cell | Load |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FL-CPU | `qwen3-vl-4b-instruct-generic-cpu:3` | 15.39 s | 78 | 5.1 | 0/5 | 32/32, 32 | 12.0 s |
| OV-CPU | `qwen3-vl-4b-instruct-int4-sym-cw-cpu` | 7.18 s | 95 | 13.2 | 0/5 | 32/32, 32 | 8.9 s |
| OV-iGPU | `qwen3-vl-4b-instruct-int4-sym-gpu` | 2.98 s | 87 | 29.2 | 0/5 | 32/32, 32 | 5.6 s |
| OV-NPU | `qwen3-vl-4b-instruct-int4-sym-cw-npu` | 6.16 s | 83 | 13.5 | 0/5 | 32/32, 32 | 6.7 s |

**Token Divergence.** OV-CPU wrote 95 tokens against FL-CPU's 78 (22% more), so the two CPU rows
did not do the same amount of work, and the Benchmark says so. Read the CPU pair by tokens/s:
the same silicon reaches 13.2 through OpenVINO and 5.1 through Foundry Local, a 2.6× gap. The
two Runtimes also differ in Recipe (channel-wise against Foundry Local's block-wise INT4).

Against #82: the iGPU moved from 3.46 s and 25.2 tokens/s to 2.98 s and 29.2. The NPU moved from
5.72 s and 14.5 tokens/s to 6.16 s and 13.5. Token counts are identical (87, 83), so this is
sitting-to-sitting variance, not a different output. The NPU now matches the OpenVINO CPU on
tokens/s. Its cached load (6.7 s) is no longer faster than the iGPU's (5.6 s); #82 had 4–5 s
against 17 s. Load depends on turn order and cache warmth (the iGPU ran 4th of 4 in #82 and 3rd
here), so neither sitting settles which device loads faster.

## The two CPU rows are two Recipes, now verified

Read from the files on disk, not inferred. The September INT4 note assumed Foundry Local's
block size; the 4B build is now in the cache, and its ONNX graphs say:

| Part | Foundry Local `generic-cpu:3` | Our IR `…-int4-sym-cw-cpu` |
| --- | --- | --- |
| Language model | INT4, block 32 (`MatMulNBits`, `block_size=32`, `accuracy_level=4`, 253 nodes) | INT4 symmetric, channel-wise (252 `i4` weights) |
| Vision encoder | INT4, block 128 (98 `MatMulNBits`) | INT8 (104 `i8` weights in the merger) |

The language model is far finer in Foundry Local's build and the vision encoder finer in ours.
The quality gap measured here (FL-CPU named five tray objects on `bare_hand_1.png`, the
OpenVINO rows only "hand") is consistent with the language-side difference. Runtime and kernels
differ too; the next section separates them.

## The OV-CPU row needed its own IR

No 4B IR was tagged for the CPU. The Execution Provider comes from the IR's `provenance.json`, so
the row was exported for this ticket: `convert.py --weights Qwen/Qwen3-VL-4B-Instruct --ep CPU`,
producing `qwen3-vl-4b-instruct-int4-sym-cw-cpu`. Same Recipe (channel-wise INT4-sym) and same
2026.4.0 toolchain as `…-cw-npu`; a separate export, not a copy of its bytes. The
iGPU row is still the 2026.3-toolchain export `…-int4-sym-gpu` that #82 measured, as the ticket
names it.

## Structured latency, and why not on the reference Frame

On the reference Frame, as the ticket's "same Workload" suggests, every row answers `[]`
(_Nothing present_) in 1–2 tokens: the reference Frame is a room, not a work bench. Medians:
FL-CPU 19.17 s, OV-CPU 1.87 s, OV-iGPU 0.93 s, OV-NPU 2.88 s, 0 loops. That is image prefill
plus an empty list, not the Observation D4 waits for. (The iGPU's 23 tokens against 1–2 is
Token Divergence in count only: the same `[]`.) So the latency the deck uses is from a Work Cell
fixture with a bare hand on the mat:

| Row | Median | Tokens | Tokens/s | Loops | Answer |
| --- | --- | --- | --- | --- | --- |
| FL-CPU | 30.79 s | 122 | 4.0 | 0/5 | bare hand (zone), Arduino, soldering iron, wire spool, wire, 2 × black plastic object |
| OV-CPU | 4.86 s | 61 | 12.5 | 0/5 | hand (zone) |
| OV-iGPU | 2.21 s | 61 | 27.6 | 0/5 | hand (zone) |
| OV-NPU | 10.01 s | 178 | 17.8 | **5/5** | hand, tray, soldering iron, tip, then "soldering iron cable" ×4 |

**Token Divergence**, stated in the record: the NPU wrote 178 tokens against OV-CPU's 61 (+192%),
because it looped, and FL-CPU 122 because it listed the tray. OV-CPU and the iGPU wrote 61 tokens
because they named only the hand and missed every tool in the tray. So their 2.21 s and 4.86 s
are the latency of an under-report: a complete answer on this Frame costs more.

On this one Frame, capacity would read ⌊10 / 2.21⌋ = 4 cameras, from an answer that left the tray
out. That is why six scenes were measured afterwards: see [below](#structured-latency-over-six-work-cell-scenes),
where the figure is 2. For descriptions, ⌊10 / 2.98⌋ = **3**.

## Runtime or Recipe, on the same CPU

Our IR exported group-wise 128 for the CPU (`convert.py --recipe int4-sym-g128 --ep CPU`, producing
`qwen3-vl-4b-instruct-int4-sym-g128-cpu`), measured beside the two CPU rows in one sitting.
Foundry Local's g32 and our g128 are close Recipes, so that pair isolates the Runtime, and our
cw and g128 isolate the Recipe:

- Prose: `docs/benchmarks/…-20261111-194657.*` (reference Frame, 128 tokens, `--work-cell`)
- Structured: `docs/benchmarks/…-20261111-195140.*` (`bare_hand_1.png`, 256 tokens)

| Row | Prose median | Tokens/s | Structured median | Tokens | Tokens/s | Structured answer |
| --- | --- | --- | --- | --- | --- | --- |
| FL-CPU (g32) | 19.00 s | 4.1 | 32.95 s | 122 | 3.7 | bare hand, Arduino, iron, spool, wire, 2 × black plastic object |
| OV-CPU cw | 6.27 s | 15.2 | 4.91 s | 61 | 12.4 | hand |
| OV-CPU g128 | 8.20 s | 11.8 | 9.23 s | 129 | 14.0 | bare hand, microcontroller, iron, tip, solder wire, iron stand |

All three: 0 of 5 loops in both, 32/32 Work Cell shape and objects.

- **The Recipe decides the detail.** OpenVINO g128 names the bare hand and the tray, as Foundry
  Local does; OpenVINO cw names only "hand". Same Runtime, different Recipe, different answer.
- **The Runtime decides the speed.** At close Recipes, OpenVINO g128 runs about 3× Foundry Local's
  tokens/s (11.8–14.0 against 3.7–4.1). Between our two Recipes the speed is within sitting
  noise: cw is faster in prose, g128 in structured.
- Foundry Local ran slower in this sitting than in the ticket's (19.00 s and 4.1 tokens/s against
  15.39 s and 5.1), on the same Workload, with the same tokens: thermal or background load. The
  figures are compared within a sitting, never across.

## Structured latency over six Work Cell scenes

One fixture was too thin to carry the capacity slide, so the iGPU was measured on six, in both
Recipes: our 2026.3 cw export (`…-int4-sym-gpu`, the stage Variant) and a new g128 export for the
GPU (`convert.py --recipe int4-sym-g128 --ep GPU`, producing `qwen3-vl-4b-instruct-int4-sym-g128-gpu`).
One Benchmark per scene, `--structured`, 5 repetitions:
`docs/benchmarks/…-20261111-{195902,195949,200042,200123,200219,200247}.*`.

| Scene | cw median | cw tokens | g128 median | g128 tokens | Hands, cw → g128 |
| --- | --- | --- | --- | --- | --- |
| `bare_hand_1` | 2.19 s | 61 | 4.33 s | 126 | hand → bare hand |
| `bare_hand_2` | 3.61 s | 107 | 4.18 s | 124 | 2 × hand → 2 × bare hand |
| `bare-hand_3` | 4.14 s | 131 | 4.32 s | 125 | bare hand → bare hand |
| `two-gloves_1` | 2.26 s | 67 | 4.63 s | 136 | 2 × gloved hand → 2 × gloved hand |
| `mixed_1` | 4.72 s | 152 | 4.87 s | 147 | gloved + bare → bare + gloved |
| `baseline_1` | 2.04 s | 63 | 2.14 s | 63 | 2 × glove (elsewhere) → 2 × gloved hand **+ bare hand** (zone) |
| **Median / worst** | **2.94 s / 4.72 s** | | **4.32 s / 4.87 s** | | |

0 loops in all 60 Benchmark Runs. Tokens/s is the same in both Recipes (about 28–32), so g128
costs no speed per token. It writes more because it lists more of the tray.

**Capacity on the iGPU at a 10 s Cadence.** A box has to keep up whatever the scene, so the worst
scene is the figure that counts: ⌊10 / 4.72⌋ = **2** cameras with cw, ⌊10 / 4.87⌋ = **2** with
g128. On the median scene, ⌊10 / 2.94⌋ = 3 with cw. The earlier 4, from `bare_hand_1` alone, was
the shortest answer of the six.

**Which Recipe on stage for D4.** For no_gloves, cw reads all six scenes correctly ("hand" counts
as bare when no gloved hand is named). g128 reads five. On `baseline_1` it reports a bare hand
"in the zone" that is the operator's forearm at the top edge of the photo, off the mat. The
no_gloves Trigger counts a bare hand anywhere and never reads `where` (`TriggerEngine.cs`), so with
g128 that Frame would count toward a false Incident. cw stays on stage: faster on short scenes, and
no false bare hand here. g128 is the better describer, not the better guard, on this evidence.

## Not verified, and what it puts at risk

- **The NPU loops on the structured Frame** (5 of 5). The prose run and the Work Cell sweep pass,
  but the sweep counts shape, not loops. "The NPU passes" holds for prose, not for this structured
  Observation.
- **The OpenVINO CPU and iGPU wrote "hand", not "bare hand"**, on the D4 scene, as in the
  2026-09-25 rehearsal. `agent/Agent/work-cell.json` already lists "hand" as plain, counted as bare
  unless a gloved hand is named, so no_gloves still fires. The iGPU's answer here is the short
  one, though: it also missed every tool in the tray that FL-CPU and the NPU named.
- Six fixtures are photos, not the live camera on stage; the camera's framing decides whether an
  operator's arm enters the Frame. 5 repetitions are not a distribution; TTFT not measured.
- The g128 iGPU export is on the 2026.4 toolchain, the cw one on 2026.3. Same Recipe arguments,
  but not the same toolchain.
