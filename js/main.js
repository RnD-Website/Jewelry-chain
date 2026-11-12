import Lenis from '../vendor/lenis.mjs';

/* =========================================================
   DATA
   ========================================================= */
const IMG = 'assets/img/';
const PRODUCTS = [
  { id: 'halo',     name: 'Halo',     style: 'cable',     metal: 'yellow',  price: 1240, img: 'prod_cable.jpg',     specs: ['14k yellow gold', 'Cable link', '45 cm'] },
  { id: 'meridian', name: 'Meridian', style: 'curb',      metal: 'yellow',  price: 2180, img: 'prod_curb.jpg',      specs: ['18k yellow gold', 'Curb link', 'Handmade'] },
  { id: 'solenne',  name: 'Solenne',  style: 'rope',      metal: 'rose',    price: 1890, img: 'prod_rope.jpg',      specs: ['Rose gold', 'Rope twist', 'Handmade'] },
  { id: 'lune',     name: 'Lune',     style: 'paperclip', metal: 'white',   price: 1460, img: 'prod_paperclip.jpg', specs: ['White gold', 'Paperclip', '50 cm'] },
  { id: 'vesper',   name: 'Vesper',   style: 'figaro',    metal: 'antique', price: 1650, img: 'prod_figaro.jpg',    specs: ['Yellow gold', 'Figaro link', 'Brushed finish'] },
];
const EDIT = [
  { id: 'halo-fine',  name: 'Halo Fine',   meta: 'Cable · 1.6 mm · 42–45 cm', price: 690,  img: 'tile_cable.jpg',     alt: 'dark_cable.jpg',     tag: 'Bestseller', sw: ['#e8c06e', '#efb59c', '#dcdcdf'] },
  { id: 'solenne-s',  name: 'Solenne',     meta: 'Rope · 2.4 mm · 50 cm',     price: 1890, img: 'tile_rope.jpg',      alt: 'dark_rope.jpg',      tag: 'New',        sw: ['#e8c06e', '#efb59c'] },
  { id: 'lune-s',     name: 'Lune',        meta: 'Paperclip · 3.6 mm · 50 cm', price: 1460, img: 'tile_paperclip.jpg', alt: 'dark_paperclip.jpg', tag: '',           sw: ['#e8c06e', '#dcdcdf'] },
  { id: 'vesper-s',   name: 'Vesper',      meta: 'Figaro · 3.2 mm · 48 cm',   price: 1650, img: 'tile_figaro.jpg',    alt: 'dark_figaro.jpg',    tag: '',           sw: ['#d9a650', '#e8c06e'] },
  { id: 'meridian-r', name: 'Meridian Rose', meta: 'Curb · 4.2 mm · 45 cm',   price: 2240, img: 'tile_curb.jpg',      alt: 'dark_curb.jpg',      tag: 'Limited',    sw: ['#efb59c', '#e8c06e'] },
];
// Hero products, in ring order (clockwise from the top). The ring turns one tile per step, so the
// tile reaching the top runs teal → bar → circles → clover → opal → onyx → silver → leaf, as in the
// Figma frames 1–8. Each product has a studio cut-out (p-*-cut.png, 715×1150 frame, pendant centred at
// 357,660) and a worn photo (p-*-worn.jpg, w×h). x, y, cw place the cut-out frame on the worn photo
// (top-left and width in photo pixels), measured from the two images, so the cut-out lands on the
// photographed pendant.
const HERO = [
  { key: 'teal', pos: '50% 70%', w: 1089, h: 1444, x: 335.7, y: 619.5, cw: 420.0 , metal: 'yellow', at: { y: 526, xl: 320.5, xr: 394.0 } },
  { key: 'leaf', pos: '59% 55%', w: 1500, h: 1986, x: 484.4, y: 362.5, cw: 801.0 , metal: 'rose', at: { y: 541, xl: 330.0, xr: 376.0 } },
  { key: 'silver', pos: '50% 61%', w: 906, h: 1200, x: 265.3, y: 379.6, cw: 379.5 , metal: 'white', at: { y: 564, xl: 333.5, xr: 377.5 } },
  { key: 'onyx', pos: '39% 58%', w: 1359, h: 1800, x: 232.4, y: 477.3, cw: 605.7, metal: 'yellow', at: { y: 513, xl: 334.0, xr: 376.0 } },
  { key: 'opal', pos: '58% 56%', w: 1511, h: 2000, x: 347.0, y: 136.5, cw: 1060.5 , metal: 'rose', at: { y: 537, xl: 327.0, xr: 402.0 } },
  { key: 'clover', pos: '42% 76%', w: 1511, h: 2000, x: 486.8, y: 1254.1, cw: 287.3 , metal: 'yellow', at: { y: 592, xl: 307.5, xr: 411.0 } },
  { key: 'circles', pos: '52% 84%', w: 1511, h: 2000, x: 516.6, y: 1186.4, cw: 527.4 , metal: 'yellow', at: { y: 507, xl: 335.0, xr: 376.5 } },
  { key: 'bar', pos: '48% 54%', w: 1500, h: 1986, x: 244.6, y: 187.9, cw: 947.8 , metal: 'yellow', at: { y: 516, xl: 334.5, xr: 379.0 } },
];

const $ = (s, r = document) => r.querySelector(s);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const range = (v, a, b) => clamp((v - a) / (b - a));
const smooth01 = t => t * t * (3 - 2 * t);
const ease = t => 1 - Math.pow(1 - t, 3);
const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const money = n => '$' + n.toLocaleString('en-US');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =========================================================
   SMOOTH SCROLL
   ========================================================= */
const lenis = new Lenis({ lerp: 0.085, smoothWheel: !reduced });
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const id = a.getAttribute('href'); if (id.length < 2) return;
  const t = document.querySelector(id); if (!t) return;
  e.preventDefault(); lenis.scrollTo(t, { offset: id === '#showcase' ? 0 : -10, duration: 1.6 });
}));

let vw = innerWidth, vh = innerHeight;
let isMobile = vw <= 760;

/* =========================================================
   HERO
   ========================================================= */
const hero = $('#hero'), orbit = $('#orbit'), pendant = $('#pendant'), expander = $('#expander');
const heroSticky = $('.hero__sticky');
const heroTitle = $('#heroTitle'), made = $('#made'), heroFoot = $('.hero__foot'), nav = $('#nav'), cats = $('#cats');
const madeWords = [...made.querySelectorAll('.w')];
const pendSway = pendant.querySelector('.pendant__sway');
const expShade = expander.querySelector('.expander__shade');
const CUT = { w: 715, h: 1150, cx: 357, cy: 660 };

const img = (src, cls, alt = '') => { const i = new Image(); i.src = IMG + src; i.alt = alt; i.draggable = false; if (cls) i.className = cls; return i; };
// ring tiles show the worn photos; the centre and the full-screen photo follow the selected one
const tiles = HERO.map((h, i) => {
  const el = document.createElement('div'); el.className = 'tile'; el.style.setProperty('--i', i);
  const im = img(`p-${h.key}-tile.jpg`); im.style.objectPosition = h.pos;
  el.appendChild(im); orbit.insertBefore(el, pendant);
  return { el, img: im, depth: 0.6 + (i % 3) * 0.25 };
});
HERO.forEach(h => {
  // pendant trimmed just above where its chain attaches; the chain strands are drawn separately
  h.full = img(`p-${h.key}-trim.png`, 'pendant__img'); h.only = img(`p-${h.key}-trim.png`, 'pendant__img pendant__img--only');
  pendSway.append(h.full, h.only);
  h.photo = img(`p-${h.key}-worn.jpg`, 'exp-photo', 'Necklace worn at the collarbone');
  h.photo.width = h.w; h.photo.height = h.h; h.photo.style.width = h.w + 'px'; h.photo.style.height = h.h + 'px';
  expander.insertBefore(h.photo, expShade);
});

// chain strands: each product has its own pair, starting exactly where its chain meets the bail and
// running up through the gaps either side of the top tile. A pair fades, blurs and scales with its own
// pendant, so the strands you see always belong to (and touch) the pendant on screen. They sit above
// the tiles so they are never cut off.
HERO.forEach(h => {
  h.arms = [-1, 1].map(side => {
    const el = document.createElement('div'); el.className = 'arm';
    el.style.backgroundImage = `url(${IMG}chain-${h.metal}.png)`;
    orbit.appendChild(el);
    return { side, el };
  });
});

// selection: the tile at the top of the ring
let sel = 0, selFrom = 0, selT0 = -1e9;
const topTile = () => ((Math.round(-wheelTo / 45)) % 8 + 8) % 8;
let pSm = 0, lastHT = 0;

// category pills
const catEls = [...cats.children];
let catIdx = 0;
function layoutCats() {
  catEls.forEach((li, i) => {
    const d = i - catIdx;
    li.classList.toggle('on', d === 0); li.classList.toggle('near', Math.abs(d) === 1);
    li.style.setProperty('--y', (d * 34) + 'px');   // the active label sits above the top tile; others slide past
  });
}
layoutCats();

// wheel stepping: one tile (45°) per step so every product reaches the top
let wheel = 0, wheelFrom = 0, wheelTo = 0, wheelT0 = 0, heroP = 0;
const STEP_MS = 3000, TWEEN_MS = 1300;
let lastStep = performance.now() + 1500;

let R = 0, T = 0;
function measure() {
  vw = innerWidth; vh = innerHeight; isMobile = vw <= 760;
  R = isMobile ? vw * 0.33 : Math.min(vw * 0.166, vh * 0.31);
  T = isMobile ? vw * 0.19 : Math.min(vw * 0.084, vh * 0.16);
  // overlap the next section by half the eased release so the photo meets it edge to edge
  document.querySelector('.collections').style.marginTop = (-vh * 0.2) + 'px';
  // ring position: centred in the space between the end of the headline and the right edge, so the
  // gap to the text and the margin on the right come out equal (phones keep it centred)
  ORBX = vw / 2;
  if (!isMobile) {
    const titleRight = heroTitle.getBoundingClientRect().right;
    const padR = Math.max(24, vw * 0.02), ext = R + T * 0.78;     // ring half-width incl. the side tiles
    ORBX = clamp((titleRight + vw - padR) / 2, vw / 2, vw - padR - ext);
  }
  orbit.style.left = ORBX + 'px';
}
let ORBX = innerWidth / 2;
measure();
document.fonts && document.fonts.ready.then(measure);

let mx = 0, my = 0, smx = 0, smy = 0;
addEventListener('pointermove', e => { mx = e.clientX / vw - .5; my = e.clientY / vh - .5; }, { passive: true });

// where the selected photo sits on the full screen: covering it, with the pendant a little below centre
function photoCover(h) {
  const s = Math.max(vw / h.w, vh / h.h);
  const pcx = (h.x + h.cw * CUT.cx / CUT.w) * s, pcy = (h.y + h.cw * CUT.cy / CUT.w) * s;
  return { s, ox: clamp(vw / 2 - pcx, vw - h.w * s, 0), oy: clamp(vh * 0.62 - pcy, vh - h.h * s, 0) };
}

function heroFrame(now) {
  // progress through the pinned hero
  const rect = hero.getBoundingClientRect();
  // the last EXIT px of the pin are a hand-off: the full-bleed photo starts moving
  // gently and accelerates to normal scroll speed, so the release has no jolt
  const EXIT = vh * 0.4;
  const total = hero.offsetHeight - vh - EXIT;
  const p = clamp(-rect.top / total);
  heroP = p;
  const xs = clamp(-rect.top - total, 0, EXIT);
  heroSticky.style.transform = `translate3d(0, ${-(xs * xs) / (2 * EXIT)}px, 0)`;
  if (rect.bottom < -50) return; // off-screen

  // auto-rotate the ring while at rest; the centre product changes on the same clock
  if (p < 0.02 && now - lastStep > STEP_MS && !reduced) {
    lastStep = now; wheelFrom = wheel; wheelTo = wheel + 45; wheelT0 = now;
    catIdx = (catIdx + 1) % catEls.length; layoutCats();
    selFrom = sel; sel = topTile(); selT0 = now;
  }
  wheel = lerp(wheelFrom, wheelTo, easeIO(clamp((now - wheelT0) / TWEEN_MS)));
  smx = lerp(smx, mx, .06); smy = lerp(smy, my, .06);

  const a = ease(range(p, 0, 0.24));            // tiles disperse
  const b = easeIO(range(p, 0.04, 0.5));        // photo opens to full-bleed
  const c = range(p, 0.42, 0.62);               // headline blurs out
  const spread = R * (1 + 0.38 * a);
  tiles.forEach((t, i) => {
    const ang = wheel + i * 45;
    const rad = (ang - 90) * Math.PI / 180;
    const x = Math.cos(rad) * spread + smx * 26 * t.depth;
    const y = Math.sin(rad) * spread + smy * 20 * t.depth;
    t.el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${ang}deg) scale(${1 - 0.1 * a})`;
    t.img.style.transform = `rotate(${-ang}deg)`;
    t.el.style.opacity = 1 - a;
    t.el.style.filter = a > 0.01 ? `blur(${a * 6}px)` : '';
  });
  cats.style.opacity = 1 - a;
  // style label: centred just above the top tile, between the chain strands
  cats.style.transform = `translate3d(${ORBX}px, ${vh * (isMobile ? 0.57 : 0.5) - spread - T / 2 - 14}px, 0)`;

  // smoothed progress for the pendant journey (glides between wheel notches)
  const dtH = lastHT ? Math.min(0.1, (now - lastHT) / 1000) : 0.016; lastHT = now;
  pSm += (p - pSm) * (1 - Math.exp(-dtH * 8)); if (Math.abs(p - pSm) < 0.0004) pSm = p;
  const q = reduced ? p : pSm;
  const S = HERO[sel];
  const land = easeIO(range(q, 0.06, 0.5));     // the selected product travels down onto the neck
  const open = easeIO(range(q, 0.04, 0.5));     // its photo opens around it
  const chainOff = range(q, 0.24, 0.4);         // its loose chain gives way to the pendant alone
  const melt = S.early ? range(q, 0.28, 0.42) : range(q, 0.4, 0.52);   // the cut-out melts into the photo
  const T0 = now / 1000;

  // cut-out: rest (centred in the ring) → exactly over the pendant in the full-screen photo
  const oxC = ORBX, oyC = vh * (isMobile ? 0.57 : 0.5);   // orbit centre
  const W0 = pendant.offsetWidth;
  const rx = -W0 * CUT.cx / CUT.w + smx * -10, ry = -W0 * CUT.cy / CUT.w + W0 * 0.06 + smy * -8;
  const cov = photoCover(S);
  const tW = S.cw * cov.s, tx = cov.ox + S.x * cov.s - oxC, ty = cov.oy + S.y * cov.s - oyC;
  const k = lerp(1, tW / W0, land), X = lerp(rx, tx, land), Y = lerp(ry, ty, land);
  pendant.style.transform = `translate3d(${X}px, ${Y}px, 0) scale(${k})`;
  pendant.style.opacity = 1 - melt;

  // the product swap: outgoing blurs and shrinks, incoming sharpens and settles
  const se = selFrom === sel ? 1 : easeIO(clamp((now - selT0) / TWEEN_MS));
  HERO.forEach((h, j) => {
    const v = j === sel ? se : (j === selFrom && selFrom !== sel) ? 1 - se : 0;
    const blur = (1 - v) * 8, sc = j === sel ? 1 + 0.05 * (1 - v) : 1 - 0.04 * (1 - v);
    [h.full, h.only].forEach(el => {
      el.style.filter = v > 0.001 && blur > 0.05 ? `blur(${blur}px)` : '';
      el.style.transform = v < 0.999 ? `scale(${sc})` : '';
    });
    h.full.style.opacity = v * (1 - chainOff); h.only.style.opacity = v * chainOff;
  });
  const swayAmp = reduced ? 0 : (1 - range(q, 0, 0.3));
  const swayDeg = Math.sin(T0 * 0.97) * 1.6 * swayAmp, swayY = (Math.sin(T0 * 1.94) * 0.5 - 0.5) * 4 * swayAmp;
  pendSway.style.transform = `rotate(${swayDeg}deg) translateY(${swayY}px)`;

  // chain strands, attached to each visible pendant (following its sway and its swap scale)
  const scl = W0 / CUT.w, H0 = W0 * CUT.h / CUT.w;
  const sr = swayDeg * Math.PI / 180, pivX = rx + W0 / 2, pivY = ry;
  const corrHW = T / 2 / R, corrDX = 0.7071 - (T / 2) * 1.414 * 0.9 / R;   // top tile half-width, diagonal tile's inner corner
  const cX = (corrHW + corrDX) / 2 * R, cY = -(1 - corrHW) * R;              // the gap beside the top tile
  const topY = -oyC + 76;                                                    // just under the nav
  const thick = clamp(W0 * 0.017, 5, 9);
  const armsOn = 1 - range(q, 0.02, 0.12);
  HERO.forEach((h, j) => {
    const v = j === sel ? se : (j === selFrom && selFrom !== sel) ? 1 - se : 0;
    if (v <= 0.001 || armsOn <= 0.001) { h.arms.forEach(a => { a.el.style.opacity = 0; }); return; }
    const sc = j === sel ? 1 + 0.05 * (1 - v) : 1 - 0.04 * (1 - v);    // same scale as the pendant layer
    const blur = (1 - v) * 8;
    h.arms.forEach(arm => {
      // attachment point in the cut-out, scaled about the layer's origin (50% 57%), then placed and swayed
      const ox = 0.5 * W0, oy = 0.57 * H0;
      const lx = ox + ((arm.side < 0 ? h.at.xl : h.at.xr) * scl - ox) * sc, ly = oy + (h.at.y * scl - oy) * sc;
      const px = rx + lx - pivX, py = ry + ly - pivY;
      const Ax = pivX + px * Math.cos(sr) - py * Math.sin(sr), Ay = pivY + px * Math.sin(sr) + py * Math.cos(sr) + swayY;
      // aim through the gap; if the attachment already sits above it, rise at the same gentle angle
      let dx = arm.side * cX - Ax, dy = cY - Ay;
      if (dy > -20) { dx = arm.side * 0.36; dy = -1; }
      const n = Math.hypot(dx, dy); dx /= n; dy /= n;
      const L = (topY - Ay) / dy;
      arm.el.style.width = L + 'px'; arm.el.style.height = thick + 'px';
      arm.el.style.transform = `translate3d(${Ax}px, ${Ay - thick / 2}px, 0) rotate(${Math.atan2(dy, dx)}rad)`;
      arm.el.style.opacity = v * armsOn;
      arm.el.style.filter = blur > 0.05 ? `brightness(1.18) saturate(1.08) blur(${blur}px)` : '';
    });
  });

  // the selected product's photo, kept aligned under the cut-out the whole way down
  const sig = (W0 * k) / S.cw;                               // screen px per photo px
  const pox = oxC + X - sig * S.x, poy = oyC + Y - sig * S.y;
  HERO.forEach(h => { h.photo.style.opacity = h === S ? 1 : 0; });
  S.photo.style.transform = `translate3d(${pox}px, ${poy}px, 0) scale(${sig})`;

  // photo window: a rounded card around the pendant that opens to the full screen
  const bcx = oxC + X + k * W0 * CUT.cx / CUT.w, bcy = oyC + Y + k * W0 * CUT.cy / CUT.w;
  const cw0 = k * W0 * 0.62, ch0 = k * W0 * 0.8;
  const L = lerp(bcx - cw0 / 2, 0, open), Tt = lerp(bcy - ch0 * 0.55, 0, open);
  const Rr = lerp(bcx + cw0 / 2, vw, open), Bb = lerp(bcy + ch0 * 0.45, vh, open);
  const rad = lerp(26, 0, range(open, 0.6, 1));
  expander.style.clipPath = `inset(${Tt}px ${vw - Rr}px ${vh - Bb}px ${L}px round ${rad}px)`;
  expander.style.opacity = smooth01(range(q, 0.02, 0.14));
  expander.style.transform = `scale(${1 + 0.06 * range(p, 0.58, 1)})`;
  expShade.style.opacity = range(open, 0.5, 1);

  heroTitle.style.filter = c > 0 ? `blur(${c * 12}px)` : '';
  heroTitle.style.opacity = 1 - range(p, 0.5, 0.66);
  heroTitle.style.color = b > 0.55 ? '#fff' : '';

  madeWords.forEach((wd, n) => {
    const qq = ease(range(p, 0.6 + n * 0.04, 0.72 + n * 0.04));
    wd.style.opacity = qq; wd.style.filter = `blur(${(1 - qq) * 12}px)`; wd.style.transform = `translateY(${(1 - qq) * 0.18}em)`;
  });

  const light = b > 0.62;
  heroFoot.classList.toggle('is-light', light);
  heroFoot.classList.toggle('swap', p > 0.6);
  nav.classList.toggle('is-light', light && rect.bottom > 60);
}

/* =========================================================
   COLLECTIONS / REVEALS
   ========================================================= */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 2) * 0.08 + 's'; io.observe(el); });

/* =========================================================
   SHOWCASE
   ========================================================= */
const showcase = $('#showcase'), scImgs = $('#scImgs'), scTitle = $('#scTitle'), scPrice = $('#scPrice'), scSpecs = $('#scSpecs'), scDots = $('#scDots'), scMeta = $('#scMeta');
const scImgEls = PRODUCTS.map(p => { const im = new Image(); im.src = IMG + p.img; im.alt = `${p.name} ${p.style} chain`; im.loading = 'lazy'; scImgs.appendChild(im); return im; });
const scTitleEls = PRODUCTS.map(p => { const s = document.createElement('span'); s.textContent = p.name + '.'; scTitle.appendChild(s); return s; });
const dotEls = PRODUCTS.map(() => { const b = document.createElement('b'); scDots.appendChild(b); return b; });
let scIdxF = 0, scActive = -1;
function setActive(i) {
  if (i === scActive) return; scActive = i;
  const p = PRODUCTS[i];
  scTitleEls.forEach((s, k) => s.classList.toggle('on', k === i));
  dotEls.forEach((d, k) => d.classList.toggle('on', k === i));
  scPrice.textContent = money(p.price);
  scSpecs.innerHTML = p.specs.join('<i>•</i>');
  scMeta.textContent = `${String(i + 1).padStart(2, '0')} / ${String(PRODUCTS.length).padStart(2, '0')} — ${p.style} chain`;
}
setActive(0);
$('#scAdd').addEventListener('click', () => { const p = PRODUCTS[scActive]; addToCart({ id: p.id, name: p.name, meta: p.specs.join(' · '), price: p.price, img: p.img }); });

let stage = null;
function showcaseFrame(now) {
  const r = showcase.getBoundingClientRect();
  const total = showcase.offsetHeight - vh;
  const p = clamp(-r.top / total);
  const N = PRODUCTS.length;
  const target = clamp(p * 1.12 - 0.06) * (N - 1);
  scIdxF = lerp(scIdxF, target, 0.12);
  setActive(Math.round(scIdxF));
  scImgEls.forEach((im, i) => {
    const d = scIdxF - i, o = clamp(1 - Math.abs(d) * 1.4);
    im.style.opacity = o;
    im.style.transform = `scale(${1.04 + Math.abs(d) * 0.05}) translateY(${-d * 3}%)`;
  });
  if (stage) stage.render(now, scIdxF, r.bottom > 0 && r.top < vh);
  const pinned = r.top <= 1 && r.bottom >= vh - 1;
  nav.classList.toggle('is-hidden', pinned);
  nav.classList.toggle('is-solid', hero.getBoundingClientRect().bottom < 70 && !pinned);
}
// lazy-load the 3D stage
const stageIO = new IntersectionObserver(async es => {
  if (es.some(e => e.isIntersecting) && !stage) {
    stageIO.disconnect();
    try {
      const { createStage } = await import('./stage.js');
      stage = createStage($('#chainCanvas'), PRODUCTS);
    } catch (err) { console.warn('3D stage unavailable', err); }
  }
}, { rootMargin: '200% 0px' });
stageIO.observe(showcase);

/* =========================================================
   EDIT GRID
   ========================================================= */
$('#editGrid').innerHTML = EDIT.map(e => `
  <article class="card reveal">
    <div class="card__media">
      <img src="${IMG + e.img}" alt="${e.name} chain" loading="lazy">
      <img class="alt" src="${IMG + e.alt}" alt="" loading="lazy">
      ${e.tag ? `<span class="card__tag">${e.tag}</span>` : ''}
      <button class="card__add" data-id="${e.id}">Add to cart — ${money(e.price)}</button>
    </div>
    <div class="card__row"><h3 class="card__name">${e.name}</h3><span class="card__price">${money(e.price)}</span></div>
    <div class="card__row"><span class="card__meta">${e.meta}</span><span class="swatches">${e.sw.map(c => `<i style="background:${c}"></i>`).join('')}</span></div>
  </article>`).join('');
document.querySelectorAll('#editGrid .reveal').forEach((el, i) => { el.style.transitionDelay = (i % 6) * 0.07 + 's'; io.observe(el); });
$('#editGrid').addEventListener('click', ev => {
  const b = ev.target.closest('.card__add'); if (!b) return;
  const e = EDIT.find(x => x.id === b.dataset.id);
  addToCart({ id: e.id, name: e.name, meta: e.meta, price: e.price, img: e.img });
});

/* =========================================================
   CART
   ========================================================= */
let cart = [];
try { cart = JSON.parse(localStorage.getItem('orelle-cart') || '[]'); } catch (_) { cart = []; }
const save = () => { try { localStorage.setItem('orelle-cart', JSON.stringify(cart)); } catch (_) {} };
function renderCart() {
  const n = cart.reduce((s, i) => s + i.qty, 0);
  $('#cartCount').textContent = n;
  $('#drawerSub').textContent = money(cart.reduce((s, i) => s + i.qty * i.price, 0));
  $('#drawerItems').innerHTML = cart.length ? cart.map(i => `
    <li><img src="${IMG + i.img}" alt=""><div><h5>${i.name}</h5><small>${i.meta}</small>
      <div class="qty"><button data-q="-1" data-id="${i.id}" aria-label="Decrease">−</button>${i.qty}<button data-q="1" data-id="${i.id}" aria-label="Increase">+</button></div></div>
      <span>${money(i.price * i.qty)}</span></li>`).join('') : '<li class="drawer__empty" style="display:block;border:0">Your cart is empty.</li>';
}
function addToCart(item) {
  const ex = cart.find(i => i.id === item.id);
  ex ? ex.qty++ : cart.push({ ...item, qty: 1 });
  save(); renderCart(); toast(`${item.name} added to your cart`);
}
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2200); }
$('#drawerItems').addEventListener('click', e => {
  const b = e.target.closest('[data-q]'); if (!b) return;
  const it = cart.find(i => i.id === b.dataset.id); it.qty += +b.dataset.q;
  if (it.qty <= 0) cart = cart.filter(i => i !== it);
  save(); renderCart();
});
const openCart = o => { document.body.classList.toggle('cart-open', o); $('#drawer').setAttribute('aria-hidden', !o); o ? lenis.stop() : lenis.start(); };
$('#cartBtn').addEventListener('click', () => openCart(true));
$('#drawerX').addEventListener('click', () => openCart(false));
$('#scrim').addEventListener('click', () => openCart(false));
addEventListener('keydown', e => { if (e.key === 'Escape') openCart(false); });
$('.drawer__checkout').addEventListener('click', () => toast('Checkout is a demo in this preview'));
renderCart();

$('#news').addEventListener('submit', e => { e.preventDefault(); e.currentTarget.classList.add('done'); e.currentTarget.reset(); });

/* =========================================================
   STORY PARALLAX
   ========================================================= */
const story = $('#story'), storyBg = $('.story__photo img');
function storyFrame() {
  const r = story.getBoundingClientRect();
  if (r.bottom < 0 || r.top > vh) return;
  const p = (vh - r.top) / (vh + r.height);
  storyBg.style.transform = `scale(1.12) translateY(${(p - .5) * -6}%)`;
}

/* =========================================================
   LOOP
   ========================================================= */
function raf(now) {
  lenis.raf(now);
  heroFrame(now);
  showcaseFrame(now);
  storyFrame();
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
addEventListener('resize', measure);
requestAnimationFrame(() => document.body.classList.add('intro'));
