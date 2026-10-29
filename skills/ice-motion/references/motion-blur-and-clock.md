# Motion blur and frame clocks

One clock and one blur grammar per film. This file owns the creative choice; render implementation (subframe capture, shutter accumulation, encoder settings) is owned by the ice-engines skill.

## 1. One frame clock per film

| Clock | Use | Scope |
|---|---|---|
| Smooth 24-30 fps | Product, UI, explainers, talk, calm ads | Most films; 30 fps for talk and calm ads, 24 for a filmic look |
| Smooth 60 fps | Fast UI motion, liquid morphs, extreme zooms, brand morphs | Product launch with fast UI, logo morphs |
| On twos (12 drawings on 24 fps) | Hand-made, indie, technical, editorial collage (Vox-style elements step at 12 fps while the camera stays smooth), cel, paper cut-out | Art film, collage explainer, doodle |
| 12 fps drawn on a 24 fps camera | Drawn characters on a moving world | Storytime, anime-cel, pixel art (8, 6 or 4 fps sprite poses) |
| Constant interval cuts at 30 fps | Music-led montage on a grid | Music video, hype |

- Mixed step rates inside one moment read as a bug, not a style.
- Camera and light stay smooth every frame even in stepped films; a stepped camera reads as lag. Pixel-art cameras snap to whole art pixels.
- Stepped states (typing, glitch, dial states, discrete jumps) are never tweened: discrete jumps are instant.
- Held duplicate frames sparingly (1-2 per film). Start stepped shots on multiples of the step.
- Higher output fps does not improve motion authored for a lower cadence; footage at 30 fps inside a 60 fps render shows each frame twice.

## 2. One blur grammar per film

| Grammar | What it is | Fits |
|---|---|---|
| Smear | Per-element smear on the first frame of a move (its peak), decaying about half each frame over 2-4 frames, plus 1-3 low-alpha trail copies (0.22 / 0.12 / 0.06) | Hand-made, fast, energetic, consumer, AI-agent and premium consumer films |
| Crisp | No blur; speed carried by spacing and hard steps | Dense legible UI, technical, developer, indie, flat vector |
| Shutter | Real motion blur: each output frame averages subframes spread across a 180-degree shutter | Cinematic, 3D, photographic, fast whips in smooth films |

- Never combine shutter blur with per-element smear (double blur) or with an on-twos stepped film.
- Smear lengths: word 8-30 px, card 15-35 px, cursor 8-25 px, whip 3-65 px (100-140 px on a whip out), a one-frame pan up to about 500 px; in practice about 0.5-1x of that frame's displacement and under about 0.15 W. One-sided smears read better than a symmetric blur for cursors.
- RGB split only on the first word, peak 1-4 frames, gone by 9 frames; a crash-in fringe of about 15 px decaying over about 5 frames.
- Blur-focus reveal: blur 12 to 0 px, opacity 0.1 to 1, about 4 frames per word.
- Blur peaks by element: card 6 px, dock 12, orb 15, button burst 25, roll 22, hero counter 12-17, whip 9, logo 18.

## 3. When to blur

- Blur is not polish: applied to motion that was never fast enough it reads as a soft, cheap render.
- Do not blur: travel under about one element width per frame, fades and colour or filter beats, text meant to be read at that moment, slow drift or parallax, a whole scene.
- Blur the beats that snap (a slam, a whip, a hard cut in position, a spin, a scale punch): one to three of them in a composition; targeted blur beats full-frame blur.
- Fast moves need real motion blur: above about 80 px per frame at 1920 wide without it, motion strobes into copies; CSS blur is not motion blur. Directional blur for whips and text in or out where the grammar is smear.
- Speed ceiling: past about 2.5 frame widths per second blur stops reading as motion; cut instead.
- Type that must be read is sharp within 3-4 frames of landing; keep static text sharp under subframe blur (counters and typed text read the frame time, not the subframe time).
- Never blur across a hard cut: subframes stay on their side of the cut.

## 4. Shutter numbers (creative targets)

| Setting | Value |
|---|---|
| Shutter angle | 180 degrees default (shutter = 0.5 of the frame); about 300 degrees on the fastest swing easing back to 180; 360 is smeary |
| Subframes | 4 for drafts (4 leave double outlines on fast moves), 8 is the floor for finals, 6-8 for fast moves, up to 16-64 for the fastest; adaptive: still 1, up to about 20 px per frame 4, above that ceil(px / 5) up to 64 |
| Component default measured against a 30 fps AE export | shutter angle 720 (two frames), phase -360, 16 samples per frame |
| Accumulation | average in linear light; skip held frames; ramp the shutter over about 6 frames |

## 5. Grain and texture motion

- Grain 0.03-0.06 only on gradient, photo or 3D films (it kills banding); skip it when the brand is crisp and flat on purpose; one grain level for the whole film.
- Grain re-seeded every frame reads as electronic sizzle and bloats the encode (30 Hz grain about 85 MB vs about 9 MB without); seed it at about 12 Hz.
- Film texture (grain, boil, gate weave) never touches text and never exceeds about 1 px or 0.05 stop; gate weave about 0.5 px at 8 Hz.
- Full-screen strokes re-seeded at 8 fps flicker instead of living; keep stroke positions fixed and let a direction field vary.

## 6. Finishing layer

Owner decision, 2026-10-29. Scope: every film type; most often a film with a reference. The finishing layer is motion blur on fast moves, blur for depth, blur on entrances and exits, film texture (grain, specks, halftone, flicker), vignette, glow and the grade.

**The rule: only where measured or reasoned.** Each effect is applied only on the shots, at the amount and for the reason that one of two sources gives: the reference measurement (the `ice-remake` skill, `references/measuring.md`, section "Finishing layer": where, how much, why) or a D-entry in `ice/DIRECTION.md` with its reason for this film. Never on everything, never "for polish". Each effect is logged per shot (effect, shots, amount, source) and the delivery report lists it. An effect with no source is decoration and fails the slop scan (the `ice-qa` skill, `references/slop-scan.md` section 5, "Finishing effects").

**How it fits sections 2 to 5.** A measured blur picks the film's one blur grammar (section 2): smear or shutter, never both. Section 3 still decides which beats may blur and section 5 the grain motion and the text rule. Without a measurement, the defaults of sections 3 and 5 hold; with one, the measured amount and shots win for that film. Text stays sharp and texture never touches text, so texture layers sit under the type, and captions are burned in after the texture pass.

**Order of passes.** Motion blur at render time; then depth and entrance blur; then glow; then the grade; then vignette; then grain, specks, halftone and flicker last, so the grade and the blur never smear the texture.

**Made with Ice's own tools, deterministic.** Every random value (grain seed, speck positions, flicker level) comes from a seeded generator keyed on the frame number, so a re-render gives the same frames (the `ice-engines` skill, `references/determinism.md`). Which engine runs which route: the `ice-engines` skill, `references/engine-choice.md`.

| Effect | HTML engines (HyperFrames, the single-page `render-html` route) | Remotion | FFmpeg (edits, footage, a pass after any render) |
|---|---|---|---|
| Motion blur on fast moves | Shutter: subframe accumulation of the `render-html` route (`ice-engines`, `references/html-canvas-capture.md` section 5); smear: the per-element smear and trails of section 2, tweened with GSAP | The motion blur component (`ice-engines`, `references/remotion.md`; check the pinned version) | Frame blending on the fast segment only: cut the segment, apply `tmix` with a few weighted frames (or `tblend` between neighbours), then join; never across a cut |
| Blur for depth | CSS `filter: blur(<px>)` on the background layer, tweened as a `filter` target; never blur a `<video>` directly (blur a pre-rendered copy) and never tween blur and opacity in one tween on one element (`ice-engines`, `references/determinism.md`) | The same CSS filter on the layer | `gblur=sigma=<n>` (or `boxblur`) on the background stream before it is overlaid under the subject layer |
| Blur on entrances and exits | The blur-focus reveal of section 2 (blur to 0 with the arrival), on the element that enters or leaves | The same, driven by the frame | `gblur` on the cut segment of the entering or leaving clip, then join |
| Grain | A fixed noise tile or canvas layer re-seeded at about 12 Hz (section 5) under the type | The same layer, seeded per frame step | `noise` with a fixed `all_seed`, temporal at the measured strength; cheaper here than captured in the browser (`ice-engines`, `references/render-export.md` section 3) |
| Specks and scratches | A canvas layer drawn from the seeded generator, stepped on twos or at the measured rate | The same canvas layer | Overlay a speck plate rendered once by code, blended with `blend` (screen or lighten) or `overlay` |
| Halftone | A dot screen drawn on canvas or SVG over the shot, dot size from the measurement | The same | No native halftone filter: render the dot pass on the HTML route over the extracted frames, or blend a pre-rendered dot mask with `blend` (multiply) |
| Flicker | A brightness filter driven by a seeded per-step table, at the measured depth and rate | The same | `eq` with `eval=frame` and a brightness expression of the frame number or time, with no unseeded randomness |
| Vignette | A radial gradient overlay layer | The same | `vignette` with the measured angle |
| Glow | A blurred copy of the glowing element behind it with `mix-blend-mode: screen` (fine in Remotion and single-page capture; HyperFrames overlay tracks ignore blend modes, so draw the glow once onto a canvas or image: `ice-engines`, `references/hyperframes.md` section 12). Limits: `composition-and-staging.md` section 6 | The same as single-page capture | `split` the stream, `gblur` one copy, blend it back with `blend` (screen) at the measured opacity |
| Grade | One grade layer of CSS filters (contrast, saturation, warmth) on the root, or a pass in FFmpeg after render | The same | `lut3d=<file>.cube` with a LUT built for this film and recorded, or `curves`, `eq` and `colorbalance` at the measured values; one grade per film, or per act when the measurement names acts |

A measured effect that the chosen engine cannot make goes to the FFmpeg pass after render; when no route can make it, say so in the delivery report instead of faking it with a different effect.

Sources: motionmaxxing (motion.md smear and clocks, world.md), hyperframes skills (motion-blur reference, motion-blur-streak), huashu-art-motion, anidoodle (speed ceiling), claude-motion-design (adaptive subframes), motion-video-kit (accumulation blur), product-launch-motion (renderer contract grain), video-production-studio, lemo-opuscar, reelmimic styles, community camera-3d-captions and vox-explainer, ideas from onetake (rewritten).
