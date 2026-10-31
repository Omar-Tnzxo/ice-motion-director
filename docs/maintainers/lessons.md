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

## L13. Full capacity by default: a craft plan for every video

- **Note:** In every trial the founder found a capability the content or the reference called for that Ice did not use on its own (3D and depth, finishing, sound, a reason for each element); a capability reached a film only when its type file named it, a reference measured it, the news reel package carried it, or the user asked. The director now decides every craft dimension for every video, from the content, the type, the reference and the style; "not asked" is never a reason, and the build is checked against the plan.
- **Trial:** the full-capacity audit (maintainer research, not published: six trials and the style-bible research), 2026-10-29.
- **Scope:** general
- **Rule:** `AGENTS.md` (rule 20); `skills/ice-direction/references/treatment.md` (section 11, Craft plan, the one home); `skills/ice-direction/references/decision-process.md` (the major decision Craft plan); `skills/ice-direction/SKILL.md` (Part B); `skills/ice-motion-director/references/state.md`; `skills/ice-motion-director/references/routes.md`; `skills/ice-motion-director/references/step-mode.md` (02 and 05 cards); the `## Spine stages` of `skills/ice-film/SKILL.md`, `skills/ice-explainer/SKILL.md`, `skills/ice-remake/SKILL.md`, `skills/ice-edit/SKILL.md`, `skills/ice-ideas/SKILL.md`, `skills/ice-lottie/SKILL.md`; `skills/ice-qa/SKILL.md` (gates A2 and D2, hard release gates); `skills/ice-qa/scripts/craft_gate.py` (`plan`, `build`); `skills/ice-qa/references/critic-prompts.md` (the capacity question); `docs/maintainers/architecture.md` (2b, Craft plan)
- **Test:** `tests/shift-left.test.mjs`: "craft plan: treatment.md is its one home, with all 18 codes, the run file, the banned reasons and the defaults"; `tests/shift-left.test.mjs`: "craft plan: AGENTS.md rule 20 points to its home and the gate"; `tests/shift-left.test.mjs`: "craft plan: every workflow's spine rows draft it at 02, map and check it at 04, lock it at 05 and check the build"; `tests/shift-left.test.mjs`: "craft plan: the router, the run-state schema, the route contracts and the decision log carry it without a new stop"; `tests/shift-left.test.mjs`: "craft plan: critics ask the capacity question and judge recorded devices by their rows"; `tests/shift-left.test.mjs`: "architecture.md maps the craft plan to its earliest stage and lists its run file"; `tests/scripts.test.mjs`: "craft_gate.py build: a locked take with a graphic every 4 s passes the idle check, a bare 9 s take fails, and the free-text amount is never the limit"; `tests/scripts.test.mjs`: "craft_gate.py build: a user frame:flash row lifts only the flash windows inside its shots and within its amount"; `tests/scripts.test.mjs`: "craft_gate.py plan: a complete plan passes; a missing code, a banned reason, a style need set to not_use, an unknown where id and an unanswered number each fail"

## L14. Taste bans are conditions: the user, the reference, the style and the content outrank them

- **Note:** The audit counted 153 craft and taste rules written as absolute bans (38 enforced by a script); 0.2.4 scoped about 45 of them to news reels only, and no rule yielded to the style the user chose, so the next style hit the same walls. Every taste rule is now a default: the user's own words, a measured reference value, the chosen style's craft profile or a content trigger, recorded as a plan row or an exemption row with its rule id, shots and amount, lets the device pass; truth, rights, safety, accessibility, legibility, Arabic correctness and L5 are never lifted.
- **Trial:** the full-capacity audit (maintainer research, not published: six trials and the style-bible research), 2026-10-29 (research note "absolute-rules").
- **Scope:** general
- **Rule:** `skills/ice-direction/references/treatment.md` (section 11.7, Precedence and exemptions); `skills/ice-qa/SKILL.md`; `skills/ice-qa/references/slop-scan.md`; `skills/ice-motion/references/composition-and-staging.md`; `skills/ice-qa/scripts/storyboard_lint.py` (`load_craft_plan`, `exemption_for`); `skills/ice-qa/scripts/_cdp.mjs` (`loadCraftPlan`, `exemptionFor`); `skills/ice-qa/scripts/lint.mjs`; `skills/ice-qa/scripts/art-check.mjs`; `skills/ice-qa/scripts/film_gate.py`; `skills/ice-qa/scripts/look.py`; `skills/ice-qa/scripts/seam-gate.mjs`; `skills/ice-edit/scripts/validate-plan.mjs`; `skills/ice-motion/scripts/validate_motion_contract.py`
- **Test:** `tests/shift-left.test.mjs`: "craft plan: the precedence and exemptions subsection holds the order, the row schema, the rule ids and the never-lifted list"; `tests/lessons.test.mjs`: "lessons: taste bans are conditions: the slop scan says delete the element or show its plan or exemption row (L14)"; `tests/lessons.test.mjs`: "lessons: news reel allowances are one case of general rules: long takes, a second voice hue, sound under speech, flashes (L14)"; `tests/lint-fixes.test.mjs`: "exemptions: the Python and Node readers agree on covered, out-of-shots, over-amount and never-lifted rows"; `tests/lint-fixes.test.mjs`: "exemptions: storyboard_lint reds a text-led opening and text share without a row and passes them with a style row"; `tests/lint-fixes.test.mjs`: "exemptions: storyboard_lint accepts 'measured: <REASONS row>' as a reason and reds 'measured' with no row"; `tests/lint-fixes.test.mjs`: "exemptions: film_gate gate 3 passes a blue-purple ground as exempt with a film:blue_purple_share row"; `tests/lint-fixes.test.mjs`: "exemptions: lint.mjs passes a data-identity-mark with the plan's identity row, reports craft_marks and writes boxes"; `tests/lint-fixes.test.mjs`: "exemptions: art-check passes a flat-fill hero with art rows from its style and still fails it without them"; `tests/lint-fixes.test.mjs`: "exemptions: lint.mjs lifts T1 typing with a style row and a content row too, and never Arabic letters"; `tests/lint-fixes.test.mjs`: "exemptions: a content row cannot lift film:hero_share or any story check, while a style row can"; `tests/lint-fixes.test.mjs`: "exemptions: a content row written at stage 07 is ignored, a style or user row written at 07 still lifts"; `tests/lint-fixes.test.mjs`: "exemptions: storyboard_lint reds 'measured' in a Trigger cell and a REASONS.md row that does not exist"; `tests/news-reel.test.mjs`: "exemptions: validate_motion_contract.py reads shots given as the string all, checks the source kind and ignores a row with no source"; `tests/news-reel.test.mjs`: "edit floor: shots given as the string all lifts the floor in validate-plan, and a row with no valid source or a late content row is ignored"; `tests/scripts.test.mjs`: "craft_gate.py plan: a malformed exemption row is red, a well-formed one passes"

## L15. Depth is a craft, not an exception

- **Note:** "3D only where it explains something physical" and the slop item "a tilted card as depth" failed the measured 2.5D photo-card field with a camera push-through of the references, and no trial used depth on its own. Depth (2.5D planes, card fields, push-through, text in depth, real 3D) is used when the content names several items together, the idea is spatial, the type's floor asks for layers, or the style or reference has it; a lone tilted card with nothing at depth still fails.
- **Trial:** carney, obama, greenscreen and the "Mohawalat Fahm" reel (no depth), aj360 (depth only by the user's prompt), 2026-10-28 and 2026-10-29.
- **Scope:** general
- **Rule:** `skills/ice-motion/references/depth-and-3d.md` (sections 1 and 7); `skills/ice-qa/references/slop-scan.md` (N16 and the 3D row); `skills/ice-direction/references/treatment.md` (sections 11.5 and 11.6)
- **Test:** `tests/lessons.test.mjs`: "lessons: depth is a craft: N16 and depth-and-3d pass a card field with parallax and fail a lone tilted card (L15)"

## L16. Text never covers a face, checked on frames

- **Note:** The rule "never cover the face" lived in about 20 files and no script checked it, so the carney trial shipped huge titles over the speaker's face and the obama storyboard planned a word over a face. Face coverage is measured on the render: face boxes per sample, text and card boxes from the build or a text detector, at least 30 percent of the face box uncovered in every 0.3 s window, nothing on the mouth, chin or eye band.
- **Trial:** carney (titles over the face), obama (planned at the storyboard), greenscreen (caught only by a cold reader), 2026-10-28 and 2026-10-29.
- **Scope:** general
- **Rule:** `skills/ice-type/references/caption-placement-safe-zones.md` (section 4); `skills/ice-qa/scripts/craft_gate.py` (`build`, faces); `skills/ice-qa/scripts/lint.mjs` (`--boxes-out`); `skills/ice-edit/SKILL.md` (the face rule); `skills/ice-qa/SKILL.md` (hard release gates)
- **Test:** `tests/scripts.test.mjs`: "craft_gate.py build: a box on the mouth band fails the face check, a box beside the face passes it"; `tests/lint-fixes.test.mjs`: "craft_gate.py boxes: lint.mjs --boxes-out leaves out text behind the subject and the frame of the speaker's own video"

## L17. Every route has a floor: edits are measured too

- **Note:** The richness floor existed only for films and explainers; `motion-density.md` said edit types have no floor, and all six trials were edits or remakes, so a slow, bare edit passed every gate. Each edit type now has a coverage floor (elements per minute, the longest bare talk, the share of content triggers answered, the B-roll share), checked on the plan, and every edit gets an independent critic, a clarity read sized to the job, the studio benchmark and, with an identity, the brand test.
- **Trial:** carney, obama (a 19.75 s gap), aj360, the "Mohawalat Fahm" reel (a 21 s take), 2026-10-28 and 2026-10-29.
- **Scope:** category: edits and remakes
- **Rule:** `skills/ice-qa/references/motion-density.md` (section 6.2, the coverage floor of edits); the Coverage floor table of every edit-type file, for example `skills/ice-edit/references/edit-types/talking-head-ad.md`; `skills/ice-qa/scripts/film_gate.py` (gate 4, the edit branch on the render); `skills/ice-edit/references/clock-and-grouping.md` (section 3, `triggers` and `craft`); `skills/ice-edit/scripts/validate-plan.mjs`; `skills/ice-motion-director/references/routes.md` (ice-edit contract)
- **Test:** `tests/news-reel.test.mjs`: "edit floor: a plan under the talking-head-ad coverage floor fails and names each measure"; `tests/news-reel.test.mjs`: "edit floor: a plan:coverage exemption row from the craft plan lifts the floor and is printed with its source"; `tests/news-reel.test.mjs`: "edit floor: an unanswered trigger fails, a notUsed trigger passes, a banned reason does not count"; `tests/news-reel.test.mjs`: "edit floor: a use row of a visual craft code needs a tagged scene or event"; `tests/news-reel.test.mjs`: "edit floor: every edit-type file has a Coverage floor table with the four measures"; `tests/lint-fixes.test.mjs`: "exemptions: film_gate gate 4 reads an edit type's coverage floor on the render and a plan:coverage row lifts it"; `tests/shift-left.test.mjs`: "edit parity: every edit gets an independent critic, a clarity read sized to the job, the studio benchmark and the brand test with an identity"

## L18. The mix is measured for intelligibility and comes with an ear list

- **Note:** No audio item blocked delivery: three of four trials shipped a true peak over their own ceiling labelled pass, no script measured speech against the music, an impact sat on a doubtful word, and nobody listened. The delivered mix is audited (loudness by profile, voice over bed in the voice band, clicks, clipping, DC, phase, stream spec, silences, music ending), masked words are told apart from misheard ones, and a generated "For your ears" list goes in the delivery note.
- **Trial:** carney, obama and aj360 (true peak over target), the "Mohawalat Fahm" reel (19 percent of voiced windows with the music less than 6 dB under the voice, an impact on a doubtful word), 2026-10-28 and 2026-10-29.
- **Scope:** general
- **Rule:** `skills/ice-qa/references/audio-gates.md` (section 2b, blocking audit items); `skills/ice-audio/references/mix-and-master.md` (section 5, the Gate column of the profiles; the human listen generated as the ear list); `skills/ice-audio/scripts/qc.py` (`--audit`, `--diagnose`); `skills/ice-qa/scripts/quick-checks.mjs` (`loudness --profile`); `skills/ice-type/scripts/align_script_to_asr.py` (`--stem`); `skills/ice-audio/scripts/master_audio.py` (`cut_at_end`); `skills/ice-qa/references/captions-and-sync.md` (section 1b, step 5); `skills/ice-qa/references/delivery-report.md` (For your ears); `skills/ice-qa/references/delivery-checks.md` (Audio audit); `skills/ice-audio/references/voiceover.md` (the diagnosis switches the symptom table on)
- **Test:** `tests/audio-fixes.test.mjs`: "audit: a bed louder than the voice in 1 to 4 kHz blocks A3; a bed far under the voice passes (generated tones)"; `tests/audio-fixes.test.mjs`: "audit: a DC offset blocks A9 (generated tones)"; `tests/audio-fixes.test.mjs`: "audit: the ear list has 5 to 7 items, each with a time, a yes or no question, why a machine could not settle it and the fix"; `tests/audio-fixes.test.mjs`: "audit: the qc.py profile table equals the gate column of mix-and-master.md section 5, and quick-checks.mjs carries the same"; `tests/audio-fixes.test.mjs`: "audit: quick-checks.mjs loudness --profile exits 1 on a clip far from the profile, output lines kept (generated tone)"; `tests/audio-fixes.test.mjs`: "audit: align_script_to_asr.py --stem-words and --mix-words mark a masked word (exit 1) and send a misheard one to the ear list"; `tests/audio-fixes.test.mjs`: "audit: master_audio.py records a voiceover cut at the film end and fails the master (render)"; `tests/audio-fixes.test.mjs`: "audit: qc.py --diagnose finds mains hum and a raised noise floor, and passes a clean voice (generated tones)"

## L19. The speaker recedes, never darkens

- **Note:** The references push the speaker back and desaturate them while an inserted image of another person is the subject; Ice blocked any change to the speaker, and the 0.2.4 news reel exception failed its own luma check. The speaker stays lit while speaking (L5). The recede window is an inserted image or card of another person or thing as the subject of the frame. While the speaker talks inside it: only a scale back and a partial desaturation (at the reference's measured amounts when one measures them), never fully grey or sepia, never dimmed, never defocused. While the speaker is silent inside it: also a dimming of at most 15 percent luma (a cap, even when a reference measures more) and a light defocus. Back at source exposure, colour and scale on the frame the image leaves or on the next stressed word; never a silhouette, a ring, a disc or a mark on the speaker. The exact terms live in `skills/ice-edit/references/layers-and-isolation.md` section 5.
- **Trial:** the "Mohawalat Fahm" reel and the style-bible research (a speaker desaturated and pushed back), 2026-10-29.
- **Scope:** category: videos with a speaker on screen and inserted images
- **Rule:** `skills/ice-edit/references/layers-and-isolation.md` (section 5, The speaker stays lit, the one home of the recede window); `skills/ice-qa/references/frame-checks.md` (row P1); `skills/ice-qa/references/critic-prompts.md` (item 5); `skills/ice-motion/references/depth-and-3d.md` (section 3, sharp while speaking)
- **Test:** `tests/lessons.test.mjs`: "lessons: the speaker recedes inside a planned window and is never darkened while speaking (L19)"

## L20. Outside material looks outside

- **Note:** Three rules asked for one grade for all sources, so archive and agency footage sat in the film's own grade, and the warm grade of outside images in the references stayed a news-only rule. Any film that mixes its own footage with outside material picks one outside-material treatment at 05 (monochrome, desaturation with lifted blacks, a warm duotone, a palette tint) and applies it per source class; the speaker never takes it.
- **Trial:** carney and obama (a per-source look chosen by the agents themselves), greenscreen (footage left as source), the style-bible research, 2026-10-29.
- **Scope:** general
- **Rule:** `skills/ice-edit/references/broll-and-motion-broll.md` (section 3, Outside material); `skills/ice-direction/references/color.md` (section 5, One grade per source class); `skills/ice-assets/references/ai-media-policy.md`; `skills/ice-motion/references/motion-blur-and-clock.md`; `skills/ice-edit/scripts/grade.py`; `skills/ice-edit/scripts/render.py`
- **Test:** `tests/lessons.test.mjs`: "lessons: outside material looks outside, in any film, with one treatment and never on the speaker (L20)"; `tests/news-reel.test.mjs`: "grade: grade.py lists news_clean and the outside-material presets, clean and neutral"; `tests/news-reel.test.mjs`: "grade: render.py applies a grade per EDL range by source_class or range grade (dry run)"

## L21. Every style states its craft needs

- **Note:** None of the 151 catalog styles said what craft it needs to be made at full capacity (shadows and texture for paper, light and focus for 3D, counters for data), and 53 entries said "Sound: not specified". Every style family carries a craft profile (needs, serves when, never) that the director copies into the craft plan at 05, and every entry writes its own line or the explicit `family default` marker (0.2.6: 161 entries with their own line, re-read by read-only critics against the entry text).
- **Trial:** the full-capacity audit (maintainer research, not published: six trials and the style-bible research), 2026-10-29 (research note "styles-and-type-defaults").
- **Scope:** general
- **Rule:** `skills/ice-styles/references/style-method.md` (section 4, the `Craft:` lock line; section 10, Craft profile); `skills/ice-styles/SKILL.md` (procedure step 5); the family files, for example `skills/ice-styles/references/family-print-paper-craft.md`; `skills/ice-styles/references/directions-openers-explainers.md` (Craft column)
- **Test:** `tests/art-quality.test.mjs`: "styles: every style entry has its own craft profile line or an explicit family default marker"; `tests/art-quality.test.mjs`: "styles: every lifts id in a craft profile line is a treatment.md 11.7 rule id its gate prints"; `tests/art-quality.test.mjs`: "styles: every family file has one family default craft profile line in the 18 codes, every never with its reason"; `tests/art-quality.test.mjs`: "styles: entry craft profile lines inherit the family default, use only the 18 codes and cover every unspecified-sound and thin entry"; `tests/art-quality.test.mjs`: "styles: style-method.md requires the craft profile field and locks it with the Craft: line"

## L22. Anti-sameness guards Ice's own choices, never the user's

- **Note:** The 4-of-6 template distance, the cross-project fingerprint and the unexpected directions of the pitch round pushed a film away from the reference, style, brand identity or series look the user chose. They now apply to Ice's own choices only; a look the user chose is exempt on the axes it fixes, while research before decisions and the decision log stay. Founder decision, in his words: "yes, exempt it".
- **Trial:** the full-capacity audit (maintainer research, not published: six trials and the style-bible research), 2026-10-29 (research note "absolute-rules", N113 and N114); founder decision, 2026-10-29.
- **Scope:** general
- **Rule:** `AGENTS.md` (rule 2); `skills/ice-direction/references/anti-sameness.md` (section 4a, A look the user chose); `skills/ice-qa/references/anti-sameness-gates.md` (sections 2, 3 and 4); `skills/ice-direction/references/pitch-round.md`
- **Test:** `tests/lessons.test.mjs`: "lessons: anti-sameness guards Ice's own choices; a look the user chose is exempt on its axes (L22)"

## L23. Pace is measured on the render, not on the plan

- **Note:** The pacing gate compared the plan's declared events with the reference, so a camera move or a card the render never showed still counted, and films without a reference had no pace floor at all: a single take passed a shorts gate. Pace is now measured on detected cuts and visible changes of the render; a declared event with no measured change within 2 frames fails as "declared, not visible", and every film and edit type carries one machine-readable `Rhythm row:` line that gate 5 reads when no reference is followed.
- **Trial:** the full-capacity audit (maintainer research, not published: research note "inventory-type-data-identity-rhythm" C and E.4, E.5), 2026-10-29.
- **Scope:** general
- **Rule:** `skills/ice-qa/references/motion-density.md` (section 6.3, Rhythm row without a reference; section 7, Pacing against the reference); `skills/ice-qa/scripts/motion_check.py` (`--measure`); `skills/ice-qa/scripts/film_gate.py` (gate 5); `skills/ice-remake/scripts/compare.py` (detected cuts, `contract:<stat>`); `skills/ice-remake/references/shot-mapping.md` (section 4); the `Rhythm row:` line of every file in `skills/ice-film/references/film-types/` and `skills/ice-edit/references/edit-types/`; `skills/ice-direction/references/treatment.md` (section 11.7, the rhythm rule ids); `skills/ice-qa/references/delivery-checks.md` (Pace on the render)
- **Test:** `tests/lint-fixes.test.mjs`: "motion_check on the render: a declared camera move and a graphic the render does not show fail as declared, not visible"; `tests/lint-fixes.test.mjs`: "motion_check on the render: mean shot length and cuts per minute more than 30 percent off the reference's detected cuts fail"; `tests/lint-fixes.test.mjs`: "motion_check without a reference: --measure checks the declared events alone, and a declared-only pacing run says so"; `tests/lint-fixes.test.mjs`: "film_gate gate 5: a single take fails the shorts rhythm row, a cut on the row passes, and only a user, reference or style row lifts it"

## L24. Real footage is fetched by a shipped script, and a project file is read

- **Note:** Every trial agent wrote its own download code for archive and official clips, with no sidecar, no license status and no size or offline check, and an After Effects project the user supplied could only be asked for as a render. A shipped fetcher now runs the no-key routes (Openverse, Wikimedia Commons, Internet Archive, NASA, one official clip at a time through the pinned yt-dlp) with the words the agent passes from the script or brief, and writes the sidecar, manifest row and credits row of every item; `analyze.py` reads an `.aep` for its comps, layers and transform keys without running anything from it.
- **Trial:** carney, obama and aj360 (hand-written fetchers, missing records), the editor-sources research (the tested `ice_fetch.py` prototype) and the Al Jazeera tutorial drive assets (an `.aep` read by hand, keys in units of 1/30 s), 2026-10-28 and 2026-10-29.
- **Scope:** general
- **Rule:** `skills/ice-assets/scripts/fetch_media.py`; `skills/ice-assets/references/sourcing-and-licenses.md` (section 4, The fetcher); `skills/ice-assets/references/project-folders.md` (section 3b); `skills/ice-remake/scripts/analyze.py` (After Effects projects); `skills/ice-remake/references/rights-and-modes.md` (section 2, Reference kinds)
- **Test:** `tests/assets-fixes.test.mjs`: "ICE_OFFLINE and sources.json refuse before any network call (exit 3), a download under ask waits for --yes, nothing is written"; `tests/assets-fixes.test.mjs`: "one official clip at a time: channel, playlist and search pages are refused before yt-dlp runs"; `tests/assets-fixes.test.mjs`: "record writes the sidecar, manifest row and credits row of project-folders.md, offline, and the asset gate passes"; `tests/assets-fixes.test.mjs`: "the script holds no query and no browser User-Agent, and the sourcing docs point to it"; `tests/style-recipe.test.mjs`: "aep: analyze.py reads a synthetic After Effects project's comp, layer and transform keys, and refuses a file that is not RIFX"

## L25. Every sound effect is heard in the mix, on time

- **Note:** Sound effects were placed in `sfx.json` and counted, but nothing proved they were heard: a whoosh under a ducked score or a hit a few frames late passed every gate, level jumps at cuts went unnoticed, and the repeated-pulse check had no time range. The delivered mix is now compared with the same mix rendered without the SFX layer: each cue's in-band lift over that premix, its level against the score and its sync point against its frame. A hero cue not heard or late blocks delivery; more than half of the cues masked blocks; level jumps at cuts and the longest unchanged repeat go to the ear list with their times.
- **Trial:** the full-capacity audit (maintainer research, not published: research note "inventory-audio" sections 5 and 6: carney, obama, aj360 and the "Mohawalat Fahm" reel), 2026-10-29.
- **Scope:** general (every video with sound effects; A7 and A17 every video with sound)
- **Rule:** `skills/ice-qa/references/audio-gates.md` (section 2b, A7, A14 and A17; section 2, Effects present and audible); `skills/ice-audio/scripts/qc.py` (`--audit`, `--premix`, `--sfx`); `skills/ice-audio/scripts/master_audio.py` (`--no-sfx-premix`); `skills/ice-audio/references/mix-and-master.md` (section 7); `skills/ice-audio/references/sfx.md` (section 6)
- **Test:** `tests/audio-fixes.test.mjs`: "audit A14: each cue is measured against the no-SFX premix; a late hero cue blocks, other cues report (generated tones)"; `tests/audio-fixes.test.mjs`: "audit A7: an unexplained level jump at a cut goes to the ear list, a cue explains another, and A7 never blocks (generated tones)"; `tests/audio-fixes.test.mjs`: "audit A17: the longest unchanged repeat gets an ear-list item with its time range; a moving bed has no finding (generated tones)"; `tests/audio-fixes.test.mjs`: "audit docs: audio-gates.md section 2b gates A7, A14 and A17, and the other files point to them"

## L26. Depth, finishing, grade, fixed marks and the speaker are measured on the render

- **Note:** Depth, finishing effects, the grade per source class, fixed identity marks and the speaker's light were checked on the plan or by a critic's eye, never on the render's pixels: a flat pan passed a depth gate written from the plan, grain landed on shots the plan never named, an archive clip kept the film's own colour, a logo rode the camera, and a speaker was dimmed while talking. `craft_gate.py measure` now writes depth from dense optical flow, and `build` checks finishing per shot, the grade per source class, each fixed mark's slot and the speaker's luma and saturation inside and outside the recede windows.
- **Trial:** the full-capacity audit (maintainer research, not published: research note "inventory-visual" section 10), 2026-10-29.
- **Scope:** general
- **Rule:** `skills/ice-qa/scripts/craft_gate.py` (`measure` depth; `build` finishing, grade, marks, speaker); `skills/ice-edit/references/layers-and-isolation.md` (section 5); `skills/ice-remake/references/measuring.md` (sections 9, 11 and 12); `skills/ice-qa/references/frame-checks.md` (rows B8, B9, P1 and R3); `skills/ice-qa/references/identity-tests.md` (section 8); `skills/ice-motion/references/depth-and-3d.md` (section 2); `skills/ice-direction/references/treatment.md` (section 11.7, `frame:B9`)
- **Test:** `tests/scripts.test.mjs`: "craft_gate.py measure: a parallax pan (a near band three times faster than its ground) writes 2 planes to <video>.depth.json for motion_check.py; a flat pan of one picture writes 1 plane"; `tests/scripts.test.mjs`: "craft_gate.py build: grain where the finish row names it passes; grain on a shot the row does not name is red, and the named shot without grain is red"; `tests/scripts.test.mjs`: "craft_gate.py build: an archive source class graded outside_mono is red in colour and passes in monochrome against the film's own colour world"; `tests/scripts.test.mjs`: "craft_gate.py build: a fixed mark in its slot over a moving camera passes; a mark that rides the camera, sits 3 percent off its slot or goes missing for 1.2 s is red"; `tests/scripts.test.mjs`: "craft_gate.py build: inside a recede window a speaker dimmed while speaking or dimmed 30 percent while silent is red; a scale back with partial desaturation while speaking and a 10 percent dim while silent pass"; `tests/scripts.test.mjs`: "craft_gate.py depth: a push-in whose near plane grows past 1.3x and touches the frame edge counts one push-through; inside the frame, too short or one plane counts none"

## L27. Silence is never a waiver, in every workflow

- **Note:** The founder asked for four choices on every open decision before any work (2026-10-22) and said silence is not consent. The completeness audit of 0.2.6 found workflow files that still took defaults when the stage 01 questions got no answer, asked only when the run could not continue, or spoke of one single stage 01 message; the README still promised at most four questions in total.
- **Trial:** the completeness audit of 0.2.6 (CONFLICTS M2, M3 and K12), 2026-10-30.
- **Scope:** general
- **Rule:** `skills/ice-direction/references/questions.md` (sections 1, 2 and 5, the one home); `skills/ice-edit/references/edit-types/broll-overlay.md` (step 1); `skills/ice-explainer/references/run-setup.md` (Fast pipeline section); `skills/ice-ideas/references/script-writing.md`; the Stops and approvals line of `skills/ice-edit/SKILL.md`, `skills/ice-explainer/SKILL.md`, `skills/ice-ideas/SKILL.md`, `skills/ice-lottie/SKILL.md`, `skills/ice-remake/SKILL.md`; `README.md` (Why it is different)
- **Test:** `tests/questions-four-choices.test.mjs`: "no workflow file takes a default when the stage 01 questions get no answer (L27)"

## L28. Sound by code is never a default, in styles and remakes too

- **Note:** The founder rejected code-made music and effects (L1), yet style Sound lines said "all synthesized" with their own fixed loudness, and the frame-locked remake synthesized effects and allowed a generated track by default.
- **Trial:** the completeness audit of 0.2.6 (CONFLICTS K01, K03, K16), 2026-10-30.
- **Scope:** general
- **Rule:** `skills/ice-styles/SKILL.md` (The one rule); every Sound line of the style family files in `skills/ice-styles/references/`; `skills/ice-remake/references/rights-and-modes.md` (section "Frame-locked remake mode (frame by frame, parallel agents)"); `skills/ice-audio/SKILL.md` (core rule 7)
- **Test:** `tests/lessons.test.mjs`: "lessons: sound by code is never a style's or a remake's default; loudness comes from the ice-audio table (L28)"

## L29. The craft plan is locked before the script

- **Note:** Full capacity (rule 20) depends on a craft plan from 02, but the run state let stage 03 start without one.
- **Trial:** the completeness audit of 0.2.6 (RESEARCH-COVERAGE H31, open since the 0.2.5 handover), 2026-10-30.
- **Scope:** general
- **Rule:** `skills/ice-motion-director/scripts/ice-state.mjs` (`check`, `needsCraftPlan`); `skills/ice-direction/references/treatment.md` (section 11)
- **Test:** `tests/lessons.test.mjs`: "lessons: ice-state check refuses stage 03 and later without the craft plan (L29)"

## L30. A look the user chose is exempt everywhere the distance rule is stated

- **Note:** The founder exempted the user's own look from anti-sameness (2026-10-29, L22), but six files still stated the 4 of 6 distance from a style's demo without the exemption, so a user who named a style could be pushed away from it.
- **Trial:** the completeness audit of 0.2.6 (CONFLICTS K02), 2026-10-30.
- **Scope:** general
- **Rule:** `skills/ice-direction/references/anti-sameness.md` (section 4a, the one home); `skills/ice-styles/SKILL.md`; `skills/ice-engines/references/hyperframes.md`; `skills/ice-explainer/references/grammar-selection.md`; `skills/ice-film/references/film-types/product-launch.md`; `skills/ice-direction/SKILL.md`; `skills/ice-film/SKILL.md`
- **Test:** `tests/lessons.test.mjs`: "lessons: a look the user chose is exempt from template distance in every file that states it (L30)"

## L31. A package row never dims the speaker

- **Note:** The broadcast package said the speaker desaturates and dims while a discussed-person symbol plays, against L5 and L19.
- **Trial:** the completeness audit of 0.2.6 (CONFLICTS K04), 2026-10-30.
- **Scope:** category: news, explainer and talk-show videos with a speaker on screen
- **Rule:** `skills/ice-styles/references/family-broadcast-news.md` (package rows); `skills/ice-edit/references/layers-and-isolation.md` (section 5)
- **Test:** `tests/lessons.test.mjs`: "lessons: a package row never dims the speaker while speaking (L31)"

## L32. Free installs and downloads are never asked, in every workflow

- **Note:** Rule 4 (2026-10-29) says free downloads and pinned free installs are never questions, but the Lottie scripts still asked before the Playwright browser, and the explainer, the film delivery note and the research rules still treated installs and downloads as consent items.
- **Trial:** the completeness audit of 0.2.6 (CONFLICTS M1, K09, K10), 2026-10-30.
- **Scope:** general
- **Rule:** `skills/ice-lottie/scripts/requirements.txt`; `skills/ice-lottie/scripts/capture_motion_frames.py`; `skills/ice-lottie/scripts/probe_motion_continuity.py`; `skills/ice-explainer/references/run-setup.md`; `skills/ice-film/references/delivery.md`; `skills/ice-direction/references/research.md`
- **Test:** `tests/lessons.test.mjs`: "lessons: free installs and downloads are never consent items, in any workflow (L32)"

## L33. Rights stay with the user in every route

- **Note:** Rules 17 and 18 say no permission questions, yet the art ladder, the raster logo row, the skin rule and the art film still asked for rights or refused what the user asked for.
- **Trial:** the completeness audit of 0.2.6 (CONFLICTS K08, K11), 2026-10-30.
- **Scope:** general
- **Rule:** `skills/ice-assets/references/sourcing-and-licenses.md` (art ladder row 1); `skills/ice-assets/references/brand-authenticity.md` (raster logo row); `skills/ice-direction/references/reference-fidelity.md`; `skills/ice-film/references/film-types/art-film.md`
- **Test:** `tests/lessons.test.mjs`: "lessons: rights to outside material and the user's own art stay with the user, in every route (L33)"

## L34. No unofficial line and no AI label inside the film

- **Note:** The founder took the unofficial line out of the film for gallery demos (2026-10-21) and, on 2026-10-30, for users' films too; platform AI labels are the user's business (rule 17). The skills still put the line on the last frame and an "AI-generated imagery" label on concept films.
- **Trial:** the completeness audit of 0.2.6 (CONFLICTS K06, decided by the founder as option 1A, and K07), 2026-10-30.
- **Scope:** general
- **Rule:** `skills/ice-assets/references/brand-authenticity.md` (step 10); `skills/ice-assets/references/truth-sheet.md`; `skills/ice-direction/references/questions.md`; `skills/ice-assets/references/asset-rules.md`; `skills/ice-assets/references/ai-media-policy.md`; `AGENTS.md` (Gallery demos)
- **Test:** `tests/lessons.test.mjs`: "lessons: no unofficial line and no AI label inside the film; both live in the delivery note and caption (L34)"

## L35. Arabic typing in a real product box, and never drawtext

- **Note:** Product interactions happen as they really do (rule 13), but Arabic letter-by-letter typing was banned in every film type, so an Arabic app ad could not type into its own search box; and one file still allowed ffmpeg drawtext for Arabic.
- **Trial:** the completeness audit of 0.2.6 (CONFLICTS M4, M9), 2026-10-30.
- **Scope:** category: Arabic and mixed-language films
- **Rule:** `skills/ice-arabic/references/letterforms-in-motion.md`; `skills/ice-arabic/references/engine-overrides.md`; `skills/ice-assets/references/fonts.md`
- **Test:** `tests/lessons.test.mjs`: "lessons: Arabic typing in a real product input box is allowed; drawtext never sets Arabic (L35)"

## L36. Fingerprints and local libraries are handled by scripts

- **Note:** Rule 20 says every important rule is measured by a script, but the fingerprint check (4 of 6 axes against the last 30 films) had no script and no test, and the user's local libraries were "indexed and searched first" with no command that did it.
- **Trial:** the completeness audit of 0.2.6 (CONFLICTS K24; RESEARCH-COVERAGE E13), 2026-10-30.
- **Scope:** general
- **Rule:** `skills/ice-qa/scripts/film_gate.py` (`fingerprint check` and `write`); `skills/ice-qa/references/anti-sameness-gates.md` (section 3); `skills/ice-direction/references/anti-sameness.md` (sections 2 to 4a); `skills/ice-assets/scripts/fetch_media.py` (`index`); `skills/ice-assets/references/sourcing-and-licenses.md` (section 0, `local_libraries`)
- **Test:** `tests/lessons.test.mjs`: "lessons: the fingerprint is checked and written by a script; a user's look is never compared (L36)"; `tests/lessons.test.mjs`: "lessons: local libraries are indexed once and searched before the network (L36)"

## L37. News reel trial rules: angles, attribution, dates, minors, and an ad that reads as an ad

- **Note:** The trial reviews found defects that were fixed only inside each run: a reel cut from a multi-camera episode used one wide shot in 66 s while the official reel used 10 of 24; a claim title lost whose claim it was once a channel mark sat beside it; 2022 and 2023 archive could pass as current; a minor's face stayed on screen; and an ad's brand mark came so late that cold viewers read it as news until 11 s.
- **Trial:** the "Mohawalat Fahm" showcase reel and the four raw-footage trials, 2026-10-28 and 2026-10-29; the completeness audit of 0.2.6 (RESEARCH-COVERAGE N31, T09, T13, T17, T18, T19), 2026-10-30.
- **Scope:** category: news reels and edits of real events (the ad rule: films that sell)
- **Rule:** `skills/ice-edit/references/edit-types/news-reel.md` (section 5, items 9 to 11); `skills/ice-assets/references/truth-sheet.md` (section 8); `skills/ice-qa/references/clarity-gate.md` (section 6, rule 5)
- **Test:** `tests/lessons.test.mjs`: "lessons: news reel trial rules: the episode's angles, whose claim, archive dates, minors, an ad reads as an ad (L37)"

## L38. Every case study ships its site package: before and after, source, selection, prompt and story

- **Note:** The founder asked that every case study on the site plays the film in full HD beside the raw source cut to the same parts, says how long the source was and why those minutes were picked, follows the run's real order and timing, and shows the exact prompt with an English translation, a disclaimer and credits. The exporter copied no master, had no before cut and none of those fields.
- **Trial:** the founder's case study v2 request (the maintainers' note "case-study-v2-spec"), 2026-10-30; proved on the "Mohawalat Fahm" showcase run.
- **Scope:** general
- **Rule:** `skills/ice-qa/scripts/export-case-study.mjs` (`--site`, `buildSite`); `docs/maintainers/architecture.md` (Site package); `skills/ice-edit/references/ingest-and-ledger.md` (Source record and selection); `skills/ice-motion-director/references/state.md` (Run log, the prompt translation file)
- **Test:** `tests/lessons.test.mjs`: "lessons: the case study site package carries the films, the source, the selection, the prompt, the story and the disclaimer (L38)"

## L39. Auto mode shows each stage as it lands

- **Note:** The founder saw one draft in a whole day of the Spotify demo and asked to follow the work step by step so a note can land mid-way (2026-10-20); on 2026-10-30 he chose that auto mode sends two lines and the stills of every stage as it lands, without stopping.
- **Trial:** the Spotify gallery demo, 2026-10-20; founder decision 2A, 2026-10-30.
- **Scope:** general
- **Rule:** `skills/ice-motion-director/references/state.md` (Progress in auto mode); `skills/ice-motion-director/SKILL.md` (section 5)
- **Test:** `tests/lessons.test.mjs`: "lessons: auto mode sends every stage as it lands, without a new stop (L39)"

## L40. Short music fails, and the last hand-checked measures get scripts

- **Note:** Four measures the research asked for were still left to the eye or only warned: a music track shorter than the film or looped printed a warning and shipped; the beat error per cut (A20) had no script; the halftone or scanline FFT ratio and the chromatic aberration offset were defined but never computed; and the news reading-text contrast measured on the references (7.8:1 to 20:1) was nowhere written as a floor.
- **Trial:** the completeness audit of 0.2.6 (RESEARCH-COVERAGE N39, N42, R23, X18), 2026-10-30.
- **Scope:** general
- **Rule:** `skills/ice-audio/scripts/master_audio.py` (`--allow-short-music`); `skills/ice-audio/references/mix-and-master.md` (section 6); `skills/ice-audio/scripts/sound_map.py` (`--cuts`, `beat_error`); `skills/ice-qa/references/audio-gates.md` (A20); `skills/ice-qa/scripts/craft_gate.py` (`screen_and_fringe`); `skills/ice-remake/references/measuring.md` (section 9); `skills/ice-styles/references/family-broadcast-news.md` (Type, reading contrast)
- **Test:** `tests/lessons.test.mjs`: "lessons: a short or looped music track fails the master unless the cue sheet allows it (L40)"; `tests/lessons.test.mjs`: "lessons: beat error per cut, halftone and fringe are measured by scripts; news reading text has a contrast floor (L40)"

## L41. The last open items: portraits and flags by route, code-drawn art at 05, the number of music options

- **Note:** Three items of the research were still open after the 0.2.6 audit: the fetcher had no route for a named person's portrait or a flag (the prototype's Wikidata lookups were dropped), the film workflow's stage 05 did not open the code-drawn art rules although the art check runs there, and the number of music options the user hears had no setting.
- **Trial:** the completeness audit of 0.2.6 (RESEARCH-COVERAGE E06, E11, H10), 2026-10-30.
- **Scope:** general
- **Rule:** `skills/ice-assets/scripts/fetch_media.py` (`wikidata_person`, `wikidata_flag`); `skills/ice-assets/references/sourcing-and-licenses.md` (section 0 `music_options`, section 1 Flags, section 4 `wikidata`); `skills/ice-audio/scripts/preview_options.py` (`music_options`); `skills/ice-film/SKILL.md` (spine row 05); `skills/ice-film/references/film-setup.md` (section 3)
- **Test:** `tests/lessons.test.mjs`: "lessons: portraits and flags come through Wikidata routes, stage 05 opens the code-drawn art rules, music_options sets 2 or 3 (L41)"

## L42. Genre conventions are measured, and a general rule a genre contradicts is scoped

- **Note:** The founder watched professional UI motion ads and noted six patterns (something new about every second, the scene changing every 2.5 to 3 s, words appearing one by one with one word in another colour, UI parts pressed by a cursor as the hero, few cuts with things scaling into the next scene, a centred logo on a plain ground at the end, 120 to 126 BPM with a click on every move), adding that there must be dozens more in every genre. The plugin had each idea scattered across film types with wide ranges, and two general rules said the opposite (an SFX ceiling of about 15 per minute and "never under every motion"; a logo only at the end is a wasted sticker).
- **Trial:** the genre playbook pilot on UI and app motion ads (15 films measured with the plugin's own tools), 2026-10-31. Measured: most of the six hold, three only as a variant's option, and the 120 to 126 BPM and click-on-every-move ideas did not hold; both are recorded as rejected.
- **Scope:** category: UI and app motion ads (film types app-ad, product-launch with screens, ui-walkthrough); the method applies to every genre wave.
- **Rule:** `skills/ice-film/references/genres/ui-motion.md`; `skills/ice-qa/scripts/genre_check.py`; `skills/ice-film/SKILL.md` (section 4); `skills/ice-film/references/film-setup.md` (section 1); `skills/ice-qa/SKILL.md` (gate D); `skills/ice-audio/references/sfx.md` (section 4); `skills/ice-film/references/launch-principles.md` (section 6); `skills/ice-film/references/openers-and-endings.md` (section 6); `skills/ice-film/references/film-types/app-ad.md`; `skills/ice-film/references/film-types/product-launch.md`; `skills/ice-film/references/film-types/ui-walkthrough.md`; `skills/ice-audio/references/music-choice-and-licensing.md` (section 3)
- **Test:** `tests/genre-playbooks.test.mjs`: "genre playbooks: every playbook has one fingerprint line whose keys genre_check.py knows"; `tests/genre-playbooks.test.mjs`: "genre playbooks: the two general rules the UI corpus contradicts stay house defaults, scoped by genre"; `tests/genre-playbooks.test.mjs`: "genre playbooks: Omar's hypotheses the corpus did not confirm are recorded as rejected, never as rules"

## L43. A crash in the reference analysis is caught, retried and reported, never silent

- **Note:** `analyze.py` died with a segmentation fault on every video under Windows: numba's compiled beat tracker (librosa `beat_track`, llvmlite 0.48) crashed the interpreter on an AMD znver3 CPU, on the main thread too. The run ended with no `report.json` and an empty log, so the kinetic type genre wave and the UI motion pilot fell back to the fast measures, with shots, camera and the second tempo read left empty.
- **Trial:** the kinetic type genre playbook wave, 2026-10-31 (and the UI motion pilot before it, where `analyze.py` ran on 2 of 15 films).
- **Scope:** general
- **Rule:** `skills/ice-remake/scripts/analyze.py` (`audio_start`, `audio_finish`, `audio_child`: the audio runs in a child process, a crash is retried once with `NUMBA_CPU_NAME=generic`, a second crash writes the report with `audio.error` and exits non-zero; `faulthandler` prints any native crash)
- **Test:** `tests/lessons.test.mjs`: "lessons: a crash in the audio analysis is retried for a plain CPU target, and a second crash fails loudly (L43)"
