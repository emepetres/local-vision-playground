# `benchmark` — what it costs

The same Workload against several Variants, several times each. The default pair is the
CUDA-GPU Variant and the CPU one — the GPU-versus-CPU answer on a machine that has CUDA. The
demo machine does not: Foundry Local's vision path there is CPU-only
([`docs/stack.md`](../stack.md), Constraint 3), so the Benchmark that matters on it is
**four rows across two Runtimes** — Foundry Local's CPU build, and the same weights on
OpenVINO GenAI's CPU, Arc iGPU and NPU — named explicitly:

```bash
cd vision
uv run benchmark \
  --variant qwen3-vl-2b-instruct-generic-cpu \
  --variant qwen3-vl-2b-instruct-int4-sym-cpu \
  --variant qwen3-vl-2b-instruct-int4-sym-gpu \
  --variant qwen3-vl-2b-instruct-int4-sym-npu \
  --hardware "ASUS Zenbook S14, Intel Core Ultra 7 258V"
```

```
Frame        640x360 jpeg, fit to 640x480, from C:\Users\jcarnero\dev\local-vision-playground\docs\fixtures\reference-frame.jpg
Prompt       Describe what you see in this image in two or three sentences.
Limits       at most 128 tokens, temperature 0.0
Providers    0.206 s
Repetitions  5 per Variant — the first reported apart, the median, minimum and maximum taken over the other 4

Model        qwen3-vl-2b-instruct-generic-cpu:2 (alias qwen3-vl-2b-instruct, CPU / CPUExecutionProvider)
Runtime      Foundry Local
Measured     1st of 4
Load         4.596 s

                  First    Median       Min       Max
Inference       9.589 s   7.972 s   7.801 s   8.321 s
Tokens               92        92        92        92
Tokens/second       9.6      11.5      11.1      11.8

Model        qwen3-vl-2b-instruct-int4-sym-cpu (CPU)
Runtime      OpenVINO GenAI
Measured     2nd of 4
Load         4.551 s

                  First    Median       Min       Max
Inference       9.056 s   4.611 s   4.456 s   4.666 s
Tokens              128       128       128       128
Tokens/second      14.1      27.8      27.4      28.7

(5 of 5 Benchmark Runs hit the 128-token output limit, so the limit decided how much text they generated)

Model        qwen3-vl-2b-instruct-int4-sym-gpu (GPU)
Runtime      OpenVINO GenAI
Measured     3rd of 4
Load         6.188 s

                  First    Median       Min       Max
Inference       2.768 s   2.286 s   2.262 s   2.491 s
Tokens              128       128       128       128
Tokens/second      46.2      56.0      51.4      56.6

(5 of 5 Benchmark Runs hit the 128-token output limit, so the limit decided how much text they generated)

Model        qwen3-vl-2b-instruct-int4-sym-npu (NPU)
Runtime      OpenVINO GenAI
Measured     4th of 4
Load         2.251 s

                  First    Median       Min       Max
Inference       5.765 s   5.885 s   5.577 s   6.133 s
Tokens              128       128       128       128
Tokens/second      22.2      21.8      20.9      23.0

(5 of 5 Benchmark Runs hit the 128-token output limit, so the limit decided how much text they generated)

(qwen3-vl-2b-instruct-int4-sym-cpu generated 128 tokens against qwen3-vl-2b-instruct-generic-cpu:2's 92 — 39% more, so these Variants did not do the same amount of work and their latencies are not a hardware comparison; Tokens/second is the figure that survives it)

Recorded     C:\Users\jcarnero\dev\local-vision-playground\docs\benchmarks\asus-zenbook-s14-intel-core-ultra-7-258v-20260922-090814.json
             C:\Users\jcarnero\dev\local-vision-playground\docs\benchmarks\asus-zenbook-s14-intel-core-ultra-7-258v-20260922-090814.md
```

Taken on the demo machine (ASUS Zenbook S14, Intel Core Ultra 7 258V). Read the **Runtime**
line, not just the hardware: the two CPU rows are the same silicon reached through two
Runtimes — Foundry Local's own build against the INT4 IR on OpenVINO GenAI — and that pair is
the calibration between them, the one comparison a four-row Benchmark most needs to keep
apart. Two things the numbers say plainly, and neither flatters the NPU:

- **The NPU is not the throughput winner.** The Arc iGPU leads at 56 tok/s, the INT4 build
  on the CPU sustains 27.8, and the NPU trails both at 21.8 — a third Execution Provider with
  its own profile, whose case is TTFT and warm-start rather than peak tokens/second (issue
  [#38](https://github.com/emepetres/local-vision-playground/issues/38)), which this
  Benchmark does not measure.
- **This is not a like-for-like comparison.** The three OpenVINO rows run an **INT4** IR,
  Foundry Local's row an unquantised build; the INT4 Variants degrade into repetition and run
  to the 128-token limit (see _What each Variant saw_ in the record), while Foundry Local's
  stops at 92 tokens with a clean description. Different amounts of work, so Tokens/second is
  the figure to read — and the token-divergence note above says so in the report itself.

## The reference Frame

The **Frame is read once** and those exact bytes go to every repetition of every Variant —
that is what makes the whole sitting comparable, and it is why the live camera is refused: a
different Frame each time is not a Workload. `--image <path>` measures a file of your own
instead of the reference Frame; `--debug` behaves as it does for `observe`.

`docs/fixtures/reference-frame.jpg` is the reference Frame — one still taken from the
camera at 1280×720 and put through the same rescale-and-encode every Frame goes through.
It is 640×360, and that is not a mistake: a 16:9 camera fits the 640×480 working
resolution at 640×360, because a Frame is **rescaled on its long edge, never cropped**.
Which is why the report names both numbers.

It does mean the fixture is not interchangeable with a Frame from a 4:3 camera: at 640×360
it carries a quarter fewer pixels, and image tokens scale with area. The working
resolution bounds the workload; it does not by itself fix it. A Benchmark Run therefore
has to hold the Frame size constant as well as the working resolution — which is what
[`CONTEXT.md`](../../CONTEXT.md) already requires of a Hardware Profile comparison — and the
fixture is the right Frame to hold it at.

## Measuring a question

`--ask "<question>"` makes the **Scene Question** part of the Workload, so that what is
measured is the work an Operator actually cares about — a two-word answer and a request for
a paragraph are wildly different amounts of generation:

```bash
uv run benchmark --ask "how many cups are on that desk?"
```

The question travels unchanged to every Benchmark Run of every Variant — one Workload for
the whole sitting, which is what keeps the Variants comparable with each other — and it is
printed on the `Prompt` line above the tables, written into the JSON record and into the
Markdown beside the Frame's hash and the generation limits. Nothing else moves: the limits
are the ones they always were, and an answer that hits the output limit gets the same
truncation note.

**Two Benchmarks taken under different questions are not comparable**, however alike their
hardware — they measured different amounts of generation, which is the whole reason the
flag exists. That is why the question is in both files: a reader months later can see which
question produced which numbers. Leaving `--ask` off measures the prompt it has always
measured, so a new record is still comparable with the ones already in
[`docs/benchmarks/`](../benchmarks/). An empty or whitespace-only `--ask` is refused before
any weights are fetched, exactly as `observe` refuses it.

`--structured` measures the fixed shape instead of prose, and overrides `--ask`. See
[the Structured Observations guide](./structured.md).

## Naming the Variants

**Variants are resolved through the catalogue**, not by a version suffix written into the
source, so the command does not break the day the catalogue publishes a new version — and
the Model line names the exact Variant id that was resolved, so the numbers say which build
produced them. `--variant` takes an alias (`qwen3-vl-2b-instruct`), a variant name whose
version the catalogue picks (`qwen3-vl-2b-instruct-generic-cpu`), or a variant id, which
pins the version too (`…-generic-cpu:2`). Repeating it measures several, and **any use of it
replaces the default pair entirely** — which is what lets two model sizes be compared on
fixed hardware, or an NPU Variant added later, without changing code:

```bash
uv run benchmark --variant qwen3-vl-2b-instruct-generic-cpu --variant qwen3-vl-4b-instruct-generic-cpu
```

Each Variant is **unloaded before the next is loaded** — two loaded models compete for the
same device, and a Benchmark that left the first one resident would be measuring the second
under conditions it cannot report. **Measured** records which turn each one took, so a
result you suspect was contaminated by the previously loaded model can be checked by naming
the Variants the other way round.

## How to read the tables

**Providers** sits above every table because registering the Execution Providers is machine
set-up paid once per process, not the price of an Execution Provider. **Load** sits above
its own table for the other reason: it is paid once per Variant, so a per-run column would
invite it to be read as one. Every table is laid out to the same column widths, so the GPU's
median sits directly above the CPU's.

The **first repetition gets its own column** rather than being dropped — a cold model is
the honest number — and the median, minimum and maximum are taken over the repetitions
_after_ it, so the summary describes the steady state. No mean and no standard deviation: a
handful of samples does not support them. **Tokens/second** sits next to the latency so
that a Variant which generated twice as much text is not credited with being twice as slow.
`--repetitions N` takes more or fewer than the default five.

Two Variants including a CPU one takes minutes, so each gets a **progress bar** while it
runs, carrying the last latency and the running median so the numbers are visibly moving
while an audience waits. The median on the bar is the one the table is about to print —
over the repetitions after the first — because a bar quoting a different median would be
worse than no bar. It takes itself off when the output is not a terminal, exactly as the
download bar does, so output captured in a pipe or in CI is just the report above.

## When a Variant will not load

A **Variant that will not go onto the hardware is a row, not a crash** — the Benchmark
carries on to the next one, so the other Variant's numbers still survive:

```
Model        qwen3.5-0.8b-cuda-gpu:3 (alias qwen3.5-0.8b, GPU / CUDAExecutionProvider)
Attempted    1st of 2
Not measured qwen3.5-0.8b-cuda-gpu:3 would not load on GPU / CUDAExecutionProvider — pin a different variant with --variant (run `foundry model list`; a -generic-cpu variant is the safe one). Foundry Local said: …
```

That is not hypothetical: `qwen3.5-0.8b-cuda-gpu:3` is published and fails to load with an
invalid-graph error no caller can work around
([foundry-local#1075](https://github.com/microsoft/foundry-local/issues/1075)). It says
`Attempted` rather than `Measured` because the turn is still worth recording while the row
is not a measurement. **The exit status follows the Benchmark, not the Variants**: zero when
at least one Variant was measured, non-zero only when none was — a partial result reported
to the shell as a failure is a script that bins the numbers that did survive. See
[ADR-0007](../adr/0007-a-variant-that-will-not-load-is-a-row.md).

Weights that never arrive are a row on the same terms — a fetch that fails is a load that
fails seen a moment earlier, and `--variant` is the lever either way. So is a **name no
Runtime claims**: a typo, or an OpenVINO provenance slug whose IR is not on this machine.
That is the verdict a Variant that will not load gives, arriving one step earlier, and a
four-row Benchmark should not lose the three rows that did run over one stale slug — the row
carries the same one-line refusal, naming both ways to name a Variant. But only _getting the
Variant onto the hardware_ fails this softly: a Benchmark Run that fails once the model is
loaded still ends the Benchmark, because that is a fault in this code rather than a verdict
on the catalogue, and it gets a traceback.

A model whose task is not `vision-language-chat` is **refused before anything is
downloaded** — a Benchmark aimed at a text-only sibling fails in seconds rather than after
fetching gigabytes.

## When the comparison is not a comparison

Two Variants that generated materially different amounts of text were not doing the same
amount of work, and a table of seconds looks like a hardware result whether or not it is
one. More than **ten percent apart on completion tokens** and the Benchmark says so:

```
(qwen3-vl-2b-instruct-generic-cpu:2 generated 104 tokens against qwen3-vl-2b-instruct-cuda-gpu:2's 88 — 18% more, so these Variants did not do the same amount of work and their latencies are not a hardware comparison; Tokens/second is the figure that survives it)
```

Ten percent is deliberately loose: a decoder is not deterministic across Execution
Providers, so a few tokens either way is the normal state of affairs — the 96-against-104 in
the report above is inside it — and a warning on every Benchmark is a warning nobody reads.
The divergence is carried on the Benchmark rather than only printed, so it travels into the
persisted record instead of living in a terminal that has since scrolled.

## What a Benchmark leaves behind

A Benchmark that measured something is written to **[`docs/benchmarks/`](../benchmarks/)** as
two files, in one call and from the same value: a **JSON record** and a **Markdown document**.
The numbers are then in git — they can be shown when the live demo fails, cited in a talk, and
compared against the same Benchmark taken on another machine later. See
[ADR-0008](../adr/0008-a-benchmark-is-two-files-written-together.md).

```bash
uv run benchmark --hardware "ASUS Zenbook S14, Intel Core Ultra 7 258V"
```

`--hardware` is how the **Hardware Profile** is declared, in words. A reader six months from
now needs "ASUS Zenbook S14, Intel Core Ultra 7 258V"; a hostname means nothing to them. Leave it off and it
falls back to what the standard library reports about the machine — host, platform,
architecture, CPU count — so a Benchmark is never anonymous. Nothing probes the hardware:
there is no portable way to ask a machine what GPU it has.

The file name is a slug of that Hardware Profile plus a full timestamp
(`asus-zenbook-s14-intel-core-ultra-7-258v-20260922-090814.json`), so two machines' records never collide, and
three Benchmarks taken while tuning the demo on the same afternoon are three pairs of files
rather than one overwritten twice.

The **JSON is the record**: a schema version, the instant, the Hardware Profile, the Workload
— including the SHA-256 of the Frame's bytes, so that "the same Workload" is a claim a reader
can check rather than one they take on trust — the repetition count, the registration cost,
and per Variant the resolved id, the alias, the Execution Provider and device type, whether
it loaded and why not, the load time, **every** Benchmark Run's seconds and completion
tokens, and one Observation. That last one is what lets an Operator answer whether the CPU
said the same thing as the GPU — the more interesting half of the comparison once the latency
gap turns out to be eightfold.

The **Markdown is the same Benchmark as one comparison table**, with the Observations under
it and the token-divergence warning in it as well as in the terminal — the caveat travels
with the number to whoever reads the file months later. Reading a record back, and
cross-machine comparison tables, are deliberately not built here; the schema version is what
keeps that door open.

A Benchmark in which nothing at all could be measured is not written down: a Benchmark of
only Unmeasured Variants has nothing to report, and a file with no numbers in it would sit
beside the ones you compare machines with. Its reasons are printed to the terminal, where
they are the whole answer.
