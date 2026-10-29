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
import { abs, readText, repoFiles } from "./helpers.mjs";

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

describe("validate-assets: rights are the user's (sourcing-and-licenses.md section 0)", () => {
  const found = (id, rights) => ({ id, role: "footage", path: `assets/footage/${id}.mp4`,
    source: { type: "web-found", url: "https://agency.test/clip" }, rights: { owner: "<agency>", ...rights } });
  test("unknown, to-buy and noncommercial items pass and are listed as needing a license", () => {
    const dir = project("found", [found("a", { license_status: "unknown" }), found("b", { license_status: "needs purchase" }),
      found("c", { license: "CC-BY-NC-4.0", license_url: "https://creativecommons.org/licenses/by-nc/4.0/", attribution: "x" })],
      { "assets/footage/a.mp4": PNG, "assets/footage/b.mp4": PNG, "assets/footage/c.mp4": PNG, "ice/assets/CREDITS.md": "| c.mp4 |" });
    writeFileSync(join(dir, "ice", "state.json"), JSON.stringify({ commercial_use: "yes" }));
    const r = run(dir);
    assert.equal(r.status, "PASS", r.problems.join("\n"));
    assert.equal(r.licenses.length, 3, r.licenses.join("\n"));
    assert.match(r.licenses.join("\n"), /needs a license before publishing \(https:\/\/agency\.test\/clip\)/);
  });
  test("a web-found row still records its source, owner and status", () => {
    const dir = project("found-bare", [{ id: "d", role: "footage", path: "assets/footage/d.mp4", source: { type: "web-found" }, rights: {} }],
      { "assets/footage/d.mp4": PNG });
    const r = run(dir);
    assert.equal(r.status, "FAIL");
    assert.match(r.problems.join("\n"), /source\.url[\s\S]*rights\.owner[\s\S]*license_status/);
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

// ---------------------------------------------------------------- sources: real first, standing consent (lessons 2 and 8)
// Owner decision, 2026-10-29: sourcing-and-licenses.md is the one home of the per-need ladder, the standing consent for
// free downloads, sources.json, the footage order, the download resolution and the site-terms line.

const SOURCING = "skills/ice-assets/references/sourcing-and-licenses.md";
const section = (text, head, next) => {
  const at = text.indexOf(`\n## ${head}`);
  assert.ok(at >= 0, `section ${head} not found`);
  const end = text.indexOf(`\n## ${next}`, at + 4);
  return text.slice(at, end < 0 ? undefined : end);
};
const rowOf = (s, start) => {
  const line = s.split(/\r?\n/).find((l) => l.startsWith(`| ${start}`));
  assert.ok(line, `ladder row '${start}' not found`);
  return line.split("|").slice(1, -1).map((c) => c.trim());
};

describe("sources: real first, code last (sourcing-and-licenses.md)", () => {
  const text = readText(SOURCING);

  test("the ladder puts real items before code for footage, photos, overlays and sound; code is first only for its listed needs", () => {
    const s1 = section(text, "1. ", "1a. ");
    assert.match(s1, /Code is first only where code is the real thing:\*\* text, numbers, charts, UI, signature mechanisms, map and globe rendering, glitch and grain/);
    assert.doesNotMatch(text, /Code first, captured or supplied asset second/, "the old single order is gone");
    for (const need of ["News and event footage", "A person, place, action or emotion outside the news", "Photos of real people", "Real-matter overlays"]) {
      const [, first, ...rest] = rowOf(s1, need);
      assert.doesNotMatch(first, /code/i, `${need}: rung 1 is real, not code`);
      assert.match(first, /user's/, `${need}: rung 1 is the user's own material`);
      const codeAt = rest.findIndex((c) => /code/i.test(c));
      if (codeAt >= 0) assert.ok(rest.slice(0, codeAt).some((c) => /real|official|Wikidata|archive|CC|stock/i.test(c)), `${need}: a real rung comes before code`);
    }
    const overlays = rowOf(s1, "Real-matter overlays").join(" | ");
    assert.ok(overlays.indexOf("Real filmed elements") < overlays.indexOf("made in code"), "real filmed overlays before code-made ones");
    assert.match(overlays, /Code dust, smoke or fire: never as a hero element/);
    const sound = rowOf(s1, "Music and SFX").join(" | ");
    assert.match(sound, /ice-audio skill, `SKILL\.md`/, "music and SFX point to the ladders in ice-audio");
    assert.match(sound, /sound made by code only when the user asks for it in their own words/);
    assert.match(rowOf(s1, "Text, numbers, charts, UI")[1], /^Built in code/);
    assert.match(rowOf(s1, "Glitch and grain")[1], /^Code, generated at render time/);
    assert.match(s1, /\*\*Ice does this search by itself\.\*\* For every scene that shows a real event, statement, place, person or object/);
  });

  test("section 0: free no-account downloads need no yes; sign-ins and spending still do", () => {
    const s0 = section(text, "0. ", "1. ");
    assert.match(s0, /Free downloads that need no account are no longer behind a yes \(standing consent below, owner decision, 2026-10-29\)/);
    assert.match(s0, /sign-ins, accounts, subscriptions and spending still need a yes inside the router's stops \(`ice-motion-director\/SKILL\.md` section 5, "Stops"/);
    assert.doesNotMatch(s0, /downloads, sign-ins and spending still need a yes/, "the old download stop is gone");
    const skill = readText("skills/ice-assets/SKILL.md");
    assert.match(skill, /Free downloads without a question; ask before signing in or spending/);
    assert.doesNotMatch(skill, /Unknown license means do not ship/);
  });

  test("sources.json is documented once, with its downloads values, and keys never sit in a project", () => {
    const s0 = section(text, "0. ", "1. ");
    assert.match(s0, /`~\/\.ice-motion-director\/sources\.json`/);
    const row = s0.split(/\r?\n/).find((l) => l.startsWith("| `downloads` |"));
    assert.ok(row, "the downloads field has its row");
    assert.match(row, /`allowed` \(default\)[\s\S]*`ask`[\s\S]*`off`: the same as `ICE_OFFLINE=1`/);
    for (const f of ["max_download_mb", "routes", "local_libraries", "subscriptions"]) assert.ok(s0.includes(`| \`${f}\` |`), `field ${f}`);
    assert.match(s0, /\*\*Keys\*\* live only in environment variables or in `~\/\.ice-motion-director\/\.env`/);
    assert.match(s0, /Never in a project folder, a chat message, a log/);
    assert.match(text, /\| Footage \| `youtube_official` \|/, "the route the youtube_official switch names exists in the catalog");
    const homes = repoFiles().filter((f) => f.endsWith(".md") && readText(f).includes("| `downloads` |"));
    assert.deepEqual(homes, [SOURCING], "the sources.json fields are documented in one file only");
  });

  test("section 1a: the owner's pages before platforms before agencies before stock, searched without being asked", () => {
    const s1a = section(text, "1a. ", "1b. ");
    const order = ["**The user's footage**", "**The owner's own download pages**", "**Official channels on video platforms, through yt-dlp**",
      "**Agencies and paid libraries through the user's own login**", "**Stock video**", "**Graphics**"];
    const pos = order.map((o) => s1a.indexOf(o));
    pos.forEach((p, i) => assert.ok(p > 0, `1a names: ${order[i]}`));
    assert.deepEqual([...pos].sort((a, b) => a - b), pos, "the routes are in order");
    assert.match(s1a, /downloads it by itself, without being asked/);
    assert.match(s1a, /Recorded `needs purchase` \(agency or broadcaster\) or `unknown`/);
    assert.match(s1a, /Ice never signs in/);
    assert.match(s1a, /a term that does not trace is removed, and no literal query is copied/);
    assert.match(s1a, /fit to the scene and its words, then by being real and official, then by recency[\s\S]*then by resolution/);
  });

  test("section 5: download at the output resolution, check free disk space, seek only where ranges work", () => {
    const s5 = section(text, "5. ", "6. ");
    assert.match(s5, /a 1080 output fetches 1080p, not a 4K master/);
    assert.match(s5, /frame width times the maximum zoom/, "the zoom rule stays as the one exception");
    assert.ok(s5.includes("bv*[height<=<H>]"), "the yt-dlp format selector caps the height");
    assert.ok(s5.includes("node <ice-motion-director>/scripts/ice-state.mjs space --need <GB>"));
    assert.ok(s5.includes('"Disk space" subsection of `ice-engines/references/engine-choice.md` section 7'));
    assert.match(s5, /Where the host serves byte ranges/);
    assert.match(s5, /never a faked browser User-Agent/i);
    assert.doesNotMatch(s5, /seeking over HTTP for a few seconds of a remote video can take many minutes/, "the unscoped seeking line is gone");
  });

  test("section 7: single official clips through yt-dlp are allowed, bulk crawlers still never", () => {
    const s7 = section(text, "7. ", "8. ");
    assert.match(s7, /Bulk crawlers and scrapers that harvest a library's pages or items in a loop/);
    assert.match(s7, /whole channels or playlists pulled from a video platform/);
    assert.match(s7, /a single official clip from an official channel on a video platform through yt-dlp, after the owner's own download pages/);
    assert.doesNotMatch(s7, /internal or undocumented APIs/);
  });

  test("folders, sidecar and fetch list; Arabic is never burned with drawtext", () => {
    const pf = readText("skills/ice-assets/references/project-folders.md");
    for (const f of ["overlays/", "luts/", "inbox/", "FETCH-LIST.md", "sources/"]) assert.ok(pf.includes(f), `project-folders names ${f}`);
    assert.match(pf, /## 3b\. Download sidecar/);
    assert.ok(pf.includes('"license_status": "licensed | unknown | needs purchase"'));
    assert.match(pf, /## 4b\. FETCH-LIST\.md and the inbox/);
    assert.match(pf, /`assets\/inbox\/` is empty at the pre-render gate/);
    const fonts = readText("skills/ice-assets/references/fonts.md");
    assert.match(fonts, /Never burn Arabic with ffmpeg `drawtext`/);
    assert.match(fonts, /The subset trap/);
    assert.match(fonts, /Thmanyah's license forbids redistribution/);
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
