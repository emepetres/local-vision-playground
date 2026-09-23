# Reaching the NPU and the Arc GPU — the second Runtime

Everything in the other guides runs through **Foundry Local**, the default Runtime. On the
demo machine its catalogue publishes `qwen3-vl` for the **CPU only** — no Arc iGPU build, no
NPU build ([`docs/stack.md`](../stack.md), Constraint 3) — so the machine's own accelerators
are reached through a **second Runtime, OpenVINO GenAI**, running the same weights exported
once to an OpenVINO IR
([ADR-0012](../adr/0012-two-runtimes-foundry-local-is-not-the-only-source.md),
[ADR-0013](../adr/0013-the-second-runtime-is-an-adapter-behind-an-unchanged-model-port.md)).
A Variant that names an on-disk IR is sent to OpenVINO GenAI; an alias, a variant name or a
variant id goes to Foundry Local. That is the only switch — the Runtime rides in the Variant
token, so `observe`, `watch` and `benchmark` all reach a given Execution Provider by naming
the same Variant.

## 1. Produce the IR — the opt-in `convert` step

The opt-in `convert` dependency group carries two things a plain `uv sync` never installs:
the **export toolchain** (`optimum-intel`, `nncf`, `transformers`), which only the conversion
step uses and which nothing in `observe` / `watch` / `benchmark` imports
([`tools/convert/README.md`](../../vision/tools/convert/README.md)); and the **OpenVINO runtime
libraries** (`openvino`, `openvino-genai`), which the second Runtime imports lazily when an
OpenVINO Variant is named. So `uv sync --group convert` is what both the export machine and
the run machine need — one to produce the IR, the other to run it.

```bash
cd vision
uv sync --group convert                                            # once — toolchain + OpenVINO libraries
uv run --group convert tools/convert/convert.py --ep NPU           # export the INT4-sym IR, tagged for the NPU
uv run --group convert tools/convert/convert.py --ep GPU           # …the Arc iGPU
uv run --group convert tools/convert/convert.py --ep CPU           # …the CPU (the OpenVINO calibration row)
```

One INT4-symmetric export serves all three OpenVINO Execution Providers — `--ep` fixes only
the [Provenance](../../CONTEXT.md) slug the IR is named by and the Execution Provider it is told
to run on, not the export itself. Each IR lands **outside the repo** (it is ~1.7 GB) under
`%LOCALAPPDATA%\local-vision-playground\ir\<slug>` (override with `$LVP_IR_CACHE`), with a
`provenance.json` beside it — the identity a Variant with no catalogue behind it carries.
`--dry-run` prints the plan and checks the NPU driver; the export is CPU-bound and needs no
NPU, but the smoke run does. See
[`tools/convert/README.md`](../../vision/tools/convert/README.md) for the prerequisites, the
recipe and the trap it defends against.

## 2. Name the Variant for each Execution Provider

The provenance slug is the Variant name. With the exports above:

| Execution Provider | Runtime        | Variant to name                     |
| ------------------ | -------------- | ----------------------------------- |
| CPU                | Foundry Local  | `qwen3-vl-2b-instruct-generic-cpu`  |
| CPU                | OpenVINO GenAI | `qwen3-vl-2b-instruct-int4-sym-cpu` |
| Arc iGPU           | OpenVINO GenAI | `qwen3-vl-2b-instruct-int4-sym-gpu` |
| NPU                | OpenVINO GenAI | `qwen3-vl-2b-instruct-int4-sym-npu` |

A path to an IR directory works anywhere a slug does. The two CPU rows are the same silicon
through two Runtimes — the calibration between them. A slug with no IR behind it reaches
neither Runtime: `observe` and `watch` refuse it in one line naming both ways to name a
Variant, and a Benchmark makes it [a row](benchmark.md#when-a-variant-will-not-load) so the Variants that
did run still report their numbers.

## 3. Run each command on the hardware you name

`observe` and `watch` take one Variant with `--variant`; `benchmark` takes the four together
(the four-row run in [the benchmark guide](./benchmark.md)). The Arc iGPU, one Frame:

```bash
uv run observe --image ../docs/fixtures/reference-frame.jpg --variant qwen3-vl-2b-instruct-int4-sym-gpu
```

```
Model      qwen3-vl-2b-instruct-int4-sym-gpu (GPU)
Frame      640x360 jpeg, fit to 640x480, from ..\docs\fixtures\reference-frame.jpg
Providers  0.000 s
Load       3.165 s
Capture    0.014 s
Inference  2.648 s

This is a low-light, slightly blurry, and darkly lit room. The room has a white door, a white
bookshelf, and a white bookshelf. The bookshelf has a white and black book. …
```

**Providers reads `0.000 s`** on any OpenVINO-only run: registering Execution Providers is
Foundry Local's alone, and OpenVINO GenAI is told its Execution Provider rather than registering one
([ADR-0013](../adr/0013-the-second-runtime-is-an-adapter-behind-an-unchanged-model-port.md)).
A Watch on the NPU, and the same on the iGPU, are the same command with the Variant swapped:

```bash
uv run watch --variant qwen3-vl-2b-instruct-int4-sym-npu
uv run watch --variant qwen3-vl-2b-instruct-int4-sym-gpu
```

## The honest caveat

One caveat carries across all three commands. The IR is **INT4-quantised**, and this
2B model degrades under it: the description above runs to the token limit repeating itself,
where Foundry Local's unquantised CPU build stops with a clean paragraph. The second Runtime
buys the accelerator, not accuracy — the Arc iGPU is the throughput winner (see
[the benchmark](./benchmark.md)), the NPU leads only on TTFT, and the quality trade-off is the
INT4 IR's, not the Runtime's.
