// ice-assets fixes: capture-brand.mjs (page language, buttons, redirects, consent dialogs, nearly empty shots,
// interface strings, sheet location) on local fixture pages served from 127.0.0.1 (no real network), and
// validate-assets.mjs (brand sheets at the old and new places, code-built rebuilds of several captures).
// The capture tests skip when no Chrome, Chromium or Edge is found (set ICE_CHROME). Run: node --test tests/
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, before, describe, test } from "node:test";
import { pathToFileURL } from "node:url";
import { abs } from "./helpers.mjs";

const CAPTURE = abs("skills/ice-assets/scripts/capture-brand.mjs");
const VALIDATE = abs("skills/ice-assets/scripts/validate-assets.mjs");
const cap = await import(pathToFileURL(CAPTURE).href);
const val = await import(pathToFileURL(VALIDATE).href);
const BROWSER = cap.findBrowser();

const work = mkdtempSync(join(tmpdir(), "ice assets fixes "));
after(() => rmSync(work, { recursive: true, force: true, maxRetries: 3 }));

// ---------------------------------------------------------------- pure helpers

test("language helpers: canonical tags, Accept-Language, expected script, page check", () => {
  assert.equal(cap.canonicalTag("ar-eg"), "ar-EG");
  assert.equal(cap.canonicalTag("ZH-hant-tw"), "zh-Hant-TW");
  assert.equal(cap.acceptLanguage("ar-EG"), "ar-EG,ar;q=0.9");
  assert.equal(cap.acceptLanguage("de"), "de");
  assert.equal(cap.expectedScript("ar-EG"), "Arabic");
  assert.equal(cap.expectedScript("sr-Latn"), "Latin");
  assert.equal(cap.expectedScript("xx"), null);
  assert.equal(cap.languageCheck("ar-EG", "ar", { Arabic: 80, Latin: 20 }).match, true);
  assert.equal(cap.languageCheck("ar-EG", "en", { Latin: 100 }).match, false);
  assert.equal(cap.languageCheck("ar", null, { Latin: 95, Arabic: 5 }).match, false, "script share alone catches a page that ignores the language");
  assert.equal(cap.languageCheck(null, "en", { Latin: 1 }).match, null);
});

test("redirect kinds", () => {
  assert.equal(cap.redirectKind("https://a.test/", "https://a.test/"), "none");
  assert.equal(cap.redirectKind("http://www.a.test/", "https://a.test"), "same-page");
  assert.equal(cap.redirectKind("https://a.test/", "https://a.test/xx-yy/"), "same-site");
  assert.equal(cap.redirectKind("https://a.test/", "https://open.a.test/"), "other-host");
});

test("flat share finds a one-color picture", () => {
  const w = 40, h = 40, px = Buffer.alloc(w * h * 3, 18);
  assert.ok(cap.flatShare({ width: w, height: h, channels: 3, px }).share > 0.99);
  for (let i = 0; i < px.length / 2; i++) px[i] = (i * 37) % 255;
  assert.ok(cap.flatShare({ width: w, height: h, channels: 3, px }).share < 0.9);
});

// ---------------------------------------------------------------- validate-assets

function project(name, manifest, files = {}) {
  const dir = join(work, name);
  for (const [p, body] of Object.entries(files)) { mkdirSync(dirname(join(dir, p)), { recursive: true }); writeFileSync(join(dir, p), body); }
  mkdirSync(join(dir, "ice", "assets"), { recursive: true });
  writeFileSync(join(dir, "ice", "assets", "manifest.json"), JSON.stringify({ version: 1, assets: manifest }));
  writeFileSync(join(dir, "ice", "state.json"), JSON.stringify({ commercial_use: "no" }));
  return dir;
}
const run = (dir) => val.validate({ project: dir, manifestPath: join(dir, "ice", "assets", "manifest.json"), statePath: join(dir, "ice", "state.json"),
  creditsPath: join(dir, "ice", "assets", "CREDITS.md"), scanDirs: [join(dir, "assets"), join(dir, "ice", "assets")] });
const sheet = JSON.stringify({ tool: "capture-brand.mjs", sheet_version: 2, ok: true });
const captureRow = (id, path) => ({ id, role: "ui", path, source: { type: "official-site", url: "https://brand.test/page" },
  rights: { owner: "<owner>", license: "proprietary", license_url: "https://brand.test/terms", use: "reference" }, authenticity: "verified" });
const rebuildRow = (id, against, fidelity, path = "film/js/ui.js") => ({ id, role: "ui", path, source: { type: "code-built", script: path },
  verified_against: against, fidelity, rights: { owner: "<owner>", use: "concept" }, authenticity: "verified" });
const PNG = Buffer.from("89504e470d0a1a0a", "hex");

describe("validate-assets: brand sheet location", () => {
  test("a capture-brand sheet next to its captures (old place) and one in ice/assets/captures (new place) need no row", () => {
    const dir = project("sheets", [captureRow("c1", "assets/capture/brand/shot.png")], {
      "assets/capture/brand/shot.png": PNG, "assets/capture/brand/brand-sheet.json": sheet, "ice/assets/captures/brand/home.json": sheet,
    });
    const r = run(dir);
    assert.equal(r.status, "PASS", r.problems.join("\n"));
  });
  test("any other JSON file in assets/ still needs a row", () => {
    const dir = project("other-json", [], { "assets/data/table.json": JSON.stringify({ rows: [] }) });
    const r = run(dir);
    assert.equal(r.status, "FAIL");
    assert.match(r.problems.join("\n"), /assets\/data\/table\.json/);
  });
});

describe("validate-assets: code-built rebuilds of several captures", () => {
  const files = { "film/js/ui.js": "//", "assets/capture/b/one.png": PNG, "assets/capture/b/two.png": PNG, "ice/review/fidelity/one_share.png": PNG };
  const base = [captureRow("c1", "assets/capture/b/one.png"), captureRow("c2", "assets/capture/b/two.png")];
  const fid = (against, score, extra = {}) => ({ against, score, checked_by: "critic", sheet: "temp/fidelity/x.png", ...extra });

  test("old form still passes", () => {
    const r = run(project("old-form", [...base, rebuildRow("r1", "assets/capture/b/one.png", { score: 1, checked_by: "critic", sheet: "s.png" })], files));
    assert.equal(r.status, "PASS", r.problems.join("\n"));
    assert.match(r.warnings.join("\n"), /share_sheet/);
  });
  test("a list of captures with one fidelity entry each passes", () => {
    const r = run(project("list-form", [...base, rebuildRow("r1", ["assets/capture/b/one.png", "assets/capture/b/two.png"],
      [fid("assets/capture/b/one.png", 1, { share_sheet: "ice/review/fidelity/one_share.png" }), fid("assets/capture/b/two.png", 0.9)])], files));
    assert.equal(r.status, "PASS", r.problems.join("\n"));
  });
  test("a capture without its own entry, a low score, a missing capture or a single object fails", () => {
    let r = run(project("list-missing", [...base, rebuildRow("r1", ["assets/capture/b/one.png", "assets/capture/b/two.png"], [fid("assets/capture/b/one.png", 1)])], files));
    assert.match(r.problems.join("\n"), /no entry whose 'against' is the capture 'assets\/capture\/b\/two\.png'/);
    r = run(project("list-low", [...base, rebuildRow("r1", ["assets/capture/b/one.png", "assets/capture/b/two.png"], [fid("assets/capture/b/one.png", 1), fid("assets/capture/b/two.png", 0.7)])], files));
    assert.match(r.problems.join("\n"), /fidelity 0\.7 for 'assets\/capture\/b\/two\.png'/);
    r = run(project("list-gone", [...base, rebuildRow("r1", ["assets/capture/b/one.png", "assets/capture/b/three.png"], [fid("assets/capture/b/one.png", 1), fid("assets/capture/b/three.png", 1)])], files));
    assert.match(r.problems.join("\n"), /capture 'assets\/capture\/b\/three\.png' does not exist/);
    r = run(project("list-single", [...base, rebuildRow("r1", ["assets/capture/b/one.png", "assets/capture/b/two.png"], { score: 1 })], files));
    assert.match(r.problems.join("\n"), /fidelity is a single object/);
  });
  test("rows rebuilding different captures may share the code file; the same capture twice or a non-rebuild may not", () => {
    let r = run(project("share-ok", [...base, rebuildRow("r1", "assets/capture/b/one.png", { score: 1 }), rebuildRow("r2", "assets/capture/b/two.png", { score: 0.95 })], files));
    assert.equal(r.status, "PASS", r.problems.join("\n"));
    r = run(project("share-same", [...base, rebuildRow("r1", "assets/capture/b/one.png", { score: 1 }), rebuildRow("r2", "assets/capture/b/one.png", { score: 1 })], files));
    assert.match(r.problems.join("\n"), /rebuilds the same capture as asset 'r1'/);
    r = run(project("share-bad", [captureRow("c1", "assets/capture/b/one.png"), captureRow("c1b", "assets/capture/b/one.png"), captureRow("c2", "assets/capture/b/two.png")], files));
    assert.match(r.problems.join("\n"), /lists the same file as asset 'c1'/);
  });
  test("a share_sheet that is not a file fails", () => {
    const r = run(project("share-missing", [...base, rebuildRow("r1", "assets/capture/b/one.png", { score: 1, sheet: "s.png", share_sheet: "ice/review/fidelity/none.png" })], files));
    assert.match(r.problems.join("\n"), /share_sheet 'ice\/review\/fidelity\/none\.png' is not a file/);
  });
});

// ---------------------------------------------------------------- capture-brand on fixture pages

const hits = { accepted: 0, declined: 0 };
let server, port;

const BANNER = (offerReject) => `<div id="cookie-banner" style="position:fixed;left:0;right:0;bottom:0;padding:16px;background:#202020;color:#fff;font:16px sans-serif">
  We use cookies to improve this site.
  <button onclick="fetch('/accepted');document.cookie='consent=all';this.parentNode.remove()">Accept all</button>
  ${offerReject ? `<button onclick="fetch('/declined');document.cookie='consent=none';this.parentNode.remove()">Reject all</button>` : `<button>Settings</button>`}
</div>`;

function appPage(arabic, cookie) {
  const t = arabic
    ? { lang: "ar", dir: "rtl", h1: "مرحبا بكم في الموقع", ph: "ابحث هنا عمّا تريد", cta: "ابدأ الآن", sign: "إنشاء حساب", nav: "الأسعار", p: "نص تجريبي يصف الخدمة بالعربية لصفحة الاختبار المحلية." }
    : { lang: "en", dir: "ltr", h1: "Welcome to the site", ph: "Search for anything", cta: "Get started", sign: "Sign up", nav: "Pricing", p: "Sample text that describes the service on a local test page." };
  return `<!doctype html><html lang="${t.lang}" dir="${t.dir}"><head><meta charset="utf-8"><title>${t.h1}</title></head>
<body style="margin:0;background:#ffffff;color:#111;font:18px sans-serif">
<header><nav><a href="/pricing">${t.nav}</a></nav></header>
<main style="padding:40px">
<h1 style="font-size:48px">${t.h1}</h1><p>${t.p}</p>
<input placeholder="${t.ph}" style="width:300px;padding:10px">
<p><a class="Button-sc-x1" href="/plans" style="display:inline-block"><span class="ButtonInner-sc-y2" style="display:inline-block;background:#1ed760;color:#000;border-radius:500px;padding:14px 32px">${t.cta}</span></a></p>
<p><a href="/signup" style="display:inline-block;background:#e91429;color:#fff;border-radius:8px;padding:12px 24px">${t.sign}</a></p>
<p><a href="/about">About</a></p>
</main>${/consent=/.test(cookie || "") ? "" : BANNER(true)}</body></html>`;
}
const shellPage = (cookie) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>App</title></head>
<body style="margin:0;background:#121212;min-height:100vh"><div id="root"></div>${/consent=/.test(cookie || "") ? "" : BANNER(false)}</body></html>`;

before(async () => {
  if (!BROWSER) return;
  server = createServer((req, res) => {
    const url = new URL(req.url, "http://127.0.0.1");
    const html = (body) => { res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); res.end(body); };
    if (url.pathname === "/accepted" || url.pathname === "/declined") { hits[url.pathname.slice(1)]++; res.writeHead(204); return res.end(); }
    if (url.pathname === "/home") { res.writeHead(302, { location: `http://localhost:${port}/app` }); return res.end(); }
    if (url.pathname === "/app") return html(appPage(/^ar\b/i.test(req.headers["accept-language"] || ""), req.headers.cookie));
    if (url.pathname === "/shell") return html(shellPage(req.headers.cookie));
    res.writeHead(404); res.end();
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  port = server.address().port;
});
after(() => server?.close());

function capture(...args) {
  return new Promise((done) => {
    const p = spawn(process.execPath, [CAPTURE, "--ratios", "16:9", "--no-full", "--settle", "0", "--timeout", "30", ...args], { stdio: ["ignore", "pipe", "pipe"] });
    let out = ""; p.stdout.on("data", (d) => (out += d)); p.stderr.on("data", (d) => (out += d));
    p.on("exit", (code) => done({ code, out }));
  });
}
const skip = BROWSER ? false : "no Chrome, Chromium or Edge found (set ICE_CHROME)";

describe("capture-brand on local fixture pages", { skip, timeout: 240000 }, () => {
  test("language, redirect, buttons, interface strings, consent decline and --sheet", async () => {
    const out = join(work, "cap one"), sheetFile = join(work, "proj", "ice", "assets", "captures", "brand", "home.json");
    const r = await capture("--url", `http://127.0.0.1:${port}/home`, "--out", out, "--lang", "ar-EG", "--ratios", "9:16", "--sheet", sheetFile);
    assert.equal(r.code, 0, r.out);
    assert.ok(existsSync(sheetFile), "the sheet goes to --sheet");
    assert.ok(!existsSync(join(out, "brand-sheet.json")), "and not next to the shots");
    const s = JSON.parse(readFileSync(sheetFile, "utf8"));
    assert.equal(s.language.requested, "ar-EG");
    assert.equal(s.language.accept_language, "ar-EG,ar;q=0.9");
    assert.equal(s.language.page_lang, "ar");
    assert.equal(s.language.match, true);
    assert.equal(s.redirected, true);
    assert.equal(s.redirect.kind, "other-host");
    assert.match(s.redirect.final_url, /^http:\/\/localhost:\d+\/app/);
    assert.ok(s.redirect.hops.some((h) => h.by === "server" && h.status === 302));
    assert.match(s.warnings.join("\n"), /REDIRECT to another host/);
    const hexes = s.buttons.map((b) => b.hex);
    assert.ok(hexes.includes("#1ed760"), `inner fill of a button link found: ${hexes}`);
    assert.ok(hexes.includes("#e91429"), `filled plain link found: ${hexes}`);
    assert.equal(s.buttons.find((b) => b.hex === "#1ed760").shape, "pill");
    assert.ok(s.ui_strings.some((u) => u.kind === "placeholder" && u.text === "ابحث هنا عمّا تريد"), "the placeholder is exported character for character");
    assert.ok(s.ui_strings.some((u) => u.kind === "button" && u.text === "ابدأ الآن"));
    assert.ok(s.ui_strings.some((u) => u.kind === "nav" && u.text === "الأسعار"));
    const consent = s.per_ratio["9:16"].consent;
    assert.equal(consent[0].action, "declined");
    assert.equal(consent[0].label, "Reject all");
    assert.equal(hits.accepted, 0, "never accepted");
    assert.ok(hits.declined >= 1, "declined through the dialog's own button");
    assert.equal(s.result, "ok", "a sparse page with its headline and copy is not reported as empty");
  });

  test("a page that ignores the asked language is flagged; the sheet stays next to the shots by default", async () => {
    const out = join(work, "cap two");
    const r = await capture("--url", `http://127.0.0.1:${port}/app`, "--out", out, "--lang", "fr");
    assert.equal(r.code, 0, r.out);
    const s = JSON.parse(readFileSync(join(out, "brand-sheet.json"), "utf8"));
    assert.equal(s.language.match, false);
    assert.match(s.warnings.join("\n"), /LANGUAGE: asked for fr but the page declared 'en'/);
    assert.equal(s.redirected, false);
  });

  test("a nearly empty shell is reported as partial; a dialog without a reject button is hidden, never accepted", async () => {
    const out = join(work, "cap three"), before = hits.accepted;
    const r = await capture("--url", `http://127.0.0.1:${port}/shell`, "--out", out);
    assert.equal(r.code, 0, r.out);
    assert.match(r.out, /BRAND: PARTIAL/);
    const s = JSON.parse(readFileSync(join(out, "brand-sheet.json"), "utf8"));
    assert.equal(s.result, "partial");
    assert.equal(s.near_empty_shots.length, 1);
    assert.match(s.warnings.join("\n"), /NEARLY EMPTY/);
    assert.match(s.warnings.join("\n"), /no --lang given/);
    assert.equal(s.per_ratio["16:9"].consent[0].action, "hidden");
    assert.equal(hits.accepted, before, "an accept-only dialog is never clicked");
  });
});
