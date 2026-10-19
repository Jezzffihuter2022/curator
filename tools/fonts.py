#!/usr/bin/env python3
"""Build the self-hosted web fonts in assets/fonts/ from the characters the site actually uses.

The site used to load Noto Serif SC and EB Garamond from Google Fonts, which is unreachable from mainland China, so
readers there (WeChat's browser above all) saw the system Song typeface instead. The fonts are now served from the
site itself, cut down to the characters that occur in the site's text.

Run it again whenever new text is added (a new item, essay or page): characters missing from the subset fall back to
the system serif.

Usage:  python3 tools/fonts.py
Sources (downloaded once into ~/.cache/curator-fonts, never committed; SIL Open Font License, copies in assets/fonts/):
  Noto Serif SC  https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf
  EB Garamond    https://raw.githubusercontent.com/google/fonts/main/ofl/ebgaramond/EBGaramond%5Bwght%5D.ttf (+ -Italic)
Requires: pip install fonttools brotli
"""
import glob, os, urllib.request
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "fonts")
CACHE = os.environ.get("FONT_CACHE", os.path.expanduser("~/.cache/curator-fonts"))
BASE = "https://raw.githubusercontent.com/google/fonts/main/ofl/"
SOURCES = {
    "noto": "notoserifsc/NotoSerifSC%5Bwght%5D.ttf",
    "garamond": "ebgaramond/EBGaramond%5Bwght%5D.ttf",
    "garamond-italic": "ebgaramond/EBGaramond-Italic%5Bwght%5D.ttf",
}
# (output file, source, weight): the weights the stylesheet uses
FACES = [
    ("noto-serif-sc-400.woff2", "noto", 400),
    ("noto-serif-sc-500.woff2", "noto", 500),
    ("noto-serif-sc-700.woff2", "noto", 700),
    ("eb-garamond-400.woff2", "garamond", 400),
    ("eb-garamond-500.woff2", "garamond", 500),
    ("eb-garamond-400-italic.woff2", "garamond-italic", 400),
]


def source(key):
    path = os.path.join(CACHE, os.path.basename(SOURCES[key]).replace("%5B", "[").replace("%5D", "]"))
    if not os.path.exists(path):
        os.makedirs(CACHE, exist_ok=True)
        print(f"downloading {SOURCES[key]}")
        urllib.request.urlretrieve(BASE + SOURCES[key], path)
    return path


def site_text():
    files = [os.path.join(ROOT, "assets", "data.js"), os.path.join(ROOT, "assets", "site.js")]
    files += glob.glob(os.path.join(ROOT, "*.html")) + glob.glob(os.path.join(ROOT, "*", "index.html"))
    return "".join(open(f, encoding="utf-8").read() for f in files)


def main():
    text = site_text()
    chars = set(text) | set(chr(c) for c in range(0x20, 0x7F))      # all of printable ASCII, whatever the text holds
    chars = {c for c in chars if c.isprintable() or c == " "}
    cjk = "".join(sorted(chars))
    latin = "".join(sorted(c for c in chars if ord(c) < 0x2E80))  # Garamond carries no Chinese
    os.makedirs(OUT, exist_ok=True)
    for name, key, weight in FACES:
        font = instancer.instantiateVariableFont(TTFont(source(key)), {"wght": weight})
        opts = subset.Options(); opts.flavor = "woff2"; opts.layout_features = ["*"]; opts.name_IDs = ["*"]
        opts.notdef_outline = True; opts.drop_tables += ["DSIG"]
        sub = subset.Subsetter(opts); sub.populate(text=cjk if key == "noto" else latin); sub.subset(font)
        dst = os.path.join(OUT, name); font.flavor = "woff2"; font.save(dst)
        print(f"{name}: {len(font.getGlyphOrder())} glyphs, {os.path.getsize(dst) // 1024} KB")
    print(f"{len(chars)} distinct characters")


if __name__ == "__main__":
    main()
