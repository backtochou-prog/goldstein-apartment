// Headless browser test of the built inspector: loads, renders, collision, reference camera, stats.
// Requires `npm run build` first. Uses the machine's Playwright Chromium (software WebGL).
// Writes screenshots to ../reference/analysis/phase2-screens/ (private, git-ignored images).
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

// Playwright is not a project dependency (it is large and the browser is machine-specific).
// Resolution order: $PLAYWRIGHT_MODULE, this project, then other local installs on this machine.
const candidates = [process.env.PLAYWRIGHT_MODULE, import.meta.url, '/root/jumanji-vr/package.json', '/root/work/repertoire-portraits/package.json'].filter(Boolean);
let chromium;
for (const c of candidates) {
  try { ({ chromium } = createRequire(c.startsWith('file:') || c.endsWith('.json') ? c : c + '/')('playwright')); break; } catch { /* next */ }
}
if (!chromium) { console.error('Playwright not found. Set PLAYWRIGHT_MODULE to a folder whose node_modules has playwright.'); process.exit(2); }

const OUT = resolve(import.meta.dirname, '../../reference/analysis/phase2-screens');
mkdirSync(OUT, { recursive: true });
let fail = 0;
const ok = (c, m) => { console.log(`${c ? 'PASS' : 'FAIL'} ${m}`); if (!c) fail = 1; };

const server = spawn('npx', ['vite', 'preview', '--port', '5175', '--strictPort'], { cwd: resolve(import.meta.dirname, '..'), stdio: ['ignore', 'pipe', 'pipe'], detached: true });
let serverLog = '';
server.stdout.on('data', (d) => { serverLog += d; }); server.stderr.on('data', (d) => { serverLog += d; });
for (let i = 0; ; i++) { // poll until the preview server answers
  try { if ((await fetch('http://localhost:5175/')).ok) break; } catch { /* not yet */ }
  if (i > 60) { console.error(serverLog); throw new Error('preview server did not start'); }
  await new Promise((r) => setTimeout(r, 500));
}

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage({ viewport: { width: 1480, height: 860 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('http://localhost:5175/', { waitUntil: 'load' });
  await page.waitForFunction(() => window.__apt?.ready, null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  const shot = async (name) => { await page.waitForTimeout(700); await page.screenshot({ path: `${OUT}/${name}.png`, timeout: 180000 }); };

  await shot('01-orbit-overview');
  const info = await page.evaluate(() => window.__apt.info());
  console.log('render stats (orbit overview):', JSON.stringify(info));
  ok(info.triangles > 0 && info.triangles < 120000, `triangles ${info.triangles} (furnished scene budget < 120k)`);
  ok(info.calls < 200, `draw calls ${info.calls} (< 200 incl. architecture meshes and edge/helper objects)`);

  await page.evaluate(() => { window.__apt.toggle('t-evid', true); window.__apt.toggle('t-ceil', false); });
  await shot('02-orbit-evidence-colours');
  await page.evaluate(() => { window.__apt.toggle('t-evid', false); window.__apt.toggle('t-ceil', true); window.__apt.setMode('plan'); });
  await shot('03-plan');

  // reference camera R01 with overlay, then line mode
  await page.evaluate(() => window.__apt.gotoRef('R01'));
  await page.waitForFunction(() => document.getElementById('overlay').complete && document.getElementById('overlay').naturalWidth > 0, null, { timeout: 10000 });
  const imgOk = await page.evaluate(() => document.getElementById('overlay').naturalWidth);
  ok(imgOk === 1800, `R01 reference image served privately at /ref/ (width ${imgOk})`);
  await page.evaluate(() => { document.getElementById('refop').value = 0.55; document.getElementById('refop').dispatchEvent(new Event('input')); });
  await shot('04-ref-R01-overlay');
  await page.evaluate(() => { window.__apt.toggle('t-dims', false); window.__apt.toggle('t-foot', false); window.__apt.toggle('edges', true); });
  await page.evaluate(() => { document.getElementById('refop').value = 0.8; document.getElementById('refop').dispatchEvent(new Event('input')); });
  await shot('05-ref-R01-lines');
  await page.screenshot({ path: `${OUT}/05b-ref-R01-lines-hires.png`, clip: { x: 280, y: 0, width: 1200, height: 860 }, timeout: 180000 });
  await page.evaluate(() => { window.__apt.toggle('edges', false); window.__apt.toggle('t-dims', true); window.__apt.toggle('t-foot', true); });
  await page.evaluate(() => window.__apt.gotoRef('R04'));
  await shot('06-ref-R04-approx');

  // human-scale walk views
  await page.evaluate(() => window.__apt.place(2.2, 4.6, 0));
  await shot('07-walk-spawn-to-doorway');
  await page.evaluate(() => window.__apt.place(2.6, 2.2, Math.PI / 2));
  await shot('08-walk-facing-fireplace-wall');
  await page.evaluate(() => window.__apt.place(2.2, -0.6, 0));
  await shot('09-walk-back-room-windows');
  await page.evaluate(() => window.__apt.place(1.8, -3.2, Math.PI));
  await shot('10-walk-back-room-looking-out');

  // collision walks (straight lines; return the stop point)
  const sp = await page.evaluate(() => window.__apt.spec);
  const W = sp.rooms[0].x[1], back = sp.rooms[1].z[0], depth = sp.rooms[0].z[1];
  const run = (x, z, dx, dz) => page.evaluate(([x, z, dx, dz]) => window.__apt.walkLine(x, z, dx, dz, 4000), [x, z, dx, dz]);
  let p = await run(2.2, 4.6, 0, -20);
  ok(Math.abs(p.z - (back + 0.2)) < 0.02, `walk through the doorway (R01 doors) stops at back window wall: z ${p.z.toFixed(2)} (expect ${(back + 0.2).toFixed(2)})`);
  p = await run(2.2, 3.0, 20, 0);
  ok(Math.abs(p.x - (W - 0.2)) < 0.02, `walk right stops at right wall: x ${p.x.toFixed(2)} (expect ${(W - 0.2).toFixed(2)})`);
  p = await run(2.2, (sp.fireplace.zFrom + sp.fireplace.zTo) / 2, -20, 0);
  ok(Math.abs(p.x - (sp.fireplace.depth + 0.2)) < 0.02, `walk left across the fireplace stops at its front: x ${p.x.toFixed(2)} (expect ${(sp.fireplace.depth + 0.2).toFixed(2)})`);
  p = await run(2.2, 4.0, 0, 20);
  ok(Math.abs(p.z - (depth - 0.21)) < 0.02, `walk toward the unknown fourth wall stops at the evidence limit: z ${p.z.toFixed(2)}`);
  p = await run(sp.fireplace.depth + 0.4, 4.0, 0, -20); // clears the fireplace front, meets the left pier
  ok(Math.abs(p.z - 0.2) < 0.03, `walk past the fireplace into the left pier stops at the pocket-door wall: z ${p.z.toFixed(2)} (expect 0.20)`);
  await page.evaluate(() => window.__apt.setDoors('closed'));
  p = await run(2.2, 4.6, 0, -20);
  ok(p.z > 0.1 && p.z < 0.4, `closed pocket doors block the doorway: z ${p.z.toFixed(2)}`);
  await page.evaluate(() => window.__apt.setDoors('open'));
  const cx0 = sp.doorway.clearX[0];
  p = await run(cx0 + 0.21, 3.0, 0, -20); // body radius 0.2 m from the left jamb
  ok(p.z < -3, `fully open doors: a body brushing the left jamb (x ${(cx0 + 0.21).toFixed(2)}) walks through to z ${p.z.toFixed(2)}`);
  await page.evaluate(() => window.__apt.setDoors('r01'));

  // VR entry button present (no headset in this environment)
  const vr = await page.evaluate(() => document.querySelector('#vrslot button, #vrslot a')?.textContent || '');
  ok(vr.length > 0, `VR button present: "${vr}" (WebXR not available headless; headset not tested)`);

  // GLB export of the architecture (for Blender / Godot)
  const bytes = await page.evaluate(async () => Array.from(await window.__apt.exportGLB()));
  const { writeFileSync } = await import('node:fs');
  const glbPath = resolve(import.meta.dirname, '../exports/goldstein-architecture-phase2.glb');
  mkdirSync(resolve(glbPath, '..'), { recursive: true }); writeFileSync(glbPath, Buffer.from(bytes));
  ok(bytes.length > 1000 && String.fromCharCode(...bytes.slice(0, 4)) === 'glTF', `architecture GLB exported (${bytes.length} bytes) to exports/`);

  ok(errors.length === 0, `no console errors${errors.length ? ': ' + errors.join(' | ') : ''}`);
} finally {
  await browser.close();
  try { process.kill(-server.pid); } catch { /* already gone */ } // whole group: npx and its vite child
}
console.log(fail ? '\nBROWSER TEST FAILED' : '\nBROWSER TEST PASSED');
console.log(`screenshots: ${OUT}`);
process.exit(fail);
