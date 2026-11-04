# Benchmark — ASUS Zenbook S14, Intel Core Ultra 7 258V, OpenVINO 2026.3.0, NPU driver 4512

- **Recorded** — 2026-11-04 20:44:07+01:00
- **Frame** — 640x360 jpeg, fit to 640x480, from C:\Users\jcarnero\dev\local-vision-playground\docs\fixtures\reference-frame.jpg
- **Frame bytes** — sha256 2e8dbaf486957506796f282282a0577a4093495edb837df7fb991dfca70af54f, 43881 bytes
- **Prompt** — Describe what you see in this image in two or three sentences.
- **Limits** — at most 128 tokens, temperature 0.0
- **Providers** — 0.483 s
- **Repetitions** — 5 per Variant — the first reported apart, the median, minimum and maximum taken over the other 4

| Variant | Runtime | Runs on | Turn | Load | First | Median | Min | Max | Tokens | Tokens/second | Loops | Work Cell |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `qwen3-vl-2b-instruct-generic-cpu:2` | Foundry Local | CPU / CPUExecutionProvider | 1st of 4 | 6.423 s | 7.780 s | 8.817 s | 7.529 s | 9.613 s | 92 | 10.4 | 0/5 | — |
| `qwen3-vl-2b-instruct-int4-sym-cpu` | OpenVINO GenAI | CPU | 2nd of 4 | 5.478 s | 9.557 s | 4.772 s | 4.687 s | 4.876 s | 128 | 26.8 | 5/5 | — |
| `qwen3-vl-2b-instruct-int4-sym-gpu` | OpenVINO GenAI | GPU | 3rd of 4 | 4.318 s | 2.651 s | 2.339 s | 2.292 s | 2.399 s | 128 | 54.7 | 5/5 | — |
| `qwen3-vl-2b-instruct-int4-sym-npu` | OpenVINO GenAI | NPU | 4th of 4 | 3.753 s | 6.218 s | 5.290 s | 5.258 s | 5.358 s | 128 | 24.2 | 5/5 | — |

First is the cold Benchmark Run; Median, Min and Max are the inference seconds over the repetitions after it, and Tokens and Tokens/second are medians over those same repetitions — over the cold one where it is the only one there was. Loops is how many Benchmark Runs repeated themselves (the same run of words, or the same object, three times running); Work Cell is how many of the fixture photos came back in the fixed shape and how many of those listed any object — a dash where that sweep was not asked for. Every Benchmark Run is in the JSON beside this file.

**qwen3-vl-2b-instruct-int4-sym-cpu:** 5 of 5 Benchmark Runs hit the 128-token output limit, so the limit decided how much text they generated.

**qwen3-vl-2b-instruct-int4-sym-gpu:** 5 of 5 Benchmark Runs hit the 128-token output limit, so the limit decided how much text they generated.

**qwen3-vl-2b-instruct-int4-sym-npu:** 5 of 5 Benchmark Runs hit the 128-token output limit, so the limit decided how much text they generated.

**Not a hardware comparison.** qwen3-vl-2b-instruct-int4-sym-cpu generated 128 tokens against qwen3-vl-2b-instruct-generic-cpu:2's 92 — 39% more, so these Variants did not do the same amount of work and their latencies are not a hardware comparison; Tokens/second is the figure that survives it.

## What each Variant saw

**qwen3-vl-2b-instruct-generic-cpu:2**

> This is a dimly lit room with a tall wooden bookshelf filled with books and various items on the shelves. A blue and gray office chair is in the foreground, partially obscuring the view of the bookshelf. On the wall, there is a large painting of a galaxy. A white door is visible in the background, leading to another room. The room has a few other items, including a small plant and a few books on the bookshelf.

**qwen3-vl-2b-instruct-int4-sym-cpu**

> This is a low-angle, wide shot of a room. A bookshelf is on the left, and a white door is in the center. A white door is in the center. A white door is in the center. A white door is in the center. A white door is in the center. A white door is in the center. A white door is in the center. A white door is in the center. A white door is in the center. A white door is in the center. A white door is in the center. A white door is in the center. A white door is in the center. A white door

**qwen3-vl-2b-instruct-int4-sym-gpu**

> This is a low-light, slightly blurry, and darkly lit room. The room has a white door, a white bookshelf, and a white bookshelf. The bookshelf has a white and black book. The bookshelf is on the left. The white door is in the middle. The white bookshelf is on the left. The white bookshelf is on the left. The white bookshelf is on the left. The white bookshelf is on the left. The white bookshelf is on the left. The white bookshelf is on the left. The white bookshelf is on the left. The white bookshelf is on

**qwen3-vl-2b-instruct-int4-sym-npu**

> This image shows a room with a bookshelf, a white door, and a white door. The bookshelf is filled with books and other items. A white door is in the room. A white door is in the room. A white door is in the room. A white door is in the room. A white door is in the room. A white door is in the room. A white door is in the room. A white door is in the room. A white door is in the room. A white door is in the room. A white door is in the room. A white door is in the room. A white
