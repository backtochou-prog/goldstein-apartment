// Finish layer for the APPROVED architecture: materials and UV coordinates only. No vertex position is
// changed (tools/phase2-arch-hash.json + the browser test prove it). Everything created here is tagged
// `interior`; originals are kept in a WeakMap so the Phase 2 greybox can be restored.
import * as THREE from 'three';
import { loadTexture } from './materials.js';
import { ARCH_FINISH } from './material-defs.js';

function worldUV(mesh, tw, th, grain) {
  mesh.updateMatrixWorld(true);
  const g = mesh.geometry, pos = g.attributes.position, nor = g.attributes.normal;
  const uv = new Float32Array(pos.count * 2), v = new THREE.Vector3(), n = new THREE.Vector3();
  const nm = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
  const ax3 = ['x', 'y', 'z'];
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld); n.fromBufferAttribute(nor, i).applyMatrix3(nm).normalize();
    const a = [Math.abs(n.x), Math.abs(n.y), Math.abs(n.z)], d = a[2] >= a[0] && a[2] >= a[1] ? 'z' : a[0] >= a[1] ? 'x' : 'y';
    const others = ax3.filter((k) => k !== d);
    let u, w;
    if (grain && others.includes(grain)) { u = grain; w = others.find((k) => k !== grain); }
    else if (d === 'z') { u = 'x'; w = 'y'; } else if (d === 'x') { u = 'z'; w = 'y'; } else { u = 'x'; w = 'z'; }
    uv[i * 2] = v[u] / tw; uv[i * 2 + 1] = v[w] / th;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

// material bookkeeping lives here, NOT in userData: glTF export serialises userData
const fin = new WeakMap();

export async function applyFinishes(apt, interiorMats) {
  const make = (map, o = {}) => {
    const t = map ? loadTexture(map) : null;
    const m = new THREE.MeshStandardMaterial({ roughness: 0.9, metalness: 0, ...o });
    if (t) m.map = t.tex;
    return { m, p: t?.promise };
  };
  const F = ARCH_FINISH;
  const wm = make(F.wallMain.map, { roughness: F.wallMain.roughness });
  const wb = make(F.wallBack.map, { roughness: F.wallBack.roughness });
  const fl = make(F.floor.map, { roughness: F.floor.roughness });
  const ce = make(null, { color: F.ceiling.color, roughness: 1, side: THREE.DoubleSide, emissive: 0x2a2824 });
  const wd = make('wood_dark', { roughness: interiorMats.woodDark.roughness });
  const ib = new THREE.MeshStandardMaterial({ color: '#17120e', roughness: 0.55, metalness: 0.55 });
  await Promise.all([wm.p, wb.p, fl.p, wd.p]);
  const M = { wm: wm.m, wb: wb.m, fl: fl.m, ce: ce.m, wd: wd.m, ib };

  const faceMats = { // BoxGeometry face order: +x, -x, +y, -y, +z, -z
    pocketWall: [M.wm, M.wm, M.wm, M.wm, M.wm, M.wb],
    mainLeft: M.wm, mainRight: M.wm,
    backWindowWall: M.wb, backLeft: M.wb, backRight: M.wb,
  };
  const single = { floor_main: M.fl, floor_back: M.fl, threshold: M.fl, ceiling_main: M.ce, ceiling_back: M.ce, crownBack: M.ce,
    fireplace: M.ib, mantelShelf: M.ib };
  const woods = new Set(['casingL', 'casingR', 'casingHead', 'jambL', 'jambR', 'skirtingMain', 'pelmet', 'leafL', 'leafR']);
  const bboxSize = (mesh) => { mesh.geometry.computeBoundingBox(); return mesh.geometry.boundingBox.getSize(new THREE.Vector3()); };
  const tile = { wm: F.wallMain.tile, wb: F.wallBack.tile, fl: F.floor.tile };

  let applied = false;
  const meshes = [];
  apt.arch.traverse((o) => { if (o.isMesh && !o.userData.interior) meshes.push(o); });
  for (const o of meshes) {
    const id = o.userData.id;
    let mat = null, uvTile = null, grain;
    if (faceMats[id]) { mat = faceMats[id]; const t = Array.isArray(mat) ? tile.wm : (mat === M.wm ? tile.wm : tile.wb); uvTile = t; }
    else if (single[id]) { mat = single[id]; uvTile = mat === M.fl ? tile.fl : [1, 1]; }
    else if (woods.has(id) || o.userData.kind === 'window' && !o.material.transparent) {
      mat = M.wd; uvTile = [0.5, 0.5];
      const s = bboxSize(o); grain = s.y >= s.x && s.y >= s.z ? 'y' : s.x >= s.z ? 'x' : 'z';
    } else continue;
    // pocket wall faces use two different papers: UVs per vertex, wallpaper tile for both faces is fine
    if (id === 'pocketWall') worldUV(o, tile.wm[0], tile.wm[1]);
    else worldUV(o, uvTile[0], uvTile[1], grain);
    fin.set(o, { finish0: o.material, finishMat: mat });
  }
  // back-room face of the pocket wall uses the back-room paper tile
  const set = (on) => {
    applied = on;
    for (const o of meshes) {
      const f = fin.get(o); if (!f) continue;
      o.material = on ? f.finishMat : f.finish0;
    }
  };
  set(true);
  return { set, get on() { return applied; }, materials: M };
}
