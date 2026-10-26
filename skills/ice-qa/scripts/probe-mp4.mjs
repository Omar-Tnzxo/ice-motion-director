#!/usr/bin/env node
// Ported from iart-ai/motion-skills (MIT), tools/verify/probe-mp4.sh. Changes: rewritten in Node (no bash or awk) so
// it runs on Windows, macOS and Linux; status marks written as plain words (OK, FAIL, WARN); --help, a usage exit code
// of 2 and a clear error when ffprobe is missing. Same checks and tolerances. See NOTICE.md.
// probe-mp4.mjs: print and assert an MP4's real spec (the deliverable contract).
//
// Renders lie; the file doesn't. This reads resolution, codec, fps and duration straight from the encoded MP4 and
// (optionally) asserts them, so "1080x1920 @30 h264" is verified, not assumed.
//
// Usage:
//   node scripts/probe-mp4.mjs out.mp4                 # just print the spec
//   node scripts/probe-mp4.mjs out.mp4 1080x1920 30    # assert vertical 1080x1920 at about 30fps
// Exit codes: 0 spec OK, 1 an assertion failed, 2 usage error, 127 ffprobe missing.
// Needs: ffprobe on PATH (ships with ffmpeg). Node 18 or newer, no packages.
import { spawnSync } from "node:child_process";
import { basename } from "node:path";

const USAGE = "usage: node probe-mp4.mjs <file.mp4> [WxH] [fps]";
const args = process.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) { console.log(USAGE); process.exit(0); }
if (args.length < 1) { console.error(USAGE); process.exit(2); }
const [mp4, expRes = "", expFps = ""] = args;

function ffprobe(extra) {
  const r = spawnSync("ffprobe", ["-v", "error", ...extra, "-of", "csv=p=0", mp4], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  if (r.error) {
    console.error(r.error.code === "ENOENT"
      ? "ffprobe was not found on PATH. Install FFmpeg (see the ice-motion-director skill, references/prerequisites.md) and open a new terminal."
      : `could not run ffprobe: ${r.error.message}`);
    process.exit(127);
  }
  if (r.status !== 0) { process.stderr.write(r.stderr); process.exit(1); }
  return (r.stdout.split(/\r?\n/)[0] || "").trim().replace(/,+$/, "");
}
const q = (entry) => ffprobe(["-select_streams", "v:0", "-show_entries", entry]);

const w = q("stream=width"), h = q("stream=height"), codec = q("stream=codec_name"), rate = q("stream=r_frame_rate");
const dur = ffprobe(["-show_entries", "format=duration"]);
const [num, den] = rate.split("/").map(Number);
const fpsValue = den ? num / den : num;
const fps = Number.isFinite(fpsValue) ? String(Number(fpsValue.toPrecision(4))) : rate;
const durNum = Number(dur);
console.log(`  ${basename(mp4)}: ${w}x${h}  ${codec}  ${fps} fps  ${(Number.isFinite(durNum) ? durNum : 0).toFixed(2)}s`);

let fail = false;
if (expRes && `${w}x${h}` !== expRes) { console.log(`  FAIL resolution ${w}x${h} is not ${expRes}`); fail = true; }
if (expFps) {
  const d = fpsValue - Number(expFps);
  if (!(d < 0.5 && d > -0.5)) { console.log(`  FAIL fps ${fps} is not ${expFps}`); fail = true; }
}
if (codec !== "h264") console.log(`  WARN codec ${codec} (not h264: confirm player/platform compatibility)`);
if (fail) process.exit(1);
console.log("  OK spec");
