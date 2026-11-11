---
name: keynote-pptx
description: Build a keynote's .pptx from its deck.md on the event template, with speaker notes, images and reveal steps.
disable-model-invocation: true
argument-hint: <slug> ["direction notes"]
---

# Keynote pptx

Build `docs/keynotes/<slug>/<title-in-kebab-case>.pptx` from `deck.md`, from scratch, on the keynote's `template.pptx`. The build is yours to design: the template decides the look where its samples fit, and you compose with judgement where they fall short. Afterwards the speaker polishes the `.pptx` by hand in PowerPoint; a later run rebuilds it from scratch.

- Deck contract: [`../keynote-deck/references/deck-format.md`](../keynote-deck/references/deck-format.md).
- Template mapping: `docs/keynotes/<slug>/template-map.md`, format in [`references/template-map-format.md`](references/template-map-format.md).
- Visual identity: `docs/keynotes/<slug>/style.md`, format in [`../keynote-images/references/style-format.md`](../keynote-images/references/style-format.md).

Arguments: `<slug>` and optional direction notes, which outrank your own assumptions.

**Python** below means `uv run --no-project --with python-pptx --with defusedxml --with lxml --with pillow python`, with `PYTHONUTF8=1` set on Windows. `<pptx-dir>` is the base directory of `anthropic-skills:pptx`; `<this-skill-dir>/scripts/` holds this skill's helpers.

## Requirements

- `anthropic-skills:pptx` installed. If it is missing, say so and stop.
- `node <this-skill-dir>/../keynote-deck/scripts/validate-deck.mjs` exits 0 on `deck.md`.
- `template.pptx` in the keynote folder. With only a `style.md`, build a structured deck with pptxgenjs as `anthropic-skills:pptx` describes, its theme taken from `style.md`, and skip the template steps. With neither, ask the speaker how to proceed and stop.
- PowerPoint for visual QA (`scripts/export-slides.ps1`). Without it, build anyway and say that visual QA was skipped.

## 1. Load context

- Invoke `anthropic-skills:pptx` and follow its template-editing path and its QA.
- If the output `.pptx` already exists and is newer than `deck.md`, the speaker has polished it by hand: ask before overwriting it.
- Read `deck.md`, `evento.md`, `style.md`, `template-map.md` if it exists, and the validator's count of visible changes.

## 2. Map the template

Skip this step when `template-map.md` is confirmed.

- Render the template: `pwsh -File <this-skill-dir>/scripts/export-slides.ps1 -Pptx <template> -OutDir <temp dir>`, and look at `grid.png` and the samples you need at full size.
- List the samples' shapes: `Python <this-skill-dir>/scripts/shapes.py <template> <slide numbers> --by-size --min-area 1`.
- Draft `template-map.md`: the event frame, one row for every slide type the deck uses, the chrome, and the sample text that must not survive.
- If `evento.md` has no `### Speaker` section and the frame has a speaker slide, ask the speaker in one round for name, role, company, communities, a one-line quote and a photo path; append the section to `evento.md`.

Done when the speaker has confirmed `template-map.md`.

## 3. Plan the slides

Write down the output order: the event frame, then each deck slide on its sample, with the duplicates its `[+]` steps need. A deck that opens with a `title` slide fills the cover; it does not appear twice.

Done when every output slide has its position, its sample and its source deck slide.

## 4. Build the structure

Work on a copy unpacked in a temp folder, outside the repo:

- Duplicate each sample once per deck slide that uses it, in order: `Python <pptx-dir>/scripts/add_slide.py <unpacked> slideN.xml --after <previous>`.
- Set `<p:sldIdLst>` to the planned order, drop the unused samples, then `Python <pptx-dir>/scripts/clean.py <unpacked>`.

Step duplicates wait until step 6.

## 5. Fill the content

- Fill each slide from its deck slide, through the shapes the map names, following the "When filling in a template" rules of `anthropic-skills:pptx`. Remove what the map lists under `Remove`, with whole groups.
- Slide text comes only from `deck.md`: no wording of your own, and no `::: notes` on the slide.
- Where the sample falls short (a `stat`, a `quote`, a `code` slide), compose on its frame with the `style.md` palette and the pptx skill's Design Ideas.

Done when every slide carries its deck content and nothing from the map's sample text.

## 6. Expand reveal steps

For a slide with `k` `[+]` steps, duplicate the **filled** slide `k` times with `add_slide.py --after`, so the build runs from the first state to the full one. On each earlier state, hide what has not been revealed yet: a paragraph keeps its place with its runs' fill at `<a:alpha val="0"/>`; a whole shape takes `hidden="1"` on its `<p:cNvPr>`. Template items are rarely grouped: a card's corner brackets and icon are loose shapes on its area, so hide every shape the item covers, and check the render. The last state shows everything.

## 7. Pack, images and notes

- `Python <this-skill-dir>/scripts/pack.py <unpacked> <out.pptx>`.
- `Python <this-skill-dir>/scripts/place_images.py <out.pptx> images.json`: each resolved `src:` into its frame; each placeholder as a red TODO box with its description; the speaker photo.
- `Python <this-skill-dir>/scripts/add_notes.py <out.pptx> notes.json`: each slide's `::: notes`, then its `::: script` under a `SCRIPT` line, repeated on every step duplicate. The event frame takes no notes.

## 8. QA

- `Python <pptx-dir>/scripts/office/validate.py <out.pptx> --original <template.pptx>` passes.
- `Python <pptx-dir>/scripts/slide_text.py <out.pptx>`: every line of `deck.md` slide text is present, and no string from the map's sample text survives.
- `export-slides.ps1` on the output, then inspect every PNG with fresh eyes (a subagent works well): overflow, overlap, contrast, titles drifting between slides of one type, TODO boxes where expected. Fix, rebuild, and export again.

Done when validation passes, the text check is clean, and the visual pass finds no defect you can fix.

## 9. Report

Give the path, the number of slides and visible changes against the esquema's budget, the TODO boxes still open, every `VERIFY:` in the notes, and any QA caveat (a font PowerPoint substituted, a slide you composed rather than filled). Remind the speaker that hand edits in PowerPoint are theirs, and that a rebuild from `deck.md` starts from scratch.
