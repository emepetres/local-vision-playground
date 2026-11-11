# The `deck.md` format contract

The renderer-agnostic content contract every `deck.md` conforms to. It carries only what a slide **is** and what it **contains**: never how it renders, never how the talk was decided. `keynote-images`, `keynote-pptx` and any future renderer read this same file.

The litmus for every field: **would three very different renderers (a `.pptx` built from a template, a print-to-PDF, a static HTML page) each need it to show the same content?** If yes, it is in the contract. If it only serves one rendering technique, or only describes the authoring process, it lives elsewhere: thesis, arc and pacing in `esquema.md`, colours and fonts in `style.md`, the template mapping in `template-map.md`.

The canonical conformant deck is [`example-deck.md`](example-deck.md): it exercises all eleven types and doubles as the validator's passing fixture. Read it alongside this contract.

## File shape

- UTF-8 markdown, `\n`-normalised.
- Opens with **one deck-level YAML frontmatter block** fenced by `---` / `---`.
- A line of exactly `---` **separates slides**.
- Each slide's **leading run of `key: value` lines is its per-slide frontmatter, terminated by the first blank line**: the one unambiguous rule. The remainder of the slide is body markdown. Never count fences.

## Deck-level frontmatter

Exactly three keys, nothing else:

| key | meaning |
|---|---|
| `title` | the talk title (required) |
| `language` | `en` \| `es`: the language of the *spoken* content in `::: notes` / `::: script`; defaults to `en`. Slide text may be in another language |
| `accent` | a hex colour, the one visual concession; taken from `style.md` when it exists |

## Per-slide frontmatter

The leading run of single-line `key: value` pairs, terminated by the first blank line. Must include `type:`. A blank line in the middle of the run splits it: the keys after the blank land in the body and the deck is malformed.

Recognised keys: `type` (required), `src`, `alt`, `link`, `file`, `poster`.

- **`link:`**: optional on **any** slide, a URL the room can act on (e.g. a poll). Not a slide type.

## Slide types: closed, eleven

`type:` is required, with **no default**: the type owns the layout, so a missing type is a real gap. The vocabulary is **closed**: a new type is a skill edit (an entry here, in the validator and in every renderer's mapping), never a per-deck custom type. `voice.md` may *forbid* a type, never *define* one.

`title`, `section`, `statement`, `bullets`, `quote`, `stat`, `image`, `code`, `comparison`, `video`, `demo`

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
| `demo` | `# Demo name` + one line with what it proves | — |

A `demo` slide stays on screen while the speaker drives the live demo; its `::: notes` carry the cues and the fallback.

## Reveal steps

A `[+]` prefix on a line or block marks the **start of a new reveal step**, used identically in every type. Bullets are **static** unless written `- [+]`: nothing reveals behind the speaker's back. Reveal *boundaries* live in the format so the pace budget can count visible changes; seconds never do.

## Regions: the `:::` construct

One general construct: `::: name` opens, a bare `:::` closes. Every open needs a close.

- **`::: notes`** and **`::: script`** are **reserved**, multi-line, **stripped from the rendered slide**, and fed to the speaker notes in the deck's `language`. `notes` are terse cues; `script` is a full read-aloud.
- Any **other** name is a **labelled content group**, used by `comparison` (`::: Clever` / `::: Plain`). The author states the semantics; the renderer chooses side-by-side or stacked.

## Media references

Opaque **relative-path strings** (`src: images/system-map.png`). The format defines no on-disk-existence rule and no folder layout.

An unresolved image or video is a **placeholder**, classified by who makes it:

- `src: !todo "draw: <what the diagram shows>"`: a diagram `keynote-images` can author.
- `src: !todo "capture: <what to screenshot or record>"`: a screenshot or recording the speaker takes from the real system.
- `src: !todo "provide: <what the picture shows>"`: a photo or illustration the speaker supplies.

The description is required, quoted, and carries no inner double quotes. A deck can be drafted before its art exists; the validator flags malformed placeholders, and `keynote-pptx` renders each one as a visible TODO box.

## Validation

`scripts/validate-deck.mjs` checks **well-formedness only**: deck frontmatter parses (three keys, valid `language`/`accent`); every slide has a known `type:`; `image`/`video` carry `src:`; `:::` regions balance; media refs are well-formed, placeholders included; no per-slide frontmatter run is split by a blank line. Prose, voice, thesis, arc and pacing are the speaker's to judge.
