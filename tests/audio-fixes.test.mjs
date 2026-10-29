// ice-audio master_audio.py: the music has no fade-in unless asked for, and every music edge (fade-in, fade-out,
// start offset, loop) is an explicit flag recorded in master.json. Real sound by default (owner decision,
// 2026-10-29): no code score on a default path, the mgaudio opt-in sentence once, the options flow, and the scripts
// match_music.py and preview_options.py (help, then a ranking and an equal-loudness run on generated tones).
// Graph checks need Python 3.10+; the render checks also need ffmpeg and ffprobe on PATH, the ranking numpy and
// scipy. Each test skips cleanly when its tool is missing.
// Run: node --test tests/
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { abs, findPython, hasCommand, readText, repoFiles } from "./helpers.mjs";

const PYTHON = findPython();
const requirePython = Boolean(process.env.CI);
const FFMPEG = hasCommand("ffmpeg") && hasCommand("ffprobe");
const SCRIPT_DIR = abs("skills/ice-audio/scripts");
const SCRIPT = abs("skills/ice-audio/scripts/master_audio.py");

// Imports master_audio from its folder and prints a JSON answer; no ffmpeg needed.
function py(code) {
  const prelude = `import json, pathlib, sys\nsys.path.insert(0, sys.argv[1])\nimport master_audio as m\n`;
  const r = spawnSync(PYTHON[0], [...PYTHON.slice(1), "-c", prelude + code, SCRIPT_DIR], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  return JSON.parse(r.stdout);
}

const GRAPH = (extra) => `
inputs, graph = m.build_filter_graph(
    video_path=pathlib.Path("v.mp4"), video_duration=10.0, video_has_audio=False, keep_video_audio=False,
    vo_path=None, vo_offset=0.0, music_path=pathlib.Path("m.wav"), music_gain=-18.0, duck=False, sfx_items=[]${extra})
print(json.dumps({"inputs": inputs, "graph": graph}))
`;

function needPython(t) {
  if (PYTHON) return true;
  if (requirePython) assert.fail("Python 3 not found (set PYTHON)");
  t.skip("Python 3 not found");
  return false;
}

test("master_audio: no music fade-in by default, opt-in with --music-fade-in", (t) => {
  if (!needPython(t)) return;
  const defaults = py(`a = m.build_parser().parse_args(["--video", "v", "--out", "o"])
print(json.dumps({"fade_in": a.music_fade_in, "fade_out": a.music_fade_out, "loop": a.music_loop, "start": a.music_start}))`);
  assert.deepEqual(defaults, { fade_in: 0, fade_out: 1.5, loop: true, start: 0 });

  const plain = py(GRAPH(""));
  assert.doesNotMatch(plain.graph, /afade=t=in/, "the music must start at full level unless a fade-in is asked for");
  assert.match(plain.graph, /afade=t=out:st=8\.50:d=1\.50/, "the documented default fade-out stays");

  const opted = py(GRAPH(", music_fade_in=0.75, music_fade_out=0"));
  assert.match(opted.graph, /afade=t=in:st=0:d=0\.750/);
  assert.doesNotMatch(opted.graph, /afade=t=out/, "fade-out 0 keeps the track's own ending");

  const capped = py(GRAPH(", music_fade_in=30"));
  assert.match(capped.graph, /afade=t=in:st=0:d=5\.000/, "a fade is capped at half the film");
});

test("master_audio: music loop is an explicit flag", (t) => {
  if (!needPython(t)) return;
  const looped = py(GRAPH(""));
  assert.ok(looped.inputs.includes("-stream_loop"), "default keeps the old looping behaviour");
  const once = py(GRAPH(", music_loop=False"));
  assert.ok(!once.inputs.includes("-stream_loop"), "--no-music-loop must not loop the track");
});

const work = mkdtempSync(join(tmpdir(), "ice audio fixes "));
after(() => rmSync(work, { recursive: true, force: true }));

// Mean level in dB of a time window of the file's audio, from ffmpeg volumedetect.
function meanDb(file, start, dur) {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-ss", String(start), "-t", String(dur), "-i", file,
    "-map", "0:a:0", "-af", "volumedetect", "-f", "null", "-"], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  const m = /mean_volume:\s*(-?[\d.]+|-inf) dB/.exec(r.stderr);
  assert.ok(m, r.stderr);
  return m[1] === "-inf" ? -Infinity : Number(m[1]);
}

test("master_audio: a cold open hits at full level on the first frames (render)", { skip: FFMPEG ? false : "ffmpeg or ffprobe not on PATH" }, (t) => {
  if (!needPython(t)) return;
  const video = join(work, "picture one.mp4");
  const music = join(work, "score one.wav");
  const mk = (args) => spawnSync("ffmpeg", ["-loglevel", "error", "-y", ...args], { encoding: "utf8" });
  let r = mk(["-f", "lavfi", "-i", "color=c=black:size=160x90:rate=30:duration=3", "-c:v", "libx264", "-pix_fmt", "yuv420p", video]);
  assert.equal(r.status, 0, r.stderr);
  r = mk(["-f", "lavfi", "-i", "sine=frequency=220:sample_rate=48000:duration=3", "-ac", "2", music]);
  assert.equal(r.status, 0, r.stderr);

  const master = (outName, ...extra) => {
    const out = join(work, outName, "film.mp4");
    const res = spawnSync(PYTHON[0], [...PYTHON.slice(1), SCRIPT, "--video", video, "--out", out, "--music", music,
      "--music-fade-out", "0", ...extra], { encoding: "utf8", timeout: 300000 });
    assert.equal(res.status, 0, res.stdout + res.stderr);
    return { out, summary: JSON.parse(readFileSync(join(work, outName, "master.json"), "utf8")) };
  };

  const cold = master("cold");
  const head = meanDb(cold.out, 0.05, 0.25);
  const body = meanDb(cold.out, 1.5, 0.5);
  assert.ok(body - head < 1.5, `opening is ${(body - head).toFixed(1)} dB under the body; the music was faded in`);
  assert.equal(cold.summary.music_edges.fade_in_sec, 0);
  assert.equal(cold.summary.music_edges.fade_out_sec, 0);
  assert.equal(cold.summary.music_edges.looped, false);

  const faded = master("faded", "--music-fade-in", "1");
  const fadedHead = meanDb(faded.out, 0.05, 0.25);
  assert.ok(body - fadedHead > 6, `an asked-for fade-in must be audible (only ${(body - fadedHead).toFixed(1)} dB)`);
  assert.equal(faded.summary.music_edges.fade_in_sec, 1);
});

// ---------------------------------------------------------------- real sound by default (owner decision, 2026-10-29)
const SKILL = "skills/ice-audio/SKILL.md";
const MUSIC_CHOICE = "skills/ice-audio/references/music-choice-and-licensing.md";
const OPT_IN = "Music and sound effects made by code (mgaudio) are opt-in only: used when the user asks for music or sound made by code in their own words; never a default, a fallback or a stand-in (owner decision, 2026-10-29).";

// The body of the "## <n>. " section of a Markdown file.
function section(file, n) {
  const text = readText(file);
  const start = text.search(new RegExp(`^## ${n}\\. `, "m"));
  assert.ok(start >= 0, `${file} has no section ${n}`);
  const next = text.slice(start + 4).search(/^## /m);
  return next < 0 ? text.slice(start) : text.slice(start, start + 4 + next);
}

// One column of every body row of the Markdown tables in a block of text (header and rule rows skipped).
function column(block, index) {
  const rows = block.split(/\r?\n/).filter((l) => /^\|/.test(l));
  return rows.filter((l, i) => !/^\|\s*-/.test(l) && !(rows[i + 1] && /^\|\s*-/.test(rows[i + 1])))
    .map((l) => l.split("|").slice(1, -1).map((c) => c.trim())[index] ?? "");
}

const CODE_DEFAULT = /code score|generated by code|made by code|code-made|mgaudio/i;

test("ice-audio: no code score on the default path (policy table, music-choice section 2, sfx.md section 2)", () => {
  const policy = column(section(SKILL, 3), 2);
  assert.ok(policy.length >= 10, "the policy table of SKILL.md section 3 was not found");
  assert.deepEqual(policy.filter((c) => CODE_DEFAULT.test(c)), [], "a music default in the policy table names a code score");

  const music = column(section(MUSIC_CHOICE, 2), 1).map((c) => c.replace(/never a code score/gi, ""));
  assert.ok(music.length >= 6, "the scope table of music-choice section 2 was not found");
  assert.deepEqual(music.filter((c) => CODE_DEFAULT.test(c)), [], "a default source in music-choice section 2 is made by code");
  assert.match(section(MUSIC_CHOICE, 2), /music needed[^|]*3 real tracks/, "no track that fits ends in an empty bed and 3 named tracks");

  const sfx = column(section("skills/ice-audio/references/sfx.md", 2), 1);
  assert.ok(sfx.length >= 3, "the table of sfx.md section 2 was not found");
  assert.deepEqual(sfx.filter((c) => CODE_DEFAULT.test(c)), [], "an SFX default in sfx.md section 2 is made by code");
  assert.match(section("skills/ice-audio/references/sfx.md", 7), /Openverse needs no key/, "no Freesound key falls back to Openverse");
});

test("ice-audio: the mgaudio opt-in sentence lives once, in SKILL.md core rule 7, and music-by-code.md opens with it", () => {
  assert.equal(readText(SKILL).split(OPT_IN).length - 1, 1, "the opt-in sentence must be in SKILL.md exactly once");
  assert.match(section(SKILL, 1), /^7\. .*opt-in only: used when the user asks/m, "the sentence belongs to core rule 7");
  const elsewhere = repoFiles().filter((f) => f.startsWith("skills/") && f.endsWith(".md") && f !== SKILL && readText(f).includes(OPT_IN));
  assert.deepEqual(elsewhere, [], "other files point to core rule 7 instead of repeating the sentence");
  const head = readText("skills/ice-audio/references/music-by-code.md").split(/\r?\n/).slice(0, 6).join("\n");
  assert.match(head, /Opt-in only: open this file only when the user asked for music or SFX made by code in their own words/);
});

test("ice-audio: the options flow names stage 01, stop B, the 06 card and the delivery-note fallback", () => {
  const s5 = section(SKILL, 5);
  for (const [re, what] of [[/preview_options\.py/, "the preview script"], [/compare\.html/, "the compare page"],
    [/Stage 01, with the questions/, "music-led films at stage 01"], [/Stop B, the one preview approval/, "stop B"],
    [/The 06 review card/, "the 06 card in step mode"], [/closest by measurement/, "the measured pick when nobody answers"],
    [/delivery note names the other two/, "the delivery-note fallback"], [/never a code score/, "the empty bed on the last rung"]]) {
    assert.match(s5, re, `SKILL.md section 5 must name ${what}`);
  }
  assert.match(s5, /No new stop is added/);
  const s3 = section(MUSIC_CHOICE, 3);
  assert.match(s3, /Web research queries[^\n]*trace check/, "web research queries keep the trace rule");
  assert.match(s3, /Structured library filters[^\n]*measured tempo window/, "library filters may use the measured tempo window");
  assert.match(s3, /^8\. .*preview_options\.py/m, "item 8 points to the preview script");
});

const hasNumpy = PYTHON && spawnSync(PYTHON[0], [...PYTHON.slice(1), "-c", "import numpy, scipy"], { stdio: "ignore" }).status === 0;

test("match_music.py and preview_options.py exist and print help", (t) => {
  if (!needPython(t)) return;
  for (const name of ["match_music.py", "preview_options.py"]) {
    const r = spawnSync(PYTHON[0], [...PYTHON.slice(1), join(SCRIPT_DIR, name), "--help"], { encoding: "utf8", timeout: 60000 });
    assert.equal(r.status, 0, `${name}: ${r.stderr}`);
    assert.match(r.stdout, /usage:/, name);
  }
  assert.match(section(SKILL, 7), /`scripts\/match_music\.py`[\s\S]*`scripts\/preview_options\.py`/, "SKILL.md section 7 lists both scripts");
});

// Writes 8 s mono WAVs with numpy: a reference bed (a 220 Hz pad and a kick at 120 BPM), a close track (the same pad,
// a kick at 121 BPM, 6 dB quieter) and a far track (a 1760 Hz pad with noise, no beat).
const TONES = String.raw`
import sys, wave
import numpy as np
sr = 22050
def track(path, bpm, f0, noise, dur, gain):
    rng = np.random.default_rng(int(f0))
    t = np.arange(int(sr * dur)) / sr
    x = 0.15 * np.sin(2 * np.pi * f0 * t) + 0.1 * np.sin(2 * np.pi * f0 * 1.5 * t)
    if noise:
        x += 0.08 * rng.standard_normal(len(t)) * (0.5 + 0.5 * np.sin(2 * np.pi * 3 * t))
    if bpm:
        k = np.arange(int(0.12 * sr)) / sr
        kick = 0.8 * np.sin(2 * np.pi * (50 + 80 * np.exp(-k * 30)) * k) * np.exp(-k * 25)
        for b in np.arange(0, dur, 60.0 / bpm):
            i = int(b * sr)
            m = min(len(kick), len(t) - i)
            x[i:i + m] += kick[:m]
    x = np.clip(x * gain, -1, 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes((x * 32767).astype("<i2").tobytes())
d = sys.argv[1]
track(d + "/reference bed.wav", 120, 220, False, 8.0, 1.0)
track(d + "/close track.wav", 121, 220, False, 8.0, 0.5)
track(d + "/far track.wav", 0, 1760, True, 8.0, 1.0)
`;

test("match_music.py ranks the measured closest track first; preview_options.py levels the options (generated tones)",
  { skip: !PYTHON ? "Python 3 not found" : !hasNumpy ? "numpy or scipy not installed" : !FFMPEG ? "ffmpeg or ffprobe not on PATH" : false }, () => {
    const dir = join(work, "match music");
    mkdirSync(dir, { recursive: true });
    const py3 = (...args) => spawnSync(PYTHON[0], [...PYTHON.slice(1), ...args], { encoding: "utf8", timeout: 300000 });
    let r = py3("-c", TONES, dir);
    assert.equal(r.status, 0, r.stderr);
    const ranked = join(dir, "ranked");
    r = py3(join(SCRIPT_DIR, "match_music.py"), "music", "--ref", join(dir, "reference bed.wav"), "--out", ranked,
      join(dir, "far track.wav"), join(dir, "close track.wav"));
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const ranking = JSON.parse(readFileSync(join(ranked, "ranking.json"), "utf8"));
    assert.deepEqual(ranking.ranking.map((x) => x.file), ["close track.wav", "far track.wav"], "the same tempo and key rank first");
    assert.ok(ranking.ranking[0].total < ranking.ranking[1].total);

    const picture = join(dir, "picture one.mp4");
    r = spawnSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-i", "color=c=black:size=160x90:rate=30:duration=4",
      "-c:v", "libx264", "-pix_fmt", "yuv420p", picture], { encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr);
    const options = join(dir, "options");
    r = py3(join(SCRIPT_DIR, "preview_options.py"), "--video", picture, "--out", options, "--ranking", join(ranked, "ranking.json"),
      join(dir, "close track.wav"), join(dir, "far track.wav"));
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const opts = JSON.parse(readFileSync(join(options, "options.json"), "utf8"));
    assert.equal(opts.options.length, 2);
    assert.ok(opts.loudness_spread_lu <= 0.5, `options differ by ${opts.loudness_spread_lu} LU; the ear would pick the loudest`);
    assert.ok(opts.options.every((o) => Math.abs(o.music_lufs + 16) <= 0.5), JSON.stringify(opts.options.map((o) => o.music_lufs)));
    assert.equal(opts.options[0].match_distance, ranking.ranking[0].total, "the match distance rides into the options");
    assert.match(readFileSync(join(options, "compare.html"), "utf8"), /option-2\.mp4/);
  });

// News reel (sfx.md section 3b): under speech a broadcast effect is sub or air. `match_music.py sfx --profile news-reel`
// rejects a candidate whose energy sits in the 150 Hz to 4 kHz voice band and ranks a sub boom first, where the default
// profile prefers the mid hit and flags the boom as weak on phones.
const HITS = String.raw`
import sys, wave
import numpy as np
sr = 22050
def hit(path, f):
    t = np.arange(int(sr * 1.6)) / sr
    x = 0.8 * np.sin(2 * np.pi * f * t) * np.exp(-t * 4)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes((x * 32767).astype("<i2").tobytes())
hit(sys.argv[1] + "/sub boom.wav", 55)
hit(sys.argv[1] + "/mid hit.wav", 900)
`;

test("match_music.py sfx --profile news-reel: sub or air only under speech, the voice-band hit is rejected (generated tones)",
  { skip: !PYTHON ? "Python 3 not found" : !hasNumpy ? "numpy or scipy not installed" : !FFMPEG ? "ffmpeg or ffprobe not on PATH" : false }, () => {
    const dir = join(work, "news reel sfx");
    mkdirSync(dir, { recursive: true });
    const py3 = (...args) => spawnSync(PYTHON[0], [...PYTHON.slice(1), ...args], { encoding: "utf8", timeout: 120000 });
    let r = py3("-c", HITS, dir);
    assert.equal(r.status, 0, r.stderr);
    const files = [join(dir, "mid hit.wav"), join(dir, "sub boom.wav")];
    r = py3(join(SCRIPT_DIR, "match_music.py"), "sfx", "--kind", "impact", "--profile", "news-reel", "--out", join(dir, "news"), ...files);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const news = JSON.parse(readFileSync(join(dir, "news", "sfx-impact-ranking.json"), "utf8"));
    assert.equal(news.profile, "news-reel");
    assert.deepEqual(news.ranking.map((x) => x.file), ["sub boom.wav", "mid hit.wav"], "the sub boom ranks first for a news reel");
    assert.match(news.ranking[1].notes.join(" "), /voice band/, "the mid hit is rejected for sitting in the voice band");
    r = py3(join(SCRIPT_DIR, "match_music.py"), "sfx", "--kind", "impact", "--out", join(dir, "default"), ...files);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const plain = JSON.parse(readFileSync(join(dir, "default", "sfx-impact-ranking.json"), "utf8"));
    assert.equal(plain.ranking[0].file, "mid hit.wav", "the default profile keeps its phone rule");
  });
