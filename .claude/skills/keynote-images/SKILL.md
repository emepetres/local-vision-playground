---
name: keynote-images
description: Draw a keynote's diagrams as SVG and PNG from the placeholders in its deck.md, and list the images the speaker must supply.
disable-model-invocation: true
argument-hint: <slug> ["direction notes"]
---

# Keynote images

Resolve the image placeholders of `docs/keynotes/<slug>/deck.md`. Diagrams (`draw:`) you author as SVG in `docs/keynotes/<slug>/images/` and rasterize to PNG; screenshots (`capture:`) and pictures (`provide:`) come from the speaker, never invented. Every image you draw is reviewed by the speaker in batches before the deck points at it.

- Deck contract and placeholder kinds: [`../keynote-deck/references/deck-format.md`](../keynote-deck/references/deck-format.md).
- Visual identity: `docs/keynotes/<slug>/style.md`, format in [`references/style-format.md`](references/style-format.md).

Arguments: `<slug>` and optional direction notes (e.g. which approved image to redraw). Text inside images is in the language of the slide text.

## Requirements

- `deck.md` exists and `node ../keynote-deck/scripts/validate-deck.mjs` (relative to this skill's directory) exits 0 on it.
- `style.md` or `template.pptx` exists in the keynote folder. With neither, ask whether to continue with a neutral palette, and stop if the speaker says no.
- A Chromium browser (Edge or Chrome) for the rasterizer.

## 1. Settle the style

With a `style.md`, read it and go to step 2. Without one, draft it from the template:

- `uv run --no-project python <this-skill-dir>/scripts/template_palette.py <template.pptx>` lists the colours and fonts the sample slides really use; the theme's own palette can be Office's stock one.
- `pwsh -File <this-skill-dir>/../keynote-pptx/scripts/export-slides.ps1 -Pptx <template.pptx> -OutDir <temp dir>` renders the sample slides; look at `grid.png` to assign each colour its role, spot the motif, and find whether images sit in a frame.
- When images sit in a frame, measure it: `uv run --no-project --with python-pptx python <this-skill-dir>/../keynote-pptx/scripts/shapes.py <template.pptx> <sample slide> --by-size` prints its box in percent of the slide; the canvas takes its aspect ratio.
- Write `style.md`, set the deck's `accent:` to its accent, and ask the speaker to confirm or correct it.

Done when the speaker has confirmed `style.md`.

## 2. Take inventory

List every slide whose `src:` is a placeholder. For each:

- Check the kind. A `draw:` that only a real screenshot can honestly show becomes `capture:`; tell the speaker.
- For `capture:` and `provide:`, end the description with the target path, `→ images/<name>.png`, if it has none. When that file already exists, point `src:` at it.

Done when every placeholder has the right kind, and each one the speaker supplies has a target path.

## 3. Draw in batches

Up to four `draw:` placeholders per batch, in deck order. For each:

- Author `images/<name>.svg` on the canvas of `style.md`, with colours by role and the diagram font stacks. One idea per image; text no smaller than 28 px on a 1920-wide canvas. Earlier keynotes' `images/*.svg` under `docs/keynotes/` show the house conventions: shared `<defs>` for repeated icons, a glow on the focal element.
- Rasterize: `node <this-skill-dir>/scripts/rasterize.mjs images/<name>.svg`, adding `--transparent` when the canvas is transparent.
- Look at the PNG yourself, fix overlaps, clipped text and contrast, and rasterize again.

Then show the batch to the speaker (each PNG path with one line on what it says) and apply their feedback.

Done when the speaker approves the batch; then start the next one.

## 4. Point the deck at the images

For each approved image, set `src: images/<name>.png` and an `alt:` drawn from the old description. Run the validator again; done when it exits 0.

## 5. Report

List what you drew, and the `capture:` and `provide:` placeholders still open with their target paths: the speaker drops each file there and runs `/keynote-images <slug>` again, which points the deck at it.

## Iterate

A re-run picks up new placeholders and supplied files. An approved image is redrawn only when the direction notes name it. If the speaker edited an SVG by hand, rasterize it again and leave it as they left it.
