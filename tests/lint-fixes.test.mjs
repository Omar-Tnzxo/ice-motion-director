// skills/ice-qa/scripts/lint.mjs on local fixture pages (Spotify pilot fixes): rule C6 skips scene geometry on a
// tilted 3D plane but still fails a flat header bar that holds text; text size is the drawn (projected) size; a
// data-broadcast element passes G5 only in a news reel. Then the reference gates of motion_check.py (lessons L9 and
// L12, standard library only) and the news reel checks of storyboard_lint.py. Fixtures are written to a temp folder.
// Then the craft plan's exemption rows (0.2.5): the Python and Node readers agree, and storyboard_lint, film_gate,
// lint.mjs and art-check.mjs pass a covered hit and still fail it without a row.
// The lint tests skip when no Chrome or Edge is found (set CHROME_PATH); the Python tests skip without Python 3.10+;
// the film_gate test also skips without ffmpeg, numpy or opencv.
// Run: node --test tests/
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { after, test } from "node:test";
import { abs, findPython, hasCommand } from "./helpers.mjs";

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

// ---------------------------------------------------------------- craft plan exemption rows (0.2.5)
// Rows of ice/plan/craft-plan.json lift a gate's hit when they name its rule id, cover its shot or time and hold its
// measured value within the amount plus the tolerance; rows that name a never-lifted class are ignored with a warning.
// The rule itself: skills/ice-direction/references/treatment.md section "Craft plan".
const plan = (root, data) => {
  mkdirSync(join(root, "ice", "plan"), { recursive: true });
  writeFileSync(join(root, "ice", "plan", "craft-plan.json"), JSON.stringify(data, null, 1));
};
const src = (kind, ref) => ({ kind, ref });

// Both readers on one plan: the row id each query gets, plus each reader's stderr (the warnings). They must agree.
const bothReaders = (root, queries) => {
  const q = JSON.stringify(queries);
  const py = spawnSync(PY[0], [...PY.slice(1), "-c", [
    "import json, sys",
    "sys.path.insert(0, sys.argv[1])",
    "import storyboard_lint as s",
    "p = s.load_craft_plan(sys.argv[2])",
    "out = []",
    "for q in json.loads(sys.argv[3]):",
    "    t = tuple(q['t']) if isinstance(q.get('t'), list) else q.get('t')",
    "    row = s.exemption_for(p, q['rule'], t=t, shot=q.get('shot'), value=q.get('value'))",
    "    out.append(row['id'] if row else None)",
    "print(json.dumps(out))",
  ].join("\n"), abs("skills/ice-qa/scripts"), root, q], { encoding: "utf8", timeout: 60000 });
  assert.equal(py.status, 0, py.stderr);
  const node = spawnSync(process.execPath, ["--input-type=module", "-e", [
    `const m = await import(${JSON.stringify(pathToFileURL(abs("skills/ice-qa/scripts/_cdp.mjs")).href)});`,
    "const p = m.loadCraftPlan(process.argv[1]);",
    "console.log(JSON.stringify(JSON.parse(process.argv[2]).map((q) => { const r = m.exemptionFor(p, q.rule, { t: q.t ?? null, shot: q.shot ?? null, value: q.value ?? null }); return r ? r.id : null; })));",
  ].join("\n"), root, q], { encoding: "utf8", timeout: 60000 });
  assert.equal(node.status, 0, node.stderr);
  const ids = JSON.parse(py.stdout);
  assert.deepEqual(JSON.parse(node.stdout), ids, "the Python and Node readers disagree");
  const lines = (s) => s.split(/\r?\n/).filter(Boolean).sort();
  assert.deepEqual(lines(node.stderr), lines(py.stderr), "the Python and Node readers warn differently");
  return { ids, err: py.stderr };
};

test("exemptions: the Python and Node readers agree on covered, out-of-shots, over-amount and never-lifted rows", { skip: NO_PY }, () => {
  const root = join(dir, "agree");
  mkdirSync(join(root, "build"), { recursive: true });
  plan(root, { type: "brand film", exemptions: [
    { id: "X-01", lifts: ["lint:C1"], element: "folio", source: src("style", "editorial card, type needs"), shots: ["1-4"] },
    { id: "X-02", lifts: ["film:blue_purple_share"], element: "night ground", source: src("reference", "r1 style-recipe.json palette"), shots: ["all"],
      amount: { measure: "blue-purple share", value: "40 %", tolerance: 0.1 } },
    { id: "X-03", lifts: ["story:4", "truth:claims"], element: "claim card", source: src("user", "quoted words"), shots: ["all"] },
    { id: "X-04", lifts: ["frame:P1"], element: "dimmed speaker", source: src("reference", "r1"), shots: ["all"] },
    { id: "X-05", lifts: ["art:tones"], element: "flat cut paper", source: src("style", "cut-paper card"), shots: ["all"], amount: { measure: "tones", value: 1 } },
    { id: "X-06", lifts: ["story:1"], element: "black beat", source: src("style", "act-break card"), shots: ["3"] },
    { id: "X-07", lifts: ["look:G3"], element: "end screen", source: src("reference", "r1 events.json"), shots: ["7.5-10"] },
    { id: "X-08", lifts: ["lint:C3"], element: "chapter counter", shots: ["all"] },
    { id: "X-09", lifts: ["film:frame_fill", "lint:V2"], element: "price line", source: src("content", "the price said at 4 s"), shots: "all" },
    { id: "X-10", lifts: ["lint:C2"], element: "late label", source: src("content", "a label added at 07"), shots: ["all"], stage: "07" },
    { id: "X-11", lifts: ["lint:C4"], element: "late timecode", source: src("style", "camcorder card, Craft needs: type"), shots: ["all"], stage: "07" },
    { id: "X-12", lifts: ["story:filler_reason", "frame:flash"], element: "strobe", source: src("style", "rave card"), shots: ["all"] },
    { id: "X-13", lifts: ["frame:flash"], element: "strobe", source: src("user", "\"keep the strobe exactly as the clip has it\""), shots: ["all"] },
    { id: "X-14", lifts: ["lint:C5"], element: "mono label", source: src("type", "type default"), shots: ["all"] },
    { id: "X-15", lifts: ["lint:C6"], element: "bar", source: src("style", "  "), shots: ["all"] },
  ] });
  const queries = [
    { rule: "lint:C1", t: 2, expect: "X-01" },
    { rule: "Lint: c1", t: 4, expect: "X-01" },
    { rule: "lint:C1", t: 6, expect: null },
    { rule: "lint:C2", t: 2, expect: null },
    { rule: "film:blue_purple_share", t: [0, 10], value: 0.43, expect: "X-02" },
    { rule: "film:blue_purple_share", t: [0, 10], value: 0.45, expect: null },
    { rule: "story:4", shot: 1, expect: null },
    { rule: "frame:P1", t: 1, expect: null },
    { rule: "art:tones", t: null, value: 1, expect: "X-05" },
    { rule: "art:tones", t: null, value: 0.9, expect: null },
    { rule: "story:1", shot: "S03", expect: "X-06" },
    { rule: "story:1", shot: 4, expect: null },
    { rule: "look:G3", t: [8, 10], expect: "X-07" },
    { rule: "look:G3", t: [6, 10], expect: null },
    { rule: "lint:C3", t: 1, expect: null },
    { rule: "film:frame_fill", t: [0, 10], expect: null },
    { rule: "lint:V2", t: 3, expect: "X-09" },
    { rule: "lint:C2", t: 3, expect: null },
    { rule: "lint:C4", t: 3, expect: "X-11" },
    { rule: "story:filler_reason", shot: 2, expect: "X-12" },
    { rule: "frame:flash", t: [1, 2], value: 5, expect: "X-13" },
    { rule: "lint:C5", t: 3, expect: null },
    { rule: "lint:C6", t: 3, expect: null },
  ];
  const { ids, err } = bothReaders(join(root, "build"), queries);
  assert.deepEqual(ids, queries.map((x) => x.expect));
  const meta = spawnSync(process.execPath, ["--input-type=module", "-e", [
    `const m = await import(${JSON.stringify(pathToFileURL(abs("skills/ice-qa/scripts/_cdp.mjs")).href)});`,
    "const p = m.loadCraftPlan(process.argv[1]);",
    "console.log(JSON.stringify({ codes: [...m.CRAFT_CODES], line: m.exemptLine('lint:C1', p.exemptions[0]) }));",
  ].join("\n"), join(root, "build")], { encoding: "utf8", timeout: 60000 });
  assert.equal(JSON.parse(meta.stdout).codes.length, 18);
  assert.equal(JSON.parse(meta.stdout).line, "exempt lint:C1 by X-01 (style: editorial card, type needs)");
  assert.match(err, /exemption X-03 ignored: it lifts a never-lifted class \(truth:claims\)/);
  assert.match(err, /exemption X-04 ignored: it lifts a never-lifted class \(frame:P1\)/);
  assert.match(err, /exemption X-08 ignored: it has no source/);
  assert.match(err, /exemption X-09 ignored for film:frame_fill: a content row cannot lift it \(allowed: user, reference, style\)/);
  assert.doesNotMatch(err, /X-09 ignored for lint:V2/);
  assert.match(err, /exemption X-10 ignored: a content row written at stage 07/);
  assert.doesNotMatch(err, /X-11 ignored/);
  assert.match(err, /exemption X-12 ignored for frame:flash: a style row cannot lift it \(allowed: user\)/);
  assert.match(err, /exemption X-14 ignored: it has no source/);
  assert.match(err, /exemption X-15 ignored: it has no source/);
});

test("exemptions: a content row cannot lift film:hero_share or any story check, while a style row can", { skip: NO_PY }, () => {
  const root = join(dir, "hero-share");
  mkdirSync(root, { recursive: true });
  plan(root, { type: "product launch", exemptions: [
    { id: "X-01", lifts: ["film:hero_share", "film:longest_bare_talk_s", "story:5", "film:blue_purple_share"], element: "a small product on a wide desk",
      source: src("content", "the script names the desk first"), shots: ["all"], reason: "restraint the agent chose", stage: "05" },
    { id: "X-02", lifts: ["film:hero_share"], element: "a small product in a wide room", source: src("style", "architectural card, Craft needs: composite"),
      shots: ["4-8"], amount: { measure: "hero share", value: 0.1, tolerance: 0.1 }, reason: "the style frames the room", stage: "05" },
  ] });
  const queries = [
    { rule: "film:hero_share", t: [0, 3], value: 0.1, expect: null },
    { rule: "film:hero_share", t: [4, 8], value: 0.1, expect: "X-02" },
    { rule: "film:longest_bare_talk_s", t: [0, 9], expect: null },
    { rule: "story:5", t: [0, 3], shot: 1, expect: null },
    { rule: "film:blue_purple_share", t: [0, 9], expect: "X-01" },
  ];
  const { ids, err } = bothReaders(root, queries);
  assert.deepEqual(ids, queries.map((x) => x.expect));
  for (const id of ["film:hero_share", "film:longest_bare_talk_s", "story:5"]) {
    assert.match(err, new RegExp(`exemption X-01 ignored for ${id}: a content row cannot lift it \\(allowed: user, reference, style\\)`));
  }
  assert.doesNotMatch(err, /X-01 ignored for film:blue_purple_share/, "the subject's real colours are a content source");
});

test("exemptions: a content row written at stage 07 is ignored, a style or user row written at 07 still lifts", { skip: NO_PY }, () => {
  const root = join(dir, "late-row");
  mkdirSync(root, { recursive: true });
  plan(root, { type: "brand film", exemptions: [
    { id: "X-07", lifts: ["lint:C1", "slop:3"], element: "corner label added after the gate failed", source: src("content", "the label is in the script"),
      shots: ["all"], reason: "added to pass", stage: "07" },
    { id: "X-08", lifts: ["lint:C1"], element: "folio", source: src("user", "\"put a page number in the corner\""), shots: ["all"], reason: "the user's words", stage: 7 },
    { id: "X-09", lifts: ["slop:3"], element: "label", source: src("content", "the label is in the script"), shots: ["all"], reason: "a content trigger", stage: "05" },
  ] });
  const queries = [{ rule: "lint:C1", t: 2, expect: "X-08" }, { rule: "slop:3", t: 2, expect: "X-09" }];
  const { ids, err } = bothReaders(root, queries);
  assert.deepEqual(ids, queries.map((x) => x.expect));
  assert.match(err, /exemption X-07 ignored: a content row written at stage 07 \(a row written at 07 comes only from user, reference or style; a row added after a gate failed is a paper patch\)/);
  assert.doesNotMatch(err, /X-08 ignored|X-09 ignored/);
});

const STORY_LOCK = "Style: kinetic type on torn paper, one grammar for the whole film\nPalette: #E85D3A accent, #F4EFE6 ground, #1F1F1F ink\nCharacters: none\n\n";
const STORY_HEAD = "| Time | Object | Action | Camera | On-screen text | Trigger | Reason | Method |\n|---|---|---|---|---|---|---|---|\n";
const storyLint = (root, file) => spawnSync(PY[0], [...PY.slice(1), abs("skills/ice-qa/scripts/storyboard_lint.py"), file, "--type", "kinetic type"],
  { encoding: "utf8", cwd: root, timeout: 60000 });

test("exemptions: storyboard_lint reds a text-led opening and text share without a row and passes them with a style row", { skip: NO_PY }, () => {
  const root = join(dir, "kinetic");
  mkdirSync(join(root, "ice", "plan"), { recursive: true });
  const sb = join(root, "ice", "plan", "storyboard.md");
  writeFileSync(sb, STORY_LOCK + STORY_HEAD +
    "| 0-3 | headline word rivers | slams down and cracks the paper | slow push | rivers | \"rivers\" at 0.2 s | the opening word of the line; ink is the text role | kinetic type |\n" +
    "| 3-6 | the word run | stretches across the sheet to the right edge | glide | run | \"run\" at 3.1 s | the verb the line stresses; the accent marks the action | kinetic type |\n" +
    "| 6-9 | a paper boat | tips over a fold in the sheet | pull back | | \"until they stop\" at 6.4 s | the river's end, cut from the same paper | code scene |\n" +
    "| 9-12 | a hand | folds the sheet flat | hold | | \"and we listen\" at 9.2 s | the listener's gesture closes the idea | code scene |\n" +
    "| 12-15 | a second paper boat | slides off the table edge | slow push | | \"listen\" at 12.3 s | the last boat leaves the frame; the accent ends the film | code scene |\n", "utf8");
  const red = storyLint(root, sb);
  assert.equal(red.status, 1, red.stdout + red.stderr);
  assert.match(red.stdout, /\[RED\] \(4\) opening: the first shot is text-led/);
  assert.match(red.stdout, /\[RED\] \(5\) text share: text-led shots 2\/5 \(40%\)/);
  plan(root, { type: "kinetic type", exemptions: [
    { id: "X-01", lifts: ["story:4", "story:5"], element: "type-led opening", source: src("style", "torn-paper kinetic card, Craft needs: type"),
      shots: ["0-6"], amount: { measure: "text-led share", value: "40 %", tolerance: 0.1 }, reason: "the style is type-led", stage: "04" },
    { id: "X-09", lifts: ["story:8", "rights:music"], element: "track", source: src("user", "quoted words"), shots: ["all"] },
  ] });
  const ok = storyLint(root, sb);
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  assert.match(ok.stdout, /exempt story:4 by X-01 \(style: torn-paper kinetic card, Craft needs: type\)/);
  assert.match(ok.stdout, /exempt story:5 by X-01 \(style: torn-paper kinetic card, Craft needs: type\) on shot\(s\) 1, 2/);
  assert.doesNotMatch(ok.stdout, /\[RED\]/);
  assert.match(ok.stderr, /exemption X-09 ignored: it lifts a never-lifted class \(rights:music\)/);
  // a row whose amount is under the measured share, or whose shots miss the opening, does not cover the hit
  plan(root, { exemptions: [{ id: "X-02", lifts: ["story:4", "story:5"], source: src("style", "card"), shots: ["3-6"], amount: { measure: "share", value: 0.2 } }] });
  const miss = storyLint(root, sb);
  assert.equal(miss.status, 1, miss.stdout + miss.stderr);
  assert.match(miss.stdout, /\[RED\] \(4\) opening/);
  assert.match(miss.stdout, /\[RED\] \(5\) text share/);
});

// A project whose reference r1 has a REASONS.md of four element rows, and a storyboard with the given extra rows.
const measuredProject = (name, rows) => {
  const root = join(dir, name);
  mkdirSync(join(root, "ice", "plan"), { recursive: true });
  mkdirSync(join(root, "ice", "reference", "r1"), { recursive: true });
  writeFileSync(join(root, "ice", "reference", "r1", "REASONS.md"), "# Element reasons: r1\nSources: transcript.json, frames/\n\n" +
    "| # | Element | Trigger kind | Trigger instances (words or cue, with time) | Meaning | On whom or what (role) | In (cue, time) | Out (cue, time) | Why this colour and shape | Evidence |\n" +
    "|---|---|---|---|---|---|---|---|---|---|\n" +
    ["a hand-drawn underline", "a red circle", "a grain wash", "a strip of tape across the frame"].map((e, i) =>
      `| ${i + 1} | ${e} | a snare hit | the snare at ${3 * i} s | unknown: a denser strip | object | on the hit | next cut | unknown: the palette | frames/${i + 1}.png |`).join("\n") + "\n", "utf8");
  const sb = join(root, "ice", "plan", "storyboard.md");
  writeFileSync(sb, STORY_LOCK + STORY_HEAD +
    "| 0-3 | a paper boat | tips over a fold in the sheet | slow push | | \"until they stop\" at 0.4 s | the river's end, cut from the same paper | code scene |\n" + rows, "utf8");
  return { root, sb };
};

test("exemptions: storyboard_lint accepts 'measured: <REASONS row>' as a reason and reds 'measured' with no row", { skip: NO_PY }, () => {
  const { root, sb } = measuredProject("measured",
    "| 3-6 | a strip of tape | tears across the boat on the beat | glide | | the snare at 3.0 s | measured: r1 REASONS.md #4 | code scene |\n" +
    "| 6-9 | a sticker star | lands on the sail | pull back | | the snare at 6.0 s | measured, meaning unknown | code scene |\n");
  const r = storyLint(root, sb);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout, /\[GREEN\] shot 2[^\n]*\n\s+note: reason: a measured reference element \(measured: r1 REASONS\.md #4; REASONS\.md row: a strip of tape across the frame\)/);
  assert.match(r.stdout, /\[RED\] \(17\) reason: the Reason cell says 'measured' but names no row of the reference's REASONS\.md/);
  assert.doesNotMatch(r.stdout, /\[RED\] shot 2/);
});

test("exemptions: storyboard_lint reds 'measured' in a Trigger cell and a REASONS.md row that does not exist", { skip: NO_PY }, () => {
  const { root, sb } = measuredProject("measured-missing",
    "| 3-6 | a strip of tape | tears across the boat on the beat | glide | | the snare at 3.0 s | measured: r1 REASONS.md #4 | code scene |\n" +
    "| 6-9 | a red ring | closes around the boat | slow push | | the snare at 6.0 s | measured: r1 REASONS.md #9 | code scene |\n" +
    "| 9-12 | a grain wash | settles over the sheet | pull back | | measured: r1 REASONS.md #3 | the paper ages as the line ends; grain is the reference's finish | code scene |\n");
  const r = storyLint(root, sb);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.doesNotMatch(r.stdout, /\[RED\] shot 2/);
  assert.match(r.stdout, /\[RED\] shot 3[^\n]*\n\s+\[RED\] \(17\) reason: the Reason cell points to REASONS\.md row #9 of reference 'r1', but [^\n]*REASONS\.md has no row #9 in its element table \(4 row\(s\)\)/);
  assert.match(r.stdout, /\[RED\] shot 4[^\n]*\n\s+\[RED\] \(17\) trigger: the Trigger cell says 'measured' \('measured: r1 REASONS\.md #3'\)/);
  // without the reasons file the same pointer is red
  rmSync(join(root, "ice", "reference"), { recursive: true, force: true });
  const gone = storyLint(root, sb);
  assert.match(gone.stdout, /\[RED\] \(17\) reason: the Reason cell points to REASONS\.md row #4 of reference 'r1', but ice\/reference\/r1\/REASONS\.md was not found/);
});

// a 4 s clip on a purple ground (hue about 262 degrees) with a white box: gate 3 reads it as a blue-purple ground
const FFMPEG = hasCommand("ffmpeg");
const CV = PY ? spawnSync(PY[0], [...PY.slice(1), "-c", "import numpy, cv2"], { encoding: "utf8" }).status === 0 : false;
const NO_FILM = !PY ? "Python 3.10+ not found" : !FFMPEG ? "ffmpeg not found" : !CV ? "numpy or opencv not installed (skills/ice-qa/scripts/requirements.txt)" : false;

test("exemptions: film_gate gate 3 passes a blue-purple ground as exempt with a film:blue_purple_share row", { skip: NO_FILM }, () => {
  const root = join(dir, "purple");
  mkdirSync(join(root, "render"), { recursive: true });
  const film = join(root, "render", "film.mp4");
  const mk = spawnSync("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", "color=c=0x5a2ea6:s=640x360:d=4:r=25",
    "-vf", "drawbox=x=200:y=120:w=120:h=120:color=white:t=fill", "-pix_fmt", "yuv420p", film], { encoding: "utf8", timeout: 60000 });
  assert.equal(mk.status, 0, mk.stderr);
  const gate = () => {
    const r = spawnSync(PY[0], [...PY.slice(1), abs("skills/ice-qa/scripts/film_gate.py"), film, "--json"], { encoding: "utf8", cwd: root, timeout: 180000 });
    assert.ok(r.status === 0 || r.status === 2, `film_gate.py exit ${r.status}: ${r.stderr}`);
    return { status: r.status, out: JSON.parse(r.stdout) };
  };
  const red = gate();
  assert.equal(red.status, 2);
  assert.equal(red.out.lights.blue_purple_share, "red");
  assert.ok(red.out.blue_purple_share >= 0.3, "blue-purple share " + red.out.blue_purple_share);
  plan(root, { exemptions: [{ id: "X-03", lifts: ["film:blue_purple_share"], element: "deep purple ground",
    source: src("reference", "r1 style-recipe.json look palette ground"), shots: ["all"], amount: { measure: "blue-purple share", value: "1.0", tolerance: 0.1 } }] });
  const ok = gate();
  assert.equal(ok.status, 0, JSON.stringify(ok.out.lights));
  assert.equal(ok.out.lights.blue_purple_share, "exempt");
  assert.ok(ok.out.exempt.includes("exempt film:blue_purple_share by X-03 (reference: r1 style-recipe.json look palette ground)"), JSON.stringify(ok.out.exempt));
  assert.equal(ok.out.verdict, "pass");
  // the same ground over the row's amount still fails
  plan(root, { exemptions: [{ id: "X-04", lifts: ["film:blue_purple_share"], source: src("reference", "r1"), shots: ["all"], amount: { measure: "share", value: 0.5 } }] });
  const over = gate();
  assert.equal(over.status, 2);
  assert.equal(over.out.lights.blue_purple_share, "red");
});

test("exemptions: lint.mjs passes a data-identity-mark with the plan's identity row, reports craft_marks and writes boxes", { skip: NO_CHROME }, () => {
  const root = join(dir, "identity");
  mkdirSync(join(root, "build"), { recursive: true });
  const f = join(root, "build", "index.html");
  writeFileSync(f, `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;width:1920px;height:1080px;overflow:hidden;background:#101820;color:#fff;font-family:Arial,Helvetica,sans-serif}
.abs{position:absolute}
</style></head><body>
<div id="bug" class="abs" data-identity-mark="channel bug" style="left:1700px;top:40px;font-size:30px">RIVER</div>
<div id="folio" class="abs" style="left:800px;top:700px;font-size:28px;letter-spacing:0.12em;text-transform:uppercase">field notes</div>
<div class="abs" data-ice-craft="type depth" style="left:0;top:470px;width:1920px;text-align:center;font-size:120px;line-height:1">Dry wells</div>
<audio data-ice-craft="sfx"></audio>
<script>window.DEMO={duration:2,width:1920,height:1080};window.renderAt=function(){};window.__ready=true;</script>
</body></html>`);
  const boxes = join(root, "review", "boxes.json");
  const run = () => {
    const r = spawnSync(process.execPath, [LINT, f, "--times", "0.5,1.5", "--json", "--boxes-out", boxes], { encoding: "utf8", cwd: root, timeout: 120000 });
    assert.ok(r.status === 0 || r.status === 1, `lint.mjs exit ${r.status}: ${r.stderr}`);
    return { status: r.status, out: JSON.parse(r.stdout) };
  };
  const before = run();
  assert.equal(before.status, 1);
  assert.ok(rule(before.out, "C1").hits.some((h) => h.text === "RIVER"), JSON.stringify(rule(before.out, "C1").hits));
  assert.equal(rule(before.out, "C2").status, "FAIL");
  assert.ok(before.out.exemptions.some((e) => e.startsWith("[data-identity-mark] ignored")), JSON.stringify(before.out.exemptions));
  assert.deepEqual(Object.keys(before.out.craft_marks), ["depth", "sfx", "type"]);
  assert.deepEqual(before.out.craft_marks.type, [0.5, 1.5]);
  plan(root, { type: "brand film",
    rows: [{ dimension: "identity", decision: "use", devices: ["channel bug"], where: ["film"], trigger: "type default", reason: "the channel's own mark", source: "user: keep our bug", check: "lint.mjs" }],
    exemptions: [{ id: "X-02", lifts: ["lint:C2"], element: "tracked caps folio", source: src("style", "editorial folio card, Craft needs: type"), shots: ["0-2"] }] });
  const lifted = run();
  assert.equal(lifted.status, 0, JSON.stringify(lifted.out.rules.filter((x) => x.status !== "PASS")));
  assert.equal(lifted.out.gate, "PASS");
  assert.ok(lifted.out.exemptions.some((e) => e.startsWith('[data-identity-mark="channel bug"] exempt from C1, C6 and P1 (craft plan identity row: use)')), JSON.stringify(lifted.out.exemptions));
  assert.ok(lifted.out.exemptions.some((e) => e.startsWith("exempt lint:C2 by X-02 (style: editorial folio card, Craft needs: type)")), JSON.stringify(lifted.out.exemptions));
  assert.equal(rule(lifted.out, "C2").exempt.length, 1);
  const bx = JSON.parse(readFileSync(boxes, "utf8"));
  assert.deepEqual(bx.map((s) => s.t), [0.5, 1.5]);
  assert.equal(bx[0].width, 1920);
  assert.equal(bx[0].height, 1080);
  assert.ok(bx[0].boxes.length >= 3 && bx[0].boxes.every((b) => b.length === 4 && b[2] > 0 && b[3] > 0), JSON.stringify(bx[0]));
  assert.ok(bx[0].boxes.some((b) => Math.abs(b[0] - 1700) < 2 && Math.abs(b[1] - 40) < 6), "the identity mark's box: " + JSON.stringify(bx[0].boxes));
});

// --boxes-out feeds the face check of craft_gate.py build: text and cards behind the subject (data-behind-subject, or
// painted under the person matte layer) and the frame holding the speaker's own video never read as covering the face.
test("craft_gate.py boxes: lint.mjs --boxes-out leaves out text behind the subject and the frame of the speaker's own video", { skip: NO_CHROME }, () => {
  const root = join(dir, "boxes-behind");
  mkdirSync(join(root, "build"), { recursive: true });
  const f = join(root, "build", "index.html");
  writeFileSync(f, `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;width:1920px;height:1080px;overflow:hidden;background:#101820;color:#fff;font-family:Arial,Helvetica,sans-serif}
.abs{position:absolute}
</style></head><body>
<div id="title" class="abs" style="left:300px;top:150px;z-index:1;font-size:160px;line-height:1">RIVERS</div>
<div id="ground-card" class="abs" style="left:100px;top:600px;width:400px;height:300px;z-index:1;background:#2a3b4c;border-radius:20px"></div>
<div id="matte" class="abs" data-ice-layer="person matte" style="inset:0;z-index:2"></div>
<div id="depth" class="abs" data-behind-subject style="left:300px;top:420px;z-index:3;font-size:90px;line-height:1">DEPTH</div>
<div id="caption" class="abs" style="left:700px;top:900px;z-index:3;font-size:48px;line-height:1">the water ran out</div>
<div id="frame" class="abs" style="left:1200px;top:200px;width:600px;height:400px;z-index:3;background:#222;border-radius:24px;overflow:hidden">
  <video data-start="100" muted style="display:block;width:600px;height:400px"></video>
  <div class="abs" style="left:24px;top:330px;font-size:32px;line-height:1">Name strap</div>
</div>
<div id="card" class="abs" style="left:700px;top:600px;width:400px;height:200px;z-index:3;background:#3c6e47;border-radius:20px"></div>
<script>window.DEMO={duration:2,width:1920,height:1080};window.renderAt=function(){};window.__ready=true;</script>
</body></html>`);
  const boxes = join(root, "review", "boxes.json");
  const r = spawnSync(process.execPath, [LINT, f, "--times", "0.5", "--json", "--boxes-out", boxes], { encoding: "utf8", cwd: root, timeout: 120000 });
  assert.ok(r.status === 0 || r.status === 1, `lint.mjs exit ${r.status}: ${r.stderr}`);
  const [s] = JSON.parse(readFileSync(boxes, "utf8"));
  const near = (x, y, tol = 12) => s.boxes.some((b) => Math.abs(b[0] - x) <= tol && Math.abs(b[1] - y) <= 40);
  assert.ok(near(700, 900), "the caption in front is written: " + JSON.stringify(s.boxes));
  assert.ok(near(1224, 530), "the name strap inside the video frame is written: " + JSON.stringify(s.boxes));
  assert.ok(near(700, 600), "a card in front that holds no video is written: " + JSON.stringify(s.boxes));
  assert.ok(!near(300, 150), "the title under the matte layer is left out: " + JSON.stringify(s.boxes));
  assert.ok(!near(300, 420), "the data-behind-subject word is left out: " + JSON.stringify(s.boxes));
  assert.ok(!near(100, 600), "the card under the matte layer is left out: " + JSON.stringify(s.boxes));
  assert.ok(!s.boxes.some((b) => Math.abs(b[0] - 1200) <= 2 && Math.abs(b[1] - 200) <= 2 && b[2] >= 590), "the frame of the speaker's video is left out: " + JSON.stringify(s.boxes));
});

test("exemptions: art-check passes a flat-fill hero with art rows from its style and still fails it without them", { skip: NO_CHROME }, () => {
  const root = join(dir, "flatart");
  mkdirSync(join(root, "frames"), { recursive: true });
  const f = join(root, "frames", "style-frame.html");
  writeFileSync(f, `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;width:1920px;height:1080px;overflow:hidden;background:#e9e4d8}
</style></head><body><svg width="1920" height="1080" viewBox="0 0 1920 1080">
<g id="sun" data-art-hero="sun"><circle cx="960" cy="540" r="260" fill="#e85d3a"/></g></svg></body></html>`);
  const run = () => {
    const r = spawnSync(process.execPath, [abs("skills/ice-qa/scripts/art-check.mjs"), f, "--json"], { encoding: "utf8", cwd: root, timeout: 120000 });
    assert.ok(r.status === 0 || r.status === 1, `art-check.mjs exit ${r.status}: ${r.stderr}`);
    return { status: r.status, out: JSON.parse(r.stdout) };
  };
  const before = run();
  assert.equal(before.status, 1);
  assert.equal(before.out.objects[0].measures.tones.status, "FAIL");
  plan(root, { exemptions: [
    { id: "X-10", lifts: ["art:tones", "art:shading", "art:texture", "art:shadow"], element: "flat cut-paper sun", source: src("style", "cut-paper card, Craft never: shading"),
      shots: ["all"], amount: { measure: "fill tones", value: 1 } },
    { id: "X-11", lifts: ["art:shapes"], element: "one-shape sun", source: src("style", "cut-paper card"), shots: ["all"], amount: { measure: "shapes", value: 1 } },
  ] });
  const ok = run();
  assert.equal(ok.status, 0, JSON.stringify(ok.out.objects));
  assert.equal(ok.out.gate, "PASS");
  const m = ok.out.objects[0].measures;
  for (const k of ["tones", "shading", "shapes", "texture", "shadow"]) assert.equal(m[k].status, "EXEMPT", k + ": " + JSON.stringify(m[k]));
  assert.match(m.tones.note, /exempt art:tones by X-10 \(style: cut-paper card, Craft never: shading\)/);
  assert.match(m.shapes.note, /exempt art:shapes by X-11/);
});

test("exemptions: film_gate gate 4 reads an edit type's coverage floor on the render and a plan:coverage row lifts it", { skip: NO_FILM }, () => {
  const root = join(dir, "bare-edit");
  mkdirSync(join(root, "render"), { recursive: true });
  const film = join(root, "render", "film.mp4");
  const mk = spawnSync("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", "color=c=0x6b6b62:s=640x360:d=4:r=25",
    "-vf", "drawbox=x=200:y=120:w=120:h=120:color=white:t=fill", "-pix_fmt", "yuv420p", film], { encoding: "utf8", timeout: 60000 });
  assert.equal(mk.status, 0, mk.stderr);
  const gate = () => {
    const r = spawnSync(PY[0], [...PY.slice(1), abs("skills/ice-qa/scripts/film_gate.py"), film, "--json", "--type", "talking-head ad"], { encoding: "utf8", cwd: root, timeout: 180000 });
    assert.ok(r.status === 0 || r.status === 2, `film_gate.py exit ${r.status}: ${r.stderr}`);
    return { status: r.status, out: JSON.parse(r.stdout) };
  };
  const red = gate();
  assert.equal(red.status, 2);
  const m = red.out.richness.measures;
  assert.match(red.out.richness.coverage_from, /talking-head-ad\.md$/);
  assert.equal(m.element_events_per_min.light, "red");
  assert.equal(m.element_events_per_min.value, 0);
  assert.match(m.trigger_coverage.note, /checked on the plan by validate-plan\.mjs/);
  assert.match(m.broll_share.note, /checked on the plan by validate-plan\.mjs/);
  plan(root, { exemptions: [{ id: "X-20", lifts: ["plan:coverage"], element: "one locked presenter take", source: src("reference", "r1 events.json, a calm take"),
    shots: ["all"], amount: { measure: "events per minute", value: 0 } }] });
  const ok = gate();
  assert.equal(ok.status, 0, JSON.stringify(ok.out.richness.measures));
  assert.equal(ok.out.richness.measures.element_events_per_min.light, "exempt");
  assert.ok(ok.out.exempt.includes("exempt plan:coverage by X-20 (reference: r1 events.json, a calm take)"), JSON.stringify(ok.out.exempt));
});

// T1: a headline typed letter by letter (renderAt grows the text) passes through a lint:T1 row of any of the four source
// kinds (a content row: the product's own input shown as it really works); a row of another kind is ignored, and
// Arabic text that grows by letters is never lifted (Arabic typing is a mask reveal)
test("exemptions: lint.mjs lifts T1 typing with a style row and a content row too, and never Arabic letters", { skip: NO_CHROME }, () => {
  const typed = (name, text, rtl) => {
    const root = join(dir, name);
    mkdirSync(join(root, "build"), { recursive: true });
    const f = join(root, "build", "index.html");
    writeFileSync(f, `<!doctype html><html${rtl ? ' dir="rtl" lang="ar"' : ""}><head><meta charset="utf-8"><style>
html,body{margin:0;width:1920px;height:1080px;overflow:hidden;background:#101820;color:#fff;font-family:Arial,Helvetica,sans-serif}
</style></head><body><div id="head" style="position:absolute;left:0;top:480px;width:1920px;text-align:center;font-size:80px;line-height:1"></div>
<script>const T=${JSON.stringify(text)};window.DEMO={duration:2,width:1920,height:1080};
window.renderAt=function(t){document.getElementById('head').textContent=T.slice(0,Math.max(1,Math.floor(t*30)));};window.renderAt(0);window.__ready=true;</script>
</body></html>`, "utf8");
    return { root, f };
  };
  const run = (f, root) => {
    const r = spawnSync(process.execPath, [LINT, f, "--times", "0.5", "--json"], { encoding: "utf8", cwd: root, timeout: 120000 });
    assert.ok(r.status === 0 || r.status === 1, `lint.mjs exit ${r.status}: ${r.stderr}`);
    return { status: r.status, out: JSON.parse(r.stdout) };
  };
  const row = (kind) => ({ exemptions: [{ id: "X-30", lifts: ["lint:T1"], element: "typed terminal headline", source: src(kind, "terminal card, Craft needs: type"), shots: ["0-2"] }] });
  const latin = typed("typing-latin", "Supercalifragilisticexpialidocious", false);
  const bare = run(latin.f, latin.root);
  assert.equal(rule(bare.out, "T1").status, "FAIL", JSON.stringify(rule(bare.out, "T1")));
  plan(latin.root, row("type"));
  const wrongKind = run(latin.f, latin.root);
  assert.equal(rule(wrongKind.out, "T1").status, "FAIL", "a row whose kind is not one of the four is ignored: " + JSON.stringify(rule(wrongKind.out, "T1")));
  plan(latin.root, row("style"));
  const style = run(latin.f, latin.root);
  assert.equal(rule(style.out, "T1").status, "PASS", JSON.stringify(rule(style.out, "T1")));
  assert.ok(style.out.exemptions.some((e) => e.startsWith("exempt lint:T1 by X-30 (style: terminal card, Craft needs: type)")), JSON.stringify(style.out.exemptions));
  plan(latin.root, { exemptions: [{ id: "X-31", lifts: ["lint:T1"], element: "the search box of the product typing a query",
    source: src("content", "the product's own search box, captured at 01"), shots: ["0-2"], stage: "05" }] });
  const content = run(latin.f, latin.root);
  assert.equal(rule(content.out, "T1").status, "PASS", JSON.stringify(rule(content.out, "T1")));
  assert.ok(content.out.exemptions.some((e) => e.startsWith("exempt lint:T1 by X-31 (content: the product's own search box, captured at 01)")), JSON.stringify(content.out.exemptions));
  const arabic = typed("typing-arabic", "\u0627\u0644\u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0629\u0627\u0644\u062C\u062F\u064A\u062F\u0629\u0644\u0644\u0645\u0633\u062A\u0642\u0628\u0644", true);
  for (const kind of ["style", "content", "user"]) {
    plan(arabic.root, row(kind));
    const ar = run(arabic.f, arabic.root);
    assert.equal(rule(ar.out, "T1").status, "FAIL", kind + ": " + JSON.stringify(rule(ar.out, "T1")));
    assert.ok(ar.out.exemptions.some((e) => e.startsWith("T1 not lifted: Arabic text grew by letters")), JSON.stringify(ar.out.exemptions));
  }
});
