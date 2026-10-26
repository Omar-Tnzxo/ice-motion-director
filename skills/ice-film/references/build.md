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
| Review loop | `review-loop.md` | SHIP verdict or stop rule |
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
