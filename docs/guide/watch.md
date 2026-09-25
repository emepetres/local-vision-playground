# `watch` — a continuous series of Observations

The same question asked of the room over and over, at a **Cadence**, for as long as the
Operator lets it run. It is the one command that does not return on its own: unless
`--count` is given a number of Cadences to stop at, it runs until it is interrupted.

```bash
cd vision
uv run watch
```

```
Registering Execution Providers — the first run also downloads them

Model      qwen3-vl-2b-instruct-cuda-gpu:2 (alias qwen3-vl-2b-instruct, GPU / CUDAExecutionProvider)
Cadence    one Observation every 2.000 s
Feed       camera 0, settled in 0.418 s, 5 Frames discarded
Providers  4.108 s
Load       3.184 s

#1  inference 1.284 s
A man with a beard is sitting at a desk in front of a wooden bookshelf.

#2  inference 1.196 s
The same man, now holding a white coffee mug in his right hand.

#3  inference 1.312 s
The desk is empty; the blue mesh chair in front of the bookshelf is unoccupied.
^C

3 Observations, median inference 1.284 s
```

A Watch needs a **live Feed**: `--image` is refused, and the refusal names the commands
that do take a file. It is a third command rather than a flag on `observe` because a
command that sometimes returns and sometimes does not is two commands.

## How to read the report

The **header** is everything paid or decided once, written above the Observations so
that the line which changes is the only one repeated. **Model** is the Variant that actually
answered and what it was built for, as `observe` reports it. **Cadence** is what was asked
for, in words rather than as a number, because it is a request and not a guarantee.
**Feed** is where the Frames come from and how many the camera discarded while it exposed
and white-balanced — that is the wait before `#1` arrives, and an Operator not told about
it reads that wait as the model being slow. **Providers** and **Load** are the same two
set-up costs `observe` reports, and for the same reason: neither is the latency of any
Observation.

Each **Observation** is then a short line of facts with the text under it, appended rather
than redrawn in place — a panel loses the history an audience is following, and breaks the
moment the output is redirected. The number leads the line so that a column of
Observations an audience has been following for a minute can still be counted, and it
counts every Cadence the Watch reached: a `#4` after a `#2` says something happened at
`#3`. Only the **inference** is timed, because taking the present off a held Feed is not a
cost worth a column. An Observation that hit the output limit says so as a further clause
on that same line — `observe`, with one Observation and room under it, gets a note of its
own instead.

The **summary** is a sentence rather than a table, and it is the lesson the Operator leaves
with: how many Observations this machine produced, and the median inference it sustained.
It is printed however the Watch ended — after the camera has been released and the model
unloaded, so that the last thing read is not written while the machine is still held.

## Starting a Watch on a question

`--ask "<question>"` starts the Watch on a **Scene Question** rather than on the plain
description, and it stands: every Observation from `#1` onward answers it, on its own
Frame.

```bash
uv run watch --ask "is anyone looking at the camera?"
```

```
Model      qwen3-vl-2b-instruct-cuda-gpu:2 (alias qwen3-vl-2b-instruct, GPU / CUDAExecutionProvider)
Cadence    one Observation every 2.000 s
Feed       camera 0, settled in 0.411 s, 5 Frames discarded
Providers  4.102 s
Load       3.207 s

#1  inference 1.271 s
Yes. The man in front of the bookshelf is facing the camera directly.

#2  inference 1.238 s
No. He has turned to his left and is looking at the bookshelf.

#3  inference 1.305 s
No one is in front of the camera.
^C

3 Observations, median inference 1.284 s
```

Nothing else about the Watch moves: the header, the per-Observation lines and the summary
are the ones above, the Cadence is still a grid, and a Watch that falls behind still skips
and says so. Each Observation still stands on its own Frame — the question is carried from
one Cadence to the next, never the answers, so there are no follow-ups inside a Watch any
more than there are inside a single `observe`. Leaving the flag off sends the prompt it has
always sent. An empty or whitespace-only `--ask` is refused before the camera is opened or
the model is loaded, because a shell-quoting mistake should cost an Operator a line rather
than a whole run-up.

A standing question does not make a Watch a measurement: the Frames still differ from one
Observation to the next, so there is still nothing to compare and nothing is written down.

## Asking a question while the Watch runs

Type a question at the running Watch and press Enter. **Nothing stops**: the Feed goes on
being read and the Cadence goes on being kept while the question is being typed, and the
new question takes effect at the **next Cadence** — it is a change of what the Watch asks,
not an interruption of what it was doing
([ADR-0009](../adr/0009-a-scene-question-changes-what-a-watch-asks.md)). It then stands
until it is replaced, exactly as `--ask` does.

The Watch says once, above the Observations that answer it, what it has been steered onto:

```
#2  inference 1.238 s
A man sitting at a desk in front of a bookshelf.

Asking: how many people are there?

#3  inference 1.305 s
One.
```

The question is never counted against the machine. No Cadence is skipped and no Stale Frame
is discarded because somebody typed, and the summary reports what the hardware did with no
tally of how often the keyboard was used.

**Press Enter on an empty line to stop asking** — the Watch goes back to describing the
Frame from the next Cadence, and says so (`Asking: for a plain description`). Retyping the
question already standing changes nothing and is not echoed twice.

**There are no follow-up questions.** Every Observation stands on its own Frame and on the
standing question alone, so _and what colour is it?_ is not a question this project can
answer — nothing the model was told a moment ago is still there to refer back to. Ask whole
questions, and build the demo on that.

A line typed while the Watch is mid-inference is read at the next Cadence, not pushed into
the inference already running. Of several lines typed between two Cadences **only the last
survives**: the questions are not queued, for the same reason Frames are not
([ADR-0006](../adr/0006-a-watch-discards-it-never-queues.md)). Typed characters
interleave with the Observations being printed — this is a terminal in a talk, not a TUI.

**Where `stdin` is not a terminal there is no keyboard**: a pipe, CI, output redirected to a
file. No reader is started at all and the Watch runs on whatever `--ask` gave it, in the
same spirit as the progress bars taking themselves off when the output is not a terminal.
Lines arriving on a redirected `stdin` are a script rather than an Operator, and are never
read as questions.

## When the machine cannot keep the Cadence

Pin the CPU Variant and the same Watch stops keeping its Cadence, in front of the audience
and without a table:

```bash
uv run watch --variant qwen3-vl-2b-instruct-generic-cpu
```

```
Model      qwen3-vl-2b-instruct-generic-cpu:2 (alias qwen3-vl-2b-instruct, CPU / CPUExecutionProvider)
Cadence    one Observation every 2.000 s
Feed       camera 0, settled in 0.402 s, 5 Frames discarded
Providers  4.070 s
Load       4.412 s

#1  inference 5.037 s
A man with a beard is sitting at a desk in front of a wooden bookshelf.

#2  inference 5.104 s, late — skipped 2 Cadences and discarded 149 Stale Frames to observe the present
The same man, now holding a white coffee mug in his right hand.

#3  inference 4.970 s, late — skipped 2 Cadences and discarded 147 Stale Frames to observe the present
The desk is empty; the blue mesh chair in front of the bookshelf is unoccupied.
^C

3 Observations, median inference 5.037 s, 4 Cadences skipped
```

The Cadence is a **fixed grid** — `t0`, `t0 + N`, `t0 + 2N` — and not a pause after each
Observation, so an inference that overran it leaves instants behind it that have already
gone. A Watch does not queue them. It **skips the moments it has passed, discards the
Stale Frames the Feed buffered meanwhile, and observes the present**, and it says how
many of each it lost on the line where it lost them. The two counts are two different
losses:

- **skipped 2 Cadences** — two Observations that will never exist. This machine was asked
  for one every two seconds and could answer once every five.
- **discarded 147 Stale Frames** — images the camera produced while the model was busy,
  read and thrown away to reach the present. A **Stale Frame** is not one of the Frames
  discarded while the Feed settled: the same read, a different fact. The settling ones are
  a start-up cost, reported once in the header; these are the price of being late, and
  their number follows how fast the camera produces Frames rather than the size of the
  shortfall.

An Observation that kept its Cadence says nothing about either — a `skipped 0` on every
timely line would be furniture. The summary carries the **total** of the skipped Cadences,
because a total is the one thing the per-Observation lines cannot be read as once a Watch
left running through a demo has scrolled past.

Why a Watch discards rather than queues — and why the shortfall is reported as two
counts rather than as a delay — is
[ADR-0006](../adr/0006-a-watch-discards-it-never-queues.md).

## A Watch is not a measurement

**Nothing a Watch produces is a Benchmark, and it never becomes one.** Every Observation
runs against a different Frame, so there is nothing to compare: the median inference in the
summary describes what this machine sustained on whatever happened to be in front of the
camera, not what a Variant costs. A Watch is the _feel_ of the shortfall; `benchmark` is
the question of what it costs, over a Workload held fixed and written down — that is the
number to cite, and the two are the same fact seen from either side.

## When an inference fails, and when the Feed goes away

A single inference that fails is **one line and then the next Cadence**: the Watch has
already moved on by the time it is read, so there is no advice under it. What that Cadence
cost to reach is said on the same terms as on an Observation's line, because the instants
were passed and the Stale Frames discarded before the model was asked:

```
#3  failed — RuntimeError: the model returned no text, late — skipped 1 Cadence and discarded 32 Stale Frames to observe the present
```

Failed Cadences are counted in the summary too (`, 1 failed`), and are deliberately _not_
in the median: a Watch reporting six Observations having attempted ten would be
overstating what this machine sustained.

A Feed that never opens ends the process rather than a Watch, as it does for `observe` —
but in its own words, because there is no `--image` here to fall back on: it names
`observe --image <path>` as the way to look at a file instead. A camera another
application is holding arrives differently. It opens, so the Watch begins; what it never
does is hand over a Frame, which is the ending the next paragraph is about.

A **Feed that dies** is the other thing entirely — the camera was unplugged, or another
application took it — and it ends the Watch, because a Watch cannot go on without a Feed.
The Observations already produced are still printed and summarised; the failure does not
get to take them away. The exit status follows that split: zero for a Watch that produced
at least one Observation over a Feed that survived it, non-zero for a Watch whose Feed died
or which produced nothing at all.

## The flags

- `--every SECONDS` — the Cadence, measured on the fixed grid rather than as a pause after
  each Observation. Default `2`. `--every 0` asks for Observations as fast as the model
  allows, which cannot be late for an instant nobody named. A negative number is refused.
- `--count N` — end the Watch after N Cadences, one whose inference failed included.
  Cadences rather than Observations, and deliberately: it is what makes a Watch whose every
  inference fails end rather than run for ever. Default: run until it is interrupted.
  Anything below one is refused: it is not a Watch.
- `--camera N` — index of the camera to open the Feed on. Default `0`.
- `--ask "<question>"` — the Scene Question the Watch _starts_ on, standing over every
  Cadence it then reaches. Default: the fixed prompt, which describes the Frame. An
  empty or whitespace-only question is refused, before the camera or the model. It is only
  the question the Watch begins with: typing one at the keyboard replaces it from the next
  Cadence, and an empty line at the keyboard goes back to the plain description.
- `--structured` — ask every Cadence for the list of objects present instead of prose.
  Overrides `--ask`; see [the Structured Observations guide](./structured.md).
- `--emit PATH` — write every Cadence reached to PATH as JSON Lines, so another process —
  `agent/` — can act on what was observed without ever seeing a Frame
  ([ADR-0014](../adr/0014-observations-cross-as-a-json-lines-file.md)). Valid only
  alongside `--structured`: prose has nothing in it a Trigger can act on, and the
  combination is refused before the camera opens or the model loads. The file is deleted
  and recreated at the start of every Watch, one line per Cadence flushed as it is
  reached. Default: nothing is written; the conventional path is `vision/observations.jsonl`,
  git-ignored like `vision/frames/`. See
  [`docs/fixtures/watch-emit-contract.jsonl`](../fixtures/watch-emit-contract.jsonl)
  for a worked example of the format.
- `--variant ID` — pin the Variant, and with it the Execution Provider, exactly as for
  `observe`. Default: resolve the alias `qwen3-vl-2b-instruct` and let Foundry Local pick
  the hardware. This is the lever the demo above turns.
- `--keep-frames` — write the Frame of every Cadence to `vision/frames/` (git-ignored) and
  report its path on the Observation's line, so that a surprising Observation stays
  explainable after the process is gone. Default: nothing is written, here as in `observe`
  — a Watch left running through a demo would otherwise leave hundreds of images of the
  room behind. It is written before the model is asked, so a Cadence whose inference
  failed leaves its Frame behind too; that line has no path on it, because there is no
  Observation to hang one from. A **Stale Frame** is never written: nobody observed it, so
  it explains nothing.

  ```
  #1  inference 1.284 s, saved D:\dev\local-vision-playground\vision\frames\frame-20260907-181204-114887.jpg
  An empty desk.
  ```

- `--image PATH` — refused, and offered only so that an Operator arriving from `observe` is
  told why rather than finding the flag missing and guessing.
- `--debug` — re-raise failures with their full traceback, as everywhere else.
