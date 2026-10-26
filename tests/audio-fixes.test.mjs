// ice-audio master_audio.py: the music has no fade-in unless asked for, and every music edge (fade-in, fade-out,
// start offset, loop) is an explicit flag recorded in master.json. Graph checks need Python 3.10+; the render
// check also needs ffmpeg and ffprobe on PATH. Each test skips cleanly when its tool is missing.
// Run: node --test tests/
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { abs, findPython, hasCommand } from "./helpers.mjs";

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
