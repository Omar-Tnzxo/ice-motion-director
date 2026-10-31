---
name: ice-edit
description: >-
  Internal part of Ice Motion Director, not a command: start with /ice.
  Workflow of Ice Motion Director for editing real footage: long-form and
  course edits, podcast episodes and clips, talking-head ads, shorts and
  reels, B-roll and motion overlays timed to words, and showreels cut on a
  beat grid, delivered as a verified MP4 with EDLs, retimed transcripts and
  captions files. Started by the Ice Motion Director router
  (ice-motion-director), which creates the project first; use only when the
  router hands off or the user names ice-edit.
license: Apache-2.0
metadata:
  author: Omar-Tnzxo
  version: 0.2.9
---

# Ice Edit: editing real footage

You edit the user's own footage by reading it (word-level transcript, a few pictures at decision points), cut it on one shared clock, layer graphics and captions on that clock, and prove every cut on the encoded file before showing it. Paths below are relative to this skill folder; run files go in the user's project under `ice/`.

## First step

Look for `ice/state.json` in the working folder.
- Missing: stop reading this skill. Open the router (`ice-motion-director/SKILL.md`) and follow it; it creates the project, runs the stage 01 intake and calls this workflow back.
- Present: read it and resume at `current` in the recorded `mode`. Never re-ask what the files answer.

## 1. Before you start

1. Read `ice/BRIEF.md` and `ice/DIRECTION.md`. When `ice/DIRECTION.md` is missing, create it with the header of `ice-direction/references/decision-process.md` section 7; never hand back for it. Decisions that change the edit (audience, platform and ratio, goal, must-keep content, commercial or not) are asked only in the stage 01 message (row 01); everything else is decided at the stage that owns it and logged with its reason.
2. Classify the edit type (section 2) and open its file in `references/edit-types/`.
3. Tools, installs and disk space: read `references/ingest-and-ledger.md` section 6 before writing the stage 01 message.
4. Non-commercial-only material is never used here. Arabic or mixed-language footage: run the ice-arabic skill for dialect correction, captions, numerals and text-behind-head effects.

**Read budget.** Each `## Spine stages` row marks its files **Required** (open them, in the order listed) or **Only if <condition>** (open only when the condition holds). A file named with a section: read only that section. Open nothing else, and nothing a file merely mentions, unless the stage cannot be finished without it. `references/` and `scripts/` paths are inside this skill; a path starting with another skill's name is in that skill's folder, next to this one. When the craft plan's `camera` or `depth` row is `use`, rows 04 and 07 also open `ice-motion/references/camera.md` and `depth-and-3d.md`.

**Stops and approvals.** The router's stops table (`ice-motion-director/SKILL.md` section 5, "Stops") is the only list of times the run waits for the user. Auto mode asks only in the stage 01 question rounds and at the one preview approval (the 06 rough cut or animatic, only when the session is interactive and the user did not say not to ask). Every other "ask", "wait", "confirm" or "approve" in this skill and its files means, in auto mode: decide, log it in `ice/DIRECTION.md`, report it in the delivery note; in step mode: put it in that stage's review card. Approval: the user in step mode; in auto mode the approver role (`ice-direction/references/roles.md` section 5), who checks the row's "Done when" column item by item. Every edit type runs clarity read 3 of the cold-viewer gate at 09, sized to the job (`ice-qa/references/clarity-gate.md` sections 1 and 7): a FAIL blocks 10 in every mode.

## 2. Pick the edit type (first match wins)

| The user wants | Edit type file |
|---|---|
| A presenter-led news or explainer reel, from studio footage, a long episode or a news reference | `references/edit-types/news-reel.md` |
| Several cameras, or a conversation, or clips cut from a long episode | `references/edit-types/podcast.md` |
| Existing clips or past work cut to music, no speech to follow | `references/edit-types/showreel.md` |
| Inserts, motion clips, lower thirds or cards added over footage that otherwise stays | `references/edit-types/broll-overlay.md` |
| One speaker to camera, sold as an ad or a recomposed vertical reel with scenes | `references/edit-types/talking-head-ad.md` |
| A short vertical video cut from footage, fast and hook-driven | `references/edit-types/shorts-reels.md` |
| A long recording (minutes or more) kept long, with a visual layer | `references/edit-types/long-form.md` |

Compound requests: a style reference plus footage runs this workflow with the analysis step of the ice-remake skill, which also measures depth, 3D and camera (`ice-remake/references/measuring.md`, "Depth, 3D and camera"); 04 carries each such element with its build route (`ice-motion/references/depth-and-3d.md`, "Build routes for depth and 3D"). A style recipe (`STYLE-RECIPE.md`) plus footage: the recipe is the style reference, read by `ice-remake/references/style-recipe.md` sections 4 and 7 instead of a new analysis. A brand showreel designed from scratch is the ice-film skill.

## 3. The workflow (every edit type)

The workflow runs on the production spine (stages 01 to 10, next section) in the footage-led order the edit-type file names in its `Stage order:` line; for most types it is `01 03 02 04 06 05 [07 08a] 08b 09 10`. The steps below carry names, never numbers; the two-digit number after each name is the spine stage it belongs to. Run them in the order of the `Stage order:` line. This list holds the craft of each step; the files to open and the "Done when" check are in the stage's row in the next section.

- **Ingest (01).** Preserve raw; probe every file; fix VFR, dropped frames and HDR before cutting; shortlist usable intervals; start the footage ledger.
- **Transcribe and read (01).** Word-level transcript per source, cached; pack it into phrases; pre-scan for slips and named entities.
- **Paper edit (03).** Numbered script from the transcript (the script gate). Clean the speech on paper in the order of `references/silence-and-retakes.md` section 1. Short form also writes three openings and the open loops here. Versions step: plan every version and cutdown here.
- **Approach (02).** The strategy in 4 to 8 sentences, written beside the numbered script; house rhythm ranges for the type.
- **B-roll and overlay plan (04).** Every insert, overlay, keyword, lower third, mark, cutout and motion B-roll tied to the word or sentence that triggers it, with its time and reason; where each layer sits.
- **Rough cut and clock lock (06).** Cut between sentences (joins, padding, J and L cuts, render method: `references/cut-craft.md`); lock the clock on one EDL with word anchors, every layer derived from it (`references/clock-and-grouping.md`). Short form runs the first-three-seconds gate and an animatic before polish.
- **Grade and caption style (05).** Grade policy (untouched by default; a bounded grade only after its before and after is approved); finishing effects only where measured or reasoned (`references/ingest-and-ledger.md` section 5; reason: the craft plan's `finish` row); vertical layout mode and safe zones; caption text, grouping and styling come from the ice-type skill.
- **Fine cut and overlays (07).** Build and place the B-roll and motion B-roll on words, speaker isolation, the vertical reframe, captions applied last.
- **Sound (08a beside 07, 08b after 07).** Music, effects, voice and loudness come from the ice-audio skill's ladder (sound made by code only when the user names it); this workflow keeps the edit's sound rules (room tone, never fade the last word, effects only on visible actions).
- **Self-review at every cut (09).** Mandatory rules and the per-cut check, then the ice-qa gates.
- **Export (10).** Encode, every planned version, deliverables, the delivery report.
- **Note-to-rule (09, and after 10).** After each user note, fix the edit at the stage that owns it and offer to record the note as a project rule (`references/production-rules.md` section 4).

## Spine stages

The router owns the spine and `ice/state.json`; this section says what each stage means when the user's footage is the material. A stage is done when its artifact passes the last column, approved as section 1 ("Stops and approvals") says. Each edit-type file has a `Stage order: <stages>` line (the router's order text), copied into `order`, and a `Leads with:` line saying it in words.

**Parallel lanes.** Edits keep the footage-led order of section 3 (the cut decides what the look serves), so 04 and 05 are no lane here; 08a runs beside 07, 08b after it. Without sub-agents, a lane runs in sequence.

| Stage | What this workflow does in it | Files to open | Done when |
|---|---|---|---|
| 01 brief | ice-direction intake first: research RQ-business, RQ-brand and RQ-rules, then the one question message (with the paid-service items of `references/ingest-and-ledger.md` section 6 and the gap note); it writes the business brief, the brand material plan and the compliance note. Then: classify the edit type (section 2) and copy its `Stage order:` line; size; ingest (probe and preserve every file, footage ledger); word-level transcript per source. Showreel or a track the user supplied: its sync license check and beat map now | Required: `ice-direction/SKILL.md` section 3 Part A (stage 01 intake, steps 1 to 7, and the files those steps name); `references/edit-types/<type>.md`; `references/ingest-and-ledger.md` sections 1 to 4 and 6; `references/transcript-editing.md` sections 2 and 3. Only if Arabic or mixed speech: `ice-arabic/SKILL.md`. Only if a real or reference brand: `ice-assets/references/brand-authenticity.md`. Only if a showreel or a supplied track: `ice-audio/references/music-choice-and-licensing.md` section 5 and `ice-audio/references/cue-map-and-beat-sync.md` section 3. Only if a style reference: `ice-remake/SKILL.md` sections 2 to 4 (a recipe: `ice-remake/references/style-recipe.md` sections 4 and 7) | `ice/BRIEF.md` has its business brief filled or marked "not a business"; `ice/research/COMPLIANCE.md` exists; a real brand has `ice/assets/BRAND-MATERIAL.md` and `ice/assets/brand-sheet.json`; `subtype`, `size`, `order` (and `crew` if used) are in `ice/state.json`; every source is probed with VFR, dropped frames and HDR fixed; the footage ledger lists usable intervals; a cached word-level transcript exists per source; showreel: the track's sync check is recorded and its beat map exists |
| 02 approach | The strategy in 4 to 8 sentences: what the edit keeps, its shape and rhythm for the type, what it adds | Required: `references/house-style-numbers.md`. `ice-qa/references/clarity-gate.md` section 2; `ice-direction/references/treatment.md` section "Craft plan". Only if short form: `references/short-form-hooks.md` sections 1 and 5 | the approach is logged in `ice/DIRECTION.md` and approved; `ice/plan/concepts.md` holds the viewer takeaway; `ice/plan/craft-plan.json` is drafted |
| 03 paper edit | Numbered script built on the transcript; silences and retakes decided on paper; short form adds three openings and the open loops. Versions step: every version the brief or the edit type asks for (ratios, reels, languages, 15 s and 6 s cutdowns, chapters), each cutdown with its own hook | Required: `references/transcript-editing.md` sections 3 and 4; `references/silence-and-retakes.md`. Only if short form or a cutdown: `references/short-form-hooks.md` sections 2 to 4 and 6 | `ice/plan/script.md` is the approved numbered script; retake and silence decisions are saved with their source-time reasons; `ice/plan/versions.md` lists each version with its length, ratio, language and hook (or says "master only"); short form: `ice/plan/hooks.md` and `ice/plan/open-loops.json` exist |
| 04 B-roll and overlay plan | Plan per line: each element on the transcript word or sentence that triggers it, with its time, the treatment (full cutaway, panel, nothing) and the reason (none: cut; a reference adds its reasons table); who each mark is on; layer order and caption band | Required: `references/broll-and-motion-broll.md` sections 1 to 3; `references/layers-and-isolation.md` sections 1, 4 and 5. Only if motion B-roll slots: `references/broll-and-motion-broll.md` sections 4 and 5 | the plan table in `ice/plan/storyboard.md` is approved, every row with its trigger and reason (motion B-roll slots also get their `plan.json`); every insert has a source or a build note in the footage ledger; `craft_gate.py plan` passes on the `craft` tags of `plan.json` |
| 05 grade and caption style | Grade policy, caption style from ice-type, layout mode and safe zones for each ratio. When the look is open (no brand kit, caption style or grade supplied), a mood board first | Required: `references/ingest-and-ledger.md` section 5; `ice-type/SKILL.md`. Only if vertical or more than one ratio: `references/vertical-conversion.md`. `ice-qa/references/studio-benchmark.md`. Only if a real brand: `ice-assets/references/brand-authenticity.md` sections 3 and 4. Only if an identity: `ice-qa/references/identity-tests.md` sections 3-6 | grade decision (untouched, or the approved before and after) and caption style are logged in `ice/DIRECTION.md`; an open look has its mood board in `ice/plan/mood-board/`; the studio benchmark (two graded stills with overlays) is logged; with an identity, the masked brand test passes; the craft plan is locked |
| 06 rough cut | Cut between sentences on the approved paper edit, lock the clock on one EDL with word anchors; short form adds the low-resolution animatic. Usual preview for the router's approval stop | Required: `references/cut-craft.md`; `references/clock-and-grouping.md`. Only if short form: `references/short-form-hooks.md` section 7 | the EDL and the retimed transcript exist; the rough cut (or the animatic) is approved and the cut is locked |
| 07 fine cut and overlays | B-roll, motion B-roll, isolation, reframe and captions built on the locked clock; captions last. Runs beside 08a | Required: `references/broll-and-motion-broll.md` sections 2 and 3. Only if motion B-roll: `references/broll-and-motion-broll.md` section 6 and `scripts/NOTICE.md`. Only if isolation or a layer behind the speaker: `references/layers-and-isolation.md` sections 2 and 3. Only if vertical or more than one ratio: `references/vertical-conversion.md` | every layer derives from the locked EDL; stills at settled and mid-change times are clean; `scripts/validate-plan.mjs` and `scripts/validate-footage.mjs` pass; a draft render exists as a new file; `craft_gate.py build` passes |
| 08 sound | 08a, beside 07: music choice, SFX list and voice cleanup from the locked EDL and cue sheet. 08b, after 07: room tone, joins, effects on visible actions, mix and master on the 07 draft, through ice-audio | Required: `ice-audio/SKILL.md`; `references/cut-craft.md` section 3. Only if music is chosen at 08a: `ice-audio/references/music-choice-and-licensing.md` section 5 | 08a: music, SFX and voice are in `ice/audio/` with rows in `ice/assets/CREDITS.md`, and every track has its sync check recorded as a license status; 08b: the mix sits on the latest draft; the last spoken word is never faded; the ice-audio loudness gate passes |
| 09 review | Self-review at every cut, then ice-qa gates and an independent critic, never the builder's session | Required: `references/production-rules.md`; `ice-qa/SKILL.md`; `ice-qa/references/clarity-gate.md` sections 3 to 5, 7 and 8 | clarity read 3 passed, sized to the job; `craft_gate.py build` passes; the per-cut check and the gates are recorded in `ice/review/`, with what was not measured named |
| 10 deliver | Final render after 09 (no further approval in auto mode), then every version and cutdown planned at 03 (rendered in parallel), captions files, retimed transcripts, EDLs, delivery report | Required: `references/export.md`; `ice-qa/references/delivery-report.md`; with captions: `ice-qa/references/captions-and-sync.md`, "Fresh transcript gate" (blocking) | finals are new files in `ice/renders/final/`; every version in `ice/plan/versions.md` is rendered; delivery checks pass; `ice/review/NOTE.md` reports measured numbers and, for an ad, lists the permissions a brand owner would need |

**Depth by size.**

| Size | Edit jobs | How the spine runs here |
|---|---|---|
| Micro: 6 s or less, or one pass | a caption pass, one clip reframed, a silence trim only | Three passes: 01 with the ingest and transcript, 02 and 05 condensed into one line of approach; the pass itself (06 or 07) with 08 (both parts) only when sound changes; 09 and 10 with one review round. 03 and 04 are `not_used` unless the pass cuts words or adds inserts |
| Standard: 7 to 60 s, or one edit of a longer recording | a talking-head ad, a reel, shorts, a B-roll pass, a showreel | Full spine in the footage-led order, lean crew; the short-form gates (three openings, animatic) run for every vertical piece |
| Long or campaign: over 60 s, chapters, or several versions and cutdowns | a long-form or course edit, a podcast episode, an episode cut into many reels | Full spine; chapters, reels and cutdowns are listed at 03 in `ice/plan/versions.md`; the visual layer is built and reviewed per section at 07; each ratio and each reel renders in parallel at 10 |

**Supplied or partial material** for any stage: `references/ingest-and-ledger.md` section 7.

## 4. Rules that never bend

- Never cut inside a word or a phrase; never speed up a voice; never fade the last spoken word.
- Never mix source time and edited time; rebuild every layer after any timing change.
- Never cover the face or hands (checked on frames by `craft_gate.py build`); captions are applied last.
- Never grade a person by default; the speaker stays lit and unmarked (`references/layers-and-isolation.md` section 5); never invent numbers, quotes, results or a logo (truth and authenticity rules in the ice-assets skill).
- Never repeat a B-roll scene inside a reel; a callback shows a new state.
- Never claim a pass you did not measure; say what you could not check.
- Never publish, post or contact anyone; delivery is files and links.
- No music track is used before its sync license check (`ice-audio/references/music-choice-and-licensing.md` section 5). Free pinned tools, models and footage need no question after the space check; paid or account-bound services wait for a yes (`references/ingest-and-ledger.md` section 6).

## 5. Conflicting source rules (both kept, scoped)

Read `references/production-rules.md` (section 6) when two source rules disagree (silence, join sound, render method, grade, repeats, B-roll motion, transitions, caption band, sync); each is kept and scoped, never picked globally.

## 6. Files

| Need | Open |
|---|---|
| Probing, VFR, HDR, grade and finishing, footage ledger, installs and disk space, supplied material | `references/ingest-and-ledger.md` |
| Transcript contract, packing, script gate, timelines | `references/transcript-editing.md` |
| Silence detection and retake review | `references/silence-and-retakes.md` |
| Where to cut, padding, join sound, sync proof | `references/cut-craft.md` |
| Speech rate, shot length, layout shares, zoom, density | `references/house-style-numbers.md` |
| Hard rules, self-review per cut, honest reporting, scoped source conflicts | `references/production-rules.md` |
| B-roll choice, footage handling, motion B-roll | `references/broll-and-motion-broll.md` |
| Matting, layer order, caption placement, the speaker stays lit | `references/layers-and-isolation.md` |
| Vertical conversion, layout modes, safe zones | `references/vertical-conversion.md` |
| First three seconds, open loops, animatic, review | `references/short-form-hooks.md` |
| EDL, plan schema, anchors, clip grouping, shifts | `references/clock-and-grouping.md` |
| Encode ladder, delivery checks, deliverables | `references/export.md` |
| Script index, uses by job, licenses, known limits | `scripts/NOTICE.md` |

## 7. Scripts

Read `scripts/NOTICE.md` (section "Uses by job") when you pick a script for a job; its "Index" holds sources, licenses and known limits. Read a script's header (or `--help`) before first use. Scripts never upload, publish or call paid services.
