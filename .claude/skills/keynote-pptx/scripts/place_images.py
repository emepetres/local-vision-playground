"""Place pictures, or visible TODO boxes, inside named frame shapes of a built .pptx.

Inserting a picture through raw XML means a media part, a relationship, a
content-type default and a <p:pic>, each easy to get wrong. python-pptx does
all four. Each picture is fitted inside its frame without cropping or
stretching, and centred; the frame shape itself stays (templates often draw it
as decoration) unless "remove_frame" is true.

Usage:
    python place_images.py deck.pptx images.json [-o out.pptx]

images.json is a list of entries, slide numbers 1-based in the final deck:
    {"slide": 7, "frame": "Rectangle 4", "image": "C:/.../images/system-map.png"}
    {"slide": 9, "frame": "Rectangle 4", "todo": "capture: the terminal running watch"}
    optional on either: "remove_frame": true, "inset": 0.04 (fraction of the frame
    kept clear on each side, default 0)

Needs python-pptx:  uv run --no-project --with python-pptx python place_images.py ...
"""

import argparse
import json
import sys
from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Pt

TODO_RED = RGBColor(0xE8, 0x11, 0x23)


def find_shape(slide, name):
    for shape in slide.shapes:
        if shape.name == name:
            return shape
    return None


def place_picture(slide, frame, image, inset):
    pic = slide.shapes.add_picture(str(image), frame.left, frame.top)
    box_w = frame.width * (1 - 2 * inset)
    box_h = frame.height * (1 - 2 * inset)
    scale = min(box_w / pic.width, box_h / pic.height)
    pic.width, pic.height = int(pic.width * scale), int(pic.height * scale)
    pic.left = int(frame.left + (frame.width - pic.width) / 2)
    pic.top = int(frame.top + (frame.height - pic.height) / 2)
    pic.name = f"Picture {Path(image).stem}"


def place_todo(slide, frame, text):
    box = slide.shapes.add_textbox(frame.left, frame.top, frame.width, frame.height)
    box.name = "TODO image"
    box.line.color.rgb = TODO_RED
    box.line.width = Pt(3)
    tf = box.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    run = p.add_run()
    run.text = f"TODO {text}"
    run.font.size = Pt(24)
    run.font.bold = True
    run.font.color.rgb = TODO_RED


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("pptx", type=Path)
    parser.add_argument("entries", type=Path)
    parser.add_argument("-o", "--output", type=Path)
    args = parser.parse_args()

    entries = json.loads(args.entries.read_text(encoding="utf-8"))
    pres = Presentation(str(args.pptx))
    slides = list(pres.slides)
    errors = 0
    for e in entries:
        n = e["slide"]
        if not 1 <= n <= len(slides):
            print(f"slide {n}: out of range (deck has {len(slides)})", file=sys.stderr)
            errors += 1
            continue
        slide = slides[n - 1]
        frame = find_shape(slide, e["frame"])
        if frame is None:
            names = ", ".join(s.name for s in slide.shapes)
            print(f"slide {n}: no shape named {e['frame']!r} (has: {names})", file=sys.stderr)
            errors += 1
            continue
        if "image" in e:
            if not Path(e["image"]).is_file():
                print(f"slide {n}: image not found: {e['image']}", file=sys.stderr)
                errors += 1
                continue
            place_picture(slide, frame, e["image"], e.get("inset", 0))
        else:
            place_todo(slide, frame, e["todo"])
        if e.get("remove_frame"):
            frame._element.getparent().remove(frame._element)

    out = args.output or args.pptx
    pres.save(str(out))
    print(f"{out}: {len(entries) - errors} placed, {errors} failed")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
