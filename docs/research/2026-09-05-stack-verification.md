# Verification of `docs/stack.md` against primary sources — 2026-09-05

## Where this file lives and why

There is no existing research-notes convention in this repository: `docs/` holds `stack.md`,
`adr/` and `agents/`. Research notes are neither a decision record (ADR) nor an agent
instruction, so they get their own home: **`docs/research/`**, one file per pass, named
`YYYY-MM-DD-<topic>.md`. This is the first such file; treat it as the convention.

## Method and scope

Every claim below was checked against a primary source fetched on 2026-09-05:

- Microsoft Learn (`learn.microsoft.com/azure/foundry-local/…`, `learn.microsoft.com/windows/ai/…`,
  `learn.microsoft.com/agent-framework/…`), read as rendered pages including their
  `original_content_git_url` provenance headers.
- The `microsoft/Foundry-Local` GitHub repository — **actual raw source files** and the
  GitHub Releases API, not summaries.
- The `microsoft/agent-framework` and `microsoft/Agent-Framework-Samples` repository trees
  via the GitHub contents API.
- PyPI JSON API (`pypi.org/pypi/<name>/json`) and the NuGet search + registration APIs.
- The Foundry Local devblog post announcing v1.1.
- **The development machine itself** for anything about the local machine: `foundry --version`
  and `foundry model list`, run at 20:49 local time on 2026-09-05.

Secondary write-ups were used for nothing. Where a claim is only supported by a Microsoft
first-party blog rather than product documentation, that is stated explicitly.

Verdicts: **VERIFIED** / **PARTLY VERIFIED** / **CONTRADICTED** / **UNVERIFIABLE**.

---

## 1. Foundry Local is GA, and what v1.1 added

**Verdict: VERIFIED (with an important addition — see §10).**

GA is confirmed by the release itself:

> `v1.0.0` — **"v1.0.0 Foundry Local - General Availability"**, published 2026-04-09.
> — https://github.com/microsoft/Foundry-Local/releases/tag/v1.0.0 (via the Releases API)

`v1.1.0` was published 2026-05-05. Its release notes confirm the feature set stack.md
attributes to 1.1:

> "### 🎙️ Live Audio Transcription — Real-time speech-to-text is here! Stream microphone
> audio directly to the SDK and receive transcription results as they arrive — no cloud
> round-trips, no latency. Built on the **Nemotron ASR** model with an OpenAI
> Realtime-compatible API surface."
> — https://github.com/microsoft/Foundry-Local/releases/tag/v1.1.0

The vision, Responses-API-vision and embeddings claims are carried by the first-party
announcement post:

> "structured agentic AI capabilities" including tool calling and vision support with
> `qwen3-vl-2b-instruct`, a "natively multimodal vision-language model"; text embedding
> generation "across all four SDKs (C#, JavaScript, Python, and Rust)", shown with
> `qwen3-embedding-0.6b`.
> — https://devblogs.microsoft.com/foundry/foundry-local-v1-1/

Note the framing in stack.md — "the local catalogue was text-only for months, version 1.1
changed that" — is a reasonable reading of the announcement but is **not stated in those
words by any first-party source**. The defensible statement is: v1.1 introduced vision
support in the Responses API and shipped `qwen3-vl-2b-instruct`.

## 2. Live Transcription: `nemotron-speech-streaming-en-0.6b`, "faster than real time on CPU", ~0.56s

**Verdict: PARTLY VERIFIED.**

**The model and the API are real and first-party documented.** The alias appears verbatim
in Microsoft's own how-to, in all four language pivots:

> ```python
> # English-only:
> model_alias = "nemotron-speech-streaming-en-0.6b"
> # Multi-lingual (supports 30+ languages including auto-detect):
> # model_alias = "nvidia-nemotron-3.5-asr-streaming-multilingual-0.6b"
> ```
> — https://learn.microsoft.com/en-us/azure/foundry-local/how-to/how-to-live-transcribe-audio

The API is `model.get_audio_client()` → `create_live_transcription_session()` →
`session.start() / append(pcm) / get_stream() / stop()`.

**The numbers are first-party but blog-only, not product documentation:**

> "running comfortably faster than real-time on CPU with 0.56s algorithmic latency" …
> "8.20% average streaming WER across eight standard benchmarks"
> — https://devblogs.microsoft.com/foundry/foundry-local-v1-1/

No hardware profile is attached to the "faster than real time on CPU" figure, so it is not
a claim this playground can restate as its own benchmark. Cite it as Microsoft's claim.

**Naming nit:** Microsoft calls it the **live audio transcription API** (`ms.description`:
"Use the Foundry Local live audio transcription API…"). "Live Transcription API" as a
proper noun is stack.md's coinage.

**Local-machine caveat:** `nemotron-speech-streaming-en-0.6b` does **not appear** in
`foundry model list` output on this machine (CLI 0.8.119) — zero matches for `nemotron`,
and likewise zero for `whisper` and `embedding`. This is consistent with the nine
`Failed to process model` parse errors the CLI emits (see §3). Do not conclude the model is
unavailable; conclude the CLI is under-reporting.

## 3. Phi-4-multimodal is cloud-only; Qwen3-VL is the local VLM; local catalogue contents

**Verdict: VERIFIED, but the catalogue table in stack.md is now incomplete and one row is wrong.**

Observed on the development machine, 2026-09-05 20:49:

```
$ foundry --version
0.8.119
```

`foundry model list` returns **zero** matches for `phi-4-multimodal` and **zero** for
`npu`, `qnn`, `vitis`, `openvino`, `winml`. Phi-4-multimodal does exist in the cloud
catalogue (`ai.azure.com/catalog/models/Phi-4-multimodal-instruct`, "Catalog > Models >
Phi-4-multimodal-instruct (Version 2)") and on Hugging Face. **Constraint 1's core claim
holds.**

Every variant id carrying the `vision-language-chat` task on this machine, verbatim:

| Alias | Variants observed |
| --- | --- |
| `qwen3-vl-2b-instruct` | `-cuda-gpu:2`, `-generic-cpu:2` |
| `qwen3-vl-4b-instruct` | `-cuda-gpu:2`, `-generic-cpu:3` |
| `qwen3-vl-8b-instruct` | `-cuda-gpu:2`, `-generic-cpu:2` |
| `qwen3.5-0.8b` | `-cuda-gpu:3`, `-generic-gpu:4`, `-generic-cpu:3` |
| `qwen3.5-2b` | `-cuda-gpu:3`, `-generic-gpu:4`, `-generic-cpu:3` |
| `qwen3.5-4b` | `-cuda-gpu:3`, `-generic-gpu:4`, `-generic-cpu:3` |
| `qwen3.5-9b` | `-cuda-gpu:3`, `-generic-gpu:4`, `-generic-cpu:3` |
| `ministral-3-3b-instruct-2512` | `-cuda-gpu:2`, `-generic-gpu:2`, `-generic-cpu:2` |
| `gemma-4-e2b-it` | `-cuda-gpu:3`, `-generic-gpu:3`, `-generic-cpu:3` |

Corrections to stack.md's table:

- The alias is **`qwen3.5-9b`**, not `qwen3.5-…-9b` alongside a `-2b` row that conflates two
  different models. There is a separate **`qwen3.5-2b-text`** alias whose task is plain
  `chat` — a text-only sibling of `qwen3.5-2b`. stack.md's row `qwen3.5-0.8b / -2b / -4b / -9b`
  reads as if all four are one family of VLMs; `qwen3.5-2b-text` is the trap.
- All nine aliases carry `tools` in addition to `vision-language-chat` — stack.md's "All of
  these also carry `tools`" is **VERIFIED**.
- ADR-0001's `qwen3-vl-2b-instruct` is **confirmed to exist** (`qwen3-vl-2b-instruct-cuda-gpu:2`,
  2.11 GB; `-generic-cpu:2`, 1.34 GB).
- ADR-0001 says Qwen3-VL has "small on-device variants (3B, 7B)". The actual local sizes are
  **2B, 4B and 8B**. That sentence in the ADR is wrong.

The nine parse errors are reproduced exactly: five `Failed to process model #0 on page 1.`
and four `… on page 2.` — stack.md's "nine `Failed to process model` errors" is **VERIFIED**.

## 4. Constraint 2 — Agent Framework says Foundry Local is not supported in .NET

**Verdict: VERIFIED, exact quote obtained. No first-party .NET bridge has appeared.**

The page is zone-pivoted by language. Under the C# pivot, in full:

> ::: zone pivot="programming-language-csharp"
> **Note**
> **Foundry Local is not currently supported in .NET.**
> ::: zone-end

— https://learn.microsoft.com/en-us/agent-framework/integrations/by-component/model-providers/foundry-local
(page `ms.date` 2026-03-25, `updated_at` 2026-08-25; source
`agent-framework/integrations/by-component/model-providers/foundry-local.md`)

The Python pivot documents `pip install agent-framework-foundry-local --pre` and
`from agent_framework.foundry import FoundryLocalClient`. The Go pivot says "Go support for
this feature is coming soon." So **Python-only is correct**.

**Link correction:** stack.md cites
`learn.microsoft.com/en-us/agent-framework/agents/providers/foundry-local`. That URL still
resolves (HTTP 200) but the page's own `canonicalUrl` is
`…/agent-framework/integrations/by-component/model-providers/foundry-local`. Use the canonical URL.

**No first-party bridge has appeared since.** Checked three ways:

- `microsoft/agent-framework` → `dotnet/src/` contains no Foundry **Local** project. The
  nearest names — `Microsoft.Agents.AI.Foundry`, `Microsoft.Agents.AI.Foundry.Hosting`,
  `Microsoft.Agents.AI.Workflows.Declarative.Foundry` — are the **cloud** Foundry.
- NuGet search for `foundry.local` returns first-party `Microsoft.AI.Foundry.Local` (2.0.1),
  `.WinML` / `.Core` / `.Core.WinML` (1.2.4) and `.Runtime` (2.0.1) — an SDK, not an
  `IChatClient`. The only `IChatClient` bridge in the results is
  **`ElBruno.MAF.FoundryLocal.Adapter` 0.2.1**, authored by "El Bruno".
- NuGet search for `IChatClient foundry` returns the same single community package.

ADR-0002's premise therefore stands as of 2026-09-05. See §10 for the thing that may change it.

## 5. The vision payload shape

**Verdict: VERIFIED against the actual sample source, verbatim.**

Source read raw:
https://raw.githubusercontent.com/microsoft/foundry-local/main/samples/python/web-server-responses-vision/src/app.py

```python
vision_input = [
    {
        "type": "message",
        "role": "user",
        "content": [
            {"type": "input_text", "text": "Describe this image."},
            {
                "type": "input_image",
                "image_data": image_b64,
                "media_type": media_type,
            },
        ],
    }
]

stream = openai.responses.create(
    model=model.id,
    input="placeholder",
    extra_body={"input": vision_input, "max_output_tokens": 8192},
    stream=True,
)
```

Confirmed point by point:

- `input_image` / `image_data` / `media_type` — **exact**.
- Raw base64 with **no `data:` prefix** — `encode_image()` returns
  `base64.b64encode(image_bytes).decode()`. **Exact.**
- The dummy `input="placeholder"` and the `extra_body` smuggle that overwrites it —
  **exact**.
- Stock `openai` Python client against the local endpoint — **exact**
  (`requirements.txt` is just `foundry-local-sdk`, `pillow`, `openai`).

One detail stack.md does not mention and should: the wrapper item is
`{"type": "message", "role": "user", "content": [...]}`, i.e. the message envelope is also
hand-built, not just the image part. That matters to anyone porting this to C#.

`media_type` is derived from the actual image via Pillow, from a fixed map:
`image/jpeg`, `image/png`, `image/gif`, `image/bmp`, `image/webp`.

## 6. The official vision sample reads from disk and has no camera

**Verdict: VERIFIED.**

`app.py` takes `sys.argv[2]` as an optional image path and otherwise falls back to
`os.path.join(os.path.dirname(__file__), "test_image.jpg")`, a file that is checked into
the sample directory. `encode_image()` does `open(path, "rb")`. There is no capture device,
no `cv2`, no `VideoCapture`; `requirements.txt` is `foundry-local-sdk`, `pillow`, `openai`.
The README describes the flow as "starts the local web service, sends vision requests via
the Responses API to `http://localhost:<port>/v1`, prints the model output, and then stops
the web service."

Camera capture is entirely this project's own code. **Confirmed.**

## 7. Constraint 3 — EP registration, EP selection, alias vs variant

**Verdict: VERIFIED for the substance; the plugin-EP list needs three corrections.**

### `download_and_register_eps()` takes no EP name and registers all applicable EPs

Verified from the sample source and from the official quickstart. The Python signature seen
in first-party code is `manager.download_and_register_eps(progress_callback=...)` — the only
parameter is a progress callback. The quickstart's own comment states the intent:

> `# Download and register all execution providers.`
> — https://learn.microsoft.com/en-us/azure/foundry-local/get-started (Python pivot)

The C# pivot on the same page is more explicit:

> `// Download and register all execution providers with per-EP progress.`
> `// EP packages include dependencies and may be large.`
> `// For cross platform builds there is no dynamic EP download and this will return immediately.`

Note the SDK reference page (`reference-sdk-current`) does **not** document
`download_and_register_eps` at all — the get-started quickstart and the sample source are
the primary sources for it.

**Materially new, worth knowing:** the C#/JS SDKs expose `DiscoverEps()` / `discoverEps()`,
which returns each EP's `Name` and `IsRegistered` — an enumeration surface stack.md does not
mention. And the Rust SDK's signature is
`download_and_register_eps_with_progress(None, callback)`, whose first argument suggests an
optional EP filter exists at the native layer. So "takes no EP name" is precisely true of the
**Python** API, which is what this project uses; it may not be true of the runtime.

### EP selection happens at model load

Verified, and stated plainly:

> "**Load** — the SDK loads the model into memory, which initializes the ONNX Runtime session
> and **selects the appropriate execution provider for the available hardware**."
> — https://learn.microsoft.com/en-us/azure/foundry-local/concepts/foundry-local-architecture,
> "Model lifecycle"

and

> "The Core API automatically identifies available hardware and chooses the best execution
> provider for each model." … "The CPU execution provider is always available as a fallback."
> — same page, "Hardware abstraction"

### Alias auto-selects hardware; a variant id pins it

Verified. The alias half is stated first-party in as many words:

> "Pass a **model alias** (not a full model ID) to `GetModelAsync` so that Foundry Local
> automatically selects the best hardware variant — for example, a QNN NPU variant on
> Snapdragon, a CUDA variant on NVIDIA, or a CPU fallback everywhere else."
> — https://learn.microsoft.com/en-us/windows/ai/foundry-local/get-started, "Model aliases"

The variant-pinning half is documented only by behaviour, in the sample source:

```python
model = manager.catalog.get_model(model_identifier)
if model is None:
    model = manager.catalog.get_model_variant(model_identifier)
```

with the sample's own usage line `python src/app.py Qwen2.5-VL-7B-Instruct-generic-cpu`.
So "pass a variant id to pin the backend" is a **supported and demonstrated** path, but no
Learn page says in words "passing a variant id pins the execution provider". State it as
inference from the sample, not as documented behaviour.

### No NPU variant for any local VLM; the dev machine has no NPU

**VERIFIED** on this machine: zero occurrences of `npu`, `qnn`, `vitis` or `openvino` in
`foundry model list`. Every `vision-language-chat` variant is `-cuda-gpu`, `-generic-gpu` or
`-generic-cpu` (see §3). The conclusion — the demonstrable EP axis is **CUDA-GPU vs CPU** —
holds.

Caveat: the local CLI (0.8.119) failed to parse nine catalogue entries, so "no VLM anywhere
in the catalogue ships an NPU variant" is stronger than the evidence. What is verified is
"no NPU variant is visible to this machine's CLI". Since the catalogue is hardware-filtered
per device anyway (the SDK reference calls this "automatically hardware-optimized model
selection"), a machine with a Hexagon or Ryzen AI NPU may be offered variants this one is not.

### The Windows plugin-EP list — CONTRADICTED in three places

stack.md says: *"the Windows plugin EPs that exist: `NvTensorRTRTXExecutionProvider`,
`OpenVINOExecutionProvider` (Intel CPU/GPU/NPU), `QNNExecutionProvider` (Qualcomm NPU),
`VitisAIExecutionProvider` (AMD NPU); built in: CPU (MLAS), WebGPU (Dawn), CUDA."*

The authoritative table
(https://learn.microsoft.com/en-us/windows/ai/new-windows-ml/supported-execution-providers):

> **Included execution providers** — "The following execution providers are included with
> the ONNX Runtime that ships with Windows ML:" **CPU**, **DirectML (legacy)**.
>
> **Available execution providers** — "not included with the runtime — they're downloaded on
> demand" (Windows ML 2.x):
>
> | Execution provider | EpName | Vendor |
> | --- | --- | --- |
> | MIGraphX | `MIGraphXExecutionProvider` | AMD |
> | NvTensorRtRtx | `NvTensorRtRtxExecutionProvider` | NVIDIA |
> | OpenVINO | `OpenVINOExecutionProvider` | Intel |
> | QNN | `QNNExecutionProvider` | Qualcomm |
> | VitisAI | `VitisAIExecutionProvider` | AMD |
> | WebGPU (Experimental) | `WebGpuExecutionProvider` | Microsoft |

Corrections:

1. **Casing.** It is `NvTensorRtRtxExecutionProvider`, not `NvTensorRTRTXExecutionProvider`.
2. **`MIGraphXExecutionProvider` (AMD, GPU) is missing** from stack.md's list, and
   `DirectML` is missing from the built-in list. Note MIGraphX "is not supported for GenAI
   scenarios today" per the same page — relevant, since Foundry Local's VLMs are GenAI.
3. **WebGPU is not built in on Windows.** Per the Windows ML page it is a **downloadable,
   experimental** plugin EP (`WebGpuExecutionProvider`, package family
   `Microsoft.WinML.ONNX.WebGPU.EP.2`), absent entirely from Windows ML 1.8.x. The
   "WebGPU via Dawn" description is correct as architecture — the Foundry Local architecture
   page describes the ONNX model → WebGPU EP → Dawn → Metal/D3D chain — but "built in"
   is wrong for Windows.
4. OpenVINO covering **CPU / GPU / NPU** is **correct** — the requirements list Tiger Lake+
   CPU, Alder Lake+ GPU and Core Ultra Series 1+ NPU. QNN = Qualcomm Hexagon NPU and
   VitisAI = AMD NPU are also **correct**.

Also worth noting: the Foundry Local architecture page's own EP table is *narrower* than
Windows ML's (it lists NVIDIA CUDA, WebGPU/Dawn, AMD Vitis, Qualcomm, Intel OpenVINO,
CPU — no TensorRT-RTX, no MIGraphX, no DirectML), while the SDK reference page says
"CUDA, Vitis, QNN, OpenVINO, TensorRT". The three Microsoft pages disagree with each other.
Cite the Windows ML page for EP identifiers; it is the one with `EpName` strings.

## 8. The Python SDK section

**Verdict: mostly VERIFIED — one claim now OBSOLETE, one claim's *reason* is slightly wrong.**

### `foundry-local-sdk` vs `-winml` vs the unrelated `foundry-local`

The "unrelated third party" claim is **VERIFIED**, and Microsoft says so itself:

> "**Important** — The `foundry-local` package on PyPI (without `-sdk`) is an unrelated
> third-party package. Install `foundry-local-sdk` or `foundry-local-sdk-winml` to get the
> Microsoft Foundry Local SDK."
> — https://learn.microsoft.com/en-us/windows/ai/foundry-local/get-started

PyPI corroborates: `foundry-local` is version **0.0.1**, one release, author email
`nico.re@gmail.com`, homepage `https://www.merckgroup.com`. Not Microsoft.

The "install one, never both" claim is **VERIFIED as first-party guidance**:

> "Install **one** of the following — do not install both, as they have conflicting
> `onnxruntime-core` dependencies" … and, under Troubleshooting:
> "`foundry-local-sdk-winml requires onnxruntime-core==X.Y.Z, but you have … which is
> incompatible` — This pip dependency conflict means both `foundry-local-sdk-winml` and
> `foundry-local-sdk` are installed — they pin different versions of `onnxruntime-core` and
> cannot coexist."
> — same page

So stack.md's wording "conflicting `onnxruntime-core` pins" **matches Microsoft's own
wording**. However, PyPI metadata for the *current* versions shows a different picture:

- `foundry-local-sdk` **2.0.1** requires `onnxruntime==1.28.0`, `onnxruntime-genai-core==0.15.2`
- `foundry-local-sdk-winml` **1.2.4** requires `onnxruntime-core==1.26.0`, `onnxruntime-genai-core==0.14.1`

The two no longer share an `onnxruntime-core` requirement at all; the direct collision today
is on **`onnxruntime-genai-core`** (0.15.2 vs 0.14.1). Keep Microsoft's phrasing when
quoting them, but don't assert the mechanism yourself.

### **The `-winml` package is being retired — this section is going obsolete**

**Materially new.** Foundry Local **v2.0.1** (published 2026-08-31 / release 2026-09-01,
i.e. five days before stack.md was written) removes the WinML split:

> | Language | 1.2.4 packages | 2.0.1 package | Required migration |
> | --- | --- | --- | --- |
> | C#/.NET | `Microsoft.AI.Foundry.Local` or `Microsoft.AI.Foundry.Local.WinML` | `Microsoft.AI.Foundry.Local` | Remove `.WinML`; update the main package to `2.0.1` |
> | Python | `foundry-local-sdk` or `foundry-local-sdk-winml` | `foundry-local-sdk` | **Remove `-winml`**; pin the main package to `2.0.1` |
>
> — https://github.com/microsoft/Foundry-Local/releases/tag/v2.0.1

PyPI confirms the divergence: `foundry-local-sdk` is at **2.0.1**, `foundry-local-sdk-winml`
is stuck at **1.2.4**. The Learn pages (SDK reference, get-started, live-transcribe) still
show the Windows/Cross-Platform tabs and still tell you to install `-winml` on Windows —
**the docs lag the release.** Treat the "install one, never both" advice as true-for-1.2.x
and note that on 2.x there is only one package.

### In-process native library, not a CLI wrapper

**VERIFIED**, and this is exactly how Microsoft frames it:

> "Foundry Local is an end-to-end local AI solution that ships as a **single native library
> inside your application**. Rather than connecting to a separate service or daemon, your
> code loads the Foundry Local Core API **in-process**…" … "It's a platform-specific native
> library — `.dll` on Windows, `.so` on Linux, and `.dylib` on macOS."
> — https://learn.microsoft.com/en-us/azure/foundry-local/concepts/foundry-local-architecture

> "The SDK doesn't require the Foundry Local CLI to be installed on the end users machine"
> — https://learn.microsoft.com/en-us/azure/foundry-local/reference/reference-sdk-current

Catalogue lookup, download, load/unload and EP registration are all listed as Core API /
SDK responsibilities on those two pages. **VERIFIED.**

### The web service is optional

**VERIFIED**:

> "## Optional REST API — For scenarios that require HTTP-based communication, the Foundry
> Local SDK can start an optional OpenAI-compatible REST endpoint within your application
> process. … **The REST API isn't required for native SDK usage.**"
> — architecture page

### The API shape sequence

**VERIFIED** against both the SDK reference and the sample source. The reference documents
`Configuration(app_name=…)`, `FoundryLocalManager.initialize(config)`,
`FoundryLocalManager.instance`, `manager.catalog.get_model(alias)`,
`manager.catalog.list_models()`, `model.download(progress_callback)`, `model.load()`,
`model.unload()`, `model.is_cached`, `model.is_loaded`. The sample adds
`manager.catalog.get_model_variant(id)`, `manager.start_web_service()`,
`manager.urls[0]` and `manager.stop_web_service()`.

Two nits against stack.md's sequence:

- The sample builds the base URL as `manager.urls[0].rstrip("/") + "/v1"`, not
  `manager.urls[0] + "/v1"`. The `rstrip` matters.
- The sample's teardown order is `openai.close()` → `manager.stop_web_service()` →
  `model.unload()`. stack.md has unload before stop. Cosmetic, but if the doc is meant to
  mirror the sample, mirror it.
- `get_model_variant` is **not** in the SDK reference's Core API table — it is only
  evidenced by the sample source. Worth flagging as under-documented, since Constraint 3's
  only hardware lever depends on it.

## 9. Every URL in the References section

All 21 URLs were resolved with a following HEAD/GET. **Every one returns HTTP 200 except
one, which is a bot block rather than a dead link.**

| URL | Status | Points at what the text says? |
| --- | --- | --- |
| `learn.microsoft.com/…/foundry-local/` | 200 | Yes — landing page |
| `…/foundry-local/get-started` | 200 | Yes — full quickstart, four languages |
| `…/foundry-local/reference/reference-cli` | 200 | Yes |
| `…/foundry-local/reference/reference-sdk-current` | 200 | Yes, **but** it does not document `download_and_register_eps` |
| `…/foundry-local/concepts/foundry-local-architecture` | 200 | Yes — EP selection at load is on this page |
| `github.com/microsoft/Foundry-Local` | 200 | Yes |
| `learn.microsoft.com/en-us/windows/ai/foundry-local/get-started` | 200 | **Partly — see below** |
| `github.com/microsoft/Foundry-Local/tree/main/samples/python/web-server-responses-vision` | 200 | Yes |
| `devblogs.microsoft.com/foundry/foundry-local-v1-1/` | 200 | Yes |
| `techcommunity…/introducing-phi-4-reasoning-vision…/4499154` | 200 | Yes |
| `microsoft.com/en-us/research/blog/phi-4-reasoning-vision-and-the-lessons…` | **403 to curl, 200 to a browser UA** | Yes — MSR post, 2026-03-04, announces Phi-4-reasoning-vision-15B. **Live, not dead.** |
| `huggingface.co/microsoft/Phi-4-multimodal-instruct` | 200 | Yes |
| Compile-HF-models (cited as a bare `/foundry-local/` link + a title) | — | **Should be a real link**: `…/azure/foundry-local/how-to/how-to-compile-hugging-face-models` |
| `github.com/microsoft/agent-framework` | 200 | Yes |
| `github.com/microsoft/agent-framework/tree/main/dotnet/samples` | 200 | Yes |
| `learn.microsoft.com/en-us/agent-framework/agents/providers/foundry-local` | 200 | Yes, but **not canonical** — see §4 |
| `github.com/microsoft/Agent-Framework-Samples` | 200 | **Partly — see below** |
| `elbruno.com/2026/06/05/local-first-ai-agents-in-c-…` | 200 | Yes — dated 5 Jun 2026, describes `FoundryLocalChatClientAdapter` |
| `github.com/elbruno/ElBruno.MAF.FoundryLocal` | 200 | Yes — .NET 10, `FoundryLocalChatClientAdapter`, ~22 commits |
| `elbruno.com/2025/12/18/…vision-and-function-calling…ollama/` | 200 | Yes |
| `github.com/elbruno/agent-framework-samples` | 200 | Yes |
| `techcommunity…/getting-started-with-foundry-local-a-student-guide…/4503604` | 200 | Yes |

Two descriptions are inaccurate:

- **"Windows get-started, with execution-provider control"** — the page has **no** EP-control
  API. It is a C# quickstart, and it explicitly hands EP control off elsewhere: its own
  "Next steps" say *"[Windows ML](../new-windows-ml/overview) — bring your own ONNX model
  with **full EP control**"*. What this page **is** uniquely good for is the alias
  auto-selection quote and the two Python packaging warnings (§7, §8) — relabel it accordingly.
- **Agent-Framework-Samples "incl. vision tools, a Multi-Agent Foundry Local DevUI demo and a
  Foundry Local pipeline"** — of these, only **`09.Cases/FoundryLocalPipeline`** was located
  in the repository tree. The top level is `00.ForBeginners`, `01.AgentFoundation`,
  `02.CreateYourFirstAgent`, `03.ExploerAgentFramework` [sic], `04.Tools`, `05.Providers`,
  `06.RAGs`, `07.Workflow`, `08.EvaluationAndTracing`, `09.Cases`. The vision-tools and
  DevUI-demo claims are **UNVERIFIED** at that level of specificity — either deep-link them
  or drop the specifics.

## 10. Materially new since stack.md was written

These are the things a maintainer would most want to know. None of them is in stack.md.

### a. Foundry Local **v2.0.1** shipped on 2026-09-01 — four days before stack.md was written

> "This release introduces a unified, cross-language inference API, a shared native runtime,
> and packaging and reliability improvements…
> **IMPORTANT: In-process OpenAI-style SDK clients are replaced by the Session API.** Migrate
> inference code to `ChatSession`, `EmbeddingsSession`, or `AudioSession` and use typed
> `Request`, `Response`, and `Item` objects. The deprecated OpenAI-style clients remain
> temporarily available in C#, Python, JavaScript/TypeScript, and Rust to ease migration.
> **OpenAI-compatible request and response types remain supported through the local HTTP
> service.**"
> — https://github.com/microsoft/Foundry-Local/releases/tag/v2.0.1

Implications for this playground:

- `model.get_chat_client()` — the shape in the SDK reference and every Learn quickstart — is
  now **deprecated**. The Learn documentation has not caught up.
- The **local HTTP service keeps its OpenAI-compatible surface**, which is precisely the seam
  ADR-0003 puts the C# Agent on. That seam is the *stable* half of this release. Good news
  for the architecture; worth saying so explicitly in the ADR.
- The `-winml` package split is gone (§8).

### b. v2 makes images a **typed, first-class item across all SDKs, including C#**

From the same release notes:

> "Typed **text, message, image, audio, tensor, byte, tool-call, tool-result, and speech items**."
> "**Multimodal messages with URI-based or in-memory image and audio inputs.**"
> "`ChatSession`, `EmbeddingsSession`, and `AudioSession` are available across C#, Python,
> JavaScript/TypeScript, Rust, C++, and the stable C ABI."

This is the single most consequential finding for ADR-0003. Its *technical* argument — "the
vision payload is a Foundry-specific `extra_body` smuggle that no `IChatClient` adapter will
carry" — is true of the **Responses-API-over-HTTP** path the sample uses, but Foundry Local
2.0.1 gives **C#** a typed native image item that does not go through `IChatClient` at all.
A C# app could now do vision on-device without a bridge.

This does **not** invalidate ADR-0003 — its *domain* argument (the Agent consumes
Observations, it does not produce them) is untouched, and ADR-0003 explicitly says the two
reasons are independent. But the ADR currently presents the technical reason as a hard
constraint. It is now a **choice**, and the ADR is stronger if it says so.

### c. Foundry Local's official samples repository is moving

Every current Learn quickstart points at **`github.com/microsoft-foundry/foundry-samples`**
(`samples/python/foundry-local/native-chat-completions`, `…/live-audio-transcription`, etc.),
not `microsoft/Foundry-Local/samples/`. Both repositories are live — the vision sample this
project depends on is still only in `microsoft/Foundry-Local` — but the canonical sample home
is drifting. Worth a watch item.

### d. More local VLMs than stack.md lists, and a text-only lookalike

`qwen3.5-9b` (not `-…-9b`), and `qwen3.5-2b-text` which is **chat**, not
`vision-language-chat`. See §3.

### e. A multilingual streaming ASR model exists

`nvidia-nemotron-3.5-asr-streaming-multilingual-0.6b`, "supports 30+ languages including
auto-detect" — documented alongside the English model. Relevant if the optional speech half
of the demo ever needs Spanish.

### f. `DiscoverEps()` exists

C# `mgr.DiscoverEps()` / JS `manager.discoverEps()` return each EP with `Name` and
`IsRegistered`. Not an EP *switch*, but it is a first-party way to report the Hardware
Profile a Benchmark Run actually ran on — which is exactly what CONTEXT.md says a Hardware
Profile is for.

---

## Recommended edits to `docs/stack.md`

Nothing here is applied — this file only records findings.

**Corrections (factually wrong as written):**

1. **§Constraint 3, EP list.** `NvTensorRTRTXExecutionProvider` → **`NvTensorRtRtxExecutionProvider`**.
   Add **`MIGraphXExecutionProvider`** (AMD GPU; note "not supported for GenAI scenarios today").
   Move **WebGPU** out of "built in" — on Windows it is a downloadable, experimental plugin EP
   (`WebGpuExecutionProvider`). Add **DirectML (legacy)** to the built-in list alongside CPU.
   Cite https://learn.microsoft.com/en-us/windows/ai/new-windows-ml/supported-execution-providers.
2. **§Constraint 1 table.** Split `qwen3.5-…-2b` from **`qwen3.5-2b-text`** (task `chat`, not a
   VLM). Write the 9B alias as **`qwen3.5-9b`**.
3. **§References.** Relabel the Windows get-started link — it has no EP control; it is the
   source for alias auto-selection and the two Python packaging warnings.
4. **§References.** Replace the bare `/foundry-local/` + title for HF compilation with the real
   URL: `…/azure/foundry-local/how-to/how-to-compile-hugging-face-models`.
5. **§References.** Use the canonical Agent Framework provider URL:
   `…/agent-framework/integrations/by-component/model-providers/foundry-local`.
6. **§References.** Either deep-link or drop "vision tools" and "Multi-Agent Foundry Local
   DevUI demo" for Agent-Framework-Samples; only `09.Cases/FoundryLocalPipeline` was located.
7. **`docs/adr/0001`** (out of scope for this file, but flagging): "small on-device variants
   (3B, 7B)" is wrong — the local Qwen3-VL variants are **2B, 4B and 8B**.

**Additions (new and material):**

8. **New subsection under the Python SDK: Foundry Local 2.0.1.** Say that v2.0.1 (2026-09-01)
   replaces the in-process OpenAI-style clients with the **Session API**, that
   `model.get_chat_client()` is deprecated-but-present, that **the local HTTP service keeps its
   OpenAI-compatible surface** (so the C#-Agent seam is unaffected), and that the `-winml`
   packages are **merged away** in 2.x. Note the Learn docs still describe 1.2.x.
9. **A note against Constraint 2 / ADR-0003.** v2.0.1 gives C# typed image items on
   `ChatSession`. The technical half of ADR-0003 is now a design choice rather than a hard
   blocker. The domain half is unchanged and still load-bearing.
10. **§Constraint 3.** Mention `DiscoverEps()` as the first-party way to report which EP a
    Benchmark Run actually used — the Hardware Profile evidence CONTEXT.md asks for.
11. **§Constraint 3, hedging.** Change "No vision-language model **in the local catalogue**
    ships an NPU variant" to "No NPU variant is visible to this machine" — the catalogue is
    hardware-filtered per device, and this CLI failed to parse nine entries.
12. **§What is demonstrated.** Attribute the transcription numbers: they are Microsoft's own
    devblog figures with no stated hardware, not measurements. Call the feature the
    **live audio transcription API**, Microsoft's name for it. Add
    `nvidia-nemotron-3.5-asr-streaming-multilingual-0.6b` as the multilingual option.
13. **§Vision payload.** Show the full `{"type": "message", "role": "user", "content": [...]}`
    envelope, not just the image part — the envelope is hand-built too.
14. **§Python SDK shape.** `manager.urls[0].rstrip("/") + "/v1"`; teardown order in the sample
    is `close()` → `stop_web_service()` → `unload()`. Flag `get_model_variant` as
    sample-only, absent from the SDK reference — Constraint 3's only lever rests on it.
15. **§References, watch item.** Learn quickstarts now point at
    `github.com/microsoft-foundry/foundry-samples`; the vision sample is still only in
    `microsoft/Foundry-Local`.
