# The structured prompt describes the demo's Work Cell, as a recorded debt

`STRUCTURED_PROMPT` no longer stays scenario-agnostic. It now names the demo's own fixture
outright — "the work zone is the green cutting mat", "the tray is the white mesh tray beside
it" — because that is the wording the spike behind [#58] found necessary to get a small local
model to answer with a valid `where` and to tell a bare hand from a gloved one
([docs/research/2026-09-24-work-cell-spike.md](../research/2026-09-24-work-cell-spike.md),
A1 and A3). Every generic phrasing tried — a bare `plain` shape naming the four places but not
describing them, a `checklist` that recited the Work Cell's parts — either left `where` mostly
unplaced or had the 4B model recite the checklist instead of looking at the Frame; only the
`described` prompt, naming the mat and the tray, got the model naming `bare hand` on 8 of 9
photos with no false Trigger on the negatives. `--structured` is [#64]'s ticket, and this is
the wording it ships with.

This is a deliberate, recorded debt, not an oversight. Every Operator's Frame — whatever is in
front of the camera on their own bench, not this project's demo bench — is sent through a
prompt that describes *this* project's green mat and white tray. An Operator pointing
`observe --structured` at an unrelated scene gets a prompt describing a Work Cell that is not
there, and `where` degrades exactly as A2 of the spike describes for the wrong reason: not
because the model cannot place objects, but because the objects in front of it were never on
a green mat or in a white tray to begin with.

## Considered Options

- **Keep the prompt scenario-agnostic** (name the four places, describe none of them). This is
  what shipped before this ticket, and it is what the spike's `plain` prompt measured: `where`
  came back unplaced on almost every Tray part (3/150 on the OpenVINO 2B, 0/150 on `described`
  for the same model — see A2), and the 4B model never said `bare hand` at all on `plain`.
  Rejected for now, because a shape an Operator cannot act on is not a shape worth keeping
  scenario-agnostic for its own sake.
- **A `checklist` prompt that names the six Work Cell parts explicitly.** Tried in the spike.
  Rejected: the model recites the list back — a removed part is still placed "in the tray"
  because the prompt told it to expect one there (A2) — so it trades one failure for a worse
  one, and it is no less tied to this demo's parts than the wording that shipped.
- **A `--scene TEXT` flag, letting an Operator supply their own scenario description.** The way
  out, not built now. It is the correct fix for the debt this ADR records — the shape and the
  Watch/Benchmark/`--emit` contract stay exactly as they are, only the words describing where
  the four places are change — but it is out of scope for #64, which is about the shape gaining
  `where` at all, and no Operator has yet needed a different scene to demonstrate this project
  against. Held for whenever that need arrives.

## Consequences

**The prompt is not the Operator's to change**, and now it is also not reusable across scenes
without editing `vision/src/vision/inference.py` — a stronger version of the constraint
`docs/guide/structured.md` already documents (`--structured` overrides `--ask`; there is no
free-text Scene Question in structured mode). A future `--scene TEXT` is the escape hatch, and
it is not a small addition: it has to reach the same wording precision the spike measured, or
it re-opens A1/A3 for whatever scene it describes.

**Structured Benchmarks recorded before this change are not comparable with ones taken after
it.** The shape gained `where`, the prompt changed from a generic phrasing to one naming this
project's Work Cell, and the output limit moved from 128 to 256 tokens (issue #64, A1). A
structured record in `docs/benchmarks/` from before this ADR measured a different Workload
outright, the same way two prose Benchmarks asked different questions are not comparable.

**The synonym table `agent/work-cell.json` seeds from the spike (A5) is equally tied to this
prompt.** The names a model uses for "soldering iron" or "jumper wires" are an artifact of a
prompt that tells it what bench it is looking at; a `--scene TEXT` for a different physical
setup would need its own synonym table beside it, not a reuse of this one.

[#58]: https://github.com/emepetres/local-vision-playground/issues/58
[#64]: https://github.com/emepetres/local-vision-playground/issues/64
