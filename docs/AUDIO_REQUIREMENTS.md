# Audio Requirements

## 1. What the references establish about sound

Very little. Sound cannot be studied without the film.
| Item | Evidence | Status |
|---|---|---|
| A fire in the sitting room ("clothes horse … in front of the fire") | Script SC41 | Exists. Whether it is lit in the film, and the fuel (coal, wood, gas), are **unknown**. |
| Wooden floorboards | R01 | Footstep surface known |
| Self-working iron, revolving clothes horse, magical cooking, self-stirring mugs | Script SC41/45; Pinnock (S05) | Sound design for these is unknown |
| Winter night outside; a roar; neighbours' windows | Script SC52 | Exterior. The ambient street sound inside is unknown. |
| "You're the Cream in My Coffee", performed by Ruth Etting | Film credits (S12, S13) | **Where it plays in the film is unknown.** No source places it in the apartment. |
| A radio, gramophone or record player in the apartment | Not in the script, not in any image | **Not established.** Adding one would be inventing an object (see D11). |

## 2. Sound list (the build only includes items marked "evidenced" or approved by you)

| Sound | Source plan | Spatial | Evidence |
|---|---|---|---|
| Fire crackle (bed + random pops + settle) | Record a real fire of the right fuel once known, or CC0 libraries (licence logged per file in `audio/LICENCES.md`) | Point source in the fireplace insert, HRTF | Fire exists (T2/T1); burning state unknown |
| Room tone (small furnished room, 1926, no appliances hum) | Record a quiet furnished room, or synthesise low-level air | Ambisonic or stereo bed, non-directional | Design choice |
| Exterior through windows (dusk or night street) | Only once the film's ambience is heard; until then **silence** | Positioned at the windows; muffled by the glass | Unknown |
| Footsteps (user, Queenie) on wooden boards and rugs | Foley: boards with creak variants, softer on rugs | Attached to the feet | Floor known (R01) |
| Queenie's dress and slip rustle, wand swish | Foley | Attached to the character | Costume known |
| Magical cooking (chopping, rolling, stirring, plates landing) | Foley, layered with subtle tonal shimmer **only if** the film does it | At the kitchen run and table | SC41 (T2) |
| Self-ironing iron, clothes horse creak | Foley | At their positions | SC41 (T2) |
| Song (see §4) | User-provided file | See D11 | User direction |

## 3. Spatial audio specification

- HRTF spatialisation for every point source. Inverse-distance roll-off, with reference distance
  about 1 m for small sources and about 2 m for the fire.
- **Room acoustics:** a convolution or algorithmic reverb matched to a small, furnished, wood-floored
  room. The design target is a short decay (≈ 0.3–0.5 s RT60). This is a starting value to tune by ear
  against the film, not a measurement.
- **Occlusion:** sources in the back room are slightly low-passed when the listener is in the main room
  (the doors are open but the opening is narrow), and the reverse.
- **Voice budget:** ≤ 8 simultaneous spatial voices on Quest 2; the fire uses 2.
- **Formats:** masters 48 kHz / 24-bit WAV in `audio/masters/` (git-ignored); runtime OGG Vorbis
  (Godot) or Opus/AAC (WebXR).
- **Loudness:** fire ≈ −30 LUFS at 1 m, room tone ≈ −45 LUFS, song (if diegetic) mixed so speech-level
  sounds stay intelligible. Tune on the headset.
- **No audible loops:** the fire is built from 3 layers with randomised grain timing; no single file
  under 60 s repeats on its own.

## 4. "You're the Cream in My Coffee"

- Song: music by Ray Henderson, words by B. G. DeSylva and Lew Brown, 1928. The film credits
  **Ruth Etting's** performance (S12, S13).
- **You supply the recording** (a purchased download, or a CD you own, ripped by you).
  The project never downloads it. The file lives in `audio/user-supplied/`, which is git-ignored.
- Rights orientation, not legal advice: the composition entered the US public domain in 2024, but it
  is still protected in the UK and EU (an author died in 1970). The status of a specific recording
  depends on the country and the recording date. A private build that is never distributed and uses
  a copy you bought is the simplest lawful path. Nothing in this project is published.
- **Placement is a decision (D11):** the film evidence found so far does not put the song in the
  apartment or show any playback device. Options:
  1. Non-diegetic: plays softly as an ambient layer, with no visible source. Invents no object.
  2. Diegetic: only if a radio or gramophone is found in the film's apartment.
  3. Diegetic with a device you choose: a deliberate departure from the film, recorded as one.
  The recommendation is 1, until the film shows otherwise.
- If diegetic: mono source, period band-limiting (roughly 100 Hz – 5 kHz) only if the device is shown,
  and spatialised from the device.

## 5. What you need to provide or decide

1. The song file (format: WAV/FLAC preferred, otherwise a high-bitrate MP3/AAC) and where you bought it.
2. D11 (song placement), and D7 (whether the fire burns if the film shows it cold).
3. Whether Queenie speaks (D8). If so, who records the lines.
4. Permission to use CC0 library sounds for the fire, footsteps and foley, or a preference for recordings you make.
