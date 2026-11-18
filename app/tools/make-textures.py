#!/usr/bin/env python3
"""Procedural textures for the interior (own drawings; no film pixels are copied).
Usage: python3 -I tools/make-textures.py   -> app/public/textures/*.png
Colours come from src/interior/sampled-colours.json (see tools/sample-colours.py). Pattern repeat
sizes come from measurements on R01 where they exist (wallpaper) and are marked PROVISIONAL otherwise.
All noise is periodic (FFT-filtered), so tiles repeat without seams.
Every texture is albedo only; roughness / metalness are set per material in src/interior/materials.js."""
import json, math
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / 'public' / 'textures'
OUT.mkdir(parents=True, exist_ok=True)
S = json.loads((HERE.parent / 'src/interior/sampled-colours.json').read_text())
rng_global = np.random.default_rng(20261117)

def hexrgb(h): h = h.lstrip('#'); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.float64)
def col(name, which='median'): return hexrgb(S[name][which])

def pnoise(h, w, sx, sy, seed, octaves=1):
    """Periodic noise in [-1, 1]: white noise filtered in Fourier space. sx / sy = feature size in px."""
    out = np.zeros((h, w)); amp = 1.0; tot = 0
    for o in range(octaves):
        r = np.random.default_rng(seed + o * 101)
        n = r.standard_normal((h, w))
        fy = np.fft.fftfreq(h)[:, None]; fx = np.fft.fftfreq(w)[None, :]
        k = np.exp(-((fx * sx / (2 ** o)) ** 2 + (fy * sy / (2 ** o)) ** 2) * (math.pi ** 2) * 2)
        f = np.real(np.fft.ifft2(np.fft.fft2(n) * k))
        f = (f - f.mean()) / (f.std() + 1e-9)
        out += f * amp; tot += amp; amp *= 0.5
    out /= tot
    return np.clip(out / 2.5, -1, 1)

def img(a): return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGB')
def save(im, name): im.save(OUT / f'{name}.png', optimize=True); print(f'{name:18s} {im.size}')
def tint(base, n, k): return base[None, None, :] * (1 + n[..., None] * k)

# ---------------------------------------------------------------- wood
def wood(name, base, size=512, ring=0.5, dark=0.30):
    """Straight-grained stained wood, grain along x. Subtle: no gloss, no dirt."""
    h = w = size
    long_ = pnoise(h, w, 260, 5, 11, 3)            # long streaks
    fine = pnoise(h, w, 90, 1.6, 17, 2)
    y = np.linspace(0, 1, h, endpoint=False)[:, None]
    rings = np.sin((y * 9 + pnoise(h, w, 200, 30, 5) * 1.2) * 2 * math.pi) * 0.5 + 0.5
    n = long_ * 0.55 + fine * 0.3 + (rings - 0.5) * ring * 0.9
    a = tint(base, n, dark)
    save(img(a), name)

# ---------------------------------------------------------------- floor
def floorboards():
    # 4 boards x 0.15 m = 0.6 m across (PROVISIONAL width), 1.2 m long, butt joints staggered
    h, w = 1024, 512
    base = col('floorboards')
    a = np.zeros((h, w, 3)); bw = w // 4
    for b in range(4):
        r = np.random.default_rng(300 + b)
        shade = 1 + r.uniform(-0.12, 0.12)
        off = r.integers(0, h)
        n = np.roll(pnoise(h, bw, 6, 340, 40 + b, 3), off, 0) * 0.55 + np.roll(pnoise(h, bw, 2, 90, 80 + b, 2), off, 0) * 0.25
        blk = tint(base * shade, n, 0.45)
        a[:, b * bw:(b + 1) * bw] = blk
        a[:, b * bw:b * bw + 3] *= 0.45; a[:, b * bw + bw - 2:(b + 1) * bw] *= 0.7     # seams
        j = int(r.uniform(0.15, 0.85) * h)                                             # butt joint
        a[j:j + 3, b * bw:(b + 1) * bw] *= 0.5
    save(img(a), 'floorboards')

# ---------------------------------------------------------------- wallpapers
def medallion(d, cx, cy, W, H, motif, accent, scale):
    """One damask medallion, drawn at 4x then downsampled by the caller. Tile fractions -> px."""
    for ox in (-1, 0, 1):
        for oy in (-1, 0, 1):
            X, Y = (cx + ox) * W, (cy + oy) * H
            sx, sy = scale * W, scale * H
            def E(rx, ry, ox2=0, oy2=0): return [X + ox2 * sx - rx * sx, Y + oy2 * sy - ry * sy, X + ox2 * sx + rx * sx, Y + oy2 * sy + ry * sy]
            d.ellipse(E(0.17, 0.40), fill=tuple(motif.astype(int)))                  # body
            d.ellipse(E(0.09, 0.30), fill=(0, 0, 0, 0))                              # opening
            d.ellipse(E(0.055, 0.17), fill=tuple(accent.astype(int)))                # core
            d.polygon([(X, Y - 0.62 * sy), (X + 0.12 * sx, Y - 0.38 * sy), (X - 0.12 * sx, Y - 0.38 * sy)], fill=tuple(motif.astype(int)))   # tips
            d.polygon([(X, Y + 0.62 * sy), (X + 0.12 * sx, Y + 0.38 * sy), (X - 0.12 * sx, Y + 0.38 * sy)], fill=tuple(motif.astype(int)))
            for sgn in (-1, 1):                                                       # scroll leaves
                d.ellipse(E(0.10, 0.17, sgn * 0.26, -0.08), fill=tuple(motif.astype(int)))
                d.ellipse(E(0.06, 0.11, sgn * 0.26, -0.08), fill=(0, 0, 0, 0))
                d.ellipse(E(0.08, 0.13, sgn * 0.22, 0.26), fill=tuple(accent.astype(int)))
                d.ellipse(E(0.03, 0.03, sgn * 0.36, 0.12), fill=tuple(motif.astype(int)))

def wallpaper_main():
    # MEASURED on R01 (frontal piers): half-drop lattice 0.256 m wide x 0.365 m high (88.5 px at 241.9 px/m)
    W, H, SS = 512, 730, 3
    ground = col('wallpaper_main_left', 'p85'); motif = col('wallpaper_main_left', 'p15')
    motif = motif * 0.92 + np.array([6, 0, 4])          # slightly mauve, as the motifs read in R01
    accent = motif * 0.55 + ground * 0.45 + np.array([-4, 0, 10])   # a lighter mauve-blue secondary tone
    layer = Image.new('RGBA', (W * SS, H * SS), (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
    medallion(d, 0.0, 0.0, W * SS, H * SS, motif, accent, 0.62)
    medallion(d, 0.5, 0.5, W * SS, H * SS, motif, accent, 0.62)
    layer = layer.resize((W, H), Image.LANCZOS)
    a = np.asarray(layer, dtype=np.float64)
    base = np.ones((H, W, 3)) * ground
    # faint self-tone ground damask + paper tooth
    yy, xx = np.mgrid[0:H, 0:W]
    lat = (np.sin(2 * math.pi * (xx / W * 2)) * np.sin(2 * math.pi * (yy / H * 2))) * 0.035
    base *= (1 + lat[..., None] + pnoise(H, W, 2, 2, 7, 2)[..., None] * 0.03)
    al = (a[..., 3:4] / 255.0) * 0.88
    out = base * (1 - al) + a[..., :3] * al
    save(img(out), 'wallpaper_main')

def wallpaper_back():
    # PROVISIONAL pattern: cream with a small diamond lattice + dot (R01 / R05 show small repeats; exact
    # repeat size is not measurable). Tile = 0.16 m.
    n = 256; ground = col('wallpaper_back', 'median'); ink = ground * np.array([0.88, 0.86, 0.80])
    layer = Image.new('RGB', (n * 3, n * 3), tuple(ground.astype(int))); d = ImageDraw.Draw(layer)
    s = n * 3 / 2
    for i in range(3):
        for j in range(3):
            for (cx, cy) in ((i * s, j * s), (i * s + s / 2, j * s + s / 2)):
                r = s * 0.11
                d.polygon([(cx, cy - r), (cx + r * 0.7, cy), (cx, cy + r), (cx - r * 0.7, cy)], fill=tuple(ink.astype(int)))
    im = layer.resize((n, n), Image.LANCZOS)
    a = np.asarray(im, dtype=np.float64) * (1 + pnoise(n, n, 2, 2, 9)[..., None] * 0.02)
    save(img(a), 'wallpaper_back')

# ---------------------------------------------------------------- fabrics
def velvet():
    n = 256; base = col('velvet_seat')
    nap = pnoise(n, n, 1.2, 1.2, 21, 2) * 0.5 + pnoise(n, n, 14, 3, 22, 2) * 0.5
    save(img(tint(base, nap, 0.16)), 'velvet')

def cane():
    n = 256; base = np.array([176, 138, 82.]); gap = base * 0.5
    im = Image.new('RGB', (n, n), tuple(gap.astype(int))); d = ImageDraw.Draw(im)
    step = n // 4                                       # 4 cells per tile
    for i in range(-4, 9):
        for k in range(2):
            o = i * step
            d.line([(o, 0), (o + n, n)] if k == 0 else [(o + n, 0), (o, n)], fill=tuple((base * (1.05 - 0.1 * k)).astype(int)), width=int(step * 0.18))
        d.line([(0, i * step + step // 2), (n, i * step + step // 2)], fill=tuple((base * 0.92).astype(int)), width=int(step * 0.12))
        d.line([(i * step + step // 2, 0), (i * step + step // 2, n)], fill=tuple((base * 0.92).astype(int)), width=int(step * 0.12))
    a = np.asarray(im, dtype=np.float64) * (1 + pnoise(n, n, 2, 2, 31)[..., None] * 0.06)
    save(img(a), 'cane')

def floral(name, ground, petals, leaf, size=512, cells=3, seed=1, density=1.0):
    """Small repeating floral (cushion / coverlet / drape). Periodic by drawing with wrap."""
    r = np.random.default_rng(seed); SS = 2; n = size * SS
    im = Image.new('RGB', (n, n), tuple(ground.astype(int))); d = ImageDraw.Draw(im)
    cell = n / cells
    for i in range(cells):
        for j in range(cells):
            cx = (i + 0.5 + r.uniform(-0.12, 0.12)) * cell; cy = (j + 0.5 + r.uniform(-0.12, 0.12)) * cell
            for ox in (-n, 0, n):
                for oy in (-n, 0, n):
                    x, y = cx + ox, cy + oy
                    for a in range(0, 360, 72):
                        lx = x + math.cos(math.radians(a)) * cell * 0.17; ly = y + math.sin(math.radians(a)) * cell * 0.17
                        d.ellipse([lx - cell * 0.13, ly - cell * 0.13, lx + cell * 0.13, ly + cell * 0.13], fill=tuple(petals[(a // 72) % len(petals)].astype(int)))
                    d.ellipse([x - cell * 0.08, y - cell * 0.08, x + cell * 0.08, y + cell * 0.08], fill=tuple((petals[0] * 0.75).astype(int)))
                    for a in (30, 150, 270):
                        lx = x + math.cos(math.radians(a)) * cell * 0.38; ly = y + math.sin(math.radians(a)) * cell * 0.38
                        d.ellipse([lx - cell * 0.09, ly - cell * 0.05, lx + cell * 0.09, ly + cell * 0.05], fill=tuple(leaf.astype(int)))
    im = im.resize((size, size), Image.LANCZOS)
    a = np.asarray(im, dtype=np.float64) * (1 + pnoise(size, size, 1.5, 1.5, seed + 5, 2)[..., None] * 0.05)
    save(img(a), name)

def curtain_damask():
    # inner drape of the back room: blue-grey ground, gold floral (R01 / R05). PROVISIONAL repeat 0.4 m.
    ground = np.array([96, 108, 122.]); gold = np.array([166, 140, 92.])
    floral('curtain_floral', ground, [gold, gold * 0.9], gold * 0.8, 512, 2, 4)

def linen():
    n = 256; base = col('bed_white'); r = pnoise(n, n, 1.0, 40, 50) * 0.5 + pnoise(n, n, 40, 1.0, 51) * 0.5
    save(img(tint(base, r, 0.07)), 'linen')

def plain(name, base, k=0.05, s=2.0, n=256, seed=60):
    save(img(tint(np.asarray(base, dtype=np.float64), pnoise(n, n, s, s, seed, 2), k)), name)

# ---------------------------------------------------------------- rugs (full size, not tiled)
def rug_pink():
    # PROVISIONAL design: pink field, cream/green floral medallion, red border (R01 shows these tonal
    # relationships; the individual motifs are not resolvable). 2.1 x 2.05 m.
    n = 1024; field = col('rug_pink'); border = np.array([172, 96, 82.]); cream = np.array([228, 214, 190.]); green = np.array([120, 130, 96.])
    im = Image.new('RGB', (n, n), tuple(field.astype(int))); d = ImageDraw.Draw(im)
    m = int(n * 0.09)
    d.rectangle([0, 0, n - 1, n - 1], fill=tuple(border.astype(int)))
    d.rectangle([m, m, n - m, n - m], fill=tuple(cream.astype(int)))
    d.rectangle([m * 1.5, m * 1.5, n - m * 1.5, n - m * 1.5], fill=tuple(field.astype(int)))
    c = n / 2
    for k, (rad, f) in enumerate(((0.33, cream), (0.27, field * 0.93), (0.20, border * 1.05), (0.13, cream), (0.07, green))):
        d.ellipse([c - rad * n, c - rad * n, c + rad * n, c + rad * n], fill=tuple(f.astype(int)))
    for a in range(0, 360, 30):
        x = c + math.cos(math.radians(a)) * n * 0.30; y = c + math.sin(math.radians(a)) * n * 0.30
        d.ellipse([x - 22, y - 22, x + 22, y + 22], fill=tuple((cream if (a // 30) % 2 else green).astype(int)))
    for i in range(14):                                   # border florets
        t = (i + 0.5) / 14 * (n - 2 * m * 1.25) + m * 1.25
        for (x, y) in ((t, m * 0.5), (t, n - m * 0.5), (m * 0.5, t), (n - m * 0.5, t)):
            d.ellipse([x - 9, y - 9, x + 9, y + 9], fill=tuple(cream.astype(int)))
    a = np.asarray(im, dtype=np.float64) * (1 + pnoise(n, n, 1.5, 1.5, 70, 3)[..., None] * 0.10)
    save(img(a), 'rug_pink')

def rug_oriental():
    # PROVISIONAL design: rust field, navy + cream guard borders, repeated medallions: the tones and the
    # border structure seen in R01 (only the far edge of this rug is visible). 3.1 x 2.4 m.
    w, h = 1024, 792; rust = col('rug_oriental', 'median'); navy = np.array([46, 54, 78.]); cream = np.array([198, 170, 130.]); tan = rust * 1.25
    im = Image.new('RGB', (w, h), tuple(navy.astype(int))); d = ImageDraw.Draw(im)
    m = 70
    d.rectangle([m * 0.5, m * 0.5, w - m * 0.5, h - m * 0.5], fill=tuple(cream.astype(int)))
    d.rectangle([m, m, w - m, h - m], fill=tuple(rust.astype(int)))
    for i in range(4):
        cx = (i + 0.5) * (w - 2 * m) / 4 + m; cy = h / 2
        d.polygon([(cx, cy - 190), (cx + 120, cy), (cx, cy + 190), (cx - 120, cy)], fill=tuple(navy.astype(int)))
        d.polygon([(cx, cy - 130), (cx + 80, cy), (cx, cy + 130), (cx - 80, cy)], fill=tuple(tan.astype(int)))
        d.ellipse([cx - 28, cy - 28, cx + 28, cy + 28], fill=tuple(rust.astype(int)))
    for x in range(int(m * 1.4), int(w - m), 46):
        d.polygon([(x, m * 0.5 + 6), (x + 14, m * 0.5 + 30), (x, m * 0.5 + 54), (x - 14, m * 0.5 + 30)], fill=tuple(navy.astype(int)))
        d.polygon([(x, h - m * 0.5 - 6), (x + 14, h - m * 0.5 - 30), (x, h - m * 0.5 - 54), (x - 14, h - m * 0.5 - 30)], fill=tuple(navy.astype(int)))
    a = np.asarray(im, dtype=np.float64) * (1 + pnoise(h, w, 1.5, 1.5, 71, 3)[..., None] * 0.10)
    save(img(a), 'rug_oriental')

if __name__ == '__main__':
    wood('wood_dark', col('door_wood'), ring=0.5, dark=0.30)
    wood('wood_mid', col('cabinet_wood') * 0.80, ring=0.55, dark=0.34)
    wood('wood_oak', col('chair_oak') * 1.12, ring=0.6, dark=0.36)
    floorboards(); wallpaper_main(); wallpaper_back(); velvet(); cane(); curtain_damask(); linen()
    floral('coverlet_pink', col('bed_pink') * 0.95, [col('bed_pink') * 1.08, col('bed_pink') * 0.85], col('bed_pink') * 0.7, 512, 3, 8)
    floral('tapestry', np.array([150, 120, 80.]), [np.array([200, 110, 100.]), np.array([225, 170, 120.])], np.array([96, 112, 84.]), 256, 2, 12)
    floral('shawl', np.array([196, 142, 52.]), [np.array([48, 76, 140.]), np.array([196, 92, 96.]), np.array([236, 200, 120.])], np.array([70, 110, 84.]), 256, 3, 14)
    plain('drape_outer', col('curtain_R05') * 0 + np.array([62, 70, 78.]), 0.08, 1.2, 256, 61)
    rug_pink(); rug_oriental()
