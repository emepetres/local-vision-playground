---
name: keynote-outline
description: Decide a keynote's thesis, arc and demos with the speaker, and write its esquema.md.
disable-model-invocation: true
argument-hint: <slug> ["direction notes"]
---

# Keynote outline

Turn a keynote's context into `docs/keynotes/<slug>/esquema.md`: one page the speaker edits by hand and runs back through this skill as often as needed. File format: [`references/esquema-format.md`](references/esquema-format.md).

The keynote is the **speaker's**. The speaker decides the thesis, the arc and the demos; you bring context, propose and calculate. Whatever the speaker has not decided stays marked `✏️` or `❓`. Facts are yours to find, with a subagent when the search is long, while the grilling goes on; decisions are the speaker's, never answered on their behalf.

Arguments: `<slug>`, a folder under `docs/keynotes/`, and optional direction notes, which outrank your own assumptions. `esquema.md` is written in Spanish unless the speaker asks for English.

## Requirements

- `mattpocock-skills:grilling` installed. If it is missing, say so and stop.
- `docs/keynotes/<slug>/evento.md` exists. If it is missing, ask the speaker to create it and stop.

## 1. Load context

- `evento.md`: duration, level, track and the abstract. List the abstract's **promises**: each concrete thing it tells the room they will see or take away.
- If `evento.md` holds a URL, dispatch a background subagent to find the slot (date, time) and the neighbouring talks in the same track in the public agenda. Carry on without waiting; if it finds nothing, the header says `fecha/hora: sin confirmar`.
- `esquema.md`, if it exists: read it as [Iterate](#iterate) says.
- The repo's context: whichever of `CONTEXT.md`, `docs/backlog.md`, `docs/stack.md` and the titles under `docs/adr/` exist, and the recent `git log`. What works today decides which demos are possible.
- Other keynotes under `docs/keynotes/` (their `esquema.md` or `beat-sheet.md`): only to know what has already been told, so it is not repeated without a reason.
- Whether the keynote folder holds a `template.pptx`.

Done when you can state in four lines what the event promises, how long the talk is and what the repo can show today, and you hold the list of promises.

## 2. Compute the budget

- **Useful minutes** = duration − 5 min of Q&A buffer − 1 min of event frame when `template.pptx` exists (its cover, speaker, sponsor and Q&A slides).
- **Pace**: the `ritmo` field of the esquema header; 35 s per visible change when there is none. A visible change is a slide or a `[+]` step.
- **Visible changes** = (useful minutes − demo minutes) × 60 / pace, computed once the demo rows have minutes.

Done when you hold the useful minutes and the pace.

## 3. Grill the skeleton

Invoke `mattpocock-skills:grilling`. Three rounds by default; keep going if the speaker wants more. Fix three things only:

1. **Thesis**: the claim the talk carries, which overturns one concrete belief the room holds. "I will talk about X" is a topic; "X is the opposite of what you believe" is a thesis. In the same rounds, fix the belief it refutes and what only this speaker can say: numbers they measured, failures they lived, comparisons with real work.
2. **Arc**: the rows, with minutes, the carrier and the turn. Every promise of the abstract lands on a row or goes out of scope.
3. **Demos**: one row each, with what runs, what it proves for the thesis and its minutes. When the repo cannot run a demo yet, say so before proposing it.

Every question carries your recommendation, drawn from the context of step 1.

Done when the thesis, its `Refuta:` and its `Solo yo:` are written in the speaker's own words; every row has minutes and they sum to the useful minutes or less; every demo states what it proves; and every promise has a row, is out of scope, or the speaker chose to leave it `⚠️ sin sitio`.

## 4. Propose the rest in one block

Draft in one go, without asking one by one, the audience, the takeaway and the out-of-scope line, each with the `✏️` marker. The audience draws on the neighbouring talks if the subagent found them. The speaker accepts or corrects them by reading the file.

## 5. Write and close

- Write `esquema.md` following the format: rows the speaker decided are `✅ decidido`, what you drafted is `✏️ propuesta`, what nobody decided is `❓ abierto`.
- Append to `## Decisiones`, dated today, each alternative the grilling dropped and why.
- Check the arc rules of the format and the budget, and flag each deviation without blocking, including any promise the repo cannot deliver today.
- Offer **once** that the speaker recite the arc in five sentences, to find where they hesitate. If they decline, carry on.
- Finish by listing what remains `❓` or `✏️`, and say that the next step is `/keynote-deck <slug>` once the speaker accepts the esquema.

## Iterate

With an existing `esquema.md`, the markers are the state: whatever carries no `✏️` or `❓` is decided, whoever wrote it.

When the file is tracked by git, read `git diff HEAD -- docs/keynotes/<slug>/esquema.md` as a hint: for each edit the speaker made to text still marked `✏️` or `❓`, ask in the first grilling round whether it is now decided, recommending yes. An untracked file has only its markers.

Reopen grilling only for what is still `❓` or `✏️` and for whatever depends on a change by the speaker. Dependency order: **thesis (with `Refuta:` and `Solo yo:`) → {audience, takeaway} → arc (with demos) → out of scope**. A change reopens itself and what hangs from it; the rest stays as it is. A changed `ritmo` only recomputes the budget.
