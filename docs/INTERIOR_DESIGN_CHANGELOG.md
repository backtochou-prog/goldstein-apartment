# Interior Design Changelog — Phase 3 (2026-11-17)

Status: built and tested. **Awaiting your review.** Phase 4 (lighting, fire, audio) has not started.

## 1. Review of the previous phases
- Re-read all Phase 1 documents, the Phase 2 reconstruction documents, the reference catalogue (R01-R06), and re-ran the Phase 2 checks before changing anything (39/39 spec checks).
- Recorded a **per-element fingerprint of the approved architecture** (`app/tools/phase2-arch-hash.json`: FNV hash of every mesh's world-space vertices, 26 elements) so that "the architecture is intact" is tested, not asserted.
- Inspected the implemented greybox: the R01 solve (`r01-solve.js`) is the single source of truth and is reused for object placement.
- **Assumptions I made:** (a) you approved the Phase 2 greybox, as the brief says; its provisional values (fourth wall at 6.0 m, ceiling 3.51 m, …) stand. (b) "the established PCVR architecture" means the Phase 2 stack: a WebXR page that runs in a desktop browser and therefore over Quest Link. I did not move to a native build. If you decided differently (D1: Godot), say so: the object manifest and architecture `.glb` are engine-neutral.

## 2. Files created
| Path | Purpose |
|---|---|
| `app/src/spec/objects.js` | **The placement manifest**: 75 objects, each with model, placement (image anchor / support / placeholder), refs, pixel box, confidence (existence / position / orientation / size), fidelity, notes; plus the list of objects *not* reconstructed |
| `app/src/interior/kit.js` | Geometry kit: assembly builder, metric box-projected UVs (grain follows the member), lathe/extrude/tube helpers |
| `app/src/interior/models/furniture.js` | Armchair, pressed-back chair, dining table, trefoil table, stand table, mirror sideboard, small cabinet, twin bed, nightstand, round table, bookshelf |
| `app/src/interior/models/kitchen.js` | Range, sink unit with drainboard and Belfast sink, splashback with taps, wall shelf, canisters, tins, jar, mugs, pots, utensils, cast plate |
| `app/src/interior/models/decor.js` | Lamps, sconces, cushions, shawl, books, frames, aloe, figurine, rugs, drapes, nets, rods, basket, fireplace columns and arch band, dress form, ironing board |
| `app/src/interior/material-defs.js` | Material definitions (colour source, texture scale, roughness/metalness, evidence tag) |
| `app/src/interior/materials.js` | Builds PBR materials, loads textures, texture-memory estimate |
| `app/src/interior/build.js` | Resolves the manifest to world transforms; merges geometry per material and layer; furniture colliders; picking table; confidence view |
| `app/src/interior/finish.js` | Finish layer for the **approved architecture**: materials and UVs only, reversible |
| `app/src/interior/sampled-colours.json` | Sampled reference colours (generated) |
| `app/public/textures/*.png` (16) | Procedural textures (own drawings; 3.0 MB) |
| `app/tools/sample-colours.py` | Samples colours from R01/R02/R05 pixel boxes |
| `app/tools/make-textures.py` | Generates all textures (periodic noise, measured wallpaper repeat) |
| `app/tools/check-objects.mjs` | Manifest honesty and geometry checks (provenance, bounds, overlaps) |
| `app/tools/interior-test.mjs` | Phase 3 browser test: architecture fingerprint, layers, performance, picking, furniture collision, lighting test, 18 screenshots |
| `app/tools/compare-r01.mjs`, `bbox-report.mjs`, `edge-overlay.py` | Compare the furnished render with the photograph (side-by-side, blend, edges, per-object fit) |
| `app/tools/export-manifest.mjs` | Engine-neutral JSON of placements and colliders → `app/exports/object-manifest.json` |
| `app/tools/gen-docs.mjs` | Generates the three data-driven documents from the live data |
| `app/tools/lib/session.mjs` | Shared headless-browser helper |
| `app/tools/phase2-arch-hash.json`, `phase3-arch-hash.json` | Architecture fingerprints (Phase 2 baseline, current) |
| `docs/FURNITURE_INVENTORY.md`, `docs/OBJECT_PLACEMENT_MANIFEST.md`, `docs/MATERIAL_REFERENCE_GUIDE.md`, `docs/INTERIOR_DESIGN_CHANGELOG.md` | The four deliverables |
| `reference/analysis/phase3-screens/*.png`, `phase3-bbox.json`, `phase3-perf.json` | Private screenshots (18), the R01 fit data, measured performance |

## 3. Files modified
| Path | Change |
|---|---|
| `app/src/main.js` | Interior build and toggles; neutral light + soft environment + warm fire test; picking of furniture; furniture colliders for walking and XR; `archHash`, `objects`, `perf`, `lightState` test hooks; GLB export now restores greybox materials; **material stashes moved out of `userData`** (see §7) |
| `app/index.html` | *Interior (Phase 3)* panel section |
| `app/src/spec/r01-solve.js` | `mantelProjection` 0.30 → 0.50 (**C-1**); added `pointAtHeight`, `zOnPlaneX`, `heightAtDepth`, `projectR01` helpers (no existing output changed) |
| `app/src/spec/apartment.js` | Fireplace depth now derives from the assumption (was a hard-coded 0.30) |
| `app/tools/browser-test.mjs`, `app/tools/xr-test.mjs` | Budgets for the furnished scene; longer screenshot timeouts; XR test covers furniture collision |
| `app/package.json` | New scripts (`check:objects`, `test:interior`, `textures`, `manifest`, `docs`, `compare`, `bboxes`); `verify` runs everything |
| `docs/ARCHITECTURE_RECONSTRUCTION.md`, `docs/APARTMENT_LAYOUT.md` | A short **Phase 3 amendment** note on C-1 (original text preserved) |
| `README.md` | Phase 3 status, launch and check commands |

No Phase 1 research document was changed. No file outside `/root/goldstein-apartment/` was touched.

## 4. The one change to approved architecture (C-1)
`mantelProjection` 0.30 m → **0.50 m** (allowed range 0.25-0.56 m). **Demonstrated error:** in R01 the mirror sideboard's near end and the mantel end occupy the same depth, but with 0.30 m the Phase 2 fireplace began at z 1.63 m, overlapping the sideboard (z 0.585-1.94 m) by 0.3 m along the wall. Effect: fireplace mass z 1.97-3.47 m (was 1.63-3.13 m), 0.50 m deep (was 0.30 m), mantel 1.35 m (was 1.33 m). The test suite proves that the other 23 of 26 architecture elements are bit-identical (only `fireplace`, `mantelShelf`, `firebox` differ). Doors, windows, walls, ceilings, floors, casing and pelmets did not move.

## 5. Technical decisions
1. **Custom parametric geometry, no library models.** Every object is built from lathes, extrusions and boxes sized from the R01 solve. Where the reference shows too little (36 of 75 objects, fidelity C) the object is a proportion-and-colour stand-in and is labelled as such.
2. **Placement is computed, not typed.** Floor contacts, wall contacts and supports go through the same camera model as the architecture; the manifest records the anchors.
3. **Evidence is part of the data.** Each object carries existence / position / orientation / size confidence and notes; `check-objects.mjs` fails a PROVISIONAL position without a note and a VERIFIED one without an anchor, box or located support. The inspector colours objects by confidence.
4. **Two layers.** *R01* (the set-photograph dressing, default) and *SC41* (dress form and ironing board: in R02-R04 but with no established position; off by default).
5. **Performance by merging.** All furniture is merged into one mesh per material per layer (24 draw calls for 73 objects), with a triangle→object table so picking still works. Collision boxes are separate.
6. **Finishes never move vertices.** The finish layer changes materials and UVs of the architecture (reversible, tested by fingerprint). Wallpaper UVs are world-anchored at the measured repeat so patterns run continuously across wall segments.
7. **Materials**: sampled colours, PBR, no baked light, no added grime; one soft environment map so metal and glass reflect; a warm-fire test mode to check materials without building the lighting system (details in `MATERIAL_REFERENCE_GUIDE.md`).
8. **Placement fit is checked against the photograph** by projecting each object's real geometry through the solved R01 camera (median cover 79 %; 57 of 64 boxes ≥ 60 %).

## 6. What was tuned to the photograph (so you can judge the fit honestly)
After the first render, the following were adjusted **to match image rows or columns in R01**, not from independent measurements: mantel projection (C-1); armchair back height 0.98 → 0.88 m; mirror sideboard counter 1.08 m, upper mirror unit narrowed to 0.95 m; small-cabinet height 1.08 m; range hob height 0.88 → 0.80 m (0.88 m put the pots in front of the range and into the sink unit); nightstand 0.72 → 0.82 m; stand-table radius; trefoil table radius; lantern-lamp width ×1.7; standard lamp moved beside the bed head; shawl and cushion positions; photograph and figurine heights; mantel tin +0.06 m; fireplace columns moved to the visible column (z 2.62 m) and the arch centred between them. Each is recorded in the object's notes.

## 7. Bugs found and fixed during this phase
| Bug | Cause | Fix |
|---|---|---|
| Production build never became ready | `stats` read before declaration (only showed in the minified build) | declaration order |
| Architecture `.glb` swelled to 12 MB and crashed the tab | material objects stored in `mesh.userData` are serialised by the glTF exporter | all material stashes moved to `WeakMap`s (finish layer, evidence colours, line mode, confidence view) |
| Placement of items on the mirror sideboard was `NaN` | `px` branch shadowed `onPx` | branch order |
| Objects poking through the wall (kettle, skimmer, shelf brackets), lamp inside a bed | found by `check-objects.mjs` | repositioned / re-modelled |
| Range back plate on the wrong plane | modelled behind the range instead of on the wall | separate `range_backplate` object |
| XR test timing | furnished scene renders at ~1 fps in software GL | tests wait for movement instead of a fixed time |

## 7b. Experiment that failed
I tried to recover the real wallpaper motif by **lattice-averaging** the ~15 repeats on the frontal pier of R01. The result smeared (the lattice is known to ±1 px, and the error accumulates over the repeats), so I **abandoned it and deleted the script**. The wallpaper is a drawn damask on the **measured** lattice (0.256 × 0.365 m), with sampled colours. See the guide.

## 8. Test results (this host, 2026-11-17, `npm run verify`)
| Suite | Result |
|---|---|
| `check` (spec, clearances, R01 reprojection, cross-checks) | 39/39 pass |
| `check:objects` (75 objects: provenance, honesty rules, room bounds, overlaps) | pass |
| `build` | OK |
| `test:browser` (Phase 2 regression: rendering, 7 collision walks, doors, GLB export, no console errors) | pass |
| `test:interior` (architecture fingerprint, layers, performance budgets, 5 click-picks, furniture collision, script layer, finishes reversible, lighting test, 18 screenshots) | pass |
| `test:xr` (emulated Quest 2: enter VR, spawn, furniture collision, stick slide, wall collision, snap turn) | 9/9 pass |

## 9. Performance (measured; `reference/analysis/phase3-perf.json`)
| Item | Value | Note |
|---|---|---|
| Triangles in the default scene | **51,861** | furniture 51,366 + architecture; Quest 2 standalone target 300k |
| Draw calls | **70** (24 furniture) | furniture merged per material and layer |
| Materials | 32 | |
| Textures | 16 files, **23.0 MB** uncompressed with mipmaps | ~6 MB with KTX2/ASTC |
| Interior build (CPU) | 0.68 s | plus 3.4 s texture decode on this software-rendering host |
| Frame rate | not meaningful | this host renders in software (~1 fps); a PC GPU is needed for a real figure |
The heaviest objects are the two beds (5.2-5.5k triangles each: ball finials), the armchair (4.3k) and the range (1.7k). There is clear room to cut (finials, torus ridges) if a standalone Quest build is needed.

## 10. Known limitations
- **Not tested on a headset** (emulator only), and **no real frame-rate figure** (software GL here).
- 36 of 75 objects are fidelity C (proportions only); only 6 are A. Carving on the fireplace, cabinets and armchair feet is simplified; the fireplace surround is still the plain Phase 2 mass plus columns and an arch band.
- Pattern motifs (wallpaper, rugs, florals) are drawn; colours are as-photographed, with the set lighting included.
- Unlocated: sofa, iron, clothes horse, magazines, table setting, hearth, kitchen cupboards, sisters' room furnishings (`FURNITURE_INVENTORY.md`).
- Collision boxes are axis-aligned and conservative; the kitchen-side aisle between the right-hand chair and the range is 0.48 m (passable at the 0.40 m body width, tight).
- The `/ref/` photograph overlay works only where `reference/` is present (private, not part of any build).

## 11. What is needed before Phase 4
1. Your review of the placement manifest, especially the 27 provisional positions and the 36 fidelity-C objects.
2. Film frames of SC41 and SC44 (reverse angles) to settle the sofa, the entrance wall, the dress form's and ironing board's places, the table setting, and the range's orientation.
3. A flat-on frame of the wallpaper and of the rugs to replace drawn patterns.
4. Decisions D7-D11 (fire, Queenie, song) before lighting and audio work.
