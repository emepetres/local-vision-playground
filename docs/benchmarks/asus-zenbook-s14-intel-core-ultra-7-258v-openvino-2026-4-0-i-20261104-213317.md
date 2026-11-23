# Benchmark — ASUS Zenbook S14, Intel Core Ultra 7 258V, OpenVINO 2026.4.0, Intel gq-ov artifact

- **Recorded** — 2026-11-04 21:33:17+01:00
- **Frame** — 640x360 jpeg, fit to 640x480, from C:\Users\jcarnero\dev\local-vision-playground\docs\fixtures\reference-frame.jpg
- **Frame bytes** — sha256 2e8dbaf486957506796f282282a0577a4093495edb837df7fb991dfca70af54f, 43881 bytes
- **Prompt** — Describe what you see in this image in two or three sentences.
- **Limits** — at most 128 tokens, temperature 0.0
- **Providers** — 0.000 s
- **Repetitions** — 5 — the first reported apart, the median, minimum and maximum taken over the other 4

| Variant | Runtime | Runs on | Turn | Load | First | Median | Min | Max | Tokens | Tokens/second | Loops | Work Cell |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `intel-qwen3-vl-4b-instruct-int4-sym-g128-npu` | OpenVINO GenAI | NPU | 1st of 1 | 5.104 s | 10.278 s | 9.456 s | 9.372 s | 9.497 s | 100 | 10.6 | 0/5 | 32/32 shaped, 32/32 found |

First is the cold Benchmark Run; Median, Min and Max are the inference seconds over the repetitions after it, and Tokens and Tokens/second are medians over those same repetitions — over the cold one where it is the only one there was. Loops is how many Benchmark Runs repeated themselves (the same run of words, or the same object, three times running); Work Cell is how many of the fixture photos came back in the fixed shape and how many of those listed any object — a dash where that sweep was not asked for. Every Benchmark Run is in the JSON beside this file.

## What each Variant saw

**intel-qwen3-vl-4b-instruct-int4-sym-g128-npu**

> This image captures a cozy, well-lit home office or study corner. On the left, a tall, light-colored wooden bookshelf is filled with books, small figurines, and decorative items, while a modern ergonomic office chair with a blue mesh back is prominently featured in the foreground. To the right, a white door is slightly ajar, revealing a glimpse of another room, and a large, dark-framed painting of a galaxy hangs on the wall above a small desk or table.
