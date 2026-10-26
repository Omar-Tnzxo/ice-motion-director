# Determinism (every engine)

The one law: every frame is a pure function of its time value. Same input time, same pixels, whether the renderer plays forward, jumps backward, or starts in the middle in a parallel worker.

## 1. Banned in render code (all engines)

| Banned | Use instead |
|---|---|
| `Date.now()`, `performance.now()`, system timers, `setTimeout`, `setInterval` | Time passed in by the engine (`t`, `useCurrentFrame()`, `tl.time()`) |
| `requestAnimationFrame` loops, `setAnimationLoop`, R3F `useFrame`, autonomous shader time | Render from the engine's seek event; rAF only inside a preview-only branch |
| Unseeded `Math.random()`, `gsap.utils.random`, `stagger: { from: "random" }`, Remotion `random(null)` | Seeded PRNG (mulberry32) seeded from stable data; index-derived scatter (golden angle `Math.PI * (3 - Math.sqrt(5))`); `from: "start"`, `"center"`, `"end"` |
| CSS `transition`, infinite `@keyframes`, Tailwind `animate-*` / `transition-*` classes | Engine-driven tweens; finite keyframes seeked by the engine |
| Hover, scroll, pointer, focus, input state | Authored states on the timeline |
| Network fetches during render, remote asset URLs, signed or expiring URLs, `file://` pages | Copy every asset into the project before frame 0; serve over HTTP |
| State carried from the previous frame (physics integration, accumulating values, post passes reading previous frames) | Closed-form or precomputed physics; keyframe tables; derive from `t` only |
| Two tweens or timelines writing the same property of the same element at the same time | Put one on a parent wrapper |
| Infinite repeats | Finite count: `repeat: Math.max(0, Math.floor(duration / cycle) - 1)` (floor, never ceil) |
| Changing a resource URL during capture (swapping `img.src` or `background-image` per frame) | Preload every variant as its own layer; switch by opacity, transform or clip |

Infinite repeat is scoped: the HyperFrames runtime tolerates `repeat: -1` under a finite root `data-duration`, but several production sources saw captures stall with it. Default in every engine: the finite formula above.

## 2. Readiness and fonts

- One readiness promise gates the first frame: all font weights requested, `document.fonts.ready`, every image decoded, data loaded. Every tool awaits it.
- `document.fonts.ready` waits only for faces already requested; it does not request an unused face. Call `document.fonts.load("<weight> <size> <family>")` for every face before measuring text.
- Measure text after fonts are ready, with the same font properties used to render. A late font shifts every measured position.
- The readiness promise resolves to a plain, non-thenable value. Returning a GSAP timeline (a thenable) deadlocks it forever. Diagnostics also return plain JSON.
- Readiness rejects with the failing asset path; swallowing decode errors renders blanks.
- Every tool that awaits readiness races it against a timeout (about 20 s) and reports that readiness never settled.
- Fonts are local files with `@font-face`, never a system font name: headless Chrome renders `-apple-system` as Times. This holds for every source in the font order (user or project fonts first, then system fonts and Google Fonts chosen by fit, owned by the ice-direction skill, `references/type-pairing.md` section 1): a chosen system or Google Fonts family is copied or downloaded into the project first. For single-file deliverables inline fonts as base64 `@font-face`.
- Every option and lookup has a default path; a preview flag must never crash a render.

## 3. Seek mechanics (browser capture)

- After every seek, wait two animation frames before capturing so layout and paint of the seeked state land. (Bundled `scripts/render-html.mjs` does this.)
- Pause every Web Animation and set its `currentTime` to `t * 1000` on each seek; kill CSS transitions with an injected `transition: none !important` rule.
- GSAP direct seek on a page you own: `tl.pause(); tl.totalTime(t + 0.001, true); tl.totalTime(t, true)`. WAAPI: pause and set `currentTime`. Lottie: `goToAndStop(frame, true)`.
- `requestAnimationFrame` does not fire while `document.visibilityState` is hidden: paint one frame synchronously at init.
- Video inside a page: re-encode all-intra (`-g 1`), load as a blob URL, await `seeked`; if `seeked` is flaky, pre-extract frames with FFmpeg and draw images.
- Canvas pixel reads: create the context with `willReadFrequently: true` so repeated seeks draw identical pixels.
- Deterministic Chromium flags: `--deterministic-mode --run-all-compositor-stages-before-draw --disable-threaded-animation --disable-checker-imaging --font-render-hinting=none --force-color-profile=srgb`, plus `--disable-gpu-compositing` (section 6).

## 4. Frame and time arithmetic

- `time = floor(frame) / fps`. Real time is never consulted. Fixed `fps`, `width`, `height` before frame 0; finite length.
- Frame ranges: inclusive start, exclusive end (frames 240 to 360 at 30 fps = seconds 8 to 12). For rational rates (30000/1001) compute from numerator and denominator; never round the rate.
- A visibility window is half-open `[start, start + duration)`. Land an animation's end state slightly before the clip end, not on it, or its last frame never renders. A tween ending between frame samples never shows its final state: end it on a frame boundary.
- Steep-tail eases (`expo.in`, `power4.in`) alias at sub-frame boundaries; snap tween end times to multiples of 1/fps.
- Three time bases (absolute, shot-local, sequence-local including lead-in) are converted in one helper only. Absolute seconds appear as named constants, never as literals inside function calls, so retiming tools can find them.
- Use a large finite number for "never" sentinels, not `Infinity`, or interpolation throws on frame one.
- Keyframe helpers return the first value before the first key: start entrance tables at the shot start with the off-screen value.
- Duration has one owner (the composition). Render range and mux derive from it. Hold frames repeat the last composed frame (clamp time, grain included).

## 5. Layout and transforms

- Animate transforms and opacity for movement. Never tween `width`, `height`, `top`, `left`, `margin`, `padding`, `fontSize`, `letterSpacing`, `roundProps` for motion: the compositor snaps them to whole device pixels and slow tweens stutter. `fontSize` becomes `scale`; letter spacing becomes per-glyph `x`. `filter`, `clipPath`, `strokeDashoffset` and CSS variables are legitimate targets. Exception: HTML-in-canvas `layoutsubtree` elements.
- Pre-calculate layout constants; never read `getBoundingClientRect()` at tween time when the renderer samples in parallel.
- Never put `will-change` on anything the camera scales (text renders blurry); in some engines it also broke seek determinism. Use it only on elements that actually animate.
- `transform` on an inline `<span>` is a no-op and scaling a zero-width element shows nothing: make transformed elements block-level and sized.
- Freeze `devicePixelRatio` at load; pin renderer size and pixel ratio for canvases.
- An element with a CSS blur that is translated far off screen once painted the whole frame black: hide anything that has left the frame.
- Never combine blur and opacity in one tween on one element (headless compositing bug); never blur a `<video>` directly.

## 6. Parallel workers and reproducibility

- Parallel workers are separate browsers and are not bit-identical to each other. For bit-exact output use one worker and compare lossless frames, not the encoded MP4.
- Multi-tab concurrency inside one segment causes periodic phase jitter: one browser per worker.
- Pin one GPU mode for a whole film: GPU and SwiftShader WebGL differ by about 38 dB PSNR.
- Composite in software. With GPU compositing Chrome keeps promoted layers (3D planes, `will-change` images) between seeks, so a frame's pixels depend on which frames were drawn before it in the same page and can change from run to run: in a pilot run a 2.5D CSS film missed a zero-difference frame check by up to 28 of 255 on logo edges. `--disable-gpu-compositing` made every frame exact. The bundled `scripts/render-html.mjs` uses it by default; it leaves WebGL on the GPU (`--disable-gpu` would also move WebGL to a software adapter, slower and with different pixels). Speed cost: `render-performance.md` section 5.
- GPU compositing (`render-html.mjs --gpu` or `ICE_GPU=1`) is an opt-in for speed only. Warning: never use it for stills that are compared with a final, for finals, for parallel segments of one film or for any frame-difference gate; log the mode with the film, and never mix modes inside one film.
- Prove determinism: render the same frame twice and compare hashes; seek forward, backward and randomly and compare. With the bundled renderer: `--stills <t>` and then `--stills <other times>,<t>`, and compare the two PNG files of `<t>` byte for byte (copy the first file away before the second run, which writes the same name). A difference with software compositing is state carried inside the page (section 1), not the renderer.
- Docker with pinned Chromium, fonts and FFmpeg gives exact reproducibility across machines.
