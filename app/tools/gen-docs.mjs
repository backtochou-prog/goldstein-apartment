// Generates the data-driven Phase 3 documents from the live manifest, material definitions and measured fit:
//   docs/FURNITURE_INVENTORY.md, docs/OBJECT_PLACEMENT_MANIFEST.md, docs/MATERIAL_REFERENCE_GUIDE.md
// Inputs: exports/object-manifest.json (npm run manifest), reference/analysis/phase3-bbox.json (npm run bboxes -- --json ...),
//         reference/analysis/phase3-perf.json (written by npm run test:interior), src/interior/sampled-colours.json.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { NOT_RECONSTRUCTED } from '../src/spec/objects.js';
import { MATERIAL_DEFS, ARCH_FINISH } from '../src/interior/material-defs.js';

const HERE = import.meta.dirname, DOCS = resolve(HERE, '../../docs');
const J = (p) => JSON.parse(readFileSync(resolve(HERE, p), 'utf8'));
const man = J('../exports/object-manifest.json').objects;
const fit = existsSync(resolve(HERE, '../../reference/analysis/phase3-bbox.json')) ? J('../../reference/analysis/phase3-bbox.json') : [];
const perf = existsSync(resolve(HERE, '../../reference/analysis/phase3-perf.json')) ? J('../../reference/analysis/phase3-perf.json') : null;
const colours = J('../src/interior/sampled-colours.json');
const fitOf = Object.fromEntries(fit.map((f) => [f.id, f]));
const f2 = (v) => v.toFixed(2);
const esc = (s) => String(s ?? '').replace(/\|/g, '/').replace(/\n/g, ' ');
const groups = [...new Set(man.map((o) => o.group))];
const count = (arr, fn) => arr.filter(fn).length;

// ================================================================ FURNITURE_INVENTORY.md
{
  const tri = (g) => Math.round(man.filter((o) => g === null || o.group === g).reduce((n, o) => n + o.triangles, 0));
  let md = `# Furniture Inventory — Phase 3

Generated from \`app/src/spec/objects.js\` by \`npm run docs\` (do not edit by hand; edit the manifest). Status: built and tested, awaiting your review.

**${man.length} objects** are modelled (${count(man, (o) => o.layer === 'R01')} in the set-photograph dressing, ${count(man, (o) => o.layer === 'SC41')} script props that are off by default). They are custom geometry built from the R01 measurements, merged per material for the headset. Nothing is a library model and nothing was invented to fill space: every object is in a catalogued reference image, and every one that is not is listed under *Not reconstructed*.

## How to read the tables
- **Existence** — VERIFIED: visible in a catalogued image (R01 set photograph, R02-R05 stills and film frames). SCRIPT: only in the 2015 shooting script.
- **Fidelity** — **A** custom silhouette matched to the image, carving simplified. **B** recognisable form with matched proportions, details simplified. **C** proportions only: the reference shows too little to model more (the object is a stand-in of the right size and colour, not a likeness).
- **Position** — see \`OBJECT_PLACEMENT_MANIFEST.md\`. ✔ = verified by an image anchor, ◇ = provisional.

## Totals
| Group | Objects | Triangles |
|---|---|---|
${groups.map((g) => `| ${g} | ${count(man, (o) => o.group === g)} | ${tri(g).toLocaleString('en')} |`).join('\n')}
| **All** | **${man.length}** | **${tri(null).toLocaleString('en')}** |

Fidelity: A ${count(man, (o) => o.fidelity === 'A')} · B ${count(man, (o) => o.fidelity === 'B')} · C ${count(man, (o) => o.fidelity === 'C')}.

`;
  for (const g of groups) {
    md += `## ${g}\n| ID | Object | Seen in | Fid. | Pos. | What the model is / what is unknown |\n|---|---|---|---|---|---|\n`;
    for (const o of man.filter((x) => x.group === g)) {
      md += `| \`${o.id}\` | ${esc(o.name)}${o.layer === 'SC41' ? ' *(script layer)*' : ''} | ${o.references.join(', ')} | ${o.fidelity} | ${o.confidence.position === 'VERIFIED' ? '✔' : '◇'} | ${esc(o.notes || o.relations || '')} |\n`;
    }
    md += '\n';
  }
  md += `## Not reconstructed (named in the references or script, but not shown in any catalogued image)
These are **documented, not guessed**. Several appear in the film; the shapes are simply not in our references.

| Object | Why it is absent |
|---|---|
${NOT_RECONSTRUCTED.map(([a, b]) => `| ${esc(a)} | ${esc(b)} |`).join('\n')}

## Identification uncertainties in what *is* modelled
| Object | Uncertainty |
|---|---|
| \`chair_left\` | Curved back posts suggest a **bentwood** chair; it is modelled as pressed-back like the other three. |
| \`range\` | Which way the oven front faces is not settled (R01 reads best facing the camera side). Its width (0.83 m) and the hob height (0.80 m) follow the pot rows. |
| \`mirror_cabinet\` | The upper mirror unit is about 0.95 m between the columns over the doorward half of a 1.4 m sideboard; its lateral extent is ±0.3 m. Fretwork and carving are simplified. |
| \`lantern_lamp\` | Image is wider than a typical lantern lamp; it is scaled 1.7× in width to match. |
| \`photo_a\`, \`photo_b\`, \`figurine\` | They stand 0.15-0.3 m above the counter in the image rows, on a support that cannot be resolved (mirror frame or ledge). |
| \`fp_column_*\`, \`fp_arch\` | R01 shows one spiral column; the count, spacing and arch centring are inferred. The surround body is the approved Phase 2 mass: ornamental carving (visible in R02) is **not** modelled. |
| \`rug_oriental\` | Only its far edge and border are visible: width, depth and design are placeholders. |
| \`bookshelf\` + books | One film frame (R05); its place is not in R01. |
| Pattern drawings | Wallpaper motifs, rug motifs and floral fabrics are drawn from sampled tones; no reference resolves their individual motifs (\`MATERIAL_REFERENCE_GUIDE.md\`). |

## Budgets
${perf ? `Measured in the default scene (R01 dressing, architecture included): **${perf.triangles.toLocaleString('en')} triangles**, **${perf.meshes} draw calls**, **${perf.materials} materials**, **${perf.textureMB.toFixed(1)} MB** of textures; the default furniture (R01 layer) is ${(perf.interiorTriangles - man.filter((o) => o.layer === 'SC41').reduce((n, o) => n + o.triangles, 0)).toLocaleString('en')} triangles in ${perf.interiorDraws} draw calls (the hidden script layer adds ${man.filter((o) => o.layer === 'SC41').reduce((n, o) => n + o.triangles, 0).toLocaleString('en')}).` : '(run npm run test:interior to measure)'}
`;
  writeFileSync(resolve(DOCS, 'FURNITURE_INVENTORY.md'), md);
}

// ================================================================ OBJECT_PLACEMENT_MANIFEST.md
{
  const ver = count(man, (o) => o.confidence.position === 'VERIFIED'), prov = man.length - ver;
  const cover = fit.map((f) => f.cover).sort((a, b) => a - b), med = cover.length ? cover[Math.floor(cover.length / 2)] : 0;
  let md = `# Object Placement Manifest — Phase 3

Generated from \`app/src/spec/objects.js\` + the measured R01 fit by \`npm run docs\`. Machine-readable copy: \`app/exports/object-manifest.json\` (\`npm run manifest\`).

## Frame and conventions
Same world frame as Phase 2: **metres**; x from the main-room left wall, z from the pocket-door wall face (+z toward the unseen fourth wall and the R01 camera), y up. Yaw is in degrees about +y; **yaw 0 = the object's front faces +z**, yaw 90 faces +x (into the room from the left wall), yaw −90 faces −x (into the room from the right wall). Tilt (cushions) is applied after yaw.

Positions are **computed from R01 pixel anchors** through the same camera model as the architecture (floor contacts, wall contacts, or a located support), so they follow the solve assumptions. They were then compared with the photograph (below).

## Confidence definitions
| Term | Meaning |
|---|---|
| Position **VERIFIED** | Located by an image anchor (floor or wall contact, or sitting on a located support), within the solve uncertainty: about ±0.15 m laterally and ±15 % in depth. |
| Position **PROVISIONAL** | The sight line is known but depth is not, or the spot is a stated placeholder. Always has a note. |
| Orientation | VERIFIED / PROVISIONAL, same reading. |
| Size | **MEASURED** = model size checked against the visible R01 pixel box · ESTIMATED · PROVISIONAL. |
| Layer | **R01** = the dressing in the set photograph (default). **SC41** = script props (dress form, ironing board), hidden by default because their position is not established. |

## Summary
**${man.length} objects: ${ver} with a verified position, ${prov} provisional.** Orientation verified: ${count(man, (o) => o.confidence.orientation === 'VERIFIED')}. Size measured: ${count(man, (o) => o.confidence.dims === 'MEASURED')}.

| Group | Objects | Verified | Provisional |
|---|---|---|---|
${groups.map((g) => `| ${g} | ${count(man, (o) => o.group === g)} | ${count(man, (o) => o.group === g && o.confidence.position === 'VERIFIED')} | ${count(man, (o) => o.group === g && o.confidence.position !== 'VERIFIED')} |`).join('\n')}

## Fit to the photograph (R01)
For ${fit.length} objects a pixel box was read from R01. Each object's real geometry is projected through the solved R01 camera and compared. **Cover** = how much of the visible photo box the model covers (the box is the *visible* part, so partly hidden objects can only be checked this way); **IoU** is also given.
- Median cover **${(med * 100).toFixed(0)} %**; ${count(fit, (f) => f.cover >= 0.6)} of ${fit.length} objects ≥ 60 %; ${count(fit, (f) => f.cover >= 0.8)} ≥ 80 %.
- Below 60 %: ${fit.filter((f) => f.cover < 0.6).map((f) => `\`${f.id}\` ${(f.cover * 100).toFixed(0)} %`).join(', ') || 'none'}.
- **This check is not independent evidence of position**: the anchors and the boxes come from the same photograph, and several dimensions were tuned to the image rows (listed in the changelog). It verifies that the model *looks like the photograph through the photograph's camera*, which is the stated goal. The independent check is the film.

Visual checks: \`reference/analysis/phase3-screens/01-R01-furnished-render.png\` and \`02-R01-blend-50.png\`; run \`npm run compare -- <prefix>\` for side-by-side and blend images and \`python3 -I tools/edge-overlay.py\` for an edge overlay.

## Correction to Phase 2 (C-1)
The mantel-projection assumption was changed from 0.30 m to **0.50 m** (range 0.25-0.56 m). Reason: with 0.30 m the fireplace began at z 1.63 m, which overlaps the mirror sideboard seen in the same photograph (the sideboard's near end and the mantel end share a depth in R01, around z 1.97 m). Effect: the fireplace mass starts at z 1.97 m instead of 1.63 m and is 0.50 m deep instead of 0.30 m; mantel height 1.35 m (was 1.33 m). Nothing else in the architecture moved: 23 of 26 elements are bit-identical to Phase 2 (\`app/tools/phase2-arch-hash.json\`, checked by the test suite).

## Object table
Columns: ID · position (x, y, z) · yaw · support · position / orientation / size confidence · cover (R01 fit).
`;
  for (const g of groups) {
    md += `\n### ${g}\n| ID | x | y | z | yaw° | Support | Pos | Ori | Size | Cover | Anchors / notes |\n|---|---|---|---|---|---|---|---|---|---|---|\n`;
    for (const o of man.filter((x) => x.group === g)) {
      const f = fitOf[o.id], c = o.confidence;
      md += `| \`${o.id}\`${o.layer === 'SC41' ? ' *(SC41)*' : ''} | ${f2(o.position[0])} | ${f2(o.position[1])} | ${f2(o.position[2])} | ${o.yawDegrees.toFixed(0)} | ${esc(o.support)} | ${c.position === 'VERIFIED' ? '✔' : '◇'} | ${c.orientation === 'VERIFIED' ? '✔' : '◇'} | ${c.dims[0]} | ${f ? (f.cover * 100).toFixed(0) + ' %' : '-'} | ${esc([...(o.anchors || []), o.relations, o.notes].filter(Boolean).join(' · '))} |\n`;
    }
  }
  md += `
## Relationships between objects (as placed)
${man.filter((o) => o.relations).map((o) => `- **${o.name}** (\`${o.id}\`): ${o.relations}.`).join('\n')}
- Supported objects (position follows their support): ${man.filter((o) => /^(domed_lamp|tf_|lantern|aloe|photo|figurine|writing|cushion|shawl|pot_|kettle|lid_|canister|carton|tin_|jar|mug|nightstand_|books_|skimmer|ladle)/.test(o.id)).map((o) => `\`${o.id}\` → ${esc(o.support)}`).join('; ')}.

## Collision boundaries (prepared for later interactions)
${count(man, (o) => o.colliders.length)} objects carry collision boxes (${man.reduce((n, o) => n + o.colliders.length, 0)} boxes; local box + world AABB in the JSON export). They are axis-aligned in world space (a rotated piece gets its conservative bounding box), so the armchair and chairs block slightly more than their silhouettes. Seats, doors and the dress form can later swap these for oriented boxes without changing ids. Inspector: *Furniture collision (walk)* and *Show furniture collision boxes*.
`;
  writeFileSync(resolve(DOCS, 'OBJECT_PLACEMENT_MANIFEST.md'), md);
}

// ================================================================ MATERIAL_REFERENCE_GUIDE.md
{
  const tex = perf?.textures ?? [];
  let md = `# Material Reference Guide — Phase 3

Generated tables + hand-written method (\`app/tools/gen-docs.mjs\`). Colours: \`app/src/interior/sampled-colours.json\` (\`python3 -I tools/sample-colours.py\`). Textures: \`app/public/textures/\` (\`python3 -I tools/make-textures.py\`). Material definitions: \`app/src/interior/material-defs.js\`.

## Principles
1. **Colour comes from the references, not from taste.** Every colour that has an evidence tag **SAMPLED** is the median (or a stated percentile) of a pixel box in R01, R02 or R05. They are *photographed* colours: they include the set lighting and the photograph's grading, so they are the best evidence of the colour **relationships**, not of absolute albedo. Phase 4 calibrates exposure against the film lighting.
2. **Nothing is invented where the reference is silent.** A pattern that no image resolves (wallpaper motifs, rug motifs, floral fabrics) is **drawn** by me from the sampled tones and marked PROVISIONAL. Only the repeat size of the main wallpaper is measured.
3. **No artificial wear.** The reference shows an old, worn, lived-in apartment; I only added the subtle variation visible in it (board-to-board tone, grain). No dirt maps, scratches or grunge.
4. **Physically based, lighting-neutral.** Albedo + roughness + metalness (MeshStandardMaterial). No baked light, no emissive glow except a faint lift on lamp shades so they read as translucent. Wood roughness 0.55-0.62 (satin, not glossy), fabrics 0.9-0.95, glazed ceramic 0.22, brass 0.34/metal 0.9, black iron 0.55/metal 0.55, mirror 0.12/metal 0.75. A soft neutral environment map (RoomEnvironment, intensity 0.45) lets metal and glass show reflections.

## Material table
| Key | Use | Texture (tiles per metre) | Colour / evidence | Roughness / metal |
|---|---|---|---|---|
${Object.entries(MATERIAL_DEFS).map(([k, d]) => `| \`${k}\` | ${esc(d.use)} | ${d.map ? `${d.map} (${d.uvUnit ? 'whole object' : d.tpm})` : '-'} | ${d.color ? d.color + ' · ' : ''}${esc(d.evidence)} | ${d.roughness} / ${d.metalness}${d.transparent ? ` · opacity ${d.opacity ?? 1}` : ''} |`).join('\n')}

### Architecture finishes (finish layer; geometry untouched)
| Surface | Finish | Evidence |
|---|---|---|
${Object.entries(ARCH_FINISH).map(([k, d]) => `| ${k} | ${d.map ? d.map : d.mat ? d.mat : d.color} ${d.tile ? `(${d.tile.join(' x ')} m per tile)` : ''} | ${esc(d.evidence || 'dark stained wood, as the doors and skirting in R01')} |`).join('\n')}

## Sampled colour evidence
| Name | Image | Pixel box | What | Median | 15th pct | 85th pct |
|---|---|---|---|---|---|---|
${Object.entries(colours).map(([k, c]) => `| ${k} | ${c.image} | ${c.box.join(', ')} | ${esc(c.what)} | \`${c.median}\` | \`${c.p15}\` | \`${c.p85}\` |`).join('\n')}

Two boxes are known to be poor (the R05 wall and the R05 curtain were boxed on the wrong part of that 1050 px frame); their values are **not used**.

## Wallpaper (the one pattern with a measured repeat)
- **Measured:** the pocket-door piers are frontal in R01. A 2-D autocorrelation on both piers gives a half-drop lattice: vertical repeat 88-89 px, half-drop offset (31, 44) px, at 241.9 px/m → **0.256 m wide × 0.365 m high**. Both piers agree.
- **Colours:** ground = 85th percentile and motif = 15th percentile of the lit left pier.
- **Motif shape: drawn, not traced.** I tried to recover the real damask by averaging the ~15 repeats visible on the right pier (lattice averaging). The result smeared: the lattice is known only to about ±1 px and the error accumulates over the repeats. That attempt was **abandoned** (and its script deleted); the texture is a clean drawn medallion on the measured lattice. At VR viewing distance it reads as a patterned damask paper; the individual scrolls of the real paper are not reproduced. A flat-on film frame of the paper would allow a faithful trace.
- **Back-room paper:** colour sampled (cream); small diamond lattice, repeat 0.16 m: **provisional**.
- Cooper Hewitt (named by the set decorator, Anna Pinnock) is the lawful lead for the original pattern (see \`MISSING_REFERENCES_AND_DECISIONS.md\`, M7).

## Wood
Three tints from one procedural grain (periodic, FFT-filtered noise, no seams): **woodDark** (doors, casing, bed frames, armchair frame: median of the leaf and headboard boxes), **woodMid** (cabinets, side tables), **woodOak** (pressed-back chairs and dining table). Grain follows each member's long axis (per-triangle metric UVs). Floor: dark red-brown boards 0.15 m wide (PROVISIONAL width) running along z, with butt joints and board-to-board tone variation.

## Fabrics
Velvet (armchair: sampled grey-green), cane (side panels: provisional weave in a typical cane colour), linen (spreads, dress form: sampled), floral coverlet (sampled pink, drawn florals), blue-grey outer drapes (sampled), blue-and-gold inner drapes (provisional pattern, tones from R01/R05), shawl (gold, blue, rose: tones from R01), tapestry cushion (provisional). All fabrics have roughness ≥ 0.85 so they never shine.

## Rugs
Pink floral rug: extent **measured** from the visible corner and edges (2.10 × 2.05 m); field and border tones sampled; motifs drawn. Oriental rug: only the far edge and border are visible; size and design are **placeholders** (rust field, navy and cream borders from the sampled mix).

## Metal, glass, ceramic
Black iron (range, fireplace, columns, brackets), brass (taps, finials, rod, knobs), glazed cream ceramic (sink and splashback: colour from the splashback's 85th percentile), glass (translucent, no refraction), peach tulip sconce shades and the pale-green domed lamp (translucent with a faint emissive lift), fringed fabric shades (translucent). The mirror is a plain reflective panel; nothing is invented about what it reflects.

## Lighting-compatibility check (not the lighting system)
The inspector has a **neutral inspection light** and a **warm fire test** (one orange point light at the fireplace, everything else dimmed). The test exists only to check that materials stay believable under warm light; it is not the film lighting. Screens: \`reference/analysis/phase3-screens/05-fire-test-fireplace-side.png\`, \`06-fire-test-spawn-view.png\`.
Observed: wood stays satin (no plastic highlights), wallpaper and fabrics warm evenly, brass and the lamp shades read as metal and glass, the black iron keeps its shape. Known weaknesses: the mirror reads as a dark panel in a dim room; the cream ceramic and wallpaper may need a slightly lower albedo under the film's exposure (Phase 4).

## Texture inventory
${tex.length ? `| File | Size |\n|---|---|\n${tex.map((t) => `| ${t.src} | ${t.w} x ${t.h} |`).join('\n')}\n\nTotal GPU estimate with mipmaps: **${perf.textureMB.toFixed(1)} MB** (uncompressed RGBA8). Quest 2 standalone would use KTX2/ASTC (about a quarter of that).` : '(run npm run test:interior to list)'}

## Known limitations
Pattern motifs are drawn, not traced. Colours are as-photographed (set lighting included). No normal or roughness maps yet (roughness is per material); wood grain relief and fabric weave are Phase 4 polish if the lighting needs them. Ceiling colour is a placeholder (never seen).
`;
  writeFileSync(resolve(DOCS, 'MATERIAL_REFERENCE_GUIDE.md'), md);
}
console.log('wrote FURNITURE_INVENTORY.md, OBJECT_PLACEMENT_MANIFEST.md, MATERIAL_REFERENCE_GUIDE.md');
