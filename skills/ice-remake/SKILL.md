---
name: ice-remake
description: "Internal part of Ice Motion Director, not a command: start with /ice. Workflow of Ice Motion Director for new films made in the style of a reference the user supplies (a video file, a saved website or app, or an image set) with the user's own content: measured reference analysis, fidelity contract, shot mapping, mixes of several references, frame-locked remakes, a climax duel against the reference and re-timed variants. Places the reference's own media as they are or carries its style on the user's identity, as the user chooses. Started by the Ice Motion Director router (ice-motion-director), which creates the project first; use only when the router hands off or the user names ice-remake."
license: Apache-2.0
metadata:
  author: Omar-Tnzxo
  version: 0.2.11
---

# ice-remake: a new film in the style of a reference

You learn how the reference was made and build an original film with the user's content in that style. You measure before you imitate, map every shot to the reference, and do not deliver until the climax holds up next to the reference's.

## First step

Look for `ice/state.json` in the working folder.
- Missing: stop reading this skill. Open the router (`ice-motion-director/SKILL.md`) and follow it; it creates the project, runs the stage 01 intake and calls this workflow back.
- Present: read it and resume at `current` in the recorded `mode`. Never re-ask what the files answer.

Not this route (go back through the router and record why in `history`): footage to cut with a style reference (ice-edit, which calls sections 2 to 4 of this skill); a film from scratch with no reference to match (ice-film); a voice-led explainer (ice-explainer). All remake files live under `ice/` (layout: `references/notes-files.md`). `<skill>` below means this skill's folder.

**Read budget.** Each `## Spine stages` row marks its files **Required** (open them, in the order listed) or **Only if <condition>** (open only when the condition holds). A file named with a section: read only that section. Sections 0 to 10 of this file are the method inside the stages and are read with the row that names them; the `## Files` table at the end is an index, not a reading list. Open nothing else, and nothing a file merely mentions, unless the stage cannot be finished without it. `references/` and `scripts/` paths are inside this skill; a path starting with another skill's name is in that skill's folder, next to this one.

**Stops and approvals.** The router's stops table (`ice-motion-director/SKILL.md` section 5, "Stops") is the only list of times the run waits for the user. Auto mode asks only in the stage 01 question rounds and at the one preview approval (the 06 storyboard and key frames, only when the session is interactive and the user did not say not to ask). Every other "ask" in this skill and its files means, in auto mode: decide, log it in `ice/DIRECTION.md`, report it in the delivery note; in step mode: put it in that stage's review card. Free pinned installs and free downloads need no question (`references/measuring.md` section 7); a paid or cloud service, or a download behind an account, is asked only inside the stage 01 message; without a yes, take the path that needs none, log it, and say in the delivery note what a yes would add. Approval: the user in step mode; in auto mode the reviewer or critic `references/production-crew.md` assigns, then the approver role (`ice-direction/references/roles.md` section 5), who checks the row's "Done when" item by item. Clarity reads 1 to 3 below are the cold-viewer gate (`ice-qa/references/clarity-gate.md` sections 1, 3 and 8): a FAIL blocks 07 or 10 in every mode.

## 0. Intake first

Read `references/rights-and-modes.md` (section 1) before any analysis: no rights gate (rights are the user's responsibility), the reference file, the `identity` choice, real people, and the brief line.

## 1. Choose the mode

Stage 01. Read `references/rights-and-modes.md` section 3: one mode per reference (structural fidelity by default), its main file, the mode question, the footage-plus-reference case.

## Spine stages

The router owns the spine and `ice/state.json`; this section says what each stage means when a reference sets the style. Sections 0 to 10 of this file are the method inside the stages; stage numbers always have two digits. A stage is done when its artifact exists and passes the check in the last column; it is approved as "Stops and approvals" above says.

**Parallel lanes.** After 03, 04 (shot mapping) runs in parallel with 05 (look); 06 needs both. After 06, 08a (score, SFX and voice) runs beside 07, and 08b (mix and master on the 07 draft) after 07. Agents without sub-agents run a lane's stages one after another. Copy this line into `order` (micro size leaves out 03, 04 and 06):

Stage order: 01 02 03 [04 05] 06 [07 08a] 08b 09 10
Leads with: the reference. 01 measures the reference before anything else; 02 maps the treatment and the fidelity contract to it; every later stage is compared against it; 09 duels the peaks.

| Stage | What this workflow does in it | Files to open | Done when |
|---|---|---|---|
| 01 brief plus reference analysis | Recipe-only: the slim 01 of `references/style-recipe.md` section 8 replaces this row. ice-direction intake first: research RQ-business, RQ-brand and RQ-rules, then the one question message (the mode question goes inside it); it writes the business brief, the brand material plan and the compliance note (steps the router already ran are not repeated). Then: intake (section 0), mode (section 1), size, watch (section 2), measure with the sound map (section 3), notes (section 4); the craft plan drafted from the measurement; in frame-locked mode its "Phase 0: analysis" runs here | Required: `ice-direction/SKILL.md` section 3 Part A (stage 01 intake, steps 1 to 7, and the files those steps name); `references/rights-and-modes.md`; `references/watching.md`; `references/measuring.md`; `references/notes-files.md`; `ice-direction/references/treatment.md` section "Craft plan". Only if several references: `references/mixing-references.md`. Only if frame-locked: `references/rights-and-modes.md`. Only if a real brand: `ice-assets/references/brand-authenticity.md` | `ice/BRIEF.md` has its business brief filled or marked "not a business"; `ice/research/COMPLIANCE.md` exists; a real brand has `ice/assets/BRAND-MATERIAL.md` and `ice/assets/brand-sheet.json`; `subtype` (the film type of the new film, the ice-film skill's section 4), `run_mode` (the mode of section 1), `size` and `order` are in `ice/state.json`; every reference has `ref-id, kind, mode, function` and the rights line in the brief's References block; `ANALYSIS.md` (with its Finishing layer table), `TIMELINE.md` and `REASONS.md` (a row per element) are in `ice/reference/<ref-id>/`, from measured numbers (unmeasured ones marked so); `ice/plan/craft-plan.json` has every measured dimension; the breakdown is reported (step mode: on the 01 review card; auto mode: in the delivery note) |
| 02 treatment mapped to the reference | Treatment of the new film, then the fidelity contract: salience lock and the must-preserve mechanisms, adapted to the user's subject, product, words and platform (section 5) | Required: `references/notes-files.md`; `references/fidelity-contract.md`; `references/adaptation-lenses.md`; `ice-qa/references/clarity-gate.md` sections 2 and 6. Only if a brand: `ice-qa/references/identity-tests.md`. Only if several references: `references/mixing-references.md` | `ice/plan/TREATMENT.md` and `ice/plan/FIDELITY.md` exist; `ice/plan/concepts.md` holds the viewer takeaway; at least two must-preserve mechanisms each name an implementation and a proof; no mechanism is unmapped; for a brand, the chosen concept passed the brand test and competitor swap on its blind description; `ice/plan/craft-plan.json` adds the new content's triggers |
| 03 script | The user's words written into the reference's beat pattern: copy, on-screen text and voiceover per language, each line anchored to a word, beat or action, never to a copied reference second. Versions step: every version and variant the brief asks for (languages, aspect ratios, 15 s and 6 s cutdowns, other hooks or lengths), each cutdown with its own hook | Required: `references/adaptation-lenses.md`; `references/shot-mapping.md`; `ice-ideas/references/script-writing.md`. Only if variants are asked: `references/shot-mapping.md` sections 1-2. Only if Arabic or mixed: `ice-arabic/SKILL.md` | `ice/plan/script.md` has every beat with its text or voiceover and its anchor; every claim is in the truth sheet (ice-assets); `ice/plan/versions.md` lists each version and variant with its length, aspect, language and hook (or says "master only") |
| 04 shot mapping | Section 6, items 1 to 8: confirm the reference's peaks, design ours first, map every shot, check the stats contract and variety, time by meaning. Runs beside 05 | Required: `references/climax-duel.md` sections 1-2; `references/shot-mapping.md` | `ice/plan/shots.json` cites a reference shot for every shot; mean shot length, text-card share, low-key share and moving-camera share are each within plus or minus 30 percent of the reference or justified in `ice/DIRECTION.md`; every element in `shots.json` has its `REASONS.md` row and our trigger, or is in `cut_elements`; `ice/plan/storyboard.md` is written; `craft_gate.py plan` passes on the shots' `craft` tags; clarity read 1 passes (with 05) |
| 05 look locked to the reference | The look follows the salience lock: skin versus grammar and any medium translation decided; the mood board; then each hit frame rendered next to the reference's (section 6, item 9) and the style frames, key frames first. Runs beside 04 | Required: `references/fidelity-contract.md`; `references/rights-and-modes.md` sections 4-5; `references/climax-duel.md` section 3; `ice-qa/references/studio-benchmark.md` (the reference is one benchmark); `ice-film/references/storyboard.md` section 7; `ice-styles/SKILL.md` | look entries in `ice/DIRECTION.md` name the reference mechanism they keep; the mood board is in `ice/plan/mood-board/`; every `key_<n>_vs_ref.jpg` is not weaker than the reference and is shown first among the style frames in `ice/plan/style-frames/`; clarity read 1 passes (with 04, when the later is drawn); for a brand, with the brand test and swap on masked frames; the studio benchmark is logged and a capped gap was told to the user; code-drawn frames pass the art check (ice-film/references/storyboard.md section 7); the craft plan is locked with the look |
| 06 animatic | Merge 04 and 05. Section 6, item 9: the storyboard and key frames, with anchors resolved on the real words and beats, are the preview for the router's approval stop; an animatic when the size asks for one | Required: `references/shot-mapping.md`; `ice-audio/references/cue-map-and-beat-sync.md` sections 1-2 | approved (step mode: the user; auto mode: the user at the preview stop when it applies, else the critic and approver); every `required_inputs` item is provided, skipped or replaced by a labelled placeholder that is logged; clarity read 2 passes |
| 07 build | Section 7: director setup, character gate, builders on chunks, a fresh reviewer per chunk, compare after each chunk and after assembly; in frame-locked mode its Phases 1 to 3 (engine, parallel build, integrate) run here. Runs beside 08a | Required: `references/production-crew.md`; `ice-engines/SKILL.md`. Only if frame-locked: `references/rights-and-modes.md` | every chunk passed its reviewer with before and after proof for each fix; `scripts/compare.py` output for the assembly is in `ice/review/remake/compare`; the draft is a new file; the art check confirms 05 on the build; `craft_gate.py build` passes |
| 08 sound | 08a, beside 07: score, SFX and voiceover on the anchors, with the reference's own music and effects placed or recreated as the `identity` choice says (`references/rights-and-modes.md` section 1; sync check recorded). 08b, after 07: mix and master on the draft | Required: `ice-audio/SKILL.md`; `references/climax-duel.md` section 5; `references/shot-mapping.md`. Only if a music track: `ice-audio/references/music-choice-and-licensing.md` section 5 | 08a: score, SFX and voice are in `ice/audio/` with rows in `ice/assets/CREDITS.md`; 08b: the mix sits on the latest draft, the hits land on their anchors and the loudness around each peak is measured |
| 09 review plus climax duel | Section 8: the duel on every peak, reference-relative scores, the fidelity self-check on the render, then the ice-qa gates | Required: `references/climax-duel.md` sections 4-6; `references/fidelity-contract.md` section 6; `ice-qa/SKILL.md` | clarity read 3 passed before the duel; no peak is `ref_better`; every shot and category scores 4 or above; the fidelity self-check passes; `craft_gate.py build` passes |
| 10 deliver | Final render after 09 (no further approval in auto mode), then every version and variant planned at 03 (section 9, rendered in parallel), the honest delivery report, and the style recipe export (section 11) | Required: `ice-qa/references/delivery-report.md`; `references/style-recipe.md` sections 1-6. Only if versions or variants: `references/shot-mapping.md` | finals are new files in `ice/renders/final/`; every version in `ice/plan/versions.md` is rendered; `ice/review/NOTE.md` states path, length, resolution, one line per shot, kept mechanisms, any medium translation, any stat outside the contract with its reason, any placeholder, every decision taken in place of the user, and the permissions a brand owner would need; `STYLE-RECIPE.md` and `style-recipe.json` are in `ice/reference/<ref-id>/` |

**Depth by size.**

| Size | Remake jobs | How the spine runs here |
|---|---|---|
| Micro: 6 s or less, or one asset | an ident or a single shot in a reference's style | Three passes: 01 with a short analysis (one measured pass, one key frame) plus 02 and 05 condensed into one fidelity line and the micro count of style frames (`ice-film/references/storyboard.md` section 7); 07 and 08; 09 with one duel round, then 10. 03, 04 and 06 are `not_used` and fold into the treatment |
| Standard: 7 to 60 s, its cutdowns and versions included | a short film or ad in the style of one reference | Full spine; lean crew; the duel and the stats contract as written |
| Long or campaign: over 60 s, several references, or variants | a long remake, a mix of references, a frame-locked remake, a variant set | Full spine; chapters, versions and variants are planned at 03 in `ice/plan/versions.md`; builders on chunks (up to 6) at 07; the duel per variant at 09 |

**Supplied or partial material.** The reference is always supplied. The router's intake table sets what each other supplied item does to its stage. Differences on this route: a supplied analysis or breakdown of the reference does not replace measuring at 01, it is checked against the measurement; a supplied treatment or concept is locked at 02, which writes only the fidelity contract it lacks; a supplied script is also checked against the reference's beat lengths; a supplied storyboard or shot list is mapped shot by shot to the reference and run through the stats contract at 04; a design file or brand kit becomes the skin over the reference's grammar at 05; a recorded voiceover or licensed music is what 06 anchors to. Partial material: only the missing fields are filled, each fill logged, the stage `partial` until the fills are approved.

## 2. Watch the reference

Stage 01. Read `references/watching.md` sections 1 to 5 and 8 (6 for a website or app, 7 for an image set): passes, frame commands, transcript, evidence rules.

## 3. Measure it

Stage 01. Read `references/measuring.md` sections 1 to 6 and 8 to 12 (sound map, finishing, pace, fixed marks, depth and camera; 13 for a reel cut from an episode).

## 4. Write the notes

Stages 01 and 02, and on resume. Read `references/notes-files.md`: the notes files (`REASONS.md` included), templates, how the breakdown is reported.

## 5. Lock the fidelity contract

Stage 02. Read `references/fidelity-contract.md` to write `ice/plan/FIDELITY.md` (salience lock, at least two must-preserve mechanisms, each with an implementation and a proof; an unmapped mechanism stops work), with `references/adaptation-lenses.md`.

## 6. Design the climax, then map every shot

Stages 04 to 06; the stage rows name the required files. Read `references/shot-mapping.md` section 1 for the order of work: peaks first, every shot mapped, elements only with their reasons, the stats contract, variety, timing by meaning, the 06 approval; `references/climax-duel.md` (section 3) for the key frames at 05.

## 7. Build with a crew

Stage 07. Read `references/production-crew.md`: director setup, character gate, builders, fresh reviewers, `needs_user` items, compare after each chunk and after assembly.

## 8. Climax duel and reference-relative review (before delivery)

Stage 09. A fresh, read-only critic runs `references/climax-duel.md` sections 4-6 (required): the duel on every peak, the scores, the fidelity self-check and the hand-off to the ice-qa skill.

## 9. Variants

Planned at 03 in `ice/plan/versions.md`, rendered at 10. Read `references/shot-mapping.md` when versions or variants are asked.

## 10. Feedback

Read `references/production-crew.md` (section 7) when time-stamped notes arrive after delivery.

## 11. Style recipe

Stage 10, and the recipe-only route (`run_mode recipe-only`, order `01 10`: no concept, build or render). `scripts/recipe.py` writes a portable recipe (grammar, look, sound, slots, a paste-ready prompt) that rebuilds this style later on new content. A run that receives a recipe follows `references/style-recipe.md` sections 4 and 7.

## Files

| Need | Open | When |
|---|---|---|
| Intake, own media, identity fits the content, kinds, modes, skin, medium | `references/rights-and-modes.md` | Always, first |
| Watching: passes, frame budget, dedupe, timestamps, transcript, sites, image sets | `references/watching.md` | Section 2 (stage 01) |
| Measuring: analyzer, extra measures, scripts, installs, disk, finishing, pace, fixed marks, depth | `references/measuring.md` | Section 3 (stage 01), and before running a script |
| Notes files: layout, templates, element reasons (`REASONS.md`) | `references/notes-files.md` | Sections 4 and 5 (stages 01 and 02), and on resume |
| Salience lock, must-preserve mechanisms, forbidden substitutions | `references/fidelity-contract.md` | Section 5 (stages 02 and 05) and review (stage 09) |
| Adapting to the user's subject, product, words, platform | `references/adaptation-lenses.md` | Writing the Treatment and the script (stages 02 and 03) |
| Several references, gene pool, distance audit | `references/mixing-references.md` | Mix mode |
| Plan schema, stats contract, variety, scene-order scope | `references/shot-mapping.md` | Section 6 (stages 04 and 06) |
| Peaks, climax anatomy, key frames, duel, reference-relative scores | `references/climax-duel.md` | Sections 6 and 8 (stages 04, 05, 08 and 09) |
| Word, beat and action anchors | `references/shot-mapping.md` | Section 6 and variants (stages 03, 04 and 06) |
| Crew roles, review protocol, round limits, efficiency | `references/production-crew.md` | Section 7 (stage 07) |
| Frame-by-frame remake with parallel agents | `references/rights-and-modes.md` | Frame-locked mode (its Phase 0 in stage 01, Phases 1 to 3 in stage 07) |
| Variant sets | `references/shot-mapping.md` | Section 9 (planned at 03, rendered at 10) |
| Style recipe: export, recipe-only route, receiving one | `references/style-recipe.md` | Section 11 (stage 10, or a recipe arrives) |
| Hypit's original docs (reading, transformation, review, timing) | `vendor/hypit/README.md` | Deeper reading; license differs (not for resale) |

## Scripts

`scripts/frames.py`, `analyze.py`, `clip_strip.py`, `compare.py`, `runtime.py`, `recipe.py`: local files only, no network. Read `references/measuring.md` (section 7) before installing packages or running a script: what each does, what it needs, installs without a question, disk clean-up, the no-install path.

## Done means

Every stage's "Done when" in `## Spine stages` holds, and stage 10 has delivered.
