// Inspection-only navigation: desktop walk (WASD + drag to look) and a basic XR thumbstick slide
// with snap turn. This is NOT the final locomotion system (that is a later phase). It exists so the
// architecture can be checked at human scale, with collision against the architectural colliders.
import * as THREE from 'three';

export const BODY_RADIUS = 0.2;

/** Move a point in xz from `from` by `delta`, sliding along axis-aligned colliders. */
export function collideMove(colliders, from, delta, radius = BODY_RADIUS, eyeY = 1.6) {
  const p = from.clone();
  for (const axis of ['x', 'z']) {
    const next = p.clone(); next[axis] += delta[axis];
    if (!hits(colliders, next, radius, eyeY)) p.copy(next);
  }
  return p;
}

function hits(colliders, p, r, eyeY) {
  for (const c of colliders) {
    const b = c.box;
    if (b.max.y < 0.05 || b.min.y > eyeY) continue; // only things between ankle and eye height
    if (p.x + r > b.min.x && p.x - r < b.max.x && p.z + r > b.min.z && p.z - r < b.max.z) return true;
  }
  return false;
}

export class DesktopWalk {
  constructor(camera, dom, colliders) {
    this.camera = camera; this.dom = dom; this.colliders = colliders;
    this.enabled = false; this.eye = 1.6; this.yaw = 0; this.pitch = 0; this.pos = new THREE.Vector3();
    this.keys = new Set(); this.speed = 1.3; // m/s, walking pace
    addEventListener('keydown', (e) => { if (this.enabled) this.keys.add(e.code); });
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    let drag = null;
    dom.addEventListener('pointerdown', (e) => { if (this.enabled) drag = [e.clientX, e.clientY]; });
    addEventListener('pointerup', () => { drag = null; });
    addEventListener('pointermove', (e) => {
      if (!drag || !this.enabled) return;
      this.yaw -= (e.clientX - drag[0]) * 0.004; this.pitch -= (e.clientY - drag[1]) * 0.004;
      this.pitch = Math.max(-1.3, Math.min(1.3, this.pitch)); drag = [e.clientX, e.clientY];
    });
  }
  place(x, z, yaw = 0) { this.pos.set(x, 0, z); this.yaw = yaw; this.pitch = 0; this.apply(); }
  apply() {
    this.camera.position.set(this.pos.x, this.eye, this.pos.z);
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
  }
  update(dt) {
    if (!this.enabled) return;
    const f = (this.keys.has('KeyW') || this.keys.has('ArrowUp') ? 1 : 0) - (this.keys.has('KeyS') || this.keys.has('ArrowDown') ? 1 : 0);
    const s = (this.keys.has('KeyD') || this.keys.has('ArrowRight') ? 1 : 0) - (this.keys.has('KeyA') || this.keys.has('ArrowLeft') ? 1 : 0);
    if (f || s) {
      const fwd = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
      const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
      const d = fwd.multiplyScalar(f).add(right.multiplyScalar(s)).normalize().multiplyScalar(this.speed * dt);
      this.pos.copy(collideMove(this.colliders, this.pos, d, BODY_RADIUS, this.eye));
    }
    this.apply();
  }
}

export class XRInspectMove {
  constructor(renderer, rig, colliders) {
    this.renderer = renderer; this.rig = rig; this.colliders = colliders;
    this.speed = 1.2; this.turnReady = true;
  }
  update(dt, camera) {
    const session = this.renderer.xr.getSession(); if (!session) return;
    for (const src of session.inputSources) {
      const gp = src.gamepad; if (!gp || gp.axes.length < 4) continue;
      const ax = gp.axes[2], ay = gp.axes[3];
      // Read the head pose straight from matrixWorld. getWorldPosition()/getWorldDirection() would
      // first recompose the XR camera matrix from its (unused) position/quaternion and lose the pose.
      const e = camera.matrixWorld.elements;
      const headPos = new THREE.Vector3(e[12], 0, e[14]);
      const fwd = new THREE.Vector3(-e[8], 0, -e[10]);
      if (fwd.lengthSq() < 1e-8) continue; // pose not available yet this frame
      fwd.normalize();
      if (src.handedness === 'left' && Math.hypot(ax, ay) > 0.15) {
        const right = new THREE.Vector3(-fwd.z, 0, fwd.x);
        const d = fwd.clone().multiplyScalar(-ay).add(right.multiplyScalar(ax)).multiplyScalar(this.speed * dt);
        const moved = collideMove(this.colliders, headPos, d); // collide using the head over the floor
        this.rig.position.x += moved.x - headPos.x; this.rig.position.z += moved.z - headPos.z;
      }
      if (src.handedness === 'right') {
        if (Math.abs(ax) > 0.7 && this.turnReady) {
          // snap turn 30° about the head
          const ang = -Math.sign(ax) * Math.PI / 6;
          this.rig.position.sub(headPos).applyAxisAngle(new THREE.Vector3(0, 1, 0), ang).add(headPos);
          this.rig.rotation.y += ang; this.turnReady = false;
        } else if (Math.abs(ax) < 0.3) this.turnReady = true;
      }
    }
  }
}
