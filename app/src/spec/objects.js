// Object placement manifest (Phase 3). One entry per identifiable interior object.
//
// Coordinates: the Phase 2 world frame (x from the main-room left wall, z from the pocket-door wall face,
// +z toward the R01 camera, y up, metres). Positions are COMPUTED from R01 pixel anchors through the same
// camera model as the architecture (r01-solve.js), so they move with the solve assumptions.
//
// Per object:
//   conf.existence   VERIFIED = visible in a catalogued image (T1/T3) | SCRIPT = only in the 2015 script
//   conf.position    VERIFIED  = located by an image anchor (floor/wall contact, or sitting on a located support)
//                                 within the solve uncertainty (about +-0.15 m laterally, +-15 % in depth)
//                    PROVISIONAL = the sight line is known but depth is not, or the spot is a stated placeholder
//   conf.orientation VERIFIED | PROVISIONAL
//   conf.dims        MEASURED = model size checked against the visible R01 pixel box | ESTIMATED | PROVISIONAL
//   fidelity         A custom silhouette matched to the image, carving simplified
//                    B recognisable form, proportions matched, details simplified
//                    C proportions only (reference shows too little to model more)
//   layer            R01 = the dressing visible in the set photograph; SC41 = script props, off by default
import { solveR01, pointAtHeight, zOnPlaneX } from './r01-solve.js';

const V = 'VERIFIED', PV = 'PROVISIONAL', M = 'MEASURED', E = 'ESTIMATED';

export function buildManifest(spec) {
  const S = solveR01(spec.__assumptions);
  const W = spec.rooms[0].x[1], F = spec.fireplace, P = spec.P;
  const zFp0 = F.zFrom, zFp1 = F.zTo, zFpMid = (zFp0 + zFp1) / 2;
  const zColA = 2.62, zColB = 3.30, zArch = (zColA + zColB) / 2;   // visible column at R01 x 0-100 px -> z about 2.6; arch centred between the columns (PROVISIONAL)
  const mirrorZ0 = 0.585, mirrorZ1 = zFp0 - 0.03;
  const wallX = W;                                   // right wall plane
  const shelfX = wallX - 0.085;                      // shelf board centre
  const shelfTop = S.checks.shelfHeights[0] + 0.014;
  const winL = (S.backRoom.rodLeftX), winR = (S.backRoom.rodRightX);
  const zWin = spec.rooms[1].z[0];                   // back window wall face (z)
  const bedZ = zWin + 1.95 / 2 + 0.03;
  const rodY = 3.0, rodZ = zWin + 0.14;
  const o = [];
  const add = (e) => o.push({ layer: 'R01', refs: ['R01'], relations: '', notes: '', anchors: [], ...e });

  // ================================================================ FIREPLACE AREA (left wall)
  add({ id: 'fp_column_far', name: 'Fireplace barley-twist column (doorward side of the arch)', group: 'Fireplace', room: 'main',
    model: ['barleyTwistColumn', { h: F.mantelHeight - 0.07 }], place: { pos: [F.depth + 0.005, 0, zColA] },
    support: 'floor', refs: ['R01', 'R02'], conf: { existence: V, position: PV, orientation: V, dims: E }, fidelity: 'B',
    relations: 'Flanks the arched firebox',
    bbox: [0, 880, 110, 1248], notes: 'R01 shows a black spiral-turned column at the left frame edge (x 0-100 px, y 1000-1248); the sight line puts it at z about 2.6. The number of columns is not established; one each side of the arch is the most economical reading, so the arch is centred between the two.' });
  add({ id: 'fp_column_near', name: 'Fireplace barley-twist column (camera side of the arch)', group: 'Fireplace', room: 'main',
    model: ['barleyTwistColumn', { h: F.mantelHeight - 0.07 }], place: { pos: [F.depth + 0.005, 0, zColB] },
    support: 'floor', refs: ['R01'], conf: { existence: V, position: PV, orientation: V, dims: E }, fidelity: 'B',
    notes: 'Out of frame in R01: placed symmetrically to the visible column.' });
  add({ id: 'fp_arch', name: 'Arched firebox surround (black iron band)', group: 'Fireplace', room: 'main',
    model: ['fireboxSurround', { w: P.fireboxW, h: P.fireboxH }], place: { pos: [F.depth + 0.003, 0.0, zArch] }, yaw: 90,
    support: 'fireplace (architecture)', refs: ['R02'], conf: { existence: V, position: PV, orientation: V, dims: PV }, fidelity: 'B',
    anchors: ['R02: arched insert between two spiral columns; centred between the two columns placed from R01'],
    notes: 'R02 shows the arched insert. Its size and height are not measurable in R01 (out of frame).' });
  add({ id: 'fp_picture', name: 'Framed picture above the mantel', group: 'Fireplace', room: 'main',
    model: ['frame', { w: 0.58, h: 0.44 }], place: { pos: [0.016, F.mantelHeight + 0.45, zArch] }, yaw: 90,
    support: 'chimney-breast wall', refs: ['R02'], conf: { existence: V, position: PV, orientation: V, dims: PV }, fidelity: 'C',
    relations: 'Above the mantel, centred on the surround',
    notes: 'R02 shows a gilt frame with a pale mat above the mantel. Its subject is not legible, so the print is a neutral dark panel (no invented artwork). Size and position are approximate.' });
  add({ id: 'fp_tin', name: 'Small round tin on the mantel', group: 'Fireplace', room: 'main',
    model: ['roundTin', { tint: '#34476a' }], place: { pos: [F.depth * 0.55, F.mantelHeight + 0.06, zOnPlaneX(35, F.depth * 0.55)] },
    support: 'mantel shelf', refs: ['R01'], conf: { existence: V, position: V, orientation: PV, dims: E }, fidelity: 'C',
    anchors: ['R01 (5-65, 470-495) blue round tin on the mantel at the left frame edge'], bbox: [5, 465, 68, 498],
    notes: 'The image row implies a mantel top near 1.41 m against the derived 1.35 m: inside the solve range (1.18-1.52 m). The tin is raised 0.06 m to match.' });

  // ================================================================ LEFT WALL RUN: small cabinet, mirror cabinet
  add({ id: 'small_cabinet', name: 'Small glazed cabinet (corner)', group: 'Storage', room: 'main',
    model: ['smallCabinet', { w: 0.38, d: 0.40, h: 1.08 }], place: { floor: [0.27, 0.22] }, yaw: 90,
    support: 'floor', refs: ['R01'], conf: { existence: V, position: PV, orientation: PV, dims: E }, fidelity: 'C',
    anchors: ['R01 (400-495, 505-650): lantern lamp and cabinet top; the body is hidden behind the stool and armchair'], bbox: [398, 505, 498, 650],
    notes: 'Only its top and lamp are visible. Position follows the sight line and the corner; depth is not independent evidence.' });
  add({ id: 'lantern_lamp', name: 'Lantern-style lamp on the small cabinet', group: 'Lighting', room: 'main',
    model: ['lanternLamp', {}], scale: [1.7, 0.9, 1.7], place: { on: 'small_cabinet', at: [0, 0], dy: 0 }, support: 'small_cabinet', refs: ['R01'],
    conf: { existence: V, position: V, orientation: PV, dims: E }, fidelity: 'B', bbox: [408, 505, 495, 548] });
  add({ id: 'mirror_cabinet', name: 'Mirror-back sideboard (overmantel unit)', group: 'Storage', room: 'main',
    model: ['mirrorCabinet', { w: mirrorZ1 - mirrorZ0, d: 0.45, cH: 1.08, mirrorW: 0.95, mirrorX: ((mirrorZ0 + mirrorZ1) / 2) - 1.02 }], place: { floor: [0.225, (mirrorZ0 + mirrorZ1) / 2] }, yaw: 90,
    support: 'floor', refs: ['R01', 'R02'], conf: { existence: V, position: V, orientation: V, dims: M }, fidelity: 'A',
    relations: 'Against the left wall between the small cabinet and the fireplace; two sconces flank the mirror',
    anchors: ['R01 cornice end (425, 282) = doorward end z 0.58', 'R01 cornice near end (165, 230) and the mantel end (225, 512): the unit ends where the fireplace begins'],
    bbox: [165, 145, 440, 600], notes: 'Cornice height 2.11 m derived. Mirror unit about 0.95 m between the columns, over the doorward half of a 1.4 m sideboard. Counter height 1.08 m adjusted so the counter items match their image rows. Fretwork, carving and the crest are simplified; lateral extent of the upper unit is about +-0.3 m.' });
  add({ id: 'sconce_far', name: 'Two-arm sconce, peach tulip shades (doorway end)', group: 'Lighting', room: 'main',
    model: ['sconce', {}], place: { pos: [S.camera.x + ((420 - S.camera.vpX) * (S.camera.z)) / S.camera.f, 1.78, 0.0] },
    support: 'pocket-door wall pier', refs: ['R01'], conf: { existence: V, position: V, orientation: V, dims: E }, fidelity: 'B',
    anchors: ['R01 (400-445, 335-392) on the left pier, right of the mirror unit'], bbox: [398, 330, 448, 395],
    notes: 'Height 1.85 m derived (shade centre). Mount type inferred.' });
  add({ id: 'sconce_near', name: 'Two-arm sconce, peach tulip shades (camera side of the mirror)', group: 'Lighting', room: 'main',
    model: ['sconce', {}], place: { pos: [0.20, 1.78, 1.62] },
    support: 'mirror_cabinet end', refs: ['R01'], conf: { existence: V, position: PV, orientation: V, dims: E }, fidelity: 'B',
    anchors: ['R01 (90-195, 280-375) at the near end of the mirror unit'], bbox: [88, 278, 198, 378],
    notes: 'It hangs off the near end of the unit in R01. Whether it is wall- or unit-mounted is not resolvable.' });
  add({ id: 'aloe', name: 'Aloe in a terracotta pot', group: 'Decor', room: 'main',
    model: ['aloe', {}], place: { onPx: 'mirror_cabinet', px: 362, dy: 0 }, support: 'mirror_cabinet counter', refs: ['R01'],
    conf: { existence: V, position: V, orientation: PV, dims: E }, fidelity: 'B', bbox: [322, 490, 404, 560] });
  add({ id: 'photo_a', name: 'Standing photograph (left)', group: 'Decor', room: 'main',
    model: ['standingPhoto', { w: 0.10, h: 0.16 }], place: { onPx: 'mirror_cabinet', px: 228, dy: 0.15 }, support: 'mirror frame (propped)',
    refs: ['R01'], conf: { existence: V, position: PV, orientation: PV, dims: E }, fidelity: 'C', bbox: [205, 450, 252, 525],
    notes: 'Photograph content is not legible: neutral grey card.' });
  add({ id: 'photo_b', name: 'Standing photograph (right)', group: 'Decor', room: 'main',
    model: ['standingPhoto', { w: 0.10, h: 0.14 }], place: { onPx: 'mirror_cabinet', px: 290, dy: 0.30 }, support: 'mirror frame (propped)',
    refs: ['R01'], conf: { existence: V, position: PV, orientation: PV, dims: E }, fidelity: 'C', bbox: [268, 455, 312, 525],
    notes: 'Stands about 0.3 m above the counter in the image rows, so it is tucked into the mirror frame or on a ledge there. The support is not resolvable; height follows the sight line.' });
  add({ id: 'figurine', name: 'Small bronze figurine', group: 'Decor', room: 'main',
    model: ['figurine', {}], place: { onPx: 'mirror_cabinet', px: 318, dy: 0.27 }, support: 'mirror frame ledge', refs: ['R01'],
    conf: { existence: V, position: PV, orientation: PV, dims: E }, fidelity: 'C', bbox: [288, 425, 346, 482],
    notes: 'A figure with a spread wing or drape; the pose is not resolvable. Modelled as an abstract bronze figure.' });
  add({ id: 'writing_case', name: 'Red-brown leather case on the counter', group: 'Decor', room: 'main',
    model: ['tinBox', { w: 0.30, h: 0.07, d: 0.20, tint: '#6b2d22', band: '#2a1a14' }], place: { onPx: 'mirror_cabinet', px: 245, dy: 0 }, yaw: 90,
    support: 'mirror_cabinet counter', refs: ['R01'], conf: { existence: V, position: V, orientation: PV, dims: E }, fidelity: 'C', bbox: [190, 555, 302, 586] });

  // ================================================================ TREFOIL TABLE GROUP
  add({ id: 'trefoil_table', name: 'Trefoil two-tier side table', group: 'Tables', room: 'main',
    model: ['trefoilTable', { h: 0.58, R: 0.27 }], place: { floor: [1.10, 2.72] },
    support: 'floor', refs: ['R01'], conf: { existence: V, position: V, orientation: PV, dims: M }, fidelity: 'A',
    anchors: ['R01 leg feet (185, 1235) -> (0.98, 2.93) and (345, 1195) -> (1.23, 2.79)'], bbox: [118, 880, 378, 1240],
    relations: 'In front of the fireplace; between the fireplace and the armchair' });
  add({ id: 'domed_lamp', name: 'Domed painted-glass table lamp', group: 'Lighting', room: 'main',
    model: ['domedGlassLamp', {}], place: { on: 'trefoil_table', at: [-0.19, 0.02], dy: 0 }, support: 'trefoil_table', refs: ['R01'],
    conf: { existence: V, position: V, orientation: V, dims: M }, fidelity: 'A', bbox: [115, 650, 302, 935],
    notes: 'Bronze stem, pale green-grey dome with an ornamental brass border.' });
  add({ id: 'tf_books', name: 'Books on the trefoil table', group: 'Decor', room: 'main',
    model: ['bookStack', { tints: ['#6b2d2d', '#2d3b55'], w: 0.15, d: 0.21 }], place: { on: 'trefoil_table', at: [-0.04, 0.21], dy: 0 }, yaw: 20,
    support: 'trefoil_table', refs: ['R01'], conf: { existence: V, position: V, orientation: PV, dims: E }, fidelity: 'C', bbox: [128, 925, 245, 978],
    notes: 'Titles and covers are not legible: plain cloth bindings in muted tones.' });
  add({ id: 'tf_tin', name: 'Small blue and white tin on the trefoil table', group: 'Decor', room: 'main',
    model: ['roundTin', { tint: '#2d3b55' }], place: { on: 'trefoil_table', at: [-0.12, 0.20], dy: 0.0 }, support: 'trefoil_table', refs: ['R01'],
    conf: { existence: V, position: V, orientation: PV, dims: E }, fidelity: 'C', bbox: [150, 922, 205, 960] });
  add({ id: 'tf_lower_books', name: 'Books on the lower shelf', group: 'Decor', room: 'main',
    model: ['bookStack', { tints: ['#2d3b55', '#5a3b24'], w: 0.14, d: 0.20 }], place: { on: 'trefoil_table', at: [-0.08, 0.13], dy: -0.37 }, yaw: -25,
    support: 'trefoil_table lower shelf', refs: ['R01'], conf: { existence: V, position: V, orientation: PV, dims: E }, fidelity: 'C', bbox: [195, 1075, 305, 1130] });
  add({ id: 'tf_cards', name: 'Playing cards on the lower shelf', group: 'Decor', room: 'main',
    model: ['playingCards', {}], place: { on: 'trefoil_table', at: [0.02, 0.16], dy: -0.31 }, yaw: 15, support: 'tf_lower_books', refs: ['R01'],
    conf: { existence: V, position: V, orientation: PV, dims: E }, fidelity: 'C', bbox: [228, 1055, 282, 1085] });

  // ================================================================ ARMCHAIR GROUP
  add({ id: 'armchair', name: 'Caned bergère armchair (green velvet)', group: 'Seating', room: 'main',
    model: ['armchair', {}], place: { floor: [1.72, 2.41] }, yaw: 15, support: 'floor', refs: ['R01'],
    conf: { existence: V, position: V, orientation: V, dims: M }, fidelity: 'A',
    anchors: ['R01 front feet (500, 1215) -> (1.57, 2.86) and (800, 1170) -> (2.15, 2.70); front edge runs 15 degrees off the camera plane'],
    bbox: [332, 748, 832, 1238], relations: 'Beside the trefoil table, on the foreground rug; faces the camera side of the room',
    notes: 'Carved dark frame, rolled arms, caned side panels, velvet seat and back. Foot carving is simplified.' });
  add({ id: 'cushion_ruched', name: 'Silver-grey ruched cushion', group: 'Textiles', room: 'main',
    model: ['ruchedCushion', {}], place: { on: 'armchair', at: [-0.20, -0.17], dy: 0.07 }, rot: [-68, 0, 0], support: 'armchair seat', refs: ['R01'],
    conf: { existence: V, position: V, orientation: PV, dims: E }, fidelity: 'B', bbox: [398, 765, 562, 935],
    relations: 'Leaning against the armchair back, left' });
  add({ id: 'cushion_floral', name: 'Floral tapestry cushion', group: 'Textiles', room: 'main',
    model: ['floralCushion', {}], place: { on: 'armchair', at: [-0.12, 0.20], dy: 0.0 }, rot: [-12, 8, 0], yaw: 8, support: 'armchair seat', refs: ['R01'],
    conf: { existence: V, position: V, orientation: PV, dims: E }, fidelity: 'C', bbox: [478, 895, 612, 1040],
    notes: 'Cushion exists with pink, orange and green floral tones. Pattern is drawn, not traced.' });
  add({ id: 'shawl', name: 'Patterned shawl over the armchair back', group: 'Textiles', room: 'main',
    model: ['shawl', {}], place: { on: 'armchair', at: [-0.13, -0.36], dy: 0.40 }, support: 'armchair back', refs: ['R01'],
    conf: { existence: V, position: V, orientation: PV, dims: E }, fidelity: 'C', bbox: [455, 735, 595, 858],
    notes: 'Gold, blue, rose and green floral silk. Pattern is drawn from tone only.' });
  add({ id: 'stand_table', name: 'Small tall stand table with orange cloth', group: 'Tables', room: 'main',
    model: ['standTable', { h: 0.84, r: 0.11 }], place: { px: [515, 628], h: 0.84, floorOf: true }, support: 'floor', refs: ['R01'],
    conf: { existence: V, position: PV, orientation: V, dims: PV }, fidelity: 'C', bbox: [486, 598, 546, 770],
    anchors: ['R01 (490-540, 600-765): cloth-covered top and legs; the foot is hidden behind the armchair'],
    notes: 'Height 0.84 m follows from the top row and the pocket-door wall limit; depth along the sight line is not independent.' });

  // ================================================================ DINING GROUP
  add({ id: 'dining_table', name: 'Dining table', group: 'Tables', room: 'main',
    model: ['diningTable', { w: 0.72, l: 1.40, h: 0.74 }], place: { floor: [2.30, 1.12] }, support: 'floor', refs: ['R01'],
    conf: { existence: V, position: V, orientation: V, dims: E }, fidelity: 'B', bbox: [760, 636, 1060, 746],
    anchors: ['R01 table top left end (768, 735) and far edge y ~640; end leg foot near (800, 960)'],
    relations: 'On the pink rug; four chairs. Long axis points at the pocket doors.' });
  const chair = (id, name, floor, yaw, conf, bbox, extra = '') => add({ id, name, group: 'Seating', room: 'main',
    model: ['pressedBackChair', {}], place: { floor }, yaw, support: 'floor', refs: ['R01'], conf, fidelity: 'B', bbox, notes: extra });
  chair('chair_near', 'Pressed-back chair, near end', [2.36, 1.80], 180, { existence: V, position: V, orientation: V, dims: M }, [838, 645, 1015, 1020], 'Spindle back seen from behind.');
  chair('chair_far', 'Pressed-back chair, far end', [2.26, 0.47], 0, { existence: V, position: PV, orientation: V, dims: E }, [858, 588, 988, 668], 'Only the crest and upper spindles are visible above the table.');
  chair('chair_left', 'Chair, left side', [1.80, 1.38], 90, { existence: V, position: PV, orientation: PV, dims: E }, [636, 640, 806, 985], 'Curved back posts: may be bentwood rather than pressed-back. Modelled as pressed-back; unresolved.');
  chair('chair_right', 'Chair, right side', [2.82, 1.32], -90, { existence: V, position: PV, orientation: PV, dims: E }, [1030, 608, 1152, 800], 'Only partly visible.');
  add({ id: 'rug_pink', name: 'Pink floral rug', group: 'Rugs', room: 'main',
    model: ['rug', { w: 2.10, d: 2.05, mat: 'rugPink' }], place: { floor: [2.23, 1.33] }, support: 'floor', refs: ['R01'],
    conf: { existence: V, position: V, orientation: V, dims: M }, fidelity: 'B', bbox: [606, 828, 1292, 1100],
    anchors: ['R01 near-right corner (1290, 1095) -> (3.27, 2.36); right edge runs to (1190, 830); left edge near (610, 860)'],
    notes: 'Extent measured from the visible corner and edges. Field and border tones sampled; the individual floral motifs are not resolvable and are drawn.' });
  add({ id: 'rug_oriental', name: 'Oriental rug (foreground)', group: 'Rugs', room: 'main',
    model: ['rug', { w: 3.10, d: 2.40, mat: 'rugOriental' }], place: { floor: [2.70, 3.63] }, support: 'floor', refs: ['R01'],
    conf: { existence: V, position: PV, orientation: V, dims: PV }, fidelity: 'C', bbox: [826, 1098, 1800, 1248],
    anchors: ['R01 far edge and fringe at y 1100-1125, x 830 to 1800+: z 2.43'],
    notes: 'Only the far edge and border are visible. Width and depth are PLACEHOLDERS; design drawn from the sampled tones.' });

  // ================================================================ KITCHEN (right wall)
  add({ id: 'range', name: 'Cast-iron range', group: 'Kitchen', room: 'main',
    model: ['range', { w: 0.83, d: 0.52, h: 0.80 }], place: { floor: [W - 0.445, 1.12] }, yaw: 0, support: 'floor', refs: ['R01'],
    conf: { existence: V, position: PV, orientation: PV, dims: E }, fidelity: 'B', bbox: [1296, 495, 1602, 962],
    anchors: ['R01 leg feet y ~955 at x 1330-1460 -> front plane z 1.54 (+-0.4); front leg x 3.57'],
    relations: 'First item of the kitchen run, ahead of the sink unit', notes: 'Orientation is the main uncertainty: R01 reads best with the oven front facing the camera side. Film frames will decide.' });
  add({ id: 'range_backplate', name: 'Cast-iron back plate above the range', group: 'Kitchen', room: 'main',
    model: ['castPlate', { w: 0.72, h: 0.58 }], place: { pos: [wallX - 0.015, 0.80, 1.16] }, yaw: -90, support: 'right wall', refs: ['R01'],
    conf: { existence: V, position: V, orientation: V, dims: M }, fidelity: 'C', bbox: [1500, 495, 1604, 640],
    anchors: ['R01 dark panel (1510-1600, 495-620) on the right wall -> z 0.80-1.52, top 1.36 m'] });
  const potBase = { group: 'Kitchen', room: 'main', refs: ['R01'], fidelity: 'B' };
  add({ ...potBase, id: 'pot_brown', name: 'Brown enamel saucepan with lid', model: ['enamelPot', { r: 0.085, h: 0.14 }], place: { onPx: 'range', anchor: [1452, 654] }, support: 'range hob',
    conf: { existence: V, position: V, orientation: PV, dims: E }, bbox: [1402, 598, 1506, 668] });
  add({ ...potBase, id: 'kettle_speckled', name: 'Grey speckled enamel pot', model: ['speckledKettle', { r: 0.085, h: 0.10 }], place: { onPx: 'range', anchor: [1531, 660] }, support: 'range hob',
    conf: { existence: V, position: V, orientation: PV, dims: E }, bbox: [1498, 598, 1604, 672] });
  add({ ...potBase, id: 'lid_brown', name: 'Brown enamel lid (resting)', model: ['potLid', {}], place: { onPx: 'range', anchor: [1470, 668] }, support: 'range hob',
    conf: { existence: V, position: PV, orientation: PV, dims: E }, fidelity: 'C', bbox: [1440, 650, 1505, 672],
    notes: 'A second brown lid lies on the hob in front of the pot (R01 (1440-1505, 650-672)); exact spot follows the sight line.' });
  add({ id: 'sink_unit', name: 'Sink cabinet with drainboard and Belfast sink', group: 'Kitchen', room: 'main',
    model: ['sinkUnit', { l: 1.07, d: 0.45, h: 0.75 }], place: { floor: [wallX - 0.225, 1.965] }, yaw: -90, support: 'floor', refs: ['R01'],
    conf: { existence: V, position: V, orientation: V, dims: M }, fidelity: 'A', bbox: [1442, 688, 1798, 1128],
    anchors: ['R01 end face (1610-1790, 790-1120) -> z 2.50; drainboard far end (1445, 700) -> z 1.43'],
    relations: 'Against the right wall after the range; the splashback and taps are above it' });
  add({ id: 'splashback', name: 'Ceramic splashback with two brass taps', group: 'Kitchen', room: 'main',
    model: ['splashback', { w: 0.62, h: 0.40 }], place: { pos: [wallX - 0.0125, 0.78, 2.35] }, yaw: -90, support: 'right wall', refs: ['R01'],
    conf: { existence: V, position: V, orientation: V, dims: M }, fidelity: 'A', bbox: [1695, 590, 1800, 765],
    anchors: ['R01 taps at x 1730 and 1785 -> z 2.21 and 2.49'] });
  add({ id: 'wall_shelf', name: 'Kitchen wall shelf on iron brackets', group: 'Kitchen', room: 'main',
    model: ['wallShelf', { l: 1.55, d: 0.17 }], place: { pos: [shelfX, shelfTop - 0.014, 1.825] }, yaw: -90, support: 'right wall', refs: ['R01'],
    conf: { existence: V, position: V, orientation: V, dims: M }, fidelity: 'B', bbox: [1542, 432, 1800, 520],
    anchors: ['R01 front edge (1545, 438) and (1800, 447): level at 1.54 m'], notes: 'It runs out of frame at the right: its far end (z about 2.6) is a placeholder.' });
  const shelfItem = (id, name, model, px, tint, bbox, extra = {}) => add({ id, name, group: 'Kitchen', room: 'main', model, place: { wallR: { px, x: shelfX, y: shelfTop } },
    support: 'wall_shelf', refs: ['R01'], conf: { existence: V, position: V, orientation: PV, dims: E }, fidelity: 'C', bbox, ...extra });
  shelfItem('canister_a', 'White lidded canister (1)', ['canister', { r: 0.045, h: 0.125 }], 1612, null, [1597, 375, 1631, 438], { fidelity: 'B' });
  shelfItem('canister_b', 'White lidded canister (2)', ['canister', { r: 0.045, h: 0.125 }], 1641, null, [1622, 378, 1662, 438], { fidelity: 'B' });
  shelfItem('carton_blue', 'Blue carton', ['cartonBox', { w: 0.04, h: 0.15, d: 0.03, tint: '#3d5a80' }], 1675, null, [1660, 372, 1690, 438]);
  shelfItem('tin_green', 'Green tin', ['tinBox', { w: 0.06, h: 0.045, d: 0.045, tint: '#3f6b5c', band: '#2a4a3e' }], 1700, null, [1690, 405, 1712, 438]);
  shelfItem('tin_yellow', 'Yellow patterned tin', ['tinBox', { w: 0.08, h: 0.06, d: 0.06, tint: '#c9a227', band: '#2a2418' }], 1727, null, [1712, 398, 1745, 440]);
  shelfItem('jar_cream', 'Large cream storage jar', ['storageJar', { r: 0.075, h: 0.17 }], 1773, null, [1746, 380, 1800, 440], { fidelity: 'B', notes: 'A printed label begins "CU..." in R01; the text is not legible, so none is modelled.' });
  for (const [i, px] of [1642, 1665, 1690].entries()) add({ id: `mug_${'abc'[i]}`, name: `Cup hanging under the shelf (${i + 1})`, group: 'Kitchen', room: 'main',
    model: ['mug', {}], place: { wallR: { px, x: shelfX - 0.01, y: shelfTop - 0.17 } }, support: 'wall_shelf hooks', refs: ['R01'],
    conf: { existence: V, position: V, orientation: PV, dims: E }, fidelity: 'C', bbox: [1625 + i * 22, 452, 1652 + i * 22, 508] });
  add({ id: 'skimmer', name: 'Perforated skimmer on a hook', group: 'Kitchen', room: 'main',
    model: ['skimmer', {}], place: { wallR: { px: 1583, x: wallX - 0.07, y: 1.50 } }, support: 'right wall', refs: ['R01'],
    conf: { existence: V, position: V, orientation: PV, dims: E }, fidelity: 'C', bbox: [1560, 505, 1604, 590] });
  add({ id: 'ladle', name: 'Ladle on a hook', group: 'Kitchen', room: 'main',
    model: ['ladle', {}], place: { wallR: { px: 1606, x: wallX - 0.07, y: 1.50 } }, support: 'right wall', refs: ['R01'],
    conf: { existence: V, position: V, orientation: PV, dims: E }, fidelity: 'C', bbox: [1588, 450, 1625, 545] });

  // ================================================================ BACK ROOM
  const bedX = [1.25, 3.08];
  add({ id: 'bed_left', name: 'Twin bed, left (white spread)', group: 'Bedroom', room: 'back',
    model: ['twinBed', { variant: 'white' }], place: { floor: [bedX[0], bedZ] }, support: 'floor', refs: ['R01'],
    conf: { existence: V, position: V, orientation: V, dims: M }, fidelity: 'B', bbox: [676, 498, 868, 712],
    anchors: ['R01 foot posts at y ~705 -> z -2.0 (derived)'], relations: 'Head against the window wall, left of the nightstand' });
  add({ id: 'bed_right', name: 'Twin bed, right (pink coverlet)', group: 'Bedroom', room: 'back',
    model: ['twinBed', { variant: 'pink' }], place: { floor: [bedX[1] - 0.10, bedZ] }, support: 'floor', refs: ['R01', 'R05'],
    conf: { existence: V, position: V, orientation: V, dims: M }, fidelity: 'B', bbox: [940, 498, 1158, 712],
    notes: 'Dark turned posts with ball finials, curved headboard, beaded foot rail (R01, R05). The foot of this bed carries a draped white cloth.' });
  add({ id: 'nightstand', name: 'Nightstand between the windows', group: 'Bedroom', room: 'back',
    model: ['nightstand', { h: 0.82 }], place: { floor: [(winL[1] + winR[0]) / 2, zWin + 0.21] }, support: 'floor', refs: ['R01', 'R04', 'R05'],
    conf: { existence: V, position: V, orientation: V, dims: E }, fidelity: 'B', bbox: [872, 524, 950, 600] });
  add({ id: 'nightstand_lamp', name: 'Amber fringed lamp on the nightstand', group: 'Lighting', room: 'back',
    model: ['fringedLamp', { tint: '#e2b46a', baseTint: '#5a3b24', h: 0.30, shadeR: 0.13 }], place: { on: 'nightstand', at: [0, 0], dy: 0 }, support: 'nightstand',
    refs: ['R01', 'R04', 'R05'], conf: { existence: V, position: V, orientation: V, dims: E }, fidelity: 'B', bbox: [885, 458, 940, 500] });
  add({ id: 'nightstand_photo', name: 'Small framed photograph on the nightstand', group: 'Decor', room: 'back',
    model: ['standingPhoto', { w: 0.07, h: 0.09 }], place: { on: 'nightstand', at: [0.13, 0.05], dy: 0 }, yaw: -10, support: 'nightstand', refs: ['R05'],
    conf: { existence: V, position: PV, orientation: PV, dims: E }, fidelity: 'C', notes: 'R05 shows a small frame and a pink tin beside the bedside lamp.' });
  add({ id: 'nightstand_tin', name: 'Small pink tin on the nightstand', group: 'Decor', room: 'back',
    model: ['roundTin', { tint: '#c88a8a' }], place: { on: 'nightstand', at: [-0.14, 0.06], dy: 0 }, support: 'nightstand', refs: ['R05'],
    conf: { existence: V, position: PV, orientation: PV, dims: E }, fidelity: 'C', notes: 'R05 shows a pink tin beside the bedside lamp; its exact spot on the nightstand is a placeholder.' });
  add({ id: 'round_table', name: 'Small round table, left', group: 'Tables', room: 'back',
    model: ['roundTable', {}], place: { floor: [0.78, -1.55] }, support: 'floor', refs: ['R01'],
    conf: { existence: V, position: PV, orientation: PV, dims: E }, fidelity: 'C', bbox: [660, 598, 740, 700],
    notes: 'R01 shows a small round table with slim legs left of the left bed. Its depth is not independent evidence.' });
  add({ id: 'standard_lamp', name: 'Standard lamp with pink fringed shade', group: 'Lighting', room: 'back',
    model: ['standardLamp', { h: 1.65 }], place: { floor: [0.62, -3.22] }, support: 'floor', refs: ['R01'],
    conf: { existence: V, position: PV, orientation: V, dims: PV }, fidelity: 'C', bbox: [672, 385, 724, 470],
    notes: 'Only the shade is visible in R01; the sight line puts it beside the left bed head (z about -3.2). Pole and base are inferred (a floor lamp is the only reading that fits the shade height).' });
  add({ id: 'basket', name: 'Wicker laundry basket', group: 'Bedroom', room: 'back',
    model: ['wickerBasket', { r: 0.2, h: 0.26 }], place: { floor: [bedX[1] - 0.1, bedZ + 0.55] }, noCollide: true, support: 'floor (under the right bed)', refs: ['R01'],
    conf: { existence: V, position: PV, orientation: V, dims: E }, fidelity: 'B', bbox: [1036, 636, 1134, 702],
    notes: 'It appears to stand under the right bed, beside the foot, with white linen in it.' });
  for (const [i, w] of [winL, winR].entries()) {
    const rodL = w[1] - w[0];
    add({ id: `rod_${i ? 'right' : 'left'}`, name: `Curtain rod and finials, ${i ? 'right' : 'left'} window`, group: 'Textiles', room: 'back',
      model: ['curtainRod', { l: rodL - 0.08 }], place: { pos: [(w[0] + w[1]) / 2, rodY, rodZ] }, support: 'window wall', refs: ['R01'],
      conf: { existence: V, position: V, orientation: V, dims: M }, fidelity: 'B', bbox: [i ? 932 : 672, 210, i ? 1162 : 898, 224] });
    const outerX = i ? w[1] - 0.20 : w[0] + 0.20, innerX = i ? w[0] + 0.15 : w[1] - 0.22;
    add({ id: `drape_outer_${i ? 'right' : 'left'}`, name: `Outer drape, ${i ? 'right' : 'left'} window (dark blue-grey)`, group: 'Textiles', room: 'back',
      model: ['drape', { w: 0.40, h: rodY, pleats: 4, amp: 0.04, mat: 'drape' }], place: { pos: [outerX, rodY, rodZ + 0.05] }, support: 'rod', refs: ['R01', 'R05'],
      conf: { existence: V, position: V, orientation: V, dims: E }, fidelity: 'B', bbox: i ? [1080, 200, 1162, 520] : [672, 200, 748, 520] });
    add({ id: `drape_inner_${i ? 'right' : 'left'}`, name: `Inner drape, ${i ? 'right' : 'left'} window (blue and gold floral)`, group: 'Textiles', room: 'back',
      model: ['drape', { w: 0.30, h: rodY, pleats: 3, amp: 0.035, mat: 'curtainFloral' }], place: { pos: [innerX, rodY, rodZ + 0.05] }, support: 'rod', refs: ['R01', 'R05'],
      conf: { existence: V, position: V, orientation: V, dims: E }, fidelity: 'B', notes: 'Blue-grey ground with gold floral (R01 / R05). Pattern is drawn from tone only.', bbox: i ? [936, 200, 988, 520] : [835, 200, 880, 520] });
    add({ id: `nets_${i ? 'right' : 'left'}`, name: `Sheer nets, ${i ? 'right' : 'left'} window`, group: 'Textiles', room: 'back',
      model: ['sheer', { w: 0.95, h: 2.0 }], place: { pos: [(w[0] + w[1]) / 2, 3.0, zWin + 0.09] }, support: 'rod', refs: ['R01'],
      conf: { existence: V, position: V, orientation: V, dims: E }, fidelity: 'C', bbox: i ? [985, 215, 1085, 450] : [745, 215, 838, 450] });
  }
  add({ id: 'bookshelf', name: 'Open bookshelf beside the right bed', group: 'Bedroom', room: 'back',
    model: ['bookshelf', {}], place: { floor: [4.4 - 0.45, zWin + 0.18] }, support: 'floor', refs: ['R05'],
    conf: { existence: V, position: PV, orientation: PV, dims: E }, fidelity: 'C',
    notes: 'R05 (SC45) shows a dark bookshelf with books to the right of the bed. R01 does not show that wall. Position, size and shelf count are placeholders.' });
  for (const [i, y] of [0.065, 0.435, 0.815].entries()) add({ id: `books_${i}`, name: `Books on bookshelf shelf ${i + 1}`, group: 'Decor', room: 'back',
    model: ['bookRow', { tints: i === 1 ? ['#a07a30', '#2d3b55', '#6b2d2d', '#3f5b3f'] : ['#5a3b24', '#40485c', '#6b2d2d', '#3f5b3f', '#2d3b55'], h: i === 1 ? 0.27 : 0.25, d: 0.17 }],
    place: { on: 'bookshelf', at: [-0.2, 0], dy: y + 0.015 - 1.25 }, support: `bookshelf shelf ${i + 1}`, refs: ['R05'],
    conf: { existence: V, position: PV, orientation: PV, dims: E }, fidelity: 'C', notes: 'Spines drawn as plain cloth bindings; titles are not legible.', shelfY: y });

  // ================================================================ SCRIPT PROPS (layer SC41, off by default)
  add({ id: 'dress_form', name: "Dressmaker's dummy", group: 'Dressmaking', room: 'main', layer: 'SC41',
    model: ['dressForm', {}], place: { floor: [1.15, 3.70] }, yaw: 90, support: 'floor', refs: ['R02', 'R03', 'R04'],
    conf: { existence: V, position: PV, orientation: PV, dims: E }, fidelity: 'B',
    relations: 'SC41: in front of the fire, mending a dress by magic (script); not present in R01',
    notes: 'Linen torso, black neck cap and shoulder knob are seen in R02-R04. WHERE it stands is not established: R02 and R03 put it by the fireplace, R04 in the twin-bed room. This is a stated placeholder, and the layer is off by default.' });
  add({ id: 'ironing_board', name: 'Ironing board with pink cover', group: 'Dressmaking', room: 'back', layer: 'SC41',
    model: ['ironingBoard', {}], place: { floor: [2.0, -1.0] }, yaw: 0, support: 'floor', refs: ['R04'],
    conf: { existence: V, position: PV, orientation: PV, dims: E }, fidelity: 'C',
    relations: 'R04 shows it in the window room beside the nightstand; script SC41 puts the self-working iron in a corner',
    notes: 'The iron itself is not shown in any catalogued image: NOT modelled. Position is a placeholder.' });
  return o;
}

/** Objects named in the references or script that are NOT reconstructed, with the reason. */
export const NOT_RECONSTRUCTED = [
  ['Sofa', 'Script SC41 ("falls back onto a sofa") and the Pottermore set visit mention it; it appears in no catalogued image.'],
  ['Self-working iron', 'Script SC41 and the Pinnock interview describe it; no catalogued image shows the iron itself.'],
  ['Revolving clothes horse with underwear', 'Script SC41 only ("in front of the fire"). Shape unknown.'],
  ['Magazines (The Witch\'s Friend, Witch Chat, Transfiguration Today)', 'Script SC41. Cover art is not in any catalogued image; MinaLima made the graphics.'],
  ['Queenie\'s haberdashery print on the dresser', 'MinaLima describes it. A dresser is not located (possibly the mirror cabinet).'],
  ['Hearth, fender, grate and fire irons', 'Not visible in R01; R02 shows only the arched insert.'],
  ['Mantel clock / mantel objects (beyond the round tin)', 'The mantel top is out of frame in R01 and R02 shows only a lamp.'],
  ['Kitchen cupboards, work surfaces and crockery beyond the sink unit', 'The kitchen wall beyond z 2.5 (toward the camera) is outside R01. Script SC41 says ingredients float "out of cupboards": their location is unknown.'],
  ['Dining table setting (plates, glasses, candles)', 'Script SC41-44; the table is bare in R01. Phase 4 candidate: the film decides the moment.'],
  ['Strudel and magical cooking effects', 'Visual effects (Cinesite). Not architecture or furniture.'],
  ['Sitting-room windows, entrance door, curtains of the main room', 'Fourth wall unknown (Phase 2).'],
  ['Sisters\' bedroom furnishings', 'Room unlocated. Waterston mentions "all the books by Tina\'s bed" (S08).'],
  ['Mirror contents / reflections, framed picture subject, photograph content', 'Not legible.'],
];
