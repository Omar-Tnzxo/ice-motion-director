# Film type: logo sting

Fields in order: Fit, Purpose, Structure options, Rhythm ranges, Timing master, Transition policy, Camera policy during holds, Sound policy, Text density, Truth and content, Richness floor, QA thresholds, Deliverables, Pointers.

Stage order: 01 02 05 [07 08a] 08b 09 10
Leads with: the look, run as the three micro passes of the spine: 01, 02 and 05 condensed (source read, motion brief, approved static vector), then 07 with 08, then 09 and 10; 03, 04 and 06 are `not_used`, folded into `ice/plan/structure.md` (steps in `../logo-sting-pipeline.md` section 1).

## Fit

- A 2-8 s logo reveal, ident, bumper, channel intro or outro, app-open splash rendered as video.
- Output is Lottie, an app or web loader, or a hover or idle loop: ice-lottie owns it. A logo sting rendered as video stays here.
- The step-by-step pipeline (raster to vector, choreography, final frame): `../logo-sting-pipeline.md`.

## Purpose

The mark comes to exist in a way that expresses the brand's personality, then holds as the exact approved logo. The logo arrives by cause (a click, a result, a camera move, the end of a motion), not by default.

## Structure options

| Option | Skeleton and numbers |
|---|---|
| Classic 5 s sting | mark in (0-0.8 s), wordmark (0.6-1.8 s), detail or tagline (2-3.5 s), breathe, exit in the last 0.5 s |
| Assembled sting | 3-8 s; the mark draws as a wireframe, pieces assemble it, one glint passes, the name types only after the mark settles |
| Draw-on | strokes draw in writing order (draw shape about 10:70:20), fills fade in during the last fifth |
| Staggered assembly | parts arrive on a 20:50:30 anticipation, action, follow-through split; cascade capped about 0.7 s after the first arrival |
| Scale pop | a coil before the peak, overshoot within the personality's bound, a counter-settle |
| Mask wipe | 15:60:25; wipe direction follows reading direction (right to left for Arabic wordmarks) |
| Morph from primitive | a circle, line or square morphs into the mark (few-knot paths with matching structure) |
| Line opens into the mark | squash the real mark vertically from a thin line to full height (an "eye opening") with the solid line overlaid for the first 12%; never crossfade a drawn shape into the raster (grey ghost) |
| Bookend lockup | the lockup resolves from noise, a rule draws, the subtitle types after, the motif lands as punctuation, a quiet tagline arrives last |
| Close chosen by personality | see the close menu in `../logo-sting-pipeline.md` (crash-in, built from parts, emblem plus typed name, icon settle, mosaic dissolve, morph from previous identity, dive into a feature, click cut before release, typed CTA, words focusing in place) |

## Rhythm ranges

| Measure | Range |
|---|---|
| Splash or intro reveal | 1200-2000 ms of main motion; 6-10 key poses (a 300 ms header reveal wants 2-3) |
| Anticipation, action, follow-through and stagger of parts | the `ice-motion` skill, `references/physics-and-morphing.md` section 2 |
| Hold | a mark registers in about 0.5 s and a name in about 1 s; see the end-hold scope below |

## Timing master

The sting's own choreography; with music, the final hit lands on the mark's settle. Sound starts on or just before the visual contact (ice-audio).

## Transition policy

No internal scene changes. Parts transform into the mark; nothing fades in from nothing as the main move. Never scale the logo up from zero.

## Camera policy during holds

| Scope | Policy |
|---|---|
| Standalone sting or ident file | The last 10-20 frames are the exact static approved logo (Final Frame Contract); nothing moves |
| Lockup at the end of a longer film | Something small may stay alive during the hold (a micro drift or settle); the resolved hold lasts 0.6-1.4 s for a sign-off |

## Sound policy

One sting or the music's own resolving hit; if the music resolves on the logo, add no separate sting (keys clash). Ice-audio owns levels.

## Text density

Wordmark plus at most one tagline; most closes carry none. Arabic wordmarks animate whole words, never letter by letter (ice-arabic).

## Truth and content

The official logo file only, never redrawn from memory, recoloured, distorted or re-spaced. When only a raster exists, trace it only if it is the user's own mark and no vector exists, disclose the fitted reconstruction, verify it by overlay and get it approved before choreography; never trace a third-party mark, ask for the official vector instead (the `ice-lottie` skill, `references/logo-pipeline.md` intake gate; the `ice-assets` skill, `references/brand-authenticity.md` section 4). Mark and wordmark proportions, spacing, rotation and alignment are preserved unless the user asks (ice-assets, brand authenticity).

## Richness floor

Minimums the render must meet; measures and exemptions: the `ice-motion` skill, `references/composition-and-staging.md` section 7. ice-qa measures them. The Final Frame Contract frames (the static approved logo) are exempt from the motion rows.

| Measure | Floor |
|---|---|
| `hero_share` | 12 percent for a mark alone at its settled size |
| `hero_width` | 30 percent for a wordmark or full lockup at its settled size |
| `frame_fill` | n/a (a lockup on its ground) |
| `empty_half` | n/a |
| `depth_layers` | 2 (the mark and a ground with its own light or plane) |
| `in_shot_motion` | 90 percent before the Final Frame Contract frames |
| `longest_still` | only the final 10-20 frames of a standalone file; 1.4 s for a lockup at the end of a longer film |
| `surface_detail` | yes, or the brand guide's flat ground plus one light event |
| `light_events` | 1 |
| `real_material` | 100 percent: the official logo file, untouched |

## QA thresholds

- Final Frame Contract: the static logo and the last frame captured with the same tool, viewport and pixel ratio differ by zero pixels.
- No part clips the viewbox mid-flight; parts never detach; the logo is still the logo at 50% of the timeline.
- Reduced-motion variant shows the final logo immediately (web or app use).
- Competitor test: if another brand could ship the same animation, the choreography is generic.

## Deliverables

MP4 on the brand ground; transparent version (ProRes 4444 `.mov` or VP9 WebM) for overlays; poster frame equal to the final logo; Lottie only through ice-lottie. See `../delivery.md`.

## Pointers

Pipeline: `../logo-sting-pipeline.md`. Vectorization, motion personality presets, reveal patterns, twelve principles for logos: ice-lottie. Gate measurement: ice-qa.

Sources: haidrrrry/claude-remotion-skill, video-production-studio (Omar-Tnzxo), nolangz/pixel2motion, howseen-ai/claude-motion-design, nateherkai/herk-edit-kit, Tejashmakwana/motionmaxxing, diffusionstudio/lottie.
