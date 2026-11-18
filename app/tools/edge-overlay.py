#!/usr/bin/env python3
"""Edge overlay of the photo (red) and a render (cyan) on a dark ground, for registration checks.
Usage: python3 -I tools/edge-overlay.py <render.png> <out.png> [x0 y0 x1 y1]   (coordinates in the 1200x832 frame)"""
import sys
import numpy as np
from PIL import Image, ImageFilter, ImageOps
ph = Image.open('/root/goldstein-apartment/reference/stills/SET/F00001_WW-FACTFILE_hp_apt1.png').convert('L').resize((1200, 832), Image.LANCZOS)
r = Image.open(sys.argv[1]).convert('L')
def edges(im, thr):
    im = ImageOps.autocontrast(im.filter(ImageFilter.GaussianBlur(1.2)), cutoff=1)
    g = np.asarray(im.filter(ImageFilter.FIND_EDGES), dtype=np.float64)
    return (g > thr)
e1, e2 = edges(ph, 18), edges(r, 18)
out = np.zeros((832, 1200, 3), np.uint8)
out[e1] = (255, 70, 70); out[e2] = (70, 230, 255); out[e1 & e2] = (255, 255, 255)
im = Image.fromarray(out)
if len(sys.argv) > 7: im = im.crop(tuple(int(v) for v in sys.argv[3:7])); im = im.resize((im.width * 2, im.height * 2), Image.NEAREST)
im.save(sys.argv[2])
