// Shared helper: starts a Vite dev server (no rebuild needed) and opens the inspector in headless
// Chromium (software WebGL). Playwright is borrowed from other local installs (see browser-test.mjs).
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const candidates = [process.env.PLAYWRIGHT_MODULE, import.meta.url, '/root/jumanji-vr/package.json', '/root/work/repertoire-portraits/package.json'].filter(Boolean);
export function loadPlaywright() {
  for (const c of candidates) {
    try { return createRequire(c.startsWith('file:') || c.endsWith('.json') ? c : c + '/')('playwright'); } catch { /* next */ }
  }
  throw new Error('Playwright not found. Set PLAYWRIGHT_MODULE to a folder whose node_modules has playwright.');
}

export async function withPage(fn, { port = 5176, viewport = { width: 1480, height: 860 }, mode = 'dev' } = {}) {
  const { chromium } = loadPlaywright();
  const cwd = resolve(import.meta.dirname, '../..');
  const args = mode === 'preview' ? ['vite', 'preview', '--port', String(port), '--strictPort'] : ['vite', '--port', String(port), '--strictPort'];
  const server = spawn('npx', args, { cwd, stdio: 'ignore', detached: true });
  const url = `http://localhost:${port}/`;
  try {
    for (let i = 0; ; i++) {
      try { if ((await fetch(url)).ok) break; } catch { /* wait */ }
      if (i > 80) throw new Error('dev server did not start');
      await new Promise((r) => setTimeout(r, 500));
    }
    const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
    try {
      const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
      const errors = [];
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
      page.on('pageerror', (e) => errors.push(String(e)));
      await page.goto(url, { waitUntil: 'load' });
      await page.waitForFunction(() => window.__apt?.ready, null, { timeout: 60000 });
      await page.waitForTimeout(1200);
      return await fn(page, errors);
    } finally { await browser.close(); }
  } finally { try { process.kill(-server.pid); } catch { /* gone */ } }
}
