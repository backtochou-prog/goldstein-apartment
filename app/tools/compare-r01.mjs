// Renders the furnished apartment through the solved R01 camera and writes, next to the photo:
//   <out>_render.png (1200x832, same framing as the photo), <out>_blend.png, <out>_side.png
// Usage: node tools/compare-r01.mjs <outPrefix> [--fire] [--sc41]
import { spawnSync } from 'node:child_process';
import { withPage } from './lib/session.mjs';
import { resolve } from 'node:path';
const out = process.argv[2] || 'cmp';
const fire = process.argv.includes('--fire'), sc41 = process.argv.includes('--sc41');
await withPage(async (page, errors) => {
  await page.evaluate(({ fire, sc41 }) => {
    window.__apt.toggle('t-dims', false); window.__apt.toggle('t-limit', false);
    if (sc41) window.__apt.toggle('t-sc41', true);
    if (fire) { document.getElementById('lightmode').value = 'fire'; document.getElementById('lightmode').dispatchEvent(new Event('change')); }
    window.__apt.gotoRef('R01'); const el = document.getElementById('refop'); el.value = 0; el.dispatchEvent(new Event('input'));
  }, { fire, sc41 });
  await page.waitForFunction(() => document.getElementById('overlay').complete);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${out}_render.png`, clip: { x: 280, y: 14, width: 1200, height: 832 } });
  if (errors.length) console.log('errors:', errors.slice(0, 4));
}, { viewport: { width: 1480, height: 860 } });
const py = `
from PIL import Image
import sys
out=sys.argv[1]
ph=Image.open('/root/goldstein-apartment/reference/stills/SET/F00001_WW-FACTFILE_hp_apt1.png').convert('RGB').resize((1200,832),Image.LANCZOS)
r=Image.open(out+'_render.png').convert('RGB')
Image.blend(ph,r,0.5).save(out+'_blend.png')
s=Image.new('RGB',(2400,832)); s.paste(ph,(0,0)); s.paste(r,(1200,0)); s.save(out+'_side.png')
`;
spawnSync('python3', ['-I', '-c', py, out], { stdio: 'inherit' });
console.log('wrote', out + '_blend.png');
