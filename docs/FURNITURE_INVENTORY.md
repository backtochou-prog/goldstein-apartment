# Furniture Inventory — Phase 3

Generated from `app/src/spec/objects.js` by `npm run docs` (do not edit by hand; edit the manifest). Status: built and tested, awaiting your review.

**75 objects** are modelled (73 in the set-photograph dressing, 2 script props that are off by default). They are custom geometry built from the R01 measurements, merged per material for the headset. Nothing is a library model and nothing was invented to fill space: every object is in a catalogued reference image, and every one that is not is listed under *Not reconstructed*.

## How to read the tables
- **Existence** — VERIFIED: visible in a catalogued image (R01 set photograph, R02-R05 stills and film frames). SCRIPT: only in the 2015 shooting script.
- **Fidelity** — **A** custom silhouette matched to the image, carving simplified. **B** recognisable form with matched proportions, details simplified. **C** proportions only: the reference shows too little to model more (the object is a stand-in of the right size and colour, not a likeness).
- **Position** — see `OBJECT_PLACEMENT_MANIFEST.md`. ✔ = verified by an image anchor, ◇ = provisional.

## Totals
| Group | Objects | Triangles |
|---|---|---|
| Fireplace | 5 | 3,656 |
| Storage | 2 | 1,668 |
| Lighting | 6 | 4,260 |
| Decor | 14 | 1,846 |
| Tables | 4 | 4,208 |
| Seating | 5 | 9,964 |
| Textiles | 11 | 5,468 |
| Rugs | 2 | 24 |
| Kitchen | 19 | 8,376 |
| Bedroom | 5 | 11,896 |
| Dressmaking | 2 | 1,702 |
| **All** | **75** | **53,068** |

Fidelity: A 6 · B 33 · C 36.

## Fireplace
| ID | Object | Seen in | Fid. | Pos. | What the model is / what is unknown |
|---|---|---|---|---|---|
| `fp_column_far` | Fireplace barley-twist column (doorward side of the arch) | R01, R02 | B | ◇ | R01 shows a black spiral-turned column at the left frame edge (x 0-100 px, y 1000-1248); the sight line puts it at z about 2.6. The number of columns is not established; one each side of the arch is the most economical reading, so the arch is centred between the two. |
| `fp_column_near` | Fireplace barley-twist column (camera side of the arch) | R01 | B | ◇ | Out of frame in R01: placed symmetrically to the visible column. |
| `fp_arch` | Arched firebox surround (black iron band) | R02 | B | ◇ | R02 shows the arched insert. Its size and height are not measurable in R01 (out of frame). |
| `fp_picture` | Framed picture above the mantel | R02 | C | ◇ | R02 shows a gilt frame with a pale mat above the mantel. Its subject is not legible, so the print is a neutral dark panel (no invented artwork). Size and position are approximate. |
| `fp_tin` | Small round tin on the mantel | R01 | C | ✔ | The image row implies a mantel top near 1.41 m against the derived 1.35 m: inside the solve range (1.18-1.52 m). The tin is raised 0.06 m to match. |

## Storage
| ID | Object | Seen in | Fid. | Pos. | What the model is / what is unknown |
|---|---|---|---|---|---|
| `small_cabinet` | Small glazed cabinet (corner) | R01 | C | ◇ | Only its top and lamp are visible. Position follows the sight line and the corner; depth is not independent evidence. |
| `mirror_cabinet` | Mirror-back sideboard (overmantel unit) | R01, R02 | A | ✔ | Cornice height 2.11 m derived. Mirror unit about 0.95 m between the columns, over the doorward half of a 1.4 m sideboard. Counter height 1.08 m adjusted so the counter items match their image rows. Fretwork, carving and the crest are simplified; lateral extent of the upper unit is about +-0.3 m. |

## Lighting
| ID | Object | Seen in | Fid. | Pos. | What the model is / what is unknown |
|---|---|---|---|---|---|
| `lantern_lamp` | Lantern-style lamp on the small cabinet | R01 | B | ✔ |  |
| `sconce_far` | Two-arm sconce, peach tulip shades (doorway end) | R01 | B | ✔ | Height 1.85 m derived (shade centre). Mount type inferred. |
| `sconce_near` | Two-arm sconce, peach tulip shades (camera side of the mirror) | R01 | B | ◇ | It hangs off the near end of the unit in R01. Whether it is wall- or unit-mounted is not resolvable. |
| `domed_lamp` | Domed painted-glass table lamp | R01 | A | ✔ | Bronze stem, pale green-grey dome with an ornamental brass border. |
| `nightstand_lamp` | Amber fringed lamp on the nightstand | R01, R04, R05 | B | ✔ |  |
| `standard_lamp` | Standard lamp with pink fringed shade | R01 | C | ◇ | Only the shade is visible in R01; the sight line puts it beside the left bed head (z about -3.2). Pole and base are inferred (a floor lamp is the only reading that fits the shade height). |

## Decor
| ID | Object | Seen in | Fid. | Pos. | What the model is / what is unknown |
|---|---|---|---|---|---|
| `aloe` | Aloe in a terracotta pot | R01 | B | ✔ |  |
| `photo_a` | Standing photograph (left) | R01 | C | ◇ | Photograph content is not legible: neutral grey card. |
| `photo_b` | Standing photograph (right) | R01 | C | ◇ | Stands about 0.3 m above the counter in the image rows, so it is tucked into the mirror frame or on a ledge there. The support is not resolvable; height follows the sight line. |
| `figurine` | Small bronze figurine | R01 | C | ◇ | A figure with a spread wing or drape; the pose is not resolvable. Modelled as an abstract bronze figure. |
| `writing_case` | Red-brown leather case on the counter | R01 | C | ✔ |  |
| `tf_books` | Books on the trefoil table | R01 | C | ✔ | Titles and covers are not legible: plain cloth bindings in muted tones. |
| `tf_tin` | Small blue and white tin on the trefoil table | R01 | C | ✔ |  |
| `tf_lower_books` | Books on the lower shelf | R01 | C | ✔ |  |
| `tf_cards` | Playing cards on the lower shelf | R01 | C | ✔ |  |
| `nightstand_photo` | Small framed photograph on the nightstand | R05 | C | ◇ | R05 shows a small frame and a pink tin beside the bedside lamp. |
| `nightstand_tin` | Small pink tin on the nightstand | R05 | C | ◇ | R05 shows a pink tin beside the bedside lamp; its exact spot on the nightstand is a placeholder. |
| `books_0` | Books on bookshelf shelf 1 | R05 | C | ◇ | Spines drawn as plain cloth bindings; titles are not legible. |
| `books_1` | Books on bookshelf shelf 2 | R05 | C | ◇ | Spines drawn as plain cloth bindings; titles are not legible. |
| `books_2` | Books on bookshelf shelf 3 | R05 | C | ◇ | Spines drawn as plain cloth bindings; titles are not legible. |

## Tables
| ID | Object | Seen in | Fid. | Pos. | What the model is / what is unknown |
|---|---|---|---|---|---|
| `trefoil_table` | Trefoil two-tier side table | R01 | A | ✔ | In front of the fireplace; between the fireplace and the armchair |
| `stand_table` | Small tall stand table with orange cloth | R01 | C | ◇ | Height 0.84 m follows from the top row and the pocket-door wall limit; depth along the sight line is not independent. |
| `dining_table` | Dining table | R01 | B | ✔ | On the pink rug; four chairs. Long axis points at the pocket doors. |
| `round_table` | Small round table, left | R01 | C | ◇ | R01 shows a small round table with slim legs left of the left bed. Its depth is not independent evidence. |

## Seating
| ID | Object | Seen in | Fid. | Pos. | What the model is / what is unknown |
|---|---|---|---|---|---|
| `armchair` | Caned bergère armchair (green velvet) | R01 | A | ✔ | Carved dark frame, rolled arms, caned side panels, velvet seat and back. Foot carving is simplified. |
| `chair_near` | Pressed-back chair, near end | R01 | B | ✔ | Spindle back seen from behind. |
| `chair_far` | Pressed-back chair, far end | R01 | B | ◇ | Only the crest and upper spindles are visible above the table. |
| `chair_left` | Chair, left side | R01 | B | ◇ | Curved back posts: may be bentwood rather than pressed-back. Modelled as pressed-back; unresolved. |
| `chair_right` | Chair, right side | R01 | B | ◇ | Only partly visible. |

## Textiles
| ID | Object | Seen in | Fid. | Pos. | What the model is / what is unknown |
|---|---|---|---|---|---|
| `cushion_ruched` | Silver-grey ruched cushion | R01 | B | ✔ | Leaning against the armchair back, left |
| `cushion_floral` | Floral tapestry cushion | R01 | C | ✔ | Cushion exists with pink, orange and green floral tones. Pattern is drawn, not traced. |
| `shawl` | Patterned shawl over the armchair back | R01 | C | ✔ | Gold, blue, rose and green floral silk. Pattern is drawn from tone only. |
| `rod_left` | Curtain rod and finials, left window | R01 | B | ✔ |  |
| `drape_outer_left` | Outer drape, left window (dark blue-grey) | R01, R05 | B | ✔ |  |
| `drape_inner_left` | Inner drape, left window (blue and gold floral) | R01, R05 | B | ✔ | Blue-grey ground with gold floral (R01 / R05). Pattern is drawn from tone only. |
| `nets_left` | Sheer nets, left window | R01 | C | ✔ |  |
| `rod_right` | Curtain rod and finials, right window | R01 | B | ✔ |  |
| `drape_outer_right` | Outer drape, right window (dark blue-grey) | R01, R05 | B | ✔ |  |
| `drape_inner_right` | Inner drape, right window (blue and gold floral) | R01, R05 | B | ✔ | Blue-grey ground with gold floral (R01 / R05). Pattern is drawn from tone only. |
| `nets_right` | Sheer nets, right window | R01 | C | ✔ |  |

## Rugs
| ID | Object | Seen in | Fid. | Pos. | What the model is / what is unknown |
|---|---|---|---|---|---|
| `rug_pink` | Pink floral rug | R01 | B | ✔ | Extent measured from the visible corner and edges. Field and border tones sampled; the individual floral motifs are not resolvable and are drawn. |
| `rug_oriental` | Oriental rug (foreground) | R01 | C | ◇ | Only the far edge and border are visible. Width and depth are PLACEHOLDERS; design drawn from the sampled tones. |

## Kitchen
| ID | Object | Seen in | Fid. | Pos. | What the model is / what is unknown |
|---|---|---|---|---|---|
| `range` | Cast-iron range | R01 | B | ◇ | Orientation is the main uncertainty: R01 reads best with the oven front facing the camera side. Film frames will decide. |
| `range_backplate` | Cast-iron back plate above the range | R01 | C | ✔ |  |
| `pot_brown` | Brown enamel saucepan with lid | R01 | B | ✔ |  |
| `kettle_speckled` | Grey speckled enamel pot | R01 | B | ✔ |  |
| `lid_brown` | Brown enamel lid (resting) | R01 | C | ◇ | A second brown lid lies on the hob in front of the pot (R01 (1440-1505, 650-672)); exact spot follows the sight line. |
| `sink_unit` | Sink cabinet with drainboard and Belfast sink | R01 | A | ✔ | Against the right wall after the range; the splashback and taps are above it |
| `splashback` | Ceramic splashback with two brass taps | R01 | A | ✔ |  |
| `wall_shelf` | Kitchen wall shelf on iron brackets | R01 | B | ✔ | It runs out of frame at the right: its far end (z about 2.6) is a placeholder. |
| `canister_a` | White lidded canister (1) | R01 | B | ✔ |  |
| `canister_b` | White lidded canister (2) | R01 | B | ✔ |  |
| `carton_blue` | Blue carton | R01 | C | ✔ |  |
| `tin_green` | Green tin | R01 | C | ✔ |  |
| `tin_yellow` | Yellow patterned tin | R01 | C | ✔ |  |
| `jar_cream` | Large cream storage jar | R01 | B | ✔ | A printed label begins "CU..." in R01; the text is not legible, so none is modelled. |
| `mug_a` | Cup hanging under the shelf (1) | R01 | C | ✔ |  |
| `mug_b` | Cup hanging under the shelf (2) | R01 | C | ✔ |  |
| `mug_c` | Cup hanging under the shelf (3) | R01 | C | ✔ |  |
| `skimmer` | Perforated skimmer on a hook | R01 | C | ✔ |  |
| `ladle` | Ladle on a hook | R01 | C | ✔ |  |

## Bedroom
| ID | Object | Seen in | Fid. | Pos. | What the model is / what is unknown |
|---|---|---|---|---|---|
| `bed_left` | Twin bed, left (white spread) | R01 | B | ✔ | Head against the window wall, left of the nightstand |
| `bed_right` | Twin bed, right (pink coverlet) | R01, R05 | B | ✔ | Dark turned posts with ball finials, curved headboard, beaded foot rail (R01, R05). The foot of this bed carries a draped white cloth. |
| `nightstand` | Nightstand between the windows | R01, R04, R05 | B | ✔ |  |
| `basket` | Wicker laundry basket | R01 | B | ◇ | It appears to stand under the right bed, beside the foot, with white linen in it. |
| `bookshelf` | Open bookshelf beside the right bed | R05 | C | ◇ | R05 (SC45) shows a dark bookshelf with books to the right of the bed. R01 does not show that wall. Position, size and shelf count are placeholders. |

## Dressmaking
| ID | Object | Seen in | Fid. | Pos. | What the model is / what is unknown |
|---|---|---|---|---|---|
| `dress_form` | Dressmaker's dummy *(script layer)* | R02, R03, R04 | B | ◇ | Linen torso, black neck cap and shoulder knob are seen in R02-R04. WHERE it stands is not established: R02 and R03 put it by the fireplace, R04 in the twin-bed room. This is a stated placeholder, and the layer is off by default. |
| `ironing_board` | Ironing board with pink cover *(script layer)* | R04 | C | ◇ | The iron itself is not shown in any catalogued image: NOT modelled. Position is a placeholder. |

## Not reconstructed (named in the references or script, but not shown in any catalogued image)
These are **documented, not guessed**. Several appear in the film; the shapes are simply not in our references.

| Object | Why it is absent |
|---|---|
| Sofa | Script SC41 ("falls back onto a sofa") and the Pottermore set visit mention it; it appears in no catalogued image. |
| Self-working iron | Script SC41 and the Pinnock interview describe it; no catalogued image shows the iron itself. |
| Revolving clothes horse with underwear | Script SC41 only ("in front of the fire"). Shape unknown. |
| Magazines (The Witch's Friend, Witch Chat, Transfiguration Today) | Script SC41. Cover art is not in any catalogued image; MinaLima made the graphics. |
| Queenie's haberdashery print on the dresser | MinaLima describes it. A dresser is not located (possibly the mirror cabinet). |
| Hearth, fender, grate and fire irons | Not visible in R01; R02 shows only the arched insert. |
| Mantel clock / mantel objects (beyond the round tin) | The mantel top is out of frame in R01 and R02 shows only a lamp. |
| Kitchen cupboards, work surfaces and crockery beyond the sink unit | The kitchen wall beyond z 2.5 (toward the camera) is outside R01. Script SC41 says ingredients float "out of cupboards": their location is unknown. |
| Dining table setting (plates, glasses, candles) | Script SC41-44; the table is bare in R01. Phase 4 candidate: the film decides the moment. |
| Strudel and magical cooking effects | Visual effects (Cinesite). Not architecture or furniture. |
| Sitting-room windows, entrance door, curtains of the main room | Fourth wall unknown (Phase 2). |
| Sisters' bedroom furnishings | Room unlocated. Waterston mentions "all the books by Tina's bed" (S08). |
| Mirror contents / reflections, framed picture subject, photograph content | Not legible. |

## Identification uncertainties in what *is* modelled
| Object | Uncertainty |
|---|---|
| `chair_left` | Curved back posts suggest a **bentwood** chair; it is modelled as pressed-back like the other three. |
| `range` | Which way the oven front faces is not settled (R01 reads best facing the camera side). Its width (0.83 m) and the hob height (0.80 m) follow the pot rows. |
| `mirror_cabinet` | The upper mirror unit is about 0.95 m between the columns over the doorward half of a 1.4 m sideboard; its lateral extent is ±0.3 m. Fretwork and carving are simplified. |
| `lantern_lamp` | Image is wider than a typical lantern lamp; it is scaled 1.7× in width to match. |
| `photo_a`, `photo_b`, `figurine` | They stand 0.15-0.3 m above the counter in the image rows, on a support that cannot be resolved (mirror frame or ledge). |
| `fp_column_*`, `fp_arch` | R01 shows one spiral column; the count, spacing and arch centring are inferred. The surround body is the approved Phase 2 mass: ornamental carving (visible in R02) is **not** modelled. |
| `rug_oriental` | Only its far edge and border are visible: width, depth and design are placeholders. |
| `bookshelf` + books | One film frame (R05); its place is not in R01. |
| Pattern drawings | Wallpaper motifs, rug motifs and floral fabrics are drawn from sampled tones; no reference resolves their individual motifs (`MATERIAL_REFERENCE_GUIDE.md`). |

## Budgets
Measured in the default scene (R01 dressing, architecture included): **51,861 triangles**, **70 draw calls**, **32 materials**, **23.0 MB** of textures; the default furniture (R01 layer) is 51,366 triangles in 24 draw calls (the hidden script layer adds 1,702).
