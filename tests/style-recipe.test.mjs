// Style recipe (ice-remake scripts/recipe.py and references/style-recipe.md): built from a small fixture report.json
// plus a fixture sound_map.json, every section exists, unknowns are marked with what would measure them, any reference
// keeps its full skin and every mode (no rights gate) while its own media are recreated, and the prompt block lists the open slots. Also checks that the router,
// classify, routes and ice-edit recognise an incoming recipe, and that the SKILL.md files stay under 20 KB.
// Run: node --test tests/
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { abs, findPython, hasCommand, readText } from "./helpers.mjs";

const PYTHON = findPython();
const SCRIPT = abs("skills/ice-remake/scripts/recipe.py");
const work = mkdtempSync(join(tmpdir(), "ice-recipe-"));
after(() => rmSync(work, { recursive: true, force: true }));

// Six shots over 12 s at 120 bpm (beats every 0.5 s); cuts on beats except one.
const shots = [[0, 2], [2, 3.5], [3.5, 5], [5, 7.25], [7.25, 10], [10, 12]];
const report = {
  source: "ref.mp4", video: { duration: 12, width: 1920, height: 1080, fps: 30, has_audio: true }, crop: null,
  shots, pacing: { count: 6, mean_shot_s: 2, shortest_s: 1.5, longest_s: 2.75, mean_shot_beats: 4 },
  audio: { present: true, silent: false, bpm: 120, beat_seconds: 0.5, first_beat: 0, beats: Array.from({ length: 24 }, (_, i) => i * 0.5),
    peak_candidates: [{ t: 7.25, rise: 2.9, level_after: 1.2, kind: "drop" }] },
  shot_details: shots.map(([s, e], i) => ({ shot: i + 1, start: s, end: e,
    camera: { kind: i % 2 ? ["push_in"] : ["static"], speed: i % 2 ? 0.02 : 0.001, pace: i % 2 ? "slow" : "still" },
    look: { brightness: i < 3 ? 0.2 : 0.6, contrast: 0.2, dark_ratio: i < 3 ? 0.6 : 0.1, colourfulness: 0.3, dominant: ["#112233", "#AABBCC", "#FF0000", "#00FF00"] } })),
  flashes: [7.3],
};
const soundMap = {
  version: 1, duration_s: 12,
  music: { present: true, tempo_bpm: 120, tempo_confidence: 0.9, key: "A", mode: "minor",
    sections: [{ start: 0, end: 7, label: "build", energy: 0.4 }, { start: 7, end: 12, label: "drop", energy: 0.9 }],
    energy_curve: Array.from({ length: 24 }, (_, i) => ({ t: i * 0.5, rms_db: -30 + i, brightness: 0.5 })),
    instrumentation_guess: [{ name: "synth bass", confidence: 0.7 }], genre_guess: [{ name: "electronic", confidence: 0.6 }] },
  sfx: [{ t: 3.45, dur: 0.4, type: "whoosh", confidence: 0.8, peak_db: -12 }, { t: 7.25, dur: 0.3, type: "impact", confidence: 0.9, peak_db: -6 }],
  voice: { present: false, segments: [] },
  mix: { integrated_lufs: -14, true_peak_dbtp: -1, lra: 6 }, notes: [],
};

function makeRef(name, { sound = true, notesHex = false } = {}) {
  const ice = join(work, name, "ice");
  const ref = join(ice, "reference", "ref1");
  mkdirSync(join(ref, "analysis"), { recursive: true });
  writeFileSync(join(ref, "analysis", "report.json"), JSON.stringify(report));
  if (sound) writeFileSync(join(ref, "sound_map.json"), JSON.stringify(soundMap));
  writeFileSync(join(ice, "BRIEF.md"), `# Brief\n\n## References\n- ref1 | video | mode: frame-locked | function: MOVES\n`);
  writeFileSync(join(ref, "ANALYSIS.md"), "# Analysis: ref1\nMedium: 2d-vector\n\n## Recipe notes\n"
    + `Transitions: objects carry across most seams by a shared shape${notesHex ? " in #12AB34" : ""}\nType behaviour: <entrance, hold, exit>\n`);
  return ref;
}

function run(ref, ...extra) {
  const r = spawnSync(PYTHON[0], [...PYTHON.slice(1), SCRIPT, "--ref", ref, "--date", "2026-10-22", ...extra], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr || r.stdout);
  return { md: readFileSync(join(ref, "STYLE-RECIPE.md"), "utf8"), json: JSON.parse(readFileSync(join(ref, "style-recipe.json"), "utf8")) };
}

const skip = (t) => { if (!PYTHON) { if (process.env.CI) assert.fail("Python 3 not found"); t.skip("Python 3 not found"); return true; } return false; };

test("recipe: every section exists in both files", (t) => {
  if (skip(t)) return;
  const { md, json } = run(makeRef("all"));
  for (const h of ["## 1. Header", "## 2. Measured grammar", "## 3. Look", "## 4. Sound", "## 5. Feeling", "## 6. Slots", "## 7. Prompt block", "## Unknowns"]) assert.ok(md.includes(h), h);
  for (const k of ["header", "grammar", "look", "sound", "feeling", "slots", "scaling", "prompt", "open_slots", "unknowns"]) assert.ok(k in json, k);
  for (const k of ["shot_lengths", "cuts_vs_beats", "transitions", "camera", "density_curve", "stillness", "type", "composition", "climax", "motif_and_rhyme"]) assert.ok(k in json.grammar, k);
  assert.equal(json.grammar.cuts_vs_beats.free_pct, 0, "every fixture cut sits on a beat or half beat");
  assert.equal(json.grammar.climax.peaks[0].at_pct, 60);
  assert.equal(json.sound.sound_map, "present");
  assert.equal(json.sound.music.genre.value, "unknown", "a sound map proposal stays unknown until a listen");
  assert.match(json.sound.music.genre.measure_with, /listen by the user.*electronic/);
  assert.ok(json.unknowns.some((u) => u.field === "sound.music.genre"));
  assert.equal(json.sound.sfx.by_type.impact.on_cut_pct, 100);
});

test("recipe: unknowns are marked with what would measure them, and a missing sound map says so", (t) => {
  if (skip(t)) return;
  const { md, json } = run(makeRef("nosound", { sound: false }));
  assert.equal(json.sound.sound_map, "no sound map");
  assert.equal(json.sound.tempo_bpm, 120, "analyze.py tempo is kept without a sound map");
  assert.ok(md.includes("no sound map"));
  assert.equal(json.grammar.composition.value, "unknown");
  assert.ok(json.grammar.composition.measure_with.length > 10);
  assert.equal(json.grammar.type.behaviour.value, "unknown", "a template placeholder in the notes is not a value");
  assert.ok(json.unknowns.some((u) => u.field === "grammar.composition"));
  assert.match(md, /unknown \(measure with: /);
});

test("recipe: no rights gate: full skin and frame-locked for any reference, its own media recreated", (t) => {
  if (skip(t)) return;
  const { md, json } = run(makeRef("skin", { notesHex: true }));
  assert.equal(json.header.mode, "frame-locked", "the brief's mode is kept for any reference");
  assert.equal(json.header.rights, "Rights to use the reference are the user's responsibility.");
  assert.ok(!("third_party" in json.header));
  assert.ok(json.look.palette_values.includes("#112233"));
  assert.match(JSON.stringify(json.grammar.transitions), /#12AB34/, "colour values in the notes are kept");
  assert.ok(json.header.recreated.some((x) => /music track/.test(x)) && json.header.recreated.some((x) => /logos/.test(x)));
  assert.match(json.header.people, /ai-media-policy\.md section 9/);
  assert.match(json.prompt, /Never place its own media in the new piece/);
  assert.match(md, /Recreated, never placed in the new piece/);
});

test("recipe: the prompt block lists the open slots and the four-choice questions", (t) => {
  if (skip(t)) return;
  const { json } = run(makeRef("slots"), "--slot", "content=from-scratch", "--slot", "language=en");
  assert.deepEqual(json.open_slots, ["brand", "product_truth", "length", "aspect", "must_include"]);
  assert.match(json.prompt, /Open slots: brand, product_truth, length, aspect, must_include\./);
  assert.match(json.prompt, /four options/);
  assert.match(json.prompt, /ice\/reference\/ref1\/STYLE-RECIPE\.md/);
  assert.match(json.prompt, /- content: from-scratch/);
});

test("router, classify, routes, ice-remake and ice-edit know the recipe", () => {
  assert.match(readText("skills/ice-motion-director/SKILL.md"), /STYLE-RECIPE\.md/);
  assert.match(readText("skills/ice-motion-director/references/classify.md"), /## Style recipes/);
  assert.match(readText("skills/ice-motion-director/references/routes.md"), /recipe/i);
  assert.match(readText("skills/ice-remake/SKILL.md"), /references\/style-recipe\.md/);
  assert.match(readText("skills/ice-edit/SKILL.md"), /STYLE-RECIPE\.md/);
  const ref = readText("skills/ice-remake/references/style-recipe.md");
  for (const s of ["| 1 | Header |", "| 2 | Measured grammar |", "| 3 | Look |", "| 4 | Sound |", "| 5 | Feeling |", "| 6 | Slots |", "| 7 | Prompt block |"]) assert.ok(ref.includes(s), s);
});

test("SKILL.md files touched by the recipe stay under 20 KB", () => {
  const big = ["ice-motion-director", "ice-remake", "ice-edit"].map((s) => `skills/${s}/SKILL.md`)
    .map((f) => [f, statSync(abs(f)).size]).filter(([, n]) => n >= 20 * 1024);
  assert.deepEqual(big, []);
});

// Regression (2026-10-22): a one-take film with a slow push-in, a panel that pops in and out, and a fade to black.
// The camera must see the push (not "static 100%") and the recipe must list the pop and the fade as its transitions.
// Needs ffmpeg plus a Python with numpy and opencv: ICE_PYTHON, else the gates' virtual environment, else PYTHON.
// A Python that has every module a test needs (numpy and cv2 always; more when the test reads what they measure).
function visionPython(...more) {
  const venv = join(tmpdir(), "ice-motion-director-gates", "venv", process.platform === "win32" ? "Scripts/python.exe" : "bin/python");
  const cands = [process.env.ICE_PYTHON && [process.env.ICE_PYTHON], existsSync(venv) && [venv], PYTHON].filter(Boolean);
  const mods = ["numpy", "cv2", ...more].join(", ");
  return cands.find((c) => spawnSync(c[0], [...c.slice(1), "-c", `import ${mods}`], { encoding: "utf8" }).status === 0);
}

test("one-take clip: the camera sees the push and the recipe lists the pop-in and the fade", (t) => {
  const py = visionPython();
  if (!py || !hasCommand("ffmpeg")) { t.skip("needs ffmpeg and a Python with numpy and opencv"); return; }
  const dir = join(work, "onetake"), ref = join(dir, "ice", "reference", "r1");
  mkdirSync(join(ref, "analysis"), { recursive: true });
  const ff = (...a) => { const r = spawnSync("ffmpeg", ["-v", "error", "-y", ...a], { encoding: "utf8", cwd: dir }); assert.equal(r.status, 0, r.stderr); };
  ff("-f", "lavfi", "-i", "life=s=320x180:mold=10:ratio=0.5:seed=7", "-frames:v", "1", "-vf", "scale=1280:720:flags=neighbor", "bg.png");
  ff("-loop", "1", "-i", "bg.png", "-vf", "zoompan=z='1+0.0008*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=640x360:fps=30,"
    + "drawbox=x=40:y=30:w=200:h=60:color=white@1:t=fill:enable='between(t,3,5)',fade=t=out:st=6:d=1,format=yuv420p", "-t", "8", "-r", "30", "clip.mp4");
  const an = spawnSync(py[0], [...py.slice(1), abs("skills/ice-remake/scripts/analyze.py"), join(dir, "clip.mp4"), "--out", join(ref, "analysis")], { encoding: "utf8", timeout: 300000 });
  assert.equal(an.status, 0, an.stderr || an.stdout);
  const rep = JSON.parse(readFileSync(join(ref, "analysis", "report.json"), "utf8"));
  const cam = rep.shot_details[0].camera;
  assert.ok(cam.kind.includes("push_in"), `camera kind ${cam.kind}`);
  assert.ok(cam.segments.some((s) => s.kind.includes("push_in") && s.end - s.start >= 4), JSON.stringify(cam.segments));
  const pops = rep.structure.overlays.filter((o) => o.kind === "pop");
  assert.ok(pops.some((o) => Math.abs(o.start - 3) <= 0.34), JSON.stringify(rep.structure.overlays));
  assert.ok(rep.structure.fades.some((f) => f.kind === "fade_out" && f.start >= 5.5 && f.start <= 6.4), JSON.stringify(rep.structure.fades));
  const { json, md } = run(ref);
  assert.ok(json.grammar.transitions.families_pct["overlay pop"] > 0, JSON.stringify(json.grammar.transitions));
  assert.ok(json.grammar.transitions.families_pct["fade out"] > 0, JSON.stringify(json.grammar.transitions));
  assert.ok(json.grammar.camera.kinds_time_pct.push_in >= 50, JSON.stringify(json.grammar.camera));
  assert.match(md, /overlay pop/);
});

// Regressions from the recipe-only end-to-end test (2026-10-22): a picture stored sideways, a dark-mode UI that
// cropdetect mistook for letterbox, and morph seams that the recipe called hard cuts.
function synth(name, inputs, filter, py = visionPython()) {
  if (!py || !hasCommand("ffmpeg")) return null;
  const dir = join(work, name), ref = join(dir, "ice", "reference", "r1");
  mkdirSync(join(ref, "analysis"), { recursive: true });
  const r = spawnSync("ffmpeg", ["-v", "error", "-y", ...inputs, ...filter, join(dir, "clip.mp4")], { encoding: "utf8", cwd: dir });
  assert.equal(r.status, 0, r.stderr);
  const an = spawnSync(py[0], [...py.slice(1), "-I", abs("skills/ice-remake/scripts/analyze.py"), join(dir, "clip.mp4"), "--out", join(ref, "analysis")], { encoding: "utf8", timeout: 300000 });
  assert.equal(an.status, 0, an.stderr || an.stdout);
  return { ref, dir, rep: JSON.parse(readFileSync(join(ref, "analysis", "report.json"), "utf8")) };
}

test("sideways clip: the orientation check turns it upright and the picture size is the real one", (t) => {
  const rows = Array.from({ length: 9 }, (_, k) => { const w = (k * 137) % 500 + 250; return `drawbox=x=120:y=${80 + k * 65}:w=${w}:h=22:color=white:t=fill,drawbox=x=${140 + w}:y=${80 + k * 65}:w=60:h=22:color=0x33ff66:t=fill`; }).join(",");
  const out = synth("sideways", ["-f", "lavfi", "-i", "color=c=0x0a0a0a:s=1280x720:r=30:d=4"], ["-vf", `${rows},transpose=1,format=yuv420p`]);
  if (!out) { t.skip("needs ffmpeg and a Python with numpy and opencv"); return; }
  assert.equal(out.rep.orientation.rotated, true, JSON.stringify(out.rep.orientation));
  assert.equal(out.rep.orientation.applied, 270);
  assert.deepEqual([out.rep.picture.width, out.rep.picture.height], [1280, 720]);
  const { json } = run(out.ref);
  assert.match(json.header.aspect, /^1280:720/);
});

test("dark UI clip: no letterbox crop when picture reaches the frame edges", (t) => {
  const out = synth("darkui", ["-f", "lavfi", "-i", "color=c=0x080808:s=1280x720:r=30:d=4"],
    ["-vf", "drawbox=x=500:y=200:w=280:h=40:color=white:t=fill,drawbox=x=500:y='280+mod(t*80,200)':w=280:h=30:color=0x33ff66:t=fill,"
      + "drawbox=x=0:y=0:w=1280:h=720:color=0x33ff66:t=fill:enable='between(t,2,2.5)',format=yuv420p"]);
  if (!out) { t.skip("needs ffmpeg and a Python with numpy and opencv"); return; }
  assert.equal(out.rep.crop, null);
  assert.match(out.rep.crop_refused, /refused/);
  assert.equal(out.rep.orientation.rotated, false);
});

test("morph clip: a dissolve seam is gradual, never a hard cut; a real cut still is one", (t) => {
  // Seams are labelled from shot detection: without scenedetect analyze.py finds no shots at all and the recipe rightly
  // writes the cut statistics as unknown, so this test needs scenedetect and says so when it is missing.
  const py = visionPython("scenedetect");
  if (!py || !hasCommand("ffmpeg")) { t.skip("needs ffmpeg and a Python with numpy, opencv and scenedetect (node scripts/gates.mjs --python builds one)"); return; }
  const imgs = join(work, "imgs"); mkdirSync(imgs, { recursive: true });
  const ff = (...a) => assert.equal(spawnSync("ffmpeg", ["-v", "error", "-y", ...a], { cwd: imgs }).status, 0);
  ff("-f", "lavfi", "-i", "life=s=320x180:mold=10:ratio=0.5:seed=3", "-frames:v", "1", "-vf", "scale=640:360:flags=neighbor", "a.png");
  ff("-f", "lavfi", "-i", "mandelbrot=s=640x360", "-frames:v", "1", "b.png");
  const two = (t1) => ["-loop", "1", "-t", t1, "-i", join(imgs, "a.png"), "-loop", "1", "-t", t1, "-i", join(imgs, "b.png")];
  const morph = synth("morph", two("3"), ["-filter_complex", "[0]fps=30,format=yuv420p[x];[1]fps=30,format=yuv420p[y];[x][y]xfade=transition=dissolve:duration=1:offset=2,format=yuv420p"], py);
  const cut = synth("cut", two("2"), ["-filter_complex", "[0]fps=30,format=yuv420p[x];[1]fps=30,format=yuv420p[y];[x][y]concat=n=2:v=1,format=yuv420p"], py);
  assert.ok((morph.rep.boundaries || []).every((b) => b.kind === "gradual"), JSON.stringify(morph.rep.boundaries));
  const m = run(morph.ref).json;
  assert.ok(!Object.keys(m.grammar.transitions.families_pct || {}).some((f) => /hard cut/.test(f)), JSON.stringify(m.grammar.transitions));
  assert.notEqual(typeof m.grammar.cuts_vs_beats, "object", "no cut statistics without hard cuts");
  assert.equal(cut.rep.boundaries[0].kind, "cut", JSON.stringify(cut.rep.boundaries));
  assert.ok(run(cut.ref).json.grammar.transitions.families_pct["hard cut"] > 0);
});

test("ice-remake scripts run under python -I (their own folder on sys.path)", (t) => {
  if (skip(t)) return;
  for (const f of ["frames.py", "compare.py", "recipe.py"]) {
    const r = spawnSync(PYTHON[0], [...PYTHON.slice(1), "-I", abs(`skills/ice-remake/scripts/${f}`), "--help"], { encoding: "utf8" });
    assert.ok(!/ModuleNotFoundError: No module named '(runtime|analyze)'/.test(r.stderr), `${f}: ${r.stderr}`);
  }
});

// Stillness on dark UI (2026-10-22): a small element moving on a near-black ground for 2 s, then resting for 2 s.
// The whole-frame method called all of it still; the content-region measure must see about half.
test("dark UI stillness: a small moving element is not still", (t) => {
  const out = synth("darkstill", ["-f", "lavfi", "-i", "color=c=0x080808:s=1280x720:r=30:d=4", "-f", "lavfi", "-i", "color=c=0x33ff66:s=40x40:r=30:d=4"],
    ["-filter_complex", "[0][1]overlay=x='if(lt(t,2),200+t*150,500)':y=300,format=yuv420p"]);
  if (!out) { t.skip("needs ffmpeg and a Python with numpy and opencv"); return; }
  const st = out.rep.stillness;
  assert.ok(st.ratio >= 0.3 && st.ratio <= 0.65, JSON.stringify(st));
  assert.ok(st.raw_frame_ratio > st.ratio, "the whole-frame method is the biased one");
  assert.ok(st.calm_runs.some(([a, b]) => a >= 1.8 && b - a >= 1.5), JSON.stringify(st.calm_runs));
  assert.equal(out.rep.crop, null, "a small element on black is not a letterbox");
  const { json } = run(out.ref);
  assert.equal(json.grammar.stillness.ratio, st.ratio);
});

test("recipe: the cursor line reaches the grammar", (t) => {
  if (skip(t)) return;
  const ref = makeRef("cursor");
  writeFileSync(join(ref, "ANALYSIS.md"), readFileSync(join(ref, "ANALYSIS.md"), "utf8") + "Cursor: hand pointer, eases in from bottom right, clicks at 5.9 s to start the hit\n");
  const { md, json } = run(ref);
  assert.match(json.grammar.cursor, /clicks at 5\.9 s/);
  assert.match(md, /- Cursor: hand pointer/);
  assert.match(run(makeRef("nocursor")).json.grammar.cursor, /none noted/);
});

test("one rule for when a critic report is required; the router points to it", () => {
  const roles = readText("skills/ice-direction/references/roles.md");
  assert.match(roles, /### When a critic report is required/);
  assert.match(roles, /4\. When a critic report is required/);
  const router = readText("skills/ice-motion-director/SKILL.md");
  assert.match(router, /roles\.md` section 5, "When a critic report is required"/);
  assert.doesNotMatch(router, /single batched chain check/);
});

// Second end-to-end run (2026-10-22): one regression per fix.
function fixtureRef(name, { timeline = "", peaks = null, notes = "", sm = soundMap, extra = {} } = {}) {
  const ref = makeRef(name);
  const rep = JSON.parse(readFileSync(join(ref, "analysis", "report.json"), "utf8"));
  Object.assign(rep, extra);
  writeFileSync(join(ref, "analysis", "report.json"), JSON.stringify(rep));
  if (sm) writeFileSync(join(ref, "sound_map.json"), JSON.stringify(sm));
  if (timeline) writeFileSync(join(ref, "TIMELINE.md"), timeline);
  if (peaks) writeFileSync(join(ref, "peaks.json"), JSON.stringify(peaks));
  if (notes) writeFileSync(join(ref, "ANALYSIS.md"), readFileSync(join(ref, "ANALYSIS.md"), "utf8") + notes);
  return ref;
}

test("fix 1: the prompt block names both limits, frames and real people included", (t) => {
  if (skip(t)) return;
  const { json } = run(makeRef("limits"));
  assert.match(json.prompt, /its footage and frames/);
  assert.match(json.prompt, /its logos; its characters/);
  assert.match(json.prompt, /real people's faces and voices: ice-assets references\/ai-media-policy\.md section 9/);
});

test("fix 2: the palette keeps ground, text and accent with their shares", (t) => {
  if (skip(t)) return;
  const palette = [{ hex: "#030403", share: 0.8, role: "ground" }, { hex: "#23F828", share: 0.08, role: "accent" }, { hex: "#DCDEDB", share: 0.01, role: "text" }];
  const { json } = run(fixtureRef("palette", { extra: { palette } }));
  assert.deepEqual(json.look.palette.map((c) => c.role), ["ground", "accent", "text"]);
  assert.equal(json.look.palette[1].share_pct, 8);
});

test("fix 3: TIMELINE.md wins the transition timeline; analyzer labels are evidence only", (t) => {
  if (skip(t)) return;
  const rows = ["fade in", "morph", "morph", "morph", "whip, fast", "morph"].map((f, i) => `| ${i + 1} | x | x | x | x | ${f} |`).join("\n");
  const timeline = `| # | in-out s | content | camera | light | transition in |\n|---|---|---|---|---|---|\n${rows}\n`;
  const structure = { fades: [{ kind: "cut_to_black", start: 11.5, end: 11.8 }], black: [], overlays: [{ start: 4, end: 4.3, kind: "pop", region: [0, 0, 1, 1] }], luma_6fps: [] };
  const { json } = run(fixtureRef("timeline", { timeline, extra: { structure } }));
  const fams = json.grammar.transitions.timeline.map((e) => e.family);
  assert.deepEqual(fams, ["fade in", "morph", "morph", "morph", "whip", "morph"]);
  assert.ok(json.grammar.transitions.analyzer_evidence.some((e) => e.label === "cut to black"));
  assert.equal(json.grammar.cuts_vs_beats, "no hard cuts");
});

test("fixes 4 and 5: no None, True or False reaches the reader; the climax table says not measured", (t) => {
  if (skip(t)) return;
  const peaks = [{ id: "P1", from: 6, hit: 7.25, to: 8, build: "a rise", hold: "a pause", hit_what: "the frame flips", after: "it settles" }];
  const luma = Array.from({ length: 72 }, (_, i) => (i >= 44 ? 0.6 : 0.1));
  const { md, json } = run(fixtureRef("climax", { peaks, extra: { structure: { fades: [], black: [], overlays: [], luma_6fps: luma } } }));
  assert.doesNotMatch(md, /\bNone\b|\bTrue\b|\bFalse\b/);
  assert.match(md, /\| 60 \| P1 \| not measured \| (yes|no) \| (yes|no) \| 0\.5 \|/);
  assert.equal(json.grammar.climax.peaks[0].brightness_jump, 0.5);
  assert.doesNotMatch(json.feeling.measured_markers.join(" "), /None/);
});

test("fix 4: a film with no hard cuts ranks its markers by motion, not by cuts", (t) => {
  if (skip(t)) return;
  const shot_details = [{ shot: 1, start: 0, end: 12, camera: { kind: ["static"], speed: 0, pace: "still", segments: [{ start: 0, end: 6, kind: ["static"], speed: 0, elements_move: true }, { start: 6, end: 12, kind: ["static"], speed: 0, elements_move: false }] },
    look: { brightness: 0.1, contrast: 0.1, dark_ratio: 0.7, colourfulness: 0.2, dominant: ["#000000"] } }];
  const { json } = run(fixtureRef("motion", { extra: { shots: [[0, 12]], pacing: { count: 1, mean_shot_s: 12, one_take: true }, shot_details } }));
  const m = json.feeling.measured_markers.join(" | ");
  assert.doesNotMatch(m, /densest cutting/);
  assert.match(m, /busiest stretch/);
});

test("fixes 6 and 7: the tempo range and an exact-tempo unknown when reads disagree; a key with no margin is unknown", (t) => {
  if (skip(t)) return;
  const sm = { ...soundMap, music: { ...soundMap.music, tempo_bpm: 112, tempo_confidence: 0.9 }, notes: ["Key A minor: profile correlation 0.67, margin over the next key 0.00 (low)."] };
  const { json } = run(fixtureRef("tempo", { sm }));
  assert.deepEqual(json.grammar.tempo.range_bpm, [112, 120]);
  assert.equal(json.grammar.tempo.exact_tempo.value, "unknown");
  assert.ok(json.unknowns.some((u) => u.field === "grammar.tempo.exact_tempo"));
  assert.equal(json.sound.music.key.value, "unknown");
  assert.ok(json.unknowns.some((u) => u.field === "sound.music.key"));
});

test("fix 6: analyze.py reads a steady 125 bpm click track within 1 bpm", (t) => {
  const py = visionPython();
  if (!py || !hasCommand("ffmpeg") || spawnSync(py[0], [...py.slice(1), "-c", "import librosa"]).status !== 0) { t.skip("needs ffmpeg and librosa"); return; }
  const out = synth("clicks", ["-f", "lavfi", "-i", "color=c=gray:s=320x180:r=30:d=12", "-f", "lavfi", "-i",
    "aevalsrc='0.8*sin(2*PI*900*t)*lt(mod(t\,0.48)\,0.03)':s=44100:d=12"], ["-shortest", "-c:v", "libx264", "-c:a", "aac", "-pix_fmt", "yuv420p"]);
  assert.ok(Math.abs(out.rep.audio.bpm - 125) <= 1, JSON.stringify(out.rep.audio.bpm_reads));
  assert.ok(out.rep.audio.bpm_range.length === 2);
});

test("fix 8: a list scrolling on a dark ground in a locked frame is element motion, not a camera move", (t) => {
  const rows = Array.from({ length: 20 }, (_, k) => `drawbox=x=20:y=${k * 70 + 10}:w=${120 + (k * 53) % 160}:h=36:color=0x${(0x505050 + k * 0x070707).toString(16)}:t=fill`).join(",");
  const out = synth("listscroll", ["-f", "lavfi", "-i", "color=c=0x060606:s=1280x720:r=30:d=5", "-f", "lavfi", "-i", "color=c=0x101010:s=320x1400:r=30:d=5"],
    ["-filter_complex", `[1]${rows}[list];[0][list]overlay=x=480:y='-t*140',format=yuv420p`]);
  if (!out) { t.skip("needs ffmpeg and a Python with numpy and opencv"); return; }
  const cam = out.rep.shot_details[0].camera;
  assert.deepEqual(cam.kind, ["static"], JSON.stringify(cam));
  assert.ok(cam.element_motion_time_pct >= 50, JSON.stringify(cam));
});

test("recipe-only: ice-state takes size not_applicable and ends on the recipe, not a film", () => {
  const dir = mkdtempSync(join(tmpdir(), "ice-recipe-state-"));
  const st = (...a) => spawnSync(process.execPath, [abs("skills/ice-motion-director/scripts/ice-state.mjs"), ...a], { cwd: dir, encoding: "utf8" });
  st("init", "--project", "t", "--route", "remake", "--mode", "auto");
  for (const kv of [["run_mode", "recipe-only"], ["size", "not_applicable"], ["order", "01 10"]]) assert.equal(st("set", ...kv).status, 0);
  st("set", "01", "approved", "--by", "approver");
  assert.match(st("set", "10", "approved", "--by", "approver").stdout, /style recipe is delivered/);
  rmSync(dir, { recursive: true, force: true });
});
