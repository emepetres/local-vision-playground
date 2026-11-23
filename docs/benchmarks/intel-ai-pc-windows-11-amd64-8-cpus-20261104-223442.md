# Benchmark — Intel-AI-PC, Windows 11, AMD64, 8 CPUs

- **Recorded** — 2026-11-04 22:34:42+01:00
- **Frame** — 640x360 jpeg, fit to 640x480, from C:\Users\jcarnero\dev\local-vision-playground\docs\fixtures\reference-frame.jpg
- **Frame bytes** — sha256 2e8dbaf486957506796f282282a0577a4093495edb837df7fb991dfca70af54f, 43881 bytes
- **Prompt** — Describe what you see in this image in two or three sentences.
- **Limits** — at most 128 tokens, temperature 0.0
- **Providers** — 0.000 s
- **Repetitions** — 5 per Variant — the first reported apart, the median, minimum and maximum taken over the other 4

| Variant | Runtime | Runs on | Turn | Load | First | Median | Min | Max | Tokens | Tokens/second | Loops | Work Cell |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `qwen3-vl-4b-instruct-int4-sym-cw-npu` | OpenVINO GenAI | NPU | 1st of 3 | 53.743 s | 7.347 s | 6.104 s | 5.966 s | 6.247 s | 83 | 13.6 | 0/5 | 32/32 shaped, 32/32 found |
| `qwen3-vl-4b-instruct-int4-sym-g128-npu` | OpenVINO GenAI | NPU | 2nd of 3 | 135.475 s | 8.149 s | 8.348 s | 8.173 s | 8.548 s | 100 | 12.0 | 0/5 | 32/32 shaped, 32/32 found |
| `intel-qwen3-vl-4b-instruct-int4-sym-g128-npu` | OpenVINO GenAI | NPU | 3rd of 3 | 6.840 s | 9.842 s | 8.616 s | 8.568 s | 8.742 s | 100 | 11.6 | 0/5 | 32/32 shaped, 32/32 found |

First is the cold Benchmark Run; Median, Min and Max are the inference seconds over the repetitions after it, and Tokens and Tokens/second are medians over those same repetitions — over the cold one where it is the only one there was. Loops is how many Benchmark Runs repeated themselves (the same run of words, or the same object, three times running); Work Cell is how many of the fixture photos came back in the fixed shape and how many of those listed any object — a dash where that sweep was not asked for. Every Benchmark Run is in the JSON beside this file.

**Not a hardware comparison.** qwen3-vl-4b-instruct-int4-sym-g128-npu generated 100 tokens against qwen3-vl-4b-instruct-int4-sym-cw-npu's 83 — 20% more, so these Variants did not do the same amount of work and their latencies are not a hardware comparison; Tokens/second is the figure that survives it.

## What each Variant saw

**qwen3-vl-4b-instruct-int4-sym-cw-npu**

> The image shows a well-organized, tall wooden bookshelf filled with books, model cars, and various small decorative items, suggesting a personal or study space. A white door is visible in the background, leading into another room, and a modern, dark-colored office chair is prominently featured in the foreground. The room has a clean, bright aesthetic with a large wall-mounted piece of art above the bookshelf.

**qwen3-vl-4b-instruct-int4-sym-g128-npu**

> This image captures a cozy, well-lit home office or study corner. On the left, a tall, light-colored wooden bookshelf is filled with books, small figurines, and decorative items, while a modern ergonomic office chair with a blue mesh back is prominently featured in the foreground. To the right, a white door is slightly ajar, revealing a glimpse of another room, and a large, dark-framed painting of a galaxy hangs on the wall above a small desk or table.

**intel-qwen3-vl-4b-instruct-int4-sym-g128-npu**

> This image captures a cozy, well-lit home office or study corner. On the left, a tall, light-colored wooden bookshelf is filled with books, small figurines, and decorative items, while a modern ergonomic office chair with a blue mesh back is prominently featured in the foreground. To the right, a white door is slightly ajar, revealing a glimpse of another room, and a large, dark-framed painting of a galaxy hangs on the wall above a small desk or table.
