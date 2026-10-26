#!/usr/bin/env node
// Ported from echris6/motion-video-kit (MIT), business-motion-film/scripts/loudness.sh. Changes: rewritten in Node
// (no bash, grep, tr or awk) so it runs on Windows, macOS and Linux; same ffmpeg measurement and output; short-term
// values are also read when ffmpeg prints them without a space after "S:" (the original printed them empty); --help
// and a clear error when ffmpeg is missing; a note line marks the first 3 s of short-term values as a filling window
// (2026-10-19, pilot films: -120.7 LUFS there read as silence). See NOTICE.md.
// Integrated loudness, loudness range, true peak, plus short-term loudness each second.
// Usage: node scripts/loudness.mjs film.mp4
// Needs: ffmpeg on PATH. Node 18 or newer, no packages.
import { spawnSync } from "node:child_process";

const USAGE = "usage: node loudness.mjs <film.mp4>";
const args = process.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) { console.log(USAGE); process.exit(0); }
if (args.length < 1) { console.error(USAGE); process.exit(2); }

const r = spawnSync("ffmpeg", ["-hide_banner", "-i", args[0], "-af", "ebur128=peak=true", "-f", "null", "-"],
  { encoding: "utf8", maxBuffer: 1 << 30, stdio: ["ignore", "pipe", "pipe"] });
if (r.error) {
  console.error(r.error.code === "ENOENT"
    ? "ffmpeg was not found on PATH. Install FFmpeg (see the ice-motion-director skill, references/prerequisites.md) and open a new terminal."
    : `could not run ffmpeg: ${r.error.message}`);
  process.exit(127);
}
const lines = `${r.stdout}${r.stderr}`.split(/\r?\n/);
if (r.status !== 0) { process.stderr.write(lines.join("\n")); process.exit(r.status ?? 1); }

// Summary block: "    I:         -16.2 LUFS" and similar, with runs of spaces squeezed to one.
for (const line of lines) if (/^ +(I|LRA|Peak):/.test(line)) console.log(line.replace(/ +/g, " "));

// Per-frame lines carry "t: <seconds> ... S: <short-term LUFS>"; keep one value per whole second. The short-term window is
// 3 s long, so before t = 3 s it is still filling and ffmpeg prints about -120 LUFS even over loud sound: those seconds
// are marked on a note line under the values (not silence). Check the opening's level with look.py (audible span, lead
// silence) instead.
console.log("short-term per second:");
let row = "";
for (const line of lines) {
  const m = /(?:^|\s)t: *([0-9.]+) .*\bS: *([-0-9.]+)/.exec(line);
  if (!m) continue;
  const tn = Number(m[1]);
  if (Number.isFinite(tn) && Math.trunc(tn * 10) % 10 === 0) row += `${Math.trunc(tn)}:${m[2]} `;
}
console.log(row);
console.log("note: seconds 0-2 are read while the 3 s short-term window is still filling: about -120 LUFS there is n/a, not silence");
