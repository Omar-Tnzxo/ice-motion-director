// The news reel (0.2.4): the measured broadcast news style, its edit type and the scoped exceptions that let it pass QA.
// Each test names the canonical home of one part and the phrases a weak agent needs to find there; the scope lines
// keep every older rule in place for the other film types (AGENTS.md rules 6 and 7). Zero dependencies.
// Run: node --test tests/
import assert from "node:assert/strict";
import { test } from "node:test";
import { readText } from "./helpers.mjs";

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
    "The depth sandwich is the layout, not a peak", "the cap is the measured count of the reference"]);
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
