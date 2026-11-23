# Benchmark — ASUS Zenbook S14, Intel Core Ultra 7 258V, OpenVINO 2026.4.0, NPU driver 4512

- **Recorded** — 2026-11-11 20:01:23+01:00
- **Frame** — 640x360 jpeg, fit to 640x480, from C:\Users\jcarnero\dev\local-vision-playground\vision\..\docs\fixtures\work-cell\two-gloves_1.png
- **Frame bytes** — sha256 2798fdac8c207efa82950058c3728a3b0c73065b5b31b609a860c22aa516fd71, 58388 bytes
- **Prompt** — This is a work bench seen from above. The work zone is the green cutting mat. The tray is the white mesh tray beside it. List every distinct object you can see, and where it is: "tray" if it lies in the white tray, "zone" if it lies on the green mat, "hand" if a hand is holding it, "elsewhere" for anything else. Hands are objects too: name each visible hand "bare hand" (skin showing) or "gloved hand". Reply with ONLY a JSON array, where each element is an object {"name": <string>, "count": <integer >= 1>, "where": <one of "tray", "zone", "hand", "elsewhere">}. Example: [{"name": "cup", "count": 1, "where": "zone"}, {"name": "bare hand", "count": 1, "where": "zone"}]. If nothing is there, reply with [].
- **Limits** — at most 256 tokens, temperature 0.0
- **Providers** — 0.000 s
- **Repetitions** — 5 per Variant — the first reported apart, the median, minimum and maximum taken over the other 4

| Variant | Runtime | Runs on | Turn | Load | First | Median | Min | Max | Tokens | Tokens/second | Loops | Work Cell |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `qwen3-vl-4b-instruct-int4-sym-gpu` | OpenVINO GenAI | GPU | 1st of 2 | 2.561 s | 2.657 s | 2.264 s | 2.147 s | 2.493 s | 67 | 29.6 | 0/5 | — |
| `qwen3-vl-4b-instruct-int4-sym-g128-gpu` | OpenVINO GenAI | GPU | 2nd of 2 | 2.310 s | 3.867 s | 4.633 s | 4.524 s | 4.760 s | 136 | 29.4 | 0/5 | — |

First is the cold Benchmark Run; Median, Min and Max are the inference seconds over the repetitions after it, and Tokens and Tokens/second are medians over those same repetitions — over the cold one where it is the only one there was. Loops is how many Benchmark Runs repeated themselves (the same run of words, or the same object, three times running); Work Cell is how many of the fixture photos came back in the fixed shape and how many of those listed any object — a dash where that sweep was not asked for. Every Benchmark Run is in the JSON beside this file.

**Not a hardware comparison.** qwen3-vl-4b-instruct-int4-sym-g128-gpu generated 136 tokens against qwen3-vl-4b-instruct-int4-sym-gpu's 67 — 103% more, so these Variants did not do the same amount of work and their latencies are not a hardware comparison; Tokens/second is the figure that survives it.

## What each Variant saw

**qwen3-vl-4b-instruct-int4-sym-gpu**

- 2 × gloved hand (zone)
- 1 × soldering iron (elsewhere)
- 1 × solder wire (elsewhere)

**qwen3-vl-4b-instruct-int4-sym-g128-gpu**

- 2 × gloved hand (zone)
- 1 × soldering iron (tray)
- 1 × wire spool (tray)
- 1 × wire (tray)
- 1 × microcontroller (zone)
