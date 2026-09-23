#!/usr/bin/env node
// Well-formedness validator for a keynote-deck `deck.md`.
//
// Renderer-agnostic contract only: it checks that a deck is STRUCTURALLY sound,
// never that the prose is good. Word counts, voice, thesis, arc and pacing are
// authoring judgment — carried by the agent and the human sign-off in
// beat-sheet.md, never by this script. Node stdlib, zero dependencies.
//
// CLI:  node validate-deck.mjs <deck.md>   → exit 0 (clean) or 1 (faults printed)
// API:  import { validateDeck } from "./validate-deck.mjs"
//       validateDeck(text) → { ok: boolean, errors: [{ slide, message }] }

const SLIDE_TYPES = new Set([
  "title", "section", "statement", "bullets", "quote",
  "stat", "image", "code", "comparison", "video",
]);
const DECK_KEYS = new Set(["title", "language", "accent"]);
// Per-slide frontmatter keys the format recognises. A body line that opens with
// one of these is the signature of a frontmatter run split by a stray blank line.
const SLIDE_KEYS = new Set(["type", "src", "alt", "link", "file", "poster"]);
const REQUIRES_SRC = new Set(["image", "video"]);

const KEY_LINE = /^([A-Za-z][\w-]*):(?:\s+(.*))?$/;

// Strip one layer of matching quotes from a scalar value.
function unquote(v) {
  const t = v.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  return t;
}

// A media reference is opaque (relative path) unless it uses the !todo sentinel,
// which must carry a quoted description: !todo "what the art should show".
function checkMediaRef(key, raw, slideNo, errors, label) {
  const v = raw.trim();
  if (v === "") {
    errors.push({ slide: slideNo, message: `${label}: \`${key}:\` is empty` });
    return;
  }
  if (v.startsWith("!")) {
    if (!/^!todo\s+"[^"]+"\s*$/.test(v)) {
      errors.push({
        slide: slideNo,
        message: `${label}: malformed placeholder in \`${key}:\` — expected \`!todo "description"\`, got \`${v}\``,
      });
    }
  }
}

// Split the document into the deck-level frontmatter block and the raw slide chunks.
// Structure: `---` / <deck fm> / `---` then slides separated by a line of exactly `---`.
function splitDeck(text) {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  if (lines[0]?.trim() !== "---") {
    return { error: "deck must open with a `---` frontmatter fence on line 1" };
  }
  let close = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") { close = i; break; }
  }
  if (close === -1) {
    return { error: "deck frontmatter is never closed by a second `---`" };
  }
  const frontmatter = lines.slice(1, close);
  // Everything after the closing fence, split on lines that are exactly `---`.
  const rest = lines.slice(close + 1);
  const slides = [];
  let current = [];
  for (const line of rest) {
    if (line.trim() === "---") {
      slides.push(current);
      current = [];
    } else {
      current.push(line);
    }
  }
  slides.push(current);
  return { frontmatter, slides };
}

function validateDeckFrontmatter(fmLines, errors) {
  let hasTitle = false;
  for (const line of fmLines) {
    if (line.trim() === "") continue;
    const m = line.match(KEY_LINE);
    if (!m) {
      errors.push({ slide: 0, message: `deck frontmatter line is not \`key: value\`: \`${line}\`` });
      continue;
    }
    const key = m[1];
    const val = unquote(m[2] ?? "");
    if (!DECK_KEYS.has(key)) {
      errors.push({
        slide: 0,
        message: `deck frontmatter carries \`${key}:\` — only title, language, accent are allowed (no process or pacing fields)`,
      });
      continue;
    }
    if (key === "title") hasTitle = true;
    if (key === "language" && !["en", "es"].includes(val)) {
      errors.push({ slide: 0, message: `deck \`language:\` must be en or es, got \`${val}\`` });
    }
    if (key === "accent" && !/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val)) {
      errors.push({ slide: 0, message: `deck \`accent:\` must be a hex colour, got \`${val}\`` });
    }
  }
  if (!hasTitle) errors.push({ slide: 0, message: "deck frontmatter is missing required \`title:\`" });
}

// Per-slide frontmatter = the leading run of `key: value` lines, terminated by
// the first blank line (the one unambiguous rule). Everything after is body.
function parseSlide(slideLines) {
  let start = 0;
  while (start < slideLines.length && slideLines[start].trim() === "") start++;
  const fm = {};
  const fmRaw = [];
  let i = start;
  for (; i < slideLines.length; i++) {
    const line = slideLines[i];
    if (line.trim() === "") break; // blank line terminates frontmatter
    const m = line.match(KEY_LINE);
    if (!m) { break; } // a markdown line before any blank: frontmatter ends here
    fm[m[1]] = unquote(m[2] ?? "");
    fmRaw.push(line);
  }
  const body = slideLines.slice(i);
  return { fm, body, empty: fmRaw.length === 0 && body.every((l) => l.trim() === "") };
}

function validateSlide(slideLines, slideNo, errors) {
  const { fm, body, empty } = parseSlide(slideLines);
  if (empty) return; // trailing blank chunk after a final `---`

  const type = fm.type;
  if (type === undefined) {
    errors.push({ slide: slideNo, message: "slide has no \`type:\` in its frontmatter" });
  } else if (!SLIDE_TYPES.has(type)) {
    errors.push({
      slide: slideNo,
      message: `unknown slide \`type: ${type}\` — the vocabulary is closed (${[...SLIDE_TYPES].join(", ")})`,
    });
  }

  // A recognised frontmatter key appearing in the body means the frontmatter run
  // was split by a stray blank line — the leading run stopped early.
  for (const line of body) {
    const m = line.match(KEY_LINE);
    if (m && SLIDE_KEYS.has(m[1])) {
      errors.push({
        slide: slideNo,
        message: `frontmatter key \`${m[1]}:\` appears in the slide body — a blank line likely split the frontmatter run`,
      });
      break;
    }
  }

  if (REQUIRES_SRC.has(type) && fm.src === undefined) {
    errors.push({ slide: slideNo, message: `\`${type}\` slide requires a \`src:\` field` });
  }
  if (fm.src !== undefined) checkMediaRef("src", fm.src, slideNo, errors, `${type ?? "slide"} slide`);
  if (fm.poster !== undefined) checkMediaRef("poster", fm.poster, slideNo, errors, `${type ?? "slide"} slide`);

  // Regions: `::: name` opens, a bare `:::` closes. Every open needs a close.
  const stack = [];
  for (const line of body) {
    const t = line.trim();
    if (t === ":::") {
      if (stack.length === 0) {
        errors.push({ slide: slideNo, message: "stray closing \`:::\` with no open region" });
      } else {
        stack.pop();
      }
    } else if (/^:::\s+\S/.test(t)) {
      stack.push(t.replace(/^:::\s+/, ""));
    }
  }
  if (stack.length > 0) {
    errors.push({
      slide: slideNo,
      message: `region \`::: ${stack[stack.length - 1]}\` is never closed by a \`:::\``,
    });
  }
}

export function validateDeck(text) {
  const errors = [];
  const split = splitDeck(text);
  if (split.error) {
    errors.push({ slide: 0, message: split.error });
    return { ok: false, errors };
  }
  validateDeckFrontmatter(split.frontmatter, errors);
  split.slides.forEach((slide, idx) => validateSlide(slide, idx + 1, errors));
  return { ok: errors.length === 0, errors };
}

// CLI entry point.
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("validate-deck.mjs")) {
  const path = process.argv[2];
  if (!path) {
    console.error("usage: node validate-deck.mjs <deck.md>");
    process.exit(2);
  }
  const { readFileSync } = await import("node:fs");
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch (e) {
    console.error(`cannot read ${path}: ${e.message}`);
    process.exit(2);
  }
  const { ok, errors } = validateDeck(text);
  if (ok) {
    console.log(`${path}: well-formed ✓`);
    process.exit(0);
  }
  console.error(`${path}: ${errors.length} problem(s)`);
  for (const e of errors) {
    console.error(`  ${e.slide === 0 ? "deck" : `slide ${e.slide}`}: ${e.message}`);
  }
  process.exit(1);
}
