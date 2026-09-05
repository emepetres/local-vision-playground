"""Draw the reference Frame committed at docs/fixtures/reference-frame.jpg.

A fixed workload needs a fixed Frame, and a Frame that ships in the repository has to be
one we are free to redistribute — so it is drawn rather than photographed. It is a flat
illustration of a desk with a laptop, a coffee mug, a stack of books and a potted plant:
enough recognisable objects for an Observation to be worth reading, and enough flat colour
that it survives JPEG at the working resolution.

Run with ``uv run python tools/make_reference_frame.py``. It writes into ``docs/`` at the
repository root rather than into ``vision/``, because the Frame is a fixture the whole
playground shares — pass ``--output`` to put it somewhere else.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw

from vision.capture import JPEG_QUALITY, WORKING_RESOLUTION

REPOSITORY_ROOT = Path(__file__).resolve().parent.parent.parent
DEFAULT_OUTPUT = REPOSITORY_ROOT / "docs" / "fixtures" / "reference-frame.jpg"

WALL = (232, 228, 220)
DESK = (166, 118, 74)
DESK_EDGE = (138, 95, 58)
LAPTOP_BASE = (94, 100, 108)
LAPTOP_LID = (68, 74, 82)
SCREEN = (46, 96, 140)
MUG = (244, 244, 246)
MUG_SHADE = (214, 214, 220)
BOOK_A = (186, 62, 58)
BOOK_B = (216, 168, 60)
BOOK_C = (72, 128, 96)
POT = (188, 106, 72)
LEAF = (74, 132, 82)
LEAF_DARK = (56, 104, 66)
SHADOW = (146, 102, 64)


def draw() -> Image.Image:
    image = Image.new("RGB", WORKING_RESOLUTION, WALL)
    canvas = ImageDraw.Draw(image)

    canvas.rectangle((0, 300, 639, 479), fill=DESK)
    canvas.rectangle((0, 300, 639, 310), fill=DESK_EDGE)

    _laptop(canvas)
    _mug(canvas)
    _books(canvas)
    _plant(canvas)

    return image


def _laptop(canvas: ImageDraw.ImageDraw) -> None:
    canvas.polygon(((176, 300), (398, 300), (430, 356), (144, 356)), fill=SHADOW)
    # Lid, standing behind the desk edge.
    canvas.rectangle((186, 132, 392, 300), fill=LAPTOP_LID)
    canvas.rectangle((198, 144, 380, 288), fill=SCREEN)
    for y in range(164, 268, 22):
        canvas.rectangle((214, y, 214 + (150 if y % 44 else 96), y + 7), fill=(206, 224, 238))
    # Keyboard base, foreshortened onto the desk.
    canvas.polygon(((186, 300), (392, 300), (424, 348), (154, 348)), fill=LAPTOP_BASE)
    canvas.polygon(((210, 310), (368, 310), (392, 338), (186, 338)), fill=(126, 132, 140))


def _mug(canvas: ImageDraw.ImageDraw) -> None:
    canvas.ellipse((412, 352, 500, 372), fill=SHADOW)
    canvas.rounded_rectangle((416, 286, 496, 364), radius=10, fill=MUG)
    canvas.ellipse((416, 276, 496, 298), fill=MUG_SHADE)
    canvas.ellipse((424, 281, 488, 293), fill=(70, 44, 32))
    canvas.arc((484, 300, 532, 344), start=290, end=70, fill=MUG_SHADE, width=11)


def _books(canvas: ImageDraw.ImageDraw) -> None:
    canvas.rectangle((30, 404, 210, 428), fill=BOOK_A)
    canvas.rectangle((30, 404, 210, 410), fill=(216, 92, 88))
    canvas.rectangle((40, 380, 204, 404), fill=BOOK_B)
    canvas.rectangle((40, 380, 204, 386), fill=(238, 198, 96))
    canvas.rectangle((52, 358, 196, 380), fill=BOOK_C)
    canvas.rectangle((52, 358, 196, 364), fill=(104, 160, 126))


def _plant(canvas: ImageDraw.ImageDraw) -> None:
    canvas.polygon(((558, 300), (622, 300), (612, 372), (568, 372)), fill=POT)
    canvas.rectangle((552, 288, 628, 302), fill=(206, 122, 86))
    canvas.line((590, 300, 590, 214), fill=LEAF_DARK, width=6)
    canvas.ellipse((540, 196, 596, 246), fill=LEAF)
    canvas.ellipse((586, 186, 640, 238), fill=LEAF_DARK)
    canvas.ellipse((558, 160, 618, 206), fill=LEAF)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    output = parser.parse_args().output

    output.parent.mkdir(parents=True, exist_ok=True)
    draw().save(output, format="JPEG", quality=JPEG_QUALITY)
    print(f"wrote {output}")


if __name__ == "__main__":
    main()
