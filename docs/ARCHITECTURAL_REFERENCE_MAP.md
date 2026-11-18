# Architectural Reference Map — Phase 2

Which references support each architectural element. Image ids are the catalogue ids from
`reference/catalogue.csv`. Pixel measurements are listed in `app/src/spec/r01-solve.js` (`PX`).

## References used

| Ref | Catalogue | What it is | Source link | Role in Phase 2 |
|---|---|---|---|---|
| R01 | F00001 | Wide set photograph of the main room through the pocket doors | https://www.harrypotter.com/fact-file/locations/tina-and-queenies-apartment | **Primary.** Solved camera; nearly every derived dimension |
| R02 | F00002 | Queenie, dress form, black arched fireplace, picture over the mantel, mirror to the right | same page; also https://www.harrypotter.com/features/why-domestic-magic-should-not-be-underestimated | Fireplace style and arched insert; order mirror ↔ fireplace |
| R03 | F00003 | Queenie at a dark panelled casing, fireplace and mirror behind | https://www.harrypotterfanzone.com/fantastic-beasts-movie-stills/movie-1 ("Queenie in her apartment") | Casing is dark panelled wood; fireplace near it |
| R04 | F00004 | Film frame: sisters framed by panelled double doors; two windows with nightstand and lamp between | https://www.harrypotterfanzone.com/fantastic-beasts-movie-stills/movie-1 | Confirms the doorway → window-wall composition in the film itself |
| R05 | F00005 | Film frame SC45: Jacob in bed, curtains behind the bed, bedside lamp, bookshelf | same gallery | Back room = twin-bed room; bed against the window wall |
| S04 | — | Final Shooting Script 2015 (scenes 39–45, 52–53) | https://assets.scriptslug.com/live/pdf/scripts/fantastic-beasts-and-where-to-find-them-2016.pdf | Existence of the fire, sitting-room windows, sofa, kitchen, back room, other room, hall |
| S01 | — | Fact-file text ("two-bedroom apartment") | https://www.harrypotter.com/fact-file/locations/tina-and-queenies-apartment | Room count (conflict noted) |
| S05 | — | Set decorator interview (Pinnock) | http://www.the-leaky-cauldron.org/2017/02/18/behind-the-scenes-with-oscar-nominated-fantastic-beasts-design-team/ | Iron and ironing board (R04 placement) |

## Element → evidence

| Element (spec id) | Status | Evidence | Specific visual evidence |
|---|---|---|---|
| Main-room width (`mainLeft`, `mainRight`) | DERIVED | R01 | Left corner at x 375 (foreshortened wallpaper turns frontal on the pier); right corner at x 1440 (tone change). Second right-wall cue: sink-cabinet end face right edge x 1790 at floor y 1120. |
| Pocket-door wall (`pocketWall`) | DERIVED (thickness PROVISIONAL) | R01, R03, R04 | Casing outer x 530 / 1305; floor under leaves y 807 |
| Doorway clear opening and head (`pocketDoorway`) | DERIVED | R01 | Jambs x 580 / 1255; head underside y 105 |
| Casing and head entablature (`casingL/R`, `casingHead`) | DERIVED; top is a MINIMUM | R01, R03 | Cornice runs off the top of R01 (y 0); R03 shows dark panelled casing |
| Pocket leaves (`leafL`, `leafR`) | DERIVED | R01, R04 | Leaf leading edges in R01 at x 670 / 1155; panelled leaves in R04 |
| Main skirting (`skirtingMain`) | DERIVED | R01 | Skirting top y 755 on the right pier |
| Fireplace (`fireplace`, `mantelShelf`) | DERIVED end and height; PROVISIONAL width | R01, R02, R03, S04 SC41 | Mantel end at (220, 512); barley-twist column still at the frame edge x 20; arched insert R02; "in front of the fire" SC41 |
| Firebox (`firebox`) | PROVISIONAL | R02 | Arched opening seen; size not measurable |
| Back window wall (`backWindowWall`) | DERIVED | R01, R04, R05 | Bed-foot floor contact y 705 + bed length; window-wall composition in R04 |
| Windows (`window1`, `window2`) | DERIVED centres; PROVISIONAL size | R01, R04 | Curtain rods x 675–895 and 935–1160 at y 195 |
| Pelmets (`pelmet`) | DERIVED | R01 | Pelmet top y 195 |
| Back crown moulding (`crownBack`) | DERIVED | R01 | Ceiling line y 150, crown bottom y 185 |
| Back ceiling (`ceiling_back`) | DERIVED | R01 | As above |
| Main ceiling (`ceiling_main`) | PROVISIONAL | — | Not visible; ≥ casing top |
| Back side walls (`backLeft`, `backRight`) | PROVISIONAL | none | Hidden behind the leaves; at least x 0.25–3.68 of the back wall is visible |
| Fourth-wall limit (`fourthWallLimit`) | LIMIT | S04 SC41 (windows, sofa, door imply something there) | Never seen |
| Floors (`floor_main`, `floor_back`, `threshold`) | DERIVED extent where walls are derived | R01 | Wide dark boards (finish is Phase 3) |
| Footprints (table, cabinet, range, sink, beds) | mixed | R01, R05 | See `APARTMENT_LAYOUT.md` §6 |

## Consistency between independent references

| Relationship | R01 | R04 (film) | R05 (film) | R02/R03 |
|---|---|---|---|---|
| Doorway framed by dark panelled leaves | yes | yes | — | R03 casing |
| Two tall windows behind, pier with nightstand and fringed lamp between | yes | yes | — | — |
| Bed directly against curtained window wall | yes | — | yes | — |
| Fireplace with mirror toward the doorway side | yes (order) | — | — | yes (R02) |

## Not used (and why)

- Fan-site set-visit descriptions without images (pages now 404): not architectural evidence.
- Fan wiki layout statements: no citations; leads only.
- Approximate reference cameras R02/R04/R05 in the inspector: placed by eye for comparison, **not
  solved**, and not used to set any dimension.
