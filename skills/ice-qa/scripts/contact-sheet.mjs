#!/usr/bin/env node
// Ported from echris6/motion-video-kit (MIT), business-motion-film/scripts/contact-sheet.sh. Changes: rewritten in
// Node (no bash) so it runs on Windows, macOS and Linux; same ffmpeg filter chain and arguments; --help and a clear
// error when ffmpeg is missing. See NOTICE.md.
// Contact sheet for critics: one frame every N seconds, tiled.
// Usage: node scripts/contact-sheet.mjs film.mp4 out.jpg [every_seconds=1] [cols=6] [rows=5] [start=0] [duration=]
// Needs: ffmpeg on PATH. Node 18 or newer, no packages.
import { spawnSync } from "node:child_process";

const USAGE = "usage: node contact-sheet.mjs <film.mp4> <out.jpg> [every_seconds=1] [cols=6] [rows=5] [start=0] [duration]";
const args = process.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) { console.log(USAGE); process.exit(0); }
if (args.length < 2) { console.error(USAGE); process.exit(2); }

const [film, out, every = "1", cols = "6", rows = "5", start = "0", duration = ""] = args;
const ff = ["-loglevel", "error", "-y", "-ss", start];
if (duration) ff.push("-t", duration);
ff.push("-i", film, "-vf", `fps=1/${every},scale=480:-1,tile=${cols}x${rows}`, "-frames:v", "1", out);

const r = spawnSync("ffmpeg", ff, { stdio: ["ignore", "inherit", "inherit"] });
if (r.error) {
  console.error(r.error.code === "ENOENT"
    ? "ffmpeg was not found on PATH. Install FFmpeg (see the ice-motion-director skill, references/prerequisites.md) and open a new terminal."
    : `could not run ffmpeg: ${r.error.message}`);
  process.exit(127);
}
if (r.status !== 0) process.exit(r.status ?? 1);
console.log(out);
