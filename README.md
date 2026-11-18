# The Goldstein Apartment — private VR recreation

A private, inhabitable VR recreation of Tina and Queenie Goldstein's apartment from
*Fantastic Beasts and Where to Find Them* (2016). It is not a game: there are no goals, scores or quests.

**Status:** Phase 3 (interior design, furnishing and materials) built and tested, **awaiting your review**. Phase 4 (lighting, fire, audio) has not started. Read `docs/FURNITURE_INVENTORY.md` and `docs/OBJECT_PLACEMENT_MANIFEST.md` first; the architecture is documented in `docs/ARCHITECTURE_RECONSTRUCTION.md`.

**Direction change:** the apartment is now being rebuilt as a photographic 2.5D environment (see `docs/PHOTOGRAPHIC_PIPELINE.md`); Phase 3 geometry is the proxy and fill.

## Rules
- Fidelity to the film first. No invented layout, furniture or decoration. Unknowns stay marked as unknown.
- Lawful sources only. No DRM circumvention.
- Private. Never deployed, never pushed to a public repository. Film-derived media is git-ignored.

## Start here
0. Phase 3: `docs/FURNITURE_INVENTORY.md`, `docs/OBJECT_PLACEMENT_MANIFEST.md`, `docs/MATERIAL_REFERENCE_GUIDE.md`, `docs/INTERIOR_DESIGN_CHANGELOG.md`
1. `docs/ARCHITECTURE_RECONSTRUCTION.md`: what was reconstructed, how, and what is still open (Phase 2)
2. `docs/APARTMENT_LAYOUT.md`, `docs/ARCHITECTURAL_REFERENCE_MAP.md`, `docs/ARCHITECTURE_CHANGELOG.md`
3. `docs/VISUAL_RESEARCH_LIBRARY.md`: what is known, from where, how sure (Phase 1)
4. `docs/MISSING_REFERENCES_AND_DECISIONS.md`: what is needed from you
5. `docs/REFERENCE_CAPTURE_GUIDE.md`: how to add your screenshots with `tools/refs/refs.py`
6. `docs/APARTMENT_RECONSTRUCTION_PLAN.md`, `docs/QUEENIE_BEHAVIOUR_PLAN.md`, `docs/AUDIO_REQUIREMENTS.md`
7. `docs/PROJECT_RECONNAISSANCE.md`, `docs/PROJECT_STRUCTURE.md`

## Launch the greybox inspector (Phase 2)
Needs Node 20+.
```
cd app
npm install
npm run dev            # http://localhost:5174 (this machine only)
npm run dev:lan        # https on your home network, for a Quest browser (accept the self-signed certificate)
```
Phase 3 adds an *Interior* section to the panel: furniture on/off, finishes on/off, script props (provisional), furniture collision, placement-confidence colours (green = verified position, amber = provisional) and a warm-light material test. Click any object for its evidence. Runs in a desktop browser, so it also works over Quest Link (PCVR).

Keys: O orbit · F walk (WASD + drag) · P plan · R reference camera. The side panel has the
reference-photo blend, line mode, evidence colours, collision boxes, pocket-door positions,
tape measure, click-to-inspect and the `.glb` export.

## Checks
```
cd app
npm run check          # spec + R01 reprojection + cross-checks
npm run dims           # every dimension with its range (--md for tables)
npm run check:objects  # placement manifest: provenance, honesty rules, room bounds, overlaps
npm run textures       # regenerate the procedural textures (python3, Pillow, NumPy)
npm run manifest       # export exports/object-manifest.json for an engine port
npm run docs           # regenerate the data-driven Phase 3 documents
npm run verify         # check + objects + build + browser + interior + emulated-XR tests
```

## Reference tool (Phase 1)
```
python3 tools/refs/refs.py list                 # catalogue
python3 tools/refs/refs.py sheet --cols 3       # contact sheet -> reference/sheets/sheet_all.jpg
tools/refs/selftest.sh                          # tool self-test (synthetic video)
```
