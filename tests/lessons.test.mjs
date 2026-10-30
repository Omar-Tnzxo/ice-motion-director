// Lessons become default rules (founder decision, 2026-10-29, AGENTS.md rule 19): every note from the founder, a
// trial or a case study is a rule in the skills with a test, never advice the user writes in a prompt.
// `docs/maintainers/lessons.md` lists each lesson; this file checks the list itself (fields, scope, every rule file and
// every test it names exist) and holds the lesson tests that have no other home. Zero dependencies. Run: node --test tests/
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "node:test";
import { abs, findPython, readText } from "./helpers.mjs";

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
    assert.match(s, /the craft plan's `finish` row, written at 05 for every edit/, "0.2.5: the finishing reason has an owner");
    assert.match(s, /outside a recede window/, "an effect never darkens the speaker outside a recede window");
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
    // 0.2.5: the reason has an owner, the craft plan's `finish` row written for every film at 05
    assert.match(fin, /the craft plan's `finish` row, locked at 05/);
    assert.match(fin, /or "none" with its reason/);
    assert.match(fin, /"not asked" is never a reason for "none"/);
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

// Lesson L11: captions are checked against a fresh transcript of the final audio (align_script_to_asr.py --check-captions).
test("lessons: --check-captions passes exact captions and blocks a missing word, a late cue and bad input; Arabic folds", { skip: !findPython() && "no Python 3.10+" }, () => {
  const py = findPython();
  const script = abs("skills/ice-type/scripts/align_script_to_asr.py");
  const dir = mkdtempSync(join(tmpdir(), "ice-l11-"));
  try {
    const put = (name, body) => { const p = join(dir, name); writeFileSync(p, typeof body === "string" ? body : JSON.stringify(body), "utf8"); return p; };
    const heard = put("heard.json", [["the", 0.5, 0.7], ["deal", 0.72, 1.1], ["is", 1.12, 1.25], ["on", 1.27, 1.4], ["the", 1.42, 1.55],
      ["table", 1.57, 2.0], ["tonight", 2.4, 2.9], ["in", 2.95, 3.05], ["Geneva", 3.08, 3.6]].map(([w, s, e]) => ({ w, s, e })));
    const run = (caps, ...extra) => {
      const r = spawnSync(py[0], [...py.slice(1), script, "--check-captions", caps, heard, ...extra], { encoding: "utf8" });
      let report = null;
      try { report = JSON.parse(r.stdout); } catch { /* exit 2 prints no report */ }
      return { status: r.status, report, out: r.stdout + r.stderr };
    };
    const srt = (a, b) => `1\n00:00:00,420 --> 00:00:02,100\n${a}\n\n2\n00:00:02,320 --> 00:00:03,700\n${b}\n`;
    const exact = run(put("exact.srt", srt("The deal is on the table", "tonight in Geneva.")));
    assert.equal(exact.status, 0, exact.out);
    assert.equal(exact.report.ok, true);
    const missing = run(put("missing.srt", srt("The new deal is on the table", "tonight in Geneva.")));
    assert.equal(missing.status, 4, missing.out);
    assert.ok(missing.report.mismatches.some((m) => m.kind === "missing" && m.caption === "new"), missing.out);
    const late = run(put("late.vtt", "WEBVTT\n\n00:00.420 --> 00:02.100\nThe deal is on the table\n\n00:02.800 --> 00:03.700\ntonight in Geneva.\n"));
    assert.equal(late.status, 4, late.out);
    assert.ok(late.report.offsets.some((o) => o.heard_word === "tonight" && Math.abs(o.offset - 0.4) < 0.01), late.out);
    assert.equal(run(put("bad.txt", "not captions")).status, 2);
    const arHeard = put("heard_ar.json", [["إلى", 0.3, 0.6], ["أين", 0.62, 0.9], ["تتجه", 0.92, 1.3], ["الأزمة", 1.32, 1.9], ["السودانية", 1.92, 2.6]]
      .map(([word, start, end]) => ({ word, start, end })));
    const ar = spawnSync(py[0], [...py.slice(1), script, "--check-captions",
      put("ar.json", [{ text: "إِلَى أَيْنَ تَتَّجِهُ", start: 0.25, end: 1.3 }, { text: "الأزمـــة السودانيه؟", start: 1.3, end: 2.7 }]), arHeard], { encoding: "utf8" });
    assert.equal(ar.status, 0, ar.stdout + ar.stderr);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// Lessons L9 to L12 (0.2.4): pacing, fixed identity marks, captions and depth are measured on the reference and gated.
const has = (relPath, phrases) => {
  const text = readText(relPath);
  for (const p of phrases) assert.ok(text.includes(p), `${relPath}: "${p}"`);
};

test("lessons: validate-plan blocks a gap over the reference's even with a holdReason, and a slower density (L9)", async () => {
  const { validatePlan } = await import(pathToFileURL(abs("skills/ice-edit/scripts/validate-plan.mjs")).href);
  const transcript = { words: [{ text: "hello", start: 0.1, end: 0.5, sourceStart: 10.1, sourceEnd: 10.5 }] };
  const edl = { keeps: [{ sourceStart: 10, sourceEnd: 50, start: 0, end: 40 }] };
  const times = [...Array.from({ length: 13 }, (_, i) => i + 1), 13.25, 33, 34, 35, 36, 37, 38, 39];
  const plan = (reference) => ({
    duration: 40, fps: 25, ...(reference ? { reference } : {}),
    scenes: [{ id: "s00", start: 0, end: 40, layout: "face", kind: "talk", anchor: "hello", anchorTime: 0.1, holdReason: "presenter hold" }],
    events: times.map((time) => ({ time, type: "graphic", visual: "s00" })),
    captions: [{ start: 0.1, end: 0.5, words: [{ text: "hello", start: 0.1, end: 0.5 }] }],
  });
  const plain = validatePlan(plan(null), transcript, edl);
  assert.equal(plain.ok, true, plain.errors.join("; "));
  assert.equal(plain.metrics.eventsPerMinute, undefined, "no reference: the 0.2.3 output is unchanged");
  const gap = validatePlan(plan({ maxEventGap: 3, eventsPerMinute: 30 }), transcript, edl);
  assert.equal(gap.ok, false);
  assert.ok(gap.errors.some((e) => /19\.75s .*exceeds the reference limit .*a holdReason does not excuse it/.test(e)), gap.errors.join("; "));
  const slow = validatePlan(plan({ maxEventGap: 25, eventsPerMinute: 60 }), transcript, edl);
  assert.ok(slow.errors.some((e) => /^Event density .* is below the reference limit 54\.00/.test(e)), slow.errors.join("; "));
  assert.ok(validatePlan(plan({ maxEventGap: 3 }), transcript, edl).errors.some((e) => /^Invalid plan\.reference/.test(e)));
});

test("lessons: the pacing gate is measured on the reference and blocks the plan and the render (L9)", () => {
  has("skills/ice-remake/references/measuring.md", ["## 10. Pacing events"]);
  has("skills/ice-qa/references/motion-density.md", ["## 7. Pacing against the reference (lesson L9, blocking)",
    "A declared hold does not excuse a gap", "x 1.10 plus one frame", "x 0.90"]);
  has("skills/ice-edit/references/clock-and-grouping.md", ['"reference":{"maxEventGap":0.0,"eventsPerMinute":0.0}']);
  has("skills/ice-qa/references/delivery-checks.md", ["| Pacing against the reference (L9) |"]);
  has("skills/ice-remake/references/notes-files.md", ["Pacing:"]);
});

test("lessons: fixed identity marks are measured, placed by the identity choice and checked from 05 (L10)", () => {
  has("skills/ice-remake/references/measuring.md", ["## 11. Fixed marks"]);
  has("skills/ice-remake/references/notes-files.md", ["Fixed marks:"]);
  has("skills/ice-remake/references/rights-and-modes.md", ["### Fixed identity marks (owner decision, 2026-10-29)",
    "the same mark, in the same slot, at the same size", "the user's mark in the same slot, at the same size",
    "A slot is never left empty because the mark was not fetched"]);
  has("skills/ice-remake/references/shot-mapping.md", ["`fixed_marks` row of the plan on the screen layer"]);
  has("skills/ice-qa/references/identity-tests.md", ["## 8. Fixed identity marks",
    "position within 2 percent of the frame width and height, size within 10 percent"]);
  has("skills/ice-qa/references/frame-checks.md", ["| R3 | Fixed identity marks |"]);
  has("skills/ice-motion/references/composition-and-staging.md", ["fixed identity marks measured from a reference"]);
});

test("lessons: captions face a fresh transcript of the final audio, blocking at 09 and 10 (L11)", () => {
  has("skills/ice-qa/references/captions-and-sync.md", ["## 1b. Fresh transcript gate",
    "never the transcript the captions were built from", "--check-captions"]);
  has("skills/ice-qa/references/delivery-checks.md", ["| Fresh transcript gate (L11) |"]);
  has("skills/ice-type/references/caption-timing-and-truth.md", ["Fresh transcript gate (lesson L11, blocking at 09 and 10)"]);
  has("skills/ice-edit/SKILL.md", ['"Fresh transcript gate" (blocking)']);
});

test("lessons: depth, 3D and camera are measured, mapped with a build route and gated against the reference (L12)", () => {
  has("skills/ice-remake/references/measuring.md", ["## 12. Depth, 3D and camera",
    "Every aspect of a reference is measured and carried over", "a move of 21 to 80 frames"]);
  has("skills/ice-remake/references/notes-files.md", ["Depth:"]);
  has("skills/ice-remake/references/shot-mapping.md", ["An element with no route is a finding, never a silent drop"]);
  has("skills/ice-motion/references/depth-and-3d.md", ["## 7. Build routes for depth and 3D", "| `threejs-hyperframes` |",
    "| Card field push-through |"]);
  has("skills/ice-qa/references/motion-density.md", ["## 8. Depth and camera against the reference (lesson L12, blocking)",
    "within plus or minus 30 percent"]);
  has("skills/ice-qa/references/storyboard-lint.md", ["| 21 | A row whose Object, Action, Camera, Method or Tags names a depth or 3D element"]);
  has("skills/ice-edit/SKILL.md", ['"Build routes for depth and 3D"']);
});

// Lessons L14, L15, L19 and L20 (0.2.5): taste bans become conditional defaults. A ban stays the default for the types
// it names and yields to a recorded source (the user's words, a measured reference, the chosen style, a content trigger),
// written as a plan or exemption row; truth, rights, safety, legibility, Arabic correctness and L5 are never lifted.
const CRAFT_PLAN = /the `ice-direction` skill, `references\/treatment\.md` section "Craft plan"/;
const SLOP_DOC = "skills/ice-qa/references/slop-scan.md";
const FRAME_DOC = "skills/ice-qa/references/frame-checks.md";
const DEPTH_DOC = "skills/ice-motion/references/depth-and-3d.md";
const LAYERS_DOC = "skills/ice-edit/references/layers-and-isolation.md";

test("lessons: taste bans are conditions: the slop scan says delete the element or show its plan or exemption row (L14)", () => {
  const slop = readText(SLOP_DOC);
  assert.doesNotMatch(slop, /delete the element, do not justify it/, "the absolute wording is gone");
  assert.equal(slop.split("delete the element or show its plan or exemption row").length - 1, 2, "the opening and section 7 both say it");
  assert.match(slop.slice(0, slop.indexOf("## Contents")), CRAFT_PLAN, "the opening points to the one home of the precedence and row format");
  assert.match(slop, /"Justified" with no recorded source still fails/);
  assert.match(slop, /the speaker staying lit are never lifted/);
  const general = section(SLOP_DOC, "### Measured and declared packages");
  assert.match(general, /Scope: every film type \(lesson L14, 0\.2\.5\)/);
  for (const p of [/\*\*It has its row\.\*\*/, /`slop:<item number or N id>`/, /\*\*It follows its numbers\*\*/,
    /\*\*It keeps the never rules and is well made\*\*/, /Decoration without a source still fails, in every film type/]) assert.match(general, p);
  assert.match(general, /the never-lifted rules of the `ice-direction` skill, `references\/treatment\.md` section 11\.7 stay absolute/, "a pointer, not a partial list");
  assert.ok(slop.indexOf("### Measured and declared packages") < slop.indexOf("### Broadcast package (news reel)"));
  assert.match(section(SLOP_DOC, "### Broadcast package (news reel)"), /one case of "Measured and declared packages" above/);
  assert.match(section(SLOP_DOC, "## 7. How to report"), CRAFT_PLAN);
  // the reflexive bans stay: typing, glass and glow fail as a reflex and pass only with a source
  const row = (start) => slop.split("\n").find((l) => l.startsWith(start));
  assert.match(row("| Typewriter headlines |"), /Fail as a reveal style on every line\. Passes when typing is the medium or the meaning, with its plan row/);
  assert.match(row("| Typewriter headlines |"), /letters are never added one by one; a typed Arabic line is always a mask reveal over the whole shaped line/);
  assert.match(row("| Glassmorphism, frosted glass panels |"), /Fail as default "premium" \| Passes, with its plan row, when the brand's own UI uses glass \(any film type\)/);
  assert.match(row("| Glow, bloom and neon on type and UI chrome; gradients on text |"), /the chosen style's medium is light .* or a reference measures it, at the stated or measured radius, on dark grounds, with its plan row/);
  assert.match(row("| N24 |"), /A dissolve passes where the type's transition policy allows it .* or the reference measures it/);
  assert.match(row("| Page chrome |"), /Never as decoration\. Passes with its row: a recurring identity mark chosen at 01/);
  assert.match(readText(FRAME_DOC), /A gate that fails is fixed, or cleared by an exemption row with a measured or declared source/);
  assert.doesNotMatch(readText(FRAME_DOC), /A gate that fails is fixed, not argued;/);
  // one canonical home: each rewritten file points to it in one line instead of restating the precedence
  for (const f of [DEPTH_DOC, LAYERS_DOC, FRAME_DOC, "skills/ice-motion/references/composition-and-staging.md",
    "skills/ice-motion/references/camera.md", "skills/ice-motion/references/transition-policy.md",
    "skills/ice-motion/references/motion-blur-and-clock.md", "skills/ice-edit/references/broll-and-motion-broll.md"]) {
    assert.match(readText(f), CRAFT_PLAN, `${f} points to the craft plan`);
  }
});

test("lessons: news reel allowances are one case of general rules: long takes, a second voice hue, sound under speech, flashes (L14)", () => {
  has("skills/ice-motion/references/camera.md", ["a single take over about 8 s gets a visible change every 3 to 5 s",
    "The news reel numbers of section 8 are the measured case of this rule", "## 8. Digital camera on one take (news reel)"]);
  assert.doesNotMatch(readText("skills/ice-motion/references/camera.md"), /\| Talking-head reframes \| Fixed crop per shot, never a per-frame face follow/);
  has("skills/ice-motion/references/holds-and-stillness.md", ["This creep is the floor, not the ceiling"]);
  has("skills/ice-motion/references/springs-and-curves.md", ["Also available to any calm camera that must not stop"]);
  assert.doesNotMatch(readText("skills/ice-motion/references/springs-and-curves.md"), /Not a curve for other film types/);
  has("skills/ice-type/references/caption-styles.md", ["A second hue marks a second audible voice, in any film",
    "a quote the narrator reads keeps the narrator's colour", "The hue marks whose voice is heard, not quotation"]);
  has("skills/ice-audio/references/sfx.md", ["Under speech, in any film: while a voice talks, an effect sits in the sub band (under 150 Hz) or the air band (over 4 kHz)",
    "This band filter and reject rule never apply to an effect under speech"]);
  has("skills/ice-motion/references/cut-catalog.md", ["A white flash is not a ground change or a filler between beats; it passes when it carries a meaning the plan states"]);
  assert.doesNotMatch(readText("skills/ice-motion/references/cut-catalog.md"), /never a white flash or crossfade \(news reel/);
  const a5 = readText(FRAME_DOC).split("\n").find((l) => l.startsWith("| A5 |"));
  assert.match(a5, /A flash passes when it carries a meaning the plan states/);
  assert.match(a5, /in strobe safe mode unless the user asked for the faithful one/, "photosensitivity is never lifted");
  has("skills/ice-motion/references/motion-language-by-type.md", ["Scope of the don'ts: they are written for product UI and app ads in the category",
    "A don't about safety or honesty"]);
  has("skills/ice-type/references/depth-and-embedded-captions.md", ["the user's request is one trigger, not the only one"]);
  has("skills/ice-type/references/type-effects-specs.md", ["or while the speaker says the number (the counter lands on the spoken word"]);
});

test("lessons: depth is a craft: N16 and depth-and-3d pass a card field with parallax and fail a lone tilted card (L15)", () => {
  const dim = section(DEPTH_DOC, "## 1. Choose the dimension");
  assert.match(dim, /Depth is a craft, not an exception \(lesson L15\)/);
  assert.match(dim, CRAFT_PLAN);
  assert.match(dim, /the script names several items that should be seen together/);
  assert.match(dim, /A rotated single flat image is not depth/);
  assert.match(dim, /Planes at their own depth inside one perspective camera \(the `css-3d` route, section 7\), with parallax, occlusion and contact shadows, are valid 2\.5D/);
  assert.match(dim, /When the chosen style, the reference or the direction's Depth dial .* is deep, depth is the medium/);
  assert.match(dim, /a lone tilted card \(one flat card skewed by perspective with nothing else at depth/, "the lone tilted card stays slop");
  assert.match(dim, /3D bar charts and rotating pies/);
  assert.match(dim, /A card field passes: cards posed at angles inside a field of planes with measured parallax \(the nearest plane moves at least about 1\.5x the farthest\), occlusion, contact shadows/);
  assert.match(dim, /The execution check stays/);
  assert.doesNotMatch(dim, /typography and UI stay crisp 2D/);
  assert.doesNotMatch(dim, /Real depth, lighting or camera motion means a real 3D engine/);
  assert.doesNotMatch(dim, /a tilted card as "depth"/);
  assert.doesNotMatch(readText(DEPTH_DOC), /Chrome-on-black with bloom is a house style to avoid/);
  const slop = readText(SLOP_DOC);
  const n16 = slop.split("\n").find((l) => l.startsWith("| N16 |"));
  assert.match(n16, /A lone tilted card: one flat card skewed by perspective with nothing else at depth/);
  assert.match(n16, /red 3D bars and pies/);
  assert.match(n16, /a card field: cards posed at angles inside a field of planes with measured parallax/);
  assert.match(n16, /A card field passes; a lone tilted card fails/);
  const tell = slop.split("\n").find((l) => l.startsWith("| 3D, depth or tilted UI |"));
  assert.match(tell, /Never a lone tilted card as "depth"/);
  assert.match(tell, /a card field/);
  assert.match(readText("skills/ice-motion/references/cut-catalog.md"), /About once per film in a flat direction, only when motivated; when depth is the medium/);
});

test("lessons: the speaker recedes inside a planned window and is never darkened while speaking (L19)", () => {
  const s5 = section(LAYERS_DOC, "\n## 5. The speaker stays lit");
  assert.match(s5, /This rule is never lifted by an exemption row, a reference or a style/, "L5 stays a hard rule");
  assert.match(s5, /\*\*Recede window \(any speaker-led video\)\.\*\* The speaker recedes, never darkens\./);
  assert.match(s5, /The window: an inserted image or card of another person or thing is the subject of the frame \(foregrounded\)/);
  assert.match(s5, /While the speaker talks inside the window: only a scale back \(push back, about 0\.7 to 1\.0 of the framing\) and a partial desaturation, at the reference's measured amounts when one measures them; never fully grey or sepia, never dimmed, never defocused\./);
  assert.match(s5, /While the speaker is silent inside the window: also a dimming of at most 15 percent luma and a light defocus\. The 15 percent cap holds even when a reference measures more: a darker measured value is clipped to 15 percent and the delivery note says so\./);
  assert.match(s5, /Never a silhouette, a ring, a disc or a mark on the speaker, in or out of the window/);
  assert.match(s5, /on the frame the image leaves or on the next stressed word/);
  assert.doesNotMatch(s5, /or the amount a reference measures/, "a measured dimming never goes past the 15 percent cap");
  assert.match(s5, /Each window is listed in the plan's `cutout` row/);
  assert.match(s5, /never darkens, desaturates or tints the speaker to set a mood/);
  assert.match(s5, /outside the recede windows and text takeovers, the mean luma of the speaker's box stays within about 5 percent/);
  assert.match(s5, /inside a window it stays within about 5 percent and sharp while the speaker talks, at most 15 percent darker while the speaker is silent \(never more, whatever a reference measures\)/);
  assert.doesNotMatch(s5, /Measured exception \(news reel\)/);
  const kit = section(LAYERS_DOC, "## 3b. Programme matte kit");
  assert.match(kit, /are recede windows of section 5 at the reference's measured amounts/);
  assert.doesNotMatch(kit, /the luma check of section 5 still holds/, "the 0.2.4 conflict: its own luma check failed the measured device");
  assert.match(kit, /is section 5, "Recede window" and "Check"/, "the kit points to the one home instead of restating the amounts");
  const p1 = readText(FRAME_DOC).split("\n").find((l) => l.startsWith("| P1 |"));
  assert.match(p1, /stays lit and clear while speaking/);
  assert.match(p1, /Recede window \(an inserted image or card of another person or thing is the subject of the frame\): while the speaker talks, only a scale back and a partial desaturation, never fully grey or sepia, never dimmed or defocused; while the speaker is silent, also a dimming of at most 15 percent luma \(a cap, even when a reference measures more\) and a light defocus/);
  assert.match(p1, /Outside the windows the speaker's box stays within about 5 percent of the source luma/);
  assert.match(p1, /never a silhouette, never a mark/);
  has("skills/ice-edit/references/ingest-and-ledger.md", ["Never alter the person's skin, exposure or identity for a mood"]);
  const depth = readText("skills/ice-motion/references/depth-and-3d.md");
  assert.match(depth, /the speaker stays sharp while speaking and takes a light defocus only while silent inside a recede window/);
  assert.match(depth, /The presenter is defocused only while silent inside such a window, .*and stays lit and sharp while speaking\./);
  const item5 = readText("skills/ice-qa/references/critic-prompts.md").split("\n").find((l) => l.startsWith("5. <For news, explainer and talk-show films with a speaker"));
  assert.match(item5, /that section's "Recede window" allows while the speaker talks and while the speaker is silent/, "the critic points to section 5");
  assert.doesNotMatch(item5, /15 percent/, "the critic does not repeat the recede numbers");
});

test("lessons: outside material looks outside, in any film, with one treatment and never on the speaker (L20)", () => {
  const broll = "skills/ice-edit/references/broll-and-motion-broll.md";
  const om = section(broll, "### Outside material");
  assert.match(om, /Lesson L20, scope: general, any film or edit that mixes its own footage/);
  for (const t of ["| Monochrome |", "| Desaturation with lifted blacks |", "| Warm duotone |", "| Palette tint |"]) assert.ok(om.includes(t), t);
  assert.match(om, /pick one outside-material treatment at 05, apply it to every outside item, and log it in the plan's `finish` row \(a grade per source class\)/);
  assert.match(om, /The speaker and the film's own footage never take the treatment/);
  assert.match(om, /\*\*Truth first\.\*\*/);
  assert.match(section(broll, "### News reel B-roll treatments"), /the measured case of "Outside material" above/);
  const color = readText("skills/ice-direction/references/color.md");
  assert.match(color, /\*\*One grade per source class\*\* \(lesson L20\)/);
  assert.doesNotMatch(color, /one grade and one light logic for all assets \(handled/);
  const ai = readText("skills/ice-assets/references/ai-media-policy.md");
  assert.doesNotMatch(ai, /One grade for all clips/);
  assert.match(ai, /they take the grade of the source class they stand in for/);
  assert.match(readText("skills/ice-motion/references/motion-blur-and-clock.md"), /one grade per source class \(the film's own world in the film grade, outside material in its one outside treatment/);
  has("skills/ice-edit/references/ingest-and-ledger.md", ["| Outside material (archive, agency footage, quoted portraits, stills, screenshots) |"]);
});

test("lessons: anti-sameness guards Ice's own choices; a look the user chose is exempt on its axes (L22)", () => {
  const owner = section("skills/ice-direction/references/anti-sameness.md", "### 4a. A look the user chose (founder decision, 2026-10-29)");
  for (const kind of ["a reference the user supplied or named", "a style the user picked by name", "the brand identity the user's own brand already has", "a series look"]) {
    assert.ok(owner.includes(kind), `4a names the kind of choice: ${kind}`);
  }
  assert.match(owner, /\*\*Template distance:\*\* not applied to the template, demo or style card that the choice names/);
  assert.match(owner, /fingerprints are compared only between films without a user's choice/);
  assert.match(owner, /\*\*Divergent pitch round:\*\* the "at least two unexpected directions" requirement/);
  assert.match(owner, /\*\*What stays:\*\* dated research before decisions, the decision log/);
  assert.match(owner, /A choice inferred by the agent is not a user's choice/);
  assert.match(readText("skills/ice-direction/references/anti-sameness.md"), /"user_chosen":null/);
  const agents = readText("AGENTS.md");
  assert.match(agents, /These mechanisms guard Ice's own choices, never the user's \(founder decision, 2026-10-29\)/);
  assert.match(agents, /`skills\/ice-direction\/references\/anti-sameness\.md` section 4a/);
  const gates = readText("skills/ice-qa/references/anti-sameness-gates.md");
  assert.match(gates, /skip variants and records with `user_chosen` filled/);
  assert.match(gates, /When the user chose the reference for its look \(owner section 4a\), the skin is the request/);
  assert.match(readText("skills/ice-direction/references/pitch-round.md"), /at least two concepts are unexpected, except on the axes a look the user chose fixes/);
});

// 0.2.7 lessons from the completeness audit of 0.2.6 (L28 to L35).
const trackedFiles = () => spawnSync("git", ["ls-files"], { cwd: abs("."), encoding: "utf8" }).stdout.split("\n").filter(Boolean);
const familyFiles = () => trackedFiles().filter((f) => /^skills\/ice-styles\/references\/family-.*\.md$/.test(f));

test("lessons: sound by code is never a style's or a remake's default; loudness comes from the ice-audio table (L28)", () => {
  for (const f of familyFiles()) {
    for (const line of readText(f).split("\n").filter((l) => l.startsWith("- **Sound:**"))) {
      assert.doesNotMatch(line, /synthesi[sz]/i, `${f}: a Sound line still makes sound by code`);
      if (!f.includes("broadcast-news")) assert.doesNotMatch(line, /-1\d LUFS/, `${f}: a Sound line fixes its own loudness`);
    }
  }
  assert.match(readText("skills/ice-styles/SKILL.md"), /it never makes sound by code a default \(`ice-audio\/SKILL\.md` core rule 7\)/);
  const remake = readText("skills/ice-remake/references/rights-and-modes.md");
  assert.doesNotMatch(remake, /effects synthesized on the reference hits|a licensed or generated track/);
  assert.match(remake, /a generated or code-made track or effect only when the user asked for it in their own words/);
});

test("lessons: ice-state check refuses stage 03 and later without the craft plan (L29)", () => {
  const dir = mkdtempSync(join(tmpdir(), "ice-l29-"));
  try {
    const state = abs("skills/ice-motion-director/scripts/ice-state.mjs");
    const run = (...args) => spawnSync(process.execPath, [state, ...args, "--dir", dir], { encoding: "utf8", timeout: 60000 });
    const init = run("init", "--project", "demo", "--route", "film", "--mode", "auto");
    assert.equal(init.status, 0, init.stdout + init.stderr);
    for (const nn of ["01", "02"]) {
      for (const s of ["in_review", "approved"]) { const r = run("set", nn, s, ...(s === "approved" ? ["--by", "approver"] : [])); assert.equal(r.status, 0, r.stdout + r.stderr); }
    }
    const blocked = run("check", "03");
    assert.equal(blocked.status, 1, blocked.stdout + blocked.stderr);
    assert.match(blocked.stdout, /craft plan from the concept stage first \(ice\/plan\/craft-plan\.json/);
    mkdirSync(join(dir, "ice", "plan"), { recursive: true });
    writeFileSync(join(dir, "ice", "plan", "craft-plan.json"), "{}");
    assert.equal(run("check", "03").status, 0);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("lessons: a look the user chose is exempt from template distance in every file that states it (L30)", () => {
  for (const [f, re] of [["skills/ice-styles/SKILL.md", /A style the user named is exempt on the axes it fixes/],
    ["skills/ice-engines/references/hyperframes.md", /a look the user chose is exempt on the axes it fixes/],
    ["skills/ice-explainer/references/grammar-selection.md", /a look the user chose is exempt on the axes it fixes/],
    ["skills/ice-film/references/film-types/product-launch.md", /a look the user chose is exempt on the axes it fixes/],
    ["skills/ice-direction/SKILL.md", /except on the axes a look the user chose fixes/],
    ["skills/ice-film/SKILL.md", /except where a look the user chose fixes an axis/]]) assert.match(readText(f), re, f);
});

test("lessons: a package row never dims the speaker while speaking (L31)", () => {
  const news = readText("skills/ice-styles/references/family-broadcast-news.md");
  assert.doesNotMatch(news, /The speaker meanwhile desaturates and dims/);
  assert.match(news, /never dimmed while speaking; at most 15 percent luma only while silent/);
});

test("lessons: free installs and downloads are never consent items, in any workflow (L32)", () => {
  assert.doesNotMatch(readText("skills/ice-lottie/scripts/requirements.txt"), /ask first/);
  for (const f of ["skills/ice-lottie/scripts/capture_motion_frames.py", "skills/ice-lottie/scripts/probe_motion_continuity.py"]) {
    assert.doesNotMatch(readText(f), /so ask the user first|ask the\s+user first|so ask\s*"\s*"the user first/, f);
  }
  assert.doesNotMatch(readText("skills/ice-explainer/references/run-setup.md"), /consent for an install, a download/);
  assert.doesNotMatch(readText("skills/ice-film/references/delivery.md"), /every consent item the run skipped \(an install, a download/);
  assert.doesNotMatch(readText("skills/ice-direction/references/research.md"), /Never download third-party videos without that yes/);
});

test("lessons: rights to outside material and the user's own art stay with the user, in every route (L33)", () => {
  assert.doesNotMatch(readText("skills/ice-assets/references/sourcing-and-licenses.md"), /Rights and consent confirmed in the stage 01 message/);
  assert.doesNotMatch(readText("skills/ice-assets/references/brand-authenticity.md"), /ask for the official vector or written permission/);
  assert.doesNotMatch(readText("skills/ice-direction/references/reference-fidelity.md"), /say in one sentence why not/);
  assert.match(readText("skills/ice-film/references/film-types/art-film.md"), /References Ice picked teach grammar only/);
});

test("lessons: no unofficial line and no AI label inside the film; both live in the delivery note and caption (L34)", () => {
  for (const f of ["skills/ice-assets/references/brand-authenticity.md", "skills/ice-assets/references/truth-sheet.md",
    "skills/ice-direction/references/questions.md", "skills/ice-assets/references/asset-rules.md"]) {
    assert.doesNotMatch(readText(f), /last frame (carries|says) the line|whose last frame says|last-frame line "Unofficial|ends with "Unofficial concept/, f);
  }
  assert.match(readText("skills/ice-assets/references/brand-authenticity.md"), /the film itself carries no such line/);
  assert.doesNotMatch(readText("skills/ice-assets/references/ai-media-policy.md"), /"AI-generated imagery" on concept or spec films/);
  assert.match(readText("AGENTS.md"), /The same holds for users' unofficial concepts \(founder decision, 2026-10-30/);
});

test("lessons: Arabic typing in a real product input box is allowed; drawtext never sets Arabic (L35)", () => {
  const lf = readText("skills/ice-arabic/references/letterforms-in-motion.md");
  assert.match(lf, /\| Typing inside a real product input box \(search field, chat box, form\) \| Allowed when the product types there in real use/);
  assert.match(lf, /\| Letter-by-letter typewriter \| Never on headlines, captions, titles or cards, in every film type \|/);
  assert.match(readText("skills/ice-arabic/references/engine-overrides.md"), /\| FFmpeg `drawtext` \| Never for Arabic \|/);
});

// 0.2.7 lessons, second part (L36 to L39), and the behaviour-suite coverage of every lesson.
test("lessons: every lesson has a behaviour grader or a reason it has none", () => {
  const evals = readText("evals/behavior.mjs");
  const graded = new Set([...evals.matchAll(/lesson: "(L\d+)"/g)].map((m) => m[1]));
  const block = evals.slice(evals.indexOf("const NOT_GRADED = {"), evals.indexOf("};", evals.indexOf("const NOT_GRADED = {")));
  const reasons = new Set([...block.matchAll(/^\s*(L\d+): "/gm)].map((m) => m[1]));
  const missing = lessons().map((l) => `L${l.id}`).filter((id) => !graded.has(id) && !reasons.has(id));
  assert.deepEqual(missing, [], "add a grader in evals/behavior.mjs or a NOT_GRADED line with the reason");
});

test("lessons: the fingerprint is checked and written by a script; a user's look is never compared (L36)", () => {
  const py = findPython();
  if (!py) return;
  const dir = mkdtempSync(join(tmpdir(), "ice-l36-"));
  try {
    const rec = (over = {}) => ({ v: 1, date: "2026-10-01", project: "a", brand: "x", film_type: "ad", variant_of: null, user_chosen: null,
      palette: { polarity: "dark", accent_hue: 30, chroma: "duotone", hues: 2, values: [] },
      type: { display: "Inter", body: "Inter", classes: "grotesk+grotesk", weights: "400/800" },
      layout: { families: ["centered object", "grid"], density: "balanced", depth: "flat" },
      motion: { family: "punch", core_moves: ["slam", "whip", "pop"], camera: "locked", clock: "smooth" },
      structure: { concept: "c", scene_band: "5-8", main_objects: ["phone"], opening: "o", closing: "e", device: "d", arc: "a", turn_at: 0.4 },
      sound: { lead: "score", genre: "house", bpm_band: "120", dramaturgy: "build" }, ...over });
    const file = join(dir, "fingerprints.jsonl");
    writeFileSync(file, JSON.stringify(rec()) + "\n");
    const gate = abs("skills/ice-qa/scripts/film_gate.py");
    const run = (r, action = "check") => { const f = join(dir, `${Math.random()}.json`); writeFileSync(f, JSON.stringify(r)); return spawnSync(py[0], [...py.slice(1), gate, "fingerprint", action, "--record", f, "--file", file], { encoding: "utf8", timeout: 60000 }); };
    const repeat = run(rec({ project: "b", brand: "y" }));
    assert.equal(repeat.status, 2, repeat.stdout + repeat.stderr);
    assert.match(repeat.stdout, /FAIL: differs from .* on 0 of 6 axes/);
    assert.equal(run(rec({ project: "c", brand: "y", user_chosen: { kind: "style", ref: "card", axes: ["palette"] } })).status, 0);
    const other = rec({ project: "d", brand: "y", palette: { polarity: "light", accent_hue: 200, chroma: "full" }, type: { display: "Serif", classes: "serif+grotesk" },
      motion: { family: "calm", core_moves: ["drift", "fade", "hold"], camera: "continuous" }, sound: { lead: "voice", genre: "none", dramaturgy: "quiet" } });
    assert.equal(run(other).status, 0);
    assert.equal(run(other, "write").status, 0);
    assert.equal(readFileSync(file, "utf8").split("\n").filter(Boolean).length, 2);
  } finally { rmSync(dir, { recursive: true, force: true }); }
  assert.match(readText("skills/ice-qa/references/anti-sameness-gates.md"), /python scripts\/film_gate\.py fingerprint check --record/);
});

test("lessons: local libraries are indexed once and searched before the network (L36)", () => {
  const py = findPython();
  if (!py) return;
  const dir = mkdtempSync(join(tmpdir(), "ice-l36i-"));
  try {
    mkdirSync(join(dir, "lib", "whoosh"), { recursive: true });
    writeFileSync(join(dir, "lib", "whoosh", "air-whoosh-short.wav"), "x");
    writeFileSync(join(dir, "lib", "notes.txt"), "x");
    const fm = abs("skills/ice-assets/scripts/fetch_media.py");
    const idx = join(dir, "index.jsonl");
    const a = spawnSync(py[0], [...py.slice(1), fm, "index", "--dir", join(dir, "lib"), "--index", idx], { encoding: "utf8", timeout: 60000 });
    assert.equal(a.status, 0, a.stdout + a.stderr);
    assert.match(a.stdout, /indexed 1 files/);
    const b = spawnSync(py[0], [...py.slice(1), fm, "index", "--find", "whoosh", "--index", idx], { encoding: "utf8", timeout: 60000 });
    assert.equal(b.status, 0, b.stdout + b.stderr);
    assert.match(b.stdout, /audio .*air-whoosh-short\.wav/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("lessons: news reel trial rules: the episode's angles, whose claim, archive dates, minors, an ad reads as an ad (L37)", () => {
  const nr = readText("skills/ice-edit/references/edit-types/news-reel.md");
  for (const re of [/\*\*The episode's own camera angles\.\*\*/, /\*\*Whose claim it is\.\*\*/, /\*\*Archive keeps its date\.\*\*/]) assert.match(nr, re);
  assert.match(readText("skills/ice-assets/references/truth-sheet.md"), /\| A minor's face in news or event footage \| At most 0\.5 s on screen/);
  assert.match(readText("skills/ice-qa/references/clarity-gate.md"), /\*\*An ad reads as an ad from its first seconds\.\*\* .* within the first 3 s/);
});

test("lessons: the case study site package carries the films, the source, the selection, the prompt, the story and the disclaimer (L38)", (t) => {
  const has = (c) => spawnSync(c, ["-version"], { stdio: "ignore" }).status === 0;
  if (!has("ffmpeg") || !has("ffprobe")) { t.skip("ffmpeg or ffprobe not on PATH"); return; }
  const dir = mkdtempSync(join(tmpdir(), "ice-l38-"));
  try {
    const ice = join(dir, "ice");
    for (const d of ["sources/ep", "edit", "renders/final", "plan", "log", "review", "case-study"]) mkdirSync(join(ice, d), { recursive: true });
    const ff = (args) => spawnSync("ffmpeg", ["-v", "error", "-y", ...args], { encoding: "utf8" });
    ff(["-f", "lavfi", "-i", "testsrc2=s=320x180:r=25:d=8", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-t", "8", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", join(ice, "sources/ep/ep.mp4")]);
    ff(["-f", "lavfi", "-i", "testsrc2=s=180x320:r=25:d=3.5", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-t", "3.5", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", join(ice, "renders/final/film.mp4")]);
    writeFileSync(join(ice, "sources/ep/source.json"), JSON.stringify({ kind: "podcast episode", title: "Ep", owner: "Owner", url: "https://example.org/ep", duration_s: 8, license: "unknown" }));
    writeFileSync(join(ice, "edit/edl.json"), JSON.stringify({ sources: { ep: "ice/sources/ep/ep.mp4" }, fps: 25, ranges: [
      { source: "ep", start: 5, end: 6.5, reel_in: 0, reel_out: 1.5 }, { source: "gap", start: 0, end: 0.5, reel_in: 1.5, reel_out: 2 }, { source: "ep", start: 1, end: 2.5, reel_in: 2, reel_out: 3.5 }] }));
    writeFileSync(join(ice, "plan/selection.json"), JSON.stringify({ reason: { en: "the clearest contrast", ar: "أوضح تناقض" } }));
    writeFileSync(join(ice, "log/prompt.json"), JSON.stringify({ original_language: "ar", translations: { en: "make a reel" } }));
    writeFileSync(join(ice, "log/conversation.jsonl"), JSON.stringify({ at: "2026-10-30T10:00:00Z", stage: "01", from: "user", text: "اعمل ريلز" }) + "\n");
    writeFileSync(join(ice, "state.json"), JSON.stringify({ project: "demo", route: "edit", language: "ar", created: "2026-10-30T10:00:00Z",
      history: [{ at: "2026-10-30T10:00:00Z", stage: "01", note: "x" }, { at: "2026-10-30T10:30:00Z", stage: "02", note: "y" }], stages: { "01": { status: "approved", notes: "brief" }, "02": { status: "approved", notes: "concept" } } }));
    writeFileSync(join(ice, "case-study/disclaimer.json"), JSON.stringify({ en: "An unofficial test.", ar: "تجربة غير رسمية." }));
    const out = join(dir, "out");
    const r = spawnSync(process.execPath, [abs("skills/ice-qa/scripts/export-case-study.mjs"), "--project", dir, "--out", out, "--site"], { encoding: "utf8", timeout: 300000 });
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const site = readdirSync(join(out, "site"))[0];
    const listing = JSON.parse(readFileSync(join(out, "site", site, "listing.json"), "utf8"));
    const f = listing.films[0];
    assert.equal(f.src, "media/after-1080.mp4");
    assert.equal(f.before_src, "media/before-1080.mp4");
    assert.equal(f.height, 1920, "the short side is 1080");
    const dur = (p) => Number(spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", join(out, "site", site, p)], { encoding: "utf8" }).stdout);
    assert.ok(Math.abs(dur(f.before_src) - dur(f.src)) < 0.2, "before runs as long as the edit");
    assert.deepEqual(listing.selection.segments, [{ start_s: 1, end_s: 2.5 }, { start_s: 5, end_s: 6.5 }]);
    assert.equal(listing.selection.used_s, 3);
    assert.equal(listing.selection.reason.en, "the clearest contrast");
    assert.equal(listing.source.duration_s, 8);
    assert.equal(listing.prompt.original, "اعمل ريلز");
    assert.equal(listing.prompt.translations.en, "make a reel");
    assert.deepEqual(listing.story.map((s) => [s.stage, s.elapsed]), [["01", "00:00"], ["02", "00:30"]]);
    assert.equal(listing.disclaimer.ar, "تجربة غير رسمية.");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("lessons: auto mode sends every stage as it lands, without a new stop (L39)", () => {
  const st = readText("skills/ice-motion-director/references/state.md");
  assert.match(st, /## Progress in auto mode/);
  assert.match(st, /It never waits for a reply and adds no stop/);
  assert.match(readText("skills/ice-motion-director/SKILL.md"), /As each stage lands, send the user two lines and its stills at once, never waiting on them/);
});

test("lessons: the list names no private research paths (_research/ or notes/)", () => {
  assert.doesNotMatch(readText(LESSONS), /`_research\/|`notes\//);
});

test("lessons: a short or looped music track fails the master unless the cue sheet allows it (L40)", (t) => {
  const has = (c) => spawnSync(c, ["-version"], { stdio: "ignore" }).status === 0;
  const py = findPython();
  if (!py || !has("ffmpeg") || !has("ffprobe")) { t.skip("python, ffmpeg or ffprobe missing"); return; }
  const dir = mkdtempSync(join(tmpdir(), "ice-l40-"));
  try {
    const ff = (args) => spawnSync("ffmpeg", ["-v", "error", "-y", ...args], { encoding: "utf8" });
    ff(["-f", "lavfi", "-i", "color=c=gray:s=160x90:r=25:d=3", "-c:v", "libx264", "-pix_fmt", "yuv420p", join(dir, "film.mp4")]);
    ff(["-f", "lavfi", "-i", "sine=f=220:d=1:r=48000", "-ac", "2", join(dir, "music.wav")]);
    const master = abs("skills/ice-audio/scripts/master_audio.py");
    const run = (...extra) => spawnSync(py[0], [...py.slice(1), master, "--video", join(dir, "film.mp4"), "--out", join(dir, "out.mp4"), "--music", join(dir, "music.wav"), "--no-music-loop", ...extra], { encoding: "utf8", timeout: 300000 });
    const short = run();
    assert.equal(short.status, 1, short.stdout + short.stderr);
    assert.match(short.stderr, /FAIL: the music track is shorter than the film \(it ends before the film\)/);
    const allowed = run("--allow-short-music", "the cue sheet ends the bed at 1 s on purpose");
    assert.match(allowed.stderr, /NOTE: the music track is shorter than the film .*allowed: the cue sheet ends the bed/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("lessons: beat error per cut, halftone and fringe are measured by scripts; news reading text has a contrast floor (L40)", (t) => {
  const py = findPython();
  if (!py) { t.skip("python missing"); return; }
  const code = [
    "import importlib.util as u, json, sys",
    `s = u.spec_from_file_location('sm', r'${abs("skills/ice-audio/scripts/sound_map.py")}'); m = u.module_from_spec(s); s.loader.exec_module(m)`,
    "print(json.dumps(m.beat_error([0, 0.5, 1.0, 1.5], [0.51, 1.2], 25)))",
  ].join("\n");
  const r = spawnSync(py[0], [...py.slice(1), "-c", code], { encoding: "utf8", timeout: 120000 });
  if (r.status !== 0 && /No module named/.test(r.stderr)) { t.skip("numpy or scipy missing"); return; }
  assert.equal(r.status, 0, r.stderr);
  const be = JSON.parse(r.stdout.trim().split("\n").pop());
  assert.equal(be.limit_ms, 40);
  assert.equal(be.pass, false);
  assert.deepEqual(be.off_beat.map((x) => x.t), [1.2]);
  const cg = [
    "import importlib.util as u, json, sys",
    "try:",
    "    import numpy as np, cv2",
    "except ImportError:",
    "    print('SKIP'); sys.exit(0)",
    `sys.path.insert(0, r'${abs("skills/ice-qa/scripts")}')`,
    `s = u.spec_from_file_location('cg', r'${abs("skills/ice-qa/scripts/craft_gate.py")}'); m = u.module_from_spec(s); s.loader.exec_module(m)`,
    "m.load_cv()",
    "h, w = 180, 320",
    "yy, xx = np.mgrid[0:h, 0:w]",
    "dots = (128 + 60 * np.sign(np.sin(xx * 2 * np.pi / 6) * np.sin(yy * 2 * np.pi / 6))).astype(np.uint8)",
    "rgb = np.stack([dots] * 3, -1)",
    "a = m.screen_and_fringe(rgb, dots.astype(np.float32), np.ones((h, w), bool))",
    "rng = np.random.default_rng(1); flat = (128 + rng.normal(0, 4, (h, w))).clip(0, 255).astype(np.uint8)",
    "b = m.screen_and_fringe(np.stack([flat] * 3, -1), flat.astype(np.float32), np.ones((h, w), bool))",
    "edge = np.zeros((h, w), np.uint8); edge[60:120, 130:190] = 220",
    "r_ch = np.zeros_like(edge); r_ch[60:120, 133:193] = 220; b_ch = np.zeros_like(edge); b_ch[60:120, 127:187] = 220",
    "shift = np.stack([r_ch, edge, b_ch], -1)",
    "c = m.screen_and_fringe(shift, edge.astype(np.float32), np.ones((h, w), bool))",
    "print(json.dumps([a, b, c]))",
  ].join("\n");
  const q = spawnSync(py[0], [...py.slice(1), "-c", cg], { encoding: "utf8", timeout: 120000 });
  if ((q.status !== 0 && /No module named/.test(q.stderr)) || q.stdout.trim() === "SKIP") { t.skip("numpy or opencv missing"); return; }
  assert.equal(q.status, 0, q.stderr);
  const [dotted, noise, fringe] = JSON.parse(q.stdout.trim().split("\n").pop());
  assert.ok(dotted.halftone_ratio > 20, `a dot screen reads as a screen (${dotted.halftone_ratio})`);
  assert.ok(noise.halftone_ratio < 20, `plain noise is no screen (${noise.halftone_ratio})`);
  assert.ok(fringe.ca_px >= 2.5 && fringe.ca_px <= 3.5, `a 3 px channel shift reads as about 3 px (${fringe.ca_px})`);
  assert.match(readText("skills/ice-styles/references/family-broadcast-news.md"), /7\.8:1 is the floor for captions, quotes and card text/);
  assert.match(readText("skills/ice-qa/references/audio-gates.md"), /Beat error per cut \(A20\): `python sound_map\.py/);
});
