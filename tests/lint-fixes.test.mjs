// skills/ice-qa/scripts/lint.mjs on local fixture pages (Spotify pilot fixes): rule C6 skips scene geometry on a
// tilted 3D plane but still fails a flat header bar that holds text; text size is the drawn (projected) size; a
// data-broadcast element passes G5 only in a news reel. Then the reference gates of motion_check.py (lessons L9 and
// L12, standard library only) and the news reel checks of storyboard_lint.py. Fixtures are written to a temp folder.
// The lint tests skip when no Chrome or Edge is found (set CHROME_PATH); the Python tests skip without Python 3.10+.
// Run: node --test tests/
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { after, test } from "node:test";
import { abs, findPython } from "./helpers.mjs";

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

// Broadcast package exemption (slop-scan.md section 4, "Broadcast package (news reel)"): a programme name in the top
// band marked data-broadcast passes G5 only when the film type is a news reel; elsewhere the mark is ignored.
test("a data-broadcast programme name passes G5 in a news reel and fails in a product launch", { skip: NO_CHROME }, () => {
  const f = page("broadcast", `
<div id="prog" class="abs" data-broadcast="programme name" style="left:1500px;top:40px;font-size:30px;letter-spacing:0.1em;text-transform:uppercase">THE RIVER DESK</div>
<div class="abs" style="left:0;top:470px;width:1920px;text-align:center;font-size:120px;line-height:1">Dry wells</div>`);
  const run = (type) => {
    const r = spawnSync(process.execPath, [LINT, f, "--times", "0.5", "--json", "--type", type], { encoding: "utf8", timeout: 120000 });
    assert.ok(r.status === 0 || r.status === 1, `lint.mjs exit ${r.status}: ${r.stderr}`);
    return { status: r.status, out: JSON.parse(r.stdout) };
  };
  const news = run("news reel");
  assert.equal(news.out.gate, "PASS", JSON.stringify(news.out.rules.filter((x) => x.status !== "PASS")));
  assert.ok(news.out.exemptions.some((e) => e.startsWith('[data-broadcast="programme name"] exempt')), JSON.stringify(news.out.exemptions));
  const launch = run("product launch");
  assert.equal(launch.status, 1);
  assert.equal(launch.out.gate, "FAIL");
  assert.ok(launch.out.exemptions.some((e) => e.startsWith("[data-broadcast] ignored")), JSON.stringify(launch.out.exemptions));
});

// motion_check.py reference gates (lessons L9 and L12), run with --pacing-only and numpy blocked, so they need only the
// standard library. The reference has events every 1 s with one 3 s gap (longest gap 3 s, 54 events per minute).
const PY = findPython();
const NO_PY = PY ? false : "Python 3.10+ not found";
const MOTION = abs("skills/ice-qa/scripts/motion_check.py");
const json = (name, data) => { const f = join(dir, name); writeFileSync(f, JSON.stringify(data)); return f; };
const every = (from, to, step, kind = "cut", key = "kind") => {
  const out = [];
  for (let t = from; t <= to + 1e-9; t += step) out.push({ t: +t.toFixed(3), [key]: kind });
  return out;
};
const motion = (args) => {
  const wrapper = "import runpy, sys; sys.modules['numpy'] = None; s = sys.argv[1]; sys.argv = sys.argv[1:]; runpy.run_path(s, run_name='__main__')";
  const r = spawnSync(PY[0], [...PY.slice(1), "-c", wrapper, MOTION, "--pacing-only", ...args], { encoding: "utf8", timeout: 60000 });
  assert.ok(r.status === 0 || r.status === 1, `motion_check.py exit ${r.status}: ${r.stdout}${r.stderr}`);
  return { status: r.status, out: JSON.parse(r.stdout), err: r.stderr };
};
// stored summary fields (longest_gap_at as a pair, as recipe.py writes it) are ignored: everything is recomputed
const refEvents = () => json("ref.events.json", { duration: 30, fps: 25, longest_gap: 99, longest_gap_at: [0, 99], events_per_minute: 1, events: [...every(1, 25, 1), { t: 28, kind: "graphic" }, { t: 29, kind: "flash" }] });

test("motion_check pacing: a 19.75 s gap fails against a 3 s reference gap even inside a declared hold", { skip: NO_PY }, () => {
  const film = json("gap.events.json", { duration: 60, fps: 25, events: [...every(1, 20, 1), { t: 20, kind: "hold", end: 39.75 }, ...every(39.75, 59.75, 1)] });
  const outDir = join(dir, "pacing-gap");
  const r = motion(["--events", film, "--reference-events", refEvents(), "--out", outDir]);
  assert.equal(r.status, 1, r.err);
  const p = r.out.pacing;
  assert.equal(p.ok, false);
  assert.equal(p.blocking, true);
  assert.equal(p.reference.longest_gap, 3);
  assert.equal(p.film.longest_gap, 19.75);
  assert.deepEqual(p.film.longest_gap_at, [20, 39.75]);
  assert.ok(p.reasons.some((x) => /declared hold does not excuse it/.test(x)), JSON.stringify(p.reasons));
  assert.ok(existsSync(join(outDir, "pacing.json")), "pacing.json written");
});

test("motion_check pacing: a film within the reference's gap and density passes", { skip: NO_PY }, () => {
  // the older film events format: a bare list, the kind under "type", the duration from --duration
  const film = json("ok.events.json", every(1, 29, 1, "cut", "type"));
  const r = motion(["--events", film, "--reference-events", refEvents(), "--duration", "30"]);
  assert.equal(r.status, 0, r.err);
  assert.equal(r.out.pacing.ok, true);
  assert.deepEqual(r.out.pacing.reasons, []);
});

test("motion_check pacing: a film under 0.9 of the reference's events per minute fails", { skip: NO_PY }, () => {
  const film = json("sparse.events.json", { duration: 30, events: every(3, 27, 3) });
  const r = motion(["--events", film, "--reference-events", refEvents()]);
  assert.equal(r.status, 1, r.err);
  assert.equal(r.out.pacing.ok, false);
  assert.ok(r.out.pacing.film.longest_gap <= r.out.pacing.limits.max_gap, "the gap alone passes");
  assert.ok(r.out.pacing.reasons.some((x) => /events per minute is under the limit/.test(x)), JSON.stringify(r.out.pacing.reasons));
});

test("motion_check depth: a film with no 3D fails against a reference with a card field and camera share 0.5", { skip: NO_PY }, () => {
  const ref = json("ref.depth.json", { camera_moving_share: 0.5, layers: 3, parallax_ratio: 2, push_through: 1, elements_3d: ["card_field"],
    dof: { present: false, blur_px: null }, triggers: [{ kind: "card_field", t: 12, words: "every town" }] });
  const flat = json("flat.depth.json", { camera_moving_share: 0.5, layers: 1, parallax_ratio: null, push_through: 0, elements_3d: [], dof: { present: false } });
  const r = motion(["--reference-depth", ref, "--depth", flat]);
  assert.equal(r.status, 1, r.err);
  assert.equal(r.out.depth.ok, false);
  assert.equal(r.out.depth.blocking, true);
  assert.ok(r.out.depth.reasons.some((x) => /card_field/.test(x)), JSON.stringify(r.out.depth.reasons));
});

test("motion_check depth: the same kinds pass at camera share 0.4 and fail at 0.3", { skip: NO_PY }, () => {
  const ref = json("ref2.depth.json", { camera_moving_share: 0.5, layers: 3, parallax_ratio: 2, push_through: 1, elements_3d: ["card_field"], dof: { present: false } });
  const film = (share) => json(`film-${share}.depth.json`, { camera_moving_share: share, layers: 3, parallax_ratio: 2, push_through: 1, elements_3d: ["card_field"], dof: { present: false } });
  const near = motion(["--reference-depth", ref, "--depth", film(0.4)]);
  assert.equal(near.status, 0, near.err);
  assert.equal(near.out.depth.ok, true);
  const far = motion(["--reference-depth", ref, "--depth", film(0.3)]);
  assert.equal(far.status, 1, far.err);
  assert.ok(far.out.depth.reasons.some((x) => /camera_moving_share/.test(x)), JSON.stringify(far.out.depth.reasons));
});

test("storyboard_lint: cites must be said, subjects come from the vocabulary, depth rows name a build route, a continuous take is declared", { skip: NO_PY }, () => {
  const sb = join(dir, "news-reel-storyboard.md");
  writeFileSync(sb, `Style: presenter news reel on one locked take
Palette: #E85D3A accent, #F4EFE6 ground, #1F1F1F text
Characters: none
Style exception: continuous take of the presenter, reframed digitally

| Time | Object | Action | Camera | On-screen text | Trigger | Reason | Method | Tags | Cites | Subject |
|---|---|---|---|---|---|---|---|---|---|---|
| 0-12 | the presenter at the desk | leans in to the lens | slow push | water ran out | "the water ran out" at 0.4 s | the hook names the shortage | footage | | "the water ran out" | speaker |
| 12-16 | a field of photo cards in 2.5D | the camera passes through the cards | push through | | "every town" at 12 s | each card is a town the line names | code scene | | "every town on the river" | place |
| 16-20 | a 3D flag of the region | waves on its pole | glide | dry wells | "the wells are dry" at 16 s | the region the line names | code scene, build: css-3d | | "the wells were empty" | region |
| 20-26 | end card with the programme logotype | the title block builds line by line | hold | the river programme tonight | the sign-off at 20 s | the programme's end card | code scene | CTA block | | programme |
`, "utf8");
  const script = join(dir, "news-reel-script.txt");
  writeFileSync(script, "The water ran out last summer. Every town on the river felt it. The wells are dry now.\n", "utf8");
  const r = spawnSync(PY[0], [...PY.slice(1), abs("skills/ice-qa/scripts/storyboard_lint.py"), sb, "--script", script, "--type", "news reel"], { encoding: "utf8", timeout: 60000 });
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout, /row 'news reel' of motion-density\.md section 6/);
  assert.match(r.stdout, /\[YELLOW\] \(6\) duration: this shot is 12 s, over 8 s \(continuous take declared/);
  assert.match(r.stdout, /\(21\) depth route: a depth or 3D element with no build route/);
  assert.match(r.stdout, /\(18\) cites: the cited phrase 'the wells were empty' is never said/);
  assert.match(r.stdout, /\(19\) subject: subject role 'region' is not in the vocabulary/);
  assert.match(r.stdout, /\(20\) verbatim/);
  assert.match(r.stdout, /\[GREEN\] shot 4/);
  assert.doesNotMatch(r.stdout, /\(18\) cites: the cited phrase 'the water ran out'/);
});
