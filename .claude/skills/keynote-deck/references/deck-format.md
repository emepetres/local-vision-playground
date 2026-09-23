# The `deck.md` format contract

The renderer-agnostic content contract every `deck.md` conforms to. It carries only what a slide **is** and what it **contains** — never how it renders, never how the talk was decided. A future renderer, a rehearse tool, or a reuse tool all read this same file; none is assumed here.

The litmus for every field: **would three very different renderers — a React deck, a print-to-PDF, a dumb static-HTML fallback — each need this to show the same content?** If yes, it is in the contract. If it only serves one rendering technique, or only describes the authoring process, it lives in [`beat-sheet.md`](beat-sheet-format.md) instead. Authoring state (thesis, arc, profile, pacing, cut plan) fails the litmus by construction, which is why `deck.md` never carries it.

The canonical conformant deck is [`example-deck.md`](example-deck.md) — it exercises all ten types and doubles as the validator's passing fixture. Read it alongside this contract.

## File shape

- UTF-8 markdown, `\n`-normalised.
- Opens with **one deck-level YAML frontmatter block** fenced by `---` / `---`.
- A line of exactly `---` **separates slides**.
- Each slide's **leading run of `key: value` lines is its per-slide frontmatter, terminated by the first blank line** — the one unambiguous rule. The remainder of the slide is body markdown. Never count fences.

## Deck-level frontmatter

Exactly three keys, nothing else:

| key | meaning |
|---|---|
| `title` | the talk title (required) |
| `language` | `en` \| `es` — the language of the *spoken* content in `::: notes` / `::: script`; defaults to `en` |
| `accent` | a hex colour — the single sanctioned theming hook, *the one visual concession*; every other visual concern belongs to the renderer |

No `profile`, `steps`, `thesis`, `speaking-rate`, `cut`, or `slot-overrides`. Those are authoring judgment or pacing, and live in `beat-sheet.md` or the render skill.

## Per-slide frontmatter

The leading run of single-line `key: value` pairs, terminated by the first blank line. Must include `type:`. A blank line in the middle of the run splits it — the keys after the blank land in the body and the deck is malformed.

Recognised keys: `type` (required), `src`, `alt`, `link`, `file`, `poster`. (No `highlight:` — per-step highlighting is renderer magic, not part of the contract.)

- **`link:`** — optional on **any** slide: a URL the room can act on (e.g. a poll). Not a slide type.

## Slide types — closed, ten

`type:` is required, with **no default** (the type owns the layout, so a missing type is a real gap). The vocabulary is **closed**: a new type is a skill edit — a new component and an entry here — never a per-deck custom type. `voice.md` may *forbid* a type, never *define* one.

`title`, `section`, `statement`, `bullets`, `quote`, `stat`, `image`, `code`, `comparison`, `video`

### Per-type body conventions

| type | body | fields |
|---|---|---|
| `title` | `# Talk title` + a subtitle paragraph | — |
| `section` | `# Section name` | — |
| `statement` | `# one big line`, optional `[+]` payoff line | — |
| `bullets` | `## heading` + `-` items (fragments); reveal per item with `- [+]` | — |
| `quote` | `> quote` + `— attribution` | — |
| `stat` | `# <number>` (h1 = the figure) + a short label line | — |
| `image` | optional caption paragraph | `src:` **required**, `alt:` optional |
| `code` | one fenced code block | `file:` optional (source path) |
| `comparison` | two or more labelled `::: Group … :::` regions | — |
| `video` | optional caption paragraph | `src:` **required**, `poster:` optional |

## Reveal steps

A `[+]` prefix on a line or block marks the **start of a new reveal step**, used identically in every type. Bullets are **static** unless written `- [+]` — nothing reveals behind your back. Reveal *boundaries* live in the format so a rehearse tool can count steps; **seconds-per-step never do** — that is pacing, owned by the render/rehearse skill.

## Regions — the `:::` construct

One general construct: `::: name` opens, a bare `:::` closes. Every open needs a close.

- **`::: notes`** and **`::: script`** are **reserved**, multi-line, **stripped from the rendered slide**, and fed to the speaker-facing surface in the deck's `language`. `notes` are terse cues; `script` is a full read-aloud.
- Any **other** name is a **labelled content group**, used by `comparison` (`::: Clever` / `::: Plain`). The author states the semantics; the renderer chooses side-by-side or stacked.

(The construct exists partly because multi-line notes and scripts cannot live in blank-line-terminated frontmatter.)

## Media references

Opaque **relative-path strings** (`src: assets/demo.mp4`). The format defines **no** on-disk-existence rule and **no** folder layout — resolution, packaging, and inlining are the build/renderer's job.

An unresolved image or video is a placeholder: **`src: !todo "what the art should show"`** — the description is required and quoted, so a deck can be drafted before its art exists and the validator flags the gap.

## What the format does NOT carry

Structure and semantics only. **Prose style** — word-count medians, bullet caps, voice, register, profiles — is **not** in the contract; it is authoring judgment (see [`voice.md`](voice.md) and the arc gate). This keeps the contract renderer- *and* process-agnostic.

## Validation

`scripts/validate-deck.mjs` checks **well-formedness only** and is the single automated seam: deck frontmatter parses (three keys, valid `language`/`accent`); every slide has a known `type:`; `image`/`video` carry `src:`; `:::` regions balance; media refs are well-formed (including the `!todo` sentinel); no per-slide frontmatter run is split by a blank line. It does **not** judge prose, voice, thesis, arc, or pacing — those are the human's at sign-off.
