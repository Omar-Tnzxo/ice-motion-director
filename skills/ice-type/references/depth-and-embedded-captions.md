# Embedded, behind-subject and 3D depth captions

Merged from heygen-com/hyperframes (Apache-2.0: embedded-captions composition craft, scene types, layout heuristics, failure modes, occlusion gate) and heygen-com/hyperframes-community-skills (Apache-2.0: camera-3d-captions and its recipes). Restructured; numbers kept. These techniques need a person matte; matting and the engine side are in the `ice-engines` skill. The scarcity rules for embeds are in `captions-system.md` section 3.

## 1. When to use

| Technique | Use on | Never on |
|---|---|---|
| Embedded captions (words behind the subject) | Talking-head and interview footage with a separable person; the user asked for a cinematic or in-scene look | Multi-speaker hard-cut clips, no human subject, clips under 3 s, footage with burned captions, busy handheld |
| Camera 3D captions (words in a 3D space around a static speaker, virtual camera moves) | A static-camera talking-head take (real or avatar), landscape, medium shot or wider, 5 to 20 s per piece | Plain subtitles, a moving or handheld camera, extreme close-ups, a subject a person-matting model cannot separate |

The video is delivered untouched: never grade, recolor or scanline the footage itself (a theme's plate reaction applied after the matte composite is the one sanctioned exception, and camera 3D grades plate and front text identically).

## 2. Embedded caption craft

- The compositional unit is a phrase, not a chunk. Do not split idioms, collocations or bound phrases. Climax selection: phrases are legal, prefer clause-final, never strand a determiner.
- Layer: background (behind the subject) is the default; partial occlusion is the feature. Foreground is the fallback. Hybrid: body behind, climax in front. Editorial split: behind in the upper 6 to 30%, climax in front at 70 to 85%. Sample the matte per block time window.
- Planes own position; caption groups own typography only. Do not default to a right column. Never switch spatial zones mid-sentence.
- Size the embedded climax to the frame: `font-size: calc(0.16 to 0.22 * frame height)`. Readability is a hard constraint: the subject may not eat the word. Never bleed body or narrator captions behind the subject; body edges breathe 3 to 6% from left and right; the climax deliberately crosses 20 to 40 px behind hair.
- Occlusion gate: per word, a peak of 65% or more obliterated fails, 35% warns; a cap fails at 50%. Measure real rendered boxes, not estimates. Judge in three steps: is it a function word, does the sentence still parse, is it 30 to 65% on a content word (that is the intended look).
- Scene types: wall embed needs a flat surface at a non-zero angle, mid luminance and no competing graphics; corner column crown needs a clean zone at least 15% of the width; portrait header (9:16) needs 15 to 25% clear space at the top. Crown at the shoulder top minus half the font size; a centered crown needs `crown_width > body_width + 400 px`. Keep a 4% broadcast-safe margin.
- Matte covers the person only: mic booms are excluded and large props may leak; the safe-zone probe is prop-blind, so eyeball every band you use.
- Failure modes: no double fade (container keeps a fixed opacity, animate per word); overlay blend vanishes on dark grounds (use screen) and screen fails above 180 luminance; render fps must match the source; composite in post against a PNG sequence when alpha video is unreliable; `max-width: calc(100% - padding * 2)`.

## 3. Camera 3D captions (depth captions)

### Setup
- One clock paints plate, matte and every glyph; nothing is a CSS animation.
- Pad the plate by reflection: 240 px each side, 480 px top, 240 px bottom, so whips, trucks and pull-backs never show an edge. Check plate and matte against the clip (size, frame rate, frame count) and fail on any mismatch.
- Read the head box and shoulder line from the person matte before placing anything.
- Fonts are user-supplied files; confirm the license allows embedding (see the `ice-assets` skill). A variable font gets its axes passed to the layout code and pinned in CSS (`font-variation-settings`, `font-optical-sizing: none`), or the optical size follows the rendered size and words overlap.
- Lens: `F = 1326.1 * H / 1080`; on frames wider than 1440, add `(W - 1440) / 2` to the wipe x.

### Beats and depth
- Pick 4 to 6 beats. Split each spoken clause into its own group; 2 to 3 caption groups per clause at depths D 1250 / 1500 / 2200. Every group gets its own D: plate 3000, captions 1250 to 2400, wrapped ring about 1100 to 2700. Near means bigger with a bigger shadow.
- Depth shadow `[6, 16, 0.5, 1500]` scales as `1500 / (D - cz)`.
- Depth of field: `sigma = 6.7 * |D - focus| / D` px at 1080 tall; flat captions cap at 1.2 px; ring glyphs take the full blur.
- Hero behind the head: the head hides the middle letters, at least 60% stays legible, the ascender stays inside the frame. Split a word into behind and front instances only when it is meant to pass behind the head.

### Moves (recipes)
| Move | Spec |
|---|---|
| Whip-in | Camera table over 19 frames from 502 px low, then a linear creep; plate scale 1.1 to 1.3; the frame never lands |
| Parallax truck | Swing segment, tx 420; the old layout fades over 3 steps |
| Body wipe | The speaker's own matte, `brightness(0) blur()`, leading edge from the wipe x |
| Wrapped ring | Horizontal circle in front of the speaker (center Z 2000), 11 to 16 degrees from above, turning; lower arc flips to read upright. Constants RZ 2000, RR 760, REL 0.28 (hand-drawn RR 900, REL 0.20); words visible within 55 degrees of the front, gone by 82. Ring text: type track 1.10 gap 26 to 30, hand-drawn track 1.0 gap 28; re-lay a turning ring every pose |
| Fly-through | Phrases at D 1500 / 2000 / 2500; focus follows the phrase |
| Staircase | About 64 px between words |
| Handwriting ring | R 900, tilt 11 degrees, or end words tipping toward vertical |
| Rack focus | To the ring's front depth while it turns, then to the speaker as the push starts |

### Timing
- Text is posterized to 15 fps (its own animation and the camera it sees); plate and matte move every frame.
- Motion blur: 7 ghosts over half a 15 fps step; shutter 0.5 on turning rings.
- Captions lead the voice by 0.2 s snapped to the 15 fps grid: `frame = 2 * round((t - 0.2) * 15)`. Plain Whisper starts run late: fix onsets first.
- Entries rise by: captions 30 px, heroes 110 to 260 px; ring words ease their last 30 to 44 px along the path. Use ring entry overshoot only when no neighbor is seated yet.

### Look
- Captions go over the dark side of the frame; text crossing skin or light clothing gets a dark halo; no trailing periods on screen.
- Grade: curves, skin saturation about 1.12, grain re-rolled per frame; give front text the same grade so a word split behind and in front stays one color.
- Two style families (illustration only): editorial (condensed display serif with italic heroes, a text serif for captions, cream plus one accent); bold (heavy grotesk heroes, light captions, one saturated accent). Hand-drawn variant: captions in a soft pencil, heroes in charcoal with jitter, ring in crayon.

### Checks (run through the `ice-qa` skill)
Disable the automatic contrast check (ghost layers trip it) and check contrast by eye; no group outside the frame for 5 or more steps while visible; no cross-word glyph touches, rendered word gaps about one space advance; render at high quality (CRF about 12) and check full-resolution frames per beat; judge grain on a render, not a snapshot. Grade plus ghosts cost about 2x a plain render.
