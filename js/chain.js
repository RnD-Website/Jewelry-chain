// Procedural jewellery-chain builder (three.js).
// Each chain style is a sequence of interlocking links placed along a curve
// and rendered with InstancedMesh, so a full necklace costs a few draw calls.
import * as THREE from '../vendor/three.module.js';

// A closed "stadium" (rounded rectangle) centre-line for a link.
class LinkPath extends THREE.Curve {
  constructor(len, wid, corner = 0.5) {
    super();
    this.len = len; this.wid = wid;
    this.cr = Math.min(wid / 2, len / 2) * corner; // corner radius
  }
  getPoint(t, target = new THREE.Vector3()) {
    const hx = this.len / 2, hy = this.wid / 2, r = this.cr;
    const sx = hx - r, sy = hy - r;
    const segs = [2 * sx, Math.PI * r / 2, 2 * sy, Math.PI * r / 2, 2 * sx, Math.PI * r / 2, 2 * sy, Math.PI * r / 2];
    const total = segs.reduce((a, b) => a + b, 0);
    let d = (t % 1) * total, i = 0;
    while (i < segs.length - 1 && d > segs[i]) { d -= segs[i]; i++; }
    const f = segs[i] ? d / segs[i] : 0;
    const arc = (cx, cy, a0) => { const a = a0 + f * Math.PI / 2; return target.set(cx + r * Math.cos(a), cy + r * Math.sin(a), 0); };
    switch (i) {
      case 0: return target.set(-sx + f * 2 * sx, -hy, 0);
      case 1: return arc(sx, -sy, -Math.PI / 2);
      case 2: return target.set(hx, -sy + f * 2 * sy, 0);
      case 3: return arc(sx, sy, 0);
      case 4: return target.set(sx - f * 2 * sx, hy, 0);
      case 5: return arc(-sx, sy, Math.PI / 2);
      case 6: return target.set(-hx, sy - f * 2 * sy, 0);
      default: return arc(-sx, -sy, Math.PI);
    }
  }
}

function linkGeometry(len, wid, wire, corner = 1, flat = 1, seg = [96, 14]) {
  const g = new THREE.TubeGeometry(new LinkPath(len, wid, corner), seg[0], wire, seg[1], true);
  if (flat !== 1) g.scale(1, 1, flat);
  return g;
}

// Chain style definitions. Units: millimetres (1 unit = 1mm).
export const STYLES = {
  cable:     { links: [{ len: 5.2, wid: 3.4, wire: 0.62, corner: 1 }], pitch: 3.75, twist: Math.PI / 2 },
  paperclip: { links: [{ len: 11, wid: 3.6, wire: 0.55, corner: 0.55 }], pitch: 9.6, twist: Math.PI / 2 },
  box:       { links: [{ len: 3.6, wid: 3.6, wire: 0.55, corner: 0.35 }], pitch: 2.35, twist: Math.PI / 2 },
  curb:      { links: [{ len: 6.0, wid: 4.2, wire: 0.95, corner: 1, flat: 0.62 }], pitch: 3.55, twist: Math.PI / 2, tilt: 0.95 },
  figaro:    { links: [{ len: 4.6, wid: 3.2, wire: 0.6, corner: 1, flat: 0.75 }, { len: 9.8, wid: 3.4, wire: 0.6, corner: 1, flat: 0.75 }],
               pattern: [0, 0, 0, 1], pitches: [3.2, 3.2, 3.2, 8.5], twist: Math.PI / 2, tilt: 0.6 },
  rope:      { links: [{ len: 4.4, wid: 2.6, wire: 0.5, corner: 1 }], pitch: 0.95, twist: Math.PI / 3.2, lean: 0.62 },
};

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _s = new THREE.Vector3();
const _x = new THREE.Vector3(), _y = new THREE.Vector3(), _z = new THREE.Vector3(), _p = new THREE.Vector3();

/**
 * Build a chain along `curve` (THREE.Curve in mm).
 * opts.material, opts.planeNormal (for planar curves: stable link frames), opts.scale
 */
export function buildChain(style, curve, opts = {}) {
  const S = STYLES[style];
  const geos = S.links.map(l => linkGeometry(l.len, l.wid, l.wire, l.corner, l.flat, opts.segs));
  const length = curve.getLength();
  const pattern = S.pattern || [0];
  const pitches = S.pitches || [S.pitch];
  // collect placements
  const places = [];
  let d = 0, k = 0;
  while (d < length) { places.push({ d, type: pattern[k % pattern.length], k }); d += pitches[k % pitches.length]; k++; }
  // centre the long figaro link between neighbours
  const counts = geos.map(() => 0);
  places.forEach(p => counts[p.type]++);
  const meshes = geos.map((g, i) => {
    const m = new THREE.InstancedMesh(g, opts.material, counts[i]);
    m.castShadow = true; m.receiveShadow = true; m.count = 0;
    return m;
  });
  const N = opts.planeNormal ? opts.planeNormal.clone().normalize() : null;
  const ref = new THREE.Vector3(0, 0, 1);
  for (const p of places) {
    const u = Math.min(p.d / length, 0.99999);
    curve.getPointAt(u, _p);
    curve.getTangentAt(u, _x).normalize();
    if (N) { _z.copy(N); } else { _z.copy(ref); if (Math.abs(_z.dot(_x)) > 0.95) _z.set(0, 1, 0); }
    _y.crossVectors(_z, _x).normalize(); _z.crossVectors(_x, _y).normalize();
    _m.makeBasis(_x, _y, _z); _q.setFromRotationMatrix(_m);
    // rotate around the chain direction (alternate links)
    let roll = p.k * S.twist;
    if (S.tilt) roll = (p.k % 2) ? Math.PI / 2 - S.tilt * 0.55 : 0; // curb/figaro lie flatter
    _q2.setFromAxisAngle(new THREE.Vector3(1, 0, 0), roll);
    _q.multiply(_q2);
    if (S.lean) { _q2.setFromAxisAngle(new THREE.Vector3(0, 0, 1), S.lean); _q.multiply(_q2); }
    _s.setScalar(1);
    _m.compose(_p, _q, _s);
    const mesh = meshes[p.type];
    mesh.setMatrixAt(mesh.count++, _m);
  }
  const group = new THREE.Group();
  meshes.forEach(m => { m.instanceMatrix.needsUpdate = true; m.computeBoundingSphere(); group.add(m); });
  return group;
}

// Lobster clasp + jump ring, roughly to scale.
export function buildClasp(material) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.TorusGeometry(3.2, 1.1, 20, 48, Math.PI * 1.7), material);
  body.scale.set(1, 1.55, 0.8); body.rotation.z = Math.PI * 0.65; g.add(body);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.55, 14, 40), material);
  ring.position.y = 6.2; ring.rotation.y = Math.PI / 2; g.add(ring);
  const lever = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 2.4, 14), material);
  lever.position.set(2.6, -1.5, 0); lever.rotation.z = 0.5; g.add(lever);
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

export const GOLD = {
  yellow: { color: 0xf3c56a, roughness: 0.17 },
  rose:   { color: 0xf0b49a, roughness: 0.2 },
  white:  { color: 0xe6e6e8, roughness: 0.14 },
  antique:{ color: 0xd9a650, roughness: 0.32 },
};

export function goldMaterial(kind = 'yellow') {
  const g = GOLD[kind];
  return new THREE.MeshPhysicalMaterial({ color: g.color, metalness: 1, roughness: g.roughness, envMapIntensity: 1.25, clearcoat: 0.25, clearcoatRoughness: 0.12 });
}

// Hanging necklace: catenary-ish U shape in the XY plane, length in mm.
export function hangingCurve(width = 120, depth = 150, sag = 0.0) {
  const pts = [];
  const n = 40;
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = Math.PI * t;
    const x = -Math.cos(a) * width / 2;
    const y = -Math.pow(Math.sin(a), 1.35) * depth;
    const z = Math.sin(a * 2) * sag;
    pts.push(new THREE.Vector3(x, y, z));
  }
  return new THREE.CatmullRomCurve3(pts, false, 'centripetal');
}

// Closed loop lying on a surface (XZ plane) with organic wobble.
export function loopCurve(rx = 60, rz = 45, wobble = 6, seed = 1, nPts = 18) {
  const rnd = mulberry(seed);
  const pts = [];
  for (let i = 0; i < nPts; i++) {
    const a = (i / nPts) * Math.PI * 2;
    const w = 1 + (rnd() - 0.5) * wobble / 30;
    pts.push(new THREE.Vector3(Math.cos(a) * rx * w, 0, Math.sin(a) * rz * w));
  }
  return new THREE.CatmullRomCurve3(pts, true, 'centripetal');
}

// Open S-shaped / coiled drape on a surface (XZ plane).
export function drapeCurve(points) {
  return new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(p[0], p[2] || 0, p[1])), false, 'centripetal');
}

export function mulberry(a) {
  return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
