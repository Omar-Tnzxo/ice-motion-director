// Lessons become default rules (founder decision, 2026-10-29, AGENTS.md rule 19): every note from the founder, a
// trial or a case study is a rule in the skills with a test, never advice the user writes in a prompt.
// `docs/maintainers/lessons.md` lists each lesson; this file checks the list itself (fields, scope, every rule file and
// every test it names exist) and holds the lesson tests that have no other home. Zero dependencies. Run: node --test tests/
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { abs, readText } from "./helpers.mjs";

const LESSONS = "docs/maintainers/lessons.md";
const FIELDS = ["Note", "Trial", "Scope", "Rule", "Test"];

function lessons() {
  const text = readText(LESSONS);
  const parts = text.split(/\n(?=## L\d+\. )/).slice(1);
  return parts.map((body) => {
    const id = Number(body.match(/^## L(\d+)\. /)[1]);
    const fields = {};
    for (const name of FIELDS) {
      const m = body.match(new RegExp(`^- \\*\\*${name}:\\*\\* (.+)$`, "m"));
      fields[name] = m ? m[1].trim() : null;
    }
    return { id, body, fields };
  });
}

const section = (relPath, heading) => {
  const text = readText(relPath);
  const start = text.indexOf(heading);
  assert.ok(start >= 0, `${relPath}: "${heading}" not found`);
  const level = heading.match(/^\n?(#+) /)?.[1] ?? "##";
  const end = text.indexOf(`\n${level} `, start + heading.length);
  return text.slice(start, end < 0 ? undefined : end);
};

test("lessons: numbered in order, every entry has its five fields", () => {
  const list = lessons();
  assert.ok(list.length >= 8, "at least the eight lessons of the 2026-10-29 trials");
  list.forEach((l, i) => {
    assert.equal(l.id, i + 1, `lesson L${l.id} out of order`);
    for (const name of FIELDS) assert.ok(l.fields[name], `L${l.id}: missing **${name}:**`);
  });
});

test("lessons: scope is general or a named category", () => {
  for (const l of lessons()) {
    assert.match(l.fields.Scope, /^(general|category: \S)/, `L${l.id}: scope must start with "general" or "category: "`);
  }
});

test("lessons: every rule file named exists", () => {
  for (const l of lessons()) {
    // Repo paths only (a slash in them); a bare file name such as a run file is not a rule location.
    const paths = [...l.fields.Rule.matchAll(/`([^`\s]+\/[^`\s]+\.(?:md|mjs|py|json|txt))`/g)].map((m) => m[1]);
    assert.ok(paths.length, `L${l.id}: the rule names no file`);
    for (const p of paths) assert.ok(existsSync(abs(p)), `L${l.id}: rule file ${p} does not exist`);
  }
});

test("lessons: every test named exists with that exact title, or the entry says why there is none", () => {
  for (const l of lessons()) {
    const t = l.fields.Test;
    if (/^none: \S/.test(t)) continue;
    const refs = [...t.matchAll(/`(tests\/[\w.-]+\.test\.mjs)`: "([^"]+)"/g)];
    assert.ok(refs.length, `L${l.id}: name each test as \`tests/<file>.test.mjs\`: "<title>", or write "none: <reason>"`);
    for (const [, file, title] of refs) {
      assert.ok(existsSync(abs(file)), `L${l.id}: ${file} does not exist`);
      const src = readText(file);
      const quoted = [`test("${title}"`, `test('${title}'`, `test(\`${title}\``];
      assert.ok(quoted.some((q) => src.includes(q)), `L${l.id}: ${file} has no test titled "${title}"`);
    }
  }
});

test("lessons: AGENTS.md rule 19 points to the lessons file and this test", () => {
  const agents = readText("AGENTS.md");
  assert.match(agents, /19\. \*\*Lessons become default rules \(founder decision, 2026-10-29\)\.\*\*/);
  assert.match(agents, /docs\/maintainers\/lessons\.md/);
  assert.match(agents, /tests\/lessons\.test\.mjs/);
});

test("lessons: the README prompts stay the idea and the files", () => {
  const tryIt = section("README.md", "\n## Try it");
  const prompts = [...tryIt.matchAll(/```text\n([\s\S]*?)```/g)].map((m) => m[1]);
  assert.ok(prompts.length >= 3, "the Try it section keeps its example prompts");
  const advice = /\b(download|footage|real (music|sound|sfx)|search for|find (the )?(latest|recent|real)|install|allowed to|you may|don't use code|no code music)\b/i;
  for (const p of prompts) assert.doesNotMatch(p, advice, `a README prompt asks the user to steer what Ice does on its own: ${p.trim()}`);
});

// Lessons 3 to 8 as ice-edit applies them: the speaker stays lit, every element on its trigger, the finishing layer
// only where measured, free installs without a question, disk space first.
{
  const EDIT = "skills/ice-edit";
  const section = (text, heading) => {
    const start = text.indexOf(heading);
    assert.ok(start >= 0, `missing ${heading}`);
    const end = text.indexOf("\n## ", start + heading.length);
    return text.slice(start, end < 0 ? undefined : end);
  };

  test("edit: 'The speaker stays lit' is the last section of layers-and-isolation, scoped, with its devices", () => {
    const text = readText(`${EDIT}/references/layers-and-isolation.md`);
    const s = section(text, "\n## 5. The speaker stays lit");
    assert.equal(text.indexOf("\n## ", text.indexOf("\n## 5. The speaker stays lit") + 4), -1, "must be the last section");
    assert.match(s, /owner decision, 2026-10-29/);
    for (const scope of [/news and current-affairs reels/, /explainers with a presenter/, /talk shows/, /podcasts and interviews/]) assert.match(s, scope);
    for (const device of [/Dimming/, /silhouette/, /desaturation/, /circle or ring/, /crosshair or target marks/]) assert.match(s, device);
    assert.match(s, /never applied to the speaker, presenter, host, interviewer or guest/);
    assert.match(s, /keeps the source exposure and colour/);
    assert.match(s, /composited lit/);
    assert.match(s, /follows the role, never the screen position/);
    assert.match(s, /own words/, "a deliberate story choice the user asked for stays");
    assert.match(s, /outside this section/, "other film types are out of scope");
  });

  test("edit: the speaker-lit rule is pointed to where looks and overlays are set", () => {
    const ptr = /layers-and-isolation\.md` section 5/;
    for (const f of ["SKILL.md", "references/edit-types/podcast.md", "references/edit-types/long-form.md",
                     "references/edit-types/shorts-reels.md", "references/edit-types/talking-head-ad.md",
                     "references/broll-and-motion-broll.md", "references/ingest-and-ledger.md"]) {
      assert.match(readText(`${EDIT}/${f}`), ptr, f);
    }
    assert.match(readText(`${EDIT}/SKILL.md`), /the speaker stays lit and unmarked/);
  });

  test("edit: every element in the edit plan is tied to its transcript trigger and reason", () => {
    const broll = section(readText(`${EDIT}/references/broll-and-motion-broll.md`), "## 1. Decide per spoken line");
    assert.match(broll, /\| Trigger: word or sentence, edited time \|/);
    assert.match(broll, /owner decision, 2026-10-29/);
    assert.match(broll, /An element with no trigger in our speech and no reason is cut/);
    assert.match(broll, /"Element reasons" section of `ice-remake\/references\/notes-files\.md`/);
    assert.match(broll, /REASONS\.md/);
    assert.match(readText(`${EDIT}/references/transcript-editing.md`), /an element with no trigger is cut/);
    const skill = readText(`${EDIT}/SKILL.md`);
    assert.match(skill, /tied to the word or sentence that triggers it, with its time and reason/);
    assert.match(skill, /every row with its trigger and reason/);
    assert.match(readText(`${EDIT}/references/edit-types/broll-overlay.md`), /trigger word or sentence with its time/);
  });

  test("edit: the finishing layer is one pointer section, applied only where measured or reasoned", () => {
    const ing = readText(`${EDIT}/references/ingest-and-ledger.md`);
    const s = ing.slice(ing.indexOf("### Finishing layer"), ing.indexOf("\n## 6."));
    assert.match(s, /owner decision, 2026-10-29/);
    assert.match(s, /`ice-remake\/references\/measuring\.md`, section "Finishing layer"/);
    assert.match(s, /`ice-motion\/references\/motion-blur-and-clock\.md`, section "Finishing layer"/);
    assert.match(s, /never on everything/);
    assert.match(readText(`${EDIT}/SKILL.md`), /finishing effects only where measured or reasoned/);
  });

  test("edit: free tools and models install without a question; paid or account-bound services stay a question", () => {
    const ing = readText(`${EDIT}/references/ingest-and-ledger.md`);
    const s6 = section(ing, "\n## 6. Tools, installs and disk space");
    assert.match(s6, /Free tools and models install without a question \(owner decision, 2026-10-29\)/);
    for (const t of [/Whisper/, /demucs/, /speaker separation model/]) assert.match(s6, t);
    assert.match(s6, /recorded in `ice\/DIRECTION\.md` and the delivery note/);
    assert.match(s6, /paid service or anything that needs an account/);
    assert.match(s6, /engine-choice\.md` section 7, "Installs without a question"/);
    assert.match(s6, /sourcing-and-licenses\.md` sections 1a and 5/);
    assert.doesNotMatch(s6, /Never install, download or spend on your own/);
    const skill = readText(`${EDIT}/SKILL.md`);
    assert.doesNotMatch(skill, /Installs, downloads and spending happen only with the user's yes/);
    assert.match(skill, /paid or account-bound services wait for a yes/);
    for (const f of ["references/transcript-editing.md", "references/layers-and-isolation.md", "references/broll-and-motion-broll.md"]) {
      assert.doesNotMatch(readText(`${EDIT}/${f}`), /download only after a yes|downloaded only after the user's yes|install below needs the user's yes/i, f);
    }
    const notice = readText(`${EDIT}/scripts/NOTICE.md`);
    assert.doesNotMatch(notice, /Playwright install, only with the user's yes|network install, only with the user's yes/);
    assert.match(notice, /hosted ASR .*optional, paid, and used only after the user's yes/, "paid services keep their question");
  });

  test("edit: disk space is checked first, long sources at the output resolution, rebuildable files cleaned", () => {
    const s6 = section(readText(`${EDIT}/references/ingest-and-ledger.md`), "\n## 6. Tools, installs and disk space");
    assert.match(s6, /node <ice-motion-director>\/scripts\/ice-state\.mjs space --need <GB>/);
    assert.match(s6, /"Disk space" subsection of `ice-engines\/references\/engine-choice\.md` section 7/);
    assert.match(s6, /Proxies, extracted frames.*scratch stems.*deleted once the stage that uses them is approved, and each deletion is logged/s);
    assert.match(readText(`${EDIT}/references/ingest-and-ledger.md`), /a 1080 output fetches 1080p/);
  });

  test("edit: music and SFX follow the ice-audio ladder, code sound only when named", () => {
    for (const f of ["SKILL.md", "references/edit-types/long-form.md", "references/edit-types/shorts-reels.md",
                     "references/edit-types/podcast.md", "references/edit-types/talking-head-ad.md"]) {
      assert.match(readText(`${EDIT}/${f}`), /ice-audio skill's ladder/, f);
    }
    assert.doesNotMatch(readText(`${EDIT}/references/edit-types/long-form.md`), /A warm pad/);
  });
}

// Lessons 4 to 6 on the review side: every storyboard element carries its trigger and reason (lint check 17 at 04,
// confirmed by the critics), the finishing layer only where measured or reasoned, the slop scan scoped, the speaker lit.
{
  const LINT_DOC = "skills/ice-qa/references/storyboard-lint.md";
  const PROMPTS = "skills/ice-qa/references/critic-prompts.md";
  const FINISH = "skills/ice-motion/references/motion-blur-and-clock.md";
  const SLOP = "skills/ice-qa/references/slop-scan.md";
  const FRAMES = "skills/ice-qa/references/frame-checks.md";
  const SPEAKER = /The speaker stays lit/;

  function section(text, heading) {
    const start = text.indexOf(heading);
    assert.ok(start >= 0, `missing section ${heading}`);
    const next = text.slice(start + heading.length).search(/\n## /);
    return next < 0 ? text.slice(start) : text.slice(start, start + heading.length + next);
  }

  function findPython() {
    for (const c of [["python"], ["python3"], ["py", "-3"]]) {
      const r = spawnSync(c[0], [...c.slice(1), "--version"], { encoding: "utf8" });
      if (r.status === 0) return c;
    }
    return null;
  }

  test("review: storyboard-lint section 3b ties every element to a trigger and a reason and cuts it without them", () => {
    const doc = readText(LINT_DOC);
    assert.match(doc, /`Time \| Object \| Action \| Camera \| On-screen text \| Trigger \| Reason \| Method \| Tags`/);
    const sb = section(doc, "## 3b. Every element has a trigger and a reason");
    assert.match(sb, /owner decision, 2026-10-29/);
    assert.match(sb, /every film type, with or without a reference/);
    assert.match(sb, /with its time/);
    assert.match(sb, /who or what it is on, and why its colour and shape/);
    assert.match(sb, /cut before 05/);
    assert.match(sb, /never "it is in the reference"|may never be "it is in the reference"/);
    assert.match(sb, /REASONS\.md/);
    assert.match(sb, /notes-files\.md`, section "Element reasons"/);
    assert.match(sb, /reason in the reference still holds in the new film/);
    assert.match(sb, /check 17\) at 04, the earliest stage/);
    assert.match(doc, /\| 17 \| Every row has a `Trigger` and a `Reason` cell/);
    for (const f of ["skills/ice-film/references/storyboard.md", "skills/ice-explainer/references/word-timed-segments.md",
      "skills/ice-direction/references/treatment.md"]) {
      assert.ok(readText(f).includes("storyboard-lint.md` section 3b"), `${f} points to storyboard-lint.md section 3b`);
    }
  });

  test("review: the storyboard linter reds an empty or filler trigger or reason and a table without those columns", (t) => {
    const py = findPython();
    if (!py) { t.skip("no Python"); return; }
    const dir = mkdtempSync(join(tmpdir(), "ice-review-"));
    try {
      const lock = "Style: flat print\nPalette: #E85D3A ink, #F4EFE6 ground, #1F1F1F text\nCharacters: none\n\n";
      const withCols = lock + "| Time | Object | Action | Camera | On-screen text | Trigger | Reason | Method |\n|---|---|---|---|---|---|---|---|\n" +
        "| 0-3 | a kettle | boils over | slow push | | \"the water ran out\" at 0.4 s | the viewer's morning; orange is the heat role | code scene |\n" +
        "| 3-6 | a ring on a map | tightens around the town | hold | | | reference | code scene |\n";
      const noCols = lock + "| Time | Object | Action | Camera | On-screen text | Method |\n|---|---|---|---|---|---|\n" +
        "| 0-3 | a kettle | boils over | slow push | | code scene |\n| 3-6 | a ring on a map | tightens around the town | glide | | code scene |\n";
      const run = (name, body) => {
        const f = join(dir, name);
        writeFileSync(f, body, "utf8");
        return spawnSync(py[0], [...py.slice(1), abs("skills/ice-qa/scripts/storyboard_lint.py"), f, "--type", "explainer"],
          { encoding: "utf8", cwd: dir, timeout: 60000 });
      };
      const a = run("a.md", withCols);
      assert.equal(a.status, 1, a.stdout + a.stderr);
      assert.match(a.stdout, /\[GREEN\] shot 1/);
      assert.match(a.stdout, /\(17\) trigger: the Trigger cell is empty/);
      assert.match(a.stdout, /\(17\) reason: the Reason cell is empty or only names the source or a taste \('reference'\)/);
      assert.match(a.stdout, /cut before 05/);
      const b = run("b.md", noCols);
      assert.equal(b.status, 1, b.stdout + b.stderr);
      assert.match(b.stdout, /\(17\) trigger and reason: no Trigger and no Reason column/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("review: the critics judge element reasons, and read the reference's reasons table when there is one", () => {
    const p = readText(PROMPTS);
    const stage = section(p, "## Stage critic");
    assert.match(stage, /trigger \(the script sentence or word with its time\) and a reason/);
    assert.match(stage, /REASONS\.md/);
    assert.match(stage, /no element without a trigger and a reason/);
    const full = section(p, "## Full-film critic");
    assert.match(full, /Element reasons/);
    assert.match(full, /carried-over element whose reason does not hold in this film is a defect/);
    const sb = section(p, "## Storyboard critic");
    assert.match(sb, /Trigger quote a real sentence or word/);
    assert.match(sb, /REASONS\.md/);
    assert.match(section(p, "## Remake critic"), /reason in <path to the reference's REASONS\.md> must hold in this film/);
    const report = readText("skills/ice-qa/references/delivery-report.md");
    assert.match(report, /\| Element reasons \|/);
    assert.match(readText("skills/ice-film/roles/reviewer.md"), /storyboard-lint\.md` section 3b/);
    assert.match(readText(FRAMES), /\| R1 \| Element reasons \|/);
  });

  test("review: the finishing layer section applies each effect only where measured or reasoned, with Ice's own tools", () => {
    const f = readText(FINISH);
    const fin = section(f, "## 6. Finishing layer");
    assert.match(fin, /Owner decision, 2026-10-29/);
    assert.match(fin, /only where measured or reasoned/);
    assert.match(fin, /Never on everything/);
    assert.match(fin, /measuring\.md`, section "Finishing layer"/);
    assert.match(fin, /D-entry in `ice\/DIRECTION\.md`/);
    for (const effect of ["Motion blur on fast moves", "Blur for depth", "Blur on entrances and exits", "Grain", "Specks",
      "Halftone", "Flicker", "Vignette", "Glow", "Grade"]) {
      assert.match(fin, new RegExp(`\\n\\| ${effect}`), `finishing table has a row for ${effect}`);
    }
    for (const tool of ["tmix", "gblur", "noise", "vignette", "lut3d", "curves", "render-html", "Remotion", "seeded"]) {
      assert.ok(fin.includes(tool), `finishing layer names ${tool}`);
    }
    assert.match(fin, /one blur grammar \(section 2\)/);
    assert.match(fin, /never both/);
    // sections 2 to 5 are reconciled, not duplicated: the grain numbers stay in section 5 only
    assert.equal(f.split("0.03-0.06").length - 1, 1);
  });

  test("review: the slop scan lets a measured or reasoned finishing effect pass and still fails decoration", () => {
    const s = readText(SLOP);
    const tells = section(s, "## 5. When a \"tell\" is right");
    const row = tells.split("\n").find((l) => l.startsWith("| Finishing effects"));
    assert.ok(row, "section 5 has a Finishing effects row");
    assert.match(row, /measuring\.md`, "Finishing layer"/);
    assert.match(row, /D-entry/);
    assert.match(row, /motion-blur-and-clock\.md`, "Finishing layer"/);
    assert.match(row, /fails as decoration with no source/);
    assert.match(row, /above the measured amount/);
    for (const id of ["| N11 |", "| N20 |"]) {
      const line = s.split("\n").find((l) => l.startsWith(id));
      assert.match(line, /Finishing effects/, `${id} points to the scoped exception`);
    }
    assert.match(s, /\| Glow, bloom and neon on type and UI chrome; gradients on text \| Fail unless the brand's own material, or a finishing glow that passes section 5/);
    assert.match(readText(FRAMES), /\| B8 \| Finishing layer \|.*one applied to every shot with no such source fails/);
  });

  test("review: the speaker or guest stays lit in news, explainer and talk-show reviews", () => {
    const p = readText(PROMPTS);
    assert.match(section(p, "## Full-film critic"), /speaker or guest stays lit and clear; dimming, silhouette, circles and marks fall only on the people being talked about/);
    for (const f of [PROMPTS, FRAMES, "skills/ice-qa/references/clarity-gate.md", "skills/ice-film/roles/reviewer.md",
      "skills/ice-explainer/references/card-library.md", "skills/ice-explainer/references/grammar-selection.md"]) {
      const t = readText(f);
      assert.match(t, SPEAKER, `${f} names the rule`);
      assert.ok(t.includes("layers-and-isolation.md"), `${f} points to its home`);
    }
    assert.match(readText(FRAMES), /\| P1 \| Speaker stays lit \| News, explainer and talk-show films/);
  });
}

// Lesson checks with no other home: the comfortable mix (L1), the install policy header of every requirements.txt
// (L3) and the identity conflict on a different content type (L7).
test("lessons: the comfortable mix is an audio gate: music under the speech, no repeated pulse", () => {
  const gate = readText("skills/ice-qa/references/audio-gates.md");
  assert.match(gate, /\| Comfortable mix \(every film with sound\) \|/);
  const mix = readText("skills/ice-audio/references/mix-and-master.md");
  assert.match(mix, /\*\*The comfortable mix \(every film with sound, owner decision 2026-10-29\)\.\*\*/);
  assert.match(mix, /No repeated pulse/);
});

test("lessons: every requirements.txt says Ice installs the pins itself, without a question", () => {
  for (const f of ["assets", "audio", "edit", "lottie", "motion", "qa", "remake"]) {
    const text = readText(`skills/ice-${f}/scripts/requirements.txt`);
    assert.match(text, /Ice installs them itself, without a question, into a project virtual environment/, f);
    assert.doesNotMatch(text, /only after the user agrees/, f);
  }
});

test("lessons: a request for the reference's identity on another content type is a conflict; auto takes the fitting identity", () => {
  const s = section("skills/ice-remake/references/rights-and-modes.md", "\n### The identity fits the content");
  assert.match(s, /make the reference's outlet the owner of this film/);
  assert.match(s, /\*\*A conflict, not a fixed slot:\*\*/);
  assert.match(s, /take the fitting identity, log it/);
  const q = readText("skills/ice-direction/references/questions.md");
  assert.match(q, /a conflict that leaves this slot open/);
});
