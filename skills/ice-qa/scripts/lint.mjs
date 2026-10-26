#!/usr/bin/env node
// Adapted from Tejashmakwana/motionmaxxing (Apache-2.0). Changes: the dash characters in the counter regex are written
// as \u escapes; usage path names this skill's folder. 2026-10-19 (pilot films): the page contract of the ice-engines
// renderer is understood (window.renderAt(t) or window.seek(t), window.__ready or window.ready, window.DEMO for duration and
// size), so a renderAt film is sampled at many times instead of read as one frozen frame; a richness line reads
// depth_layers, hero_share and hero_width from pages that mark them, against the film type's floor read from the ice-film
// type file. 2026-10-21 (Spotify pilot): C6 judges the on-screen box, skips tilted 3D planes and asks what a bar holds;
// text size is the drawn (projected) size. Needs Node 22+ and a local Chrome or Edge (CHROME_PATH). See NOTICE.md.
//
// lint.mjs - gate G5 "no page chrome": a DOM-level lint for HUD / slide-deck / vibe-coded-UI patterns in a film's index.html.
//
// Usage:  node lint.mjs <index.html> [--times 0.5,2,4.2] [--samples N] [--json] [--width W --height H] [--duration S]
//                        [--type "film type"]
//
// Loads the page in headless Chrome (scripts/_cdp.mjs), seeks it with the renderers' contracts (window.renderAt(t) or
// window.seek(t) of the ice-engines render-html.mjs page; __seek / __timelines / gsap of HyperFrames pages), waits for
// window.__ready / window.ready when the page uses them, and at every sample time reads every VISIBLE text block (box = real ink box of the text, font size, tracking, case,
// colour, alignment) plus the non-text shapes (bars, rules, dots, media). Each position rule is read twice (t and t+0.1 s) and
// only counts when the element is HELD (not flying through a corner mid-transition). Text INSIDE a UI surface (an ancestor with a
// background + border-radius that is at least ~2.5% of the frame, or any [data-ui] element) is exempt from the chrome/deck
// rules, but never from the vibe-coded-UI rules (greeting, "label . $value", cluster).
//
//   Samples:  --times lists them; otherwise N evenly spaced (default clamp(round(1.5 x duration), 12, 36)). Duration comes from
//             --duration | window.__duration | window.DEMO.duration | [data-composition-id=main][data-duration] |
//             __timelines.main | gsap. A page with no seek mechanism at all is read as one static frame and the gate
//             prints WARN instead of PASS (it saw one frame only).
//   Richness (from the DOM, only what the page marks): depth_layers = distinct data-ice-layer="<name>" values (data-layer on
//             pages outside HyperFrames, whose own lint rejects data-layer as a legacy track name) visible at a sample
//             (or the names window.__layers(t) returns); hero_share = area of the visible [data-hero] element's box; hero_width
//             = width of the widest headline-size text (>= 5 % H) or of a [data-hero] text, both as a share of the frame.
//             The floor comes from the film type's "Richness floor" table in the ice-film skill (type from --type, else
//             ice/state.json or ice/BRIEF.md found by walking up from the page). depth_layers below the floor at the median
//             sample is RICHNESS FAIL (exit 1); an unmarked page fails too when the type's floor names depth_layers
//             (unmeasured is never n/a); with no such floor it prints n/a.
//   Rules (FAIL = hard, gate G5 fails; WARN = a lead, look at it):
//     C1 corner/edge label      small text (<=4% H) in a corner zone (x<.2|>.8 and y<.14|>.86) or a top/bottom/side strip     FAIL
//     C2 tracked-caps label     uppercase, letter-spacing >= 0.05em, <=4.5% H (brand / metadata / kicker labels)              FAIL
//     C3 chapter counter        "02 / SPEAK", "01 - THE WAIT", "N/M", "Chapter 3", "FILM 01", bare "01"                      FAIL
//     C4 production metadata    BPM, FPS, FRAME n, 1920x1080, T+1.6s, TC, hh:mm:ss, v1.2, (c)                                FAIL
//     C5 mono micro-label       monospace text <= 4% H outside a UI surface                                                  WARN
//     C6 header/footer bar      a full-width bar / hairline in the top or bottom band that holds text or controls, or a     FAIL
//                               left+right small-text row; the same bar or rule empty: WARN. Judged on the on-screen box
//                               (projected, clipped to the frame); shapes and text on a tilted 3D plane (rotateX / rotateY
//                               in the element or an ancestor) are scene geometry and skipped, listed under the exemptions
//     C7 kicker over headline   small line directly above a headline (>= 2x larger), left- or centre-aligned                 FAIL
//     D1 deck layout            left-anchored headline block (x0<.2): FAIL with media on the right, a sub-line or kicker or
//                               2+ lines; WARN alone (allowed only as a one-line split phrase under ~1.2 s)
//     P1 progress bar           a thin element that GROWS over time (outside a UI surface)                                   FAIL
//     T1 letter-typed headline  headline-size text (>= 5% H) that grows by letters (mid-word) over 0.1 s, or has a caret      FAIL (growth) / WARN (caret only)
//     V1 greeting header        "Good morning", "Welcome back", "Hi Name"                                                    FAIL
//     V2 label . value          "Revenue . $12,400"                                                                          FAIL
//     V3 status dot             6-14 px filled circle right before a text                                                    WARN
//     V4 zinc grey text         colour within 10 of Tailwind zinc 300/400/500/600 (#d4d4d8 #a1a1aa #71717a #52525b)            WARN
//     V5 vibe-coded UI card     one surface (or the page) holds >= 2 of: greeting, label.value, status dot, zinc text         FAIL
//   [data-ui="captured"] marks a faithful rebuild of a captured product screen: V5 is skipped inside it (the exemption is printed).
//   [data-required-label] marks a label the rules require on screen ("Example data", the unofficial-concept line; ice-assets
//   truth-sheet.md section 9): exempt from every rule above, printed under exemptions with its size and box for the critic.
//   Text size (every "% H" above) is the drawn size: the CSS font-size times the projected scale of the text's box (drawn
//   box height over layout height, rotation corrected), so a word on a scaled or tilted 3D plane counts as small as it looks.
//   Hits print fs (drawn) and, when a transform makes them differ, fsCss (the CSS font-size).
//   Visibility: display, visibility, opacity, overflow clipping of ancestors and clip-path (inset, polygon, circle, ellipse)
//   of the element and its ancestors; text or shapes fully clipped by a mask reveal are not counted.
//
// Output: PASS / WARN / FAIL per rule with the sample times, an element snippet and the bbox [x0,y0,x1,y1] (0-1 of the frame),
// then "GATE G5: PASS|FAIL". --json prints the same as JSON. Text drawn into <canvas>/<img> is invisible to it; lint is a lead,
// not a verdict (a PASS is not good taste).
// Exit: 0 gate PASS (warnings allowed), 1 gate FAIL or RICHNESS FAIL, 2 bad usage / page failure.
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { launchChrome, parseArgs, helpFrom } from './_cdp.mjs';

const fail2 = (m) => { console.error('error: ' + m); process.exit(2); };
const { pos, opt } = parseArgs(process.argv.slice(2), { help: 'bool', times: 's', samples: 's', json: 'bool', width: 's', height: 's', duration: 's', type: 's' });
if (opt.help || !pos[0]) { console.log(helpFrom(import.meta.url)); process.exit(opt.help ? 0 : 2); }
const src = pos[0];
const url = /^(https?|file):/i.test(src) ? src : (fs.existsSync(src) ? pathToFileURL(path.resolve(src)).href : fail2(`input not found: ${src}`));
let userTimes = null;
if (opt.times !== undefined) {
  userTimes = opt.times.split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n) && n >= 0);
  if (!userTimes.length) fail2('--times needs numbers like 0.5,2,4.2');
}
const numOpt = (v, name) => { if (v === undefined) return null; const n = Number(v); if (!Number.isFinite(n) || n <= 0) fail2(`--${name} must be a positive number`); return n; };

// ---------------------------------------------------------------- page side
const PAGE_LIB = String.raw`(() => {
  const ids = new WeakMap(); let nid = 0;
  const id = (e) => { let v = ids.get(e); if (!v) { v = ++nid; ids.set(e, v); } return v; };
  const raf2 = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  window.__lintInfo = () => {
    const main = document.querySelector('[data-composition-id="main"]');
    const tls = window.__timelines && typeof window.__timelines === 'object' ? window.__timelines : null;
    let d = null;
    const demo = window.DEMO && typeof window.DEMO === 'object' ? window.DEMO : {};
    if (typeof window.__duration === 'number') d = window.__duration;
    else if (+demo.duration > 0) d = +demo.duration;
    else if (main && parseFloat(main.getAttribute('data-duration')) > 0) d = parseFloat(main.getAttribute('data-duration'));
    else if (tls && tls.main && typeof tls.main.duration === 'function') d = tls.main.duration();
    else if (window.gsap && gsap.globalTimeline) d = gsap.globalTimeline.duration();
    return { duration: d, width: (main ? parseInt(main.getAttribute('data-width')) : 0) || +demo.width || null, height: (main ? parseInt(main.getAttribute('data-height')) : 0) || +demo.height || null,
      seek: typeof window.__seek === 'function' ? '__seek' : typeof window.renderAt === 'function' ? 'renderAt' : typeof window.seek === 'function' ? 'seek'
        : (tls && Object.keys(tls).length ? '__timelines' : (window.gsap ? 'gsap' : 'none')) };
  };
  window.__lintPrepare = async () => {
    try { await document.fonts.ready; } catch (e) {}
    await Promise.all([...document.images].map((i) => (i.decode ? i.decode().catch(() => 0) : 0)));
    if (window.__ready && typeof window.__ready.then === 'function') await window.__ready;
    else if (typeof window.__ready === 'function') await window.__ready();
    else if (typeof window.renderAt === 'function' || typeof window.seek === 'function' || 'ready' in window || '__ready' in window) {
      // render-html.mjs contract: the page sets window.__ready = true (or window.ready = true) when fonts and data are loaded
      for (let i = 0; i < 300 && !(window.__ready === true || window.ready === true); i++) await new Promise((r) => setTimeout(r, 100));
    }
    return 1;
  };
  window.__lintSeek = async (t) => {
    if (typeof window.__seek === 'function') await window.__seek(t);
    else if (typeof window.renderAt === 'function') await window.renderAt(t);
    else if (typeof window.seek === 'function') await window.seek(t);
    else if (window.__timelines && typeof window.__timelines === 'object' && Object.keys(window.__timelines).length) {
      const names = Object.keys(window.__timelines).sort((a, b) => (a === 'main') - (b === 'main'));
      for (const n of names) { const tl = window.__timelines[n]; if (tl && typeof tl.seek === 'function') { if (tl.pause) tl.pause(); tl.seek(t, false); } }
    } else if (window.gsap && gsap.globalTimeline) { gsap.globalTimeline.pause(); gsap.globalTimeline.seek(t, false); }
    for (const a of document.getAnimations ? document.getAnimations() : []) {
      if (typeof CSSTransition !== 'undefined' && a instanceof CSSTransition) continue;
      try { a.pause(); a.currentTime = t * 1000; } catch (e) {}
    }
    await Promise.all([...document.querySelectorAll('video')].map(async (v) => {
      v.muted = true; try { v.pause(); } catch (e) {}
      const dur = isFinite(v.duration) ? v.duration : 1e9;
      const target = Math.min(Math.max(0, t - (parseFloat(v.dataset.start) || 0) + (parseFloat(v.dataset.mediaStart) || 0)), Math.max(0, dur - 0.001));
      if (Math.abs(v.currentTime - target) < 0.0005 && !v.seeking) return;
      await new Promise((res) => { const to = setTimeout(res, 2500); v.addEventListener('seeked', () => { clearTimeout(to); res(); }, { once: true }); v.currentTime = target; });
    }));
    await raf2();
    return 1;
  };
  window.__lintScan = () => {
    const W = innerWidth, H = innerHeight;
    const cs = (e) => getComputedStyle(e);
    const rgba = (c) => {
      let m = /^rgba?\(([^)]+)\)/.exec(c || '');
      if (m) { const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(parseFloat); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; }
      m = /^color\(srgb ([^)]+)\)/.exec(c || '');
      if (m) { const p = m[1].split(/[ \/]+/).filter(Boolean).map(parseFloat); return [p[0] * 255, p[1] * 255, p[2] * 255, p.length > 3 ? p[3] : 1]; }
      return [0, 0, 0, 0];
    };
    const snip = (e, txt) => {
      const cls = (typeof e.className === 'string' ? e.className : '').trim().split(/\s+/).filter(Boolean).slice(0, 2).join('.');
      return '<' + e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (cls ? '.' + cls : '') + '>' + (txt ? ' ' + JSON.stringify(txt.slice(0, 40)) : '');
    };
    const hidden = (e) => { for (let n = e; n && n !== document.body; n = n.parentElement) { const s = cs(n); if (s.display === 'none') return true; } return false; };
    const opacity = (e) => { let o = 1; for (let n = e; n && n.nodeType === 1; n = n.parentElement) o *= parseFloat(cs(n).opacity); return o; };
    // the box a CSS clip-path leaves visible (inset, polygon, circle, ellipse; null = no clip or a shape not modelled)
    const len = (v, ref) => (String(v).trim().endsWith('%') ? (parseFloat(v) / 100) * ref : parseFloat(v) || 0);
    const clipBox = (n) => {
      const cp = cs(n).clipPath; if (!cp || cp === 'none') return null;
      const b = n.getBoundingClientRect();
      let m = /^inset\(([^)]*)\)/.exec(cp);
      if (m) { const p = m[1].split(/\s+round\s+/)[0].trim().split(/\s+/); const t = p[0], r = p[1] ?? t, bo = p[2] ?? t, l = p[3] ?? r;
        return { x0: b.left + len(l, b.width), y0: b.top + len(t, b.height), x1: b.right - len(r, b.width), y1: b.bottom - len(bo, b.height) }; }
      m = /^polygon\((?:\s*(?:nonzero|evenodd)\s*,)?([^)]*)\)/.exec(cp);
      if (m) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        for (const pt of m[1].split(',')) { const [px, py] = pt.trim().split(/\s+/); if (py === undefined) continue;
          const x = b.left + len(px, b.width), y = b.top + len(py, b.height); x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
        return x1 <= x0 || y1 <= y0 ? { x0: 0, y0: 0, x1: 0, y1: 0 } : { x0, y0, x1, y1 }; }
      m = /^(circle|ellipse)\(([^)]*)\)/.exec(cp);
      if (m) { const [rad, at] = m[2].split(/\s+at\s+/); const rs = (rad || '').trim().split(/\s+/).filter(Boolean); const c = (at || '50% 50%').trim().split(/\s+/);
        const cx = b.left + len(c[0] || '50%', b.width), cy = b.top + len(c[1] || '50%', b.height), far = (v) => !v || /side|closest|farthest/.test(v);
        const rx = m[1] === 'circle' ? (far(rs[0]) ? Math.max(b.width, b.height) : len(rs[0], Math.hypot(b.width, b.height) / Math.SQRT2)) : (far(rs[0]) ? b.width : len(rs[0], b.width));
        const ry = m[1] === 'circle' ? rx : (far(rs[1]) ? b.height : len(rs[1], b.height));
        return { x0: cx - rx, y0: cy - ry, x1: cx + rx, y1: cy + ry }; }
      return null;
    };
    // fraction of a rect that survives the overflow clipping of its ancestors and the clip-path of the element and its ancestors
    // (a mask reveal at 0 % hides its text: it is not counted as visible)
    // visBox = the part of that rect left on screen (null = none)
    const visBox = (e, r, overflow = true) => {
      let x0 = Math.max(r.left, 0), y0 = Math.max(r.top, 0), x1 = Math.min(r.right, W), y1 = Math.min(r.bottom, H);
      for (let n = e; n && n !== document.documentElement; n = n.parentElement) {
        const s = cs(n);
        if (overflow && n !== e && !(s.overflowX === 'visible' && s.overflowY === 'visible')) {
          const q = n.getBoundingClientRect(); x0 = Math.max(x0, q.left); y0 = Math.max(y0, q.top); x1 = Math.min(x1, q.right); y1 = Math.min(y1, q.bottom);
        }
        const k = clipBox(n); if (k) { x0 = Math.max(x0, k.x0); y0 = Math.max(y0, k.y0); x1 = Math.min(x1, k.x1); y1 = Math.min(y1, k.y1); }
      }
      return x1 <= x0 || y1 <= y0 ? null : { x0, y0, x1, y1 };
    };
    const visFrac = (e, r, overflow = true) => {
      const b = visBox(e, r, overflow); return b ? ((b.x1 - b.x0) * (b.y1 - b.y0)) / Math.max(1, (r.right - r.left) * (r.bottom - r.top)) : 0;
    };
    // transforms, read the way the screen shows them. frameOf(e): tilt = e or an ancestor turns its plane out of the screen
    // (rotateX / rotateY, any 3D rotation); rot = the summed in-plane rotation in degrees; xf = some transform in the chain
    // changes size or depth (scale, rotation, translateZ, perspective()). A plain 2D translate is not a transform here.
    const ANG = { deg: 1, rad: 180 / Math.PI, turn: 360, grad: 0.9 };
    const angle = (v) => parseFloat(v) * (ANG[(/[a-z]+$/i.exec(String(v).trim()) || ['deg'])[0].toLowerCase()] || 1);
    const ownMatrix = (n) => {
      const s = cs(n), m = new DOMMatrix();
      try {
        const tr = (s.translate || 'none').trim().split(/\s+/); if (tr.length === 3) m.translateSelf(0, 0, parseFloat(tr[2]) || 0);
        if (s.rotate && s.rotate !== 'none') {
          const p = s.rotate.trim().split(/\s+/), a = angle(p.pop());
          const ax = p.length === 3 ? p.map(Number) : p[0] === 'x' ? [1, 0, 0] : p[0] === 'y' ? [0, 1, 0] : [0, 0, 1];
          m.rotateAxisAngleSelf(ax[0], ax[1], ax[2], a);
        }
        if (s.scale && s.scale !== 'none') {
          const p = s.scale.trim().split(/\s+/).map((v) => (v.endsWith('%') ? parseFloat(v) / 100 : parseFloat(v)));
          m.scaleSelf(p[0], p[1] ?? p[0], p[2] ?? 1);
        }
        if (s.transform && s.transform !== 'none') m.multiplySelf(new DOMMatrix(s.transform));
      } catch (e) {}
      return m;
    };
    const frames = new Map();
    const frameOf = (n) => {
      if (!n || n.nodeType !== 1 || n === document.documentElement) return { tilt: false, rot: 0, xf: false };
      if (frames.has(n)) return frames.get(n);
      const up = frameOf(n.parentElement), m = ownMatrix(n);
      const lx = Math.hypot(m.m11, m.m12, m.m13) || 1, ly = Math.hypot(m.m21, m.m22, m.m23) || 1;
      const lin = Math.abs(m.m11 - 1) + Math.abs(m.m12) + Math.abs(m.m13) + Math.abs(m.m21) + Math.abs(m.m22 - 1) + Math.abs(m.m23) + Math.abs(m.m33 - 1);
      const f = { tilt: up.tilt || Math.abs(m.m13) / lx > 0.03 || Math.abs(m.m23) / ly > 0.03,
        rot: up.rot + (Math.atan2(m.m12, m.m11) * 180) / Math.PI,
        xf: up.xf || lin > 1e-3 || Math.abs(m.m43) > 0.01 || Math.abs(m.m34) > 1e-6 };
      frames.set(n, f); return f;
    };
    // screen-aligned = no tilt and an in-plane rotation within 3 degrees of a right angle (its box is what is drawn)
    const aligned = (f) => { const d = ((f.rot % 90) + 90) % 90; return !f.tilt && (d < 3 || d > 87); };
    // projected scale of the text in p: drawn box height over layout height of its nearest laid-out box (rotation
    // corrected), so a word on a scaled or tilted 3D plane counts at the size it is drawn. 1 when no transform changes size.
    const projScale = (p) => {
      let n = p;
      while (n && n !== document.body && (!(n instanceof HTMLElement) || /^(inline|contents)$/.test(cs(n).display))) n = n.parentElement;
      if (!n || !(n instanceof HTMLElement)) return 1;
      const f = frameOf(n); if (!f.xf) return 1;
      const r = n.getBoundingClientRect(), ow = n.offsetWidth, oh = n.offsetHeight;
      if (!(oh > 0) || !(r.height > 0)) return 1;
      const a = (f.rot * Math.PI) / 180, k = r.height / Math.max(1e-6, ow * Math.abs(Math.sin(a)) + oh * Math.abs(Math.cos(a)));
      if (!isFinite(k)) return 1;
      return Math.abs(k - 1) < 0.015 ? 1 : Math.min(20, Math.max(0.02, k));
    };
    const CTRL = 'button, a[href], input, select, textarea, nav, [role="button"], [role="link"], [role="tab"], [role="navigation"], [role="menuitem"], [role="search"]';
    // a "UI surface" is a card-sized thing with a fill and rounded corners (or anything marked data-ui)
    const surfCache = new Map();
    const isSurface = (a) => {
      if (surfCache.has(a)) return surfCache.get(a);
      let res = false;
      if (a.hasAttribute && a.hasAttribute('data-ui')) res = true;
      else if (a !== document.body && a !== document.documentElement) {
        const s = cs(a), c = rgba(s.backgroundColor);
        const filled = c[3] >= 0.3 || (s.backgroundImage && s.backgroundImage !== 'none');
        const rad = s.borderTopLeftRadius || '0px'; const radius = rad.endsWith('%') ? parseFloat(rad) * 3 : parseFloat(rad);
        if (filled && radius >= 6) {
          const r = a.getBoundingClientRect(), area = (r.width * r.height) / (W * H);
          const full = r.width >= 0.9 * W && r.height >= 0.9 * H;
          const cy = (r.top + r.bottom) / 2 / H;
          const bar = r.width >= 0.6 * W && r.height <= 0.14 * H && (cy < 0.12 || cy > 0.88);
          res = area >= 0.025 && !full && !bar;
        }
      }
      surfCache.set(a, res); return res;
    };
    const surfaceOf = (e) => { for (let n = e; n && n !== document.body; n = n.parentElement) if (isSurface(n)) return n; return null; };
    const blocks = [], shapes = [], surfaces = [];
    // ---- text blocks: group visible text nodes by their nearest block-level ancestor
    const groups = new Map();
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = tw.nextNode(); n; n = tw.nextNode()) {
      const p = n.parentElement; if (!p || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|TITLE)$/.test(p.tagName)) continue;
      const txt = n.textContent.replace(/\s+/g, ' ').trim(); if (!txt) continue;
      if (hidden(p) || cs(p).visibility === 'hidden' || opacity(p) < 0.05) continue;
      const rg = document.createRange(); rg.selectNodeContents(n);
      const rs = [...rg.getClientRects()].filter((q) => q.width > 0.5 && q.height > 0.5);
      if (!rs.length) continue;
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (const q of rs) { x0 = Math.min(x0, q.left); y0 = Math.min(y0, q.top); x1 = Math.max(x1, q.right); y1 = Math.max(y1, q.bottom); }
      if (x1 < 0 || x0 > W || y1 < 0 || y0 > H) continue;
      if (visFrac(p, { left: x0, top: y0, right: x1, bottom: y1 }) < 0.5) continue;
      let c = p; while (c.parentElement && c !== document.body && /^(inline|contents)/.test(cs(c).display)) c = c.parentElement;
      const g = groups.get(c) || { c, parts: [], x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9, tops: new Set(), best: null };
      g.parts.push(txt); g.x0 = Math.min(g.x0, x0); g.y0 = Math.min(g.y0, y0); g.x1 = Math.max(g.x1, x1); g.y1 = Math.max(g.y1, y1);
      for (const q of rs) g.tops.add(Math.round(q.top / 4));
      if (!g.best || txt.length > g.best.len) g.best = { len: txt.length, p };
      groups.set(c, g);
    }
    const blockEls = [];
    for (const g of groups.values()) {
      const text = g.parts.join(' ').replace(/\s+([.,;:!?])/g, '$1').trim(); if (!text) continue;
      const p = g.best.p, s = cs(p), fs = parseFloat(s.fontSize) || 16, cont = cs(g.c), k = projScale(p);
      const lsRaw = s.letterSpacing === 'normal' ? 0 : parseFloat(s.letterSpacing) || 0;
      const letters = text.replace(/[^A-Za-z]/g, '');
      const sf = surfaceOf(g.c);
      if (!g.c.closest('[data-required-label]')) blockEls.push(g.c);
      // fs = drawn size (CSS font-size x projected scale); fsCss = the CSS font-size; ls stays in em of the CSS size
      blocks.push({ id: id(g.c), text: text.slice(0, 120), x0: g.x0 / W, y0: g.y0 / H, x1: g.x1 / W, y1: g.y1 / H, fs: (fs * k) / H, fsCss: fs / H, ls: lsRaw / fs,
        tilt: frameOf(g.c).tilt,
        up: s.textTransform === 'uppercase' || (letters.length >= 3 && letters === letters.toUpperCase()),
        mono: /mono|menlo|courier|consolas/i.test(s.fontFamily), w: +s.fontWeight || 400, color: rgba(s.color).map((v, i) => (i < 3 ? Math.round(v) : +(v * opacity(p)).toFixed(2))),
        ta: cont.textAlign, lines: g.tops.size, ui: sf ? id(sf) : 0, uiCaptured: !!(sf && sf.getAttribute && sf.closest('[data-ui="captured"]')), snip: snip(g.c, text),
        req: !!g.c.closest('[data-required-label]') });
    }
    // ---- shapes: filled / bordered boxes, media, dots
    for (const e of document.body.querySelectorAll('*')) {
      if (e.closest('svg') && e.tagName.toLowerCase() !== 'svg') continue;
      const tag = e.tagName.toLowerCase(); if (/^(script|style|noscript|template|br|source|track|link|meta)$/.test(tag)) continue;
      if (hidden(e)) continue; const s = cs(e); if (s.visibility === 'hidden' && !/^(svg|img|video|canvas)$/.test(tag)) continue;
      const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1 || r.right < 0 || r.left > W || r.bottom < 0 || r.top > H) continue;
      const op = opacity(e); if (op < 0.05) continue;
      if (visFrac(e, r, false) === 0) continue;               // fully clipped by a clip-path
      const bg = rgba(s.backgroundColor), media = /^(img|video|canvas|svg|picture|iframe)$/.test(tag) || (s.backgroundImage && /url\(/.test(s.backgroundImage));
      const bw = [s.borderTopWidth, s.borderBottomWidth, s.borderLeftWidth, s.borderRightWidth].map((v) => parseFloat(v) || 0);
      const bcol = rgba(s.borderTopColor);
      const fill = bg[3] * op >= 0.05 || (s.backgroundImage && s.backgroundImage !== 'none');
      const border = (bw[0] >= 1 || bw[1] >= 1) && bcol[3] > 0.05;
      if (!fill && !media && !border) continue;
      const rad = s.borderTopLeftRadius || '0px'; const radius = rad.endsWith('%') ? parseFloat(rad) : parseFloat(rad) / Math.max(1, Math.min(r.width, r.height)) * 100;
      // C6 reads the on-screen box (vb), whether the plane is screen-aligned, and what a wide shape holds (text, controls)
      const vis = visBox(e, r, true), wide = !!vis && vis.x1 - vis.x0 >= 0.5 * W;
      const ctrl = wide && (e.matches(CTRL) || [...e.querySelectorAll(CTRL)].some((c) => !hidden(c) && opacity(c) >= 0.05));
      const inner = wide ? blockEls.filter((c) => e.contains(c)).length : 0;
      shapes.push({ id: id(e), tag, snip: snip(e), x0: r.left / W, y0: r.top / H, x1: r.right / W, y1: r.bottom / H, w: r.width, h: r.height,
        vb: vis ? [vis.x0 / W, vis.y0 / H, vis.x1 / W, vis.y1 / H] : null, aligned: aligned(frameOf(e)), ctrl, inner,
        fill: !!fill, alpha: +(bg[3] * op).toFixed(2), bg: bg.slice(0, 3).map(Math.round), border, media: !!media, radiusPct: Math.round(radius), req: !!e.closest('[data-required-label]'), ui: (() => { const sf = surfaceOf(e.parentElement || e); return sf ? id(sf) : 0; })(), selfSurface: isSurface(e) });
      if (isSurface(e)) surfaces.push({ id: id(e), x0: r.left / W, y0: r.top / H, x1: r.right / W, y1: r.bottom / H });
      if (shapes.length > 2500) break;
    }
    // richness marks: data-ice-layer (or data-layer) names, the [data-hero] box, and the widest headline-size text
    const layers = new Set();
    if (typeof window.__layers === 'function') { try { for (const n of window.__layers(window.__lintT || 0) || []) layers.add(String(n)); } catch (e) {} }
    for (const e of document.querySelectorAll('[data-ice-layer], [data-layer]')) {
      if (hidden(e) || cs(e).visibility === 'hidden' || opacity(e) < 0.05) continue;
      const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1 || r.right < 0 || r.left > W || r.bottom < 0 || r.top > H) continue;
      if (visFrac(e, r, false) === 0) continue;
      layers.add(e.getAttribute('data-ice-layer') ?? e.getAttribute('data-layer'));
    }
    let hero = null;
    const he = [...document.querySelectorAll('[data-hero]')].find((e) => !hidden(e) && opacity(e) >= 0.05 && visFrac(e, e.getBoundingClientRect(), false) > 0);
    if (he) { const r = he.getBoundingClientRect(); const x0 = Math.max(0, r.left), x1 = Math.min(W, r.right), y0 = Math.max(0, r.top), y1 = Math.min(H, r.bottom);
      hero = { area: Math.max(0, x1 - x0) * Math.max(0, y1 - y0) / (W * H), width: Math.max(0, x1 - x0) / W }; }
    const heads = blocks.filter((b) => b.fs >= 0.05);
    const textW = heads.reduce((m, b) => Math.max(m, Math.min(1, b.x1) - Math.max(0, b.x0)), 0);
    const marked = layers.size > 0 || typeof window.__layers === 'function';
    return { blocks, shapes, surfaces, rich: { layers: [...layers], marked, hero, textW } };
  };
  return true;
})()`;

// ---------------------------------------------------------------- node side: rules
const R = [
  ['C1', 'corner/edge micro-label', 'FAIL'], ['C2', 'tracked uppercase label', 'FAIL'], ['C3', 'chapter / counter index', 'FAIL'],
  ['C4', 'production metadata (BPM/FPS/timecode/version)', 'FAIL'], ['C5', 'mono micro-label', 'WARN'], ['C6', 'header/footer bar or row', 'FAIL'],
  ['C7', 'kicker above headline', 'FAIL'], ['D1', 'deck layout (left-anchored headline block)', 'FAIL'], ['P1', 'progress bar', 'FAIL'],
  ['T1', 'letter-typed headline', 'FAIL'], ['V1', 'greeting header', 'FAIL'], ['V2', 'label . value line', 'FAIL'],
  ['V3', 'status dot beside text', 'WARN'], ['V4', 'zinc-grey text', 'WARN'], ['V5', 'vibe-coded UI card (cluster)', 'FAIL'],
];
const RULE = Object.fromEntries(R.map(([id, name, sev]) => [id, { id, name, sev, hits: new Map() }]));
const addHit = (rule, t, key, d) => {
  const r = RULE[rule]; const h = r.hits.get(key) || { ...d, times: [], sev: d.sev || r.sev }; if (!h.times.includes(t)) h.times.push(t);
  if (d.sev === 'FAIL') h.sev = 'FAIL'; r.hits.set(key, h);
};
const r2 = (v) => +v.toFixed(3);
const bb = (b) => [r2(b.x0), r2(b.y0), r2(b.x1), r2(b.y1)];
const fsPct = (b) => +(b.fs * 100).toFixed(1);
// hit size fields: fs = drawn size; fsCss = the CSS font-size, only when a transform makes them differ
const fsOf = (b) => (b.fsCss && Math.abs(b.fsCss - b.fs) > 0.0005 ? { fs: fsPct(b), fsCss: +(b.fsCss * 100).toFixed(1) } : { fs: fsPct(b) });
const ZINC = [[0xd4, 0xd4, 0xd8], [0xa1, 0xa1, 0xaa], [0x71, 0x71, 0x7a], [0x52, 0x52, 0x5b]];
const near = (c, k, d) => Math.hypot(c[0] - k[0], c[1] - k[1], c[2] - k[2]) <= d;
const RX = {
  counterNum: new RegExp('^\\s*0?\\d{1,2}\\s*(?:[\\/' + String.fromCharCode(0x2014, 0x2013) + '·]|-(?=\\s*[A-Za-z]{3,}))\\s*(?:0?\\d{1,2}\\b|[A-Za-z]{3,})'),
  counterWord: /\b(chapter|scene|act|step|part|film|episode|shot|take|bar|beat)\s*0?\d/i,
  counterBare: /^\s*0\d\s*$/,
  meta: /\bBPM\b|\bFPS\b|\bFRAME\s*\d|\b(1920|3840|1280)\s*[x×]\s*(1080|2160|720)\b|\bT\s*[+]\s*\d|\bTC\b|\b\d{1,2}:\d{2}:\d{2}(?:[.:]\d+)?\b|\b\d{1,2}:\d{2}\.\d{1,3}\b|\bREC\b/,
  ver: /\bv\d+\.\d+(?:\.\d+)?\b|©/i,
  greeting: /\bgood\s+(morning|afternoon|evening)\b|\bwelcome back\b|^(hi|hey|hello)\b[^.,]{0,24}(!|\u{1F44B}|\u{1F31E}|\u2600)/iu,
  labelValue: /^[A-Za-z][A-Za-z ]{2,24}\s*[·•]\s*[$€£]?\s?\d[\d,.]*\s?[kKmMbB%]?/,
};

function evalSample(t, A, B, hits) {
  let blocks = A.blocks, shapes = A.shapes;
  const stable = (b) => B.blocks.some((c) => c.text === b.text && Math.abs(c.x0 - b.x0) < 0.006 && Math.abs(c.y0 - b.y0) < 0.006);
  // required on-screen labels ([data-required-label]: "Example data", the unofficial-concept line) are exempt from every
  // rule here; their wording, size and placement rule is ice-assets truth-sheet.md section 9, checked by the critic
  for (const b of blocks.filter((x) => x.req)) hits.exempt.add('[data-required-label] exempt: ' + JSON.stringify(b.text.slice(0, 60)) + ' at ' + bb(b).join(',') + ', ' + fsPct(b) + ' % H' +
    ((b.up && b.ls >= 0.05) || b.mono ? ' (set in tracked caps or mono: the rule asks for the body font in sentence case)' : ''));
  blocks = blocks.filter((b) => !b.req); shapes = shapes.filter((s) => !s.req);
  const free = blocks.filter((b) => !b.ui);                       // outside any UI surface
  const maxFs = free.reduce((m, b) => Math.max(m, b.fs), 0);
  const clusterKinds = new Map();                                  // surface id (0 = page) -> {kinds:Set, ex:[], captured}
  const kind = (b, k, ex) => { const key = b.ui || 0; if (k === 'zinc' && !key) return; const c = clusterKinds.get(key) || { kinds: new Set(), ex: [], captured: false }; c.kinds.add(k); c.ex.push(ex); if (b.uiCaptured) c.captured = true; clusterKinds.set(key, c); };
  for (const b of blocks) {
    const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2, small = b.fs <= 0.04, d = { text: b.text, snippet: b.snip, bbox: bb(b), ...fsOf(b) };
    // vibe-coded UI patterns (apply everywhere, also inside UI cards)
    if (RX.greeting.test(b.text)) { addHit('V1', t, b.text, d); kind(b, 'greeting', b.text); }
    if (RX.labelValue.test(b.text) && !RX.meta.test(b.text)) { addHit('V2', t, b.text, d); kind(b, 'label.value', b.text); }
    if (ZINC.some((k) => near(b.color, k, 10)) && b.color[3] >= 0.5) { addHit('V4', t, '#' + b.color.slice(0, 3).map((v) => v.toString(16).padStart(2, '0')).join(''), { ...d, text: b.text }); kind(b, 'zinc', b.text); }
    if (b.ui) continue;
    // page chrome
    const stab = stable(b);
    const corner = (cx < 0.2 || cx > 0.8) && (cy < 0.14 || cy > 0.86), edge = b.y1 < 0.07 || b.y0 > 0.93 || b.x1 < 0.05 || b.x0 > 0.95;
    if (small && stab && (corner || edge)) addHit('C1', t, b.text, d);
    if (b.up && b.ls >= 0.05 && b.fs <= 0.045 && b.text.replace(/[^A-Za-z]/g, '').length >= 2) addHit('C2', t, b.text, { ...d, note: 'letter-spacing ' + b.ls.toFixed(2) + 'em' });
    if (b.fs <= 0.06 && (RX.counterNum.test(b.text) || RX.counterWord.test(b.text) || (b.fs <= 0.05 && RX.counterBare.test(b.text))) && !/^\s*24\s*\/\s*7\b/.test(b.text)) addHit('C3', t, b.text, d);
    if ((RX.meta.test(b.text) && b.fs <= 0.06) || (RX.ver.test(b.text) && b.fs <= 0.04)) addHit('C4', t, b.text, d);
    if (b.mono && small) addHit('C5', t, b.text, d);
  }
  // C6: bars / hairlines / left+right small-text rows in the outer bands, judged on what the screen shows: the on-screen
  // box (projected, clipped to the frame), a screen-aligned plane (scene geometry on a tilted 3D plane is skipped), and
  // what the bar holds (text or controls = FAIL; an empty bar or rule = WARN, a lead to check by eye)
  for (const s of shapes) {
    if (s.media || s.ui || s.selfSurface || !s.vb) continue;
    const [x0, y0, x1, y1] = s.vb, w = x1 - x0, h = y1 - y0, cy = (y0 + y1) / 2;
    const band = cy < 0.12 || cy > 0.88, bandR = cy < 0.14 || cy > 0.86;
    const bar = w >= 0.6 && h <= 0.14 && band && (s.alpha >= 0.1 || s.border);
    const rule = !bar && w >= 0.5 && s.h <= 4 && bandR;
    if (!bar && !rule) continue;
    if (s.aligned === false) { hits.tilted.set(s.id, s.snip); continue; }
    const on = free.filter((b) => !b.tilt && b.fs <= 0.06 && (b.x0 + b.x1) / 2 >= x0 && (b.x0 + b.x1) / 2 <= x1 &&
      (bar ? (b.y0 + b.y1) / 2 >= y0 && (b.y0 + b.y1) / 2 <= y1 : Math.abs((b.y0 + b.y1) / 2 - cy) <= 0.05));
    const held = [s.inner ? s.inner + ' text block(s) inside' : '', s.ctrl ? 'controls' : '', on.length ? 'text "' + on[0].text.slice(0, 30) + '"' : ''].filter(Boolean);
    const box = [x0, y0, x1, y1].map(r2), where = cy < 0.5 ? 'top' : 'bottom';
    const what = bar ? 'full-width bar in the ' + where + ' band' + (s.alpha >= 0.1 ? ' (filled)' : ' (border)') : 'hairline rule in the ' + where + ' band';
    addHit('C6', t, (bar ? 'bar ' : 'rule ') + s.snip + ' ' + box.join(','), { text: '', snippet: s.snip, bbox: box, sev: held.length ? 'FAIL' : 'WARN',
      note: what + (held.length ? ', holding ' + held.join(', ') : ', empty (page chrome when it frames text or controls; check by eye)') });
  }
  for (const band of ['top', 'bottom']) {
    const row = free.filter((b) => !b.tilt && b.fs <= 0.045 && (band === 'top' ? (b.y0 + b.y1) / 2 < 0.12 : (b.y0 + b.y1) / 2 > 0.88));
    const L = row.filter((b) => (b.x0 + b.x1) / 2 < 0.35), Rr = row.filter((b) => (b.x0 + b.x1) / 2 > 0.65);
    for (const a of L) for (const c of Rr) if (Math.abs((a.y0 + a.y1) / 2 - (c.y0 + c.y1) / 2) < 0.03 && stable(a) && stable(c))
      addHit('C6', t, 'row ' + a.text + '|' + c.text, { text: a.text + '  ...  ' + c.text, snippet: a.snip + ' + ' + c.snip, bbox: bb({ x0: a.x0, y0: Math.min(a.y0, c.y0), x1: c.x1, y1: Math.max(a.y1, c.y1) }), note: band + ' row: left and right small labels on one line' });
  }
  // C7 kicker, D1 deck
  const kickers = new Map();
  for (const a of free) for (const b of free) {
    if (a === b || !(a.fs <= 0.04) || !(b.fs >= a.fs * 2 && b.fs >= 0.05)) continue;
    const gap = b.y0 - a.y1; if (!(gap < 0.06 && gap > -0.01)) continue;
    const ax = (a.x0 + a.x1) / 2, bx = (b.x0 + b.x1) / 2;
    if (!(Math.abs(a.x0 - b.x0) < 0.02 || Math.abs(ax - bx) < 0.02) || !stable(a) || !stable(b)) continue;
    kickers.set(b.id, a);
    addHit('C7', t, a.text + '>' + b.text, { text: a.text + '  over  ' + b.text, snippet: a.snip + ' over ' + b.snip, bbox: bb({ x0: Math.min(a.x0, b.x0), y0: a.y0, x1: Math.max(a.x1, b.x1), y1: b.y1 }), ...fsOf(b) });
  }
  const mediaR = (h) => shapes.find((s) => { const ar = (s.x1 - s.x0) * (s.y1 - s.y0), cx = (s.x0 + s.x1) / 2; return (s.media || s.selfSurface) && ar >= 0.04 && ar <= 0.7 && cx > 0.5 && s.x0 > h.x1 - 0.05 && s.y1 > h.y0 && s.y0 < h.y1 + 0.2; });
  for (const b of free) {
    if (!(b.fs >= 0.05 && b.fs >= 0.85 * maxFs && b.x0 < 0.2 && b.x0 >= 0.02 && b.x1 < 0.78 && b.ta !== 'center' && Math.abs((b.x0 + b.x1) / 2 - 0.5) > 0.06 && stable(b))) continue;
    const ev = [];
    const sub = free.find((c) => c !== b && c.fs >= 0.02 && c.fs <= 0.6 * b.fs && c.y0 - b.y1 > -0.005 && c.y0 - b.y1 < 0.08 && Math.abs(c.x0 - b.x0) < 0.03);
    if (sub) ev.push('sub-line "' + sub.text.slice(0, 30) + '"');
    if (kickers.has(b.id)) ev.push('kicker "' + kickers.get(b.id).text.slice(0, 30) + '"');
    const m = mediaR(b); if (m) ev.push('media on the right ' + m.snip);
    if (b.lines >= 2) ev.push(b.lines + ' lines');
    addHit('D1', t, b.text, { text: b.text, snippet: b.snip, bbox: bb(b), ...fsOf(b), sev: ev.length ? 'FAIL' : 'WARN', note: ev.length ? 'left-anchored headline with ' + ev.join(', ') : 'left-anchored single-line headline (ok only as a split phrase under ~1.2 s)' });
  }
  // V3 status dots: a filled circle 6-14 px (at 1080p) with text right after it
  for (const s of shapes) {
    const w = s.x1 - s.x0, h = s.y1 - s.y0, px = s.h * (1080 / 1080);
    if (!(s.h >= 5 && s.h <= 15 && Math.abs(s.w - s.h) <= 2 && s.radiusPct >= 45 && s.alpha >= 0.5 && !s.media)) continue;
    const nb = blocks.find((b) => Math.abs((b.y0 + b.y1) / 2 - (s.y0 + s.y1) / 2) < 0.012 && b.x0 - s.x1 > -0.002 && b.x0 - s.x1 < 0.02);
    if (!nb) continue;
    const key = 'dot ' + nb.text;
    addHit('V3', t, key, { text: nb.text, snippet: s.snip + ' + ' + nb.snip, bbox: bb({ x0: s.x0, y0: Math.min(s.y0, nb.y0), x1: nb.x1, y1: Math.max(s.y1, nb.y1) }) });
    const c = clusterKinds.get(s.ui || 0) || { kinds: new Set(), ex: [], captured: false }; c.kinds.add('status dot'); c.ex.push('dot + ' + nb.text); if (nb.uiCaptured) c.captured = true; clusterKinds.set(s.ui || 0, c);
  }
  for (const [uid, c] of clusterKinds) if (c.kinds.size >= 2 && !c.captured)
    addHit('V5', t, (uid ? 'surface ' + uid : 'page') + [...c.kinds].sort().join('+'), { text: [...new Set(c.ex)].slice(0, 4).join('  |  '), snippet: uid ? 'UI surface #' + uid : 'page level', bbox: (() => { const sf = A.surfaces.find((q) => q.id === uid); return sf ? bb(sf) : [0, 0, 1, 1]; })(), note: 'kinds: ' + [...c.kinds].sort().join(', ') });
  else if (c.kinds.size >= 2 && c.captured) hits.exempt.add('V5 skipped in a [data-ui="captured"] surface (' + [...c.kinds].sort().join(', ') + ')');
}

// T1 letter-typed headlines: pair readings, mid-word growth; plus caret next to a headline-size block
function evalTyping(t, A, B) {
  const head = A.blocks.filter((b) => !b.ui && !b.req && b.fs >= 0.05);
  for (const b of head) {
    const g = B.blocks.find((c) => !c.ui && Math.abs(c.y0 - b.y0) < 0.02 && (Math.abs(c.x0 - b.x0) < 0.03 || Math.abs((c.x0 + c.x1) / 2 - (b.x0 + b.x1) / 2) < 0.03) && c.text.length > b.text.length && c.text.startsWith(b.text));
    if (g) {
      const rest = g.text.slice(b.text.length), lastTok = b.text.split(/\s+/).pop(), tok2 = g.text.split(/\s+/)[b.text.split(/\s+/).length - 1] || '';
      const midWord = !/^\s/.test(rest) && tok2.length > lastTok.length && b.text.length >= 1;
      if (midWord) addHit('T1', t, b.text.slice(0, 20), { text: b.text + '  ->  ' + g.text, snippet: b.snip, bbox: bb(b), ...fsOf(b), sev: 'FAIL', note: 'text grew by letters (' + b.text.length + ' -> ' + g.text.length + ' chars in 0.1 s)' });
    }
    const caret = A.shapes.find((s) => !s.media && !s.ui && s.w <= 0.012 * 1920 && s.h >= b.fs * 1080 * 0.6 && s.h <= b.fs * 1080 * 2.4 && s.x0 - b.x1 > -0.006 && s.x0 - b.x1 < 0.03 && s.y0 < b.y1 && s.y1 > b.y0 && s.alpha >= 0.3);
    if (caret || /[|▌█▍_]$/.test(b.text)) addHit('T1', t, 'caret ' + b.text.slice(0, 20), { text: b.text, snippet: b.snip, bbox: bb(b), ...fsOf(b), sev: 'WARN', note: 'caret next to headline-size text (FAIL when the text also grows by letters)' });
  }
}

// ---------------------------------------------------------------- richness floor from the DOM
// Node copy of the film-type helpers in storyboard_lint.py: the type comes from ice/state.json "subtype" or the film_type
// row of ice/BRIEF.md; the row names come from references/motion-density.md section 6; the floor numbers are read from the
// ice-film type file's "Richness floor" table (never copied into ice-qa).
const HERE = path.dirname(fileURLToPath(import.meta.url));
const readText = (f) => { try { return fs.readFileSync(f, 'utf8'); } catch { return null; } };
const cellsOf = (ln) => ln.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
const norm = (t) => String(t || '').toLowerCase().replace(/[\W_]+/g, ' ').trim();
function tableAfter(lines, at) {
  for (let i = at; i < lines.length - 1; i++) if (lines[i].trim().startsWith('|') && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
    const rows = []; for (let j = i + 2; j < lines.length && lines[j].trim().startsWith('|'); j++) rows.push(cellsOf(lines[j]));
    return rows;
  }
  return [];
}
function filmType(start, given) {
  if (given) return { text: given, src: '--type' };
  for (let d = path.resolve(start); ; d = path.dirname(d)) {
    for (const ice of [...(path.basename(d) === 'ice' ? [d] : []), path.join(d, 'ice')]) {
      const sj = readText(path.join(ice, 'state.json'));
      if (sj) { try { const v = JSON.parse(sj).subtype; if (v) return { text: String(v), src: path.join(ice, 'state.json') }; } catch {} }
      const bm = readText(path.join(ice, 'BRIEF.md'));
      if (bm) for (const ln of bm.split(/\r?\n/)) { const c = ln.trim().startsWith('|') ? cellsOf(ln) : []; if (c.length >= 2 && norm(c[0]) === 'film type' && c[1]) return { text: c[1], src: path.join(ice, 'BRIEF.md') }; }
    }
    if (path.dirname(d) === d) return { text: null, src: null };
  }
}
function typeRow(text) {
  const md = readText(path.join(HERE, '..', 'references', 'motion-density.md')) || '';
  const lines = md.split(/\r?\n/); const at = lines.findIndex((l) => /^##\s*6\./.test(l));
  const names = at < 0 ? [] : tableAfter(lines, at).flatMap((r) => r[0].split('/').map((n) => n.trim().toLowerCase()));
  const t = ' ' + norm(text) + ' ';
  const hits = names.filter((n) => n !== 'default' && t.includes(' ' + norm(n) + ' ')).map((n) => [t.indexOf(' ' + norm(n) + ' '), -n.length, n]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  return hits.length ? hits[0][2] : 'default';
}
function parseFloor(cell, orient) {
  const raw = String(cell || '').trim(); if (!raw || /^(n\/a|-)/i.test(raw)) return null;
  const V = /\bvertical\b|9\s*:\s*16|portrait/i, L = /16\s*:\s*9|landscape|horizontal|\bsquare\b|1\s*:\s*1/i;
  const [me, other] = orient === 'vertical' ? [V, L] : [L, V];
  const nums = [], kept = [];
  for (const cl of raw.split(';')) {
    if (other.test(cl) && !me.test(cl)) continue;
    const c = cl.replace(/\([^)]*\)/g, ' ').replace(/\d+\s*:\s*\d+|\bof\s+16\b|\bper\s+\d+(?:\.\d+)?\s*s\b/g, ' ');
    const f = [...c.matchAll(/(?<![\w.])\d+(?:\.\d+)?/g)].map((m) => +m[0]);
    if (f.length) { nums.push(...f); kept.push(cl.trim()); }
  }
  return nums.length ? { lo: Math.min(...nums), hi: Math.max(...nums), clause: kept.join('; ') } : null;
}
function ownerFloor(row, orient) {
  const f = path.join(HERE, '..', '..', 'ice-film', 'references', 'film-types', row.split('/')[0].trim().replace(/ /g, '-') + '.md');
  const md = readText(f); if (!md) return { floors: {}, file: null };
  const lines = md.split(/\r?\n/); const at = lines.findIndex((l) => /^\s*#/.test(l) && /richness floor/i.test(l));
  const floors = {};
  if (at >= 0) for (const r of tableAfter(lines, at)) { const k = (/`([a-z_]+)`/.exec(r[0]) || [])[1]; const v = k && parseFloor(r[1], orient); if (v) floors[k] = v; }
  return { floors, file: f };
}
function richnessFromDom(samples, W, H, src, given) {
  const ft = filmType(fs.existsSync(src) ? path.dirname(path.resolve(src)) : process.cwd(), given);
  const row = typeRow(ft.text);
  const { floors, file } = row === 'default' ? { floors: {}, file: null } : ownerFloor(row, H > W ? 'vertical' : 'landscape');
  const med = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor((s.length - 1) / 2)] : null; };
  const res = { filmType: ft.text, typeSource: ft.src, row, floorsFrom: file, measures: {}, status: 'PASS', lines: [] };
  const marked = samples.some((s) => s.marked);
  const heroS = samples.filter((s) => s.hero);
  const add = (k, vals, unit, scale, mark) => {
    const fl = floors[k];
    if (!vals.length) { res.measures[k] = { value: null, note: mark }; return; }
    const v = med(vals) * scale, low = vals.filter((x) => fl && x * scale < fl.lo).length;
    let light = '--';
    if (fl) light = v < fl.lo ? 'FAIL' : (v < fl.hi || low ? 'WARN' : 'PASS');
    res.measures[k] = { value: +v.toFixed(1), light, floor: fl ? fl.clause : null, samplesUnder: low, unit };
  };
  add('depth_layers', marked ? samples.map((s) => s.layers.length) : [], '', 1, 'the page marks no layers (data-ice-layer or window.__layers)');
  add('hero_share', heroS.map((s) => s.hero.area), ' %', 100, 'no [data-hero] element');
  const tw = samples.map((s) => Math.max(s.textW || 0, s.hero ? s.hero.width : 0)).filter((x) => x > 0);
  add('hero_width', tw, ' %', 100, 'no headline-size text or [data-hero] in the DOM');
  // A floor that names depth_layers on a page with no layer marks is unmeasured, and unmeasured fails (never n/a).
  if (floors.depth_layers && !marked) res.measures.depth_layers = { value: null, light: 'FAIL', floor: floors.depth_layers.clause,
    note: 'UNMEASURED: the film type has a depth_layers floor but the page marks no layers; add data-ice-layer="<name>" to each layer or expose window.__layers(t)' };
  if (res.measures.depth_layers.light === 'FAIL') res.status = 'FAIL';
  else if (Object.values(res.measures).some((m) => m.light === 'FAIL' || m.light === 'WARN')) res.status = 'WARN';
  res.lines.push(`RICHNESS (DOM): ${res.status === 'PASS' && !marked && !heroS.length ? 'N/A' : res.status}   film type ${ft.text || 'unknown'} (${ft.src || 'not found'}) -> '${row}', floors from ${file || 'no owner table'}`);
  for (const [k, m] of Object.entries(res.measures)) {
    res.lines.push(`  ${k.padEnd(13)} ${m.value === null ? (m.light === 'FAIL' ? m.note : 'n/a (' + m.note + ')') : m.value + (m.unit || '') + ' median over samples' + (m.samplesUnder ? ', ' + m.samplesUnder + ' sample(s) under the floor' : '')}` +
      (m.floor ? `   floor: ${m.floor}   ${k === 'depth_layers' ? m.light : { FAIL: 'UNDER (lead)', WARN: 'CHECK (lead)', PASS: 'ok' }[m.light]}` : ''));
  }
  res.lines.push('  hero_share and hero_width are leads here (gated on the render by film_gate.py); depth_layers below the floor, or unmarked when the type has a floor, fails. Canvas films: expose window.__layers(t).');
  return res;
}

// ---------------------------------------------------------------- main
let br, exitCode = 0;
(async () => {
  br = await launchChrome({ args: ['--allow-file-access-from-files'] });
  let W = numOpt(opt.width, 'width'), H = numOpt(opt.height, 'height');
  const page = await br.newPage({ width: W || 1920, height: H || 1080, scale: 1 });
  const loaded = await page.goto(url, { timeout: 45000 });
  if (!loaded) console.error('warn: load event timed out, continuing');
  await page.eval(PAGE_LIB);
  await page.eval('window.__lintPrepare()', { timeout: 60000 });
  const info = await page.eval('window.__lintInfo()');
  W = W || info.width || 1920; H = H || info.height || 1080;
  await page.setViewport(W, H, 1);
  if (info.seek === 'none') console.error('warn: no seek mechanism found (renderAt / seek / __seek / __timelines / gsap): the page is read as a static frame');
  let dur = numOpt(opt.duration, 'duration') || info.duration;
  if (!(dur > 0)) { dur = 10; console.error('warn: duration unknown (set window.__duration or pass --duration); assuming 10 s'); }
  let times = userTimes;
  if (!times) {
    const n = numOpt(opt.samples, 'samples') || Math.max(12, Math.min(36, Math.round(dur * 1.5)));
    times = Array.from({ length: Math.round(n) }, (_, i) => +(((i + 0.5) * dur) / n).toFixed(2));
  }
  const hits = { exempt: new Set(), tilted: new Map() };
  const barSeries = new Map();                                      // shape id -> [{t, w, snip, bbox}]
  const richSamples = [];
  for (const t of times) {
    await page.eval(`window.__lintT = ${t}; window.__lintSeek(${t})`, { timeout: 40000 });
    const A = JSON.parse(await page.eval('JSON.stringify(window.__lintScan())', { timeout: 30000 }));
    richSamples.push({ t, ...A.rich });
    const t2 = t + 0.1 <= dur ? t + 0.1 : Math.max(0, t - 0.1);
    await page.eval(`window.__lintSeek(${t2})`, { timeout: 40000 });
    const B = JSON.parse(await page.eval('JSON.stringify(window.__lintScan())', { timeout: 30000 }));
    // order the pair so A is earlier (growth direction)
    const [P, Q] = t2 >= t ? [A, B] : [B, A];
    evalSample(t, A, t2 >= t ? B : A, hits);
    evalTyping(t, P, Q);
    for (const s of A.shapes) if (!s.media && !s.ui && !s.selfSurface && (s.h <= 0.016 * H) && s.w >= 2 && (s.alpha >= 0.2 || s.border)) {
      const a = barSeries.get(s.id) || []; a.push({ t, w: s.x1 - s.x0, snip: s.snip, bbox: bb(s) }); barSeries.set(s.id, a);
    }
  }
  // P1: a thin non-UI bar whose width grows (mostly non-decreasing, >= 0.08 W total) across >= 3 samples
  for (const [, a] of barSeries) {
    if (a.length < 3) continue;
    const ws = a.map((x) => x.w), grow = Math.max(...ws) - Math.min(...ws);
    let up = 0, dn = 0; for (let i = 1; i < ws.length; i++) { if (ws[i] > ws[i - 1] + 0.002) up++; else if (ws[i] < ws[i - 1] - 0.002) dn++; }
    if (grow >= 0.08 && up >= 2 && dn <= Math.max(0, Math.floor(up / 3)))
      for (const x of a) addHit('P1', x.t, a[0].snip, { text: '', snippet: a[0].snip, bbox: x.bbox, note: 'thin bar grows ' + r2(Math.min(...ws)) + ' -> ' + r2(Math.max(...ws)) + ' of W over t=' + a[0].t + '..' + a[a.length - 1].t });
  }
  await page.close();

  // ---------- report
  if (hits.tilted.size) hits.exempt.add('C6 skipped ' + hits.tilted.size + ' bar or rule shape(s) on a tilted 3D plane (scene geometry, not page chrome): ' +
    [...new Set(hits.tilted.values())].slice(0, 4).join(', ') + (new Set(hits.tilted.values()).size > 4 ? ', ...' : ''));
  const out = { file: path.resolve(src.replace(/^file:\/\//, '')), width: W, height: H, duration: dur, samples: times, rules: [], exemptions: [...hits.exempt] };
  let failed = [];
  for (const r of Object.values(RULE)) {
    const hs = [...r.hits.values()].map((h) => ({ ...h, times: h.times.sort((a, b) => a - b) })).sort((a, b) => a.times[0] - b.times[0]);
    const status = !hs.length ? 'PASS' : hs.some((h) => h.sev === 'FAIL') ? 'FAIL' : 'WARN';
    if (status === 'FAIL') failed.push(r.id);
    out.rules.push({ id: r.id, name: r.name, status, hits: hs });
  }
  out.gate = failed.length ? 'FAIL' : (info.seek === 'none' ? 'WARN' : 'PASS'); out.failed = failed;
  out.seek = info.seek;
  out.richness = richnessFromDom(richSamples, W, H, src, opt.type);
  if (opt.json) console.log(JSON.stringify(out, null, 1));
  else {
    console.log(`lint.mjs ${out.file}  ${W}x${H}  duration ${dur}s  ${times.length} samples (${times.slice(0, 8).join(', ')}${times.length > 8 ? ', ...' : ''})`);
    for (const r of out.rules) {
      console.log(`${r.id} ${r.name.padEnd(46, '.')} ${r.status}${r.hits.length ? '  (' + r.hits.length + ' distinct)' : ''}`);
      for (const h of r.hits.slice(0, 6)) {
        const ts = h.times.length > 6 ? h.times.slice(0, 6).join(',') + ',... (' + h.times.length + ' samples)' : h.times.join(',') + 's';
        console.log(`    ${h.sev === 'WARN' && r.status === 'FAIL' ? '[warn] ' : ''}t=${ts}  ${h.text ? JSON.stringify(h.text.slice(0, 70)) + '  ' : ''}${h.snippet}  bbox=[${h.bbox.join(',')}]${h.fs ? '  fs=' + h.fs + '%H' + (h.fsCss ? ' (drawn; css ' + h.fsCss + '%H)' : '') : ''}${h.note ? '\n      ' + h.note : ''}`);
      }
      if (r.hits.length > 6) console.log(`    ... ${r.hits.length - 6} more (use --json)`);
    }
    for (const e of out.exemptions) console.log('note: ' + e);
    console.log(`GATE G5: ${out.gate}${failed.length ? '  (' + failed.join(', ') + ')' : ''}   (a lead, not a verdict: text inside images/canvas is not seen)` +
      (out.gate === 'WARN' ? '\n  WARN: the page has no seek mechanism, so only one frame was read; expose window.renderAt(t) or window.__seek(t)' : `  seek: ${info.seek}, ${times.length} samples`));
    for (const line of out.richness.lines) console.log(line);
  }
  exitCode = out.gate === 'FAIL' || out.richness.status === 'FAIL' ? 1 : 0;
})().catch((e) => { console.error('error: ' + e.message); exitCode = 2; })
  .finally(async () => { try { await br?.close(); } catch {} process.exit(exitCode); });
