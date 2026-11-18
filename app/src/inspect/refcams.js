// Virtual reference cameras matching reference images.
// R01 is SOLVED (single-image perspective solve, see spec/r01-solve.js): position, focal length and
// the off-centre principal point all come from the solve, so its overlay is a real test of the geometry.
// The others are APPROXIMATE placements made by eye to frame the same features. They are NOT
// solved, and they must not be used to adjust geometry until they are solved from film frames.
import * as THREE from 'three';

export function referenceCameras(spec) {
  const c = spec.camera;
  const s = spec.solve;
  return [
    {
      id: 'R01', label: 'R01 set photo (solved)', solved: true,
      image: '/ref/stills/SET/F00001_WW-FACTFILE_hp_apt1.png', width: c.image.width, height: c.image.height,
      position: [c.x, c.y, c.z], target: [c.x, c.y, c.z - 10],
      intrinsics: { f: c.f, cx: c.vpX, cy: c.horizonY },
      note: 'Pinhole camera from the R01 solve. Image overlay should line up with the doorway, piers, corners and back-room window wall.',
    },
    {
      id: 'R04', label: 'R04 sisters in the doorway (approx.)', solved: false,
      image: '/ref/stills/PROMO/F00004_HPFZ-STILLS_fz_queenie-and-tina.jpg', width: 1050, height: 433,
      position: [(spec.doorway.clearX[0] + spec.doorway.clearX[1]) / 2 - 0.2, 1.45, 2.3],
      target: [(s.backRoom.rodLeftX[1] + s.backRoom.rodRightX[0]) / 2, 1.3, s.backRoom.backWallZ], vfov: 26,
      note: 'Approximate: frames the panelled doors with the two back-room windows and nightstand between them. Not solved.',
    },
    {
      id: 'R05', label: 'R05 back room, bed by window (approx.)', solved: false,
      image: '/ref/frames/SC45/F00005_HPFZ-STILLS_fz_jacob-and-the-hot-chocolate.jpg', width: 1050, height: 440,
      position: [2.9, 1.25, s.backRoom.bedFootZ + 0.9], target: [2.9, 0.95, s.backRoom.backWallZ], vfov: 32,
      note: 'Approximate: looking at the right-hand bed against the window wall (SC45). Not solved.',
    },
    {
      id: 'R02', label: 'R02 fireplace wall (approx.)', solved: false,
      image: '/ref/stills/PROMO/F00002_WW-FACTFILE_hp_apt2.png', width: 1800, height: 1248,
      position: [2.6, 1.45, (spec.fireplace.zFrom + spec.fireplace.zTo) / 2 - 0.4],
      target: [0, 1.25, (spec.fireplace.zFrom + spec.fireplace.zTo) / 2 - 0.9], vfov: 40,
      note: 'Approximate: facing the left wall with the fireplace and, to its right, the mirror cabinet. Not solved.',
    },
  ];
}

/** Configure a PerspectiveCamera for a reference camera, rendered into an image-shaped viewport. */
export function applyRefCamera(cam, ref, near = 0.05, far = 60) {
  cam.position.set(...ref.position);
  cam.up.set(0, 1, 0);
  cam.lookAt(new THREE.Vector3(...ref.target));
  cam.near = near; cam.far = far;
  cam.aspect = ref.width / ref.height;
  if (ref.intrinsics) {
    // asymmetric frustum from pixel intrinsics (principal point is not the image centre)
    const { f, cx, cy } = ref.intrinsics;
    const left = (-cx / f) * near, right = ((ref.width - cx) / f) * near;
    const top = (cy / f) * near, bottom = (-(ref.height - cy) / f) * near;
    cam.projectionMatrix.makePerspective(left, right, top, bottom, near, far);
    cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
    cam.userData.lockedProjection = true;
  } else {
    cam.fov = ref.vfov; cam.userData.lockedProjection = false;
    cam.updateProjectionMatrix();
  }
}

/** Project a world point with a solved reference camera to image pixels (same model as the solve). */
export function projectToImage(ref, p) {
  const { f, cx, cy } = ref.intrinsics;
  const [px, py, pz] = ref.position;
  const Z = pz - p[2];               // camera looks along -z
  return [cx + ((p[0] - px) * f) / Z, cy - ((p[1] - py) * f) / Z];
}
