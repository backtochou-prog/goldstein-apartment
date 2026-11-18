// Builds THREE materials from material-defs.js. Textures load asynchronously; `ready` resolves when all
// have loaded (or failed: a missing texture falls back to the flat colour so the scene still renders).
import * as THREE from 'three';
import { MATERIAL_DEFS } from './material-defs.js';

const BASE = (import.meta.env && import.meta.env.BASE_URL) || '/';
const loader = new THREE.TextureLoader();
const texCache = new Map();

export function loadTexture(name, { repeat = true, aniso = 8 } = {}) {
  const key = `${name}|${repeat}`;
  if (texCache.has(key)) return texCache.get(key);
  const entry = {};
  entry.promise = new Promise((resolve) => {
    entry.tex = loader.load(`${BASE}textures/${name}.png`, (t) => { resolve(t); }, undefined, () => resolve(null));
  });
  entry.tex.colorSpace = THREE.SRGBColorSpace;
  entry.tex.wrapS = entry.tex.wrapT = repeat ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  entry.tex.anisotropy = aniso;
  texCache.set(key, entry);
  return entry;
}

export function createMaterials() {
  const mats = {}, waits = [];
  for (const [key, d] of Object.entries(MATERIAL_DEFS)) {
    const p = { roughness: d.roughness, metalness: d.metalness, vertexColors: true };
    if (d.color) p.color = new THREE.Color(d.color);
    if (d.transparent) { p.transparent = true; p.opacity = d.opacity ?? 1; p.depthWrite = false; }
    if (d.double) p.side = THREE.DoubleSide;
    if (d.emissive) p.emissive = new THREE.Color(d.emissive);
    const m = new THREE.MeshStandardMaterial(p);
    if (d.map) { const t = loadTexture(d.map, { repeat: !d.uvUnit }); m.map = t.tex; waits.push(t.promise); }
    m.name = key;
    mats[key] = m;
  }
  return { mats, ready: Promise.all(waits) };
}

/** Rough GPU memory of all loaded textures (RGBA8 + mips), in MB. */
export function textureMemoryMB() {
  let b = 0;
  for (const { tex } of texCache.values()) { const i = tex.image; if (i && i.width) b += i.width * i.height * 4 * 1.333; }
  return b / 1048576;
}
export const textureList = () => [...texCache.values()].filter((e) => e.tex.image).map((e) => ({ src: e.tex.image.src?.split('/').pop(), w: e.tex.image.width, h: e.tex.image.height }));
