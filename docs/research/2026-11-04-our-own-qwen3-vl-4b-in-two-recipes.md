# Our own Qwen3-VL-4B-Instruct in two Recipes, on the NPU (#81)

Done on the demo machine (Core Ultra 7 258V, NPU driver `32.0.100.4512`, OpenVINO and GenAI
`2026.4.0`). Both exports are ours, from `Qwen/Qwen3-VL-4B-Instruct`, with
`vision/tools/convert/convert.py --weights Qwen/Qwen3-VL-4B-Instruct --recipe <name>`. Toolchain
in each `provenance.json`: optimum-intel 2.1.0, optimum 2.3.0, nncf 3.3.0, transformers 4.57.6.

| Variant slug | Recipe |
| --- | --- |
| `qwen3-vl-4b-instruct-int4-sym-cw-npu` | INT4, symmetric, channel-wise (`--group-size=-1`), ratio 1.0 |
| `qwen3-vl-4b-instruct-int4-sym-g128-npu` | INT4, symmetric, group size 128, ratio 1.0 |

Both IRs are 2.9 GB on disk. Both loaded on the NPU on the first attempt, so there is no failure row. The NPU driver was
4512 against Intel's stated floor of 4023, so this does not test that floor either.
`observe` and `watch --count 2` gave clean descriptions with both (read from the terminal; only the
Benchmark has a record).

## Benchmark (5 repetitions, reference Frame, `--work-cell`, Intel's artifact in the same sitting)

| Variant | Load | Median inference | Tokens | Tokens/s (median) | Loops | Work Cell shape / objects |
| --- | --- | --- | --- | --- | --- | --- |
| ours, channel-wise | 53.7 s | 6.10 s | 83 | 13.6 | 0 of 5 | 32/32, 32 |
| ours, g128 | 135.5 s | 8.35 s | 100 | 12.0 | 0 of 5 | 32/32, 32 |
| Intel's gq-ov, g128 | 6.8 s | 8.62 s | 100 | 11.6 | 0 of 5 | 32/32, 32 |

Record: `docs/benchmarks/intel-ai-pc-windows-11-amd64-8-cpus-20261104-223442.*` (named by the
default hardware string, not `--hardware`). Our g128 and Intel's g128 generated the same number of
tokens and ran within 4% of each other on tokens/s (12.0 against 11.6); channel-wise generated fewer tokens, so its
latency is not comparable, but its tokens/s is higher. These are one machine, one Frame and five
repetitions: a first reading, not the verdict (#82).

## Memory and load time (fresh process per Variant, `tools/measure/memory.py`)

Measured through the same Runtime `observe` uses (`InProcessOpenVINO`, with its `CACHE_DIR`), one
generation of the default Workload on the reference Frame. Host RAM held by the process (working
set, MiB). The NPU's own memory is not a process counter and is not measured.

| Variant | Load | After load | After 1 generation | Peak |
| --- | --- | --- | --- | --- |
| ours, channel-wise | 3.8 s | 3387 | 4960 | 5494 |
| ours, g128 | 4.3 s | 3528 | 5236 | 5698 |
| Intel's, g128 | 4.7 s | 3541 | 5239 | 5699 |

So the 4B on the NPU costs about 5.5–5.7 GB of RAM at peak and about 5–5.2 GB once running.

Load time: these figures are loads with the compiled blob cached, taken after `--cold` deleted the
IR's `ov-cache`, so they are not first-compile loads; the tool did not reproduce a slow load after
that, and why is not known (something outside the IR directory may also cache the compile). The
slow loads are the ones in the Benchmark, which compiled each IR for the first time: 53.7 s
channel-wise and 135.5 s g128 (Intel's, whose compile #80 had already paid, 6.8 s). An earlier
version of the tool loaded without `CACHE_DIR` and read 53 s, 113 s and 112 s with RAM peaks of
5.2–5.4 GB; it was not the configuration `observe` runs, so those figures are superseded. Budget
the first load, as in #80.

## Does the group-wise export match Intel's card?

Compared against Intel's `openvino_config.json` (`lm_model`): bits 4, dtype int4, group size 128,
sym true, ratio 1.0, and no backup precision, AWQ, scale estimation, GPTQ, LoRA correction or
dataset — identical to ours field for field. That is the language model's entry only: the config
records no compression settings for the vision encoder or the embeddings, so nothing was compared
there.

Differences, written down:

- Intel exported with optimum 2.4.0.dev0 and transformers 5.0.0; we used optimum 2.3.0 and
  transformers 4.57.6 (optimum-intel 2.1.0 rejects 5.x).
- Intel's `processor`/`tokenizer` point at an internal NFS path; ours at the Hugging Face id.
- Not verified: the weight bytes. The config says the settings match; we did not hash or diff the
  `.bin` files, so we cannot say the IRs are numerically identical. The two behaved alike (same
  token count and speed), which is consistent with that but does not prove it.
