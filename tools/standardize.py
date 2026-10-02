#!/usr/bin/env python3
"""Produce the *_standard.jpg cover images used by the site.

For every item in assets/data.js the original photograph (e.g. images/treasures/t001.jpg)
is turned into images/treasures/t001_standard.jpg: a 3:4 canvas (1200 x 1600), the ratio most
originals share, with a
uniform warm-white ground (#F3F0E8). Items listed in KEEP_BACKGROUND were photographed in
or on their presentation boxes; their photograph is kept and only fitted to 3:4 by trimming
the long sides and adding pure background where the object leaves room. Everything else has the object segmented out with rembg (ISNet),
centred, given a soft shadow and a gentle luminance stretch. Originals are never modified.

Usage:  python3 tools/standardize.py [item-id ...]      (no ids = every item without a standard file)
        python3 tools/standardize.py --force t001        (re-make even if the standard file exists)
Requires: pip install "rembg[cpu]" pillow numpy opencv-python-headless scipy
"""
import json, os, re, sys
import numpy as np
from PIL import Image, ImageFilter, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BG = tuple(int(v) for v in os.environ.get("STANDARD_BG", "243,240,232").split(","))   # warm white by default
OUT_ROOT = os.environ.get("STANDARD_OUT", ROOT)       # where the standard files are written (tests only)
RATIO = 3 / 4                 # width / height shared by most of the original photographs
W, H = 1200, 1600             # 3:4 canvas
FILL = 0.84                   # the object fills this fraction of the limiting dimension
KEEP_BACKGROUND = {"t021", "t015", "t019", "t016", "t027", "t003", "t022", "t026", "t018"}
MODEL = "birefnet-general-lite"
RATIO_TOL = 0.015            # an original within this of RATIO is only resized
# Per-item colour ranges (OpenCV HSV, H 0-179) removed from the segmentation mask, for
# photographs where a second object lay under the item.
STRIP_COLOUR = {"r015": ((5, 25), 60, 60)}   # tan overcoat under the trench coat
# Items whose photograph carries a colour cast: the object's average is pulled towards neutral grey.
NEUTRALIZE = {}                               # id -> strength 0..1
# Items too close in tone to the warm-white ground are set on their own colour instead.
BG_OVERRIDE = {"r009": (22, 20, 20), "t005": (22, 20, 20)}   # pale or silver objects sit on black
# Garments photographed on a hanger: the hook above the shoulders is removed.
REMOVE_HANGER = {"r009", "r012", "r014"}


def items():
    src = open(os.path.join(ROOT, "assets/data.js"), encoding="utf-8").read()
    return re.findall(r'\{ id:"([rt]\d+)".*?image:"/images/([a-z]+)/\1(?:_standard)?\.jpg"', src)


def neutralize(rgb, alpha, strength):
    """Grey-world white balance on the object only, blended by `strength`."""
    a = np.asarray(rgb).astype(np.float32); m = np.asarray(alpha) > 128
    mean = a[m].mean(axis=0); gain = mean.mean() / np.maximum(mean, 1)
    gain = 1 + (gain - 1) * strength
    return Image.fromarray(np.clip(a * gain, 0, 255).astype(np.uint8))


def stretch(rgb, alpha):
    a = np.asarray(rgb).astype(np.float32); m = np.asarray(alpha) > 128
    if m.sum() < 100: return rgb
    lum = a.mean(axis=2)[m]
    lo, hi = min(np.percentile(lum, 0.5), 30), max(np.percentile(lum, 99.5), 225)
    return Image.fromarray(np.clip((a - lo) * (255.0 / max(hi - lo, 1)), 0, 255).astype(np.uint8))


def object_mask(im, session):
    """Binary mask of the main object, used only to decide where background can be added."""
    from rembg import remove
    a = np.asarray(remove(im, session=session, only_mask=True))
    return a > 128


def background_band(im, side, size):
    """A strip of pure background, made from the image's outermost rows/columns on `side`,
    stretched to `size` pixels and blurred so that no detail is invented."""
    w, h = im.size; n = max(6, int(0.03 * (h if side in ("top", "bottom") else w)))
    if side == "top": band = im.crop((0, 0, w, n)).resize((w, size), Image.LANCZOS)
    elif side == "bottom": band = im.crop((0, h - n, w, h)).resize((w, size), Image.LANCZOS)
    elif side == "left": band = im.crop((0, 0, n, h)).resize((size, h), Image.LANCZOS)
    else: band = im.crop((w - n, 0, w, h)).resize((size, h), Image.LANCZOS)
    return band.filter(ImageFilter.GaussianBlur(10))


def fit_ratio(im, mask):
    """Bring a photograph to RATIO without inventing content: first trim the long sides where
    the object leaves room, then add background on whichever side(s) the object does not touch."""
    im = im.convert("RGB"); w, h = im.size; r = RATIO
    if abs(w / h - r) <= RATIO_TOL * r: return im.resize((W, H), Image.LANCZOS)
    ys, xs = np.where(mask)
    if len(xs) == 0: x0, x1, y0, y1 = 0, w, 0, h
    else: x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    mx, my = int(0.04 * w), int(0.04 * h)
    if w / h > r:   # too wide: trim the sides, then add background above/below
        need_w = int(round(h * r)); min_w = min(w, (x1 - x0) + 2 * mx)
        new_w = max(need_w, min_w); cx = (x0 + x1) // 2
        left = min(max(0, cx - new_w // 2), w - new_w); im = im.crop((left, 0, left + new_w, h)); mask = mask[:, left:left + new_w]
        w = new_w; pad = int(round(w / r)) - h
        if pad > 0:
            top_free, bot_free = y0 > my, y1 < h - my
            pt = pad if top_free and not bot_free else 0 if bot_free and not top_free else pad // 2
            pb = pad - pt
            out = Image.new("RGB", (w, h + pad))
            if pt: out.paste(background_band(im, "top", pt), (0, 0))
            out.paste(im, (0, pt))
            if pb: out.paste(background_band(im, "bottom", pb), (0, pt + h))
            im = out
    else:           # too tall: trim top/bottom, then add background left/right
        need_h = int(round(w / r)); min_h = min(h, (y1 - y0) + 2 * my)
        new_h = max(need_h, min_h); cy = (y0 + y1) // 2
        top = min(max(0, cy - new_h // 2), h - new_h); im = im.crop((0, top, w, top + new_h)); mask = mask[top:top + new_h, :]
        h = new_h; pad = int(round(h * r)) - w
        if pad > 0:
            left_free, right_free = x0 > mx, x1 < w - mx
            pl = pad if left_free and not right_free else 0 if right_free and not left_free else pad // 2
            pr = pad - pl
            out = Image.new("RGB", (w + pad, h))
            if pl: out.paste(background_band(im, "left", pl), (0, 0))
            out.paste(im, (pl, 0))
            if pr: out.paste(background_band(im, "right", pr), (pl + w, 0))
            im = out
    return im.resize((W, H), Image.LANCZOS)


def is_plain_background(im, mask):
    """True when the outer 5% of the photograph, excluding the object, is close to one colour."""
    a = np.asarray(im.convert("RGB")).astype(np.float32); h, w = a.shape[:2]; n = max(4, int(0.05 * min(h, w)))
    border = np.zeros((h, w), bool); border[:n] = border[-n:] = True; border[:, :n] = border[:, -n:] = True
    sel = border & ~mask
    return sel.sum() > 0.6 * border.sum() and float(a[sel].std(axis=0).mean()) < 20


def drop_hanger(cut):
    """Clear the narrow rows above the shoulders (the hanger hook) from a garment's mask."""
    from scipy import ndimage
    a = np.asarray(cut).copy(); m = a[..., 3] > 128
    rows = np.where(m.any(axis=1))[0]
    if len(rows) == 0: return cut
    width = m.sum(axis=1).astype(np.float32); full = np.percentile(width[rows], 95)
    top = rows[0]
    while top < rows[-1] and width[top] < 0.35 * full: top += 1
    a[:top, :, 3] = 0
    # anything still floating above the garment (a hook crossing the collar) goes with it
    lab, n = ndimage.label(a[..., 3] > 128)
    if n > 1:
        keep = 1 + int(np.argmax(ndimage.sum(a[..., 3] > 128, lab, range(1, n + 1))))
        a[lab != keep, 3] = 0
    return Image.fromarray(a, "RGBA")


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
    if iid in REMOVE_HANGER:
        cut = drop_hanger(cut)
    bbox = cut.getbbox()
    if not bbox: raise RuntimeError(f"{iid}: no object found")
    sub = cut.crop(bbox); alpha = sub.split()[3]
    rgb = stretch(sub.convert("RGB"), alpha)
    if iid in NEUTRALIZE: rgb = neutralize(rgb, alpha, NEUTRALIZE[iid])
    sub = Image.merge("RGBA", (*rgb.split(), alpha))
    scale = min(FILL * W / sub.width, FILL * H / sub.height)
    sub = sub.resize((max(1, int(sub.width * scale)), max(1, int(sub.height * scale))), Image.LANCZOS)
    x, y = (W - sub.width) // 2, (H - sub.height) // 2
    ground = BG_OVERRIDE.get(iid, BG)
    canvas = Image.new("RGBA", (W, H), ground + (255,))
    if sum(ground) > 300:   # a shadow only reads on a light ground
        shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        shadow.paste(Image.new("RGBA", sub.size, (70, 55, 45, 70)), (x + 6, y + 14), sub.split()[3])
        canvas = Image.alpha_composite(canvas, shadow.filter(ImageFilter.GaussianBlur(22)))
    canvas.alpha_composite(sub, (x, y))
    return canvas.convert("RGB")


def chronicle_images():
    src = open(os.path.join(ROOT, "assets/data.js"), encoding="utf-8").read()
    return sorted(set(re.findall(r'image\d:"/images/chronicles/(c\d+[a-z])(?:_standard)?\.jpg"', src)))


def main(argv):
    force = "--force" in argv; wanted = [a for a in argv if not a.startswith("--")]
    session = None
    if "--chronicles" in argv:
        # detail photographs with a plain background are brought to RATIO as well
        from rembg import new_session; session = new_session(MODEL)
        for cid in chronicle_images():
            src = os.path.join(ROOT, "images/chronicles", f"{cid}.jpg"); dst = os.path.join(OUT_ROOT, "images/chronicles", f"{cid}_standard.jpg")
            if not os.path.exists(src): continue
            if os.path.exists(dst) and not force: continue
            im = ImageOps.exif_transpose(Image.open(src)).convert("RGB"); im.thumbnail((1600, 1600))
            if im.width > im.height: continue                       # landscape close-ups stay as they are
            mask = object_mask(im, session)
            if not is_plain_background(im, mask): print(f"{cid}: textured background, left as it is"); continue
            os.makedirs(os.path.dirname(dst), exist_ok=True); fit_ratio(im, mask).save(dst, quality=88, optimize=True); print(f"{cid}: plain background, fitted to 3:4")
        return
    for iid, folder in items():
        if wanted and iid not in wanted: continue
        src = os.path.join(ROOT, "images", folder, f"{iid}.jpg"); dst = os.path.join(OUT_ROOT, "images", folder, f"{iid}_standard.jpg")
        if not os.path.exists(src): print(f"{iid}: original missing, skipped"); continue
        if os.path.exists(dst) and not force: continue
        im = ImageOps.exif_transpose(Image.open(src)).convert("RGB"); im.thumbnail((1600, 1600))
        if session is None:
            from rembg import new_session; session = new_session(MODEL)
        if iid in KEEP_BACKGROUND:
            out = fit_ratio(im, object_mask(im, session)); how = "background kept, fitted to 3:4"
        else:
            out = cut_out(im, iid, session); how = "cut out"
        os.makedirs(os.path.dirname(dst), exist_ok=True); out.save(dst, quality=88, optimize=True); print(f"{iid}: {how} -> {os.path.relpath(dst, ROOT)}")


if __name__ == "__main__":
    main(sys.argv[1:])
