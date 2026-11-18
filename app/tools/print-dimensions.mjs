// Prints every derived and provisional dimension, with ranges over the assumption bounds.
// Usage: npm run dims  (add --md for a Markdown table)
import { buildSpec } from '../src/spec/apartment.js';
import { ASSUMPTIONS, rangeOf } from '../src/spec/r01-solve.js';

const md = process.argv.includes('--md');
const spec = buildSpec();
const s = spec.solve;
const f2 = (v) => v.toFixed(2);
const rows = [
  ['Main room width (left wall to right wall)', s.mainRoom.width, (x) => x.mainRoom.width, 'DERIVED', 'R01 corners x 375 / 1440'],
  ['Left pier (left wall to casing)', s.doorway.casingOuterX[0], (x) => x.doorway.casingOuterX[0], 'DERIVED', 'R01'],
  ['Right pier (casing to right wall)', s.mainRoom.width - s.doorway.casingOuterX[1], (x) => x.mainRoom.width - x.doorway.casingOuterX[1], 'DERIVED', 'R01'],
  ['Casing outer width', s.doorway.casingOuterX[1] - s.doorway.casingOuterX[0], (x) => x.doorway.casingOuterX[1] - x.doorway.casingOuterX[0], 'DERIVED', 'R01'],
  ['Doorway clear width (jamb to jamb)', s.doorway.clearX[1] - s.doorway.clearX[0], (x) => x.doorway.clearX[1] - x.doorway.clearX[0], 'DERIVED', 'R01'],
  ['Doorway head height', s.doorway.headHeight, (x) => x.doorway.headHeight, 'DERIVED', 'R01'],
  ['Casing top (minimum; cropped)', s.doorway.casingTopMin, (x) => x.doorway.casingTopMin, 'DERIVED min', 'R01'],
  ['Skirting height (main room)', s.mainRoom.skirtingHeight, (x) => x.mainRoom.skirtingHeight, 'DERIVED', 'R01'],
  ['Back room depth (wall face to window wall)', -s.backRoom.backWallZ - spec.P.endWallThickness, (x) => -x.backRoom.backWallZ - spec.P.endWallThickness, 'DERIVED*', 'R01 + bed length'],
  ['Back room ceiling height', s.backRoom.ceilingHeight, (x) => x.backRoom.ceilingHeight, 'DERIVED*', 'R01'],
  ['Back room crown moulding depth', s.backRoom.crownDepth, (x) => x.backRoom.crownDepth, 'DERIVED*', 'R01'],
  ['Pelmet / rod top', s.backRoom.pelmetTop, (x) => x.backRoom.pelmetTop, 'DERIVED*', 'R01'],
  ['Left window centre x', (s.backRoom.rodLeftX[0] + s.backRoom.rodLeftX[1]) / 2, (x) => (x.backRoom.rodLeftX[0] + x.backRoom.rodLeftX[1]) / 2, 'DERIVED*', 'R01 rods'],
  ['Right window centre x', (s.backRoom.rodRightX[0] + s.backRoom.rodRightX[1]) / 2, (x) => (x.backRoom.rodRightX[0] + x.backRoom.rodRightX[1]) / 2, 'DERIVED*', 'R01 rods'],
  ['Fireplace doorward end, from pocket-door wall', s.fireplace.mantelEndZ, (x) => x.fireplace.mantelEndZ, 'DERIVED*', 'R01 + mantel projection'],
  ['Mantel shelf height', s.fireplace.mantelHeight, (x) => x.fireplace.mantelHeight, 'DERIVED*', 'R01'],
  ['Fireplace reaches at least (z)', s.fireplace.columnReachesZ, (x) => x.fireplace.columnReachesZ, 'DERIVED*', 'R01 column at frame edge'],
  ['R01 camera distance from pocket-door wall', s.camera.z, (x) => x.camera.z, 'DERIVED*', 'R01'],
  ['Nearest floor visible in R01 (z)', s.mainRoom.nearestVisibleFloorZ, (x) => x.mainRoom.nearestVisibleFloorZ, 'DERIVED*', 'R01'],
];
const prov = [
  ['Main room depth (fourth wall)', spec.P.mainRoomDepth, 'PROVISIONAL', 'unseen; R01 camera stands at z≈5.6'],
  ['Main room ceiling', spec.P.mainCeiling, 'PROVISIONAL', 'set equal to the back room; ≥ casing top'],
  ['Pocket-door wall thickness', spec.P.endWallThickness, 'PROVISIONAL', 'must house the leaves'],
  ['Fireplace width', spec.P.fireplaceWidth, 'PROVISIONAL', '≥ ' + f2(s.fireplace.columnReachesZ - s.fireplace.mantelEndZ) + ' derived'],
  ['Fireplace depth from wall', spec.P.fireplaceDepth, 'ASSUMED', 'mantel projection assumption'],
  ['Window width / sill / head', `${spec.P.windowWidth} / ${spec.P.windowSill} / ${spec.P.windowHead}`, 'PROVISIONAL', 'hidden by curtains and beds'],
  ['Back room width', spec.P.backRoomRightX - spec.P.backRoomLeftX, 'PROVISIONAL', `≥ ${f2(s.backRoom.visibleBackWallX[1] - s.backRoom.visibleBackWallX[0])} visible through the doorway`],
];
const ratio = [
  ['Door head / room width', (x) => x.doorway.headHeight / x.mainRoom.width],
  ['Doorway clear width / room width', (x) => (x.doorway.clearX[1] - x.doorway.clearX[0]) / x.mainRoom.width],
  ['Back ceiling / door head', (x) => x.backRoom.ceilingHeight / x.doorway.headHeight],
  ['Mantel height / door head', (x) => x.fireplace.mantelHeight / x.doorway.headHeight],
];
if (md) {
  console.log('| Dimension | Value (m) | Range over assumption bounds (m) | Status | Basis |\n|---|---|---|---|---|');
  for (const [n, v, g, st, b] of rows) { const [lo, hi] = rangeOf(g); console.log(`| ${n} | ${f2(v)} | ${f2(lo)} – ${f2(hi)} | ${st} | ${b} |`); }
  console.log('\n| Provisional value | Value (m) | Status | Note |\n|---|---|---|---|');
  for (const [n, v, st, b] of prov) console.log(`| ${n} | ${typeof v === 'number' ? f2(v) : v} | ${st} | ${b} |`);
  console.log('\n| Proportion | Central | Range |\n|---|---|---|');
  for (const [n, g] of ratio) { const [lo, hi] = rangeOf(g); console.log(`| ${n} | ${f2(g(s))} | ${f2(lo)} – ${f2(hi)} |`); }
} else {
  for (const [n, v, g, st] of rows) { const [lo, hi] = rangeOf(g); console.log(`${n.padEnd(46)} ${f2(v).padStart(6)}  [${f2(lo)} .. ${f2(hi)}]  ${st}`); }
  console.log(''); for (const [n, v, st] of prov) console.log(`${n.padEnd(46)} ${String(typeof v === 'number' ? f2(v) : v).padStart(6)}  ${st}`);
  console.log(''); for (const [n, g] of ratio) { const [lo, hi] = rangeOf(g); console.log(`${n.padEnd(46)} ${f2(g(s)).padStart(6)}  [${f2(lo)} .. ${f2(hi)}]`); }
  console.log('\nAssumptions:'); for (const [k, a] of Object.entries(ASSUMPTIONS)) console.log(`  ${k} = ${a.v} ${a.unit} (${a.min}..${a.max})`);
}
