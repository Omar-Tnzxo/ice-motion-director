// Every check that runs at 07, 09 or 10 also runs at its earliest stage (founder decision, 2026-10-22): the
// "Earliest stage" audit table in docs/maintainers/architecture.md names, per check, the files of that stage and a
// term each of them must contain. The identity tests and the studio benchmark each have one home that the stage
// files point to.
// Run: node --test tests/
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { abs, readText } from "./helpers.mjs";

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
