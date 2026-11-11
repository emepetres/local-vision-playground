"""Zip an unpacked .pptx folder back into a .pptx.

Replaces the `zip -XrD` step of anthropic-skills:pptx on machines without a zip
CLI. Writes [Content_Types].xml first, as Office expects, and overwrites the
output, so parts deleted from the folder do not survive.

Stdlib only.  Usage: python pack.py unpacked/ out.pptx
"""

import sys
import zipfile
from pathlib import Path


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: python pack.py unpacked/ out.pptx", file=sys.stderr)
        return 2
    src, out = Path(sys.argv[1]), Path(sys.argv[2])
    files = sorted(p for p in src.rglob("*") if p.is_file())
    files.sort(key=lambda p: p.name != "[Content_Types].xml")
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for path in files:
            z.write(path, path.relative_to(src).as_posix())
    print(f"{out}: {len(files)} parts")
    return 0


if __name__ == "__main__":
    sys.exit(main())
