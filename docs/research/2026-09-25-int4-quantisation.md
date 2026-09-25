# Both Runtimes run INT4 — the recipe is what differs

The OpenVINO IRs loop, repeat themselves and miss objects that Foundry Local's CPU build
describes cleanly (the [Benchmark of 2026-09-22](../benchmarks/asus-zenbook-s14-intel-core-ultra-7-258v-20260922-090814.md),
[the Work Cell spike](./2026-09-24-work-cell-spike.md), A6). Until now the docs put that down
to quantisation: *the OpenVINO rows are INT4, Foundry Local's row is unquantised*. **The second
half of that is wrong.** Foundry Local's builds are 4-bit as well. What separates the two is
*how* each was quantised, and ours was quantised the coarsest way INT4 allows, because that is
the shape the NPU wants.

## Foundry Local's builds are INT4 **[verified 2026-09-25]**

The file sizes in `foundry model list` only fit 4-bit weights:

| Variant | Parameters | FP16 would be | Catalogue size |
| --- | --- | --- | --- |
| `qwen3-vl-2b-instruct-generic-cpu:2` | ~2.1 B | ~4.3 GB | **1.34 GB** |
| `qwen3-vl-4b-instruct-generic-cpu:3` | ~4.4 B | ~8.8 GB | **2.73 GB** |
| `qwen3-vl-8b-instruct-generic-cpu:2` | ~8.8 B | ~17.5 GB | **4.96 GB** |

Roughly 0.6 bytes per parameter: 4-bit weights, with some tensors (embeddings, the vision
encoder, scales) held wider. Foundry Local names its other CPU builds by recipe in the local
cache, and the name is explicit — `Phi-3.5-mini-instruct-generic-cpu\cpu-int4-rtn-block-32-acc-level-4`:
round-to-nearest INT4, **one scale per block of 32 weights**.

Not checked: the `qwen3-vl` builds' own `genai_config.json` / graph, which would say their
block size directly. None is in this machine's cache. That they use the same block-32 recipe
as the rest of the catalogue is an **inference**.

## Our recipe is the coarsest INT4 there is

`vision/tools/convert/convert.py` exports with
`--weight-format int4 --sym --ratio=1.0 --group-size=-1`:

- **`--group-size=-1` — channel-wise.** One scale per output row, i.e. per several thousand
  weights, where Foundry Local uses one per 32. A single outlier in a row sets the scale for
  the whole row and flattens every small weight beside it to the same few levels. This is the
  largest of the three losses.
- **`--sym` — symmetric.** No zero-point, so a row whose weights are not centred on zero wastes
  part of its 16 levels.
- **`--ratio=1.0` — every layer.** No layer is kept in INT8 as a backup (optimum-intel's
  default keeps 20%).

The IR is *larger* than Foundry Local's build (~1.7 GB against 1.34 GB for the 2B) and still
worse: the extra bytes sit outside the quantised LLM weights. Size is not a proxy for quality
here.

## Why the recipe is that one

The NPU. Channel-wise symmetric INT4 is the layout OpenVINO's NPU plugin is built around for
LLMs, and it is the recipe that loaded first try on `Intel(R) AI Boost`
([#40](https://github.com/emepetres/local-vision-playground/issues/40)). Quantising at all is
not optional on this class of machine: decoding is memory-bandwidth bound, and the 4B model at
FP16 is almost 9 GB.

The avoidable part is that **one IR serves all three OpenVINO Execution Providers**. The Arc
iGPU and the CPU inherit a constraint only the NPU imposes.

## What this changes

- The quality gap in the Benchmark is **not "quantised against unquantised"**. It is two INT4
  recipes, block-32 against channel-wise. "Quantising buys the accelerator, not the accuracy"
  overstates it: *this* recipe does.
- The Benchmark is still not like-for-like, for the same reason as before — different amounts
  of generated text — so Tokens/second remains the figure to read.
- Decoding is a second, independent factor: both Runtimes decode greedily
  (`temperature: 0.0` → `do_sample=False`), which is the setting most prone to loops. Whether
  Foundry Local applies a repetition penalty in its `genai_config.json` is not known.

## Open, and ticketed

- [#72](https://github.com/emepetres/local-vision-playground/issues/72) — a finer-grained IR
  (group-wise INT4, or INT8) for the iGPU and the CPU only.
- [#73](https://github.com/emepetres/local-vision-playground/issues/73) — a less lossy recipe
  that still runs on the NPU: group-wise INT4, or data-aware compression (AWQ, scale
  estimation) on the channel-wise layout.
- [#74](https://github.com/emepetres/local-vision-playground/issues/74) — a repetition penalty
  in the OpenVINO adapter's generation config.
- [#75](https://github.com/emepetres/local-vision-playground/issues/75) — `qwen3.5-*`, which
  publishes a `-generic-gpu` variant and so could reach the Arc iGPU through Foundry Local
  itself, with no export of ours.
