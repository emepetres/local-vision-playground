# The `beat-sheet.md` sidecar

The sole home of **authoring judgment** — the thesis, the audience, the takeaway, the arc (with its demos), the out-of-scope line, the dated decisions kill-log, and the sign-off trail. It sits beside `deck.md` and the skill authors and re-reads it; `deck.md` stays the clean, renderer-agnostic contract and carries none of this.

`beat-sheet.md` is to the talk's argument what `CONTEXT.md` is to a codebase's vocabulary: **arc-clean**. No render detail, no pacing, no seconds-per-step, no `## Cut` (duration subsetting is the render/rehearse skill's, not this one's). Prose plus light structure — a document the author reads and diffs.

## Sections

```markdown
# <talk title> — beat sheet

## Thesis
<one sentence: the claim>
Refutes: <the belief the room holds that this claim overturns>
Only this speaker: <the judgment, comparison, or result no one else can give>

## Audience
<who is in the room and what they already believe>

## Takeaway
<the one concrete thing a listener can do or understand walking out>

## Arc
<ordered runs and beats. Mark the turn. Name the carrier object. Write each
mechanic as plant → payoff. List the demos in the order they run, each tied to
what it proves. Anchor beats to slides by heading or position.>

1. Open — <hook>            → slide "The Cost of Cleverness"
2. Body unit (run 1) — ...  → slides "Three tells", "47%"
   ...
   TURN — <the reversal>    → slide "47%"   (falls in the middle third)
   ...
3. demo — <what runs, what it proves>   (beat; timebox + fallback are the render skill's)
4. qa                       (beat)
5. Close — <restate/deny>   → slide "Which one would you merge?"

Carrier: <the object that recurs across the deck>
Mechanics: <mechanic> planted at <slide> → paid off at <slide>
Demos (in order): <demo 1 — proves X> → <demo 2 — proves Y>

## Out of scope
<what the talk does not cover>

## Decisions
<the alternatives the grilling killed, newest first, each dated>
- <date> — Dropped <alternative>: <why it lost>

## Sign-off
- thesis-signed: <yes/no> — <date>
- arc-signed: <yes/no> — <date>
```

## Beats

A **beat** is an element of the arc: a slide run, or a non-slide beat (`demo`, `qa`) or an interaction mechanic (a planted-then-paid-off audience move). Beats are planned **here**, as arc structure. Their **timeboxes and fallbacks are pacing/render** — the later render+rehearse skill's job — and never enter this file or `deck.md`. `deck.md`'s rendered vocabulary stays the closed ten slide types; a demo or Q&A shows up in the running deck as an ordinary typed slide (often `section` or `statement`) that the beat sheet annotates.

**Demos are chosen and sequenced here**, as part of fixing the arc — never left to the draft. The arc round of the grilling settles which demos the talk shows and in what order, each `demo` beat tied to what it proves for the thesis; a demo that does not advance the argument is cut. Record the running order in the `Demos (in order)` line so the sequence is legible without walking the whole arc.

## Arc invariants (checked by judgment at sign-off, expressed by position)

Nothing here depends on a seconds budget — every invariant reads off **slide or beat position**:

- **Thesis is a refutation**, not a topic — it names the belief it overturns.
- **The turn falls in the middle third** of the deck by position.
- **A carrier object recurs** across the deck (a repeated badge, phrase, or image that the argument rides on).
- **The body unit runs 3–6 times.**
- **Every paid-off mechanic has a plant**, and a plant that is dropped drops its payoff too.

These block by the author's judgment at sign-off, not by a script (there is no reconcile script in v1). The `deck.md` validator never checks them.

## Sign-off and iteration

`## Sign-off` records that the human approved the thesis and the arc, each dated. On a later edit, the skill reopens a scoped grilling round on only the touched decision and whatever depends on it — the cascade (thesis → {audience, takeaway} → arc incl. demos → out-of-scope → slides) is defined in `SKILL.md` under **Iterate**.
