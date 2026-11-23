# Benchmark — ASUS Zenbook S14, Intel Core Ultra 7 258V, OpenVINO 2026.4.0, NPU driver 4512

- **Recorded** — 2026-11-11 18:20:16+01:00
- **Frame** — 640x360 jpeg, fit to 640x480, from C:\Users\jcarnero\dev\local-vision-playground\docs\fixtures\reference-frame.jpg
- **Frame bytes** — sha256 2e8dbaf486957506796f282282a0577a4093495edb837df7fb991dfca70af54f, 43881 bytes
- **Prompt** — Describe what you see in this image in two or three sentences.
- **Limits** — at most 128 tokens, temperature 0.0
- **Providers** — 1.405 s
- **Repetitions** — 5 per Variant — the first reported apart, the median, minimum and maximum taken over the other 4

| Variant | Runtime | Runs on | Turn | Load | First | Median | Min | Max | Tokens | Tokens/second | Loops | Work Cell |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `qwen3-vl-4b-instruct-generic-cpu:3` | Foundry Local | CPU / CPUExecutionProvider | 1st of 4 | 12.034 s | 14.841 s | 15.388 s | 14.971 s | 16.448 s | 78 | 5.1 | 0/5 | 32/32 shaped, 32/32 found |
| `qwen3-vl-4b-instruct-int4-sym-cw-cpu` | OpenVINO GenAI | CPU | 2nd of 4 | 8.942 s | 19.629 s | 7.175 s | 7.084 s | 7.683 s | 95 | 13.2 | 0/5 | 32/32 shaped, 32/32 found |
| `qwen3-vl-4b-instruct-int4-sym-gpu` | OpenVINO GenAI | GPU | 3rd of 4 | 5.593 s | 3.981 s | 2.978 s | 2.829 s | 3.371 s | 87 | 29.2 | 0/5 | 32/32 shaped, 32/32 found |
| `qwen3-vl-4b-instruct-int4-sym-cw-npu` | OpenVINO GenAI | NPU | 4th of 4 | 6.655 s | 7.119 s | 6.162 s | 6.009 s | 6.256 s | 83 | 13.5 | 0/5 | 32/32 shaped, 32/32 found |

First is the cold Benchmark Run; Median, Min and Max are the inference seconds over the repetitions after it, and Tokens and Tokens/second are medians over those same repetitions — over the cold one where it is the only one there was. Loops is how many Benchmark Runs repeated themselves (the same run of words, or the same object, three times running); Work Cell is how many of the fixture photos came back in the fixed shape and how many of those listed any object — a dash where that sweep was not asked for. Every Benchmark Run is in the JSON beside this file.

**Not a hardware comparison.** qwen3-vl-4b-instruct-int4-sym-cw-cpu generated 95 tokens against qwen3-vl-4b-instruct-generic-cpu:3's 78 — 22% more, so these Variants did not do the same amount of work and their latencies are not a hardware comparison; Tokens/second is the figure that survives it.

## What each Variant saw

**qwen3-vl-4b-instruct-generic-cpu:3**

> This dimly lit indoor scene shows a large, light-colored wooden bookshelf filled with books and small decorative items on the left. In the center-right, a white door is slightly ajar, leading to another room, while a modern blue patterned office chair is prominently featured in the foreground. A dark-framed picture hangs on the wall above a small table or desk in the background.

**qwen3-vl-4b-instruct-int4-sym-cw-cpu**

> This image shows a well-organized, modern home office or study nook. The main focus is a large, light-wood bookshelf filled with books, decorative items, and small figurines, suggesting a personal and curated space. In the foreground, the back of a contemporary, blue-patterned office chair is visible, with a glimpse of a desk and a large, dark-framed piece of space-themed art on the wall, indicating a functional yet stylish workspace.

**qwen3-vl-4b-instruct-int4-sym-gpu**

> This image shows a cozy, well-lit home office or study area. The main focus is a tall, light-wood bookshelf filled with books, decorative items, and small figurines, next to a white door that leads to another room. In the foreground, the back of a modern, patterned office chair is visible, with a large, dark-framed picture of a galaxy hanging on the wall above a desk.

**qwen3-vl-4b-instruct-int4-sym-cw-npu**

> The image shows a well-organized, tall wooden bookshelf filled with books, model cars, and various small decorative items, suggesting a personal or study space. A white door is visible in the background, leading into another room, and a modern, dark-colored office chair is prominently featured in the foreground. The room has a clean, bright aesthetic with a large wall-mounted piece of art above the bookshelf.
