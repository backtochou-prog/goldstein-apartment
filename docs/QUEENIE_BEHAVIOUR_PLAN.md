# Queenie Behaviour Plan (research and architecture only)

Nothing about Queenie's activities is invented here. Every activity is tagged with its evidence. Anything
not established waits for your direction.

## 1. What the references establish

### Appearance (1926, first film only)
| Item | Evidence | Tier |
|---|---|---|
| Honey-blonde, short, curled bob; red lips | R02, R03, R04; Atwood: "curly honey-coloured bob" (S11) | T1/T3 |
| Pale pink satin slip with black lace overlay and thin black straps (arrival) | R03; script SC41 "a silk slip" | T1/T2 |
| Navy dress, deep V-neck with a pink inner layer, sheer sleeves (after "put something on") | R02, R04 | T1 |
| "A much less demure dressing gown" (night, SC45) | Script only; **not seen** | T2 |
| Outdoor: rose/pink coat with red collar or scarf | R06 (posed promo photo) | T1 (outdoor only) |
| Colour intent: "light … air-like and rosy and warm and approachable"; "blush-coloured silks" | Colleen Atwood (S11) | T3 |
| **Not** the platinum-wave, black-dress look | That is *Crimes of Grindelwald* (2018) | — |

### Behaviour in the apartment (script scenes)
| Activity | Scene | Tier | Notes |
|---|---|---|---|
| Supervises the magical mending of a dress on the dressmaker's dummy | SC41 | T2 + T1 (R02, R03) | Wand held to the dummy |
| Wand gesture makes the dress run up her body | SC41 | T2 | Outfit change |
| Runs to Jacob when he staggers; reads his mind; warm, chatty | SC41 | T2 | Attentive to a guest |
| Enchants the cooking in the kitchen: ingredients float from cupboards, vegetables chop themselves, pastry rolls, pans stir | SC41 | T2 + T3 (Cinesite S09) | With Tina |
| Wand flick; the strudel assembles and bakes in mid-air and lands on the table | SC41 | T2 + T3 | VFX shot |
| Sits at the dinner table, talks and laughs with Jacob; long mutual gaze | SC44 | T2 | Eye contact is a defining trait |
| Asks Tina questions; teasing between the sisters | SC41, SC44 | T2 | |
| Wears a dressing gown in "the other room" at night | SC45 | T2 | |
| Leans out of the bedroom window at night | SC52 | T2 | |
| Bursts into the men's room with Tina; upset: "But we made 'em cocoa…" | SC53 | T2 | |

### Activities you asked about, checked against the evidence
| Requested | Status |
|---|---|
| Reading | **Not established for Queenie.** Magazines are in the room (*Witch Chat* and others, SC41). Jacob reads in SC45. Needs your direction (D9). |
| Cooking | **Established** (magical cooking, SC41) |
| Walking between areas | Implied (SC41 movement between the dummy, Jacob and the kitchen) |
| Sitting | **Established** at the dinner table (SC44). Other seats not established. |
| Idle animations | Not referenced; to be derived from her performance (the film is needed) |
| Occasional eye contact | Consistent with her character (SC44); its strength is a design choice (D10) |
| Contextual interactions | Her Legilimency and hostess behaviour suggest a direction. Dialogue is **your** decision (D8). |

## 2. Likeness and voice (decision D5)

Queenie is played by a real actor. Recommended boundaries for a private build:
- **No face scan or photo-real replica of the actor's face, and no deepfake.** Build a character
  interpretation instead: the costume, hair, colouring, proportions and movement style come from the
  references; the face is designed, not copied.
- **No AI clone of the actor's voice.** Options: no speech (gesture and expression only), your own
  recorded lines, or a credited voice performer. Clips of film dialogue are a separate decision for
  you; they are not recommended because they tie the character to scenes that make no sense with the
  user present.
- How stylised the character is (realistic versus slightly stylised) affects the uncanny-valley risk
  in VR. It is your call (D6); the recommendation is a restrained, painterly-realistic style.

## 3. System architecture (engine-neutral)

```
Activity library (data, one file per activity)      <- only evidence-backed or user-approved
   id, evidence refs, station, entry/loop/exit animations, props, VFX, duration range, interruptible
        |
Scheduler (utility scoring + simple daily rhythm you define)
   picks the next activity; never the same one twice in a row; respects "user is near/sitting" rules
        |
Locomotion: navmesh paths between stations, walk speed and style from reference
        |
Animation layer: base clip + additive idle (breathing, weight shift) + hand IK (props)
   + seat IK (shares seat anchors with the user, see reconstruction plan §9)
        |
Attention layer: head/eye look-at with angle limits, saccades, blinks; gaze target picker
   (task object > speaker > user), eye-contact budget (e.g. ≤ 1 brief glance per N seconds)
        |
Interaction layer: proximity zones (personal space keep-out, conversation range),
   reactions (glance, smile, pause activity), optional lines (D8)
```

**Stations (only those with evidence):** dress form; kitchen run (range, cupboards, sink); dining table
(her chair); the room beyond the pocket doors; the bedroom window (SC52) if the sisters' room is
built. Each station's position comes from the approved blockout, never before.

**Comfort and respect rules:**
- She never walks through the user and never stands inside their personal space (≥ 0.8 m keep-out, tunable).
- Eye contact is brief and natural, never a constant stare.
- If the user sits at the table, she can join the table activity (SC44 pattern), if you approve it.

## 4. Production pipeline

| Part | Approach | Budget (Quest 2) |
|---|---|---|
| Base body | Blender + MPFB2 (open source, CC0 output) or a hand-sculpt, matched to the reference proportions | ≤ 30k triangles |
| Hair | Hair cards for the curled bob, alpha-tested, 1 material | ≤ 8k triangles |
| Costumes | Slip, navy dress, dressing gown (once seen); cloth simulated offline and baked to bones/blend shapes | Shared atlas |
| Face | Blend shapes for smile, talk, blink and look; design approved by you first | ~30 shapes |
| Animation | (a) your own motion capture (phone-video mocap tools, or a suit if available); (b) a licence-checked library for generic walks only; (c) hand-keyed wand gestures matched to frames | ≤ 60 bones |
| Magic VFX | Floating ingredients and self-stirring pans for the cooking activity; dress-mending threads at the dummy | ≤ 2 draw calls each |

## 5. Research still needed

1. Frames of Queenie's walk, sitting posture, wand grip and gesture tempo (SC41, SC44).
2. Front, side and back views of the slip, the navy dress and the dressing gown (if seen).
3. Her shoes and stockings.
4. Whether she wears jewellery in the apartment scenes.
5. Your schedule and direction: which of the evidenced activities loop, in what order, at what times.
