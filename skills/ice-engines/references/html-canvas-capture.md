# HTML canvas with Playwright and FFmpeg

> Merged from MIT sources: Vincentwei1021/mg-styles-15, howseen-ai/claude-motion-design, AbubakrChan/product-launch-motion, Barty-Bart/motion-graphics, lemomo-ai/lemo-opuscar, alexgreensh/anidoodle (Apache-2.0), edenfunf/reelmimic, iart-ai/motion-skills; ideas from imMamdouhaboammar/motion-graphics-skills (rewritten). Changes: merged, reworded, dashes removed.

One HTML page draws any time `t` on request; a headless Chromium seeks it frame by frame; FFmpeg encodes. The bundled renderer is `scripts/render-html.mjs`.

## 1. Setup (user prerequisites, in the film project)

| Item | Exact requirement |
|---|---|
| Node.js | The minimum in `versions.json` (`runtimes.node`) |
| FFmpeg, ffprobe | On PATH, at or above the minimum in `versions.json` (`runtimes.ffmpeg`) |
| Browser | An installed Chrome, Chromium or Edge, found in the usual install folders, or `ICE_CHROME=<path>` (per-OS syntax: `engine-choice.md` section 7.2). Only when none exists: install the driver below, then `npx playwright-core install chromium` (runs the project's pinned copy; an install without a question, recorded: `engine-choice.md` section 7.6) |
| Driver | None needed: the renderer carries a built-in Chrome DevTools driver. Optional, installed without a question when needed (`engine-choice.md` section 7.6): `npm install --save-exact playwright-core@<npm.playwright-core>` in the film project (exact version in `versions.json`); `ICE_DRIVER=cdp` forces the built-in driver |
| Libraries the page loads | Exact versions vendored into the project or pinned CDN URLs (GSAP, three, p5, p5.brush at their exact versions in `versions.json`); never `@latest`, which is mutable |

Probe the environment once at intake with the check order in `engine-choice.md` section 7.2, plus fonts present. The renderer's first four log lines name the served folder, the driver and browser path, the compositing mode and the browser version: log them with the film (pixels can drift across browser versions and compositing modes).

## 2. Page contract

```js
window.DEMO = { width, height, fps, duration };   // optional defaults for the renderer
window.renderAt = async (t) => { /* draw time t in seconds; no other clock */ };  // window.seek is also accepted
window.__ready = true;                             // only after fonts, images and data are ready
```

- Everything is computed from `t` inside `renderAt`: no CSS transitions, no timers, no state between frames. Declare all constants before the first call.
- Set the ready flag after every font face is loaded (`document.fonts.load` per face, then `document.fonts.ready`) and every image is decoded.
- Give every layer an explicit `z-index`; children of hidden parents use `visibility: inherit`, not `visible`.
- Call every element every frame and control its life with timing values; an element drawn only under a condition (`if (t > 3)`) is a common blank-frame bug.
- Camera: one transform on a container; the camera is applied before other elements; arrows or links cannot target an element drawn later.
- Blur once and reuse: a blur filter recomputed on every frame makes rendering slow. Draw big glows and gradients onto a canvas or image once at load and move that.
- Write scenes against a layout function, then render each aspect ratio from the same timeline, re-laying out type and UI per format (never crop). See `platform-specs.md`.
- Preview mode: the page plays on its own clock only in preview (rAF allowed there), with controls (Space play and pause, arrow keys one frame, R replay, a time readout, a `?t=<seconds>` deep link). A render query flag (`?render`) removes controls and preview scaling so the stage is exactly `width x height` at the top left.
- Preview stage scaling: fixed-size stage scaled with `transform: scale(min(innerWidth / W, innerHeight / H))`; the composition never changes with window size. Do not center with grid `place-items: center` (the cell grows to the raw stage height and crops).

## 3. Running the bundled renderer

```
node <skill>/scripts/render-html.mjs <page.html> --stills <t1,t2,...>                 # proof stills
node <skill>/scripts/render-html.mjs <page.html> --scale 0.5 --fps 30 --crf 23 --out <draft.mp4>   # review draft
node <skill>/scripts/render-html.mjs <page.html> --mb <N> --cuts <c1,c2> --workers <W> --audio <master.wav>  # final
node <skill>/scripts/render-html.mjs <page.html> --alpha --out <overlay.mov|overlay.webm>             # alpha for editors
```

Run it from the film project (so `playwright-core` resolves when the project installed it).

Served folder: the page may load only files inside the folder the renderer serves. Default: the nearest folder at most 4 levels above the page that holds `ice/` (the project folder, so a page in `film/` reaches `assets/`), else the page's own folder; the first log line names it. A project without `ice/` whose page loads files from a sibling folder needs `--root <project folder>`. Never pass a folder above the project. A file the page asks for that the server cannot give (outside the served folder, or missing) is logged as `[missing file]` with where it actually exists, and when the page then never sets its ready flag the render stops within seconds with the `--root` fix; a page error before ready and a `renderAt` that never resolves (`ICE_SEEK_TIMEOUT`) also stop it with a plain message.

Compositing: software by default, so every frame is the same whatever was rendered before it (`determinism.md` section 6). `--gpu` (or `ICE_GPU=1`) opts in to GPU compositing for drafts only; never for stills compared with a final, finals or frame-difference gates.

It serves the folder over HTTP with `Cache-Control: no-store` (Python's `http.server` keeps old modules cached: "you will chase ghosts"), waits for readiness and fonts, freezes CSS transitions, pauses Web Animations, waits two animation frames after every seek, fails on page errors, refuses odd output sizes, holds a machine-wide render slot (`ICE_RENDER_SLOTS`, default 1), writes lossless FFV1 segments per worker, then encodes H.264 High, BT.709 TV range, `+faststart`; audio is padded with `apad` and cut with `-shortest` so the picture defines the length.

## 4. Draft then final

| Pass | Settings | Purpose |
|---|---|---|
| Stills | One frame per beat plus transitions at plus and minus 0.1 s | Composition, readability, overlaps; look at them, fix, only then render |
| Draft | 30 fps, 1 capture per frame, 960x540 (`--scale 0.5`), CRF 23 | Judge rhythm, not sharpness; still frames alone cannot prove timing |
| Final | Target fps, subframe motion blur, CRF by purpose | Delivery |

Tell the user the expected render time before a long final: about 1 to 1.5 min of wall time per film second at 8 subframes; motion blur multiplies render time by the subframe count.

## 5. Subframe motion blur (scoped)

| Rule | Source position | Scope |
|---|---|---|
| Subframes spread over half the frame interval (`--shutter 0.5`, a 180 degree film shutter); 1.0 smears | Most sources | Default |
| 4 subframes show ghosting or double outlines on fast moves; 8 is the floor for finals | howseen, motionmaxxing | Finals with fast moves |
| 4 subframes at 60 fps | product-launch v2, recipe notes | Drafts, or moderate motion at 60 fps |
| Adaptive count: still 1; up to 20 px of travel per frame 4; above that `ceil(px / 5)` up to 64 (or subframes at most 3 px apart, up to 32) | howseen, anidoodle | When per-shot speed is known |
| Centered shutter needs every subframe clamped to the frame centre's side of a hard cut (`--cuts`) | mg-styles, howseen | Centered shutter (bundled renderer) |
| A shutter that opens at the frame time and closes before the next frame never ghosts across a cut | motionmaxxing | Alternative renderers |

Never blur across a hard cut; never blur text meant to be read at that moment; blur targeted slams (1 to 3 per film) instead of the whole frame; stepped or on-twos art is never blurred; never stack real blur on fake smear copies. Counters and typed text read the frame time, not the subframe time. Average subframes in linear light where the renderer supports it. Motion blur craft (which beats deserve it): the ice-motion skill.

## 6. Speed and scale

- One browser per worker: pages inside one browser share a compositor and do not parallelize. Parallel per-shot segments measured 1.3 to 1.8x faster than one process.
- Films longer than about 25 s: render in about 3 parallel chunks; on small servers render 4 s chunks and delete PNGs as you go; concatenate segments with the concat demuxer and `-c copy` (segments come from one renderer with identical settings, so copy is safe).
- JPEG quality 95 intermediates are faster (PSNR about 47.9 dB vs PNG); keep PNG or lossless for dark gradient films. Grain is cheaper added in FFmpeg than captured.
- Aim for at most about 250 ms per frame at 1920x1080 (painted engines up to 2.5 s); cache static textures at setup.
- Windows: if navigation times out under load (font loading), drop to 3 workers and rerun; the bundled renderer can resume a range with `--from`/`--to`.
- WebGL in headless: WebGL stays on the GPU under the default software compositing; extra Chromium flags via `ICE_GPU_ARGS` (added last); without a GPU set `ICE_WEBGL_SOFTWARE=1` (SwiftShader), otherwise headless WebGL renders black. Pin one mode for the whole film.
- Software compositing costs about 10 to 30 percent per frame against `--gpu` on the machine measured (`render-performance.md` section 5); include it in render time estimates rather than switching finals to `--gpu`.
- Machine hygiene: one heavy render at a time machine-wide; no parallel transcription or heavy FFmpeg during a render; kill only processes you started (never a broad `pkill` pattern, which once killed its own shell); keep the current and previous render only.

## 7. Single-file HTML deliverables (when the deliverable is the page itself)

- Must open by double click over `file://`: CSS and JS inline (a local `<script type="module" src>` is blocked on `file://`), libraries from a pinned CDN or inlined, assets relative in the same folder, no `fetch()` of local files. Ensure inlined JS contains no `</script>`. Delete source folders afterwards so there are not two truths.
- Autoplays, loops; hidden keys only (R replay, Space pause); a scrub panel only with `?debug=1`; `?clean=1` holds autoplay for export.
- Never make a deliverable that needs `npm install` to be watched.
- Export an MP4 only when asked; never screen-record a final (it drops frames).

## 8. Remake and analysis helpers

Frame-locked remakes of a reference (frame-accurate keyframe tables, measured per-frame arrays, split-screen comparison) belong to the ice-remake skill; they use this same page contract and renderer.
