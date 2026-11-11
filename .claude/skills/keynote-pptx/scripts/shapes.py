"""List the shapes of chosen slides: name, kind, box and text.

Template sample slides name their shapes generically ("Rectangle 4"), so the
name alone cannot say which shape is the title, the list or the image frame.
Read this listing beside the slide's render to fill template-map.md.

Boxes are in percent of the slide (x, y, width, height), largest first when
--by-size is given, otherwise in z-order (back to front).

Usage:  python shapes.py deck.pptx [slide numbers...] [--by-size] [--min-area 1]
Needs python-pptx:  uv run --no-project --with python-pptx python shapes.py ...
"""

import argparse
import sys

from pptx import Presentation


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("pptx")
    parser.add_argument("slides", nargs="*", type=int)
    parser.add_argument("--by-size", action="store_true")
    parser.add_argument("--min-area", type=float, default=0.0,
                        help="hide shapes smaller than this percent of the slide")
    args = parser.parse_args()

    pres = Presentation(args.pptx)
    sw, sh = pres.slide_width, pres.slide_height
    chosen = args.slides or range(1, len(pres.slides) + 1)
    for n in chosen:
        slide = pres.slides[n - 1]
        print(f"## Slide {n} (layout: {slide.slide_layout.name})")
        rows = []
        for s in slide.shapes:
            if s.width is None or s.height is None:
                continue
            x, y = 100 * (s.left or 0) / sw, 100 * (s.top or 0) / sh
            w, h = 100 * s.width / sw, 100 * s.height / sh
            if w * h / 100 < args.min_area:
                continue
            text = s.text_frame.text.replace("\n", " / ")[:60] if s.has_text_frame else ""
            kind = str(s.shape_type).split(".")[-1].split(":")[0].lower()
            rows.append((w * h, f"  {s.name!r:28} {kind:12} x{x:5.1f} y{y:5.1f} w{w:5.1f} h{h:5.1f}  {text}"))
        if args.by_size:
            rows.sort(key=lambda r: -r[0])
        for _, line in rows:
            print(line)
    return 0


if __name__ == "__main__":
    sys.exit(main())
