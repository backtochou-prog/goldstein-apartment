// Kitchen run (right wall in R01): cast-iron range, sink unit with drainboard, ceramic splashback with two
// taps, wall shelf, and the household objects seen on and around them. Object space as in furniture.js.
import * as THREE from 'three';
import { Assembly } from '../kit.js';

const PI = Math.PI;

// ---------------------------------------------------------------- cast-iron range (front = +z)
export function range({ w = 0.60, d = 0.52, h = 0.88 } = {}) {
  const A = new Assembly('range');
  const legH = 0.17;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    A.lathe([[0.016, 0], [0.026, 0.02], [0.02, 0.07], [0.03, 0.12], [0.022, legH]], 'ironBlack', { pos: [sx * (w / 2 - 0.04), 0, sz * (d / 2 - 0.04)] });
  }
  A.box(w, h - legH - 0.05, d, 'ironBlack', { pos: [0, legH + (h - legH - 0.05) / 2, 0] });                         // firebox body
  A.box(w + 0.03, 0.05, d + 0.03, 'ironBlack', { pos: [0, h - 0.025, 0] });                                         // hob plate
  for (const [x, z, r] of [[-0.12, -0.08, 0.075], [0.13, -0.08, 0.075], [0, 0.12, 0.08]]) A.cyl(r, r, 0.012, 'ironBlack', { pos: [x, h + 0.004, z] }, 20);
  // oven door with panel and brass handle, lower ash door with brass knob
  A.box(w - 0.14, 0.30, 0.02, 'ironBlack', { pos: [0, 0.52, d / 2 + 0.008] });
  A.box(w - 0.22, 0.20, 0.012, 'ironBlack', { pos: [0, 0.52, d / 2 + 0.024] });
  A.tube([[-0.14, 0.62, d / 2 + 0.05], [-0.14, 0.62, d / 2 + 0.06], [0.14, 0.62, d / 2 + 0.06], [0.14, 0.62, d / 2 + 0.05]], 0.008, 'brass', {}, 12, 6);
  A.box(w - 0.2, 0.12, 0.02, 'ironBlack', { pos: [0, 0.29, d / 2 + 0.008] });
  A.sphere(0.017, 'brass', { pos: [0.18, 0.40, d / 2 + 0.05] });                                                      // brass damper knob (seen at the left in R01)
  // brass rail along the front of the hob
  A.cyl(0.009, 0.009, w + 0.06, 'brass', { pos: [0, h + 0.035, d / 2 + 0.02], rot: [0, 0, PI / 2] }, 8);
  for (const s of [-1, 1]) A.sphere(0.016, 'brass', { pos: [s * (w / 2 + 0.03), h + 0.035, d / 2 + 0.02] });
  return { assembly: A, collide: [[0, h / 2, 0, w + 0.03, h, d + 0.03]], top: h + 0.012 };
}

// ---------------------------------------------------------------- sink unit (front = +z; length along x)
// Cabinet carcass, ribbed wooden drainboard at the doorward end (x < 0 here), Belfast-style sink at the near end.
export function sinkUnit({ l = 1.07, d = 0.45, h = 0.75 } = {}) {
  const A = new Assembly('sink_unit');
  const sinkW = 0.55;
  A.box(l, h - 0.04, d, 'woodDark', { pos: [0, (h - 0.04) / 2, 0] });
  A.box(l + 0.03, 0.04, d + 0.03, 'woodDark', { pos: [0, h - 0.02, 0] });
  // front: doorward drawer + door, open middle section with curtain, end door panels
  A.box(0.32, 0.10, 0.02, 'woodMid', { pos: [-l / 2 + 0.2, h - 0.14, d / 2 + 0.002] });
  A.sphere(0.012, 'brass', { pos: [-l / 2 + 0.2, h - 0.14, d / 2 + 0.015] });
  A.box(0.32, 0.50, 0.02, 'woodMid', { pos: [-l / 2 + 0.2, 0.34, d / 2 + 0.002] });
  A.box(0.01, h - 0.1, d + 0.01, 'woodDark', { pos: [-l / 2 + 0.38, (h - 0.1) / 2 + 0.05, 0] });
  A.plane(0.34, 0.52, 'linen', { tint: '#aa9f7e', pos: [0.02, 0.36, d / 2 + 0.01] });                                 // gathered curtain below the sink
  A.plane(0.34, 0.52, 'linen', { tint: '#8f8567', pos: [0.02, 0.36, d / 2 + 0.014], scale: [0.5, 1, 1] });
  A.cyl(0.006, 0.006, 0.38, 'brass', { pos: [0.02, 0.63, d / 2 + 0.012], rot: [0, 0, PI / 2] }, 6);
  A.box(0.05, h - 0.06, 0.03, 'woodMid', { pos: [l / 2 - 0.30, (h - 0.06) / 2, d / 2 + 0.005] });
  A.box(0.28, 0.56, 0.02, 'woodMid', { pos: [l / 2 - 0.15, 0.37, d / 2 + 0.002] });
  // ribbed drainboard (doorward half of the top): board + ribs
  const dbL = l - sinkW - 0.02;
  A.box(dbL, 0.02, d - 0.02, 'woodMid', { pos: [-l / 2 + dbL / 2 + 0.01, h + 0.01, 0] });
  for (let i = 0; i < 10; i++) A.box(dbL - 0.04, 0.012, 0.02, 'woodMid', { pos: [-l / 2 + dbL / 2 + 0.01, h + 0.026, -d / 2 + 0.07 + i * ((d - 0.14) / 9)] });
  // Belfast sink: glazed box with a recessed basin (built from walls)
  const sx = l / 2 - sinkW / 2 - 0.005, sh = 0.20, t = 0.04;
  A.box(sinkW, sh - 0.06, d - 0.02, 'ceramic', { pos: [sx, h + (sh - 0.06) / 2, 0] });
  A.box(sinkW, 0.06, t, 'ceramic', { pos: [sx, h + sh - 0.03, d / 2 - 0.02 - t / 2] });
  A.box(sinkW, 0.06, t, 'ceramic', { pos: [sx, h + sh - 0.03, -d / 2 + 0.01 + t / 2] });
  for (const s of [-1, 1]) A.box(t, 0.06, d - 0.02, 'ceramic', { pos: [sx + s * (sinkW / 2 - t / 2), h + sh - 0.03, 0] });
  A.box(sinkW - 2 * t, 0.012, d - 0.02 - 2 * t, 'ceramic', { pos: [sx, h + sh - 0.052, 0], tint: '#e9dfc4' });          // basin floor (slightly lighter glaze)
  return { assembly: A, collide: [[0, h / 2, 0, l + 0.03, h, d + 0.03]], top: h + 0.02 };
}

// ---------------------------------------------------------------- ceramic splashback with two brass taps (front = +z)
export function splashback({ w = 0.62, h = 0.40 } = {}) {
  const A = new Assembly('splashback');
  A.box(w, h, 0.025, 'ceramic', { pos: [0, h / 2, 0] });
  A.box(w + 0.03, 0.03, 0.035, 'ceramic', { pos: [0, h + 0.015, 0.003] });
  for (const s of [-1, 1]) A.box(0.03, h, 0.032, 'ceramic', { pos: [s * (w / 2 + 0.005), h / 2, 0.003] });
  A.box(w - 0.08, h - 0.08, 0.008, 'ceramic', { pos: [0, h / 2, 0.016], tint: '#e0d4b2' });                          // raised panel
  for (const x of [-0.14, 0.14]) {
    A.lathe([[0.02, 0], [0.012, 0.02], [0.012, 0.05], [0.02, 0.07]], 'brass', { pos: [x, 0.16, 0.03], rot: [PI / 2, 0, 0] });
    A.tube([[x, 0.16, 0.08], [x, 0.17, 0.14], [x, 0.14, 0.18]], 0.011, 'brass', {}, 14, 6);                            // spout
    A.sphere(0.022, 'ceramic', { pos: [x, 0.25, 0.05], scale: [1, 1, 0.8] });                                          // porcelain handle
    A.cyl(0.007, 0.007, 0.09, 'brass', { pos: [x, 0.21, 0.04] }, 6);
  }
  return { assembly: A, collide: [], top: 0 };
}

// ---------------------------------------------------------------- wall shelf on scroll brackets (front = +z, runs along x)
export function wallShelf({ l = 1.50, d = 0.17 } = {}) {
  const A = new Assembly('wall_shelf');
  A.box(l, 0.028, d, 'woodMid', { pos: [0, 0, 0] });
  A.box(l, 0.014, 0.012, 'woodMid', { pos: [0, -0.02, d / 2] });
  for (const x of [-l / 2 + 0.12, 0, l / 2 - 0.12]) {   // cast scroll brackets, plate against the wall (local -z), arm under the board
    const zb = -d / 2, zf = d / 2 - 0.02;
    A.extrude([[zb, 0], [zf, 0], [zf, -0.012], [zf * 0.35, -0.06], [zb + 0.025, -0.15], [zb, -0.15]], 0.016, 'ironBlack', { pos: [x, -0.014, 0], rot: [0, -PI / 2, 0] });
  }
  for (let i = 0; i < 5; i++) A.cyl(0.003, 0.003, 0.03, 'brass', { pos: [-0.45 + i * 0.2, -0.045, d / 2 - 0.03] }, 5);   // hooks
  return { assembly: A, collide: [], top: 0.014 };
}

// ---------------------------------------------------------------- shelf and hanging objects
export function canister({ r = 0.055, h = 0.14, rim = '#4f6f4a', body = '#e6e2d4' } = {}) {
  const A = new Assembly('canister');
  A.cyl(r, r * 1.04, h, 'solid', { tint: body, pos: [0, h / 2, 0] }, 16);
  A.cyl(r * 1.02, r * 1.02, 0.014, 'solid', { tint: rim, pos: [0, h * 0.62, 0] }, 16);
  A.cyl(r * 1.0, r * 0.97, 0.025, 'solid', { tint: body, pos: [0, h + 0.012, 0] }, 16);
  A.sphere(0.016, 'solid', { tint: rim, pos: [0, h + 0.035, 0] });
  return { assembly: A, collide: [], top: h };
}
export function tinBox({ w = 0.07, h = 0.05, d = 0.05, tint = '#c9a227', band = '#2a2418' } = {}) {
  const A = new Assembly('tin');
  A.rbox(w, h, d, 0.004, 'solid', { tint, pos: [0, h / 2, 0] });
  A.box(w + 0.002, h * 0.22, d + 0.002, 'solid', { tint: band, pos: [0, h * 0.5, 0] });
  return { assembly: A, collide: [], top: h };
}
export function cartonBox({ w = 0.045, h = 0.10, d = 0.03, tint = '#3d5a80' } = {}) {
  const A = new Assembly('carton');
  A.box(w, h, d, 'solid', { tint, pos: [0, h / 2, 0] });
  A.box(w * 0.7, h * 0.3, d + 0.002, 'solid', { tint: '#e6dfc8', pos: [0, h * 0.55, 0] });
  return { assembly: A, collide: [], top: h };
}
export function storageJar({ r = 0.07, h = 0.17 } = {}) {
  const A = new Assembly('storage_jar');
  A.lathe([[r * 0.8, 0], [r, 0.01], [r, h * 0.9], [r * 0.85, h]], 'solid', { tint: '#e3dcc4' }, 18);
  A.cyl(r * 1.01, r * 1.01, 0.018, 'solid', { tint: '#7a9a6a', pos: [0, h * 0.55, 0] }, 18);
  A.cyl(r * 0.9, r * 0.9, 0.02, 'solid', { tint: '#e3dcc4', pos: [0, h + 0.01, 0] }, 16);
  return { assembly: A, collide: [], top: h };
}
export function mug({ tint = '#e8e0cc' } = {}) {
  const A = new Assembly('mug');
  A.lathe([[0.034, 0], [0.04, 0.01], [0.044, 0.09], [0.047, 0.095]], 'solid', { tint }, 14);
  A.cyl(0.044, 0.044, 0.012, 'solid', { tint: '#c7a95b', pos: [0, 0.075, 0] }, 14);
  A.torus(0.026, 0.006, 'solid', { tint, pos: [0.046, 0.05, 0], rot: [0, 0, 0] }, PI * 1.2, 6, 10);
  return { assembly: A, collide: [], top: 0.095 };
}

// ---------------------------------------------------------------- cookware
export function enamelPot({ r = 0.085, h = 0.14, tint = '#6b2e1a', lidTint } = {}) {
  const A = new Assembly('enamel_pot');
  A.lathe([[r * 0.9, 0], [r, 0.01], [r * 1.02, h * 0.95], [r * 0.98, h]], 'solid', { tint }, 20);
  A.lathe([[0.0001, h + 0.03], [r * 0.5, h + 0.02], [r * 0.95, h + 0.002], [r, h]], 'solid', { tint: lidTint || tint }, 20);
  A.sphere(0.014, 'solid', { tint: '#1a1410', pos: [0, h + 0.034, 0] });
  A.tube([[r * 1.0, h * 0.8, 0], [r * 1.5, h * 0.75, 0], [r * 1.9, h * 0.7, 0]], 0.009, 'ironBlack', {}, 8, 6);       // side handle (R01: long handle)
  return { assembly: A, collide: [], top: h };
}
export function speckledKettle({ r = 0.10, h = 0.11 } = {}) {
  const A = new Assembly('speckled_pot');
  A.lathe([[r * 0.85, 0], [r, 0.012], [r * 1.02, h * 0.95], [r * 0.98, h]], 'solid', { tint: '#7f8a98' }, 20);
  A.lathe([[0.0001, h + 0.035], [r * 0.45, h + 0.025], [r * 0.95, h + 0.003], [r, h]], 'solid', { tint: '#6f7a88' }, 20);
  A.tube([[-r, h * 0.7, 0], [-r * 1.45, h * 0.62, 0], [-r * 1.85, h * 0.55, 0]], 0.01, 'solid', { tint: '#2a2c30' }, 8, 6);
  A.tube([[-r * 0.9, h * 0.95, 0], [0, h + 0.09, 0], [r * 0.9, h * 0.95, 0]], 0.006, 'ironBlack', {}, 14, 6);
  return { assembly: A, collide: [], top: h };
}
export function potLid({ r = 0.075, tint = '#7a321c' } = {}) {
  const A = new Assembly('pot_lid');
  A.lathe([[0.0001, 0.03], [r * 0.5, 0.022], [r, 0.002]], 'solid', { tint }, 18);
  A.sphere(0.012, 'solid', { tint: '#1a1410', pos: [0, 0.034, 0] });
  return { assembly: A, collide: [], top: 0.03 };
}
/** Hanging utensils: origin at the hook, hanging down (-y). */
export function ladle() {
  const A = new Assembly('ladle');
  A.cyl(0.005, 0.005, 0.30, 'solid', { tint: '#8c969a', pos: [0, -0.15, 0] }, 6);
  A.sphere(0.04, 'solid', { tint: '#8c969a', pos: [0, -0.31, 0.02], scale: [1, 0.55, 1] });
  A.torus(0.012, 0.004, 'solid', { tint: '#8c969a', pos: [0, 0.0, 0] }, PI, 6, 10);
  return { assembly: A, collide: [], top: 0 };
}
export function skimmer() {
  const A = new Assembly('skimmer');
  A.cyl(0.065, 0.065, 0.004, 'solid', { tint: '#9fb0b8', pos: [0, -0.27, 0], rot: [PI / 2, 0, 0] }, 20);
  A.torus(0.065, 0.004, 'solid', { tint: '#8c969a', pos: [0, -0.27, 0] }, PI * 2, 6, 20);
  A.cyl(0.005, 0.005, 0.22, 'solid', { tint: '#8c969a', pos: [0, -0.11, 0] }, 6);
  return { assembly: A, collide: [], top: 0 };
}

/** Cast-iron back plate on the wall above the range (R01: dark panel against the right wall). Front = +z. */
export function castPlate({ w = 0.72, h = 0.58 } = {}) {
  const A = new Assembly('cast_plate');
  A.box(w, h, 0.03, 'ironBlack', { pos: [0, h / 2, 0.015] });
  A.box(w + 0.04, 0.03, 0.045, 'ironBlack', { pos: [0, h + 0.015, 0.02] });
  return { assembly: A, collide: [], top: 0 };
}
