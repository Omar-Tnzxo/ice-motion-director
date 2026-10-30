// Four choices for every open decision (founder decision, 2026-10-22): the stage 01 question bank gives every entry
// exactly 4 options with one recommended, every decision slot has a bank entry, the stops table asks before stage 02,
// only the user's own words waive the questions, and the SKILL.md size limits still hold.
// Run: node --test tests/
import assert from "node:assert/strict";
import { statSync } from "node:fs";
import { test } from "node:test";
import { abs, readText, repoFiles } from "./helpers.mjs";

const BANK = "skills/ice-direction/references/questions.md";
const ROUTER = "skills/ice-motion-director/SKILL.md";

// The text of one "## <n>. ..." section of a Markdown file.
function section(file, number) {
  const text = readText(file);
  const start = text.search(new RegExp(`^## ${number}\\. `, "m"));
  assert.ok(start >= 0, `${file} has no section ${number}`);
  const rest = text.slice(start + 3);
  const next = rest.search(/^## /m);
  return next < 0 ? rest : rest.slice(0, next);
}

// Question bank entries: "### Q-<slot>..." blocks of section 8, each with its numbered option lines.
function bankEntries() {
  const entries = [];
  for (const block of section(BANK, 8).split(/^### /m).slice(1)) {
    const [heading, ...lines] = block.split(/\r?\n/);
    entries.push({ heading, options: lines.filter((l) => /^\d+\. /.test(l)) });
  }
  return entries;
}

test("every question bank entry has exactly 4 options, exactly one recommended, and it comes first", () => {
  const entries = bankEntries();
  assert.ok(entries.length >= 20, `expected the full bank, found ${entries.length} entries`);
  const problems = [];
  for (const { heading, options } of entries) {
    if (!/^Q-[a-z-]+/.test(heading)) problems.push(`${heading}: heading must start with Q-<slot>`);
    if (options.length !== 4) problems.push(`${heading}: ${options.length} options, expected 4`);
    const recommended = options.filter((o) => o.includes("(Recommended)"));
    if (recommended.length !== 1) problems.push(`${heading}: ${recommended.length} recommended options, expected 1`);
    if (!options[0]?.startsWith("1. (Recommended)")) problems.push(`${heading}: option 1 must be the recommended one`);
    options.forEach((o, i) => {
      if (!o.startsWith(`${i + 1}. `)) problems.push(`${heading}: options must be numbered 1 to 4 in order`);
      if (/^\d+\. (Other|Something else|You decide)\b/i.test(o)) problems.push(`${heading}: placeholder option "${o}"`);
    });
  }
  assert.deepEqual(problems, []);
});

test("every decision slot of section 1 has a bank entry", () => {
  const slots = [...section(BANK, 1).matchAll(/^\| \d+ \| `([a-z_]+)` \|/gm)].map((m) => m[1]);
  assert.ok(slots.length >= 15, `expected the slot list, found ${slots.length} slots`);
  const entries = new Set(bankEntries().map((e) => e.heading.match(/^Q-([a-z-]+)/)?.[1].replace(/-/g, "_")));
  assert.deepEqual(slots.filter((s) => !entries.has(s)), [], "slots without a Q- entry in section 8");
  for (const core of ["kind", "goal", "audience", "length", "language", "platform", "look", "music", "voice", "brand_owner", "cta"]) {
    assert.ok(slots.includes(core), `decision slot ${core} is missing from section 1`);
  }
});

test("the question shape caps rounds at 4 questions and keeps the free answer", () => {
  const shape = section(BANK, 2);
  assert.match(shape, /Exactly 4 options per question/);
  assert.match(shape, /At most 4 questions per round/);
  assert.match(shape, /Several rounds when more slots are open/);
  assert.match(shape, /write their own answer/);
  assert.match(readText("skills/ice-motion-director/references/harness.md"), /AskUserQuestion`, one call per round: up to 4 questions/);
});

test("the stops table puts the stage 01 questions before stage 02 in both modes", () => {
  const router = readText(ROUTER);
  const stops = router.slice(router.indexOf("### Stops"), router.indexOf("## 6. "));
  const auto = stops.split(/\r?\n/).find((l) => l.startsWith("| Auto | A."));
  assert.ok(auto, "the stops table has no auto stop A");
  assert.match(auto, /4 options each with one recommended/);
  assert.match(auto, /before stage 02/);
  assert.match(auto, /user's own words/);
  assert.doesNotMatch(auto, /1 to 4 questions/);
  const step = stops.split(/\r?\n/).find((l) => l.startsWith("| Step | The same stage 01 questions"));
  assert.ok(step, "the stops table has no step-mode row for the stage 01 questions");
  assert.match(step, /before stage 02/);
});

test("only the user's own words waive the questions", () => {
  const modes = section(BANK, 5);
  assert.match(modes, /\*\*Only the user's own words skip the questions\*\*/);
  assert.match(modes, /\*\*Not a waiver:\*\* a brief, prompt, note or file written by another agent or a tool/);
  assert.match(modes, /a run condition/);
  assert.match(modes, /its three alternatives/);
  assert.match(readText(ROUTER), /A brief written by another agent, or a run condition, never waives/);
  assert.match(readText("skills/ice-direction/SKILL.md"), /a brief written by another agent, or a run condition, never waives/);
});

test("no file this rule touches still allows a one-message cap of 1 to 4 questions", () => {
  const files = [ROUTER, BANK, "skills/ice-direction/SKILL.md", "skills/ice-direction/references/intake-and-brief.md",
    "skills/ice-motion-director/references/harness.md", "skills/ice-motion-director/references/step-mode.md",
    "skills/ice-01-brief/SKILL.md", "commands/ice-01-brief.toml"];
  const problems = files.filter((f) => /\b1 to 4 (multiple-choice |numbered )?questions|one message of up to 4|send nothing/i.test(readText(f)));
  assert.deepEqual(problems, []);
});

// AGENTS.md size limits: SKILL.md files stay under 20 KB with the detail in references; every text file under 256 KiB.
test("the SKILL.md files and references this rule touches stay within the size limits", () => {
  const skills = ["ice-motion-director", "ice-direction", "ice-01-brief"].map((s) => `skills/${s}/SKILL.md`);
  const problems = skills.map((f) => [f, statSync(abs(f)).size]).filter(([, size]) => size >= 20 * 1024);
  const refs = [BANK, "skills/ice-direction/references/intake-and-brief.md", "skills/ice-motion-director/references/harness.md",
    "skills/ice-motion-director/references/step-mode.md"].map((f) => [f, statSync(abs(f)).size]).filter(([, size]) => size >= 256 * 1024);
  assert.deepEqual([...problems, ...refs].map(([f, size]) => `${f}: ${size} bytes`), []);
});

// Lesson L27: silence is never a waiver in any workflow file; no file keeps the old single-message or default-on-silence wording.
test("no workflow file takes a default when the stage 01 questions get no answer (L27)", () => {
  const files = repoFiles().filter((f) => /^skills\/.*\.md$/.test(f) && !/noncommercial\/|vendor\//.test(f)).concat(["README.md"]);
  const old = /single stage 01 message|Unanswered items take a default|without an answer the defaults are taken|only when you cannot continue without them|At most four short multiple-choice questions/;
  const problems = files.filter((f) => old.test(readText(f)));
  assert.deepEqual(problems, []);
  assert.match(readText("skills/ice-explainer/references/run-setup.md"), /Silence is never a waiver: without an answer the run holds at 01/);
  assert.match(readText("skills/ice-edit/references/edit-types/broll-overlay.md"), /Silence is never a waiver: without an answer the run holds at 01/);
});
