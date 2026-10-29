// Adapted from Tejashmakwana/motionmaxxing (Apache-2.0). Changes: findChrome also looks for Chrome and Edge on
// Windows, plus the Snap Chromium, google-chrome-stable and Edge paths on Linux and macOS; header names the script
// that uses it here (lint.mjs). Needs Node 22+ (global WebSocket). 2026-10-29 (0.2.5, craft plan): exports the
// craft plan reader shared by lint.mjs, art-check.mjs and seam-gate.mjs (CRAFT_CODES, findCraftPlan, loadCraftPlan,
// exemptionFor, exemptLine, neverLifted, isFloor), the Node twin of the reader in storyboard_lint.py with the same behaviour.
// 2026-10-29 (0.2.5 review): the source kinds each rule id accepts (allowedKinds, the table of treatment.md 11.7), a
// content row written at stage 07 ignored, every ignored row or lift warned about (exemptionIssues); "shots" may be "all".
// See NOTICE.md.
// _cdp.mjs - shared zero-dependency Chrome DevTools Protocol helper (used by lint.mjs).
// Not a CLI. Exports: findChrome, launchChrome, CDP, parseArgs, die, helpFrom, and the craft plan reader.
//
//   const br = await launchChrome({ args: [...extra flags] });
//   const page = await br.newPage({ width: 1920, height: 1080, scale: 1 });
//   await page.goto(url);  await page.eval('document.title');  await page.shot({format:'png'});
//   await br.close();
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function die(msg, code = 1) { console.error(`error: ${msg}`); process.exit(code); }

// Leading '//' comment block of a script, used as --help text.
export function helpFrom(metaUrl) {
  const out = [];
  for (const l of fs.readFileSync(new URL(metaUrl), 'utf8').split('\n')) {
    if (l.startsWith('#!')) continue;
    if (l.startsWith('//')) out.push(l.replace(/^\/\/ ?/, '')); else break;
  }
  return out.join('\n');
}

// ---------------------------------------------------------------- craft plan and exemption rows (0.2.5)
// The craft plan, the precedence order and the exemption rows are defined once: the ice-direction skill,
// references/treatment.md section "Craft plan". Same behaviour as find_craft_plan, load_craft_plan, exemption_for and
// exempt_line in storyboard_lint.py (a test checks that both readers agree).
export const CRAFT_CODES = Object.freeze(['camera', 'depth', 'composite', 'light', 'finish', 'type', 'transition', 'data', 'cutout',
  'sfx', 'music', 'ambience', 'foley', 'silence', 'voice', 'rhythm', 'footage', 'identity']);
// A row whose lifts name a never-lifted class (truth and claims, rights, privacy, safety and the real-people limits,
// accessibility, Arabic shaping and bidi, legibility floors, required labels, L5) is ignored with a warning.
const NEVER_WORDS = new Set(['truth', 'claim', 'claims', 'rights', 'license', 'licence', 'licensing', 'privacy', 'safety',
  'likeness', 'accessibility', 'a11y', 'contrast', 'wcag', 'photosensitive', 'photosensitivity', 'strobe', 'arabic', 'shaping',
  'bidi', 'legibility', 'legible', 'l5']);
const NEVER_PAIRS = new Set(['flash safe', 'safe mode', 'required label', 'required labels', 'real people', 'speaker lit']);
const NEVER_IDS = new Set(['story:9', 'story:18', 'story:20', 'frame:p1']);
const SOURCE_KINDS = new Set(['user', 'reference', 'style', 'content']);   // a row without a source of these kinds is ignored
// Source kinds allowed per rule id (the table of treatment.md 11.7), the same map as RULE_KINDS in storyboard_lint.py.
// Lookup: the exact id, else the longest pattern ending in "*" whose prefix matches, else "*". A row written at stage 07
// may come only from user, reference or style.
const KINDS_NO_CONTENT = Object.freeze(['user', 'reference', 'style']);
const KINDS_ALL = Object.freeze(['user', 'reference', 'style', 'content']);
const RULE_KINDS = Object.freeze({
  ...Object.fromEntries(['film:hero_share', 'film:frame_fill', 'film:empty_half', 'film:depth_layers', 'film:in_shot_motion',
    'film:longest_still', 'film:element_events_per_min', 'film:longest_bare_talk_s', 'film:fast_ratio', 'film:blank_run_s',
    'film:mean_shot_s', 'film:max_shot_s', 'film:first_cut_s', 'film:max_event_gap_s', 'contract:*',
    'lint:depth_layers', 'art:tones', 'art:shading', 'art:shapes', 'art:texture', 'art:shadow', 'look:g2', 'look:g3', 'story:*']
    .map((k) => [k, KINDS_NO_CONTENT])),
  'film:blue_purple_share': KINDS_ALL,       // content: the subject's real colours, logged
  'lint:t1': KINDS_ALL,                      // content: the product's own input shown as it really works; Arabic never
  'frame:flash': Object.freeze(['user']),    // the faithful strobe
  ...Object.fromEntries(['lint:c*', 'lint:d1', 'lint:p1', 'lint:v*', 'plan:*', 'contract:fade', 'seam:zero-overlap', 'slop:*',
    'frame:*', '*'].map((k) => [k, KINDS_ALL])),
});
const rid = (ruleId) => String(ruleId).replace(/\s+/g, '').toLowerCase();
// The source kinds that may lift a rule id.
export function allowedKinds(ruleId) {
  const r = rid(ruleId);
  if (Object.hasOwn(RULE_KINDS, r)) return RULE_KINDS[r];
  const pats = Object.keys(RULE_KINDS).filter((p) => p.endsWith('*') && r.startsWith(p.slice(0, -1))).sort((a, b) => b.length - a.length);
  return pats.length ? RULE_KINDS[pats[0]] : KINDS_ALL;
}
export const lateStage = (stage) => /^0*7$/.test(String(stage ?? '').trim());
// An amount on a floor (a minimum: the richness keys, the fast ratio, the edit coverage measures, the art counts) passes
// when value x (1 + tolerance) >= amount; every other rule id is a ceiling: value <= amount x (1 + tolerance).
const FLOOR_KEYS = new Set(['hero_share', 'frame_fill', 'depth_layers', 'in_shot_motion', 'fast_ratio', 'coverage',
  'element_events_per_min', 'trigger_coverage', 'broll_share', 'tones', 'shapes']);
export const isFloor = (ruleId) => { const s = String(ruleId).replace(/\s+/g, '').toLowerCase(); return FLOOR_KEYS.has(s.slice(s.lastIndexOf(':') + 1)); };
const WARNED = new Set();
const RANGE = /^(\d+:\d+(?:\.\d+)?|\d+(?:\.\d+)?)\s*s?\s*(?:-|to|\.\.)\s*(\d+:\d+(?:\.\d+)?|\d+(?:\.\d+)?)\s*s?$/;
const SHOT = /^(?:shot|s)?[\s_#-]*0*(\d+)$/;
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

// Path of ice/plan/craft-plan.json found by walking up from start (a file or a folder), or null.
export function findCraftPlan(start) {
  if (!start) return null;
  let d = path.resolve(String(start));
  try { if (fs.statSync(d).isFile()) d = path.dirname(d); } catch {}
  for (;;) {
    const cands = [...(path.basename(d) === 'plan' && path.basename(path.dirname(d)) === 'ice' ? [path.join(d, 'craft-plan.json')] : []),
      ...(path.basename(d) === 'ice' ? [path.join(d, 'plan', 'craft-plan.json')] : []), path.join(d, 'ice', 'plan', 'craft-plan.json')];
    for (const c of cands) { try { if (fs.statSync(c).isFile()) return c; } catch {} }
    if (path.dirname(d) === d) return null;
    d = path.dirname(d);
  }
}

// The parsed craft plan found by walking up from start, or null (a file that is not a JSON object reads as no plan).
export function loadCraftPlan(start) {
  const f = findCraftPlan(start);
  if (!f) return null;
  try {
    const plan = JSON.parse(fs.readFileSync(f, 'utf8').replace(/^\uFEFF/, ''));
    return plan && typeof plan === 'object' && !Array.isArray(plan) ? plan : null;
  } catch (e) {
    console.error(`warning: craft plan ${f} cannot be read as JSON (${e.message}): no exemption applies`);
    return null;
  }
}

export function neverLifted(lift) {
  const s = String(lift).trim().toLowerCase();
  if (NEVER_IDS.has(s.replace(/\s+/g, ''))) return true;
  const w = s.split(/[^a-z0-9]+/).filter(Boolean);
  return w.some((x) => NEVER_WORDS.has(x)) || w.slice(1).some((x, i) => NEVER_PAIRS.has(w[i] + ' ' + x));
}

const list = (v) => (typeof v === 'string' || isNum(v) ? [v] : Array.isArray(v) ? v : []);
const secs = (tok) => { const i = tok.lastIndexOf(':'); return i >= 0 ? parseInt(tok.slice(0, i), 10) * 60 + parseFloat(tok.slice(i + 1)) : parseFloat(tok); };
const numValue = (v) => {
  if (typeof v === 'boolean') return null;
  if (isNum(v)) return v;
  const m = /-?\d+(?:\.\d+)?/.exec(String(v ?? ''));
  return m ? parseFloat(m[0]) / (String(v).includes('%') ? 100 : 1) : null;
};

// [value, tolerance] of a row's amount, or null when it gives no number. The tolerance defaults to 0.10.
export function exemptionAmount(row) {
  const am = row && typeof row === 'object' ? row.amount : null;
  if (!am || typeof am !== 'object' || Array.isArray(am)) return null;
  const x = numValue(am.value); if (x === null) return null;
  const tol = isNum(am.tolerance) && am.tolerance >= 0 ? am.tolerance : 0.10;
  return [x, tol];
}

function covers(shots, t, shot) {
  const keys = list(shots).map((x) => String(x).trim().toLowerCase()).filter(Boolean);
  if (keys.includes('all')) return true;
  if (shot !== undefined && shot !== null) {
    const s = String(shot).trim().toLowerCase(), m = SHOT.exec(s), sk = m ? 'n' + parseInt(m[1], 10) : 's' + s;
    for (const k of keys) { if (RANGE.test(k)) continue; const mk = SHOT.exec(k); if ((mk ? 'n' + parseInt(mk[1], 10) : 's' + k) === sk) return true; }
  }
  if (t !== undefined && t !== null) {
    const [a, b] = Array.isArray(t) ? [+t[0], +t[1]] : [+t, +t];
    for (const k of keys) { const m = RANGE.exec(k); if (m && secs(m[1]) - 1e-6 <= a && b <= secs(m[2]) + 1e-6) return true; }
  }
  return false;
}

// [why the whole row is ignored or null, {lift: why this lift is ignored}], as exemption_issues in storyboard_lint.py.
export function exemptionIssues(row) {
  const lifts = list(row?.lifts).map(String);
  const bad = lifts.filter(neverLifted);
  if (bad.length) return [`it lifts a never-lifted class (${bad.join(', ')})`, {}];
  const src = row.source && typeof row.source === 'object' && !Array.isArray(row.source) ? row.source : {};
  const kind = String(src.kind || '').trim().toLowerCase();
  if (!SOURCE_KINDS.has(kind) || !String(src.ref || '').trim()) return ['it has no source (source.kind user, reference, style or content, and source.ref)', {}];
  if (!KINDS_NO_CONTENT.includes(kind) && lateStage(row.stage)) {
    return [`a ${kind} row written at stage 07 (a row written at 07 comes only from user, reference or style; a row added after a gate failed is a paper patch)`, {}];
  }
  const per = {};
  for (const x of lifts) if (!allowedKinds(x).includes(kind)) per[x] = `a ${kind} row cannot lift it (allowed: ${allowedKinds(x).join(', ')})`;
  return [null, per];
}

// The first exemption row that covers a hit, else null. shots: a list, or "all", which covers everything. t: a number
// or a [start, end] pair (with neither t nor shot, only "all" covers); value: the measured value, at most amount x
// (1 + tolerance), or for a floor rule id (isFloor) value x (1 + tolerance) at least the amount. Ignored with a warning
// on stderr (exemptionIssues): a row that lifts a never-lifted class, has no source or is a content row written at 07,
// and a row for a rule id its source kind may not lift (allowedKinds).
export function exemptionFor(plan, ruleId, { t = null, shot = null, value = null } = {}) {
  if (!plan || typeof plan !== 'object' || !Array.isArray(plan.exemptions)) return null;
  const want = rid(ruleId);
  const floor = isFloor(want);
  const rows = [];
  for (const row of plan.exemptions) {     // every ignored row is warned about once, whatever rule is asked
    if (!row || typeof row !== 'object' || Array.isArray(row)) continue;
    const lifts = list(row.lifts).map(String);
    const [whole, per] = exemptionIssues(row);
    const lines = whole ? [[String(row.id) + '|' + lifts.join('|'), `ignored: ${whole}`]]
      : Object.entries(per).map(([x, why]) => [String(row.id) + '#' + x, `ignored for ${x}: ${why}`]);
    for (const [key, line] of lines) if (!WARNED.has(key)) { WARNED.add(key); console.error(`warning: craft plan exemption ${row.id ?? '?'} ${line}`); }
    if (!whole) rows.push([row, lifts.filter((x) => !Object.hasOwn(per, x))]);
  }
  for (const [row, lifts] of rows) {
    if (!lifts.map(rid).includes(want)) continue;
    if (!covers(row.shots, t, shot)) continue;
    const am = isNum(value) ? exemptionAmount(row) : null;
    if (am && (floor ? value * (1 + am[1]) < am[0] - 1e-9 : value > am[0] * (1 + am[1]) + 1e-9)) continue;
    return row;
  }
  return null;
}

// The line a gate prints for a covered hit.
export function exemptLine(ruleId, row) {
  const src = row && row.source && typeof row.source === 'object' ? row.source : {};
  return `exempt ${ruleId} by ${row?.id ?? '?'} (${src.kind ?? '?'}: ${src.ref ?? '?'})`;
}

export function findChrome() {
  const c = [process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/snap/bin/chromium', '/usr/bin/microsoft-edge', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'];
  const p = c.find((x) => x && fs.existsSync(x));
  if (!p) die('Google Chrome not found (set CHROME_PATH)');
  return p;
}

// Minimal argv parser: flags = {name: 'string'|'bool'}; returns {pos:[], opt:{}}
export function parseArgs(argv, flags) {
  const pos = [], opt = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, inline] = a.slice(2).split(/=(.*)/s);
      if (!(k in flags)) die(`unknown option --${k} (try --help)`);
      if (flags[k] === 'bool') opt[k] = true;
      else {
        const v = inline !== undefined ? inline : argv[++i];
        if (v === undefined) die(`--${k} needs a value`);
        opt[k] = v;
      }
    } else pos.push(a);
  }
  return { pos, opt };
}

export class CDP {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pending = new Map(); this.handlers = [];
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(typeof e.data === 'string' ? e.data : Buffer.from(e.data).toString());
      if (m.id !== undefined) {
        const p = this.pending.get(m.id);
        if (!p) return;
        this.pending.delete(m.id); clearTimeout(p.timer);
        if (m.error) p.rej(new Error(`${p.method}: ${m.error.message}`)); else p.res(m.result || {});
      } else for (const h of [...this.handlers]) if (h.method === m.method && (!h.sid || h.sid === m.sessionId)) h.fn(m.params || {}, m);
    });
    ws.addEventListener('close', () => {
      for (const p of this.pending.values()) { clearTimeout(p.timer); p.rej(new Error(`${p.method}: connection closed`)); }
      this.pending.clear(); this.closed = true;
    });
  }
  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((res, rej) => {
      ws.addEventListener('open', res, { once: true });
      ws.addEventListener('error', () => rej(new Error('cannot connect to ' + url)), { once: true });
    });
    return new CDP(ws);
  }
  send(method, params = {}, sessionId, timeout = 60000) {
    return new Promise((res, rej) => {
      if (this.closed) return rej(new Error(`${method}: connection closed`));
      const id = ++this.id;
      const timer = setTimeout(() => { this.pending.delete(id); rej(new Error(`${method}: timeout after ${timeout}ms`)); }, timeout);
      this.pending.set(id, { res, rej, method, timer });
      this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }
  on(method, fn, sid) { const h = { method, fn, sid }; this.handlers.push(h); return () => { this.handlers = this.handlers.filter((x) => x !== h); }; }
}

export async function launchChrome({ args = [], width = 1920, height = 1080, headless = true } = {}) {
  const exe = findChrome();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'md-chrome-'));
  const flags = [
    headless ? '--headless=new' : '', '--remote-debugging-port=0', `--user-data-dir=${dir}`,
    `--window-size=${width},${height}`, '--no-first-run', '--no-default-browser-check', '--disable-extensions',
    '--disable-sync', '--hide-scrollbars', '--mute-audio', '--force-color-profile=srgb', '--disable-dev-shm-usage',
    '--autoplay-policy=no-user-gesture-required', '--disable-renderer-backgrounding', '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows', '--disable-features=Translate,MediaRouter,OptimizationHints',
    '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-popup-blocking', ...args, 'about:blank',
  ].filter(Boolean);
  const proc = spawn(exe, flags, { stdio: ['ignore', 'ignore', 'pipe'] });
  let dead = false, errTail = '';
  proc.on('exit', () => { dead = true; });
  const wsUrl = await new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('Chrome did not report a DevTools URL in 25s\n' + errTail.slice(-600))), 25000);
    proc.stderr.on('data', (d) => {
      errTail += d; const m = /DevTools listening on (ws:\/\/\S+)/.exec(errTail);
      if (m) { clearTimeout(t); res(m[1]); }
    });
    proc.on('exit', (c) => { clearTimeout(t); rej(new Error(`Chrome exited early (code ${c})\n${errTail.slice(-600)}`)); });
  });
  const cdp = await CDP.connect(wsUrl);
  let closed = false;
  const close = async () => {
    if (closed) return; closed = true;
    try { await cdp.send('Browser.close', {}, undefined, 3000); } catch {}
    try { cdp.ws.close(); } catch {}
    if (!dead) { proc.kill('SIGTERM'); await new Promise((r) => { proc.once('exit', r); setTimeout(() => { try { proc.kill('SIGKILL'); } catch {} r(); }, 2000); }); }
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
  };
  process.on('exit', () => { try { proc.kill('SIGKILL'); } catch {} try { fs.rmSync(dir, { recursive: true, force: true }); } catch {} });
  for (const s of ['SIGINT', 'SIGTERM']) process.on(s, () => { close().finally(() => process.exit(130)); });
  const version = (await cdp.send('Browser.getVersion')).product;

  async function newPage({ width: w = width, height: h = height, scale = 1 } = {}) {
    const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
    const send = (m, p, t) => cdp.send(m, p, sessionId, t);
    const page = {
      sessionId, targetId, send, cdp,
      on: (ev, fn) => cdp.on(ev, fn, sessionId),
      async setViewport(vw, vh, s = 1) {
        await send('Emulation.setDeviceMetricsOverride', { width: vw, height: vh, deviceScaleFactor: s, mobile: false });
      },
      async eval(expression, { timeout = 60000 } = {}) {
        const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, timeout);
        if (r.exceptionDetails) {
          const d = r.exceptionDetails;
          throw new Error('page eval: ' + (d.exception?.description || d.text || 'exception').split('\n')[0]);
        }
        return r.result.value;
      },
      async goto(url, { timeout = 30000 } = {}) {
        const loaded = new Promise((res) => { const off = page.on('Page.loadEventFired', () => { off(); res(true); }); setTimeout(() => { off(); res(false); }, timeout); });
        const r = await send('Page.navigate', { url });
        if (r.errorText) throw new Error(`navigation failed: ${r.errorText} (${url})`);
        return loaded; // false = load event timed out (page may still be usable)
      },
      async shot({ format = 'png', quality = 90, clip, beyond = false } = {}) {
        const r = await send('Page.captureScreenshot', { format, ...(format === 'jpeg' ? { quality } : {}), ...(clip ? { clip } : {}), captureBeyondViewport: beyond }, 60000);
        return Buffer.from(r.data, 'base64');
      },
      close: () => cdp.send('Target.closeTarget', { targetId }).catch(() => {}),
    };
    await send('Page.enable'); await send('Runtime.enable');
    await page.setViewport(w, h, scale);
    await send('Page.bringToFront').catch(() => {});
    return page;
  }
  return { cdp, proc, version, newPage, close, exe };
}
