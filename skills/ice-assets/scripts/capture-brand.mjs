// capture-brand.mjs: live captures and a brand sheet from a real brand's own site. Original code written for this
// repository (Apache-2.0) from ../references/brand-authenticity.md section 10 and ../references/screen-capture.md
// section 3.
//
//   node capture-brand.mjs --url <http(s) page> --out <folder> [--lang <language tag>] [--sheet <file>]
//                          [--ratios 16:9,9:16,1:1] [--scale <n>] [--consent decline|hide|leave]
//                          [--hide <css selector>]... [--settle <ms>] [--max-height <css px>] [--no-full]
//                          [--timeout <s>] [--json]
//
// Per aspect ratio, in a local Chrome or Edge run headless and driven through the DevTools protocol over a pipe:
//   1. opens the page at the preset viewport (9:16 and 4:5 emulate a phone) in the language asked for, records every
//      redirect, answers a cookie or consent dialog with its decline button, waits for the network and the fonts,
//      scrolls once to the end to wake lazy images and returns to the top;
//   2. saves a viewport screenshot and a full-page screenshot (fixed and sticky bars flattened for the full page) and
//      flags a viewport shot that is nearly one flat color with almost no words (an empty app shell or a loading
//      screen);
//   3. reads computed styles: colors by painted area (grid samples of the topmost painted layer), text colors and
//      font families with weights by text area, @font-face files, color custom properties, the main heading's ink
//      and font, button colors (accent candidates, link buttons and inner fills included), logo candidates (listed
//      with URL and size, never downloaded), theme-color and Open Graph tags, the writing scripts of the visible
//      text, and the interface strings exactly as written (placeholders, button and link labels, aria-labels,
//      navigation, headings, form labels, tabs and menu items, image alt text).
// Output: <folder>/brand-sheet.json (or the --sheet file) plus one PNG per shot, each with its SHA-256 in the sheet.
// --lang <tag> (a BCP 47 tag such as <language> or <language>-<REGION>, the film's language from the brief) sets the
// browser language, the Intl locale and the Accept-Language header together; the sheet records what was asked and
// what the page declared, and warns when they differ. Without --lang the browser default is sent and a warning says so.
// --sheet <file> writes the sheet there instead of next to the shots (a project keeps per-page sheets under
// ice/assets/captures/<brand>/, which needs no manifest row; see ../references/brand-authenticity.md section 10).
// Presets (CSS px x device pixel ratio): 16:9 1920x1080 x1, 9:16 432x768 x2.5 (1080x1920), 1:1 1080x1080 x1,
// 4:5 864x1080 x1.25 (1080x1350). --scale multiplies the ratio (2 gives crisp crops for push-ins).
// Nothing is typed or submitted. Cookie and consent dialogs are never accepted: --consent decline (default) clicks
// only the dialog's own reject or necessary-only button, and hides the dialog when it has none; --consent hide only
// hides it; --consent leave keeps it on screen. Any other layer over the page is hidden with --hide '<selector>'
// (the sheet's warnings name a selector hint).
// A redirect (another path or another host) is recorded and warned about; a redirect to another host usually means
// an app, player, sign-in or region page: capture the brand's own marketing or product page instead.
// A blocked page (HTTP error, bot check, empty shell) writes ok: false with the reason and exits 1: a hard stop.
// A nearly empty viewport shot keeps ok: true but sets result: "partial" and names the shot: never use that shot.
// Browser: ICE_CHROME or CHROME_PATH, else the usual Chrome, Chromium and Edge locations on Windows, macOS and Linux.
// Node 18 or newer, no dependencies. Exit 0 ok, 1 blocked or failed, 2 usage error.
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { inflateSync } from "node:zlib";
import { delimiter, dirname, join, resolve } from "node:path";
import { StringDecoder } from "node:string_decoder";
import { fileURLToPath } from "node:url";

const PRESETS = {
  "16:9": { width: 1920, height: 1080, dpr: 1, mobile: false },
  "9:16": { width: 432, height: 768, dpr: 2.5, mobile: true },
  "1:1": { width: 1080, height: 1080, dpr: 1, mobile: false },
  "4:5": { width: 864, height: 1080, dpr: 1.25, mobile: true },
};
const MAX_DEVICE_PX = 16000; // tallest full-page bitmap requested from the browser
const BLOCK_WORDS = /just a moment|attention required|access denied|are you a robot|verify you are human|captcha|request blocked|unusual traffic/i;
const NEAR_EMPTY = 0.9; // a viewport shot this share one flat color, with under 80 characters on screen, is nearly empty
const LANG_TAG = /^[a-z]{2,3}(-[a-z]{4})?(-([a-z]{2}|\d{3}))?(-[a-z0-9]{5,8})*$/i;
// The writing script a language's interface is expected in, used to check that the page really came back in it.
// Languages missing here are only checked through the page's own lang attribute.
const LANG_SCRIPT = {
  ar: "Arabic", fa: "Arabic", ur: "Arabic", ps: "Arabic", sd: "Arabic", ug: "Arabic", he: "Hebrew", yi: "Hebrew",
  ru: "Cyrillic", uk: "Cyrillic", be: "Cyrillic", bg: "Cyrillic", mk: "Cyrillic", kk: "Cyrillic", ky: "Cyrillic", mn: "Cyrillic",
  el: "Greek", zh: "Han", ja: "Japanese", ko: "Hangul", hi: "Devanagari", mr: "Devanagari", ne: "Devanagari", th: "Thai",
  bn: "Bengali", ta: "Tamil", te: "Telugu", ka: "Georgian", hy: "Armenian", am: "Ethiopic",
};
for (const l of ("en fr de es it pt nl sv no nb nn da fi is pl cs sk hu ro tr id ms vi tl fil sw hr sl bs et lv lt ca gl eu ga cy " +
  "sq az uz ha yo ig zu xh af mt lb").split(" ")) LANG_SCRIPT[l] = "Latin";
const SCRIPT_OF_SUBTAG = { Arab: "Arabic", Hebr: "Hebrew", Cyrl: "Cyrillic", Grek: "Greek", Hans: "Han", Hant: "Han", Jpan: "Japanese",
  Kore: "Hangul", Deva: "Devanagari", Thai: "Thai", Latn: "Latin", Beng: "Bengali", Taml: "Tamil", Geor: "Georgian", Armn: "Armenian" };

// ---------------------------------------------------------------- arguments

function usage(code) {
  const text = readFileSync(fileURLToPath(import.meta.url), "utf8").split(/\r?\n/);
  const head = [];
  for (const line of text) { if (!line.startsWith("//")) break; head.push(line.replace(/^\/\/ ?/, "")); }
  (code ? console.error : console.log)(head.join("\n"));
  process.exit(code);
}

function parseArgs(argv) {
  const o = { ratios: ["16:9", "9:16", "1:1"], hide: [], settle: 1500, maxHeight: 12000, full: true, timeout: 60, scale: 1, consent: "decline" };
  const need = (i) => { if (argv[i + 1] === undefined) { console.error(`${argv[i]} needs a value`); usage(2); } return argv[i + 1]; };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") usage(0);
    else if (a === "--json") o.json = true;
    else if (a === "--no-full") o.full = false;
    else if (a === "--url") o.url = need(i++);
    else if (a === "--out") o.out = need(i++);
    else if (a === "--ratios") o.ratios = need(i++).split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "--hide") o.hide.push(need(i++));
    else if (a === "--settle") o.settle = Number(need(i++));
    else if (a === "--max-height") o.maxHeight = Number(need(i++));
    else if (a === "--timeout") o.timeout = Number(need(i++));
    else if (a === "--scale") o.scale = Number(need(i++));
    else if (a === "--lang") o.lang = need(i++).trim().replace(/_/g, "-");
    else if (a === "--sheet") o.sheet = need(i++);
    else if (a === "--consent") o.consent = need(i++).trim().toLowerCase();
    else { console.error(`unknown argument '${a}'`); usage(2); }
  }
  if (!o.url || !o.out) { console.error("--url and --out are required"); usage(2); }
  if (o.lang !== undefined) {
    if (!LANG_TAG.test(o.lang)) { console.error(`--lang '${o.lang}' is not a language tag (a language code, optionally with a script and a region)`); usage(2); }
    o.acceptLanguage = acceptLanguage(o.lang);
  }
  if (!["decline", "hide", "leave"].includes(o.consent)) { console.error("--consent must be decline, hide or leave (never accept)"); usage(2); }
  let u;
  try { u = new URL(o.url); } catch { console.error(`'${o.url}' is not a URL`); usage(2); }
  if (!/^https?:$/.test(u.protocol)) { console.error("only http and https pages are captured"); usage(2); }
  for (const r of o.ratios) if (!PRESETS[r]) { console.error(`unknown ratio '${r}' (known: ${Object.keys(PRESETS).join(", ")})`); usage(2); }
  for (const [k, v, min] of [["settle", o.settle, 0], ["max-height", o.maxHeight, 1], ["timeout", o.timeout, 1], ["scale", o.scale, 0.25]]) {
    if (!Number.isFinite(v) || v < min) { console.error(`--${k} must be a number of at least ${min}`); usage(2); }
  }
  if (o.lang !== undefined) o.lang = canonicalTag(o.lang);
  return o;
}

// ---------------------------------------------------------------- language

/** Case per BCP 47 convention: language lower, script title, region upper. */
export function canonicalTag(tag) {
  return tag.split("-").map((p, i) => (i === 0 ? p.toLowerCase() : p.length === 4 && /^[a-z]+$/i.test(p) ? p[0].toUpperCase() + p.slice(1).toLowerCase()
    : p.length === 2 || /^\d{3}$/.test(p) ? p.toUpperCase() : p.toLowerCase())).join("-");
}

/** The Accept-Language header for one tag: the full tag first, then its bare language at a lower weight. */
export function acceptLanguage(tag) {
  const full = canonicalTag(tag), base = full.split("-")[0];
  return full === base ? full : `${full},${base};q=0.9`;
}

/** The writing script expected for a tag (a script subtag wins), or null when this script does not know it. */
export function expectedScript(tag) {
  const parts = canonicalTag(tag).split("-");
  const sub = parts.find((p, i) => i > 0 && p.length === 4 && /^[A-Z][a-z]{3}$/.test(p));
  return (sub && SCRIPT_OF_SUBTAG[sub]) || LANG_SCRIPT[parts[0]] || null;
}

/** Compares what was asked with what the page declared and the scripts its visible text is written in. */
export function languageCheck(requested, pageLang, scripts) {
  const total = Object.values(scripts || {}).reduce((s, n) => s + n, 0);
  const count = (name) => (scripts[name] || 0) + (name === "Japanese" ? scripts.Han || 0 : 0); // Japanese is written in kana and kanji
  const share = (name) => (total && name ? Math.round((count(name) / total) * 100) / 100 : null);
  const want = requested ? expectedScript(requested) : null;
  const declared = (pageLang || "").trim().toLowerCase().split(/[-_]/)[0] || null;
  const asked = requested ? requested.toLowerCase().split("-")[0] : null;
  const scriptShare = share(want);
  let match = null;
  if (requested) {
    const langOk = declared ? declared === asked : null;
    const scriptOk = scriptShare === null ? null : scriptShare >= 0.2;
    match = langOk === false || scriptOk === false ? false : langOk === null && scriptOk === null ? null : true;
  }
  return { declared, expected_script: want, expected_script_share: scriptShare, match };
}

/** Kind of address change between the page asked for and the page shown. */
export function redirectKind(from, to) {
  let a, b;
  try { a = new URL(from); b = new URL(to); } catch { return "none"; }
  const host = (u) => u.hostname.toLowerCase().replace(/^www\./, "");
  if (host(a) !== host(b)) return "other-host";
  const path = (u) => (u.pathname.replace(/\/+$/, "") || "/") + u.search;
  if (path(a) !== path(b)) return "same-site";
  return a.href.replace(/#.*$/, "") === b.href.replace(/#.*$/, "") ? "none" : "same-page";
}

// ---------------------------------------------------------------- browser

export function findBrowser() {
  const fromEnv = [process.env.ICE_CHROME, process.env.CHROME_PATH].filter(Boolean);
  for (const p of fromEnv) if (existsSync(p)) return p;
  const list = [];
  if (process.platform === "win32") {
    const roots = [process.env.PROGRAMFILES, process.env["PROGRAMFILES(X86)"], process.env.LOCALAPPDATA].filter(Boolean);
    for (const r of roots) {
      list.push(join(r, "Google", "Chrome", "Application", "chrome.exe"), join(r, "Chromium", "Application", "chrome.exe"),
        join(r, "Microsoft", "Edge", "Application", "msedge.exe"));
    }
  } else if (process.platform === "darwin") {
    for (const base of ["/Applications", join(homedir(), "Applications")]) {
      list.push(join(base, "Google Chrome.app", "Contents", "MacOS", "Google Chrome"), join(base, "Chromium.app", "Contents", "MacOS", "Chromium"),
        join(base, "Microsoft Edge.app", "Contents", "MacOS", "Microsoft Edge"));
    }
  } else {
    const names = ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "microsoft-edge", "microsoft-edge-stable"];
    for (const dir of (process.env.PATH || "").split(delimiter).filter(Boolean)) for (const n of names) list.push(join(dir, n));
    list.push(join("/snap", "bin", "chromium"));
  }
  return list.find((p) => existsSync(p)) || null;
}

/** DevTools protocol over --remote-debugging-pipe: messages are JSON separated by a NUL byte (fd 3 in, fd 4 out). */
class PipeSession {
  constructor(proc) {
    this.out = proc.stdio[3]; this.next = 0; this.waiting = new Map(); this.listeners = []; this.closed = false;
    const dec = new StringDecoder("utf8"); let buf = "";
    proc.stdio[4].on("data", (chunk) => {
      buf += dec.write(chunk);
      for (let i = buf.indexOf("\0"); i >= 0; i = buf.indexOf("\0")) {
        const raw = buf.slice(0, i); buf = buf.slice(i + 1);
        if (raw) this.dispatch(JSON.parse(raw));
      }
    });
    proc.on("exit", () => { this.closed = true; for (const w of this.waiting.values()) w.fail(new Error("browser exited")); this.waiting.clear(); });
  }
  dispatch(msg) {
    if (msg.id !== undefined) {
      const w = this.waiting.get(msg.id); if (!w) return;
      this.waiting.delete(msg.id);
      if (msg.error) w.fail(new Error(`${w.method}: ${msg.error.message}`)); else w.done(msg.result || {});
      return;
    }
    for (const l of this.listeners) if (l.method === msg.method && (!l.session || l.session === msg.sessionId)) l.fn(msg.params || {});
  }
  call(method, params = {}, session, ms = 60000) {
    if (this.closed) return Promise.reject(new Error(`${method}: browser is closed`));
    const id = ++this.next;
    return new Promise((done, fail) => {
      const timer = setTimeout(() => { this.waiting.delete(id); fail(new Error(`${method}: no answer in ${ms} ms`)); }, ms);
      this.waiting.set(id, { method, done: (v) => { clearTimeout(timer); done(v); }, fail: (e) => { clearTimeout(timer); fail(e); } });
      this.out.write(JSON.stringify({ id, method, params, ...(session ? { sessionId: session } : {}) }) + "\0");
    });
  }
  listen(method, fn, session) {
    const l = { method, fn, session }; this.listeners.push(l);
    return () => { this.listeners = this.listeners.filter((x) => x !== l); };
  }
}

async function startBrowser(exe, lang) {
  const profile = mkdtempSync(join(tmpdir(), "ice-brand-"));
  const flags = ["--headless=new", "--remote-debugging-pipe", `--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
    "--disable-extensions", "--disable-sync", "--hide-scrollbars", "--mute-audio", "--force-color-profile=srgb",
    "--disable-background-networking", "--disable-component-update", "--disable-default-apps", "--disable-dev-shm-usage",
    "--disable-features=Translate,MediaRouter", ...(lang ? [`--lang=${lang}`, `--accept-lang=${acceptLanguage(lang)}`] : []), "about:blank"];
  const proc = spawn(exe, flags, { stdio: ["ignore", "ignore", "ignore", "pipe", "pipe"] });
  const cleanup = () => { try { proc.kill(); } catch {} try { rmSync(profile, { recursive: true, force: true, maxRetries: 3 }); } catch {} };
  process.on("exit", cleanup);
  const s = new PipeSession(proc);
  const version = await s.call("Browser.getVersion", {}, undefined, 30000);
  const close = async () => {
    try { await s.call("Browser.close", {}, undefined, 5000); } catch {}
    await new Promise((r) => { if (proc.exitCode !== null) return r(); proc.once("exit", r); setTimeout(r, 4000); });
    cleanup();
  };
  return { s, version: version.product, userAgent: version.userAgent, close };
}

// ---------------------------------------------------------------- page helpers

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function evaluate(s, sid, fn, arg, ms = 60000) {
  const r = await s.call("Runtime.evaluate", { expression: `(${fn})(${JSON.stringify(arg ?? null)})`, awaitPromise: true, returnByValue: true }, sid, ms);
  if (r.exceptionDetails) throw new Error(`page script: ${(r.exceptionDetails.exception?.description || r.exceptionDetails.text || "error").split("\n")[0]}`);
  return r.result?.value;
}

/** Waits until no request has been in flight for `quiet` ms, or `max` ms passed. */
function idleWatcher(s, sid) {
  const live = new Set(); let last = Date.now();
  const offs = [
    s.listen("Network.requestWillBeSent", (p) => { live.add(p.requestId); last = Date.now(); }, sid),
    s.listen("Network.loadingFinished", (p) => { live.delete(p.requestId); last = Date.now(); }, sid),
    s.listen("Network.loadingFailed", (p) => { live.delete(p.requestId); last = Date.now(); }, sid),
  ];
  return {
    async wait(quiet = 600, max = 15000) {
      const t0 = Date.now();
      while (Date.now() - t0 < max) { if (live.size <= 1 && Date.now() - last >= quiet) return true; await sleep(100); }
      return false;
    },
    stop: () => offs.forEach((f) => f()),
  };
}

/** Every style sheet's text through the CSS domain (cross-origin sheets included): @font-face rules and root color tokens. */
async function readSheets(call, sheets, pageUrl) {
  const faces = [], tokens = new Map(); let failed = 0;
  for (const [id, url] of [...sheets].slice(0, 80)) {
    let text;
    try { text = (await call("CSS.getStyleSheetText", { styleSheetId: id }, 20000)).text || ""; } catch { failed++; continue; }
    const base = /^https?:/.test(url || "") ? url : pageUrl;
    for (const m of text.matchAll(/@font-face\s*\{([^}]*)\}/gi)) {
      const get = (prop) => (m[1].match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`, "i")) || [])[1]?.trim();
      const files = [...(get("src") || "").matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)].slice(0, 3).map(([, u]) => {
        if (u.startsWith("data:")) return "data: (embedded in the style sheet)";
        try { return new URL(u, base).href; } catch { return u; }
      });
      if (faces.length < 80) faces.push({ family: (get("font-family") || "").replace(/["']/g, ""), weight: get("font-weight") || "normal", style: get("font-style") || "normal", files, sheet: url || "(inline)" });
    }
    for (const m of text.matchAll(/([^{}@;]+)\{([^{}]*)\}/g)) {
      if (!/^\s*(:root|html|body|:host)(\s*,\s*(:root|html|body|:host))*\s*$/i.test(m[1])) continue;
      for (const [, name, raw] of m[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+)/g)) {
        const value = raw.trim();
        if (!value.includes("var(") && !tokens.has(name)) tokens.set(name, { name, value: value.slice(0, 120) });
      }
    }
  }
  return { faces, tokens: [...tokens.values()].slice(0, 400), read: Math.min(sheets.size, 80) - failed, failed };
}

function pngSize(buf) {
  return buf.length > 24 && buf.toString("ascii", 1, 4) === "PNG" ? { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) } : { width: 0, height: 0 };
}

/** Decodes an 8-bit, non-interlaced RGB or RGBA PNG (what the browser writes) into { width, height, channels, px }. */
function decodePng(buf) {
  const { width, height } = pngSize(buf);
  const type = buf[25], channels = type === 6 ? 4 : type === 2 ? 3 : 0;
  if (!channels || buf[24] !== 8 || buf[28] !== 0) return null;
  const parts = [];
  for (let at = 8; at < buf.length;) {
    const len = buf.readUInt32BE(at), kind = buf.toString("ascii", at + 4, at + 8);
    if (kind === "IDAT") parts.push(buf.subarray(at + 8, at + 8 + len));
    at += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(parts)), stride = width * channels, px = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const f = raw[y * (stride + 1)], src = y * (stride + 1) + 1, row = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? px[row + x - channels] : 0, b = y ? px[row - stride + x] : 0, c = x >= channels && y ? px[row - stride + x - channels] : 0;
      const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      const pred = f === 1 ? a : f === 2 ? b : f === 3 ? (a + b) >> 1 : f === 4 ? (pa <= pb && pa <= pc ? a : pb <= pc ? b : c) : 0;
      px[row + x] = (raw[src + x] + pred) & 255;
    }
  }
  return { width, height, channels, px };
}

/** Painted ink of a text block: the most frequent color clearly apart from the block's dominant ground color. */
function paintedInk(img) {
  const count = new Map();
  for (let i = 0; i < img.px.length; i += img.channels) {
    const k = ((img.px[i] >> 3) << 10) | ((img.px[i + 1] >> 3) << 5) | (img.px[i + 2] >> 3); // 5 bits per channel
    const v = count.get(k) || { n: 0, r: 0, g: 0, b: 0 }; v.n++; v.r += img.px[i]; v.g += img.px[i + 1]; v.b += img.px[i + 2]; count.set(k, v);
  }
  const avg = (v) => [v.r / v.n, v.g / v.n, v.b / v.n].map(Math.round);
  const sorted = [...count.values()].sort((a, b) => b.n - a.n), ground = avg(sorted[0]);
  const far = sorted.filter((v) => Math.hypot(...avg(v).map((c, i) => c - ground[i])) > 80);
  const hex = (rgb) => "#" + rgb.map((c) => c.toString(16).padStart(2, "0")).join("");
  const total = far.reduce((s, v) => s + v.n, 0) || 1;
  return { ground: hex(ground), inks: far.slice(0, 3).map((v) => ({ hex: hex(avg(v)), share: Math.round((v.n / total) * 100) / 100 })) };
}

/** Share of the picture within a small distance of its most frequent color: near 1 means one flat field. */
export function flatShare(img) {
  const n = img.width * img.height, stride = Math.max(1, Math.floor(n / 300000)), ch = img.channels, px = img.px;
  const bins = new Map();
  for (let p = 0; p < n; p += stride) {
    const i = p * ch, k = ((px[i] >> 4) << 8) | ((px[i + 1] >> 4) << 4) | (px[i + 2] >> 4);
    const v = bins.get(k) || { n: 0, r: 0, g: 0, b: 0 }; v.n++; v.r += px[i]; v.g += px[i + 1]; v.b += px[i + 2]; bins.set(k, v);
  }
  let top = null; for (const v of bins.values()) if (!top || v.n > top.n) top = v;
  if (!top) return { share: 0, hex: null };
  const c = [top.r / top.n, top.g / top.n, top.b / top.n];
  let near = 0, seen = 0;
  for (let p = 0; p < n; p += stride) {
    const i = p * ch; seen++;
    if (Math.hypot(px[i] - c[0], px[i + 1] - c[1], px[i + 2] - c[2]) <= 24) near++;
  }
  return { share: Math.round((near / seen) * 1000) / 1000, hex: "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("") };
}

// ---------------------------------------------------------------- in-page scripts (run inside the browser)

const PAGE_SCROLL = async () => {
  const step = Math.max(200, Math.round(innerHeight * 0.8));
  const end = Math.min(document.documentElement.scrollHeight, 40000);
  for (let y = 0; y < end; y += step) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
  scrollTo(0, 0);
  await new Promise((r) => setTimeout(r, 400));
  if (document.fonts) await document.fonts.ready;
  return document.documentElement.scrollHeight;
};

const PAGE_HIDE = (selectors) => {
  const css = selectors.map((sel) => { try { document.querySelector(sel); return `${sel}{display:none !important}`; } catch { return ""; } }).join("\n");
  const el = document.createElement("style"); el.textContent = css; document.documentElement.appendChild(el);
  return selectors.length;
};

const PAGE_FLATTEN = () => {
  let n = 0;
  for (const el of document.querySelectorAll("body *")) {
    const p = getComputedStyle(el).position;
    if (p === "fixed") { el.style.setProperty("position", "absolute", "important"); n++; }
    else if (p === "sticky") { el.style.setProperty("position", "relative", "important"); n++; }
  }
  return n;
};

// Cookie and consent dialogs: found by their words and their layer, answered only with a reject or necessary-only
// button (a link that leaves the page is never clicked), never with accept. Phase "find" clicks; phase "finish" hides
// what is still on screen (unless mode is "leave") and reports.
const PAGE_CONSENT = ({ mode, phase }) => {
  // Cookie words alone mark a dialog; privacy words only count on a layer whose own id or class names consent.
  const WORDS = /cookie|consent|gdpr|ملفات تعريف الارتباط|ملفات الارتباط|الكوكيز|témoins|einwillig|consentimiento|consenso/i;
  const WEAK = /privacy|tracking|الخصوصية|datenschutz|confidentialit|privacidad|privacit|privacidade/i;
  const MARK = /cookie|consent|gdpr|cmp\b|cmp-|-cmp/i;
  const DECLINE = /\b(reject|decline|deny|refuse|disagree)\b|\b(only|just)\s+(strictly\s+)?(necessary|essential|required)\b|\b(necessary|essential|required)\s+(cookies\s+)?only\b|continue without accepting|use necessary cookies only|رفض|الضرورية فقط|الأساسية فقط|refuser|continuer sans accepter|ablehnen|nur (notwendige|erforderliche|essenzielle)|rechazar|solo (las )?(necesarias|esenciales)|rifiuta|solo necessari|rejeitar|recusar|weigeren|alleen noodzakelijke|reddet|odrzuć|отклонить|отказаться|拒绝|拒否|거부/i;
  // A label that also reads as accepting is clicked only when it limits the answer to necessary cookies.
  const ACCEPT = /\b(accept|agree|allow|got it|ok|okay|i understand)\b|قبول|أوافق|موافق|akzeptieren|zustimmen|accepter|j'accepte|aceptar|accetta|aceitar|accepteren|kabul|принять|同意|接受|동의/i;
  const NECESSARY = /necessary|essential|required|الضرورية|الأساسية|notwendige|erforderliche|essenzielle|necesarias|esenciales|necessari|noodzakelijke/i;
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden" && Number(cs.opacity) > 0.05; };
  const hint = (el) => { let s = el.tagName.toLowerCase(); if (el.id) s += "#" + CSS.escape(el.id); for (const c of [...el.classList].slice(0, 2)) s += "." + CSS.escape(c); return s; };
  const label = (b) => (b.innerText || b.value || b.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 80);
  if (phase === "find") {
    const found = [];
    for (const el of document.querySelectorAll("body *")) {
      if (found.some((f) => f.contains(el)) || !vis(el)) continue;
      const cs = getComputedStyle(el);
      const marked = MARK.test(`${el.id} ${el.getAttribute("class") || ""} ${el.getAttribute("aria-label") || ""}`);
      const layer = cs.position === "fixed" || cs.position === "sticky" || /dialog/.test(el.getAttribute("role") || "") || el.getAttribute("aria-modal") === "true" || el.tagName === "DIALOG";
      // a dialog served in a frame from another site cannot be answered from here: it is only hidden
      if (el.tagName === "IFRAME") { if (/consent|cookie|privacy|cmp/i.test(`${el.src} ${el.title} ${el.id}`)) found.push(el); continue; }
      if (!marked && !layer) continue;
      if (el.matches("header,nav,main,[role=navigation],[role=main]") || el.querySelector("nav,main,[role=navigation],[role=main]")) continue; // site chrome, never a dialog
      const text = el.innerText || "";
      if (text.length > 1500 || !(WORDS.test(text) || (marked && WEAK.test(text)))) continue;
      if (!el.querySelector("button,[role=button],input[type=button],input[type=submit],a")) continue;
      found.push(el);
    }
    const out = [];
    for (const c of found) {
      const rec = { where: hint(c), action: "found", label: null, offered: [] };
      if (c.tagName !== "IFRAME") {
        const buttons = [...c.querySelectorAll("button,[role=button],input[type=button],input[type=submit],a")].filter(vis);
        rec.offered = buttons.map(label).filter(Boolean).slice(0, 6);
        if (mode === "decline") {
          const pick = buttons.find((b) => {
            if (b.tagName === "A") { const h = b.getAttribute("href"); if (h && !/^(#|javascript:)/i.test(h.trim())) return false; }
            const l = label(b); return l && l.length <= 80 && DECLINE.test(l) && (!ACCEPT.test(l) || NECESSARY.test(l));
          });
          if (pick) { rec.label = label(pick); rec.action = "declined"; pick.click(); }
        }
      }
      out.push(rec);
    }
    window.__iceConsent = { found, out };
    return out.length;
  }
  const st = window.__iceConsent || { found: [], out: [] };
  let hidden = 0;
  st.found.forEach((c, i) => {
    const rec = st.out[i];
    const still = c.isConnected && vis(c);
    rec.still_visible = still;
    if (still && mode !== "leave") { c.style.setProperty("display", "none", "important"); hidden++; rec.action = rec.action === "declined" ? "declined-then-hidden" : "hidden"; }
    if (!still && rec.action === "found") rec.action = "closed-by-page";
  });
  if (hidden) for (const el of [document.documentElement, document.body]) if (el && getComputedStyle(el).overflowY === "hidden") el.style.setProperty("overflow", "auto", "important");
  return st.out;
};

const PAGE_READ = async ({ cap, rawTokens }) => {
  const cv = document.createElement("canvas"); cv.width = cv.height = 1;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  const memo = new Map();
  const rgba = (str) => {
    if (!str || str === "none" || str === "transparent") return null;
    if (memo.has(str)) return memo.get(str);
    let out = null;
    if (CSS.supports("color", str)) {
      ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = "#000"; ctx.fillStyle = str; ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      out = a ? { hex: "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join(""), a: a / 255 } : null;
    }
    memo.set(str, out); return out;
  };
  const firstColor = (gradient) => (gradient.match(/(rgba?\([^)]*\)|#[0-9a-f]{3,8}\b|(?:oklch|oklab|lab|lch|hsla?|color)\([^)]*\))/i) || [])[0];
  // Letters are painted in -webkit-text-fill-color (defaults to color); a transparent fill over a background-clip:text
  // gradient paints the gradient, so its first stop stands for the ink.
  const textInk = (el, cs) => {
    const fill = rgba(cs.webkitTextFillColor || cs.color);
    if (fill && fill.a >= 0.1) return fill;
    for (let a = el, i = 0; a && i < 5; a = a.parentElement, i++) {
      const s = getComputedStyle(a);
      if ((s.backgroundClip === "text" || s.webkitBackgroundClip === "text") && s.backgroundImage.includes("gradient")) return rgba(firstColor(s.backgroundImage));
    }
    return null;
  };
  const visible = (el, cs) => cs.display !== "none" && cs.visibility !== "hidden" && Number(cs.opacity) > 0.05;
  const fixedMemo = new WeakMap();
  const inFixed = (el) => {
    if (!el || el === document.documentElement) return false;
    if (fixedMemo.has(el)) return fixedMemo.get(el);
    const v = getComputedStyle(el).position === "fixed" || inFixed(el.parentElement);
    fixedMemo.set(el, v); return v;
  };
  const hint = (el) => {
    let s = el.tagName.toLowerCase();
    if (el.id) s += "#" + CSS.escape(el.id);
    for (const c of [...el.classList].slice(0, 2)) s += "." + CSS.escape(c);
    return s;
  };
  const add = (map, key, n, extra) => { const v = map.get(key) || { n: 0, ...extra }; v.n += n; map.set(key, v); return v; };

  // 1. painted area: grid samples of the topmost painted layer, one viewport-high band at a time
  const W = document.documentElement.clientWidth, H = Math.min(document.documentElement.scrollHeight, cap), VH = innerHeight;
  const step = Math.max(6, Math.round(Math.sqrt((W * H) / 30000)));
  const paint = new Map(); let media = 0, total = 0;
  const pageGround = rgba(getComputedStyle(document.body || document.documentElement).backgroundColor)
    || rgba(getComputedStyle(document.documentElement).backgroundColor) || { hex: "#ffffff", a: 1 };
  for (let top = 0; top < H; top += VH) {
    scrollTo(0, top); await new Promise((r) => requestAnimationFrame(() => r()));
    const offset = scrollY;
    for (let y = step / 2; y < VH && offset + y < H; y += step) {
      if (offset + y < top) continue;
      for (let x = step / 2; x < W; x += step) {
        const stack = document.elementsFromPoint(x, y);
        if (top > 0 && stack[0] && inFixed(stack[0])) continue; // a fixed bar counts once, in the first band
        total++;
        let hit = null;
        for (const el of stack) {
          if (/^(IMG|VIDEO|CANVAS|IFRAME|PICTURE|OBJECT|EMBED)$/.test(el.tagName)) { hit = "media"; break; }
          const cs = getComputedStyle(el);
          if (!visible(el, cs)) continue;
          if (el instanceof SVGElement && el.tagName.toLowerCase() !== "svg") {
            const c = cs.fill && !cs.fill.startsWith("url") ? rgba(cs.fill) : null;
            if (c && c.a >= 0.5) { hit = { kind: "graphic", c }; break; }
            continue;
          }
          const bi = cs.backgroundImage;
          if (bi && bi !== "none") {
            if (bi.includes("url(")) { hit = "media"; break; }
            const c = rgba(firstColor(bi)); if (c) { hit = { kind: "gradient", c }; break; }
          }
          const c = rgba(cs.backgroundColor);
          if (c && c.a >= 0.5) { hit = { kind: "background", c }; break; }
        }
        if (hit === "media") { media++; continue; }
        const h = hit || { kind: "background", c: pageGround };
        const v = add(paint, h.c.hex, 1, { kinds: {} });
        v.kinds[h.kind] = (v.kinds[h.kind] || 0) + 1;
      }
    }
  }
  scrollTo(0, 0);

  // 2. text: color, family and weight by text area
  const ink = new Map(), fam = new Map(); let textArea = 0;
  // writing scripts of the visible text, in characters (shows which language the page really came back in)
  const SCRIPT_RX = [["Latin", /\p{Script=Latin}/gu], ["Arabic", /\p{Script=Arabic}/gu], ["Hebrew", /\p{Script=Hebrew}/gu],
    ["Cyrillic", /\p{Script=Cyrillic}/gu], ["Greek", /\p{Script=Greek}/gu], ["Han", /\p{Script=Han}/gu],
    ["Japanese", /[\p{Script=Hiragana}\p{Script=Katakana}]/gu], ["Hangul", /\p{Script=Hangul}/gu], ["Devanagari", /\p{Script=Devanagari}/gu],
    ["Thai", /\p{Script=Thai}/gu], ["Bengali", /\p{Script=Bengali}/gu], ["Tamil", /\p{Script=Tamil}/gu], ["Telugu", /\p{Script=Telugu}/gu],
    ["Georgian", /\p{Script=Georgian}/gu], ["Armenian", /\p{Script=Armenian}/gu], ["Ethiopic", /\p{Script=Ethiopic}/gu]];
  const scripts = {}; let firstScreenChars = 0;
  const walker = document.createTreeWalker(document.body || document.documentElement, NodeFilter.SHOW_TEXT);
  const range = document.createRange(); let nodes = 0;
  for (let t = walker.nextNode(); t && nodes < 25000; t = walker.nextNode()) {
    if (!t.textContent.trim() || !t.parentElement) continue;
    const pe = t.parentElement; if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(pe.tagName)) continue;
    const cs = getComputedStyle(pe); if (!visible(pe, cs)) continue;
    nodes++;
    range.selectNodeContents(t);
    let area = 0, onFirst = false;
    for (const r of range.getClientRects()) {
      if (r.width > 0 && r.height > 0 && r.top + scrollY < cap) area += r.width * r.height;
      if (r.width > 0 && r.height > 0 && r.top + scrollY < innerHeight && r.bottom + scrollY > 0) onFirst = true;
    }
    if (onFirst) firstScreenChars += t.textContent.trim().length;
    if (!area) continue;
    textArea += area;
    for (const [name, rx] of SCRIPT_RX) { const m = t.textContent.match(rx); if (m) scripts[name] = (scripts[name] || 0) + m.length; }
    const c = textInk(pe, cs); if (c) add(ink, c.hex, area);
    const stack = cs.fontFamily, family = stack.split(",")[0].trim().replace(/^["']|["']$/g, "");
    const f = add(fam, family, area, { stack, weights: {}, styles: {}, tags: {} });
    f.weights[cs.fontWeight] = (f.weights[cs.fontWeight] || 0) + area;
    f.styles[cs.fontStyle] = (f.styles[cs.fontStyle] || 0) + area;
    const role = pe.closest("h1,h2,h3,h4,h5,h6,button,a,nav,label,li,p,figcaption,blockquote,td,th");
    const tag = role ? role.tagName.toLowerCase() : pe.tagName.toLowerCase();
    f.tags[tag] = (f.tags[tag] || 0) + area;
  }

  // 3. color custom properties read from every style sheet by the caller, converted to sRGB here
  const tokens = [];
  for (const t of rawTokens) { const c = rgba(t.value); if (c && tokens.length < 120) tokens.push({ ...t, hex: c.hex, alpha: Math.round(c.a * 100) / 100 }); }
  const loadedFaces = document.fonts ? [...document.fonts].filter((f) => f.status === "loaded").map((f) => `${f.family.replace(/["']/g, "")} ${f.weight} ${f.style}`) : [];

  // 4. headline, buttons, logos, overlays, meta
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && visible(el, cs) ? r : null; };
  // a real heading, not a screen-reader-only one (those are clipped to a pixel or two)
  let h1 = [...document.querySelectorAll("h1")].find((el) => { const r = vis(el); return r && r.width >= 40 && r.height >= 12 && el.textContent.trim(); });
  if (!h1) {
    let best = null, size = 0;
    for (const el of document.querySelectorAll("h2,h3,p,div,span,a")) {
      if (el.children.length > 2 || !el.textContent.trim()) continue;
      const r = vis(el); if (!r || r.top > innerHeight) continue;
      const fs = parseFloat(getComputedStyle(el).fontSize); if (fs > size) { size = fs; best = el; }
    }
    h1 = best;
  }
  // The heading's ink is what its visible letters are painted in (child spans often override the element's own color).
  const headline = h1 ? (() => {
    const inks = new Map(), w = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT), rg = document.createRange();
    for (let t = w.nextNode(); t; t = w.nextNode()) {
      if (!t.textContent.trim() || !t.parentElement) continue;
      const cs = getComputedStyle(t.parentElement); if (!visible(t.parentElement, cs)) continue;
      rg.selectNodeContents(t); let area = 0; for (const r of rg.getClientRects()) area += r.width * r.height;
      const c = textInk(t.parentElement, cs); if (!c || !area) continue;
      const v = add(inks, c.hex, area, { family: cs.fontFamily, weight: cs.fontWeight, size_px: parseFloat(cs.fontSize) });
    }
    const all = [...inks.entries()].sort((a, b) => b[1].n - a[1].n), sum = all.reduce((s, [, v]) => s + v.n, 0) || 1;
    const top = all[0]?.[1] || {};
    const box = h1.getBoundingClientRect();
    return { text: h1.textContent.trim().replace(/\s+/g, " ").slice(0, 90), tag: h1.tagName.toLowerCase(), ink_computed: all[0]?.[0] || null,
      rect: { x: Math.max(0, box.left), y: Math.max(0, box.top + scrollY), width: Math.min(box.width, innerWidth), height: Math.min(box.height, 2000) },
      inks: all.slice(0, 4).map(([hex, v]) => ({ hex, share: Math.round((v.n / sum) * 100) / 100 })), family: top.family || null, weight: top.weight || null, size_px: top.size_px || null };
  })() : null;

  // Buttons: the fill often sits on an inner element that covers the button (the outer one is transparent), and many
  // calls to action are plain links styled as filled pills. Both count; a link counts only when its fill stands
  // apart from the ground behind it and it has a button's size and a short label.
  const fillOf = (el) => {
    const cs = getComputedStyle(el);
    let c = rgba(cs.backgroundColor);
    if ((!c || c.a < 0.5) && cs.backgroundImage.includes("gradient")) c = rgba(firstColor(cs.backgroundImage));
    return c && c.a >= 0.5 ? { c, el, cs } : null;
  };
  const coverFill = (el, r) => {
    const own = fillOf(el); if (own) return own;
    const queue = [...el.children].map((k) => [k, 1]);
    while (queue.length) {
      const [k, depth] = queue.shift(); const kr = k.getBoundingClientRect();
      if (kr.width * kr.height >= 0.6 * r.width * r.height && visible(k, getComputedStyle(k))) { const f = fillOf(k); if (f) return f; }
      if (depth < 3) queue.push(...[...k.children].map((x) => [x, depth + 1]));
    }
    return null;
  };
  const groundBehind = (el) => { for (let a = el.parentElement; a; a = a.parentElement) { const f = fillOf(a); if (f) return f.c; } return pageGround; };
  const hexDist = (x, y) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const a = p(x), b = p(y); return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); };
  const btn = new Map(), counted = new Set(), buttonEls = [];
  const addButton = (el, kind) => {
    for (let a = el.parentElement; a; a = a.parentElement) if (counted.has(a)) return;
    const r = vis(el); if (!r) return;
    const f = coverFill(el, r); if (!f) return;
    const label = (el.tagName === "INPUT" ? el.value : el.textContent || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ");
    if (kind === "link") {
      if (!label || label.length > 60 || r.height < 20 || r.height > 140 || r.width > 640) return;
      if (hexDist(f.c.hex, groundBehind(el).hex) < 24) return;
    }
    buttonEls.push(el);
    counted.add(el);
    const radius = parseFloat(f.cs.borderRadius) || 0, fr = f.el.getBoundingClientRect();
    const v = add(btn, f.c.hex, r.width * r.height, { count: 0, kinds: {}, label_ink: rgba(f.cs.color)?.hex || rgba(getComputedStyle(el).color)?.hex || null,
      radius: f.cs.borderRadius, shape: radius > 0 && radius >= fr.height / 2 - 1 ? "pill" : radius > 0 ? "rounded" : "square", sample: label.slice(0, 40) });
    v.count++; v.kinds[kind] = (v.kinds[kind] || 0) + 1;
  };
  for (const el of document.querySelectorAll("button,[role=button],a[class*=btn i],a[class*=button i],a[class*=cta i],input[type=submit],input[type=button]")) addButton(el, "button");
  for (const el of document.querySelectorAll("a[href]")) if (!counted.has(el)) addButton(el, "link");

  // Interface strings exactly as written in the page (DOM text, not the case a style shows them in), so screens can be
  // rebuilt character for character in the page's own language.
  const ui = new Map();
  const addUi = (el, kind, raw) => {
    const text = (raw || "").replace(/\s+/g, " ").trim();
    if (!text || text.length > 200 || ui.size >= 400 || ui.has(`${kind}\u0000${text}`)) return;
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el), langEl = el.closest("[lang]");
    ui.set(`${kind}\u0000${text}`, { kind, text, where: hint(el), lang: langEl ? langEl.getAttribute("lang") : null, dir: cs.direction,
      in_first_screen: r.top < innerHeight && r.bottom > 0, ...(cs.textTransform && cs.textTransform !== "none" ? { shown_as: cs.textTransform } : {}) });
  };
  const each = (sel, kind, get) => { for (const el of document.querySelectorAll(sel)) if (vis(el)) addUi(el, kind, get(el)); };
  each("input[placeholder],textarea[placeholder]", "placeholder", (el) => el.getAttribute("placeholder"));
  each("button,[role=button],input[type=submit],input[type=button],input[type=reset]", "button", (el) => (el.tagName === "INPUT" ? el.value : el.textContent));
  for (const el of buttonEls) addUi(el, "button", el.tagName === "INPUT" ? el.value : el.textContent);
  each("nav a,header a,[role=navigation] a", "nav", (el) => el.textContent);
  each("h1,h2,h3", "heading", (el) => el.textContent);
  each("label", "label", (el) => el.textContent);
  each("[role=tab]", "tab", (el) => el.textContent);
  each("[role=menuitem],[role=option]", "menu", (el) => el.textContent);
  each("[aria-label]", "aria-label", (el) => el.getAttribute("aria-label"));
  each("[title]:not(link):not(style)", "title", (el) => el.getAttribute("title"));
  each("img[alt]", "alt", (el) => el.getAttribute("alt"));
  each("footer a", "footer", (el) => el.textContent);

  const logos = [], seen = new Set();
  const logoish = /logo|brand|wordmark/i;
  const candidates = [...document.querySelectorAll("header img, header svg, nav img, nav svg, a[href='/'] img, a[href='/'] svg, img[alt], img[class], svg[class], svg[aria-label], [id*=logo i] img, [id*=logo i] svg, [class*=logo i] img, [class*=logo i] svg")];
  for (const el of candidates) {
    if (logos.length >= 10 || seen.has(el)) continue;
    const label = [el.getAttribute("alt"), el.getAttribute("aria-label"), el.getAttribute("class"), el.id, el.closest("[class*=logo i],[id*=logo i]") ? "logo" : "", el.closest("header,nav") ? "header" : ""].join(" ");
    if (!logoish.test(label) && !el.closest("a[href='/']")) continue;
    const r = vis(el); if (!r) continue;
    seen.add(el);
    // the site's own mark usually sits in the header or links home; customer and partner logos elsewhere are not the brand's
    const place = { in_header: Boolean(el.closest("header,nav")), links_home: Boolean(el.closest("a[href='/'],a[href^='/?'],a[href='./']")), top_px: Math.round(r.top + scrollY) };
    if (el.tagName.toLowerCase() === "svg") {
      logos.push({ kind: "inline-svg", where: hint(el), label: (el.getAttribute("aria-label") || el.querySelector("title")?.textContent || "").trim().slice(0, 60),
        view_box: el.getAttribute("viewBox"), markup_chars: el.outerHTML.length, css_size: [Math.round(r.width), Math.round(r.height)], ...place });
    } else {
      const url = el.currentSrc || el.src;
      const res = performance.getEntriesByName(url)[0];
      logos.push({ kind: "image", where: hint(el), url, alt: (el.getAttribute("alt") || "").slice(0, 60), natural_size: [el.naturalWidth, el.naturalHeight],
        bytes: res && res.encodedBodySize ? res.encodedBodySize : null, css_size: [Math.round(r.width), Math.round(r.height)], ...place });
    }
  }
  logos.sort((a, b) => (b.links_home + b.in_header) - (a.links_home + a.in_header) || a.top_px - b.top_px);
  const icons = [...document.querySelectorAll("link[rel~=icon],link[rel=apple-touch-icon],link[rel=mask-icon],link[rel=manifest]")].slice(0, 8)
    .map((l) => ({ rel: l.getAttribute("rel"), url: l.href, sizes: l.getAttribute("sizes") || null }));

  const overlays = [];
  for (const el of document.querySelectorAll("body *")) {
    const cs = getComputedStyle(el); if (cs.position !== "fixed" || !visible(el, cs)) continue;
    const r = el.getBoundingClientRect();
    const share = (Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0)) * Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0))) / (innerWidth * innerHeight);
    if (share >= 0.25) overlays.push({ hint: hint(el), share: Math.round(share * 100) / 100 });
  }
  const meta = (sel, attr = "content") => document.querySelector(sel)?.getAttribute(attr) || null;
  const bodyText = (document.body?.innerText || "").trim();
  return {
    width: W, height_read: H, step, total, media, paint: [...paint.entries()], textArea, ink: [...ink.entries()], fam: [...fam.entries()],
    loadedFaces, tokens, headline, buttons: [...btn.entries()], logos, icons, overlays, scripts, ui_strings: [...ui.values()],
    meta: { title: document.title, lang: document.documentElement.lang || null, dir: document.documentElement.dir || getComputedStyle(document.documentElement).direction,
      browser_language: navigator.language || null, intl_locale: Intl.DateTimeFormat().resolvedOptions().locale || null, location: location.href,
      theme_color: meta("meta[name=theme-color]"), og_site_name: meta("meta[property='og:site_name']"), og_image: meta("meta[property='og:image']"),
      canonical: meta("link[rel=canonical]", "href") },
    text_chars: bodyText.length, text_head: bodyText.slice(0, 400), images: document.images.length, first_screen_chars: firstScreenChars,
  };
};

// ---------------------------------------------------------------- one ratio

async function captureRatio(b, o, ratio, outDir, host) {
  const p = PRESETS[ratio], dpr = p.dpr * o.scale;
  const { targetId } = await b.s.call("Target.createTarget", { url: "about:blank" });
  const { sessionId: sid } = await b.s.call("Target.attachToTarget", { targetId, flatten: true });
  const call = (m, params, ms) => b.s.call(m, params, sid, ms);
  // The last document response of the main frame is the page shown (a page script may load another one after the
  // first); every server redirect and every later document load of the main frame is a hop.
  let doc = null, lastDocUrl = null, docLoads = 0;
  const hops = [];
  const offDoc = b.s.listen("Network.responseReceived", (q) => {
    if (q.type === "Document" && q.frameId === targetId) doc = { status: q.response.status, url: q.response.url };
  }, sid);
  const offReq = b.s.listen("Network.requestWillBeSent", (q) => {
    if (q.frameId !== targetId || (q.type !== "Document" && q.requestId !== q.loaderId)) return;
    if (q.redirectResponse) hops.push({ from: q.redirectResponse.url, to: q.request.url, status: q.redirectResponse.status, by: "server" });
    else if (docLoads > 0 && lastDocUrl !== q.request.url) hops.push({ from: lastDocUrl, to: q.request.url, status: null, by: "page" });
    if (!q.redirectResponse) docLoads++;
    lastDocUrl = q.request.url;
  }, sid);
  const sheets = new Map();
  const offSheet = b.s.listen("CSS.styleSheetAdded", (q) => { sheets.set(q.header.styleSheetId, q.header.sourceURL || ""); }, sid);
  const idle = idleWatcher(b.s, sid);
  const language = { requested: o.lang || null, accept_language: o.acceptLanguage || null, locale_override: null };
  try {
    await call("Page.enable"); await call("Network.enable"); await call("Runtime.enable"); await call("DOM.enable"); await call("CSS.enable");
    await call("Emulation.setDeviceMetricsOverride", { width: p.width, height: p.height, deviceScaleFactor: dpr, mobile: p.mobile });
    if (p.mobile) await call("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
    if (o.lang) {
      // the browser's own user agent, unchanged; only the language it asks for changes
      await call("Emulation.setUserAgentOverride", { userAgent: b.userAgent, acceptLanguage: o.acceptLanguage });
      try { await call("Emulation.setLocaleOverride", { locale: o.lang.replace(/-/g, "_") }); language.locale_override = "set"; }
      catch (e) { language.locale_override = `not set (${e.message.slice(0, 80)})`; }
    }
    const loaded = new Promise((r) => { const off = b.s.listen("Page.loadEventFired", () => { off(); r(true); }, sid); setTimeout(() => { off(); r(false); }, o.timeout * 1000); });
    const nav = await call("Page.navigate", { url: o.url }, o.timeout * 1000);
    if (nav.errorText) return { ratio, blocked: `navigation failed: ${nav.errorText}` };
    const didLoad = await loaded;
    await idle.wait(600, 15000);
    let consent = [], consentChars = 0;
    if (await evaluate(b.s, sid, PAGE_CONSENT, { mode: o.consent, phase: "find" })) {
      await idle.wait(400, 5000); await sleep(400);
      // text of a dialog that is hidden below still counts for the empty-page check, as before this step existed
      consentChars = await evaluate(b.s, sid, () => (window.__iceConsent?.found || []).reduce((s, c) => s + (c.isConnected ? (c.innerText || "").trim().length : 0), 0));
      consent = await evaluate(b.s, sid, PAGE_CONSENT, { mode: o.consent, phase: "finish" });
    }
    if (o.hide.length) await evaluate(b.s, sid, PAGE_HIDE, o.hide);
    await evaluate(b.s, sid, PAGE_SCROLL, null, 90000);
    await idle.wait(600, 8000);
    await sleep(o.settle);
    const status = doc?.status ?? 0;
    const probe = await evaluate(b.s, sid, () => ({ title: document.title, text: (document.body?.innerText || "").trim().slice(0, 3000), images: document.images.length, href: location.href }));
    if (status >= 400) return { ratio, blocked: `the page answered HTTP ${status}` };
    if (BLOCK_WORDS.test(probe.title) || (probe.text.length < 2500 && BLOCK_WORDS.test(probe.text))) return { ratio, blocked: "a bot check or access wall is shown; never bypass it, ask the user for screens or another official page" };
    if (probe.text.length + consentChars < 40 && probe.images === 0) return { ratio, blocked: "the page is empty (a single-page app shell or a blocked load); try a press, blog or docs page of the same site" };
    const finalUrl = /^https?:/.test(probe.href || "") ? probe.href : doc?.url || o.url;
    if (lastDocUrl && finalUrl.replace(/#.*$/, "") !== lastDocUrl.replace(/#.*$/, "")) hops.push({ from: lastDocUrl, to: finalUrl, status: null, by: "history" });
    const redirect = { kind: redirectKind(o.url, finalUrl), requested_url: o.url, final_url: finalUrl, hops };

    const shots = [];
    const save = async (kind, params) => {
      const r = await call("Page.captureScreenshot", { format: "png", ...params }, 120000);
      const buf = Buffer.from(r.data, "base64");
      const file = `capture_${host}_${ratio.replace(":", "x")}_${kind}.png`;
      writeFileSync(join(outDir, file), buf);
      const size = pngSize(buf);
      shots.push({ ratio, kind, file, width: size.width, height: size.height, css_width: p.width, dpr, mobile: p.mobile, sha256: createHash("sha256").update(buf).digest("hex") });
      return { shot: shots[shots.length - 1], buf };
    };
    const view = await save("viewport", {});
    try {
      const img = decodePng(view.buf);
      if (img) { const f = flatShare(img); view.shot.flat_share = f.share; view.shot.flat_color = f.hex; }
    } catch { view.shot.flat_share = null; }
    const cap = Math.min(o.maxHeight, Math.floor(MAX_DEVICE_PX / dpr));
    const css = await readSheets(call, sheets, doc?.url || o.url);
    const read = await evaluate(b.s, sid, PAGE_READ, { cap, rawTokens: css.tokens }, 180000);
    read.faces = css.faces; read.sheetsRead = css.read; read.sheetsFailed = css.failed;
    // Nearly empty: one flat color over most of the first screen and almost no words on it (a sparse but real page
    // keeps its headline and copy on screen, so it is not flagged; a hidden consent dialog's words do not count).
    if (Number.isFinite(view.shot.flat_share)) {
      view.shot.first_screen_chars = read.first_screen_chars;
      view.shot.near_empty = view.shot.flat_share >= NEAR_EMPTY && read.first_screen_chars < 80;
    }
    const hr = read.headline?.rect;
    if (hr && hr.width >= 4 && hr.height >= 4) { // computed colors can differ from the pixels (overlays, blending): read the pixels too
      try {
        const clip = await call("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { ...hr, scale: 1 } }, 60000);
        const img = decodePng(Buffer.from(clip.data, "base64"));
        if (img) { const p = paintedInk(img); read.headline.ink_painted = p.inks[0]?.hex || null; read.headline.inks_painted = p.inks; read.headline.ground_painted = p.ground; }
      } catch { read.headline.ink_painted = null; }
    }
    if (o.full) {
      await evaluate(b.s, sid, PAGE_FLATTEN);
      const m = await call("Page.getLayoutMetrics");
      const full = m.cssContentSize || m.contentSize;
      const h = Math.min(Math.ceil(full.height), cap);
      try {
        const { shot } = await save("full", { captureBeyondViewport: true, clip: { x: 0, y: 0, width: p.width, height: h, scale: 1 } });
        shot.css_height = h; shot.truncated = full.height > cap;
      } catch (e) { shots.push({ ratio, kind: "full", error: e.message }); }
    }
    Object.assign(language, { page_lang: read.meta?.lang || null, page_dir: read.meta?.dir || null, browser_language: read.meta?.browser_language || null,
      intl_locale: read.meta?.intl_locale || null, text_scripts: read.scripts || {} }, languageCheck(o.lang, read.meta?.lang, read.scripts));
    return { ratio, status, final_url: finalUrl, loaded: didLoad, shots, read, redirect, consent, language };
  } finally {
    offDoc(); offReq(); offSheet(); idle.stop();
    await b.s.call("Target.closeTarget", { targetId }).catch(() => {});
  }
}

// ---------------------------------------------------------------- the sheet

const r4 = (v) => Math.round(v * 10000) / 10000;

function buildSheet(o, version, results) {
  const ok = results.filter((r) => !r.blocked);
  const paint = new Map(), ink = new Map(), fam = new Map(), btn = new Map(), faces = new Map(), tokens = new Map();
  let paintTotal = 0, inkTotal = 0, media = 0, samples = 0;
  const warnings = [], perRatio = {}, ui = new Map(), nearEmpty = [];
  for (const r of ok) {
    const d = r.read, unit = d.step * d.step;
    samples += d.total; media += d.media * unit;
    for (const [hex, v] of d.paint) {
      const e = paint.get(hex) || { area: 0, kinds: {} }; e.area += v.n * unit; paintTotal += v.n * unit;
      for (const [k, n] of Object.entries(v.kinds)) e.kinds[k] = (e.kinds[k] || 0) + n * unit;
      paint.set(hex, e);
    }
    for (const [hex, v] of d.ink) { ink.set(hex, (ink.get(hex) || 0) + v.n); inkTotal += v.n; }
    for (const [name, v] of d.fam) {
      const e = fam.get(name) || { area: 0, stack: v.stack, weights: {}, styles: {}, tags: {} }; e.area += v.n;
      for (const k of ["weights", "styles", "tags"]) for (const [w, n] of Object.entries(v[k])) e[k][w] = (e[k][w] || 0) + n;
      fam.set(name, e);
    }
    for (const [hex, v] of d.buttons) {
      const e = btn.get(hex) || { area: 0, count: 0, kinds: {}, label_ink: v.label_ink, radius: v.radius, shape: v.shape, sample: v.sample };
      e.area += v.n; e.count += v.count; for (const [k, n] of Object.entries(v.kinds || {})) e.kinds[k] = (e.kinds[k] || 0) + n; btn.set(hex, e);
    }
    for (const f of d.faces) faces.set(`${f.family}|${f.weight}|${f.style}`, f);
    for (const t of d.tokens) tokens.set(t.name, t);
    for (const s of d.ui_strings || []) {
      const k = `${s.kind}\u0000${s.text}`, e = ui.get(k);
      if (e) { if (!e.ratios.includes(r.ratio)) e.ratios.push(r.ratio); e.in_first_screen ||= s.in_first_screen; } else ui.set(k, { ...s, ratios: [r.ratio] });
    }
    for (const ov of d.overlays) warnings.push(`${r.ratio}: a fixed layer covers ${Math.round(ov.share * 100)}% of the viewport (${ov.hint}); if it is a dialog the script did not answer (consent or promo), rerun with --hide '${ov.hint}' (never click Accept)`);
    if (d.sheetsFailed) warnings.push(`${r.ratio}: ${d.sheetsFailed} style sheet(s) could not be read; color tokens and @font-face lists may be incomplete`);
    if (!r.loaded) warnings.push(`${r.ratio}: the load event did not fire within ${o.timeout} s; the capture shows the page as it was`);
    // redirects: the capture shows the final page, which may not be the page asked for
    const rd = r.redirect;
    if (rd?.kind === "other-host") warnings.push(`${r.ratio}: REDIRECT to another host: asked for ${rd.requested_url}, the browser ended on ${rd.final_url}. The capture shows that page, not the one asked for. If it is an app, web player, sign-in, download or region page rather than the brand's marketing site, do not use it as the brand sheet's main page: rerun with --url set to the brand's own marketing or product page (from the research note, or the site's own navigation or footer) and log the choice`);
    else if (rd?.kind === "same-site") warnings.push(`${r.ratio}: REDIRECT on the same site: asked for ${rd.requested_url}, the browser ended on ${rd.final_url} (often a region or language path). Check that this is the page the film needs before using it`);
    // language: what was asked, what the page declared, which script its text is in
    const lg = r.language;
    if (lg && !lg.requested && r === ok[0]) warnings.push(`${r.ratio}: no --lang given, so the browser default (${lg.browser_language || "unknown"}) was sent and the page declared '${lg.page_lang || "no lang"}'. For a film in another language, rerun with --lang <the film's language tag from the brief>`);
    else if (lg && lg.match === false) warnings.push(`${r.ratio}: LANGUAGE: asked for ${lg.requested} but the page declared '${lg.page_lang || "no lang"}'${lg.expected_script ? ` and ${Math.round((lg.expected_script_share || 0) * 100)}% of its text is in the ${lg.expected_script} script` : ""}. The site may pick its language by address or region: look in its own language or region switcher (header or footer) for this language's address, pass that with --url and keep --lang`);
    if (lg?.locale_override && lg.locale_override !== "set") warnings.push(`${r.ratio}: the browser locale could not be set to ${lg.requested}: ${lg.locale_override}; the Accept-Language header was still sent`);
    for (const c of r.consent || []) {
      if (c.action === "hidden" && o.consent === "decline") warnings.push(`${r.ratio}: a cookie or consent dialog (${c.where}) had no reject or necessary-only button; it was hidden, not answered${c.offered.length ? ` (it offered: ${c.offered.join(" | ")})` : ""}`);
      if (c.action === "found" || (c.still_visible && o.consent === "leave")) warnings.push(`${r.ratio}: a cookie or consent dialog (${c.where}) is still on screen (--consent ${o.consent}); the shots show it`);
    }
    for (const s of (r.shots || []).filter((x) => x.near_empty)) {
      nearEmpty.push(s.file);
      warnings.push(`${r.ratio}: NEARLY EMPTY: ${Math.round(s.flat_share * 100)}% of ${s.file} is one flat color (${s.flat_color}). It looks like an empty app shell, a loading screen or a page that needs sign-in. Open the file and look: if it is empty, do not use it; capture the brand's marketing or product page at this ratio instead, or rerun with a longer --settle`);
    }
    const top = (m) => [...m].sort((a, b) => b[1].n - a[1].n).slice(0, 5).map(([hex]) => hex);
    perRatio[r.ratio] = { status: r.status, final_url: r.final_url, redirect: r.redirect, language: r.language, consent: r.consent,
      near_empty: (r.shots || []).some((x) => x.near_empty), top_colors: top(d.paint), top_text_colors: top(d.ink), headline: d.headline, text_chars: d.text_chars };
  }
  const share = (n, t) => (t ? r4(n / t) : 0);
  const sortBy = (m, f) => [...m.entries()].sort((a, b) => f(b[1]) - f(a[1]));
  const first = ok[0]?.read;
  const logos = new Map(); for (const r of ok) for (const l of r.read.logos) logos.set(l.url || `${l.where}|${l.view_box}`, l);
  const allOk = ok.length === results.length && ok.length > 0;
  const firstRedirect = ok.find((r) => r.redirect && r.redirect.kind !== "none")?.redirect || ok[0]?.redirect || null;
  const lg = ok[0]?.language || { requested: o.lang || null, accept_language: o.acceptLanguage || null };
  return {
    tool: "capture-brand.mjs", sheet_version: 2, ok: allOk, result: !allOk ? "blocked" : nearEmpty.length ? "partial" : "ok",
    blocked: results.filter((r) => r.blocked).map((r) => ({ ratio: r.ratio, reason: r.blocked })),
    near_empty_shots: nearEmpty,
    url: o.url, final_url: ok[0]?.final_url || null, status: ok[0]?.status ?? null, captured_at: new Date().toISOString(), browser: version,
    redirected: Boolean(firstRedirect && firstRedirect.kind !== "none"), redirect: firstRedirect,
    language: { requested: lg.requested ?? null, accept_language: lg.accept_language ?? null, locale_override: lg.locale_override ?? null,
      page_lang: lg.page_lang ?? null, page_dir: lg.page_dir ?? null, browser_language: lg.browser_language ?? null, intl_locale: lg.intl_locale ?? null,
      expected_script: lg.expected_script ?? null, expected_script_share: lg.expected_script_share ?? null, text_scripts: lg.text_scripts || {}, match: lg.match ?? null },
    consent_mode: o.consent,
    notice: "Live captures for reference and side-by-side fidelity checks only. Images, logos and webfonts on the page belong to the site owner; nothing was downloaded beyond loading the page. Colors are computed sRGB values; headline.ink_painted is read from the pixels and wins when it differs from ink_computed. Confirm brand colors against the brand's own guidelines or files before locking them. ui_strings are the page's own words as written in its markup (shown_as names a case change made by style); copy them character for character, never retype them from a screenshot. Captured screens can show other rights holders' content (cover art, names, photos, user posts); see brand-authenticity.md section 11.2.",
    shots: results.flatMap((r) => r.shots || []),
    colors: sortBy(paint, (v) => v.area).slice(0, 16).map(([hex, v]) => ({ hex, share: share(v.area, paintTotal), as: Object.fromEntries(Object.entries(v.kinds).map(([k, n]) => [k, share(n, v.area)])) })),
    media_share: share(media, media + paintTotal),
    text_colors: sortBy(ink, (v) => v).slice(0, 10).map(([hex, n]) => ({ hex, share: share(n, inkTotal) })),
    fonts: sortBy(fam, (v) => v.area).slice(0, 10).map(([family, v]) => ({
      family, stack: v.stack, text_share: share(v.area, inkTotal || 1),
      weights: Object.fromEntries(sortBy(new Map(Object.entries(v.weights)), (n) => n).map(([w, n]) => [w, share(n, v.area)])),
      styles: Object.fromEntries(Object.entries(v.styles).map(([s, n]) => [s, share(n, v.area)])),
      used_for: sortBy(new Map(Object.entries(v.tags)), (n) => n).slice(0, 5).map(([t]) => t),
    })),
    font_faces: [...faces.values()],
    fonts_loaded: first?.loadedFaces || [],
    color_tokens: [...tokens.values()],
    headline: first?.headline || null,
    buttons: sortBy(btn, (v) => v.area).slice(0, 6).map(([hex, v]) => ({ hex, count: v.count, kinds: v.kinds, label_ink: v.label_ink, radius: v.radius, shape: v.shape, sample: v.sample })),
    ui_strings: [...ui.values()],
    logo_candidates: [...logos.values()],
    icons: first?.icons || [],
    meta: first?.meta || null,
    per_ratio: perRatio,
    samples,
    warnings,
  };
}

// ---------------------------------------------------------------- main

async function main() {
  const o = parseArgs(process.argv.slice(2));
  const exe = findBrowser();
  if (!exe) { console.error("capture-brand: no Chrome, Chromium or Edge found; set ICE_CHROME to the browser executable"); process.exit(1); }
  const outDir = resolve(o.out); mkdirSync(outDir, { recursive: true });
  const host = new URL(o.url).hostname.toLowerCase().replace(/^www\./, "").replace(/[^a-z0-9]+/g, "-");
  const sheetFile = o.sheet ? resolve(o.sheet) : join(outDir, "brand-sheet.json");
  const b = await startBrowser(exe, o.lang);
  const results = [];
  try {
    for (const ratio of o.ratios) {
      try { results.push(await captureRatio(b, o, ratio, outDir, host)); }
      catch (e) { results.push({ ratio, blocked: `capture failed: ${e.message}` }); }
    }
  } finally { await b.close(); }
  const sheet = buildSheet(o, b.version, results);
  sheet.shots_folder = outDir;
  mkdirSync(dirname(sheetFile), { recursive: true });
  writeFileSync(sheetFile, JSON.stringify(sheet, null, 2) + "\n");
  if (o.json) console.log(JSON.stringify(sheet, null, 2));
  else {
    for (const s of sheet.shots) console.log(s.error ? `  FAIL  ${s.ratio} ${s.kind}: ${s.error}` : `  shot  ${s.file}  ${s.width}x${s.height}${s.truncated ? "  (cut at --max-height)" : ""}${s.near_empty ? "  (nearly empty)" : ""}`);
    for (const c of sheet.colors.slice(0, 6)) console.log(`  color ${c.hex}  ${(c.share * 100).toFixed(1)}% of painted area`);
    for (const f of sheet.fonts.slice(0, 4)) console.log(`  font  ${f.family}  weights ${Object.keys(f.weights).join("/")}  ${(f.text_share * 100).toFixed(1)}% of text`);
    for (const x of sheet.buttons.slice(0, 3)) console.log(`  button ${x.hex}  ${x.count}x  ${x.shape}  "${x.sample}"`);
    console.log(`  lang  asked ${sheet.language.requested || "(browser default)"}, page declared ${sheet.language.page_lang || "nothing"}, ${sheet.ui_strings.length} interface string(s)`);
    if (sheet.redirected) console.log(`  redirect  ${sheet.redirect.requested_url} -> ${sheet.redirect.final_url} (${sheet.redirect.kind})`);
    for (const w of sheet.warnings) console.log(`  WARN  ${w}`);
    for (const x of sheet.blocked) console.log(`  STOP  ${x.ratio}: ${x.reason}`);
    console.log(!sheet.ok ? `BRAND: BLOCKED   do not build from partial files; see ${sheetFile}`
      : sheet.result === "partial" ? `BRAND: PARTIAL   ${sheet.near_empty_shots.length} shot(s) nearly empty (${sheet.near_empty_shots.join(", ")}): never use them; the other shots and ${sheetFile} are usable`
      : `BRAND: OK   ${sheet.shots.length} shot(s) in ${outDir}, sheet ${sheetFile}`);
  }
  process.exit(sheet.ok ? 0 : 1);
}

const samePath = (a, b) => (process.platform === "win32" ? a.toLowerCase() === b.toLowerCase() : a === b);
if (process.argv[1] && samePath(resolve(process.argv[1]), fileURLToPath(import.meta.url))) {
  main().catch((e) => { console.error(`capture-brand: ${e.message}`); process.exit(1); });
}
