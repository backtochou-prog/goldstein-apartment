// Emulated WebXR test (IWER, Meta Quest 2 profile). Verifies: entering VR works, the rig spawns at the
// spec spawn point, the inspection thumbstick slide moves the user, and collision stops them at walls.
// This is an EMULATOR test. It does not replace testing on a physical headset.
import { spawn } from 'node:child_process';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const candidates = [process.env.PLAYWRIGHT_MODULE, import.meta.url, '/root/jumanji-vr/package.json'].filter(Boolean);
let chromium;
for (const c of candidates) { try { ({ chromium } = createRequire(c.startsWith('file:') || c.endsWith('.json') ? c : c + '/')('playwright')); break; } catch { /* next */ } }
const IWER = [process.env.IWER_BUILD, resolve(import.meta.dirname, '../node_modules/iwer/build/iwer.min.js'), '/root/jumanji-vr/node_modules/iwer/build/iwer.min.js'].filter(Boolean).find((p) => existsSync(p));
if (!chromium || !IWER) { console.error('Need playwright and the iwer build (set PLAYWRIGHT_MODULE / IWER_BUILD).'); process.exit(2); }
const OUT = resolve(import.meta.dirname, '../../reference/analysis/phase2-screens'); mkdirSync(OUT, { recursive: true });

let fail = 0; const ok = (c, m) => { console.log(`${c ? 'PASS' : 'FAIL'} ${m}`); if (!c) fail = 1; };
const server = spawn('npx', ['vite', 'preview', '--port', '5175', '--strictPort'], { cwd: resolve(import.meta.dirname, '..'), stdio: 'ignore', detached: true });
for (let i = 0; ; i++) { try { if ((await fetch('http://localhost:5175/')).ok) break; } catch { /* wait */ } if (i > 60) throw new Error('no server'); await new Promise((r) => setTimeout(r, 500)); }
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = []; page.on('pageerror', (e) => errors.push(String(e))); page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript({ content: readFileSync(IWER, 'utf8') + `
    ;window.__dev = new IWER.XRDevice(IWER.metaQuest2); window.__dev.installRuntime({ forceInstall: true });
    window.__dev.position.set(0, 1.6, 0);` });
  await page.goto('http://localhost:5175/');
  await page.waitForFunction(() => window.__apt?.ready);
  const label = await page.evaluate(() => document.querySelector('#vrslot button').textContent);
  ok(/ENTER VR/i.test(label), `VR button offers "${label}" under the emulated Quest 2`);
  await page.click('#vrslot button');
  await page.waitForFunction(() => window.__apt.xrState().presenting, null, { timeout: 15000 });
  await page.waitForTimeout(800);
  const sp = await page.evaluate(() => window.__apt.spec.spawn);
  let st = await page.evaluate(() => window.__apt.xrState());
  ok(st.presenting, 'XR session is presenting');
  ok(Math.abs(st.rig.x - sp.x) < 1e-6 && Math.abs(st.rig.z - sp.z) < 1e-6, `rig spawned at (${st.rig.x.toFixed(2)}, ${st.rig.z.toFixed(2)}) = spec spawn`);
  ok(Math.abs(st.head.y - 1.6) < 0.05, `head at ${st.head.y.toFixed(2)} m over the floor (local-floor, emulated 1.6 m)`);
  await page.screenshot({ path: `${OUT}/11-xr-emulated-spawn.png` });
  // furniture collision is ON by default: the armchair box must stop a straight push from the spawn point
  await page.evaluate(() => window.__dev.controllers.left.updateAxes('thumbstick', 0, -1));
  let lastZ = Infinity;
  for (let i = 0; i < 40; i++) { await page.waitForTimeout(1000); const z = (await page.evaluate(() => window.__apt.xrState())).head.z; if (Math.abs(z - lastZ) < 0.002) break; lastZ = z; }
  await page.evaluate(() => window.__dev.controllers.left.updateAxes('thumbstick', 0, 0));
  st = await page.evaluate(() => window.__apt.xrState());
  ok(st.head.z > 2.8 && st.head.z < 3.3, `XR: furniture collision stopped the head at z ${st.head.z.toFixed(2)} in front of the armchair box`);
  // switch furniture collision off to continue with the architecture checks
  await page.evaluate(() => window.__apt.toggle('t-fcoll', false));
  const z0b = (await page.evaluate(() => window.__apt.xrState())).head.z;
  // left thumbstick forward for 1.5 s: should move toward the pocket doors (-z)
  const z0 = z0b;
  await page.evaluate(() => window.__dev.controllers.left.updateAxes('thumbstick', 0, -1));
  // wait for movement, not for a fixed time: software rendering of the furnished scene runs near 1 fps and the step is capped per frame
  for (let i = 0; i < 60; i++) { await page.waitForTimeout(1000); if ((await page.evaluate(() => window.__apt.xrState())).head.z < z0 - 0.6) break; }
  await page.evaluate(() => window.__dev.controllers.left.updateAxes('thumbstick', 0, 0));
  st = await page.evaluate(() => window.__apt.xrState());
  ok(st.head.z < z0 - 0.5, `thumbstick slide moved the user forward ${(z0 - st.head.z).toFixed(2)} m (head z ${st.head.z.toFixed(2)})`);
  // keep pushing long enough to cross the back room; collision must stop the head before the window wall
  // (software rendering here runs at ~10 fps and the step is capped per frame, so push until the
  //  head stops moving instead of for a fixed time)
  await page.evaluate(() => window.__dev.controllers.left.updateAxes('thumbstick', 0, -1));
  let last = Infinity;
  for (let i = 0; i < 120; i++) {
    await page.waitForTimeout(1000);
    const z = (await page.evaluate(() => window.__apt.xrState())).head.z;
    if (Math.abs(z - last) < 0.002) break;
    last = z;
  }
  await page.evaluate(() => window.__dev.controllers.left.updateAxes('thumbstick', 0, 0));
  st = await page.evaluate(() => window.__apt.xrState());
  const backZ = await page.evaluate(() => window.__apt.spec.rooms[1].z[0]);
  ok(st.head.z > backZ + 0.15 && st.head.z < backZ + 0.35, `collision stopped the head at z ${st.head.z.toFixed(2)} in front of the back-room window wall (z ${backZ.toFixed(2)})`);
  await page.screenshot({ path: `${OUT}/12-xr-emulated-back-room.png` });
  // snap turn: right stick flick = one 30° turn about the head, head position unchanged
  const before = await page.evaluate(() => window.__apt.xrState());
  await page.evaluate(() => window.__dev.controllers.right.updateAxes('thumbstick', 1, 0));
  await page.waitForTimeout(600);
  await page.evaluate(() => window.__dev.controllers.right.updateAxes('thumbstick', 0, 0));
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => window.__apt.xrState());
  const turned = (before.rig.yaw - after.rig.yaw) * 180 / Math.PI;
  ok(Math.abs(turned - 30) < 0.5, `snap turn rotated exactly once by ${turned.toFixed(1)}° while held`);
  ok(Math.hypot(after.head.x - before.head.x, after.head.z - before.head.z) < 0.01, 'snap turn pivots about the head (head did not move)');
  ok(errors.length === 0, `no page errors${errors.length ? ': ' + errors.join(' | ') : ''}`);
} finally {
  await browser.close();
  try { process.kill(-server.pid); } catch { /* already gone */ } // whole group: npx and its vite child
}
console.log(fail ? '\nXR EMULATOR TEST FAILED' : '\nXR EMULATOR TEST PASSED');
process.exit(fail);
