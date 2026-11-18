// Phase 3 test: interior objects, finishes, picking, furniture collision, performance, screenshots.
// Requires `npm run build` first (runs against `vite preview`). Software WebGL: frame rates are meaningless,
// triangle / draw-call / material / texture numbers are exact.
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { withPage } from './lib/session.mjs';

const OUT = resolve(import.meta.dirname, '../../reference/analysis/phase3-screens');
mkdirSync(OUT, { recursive: true });
let fail = 0;
const ok = (c, m) => { console.log(`${c ? 'PASS' : 'FAIL'} ${m}`); if (!c) fail = 1; };
const base = JSON.parse(readFileSync(resolve(import.meta.dirname, 'phase2-arch-hash.json'), 'utf8'));
const p3Path = resolve(import.meta.dirname, 'phase3-arch-hash.json');

await withPage(async (page, errors) => {
  const shot = async (name, clip = { x: 280, y: 0, width: 1200, height: 860 }) => { await page.waitForTimeout(800); await page.screenshot({ path: `${OUT}/${name}.png`, clip, timeout: 180000 }); };
  const ev = (f, a) => page.evaluate(f, a);
  await ev(() => { window.__apt.toggle('t-dims', false); window.__apt.toggle('t-limit', false); });

  // ---- 1. the approved architecture did not move (vertex fingerprints per element)
  const h = await ev(() => { window.__apt.setDoors('r01'); return window.__apt.archHash(); });
  const changed = Object.keys(base).filter((k) => base[k] !== h[k]);
  const expectedChanged = ['fireplace', 'mantelShelf', 'firebox'];
  ok(Object.keys(h).length === Object.keys(base).length, `architecture has the same ${Object.keys(base).length} elements as Phase 2`);
  ok(changed.every((k) => expectedChanged.includes(k)) && changed.length > 0, `only the documented correction C-1 changed (${changed.join(', ')}); ${Object.keys(base).length - changed.length} elements are bit-identical to Phase 2`);
  if (!existsSync(p3Path)) { writeFileSync(p3Path, JSON.stringify(h, null, 1)); console.log('note  wrote phase3-arch-hash.json (first run)'); }
  const p3 = JSON.parse(readFileSync(p3Path, 'utf8'));
  ok(Object.keys(p3).every((k) => p3[k] === h[k]), 'architecture matches the recorded Phase 3 fingerprint');

  // ---- 2. interior present and honest about layers
  const objs = await ev(() => window.__apt.objects());
  ok(objs.length === 75, `${objs.length} manifest objects built`);
  const layers = await ev(() => ({ r01: window.__apt.interior.layers.R01.visible, sc41: window.__apt.interior.layers.SC41.visible }));
  ok(layers.r01 && !layers.sc41, 'R01 dressing visible, script props (SC41) hidden by default');
  ok(await ev(() => !document.getElementById('t-foot').checked), 'Phase 2 footprint outlines are off (superseded by the objects)');

  // ---- 3. performance (exact counts)
  const perf = await ev(() => window.__apt.perf());
  const st = await ev(() => ({ build: window.__apt.interior.stats.buildMs, tex: window.__apt.interior.stats.texturesMs, tris: window.__apt.interior.stats.tris }));
  console.log('perf (default scene):', JSON.stringify({ triangles: perf.triangles, meshes: perf.meshes, materials: perf.materials, textureMB: +perf.textureMB.toFixed(1), textures: perf.textures.length, geometries: perf.renderer.geometries, textureObjects: perf.renderer.textures }), 'interior build ms', st.build.toFixed(0), 'texture load ms', st.tex.toFixed(0));
  ok(perf.triangles < 120000, `triangles ${perf.triangles} < 120k (Quest 2 standalone budget 300k; PCVR is far looser)`);
  ok(perf.meshes < 110, `draw calls (meshes) ${perf.meshes} < 110 (furniture is merged per material and layer)`);
  ok(perf.textureMB < 64, `texture memory ${perf.textureMB.toFixed(1)} MB < 64 MB`);
  const inter = await ev(() => window.__apt.interior.meshes.filter((m) => m.parent.visible).length);
  ok(inter <= 36, `interior draw calls ${inter} <= 36`);
  writeFileSync(resolve(import.meta.dirname, '../../reference/analysis/phase3-perf.json'), JSON.stringify({ ...perf, interiorBuildMs: st.build, textureLoadMs: st.tex, interiorTriangles: st.tris, interiorDraws: inter }, null, 1));

  // ---- 4. R01 reference camera: furnished render for comparison
  await ev(() => { window.__apt.gotoRef('R01'); const e = document.getElementById('refop'); e.value = 0; e.dispatchEvent(new Event('input')); });
  await page.waitForFunction(() => document.getElementById('overlay').complete && document.getElementById('overlay').naturalWidth > 0);
  await shot('01-R01-furnished-render', { x: 280, y: 14, width: 1200, height: 832 });
  await ev(() => { const e = document.getElementById('refop'); e.value = 0.5; e.dispatchEvent(new Event('input')); });
  await shot('02-R01-blend-50', { x: 280, y: 14, width: 1200, height: 832 });

  // ---- 5. picking through the real click handler (R01 camera -> screen)
  await ev(() => { const e = document.getElementById('refop'); e.value = 0; e.dispatchEvent(new Event('input')); });
  const at = (px, py) => [280 + px * 1200 / 1800, 14 + py * 832 / 1248];
  const picks = [['armchair', 'Caned', 590, 1040], ['dining_table', 'Dining table', 818, 692], ['sink_unit', 'Sink cabinet', 1650, 1000], ['domed_lamp', 'Domed', 190, 700], ['bed_left', 'Twin bed', 760, 590]];
  for (const [id, text, px, py] of picks) {
    const [sx, sy] = at(px, py); await page.mouse.click(sx, sy); await page.waitForTimeout(250);
    const info = await ev(() => document.getElementById('info').innerText);
    ok(info.includes(text) || info.includes(id), `click on ${id} at R01 (${px}, ${py}) -> "${info.split('\n')[0].slice(0, 60)}"`);
  }
  const info = await ev(() => document.getElementById('info').innerText);
  ok(/existence/.test(info) && /position/.test(info), 'furniture info panel shows confidence fields');

  // ---- 6. furniture collision (walk hook; furniture on)
  const run = (x, z, dx, dz) => ev(([x, z, dx, dz]) => window.__apt.walkLine(x, z, dx, dz, 4000, true), [x, z, dx, dz]);
  const sp = await ev(() => window.__apt.spec);
  const cn = await ev(() => window.__apt.interior.byId.chair_near.pos);
  let p = await run(2.6, 4.0, 0, -20);
  ok(p.z > 2.1 && p.z < 2.4, `walking toward the dining chair stops in front of it: z ${p.z.toFixed(2)} (chair at z ${cn.z.toFixed(2)})`);
  p = await run(3.0, 2.2, 20, 0);
  ok(p.x < 3.9 && p.x > 3.6, `walking toward the sink unit stops at its front: x ${p.x.toFixed(2)}`);
  p = await run(1.2, 1.2, -20, 0);
  ok(p.x > 0.6 && p.x < 0.9, `walking toward the mirror cabinet stops at its front: x ${p.x.toFixed(2)}`);
  p = await run(2.2, 4.6, 0, -20);
  ok(p.z > 2.8, `a straight walk from the spawn point is stopped by the armchair collider: z ${p.z.toFixed(2)}`);
  const nCol = await ev(() => window.__apt.interior.colliders.length);
  const nColR01 = await ev(() => window.__apt.interior.colliders.filter((c) => c.layer === 'R01').length);
  ok(nCol > nColR01 && nColR01 >= 18, `furniture colliders: ${nColR01} on the R01 layer, ${nCol - nColR01} on the script layer (each id exposed for later interactions)`);
  await ev(() => window.__apt.toggle('t-sc41', true));
  ok(await ev(() => window.__apt.interior.layers.SC41.visible), 'script layer toggles on');
  await shot('03-script-layer-on-spawn-view', undefined);
  await ev(() => window.__apt.toggle('t-sc41', false));

  // ---- 7. finishes are reversible; the greybox is still there underneath
  await ev(() => { window.__apt.toggle('t-furn', false); window.__apt.toggle('t-fin', false); window.__apt.setMode('orbit'); });
  await shot('04-greybox-restored-orbit');
  ok(await ev(() => { let n = 0; window.__apt.interior.root.visible && n++; return n === 0; }), 'furniture hidden');
  await ev(() => { window.__apt.toggle('t-furn', true); window.__apt.toggle('t-fin', true); });

  // ---- 8. lighting test mode
  const l0 = await ev(() => window.__apt.lightState());
  await ev(() => { document.getElementById('lightmode').value = 'fire'; document.getElementById('lightmode').dispatchEvent(new Event('change')); });
  const l1 = await ev(() => window.__apt.lightState());
  ok(l1.fire > 0 && l0.fire === 0 && l1.hemi < l0.hemi, `warm fire test mode: fire light ${l0.fire} -> ${l1.fire}, hemisphere ${l0.hemi} -> ${l1.hemi}`);
  await ev(() => window.__apt.place(1.7, 4.5, 0.62));
  await shot('05-fire-test-fireplace-side');
  await ev(() => window.__apt.place(2.2, 4.9, 0));
  await shot('06-fire-test-spawn-view');
  await ev(() => { document.getElementById('lightmode').value = 'neutral'; document.getElementById('lightmode').dispatchEvent(new Event('change')); });

  // ---- 9. multi-viewpoint walk-through screenshots (neutral light)
  const views = [
    ['10-walk-spawn-to-pocket-doors', 2.2, 4.9, 0], ['11-walk-fireplace-wall', 1.9, 4.5, 0.62], ['12-walk-trefoil-armchair-close', 1.3, 3.9, 0.75],
    ['13-walk-dining-table', 2.4, 3.9, -0.1], ['14-walk-kitchen-run', 3.3, 3.9, -0.62], ['15-walk-sink-and-shelf', 2.6, 3.2, -1.15],
    ['16-walk-back-room-windows', 2.2, -0.7, 0.05], ['17-walk-back-room-beds', 2.0, -1.1, 0.7], ['18-walk-back-looking-to-main-room', 1.8, -2.5, Math.PI],
  ];
  for (const [n, x, z, yaw] of views) { await ev(([x, z, y]) => window.__apt.place(x, z, y), [x, z, yaw]); await shot(n); }
  await ev(() => window.__apt.toggle('t-conf', true));
  await ev(() => window.__apt.place(2.2, 4.9, 0)); await shot('19-confidence-colours-spawn-view');
  await ev(() => window.__apt.gotoRef('R01')); await shot('20-confidence-colours-R01', { x: 280, y: 14, width: 1200, height: 832 });
  await ev(() => { window.__apt.toggle('t-conf', false); window.__apt.toggle('t-fcolv', true); window.__apt.setMode('plan'); window.__apt.toggle('t-ceil', false); });
  await shot('21-plan-with-collision-boxes');
  await ev(() => window.__apt.toggle('t-fcolv', false));

  ok(errors.length === 0, `no console errors${errors.length ? ': ' + errors.join(' | ') : ''}`);
}, { mode: 'preview', port: 5177 });
console.log(fail ? '\nINTERIOR TEST FAILED' : '\nINTERIOR TEST PASSED');
console.log(`screenshots: ${OUT}`);
process.exit(fail);
