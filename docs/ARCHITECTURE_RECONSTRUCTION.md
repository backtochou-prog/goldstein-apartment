# Architecture Reconstruction — Phase 2

Status: architectural greybox built and tested, 2026-11-16. **Awaiting your review.** Phase 3
(interior design) has not started.

Everything here follows from the Phase 1 library (`VISUAL_RESEARCH_LIBRARY.md`) plus one new piece
of work: a **single-image perspective solve of R01**, the wide set photograph on the official
fact-file page. No new sources were added. The film was not available.

> **Phase 3 amendment (C-1).** The mantel-projection assumption was changed from 0.30 m to **0.50 m** because, with 0.30 m, the fireplace overlapped the mirror sideboard seen in the same photograph (R01). The fireplace mass now starts at z **1.97 m** (was 1.63 m) and is 0.50 m deep (was 0.30 m); mantel height 1.35 m (was 1.33 m). Everything else in this document is unchanged: 23 of 26 architecture elements are bit-identical to Phase 2 (fingerprints in `app/tools/phase2-arch-hash.json`, enforced by the tests). Figures below that mention the fireplace's 1.63 m end or 0.30 m depth are the Phase 2 values; see `OBJECT_PLACEMENT_MANIFEST.md` for the current ones.

## 1. Phase 1 review: what the evidence supports

| Area | Best evidence | Can it be reconstructed? |
|---|---|---|
| Pocket-door wall (doorway, casing, piers) | R01 square-on, plus R03, R04 | **Yes**, high confidence in proportions |
| Main room side walls (fireplace wall, kitchen wall) | R01 (left and right walls from the corners to about 2.5 m out) | **Yes**, position derived. Their full length is unseen. |
| Fireplace | R01 (end and mantel), R02/R03 (black arched surround), script SC41 | **Partly**: position along the wall and mantel height derived; width and firebox provisional |
| Back room (twin beds, two windows) | R01 (through the doorway), R04, R05 | **Partly**: depth, ceiling, crown and window centres derived; side walls, sills and window sizes provisional |
| Main-room ceiling | none (cropped in R01) | Lower bound only (≥ casing top 3.34 m). Set equal to the back room. |
| Fourth wall (entrance, sitting-room windows, sofa) | Script SC41 only | **No.** Unknown. An evidence-limit boundary is used instead. |
| Sisters' bedroom | Script SC45/52 only | **No.** Location unknown, not built |
| Stairwell, landing, hall toilet | Script SC40/45 only | **No.** Outside the apartment or unseen, not built |

## 2. Method: the R01 perspective solve

R01 was taken almost square-on to the pocket-door wall: its casing verticals are vertical and its
cornice is horizontal. That makes it a **one-point perspective** with the principal point at the
vanishing point. For floor points, `Z = f·h / (y − y_horizon)`. Widths and heights on a plane
parallel to the image need only the horizon. Depths also need the focal length.

Inputs (all in `app/src/spec/r01-solve.js`, each adjustable):

| Input | Value | Range | How it was established |
|---|---|---|---|
| Camera height *h* | 1.60 m | 1.45–1.75 | Standing photographer. Cross-checked by derived heights of known objects (below). |
| Horizon *y* | 420 px | 400–440 | The kitchen shelf front edge, a receding line, is almost level at y 438–447. Mantel, sink and table tops are seen from above; sconces and shelf brackets from below. |
| Vanishing point *x* | 1000 px | 950–1080 | Shelf and left-cabinet cornice lines. The right wall position from two independent cues then agrees. |
| Focal length *f* | 1350 px | 1150–1550 | Trefoil table ellipse (≈1340), end-chair spacing, twin-bed length (≈1.95 m) with a 1.0 m headboard. |
| Bed length | 1.95 m | 1.85–2.05 | Closes the back-room depth |
| Mantel projection | 0.30 m | 0.20–0.40 | Places the fireplace along the wall |

Thirty-three pixel measurements were read off gridded, zoomed crops (`reference/analysis/r01/r01_grid.png`).
They are listed with notes in the same file.

**Independent cross-checks.** Different image features, all through the same model:

| Check | Result |
|---|---|
| Right wall from the right corner vs from the sink-cabinet end face | 4.40 m vs 4.39 m |
| Sconce on the left wall vs sconce on the left pier (different planes) | 1.87 m vs 1.85 m high |
| Kitchen shelf, both ends | 1.54 m and 1.54 m (level, as a shelf should be) |
| Dining-chair crest / headboard | 0.98 m / 1.00 m (typical of period furniture) |
| Tap panel vs sink cabinet | panel 0.78–1.16 m, just above the 0.75 m cabinet top |

These agreements are what make the solve credible. They do **not** turn assumptions into facts:
the absolute scale still rests on the camera-height assumption (±9 %), and depths on the focal length (±15 %).

**What is exact.** Ratios on the pocket-door wall are pure pixel ratios, independent of every
assumption: **door head / room width = 0.66** and **clear opening / room width = 0.63**. The
cinematic proportion of the doorway wall is therefore fixed. Only its overall size is uncertain.

## 3. Verified architectural decisions (supported by evidence)

| # | Decision | Evidence | Confidence |
|---|---|---|---|
| A1 | The main room is one long space: sitting area, dining table and kitchen run, ending at a wide doorway with pocket doors | R01, script SC41 ("the kitchen" in the sitting-room scene) | High |
| A2 | The doorway occupies most of the end wall, with a short pier on each side (0.64 m left, 0.56 m right) | R01 | High (proportions exact) |
| A3 | Two dark panelled pocket leaves slide into the wall. In R01 they are slid mostly away, leaving a 2.0 m gap. | R01, R03, R04 | High |
| A4 | Heavy cased opening with an entablature head; head height 0.66 × room width (2.90 m central) | R01 | High (ratio), medium (absolute) |
| A5 | The fireplace is on the **left** wall (seen from the main room facing the pocket doors), black and ornate, with an arched insert. Its doorward end is 1.63 m from the pocket-door wall. Mantel at 0.46 × door head (1.33 m). | R01, R02, R03, SC41 | High (side, style), medium (position, height) |
| A6 | Order along the left wall from the corner: mirror-back cabinet, then the fireplace (trefoil table and armchair in front) | R01 (occlusion order), R02 (mirror to the right of the fireplace) | High |
| A7 | The kitchen run is on the **right** wall: range, then sink cabinet with drainboard, splashback with two taps, shelf above | R01 | High |
| A8 | The back room is a separate room reached through the pocket doors. Its far wall has **two tall windows** with pelmets and a pier between them (nightstand and lamp). It has a crown moulding and the same ceiling height as derived (3.51 m). | R01, R04, R05 | High (layout), medium (dimensions) |
| A9 | The back room holds the twin beds, so it is most likely the men's room of SC44–45 ("back room", "twin beds"). R05's bed against curtains matches. | R01, R05, SC44–45 | Medium |
| A10 | Main-room skirting is tall dark wood (0.21 m) | R01 | Medium |
| A11 | Very tall rooms: ceiling ≥ 3.34 m (casing top) and about 3.5 m in the back room | R01 | Medium |

## 4. Provisional values (not film measurements; marked amber in the inspector)

| Value | Used | Why it is provisional |
|---|---|---|
| Main room depth (fourth wall position) | 6.00 m | The fourth wall is never seen. The R01 photographer stands about 5.6 m from the pocket-door wall. |
| Main-room ceiling | 3.51 m | Cropped in R01. Set equal to the back room. It must be at least 3.34 m. |
| Pocket-door wall thickness | 0.20 m | Must house the leaves. Not visible. |
| Fireplace width | 1.50 m | At least 0.74 m is derived; the near end is out of frame. |
| Firebox opening | 0.60 × 0.75 m, arched | Arched shape is seen (R02); size unknown |
| Back-room side walls | in line with the main room (width 4.40 m) | Hidden behind the leaves. At least 3.42 m of back wall is visible. |
| Window width / sill / head | 1.05 / 0.75 / 3.05 m | Centres derived; the rest hidden by curtains and beds |
| Chimney breast | none modelled | Unknown. The fireplace may stand on one, but it is not evident. |
| Main-room crown moulding | none modelled | Unknown (cropped) |

## 5. Unresolved architectural questions

| # | Question | What would answer it |
|---|---|---|
| Q1 | Where is the entrance door, and on which wall? | Film frames of SC41 arrival (SC40→41 transition) |
| Q2 | What is on the fourth wall: windows, sofa? Is the main room deeper than 6 m? | Any reverse angle in SC41 or SC44 |
| Q3 | Where is the sisters' bedroom ("the other room", SC45) and its street window (SC52)? | SC45 door glimpse, SC52 exterior, SC53 |
| Q4 | Main-room ceiling height and moulding | Any frame showing the main-room ceiling |
| Q5 | Fireplace width, near end, hearth, chimney breast | Frames facing the left wall (R02's set-up, wider) |
| Q6 | Back-room side walls, doors, the bookshelf wall in R05 | SC45 wides |
| Q7 | Window sash type, sill height, glazing | Back-room frames without the beds in the way |
| Q8 | Absolute scale (camera height assumption) | Set blueprints in *The Art of the Film*, or any object of documented size |
| Q9 | What is the main-room wall behind the R01 camera? Did the photographer stand inside the room? | Reverse angles |
| Q10 | Does R04 show the doorway from the main room (as assumed) or the reverse? | Solve R04 from a film frame with more context |

## 6. Cinematic accuracy notes

- **Camera vs geometry.** R01 is a set photo with a wide lens (≈22 mm full-frame equivalent).
  It makes the room look deeper than a normal-lens film shot would. The greybox uses the
  solved geometry, not the look of the photo. The reference camera reproduces the photo's lens
  for comparison only.
- **Set vs story.** Film sets have removable "wild" walls. The fourth wall may not have existed
  as a fixed wall on set. When film frames arrive, the most-seen version of each wall wins and
  conflicts are logged.
- **The R01 dressing** (doors slid back, lamps lit) is a photo moment. The default door position
  in the greybox reproduces it only so the overlay can be compared.

## 7. Phase 3 readiness

Ready: the walls, floors, ceilings, doorway, leaves, windows, fireplace mass, skirting, crown and
pelmets are in place, and furniture footprints mark the R01 positions of the table, mirror cabinet,
range, sink cabinet and beds. Collision is separate from visuals.

Before interior work starts: your review of A1–A11, a decision on the provisional values in §4,
and ideally film frames for Q1–Q3.
