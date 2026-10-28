// Faces and voices of real people (founder decision, 2026-10-22): the repo never asks for a person's permission; the
// user carries the rights. `ice-assets` `references/ai-media-policy.md` section 9 owns the rule: no question, one
// neutral rights line, two limits that hold whatever the request says. Zero dependencies. Run: node --test tests/
import assert from "node:assert/strict";
import { test } from "node:test";
import { readText, repoFiles } from "./helpers.mjs";

const POLICY = "skills/ice-assets/references/ai-media-policy.md";
const section9 = () => {
  const text = readText(POLICY);
  const start = text.indexOf("\n## 9. ");
  assert.ok(start >= 0, "section 9 not found");
  const end = text.indexOf("\n## ", start + 4);
  return text.slice(start, end < 0 ? undefined : end);
};

test("section 9 asks no permission question and records one neutral line", () => {
  const s = section9();
  assert.match(s, /never asks whether the user has a person's permission/);
  assert.match(s, /Permissions and rights for every real person shown or voiced are the user's responsibility\./);
  assert.doesNotMatch(s, /\?"/, "no quoted question to the user");
  assert.doesNotMatch(s, /Do you have|No answer is not consent|consent:/i);
});

test("section 9 keeps the two limits and asks for no label", () => {
  const s = section9();
  assert.match(s, /Sexual or demeaning content with a real person's likeness/);
  assert.match(s, /meant to make viewers believe a real person said or did something they did not/);
  assert.match(s, /clearly labelled parody or illustration is fine/);
  assert.doesNotMatch(s, /made with AI|platform requires|watermark|Labelling/i, "platform labels are the user's business at upload");
});

// Files owned by this rule's change. ice-remake, ice-edit/SKILL.md and the router are maintained with their own tests.
const OWNED = /^skills\/ice-(arabic|assets|audio|direction|edit\/references|engines|explainer|film|qa|ideas|styles|lottie|motion|type)\//;
const ASKS_CONSENT = [
  /\bwho has not consented\b/i,
  /\bwithout (their|the (person's|owner's|speaker's|voice owner's)) consent\b/i,
  /\bwith (the )?(documented )?consent of\b/i,
  /\b(speaker's|owner's|guardian's|people's) consent\b/i,
  /\bconsent of the people\b/i,
  /\bclone consent\b/i,
  /\bpermission to use (their|his|her) (face|voice|likeness)\b/i,
  /\bsigned release\b/i,
];

test("no owned file still asks for a person's consent", () => {
  const hits = [];
  for (const f of repoFiles()) {
    if (!OWNED.test(f) || /THIRD_PARTY|LICENSE|NOTICE|\/noncommercial\//.test(f) || !/\.(md|mjs|py|json)$/.test(f)) continue;
    const text = readText(f);
    for (const re of ASKS_CONSENT) if (re.test(text)) hits.push(`${f}: ${re}`);
  }
  assert.deepEqual(hits, []);
});

// Outside items (founder decision, 2026-10-28): rights are the user's; sourcing-and-licenses.md section 0 owns the rule:
// no question, one record with a license status, a "Needs a license before publishing" list, never a block.
const SOURCING = "skills/ice-assets/references/sourcing-and-licenses.md";
test("outside items: one record with a license status, never a block", () => {
  const text = readText(SOURCING);
  const s0 = text.slice(text.indexOf("\n## 0. "), text.indexOf("\n## 1. "));
  assert.match(s0, /Rights to use every outside item are the user's responsibility\./);
  assert.match(s0, /`licensed`.*`unknown`.*`needs purchase`/s);
  assert.match(s0, /Needs a license before publishing/);
  assert.match(s0, /never refused, swapped or downgraded/);
  assert.doesNotMatch(text, /never shipped|any unknown means do not ship|Never ship unlicensed/i);
  for (const f of ["skills/ice-remake/references/rights-and-modes.md", "skills/ice-remake/references/style-recipe.md",
                   "skills/ice-motion-director/SKILL.md", "skills/ice-audio/SKILL.md", "README.md"]) {
    assert.doesNotMatch(readText(f), /never (enter|go into) the deliverable|recreated, never placed|never unknown|The two limits/i, f);
  }
});
