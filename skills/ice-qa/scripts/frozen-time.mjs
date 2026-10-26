#!/usr/bin/env node
// Ported from echris6/motion-video-kit (MIT), business-motion-film/scripts/frozen-time.sh. Changes: rewritten in
// Node (no bash, grep or awk) so it runs on Windows, macOS and Linux; same ffmpeg filter chain, threshold and output;
// the approximately sign in the summary line is written as "about"; --help and a clear error when ffmpeg is missing.
// See NOTICE.md.
// Report near-frozen moments in a render: frame-to-frame luma difference below a threshold, sampled at 10fps.
// Usage: node scripts/frozen-time.mjs film.mp4 [threshold=0.35]
// Needs: ffmpeg on PATH. Node 18 or newer, no packages.
import { spawnSync } from "node:child_process";

const USAGE = "usage: node frozen-time.mjs <film.mp4> [threshold=0.35]";
const args = process.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) { console.log(USAGE); process.exit(0); }
if (args.length < 1) { console.error(USAGE); process.exit(2); }

const [film, thArg = "0.35"] = args;
const th = Number(thArg);
if (!Number.isFinite(th)) { console.error(`threshold must be a number, got "${thArg}"`); process.exit(2); }

const r = spawnSync("ffmpeg", [
  "-hide_banner", "-i", film,
  "-vf", "fps=10,scale=320:-1,format=gray,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG",
  "-an", "-f", "null", "-",
], { encoding: "utf8", maxBuffer: 1 << 30, stdio: ["ignore", "pipe", "pipe"] });
if (r.error) {
  console.error(r.error.code === "ENOENT"
    ? "ffmpeg was not found on PATH. Install FFmpeg (see the ice-motion-director skill, references/prerequisites.md) and open a new terminal."
    : `could not run ffmpeg: ${r.error.message}`);
  process.exit(127);
}
const log = `${r.stdout}${r.stderr}`;
if (r.status !== 0) { process.stderr.write(log); process.exit(r.status ?? 1); }

// Sample k (1-based) sits at k/10 seconds, as in the original.
const values = [...log.matchAll(/YAVG=([0-9.]*)/g)].map((m) => Number(m[1]));
const frozen = [];
values.forEach((v, i) => { if (v < th) frozen.push(((i + 1) / 10).toFixed(1)); });
process.stdout.write(frozen.map((t) => `${t} `).join(""));
process.stdout.write(`\nnear-frozen samples: ${frozen.length} (about ${(frozen.length / 10).toFixed(1)}s)\n`);
