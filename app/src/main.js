import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildSpec } from './spec/apartment.js';
import { buildApartment } from './arch/build.js';
import { evidenceMaterial } from './arch/materials.js';
import { buildDimensions, TapeMeasure } from './inspect/labels.js';
import { referenceCameras, applyRefCamera } from './inspect/refcams.js';
import { DesktopWalk, XRInspectMove, collideMove } from './inspect/walk.js';
import { buildInterior } from './interior/build.js';
import { applyFinishes } from './interior/finish.js';
import { textureMemoryMB, textureList } from './interior/materials.js';
import { projectR01 } from './spec/r01-solve.js';
import { createPhotoLayer } from './photo/photo-layer.js';

const spec = buildSpec();
const host = document.getElementById('app');
const W = () => host.clientWidth, H = () => host.clientHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(W(), H());
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType('local-floor');
host.appendChild(renderer.domElement);
const labels = new CSS2DRenderer();
labels.setSize(W(), H());
Object.assign(labels.domElement.style, { position: 'absolute', top: '0', left: '0', pointerEvents: 'none' });
host.appendChild(labels.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1b1a18);
// NEUTRAL INSPECTION LIGHT (not the film lighting: that is Phase 4). A soft environment lets metals and glass
// show reflections; the 'fire test' mode below is only a material check under warm light.
const hemi = new THREE.HemisphereLight(0xf2efe8, 0x5b5248, 1.0);
const sun = new THREE.DirectionalLight(0xffffff, 0.9); sun.position.set(3, 8, 5);
scene.add(hemi, sun);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.45;
const fireLight = new THREE.PointLight(0xff8a3c, 0, 8, 1.6);
{ const F = spec.fireplace; fireLight.position.set(F.depth + 0.25, 0.45, (F.zFrom + F.zTo) / 2); scene.add(fireLight); }
function setLighting(m) {
  const fire = m === 'fire';
  hemi.intensity = fire ? 0.12 : 1.0; sun.intensity = fire ? 0.0 : 0.9;
  scene.environmentIntensity = fire ? 0.06 : 0.45;
  fireLight.intensity = fire ? 14 : 0;
}

const apt = buildApartment(spec);
scene.add(apt.root);
const dims = buildDimensions(spec);
scene.add(dims);

// cameras: one perspective camera inside an XR rig, one orthographic for plan
const rig = new THREE.Group(); scene.add(rig);
const cam = new THREE.PerspectiveCamera(60, W() / H(), 0.03, 80); rig.add(cam);
const plan = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 50);
let active = cam;

const orbit = new OrbitControls(cam, renderer.domElement);
orbit.target.set(2.2, 1.2, 0.5);
cam.position.set(9.5, 7.5, 9.5);
const walkColliders = [...apt.colliders];          // architecture; furniture colliders are added when enabled
const walk = new DesktopWalk(cam, renderer.domElement, walkColliders);
const xrMove = new XRInspectMove(renderer, rig, walkColliders);
const tape = new TapeMeasure(scene, cam, renderer.domElement, () => [apt.arch]);
const refs = referenceCameras(spec);

// ---------------- UI
const $ = (id) => document.getElementById(id);
const overlay = $('overlay');
let mode = 'orbit', refIdx = 0;
const hints = {
  orbit: 'Drag to orbit, right-drag to pan, scroll to zoom.',
  walk: 'WASD / arrows to walk at 1.3 m/s, drag to look. Eye height 1.60 m. Walls collide.',
  plan: 'Top-down plan. Ceilings hidden. Scroll to zoom.',
  ref: 'Virtual camera from a reference image. Use the overlay slider to compare.',
};
function setMode(m) {
  mode = m;
  if (m !== 'ref') { cam.userData.lockedProjection = false; cam.fov = 60; }
  document.querySelectorAll('#modes button').forEach((b) => b.classList.toggle('on', b.dataset.mode === m));
  $('modehint').textContent = hints[m];
  orbit.enabled = m === 'orbit';
  walk.enabled = m === 'walk';
  active = m === 'plan' ? plan : cam;
  overlay.style.display = m === 'ref' ? 'block' : 'none';
  setCeilings();
  if (m === 'walk') walk.place(spec.spawn.x, spec.spawn.z, spec.spawn.yaw);
  if (m === 'orbit') { cam.userData.lockedProjection = false; cam.position.set(9.5, 7.5, 9.5); orbit.target.set(2.2, 1.2, 0.5); orbit.update(); }
  if (m === 'ref') showRef(refIdx);
  if (m === 'plan') framePlan();
  applyBlend();
  resize();
}
document.querySelectorAll('#modes button').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  const k = { KeyO: 'orbit', KeyP: 'plan', KeyR: 'ref' }[e.code];
  if (k) setMode(k);
  if (e.code === 'KeyF' || (e.code === 'KeyW' && mode !== 'walk' && e.shiftKey)) setMode('walk');
});

refs.forEach((r, i) => { const o = document.createElement('option'); o.value = i; o.textContent = r.label; $('refsel').appendChild(o); });
$('refsel').addEventListener('change', (e) => { refIdx = +e.target.value; setMode('ref'); });
$('refop').addEventListener('input', () => applyBlend());
function showRef(i) {
  const r = refs[i];
  applyRefCamera(cam, r);
  overlay.src = r.image;
  $('refnote').textContent = (r.solved ? 'SOLVED. ' : 'APPROXIMATE, not solved. ') + r.note;
}

const surf0 = new WeakMap();
// Line mode: real edges (EdgesGeometry) with hidden lines removed by a depth-only pass of the
// surfaces. Only materials are swapped; geometry is untouched.
const edgeLine = new THREE.LineBasicMaterial({ color: 0x00e5ff });
const depthOnly = new THREE.MeshBasicMaterial({ colorWrite: false });
let edgesBuilt = false;
function setEdges(on) {
  if (on && !edgesBuilt) {
    apt.arch.traverse((o) => {
      if (!o.isMesh || o.material.transparent) return;
      const l = new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, 20), edgeLine);
      l.userData.edgeOverlay = true; l.raycast = () => {}; o.add(l);
    });
    edgesBuilt = true;
  }
  apt.arch.traverse((o) => {
    if (o.userData.edgeOverlay) o.visible = on;
    else if (o.isMesh && !o.material.transparent) {
      if (on) { if (!surf0.has(o)) surf0.set(o, o.material); o.material = depthOnly; }
      else if (surf0.has(o)) { o.material = surf0.get(o); surf0.delete(o); }
    }
  });
}
$('edges').addEventListener('change', (e) => { setEdges(e.target.checked); if (interior) interior.root.visible = !e.target.checked && $('t-furn').checked; applyBlend(); });
// Reference blend: the photo sits BEHIND a transparent canvas. Surfaces mode fades the render;
// line mode keeps lines opaque and fades the photo.
const BG = new THREE.Color(0x1b1a18);
function applyBlend() {
  const v = +$('refop').value, lines = $('edges').checked, ref = mode === 'ref';
  scene.background = ref ? null : BG;
  renderer.domElement.style.opacity = ref && !lines ? String(1 - v) : '1';
  overlay.style.opacity = ref ? (lines ? String(v) : '1') : '0';
}

function setCeilings() {
  const show = $('t-ceil').checked && mode !== 'plan';
  apt.arch.traverse((o) => { if (o.userData.kind === 'ceiling' || o.userData.id === 'crownBack') o.visible = show; });
}
$('t-ceil').addEventListener('change', setCeilings);
$('t-walls').addEventListener('change', (e) => apt.wallMeshes.forEach((m) => { m.visible = e.target.checked; }));
$('t-dims').addEventListener('change', (e) => { dims.visible = e.target.checked; labels.domElement.style.display = e.target.checked ? '' : 'none'; });
$('t-foot').addEventListener('change', (e) => { apt.footprints.visible = e.target.checked; });
$('t-limit').addEventListener('change', (e) => { apt.limits.visible = e.target.checked; });
$('t-coll').addEventListener('change', (e) => { apt.collision.visible = e.target.checked; });
// material stashes live in WeakMaps, never in userData (glTF export serialises userData)
const evid0 = new WeakMap();
$('t-evid').addEventListener('change', (e) => {
  apt.arch.traverse((o) => {
    if (!o.isMesh) return;
    if (e.target.checked) { if (!evid0.has(o)) evid0.set(o, o.material); o.material = evidenceMaterial(o.userData.status); }
    else if (evid0.has(o)) o.material = evid0.get(o);
  });
});
const setDoors = (m) => { apt.setDoors(m); photo?.refreshDepth(); };
$('doors').addEventListener('change', (e) => setDoors(e.target.value));
$('tape').addEventListener('change', (e) => { tape.active = e.target.checked; });
$('tapeclear').addEventListener('click', () => tape.clear());

// click to inspect (architecture, evidence limits and furniture)
const ray = new THREE.Raycaster();
renderer.domElement.addEventListener('click', (e) => {
  if (tape.active) return;
  const r = renderer.domElement.getBoundingClientRect();
  ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), active);
  const targets = [apt.arch, apt.limits]; if (interior && interior.root.visible) targets.push(...interior.meshes.filter((m) => m.parent.visible));
  const hit = ray.intersectObjects(targets, true).find((h) => h.object.visible && h.object.isMesh);
  if (!hit) return;
  const p = hit.point;
  if (hit.object.userData.kind === 'furniture') {
    const o = interior.pick(hit.object, hit.faceIndex), c = o.conf;
    $('info').innerHTML = `<b>${o.name}</b> · ${o.group}  [${o.id}]\nexistence ${c.existence} · position ${c.position} · orientation ${c.orientation} · size ${c.dims}\nfidelity ${o.fidelity} · layer ${o.layer}\nrefs: ${o.refs.join(', ')} · on: ${o.support}\nat x ${o.pos.x.toFixed(2)}  y ${o.pos.y.toFixed(2)}  z ${o.pos.z.toFixed(2)} m, yaw ${(o.yaw * 180 / Math.PI).toFixed(0)}°\n${o.relations ? o.relations + '\n' : ''}${o.notes || ''}`;
    return;
  }
  const u = hit.object.userData;
  $('info').innerHTML = `<b>${u.id}</b> · ${u.kind}\nstatus: ${u.status}\nevidence: ${(u.evidence || []).join(', ') || 'none'}\n` +
    `point: x ${p.x.toFixed(2)}  y ${p.y.toFixed(2)}  z ${p.z.toFixed(2)} m\n${u.note || ''}`;
});

// Export: architecture only (no overlays, collision, limits or footprints) as binary glTF, for
// Blender / Godot. Element ids, status and evidence travel in the node extras.
async function exportArchitecture() {
  // the export is the Phase 2 greybox (geometry only): restore the greybox materials while exporting
  const had = finishes?.on; if (had) finishes.set(false);
  try {
    const glb = await new GLTFExporter().parseAsync(apt.arch, { binary: true, onlyVisible: false });
    return new Blob([glb], { type: 'model/gltf-binary' });
  } finally { if (had) finishes.set(true); }
}
$('export').addEventListener('click', async () => {
  const a = document.createElement('a'); a.href = URL.createObjectURL(await exportArchitecture());
  a.download = 'goldstein-architecture-phase2.glb'; a.click();
});

// VR
const vrBtn = VRButton.createButton(renderer);
vrBtn.classList.add('vr');
$('vrslot').appendChild(vrBtn);
renderer.xr.addEventListener('sessionstart', () => {
  rig.position.set(spec.spawn.x, 0, spec.spawn.z); rig.rotation.set(0, spec.spawn.yaw, 0);
  setEdges(false); $('edges').checked = false; dims.visible = false;
});
renderer.xr.addEventListener('sessionend', () => { rig.position.set(0, 0, 0); rig.rotation.set(0, 0, 0); dims.visible = $('t-dims').checked; setMode('orbit'); });

// ---------------- layout
function framePlan() {
  const minX = -0.6, maxX = spec.rooms[0].x[1] + 0.6, minZ = spec.rooms[1].z[0] - 0.6, maxZ = spec.rooms[0].z[1] + 0.6;
  const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2, a = W() / H();
  let hw = (maxX - minX) / 2, hh = (maxZ - minZ) / 2;
  if (hw / hh > a) hh = hw / a; else hw = hh * a;
  Object.assign(plan, { left: -hw, right: hw, top: hh, bottom: -hh });
  plan.position.set(cx, 20, cz); plan.up.set(0, 0, -1); plan.lookAt(cx, 0, cz); plan.updateProjectionMatrix();
}
let view = { x: 0, y: 0, w: 1, h: 1 };
function resize() {
  const w = W(), h = H();
  renderer.setSize(w, h); labels.setSize(w, h);
  if (mode === 'ref') {
    const r = refs[refIdx], ia = r.width / r.height;
    let vw = w, vh = w / ia; if (vh > h) { vh = h; vw = h * ia; }
    view = { x: (w - vw) / 2, y: (h - vh) / 2, w: vw, h: vh };
    const rect = host.getBoundingClientRect();
    Object.assign(overlay.style, { left: `${rect.left + view.x}px`, top: `${rect.top + view.y}px`, width: `${vw}px`, height: `${vh}px` });
  } else {
    view = { x: 0, y: 0, w, h };
    if (!cam.userData.lockedProjection) { cam.aspect = w / h; cam.updateProjectionMatrix(); }
    if (mode === 'plan') framePlan();
  }
}
addEventListener('resize', resize);

// ---------------- loop
const clock = new THREE.Clock();
let frames = 0, fpsT = 0, fps = 0;
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.1);
  if (renderer.xr.isPresenting) xrMove.update(dt, renderer.xr.getCamera());
  else { walk.update(dt); if (mode === 'orbit') orbit.update(); }
  if (!renderer.xr.isPresenting) {
    const { x, y, w, h } = view; const hh = H();
    renderer.setScissorTest(mode === 'ref');
    renderer.setViewport(x, hh - y - h, w, h); renderer.setScissor(x, hh - y - h, w, h);
  }
  tape.setCamera(active);
  renderer.render(scene, active);
  if (!renderer.xr.isPresenting && dims.visible) labels.render(scene, active);
  frames++; fpsT += dt;
  if (fpsT > 1) { fps = frames / fpsT; frames = 0; fpsT = 0; $('status').textContent = `${fps.toFixed(0)} fps · ${renderer.info.render.triangles} tris · ${renderer.info.render.calls} draws`; }
});

setMode('orbit');

// ---------------- test hooks (used by tools/browser-test.mjs; harmless otherwise)
// FNV-1a fingerprint of the approved Phase 2 architecture: world-space vertex positions (1e-4 m) of every
// original architecture mesh. Interior finishes and furniture are tagged `interior` and excluded.
function archHash() {
  const byId = {};
  const v = new THREE.Vector3();
  apt.arch.updateMatrixWorld(true);
  apt.arch.traverse((o) => {
    if (!o.isMesh || o.userData.interior) return;
    const pos = o.geometry.attributes.position;
    let h = byId[o.userData.id]?.h ?? 0x811c9dc5, n = byId[o.userData.id]?.n ?? 0;
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
      for (const c of [v.x, v.y, v.z]) h = Math.imul(h ^ (Math.round(c * 1e4) | 0), 0x01000193) >>> 0;
      n++;
    }
    byId[o.userData.id || o.uuid] = { h, n };
  });
  return Object.fromEntries(Object.entries(byId).map(([k, { h, n }]) => [k, `${h.toString(16)}:${n}`]));
}

window.__apt = {
  archHash,
  spec, refs, setMode, setDoors,
  gotoRef: (id) => { refIdx = refs.findIndex((r) => r.id === id); $('refsel').value = refIdx; setMode('ref'); },
  place: (x, z, yaw = 0) => { setMode('walk'); walk.place(x, z, yaw); },
  // simulate walking in a straight line; returns where collision stopped us
  walkLine: (x, z, dx, dz, steps = 400, withFurniture = false) => {
    let p = new THREE.Vector3(x, 0, z);
    const d = new THREE.Vector3(dx / steps, 0, dz / steps);
    const cols = withFurniture && interior ? [...apt.colliders, ...interior.colliders.filter((c) => c.layer === 'R01')] : apt.colliders;
    for (let i = 0; i < steps; i++) p = collideMove(cols, p, d);
    return { x: p.x, z: p.z };
  },
  info: () => ({ triangles: renderer.info.render.triangles, calls: renderer.info.render.calls,
    geometries: renderer.info.memory.geometries, fps, colliders: apt.colliders.length }),
  toggle: (id, v) => { const el = $(id); el.checked = v; el.dispatchEvent(new Event('change')); },
  xrState: () => {
    const head = new THREE.Vector3();
    if (renderer.xr.isPresenting) renderer.xr.getCamera().getWorldPosition(head);
    return { presenting: renderer.xr.isPresenting, rig: { x: rig.position.x, z: rig.position.z, yaw: rig.rotation.y },
      head: { x: head.x, y: head.y, z: head.z },
      inputs: [...(renderer.xr.getSession()?.inputSources || [])].map((i) => ({ hand: i.handedness, axes: i.gamepad ? [...i.gamepad.axes] : null })) };
  },
  exportGLB: async () => new Uint8Array(await (await exportArchitecture()).arrayBuffer()),
  ready: false,
};

// ---------------- Phase 3: interior (furniture, objects, materials)
let interior = null, finishes = null, photo = null;
function syncWalkColliders() {
  walkColliders.length = 0; walkColliders.push(...apt.colliders);
  if (interior && $('t-fcoll').checked && interior.root.visible) walkColliders.push(...interior.colliders.filter((c) => interior.layers[c.layer]?.visible));
}
(async () => {
  interior = await buildInterior(spec);
  finishes = await applyFinishes(apt, interior.mats);
  scene.add(interior.root);
  photo = await createPhotoLayer({ renderer, scene, spec, apt, interior, finishes, hideForDepth: [apt.limits, apt.footprints, apt.collision, dims, interior.colHelpers, interior.layers.SC41] });
  if (photo) {
    $('photomode').addEventListener('change', (e) => { const m = e.target.value; photo.setMix(m === 'procedural' ? 0 : +$('photomix').value); photo.setDebug(m === 'coverage'); });
    $('photomix').addEventListener('input', (e) => { if ($('photomode').value === 'photo') photo.setMix(+e.target.value); });
    $('t-sc41').addEventListener('change', () => photo.refreshDepth());
    $('t-furn').addEventListener('change', () => photo.refreshDepth());
  } else { $('photomode').disabled = true; $('photomode').title = 'reference photograph not found (private reference/ folder)'; }
  apt.footprints.visible = false; $('t-foot').checked = false;       // Phase 2 outlines are superseded by the objects
  $('t-furn').addEventListener('change', (e) => { interior.root.visible = e.target.checked && !$('edges').checked; syncWalkColliders(); });
  $('t-fin').addEventListener('change', (e) => finishes.set(e.target.checked));
  $('t-sc41').addEventListener('change', (e) => { interior.layers.SC41.visible = e.target.checked; syncWalkColliders(); });
  $('t-fcoll').addEventListener('change', syncWalkColliders);
  $('t-fcolv').addEventListener('change', (e) => { interior.colHelpers.visible = e.target.checked; });
  $('t-conf').addEventListener('change', (e) => interior.setConfidenceView(e.target.checked));
  $('lightmode').addEventListener('change', (e) => setLighting(e.target.value));
  syncWalkColliders();
  Object.assign(window.__apt, {
    interior, setLighting, syncWalkColliders,
    objects: () => interior.list.map((o) => {
      const b = o.bounds, pts = [];
      for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) pts.push(projectR01([x, y, z]));
      const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
      return { id: o.id, name: o.name, group: o.group, layer: o.layer, room: o.room, conf: o.conf, fidelity: o.fidelity, bbox: o.bbox || null,
        proj: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], pos: o.pos.toArray(), tris: interior.stats.perObject[o.id] };
    }),
    maskStats: () => photo?.maskStats(),
    photo: () => photo && { mix: photo.mix, source: photo.source.id, textureMB: photo.textureMB, depthMB: photo.depthMB },
    setPhoto: (m, v = 1) => { if (!photo) return; photo.setMix(m === 'procedural' ? 0 : v); photo.setDebug(m === 'coverage'); },
    lightState: () => ({ hemi: hemi.intensity, sun: sun.intensity, fire: fireLight.intensity, env: scene.environmentIntensity }),
    perf: () => {
      let tris = 0, draws = 0, mats = new Set();
      scene.traverse((m) => { if (m.isMesh && m.visible) { let v = true, p = m; while (p) { if (!p.visible) v = false; p = p.parent; } if (v) { draws++; tris += (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) / 3; [].concat(m.material).forEach((x) => mats.add(x.uuid)); } } });
      return { triangles: Math.round(tris), meshes: draws, materials: mats.size, textureMB: textureMemoryMB(), textures: textureList(), renderer: { ...renderer.info.memory } };
    },
    archHash,
  });
  window.__apt.ready = true;
})();
