// Greybox materials. Tones only separate surface types (walls, floor, dark wood, black fireplace);
// no textures or colour design. Those belong to Phase 3.
import * as THREE from 'three';

const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0, ...extra });

export const MAT = {
  wall: std(0xc8c3ba),
  floor: std(0x77695a),
  ceiling: std(0xe2dfd8, { side: THREE.DoubleSide, emissive: 0x403d38 }), // faces away from the lights; lifted so it reads in walk/VR views
  trim: std(0x4b4038),        // dark stained wood is verified (R01), so it reads darker
  trimLight: std(0xb9b3aa),
  leaf: std(0x3f342c),
  windowFrame: std(0x9f988e),
  glass: new THREE.MeshBasicMaterial({ color: 0xdfe8ef, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }),
  fireplace: std(0x262423),   // verified black (R01, R02)
  firebox: new THREE.MeshBasicMaterial({ color: 0x0b0a0a, side: THREE.DoubleSide }),
  limit: new THREE.MeshBasicMaterial({ color: 0xd9822b, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false }),
  limitLine: new THREE.LineBasicMaterial({ color: 0xd9822b }),
};

export const STATUS_COLORS = {
  DERIVED: 0x5f9e6e,      // green: measured from a reference through the solve
  PROVISIONAL: 0xd8b04a,  // amber: placeholder value
  LIMIT: 0xd9822b,        // orange: evidence boundary, not a film wall
  MIXED: 0x7fa7c9,        // blue: derived position, provisional size
};

export function statusColor(status = '') {
  const s = String(status);
  if (s.startsWith('LIMIT')) return STATUS_COLORS.LIMIT;
  if (s.includes('DERIVED') && s.includes('PROVISIONAL')) return STATUS_COLORS.MIXED;
  if (s.startsWith('DERIVED')) return STATUS_COLORS.DERIVED;
  return STATUS_COLORS.PROVISIONAL;
}

const evidenceMats = new Map();
export function evidenceMaterial(status) {
  const c = statusColor(status);
  if (!evidenceMats.has(c)) evidenceMats.set(c, std(c));
  return evidenceMats.get(c);
}
