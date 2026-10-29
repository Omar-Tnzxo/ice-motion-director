#!/usr/bin/env node
// Ported from echris6/motion-video-kit (MIT): business-motion-film/scripts/contact-sheet.sh, frozen-time.sh and
// loudness.sh, one subcommand each. Changes: rewritten in Node (no bash, grep, tr or awk) so they run on Windows, macOS
// and Linux; same ffmpeg filter chains, arguments, threshold and output; --help and a clear error when ffmpeg is missing.
// frozen: the approximately sign in the summary line is written as "about". loudness: short-term values are also read
// when ffmpeg prints them without a space after "S:" (the original printed them empty); a note line marks the first 3 s
// of short-term values as a filling window (2026-10-19, pilot films: -120.7 LUFS there read as silence). 2026-10-29
// (0.2.5): the three scripts merged into this one file (contact-sheet.mjs, frozen-time.mjs, loudness.mjs) to stay under
// the plugin's file cap; behaviour unchanged. See NOTICE.md.
// 2026-10-29 (0.2.5): loudness --profile <id> compares I, true peak and LRA with the profile (the gate column of the ice-audio skill, references/mix-and-master.md section 5, same table as qc.py) after the unchanged output and exits 1 outside it; --profiles prints the table.
// Three quick checks on a render:
//   sheet     contact sheet for critics: one frame every N seconds, tiled
//   frozen    near-frozen moments: frame-to-frame luma difference below a threshold, sampled at 10 fps
//   loudness  integrated loudness, loudness range, true peak, plus short-term loudness each second
// Usage:
//   node scripts/quick-checks.mjs sheet film.mp4 out.jpg [every_seconds=1] [cols=6] [rows=5] [start=0] [duration=]
//   node scripts/quick-checks.mjs frozen film.mp4 [threshold=0.35]
//   node scripts/quick-checks.mjs loudness film.mp4 [--profile <id>] [--target-lufs <n>] [--true-peak <n>]
//   node scripts/quick-checks.mjs loudness --profiles
// Needs: ffmpeg on PATH. Node 18 or newer, no packages.
import { spawnSync } from "node:child_process";

const USAGE = {
  sheet: "usage: node quick-checks.mjs sheet <film.mp4> <out.jpg> [every_seconds=1] [cols=6] [rows=5] [start=0] [duration]",
  frozen: "usage: node quick-checks.mjs frozen <film.mp4> [threshold=0.35]",
  loudness: "usage: node quick-checks.mjs loudness <film.mp4> [--profile <id>] [--target-lufs <n>] [--true-peak <n>] | --profiles",
};

// Loudness profiles for loudness --profile: the "Gate (--profile)" column of the ice-audio skill,
// references/mix-and-master.md section 5, identical to PROFILES in ice-audio/scripts/qc.py (tests/audio-fixes.test.mjs
// checks all three agree). i and tp null: the reference's own values, given with --target-lufs and --true-peak.
const PROFILES = {
  "social": { row: "Social and web, punchy", i: -14.0, i_tol: 1.0, tp: -1.0, lra_min: 3.0, lra_max: 11.0, lra_min_warns: true },
  "gentle": { row: "Gentle and spoken", i: -16.0, i_tol: 1.0, tp: -1.0, lra_min: 1.5, lra_max: 9.0, lra_min_warns: false },
  "strict": { row: "Strict headroom", i: -16.0, i_tol: 1.0, tp: -4.0, lra_min: null, lra_max: 11.0, lra_min_warns: false },
  "quiet-client": { row: "Quiet client spec", i: -19.0, i_tol: 1.0, tp: -1.0, lra_min: null, lra_max: null, lra_min_warns: false },
  "broadcast-ebu": { row: "Broadcast", i: -23.0, i_tol: 1.0, tp: -1.0, lra_min: null, lra_max: null, lra_min_warns: false },
  "broadcast-atsc": { row: "Broadcast", i: -24.0, i_tol: 1.0, tp: -2.0, lra_min: null, lra_max: null, lra_min_warns: false },
  "reference": { row: "Reference match", i: null, i_tol: 1.0, tp: null, lra_min: null, lra_max: null, lra_min_warns: false },
  "news-reel": { row: "News reel, speech-led", i: -16.0, i_tol: 1.0, tp: -1.0, lra_min: 4.0, lra_max: 7.0, lra_min_warns: false },
};
const ALL_USAGE = `usage: node quick-checks.mjs <sheet | frozen | loudness> ...\n  ${Object.values(USAGE).join("\n  ")}`;

const [cmd, ...args] = process.argv.slice(2);
if (!cmd || cmd === "-h" || cmd === "--help") { console.log(ALL_USAGE); process.exit(cmd ? 0 : 2); }
if (!USAGE[cmd]) { console.error(`unknown subcommand "${cmd}"\n${ALL_USAGE}`); process.exit(2); }
if (args.includes("-h") || args.includes("--help")) { console.log(USAGE[cmd]); process.exit(0); }

function ffmpeg(ffArgs, capture) {
  const r = spawnSync("ffmpeg", ffArgs, capture
    ? { encoding: "utf8", maxBuffer: 1 << 30, stdio: ["ignore", "pipe", "pipe"] }
    : { stdio: ["ignore", "inherit", "inherit"] });
  if (r.error) {
    console.error(r.error.code === "ENOENT"
      ? "ffmpeg was not found on PATH. Install FFmpeg (see the ice-motion-director skill, references/prerequisites.md) and open a new terminal."
      : `could not run ffmpeg: ${r.error.message}`);
    process.exit(127);
  }
  return r;
}

function sheet() {
  if (args.length < 2) { console.error(USAGE.sheet); process.exit(2); }
  const [film, out, every = "1", cols = "6", rows = "5", start = "0", duration = ""] = args;
  const ff = ["-loglevel", "error", "-y", "-ss", start];
  if (duration) ff.push("-t", duration);
  ff.push("-i", film, "-vf", `fps=1/${every},scale=480:-1,tile=${cols}x${rows}`, "-frames:v", "1", out);
  const r = ffmpeg(ff, false);
  if (r.status !== 0) process.exit(r.status ?? 1);
  console.log(out);
}

function frozen() {
  if (args.length < 1) { console.error(USAGE.frozen); process.exit(2); }
  const [film, thArg = "0.35"] = args;
  const th = Number(thArg);
  if (!Number.isFinite(th)) { console.error(`threshold must be a number, got "${thArg}"`); process.exit(2); }
  const r = ffmpeg([
    "-hide_banner", "-i", film,
    "-vf", "fps=10,scale=320:-1,format=gray,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG",
    "-an", "-f", "null", "-",
  ], true);
  const log = `${r.stdout}${r.stderr}`;
  if (r.status !== 0) { process.stderr.write(log); process.exit(r.status ?? 1); }
  // Sample k (1-based) sits at k/10 seconds, as in the original.
  const values = [...log.matchAll(/YAVG=([0-9.]*)/g)].map((m) => Number(m[1]));
  const hits = [];
  values.forEach((v, i) => { if (v < th) hits.push(((i + 1) / 10).toFixed(1)); });
  process.stdout.write(hits.map((t) => `${t} `).join(""));
  process.stdout.write(`\nnear-frozen samples: ${hits.length} (about ${(hits.length / 10).toFixed(1)}s)\n`);
}

// loudness flags: --profile <id>, --target-lufs <n>, --true-peak <n> (overrides), --profiles; the film is the first
// argument that is neither a flag nor a flag's value.
function loudnessOptions() {
  const opts = { film: null, profile: null, targetLufs: null, truePeak: null, list: false };
  for (let k = 0; k < args.length; k++) {
    const a = args[k];
    if (a === "--profiles") opts.list = true;
    else if (a === "--profile" || a === "--target-lufs" || a === "--true-peak") {
      const v = args[++k];
      if (v === undefined) { console.error(`${a} needs a value\n${USAGE.loudness}`); process.exit(2); }
      if (a === "--profile") opts.profile = v;
      else {
        const n = Number(v);
        if (!Number.isFinite(n)) { console.error(`${a} must be a number, got "${v}"`); process.exit(2); }
        if (a === "--target-lufs") opts.targetLufs = n; else opts.truePeak = n;
      }
    } else if (opts.film === null) opts.film = a;
  }
  return opts;
}

// After the unchanged output: the summary values against the profile; exit 1 outside it.
function checkProfile(lines, opts) {
  const p = PROFILES[opts.profile];
  const read = (re) => { for (const l of lines) { const m = re.exec(l); if (m) return m[1] === "-inf" ? -Infinity : Number(m[1]); } return null; };
  const I = read(/^ +I: +(-?[\d.]+|-inf) LUFS/);
  const LRA = read(/^ +LRA: +(-?[\d.]+) LU/);
  const TP = read(/^ +Peak: +(-?[\d.]+|-inf) dBFS/);
  const i = opts.targetLufs ?? p.i;
  const tp = opts.truePeak ?? p.tp;
  const lra = p.lra_min === null && p.lra_max === null ? "any" : p.lra_min === null ? `up to ${p.lra_max}` : `${p.lra_min} to ${p.lra_max}`;
  console.log(`profile ${opts.profile} (${p.row}): I ${i} +/-${p.i_tol} LUFS, true peak at or under ${tp} dBTP, LRA ${lra} LU`);
  let fail = false;
  const say = (ok, text) => { console.log(`${ok ? "PASS" : "FAIL"} ${text}`); if (!ok) fail = true; };
  if (I === null) say(false, "integrated loudness could not be read");
  else say(Math.abs(I - i) <= p.i_tol + 1e-9, `integrated ${I} LUFS (target ${i} +/-${p.i_tol})`);
  if (TP !== null) say(TP <= tp + 1e-9, `true peak ${TP} dBTP (at or under ${tp})`);
  if (LRA !== null && p.lra_max !== null) say(LRA <= p.lra_max + 1e-9, `loudness range ${LRA} LU (at most ${p.lra_max})`);
  if (LRA !== null && p.lra_min !== null) {
    if (LRA >= p.lra_min - 1e-9) console.log(`PASS loudness range ${LRA} LU (at least ${p.lra_min})`);
    else if (p.lra_min_warns) console.log(`WARN loudness range ${LRA} LU is under the ${p.lra_min} LU floor (it goes on the ear list of qc.py --audit)`);
    else say(false, `loudness range ${LRA} LU (at least ${p.lra_min})`);
  }
  console.log(`profile check: ${fail ? "FAIL" : "PASS"}`);
  if (fail) process.exit(1);
}

function loudness() {
  const opts = loudnessOptions();
  if (opts.list) { console.log(JSON.stringify(PROFILES, null, 1)); return; }
  if (opts.profile !== null && !PROFILES[opts.profile]) {
    console.error(`unknown profile "${opts.profile}"; one of: ${Object.keys(PROFILES).join(", ")}`); process.exit(2);
  }
  if (opts.profile !== null && PROFILES[opts.profile].i === null && (opts.targetLufs === null || opts.truePeak === null)) {
    console.error("the reference profile needs --target-lufs and --true-peak (the reference's measured values)"); process.exit(2);
  }
  if (opts.film === null) { console.error(USAGE.loudness); process.exit(2); }
  const r = ffmpeg(["-hide_banner", "-i", opts.film, "-af", "ebur128=peak=true", "-f", "null", "-"], true);
  const lines = `${r.stdout}${r.stderr}`.split(/\r?\n/);
  if (r.status !== 0) { process.stderr.write(lines.join("\n")); process.exit(r.status ?? 1); }
  // Summary block: "    I:         -16.2 LUFS" and similar, with runs of spaces squeezed to one.
  for (const line of lines) if (/^ +(I|LRA|Peak):/.test(line)) console.log(line.replace(/ +/g, " "));
  // Per-frame lines carry "t: <seconds> ... S: <short-term LUFS>"; keep one value per whole second. The short-term window
  // is 3 s long, so before t = 3 s it is still filling and ffmpeg prints about -120 LUFS even over loud sound: those
  // seconds are marked on a note line under the values (not silence). Check the opening's level with look.py (audible
  // span, lead silence) instead.
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
  if (opts.profile !== null) checkProfile(lines, opts);
}

({ sheet, frozen, loudness })[cmd]();
