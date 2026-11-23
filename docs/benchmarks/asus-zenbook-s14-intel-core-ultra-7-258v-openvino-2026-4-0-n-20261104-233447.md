# Benchmark — ASUS Zenbook S14, Intel Core Ultra 7 258V, OpenVINO 2026.4.0, NPU driver 4512

- **Recorded** — 2026-11-04 23:34:47+01:00
- **Frame** — 640x360 jpeg, fit to 640x480, from C:\Users\jcarnero\dev\local-vision-playground\docs\fixtures\reference-frame.jpg
- **Frame bytes** — sha256 2e8dbaf486957506796f282282a0577a4093495edb837df7fb991dfca70af54f, 43881 bytes
- **Prompt** — Describe what you see in this image in two or three sentences.
- **Limits** — at most 128 tokens, temperature 0.0
- **Providers** — 0.000 s
- **Repetitions** — 5 per Variant — the first reported apart, the median, minimum and maximum taken over the other 4

| Variant | Runtime | Runs on | Turn | Load | First | Median | Min | Max | Tokens | Tokens/second | Loops | Work Cell |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `qwen3-vl-4b-instruct-int4-sym-cw-npu` | OpenVINO GenAI | NPU | 1st of 4 | 4.672 s | 6.239 s | 5.715 s | 5.668 s | 5.804 s | 83 | 14.5 | 0/5 | 32/32 shaped, 32/32 found |
| `qwen3-vl-4b-instruct-int4-sym-g128-npu` | OpenVINO GenAI | NPU | 2nd of 4 | 4.615 s | 9.739 s | 9.002 s | 8.888 s | 9.023 s | 100 | 11.1 | 0/5 | 32/32 shaped, 32/32 found |
| `intel-qwen3-vl-4b-instruct-int4-sym-g128-npu` | OpenVINO GenAI | NPU | 3rd of 4 | 4.008 s | 9.528 s | 8.990 s | 8.940 s | 10.228 s | 100 | 11.1 | 0/5 | 32/32 shaped, 32/32 found |
| `qwen3-vl-4b-instruct-int4-sym-gpu` | OpenVINO GenAI | GPU | 4th of 4 | 16.953 s | 3.930 s | 3.458 s | 3.274 s | 3.719 s | 87 | 25.2 | 0/5 | 32/32 shaped, 32/32 found |

First is the cold Benchmark Run; Median, Min and Max are the inference seconds over the repetitions after it, and Tokens and Tokens/second are medians over those same repetitions — over the cold one where it is the only one there was. Loops is how many Benchmark Runs repeated themselves (the same run of words, or the same object, three times running); Work Cell is how many of the fixture photos came back in the fixed shape and how many of those listed any object — a dash where that sweep was not asked for. Every Benchmark Run is in the JSON beside this file.

**Not a hardware comparison.** qwen3-vl-4b-instruct-int4-sym-g128-npu generated 100 tokens against qwen3-vl-4b-instruct-int4-sym-cw-npu's 83 — 20% more, so these Variants did not do the same amount of work and their latencies are not a hardware comparison; Tokens/second is the figure that survives it.

## What each Variant saw

**qwen3-vl-4b-instruct-int4-sym-cw-npu**

> The image shows a well-organized, tall wooden bookshelf filled with books, model cars, and various small decorative items, suggesting a personal or study space. A white door is visible in the background, leading into another room, and a modern, dark-colored office chair is prominently featured in the foreground. The room has a clean, bright aesthetic with a large wall-mounted piece of art above the bookshelf.

**qwen3-vl-4b-instruct-int4-sym-g128-npu**

> This image captures a cozy, well-lit home office or study corner. On the left, a tall, light-colored wooden bookshelf is filled with books, small figurines, and decorative items, while a modern ergonomic office chair with a blue mesh back is prominently featured in the foreground. To the right, a white door is slightly ajar, revealing a glimpse of another room, and a large, dark-framed painting of a galaxy hangs on the wall above a small desk or table.

**intel-qwen3-vl-4b-instruct-int4-sym-g128-npu**

> This image captures a cozy, well-lit home office or study corner. On the left, a tall, light-colored wooden bookshelf is filled with books, small figurines, and decorative items, while a modern ergonomic office chair with a blue mesh back is prominently featured in the foreground. To the right, a white door is slightly ajar, revealing a glimpse of another room, and a large, dark-framed painting of a galaxy hangs on the wall above a small desk or table.

**qwen3-vl-4b-instruct-int4-sym-gpu**

> This image shows a cozy, well-lit home office or study area. The main focus is a tall, light-wood bookshelf filled with books, decorative items, and small figurines, next to a white door that leads to another room. In the foreground, the back of a modern, patterned office chair is visible, with a large, dark-framed picture of a galaxy hanging on the wall above a desk.
