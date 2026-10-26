// skills/ice-qa/scripts/lint.mjs on local fixture pages (Spotify pilot fixes): rule C6 skips scene geometry on a
// tilted 3D plane but still fails a flat header bar that holds text; text size is the drawn (projected) size.
// The fixture pages are written to a temp folder. Skips when no Chrome or Edge is found (set CHROME_PATH).
// Run: node --test tests/
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { after, test } from "node:test";
import { abs } from "./helpers.mjs";

const LINT = abs("skills/ice-qa/scripts/lint.mjs");
const probe = spawnSync(process.execPath, ["--input-type=module", "-e",
  `const m = await import(${JSON.stringify(pathToFileURL(abs("skills/ice-qa/scripts/_cdp.mjs")).href)}); console.log(m.findChrome());`], { encoding: "utf8" });
const NO_CHROME = probe.status === 0 ? false : "Chrome or Edge not found (set CHROME_PATH)";

const dir = mkdtempSync(join(tmpdir(), "ice-lint-fixes-"));
after(() => rmSync(dir, { recursive: true, force: true }));

// a seekable 1920x1080 page (renderAt contract) with the given body
const page = (name, body) => {
  const f = join(dir, name + ".html");
  writeFileSync(f, `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;width:1920px;height:1080px;overflow:hidden;background:#101820;color:#fff;font-family:Arial,Helvetica,sans-serif}
.abs{position:absolute}
</style></head><body>${body}
<script>window.DEMO={duration:2,width:1920,height:1080};window.renderAt=function(){};window.__ready=true;</script>
</body></html>`);
  return f;
};

const lint = (file) => {
  const r = spawnSync(process.execPath, [LINT, file, "--times", "0.5", "--json"], { encoding: "utf8", timeout: 120000 });
  assert.ok(r.status === 0 || r.status === 1, `lint.mjs exit ${r.status}: ${r.stderr}`);
  return JSON.parse(r.stdout);
};
const rule = (out, id) => out.rules.find((r) => r.id === id);

test("C6 skips thin scene geometry on a tilted 3D street", { skip: NO_CHROME }, () => {
  // a road plane lying in depth with long thin lane and stop lines near the camera, and lamp wires on a turned plane
  // across the top band: projected, their boxes span the frame edge to edge in the outer bands
  const lanes = [300, 1000, 1700].map((y) => `<div class="abs lane" style="left:-1300px;top:${4700 + y / 10}px;width:4600px;height:12px;background:#f5f5f0"></div>`).join("");
  const wires = [40, 70].map((y) => `<div class="abs wire" style="left:-800px;top:${y}px;width:3600px;height:3px;background:#222"></div>`).join("");
  const f = page("street", `
<div class="abs" style="inset:0;perspective:900px;perspective-origin:50% 40%;overflow:hidden">
  <div id="road" class="abs" style="left:260px;top:-3950px;width:1400px;height:5000px;background:#3a3a3a;transform-origin:50% 100%;transform:rotateX(80deg);transform-style:preserve-3d">${lanes}</div>
  <div id="sky" class="abs" style="left:0;top:0;width:2000px;height:200px;transform-origin:50% 0;transform:rotateY(18deg) rotateX(-12deg)">${wires}</div>
</div>
<div class="abs" style="left:0;top:470px;width:1920px;text-align:center;font-size:96px;line-height:1">Find your street</div>`);
  const out = lint(f);
  const c6 = rule(out, "C6");
  assert.deepEqual(c6.hits, [], "C6 flagged 3D scene geometry: " + JSON.stringify(c6.hits.slice(0, 3)));
  assert.equal(c6.status, "PASS");
  assert.ok(out.exemptions.some((e) => e.startsWith("C6 skipped")), "the skipped 3D shapes are listed under the exemptions: " + JSON.stringify(out.exemptions));
});

test("C6 still fails a flat header bar that holds text and controls", { skip: NO_CHROME }, () => {
  // translateZ(0) keeps the bar screen-aligned, so it is still read as page chrome; an empty floor strip is only a lead
  const f = page("header", `
<header id="topbar" class="abs" style="left:0;top:0;width:1920px;height:90px;background:#1f6f43;transform:translateZ(0)">
  <span class="abs" style="left:40px;top:30px;font-size:28px">Brand</span>
  <nav class="abs" style="right:40px;top:32px;font-size:24px"><a href="#a" style="color:#fff">Home</a> <a href="#b" style="color:#fff">Shop</a></nav>
</header>
<div id="floor" class="abs" style="left:0;top:1020px;width:1920px;height:60px;background:#444"></div>
<div class="abs" style="left:0;top:470px;width:1920px;text-align:center;font-size:120px;line-height:1">One big idea</div>`);
  const out = lint(f);
  const c6 = rule(out, "C6");
  assert.equal(c6.status, "FAIL");
  assert.equal(out.gate, "FAIL");
  const bar = c6.hits.find((h) => h.snippet.includes("header#topbar"));
  assert.ok(bar, "no C6 hit on the header bar: " + JSON.stringify(c6.hits));
  assert.equal(bar.sev, "FAIL");
  assert.match(bar.note, /holding/);
  const floor = c6.hits.find((h) => h.snippet.includes("div#floor"));
  assert.ok(floor, "no C6 lead on the empty floor strip: " + JSON.stringify(c6.hits));
  assert.equal(floor.sev, "WARN");
});

test("text size is the projected size of a scaled 3D word", { skip: NO_CHROME }, () => {
  // CSS sizes are 5 % and 10 % of the height; drawn on a scaled, tilted plane and under scale(0.3) they are corner
  // micro-labels (C1 reads <= 4 % H), which only the drawn size can see
  const f = page("scaled", `
<div class="abs" style="inset:0;perspective:1000px">
  <div id="plane" class="abs" style="left:60px;top:40px;transform-origin:0 0;transform:rotateX(25deg) scale(0.58);transform-style:preserve-3d">
    <div id="word" style="font-size:54px;line-height:1;white-space:nowrap">something</div>
  </div>
</div>
<div id="flat" class="abs" style="left:1700px;top:960px;font-size:108px;line-height:1;white-space:nowrap;transform:scale(0.3);transform-origin:100% 100%">tiny</div>
<div class="abs" style="left:0;top:470px;width:1920px;text-align:center;font-size:120px;line-height:1">One big idea</div>`);
  const out = lint(f);
  const c1 = rule(out, "C1");
  const word = c1.hits.find((h) => h.text === "something");
  assert.ok(word, "the scaled 3D word was read at its CSS size: " + JSON.stringify(c1.hits));
  assert.equal(word.fsCss, 5);
  assert.ok(word.fs > 1.5 && word.fs < 3.5, "drawn size of the 3D word: " + word.fs + " % H");
  const tiny = c1.hits.find((h) => h.text === "tiny");
  assert.ok(tiny, "the scale(0.3) word was read at its CSS size: " + JSON.stringify(c1.hits));
  assert.equal(tiny.fsCss, 10);
  assert.ok(Math.abs(tiny.fs - 3) <= 0.2, "drawn size of the scaled word: " + tiny.fs + " % H");
  const head = c1.hits.find((h) => h.text === "One big idea");
  assert.equal(head, undefined);
});
