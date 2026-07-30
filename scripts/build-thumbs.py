#!/usr/bin/env python3
"""Generate small thumbnails for the homepage gallery.

Reads every image in src/images/entries/ and writes a resized copy (longest
side = MAX px) to src/images/thumbs/ under the same filename. Thumbnails are
committed to the repo, so the site stays light and portable even if this
script is never run again.

Re-run after adding images:
    python3 scripts/build-thumbs.py

Dumb on purpose: it only ever downsizes existing files. It fetches nothing,
edits no content, and touches no file outside src/images/thumbs/.
"""
from pathlib import Path
from PIL import Image

MAX = 640
SRC = Path("src/images/entries")
OUT = Path("src/images/thumbs")
EXTS = {".jpg", ".jpeg", ".png", ".webp"}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    made = 0
    for f in sorted(SRC.iterdir()):
        if f.suffix.lower() not in EXTS:
            continue  # skip .gitkeep, stray PDFs, anything non-image
        im = Image.open(f)
        im.thumbnail((MAX, MAX))  # preserves aspect ratio, only downsizes
        ext = f.suffix.lower()
        if ext in (".jpg", ".jpeg"):
            im.convert("RGB").save(OUT / f.name, format="JPEG", quality=82, optimize=True)
        elif ext == ".png":
            im.save(OUT / f.name, format="PNG", optimize=True)
        else:  # .webp
            im.save(OUT / f.name, format="WEBP", quality=82, method=6)
        made += 1
        print(f"  {f.name} -> {im.size[0]}x{im.size[1]}")
    print(f"Wrote {made} thumbnails to {OUT}/")


if __name__ == "__main__":
    main()
