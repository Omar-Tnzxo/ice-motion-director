---
name: ice-lottie
description: "Internal part of Ice Motion Director, not a command: start with /ice. Workflow of Ice Motion Director for motion that ships inside a product: Lottie JSON scenes and assets (icons, loaders, state icons, micro-interactions, lower thirds, logo reveals and loops, kinetic type, data and diagram scenes), a raster logo turned into clean SVG and animated with numeric checks, animated SVG, motion tokens shared with product code, previews and a developer handoff. Started by the Ice Motion Director router (ice-motion-director), which creates the project first; use only when the router hands off or the user names ice-lottie."
license: Apache-2.0
metadata:
  author: Omar-Tnzxo
  version: 0.2.8
---

# Ice Lottie

Produce motion that ships inside a product: a Lottie file, an animated SVG, or
motion tokens, each verified in the renderer that will play it and handed to a
developer with numbers. Plans go to `ice/plan/`, evidence to `ice/review/`.

## First step

Look for `ice/state.json` in the working folder.
- Missing: stop reading this skill. Open the router (`ice-motion-director/SKILL.md`) and follow it; it creates the project, runs the stage 01 intake and calls this workflow back.
- Present: read it, `ice/BRIEF.md` and `ice/DIRECTION.md`, and resume at `current` in the recorded `mode`. Never re-ask what the files answer.

## 1. Classify the deliverable (first match wins)

| Request | Route | Primary reference | Output |
|---|---|---|---|
| A logo exists only as a raster | Logo pipeline | `references/logo-pipeline.md` (intake gate first) | `logo.svg`, then animated SVG/HTML or Lottie |
| A logo, mark or wordmark exists as vector or Lottie/AE export | Logo recipe | `references/recipes-brand-type.md` (Logo) | Lottie, or animated SVG for no-runtime web |
| Loader, spinner, icon, badge, success/error/warning, empty state | UI recipe | `references/recipes-ui.md` (Loaders, Icons) | Lottie, transparent |
| Button, toggle, toast, progress, hover, tap feedback | UI recipe | `references/recipes-ui.md` (Microinteractions) | Lottie, or tokens when it runs in code |
| Lower third, name strap, caption bar, social handle overlay | UI recipe | `references/recipes-ui.md` (Lower Thirds) | Lottie, transparent |
| Title, quote, kinetic type in Lottie | Brand and type | `references/recipes-brand-type.md` (Typography) | Lottie |
| Generic "animate this SVG" | Brand and type | `references/recipes-brand-type.md` (SVG Animation) + `references/svg-compatibility.md` | Lottie or animated SVG |
| Stats, chart, diagram, product card, camera move, effect, as a Lottie scene | Scene recipe | `references/recipes-scene.md` | Lottie |
| "Give the product a motion system", tokens, "make the UI feel premium" | Tokens | `references/ui-motion-tokens.md` | token files plus asset rules |
| "Start a pack" with no specifics | Starter | `references/recipes-brand-type.md` (Starter Projects) | a concrete scene plan, then the matching route |

Mixed requests: pick one primary route from the main deliverable, then add the
secondary references for source format (SVG, raster) or treatment (effects,
camera). A rendered film (MP4 for a feed, ad, launch video) is not this skill:
return it to the router for ice-film or ice-explainer.

## 2. Workflow

Read `references/workflow-and-checks.md` (section Workflow) at every used stage: it holds the named steps (Intake, Assets, Direction, Personality and tokens, States and frames, Author, Verify, Export and hand off) that the stage rows below run.

## Spine stages

The router owns the spine and the `stages` map in `ice/state.json`; this
section says what each stage means for motion that ships inside a product. A
stage is done when its artifact exists and passes the check in the last column.
This route has one machine-readable order line (the router's order text, read
by `ice-state`), copied into `order` at 01:

Stage order: 01 02 05 04 07 09 10
Leads with: the look. 05 fixes the motion personality, curves, colors and type (on the logo route also the clean static vector) before 04, because the first and final frames of 04 are finished stills that need that look. 03, 06 and 08 are left out of the order, so they are `not_used`.

**Parallel lanes.** None between stages on this route. 08 is not used, so there is no 08a or 08b part. Inside 07, the assets of a set or a motion system build in parallel, each passing 09 on its own; agents without sub-agents build them one after another.

**Read budget.** Each row below marks its files **Required** (open them, in the order listed) or **Only if <condition>** (open only when the condition holds). A file named with a section: read only that section. Open nothing else, and nothing a file merely mentions, unless the stage cannot be finished without it. `references/` and `scripts/` paths are inside this skill; a path starting with another skill's name is in that skill's folder, next to this one. Section 7 is an index of this skill's files, not a reading list. Every used stage also has as Required `references/workflow-and-checks.md` sections Workflow (the step its row names) and Defaults that always apply; 05 and 07 also its section Conflicts scoped.

**Stops and approvals.** The router's stops table (`ice-motion-director/SKILL.md` section 5, "Stops") is the only list of times the run waits for the user. Auto mode asks only in the stage 01 question rounds and at the one preview approval, and only when the session is interactive (a person can answer now) and the user did not say not to ask. This route's preview: on the logo route, the clean static vector at the end of 05, with its numeric overlay report, before any choreography; on every other route, the first, final and state frames of 04. In step mode the preview is that stage's review card. In auto mode, when the preview cannot be shown, the approver role checks it (on the logo route against the numeric overlay of `scripts/render_overlay.py`) and the delivery note reports it. Every other "ask" in this skill and its files (the "Ask Only When Needed" lists of the recipe files included) means: inside the stage 01 message when it is known at 01; later, in auto mode, decide, log it in `ice/DIRECTION.md` and report it in the delivery note, and in step mode put it on that stage's review card. Approval of a stage: the user in step mode; in auto mode the approver role (`ice-direction/references/roles.md` section 5), who checks the row's "Done when" item by item.

Rows are listed in the order they run; the stages this route does not use come last.

| Stage | What this workflow does in it | Files to open | Done when |
|---|---|---|---|
| 01 brief | ice-direction intake first: research RQ-business, RQ-brand and RQ-rules, then the one question message (with the consent items of section 7 the run will need); it writes the business brief, the brand material plan and the compliance note (steps the router already ran are not repeated). Then the intake and assets steps; classify the deliverable (section 1); for a raster logo, the intake gate and its "Phase 1, PIXEL" (read the source, write the brief) | Required: `ice-direction/SKILL.md` section 3 Part A (stage 01 intake, steps 1 to 7, and the files those steps name); the routed recipe file from section 1, its section for the deliverable. Only if the output is Lottie: `references/player-contract.md` section Setup. Only if a raster logo: `references/logo-pipeline.md` (intake gate and Phase 1). Only if a real brand or a third-party mark: `ice-assets/references/brand-authenticity.md` | `ice/BRIEF.md` has its business brief filled or marked "not a business" and fixes runtime, slot size, background policy, one-shot or loop, language and direction; `ice/research/COMPLIANCE.md` exists; a real brand has `ice/assets/BRAND-MATERIAL.md` and `ice/assets/brand-sheet.json`; the route and the stage order are in `ice/state.json`; every supplied mark is listed as used untouched or sent through the intake gate |
| 02 concept | Direction step: the message, the focal subject, the support layer, the accent system and the purpose of each motion (feedback, orientation, continuity or earned delight); a Lottie scene with more than one idea is chaptered here. Versions step (this route has no 03): every size, theme, reading direction and export format the brief asks for | Required: `references/design-taste.md`; `ice-direction/references/treatment.md` section "Craft plan". Only if the scene carries more than one idea: `references/chapterization-transition-grammar.md`. Only if the brief leaves the concept open: `ice-direction/references/pitch-round.md` section A | the concept entry in `ice/DIRECTION.md` names the message and focal subject and passes the purpose gate (section 3); `ice/plan/versions.md` lists each version or says "master only"; `ice/plan/craft-plan.json` is drafted (the sound and real-footage rows not used, reason: row 08 of this table, a product asset is silent) |
| 05 look | Personality and tokens step: preset, curves and timing table; colors and type from ice-direction or the host product's tokens; a mood board only when no host tokens, design system or brand kit set the look; on the logo route, "Phase 2, VECTOR" fits the clean motion-ready SVG, which is this route's preview | Required: `references/ui-motion-tokens.md`. Only if a logo: `references/logo-pipeline.md` (section "Motion Personality: Brand → Parameters"). Only if no host tokens or brand kit set colors and type: `ice-direction/references/pitch-round.md` section B and `ice-film/references/storyboard.md` section 7 (mood board). Only if the raster logo route: `references/logo-pipeline.md` (Phase 2). Only if a closed or self-crossing ribbon mark: `references/logo-pipeline.md` (section "Closed / Self-Intersecting Ribbon Fitting: Centerline Scaffold + Recenter + Snap") | `ice/plan/motion_spec.md` holds personality, curves, timing, colors and type; tokens are generated when motion runs in code; a mood board, when made, is in `ice/plan/mood-board/`; on the logo route the static vector passed its numeric overlay and its preview approval is recorded; the craft plan is locked with the look |
| 04 states and frames | States and frames step, in the look of 05: the first and final frames as finished stills, the key states the deliverable needs, the loop seam or the one-shot settle; on every route but the logo route these frames are the preview | Required: `references/design-taste.md`; the routed recipe file. Only if the asset loops or reverses: `references/motion-taste.md` | first, final and state frames are written to `ice/plan/` in the look of `ice/plan/motion_spec.md` and pass the design rubric of `references/design-taste.md`; the final frame matches the intended exported pose; off the logo route, the preview approval is recorded; the craft plan's `use` rows name their states and `craft_gate.py plan` passes |
| 07 build | Author step: Lottie JSON or animated SVG; on the logo route, "Phase 3, MOTION"; the assets of a set build in parallel | Required: the routed recipe file; `references/motion-taste.md`. Only if Lottie: `references/player-contract.md`, then `references/svg-compatibility.md` (section "Lottie Spec Map"). Only if animated SVG: `references/reveal-patterns.md`; for a logo also `references/twelve-principles-for-logos.md` and `references/export-handoff.md` (section "HTML Delivery Template"). Only if SVG input: `references/svg-compatibility.md`. Only if the scene carries more than one idea: `references/chapterization-transition-grammar.md` | the asset parses and renders in the target runtime at pinned frames; `craft_gate.py build` passes on its preview render |
| 09 review | Verify step: every check of section 5 with numbers; two honest passes, then residuals reported; a fresh critic judges the design stills | Required: `references/workflow-and-checks.md` section Verification (section 5 below points there); `references/design-taste.md` (final design rubric); `ice-qa/SKILL.md` | every check in section 5 is recorded in `ice/review/` with its numbers, or marked not measured with the reason; the Final Frame Contract passes; reduced motion and RTL are checked |
| 10 deliver | Export and hand-off step: asset, static fallback, previews, tokens, every version in `ice/plan/versions.md`, handoff note, then the ice-qa delivery report and fingerprint | Required: `references/export-handoff.md`; `ice-qa/references/delivery-report.md` | the files, previews and handoff note (sizes, frame rates, file weight against the agreed budget) are delivered; `ice/review/NOTE.md` lists the decisions taken in place of questions and what each unanswered consent item would add |
| 03 script | `not used` (on-screen copy, when any, is supplied or decided at 02; versions are planned at 02) | none | left out of the stage order, so `ice/state.json` marks it `not_used` |
| 06 animatic | `not used` (the state frames of 04 and the motion spec of 05 replace it) | none | left out of the stage order, so `ice/state.json` marks it `not_used` |
| 08 sound | `not used` (a product asset is silent; a sting with sound is a film for ice-film). No 08a or 08b on this route | none | left out of the stage order, so `ice/state.json` marks it `not_used` |

**Depth by size.**

| Size | Lottie jobs | How the spine runs here |
|---|---|---|
| Micro: 6 s or less, or one asset (most jobs here) | a loader, an icon, a state icon, a micro-interaction, a logo loop | Three passes: 01 with 02, 05 and 04 condensed into one motion spec (in that order); 07; 09 and 10 with one review round |
| Standard: 7 to 60 s, or a small set | a Lottie scene with chapters, a lower-third pack, a set of related icons, a logo from a raster | Every used stage in order, lean crew; the logo route keeps its preview of the static vector at 05 |
| Long or campaign: over 60 s, or a motion system | a product motion system with tokens, a full icon or state library | Every used stage; 05 defines the shared tokens once and every asset traces to them; assets build in parallel at 07 and each passes 09 |

**Supplied or partial material.** The router's intake table sets what each supplied item does to its stage; a supplied mark is never redrawn. Differences on this route: a supplied vector logo, SVG or Lottie/After Effects export is used as it is at 01, and the logo route skips the vector fitting of 05, keeping only its motion-ready structure step; a raster logo goes through the intake gate at 01 and 05 fits the vector; a supplied motion idea makes 02 `supplied`, but the purpose gate still runs on it; supplied frames, states or a storyboard are only validated at 04 against the design rubric and the final-frame rule; host product tokens, a design system or a brand kit are where 05 starts, and ice-direction fills only the missing fields. Partial material: fill only the missing fields with this stage's method, log each fill in `ice/DIRECTION.md`, keep the user's own fields unchanged, and keep the stage `partial` until the fills are approved.

## 3. Defaults that always apply

Read `references/workflow-and-checks.md` (section Defaults that always apply) at every used stage: premium subtraction, focal subject, purpose gate, easing, stagger, Final Frame Contract, background policy, loops, reduced motion, direction, literal keyframe easing, no sameness.

## 4. Conflicts scoped (both rules hold, each in its scope)

Read `references/workflow-and-checks.md` (section Conflicts scoped) when setting timing, overshoot, frame rate, the verification renderer, a default palette, raster tracing or chaptering (Required at 05 and 07).

## 5. Verification (evidence, not claims)

Read `references/workflow-and-checks.md` (section Verification) at 09: the check table, the tool for each check and when it fails.

## 6. Owned elsewhere

Read `references/workflow-and-checks.md` (section Owned elsewhere) when a rule belongs to a neighboring skill.

## 7. Files

Index only: each stage opens the files its `## Spine stages` row marks.

| File | Open when |
|---|---|
| `references/player-contract.md` | before creating, editing or verifying any Lottie scene: setup, slots, native text, background policy |
| `references/svg-compatibility.md` (section "Lottie Spec Map") | writing or debugging Lottie JSON structure, keyframes, shapes, renderer traps |
| `references/svg-compatibility.md` | any SVG input or SVG-like path behavior |
| `references/design-taste.md` | every designed scene; any "premium, clean, minimal, modern" wording; final design rubric |
| `references/motion-taste.md` | choosing timing, easing anchors, choreography, loops, render-aware motion |
| `references/chapterization-transition-grammar.md` | a Lottie scene carries more than one idea |
| `references/recipes-ui.md` | loaders, icons, state feedback, micro-interactions, lower thirds |
| `references/recipes-brand-type.md` | logo, SVG animation, typography, starter projects |
| `references/recipes-scene.md` | data, diagram, product promo, camera, visual effects as Lottie scenes |
| `references/logo-pipeline.md` | a raster logo, or any logo animation shipped as SVG/HTML with numeric QA |
| `references/twelve-principles-for-logos.md` | choreographing a logo; parameter ranges per principle |
| `references/logo-pipeline.md` (section "Motion Personality: Brand → Parameters") | mapping brand words to logo timing and curves |
| `references/reveal-patterns.md` | draw-on, assembly, scale-pop, mask wipe, morph, idle loops, hover |
| `references/logo-pipeline.md` (section "Closed / Self-Intersecting Ribbon Fitting: Centerline Scaffold + Recenter + Snap") | closed or self-crossing ribbon marks; wordmark font matching |
| `references/export-handoff.md` (section "HTML Delivery Template") | building the logo showcase HTML |
| `references/ui-motion-tokens.md` | UI timing, industry preset ids, curve library, spring model, tokens into Lottie |
| `references/export-handoff.md` | choosing formats, per-runtime checks, previews, file weight, handoff note |
| `references/workflow-and-checks.md` | Required at every used stage (sections Workflow, Defaults that always apply); Required at 05 and 07 (section Conflicts scoped); Required at 09 (section Verification); Only if a rule belongs to another skill (section Owned elsewhere) |
| `scripts/motion-tokens.mjs` | generate tokens: `node scripts/motion-tokens.mjs --preset <id> --format all --out <dir>` (Node, no deps) |
| `scripts/render_overlay.py` | each logo fit iteration: `python3 scripts/render_overlay.py <svg> <raster> --out <png> --report <json>` (Pillow, numpy, Chrome) |
| `scripts/svg_path_audit.py` | auditing curve smoothness: `python3 scripts/svg_path_audit.py <svg> --report <json>` |
| `scripts/animate_svg_showcase.py` | building the showcase HTML from `logo.svg` and `motion.css` |
| `scripts/capture_motion_frames.py` | deterministic frames, strip and final-frame diff (Playwright) |
| `scripts/probe_motion_continuity.py` | easing probe and ink-delta sweep (Playwright) |

**Consent items.** Pinned Python packages and the pinned Playwright browser
install without a question and are recorded (the `ice-engines` skill,
`references/engine-choice.md` section 7.6). Code that is not a pinned package
(the external Lottie player project, an upstream script) is a consent item:
name it with its one install step inside the stage 01 message when it is known
then; never fetch it without the user's yes. Without a yes (no answer, "don't
ask", or not known until a later stage): take the path that needs none (Node checks, a browser already
installed), mark each check that could not run as not measured in
`ice/review/`, log the choice in `ice/DIRECTION.md`, and say in the delivery
note what a yes would add. Minimum Node and Python versions: `runtimes` in the
ice-engines skill's `references/versions.json`; Python packages: this skill's
`scripts/requirements.txt` (exact pins in sync with `versions.json`). Script paths are relative to this
skill's folder (in Claude Code: `${CLAUDE_SKILL_DIR}/scripts/...`).
