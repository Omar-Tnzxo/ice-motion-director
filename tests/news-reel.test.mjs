// The news reel (0.2.4): the measured broadcast news style, its edit type and the scoped exceptions that let it pass QA.
// Each test names the canonical home of one part and the phrases a weak agent needs to find there; the scope lines
// keep every older rule in place for the other film types (AGENTS.md rules 6 and 7). Zero dependencies.
// Run: node --test tests/
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "node:test";
import { abs, findPython, readText } from "./helpers.mjs";

const SCOPE = "News reel (edit type `news-reel`, style family `family-broadcast-news.md`)";

function has(relPath, phrases) {
  const text = readText(relPath);
  for (const p of phrases) assert.ok(text.includes(p), `${relPath} lost: "${p}"`);
  return text;
}

test("news reel: the style family holds the genre, three measured packages, sub-brands and the glass studio reel", () => {
  const text = has("skills/ice-styles/references/family-broadcast-news.md", [
    "## 1. Presenter news reel (the genre)", "### 1.2 The colour-role contract",
    "### 2.1 Al Jazeera Arabic shorts (talk-show promo package)", "### 2.2 Al Jazeera English (explainer reel package)",
    "### 2.3 Mohawalat Fahm on Al Jazeera 360 (explainer promo package)", "## 3. Sub-brand patterns",
    "## 4. Glass studio reel", "## 5. Never copy", "Package id `mohawalat-fahm-promo`",
    "They are used as they are only when the stage 01 `identity` slot is \"as they are\" or \"a mix\"",
    "A package is never a default look for an unrelated request"]);
  assert.equal(text.split("**With the user's identity.**").length - 1, 3, "each package says what the user's identity replaces");
  assert.doesNotMatch(text, /[؀-ۿ]/, "no Arabic copy from the reels is reproduced");
  has("skills/ice-styles/SKILL.md", ["| News reel (presenter-led news or explainer reel, edit type `news-reel`) |", "family-broadcast-news.md"]);
  has("skills/ice-styles/references/catalog-index.md", ["family-broadcast-news.md"]);
});

test("news reel: colour roles, glass and the end card are scoped where the general rules live", () => {
  has("skills/ice-direction/references/color.md", ["2 to 5 named role colours are allowed, each with one job",
    "is a plate reaction, not a ground change"]);
  has("skills/ice-direction/references/anti-sameness.md", ["closeness to that reference is the remake mode's contract"]);
  has("skills/ice-styles/references/directions-openers-explainers.md", ["Visual journalism keeps red for warnings only.",
    "Glass is allowed in a launch only when the brand's own UI uses it."]);
  has("skills/ice-explainer/references/card-library.md", ["| Bullet card that grows per spoken bullet |", "| \"Day N\" archive title |"]);
  has("skills/ice-explainer/references/semantic-tagging.md", ["Write `opening question` or `follow-up question` in `need`"]);
  has("skills/ice-film/references/openers-and-endings.md", ["| News reel branded end card (edit type `news-reel`) |"]);
});

test("news reel: the edit type, its routing and the matte kit, with the house numbers scoped", () => {
  has("skills/ice-edit/references/edit-types/news-reel.md", ["Stage order: 01 03 02 04 06 05 [07 08a] 08b 09 10",
    "## 1. When this type applies", "## 3. Rhythm", "## 4. Archive burst", "## 5. From a long episode to a reel",
    "## 6. Rules this type replaces", "A candidate under 5 on C2 or C5 is dropped whatever its total",
    "9-11 f (0.36-0.44 s) after the naming noun ends"]);
  has("skills/ice-edit/SKILL.md", ["references/edit-types/news-reel.md"]);
  has("skills/ice-motion-director/references/classify.md", ["edit type `news-reel`"]);
  has("skills/ice-motion-director/references/routes.md", ["shorts and reels, news reel, B-roll overlay"]);
  has("skills/ice-edit/references/layers-and-isolation.md", ["## 3b. Programme matte kit",
    "The depth sandwich is the layout, not a peak", "the cap is the measured or stated count"]);
  has("skills/ice-edit/references/ingest-and-ledger.md", ["### Shooting for a news reel", "about 2.5 to 3 m in front of the wall"]);
  has("skills/ice-edit/references/broll-and-motion-broll.md", ["### News reel B-roll treatments", "| CTA desaturation (news reel) |"]);
  has("skills/ice-edit/references/vertical-conversion.md", ["| Split (news reel) |"]);
  has("skills/ice-ideas/references/hooks-and-openers.md", ["News reel cold open (image and headline beats)"]);
  for (const f of ["house-style-numbers.md", "edit-types/shorts-reels.md", "edit-types/talking-head-ad.md"]) {
    has(`skills/ice-edit/references/${f}`, [SCOPE]);
  }
});

test("news reel: camera, broadcast moves, transitions and curves carry their measured values", () => {
  has("skills/ice-motion/references/camera.md", ["## 8. Digital camera on one take (news reel)", "Moves per minute | 15.8-27.8",
    "Tag every element `layer: rig` or `layer: screen`", "start at about 2.1x (2.05-2.10x) and pull out to 1.0 over 26-28 f",
    "Punch-out 260 to 100 percent in 24 f"]);
  has("skills/ice-motion/references/atomic-moves.md", ["## 7. Broadcast news moves", "| Glow disc |", "orbits 1.4 turns in 77 f",
    "period 7 px, 45 percent of each period cut", "radius 20, 60, 180 and 540 px", "collapse toward its right end in 6-8 f"]);
  has("skills/ice-motion/references/cut-catalog.md", ["## 13. Broadcast transitions", "| Screen glitch clip |",
    "opacity 100, 50, 100, 0 on keys 3 f apart"]);
  has("skills/ice-motion/references/springs-and-curves.md", ["## 7. Broadcast settle", "**Two-null overlap (a move never stops).**"]);
  has("skills/ice-motion/references/timing-and-easing.md", ["| Measured broadcast exceptions |"]);
  has("skills/ice-motion/references/measured-motion.md", ["| Presenter after a cut back (news reel) |"]);
});

test("news reel: broadcast text, captions, keyword mode and kashida blocks are scoped mask reveals", () => {
  has("skills/ice-type/references/type-effects-specs.md", ["## Broadcast text", "| Pointer reveal (RTL) |",
    "Only the mask moves: no fade, no blur, no per-letter state", "Built as a mask reveal on a pre-shaped line",
    "Steps, never a tween", "the reason is legibility, never garnish",
    "The first on-screen appearance of a person who speaks on screen"]);
  has("skills/ice-type/references/kinetic-type.md", ["are mask reveals, not typing"]);
  has("skills/ice-type/references/caption-styles.md", ["| News sentence captions |", "The hue marks whose voice is heard, not quotation"]);
  has("skills/ice-type/references/captions-system.md", ["## 3b. Keyword mode", "About 27 to 29 percent of the spoken words",
    "is for titles and keyword text, never for captions"]);
  has("skills/ice-type/references/caption-timing-and-truth.md", ["Broadcast text leads and lags"]);
  has("skills/ice-type/references/sizes-and-scale.md", ["smallest scale the digital camera reaches"]);
  has("skills/ice-arabic/references/kashida.md", ["| Justified display block (news reel) |", "## 4b. Justified display blocks",
    "## 4c. Hollow kashida", "at most one stretch per word"]);
  has("skills/ice-arabic/SKILL.md", ["| Justified display block (news reel) |"]);
  has("skills/ice-arabic/references/letterforms-in-motion.md", ["| Typewriter with a coloured head on a pre-shaped line |",
    "or the chosen broadcast package names it"]);
  has("skills/ice-arabic/references/fonts-and-shaping.md", ["**Stroke contrast.**", "matched the Tajawal design within 0.1 to 4 percent"]);
  has("skills/ice-arabic/references/safe-zones-rtl.md", ["Which top zone governs", "a 288 px top margin"]);
  has("skills/ice-arabic/references/arabic-captions.md", ["Red-to-white change"]);
});

test("news reel: sound by the numbers, strobe safe by default, sources and engine routes", () => {
  has("skills/ice-audio/references/mix-and-master.md", ["| News reel, speech-led |", "**News reel, speech-led (numbers).**",
    "**News reel build chain (recorded SFX only).**"]);
  has("skills/ice-audio/references/sfx.md", ["## 3b. Broadcast SFX by move", "Sound NEVER list (news reel):",
    "Ends 1 to 2 f (0.04 to 0.08 s) before the cut"]);
  has("skills/ice-audio/references/cue-map-and-beat-sync.md", ["**Strobe safe mode for archive bursts and flashes",
    "Faithful mode (the reference's own strobe, frame for frame)"]);
  has("skills/ice-audio/references/music-choice-and-licensing.md", ["## 4b. News reel music"]);
  has("skills/ice-audio/references/voiceover.md", ["**Broadcast voice chain**", "Phone or TV band-pass, only for a quoted voice"]);
  has("skills/ice-assets/references/sourcing-and-licenses.md", ["## 1c. What a news reel needs"]);
  has("skills/ice-assets/references/truth-sheet.md", ["**Scope: broadcast tags are not labels.**"]);
  has("skills/ice-engines/references/hyperframes.md", ["**Glass, backdrop blur and blend modes (engine limit and route).**"]);
  has("skills/ice-engines/references/maps-geo.md", ["the broadcast map replaces \"no decorative glows\""]);
  has("skills/ice-engines/references/engine-choice.md", ["`pip.rembg`", "`npm.milsymbol`", "`binaries.go-pmtiles`"]);
});

test("news reel: QA lets the measured broadcast package pass and still fails decoration", () => {
  has("skills/ice-qa/references/slop-scan.md", ["### Broadcast package (news reel)",
    "Decoration without a reason still fails inside a news reel"]);
  has("skills/ice-qa/references/motion-density.md", ["| news reel | 6.5 | 6.5 | 8 |"]);
  has("skills/ice-qa/references/frame-checks.md", ["| R2 | Colour roles |"]);
  has("skills/ice-qa/references/storyboard-lint.md", ["## 2. The 21 machine checks"]);
  has("skills/ice-remake/references/production-crew.md", ["a measured no-fade end card overrides the end fade"]);
  has("skills/ice-remake/references/fidelity-contract.md", ["| Never | Copied from the `## Never` block"]);
  has("skills/ice-remake/references/notes-files.md", ["a second heading `## Never` lists what the reference never does"]);
  has("skills/ice-remake/references/rights-and-modes.md", ["key time unit is calibrated against the comp's known duration"]);
});

// 0.2.5 (lessons L17 and L20): every edit type has a coverage floor checked on the plan, content triggers are answered or
// declined, visual craft rows reach the plan, exemptions come only from the craft plan, outside material gets its own grade.
const validator = () => import(pathToFileURL(abs("skills/ice-edit/scripts/validate-plan.mjs")).href);
const EDIT_TYPES = ["broll-overlay", "long-form", "news-reel", "podcast", "shorts-reels", "showreel", "talking-head-ad"];
const TRANSCRIPT = { words: [{ text: "hello", start: 0.1, end: 0.5, sourceStart: 10.1, sourceEnd: 10.5 }] };
const EDL = { keeps: [{ sourceStart: 10, sourceEnd: 50, start: 0, end: 40 }] };
// A 30 s talking-head ad: 12 s of bare talk, a 2 s insert, 16 s of bare talk; 3 events (10 per minute with the cuts).
const thinAd = (extra = {}) => ({
  duration: 30, fps: 25, type: "talking-head ad",
  scenes: [
    { id: "s00", start: 0, end: 12, layout: "face", kind: "talk", anchor: "hello", anchorTime: 0.1, holdReason: "calm talk" },
    { id: "s01", start: 12, end: 14, layout: "broll", kind: "insert", anchor: "hello", anchorTime: 12.05 },
    { id: "s02", start: 14, end: 30, layout: "face", kind: "talk", anchor: "hello", anchorTime: 14.05, holdReason: "calm talk" }],
  events: [1, 8, 20].map((time) => ({ time, type: "graphic", visual: time < 12 ? "s00" : "s02" })),
  captions: [{ start: 0.1, end: 0.5, words: [{ text: "hello", start: 0.1, end: 0.5 }] }],
  ...extra,
});
// No type and an event every 2 s on one scene, so only the trigger and craft rules can fail.
const busyPlan = (extra = {}) => thinAd({ type: undefined,
  scenes: [{ id: "s00", start: 0, end: 30, layout: "face", kind: "talk", anchor: "hello", anchorTime: 0.1 }],
  events: Array.from({ length: 15 }, (_, i) => ({ time: 2 * i + 1, type: "camera", visual: "s00" })), ...extra });
const exemptRow = { id: "X-01", lifts: ["plan:coverage"], element: "a calm founder talk with no inserts",
  source: { kind: "user", ref: "the user's quoted words in ice/DIRECTION.md" }, shots: ["all"], reason: "the user asked for an unbroken talk", stage: "04" };

test("edit floor: a plan under the talking-head-ad coverage floor fails and names each measure", async () => {
  const { validatePlan } = await validator();
  const r = validatePlan(thinAd(), TRANSCRIPT, EDL);
  assert.equal(r.ok, false);
  assert.equal(r.coverage.file, "edit-types/talking-head-ad.md");
  for (const k of ["element_events_per_min", "longest_bare_talk_s", "broll_share"]) {
    assert.ok(r.errors.some((e) => e.startsWith(`Coverage floor: ${k} `) && e.includes("talking-head-ad.md")), `${k}: ${r.errors.join("; ")}`);
  }
  assert.equal(Math.round(r.coverage.measures.longest_bare_talk_s), 10);
  assert.equal(r.coverage.floors.element_events_per_min.line, 12, "the lenient line of '15; 12 in a calm ad' fails");
  assert.ok(validatePlan(thinAd({ type: "art film" }), TRANSCRIPT, EDL).coverage.note, "a type with no edit-types file is reported");
});

test("edit floor: a plan:coverage exemption row from the craft plan lifts the floor and is printed with its source", async () => {
  const { validatePlan } = await validator();
  const r = validatePlan(thinAd({ craft: { exemptions: [exemptRow] } }), TRANSCRIPT, EDL);
  assert.equal(r.ok, true, r.errors.join("; "));
  assert.ok(r.exempt.some((e) => e.startsWith("exempt plan:coverage by X-01 (user: the user's quoted words in ice/DIRECTION.md) for broll_share")), r.exempt.join("; "));
  const narrow = { ...exemptRow, shots: ["s02"] };
  assert.equal(validatePlan(thinAd({ craft: { exemptions: [narrow] } }), TRANSCRIPT, EDL).ok, false, "a row for one shot does not lift a film-wide floor");
  const never = { ...exemptRow, lifts: ["plan:coverage", "truth:claims"] };
  const n = validatePlan(thinAd({ craft: { exemptions: [never] } }), TRANSCRIPT, EDL);
  assert.equal(n.ok, false, "a row naming a never-lifted class is ignored");
  assert.ok(n.warnings.some((w) => /never lifted/.test(w)));
  const noHold = thinAd().scenes.map((s) => ({ ...s, holdReason: undefined }));
  const gap = validatePlan(thinAd({ type: undefined, scenes: noHold }), TRANSCRIPT, EDL);
  assert.ok(gap.errors.some((e) => /^Unexplained visual-event gap/.test(e)), "without a hold reason the 2.2 s gap fails");
  const lifted = validatePlan(thinAd({ type: undefined, scenes: noHold, craft: { exemptions: [{ ...exemptRow, lifts: ["plan:gap"] }] } }), TRANSCRIPT, EDL);
  assert.equal(lifted.ok, true, lifted.errors.join("; "));
});

test("edit floor: shots given as the string all lifts the floor in validate-plan, and a row with no valid source or a late content row is ignored", async () => {
  const { validatePlan, exemptionFor, allowedKinds } = await validator();
  const r = validatePlan(thinAd({ craft: { exemptions: [{ ...exemptRow, shots: "all" }] } }), TRANSCRIPT, EDL);
  assert.equal(r.ok, true, r.errors.join("; "));
  assert.ok(r.exempt.some((e) => e.startsWith("exempt plan:coverage by X-01 (user: ")), r.exempt.join("; "));
  for (const [row, why] of [[{ ...exemptRow, source: { kind: "type", ref: "type default" } }, /ignored: it has no source/],
    [{ ...exemptRow, source: { kind: "user", ref: " " } }, /ignored: it has no source/],
    [{ ...exemptRow, source: { kind: "content", ref: "the script" }, stage: "07" }, /ignored: a content row written at stage 07/]]) {
    const x = validatePlan(thinAd({ craft: { exemptions: [row] } }), TRANSCRIPT, EDL);
    assert.equal(x.ok, false, JSON.stringify(row));
    assert.ok(x.warnings.some((w) => why.test(w)), x.warnings.join("; "));
    assert.equal(x.warnings.filter((w) => why.test(w)).length, 1, "each ignored row is warned about once");
  }
  // the inline reader takes the same source kinds per rule id as the shared readers
  const warned = [];
  const plan = { exemptions: [{ id: "X-05", lifts: ["film:hero_share", "plan:gap"], source: { kind: "content", ref: "the script" }, shots: "all" }] };
  assert.equal(exemptionFor(plan, "film:hero_share", { t: 1 }, (w) => warned.push(w)), null);
  assert.equal(exemptionFor(plan, "plan:gap", { t: 1 }, (w) => warned.push(w))?.id, "X-05");
  assert.match(warned.join("; "), /X-05 ignored for film:hero_share: a content row cannot lift it \(allowed: user, reference, style\)/);
  assert.deepEqual(allowedKinds("frame:flash"), ["user"]);
  assert.deepEqual(allowedKinds("story:12"), ["user", "reference", "style"]);
  assert.deepEqual(allowedKinds("plan:coverage"), ["user", "reference", "style", "content"]);
});

test("exemptions: validate_motion_contract.py reads shots given as the string all, checks the source kind and ignores a row with no source", (t) => {
  const py = findPython();
  if (!py) { t.skip("Python 3 not found"); return; }
  const rows = [
    { id: "X-01", lifts: ["contract:fade"], element: "a fade the style needs", source: { kind: "style", ref: "film-noir card, Craft needs: transition" }, shots: "all" },
    { id: "X-02", lifts: ["contract:fade"], element: "a fade", source: { kind: "content", ref: "the script" }, shots: ["all"], stage: "07" },
    { id: "X-03", lifts: ["contract:fade"], element: "a fade", shots: ["all"] },
    { id: "X-04", lifts: ["film:hero_share"], element: "a small product", source: { kind: "content", ref: "the script" }, shots: "all" },
  ];
  const code = [
    "import json, sys",
    "sys.path.insert(0, sys.argv[1])",
    "import validate_motion_contract as v",
    "rows = json.loads(sys.argv[2])",
    "pick = lambda ids, rule: (v.exemption_for({'exemptions': [r for r in rows if r['id'] in ids]}, rule, t=1.0) or {}).get('id')",
    "print(json.dumps([pick(['X-01'], 'contract:fade'), pick(['X-02'], 'contract:fade'), pick(['X-03'], 'contract:fade'), pick(['X-04'], 'film:hero_share')]))",
  ].join("\n");
  const r = spawnSync(py[0], [...py.slice(1), "-c", code, abs("skills/ice-motion/scripts"), JSON.stringify(rows)], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  const lines = r.stdout.trim().split(/\r?\n/);
  assert.deepEqual(JSON.parse(lines.at(-1)), ["X-01", null, null, null]);
  const warnings = lines.slice(0, -1).join("\n");
  assert.match(warnings, /WARNING: exemption X-02 ignored: a content row written at stage 07/);
  assert.match(warnings, /WARNING: exemption X-03 ignored: it has no source/);
  assert.match(warnings, /WARNING: exemption X-04 ignored for film:hero_share: a content row cannot lift it \(allowed: user, reference, style\)/);
});

test("edit floor: an unanswered trigger fails, a notUsed trigger passes, a banned reason does not count", async () => {
  const { validatePlan } = await validator();
  const trigger = { time: 4.2, kind: "number with a unit", text: "a share of the market" };
  const far = busyPlan({ scenes: [{ ...busyPlan().scenes[0], holdReason: "talk" }],
    events: busyPlan().events.filter((e) => e.time < 2 || e.time > 7), triggers: [trigger] });
  const r = validatePlan(far, TRANSCRIPT, EDL);
  assert.ok(r.errors.some((e) => /^Trigger at 4\.20s \(number with a unit .* no visual event within 1\.5 s and no notUsed reason/.test(e)), r.errors.join("; "));
  assert.equal(validatePlan(busyPlan({ triggers: [trigger] }), TRANSCRIPT, EDL).ok, true, "an event within 1.5 s answers it");
  const declined = validatePlan({ ...far, triggers: [{ ...trigger, notUsed: "the speaker holds the printed figure up to the lens at that moment" }] }, TRANSCRIPT, EDL);
  assert.equal(declined.ok, true, declined.errors.join("; "));
  assert.equal(declined.coverage.measures.trigger_coverage, 100);
  const banned = validatePlan({ ...far, triggers: [{ ...trigger, notUsed: "Keep it simple" }] }, TRANSCRIPT, EDL);
  assert.ok(banned.errors.some((e) => /banned reason/.test(e)), banned.errors.join("; "));
});

test("edit floor: a use row of a visual craft code needs a tagged scene or event", async () => {
  const { validatePlan } = await validator();
  const rows = [{ dimension: "depth", decision: "use" }, { dimension: "music", decision: "use" }, { dimension: "data", decision: "not_use" }];
  const r = validatePlan(busyPlan({ craft: { rows } }), TRANSCRIPT, EDL);
  assert.deepEqual(r.errors, ['Craft plan row "depth" is use but no scene or event carries craft ["depth"]'], "sound rows are checked on the mix");
  const tagged = busyPlan({ craft: { rows } });
  tagged.events[3].craft = ["depth"];
  assert.equal(validatePlan(tagged, TRANSCRIPT, EDL).ok, true);
  tagged.events[4].craft = ["parallax"];
  assert.ok(validatePlan(tagged, TRANSCRIPT, EDL).errors.some((e) => /^Unknown craft code "parallax"/.test(e)));
});

test("edit floor: every edit-type file has a Coverage floor table with the four measures", async () => {
  const { coverageFloor, editType } = await validator();
  for (const f of EDIT_TYPES) {
    const text = readText(`skills/ice-edit/references/edit-types/${f}.md`);
    assert.match(text, /^#{2,3} Coverage floor$/m, f);
    for (const k of ["element_events_per_min", "longest_bare_talk_s", "trigger_coverage", "broll_share"]) {
      assert.match(text, new RegExp("^\\| `" + k + "` \\| [^|]+ \\| [^|]{20,} \\|$", "m"), `${f}: ${k} row with its number and source`);
    }
    assert.equal(coverageFloor(f.replace(/-/g, " ")).table, true, f);
    assert.equal(coverageFloor(f).floors.trigger_coverage.line, 100, `${f}: every trigger answered or declined`);
  }
  assert.equal(editType("shorts and reels"), "shorts-reels");
  assert.equal(editType("news reel cut from a podcast episode"), "news-reel");
  assert.equal(editType("B-roll overlay"), "broll-overlay");
  has("skills/ice-qa/references/motion-density.md", ["### 6.2 Coverage floor for edit types (lesson L17, blocking)",
    "a lit person in a lit room already fills `hero_share` and `frame_fill`", "Edit types have no richness floor; they have the coverage floor of section 6.2"]);
  has("skills/ice-edit/references/house-style-numbers.md", ["\"Coverage floor\" table of its `edit-types/<type>.md` file"]);
  has("skills/ice-edit/references/clock-and-grouping.md", ['"triggers":[{"time":0.0,"kind":"<trigger kind>"', "`plan:coverage`", "`plan:anchor`", "`plan:gap`"]);
  has("skills/ice-edit/references/edit-types/talking-head-ad.md", ["never a ceiling over a reference's or a style's measured scale range"]);
});

test("grade: grade.py lists news_clean and the outside-material presets, clean and neutral", (t) => {
  const py = findPython();
  if (!py) { t.skip("Python 3 not found"); return; }
  const script = abs("skills/ice-edit/scripts/grade.py");
  const r = spawnSync(py[0], [...py.slice(1), script, "--list-presets"], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  for (const p of ["subtle:", "neutral_punch:", "warm_cinematic:", "news_clean:", "outside_mono:", "outside_desat_lift:", "outside_warm_duotone:"]) {
    assert.ok(r.stdout.includes(p), `missing preset ${p}`);
  }
  const clean = spawnSync(py[0], [...py.slice(1), script, "--print-preset", "news_clean"], { encoding: "utf8" }).stdout;
  assert.doesNotMatch(clean, /noise|grain|colorbalance|vignette/, "clean digital: no grain, no colour shift");
  const mono = spawnSync(py[0], [...py.slice(1), script, "--print-preset", "outside_mono"], { encoding: "utf8" }).stdout;
  assert.match(mono, /hue=s=0/);
});

test("grade: render.py applies a grade per EDL range by source_class or range grade (dry run)", (t) => {
  const py = findPython();
  if (!py) { t.skip("Python 3 not found"); return; }
  const dir = mkdtempSync(join(tmpdir(), "ice grade "));
  try {
    const run = (edl) => {
      writeFileSync(join(dir, "edl.json"), JSON.stringify(edl));
      const r = spawnSync(py[0], [...py.slice(1), abs("skills/ice-edit/scripts/render.py"), join(dir, "edl.json"), "-o", join(dir, "out.mp4"), "--dry-run"], { encoding: "utf8" });
      assert.equal(r.status, 0, r.stderr);
      return JSON.parse(r.stdout).ranges;
    };
    const preset = (name) => spawnSync(py[0], [...py.slice(1), abs("skills/ice-edit/scripts/grade.py"), "--print-preset", name], { encoding: "utf8" }).stdout.trim();
    const sources = { studio: "studio take.mp4", archive: "agency clip.mp4" };
    const ranges = run({ sources, grade: "news_clean", grades: { outside: "outside_mono" }, ranges: [
      { source: "studio", start: 0, end: 4 },
      { source: "archive", start: 10, end: 12, source_class: "outside" },
      { source: "archive", start: 20, end: 21, source_class: "outside", grade: "outside_warm_duotone" }] });
    assert.deepEqual(ranges.map((g) => g.from), ["EDL grade", "grades[outside]", "range grade"]);
    assert.deepEqual(ranges.map((g) => g.filter), [preset("news_clean"), preset("outside_mono"), preset("outside_warm_duotone")]);
    const plain = run({ sources, grade: "subtle", ranges: [{ source: "studio", start: 0, end: 4 }, { source: "archive", start: 1, end: 2 }] });
    assert.deepEqual(plain.map((g) => g.filter), [preset("subtle"), preset("subtle")], "without per-range fields every range takes the EDL grade");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
