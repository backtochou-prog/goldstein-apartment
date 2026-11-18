// Photographic-layer test: fidelity to the photograph from its own viewpoint, coverage elsewhere, screenshots.
// Requires `npm run build`. Metrics are computed with Python (Pillow + NumPy) on screenshots of the canvas.
import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { withPage } from './lib/session.mjs';

const OUT = resolve(import.meta.dirname, '../../reference/analysis/phase4photo-screens');
mkdirSync(OUT, { recursive: true });
let fail = 0;
const ok = (c, m) => { console.log(`${c ? 'PASS' : 'FAIL'} ${m}`); if (!c) fail = 1; };
const PHOTO = '/root/goldstein-apartment/reference/stills/SET/F00001_WW-FACTFILE_hp_apt1.png';
const metric = (img) => {
  const py = `
import sys, json
import numpy as np
from PIL import Image
ph = np.asarray(Image.open(sys.argv[1]).convert('RGB').resize((1200, 832), Image.LANCZOS), dtype=np.float64)
r = np.asarray(Image.open(sys.argv[2]).convert('RGB'), dtype=np.float64)
d = np.abs(ph - r).mean(axis=2)
print(json.dumps({'mae': float(d.mean()), 'within16': float((d <= 16).mean()), 'within32': float((d <= 32).mean())}))`;
  return JSON.parse(spawnSync('python3', ['-I', '-c', py, PHOTO, img], { encoding: 'utf8' }).stdout);
};
const cover = (img) => {
  const py = `
import sys, json
import numpy as np
from PIL import Image
a = np.asarray(Image.open(sys.argv[1]).convert('RGB'), dtype=np.int32)
g = ((a[..., 1] > 130) & (a[..., 0] < 90) & (a[..., 2] < 120)).sum(); r = ((a[..., 0] > 150) & (a[..., 1] < 110) & (a[..., 2] < 110) & (a[..., 0] - a[..., 1] > 80)).sum()
print(json.dumps({'photo': float(g / max(1, g + r)), 'fill': float(r / max(1, g + r)), 'pixels': int(g + r)}))`;
  return JSON.parse(spawnSync('python3', ['-I', '-c', py, img], { encoding: 'utf8' }).stdout);
};

const results = {};
await withPage(async (page, errors) => {
  const ev = (f, a) => page.evaluate(f, a);
  const shot = async (name, clip = { x: 280, y: 0, width: 1200, height: 860 }) => { await page.waitForTimeout(1200); const p = `${OUT}/${name}.png`; await page.screenshot({ path: p, clip, timeout: 240000 }); return p; };
  const R01 = { x: 280, y: 14, width: 1200, height: 832 };
  const info = await ev(() => window.__apt.photo());
  ok(!!info && info.source === 'R01', `photographic layer active, source ${info?.source}, texture ${info?.textureMB.toFixed(1)} MB + depth map ${info?.depthMB.toFixed(1)} MB`);
  await ev(() => { window.__apt.toggle('t-dims', false); window.__apt.toggle('t-limit', false); window.__apt.gotoRef('R01'); const e = document.getElementById('refop'); e.value = 0; e.dispatchEvent(new Event('input')); });
  await page.waitForFunction(() => document.getElementById('overlay').complete);

  // 1. fidelity from the photograph's own viewpoint
  const a = await shot('01-R01-photographic', R01); results.photographic = metric(a);
  await ev(() => window.__apt.setPhoto('procedural')); const b = await shot('02-R01-procedural-phase3', R01); results.procedural = metric(b);
  await ev(() => window.__apt.setPhoto('coverage')); const c = await shot('03-R01-coverage-map', R01); results.coverageR01 = cover(c);
  await ev(() => window.__apt.setPhoto('photo'));
  console.log('R01 viewpoint vs the photograph:', JSON.stringify(results));
  ok(results.photographic.mae < 10, `photographic render matches the photograph from its viewpoint: mean abs error ${results.photographic.mae.toFixed(1)} / 255`);
  ok(results.photographic.mae < results.procedural.mae / 2.5, `...and is ${(results.procedural.mae / results.photographic.mae).toFixed(1)}x closer than the procedural Phase 3 render (${results.procedural.mae.toFixed(1)})`);
  ok(results.coverageR01.photo > 0.9, `${(results.coverageR01.photo * 100).toFixed(0)} % of the surfaces visible from R01 are photographic`);

  // 2. away from the capture viewpoint
  const views = [['10-walk-spawn', 2.2, 4.9, 0], ['11-walk-left-1m', 1.5, 4.3, 0.3], ['12-walk-right-1m', 3.2, 4.3, -0.3], ['13-walk-closer-doorway', 2.3, 2.9, 0], ['14-walk-back-room', 2.0, -0.8, 0.1]];
  for (const [n, x, z, yaw] of views) {
    await ev(([x, z, y]) => window.__apt.place(x, z, y), [x, z, yaw]); await shot(n);
    await ev(() => window.__apt.setPhoto('coverage')); const cv = await shot(n.replace(/^1/, '2') + '-coverage'); results[n] = cover(cv);
    await ev(() => window.__apt.setPhoto('photo'));
    console.log(`  ${n}: photographic ${(results[n].photo * 100).toFixed(0)} % of coloured surface pixels`);
  }
  ok(results['10-walk-spawn'].photo > 0.45, `from the entry point ${(results['10-walk-spawn'].photo * 100).toFixed(0)} % of the visible surface is photographic`);
  ok(errors.length === 0, `no console errors${errors.length ? ': ' + errors.join(' | ') : ''}`);
  const perf = await ev(() => window.__apt.perf());
  results.perf = { triangles: perf.triangles, meshes: perf.meshes, materials: perf.materials, textureMB: perf.textureMB, photo: info };
  ok(perf.meshes < 120, `draw calls ${perf.meshes} (the photographic layer adds none: it is a shader term)`);
}, { mode: 'preview', port: 5179 });
writeFileSync(resolve(import.meta.dirname, '../../reference/analysis/photo-layer-results.json'), JSON.stringify(results, null, 1));
console.log(fail ? '\nPHOTO TEST FAILED' : '\nPHOTO TEST PASSED');
console.log(`screenshots: ${OUT}`);
process.exit(fail);
