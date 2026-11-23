"""Remove the Exif block (GPS position, capture time, camera) from original photos, without re-encoding.

The repository is public and every original under images/ is served by GitHub Pages, so a phone photo that keeps
its Exif block publishes where it was taken. The derived _standard and _large files are re-encoded by
standardize.py and carry no Exif; this script is for the originals.

Only the APP1 Exif segment is dropped. Image data and the ICC colour profile are copied byte for byte, so the
pixels are identical. A file whose Exif orientation is not 1 is skipped: dropping that tag would turn the picture,
and standardize.py reads it to upright the image. Rotate such a file first, then run the script again.

Usage:  python3 tools/strip_exif.py images/treasures/t033.jpg [...]
        python3 tools/strip_exif.py --check            (list every JPEG in the repository that still has GPS data)
"""
import glob
import sys

from PIL import Image


def has_gps(path):
    gps = Image.open(path).getexif().get_ifd(0x8825)
    return any(float(v) for v in gps.get(2, ()))   # GPSLatitude; some cameras write an empty GPS block


def strip(path):
    exif = Image.open(path).getexif()
    if exif.get(274, 1) != 1:
        print(path, "skipped: Exif orientation is", exif.get(274), "(rotate the file first)")
        return
    data = open(path, "rb").read()
    if data[:2] != b"\xff\xd8":
        print(path, "skipped: not a JPEG")
        return
    out, i, removed = bytearray(b"\xff\xd8"), 2, 0
    while i < len(data):
        if data[i] != 0xFF:
            print(path, "skipped: unexpected byte in the header")
            return
        marker = data[i + 1]
        if marker == 0xDA:                      # start of scan: the rest is image data, copied unchanged
            out += data[i:]
            break
        length = int.from_bytes(data[i + 2:i + 4], "big")
        segment = data[i:i + 2 + length]
        if marker == 0xE1 and segment[4:10] == b"Exif\x00\x00":
            removed += 1
        else:
            out += segment
        i += 2 + length
    if removed:
        open(path, "wb").write(out)
    print(path, "Exif removed" if removed else "no Exif block")


if __name__ == "__main__":
    args = sys.argv[1:]
    if args == ["--check"]:
        found = [f for f in sorted(glob.glob("images/**/*.jpg", recursive=True) + glob.glob("_archive/**/*.jpg", recursive=True)) if has_gps(f)]
        print("\n".join(found) if found else "no GPS data found")
    elif args:
        for p in args:
            strip(p)
    else:
        print(__doc__)
