// Dimension annotations and a two-click measuring tape. Overlays only: they never touch geometry.
import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { statusColor } from '../arch/materials.js';

const hex = (n) => '#' + n.toString(16).padStart(6, '0');

function label(text, status) {
  const el = document.createElement('div');
  el.className = 'dim-label';
  el.textContent = text;
  el.style.borderColor = hex(statusColor(status));
  return new CSS2DObject(el);
}

function dimLine(a, b, text, status, group) {
  const g = new THREE.Group();
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]),
    new THREE.LineBasicMaterial({ color: statusColor(status), depthTest: false }));
  line.renderOrder = 10;
  g.add(line);
  const l = label(text, status);
  l.position.copy(a).add(b).multiplyScalar(0.5);
  g.add(l);
  group.add(g);
}

const m = (v) => `${v.toFixed(2)} m`;

export function buildDimensions(spec) {
  const g = new THREE.Group(); g.name = 'dimensions';
  const s = spec.solve, V = (x, y, z) => new THREE.Vector3(x, y, z);
  const main = spec.rooms[0], back = spec.rooms[1], D = spec.doorway, F = spec.fireplace;
  const W = main.x[1];
  dimLine(V(0, 0.05, 0.6), V(W, 0.05, 0.6), `main room width ${m(W)}  DERIVED`, 'DERIVED', g);
  dimLine(V(W - 0.3, 0.05, 0), V(W - 0.3, 0.05, main.z[1]), `main depth ${m(main.z[1])}  PROVISIONAL (fourth wall unseen)`, 'PROVISIONAL', g);
  dimLine(V(0.3, 0, 0.3), V(0.3, main.ceiling, 0.3), `main ceiling ${m(main.ceiling)}  PROVISIONAL (≥ ${m(D.casing.top)})`, 'PROVISIONAL', g);
  dimLine(V(D.clearX[0], 0.15, 0.25), V(D.clearX[1], 0.15, 0.25), `doorway clear ${m(D.clearX[1] - D.clearX[0])}  DERIVED`, 'DERIVED', g);
  dimLine(V(D.clearX[1] - 0.15, 0, 0.25), V(D.clearX[1] - 0.15, D.head, 0.25), `door head ${m(D.head)}  DERIVED`, 'DERIVED', g);
  dimLine(V(0, 0.4, 0.15), V(D.casing.outerX[0], 0.4, 0.15), `left pier ${m(D.casing.outerX[0])}`, 'DERIVED', g);
  dimLine(V(D.casing.outerX[1], 0.4, 0.15), V(W, 0.4, 0.15), `right pier ${m(W - D.casing.outerX[1])}`, 'DERIVED', g);
  dimLine(V(1.2, 0.05, back.z[1]), V(1.2, 0.05, back.z[0]), `back-room depth ${m(back.z[1] - back.z[0])}  DERIVED (bed-length closure)`, 'DERIVED', g);
  dimLine(V(W - 0.2, 0, back.z[0] + 0.3), V(W - 0.2, back.ceiling, back.z[0] + 0.3), `back ceiling ${m(back.ceiling)}  DERIVED`, 'DERIVED', g);
  dimLine(V(0.35, 0.05, 0), V(0.35, 0.05, F.zFrom), `wall → fireplace ${m(F.zFrom)}  DERIVED`, 'DERIVED', g);
  dimLine(V(F.depth + 0.05, F.mantelHeight, F.zFrom), V(F.depth + 0.05, F.mantelHeight, F.zTo), `fireplace width ${m(F.zTo - F.zFrom)}  PROVISIONAL; mantel ${m(F.mantelHeight)} DERIVED`, 'MIXED: DERIVED PROVISIONAL', g);
  const ww = spec.walls.find((w) => w.id === 'backWindowWall');
  ww.openings.forEach((o) => {
    const c = (o.from + o.to) / 2;
    const l = label(`window centre x ${m(c)} DERIVED · size PROVISIONAL`, 'DERIVED PROVISIONAL');
    l.position.set(c, o.top + 0.25, back.z[0] + 0.15); g.add(l);
  });
  const lim = label('EVIDENCE LIMIT: fourth wall unknown (not a film wall)', 'LIMIT');
  lim.position.set(W / 2, 2.2, main.z[1]); g.add(lim);
  const cam = label('R01 camera (solved)', 'DERIVED'); cam.position.set(spec.camera.x, spec.camera.y + 0.25, spec.camera.z); g.add(cam);
  return g;
}

export class TapeMeasure {
  constructor(scene, camera, dom, targets) {
    this.scene = scene; this.camera = camera; this.dom = dom; this.targets = targets;
    this.group = new THREE.Group(); this.group.name = 'tape'; scene.add(this.group);
    this.ray = new THREE.Raycaster(); this.points = []; this.active = false;
    dom.addEventListener('click', (e) => this.onClick(e));
  }
  setCamera(c) { this.camera = c; }
  clear() { this.group.clear(); this.points = []; }
  pick(e) {
    const r = this.dom.getBoundingClientRect();
    const v = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(v, this.camera);
    const hit = this.ray.intersectObjects(this.targets(), true).find((h) => h.object.visible && h.object.isMesh);
    return hit;
  }
  onClick(e) {
    if (!this.active) return;
    const hit = this.pick(e); if (!hit) return;
    const p = hit.point.clone();
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false }));
    dot.position.copy(p); dot.renderOrder = 11; this.group.add(dot);
    this.points.push(p);
    if (this.points.length === 2) {
      const [a, b] = this.points;
      dimLine(a, b, `${a.distanceTo(b).toFixed(3)} m  (Δx ${Math.abs(b.x - a.x).toFixed(2)} Δy ${Math.abs(b.y - a.y).toFixed(2)} Δz ${Math.abs(b.z - a.z).toFixed(2)})`, 'MEASURE', this.group);
      this.points = [];
    }
  }
}
