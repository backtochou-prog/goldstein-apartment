// Builds the architectural greybox from the spec. Pure geometry: no furniture, no decoration.
// Output groups are kept separate so inspection tools never modify architecture:
//   architecture  visible structure (walls, floors, ceilings, casing, leaves, windows, fireplace, trims)
//   collision     invisible axis-aligned boxes (shown only in debug)
//   limits        evidence limits (translucent, not film walls)
//   footprints    flat outlines of furniture positions (not architecture)
import * as THREE from 'three';
import { MAT, statusColor } from './materials.js';

const box = (w, h, d) => new THREE.BoxGeometry(Math.max(w, 1e-3), Math.max(h, 1e-3), Math.max(d, 1e-3));

function tag(obj, meta) {
  obj.userData = { ...obj.userData, ...meta };
  return obj;
}

export function buildApartment(spec) {
  const root = new THREE.Group(); root.name = 'apartment';
  const arch = new THREE.Group(); arch.name = 'architecture';
  const collision = new THREE.Group(); collision.name = 'collision';
  const limits = new THREE.Group(); limits.name = 'limits';
  const foot = new THREE.Group(); foot.name = 'footprints';
  root.add(arch, collision, limits, foot);
  const colliders = []; // { box: THREE.Box3, id, dynamic? }

  const addSolid = (geo, mat, pos, meta, { collide = true, parent = arch } = {}) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(pos);
    tag(m, meta);
    parent.add(m);
    if (collide) {
      m.updateMatrixWorld(true);
      const b = new THREE.Box3().setFromObject(m);
      colliders.push({ box: b, id: meta.id, mesh: m });
      const helper = new THREE.Box3Helper(b, 0xff5533); helper.userData.colliderOf = meta.id;
      collision.add(helper);
    }
    return m;
  };

  // ---------- walls (split into rectangles around openings; cheap and collision-friendly)
  const wallMeshes = [];
  for (const w of spec.walls) {
    const segs = wallSegments(w);
    const mat = MAT.wall;
    for (const s of segs) {
      const len = s.to - s.from, h = s.top - s.bottom, mid = (s.from + s.to) / 2, ym = (s.top + s.bottom) / 2;
      const geo = w.axis === 'x' ? box(len, h, w.thickness) : box(w.thickness, h, len);
      const pos = w.axis === 'x' ? new THREE.Vector3(mid, ym, w.at) : new THREE.Vector3(w.at, ym, mid);
      const m = addSolid(geo, mat, pos, { id: w.id, kind: 'wall', status: segStatus(w, s), evidence: w.evidence, note: w.note, wall: w.id });
      wallMeshes.push(m);
    }
  }

  // ---------- floors and ceilings
  for (const r of spec.rooms) {
    const w = r.x[1] - r.x[0], d = r.z[1] - r.z[0];
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(w, d), MAT.floor);
    fl.rotation.x = -Math.PI / 2; fl.position.set((r.x[0] + r.x[1]) / 2, 0, (r.z[0] + r.z[1]) / 2);
    tag(fl, { id: `floor_${r.id}`, kind: 'floor', walkable: true, status: r.status.width === 'DERIVED' ? 'DERIVED' : 'PROVISIONAL', evidence: r.evidence, note: r.name });
    arch.add(fl);
    const ce = new THREE.Mesh(new THREE.PlaneGeometry(w, d), MAT.ceiling);
    ce.rotation.x = Math.PI / 2; ce.position.set(fl.position.x, r.ceiling, fl.position.z);
    tag(ce, { id: `ceiling_${r.id}`, kind: 'ceiling', status: r.status.ceiling, evidence: r.evidence, note: `Ceiling ${r.ceiling.toFixed(2)} m (${r.status.ceiling})` });
    arch.add(ce);
  }
  // threshold under the doorway (through the wall thickness)
  {
    const [x0, x1] = spec.doorway.clearX, T = spec.P.endWallThickness;
    const th = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, T), MAT.floor);
    th.rotation.x = -Math.PI / 2; th.position.set((x0 + x1) / 2, 0.001, -T / 2);
    tag(th, { id: 'threshold', kind: 'floor', walkable: true, status: 'DERIVED', evidence: ['R01'] });
    arch.add(th);
  }

  // ---------- pocket-door casing (main-room side) and leaves
  const D = spec.doorway, T = spec.P.endWallThickness, cp = D.casing.projection;
  const [ox0, ox1] = D.casing.outerX, [cx0, cx1] = D.clearX;
  for (const [a, b, id] of [[ox0, cx0, 'casingL'], [cx1, ox1, 'casingR']]) {
    addSolid(box(b - a, D.head, cp), MAT.trim, new THREE.Vector3((a + b) / 2, D.head / 2, cp / 2),
      { id, kind: 'casing', status: 'DERIVED', evidence: D.evidence, note: 'Pocket-door casing (main-room face). Profile detail: Phase 3.' }, { collide: false });
  }
  addSolid(box(ox1 - ox0 + 0.06, D.casing.top - D.head, cp + 0.03), MAT.trim,
    new THREE.Vector3((ox0 + ox1) / 2, (D.casing.top + D.head) / 2, (cp + 0.03) / 2),
    { id: 'casingHead', kind: 'casing', status: 'DERIVED (top is a minimum)', evidence: D.evidence,
      note: `Head entablature from ${D.head.toFixed(2)} m to ≥ ${D.casing.top.toFixed(2)} m; R01 crops its top.` }, { collide: false });
  // jamb linings (inside the opening)
  for (const [x, id] of [[cx0, 'jambL'], [cx1, 'jambR']]) {
    addSolid(box(0.02, D.head, T), MAT.trim, new THREE.Vector3(x + (id === 'jambL' ? 0.01 : -0.01), D.head / 2, -T / 2),
      { id, kind: 'casing', status: 'DERIVED', evidence: D.evidence }, { collide: false });
  }
  const leaves = D.leaves.map((L) => {
    const m = addSolid(box(L.width, D.head - 0.01, L.thickness), MAT.leaf, new THREE.Vector3(0, (D.head - 0.01) / 2, -T / 2),
      { id: L.id, kind: 'leaf', status: 'DERIVED', evidence: D.evidence, note: 'Pocket-door leaf. Slide with the Doors control. R01 position = default.' });
    m.userData.leaf = L;
    return m;
  });
  const leafColliders = colliders.filter((c) => c.id === 'leafL' || c.id === 'leafR');
  function setDoors(mode) {
    // mode: 'r01' | 'open' | 'closed' | number 0..1 (1 = closed)
    for (const m of leaves) {
      const L = m.userData.leaf;
      let edge; // x of the leading edge
      const closedEdge = (cx0 + cx1) / 2 + (L.side === 'left' ? spec.P.leafOverlap / 2 : -spec.P.leafOverlap / 2);
      const openEdge = L.closedFrom; // flush with the jamb = fully in the pocket
      if (mode === 'r01') edge = L.r01Edge;
      else if (mode === 'open') edge = openEdge;
      else if (mode === 'closed') edge = closedEdge;
      else edge = openEdge + (closedEdge - openEdge) * mode;
      m.position.x = L.side === 'left' ? edge - L.width / 2 : edge + L.width / 2;
      m.updateMatrixWorld(true);
      const c = leafColliders.find((c) => c.id === L.id);
      c.box.setFromObject(m);
    }
  }
  setDoors('r01');

  // ---------- back-room windows, pelmets, crown, main-room skirting
  const ww = spec.walls.find((w) => w.id === 'backWindowWall');
  const zFace = ww.at + ww.thickness / 2;
  for (const o of ww.openings) {
    const fw = 0.06, fd = 0.10, cx = (o.from + o.to) / 2, ow = o.to - o.from, oh = o.top - o.bottom;
    const meta = { id: o.id, kind: 'window', status: 'DERIVED centre / PROVISIONAL size', evidence: ww.evidence,
      note: 'Window centre from the R01 curtain rod. Width, sill, head and sash type are provisional.' };
    const g = new THREE.Group(); tag(g, meta); arch.add(g);
    for (const [w, h, x, y] of [[ow + 2 * fw, fw, cx, o.top + fw / 2], [ow + 2 * fw, fw, cx, o.bottom - fw / 2],
      [fw, oh, o.from - fw / 2, (o.top + o.bottom) / 2], [fw, oh, o.to + fw / 2, (o.top + o.bottom) / 2]]) {
      const m = new THREE.Mesh(box(w, h, fd), MAT.windowFrame); m.position.set(x, y, zFace - fd / 2 + 0.02); tag(m, meta); g.add(m);
    }
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(ow, oh), MAT.glass);
    glass.position.set(cx, (o.top + o.bottom) / 2, ww.at); tag(glass, meta); g.add(glass);
  }
  const pel = spec.trims.find((t) => t.id === 'pelmets');
  for (const [a, b] of pel.rods) {
    addSolid(box(b - a, 0.14, 0.12), MAT.trim, new THREE.Vector3((a + b) / 2, pel.top - 0.07, zFace + 0.06),
      { id: 'pelmet', kind: 'trim', status: 'DERIVED', evidence: pel.evidence, note: 'Pelmet / curtain-rod line. Curtains are Phase 3.' }, { collide: false });
  }
  const crown = spec.trims.find((t) => t.id === 'crownBack');
  {
    const back = spec.rooms.find((r) => r.id === 'back');
    addSolid(box(back.x[1] - back.x[0], crown.depth, 0.12), MAT.trimLight,
      new THREE.Vector3((back.x[0] + back.x[1]) / 2, back.ceiling - crown.depth / 2, zFace + 0.06),
      { id: 'crownBack', kind: 'trim', status: 'DERIVED', evidence: crown.evidence, note: crown.note }, { collide: false });
  }
  const sk = spec.trims.find((t) => t.id === 'skirtingMain');
  {
    const main = spec.rooms.find((r) => r.id === 'main');
    const runs = [ // [x0,z0,x1,z1]
      [0, 0, 0, main.z[1]], [main.x[1], 0, main.x[1], main.z[1]],
      [0, 0, D.casing.outerX[0], 0], [D.casing.outerX[1], 0, main.x[1], 0],
    ];
    for (const [x0, z0, x1, z1] of runs) {
      const alongX = z0 === z1, len = alongX ? x1 - x0 : z1 - z0;
      const off = sk.depth / 2;
      const pos = alongX ? new THREE.Vector3((x0 + x1) / 2, sk.height / 2, z0 + off)
        : new THREE.Vector3(x0 + (x0 === 0 ? off : -off), sk.height / 2, (z0 + z1) / 2);
      addSolid(alongX ? box(len, sk.height, sk.depth) : box(sk.depth, sk.height, len), MAT.trim, pos,
        { id: 'skirtingMain', kind: 'trim', status: 'DERIVED', evidence: sk.evidence, note: `Skirting ${sk.height.toFixed(2)} m, dark wood (R01).` }, { collide: false });
    }
  }

  // ---------- fireplace (left wall)
  {
    const F = spec.fireplace, wth = F.zTo - F.zFrom, zc = (F.zFrom + F.zTo) / 2;
    const meta = { id: 'fireplace', kind: 'fireplace', status: 'DERIVED end + height / PROVISIONAL width', evidence: F.evidence, note: F.note };
    addSolid(box(F.depth, F.mantelHeight - 0.06, wth), MAT.fireplace, new THREE.Vector3(F.depth / 2, (F.mantelHeight - 0.06) / 2, zc), meta);
    addSolid(box(F.depth + 0.06, 0.06, wth + 0.10), MAT.fireplace, new THREE.Vector3((F.depth + 0.06) / 2, F.mantelHeight - 0.03, zc),
      { ...meta, id: 'mantelShelf' }, { collide: false });
    // arched firebox opening as a dark inset face (shape with arch)
    const { w, h } = F.firebox;
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2, 0); shape.lineTo(w / 2, 0); shape.lineTo(w / 2, h - w / 2);
    shape.absarc(0, h - w / 2, w / 2, 0, Math.PI, false); shape.lineTo(-w / 2, 0);
    const fb = new THREE.Mesh(new THREE.ShapeGeometry(shape, 12), MAT.firebox);
    fb.rotation.y = Math.PI / 2; fb.position.set(F.depth + 0.002, 0, zc);
    tag(fb, { ...meta, id: 'firebox', status: 'PROVISIONAL', note: 'Arched insert seen in R02; size and height provisional.' });
    arch.add(fb);
  }

  // ---------- evidence limits (translucent, walkable boundary)
  for (const L of spec.limits) {
    const len = L.to - L.from;
    const m = new THREE.Mesh(box(len, L.height, 0.02), MAT.limit);
    m.position.set((L.from + L.to) / 2, L.height / 2, L.at);
    tag(m, { id: L.id, kind: 'limit', status: 'LIMIT', note: L.note });
    limits.add(m);
    m.updateMatrixWorld(true);
    colliders.push({ box: new THREE.Box3().setFromObject(m), id: L.id });
    // diagonal hatch so it can never be mistaken for a film wall
    const pts = [];
    for (let x = L.from; x <= L.to + 1e-6; x += 0.4) { pts.push(new THREE.Vector3(x, 0, L.at), new THREE.Vector3(Math.min(x + L.height, L.to), Math.min(L.height, L.to - x), L.at)); }
    const hatch = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), MAT.limitLine);
    tag(hatch, { id: L.id, kind: 'limit' }); limits.add(hatch);
  }

  // ---------- furniture footprints (outlines on the floor)
  for (const F of spec.footprints) {
    const [x0, x1] = F.x, [z0, z1] = F.z, y = 0.004;
    const pts = [[x0, z0], [x1, z0], [x1, z1], [x0, z1], [x0, z0]].map(([x, z]) => new THREE.Vector3(x, y, z));
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: statusColor(F.status) }));
    tag(line, { id: F.id, kind: 'footprint', status: F.status, evidence: F.evidence, note: 'Furniture footprint (not architecture, not collision).' });
    foot.add(line);
  }

  collision.visible = false;
  return { root, arch, collision, limits, footprints: foot, colliders, setDoors, wallMeshes };
}

function segStatus(w) { return w.status; }

export function wallSegments(w) {
  const H = w.height, segs = [];
  const ops = [...(w.openings || [])].sort((a, b) => a.from - b.from);
  let cur = w.from;
  for (const o of ops) {
    if (o.from > cur) segs.push({ from: cur, to: o.from, bottom: 0, top: H });
    if (o.top < H) segs.push({ from: o.from, to: o.to, bottom: o.top, top: H, kind: 'above', opening: o.id });
    if (o.bottom > 0) segs.push({ from: o.from, to: o.to, bottom: 0, top: o.bottom, kind: 'below', opening: o.id });
    cur = o.to;
  }
  if (w.to > cur) segs.push({ from: cur, to: w.to, bottom: 0, top: H });
  return segs;
}
