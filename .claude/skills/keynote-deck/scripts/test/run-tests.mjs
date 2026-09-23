// Corpus-driven test for the deck.md well-formedness validator.
// The repo has no unit-test framework; this corpus IS the test (AGENTS.md):
// the canonical example must pass, and each single-fault deck must fail with a
// message naming its fault. Run: `node run-tests.mjs`. Exit 0 = all green.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateDeck } from "../validate-deck.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = join(here, "fixtures");
const example = join(here, "..", "..", "references", "example-deck.md");

// Each fault fixture must fail, and its error must mention `needle` (case-insensitive)
// so the message names the fault rather than failing anonymously.
const cases = [
  { name: "example-deck (canonical)", file: example, expect: "pass" },
  { name: "unknown type", file: join(fixtures, "fault-unknown-type.md"), expect: "fail", needle: "type" },
  { name: "image missing src", file: join(fixtures, "fault-image-missing-src.md"), expect: "fail", needle: "src" },
  { name: "unbalanced region", file: join(fixtures, "fault-unbalanced-region.md"), expect: "fail", needle: ":::" },
  { name: "frontmatter split by blank line", file: join(fixtures, "fault-frontmatter-blank-line.md"), expect: "fail", needle: "frontmatter" },
  { name: "malformed !todo", file: join(fixtures, "fault-malformed-todo.md"), expect: "fail", needle: "todo" },
];

let failures = 0;
for (const c of cases) {
  const res = validateDeck(readFileSync(c.file, "utf8"));
  const messages = res.errors.map((e) => e.message).join(" | ");
  if (c.expect === "pass") {
    if (res.ok) {
      console.log(`  ok   ${c.name}`);
    } else {
      failures++;
      console.log(`  FAIL ${c.name} — expected pass, got: ${messages}`);
    }
  } else {
    const named = !res.ok && new RegExp(c.needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(messages);
    if (named) {
      console.log(`  ok   ${c.name} → ${messages}`);
    } else {
      failures++;
      console.log(
        res.ok
          ? `  FAIL ${c.name} — expected failure, got pass`
          : `  FAIL ${c.name} — error did not name "${c.needle}": ${messages}`,
      );
    }
  }
}

console.log(failures === 0 ? "\nAll corpus checks green." : `\n${failures} corpus check(s) red.`);
process.exit(failures === 0 ? 0 : 1);
