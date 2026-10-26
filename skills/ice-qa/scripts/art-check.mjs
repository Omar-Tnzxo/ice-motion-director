#!/usr/bin/env node
// art-check.mjs - the art check: rejects primitive code-drawn art (flat single-tone objects with no shading, texture,
// detail or shadow) on a style frame page, an SVG drawing or a build page. Founder decision, 2026-10-22. Craft rules:
// the ice-styles skill, references/code-illustration-craft.md. Rule and thresholds: references/pre-render-lint.md 4b.
// Needs Node 22+ and a local Chrome or Edge (CHROME_PATH).
//
// Usage:  node art-check.mjs <page.html | drawing.svg> [--times 0.5,2] [--json] [--width W --height H]
//
// Loads the page in headless Chrome (scripts/_cdp.mjs). A seekable page (window.renderAt(t), window.seek(t),
// window.__seek(t)) is read at --times, else at 25, 50 and 75 percent of window.DEMO.duration / window.__duration;
// a page with no seek is read as one frame. Each hero object is read at the sample where its box is largest.
//
//   Hero objects: every [data-art-hero="<name>"] group. With none marked, the top-level groups of each inline <svg>
//   (or the <svg> itself) whose box is at least 2 % of the frame are picked and named by id (printed as auto).
//   Objects under 1 % of the frame are skipped (judge them by eye at thumbnail size).
//   A page that draws objects (12 or more SVG shapes, filled HTML boxes without text, or a canvas of 2 % of the frame)
//   but has no hero object to measure FAILS: HTML and canvas art is never auto-picked, so mark it. A page with no
//   drawn objects is N/A; <body data-art="none: <reason>"> declares none and is printed as a lead.
//   Per object:
//     tones    distinct fill tones (solid fills, gradient stops, HTML backgrounds), RGB distance > 18     < 3 FAIL
//     shading  a gradient fill, an SVG lighting filter, a blend-mode layer, or two fills of one hue      none FAIL
//              (hue within 25 degrees, or both near grey) whose lightness differs by 0.08 or more
//     shapes   drawn shapes (path subpaths, rect, circle, ellipse, polygon, polyline, line, use, filled   < 12 FAIL
//              HTML boxes)                                                                              < 24 WARN
//     texture  a pattern fill, an feTurbulence filter, or an image, canvas or pattern layer laid over    none FAIL
//              the object (inside it or a layer covering it); data-art-texture="none: <reason>" on the
//              object turns the fail into a printed lead
//     shadow   a drop shadow (CSS filter or box-shadow, feDropShadow, an offset blur), a shape named      none FAIL
//              shadow, or a dark translucent shape under the object's base; data-art-shadow="none:
//              <reason>" turns the fail into a printed lead
// Output: one line per object with every measure, then "GATE ART: PASS|WARN|FAIL|N/A". --json prints the same as JSON.
// Exit: 0 PASS, WARN or N/A; 1 FAIL; 2 bad usage or page failure. A PASS is a floor, never taste.
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { launchChrome, parseArgs, helpFrom } from './_cdp.mjs';

const fail2 = (m) => { console.error('error: ' + m); process.exit(2); };
const { pos, opt } = parseArgs(process.argv.slice(2), { help: 'bool', times: 's', json: 'bool', width: 's', height: 's' });
if (opt.help || !pos[0]) { console.log(helpFrom(import.meta.url)); process.exit(opt.help ? 0 : 2); }
const src = pos[0];
const url = /^(https?|file):/i.test(src) ? src : (fs.existsSync(src) ? pathToFileURL(path.resolve(src)).href : fail2(`input not found: ${src}`));
const numOpt = (v, name) => { if (v === undefined) return null; const n = Number(v); if (!Number.isFinite(n) || n <= 0) fail2(`--${name} must be a positive number`); return n; };
let userTimes = null;
if (opt.times !== undefined) {
  userTimes = opt.times.split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n) && n >= 0);
  if (!userTimes.length) fail2('--times needs numbers like 0.5,2');
}

const T = { tones: 3, shapesFail: 12, shapesWarn: 24, toneDist: 18, hueSame: 25, lightStep: 0.08, minShare: 0.01, autoShare: 0.02 };

// ---------------------------------------------------------------- page side
const PAGE_LIB = String.raw`(() => {
  const T = ${JSON.stringify(T)};
  window.__artInfo = () => {
    const demo = window.DEMO && typeof window.DEMO === 'object' ? window.DEMO : {};
    const svgRoot = document.documentElement instanceof SVGSVGElement ? document.documentElement : null;
    const vb = svgRoot && svgRoot.viewBox && svgRoot.viewBox.baseVal;
    return { duration: typeof window.__duration === 'number' ? window.__duration : (+demo.duration > 0 ? +demo.duration : null),
      width: +demo.width || (vb && vb.width) || (svgRoot ? parseFloat(svgRoot.getAttribute('width')) : 0) || null,
      height: +demo.height || (vb && vb.height) || (svgRoot ? parseFloat(svgRoot.getAttribute('height')) : 0) || null,
      seek: typeof window.__seek === 'function' ? '__seek' : typeof window.renderAt === 'function' ? 'renderAt' : typeof window.seek === 'function' ? 'seek' : 'none' };
  };
  window.__artPrepare = async () => {
    try { await document.fonts.ready; } catch (e) {}
    if (window.__ready && typeof window.__ready.then === 'function') await window.__ready;
    else for (let i = 0; i < 100 && ('__ready' in window || 'ready' in window) && !(window.__ready === true || window.ready === true); i++) await new Promise((r) => setTimeout(r, 100));
    return 1;
  };
  window.__artSeek = async (t) => {
    if (typeof window.__seek === 'function') await window.__seek(t);
    else if (typeof window.renderAt === 'function') await window.renderAt(t);
    else if (typeof window.seek === 'function') await window.seek(t);
    for (const a of document.getAnimations ? document.getAnimations() : []) { try { a.pause(); a.currentTime = t * 1000; } catch (e) {} }
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    return 1;
  };
  window.__artScan = () => {
    const W = innerWidth, H = innerHeight, cs = (e) => getComputedStyle(e);
    const rgba = (c) => {
      const m = /^rgba?\(([^)]+)\)/.exec(c || ''); if (!m) return null;
      const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(parseFloat); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
    };
    const hex = (c) => { const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((c || '').trim()); if (!m) return null; let h = m[1]; if (h.length === 3) h = h.replace(/./g, '$&$&'); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).concat(1); };
    const color = (c) => rgba(c) || hex(c);
    const hidden = (e) => { for (let n = e; n && n.nodeType === 1; n = n.parentElement) { const s = cs(n); if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) < 0.05) return true; } return false; };
    const opacity = (e) => { let o = 1; for (let n = e; n && n.nodeType === 1; n = n.parentElement) o *= parseFloat(cs(n).opacity); return o; };
    const box = (e) => { const r = e.getBoundingClientRect(); const x0 = Math.max(0, r.left), y0 = Math.max(0, r.top), x1 = Math.min(W, r.right), y1 = Math.min(H, r.bottom);
      return { x0, y0, x1, y1, area: Math.max(0, x1 - x0) * Math.max(0, y1 - y0) }; };
    const refOf = (v) => { const m = /url\(\s*["']?#([^"')]+)["']?\s*\)/.exec(v || ''); return m ? document.getElementById(m[1]) : null; };
    const SHAPES = 'path, rect, circle, ellipse, polygon, polyline, line, use';
    const nameOf = (e) => ((e.id || '') + ' ' + (typeof e.className === 'string' ? e.className : (e.className && e.className.baseVal) || '') + ' ' + (e.getAttribute('data-art-part') || '')).toLowerCase();
    const filterKinds = (val) => {
      const out = new Set(); if (!val || val === 'none') return out;
      if (/drop-shadow\(/.test(val)) out.add('shadow');
      for (const m of val.matchAll(/url\(\s*["']?#([^"')]+)["']?\s*\)/g)) {
        const f = document.getElementById(m[1]); if (!f) continue;
        if (f.querySelector('feTurbulence')) out.add('texture');
        if (f.querySelector('feDiffuseLighting, feSpecularLighting')) out.add('shading');
        if (f.querySelector('feDropShadow') || (f.querySelector('feGaussianBlur') && f.querySelector('feOffset'))) out.add('shadow');
      }
      return out;
    };
    const paintOf = (v, acc) => {
      const ref = refOf(v);
      if (ref) {
        const tag = ref.tagName.toLowerCase();
        if (/gradient/i.test(tag)) { acc.shading.add('gradient #' + ref.id); for (const st of ref.querySelectorAll('stop')) { const c = color(st.getAttribute('stop-color') || cs(st).stopColor); if (c) acc.fills.push(c); } }
        else if (tag === 'pattern') acc.texture.add('pattern #' + ref.id);
        return;
      }
      const c = color(v); if (c && c[3] > 0.05) acc.fills.push(c);
    };
    const subpaths = (e) => (e.tagName.toLowerCase() === 'path' ? Math.max(1, ((e.getAttribute('d') || '').match(/[Mm]/g) || []).length) : 1);
    const lum = (c) => (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
    // a layer laid over the object: covers most of its box and carries noise, a pattern, an image or a canvas
    const overlays = [];
    for (const e of document.querySelectorAll('*')) {
      if (overlays.length > 200) break;
      const tag = e.tagName.toLowerCase(), s = cs(e);
      const kinds = filterKinds(s.filter);
      const tex = kinds.has('texture') || /^(img|image|canvas)$/.test(tag) || (s.backgroundImage && s.backgroundImage !== 'none' && !/gradient/.test(s.backgroundImage)) ||
        /repeating-(linear|radial|conic)-gradient/.test(s.backgroundImage || '') || (s.fill && refOf(s.fill) && refOf(s.fill).tagName.toLowerCase() === 'pattern') || /grain|noise|texture/.test(nameOf(e));
      if (!tex || hidden(e)) continue;
      const b = box(e); if (b.area < 1) continue;
      overlays.push({ el: e, b, blend: s.mixBlendMode !== 'normal', op: opacity(e), tag });
    }
    const covers = (o, b) => { const ix = Math.max(0, Math.min(o.b.x1, b.x1) - Math.max(o.b.x0, b.x0)), iy = Math.max(0, Math.min(o.b.y1, b.y1) - Math.max(o.b.y0, b.y0)); return b.area > 0 && (ix * iy) / b.area >= 0.6; };
    const measure = (g, name, auto) => {
      const b = box(g), acc = { fills: [], shading: new Set(), texture: new Set(), shadow: new Set() };
      let shapes = 0;
      const all = [g, ...g.querySelectorAll('*')];
      for (const e of all) {
        if (hidden(e)) continue;
        const tag = e.tagName.toLowerCase(), s = cs(e), nm = nameOf(e);
        if (e instanceof SVGElement && e.matches(SHAPES)) {
          if (e.closest('defs, pattern, mask, clipPath, symbol, marker, filter')) continue;
          shapes += subpaths(e);
          if (s.fill && s.fill !== 'none') paintOf(s.fill, acc);
        } else if (e instanceof HTMLElement && e !== g) {
          const bg = color(s.backgroundColor); const r = e.getBoundingClientRect();
          if ((bg && bg[3] > 0.05) || (s.backgroundImage && s.backgroundImage !== 'none')) { if (r.width >= 2 && r.height >= 2) shapes++; if (bg && bg[3] > 0.05) acc.fills.push(bg); }
          if (/gradient\(/.test(s.backgroundImage || '')) { acc.shading.add('css gradient'); for (const m of (s.backgroundImage.match(/rgba?\([^)]+\)|#[0-9a-f]{3,6}\b/gi) || [])) { const c = color(m); if (c) acc.fills.push(c); } }
          if (s.boxShadow && s.boxShadow !== 'none') acc.shadow.add('box-shadow');
        }
        for (const k of filterKinds(s.filter)) acc[k].add('filter on <' + tag + (e.id ? '#' + e.id : '') + '>');
        if (s.mixBlendMode && s.mixBlendMode !== 'normal') acc.shading.add('blend ' + s.mixBlendMode);
        if (/shadow|occlusion|\bao\b/.test(nm)) acc.shadow.add('shape named ' + nm.trim().split(/\s+/)[0]);
        if (/grain|noise|texture/.test(nm)) acc.texture.add('layer named ' + nm.trim().split(/\s+/)[0]);
      }
      // two fills of one hue with different lightness = a modelled shadow or highlight tone
      const hsl = (c) => { const r = c[0] / 255, gg = c[1] / 255, bb = c[2] / 255, mx = Math.max(r, gg, bb), mn = Math.min(r, gg, bb), l = (mx + mn) / 2, d = mx - mn;
        if (d < 0.04) return [null, 0, l]; let h = mx === r ? ((gg - bb) / d) % 6 : mx === gg ? (bb - r) / d + 2 : (r - gg) / d + 4; h = (h * 60 + 360) % 360; return [h, d / (1 - Math.abs(2 * l - 1) || 1), l]; };
      const tones = [];
      for (const c of acc.fills) if (!tones.some((t) => Math.hypot(t[0] - c[0], t[1] - c[1], t[2] - c[2]) <= T.toneDist)) tones.push(c);
      outer: for (let i = 0; i < tones.length; i++) for (let j = i + 1; j < tones.length; j++) {
        const a = hsl(tones[i]), c = hsl(tones[j]);
        const same = (a[0] === null && c[0] === null) || (a[0] !== null && c[0] !== null && Math.min(Math.abs(a[0] - c[0]), 360 - Math.abs(a[0] - c[0])) <= T.hueSame);
        if (same && Math.abs(a[2] - c[2]) >= T.lightStep) { acc.shading.add('tone steps of one hue'); break outer; }
      }
      for (const o of overlays) if (!g.contains(o.el) && !o.el.contains(g) && covers(o, b)) acc.texture.add('<' + o.tag + '> layer over the object');
      // a dark translucent shape outside the object, under its base
      const base = { x0: b.x0, x1: b.x1, y0: b.y1 - (b.y1 - b.y0) * 0.25, y1: b.y1 + (b.y1 - b.y0) * 0.2 };
      for (const e of document.querySelectorAll(SHAPES + ', div, span')) {
        if (g.contains(e) || e.contains(g) || hidden(e)) continue;
        const s = cs(e), r = box(e); if (r.area < 4) continue;
        const ix = Math.max(0, Math.min(r.x1, base.x1) - Math.max(r.x0, base.x0)), iy = Math.max(0, Math.min(r.y1, base.y1) - Math.max(r.y0, base.y0));
        if (ix < 0.3 * (b.x1 - b.x0) || iy <= 0 || r.area > 4 * b.area) continue;
        const c = e instanceof SVGElement ? color(s.fill) : color(s.backgroundColor);
        const a = c ? c[3] * opacity(e) * (e instanceof SVGElement ? parseFloat(s.fillOpacity || 1) : 1) : 0;
        if (/shadow|occlusion|\bao\b/.test(nameOf(e)) || (c && lum(c) < 0.35 && a > 0.05 && a < 0.75) || (filterKinds(s.filter).has('shadow') && c && lum(c) < 0.35))
          { acc.shadow.add('cast shadow <' + e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + '> under the base'); break; }
      }
      return { name, auto, area: b.area / (W * H), box: [b.x0 / W, b.y0 / H, b.x1 / W, b.y1 / H].map((v) => +v.toFixed(3)), shapes, tones: tones.length,
        toneList: tones.slice(0, 8).map((c) => '#' + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')),
        shading: [...acc.shading].slice(0, 3), texture: [...acc.texture].slice(0, 3), shadow: [...acc.shadow].slice(0, 3),
        textureNone: g.getAttribute('data-art-texture') || '', shadowNone: g.getAttribute('data-art-shadow') || '' };
    };
    let heroes = [...document.querySelectorAll('[data-art-hero]')].map((g) => [g, g.getAttribute('data-art-hero') || g.id || 'hero', false]);
    if (!heroes.length) {
      const svgs = document.documentElement instanceof SVGSVGElement ? [document.documentElement] : [...document.querySelectorAll('svg')].filter((s) => !s.parentElement.closest('svg'));
      for (const s of svgs) {
        if (hidden(s)) continue;
        const kids = [...s.children].filter((c) => c.tagName.toLowerCase() === 'g' && !hidden(c) && box(c).area / (W * H) >= T.autoShare);
        const pick = kids.length ? kids : (box(s).area / (W * H) >= T.autoShare && s.querySelector(SHAPES) ? [s] : []);
        pick.forEach((g, i) => heroes.push([g, g.id || (s.id ? s.id + '/' : '') + 'group-' + (i + 1), true]));
      }
    }
    // drawn = how much the page draws: visible SVG shapes, filled HTML boxes with no text of their own, canvases
    let drawn = 0;
    for (const e of document.querySelectorAll('*')) {
      if (drawn >= 12) break;
      if (e.closest('defs, pattern, mask, clipPath, symbol, marker, filter') || hidden(e)) continue;
      const r = box(e); if (r.area < 0.0005 * W * H) continue;
      if (e instanceof SVGElement && e.matches(SHAPES)) drawn++;
      else if (e.tagName.toLowerCase() === 'canvas') drawn += r.area >= T.autoShare * W * H ? 12 : 0;
      else if (e instanceof HTMLElement && e !== document.body && ![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) {
        const s = cs(e), bg = color(s.backgroundColor); if ((bg && bg[3] > 0.05) || (s.backgroundImage && s.backgroundImage !== 'none')) drawn++;
      }
    }
    const declared = (document.body && document.body.getAttribute('data-art')) || document.documentElement.getAttribute('data-art') || '';
    return { drawn, declared, objects: heroes.filter(([g]) => !hidden(g) && box(g).area / (W * H) >= T.minShare).map(([g, n, a]) => measure(g, n, a)),
      skipped: heroes.filter(([g]) => !hidden(g) && box(g).area / (W * H) < T.minShare).map(([, n]) => n) };
  };
  return true;
})()`;

// ---------------------------------------------------------------- node side
function verdict(o) {
  const m = [];
  m.push(['tones', o.tones < T.tones ? 'FAIL' : 'PASS', `${o.tones} distinct fill tone(s)${o.toneList.length ? ' ' + o.toneList.join(' ') : ''}` + (o.tones < T.tones ? ` (needs base, shadow and highlight: ${T.tones} or more)` : '')]);
  m.push(['shading', o.shading.length ? 'PASS' : 'FAIL', o.shading.length ? o.shading.join(', ') : 'none: no gradient, lighting filter, blend layer or tone steps of one hue']);
  m.push(['shapes', o.shapes < T.shapesFail ? 'FAIL' : o.shapes < T.shapesWarn ? 'WARN' : 'PASS', `${o.shapes} shape(s)` + (o.shapes < T.shapesWarn ? ` (fail under ${T.shapesFail}, lead under ${T.shapesWarn}: primary, secondary and tertiary forms)` : '')]);
  const opt = (key, found, none, what) => found.length ? [key, 'PASS', found.join(', ')]
    : /^none\s*:\s*\S/i.test(none) ? [key, 'WARN', `declared ${none} (printed lead)`] : [key, 'FAIL', `none: no ${what}`];
  m.push(opt('texture', o.texture, o.textureNone, 'pattern, noise filter or texture layer over the object'));
  m.push(opt('shadow', o.shadow, o.shadowNone, 'cast, contact or drop shadow'));
  const status = m.some((x) => x[1] === 'FAIL') ? 'FAIL' : m.some((x) => x[1] === 'WARN') ? 'WARN' : 'PASS';
  return { ...o, status, measures: Object.fromEntries(m.map(([k, s, note]) => [k, { status: s, note }])) };
}

let br, exitCode = 0;
(async () => {
  br = await launchChrome({ args: ['--allow-file-access-from-files'] });
  let W = numOpt(opt.width, 'width'), H = numOpt(opt.height, 'height');
  const page = await br.newPage({ width: W || 1920, height: H || 1080, scale: 1 });
  if (!(await page.goto(url, { timeout: 45000 }))) console.error('warn: load event timed out, continuing');
  await page.eval(PAGE_LIB);
  await page.eval('window.__artPrepare()', { timeout: 30000 });
  const info = await page.eval('window.__artInfo()');
  W = W || Math.round(info.width) || 1920; H = H || Math.round(info.height) || 1080;
  await page.setViewport(W, H, 1);
  const times = info.seek === 'none' ? [null] : userTimes || (info.duration > 0 ? [0.25, 0.5, 0.75].map((f) => +(f * info.duration).toFixed(2)) : [0]);
  const best = new Map(); let drawn = 0, declared = ''; const skipped = new Set();
  for (const t of times) {
    if (t !== null) await page.eval(`window.__artSeek(${t})`, { timeout: 40000 });
    const A = JSON.parse(await page.eval('JSON.stringify(window.__artScan())', { timeout: 30000 }));
    drawn = Math.max(drawn, A.drawn); declared = declared || A.declared; A.skipped.forEach((n) => skipped.add(n));
    for (const o of A.objects) { const prev = best.get(o.name); if (!prev || o.area > prev.area) best.set(o.name, { ...o, t }); }
  }
  await page.close();
  const objects = [...best.values()].map(verdict);
  const none = /^none\s*:\s*\S/i.test(declared);
  const gate = !objects.length ? (drawn >= 12 && !none ? 'FAIL' : 'N/A') : objects.some((o) => o.status === 'FAIL') ? 'FAIL' : objects.some((o) => o.status === 'WARN') ? 'WARN' : 'PASS';
  const out = { file: path.resolve(src.replace(/^file:\/\//, '')), width: W, height: H, seek: info.seek, samples: times, thresholds: T, objects, skipped: [...skipped], gate };
  if (!objects.length) out.note = none ? `the page declares data-art="${declared}" (printed lead: no drawn objects)`
    : drawn >= 12 ? 'the page draws objects (SVG shapes, filled HTML boxes or a canvas) but no hero object of at least 1 % of the frame is marked: mark each with data-art-hero (unmeasured is never n/a)'
    : 'no drawn objects to measure (raster, footage or type only: judged by eye and by the studio benchmark)';
  if (opt.json) console.log(JSON.stringify(out, null, 1));
  else {
    console.log(`art-check.mjs ${out.file}  ${W}x${H}  seek ${info.seek}  samples ${times.map((t) => (t === null ? 'static' : t)).join(', ')}`);
    for (const o of objects) {
      console.log(`${o.status.padEnd(4)} ${o.name}${o.auto ? ' (auto: mark it with data-art-hero)' : ''}  box=[${o.box.join(',')}]  ${(o.area * 100).toFixed(1)} % of frame${o.t !== null && o.t !== undefined ? '  t=' + o.t : ''}`);
      for (const [k, m] of Object.entries(o.measures)) console.log(`    ${k.padEnd(8)} ${m.status.padEnd(4)} ${m.note}`);
    }
    if (skipped.size) console.log(`note: under 1 % of the frame, judged by eye: ${[...skipped].slice(0, 6).join(', ')}`);
    if (out.note) console.log('note: ' + out.note);
    console.log(`GATE ART: ${gate}   (craft rules: ice-styles/references/code-illustration-craft.md; a floor, not taste)`);
  }
  exitCode = gate === 'FAIL' ? 1 : 0;
})().catch((e) => { console.error('error: ' + e.message); exitCode = 2; })
  .finally(async () => { try { await br?.close(); } catch {} process.exit(exitCode); });
