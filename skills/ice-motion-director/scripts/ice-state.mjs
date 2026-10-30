#!/usr/bin/env node
// ice-state.mjs: read, write and check ice/state.json, the run state of an Ice Motion Director project.
// The schema lives in ../references/state.md; this script is its only writer and refuses keys outside it.
// Zero dependencies, Node 18.15 or newer (fs.statfsSync), Windows, macOS and Linux.
//
//   node ice-state.mjs init --project <slug> --route <route> [--subtype <type>] [--size <size>] [--mode <mode>]
//                           [--order "<order>"] [--language <code>] [--commercial-use <yes|no|unknown>]
//   node ice-state.mjs show [--json]
//   node ice-state.mjs set <NN|NNx> <status> [--artifact <path>] [--notes "<line>"] [--by user|approver]
//                          [--minutes <n>] [--roles "<role>, <role>"] [--note "<history line>"]
//   node ice-state.mjs set <key> <value> [--note "<history line>"]
//   node ice-state.mjs set question "<question>" --answer "<answer>" --by user|default
//   node ice-state.mjs check <NN>
//   node ice-state.mjs next [--json]
//   node ice-state.mjs log --from user|agent (--text "<text>" | --text-file <path>) [--attach <path>]... [--note "<line>"]
//   node ice-state.mjs space [--need <GB>] [<path> ...] [--json]
//
// Common options: --dir <project folder> (default: the current folder), --prefix <command prefix> (default "/").
// Exit codes: 0 ok or ready; 1 refused (say the printed sentence to the user); 2 usage or file problem; 3 stage not needed.
// space: 0 every path has the need, 1 one is short.
import { appendFileSync, closeSync, copyFileSync, existsSync, mkdirSync, openSync, readFileSync, readdirSync, renameSync, statSync, statfsSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const STAGES = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"];
const NAMES = { "01": "brief", "02": "concept", "03": "script", "04": "storyboard", "05": "look", "06": "animatic",
  "07": "build", "08": "sound", "09": "review", "10": "delivery" };
const COMMANDS = { "01": "ice-01-brief", "02": "ice-02-concept", "03": "ice-03-script", "04": "ice-04-storyboard", "05": "ice-05-look",
  "06": "ice-06-animatic", "07": "ice-07-build", "08": "ice-08-sound", "09": "ice-09-review", "10": "ice-10-deliver" };
const PART_NAMES = { "08a": "score, sound effects and voice", "08b": "mix and master" };
const STATUSES = ["missing", "supplied", "partial", "in_progress", "in_review", "approved", "not_used"];
const READY = new Set(["approved", "supplied", "not_used"]);
const PLAIN = { missing: "not started", supplied: "you supplied it", partial: "you supplied part of it", in_progress: "in progress",
  in_review: "waiting for review", approved: "approved", not_used: "not needed for this film" };
const ENUMS = {
  route: ["film", "explainer", "remake", "edit", "lottie", "ideas"],
  mode: ["auto", "step"],
  size: ["micro", "standard", "long", "not_applicable"],   // not_applicable: a recipe-only run makes no film
  commercial_use: ["yes", "no", "unknown"],
  crew: ["lean", "standard", "full"],
};
const STRING_KEYS = ["project", "subtype", "run_mode", "current", "step", "language"];
const TOP_KEYS = new Set(["project", "route", "subtype", "run_mode", "mode", "size", "order", "current", "step", "stages", "commercial_use",
  "language", "crew", "crew_flags", "questions", "created", "updated", "history", "approvals"]);
const STAGE_KEYS = new Set(["status", "artifact", "updated", "notes", "minutes", "roles", "parts"]);
const DEFAULT_ORDER = "01 02 03 [04 05] 06 [07 08a] 08b 09 10";
const DRAFT_ROUTES = new Set(["film", "explainer", "remake", "edit"]);
// Run log: user words are kept in full (long ones move to ice/log/messages/), agent replies are short summaries.
const AGENT_MAX = 600;
const USER_INLINE_MAX = 4000;
const KINDS = [["image", /\.(png|jpe?g|webp|gif|bmp|avif|tiff?|svg)$/i], ["video", /\.(mp4|mov|m4v|webm|mkv|avi)$/i],
  ["audio", /\.(wav|mp3|m4a|aac|flac|ogg|opus|aiff?)$/i]];

const HELP = `ice-state.mjs: read, write and check ice/state.json (schema: references/state.md).

Usage:
  node ice-state.mjs init --project <slug> --route <film|explainer|remake|edit|lottie|ideas>
       [--subtype <film type>] [--size micro|standard|long|not_applicable] [--mode auto|step] [--order "<order>"]
       [--language <code>] [--commercial-use yes|no|unknown]
  node ice-state.mjs show [--json]           the stage table in plain words and what comes next
  node ice-state.mjs set <NN|NNx> <status> [--artifact <path>] [--notes "<line>"] [--by user|approver]
       [--minutes <n>] [--roles "<role>, <role>"] [--note "<history line>"]
       reopening an approved stage also prints the files that may be stale (references/state.md "Mid-run redirect")
  node ice-state.mjs set <key> <value>     keys: ${[...STRING_KEYS, ...Object.keys(ENUMS), "order", "crew_flags"].join(", ")}
  node ice-state.mjs set question "<question>" --answer "<answer>" --by user|default
  node ice-state.mjs check <NN>              may stage NN run now? Exit 0 yes, 1 no (say the printed sentence), 3 not needed
  node ice-state.mjs next [--json]           the stage or parallel group to run next, "none" when everything is ready
  node ice-state.mjs log --from user|agent (--text "<text>" | --text-file <path>) [--attach <path>]... [--note "<line>"]
       appends one entry to ice/log/conversation.jsonl (the run log, references/state.md "Run log"): the user's
       words in full, the agent's reply as a summary of ${AGENT_MAX} characters at most, files sent or received
       (--attach, repeatable), and --note for an image shown in chat that is not a file
  node ice-state.mjs space [--need <GB>] [<path> ...] [--json]
       free disk space of the project folder's drive and of each path (a path that does not exist yet is
       measured at its nearest existing parent); with --need, exit 1 when one of them has less than <GB> free
       (the disk space rule: ice-engines references/engine-choice.md section 7.7). Needs no project

Statuses: ${STATUSES.join(", ")}.
Order: stage numbers in run order, a parallel lane in brackets, a stage split in parts with a letter,
  for example "${DEFAULT_ORDER}" (the default). Stages left out of the order become not_used.
Options: --dir <project folder> (default: current folder), --prefix <command prefix> (default "/", Codex uses "$").
Exit codes: 0 ok, 1 refused (space: a path is short), 2 usage or file problem, 3 stage not needed.`;

// ---------------------------------------------------------------- arguments
function parseArgs(argv) {
  const pos = [];
  const opt = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") opt.help = true;
    else if (a === "--json") opt.json = true;
    else if (a.startsWith("--")) {
      const eq = a.indexOf("=");
      const key = eq > 0 ? a.slice(2, eq) : a.slice(2);
      if (eq < 0 && i + 1 >= argv.length) fail(`option ${a} needs a value`);
      const value = eq > 0 ? a.slice(eq + 1) : argv[++i];
      // --attach may repeat; every other option keeps its last value.
      if (key === "attach") (opt.attach ??= []).push(value);
      else opt[key] = value;
    } else pos.push(a);
  }
  return { pos, opt };
}

class Fail extends Error {
  constructor(msg, code) { super(msg); this.code = code; }
}
// Throws so the lock is always released; main() prints the message and exits with the code.
function fail(msg, code = 2) { throw new Fail(msg, code); }

const now = () => new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

// ---------------------------------------------------------------- order
// Returns groups: [["01"], ["02"], ["04", "05"], ["07", "08a"], ...]. Entries are "NN" or "NN" plus one letter.
function parseOrder(value) {
  let groups;
  if (Array.isArray(value)) groups = value.map((g) => (Array.isArray(g) ? g.map(String) : [String(g)]));
  else {
    const text = String(value).trim();
    if (text.startsWith("[[") || text.startsWith('["')) return parseOrder(JSON.parse(text));
    groups = [];
    let open = null;
    for (const tok of text.replace(/\[/g, " [ ").replace(/\]/g, " ] ").replace(/,/g, " ").split(/\s+/).filter(Boolean)) {
      if (tok === "[") { if (open) throw new Error("nested brackets in order"); open = []; }
      else if (tok === "]") { if (!open || !open.length) throw new Error("empty or unopened bracket in order"); groups.push(open); open = null; }
      else if (open) open.push(tok);
      else groups.push([tok]);
    }
    if (open) throw new Error("unclosed bracket in order");
  }
  const seen = new Set();
  const partsOf = {};
  for (const g of groups) for (const e of g) {
    if (!/^(0[1-9]|10)[a-z]?$/.test(e)) throw new Error(`"${e}" is not a stage number (01 to 10, optionally with a part letter)`);
    if (seen.has(e)) throw new Error(`"${e}" appears twice in order`);
    seen.add(e);
    const nn = e.slice(0, 2);
    if (e.length === 3) (partsOf[nn] ??= []).push(e[2]);
    else if (partsOf[nn]) throw new Error(`stage ${nn} appears both whole and in parts`);
  }
  for (const [nn, letters] of Object.entries(partsOf)) {
    if (seen.has(nn)) throw new Error(`stage ${nn} appears both whole and in parts`);
    const want = letters.map((_, i) => String.fromCharCode(97 + i)).join("");
    if (letters.join("") !== want) throw new Error(`parts of ${nn} must be ${[...want].map((l) => nn + l).join(", ")} in that order`);
  }
  return groups;
}

const orderText = (groups) => groups.map((g) => (g.length > 1 ? `[${g.join(" ")}]` : g[0])).join(" ");
const toJsonOrder = (groups) => groups.map((g) => (g.length > 1 ? g : g[0]));
const stageOf = (entry) => entry.slice(0, 2);
const partOf = (entry) => (entry.length === 3 ? entry[2] : null);
const label = (entry) => (PART_NAMES[entry] ? `${NAMES[stageOf(entry)]} (${PART_NAMES[entry]})` : partOf(entry) ? `${NAMES[stageOf(entry)]}, part ${partOf(entry)}` : NAMES[entry]);

function entryStatus(state, entry) {
  const st = state.stages?.[stageOf(entry)];
  if (!st) return "missing";
  const p = partOf(entry);
  if (!p || st.status === "supplied" || st.status === "not_used") return st.status;
  return st.parts?.[p] ?? "missing";
}

function deriveStageStatus(st) {
  const parts = Object.keys(st.parts).sort();
  const firstOpen = parts.find((p) => !READY.has(st.parts[p]));
  if (!firstOpen) return "approved";
  const s = st.parts[firstOpen];
  if (s === "missing" && parts.some((p) => st.parts[p] === "approved")) return "in_progress";
  return s;
}

// ---------------------------------------------------------------- file access with a lock
function paths(opt) {
  const dir = resolve(opt.dir ?? process.cwd());
  return { dir, ice: join(dir, "ice"), file: join(dir, "ice", "state.json"), lock: join(dir, "ice", "state.json.lock") };
}

function sleep(ms) { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }

function withLock(p, fn) {
  mkdirSync(p.ice, { recursive: true });
  let fd = null;
  for (let i = 0; i < 100 && fd === null; i++) {
    try { fd = openSync(p.lock, "wx"); }
    catch (e) {
      if (e.code !== "EEXIST") throw e;
      try { if (Date.now() - statSync(p.lock).mtimeMs > 30000) unlinkSync(p.lock); } catch { /* removed by its owner */ }
      sleep(50);
    }
  }
  if (fd === null) fail(`${p.lockName ?? "ice/state.json"} is locked by another writer for more than 5 seconds; try again`);
  try { return fn(); } finally { closeSync(fd); try { unlinkSync(p.lock); } catch { /* already gone */ } }
}

function readState(p) {
  if (!existsSync(p.file)) return null;
  const raw = readFileSync(p.file, "utf8").replace(/^﻿/, "");
  try { return JSON.parse(raw); } catch (e) { fail(`ice/state.json is not valid JSON (${e.message}); fix the file, then run show`); }
}

// JavaScript puts the key "10" before "01" (it looks like an array index), so stages are written by hand, in
// order, one line each.
function serialize(state) {
  const { stages, ...rest } = state;
  const lines = Object.keys(stages).sort().map((k) => `    ${JSON.stringify(k)}: ${JSON.stringify(stages[k])}`);
  return JSON.stringify({ ...rest, stages: "\u0000" }, null, 2).replace('"\\u0000"', `{\n${lines.join(",\n")}\n  }`) + "\n";
}

function writeState(p, state) {
  const tmp = `${p.file}.${process.pid}.tmp`;
  writeFileSync(tmp, serialize(state), "utf8");
  for (let i = 0; ; i++) {
    try { renameSync(tmp, p.file); return; }
    catch (e) { if (i >= 20 || !["EPERM", "EACCES", "EBUSY"].includes(e.code)) throw e; sleep(50); }
  }
}

// ---------------------------------------------------------------- validation
function validate(state) {
  const problems = [];
  if (typeof state !== "object" || state === null || Array.isArray(state)) return ["the file is not a JSON object"];
  for (const k of Object.keys(state)) if (!TOP_KEYS.has(k)) problems.push(`unknown key "${k}" (allowed: ${[...TOP_KEYS].join(", ")})`);
  for (const [k, vals] of Object.entries(ENUMS)) {
    if (state[k] === undefined) { if (k !== "crew") problems.push(`"${k}" is missing`); continue; }
    if (!vals.includes(state[k])) problems.push(`"${k}" is "${state[k]}" (allowed: ${vals.join(", ")})`);
  }
  for (const k of ["project", "created", "updated"]) if (typeof state[k] !== "string" || !state[k]) problems.push(`"${k}" must be a non-empty string`);
  for (const k of STRING_KEYS) if (state[k] !== undefined && typeof state[k] !== "string") problems.push(`"${k}" must be a string`);
  if (state.current !== undefined && state.current !== "" && !STAGES.includes(state.current)) problems.push('"current" must be a stage number 01 to 10');
  let groups = null;
  try { groups = parseOrder(state.order ?? []); if (!groups.length) problems.push('"order" is empty'); }
  catch (e) { problems.push(`"order": ${e.message}`); }
  if (typeof state.stages !== "object" || state.stages === null) problems.push('"stages" map is missing (old format: run init again to upgrade it)');
  else {
    for (const nn of STAGES) if (!state.stages[nn]) problems.push(`stages."${nn}" is missing`);
    for (const [nn, st] of Object.entries(state.stages)) {
      if (!STAGES.includes(nn)) { problems.push(`stages."${nn}" is not a stage number`); continue; }
      for (const k of Object.keys(st)) if (!STAGE_KEYS.has(k)) problems.push(`stages."${nn}" has unknown key "${k}"`);
      if (!STATUSES.includes(st.status)) problems.push(`stages."${nn}".status "${st.status}" (allowed: ${STATUSES.join(", ")})`);
      if (st.minutes !== undefined && typeof st.minutes !== "number") problems.push(`stages."${nn}".minutes must be a number`);
      if (st.roles !== undefined && !Array.isArray(st.roles)) problems.push(`stages."${nn}".roles must be a list`);
      if (st.parts !== undefined) for (const [l, s] of Object.entries(st.parts)) if (!STATUSES.includes(s)) problems.push(`stages."${nn}".parts.${l} "${s}"`);
    }
    if (groups) for (const g of groups) for (const e of g) {
      const st = state.stages[stageOf(e)];
      if (st && partOf(e) && !st.parts && !["supplied", "not_used"].includes(st.status)) problems.push(`order splits ${stageOf(e)} into parts but stages."${stageOf(e)}" has no parts map`);
    }
  }
  for (const k of ["history", "approvals"]) if (!Array.isArray(state[k])) problems.push(`"${k}" must be a list`);
  if (state.crew_flags !== undefined && !Array.isArray(state.crew_flags)) problems.push('"crew_flags" must be a list');
  if (state.questions !== undefined) {
    if (!Array.isArray(state.questions)) problems.push('"questions" must be a list');
    else for (const q of state.questions) if (!q || typeof q.question !== "string" || typeof q.answer !== "string" || !["user", "default"].includes(q.answered_by)) problems.push('each "questions" item needs question, answer and answered_by (user or default)');
  }
  return problems;
}

function loadValid(p) {
  const state = readState(p);
  if (!state) return null;
  const problems = validate(state);
  if (problems.length) fail(`ice/state.json has problems:\n  - ${problems.join("\n  - ")}\nFix them with "set", then run show again`);
  return state;
}

// ---------------------------------------------------------------- readiness
function prerequisites(groups, entry) {
  const out = [];
  for (const g of groups) { if (g.includes(entry)) return out; out.push(...g); }
  return out;
}

function targetEntry(groups, state, nn) {
  const entries = groups.flat().filter((e) => stageOf(e) === nn);
  if (!entries.length) return null;
  return entries.find((e) => !READY.has(entryStatus(state, e))) ?? entries[entries.length - 1];
}

function hasDraft(p, state) {
  const art = state.stages["07"]?.artifact;
  if (art && existsSync(resolve(p.dir, art)) && statSync(resolve(p.dir, art)).isFile()) return true;
  const dir = join(p.ice, "renders");
  return existsSync(dir) && readdirSync(dir).some((f) => /^draft/i.test(f));
}

// A run whose order has a concept stage (02) in use locks its craft plan there (AGENTS.md rule 20, lesson L29):
// no later stage starts without ice/plan/craft-plan.json.
function needsCraftPlan(state, groups, entry) {
  return stageOf(entry) > "02" && groups.flat().some((e) => stageOf(e) === "02") && state.stages["02"]?.status !== "not_used";
}

// The sentence that refuses `entry`, or null when every earlier stage is ready (and the draft exists where one is needed).
function blockedBy(p, opt, state, groups, entry) {
  const blocker = prerequisites(groups, entry).find((e) => !READY.has(entryStatus(state, e)));
  if (blocker) return blockerSentence(state, opt, entry, blocker);
  if (needsCraftPlan(state, groups, entry) && !existsSync(join(p.ice, "plan", "craft-plan.json"))) {
    return `The ${label(entry)} needs the craft plan from the concept stage first (ice/plan/craft-plan.json, one row per craft dimension: ice-direction/references/treatment.md section 11). Write it, or run ${cmd(opt, "02")} again.`;
  }
  if ((entry === "08b" || stageOf(entry) === "09") && DRAFT_ROUTES.has(state.route) && !hasDraft(p, state)) {
    return `The ${label(entry)} needs a draft render of the film on disk (ice/renders/draft-<n>.mp4) first. Run ${cmd(opt, "07")} first.`;
  }
  return null;
}

function cmd(opt, nn) { return `\`${opt.prefix ?? "/"}${COMMANDS[nn]}\``; }

function blockerSentence(state, opt, target, blocker) {
  const s = entryStatus(state, blocker);
  const nn = stageOf(blocker);
  if (s === "in_review") return `The ${label(blocker)} is waiting for review. Approve it or tell me what to change; ${cmd(opt, nn)} shows it again.`;
  if (s === "in_progress") return `The ${label(blocker)} is still in progress. Finish it first with ${cmd(opt, nn)}.`;
  return `Before the ${label(target)} I need the ${label(blocker)} approved. Run ${cmd(opt, nn)} first.`;
}

function nextGroup(groups, state) {
  for (const g of groups) {
    const open = g.filter((e) => !READY.has(entryStatus(state, e)));
    if (open.length) return open;
  }
  return [];
}

// What comes next, in plain words: the first group in the order that is not ready; inside it, a stage waiting for
// review comes first, then one in progress, then the stages still to run.
function nextSentence(groups, state, opt) {
  const open = nextGroup(groups, state);
  if (!open.length) return state.run_mode === "recipe-only"
    ? "Everything is approved: the style recipe is delivered. A change reopens the stage that owns it."
    : "Everything is approved: the film is delivered. A change reopens the stage that owns it.";
  for (const s of ["in_review", "in_progress"]) {
    const e = open.find((x) => entryStatus(state, x) === s);
    if (!e) continue;
    return s === "in_review"
      ? `Review the ${label(e)}: say approved, or tell me what to change. ${cmd(opt, stageOf(e))} shows it again.`
      : `The ${label(e)} is in progress; ${cmd(opt, stageOf(e))} resumes it.`;
  }
  const cmds = [...new Set(open.map(stageOf))].map((nn) => cmd(opt, nn));
  return open.length > 1
    ? `Next: the ${open.map(label).join(" and the ")}, which can run at the same time. Run ${cmds.join(" and ")}.`
    : `Next: the ${label(open[0])}. Run ${cmds[0]}.`;
}

// ---------------------------------------------------------------- commands
function init(p, opt) {
  return withLock(p, () => {
    const old = readState(p);
    if (old && old.stages) fail("ice/state.json already exists; use show, set or check", 1);
    if (!old) {
      for (const k of ["project", "route"]) if (!opt[k]) fail(`init needs --${k}`);
    }
    const groups = (() => { try { return parseOrder(opt.order ?? old?.order ?? DEFAULT_ORDER); } catch (e) { return fail(`--order: ${e.message}`); } })();
    const t = now();
    const listed = new Set(groups.flat().map(stageOf));
    const stages = {};
    for (const nn of STAGES) {
      const st = { status: listed.has(nn) ? "missing" : "not_used", artifact: "", updated: t, notes: listed.has(nn) ? "" : "left out of the stage order" };
      const parts = groups.flat().filter((e) => stageOf(e) === nn && partOf(e));
      if (parts.length) st.parts = Object.fromEntries(parts.map((e) => [partOf(e), "missing"]));
      stages[nn] = st;
    }
    stages["01"].status = "in_progress";
    if (stages["01"].parts) stages["01"].parts = Object.fromEntries(Object.keys(stages["01"].parts).map((l, i) => [l, i ? "missing" : "in_progress"]));
    const state = {
      project: opt.project ?? old.project ?? "project",
      route: opt.route ?? old.route,
      subtype: opt.subtype ?? old?.subtype ?? "",
      mode: opt.mode ?? old?.mode ?? "auto",
      size: opt.size ?? old?.size ?? "standard",
      order: toJsonOrder(groups),
      current: "01",
      stages,
      commercial_use: opt["commercial-use"] ?? old?.commercial_use ?? "unknown",
      language: opt.language ?? old?.language ?? "",
      created: old?.created ?? t,
      updated: t,
      history: [...(Array.isArray(old?.history) ? old.history : []),
        { at: t, stage: "01", note: old ? `upgraded an old state file (its stage text was "${old.stage ?? ""}"); set finished stages by hand` : "project created" }],
      approvals: Array.isArray(old?.approvals) ? old.approvals : [],
    };
    const problems = validate(state);
    if (problems.length) fail(`cannot create the state:\n  - ${problems.join("\n  - ")}`);
    writeState(p, state);
    process.stdout.write(`Created ice/state.json: route ${state.route}, mode ${state.mode}, size ${state.size}, order ${orderText(groups)}.\n`);
  });
}

function show(p, opt) {
  const state = loadValid(p);
  if (!state) {
    const msg = `There is no project in this folder yet. ${cmd(opt, "01")} starts one step by step, or \`${opt.prefix ?? "/"}ice\` runs everything from one prompt.`;
    if (opt.json) process.stdout.write(JSON.stringify({ project: null, message: msg }) + "\n");
    else process.stdout.write(msg + "\n");
    return;
  }
  const groups = parseOrder(state.order);
  const inOrder = [...new Set(groups.flat().map(stageOf))];
  const rows = [...inOrder, ...STAGES.filter((nn) => !inOrder.includes(nn))].map((nn) => {
    const st = state.stages[nn];
    let status = PLAIN[st.status];
    if (st.parts && !["supplied", "not_used"].includes(st.status)) status = Object.entries(st.parts).map(([l, s]) => `${PART_NAMES[nn + l] ?? `part ${l}`}: ${PLAIN[s]}`).join("; ");
    return { stage: nn, name: NAMES[nn], status, file: st.artifact || "", raw: st.status };
  });
  const next = nextSentence(groups, state, opt);
  if (opt.json) { process.stdout.write(JSON.stringify({ project: state.project, route: state.route, subtype: state.subtype, size: state.size, mode: state.mode, order: orderText(groups), stages: rows, next }, null, 2) + "\n"); return; }
  const lines = [`Project ${state.project}: ${state.route}${state.subtype ? `, ${state.subtype}` : ""}, size ${state.size}, ${state.mode === "step" ? "step by step" : "auto"} mode.`, "",
    "| Stage | Name | Status | File |", "|---|---|---|---|", ...rows.map((r) => `| ${r.stage} | ${r.name} | ${r.status} | ${r.file ? `\`${r.file}\`` : ""} |`), "", next];
  process.stdout.write(lines.join("\n") + "\n");
}

function check(p, opt, nn) {
  if (!STAGES.includes(nn)) fail(`check needs a stage number 01 to 10, got "${nn ?? ""}"`);
  const state = loadValid(p);
  if (!state) {
    if (nn === "01") { process.stdout.write("Ready: there is no project yet, so stage 01 starts a new one.\n"); return 0; }
    process.stdout.write(`There is no project in this folder yet. Run ${cmd(opt, "01")} first and tell me what the film is for.\n`);
    return 1;
  }
  const groups = parseOrder(state.order);
  const st = state.stages[nn];
  const target = targetEntry(groups, state, nn);
  if (st.status === "not_used" || !target) {
    const after = groups.flat().find((e) => stageOf(e) > nn && !READY.has(entryStatus(state, e)));
    process.stdout.write(`This film does not need the ${NAMES[nn]}${st.status === "not_used" && st.notes ? ` (${st.notes})` : ""}.${after ? ` Next: ${cmd(opt, stageOf(after))}.` : ""}\n`);
    return 3;
  }
  const blocked = blockedBy(p, opt, state, groups, target);
  if (blocked) { process.stdout.write(blocked + "\n"); return 1; }
  const s = entryStatus(state, target);
  const how = { missing: "run it", partial: "fill only the missing parts", supplied: "validate it, do not rebuild it",
    in_progress: "resume it", in_review: "it is waiting for review: revise it or record the approval", approved: "running it again reopens it (later approved stages go back to review)" }[s] ?? "run it";
  const extra = nn === "07" ? " Also check the engine prerequisites first (references/prerequisites.md)." : "";
  process.stdout.write(`Ready: ${target} ${label(target)} is ${s}: ${how}.${extra}\n`);
  return 0;
}

function next(p, opt) {
  const state = loadValid(p);
  if (!state) { process.stdout.write(opt.json ? '{"next":["01"]}\n' : "next: 01 (no project yet)\n"); return; }
  const open = nextGroup(parseOrder(state.order), state);
  if (opt.json) process.stdout.write(JSON.stringify({ next: open, status: Object.fromEntries(open.map((e) => [e, entryStatus(state, e)])) }) + "\n");
  else process.stdout.write(open.length ? `next: ${open.map((e) => `${e} (${entryStatus(state, e)})`).join(", ")}\n` : "next: none (every stage is ready)\n");
}

function set(p, opt, key, value) {
  if (!key) fail("set needs a key or a stage number");
  return withLock(p, () => {
    const state = loadValid(p);
    if (!state) fail("there is no ice/state.json yet; run init first", 1);
    const t = now();
    const history = (stage, note) => state.history.push({ at: t, stage, note: opt.note ?? note });
    let reopened = null;
    if (/^(0[1-9]|10)[a-z]?$/.test(key)) reopened = setStage(p, state, opt, key, value, t, history);
    else if (key === "question") {
      if (!value || opt.answer === undefined || !["user", "default"].includes(opt.by)) fail('set question "<question>" needs --answer "<answer>" and --by user|default');
      (state.questions ??= []).push({ question: value, answer: opt.answer, answered_by: opt.by });
      history(state.current ?? "01", `question recorded: ${value}`);
    } else if (key === "order") {
      let groups;
      try { groups = parseOrder(value ?? ""); } catch (e) { fail(`order: ${e.message}`); }
      const listed = new Set(groups.flat().map(stageOf));
      for (const nn of STAGES) {
        const st = state.stages[nn];
        if (!listed.has(nn) && st.status === "missing") { st.status = "not_used"; st.notes = "left out of the stage order"; st.updated = t; }
        if (listed.has(nn) && st.status === "not_used" && st.notes === "left out of the stage order") { st.status = "missing"; st.notes = ""; st.updated = t; }
        const letters = groups.flat().filter((e) => stageOf(e) === nn && partOf(e)).map(partOf);
        if (letters.length) st.parts = Object.fromEntries(letters.map((l) => [l, st.parts?.[l] ?? (READY.has(st.status) ? st.status : "missing")]));
        else delete st.parts;
      }
      state.order = toJsonOrder(groups);
      history(state.current ?? "01", `order set to ${orderText(groups)}`);
    } else if (key === "crew_flags") {
      state.crew_flags = String(value ?? "").split(",").map((s) => s.trim()).filter(Boolean);
      history(state.current ?? "01", `crew flags: ${state.crew_flags.join(", ") || "none"}`);
    } else if (ENUMS[key]) {
      if (!ENUMS[key].includes(value)) fail(`${key} must be one of ${ENUMS[key].join(", ")}`);
      state[key] = value;
      history(state.current ?? "01", `${key} set to ${value}`);
    } else if (STRING_KEYS.includes(key)) {
      if (key === "current" && !STAGES.includes(value)) fail("current must be a stage number 01 to 10");
      state[key] = value ?? "";
      if (key !== "step") history(state.current ?? "01", `${key} set to ${value}`);
    } else fail(`"${key}" is not in the schema. Keys: ${[...STRING_KEYS, ...Object.keys(ENUMS), "order", "crew_flags", "question"].join(", ")}, or a stage number`);
    state.updated = t;
    const problems = validate(state);
    if (problems.length) fail(`refused, the result would break the schema:\n  - ${problems.join("\n  - ")}`);
    writeState(p, state);
    process.stdout.write(`Saved. ${nextSentence(parseOrder(state.order), state, opt)}\n`);
    if (reopened) process.stdout.write(redirectChecklist(state, reopened));
  });
}

// ---------------------------------------------------------------- mid-run redirect checklist
// Printed only when an approved stage is reopened, after the "Saved." line (earlier output is unchanged). The rows
// live once, in the "Mid-run redirect" table of ../references/state.md; this reads that table, never a copy.
const STATE_DOC = join(dirname(fileURLToPath(import.meta.url)), "..", "references", "state.md");
function redirectRows(text) {
  const section = text.split(/^## /m).find((s) => s.startsWith("Mid-run redirect"));
  if (!section) return [];
  const rows = [];
  for (const line of section.split(/\r?\n/)) {
    if (!/^\|.*\|\s*$/.test(line) || /^\|\s*-/.test(line)) continue;
    const cells = line.trim().slice(1, -1).split("|").map((s) => s.trim());
    if (cells.length !== 5 || cells[0] === "Files") continue;
    const [files, stage, route, when, check] = cells;
    rows.push({ files, stage, route, when: when === "any" ? ["any"] : when.split(/\s*,\s*/), check });
  }
  return rows;
}
function redirectChecklist(state, nn) {
  let rows = [];
  try { rows = redirectRows(readFileSync(STATE_DOC, "utf8")); } catch { rows = []; }
  const head = `Reopened ${nn} ${NAMES[nn]}. Files that may be stale now (references/state.md, "Mid-run redirect"): update each one, or note in this stage that it still holds.`;
  if (!rows.length) return `${head}\n  - see the "Mid-run redirect" table in references/state.md\n`;
  const film = state.route === "film";
  const lines = rows
    .filter((r) => r.when.includes("any") || r.when.includes(nn))
    .filter((r) => film || r.route === "all")
    .filter((r) => !STAGES.includes(r.stage) || state.stages[r.stage]?.status !== "not_used")
    .map((r) => `  - ${r.files} (${STAGES.includes(r.stage) ? `stage ${r.stage}` : "every stage"}): ${r.check}`);
  if (!film) lines.push(`  - for every stage from ${nn} on: the files the workflow's "## Spine stages" row names`);
  return `${head}\n${lines.join("\n")}\n`;
}

function setStage(files, state, opt, entry, status, t, history) {
  if (!STATUSES.includes(status)) fail(`status must be one of ${STATUSES.join(", ")}`);
  const nn = stageOf(entry);
  const st = state.stages[nn];
  const p = partOf(entry);
  if (p && !st.parts?.[p]) fail(`stage ${nn} has no part ${p} in this project's order`);
  if (status === "approved") {
    if (!["user", "approver"].includes(opt.by)) fail("approving needs --by user (the user's own words) or --by approver (auto mode only)");
    if (state.mode === "step" && opt.by !== "user") fail("refused: in step mode only the user's own words approve a stage", 1);
  }
  const groups = parseOrder(state.order);
  if (!p && st.parts && !["supplied", "not_used", "missing"].includes(status)) {
    const first = targetEntry(groups, state, nn);
    if (status !== "in_progress") fail(`stage ${nn} runs in parts in this project's order: set ${Object.keys(st.parts).map((l) => nn + l).join(" and ")} one at a time`);
    entry = first;
    return setStage(files, state, opt, entry, status, t, history);
  }
  if (["in_progress", "in_review", "approved"].includes(status) && nn !== "01") {
    const target = p ? entry : targetEntry(groups, state, nn) ?? nn;
    const blocked = blockedBy(files, opt, state, groups, target);
    if (blocked) fail(`refused: ${blocked}`, 1);
  }
  const before = p ? st.parts[p] : st.status;
  // Reopening: an approved stage or part going back to work sends every later approved entry back to review.
  const reopening = before === "approved" && ["in_progress", "missing"].includes(status);
  if (reopening) {
    const myGroup = groups.findIndex((g) => g.includes(entry) || g.some((e) => stageOf(e) === nn && !p));
    const later = groups.slice(myGroup + 1).flat().filter((e) => stageOf(e) !== nn);
    const touched = [];
    for (const e of later) {
      const ls = state.stages[stageOf(e)];
      if (partOf(e)) { if (ls.parts?.[partOf(e)] === "approved") { ls.parts[partOf(e)] = "in_review"; touched.push(e); } }
      else if (ls.status === "approved") { ls.status = "in_review"; touched.push(e); }
    }
    for (const nn2 of new Set(touched.map(stageOf))) {
      const ls = state.stages[nn2];
      if (ls.parts) ls.status = deriveStageStatus(ls);
      ls.notes = `upstream change in ${nn}`;
      ls.updated = t;
    }
    if (touched.length) history(nn, `reopened ${entry}; back to review: ${touched.join(", ")}`);

  }
  if (p) { st.parts[p] = status; st.status = deriveStageStatus(st); }
  else {
    st.status = status;
    if (st.parts && !["supplied", "not_used"].includes(status)) for (const l of Object.keys(st.parts)) st.parts[l] = status;
  }
  if (opt.artifact !== undefined) st.artifact = opt.artifact;
  if (opt.notes !== undefined) st.notes = opt.notes;
  if (opt.minutes !== undefined) { const m = Number(opt.minutes); if (!Number.isFinite(m)) fail("--minutes must be a number"); st.minutes = m; }
  if (opt.roles !== undefined) st.roles = String(opt.roles).split(",").map((s) => s.trim()).filter(Boolean);
  st.updated = t;
  if (["in_progress", "in_review"].includes(status)) state.current = nn;
  if (status === "approved") state.approvals.push({ at: t, stage: entry, what: st.artifact || NAMES[nn], by: opt.by === "user" ? "user" : "approver role" });
  history(nn, `${entry} ${label(entry)}: ${before} to ${status}`);
  return reopening ? nn : null;
}

// ---------------------------------------------------------------- run log
// One JSON line per message in ice/log/conversation.jsonl. It never reads or imports an agent transcript: the agent
// calls it once per user message and once per reply summary (references/state.md "Run log").
const kindOf = (file) => (KINDS.find(([, re]) => re.test(file)) ?? ["text"])[0];
const toPosix = (s) => s.split(sep).join("/");
const safeName = (s) => s.replace(/[<>:"\/\\|?*\u0000-\u001f\s]+/g, "-");
function insideProject(dir, abs) {
  const r = relative(dir, abs);
  return r && !r.startsWith("..") && !isAbsolute(r) ? r : null;
}

function log(p, opt) {
  const from = opt.from;
  if (!["user", "agent"].includes(from)) fail("log needs --from user or --from agent");
  if (opt.text !== undefined && opt["text-file"] !== undefined) fail("log takes --text or --text-file, not both");
  let text = opt.text ?? "";
  if (opt["text-file"] !== undefined) {
    const tf = resolve(p.dir, opt["text-file"]);
    if (!existsSync(tf) || !statSync(tf).isFile()) fail(`--text-file ${opt["text-file"]} is not a file`);
    text = readFileSync(tf, "utf8").replace(/^﻿/, "");
  }
  text = text.replace(/\r\n/g, "\n");
  if (from === "agent") text = text.trim();
  const noteText = String(opt.note ?? "").trim();
  const attach = opt.attach ?? [];
  if (!text.trim() && !attach.length && !noteText) fail("log needs --text, --text-file, --attach or --note");
  const chars = [...text].length;
  if (from === "agent" && chars > AGENT_MAX) {
    fail(`refused: this reply summary is ${chars} characters, and the run log keeps only a short summary of each reply. Summarise the reply in 1 to 3 sentences (${AGENT_MAX} characters at most) and log it again.`, 1);
  }
  const sources = attach.map((a) => {
    const abs = resolve(p.dir, a);
    if (!existsSync(abs) || !statSync(abs).isFile()) {
      fail(`attachment ${a} is not a file. For an image shown only in the chat, use --note with one sentence on what it shows; never name a file that does not exist.`);
    }
    return abs;
  });
  const logDir = join(p.ice, "log");
  const lp = { ice: logDir, lock: join(logDir, "conversation.jsonl.lock"), lockName: "ice/log/conversation.jsonl" };
  return withLock(lp, () => {
    const file = join(logDir, "conversation.jsonl");
    const count = existsSync(file) ? readFileSync(file, "utf8").split("\n").filter((l) => l.trim()).length : 0;
    const n = String(count + 1).padStart(4, "0");
    // No state file yet means the run is at intake, stage 01 (the same rule as `check 01`).
    let stage = "01";
    if (existsSync(p.file)) {
      try { const s = JSON.parse(readFileSync(p.file, "utf8").replace(/^﻿/, "")); stage = STAGES.includes(s.current) ? s.current : ""; }
      catch { stage = ""; }
    }
    const attachments = sources.map((abs) => {
      let rel = insideProject(p.dir, abs);
      if (!rel) {
        const media = join(logDir, "media");
        mkdirSync(media, { recursive: true });
        let name = safeName(`${n}-${basename(abs)}`);
        for (let i = 2; existsSync(join(media, name)); i++) name = safeName(`${n}-${i}-${basename(abs)}`);
        copyFileSync(abs, join(media, name));
        rel = relative(p.dir, join(media, name));
      }
      return { path: toPosix(rel), kind: kindOf(abs), direction: from === "user" ? "from_user" : "to_user" };
    });
    const long = from === "user" && chars > USER_INLINE_MAX;
    if (long) {
      mkdirSync(join(logDir, "messages"), { recursive: true });
      writeFileSync(join(logDir, "messages", `${n}.md`), text, "utf8");
    }
    const entry = { at: now(), stage, from, text: long ? "" : text, ...(long ? { text_file: `ice/log/messages/${n}.md` } : {}), note: noteText, attachments };
    appendFileSync(file, JSON.stringify(entry) + "\n", "utf8");
    const extra = [attachments.length ? `${attachments.length} file${attachments.length > 1 ? "s" : ""}` : "", entry.text_file ? `full text in ${entry.text_file}` : ""].filter(Boolean);
    process.stdout.write(`Logged entry ${count + 1} in ice/log/conversation.jsonl (stage ${stage || "unknown"}, from ${from}${extra.length ? `, ${extra.join(", ")}` : ""}).\n`);
  });
}

// ---------------------------------------------------------------- disk space
// Free space before downloads, installs and renders (ice-engines references/engine-choice.md section 7.7).
const GIB = 1024 ** 3;
function nearestExisting(target) {
  let cur = target;
  while (!existsSync(cur)) {
    const up = dirname(cur);
    if (up === cur) return null;
    cur = up;
  }
  return cur;
}

function space(p, opt, targets) {
  let need = null;
  if (opt.need !== undefined) {
    need = Number(opt.need);
    if (String(opt.need).trim() === "" || !Number.isFinite(need) || need < 0) fail(`--need takes a number of GB, got "${opt.need}"`);
  }
  const rows = [{ path: p.dir, label: "project folder" }, ...targets.map((t) => ({ path: resolve(t), label: "" }))];
  for (const row of rows) {
    const at = nearestExisting(row.path);
    if (!at) fail(`no existing folder holds ${row.path}`);
    let st;
    try { st = statfsSync(at); } catch (e) { fail(`cannot read the free space at ${at}: ${e.message}`); }
    row.measured_at = at;
    row.free_gb = Math.round((Number(st.bavail) * Number(st.bsize) / GIB) * 10) / 10;
    row.ok = need === null || row.free_gb >= need;
  }
  const short = rows.filter((r) => !r.ok);
  if (opt.json) {
    process.stdout.write(JSON.stringify({ need_gb: need, ok: !short.length, paths: rows }, null, 2) + "\n");
  } else {
    const lines = [need === null ? "Free disk space:" : `Free disk space (need ${need} GB on each):`];
    for (const r of rows) {
      const where = `${r.path}${r.label ? ` (${r.label})` : ""}${r.measured_at !== r.path ? ` [measured at ${r.measured_at}]` : ""}`;
      const verdict = need === null ? "" : r.ok ? ", ok" : `, short by ${Math.round((need - r.free_gb) * 10) / 10} GB`;
      lines.push(`  ${where}: ${r.free_gb.toFixed(1)} GB free${verdict}`);
    }
    if (short.length) lines.push("Short: work on a drive with room, or free space first (ice-engines references/engine-choice.md section 7.7).");
    process.stdout.write(lines.join("\n") + "\n");
  }
  return short.length ? 1 : 0;
}

// ---------------------------------------------------------------- main
function main() {
  const { pos, opt } = parseArgs(process.argv.slice(2));
  if (opt.help || !pos.length) { process.stdout.write(HELP + "\n"); return 0; }
  const p = paths(opt);
  switch (pos[0]) {
    case "init": init(p, opt); return 0;
    case "show": case "status": show(p, opt); return 0;
    case "set": set(p, opt, pos[1], pos[2]); return 0;
    case "check": return check(p, opt, pos[1]);
    case "next": next(p, opt); return 0;
    case "log": log(p, opt); return 0;
    case "space": return space(p, opt, pos.slice(1));
    default: return fail(`unknown command "${pos[0]}"; run with --help`);
  }
}

try { process.exitCode = main(); }
catch (e) {
  if (!(e instanceof Fail)) throw e;
  process.stderr.write(`ice-state: ${e.message}\n`);
  process.exitCode = e.code;
}
