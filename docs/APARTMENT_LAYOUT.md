# Apartment Layout — Phase 2

> **Phase 3 amendment (C-1).** The fireplace now begins at z **1.97 m** and is 0.50 m deep (Phase 2: 1.63 m and 0.30 m), so it no longer overlaps the mirror sideboard (z 0.585-1.94 m). Object positions are in `OBJECT_PLACEMENT_MANIFEST.md`.

## 1. Coordinate frame (used everywhere: code, docs, exports)

- Units: **metres**.
- **x**: 0 at the main-room **left** wall (as seen from the main room facing the pocket doors), increasing to the right wall.
- **z**: 0 at the **pocket-door wall** face on the main-room side. +z goes back into the main room toward the unseen fourth wall; −z goes into the back room.
- **y**: up from the floor (one floor level throughout; no steps seen).

## 2. Plan (central values; ⟨⟩ = provisional)

```
 z = -3.95  ┌────────────── back-room WINDOW WALL ─────────────────┐   crown 0.25 deep, ceiling 3.51
            │   [window 1]      pier+nightstand      [window 2]     │   centres x 1.07 / 2.92
            │   ⟨0.54–1.59⟩                          ⟨2.39–3.44⟩    │   (sizes, sill provisional)
            │  bed L ⟨0.65–1.49⟩                bed R ⟨2.50–3.34⟩    │   bed feet at z -2.00
 ⟨back-room │                                                     │⟨back-room
  side wall⟩│              BACK ROOM (twin beds)                  │ side wall⟩
 z = -0.20  ├────────┬──────[ POCKET DOORS: clear 0.85–3.64 ]──────┬──────┤  wall ⟨0.20⟩ thick
 z =  0.00  │ pier   │ casing 0.64 ··· head 2.90 ··· casing 3.84   │ pier │
            │ 0.64   └─────────────────────────────────────────────┘ 0.56 │
            │ mirror cabinet z 0.57–⟨1.57⟩            range z ⟨0.89⟩–1.54   │
   LEFT     │ FIREPLACE z 1.63–⟨3.13⟩  (mantel 1.33)  sink cab z 1.43–2.50   │   RIGHT
   WALL     │                 dining table x 1.97–2.61, z 1.05–1.98          │   WALL
   x = 0    │                                                                │   x = 4.40
            │                    MAIN ROOM (sitting / dining / kitchen)      │
            │                    R01 camera at (2.58, 1.60, 5.58)            │
 z = ⟨6.00⟩ └ ─ ─ ─ ─ ─ EVIDENCE LIMIT: fourth wall unknown ─ ─ ─ ─ ─ ─ ─ ─ ─┘
```

## 3. Rooms and connections

| Space | Extent (x, z) | Ceiling | Connections | Confidence |
|---|---|---|---|---|
| Main room | x 0–4.40, z 0–⟨6.00⟩ | ⟨3.51⟩ (≥ 3.34) | Pocket doorway to the back room. Entrance: unknown. | Width high; depth unknown; ceiling low |
| Back room | x ⟨0–4.40⟩, z −3.95 to −0.20 | 3.51 | Pocket doorway only (any other door unknown) | Depth/ceiling medium; width low |
| Sisters' bedroom | unknown | — | "the other room" (SC45); street window (SC52) | Not placed |
| Entrance / landing / hall | unknown | — | Stair landing (SC40); toilet down the hall (SC45) | Not placed |

**Sightlines.** From the main room, the doorway frames the back room's two windows with the pier
and nightstand centred between them (R01, R04). This is the defining composition of the
apartment and it is reproduced: window centres x 1.07 / 2.92, doorway centre x 2.24.

## 4. Measurements available

All values come from `npm run dims` (exact numbers and ranges). Ranges cover the camera-height,
horizon, vanishing-point and focal-length bounds together.

| Dimension | Value (m) | Range (m) | Status |
|---|---|---|---|
| Main room width | 4.40 | 3.79 – 5.08 | DERIVED |
| Left pier / right pier | 0.64 / 0.56 | 0.55–0.74 / 0.48–0.64 | DERIVED |
| Casing outer width | 3.20 | 2.76 – 3.70 | DERIVED |
| Doorway clear width | 2.79 | 2.40 – 3.22 | DERIVED |
| Door head height | 2.90 | 2.50 – 3.35 | DERIVED |
| Casing top (minimum) | ≥ 3.34 | 2.88 – 3.85 | DERIVED (cropped) |
| Main-room skirting | 0.21 | 0.19 – 0.25 | DERIVED |
| Back room depth | 3.75 | 3.12 – 4.59 | DERIVED (bed-length closure) |
| Back room ceiling | 3.51 | 2.95 – 4.16 | DERIVED |
| Back-room crown depth | 0.25 | 0.21 – 0.29 | DERIVED |
| Pelmet top | 3.19 | 2.68 – 3.78 | DERIVED |
| Window centres x | 1.07 / 2.92 | 0.61–1.44 / 2.30–3.55 | DERIVED |
| Fireplace doorward end (z) | 1.63 | 1.14 – 2.21 | DERIVED |
| Fireplace reaches at least (z) | 2.37 | 1.64 – 3.24 | DERIVED |
| Mantel height | 1.33 | 1.16 – 1.51 | DERIVED |

**Proportions** (much tighter than the absolute values):

| Proportion | Value | Range |
|---|---|---|
| Door head / room width | 0.66 | exact (pixel ratio on a frontal plane) |
| Doorway clear width / room width | 0.63 | exact |
| Back ceiling / door head | 1.21 | 1.16 – 1.27 |
| Mantel height / door head | 0.46 | 0.45 – 0.47 |

## 5. Circulation (furniture-free areas, architecture only)

- The doorway in the R01 leaf position leaves a **2.01 m** walkable gap. Fully open: 2.79 m clear.
- Main room, left of the dining group: fireplace front (x 0.30) to the table edge (x 1.97) = 1.67 m;
  to the provisional chairs zone (x 1.47) = 1.17 m.
- Main room, right of the dining group: table edge (x 2.61) to the range front (x 3.57) = 0.96 m;
  to the provisional chairs zone (x 3.11) only **0.46 m**. The kitchen side is tight. Check the
  actual chair positions against film frames before Phase 3 places them.
- Back room: the beds (provisional footprints) leave 1.01 m between them and 1.80 m from the bed
  feet to the pocket-door wall.
- Collision radius used for testing: 0.20 m (body). Every room is walkable end to end at human scale.

## 6. Furniture footprints (not architecture; shown as floor outlines)

| Item | x | z | Status |
|---|---|---|---|
| Dining table | 1.97–2.61 | 1.05–1.98 | DERIVED (table height assumed 0.76) |
| Dining chairs zone | 1.47–3.11 | 0.55–2.48 | PROVISIONAL |
| Mirror-back cabinet | 0–0.45 | 0.57–1.57 | PROVISIONAL (doorward end derived) |
| Range | 3.57–4.40 | 0.89–1.54 | PROVISIONAL (front legs derived) |
| Sink cabinet + drainboard | 3.95–4.40 | 1.43–2.50 | DERIVED |
| Twin beds | 0.65–1.49 / 2.50–3.34 | −3.95 to −2.00 | PROVISIONAL (feet derived) |
