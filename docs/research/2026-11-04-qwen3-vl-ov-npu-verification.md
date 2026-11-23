# OpenVINO/Qwen3-VL-4B-Instruct-int4-gq-ov: what "gq" is, and what runs on the NPU

Checked on 2026-11-04 against primary sources only: the Hugging Face repo files and API, the
`openvino` and `openvino.genai` GitHub repositories, and the OpenVINO documentation source. No
blog posts or secondary summaries. Each claim carries its URL. Where a claim has no primary
source it is marked **inference**.

Repo under test: https://huggingface.co/OpenVINO/Qwen3-VL-4B-Instruct-int4-gq-ov, revision
`91c5e474bd5a21e1fd79b5c885fe61b4136a03c0`, last modified 2026-10-15
(https://huggingface.co/api/models/OpenVINO/Qwen3-VL-4B-Instruct-int4-gq-ov).

## Summary

| # | Question | Verdict | Confidence |
| --- | --- | --- | --- |
| 1 | What is "gq", and what recipe? | "gq" = **g**roup **q**uantisation (the NPU guide names it "Group quantization (GQ)"). Language model: INT4, symmetric, group size 128, ratio 1.0, data-free (no AWQ, GPTQ, scale estimation, LoRA correction). Everything else in the IR (embeddings, vision) is INT8, not INT4. | High for the recipe (stated in three places that agree). Medium-high for the expansion of "gq" (the guide pairs the acronym with the INT4-GQ recipe, but the repo never defines its own suffix). |
| 2 | Does the vision encoder run on the NPU? | **No.** With `device="NPU"` only the language model is compiled for the NPU. The vision encoder, merger, position and text-embedding models are compiled on `AUTO` restricted to `CPU`. | High (source code at tag `2026.4.0.0`, plus the repo's own README note). |
| 2b | Precision of vision and embedding models? | Weights are **INT8 symmetric, channel-wise** (stored `i8`, decompressed to FP16). The text-embedding table is INT8 symmetric. The language model's token embedding (tied with `lm_head`) is **INT8 asymmetric** (`u8` plus zero point). Only the language model's linear layers are INT4. | High (read from the IR XML). |
| 3 | What does the NPU guide say about CW against GQ-128, size and versions? | GQ-128 "is recommended for smaller models, e.g. up to 4B--5B parameters"; larger models "normally demonstrate a better performance with channel-wise". CW "generally offers the best performance but may reduce model accuracy". Pins OpenVINO and GenAI 2026.4.0; says to install the latest NPU driver; troubleshooting names `32.0.100.3104 or newer`. The guide gives **no** driver floor of 4023. | High (docs source file quoted). |
| 4 | How many models in `OpenVINO/vlms-optimized-for-npu`, and which is the ninth? | **Eight.** There is no ninth. The Qwen3-VL-4B model is sixth. | High (collection API). |

## 1. What "gq" means, and the exact recipe

### Stated

The model card gives the recipe
(https://huggingface.co/OpenVINO/Qwen3-VL-4B-Instruct-int4-gq-ov/raw/main/README.md):

> Weight compression was performed using `nncf.compress_weights` with the following parameters:
> * mode: **INT4_SYM**
> * group_size: **128**
> * ratio: **1.0**
> * awq: **False**

`openvino_config.json` agrees
(https://huggingface.co/OpenVINO/Qwen3-VL-4B-Instruct-int4-gq-ov/raw/main/openvino_config.json).
Its `quantization_config.quantization_configs` holds **one** entry, `lm_model`, and nothing for any
other component:

```json
"lm_model": { "bits": 4, "dtype": "int4", "group_size": 128, "sym": true, "ratio": 1.0,
              "quant_method": "default", "dataset": null, "num_samples": null,
              "awq": absent, "gptq": null, "scale_estimation": null, "lora_correction": null,
              "ignored_scope": null, "backup_precision": null, "all_layers": null,
              "sensitivity_metric": null, "dq_group_size": null }
```

(`awq` is not a key in that block; the card and the XML below state it is off. Record also carries
`"optimum_version": "2.4.0.dev0"`, `"transformers_version": "5.0.0"`, and
`"processor"`/`"tokenizer"` paths into an Intel-internal NFS share,
`/nfs/ov-share-01/data/cv_bench_cache/...`.)

The IR's own `rt_info` in `openvino_language_model.xml`
(https://huggingface.co/OpenVINO/Qwen3-VL-4B-Instruct-int4-gq-ov/resolve/main/openvino_language_model.xml)
is the authoritative record of what NNCF actually applied:

```xml
<weight_compression>
  <all_layers value="False" />
  <awq value="False" />
  <backup_mode value="int8_asym" />
  <compression_format value="dequantize" />
  <gptq value="False" />
  <group_size value="128" />
  <ignored_scope value="[]" />
  <lora_correction value="False" />
  <mode value="int4_sym" />
  <ratio value="1.0" />
  <scale_estimation value="False" />
  <sensitivity_metric value="weight_quantization_error" />
</weight_compression>
```

Toolchain recorded in the same `rt_info`: NNCF `3.4.0.dev0+17aa59f9e`, optimum-intel
`2.2.0.dev0+37e03a5`, optimum `2.4.0.dev0`, PyTorch `2.14.0`, transformers `5.0.0`, OpenVINO
Runtime `2026.4.0-22955-227c33757d1-releases/2026/4`.

The `advanced_parameters` entry in the XML lists NNCF's default parameter sets for AWQ,
scale estimation, GPTQ and LoRA correction. These are defaults of the class, not evidence those
methods ran; the flags above are all `False`. So the recipe is **data-free** (`dataset: null`,
`num_samples: null`).

### Per component (read from the IR XML)

| File | Role | Recorded `mode` / `group_size` | Stored constant types |
| --- | --- | --- | --- |
| `openvino_language_model.xml` | Decoder | `int4_sym`, 128; `backup_mode int8_asym` | `i4` linear weights, `f16` scales, `u8` token embedding (tied `lm_head`) with `zero_point` |
| `openvino_text_embeddings_model.xml` | Token embedding lookup | `int8_sym`, -1 | `i8` (151936 x 2560, 388,956,160 bytes) |
| `openvino_vision_embeddings_model.xml` | Patch embedding | `int8_sym`, -1 | `i8` (1,572,864 = 3 x 2 x 16 x 16 x 1024) |
| `openvino_vision_embeddings_merger_model.xml` | ViT blocks and merger | `int8_sym`, -1 | `i8` (~411 MB) |
| `openvino_vision_embeddings_pos_model.xml` | Position embedding | `int8_sym`, -1 | `i8` (2304 x 1024) |

File sizes (https://huggingface.co/api/models/OpenVINO/Qwen3-VL-4B-Instruct-int4-gq-ov/tree/main):
language model 2,263,625,497 B; merger 412,532,900 B; text embeddings 389,260,036 B.

So "int4" in the name describes the **decoder's linear layers only**. The 24-layer vision
transformer, both embeddings tables and the token embedding are INT8. This is the default
behaviour of `nncf.compress_weights`, which keeps non-linear-layer weights in a backup precision
(`backup_mode int8_asym` for the language model; INT8 symmetric was applied to the other four
models). **Inference** as to the cause: the two tied tensors (embedding and `lm_head`) take
`int8_asym` as backup, which matches the `u8` plus zero point seen in the XML.

### What "gq" stands for

- **Stated**, in the OpenVINO NPU guide (see section 3): "**Group quantization** (GQ) with group
  size `128` ...", and a tab named "INT4-GQ" whose command is `--weight-format int4 --sym --ratio 1.0
  --group-size 128`. Its counterpart is "**Channel-wise quantization** (CW)". The repo's recipe is
  exactly that INT4-GQ recipe.
- **Stated**, naming convention across the `OpenVINO` org: the sibling `-gq-ov` repos
  (`Phi-3.5-mini-instruct-int4-gq-ov`, `Phi-3-mini-4k-instruct-int4-gq-ov`,
  `DeepSeek-R1-Distill-Qwen-1.5B-int4-gq-ov`, `LFM2.5-1.2B-Instruct-int4-gq-ov`; listed by
  https://huggingface.co/api/models?author=OpenVINO&search=-gq-ov) each state `INT4_SYM`, group size
  128, ratio 1.0 on their cards, for example
  https://huggingface.co/OpenVINO/Phi-3.5-mini-instruct-int4-gq-ov/raw/main/README.md. The `-cw-ov`
  repos are the channel-wise counterparts (the collection in section 4 has several).
- **Inference**: the suffix means "group-quantised". No file in the repo spells the expansion out.
  The guide's "(GQ)" and "(CW)" acronyms, plus the matching parameters on every `-gq-ov` card, make
  it very likely, but no primary source says "gq stands for ...".

## 2. Where the vision encoder runs with `device="NPU"`

### Stated by the model card

> With `device="NPU"`, OpenVINO GenAI runs the language model on the NPU.

(https://huggingface.co/OpenVINO/Qwen3-VL-4B-Instruct-int4-gq-ov/raw/main/README.md)

### Source code (openvino.genai tag `2026.4.0.0`, commit `7ea2546852a382cd16bd22dea0cfad2db70ed744`)

`src/cpp/src/visual_language/pipeline.cpp`, `initialize_from_model_and_dir`, lines 163 to 193
(https://github.com/openvinotoolkit/openvino.genai/blob/2026.4.0.0/src/cpp/src/visual_language/pipeline.cpp):

```cpp
auto embedder_device = device;
if (m_is_npu) {
    embedder_device = "AUTO";
    ...
    std::tie(compiled_language_model, kv_desc) = utils::compile_decoder_for_npu(
        language_model, lm_properties, kv_pos);
    ...
    npu_auto_default_properties(device_properties);
}
...
m_inputs_embedder = std::make_shared<InputsEmbedder>(models_dir, embedder_device, properties_copy);
```

and the helper at lines 48 to 54:

```cpp
void npu_auto_default_properties(ov::AnyMap& device_properties) {
    auto auto_properties = utils::pop_or_default<ov::AnyMap>(device_properties, "AUTO", {});
    auto_properties.insert(ov::device::priorities("CPU"));
    auto_properties.insert(ov::intel_auto::enable_startup_fallback(false));
    device_properties["AUTO"] = auto_properties;
}
```

So when the device is NPU, the language model goes through `compile_decoder_for_npu`, and
`InputsEmbedder` (which owns the text-embedding model, the vision encoder and, for Qwen3-VL, the
merger and position models) is handed `"AUTO"` with the device priority list set to `CPU` and
startup fallback disabled. The same pattern is on `master`, lines 165 to 200
(https://github.com/openvinotoolkit/openvino.genai/blob/master/src/cpp/src/visual_language/pipeline.cpp).

The sub-models use the device they are given: `VisionEncoder` compiles
`openvino_vision_embeddings_model.xml` on `device`
(`src/cpp/src/visual_language/vision_encoder.cpp` lines 33 to 36); the Qwen3-VL position model
(`qwen3_vl/classes.cpp` lines 353 and 377) and the merger (`qwen2vl/classes.cpp` lines 945 to 951)
do the same; `EmbeddingsModel` does likewise (`embedding_model.cpp` lines 48 to 69).

**Conclusion**: on NPU, only the language model runs on the NPU; the vision encoder, merger,
position and text-embedding models run on the CPU, through `AUTO` pinned to `CPU`. The NPU guide's
statement that VLMs "can be inferenced in the same way as LLMs" does not say otherwise, and has no
sentence about where each sub-model lands. The card and the source agree.

**Not checked**: I did not run the pipeline and inspect `EXECUTION_DEVICES` on the machine, so this
is a reading of the source, not an observation.

### Precision of the vision and embedding models

See the table in section 1. All four non-decoder models carry INT8 symmetric, channel-wise weights
(`mode int8_sym`, `group_size -1` in each file's `rt_info`), stored as `i8` constants with an FP16
decompression subgraph (`<attribute name="decompression" />`; input ports show `precision="FP16"`).
**Inference**: activations therefore run in FP16 (or FP32 on CPU after the plugin's own
conversion); the XML records only weight storage.

## 3. What the OpenVINO GenAI NPU guide says

Document: "OpenVINO GenAI on NPU", rendered at
https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai/inference-with-genai-on-npu.html
(the 2026 docs tree), source at
https://raw.githubusercontent.com/openvinotoolkit/openvino/releases/2026/4/docs/articles_en/openvino-workflow-generative/inference-with-genai/inference-with-genai-on-npu.rst
(line numbers below are from that file). The `releases/2026/4` and `master` copies are byte-identical
(25,045 bytes). The page itself shows no date; the file was last changed by commit `865a911f99`,
"[DOCS] Sync release 2026.4 documentation changes to master (#39252)", on 2026-10-27
(https://api.github.com/repos/openvinotoolkit/openvino/commits?path=docs/articles_en/openvino-workflow-generative/inference-with-genai/inference-with-genai-on-npu.rst).
Version: the 2026.4 documentation (OpenVINO GenAI 2026.4.0.0 was released 2026-09-17,
https://github.com/openvinotoolkit/openvino.genai/releases).

Channel-wise against group size 128, lines 69 to 83, quoted literally:

> LLMs **must** be exported with the following settings:
>
> * Symmetric weights compression: `--sym`;
> * 4-bit weight format (INT4 or NF4): `--weight-format int4` or `--weight-format nf4`;
> * Channel-wise or group-wise weight quantization: `--group-size -1` or `--group-size 128`;
> * Maximize the 4-bit weight ratio in the model: `--ratio 1.0`.
>
> **Group quantization** (GQ) with group size `128` is recommended for smaller models, e.g. up to
> 4B--5B parameters. Larger models may also work with group-quantization, but normally demonstrate
> a better performance with channel-wise quantization.
>
> **Channel-wise quantization** (CW) generally offers the best performance but may reduce model accuracy. OpenVINO
> Neural Network Compression Framework (NNCF) provides several methods to compensate for the quality loss,
> such as data-aware compression methods or GPTQ.

Lines 122 to 131 (the INT4-GQ tab):

> INT4 Symmetric data-free group quantization:
> `optimum-cli export openvino -m microsoft/Phi-3.5-mini-instruct --weight-format int4 --sym --ratio 1.0 --group-size 128 Phi-3.5-mini-instruct`
> Data-aware methods are also available for the group-quantized models and can further improve the compressed model accuracy.

Lines 133 to 140:

> The NF4 data type is only supported on Intel Core Ultra Processors Series 2 NPUs (formerly codenamed Lunar Lake) and beyond. Use channel-wise quantization with NF4.
> For the channel-wise quantization, the group size argument must be `-1` ("minus one"), not `1`.

Versions and driver:

- Lines 25 to 26 and 42 to 43 pin `nncf==2.19.0 onnx==1.18.0 optimum-intel==2.1.0 transformers==5.0.0`
  and `openvino==2026.4.0 openvino-tokenizers==2026.4.0.0 openvino-genai==2026.4.0.0`. Lines 54 to 55:
  "With OpenVINO 2026.3, `transformers==5.0.0` is recommended for generating most models for Intel NPU."
- Lines 157 to 158: "It is recommended to install the latest available NPU driver." (links to
  https://www.intel.com/content/www/us/en/download/794734/intel-npu-driver-windows.html).
- Lines 634 to 635 (Troubleshooting): "In case of execution failures, either silent or with errors, try
  to update the NPU driver to 32.0.100.3104 or newer."
- The guide states **no** minimum driver of `32.0.100.4023`. That number comes from the model card
  ("OpenVINO version 2026.4.0 and higher", "Intel NPU Driver - Windows 32.0.100.4023 for Intel Core
  Ultra processors and higher"), and from the `-gq-ov` and `-cw-ov` sibling cards, not from the guide.
- Lines 479 to 481, VLM section: "VLMs are supported on NPU and can be inferenced in the same way as
  LLms with GenAI API". Nothing about where the vision encoder runs.

On "model size": the only size criterion in the guide is the "up to 4B--5B parameters" threshold for
group quantisation above. There is no statement about file size in bytes; I did not find one.

**Inference** (not stated): a 4B model sits at the edge of the recommended range for GQ-128, which
is consistent with the Qwen3-VL-4B repo using GQ and with the 2B Qwen3-VL being a clear GQ candidate.

## 4. The `OpenVINO/vlms-optimized-for-npu` collection

API: https://huggingface.co/api/collections/OpenVINO/vlms-optimized-for-npu, slug
`OpenVINO/vlms-optimized-for-npu-6ad0cf283ad2f3f5df38dbb7`, `lastUpdated` 2026-10-28T17:20:26Z,
empty description. The `items` array has **8** entries:

| Position | Model |
| --- | --- |
| 1 | `OpenVINO/gemma-4-E2B-it-int4-cw-ov` |
| 2 | `OpenVINO/MiniCPM-V-4_5-int4-cw-ov` |
| 3 | `OpenVINO/MiniCPM-o-2_6-int4-cw-ov` |
| 4 | `OpenVINO/gemma-3-4b-it-int4-cw-ov` |
| 5 | `OpenVINO/Phi-3.5-vision-instruct-nf4-ov` |
| 6 | `OpenVINO/Qwen3-VL-4B-Instruct-int4-gq-ov` |
| 7 | `OpenVINO/Phi-4-multimodal-instruct-int4-cw-ov` |
| 8 | `OpenVINO/Qwen3.5-9B-nf4-ov` |

The collection page https://huggingface.co/collections/OpenVINO/vlms-optimized-for-npu links the
same eight repos. There is no ninth item, so "the ninth" does not exist; the Qwen3-VL-4B model is
sixth (position index 5, zero-based). Neither the API nor the collection carries any claim of a
count, so there is nothing to contradict; if some other source states nine, it is wrong or from a
different time.

Trap when verifying: the list endpoint https://huggingface.co/api/collections?owner=OpenVINO
returns each collection with only **4** items (truncated), so it must not be used to count. The
per-collection endpoint above returns all of them.

Note the mix: only one of the eight is `-gq-`; four are `-cw-`; two are `nf4`.

## Discrepancies with existing repo notes

These notes are not edited here.

1. **"Channel-wise ... the shape the NPU wants" / "the NPU's channel-wise recipe"** appears in
   `README.md` (line 23), `docs/stack.md` (line 235), `docs/backlog.md` (line 106) and
   `docs/research/2026-09-25-int4-quantisation.md` (line 50: "Channel-wise symmetric INT4 is the
   layout OpenVINO's NPU plugin is built around for LLMs"). The NPU guide says CW **or** GQ-128
   are both required-valid settings, recommends **GQ-128 for models up to 4B--5B parameters**, and
   reserves CW for larger models. For the 2B and 4B models this repo uses, the guide recommends
   the group-128 recipe, so the claim is at best incomplete. The note's other point (CW is the
   coarsest INT4, the loops are a recipe matter) is not contradicted. Backlog item "#73, a better
   NPU recipe" is supported: `int4-sym-g128` is the guide's own recommendation here, and the
   Qwen3-VL-4B repo is Intel's published example of it.
2. **"Channel-wise and symmetric on every layer"** (`docs/stack.md` line 235, and the INT4 note's
   "Quantising ... on every layer"). For the Intel `-gq-ov` model the INT4 recipe applies only to
   the decoder's linear layers; the vision tower and embeddings are INT8. Our own IR is likely the
   same shape (the INT4 note already says "the extra bytes sit outside the quantised LLM weights"),
   but "on every layer" should read "on every decoder linear layer".
3. **NPU driver floor.** `docs/research/2026-11-04-openvino-2026-4-spike.md` and
   `vision/tools/convert/convert.py` (`NPU_DRIVER_FLOOR = (32, 0, 100, 4023)`) take 4023 as the
   floor. The source for 4023 is the HF model cards ("compatible with ... 2026.4.0 and higher",
   driver 32.0.100.4023), not the OpenVINO GenAI NPU guide, which says "latest" and `3104 or newer`.
   Not a contradiction of behaviour, but the provenance of the number is the model card, and it
   is a compatibility statement for these IRs, not a documented hard minimum for the runtime.
4. **Which components run on the NPU.** No existing note asserts the vision encoder runs on the
   NPU (searched the repo's Markdown, Python and C# for it). The benchmark's NPU row is therefore a
   mixed row: language model on the NPU, vision encoder and embeddings on the CPU. Worth stating
   wherever NPU latency figures are read as "NPU performance" (**inference**: the spike's NPU
   figures include CPU-side vision work, since the source routes it there; not measured).
5. No existing note refers to this collection or to a "ninth" model.
