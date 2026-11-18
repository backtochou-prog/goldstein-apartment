# Proposed Project Directory Structure

`[exists]` = created in Phase 1. `[later]` = proposed; created only when its phase starts.
`(private)` = git-ignored; never published.

```
goldstein-apartment/
  README.md                                   [exists] what this is, rules, where to start
  .gitignore                                  [exists] keeps film-derived media and audio private
  docs/                                       [exists]
    PROJECT_RECONNAISSANCE.md
    VISUAL_RESEARCH_LIBRARY.md                sources, image catalogue, findings by tier, conflicts
    REFERENCE_CAPTURE_GUIDE.md
    APARTMENT_RECONSTRUCTION_PLAN.md
    QUEENIE_BEHAVIOUR_PLAN.md
    AUDIO_REQUIREMENTS.md
    PROJECT_STRUCTURE.md                      this file
    MISSING_REFERENCES_AND_DECISIONS.md
  tools/
    refs/refs.py                              [exists] reference library CLI
    refs/selftest.sh                          [exists] 13 checks on a synthetic video
  reference/                                  [exists]
    sources.csv                               [exists] source register
    catalogue.csv                             [exists] image catalogue (F00001-F00006 so far)
    frames/<SC..>/                            (private) film frames / screenshots by script scene
    stills/<SET|PROMO|BTS|OTHER>/             (private) set photos, press stills
    scans/                                    (private) scratch
    sheets/                                   (private) contact sheets
    analysis/                                 (private) fSpy files, colour.md, scale.md, objects/*.md
    screenplay-notes/                         your scene notes (no copied script)
    web-cache/                                (private) raw downloads
  blockout/                                   [later, phase 3] apartment_blockout.blend, camera matches
  assets/                                     [later, phase 5]
    source/                                   .blend working files per object
    textures/                                 (private: film-derived patterns)
    export/                                   .glb per object
  audio/                                      [later, phase 7]
    masters/                                  (private) 48 kHz WAV
    user-supplied/                            (private) the song file you provide
    LICENCES.md                               one line per third-party sound
  character/                                  [later, phase 8] Queenie: model, rig, animations, activity data
  app/                                        [later, phase 4] engine project (Godot or IWSDK, per D1)
```

Version control (D12): if wanted, a **local** git repository, or a **private** remote with media
excluded by `.gitignore`. Never a public repository and never the auto-deploying Vercel flow.
