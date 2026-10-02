#!/usr/bin/env python3
"""Produce the *_standard.jpg cover images used by the site.

For every item in assets/data.js the original photograph (e.g. images/treasures/t001.jpg)
is turned into images/treasures/t001_standard.jpg: a 2:3 canvas (1200 x 1800) with a
uniform warm-white ground (#F3F0E8). Items listed in KEEP_BACKGROUND were photographed in
or on their presentation boxes; their photograph is kept and only extended to 2:3 by
mirroring its own edges. Everything else has the object segmented out with rembg (ISNet),
centred, given a soft shadow and a gentle luminance stretch. Originals are never modified.

Usage:  python3 tools/standardize.py [item-id ...]      (no ids = every item without a standard file)
        python3 tools/standardize.py --force t001        (re-make even if the standard file exists)
Requires: pip install "rembg[cpu]" pillow numpy opencv-python-headless scipy
"""
import json, os, re, sys
import numpy as np
from PIL import Image, ImageFilter, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BG = (243, 240, 232)          # warm white, close to the site's --bg-warm
W, H = 1200, 1800             # 2:3 canvas
FILL = 0.84                   # the object fills this fraction of the limiting dimension
KEEP_BACKGROUND = {"t021", "t015", "t019", "t016", "t027", "t003", "t022", "t026"}
# Per-item colour ranges (OpenCV HSV, H 0-179) removed from the segmentation mask, for
# photographs where a second object lay under the item.
STRIP_COLOUR = {"r015": ((5, 25), 60, 60)}   # tan overcoat under the trench coat


def items():
    src = open(os.path.join(ROOT, "assets/data.js"), encoding="utf-8").read()
    return re.findall(r'\{ id:"([rt]\d+)".*?image:"/images/([a-z]+)/\1(?:_standard)?\.jpg"', src)


def stretch(rgb, alpha):
    a = np.asarray(rgb).astype(np.float32); m = np.asarray(alpha) > 128
    if m.sum() < 100: return rgb
    lum = a.mean(axis=2)[m]
    lo, hi = min(np.percentile(lum, 0.5), 30), max(np.percentile(lum, 99.5), 225)
    return Image.fromarray(np.clip((a - lo) * (255.0 / max(hi - lo, 1)), 0, 255).astype(np.uint8))


def extend_to_2_3(im):
    """Mirror the photograph's own edges until it is 2:3, blurring the added strips slightly."""
    im = im.convert("RGB"); w, h = im.size
    if h / w < 1.5:
        nh = int(round(w * 1.5)); pad = (nh - h) // 2
        top = ImageOps.flip(im.crop((0, 0, w, pad))).filter(ImageFilter.GaussianBlur(3))
        bot = ImageOps.flip(im.crop((0, h - (nh - h - pad), w, h))).filter(ImageFilter.GaussianBlur(3))
        out = Image.new("RGB", (w, nh)); out.paste(top, (0, 0)); out.paste(im, (0, pad)); out.paste(bot, (0, pad + h))
    else:
        nw = int(round(h / 1.5)); pad = (nw - w) // 2
        left = ImageOps.mirror(im.crop((0, 0, pad, h))).filter(ImageFilter.GaussianBlur(3))
        right = ImageOps.mirror(im.crop((w - (nw - w - pad), 0, w, h))).filter(ImageFilter.GaussianBlur(3))
        out = Image.new("RGB", (nw, h)); out.paste(left, (0, 0)); out.paste(im, (pad, 0)); out.paste(right, (pad + w, 0))
    return out.resize((W, H), Image.LANCZOS)


def cut_out(im, iid, session):
    from rembg import remove
    import cv2
    from scipy import ndimage
    cut = remove(im, session=session, post_process_mask=True)
    rgba = np.asarray(cut); rgb, a = rgba[..., :3], rgba[..., 3]
    if iid in STRIP_COLOUR:
        (h0, h1), smin, vmin = STRIP_COLOUR[iid]
        hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
        keep = (a > 0) & ~((hsv[..., 0] >= h0) & (hsv[..., 0] <= h1) & (hsv[..., 1] > smin) & (hsv[..., 2] > vmin))
        keep = ndimage.binary_opening(keep, iterations=3)
        lab, n = ndimage.label(keep)
        if n: keep = lab == (1 + int(np.argmax(ndimage.sum(keep, lab, range(1, n + 1)))))
        keep = ndimage.binary_closing(ndimage.binary_fill_holes(keep), iterations=4)
        a = cv2.GaussianBlur((a * keep).astype(np.uint8), (0, 0), 1.2)
        cut = Image.fromarray(np.dstack([rgb, a]), "RGBA")
    bbox = cut.getbbox()
    if not bbox: raise RuntimeError(f"{iid}: no object found")
    sub = cut.crop(bbox); alpha = sub.split()[3]
    sub = Image.merge("RGBA", (*stretch(sub.convert("RGB"), alpha).split(), alpha))
    scale = min(FILL * W / sub.width, FILL * H / sub.height)
    sub = sub.resize((max(1, int(sub.width * scale)), max(1, int(sub.height * scale))), Image.LANCZOS)
    x, y = (W - sub.width) // 2, (H - sub.height) // 2
    canvas = Image.new("RGBA", (W, H), BG + (255,))
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    shadow.paste(Image.new("RGBA", sub.size, (70, 55, 45, 70)), (x + 6, y + 14), sub.split()[3])
    canvas = Image.alpha_composite(canvas, shadow.filter(ImageFilter.GaussianBlur(22)))
    canvas.alpha_composite(sub, (x, y))
    return canvas.convert("RGB")


def main(argv):
    force = "--force" in argv; wanted = [a for a in argv if not a.startswith("--")]
    session = None
    for iid, folder in items():
        if wanted and iid not in wanted: continue
        src = os.path.join(ROOT, "images", folder, f"{iid}.jpg"); dst = os.path.join(ROOT, "images", folder, f"{iid}_standard.jpg")
        if not os.path.exists(src): print(f"{iid}: original missing, skipped"); continue
        if os.path.exists(dst) and not force: continue
        im = ImageOps.exif_transpose(Image.open(src)).convert("RGB"); im.thumbnail((1600, 1600))
        if iid in KEEP_BACKGROUND:
            out = extend_to_2_3(im); how = "background kept, extended to 2:3"
        else:
            if session is None:
                from rembg import new_session; session = new_session("isnet-general-use")
            out = cut_out(im, iid, session); how = "cut out"
        out.save(dst, quality=88, optimize=True); print(f"{iid}: {how} -> {os.path.relpath(dst, ROOT)}")


if __name__ == "__main__":
    main(sys.argv[1:])
