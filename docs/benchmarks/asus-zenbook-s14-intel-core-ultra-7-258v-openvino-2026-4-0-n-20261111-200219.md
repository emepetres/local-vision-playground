# Benchmark — ASUS Zenbook S14, Intel Core Ultra 7 258V, OpenVINO 2026.4.0, NPU driver 4512

- **Recorded** — 2026-11-11 20:02:19+01:00
- **Frame** — 640x360 jpeg, fit to 640x480, from C:\Users\jcarnero\dev\local-vision-playground\vision\..\docs\fixtures\work-cell\mixed_1.png
- **Frame bytes** — sha256 4fb5bb003a453d79307f772c4d2c2e5d9905efd1c850cba5b4c537435abd4bb3, 54243 bytes
- **Prompt** — This is a work bench seen from above. The work zone is the green cutting mat. The tray is the white mesh tray beside it. List every distinct object you can see, and where it is: "tray" if it lies in the white tray, "zone" if it lies on the green mat, "hand" if a hand is holding it, "elsewhere" for anything else. Hands are objects too: name each visible hand "bare hand" (skin showing) or "gloved hand". Reply with ONLY a JSON array, where each element is an object {"name": <string>, "count": <integer >= 1>, "where": <one of "tray", "zone", "hand", "elsewhere">}. Example: [{"name": "cup", "count": 1, "where": "zone"}, {"name": "bare hand", "count": 1, "where": "zone"}]. If nothing is there, reply with [].
- **Limits** — at most 256 tokens, temperature 0.0
- **Providers** — 0.000 s
- **Repetitions** — 5 per Variant — the first reported apart, the median, minimum and maximum taken over the other 4

| Variant | Runtime | Runs on | Turn | Load | First | Median | Min | Max | Tokens | Tokens/second | Loops | Work Cell |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `qwen3-vl-4b-instruct-int4-sym-gpu` | OpenVINO GenAI | GPU | 1st of 2 | 2.611 s | 5.323 s | 4.719 s | 4.690 s | 4.865 s | 152 | 32.2 | 0/5 | — |
| `qwen3-vl-4b-instruct-int4-sym-g128-gpu` | OpenVINO GenAI | GPU | 2nd of 2 | 2.656 s | 5.205 s | 4.871 s | 4.742 s | 4.913 s | 147 | 30.2 | 0/5 | — |

First is the cold Benchmark Run; Median, Min and Max are the inference seconds over the repetitions after it, and Tokens and Tokens/second are medians over those same repetitions — over the cold one where it is the only one there was. Loops is how many Benchmark Runs repeated themselves (the same run of words, or the same object, three times running); Work Cell is how many of the fixture photos came back in the fixed shape and how many of those listed any object — a dash where that sweep was not asked for. Every Benchmark Run is in the JSON beside this file.

## What each Variant saw

**qwen3-vl-4b-instruct-int4-sym-gpu**

- 1 × gloved hand (zone)
- 1 × bare hand (zone)
- 1 × soldering iron (tray)
- 1 × solder wire (tray)
- 1 × soldering tool (tray)
- 1 × soldering stand (tray)
- 1 × soldering tip (tray)

**qwen3-vl-4b-instruct-int4-sym-g128-gpu**

- 1 × bare hand (zone)
- 1 × gloved hand (zone)
- 1 × soldering iron (tray)
- 1 × soldering tip (tray)
- 1 × solder wire (tray)
- 1 × wire (tray)
- 1 × circuit board (zone)
