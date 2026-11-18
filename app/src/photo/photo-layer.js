// Photographic layer: projective texturing of a calibrated reference photograph onto the proxy geometry.
//
// Idea (the same family of technique as photographic VR environments): the apartment's geometry is a
// proxy; the surface colour comes from the PHOTOGRAPH, projected through the photo's solved camera. A depth
// map rendered from that camera makes sure a surface is photo-textured only where the camera could actually
// see it. Where it could not (hidden, facing away, outside the frame) the Phase 3 procedural materials
// remain as fill. From the photo's own viewpoint the result is the photograph itself, by construction;
// away from it, depth comes from the proxy geometry (so parallax is right wherever the proxy is right).
//
// Honest limits are documented in docs/PHOTOGRAPHIC_PIPELINE.md. Only sources with a SOLVED camera may be
// added to SOURCES: an unsolved image would put photo pixels on the wrong surfaces.
import * as THREE from 'three';

/** Calibrated photographic sources. camera: world position (m), focal length and principal point (px). */
export function photoSources(spec) {
  const c = spec.camera;
  return [{
    id: 'R01', catalogue: 'F00001', tier: 'T3 (official studio set photograph, not a film frame)',
    url: '/ref/stills/SET/F00001_WW-FACTFILE_hp_apt1.png', width: c.image.width, height: c.image.height,
    camera: { position: [c.x, c.y, c.z], f: c.f, cx: c.vpX, cy: c.horizonY },
    rooms: ['main', 'back'],
  }];
}

const VERT_DECL = 'varying vec3 vPhW; varying vec3 vPhN;\n';
const VERT_BODY = '\nvPhW = (modelMatrix * vec4(transformed, 1.0)).xyz; vPhN = mat3(modelMatrix) * normal;\n';
const FRAG_DECL = `
uniform sampler2D uPhTex; uniform sampler2D uPhDepth; uniform vec3 uPhPos; uniform float uPhF;
uniform vec2 uPhC; uniform vec2 uPhSize; uniform vec2 uPhNF; uniform float uPhMix; uniform float uPhDebug; uniform vec2 uPhFade; uniform sampler2D uPhMask;
varying vec3 vPhW; varying vec3 vPhN;
float phWeight(out vec3 col) {
  col = vec3(0.0);
  vec3 d = vPhW - uPhPos;
  float zc = -d.z;                                  // the photograph's camera looks along -z
  if (zc < 0.1) return 0.0;
  vec2 px = vec2(uPhC.x + d.x * uPhF / zc, uPhC.y - d.y * uPhF / zc);
  vec2 uv = px / uPhSize;                           // 0..1 from the top-left of the photograph
  if (uv.x <= 0.0 || uv.x >= 1.0 || uv.y <= 0.0 || uv.y >= 1.0) return 0.0;
  vec2 t = vec2(uv.x, 1.0 - uv.y);
  float zs = -perspectiveDepthToViewZ(texture2D(uPhDepth, t).x, uPhNF.x, uPhNF.y);
  if (zc > zs + 0.07 + 0.02 * zc) return 0.0;       // hidden from the photograph's camera
  vec3 n = normalize(vPhN); if (!gl_FrontFacing) n = -n;
  float wT = smoothstep(0.10, 0.40, dot(n, normalize(-d)));       // fade where the photo would be stretched
  vec2 e = min(uv, 1.0 - uv);
  float wE = smoothstep(0.0, 0.002, min(e.x, e.y));               // fade at the frame edge
  float wVraw = smoothstep(uPhFade.y, uPhFade.x, dot(normalize(cameraPosition - vPhW), normalize(uPhPos - vPhW)));
  float wV = 1.0;
#ifdef PH_FADE
  // complex proxies (furniture): use the photograph only while the viewer looks along roughly the same ray;
  // flat proxies (walls, floors, rugs, drapes) are exact from any angle and skip this
  wV = wVraw;
#endif
#ifdef PH_RING
  // flat surfaces: away from the capture ray, drop the photo in a ring around furniture silhouettes, where photographed
  // furniture pixels would otherwise land on the floor or wall behind the (smaller) proxy
  float ring = 0.0;
  for (int i = 0; i < 8; i++) { float a = float(i) * 0.785398; ring = max(ring, texture2D(uPhMask, t + vec2(cos(a), sin(a) * 1.44) * 0.02).r); }
  ring = max(ring, texture2D(uPhMask, t).r);
  wV = 1.0 - ring * smoothstep(0.0, 0.3, 1.0 - wVraw);
#endif
  col = texture2D(uPhTex, t).rgb;
  return wT * wE * wV;
}
`;
const FRAG_APPLY = `
{
  vec3 phc; float phw = uPhMix > 0.001 ? phWeight(phc) * uPhMix : 0.0;
  if (uPhDebug > 0.5) { outgoingLight = mix(vec3(0.55, 0.06, 0.06), vec3(0.06, 0.62, 0.18), step(0.5, phw)); diffuseColor.a = 1.0; }
  else { outgoingLight = mix(outgoingLight, phc, phw); diffuseColor.a = mix(diffuseColor.a, 1.0, phw); }
}
`;

export async function createPhotoLayer({ renderer, scene, spec, apt, interior, finishes, hideForDepth = [] }) {
  const src = photoSources(spec)[0];
  const NEAR = 0.05, FAR = 40;
  const tex = await new Promise((res) => new THREE.TextureLoader().load(src.url, res, undefined, () => res(null)));
  if (!tex) return null;                        // reference images are private: without them the layer stays off
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;

  // depth map from the photograph's camera (same asymmetric frustum as the solve)
  const DW = 1536, DH = Math.round((DW * src.height) / src.width);
  const depthTex = new THREE.DepthTexture(DW, DH); depthTex.minFilter = depthTex.magFilter = THREE.NearestFilter;
  const rt = new THREE.WebGLRenderTarget(DW, DH, { depthTexture: depthTex, depthBuffer: true });
  const MW = 768, MH = Math.round((MW * src.height) / src.width);
  const maskRT = new THREE.WebGLRenderTarget(MW, MH, { depthBuffer: true });
  const cam = new THREE.PerspectiveCamera();
  const { f, cx, cy } = src.camera;
  cam.position.set(...src.camera.position); cam.lookAt(src.camera.position[0], src.camera.position[1], src.camera.position[2] - 10);
  cam.near = NEAR; cam.far = FAR;
  cam.projectionMatrix.makePerspective((-cx / f) * NEAR, ((src.width - cx) / f) * NEAR, (cy / f) * NEAR, (-(src.height - cy) / f) * NEAR, NEAR, FAR);
  cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert(); cam.updateMatrixWorld(true);

  const U = {
    uPhTex: { value: tex }, uPhDepth: { value: depthTex }, uPhPos: { value: new THREE.Vector3(...src.camera.position) },
    uPhF: { value: f }, uPhC: { value: new THREE.Vector2(cx, cy) }, uPhSize: { value: new THREE.Vector2(src.width, src.height) },
    uPhNF: { value: new THREE.Vector2(NEAR, FAR) }, uPhMix: { value: 1 }, uPhDebug: { value: 0 }, uPhMask: { value: null }, uPhFade: { value: new THREE.Vector2(Math.cos(THREE.MathUtils.degToRad(7)), Math.cos(THREE.MathUtils.degToRad(24))) },
  };

  // Window backdrops: the photograph shows the view through the nets; the proxy has only an empty hole there.
  const backdrop = new THREE.Group(); backdrop.name = 'photoBackdrop'; backdrop.userData.interior = true;
  const ww = spec.walls.find((w) => w.id === 'backWindowWall');
  const bdMat = new THREE.MeshStandardMaterial({ color: '#cfd6da', roughness: 1, metalness: 0, side: THREE.DoubleSide });
  for (const o of ww.openings) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(o.to - o.from + 0.12, o.top - o.bottom + 0.12), bdMat);
    m.position.set((o.from + o.to) / 2, (o.top + o.bottom) / 2, ww.at - ww.thickness / 2 - 0.02);
    m.userData = { interior: true, kind: 'backdrop', id: `backdrop_${o.id}` }; backdrop.add(m);
  }
  scene.add(backdrop);

  // patch materials (opaque and translucent alike: the photograph is the final composite)
  const patched = new Set();
  function patch(mat, fade = false, ring = false) {
    if (!mat || patched.has(mat) || mat.isMeshBasicMaterial || mat.isLineBasicMaterial || !mat.isMeshStandardMaterial) return;
    patched.add(mat);
    const prev = mat.onBeforeCompile;
    mat.onBeforeCompile = (shader, r) => {
      prev?.(shader, r);
      Object.assign(shader.uniforms, U);
      if (fade) shader.fragmentShader = '#define PH_FADE\n' + shader.fragmentShader;
      if (ring) shader.fragmentShader = '#define PH_RING\n' + shader.fragmentShader;
      shader.vertexShader = VERT_DECL + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>' + VERT_BODY);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <packing>', '#include <packing>\n' + FRAG_DECL)
        .replace('#include <opaque_fragment>', FRAG_APPLY + '#include <opaque_fragment>');
    };
    mat.customProgramCacheKey = () => (fade ? 'photo-r01-fade' : ring ? 'photo-r01-ring' : 'photo-r01');
    mat.needsUpdate = true;
  }
  // flat or nearly flat proxies keep the photograph from any angle; everything else fades with view angle
  const FLAT = new Set(['rugPink', 'rugOriental', 'drape', 'curtainFloral', 'sheer']);
  for (const [k, m] of Object.entries(interior.mats)) patch(m, !FLAT.has(k), FLAT.has(k));
  for (const m of Object.values(finishes.materials)) patch(m, false, true);
  patch(bdMat, false, true);
  const furnMats = new Set(Object.entries(interior.mats).filter(([k, m]) => !FLAT.has(k) && !m.transparent).map(([, m]) => m));

  // depth pass: everything opaque that the photograph's camera would see, nothing else
  const depthMat = new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide });
  function refreshDepth() {
    const hidden = [];
    const hide = (o) => { if (o.visible) { o.visible = false; hidden.push(o); } };
    hideForDepth.forEach((g) => g && hide(g));
    scene.traverse((o) => {
      if (o.userData?.edgeOverlay || o.isLine || o.isLineSegments || o.isSprite || o.isLight) hide(o);
      else if (o.isMesh && [].concat(o.material).some((m) => m.transparent)) hide(o);
    });
    const prevTarget = renderer.getRenderTarget(), prevOverride = scene.overrideMaterial, xr = renderer.xr.enabled;
    renderer.xr.enabled = false; scene.overrideMaterial = depthMat;
    renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene, cam);
    renderer.setRenderTarget(prevTarget); scene.overrideMaterial = prevOverride; renderer.xr.enabled = xr;
    hidden.forEach((o) => { o.visible = true; });
  }
  const maskMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  function refreshMask() {
    const swapped = [], hidden = [];
    scene.traverse((o) => {
      if (o.isMesh && furnMats.has(o.material) && o.visible) { swapped.push([o, o.material]); o.material = maskMat; }
      else if ((o.isMesh || o.isLine || o.isLineSegments) && o.visible && !(o.parent && o.parent.visible === false)) { if (o !== scene) { hidden.push(o); o.visible = false; } }
    });
    // re-show the swapped furniture meshes (hidden above only if they were not furniture)
    swapped.forEach(([o]) => { o.visible = true; });
    const prevTarget = renderer.getRenderTarget(), prevBg = scene.background, prevEnv = scene.environment, xr = renderer.xr.enabled;
    renderer.xr.enabled = false; scene.background = null; scene.environment = null;
    renderer.setClearColor(0x000000, 1); renderer.setRenderTarget(maskRT); renderer.clear(); renderer.render(scene, cam);
    renderer.setRenderTarget(prevTarget); scene.background = prevBg; scene.environment = prevEnv; renderer.xr.enabled = xr;
    swapped.forEach(([o, m]) => { o.material = m; });
    hidden.forEach((o) => { o.visible = true; });
  }
  U.uPhMask.value = maskRT.texture;
  refreshDepth(); refreshMask();

  return {
    source: src, uniforms: U, backdrop, refreshDepth: () => { refreshDepth(); refreshMask(); },
    setMix: (v) => { U.uPhMix.value = v; },
    setFade: (loDeg, hiDeg) => U.uPhFade.value.set(Math.cos(THREE.MathUtils.degToRad(loDeg)), Math.cos(THREE.MathUtils.degToRad(hiDeg))),
    maskStats: () => { const b = new Uint8Array(MW * MH * 4); renderer.readRenderTargetPixels(maskRT, 0, 0, MW, MH, b); let n = 0; for (let i = 0; i < b.length; i += 4) if (b[i] > 128) n++; return { w: MW, h: MH, white: n, fraction: n / (MW * MH) }; },
    setDebug: (on) => { U.uPhDebug.value = on ? 1 : 0; },
    get mix() { return U.uPhMix.value; },
    textureMB: (src.width * src.height * 4 * 1.333) / 1048576, depthMB: (DW * DH * 4) / 1048576,
  };
}
