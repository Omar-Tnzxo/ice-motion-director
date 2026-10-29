// ice-audio master_audio.py: the music has no fade-in unless asked for, and every music edge (fade-in, fade-out,
// start offset, loop) is an explicit flag recorded in master.json. Real sound by default (owner decision,
// 2026-10-29): no code score on a default path, the mgaudio opt-in sentence once, the options flow, and the scripts
// match_music.py and preview_options.py (help, then a ranking and an equal-loudness run on generated tones).
// audit (0.2.5, lesson L18): qc.py --audit blocks a bed over the voice and a DC offset and writes the ear list,
// its profile table equals mix-and-master.md section 5 and quick-checks.mjs, loudness --profile exits 1 off the
// profile, align_script_to_asr.py --stem tells masked from misheard, master_audio.py fails a cut voice, and
// qc.py --diagnose finds hum and a noise floor.
// every effect heard (0.2.6): master_audio.py places SFX and the voice offset sample-exact, keeps the mix as long as the
// film and writes the no-SFX premix; qc.py --audit A14 measures each cue against it (a late or unheard hero cue blocks),
// A7 sends unexplained level jumps at cuts to the ear list, A17 gives the repeated-pulse item its time range.
// Graph checks need Python 3.10+; the render checks also need ffmpeg and ffprobe on PATH, the ranking numpy and
// scipy. Each test skips cleanly when its tool is missing.
// Run: node --test tests/
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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

// ---------------------------------------------------------------- audit (0.2.5): the mix is measured, with an ear list
const QC = join(SCRIPT_DIR, "qc.py");
const ALIGN = abs("skills/ice-type/scripts/align_script_to_asr.py");
const QUICK = abs("skills/ice-qa/scripts/quick-checks.mjs");
const AUDIT_SKIP = !PYTHON ? "Python 3 not found" : !hasNumpy ? "numpy not installed" : !FFMPEG ? "ffmpeg or ffprobe not on PATH" : false;
const runPy = (...args) => spawnSync(PYTHON[0], [...PYTHON.slice(1), ...args], { encoding: "utf8", timeout: 300000 });

// 20 s at 48 kHz: a voice stem of syllable-gated tones (220, 1500 and 2600 Hz) from 1 s to 19 s, a bed stem (110 Hz,
// 2000 Hz and noise) scaled by argv[2], and their sum plus a DC offset of argv[3] as mix.wav. Illustration only.
const MIX_TONES = String.raw`
import os, sys, wave
import numpy as np
sr, dur = 48000, 20.0
d, gain, dc = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
t = np.arange(int(sr * dur)) / sr
gate = (((t % 0.3) < 0.2) & (t > 1.0) & (t < dur - 1.0)).astype(float)
gate = np.convolve(gate, np.ones(480) / 480, mode="same")
voice = gate * (0.12 * np.sin(2 * np.pi * 220 * t) + 0.08 * np.sin(2 * np.pi * 1500 * t) + 0.06 * np.sin(2 * np.pi * 2600 * t))
rng = np.random.default_rng(1)
bed = gain * (0.2 * np.sin(2 * np.pi * 110 * t) + 0.1 * np.sin(2 * np.pi * 2000 * t) + 0.05 * rng.standard_normal(len(t)))
def write(path, x):
    x = np.clip(x, -1, 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes((np.stack([x, x], axis=1) * 32767).astype("<i2").tobytes())
os.makedirs(d + "/stems", exist_ok=True)
write(d + "/stems/voice.wav", voice)
write(d + "/stems/music.wav", bed)
write(d + "/mix.wav", voice + bed + dc)
`;

// A project folder with stems/ and film.mp4 (AAC, 48 kHz), audited against `social`; memoized per name.
const audits = {};
function auditRun(name, bedGain, dc = 0) {
  if (audits[name]) return audits[name];
  const dir = join(work, `audit ${name}`);
  mkdirSync(dir, { recursive: true });
  let r = runPy("-c", MIX_TONES, dir, String(bedGain), String(dc));
  assert.equal(r.status, 0, r.stderr);
  r = spawnSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-i", "color=c=black:size=160x90:rate=30:duration=20",
    "-i", join(dir, "mix.wav"), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest",
    join(dir, "film.mp4")], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  r = runPy(QC, "--audit", "--project", dir, "--render", "film.mp4", "--stems", "stems", "--profile", "social");
  assert.ok(r.status === 0 || r.status === 1, r.stdout + r.stderr);
  const read = (f) => JSON.parse(readFileSync(join(dir, "ice", "review", f), "utf8"));
  audits[name] = { status: r.status, out: r.stdout, audit: read("audio-audit.json"), ear: read("ear-list.json") };
  return audits[name];
}

test("audit: a bed louder than the voice in 1 to 4 kHz blocks A3; a bed far under the voice passes (generated tones)", { skip: AUDIT_SKIP }, () => {
  const loud = auditRun("loud bed", 2.0);
  assert.equal(loud.status, 1, loud.out);
  const a3 = loud.audit.checks.A3;
  assert.equal(a3.pass, false);
  assert.equal(a3.blocking, true);
  assert.ok(a3.value.p5_band_db < 0, JSON.stringify(a3.value));
  assert.ok(loud.audit.blocking.includes("A3"));
  for (const key of ["value", "threshold", "source", "pass", "blocking"]) assert.ok(key in a3, `A3 has ${key}`);
  assert.match(a3.source, /mix-and-master\.md section 3/);
  const quiet = auditRun("quiet bed", 0.05);
  assert.equal(quiet.audit.checks.A3.pass, true, JSON.stringify(quiet.audit.checks.A3));
  assert.equal(quiet.audit.checks.A3.blocking, false);
  assert.deepEqual(quiet.audit.presence, { music: true, voice: true, sfx: false, ambience: false, foley: false, silence: false });
});

test("audit: a DC offset blocks A9 (generated tones)", { skip: AUDIT_SKIP }, () => {
  const dc = auditRun("dc offset", 0.05, 0.02);
  assert.equal(dc.status, 1, dc.out);
  assert.equal(dc.audit.checks.A9.blocking, true, JSON.stringify(dc.audit.checks.A9));
  assert.ok(dc.audit.blocking.includes("A9"));
  assert.equal(auditRun("quiet bed", 0.05).audit.checks.A9.pass, true, "a clean mix passes A9");
});

test("audit: the ear list has 5 to 7 items, each with a time, a yes or no question, why a machine could not settle it and the fix", { skip: AUDIT_SKIP }, () => {
  for (const run of [auditRun("loud bed", 2.0), auditRun("quiet bed", 0.05)]) {
    const items = run.ear.items;
    assert.ok(items.length >= 5 && items.length <= 7, `${items.length} items`);
    assert.equal(run.ear.status, "not listened by a human");
    items.forEach((it, i) => {
      assert.equal(it.n, i + 1);
      for (const key of ["start", "end", "time", "question", "why_not_machine", "fix_if_no", "source", "risk"]) {
        assert.ok(it[key] !== undefined && it[key] !== null && it[key] !== "", `item ${it.n} has ${key}`);
      }
      assert.equal(it.answer, null);
      assert.match(it.time, /^\d+:\d\d\.\d-\d+:\d\d\.\d$/);
      assert.ok(it.end >= it.start);
      assert.match(it.question, /\?$/);
      if (i) assert.ok(items[i - 1].risk >= it.risk, "ranked by risk");
    });
    assert.match(run.out, /^## For your ears \(about \d+ minutes?; headphones, then a phone speaker; listen once without watching\)$/m);
    assert.ok(run.out.includes('| # | Time | Listen for | Answer | Why a machine could not settle it | If "no" |'));
    assert.match(run.out, /^Status: not listened by a human/m);
  }
  assert.equal(auditRun("loud bed", 2.0).ear.items[0].source, "A3", "a masked stretch leads the list");
});

test("audit: the qc.py profile table equals the gate column of mix-and-master.md section 5, and quick-checks.mjs carries the same", (t) => {
  if (!needPython(t)) return;
  const rows = section("skills/ice-audio/references/mix-and-master.md", 5).split(/\r?\n/).filter((l) => /^\|/.test(l)).slice(2)
    .map((l) => l.split("|").slice(1, -1).map((c) => c.trim()));
  const num = (s) => (s === "ref" ? null : Number(s));
  const want = {};
  for (const cells of rows) {
    assert.equal(cells.length, 6, `six columns: ${cells[0]}`);
    const gate = /`([a-z-]+)` I (ref|-?\d+(?:\.\d+)?) \+\/-(\d+(?:\.\d+)?), TP (ref|-?\d+(?:\.\d+)?), LRA (any|up to (\d+(?:\.\d+)?)|(\d+(?:\.\d+)?) to (\d+(?:\.\d+)?))( \(floor warns\))?/g;
    const found = [...cells[5].matchAll(gate)];
    assert.ok(found.length >= 1, `gate cell of ${cells[0]}: ${cells[5]}`);
    for (const m of found) {
      const p = { row: cells[0], i: num(m[2]), i_tol: Number(m[3]), tp: num(m[4]),
        lra_min: m[7] ? Number(m[7]) : null, lra_max: m[6] ? Number(m[6]) : m[8] ? Number(m[8]) : null, lra_min_warns: Boolean(m[9]) };
      want[m[1]] = p;
      if (p.i !== null) assert.match(cells[1], new RegExp(`${p.i} (LUFS|LKFS)`), `${m[1]}: integrated cell names ${p.i}`);
      if (p.tp !== null) assert.ok(cells[2].includes(`${p.tp} dBTP`), `${m[1]}: true peak cell names ${p.tp} dBTP`);
      for (const v of [p.lra_min, p.lra_max]) if (v !== null) assert.ok(cells[3].includes(String(v)), `${m[1]}: LRA cell names ${v}`);
    }
  }
  const r = runPy(QC, "--profiles");
  assert.equal(r.status, 0, r.stderr);
  const qc = JSON.parse(r.stdout);
  assert.deepEqual(qc, want, "qc.py PROFILES and the gate column disagree");
  const q = spawnSync(process.execPath, [QUICK, "loudness", "--profiles"], { encoding: "utf8" });
  assert.equal(q.status, 0, q.stderr);
  assert.deepEqual(JSON.parse(q.stdout), qc, "quick-checks.mjs and qc.py profile tables disagree");
});

test("audit: quick-checks.mjs loudness --profile exits 1 on a clip far from the profile, output lines kept (generated tone)", { skip: FFMPEG ? false : "ffmpeg or ffprobe not on PATH" }, () => {
  const clip = join(work, "quiet clip.mp4");
  const mk = spawnSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-i", "color=c=black:size=160x90:rate=30:duration=5",
    "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=48000:duration=5", "-af", "volume=-30dB", "-ac", "2",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", clip], { encoding: "utf8" });
  assert.equal(mk.status, 0, mk.stderr);
  const r = spawnSync(process.execPath, [QUICK, "loudness", clip, "--profile", "social"], { encoding: "utf8", timeout: 120000 });
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout, /^ I: -?\d+(\.\d+)? LUFS$/m, "the summary lines stay as before");
  assert.match(r.stdout, /short-term per second:/);
  assert.match(r.stdout, /^FAIL integrated -?\d+(\.\d+)? LUFS \(target -14 \+\/-1\)$/m);
  assert.match(r.stdout, /^profile check: FAIL$/m);
  const plain = spawnSync(process.execPath, [QUICK, "loudness", clip], { encoding: "utf8", timeout: 120000 });
  assert.equal(plain.status, 0, "without --profile it only reports");
  assert.doesNotMatch(plain.stdout, /profile check/);
});

test("audit: align_script_to_asr.py --stem-words and --mix-words mark a masked word (exit 1) and send a misheard one to the ear list", (t) => {
  if (!needPython(t)) return;
  const dir = join(work, "speech check");
  mkdirSync(dir, { recursive: true });
  const put = (name, body) => { const p = join(dir, name); writeFileSync(p, typeof body === "string" ? body : JSON.stringify(body), "utf8"); return p; };
  const script = put("script.txt", "The deal is on the table\n\ntonight in Geneva.\n");
  const said = [["The", 0.5, 0.7], ["deal", 0.72, 1.1], ["is", 1.12, 1.25], ["on", 1.27, 1.4], ["the", 1.42, 1.55],
    ["table", 1.57, 2.0], ["tonight", 2.4, 2.9], ["in", 2.95, 3.05], ["Geneva", 3.08, 3.6]].map(([w, s, e]) => ({ w, s, e, p: 0.95 }));
  const stem = said.map((x) => (x.w === "Geneva" ? { ...x, w: "Geneve" } : x));
  const mix = stem.map((x) => (x.w === "table" ? { ...x, w: "cable", p: 0.6 } : x));
  const run = (s, m, project) => runPy(ALIGN, "--stem-words", put(`${project} stem.json`, s), "--mix-words", put(`${project} mix.json`, m),
    script, "--project", join(dir, project));
  const r = run(stem, mix, "masked");
  assert.equal(r.status, 1, r.stdout + r.stderr);
  const report = JSON.parse(r.stdout);
  assert.deepEqual(report.words.filter((w) => w.class === "masked").map((w) => [w.w, w.mix_heard]), [["table", "cable"]]);
  assert.deepEqual(report.words.filter((w) => w.class === "misheard").map((w) => w.w), ["Geneva."]);
  assert.ok(report.blocking.some((b) => /masked: "table"/.test(b)), report.blocking.join("; "));
  assert.deepEqual(JSON.parse(readFileSync(join(dir, "masked", "ice", "review", "speech-check.json"), "utf8")).counts, report.counts);
  const ear = JSON.parse(readFileSync(join(dir, "masked", "ice", "review", "ear-list.json"), "utf8"));
  assert.ok(ear.items.some((i) => i.source === "A5" && /Geneva/.test(i.question)), JSON.stringify(ear.items));
  assert.ok(!ear.items.some((i) => /table/.test(i.question)), "a masked word blocks; it is fixed in the mix, not asked");
  const clean = run(said, said, "clean");
  assert.equal(clean.status, 0, clean.stdout + clean.stderr);
  assert.equal(JSON.parse(clean.stdout).ok, true);
});

test("audit: master_audio.py records a voiceover cut at the film end and fails the master (render)", { skip: FFMPEG ? false : "ffmpeg or ffprobe not on PATH" }, (t) => {
  if (!needPython(t)) return;
  const dir = join(work, "cut voice");
  mkdirSync(dir, { recursive: true });
  const mk = (args) => spawnSync("ffmpeg", ["-loglevel", "error", "-y", ...args], { encoding: "utf8" });
  let r = mk(["-f", "lavfi", "-i", "color=c=black:size=160x90:rate=30:duration=3", "-c:v", "libx264", "-pix_fmt", "yuv420p", join(dir, "picture.mp4")]);
  assert.equal(r.status, 0, r.stderr);
  r = mk(["-f", "lavfi", "-i", "sine=frequency=300:sample_rate=48000:duration=5", "-af", "volume=0.5", "-ac", "2", join(dir, "voice.wav")]);
  assert.equal(r.status, 0, r.stderr);
  r = runPy(SCRIPT, "--video", join(dir, "picture.mp4"), "--out", join(dir, "out", "film.mp4"), "--vo", join(dir, "voice.wav"));
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stderr, /CUT: the voiceover still speaks 2(\.0+)? s after the last frame/);
  const summary = JSON.parse(readFileSync(join(dir, "out", "master.json"), "utf8"));
  assert.equal(summary.status, "fail");
  assert.equal(summary.cut_at_end.voice.cut, true);
  assert.ok(summary.problems.some((p) => /voiceover is cut at the film end/.test(p)));
});

// Mono WAVs: a gated voice tone, clean (digital silence in the pauses) and dirty (50 Hz hum and white noise). Illustration only.
const DIAGNOSE_TONES = String.raw`
import sys, wave
import numpy as np
sr, dur = 48000, 6.0
t = np.arange(int(sr * dur)) / sr
gate = (((t % 0.3) < 0.2) & (t > 1.0) & (t < dur - 1.0)).astype(float)
voice = gate * (0.2 * np.sin(2 * np.pi * 180 * t) + 0.1 * np.sin(2 * np.pi * 1200 * t))
dirty = voice + 0.03 * np.sin(2 * np.pi * 50 * t) + 0.01 * np.random.default_rng(2).standard_normal(len(t))
for name, x in (("clean", voice), ("dirty", dirty)):
    with wave.open(sys.argv[1] + "/" + name + ".wav", "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype("<i2").tobytes())
`;

test("audit: qc.py --diagnose finds mains hum and a raised noise floor, and passes a clean voice (generated tones)", { skip: AUDIT_SKIP }, () => {
  const dir = join(work, "diagnose");
  mkdirSync(dir, { recursive: true });
  const r0 = runPy("-c", DIAGNOSE_TONES, dir);
  assert.equal(r0.status, 0, r0.stderr);
  const diagnose = (name) => {
    const r = runPy(QC, "--diagnose", `${name}.wav`, "--project", dir, "--json");
    assert.equal(r.status, 0, r.stdout + r.stderr);
    return JSON.parse(readFileSync(join(dir, "ice", "audio", "voice-diagnosis.json"), "utf8"));
  };
  const dirty = diagnose("dirty");
  assert.ok(dirty.candidates.includes("hum"), JSON.stringify(dirty.symptoms.hum));
  assert.ok(dirty.candidates.includes("noise_floor"), JSON.stringify(dirty.symptoms.noise_floor));
  assert.equal(dirty.symptoms.hum.value.frequency, 50);
  const clean = diagnose("clean");
  assert.ok(!clean.candidates.includes("hum") && !clean.candidates.includes("noise_floor"), JSON.stringify(clean.candidates));
});

// ---------------------------------------------------------------- 0.2.6: every sound effect is heard in the mix
test("master_audio: SFX and a delayed voice start on a sample-exact pad, and the mix is padded to the film", (t) => {
  if (!needPython(t)) return;
  const { graph } = py(`inputs, graph = m.build_filter_graph(pathlib.Path("v.mp4"), 10.0, False, False, pathlib.Path("vo.wav"), 1.5,
    pathlib.Path("m.wav"), -18.0, True, [{"file": pathlib.Path("s.wav"), "at": 7.25, "gain_db": -3.0}])
print(json.dumps({"graph": graph}))`);
  assert.doesNotMatch(graph, /adelay/, "adelay feeding amix dropped its delay in some runs and played a late cue at 0 s");
  assert.match(graph, /anullsrc=r=48000:cl=stereo,atrim=end_sample=72000,[^;]*\[a_vo_base_pad\]/, "the voice offset is 1.5 s of silence");
  assert.match(graph, /anullsrc=r=48000:cl=stereo,atrim=end_sample=348000,[^;]*\[a_sfx_0_pad\]/, "the SFX start is 7.25 s of silence");
  assert.match(graph, /\[a_sfx_0_pad\]\[a_sfx_0_raw\]concat=n=2:v=0:a=1,atrim=0:10\.0000/);
  assert.match(graph, /amix=inputs=3:duration=longest:[^;]*apad=whole_dur=10\.0000,atrim=0:10\.0000\[a_mix\]$/,
    "the mix lasts the film, whichever input comes first");
});

test("master_audio: a voice that ends before the picture keeps the music to the last frame (render)", { skip: FFMPEG ? false : "ffmpeg or ffprobe not on PATH" }, (t) => {
  if (!needPython(t)) return;
  const dir = join(work, "early voice");
  mkdirSync(dir, { recursive: true });
  const mk = (args) => spawnSync("ffmpeg", ["-loglevel", "error", "-y", ...args], { encoding: "utf8" });
  let r = mk(["-f", "lavfi", "-i", "color=c=black:size=160x90:rate=30:duration=4", "-c:v", "libx264", "-pix_fmt", "yuv420p", join(dir, "picture.mp4")]);
  assert.equal(r.status, 0, r.stderr);
  r = mk(["-f", "lavfi", "-i", "sine=frequency=220:sample_rate=48000:duration=4", "-ac", "2", join(dir, "music.wav")]);
  assert.equal(r.status, 0, r.stderr);
  r = mk(["-f", "lavfi", "-i", "sine=frequency=1000:sample_rate=48000:duration=1", "-ac", "2", join(dir, "voice.wav")]);
  assert.equal(r.status, 0, r.stderr);
  const out = join(dir, "out", "film.mp4");
  r = runPy(SCRIPT, "--video", join(dir, "picture.mp4"), "--out", out, "--vo", join(dir, "voice.wav"), "--vo-offset", "1",
    "--music", join(dir, "music.wav"), "--music-fade-out", "0");
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const probe = spawnSync("ffprobe", ["-v", "error", "-select_streams", "a:0", "-show_entries", "stream=duration", "-of", "csv=p=0", out], { encoding: "utf8" });
  assert.ok(Math.abs(Number(probe.stdout.trim()) - 4) < 0.05, `the audio lasts ${probe.stdout.trim()} s of a 4 s film`);
  assert.ok(meanDb(out, 3.2, 0.6) > -40, "the music must still play after the last word");
});

// 20 s at 48 kHz: music (a kick every 0.5 s, a 220 Hz pad, noise at 90 to 170 Hz), three one-shot hits (3 kHz, 6 kHz,
// and a quiet 125 Hz hit inside the noise), SFX lists (the 6 kHz hit placed 100 ms after its frame) and cue sheets that
// make one hit or another the hero. Illustration only.
const SFX_TONES = String.raw`
import json, sys, wave
import numpy as np
sr, dur = 48000, 20.0
d = sys.argv[1]
t = np.arange(int(sr * dur)) / sr
noise = np.random.default_rng(3).standard_normal(len(t))
spec = np.fft.rfft(noise)
f = np.fft.rfftfreq(len(t), 1 / sr)
spec[(f < 90) | (f > 170)] = 0
band = np.fft.irfft(spec, len(t))
x = 0.08 * np.sin(2 * np.pi * 220 * t) + 0.06 * band / band.std()
k = np.arange(int(0.12 * sr)) / sr
kick = 0.5 * np.sin(2 * np.pi * (50 + 80 * np.exp(-k * 30)) * k) * np.exp(-k * 25)
for b in np.arange(0, dur, 0.5):
    i = int(b * sr)
    m = min(len(kick), len(t) - i)
    x[i:i + m] += kick[:m]
x -= x.mean()
def write(name, y):
    with wave.open(d + "/" + name, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes((np.stack([np.clip(y, -1, 1)] * 2, axis=1) * 32767).astype("<i2").tobytes())
def hit(freq, gain):
    h = np.arange(int(0.4 * sr)) / sr
    return gain * np.sin(2 * np.pi * freq * h) * np.minimum(1, h / 0.002) * np.exp(-h * 12)
write("music.wav", x)
write("hit bright.wav", hit(3000, 0.5))
write("hit air.wav", hit(6000, 0.5))
write("hit low.wav", hit(125, 0.004))
def put(name, data):
    with open(d + "/" + name, "w") as fh:
        json.dump(data, fh)
put("sfx.json", [{"file": "hit bright.wav", "at": 4.998}, {"file": "hit low.wav", "at": 9.998}, {"file": "hit air.wav", "at": 15.098}])
put("sfx low.json", [{"file": "hit low.wav", "at": 9.998}])
def ev(t, what, sound, hero=False):
    return {"t": t, "kind": "contact", "what": what, "sound": sound, **({"hero": True} if hero else {})}
put("cues hero on time.json", {"fps": 30, "events": [ev(5.0, "card lands", "bright hit", True), ev(10.0, "box closes", "low hit"), ev(15.0, "badge pops", "air hit")]})
put("cues hero late.json", {"fps": 30, "events": [ev(5.0, "card lands", "bright hit"), ev(10.0, "box closes", "low hit"), ev(15.0, "badge pops", "air hit", True)]})
put("cues low.json", {"fps": 30, "events": [ev(10.0, "box closes", "low hit")]})
`;

// The film mastered once by master_audio.py with --no-sfx-premix, then audited per cue sheet in its own project folder.
let sfxFilmMemo = null;
function sfxFilm() {
  if (sfxFilmMemo) return sfxFilmMemo;
  const dir = join(work, "sfx cues");
  mkdirSync(dir, { recursive: true });
  let r = runPy("-c", SFX_TONES, dir);
  assert.equal(r.status, 0, r.stderr);
  r = spawnSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-i", "color=c=black:size=160x90:rate=30:duration=20",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", join(dir, "picture.mp4")], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  const render = join(dir, "out", "film.mp4");
  r = runPy(SCRIPT, "--video", join(dir, "picture.mp4"), "--out", render, "--music", join(dir, "music.wav"), "--music-fade-out", "0",
    "--sfx", join(dir, "sfx.json"), "--no-sfx-premix", join(dir, "out", "premix.wav"));
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const audits = {};
  const audit = (sheet, sfx = "sfx.json", ...extra) => {
    const key = [sheet, sfx, ...extra].join(" ");
    if (audits[key]) return audits[key];
    const project = join(dir, `project ${Object.keys(audits).length}`);
    const q = runPy(QC, "--audit", "--project", project, "--render", render, "--cue-sheet", join(dir, sheet), "--sfx", join(dir, sfx),
      "--profile", "social", "--no-speech", ...extra);
    assert.ok(q.status === 0 || q.status === 1, q.stdout + q.stderr);
    const read = (f) => JSON.parse(readFileSync(join(project, "ice", "review", f), "utf8"));
    audits[key] = { status: q.status, out: q.stdout, audit: read("audio-audit.json"), ear: read("ear-list.json") };
    return audits[key];
  };
  sfxFilmMemo = { dir, master: JSON.parse(readFileSync(join(dir, "out", "master.json"), "utf8")), audit };
  return sfxFilmMemo;
}

test("audit A14: each cue is measured against the no-SFX premix; a late hero cue blocks, other cues report (generated tones)", { skip: AUDIT_SKIP }, () => {
  const film = sfxFilm();
  const premix = film.master.no_sfx_premix;
  assert.ok(premix && readFileSync(premix.file).length > 0, "master.json names the premix file");
  assert.equal(premix.sfx_cues_left_out, 3);
  assert.equal(premix.gain_db, film.master.renders.at(-1).gain_db, "the premix takes the delivered file's gain");

  const onTime = film.audit("cues hero on time.json");
  const a14 = onTime.audit.checks.A14;
  for (const key of ["value", "threshold", "source", "pass", "blocking"]) assert.ok(key in a14, `A14 has ${key}`);
  assert.match(a14.source, /sfx\.md section 6/);
  assert.equal(a14.blocking, false, JSON.stringify(a14.findings));
  assert.ok(!onTime.audit.blocking.includes("A14"));
  const at = (run, s) => run.audit.checks.A14.value.cues.find((c) => c.t === s);
  const hero = at(onTime, 5);
  assert.equal(hero.hero, true);
  assert.equal(hero.status, "audible", JSON.stringify(hero));
  assert.equal(hero.sync, "on time");
  assert.ok(Math.abs(hero.offset_ms) <= 10, `the hero cue measures ${hero.offset_ms} ms off its frame`);
  assert.ok(["masked", "missing"].includes(at(onTime, 10).status), JSON.stringify(at(onTime, 10)));
  const late = at(onTime, 15);
  assert.equal(late.sync, "late");
  assert.ok(late.offset_ms >= 90 && late.offset_ms <= 115, `the cue placed 100 ms late measures ${late.offset_ms} ms`);
  assert.ok(onTime.ear.candidates.some((c) => c.source === "A14" && /0:15\.0/.test(c.question) && /late/.test(c.question)),
    "a late cue that does not block goes to the ear list");
  assert.equal(onTime.audit.presence.sfx, true);
  assert.match(onTime.audit.presence_sources.sfx, /^A14: 2 of 3 cue/);

  const heroLate = film.audit("cues hero late.json").audit.checks.A14;
  assert.equal(heroLate.blocking, true);
  assert.ok(heroLate.findings.some((f) => /hero cue "air hit" at 0:15\.0 lands \+\d+ ms after its frame \(blocks\)/.test(f)), heroLate.findings.join("; "));

  const buried = film.audit("cues low.json", "sfx low.json").audit.checks.A14;
  assert.equal(buried.blocking, true, "more than half of the cues not heard blocks");
  assert.ok(buried.findings.some((f) => /1 of 1 cues are not heard/.test(f)), buried.findings.join("; "));

  const none = film.audit("cues hero on time.json", "sfx.json", "--master-json", join(film.dir, "no master.json")).audit.checks.A14;
  assert.equal(none.status, "unmeasured", "a hero cue with no premix cannot pass");
  assert.equal(none.blocking, true);
  assert.match(none.findings.join(" "), /--no-sfx-premix/);
});

// 20 s: a tone that moves to another octave and level every 2 s (an arrangement that keeps moving). Illustration only.
const MOVING_TONES = String.raw`
import sys, wave
import numpy as np
sr = 48000
x = np.concatenate([g * np.sin(2 * np.pi * f * np.arange(2 * sr) / sr) for f, g in
    ((110, 0.2), (880, 0.05), (3520, 0.1), (220, 0.25), (1760, 0.04), (440, 0.15), (7040, 0.08), (165, 0.2), (660, 0.06), (2640, 0.12))])
with wave.open(sys.argv[1] + "/mix.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(sr)
    w.writeframes((np.stack([x, x], axis=1) * 32767).astype("<i2").tobytes())
`;

test("audit A17: the longest unchanged repeat gets an ear-list item with its time range; a moving bed has no finding (generated tones)", { skip: AUDIT_SKIP }, () => {
  const loop = sfxFilm().audit("cues hero on time.json");
  const a17 = loop.audit.checks.A17;
  assert.equal(a17.blocking, false, "fatigue is judged by ear: A17 never blocks");
  assert.ok(a17.value.seconds >= 15, JSON.stringify(a17.value));
  assert.equal(a17.value.kind, "a steady pulse", JSON.stringify(a17.value));
  assert.equal(a17.findings.length, 1, "a kick loop under one-shot hits is one unchanged pattern");
  const item = loop.ear.items.find((i) => i.source === "A17");
  assert.ok(item, JSON.stringify(loop.ear.items.map((i) => i.source)));
  assert.equal(item.start, a17.value.start);
  assert.equal(item.end, a17.value.end);
  assert.ok(!loop.ear.candidates.some((c) => c.source === "repeat"), "the repeat item comes from A17 only");
  assert.match(auditRun("quiet bed", 0.05).audit.checks.A17.value.measured_on, /stems/);

  const dir = join(work, "moving bed");
  mkdirSync(dir, { recursive: true });
  let r = runPy("-c", MOVING_TONES, dir);
  assert.equal(r.status, 0, r.stderr);
  r = spawnSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-i", "color=c=black:size=160x90:rate=30:duration=20",
    "-i", join(dir, "mix.wav"), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest",
    join(dir, "film.mp4")], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  r = runPy(QC, "--audit", "--project", dir, "--render", "film.mp4", "--profile", "social", "--no-speech");
  assert.ok(r.status === 0 || r.status === 1, r.stdout + r.stderr);
  const moving = JSON.parse(readFileSync(join(dir, "ice", "review", "audio-audit.json"), "utf8")).checks.A17;
  assert.deepEqual(moving.findings, [], JSON.stringify(moving.value));
  assert.ok(JSON.parse(readFileSync(join(dir, "ice", "review", "ear-list.json"), "utf8")).candidates.some((c) => c.source === "A17"),
    "the ear list still carries the stretch with the least change");
});

// 10 s: a pad that steps up 10 dB at 5.0 s and back down at 7.5 s (10 ms ramps), and a cue sheet with cuts at 2.5, 5.0
// and 7.5 s, the last one carrying a sound. Illustration only.
const JUMP_TONES = String.raw`
import json, sys, wave
import numpy as np
sr, dur = 48000, 10.0
d = sys.argv[1]
t = np.arange(int(sr * dur)) / sr
g = np.interp(t, [0, 4.99, 5.01, 7.49, 7.51, dur], [0.03, 0.03, 0.095, 0.095, 0.03, 0.03])
x = g * (np.sin(2 * np.pi * 220 * t) + 0.6 * np.sin(2 * np.pi * 330 * t) + 0.3 * np.sin(2 * np.pi * 1320 * t))
with wave.open(d + "/mix.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(sr)
    w.writeframes((np.stack([x, x], axis=1) * 32767).astype("<i2").tobytes())
with open(d + "/cue sheet.json", "w") as fh:
    json.dump({"fps": 30, "events": [{"t": 2.5, "kind": "cut", "what": "wide to close", "sound": "none"},
        {"t": 5.0, "kind": "cut", "what": "close to product", "sound": "none"},
        {"t": 7.5, "kind": "cut", "what": "product to end card", "sound": "drop hit"}]}, fh)
`;

test("audit A7: an unexplained level jump at a cut goes to the ear list, a cue explains another, and A7 never blocks (generated tones)", { skip: AUDIT_SKIP }, () => {
  const dir = join(work, "level jumps");
  mkdirSync(dir, { recursive: true });
  let r = runPy("-c", JUMP_TONES, dir);
  assert.equal(r.status, 0, r.stderr);
  r = spawnSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "lavfi", "-i", "color=c=black:size=160x90:rate=30:duration=10",
    "-i", join(dir, "mix.wav"), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest",
    join(dir, "film.mp4")], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  r = runPy(QC, "--audit", "--project", dir, "--render", "film.mp4", "--cue-sheet", "cue sheet.json", "--profile", "social", "--no-speech");
  assert.ok(r.status === 0 || r.status === 1, r.stdout + r.stderr);
  const audit = JSON.parse(readFileSync(join(dir, "ice", "review", "audio-audit.json"), "utf8"));
  const a7 = audit.checks.A7;
  assert.equal(a7.blocking, false);
  assert.ok(!audit.blocking.includes("A7"));
  assert.equal(a7.value.cut_source, "cue sheet");
  const jump = (s) => a7.value.jumps.find((j) => j.t === s);
  assert.ok(Math.abs(jump(2.5).jump_lu) < 1, JSON.stringify(jump(2.5)));
  assert.ok(jump(5).jump_lu > 8 && jump(5).explained_by === null, JSON.stringify(jump(5)));
  assert.match(jump(7.5).explained_by || "", /drop hit/, "a sound on the cut explains the jump");
  assert.deepEqual(a7.findings.map((f) => f.slice(0, 6)), ["0:05.0"], a7.findings.join("; "));
  const ear = JSON.parse(readFileSync(join(dir, "ice", "review", "ear-list.json"), "utf8"));
  assert.ok(ear.items.some((i) => i.source === "A7" && i.start <= 5 && i.end >= 5 && /\?$/.test(i.question)), JSON.stringify(ear.items));
  assert.equal(audit.checks.A17.status, "n/a", "a film under 15 s has no repeat item");
});

test("audit docs: audio-gates.md section 2b gates A7, A14 and A17, and the other files point to them", () => {
  const gates = section("skills/ice-qa/references/audio-gates.md", "2b");
  for (const id of ["A7", "A14", "A17"]) assert.match(gates, new RegExp(`^\\| ${id} `, "m"), `section 2b has a row for ${id}`);
  assert.doesNotMatch(gates, /Not yet measured by a script: effects present/, "effects per cue are measured now");
  assert.match(readText("skills/ice-audio/references/sfx.md"), /measurably present in the final mix[^\n]*A14/);
  const mm = readText("skills/ice-audio/references/mix-and-master.md");
  assert.match(mm, /--no-sfx-premix/);
  assert.match(section("skills/ice-audio/references/mix-and-master.md", 7), /A7[^\n]*A14[^\n]*A17/);
});

// ---------------------------------------------------------------- the CC0 SFX pack (founder decision D4, 2026-10-29)
test("sfx pack: match_music.py pins the same tag, URL, SHA-256 and size as versions.json asset_packs.sfx", () => {
  const pin = JSON.parse(readText("skills/ice-engines/references/versions.json")).asset_packs.sfx;
  const code = readText("skills/ice-audio/scripts/match_music.py");
  for (const [key, value] of [["tag", pin.tag], ["url", pin.url], ["sha256", pin.sha256]]) {
    assert.ok(code.includes(`"${key}": "${value}"`), `match_music.py PACK ${key} is not ${value}`);
  }
  assert.ok(code.includes(`"bytes": ${pin.bytes}`), "match_music.py PACK bytes differs from versions.json");
  assert.match(pin.sha256, /^[0-9a-f]{64}$/);
  assert.match(readText("skills/ice-audio/references/sfx.md"), /`python scripts\/match_music\.py pack fetch`/);
  assert.match(readText("skills/ice-assets/references/sourcing-and-licenses.md"), /\| SFX \| `ice_sfx_pack` \|/);
});

test("sfx pack: pack list reads a fixture manifest offline, filters under speech, and fetch stays off with ICE_OFFLINE", { skip: PYTHON ? false : "no Python 3.10+" }, (t) => {
  const root = mkdtempSync(join(tmpdir(), "ice-sfx-pack-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const pin = JSON.parse(readText("skills/ice-engines/references/versions.json")).asset_packs.sfx;
  const pack = join(root, pin.tag, "ice-sfx-pack-v1");
  mkdirSync(join(pack, "sfx", "sub_drop"), { recursive: true });
  writeFileSync(join(root, pin.tag, "ok.json"), JSON.stringify({ tag: pin.tag, sha256: pin.sha256 }));
  const row = (file, voice) => ({ file, type: "sub_drop", sha256: "0".repeat(64), duration_s: 1.2, sync_s: 0.05, sync_kind: "peak",
    lufs_momentary_max: -18, peak_dbfs: -10, centroid_hz: 60, band_share: { voice_150_4k: voice } });
  writeFileSync(join(pack, "manifest.json"), JSON.stringify({ tag: pin.tag, files: [row("sfx/sub_drop/sub_drop_01.wav", 0.1), row("sfx/sub_drop/sub_drop_02.wav", 0.7)] }));
  const env = { ...process.env, ICE_SFX_PACK_DIR: root, PYTHONIOENCODING: "utf-8" };
  const run = (...a) => spawnSync(PYTHON[0], [...PYTHON.slice(1), join(SCRIPT_DIR, "match_music.py"), "pack", ...a], { encoding: "utf8", env });
  let r = run("list", "--type", "sub_drop");
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /sub_drop_01\.wav/);
  assert.match(r.stdout, /sub_drop_02\.wav/);
  r = run("list", "--type", "sub_drop", "--profile", "under-speech");
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /sub_drop_01\.wav/);
  assert.doesNotMatch(r.stdout, /sub_drop_02\.wav/, "a file with most of its energy in the voice band is left out under speech");
  r = run("list", "--type", "whoosh_soft");
  assert.equal(r.status, 2, "no file of the type: exit 2");
  r = spawnSync(PYTHON[0], [...PYTHON.slice(1), join(SCRIPT_DIR, "match_music.py"), "pack", "fetch", "--force"],
    { encoding: "utf8", env: { ...env, ICE_OFFLINE: "1" } });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /downloads are off \(ICE_OFFLINE=1\)/);
  const empty = mkdtempSync(join(tmpdir(), "ice-sfx-none-"));
  t.after(() => rmSync(empty, { recursive: true, force: true }));
  r = spawnSync(PYTHON[0], [...PYTHON.slice(1), join(SCRIPT_DIR, "match_music.py"), "pack", "list", "--type", "tick"],
    { encoding: "utf8", env: { ...env, ICE_SFX_PACK_DIR: empty } });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /the pack is not installed: run match_music.py pack fetch/);
});
