// Larger furniture. Object space: origin on the floor at the footprint centre, +z = front, y up, metres.
// Each builder returns { assembly, collide: [[cx, cy, cz, w, h, d], ...], top?: height of the supporting surface }.
// Dimensions come from the R01 solve at each object's depth; carving is simplified (see FURNITURE_INVENTORY).
import * as THREE from 'three';
import { Assembly, bellProfile } from '../kit.js';

const PI = Math.PI;
const turnedLeg = (h, r) => [[r * 0.75, 0], [r, h * 0.03], [r * 1.45, h * 0.09], [r * 0.95, h * 0.16], [r * 0.78, h * 0.32], [r * 1.05, h * 0.5], [r * 0.85, h * 0.66], [r * 1.15, h * 0.9], [r, h]];

// ---------------------------------------------------------------- armchair (caned bergère)
export function armchair() {
  const A = new Assembly('armchair');
  const seatY = 0.36;
  for (const s of [-1, 1]) {
    const x = s * 0.31;
    // front legs: carved bulbous feet
    A.lathe([[0.030, 0], [0.042, 0.03], [0.056, 0.06], [0.042, 0.105], [0.028, 0.16], [0.034, 0.24], [0.040, 0.31], [0.036, seatY]], 'woodDark', { pos: [x, 0, 0.33] });
    A.taper(0.04, 0.04, 0.028, 0.028, seatY, 'woodDark', { pos: [x, seatY / 2, -0.37], rot: [-0.10, 0, 0] });         // raked rear legs
    // arms: rail, turned front post, scroll
    const ax = s * 0.335;
    A.box(0.056, 0.04, 0.64, 'woodDark', { pos: [ax, 0.675, -0.03] });
    A.lathe([[0.022, seatY], [0.03, 0.42], [0.022, 0.5], [0.034, 0.58], [0.028, 0.655]], 'woodDark', { pos: [ax, 0, 0.27] });
    A.sphere(0.042, 'woodDark', { pos: [ax, 0.675, 0.30], scale: [0.9, 0.75, 1.3] });
    A.torus(0.034, 0.017, 'woodDark', { pos: [ax, 0.655, 0.345], rot: [0, PI / 2, 0] }, PI * 1.3);
    A.box(0.014, 0.205, 0.54, 'cane', { pos: [ax, 0.5725, -0.02] });                                                  // cane side panel
    A.box(0.04, 0.03, 0.56, 'woodDark', { pos: [ax, 0.465, -0.02] });                                                  // rail under the cane
    // back posts
    A.taper(0.045, 0.04, 0.04, 0.04, 0.88, 'woodDark', { pos: [s * 0.335, 0.44, -0.40], rot: [-0.13, 0, 0] });
  }
  // seat rails; front rail carries three carved bosses
  A.box(0.66, 0.10, 0.04, 'woodDark', { pos: [0, seatY - 0.04, 0.34] });
  A.box(0.66, 0.10, 0.04, 'woodDark', { pos: [0, seatY - 0.04, -0.34] });
  for (const s of [-1, 1]) A.box(0.04, 0.10, 0.64, 'woodDark', { pos: [s * 0.335, seatY - 0.04, 0] });
  for (const x of [-0.2, 0, 0.2]) A.sphere(0.034, 'woodDark', { pos: [x, seatY - 0.04, 0.362], scale: [1.3, 1, 0.45] });
  A.torus(0.05, 0.012, 'woodDark', { pos: [-0.1, seatY - 0.04, 0.36] }, PI * 1.6); A.torus(0.05, 0.012, 'woodDark', { pos: [0.1, seatY - 0.04, 0.36], rot: [0, 0, PI] }, PI * 1.6);
  // crest rail (curved) and upholstered back
  A.extrude([[-0.37, 0], [0.37, 0], [0.37, 0.06], [0.2, 0.09], [0, 0.125], [-0.2, 0.09], [-0.37, 0.06]], 0.045, 'woodDark', { pos: [0, 0.77, -0.455], rot: [-0.13, 0, 0] });
  A.sphere(0.032, 'woodDark', { pos: [0, 0.885, -0.465], scale: [1.5, 1, 0.6] });
  A.rbox(0.60, 0.44, 0.075, 0.03, 'velvet', { pos: [0, 0.62, -0.37], rot: [-0.20, 0, 0] });
  A.box(0.62, 0.035, 0.05, 'woodDark', { pos: [0, 0.405, -0.385], rot: [-0.13, 0, 0] });
  // seat cushion
  A.rbox(0.64, 0.115, 0.62, 0.045, 'velvet', { pos: [0, seatY + 0.07, 0.005] });
  return { assembly: A, collide: [[0, 0.5, 0, 0.78, 1.0, 0.84]], top: seatY + 0.13 };
}

// ---------------------------------------------------------------- pressed-back chair
export function pressedBackChair() {
  const A = new Assembly('chair');
  const seatY = 0.45;
  for (const s of [-1, 1]) {
    A.lathe(turnedLeg(seatY - 0.02, 0.021), 'woodOak', { pos: [s * 0.19, 0, 0.17] });
    A.taper(0.030, 0.026, 0.026, 0.026, 0.97, 'woodOak', { pos: [s * 0.19, 0.485, -0.20], rot: [-0.085, 0, 0] }); // rake: back posts run to the crest
    A.cyl(0.011, 0.011, 0.38, 'woodOak', { pos: [s * 0.19, 0.17, -0.015], rot: [PI / 2, 0, 0] }, 8);          // side rungs
  }
  A.cyl(0.011, 0.011, 0.34, 'woodOak', { pos: [0, 0.17, 0.17], rot: [0, 0, PI / 2] }, 8);
  A.cyl(0.011, 0.011, 0.34, 'woodOak', { pos: [0, 0.17, -0.19], rot: [0, 0, PI / 2] }, 8);
  A.rbox(0.45, 0.032, 0.42, 0.014, 'woodOak', { pos: [0, seatY, 0] });                                              // saddle seat
  A.box(0.40, 0.05, 0.02, 'woodOak', { pos: [0, seatY - 0.045, 0.19] });
  // back: lower rail, six spindles, pressed crest
  A.box(0.34, 0.045, 0.02, 'woodOak', { pos: [0, 0.60, -0.222], rot: [-0.085, 0, 0] });
  for (let i = 0; i < 6; i++) A.cyl(0.0075, 0.0075, 0.20, 'woodOak', { pos: [-0.155 + i * 0.062, 0.72, -0.226], rot: [-0.085, 0, 0] }, 6);
  A.extrude([[-0.215, 0], [0.215, 0], [0.215, 0.05], [0.16, 0.085], [0.07, 0.10], [0, 0.125], [-0.07, 0.10], [-0.16, 0.085], [-0.215, 0.05]], 0.022, 'woodOak', { pos: [0, 0.835, -0.237], rot: [-0.085, 0, 0] });
  A.sphere(0.03, 'woodOak', { pos: [0, 0.89, -0.25], scale: [1.2, 0.9, 0.35] });                                   // pressed cartouche
  return { assembly: A, collide: [[0, 0.48, -0.02, 0.48, 0.97, 0.48]] };
}

// ---------------------------------------------------------------- dining table (long axis = z)
export function diningTable({ w = 0.72, l = 1.40, h = 0.74 } = {}) {
  const A = new Assembly('dining_table');
  A.rbox(w, 0.04, l, 0.05, 'woodOak', { pos: [0, h - 0.02, 0] });
  for (const s of [-1, 1]) A.box(0.03, 0.10, l - 0.16, 'woodOak', { pos: [s * (w / 2 - 0.07), h - 0.09, 0] });
  for (const s of [-1, 1]) A.box(w - 0.12, 0.10, 0.03, 'woodOak', { pos: [0, h - 0.09, s * (l / 2 - 0.07)] });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x = sx * (w / 2 - 0.07), z = sz * (l / 2 - 0.07);
    A.box(0.07, 0.12, 0.07, 'woodOak', { pos: [x, h - 0.10, z] });
    A.lathe(turnedLeg(h - 0.16, 0.032), 'woodOak', { pos: [x, 0, z] });
  }
  return { assembly: A, collide: [[0, h / 2, 0, w + 0.02, h, l + 0.02]], top: h };
}

// ---------------------------------------------------------------- trefoil two-tier side table
const trefoil = (R, k = 0.26, n = 48) => Array.from({ length: n }, (_, i) => { const a = (i / n) * PI * 2; const r = R * (1 + k * Math.cos(3 * a)) / (1 + k); return [Math.cos(a) * r, Math.sin(a) * r]; });
export function trefoilTable({ h = 0.58, R = 0.31 } = {}) {
  const A = new Assembly('trefoil_table');
  A.extrude(trefoil(R), 0.03, 'woodMid', { pos: [0, h - 0.015, 0], rot: [PI / 2, 0, 0] });
  A.extrude(trefoil(R * 0.92), 0.022, 'woodMid', { pos: [0, 0.20, 0], rot: [PI / 2, 0, 0] });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * PI * 2 + PI / 6; const x = Math.cos(a) * R * 0.62, z = Math.sin(a) * R * 0.62;
    A.lathe(turnedLeg(h - 0.03, 0.019), 'woodMid', { pos: [x, 0, z] });
  }
  return { assembly: A, collide: [[0, h / 2, 0, 0.66, h, 0.66]], top: h };
}

// ---------------------------------------------------------------- small tall stand table (cloth-covered)
export function standTable({ h = 0.84, r = 0.15, cloth = '#c27a2c' } = {}) {
  const A = new Assembly('stand_table');
  if (cloth) A.lathe([[0.0001, h + 0.004], [r + 0.02, h + 0.004], [r + 0.05, h - 0.06], [r + 0.06, h - 0.13]], 'solid', { tint: cloth }, 22);
  A.cyl(r, r, 0.025, 'woodMid', { pos: [0, h - 0.0125, 0] }, 20);
  for (let i = 0; i < 3; i++) { const a = (i / 3) * PI * 2; A.lathe(turnedLeg(h - 0.03, 0.016), 'woodMid', { pos: [Math.cos(a) * r * 0.7, 0, Math.sin(a) * r * 0.7] }); }
  A.cyl(r * 0.7, r * 0.7, 0.015, 'woodMid', { pos: [0, 0.22, 0] }, 16);
  return { assembly: A, collide: [[0, h / 2, 0, r * 2, h, r * 2]], top: h };
}

// ---------------------------------------------------------------- mirror-back sideboard (overmantel unit)
// Front faces +z. Width x = 1.27, depth z = 0.45. Counter 1.0 m, cornice 2.11 m (derived), crest to 2.32 m.
export function mirrorCabinet({ w = 1.27, d = 0.45, cH = 1.0, mirrorW = 0.95, mirrorX = 0 } = {}) {
  const A = new Assembly('mirror_cabinet');
  A.box(w - 0.04, 0.10, d - 0.04, 'woodMid', { pos: [0, 0.05, 0] });                                                // plinth
  A.box(w - 0.06, cH - 0.14, d - 0.06, 'woodMid', { pos: [0, 0.10 + (cH - 0.14) / 2, 0] });                         // carcass
  // lower fronts: two glazed doors (left 2/3) with fretwork, three drawers (right 1/3)
  const gx = -w / 2 + 0.04, gw = w * 0.62;
  for (let i = 0; i < 2; i++) {
    const x0 = gx + (gw / 2) * i + gw / 4;
    A.box(gw / 2 - 0.02, cH - 0.26, 0.02, 'woodMid', { pos: [x0, 0.52, d / 2 - 0.02] });
    A.box(gw / 2 - 0.12, cH - 0.38, 0.012, 'glass', { pos: [x0, 0.52, d / 2 - 0.005] });
    for (const dy of [-0.2, 0.2]) A.box(gw / 2 - 0.02, 0.03, 0.03, 'woodMid', { pos: [x0, 0.52 + dy, d / 2 - 0.01] });
  }
  const dx = w / 2 - 0.19;
  for (let i = 0; i < 3; i++) { A.box(0.30, 0.2, 0.02, 'woodMid', { pos: [dx, 0.2 + i * 0.22, d / 2 - 0.02] }); A.sphere(0.014, 'brass', { pos: [dx, 0.2 + i * 0.22, d / 2 - 0.005] }); }
  A.box(w + 0.03, 0.035, d + 0.04, 'woodMid', { pos: [0, cH + 0.0175, 0.01] });                                      // counter
  // mirror unit (narrower than the sideboard, R01): two turned columns, mirror, bottom rail, cornice, crest
  const mw = mirrorW, mb = cH + 0.07, mt = 2.08, cx = mirrorX;
  A.box(mw + 0.22, mt - cH, 0.04, 'woodMid', { pos: [cx, (mt + cH) / 2, -d / 2 + 0.03] });                          // backboard
  A.box(mw - 0.10, mt - mb - 0.1, 0.01, 'mirror', { pos: [cx, (mt + mb) / 2, -d / 2 + 0.056] });                    // glass
  for (const s of [-1, 1]) {
    A.lathe([[0.03, mb], [0.04, mb + 0.1], [0.028, mb + 0.3], [0.038, mb + 0.6], [0.028, mb + 0.85], [0.04, mt - 0.02]], 'woodMid', { pos: [cx + s * (mw / 2), 0, -d / 2 + 0.12] });
    A.box(0.07, mt - mb, 0.05, 'woodMid', { pos: [cx + s * (mw / 2 + 0.1), (mt + mb) / 2, -d / 2 + 0.065] });
  }
  A.box(mw + 0.16, 0.06, 0.04, 'woodMid', { pos: [cx, mb + 0.03, -d / 2 + 0.085] });                               // mirror bottom rail
  A.box(mw + 0.34, 0.05, 0.34, 'woodMid', { pos: [cx, mt + 0.025, -d / 2 + 0.17] });                               // cornice shelf
  A.box(mw + 0.1, 0.04, 0.04, 'woodMid', { pos: [cx, mt - 0.03, -d / 2 + 0.2] });
  const cw = (mw + 0.22) / 2;
  A.extrude([[-cw, 0], [cw, 0], [cw, 0.05], [cw * 0.5, 0.08], [0.1, 0.19], [-0.1, 0.19], [-cw * 0.5, 0.08], [-cw, 0.05]], 0.035, 'woodMid', { pos: [cx, mt + 0.05, -d / 2 + 0.035] });
  A.sphere(0.05, 'ironBlack', { pos: [cx, mt + 0.14, -d / 2 + 0.06], scale: [1.4, 1.2, 0.35] });
  return { assembly: A, collide: [[0, 1.05, 0, w + 0.05, 2.1, d + 0.05]], top: cH + 0.035 };
}

// ---------------------------------------------------------------- small glazed cabinet (lantern lamp on top)
export function smallCabinet({ w = 0.38, d = 0.38, h = 0.95 } = {}) {
  const A = new Assembly('small_cabinet');
  A.box(w, h - 0.04, d, 'woodMid', { pos: [0, (h - 0.04) / 2, 0] });
  A.box(w + 0.03, 0.04, d + 0.03, 'woodMid', { pos: [0, h - 0.02, 0] });
  A.box(w - 0.1, h - 0.3, 0.012, 'glass', { pos: [0, h / 2, d / 2 + 0.005] });
  A.box(w - 0.04, 0.04, 0.02, 'woodMid', { pos: [0, 0.12, d / 2 + 0.005] });
  A.box(0.34, 0.08, 0.34, 'woodMid', { pos: [0, 0.04, 0] });
  return { assembly: A, collide: [[0, h / 2, 0, w + 0.03, h, d + 0.03]], top: h };
}

// ---------------------------------------------------------------- twin bed (foot end = +z)
export function twinBed({ variant = 'white', w = 0.95, l = 1.95 } = {}) {
  const A = new Assembly('twin_bed');
  const hz = l / 2;
  // posts with ball finials; head higher than foot
  for (const s of [-1, 1]) {
    for (const [z, h] of [[hz - 0.03, 0.98], [-hz + 0.03, 1.12]]) {
      A.lathe([[0.025, 0], [0.032, 0.05], [0.026, 0.18], [0.036, 0.3], [0.028, 0.42], [0.034, h - 0.18], [0.024, h - 0.1], [0.03, h - 0.06]], 'woodDark', { pos: [s * (w / 2 - 0.03), 0, z] });
      A.sphere(0.04, 'woodDark', { pos: [s * (w / 2 - 0.03), h + 0.002, z] });
    }
  }
  // foot: turned rail (beaded) + panel; head: curved board
  A.box(w - 0.09, 0.06, 0.045, 'woodDark', { pos: [0, 0.82, hz - 0.03] });
  for (let i = 0; i < 9; i++) A.sphere(0.027, 'woodDark', { pos: [-0.33 + i * 0.0825, 0.585, hz - 0.03] });
  A.cyl(0.015, 0.015, w - 0.09, 'woodDark', { pos: [0, 0.585, hz - 0.03], rot: [0, 0, PI / 2] }, 8);
  A.extrude([[-0.43, 0], [0.43, 0], [0.43, 0.42], [0.2, 0.5], [0, 0.55], [-0.2, 0.5], [-0.43, 0.42]], 0.04, 'woodDark', { pos: [0, 0.56, -hz + 0.03] });
  for (const s of [-1, 1]) A.box(0.04, 0.20, l - 0.1, 'woodDark', { pos: [s * (w / 2 - 0.03), 0.33, 0] });
  // mattress, bedding, pillow
  A.rbox(w - 0.1, 0.20, l - 0.1, 0.05, 'linen', { pos: [0, 0.43, 0] });
  if (variant === 'pink') {
    A.rbox(w - 0.02, 0.06, 1.38, 0.03, 'coverlet', { pos: [0, 0.545, 0.2] });
    A.plane(1.30, 0.42, 'coverlet', { pos: [0.455, 0.35, 0.24], rot: [0, PI / 2, 0] });
    A.rbox(0.30, 0.20, 0.52, 0.06, 'linen', { pos: [0.55 - 0.1, 0.52, hz - 0.2], rot: [0, 0.2, 0] });             // white cloth over the foot
  } else {
    A.rbox(w - 0.02, 0.07, 1.38, 0.03, 'linen', { pos: [0, 0.55, 0.2] });
    A.plane(1.30, 0.42, 'linen', { pos: [-0.455, 0.35, 0.24], rot: [0, -PI / 2, 0] });
  }
  A.rbox(0.62, 0.12, 0.38, 0.05, 'linen', { pos: [0, 0.575, -hz + 0.28] });
  return { assembly: A, collide: [[0, 0.55, 0, w + 0.04, 1.1, l + 0.04]], top: 0.6 };
}

// ---------------------------------------------------------------- nightstand
export function nightstand({ w = 0.42, d = 0.36, h = 0.72 } = {}) {
  const A = new Assembly('nightstand');
  A.box(w, h - 0.04, d, 'woodDark', { pos: [0, (h - 0.04) / 2, 0] });
  A.box(w + 0.03, 0.035, d + 0.03, 'woodDark', { pos: [0, h - 0.0175, 0] });
  A.box(w - 0.06, h - 0.2, 0.014, 'woodMid', { pos: [0, h / 2 - 0.02, d / 2 + 0.004] });
  A.sphere(0.014, 'brass', { pos: [0.1, h / 2 - 0.05, d / 2 + 0.02] });
  A.box(w, 0.07, d, 'woodDark', { pos: [0, 0.035, 0] });
  return { assembly: A, collide: [[0, h / 2, 0, w + 0.03, h, d + 0.03]], top: h };
}

// ---------------------------------------------------------------- small round occasional table
export function roundTable({ h = 0.60, r = 0.24 } = {}) {
  const A = new Assembly('round_table');
  A.cyl(r, r, 0.03, 'woodDark', { pos: [0, h - 0.015, 0] }, 24);
  for (let i = 0; i < 3; i++) { const a = (i / 3) * PI * 2; A.tube([[Math.cos(a) * r * 0.75, h - 0.03, Math.sin(a) * r * 0.75], [Math.cos(a) * r * 0.9, h * 0.45, Math.sin(a) * r * 0.9], [Math.cos(a) * r * 0.7, 0.01, Math.sin(a) * r * 0.7]], 0.017, 'woodDark', {}, 14, 6); }
  return { assembly: A, collide: [[0, h / 2, 0, r * 2, h, r * 2]], top: h };
}

// ---------------------------------------------------------------- bookshelf (open, three shelves)
export function bookshelf({ w = 0.70, d = 0.28, h = 1.25 } = {}) {
  const A = new Assembly('bookshelf');
  for (const s of [-1, 1]) A.box(0.03, h, d, 'woodDark', { pos: [s * (w / 2 - 0.015), h / 2, 0] });
  for (const y of [0.05, 0.42, 0.80, h - 0.015]) A.box(w, 0.03, d, 'woodDark', { pos: [0, y, 0] });
  A.box(w - 0.04, h, 0.012, 'woodDark', { pos: [0, h / 2, -d / 2 + 0.006] });
  A.box(w + 0.04, 0.05, d + 0.03, 'woodDark', { pos: [0, h + 0.015, 0.005] });
  return { assembly: A, collide: [[0, h / 2, 0, w, h, d]], top: h };
}
