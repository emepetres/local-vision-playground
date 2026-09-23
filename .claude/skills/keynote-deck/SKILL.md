---
name: keynote-deck
description: Author a conference keynote by grilling the speaker until the thesis, audience, takeaway, arc, and demos are fixed, then writing a validated, iterable deck.md. Use when authoring a new keynote or conference talk, or revising an existing deck's thesis, arc, demos, or slides. Needs a human to grill and the mattpocock-skills grilling skill.
---

# Keynote Deck

Carry a talk from raw material to a **validated, iterable `deck.md`** by **grilling the speaker** until the argument holds, and keep the judgment behind it in a sidecar `beat-sheet.md`. This skill decides and writes the talk — it does not merely format one already written.

**Runs on `mattpocock-skills:grilling`.** The interrogation mechanic — rounds, the frontier, one recommendation per question, wait for the human — is inherited from that skill, invoked live, so upstream improvements flow through. It is a **hard dependency**: if `mattpocock-skills:grilling` is not installed, this skill cannot run — say so and stop, rather than improvising an interrogation.

**Requires a human.** Grilling decides *what the speaker wants to say*, and that is the speaker's — never self-answered, never delegated to a subagent. With no human to grill, the skill cannot complete. Only *facts* are delegated: dispatch a subagent to look one up and keep grilling with what you have, per grilling's own rule.

**Two artifacts, one clean seam:**

- **`deck.md`** — the slides, as plain markdown. A renderer-agnostic content contract: what each slide *is* and *contains*, nothing about how it renders or how the talk was decided. Full contract in [`references/deck-format.md`](references/deck-format.md); the canonical deck is [`references/example-deck.md`](references/example-deck.md).
- **`beat-sheet.md`** — the sole home of authoring judgment: thesis, audience, takeaway, arc (with demos), out-of-scope, the dated decisions kill-log, and the sign-off trail. Format in [`references/beat-sheet-format.md`](references/beat-sheet-format.md).

Prose follows a **swappable voice**, [`references/voice.md`](references/voice.md), which owns register absolutely.

This skill owns **narrative** judgment (ideation → grilling → draft → iterate). **Pacing** — seconds-per-step, style profiles, rehearse timing, duration-subsetting — belongs to a separate render+rehearse skill and never enters `deck.md`. Imagery is delegated to `presentation-image-visualizer`; this skill emits `!todo "…"` image directions and grows no second copy of that logic.

## When not to use

- The user wants an existing finished deck rendered, built into a browser folder, or timed — that is the render+rehearse skill's job.
- The user wants a single support image, not a talk — use `presentation-image-visualizer`.
- The user wants plain slides with no argument (a status update, a list of links) — a deck format is overkill.

## 1. Load context

Before the first question, read what you already have so you grill toward the angle only this speaker can take, never re-litigating what is settled:

- The **raw material** the speaker brings — the provisional angle, the story of where the idea comes from, the mistake inside it, the scene it opens on. This is the speaker's material, not a decision already taken: it enters the grilling like everything else.
- **`references/voice.md`** — register and signature moves, so you never fix a thesis the voice cannot say.
- On a re-invocation, the existing **`beat-sheet.md`** and **`deck.md`** — read the sign-off state first (see [Iterate](#iterate--modify-not-just-create)).

## 2. Grill until the frontier is empty

**Invoke `mattpocock-skills:grilling`** to run the interrogation. Grill until every item below is fixed and each is defensible against the specific room. Do not act on any of them until the speaker confirms.

- **Thesis** — the claim the talk carries, in one sentence: the **refutation of a belief the room holds**, never a topic. "REST is fine for most teams" is a topic; "Your microservices are a distributed monolith you can't afford" is a thesis. Name the belief it overturns. In the same rounds, press for **what only this speaker can say** — a judgment, a comparison with real work, or a result no one else has shown. A talk that only reorders what the audience already knows does not need this speaker; if nothing surfaces, the thesis is not fixed yet.
- **Audience** — who is in the room and what they already believe.
- **Takeaway** — the one concrete thing a listener can do or understand walking out.
- **Arc** — the argument line, with its invariants read off **slide/beat position**, never a time budget: the **turn** in the middle third, a recurring **carrier object**, a **body unit** run 3–6 times. The full invariant list is in [`references/beat-sheet-format.md`](references/beat-sheet-format.md). The arc round includes an explicit **demo checkpoint**: settle **which demos the talk shows and in what order**, each tied to what it proves for the thesis. A demo that does not advance the argument gets cut — that is a grilling job. Record demos as ordered `demo` beats, planted then paid off like any mechanic.
- **Out of scope** — what the talk does not cover.

When a **load-bearing fact** surfaces mid-grilling — a claim the talk will assert as true — distinguish it from a matter of opinion. A fact with a checkable answer in a primary source is dispatched to a subagent (in background for anything heavy) while you keep grilling; a matter of opinion is settled by grilling, never sent out.

Write each fixed item into `beat-sheet.md` as it settles, and log every alternative the grilling kills in the dated `## Decisions` section. **Get the speaker's sign-off before drafting any slide.**

## 3. Draft

Only after sign-off, write `deck.md`, one slide per `---`, each slide a required `type:` from the closed ten. Draft the prose in [`references/voice.md`](references/voice.md)'s register and signature moves. Anchor each beat from the arc — including each `demo` beat — to its slides. Leave art unresolved as `src: !todo "what it should show"`.

## Iterate — modify, not just create

On a re-invocation over an existing deck, **read `beat-sheet.md`'s sign-off state first, diff it against `deck.md`, and reopen a scoped grilling round on only the touched decision and whatever depends on it** — never re-interrogate the whole session from scratch. Each reopened item is a targeted grilling frontier, and still requires the human.

The dependency order is **thesis → {audience, takeaway} → arc (incl. demos) → out-of-scope → slides**. A change reopens itself and everything downstream:

- **Thesis edited** → reopen grilling on audience, takeaway, and the arc; then update the slides.
- **Audience or takeaway edited** → reopen the arc; then update the slides.
- **Arc edited** (reorder, add or drop a run or beat, move the turn, change a demo or its order, change a mechanic) → re-sign the arc; update `deck.md` to match.
- **Out-of-scope edited** → touches only which slides belong; no arc reopen.
- **Slide prose edited** (wording, a bullet, an image direction) → sign-offs stand; re-validate well-formedness and re-check voice, nothing more.

**Drift between the two artifacts is advisory.** There is no linking id in `deck.md` — it stays the pure contract. Reconcile by reading both: if the deck has slides absent from the arc, or the arc names a paid-off mechanic or demo with no slide, **surface it and offer to reconcile**; never refuse to proceed. The speaker owns the fix.

## Validate

Run the well-formedness check on any `deck.md` — one written here or one edited by hand. Invoke the validator that ships with this skill, `scripts/validate-deck.mjs`, by its path relative to this skill's directory (wherever the skill is installed — never assume a repo layout):

```
node <this-skill-dir>/scripts/validate-deck.mjs <path>/deck.md
```

It is the single automated seam. It checks **structure only** — the full check list is in [`references/deck-format.md`](references/deck-format.md) under **Validation** — and **never** judges thesis, arc, voice, or pacing, which are the human's at sign-off. A clean deck exits 0; faults print with the slide named and exit 1.

The corpus under `scripts/test/` (the canonical deck plus one deck per fault) is the skill's test — run `scripts/test/run-tests.mjs` the same way, relative to this skill's directory.

## Provenance

- The `deck.md` contract is inherited unchanged from the deck-format spec; the authoring-judgment layer and the two-artifact split were decided in the `keynote-deck` spec that superseded it.
- The interrogation mechanic is `mattpocock-skills:grilling`, invoked live and depended on hard — see [`docs/adr/0005-keynote-deck-depends-on-mattpocock-grilling.md`](../../docs/adr/0005-keynote-deck-depends-on-mattpocock-grilling.md).
- Vocabulary — *thesis, audience, takeaway, arc, beat, demo, carrier, turn, sign-off, deck, slide, step (= reveal boundary), region, media reference, placeholder* — is skill-local; it lives in these reference files, not the repo `CONTEXT.md`.
- `voice.md` is swappable (currently Javier's); `deck-format.md` and `beat-sheet-format.md` are the stable contracts a swap does not touch.
