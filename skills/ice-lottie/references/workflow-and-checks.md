# Ice Lottie: workflow steps, scoped conflicts and verification

Moved out of `SKILL.md` to keep it short. Paths in this file (`references/`,
`scripts/`) are relative to the ice-lottie skill folder, as in `SKILL.md`.

Contents:
- Workflow: the named steps each spine stage row runs (Required at every used stage)
- Defaults that always apply: the rules every asset obeys (Required at every used stage)
- Conflicts scoped: timing, overshoot, frame rate, renderer and palette rules, each in its scope (Required at 05 and 07)
- Verification: the evidence table for stage 09 (Required at 09)
- Owned elsewhere: which skill owns the neighboring rules

## Workflow

The workflow runs on the production spine (the `## Spine stages` section of
`SKILL.md`). The steps below carry names, never numbers; the two-digit number
after each name is the spine stage it belongs to. Run them in the order listed
(05 before 04 on this route, see the stage order). The "Phase 1, 2, 3" of
`references/logo-pipeline.md` are steps of that file, not spine stages.

- **Intake (01).** From the brief, fix: target platform and runtime, slot size,
  background policy (transparent asset vs full-frame), one-shot vs loop vs
  reversible, language and direction, brand assets supplied. A question goes
  only into the stage 01 message (the ice-direction skill, section 3 Part A
  step 6), and only when the answer changes the output (transparent vs
  full-frame, target runtime, loop vs one-shot, missing copy or source asset).
  Decide the rest and log the reason.
- **Assets (01).** Use supplied vectors and Lottie/AE exports as they are; never
  redraw an existing mark. A raster logo goes through the intake gate in
  `references/logo-pipeline.md`. Fonts and third-party marks follow the
  ice-assets skill.
- **Direction (02).** Message, focal subject, support layer and accent system
  (`references/design-taste.md`), and the versions list.
- **Personality and tokens (05).** Pick the industry preset and adjust it
  (`references/ui-motion-tokens.md`); for a logo also map brand words to
  timing (`references/logo-pipeline.md` (section "Motion Personality: Brand → Parameters")). Colors and type come from the
  ice-direction skill's decisions; for UI assets start from the host product's
  tokens. Generate tokens with `scripts/motion-tokens.mjs` when motion also
  runs in code. Write the personality, curves and timing table to
  `ice/plan/motion_spec.md`; every later number traces to it.
- **States and frames (04).** With the look of 05: the first-frame and
  final-frame composition as finished stills and the key states, before any
  keyframe (`references/design-taste.md`).
- **Author (07).** Lottie: `references/player-contract.md` then
  `references/svg-compatibility.md` (section "Lottie Spec Map"), the routed recipe, `references/motion-taste.md`;
  multi-idea scenes: `references/chapterization-transition-grammar.md`.
  Animated SVG: `references/reveal-patterns.md`,
  `references/twelve-principles-for-logos.md`,
  `references/export-handoff.md` (section "HTML Delivery Template").
- **Verify (09)** (section Verification below). Fix and re-check; two honest
  passes, then report residuals instead of polishing further.
- **Export and hand off (10)** (`references/export-handoff.md`): asset, static
  fallback, previews, tokens, handoff note. Then hand the evidence to the
  ice-qa skill for the delivery report and fingerprint.

## Defaults that always apply

- **Premium means subtract.** Chrome budget 0: no framing card, border, divider
  or second surface tint unless it does a job whitespace cannot. One surface
  tone; one divider weight and color if any. Premium is carried by scale,
  weight, brightness, spacing and timing.
- **One focal subject, one support layer, one accent system.** Compose the
  first and final frames as finished stills; motion reveals the composition,
  it never rescues it.
- **Purpose gate.** Each motion is feedback, orientation, continuity or a rare
  earned delight; anything else is removed.
- **Easing by behavior.** Never default `ease` or linear for movement. Linear
  only for rotation, time-progress, scanners. Only the focal element gets the
  strongest curve. Overshoot is off for functional, premium, finance, health and
  data work; playful categories may opt in within their preset.
- **Stagger, never lockstep.** No two parts share identical start and end
  times unless staged on purpose; cap the total cascade.
- **Final Frame Contract.** A logo animation ends exactly on the verified
  static vector; any asset's settled frame is the intended exported pose.
- **Background policy.** Logos, icons, loaders, overlays, lower thirds and
  SVG-derived assets are transparent; full-frame scenes carry a slotted
  background. Never add an opaque rectangle to fill the canvas.
- **Loops.** First and last frames match in position, opacity, color and
  perceived velocity; attention loops stop or decay after a few cycles when
  nothing is loading.
- **Reduced motion.** Ship the settled frame or a static SVG as the fallback;
  the animated SVG route wraps motion in `prefers-reduced-motion: no-preference`.
- **Direction.** Wipes, fills and sweeps follow the reading direction (right to
  left for Arabic); clocks, timelines, numbers, check marks and logos never
  mirror; Arabic is never animated per letter (see the ice-arabic skill).
- **Literal keyframe easing.** In CSS, a `var()` timing function inside
  `@keyframes` is silently dropped in Chromium and the segment runs linear;
  write literal `cubic-bezier()` values there.
- **No sameness.** A starter, preset or recipe is a reference, never the
  answer: the asset's palette, motion language and structure come from this
  brief (anti-sameness rules in the ice-direction skill).

## Conflicts scoped

Both rules hold, each in its scope.

| Topic | Rule A | Rule B | Scope |
|---|---|---|---|
| Press and hover timing | 70 to 150 ms (live product controls) | 8 to 18 frames at 60 fps (Lottie press asset); logo hover 150 to 300 ms | Live control feedback in code uses A; an authored Lottie press or a brand-mark hover uses B |
| State change timing | 150 to 350 ms by size (live UI) | 18 to 45 frames toggle/progress, 30 to 75 frames state icon, 30 to 75 frames notification (Lottie) | A for motion in code; B for Lottie confirmation assets that play after the state changed |
| Bounce and overshoot | Off by default for premium and functional UI | Playful presets allow bounce 0.2 to 0.35, overshoot up to about 1.08 to 1.12 | Use the preset of the product category; text and data never overshoot |
| Frame rate | 60 fps for Lottie UI assets | the film's fps (often 30) | A for assets played by a UI runtime; B when the Lottie is placed in a rendered film |
| Verification renderer | Verify only in Skottie (reference player) | Verify in the target runtime | Always the target runtime; Skottie as reference when available, mandatory when the target is Skottie-based |
| Default palette with no brand | Pure black/white contrast | No default look; color from direction | UI assets take host tokens; standalone scenes take the ice-direction color decision, where black/white is one logged candidate |
| Tracing a raster logo | Fit a clean SVG from the raster | Never trace or redraw an identity asset | The scoped rule: the `ice-assets` skill, `references/brand-authenticity.md` section 4 |
| Chaptering | Split multi-idea prompts into chapters | Keep one beat | Chapter dense or list prompts; keep one beat for a logo lockup, one icon, one micro-interaction, one CTA, read-critical text |

## Verification

Evidence, not claims.

| Check | How | Fails when |
|---|---|---|
| JSON valid | `node -e "JSON.parse(require('fs').readFileSync('<file>','utf8'))"` | parse error, missing `v fr ip op w h nm assets layers`, `op` treated as inclusive |
| Renders in target | pinned frames in the target runtime (and Skottie) | blank layer, blank text, missing asset, unstyled shape, wrong stacking |
| Design stills | frame 0, midpoint, settle, `op - 1`, semantic beats | rubric in `references/design-taste.md` fails |
| Motion | scrub plus beat frames; seam frames for loops | lockstep parts, uniform easing, drift after settle, visible seam, clipping mid-flight |
| Text rows | zoomed crops | mixed-size runs share a baseline, accidental breaks, clipped Arabic dots or descenders |
| Logo geometry (raster route) | `scripts/render_overlay.py`, `scripts/svg_path_audit.py` | stair-steps at 200 to 400 % zoom, structural mismatch; IoU is reported, never a fixed threshold |
| Easing actually applied (SVG route) | `scripts/probe_motion_continuity.py --probe` | computed values equal the linear fraction |
| Handoff continuity (SVG route) | `scripts/probe_motion_continuity.py --ink-sweep` | flatline then jump (stall and pop) |
| Final Frame Contract | `scripts/capture_motion_frames.py --compare-final`, then `?static=1` vs `?t=<end>` same pipeline | any difference in the same-pipeline pair |
| Reduced motion and RTL | toggle the setting; RTL build | movement remains, wrong wipe direction, mirrored clock or logo |
| Weight | raw and gzip size, layers, embedded images | over the budget agreed with the developer |

Wall-clock screenshots of a running animation are not evidence. Never certify
the asset as good; report what was checked and the numbers.

## Owned elsewhere

Film-level timing, cut catalog and camera grammar: ice-motion. Engine embedding
(Lottie in HyperFrames or Remotion, render determinism, platform safe zones):
ice-engines. Typography and captions in films: ice-type. Arabic rules: ice-arabic.
Color psychology, intake questions, pitch round: ice-direction. Asset rights,
fonts, brand authenticity: ice-assets. Gates, critics, fingerprint, delivery
report: ice-qa. Video logo stings: ice-film.
