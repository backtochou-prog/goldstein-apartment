# Photographic 2.5D Pipeline (direction change)

Status: prototype built and tested with the one calibrated source available. Supersedes the "fully modelled" assumption: the Phase 2 geometry is now a **proxy** (structure, collision, depth) and the **photograph supplies the appearance**. Phase 3 procedural materials remain only as fill where no photograph can see.

## How it works
1. **Projective texturing.** Each surface fragment is projected through the photograph's solved camera (`app/src/spec/r01-solve.js`) and takes its colour from the photo. From the capture viewpoint the result is the photograph itself by construction.
2. **Visibility.** A depth map rendered from the photo camera prevents hidden surfaces from receiving photo pixels.
3. **Fade rules.** Fade at grazing angles and frame edges; flat proxies (walls, floors, rugs, drapes) keep the photo from any angle; complex furniture uses it only within about 7-24 degrees of the capture ray; a furniture-mask ring removes smears from flat surfaces as the viewer leaves the ray.
4. **Window backdrops.** Planes outside each window carry the photographed view through the nets.
5. **Fill.** Everything else keeps the Phase 3 procedural look. A *Coverage map* mode shows green (photo) and red (fill).
Cost: no extra draw calls (a shader term), one 1800x1248 texture (11.4 MB) and one depth map (6.2 MB).

## Measured (`npm run test:photo`)
| Check | Result |
|---|---|
| Mean abs error vs the photograph from its own viewpoint | **8.0 / 255** (procedural Phase 3: 51.7, so 6.4x closer); 88% of pixels within 16 levels |
| Surfaces visible from R01 that are photographic | 94.5% |
| Photographic share of the visible surface elsewhere | entry point 70%, 1 m left 34%, 1 m right 47%, near the doorway 60%, back room 46% |
Screens: `reference/analysis/phase4photo-screens/`.

## Honest limits (a single photograph)
- **Only R01 is usable.** It is an official set photograph, not a film frame; R02-R05 have no solved cameras, so projecting them would misplace pixels. There are no film screenshots yet.
- **Parallax is only as good as the proxy.** My furniture shapes are approximate, so away from the capture ray photographed furniture pixels smear onto the wrong surfaces; this is why furniture falls back to fill quickly. Visible seams between photo and fill remain.
- **Unseen surfaces have no photograph**: fourth wall, ceilings, sisters' room, sides and backs of furniture. They are procedural fill, not invented photographs.
- **The photo has baked lighting.** Projected colour is unlit, so Phase 4 lighting (fire) will not act on photographic surfaces without a de-lighting step.
- It does not yet look like a finished photographic environment away from the capture point; more viewpoints are the fix, not more tuning.

## What improves it
1. Your own screenshots of the film from several angles of each room (lawful copy), registered in `reference/photo-assets/sources.json`.
2. One camera solve per screenshot (same method as R01); the layer accepts several sources next.
3. Baking projections into per-object atlases (mipmapped, KTX2) for Quest; depth maps where proxy shapes are weak.
4. Selective 3D still to do: fire, doors and handles, sitting, Queenie.
