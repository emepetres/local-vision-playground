# The second Runtime is an adapter behind an unchanged model port

[ADR-0012](./0012-two-runtimes-foundry-local-is-not-the-only-source.md) fixed that there
are two Runtimes and left the shape of the seam between them to
[#41](https://github.com/emepetres/local-vision-playground/issues/41). This is that shape.
OpenVINO GenAI enters as a **second adapter behind the `VisionModel` port, which does not
change**. What generalises is the *resolution* port: today's `FoundryLocal` becomes one of
two **`Runtime`s**, each answering `resolve(name) -> VisionModel`, and the commands hold a
**router** over the two in place of the single `foundry`. An Operator picks the Runtime
**per Variant** — the Runtime rides in the Variant token, because a Benchmark measures both
Runtimes in one sitting and nothing else can select them apart there.

The model port stays because the second Runtime already fits it. `VLMPipeline.generate()`
is stateless — there is no conversation to clear, so the turn-forgetting that Foundry
Local's `ChatSession` needs ([ADR-0004](./0004-target-foundry-local-2x-in-process.md)) has
no counterpart to leak across the port. The Workload crosses unchanged
([ADR-0005](./0005-the-workload-crosses-the-model-port.md)): decoding the Frame's bytes to
the RGB tensor OpenVINO wants, and reading `temperature: 0.0` as greedy `do_sample=False`,
are the adapter's own business. And a `RawObservation` is answerable in full from
`VLMDecodedResults` — `perf_metrics.get_num_generated_tokens()` is the `completion_tokens`
a Benchmark compares, and `finish_reasons` maps `LENGTH` to truncated and `STOP` to
complete. `observe_structured` reuses `parse_objects_present` untouched: the same Qwen3-VL
weights answer the same JSON-in-prompt request ([ADR-0011](./0011-a-structured-observation-is-obtained-by-tool-calling.md)),
so only the generate call is the adapter's, not the parse.

`register_execution_providers` stays **Foundry Local's alone** and is not lifted onto the
common `Runtime` port. It is a Foundry Local concept — it downloads and registers the
Execution Providers because Foundry Local picks the Execution Provider and nothing selects
one explicitly; OpenVINO GenAI is *told* its device and has nothing to register. The router
calls it once per sitting, and only when a Foundry Local Variant is in it, which is what
keeps the Benchmark's `providers` figure meaning what it means — machine set-up paid once
per process, zero in a sitting that never touched Foundry Local.

An OpenVINO Variant is named by the **provenance slug** the conversion step writes
([#43](https://github.com/emepetres/local-vision-playground/issues/43)) —
`qwen3-vl-2b-instruct-int4-sym-npu` — or by a path to an IR directory. The router
discriminates by which Runtime **claims** the name: OpenVINO GenAI claims a name that
resolves to an on-disk IR directory carrying a `provenance.json`, and Foundry Local claims
the rest — aliases, Variant names and ids. The identity a claimed Variant carries is read
from its `provenance.json`, never from the path it was found at: a path on disk is not an
identity, and a Benchmark is read back months later (CONTEXT.md, "Provenance"). Where the IR
lives — deferred here from #43 — is `$LVP_IR_CACHE`, or `%LOCALAPPDATA%\local-vision-playground\ir\<slug>`
when that is unset, each directory holding the IR bytes beside their `provenance.json`.

## Considered Options

- **Reshape the `VisionModel` port** — drop `download`/`is_cached` as Foundry-catalogue
  concepts, and change `observe` to carry session lifetime or a device. Rejected: the port
  already fits. Statelessness removes the turn concern the reshape existed to serve, the
  Workload crosses unchanged, and the result carries the tokens and finish reason a
  Benchmark needs. Reshaping would churn the Foundry Local adapter and the fakes for a fit
  that already holds. `download`/`is_cached` stay with trivial OpenVINO meanings instead —
  `is_cached` is whether the IR is on disk, and `download` is a refusal, because the
  conversion step (#43) produces the IR out of band and nothing fetches it at run time.
- **Put `register_execution_providers` on the common `Runtime` port as an OpenVINO no-op.**
  Rejected: it hangs a Foundry-shaped method on a port OpenVINO should not have to satisfy,
  and a no-op would blur that registering Execution Providers is Foundry Local's alone.
  Keeping it off the common port is precisely what a test asserts the seam by — the OpenVINO
  Runtime that has no such method is the one that proves the boundary.
- **A global `--runtime` flag.** Rejected: it cannot express the four-row Benchmark. That
  sitting measures FL-CPU alongside OV-CPU/GPU/NPU, and the two CPU rows are the calibration
  *between* the Runtimes, which is only a calibration inside one sitting (CONTEXT.md,
  "Benchmark"). A flag that fixed one Runtime for the whole invocation would force two
  sittings and throw the calibration away.

## Consequences

**The commands hold a router, not a `foundry`.** A `Runtime` is `resolve(name) ->
VisionModel`; the router owns both Runtimes and sends each Variant to the one that claims
it. `benchmark --variant qwen3-vl-2b-instruct-generic-cpu --variant qwen3-vl-2b-instruct-int4-sym-npu`
measures both Runtimes in one sitting; `observe` and `watch` pick their single Variant's
Runtime the same way.

**The OpenVINO adapter owns its own lifetime.** Stateless generation, the Frame-to-tensor
decode, `CACHE_DIR` to collapse the NPU's compile on every start
([#45](https://github.com/emepetres/local-vision-playground/issues/45)), and the clean-env
defence against the system-wide OpenVINO 2025.3 archive that shadows the pip build
([#38](https://github.com/emepetres/local-vision-playground/issues/38)) — all of it is
behind the port, none of it crosses it.

**The fakes gain a second Runtime.** Following [ADR-0005](./0005-the-workload-crosses-the-model-port.md),
the doubles carry the port's shape: a fake OpenVINO Runtime with **no**
`register_execution_providers`, and a provenance-shaped `ModelIdentity` — no catalogue id,
no `:version` — beside the Foundry-shaped one. The Runtime that lacks the method is what a
test reads the seam off.

**The Execution Provider identity is settled on the port, not only in the record.**
[#42](https://github.com/emepetres/local-vision-playground/issues/42) fixed the persisted
shape; this fixes that the `ModelIdentity` the port returns is what that record reads, and
that for an OpenVINO Variant it comes from the `provenance.json`. That unblocks
[#44](https://github.com/emepetres/local-vision-playground/issues/44) and feeds the
backlog item 8 specification.
