// Every check that runs at 07, 09 or 10 also runs at its earliest stage (founder decision, 2026-10-22): the
// "Earliest stage" audit table in docs/maintainers/architecture.md names, per check, the files of that stage and a
// term each of them must contain. The identity tests and the studio benchmark each have one home that the stage
// files point to.
// Run: node --test tests/
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { abs, readText, repoFiles } from "./helpers.mjs";

const ARCH = "docs/maintainers/architecture.md";
const HEADER = "| Check | Late run (confirmation) | Earliest stage | Where it runs early | Term |";

// Rows of the audit table: { check, files, term }. A row whose files cell is "-" stays late on purpose.
function auditRows() {
  const text = readText(ARCH);
  const start = text.indexOf(HEADER);
  assert.ok(start >= 0, `${ARCH} has no "Earliest stage" audit table`);
  const rows = [];
  for (const line of text.slice(start).split(/\r?\n/).slice(2)) {
    if (!line.startsWith("|")) break;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    assert.equal(cells.length, 5, `audit row has 5 cells: ${line}`);
    const files = cells[3] === "-" ? [] : [...cells[3].matchAll(/`([^`]+)`/g)].map((m) => m[1]);
    const term = cells[4] === "-" ? null : cells[4].replace(/`/g, "");
    rows.push({ check: cells[0], files, term });
  }
  return rows;
}

test("architecture.md states the principle once: 09 should find nothing new", () => {
  const text = readText(ARCH);
  assert.equal(text.split("09 should find nothing new").length - 1, 1);
});

test("the audit table covers the late checks and keeps a reason for the ones that stay late", () => {
  const rows = auditRows();
  assert.ok(rows.length >= 20, `expected at least 20 audited checks, found ${rows.length}`);
  for (const name of ["Brand test", "Competitor swap", "Cold-viewer clarity", "Craft against real studio work", "Richness floor"]) {
    assert.ok(rows.some((r) => r.check.startsWith(name)), `audit table has a row for ${name}`);
  }
  for (const r of rows) {
    if (r.files.length === 0) assert.equal(r.term, null, `${r.check}: a row with no early files has no term`);
    else assert.ok(r.term, `${r.check}: a row with early files names a term`);
  }
});

test("every check in the audit table appears in the stage files the table names", () => {
  for (const r of auditRows()) {
    for (const f of r.files) {
      assert.ok(existsSync(abs(f)), `${r.check}: ${f} exists`);
      assert.ok(readText(f).toLowerCase().includes(r.term.toLowerCase()), `${r.check}: ${f} names "${r.term}"`);
    }
  }
});

test("the identity tests and the studio benchmark each have one home that the stage files point to", () => {
  const homes = {
    "skills/ice-qa/references/identity-tests.md": [
      "skills/ice-direction/references/pitch-round.md", "skills/ice-direction/references/roles.md",
      "skills/ice-direction/references/anti-sameness.md", "skills/ice-film/references/film-types/brand-film.md",
      "skills/ice-ideas/references/idea-craft.md", "skills/ice-qa/references/anti-sameness-gates.md",
      "skills/ice-qa/references/frame-checks.md", "skills/ice-qa/references/clarity-gate.md", "skills/ice-film/SKILL.md",
    ],
    "skills/ice-qa/references/studio-benchmark.md": [
      "skills/ice-direction/references/pitch-round.md", "skills/ice-film/SKILL.md", "skills/ice-film/references/storyboard.md",
    ],
  };
  for (const [home, pointers] of Object.entries(homes)) {
    assert.ok(existsSync(abs(home)), `${home} exists`);
    const name = home.split("/").pop();
    for (const p of pointers) assert.ok(readText(p).includes(name), `${p} points to ${name}`);
  }
  // The old logo-only wording is gone: the test is never weaker early than late.
  for (const p of homes["skills/ice-qa/references/identity-tests.md"]) {
    assert.ok(!/cover[- ]the[- ]logo/i.test(readText(p)), `${p} no longer uses the logo-only "cover the logo" test`);
  }
});

test("the approver refuses paper patches", () => {
  const roles = readText("skills/ice-direction/references/roles.md");
  assert.match(roles, /No paper patches/);
  assert.match(roles, /note, a promise/);
});

// Full capacity by default (founder decision, 2026-10-29, AGENTS.md rule 20): every video gets a craft plan, one row per
// craft dimension, drafted at 02, mapped at 04, locked at 05 and checked by craft_gate.py. One home: treatment.md
// section "Craft plan", which also holds the precedence order and the exemption rows; every other file points to it.
const TREATMENT = "skills/ice-direction/references/treatment.md";
const CRAFT_CODES = ["camera", "depth", "composite", "light", "finish", "type", "transition", "data", "cutout", "sfx", "music",
  "ambience", "foley", "silence", "voice", "rhythm", "footage", "identity"];
const BANNED_REASONS = ["not asked", "not requested", "user did not ask", "not in the brief", "keep it simple", "to save time", "not needed"];

function craftSection() {
  const text = readText(TREATMENT);
  const start = text.indexOf("\n## 11. Craft plan\n");
  assert.ok(start >= 0, `${TREATMENT} has no "## 11. Craft plan" section`);
  const next = text.indexOf("\n## ", start + 5);
  return next < 0 ? text.slice(start) : text.slice(start, next);
}

// Rows of a workflow's "## Spine stages" table, keyed by their two-digit stage number.
function spineRows(skill) {
  const text = readText(`skills/${skill}/SKILL.md`);
  const start = text.indexOf("\n## Spine stages");
  assert.ok(start >= 0, `skills/${skill}/SKILL.md has no "## Spine stages" section`);
  const next = text.indexOf("\n## ", start + 5);
  const rows = {};
  for (const line of text.slice(start, next < 0 ? undefined : next).split(/\r?\n/)) {
    const m = /^\| (\d\d) [^|]*\|/.exec(line);
    if (m) rows[m[1]] = line;
  }
  return rows;
}

test("craft plan: treatment.md is its one home, with all 18 codes, the run file, the banned reasons and the defaults", () => {
  const s = craftSection();
  for (const code of CRAFT_CODES) assert.match(s, new RegExp(`^\\| \`${code}\` \\| `, "m"), `the dimensions table has a row for ${code}`);
  const codes = [...s.slice(s.indexOf("### 11.1"), s.indexOf("### 11.2")).matchAll(/^\| `([a-z]+)` \| /gm)].map((m) => m[1]);
  assert.deepEqual(codes, CRAFT_CODES, "the closed list holds exactly the 18 codes, in the contract's order");
  for (const h of ["### 11.1 Craft dimensions", "### 11.2 The run file `ice/plan/craft-plan.json`", "### 11.3 Decision rules",
    "### 11.4 When: drafted, mapped, locked and checked per route", "### 11.5 Defaults per video type", "### 11.6 Content triggers",
    "### 11.7 Precedence and exemptions", "### 11.8 Checks", "### 11.9 Plain words to the user"]) assert.ok(s.includes(h), `missing "${h}"`);
  for (const key of ['"style_needs"', '"style_never"', '"decision": "use | not_use | scoped"', '"where"', '"evidence"', '"exemptions"',
    '"lifts"', '"tolerance": 0.10']) assert.ok(s.includes(key), `the run file schema names ${key}`);
  const rules = s.slice(s.indexOf("### 11.3"), s.indexOf("### 11.4"));
  for (const reason of BANNED_REASONS) assert.ok(rules.includes(`"${reason}"`), `the banned reasons list "${reason}"`);
  assert.match(rules, /an empty string/);
  assert.match(rules, /`style_needs` is `use` or `scoped`, never `not_use`/);
  assert.match(rules, /starts with "content conflict:"/);
  // The defaults table has one row per code and a cell for every type group plus the owner column.
  const defaults = s.slice(s.indexOf("### 11.5"), s.indexOf("### 11.6"));
  for (const code of CRAFT_CODES) {
    const row = defaults.split(/\r?\n/).find((l) => l.startsWith(`| ${code} |`));
    assert.ok(row, `the defaults table has a row for ${code}`);
    assert.equal(row.split("|").slice(1, -1).length, 11, `${code}: nine type groups, the remake and the owner of the numbers`);
  }
  // Weak-agent-proof (rule 3): triggers are kinds of content, and every route has its draft, mapping and lock.
  assert.match(s.slice(s.indexOf("### 11.6"), s.indexOf("### 11.7")), /\| Kind of content \| Dimension and device family it switches on \|/);
  for (const route of ["ice-film", "ice-explainer", "ice-remake", "ice-edit", "ice-ideas", "ice-lottie"]) {
    assert.match(s, new RegExp(`^\\| \`${route}\` \\| `, "m"), `the per-route table has ${route}`);
  }
  // The old "Systems needed" list folded into the plan's devices; content additions are proposed, craft is the director's job.
  const text = readText(TREATMENT);
  assert.ok(!text.includes("## Systems needed"), "the template no longer has a Systems needed item");
  assert.match(text, /## Craft plan\n<in plain words/);
  assert.match(text, /Content additions the request did not call for \(scenes, narration, claims, on-screen copy\) are proposed before they are added\. Craft that serves the approved content/);
  assert.doesNotMatch(text, /Do not add scenes, narration, music, captions or transitions/);
});

test("craft plan: the precedence and exemptions subsection holds the order, the row schema, the rule ids and the never-lifted list", () => {
  const s = craftSection();
  const p = s.slice(s.indexOf("### 11.7"), s.indexOf("### 11.8"));
  const levels = [...p.matchAll(/^\| (\d) \| /gm)].map((m) => Number(m[1]));
  assert.deepEqual(levels, [1, 2, 3, 4, 5, 6, 7], "seven precedence levels");
  assert.match(p, /\| 1 \| Hard rules: .*lesson L5.*\| Never overridden \|/);
  assert.match(p, /\| 7 \| Taste defaults .*Apply only when nothing above asks for the device \|/);
  assert.match(p, /A lift is recorded, never argued/);
  for (const id of ["`lint:C1` to `lint:C7`", "`lint:P1`", "`lint:T1`", "`lint:depth_layers`", "`story:filler_reason`", "`film:blue_purple_share`",
    "`art:tones`", "`look:G2`", "`seam:zero-overlap`", "`plan:coverage`", "`contract:fade`", "`slop:<item number or N id>`", "`frame:<row id>`"]) {
    assert.ok(p.includes(id), `the rule-id namespace names ${id}`);
  }
  // The allowed kinds per rule id, the stage 07 rule, "all" as a string and the four measured ids (0.2.5 review, R2 and R3).
  for (const id of ["`art:texture`", "`art:shadow`", "`film:element_events_per_min`", "`film:longest_bare_talk_s`"]) {
    assert.ok(p.includes(id), `the rule-id namespace names ${id}`);
  }
  assert.match(p, /^\| Rule ids \| Kinds that may lift them \|$/m);
  assert.match(p, /^\| `film:hero_share`.*`art:texture`, `art:shadow`.*every `story:<n>` \| `user`, `reference`, `style`; never `content`/m);
  assert.match(p, /^\| `film:blue_purple_share` \| `user`, `reference`, `style`, `content` \(the subject's real colours, logged\) \|$/m);
  assert.match(p, /^\| `lint:T1` \| `user`, `reference`, `style`, `content` \(only the product's own input shown as it really works\); Arabic letters growing one by one never \|$/m);
  assert.match(p, /^\| `frame:flash` \| `user` only \(the faithful strobe\) \|$/m);
  assert.doesNotMatch(p, /`lint:T1` is lifted only by a `style` or `reference` row/, "the old T1 sentence disagreed with the table");
  assert.match(p, /\*\*Stage 07 rows\.\*\* A row written at 07 comes only from `user`, `reference` or `style`\. A `content` row is written by 05 at the latest/);
  assert.match(p, /\*\*Ignored rows\.\*\* A row with no `source\.kind` among the four, an empty `source\.ref`, or a kind the allowed-kinds table does not allow for one of its ids is ignored for that id, and the gate prints a warning/);
  assert.match(p, /or the string `"all"`/);
  const runFile = s.slice(s.indexOf("### 11.2"), s.indexOf("### 11.3"));
  assert.match(runFile, /The `camera` row may carry `idle_max_s`.*a text or card box appearing or leaving resets the run\..*else from the reference's measured value when there is one, else 5 s for speaker edits; it never reads the limit from the free-text `amount`/);
  assert.match(p, /`amount\.value` x \(1 \+ tolerance\)/);
  assert.match(p, /`exempt <rule id> by <row id> \(<source\.kind>: <source\.ref>\)`/);
  assert.match(p, /\*\*Never lifted\.\*\* Truth and claims; rights; privacy; safety and the real-people limits; accessibility \(contrast floors, the flash safe mode, which only the user's own words lift for the faithful strobe[^)]*\); Arabic shaping and bidi; legibility floors; required labels; lesson L5/);
  for (const reader of ["`load_craft_plan(start)`", "`exemption_for(plan, rule_id, t, shot, value)`", "`loadCraftPlan(start)`",
    "`exemptionFor(plan, ruleId, { t, shot, value })`", "`scripts/storyboard_lint.py`", "`scripts/_cdp.mjs`", "`scripts/craft_gate.py`"]) {
    assert.ok(p.includes(reader), `the readers and the gate are named: ${reader}`);
  }
  assert.match(p, /`\[data-broadcast\]` and `--broadcast-measured` stay as aliases of a row/);
  // One home: no other skill file opens a section on the craft plan.
  const homes = repoFiles().filter((f) => f.startsWith("skills/") && f.endsWith(".md") && f !== TREATMENT)
    .filter((f) => /^#{1,6} .*\bcraft plan\b/im.test(readText(f)));
  assert.deepEqual(homes, [], "the craft plan has one home");
});

test("craft plan: AGENTS.md rule 20 points to its home and the gate", () => {
  const agents = readText("AGENTS.md");
  const rule = agents.split(/\r?\n/).find((l) => l.startsWith("20. "));
  assert.ok(rule, "AGENTS.md has rule 20");
  assert.match(rule, /^20\. \*\*Full capacity by default \(founder decision, 2026-10-29\)\.\*\*/);
  assert.match(rule, /"not asked" is never a reason/);
  assert.match(rule, /Taste bans are defaults, not limits/);
  assert.match(rule, /the never-lifted rules of treatment\.md 11\.7 stay absolute/, "a pointer, not a partial list");
  assert.match(rule, /`skills\/ice-direction\/references\/treatment\.md` section "Craft plan"/);
  assert.match(rule, /`skills\/ice-qa\/scripts\/craft_gate\.py`/);
});

test("craft plan: every workflow's spine rows draft it at 02, map and check it at 04, lock it at 05 and check the build", () => {
  const problems = [];
  const opens = /`ice-direction\/references\/treatment\.md` section "Craft plan"/;
  const built = { "ice-film": ["07", "09"], "ice-explainer": ["07", "09"], "ice-remake": ["07", "09"], "ice-edit": ["07", "09"], "ice-lottie": ["07"], "ice-ideas": [] };
  for (const [skill, buildRows] of Object.entries(built)) {
    const rows = spineRows(skill);
    const draft = skill === "ice-remake" ? rows["01"] : rows["02"];
    if (!rows["02"]?.includes("`ice/plan/craft-plan.json`")) problems.push(`${skill}: row 02 does not name ice/plan/craft-plan.json`);
    if (!opens.test(draft ?? "")) problems.push(`${skill}: the drafting row does not open treatment.md section "Craft plan"`);
    if (!/`craft_gate\.py plan` passes/.test(rows["04"] ?? "")) problems.push(`${skill}: row 04 is not done until craft_gate.py plan passes`);
    if (!/the craft plan is locked/.test(rows["05"] ?? "")) problems.push(`${skill}: row 05 does not lock the craft plan`);
    for (const nn of buildRows) if (!/`craft_gate\.py build` passes/.test(rows[nn] ?? "")) problems.push(`${skill}: row ${nn} is not done until craft_gate.py build passes`);
  }
  // The remake drafts at 01 from the reference measurement.
  if (!/`ice\/plan\/craft-plan\.json` has every measured dimension/.test(spineRows("ice-remake")["01"])) problems.push("ice-remake: row 01 does not draft from the measurement");
  assert.deepEqual(problems, []);
  // The edit route opens the camera and depth files when the plan uses them, and checks the face rule on frames.
  const edit = readText("skills/ice-edit/SKILL.md");
  assert.match(edit, /When the craft plan's `camera` or `depth` row is `use`, rows 04 and 07 also open `ice-motion\/references\/camera\.md` and `depth-and-3d\.md`/);
  assert.match(edit, /- Never cover the face or hands \(checked on frames by `craft_gate\.py build`\)/);
});

test("craft plan: the router, the run-state schema, the route contracts and the decision log carry it without a new stop", () => {
  const router = readText("skills/ice-motion-director/SKILL.md");
  assert.match(router, /Full capacity by default: .*`ice\/plan\/craft-plan\.json`.*no new stop; step mode shows it on the 02 and 05 review cards/);
  const state = readText("skills/ice-motion-director/references/state.md");
  assert.match(state, /Canonical names: `concepts\.md`, `craft-plan\.json`/);
  assert.match(state, /^\| `ice\/plan\/craft-plan\.json` \| 02 \| film \| 01, 02, 03, 04, 05 \| .*checked again at 04 .*and at 05/m);
  const routes = readText("skills/ice-motion-director/references/routes.md");
  for (const route of ["ice-film", "ice-explainer", "ice-remake", "ice-edit", "ice-lottie", "ice-ideas"]) {
    const start = routes.indexOf(`\n## ${route}\n`);
    const next = routes.indexOf("\n## ", start + 5);
    const section = routes.slice(start, next < 0 ? undefined : next);
    assert.match(section, /^\| Craft plan \| Drafted at 0[12] .*mapped at 04.*locked at 05/m, `routes.md ${route} names when its craft plan is drafted, mapped and locked`);
  }
  const decisions = readText("skills/ice-direction/references/decision-process.md");
  assert.match(decisions, /^\| Craft plan \(one row per craft dimension, and its exemption rows\) \| ice-direction: drafted at 02, mapped at 04, locked at 05/m);
  assert.match(decisions, /## Craft exemptions\n\| Row \| Lifts \| Element \| Source \| Shots \| Amount \| Reason \|/);
  assert.match(readText("skills/ice-direction/references/pitch-round.md"), /This names the concept's signature for the pitch, not the film's craft: the craft plan holds every dimension/);
  assert.match(readText("skills/ice-explainer/references/semantic-tagging.md"), /This tag set stays the explainer's\..*treatment\.md` section "Craft plan"/);
  const qa = readText("skills/ice-qa/SKILL.md");
  assert.match(qa, /9\. \*\*Precedence and exemptions\.\*\*.*`references\/treatment\.md` section "Craft plan", "Precedence and exemptions"/);
  assert.match(qa, /the kinds allowed per id and the never-lifted rules: the `ice-direction` skill/, "item 9 points to 11.7 instead of restating the list");
  assert.match(qa, /^\| A2\. Craft plan \| 04 to 06 .*`scripts\/craft_gate\.py plan`/m);
  assert.match(qa, /^\| D2\. Craft build \| 07 and 09 .*`scripts\/craft_gate\.py build`/m);
  const release = qa.slice(qa.indexOf("## Hard release gates"), qa.indexOf("## Scope by film type"));
  for (const item of ["a craft plan or craft build check failed or never ran", "a face covered by text", "flashes over the safe mode",
    "`qc.py --audit`", "`quick-checks.mjs loudness --profile`"]) assert.ok(release.includes(item), `the hard release gates name ${item}`);
});

test("craft plan: critics ask the capacity question and judge recorded devices by their rows", () => {
  const prompts = readText("skills/ice-qa/references/critic-prompts.md");
  const block = (heading) => {
    const start = prompts.indexOf(heading);
    assert.ok(start >= 0, `missing ${heading}`);
    const next = prompts.indexOf("\n## ", start + 5);
    return prompts.slice(start, next < 0 ? undefined : next);
  };
  assert.match(prompts, /"what did the content, the reference or the chosen style call for that this film does not do\?"/);
  for (const h of ["## Full-film critic", "## Stage critic", "## Storyboard critic", "## Remake critic"]) {
    const b = block(h);
    assert.ok(b.includes("ice/plan/craft-plan.json"), `${h} reads the craft plan`);
    assert.match(b, /call for that (this film|ours|this artifact|the board) does not (do|plan)/, `${h} asks the capacity question`);
  }
  assert.match(block("## Full-film critic"), /recorded, on its shots and within its amount, it passes/);
});

test("edit parity: every edit gets an independent critic, a clarity read sized to the job, the studio benchmark and the brand test with an identity", () => {
  const routes = readText("skills/ice-motion-director/references/routes.md");
  const edit = routes.slice(routes.indexOf("\n## ice-edit\n"), routes.indexOf("\n## ice-lottie\n"));
  assert.match(edit, /an independent critic at 09 that never ran in the builder's session/);
  assert.match(edit, /clarity read 3 on every edit type, sized to the job/);
  assert.match(edit, /whenever the edit carries an identity .*whether or not it sells/);
  assert.match(edit, /the studio benchmark at 05 on two graded stills with the overlays/);
  assert.doesNotMatch(edit, /no studio benchmark|sell or promote/);
  assert.match(readText("skills/ice-qa/references/clarity-gate.md"), /^\| `ice-edit` \| Read 3 on every edit type, sized to the job \(section 7\)/m);
  const bench = readText("skills/ice-qa/references/studio-benchmark.md");
  assert.match(bench, /^\| `ice-edit` \| At 05, on two graded stills of the footage with the planned overlays and captions/m);
  assert.match(bench, /^\| `ice-lottie` \| Not run/m);
  const id = readText("skills/ice-qa/references/identity-tests.md");
  assert.match(id, /`ice-edit` runs them whenever the edit carries an identity/);
  assert.doesNotMatch(id, /`ice-edit` runs 09 for edit types that sell or promote/);
  const rows = spineRows("ice-edit");
  assert.match(rows["05"], /`ice-qa\/references\/studio-benchmark\.md`/);
  assert.match(rows["09"], /an independent critic, never the builder's session/);
  assert.match(rows["09"], /clarity read 3 passed, sized to the job/);
});

test("architecture.md maps the craft plan to its earliest stage and lists its run file", () => {
  const row = auditRows().find((r) => r.check.startsWith("Craft plan"));
  assert.ok(row, "the audit table has a Craft plan row");
  assert.equal(row.term, "craft plan");
  assert.ok(row.files.includes(TREATMENT) && row.files.includes("skills/ice-qa/SKILL.md"), "the row names the home and the gate file");
  const arch = readText(ARCH);
  assert.match(arch, /\| Craft plan \(every craft the content, the reference and the style call for, rule 20\) \| 09: `craft_gate\.py build` \| 02 draft; 04 `craft_gate\.py plan`/);
  assert.match(arch, /^\| `ice\/plan\/craft-plan\.json` \| `ice-direction` /m);
  assert.match(arch, /The per-type craft defaults .* are summarized in `skills\/ice-direction\/references\/treatment\.md` section "Craft plan"/);
});
