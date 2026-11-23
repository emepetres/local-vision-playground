# Benchmark — ASUS Zenbook S14, Intel Core Ultra 7 258V, OpenVINO 2026.4.0, NPU driver 4512

- **Recorded** — 2026-11-11 19:59:02+01:00
- **Frame** — 640x360 jpeg, fit to 640x480, from C:\Users\jcarnero\dev\local-vision-playground\vision\..\docs\fixtures\work-cell\bare_hand_1.png
- **Frame bytes** — sha256 5b50647a497d93acd3c356dc85c2034b2c48c703211a97cb3ee7e57a517d11a8, 58893 bytes
- **Prompt** — This is a work bench seen from above. The work zone is the green cutting mat. The tray is the white mesh tray beside it. List every distinct object you can see, and where it is: "tray" if it lies in the white tray, "zone" if it lies on the green mat, "hand" if a hand is holding it, "elsewhere" for anything else. Hands are objects too: name each visible hand "bare hand" (skin showing) or "gloved hand". Reply with ONLY a JSON array, where each element is an object {"name": <string>, "count": <integer >= 1>, "where": <one of "tray", "zone", "hand", "elsewhere">}. Example: [{"name": "cup", "count": 1, "where": "zone"}, {"name": "bare hand", "count": 1, "where": "zone"}]. If nothing is there, reply with [].
- **Limits** — at most 256 tokens, temperature 0.0
- **Providers** — 0.000 s
- **Repetitions** — 5 per Variant — the first reported apart, the median, minimum and maximum taken over the other 4

| Variant | Runtime | Runs on | Turn | Load | First | Median | Min | Max | Tokens | Tokens/second | Loops | Work Cell |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `qwen3-vl-4b-instruct-int4-sym-gpu` | OpenVINO GenAI | GPU | 1st of 2 | 7.993 s | 2.113 s | 2.190 s | 2.070 s | 2.417 s | 61 | 27.9 | 0/5 | — |
| `qwen3-vl-4b-instruct-int4-sym-g128-gpu` | OpenVINO GenAI | GPU | 2nd of 2 | 9.335 s | 4.674 s | 4.332 s | 4.226 s | 4.456 s | 126 | 29.1 | 0/5 | — |

First is the cold Benchmark Run; Median, Min and Max are the inference seconds over the repetitions after it, and Tokens and Tokens/second are medians over those same repetitions — over the cold one where it is the only one there was. Loops is how many Benchmark Runs repeated themselves (the same run of words, or the same object, three times running); Work Cell is how many of the fixture photos came back in the fixed shape and how many of those listed any object — a dash where that sweep was not asked for. Every Benchmark Run is in the JSON beside this file.

**Not a hardware comparison.** qwen3-vl-4b-instruct-int4-sym-g128-gpu generated 126 tokens against qwen3-vl-4b-instruct-int4-sym-gpu's 61 — 107% more, so these Variants did not do the same amount of work and their latencies are not a hardware comparison; Tokens/second is the figure that survives it.

## What each Variant saw

**qwen3-vl-4b-instruct-int4-sym-gpu**

- 1 × hand (zone)

**qwen3-vl-4b-instruct-int4-sym-g128-gpu**

- 1 × bare hand (zone)
- 1 × microcontroller (zone)
- 1 × soldering iron (tray)
- 1 × soldering tip (tray)
- 1 × wire (tray)
- 1 × soldering wire (tray)
