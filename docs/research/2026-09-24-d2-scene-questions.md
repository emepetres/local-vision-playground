# Which Scene Questions can the 4B model answer on the Work Cell? — 2026-09-24

Chooses the Scene Questions demo D2 types into a running Watch, after spike #58
([write-up](./2026-09-24-work-cell-spike.md)) showed the 2B model cannot see the Work Cell and
the beat-sheet's *"is the left tray empty?"* asks about exactly the part it is blind to. The
decisions it feeds are on [#59](https://github.com/emepetres/local-vision-playground/issues/59).

**Verdict:** D2 asks *"Is there a phone or a cup on the green mat? Answer in one or two
sentences."* (13/13 right), then *"What is the person doing? Answer in one sentence."* Both are
answered in about 1–2 s. Without the one-sentence bound, every answer hits the 128-token limit,
and the longer ones loop and hallucinate. Two questions are rejected. One is a question about the
hands in prose, which says "bare" when there are no hands. The other is a question about safety,
which says "No" to everything.

## Method

- **Machine and Variant:** the demo machine (ASUS Zenbook S14), `qwen3-vl-4b-instruct-int4-sym-gpu`
  on the Arc iGPU through OpenVINO GenAI.
- **Frames:** 13–14 of the Work Cell fixtures in `docs/fixtures/work-cell/`, fit to the Watch's
  640×480 box. They cover the baseline, bare hands, mixed hands, gloved hands, the phone and the
  cup on and off the mat, and a missing part.
- **How:** one `observe --image … --ask …` per photo and question, at the prose limit of 128
  tokens, scored by hand against what is on each photo.
- **Two rounds.** The first asked three open questions. The second added "Answer in one
  sentence" and two reformulations.

## Round 1 — open questions

| Question | Result |
| --- | --- |
| Is there a phone or a cup on the green mat? | No false "yes" on 11 negatives. "Yes" on phone + cup. On the off-mat photos it reasons about the location: *"the cup is not on the mat, but rather on the surface next to it"*. |
| What is the person doing? | Truncated on every photo. Hallucinations (*"only their legs and feet are shown"*, a *"blue cutting mat"*), a loop (*"glove with the '78' logo"* repeated), and a contradiction (*"the glove is on the right hand, and the glove is on the left hand"*). |
| Is it safe to solder like this? Why? | "No" with a generic lecture on eye protection and fumes, not drawn from the photo. |

13 of 42 runs crashed with `UnicodeEncodeError` before printing: the output was piped, so
Python encoded it as cp1252, and the model wrote emoji. Filed as
[#69](https://github.com/emepetres/local-vision-playground/issues/69). Round 2 ran with
`PYTHONUTF8=1`.

## Round 2 — bounded answers

| Question | Right | Notes |
| --- | --- | --- |
| a. Is there a phone or a cup on the green mat? Answer in one or two sentences. | **13/13** | Both off-mat photos answered "no", saying where the object actually is. ~1.3–2.3 s. |
| b. Is each visible hand bare or gloved? Answer in one sentence. | 7/13 | Right on the bare and the gloved photos, and on 1 of 2 mixed. **Says "bare" on 4 of 6 photos with no hands.** ~0.8 s. |
| c. What is the person doing? Answer in one sentence. | usable | No loops, no truncation. Says the person is "not visible" when there are no hands. |
| d. Looking only at the hands, is it safe to solder like this? Answer in one sentence. | — | "No" on all 13, including the gloved photos, for reasons that change from photo to photo. |

## What it means for the demo

- **"Answer in one sentence" belongs in every question asked on stage.** It is the cheapest
  fix to truncation and loops found so far.
- **Stage the cup beside the mat first, then put it on the mat.** The answer about the cup
  beside the mat is the reasoning moment: the model says where the cup is, not merely that it
  is absent.
- **Question b is the case for the Structured Observation.** The same model, asked for the
  `described` list, had no false no-gloves Trigger on the 17 photos with no hands in them
  (#58, A3). Asking is flexible. A Trigger needs the shape.

## Limits

- One camera position, one lighting, one glove type (white with a grey palm).
- 13 photos per question, scored by one person.
- Answers are at temperature 0, but a live Feed never gives the same Frame twice.
