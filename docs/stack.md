# Microsoft Stack and Known Constraints

The Microsoft technologies this playground demonstrates, the two constraints that shape
how it must be built, and the primary sources for both.

Everything here was supplied by the maintainer on 2026-09-05 and has **not** been
re-verified against the linked sources. Verify before relying on a version number or an
API shape — the Foundry Local catalogue moves quickly.

## What is demonstrated

- **Foundry Local (GA)** — the local inference runtime.
- **The Microsoft Foundry model catalogue** — note that the local and cloud catalogues
  differ; see the constraint below.
- **ONNX Runtime**, with NPU / GPU / CPU acceleration via execution providers.
- **Microsoft Agent Framework in C#** — orchestration of Actions from Observations.
- **Microsoft.Extensions.AI (MEAI)** — the abstraction layer the Agent talks through.
- **A comparison against Microsoft Foundry in the cloud** — not to run it, but to make the
  case for when each option is worth it.

Optional, in scope if the demo needs more weight behind the local-first message: the
**Live Transcription API** added in Foundry Local 1.1, running on
`nemotron-speech-streaming-en-0.6b` — reportedly faster than real time on CPU, ~0.56s
algorithmic latency. That would put vision and speech on the same laptop with no cloud.

## Constraint 1 — the local catalogue is not the cloud catalogue

Foundry Local's local catalogue was text-only for months. Version 1.1 changed that: it
added a Qwen3-VL vision-language model that reasons over images and text together, with
small on-device variants (3B, 7B), and the new **Responses API** gained vision support for
passing images alongside text input (model-dependent).

**Phi-4-multimodal lives in the cloud catalogue, not the local one.** Plan around
**Qwen3-VL** as the primary local model. `qwen3-vl-2b-instruct` is the alias used in the
official sample; run `foundry model list` to see what is actually available on a given
machine. See [ADR-0001](./adr/0001-qwen3-vl-as-the-local-vision-model.md).

The working pattern from the sample: load `qwen3-vl-2b-instruct`, register the execution
providers for hardware acceleration, start the local web service, and call
`client.responses.create` with a base64 `input_image`.

## Constraint 2 — there is no first-party .NET bridge to Foundry Local

Agent Framework's own documentation states that Foundry Local is not currently supported
in .NET; the `FoundryLocalClient` provider is Python-only. Meanwhile MEAI and Agent
Framework both expect an `IChatClient`. Nothing first-party joins the two.

Bruno Capuano hit exactly this and wrote an adapter. See
[ADR-0002](./adr/0002-custom-ichatclient-adapter-for-foundry-local.md).

## References

### Foundry Local

- Docs: https://learn.microsoft.com/en-us/azure/foundry-local/
- Get started (full quickstart code): https://learn.microsoft.com/en-us/azure/foundry-local/get-started
- CLI reference: https://learn.microsoft.com/en-us/azure/foundry-local/reference/reference-cli
- Samples repo, all languages: https://github.com/microsoft/Foundry-Local
- Windows get-started, with execution-provider control: https://learn.microsoft.com/en-us/windows/ai/foundry-local/get-started

### Local vision — the load-bearing pieces

- **The vision sample to work from**: https://github.com/microsoft/Foundry-Local/tree/main/samples/python/web-server-responses-vision
- **Foundry Local 1.1 announcement**, vision code annotated line by line, plus live
  transcription and embeddings: https://devblogs.microsoft.com/foundry/foundry-local-v1-1/

### Models

- Qwen3-VL in the local catalogue — discover aliases with `foundry model list`.
- Phi-4-reasoning-vision-15B, for the cloud comparison: https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/introducing-phi-4-reasoning-vision-to-microsoft-foundry/4499154
- Research blog, details and benchmarks: https://www.microsoft.com/en-us/research/blog/phi-4-reasoning-vision-and-the-lessons-of-training-a-multimodal-reasoning-model/
- Phi-4-multimodal on Hugging Face, if it ends up being compiled by hand: https://huggingface.co/microsoft/Phi-4-multimodal-instruct
- Compiling Hugging Face models for Foundry Local: https://learn.microsoft.com/en-us/azure/foundry-local/ ("Compile Hugging Face models to run on Foundry Local")

### Agent Framework

- Framework: https://github.com/microsoft/agent-framework
- .NET samples: https://github.com/microsoft/agent-framework/tree/main/dotnet/samples
- Foundry Local provider (Python only): https://learn.microsoft.com/en-us/agent-framework/agents/providers/foundry-local
- Official samples, incl. vision tools, a Multi-Agent Foundry Local DevUI demo and a
  Foundry Local pipeline: https://github.com/microsoft/Agent-Framework-Samples

### Bruno Capuano — directly reusable

- The Foundry Local → `IChatClient` adapter for C#: https://elbruno.com/2026/06/05/local-first-ai-agents-in-c-foundry-local-meai-and-microsoft-agent-framework/
  and https://github.com/elbruno/ElBruno.MAF.FoundryLocal
- Local agent with vision and function calling (over Ollama, but useful for structure): https://elbruno.com/2025/12/18/%F0%9F%A4%96-local-ai-power-vision-and-function-calling-with-microsoft-agent-framework-and-ollama/
- His Agent Framework samples fork: https://github.com/elbruno/agent-framework-samples

### Guided lab

- Foundry Local Lab — agents, RAG, transcription and tool calling, all local: https://techcommunity.microsoft.com/blog/educatordeveloperblog/getting-started-with-foundry-local-a-student-guide-to-the-microsoft-foundry-loca/4503604
