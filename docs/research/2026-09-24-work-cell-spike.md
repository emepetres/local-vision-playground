# Spike: can the 2B model see the Work Cell? — 2026-09-24

Resolves the assumptions `A1…A6` that the spec for backlog items 6 and 7
([#59](https://github.com/emepetres/local-vision-playground/issues/59)) rests on. Issue
[#58](https://github.com/emepetres/local-vision-playground/issues/58).

**Verdict: NEGATIVE for `qwen3-vl-2b-instruct`, and negative for the missing-part Trigger on
every model tried.** No prompt makes the 2B model resolve any of the three Triggers against the
issue's bar (resolved on at least 4 of 5 photos, and no false Trigger on the baseline, part-in-use,
gloved or off-Zone photos). `qwen3-vl-4b-instruct`, exported to the Arc iGPU, **confirms A3**
(bare hands, 9/9 with no false Trigger) and **A4** (phone and cup on the Zone, 3/3 with no false
Trigger), each under a different prompt. **A2 is refuted on both models and every prompt**: no
combination catches the removed part without also reporting present parts as missing. That
refutes the one Trigger the Saturday demo commits to.

## Method

- **Machine**: the demo machine, ASUS Zenbook S14 (Core Ultra 7 258V, Arc 140V iGPU).
- **Photos**: `docs/fixtures/work-cell/`, 37 files taken with the demo camera on its tripod. Five
  `part-in-use-*` files are byte-identical to `bare-hand_3/4` and `one-glove_2/3/4`, so **32
  distinct photos** were run and scored. Each was fit to the Watch's 640×480 box (640×360), and
  one run also used 1280×720.
- **Labels**: what was on the desk was read off each photo by hand: the parts in the Tray, on the
  Zone and in a hand, the bare and gloved hands, and the phone and the cup on or off the Zone.
  From those labels, the Triggers that should fire were derived.
- **The Work Cell**: six Tray parts (soldering iron, solder, brush, tweezers, jumper wires,
  circuit board). The tools are applied to the board on the green mat.
- **Variants**: `qwen3-vl-2b-instruct-int4-sym-gpu` (OpenVINO, the Watch's demo Variant),
  `qwen3-vl-2b-instruct-generic-cpu:2` (Foundry Local, the A6 reference), and
  `qwen3-vl-4b-instruct-int4-sym-gpu`. The last was exported for this spike with
  `tools/convert/convert.py --weights Qwen/Qwen3-VL-4B-Instruct --ep GPU`, using the 2B's recipe
  unchanged.
- **Four prompts**, all at temperature 0 and 256 output tokens (double the Watch's 128, so what
  128 would cut is visible):
  - `plain`: the spec's shape, `{name, count, where}` with `where` ∈ `tray | zone | hand |
    elsewhere`. The four places are named but not described.
  - `described`: the same shape, with the Zone described as "the green cutting mat" and the
    Tray as "the white mesh tray".
  - `checklist`: the six parts named, then every hand, then anything else on the mat or in the
    Tray.
  - `questions`: no list. Nine closed yes/no questions, one inference each: "is there a *part*
    anywhere in this image?" for each part, "is any hand bare?", "is there a phone / a cup on
    the green mat?".
- **Reading the list**: the list was read the way the spec's Triggers would read it:
  - *part missing*: a part in none of `tray`, `zone` or `hand`;
  - *no gloves*: a bare hand anywhere;
  - *Foreign Object*: an object in `zone` that no Work Cell list names.

  Names were matched case-insensitively against a synonym table. A loop guard stopped each
  reply at its first exact repeat.

The harness is a throwaway prototype, kept on the branch
[`prototype/58-work-cell-spike`](https://github.com/emepetres/local-vision-playground/tree/prototype/58-work-cell-spike/vision/prototypes/work-cell-spike).
`run.py` produces the replies. `report.html` is a double-click page that rescores them live: the
knobs of the reading rules, the synonyms, and each photo with its raw reply.

## Results

Each Trigger is shown as *resolved on its photos* · *false Triggers on the negatives*. The
negatives for part missing and no gloves are the 16 baseline, part-in-use, gloved and off-Zone
photos.

| Variant · prompt | Part missing (6) | No gloves (9) | Foreign on Zone (3) | Loops ≥ 3× | s / photo |
| --- | --- | --- | --- | --- | --- |
| 2B OV-iGPU · plain | 0 · 16 | 0 · 0 | 1 · 0 | 20/32 | ~5 |
| 2B OV-iGPU · described | 0 · 16 | 0 · 0 | 1 · 0 | 10/32 | ~2 |
| 2B OV-iGPU · checklist | 2 · 12 | 0 · 0 | 0 · 0 | 16/32 | ~5 |
| 2B OV-iGPU · checklist 1280×720 | 2 · 9 | 0 · 0 | 1 · 0 | 16/32 | ~8 |
| 2B OV-iGPU · questions | 2 · 15 | 4 · 0 | 1 · 0 | — | 2.7 |
| 2B FL-CPU · plain | 0 · 16 | 3 · 0 | 3 · 5 | 31/32 | ~30 |
| 2B FL-CPU · described | 0 · 16 | 3 · 0 | 3 · 1 | 16/32 | ~25 |
| 2B FL-CPU · checklist | 0 · 0 | 1 · 1 | 3 · 3 | 2/32 | ~20 |
| 2B FL-CPU · questions | 1 · 16 | 4 · 1 | 3 · 0 | — | 75 |
| 4B OV-iGPU · plain | 0 · 16 | 6 · 0 | 3 · 2 | 8/32 | ~5 |
| **4B OV-iGPU · described** | 0 · 16 | **8 · 0** (9 · 0 ¹) | 2 · 0 | 10/32 | 4–10 |
| 4B OV-iGPU · checklist | 2 · 1 | 2 · 0 | 1 · 0 | 0/32 | ~6 |
| **4B OV-iGPU · questions** | 1 · 16 | 5 · 1 | **3 · 0** | — | 3.9 |

¹ When a plain `hand` also counts as bare.

## A1 — the shape comes back: **confirmed, with a caveat**

Every one of the 320 list replies parsed as a `{name, count, where}` array, and every element
carried a valid `where`. All 288 × 3 closed answers were a plain yes or no. The caveat is that
the 2B model mostly reaches the output limit. At 256 tokens, 21/32 (`plain`) and 31/32
(`checklist`) OV replies were cut off and salvaged element by element. At the Watch's 128 tokens
the list would lose more. The 4B model closes its array far more often (0–3/32 truncated).

## A2 — `where` separates the Tray from the Zone: **refuted**

- **The 2B model does not place parts.** Of the 150 cases of a part lying in the Tray, OV put
  it in `tray` on 3 (`plain`) and 0 (`described`); FL-CPU on 53 and 47. The rest went to
  `elsewhere` or were not listed, so *part missing* fired on all 16 negatives.
- **`checklist` makes the model recite the list instead of looking.** Tray placement jumps to
  147/150 on FL-CPU and 149/150 on the 4B model, but a removed part is "in the tray" too: the
  brush on `part-missing-brush`, for one. FL-CPU with `checklist` never fires falsely, but it
  never catches a removed part either (0/6).
- **The 4B model enumerates the soldering iron and drops the small parts.** On `described` it
  lists the iron as tip, handle, cable and stand (45 × "soldering iron tip"). The brush,
  tweezers and wires are then missing from photos they are in (the brush in 26 of them), and
  a Tray part is placed in `tray` in 42/150 cases.
- **Closed questions fail the other way.** "Is there a brush anywhere?" is answered *yes* on
  12, 3 and 16 of 32 photos (2B OV, 2B FL, 4B), and the brush is in 31 of them. "Tweezers?"
  gets 17, 16 and 7 *yes* out of 31. The thin white brush and the black tweezers are the parts
  neither model sees reliably, and a missing-part Trigger needs every part seen on every Frame.

A removed part is absent from the list on 6/6 photos. The trouble is not hallucinated presence
but missed presence. A Trigger built on this would fire constantly. Nothing the Agent can do
with N consecutive Observations fixes it, because the misses are systematic per part, not noise.

## A3 — bare hands told from gloved ones: **refuted on 2B, confirmed on 4B (`described`)**

- The 2B model never says `bare hand` on OV. It says `hand` (84 times) or `gloved hand` (135
  times), often copying the prompt's example. Counting a plain `hand` as bare gives 9/9, but
  with 8 false Triggers on hand-less or gloved photos.
- The 4B model on `described` names `bare hand` on 8/9 photos with a bare hand, including 5/5
  mixed ones, with **no false Trigger** on the 6 gloved photos or any other negative. Counting
  a plain `hand` as bare makes it 9/9.
- **White and grey gloves could not be scored apart.** The fixtures hold one glove type: white,
  with a grey palm coating. The grey electrical gloves appear only lying on the Tray's corner
  (`one-glove_4`, `mixed_5`).

## A4 — the phone and the cup are named and placed: **refuted on 2B OV; confirmed on 4B (`questions`)**

- 2B OV named the phone and the cup on the Zone on at most 1/3 photos, and never said *yes* to
  "is there a cup on the green mat?", even with a large red mug in the middle of it.
- 2B FL-CPU names both on 3/3 but places the off-Zone cup on the Zone (3/3 false on
  `checklist`).
- The 4B model answers the two closed questions right on all 3 on-Zone and all 3 off-Zone
  photos, with no false Trigger elsewhere.
- **The cost of the closed question:** it can only catch a Foreign Object named in advance. The
  spec's "anything the Zone's list does not name" needs an open list, and on open lists the 4B
  model is 2/3–3/3 with 0–2 false Triggers off the Zone.
- Only 3 photos per foreign condition exist, below the issue's ≥ 5.

## A5 — names are stable enough to match: **confirmed for the parts; the synonyms are below**

The parts get consistent names. The failure in A2 is that parts go unlisted, not that they are
misnamed. Every name each model used, as (2B / 4B) counts across all runs:

| Real object | Names used |
| --- | --- |
| soldering iron | soldering iron (363/99), soldering tool (0/8), soldering station (2/0), soldering pen (0/2); 4B also splits it into soldering iron tip (0/45), handle (0/28), cable (0/22), stand (12/12), body (0/7), soldering tip (0/11), soldering iron holder (2/0) |
| solder | solder (147/6), solder spool (106/32), spool (33/0), solder wire (3/18), soldering wire (0/9), spool of wire (3/0) |
| brush | brush (94/32); also pen (11/0), pencil (0/2) |
| tweezers | tweezers (149/37), pliers (5/0), soldering tongs (0/4) |
| jumper wires | cable (163/1), jumper wires (116/32), wire (104/3), wires (32/2) |
| circuit board | circuit board (143/41), arduino board (22/5), arduino (14/0), microcontroller (13/2), microcontroller board (0/2) |
| bare hand | bare hand (12/17), hand (84/4, ambiguous) |
| gloved hand | gloved hand (135/49), glove (2/21) |
| phone | phone (18/1), smartphone (1/4), cell phone (0/1) |
| cup | mug (11/7), cup (6/9), red mug (2/0) |
| the setting (to ignore) | tray, work mat, cutting mat, mat, watch |
| noise | tools (41/0), screw (25/0), screwdriver (11/6), laser (3/0), laptop (2/1), wrench (1/2) |

Two traps for the Work Cell file:

- `cable` names both the jumper wires and the soldering iron's cord.
- The noise names (`tools`, `screw`, `screwdriver`) land in `zone` often enough that an
  open-list Foreign Object Trigger fires on them.

## A6 — the repetition loops: **the model loops; the int4 export makes it worse**

Loops happen on both Runtimes, so they come from the model. With the same prompt, the
OpenVINO int4 export loops far more than Foundry Local's CPU build: on `checklist`, 16/32
replies repeat one `{name, where}` three or more times on OV, against 2/32 on FL-CPU. On `plain`
both loop (20/32 OV, 31/32 FL). The 4B export loops less (0–10/32), and closed questions leave no
room to loop. A parser-side loop guard (stop at the first exact repeat) is cheap and
worth keeping, but it does not rescue any Trigger here.

Latency, with the machine idle: the 2B model answers a `described` list in about 2 s and the 4B
model in 4–10 s, on the iGPU. Nine closed questions cost 2.7 s (2B) or 3.9 s (4B) on the iGPU.
On Foundry Local's CPU build they cost 75 s, which rules the CPU out for a Watch.

## What this re-opens in #59

Following the spec's own rule ("A1 or A2 moves the shape to a Work Cell-specific checklist…
A3 or A4 drops that Trigger… and makes the case for the 4B and 8B models"):

- **A2 refuted**: re-opens **#63** (missing-part Incident) and the `where` half of **#64**. The
  spec's fallback, a Work Cell checklist, was tried here and does not rescue it: the model
  recites the checklist. The Saturday demo's minimum Trigger is therefore not supported by
  either model on this setup.
- **A3 and A4 refuted on 2B, confirmed on 4B**: re-opens **#66** on the question of which model
  and which shape. `described` suits the gloves and `questions` suits phone/cup, so a Watch
  would need both, or a Cadence that alternates them. The Watch's default Variant (A6, **#64**)
  would move to the 4B iGPU export at 4–10 s per Frame.
- **A1 and A5 hold.** **#64**'s shape change stands, with the 128-token limit raised and the
  synonyms above seeded into the Work Cell file.

## Limits of this spike

- One glove type, so A3 cannot say white from grey.
- 3 photos per foreign condition and 1 per missing part, not ≥ 5.
- A single camera position and lighting.
- The labels are one person's reading of each photo.
- The 8B model was not tried: 4.96 GB on CPU only, and no OpenVINO export yet.
