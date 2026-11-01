// Frame-locked engine: the picture is a pure function of the frame number F (0..1165, 30 fps).
// Each shot builds its DOM once and is updated per frame. No clocks, no randomness without a seed.
const W = 1080, H = 810, FPS = 30, NF = 1166;
window.DEMO = { width: W, height: H, fps: FPS, duration: NF / FPS };

const stage = document.getElementById('stage');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const E = {
  lin: t => t,
  inQ: t => t * t, outQ: t => 1 - (1 - t) * (1 - t),
  inC: t => t * t * t, outC: t => 1 - Math.pow(1 - t, 3),
  ioC: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  ioS: t => -(Math.cos(Math.PI * t) - 1) / 2,
  outQuint: t => 1 - Math.pow(1 - t, 5), inQuint: t => t ** 5,
  ioQuint: t => t < .5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2,
  outExpo: t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t),
  inExpo: t => t <= 0 ? 0 : Math.pow(2, 10 * t - 10),
  outBack: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
};
// piecewise keyframes: keys [[f, v], ...]; v number or array; per-segment ease as third item
function kf(F, keys, e = E.ioC) {
  if (F <= keys[0][0]) return keys[0][1];
  const L = keys[keys.length - 1]; if (F >= L[0]) return L[1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, v0] = keys[i], [f1, v1, ez] = keys[i + 1];
    if (F >= f0 && F <= f1) {
      const t = (ez || e)((F - f0) / (f1 - f0));
      return Array.isArray(v0) ? v0.map((x, j) => lerp(x, v1[j], t)) : lerp(v0, v1, t);
    }
  }
  return L[1];
}
const win = (F, a, b, e = E.lin) => e(clamp((F - a) / (b - a), 0, 1));
function $(tag, css, parent, html) {
  const n = document.createElement(tag);
  if (css) Object.assign(n.style, css);
  if (html !== undefined) n.innerHTML = html;
  (parent || stage).appendChild(n); return n;
}
const abs = (x, y, w, h, extra) => Object.assign({ position: 'absolute', left: x + 'px', top: y + 'px', width: w === undefined ? undefined : w + 'px', height: h === undefined ? undefined : h + 'px' }, extra || {});

// ---------- camera tracks (measured on the reference) ----------
const TR = {};
async function loadTracks(names) {
  for (const n of names) TR[n] = await (await fetch('measure/trk_' + n + '.json')).json();
}
function trackM(n, F) {
  const t = TR[n]; const i = clamp(Math.round(F), t.a, t.b) - t.a; return t.frames[i].m;
}
function trackInterp(n, F) {
  const t = TR[n]; const f = clamp(F, t.a, t.b); const i = Math.floor(f) - t.a; const j = Math.min(i + 1, t.b - t.a); const u = f - Math.floor(f);
  return t.frames[i].m.map((v, k) => lerp(v, t.frames[j].m[k], u));
}
// similarity matrix from scale, rotation (deg), translation
function simM(s, rot, tx, ty) { const r = rot * Math.PI / 180; return [s * Math.cos(r), -s * Math.sin(r), tx, s * Math.sin(r), s * Math.cos(r), ty]; }
// compose: apply A then B (both map x -> x')
function mul(B, A) { return [B[0] * A[0] + B[1] * A[3], B[0] * A[1] + B[1] * A[4], B[0] * A[2] + B[1] * A[5] + B[2], B[3] * A[0] + B[4] * A[3], B[3] * A[1] + B[4] * A[4], B[3] * A[2] + B[4] * A[5] + B[5]]; }
const cssM = m => `matrix(${m[0]},${m[3]},${m[1]},${m[4]},${m[2]},${m[5]})`;
const mScale = m => Math.hypot(m[0], m[3]);
const apply = (m, x, y) => [m[0] * x + m[1] * y + m[2], m[3] * x + m[4] * y + m[5]];

// ---------- directional blur filters (SVG) ----------
const SVGNS = 'http://www.w3.org/2000/svg';
const fxSvg = document.createElementNS(SVGNS, 'svg'); fxSvg.setAttribute('width', 0); fxSvg.setAttribute('height', 0); fxSvg.style.position = 'absolute';
const fxDefs = document.createElementNS(SVGNS, 'defs'); fxSvg.appendChild(fxDefs); document.body.appendChild(fxSvg);
let fxN = 0;
function blurFilter() {
  const id = 'mb' + (fxN++); const f = document.createElementNS(SVGNS, 'filter');
  f.setAttribute('id', id); f.setAttribute('filterUnits', 'userSpaceOnUse'); f.setAttribute('x', '-6000'); f.setAttribute('y', '-6000'); f.setAttribute('width', '16000'); f.setAttribute('height', '16000');
  f.setAttribute('color-interpolation-filters', 'sRGB');
  const g = document.createElementNS(SVGNS, 'feGaussianBlur'); g.setAttribute('stdDeviation', '0 0'); g.setAttribute('edgeMode', 'duplicate'); f.appendChild(g); fxDefs.appendChild(f);
  return { id, set(el, sx, sy, extra) {
    sx = Math.max(0, sx || 0); sy = Math.max(0, sy || 0);
    if (sx < 0.05 && sy < 0.05) { el.style.filter = extra || 'none'; return; }
    g.setAttribute('stdDeviation', sx.toFixed(2) + ' ' + sy.toFixed(2)); el.style.filter = `url(#${id})` + (extra ? ' ' + extra : '');
  } };
}
// camera speed (px per frame, frame coords) of a point under a matrix function
function camVel(mf, F, x, y) { const a = apply(mf(F - 0.5), x, y), b = apply(mf(F + 0.5), x, y); return [b[0] - a[0], b[1] - a[1]]; }

// ---------- letterbox overlay (measured bars) ----------
let BARS = null;
const lb = {}; for (const k of ['t', 'b', 'l', 'r']) lb[k] = $('div', { position: 'absolute', background: '#000', zIndex: 900, left: '0px', top: '0px', width: '0px', height: '0px' });
function bars(F, on, color) {
  const b = BARS[F];
  const t = on.t ? b[1] : 0, bo = on.b ? b[2] : 0, l = on.l ? b[3] : 0, r = on.r ? b[4] : 0;
  Object.assign(lb.t.style, { width: W + 'px', height: t + 'px', top: '0px', background: color });
  Object.assign(lb.b.style, { width: W + 'px', height: bo + 'px', top: (H - bo) + 'px', background: color });
  Object.assign(lb.l.style, { width: l + 'px', height: H + 'px', left: '0px', background: color });
  Object.assign(lb.r.style, { width: r + 'px', height: H + 'px', left: (W - r) + 'px', background: color });
}
function barsOff() { for (const k in lb) lb[k].style.height = '0px'; }

// ---------- shots ----------
const SHOTS = [];
function SHOT(o) { SHOTS.push(o); }
async function loadImages(root) {
  const imgs = [...root.querySelectorAll('img')];
  await Promise.all(imgs.map(i => i.complete && i.naturalWidth ? Promise.resolve() : new Promise((ok, no) => { i.onload = ok; i.onerror = () => no(new Error('image ' + i.src)); })));
  await Promise.all(imgs.map(i => i.decode ? i.decode().catch(() => {}) : 0));
}
window.__ready = false;
async function boot() {
  BARS = await (await fetch('measure/bars2.json')).json();
  await loadTracks(['s01', 's03', 's04', 's05a', 's05b', 's05c', 's06', 's07', 's08', 's10', 's11', 's12', 's13', 's14', 's15']);
  for (const s of SHOTS) { s.root = $('div', abs(0, 0, W, H, { overflow: 'hidden', display: 'none', zIndex: s.z || 1 })); s.build(s.root); }
  await document.fonts.ready;
  for (const s of SHOTS) if (s.after) s.after();
  for (const s of SHOTS) await loadImages(s.root);
  window.__ready = true;
}
window.renderAt = async (t) => {
  const F = clamp(Math.round(t * FPS), 0, NF - 1);
  barsOff();
  for (const s of SHOTS) {
    const on = F >= s.f0 && F <= s.f1; s.root.style.display = on ? 'block' : 'none';
    if (on) s.render(F);
  }
};
window.addEventListener('load', () => { boot().catch(e => { console.error(e); throw e; }); });
