# Export Formats, Target Renderers and Developer Handoff

Written for Ice Motion Director. Facts merged from diffusionstudio/lottie (MIT:
playback snippets, starter canvas and frame defaults), nolangz/pixel2motion
(MIT: alpha video export settings), AbubakrChan/product-launch-motion (MIT:
lottie-web traps), heygen-com/hyperframes (Apache-2.0: Lottie seek rules), and
ideas from vibe-motion/skills (no license, restated: preview GIF weight).

## Contents

- Pick the format
- Canvas, frame rate, duration defaults
- Per-target renderer check
- Lottie inside a rendered film
- Previews: GIF, MP4, transparent video
- File weight
- Handoff package
- Handoff note template

## Pick the format

| Deliverable | Format | When |
|---|---|---|
| App or site animation played by a runtime | Lottie JSON (`.json`) | default for icons, loaders, state feedback, micro-interactions, lower thirds, logo loops |
| Same, with images or fonts bundled | dotLottie (`.lottie`, a zip of JSON plus assets) | only when the target player supports it; confirm with the developer |
| Logo or icon that must run with no runtime | Animated SVG with CSS keyframes, or the showcase HTML | web only; `logo-pipeline.md` route |
| Motion that lives in product code | Motion tokens (CSS, TS, Dart, Swift, Kotlin, JSON) | `ui-motion-tokens.md`; the asset and the code share one token set |
| Review, social or docs preview | MP4, GIF or WebP, plus transparent video when needed | never the shipped asset; a preview of it |
| Hand-built in After Effects later | Lottie JSON imports into After Effects for refinement | say so in the handoff |

Rive files are authored in a GUI only: an agent cannot author one. If the user
needs Rive, deliver the design spec and timing table, not a `.riv`.

## Canvas, frame rate, duration defaults

| Kind | Canvas | Frame rate | Duration |
|---|---|---|---|
| Icon, logo mark, loader | 512x512, or the source SVG viewBox | 60 fps | compact: 60 to 120 frames |
| Broadcast, title, promo scene | 1920x1080, or the aspect the brief names | 60 fps for UI playback | 120 to 180 frames |
| Lottie placed inside a rendered film | the film's canvas region | the film's fps (often 30); do not mix rates | the beat's length |

Size the composition to the slot it fills: the developer scales a 512 asset
down cleanly, while thin strokes vanish below about 1 px at display size, so
check the asset at its smallest real display size.

## Per-target renderer check

Verify in the renderer that will play the file, then in Skottie as reference
when available. Inspect frame 0, midpoint, the settle frame, `op - 1`, the loop
seam, and every semantic beat.

| Target | Runtime | Load call (shape only) | Known risks |
|---|---|---|---|
| Web | lottie-web | `loadAnimation({ container, renderer: "svg", loop, autoplay, path or animationData })` | animated multi-dimensional layer transform can blank a layer; masks, mattes, blend modes and gradients differ; expressions only partly supported |
| React Native | React Native Skia Skottie | `Skia.Skottie.Make(json)` | Skottie is the reference here |
| iOS | lottie-ios | `LottieAnimationView` | test text, mattes and gradients on device |
| Android | lottie-android | `LottieAnimationView` | test text and mattes on device |
| Flutter | `lottie` package | `Lottie.asset(path)` | test text and mattes on device |

Rules for every target:
- Bake counters, particles, orbit math, physics and expression-like systems to
  keyframes. Treat blur, bloom, glass, chrome, dither, true 3D and displacement
  as renderer-risky; approximate with vector shapes or ship a raster asset.
- Native text needs the font shipped with the file and `fFamily` equal to the
  embedded family name, or text renders blank. For Arabic or mixed-direction
  text, verify shaping and joining in each target renderer; if any target
  breaks it, convert that text to shapes from a correct shaping render and keep
  the editable string in the handoff note (see the ice-arabic skill).
- Reduced motion: hand over the settled frame number (or a static SVG) to show
  instead of playing.

## Lottie inside a rendered film

Embedding a Lottie in a HyperFrames, Remotion or HTML-capture film is an engine
concern: see the ice-engines skill (Lottie guide). Authoring rules that stay
here: keep assets local (no remote `path`), set `loop` explicitly (some runtimes
treat a missing `loop` as true), bake any non-default speed into the keyframes
(seek-driven renderers do not scale playback rate), put beat times in Lottie
`markers` so the film can read them, and author a character's whole performance
as one Lottie rather than relying on per-animation start offsets. Never ship a
character or animation taken from a site without a license.

## Previews: GIF, MP4, transparent video

Capture frames deterministically (pinned frames or `?t=<ms>` seeks), never by
recording a running animation. Encode settings: the `ice-engines` skill,
`references/render-export.md` section 2 (opaque MP4 by purpose), section 5
(transparent WebM and ProRes 4444 MOV, alpha checks) and section 6 (GIF).

Keep README and docs previews small: under 1 MB, ideally about 250 KB. Cut
size first by frame rate, dimensions and palette, never by duration, the loop
flag or the legibility of key text: the loop, the key text and the subject
stay legible. Previews of a transparent asset show it on both a light
and a dark ground.

## File weight

Lottie weight drives load time and memory on weak phones. There is no universal
limit; agree a budget with the developer and record the measured numbers.

- Report raw and gzip size of the JSON, layer count, keyframe count and any
  embedded image size.
- Reduce before shipping: round coordinates and values to 2 or 3 decimals,
  delete hidden or unused layers and assets, avoid base64 rasters inside the
  JSON (ship them beside it), reuse precomps, prefer trim paths and transforms
  over many baked path keyframes, and bake only what the renderer needs.
- Dense fields (repeaters, particles) are capped and profiled on the slowest
  target device.

## Handoff package

| File | Contents |
|---|---|
| The asset | `.json` (or `.lottie`, animated `.svg`, showcase `.html`) plus fonts and images it needs |
| Static fallback | settled frame as SVG or PNG for reduced motion and first paint |
| Previews | MP4 or GIF, and transparent video when the asset sits over content |
| Tokens | the generated token files when motion also runs in product code |
| Handoff note | the template below |

## Handoff note template

```markdown
# <asset name> motion handoff
- Purpose: <feedback | orientation | continuity | delight>, trigger: <event>
- Canvas: <w>x<h>, fr: <fps>, ip/op: <ip>/<op> (op exclusive), loop: <yes/no>, seam frame: <n or none>
- Settled frame for reduced motion and static use: <n>
- Segments or markers: <name: start-end frames>
- Slots/controls exposed: <sid: type, purpose>
- Fonts: <family, file, license>; text converted to shapes: <yes/no, why>
- Target renderers verified: <runtime + version: result>
- Weight: raw <kb>, gzip <kb>, layers <n>, embedded images <kb>
- Direction: <LTR/RTL/both>; mirrored parts: <list>; never-mirrored parts: <list>
- Tokens used: <preset id or custom file>, curves: <names>
- Known residuals: <list or none>
```


## HTML Delivery Template

> Adapted from nolangz/pixel2motion (MIT, Copyright (c) 2026 Nolan Lai). Changes: removed the reference to an upstream sample file; replaced dash characters.


Use this contract for the final `logo_motion.html`: one HTML file that presents the main logo animation, small atomic motion studies, and live playback controls. `scripts/animate_svg_showcase.py` builds this shell; its page colors are neutral viewer chrome, not the logo's palette.

### Required Page Structure

- Hero stage: a centered primary SVG animation in `#logo-root`; this is the element captured by QA tooling. User-facing motion templates should display the main logo at 0.7x of the SVG's intrinsic width, still capped by the viewport.
- Atomic motions row: three or four small variants derived from the same `logo.svg`, such as hover, pulse, arc/spin, and press/squash. These are motion atoms, not unrelated decoration.
- Controls: replay button, slow-motion toggle, and speed range slider. The speed slider must affect the live main animation, not only the next replay.
- Principles strip: compact pills for the Disney principles used by the choreography; highlight active principles during the run when using a JS timeline.
- Footer/help text may be minimal, but do not use explanatory marketing copy.

### Main Animation

- Prefer an act/phase timeline for logo reveals: staging hold, anticipation, action, overlap/follow-through, final settle.
- Use explicit SVG transform pivots for complex marks. A helper like `T(px, py, {x, y, sx, sy, rot})` is safer than relying on CSS `transform-origin` when SVG bounding boxes are awkward.
- Store the finished logo state in a `setFinalLogo()` function or equivalent. Reduced motion and `?static=1` must land there.
- CSS keyframe animations must use `animation-fill-mode: both` or `forwards` so `?t=<ms>` and `?static=1` can expose real timeline states.
- Keep `window.__p2mReady = true` only after the animation is rendered, seeked, or static-finalized.

### Atomic Motions

- Build atoms from the same semantic parts used by the main SVG (`#mark`, `#dot`, `#wordmark`, letters, accents).
- Each atom should isolate one principle or interaction: hover appeal, ambient pulse, arc/spin, press squash, draw-on, or letter cascade.
- Atomic variants must be interactive or visibly moving, but they must not distract from the hero animation.
- If a generic script clone cannot safely preserve unique IDs, use a data-URI image fallback for atomic thumbnails and hand-author semantic atomic variants when the user expects production polish.

### Tuners

- Replay restarts the main animation deterministically.
- Slow motion toggles to a readable default around 0.25x.
- Speed slider default should be slow enough to inspect the principles, often around 0.4x to 0.6x for showcase delivery.
- Playback-rate changes should apply to currently running animations.

### QA Hooks

- `?t=<ms>` pauses the main animation at an exact timestamp for frame capture.
- `?static=1` shows the final static logo.
- In QA/chromeless mode, hide controls and atomic variants if needed, but keep `#logo-root` available for screenshots.
- `prefers-reduced-motion: reduce` must show the finished static logo immediately.
- The `?t=` hook also powers quantitative QA: `scripts/probe_motion_continuity.py` reads computed styles at seeked timestamps (catches silently-dropped keyframe easings, see the literal-easing rule) and sweeps ink-pixel deltas across risk windows (catches handoff stalls/pops invisible in coarse frame strips).
- The decisive Final Frame Contract check is SAME-pipeline: capture `?static=1` and `?t=<end>` with the same tool/viewport/DPR and require an exact 0 diff; cross-pipeline diffs against the Phase 2 render contain resampling noise and are confirmed visually.
