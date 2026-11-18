# Material Reference Guide — Phase 3

Generated tables + hand-written method (`app/tools/gen-docs.mjs`). Colours: `app/src/interior/sampled-colours.json` (`python3 -I tools/sample-colours.py`). Textures: `app/public/textures/` (`python3 -I tools/make-textures.py`). Material definitions: `app/src/interior/material-defs.js`.

## Principles
1. **Colour comes from the references, not from taste.** Every colour that has an evidence tag **SAMPLED** is the median (or a stated percentile) of a pixel box in R01, R02 or R05. They are *photographed* colours: they include the set lighting and the photograph's grading, so they are the best evidence of the colour **relationships**, not of absolute albedo. Phase 4 calibrates exposure against the film lighting.
2. **Nothing is invented where the reference is silent.** A pattern that no image resolves (wallpaper motifs, rug motifs, floral fabrics) is **drawn** by me from the sampled tones and marked PROVISIONAL. Only the repeat size of the main wallpaper is measured.
3. **No artificial wear.** The reference shows an old, worn, lived-in apartment; I only added the subtle variation visible in it (board-to-board tone, grain). No dirt maps, scratches or grunge.
4. **Physically based, lighting-neutral.** Albedo + roughness + metalness (MeshStandardMaterial). No baked light, no emissive glow except a faint lift on lamp shades so they read as translucent. Wood roughness 0.55-0.62 (satin, not glossy), fabrics 0.9-0.95, glazed ceramic 0.22, brass 0.34/metal 0.9, black iron 0.55/metal 0.55, mirror 0.12/metal 0.75. A soft neutral environment map (RoomEnvironment, intensity 0.45) lets metal and glass show reflections.

## Material table
| Key | Use | Texture (tiles per metre) | Colour / evidence | Roughness / metal |
|---|---|---|---|---|
| `woodDark` | pocket doors, casing, skirting, bed frames, armchair frame | wood_dark (2) | SAMPLED (door_wood, bed_wood) | 0.62 / 0 |
| `woodMid` | cabinets, side tables, shelves | wood_mid (2) | SAMPLED (cabinet_wood, trefoil_top) | 0.58 / 0 |
| `woodOak` | pressed-back chairs, dining table | wood_oak (2) | SAMPLED (chair_oak, table_top) | 0.55 / 0 |
| `velvet` | armchair upholstery | velvet (5) | SAMPLED (velvet_seat) | 0.95 / 0 |
| `cane` | armchair side panels | cane (9) | PROVISIONAL weave (colour typical of cane) | 0.8 / 0 |
| `linen` | bed spread, dress form, ironing board cover | linen (4) | SAMPLED (bed_white) | 0.95 / 0 |
| `tapestry` | floral cushion | tapestry (4) | PROVISIONAL pattern; floral cushion tones seen in R01 | 0.9 / 0 |
| `shawl` | shawl over the armchair | shawl (3) | PROVISIONAL pattern; gold / blue / pink tones seen in R01 | 0.7 / 0 |
| `coverlet` | right bed coverlet | coverlet_pink (2.5) | SAMPLED (bed_pink); floral pattern PROVISIONAL | 0.9 / 0 |
| `curtainFloral` | inner drapes | curtain_floral (2.5) | PROVISIONAL pattern; blue-grey and gold seen in R01 / R05 | 0.85 / 0 |
| `drape` | outer drapes | drape_outer (3) | SAMPLED (curtain_outer) | 0.95 / 0 |
| `rugPink` | rug under the dining table | rug_pink (whole object) | SAMPLED field/border tones; motifs PROVISIONAL | 1 / 0 |
| `rugOriental` | foreground rug | rug_oriental (whole object) | SAMPLED tones; design PROVISIONAL (only the far edge is visible) | 1 / 0 |
| `ironBlack` | range, fireplace, grate | - | #17120e · SAMPLED (range_iron, fireplace_black) | 0.55 / 0.55 |
| `brass` | taps, knobs, finials | - | #9a7440 · SAMPLED (brass_tap) | 0.34 / 0.9 |
| `ceramic` | sink, splashback | - | #d6c49b · SAMPLED (splashback_ceramic p85) | 0.22 / 0 |
| `solid` | small props painted by vertex colour | - | #ffffff · per-part tint (SAMPLED or PROVISIONAL, recorded per object) | 0.7 / 0 |
| `gilt` | picture frame | - | #b58b3a · PROVISIONAL (gilt frame seen in R02) | 0.4 / 0.75 |
| `mirror` | mirror glass | - | #8d8a80 · design choice for a plain mirror | 0.12 / 0.75 |
| `glass` | cabinet glazing, lamp chimney | - | #dfe8ef · design choice | 0.05 / 0 · opacity 0.22 |
| `shadePeach` | tulip sconce shades | - | #d09b63 · SAMPLED (shade_peach) | 0.6 / 0 · opacity 0.92 |
| `shadeDomed` | painted-glass dome lamp | - | #b2b29f · SAMPLED (shade_domed) | 0.35 / 0 · opacity 0.94 |
| `sheer` | window nets | - | #f1efe3 · SAMPLED (curtain_inner is the nets in the doorway view) | 0.95 / 0 · opacity 0.38 |
| `shadeFringe` | fabric fringed shades | - | #fae6c9 · SAMPLED (lampshade_R02) | 0.9 / 0 · opacity 0.96 |

### Architecture finishes (finish layer; geometry untouched)
| Surface | Finish | Evidence |
|---|---|---|
| wallMain | wallpaper_main (0.256 x 0.365 m per tile) | MEASURED repeat (half-drop lattice 0.256 x 0.365 m on R01 piers); motifs PROVISIONAL |
| wallBack | wallpaper_back (0.16 x 0.16 m per tile) | PROVISIONAL pattern and repeat; colour SAMPLED (wallpaper_back) |
| floor | floorboards (0.6 x 1.2 m per tile) | SAMPLED colour; board width 0.15 m PROVISIONAL |
| trim | woodDark  | dark stained wood, as the doors and skirting in R01 |
| ceiling | #d9d2c2  | PROVISIONAL (ceiling never seen) |

## Sampled colour evidence
| Name | Image | Pixel box | What | Median | 15th pct | 85th pct |
|---|---|---|---|---|---|---|
| wallpaper_main_right | R01 | 1620, 60, 1790, 330 | main-room damask, right wall, brightest frontal part | `#846a51` | `#6a503a` | `#997f66` |
| wallpaper_main_pier | R01 | 1320, 330, 1430, 560 | main-room damask, right pier | `#79593c` | `#614228` | `#906e4e` |
| wallpaper_main_left | R01 | 400, 40, 520, 260 | main-room damask, left pier | `#ae8c6d` | `#926e51` | `#c7a686` |
| wallpaper_back | R01 | 895, 220, 935, 420 | back-room sprig paper between the windows | `#eeebdc` | `#e8e5d1` | `#f1eee2` |
| wallpaper_bedroom_R05 | R05 | 230, 40, 330, 200 | SC45 bedroom wall paper (film frame) | `#181712` | `#0c0b06` | `#24221d` |
| floorboards | R01 | 1165, 850, 1310, 1010 | main-room floorboards | `#4c2e1c` | `#381e10` | `#b57c55` |
| door_wood | R01 | 590, 280, 650, 400 | pocket-door leaf, dark stained wood | `#40210f` | `#321909` | `#4b2b1a` |
| chair_oak | R01 | 868, 655, 985, 700 | pressed-back chair crest | `#642e11` | `#54240a` | `#783e1e` |
| table_top | R01 | 790, 660, 940, 700 | dining table top | `#662f12` | `#4f2209` | `#b09680` |
| cabinet_wood | R01 | 230, 580, 340, 680 | mirror cabinet lower body | `#744618` | `#321b08` | `#906530` |
| cabinet_backboard | R01 | 180, 160, 250, 215 | mirror cabinet crest panel | `#8b4e1d` | `#5a2c0c` | `#9d5e2c` |
| trefoil_top | R01 | 200, 915, 330, 935 | trefoil table top | `#874c1c` | `#503912` | `#985e3d` |
| sink_cabinet | R01 | 1650, 850, 1780, 1000 | sink cabinet end | `#1c0703` | `#170402` | `#230b05` |
| sink_ceramic | R01 | 1530, 760, 1620, 800 | sink interior glaze | `#be8e55` | `#b07d38` | `#cb9f6a` |
| splashback_ceramic | R01 | 1710, 610, 1790, 660 | ceramic splashback panel | `#cab58a` | `#7f6233` | `#d6c49b` |
| range_iron | R01 | 1370, 760, 1440, 820 | cast-iron range | `#0f0a06` | `#0a0603` | `#18110b` |
| velvet_seat | R01 | 560, 1010, 700, 1070 | armchair seat velvet | `#7c7b6a` | `#6f6d54` | `#8e8a78` |
| velvet_back | R01 | 590, 790, 640, 850 | armchair back velvet | `#4d3922` | `#230f06` | `#a36c50` |
| cushion_ruched | R01 | 420, 870, 520, 930 | silver-grey ruched cushion | `#bcc4ad` | `#89947b` | `#d9dec9` |
| rug_pink | R01 | 900, 1010, 1050, 1050 | pink floral rug field | `#d5b9a4` | `#b38b65` | `#e3c9bd` |
| rug_oriental | R01 | 1000, 1160, 1400, 1230 | oriental rug (mixed field) | `#92623c` | `#51301a` | `#b7885e` |
| curtain_outer | R01 | 680, 250, 720, 480 | back room outer drape | `#302f24` | `#171610` | `#a48e6c` |
| curtain_inner | R01 | 905, 260, 930, 420 | back room inner floral drape | `#efecdf` | `#edeada` | `#f1efe3` |
| bed_pink | R01 | 1020, 560, 1090, 600 | right bed pink coverlet | `#e8ad8c` | `#d48b6b` | `#fde3d1` |
| bed_white | R01 | 700, 540, 800, 580 | left bed white spread | `#d9d1ba` | `#baaa7f` | `#f2efeb` |
| bed_wood | R01 | 730, 505, 800, 520 | bed headboard wood | `#2f1a14` | `#110504` | `#4f281f` |
| shade_peach | R01 | 110, 330, 180, 372 | sconce tulip shade | `#d09b63` | `#b77d41` | `#e5bf8d` |
| shade_domed | R01 | 140, 690, 260, 730 | domed painted-glass lamp shade | `#b2b29f` | `#8b8e7b` | `#dbe1d1` |
| shelf_wood | R01 | 1560, 436, 1700, 448 | kitchen shelf | `#5b3e22` | `#201408` | `#83644b` |
| brass_tap | R01 | 1695, 640, 1725, 670 | tap brass | `#826037` | `#4d2d0d` | `#cfb98b` |
| curtain_R05 | R05 | 190, 40, 250, 330 | SC45 curtain, blue-grey with gold | `#1e1c17` | `#16140c` | `#2f2e2e` |
| coverlet_R05 | R05 | 330, 360, 560, 420 | SC45 bed pink coverlet | `#6c544b` | `#453225` | `#8f706a` |
| fireplace_black | R02 | 900, 760, 1150, 900 | fireplace surround | `#181411` | `#0b0a0a` | `#28231a` |
| wall_R02 | R02 | 240, 150, 330, 500 | wall paper near fireplace (film still) | `#866e4c` | `#382a17` | `#b4a384` |
| lampshade_R02 | R02 | 720, 300, 900, 380 | fringed lamp shade lit | `#fae6c9` | `#8a6842` | `#fefbf0` |

Two boxes are known to be poor (the R05 wall and the R05 curtain were boxed on the wrong part of that 1050 px frame); their values are **not used**.

## Wallpaper (the one pattern with a measured repeat)
- **Measured:** the pocket-door piers are frontal in R01. A 2-D autocorrelation on both piers gives a half-drop lattice: vertical repeat 88-89 px, half-drop offset (31, 44) px, at 241.9 px/m → **0.256 m wide × 0.365 m high**. Both piers agree.
- **Colours:** ground = 85th percentile and motif = 15th percentile of the lit left pier.
- **Motif shape: drawn, not traced.** I tried to recover the real damask by averaging the ~15 repeats visible on the right pier (lattice averaging). The result smeared: the lattice is known only to about ±1 px and the error accumulates over the repeats. That attempt was **abandoned** (and its script deleted); the texture is a clean drawn medallion on the measured lattice. At VR viewing distance it reads as a patterned damask paper; the individual scrolls of the real paper are not reproduced. A flat-on film frame of the paper would allow a faithful trace.
- **Back-room paper:** colour sampled (cream); small diamond lattice, repeat 0.16 m: **provisional**.
- Cooper Hewitt (named by the set decorator, Anna Pinnock) is the lawful lead for the original pattern (see `MISSING_REFERENCES_AND_DECISIONS.md`, M7).

## Wood
Three tints from one procedural grain (periodic, FFT-filtered noise, no seams): **woodDark** (doors, casing, bed frames, armchair frame: median of the leaf and headboard boxes), **woodMid** (cabinets, side tables), **woodOak** (pressed-back chairs and dining table). Grain follows each member's long axis (per-triangle metric UVs). Floor: dark red-brown boards 0.15 m wide (PROVISIONAL width) running along z, with butt joints and board-to-board tone variation.

## Fabrics
Velvet (armchair: sampled grey-green), cane (side panels: provisional weave in a typical cane colour), linen (spreads, dress form: sampled), floral coverlet (sampled pink, drawn florals), blue-grey outer drapes (sampled), blue-and-gold inner drapes (provisional pattern, tones from R01/R05), shawl (gold, blue, rose: tones from R01), tapestry cushion (provisional). All fabrics have roughness ≥ 0.85 so they never shine.

## Rugs
Pink floral rug: extent **measured** from the visible corner and edges (2.10 × 2.05 m); field and border tones sampled; motifs drawn. Oriental rug: only the far edge and border are visible; size and design are **placeholders** (rust field, navy and cream borders from the sampled mix).

## Metal, glass, ceramic
Black iron (range, fireplace, columns, brackets), brass (taps, finials, rod, knobs), glazed cream ceramic (sink and splashback: colour from the splashback's 85th percentile), glass (translucent, no refraction), peach tulip sconce shades and the pale-green domed lamp (translucent with a faint emissive lift), fringed fabric shades (translucent). The mirror is a plain reflective panel; nothing is invented about what it reflects.

## Lighting-compatibility check (not the lighting system)
The inspector has a **neutral inspection light** and a **warm fire test** (one orange point light at the fireplace, everything else dimmed). The test exists only to check that materials stay believable under warm light; it is not the film lighting. Screens: `reference/analysis/phase3-screens/05-fire-test-fireplace-side.png`, `06-fire-test-spawn-view.png`.
Observed: wood stays satin (no plastic highlights), wallpaper and fabrics warm evenly, brass and the lamp shades read as metal and glass, the black iron keeps its shape. Known weaknesses: the mirror reads as a dark panel in a dim room; the cream ceramic and wallpaper may need a slightly lower albedo under the film's exposure (Phase 4).

## Texture inventory
| File | Size |
|---|---|
| wood_dark.png | 512 x 512 |
| wood_mid.png | 512 x 512 |
| wood_oak.png | 512 x 512 |
| velvet.png | 256 x 256 |
| cane.png | 256 x 256 |
| linen.png | 256 x 256 |
| tapestry.png | 256 x 256 |
| shawl.png | 256 x 256 |
| coverlet_pink.png | 512 x 512 |
| curtain_floral.png | 512 x 512 |
| drape_outer.png | 256 x 256 |
| rug_pink.png | 1024 x 1024 |
| rug_oriental.png | 1024 x 792 |
| wallpaper_main.png | 512 x 730 |
| wallpaper_back.png | 256 x 256 |
| floorboards.png | 512 x 1024 |

Total GPU estimate with mipmaps: **23.0 MB** (uncompressed RGBA8). Quest 2 standalone would use KTX2/ASTC (about a quarter of that).

## Known limitations
Pattern motifs are drawn, not traced. Colours are as-photographed (set lighting included). No normal or roughness maps yet (roughness is per material); wood grain relief and fabric weave are Phase 4 polish if the lighting needs them. Ceiling colour is a placeholder (never seen).
