"""List the colours and fonts a .pptx template actually uses, most frequent first.

Event templates often keep Office's stock theme and paint their real palette
straight onto the shapes of their sample slides, so the theme alone misleads.
This counts every explicit colour and typeface across slides, layouts and
masters, and prints the theme's own palette beside it for comparison.

Stdlib only.  Usage: python template_palette.py template.pptx [--top 16]
"""

import argparse
import re
import sys
import zipfile
from collections import Counter

COLOR = re.compile(rb'srgbClr val="([0-9A-Fa-f]{6})"')
FONT = re.compile(rb'<a:(?:latin|ea|cs) typeface="([^"]+)"')
THEME_SLOT = re.compile(
    rb"<a:(dk1|lt1|dk2|lt2|accent[1-6]|hlink|folHlink)>\s*<a:(?:srgbClr val|sysClr [^>]*lastClr)=\"([0-9A-Fa-f]{6})\""
)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("pptx")
    parser.add_argument("--top", type=int, default=16)
    args = parser.parse_args()

    colors: Counter[str] = Counter()
    fonts: Counter[str] = Counter()
    theme: list[tuple[str, str]] = []
    with zipfile.ZipFile(args.pptx) as z:
        for name in z.namelist():
            if not name.endswith(".xml"):
                continue
            data = z.read(name)
            if name.startswith("ppt/theme/theme1"):
                theme = [(s.decode(), c.decode().upper()) for s, c in THEME_SLOT.findall(data)]
            if name.startswith(("ppt/slides/", "ppt/slideLayouts/", "ppt/slideMasters/")):
                colors.update(c.decode().upper() for c in COLOR.findall(data))
                fonts.update(f.decode() for f in FONT.findall(data) if not f.startswith(b"+"))

    print("## Colours used on shapes (count, hex)")
    for hex_, n in colors.most_common(args.top):
        print(f"{n:6}  #{hex_}")
    print("\n## Fonts used on shapes (count, typeface)")
    for font, n in fonts.most_common(8):
        print(f"{n:6}  {font}")
    print("\n## Theme palette (slot, hex)")
    for slot, hex_ in theme:
        print(f"  {slot:9} #{hex_}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
