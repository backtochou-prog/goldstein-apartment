// Static checks of the placement manifest and the resolved objects (no browser). Exit 1 on failure.
import { buildSpec } from '../src/spec/apartment.js';
import { resolveObjects } from '../src/interior/build.js';
import { NOT_RECONSTRUCTED } from '../src/spec/objects.js';

const spec = buildSpec();
const { list, byId } = resolveObjects(spec);
let fail = 0;
const ok = (c, m) => { if (!c) { fail = 1; console.log('FAIL ' + m); } return c; };
const W = spec.rooms[0].x[1];
const REFS = new Set(['R01', 'R02', 'R03', 'R04', 'R05', 'R06']);
const CONF = { existence: ['VERIFIED', 'SCRIPT'], position: ['VERIFIED', 'PROVISIONAL'], orientation: ['VERIFIED', 'PROVISIONAL'], dims: ['MEASURED', 'ESTIMATED', 'PROVISIONAL'] };

let n = 0;
ids: { const seen = new Set(); for (const o of list) { ok(!seen.has(o.id), `duplicate id ${o.id}`); seen.add(o.id); } n++; }
for (const o of list) {
  for (const [k, vals] of Object.entries(CONF)) ok(vals.includes(o.conf?.[k]), `${o.id}: conf.${k} = ${o.conf?.[k]}`);
  ok(o.refs.length > 0 && o.refs.every((r) => REFS.has(r)), `${o.id}: refs ${o.refs}`);
  ok(['A', 'B', 'C'].includes(o.fidelity), `${o.id}: fidelity`);
  ok(!!o.support && !!o.name && !!o.group, `${o.id}: support/name/group`);
  ok(o.built.assembly.parts.length > 0 && o.built.assembly.tris > 0, `${o.id}: has geometry`);
  // honesty rules: a PROVISIONAL position needs a note; a VERIFIED position needs an anchor, a support or a reference with a box
  if (o.conf.position === 'PROVISIONAL') ok(o.notes || o.relations || o.anchors.length, `${o.id}: provisional position without a note`);
  if (o.conf.position === 'VERIFIED') ok(o.bbox || o.place.on || o.place.onPx || o.anchors.length, `${o.id}: verified position without a pixel box, anchor or located support`);
  // inside the apartment envelope (main room, back room) with a small tolerance
  const b = o.bounds ?? null;
}
// geometry bounds inside rooms (needs the assembly bounds)
import * as THREE from 'three';
for (const o of list) {
  const bb = new THREE.Box3();
  for (const p of o.built.assembly.parts) { const g = p.geo.clone().applyMatrix4(o.matrix); g.computeBoundingBox(); bb.union(g.boundingBox); }
  o.bb = bb;
  const main = o.room === 'main';
  const x0 = -0.02, x1 = W + 0.02, z0 = main ? -0.02 : spec.rooms[1].z[0] - 0.02, z1 = main ? spec.rooms[0].z[1] : -0.2 + 0.02;
  if (!/^(drape|nets|rod|sconce|ironing|dress|fp_picture)/.test(o.id) && o.id !== 'rug_oriental') {
    ok(bb.min.x >= x0 && bb.max.x <= x1 && bb.min.z >= z0 && bb.max.z <= z1, `${o.id}: outside its room: x ${bb.min.x.toFixed(2)}..${bb.max.x.toFixed(2)} z ${bb.min.z.toFixed(2)}..${bb.max.z.toFixed(2)}`);
  }
  ok(bb.min.y >= -0.02 || /^(drape|nets|fp_|sconce|mug|skimmer|ladle|shawl|splashback|wall_shelf)/.test(o.id), `${o.id}: below the floor (${bb.min.y.toFixed(2)})`);
  ok(bb.max.y <= spec.rooms[0].ceiling, `${o.id}: above the ceiling`);
}
// the oriental rug is a placeholder extent: it must stay inside the evidence limit
const ro = byId.rug_oriental; ok(ro.pos.z + 1.2 <= spec.rooms[0].z[1] + 1e-6, 'oriental rug crosses the evidence limit');

// floor-standing furniture must not interpenetrate (collider AABBs), except known supported/adjacent pairs
const floorCols = list.filter((o) => o.layer === 'R01' && !o.noCollide && o.built.collide.length && o.support === 'floor' && o.id !== 'rug_pink');
const allow = new Set(['armchair|chair_near', 'armchair|chair_left', 'chair_left|dining_table', 'chair_right|dining_table', 'chair_near|dining_table', 'chair_far|dining_table', 'armchair|trefoil_table']);
const boxOf = (o) => { const b = new THREE.Box3(); for (const c of o.built.collide) { const [cx, cy, cz, w, h, d] = c; for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) b.expandByPoint(new THREE.Vector3(cx + sx * w / 2, cy + sy * h / 2, cz + sz * d / 2).applyMatrix4(o.matrix)); } return b; };
const overlaps = [];
for (let i = 0; i < floorCols.length; i++) for (let j = i + 1; j < floorCols.length; j++) {
  const a = boxOf(floorCols[i]), b = boxOf(floorCols[j]);
  const ox = Math.min(a.max.x, b.max.x) - Math.max(a.min.x, b.min.x), oz = Math.min(a.max.z, b.max.z) - Math.max(a.min.z, b.min.z);
  if (ox > 0.03 && oz > 0.03) overlaps.push([floorCols[i].id, floorCols[j].id, ox, oz]);
}
for (const [a, b, ox, oz] of overlaps) { const key = [a, b].sort().join('|'); const k2 = `${a}|${b}`, k3 = `${b}|${a}`; if (!(allow.has(k2) || allow.has(k3))) ok(false, `furniture overlap ${a} / ${b}: ${ox.toFixed(2)} x ${oz.toFixed(2)} m`); else console.log(`note  AABB overlap (rotated bounding boxes, allowed): ${a} / ${b}  ${ox.toFixed(2)} x ${oz.toFixed(2)} m`); }

// circulation: the clear gaps VR users will walk through (architecture + furniture colliders)
const gap = (aId, bId, axis) => { const a = boxOf(byId[aId]), b = boxOf(byId[bId]); return axis === 'x' ? Math.max(b.min.x - a.max.x, a.min.x - b.max.x) : Math.max(b.min.z - a.max.z, a.min.z - b.max.z); };
const aisles = [['range', 'chair_right', 'x', 'kitchen aisle (range to right chair)'], ['trefoil_table', 'armchair', 'x', 'fireplace side aisle']];
for (const [a, b, ax, label] of aisles) console.log(`note  ${label}: ${gap(a, b, ax).toFixed(2)} m`);

const unloc = list.filter((o) => o.conf.position === 'PROVISIONAL').length;
console.log(`\n${list.length} objects: ${list.length - unloc} verified position, ${unloc} provisional; ${list.filter((o) => o.layer === 'SC41').length} on the script layer; ${NOT_RECONSTRUCTED.length} named objects not reconstructed`);
console.log(fail ? 'OBJECT CHECK FAILED' : 'OBJECT CHECK PASSED');
process.exit(fail);
