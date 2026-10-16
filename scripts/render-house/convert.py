"""Turn scene.py output into web assets.

    python scripts/render-house/convert.py public/build/house

  <view>-<time>.png  -> <view>-<time>.webp (quality 86) and the PNG is removed
  <view>-mask.exr    -> <view>-mask.png   R frame, G glass, B grain (8-bit)
  <view>-id.exr      -> <view>-id.png     R opening number, grown a few pixels so every
                                          anti-aliased frame edge in the mask has an id
"""

import glob
import os
import sys

import bpy
import numpy as np
from PIL import Image

OUT = os.path.abspath(sys.argv[-1])


def read_exr(path):
    img = bpy.data.images.load(path)
    w, h = img.size
    px = np.empty(w * h * 4, dtype=np.float32)
    img.pixels.foreach_get(px)
    bpy.data.images.remove(img)
    return np.flipud(px.reshape(h, w, 4))


def grow(ids, steps):
    """Fill empty pixels from their neighbours (a small max-filter on the id map)."""
    out = ids.copy()
    for _ in range(steps):
        empty = out == 0
        if not empty.any():
            break
        best = out.copy()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            shifted = np.roll(np.roll(out, dy, 0), dx, 1)
            best = np.where(empty & (best == 0), shifted, best)
        out = best
    return out


for exr in sorted(glob.glob(os.path.join(OUT, "*-mask.exr"))):
    view = os.path.basename(exr)[: -len("-mask.exr")]
    m = np.clip(read_exr(exr)[..., :3], 0, 1)
    Image.fromarray((m * 255 + 0.5).astype(np.uint8), "RGB").save(os.path.join(OUT, f"{view}-mask.png"), optimize=True)
    raw = read_exr(os.path.join(OUT, f"{view}-id.exr"))[..., 0]
    ids = np.rint(raw * 255).astype(np.uint8)
    ids = grow(ids, 4)
    rgb = np.zeros((*ids.shape, 3), np.uint8)
    rgb[..., 0] = ids
    Image.fromarray(rgb, "RGB").save(os.path.join(OUT, f"{view}-id.png"), optimize=True)
    os.remove(exr)
    os.remove(os.path.join(OUT, f"{view}-id.exr"))
    print("masks", view, "openings visible:", sorted(set(np.unique(ids).tolist()) - {0}))

for png in sorted(glob.glob(os.path.join(OUT, "*-*.png"))):
    if png.endswith(("-mask.png", "-id.png")):
        continue
    Image.open(png).convert("RGB").save(png[:-4] + ".webp", "WEBP", quality=86, method=6)
    os.remove(png)
    print("webp", os.path.basename(png))
