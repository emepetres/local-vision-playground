# Microsoft Stack and Known Constraints

The Microsoft technologies this playground demonstrates, the constraints that shape how it
must be built, and the primary sources for both.

The original contents of this file were supplied by the maintainer on 2026-09-05. Every
claim has since been checked against primary sources — Microsoft Learn, the
`microsoft/Foundry-Local` release notes and sample source, PyPI/NuGet, and this machine's
own `foundry model list`. The full evidence, quote by quote, is in
[docs/research/2026-09-05-stack-verification.md](./research/2026-09-05-stack-verification.md);
claims that survived only as inference rather than as documentation are marked inline below.
The Foundry Local catalogue moves quickly — re-run `foundry model list` rather than trusting
a name here.

## What is demonstrated

- **Foundry Local (GA)** — the local inference runtime.
- **The Microsoft Foundry model catalogue** — note that the local and cloud catalogues
  differ; see the constraint below.
- **ONNX Runtime**, with GPU / CPU acceleration via execution providers (NPU: see
  Constraint 3).
- **Microsoft Agent Framework in C#** — orchestration of Actions from Observations.
- **Microsoft.Extensions.AI (MEAI)** — the abstraction layer the Agent talks through.
- **A comparison against Microsoft Foundry in the cloud** — not to run it, but to make the
  case for when each option is worth it.

Optional, in scope if the demo needs more weight behind the local-first message: the
**live audio transcription API** (Microsoft's own name for it) added in Foundry Local 1.1,
running on `nemotron-speech-streaming-en-0.6b`, or
`nvidia-nemotron-3.5-asr-streaming-multilingual-0.6b` for 30+ languages including Spanish.
Microsoft's devblog reports it faster than real time on CPU with ~0.56s algorithmic latency
— their figures, with no hardware stated, not measurements taken here. Note the English
alias does not appear in this machine's `foundry model list` (see below). That would put
vision and speech on the same laptop with no cloud.

## Constraint 1 — the local catalogue is not the cloud catalogue

Foundry Local **1.1** introduced vision support in the **Responses API** and shipped
`qwen3-vl-2b-instruct`, a natively multimodal vision-language model, into the local
catalogue. (The stronger framing — "the local catalogue was text-only for months" — is a
reasonable reading of the 1.1 announcement but is not stated by any first-party source.)

**Phi-4-multimodal lives in the cloud catalogue, not the local one.** The primary local
model is **Qwen3-VL**. See [ADR-0001](./adr/0001-qwen3-vl-as-the-local-vision-model.md).

### What the local catalogue actually contains **[verified 2026-09-05]**

Checked with `foundry model list` on the development machine, CLI **0.8.119**. The task
string to look for is `vision-language-chat`:

| Alias | Variants |
| --- | --- |
| `qwen3-vl-2b-instruct` | `-cuda-gpu`, `-generic-cpu` |
| `qwen3-vl-4b-instruct` | `-cuda-gpu`, `-generic-cpu` |
| `qwen3-vl-8b-instruct` | `-cuda-gpu`, `-generic-cpu` |
| `qwen3.5-0.8b` / `qwen3.5-2b` / `qwen3.5-4b` / `qwen3.5-9b` | `-cuda-gpu`, `-generic-gpu`, `-generic-cpu` |
| `ministral-3-3b-instruct-2512` | `-cuda-gpu`, `-generic-gpu`, `-generic-cpu` |
| `gemma-4-e2b-it` | `-cuda-gpu`, `-generic-gpu`, `-generic-cpu` |

ADR-0001's `qwen3-vl-2b-instruct` is confirmed to exist. All of these also carry `tools`.
Note there are considerably more local VLMs than the demo needs — enough for a
model-to-model comparison on fixed hardware.

**The trap in that table**: there is a separate alias `qwen3.5-2b-text` whose task is plain
`chat`, not `vision-language-chat`. It is a text-only sibling of `qwen3.5-2b` and will not
see a Frame. Match on the task string, never on the alias prefix.

`foundry model list` on 0.8.119 also emits nine `Failed to process model` errors; the
catalogue is served fine but some entries are not parsed by this CLI version. Worth
re-checking after an upgrade.

### A published variant can be broken **[verified 2026-09-06]**

`qwen3.5-0.8b-cuda-gpu:3` does not load. It fails with

```
This is an invalid model. Error: Duplicate definition of name (pad_CUDAExecutionProvider).
```

and the defect is in the artifact as published, not in anything a caller does. The graph
itself is valid — no duplicate node names, outputs or initializers. What it carries is
ONNX Runtime's **own `Memcpy` nodes, already inserted**: the shipped `vision.onnx` has 55
of them, including `Memcpy_token_218: MemcpyFromHost(pad) -> pad_CUDAExecutionProvider`.
The model was exported after an ORT placement pass rather than before it, so when ORT runs
that pass again at load time it regenerates the same name and collides with the copy
baked in.

`qwen3-vl-2b-instruct-cuda-gpu:2` ships baked `Memcpy` nodes too (32), but none for `pad`,
which is why it loads. `qwen3.5-0.8b-generic-cpu:3` runs the same workload fine, and `:3`
is already the latest version of the CUDA variant, so there is nothing to upgrade to.
Reported as [microsoft/foundry-local#1075](https://github.com/microsoft/foundry-local/issues/1075);
[#1039](https://github.com/microsoft/foundry-local/issues/1039) is the same failure on
`qwen3.5-9b-generic-gpu:3`, and the CUDA-suffixed name appearing while loading a *WebGPU*
variant is what confirms these names travel inside the artifact.

Counting the raw string in the file is **not** evidence of the bug — a name legitimately
appears twice, once where it is produced and once where it is consumed. The graph has to
be parsed.

**Fixed upstream [verified 2026-09-25].** On 2026-09-11 Foundry Local republished the Qwen3.5
models as `:4`, exported without the baked `Memcpy` nodes
([comment on #1075](https://github.com/microsoft/foundry-local/issues/1075#issuecomment-5639170383)),
and they load. The catalogue now lists `qwen3.5-*-generic-gpu:4`; the CPU variants are still
`:3`. The fix came from the publisher, as it had to — nothing a caller did changed it — so the
lesson below stands.

Two things follow. **An alias can select a variant that cannot run** — Foundry Local picks
the hardware, and it picked this one — so resolving by alias is not a guarantee that a
model loads. And **a load failure is an ordinary outcome, not a crash**: the only lever is
to name a different variant, which is why `observe` says so in as many words instead of
printing the native stack.

## Constraint 2 — there is no first-party .NET bridge to Foundry Local

Agent Framework's own documentation states that Foundry Local is not currently supported
in .NET; the `FoundryLocalClient` provider is Python-only. Meanwhile MEAI and Agent
Framework both expect an `IChatClient`. Nothing first-party joins the two. Bruno Capuano
hit exactly this and wrote an adapter. See
[ADR-0002](./adr/0002-custom-ichatclient-adapter-for-foundry-local.md).

### The vision payload is not the OpenAI shape **[verified 2026-09-05]**

This sharpens Constraint 2 considerably. The official sample uses the stock `openai`
Python client against the local endpoint, but the image is passed as:

```python
vision_input = [
    {
        "type": "message",
        "role": "user",
        "content": [
            {"type": "input_text", "text": "Describe this image."},
            {"type": "input_image", "image_data": image_b64, "media_type": media_type},
        ],
    }
]
```

— raw base64 with no `data:` prefix, not OpenAI's `image_url`. The message envelope is
hand-built too, not just the image part, which matters to anyone porting this to C#.
`media_type` comes from the actual image via Pillow: `image/jpeg`, `image/png`, `image/gif`,
`image/bmp` or `image/webp`. The OpenAI SDK does not type any of this, so the sample passes a
dummy `input="placeholder"` and smuggles the real payload through
`extra_body={"input": vision_input, "max_output_tokens": 8192}`, which overwrites it on the
wire.

The consequence: an `IChatClient` adapter built for chat should not be assumed to carry
images. This is the technical half of the reason the C# Agent never sees a Frame — see
[ADR-0003](./adr/0003-the-agent-consumes-observations-not-images.md).

**Caveat, as of Foundry Local 2.0.1** (see the Session API below): that reasoning holds for
the Responses-API-over-HTTP path the sample uses, but 2.0.1 gives C# a *typed* image item on
`ChatSession`, natively, without going through `IChatClient` at all. A C# app could now do
vision on-device with no bridge. That makes ADR-0003's technical half a design choice rather
than a hard blocker; its domain half — the Agent consumes Observations, it does not produce
them — is untouched and still load-bearing.

## Constraint 3 — Foundry Local offers no Execution Provider switch, and no NPU or GPU vision build on the demo machine **[verified 2026-09-05]**

Two facts that together reshape what the benchmarking half of the demo can promise.

**Selection is implicit.** Nothing in the SDK or the sample chooses an execution provider.
`manager.download_and_register_eps()` registers *all* EPs applicable to the machine; its only
parameter is a progress callback. (Precisely true of the *Python* API, which is what this
project uses — the Rust signature takes an optional first argument that hints at an EP filter
at the native layer, and the SDK reference does not document the call at all.) The choice
happens at model load: passing an **alias** lets Foundry pick the best available hardware
automatically, which Microsoft states in as many words. The only lever is to pass a **variant
id** instead — `qwen3-vl-2b-instruct-generic-cpu` pins CPU, `…-cuda-gpu` pins CUDA. So a
Benchmark Run selects hardware by naming a variant, not by configuring a backend. Note that
variant pinning is inferred from the sample's own `get_model_variant` fallback and its usage
line; no Learn page says it in words.

That the choice is implicit is a fact about **Foundry Local**, not about the project. The
lever now has a companion: the second Runtime (OpenVINO GenAI) *is* told its Execution
Provider explicitly — it has no catalogue to ask and never chooses one — see
[ADR-0012](./adr/0012-two-runtimes-foundry-local-is-not-the-only-source.md) and
[ADR-0013](./adr/0013-the-second-runtime-is-an-adapter-behind-an-unchanged-model-port.md).

### Naming a variant without pinning its version **[verified 2026-09-06]**

A **variant id** carries a version (`qwen3-vl-2b-instruct-generic-cpu:2`) and pins one build.
Writing one into source means the code breaks the day the catalogue publishes the next
version, so a variant is better named without one — and the catalogue asked which version
that name resolves to today. Two `Catalog` calls look purpose-built for that. Neither works:

- **`get_model_versions(alias, model_name)`**, documented as "all versions of a model alias",
  returned `[]` for `("qwen3-vl-2b-instruct", "qwen3-vl-2b-instruct-cuda-gpu")` and only the
  `generic-cpu` variant for the bare alias — on a machine where
  `get_model_variant("qwen3-vl-2b-instruct-cuda-gpu:2")` resolves that exact build, GPU
  runtime and all.
- **`get_latest_version(model_or_variant)`** takes an `IModel`, so it can only refine a
  variant already in hand — not find one from a name.
- **`get_model(alias).variants`** returns just the one variant Foundry Local would itself
  pick for the alias, not every variant of it.

What does work is `list_models()`, whose per-alias `IModel`s do carry the full `variants`
list, with `info.name` (no version) and `info.version` on each. That is the sweep this
project resolves a variant name through.

Two caveats. **What the catalogue lists is not stable**: on one afternoon, successive runs
listed both `qwen3-vl-2b-instruct` variants, then only `generic-cpu`, alongside a
`RegionFallback: region 'westeurope' unhealthy` warning — so a variant name that resolved an
hour ago can fail to resolve now, while the fully versioned id still resolves. And the
catalogue is hardware-filtered per device on top of that.

For reporting which Execution Provider a Benchmark Run *actually* used, the C#/JS SDKs expose
`DiscoverEps()` / `discoverEps()`, returning each EP's `Name` and `IsRegistered`. Not a
switch, but it is the first-party way to evidence a Hardware Profile.

**On the demo machine, Foundry Local's catalogue offers `qwen3-vl` only `generic-cpu`** —
no `generic-gpu`, no NPU build — so through Foundry Local the vision path on the very
machine the demo runs on is **CPU-only**, even though that machine has both an Arc 140V
iGPU and an `Intel(R) AI Boost` NPU. (`qwen3-vl` having no GPU build at all is already
visible in Constraint 1's table: its only variants are `-cuda-gpu` and `-generic-cpu`, so a
machine without CUDA has no GPU option through Foundry Local. The `qwen3.5-*` vision models do
publish a `-generic-gpu` variant, which is a way onto the Arc iGPU without leaving Foundry
Local — see [#75](https://github.com/emepetres/local-vision-playground/issues/75).) Verified on the demo machine
2026-09-16 (CLI 0.8.103): its catalogue does list NPU variants, but all `openvino-npu` and
all of task `chat-completion` — zero `vision-language-chat` models have one. The catalogue
is hardware-filtered per device, so a different machine may be offered other builds.

The machine's own accelerators are therefore reached **outside Foundry Local**, through a
second Runtime (OpenVINO GenAI) running the same weights — see
[ADR-0012](./adr/0012-two-runtimes-foundry-local-is-not-the-only-source.md) and
[ADR-0013](./adr/0013-the-second-runtime-is-an-adapter-behind-an-unchanged-model-port.md).
The demonstrable Execution Provider axis is no longer "CUDA-GPU vs CPU" alone: it is a
Benchmark of four rows across two Runtimes (FL-CPU, OV-CPU, OV-GPU, OV-NPU). The NPU is a
third Execution Provider with its own profile — on a model this small it leads on TTFT, not
on decode throughput — not a faster replacement for the GPU.

**Both Runtimes run INT4 [verified 2026-09-25].** Foundry Local's `qwen3-vl` builds are not
full precision — their catalogue sizes (1.34 GB for the 2B, 2.73 GB for the 4B) only fit 4-bit
weights, and its other CPU builds are named `cpu-int4-rtn-block-32`. Our OpenVINO IR is INT4
too, but channel-wise and symmetric on every layer, the shape the NPU wants, which is a much
coarser recipe. The quality gap between the Runtimes is that difference, not quantised against
unquantised. See [the INT4 note](./research/2026-09-25-int4-quantisation.md).

For reference, per the Windows ML supported-EP table — the one page that carries the actual
`EpName` strings, and which three Microsoft pages disagree about:

- **Included with the runtime**: CPU (MLAS) and DirectML (legacy).
- **Downloaded on demand**: `MIGraphXExecutionProvider` (AMD GPU — but "not supported for
  GenAI scenarios today", which is what Foundry Local's VLMs are),
  `NvTensorRtRtxExecutionProvider` (NVIDIA), `OpenVINOExecutionProvider` (Intel CPU/GPU/NPU),
  `QNNExecutionProvider` (Qualcomm NPU), `VitisAIExecutionProvider` (AMD NPU),
  `WebGpuExecutionProvider` (Microsoft, **experimental**).

Note WebGPU is *not* built in on Windows — it is a downloadable, experimental plugin EP. The
"WebGPU via Dawn" chain is correct as architecture, not as packaging. CUDA reaches Foundry
Local through its own runtime rather than through this Windows ML plugin list.

## The Python SDK **[verified 2026-09-05]**

`foundry-local-sdk` on PyPI. On 1.2.x there is a Windows-accelerated sibling,
`foundry-local-sdk-winml` — Microsoft's instruction is to install one, never both, "as they
have conflicting `onnxruntime-core` dependencies". Quote that phrasing rather than asserting
the mechanism: at current versions the two no longer share an `onnxruntime-core` requirement
and the direct collision is on `onnxruntime-genai-core`. **On 2.x the split is gone
entirely** (see below), though the Learn pages still show the Windows/Cross-Platform tabs.
The PyPI package named `foundry-local`, without `-sdk`, is an unrelated third party —
Microsoft says so itself, and PyPI corroborates it (version 0.0.1, a personal author email,
a homepage at an unrelated company).

It is not a CLI wrapper: it is an in-process native library that handles catalogue lookup,
download, load/unload and EP registration. The OpenAI-compatible REST server is
**optional** — `manager.start_web_service()`. That endpoint is still the seam the C# Agent
talks to, but `vision/` does not start it: serving it is Foundry Local's job, and nothing
on the Python side speaks HTTP. See
[ADR-0004](./adr/0004-target-foundry-local-2x-in-process.md).

Shape: `Configuration(app_name=…)` → `FoundryLocalManager(config)` →
`manager.catalog.get_model(alias)` (falling back to `get_model_variant(id)` for a pinned
variant) → `model.download()` → `model.load()` → call `openai.responses.create` against
`manager.urls[0].rstrip("/") + "/v1"` with `model=model.id`. The sample tears down in the
order `openai.close()` → `manager.stop_web_service()` → `model.unload()`.

The samples call `FoundryLocalManager.initialize(config)`, which reads as the way in but is
a `@staticmethod` doing nothing but `FoundryLocalManager(config)` and dropping the instance
(verified against 2.0.1's `foundry_local_manager.py`). The manager is a singleton whose
constructor raises once one exists, so `initialize()` followed by a construction is an
error, not a sequence — a caller that needs the manager constructs it and keeps it.

`get_model_variant` is **not** in the SDK reference's Core API table — it is evidenced only
by the sample source. Constraint 3's only hardware lever rests on an under-documented call;
budget for it breaking.

The official sample **does not use a camera** — it reads an image file from disk (an
argument path, falling back to a `test_image.jpg` checked into the sample). No `cv2`, no
`VideoCapture`. Camera capture is entirely this project's own code.

### Foundry Local 2.0.1 changes the SDK surface **[verified 2026-09-05]**

v2.0.1 shipped on 2026-09-01, four days before this file was written, and the Learn docs
still describe 1.2.x. What it does:

- **The in-process OpenAI-style clients are replaced by a Session API** — `ChatSession`,
  `EmbeddingsSession`, `AudioSession`, with typed `Request` / `Response` / `Item` objects.
  `model.get_chat_client()`, the shape every Learn quickstart shows, is deprecated but still
  present to ease migration.
- **The local HTTP service keeps its OpenAI-compatible surface.** That is the seam ADR-0003
  puts the C# Agent on, so the architecture is unaffected — the stable half of the release.
- **Images become typed, first-class items across every SDK, C# included** — multimodal
  messages with URI-based or in-memory image and audio inputs. See the caveat under
  Constraint 2.
- **The `-winml` packages are merged away**: one `foundry-local-sdk` for Python, one
  `Microsoft.AI.Foundry.Local` for .NET. `foundry-local-sdk-winml` is stuck at 1.2.4.

This playground targets **2.x, in-process** — see
[ADR-0004](./adr/0004-target-foundry-local-2x-in-process.md). Note that the SDK reference on
Learn (`reference-sdk-current`) still documents the 1.x API, so it is not a source for this
path; the 2.0.1 release notes and the package's own README are.

### A `ChatSession` is a conversation, not an endpoint **[verified 2026-09-06]**

`ChatSession` accumulates turns. It exposes `turn_count` and `undo_turns(count)` precisely
because it does, and the `openai`-compatible wrappers document themselves as "stateless — no
turn history" by contrast: they build a fresh native session per call. Nothing warns a caller
that holds one open.

That is invisible while a command makes one request per process, and fatal the moment one
makes N: the second request carries the first Frame and the first answer as context, the
third carries two, and the prompt grows monotonically. A Benchmark built on it would report a
latency curve that is its own conversation history rather than the hardware — and every
number would look ordinary. `vision/` therefore clears the turns before each request rather
than rebuilding the session, so that only the inference itself falls inside the measured
time. The port says so: an Observation is answered from its own Frame alone.

## References

### Foundry Local

- Docs: https://learn.microsoft.com/en-us/azure/foundry-local/
- Get started (full quickstart code): https://learn.microsoft.com/en-us/azure/foundry-local/get-started
- CLI reference: https://learn.microsoft.com/en-us/azure/foundry-local/reference/reference-cli
- SDK reference: https://learn.microsoft.com/en-us/azure/foundry-local/reference/reference-sdk-current
- Architecture, incl. EP selection at load time: https://learn.microsoft.com/en-us/azure/foundry-local/concepts/foundry-local-architecture
- Samples repo, all languages: https://github.com/microsoft/Foundry-Local
- Windows get-started — the source for alias-based hardware auto-selection and for the two
  Python packaging warnings. It has **no** execution-provider control; it points at Windows
  ML for that: https://learn.microsoft.com/en-us/windows/ai/foundry-local/get-started
- Windows ML supported execution providers — the authoritative `EpName` table:
  https://learn.microsoft.com/en-us/windows/ai/new-windows-ml/supported-execution-providers
- Foundry Local releases, incl. the v2.0.1 migration notes:
  https://github.com/microsoft/Foundry-Local/releases

### Local vision — the load-bearing pieces

- **The vision sample to work from**: https://github.com/microsoft/Foundry-Local/tree/main/samples/python/web-server-responses-vision
- **Foundry Local 1.1 announcement**, vision code annotated line by line, plus live
  transcription and embeddings: https://devblogs.microsoft.com/foundry/foundry-local-v1-1/

### Models

- Qwen3-VL in the local catalogue — see the verified table above, or run `foundry model list`.
- Phi-4-reasoning-vision-15B, for the cloud comparison: https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/introducing-phi-4-reasoning-vision-to-microsoft-foundry/4499154
- Research blog, details and benchmarks: https://www.microsoft.com/en-us/research/blog/phi-4-reasoning-vision-and-the-lessons-of-training-a-multimodal-reasoning-model/
- Phi-4-multimodal on Hugging Face, if it ends up being compiled by hand: https://huggingface.co/microsoft/Phi-4-multimodal-instruct
- Compiling Hugging Face models for Foundry Local: https://learn.microsoft.com/en-us/azure/foundry-local/how-to/how-to-compile-hugging-face-models

### Agent Framework

- Framework: https://github.com/microsoft/agent-framework
- .NET samples: https://github.com/microsoft/agent-framework/tree/main/dotnet/samples
- Foundry Local provider (Python only): https://learn.microsoft.com/en-us/agent-framework/integrations/by-component/model-providers/foundry-local
- Official samples — `09.Cases/FoundryLocalPipeline` is the one confirmed to exist; the
  vision-tools and DevUI demos were not located in the tree:
  https://github.com/microsoft/Agent-Framework-Samples

### Bruno Capuano — directly reusable

- The Foundry Local → `IChatClient` adapter for C#: https://elbruno.com/2026/06/05/local-first-ai-agents-in-c-foundry-local-meai-and-microsoft-agent-framework/
  and https://github.com/elbruno/ElBruno.MAF.FoundryLocal
- Local agent with vision and function calling (over Ollama, but useful for structure): https://elbruno.com/2025/12/18/%F0%9F%A4%96-local-ai-power-vision-and-function-calling-with-microsoft-agent-framework-and-ollama/
- His Agent Framework samples fork: https://github.com/elbruno/agent-framework-samples

### Watch items

- Learn's quickstarts now point at https://github.com/microsoft-foundry/foundry-samples
  rather than `microsoft/Foundry-Local/samples/`. Both repos are live and the vision sample
  is still only in the latter, but the canonical sample home is drifting.

### Guided lab

- Foundry Local Lab — agents, RAG, transcription and tool calling, all local: https://techcommunity.microsoft.com/blog/educatordeveloperblog/getting-started-with-foundry-local-a-student-guide-to-the-microsoft-foundry-loca/4503604
