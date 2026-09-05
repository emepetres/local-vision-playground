# local-vision-playground

A demo and teaching playground for multimodal vision running entirely on the local
machine, with no cloud. Foundry Local serves a local vision-language model on ONNX
Runtime, with NPU/GPU/CPU acceleration. It processes a camera feed to detect, describe
and answer questions about what it sees; measures how that performs across different
hardware; and closes the loop with a Microsoft Agent Framework agent in C# that
orchestrates actions from what was detected — the "local-first agents" pattern
popularised by Bruno Capuano.

Two constraints shape everything: the local model is **Qwen3-VL**, not Phi-4-multimodal
(ADR-0001), and there is no first-party .NET bridge from Foundry Local to `IChatClient`
(ADR-0002). Read `docs/stack.md` before making technical decisions.

See `CONTEXT.md` for the project's vocabulary.

## Language

All repository documentation, code, comments and commit messages are written in
**English**. The user communicates in **Spanish (Spain)** — reply to them in Spanish,
but never write Spanish into the repo.

## Agent skills

### Issue tracker

Issues live in GitHub Issues on `emepetres/local-vision-playground`, managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, using the default label names. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
