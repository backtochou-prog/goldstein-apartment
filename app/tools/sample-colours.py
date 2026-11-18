#!/usr/bin/env python3
"""Sample material colours from the reference images (private, not shipped).
Usage: python3 -I tools/sample-colours.py   -> writes src/interior/sampled-colours.json
Each entry: image, pixel box, and the median / 15th / 85th percentile sRGB of that region.
These are PHOTOGRAPHED colours: they include the set lighting and the photo's grading. They are
the best available evidence of the colour relationships, not true albedo."""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
IMG = {
  'R01': ROOT / 'reference/stills/SET/F00001_WW-FACTFILE_hp_apt1.png',
  'R02': ROOT / 'reference/stills/PROMO/F00002_WW-FACTFILE_hp_apt2.png',
  'R05': ROOT / 'reference/frames/SC45/F00005_HPFZ-STILLS_fz_jacob-and-the-hot-chocolate.jpg',
}
# name: (image, (x0, y0, x1, y1), what)
REGIONS = {
  'wallpaper_main_right':   ('R01', (1620, 60, 1790, 330), 'main-room damask, right wall, brightest frontal part'),
  'wallpaper_main_pier':    ('R01', (1320, 330, 1430, 560), 'main-room damask, right pier'),
  'wallpaper_main_left':    ('R01', (400, 40, 520, 260), 'main-room damask, left pier'),
  'wallpaper_back':         ('R01', (895, 220, 935, 420), 'back-room sprig paper between the windows'),
  'wallpaper_bedroom_R05':  ('R05', (230, 40, 330, 200), 'SC45 bedroom wall paper (film frame)'),
  'floorboards':            ('R01', (1165, 850, 1310, 1010), 'main-room floorboards'),
  'door_wood':              ('R01', (590, 280, 650, 400), 'pocket-door leaf, dark stained wood'),
  'chair_oak':              ('R01', (868, 655, 985, 700), 'pressed-back chair crest'),
  'table_top':              ('R01', (790, 660, 940, 700), 'dining table top'),
  'cabinet_wood':           ('R01', (230, 580, 340, 680), 'mirror cabinet lower body'),
  'cabinet_backboard':      ('R01', (180, 160, 250, 215), 'mirror cabinet crest panel'),
  'trefoil_top':            ('R01', (200, 915, 330, 935), 'trefoil table top'),
  'sink_cabinet':           ('R01', (1650, 850, 1780, 1000), 'sink cabinet end'),
  'sink_ceramic':           ('R01', (1530, 760, 1620, 800), 'sink interior glaze'),
  'splashback_ceramic':     ('R01', (1710, 610, 1790, 660), 'ceramic splashback panel'),
  'range_iron':             ('R01', (1370, 760, 1440, 820), 'cast-iron range'),
  'velvet_seat':            ('R01', (560, 1010, 700, 1070), 'armchair seat velvet'),
  'velvet_back':            ('R01', (590, 790, 640, 850), 'armchair back velvet'),
  'cushion_ruched':         ('R01', (420, 870, 520, 930), 'silver-grey ruched cushion'),
  'rug_pink':               ('R01', (900, 1010, 1050, 1050), 'pink floral rug field'),
  'rug_oriental':           ('R01', (1000, 1160, 1400, 1230), 'oriental rug (mixed field)'),
  'curtain_outer':          ('R01', (680, 250, 720, 480), 'back room outer drape'),
  'curtain_inner':          ('R01', (905, 260, 930, 420), 'back room inner floral drape'),
  'bed_pink':               ('R01', (1020, 560, 1090, 600), 'right bed pink coverlet'),
  'bed_white':              ('R01', (700, 540, 800, 580), 'left bed white spread'),
  'bed_wood':               ('R01', (730, 505, 800, 520), 'bed headboard wood'),
  'shade_peach':            ('R01', (110, 330, 180, 372), 'sconce tulip shade'),
  'shade_domed':            ('R01', (140, 690, 260, 730), 'domed painted-glass lamp shade'),
  'shelf_wood':             ('R01', (1560, 436, 1700, 448), 'kitchen shelf'),
  'brass_tap':              ('R01', (1695, 640, 1725, 670), 'tap brass'),
  'curtain_R05':            ('R05', (190, 40, 250, 330), 'SC45 curtain, blue-grey with gold'),
  'coverlet_R05':           ('R05', (330, 360, 560, 420), 'SC45 bed pink coverlet'),
  'fireplace_black':        ('R02', (900, 760, 1150, 900), 'fireplace surround'),
  'wall_R02':               ('R02', (240, 150, 330, 500), 'wall paper near fireplace (film still)'),
  'lampshade_R02':          ('R02', (720, 300, 900, 380), 'fringed lamp shade lit'),
}
out = {}
for name, (img, box, what) in REGIONS.items():
    im = np.asarray(Image.open(IMG[img]).convert('RGB'), dtype=np.float32)
    x0, y0, x1, y1 = box
    px = im[y0:y1, x0:x1].reshape(-1, 3)
    med = np.median(px, 0); lo = np.percentile(px, 15, 0); hi = np.percentile(px, 85, 0)
    hexs = lambda v: '#%02x%02x%02x' % tuple(int(round(c)) for c in v)
    out[name] = {'image': img, 'box': list(box), 'what': what, 'median': hexs(med), 'p15': hexs(lo), 'p85': hexs(hi)}
    print(f'{name:24s} {img} {str(box):22s} median {hexs(med)}  p15 {hexs(lo)}  p85 {hexs(hi)}')
dest = Path(__file__).resolve().parents[1] / 'src/interior/sampled-colours.json'
dest.parent.mkdir(parents=True, exist_ok=True)
dest.write_text(json.dumps(out, indent=1))
print('wrote', dest)
