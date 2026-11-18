// Geometry kit for interior objects. Everything is built in OBJECT space: origin on the floor (or on the
// support surface) at the centre of the footprint, +z = front of the object, +y = up, metres.
// Parts are stored as non-indexed geometry with METRIC UVs (grain follows the member's long axis), a
// material key and an optional per-part tint (written to the vertex colour).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { MATERIAL_DEFS } from './material-defs.js';

const AX = ['x', 'y', 'z'];

/** Box-project metric UVs per triangle. grain = axis the texture's u-direction follows. */
export function metricUV(g, tpm, grain) {
  const p = g.attributes.position;
  if (!grain) {
    g.computeBoundingBox();
    const s = new THREE.Vector3(); g.boundingBox.getSize(s);
    grain = s.x >= s.y && s.x >= s.z ? 'x' : s.y >= s.z ? 'y' : 'z';
  }
  const uv = new Float32Array(p.count * 2);
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3();
  for (let t = 0; t < p.count; t += 3) {
    a.fromBufferAttribute(p, t); b.fromBufferAttribute(p, t + 1); c.fromBufferAttribute(p, t + 2);
    n.crossVectors(b.clone().sub(a), c.clone().sub(a));
    const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
    const dom = ax >= ay && ax >= az ? 'x' : ay >= az ? 'y' : 'z';
    let u, v;
    if (grain !== dom) { u = grain; v = AX.find((k) => k !== dom && k !== grain); }
    else { [u, v] = AX.filter((k) => k !== dom); }
    for (let k = 0; k < 3; k++) {
      const q = [a, b, c][k];
      uv[(t + k) * 2] = q[u] * tpm; uv[(t + k) * 2 + 1] = q[v] * tpm;
    }
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

const tmpM = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpE = new THREE.Euler(), tmpS = new THREE.Vector3(), tmpP = new THREE.Vector3();
function local(o) {
  const r = o.rot || [0, 0, 0];
  tmpE.set(r[0], r[1], r[2], 'YXZ'); tmpQ.setFromEuler(tmpE);
  tmpP.set(...(o.pos || [0, 0, 0])); tmpS.set(...(o.scale || [1, 1, 1]));
  return new THREE.Matrix4().compose(tmpP, tmpQ, tmpS);
}

export class Assembly {
  constructor(id) {
    this.id = id; this.parts = [];
    this.stack = [new THREE.Matrix4()];
    this.tris = 0;
  }
  /** Run fn with an extra transform applied to everything it adds. */
  at(o, fn) { this.stack.push(this.stack[this.stack.length - 1].clone().multiply(local(o))); fn(this); this.stack.pop(); return this; }
  add(geo, mat, o = {}) {
    if (!MATERIAL_DEFS[mat]) throw new Error(`unknown material ${mat}`);
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    const def = MATERIAL_DEFS[mat];
    if (def.uvUnit) { /* keeps the primitive's own 0..1 UVs (rugs) */ } else metricUV(g, (def.tpm || 1) * (o.uvScale || 1), o.grain);
    g.applyMatrix4(this.stack[this.stack.length - 1].clone().multiply(local(o)));
    this.parts.push({ geo: g, mat, tint: o.tint || null, name: o.name || '' });
    this.tris += g.attributes.position.count / 3;
    return this;
  }
  box(w, h, d, mat, o = {}) { return this.add(new THREE.BoxGeometry(w, h, d), mat, o); }
  /** Rounded box: r = corner radius. */
  rbox(w, h, d, r, mat, o = {}) { return this.add(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3)), mat, o); }
  cyl(rt, rb, h, mat, o = {}, seg = 14) { return this.add(new THREE.CylinderGeometry(rt, rb, h, seg), mat, o); }
  /** Surface of revolution about y. profile = [[radius, y], ...] */
  lathe(profile, mat, o = {}, seg = 16) { return this.add(new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(Math.max(r, 1e-4), y)), seg), mat, { grain: 'y', ...o }); }
  sphere(r, mat, o = {}, ws = 14, hs = 10) { return this.add(new THREE.SphereGeometry(r, ws, hs), mat, o); }
  torus(R, r, mat, o = {}, arc = Math.PI * 2, rs = 8, ts = 20) { return this.add(new THREE.TorusGeometry(R, r, rs, ts, arc), mat, o); }
  plane(w, h, mat, o = {}) { return this.add(new THREE.PlaneGeometry(w, h), mat, o); }
  /** Extrude a 2-D outline [[x, y], ...] by depth along z (centred on z = 0). */
  extrude(pts, depth, mat, o = {}) {
    const sh = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
    const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 10 });
    g.translate(0, 0, -depth / 2);
    return this.add(g, mat, o);
  }
  /** Round tube along a polyline of [x, y, z] points. */
  tube(path, r, mat, o = {}, seg = 24, rs = 6) {
    const curve = new THREE.CatmullRomCurve3(path.map((p) => new THREE.Vector3(...p)));
    return this.add(new THREE.TubeGeometry(curve, seg, r, rs, false), mat, o);
  }
  /** Truncated pyramid / tapered leg with square section. */
  taper(wt, dt, wb, db, h, mat, o = {}) {
    const g = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1); const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const top = p.getY(i) > 0; const sx = top ? wt : wb, sz = top ? dt : db;
      p.setXYZ(i, p.getX(i) * sx, p.getY(i) * h, p.getZ(i) * sz);
    }
    g.computeVertexNormals();
    return this.add(g, mat, o);
  }
}

/** Parabolic dome / bell shade from a profile (inside faces visible: material is double sided). */
export const bellProfile = (rTop, rBot, h, bulge = 0, n = 10) =>
  Array.from({ length: n + 1 }, (_, i) => { const t = i / n; return [rTop + (rBot - rTop) * t + Math.sin(t * Math.PI) * bulge, h * (1 - t)]; });
