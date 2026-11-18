# Reference Capture Guide

How to turn lawful sources into a catalogued, traceable reference library. Tool:
`tools/refs/refs.py` (Python 3.10+, Pillow, FFmpeg). Self-test: `tools/refs/selftest.sh`. Last run:
13/13 checks passed on a synthetic 1920×804 test video.

## 1. Rules

1. **Lawful sources only:** your own screenshots or photos while watching a copy you own or rent;
   official stills; official trailers and clips **viewed** on official channels; art books you own;
   a DRM-free video file you lawfully have.
2. **No DRM circumvention.** No Blu-ray/DVD decryption, no screen-recorder tricks that defeat
   streaming protection (a black or blank capture is the protection working: leave it), no
   YouTube rippers, no pirate copies.
3. **Never edit originals.** `extract` writes lossless PNG at the source's native resolution.
   `import-stills` copies files byte for byte. Contact sheets are separate, downscaled files.
4. **Every image is traceable:** a source id, a scene, a timecode when known, an evidence tier, and
   who catalogued it and when.
5. **Private.** `reference/frames`, `stills`, `scans`, `sheets`, `web-cache` and `analysis` are
   git-ignored. Do not upload them anywhere public.

## 2. Library layout

```
reference/
  sources.csv          every source: id, kind, origin, rights note, probe data, hash
  catalogue.csv        every kept image: frame_id, source, scene, timecode, frame number,
                       size, file, categories, camera setup, visible areas, status, tier, note
  frames/<SCENE>/      film frames and screenshots by screenplay scene (SC39 ... SC53)
  stills/<SET|PROMO|BTS|OTHER>/   set photos, press stills, behind-the-scenes, art-book photos
  scans/<SOURCE>/      scratch frames from scan/shots runs (safe to delete)
  sheets/              contact sheets (downscaled, labelled)
  analysis/            annotated copies, camera-match files (fSpy), measurement notes
  screenplay-notes/    your notes on scene text (no copied screenplay files)
  web-cache/           raw downloads before cataloguing
```

**Scene ids** follow the 2015 shooting script: `SC39` street, `SC40` stairwell, `SC41` arrival and
dinner, `SC44` after dinner, `SC45` men's bedroom, `SC52` sisters at window (exterior), `SC53`
empty bedroom. Use `SET`, `PROMO`, `BTS` or `OTHER` for non-film images. If the final cut has
apartment moments the script lacks, add them as `SC41A` and so on and note it.

**Categories** (validated): architecture, layout, doors, windows, walls, ceiling, floor, rugs,
furniture, fireplace, kitchen, bedroom, lighting, practicals, decor, props, textiles, exterior,
window-view, queenie-costume, queenie-hair, queenie-motion, queenie-face, tina, sound-source,
scale-anchor, other.

**Evidence tiers:** 1 film frame/still · 2 screenplay · 3 production or independent source · 4 unknown.

## 3. Commands

Run from the project root. On Windows use `py tools\refs\refs.py ...`; FFmpeg can be installed with
`winget install Gyan.FFmpeg` and Pillow with `py -m pip install Pillow`.

### Register a source (once per source)
```
python3 tools/refs/refs.py add-source --id MYSHOTS-01 --kind stills \
  --title "My screenshots, viewing 1" --origin "phone photos of TV, rented stream, 2026-11-20" \
  --rights "personal reference, private"
python3 tools/refs/refs.py add-source --id FILM-FILE --kind video --path "D:/films/fb.mkv" \
  --title "Fantastic Beasts (2016)" --origin "DRM-free file I own: <how>" --rights "own copy, private study"
```
For video, `add-source` records resolution, fps, duration, pixel aspect, HDR transfer and a hash.
It warns about HDR (frames will look flat) and non-square pixels (use `--square`).

### Screenshots and photos (the main route without a video file)
```
python3 tools/refs/refs.py import-stills --source MYSHOTS-01 --scene SC41 --tier 1 \
  --timecode 00:41:12 --category "fireplace;walls" --views "left wall;mantel" IMG_2001.jpg IMG_2002.jpg
```
Tips for photographing a screen: pause on the frame, phone parallel to the screen and filling it,
lights off, no flash, note the player's timecode in the filename. A 4K TV pause beats any compressed
still.

### DRM-free video file: survey, then keep exact frames
```
# 1. one frame per camera cut in the apartment sequence -> contact sheet + shots.csv
python3 tools/refs/refs.py shots --source FILM-FILE --from 00:38:00 --to 00:47:00
# 2. denser sampling of a slow pan
python3 tools/refs/refs.py scan  --source FILM-FILE --from 00:41:05 --to 00:41:20 --every 0.5
# 3. keep the frames that matter, at full resolution
python3 tools/refs/refs.py extract --source FILM-FILE --scene SC41 --at 00:41:12.500 --at 00:41:14 \
  --category "fireplace;walls" --setup A-wide-from-door --views "left wall;mantel;pocket doors"
```
Timecodes accept `1:02:03.5`, `62:03.5`, `3723.5` or `01:02:03:12@24` (frames). The catalogue
records seconds and frame number (seconds × fps).

### Review
```
python3 tools/refs/refs.py list --scene SC41
python3 tools/refs/refs.py tag --frame F00012 --frame F00013 --status key --setup B-reverse-from-window
python3 tools/refs/refs.py sheet --category fireplace        # all fireplace images on one sheet
python3 tools/refs/refs.py similar --scene SC41              # frames that share a camera setup
```
`similar` uses a perceptual hash. It finds repeats of the same framing (useful for grouping
coverage), not partial overlap between different angles. Overlap is marked by hand in `views`.

## 4. Finding useful camera angles and overlaps

For every kept frame, fill `views` with the **named surfaces** it shows, using one vocabulary:

`wall:fireplace` · `wall:kitchen` · `wall:pocket-doors` · `wall:entrance` (unknown yet) ·
`backroom:windows` · `floor` · `ceiling` · object names (`range`, `sink`, `sideboard`, `armchair`,
`dining-table`, `sofa`, `dress-form`, `ironing-board`).

Two frames overlap when they share at least two named objects. Overlapping pairs are the input for
camera matching (see `APARTMENT_RECONSTRUCTION_PLAN.md` §3).

**Priority shots to capture:**
1. The wide entrance of SC41: the first view of the whole room.
2. Any reverse angle showing the wall behind the R01 camera (entrance, sofa, sitting-room windows).
3. The dinner wides of SC41 and SC44: table, chairs, people (useful as scale anchors).
4. Newt at the window and at the doorknob (SC41): window and entrance positions.
5. The SC45 bedroom wides and the door Tina shuts (Queenie's room glimpsed through it).
6. SC53: the sisters bursting in, which shows the room-to-room relationship.
7. SC52 exterior: the building façade and window position.
8. Close-ups of the fireplace, range, sink, sideboard and lamps for materials.
9. Queenie full-body in each outfit; her walk, sitting and cooking gestures.
10. The audio scenes: listen for the room tone, fire, street, and any music source.

## 5. Recording conventions

- `note`: what is visible and what is uncertain, in plain words. Never record a guessed measurement as a fact.
- `status`: `unreviewed` → `useful` / `key` / `rejected`.
- A frame that contradicts an earlier conclusion keeps both: add a line to `VISUAL_RESEARCH_LIBRARY.md` §6 *Open conflicts*.
