# The conversion step

`observe`, `watch` and `benchmark` reach the NPU and the Intel Arc iGPU through an OpenVINO
IR — a converted copy of the model's weights. Foundry Local's catalogue on the demo machine
publishes no vision build beyond CPU ([ADR-0012](../../../docs/adr/0012-two-runtimes-foundry-local-is-not-the-only-source.md)),
so we export one ourselves, **once**. This is that step: reproducible, off the main demo
path, and honest about what an Operator needs to walk it.

## The invariant — off the demo path

The conversion toolchain never enters the demo path. It lives in an **opt-in `convert`
dependency group** in [`../../pyproject.toml`](../../pyproject.toml):

- Its pins (`optimum-intel`, `nncf`, `openvino`, `transformers>=4.57,<5.0`, …) are recorded
  in `uv.lock`, so the export is reproducible — but a plain `uv sync` **never installs
  them**. Only `uv sync --group convert` does.
- Nothing in `observe` / `watch` / `benchmark` imports any of it. `convert.py` itself imports
  **only the standard library** and reaches the export tools by shelling out to `optimum-cli`
  in the same interpreter — so an Operator who only runs the demo installs none of this, and
  the unit tests import the module without pulling the toolchain in. `adopt.py` keeps the same
  promise: its only non-standard import, `huggingface_hub`, is loaded inside the download
  function, so `--from` adoption needs no `convert` group either.

## Run it

From the `vision/` project directory:

```
uv sync --group convert                                      # once, to install the toolchain
uv run --group convert tools/convert/convert.py              # Qwen3-VL-2B-Instruct, INT4-sym, NPU
uv run --group convert tools/convert/convert.py --recipe int4-sym-g128   # same weights, group-wise Recipe
uv run --group convert tools/convert/convert.py --dry-run    # print the plan + check the NPU driver
uv run --group convert tools/convert/convert.py --help
```

`--ep {NPU,GPU,CPU}` names the Execution Provider the IR is built *for* — it fixes the
[Provenance](../../../CONTEXT.md) slug, not the export itself: the one INT4-symmetric IR serves
all three OpenVINO Benchmark rows. `--recipe NAME` picks the [Recipe](../../../CONTEXT.md) — how the
weights are compressed — and defaults to `int4-sym-cw` (INT4, symmetric, channel-wise), the one
#40 verified; `int4-sym-g128` is the same weights group-wise. The Recipe is named in full in the
slug, so two Recipes of the same weights land side by side as two Variants. `--out` overrides
where it lands; `--force` overwrites an
existing IR directory.

## Where the IR lands

The IR lands **outside the repo** (it is ~1.7 GB): by default under
`%LOCALAPPDATA%\local-vision-playground\ir\<slug>`, overridable with `$LVP_IR_CACHE`. This is
the same location the second Runtime reads from ([ADR-0013](../../../docs/adr/0013-the-second-runtime-is-an-adapter-behind-an-unchanged-model-port.md))
— the convention is shared, not the conversion step's private choice.

The `<slug>` is derived from the model's Provenance — e.g. `qwen3-vl-2b-instruct-int4-sym-cw-npu`
— and a `provenance.json` is written beside the IR bytes. An IR we exported has no catalogue
id or version, so it is identified by that manifest instead:

```json
{
  "weights": "Qwen/Qwen3-VL-2B-Instruct",
  "recipe": {
    "name": "int4-sym-cw",
    "weight_format": "int4",
    "sym": true,
    "group_size": -1,
    "ratio": 1.0,
    "tool": "optimum-cli export openvino",
    "args": ["--weight-format", "int4", "--sym", "--ratio=1.0", "--group-size=-1"],
    "toolchain": { "openvino": "2026.4.0", "optimum-intel": "2.1.0", "nncf": "3.3.0", "transformers": "4.57.6", "…": "…" }
  },
  "execution_provider": "NPU",
  "slug": "qwen3-vl-2b-instruct-int4-sym-cw-npu",
  "created": "2026-09-21T…Z"
}
```

The router reads a Variant's identity from this manifest, never from the path it was found at;
the persisted Benchmark record reads through the router. The `toolchain` versions are the ones
that actually produced the IR, read from the environment the export ran in — so the recipe is
reproducible from the manifest alone, months later.

## The Recipe

An IR exported before the Recipe was named in the slug is called `...-int4-sym-<ep>`. That
name still runs: it is an alias for the channel-wise `...-int4-sym-cw-<ep>` (and an IR still
on disk under the old name is found first), so existing commands keep working.

The default Recipe, `int4-sym-cw`, is
`optimum-cli export openvino --weight-format int4 --sym --ratio=1.0 --group-size=-1`, verified
on the demo machine in
[#40](https://github.com/emepetres/local-vision-playground/issues/40): this exact export of
Qwen3-VL-2B-Instruct yields a ~1.7 GB IR that runs first-try on the NPU — **if** `transformers`
is held `>=4.57,<5.0`. That window matters twice over: 4.57 carries native `qwen3_vl`, so no
`--trust-remote-code` is needed, and optimum-intel 2.1.0 rejects 5.x. Because the four Benchmark
rows stand on one model, the args are recorded verbatim in every `provenance.json`: change one
and the first-try result is no longer the one #40 proved.

## Adopting an IR somebody else published

`adopt.py` is the other way in: Intel publishes a Qwen3-VL IR, and a Variant is identified by its
Provenance, so adopting it means writing that Provenance by hand. From `vision/`:

```
uv run --group convert python -m tools.convert.adopt                       # download Intel's 4B gq-ov, write its manifest
uv run python -m tools.convert.adopt --from DIR --revision SHA             # an IR already on disk, adopted in place
```

The manifest says `origin: third-party` and records the repository, the revision, the Recipe the
card states and the OpenVINO version and NPU driver the card requires; the slug carries the
publisher (`intel-qwen3-vl-4b-instruct-int4-sym-g128-npu`). The Recipe is checked against the
repository's `openvino_config.json` and the adoption is refused if they disagree. The IR lands in
the same cache as one we exported, and `observe`, `watch` and `benchmark` take the slug as a
`--variant`.

## Prerequisites an Operator needs

| | |
|---|---|
| **Export machine** | Any x86-64 with Python 3.12 and [uv](https://docs.astral.sh/uv/). The export is CPU-bound — **it does not need an NPU**, so it can run on the dev machine. |
| **Smoke-run machine** | The **demo machine** (ASUS Zenbook S14, Intel Core Ultra 7 258V). The IR is only proven when it generates on `Intel(R) AI Boost` — that run is this step's acceptance, not hygiene. |
| **NPU driver** | `>= 32.0.100.4023`, the floor Intel's model cards state for these IRs (the GenAI NPU guide only says "latest"). Needed only for the smoke run. `--dry-run` checks it. |
| **Disk** | ~1.7 GB IR output + ~5 GB transient Hugging Face weights cache + a multi-GB `convert` venv. Budget ~15 GB free. |
| **RAM** | Export traces the full-precision model — ~8–10 GB peak. 16 GB recommended. |
| **Network** | First run downloads the weights from Hugging Face; later runs reuse the HF cache. |

## The trap this defends against

The demo machine carries a system-wide **OpenVINO 2025.3.0 archive install** whose `setupvars`
are permanent in the environment (`PYTHONPATH`, `INTEL_OPENVINO_DIR`, `OpenVINO_DIR`, and three
`PATH` entries). It shadows any installed `openvino` and makes `openvino_genai` fail with a DLL
load error ([#38](https://github.com/emepetres/local-vision-playground/issues/38)). The export
runs in a **child process** — that child is the one that imports OpenVINO — and `convert.py`
hands it a scrubbed environment with the archive removed, so the Operator does not have to.
(The tool itself imports no OpenVINO, so it needs no scrub; re-execing the whole process was
tried and rejected — `os.execve` segfaults under `uv run` on the demo machine.)

## Smoke run (acceptance)

On the demo machine, point the OpenVINO runtime at the IR and confirm it generates on the NPU.
The one-file reproduction from #38 / #40 is the reference — `VLMPipeline(ir_dir, "NPU",
MAX_PROMPT_LEN=2048, MIN_RESPONSE_LEN=128)` over `docs/fixtures/reference-frame.jpg`. The same
INT4-sym IR also serves the OV-CPU and OV-GPU Benchmark rows; only FL-CPU comes from elsewhere.
Produce an IR for each target Execution Provider (NPU, iGPU, CPU) to complete the acceptance.

## Measuring what a Variant costs the machine

`uv run python -m tools.measure.memory SLUG` loads one Variant in a fresh process and prints load
time and host RAM (before, after load, after one generation, peak), through the same Runtime
`observe` uses. `--cold` clears the IR's `ov-cache` first.
Figures for the 4B: [the note for #81](../../../docs/research/2026-11-04-our-own-qwen3-vl-4b-in-two-recipes.md).
