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

Sources: motionmaxxing (motion.md smear and clocks, world.md), hyperframes skills (motion-blur reference, motion-blur-streak), huashu-art-motion, anidoodle (speed ceiling), claude-motion-design (adaptive subframes), motion-video-kit (accumulation blur), product-launch-motion (renderer contract grain), video-production-studio, lemo-opuscar, reelmimic styles, community camera-3d-captions and vox-explainer, ideas from onetake (rewritten).
