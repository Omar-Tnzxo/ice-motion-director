#!/usr/bin/env node
// run-usage.mjs: measure a run's production time, tokens and their cost at the Claude API list prices.
// Original to Ice Motion Director (Apache-2.0). A module used by export-case-study.mjs, and a CLI.
//
// Source: the Claude Code session logs on this machine (<config>/projects/<encoded project path>/*.jsonl, their
// `.superseded-*` copies and every <session>/subagents/*.jsonl). Only numbers leave them: the usage counters, the
// model, the timestamps and the Claude Code version. No message text is stored or returned; a user entry's text is
// looked at only to tell a person's message (a wait for them) from a tool result or a machine note.
// Rules (measured by hand on six runs, 2026-10-31):
// - Claude Code writes each API response on 2 to 3 lines while it streams: one count per response, keyed on
//   message.id plus requestId, across every file (forks and superseded copies repeat the same responses).
// - The run's window: from the first prompt (first run log entry or ice/state.json `created`, whichever is earlier)
//   to delivery (the stage 10 approval), else to the last state update.
// - Active time: the union over all files of the gaps between consecutive entries, without a gap that ends in a
//   person's message (waiting for them) or lasts over 60 minutes (usage limits, stalls). Parallel work counts once.
// - Each token type at its own rate from ../references/api-prices.json: input, 5 minute and 1 hour cache writes,
//   cache reads, output, web searches; fast mode, Haiku 5.5 over 100,000 prompt tokens and US-only inference at their
//   own rates. A model missing from the table stays unpriced and is named, never guessed.
// - Per stage: a response belongs to the stage of the latest ice/state.json history entry at its time.
// When no session log is found (another agent, another machine) the result is { measured: false, reason }.
//
// Usage: node run-usage.mjs --project <folder that holds ice/> [--transcripts <folder or .jsonl>]... [--json]
// Exit codes: 0 measured, 3 not measured, 1 no ice/ folder, 2 usage error. Needs: Node 18 or newer, no packages.
import { closeSync, existsSync, openSync, readFileSync, readSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const PRICES_FILE = join(dirname(fileURLToPath(import.meta.url)), "..", "references", "api-prices.json");
export const GAP_MAX_MIN = 60;
const TYPES = ["input", "cache_write_5m", "cache_write_1h", "cache_read", "output"];
const ms = (iso) => { const t = Date.parse(String(iso || "")); return Number.isFinite(t) ? t : null; };
const r1 = (x) => Math.round(x * 10) / 10;
const r2 = (x) => Math.round(x * 100) / 100;

export const loadPrices = (file = PRICES_FILE) => JSON.parse(readFileSync(file, "utf8").replace(/^﻿/, ""));

// Claude Code names a project's log folder after its absolute path, every character outside [A-Za-z0-9] made "-".
export const encodeProject = (dir) => resolve(dir).replace(/[^A-Za-z0-9]/g, "-");

const LOG_FILE = /\.jsonl(\.superseded-[^/\\]*)?$/;
function logsIn(path) {
  if (!existsSync(path)) return [];
  if (statSync(path).isFile()) {
    const sub = join(path.replace(LOG_FILE, ""), "subagents");
    return [path, ...(existsSync(sub) ? readdirSync(sub).filter((f) => f.endsWith(".jsonl")).map((f) => join(sub, f)) : [])];
  }
  const out = [];
  for (const e of readdirSync(path, { withFileTypes: true })) {
    const p = join(path, e.name);
    if (e.isFile() && LOG_FILE.test(e.name)) out.push(p);
    else if (e.isDirectory() && existsSync(join(p, "subagents"))) {
      for (const f of readdirSync(join(p, "subagents"))) if (f.endsWith(".jsonl")) out.push(join(p, "subagents", f));
    }
  }
  return out;
}

// The session log files of a project: its own Claude Code folder plus any folder or file passed in `extra`.
export function findTranscripts(project, extra = [], env = process.env) {
  const root = join(env.CLAUDE_CONFIG_DIR || join(homedir(), ".claude"), "projects");
  const want = encodeProject(project).toLowerCase();
  const dirs = existsSync(root)
    ? readdirSync(root, { withFileTypes: true }).filter((e) => e.isDirectory() && (e.name.toLowerCase() === want || (want.length > 200 && e.name.toLowerCase().startsWith(want.slice(0, 200))))).map((e) => join(root, e.name))
    : [];
  const sources = [...dirs, ...extra.map((p) => resolve(p))];
  const files = [...new Set(sources.flatMap(logsIn))].sort();
  return { sources, files };
}

// Lines of a file read in 1 MiB chunks, so a log of any size never sits in memory whole.
function* lines(file) {
  const fd = openSync(file, "r");
  const buf = Buffer.alloc(1 << 20);
  let rest = Buffer.alloc(0);
  try {
    for (let n; (n = readSync(fd, buf, 0, buf.length, null)) > 0;) {
      const chunk = Buffer.concat([rest, buf.subarray(0, n)]);
      let start = 0;
      for (let i; (i = chunk.indexOf(10, start)) >= 0; start = i + 1) yield chunk.toString("utf8", start, i);
      rest = chunk.subarray(start);
    }
    if (rest.length) yield rest.toString("utf8");
  } finally { closeSync(fd); }
}

// A message a person typed, or one relayed to this session by a coordinating session: the agent was waiting for it.
const MACHINE = ["<", "[Request interrupted", "[Image", "Stop hook feedback", "This session is being continued"];
const RELAYED = ["<cross-session-message", "The coordinator sent a message"];
export function isPerson(e) {
  if (e.type !== "user" || e.isCompactSummary) return false;
  const raw = e.message?.content;
  if (typeof raw === "string" && raw.startsWith(RELAYED[1])) return true;
  if (e.isMeta) return false;
  let c = raw;
  if (Array.isArray(c)) {
    if (c.some((x) => x?.type === "tool_result")) return false;
    c = c.map((x) => (typeof x?.text === "string" ? x.text : "")).join(" ");
  }
  c = String(c || "").trimStart();
  const END = "</system-reminder>";
  while (c.startsWith("<system-reminder>") && c.includes(END)) c = c.slice(c.indexOf(END) + END.length).trimStart();
  if (RELAYED.some((p) => c.startsWith(p))) return true;
  return !!c && !MACHINE.some((p) => c.startsWith(p));
}

const newer = (a, b) => { const x = a.split(".").map(Number), y = (b || "0").split(".").map(Number); for (let i = 0; i < Math.max(x.length, y.length); i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); return false; };
const TS = /"timestamp"\s*:\s*"([^"]+)"/;
// Every response (deduplicated) and, per file, its entries as [time, byPerson], inside [from, to].
export function scan(files, from, to) {
  const resp = new Map();
  const events = new Map();
  let version = "";
  for (const file of files) {
    const ev = [];
    for (const line of lines(file)) {
      const hit = TS.exec(line);
      const t0 = hit ? ms(hit[1]) : null;
      if (t0 === null || t0 < from || t0 > to) continue;
      let e;
      try { e = JSON.parse(line); } catch { continue; }
      const t = ms(e.timestamp);
      if (t === null || t < from || t > to || (e.type !== "user" && e.type !== "assistant")) continue;
      ev.push([t, isPerson(e)]);
      if (e.type !== "assistant") continue;
      if (typeof e.version === "string" && newer(e.version, version)) version = e.version;
      const m = e.message || {};
      const u = m.usage;
      if (!u || !m.model || m.model === "<synthetic>") continue;
      const cc = u.cache_creation || {};
      const rec = {
        t, model: String(m.model), speed: u.speed === "fast" ? "fast" : "standard", geo: u.inference_geo === "us" ? "us" : "",
        input: +u.input_tokens || 0, output: +u.output_tokens || 0, cw: +u.cache_creation_input_tokens || 0,
        cw5: cc.ephemeral_5m_input_tokens ?? null, cw1: cc.ephemeral_1h_input_tokens ?? null, cr: +u.cache_read_input_tokens || 0,
        ws: +(u.server_tool_use?.web_search_requests) || 0, file,
      };
      const key = `${m.id || ""}|${e.requestId || ""}`;
      const old = m.id || e.requestId ? resp.get(key) : null;
      if (!old) { resp.set(m.id || e.requestId ? key : `${file}|${resp.size}`, rec); continue; }
      // a streaming repeat: keep the largest value of each counter and the earliest time
      for (const k of ["input", "output", "cw", "cr", "ws"]) old[k] = Math.max(old[k], rec[k]);
      for (const k of ["cw5", "cw1"]) if (rec[k] !== null) old[k] = Math.max(old[k] || 0, rec[k]);
      old.t = Math.min(old.t, rec.t);
    }
    events.set(file, ev.sort((a, b) => a[0] - b[0]));
  }
  return { responses: [...resp.values()], events, version };
}

// The busy spans: per file, each gap between consecutive entries that neither ends in a person's message nor lasts
// over GAP_MAX_MIN, merged over all files so parallel work counts once.
export function busySpans(events) {
  const spans = [];
  for (const ev of events.values()) {
    for (let i = 1; i < ev.length; i++) {
      const [a] = ev[i - 1]; const [b, person] = ev[i];
      if (!person && b > a && b - a <= GAP_MAX_MIN * 60000) spans.push([a, b]);
    }
  }
  spans.sort((x, y) => x[0] - y[0]);
  const merged = [];
  for (const [a, b] of spans) { const l = merged[merged.length - 1]; if (l && a <= l[1]) l[1] = Math.max(l[1], b); else merged.push([a, b]); }
  return merged;
}

const modelId = (m) => m.replace(/\[[^\]]*\]$/, "").replace(/-\d{8}$/, "");
function rateOf(prices, r) {
  const row = prices.models?.[modelId(r.model)];
  if (!row) return null;
  let rates = row; let key = modelId(r.model);
  if (r.speed === "fast") { if (!row.fast) return null; rates = row.fast; key += ":fast"; }
  if (row.over_100k && r.input + r.cw + r.cr > 100000) { rates = row.over_100k; key += ":over_100k"; }
  const mult = r.geo === "us" ? Number(prices.us_inference_multiplier) || 1 : 1;
  if (mult !== 1) key += ":us";
  return { rates, mult, key };
}

const emptyTokens = () => ({ input: 0, cache_write_5m: 0, cache_write_1h: 0, cache_read: 0, output: 0, web_searches: 0 });
const emptyUsd = () => ({ input: 0, cache_write_5m: 0, cache_write_1h: 0, cache_read: 0, output: 0, web_search: 0, total: 0 });
const tokenTotal = (t) => TYPES.reduce((n, k) => n + t[k], 0);
function addResponse(acc, r, price, webRate) {
  const tok = { input: r.input, cache_write_5m: 0, cache_write_1h: 0, cache_read: r.cr, output: r.output, web_searches: r.ws };
  if (r.cw5 === null && r.cw1 === null) tok.cache_write_5m = r.cw; else { tok.cache_write_5m = r.cw5 || 0; tok.cache_write_1h = r.cw1 || 0; }
  acc.responses++;
  for (const k of Object.keys(tok)) acc.tokens[k] += tok[k];
  if (!price) return;
  for (const k of TYPES) { const usd = (tok[k] * price.rates[k] * price.mult) / 1e6; acc.usd[k] += usd; acc.usd.total += usd; }
  const ws = r.ws * webRate; acc.usd.web_search += ws; acc.usd.total += ws;
}
const bucket = () => ({ responses: 0, tokens: emptyTokens(), usd: emptyUsd() });
const roundUsd = (u) => Object.fromEntries(Object.entries(u).map(([k, v]) => [k, r2(v)]));

// Stage marks from ice/state.json history: [time, "NN"] sorted by time.
export function stageMarks(history) {
  return (Array.isArray(history) ? history : [])
    .map((h) => [ms(h?.at), (String(h?.stage || "").match(/^\d{2}/) || [""])[0]])
    .filter(([t, id]) => t !== null && id).sort((a, b) => a[0] - b[0]);
}
const overlap = (spans, a, b) => spans.reduce((n, [x, y]) => n + Math.max(0, Math.min(y, b) - Math.max(x, a)), 0);

// The measurement of one window. `marks` split it by stage; `prices` is the api-prices.json object.
export function measure({ files, from, to, marks = [], prices = loadPrices() }) {
  // The run log and ice/state.json start a little after the prompt that opened the run: start at the last person's
  // message in the GAP_MAX_MIN before them, when there is one.
  const early = scan(files, from - GAP_MAX_MIN * 60000, to);
  const opener = Math.max(-Infinity, ...[...early.events.values()].flat().filter(([t, person]) => person && t <= from).map(([t]) => t));
  if (Number.isFinite(opener)) from = opener;
  const responses = early.responses.filter((r) => r.t >= from);
  const events = new Map([...early.events].map(([f, ev]) => [f, ev.filter(([t]) => t >= from)]));
  const { version } = early;
  if (!responses.length) return null;
  const webRate = (Number(prices.web_search_usd_per_1000) || 0) / 1000;
  const all = bucket();
  const byModel = {};
  const byStage = {};
  const priceKeys = new Map();
  const unpriced = new Set();
  let unsplit = 0;
  const stageOf = (t) => { let id = marks[0]?.[1] || ""; for (const [at, s] of marks) { if (at <= t) id = s; else break; } return id; };
  for (const r of responses) {
    const price = rateOf(prices, r);
    if (price) priceKeys.set(price.key, { ...price.rates, ...(price.mult !== 1 ? { multiplier: price.mult } : {}) });
    else unpriced.add(r.speed === "fast" ? `${modelId(r.model)} (fast mode)` : modelId(r.model));
    if (r.cw && r.cw5 === null && r.cw1 === null) unsplit++;
    addResponse(all, r, price, webRate);
    addResponse(byModel[modelId(r.model)] ||= bucket(), r, price, webRate);
    const id = stageOf(r.t);
    if (id) addResponse(byStage[id] ||= bucket(), r, price, webRate);
  }
  const spans = busySpans(events);
  const active = spans.reduce((n, [a, b]) => n + b - a, 0);
  // Stage segments: from each mark to the next one, clipped to the window; time before the first mark goes to its stage.
  const segs = marks.map(([t, id], i) => [id, Math.max(from, i ? t : from), Math.min(to, marks[i + 1]?.[0] ?? to)]).filter(([, a, b]) => b > a);
  const stageClock = {};
  for (const [id, a, b] of segs) { const s = (stageClock[id] ||= { wall: 0, active: 0 }); s.wall += b - a; s.active += overlap(spans, a, b); }
  const ids = [...new Set([...Object.keys(stageClock), ...Object.keys(byStage)])].sort();
  const files_with_work = new Set(responses.map((r) => r.file));
  const isSub = (f) => /[\\/]subagents[\\/]/.test(f);
  const dominant = Object.entries(byModel).sort((a, b) => b[1].tokens.output - a[1].tokens.output)[0]?.[0] || "";
  return {
    measured: true,
    measured_from: "Claude Code session logs on this machine (usage numbers and timestamps only)",
    window: { from: new Date(from).toISOString(), to: new Date(to).toISOString() },
    wall_clock_min: r1((to - from) / 60000),
    active_min: r1(active / 60000),
    responses: all.responses,
    sessions: { main: [...files_with_work].filter((f) => !isSub(f)).length, subagents: [...files_with_work].filter(isSub).length },
    agent: "Claude Code", agent_version: version, model: dominant,
    tokens: all.tokens, tokens_total: tokenTotal(all.tokens),
    usd: roundUsd(all.usd),
    by_model: Object.fromEntries(Object.entries(byModel).map(([k, b]) => [k, { responses: b.responses, tokens_total: tokenTotal(b.tokens), output_tokens: b.tokens.output, usd: unpriced.has(k) ? null : r2(b.usd.total) }])),
    by_stage: Object.fromEntries(ids.map((id) => [id, {
      wall_clock_min: r1((stageClock[id]?.wall || 0) / 60000), active_min: r1((stageClock[id]?.active || 0) / 60000),
      responses: byStage[id]?.responses || 0, tokens_total: byStage[id] ? tokenTotal(byStage[id].tokens) : 0, usd: byStage[id] ? r2(byStage[id].usd.total) : 0,
    }])),
    prices: { source: prices.source, read_on: prices.read_on, unit: prices.unit, rates: Object.fromEntries(priceKeys), web_search_usd_per_1000: prices.web_search_usd_per_1000 },
    unpriced_models: [...unpriced].sort(),
    assumptions: [
      `Claude API list prices read on ${prices.read_on} (${prices.source}): first party, no Batch discount, no subscription or volume discount.`,
      "The same prompt caching as the run: each cache write and cache read priced at its own rate, as the usage reports them.",
      unsplit ? `${unsplit} responses did not split their cache writes into 5 minute and 1 hour; priced as 5 minute writes (the lower rate).` : "",
      unpriced.size ? `Not in the price table, so left out of the dollar totals (tokens still counted): ${[...unpriced].sort().join(", ")}.` : "",
      "Active time leaves out waits for a person's answer and every pause over 60 minutes (usage limits, stalls).",
      "Sessions or agents outside this project's Claude Code log folder are not counted unless passed with --transcripts.",
    ].filter(Boolean),
  };
}

// The run's window from its own files: the first prompt to delivery.
export function runWindow(state, logStart = "", now = Date.now()) {
  const history = Array.isArray(state?.history) ? state.history : [];
  const starts = [ms(state?.created), ms(logStart), ms(history[0]?.at)].filter((t) => t !== null);
  const delivered = (Array.isArray(state?.approvals) ? state.approvals : []).filter((a) => String(a?.stage || "").startsWith("10")).map((a) => ms(a.at)).filter((t) => t !== null).pop();
  const updated = ms(state?.updated);
  const to = delivered ?? updated ?? now;
  return { from: starts.length ? Math.min(...starts) : null, to, to_source: delivered !== undefined ? "stage 10 approval" : updated !== null ? "last state update (not delivered yet)" : "now (not delivered yet)" };
}

// The whole step for a project: find the logs, take the window from ice/state.json, measure.
export function measureProject({ project, state, logStart = "", transcripts = [], env = process.env, prices }) {
  const win = runWindow(state, logStart);
  if (win.from === null) return { measured: false, reason: "no start time in ice/state.json or the run log, so the run's window is unknown" };
  if (win.to <= win.from) return { measured: false, reason: "the run's end is not after its start in ice/state.json" };
  const { files } = findTranscripts(project, transcripts, env);
  if (!files.length) return { measured: false, reason: `no Claude Code session log for this project on this machine (no folder named after the project path in the Claude Code projects folder); the run was made by another agent, on another machine, or from another folder (pass --transcripts <folder>). Nothing is estimated.` };
  const m = measure({ files, from: win.from, to: win.to, marks: stageMarks(state?.history), prices: prices || loadPrices() });
  if (!m) return { measured: false, reason: `${files.length} session log files found, but none has a response between ${new Date(win.from).toISOString()} and ${new Date(win.to).toISOString()}. Nothing is estimated.` };
  m.window.to_source = win.to_source;
  return m;
}

// The four figures the landing shows (made_with.production in listing.json), or null when they cannot all be given.
export function siteFigures(p) {
  if (!p?.measured || p.unpriced_models?.length || !(p.usd?.total > 0)) return null;
  return { wall_clock_min: Math.round(p.wall_clock_min), active_min: Math.round(p.active_min), tokens: p.tokens_total, output_tokens: p.tokens.output, api_usd: p.usd.total, priced_on: p.prices.read_on };
}

// One plain line for people: "5 h 12 min from prompt to delivery, 2 h 40 min active, 31.2M tokens, $41.07 at API list prices".
export function productionLine(p) {
  if (!p?.measured) return "";
  const hm = (min) => { const m = Math.round(min); return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`; };
  const tok = p.tokens_total >= 1e6 ? `${r1(p.tokens_total / 1e6)}M` : p.tokens_total >= 1e3 ? `${r1(p.tokens_total / 1e3)}K` : String(p.tokens_total);
  return `${hm(p.wall_clock_min)} from prompt to delivery, ${hm(p.active_min)} active, ${tok} tokens, $${p.usd.total.toFixed(2)} at API list prices of ${p.prices.read_on}${p.unpriced_models.length ? " (some models unpriced)" : ""}`;
}

// ---------------------------------------------------------------- CLI
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2);
  const USAGE = "usage: node run-usage.mjs --project <folder that holds ice/> [--transcripts <folder or .jsonl>]... [--json]";
  if (argv.includes("-h") || argv.includes("--help")) { console.log(USAGE); process.exit(0); }
  const i = argv.indexOf("--project");
  if (i < 0 || !argv[i + 1]) { console.error(USAGE); process.exit(2); }
  const project = resolve(argv[i + 1]);
  if (!existsSync(join(project, "ice"))) { console.error(`no ice/ folder in ${project}`); process.exit(1); }
  const transcripts = argv.flatMap((a, k) => (a === "--transcripts" && argv[k + 1] ? [argv[k + 1]] : []));
  let state = {};
  try { state = JSON.parse(readFileSync(join(project, "ice", "state.json"), "utf8").replace(/^﻿/, "")); } catch { /* measured as missing below */ }
  let logStart = "";
  try { logStart = JSON.parse(readFileSync(join(project, "ice", "log", "conversation.jsonl"), "utf8").split(/\r?\n/).find((l) => l.trim()) || "{}").at || ""; } catch { /* no run log */ }
  const p = measureProject({ project, state, logStart, transcripts });
  if (argv.includes("--json")) console.log(JSON.stringify(p, null, 2));
  else console.log(p.measured ? `${basename(project)}: ${productionLine(p)}` : `${basename(project)}: not measured: ${p.reason}`);
  process.exit(p.measured ? 0 : 3);
}
