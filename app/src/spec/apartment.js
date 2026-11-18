// Goldstein apartment, architectural specification (Phase 2 greybox).
// Units: metres. Frame: x = 0 at the main-room LEFT wall (as seen in R01), +x to the right wall;
// z = 0 at the pocket-door wall face (main-room side), +z toward the R01 camera, -z into the back room;
// y = 0 at the floor, up.
//
// Status vocabulary (also used for colouring in the inspector):
//   DERIVED     measured from a reference image through the R01 solve (see r01-solve.js)
//   PROVISIONAL a placeholder value chosen to close the model; NOT a film measurement
//   LIMIT       an evidence boundary (not a wall seen in the film) so the space is closed and walkable
// Every element lists the evidence it rests on. Change a value here and the greybox follows.

import { solveR01 } from './r01-solve.js';

export function buildSpec(over = {}) {
  const s = solveR01(over.assumptions);
  const P = { // provisional parameters, all adjustable
    endWallThickness: 0.20,      // must house the pocket leaves; not visible in any reference
    sideWallThickness: 0.15,
    leafThickness: 0.045,
    leafOverlap: 0.03,           // leaves meet with a small overlap when closed
    casingTop: Math.max(3.40, s.doorway.casingTopMin), // R01 crops the cornice: at least casingTopMin
    casingProjection: 0.04,
    mainCeiling: s.backRoom.ceilingHeight, // main-room ceiling not visible; assumed equal to the back room
    mainRoomDepth: 6.0,          // fourth wall unseen; R01 camera stands at z≈5.6
    fireplaceWidth: 1.50,        // ≥ 0.74 m derived; full width unseen
    fireplaceDepth: s.assumptions.mantelProjection,   // = mantel projection assumption (Phase 3 correction C-1: 0.30 -> 0.50)
    fireboxW: 0.60, fireboxH: 0.75,
    backRoomLeftX: 0, backRoomRightX: s.mainRoom.rightWallX, // back-room side walls unseen
    windowWidth: 1.05, windowSill: 0.75, windowHead: 3.05,
    ...over.provisional,
  };
  const W = s.mainRoom.rightWallX;
  const T = P.endWallThickness;
  const zBackFace = -T;                       // back-room face of the pocket-door wall
  const zBackWall = s.backRoom.backWallZ;     // back-room window wall face
  const winCenters = [
    (s.backRoom.rodLeftX[0] + s.backRoom.rodLeftX[1]) / 2,
    (s.backRoom.rodRightX[0] + s.backRoom.rodRightX[1]) / 2,
  ];
  const [cx0, cx1] = s.doorway.clearX;
  const leafW = (cx1 - cx0) / 2 + P.leafOverlap;

  const rooms = [
    { id: 'main', name: 'Sitting room / kitchen / dining (script: SITTING ROOM, the kitchen)',
      x: [0, W], z: [0, P.mainRoomDepth], ceiling: P.mainCeiling,
      status: { width: 'DERIVED', depth: 'PROVISIONAL', ceiling: 'PROVISIONAL' },
      evidence: ['R01', 'SC41', 'SC44', 'S01'] },
    { id: 'back', name: "Back room with twin beds (script SC44-45 'back room'; probable men's bedroom)",
      x: [P.backRoomLeftX, P.backRoomRightX], z: [zBackWall, zBackFace], ceiling: s.backRoom.ceilingHeight,
      status: { width: 'PROVISIONAL', depth: 'DERIVED', ceiling: 'DERIVED' },
      evidence: ['R01', 'R04', 'R05', 'SC45'] },
  ];

  const walls = [
    // pocket-door wall (end wall of the main room), with the doorway opening
    { id: 'pocketWall', room: 'main/back', axis: 'x', at: -T / 2, thickness: T, from: 0, to: W, height: P.mainCeiling,
      openings: [{ id: 'doorway', from: cx0, to: cx1, bottom: 0, top: s.doorway.headHeight }],
      status: 'DERIVED', evidence: ['R01'], note: 'Width, piers, opening and head height derived from R01. Thickness provisional.' },
    { id: 'mainLeft', room: 'main', axis: 'z', at: -P.sideWallThickness / 2, thickness: P.sideWallThickness, from: 0, to: P.mainRoomDepth,
      height: P.mainCeiling, verifiedTo: s.fireplace.columnReachesZ, status: 'DERIVED', evidence: ['R01', 'R02', 'R03'],
      note: 'Position derived (left corner x 375 in R01). Seen in R01 from the corner to about z≈2.4; beyond that unseen.' },
    { id: 'mainRight', room: 'main', axis: 'z', at: W + P.sideWallThickness / 2, thickness: P.sideWallThickness, from: 0, to: P.mainRoomDepth,
      height: P.mainCeiling, verifiedTo: s.footprints.sinkCabinetEndZ, status: 'DERIVED', evidence: ['R01'],
      note: 'Position derived twice (corner x 1440; sink end face) = 4.39/4.40 m. Seen to about z≈2.5.' },
    { id: 'backWindowWall', room: 'back', axis: 'x', at: zBackWall - P.sideWallThickness / 2, thickness: P.sideWallThickness,
      from: P.backRoomLeftX, to: P.backRoomRightX, height: s.backRoom.ceilingHeight,
      openings: winCenters.map((c, i) => ({ id: `window${i + 1}`, from: c - P.windowWidth / 2, to: c + P.windowWidth / 2,
        bottom: P.windowSill, top: P.windowHead })),
      status: 'DERIVED', evidence: ['R01', 'R04', 'R05'],
      note: 'Depth from bed-length closure; window centres from curtain rods. Window size, sill and sash type provisional.' },
    { id: 'backLeft', room: 'back', axis: 'z', at: P.backRoomLeftX - P.sideWallThickness / 2, thickness: P.sideWallThickness,
      from: zBackWall, to: zBackFace, height: s.backRoom.ceilingHeight, status: 'PROVISIONAL', evidence: [],
      note: 'Not visible in any reference (hidden behind the left leaf). Placed in line with the main-room wall.' },
    { id: 'backRight', room: 'back', axis: 'z', at: P.backRoomRightX + P.sideWallThickness / 2, thickness: P.sideWallThickness,
      from: zBackWall, to: zBackFace, height: s.backRoom.ceilingHeight, status: 'PROVISIONAL', evidence: [],
      note: 'Not visible. R05 shows a bookshelf to the right of a bed, so there is wall or furniture there.' },
  ];

  const limits = [
    { id: 'fourthWallLimit', axis: 'x', at: P.mainRoomDepth, from: 0, to: W, height: P.mainCeiling, status: 'LIMIT',
      note: 'UNKNOWN fourth wall (entrance door, sitting-room windows and sofa per script are presumably here). Evidence limit only.' },
  ];

  const doorway = {
    id: 'pocketDoorway', clearX: [cx0, cx1], head: s.doorway.headHeight,
    casing: { outerX: s.doorway.casingOuterX, top: P.casingTop, projection: P.casingProjection,
      topStatus: 'MINIMUM (cropped in R01)' },
    leaves: [
      { id: 'leafL', width: leafW, thickness: P.leafThickness, closedFrom: cx0, side: 'left', r01Edge: s.doorway.leafEdgesR01X[0] },
      { id: 'leafR', width: leafW, thickness: P.leafThickness, closedFrom: cx1, side: 'right', r01Edge: s.doorway.leafEdgesR01X[1] },
    ],
    status: 'DERIVED', evidence: ['R01', 'R03', 'R04'],
    note: 'Two dark panelled pocket leaves. In R01 they are slid mostly into the wall. Leaf panelling detail is Phase 3.',
  };

  const fireplace = {
    id: 'fireplace', wall: 'mainLeft', zFrom: s.fireplace.mantelEndZ, zTo: s.fireplace.mantelEndZ + P.fireplaceWidth,
    depth: P.fireplaceDepth, mantelHeight: s.fireplace.mantelHeight, firebox: { w: P.fireboxW, h: P.fireboxH, arched: true },
    status: { doorwardEnd: 'DERIVED', mantelHeight: 'DERIVED', width: 'PROVISIONAL', firebox: 'PROVISIONAL' },
    evidence: ['R01', 'R02', 'R03', 'SC41'],
    note: 'Black ornate surround with barley-twist column (R01) and arched insert (R02). Chimney breast: unknown, not modelled.',
  };

  const trims = [
    { id: 'skirtingMain', room: 'main', height: s.mainRoom.skirtingHeight, depth: 0.025, status: 'DERIVED', evidence: ['R01'] },
    { id: 'crownBack', room: 'back', depth: s.backRoom.crownDepth, status: 'DERIVED', evidence: ['R01'],
      note: 'Crown moulding seen on the back-room window wall only; main-room crown unknown (not modelled).' },
    { id: 'pelmets', room: 'back', top: s.backRoom.pelmetTop, rods: [s.backRoom.rodLeftX, s.backRoom.rodRightX], status: 'DERIVED', evidence: ['R01'] },
  ];

  // Furniture footprints: NOT architecture. Flat outlines only, so circulation can be judged.
  const footprints = [
    { id: 'diningTable', x: s.footprints.table.x, z: [s.footprints.table.zFar, s.footprints.table.zNear], status: 'DERIVED', evidence: ['R01'] },
    { id: 'diningChairsZone', x: [s.footprints.table.x[0] - 0.5, s.footprints.table.x[1] + 0.5], z: [s.footprints.table.zFar - 0.5, s.footprints.table.zNear + 0.5], status: 'PROVISIONAL', evidence: ['R01'] },
    { id: 'mirrorCabinet', x: [0, 0.45], z: [s.footprints.mirrorCabinetEndZ, s.footprints.mirrorCabinetEndZ + 1.0], status: 'PROVISIONAL', evidence: ['R01', 'R02'] },
    { id: 'rangeStove', x: [s.footprints.rangeX[0], W], z: [s.footprints.rangeFrontZ - 0.65, s.footprints.rangeFrontZ], status: 'PROVISIONAL', evidence: ['R01'] },
    { id: 'sinkCabinet', x: [W - 0.45, W], z: [s.footprints.drainboardFarZ, s.footprints.sinkCabinetEndZ], status: 'DERIVED', evidence: ['R01'] },
    { id: 'twinBedLeft', x: [winCenters[0] - 0.42, winCenters[0] + 0.42], z: [zBackWall, s.backRoom.bedFootZ], status: 'PROVISIONAL', evidence: ['R01', 'R05'] },
    { id: 'twinBedRight', x: [winCenters[1] - 0.42, winCenters[1] + 0.42], z: [zBackWall, s.backRoom.bedFootZ], status: 'PROVISIONAL', evidence: ['R01', 'R05'] },
  ];

  const unknownZones = [
    { id: 'sistersBedroom', note: "Script SC45/52: 'the other room', street-facing window. Location unknown: not built." },
    { id: 'entrance', note: 'Apartment entrance door from the stair landing (SC40-41). Position unknown.' },
    { id: 'sittingRoomWindows', note: "Script SC41 'peeking out of the windows'. Not seen; presumably on the unseen fourth wall." },
    { id: 'hallToilet', note: "SC45 'down the hall to the right': outside the apartment." },
    { id: 'stairwell', note: 'SC40 stairwell and first landing: no image found.' },
  ];

  const camera = s.camera;
  const spawn = { x: 2.2, z: 4.6, yaw: 0 }; // inside the evidenced area, looking at the pocket doors

  return { solve: s, P, rooms, walls, limits, doorway, fireplace, trims, footprints, unknownZones, camera, spawn };
}
