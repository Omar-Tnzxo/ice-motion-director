# Pre-render lint and the contact sheet before render

Everything here runs on the composition, before a full render. Sources: motionmaxxing (Apache), hyperframes and its docs (Apache), product-launch-motion (MIT), anidoodle (VERBATIM_OK), huashu-art-motion (MIT), bang-motion (MIT), herk-edit-kit (MIT), Barty-Bart and pixel2motion (MIT), explainroo and video-use (VERBATIM_OK), text-to-lottie (MIT), founder skills, IDEAS_ONLY ideas (imMamdouhaboammar, PolyForm explainer sources) rewritten.

## 1. Order of work (cheapest first)

| To check | Use | Cost |
|---|---|---|
| A tween's shape or timing | Preview scrub at that second | seconds |
| Layout, composition, legibility | Stills at chosen times | seconds |
| Sync across one shot | Render that one composition | about 1 s per second of film |
| Grade, transitions, cuts | Draft-quality full render (half scale) | about half a final |
| Anything audio | Full render plus master, then measure | minutes |
| Delivery | Final render, master, verify the file | minutes |

Rules: stills before render; iterate at draft quality and go final only when the shot is locked; render one composition, not the film, while working on one shot; batch audio changes and verify them once; keep the raws. Build the hardest beat and one critical transition first, and probe any shared system (camera rig, shared library) with a short render before builders fan out (product-launch-motion, founder skills, PolyForm ideas).

## 2. Engine lint (structure and determinism)

Run the engine's own linter first and stop on errors. For HyperFrames: `npx hyperframes lint`, then `npx hyperframes check` (check runs lint first). Rule codes, severities and flags: `engine-lint-catalog.md`. For other engines the ice-engines skill names the equivalent; when none exists, run the contract scan in section 3.

Facts about lint results that agents misread:
- A lint error switches off the browser audits: `check` then reports 0 samples and 0 text checks. That reads like a clean file and means nothing ran (hyperframes).
- When the browser never ran, the layout, motion and contrast sections are empty, not clean (hyperframes).
- A check that does not apply prints `----`, never PASS (anidoodle).
- Treat `duplicate_media_discovery_risk` and `overlapping_gsap_tweens` (including exact butt-joins: leave a 0.01 s gap) as errors even when reported as warnings (product-launch-motion).
- Lint and check are necessary, not sufficient: they verify structure, never quality. A composition can lint clean, render without error, pass contrast and still be a slideshow (hyperframes, product-launch-motion).
- Do not silence a finding with an escape hatch before looking at the still: use the narrowest opt-out on the specific layering participant, never on a scene or root wrapper; an occlusion opt-out also silences the contrast gate for that whole subtree (hyperframes).
- Never downgrade an effect to a cheaper, different one just to satisfy a linter; reproduce the same visual a supported way (hyperframes).

## 3. Engine-agnostic contract scan

| Check | Pass when | Source |
|---|---|---|
| Banned clock and randomness | No `Math.random` in the render path (seeded generator instead; seeding once at setup is fine), no `Date.now`, `performance.now`, `setTimeout`, `setInterval`, `requestAnimationFrame` loops, CSS transitions or keyframe animations driving the picture | motionmaxxing, bang-motion, Barty-Bart, hyperframes |
| Seek purity | Any frame renders correctly on its own, in any order: jumping to a frame equals playing to it | all engine sources |
| Seek-order test | Render the same frames in order and in random order (and once under CPU load); compare hashes first (free), then PSNR; identical or above 45 dB passes | anidoodle, imMamdouhaboammar (idea), motion-video-kit |
| Self test | When the runtime ships one (for example `Motion.selfTest`), it reports zero mismatches | motionmaxxing |
| One writer per property | Two tweens never write the same property of the same element at overlapping times; a later zero-duration set on the same element at the same time can blank a scene on direct seek | motionmaxxing |
| Initial state | Hidden initial states live in CSS on the same selector the tween uses; letters and punctuation inside split text are hidden too, or they flash before the entrance | bang-motion |
| Hidden means unmounted | Semantic children are not mounted before their reveal frame (bars with min-height, strokes, glows and filters show at opacity 0) | founder skills |
| Hide is undone | A hide that zeroes opacity is undone by the draw function, or elements stay invisible | product-launch-motion |
| Fonts | Every declared font loads; assert it (`document.fonts.check(...)` throws on a fallback) and never rely on a default font; in raster pipelines pass an explicit font file | Barty-Bart, video-use, ice-assets skill |
| Keyframe easing literal | In CSS keyframes, the timing function is a literal `cubic-bezier(...)`; a `var()` there is silently dropped and the segment runs linear; keyframes use fill-mode both or forwards | pixel2motion (logo pipeline) |
| Transitions execute | Render every transition at p = 0.25, 0.5, 0.75 through the full frame function; solo scene renders never run transition code | huashu |
| Contract grep in the build | A scan for the banned names belongs in every build | anidoodle |

## 4. Page-chrome lint (gate G5)

Required labels and disclaimers (the ice-assets skill's `truth-sheet.md` sections 9 and 12) carry `data-required-label` on their element and are exempt from every G5 rule; the lint prints each under its exemptions with its size and box, and the critic checks them against that section's size and position rule. Text hidden by a clip-path mask (a reveal at 0 percent) counts as hidden.

```
node scripts/lint.mjs ice/build/index.html [--samples N] [--json]
```

Exit 1 = G5 fails, or `depth_layers` is under the film type's floor, or the type has a `depth_layers` floor and the page marks no layers (`data-ice-layer`, `window.__layers(t)`): unmeasured fails. The page is seeked with whichever contract it exposes: `window.renderAt(t)` or `window.seek(t)` (the ice-engines HTML capture route), `window.__seek`, `__timelines` or GSAP (HyperFrames); a page with none is read as one frame and the gate prints WARN, not PASS.

HTML capture route (no HyperFrames installed): `npx hyperframes lint` and `check` do not exist there. Replace them with: the contract scan (section 3) on the page; `lint.mjs` with the page's real size and duration (G5 plus the DOM richness line); `seam-gate.mjs` only when the page is seekable and a ledger exists, else seam strips (`seam-gate.md` section 5); the contact sheet before render from the renderer's `--stills`; then every render gate of gate step D unchanged (`look.py`, `film_gate.py`, `motion_check.py`).

Rules and thresholds: C1 corner or edge micro-label (text <= 4% H in a corner zone x < .2 or > .8 and y < .14 or > .86, or a top, bottom or side strip); C2 tracked uppercase label (letter-spacing >= 0.05 em, <= 4.5% H); C3 chapter counter ("02 / SPEAK", "Chapter 3", bare "01"); C4 production metadata (BPM, FPS, timecodes, resolutions, versions); C5 mono micro-label (warning); C6 header or footer bar or left-right label row, judged on what the screen shows: a bar or hairline whose on-screen box (projected, clipped to the frame) spans most of the width in the top or bottom band, on a screen-aligned plane, fails when it holds text or controls and is a warning when empty; shapes and text on a tilted 3D plane (rotateX or rotateY on the element or an ancestor) are scene geometry, skipped and listed under the exemptions; C7 kicker above a headline >= 2x larger; D1 left-anchored headline block at x < 0.2 (fail with media on the right, a sub-line, a kicker or 2+ lines; warning alone); P1 a thin non-UI bar that grows over time; T1 letter-typed headline >= 5% H (fail) or a caret beside it (warning); V1 greeting header; V2 "label . value" line; V3 status dot (warning); V4 zinc-grey text (warning); V5 two or more of those inside one surface (fail).

Facts: every text size above (percent of H) is the drawn size, the CSS font-size times the projected scale of the text's box, so a word on a scaled or tilted 3D plane counts as small as it looks; hits print `fs` (drawn) and `fsCss` when a transform makes them differ. Each position rule is read at t and t + 0.1 s and counts only when the element is held; text inside a UI surface (a filled, rounded ancestor of at least 2.5% of the frame, or `[data-ui]`) is exempt from chrome rules but not from the vibe-coded UI rules; `[data-ui="captured"]` marks a faithful rebuild of a captured screen and skips V5. The lint cannot see text in canvas, WebGL, images or video: check the outer 12% band of every sheet frame by eye. A PASS is a floor, not taste.

There is no condition under which page chrome is acceptable: delete the element, never justify it (motionmaxxing). Scope note: the founder's product videos and talking-head layouts may carry product UI chips, buttons and captions that belong to the product; those live inside a UI surface and are exempt.

## 4b. Art check (code-drawn art)

Code-drawn objects, characters and scenes must clear the craft floor of the ice-styles skill, `references/code-illustration-craft.md`. The art check measures it; founder decision, 2026-10-22 (early runs drew flat single-colour objects with no shading, texture or detail).

```
node scripts/art-check.mjs <style-frame page or build page or .svg> [--times 0.5,2] [--json]
```

Where it runs: first at 05 on every style frame drawn in code (the page or SVG the frame was rendered from), the earliest stage whose material shows the art; again at 07 on the build page as the confirmation, at the times of the beats that show each hero object. A fail at 05 is cleared only by redrawn art re-checked (no paper patches); a fail first found at 07 is logged as a miss of 05.

Hero objects are the groups marked `data-art-hero="<role name>"`; with none marked, the top-level groups of each inline SVG covering at least 2 percent of the frame are picked and printed as auto. HTML and canvas art is never auto-picked: a page that draws objects (12 or more SVG shapes, filled HTML boxes without text, or a canvas of 2 percent of the frame) and marks no hero object fails (unmeasured is never n/a). A page with no drawn objects (footage, raster art, type only) is N/A; `<body data-art="none: <reason>">` declares that and is printed. Objects under 1 percent of the frame are skipped and judged by eye at thumbnail size. Each object is read at the sample where its box is largest.

| Measure per hero object | Pass when | Below it |
|---|---|---|
| Distinct fill tones (solid fills, gradient stops, HTML backgrounds; two tones are distinct when their RGB distance is over 18) | 3 or more (base, shadow, highlight) | FAIL |
| Shading | A gradient fill, an SVG lighting filter, a blend-mode layer, or two fills of one hue (within 25 degrees, or both near grey) whose lightness differs by 0.08 or more | FAIL |
| Shapes (path subpaths, SVG shapes, filled HTML boxes) | 24 or more | under 12 FAIL, 12 to 23 WARN |
| Texture or grain layer | A pattern fill, an feTurbulence filter, or an image, canvas, pattern or noise layer over the object | FAIL; `data-art-texture="none: <reason>"` on the object (a style that declares no texture, `code-illustration-craft.md` section 8) makes it a printed WARN |
| Shadow | A drop shadow (CSS, feDropShadow, an offset blur), a shape named shadow or occlusion, or a dark translucent shape under the object's base | FAIL; `data-art-shadow="none: <reason>"` makes it a printed WARN |

Exit 1 = any object fails, or drawn objects with no hero measured. The numbers feed the studio benchmark's craft axes (`studio-benchmark.md` section 4). A PASS is a floor: it proves the object has value, shadow, texture and detail, not that it is well drawn.

## 5. The contact sheet before render

| Film | Sample times | Source |
|---|---|---|
| Any multi-scene film | One frame per beat, inside the beat (60-70% into it, after entrances finish, before exits start), never at a boundary | product-launch-motion, hyperframes |
| Changed or rebuilt beat | Entry, payload, resolve (three stills) | product-launch-motion |
| Transitions | Each cut minus 0.1 s and plus 0.2 s; a continuing element keeps its promised position, scale, opacity and direction | hyperframes product-launch-video |
| Short film or loop | Frame 0, early reveal, midpoint, settle, last frame, loop seam, and the semantic beats | text-to-lottie (diffusionstudio) |
| Lottie or logo | t = 0, end of anticipation, mid-action, peak overshoot, settle, final, plus bracketing frames at every crossing, handoff and occluder entry or exit | pixel2motion logo pipeline |
| Opening | 0 s, 0.5 s, 1 s | imMamdouhaboammar (idea) |
| Long films | Every 0.5-1 s in batches of about 10 s | imMamdouhaboammar, PolyForm ideas |

How to look:
- Batch: one contact sheet beats many single images (cheaper and easier to compare); schedule visual checks at phase boundaries, not mid-build (hyperframes).
- Contact sheets find candidates; full-resolution stills decide scale, weight and legibility (two frames once judged "too small" on a sheet were 60% and 77% of the frame width). Build sheets with gutters between tiles (product-launch-motion, imMamdouhaboammar).
- Render one frame at 2x scale before trusting a still: a layer drawn through the wrong transform looks right at 1x and breaks at 2x (anidoodle).
- Judge each still like a viewer: is the text big enough, is anything cut off or on top of something else, is half the frame empty, does the sheet show something new every few seconds (explainroo).
- Pre-render stillness probe: render two frames 0.8 s apart at three points per shot; it agreed 98% with full-render freeze detection (PolyForm ideas, rewritten).
- Snapshots taken from one shared page do not re-roll grain: judge grain on a render (hyperframes-community-skills).
- Wall-clock screenshots of a running animation are not evidence; capture at exact seek times (pixel2motion).

## 6. Calibrate every gate

- A check is trusted only after it was seen failing on a reintroduced defect (delete a scene, misspell a transition, use a missing glyph, shift a caption by 0.3 s, leave a one-frame gap, drop a spoken word). Never tune a validator until the current output passes (huashu, herk-edit-kit, imMamdouhaboammar).
- "No findings" is read with how much was measured: an audit with nothing to measure passes vacuously; assert the hero element exists (non-zero box or pixel count) as well as its non-clipping (imMamdouhaboammar).
- A gate run that fails once then passes is a finding: report "could not reproduce, here is what I tried", never a quiet second run (anidoodle).
- When a different implementation uses another schema, export that schema or adapt the validator explicitly; never skip checks silently because the schema differs (herk-edit-kit).
