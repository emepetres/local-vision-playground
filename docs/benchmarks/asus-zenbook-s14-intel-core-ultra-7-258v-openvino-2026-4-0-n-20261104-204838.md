# Benchmark — ASUS Zenbook S14, Intel Core Ultra 7 258V, OpenVINO 2026.4.0, NPU driver 4512, second pass

- **Recorded** — 2026-11-04 20:48:38+01:00
- **Frame** — 640x360 jpeg, fit to 640x480, from C:\Users\jcarnero\dev\local-vision-playground\docs\fixtures\reference-frame.jpg
- **Frame bytes** — sha256 2e8dbaf486957506796f282282a0577a4093495edb837df7fb991dfca70af54f, 43881 bytes
- **Prompt** — Describe what you see in this image in two or three sentences.
- **Limits** — at most 128 tokens, temperature 0.0
- **Providers** — 0.000 s
- **Repetitions** — 5 per Variant — the first reported apart, the median, minimum and maximum taken over the other 4

| Variant | Runtime | Runs on | Turn | Load | First | Median | Min | Max | Tokens | Tokens/second | Loops | Work Cell |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `qwen3-vl-2b-instruct-int4-sym-gpu` | OpenVINO GenAI | GPU | 1st of 2 | 4.884 s | 3.292 s | 2.644 s | 2.513 s | 2.899 s | 128 | 48.4 | 5/5 | — |
| `qwen3-vl-2b-instruct-int4-sym-npu` | OpenVINO GenAI | NPU | 2nd of 2 | 2.698 s | 6.116 s | 5.632 s | 5.579 s | 5.661 s | 128 | 22.7 | 5/5 | — |

First is the cold Benchmark Run; Median, Min and Max are the inference seconds over the repetitions after it, and Tokens and Tokens/second are medians over those same repetitions — over the cold one where it is the only one there was. Loops is how many Benchmark Runs repeated themselves (the same run of words, or the same object, three times running); Work Cell is how many of the fixture photos came back in the fixed shape and how many of those listed any object — a dash where that sweep was not asked for. Every Benchmark Run is in the JSON beside this file.

**qwen3-vl-2b-instruct-int4-sym-gpu:** 5 of 5 Benchmark Runs hit the 128-token output limit, so the limit decided how much text they generated.

**qwen3-vl-2b-instruct-int4-sym-npu:** 5 of 5 Benchmark Runs hit the 128-token output limit, so the limit decided how much text they generated.

## What each Variant saw

**qwen3-vl-2b-instruct-int4-sym-gpu**

> This is a close-up of a room, with a bookshelf, a white door, and a white door in the background. The bookshelf is filled with books and other objects. A white door is in the center of the room. A white door is in the center of the room. A white door is in the center of the room. A white door is in the center of the room. A white door is in the center of the room. A white door is in the center of the room. A white door is in the center of the room. A white door is in the center of the room. A white door

**qwen3-vl-2b-instruct-int4-sym-npu**

> This image shows a room with a bookshelf, a white door, and a white door. The bookshelf is filled with books and other items. A white door is in the room. A white door is in the room. A white door is in the room. A white door is in the room. A white door is in the room. A white door is in the room. A white door is in the room. A white door is in the room. A white door is in the room. A white door is in the room. A white door is in the room. A white door is in the room. A white
