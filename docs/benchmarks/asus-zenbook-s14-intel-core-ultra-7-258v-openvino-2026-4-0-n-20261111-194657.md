# Benchmark — ASUS Zenbook S14, Intel Core Ultra 7 258V, OpenVINO 2026.4.0, NPU driver 4512

- **Recorded** — 2026-11-11 19:46:57+01:00
- **Frame** — 640x360 jpeg, fit to 640x480, from C:\Users\jcarnero\dev\local-vision-playground\docs\fixtures\reference-frame.jpg
- **Frame bytes** — sha256 2e8dbaf486957506796f282282a0577a4093495edb837df7fb991dfca70af54f, 43881 bytes
- **Prompt** — Describe what you see in this image in two or three sentences.
- **Limits** — at most 128 tokens, temperature 0.0
- **Providers** — 1.522 s
- **Repetitions** — 5 per Variant — the first reported apart, the median, minimum and maximum taken over the other 4

| Variant | Runtime | Runs on | Turn | Load | First | Median | Min | Max | Tokens | Tokens/second | Loops | Work Cell |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `qwen3-vl-4b-instruct-generic-cpu:3` | Foundry Local | CPU / CPUExecutionProvider | 1st of 3 | 11.602 s | 18.815 s | 18.998 s | 18.345 s | 19.494 s | 78 | 4.1 | 0/5 | 32/32 shaped, 32/32 found |
| `qwen3-vl-4b-instruct-int4-sym-cw-cpu` | OpenVINO GenAI | CPU | 2nd of 3 | 9.310 s | 15.813 s | 6.269 s | 6.260 s | 6.728 s | 95 | 15.2 | 0/5 | 32/32 shaped, 32/32 found |
| `qwen3-vl-4b-instruct-int4-sym-g128-cpu` | OpenVINO GenAI | CPU | 3rd of 3 | 9.061 s | 17.653 s | 8.196 s | 7.253 s | 9.362 s | 96 | 11.8 | 0/5 | 32/32 shaped, 32/32 found |

First is the cold Benchmark Run; Median, Min and Max are the inference seconds over the repetitions after it, and Tokens and Tokens/second are medians over those same repetitions — over the cold one where it is the only one there was. Loops is how many Benchmark Runs repeated themselves (the same run of words, or the same object, three times running); Work Cell is how many of the fixture photos came back in the fixed shape and how many of those listed any object — a dash where that sweep was not asked for. Every Benchmark Run is in the JSON beside this file.

**Not a hardware comparison.** qwen3-vl-4b-instruct-int4-sym-g128-cpu generated 96 tokens against qwen3-vl-4b-instruct-generic-cpu:3's 78 — 23% more, so these Variants did not do the same amount of work and their latencies are not a hardware comparison; Tokens/second is the figure that survives it.

## What each Variant saw

**qwen3-vl-4b-instruct-generic-cpu:3**

> This dimly lit indoor scene shows a large, light-colored wooden bookshelf filled with books and small decorative items on the left. In the center-right, a white door is slightly ajar, leading to another room, while a modern blue patterned office chair is prominently featured in the foreground. A dark-framed picture hangs on the wall above a small table or desk in the background.

**qwen3-vl-4b-instruct-int4-sym-cw-cpu**

> This image shows a well-organized, modern home office or study nook. The main focus is a large, light-wood bookshelf filled with books, decorative items, and small figurines, suggesting a personal and curated space. In the foreground, the back of a contemporary, blue-patterned office chair is visible, with a glimpse of a desk and a large, dark-framed piece of space-themed art on the wall, indicating a functional yet stylish workspace.

**qwen3-vl-4b-instruct-int4-sym-g128-cpu**

> This image captures a cozy, well-lit indoor space, likely a home office or study, featuring a tall, light-colored wooden bookshelf filled with books and various decorative items. In the foreground, the back of a modern ergonomic office chair with a blue patterned mesh is visible, suggesting a workspace. To the right, a white door is slightly ajar, leading into another room, and a large framed picture of a galaxy hangs on the wall above a desk area.
