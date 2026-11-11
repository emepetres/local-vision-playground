# `style.md` format

A keynote's visual identity in one short file: `docs/keynotes/<slug>/style.md`. `keynote-images` drafts it from `template.pptx` (or the speaker writes it by hand when there is no template), the speaker confirms it, and from then on it is read by:

- `keynote-images`: the palette, fonts and canvas of every diagram;
- `keynote-deck`: the deck's `accent:`;
- `keynote-pptx`: the theme of a deck built without a template.

The speaker's hand edits are authoritative; the skills never regenerate a confirmed `style.md`.

## Template

```markdown
# <talk title> — style

Source: <template.pptx, extracted AAAA-MM-DD | written by hand>

## Colours

| Role | Hex | Use |
|------|-----|-----|
| background | #12304F | slide and diagram background |
| surface | #1A3961 | boxes and cards |
| line | #3E5D81 | borders and connectors |
| text | #F7FAFF | main text |
| muted | #A2B6CD | secondary text, labels |
| accent | #0078D4 | the one emphasis colour; the deck's `accent:` |
| highlights | #F25022 #7FBA00 #00BCF2 #FFB900 | categories, at most two per image besides the accent |

## Fonts

| Role | In the template | In diagrams (SVG `font-family`) |
|------|-----------------|---------------------------------|
| heading | Aptos Display | "Aptos Display", "Segoe UI Semibold", sans-serif |
| body | Aptos | Aptos, "Segoe UI", sans-serif |
| code | Consolas | Consolas, monospace |

## Images

- Canvas: <1920x1080, opaque, full slide | WxH, transparent, to fit the template's image frame>
- Motif: <the recurring visual element, e.g. rounded frames with a glow on the focal element>
```

## Rules

- **Roles, not raw colours.** Every colour a diagram uses comes from this table by role.
- **Fonts the rasterizer can see.** The diagram stack names the template font first and an installed system font after it. Office cloud fonts (Aptos is one) are invisible to the browser that rasterizes the SVG, so the fallback is what the PNG shows; choose it close in width.
- **Canvas from the template.** When the template places images inside a frame, the canvas takes the frame's aspect ratio and a transparent background, so the template's own background shows around the drawing. Without a frame, the canvas is the full 1920x1080 slide.
