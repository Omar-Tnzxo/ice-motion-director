# Font sizes per aspect ratio and viewing context

Merged from heygen-com/hyperframes (Apache-2.0: typography, video-composition, house-style, frame presets, talking-head-recut, embedded-captions aesthetic principles and presets), Tejashmakwana/motionmaxxing (Apache-2.0), alexgreensh/anidoodle (MIT), vincentsch/explainroo (MIT), bradautomates/claude-video (MIT, manim), digitalsamba/claude-code-video-toolkit (MIT), the launch-motion group (MIT), Barty-Bart and charlie947 motion-graphics (MIT), edenfunf/reelmimic (MIT), alchaincyf/huashu-art-motion (MIT), Omar-Tnzxo/video-production-studio, plus ideas restated from bangtutorial/bang-motion, remotion-dev/skills, imMamdouhaboammar/motion-graphics-skills, Vincentwei1021/video-talkcraft, Vincentwei1021/anything2explainer and feitangyuan/onetake. Restructured; numbers kept.

Sizes are in px for the named canvas. For other canvases, scale by width for vertical and by height for landscape, or use the percent-of-height (%H) table, which works on any canvas.

## 1. Pick the size system

| Situation | Use |
|---|---|
| Any canvas, any film type | Role scale in %H (section 2) |
| Quick px numbers for a 1920 x 1080 landscape film | Section 3 |
| Vertical 1080 x 1920 or feed 4:5 / 1:1 | Section 4 |
| Captions | Section 5 |
| Porting web or UI design into video | Section 6 |
| Engine without a fixed canvas (container queries) | Frame-relative units: every frame ground sets `container-type: size`; all frame-relative units are `cqw` / `cqh`, never `vw` (`px / 1920 * 100 = cqw`) |

## 2. Role scale (% of frame height)

| Role | %H | Weight guide |
|---|---|---|
| Annotation, UI texture (not meant to be read) | 1.3 to 1.9 | 400 |
| Menu, UI card, prompt | 2.2 to 5 | 370 to 450 |
| Readable floor | at least 4; below 2 it is texture | |
| Supporting phrase | 5 to 7 (sentence 6.5 to 8) | 350 to 450 |
| Caption cap height | 3.5 to 5 | 500 to 600 |
| Headline | 7 to 11 (9 typical) | 400 to 550 |
| Hook-size caption | 7 to 9 | |
| Act-two word | about 16 | 550 |
| Embedded climax word | 16 to 22 | |
| Hero figure (number) | 22 to 29 (thesis word 33) | 400 to 500 |
| Wordmark | 9 to 14 (ink about 0.22 to 0.38 of width) | 500 to 600 |

Ratios: sentence to figure about 3.5x; main word to supporting line at least 3:1; hero to body at least 2:1. Layout math: ink height about 0.75 em; statement width about `0.45 to 0.5 * em(%H) * characters / 1.78` of the width; cap any held statement at about 0.8 of the width (fit-to-measure: cap the block at 78 cqw; at most 3 words display size, 4 to 6 headline, 7 or more smaller); line pitch 1.15 to 1.35 em. Load-bearing lines at least 1.4 cqw.

Change size by role, not weight: weight rises only about 20% as copy becomes brand (for example 400 to 450 to 480).

## 3. Landscape 1920 x 1080

| Role | Range | Notes |
|---|---|---|
| Title | 80 to 110 (default about 104) | Explainer defaults |
| Hero headline | 100 to 160 | Display face 600 to 800, tracking -0.03 em, line height 1.05 |
| Headline | 60 to 120 | 60 px is the floor for headlines |
| Brand scale (one measured system) | h1 88/700, h2 72/700, h3 48/600, body 44/400, label 34/600 tracking 2 | illustration of a coherent scale |
| Body / labels | 40 to 56; small text at least 32 | Explainer floor |
| Data labels | at least 16 (full-screen viewing), 24 in-feed | |
| Minimum readable | 28; list items, chips and bullets at least 40 | |
| Manim-style scenes | title 48, heading 36, body 30, label 24, caption 20; minimum 18 (manim units scale differently; use monospace there) | Manim only |

Viewing context changes the floor:

| Context | Body | Headline | Data label |
|---|---|---|---|
| Full screen (TV, desktop) | at least 20 | 60 and up | 16 |
| In-feed (X, LinkedIn, Instagram on phone) | at least 32 | at least 90 | at least 24 |

Rule: if you write a font size under 24 px on a 1080p canvas, justify it in the decision log. A web body size vanishes on a 1080p frame.

## 4. Vertical 1080 x 1920 and feed

| Role | Range | Notes |
|---|---|---|
| Hero | 140 to 290 (up to 450 when the crop is the composition) | Delivered vertical film, illustration |
| Reels hero | 80 to 140 at 1080 wide | |
| Titles | 88 to 168; title 100 and up as a phone minimum | |
| Main statement | 85 to 150 | |
| Hero word or number | 120 or more | |
| Word page (one word fills the screen) | at least 64 | |
| Hero prompt or input text | at least 64 on 1:1, 4:5 and 9:16; 56 on 16:9; wraps to 2 to 3 lines, never clipped | |
| Body / caption | at least 44 (before any safe-scale) | |
| Name label, kicker, year | at least 34 (sub-label 32); labels never under 34 | |
| Prompts, bubbles, card labels, tagline, install lines | at least 32 at 1080 across (about 11 pt on a phone) | |
| Credit / source line | at least 30 at opacity 0.6 or more | |
| Handwritten annotation | at least 48 | |
| Absolute floor | no text below 30 px, ever (26 px only for small print in a delivered film) | |
| Secondary text | at least about 40 | |

Information that does not fit goes to another scene or is cut, never shrunk. Small labels: make them at least twice the size you think they need for phone viewing.

Landscape to portrait conversion: titles 64 to 96 become 88 to 132 (about x1.35); body 24 to 30 becomes 30 to 40; kicker 14 to 16 becomes 18 to 22; data numbers 48 to 60 become 64 to 88; round to 4 px multiples; portrait horizontal padding 24 to 36 px.

A 1080p source fitted into a 9:16 frame shows at about 56% scale: re-render text larger rather than shipping shrunk text.

Safe-scale wrappers (scene scaled by 0.78 for platform UI) multiply every minimum by 1 / 0.78. Any group scale or camera zoom multiplies too: legibility is `font px * replica scale * camera zoom`. Room and screen layers (news reel, edit type `news-reel`, or any digital camera on one take): a `layer: rig` graphic is checked at the smallest scale the digital camera reaches while the graphic is on screen (single moves measured down to x0.60; check `font px * smallest rig scale` against the floors of this table, never the scale at its entry frame); a `layer: screen` graphic never scales with the camera and is checked at its own size. Layers defined in `skills/ice-motion/references/camera.md`, section "Digital camera on one take (news reel)". Anything the voice names should land at 26 px or more on screen; a window to be read takes about 70 to 80% of the frame width. Readability comes from the camera, not from inflating an interface: show UI at real size and push in (see the `ice-motion` skill for camera moves).

## 5. Captions

| Canvas | Body | Emphasis / hook |
|---|---|---|
| Vertical 1080 x 1920 | 65 to 95 (caption cap height 3.5 to 5%) | 130 to 170 |
| Landscape 1920 x 1080 | 40 to 55 | 70 to 100 |
| Rail | `0.045 * frame height` | inline pop at most 1.1x |
| Big karaoke block | proportional face at least 96 (monospace 64 to 72); fit base 128 min 48 | |
| Social caption fit | max width 1600 landscape / 900 portrait, base 78, min 42 | |
| Hormozi-size | about 7 to 9% of frame height: hook size, not body size | |

Caption presets measured on one system (landscape column, illustration): intro 66 italic 500, phrase 78/600, emphasis 92/800, crown 140/900 uppercase (one per render); wider 600 to 760 px columns: phrase 108, emphasis 128, crown 220; portrait crown divided by 1.5.

Captions in drawn styles: captions at least 60 to 74 px; whiteboard caption cards 64 px; caption layers at least 5% of frame height with a heavy outline.

## 6. Web to video scale

| Element | Web | Video (1080p) |
|---|---|---|
| Headline | 32 to 48 | 64 to 120 |
| Body | 14 to 16 | 28 to 42 |
| Labels | 12 | 18 to 24 |
| Decorative opacity | 3 to 8% | 12 to 25% (under 10% is invisible) |
| Borders | 1 px | 2 to 4 px |
| Padding | 16 to 32 | 60 to 140 |

A 1 px border with a 0.06-opacity shadow is invisible after H.264 compression. Everything in video is larger than web UI: viewers sit farther away.

Grow a rolling numeral with `transform: scale`, never by animating `font-size`.

## 7. Conflicts and their scope

| Rule A | Rule B | Scope |
|---|---|---|
| Full-screen body 20 px minimum | In-feed body at least 32 px; vertical body at least 44 px; no text under 30 px | 20 px only for full-screen landscape viewing (TV, desktop, presentation); phone and feed deliveries use the phone floors |
| Caption 96 px minimum | Rail at 0.045 x height (about 49 px at 1080, 86 px at 1920) | 96 px for big karaoke social blocks; rail sizes for talking-head, explainer and long-form rails |
| Small title lines (about 28 px) that become big through a camera push | Headlines 60 px and up | Small text is legal only when a camera push makes it readable before it must be read (camera-led explainers) |
