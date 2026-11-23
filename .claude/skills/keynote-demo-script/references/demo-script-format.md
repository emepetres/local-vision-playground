# `demo-script.md` format

A run sheet read live, on a second screen, by a speaker who is also talking. Rendered as markdown; the speaker copies commands and typed questions straight out of it.

## Length rules

- Each demo section fits in one screen: **20 lines** or fewer, rendered.
- The whole file stays at **120 lines** or fewer.
- One action per line, imperative, no subordinate clauses. No reasons, no "what it shows": those live in the deck.

## Copy rules

- Everything the speaker pastes, a command or a typed question, sits alone in its own fenced block, with no comments inside.
- Commands are written for the shell the speaker uses, with relative paths from the pane's directory.

## Expected output

Write what should appear only when it is a **signal**: what the speaker waits for before the next action (`wait for #1`, `pane B: no gloves: 1/2`), or a number they point at aloud. Never describe the full output.

## Template

Headings in the delivery language; this template shows them in English.

````markdown
# <Talk title> — demo script

<event> · <date and time> · shell: <shell>

## Preparation

### The day before, on network
- [ ] <one action or check>

### Before going on
- [ ] <one action or check>

## Layout

| Camera | Index | Demos |
|--------|-------|-------|
| <camera> | `0` | D1, D3 |

- **Pane A** — `<directory>` — <demos>

---

## D1 · <demo title> · after "<title of the slide before>"

**Setup**
- <physical setup, one item per line>
- Pane A

**Run** · pane A
```
<command>
```

**Do**
1. <action> → <signal>
2. Type:
```
<question>
```

**Plan B** · <one line>
````

## Markers

`❓` marks a fact nobody confirmed (a camera index, a file path). The speaker resolves it by hand or on the next run.
