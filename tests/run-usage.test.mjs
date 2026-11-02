// Production time, tokens and API cost (skills/ice-qa/scripts/run-usage.mjs) and their place in the case study
// export, on fixture Claude Code session logs built in a temp folder: one response streamed on three lines and again
// in a superseded copy, a parallel subagent, a 90 minute usage-limit pause, a 20 minute wait for a relayed answer, 5
// minute and 1 hour cache writes, a cache write without the split, Sonnet, US-only inference, fast mode, a web search,
// a model missing from the price table and a response after delivery. Expected dollars are worked out by hand from
// skills/ice-qa/references/api-prices.json. Run: node --test tests/
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, sep } from "node:path";
import { after, test } from "node:test";
import { abs, readJson } from "./helpers.mjs";

const usageModule = await import(new URL(`file:///${abs("skills/ice-qa/scripts/run-usage.mjs").replace(/\\/g, "/")}`).href);
const { encodeProject, findTranscripts, measure, measureProject, scan, siteFigures, stageMarks } = usageModule;

const work = mkdtempSync(join(tmpdir(), "ice usage "));
after(() => rmSync(work, { recursive: true, force: true }));
const config = join(work, "claude config");
const emptyConfig = join(work, "no logs");
mkdirSync(emptyConfig, { recursive: true });

const at = (hms) => `2026-10-01T${hms}.000Z`;
const K = 1000; // token counts are scaled so the dollar totals are easy to check by hand
const user = (t, content, extra = {}) => ({ type: "user", timestamp: at(t), message: { role: "user", content }, ...extra });
const reply = (t, id, model, usage, text = "SECRET-REPLY-TEXT") => ({ type: "assistant", timestamp: at(t), requestId: `req_${id}`, version: "2.1.9",
  message: { id: `msg_${id}`, model, role: "assistant", content: [{ type: "text", text }], usage } });
const toolResult = (t) => user(t, [{ type: "tool_result", tool_use_id: "x", content: "SECRET-TOOL-OUTPUT" }]);

// Response A streams on three lines: its output count grows from 10K to 50K, and it counts once.
const A = (t, out) => reply(t, "A", "claude-opus-5-5", { input_tokens: 100 * K, cache_creation_input_tokens: 1000 * K, cache_read_input_tokens: 2000 * K, output_tokens: out,
  cache_creation: { ephemeral_5m_input_tokens: 1000 * K, ephemeral_1h_input_tokens: 0 } });
const B = reply("10:10:05", "B", "claude-opus-5-5", { input_tokens: 5 * K, cache_creation_input_tokens: 4000 * K, cache_read_input_tokens: 3000 * K, output_tokens: 200 * K,
  cache_creation: { ephemeral_5m_input_tokens: 0, ephemeral_1h_input_tokens: 4000 * K } });
const main = [
  user("09:59:00", "Make a launch film. SECRET-PROMPT-TEXT"),
  A("10:00:00", 10 * K), A("10:00:01", 50 * K), A("10:00:02", 50 * K),
  toolResult("10:10:00"),
  B,
  reply("11:40:05", "limit", "<synthetic>", { input_tokens: 0, output_tokens: 0 }, "You've hit your session limit"),
  reply("11:40:10", "C", "claude-sonnet-5-5", { input_tokens: 10 * K, output_tokens: 20 * K }),
  user("12:00:10", "<system-reminder>\nSECRET-REMINDER\n</system-reminder>\n<cross-session-message from=\"lead\">SECRET-RELAYED-ANSWER</cross-session-message>"),
  reply("12:00:20", "D", "claude-opus-5-5", { input_tokens: 1000 * K, output_tokens: 100 * K, inference_geo: "us" }),
  reply("12:00:30", "E", "claude-mystery-9", { input_tokens: 0, output_tokens: 7 * K }),
  reply("12:00:40", "F", "claude-opus-5-5", { input_tokens: 1 * K, output_tokens: 1000 * K, speed: "fast" }),
  reply("12:40:00", "G", "claude-opus-5-5", { input_tokens: 9 * K, output_tokens: 9 * K }),
];
const sub = [
  user("10:05:00", "Subtask brief. SECRET-SUBTASK"),
  reply("10:20:00", "H", "claude-opus-5-5", { input_tokens: 2 * K, cache_creation_input_tokens: 800 * K, cache_read_input_tokens: 500 * K, output_tokens: 300 * K,
    server_tool_use: { web_search_requests: 2 } }),
];
const jsonl = (entries) => entries.map((e) => JSON.stringify(e)).join("\n") + "\n";
function writeLogs(dir) {
  mkdirSync(join(dir, "sess-1", "subagents"), { recursive: true });
  writeFileSync(join(dir, "sess-1.jsonl"), jsonl(main));
  writeFileSync(join(dir, "sess-1.jsonl.superseded-1"), jsonl(main.slice(0, 6)));
  writeFileSync(join(dir, "sess-1", "subagents", "agent-1.jsonl"), jsonl(sub));
}

const state = {
  project: "usage-demo", route: "film", mode: "auto", created: at("10:00:00"), updated: at("12:35:00"),
  history: [{ at: at("10:00:00"), stage: "01", note: "project created" }, { at: at("10:30:00"), stage: "02", note: "02 concept: missing to in_review" },
    { at: at("12:00:00"), stage: "10", note: "10 delivery: missing to in_review" }],
  approvals: [{ at: at("12:30:00"), stage: "10", what: "ice/renders/final/x.mp4", by: "approver role" }],
  stages: { "01": { status: "approved" }, "02": { status: "approved" }, "10": { status: "approved" } },
};
function project(name, withLogs) {
  const dir = join(work, name);
  mkdirSync(join(dir, "ice", "log"), { recursive: true });
  writeFileSync(join(dir, "ice", "state.json"), JSON.stringify(state));
  writeFileSync(join(dir, "ice", "log", "conversation.jsonl"), JSON.stringify({ at: at("10:00:30"), stage: "01", from: "user", text: "Make a launch film." }) + "\n");
  if (withLogs) writeLogs(join(config, "projects", encodeProject(dir)));
  return dir;
}
const measured = project("client film", true);
const elsewhere = project("other agent film", false);
const exporter = (dir, cfg) => spawnSync(process.execPath, [abs("skills/ice-qa/scripts/export-case-study.mjs"), "--project", dir, "--no-media"],
  { encoding: "utf8", timeout: 120000, env: { ...process.env, CLAUDE_CONFIG_DIR: cfg } });

test("api-prices.json: one dated table with its source, every rate a number", () => {
  const p = readJson("skills/ice-qa/references/api-prices.json");
  assert.equal(p.source, "https://platform.claude.com/docs/en/about-claude/pricing");
  assert.match(p.read_on, /^\d{4}-\d{2}-\d{2}$/);
  for (const [model, row] of Object.entries(p.models)) {
    for (const tier of [row, row.fast, row.over_100k].filter(Boolean)) {
      for (const k of ["input", "cache_write_5m", "cache_write_1h", "cache_read", "output"]) assert.equal(typeof tier[k], "number", `${model} ${k}`);
    }
  }
  const src = readFileSync(abs("skills/ice-qa/scripts/run-usage.mjs"), "utf8");
  assert.match(src, /api-prices\.json/, "the logic reads its prices from the data file");
  assert.doesNotMatch(src, /\d\s*\/\s*1e6|1e6\s*\*\s*\d/, "no rate is written into the logic");
});

test("dedupe: one response written on several lines, and again in a superseded copy, counts once", () => {
  const dir = join(work, "dedupe");
  writeLogs(dir);
  const { files } = findTranscripts(join(work, "nowhere"), [dir], { CLAUDE_CONFIG_DIR: emptyConfig });
  assert.equal(files.length, 3, "main log, its superseded copy and the subagent log");
  const { responses } = scan([join(dir, "sess-1.jsonl")], Date.parse(at("09:00:00")), Date.parse(at("13:00:00")));
  const a = responses.filter((r) => r.output === 50 * K && r.cw5 === 1000 * K);
  assert.equal(a.length, 1, "three streamed lines of response A are one response");
  const all = scan(files, Date.parse(at("09:00:00")), Date.parse(at("13:00:00"))).responses;
  assert.equal(all.length, 8, "A to H once each (the session limit note has no usage), across all three files");
});

test("measure: tokens by type, dollars at each type's rate, waits and pauses left out of active time, stages from history", () => {
  const p = measureProject({ project: measured, state, logStart: at("10:00:30"), env: { CLAUDE_CONFIG_DIR: config } });
  assert.equal(p.measured, true, p.reason);
  assert.equal(p.window.from, at("09:59:00"), "the window starts at the prompt that opened the run");
  assert.equal(p.window.to, at("12:30:00"));
  assert.equal(p.window.to_source, "stage 10 approval");
  assert.equal(p.wall_clock_min, 151);
  // busy: 09:59:00 to 10:20:00 (main and the parallel subagent, counted once), 5 s at 11:40, 30 s after 12:00:10
  assert.equal(p.active_min, 21.6, "the 90 minute limit pause and the 20 minute wait for a relayed answer are left out");
  assert.equal(p.responses, 7, "response G came after delivery");
  assert.deepEqual(p.sessions, { main: 1, subagents: 1 });
  assert.deepEqual(p.tokens, { input: 1118 * K, cache_write_5m: 1800 * K, cache_write_1h: 4000 * K, cache_read: 5500 * K, output: 1677 * K, web_searches: 2 });
  assert.equal(p.tokens_total, 14095 * K);
  // Opus 5.5: A 6.80, B 36.62, D (US only, 1.1x) 6.60, F (fast) 40.008, H 10.108 plus 2 web searches 0.02; Sonnet 5.5 C 0.22
  assert.equal(p.usd.total, 100.38);
  assert.equal(p.usd.cache_write_1h, 32, "B's 1 hour write at 8 per million");
  assert.equal(p.usd.cache_write_5m, 9, "A's 5 minute write plus H's unsplit write, both at 5 per million");
  assert.equal(p.usd.web_search, 0.02);
  assert.deepEqual(p.unpriced_models, ["claude-mystery-9"], "a model missing from the table is named, never guessed");
  assert.equal(p.by_model["claude-mystery-9"].usd, null);
  assert.equal(p.by_model["claude-sonnet-5-5"].usd, 0.22);
  assert.ok(p.prices.rates["claude-opus-5-5:fast"] && p.prices.rates["claude-opus-5-5:us"].multiplier === 1.1, "the rates used are recorded");
  assert.ok(p.assumptions.some((a) => /1 responses did not split/.test(a)));
  assert.deepEqual(p.by_stage["01"], { wall_clock_min: 31, active_min: 21, responses: 3, tokens_total: (3150 + 7205 + 1602) * K, usd: 53.55 });
  assert.equal(p.by_stage["02"].usd, 0.22);
  assert.equal(p.by_stage["10"].usd, 46.61);
  assert.equal(p.agent_version, "2.1.9");
  assert.equal(siteFigures(p), null, "the landing figures are left out while a model is unpriced");
  assert.doesNotMatch(JSON.stringify(p), /SECRET/, "no text from a session log leaves it");
});

test("stageMarks and measure: a run without history still measures, all in one window", () => {
  const dir = join(work, "dedupe");
  const files = findTranscripts(join(work, "nowhere"), [dir], { CLAUDE_CONFIG_DIR: emptyConfig }).files;
  assert.deepEqual(stageMarks([{ at: "bad", stage: "01" }, { at: at("10:00:00"), stage: "x" }]), []);
  const p = measure({ files, from: Date.parse(at("09:00:00")), to: Date.parse(at("12:50:00")) });
  assert.equal(p.responses, 8);
  assert.deepEqual(p.by_stage, {});
});

test("export: the production block, stage usage and minutes, and the run log line come from the session logs", () => {
  const r = exporter(measured, config);
  assert.equal(r.status, 0, r.stderr);
  const cs = JSON.parse(readFileSync(join(measured, "ice", "case-study", "case-study.json"), "utf8"));
  assert.equal(cs.production.measured, true);
  assert.equal(cs.production.usd.total, 100.38);
  assert.equal(cs.production.tokens_total, 14095 * K);
  assert.equal(cs.production.prices.read_on, readJson("skills/ice-qa/references/api-prices.json").read_on);
  const s01 = cs.stages.find((s) => s.id === "01");
  assert.equal(s01.minutes, 21, "a stage without recorded minutes takes its measured active minutes");
  assert.deepEqual(s01.usage, { wall_clock_min: 31, active_min: 21, tokens_total: 11957 * K, usd: 53.55 });
  assert.equal(cs.stages.find((s) => s.id === "05").usage, null);
  assert.ok(cs.notes.some((n) => n.field === "production.usd" && /claude-mystery-9/.test(n.note)));
  const html = readFileSync(join(measured, "ice", "case-study", "run-log.html"), "utf8");
  assert.match(html, /<dt>Production<\/dt><dd dir="auto">2 h 31 min from prompt to delivery, 22 min active, 14.1M tokens, \$100\.38 at API list prices of \d{4}-\d{2}-\d{2} \(some models unpriced\)/);
  for (const text of [JSON.stringify(cs), html]) assert.doesNotMatch(text, /SECRET/, "no text from a session log reaches the export");
});

test("export without session logs: not measured, with the reason, nothing invented", () => {
  const r = exporter(elsewhere, emptyConfig);
  assert.equal(r.status, 0, r.stderr);
  const cs = JSON.parse(readFileSync(join(elsewhere, "ice", "case-study", "case-study.json"), "utf8"));
  assert.equal(cs.production.measured, false);
  assert.match(cs.production.reason, /no Claude Code session log for this project/);
  assert.deepEqual(Object.keys(cs.production).sort(), ["measured", "reason"], "no number is guessed");
  assert.ok(cs.stages.every((s) => s.usage === null && s.minutes === null));
  assert.ok(cs.notes.some((n) => n.field === "production" && /^not measured: /.test(n.note)));
  assert.match(readFileSync(join(elsewhere, "ice", "case-study", "run-log.html"), "utf8"), /<dt>Production<\/dt><dd dir="auto">not measured</);
});

test("findTranscripts: a log folder kept as a junction or symlink is found by default, its subagent logs too", () => {
  const cfg = join(work, "linked config");
  const real = join(work, "logs moved elsewhere");
  writeLogs(real);
  const proj = join(work, "linked film");
  mkdirSync(join(cfg, "projects"), { recursive: true });
  symlinkSync(real, join(cfg, "projects", encodeProject(proj)), process.platform === "win32" ? "junction" : "dir");
  const { files } = findTranscripts(proj, [], { CLAUDE_CONFIG_DIR: cfg });
  assert.equal(files.length, 3, "main log, its superseded copy and the subagent log, without --transcripts");
  assert.ok(files.some((f) => /[\\/]subagents[\\/]/.test(f)));
});

test("findTranscripts: subagents of a session opened in a parent folder are found when their brief names the project", () => {
  const cfg = join(work, "parent config");
  const workspace = join(work, "workspace");
  const proj = join(workspace, "films", "pilot");
  const sib = join(workspace, "films", "pilot-2");
  const logDir = join(cfg, "projects", encodeProject(workspace), "lead-session", "subagents");
  mkdirSync(logDir, { recursive: true });
  writeFileSync(join(cfg, "projects", encodeProject(workspace), "lead-session.jsonl"), jsonl(main));
  const brief = (p) => [user("10:05:00", `Build the film in ${p}${sep}ice now.`), sub[1]];
  writeFileSync(join(logDir, "agent-a.jsonl"), jsonl(brief(proj)));
  writeFileSync(join(logDir, "agent-b.jsonl"), jsonl(brief(sib)));
  writeFileSync(join(logDir, "agent-c.jsonl"), jsonl(brief(join(work, "unrelated"))));
  const { files } = findTranscripts(proj, [], { CLAUDE_CONFIG_DIR: cfg });
  assert.deepEqual(files.map((f) => basename(f)), ["agent-a.jsonl"], "only the subagent whose brief names this project; not pilot-2, not the lead's own log");
  const withFlag = findTranscripts(proj, [join(cfg, "projects", encodeProject(workspace), "lead-session.jsonl")], { CLAUDE_CONFIG_DIR: cfg }).files;
  assert.ok(withFlag.length >= 3, "--transcripts still adds the lead's log and its subagents");
});

test("export-case-study.mjs: full-film rounds count under both names, critic-<n>.md and the stage 09 film-r<n>.md", () => {
  const dir = project("critic names", false);
  mkdirSync(join(dir, "ice", "review", "clarity"), { recursive: true });
  writeFileSync(join(dir, "ice", "review", "film-r1.md"), "Verdict: REVISE\n\n## Findings\n- logo too small\n");
  writeFileSync(join(dir, "ice", "review", "film-r2.md"), "Verdict: PASS\n");
  writeFileSync(join(dir, "ice", "review", "critic-2.md"), "Verdict: PASS\n");
  writeFileSync(join(dir, "ice", "review", "critic-round-3.md"), "Verdict: PASS\n");
  writeFileSync(join(dir, "ice", "review", "clarity", "read-3-r1.md"), "not a full-film round\n");
  const r = exporter(dir, emptyConfig);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /, 3 critic rounds,/, "rounds 1, 2 and 3; round 2 written under both names counts once");
  const cs = JSON.parse(readFileSync(join(dir, "ice", "case-study", "case-study.json"), "utf8"));
  const critic = cs.stages.find((s) => s.id === "09").critic;
  assert.deepEqual(critic.map((c) => [c.round, c.verdict]), [[1, "REVISE"], [2, "PASS"], [3, "PASS"]]);
});
