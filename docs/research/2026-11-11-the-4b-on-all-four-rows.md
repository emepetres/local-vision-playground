# Qwen3-VL-4B on all four rows, for the keynote's face-off (#86)

Taken on the demo machine (ASUS Zenbook S14, Core Ultra 7 258V, on mains power, NPU driver
`32.0.100.4512`, OpenVINO and GenAI `2026.4.0`) on 2026-11-11, as three Benchmarks back to back,
one Workload each:

- **Prose** — `docs/benchmarks/asus-zenbook-s14-intel-core-ultra-7-258v-openvino-2026-4-0-n-20261111-182016.*`.
  The same Workload as #82: the reference Frame, the default prompt, 128 tokens, temperature 0,
  5 repetitions, `--work-cell`.
- **Structured, Work Cell Frame** — `docs/benchmarks/asus-zenbook-s14-intel-core-ultra-7-258v-openvino-2026-4-0-n-20261111-182814.*`.
  `--structured` (256 tokens, temperature 0, 5 repetitions) on
  `docs/fixtures/work-cell/bare_hand_1.png`. This is the latency D4 and the capacity slide use.
- **Structured, reference Frame** — `docs/benchmarks/asus-zenbook-s14-intel-core-ultra-7-258v-openvino-2026-4-0-n-20261111-183518.*`.
  The same, on the reference Frame, kept as the negative result (see below).

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

Capacity on the iGPU, ⌊Cadence / inference time⌋ at a 10 s Cadence: ⌊10 / 2.21⌋ = **4** cameras
for structured Observations, ⌊10 / 2.98⌋ = **3** for descriptions. Both are upper bounds from one
Frame, and the structured one from an answer that left the tray out. At the iGPU's 27.6 tokens/s,
FL-CPU's 122-token answer would take about 4.4 s, which is ⌊10 / 4.4⌋ = 2 cameras. A scene with
more objects writes more tokens, and the count drops.

## Not verified, and what it puts at risk

- **The NPU loops on the structured Frame** (5 of 5). The prose run and the Work Cell sweep pass,
  but the sweep counts shape, not loops. "The NPU passes" holds for prose, not for this structured
  Observation.
- **The OpenVINO CPU and iGPU wrote "hand", not "bare hand"**, on the D4 scene, as in the
  2026-09-25 rehearsal. `agent/Agent/work-cell.json` already lists "hand" as plain, counted as bare
  unless a gloved hand is named, so no_gloves still fires. The iGPU's answer here is the short
  one, though: it also missed every tool in the tray that FL-CPU and the NPU named.
- Structured latency from one fixture; 5 repetitions are not a distribution; TTFT not measured.
