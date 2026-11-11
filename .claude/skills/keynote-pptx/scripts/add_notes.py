"""Write speaker notes into a built .pptx, one entry per output slide.

The unzip/edit-XML path of anthropic-skills:pptx has no way to create notes
slides, and event templates often ship without a notes master. python-pptx
creates both on demand, and leaves every other part of the package as it was.

Usage:
    python add_notes.py deck.pptx notes.json [-o out.pptx]

notes.json is a list of {"slide": <1-based position in the final deck>,
"notes": "<text>"}. Slides absent from the list keep the notes they have.
Paragraphs are split on newlines. Without -o the deck is rewritten in place.

Needs python-pptx:  uv run --no-project --with python-pptx python add_notes.py ...
"""

import argparse
import json
import sys
from pathlib import Path

from pptx import Presentation


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("pptx", type=Path)
    parser.add_argument("notes", type=Path)
    parser.add_argument("-o", "--output", type=Path)
    args = parser.parse_args()

    entries = json.loads(args.notes.read_text(encoding="utf-8"))
    pres = Presentation(str(args.pptx))
    slides = list(pres.slides)
    errors = 0
    for entry in entries:
        n = entry["slide"]
        if not 1 <= n <= len(slides):
            print(f"slide {n}: out of range (deck has {len(slides)})", file=sys.stderr)
            errors += 1
            continue
        # notes_slide creates the notes slide, and the notes master, if missing.
        frame = slides[n - 1].notes_slide.notes_text_frame
        lines = entry["notes"].replace("\r\n", "\n").split("\n")
        frame.text = lines[0]
        for line in lines[1:]:
            frame.add_paragraph().text = line

    out = args.output or args.pptx
    pres.save(str(out))
    print(f"{out}: notes written on {len(entries) - errors} slide(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
