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

See `CONTEXT.md` for the project's vocabulary, `docs/backlog.md` for the thread of the
demo, and `README.md` for the map of every document in the repository.

## Language

All repository documentation, code, comments and commit messages are written in
**English**. The user communicates in **Spanish (Spain)** — reply to them in Spanish,
but never write Spanish into the repo.

## Repository layout

One folder at the root per **domain** — named for the part of the problem it owns, never
for a language or a runtime. Inside a domain sit its **code projects**.

A project folder is the project's own root: its manifest and tooling live there
(`pyproject.toml`, a `.csproj`, lockfiles, config), with `src/` as one folder inside it.

A domain folder may _be_ a single project, in which case the manifest sits directly in the
domain folder. Or it may hold several projects side by side. Nothing says the projects
under one domain share a language: a domain is a boundary in the problem, not in the
toolchain.

```
vision/                 domain — turning Frames into Observations
    pyproject.toml          currently also the project root itself
    src/
agent/                  domain — deciding and acting on Observations
    Agent.csproj            likewise
    src/
docs/                   guides, ADRs, stack notes, agent-facing docs
```

As the playground grows, a domain gains project folders rather than spilling into the
root — and the manifests move down with them (`vision/capture/pyproject.toml`,
`vision/inference/pyproject.toml`).

The two domains are separate processes. They meet at a JSON Lines file `watch --emit`
writes and `agent/` reads — that seam is deliberate, and it is part of what the playground
demonstrates. See
[ADR-0003](./docs/adr/0003-the-agent-consumes-observations-not-images.md) and
[ADR-0014](./docs/adr/0014-observations-cross-as-a-json-lines-file.md).

## Agent skills

### Issue tracker

Issues live in GitHub Issues on `emepetres/local-vision-playground`, managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, using the default label names. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
