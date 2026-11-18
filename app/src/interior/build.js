// Resolves the placement manifest into world transforms, builds the merged render meshes (one per
// material and layer), the furniture colliders and the picking table. Architecture is never touched.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { buildManifest } from '../spec/objects.js';
import { pointAtHeight, zOnPlaneX } from '../spec/r01-solve.js';
import * as FURN from './models/furniture.js';
import * as KIT from './models/kitchen.js';
import * as DEC from './models/decor.js';
import { createMaterials } from './materials.js';

export const MODELS = { ...FURN, ...KIT, ...DEC };
const D2R = Math.PI / 180;
export const CONF_COLORS = { VERIFIED: 0x5f9e6e, PROVISIONAL: 0xd8b04a };

export function resolveObjects(spec) {
  const list = buildManifest(spec), byId = {};
  for (const e of list) {
    const [fn, params] = e.model;
    if (!MODELS[fn]) throw new Error(`manifest ${e.id}: unknown model ${fn}`);
    const built = MODELS[fn](params);
    const p = e.place, pos = new THREE.Vector3();
    const sup = (id) => { const s = byId[id]; if (!s) throw new Error(`manifest ${e.id}: support ${id} must be listed before it`); return s; };
    if (p.floor) pos.set(p.floor[0], 0, p.floor[1]);
    else if (p.pos) pos.set(...p.pos);
    else if (p.wallR) pos.set(p.wallR.x, p.wallR.y, zOnPlaneX(p.wallR.px, p.wallR.x));
    else if (p.on) {
      const s = sup(p.on), c = Math.cos(s.yaw), sn = Math.sin(s.yaw), [dx, dz] = p.at;
      pos.set(s.pos.x + dx * c + dz * sn, s.pos.y + s.built.top + (p.dy || 0), s.pos.z - dx * sn + dz * c);
    } else if (p.onPx) {
      const s = sup(p.onPx), top = s.pos.y + s.built.top + (p.dy || 0);
      if (p.anchor) { const q = pointAtHeight(p.anchor[0], p.anchor[1], top); pos.set(q.x, top, q.z); }
      else pos.set(s.pos.x, top, zOnPlaneX(p.px, s.pos.x));
    }
    else if (p.px) { const q = pointAtHeight(p.px[0], p.px[1], p.h || 0); pos.set(q.x, p.floorOf ? 0 : (p.h || 0), q.z); }
    else throw new Error(`manifest ${e.id}: no placement`);
    const yaw = (e.yaw || 0) * D2R, r = (e.rot || [0, 0, 0]).map((a) => a * D2R);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0], yaw + r[1], r[2], 'YXZ'));
    const matrix = new THREE.Matrix4().compose(pos, q, new THREE.Vector3(...(e.scale || [1, 1, 1])));
    byId[e.id] = { ...e, built, pos, yaw, matrix };
  }
  return { list: Object.values(byId), byId };
}

export async function buildInterior(spec) {
  const t0 = performance.now();
  const { list, byId } = resolveObjects(spec);
  const stats = { objects: list.length, tris: 0, perObject: {}, buildMs: 0, texturesMs: 0 };
  const { mats, ready } = createMaterials();
  const tT = performance.now(); await ready; stats.texturesMs = performance.now() - tT;
  const root = new THREE.Group(); root.name = 'interior'; root.userData.interior = true;
  const layers = {};                        // layer -> Group
  const buckets = new Map();                // `${layer}|${mat}` -> { geos, ranges }
  const colliders = [], colHelpers = new THREE.Group(); colHelpers.name = 'furnitureCollision'; colHelpers.visible = false;
  const confCol = new THREE.Color();

  for (const o of list) {
    const confHex = o.conf.position === 'VERIFIED' ? CONF_COLORS.VERIFIED : CONF_COLORS.PROVISIONAL;
    let tris = 0;
    const bb = new THREE.Box3();
    for (const part of o.built.assembly.parts) {
      const g = part.geo.clone().applyMatrix4(o.matrix);
      const n = g.attributes.position.count;
      const col = new Float32Array(n * 3), cc = new Float32Array(n * 3);
      const tint = new THREE.Color(part.tint || '#ffffff'); confCol.setHex(confHex);
      for (let i = 0; i < n; i++) { col.set([tint.r, tint.g, tint.b], i * 3); cc.set([confCol.r, confCol.g, confCol.b], i * 3); }
      g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setAttribute('confColor', new THREE.BufferAttribute(cc, 3));
      g.computeBoundingBox(); bb.union(g.boundingBox);
      const key = `${o.layer}|${part.mat}`;
      if (!buckets.has(key)) buckets.set(key, { layer: o.layer, mat: part.mat, geos: [], ranges: [], tris: 0 });
      const b = buckets.get(key);
      b.ranges.push({ start: b.tris, end: b.tris + n / 3, id: o.id }); b.tris += n / 3; b.geos.push(g); tris += n / 3;
    }
    o.bounds = bb; stats.tris += tris; stats.perObject[o.id] = tris;
    for (const c of (o.noCollide ? [] : o.built.collide || [])) {
      const [cx, cy, cz, w, h, d] = c, box = new THREE.Box3();
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) box.expandByPoint(new THREE.Vector3(cx + sx * w / 2, cy + sy * h / 2, cz + sz * d / 2).applyMatrix4(o.matrix));
      colliders.push({ box, id: o.id, layer: o.layer, kind: 'furniture' });
      const hl = new THREE.Box3Helper(box, 0x33aaff); hl.userData.layer = o.layer; colHelpers.add(hl);
    }
  }

  const meshes = [];
  for (const b of buckets.values()) {
    const merged = mergeGeometries(b.geos, false);
    merged.userData.confAttr = merged.getAttribute('confColor'); merged.userData.baseColor = merged.getAttribute('color');
    const m = new THREE.Mesh(merged, mats[b.mat]);
    m.name = `interior_${b.layer}_${b.mat}`; m.userData = { interior: true, kind: 'furniture', layer: b.layer, mat: b.mat, ranges: b.ranges };
    m.frustumCulled = true;
    if (mats[b.mat].transparent) m.renderOrder = 3;
    (layers[b.layer] ??= Object.assign(new THREE.Group(), { name: `layer_${b.layer}` })).add(m);
    meshes.push(m);
    for (const g of b.geos) g.dispose();
  }
  for (const g of Object.values(layers)) root.add(g);
  if (layers.SC41) layers.SC41.visible = false;           // script props are provisional: off by default
  root.add(colHelpers);

  // picking: triangle index -> object id
  const pick = (mesh, faceIndex) => { const r = mesh.userData.ranges; let lo = 0, hi = r.length - 1; while (lo < hi) { const mid = (lo + hi) >> 1; if (r[mid].end <= faceIndex) lo = mid + 1; else hi = mid; } return byId[r[lo].id]; };

  let confView = false; const mat0 = new WeakMap();
  const setConfidenceView = (on) => {
    confView = on;
    for (const m of meshes) {
      const g = m.geometry;
      if (on) { if (!mat0.has(m)) mat0.set(m, m.material); m.material = confMat; g.setAttribute('color', g.userData.confAttr); }
      else { if (mat0.has(m)) m.material = mat0.get(m); g.setAttribute('color', g.userData.baseColor); }
    }
  };
  const confMat = new THREE.MeshBasicMaterial({ vertexColors: true });

  stats.buildMs = performance.now() - t0 - stats.texturesMs;
  return { root, layers, meshes, mats, list, byId, colliders, colHelpers, stats, pick, setConfidenceView, get confView() { return confView; } };
}
