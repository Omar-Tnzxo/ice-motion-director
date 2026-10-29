# Lessons that became default rules

Founder decision, 2026-10-29 (`AGENTS.md` rule 19): every note from the founder, a trial or a case study becomes a rule in its canonical home inside the skills, at the right scope, with a test that stops it coming back. It is never left as advice the user has to write in a prompt: the user's prompt stays the idea and the files.

How to add a lesson: write the rule once in its canonical home (`AGENTS.md` rule 7), scope it (general, or the film types or category where it holds, rule 6), add a test, then add an entry here with the five fields below. `tests/lessons.test.mjs` checks that every entry has them, that its scope is `general` or `category: <name>`, that every rule file exists and that every test is found by its exact title. A lesson that cannot be tested writes `none: <reason>` in its Test field.

Field format: **Note** (the original observation, in English), **Trial** (the run or case study it came from, with its date), **Scope**, **Rule** (backticked file paths with the section), **Test** (`` `tests/<file>.test.mjs`: "<exact test title>" ``, separated by semicolons).

## L1. Real music and sound, picked by ear

- **Note:** Music and sound effects made by code (mgaudio) were noise that hurts the ears: pulses, banging, drones. The founder rejected them.
- **Trial:** all four raw-footage trials of 0.2.2 in the Al Jazeera reels style (carney, obama, greenscreen, aj360), 2026-10-28 and 2026-10-29.
- **Scope:** general
- **Rule:** `skills/ice-audio/SKILL.md` (core rules 1 and 7, the section 3 policy table, section 5 ladders and options flow); `skills/ice-audio/references/music-choice-and-licensing.md` (sections 2 and 3); `skills/ice-audio/references/sfx.md` (sections 2 and 7); `skills/ice-audio/references/mix-and-master.md` (section 3, the comfortable mix); `skills/ice-qa/references/audio-gates.md` (Comfortable mix); `skills/ice-audio/scripts/match_music.py`; `skills/ice-audio/scripts/preview_options.py`; `skills/ice-motion-director/SKILL.md` (section 5, stop B); `skills/ice-direction/references/questions.md` (slot 14, `Q-music`)
- **Test:** `tests/audio-fixes.test.mjs`: "ice-audio: no code score on the default path (policy table, music-choice section 2, sfx.md section 2)"; `tests/audio-fixes.test.mjs`: "ice-audio: the mgaudio opt-in sentence lives once, in SKILL.md core rule 7, and music-by-code.md opens with it"; `tests/audio-fixes.test.mjs`: "ice-audio: the options flow names stage 01, stop B, the 06 card and the delivery-note fallback"; `tests/audio-fixes.test.mjs`: "match_music.py and preview_options.py exist and print help"; `tests/audio-fixes.test.mjs`: "match_music.py ranks the measured closest track first; preview_options.py levels the options (generated tones)"; `tests/clarity-gate.test.mjs`: "stage 01 names the brand film and the real-track shortlist for music-led films"; `tests/engines-fixes.test.mjs`: "Q-music offers real library tracks heard on the film and no music made by code"; `tests/lessons.test.mjs`: "lessons: the comfortable mix is an audio gate: music under the speech, no repeated pulse"; `tests/lessons.test.mjs`: "edit: music and SFX follow the ice-audio ladder, code sound only when named"

## L2. Real, official, recent footage and assets found without being asked

- **Note:** The user had to write "find and download the latest real, official footage" in the prompt. Ice must search for it and download it on its own, and the same for photos, flags, maps, fonts and overlays, best, most recent and real first.
- **Trial:** all four raw-footage trials (the prompts carried the line), 2026-10-28 and 2026-10-29; editor-sources research, 2026-10-29.
- **Scope:** general
- **Rule:** `skills/ice-assets/references/sourcing-and-licenses.md` (section 0 standing consent and `sources.json`, section 1 ladder per need, section 1a footage order, section 4 routes, section 7 site terms); `skills/ice-assets/references/project-folders.md` (overlays, LUTs, inbox, sidecar, `FETCH-LIST.md`); `skills/ice-assets/references/fonts.md`; `skills/ice-engines/references/maps-geo.md`; `skills/ice-direction/references/questions.md` (slot 23, `Q-reference-file`); `skills/ice-motion-director/SKILL.md` (section 5, after the Stops table)
- **Test:** `tests/assets-fixes.test.mjs`: "the ladder puts real items before code for footage, photos, overlays and sound; code is first only for its listed needs"; `tests/assets-fixes.test.mjs`: "section 0: free no-account downloads need no yes; sign-ins and spending still do"; `tests/assets-fixes.test.mjs`: "sources.json is documented once, with its downloads values, and keys never sit in a project"; `tests/assets-fixes.test.mjs`: "section 1a: the owner's pages before platforms before agencies before stock, searched without being asked"; `tests/assets-fixes.test.mjs`: "section 7: single official clips through yt-dlp are allowed, bulk crawlers still never"; `tests/assets-fixes.test.mjs`: "folders, sidecar and fetch list; Arabic is never burned with drawtext"; `tests/engines-fixes.test.mjs`: "free media downloads and a fetchable reference link are not stage 01 questions"

## L3. Free models and tools are installed, not asked about

- **Note:** The user had to write "you may download any model or tool you need". Free models, tools and packages are installed by Ice and recorded; only paid services or ones that need an account are asked.
- **Trial:** all four raw-footage trials (whisper, demucs and the speaker separation model), 2026-10-28 and 2026-10-29.
- **Scope:** general
- **Rule:** `skills/ice-engines/references/engine-choice.md` (section 7.6, Installs without a question; 7.3 system tools); `skills/ice-engines/references/versions.json` (pins for faster-whisper, demucs, yt-dlp and the models); `skills/ice-motion-director/SKILL.md` (section 5, stop A and the paragraph after the Stops table); `skills/ice-direction/references/questions.md` (slot 25, `Q-tools`); `skills/ice-edit/references/ingest-and-ledger.md` (section 6); the policy header of every `requirements.txt`
- **Test:** `tests/engines-fixes.test.mjs`: "free tools and models install without a question and are recorded"; `tests/lessons.test.mjs`: "edit: free tools and models install without a question; paid or account-bound services stay a question"; `tests/lessons.test.mjs`: "lessons: every requirements.txt says Ice installs the pins itself, without a question"

## L4. A reason for every element

- **Note:** The results copied the reference blindly. Every element needs what triggers it in the speech, what it means, who it is on, when it appears and leaves, and why its colour and shape are so; an element with no reason is cut.
- **Trial:** carney (`ice/plan/REASONS.md`), obama (`ice/reference/aj-iran/ELEMENTS.md`), greenscreen (`ice/reference/aj-reels/TRIGGERS.md`), aj360 (`ice/plan/element-reasons.md`), 2026-10-28 and 2026-10-29.
- **Scope:** general
- **Rule:** `skills/ice-remake/references/notes-files.md` (section 6, Element reasons, the notes file `REASONS.md`); `skills/ice-remake/references/shot-mapping.md` (section 1 item 4); `skills/ice-remake/scripts/recipe.py` (`grammar.element_reasons`); `skills/ice-qa/references/storyboard-lint.md` (section 3b and check 17); `skills/ice-qa/scripts/storyboard_lint.py`; `skills/ice-qa/references/critic-prompts.md`; `skills/ice-film/references/storyboard.md`; `skills/ice-edit/references/broll-and-motion-broll.md` (section 1)
- **Test:** `tests/style-recipe.test.mjs`: "element reasons: REASONS.md is defined with its columns and required for any reference"; `tests/style-recipe.test.mjs`: "shot mapping: an element carries over only with its reason row and a trigger in the new script; one with no reason is cut"; `tests/style-recipe.test.mjs`: "recipe: element reasons, the finishing layer and the content type come from REASONS.md and ANALYSIS.md"; `tests/lessons.test.mjs`: "review: storyboard-lint section 3b ties every element to a trigger and a reason and cuts it without them"; `tests/lessons.test.mjs`: "review: the storyboard linter reds an empty or filler trigger or reason and a table without those columns"; `tests/lessons.test.mjs`: "review: the critics judge element reasons, and read the reference's reasons table when there is one"; `tests/lessons.test.mjs`: "edit: every element in the edit plan is tied to its transcript trigger and reason"

## L5. The speaker stays lit

- **Note:** Ice dimmed the speaker and put them inside the red circle. Dimming, silhouettes and the circle are for the people being talked about; the speaker or guest stays lit and clear.
- **Trial:** carney (D-08 silhouetted the speaker on the red disc; D-22 corrected it), 2026-10-28.
- **Scope:** category: news, explainer and talk-show videos with a speaker on screen
- **Rule:** `skills/ice-edit/references/layers-and-isolation.md` (section 5, The speaker stays lit); `skills/ice-qa/references/critic-prompts.md`; `skills/ice-qa/references/frame-checks.md` (row P1); `skills/ice-qa/references/clarity-gate.md`; `skills/ice-remake/references/shot-mapping.md` (section 1 item 4); `skills/ice-explainer/references/card-library.md`
- **Test:** `tests/lessons.test.mjs`: "edit: 'The speaker stays lit' is the last section of layers-and-isolation, scoped, with its devices"; `tests/lessons.test.mjs`: "edit: the speaker-lit rule is pointed to where looks and overlays are set"; `tests/lessons.test.mjs`: "review: the speaker or guest stays lit in news, explainer and talk-show reviews"

## L6. The finishing layer, measured and applied by reason

- **Note:** Motion blur on fast moves, blur for depth and for entrances and exits, old-film texture, vignette, glow and grade were missing or applied everywhere. Each is measured from the reference (where, how much, why) and applied for its reason with Ice's own tools.
- **Trial:** greenscreen (`ice/reference/aj-reels/FINISHING.md`) and aj360, 2026-10-29.
- **Scope:** general
- **Rule:** `skills/ice-remake/references/measuring.md` (section 9, Finishing layer); `skills/ice-motion/references/motion-blur-and-clock.md` (section 6, Finishing layer); `skills/ice-qa/references/slop-scan.md` (section 5, finishing effects); `skills/ice-qa/references/frame-checks.md` (row B8); `skills/ice-edit/references/ingest-and-ledger.md` (section 5, Finishing layer)
- **Test:** `tests/style-recipe.test.mjs`: "finishing layer: measuring.md records where, how much, how measured and why for each effect, applied only where it says"; `tests/lessons.test.mjs`: "review: the finishing layer section applies each effect only where measured or reasoned, with Ice's own tools"; `tests/lessons.test.mjs`: "review: the slop scan lets a measured or reasoned finishing effect pass and still fails decoration"; `tests/lessons.test.mjs`: "edit: the finishing layer is one pointer section, applied only where measured or reasoned"

## L7. The identity fits the content

- **Note:** A news reference on a non-news video (a service ad for lawyers) came out as a copy of the news channel. When the content type differs from the reference's type, the same editing principles carry an identity that fits the content.
- **Trial:** greenscreen (a lawyers' service ad in the Al Jazeera reels style), 2026-10-28.
- **Scope:** category: remakes and edits that follow a reference with an organisation's identity
- **Rule:** `skills/ice-remake/references/rights-and-modes.md` (section 1, The identity fits the content); `skills/ice-remake/references/style-recipe.md`; `skills/ice-direction/references/questions.md` (slot 24, `Q-identity`)
- **Test:** `tests/style-recipe.test.mjs`: "identity fits the content: rights-and-modes section 1 compares content types; the fitting identity is the auto default"; `tests/engines-fixes.test.mjs`: "Q-identity compares the content type with the reference type"; `tests/lessons.test.mjs`: "lessons: a request for the reference's identity on another content type is a conflict; auto takes the fitting identity"

## L8. Disk space and source quality

- **Note:** The trials ran on a nearly full system drive. Ice checks free space before downloads and renders and works on a drive with room, downloads long sources at 1080p when the output is 1080, and deletes heavy intermediates that can be rebuilt.
- **Trial:** all four raw-footage trials on a system drive with about 1 GB free, 2026-10-28 and 2026-10-29.
- **Scope:** general
- **Rule:** `skills/ice-engines/references/engine-choice.md` (section 7.7, Disk space); `skills/ice-motion-director/scripts/ice-state.mjs` (the `space` command); `skills/ice-engines/references/render-export.md` (section 9, Heavy intermediates); `skills/ice-assets/references/sourcing-and-licenses.md` (section 5, output resolution); `skills/ice-remake/references/measuring.md` (section 7, disk space and clean-up); `skills/ice-edit/references/ingest-and-ledger.md` (sections 3 and 6)
- **Test:** `tests/maintenance-fixes.test.mjs`: "ice-state.mjs space reports free disk space and exits 1 when a path is short"; `tests/engines-fixes.test.mjs`: "disk space is checked with a threshold and rebuildable intermediates are deleted after approval"; `tests/assets-fixes.test.mjs`: "section 5: download at the output resolution, check free disk space, seek only where ranges work"; `tests/lessons.test.mjs`: "edit: disk space is checked first, long sources at the output resolution, rebuildable files cleaned"

## L9. No gap without an event: the reference sets the pace

- **Note:** The Obama trial was delivered with 19.75 s without any event between 2:13 and 2:43 and a slower rhythm than its reference; the gap warning was read as a note. The longest gap and the event density are measured on the reference, the film is not delivered when it exceeds them, and the warning is a blocker.
- **Trial:** obama (Al Jazeera reels style on raw footage), 2026-10-29.
- **Scope:** general
- **Rule:** `skills/ice-remake/references/measuring.md` (section 10, Pacing events); `skills/ice-remake/scripts/recipe.py` (`--events`, which writes the reference's events file); `skills/ice-remake/references/notes-files.md` (the `Pacing:` Recipe notes line); `skills/ice-qa/references/motion-density.md` (section 7, Pacing against the reference); `skills/ice-qa/scripts/motion_check.py` (`--reference-events`, `--pacing-only`); `skills/ice-edit/scripts/validate-plan.mjs` (`plan.reference`); `skills/ice-edit/references/clock-and-grouping.md` (section 3, plan schema); `skills/ice-qa/references/delivery-checks.md` (section 5); `skills/ice-edit/references/edit-types/news-reel.md` (section 2)
- **Test:** `tests/lint-fixes.test.mjs`: "motion_check pacing: a 19.75 s gap fails against a 3 s reference gap even inside a declared hold"; `tests/lint-fixes.test.mjs`: "motion_check pacing: a film within the reference's gap and density passes"; `tests/lint-fixes.test.mjs`: "motion_check pacing: a film under 0.9 of the reference's events per minute fails"; `tests/style-recipe.test.mjs`: "recipe --events: analysis/events.json holds cuts, camera starts, flashes and TIMELINE.md rows, with the longest gap and events per minute"; `tests/lessons.test.mjs`: "lessons: validate-plan blocks a gap over the reference's even with a holdReason, and a slower density (L9)"; `tests/lessons.test.mjs`: "lessons: the pacing gate is measured on the reference and blocks the plan and the render (L9)"

## L10. Fixed identity marks keep their slot

- **Note:** The "Mohawalat Fahm" reel failed the identity test because Ice never placed the channel logo and the programme name that sit fixed in the corner for the whole official reel. When the identity is "as they are", the reference's fixed marks (logo, programme name, corner bug) are measured and placed at the same position and size; when the identity is the user's, the user's mark takes that slot.
- **Trial:** the "Mohawalat Fahm" showcase reel (masked brand test 0 of 6, twice), 2026-10-29.
- **Scope:** category: remakes and edits that follow a reference with an organisation's identity
- **Rule:** `skills/ice-remake/references/measuring.md` (section 11, Fixed marks); `skills/ice-remake/references/notes-files.md` (the `Fixed marks:` Recipe notes line); `skills/ice-remake/scripts/recipe.py` (`look.fixed_marks`); `skills/ice-remake/references/rights-and-modes.md` (section 1, Fixed identity marks); `skills/ice-remake/references/shot-mapping.md` (section 1 item 5); `skills/ice-qa/references/identity-tests.md` (section 8, Fixed identity marks); `skills/ice-qa/references/frame-checks.md` (row R3); `skills/ice-motion/references/composition-and-staging.md` (section 4, outer band); `skills/ice-styles/references/family-broadcast-news.md` (section 2, fixed elements of each package)
- **Test:** `tests/style-recipe.test.mjs`: "recipe: Fixed marks and Depth lines land in the recipe; a missing line is unknown with what would measure it"; `tests/lessons.test.mjs`: "lessons: fixed identity marks are measured, placed by the identity choice and checked from 05 (L10)"

## L11. Captions face a fresh transcript of the final audio

- **Note:** The Obama trial delivered its captions without comparing them with a fresh transcript of the final audio. The comparison is a mandatory, blocking gate: a new speech-to-text run on the delivered mix, never the transcript the captions were built from.
- **Trial:** obama, 2026-10-29.
- **Scope:** general
- **Rule:** `skills/ice-qa/references/captions-and-sync.md` (section 1b, Fresh transcript gate); `skills/ice-type/scripts/align_script_to_asr.py` (`--check-captions`); `skills/ice-type/references/caption-timing-and-truth.md` (sections 4 and 6); `skills/ice-qa/references/delivery-checks.md` (section 5); `skills/ice-edit/SKILL.md` (row 10 deliver); `skills/ice-arabic/references/asr-timing.md` (section 5)
- **Test:** `tests/lessons.test.mjs`: "lessons: --check-captions passes exact captions and blocks a missing word, a late cue and bad input; Arabic folds"; `tests/lessons.test.mjs`: "lessons: captions face a fresh transcript of the final audio, blocking at 09 and 10 (L11)"

## L12. Depth, 3D and camera movement carry over

- **Note:** The references used 3D and depth (a 2.5D photo-card field with a push-through, 3D flags, the speaker desaturated and pushed back, the camera moving in 38 to 63 percent of frames; text wrapped on a cylinder and Blender sets in the tutorials), yet none of the four trial videos and not the "Mohawalat Fahm" reel had any 3D, and Ice's reference analysis never detected it. Every aspect of a reference is measured and carried over (3D, depth, camera, finishing, sound), not only its colours and text; each depth or 3D element gets a build route, and the film is gated against the reference within plus or minus 30 percent.
- **Trial:** all four raw-footage trials and the "Mohawalat Fahm" showcase reel, 2026-10-28 and 2026-10-29; research `aj360/BREAKDOWN.md` (18 depth notes) and the compositing tutorials, 2026-10-29.
- **Scope:** general
- **Rule:** `skills/ice-remake/references/measuring.md` (section 12, Depth, 3D and camera, the one home of the principle); `skills/ice-remake/references/notes-files.md` (the `Depth:` Recipe notes line); `skills/ice-remake/scripts/recipe.py` (`grammar.depth`); `skills/ice-remake/references/shot-mapping.md` (section 1 item 6, `build:`); `skills/ice-motion/references/depth-and-3d.md` (section 7, Build routes for depth and 3D; section 5, card field push-through); `skills/ice-qa/references/motion-density.md` (section 8, Depth and camera against the reference); `skills/ice-qa/scripts/motion_check.py` (`--reference-depth`, `--depth`); `skills/ice-qa/references/storyboard-lint.md` (check 21); `skills/ice-qa/scripts/storyboard_lint.py`; `skills/ice-edit/SKILL.md` (compound requests); `skills/ice-styles/references/family-broadcast-news.md` (section 2, depth of each package)
- **Test:** `tests/lint-fixes.test.mjs`: "motion_check depth: a film with no 3D fails against a reference with a card field and camera share 0.5"; `tests/lint-fixes.test.mjs`: "motion_check depth: the same kinds pass at camera share 0.4 and fail at 0.3"; `tests/lint-fixes.test.mjs`: "storyboard_lint: cites must be said, subjects come from the vocabulary, depth rows name a build route, a continuous take is declared"; `tests/style-recipe.test.mjs`: "measuring and the plan carry pacing, fixed marks, depth and a reel cut from an episode (lessons L9, L10, L12)"; `tests/lessons.test.mjs`: "lessons: depth, 3D and camera are measured, mapped with a build route and gated against the reference (L12)"
