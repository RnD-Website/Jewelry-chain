// Live 3D carousel of necklaces for the showcase's black card.
import * as THREE from '../vendor/three.module.js';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';
import { buildChain, buildClasp, goldMaterial, hangingCurve } from './chain.js';

export function createStage(canvas, products) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x050505, 1);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
  const key = new THREE.DirectionalLight(0xfff0dc, 2.2); key.position.set(-120, 160, 220); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffd9b0, 1.4); rim.position.set(180, -40, -160); scene.add(rim);

  const camera = new THREE.PerspectiveCamera(30, 1, 10, 3000);
  camera.position.set(0, 0, 380);

  const items = products.map((p, i) => {
    const mat = goldMaterial(p.metal);
    mat.transparent = true;
    const curve = hangingCurve(p.style === 'paperclip' ? 76 : 70, p.style === 'curb' ? 100 : 108, 6);
    const chain = buildChain(p.style, curve, { material: mat, segs: [44, 9] });
    const clasp = buildClasp(mat); clasp.scale.setScalar(0.9);
    const end = curve.getPoint(0); clasp.position.set(end.x - 1, end.y - 2, end.z); clasp.rotation.z = 0.25;
    const g = new THREE.Group(); g.add(chain); g.add(clasp);
    // centre the hanging necklace on its own middle so it spins in place
    const box = new THREE.Box3().setFromObject(g); const c = box.getCenter(new THREE.Vector3());
    g.children.forEach(o => o.position.sub(c));
    const pivot = new THREE.Group(); pivot.add(g); scene.add(pivot);
    return { pivot, g, mat, base: mat.color.clone(), phase: i * 1.3 };
  });

  let w = 0, h = 0;
  function resize() {
    const r = canvas.getBoundingClientRect();
    if (r.width === w && r.height === h) return;
    w = r.width; h = r.height;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the centre necklace at ~58% of the card height, whatever the aspect
    const fitH = 170, fitW = 200;
    const dist = Math.max(fitH / (2 * Math.tan(THREE.MathUtils.degToRad(15))), fitW / (2 * Math.tan(THREE.MathUtils.degToRad(15)) * camera.aspect));
    camera.position.z = dist; camera.updateProjectionMatrix();
  }

  let last = 0, spin = 0;
  function render(now, idxF, visible) {
    if (!visible) return;
    resize();
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    spin += dt * 0.55;
    const halfW = Math.tan(THREE.MathUtils.degToRad(15)) * camera.position.z * camera.aspect;
    const side = Math.min(halfW * 0.72, 92);
    items.forEach((it, i) => {
      const d = i - idxF, ad = Math.abs(d), sd = Math.sign(d);
      const x = sd * (Math.min(ad, 1) * side + Math.max(0, ad - 1) * side * 0.6);
      const s = lerp(1, 0.4, Math.min(ad, 1));
      it.pivot.position.set(x, lerp(0, -6, Math.min(ad, 1)), -Math.min(ad, 1) * 30);
      it.pivot.scale.setScalar(s);
      it.g.rotation.y = spin + it.phase + d * 0.6;
      it.g.rotation.x = Math.sin(spin * 0.7 + it.phase) * 0.12;
      const dim = lerp(1, 0.42, Math.min(ad, 1));
      it.mat.color.copy(it.base).multiplyScalar(dim);
      it.mat.envMapIntensity = 1.25 * dim;
      it.mat.opacity = clamp(1.9 - ad);
      it.pivot.visible = ad < 1.95;
    });
    renderer.render(scene, camera);
  }
  return { render };
}
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
