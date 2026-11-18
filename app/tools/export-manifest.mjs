// Engine-neutral export of the resolved interior: placements, orientation, confidence and collision boxes.
// Output: exports/object-manifest.json (for Godot / Blender / a native port). Positions in the Phase 2 frame (metres).
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as THREE from 'three';
import { buildSpec } from '../src/spec/apartment.js';
import { resolveObjects } from '../src/interior/build.js';

const spec = buildSpec();
const { list } = resolveObjects(spec);
const r = (v) => Math.round(v * 1e4) / 1e4;
const out = {
  schema: 'goldstein.objects.v1',
  frame: 'x from the main-room left wall, z from the pocket-door wall face (+z toward the unseen fourth wall), y up; metres; yaw in degrees about +y (yaw 0 = object front faces +z)',
  objects: list.map((o) => {
    const colliders = o.noCollide ? [] : o.built.collide.map(([cx, cy, cz, w, h, d]) => {
      const b = new THREE.Box3();
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) b.expandByPoint(new THREE.Vector3(cx + sx * w / 2, cy + sy * h / 2, cz + sz * d / 2).applyMatrix4(o.matrix));
      return { local: { center: [cx, cy, cz].map(r), size: [w, h, d].map(r) }, worldAABB: { min: b.min.toArray().map(r), max: b.max.toArray().map(r) } };
    });
    const e = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromRotationMatrix(o.matrix), 'YXZ');
    return {
      id: o.id, name: o.name, group: o.group, room: o.room, layer: o.layer, model: o.model[0], params: o.model[1],
      position: o.pos.toArray().map(r), yawDegrees: r(THREE.MathUtils.radToDeg(e.y)), tiltDegrees: [r(THREE.MathUtils.radToDeg(e.x)), r(THREE.MathUtils.radToDeg(e.z))],
      support: o.support, confidence: o.conf, fidelity: o.fidelity, references: o.refs, anchors: o.anchors, relations: o.relations, notes: o.notes,
      triangles: Math.round(o.built.assembly.tris), colliders,
    };
  }),
};
const dest = resolve(import.meta.dirname, '../exports/object-manifest.json');
mkdirSync(resolve(dest, '..'), { recursive: true });
writeFileSync(dest, JSON.stringify(out, null, 1));
console.log(`wrote ${dest}: ${out.objects.length} objects, ${out.objects.reduce((n, o) => n + o.colliders.length, 0)} colliders`);
