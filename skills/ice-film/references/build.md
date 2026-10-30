# Build and render

How the plan becomes frames: build order, splitting work across builders, stills before renders, draft before final. Engine choice, the composition contract, determinism and render commands belong to ice-engines; this file is the order of work.

## Contents

1. Before code
2. Build order
3. Parallel builders
4. Stills, draft, final
5. Build rules that stay true on every engine

## 1. Before code

- The engine is chosen through ice-engines from the brief (aspect, length, 3D needs, existing project). A project already in one engine stays in it unless a measured benefit justifies moving.
- Search the engine's catalog or registry before hand-building any named effect, transition or overlay; a found block is a structural donor that still obeys the film's direction and brand.
- Assets are staged and their provenance recorded before building (ice-assets). Never invent asset filenames.
- Builders get a brief, never the whole conversation (`../roles/builder.md`).

## 2. Build order

1. Build the hardest beat and one critical transition first (the hero moment and the hardest handoff). This proves the visual system and the pipeline before every scene inherits a mistake.
2. Render stills of those at their cue times and look at them.
3. Build the remaining beats in story order against the shot contracts.
4. Wire the cue sheet and export events for the sound pass.
5. When changing a finished film, change one element at a time; show it, then the next.

## 3. Parallel builders

- Parallelize across films, not inside one film: one capable builder makes one whole short film faster than a team (a measured case: one agent built a motion film in 22 minutes; a team of builders plus critics took 6 hours).
- Inside a long film, split by file ownership: one builder per composition file; the director owns shared files (index, tokens, cue sheet); builders never commit, publish or start servers.
- Seams between files follow the handoff contract (`storyboard.md` section 4); a builder treats it as a hard boundary.
- A failed builder output is re-dispatched once with the exact finding, then the director fixes it.

## 4. Stills, draft, final

| Step | What | Gate |
|---|---|---|
| Stills | one frame per beat or cue (and around each transition), as a contact sheet; full-resolution looks at text-heavy frames | nothing off-grid, cramped, empty, unreadable, overlapping, clipped or off-brand; every decisive still meets the type's richness floor (`hero_share`, `frame_fill`, `empty_half`, `depth_layers`, `surface_detail`); fix and re-shoot |
| Short test | for long or risky films, a 5 s stress render (small text, gradients, fast motion, 3D) | text sharp, no banding, motion blur reads |
| Draft | low resolution, normal speed, low fps, no motion blur; the review copy | judge rhythm, not sharpness; stills alone cannot prove timing |
| Review loop | `build.md` (section "Review loop") | SHIP verdict or stop rule |
| Final | full resolution and fps with motion blur where the film needs it; only after the draft is accepted | tell the user the render-time estimate before a long render |
| Master | audio mastered and muxed (ice-audio), delivered file probed (ice-qa) | measured numbers recorded |

Never overwrite a render: every render is a new numbered file; keep the previous version for comparison. Iteration cost order: scrub, still, one-frame render, draft, full render; take the cheapest step that answers the question.

## 5. Build rules that stay true on every engine

- Every frame is a pure function of time; no wall-clock, no unseeded randomness, no state carried between frames (exact engine contract: ice-engines).
- Tokens, not hardcoded values: colours, fonts and eases come from the design system and the direction file.
- Fonts: the families in the type block of `ice/DIRECTION.md`, chosen by the font order in the ice-direction skill (`references/type-pairing.md` section 1: user or project fonts first, then system fonts or Google Fonts by best fit; Google Fonts is a disclosed download with an offline switch). Every family is a file in the project, loaded before the first frame; no network requests at render time.
- Something to look at in every frame; nothing important in platform keep-out zones (ice-engines).
- Re-lay out other aspects from the same timeline; never crop (ice-engines).
- Mark the page for the gates as you build, never after: every layer of the depth stack carries `data-ice-layer="<name>"` (for illustration only: background, scene, subject, foreground copy), the hero element carries `data-hero`, and every required label or disclaimer carries `data-required-label="<kind>"` with its exact text from `ice/assets/TRUTH.md`. A canvas film exposes `window.__layers(t)` instead of the layer marks. The ice-qa lint (`lint.mjs`) reads only these marks: a page without them leaves `depth_layers` unmeasured, which fails delivery, and an unmarked label is judged as page chrome. On HyperFrames never use `data-layer`, a legacy name its own lint rejects. Rules for the labels: the `ice-assets` skill, `references/truth-sheet.md` sections 9 and 12.

Sources: AbubakrChan/product-launch-motion, echris6/motion-video-kit, video-production-studio (Omar-Tnzxo), commercial-motion-design (Omar-Tnzxo), heygen-com/hyperframes, imMamdouhaboammar/motion-graphics-skills (ideas only), howseen-ai/claude-motion-design, feitangyuan/onetake (ideas).


## Review loop

The loop that turns a draft into a film: render, watch, write the defect list, fix, re-render as a new file, repeat. Gates, thresholds, critic scoring rubrics and scans belong to ice-qa; this file runs the loop.

### Contents

1. The loop
2. Builder is never judge
3. Round types
4. Passes
5. Fix order and stop rule
6. Notes from the user
7. Versions and authority
8. Deadline mode

### 1. The loop

`render, watch, write the defect list, fix, re-render as a NEW file, repeat`. Write the defect list before opening an editor. Record every fix in the fix ledger `ice/review/fixes.json` with before and after evidence: the `ice-qa` skill, `references/critic-loop.md` section 5.

### 2. Builder is never judge

- Roles, the fresh read-only critic, and the review packet (what the critic gets and never gets): the `ice-qa` skill, `references/critic-loop.md` sections 1-2. Reviewer brief for this workflow: `../roles/reviewer.md`.
- Before the first full-film round, clarity read 3 must pass: a cold viewer with no brief at all says what the draft sells, what the product does and its one idea, matched by the approver (the `ice-qa` skill, `references/clarity-gate.md`). A fail goes back to its owning stage, not into this loop.
- A fresh critic restates the film's message from the frames alone; if it cannot, the film fails. This restatement does not replace the cold viewer's read, because the critic has read the brief.
- Verification of previous findings (FIXED, PARTLY, STILL PRESENT) and regressions: the same file, section 3.

### 3. Round types

Round types and what each critic checks (storyboard, asset, component, full film, verification, entertainment): the `ice-qa` skill, `references/critic-loop.md` section 3. Prompts with slots and the verdict words per round: the `ice-qa` skill, `references/critic-prompts.md`.

Film-side additions:

- A component gets its own round and its verdict before it is assembled into the film.
- Full-film rounds use contact sheets every 0.1-0.25 s plus dense windows around every transition, and also look small: at phone width and as a thumbnail.

### 4. Passes

The four passes inside one review (full speed, muted, audio only, frame and boundary) and the mandatory visual pass list: the `ice-qa` skill, `references/critic-loop.md` section 3. Note what was seen versus measured.

### 5. Fix order and stop rule

- Severity levels, scores by film type and the triage order: the `ice-qa` skill, `references/critic-loop.md` section 4. Fix the largest meaningful gap first (section 5 of the same file).
- Round limits and stop rules: the same file, section 6. The crew row (`film-setup.md` section 2) sets the planned rounds: lean 2 (one full-film round, one verification round), standard and full up to 3. If issues remain after the planned rounds, stop looping and list them in the delivery note (auto mode) or on the 09 review card (step mode).

### 6. Notes from the user

- Translating a note into a mechanism, asking "at which second?", replacing a disliked effect, and sweeping the film for the same class of issue: the `ice-qa` skill, `references/critic-loop.md` section 7.
- One-note prompt for a fix round: "Fix one thing only: <the note>. Keep the motion, the timing and the loop exactly as they are. Report what changed."

### 7. Versions and authority

- Never overwrite a render; keep the previous version beside the new one for comparison.
- Authority order when signals disagree, and restoring a preferred previous version: the `ice-qa` skill, `references/critic-loop.md` section 6.
- Status labels are only the four in the `ice-qa` skill, `references/delivery-report.md` section 1: technical green, creative candidate, technical green creative rejected, reviewer approved. Unapproved files never carry "final", "master" or "approved" in their names; the delivered master is `<project>_<film>_<aspect>_<length>s_v<N>` until it is approved (`delivery.md` section 2).

### 8. Deadline mode

Deadline mode: the `ice-qa` skill, `references/critic-loop.md` section 6 (row "Deadline mode"). List every component that was not re-verified in the report.

Sources: echris6/motion-video-kit (critic loop), AbubakrChan/product-launch-motion, commercial-motion-design (Omar-Tnzxo), Vincentwei1021/mg-styles-15 (jury rubric), howseen-ai/claude-motion-design, charlie947/motion-graphics-skills, Tejashmakwana/motionmaxxing, nateherkai/herk-edit-kit, video-production-studio (Omar-Tnzxo).
