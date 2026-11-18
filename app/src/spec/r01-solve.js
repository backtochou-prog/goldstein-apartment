// R01 single-image reconstruction (set photograph, Wizarding World fact file, catalogue F00001).
//
// Method: one-point perspective. The pocket-door wall is fronto-parallel in R01 (its casing
// verticals are vertical and its cornice is horizontal), so the camera has ~zero yaw, pitch and
// roll relative to that wall. For a pinhole camera with principal point at the vanishing point
// (vpX, horizonY) and focal length f (pixels), at camera height h:
//   depth of a floor point         Z = f * h / (y - horizonY)
//   lateral offset at depth Z      X = (x - vpX) * Z / f
//   height of an image point at Z  Y = h + (horizonY - y) * Z / f
// Widths and heights at a known depth do NOT depend on f; depths scale with f * h.
//
// Every pixel below was read off R01 (1800 x 1248) on gridded, zoomed crops
// (reference/analysis/r01/r01_grid.png). Change an assumption and everything downstream follows.

export const R01_IMAGE = { width: 1800, height: 1248, file: 'stills/SET/F00001_WW-FACTFILE_hp_apt1.png' };

// Assumptions: value, plausible range, and why.
export const ASSUMPTIONS = {
  cameraHeight: { v: 1.60, min: 1.45, max: 1.75, unit: 'm',
    why: 'Standing photographer eye height. Cross-checked by derived heights: dining-chair crest 0.98 m, chair seat 0.45 m, headboard 1.00 m, both wall sconces 1.85-1.87 m, sink-cabinet top 0.75 m.' },
  horizonY: { v: 420, min: 400, max: 440, unit: 'px',
    why: 'Kitchen shelf front edge (a receding line on the right wall) is almost level at y 438-447, so it sits just below eye level. Mantel, sink and table tops are seen from above; sconce shades and shelf brackets from below.' },
  vpX: { v: 1000, min: 950, max: 1080, unit: 'px',
    why: 'Shelf edge and left-cabinet cornice converge here at the horizon; the right-wall position derived from the right corner (x 1438) and from the sink cabinet end face (x 1790) then agree (1.81 m both).' },
  focalPx: { v: 1350, min: 1150, max: 1550, unit: 'px',
    why: 'Trefoil table-top ellipse (≈1340); spacing of the two end dining chairs (1.34 m apart for a 0.94 m table); twin bed length ≈1.95 m with a 1.0 m headboard. Equivalent to a ≈22 mm full-frame lens on the uncropped width.' },
  // object-size assumptions used only where a depth had to be closed
  bedLength: { v: 1.95, min: 1.85, max: 2.05, unit: 'm', why: 'Period twin bed incl. posts; places the back wall behind the headboards.' },
  mantelProjection: { v: 0.50, min: 0.25, max: 0.56, unit: 'm', why: 'Mantel shelf depth from the wall; places the fireplace along the left wall.' },
  tableHeight: { v: 0.76, min: 0.72, max: 0.79, unit: 'm', why: 'Standard dining height; places the table footprint.' },
};

// Raw pixel measurements in R01 (x right, y down). note = what it is.
export const PX = {
  doorFloorY:     { v: 807,  note: 'floor line under both pocket-door leaves (threshold), pocket-door wall' },
  doorHeadY:      { v: 105,  note: 'underside of the doorway head (top of clear opening)' },
  casingTopY:     { v: 0,    note: 'casing cornice reaches the top image edge: casing top is AT LEAST this high' },
  casingOuterL:   { v: 530,  note: 'outer edge of left casing' },
  casingOuterR:   { v: 1305, note: 'outer edge of right casing' },
  jambL:          { v: 580,  note: 'left jamb inner face (left leaf starts here)' },
  jambR:          { v: 1255, note: 'right jamb inner face (right leaf ends here)' },
  leafGapL:       { v: 670,  note: 'leading edge of left leaf in R01' },
  leafGapR:       { v: 1155, note: 'leading edge of right leaf in R01' },
  leftCornerX:    { v: 375,  note: 'left side wall meets the pocket-door wall (wallpaper changes from foreshortened to frontal)' },
  rightCornerX:   { v: 1440, note: 'right side wall meets the pocket-door wall (tone and pattern change at the top)' },
  skirtingTopY:   { v: 755,  note: 'top of skirting on the pocket-door wall right pier' },
  // back room (seen through the doorway)
  bedFootFloorY:  { v: 705,  note: 'floor contact of right twin-bed foot post' },
  headboardTopY:  { v: 505,  note: 'top of right headboard (check only)' },
  backCeilingY:   { v: 150,  note: 'back-room ceiling meets crown moulding on the window wall' },
  backCrownBotY:  { v: 185,  note: 'bottom of the back-room crown moulding' },
  pelmetTopY:     { v: 195,  note: 'top of window pelmets / curtain rods' },
  netsVisibleBotY:{ v: 450,  note: 'lowest point where window nets are still visible above the beds' },
  rodLeft:        { v: [675, 895],  note: 'left window curtain rod extent incl. finials' },
  rodRight:       { v: [935, 1160], note: 'right window curtain rod extent incl. finials' },
  // main room objects (footprints / checks)
  mantelEnd:      { v: [220, 512], note: 'right (doorward) end of the black mantel shelf, left wall' },
  fireColumnBot:  { v: [20, 1248], note: 'barley-twist column still running at the image bottom edge' },
  sconceLeft:     { v: [140, 330], note: 'two-arm sconce on the left wall (check)' },
  sconceRight:    { v: [420, 360], note: 'sconce on the left pier of the pocket-door wall (check)' },
  mirrorCornice:  { v: [425, 282], note: 'right end of the mirror-back cabinet cornice, left wall' },
  tableNear:      { v: [[770, 1010], 735], note: 'near edge of the dining table top (x extent, y)' },
  tableFar:       { v: 670,  note: 'far edge of the dining table top' },
  chairCrestNear: { v: [650, 1015], note: 'near chair: crest top y, feet y (check)' },
  rangeLegs:      { v: [[1330, 1460], 955], note: 'range: x extent, leg floor contact y' },
  sinkEndFace:    { v: [[1610, 1790], 790, 1120], note: 'sink cabinet end face: x extent, top y, floor y' },
  drainboardFar:  { v: [1445, 700], note: 'far (doorward) end of the drainboard' },
  shelfEdge:      { v: [[1545, 438], [1800, 447]], note: 'kitchen shelf front edge (receding)' },
  tapsPanel:      { v: [[1700, 1800], 600, 760], note: 'ceramic splashback panel with two taps (check)' },
  nearestFloorY:  { v: 1248, note: 'image bottom: nearest floor visible in R01' },
};

const val = (k) => ASSUMPTIONS[k].v;

/** Build all derived quantities for a given assumption set (defaults = central values). */
export function solveR01(over = {}) {
  const A = Object.fromEntries(Object.entries(ASSUMPTIONS).map(([k, o]) => [k, over[k] ?? o.v]));
  const { cameraHeight: h, horizonY: yh, vpX: xv, focalPx: f } = A;
  const Zfloor = (y) => (f * h) / (y - yh);
  const Xat = (x, Z) => ((x - xv) * Z) / f;
  const Hat = (y, Z) => h + ((yh - y) * Z) / f;

  const Zdoor = Zfloor(PX.doorFloorY.v);
  const XleftWall = Xat(PX.leftCornerX.v, Zdoor);
  const XrightWall = Xat(PX.rightCornerX.v, Zdoor);
  // world frame: x from left wall (0) to right; z = 0 on the pocket-door wall face (main-room side),
  // +z toward the R01 camera / unknown fourth wall; y up from the floor.
  const wx = (X) => X - XleftWall;
  const wz = (Z) => Zdoor - Z;

  const Zfoot = Zfloor(PX.bedFootFloorY.v);
  const Zback = Zfoot + A.bedLength;

  const tableNearZ = (f * (h - A.tableHeight)) / (PX.tableNear.v[1] - yh);
  const tableFarZ = (f * (h - A.tableHeight)) / (PX.tableFar.v - yh);

  // fireplace: mantel end lies mantelProjection off the left wall
  const XmantelFront = XleftWall + A.mantelProjection;
  const ZmantelEnd = (XmantelFront * f) / (PX.mantelEnd.v[0] - xv);
  // right wall cross-check from sink end face
  const Zsink = Zfloor(PX.sinkEndFace.v[2]);
  const XrightFromSink = Xat(PX.sinkEndFace.v[0][1], Zsink);
  const Zrange = Zfloor(PX.rangeLegs.v[1]);
  // drainboard far end: on the cabinet front line (0.45 off the right wall)
  const ZdrainFar = ((XrightWall - 0.45) * f) / (PX.drainboardFar.v[0] - xv);
  // mirror cabinet cornice end, cabinet front 0.45 off the left wall
  const ZmirrorEnd = ((XleftWall + 0.45) * f) / (PX.mirrorCornice.v[0] - xv);
  // sconces
  const ZsconceL = (XleftWall * f) / (PX.sconceLeft.v[0] - xv);

  const out = {
    assumptions: A,
    camera: { x: wx(0), y: h, z: wz(0), f, vpX: xv, horizonY: yh, image: R01_IMAGE },
    mainRoom: {
      width: XrightWall - XleftWall,
      leftWallX: 0, rightWallX: wx(XrightWall),
      leftPier: wx(Xat(PX.casingOuterL.v, Zdoor)),
      rightPier: wx(XrightWall) - wx(Xat(PX.casingOuterR.v, Zdoor)),
      skirtingHeight: Hat(PX.skirtingTopY.v, Zdoor),
      nearestVisibleFloorZ: wz(Zfloor(PX.nearestFloorY.v)),
      cameraZ: wz(0),
    },
    doorway: {
      casingOuterX: [wx(Xat(PX.casingOuterL.v, Zdoor)), wx(Xat(PX.casingOuterR.v, Zdoor))],
      clearX: [wx(Xat(PX.jambL.v, Zdoor)), wx(Xat(PX.jambR.v, Zdoor))],
      headHeight: Hat(PX.doorHeadY.v, Zdoor),
      casingTopMin: Hat(PX.casingTopY.v, Zdoor),
      leafEdgesR01X: [wx(Xat(PX.leafGapL.v, Zdoor)), wx(Xat(PX.leafGapR.v, Zdoor))],
    },
    backRoom: {
      backWallZ: wz(Zback),
      ceilingHeight: Hat(PX.backCeilingY.v, Zback),
      crownDepth: Hat(PX.backCeilingY.v, Zback) - Hat(PX.backCrownBotY.v, Zback),
      pelmetTop: Hat(PX.pelmetTopY.v, Zback),
      netsVisibleDownTo: Hat(PX.netsVisibleBotY.v, Zback),
      rodLeftX: PX.rodLeft.v.map((x) => wx(Xat(x, Zback))),
      rodRightX: PX.rodRight.v.map((x) => wx(Xat(x, Zback))),
      visibleBackWallX: [wx(Xat(PX.leafGapL.v, Zback)), wx(Xat(PX.leafGapR.v, Zback))],
      bedFootZ: wz(Zfoot),
      headboardHeightCheck: Hat(PX.headboardTopY.v, Zback),
    },
    fireplace: {
      mantelEndZ: wz(ZmantelEnd),
      mantelHeight: Hat(PX.mantelEnd.v[1], ZmantelEnd),
      // the barley-twist column (front face assumed 0.25 m off the wall) is still in frame at x=20,
      // so the surround reaches at least this far from the pocket-door wall
      columnReachesZ: wz(((XleftWall + 0.25) * f) / (PX.fireColumnBot.v[0] - xv)),
    },
    checks: {
      rightWallFromSink: wx(XrightFromSink),
      rightWallFromCorner: wx(XrightWall),
      sconceLeftHeight: Hat(PX.sconceLeft.v[1], ZsconceL),
      sconceRightHeight: Hat(PX.sconceRight.v[1], Zdoor),
      chairCrestHeight: h * (PX.chairCrestNear.v[1] - PX.chairCrestNear.v[0]) / (PX.chairCrestNear.v[1] - yh),
      sinkCabinetTop: Hat(PX.sinkEndFace.v[1], Zsink),
      tapsPanel: [Hat(PX.tapsPanel.v[2], (XrightWall * f) / (1750 - xv)), Hat(PX.tapsPanel.v[1], (XrightWall * f) / (1750 - xv))],
      shelfHeights: PX.shelfEdge.v.map(([x, y]) => Hat(y, (XrightWall * f) / (x - xv))),
      mirrorCorniceHeight: Hat(PX.mirrorCornice.v[1], ZmirrorEnd),
    },
    footprints: {
      table: { zNear: wz(tableNearZ), zFar: wz(tableFarZ),
        x: PX.tableNear.v[0].map((x) => wx(Xat(x, tableNearZ))) },
      sinkCabinetEndZ: wz(Zsink),
      drainboardFarZ: wz(ZdrainFar),
      rangeFrontZ: wz(Zrange),
      rangeX: PX.rangeLegs.v[0].map((x) => wx(Xat(x, Zrange))),
      mirrorCabinetEndZ: wz(ZmirrorEnd),
    },
  };
  return out;
}

/** Min/max of a derived scalar over the assumption ranges (corner sampling). */
export function rangeOf(getter) {
  const keys = ['cameraHeight', 'horizonY', 'vpX', 'focalPx'];
  let lo = Infinity, hi = -Infinity;
  for (let m = 0; m < 1 << keys.length; m++) {
    const over = {};
    keys.forEach((k, i) => { over[k] = (m >> i) & 1 ? ASSUMPTIONS[k].max : ASSUMPTIONS[k].min; });
    const v = getter(solveR01(over));
    lo = Math.min(lo, v); hi = Math.max(hi, v);
  }
  return [lo, hi];
}

// ------------------------------------------------------------------ Phase 3 helpers (object placement)
// Positions of objects are computed from pixel anchors through the same camera model, so they stay
// consistent with the architecture and follow any change of the solve assumptions.

/** World (x, z) of the point that appears at pixel (px, py) when it lies at `height` m above the floor. */
export function pointAtHeight(px, py, height = 0, over = {}) {
  const s = solveR01(over), { f, vpX, horizonY } = s.camera, h = s.assumptions.cameraHeight;
  const Z = (f * (h - height)) / (py - horizonY);
  return { x: s.camera.x + ((px - vpX) * Z) / f, z: s.camera.z - Z, Z };
}

/** z of the point at pixel column px on a vertical plane x = xWorld (a side wall, or a shelf face). */
export function zOnPlaneX(px, xWorld, over = {}) {
  const s = solveR01(over), { f, vpX } = s.camera;
  const Z = ((xWorld - s.camera.x) * f) / (px - vpX);
  return s.camera.z - Z;
}

/** Height of a point seen at pixel row py when it lies at world depth z (any x). */
export function heightAtDepth(py, z, over = {}) {
  const s = solveR01(over), { f, horizonY } = s.camera, h = s.assumptions.cameraHeight;
  const Z = s.camera.z - z;
  return h + ((horizonY - py) * Z) / f;
}

/** Pixel (x, y) of a world point seen by the solved R01 camera. */
export function projectR01(p, over = {}) {
  const s = solveR01(over), { f, vpX, horizonY } = s.camera;
  const Z = s.camera.z - p[2];
  return [vpX + ((p[0] - s.camera.x) * f) / Z, horizonY - ((p[1] - s.assumptions.cameraHeight) * f) / Z];
}
