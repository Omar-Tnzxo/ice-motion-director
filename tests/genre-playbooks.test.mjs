// Measured genre playbooks (0.2.8): one playbook per genre in skills/ice-film/references/genres/, measured on a corpus
// of professional films with the plugin's own tools, with a "Genre fingerprint:" line that skills/ice-qa/scripts/
// genre_check.py checks a render against. These tests keep every playbook checkable, keep the film types pointing at
// their playbook, keep the general rules that a genre contradicts scoped (AGENTS.md rule 6) and run the check on fixed
// measures (standard library only). Zero dependencies. Run: node --test tests/
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { abs, findPython, readText } from "./helpers.mjs";

const GENRES = "skills/ice-film/references/genres";
const CHECK = "skills/ice-qa/scripts/genre_check.py";
const PIXEL_KEYS = ["move_onset_lift", "scene_median_s", "cuts_per_10s", "events_per_s", "median_event_gap_s",
  "max_event_gap_s", "hook_events_3s", "sfx_per_min", "move_with_onset", "end_center_dx", "end_center_dy", "end_area",
  "end_bg_std"];
const CODING_KEYS = ["text_reveal", "emphasis_share", "ui_hero", "presses", "hard_cut_share", "end_logo", "end_background",
  "product_first_s", "end_product", "hero_shot_kind", "ground",
  "type_text_share", "type_words_per_line", "type_max_words", "type_only_share"];

function has(relPath, phrases) {
  const text = readText(relPath);
  for (const p of phrases) assert.ok(text.includes(p), `${relPath} lost: "${p}"`);
  return text;
}

const playbooks = () => readdirSync(abs(GENRES)).filter((f) => f.endsWith(".md"));

test("genre playbooks: every playbook has one fingerprint line whose keys genre_check.py knows", () => {
  const files = playbooks();
  assert.ok(files.includes("ui-motion.md"), "the UI and app motion playbook exists");
  for (const f of files) {
    const text = readText(`${GENRES}/${f}`);
    const lines = text.split("\n").filter((l) => l.startsWith("Genre fingerprint:"));
    assert.equal(lines.length, 1, `${f}: exactly one "Genre fingerprint:" line`);
    for (const clause of lines[0].slice("Genre fingerprint:".length).replace(/\.\s*$/, "").split(";")) {
      const key = clause.trim().split(/\s+/)[0];
      assert.ok(PIXEL_KEYS.includes(key) || CODING_KEYS.includes(key) || key === "misses_allowed", `${f}: unknown fingerprint key "${key}"`);
    }
    for (const section of ["## Scope", "## Corpus", "## Conventions", "## Options", "## Measured and rejected",
      "## Coding sheet", "## Fingerprint"]) assert.ok(text.includes(section), `${f} lost the section "${section}"`);
  }
});

test("genre playbooks: the UI film types point to the UI motion playbook, and the playbook names them", () => {
  for (const t of ["app-ad", "product-launch", "ui-walkthrough"]) {
    has(`skills/ice-film/references/film-types/${t}.md`, ["`../genres/ui-motion.md`"]);
  }
  has(`${GENRES}/ui-motion.md`, ["`app-ad`", "`product-launch`", "`ui-walkthrough`", "15 films"]);
  has("skills/ice-film/SKILL.md", ["references/genres/<genre>.md"]);
  has("skills/ice-film/references/film-setup.md", ["Measured genre playbooks: `genres/<genre>.md`"]);
  has("skills/ice-film/references/film-setup.md", ["Measured genre playbooks: `genres/<genre>.md`"]);
  has("skills/ice-qa/SKILL.md", ["scripts/genre_check.py"]);
});

test("genre playbooks: the two general rules the UI corpus contradicts stay house defaults, scoped by genre", () => {
  has("skills/ice-audio/references/sfx.md", ["UI and app motion genre (`ice-film` skill, `references/genres/ui-motion.md`)"]);
  has("skills/ice-film/references/launch-principles.md", ["UI and app motion genre (`genres/ui-motion.md`)"]);
  // the general rules themselves are still there for every other film
  has("skills/ice-audio/references/sfx.md", ["Never under every motion", "Default ceiling: about 15 events per minute"]);
  has("skills/ice-film/references/launch-principles.md", ["a logo that only appears at the end as a sticker is wasted"]);
});

test("genre playbooks: Omar's hypotheses the corpus did not confirm are recorded as rejected, never as rules", () => {
  const text = has(`${GENRES}/ui-motion.md`, ["## Measured and rejected"]);
  const rejected = text.split("## Measured and rejected")[1].split("\n## ")[0];
  for (const idea of ["120 to 126 BPM", "click on every move", "word by word"]) {
    assert.ok(rejected.includes(idea), `the rejected list names "${idea}"`);
  }
});

test("genre playbooks: the physical product film types point to the product launch playbook, and it names them", () => {
  has("skills/ice-film/references/film-types/product-launch.md", ["`../genres/product-launch.md`"]);
  has("skills/ice-film/references/film-types/hype-promo.md", ["`../genres/product-launch.md`"]);
  has(`${GENRES}/product-launch.md`, ["`product-launch`", "`hype-promo`", "15 films", "Closing packshot"]);
  has(`${GENRES}/ui-motion.md`, ["`product-launch.md`"]);
});

test("genre playbooks: the general rules the product corpus contradicts stay house defaults, scoped by genre", () => {
  has("skills/ice-motion/references/transition-policy.md", ["Product launch without screens (`ice-film` skill, `references/genres/product-launch.md`)",
    "Crossfades banned between scenes by default", "a light sweep over chrome"]);
  has("skills/ice-audio/references/sfx.md", ["Product launch without screens genre (`ice-film` skill, `references/genres/product-launch.md`)",
    "Default ceiling: about 15 events per minute"]);
  has("skills/ice-film/references/openers-and-endings.md", ["Product launch without screens genre (`genres/product-launch.md`)",
    "not a centred quote card"]);
  has("skills/ice-film/references/film-types/hype-promo.md", ["A hard cut between scenes only on a downbeat, at most twice",
    "`../genres/product-launch.md`"]);
});

test("genre playbooks: product launch ideas the corpus did not confirm are recorded as rejected, never as rules", () => {
  const text = has(`${GENRES}/product-launch.md`, ["## Measured and rejected"]);
  const rejected = text.split("## Measured and rejected")[1].split("\n## ")[0];
  for (const idea of ["2.5 to 3 s", "120 to 126 BPM", "sound on every move", "Carried transitions", "8 to 10 s"]) {
    assert.ok(rejected.includes(idea), `the rejected list names "${idea}"`);
  }
});

const PY = findPython();
test("genre_check.py: a film inside the fingerprint is green, one outside is red, a coding key without a sheet is yellow",
  { skip: !PY && "no Python 3.10+" }, () => {
    const dir = mkdtempSync(join(tmpdir(), "genre-"));
    try {
      const fp = readText(`${GENRES}/ui-motion.md`).split("\n").find((l) => l.startsWith("Genre fingerprint:"));
      const good = { scene_median_s: 1.5, cuts_per_10s: 1.5, events_per_s: 1.5, median_event_gap_s: 0.4,
        max_event_gap_s: 3.0, hook_events_3s: 7, sfx_per_min: 150, move_with_onset: 0.5, move_onset_lift: 1.0,
        end_center_dx: 0.0, end_center_dy: 0.0, end_area: 0.02, end_bg_std: 0.8 };
      const coding = { text: { dominant_reveal: "line", lines_total: 6, lines_with_emphasis_colour: 0 },
        hero: { ui_parts_hero: true }, interaction: { presses: 2 },
        transitions: { hard_cut: 3, morph_or_match: 3, scale_through: 1, push_or_slide: 0, camera_move_through: 0,
          dissolve: 0, other: 0, dominant: "morph" }, end_card: { logo_position: "center", background: "plain-solid" } };
      writeFileSync(join(dir, "good.json"), JSON.stringify(good));
      writeFileSync(join(dir, "coding.json"), JSON.stringify(coding));
      writeFileSync(join(dir, "slow.json"), JSON.stringify({ ...good, events_per_s: 0.3, max_event_gap_s: 12 }));
      const run = (...a) => spawnSync(PY[0], [...PY.slice(1), abs(CHECK), "check", "--genre", "ui-motion", ...a, "--json"],
        { encoding: "utf8", timeout: 60000 });
      const g = run("--measures", join(dir, "good.json"), "--coding", join(dir, "coding.json"));
      assert.equal(g.status, 0, g.stderr + g.stdout);
      const gj = JSON.parse(g.stdout);
      assert.deepEqual(gj.red, [], `green film has no red: ${g.stdout}`);
      assert.ok(gj.line.startsWith("Genre fingerprint:") && gj.line === fp.trim());
      const s = run("--measures", join(dir, "slow.json"), "--coding", join(dir, "coding.json"));
      assert.equal(s.status, 2, "a slideshow-paced film is red");
      assert.ok(JSON.parse(s.stdout).red.includes("events_per_s"));
      const ex = run("--measures", join(dir, "slow.json"), "--coding", join(dir, "coding.json"),
        "--exempt", "events_per_s=reference: the user's reference runs calm", "--exempt", "max_event_gap_s=reference");
      assert.equal(ex.status, 0, "an exemption row from a reference lifts the key: " + ex.stdout);
      const nc = run("--measures", join(dir, "good.json"));
      assert.equal(nc.status, 0);
      const ncj = JSON.parse(nc.stdout);
      assert.equal(ncj.rows.ui_hero.light, "yellow", "a coding key with no coding sheet is yellow, never green");
      const bad = spawnSync(PY[0], [...PY.slice(1), abs(CHECK), "check", "--genre", "no-such-genre", "--measures",
        join(dir, "good.json")], { encoding: "utf8" });
      assert.equal(bad.status, 1, "an unknown genre is bad input");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

test("genre playbooks: the kinetic type film type points to its playbook, and the playbook names it", () => {
  has("skills/ice-film/references/film-types/kinetic-type.md", ["`../genres/kinetic-type.md`"]);
  has(`${GENRES}/kinetic-type.md`, ["`kinetic-type`", "11 films", "type_text_share >=0.5"]);
});

test("genre playbooks: the general rules the kinetic type corpus contradicts stay house defaults, scoped by genre", () => {
  has("skills/ice-type/references/type-system.md", ["one highlight shape per video", "Kinetic type films are the measured exception"]);
  has("skills/ice-direction/references/type-pairing.md", ["| Serif plus sans, never two sans | Title-led films without a brand face: art film, industry spot |"]);
  has("skills/ice-qa/references/motion-density.md", ["| kinetic type | reading | reading | 0 |", "| product launch | 1.4 |"]);
  has("skills/ice-motion/references/anti-slideshow-and-density.md", ["nothing still longer than about 1 s unintentionally", "Kinetic type: a landed line holds still"]);
  const rejected = readText(`${GENRES}/kinetic-type.md`).split("## Measured and rejected")[1].split("\n## ")[0];
  for (const idea of ["5 words on screen", "One highlight form", "Serif plus sans", "1.4 s"]) {
    assert.ok(rejected.includes(idea), `the kinetic type rejected list names "${idea}"`);
  }
});

test("genre_check.py: the type coding keys read the coding sheet's type block",
  { skip: !PY && "no Python 3.10+" }, () => {
    const dir = mkdtempSync(join(tmpdir(), "genre-type-"));
    try {
      const meas = { median_event_gap_s: 0.33, max_event_gap_s: 3.0, events_per_s: 1.6, hook_events_3s: 6,
        scene_median_s: 1.5, cuts_per_10s: 1.0, move_onset_lift: 1.0, end_center_dx: 0.0 };
      const coding = { text: { dominant_reveal: "word_by_word" }, transitions: { hard_cut: 1, push_or_slide: 3 },
        end_card: { logo_position: "center", background: "plain-solid" },
        type: { text_on_screen_share: 0.8, words_per_line_median: 2, max_words_on_screen: 6, type_only_share: 0.5 } };
      writeFileSync(join(dir, "m.json"), JSON.stringify(meas));
      writeFileSync(join(dir, "c.json"), JSON.stringify(coding));
      const ok = spawnSync(PY[0], [...PY.slice(1), abs(CHECK), "check", "--genre", "kinetic-type", "--measures", join(dir, "m.json"),
        "--coding", join(dir, "c.json"), "--json"], { encoding: "utf8" });
      assert.equal(ok.status, 0, ok.stderr);
      assert.equal(JSON.parse(ok.stdout).rows.type_text_share.value, 0.8);
      coding.type.text_on_screen_share = 0.2;
      coding.type.words_per_line_median = 9;
      writeFileSync(join(dir, "c.json"), JSON.stringify(coding));
      const bad = spawnSync(PY[0], [...PY.slice(1), abs(CHECK), "check", "--genre", "kinetic-type", "--measures", join(dir, "m.json"),
        "--coding", join(dir, "c.json"), "--json"], { encoding: "utf8" });
      assert.equal(bad.status, 2, "two type keys outside the fingerprint are red");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
