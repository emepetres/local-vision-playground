# `template-map.md` format

How one keynote's `deck.md` lands on its `template.pptx`: `docs/keynotes/<slug>/template-map.md`. `keynote-pptx` drafts it the first time from the template's renders and shape listings; the speaker confirms it; later builds reuse it as it stands. The speaker's hand edits are authoritative.

Event templates are often sample decks rather than layout sets: most slides sit on a blank layout with their design drawn in free shapes. So each slide type maps to a **sample slide** that is duplicated and filled, and each part of the slide maps to a **shape by name**.

## Template

```markdown
# <talk title> — template map

Template: template.pptx · Confirmed: <AAAA-MM-DD | no>

## Event frame

| Position | Sample | Fill |
|----------|--------|------|
| first | 1 (cover) | 'TextBox 3' ← deck title · 'TextBox 5' ← subtitle |
| 2 | 2 (speaker) | from `### Speaker` in evento.md · photo → 'Marco Foto' |
| 3 | 4 (sponsors) | as is |
| before last | 21 (sponsors) | as is |
| last | 22 (Q&A) | as is |

## Slide types

| Type | Sample | Shape ← content | Remove |
|------|--------|-----------------|--------|
| bullets | 18 | 'TextBox 44' ← section · 'TextBox 45' ← heading · 'Lista' ← items | 'TextBox 46' |
| image | 19 | 'TextBox 44' ← section · 'TextBox 45' ← caption · picture → 'Marco Gráfico' | 'TextBox 46', 'Gráfico' |
| demo | 14 | 'TextBox 45' ← name · 'TextBox 50' ← what it proves | — |
| stat | 17, composed | big figure and label drawn on the free area | 'TextBox 46' |

## Chrome

Kept untouched on every slide: <shape names, e.g. 'CHROME_path', 'CHROME_telemetry', logos>.

## Sample text

Strings from the template that must never survive in the built deck: <"TITULO SECCION", "NOMBRE APELLIDOS", "Pega aquí", …>.
```

## Rules

- **Every type the deck uses has a row.** A type with no fitting sample says `composed` and names the sample whose frame it borrows; the agent composes the content on it.
- **Shapes by name, as `shapes.py` prints them**, quoted. A part the deck slide does not fill goes under `Remove`, with every shape that belongs to it: an empty text box left behind is a defect.
- **Items are rarely grouped.** A card's corner brackets, icons and numbers are loose shapes sitting on its area; `shapes.py` without `--min-area` lists them. A repeated item (card, column, list row) names all its shapes, so it can be removed, or hidden for a reveal step, as one.
- **`section`** in a fill means the name of the arc section the slide belongs to, for templates that carry a small kicker label.
- **Pictures go into frames** (`picture → '<frame>'`): `place_images.py` fits each PNG inside that shape's box. The frame's aspect ratio is also the canvas `style.md` gives `keynote-images`.
