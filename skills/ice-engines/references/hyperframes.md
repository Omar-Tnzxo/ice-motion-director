# HyperFrames guide

> Rules adapted from heygen-com/hyperframes skills and docs (Apache-2.0, (c) 2026 HeyGen, Inc.). Changes: merged, deduplicated, reorganized; dashes replaced; HeyGen cloud, telemetry and runtime skill downloads removed.

Contents: 1 Setup. 2 Project structure. 3 Composition contract. 4 Data attributes. 5 GSAP timeline rules and pitfalls. 6 Sub-compositions. 7 Media and audio. 8 Runtime adapters. 9 Registry. 10 Tailwind. 11 Variables. 12 Engine-scoped conflicts. CLI, render and QA flags: `hyperframes-cli.md`. Lint codes: `hyperframes-lint-catalog.md`.

## 1. Setup (user prerequisites)

| Item | Exact requirement |
|---|---|
| Node.js | The minimum in `versions.json` (`runtimes.node`) |
| FFmpeg and ffprobe | The minimum in `versions.json` (`runtimes.ffmpeg`), on PATH, or `HYPERFRAMES_FFMPEG_PATH` / `HYPERFRAMES_FFPROBE_PATH` |
| HyperFrames CLI | Installed in the film project as a pinned dev dependency: `npm install --save-dev --save-exact hyperframes@0.8.174` (the exact version in `versions.json`, `npm.hyperframes`; this command and that file change together). Then every command is `npx hyperframes <cmd>` and resolves locally. If the project already pins another version, keep that version |
| Chrome | `npx hyperframes browser ensure` installs the pinned build (pixel output drifts across Chrome versions). The user runs or approves this download |
| Telemetry | Set `HYPERFRAMES_NO_TELEMETRY=1` (or `DO_NOT_TRACK=1`) in the shell before commands |

Never run `npx hyperframes skills update`, `npx skills add` or any command that downloads skills or instructions at runtime. Never run `events` (telemetry emitter) or the deprecated `validate`, `inspect`, `layout` commands. `feedback --file-issue` only with the user's consent. Never `hyperframes init` in the workspace root; never delete `.hyperframes/` wholesale (it holds project history; use `hyperframes clean --dry-run`). Name projects in kebab case from the brand or topic, never from the workspace name or a timestamp. Run every command inside the project folder in a subshell.

Pinned libraries loaded by compositions (load from a pinned CDN URL or vendor into `assets/` for offline renders, never `@latest`): GSAP, three (or the version the project pins), Anime.js, lottie-web, `@tailwindcss/browser` and maplibre-gl, each at its exact version in `versions.json` (`npm`).

## 2. Project structure

```
<project>/
  index.html               root composition: thin; timed hosts, media, audio, a near-empty root timeline
  compositions/<scene>.html one sub-composition per scene with nested structure
  compositions/components/  installed registry components
  assets/                   fonts, images, video, audio (all local)
  hyperframes.json          project config, path remaps
  *.motion.json             optional motion assertions for `check`
```

- Monolithic (one file) is fine for up to about 6 short scenes; above that, modular with one sub-composition per scene.
- The root holds only timed hosts, media and audio. Any scene with nested structure is its own file.
- Tracks: visual scenes on one `data-track-index` (for example 1), captions on their own single track (`data-track-kind="captions"`), audio on higher tracks well above visual ones. One element kind per track. Two clips on the same track must not overlap in time. Tracks are Studio lanes, not layers: paint order is CSS `z-index`; the render ignores track index.
- Paths resolve from the project root, never `../compositions/x.html`. Paths built in scripts are plain strings and are not rebased: wrap them in `window.__hyperframes.assetUrl("assets/...")`.
- Keep every `id` unique across the assembled page: prefix sub-composition ids with the composition id. Ids must not start with a digit.

## 3. Composition contract

- The root element carries `data-composition-id`, `data-width`, `data-height` (static HTML attributes; common values 1920x1080, 1080x1920, 1080x1080) and `data-duration`. Defaults: 30 fps (`data-fps` is an optional hint).
- `data-duration` on the root is the render length. It is read once at compile time; a script or a `--variables` value cannot change it. A timeline that runs past it is cut off; one that ends early holds its last frame. Required for Three.js and for any infinite CSS or WAAPI animation.
- Exactly one `gsap.timeline({ paused: true })` per composition, registered on `window.__timelines["<composition-id>"]` with the exact id, after all tweens are built. With two or more registered, a mismatched key freezes the render at t = 0.
- A composition that registers no timeline must carry `data-no-timeline`, or every render waits out the 45 s ready timeout.
- `data-start` makes an element a clip. Give visible timed divs `class="clip"` (convention, keep writing it); omit `class="clip"` on `<video>` and `<audio>`. The runtime hides clips outside their window: never add a scene-exit `tl.set(..., {visibility: "hidden"})`, never tween a `.clip` element's `autoAlpha` or `visibility` (animate a child), never use a script to show, hide, play, pause or seek by time.
- Root sizing: author `width: 100%; height: 100%` on the standalone root, never hard-coded 1920px or 1080px. Scene containers `width: 100%; height: 100%; box-sizing: border-box`.
- Build the visible end state in static HTML and CSS first, then animate from and to it. Use `position: absolute` for layers and decoratives, not as the default layout strategy. Center with flex or `inset`, not `translate(-50%, -50%)` on a node GSAP moves (use `xPercent`/`yPercent`).
- Root clips get automatic layout; untimed full-bleed backgrounds need their own `position: absolute; inset: 0` or they collapse to zero height.
- Ground and white flash: give `#root` an opaque background (`#root { background: var(--canvas-deep, var(--canvas, #000)) }`) or every seam composites over the default white page. On the layered-composite path (HDR content or shader transitions) the root fill is dropped, so also put the visible ground on a full-bleed child (`position: absolute; inset: 0`). For alpha output, leave both unpainted.
- `data-hidden` hides an element in both preview and render.
- Text: no `<br>` in body text (forced breaks ignore real font width; exception: short display titles with one word per line). Size dynamic text with `window.__hyperframes.fitTextFontSize(text, { maxWidth, fontFamily, fontWeight })`; measure with `window.__hyperframes.pretext`.
- Pulsing or overshooting absolute decoratives need clearance at their peak size: position for the largest frame.
- 3D tilt without a perspective parent: GSAP `transformPerspective` on the element.
- Editing an existing project: read the files first; preserve unrelated timing, tracks, ids, variables and media paths. Use `hyperframes history begin --who <agent> --label <change>` before edits and `history end` after; build on the user's edits, never overwrite them; on failure `history undo --who`.

## 4. Data attributes (quick table)

| Attribute | Meaning |
|---|---|
| `data-start` | Clip start in seconds, local to its composition. Relative form `"intro + 0.5"` (spaces required); unresolved reference resolves to 0; no cycles; keep chains under 3 to 4 levels and snapshot to confirm |
| `data-duration` | Required for DOM and nested composition clips; image default 3 s; video and audio default to source length |
| `data-track-index` | Studio lane only |
| `data-media-start` | Trim offset into the source |
| `data-playback-rate` | 0.1 to 10; a `rate` lane in `data-automation` overrides it; consumed source = timeline duration x rate |
| `data-volume` | 1 = 0 dB, 0 = silence, up to 3.98 (+12 dB) |
| `data-fade-in` / `data-fade-out` | Linear, anchored to the clip edges |
| `data-has-audio` | Video whose sound is used (no `muted`); silent footage uses `muted` instead; a video with neither fails lint |
| `data-automation` | Volume and rate lanes; `t` is clip-local seconds; a lane holds its first value backwards |
| `data-fx-chain`, `data-fx-carve`, `data-audio-group` | Audio effects, voiceover carve, buses (mix decisions belong to the ice-audio skill) |
| `data-composition-src` | Host slot that loads a sub-composition |
| `data-composition-variables` | Variable declarations (section 11) |
| `data-link`, `data-sync-origin` | Linked clips keep equal start, duration, media start and rate |
| `data-no-timeline` | Intended still composition |
| `data-layout-allow-overflow` / `-overlap` / `-occlusion` / `-caption-zone`, `data-layout-bleed`, `data-layout-ignore` | Narrow `check` escape hatches; mark the specific participant, never a scene or root wrapper |
| Legacy | `data-layer` becomes `data-track-index`; `data-end` becomes `data-duration` (both are lint errors). The ice-qa richness mark is `data-ice-layer`, which HyperFrames ignores |

## 5. GSAP timeline rules and pitfalls

1. Create with `{ paused: true }`; register on `window.__timelines` at the end of the build, never before (an empty timeline registered early renders blank: lint `gsap_timeline_registered_before_async_build`). Construct synchronously at page load; if the build must await fonts (`document.fonts.load`), register at the end of that callback.
2. Never call `tl.play()`; the engine seeks. Do not pad with empty tweens (`tl.set({}, {}, 283)`); set `data-duration` instead.
3. Give important tweens an explicit absolute position (the last argument). Prefer the position parameter over `delay`; use labels for semantic states.
4. Prefer `fromTo()` over `from()`: `from()` records its start at registration and desyncs on seek-back. Add `immediateRender: false` to every later `fromTo` or `from` touching the same property. A `fromTo` shows its from-state before it starts: hide parked elements or use `to()` plus `keyframes` or a zero-duration `tl.set` at the beat boundary.
5. A zero-duration `set` at position 0 does not render while the playhead sits exactly at 0: author the initial state in CSS.
6. Never write `tl.set(el, {opacity: 0}, 0)` after a `fromTo` on the same element at the same time: on a direct seek the later set wins and a parallel worker renders the scene blank.
7. Absolute values only, never relative `+=` tweens. Keep each tween's whole active span (including `repeat`, `yoyo` doubling, `repeatDelay`, stagger spread) inside its scene window.
8. No template literals in selectors; hard-coded strings. No `svgOrigin` together with `transformOrigin` on one SVG element.
9. `autoAlpha` only on non-clip elements or wrappers; never duration-tween `display` or raw `visibility`.
10. Counters: tween a proxy object or `innerText` with `snap: { innerText: 1 }`, `font-variant-numeric: tabular-nums`, grow with `scale`, never `font-size`.
11. Never nest a sub-composition timeline into the host (`master.add(child)`): the runtime nests registered child timelines and manual nesting double-seeks.
12. SVG draw-on: gate with `autoAlpha: 0`, use `getTotalLength() || <constant>` fallback; `stroke-linecap: round` paints a dot at zero dash length.
13. Audio-reactive visuals read a pre-baked frequency curve at init and stay a function of `tl.time()`, never of `audio.currentTime`; sample the data at 100 to 200 ms intervals.
14. `quickTo` and `gsap.matchMedia` are preview only. Easing and timing choices belong to the ice-motion skill.

## 6. Sub-compositions

- A sub-composition wraps its root in `<template>`; a standalone root sits in `<body>` without a template (lint `standalone_composition_wrapped_in_template`). The runtime clones only the template contents: put `<style>` and `<script>` inside the template; the file's `<head>` is discarded (`<link>` is hoisted).
- Host slot id, inner template id and `window.__timelines` key are the same id. Style the sub-composition root by `id="root"`, not by class.
- Timing inside the child is local. Host `data-duration` wins: a shorter internal timeline holds its last frame; a full-bleed child shorter than its host is flagged `subcomposition_blanks_before_host`.
- A sub-composition timeline cannot drive host elements: author host-level motion on the main timeline at global time = scene-local time + slot `data-start`.
- Scenes that share DOM, canvas or persistent elements: collapse into one sub-composition with internal phase divs.
- Symptom "Sub-composition timelines not registered after 45000ms" means the child never registered; the render waits 45 s per scene and captures static frames.
- Inlining a sub-composition into another document renders black: mount through `data-composition-src`.

## 7. Media and audio

- Never put `crossorigin` on `<video>` or `<audio>`. Never self-close media tags (`<video ... />` swallows the following elements). No base64 media; no placeholder URLs.
- Every `<audio>` needs an `id`; an id-less audio element is silently dropped from the mix.
- Never give a `<video data-start>` an ancestor that also carries `data-start`: put videos in an untimed wrapper and scale or move the wrapper. Never animate a timed media element's dimensions.
- J and L cuts: every video is `muted` and its sound is its own `<audio>`; two sounds never come from the same source at once.
- Volume over time uses the `data-automation` lane, never a GSAP volume tween (the lane wins; lint `audio_volume_double_automation`).
- HEVC 8 and 10-bit assets render; live preview auto-proxies browser-hostile files.
- Freeze a mid-source frame by preprocessing a still or a segment; arbitrary mid-source freeze is not supported.
- The render re-encodes audio slightly quieter: for a mastered mix, remux the master WAV into the render (`ffmpeg -i render.mp4 -i master.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest final.mp4`).
- Under narration use the voiceover carve instead of one global gain cut (mix rules: the ice-audio skill).

## 8. Runtime adapters (all coexist in one composition)

| Runtime | Rules |
|---|---|
| GSAP | Section 5 |
| Lottie (lottie-web, version in `versions.json`) | Local JSON; `autoplay: false`; always set `loop` (a missing `loop` means true; a numeric loop count does not repeat under seeking); push the instance to `window.__hfLottie`; no remote `path` URLs, no async registration; no playback-rate scaling (bake speed into the asset); one Lottie per performance (no per-animation start offset). See `lottie-engine.md` |
| Three.js | Render on the `hf-seek` event or `window.__hfThreeTime`; no rAF or `setAnimationLoop`; always set `data-duration`; importmap with pinned `three` in both entries; heavy setup registers a `window.__hf.buildReady` promise; drive `AnimationMixer.setTime` from engine time. See `threejs.md` |
| Anime.js v4 (exact version in `versions.json`) | No callable `anime()`; `easing:` becomes `ease:`; `autoplay: false`; register every animation or timeline on `window.__hfAnime` explicitly; seek in ms; `createSeededRandom(seed)`; v4 `loop` counts repeats; avoid `waapi.animate()`, draggables, `onScroll` |
| CSS keyframes | Finite duration and iteration count; `animation-fill-mode: both`; `data-start` on the timed element; write literal `cubic-bezier()` values inside keyframes (a CSS variable as a timing function is silently dropped and runs linear) |
| WAAPI | `element.animate()` with finite duration and iterations, `fill: "both"`; clip offsets are not automatic: model them with `delay` |
| TypeGPU / WebGPU | Register GSAP tweens synchronously before any `await`; render on `hf-seek`; mark `data-requires-webgpu`; `PRODUCER_ALLOW_SOFTWARE_WEBGPU=true` uses SwiftShader (slower); `e.detail.waitUntil(device.queue.onSubmittedWorkDone())`; never advance simulation state on repeat dispatch; pre-extract video frames with FFmpeg if video textures fail headless |
| HTML-in-canvas | 1 to 3 hero beats per video, not every beat; keep a fallback placeholder when the flag is absent; filters, backdrop filters, masks and blend modes force the normal capture path |
| Frame sources and film bridges | Repeated and out-of-order times return the same frame; never start a second clock; bridge startup deadline 20 s, frame deadline 15 s; one bridge per independently timed scene; never use iframes for captured content otherwise (they do not seek deterministically) |

Frame adapter contract: finite non-negative frame count; forward, backward and random seeks; same state for the same frame; no wall clock; finish async work before capture; release listeners in `destroy()`.

## 9. Registry (blocks and components)

- Search before hand-building any named visual: `npx hyperframes catalog --query "<describe the move in English>"`. Always query in English, whatever the film's language; write on-screen copy in the film's language afterwards.
- Only an empty `catalog --query ... --json` result proves nothing fits; say so before hand-authoring.
- `--on-device` search downloads a 33 MB model once: offer it, state the size, never enable it silently.
- `add <name>` needs the network every time and installs third-party code into the project: get the user's approval, then read the installed file before use. Blocks go to `compositions/<name>.html`, components to `compositions/components/<name>.html`. Run `lint` after wiring.
- Blocks are standalone sub-compositions (`data-composition-src`, host `data-duration` at most the block's own duration; you do not reference their timeline). Components are snippets that inherit host size and duration, with transparent background and no `data-composition-id`.
- A block is a structural donor: restyle it to the film's direction (the film must still differ from any template on 4 of 6 axes; see the ice-direction skill). Scope its CSS to `[data-composition-id="..."]`. Shader transitions: at most 2 per video.
- To study an item without installing, use the catalog or a scratch project; if added and dropped, remove file, manifest entry and lock entry together.
- Liquid-glass blocks need Chrome Canary or Brave with WebGPU (`--enable-unsafe-webgpu`) and render nothing otherwise.

## 10. Tailwind

Pinned `@tailwindcss/browser` v4 at the exact version in `versions.json` (do not replace the scaffolded runtime with `cdn.tailwindcss.com`); the runtime waits for `window.__tailwindReady`. `@config` and `@plugin` abort the browser compile. No `md:`/`lg:` breakpoints, no `transition-*`, no interaction variants. Bare `border` is broken in v4: always write the color. v4 renames `shadow-sm` to `shadow-xs`, `rounded-sm` to `rounded-xs`, `outline-none` to `outline-hidden`. Render proof: frame 0 must not flash unstyled content (`render --workers 1 --quality draft`).

## 11. Variables

`data-composition-variables` declares `{id, type, label, default}` (types string, number, color, boolean, enum with options, font, image). Bindings: `data-var-text`, `data-var-src`, CSS custom property `--<id>`. Read values once at init with `getVariables()`. Variables cannot change viewport, root duration, frame rate, output format, codec or quality. Media variables keep a real fallback `src`. Use `--strict-variables` in CI. A template that never re-skins can pass every gate: render twice with different values and compare.

## 12. Engine-scoped conflicts

| Topic | Rule A | Rule B | Scope |
|---|---|---|---|
| `mix-blend-mode`, `backdrop-filter`, filter curves on overlay layers | Forbidden on HyperFrames overlay tracks (each track composites on its own, so blends and backdrop blur do nothing useful); build glass from padding, a mask-composite exclude band and a rim inside the card | Fine in Remotion and single-page capture, where the page is one DOM composite | By engine |
| Parallel workers | Auto workers are fine for DOM and canvas films | `--workers 1` when the film contains `<video>` layers (parallel workers painted the video layer black) or bit-exact output is needed | By content |
| Async build | Build inside a `document.fonts.load` callback and register at its end | No async gate before registration in worker-built scenes (race flicker) | Single-file compositions may await fonts; parallel frame workers build synchronously and rely on preloaded local fonts |
| Shader transitions with exits | Exit tweens before a shader transition | The shader is the exit; content stays visible; exit tweens only on the final scene | Shader transitions: rule B. Hard cuts: exits per the ice-motion cut catalog |
