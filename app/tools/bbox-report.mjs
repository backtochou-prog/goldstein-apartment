// Projects every object's real geometry bounds through the solved R01 camera and compares with the pixel box
// read from R01. Reports IoU and how much of the image box the model covers. Usage: node tools/bbox-report.mjs [--json out]
import { withPage } from './lib/session.mjs';
import { writeFileSync } from 'node:fs';
const jsonOut = process.argv.includes('--json') ? process.argv[process.argv.indexOf('--json') + 1] : null;
const rows = await withPage((page) => page.evaluate(() => window.__apt.objects()), {});
const inter = (a, b) => Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
const area = (a) => Math.max(0, a[2] - a[0]) * Math.max(0, a[3] - a[1]);
const out = [];
for (const r of rows) {
  if (!r.bbox) continue;
  const i = inter(r.bbox, r.proj), u = area(r.bbox) + area(r.proj) - i;
  out.push({ id: r.id, iou: i / u, cover: i / area(r.bbox), ratio: area(r.proj) / area(r.bbox), bbox: r.bbox.map(Math.round), proj: r.proj.map(Math.round), conf: r.conf.position });
}
out.sort((a, b) => a.iou - b.iou);
for (const o of out) console.log(`${o.id.padEnd(18)} IoU ${o.iou.toFixed(2)}  covers ${(o.cover * 100).toFixed(0).padStart(3)}%  area x${o.ratio.toFixed(2)}  img [${o.bbox}]  model [${o.proj}]`);
const med = out.map((o) => o.iou).sort((a, b) => a - b)[Math.floor(out.length / 2)];
console.log(`\n${out.length} objects with an R01 box; median IoU ${med.toFixed(2)}; IoU>=0.5: ${out.filter((o) => o.iou >= 0.5).length}`);
if (jsonOut) writeFileSync(jsonOut, JSON.stringify(out, null, 1));
