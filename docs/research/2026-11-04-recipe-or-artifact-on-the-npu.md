# Does the Recipe or the artifact decide quality on the NPU? (#82)

The verdict for the AI Virtual Days 2026 keynote. Taken on the demo machine (ASUS Zenbook S14, Core
Ultra 7 258V, NPU driver `32.0.100.4512`, OpenVINO and GenAI `2026.4.0`), in one sitting, one
Benchmark: `docs/benchmarks/asus-zenbook-s14-intel-core-ultra-7-258v-openvino-2026-4-0-n-20261104-233447.*`.
Same Frame (the reference Frame), same prompt, same limits (128 tokens, temperature 0), 5 repetitions,
`--work-cell`. Memory and first-compile load come from [#81](./2026-11-04-our-own-qwen3-vl-4b-in-two-recipes.md).

## The matrix, and the cell that does not exist

The ticket asked for {channel-wise, group-wise 128} × {ours, Intel's}. **Intel publishes no
channel-wise Qwen3-VL-4B.** Its only NPU-targeted 4B is `int4-gq-ov` (group-wise 128, symmetric);
its other INT4 repo, `Qwen3-VL-4B-Instruct-int4-ov`, is asymmetric, AWQ, group 128 — a different
Recipe again, neither channel-wise nor made for the NPU, and not run here. So the cell
"Intel's, channel-wise" is empty: there is no artifact to measure, and substituting another Recipe
would not answer the question. Three cells are measured, plus the iGPU as the stage fallback.

| Variant | Where | Median inference | Tokens | Tokens/s | Loops | Work Cell shape / objects | First-compile load | Peak RAM |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ours, channel-wise | NPU | 5.72 s | 83 | 14.5 | 0 of 5 | 32/32, 32 | 53.7 s | 5494 MiB |
| ours, g128 | NPU | 9.00 s | 100 | 11.1 | 0 of 5 | 32/32, 32 | 135.5 s | 5698 MiB |
| Intel's, g128 | NPU | 8.99 s | 100 | 11.1 | 0 of 5 | 32/32, 32 | (132.7 s, #80) | 5699 MiB |
| ours, channel-wise (fallback) | Arc iGPU | 3.46 s | 87 | 25.2 | 0 of 5 | 32/32, 32 | — | — |

(Loads in this Benchmark were 4–5 s on the NPU, 17 s on the iGPU, because the blobs were cached; the
compile figures are the first-ever loads, from #81 and #80.) TTFT was not measured: the Benchmark
has no such column, so the NPU's claimed TTFT advantage stays unverified here.

## What decides quality

**Neither, at 4B.** Every cell is clean:

- **Artifact** (same Recipe, different publisher): ours-g128 and Intel's-g128 wrote word-for-word
  the same description in #81, matched on tokens (100) and tokens/s (11.1 and 11.1), and both are
  perfect on the Work Cell. Their configs match field for field for the language model; the weights
  were not hashed, so numerical identity is not proven, but nothing measured separates them.
- **Recipe** (same weights, ours): channel-wise and group-wise both have 0 loops and 32/32 shape
  and objects. Group-wise wrote longer text (100 against 83 tokens) and ran 36% slower per token's
  worth of work (11.1 against 14.5 tokens/s).

The channel-wise Recipe that made the 2B loop (the INT4 note) does not make the 4B loop. What
changed between the two is the model's size, not the Recipe or the publisher: at 4B the NPU's cheap
Recipe is enough. This is one machine, one Frame and 5 repetitions; it says the Recipe does not
decide quality *on this reliability measure*, not that the two Recipes are equal in every respect.

## The quality bar, and whether the NPU passes

The bar (primary criterion): **0 of 5 loops, and the fixed shape respected with objects found on every
one of the 32 Work Cell fixtures.** The NPU passes it, with all three Variants.

What the bar does not say, stated plainly: it counts shape and presence, not whether the objects
were the right ones. The only scoring against the Triggers is the [spike](./2026-09-24-work-cell-spike.md)
(4B on the iGPU, channel-wise: bare hands 8 of 9, the missing-part Trigger refuted on every model and
prompt). Nothing here re-scored the NPU's answers against the Triggers, so "the NPU passes" means it
is as reliable in form as the iGPU, not that it is proven as accurate.

## Stop rule outcome

The NPU **does** pass, so the stop rule does not trigger.

- **On stage: `qwen3-vl-4b-instruct-int4-sym-cw-npu`** (ours, channel-wise, NPU). It passes the bar
  and is the fastest of the NPU cells (14.5 tokens/s), with the cheapest first compile (54 s against
  133–136 s). Compile it once before the talk.
- **Fallback: `qwen3-vl-4b-instruct-int4-sym-gpu`** (the same IR on the Arc iGPU). It passes the same
  bar and is faster (25.2 tokens/s, 3.5 s), so if the NPU misbehaves live the Variant is already
  on the machine and the swap is a flag.
- Insurance for the story: Intel's artifact reproduces our g128 result, so "we did not just export
  it badly" is backed by a measurement.

The honest line for the keynote is that the NPU is **not faster** than the iGPU (14.5 against 25.2
tokens/s, 5.7 against 3.5 s); it passes the quality bar, which at 2B it did not.

## ADR?

No. The IR is one per Recipe, not one per Execution Provider: the same channel-wise 4B IR runs on
the NPU and the iGPU here, so the "one IR per EP" case the ticket anticipated did not arise, and
the choice of stage Variant is a flag, easy to reverse.

## Not verified

TTFT; Trigger-level accuracy on the NPU; the NPU's own memory; weight-level equality of ours and
Intel's g128; a 5-repetition median is not a distribution; the stage choice itself is a
recommendation for the 2026-11-11 decision.
