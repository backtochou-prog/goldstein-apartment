// Static checks of the architectural spec and of the R01 camera model. Exit code 1 on failure.
import { buildSpec } from '../src/spec/apartment.js';
import { PX } from '../src/spec/r01-solve.js';
import { referenceCameras, projectToImage } from '../src/inspect/refcams.js';

const spec = buildSpec();
const s = spec.solve;
let fail = 0;
const ok = (c, msg) => { console.log(`${c ? 'PASS' : 'FAIL'} ${msg}`); if (!c) fail = 1; };

// 1. human-scale and VR clearances (architecture only; furniture comes later)
const D = spec.doorway;
ok(D.head >= 2.03, `doorway head ${D.head.toFixed(2)} m >= 2.03 m (comfortable for any adult + headset)`);
ok(D.clearX[1] - D.clearX[0] >= 0.85, `doorway clear width ${(D.clearX[1] - D.clearX[0]).toFixed(2)} m >= 0.85 m`);
const gap = D.leaves[1].r01Edge - D.leaves[0].r01Edge;
ok(gap >= 0.85, `gap between leaves in the R01 position ${gap.toFixed(2)} m >= 0.85 m (walkable as filmed)`);
for (const r of spec.rooms) ok(r.ceiling >= 2.4, `${r.id} ceiling ${r.ceiling.toFixed(2)} m >= 2.4 m`);
for (const w of spec.walls) {
  ok(w.to > w.from && w.thickness > 0 && w.height > 0, `wall ${w.id} has positive size`);
  for (const o of w.openings || []) ok(o.from >= w.from && o.to <= w.to && o.top <= w.height && o.bottom < o.top, `opening ${o.id} lies inside wall ${w.id}`);
  ok(!!w.status && (w.evidence.length > 0 || w.status === 'PROVISIONAL'), `wall ${w.id} carries status ${w.status} and evidence [${w.evidence.join(',')}]`);
}
const win = spec.walls.find((w) => w.id === 'backWindowWall').openings;
ok(win[0].to < win[1].from, 'windows do not overlap');
ok(win[0].from > spec.P.backRoomLeftX && win[1].to < spec.P.backRoomRightX, 'windows sit inside the back-room wall');
const F = spec.fireplace;
ok(F.zFrom > 0 && F.zTo < spec.P.mainRoomDepth, 'fireplace lies along the left wall inside the room');
ok(F.zFrom > spec.footprints.find((f) => f.id === 'mirrorCabinet').z[0], 'fireplace is nearer the camera than the mirror cabinet (R01 occlusion order)');

// 2. R01 reprojection: the built geometry, seen through the solved camera, must land on the measured pixels.
//    This verifies the implementation (spec + camera model) is consistent with the solve. It is not an
//    independent proof of the dimensions (they were derived from the same pixels).
const R = referenceCameras(spec).find((r) => r.id === 'R01');
const W = s.mainRoom.width;
const marks = [
  ['left corner at floor', [0, 0, 0], [PX.leftCornerX.v, PX.doorFloorY.v]],
  ['right corner at floor', [W, 0, 0], [PX.rightCornerX.v, PX.doorFloorY.v]],
  ['left casing outer, floor', [D.casing.outerX[0], 0, 0], [PX.casingOuterL.v, PX.doorFloorY.v]],
  ['right casing outer, floor', [D.casing.outerX[1], 0, 0], [PX.casingOuterR.v, PX.doorFloorY.v]],
  ['left jamb at head', [D.clearX[0], D.head, 0], [PX.jambL.v, PX.doorHeadY.v]],
  ['right jamb at head', [D.clearX[1], D.head, 0], [PX.jambR.v, PX.doorHeadY.v]],
  ['left rod left end at pelmet', [s.backRoom.rodLeftX[0], s.backRoom.pelmetTop, s.backRoom.backWallZ], [PX.rodLeft.v[0], PX.pelmetTopY.v]],
  ['right rod right end at pelmet', [s.backRoom.rodRightX[1], s.backRoom.pelmetTop, s.backRoom.backWallZ], [PX.rodRight.v[1], PX.pelmetTopY.v]],
  ['back ceiling line', [2, s.backRoom.ceilingHeight, s.backRoom.backWallZ], [null, PX.backCeilingY.v]],
  ['mantel end', [spec.P.fireplaceDepth, F.mantelHeight, F.zFrom], PX.mantelEnd.v],
];
for (const [n, p, [ex, ey]] of marks) {
  const [x, y] = projectToImage(R, p);
  const err = Math.hypot(ex == null ? 0 : x - ex, y - ey);
  ok(err <= 2.5, `R01 reprojection ${n}: (${x.toFixed(1)}, ${y.toFixed(1)}) vs (${ex ?? '-'}, ${ey})  err ${err.toFixed(2)} px`);
}

// 3. independent internal cross-checks (different image features must agree)
const c = s.checks;
ok(Math.abs(c.rightWallFromSink - c.rightWallFromCorner) < 0.10, `right wall from corner ${c.rightWallFromCorner.toFixed(2)} vs from sink cabinet ${c.rightWallFromSink.toFixed(2)} (< 0.10 m)`);
ok(Math.abs(c.sconceLeftHeight - c.sconceRightHeight) < 0.10, `two sconces on different walls at the same height: ${c.sconceLeftHeight.toFixed(2)} / ${c.sconceRightHeight.toFixed(2)} m`);
ok(c.chairCrestHeight > 0.85 && c.chairCrestHeight < 1.10, `dining-chair crest ${c.chairCrestHeight.toFixed(2)} m in the plausible 0.85-1.10 range`);
ok(Math.abs(s.backRoom.headboardHeightCheck - 1.0) < 0.15, `headboard ${s.backRoom.headboardHeightCheck.toFixed(2)} m (expected ~1.0)`);
ok(c.tapsPanel[0] > c.sinkCabinetTop, `tap panel bottom ${c.tapsPanel[0].toFixed(2)} m above sink-cabinet top ${c.sinkCabinetTop.toFixed(2)} m`);

console.log(fail ? '\nSPEC CHECK FAILED' : '\nSPEC CHECK PASSED');
process.exit(fail);
