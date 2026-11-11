---
name: keynote-deck
description: Write a keynote's deck.md from its accepted esquema.md, or revise it.
disable-model-invocation: true
argument-hint: <slug> ["direction notes"]
---

# Keynote deck

Turn `docs/keynotes/<slug>/esquema.md` into `docs/keynotes/<slug>/deck.md`: every slide, its speaker notes and its image placeholders, generated whole and then reviewed by the speaker by reading it. The esquema holds what the speaker decided; the deck carries it out at speed and never reopens it silently.

- File contract: [`references/deck-format.md`](references/deck-format.md), with the canonical [`references/example-deck.md`](references/example-deck.md).
- Prose register: [`references/voice.md`](references/voice.md).

Arguments: `<slug>` and optional direction notes, which outrank your own assumptions. Slide text is written in English (US) unless the speaker asks for Spanish; `::: notes` and `::: script` are written in the language the talk is delivered in, which the deck's `language:` names.

## Requirements

- `mattpocock-skills:grilling` installed. If it is missing, say so and stop.
- `esquema.md` exists, and its thesis and arc carry no `❓`. Otherwise point the speaker to `/keynote-outline <slug>` and stop. If arc rows are still `✏️`, ask once whether to treat them as accepted.

## 1. Load context

- `esquema.md`: thesis, arc rows with minutes, demos, carrier, turn, promises, budget line.
- `evento.md`: title, and the language the talk is delivered in.
- `style.md` if it exists: the `accent` colour.
- `deck.md` if it exists: read it as [Iterate](#iterate) says.
- The repo facts each row leans on: the numbers, names and commands the slides will assert, from the docs the esquema points at.

Done when every arc row has the facts its slides need, or a note of which fact is missing.

## 2. Draft the whole deck

- Each arc row becomes a run of slides in its order; each demo row becomes one `demo` slide with what it proves.
- The body unit (the slide run the body repeats) runs 3 to 6 times; the carrier recurs; the turn lands on the row the esquema names.
- Aim at the esquema's visible-change budget: slides plus `[+]` steps.
- `::: notes` on every slide, as terse cues. `::: script` on the opening, the turn and the close, where the exact words matter.
- Each picture is an `image` slide with a classified placeholder (`draw:`, `capture:` or `provide:`) unless the file already exists.
- Every number or claim on a slide comes from the repo or a primary source. A load-bearing fact you cannot confirm goes to a background subagent; until it reports, the slide carries it and its notes say `VERIFY: <claim>`.
- Collect the **doubts** that need the speaker's judgement (a wording that commits to a position, a cut between two good slides) instead of stopping at each one.

Done when every arc row has its slides and every slide has a type, a body and notes.

## 3. Resolve doubts

If you collected doubts, invoke `mattpocock-skills:grilling` for one round with all of them, each with your recommendation, and apply the answers. A doubt that would change the thesis or the arc goes back to `/keynote-outline` instead: say so and leave the slide as drafted.

## 4. Validate

```
node <this-skill-dir>/scripts/validate-deck.mjs docs/keynotes/<slug>/deck.md
```

Done when it exits 0. It also prints the visible changes; the corpus under `scripts/test/` is run with `node <this-skill-dir>/scripts/test/run-tests.mjs` after any change to the validator.

## 5. Check against the esquema and report

Flag each deviation without blocking; the speaker owns the fix:

- Visible changes against the budget: warn above +15 %.
- Drift: slides that belong to no arc row, arc rows or promises with no slide.
- Body unit count, carrier, turn position.
- Placeholders, grouped by kind: `draw:` ones go to `/keynote-images <slug>`; `capture:` and `provide:` ones are the speaker's list.
- Every `VERIFY:` still open.

Finish by saying the deck is ready to read, and that the next steps are `/keynote-images <slug>` and `/keynote-pptx <slug>`.

## Iterate

With an existing `deck.md`, the speaker's hand edits are authoritative: leave every slide they touched as they left it. When the file is tracked by git, `git diff HEAD` shows which ones.

- With direction notes, change only what they target.
- Without them, reconcile against the esquema: list the slides that a changed thesis, arc row or demo makes stale, propose the change for each, and apply what the speaker approves.
- Regenerate the whole deck only when the speaker asks for it.

Then run steps 4 and 5 again.
