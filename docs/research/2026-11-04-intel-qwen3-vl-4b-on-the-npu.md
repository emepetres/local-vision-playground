# Intel's Qwen3-VL-4B-Instruct-int4-gq-ov on the NPU, as a Benchmark row (#80)

Done on the demo machine (ASUS Zenbook S14, Intel Core Ultra 7 258V, NPU driver
`32.0.100.4512`, OpenVINO and GenAI `2026.4.0`). The artifact is
https://huggingface.co/OpenVINO/Qwen3-VL-4B-Instruct-int4-gq-ov at revision
`91c5e474bd5a21e1fd79b5c885fe61b4136a03c0`, adopted unchanged — not re-exported.

## How it became a Variant

`vision/tools/convert/adopt.py` downloads the repository into the IR cache and writes its
`provenance.json` by hand: `origin: third-party`, the repository, the revision, the Recipe its card
states, and what the card says it requires (OpenVINO 2026.4.0, NPU driver 32.0.100.4023). The slug
carries the publisher, `intel-qwen3-vl-4b-instruct-int4-sym-g128-npu`, so a row is never mistaken
for one of our own exports of the same weights under the same Recipe. The Recipe's `tool` reads
"as stated on the model card" because we did not run it.

## The Recipe on the card, and how it was checked

The card states INT4_SYM, group size 128, ratio 1.0, AWQ off. `adopt.py` refuses to write the
manifest unless the language model's entry in the repository's own `openvino_config.json`
(`lm_model`: bits, group size, symmetry, ratio) says the same; it did, on the real download. That
is a check of the card against the config the export wrote, not against the weights: the
`rt_info` inside the XML and the component breakdown are in
[the verification](./2026-11-04-qwen3-vl-ov-npu-verification.md).

## What ran

| Command | Result |
| --- | --- |
| `observe` (reference Frame) | Clean three-sentence description. Load 132.7 s (first, cold compile), inference 10.7 s. |
| `watch --count 2 --every 0` (camera) | Two clean descriptions, 13.2 s and 10.6 s; load 6.2 s. |
| `benchmark --work-cell` | 0 of 5 Runs looped. 100 tokens each, a clean stop under the 128-token limit. Median 9.46 s, 10.6 tokens/s, load 5.1 s. Work Cell: shape respected on 32 of 32 fixtures, objects found on 32. |

Record: `docs/benchmarks/asus-zenbook-s14-intel-core-ultra-7-258v-openvino-2026-4-0-i-20261104-213317.*`.
Its row carries the loop rate and the structured reliability, and the JSON carries the whole
third-party Provenance.

## What this does and does not say

- It is **one** artifact on **one** machine, five repetitions. It is the first number of the
  comparison, not the comparison: the same 4B weights exported by us under the same Recipe are
  #81, and the verdict is #82. Nothing here says the artifact beats ours.
- Against the 2B channel-wise NPU row (median 5.6 s, 22.9 tokens/s, which loops) it is a
  different model at a different size and Recipe, so the 4B being slower per token is not a
  finding about the Recipe.
- The very first load took 132.7 s, with the 2.9 GB IR compiled for the NPU for the first time.
  The second load was 6.2 s. Load it once before the demo so that is not paid on stage.
- Per [the verification](./2026-11-04-qwen3-vl-ov-npu-verification.md), the vision encoder runs
  on the CPU under `device=NPU`, so this row's inference time includes CPU-side vision work.
  Not measured here.

## Where the card and the machine disagreed

The ticket expected "eight models where its cards say nine". The collection
`OpenVINO/vlms-optimized-for-npu` has eight, and no card or API field we read states a count of
nine ([the verification](./2026-11-04-qwen3-vl-ov-npu-verification.md), question 4), so there is
no disagreement to record. Not verified: where the figure of nine came from.

The one place the card and the machine differ is the NPU driver: the card states 4023 as the
floor and this machine runs 4512, so the run does not test whether 4023 is the true minimum. The
OpenVINO GenAI NPU guide says only "latest" (and `3104` in its troubleshooting). Nothing in the
code checks the manifest's `requires` at run time; it is a record, not a gate.

Not verified: the card's "AWQ off" and `ratio` 1.0 are checked against `openvino_config.json`
only for the fields it records (`awq` is not one of them); no hash of the downloaded files is
kept beyond the pinned commit. The `observe` and `watch` figures above were read from the
terminal and have no record beside the Benchmark's.
