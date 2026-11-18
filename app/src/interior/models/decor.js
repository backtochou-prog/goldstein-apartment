// Lamps, textiles, small objects, rugs, curtains, fireplace details and the dressmaking props.
// Object space as in furniture.js (origin = base centre on the supporting surface, +z front).
import * as THREE from 'three';
import { Assembly, bellProfile } from '../kit.js';

const PI = Math.PI;

/** Cloth surface from a parametric function fn(u, v) -> [x, y, z], u,v in [0,1]. */
export function clothGeo(segU, segV, fn) {
  const pos = [], idx = [];
  for (let j = 0; j <= segV; j++) for (let i = 0; i <= segU; i++) pos.push(...fn(i / segU, j / segV));
  for (let j = 0; j < segV; j++) for (let i = 0; i < segU; i++) { const a = j * (segU + 1) + i, b = a + 1, c = a + segU + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}

// ---------------------------------------------------------------- lamps
/** Domed painted-glass table lamp (on the trefoil table in R01): bronze stem, dome with an ornamental rim. */
export function domedGlassLamp() {
  const A = new Assembly('domed_lamp');
  A.lathe([[0.095, 0], [0.095, 0.012], [0.07, 0.03], [0.04, 0.05], [0.02, 0.08], [0.028, 0.16], [0.018, 0.26], [0.03, 0.34], [0.02, 0.40]], 'ironBlack', { tint: '#4a4230' }, 18);
  A.cyl(0.098, 0.098, 0.012, 'brass', { pos: [0, 0.006, 0] }, 20);
  A.lathe([[0.0001, 0.20], [0.06, 0.19], [0.12, 0.14], [0.175, 0.04], [0.185, 0.0]], 'shadeDomed', { pos: [0, 0.38, 0] }, 24);   // dome
  A.torus(0.183, 0.008, 'brass', { pos: [0, 0.382, 0], rot: [PI / 2, 0, 0] }, PI * 2, 6, 24);
  A.torus(0.15, 0.005, 'brass', { pos: [0, 0.42, 0], rot: [PI / 2, 0, 0] }, PI * 2, 6, 24);
  A.sphere(0.012, 'brass', { pos: [0, 0.585, 0] });
  return { assembly: A, collide: [], top: 0.6 };
}
/** Small lantern-style lamp (on the small cabinet in R01): glazed lantern with a pitched roof. */
export function lanternLamp() {
  const A = new Assembly('lantern_lamp');
  A.box(0.13, 0.015, 0.13, 'brass', { pos: [0, 0.0075, 0] });
  A.box(0.115, 0.10, 0.115, 'shadeFringe', { pos: [0, 0.065, 0] });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) A.box(0.008, 0.11, 0.008, 'brass', { pos: [sx * 0.058, 0.065, sz * 0.058] });
  A.cyl(0.0001, 0.095, 0.05, 'brass', { pos: [0, 0.145, 0], rot: [0, PI / 4, 0] }, 4);
  A.sphere(0.012, 'brass', { pos: [0, 0.18, 0] });
  return { assembly: A, collide: [], top: 0.19 };
}
/** Table lamp with a fringed fabric shade (nightstand, cabinet lamps). tint = shade colour. */
export function fringedLamp({ tint = '#fae6c9', baseTint = '#5a3b24', h = 0.36, shadeR = 0.17 } = {}) {
  const A = new Assembly('fringed_lamp');
  A.lathe([[0.07, 0], [0.07, 0.012], [0.05, 0.04], [0.03, 0.07], [0.04, 0.12], [0.024, 0.18], [0.034, 0.24], [0.02, h * 0.78]], 'solid', { tint: baseTint }, 16);
  A.lathe(bellProfile(0.07, shadeR, 0.2, 0.01, 8).map(([r, y]) => [r, y]), 'shadeFringe', { tint, pos: [0, h - 0.02, 0] }, 22);
  A.lathe([[shadeR, 0.0], [shadeR * 1.03, -0.055]], 'shadeFringe', { tint: '#c9a98a', pos: [0, h - 0.02, 0] }, 22);   // fringe skirt
  return { assembly: A, collide: [], top: h + 0.2 };
}
/** Standard (floor) lamp with a pink fringed shade. */
export function standardLamp({ h = 1.45 } = {}) {
  const A = new Assembly('standard_lamp');
  A.cyl(0.13, 0.15, 0.03, 'solid', { tint: '#4a3a2a', pos: [0, 0.015, 0] }, 20);
  A.lathe([[0.03, 0.03], [0.018, 0.2], [0.03, 0.5], [0.018, 0.9], [0.026, h - 0.28]], 'solid', { tint: '#6b4f2f' }, 12);
  A.lathe(bellProfile(0.09, 0.22, 0.26, 0.015, 8), 'shadeFringe', { tint: '#e3a58f', pos: [0, h - 0.04, 0] }, 24);
  A.lathe([[0.22, 0.0], [0.228, -0.07]], 'shadeFringe', { tint: '#b0786a', pos: [0, h - 0.04, 0] }, 24);
  return { assembly: A, collide: [[0, h / 2, 0, 0.3, h, 0.3]], top: 0 };
}
/** Two-arm wall sconce with peach tulip shades. Back = -z (wall side). */
export function sconce() {
  const A = new Assembly('sconce');
  A.box(0.05, 0.12, 0.012, 'brass', { pos: [0, 0, 0.006] });
  for (const s of [-1, 1]) {
    A.tube([[0, 0, 0.02], [s * 0.05, 0.02, 0.07], [s * 0.1, 0.05, 0.08], [s * 0.12, 0.09, 0.06]], 0.007, 'brass', {}, 14, 6);
    A.lathe([[0.012, 0], [0.03, 0.03], [0.05, 0.075], [0.058, 0.1], [0.052, 0.105]], 'shadePeach', { pos: [s * 0.12, 0.085, 0.06] }, 16);
    A.cyl(0.012, 0.012, 0.02, 'brass', { pos: [s * 0.12, 0.085, 0.06] }, 6);
  }
  return { assembly: A, collide: [], top: 0 };
}

// ---------------------------------------------------------------- textiles on the armchair
export function ruchedCushion() {
  const A = new Assembly('cushion_ruched');
  A.sphere(0.2, 'solid', { tint: '#bcc4ad', scale: [1, 0.32, 1] }, 28, 12);
  for (let i = 0; i < 6; i++) A.torus(0.14, 0.009, 'solid', { tint: '#aeb69f', pos: [0, 0.046 + (i % 2) * 0.003, 0], rot: [PI / 2, i / 6 * PI, 0] }, PI * 2, 4, 14);
  A.torus(0.2, 0.014, 'solid', { tint: '#c9d0bb', pos: [0, 0.003, 0], rot: [PI / 2, 0, 0] }, PI * 2, 6, 28);
  return { assembly: A, collide: [], top: 0.07 };
}
export function floralCushion() {
  const A = new Assembly('cushion_floral');
  A.rbox(0.36, 0.09, 0.30, 0.04, 'tapestry', { pos: [0, 0.045, 0] });
  return { assembly: A, collide: [], top: 0.09 };
}
/** Shawl draped over the top-left of the armchair back and falling onto the seat. Local origin at the back top. */
export function shawl() {
  const A = new Assembly('shawl');
  const g = clothGeo(14, 14, (u, v) => {
    const w = 0.34, x = (u - 0.5) * w + Math.sin(v * 7 + u * 3) * 0.012;
    // path: down the back (y from 0 to -0.42), then onto the seat (z forward)
    const s = v * 0.95, down = Math.min(s, 0.42), fwd = Math.max(0, s - 0.42);
    return [x + Math.sin(u * 9 + v * 4) * 0.008, -down + Math.sin(u * 6 - v * 5) * 0.012, 0.02 + fwd * 1.0 + Math.sin(u * 5) * 0.01];
  });
  A.add(g, 'shawl', { grain: 'x' });
  return { assembly: A, collide: [], top: 0 };
}

// ---------------------------------------------------------------- small objects
/** Books lying in a stack. tints = spine colours bottom to top; sizes vary deterministically. */
export function bookStack({ tints = ['#6b2d2d', '#2d3b55', '#3f5b3f'], w = 0.17, d = 0.24 } = {}) {
  const A = new Assembly('book_stack'); let y = 0;
  tints.forEach((t, i) => {
    const th = 0.022 + (i % 3) * 0.008, bw = w - (i % 2) * 0.015, bd = d - (i % 3) * 0.02;
    A.box(bw, th, bd, 'solid', { tint: '#e8dfc8', pos: [(i % 2) * 0.006, y + th / 2, 0], rot: [0, (i - 1) * 0.12, 0] });
    A.box(bw + 0.004, th + 0.002, 0.008, 'solid', { tint: t, pos: [(i % 2) * 0.006, y + th / 2, -bd / 2], rot: [0, (i - 1) * 0.12, 0] });
    A.box(bw + 0.004, 0.004, bd + 0.004, 'solid', { tint: t, pos: [(i % 2) * 0.006, y + 0.002, 0], rot: [0, (i - 1) * 0.12, 0] });
    y += th;
  });
  return { assembly: A, collide: [], top: y };
}
/** Books standing in a row on a shelf. tints = spine colours. */
export function bookRow({ tints = ['#6b2d2d', '#2d3b55', '#3f5b3f', '#5a3b24', '#a07a30', '#40485c'], h = 0.22, d = 0.17 } = {}) {
  const A = new Assembly('book_row'); let x = 0;
  tints.forEach((t, i) => {
    const tw = 0.022 + ((i * 7) % 5) * 0.005, bh = h - ((i * 3) % 4) * 0.02;
    A.box(tw, bh, d, 'solid', { tint: t, pos: [x + tw / 2, bh / 2, 0], rot: [0, 0, i === tints.length - 1 ? -0.12 : 0] });
    A.box(tw - 0.004, bh - 0.01, d + 0.004, 'solid', { tint: '#e8dfc8', pos: [x + tw / 2, bh / 2, 0.002], rot: [0, 0, i === tints.length - 1 ? -0.12 : 0] });
    x += tw + 0.002;
  });
  A.at({ pos: [-x / 2, 0, 0] }, () => {}); // (centring handled by the manifest offset)
  return { assembly: A, collide: [], top: h, width: x };
}
export function playingCards() {
  const A = new Assembly('playing_cards');
  A.box(0.065, 0.014, 0.095, 'solid', { tint: '#ece6d6', pos: [0, 0.007, 0] });
  A.box(0.065, 0.004, 0.095, 'solid', { tint: '#6b2d2d', pos: [0, 0.002, 0] });
  return { assembly: A, collide: [], top: 0.014 };
}
export function roundTin({ tint = '#2d3b55' } = {}) {
  const A = new Assembly('round_tin');
  A.lathe([[0.04, 0], [0.042, 0.004], [0.042, 0.032], [0.038, 0.036]], 'solid', { tint }, 18);
  A.cyl(0.04, 0.04, 0.006, 'solid', { tint: '#d8d0b8', pos: [0, 0.038, 0] }, 18);
  return { assembly: A, collide: [], top: 0.042 };
}
export function frame({ w = 0.55, h = 0.42, t = 0.04, mat = '#e6dcc0', art = '#3a3326', gilt = true } = {}) {
  const A = new Assembly('frame');
  const fm = gilt ? 'gilt' : 'woodDark';
  A.box(w, t, 0.025, fm, { pos: [0, h / 2 - t / 2, 0] }); A.box(w, t, 0.025, fm, { pos: [0, -h / 2 + t / 2, 0] });
  A.box(t, h - 2 * t, 0.025, fm, { pos: [-w / 2 + t / 2, 0, 0] }); A.box(t, h - 2 * t, 0.025, fm, { pos: [w / 2 - t / 2, 0, 0] });
  A.box(w - 2 * t, h - 2 * t, 0.006, 'solid', { tint: mat, pos: [0, 0, -0.004] });
  A.box(w - 2 * t - 0.12, h - 2 * t - 0.1, 0.008, 'solid', { tint: art, pos: [0, 0, 0] });
  return { assembly: A, collide: [], top: 0 };
}
export function standingPhoto({ w = 0.09, h = 0.12 } = {}) {
  const A = new Assembly('standing_photo');
  A.box(w, h, 0.012, 'woodDark', { pos: [0, h / 2, 0], rot: [-0.18, 0, 0] });
  A.box(w - 0.016, h - 0.016, 0.006, 'solid', { tint: '#cfc5ae', pos: [0, h / 2, 0.005], rot: [-0.18, 0, 0] });
  return { assembly: A, collide: [], top: h };
}
export function aloe() {
  const A = new Assembly('aloe');
  A.lathe([[0.04, 0], [0.058, 0.01], [0.068, 0.09], [0.074, 0.1], [0.062, 0.105]], 'solid', { tint: '#a85d36' }, 16);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * PI * 2, tilt = 0.45 + (i % 3) * 0.12;
    A.add(new THREE.ConeGeometry(0.02, 0.2, 5), 'solid', { tint: '#5a7a3a', pos: [Math.cos(a) * 0.03, 0.2, Math.sin(a) * 0.03], rot: [Math.sin(a) * tilt, 0, -Math.cos(a) * tilt] });
  }
  return { assembly: A, collide: [], top: 0.3 };
}
export function figurine() {
  const A = new Assembly('figurine');
  A.cyl(0.03, 0.035, 0.015, 'brass', { pos: [0, 0.0075, 0] }, 10);
  A.lathe([[0.012, 0.015], [0.02, 0.05], [0.014, 0.09], [0.02, 0.11], [0.008, 0.13]], 'brass', {}, 10);
  A.sphere(0.014, 'brass', { pos: [0, 0.15, 0] });
  A.add(new THREE.ConeGeometry(0.02, 0.09, 4), 'brass', { pos: [0.03, 0.12, 0], rot: [0, 0, -0.9] });   // a wing / drape seen in R01
  return { assembly: A, collide: [], top: 0.17 };
}

// ---------------------------------------------------------------- rugs (flat, UVs 0..1 across the whole rug)
export function rug({ w, d, mat }) {
  const A = new Assembly('rug');
  A.box(w, 0.012, d, mat, { pos: [0, 0.006, 0] });
  return { assembly: A, collide: [], top: 0.012 };
}

// ---------------------------------------------------------------- window dressing
/** Pleated drape hanging from a rod: x = width across, y = down from the rod. */
export function drape({ w = 0.5, h = 2.4, pleats = 4, amp = 0.035, mat = 'drape', tint } = {}) {
  const A = new Assembly('drape');
  const g = clothGeo(pleats * 6, 10, (u, v) => [(u - 0.5) * w, -v * h, Math.sin(u * pleats * PI * 2) * amp * (0.55 + 0.45 * v)]);
  A.add(g, mat, { grain: 'x', tint });
  return { assembly: A, collide: [], top: 0 };
}
export function sheer({ w = 1.0, h = 2.2 } = {}) {
  const A = new Assembly('sheer');
  const g = clothGeo(18, 4, (u, v) => [(u - 0.5) * w, -v * h, Math.sin(u * 9 * PI) * 0.012]);
  A.add(g, 'sheer', { grain: 'x' });
  return { assembly: A, collide: [], top: 0 };
}
export function curtainRod({ l = 1.6 } = {}) {
  const A = new Assembly('curtain_rod');
  A.cyl(0.011, 0.011, l, 'brass', { rot: [0, 0, PI / 2] }, 10);
  for (const s of [-1, 1]) { A.sphere(0.024, 'brass', { pos: [s * (l / 2 + 0.02), 0, 0] }); A.cyl(0.006, 0.006, 0.05, 'brass', { pos: [s * (l / 2 - 0.1), 0, 0.03], rot: [PI / 2, 0, 0] }, 6); }
  return { assembly: A, collide: [], top: 0 };
}
export function wickerBasket({ r = 0.23, h = 0.28 } = {}) {
  const A = new Assembly('wicker_basket');
  A.lathe([[r * 0.8, 0], [r * 0.9, 0.02], [r, h * 0.6], [r * 1.05, h]], 'cane', { tint: '#b99a6a', grain: 'y' }, 20);
  A.torus(r * 1.03, 0.012, 'cane', { tint: '#a58650', pos: [0, h, 0], rot: [PI / 2, 0, 0] }, PI * 2, 6, 24);
  A.rbox(r * 1.5, 0.07, r * 1.3, 0.03, 'linen', { pos: [0, h - 0.01, 0], rot: [0, 0.4, 0] });
  A.tube([[-r * 1.02, h, 0], [-r * 0.9, h + 0.12, 0], [0, h + 0.2, 0], [r * 0.9, h + 0.12, 0], [r * 1.02, h, 0]], 0.01, 'cane', { tint: '#a58650' }, 16, 5);
  return { assembly: A, collide: [[0, h / 2, 0, r * 2.1, h, r * 2.1]], top: h };
}

// ---------------------------------------------------------------- fireplace details (object space: x = out from the wall)
export function barleyTwistColumn({ h = 1.30, r = 0.04 } = {}) {
  const A = new Assembly('fp_column');
  A.cyl(r * 1.5, r * 1.6, 0.06, 'ironBlack', { pos: [0, 0.03, 0] }, 14);
  A.cyl(r * 0.95, r * 0.95, h - 0.16, 'ironBlack', { pos: [0, 0.06 + (h - 0.16) / 2, 0] }, 12);
  for (let k = 0; k < 2; k++) {
    const pts = []; const turns = 5, n = 60;
    for (let i = 0; i <= n; i++) { const t = i / n, a = t * turns * PI * 2 + k * PI; pts.push([Math.cos(a) * r * 1.05, 0.08 + t * (h - 0.2), Math.sin(a) * r * 1.05]); }
    A.tube(pts, r * 0.34, 'ironBlack', {}, 60, 5);
  }
  A.cyl(r * 1.4, r * 1.2, 0.05, 'ironBlack', { pos: [0, h - 0.075, 0] }, 14);
  A.sphere(r * 1.3, 'ironBlack', { pos: [0, h - 0.03, 0], scale: [1, 0.55, 1] });
  return { assembly: A, collide: [], top: h };
}
/** Black iron band around the arched firebox opening (R02 shows the arched insert). Object space: face toward +z. */
export function fireboxSurround({ w = 0.60, h = 0.75, band = 0.055 } = {}) {
  const A = new Assembly('firebox_surround');
  const arch = (hw, top, n = 20) => { const pts = [[-hw, 0], [hw, 0], [hw, top - hw]]; for (let i = 1; i < n; i++) { const a = (i / n) * PI; pts.push([Math.cos(a) * hw, top - hw + Math.sin(a) * hw]); } pts.push([-hw, top - hw]); return pts; };
  const outer = new THREE.Shape(arch(w / 2 + band, h + band).map(([x, y]) => new THREE.Vector2(x, y)));
  const hole = new THREE.Path(arch(w / 2, h).map(([x, y]) => new THREE.Vector2(x, y)).reverse());
  outer.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(outer, { depth: 0.03, bevelEnabled: false, curveSegments: 10 });
  A.add(g, 'ironBlack', { pos: [0, 0, -0.015] });
  return { assembly: A, collide: [], top: 0 };
}

// ---------------------------------------------------------------- dressmaking props (R02, R03, R04)
/** Dressmaker's dummy: linen torso, black turned-wood neck cap, black shoulder adjusting knob, pole and tripod foot. */
export function dressForm() {
  const A = new Assembly('dress_form');
  const prof = [[0.0001, 0.93], [0.09, 0.94], [0.16, 1.0], [0.175, 1.1], [0.14, 1.2], [0.17, 1.3], [0.165, 1.4], [0.13, 1.47], [0.07, 1.52], [0.05, 1.55]];
  A.lathe(prof, 'linen', { tint: '#cdbf9f', scale: [1, 1, 0.78] }, 26);
  A.cyl(0.052, 0.058, 0.035, 'solid', { tint: '#16120e', pos: [0, 1.565, 0] }, 16);                       // black neck cap
  A.sphere(0.014, 'solid', { tint: '#16120e', pos: [0, 1.595, 0] });
  A.cyl(0.04, 0.04, 0.025, 'solid', { tint: '#16120e', pos: [0.15, 1.42, 0.0], rot: [0, 0, PI / 2] }, 14);   // shoulder knob (R02)
  A.cyl(0.015, 0.015, 0.70, 'woodDark', { pos: [0, 0.58, 0] }, 10);
  for (let i = 0; i < 3; i++) { const a = (i / 3) * PI * 2 + PI / 2; A.tube([[0, 0.24, 0], [Math.cos(a) * 0.12, 0.1, Math.sin(a) * 0.12], [Math.cos(a) * 0.26, 0.012, Math.sin(a) * 0.26]], 0.014, 'woodDark', {}, 10, 6); }
  return { assembly: A, collide: [[0, 0.8, 0, 0.5, 1.6, 0.5]], top: 0 };
}
/** Folding ironing board, pink cover. Long axis = z, height 0.83 m. */
export function ironingBoard({ l = 1.25, w = 0.34, h = 0.83 } = {}) {
  const A = new Assembly('ironing_board');
  const pts = []; for (let i = 0; i <= 12; i++) { const a = -PI / 2 + (i / 12) * PI; pts.push([Math.cos(a) * w / 2, l / 2 - w / 2 + Math.sin(a) * w / 2 * 0.0 + Math.sin(a) * w * 0.35]); }
  pts.push([-w / 2 * 0.55, -l / 2]); pts.push([w / 2 * 0.55, -l / 2]);
  A.rbox(w, 0.035, l, 0.016, 'linen', { tint: '#d9aaa0', pos: [0, h - 0.0175, 0] });
  A.plane(w + 0.04, 0.26, 'linen', { tint: '#d9aaa0', pos: [0.17 + 0.02, h - 0.14, 0.2], rot: [0, PI / 2, 0] });
  for (const z of [0.25, -0.25]) {
    A.tube([[-0.13, h - 0.04, z], [0.13, 0.02, z + 0.26]], 0.009, 'ironBlack', {}, 4, 5);
    A.tube([[0.13, h - 0.04, z], [-0.13, 0.02, z + 0.26]], 0.009, 'ironBlack', {}, 4, 5);
  }
  return { assembly: A, collide: [[0, h / 2, 0, w + 0.1, h, l]], top: h };
}
