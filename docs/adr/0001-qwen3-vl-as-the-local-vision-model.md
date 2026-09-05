# Qwen3-VL is the local vision model, not Phi-4-multimodal

The project was pitched around Phi-4-multimodal, but that model lives in the Microsoft
Foundry **cloud** catalogue — the local catalogue was text-only until Foundry Local 1.1
added Qwen3-VL, a natively multimodal vision-language model with small on-device variants
(2B, 4B and 8B in this machine's catalogue), alongside vision support in the Responses API. Since Local-First is the premise
of the whole playground and not an optimisation, the model has to come from the local
catalogue: we build on **Qwen3-VL** (`qwen3-vl-2b-instruct` in the official sample).

## Considered Options

- **Compile Phi-4-multimodal from Hugging Face ourselves** so it runs on Foundry Local.
  Rejected as the primary path: it puts a build step between an Operator and a working
  demo, and the point of the demo is how little friction local-first now has. Still open
  as a later comparison exercise.
- **Run Phi-4-multimodal in the cloud.** Rejected as the primary path for the obvious
  reason, but kept deliberately as the *comparison* — Phi-4-reasoning-vision in the cloud
  is what makes the "when does local actually compensate?" argument concrete.
