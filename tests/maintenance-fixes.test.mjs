// Maintenance fixes before the repo goes public: no machine-specific paths in the maintainer docs and gate files,
// the stage 02 structure step reads files that exist at 02, the opening render study sits at stage 07, one policy
// header in every requirements.txt, and the mid-run redirect checklist (references/state.md) with its print-out
// from `ice-state.mjs set NN in_progress` on a reopening. Zero dependencies. Run: node --test tests/
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { abs, readText, repoFiles } from "./helpers.mjs";

const STAGES = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"];
const section = (text, heading) => {
  const start = text.indexOf(`\n## ${heading}`);
  assert.ok(start >= 0, `section "${heading}" not found`);
  const end = text.indexOf("\n## ", start + 4);
  return text.slice(start, end < 0 ? undefined : end);
};

// ---------------------------------------------------------------- 1. machine-specific paths
// Allowed: system locations every machine has and placeholders for the user name. Anything else that looks like an
// absolute path on one person's machine, or a backslash path into a sibling working folder, is refused.
const ALLOWED_WIN = /^[A-Za-z]:\\(Program Files( \(x86\))?|ProgramData|Windows)(\\|$)|^C:\\Users\\(<you>|USERNAME|someone)(\\|$)/;
function machinePaths(text) {
  const hits = [];
  text.split(/\r?\n/).forEach((line, i) => {
    for (const m of line.matchAll(/(?<![\w%$])[A-Za-z]:\\[^\s`"')]*/g)) if (!ALLOWED_WIN.test(m[0])) hits.push(`${i + 1}: ${m[0]}`);
    for (const m of line.matchAll(/(?<![\w.~])\/(Users|home)\/([A-Za-z0-9._-]+)/g)) if (!/^(<you>|USERNAME|someone|runner)$/.test(m[2])) hits.push(`${i + 1}: ${m[0]}`);
    for (const m of line.matchAll(/`_[A-Za-z0-9-]+\\[^`]*`/g)) hits.push(`${i + 1}: ${m[0]}`);
    for (const m of line.matchAll(/~\/\.claude\/tools\/[^\s`]*/g)) hits.push(`${i + 1}: ${m[0]}`);
  });
  return hits;
}

test("maintainer docs and gate files hold no machine-specific paths", () => {
  const owned = repoFiles().filter((f) => (f.startsWith("docs/maintainers/") && f !== "docs/maintainers/architecture.md") || f.startsWith(".githooks/") || f.startsWith("scripts/"));
  assert.ok(owned.length >= 5, "expected the maintainer docs, the hook and the gate scripts");
  const problems = owned.flatMap((f) => machinePaths(readText(f)).map((h) => `${f}:${h}`));
  assert.deepEqual(problems, []);
});

test("the machine-path check catches what it should and allows placeholders", () => {
  assert.equal(machinePaths("cloned to `D:\\work\\clones\\` before").length, 1);
  assert.equal(machinePaths("logs in `_clones\\_logs\\x.md`").length, 1);
  assert.equal(machinePaths("home is /Users/jane/Desktop").length, 1);
  assert.equal(machinePaths("Windows `C:\\Users\\USERNAME\\.cline\\skills\\` and C:\\ProgramData\\Devin\\skills\\").length, 0);
  assert.equal(machinePaths("`%USERPROFILE%\\.gemini\\extensions\\` and ~/.claude/skills").length, 0);
});

// ---------------------------------------------------------------- 2. structure.md at stage 02
test("structure.md section 1 reads the claim from files that exist at stage 02", () => {
  const s1 = section(readText("skills/ice-film/references/structure.md"), "1. One claim");
  assert.doesNotMatch(s1, /Read the claim and the emotional change from `ice\/plan\/TREATMENT\.md`/);
  for (const f of ["ice/DIRECTION.md", "ice/plan/concepts.md", "ice/BRIEF.md"]) assert.ok(s1.includes(`\`${f}\``), `section 1 names ${f}`);
  assert.match(s1, /structure record \(section 8\)/);
  assert.match(s1, /Never create `ice\/plan\/TREATMENT\.md` at this stage/);
});

// ---------------------------------------------------------------- 3. opening render study
test("openers-and-endings.md renders the opening studies at 07, not 03", () => {
  const s3 = section(readText("skills/ice-film/references/openers-and-endings.md"), "3. Three provisional openings");
  const at03 = s3.slice(s3.indexOf("At stage 03"), s3.indexOf("At stage 07"));
  const at07 = s3.slice(s3.indexOf("At stage 07"));
  assert.ok(at03.length > 0 && at07.length > 0, "both passes are present, 03 before 07");
  assert.doesNotMatch(at03, /\brender (only|their)/i);
  assert.match(at03, /Render nothing at 03/);
  assert.match(at07, /first 2-4 s/);
  assert.match(at07, /`ice-engines\/SKILL\.md`/);
  assert.match(s3, /Render study: <pending \(07\)/, "the hook sheet template carries the render study line");
  const row07 = readText("skills/ice-film/SKILL.md").split(/\r?\n/).find((l) => l.startsWith("| 07 build |"));
  assert.match(row07, /Only if `ice\/plan\/hooks\.md` says `Render study: pending \(07\)`: `references\/openers-and-endings\.md` section 3/);
});

// ---------------------------------------------------------------- 2b. SIGILL fix and the step mode clarity card
test("pedalboard is past the AVX-512 wheels and the local gate imports every pin in its own process", () => {
  const v = JSON.parse(readText("skills/ice-engines/references/versions.json")).pip.pedalboard.version.split(".").map(Number);
  assert.ok(v[0] > 0 || v[1] > 9 || v[2] >= 26, "pedalboard 0.9.25 Linux wheels die with SIGILL without AVX-512");
  const gates = readText("scripts/gates.mjs");
  const list = gates.match(/const PYTHON_IMPORTS = \[([^\]]+)\]/);
  assert.ok(list, "scripts/gates.mjs lists the Python import names");
  for (const m of ["numpy", "pedalboard", "librosa", "cv2", "PIL"]) assert.match(list[1], new RegExp(`"${m}"`), `${m} is imported by the gate`);
  assert.match(gates, /PYTHON_IMPORTS\.filter\(\(m\) => quiet\(vpy, \["-c", `import \$\{m\}`\]\)/, "each package imports in its own process");
});

test("hosted CI is gone and the pre-push hook runs the local gates", () => {
  assert.equal(repoFiles().filter((f) => f.startsWith(".github/workflows/")).length, 0, "no GitHub Actions workflow");
  assert.match(readText(".githooks/pre-push"), /^exec node scripts\/gates\.mjs$/m);
});

test("step mode review card points to the clarity gate instead of restating it", () => {
  const card = section(readText("skills/ice-motion-director/references/step-mode.md"), "4. Review card");
  assert.match(card, /`references\/clarity-gate\.md` section 9/);
  assert.match(card, /takeaway/);
});

// ---------------------------------------------------------------- 4. requirements policy
test("every requirements.txt carries the same policy header", () => {
  const reqs = repoFiles().filter((f) => /^skills\/[^/]+\/scripts\/requirements\.txt$/.test(f));
  assert.ok(reqs.length >= 7);
  const header = (f) => readText(f).split(/\r?\n/).slice(2).filter((l) => l.startsWith("#")).slice(0, 9).join("\n");
  const first = header(reqs[0]);
  assert.match(first, /^# Policy \(the same in every skill's requirements\.txt\)/);
  assert.match(first, /never into\n# the system Python/);
  assert.match(first, /not older than the pin/);
  assert.match(first, /delivery note/);
  for (const f of reqs) assert.equal(header(f), first, `${f} has a different policy header`);
});

// ---------------------------------------------------------------- 5. mid-run redirect checklist
function redirectTable() {
  const rows = [];
  for (const line of section(readText("skills/ice-motion-director/references/state.md"), "Mid-run redirect").split(/\r?\n/)) {
    if (!/^\|.*\|\s*$/.test(line) || /^\|\s*-/.test(line)) continue;
    const cells = line.trim().slice(1, -1).split("|").map((s) => s.trim());
    if (cells[0] === "Files") continue;
    rows.push(cells);
  }
  return rows;
}

test("state.md mid-run redirect table is well formed and covers every stage", () => {
  const rows = redirectTable();
  assert.ok(rows.length >= 15);
  const covered = new Set();
  for (const [files, stage, route, when, check] of [...rows]) {
    assert.ok(files && check, "every row names files and a check");
    assert.ok(STAGES.includes(stage) || stage === "any", `stage "${stage}"`);
    assert.ok(["all", "film"].includes(route), `route "${route}"`);
    const list = when === "any" ? STAGES : when.split(/\s*,\s*/);
    for (const nn of list) { assert.ok(STAGES.includes(nn), `stale-when "${nn}"`); covered.add(nn); }
  }
  assert.deepEqual([...covered].sort(), STAGES, "every stage has at least one row");
  for (const f of ["ice/plan/shot-plan.md", "ice/plan/versions.md", "ice/plan/hooks.md", "ice/plan/script.md", "ice/review/template-distance.md"]) {
    assert.ok(rows.some((r) => r[0].includes(`\`${f}\``)), `the table lists ${f}`);
  }
  // Every run file the table names is a real artifact named elsewhere in the skills, not one invented here.
  const others = repoFiles().filter((f) => f.startsWith("skills/") && f.endsWith(".md") && f !== "skills/ice-motion-director/references/state.md").map(readText).join("\n");
  for (const [files] of rows) for (const m of files.matchAll(/`(ice\/[^`]+)`/g)) {
    const name = m[1].split("<")[0];
    assert.ok(others.includes(name.replace(/\/$/, "")), `${m[1]} is not named by any skill file`);
  }
});

const work = mkdtempSync(join(tmpdir(), "ice redirect "));
after(() => rmSync(work, { recursive: true, force: true }));

test("ice-state.mjs prints the redirect checklist on a reopening only, after the unchanged Saved line", () => {
  const dir = join(work, "film project");
  const st = (...args) => spawnSync(process.execPath, [abs("skills/ice-motion-director/scripts/ice-state.mjs"), ...args, "--dir", dir], { encoding: "utf8", timeout: 60000 });
  assert.equal(st("init", "--project", "demo", "--route", "film", "--mode", "auto").status, 0);
  for (const nn of ["01", "02", "03", "04", "05", "06"]) {
    let r = st("set", nn, "in_review");
    assert.equal(r.status, 0, r.stderr);
    assert.doesNotMatch(r.stdout, /Reopened/, "a first run is not a reopening");
    r = st("set", nn, "approved", "--by", "approver");
    assert.equal(r.status, 0, r.stderr);
    assert.doesNotMatch(r.stdout, /Reopened/);
  }
  const r = st("set", "04", "in_progress", "--notes", "new world");
  assert.equal(r.status, 0, r.stderr);
  const lines = r.stdout.trimEnd().split("\n");
  assert.match(lines[0], /^Saved\. /, "the first line is unchanged");
  assert.match(lines[1], /^Reopened 04 storyboard\. Files that may be stale now/);
  const listed = lines.slice(2).join("\n");
  for (const f of ["`ice/BRIEF.md` requirements ledger", "`ice/DIRECTION.md` D-entries", "`ice/plan/script.md`", "`ice/plan/hooks.md`", "`ice/plan/cue-sheet.json`"]) assert.ok(listed.includes(f), `lists ${f}`);
  assert.ok(!listed.includes("`ice/plan/storyboard.md`"), "a row is listed only when its stale-when column holds the stage");
  assert.ok(!listed.includes("`ice/plan/concepts.md`"));
  for (const l of lines.slice(2)) assert.match(l, /^  - .+ \((stage \d\d|every stage)\): .+/);
  assert.equal(st("set", "04", "in_review").stdout.includes("Reopened"), false, "moving on from in_progress is not a reopening");
});

test("ice-state.mjs redirect checklist on another route keeps the shared rows and names the workflow's own files", () => {
  const dir = join(work, "edit project");
  const st = (...args) => spawnSync(process.execPath, [abs("skills/ice-motion-director/scripts/ice-state.mjs"), ...args, "--dir", dir], { encoding: "utf8", timeout: 60000 });
  assert.equal(st("init", "--project", "cut", "--route", "edit", "--mode", "auto").status, 0);
  st("set", "01", "in_review");
  st("set", "01", "approved", "--by", "approver");
  const r = st("set", "01", "in_progress");
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^Saved\. .*\nReopened 01 brief\./);
  assert.ok(r.stdout.includes("`ice/BRIEF.md` slots"));
  assert.ok(!r.stdout.includes("`ice/plan/"), "film plan names are not printed for another route");
  assert.match(r.stdout, /for every stage from 01 on: the files the workflow's "## Spine stages" row names/);
});
