# `esquema.md` format

One page, in Spanish: everything above `## Decisiones` fits on one screen-read. Each section takes 1 to 3 lines; the arc is a table. The speaker reads, edits by hand and diffs the file, so its structure stays stable. Headings, field names and status markers stay exactly as below.

## Template

```markdown
# <Título de la keynote> — esquema

<evento> · <fecha y hora, o "fecha/hora: sin confirmar"> · <duración> min · nivel <n> · ritmo ~35 s/cambio

## Tesis
> <la afirmación, con las palabras literales del ponente>

Refuta: <la creencia de la sala que la tesis desmonta>
Solo yo: <la medida, el fallo o la comparación que solo este ponente tiene>

## Audiencia ✏️
<quién está en la sala y qué cree ya>

## Takeaway ✏️
<lo único concreto que alguien puede hacer o entender al salir>

## Arco
Portador: <objeto, frase o imagen que se repite>  ·  Giro: fila <n>

| # | Sección | Min | Qué cuenta | Estado |
|---|---------|-----|------------|--------|
| 1 | Apertura | 3 | <una línea> | ✅ decidido |
| 2 | Demo D1: <qué se ejecuta> | 4 | prueba <X> | ✏️ propuesta |
| 3 | <sección> | 6 | <una línea> | ❓ abierto |

Presupuesto: <duración> − 5 de colchón − 1 de marco del evento = <útiles> min útiles. Demos: <n> min.
Cambios visibles: (<útiles> − <demos>) × 60 / <ritmo> ≈ <n>.

## Promesas del abstract
- <promesa> → fila <n>
- <promesa> → fuera de alcance
- <promesa> → ⚠️ sin sitio

## Fuera de alcance ✏️
<lo que la charla no cubre>

## Decisiones
- <AAAA-MM-DD> — Descartado <alternativa>: <por qué perdió>
```

The `− 1 de marco del evento` term appears only when the keynote folder holds a `template.pptx`.

## Header

The second line carries the slot and the pace. `ritmo ~<n> s/cambio` is the one field the skill parses: the speaker edits the number to change the pace, and the skill recomputes the budget from it.

## Status markers

The markers are the state of the file. Whatever carries no marker is decided, whoever wrote it.

- **Arc rows**, `Estado` column: `✅ decidido`, `✏️ propuesta` (drafted by the skill, not yet signed off by the speaker) or `❓ abierto` (nobody has decided).
- **Audience, takeaway, out of scope**: a `✏️` suffix on the heading marks a proposal. The speaker accepts by removing it.
- **Thesis**: a literal quote of the speaker, with its `Refuta:` and `Solo yo:` lines in the speaker's words. Any of the three missing is shown as `❓` in its place.

## Arc rules

- **Demos** take their own row, `Demo D<n>: <what runs>`, with their minutes in `Min` and what they prove for the thesis in `Qué cuenta`. A demo that proves nothing for the thesis is dropped.
- **Minutes**: the rows sum to the useful minutes or less. Demo minutes are the sum of the demo rows.
- **Carrier**: one object, phrase or image that recurs through the talk and that the argument rides on.
- **Turn**: the row where the room changes its mind. It starts between one third and two thirds of the useful minutes, counting the minutes of the rows before it.
- **Promises**: each concrete promise of the `evento.md` abstract lands on a row or goes out of scope. One with neither is listed as `⚠️ sin sitio`.

The speaker judges these rules at sign-off; the skill checks them and flags deviations without blocking.

## Decisions

Newest first, dated. Each dropped alternative carries its reason. The section only grows: append, never rewrite.
