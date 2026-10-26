// The cold-viewer clarity gate (AGENTS.md rule 13) is wired into the spine: one canonical file, the stage tables,
// the approver's checklist, the review rubric and the concept stage all name it, and the SKILL.md size limits hold.
// Run: node --test tests/
import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import { test } from "node:test";
import { abs, readText, repoFiles } from "./helpers.mjs";

const GATE = "skills/ice-qa/references/clarity-gate.md";
const GATE_NAME = "clarity-gate.md";

// Rows of a workflow's "## Spine stages" table, keyed by their two-digit stage number.
function spineRows(skill) {
  const text = readText(`skills/${skill}/SKILL.md`);
  const start = text.indexOf("\n## Spine stages");
  assert.ok(start >= 0, `skills/${skill}/SKILL.md has no "## Spine stages" section`);
  const next = text.indexOf("\n## ", start + 5);
  const section = text.slice(start, next < 0 ? undefined : next);
  const rows = {};
  for (const line of section.split(/\r?\n/)) {
    const m = /^\| (\d\d) [^|]*\|/.exec(line);
    if (m) rows[m[1]] = line;
  }
  return rows;
}

// The text of one "## <n>." or "### <title>" section of a Markdown file.
function sectionOf(text, heading) {
  const start = text.indexOf(heading);
  assert.ok(start >= 0, `missing heading ${heading}`);
  const level = heading.match(/^\n?(#+)/)[1];
  const rest = text.slice(start + heading.length);
  const end = rest.search(new RegExp(`\\n#{1,${level.length}} `));
  return heading + (end < 0 ? rest : rest.slice(0, end));
}

test("the gate has one home that holds every part of the rule", () => {
  assert.ok(existsSync(abs(GATE)), `${GATE} is missing`);
  const text = readText(GATE);
  for (const h of ["## 1. Where it runs", "## 2. The takeaway", "## 3. The viewer's packet", "## 4. The viewer's report",
    "## 5. The match and the pass rule", "## 6. The grounding rule", "## 7. Size of the job", "## 8. On a fail",
    "## 9. Hosts without sub-agents, and step mode"]) assert.ok(text.includes(h), `${GATE}: missing "${h}"`);
  for (const must of ["Read 1", "Read 2", "Read 3", "Offer's job", "One-line idea", "Literal anchors", "PASS", "FAIL",
    "Literal before abstract", "visible source", "as they really happen", "Micro", "auto mode", "Never in the packet"]) {
    assert.ok(text.includes(must), `${GATE}: missing "${must}"`);
  }
  // Weak-agent-proof (AGENTS.md rule 3): the gate never cites the case that prompted it as an example.
  assert.doesNotMatch(text, /spotify|street/i, `${GATE} cites a concrete case a weak agent would copy`);
});

test("the stage tables name the gate", () => {
  const problems = [];
  const want = { "ice-film": ["02", "04", "05", "06", "09"], "ice-explainer": ["02", "05", "06", "09"], "ice-ideas": ["02", "09"],
    "ice-remake": ["02", "04", "05", "06", "09"], "ice-edit": ["02", "09"] };
  for (const [skill, stages] of Object.entries(want)) {
    const rows = spineRows(skill);
    for (const nn of stages) {
      if (!rows[nn]) problems.push(`${skill}: no row ${nn}`);
      else if (!/clarity/i.test(rows[nn])) problems.push(`${skill}: row ${nn} does not name the clarity gate`);
    }
    // Row 02 is where the target is written: it must open the gate file.
    if (rows["02"] && !rows["02"].includes(GATE_NAME)) problems.push(`${skill}: row 02 does not open ${GATE_NAME}`);
  }
  const film = spineRows("ice-film");
  for (const nn of ["04", "05", "06", "09"]) if (film[nn] && !film[nn].includes(GATE_NAME)) problems.push(`ice-film: row ${nn} does not open ${GATE_NAME}`);
  // ice-edit runs read 3 only (clarity-gate.md section 1): its 09 row opens the gate, no earlier row runs a read.
  const edit = spineRows("ice-edit");
  if (edit["09"] && !edit["09"].includes(GATE_NAME)) problems.push(`ice-edit: row 09 does not open ${GATE_NAME}`);
  for (const nn of ["04", "05", "06", "07"]) if (edit[nn] && /clarity read/i.test(edit[nn])) problems.push(`ice-edit: row ${nn} runs a read the gate does not give edits`);
  for (const skill of ["ice-remake", "ice-edit"]) {
    const stops = readText(`skills/${skill}/SKILL.md`).split(/\r?\n/).find((l) => l.startsWith("**Stops and approvals.**")) ?? "";
    if (!stops.includes(`ice-qa/references/${GATE_NAME}`)) problems.push(`${skill}: "Stops and approvals" does not point to ${GATE_NAME}`);
  }
  assert.deepEqual(problems, []);
});

test("the router, the route contracts and the stage commands carry the gate", () => {
  assert.match(readText("skills/ice-motion-director/SKILL.md"), /ice-qa\/references\/clarity-gate\.md/);
  const routes = readText("skills/ice-motion-director/references/routes.md");
  for (const route of ["ice-film", "ice-explainer", "ice-remake", "ice-edit"]) {
    assert.match(sectionOf(routes, `\n## ${route}\n`), /clarity/i, `routes.md section ${route} does not name the clarity reads`);
  }
  for (const cmd of ["ice-02-concept", "ice-04-storyboard", "ice-05-look", "ice-06-animatic", "ice-09-review"]) {
    assert.match(readText(`skills/${cmd}/SKILL.md`), /first-time viewer/, `${cmd} does not say what the stage owes a first-time viewer`);
  }
});

test("the approver's checklists include the clarity match", () => {
  const roles = readText("skills/ice-direction/references/roles.md");
  const approver = sectionOf(roles, "\n## 5. Approver");
  assert.match(approver, /Clarity match/, "roles.md section 5 has no clarity match");
  assert.match(approver, /hard rule \([^)]*cold-viewer clarity[^)]*\)/, "a clarity FAIL must sit in the never-passed list");
  assert.match(approver, /takeaway/, "the decision check must ask for the concept's takeaway");
  assert.ok(approver.includes(GATE_NAME), "roles.md section 5 must point to the gate file");
  const critic = sectionOf(roles, "\n## 3. Critic");
  assert.match(critic, /Grounded/, "the concept critic must judge grounding");
  for (const f of ["skills/ice-film/references/film-setup.md", "skills/ice-explainer/references/roles.md"]) {
    assert.match(readText(f), /Never shrinks with the crew:[^\n]*clarity reads/, `${f}: the clarity reads must never shrink with the crew`);
  }
});

test("the review rubric and the release gates include the gate", () => {
  const loop = readText("skills/ice-qa/references/critic-loop.md");
  assert.match(loop, /^\| Cold viewer \(clarity gate\) \|/m, "critic-loop.md roles table has no cold viewer");
  assert.match(loop, /^\| Cold viewer \|/m, "critic-loop.md round types table has no cold viewer round");
  assert.match(readText("skills/ice-qa/references/critic-prompts.md"), /^## Cold-viewer critic/m, "no cold-viewer prompt");
  const qa = readText("skills/ice-qa/SKILL.md");
  assert.match(sectionOf(qa, "\n## Hard release gates"), /clarity FAIL/, "ice-qa hard release gates miss the clarity FAIL");
  assert.match(sectionOf(qa, "\n## Gate pipeline"), /clarity-gate\.md/, "the gate pipeline does not name the gate file");
  assert.match(sectionOf(qa, "\n## Files"), /`references\/clarity-gate\.md`/, "ice-qa Files table does not list the gate file");
  assert.match(readText("skills/ice-qa/references/delivery-report.md"), /^\| Cold-viewer clarity \|/m, "the delivery report has no clarity row");
  assert.match(readText("skills/ice-qa/references/delivery-checks.md"), /clarity FAIL/, "delivery-checks.md hard gates miss the clarity FAIL");
});

test("the concept stage writes the target and logs every read", () => {
  const pitch = readText("skills/ice-direction/references/pitch-round.md");
  assert.match(pitch, /viewer takeaway/, "pitch-round.md must ask for the viewer takeaway");
  assert.match(pitch, /\*\*Grounded\*\*/, "pitch-round.md concept tests miss the grounding test");
  assert.match(pitch, /\*\*Product job\*\*/, "pitch-round.md concept tests miss the product job test");
  const decision = readText("skills/ice-direction/references/decision-process.md");
  assert.match(decision, /^Gates: .*clarity/m, "the DIRECTION.md summary Gates line must log the clarity reads");
  // Pilot note: the template invited the director to approve its own entries.
  assert.doesNotMatch(decision, /Approved by: <user \(quote\) \| approver agent>/, "the entry template still offers 'approver agent' to the director");
  assert.match(decision, /Approved by: \(left empty by the director\)/);
});

test("product job rule, app-brand tie-breaker and app ad adaptations", () => {
  const setup = readText("skills/ice-film/references/film-setup.md");
  assert.match(setup, /\*\*Product job\*\*/, "film-setup.md has no product job rule");
  assert.match(setup, /\*\*Brand film or app ad, for an app brand\.\*\*/, "film-setup.md has no brand film versus app ad tie-breaker");
  assert.match(setup, /cannot name what the product does/, "the tie-breaker must use the cold viewer's answer");
  const app = readText("skills/ice-film/references/film-types/app-ad.md");
  assert.match(app, /unofficial concept[^\n]*no store badge/i, "app-ad.md must name the unofficial-concept CTA exception");
  assert.match(app, /length the brief asks/, "app-ad.md cut lengths must follow the asked length");
  assert.match(app, /never rules this type out/, "missing login access must not rule the app ad out");
  assert.match(readText("skills/ice-film/references/film-types/brand-film.md"), /Product job/, "brand-film.md must point to the product job rule");
});

test("stage 01 names the brand film and the code score for music-led films", () => {
  const row = spineRows("ice-film")["01"];
  assert.match(row, /brand film by default/, "row 01 must say what a music-led brand film does at 01");
  assert.match(row, /code score gets its tempo at 05 and is composed at 08a/, "row 01 must place a code score at 05 and 08a");
});

test("the grounding rule has one home; every other mention points to it", () => {
  const problems = [];
  for (const f of repoFiles().filter((x) => x.startsWith("skills/") && x.endsWith(".md") && x !== GATE)) {
    readText(f).split(/\r?\n/).forEach((line, i) => {
      if (/^#+ .*grounding rule/i.test(line)) problems.push(`${f}:${i + 1}: a second home for the grounding rule`);
      else if (/grounding rule/i.test(line) && !line.includes(GATE_NAME)) problems.push(`${f}:${i + 1}: mentions the grounding rule without pointing to ${GATE_NAME}`);
    });
  }
  assert.deepEqual(problems, []);
});

// AGENTS.md size limits plus the brief for this gate: the SKILL.md files it touches stay under 20 KB, with the detail in
// references. 20 KB leaves room under the 24,000-byte Antigravity cut-off that repo.test.mjs enforces for every skill.
const MAX_GATE_SKILL = 20 * 1024;
test(`SKILL.md files that carry the gate stay under ${MAX_GATE_SKILL} bytes`, () => {
  const problems = ["ice-motion-director", "ice-film", "ice-explainer", "ice-ideas", "ice-direction", "ice-qa", "ice-remake", "ice-edit"]
    .map((s) => [`skills/${s}/SKILL.md`, statSync(abs(`skills/${s}/SKILL.md`)).size])
    .filter(([, size]) => size >= MAX_GATE_SKILL)
    .map(([f, size]) => `${f}: ${size} bytes`);
  assert.deepEqual(problems, []);
});

test("AGENTS.md carries the founder's rule line", () => {
  assert.match(readText("AGENTS.md"), /^\d+\. \*\*Cold-viewer clarity \(founder decision, 2026-10-21\)\.\*\*.*clarity-gate\.md/m);
  const arch = readText("docs/maintainers/architecture.md");
  assert.match(arch, /\*\*Cold-viewer clarity gate\*\*/, "architecture.md must describe the gate in the spine section");
  assert.doesNotMatch(arch, /[A-Za-z]:[\\/](?:Users|Tnzxo|Program)|\/Users\/|\/home\//, "architecture.md holds an absolute machine path");
});
