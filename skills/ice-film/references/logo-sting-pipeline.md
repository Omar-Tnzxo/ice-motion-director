# Logo sting pipeline

From a supplied logo (raster or vector) to a rendered sting whose final frame is the approved logo. Vectorization method, motion personality presets, reveal patterns and the twelve principles for logos live in the ice-lottie skill; this file is the film-side order of work and the close menu.

## Contents

1. Steps
2. Motion brief
3. Close menu
4. Final Frame Contract
5. Sting checks

## 1. Steps

A logo sting is a micro job: these steps run inside the three micro passes of the production spine (`../SKILL.md`, `## Spine stages`). The first column names the spine stage each step belongs to.

| Spine stage | Step | Output | Gate |
|---|---|---|---|
| 01 | Read the source | size, alpha, colours, background; semantic parts (mark, wordmark, letters, dots, swooshes, negative space) as future actors | official file confirmed (ice-assets) |
| 02 and 05 | Motion brief | `ice/plan/motion_spec.md` (section 2) | every later parameter traces to it |
| 05 | Vector | a clean minimal SVG, motion-ready: one element per semantic part with stable ids, paths split along animation seams, draw-on strokes normalized, letters separate when they stagger; raster to vector by the lowest-complexity ladder, smoothness as a hard gate (ice-lottie) | the static vector is approved before choreography: by the user in step mode; in auto mode it is the run's one preview approval when the session is interactive and the user did not say not to ask, otherwise the approver role checks it by overlay against the official file and the delivery note says so; it is the approved logo |
| 07 | Choreograph | the timeline (anticipation, action, follow-through, settle) on one clock | stills at every key pose and every risk window (each handoff, crossing, occlusion) |
| 08a beside 07, 08b after it | Sound | 08a: one sting or the music's resolving hit planned on the settle; 08b: mixed on the draft (ice-audio) | the hit lands on the visual contact |
| 07 draft, 10 final | Render | MP4 plus transparent version as needed (ice-engines); Lottie through ice-lottie | Final Frame Contract passes |

## 2. Motion brief

Write `ice/plan/motion_spec.md` exactly as the ice-lottie skill describes it (`references/logo-pipeline.md`, Phase 1 step 2: personality words, usage context, choreography sketch; word-to-timing map in `references/logo-pipeline.md` (section "Motion Personality: Brand → Parameters")). Film-side additions: name "film end lockup" as the usage context when the sting closes a film, and add the sanity check: describe the finished animation in three words; they must match the personality words.

## 3. Close menu

Pick from the idea and the brand's personality, never by habit; a close picked from a menu without a reason is a default. Each close is a starting mechanism, never a recipe to copy.

| Close | Mechanism | Fits |
|---|---|---|
| Crash-in | the wordmark enters oversized (about 3.5x) and decelerates to rest with short decaying streak copies; hold 1.2-1.4 s | premium, dark brands (also a common pastiche; earn it) |
| Built from parts | stems and lines assemble the mark, a hollow becomes solid in one frame, letters one per frame with tightening tracking | quiet, editorial, enterprise |
| Emblem plus typed name | the emblem enters large and blurred, each 2-frame step halving the excess; the name types one letter per step; a short static hold; never from zero scale | quiet, editorial (Latin names; Arabic names reveal by whole word) |
| Icon settle | the icon on a plain ground settles from about 1.9x to 1.0 over about 2.5 s, most of the travel in the first tenth; no fade, no wordmark, no tagline | minimalist pure-shape icons |
| Mosaic dissolve | cells of 1.5-2.5% of width dissolve into the mark over about 0.33 s | technical, data brands |
| Morph from the previous identity | per-glyph flips and a short cross-dissolve on a shared centre | rebrands |
| Dive into a feature | the camera dives into a detail of the logo | technical, developer tools |
| Click cut before release | a button press resolves into the brand, cut before the release | playful consumer brands (a logo plus a "get started" pill plus a cursor is a web footer, not a close) |
| Typed request | a typed CTA or request, cut before send | developer and AI tools |
| Words focusing in place | CTA words come into focus and build the lockup | playful consumer brands |
| Eye opening | the real mark squashed to a thin line opens to full height | clean geometric marks |

Rules for every close: the logo arrives by cause; enter large or from a primitive, never from zero scale; the lockup leaves most of the frame empty; at most one tagline, usually none; do not fade the lockup out by default; when fading into a lockup, fade only the last text phrase, then build the lockup.

## 4. Final Frame Contract

The animation lands exactly on the approved static vector. Capture the static logo and the last frame with the same tool, viewport and pixel ratio: they differ by zero pixels. A sting that ends anywhere else fails, however good it looks. Keep the last 10-20 frames stable for a clean lockup; preserve mark and wordmark proportions, spacing, rotation and alignment. ice-qa runs the capture and the comparison.

## 5. Sting checks

- Anticipation reads; parts cascade instead of moving in lockstep; no two parts share identical start and end times unless staged on purpose.
- Overshoot stays inside the personality's bound; nothing clips the viewbox mid-flight; parts never detach.
- Wall-clock screenshots of a running animation are not evidence; capture deterministic frames.
- Reduced-motion variant shows the final logo immediately (web or app use).
- The competitor test: if another brand could ship the same animation, the choreography is generic.

Sources: nolangz/pixel2motion, Tejashmakwana/motionmaxxing (closes), diffusionstudio/lottie, haidrrrry/claude-remotion-skill, howseen-ai/claude-motion-design, video-production-studio (Omar-Tnzxo).
