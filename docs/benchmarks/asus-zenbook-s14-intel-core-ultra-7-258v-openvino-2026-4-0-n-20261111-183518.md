# Benchmark — ASUS Zenbook S14, Intel Core Ultra 7 258V, OpenVINO 2026.4.0, NPU driver 4512

- **Recorded** — 2026-11-11 18:35:18+01:00
- **Frame** — 640x360 jpeg, fit to 640x480, from C:\Users\jcarnero\dev\local-vision-playground\docs\fixtures\reference-frame.jpg
- **Frame bytes** — sha256 2e8dbaf486957506796f282282a0577a4093495edb837df7fb991dfca70af54f, 43881 bytes
- **Prompt** — This is a work bench seen from above. The work zone is the green cutting mat. The tray is the white mesh tray beside it. List every distinct object you can see, and where it is: "tray" if it lies in the white tray, "zone" if it lies on the green mat, "hand" if a hand is holding it, "elsewhere" for anything else. Hands are objects too: name each visible hand "bare hand" (skin showing) or "gloved hand". Reply with ONLY a JSON array, where each element is an object {"name": <string>, "count": <integer >= 1>, "where": <one of "tray", "zone", "hand", "elsewhere">}. Example: [{"name": "cup", "count": 1, "where": "zone"}, {"name": "bare hand", "count": 1, "where": "zone"}]. If nothing is there, reply with [].
- **Limits** — at most 256 tokens, temperature 0.0
- **Providers** — 0.468 s
- **Repetitions** — 5 per Variant — the first reported apart, the median, minimum and maximum taken over the other 4

| Variant | Runtime | Runs on | Turn | Load | First | Median | Min | Max | Tokens | Tokens/second | Loops | Work Cell |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `qwen3-vl-4b-instruct-generic-cpu:3` | Foundry Local | CPU / CPUExecutionProvider | 1st of 4 | 12.261 s | 18.120 s | 19.173 s | 19.035 s | 19.741 s | 1 | 0.1 | 0/5 | — |
| `qwen3-vl-4b-instruct-int4-sym-cw-cpu` | OpenVINO GenAI | CPU | 2nd of 4 | 8.057 s | 15.035 s | 1.867 s | 1.813 s | 1.935 s | 2 | 1.1 | 0/5 | — |
| `qwen3-vl-4b-instruct-int4-sym-gpu` | OpenVINO GenAI | GPU | 3rd of 4 | 4.524 s | 1.035 s | 0.929 s | 0.864 s | 0.946 s | 23 | 24.8 | 0/5 | — |
| `qwen3-vl-4b-instruct-int4-sym-cw-npu` | OpenVINO GenAI | NPU | 4th of 4 | 7.089 s | 4.693 s | 2.880 s | 2.803 s | 3.224 s | 2 | 0.7 | 0/5 | — |

First is the cold Benchmark Run; Median, Min and Max are the inference seconds over the repetitions after it, and Tokens and Tokens/second are medians over those same repetitions — over the cold one where it is the only one there was. Loops is how many Benchmark Runs repeated themselves (the same run of words, or the same object, three times running); Work Cell is how many of the fixture photos came back in the fixed shape and how many of those listed any object — a dash where that sweep was not asked for. Every Benchmark Run is in the JSON beside this file.

**Not a hardware comparison.** qwen3-vl-4b-instruct-int4-sym-gpu generated 23 tokens against qwen3-vl-4b-instruct-generic-cpu:3's 1 — 2200% more, so these Variants did not do the same amount of work and their latencies are not a hardware comparison; Tokens/second is the figure that survives it.

## What each Variant saw

**qwen3-vl-4b-instruct-generic-cpu:3**

_Nothing present._

**qwen3-vl-4b-instruct-int4-sym-cw-cpu**

_Nothing present._

**qwen3-vl-4b-instruct-int4-sym-gpu**

_Nothing present._

**qwen3-vl-4b-instruct-int4-sym-cw-npu**

_Nothing present._
