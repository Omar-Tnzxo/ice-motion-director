#!/usr/bin/env node
// behavior.mjs: the behaviour eval suite. Every trial and lesson (docs/maintainers/lessons.md) becomes a case that runs
// Ice on a real input with a plain user prompt, stops at the stage 06 preview, and graders that judge the plan files.
// One source file on purpose: the plugin is near its file budget (tests/repo.test.mjs), so the case folders that
// `claude plugin eval` reads are generated into evals/generated/ (ignored by git) and never committed.
// Original to Ice Motion Director (Apache-2.0). Zero dependencies, Node 22 or newer. Guide: docs/maintainers/evals.md.
//
//   node evals/behavior.mjs list                      cases, their inputs and graders
//   node evals/behavior.mjs build [options]           fetch and trim the inputs, then write evals/generated/<case>/
//     --inputs <dir>     cache of trimmed inputs (default: <os temp>/ice-evals-inputs; put it on a drive with room)
//     --local <dir>      folder holding the files of `local` inputs (inputs with no public link)
//     --case <name>      only this case (repeatable)
//     --no-fetch         write only the cases whose inputs are already cached
//
// Inputs are read at build time from their links (yt-dlp stream links, FFmpeg) and trimmed to 10-45 s; no video, footage
// or third-party material is ever committed. Exit codes: 0 done, 1 a case could not be built, 2 usage error.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "evals", "generated");
const COMMAND = "/ice-motion-director:ice";

// The user's own words that every case shares: the start questions waived and the stop before the build. They are
// what a user types, not a rule; without them a non-interactive run would wait at 01 (AGENTS.md rule 4).
const AR_STOP = "ما تسألنيش أسئلة البداية وقرر أنت، بس وريني المعاينة قبل ما تبني الفيديو.";
const EN_STOP = "Don't ask me the start questions, decide yourself, but show me the preview before you build the video.";

// Path pieces for regex graders. The `files` target lists created paths; Windows lists them with backslashes.
const S = String.raw`[\\/]`;
const REF = String.raw`ice${S}reference${S}[^\\/\n]+${S}`;
// A tool call line of the trace (one message per line): matches only what the agent wrote or ran, never a skill file
// it read, because read results sit on their own lines.
const CALL = String.raw`"name":"(?:Write|Edit|MultiEdit|NotebookEdit|Bash|PowerShell)"[^\n]*?`;

const STORYBOARD = { source: "file", path: "ice/plan/storyboard.md" };
const DIRECTION = { source: "file", path: "ice/DIRECTION.md" };
const CRAFT_PLAN = { source: "file", path: "ice/plan/craft-plan.json" };

// Graders by lesson. `when` reads the case facets: speaker (a person speaks on camera), reference (a style reference
// video), marks (the reference keeps fixed identity marks), media (the film needs outside footage, photos or brand
// material), conflict (the content type differs from the reference's, or the reference belongs to another brand).
// Every lesson of docs/maintainers/lessons.md has a grader below or a line in NOT_GRADED with the reason
// (tests/lessons.test.mjs checks it). Lessons judged at stages 07 to 10 run after these cases stop.
const NOT_GRADED = {
  L11: "captions against a fresh transcript of the final audio: stage 09 and 10, after the cases stop",
  L15: "depth as a craft: judged inside the craft plan graders of L13 and L14 and the depth graders of L12",
  L16: "text over a face, measured on the render: stage 07 and 09, after the cases stop",
  L18: "the mix audit and the ear list: stage 08b to 10, after the cases stop",
  L23: "pace measured on the render: stage 07 and 09, after the cases stop",
  L25: "every sound effect heard in the mix: stage 08b and 09, after the cases stop",
  L26: "depth, finishing, grade, marks and speaker measured on the render: stage 07 and 09, after the cases stop",
  L28: "sound by code never a default: judged by the L1 graders",
  L29: "the craft plan before 03: judged by l13-craft-plan-written (the run cannot pass 03 without it)",
  L30: "a look the user chose: judged by l22-user-choice-honoured",
  L31: "the speaker never dimmed in a package: judged by l19-speaker-recedes-not-darkens",
  L32: "no install or download question: judged by l3-no-install-question",
  L33: "rights stay with the user: judged by l27-no-permission-question",
  L35: "Arabic typing in a real product box: no case has a product input box yet",
  L36: "the fingerprint check: written at delivery, after the cases stop",
  L37: "news reel trial rules: judged by l37-news-reel-attribution when a case is a news reel",
  L38: "the case study site package: stage 10, after the cases stop",
  L39: "progress messages in auto mode: judged by l39-progress-sent",
  L40: "short music, beat error, halftone, fringe and contrast are measured at stages 07 to 09, after the cases stop",
  L41: "the portrait and flag routes are judged by l24-footage-by-script; stage 05 and music options by the L13 and L1 graders",
  L42: "the genre fingerprint runs on a render at stages 07 and 09 (genre_check.py), after the cases stop",
};
const GRADERS = [
  {
    lesson: "case", name: "no-final-render", when: () => true,
    spec: { type: "regex", target: "files", match: "not_contains", pattern: String.raw`ice${S}renders${S}final${S}` },
  },
  {
    lesson: "case", name: "stops-at-preview", when: () => true,
    spec: {
      type: "llm", focus: "last_message",
      criteria: "The user waived the start questions and asked to see the preview before the video is built. PASS if this reply presents the preview (style frames, an animatic, a storyboard or a contact sheet of the planned film) and asks the user to approve it or give notes before the full build. FAIL if it says the final video was built or delivered, if it stops with no preview, or if it asks the start questions the user waived.",
    },
  },
  {
    lesson: "L1", name: "l1-no-code-sound-run", when: () => true,
    spec: { type: "regex", target: "trace", match: "not_contains", pattern: String.raw`"name":"(?:Bash|PowerShell)"[^\n]*?(?:mgaudio|aevalsrc|anoisesrc|\bsine=)` },
  },
  {
    lesson: "L1", name: "l1-real-music-and-sfx", when: () => true,
    spec: {
      type: "llm", focus: DIRECTION,
      criteria: "This is the decision log of a video run. Judge the decisions in force: a decision the log marks as superseded or replaced does not count. The user did not ask for music or sound made by code. PASS if every music and sound effect decision names real recorded material (a library track, a recorded effect, the source's own sound or a file the user gave) with where it comes from, or says the music will be picked from real library options laid on the preview; a log with no sound decision yet also passes. FAIL if any music bed, pulse, drone, riser, hit, whoosh or effect is synthesized or generated by code (tones, oscillators, noise sweeps, mgaudio).",
    },
  },
  {
    lesson: "L2", name: "l2-media-fetched", when: (c) => c.facets.media,
    // Fetched media lands in the project's assets/ (ice-assets project-folders.md section 1); previews and the
    // reference copies under ice/ do not count.
    spec: { type: "regex", target: "files", pattern: String.raw`(?:^|${S})(?:ice${S})?assets${S}[^\n]*\.(?:mp4|mov|webm|mkv|jpe?g|png|webp|svg|wav|mp3|m4a|flac)\s*$`, flags: "m" },
  },
  {
    lesson: "L2", name: "l2-sources-recorded", when: (c) => c.facets.media,
    spec: { type: "regex", target: "files", pattern: String.raw`ice${S}assets${S}(?:sources${S}[^\n]+\.json|CREDITS\.md|BRAND-MATERIAL\.md)|(?:ice${S})?assets${S}footage-ledger\.json` },
  },
  {
    lesson: "L3", name: "l3-no-install-question", when: () => true,
    spec: {
      type: "llm", focus: "last_message",
      criteria: "FAIL if this reply asks the user for permission or confirmation to install a free tool, package or model, or to download free media (footage, photos, flags, maps, fonts, library music), or tells the user to install or download such a free item themselves. Asking the user to approve the preview, to choose between music options, or to supply a paid service, an account or a sign-in is fine. Otherwise PASS.",
    },
  },
  {
    lesson: "L4", name: "l4-reason-columns", when: () => true,
    spec: { type: "regex", target: STORYBOARD, pattern: String.raw`^(?=[^\n]*\|\s*Trigger)(?=[^\n]*\|\s*Reason)[^\n]*$`, flags: "im" },
  },
  {
    lesson: "L4", name: "l4-storyboard-linted", when: () => true,
    spec: { type: "tool_used", tool: "Bash", input_match: String.raw`storyboard_lint\.py` },
  },
  {
    lesson: "L4", name: "l4-triggers-cite-the-words", when: () => true,
    spec: {
      type: "llm", focus: STORYBOARD,
      criteria: "This is a storyboard. PASS if every element it plans (insert, overlay, keyword, caption block, lower third, card, circle or disc, highlight, dimming, cut-out, B-roll, map, fixed mark) has a Trigger that quotes the words of the film's speech, narration or script line it follows (a fixed identity mark may give the kind 'always') and a Reason that says what the element means, who or what it is on, and why its colour and shape are so. FAIL if any element has an empty, generic or filler trigger or reason (such as 'visual interest', 'energy', 'style', 'like the reference', 'to keep it moving'), or if an element appears in the shots with no such row.",
    },
  },
  {
    lesson: "L4", name: "l4-reference-reasons", when: (c) => c.facets.reference,
    spec: { type: "regex", target: "files", pattern: String.raw`${REF}REASONS\.md` },
  },
  {
    lesson: "L5", name: "l5-speaker-stays-lit", when: (c) => c.facets.speaker,
    spec: {
      type: "llm", focus: STORYBOARD,
      criteria: "This is a storyboard of a video in which a person speaks on camera (host, presenter, guest or interviewee). PASS if the speaker stays lit and clear in every planned shot while speaking: never darkened, silhouetted, blurred, turned fully grey or sepia, or placed inside a disc, circle or ring device; such treatments may only go on people or things being talked about. A partial desaturation and a scale back of the speaker while an inserted image or card of another person or thing is the subject of the frame are fine. FAIL if any shot darkens, silhouettes, blurs, turns fully grey or sepia, or rings the speaker while speaking, or desaturates the speaker when no inserted image or card is the subject.",
    },
  },
  {
    lesson: "L5", name: "face-clear-of-text", when: (c) => c.facets.speaker,
    spec: {
      type: "llm", focus: STORYBOARD,
      criteria: "This is a storyboard of a video in which a person speaks on camera. PASS if, in every shot where the speaker's face is on screen, the planned captions, keywords, cards and graphics sit off the face (below the chin, on the chest band, beside the head after a camera move, or behind the speaker through a matte), and nothing is planned over the face or the hands. FAIL if any shot places text or a graphic over the face, or sets captions at a fixed height that the plan itself says the face reaches.",
    },
  },
  {
    lesson: "L6", name: "l6-finishing-measured", when: (c) => c.facets.reference,
    spec: { type: "regex", target: "trace", pattern: String.raw`${CALL}ANALYSIS\.md[^\n]*?Finishing layer` },
  },
  {
    lesson: "L6", name: "l6-finishing-by-reason", when: () => true,
    spec: {
      type: "llm", focus: DIRECTION,
      criteria: "This is the decision log of a video run. Judge the decisions in force: a decision the log marks as superseded or replaced does not count. PASS if each finishing effect the plan uses (motion blur, blur for depth, blur on entrances or exits, grain or film texture, vignette, glow, colour grade) is tied to where it applies and why, with a measured value when a reference shows it, or if the plan uses none. FAIL if an effect is applied to the whole film by default with no place, value or reason, or copied from a reference with no measurement.",
    },
  },
  {
    lesson: "L7", name: "l7-identity-fits-content", when: (c) => c.facets.conflict,
    spec: {
      type: "llm", focus: DIRECTION,
      criteria: "Judge the decisions in force: a decision the log marks as superseded or replaced does not count. This is the decision log of a video made in the editing style of a reference that belongs to another organisation, for content of a different type (for example a service ad cut in a news channel's style, or one brand's ad in another brand's launch-film style). PASS if the log compares the content type with the reference's type, gives the video the identity that fits its content (the advertised business's or the user's own name, logo, colours and end card), keeps the reference's editing grammar only, and offers the reference-identity version as an alternative if the user asked for it. FAIL if the plan puts the reference organisation's logo, name, bug, end card or colours on this video as its identity.",
    },
  },
  {
    lesson: "L8", name: "l8-disk-space-checked", when: () => true,
    spec: { type: "tool_used", tool: "Bash", input_match: String.raw`ice-state\.mjs.{0,160}\bspace\b` },
  },
  {
    lesson: "L9", name: "l9-reference-events", when: (c) => c.facets.reference,
    spec: { type: "regex", target: "files", pattern: String.raw`${REF}analysis${S}events\.json` },
  },
  {
    lesson: "L9", name: "l9-gap-checked", when: (c) => c.facets.reference,
    spec: { type: "tool_used", tool: "Bash", input_match: String.raw`validate-plan\.mjs|motion_check\.py` },
  },
  {
    lesson: "L10", name: "l10-marks-measured", when: (c) => c.facets.marks,
    spec: { type: "regex", target: "trace", pattern: String.raw`${CALL}Fixed marks:` },
  },
  {
    lesson: "L10", name: "l10-marks-in-their-slots", when: (c) => c.facets.marks,
    spec: {
      type: "llm", focus: STORYBOARD,
      criteria: "This is a storyboard of a video that follows a reference with fixed identity marks (a channel logo, programme name, corner bug, progress bar or location tag that stay on screen). PASS if the plan keeps each fixed mark in one slot with its measured position and size through the film (or puts the user's own mark in the same slot when the video carries the user's identity). FAIL if a mark the reference keeps on screen is missing, moves from shot to shot, or a mark is invented.",
    },
  },
  {
    lesson: "L13", name: "l13-craft-plan-written", when: () => true,
    spec: { type: "regex", target: "files", pattern: String.raw`ice${S}plan${S}craft-plan\.json` },
  },
  {
    lesson: "L13", name: "l13-craft-plan-checked", when: () => true,
    spec: { type: "tool_used", tool: "Bash", input_match: String.raw`craft_gate\.py\s+plan\b` },
  },
  {
    lesson: "L13", name: "l13-no-unasked-gaps", when: () => true,
    spec: {
      type: "llm", focus: CRAFT_PLAN,
      criteria: "This is a video's craft plan: one row per craft dimension (camera, depth, compositing, light, finishing, type, transitions, data, cutouts, sound effects, music, ambience, foley, silence, voice, rhythm, real footage, identity). PASS if every dimension has a row, every used dimension says where and why from the content, the type, the reference or the style, and every dimension left out has a real reason with a source (nothing in the content calls for it and what was looked for, the type's policy, the style's medium, a hard rule, or the user's own words). FAIL if a dimension is missing, or left out because the user did not ask, it was not in the brief, or to keep it simple.",
    },
  },
  {
    lesson: "L14", name: "l14-exemptions-sourced", when: (c) => c.facets.reference,
    spec: {
      type: "llm", focus: CRAFT_PLAN,
      criteria: "This is a video's craft plan made after a style reference. PASS if every device that a default taste rule would flag and that the plan keeps (a glow, a flash, a tilted card, a corner mark, a crossfade, a dense or sparse frame, a receding speaker) is either a craft row with its source or an exemption row naming the rule it lifts, the source (the reference's measured row, the style, the content or the user's words), the shots and the amount; or if the plan keeps no such device. FAIL if such a device is planned with no source, on every shot, or with no amount.",
    },
  },
  {
    lesson: "L17", name: "l17-edit-floor-checked", when: (c) => c.facets.speaker,
    spec: { type: "tool_used", tool: "Bash", input_match: String.raw`validate-plan\.mjs|craft_gate\.py` },
  },
  {
    lesson: "L19", name: "l19-speaker-recedes-not-darkens", when: (c) => c.facets.speaker,
    spec: {
      type: "llm", focus: STORYBOARD,
      criteria: "This is a storyboard of a video in which a person speaks on camera. PASS if, wherever an inserted image or card of another person or thing becomes the subject of the frame, the plan either keeps the speaker as they are or lets the speaker recede as a back plane only while that image is the subject: smaller and partly desaturated while the speaker talks, and dimmed slightly or lightly defocused only while the speaker is silent, back to normal when the image leaves or on the next stressed word; or if no such moment is planned. FAIL if the speaker is dimmed, defocused, silhouetted, turned fully grey or sepia, or ringed while speaking, or stays receded after the image leaves.",
    },
  },
  {
    lesson: "L20", name: "l20-outside-material-treated", when: (c) => c.facets.media,
    spec: {
      type: "llm", focus: DIRECTION,
      criteria: "This is the decision log of a video run. Judge the decisions in force. PASS if outside material in the film (archive, agency footage, stills, screenshots, material from another time or place) gets one consistent treatment that marks it as coming from outside (monochrome, desaturation with lifted blacks, a warm duotone or a tint from the palette), logged with its reason, while the speaker and the film's own footage keep the film's grade; or if the film uses no outside material. FAIL if outside material is mixed in with no treatment decision, or a different look per clip with no reason.",
    },
  },
  {
    lesson: "L21", name: "l21-style-needs-copied", when: () => true,
    spec: { type: "regex", target: CRAFT_PLAN, pattern: String.raw`"style_needs"\s*:` },
  },
  {
    lesson: "L22", name: "l22-user-choice-honoured", when: (c) => c.facets.reference,
    spec: {
      type: "llm", focus: DIRECTION,
      criteria: "This is the decision log of a video the user asked to make in the look of a reference they supplied. Judge the decisions in force. PASS if the log records the reference as the user's own choice, keeps its look on the axes the choice fixes (identity still fitting the content), and does not move the film away from that look to satisfy a rule about differing from templates, earlier films or expected directions; research and reasons are still logged. FAIL if the log changes the reference's look on purpose to differ from a template, an earlier film or a fingerprint.",
    },
  },
  {
    lesson: "L24", name: "l24-footage-by-script", when: (c) => c.facets.media,
    spec: { type: "tool_used", tool: "Bash", input_match: String.raw`fetch_media\.py` },
  },
  {
    lesson: "L27", name: "l27-no-permission-question", when: () => true,
    spec: {
      type: "llm", focus: DIRECTION,
      criteria: "This is the decision log of a video run whose user waived the start questions in their own words. Judge the decisions in force. PASS if the log quotes the user's waiver and takes the recommended option for each open slot, and asks no question about permission, rights, consent for a free download or a free install. FAIL if the run took defaults without quoting the user's own waiver, or logs a permission or rights question to the user.",
    },
  },
  {
    lesson: "L34", name: "l34-no-label-in-the-film", when: (c) => c.facets.media,
    spec: {
      type: "llm", focus: STORYBOARD,
      criteria: "This is a storyboard of a video. PASS if no frame carries an 'unofficial concept' line, a 'not affiliated' line or an 'AI-generated' label inside the picture (truth labels such as 'Illustration' or 'Reconstruction' on factual topics are fine, and the delivery note or caption may carry the others). FAIL if such a line or label is planned inside the film.",
    },
  },
  {
    lesson: "L37", name: "l37-news-reel-attribution", when: (c) => c.facets.speaker && c.facets.reference,
    spec: {
      type: "llm", focus: STORYBOARD,
      criteria: "This is a storyboard of a news reel. PASS if every on-screen claim names whose claim it is in the same card, archive older than the current year shows its year while it plays, and no minor's face is held longer than half a second; or if the plan has no such moment. FAIL otherwise.",
    },
  },
  {
    lesson: "L39", name: "l39-progress-sent", when: () => true,
    spec: { type: "regex", target: "files", pattern: String.raw`ice${S}log${S}conversation\.jsonl` },
  },
  {
    lesson: "L12", name: "l12-reference-depth", when: (c) => c.facets.reference,
    spec: { type: "regex", target: "files", pattern: String.raw`${REF}analysis${S}depth\.json` },
  },
  {
    lesson: "L12", name: "l12-depth-routes", when: (c) => c.facets.reference,
    spec: {
      type: "llm", focus: STORYBOARD,
      criteria: "This is a storyboard of a video made after a reference. PASS if the depth, 3D and camera elements the plan takes from the reference (camera push, zoom or pan, parallax planes, cards in space, discs, wrapped or extruded text, flags, globes, a virtual set) are planned per shot, each with a build route written as build: css-3d, threejs-hyperframes, remotion-three or blender, or reported to the user as not feasible. FAIL if the plan is flat where it says the reference moves in depth, or a depth or 3D element has no route.",
    },
  },
];

// The cases. Prompts are the user's words only: the command, the idea and the files, never a rule. Inputs: `youtube`
// (an id fetched with yt-dlp) or `local` (a file looked up in --local), trimmed to `start` + `seconds`.
const AJ_REF = { local: "reference-aljazeera.mp4", note: "Al Jazeera English presenter reel 'Is the US-Iran war hours from ending?' (1080x1920, 3:13), supplied by the founder; no public link recorded", start: 0, seconds: 45 };
const AJ_EDIT = `عدّل الفيديو الخام raw.mp4 بنفس أسلوب مونتاج ريلز الجزيرة اللي في reference.mp4 بالظبط، بالمحتوى بتاع الخام وبهوية الجزيرة زي ما هي. ${AR_STOP}`;
const NEWS_EDIT = { speaker: true, reference: true, marks: true, media: true, conflict: false };
const CASES = [
  {
    name: "aj-carney", tags: ["trial", "edit", "news"], trial: "run-carney, 2026-10-28",
    facets: NEWS_EDIT, prompt: AJ_EDIT,
    inputs: { "raw.mp4": { youtube: "tUTe5oJmSRo", note: "Prime Minister of Canada, Thanksgiving message 2026-10-12", start: 0, seconds: 40 }, "reference.mp4": AJ_REF },
  },
  {
    name: "aj-obama", tags: ["trial", "edit", "news"], trial: "run-obama, 2026-10-28",
    facets: NEWS_EDIT, prompt: AJ_EDIT,
    inputs: { "raw.mp4": { youtube: "6vZPUMC4Xy8", note: "Weekly Address, 2015-07-18, the Iran deal (US government work, public domain)", start: 6, seconds: 35 }, "reference.mp4": AJ_REF },
  },
  {
    name: "aj-greenscreen-ad", tags: ["trial", "edit", "ad"], trial: "run-greenscreen, 2026-10-28",
    facets: { ...NEWS_EDIT, conflict: true }, prompt: AJ_EDIT,
    inputs: { "raw.mp4": { youtube: "OPrrvJau8xk", note: "green-screen presenter ad for a lawyers' directory", start: 0, seconds: 35 }, "reference.mp4": AJ_REF },
  },
  {
    name: "aj360-leadership", tags: ["trial", "edit", "news"], trial: "run-aj360, 2026-10-29",
    facets: NEWS_EDIT,
    prompt: `عدّل الفيديو الخام raw.mp4 بنفس أسلوب مونتاج الجزيرة 360 اللي في reference.mp4 بالظبط، بالمحتوى بتاع الخام وبهوية الجزيرة زي ما هي. ${AR_STOP}`,
    inputs: {
      "raw.mp4": { local: "raw-aj360-tutorial.mp4", note: "RAW.mp4 (1280x720, 10 s) of the public Google Drive folder 1RtbabU5cD9Kb1PK--BqkCR5EhcRUOOpR, linked from the tutorial youtube.com/watch?v=sv4v8OnjkUg", start: 0, seconds: 10 },
      "reference.mp4": { youtube: "i0pCYuvkbxs", local: "reference-aj360-tutorial.mp4", note: "Al Jazeera 360, 'Mohawalat Fahm' Mali episode promo", start: 0, seconds: 40 },
    },
  },
  {
    name: "mohawalat-episode", tags: ["trial", "edit", "talk-show"], trial: "mohawalat-fahm-france showcase, 2026-10-29",
    facets: NEWS_EDIT,
    prompt: `اعمل ريلز طولي عربي من المقطع ده episode.mp4 من حلقة "محاولة فهم" على الجزيرة بتاريخ 28 أكتوبر 2026، "من المدرسة إلى الشارع.. جذور الاحتجاجات في فرنسا". الأسلوب: نفس مونتاج ريلز "محاولة فهم" على الجزيرة اللي في ref-a.mp4 وref-b.mp4، بهوية البرنامج وألوانه وتوجهه، وأحسن منه كمان. ${AR_STOP}`,
    inputs: {
      "episode.mp4": { youtube: "qzPrJruvywk", note: "the episode, the guest's no-money passage and the host's missiles-or-high-schools line", start: 1670, seconds: 40 },
      "ref-a.mp4": { youtube: "x4nwLHZUjRQ", note: "programme reel, Mali episode", start: 0, seconds: 40 },
      "ref-b.mp4": { youtube: "0Gb3N9OfVCI", note: "programme reel, resistance axis episode", start: 0, seconds: 40 },
    },
  },
  {
    name: "product-ad-scratch", tags: ["style", "from-scratch", "ad"], trial: "none (another style, so the rules stay general)",
    facets: { speaker: false, reference: false, marks: false, media: true, conflict: false },
    prompt: `make a 20 second vertical Instagram ad for the Duolingo app. ${EN_STOP}`,
    inputs: {},
  },
  {
    name: "podcast-clip", tags: ["style", "edit", "podcast"], trial: "none (another style, so the rules stay general)",
    facets: { speaker: true, reference: false, marks: false, media: false, conflict: false },
    prompt: `طلّع شورت طولي من المقطع ده podcast.mp4 من بودكاست ناسا، بترجمة على الشاشة. ${AR_STOP}`,
    inputs: { "podcast.mp4": { youtube: "ZC4hpgNoumQ", note: "NASA Johnson, Houston We Have a Podcast: Artemis Flight Directors (NASA media)", start: 600, seconds: 40 } },
  },
  {
    name: "explainer-voiceover", tags: ["style", "from-scratch", "explainer"], trial: "none (another style, so the rules stay general)",
    facets: { speaker: false, reference: false, marks: false, media: true, conflict: false },
    prompt: `make a 30 second motion graphics explainer on this voiceover (voiceover.m4a) about how we are made of star stuff. ${EN_STOP}`,
    inputs: { "voiceover.m4a": { youtube: "63uNNcCpxHI", note: "NASA, How Are We Made of Star Stuff? We Asked a NASA Expert (NASA media), audio only", start: 3, seconds: 35, audio: true } },
  },
  {
    name: "motion-remake-brand", tags: ["style", "remake", "ad"], trial: "none (another style, so the rules stay general)",
    facets: { speaker: false, reference: true, marks: false, media: true, conflict: true },
    prompt: `اعمل إعلان 20 ثانية لمتصفح Firefox بنفس أسلوب الموشن اللي في reference.mp4. ${AR_STOP}`,
    inputs: { "reference.mp4": { youtube: "NHodnYFUT_I", note: "Figma, All the launches at Config 2025 (a product launch motion film of another brand)", start: 0, seconds: 35 } },
  },
];

function parseArgs(argv) {
  const opts = { cmd: argv[0], inputs: join(tmpdir(), "ice-evals-inputs"), local: null, cases: [], fetch: true };
  for (let i = 1; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--inputs") opts.inputs = resolve(argv[++i] ?? "");
    else if (a === "--local") opts.local = resolve(argv[++i] ?? "");
    else if (a === "--case") opts.cases.push(argv[++i] ?? "");
    else if (a === "--no-fetch") opts.fetch = false;
    else return null;
  }
  return ["list", "build"].includes(opts.cmd) ? opts : null;
}

const run = (cmd, args) => spawnSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 600000, maxBuffer: 1 << 24 });
const fwd = (p) => p.replaceAll("\\", "/");

// One input into the cache: the local file, or the stream links from yt-dlp (no full download), trimmed by FFmpeg
// to exactly `seconds` from `start`. A stalled network call gives up after 10 minutes.
function fetchInput(file, input, dir, opts) {
  const out = join(dir, file);
  if (existsSync(out) && statSync(out).size > 0) return null;
  if (!opts.fetch) return "not cached (--no-fetch)";
  mkdirSync(dir, { recursive: true });
  const local = input.local && opts.local ? join(opts.local, input.local) : null;
  let sources;
  if (local && existsSync(local)) sources = [local];
  else if (!input.youtube) return `local input ${input.local} not found${opts.local ? ` in ${opts.local}` : " (pass --local <dir>)"}`;
  else {
    // HLS first: FFmpeg seeks inside it by segment, while a DASH link is read from its start (a late `start` stalls).
    const format = input.audio ? "ba[protocol^=m3u8]/ba[ext=m4a]/ba"
      : "bv*[height<=1080][vcodec^=avc1][protocol^=m3u8]+ba[protocol^=m3u8]/bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[height<=1080]";
    const r = run("yt-dlp", ["-q", "--no-warnings", "--no-playlist", "-f", format, "-g", `https://www.youtube.com/watch?v=${input.youtube}`]);
    sources = r.status === 0 ? r.stdout.trim().split(/\r?\n/).filter(Boolean) : [];
    if (!sources.length) return `yt-dlp failed for ${input.youtube}: ${(r.stderr || r.error?.message || "").trim().split("\n").pop()}`;
  }
  const inputs = sources.flatMap((src) => ["-ss", String(input.start), "-t", String(input.seconds), "-i", src]);
  const map = sources.length > 1 ? ["-map", "0:v:0", "-map", "1:a:0"] : [];
  const codec = input.audio ? ["-vn", "-c:a", "aac", "-b:a", "192k"] : ["-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart"];
  const r = run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...inputs, ...map, ...codec, out]);
  if (r.status !== 0) { rmSync(out, { force: true }); return `ffmpeg failed on ${file}: ${(r.stderr || r.error?.message || "").trim().split("\n").pop()}`; }
  // Every input carries speech or the reference's sound: a trim that lost its audio track is useless.
  const probe = run("ffprobe", ["-v", "error", "-show_entries", "stream=codec_type", "-of", "csv=p=0", out]);
  if (!/audio/.test(probe.stdout ?? "")) { rmSync(out, { force: true }); return `${file} has no audio track after the trim`; }
  return null;
}

// case.yaml is written as JSON, which every YAML 1.2 parser reads, so prompts and rubrics need no YAML escaping.
function caseYaml(c) {
  return JSON.stringify({
    schema_version: "1.1",
    name: c.name,
    description: `Ice behaviour eval. Trial: ${c.trial}. Stops at the stage 06 preview; graders judge the plan files.`,
    tags: c.tags,
    runs: 1,
    expected_outcome: "Ice applies every lesson of docs/maintainers/lessons.md on its own and stops at the preview.",
    context: Object.keys(c.inputs).length ? { scaffold_script: "scaffold.sh" } : {},
    execution: {
      max_turns: 200,
      timeout_seconds: 3600,
      // Read-only tools are granted here; Bash, Write, Edit, WebFetch and WebSearch also need --allow-tools.
      allowed_tools: ["Read", "Glob", "Grep", "Skill", "Agent", "Bash", "Write", "Edit", "WebFetch", "WebSearch"],
      prompt: `${COMMAND}\n${c.prompt}`,
    },
    graders: GRADERS.filter((g) => g.when(c)).map((g) => ({ name: g.name, ...g.spec })),
  }, null, 2) + "\n";
}

function scaffold(c, dir) {
  const lines = Object.keys(c.inputs).map((f) => `cp "${fwd(join(dir, f))}" "${f}"`);
  return `#!/usr/bin/env bash\n# Generated by evals/behavior.mjs: copies the trimmed inputs of this case into the empty workspace.\nset -euo pipefail\n${lines.join("\n")}\n`;
}

const opts = parseArgs(process.argv.slice(2));
if (!opts) {
  console.log("usage: node evals/behavior.mjs list | build [--inputs <dir>] [--local <dir>] [--case <name>]... [--no-fetch]");
  process.exit(process.argv.length > 2 && !["-h", "--help"].includes(process.argv[2]) ? 2 : 0);
}
const chosen = CASES.filter((c) => !opts.cases.length || opts.cases.includes(c.name));
if (opts.cases.length && chosen.length !== opts.cases.length) {
  console.error(`unknown case; known: ${CASES.map((c) => c.name).join(", ")}`);
  process.exit(2);
}

if (opts.cmd === "list") {
  for (const c of chosen) {
    console.log(`${c.name}  [${c.tags.join(", ")}]  trial: ${c.trial}`);
    for (const [f, i] of Object.entries(c.inputs)) console.log(`  input ${f}: ${i.youtube ? `youtube ${i.youtube}` : `local ${i.local}`}, ${i.start}+${i.seconds} s, ${i.note}`);
    console.log(`  graders: ${GRADERS.filter((g) => g.when(c)).map((g) => `${g.name} (${g.lesson})`).join(", ")}`);
  }
  process.exit(0);
}

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, ".gitignore"), "*\n");
let failed = 0;
for (const c of chosen) {
  const dir = join(opts.inputs, c.name);
  const problems = Object.entries(c.inputs).map(([f, i]) => fetchInput(f, i, dir, opts)).filter(Boolean);
  const caseDir = join(OUT, c.name);
  if (problems.length) {
    rmSync(caseDir, { recursive: true, force: true });
    console.error(`skip ${c.name}: ${problems.join("; ")}`);
    failed++;
    continue;
  }
  mkdirSync(caseDir, { recursive: true });
  writeFileSync(join(caseDir, "case.yaml"), caseYaml(c));
  if (Object.keys(c.inputs).length) writeFileSync(join(caseDir, "scaffold.sh"), scaffold(c, dir));
  console.log(`built ${c.name}: ${GRADERS.filter((g) => g.when(c)).length} graders${Object.keys(c.inputs).length ? `, inputs in ${dir}` : ""}`);
}
console.log(`cases in ${OUT}; run: claude plugin eval . --eval-dir evals/generated --scaffold --allow-tools Bash Write Edit WebFetch WebSearch --ablation none`);
process.exit(failed ? 1 : 0);
