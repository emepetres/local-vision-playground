---
name: keynote-demo-script
description: Write a keynote's demo-script.md, the short run sheet the speaker reads on stage, from the demo slides of its deck.md, or revise it.
disable-model-invocation: true
argument-hint: <slug> ["direction notes"]
---

# Keynote demo script

Turn the `demo` slides of `docs/keynotes/<slug>/deck.md` into `docs/keynotes/<slug>/demo-script.md`: the run sheet the speaker glances at mid-talk to know what to prepare, what to paste and what to wait for. It is read live, so **terse** rules every line: one action per line, no explanations, no reasons. The deck says what each demo proves; this file only says how to run it.

File contract: [`references/demo-script-format.md`](references/demo-script-format.md).

Arguments: `<slug>` and optional direction notes, which outrank your own assumptions. Prose is written in the language the talk is delivered in, which the deck's `language:` names; commands and typed text stay verbatim.

## Requirements

- `mattpocock-skills:grilling` installed. If it is missing, say so and stop.
- `node <this-skill-dir>/../keynote-deck/scripts/validate-deck.mjs docs/keynotes/<slug>/deck.md` exits 0. Otherwise point the speaker to `/keynote-deck <slug>` and stop.
- The deck has at least one `type: demo` slide. With none, say there is nothing to run and stop.

## 1. Load context

- `deck.md`: every `demo` slide in order, with its title, the slide before it, and its `::: notes` (commands, typed questions, the beat, the plan B). The deck is the source of truth for order and commands.
- `esquema.md` if it exists: the demo rows, only to name each demo.
- `demo-script.md` if it exists: read it as [Iterate](#iterate) says.
- Other keynotes' `demo-script.md` under `docs/keynotes/`: the preparation they needed, which this talk's demos likely need too.
- The repo facts each demo leans on: the physical setup docs (fixtures, README), and every command's real interface. Run its `--help` or read its entry point, and check each flag and each named model or variant exists.

Done when every demo has its commands checked against the repo, and every fact the run needs is either found or written down as a doubt.

## 2. Draft the whole script

- **Preparation**, from what the demos need: everything that must run once on network (dependencies, models, builds, caches), then the checks just before going on (notifications, network blocks, empty logs, fonts, apps closed, plan B files on disk).
- **Layout**: the cameras and their indexes, the terminal panes and where each one sits.
- **One section per demo**, in deck order: setup, the commands with their pane, the numbered beat with the signal that triggers each next action, and the plan B.
- Collect as **doubts** what the repo cannot tell: who plays which role, which camera index, where the fallback video lives, a command in the notes that does not match the repo.

Done when every demo slide has its section and every line fits the format's length rules.

## 3. Resolve doubts

If you collected doubts, invoke `mattpocock-skills:grilling` for one round with all of them, each with your recommendation, and apply the answers. What stays unanswered is marked `❓` in place. A command mismatch is reported, never fixed in the deck: the speaker fixes `deck.md`, or chooses which one wins in the script.

## 4. Check and report

Check the length rules of the format and flag each overrun. Then report:

- The path, the line count, and the demos covered.
- Every `❓` still open.
- Every mismatch between the deck's notes and the repo.

## Iterate

With an existing `demo-script.md`, the speaker's hand edits are authoritative: leave every line they touched as they left it. When the file is tracked by git, `git diff HEAD` shows which ones.

- With direction notes, change only what they target.
- Without them, reconcile against the deck: demos added, dropped or reordered, and changed commands. Propose each change and apply what the speaker approves.

Then run step 4 again.
