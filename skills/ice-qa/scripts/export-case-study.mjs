#!/usr/bin/env node
// export-case-study.mjs: build ice/case-study/case-study.json and compressed preview media from a finished run.
// Original to Ice Motion Director (Apache-2.0).
//
// It reads only the run files (ice/state.json, ice/BRIEF.md, ice/DIRECTION.md, ice/research/, ice/plan/,
// ice/review/ with critic notes and gate outputs, ice/review/NOTE.md, ice/renders/) and never invents a value:
// anything it cannot find stays empty and gets a line in the top-level "notes" list.
// Media: stills become WebP when ffmpeg is on PATH (otherwise PNG and JPEG files are copied as they are), the
// animatic becomes a short, small MP4, and full-resolution masters are never copied (only stills taken from them).
// Run log: ice/log/conversation.jsonl (written by the router's `ice-state.mjs log`) becomes the "conversation" list
// and ice/case-study/run-log.html, one small self-contained share file (run-log.mjs). Keys, tokens, email
// addresses, phone numbers and absolute paths are masked in both; the local log stays verbatim. It never reads an
// agent transcript.
// Recipe-only runs (route ice-remake, run_mode recipe-only, order 01 10; ice-remake references/style-recipe.md
// section 8) make no film: the export carries the recipe instead (STYLE-RECIPE.md, its sections, the prompt block,
// the unknowns, the sound map picture and the contact sheets the agent watched), the run log shows the recipe where
// a film run shows its final result, and the film fields (versions, metrics, gates, stages 02 to 09) are not noted
// as missing. Stages marked not_used in ice/state.json are never noted as missing in any run.
//
// Usage:
//   node export-case-study.mjs --project <folder that holds ice/> [--out <folder>] [--no-media] [--max-stills N]
// Default --out: <project>/ice/case-study. Exit codes: 0 written, 1 no ice/ folder, 2 usage error.
// Needs: Node 18 or newer, no packages. ffmpeg and ffprobe on PATH are optional (media and file metrics).
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";
import { LIMITS, createEmbedder, createMasker, renderRunLog } from "./run-log.mjs";

const USAGE = "usage: node export-case-study.mjs --project <folder that holds ice/> [--out <folder>] [--no-media] [--max-stills N]";
const argv = process.argv.slice(2);
if (argv.includes("-h") || argv.includes("--help")) { console.log(USAGE); process.exit(0); }
const opt = (name, dflt) => { const i = argv.indexOf(name); return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt; };
const projectArg = opt("--project", "");
if (!projectArg) { console.error(USAGE); process.exit(2); }
const PROJECT = resolve(projectArg);
const ICE = join(PROJECT, "ice");
if (!existsSync(ICE)) { console.error(`no ice/ folder in ${PROJECT}`); process.exit(1); }
const OUT = resolve(opt("--out", join(ICE, "case-study")));
const MEDIA = join(OUT, "media");
const WITH_MEDIA = !argv.includes("--no-media");
const MAX_STILLS = Math.max(1, Number(opt("--max-stills", "8")) || 8);

const notes = [];
const note = (field, text) => notes.push({ field, note: text });
const posix = (p) => p.split(sep).join("/");
const iceRel = (abs) => posix(relative(PROJECT, abs));
const masker = createMasker(PROJECT);

// ---------------------------------------------------------------- reading helpers
const read = (abs) => { try { return readFileSync(abs, "utf8").replace(/^﻿/, ""); } catch { return ""; } };
const readJsonFile = (abs) => { const t = read(abs); if (!t) return null; try { return JSON.parse(t); } catch { note(iceRel(abs), "not valid JSON, skipped"); return null; } };
function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (resolve(p) !== OUT) walk(p, out); } else out.push(p);
  }
  return out;
}
// Raw UI-fidelity sheets (ice-assets brand-authenticity.md section 11.1) may hold other rights holders' content
// (people's content, album art, user posts), so they stay local: never copied, embedded or linked. Only the masked
// share copy (`share_sheet` in ice/assets/manifest.json, kept in ice/review/fidelity/) is exported.
const fidelity = { raw: new Set(), share: new Set() };
const relKey = (abs) => posix(relative(PROJECT, abs)).toLowerCase();
(function collect(v, inFidelity) {
  if (Array.isArray(v)) { v.forEach((x) => collect(x, inFidelity)); return; }
  if (!v || typeof v !== "object") return;
  if (inFidelity) {
    if (typeof v.sheet === "string") fidelity.raw.add(relKey(resolve(PROJECT, v.sheet)));
    if (typeof v.share_sheet === "string") fidelity.share.add(relKey(resolve(PROJECT, v.share_sheet)));
  }
  for (const [k, x] of Object.entries(v)) collect(x, k === "fidelity");
})(readJsonFile(join(ICE, "assets", "manifest.json")), false);
function isRawFidelity(abs) {
  const k = relKey(abs);
  if (fidelity.share.has(k)) return false;
  if (fidelity.raw.has(k)) return true;
  if (!/\.(png|jpe?g|webp|gif|avif|bmp|tiff?)$/.test(k)) return false;
  return k.startsWith("temp/fidelity/") || /(^|\/)ui-fidelity\//.test(k) || (/(^|\/)fidelity\//.test(k) && /_raw\.[a-z0-9]+$/.test(k));
}
const RAW_FIDELITY_NOTE = "raw fidelity sheet kept local";
const files = walk(ICE).filter((f) => {
  if (!isRawFidelity(f)) return true;
  note("media", `${iceRel(f)} not exported: ${RAW_FIDELITY_NOTE} (it may hold other rights holders' content; only its masked share copy is exported)`);
  return false;
});
const shareSheets = files.filter((f) => /\.(png|jpe?g|webp)$/i.test(f) && (fidelity.share.has(relKey(f)) || /^ice\/review\/fidelity\//.test(relKey(f))));
const under =(sub) => files.filter((f) => posix(relative(ICE, f)).startsWith(sub));
const verNum = (p) => { const m = basename(p).match(/v(\d+)/i) || posix(p).match(/v(\d+)\//i); return m ? Number(m[1]) : 0; };
const latest = (list) => list.slice().sort((a, b) => verNum(a) - verNum(b) || statSync(a).mtimeMs - statSync(b).mtimeMs).pop();

// A "## Heading" section of a Markdown file (heading matched by its start, case-insensitive).
function section(md, heading) {
  const lines = md.split(/\r?\n/);
  const start = lines.findIndex((l) => /^##\s/.test(l) && l.replace(/^##\s+/, "").toLowerCase().startsWith(heading.toLowerCase()));
  if (start < 0) return "";
  const end = lines.findIndex((l, i) => i > start && /^##\s/.test(l));
  return lines.slice(start + 1, end < 0 ? undefined : end).join("\n");
}
// Markdown table rows as objects keyed by lower-case header cells.
function table(md) {
  const rows = md.split(/\r?\n/).filter((l) => /^\s*\|/.test(l));
  if (rows.length < 2) return [];
  const cells = (l) => l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
  const head = cells(rows[0]).map((h) => h.toLowerCase());
  return rows.slice(1).filter((l) => !/^\s*\|[\s:|-]+\|\s*$/.test(l)).map((l) => {
    const c = cells(l); const o = {}; head.forEach((h, i) => { o[h] = c[i] ?? ""; }); return o;
  });
}
const col = (row, ...names) => { for (const n of names) for (const k of Object.keys(row)) if (k.startsWith(n)) return row[k]; return ""; };
const bullets = (md) => md.split(/\r?\n/).filter((l) => /^\s*([-*]|\d+\.)\s+/.test(l)).map((l) => l.replace(/^\s*([-*]|\d+\.)\s+/, "").trim());
const clean = (s) => String(s || "").replace(/`/g, "").replace(/\*\*/g, "").trim();
const isoDate = (s) => (String(s || "").match(/\b\d{4}-\d{2}-\d{2}\b/) || [""])[0];

// ---------------------------------------------------------------- ffmpeg helpers
const has = (cmd) => { const r = spawnSync(cmd, ["-version"], { stdio: "ignore" }); return !r.error && r.status === 0; };
const FFMPEG = has("ffmpeg");
const FFPROBE = has("ffprobe");
if (!FFMPEG) note("media", "ffmpeg not on PATH: stills copied as PNG or JPEG without compression, no stills taken from the final film, no animatic preview");
if (!FFPROBE) note("versions, metrics", "ffprobe not on PATH: duration, resolution and fps of the delivered files not measured");
function probe(abs) {
  if (!FFPROBE) return null;
  const r = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate:format=duration", "-of", "json", abs], { encoding: "utf8" });
  if (r.status !== 0) return null;
  try {
    const j = JSON.parse(r.stdout); const s = (j.streams || [])[0] || {};
    const [n, d] = String(s.r_frame_rate || "0/1").split("/").map(Number);
    return { width: s.width || 0, height: s.height || 0, fps: d ? Math.round((n / d) * 100) / 100 : 0, seconds: Math.round(Number(j.format?.duration || 0) * 100) / 100 };
  } catch { return null; }
}
const ffmpeg = (args) => spawnSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: ["ignore", "ignore", "pipe"] }).status === 0;
const aspectOf = (w, h) => {
  if (!w || !h) return "";
  const r = w / h; const known = [["16:9", 16 / 9], ["9:16", 9 / 16], ["1:1", 1], ["4:5", 4 / 5], ["4:3", 4 / 3], ["21:9", 21 / 9]];
  const hit = known.find(([, v]) => Math.abs(v - r) < 0.02); return hit ? hit[0] : `${w}:${h}`;
};

// ---------------------------------------------------------------- media copy
const used = new Set();
function mediaName(stage, src, ext) {
  let base = `${stage}-${basename(src, extname(src))}`.replace(/[^\w.-]+/g, "-").slice(0, 80);
  let name = `${base}${ext}`; let i = 2;
  while (used.has(name)) name = `${base}-${i++}${ext}`;
  used.add(name); return name;
}
function addImage(stage, src, caption) {
  if (!WITH_MEDIA) return null;
  mkdirSync(MEDIA, { recursive: true });
  if (FFMPEG) {
    const name = mediaName(stage, src, ".webp");
    if (ffmpeg(["-i", src, "-vf", "scale='min(1280,iw)':-2", "-quality", "80", join(MEDIA, name)])) return { path: `media/${name}`, type: "image", caption };
    used.delete(name);
  }
  const name = mediaName(stage, src, extname(src).toLowerCase());
  copyFileSync(src, join(MEDIA, name)); return { path: `media/${name}`, type: "image", caption };
}
function addStill(stage, film, seconds, caption) {
  if (!WITH_MEDIA || !FFMPEG) return null;
  mkdirSync(MEDIA, { recursive: true });
  const name = mediaName(stage, `${basename(film, extname(film))}-${seconds.toFixed(2).replace(".", "_")}s.x`, ".webp");
  return ffmpeg(["-ss", String(seconds), "-i", film, "-frames:v", "1", "-vf", "scale='min(1280,iw)':-2", "-quality", "80", join(MEDIA, name)])
    ? { path: `media/${name}`, type: "image", caption } : (used.delete(name), null);
}
function addPreviewVideo(stage, src, caption) {
  if (!WITH_MEDIA || !FFMPEG) return null;
  mkdirSync(MEDIA, { recursive: true });
  const name = mediaName(stage, src, ".mp4");
  const ok = ffmpeg(["-i", src, "-t", "30", "-vf", "scale='min(540,iw)':-2,fps=24", "-c:v", "libx264", "-preset", "veryfast", "-crf", "30", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "64k", "-movflags", "+faststart", join(MEDIA, name)]);
  return ok ? { path: `media/${name}`, type: "video", caption } : (used.delete(name), null);
}
function addText(stage, src, caption) {
  if (!WITH_MEDIA) return { path: iceRel(src), type: "text", caption };
  mkdirSync(MEDIA, { recursive: true });
  const name = mediaName(stage, src, extname(src) || ".txt");
  copyFileSync(src, join(MEDIA, name)); return { path: `media/${name}`, type: "text", caption };
}
// A text file the user sent or received: copied with the export masking applied.
function addMaskedText(stage, src, caption) {
  if (!WITH_MEDIA) return null;
  mkdirSync(MEDIA, { recursive: true });
  const name = mediaName(stage, src, extname(src) || ".txt");
  writeFileSync(join(MEDIA, name), masker.mask(read(src)), "utf8"); return { path: `media/${name}`, type: "text", caption };
}

// ---------------------------------------------------------------- run files
const state = readJsonFile(join(ICE, "state.json")) || {};
if (!Object.keys(state).length) note("state", "ice/state.json missing or empty");
const brief = read(join(ICE, "BRIEF.md"));
if (!brief) note("brief", "ice/BRIEF.md missing");
const direction = read(join(ICE, "DIRECTION.md"));
if (!direction) note("decisions", "ice/DIRECTION.md missing");
const noteMd = read(join(ICE, "review", "NOTE.md"));
if (!noteMd) note("gates, versions", "ice/review/NOTE.md missing");
const slots = {};
for (const r of table(section(brief, "Slots"))) slots[clean(col(r, "slot")).toLowerCase()] = clean(col(r, "value"));

// Title, brand, unofficial label.
const title = clean((noteMd.match(/^#\s+(.+?):\s*delivery report/im) || [])[1] || (brief.match(/^#\s+Brief:\s*(.+)$/im) || [])[1] || "");
if (!title) note("title", "no title in NOTE.md or BRIEF.md");
const slug = String(state.project || title).toLowerCase().normalize("NFKD").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
const brandLine = clean((noteMd.match(/^Brand:\s*(.+)$/im) || [])[1] || "");
const realBrand = slots.real_brand || "";
const brand = brandLine.split(/\.\s/)[0] || (realBrand && !/^none\b/i.test(realBrand) ? realBrand.split(";")[0].trim() : "");
if (!brand) note("brand", "no Brand line in NOTE.md and no real_brand in BRIEF.md");
const allText = `${noteMd}\n${brief}`;
let unofficial = null;
if (/unofficial concept/i.test(allText) || /\bnot owner\b/i.test(realBrand)) unofficial = true;
else if (/\bowner\b/i.test(realBrand) && !/unknown/i.test(realBrand)) unofficial = false;
if (unofficial === null) note("unofficial", /fictional/i.test(allText) ? "fictional brand: no real brand, so the unofficial label does not apply" : "brand ownership not recorded");

// Prompt: the verbatim quote under "What the user said".
const said = section(brief, "What the user said");
const verbatimLine = bullets(said).find((b) => /verbatim/i.test(b)) || "";
const quoted = verbatimLine.match(/["“](.+)["”]/);
const prompt = quoted ? quoted[1] : (bullets(said)[0] ? clean(bullets(said)[0]) : "");
if (!quoted) note("prompt", prompt ? "no line marked verbatim in BRIEF.md; first line of \"What the user said\" used" : "no \"What the user said\" section in BRIEF.md");

const rawMode = String(state.mode || slots.mode || "").toLowerCase();
const mode = /^(auto|autonomous)/.test(rawMode) ? "auto" : /^step/.test(rawMode) ? "step" : "";
if (!mode) note("mode", rawMode ? `mode "${rawMode.slice(0, 40)}" is neither auto nor step` : "mode not recorded");
const route = state.route || slots.route || "";
const filmType = state.subtype || slots.film_type || "";
const size = state.size || "";
const recipeOnly = String(state.run_mode || "").toLowerCase() === "recipe-only"
  || (String(filmType).toLowerCase() === "recipe" && Array.isArray(state.order) && state.order.join(" ") === "01 10");
const notUsed = (id) => String(state.stages?.[id]?.status || "") === "not_used";
if (!size) note("size", "size (micro, standard, long) not recorded in ice/state.json");

// Supplied material.
const supplied = table(section(brief, "Supplied material")).map((r) => {
  const status = clean(col(r, "status"));
  const kind = clean(col(r, "kind"));
  const runFile = clean(col(r, "run file"));
  const header = runFile ? read(join(PROJECT, runFile)) : "";
  const filledLine = (header.match(/^Filled by the workflow:\s*(.+)$/im) || [])[1] || "";
  const filled = filledLine && !/^none/i.test(filledLine) ? filledLine.split(",").map((s) => s.split(":")[0].trim()).filter(Boolean)
    : (status.match(/partial:\s*(.+)/i) || [, ""])[1].split(",").map((s) => s.trim()).filter(Boolean);
  return { kind, status: /^partial/i.test(status) ? "partial" : "complete", filled_fields: filled };
});
if (!supplied.length) note("supplied", "no \"Supplied material\" table in BRIEF.md (nothing recorded as supplied)");

// Questions.
let questions = [];
if (Array.isArray(state.questions)) {
  questions = state.questions.map((q) => ({ question: q.question || "", answer: q.answer || "", answered_by: q.answered_by || "" }));
} else {
  questions = bullets(section(brief, "Open questions")).map((b) => {
    const ans = (b.match(/Decision\s+D-[\w.]+:\s*(.+)$/i) || [])[1] || "";
    return { question: clean(ans ? b.slice(0, b.search(/Decision\s+D-/i)) : b), answer: clean(ans), answered_by: mode === "auto" ? "default" : "" };
  });
  if (questions.length) note("questions", "read from BRIEF.md \"Open questions\"; ice/state.json has no questions list");
}

// ---------------------------------------------------------------- stages
const STAGES = [["01", "brief"], ["02", "concept"], ["03", "script"], ["04", "storyboard"], ["05", "look"], ["06", "animatic"], ["07", "build"], ["08", "sound"], ["09", "review"], ["10", "deliver"]];
const HISTORY_MAP = [[/intake|brief|research|compliance/, "01"], [/concept|direction|pitch/, "02"], [/script|structure|hook|opening|truth/, "03"], [/storyboard|shot/, "04"], [/look|style|palette/, "05"], [/animatic|cue/, "06"], [/build|draft/, "07"], [/sound|audio|mix|music/, "08"], [/review|critic|gate/, "09"], [/render|deliver|final/, "10"]];
const stages = Object.fromEntries(STAGES.map(([id, name]) => [id, { id, name, summary: "", decisions: [], artifacts: [], critic: [], minutes: null, roles: [] }]));
const addRole = (id, role) => { if (role && !stages[id].roles.includes(role)) stages[id].roles.push(role); };
const push = (id, a) => { if (a) stages[id].artifacts.push(a); };

const stateStages = state.stages && typeof state.stages === "object" ? state.stages : null;
const history = Array.isArray(state.history) ? state.history : [];
for (const [id] of STAGES) {
  const s = stateStages?.[id];
  if (s) {
    if (s.notes) stages[id].summary = String(s.notes);
    if (typeof s.minutes === "number") stages[id].minutes = s.minutes;
    for (const r of Array.isArray(s.roles) ? s.roles : []) addRole(id, typeof r === "string" ? r : r?.role);
  }
}
if (!stateStages) note("stages", "ice/state.json has no stages map; summaries built from its history notes");
for (const h of history) {
  const key = String(h.stage || "").toLowerCase();
  const ids = [...new Set(HISTORY_MAP.filter(([re]) => re.test(key)).map(([, id]) => id))];
  for (const id of ids) if (!stateStages?.[id]?.notes) stages[id].summary = [stages[id].summary, String(h.note || "")].filter(Boolean).join(" ");
}
if (STAGES.some(([id]) => !notUsed(id) && stages[id].minutes === null)) note("stages[].minutes", "minutes per stage not recorded in ice/state.json stages");

// Decisions from DIRECTION.md: "### D-NN <title>" blocks; "- D-NNx ..." bullets inside a block are separate decisions.
const DECISION_STAGE = [[/intake|brief/, "01"], [/concept|idea/, "02"], [/engine|render|build/, "07"], [/script|copy|structure|hook|opening|words|voice/, "03"], [/storyboard|shot|camera|transition/, "04"], [/direction|palette|colou?r|type|font|style|look|motion language/, "05"], [/animatic|cue|tempo|rhythm|sync|beat/, "06"], [/music|sound|sfx|mix|score/, "08"], [/intake|brief|platform|aspect|audience|goal/, "01"]];
const field = (block, name) => clean((block.match(new RegExp(`^\\s*(?:-\\s*)?${name}:\\s*(.+)$`, "im")) || [])[1] || "");
const splitOptions = (s) => (s.includes(";") ? s.split(";") : s.split(/,\s+/)).map((x) => clean(x).replace(/\.$/, "")).filter(Boolean);
const blocks = direction.split(/^###\s+/m).slice(1);
for (const b of blocks) {
  const head = b.split(/\r?\n/)[0].trim();
  const explicit = (b.match(/^Stage:\s*(\d{2})/im) || [])[1];
  const stageOf = (text) => explicit || (/^D-00/.test(head) ? "01" : "") || (DECISION_STAGE.find(([re]) => re.test(text.toLowerCase())) || [, "01"])[1];
  const subs = bullets(b).filter((l) => /^D-\d+[a-z]\b/.test(l));
  if (subs.length) {
    for (const s of subs) {
      const what = clean(s.split(/\.\s+(Options|Reason|Source)s?:/)[0]);
      stages[explicit || stageOf(head)].decisions.push({ decision: what, options: splitOptions((s.match(/Options:\s*([^.]+)\./) || [])[1] || ""), chosen: clean((what.match(/=\s*(.+)$/) || [])[1] || ""), reason: clean((s.match(/Reason:\s*(.+?)(\s+Source:|$)/) || [])[1] || ""), source: clean((s.match(/Sources?:\s*(.+)$/) || [])[1] || "") });
    }
    continue;
  }
  const id = stageOf(head);
  stages[id].decisions.push({ decision: clean(head), options: splitOptions(field(b, "Options")), chosen: field(b, "Choice"), reason: field(b, "Reason"), source: field(b, "Sources") || field(b, "Source") });
  if (/^Critic:/im.test(b)) addRole(id, "critic");
  if (/^Consultant:\s*(?!none)/im.test(b)) addRole(id, "consultant");
  if (/^Approved by:.*approver/im.test(b)) addRole(id, "approver");
  if (/^Approved by:.*user/im.test(b)) addRole(id, "user");
}

// Research.
const research = [];
for (const f of under("research/").filter((f) => f.endsWith(".md")).sort()) {
  const md = read(f);
  const question = clean((md.match(/^#\s+(.+)$/m) || [])[1] || basename(f));
  const sources = table(section(md, "Sources")).map((r) => ({ title: clean(col(r, "title")), url: clean(col(r, "url")), date: isoDate(col(r, "published")), accessed: isoDate(col(r, "accessed")) }));
  research.push({ question, sources });
  push("01", addText("01", f, `Research note ${basename(f)}`));
}
if (research.length) addRole("01", "researcher"); else note("research", "no notes in ice/research/");

// Stage files.
const plan = (name) => files.find((f) => posix(relative(ICE, f)).toLowerCase() === `plan/${name}`.toLowerCase());
if (existsSync(join(ICE, "BRIEF.md"))) push("01", addText("01", join(ICE, "BRIEF.md"), "The brief: what the user said and every slot with its source"));
for (const [id, name, caption] of [["02", "concepts.md", "Concepts pitched and the one chosen"], ["02", "TREATMENT.md", "The treatment handed to the build"], ["03", "structure.md", "Structure"], ["03", "script.md", "Script"], ["03", "hooks.md", "Openings compared"], ["04", "storyboard.md", "Storyboard"], ["04", "shot-plan.md", "Shot plan"], ["06", "cue-sheet.json", "Cue sheet"], ["08", "sound-plan.md", "Sound plan"]]) {
  const f = plan(name); if (f) push(id, addText(id, f, caption));
}
if (direction) push("05", addText("05", join(ICE, "DIRECTION.md"), "Decision log: options, choice, reason and source for every decision"));
for (const f of under("review/direction/").filter((f) => /options|critic|consultant|approver/i.test(basename(f)))) {
  const d = (basename(f).match(/^D-(\d+)/) || [])[1];
  const id = d === "01" ? "02" : "05";
  push(id, addText(id, f, `Direction review file ${basename(f)}`));
}
const styleFrames = under("plan/style-frames/").filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).slice(0, MAX_STILLS);
for (const f of styleFrames) push("05", addImage("05", f, `Style frame ${basename(f)}`));
if (!styleFrames.length) note("stages[05].artifacts", "no style frames in ice/plan/style-frames/");
const animatic = files.find((f) => /animatic.*\.(mp4|mov|webm)$/i.test(basename(f)));
if (animatic) push("06", addPreviewVideo("06", animatic, "Animatic (short, small preview)")); else note("stages[06].artifacts", "no animatic render in the run files");
const sheets = files.filter((f) => /review\//.test(posix(f)) && /(sheet|contact)[^/]*\.(jpe?g|png|webp)$/i.test(basename(f)) && !shareSheets.includes(f));
const draftSheet = latest(sheets.filter((f) => /v\d+/i.test(posix(relative(ICE, f)))));
if (draftSheet) push("07", addImage("07", draftSheet, `Contact sheet of the latest draft (${iceRel(draftSheet)})`));
const finalSheet = sheets.find((f) => /review\/final\//.test(posix(f)));
if (finalSheet) push("09", addImage("09", finalSheet, "Contact sheet of the delivered film"));
const sfx = files.find((f) => /audio\/sfx\.json$/i.test(posix(f)));
if (sfx) push("08", addText("08", sfx, "Sound effects list"));
const master = readJsonFile(join(ICE, "renders", "master.json")) || readJsonFile(join(ICE, "review", "master-final.json"));

// Critic rounds.
const criticFiles = under("review/").filter((f) => /^critic[-_](round[-_])?\d+\.md$/i.test(basename(f)) && posix(relative(ICE, f)).split("/").length === 2)
  .sort((a, b) => Number(basename(a).match(/(\d+)/)[1]) - Number(basename(b).match(/(\d+)/)[1]));
for (const f of criticFiles) {
  const md = read(f);
  const round = Number(basename(f).match(/(\d+)/)[1]);
  const vHead = md.match(/^(?:##\s*)?Verdict:?\s*(.*)$/im);
  let verdict = clean(vHead?.[1] || "").split(/\s*[.(]/)[0];
  if (!verdict && vHead) verdict = clean((section(md, "Verdict").split(/\r?\n/).find((l) => l.trim()) || "").split(/[.(]/)[0]);
  const score = clean((md.match(/Score\s*:?\s*([\d.]+\s*\/\s*\d+)/i) || [])[1] || "") || (section(md, "Scores") ? `per-shot table in ${basename(f)}` : "");
  const noteLines = [...bullets(section(md, "New defects")), ...bullets(section(md, "Regression")), ...bullets(section(md, "Blockers")), ...bullets(section(md, "Findings"))].map(clean);
  const fixes = [...bullets(section(md, "Prior items")), ...table(section(md, "Earlier findings")).map((r) => `${clean(col(r, "#"))} ${clean(col(r, "finding"))}: ${clean(col(r, "status"))}`)].map(clean).filter(Boolean);
  stages["09"].critic.push({ round, verdict, score, notes: noteLines.slice(0, 12), fixes: fixes.slice(0, 12) });
  push("09", addText("09", f, `Critic round ${round}`));
}
if (criticFiles.length) addRole("09", "critic"); else note("stages[09].critic", "no critic round files in ice/review/");
const fixesJson = files.find((f) => posix(relative(ICE, f)) === "review/fixes.json");
if (fixesJson) push("09", addText("09", fixesJson, "Fix ledger with before and after evidence"));
if (noteMd) push("10", addText("10", join(ICE, "review", "NOTE.md"), "Delivery report with measured numbers"));
const compliance = files.find((f) => posix(relative(ICE, f)) === "review/compliance.md");
if (compliance) push("09", addText("09", compliance, "Compliance gate result"));

// The recipe of a recipe-only run: the file stage 10 approved (else the first STYLE-RECIPE.md), its twin, sections,
// prompt block and unknowns; the sound map picture and the sheets the agent watched in the reference folder.
let recipe = null;
const recipeImages = [];
if (recipeOnly) {
  const named = String(state.stages?.["10"]?.artifact || "");
  const found = files.filter((f) => basename(f) === "STYLE-RECIPE.md");
  const file = found.find((f) => iceRel(f) === named) || found[0];
  if (!file) note("recipe", "recipe-only run, but no STYLE-RECIPE.md in ice/ (ice-remake references/style-recipe.md section 1)");
  else {
    const dir = dirname(file), md = read(file);
    const twinFile = join(dir, "style-recipe.json");
    const twin = existsSync(twinFile) ? readJsonFile(twinFile) : null;
    if (!twin) note("recipe.twin", `no style-recipe.json beside ${iceRel(file)}`);
    const sections = md.split(/\r?\n/).filter((l) => /^##\s/.test(l)).map((l) => clean(l.replace(/^##\s+/, "")));
    const promptHead = sections.find((h) => /prompt/i.test(h));
    const block = promptHead ? section(md, promptHead) : "";
    const fenced = (block.match(/```[a-z]*\r?\n([\s\S]*?)```/) || [])[1] || "";
    const recipePrompt = typeof twin?.prompt === "string" && twin.prompt.trim() ? twin.prompt : fenced.trim();
    if (!recipePrompt) note("recipe.prompt", `no prompt block in ${iceRel(file)} or its twin`);
    const inRef = files.filter((f) => f.startsWith(dir + sep));
    const soundMap = inRef.find((f) => /^sound[-_]map\.(svg|png|jpe?g|webp)$/i.test(basename(f)));
    if (!soundMap) note("recipe.sound_map", `no sound map picture in ${iceRel(dir)}`);
    const watched = inRef.filter((f) => /\.(jpe?g|png|webp)$/i.test(f) && /^(sheet|strip|peak|contact)/i.test(basename(f)))
      .sort((a, b) => /^sheet/i.test(basename(b)) - /^sheet/i.test(basename(a)) || a.localeCompare(b));
    if (!watched.length) note("recipe.sheets", `no contact sheets, strips or peak frames in ${iceRel(dir)}`);
    for (const [name, caption] of [["ANALYSIS.md", "Reference analysis with the Recipe notes"], ["TIMELINE.md", "Timeline of the reference"], ["SOUND-MAP.md", "Sound map of the reference"]]) {
      const f = join(dir, name); if (existsSync(f)) push("01", addMaskedText("01", f, caption));
    }
    if (soundMap) {
      recipeImages.push({ src: soundMap, caption: "Sound map: music sections, energy, sound effects and voice over time" });
      push("01", addImage("01", soundMap, "Sound map picture"));
    }
    for (const f of watched.slice(0, MAX_STILLS)) {
      recipeImages.push({ src: f, caption: `Watched by the agent: ${iceRel(f)}` });
      push("01", addImage("01", f, `Sheet the agent watched: ${basename(f)}`));
    }
    push("10", addMaskedText("10", file, "The style recipe: measured grammar, look, sound, feeling, slots and the prompt block"));
    if (twin) push("10", addMaskedText("10", twinFile, "Machine twin of the recipe"));
    recipe = { file: iceRel(file), twin: twin ? iceRel(twinFile) : "", ref_id: String(twin?.ref_id || basename(dir)), sections,
      prompt: masker.mask(recipePrompt), open_slots: Array.isArray(twin?.open_slots) ? twin.open_slots.map(String) : [],
      unknowns: bullets(section(md, "Unknowns")).map((u) => masker.mask(clean(u))), sound_map: soundMap ? iceRel(soundMap) : "", sheets: watched.map(iceRel) };
  }
}

// Gates from the NOTE.md table, or the final look gates.json when NOTE.md has none.
const RESULT = (s) => { const t = s.toLowerCase(); return /^pass/.test(t) ? "pass" : /^(fail|red)/.test(t) ? "fail" : /^(warn|yellow)/.test(t) ? "warn" : clean(s).toLowerCase(); };
let gates = table(section(noteMd, "Gates")).map((r) => ({ name: clean(col(r, "gate")), result: RESULT(col(r, "result")), value: clean(col(r, "numbers")), threshold: "" }));
if (gates.length) note("gates[].threshold", "NOTE.md gates table does not separate thresholds; they are inside each value where the report states them");
if (!gates.length) {
  const gj = readJsonFile(join(ICE, "review", "final", "look", "gates.json"));
  gates = (gj?.gates || []).map((g) => ({ name: `${g.id || ""} ${g.name || ""}`.trim(), result: RESULT(String(g.status || "")), value: String(g.detail || ""), threshold: "" }));
  if (!gates.length) note("gates", "no gates table in NOTE.md and no ice/review/final/look/gates.json");
}
const tools = [...new Set(table(section(noteMd, "Gates")).flatMap((r) => (col(r, "tool").match(/[\w./-]+\.(?:py|mjs|js)\b/g) || []).map((t) => basename(t))))];
if (!tools.length) note("tools", "no tool names in the NOTE.md gates table");

// Versions: the NOTE.md File line plus everything in ice/renders/final/.
const fileLine = clean((noteMd.match(/^File:\s*(\S+)/im) || [])[1] || "");
const finals = [...new Set([fileLine && resolve(PROJECT, fileLine), ...under("renders/final/").filter((f) => /\.(mp4|mov|webm)$/i.test(f))].filter((f) => f && existsSync(f)))];
if (fileLine && !finals.length) note("versions", `NOTE.md names ${fileLine} but the file is not in the project`);
const language = state.language || (slots.language || "").split(/[,(]/)[0].trim();
const versions = finals.map((f) => {
  const p = probe(f) || {};
  return { language, aspect: aspectOf(p.width, p.height), seconds: p.seconds ?? null, file: iceRel(f) };
});
if (!versions.length) note("versions", "no delivered file found");
const p0 = finals[0] ? probe(finals[0]) : null;
if (finals[0] && p0) {
  for (const t of [0, p0.seconds / 2, Math.max(0, p0.seconds - 0.1)]) push("10", addStill("10", finals[0], t, `Still from the delivered film at ${t.toFixed(2)} s`));
}
for (const f of under("renders/").filter((f) => /\.(png|jpe?g)$/i.test(f)).slice(0, 3)) push("10", addImage("10", f, `Delivered still ${basename(f)}`));

// Metrics.
const num = (re) => { const m = noteMd.match(re); return m ? Number(m[1]) : null; };
const metrics = {
  loudness_lufs: master?.measured_output?.lufs ?? num(/(-?\d+(?:\.\d+)?)\s*LUFS/i),
  true_peak_dbtp: master?.measured_output?.true_peak ?? num(/true peak\s*(-?\d+(?:\.\d+)?)/i),
  fps: p0?.fps ?? null,
  resolution: p0 ? `${p0.width} x ${p0.height}` : "",
};
for (const [k, v] of Object.entries(metrics)) if (v === null || v === "") note(`metrics.${k}`, "not found in the run files");

// Credits.
const credits = table(read(join(ICE, "assets", "CREDITS.md"))).map((r) => Object.values(r).map(clean).filter(Boolean).join(", ")).filter(Boolean);
if (!credits.length) note("credits", "ice/assets/CREDITS.md missing or has no table rows");

for (const [id] of STAGES) {
  const s = stages[id];
  if (notUsed(id)) continue;
  if (!s.summary) note(`stages[${id}].summary`, "no note for this stage in ice/state.json");
  if (!s.roles.length) note(`stages[${id}].roles`, "no roles recorded for this stage");
}

// A recipe-only run has no film: its film fields are not applicable, so they are not noted as missing.
if (recipeOnly) {
  const FILM = /^(versions|metrics|gates|tools|credits|research|size|brand|unofficial|stages\[0[2-9]\])/;
  const kept = notes.filter((n) => !FILM.test(n.field));
  const dropped = notes.length - kept.length;
  notes.splice(0, notes.length, ...kept);
  note("recipe", `recipe-only run: no film was made, so the film fields (versions, metrics, gates, credits, business research, stages 02 to 09) are not applicable${dropped ? ` (${dropped} film notes left out)` : ""}`);
}

// ---------------------------------------------------------------- conversation (the run log in ice/log/)
const LOG_FILE = join(ICE, "log", "conversation.jsonl");
const logEntries = [];
if (!existsSync(LOG_FILE)) note("conversation", "no ice/log/conversation.jsonl: this run kept no run log, so the conversation is empty");
else read(LOG_FILE).split(/\r?\n/).forEach((line, i) => {
  if (!line.trim()) return;
  try { const e = JSON.parse(line); if (e && typeof e === "object" && !Array.isArray(e)) logEntries.push(e); else throw new Error("not an object"); }
  catch { note("conversation", `line ${i + 1} of ice/log/conversation.jsonl is not a valid entry, skipped`); }
});
const STAGE_NAME = Object.fromEntries(STAGES);
const KIND = new Set(["image", "video", "audio", "text"]);
const conversation = logEntries.map((e, i) => {
  let text = typeof e.text === "string" ? e.text : "";
  if (e.text_file) {
    const full = read(resolve(PROJECT, String(e.text_file)));
    if (full) text = full; else note(`conversation[${i}].text`, `${e.text_file} is missing, so this message is empty`);
  }
  const attachments = (Array.isArray(e.attachments) ? e.attachments : []).map((a, j) => {
    const rel = String(a?.path || "");
    const src = resolve(PROJECT, rel);
    const kind = KIND.has(a?.kind) ? a.kind : "text";
    const direction = a?.direction === "from_user" ? "from_user" : "to_user";
    const base = { kind, direction, source: src, name: basename(rel) };
    if (rel && isRawFidelity(src)) {
      note(`conversation[${i}].attachments[${j}]`, `${rel} not exported: ${RAW_FIDELITY_NOTE}`);
      return { ...base, kind: "text", path: "", source: "", excluded: RAW_FIDELITY_NOTE };
    }
    if (!rel || !existsSync(src) || !statSync(src).isFile()) {
      note(`conversation[${i}].attachments[${j}]`, `${rel || "an attachment without a path"} is no longer in the project`);
      return { ...base, path: "", source: "" };
    }
    const caption = `${direction === "from_user" ? "Sent by the user" : "Sent to the user"}: ${basename(rel)}`;
    const media = kind === "image" ? addImage("log", src, caption) : kind === "video" ? addPreviewVideo("log", src, caption) : kind === "text" ? addMaskedText("log", src, caption) : null;
    return { ...base, path: media?.path || iceRel(src) };
  });
  const from = e.from === "user" ? "user" : "agent";
  if (e.from !== "user" && e.from !== "agent") note(`conversation[${i}].from`, `"${String(e.from ?? "")}" is neither user nor agent; shown as agent`);
  return { at: String(e.at || ""), stage: String(e.stage || ""), from, text: masker.mask(text), note: masker.mask(String(e.note || "")), attachments };
});

// ---------------------------------------------------------------- run-log.html (one self-contained share file)
const embed = createEmbedder({ ffmpeg: FFMPEG && WITH_MEDIA });
const finalFilm = finals[0] || "";
const firstUser = conversation.find((c) => c.from === "user" && c.text.trim());
const maskedPrompt = masker.mask(prompt);
const sharePrompt = firstUser ? firstUser.text : maskedPrompt;
const delivered = (Array.isArray(state.approvals) ? state.approvals : []).filter((a) => String(a?.stage || "").startsWith("10")).map((a) => a.at).pop() || "";
const header = {
  title, brand, unofficial, prompt: sharePrompt, language,
  facts: [["Brand", brand], ["Route and film type", [route, filmType].filter(Boolean).join(", ")], ["Mode", mode], ["Size", size],
    ["Started", isoDate(state.created || logEntries[0]?.at)], [delivered ? "Delivered" : "Last updated", isoDate(delivered || state.updated)],
    [recipe ? "Recipe" : "Final file", recipe ? recipe.file : finalFilm ? basename(finalFilm) : ""], ["Final length", versions[0]?.seconds ? `${versions[0].seconds} s` : ""], ["Language", language]],
  poster: "", video: "", finalName: finalFilm ? basename(finalFilm) : "",
  recipe: recipe ? { file: recipe.file, sections: recipe.sections, prompt: recipe.prompt, unknowns: recipe.unknowns } : null,
};
if (!finalFilm && !recipeOnly) note("run-log", "no final film found, so the run log shows no final result");
if (!WITH_MEDIA) note("run-log", "--no-media: the run log embeds no images and no video");
const skipNote = (what, why) => note("run-log", `${what} not embedded: ${why}`);
if (finalFilm && WITH_MEDIA) {
  const v = embed.preview(finalFilm, p0);
  if (v.uri) header.video = v.uri; else skipNote(`preview of ${basename(finalFilm)}`, v.skipped);
  const s = embed.still(finalFilm, (p0?.seconds || 0) / 2);
  if (s.uri) header.poster = s.uri; else skipNote(`poster still of ${basename(finalFilm)}`, s.skipped);
}
const renderStills = under("renders/").filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
if (!header.poster && WITH_MEDIA && renderStills.length) {
  const s = embed.image(renderStills[0]);
  if (s.uri) header.poster = s.uri; else skipNote(iceRel(renderStills[0]), s.skipped);
}

// Images in priority order: 1. the final result; 2. every image or video attached in the log, either direction, in
// log order (a video gives its middle frame); 3. the other style frames, contact sheets and drafts, until the cap.
// Each item is deduped by its file path (`key`), wherever the file lives in the project.
const pathKey = (f) => resolve(f).toLowerCase();
const middle = (film) => ({ film, at: (probe(film)?.seconds || 0) / 2 });
const drafts = under("renders/").filter((f) => /^draft.*\.(mp4|mov|webm)$/i.test(basename(f))).sort((a, b) => verNum(b) - verNum(a) || basename(b).localeCompare(basename(a))).slice(0, 4);
const finalKey = finalFilm ? pathKey(finalFilm) : "";
const GROUPS = [
  ["The recipe: sound map and the sheets the agent watched", recipeImages],
  ["Final result", [
    ...(finalFilm && p0 ? [0.05, 0.5, 0.95].map((r, i) => ({ film: finalFilm, at: p0.seconds * r, key: i ? `${finalKey}@${r}` : finalKey, caption: `Final film at ${(p0.seconds * r).toFixed(1)} s` })) : []),
    ...under("renders/final/").filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).map((f) => ({ src: f, caption: `Delivered still ${basename(f)}` }))]],
  ["Shared in the conversation", conversation.flatMap((c) => c.attachments).filter((a) => a.source && (a.kind === "image" || a.kind === "video")).map((a) => {
    const caption = `${a.direction === "from_user" ? "Sent by the user" : "Sent to the user"}: ${a.name}${a.kind === "video" ? ", middle frame" : ""}`;
    return a.kind === "video" ? { ...middle(a.source), caption } : { src: a.source, caption };
  })],
  ["Style frames", under("plan/style-frames/").filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).map((f) => ({ src: f, caption: `Style frame ${iceRel(f)}` }))],
  ["Contact sheets", [
    ...[finalSheet, ...sheets.filter((f) => f !== finalSheet).sort((a, b) => verNum(b) - verNum(a))].filter(Boolean).map((f) => ({ src: f, caption: `Contact sheet ${iceRel(f)}` })),
    ...shareSheets.map((f) => ({ src: f, caption: `UI fidelity share sheet, masked: ${iceRel(f)}` }))]],
  ["Drafts", drafts.map((f) => ({ ...middle(f), caption: `Draft ${basename(f)}, middle frame` }))],
];
const base = renderRunLog({ header, turns: [], groups: [], notes }).length + conversation.reduce((n, c) => n + c.text.length * 2 + 400, 0);
let budget = LIMITS.totalBytes - base - header.video.length - header.poster.length;
const seen = new Set();
const anchors = new Map();
let count = header.poster ? 1 : 0;
let leftOut = 0;
const groups = GROUPS.map(([heading, items]) => ({ heading, items: items.flatMap((it) => {
  const key = it.key ?? pathKey(it.src ?? it.film);
  if (seen.has(key) || !WITH_MEDIA) return [];
  seen.add(key);
  if (count >= LIMITS.images) { leftOut++; return []; }
  const r = it.src ? embed.image(it.src) : embed.still(it.film, it.at);
  if (!r.uri) { skipNote(it.src ? iceRel(it.src) : it.caption, r.skipped); return []; }
  if (r.uri.length > budget) { skipNote(it.src ? iceRel(it.src) : it.caption, `left out to keep the file under ${LIMITS.totalBytes / 1048576} MB`); return []; }
  budget -= r.uri.length;
  const id = `m${++count}`;
  anchors.set(key, id);
  return [{ id, uri: r.uri, caption: it.caption }];
}) }));
if (leftOut) note("run-log", `${leftOut} more images left out (${LIMITS.images} at most)`);
embed.cleanup();
const turns = conversation.map((c) => ({ ...c, stageName: STAGE_NAME[c.stage] || "",
  attachments: c.attachments.map((a) => ({ name: a.name, kind: a.kind, direction: a.direction, excluded: a.excluded || "", anchor: a.source ? anchors.get(pathKey(a.source)) || "" : "" })) }));
const m = masker.counts;
note("run-log", `masked in the export: ${m.keys} keys or tokens, ${m.emails} email addresses, ${m.phones} phone numbers, ${m.paths} absolute paths (ice/log/conversation.jsonl keeps the verbatim text)`);

const out = {
  slug, title, brand, unofficial, prompt: maskedPrompt, mode, route, film_type: filmType, size,
  ...(recipeOnly ? { run_mode: "recipe-only", recipe } : {}),
  supplied, questions,
  stages: STAGES.map(([id]) => stages[id]),
  research, gates, versions, metrics, credits, tools,
  conversation: conversation.map((c) => ({ at: c.at, stage: c.stage, from: c.from, text: c.text, note: c.note, attachments: c.attachments.map((a) => ({ path: a.path, kind: a.kind, direction: a.direction, ...(a.excluded ? { note: a.excluded } : {}) })) })),
  notes,
  exported: { media: WITH_MEDIA, ffmpeg: FFMPEG, at: new Date().toISOString() },
};
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, "case-study.json"), JSON.stringify(out, null, 2) + "\n", "utf8");
const html = renderRunLog({ header, turns, groups, notes });
writeFileSync(join(OUT, "run-log.html"), html, "utf8");
const htmlBytes = Buffer.byteLength(html, "utf8");
const mediaCount = WITH_MEDIA && existsSync(MEDIA) ? readdirSync(MEDIA).length : 0;
const ORDER = STAGES.filter(([id]) => !notUsed(id));
console.log(`wrote ${join(OUT, "case-study.json")}: ${recipeOnly ? `recipe-only run, recipe ${recipe ? `${recipe.file} (${recipe.sections.length} sections, ${recipeImages.length} pictures)` : "not found"}, ` : ""}${ORDER.filter(([id]) => stages[id].artifacts.length).length}/${ORDER.length} stages with artifacts, ${research.length} research notes, ${gates.length} gates, ${criticFiles.length} critic rounds, ${conversation.length} logged messages, ${mediaCount} media files, ${notes.length} notes on missing data`);
console.log(`wrote ${join(OUT, "run-log.html")}: ${(htmlBytes / 1048576).toFixed(2)} MB (${htmlBytes} bytes), ${count} images, ${header.video ? "with" : "no"} preview video${htmlBytes > LIMITS.totalBytes ? `, over the ${LIMITS.totalBytes / 1048576} MB target` : ""}`);
