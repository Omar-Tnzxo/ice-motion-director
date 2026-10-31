// Measured genre playbooks (0.2.8): one playbook per genre in skills/ice-film/references/genres/, measured on a corpus
// of professional films with the plugin's own tools, with a "Genre fingerprint:" line that skills/ice-qa/scripts/
// genre_check.py checks a render against. These tests keep every playbook checkable, keep the film types pointing at
// their playbook, keep the general rules that a genre contradicts scoped (AGENTS.md rule 6) and run the check on fixed
// measures (standard library only). Zero dependencies. Run: node --test tests/
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { abs, findPython, hasCommand, readText } from "./helpers.mjs";

const GENRES = "skills/ice-film/references/genres";
const CHECK = "skills/ice-qa/scripts/genre_check.py";
const PIXEL_KEYS = ["move_onset_lift", "scene_median_s", "cuts_per_10s", "events_per_s", "median_event_gap_s",
  "max_event_gap_s", "hook_events_3s", "sfx_per_min", "move_with_onset", "end_center_dx", "end_center_dy", "end_area",
  "end_bg_std"];
const CODING_KEYS = ["text_reveal", "emphasis_share", "ui_hero", "presses", "hard_cut_share", "end_logo", "end_background",
  "product_first_s", "end_product", "hero_shot_kind", "ground",
  "type_text_share", "type_words_per_line", "type_max_words", "type_only_share",
  "brand_carrier", "brand_shot_median_s", "brand_first_s", "brand_footage_share", "pointer_presses",
  "expl_sentence_change", "expl_words_per_scene", "expl_scene_median_s", "expl_wpm", "expl_text_share",
  "expl_diagram_share", "expl_real_share", "expl_builds",
  "social_hook_word_s", "social_cue_words", "social_caption_y", "social_face_share", "social_ending", "social_cta",
  "social_voice_share"];

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

test("genre playbooks: the explainer route points to its playbook, and the playbook names it", () => {
  has("skills/ice-explainer/SKILL.md", ["references/genres/explainer.md", "genre_check.py check --genre explainer"]);
  has("skills/ice-film/references/film-setup.md", ["`genres/explainer.md`"]);
  has(`${GENRES}/explainer.md`, ["`ice-explainer`", "15 films", "## Rules this genre replaces"]);
});

test("genre playbooks: the general rules the explainer corpus contradicts stay house defaults, scoped by genre", () => {
  // each general rule is still there for every other film, and names the explainer exception
  has("skills/ice-audio/references/voiceover.md", ["Plan budgets at 2.2 to 2.5 wps", "human-voiced English explainer"]);
  has("skills/ice-motion/references/anti-slideshow-and-density.md", ["a new visual element at least every 3 s",
    "Narrated explainers (measured"]);
  has("skills/ice-explainer/references/word-timed-segments.md", ["4 to 15 s", "new counted scene about every sentence"]);
  has("skills/ice-explainer/references/minimal-motion.md", ["no bare cuts", "measured explainer variant"]);
  has("skills/ice-explainer/references/frame-and-text.md", ["A film with zero footage or image shots fails",
    "explained as a mechanism", "plain readable text from frame zero", "vertical and square social cuts"]);
  has("skills/ice-qa/references/motion-density.md", ["| explainer | reading | reading | 0 |"]);
});

test("genre playbooks: explainer ideas the corpus did not confirm are recorded as rejected, never as rules", () => {
  const text = has(`${GENRES}/explainer.md`, ["## Measured and rejected"]);
  const rejected = text.split("## Measured and rejected")[1].split("\n## ")[0];
  for (const idea of ["140 to 160 wpm", "every 3 s", "4 to 15 s", "first frame", "every move", "question"]) {
    assert.ok(rejected.includes(idea), `the rejected list names "${idea}"`);
  }
});

test("genre_check.py: the explainer coding keys read the sentence sample, the voice words and the scenes",
  { skip: !PY && "no Python 3.10+" }, () => {
    const dir = mkdtempSync(join(tmpdir(), "genre-expl-"));
    try {
      const meas = { median_event_gap_s: 0.42, max_event_gap_s: 5.3, events_per_s: 1.4, hook_events_3s: 4,
        scene_median_s: 1.8, cuts_per_10s: 1.8, move_onset_lift: 1.0 };
      const scenes = Array.from({ length: 20 }, (_, i) => ({ start: i * 3, end: i * 3 + 3 }));
      const sample = Array.from({ length: 10 }, (_, i) => ({ t: i * 6, words: "w", picture_change: true }));
      const coding = { scenes, transitions: { hard_cut: 5, push_or_slide: 14 }, end_card: { logo_position: "center" },
        explainer: { sentence_sample: sample, voice_words: 160, wpm: 160, text_on_screen_share: 0.3,
          diagram_scene_share: 0.2, real_material_share: 0.0, builds: { count: 2, max_parts: 4 } } };
      writeFileSync(join(dir, "m.json"), JSON.stringify(meas));
      writeFileSync(join(dir, "c.json"), JSON.stringify(coding));
      const run = () => spawnSync(PY[0], [...PY.slice(1), abs(CHECK), "check", "--genre", "explainer", "--measures",
        join(dir, "m.json"), "--coding", join(dir, "c.json"), "--json"], { encoding: "utf8" });
      const ok = run();
      assert.equal(ok.status, 0, ok.stderr);
      const rows = JSON.parse(ok.stdout).rows;
      assert.equal(rows.expl_sentence_change.value, 1.0);
      assert.equal(rows.expl_words_per_scene.value, 8.0);
      assert.equal(rows.expl_scene_median_s.value, 3.0);
      // a slideshow: one picture per 40 words, half the sentences with no change
      coding.scenes = Array.from({ length: 4 }, (_, i) => ({ start: i * 15, end: i * 15 + 15 }));
      coding.explainer.sentence_sample = sample.map((s, i) => ({ ...s, picture_change: i % 2 === 0 }));
      writeFileSync(join(dir, "c.json"), JSON.stringify(coding));
      assert.equal(run().status, 2, "three explainer keys outside the fingerprint are red");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

test("genre playbooks: the brand film type points to its playbook, and the playbook names it", () => {
  has("skills/ice-film/references/film-types/brand-film.md", ["`../genres/brand-film.md`", "Word-led by default"]);
  has(`${GENRES}/brand-film.md`, ["`brand-film`", "14 films", "events_per_s >=1.0", "max_event_gap_s <=7.5"]);
  has("skills/ice-film/references/film-setup.md", ["`genres/brand-film.md` for brand films"]);
});

test("genre playbooks: the general rules the brand film corpus contradicts stay house defaults, scoped by genre", () => {
  has("skills/ice-film/references/film-types/brand-film.md", ["Motion-led brand films (designed animation over most of the runtime): nearly every transition turns the current object into the next one",
    "Filmed brand films cut hard", "Manifesto lines land whole"]);
  has("skills/ice-motion/references/anti-slideshow-and-density.md", ["| Still frames | at least about 25 percent dead still", "Brand film: a designed quiet beat once"]);
  has("skills/ice-film/references/openers-and-endings.md", ["End on an action of the hero or the main object", "Brand film genre (`genres/brand-film.md`)"]);
  has("skills/ice-audio/SKILL.md", ["gentle -16 for calm films; social -14 for brand anthems and montages"]);
  const rejected = readText(`${GENRES}/brand-film.md`).split("## Measured and rejected")[1].split("\n## ")[0];
  for (const idea of ["Music-led by default", "Nearly every transition", "word by word", "25 percent of the film dead still", "End on an action"]) {
    assert.ok(rejected.includes(idea), `the brand film rejected list names "${idea}"`);
  }
});

test("genre_check.py: the brand coding keys read the coding sheet's brand block",
  { skip: !PY && "no Python 3.10+" }, () => {
    const dir = mkdtempSync(join(tmpdir(), "genre-brand-"));
    try {
      const meas = { median_event_gap_s: 0.42, max_event_gap_s: 4.75, events_per_s: 1.7, hook_events_3s: 7,
        scene_median_s: 1.1, cuts_per_10s: 1.0, move_onset_lift: 1.0 };
      const coding = { transitions: { hard_cut: 9, morph_or_match: 1 }, end_card: { logo_position: "center", background: "plain-solid" },
        brand: { carrier: "voice", shot_len: { median_s: 1.33 }, brand_first: { any_s: 10.0 },
          material_share: { live_action: 0.8, archive_or_ugc: 0.1, motion_or_animation: 0.1 } } };
      writeFileSync(join(dir, "m.json"), JSON.stringify(meas));
      writeFileSync(join(dir, "c.json"), JSON.stringify(coding));
      const run = () => spawnSync(PY[0], [...PY.slice(1), abs(CHECK), "check", "--genre", "brand-film", "--measures", join(dir, "m.json"),
        "--coding", join(dir, "c.json"), "--json"], { encoding: "utf8" });
      const ok = run();
      assert.equal(ok.status, 0, ok.stderr);
      const rows = JSON.parse(ok.stdout).rows;
      assert.equal(rows.brand_carrier.value, "voice");
      assert.equal(rows.brand_footage_share.value, 0.9);
      meas.events_per_s = 0.5;
      meas.max_event_gap_s = 12;
      writeFileSync(join(dir, "m.json"), JSON.stringify(meas));
      assert.equal(run().status, 2, "two gated brand film keys outside the fingerprint are red");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

test("genre playbooks: the UI coding sheet says which lines are text, when the end card starts, and that a shown pointer presses", () => {
  has(`${GENRES}/ui-motion.md`, ["headline and body copy only", "`start_s` (when the end card appears", "pointer_presses >=1",
    "--reference-measures", "every one of the 9 films that shows a pointer presses with it"]);
  has("skills/ice-film/references/film-types/ui-walkthrough.md", ["a cursor clicks real element centres with a press and release"]);
  has("skills/ice-film/references/film-setup.md", ["`--reference-measures` and `--reference-coding`"]);
});

test("genre_check.py: the gaps stop at the end card, a pointer that never presses is red, a reference's values gate a remake",
  { skip: !PY && "no Python 3.10+" }, () => {
    const dir = mkdtempSync(join(tmpdir(), "genre-ref-"));
    try {
      // events every 0.5 s up to 31 s, then a 7.8 s held end card: the whole-film longest gap is the card
      const events = Array.from({ length: 62 }, (_, i) => +(i * 0.5).toFixed(2));
      const film = { duration_s: 38.8, events_s: events, events_per_s: 1.6, median_event_gap_s: 0.5, max_event_gap_s: 8.3,
        scene_median_s: 1.0, cuts_per_10s: 1.3, hook_events_3s: 6 };
      const coding = { text: { dominant_reveal: "word_by_word", lines_total: 9, lines_with_emphasis_colour: 2 },
        hero: { ui_parts_hero: true }, interaction: { presses: 3, pointer: "cursor" },
        end_card: { start_s: 31.0, logo_position: "center", background: "plain-solid" } };
      const w = (name, obj) => { writeFileSync(join(dir, name), JSON.stringify(obj)); return join(dir, name); };
      const run = (...a) => spawnSync(PY[0], [...PY.slice(1), abs(CHECK), "check", "--genre", "ui-motion", ...a, "--json"],
        { encoding: "utf8", timeout: 60000 });
      const ok = run("--measures", w("f.json", film), "--coding", w("c.json", coding));
      assert.equal(ok.status, 0, ok.stdout + ok.stderr);
      const rows = JSON.parse(ok.stdout).rows;
      assert.equal(rows.max_event_gap_s.value, 0.5, "the held end card is not a body gap");
      assert.equal(rows.max_event_gap_s.light, "green");
      // a cursor rides along while UI parts change by themselves: red even though one miss is allowed
      const ride = run("--measures", join(dir, "f.json"), "--coding", w("r.json", { ...coding, interaction: { presses: 0, pointer: "cursor" } }));
      assert.equal(ride.status, 2, "a shown pointer with no press is red: " + ride.stdout);
      assert.deepEqual(JSON.parse(ride.stdout).red, ["pointer_presses"]);
      const none = run("--measures", join(dir, "f.json"), "--coding", w("n.json", { ...coding, interaction: { presses: 0, pointer: "none" } }));
      assert.equal(none.status, 0, "a film with no pointer has nothing to press with");
      // reference mode: the reference's values win, the genre line is printed beside them
      // a calm reference: an event every 1.25 s, slower than the genre line on two keys
      const slow = Array.from({ length: 25 }, (_, i) => +(i * 1.25).toFixed(2));
      const ref = { ...film, events_s: slow, events_per_s: 0.8 };
      const calm = { ...film, events_s: slow, events_per_s: 0.8 };
      const g = run("--measures", w("calm.json", calm), "--coding", join(dir, "c.json"));
      assert.equal(g.status, 2, "a calm film is red on the genre line");
      const rm = run("--measures", join(dir, "calm.json"), "--coding", join(dir, "c.json"),
        "--reference-measures", w("ref.json", ref), "--reference-coding", join(dir, "c.json"));
      assert.equal(rm.status, 0, "the same film passes against the calm reference it follows: " + rm.stdout);
      const rj = JSON.parse(rm.stdout);
      assert.equal(rj.reference, true);
      assert.equal(rj.rows.events_per_s.genre_light, "red");
      assert.equal(rj.rows.events_per_s.reference, 0.8);
      const fewer = run("--measures", join(dir, "f.json"), "--coding", join(dir, "n.json"),
        "--reference-measures", join(dir, "ref.json"), "--reference-coding", join(dir, "c.json"));
      assert.ok(JSON.parse(fewer.stdout).misses.includes("presses"), "a remake with no press where its reference presses 3 times misses");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

test("genre playbooks: the hype promo type points to its playbook, and the playbook names it", () => {
  has("skills/ice-film/references/film-types/hype-promo.md", ["`../genres/hype-promo.md`", "Beat-cut montage (measured variant A"]);
  has(`${GENRES}/hype-promo.md`, ["`hype-promo`", "14 films", "events_per_s >=1.8", "## Flashes and safety"]);
  has("skills/ice-film/references/film-setup.md", ["`genres/hype-promo.md` for hype promos"]);
});

test("genre playbooks: the general rules the hype promo corpus contradicts stay house defaults, scoped by genre", () => {
  has("skills/ice-film/references/film-types/hype-promo.md", ["A hard cut between scenes only on a downbeat, at most twice",
    "Footage or game-render hype (the measured genre", "Every cut, flash and invert within 2 frames of a grid line"]);
  has("skills/ice-audio/references/sfx.md", ["Hype promo genre (`ice-film` skill, `references/genres/hype-promo.md`)",
    "Default ceiling: about 15 events per minute", "One signature riser and one signature impact per film"]);
  has("skills/ice-motion/references/holds-and-stillness.md", ["0.6-1.4 s, and the whole CTA beat at most 25 percent",
    "hype promo: the measured genre holds its close 1.5 to 6 s"]);
  has("skills/ice-qa/references/motion-density.md", ["| hype promo | 6.1 | reading | 8 |", "| product launch | 1.4 |"]);
  // the flash safety limit is never lifted by the genre
  has(`${GENRES}/hype-promo.md`, ["strobe safe mode stays absolute"]);
});

test("genre playbooks: hype promo ideas the corpus did not confirm are recorded as rejected, never as rules", () => {
  const text = has(`${GENRES}/hype-promo.md`, ["## Measured and rejected"]);
  const rejected = text.split("## Measured and rejected")[1].split("\n## ")[0];
  for (const idea of ["Runtime 10 to 20 s", "Every cut within 2 frames of a beat", "Scenes of 1.5 to 3 s",
    "hard cuts at most twice", "About 15 sound effects per minute", "An end hold of 0.6 to 1.4 s"]) {
    assert.ok(rejected.includes(idea), `the hype promo rejected list names "${idea}"`);
  }
});

test("genre playbooks: the social short type points to its playbook, and the playbook names it", () => {
  has("skills/ice-film/references/film-types/social-short.md", ["`../genres/social-short.md`", "max_event_gap_s 4.5"]);
  has(`${GENRES}/social-short.md`, ["`social-short`", "`shorts-reels`", "14 shorts", "social_hook_word_s <=1.5"]);
  has("skills/ice-film/references/film-setup.md", ["`genres/social-short.md` for social shorts"]);
  has("skills/ice-edit/references/edit-types/shorts-reels.md", ["`references/genres/social-short.md` variant A"]);
});

test("genre playbooks: the general rules the social short corpus contradicts stay house defaults, scoped by genre", () => {
  has("skills/ice-type/references/captions-system.md", ["Color on 25 to 45% of chunks in color-coded social styles",
    "Social short genre (the `ice-film` skill, `references/genres/social-short.md`)"]);
  has("skills/ice-film/references/openers-and-endings.md", ["Logo plus CTA stacked in the centre only when the brief asks for an explicit CTA.",
    "Social short genre (`genres/social-short.md`)"]);
  has("skills/ice-type/references/sizes-and-scale.md", ["| Vertical 1080 x 1920 | 65 to 95 (caption cap height 3.5 to 5%) | 130 to 170 |",
    "Vertical social short genre, measured"]);
  has("skills/ice-type/SKILL.md", ["captions at least 4.5% of the frame height in font size",
    "social short genre: a caption cap height of at least 2% of the full frame height"]);
  const rejected = readText(`${GENRES}/social-short.md`).split("## Measured and rejected")[1].split("\n## ")[0];
  for (const idea of ["A question works better than a statement", "Colour on 25 to 45 percent", "The payoff in the 22 to 27 s",
    "No gap between visual events over 2.5 s", "Seamless replay loop"]) {
    assert.ok(rejected.includes(idea), `the social short rejected list names "${idea}"`);
  }
});

test("genre_check.py: the social coding keys read the coding sheet's social block",
  { skip: !PY && "no Python 3.10+" }, () => {
    const dir = mkdtempSync(join(tmpdir(), "genre-social-"));
    try {
      const meas = { median_event_gap_s: 0.42, max_event_gap_s: 1.6, events_per_s: 1.7, hook_events_3s: 6,
        scene_median_s: 1.5, cuts_per_10s: 1.1, move_onset_lift: 1.0 };
      const coding = { social: { hook_1s: { first_word_s: 0.4, first_text_s: 1.2 },
        captions: { kind: "word-captions", words_per_cue_median: 2, y_center_share: 0.68 }, face: { share_of_runtime: 0.8 },
        voice: { share_of_runtime: 0.6 }, loop: { ending: "hard-stop" }, cta: { present: false } } };
      writeFileSync(join(dir, "m.json"), JSON.stringify(meas));
      const run = () => {
        writeFileSync(join(dir, "c.json"), JSON.stringify(coding));
        return spawnSync(PY[0], [...PY.slice(1), abs(CHECK), "check", "--genre", "social-short", "--measures", join(dir, "m.json"),
          "--coding", join(dir, "c.json"), "--json"], { encoding: "utf8" });
      };
      const ok = run();
      assert.equal(ok.status, 0, ok.stderr);
      const rows = JSON.parse(ok.stdout).rows;
      assert.equal(rows.social_hook_word_s.value, 0.4);
      assert.equal(rows.social_cue_words.value, 2);
      assert.equal(rows.social_caption_y.value, 0.68);
      coding.social.captions = { kind: "none" };
      assert.equal(JSON.parse(run().stdout).rows.social_cue_words.value, 0, "a short without captions passes the cue key");
      coding.social.hook_1s = { first_word_s: null, first_text_s: 3.0 };
      coding.social.captions = { kind: "word-captions", words_per_cue_median: 6 };
      assert.equal(run().status, 2, "a late first line and long caption cues are red");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

// The cut detector reads hard cuts at the video's own frame rate. The 12 fps histogram test it replaced read 0.81 cuts
// per 10 s on a 720p hype promo with 17.2: shots graded alike keep the same histogram across a cut.
const HAS_NUMPY = Boolean(PY) && spawnSync(PY[0], [...PY.slice(1), "-c", "import numpy"], { encoding: "utf8" }).status === 0;
test("genre_check.py measure: hard cuts between shots graded alike are found at the frame rate, a flash is not a cut",
  { skip: !(HAS_NUMPY && hasCommand("ffmpeg") && hasCommand("ffprobe")) && "numpy, ffmpeg or ffprobe missing" }, () => {
    const dir = mkdtempSync(join(tmpdir(), "genre-cuts-"));
    try {
      // 720p at 24 fps: 14 shots of 10 frames, a ramp and its mirror (the same histogram), a white flash at frame 25
      const video = join(dir, "cuts.mp4");
      const ff = spawnSync("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i",
        "color=c=black:s=1280x720:r=24,format=gray,geq=lum='if(eq(N,25),255,if(lt(mod(floor(N/10),2),1),X*255/W,255-X*255/W))'",
        "-frames:v", "140", "-c:v", "libx264", "-pix_fmt", "yuv420p", video], { encoding: "utf8" });
      assert.equal(ff.status, 0, ff.stderr);
      const out = join(dir, "m.json");
      const r = spawnSync(PY[0], [...PY.slice(1), abs(CHECK), "measure", video, "--out", out], { encoding: "utf8" });
      assert.equal(r.status, 0, r.stderr);
      const m = JSON.parse(readFileSync(out, "utf8"));
      assert.equal(m.hard_cuts_s.length, 13, `13 cuts expected, found ${JSON.stringify(m.hard_cuts_s)}`);
      assert.ok(!m.hard_cuts_s.some((t) => t > 0.9 && t < 1.2), "the one-frame flash at 1.04 s is not a cut");
      assert.ok(m.cuts_per_10s > 20, `cuts_per_10s ${m.cuts_per_10s}`);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
