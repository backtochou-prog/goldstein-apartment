# Apartment Reconstruction Plan (initial; not approved for modelling)

**Gate:** no final modelling starts until you have reviewed `VISUAL_RESEARCH_LIBRARY.md` and
answered the decisions in `MISSING_REFERENCES_AND_DECISIONS.md`. Everything below is method, plus a
**topological** hypothesis of the layout. There are no measurements, because none are known.

## 1. Principles

1. **Evidence before geometry.** Every modelled element carries a status:
   - `VERIFIED`: seen in a film frame or still (T1), or in the set photo when no film frame contradicts it (T3).
   - `CONSTRAINED`: its existence is known (screenplay or interview) but its look or position is only bounded.
   - `PLACEHOLDER`: unknown. It is shown in the blockout as flat grey with a label, and never dressed.
2. **No invented objects.** Furniture and decoration come only from the image catalogue. Period
   research may help **identify** a visible object (for example "pressed-back chair, American, c.1900–1915")
   to model it correctly. It never **adds** an object.
3. **Measurements come from camera matching and scale anchors,** always with an uncertainty range,
   never from a single guess.
4. **Film over set.** Where a film frame and the set photo R01 disagree, the film frame wins. The
   difference is logged.

## 2. Working layout hypothesis (topology only, to be tested)

```
                 (unknown: sisters' bedroom? hall? entrance?)
                                   |
   +------------------- BACK ROOM (twin beds) --------------------+
   |  window  |  nightstand + fringed lamp  |  window             |   <- R01, R04 (T1/T3)
   |  bed (white spread)          bed (pink coverlet)             |   <- R01, R05
   +--------------[ wide dark-wood POCKET DOORS ]-----------------+   <- R01, R03, R04
   |  LEFT WALL (front->back)        |      RIGHT WALL (front->back)  |
   |  fireplace (black, barley-twist)|      sink cabinet + drainboard |  <- R01 (T3)
   |  trefoil side table + lamp      |      taps on ceramic panel     |
   |  armchair (caned, green velvet) |      wall shelf + mugs         |
   |  mirrored cabinet + sconce      |      black range               |
   |  second cabinet                 |                                |
   |            DINING TABLE + 4 pressed-back chairs (pink rug)       |  <- R01, SC41/44
   |  Oriental rug in front of armchair                               |
   +------------------ FOURTH WALL: UNKNOWN -------------------------+
     (script: sitting-room windows, entrance door, sofa?, the iron's "corner")
```

- Assumed: the R01 camera stands near the fourth wall, looking through the pocket doors. **Unverified.**
- Not placed at all: the sofa, the sitting-room windows, the entrance, the sisters' bedroom, the hall
  to the toilet, the dress form's usual spot, the ironing board's usual spot.

## 3. Architectural reconstruction workflow

| Step | Tool | Output | Done when |
|---|---|---|---|
| 3.1 Collect overlapping frames for each wall (`REFERENCE_CAPTURE_GUIDE.md` §4) | refs.py | ≥ 2 overlapping frames per wall | Every wall is `VERIFIED` or explicitly `PLACEHOLDER` |
| 3.2 Lens and camera match per key frame | **fSpy** (vanishing points → focal length, camera pose); open source, desktop | `.fspy` files in `reference/analysis/` | Residual error checked on straight edges |
| 3.3 Import cameras into Blender (fSpy importer) | Blender | One camera per key frame, sharing one room coordinate frame | Matching floor and wall planes line up in ≥ 2 cameras |
| 3.4 Scale from anchors, each with a range | Blender measuring | `analysis/scale.md` | ≥ 3 independent anchors agree within ±5 % |
| 3.5 Grey-box blockout | Blender | `blockout/apartment_blockout.blend`, statuses as object properties | Overlays of each key frame through its camera line up |
| 3.6 Review gate | You | Approved or corrected blockout | Your sign-off |

**Candidate scale anchors** (each must be sourced and given a range; none is assumed now):
- Standard heights for this furniture type: dining-chair seat, dining-table top, sink rim, a
  ceramic splashback panel, a stove cooktop. Use catalogue or museum dimensions for the identified
  period pieces.
- Door-panel proportions and pocket-door width compared with chair and table widths in the same frame.
- Actors' heights from public sources, given as a range. A last resort only, because heels, posture
  and lens distortion add error.
- Brick or floorboard repeats, if visible in the film.

**Coverage problem:** a film set has "wild" walls that are removed for some camera angles. Rooms
can be slightly inconsistent between set-ups. Where two frames cannot both be satisfied, choose
the most-seen version and log the conflict.

## 4. Furniture modelling

1. One sheet per object (`reference/analysis/objects/<name>.md`): every catalogue frame showing it,
   its views, visible dimensions in relative terms, materials, condition (wear, scratches), and its status.
2. Model in Blender at real-world scale fixed by the blockout. Mid-poly with baked normal maps from
   a high-poly version only where it is seen up close (carvings on the armchair, fireplace and sideboard).
3. Quest budget per hero object: 2–8k triangles, one material, shared texture atlases where possible.
4. Objects seen so far and **eligible** for modelling (from R01–R05): fireplace surround; trefoil
   side table; domed glass table lamp; caned bergère armchair (and its cushions and shawl); mirrored
   upper cabinet with glass-fronted lower cabinet; second cabinet; two-arm sconce with tulip shades;
   dining table; 4 pressed-back chairs; pink floral rug; Oriental rug; black range and pots; wall shelf,
   canisters, mugs; sink cabinet, ceramic sink, drainboard, taps, splashback, under-sink curtain;
   pocket doors and casing; dress form; fringed floor lamp (R02); framed picture and mirror (R02);
   ironing board (R04); twin beds, bedding, nightstand, fringed lamps, curtains with pelmets, sheer
   nets, laundry basket, bookshelf and books (R01, R05).

## 5. Materials

| Surface | Approach | Evidence needed |
|---|---|---|
| Wallpaper (main room damask; back-room sprig; bedroom lattice) | Redraw each repeat as a clean tileable vector from the best frames. The source was period wallpaper from the Cooper Hewitt collection, "manipulated" by the graphics department (S05), so the Cooper Hewitt online collection may hold the base patterns: **a lawful lead** (check each item's image rights). | Sharp, flat-on frames of each wall |
| Dark stained wood (doors, furniture) | PBR wood with a dark stain; roughness from highlights in the film; wear on edges | Close-ups |
| Floorboards | Wide, worn, dark boards; measure board width relative to known objects | Floor-visible frames |
| Rugs | Re-paint patterns from frames; no generic "Persian" texture | Overhead or angled frames |
| Cast iron (range, fireplace) | Dark metal, slightly polished on edges | Close-ups |
| Ceramic (sink, splashback), enamel pots, glass shades | Standard PBR, with colour sampled under a known light | Close-ups |
| Textiles (curtains, velvet, coverlets) | Pattern redraw + sheen | Close-ups |

**Colour:** sample colours from several frames under different lighting, and identify the light
colour before setting albedo (a warm practical makes cream look orange). Record every sampled value
in `analysis/colour.md` with its frame id.

## 6. Lighting reproduction

1. **Mood target per scene:** SC41 *dusk* (window light plus practicals), SC44/45 *night*
   (practicals, candles on the table, fire). The R01 set-photo lighting is **not** a target.
2. Static GI is **baked** (Blender Cycles or Godot LightmapGI) on the CPU here or the GPU on your PC.
   Practical lamps are emissive meshes plus baked area/point lights.
3. **One dynamic light only:** the fire (and possibly the table candles), with a flicker curve. Its
   baked contribution is lowered so the flicker does not double-count.
4. Light probes for the character and moving objects, so Queenie sits in the same light as the room.
5. Validation: render each key-frame camera in Blender and compare side by side with the film frame
   (exposure, colour, contrast) before porting to the headset.

## 7. Fireplace simulation

The fireplace exists and is black and ornate (R01, R02, R03). Whether it burns, and in which scenes, is
**unknown**. The script places the clothes horse "in front of the fire" (SC41).
- If lit in the film: a layered flame flipbook or shader on cards inside the insert, ember-glow
  emissive with noise, a little rising heat haze (cheap screen-space or none on Quest 2), the dynamic
  flicker light from §6, and synced crackle audio.
- If unlit in the film: you decide (D7) whether to light it anyway for warmth. That would be a
  departure from the film, and it would be recorded as one.

## 8. VR locomotion and comfort

- **1:1 scale**, floor height calibrated once per session, standing or seated mode.
- Room-scale walking first. Teleport with a parabola as the default. Optional smooth locomotion with
  a comfort vignette. Snap turn 30° by default, with smooth turn optional.
- The apartment is small, so the play-space can be aligned to the room: the user can choose "align my
  real room to the apartment" so real walking covers the most important area.
- Collisions with walls and furniture; doors stay open as in the film (pocket doors open).

## 9. Sitting interactions

Seat anchors are added only for seats that exist in the references: the armchair, the 4 dining
chairs, the bed edges, and the sofa once it is located.

1. Each seat has a sit point (where the hips go) and a facing.
2. **Physical alignment mode (recommended):** you sit on a real chair and select a virtual seat. The
   rig moves so that your real head lands at the right offset above that seat's sit point. Your real
   chair supports you; the virtual one matches it.
3. **Virtual-only mode:** standing users "sit" by lowering the view to their calibrated seated eye height.
4. Hands resting on the armrests: the armrest height comes from the model, so it matches the reference.

## 10. Phases after this one

| Phase | Content | Gate |
|---|---|---|
| 2 | Reference review: you answer the decisions, add screenshots, conflicts resolved | Your approval of the library |
| 3 | Camera matching + grey-box blockout + scale report | Your approval of the blockout overlays |
| 4 | Engine skeleton (D1), locomotion, seating in the grey-box, on the headset | Comfort test on your headset |
| 5 | Furniture + materials, object by object, each compared with its references | Per-object sign-off |
| 6 | Lighting bake + fire + practicals; side-by-side comparison with frames | Your approval |
| 7 | Audio (see `AUDIO_REQUIREMENTS.md`) | Listening test |
| 8 | Queenie (see `QUEENIE_BEHAVIOUR_PLAN.md`) | Your direction at each step |
| 9 | Polish, performance, headset testing | — |
