# Two Runtimes: Foundry Local is not the only source of a model

Foundry Local's catalogue on the demo machine (ASUS Zenbook S14, Intel Core Ultra 7 258V)
publishes no vision build beyond CPU: every `vision-language-chat` alias offers `generic-cpu`
only — no NPU variant, and no GPU variant either. Staying inside Foundry Local therefore means
the vision half of this playground has exactly **one** Execution Provider on the machine where
the demo is shown, which is the one thing the benchmarking half exists to compare. So the
project talks to **two Runtimes**: Foundry Local, and **OpenVINO GenAI** for the rows Foundry
Local cannot serve. This is scope, not defeat — Foundry Local remains the default path for
`observe` and `watch`; the second Runtime exists for the Execution Providers its catalogue
does not reach here.

The trigger was the NPU, but the decision is not about the NPU. On this machine OpenVINO also
reaches the `Intel Arc 140V` iGPU in the same call, and it is faster than the NPU — two of the
four Benchmark rows leave Foundry Local, not one. Writing this down as an NPU decision would be
out of date the day the OV-GPU row is measured. Evidence for all of it is in
[#38](https://github.com/emepetres/local-vision-playground/issues/38): Qwen2.5-VL-3B INT4 on
`Intel(R) AI Boost`, 6.0 s TTFT and 22–25 tok/s against 23.7 s and 8.4 tok/s on the same
weights on CPU.

## Considered Options

- **Wait for Foundry Local to publish an NPU vision variant.** Rejected on the evidence of
  [#37](https://github.com/emepetres/local-vision-playground/issues/37): every NPU variant in
  this catalogue is `openvino-npu` and task `chat-completion`; zero `vision-language-chat`
  models have one. The catalogue is hardware-filtered and moves, so this may change — the map
  keeps it as a fog item, not as a plan.
- **Compile our own vision model *into* Foundry Local**, via Olive plus `inference_model.json`
  and `ModelCacheDir`. Rejected in [#37](https://github.com/emepetres/local-vision-playground/issues/37):
  the path is documented but unwalked — no VLM-on-NPU sample anywhere, `openvino` absent from
  the REST `ep` selector, open unanswered issues, preview product. A demo cannot rest on it.
- **Drop the NPU from the demo** and keep the Execution Provider axis at CUDA-GPU vs CPU, as
  `docs/stack.md` originally concluded. Rejected: the demo machine has no CUDA, so on the
  machine where the demo is actually shown that axis has one usable row.

## Consequences

**The Execution Provider axis is no longer observable from a single Runtime.** A Benchmark is
four rows across two Runtimes — FL-CPU, OV-CPU, OV-GPU, OV-NPU — with the two CPU rows as the
calibration between the Runtimes. That is why `Hardware Profile` now names the Runtime as well
as the machine and the Execution Provider: without it the two CPU rows are indistinguishable.

**A Variant no longer implies a catalogue.** Foundry Local publishes Variants with resolvable
ids; an OpenVINO IR we exported has neither id nor version, and is identified by its
`Provenance` instead — the weights it came from, the recipe it was exported with, and the
Execution Provider it was exported for.

**A one-time conversion step enters the project**, and must stay off the main demo path.

**Where the second Runtime sits behind the model port is not decided here** — see
[#41](https://github.com/emepetres/local-vision-playground/issues/41). This ADR fixes that
there are two Runtimes and what each is for, not the shape of the seam between them.
