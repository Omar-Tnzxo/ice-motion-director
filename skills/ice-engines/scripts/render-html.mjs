#!/usr/bin/env node
// Adapted from Vincentwei1021/mg-styles-15 harness/render.mjs (MIT), with capture hygiene from
// howseen-ai/claude-motion-design scripts/render_template.py (MIT).
// Changes: ported from puppeteer-core to playwright-core; accepts window.renderAt(t) or window.seek(t) and
// window.__ready or window.ready; waits two animation frames after every seek; freezes CSS transitions;
// subframes never straddle a hard cut (--cuts); alpha output (ProRes 4444 MOV or VP9 WebM); page errors are
// fatal; odd output sizes refused; portable Chrome path and lock folder; removed reel time-warp and link
// tracking; removed author machine paths; playwright-core resolved from the current film project (it was resolved
// from the script folder, which fails when the plugin is installed elsewhere); --help; a built-in Chrome DevTools
// driver (zero install) runs when playwright-core is missing; local Chrome, Chromium or Edge found automatically;
// software compositing by default (deterministic; --gpu opts in); the served folder defaults to the project folder
// that holds ice/; a page that never becomes ready because of missing or refused files, a page error or a hung
// renderAt fails within seconds with a plain message instead of waiting out the timeout.
// No em or en dash characters.
//
// MIT License. Copyright (c) 2026 Vincentwei1021. Copyright (c) 2026 Howseen AI (Raphael Aubry).
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
// documentation files (the "Software"), to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
// to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions
// of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
// THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
// CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.
//
// Deterministic HTML page -> video renderer (engine: HTML canvas with Playwright and FFmpeg).
//
// Requirements: Node.js 22+ and FFmpeg 7+ on PATH, plus a browser:
//   Zero install: an installed Chrome, Chromium or Edge. It is found in the usual install folders, or set ICE_CHROME
//   to its executable. Without playwright-core the built-in Chrome DevTools driver captures the frames.
//   Optional: `npm install --save-exact playwright-core@1.58.2` in the film project (the user agrees first) makes
//   Playwright the driver; ICE_DRIVER=cdp forces the built-in driver. The first log lines name the served folder, driver, browser and compositing mode.
//
// Page contract (see references/html-canvas-capture.md):
//   window.DEMO = { width, height, fps, duration }   optional defaults for the CLI flags below
//   window.renderAt = async (t) => { ... }           or window.seek = async (t) => { ... }; draws time t (seconds)
//   window.__ready = true (or window.ready = true)   set after fonts, images and data are loaded
//   CSS animations and Web Animations are also paused and seeked to t.
//
// Usage (run from the film project, so `playwright-core` resolves when it is installed there):
//   node render-html.mjs film/index.html                       full render -> film/out/video.mp4
//   node render-html.mjs film/index.html --stills 0.5,2,4.25    PNG stills -> film/out/stills/
//   node render-html.mjs film/index.html --scale 0.5 --fps 30 --crf 23 --out film/out/draft.mp4   review draft
//   options: --root DIR (served folder; default: the nearest folder at most 4 levels above the page that holds an
//            ice/ folder, which is the film project, else the page folder. Pages in film/ that load ../assets need
//            the project folder served: the default finds it when the project has ice/, otherwise pass
//            --root <project folder>. A file the page asks for outside the served folder stops the render within
//            seconds with its path and the --root fix)
//            --out PATH (.mp4, .mov or .webm)
//            --w --h --fps --duration --from S --to S --scale K --crf N --workers N
//            --mb N (subframes per frame for motion blur) --shutter 0.5 (fraction of the frame interval)
//            --cuts 3.2,7.5 (hard-cut times in seconds; subframes stay on the frame-centre side)
//            --alpha (transparent page background; needs --out ending in .mov or .webm)
//            --audio PATH (mixed master audio to mux) --noaudio --mkv PATH (lossless FFV1 picture only)
//            --allow-page-errors (log page errors instead of failing)
//            --allow-missing (keep waiting when the page asks for a missing file; only for pages that handle it)
//            --gpu (GPU compositing: faster on some machines, but a frame's pixels can depend on the frames rendered
//            before it; never for stills, finals or frame comparisons. Default: software compositing, deterministic)
// Environment: ICE_CHROME (browser path), ICE_DRIVER=cdp (built-in driver), ICE_GPU=1 (same as --gpu),
//              ICE_GPU_ARGS (space separated extra Chromium flags, added last), ICE_WEBGL_SOFTWARE=1 (SwiftShader
//              flags for headless WebGL), ICE_RENDER_SLOTS (default 1), ICE_READY_TIMEOUT (seconds, default 300),
//              ICE_SEEK_TIMEOUT (seconds one renderAt call may take, default 120).

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  const src = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split(/\r?\n/);
  const start = src.findIndex((l) => l.startsWith('// Deterministic HTML page'));
  const end = src.findIndex((l, i) => i > start && !l.startsWith('//'));
  console.log(src.slice(start, end).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(0);
}

// Browser driver. playwright-core is resolved from the film project (the current folder), not from this skill
// folder. Without it (or with ICE_DRIVER=cdp) the built-in Chrome DevTools driver below runs instead: zero install,
// only Node 22+ (global WebSocket), FFmpeg and a local Chrome, Chromium or Edge.
const CHROME_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  '/snap/bin/chromium', '/usr/bin/microsoft-edge',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe'),
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];
function findChrome() {
  for (const v of [process.env.ICE_CHROME, process.env.CHROME_PATH]) if (v && fs.existsSync(v)) return v;
  return CHROME_CANDIDATES.find((p) => p && fs.existsSync(p)) || null;
}

let chromium = null;
let DRIVER = 'playwright-core';
if (process.env.ICE_DRIVER !== 'cdp') {
  try {
    ({ chromium } = createRequire(path.join(process.cwd(), 'package.json'))('playwright-core'));
  } catch {
    try { ({ chromium } = await import('playwright-core')); } catch { chromium = null; }
  }
}
if (!chromium) {
  if (typeof WebSocket !== 'function') {
    console.error('render-html: the built-in driver needs Node 22 or newer (global WebSocket); this is Node ' + process.version);
    process.exit(2);
  }
  DRIVER = 'built-in Chrome DevTools driver';
  chromium = { launch: cdpLaunch };
}

// ---- Built-in Chrome DevTools Protocol driver: the subset of the playwright-core API this script uses.
async function cdpLaunch({ executablePath, args = [] }) {
  const exe = executablePath || findChrome();
  if (!exe) throw new Error('no Chrome, Chromium or Edge found; set ICE_CHROME to its executable');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ice-chrome-'));
  const proc = spawn(exe, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${dir}`, '--no-first-run',
    '--no-default-browser-check', '--disable-extensions', '--disable-sync', '--disable-dev-shm-usage',
    '--disable-features=Translate,MediaRouter,OptimizationHints', ...args, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
  let errTail = '';
  const wsUrl = await new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('Chrome did not report a DevTools URL in 30 s\n' + errTail.slice(-600))), 30000);
    proc.stderr.on('data', (d) => {
      errTail += d;
      const m = /DevTools listening on (ws:\/\/\S+)/.exec(errTail);
      if (m) { clearTimeout(t); res(m[1]); }
    });
    proc.on('error', (e) => { clearTimeout(t); rej(e); });
    proc.on('exit', (c) => { clearTimeout(t); rej(new Error(`Chrome exited early (code ${c})\n${errTail.slice(-600)}`)); });
  });
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('cannot connect to ' + wsUrl)); });
  let id = 0;
  const pending = new Map();
  const handlers = new Set();
  ws.onmessage = (e) => {
    const m = JSON.parse(typeof e.data === 'string' ? e.data : Buffer.from(e.data).toString());
    if (m.id !== undefined) {
      const p = pending.get(m.id);
      if (!p) return;
      pending.delete(m.id);
      if (m.error) p.rej(new Error(`${p.method}: ${m.error.message}`)); else p.res(m.result || {});
    } else for (const h of handlers) if (h.method === m.method && h.sid === m.sessionId) h.fn(m.params || {});
  };
  ws.onclose = () => { for (const p of pending.values()) p.rej(new Error(`${p.method}: browser connection closed`)); pending.clear(); };
  const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
    const n = ++id;
    pending.set(n, { res, rej, method });
    ws.send(JSON.stringify({ id: n, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
  const on = (method, sid, fn) => { const h = { method, sid, fn }; handlers.add(h); return () => handlers.delete(h); };
  const kill = () => { try { proc.kill(); } catch {} };
  process.on('exit', kill);
  const { product } = await send('Browser.getVersion');

  return {
    version: () => product,
    async newContext({ viewport, deviceScaleFactor = 1 }) {
      const { browserContextId } = await send('Target.createBrowserContext');
      const ctx = {
        async newPage() {
          const { targetId } = await send('Target.createTarget', { url: 'about:blank', browserContextId });
          const { sessionId: sid } = await send('Target.attachToTarget', { targetId, flatten: true });
          const s = (m, p) => send(m, p, sid);
          const urls = new Map();
          const listeners = { console: [], pageerror: [], requestfailed: [] };
          on('Runtime.consoleAPICalled', sid, (p) => {
            const text = (p.args || []).map((a) => (a.value !== undefined ? String(a.value) : a.description || '')).join(' ');
            for (const f of listeners.console) f({ type: () => p.type, text: () => text });
          });
          on('Runtime.exceptionThrown', sid, (p) => {
            const d = p.exceptionDetails || {};
            for (const f of listeners.pageerror) f({ message: (d.exception && d.exception.description) || d.text || 'page exception' });
          });
          on('Network.requestWillBeSent', sid, (p) => urls.set(p.requestId, p.request.url));
          on('Network.loadingFailed', sid, (p) => {
            if (p.canceled) return;
            for (const f of listeners.requestfailed) f({ url: () => urls.get(p.requestId) || '', failure: () => ({ errorText: p.errorText }) });
          });
          await s('Page.enable'); await s('Runtime.enable'); await s('Network.enable');
          await s('Emulation.setDeviceMetricsOverride', { width: viewport.width, height: viewport.height, deviceScaleFactor, mobile: false });
          const evaluate = async (fn, arg) => {
            const expression = typeof fn === 'function' ? `(${fn.toString()})(${arg === undefined ? '' : JSON.stringify(arg)})` : String(fn);
            const r = await s('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
            if (r.exceptionDetails) {
              const d = r.exceptionDetails;
              throw new Error('page evaluate: ' + ((d.exception && d.exception.description) || d.text || 'exception').split('\n')[0]);
            }
            return r.result ? r.result.value : undefined;
          };
          const page = {
            on: (ev, f) => { if (listeners[ev]) listeners[ev].push(f); },
            context: () => ctx,
            evaluate,
            async goto(url, { timeout = 30000 } = {}) {
              let off;
              const loaded = new Promise((res, rej) => {
                const t = setTimeout(() => { off(); rej(new Error(`page load timeout after ${timeout} ms: ${url}`)); }, timeout);
                off = on('Page.loadEventFired', sid, () => { clearTimeout(t); off(); res(); });
              });
              const r = await s('Page.navigate', { url });
              if (r.errorText) { off(); throw new Error(`navigation failed: ${r.errorText} (${url})`); }
              await loaded;
            },
            async waitForFunction(fn, arg, { timeout = 30000, polling = 100 } = {}) {
              const end = Date.now() + timeout;
              while (!(await evaluate(fn, arg === null ? undefined : arg))) {
                if (Date.now() > end) throw new Error(`waitForFunction timeout after ${timeout} ms`);
                await new Promise((r) => setTimeout(r, polling));
              }
            },
            addStyleTag: ({ content }) => evaluate((c) => {
              const el = document.createElement('style');
              el.textContent = c;
              document.head.appendChild(el);
              return true;
            }, content),
            async screenshot({ clip, omitBackground = false }) {
              if (omitBackground) await s('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
              const r = await s('Page.captureScreenshot', { format: 'png', clip: { ...clip, scale: 1 }, captureBeyondViewport: false, fromSurface: true });
              if (omitBackground) await s('Emulation.setDefaultBackgroundColorOverride', {});
              return Buffer.from(r.data, 'base64');
            },
          };
          return page;
        },
        close: () => send('Target.disposeBrowserContext', { browserContextId }).catch(() => {}),
      };
      return ctx;
    },
    async close() {
      try { await Promise.race([send('Browser.close'), new Promise((r) => setTimeout(r, 3000))]); } catch {}
      try { ws.close(); } catch {}
      kill();
      await new Promise((r) => { if (proc.exitCode !== null) r(); else { proc.once('exit', r); setTimeout(r, 3000); } });
      try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
    },
  };
}

// Switches never take a value, so a page path after one is still read as the page.
const SWITCHES = new Set(['alpha', 'noaudio', 'allow-page-errors', 'allow-missing', 'gpu']);
function parseArgs(argv) {
  const a = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k.startsWith('--')) {
      const key = k.slice(2);
      const next = argv[i + 1];
      if (SWITCHES.has(key) || next === undefined || next.startsWith('--')) a[key] = true;
      else { a[key] = next; i++; }
    } else a._.push(k);
  }
  return a;
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.wasm': 'application/wasm', '.glsl': 'text/plain', '.frag': 'text/plain', '.vert': 'text/plain',
  '.hdr': 'application/octet-stream', '.exr': 'application/octet-stream', '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json', '.bin': 'application/octet-stream', '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.ktx2': 'application/octet-stream',
};

// The served folder. Explicit --root wins and is served alone. Without it: the nearest folder at most 4 levels
// above the page that holds an ice/ folder (the film project; never the file system root or the home folder), with
// the page folder as a second lookup so absolute paths written against the old default still resolve. No ice/ found:
// the page folder alone (the old default). Access never goes beyond the chosen project.
function chooseRoot(pageFile, explicit) {
  const pageDir = path.dirname(pageFile);
  if (explicit) return { root: path.resolve(explicit), fallback: null, why: 'from --root' };
  const stop = new Set([path.parse(pageDir).root, os.homedir()].map((d) => path.resolve(d)));
  let dir = pageDir;
  for (let i = 0; i <= 4; i++) {
    if (stop.has(path.resolve(dir))) break;
    try { if (fs.statSync(path.join(dir, 'ice')).isDirectory()) return { root: dir, fallback: dir === pageDir ? null : pageDir, why: 'the project folder: it holds ice/' }; } catch {}
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return { root: pageDir, fallback: null, why: 'the page folder: no project folder with ice/ above it' };
}

const inside = (base, p) => { const r = path.relative(base, p); return r === '' || (!r.startsWith('..') && !path.isAbsolute(r)); };

// Every refused request (404 or 403) is recorded so a page that never becomes ready can be explained in seconds.
const served = { refused: [], lastActivity: Date.now(), roots: [] };
const IGNORED_MISSING = new Set(['/favicon.ico']);

// Where a refused URL path exists on disk, searched in the folders above the served folder: tells the user which
// folder to pass as --root. Browsers clamp "../" at the server root, so "../x" from the page arrives as "/x".
function locateOutside(urlPath) {
  const found = [];
  let dir = path.dirname(served.roots[0]);
  for (let i = 0; i < 4; i++) {
    const p = path.join(dir, urlPath);
    if (fs.existsSync(p)) { found.push({ file: p, folder: dir }); break; }
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return found[0] || null;
}

function explainRefused(r) {
  if (r.status === 403) return `${r.path}: refused, the path leaves the served folder ${served.roots[0]}`;
  const out = locateOutside(r.path);
  if (out) return `${r.path}: not inside the served folder ${served.roots[0]}; the file exists at ${out.file}`;
  return `${r.path}: no such file in the served folder ${served.roots[0]}`;
}

function refusedReport(list) {
  const uniq = [...new Map(list.map((r) => [r.path, r])).values()];
  const lines = uniq.slice(0, 8).map((r) => '  ' + explainRefused(r));
  if (uniq.length > 8) lines.push(`  ... and ${uniq.length - 8} more`);
  const outside = uniq.map((r) => r.status === 404 && locateOutside(r.path)).filter(Boolean);
  const fix = outside.length
    ? `Fix: serve a folder that holds both the page and these files: --root "${outside[0].folder}" (the film project folder; `
      + 'project-root paths are the rule in the ice-assets skill, references/project-folders.md). Never serve a folder above the project.'
    : 'Fix: put the file at that path inside the project, or correct the path in the page.';
  return lines.join('\n') + '\n' + fix + '\nOnly when the page handles a missing file on purpose and is still loading: pass --allow-missing.';
}

function startServer(root, fallback) {
  served.roots = [root, ...(fallback ? [fallback] : [])];
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      served.lastActivity = Date.now();
      res.on('close', () => { served.lastActivity = Date.now(); });
      let urlPath = '/';
      const refuse = (status) => {
        if (!IGNORED_MISSING.has(urlPath)) {
          served.refused.push({ path: urlPath, status, at: Date.now() });
          console.log(`[missing file] ${explainRefused({ path: urlPath, status })}`);
        }
        res.writeHead(status);
        res.end(status + ' ' + urlPath);
      };
      try {
        const u = new URL(req.url, 'http://x');
        urlPath = decodeURIComponent(u.pathname);
        let p = null;
        for (const base of served.roots) {
          let c = path.join(base, urlPath);
          if (!inside(base, c)) return refuse(403);
          if (fs.existsSync(c) && fs.statSync(c).isDirectory()) c = path.join(c, 'index.html');
          if (fs.existsSync(c)) { p = c; break; }
        }
        if (!p) return refuse(404);
        res.writeHead(200, {
          'Content-Type': MIME[path.extname(p).toLowerCase()] || 'application/octet-stream',
          'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*',
        });
        fs.createReadStream(p).pipe(res);
      } catch (e) { res.writeHead(500); res.end(String(e)); }
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

const pageErrors = [];
const READY_TIMEOUT = Math.max(1, +(process.env.ICE_READY_TIMEOUT || 300)) * 1000;
const SEEK_TIMEOUT = Math.max(1, +(process.env.ICE_SEEK_TIMEOUT || 120)) * 1000;
const STUCK_GRACE = 5000; // a refused file or a page error, then this long with no request activity and no ready flag
let OPTS = {};

function withTimeout(promise, ms, message) {
  let t;
  return Promise.race([promise, new Promise((_, rej) => { t = setTimeout(() => rej(new Error(message)), ms); })]).finally(() => clearTimeout(t));
}

// Waits for window.__ready (or window.ready). Fails within seconds, with the reason, when the page asked for a
// missing or refused file or threw an error and then went quiet; prints a line every 15 s while it waits.
async function waitReady(page, since, errs) {
  const start = Date.now();
  let nextNote = start + 15000;
  for (;;) {
    let ready = false;
    try { ready = await withTimeout(page.evaluate(() => window.__ready === true || window.ready === true), 30000, 'ready check timeout'); } catch {}
    if (ready) return;
    const now = Date.now();
    const quiet = now - served.lastActivity > STUCK_GRACE;
    const refused = served.refused.filter((r) => r.at >= since);
    if (refused.length && quiet && !OPTS['allow-missing']) {
      throw new Error('render-html: the page never became ready (window.__ready was not set) after it asked for files the server '
        + 'could not give it:\n' + refusedReport(refused));
    }
    if (errs.length && now - errs[errs.length - 1].at > STUCK_GRACE && quiet && !OPTS['allow-page-errors']) {
      throw new Error('render-html: the page threw an error before it became ready, so window.__ready was never set:\n  '
        + errs.slice(0, 3).map((e) => e.message.split('\n')[0]).join('\n  ') + '\nFix the error in the page (or pass --allow-page-errors to keep waiting).');
    }
    if (now - start > READY_TIMEOUT) {
      throw new Error(`render-html: the page did not set window.__ready (or window.ready) within ${READY_TIMEOUT / 1000} s, with no `
        + 'missing file and no page error. Check that the page sets the flag after its fonts, images and data load '
        + '(page contract: the ice-engines skill, references/html-canvas-capture.md section 2). A page that needs longer: ICE_READY_TIMEOUT=<seconds>.');
    }
    if (now > nextNote) {
      console.log(`render-html: still waiting for the page to set window.__ready (${Math.round((now - start) / 1000)} s of ${READY_TIMEOUT / 1000} s)`);
      nextNote = now + 15000;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
}

function watchPage(page, logPrefix, errs) {
  page.on('console', (m) => {
    const t = m.type();
    if (t === 'error' || t === 'warning' || process.env.VERBOSE) console.log(`${logPrefix}[console ${t}] ${m.text()}`);
  });
  page.on('pageerror', (e) => { errs.push({ message: e.message, at: Date.now() }); console.log(`${logPrefix}[page error] ${e.message}`); });
  page.on('requestfailed', (r) => console.log(`${logPrefix}[request failed] ${r.url()} ${r.failure()?.errorText || ''}`));
}

async function openPage(browser, url, w, h, scale, alpha, logPrefix) {
  const context = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
  const page = await context.newPage();
  const errs = [];
  watchPage(page, logPrefix, errs);
  page.on('pageerror', (e) => pageErrors.push(e.message));
  const since = Date.now();
  await page.goto(url, { waitUntil: 'load', timeout: 180000 });
  await waitReady(page, since, errs);
  await withTimeout(page.evaluate(() => (document.fonts ? document.fonts.ready.then(() => true) : true)), 60000,
    'render-html: document.fonts.ready did not settle within 60 s; check the @font-face sources the page loads');
  // Freeze anything that would run on the wall clock.
  await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;caret-color:transparent!important}' });
  if (alpha) await page.addStyleTag({ content: 'html,body{background:transparent!important}' });
  return page;
}

async function seek(page, t) {
  await withTimeout(page.evaluate(async (t) => {
    for (const a of document.getAnimations()) { try { a.pause(); a.currentTime = t * 1000; } catch {} }
    if (typeof window.renderAt === 'function') await window.renderAt(t);
    else if (typeof window.seek === 'function') await window.seek(t);
    // Two animation frames: let layout and paint of the seeked state land before the capture.
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  }, t), SEEK_TIMEOUT, `render-html: drawing time ${t} s did not finish within ${SEEK_TIMEOUT / 1000} s (window.renderAt or window.seek `
    + 'never resolved, or the page stopped painting). Check for a promise that never settles in renderAt; a page that '
    + 'needs longer per frame: ICE_SEEK_TIMEOUT=<seconds>.');
}

function shot(page, w, h, alpha) {
  return page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: w, height: h }, omitBackground: !!alpha });
}

function ffmpeg(args) {
  const p = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => {
    p.on('error', (e) => rej(new Error('cannot start ffmpeg (is it on PATH?): ' + e.message)));
    p.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg exit ' + c))));
  });
  return { p, done };
}

function writeAsync(stream, buf) {
  return new Promise((res, rej) => {
    if (stream.write(buf)) return res();
    const onErr = (e) => { stream.off('drain', onDrain); rej(e); };
    const onDrain = () => { stream.off('error', onErr); res(); };
    stream.once('drain', onDrain);
    stream.once('error', onErr);
  });
}

// Machine-wide cap on concurrent full renders (bounds RAM; parallel heavy renders starve each other).
const SLOTS = Math.max(1, +(process.env.ICE_RENDER_SLOTS || 1));
const LOCKDIR = path.join(os.tmpdir(), 'ice-render-slots');
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } };
async function acquireSlot() {
  fs.mkdirSync(LOCKDIR, { recursive: true });
  for (let waited = 0; ; waited += 2) {
    for (let i = 0; i < SLOTS; i++) {
      const d = path.join(LOCKDIR, 'slot' + i);
      try { fs.mkdirSync(d); fs.writeFileSync(path.join(d, 'pid'), String(process.pid)); return d; } catch {}
      try {
        const pidFile = path.join(d, 'pid');
        const stale = fs.existsSync(pidFile) ? !alive(+fs.readFileSync(pidFile, 'utf8')) : Date.now() - fs.statSync(d).mtimeMs > 30000;
        if (stale) fs.rmSync(d, { recursive: true, force: true });
      } catch {}
    }
    if (waited % 30 === 0) {
      let holders = '';
      try { holders = fs.readdirSync(LOCKDIR).map((s) => { try { return fs.readFileSync(path.join(LOCKDIR, s, 'pid'), 'utf8').trim(); } catch { return '?'; } }).join(', '); } catch {}
      console.log(`waiting for a render slot (${SLOTS} full render(s) machine-wide; held by process ${holders || '?'}; `
        + `ICE_RENDER_SLOTS raises the cap, stills never wait)...`);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
}

function subframeTime(f, s, MB, SHUTTER, FPS, CUTS, DUR) {
  let t = MB > 1 ? (f + SHUTTER * ((s + 0.5) / MB - 0.5)) / FPS : f / FPS;
  const centre = f / FPS;
  for (const c of CUTS) { // keep every subframe on the same side of a hard cut as the frame centre
    if ((t < c) !== (centre < c)) t = centre >= c ? c : c - 1e-4;
  }
  return Math.min(Math.max(0, t), DUR - 1e-3);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  OPTS = args;
  const target = path.resolve(args._[0] || 'index.html');
  const pageFile = fs.existsSync(target) && fs.statSync(target).isDirectory() ? path.join(target, 'index.html') : target;
  if (!fs.existsSync(pageFile)) { console.error('render-html: page not found: ' + pageFile); process.exit(2); }
  if (args.root === true) { console.error('render-html: --root needs a folder'); process.exit(2); }
  const { root, fallback, why } = chooseRoot(pageFile, args.root);
  const rel = path.relative(root, pageFile).split(path.sep).join('/');
  if (!inside(root, pageFile)) { console.error('render-html: the page must sit inside --root'); process.exit(2); }
  console.log(`render-html: serving ${root} (${why})`);

  if (!args.stills) {
    const slot = await acquireSlot();
    const freeSlot = () => { try { fs.rmSync(slot, { recursive: true, force: true }); } catch {} };
    process.on('exit', freeSlot);
    for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(sig, () => { freeSlot(); process.exit(1); });
  }

  const srv = await startServer(root, fallback);
  const url = `http://127.0.0.1:${srv.address().port}/${rel}`;
  const gpuArgs = process.env.ICE_GPU_ARGS ? process.env.ICE_GPU_ARGS.split(' ').filter(Boolean) : [];
  const swArgs = process.env.ICE_WEBGL_SOFTWARE ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : [];
  // Software compositing by default: with GPU compositing Chrome keeps promoted layers between seeks, so a frame's
  // pixels can depend on the frames drawn before it. It leaves WebGL on the GPU (--disable-gpu would move WebGL to a
  // software adapter). See references/determinism.md section 6.
  const GPU = !!args.gpu || process.env.ICE_GPU === '1';
  const compositing = GPU ? [] : ['--disable-gpu-compositing'];
  const exe = findChrome();
  console.log(`render-html: driver ${DRIVER}, browser ${exe || "Playwright's own Chromium"}`);
  console.log(GPU
    ? 'render-html: GPU compositing (opt-in): frames can depend on render history; never use it for stills, finals or frame comparisons'
    : 'render-html: software compositing (deterministic default; --gpu opts in to GPU compositing)');
  const launch = () => chromium.launch({
    executablePath: exe || undefined,
    headless: true,
    args: [...compositing, ...swArgs, ...gpuArgs, '--font-render-hinting=none', '--disable-lcd-text', '--force-color-profile=srgb',
      '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows',
      '--autoplay-policy=no-user-gesture-required', '--hide-scrollbars', '--mute-audio'],
  }).catch((e) => {
    console.error('render-html: cannot launch a browser. Set ICE_CHROME to an installed Chrome, Chromium or Edge executable '
      + '(the fallback ladder: the ice-engines skill, references/engine-choice.md section 7).');
    throw e;
  });

  const browser = await launch();
  console.log(`render-html: browser version ${browser.version()} (log it with the film; pixels can drift across versions)`);
  const extra = [];
  try {
    const probeCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const probe = await probeCtx.newPage();
    const probeErrs = [];
    watchPage(probe, '', probeErrs);
    const since = Date.now();
    await probe.goto(url, { waitUntil: 'load', timeout: 180000 });
    await waitReady(probe, since, probeErrs);
    const cfg = await probe.evaluate(() => window.DEMO || {});
    await probeCtx.close();

    const W = +(args.w || cfg.width || 1920), H = +(args.h || cfg.height || 1080);
    const FPS = +(args.fps || cfg.fps || 30), DUR = +(args.duration || cfg.duration || 10);
    const MB = Math.max(1, +(args.mb || 1));
    const SHUTTER = +(args.shutter ?? 0.5);
    const SCALE = +(args.scale || 1);
    const CUTS = args.cuts ? String(args.cuts).split(',').map(Number) : [];
    const ALPHA = !!args.alpha;
    const outDir = path.join(path.dirname(pageFile), 'out');
    fs.mkdirSync(outDir, { recursive: true });

    if (args.stills) {
      const page = await openPage(browser, url, W, H, SCALE, ALPHA, '');
      const sd = path.join(outDir, 'stills');
      fs.mkdirSync(sd, { recursive: true });
      for (const t of String(args.stills).split(',').map(Number)) {
        await seek(page, t);
        const f = path.join(sd, `t${t.toFixed(2).padStart(6, '0')}.png`);
        fs.writeFileSync(f, await shot(page, W, H, ALPHA));
        console.log(f);
      }
      if (pageErrors.length && !args['allow-page-errors']) throw new Error(`${pageErrors.length} page error(s); fix them or pass --allow-page-errors`);
      return;
    }

    const OW = Math.round(W * SCALE), OH = Math.round(H * SCALE);
    if (OW % 2 || OH % 2) throw new Error(`output size ${OW}x${OH} has an odd side; H.264 and most encoders need even width and height`);
    const out = path.resolve(args.out || path.join(outDir, ALPHA ? 'video.mov' : 'video.mp4'));
    const ext = path.extname(out).toLowerCase();
    if (ALPHA && ext !== '.mov' && ext !== '.webm') throw new Error('--alpha needs --out ending in .mov (ProRes 4444) or .webm (VP9 alpha)');

    const totalFrames = Math.round(DUR * FPS);
    const f0 = Math.round(+(args.from || 0) * FPS), f1 = Math.min(totalFrames, Math.round(+(args.to || DUR) * FPS));
    const WORKERS = Math.max(1, Math.min(+(args.workers || 1), f1 - f0));
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ice-render-'));
    const t0 = performance.now();
    console.log(`render ${rel}: ${OW}x${OH} @${FPS}fps frames ${f0}-${f1} mb=${MB} shutter=${SHUTTER} cuts=${CUTS.length} workers=${WORKERS}${ALPHA ? ' alpha' : ''}`);

    const chunk = Math.ceil((f1 - f0) / WORKERS);
    let doneFrames = 0;
    const segs = [];
    await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
      const a = f0 + w * chunk, b = Math.min(f1, a + chunk);
      if (a >= b) return;
      const seg = path.join(tmp, `seg${String(w).padStart(2, '0')}.mkv`);
      segs[w] = seg;
      // One browser per worker: pages inside one browser share a compositor and do not parallelize.
      const br = w === 0 ? browser : await launch();
      if (w) extra.push(br);
      const page = await openPage(br, url, W, H, SCALE, ALPHA, `[w${w}] `);
      const vf = MB > 1 ? `tmix=frames=${MB},select='eq(mod(n\\,${MB})\\,${MB - 1})',setpts=N/(${FPS}*TB)` : 'null';
      const ff = ffmpeg(['-f', 'image2pipe', '-framerate', String(FPS * MB), '-c:v', 'png', '-i', '-',
        '-vf', vf, '-r', String(FPS), '-c:v', 'ffv1', '-level', '3', '-threads', '2', '-pix_fmt', ALPHA ? 'bgra' : 'bgr0', seg]);
      for (let f = a; f < b; f++) {
        for (let s = 0; s < MB; s++) {
          await seek(page, subframeTime(f, s, MB, SHUTTER, FPS, CUTS, DUR));
          const png = await shot(page, W, H, ALPHA);
          // FFmpeg that exits early breaks the pipe: report its exit, not the bare pipe error.
          try { await writeAsync(ff.p.stdin, png); } catch (e) { await ff.done; throw e; }
        }
        doneFrames++;
        if (doneFrames % 30 === 0) {
          const el = (performance.now() - t0) / 1000;
          console.log(`  ${doneFrames}/${f1 - f0} frames  ${el.toFixed(1)}s  (${(el / doneFrames).toFixed(2)}s/frame)`);
        }
      }
      ff.p.stdin.end();
      await ff.done;
      await page.context().close();
    }));

    if (pageErrors.length && !args['allow-page-errors']) throw new Error(`${pageErrors.length} page error(s) during capture; no output written`);

    const list = path.join(tmp, 'list.txt');
    fs.writeFileSync(list, segs.filter(Boolean).map((s) => `file '${s.split(path.sep).join('/')}'`).join('\n'));
    if (args.mkv) {
      await ffmpeg(['-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', path.resolve(args.mkv)]).done;
      fs.rmSync(tmp, { recursive: true, force: true });
      console.log(`done -> ${path.resolve(args.mkv)} (lossless, ${((performance.now() - t0) / 1000).toFixed(1)}s)`);
      return;
    }
    const audio = args.audio ? path.resolve(args.audio) : null;
    const withAudio = audio && !args.noaudio;
    const enc = ['-f', 'concat', '-safe', '0', '-i', list];
    if (withAudio) enc.push('-i', audio);
    enc.push('-map', '0:v:0');
    // apad + -shortest: the picture defines the length; audio is padded with silence, never the reverse.
    if (withAudio) {
      const acodec = ext === '.mov' ? ['-c:a', 'pcm_s16le'] : ext === '.webm' ? ['-c:a', 'libopus', '-b:a', '192k'] : ['-c:a', 'aac', '-b:a', '320k'];
      enc.push('-map', '1:a:0', '-af', 'apad', ...acodec, '-ar', '48000', '-shortest');
    }
    if (ALPHA && ext === '.mov') {
      enc.push('-c:v', 'prores_ks', '-profile:v', '4', '-pix_fmt', 'yuva444p10le', '-vendor', 'apl0', '-r', String(FPS), out);
    } else if (ALPHA) {
      enc.push('-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-auto-alt-ref', '0', '-b:v', '0', '-crf', String(args.crf || 30), '-r', String(FPS), out);
    } else {
      enc.push('-vf', 'scale=out_color_matrix=bt709:out_range=tv:flags=lanczos+accurate_rnd+full_chroma_int,format=yuv420p',
        '-c:v', 'libx264', '-preset', 'slow', '-crf', String(args.crf || 16), '-profile:v', 'high',
        '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
        '-r', String(FPS), '-movflags', '+faststart', out);
    }
    await ffmpeg(enc).done;
    fs.rmSync(tmp, { recursive: true, force: true });
    console.log(`done -> ${out}  (${((performance.now() - t0) / 1000).toFixed(1)}s${withAudio ? ', with audio' : ', no audio'})`);
  } finally {
    for (const b of extra) await b.close().catch(() => {});
    await browser.close();
    srv.close();
  }
}

main().catch((e) => { console.error(e.message || e); process.exit(1); });
