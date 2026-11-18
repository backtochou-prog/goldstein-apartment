# Object Placement Manifest — Phase 3

Generated from `app/src/spec/objects.js` + the measured R01 fit by `npm run docs`. Machine-readable copy: `app/exports/object-manifest.json` (`npm run manifest`).

## Frame and conventions
Same world frame as Phase 2: **metres**; x from the main-room left wall, z from the pocket-door wall face (+z toward the unseen fourth wall and the R01 camera), y up. Yaw is in degrees about +y; **yaw 0 = the object's front faces +z**, yaw 90 faces +x (into the room from the left wall), yaw −90 faces −x (into the room from the right wall). Tilt (cushions) is applied after yaw.

Positions are **computed from R01 pixel anchors** through the same camera model as the architecture (floor contacts, wall contacts, or a located support), so they follow the solve assumptions. They were then compared with the photograph (below).

## Confidence definitions
| Term | Meaning |
|---|---|
| Position **VERIFIED** | Located by an image anchor (floor or wall contact, or sitting on a located support), within the solve uncertainty: about ±0.15 m laterally and ±15 % in depth. |
| Position **PROVISIONAL** | The sight line is known but depth is not, or the spot is a stated placeholder. Always has a note. |
| Orientation | VERIFIED / PROVISIONAL, same reading. |
| Size | **MEASURED** = model size checked against the visible R01 pixel box · ESTIMATED · PROVISIONAL. |
| Layer | **R01** = the dressing in the set photograph (default). **SC41** = script props (dress form, ironing board), hidden by default because their position is not established. |

## Summary
**75 objects: 48 with a verified position, 27 provisional.** Orientation verified: 33. Size measured: 14.

| Group | Objects | Verified | Provisional |
|---|---|---|---|
| Fireplace | 5 | 1 | 4 |
| Storage | 2 | 1 | 1 |
| Lighting | 6 | 4 | 2 |
| Decor | 14 | 6 | 8 |
| Tables | 4 | 2 | 2 |
| Seating | 5 | 2 | 3 |
| Textiles | 11 | 11 | 0 |
| Rugs | 2 | 1 | 1 |
| Kitchen | 19 | 17 | 2 |
| Bedroom | 5 | 3 | 2 |
| Dressmaking | 2 | 0 | 2 |

## Fit to the photograph (R01)
For 64 objects a pixel box was read from R01. Each object's real geometry is projected through the solved R01 camera and compared. **Cover** = how much of the visible photo box the model covers (the box is the *visible* part, so partly hidden objects can only be checked this way); **IoU** is also given.
- Median cover **79 %**; 57 of 64 objects ≥ 60 %; 30 ≥ 80 %.
- Below 60 %: `photo_b` 24 %, `cushion_floral` 53 %, `lantern_lamp` 56 %, `tin_green` 53 %, `fp_tin` 52 %, `photo_a` 55 %, `figurine` 55 %.
- **This check is not independent evidence of position**: the anchors and the boxes come from the same photograph, and several dimensions were tuned to the image rows (listed in the changelog). It verifies that the model *looks like the photograph through the photograph's camera*, which is the stated goal. The independent check is the film.

Visual checks: `reference/analysis/phase3-screens/01-R01-furnished-render.png` and `02-R01-blend-50.png`; run `npm run compare -- <prefix>` for side-by-side and blend images and `python3 -I tools/edge-overlay.py` for an edge overlay.

## Correction to Phase 2 (C-1)
The mantel-projection assumption was changed from 0.30 m to **0.50 m** (range 0.25-0.56 m). Reason: with 0.30 m the fireplace began at z 1.63 m, which overlaps the mirror sideboard seen in the same photograph (the sideboard's near end and the mantel end share a depth in R01, around z 1.97 m). Effect: the fireplace mass starts at z 1.97 m instead of 1.63 m and is 0.50 m deep instead of 0.30 m; mantel height 1.35 m (was 1.33 m). Nothing else in the architecture moved: 23 of 26 elements are bit-identical to Phase 2 (`app/tools/phase2-arch-hash.json`, checked by the test suite).

## Object table
Columns: ID · position (x, y, z) · yaw · support · position / orientation / size confidence · cover (R01 fit).

### Fireplace
| ID | x | y | z | yaw° | Support | Pos | Ori | Size | Cover | Anchors / notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `fp_column_far` | 0.51 | 0.00 | 2.62 | 0 | floor | ◇ | ✔ | E | 69 % | Flanks the arched firebox · R01 shows a black spiral-turned column at the left frame edge (x 0-100 px, y 1000-1248); the sight line puts it at z about 2.6. The number of columns is not established; one each side of the arch is the most economical reading, so the arch is centred between the two. |
| `fp_column_near` | 0.51 | 0.00 | 3.30 | 0 | floor | ◇ | ✔ | E | - | Out of frame in R01: placed symmetrically to the visible column. |
| `fp_arch` | 0.50 | 0.00 | 2.96 | 90 | fireplace (architecture) | ◇ | ✔ | P | - | R02: arched insert between two spiral columns; centred between the two columns placed from R01 · R02 shows the arched insert. Its size and height are not measurable in R01 (out of frame). |
| `fp_picture` | 0.02 | 1.80 | 2.96 | 90 | chimney-breast wall | ◇ | ✔ | P | - | Above the mantel, centred on the surround · R02 shows a gilt frame with a pale mat above the mantel. Its subject is not legible, so the print is a neutral dark panel (no invented artwork). Size and position are approximate. |
| `fp_tin` | 0.28 | 1.41 | 2.35 | 0 | mantel shelf | ✔ | ◇ | E | 52 % | R01 (5-65, 470-495) blue round tin on the mantel at the left frame edge · The image row implies a mantel top near 1.41 m against the derived 1.35 m: inside the solve range (1.18-1.52 m). The tin is raised 0.06 m to match. |

### Storage
| ID | x | y | z | yaw° | Support | Pos | Ori | Size | Cover | Anchors / notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `small_cabinet` | 0.27 | 0.00 | 0.22 | 90 | floor | ◇ | ◇ | E | 67 % | R01 (400-495, 505-650): lantern lamp and cabinet top; the body is hidden behind the stool and armchair · Only its top and lamp are visible. Position follows the sight line and the corner; depth is not independent evidence. |
| `mirror_cabinet` | 0.23 | 0.00 | 1.26 | 90 | floor | ✔ | ✔ | M | 99 % | R01 cornice end (425, 282) = doorward end z 0.58 · R01 cornice near end (165, 230) and the mantel end (225, 512): the unit ends where the fireplace begins · Against the left wall between the small cabinet and the fireplace; two sconces flank the mirror · Cornice height 2.11 m derived. Mirror unit about 0.95 m between the columns, over the doorward half of a 1.4 m sideboard. Counter height 1.08 m adjusted so the counter items match their image rows. Fretwork, carving and the crest are simplified; lateral extent of the upper unit is about +-0.3 m. |

### Lighting
| ID | x | y | z | yaw° | Support | Pos | Ori | Size | Cover | Anchors / notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `lantern_lamp` | 0.27 | 1.08 | 0.22 | 0 | small_cabinet | ✔ | ◇ | E | 56 % |  |
| `sconce_far` | 0.19 | 1.78 | 0.00 | 0 | pocket-door wall pier | ✔ | ✔ | E | 94 % | R01 (400-445, 335-392) on the left pier, right of the mirror unit · Height 1.85 m derived (shade centre). Mount type inferred. |
| `sconce_near` | 0.20 | 1.78 | 1.62 | 0 | mirror_cabinet end | ◇ | ✔ | E | 78 % | R01 (90-195, 280-375) at the near end of the mirror unit · It hangs off the near end of the unit in R01. Whether it is wall- or unit-mounted is not resolvable. |
| `domed_lamp` | 0.91 | 0.58 | 2.74 | 0 | trefoil_table | ✔ | ✔ | M | 100 % | Bronze stem, pale green-grey dome with an ornamental brass border. |
| `nightstand_lamp` | 1.98 | 0.82 | -3.74 | 0 | nightstand | ✔ | ✔ | E | 66 % |  |
| `standard_lamp` | 0.62 | 0.00 | -3.22 | 0 | floor | ◇ | ✔ | P | 100 % | Only the shade is visible in R01; the sight line puts it beside the left bed head (z about -3.2). Pole and base are inferred (a floor lamp is the only reading that fits the shade height). |

### Decor
| ID | x | y | z | yaw° | Support | Pos | Ori | Size | Cover | Anchors / notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `aloe` | 0.23 | 1.11 | 0.59 | 0 | mirror_cabinet counter | ✔ | ◇ | E | 74 % |  |
| `photo_a` | 0.23 | 1.26 | 1.46 | 0 | mirror frame (propped) | ◇ | ◇ | E | 55 % | Photograph content is not legible: neutral grey card. |
| `photo_b` | 0.23 | 1.42 | 1.10 | 0 | mirror frame (propped) | ◇ | ◇ | E | 24 % | Stands about 0.3 m above the counter in the image rows, so it is tucked into the mirror frame or on a ledge there. The support is not resolvable; height follows the sight line. |
| `figurine` | 0.23 | 1.39 | 0.91 | 0 | mirror frame ledge | ◇ | ◇ | E | 55 % | A figure with a spread wing or drape; the pose is not resolvable. Modelled as an abstract bronze figure. |
| `writing_case` | 0.23 | 1.11 | 1.36 | 90 | mirror_cabinet counter | ✔ | ◇ | E | 84 % |  |
| `tf_books` | 1.06 | 0.58 | 2.93 | 20 | trefoil_table | ✔ | ◇ | E | 75 % | Titles and covers are not legible: plain cloth bindings in muted tones. |
| `tf_tin` | 0.98 | 0.58 | 2.92 | 0 | trefoil_table | ✔ | ◇ | E | 60 % |  |
| `tf_lower_books` | 1.02 | 0.21 | 2.85 | -25 | trefoil_table lower shelf | ✔ | ◇ | E | 100 % |  |
| `tf_cards` | 1.12 | 0.27 | 2.88 | 15 | tf_lower_books | ✔ | ◇ | E | 64 % |  |
| `nightstand_photo` | 2.11 | 0.82 | -3.69 | -10 | nightstand | ◇ | ◇ | E | - | R05 shows a small frame and a pink tin beside the bedside lamp. |
| `nightstand_tin` | 1.84 | 0.82 | -3.68 | 0 | nightstand | ◇ | ◇ | E | - | R05 shows a pink tin beside the bedside lamp; its exact spot on the nightstand is a placeholder. |
| `books_0` | 3.75 | 0.08 | -3.77 | 0 | bookshelf shelf 1 | ◇ | ◇ | E | - | Spines drawn as plain cloth bindings; titles are not legible. |
| `books_1` | 3.75 | 0.45 | -3.77 | 0 | bookshelf shelf 2 | ◇ | ◇ | E | - | Spines drawn as plain cloth bindings; titles are not legible. |
| `books_2` | 3.75 | 0.83 | -3.77 | 0 | bookshelf shelf 3 | ◇ | ◇ | E | - | Spines drawn as plain cloth bindings; titles are not legible. |

### Tables
| ID | x | y | z | yaw° | Support | Pos | Ori | Size | Cover | Anchors / notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `trefoil_table` | 1.10 | 0.00 | 2.72 | 0 | floor | ✔ | ◇ | M | 92 % | R01 leg feet (185, 1235) -> (0.98, 2.93) and (345, 1195) -> (1.23, 2.79) · In front of the fireplace; between the fireplace and the armchair |
| `stand_table` | 0.81 | 0.00 | 0.65 | 0 | floor | ◇ | ✔ | P | 87 % | R01 (490-540, 600-765): cloth-covered top and legs; the foot is hidden behind the armchair · Height 0.84 m follows from the top row and the pocket-door wall limit; depth along the sight line is not independent. |
| `dining_table` | 2.30 | 0.00 | 1.12 | 0 | floor | ✔ | ✔ | E | 79 % | R01 table top left end (768, 735) and far edge y ~640; end leg foot near (800, 960) · On the pink rug; four chairs. Long axis points at the pocket doors. |
| `round_table` | 0.78 | 0.00 | -1.55 | 0 | floor | ◇ | ◇ | E | 64 % | R01 shows a small round table with slim legs left of the left bed. Its depth is not independent evidence. |

### Seating
| ID | x | y | z | yaw° | Support | Pos | Ori | Size | Cover | Anchors / notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `armchair` | 1.72 | 0.00 | 2.41 | 15 | floor | ✔ | ✔ | M | 96 % | R01 front feet (500, 1215) -> (1.57, 2.86) and (800, 1170) -> (2.15, 2.70); front edge runs 15 degrees off the camera plane · Beside the trefoil table, on the foreground rug; faces the camera side of the room · Carved dark frame, rolled arms, caned side panels, velvet seat and back. Foot carving is simplified. |
| `chair_near` | 2.36 | 0.00 | 1.80 | 180 | floor | ✔ | ✔ | M | 92 % | Spindle back seen from behind. |
| `chair_far` | 2.26 | 0.00 | 0.47 | 0 | floor | ◇ | ✔ | E | 90 % | Only the crest and upper spindles are visible above the table. |
| `chair_left` | 1.80 | 0.00 | 1.38 | 90 | floor | ◇ | ◇ | E | 88 % | Curved back posts: may be bentwood rather than pressed-back. Modelled as pressed-back; unresolved. |
| `chair_right` | 2.82 | 0.00 | 1.32 | -90 | floor | ◇ | ◇ | E | 99 % | Only partly visible. |

### Textiles
| ID | x | y | z | yaw° | Support | Pos | Ori | Size | Cover | Anchors / notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `cushion_ruched` | 1.48 | 0.56 | 2.30 | 0 | armchair seat | ✔ | ◇ | E | 72 % | Leaning against the armchair back, left |
| `cushion_floral` | 1.66 | 0.49 | 2.63 | 16 | armchair seat | ✔ | ◇ | E | 53 % | Cushion exists with pink, orange and green floral tones. Pattern is drawn, not traced. |
| `shawl` | 1.50 | 0.89 | 2.10 | 0 | armchair back | ✔ | ◇ | E | 100 % | Gold, blue, rose and green floral silk. Pattern is drawn from tone only. |
| `rod_left` | 1.07 | 3.00 | -3.81 | 0 | window wall | ✔ | ✔ | M | 60 % |  |
| `drape_outer_left` | 0.49 | 3.00 | -3.76 | 0 | rod | ✔ | ✔ | E | 69 % |  |
| `drape_inner_left` | 1.62 | 3.00 | -3.76 | 0 | rod | ✔ | ✔ | E | 87 % | Blue-grey ground with gold floral (R01 / R05). Pattern is drawn from tone only. |
| `nets_left` | 1.07 | 3.00 | -3.86 | 0 | rod | ✔ | ✔ | E | 98 % |  |
| `rod_right` | 2.92 | 3.00 | -3.81 | 0 | window wall | ✔ | ✔ | M | 61 % |  |
| `drape_outer_right` | 3.51 | 3.00 | -3.76 | 0 | rod | ✔ | ✔ | E | 66 % |  |
| `drape_inner_right` | 2.28 | 3.00 | -3.76 | 0 | rod | ✔ | ✔ | E | 75 % | Blue-grey ground with gold floral (R01 / R05). Pattern is drawn from tone only. |
| `nets_right` | 2.92 | 3.00 | -3.86 | 0 | rod | ✔ | ✔ | E | 98 % |  |

### Rugs
| ID | x | y | z | yaw° | Support | Pos | Ori | Size | Cover | Anchors / notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `rug_pink` | 2.23 | 0.00 | 1.33 | 0 | floor | ✔ | ✔ | M | 96 % | R01 near-right corner (1290, 1095) -> (3.27, 2.36); right edge runs to (1190, 830); left edge near (610, 860) · Extent measured from the visible corner and edges. Field and border tones sampled; the individual floral motifs are not resolvable and are drawn. |
| `rug_oriental` | 2.70 | 0.00 | 3.63 | 0 | floor | ◇ | ✔ | P | 98 % | R01 far edge and fringe at y 1100-1125, x 830 to 1800+: z 2.43 · Only the far edge and border are visible. Width and depth are PLACEHOLDERS; design drawn from the sampled tones. |

### Kitchen
| ID | x | y | z | yaw° | Support | Pos | Ori | Size | Cover | Anchors / notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `range` | 3.96 | 0.00 | 1.12 | 0 | floor | ◇ | ◇ | E | 66 % | R01 leg feet y ~955 at x 1330-1460 -> front plane z 1.54 (+-0.4); front leg x 3.57 · First item of the kitchen run, ahead of the sink unit · Orientation is the main uncertainty: R01 reads best with the oven front facing the camera side. Film frames will decide. |
| `range_backplate` | 4.39 | 0.80 | 1.16 | -90 | right wall | ✔ | ✔ | M | 100 % | R01 dark panel (1510-1600, 495-620) on the right wall -> z 0.80-1.52, top 1.36 m |
| `pot_brown` | 4.11 | 0.81 | 1.04 | 0 | range hob | ✔ | ◇ | E | 73 % |  |
| `kettle_speckled` | 4.33 | 0.81 | 1.15 | 0 | range hob | ✔ | ◇ | E | 60 % |  |
| `lid_brown` | 4.08 | 0.81 | 1.29 | 0 | range hob | ◇ | ◇ | E | 94 % | A second brown lid lies on the hob in front of the pot (R01 (1440-1505, 650-672)); exact spot follows the sight line. |
| `sink_unit` | 4.18 | 0.00 | 1.97 | -90 | floor | ✔ | ✔ | M | 99 % | R01 end face (1610-1790, 790-1120) -> z 2.50; drainboard far end (1445, 700) -> z 1.43 · Against the right wall after the range; the splashback and taps are above it |
| `splashback` | 4.39 | 0.78 | 2.35 | -90 | right wall | ✔ | ✔ | M | 100 % | R01 taps at x 1730 and 1785 -> z 2.21 and 2.49 |
| `wall_shelf` | 4.32 | 1.54 | 1.82 | -90 | right wall | ✔ | ✔ | M | 98 % | R01 front edge (1545, 438) and (1800, 447): level at 1.54 m · It runs out of frame at the right: its far end (z about 2.6) is a placeholder. |
| `canister_a` | 4.32 | 1.55 | 1.76 | 0 | wall_shelf | ✔ | ◇ | E | 98 % |  |
| `canister_b` | 4.32 | 1.55 | 1.93 | 0 | wall_shelf | ✔ | ◇ | E | 99 % |  |
| `carton_blue` | 4.32 | 1.55 | 2.11 | 0 | wall_shelf | ✔ | ◇ | E | 65 % |  |
| `tin_green` | 4.32 | 1.55 | 2.24 | 0 | wall_shelf | ✔ | ◇ | E | 53 % |  |
| `tin_yellow` | 4.32 | 1.55 | 2.36 | 0 | wall_shelf | ✔ | ◇ | E | 60 % |  |
| `jar_cream` | 4.32 | 1.55 | 2.55 | 0 | wall_shelf | ✔ | ◇ | E | 100 % | A printed label begins "CU..." in R01; the text is not legible, so none is modelled. |
| `mug_a` | 4.31 | 1.38 | 1.96 | 0 | wall_shelf hooks | ✔ | ◇ | E | 66 % |  |
| `mug_b` | 4.31 | 1.38 | 2.08 | 0 | wall_shelf hooks | ✔ | ◇ | E | 69 % |  |
| `mug_c` | 4.31 | 1.38 | 2.21 | 0 | wall_shelf hooks | ✔ | ◇ | E | 71 % |  |
| `skimmer` | 4.33 | 1.50 | 1.53 | 0 | right wall | ✔ | ◇ | E | 72 % |  |
| `ladle` | 4.33 | 1.50 | 1.68 | 0 | right wall | ✔ | ◇ | E | 97 % |  |

### Bedroom
| ID | x | y | z | yaw° | Support | Pos | Ori | Size | Cover | Anchors / notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `bed_left` | 1.25 | 0.00 | -2.94 | 0 | floor | ✔ | ✔ | M | 97 % | R01 foot posts at y ~705 -> z -2.0 (derived) · Head against the window wall, left of the nightstand |
| `bed_right` | 2.98 | 0.00 | -2.94 | 0 | floor | ✔ | ✔ | M | 79 % | Dark turned posts with ball finials, curved headboard, beaded foot rail (R01, R05). The foot of this bed carries a draped white cloth. |
| `nightstand` | 1.98 | 0.00 | -3.74 | 0 | floor | ✔ | ✔ | E | 81 % |  |
| `basket` | 2.98 | 0.00 | -2.39 | 0 | floor (under the right bed) | ◇ | ✔ | E | 68 % | It appears to stand under the right bed, beside the foot, with white linen in it. |
| `bookshelf` | 3.95 | 0.00 | -3.77 | 0 | floor | ◇ | ◇ | E | - | R05 (SC45) shows a dark bookshelf with books to the right of the bed. R01 does not show that wall. Position, size and shelf count are placeholders. |

### Dressmaking
| ID | x | y | z | yaw° | Support | Pos | Ori | Size | Cover | Anchors / notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `dress_form` *(SC41)* | 1.15 | 0.00 | 3.70 | 90 | floor | ◇ | ◇ | E | - | SC41: in front of the fire, mending a dress by magic (script); not present in R01 · Linen torso, black neck cap and shoulder knob are seen in R02-R04. WHERE it stands is not established: R02 and R03 put it by the fireplace, R04 in the twin-bed room. This is a stated placeholder, and the layer is off by default. |
| `ironing_board` *(SC41)* | 2.00 | 0.00 | -1.00 | 0 | floor | ◇ | ◇ | E | - | R04 shows it in the window room beside the nightstand; script SC41 puts the self-working iron in a corner · The iron itself is not shown in any catalogued image: NOT modelled. Position is a placeholder. |

## Relationships between objects (as placed)
- **Fireplace barley-twist column (doorward side of the arch)** (`fp_column_far`): Flanks the arched firebox.
- **Framed picture above the mantel** (`fp_picture`): Above the mantel, centred on the surround.
- **Mirror-back sideboard (overmantel unit)** (`mirror_cabinet`): Against the left wall between the small cabinet and the fireplace; two sconces flank the mirror.
- **Trefoil two-tier side table** (`trefoil_table`): In front of the fireplace; between the fireplace and the armchair.
- **Caned bergère armchair (green velvet)** (`armchair`): Beside the trefoil table, on the foreground rug; faces the camera side of the room.
- **Silver-grey ruched cushion** (`cushion_ruched`): Leaning against the armchair back, left.
- **Dining table** (`dining_table`): On the pink rug; four chairs. Long axis points at the pocket doors..
- **Cast-iron range** (`range`): First item of the kitchen run, ahead of the sink unit.
- **Sink cabinet with drainboard and Belfast sink** (`sink_unit`): Against the right wall after the range; the splashback and taps are above it.
- **Twin bed, left (white spread)** (`bed_left`): Head against the window wall, left of the nightstand.
- **Dressmaker's dummy** (`dress_form`): SC41: in front of the fire, mending a dress by magic (script); not present in R01.
- **Ironing board with pink cover** (`ironing_board`): R04 shows it in the window room beside the nightstand; script SC41 puts the self-working iron in a corner.
- Supported objects (position follows their support): `lantern_lamp` → small_cabinet; `aloe` → mirror_cabinet counter; `photo_a` → mirror frame (propped); `photo_b` → mirror frame (propped); `figurine` → mirror frame ledge; `writing_case` → mirror_cabinet counter; `domed_lamp` → trefoil_table; `tf_books` → trefoil_table; `tf_tin` → trefoil_table; `tf_lower_books` → trefoil_table lower shelf; `tf_cards` → tf_lower_books; `cushion_ruched` → armchair seat; `cushion_floral` → armchair seat; `shawl` → armchair back; `pot_brown` → range hob; `kettle_speckled` → range hob; `lid_brown` → range hob; `canister_a` → wall_shelf; `canister_b` → wall_shelf; `carton_blue` → wall_shelf; `tin_green` → wall_shelf; `tin_yellow` → wall_shelf; `jar_cream` → wall_shelf; `mug_a` → wall_shelf hooks; `mug_b` → wall_shelf hooks; `mug_c` → wall_shelf hooks; `skimmer` → right wall; `ladle` → right wall; `nightstand_lamp` → nightstand; `nightstand_photo` → nightstand; `nightstand_tin` → nightstand; `books_0` → bookshelf shelf 1; `books_1` → bookshelf shelf 2; `books_2` → bookshelf shelf 3.

## Collision boundaries (prepared for later interactions)
20 objects carry collision boxes (20 boxes; local box + world AABB in the JSON export). They are axis-aligned in world space (a rotated piece gets its conservative bounding box), so the armchair and chairs block slightly more than their silhouettes. Seats, doors and the dress form can later swap these for oriented boxes without changing ids. Inspector: *Furniture collision (walk)* and *Show furniture collision boxes*.
