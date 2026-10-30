# Remotion guide

> Ideas from remotion-dev/skills (no license file; ideas rewritten in this repo's words, nothing copied), haidrrrry/claude-remotion-skill (MIT, (c) 2025 haidrrrry) and digitalsamba/claude-code-video-toolkit (MIT, (c) 2024 Digital Samba). Changes: merged, reworded, dashes removed.

Contents: 1 License gate. 2 Setup. 3 Project structure. 4 Frame-driven animation. 5 Sequencing and transitions. 6 Media, fonts, async loading. 7 Audio-driven timing. 8 Effects and 3D. 9 Preview and render. 10 Operational traps. Studio-editable code rules: `engine-choice.md` (section "Remotion: Studio-editable code rules").

## 1. License gate

Run the gate in `engine-choice.md` section 3 before any Remotion work. Free tier: individuals, for-profit companies with at most 3 employees, non-profits, evaluation. Company License: required for for-profit organizations with 4 or more employees. A change is announced for Remotion 5.0: re-check at the runtime date.

## 2. Setup (user prerequisites)

- Node.js at or above the minimum in `versions.json` (`runtimes.node`), and a package manager.
- Scaffold only into an empty folder (OS junk files like `.DS_Store` may be removed first; `.env` and `.git` count as real content). If the folder has content, scaffold into a new named subfolder. Use the blank template without Tailwind unless the user asks for Tailwind.
- Pin every `remotion` and `@remotion/*` package to one identical exact version (no `^`): the version in `versions.json` (`npm.remotion`) for a new project, or the project's existing pin. Mismatched versions break the project; fix with the project's own upgrade command and review the lockfile diff. Install Remotion-family packages (and `mediabunny`, `zod`) through Remotion's add command so versions match.
- FFmpeg and ffprobe ship with Remotion (`npx remotion ffmpeg`); no separate install.
- Look up the current API in the Remotion docs at the runtime date instead of trusting memory; the API moves between minor versions.

## 3. Project structure

```
src/index.ts      registers the root
src/Root.tsx      <Composition> registrations (id, size, fps, duration, defaultProps inline)
src/scenes/*.tsx  one component per scene
src/components/   reusable elements
src/theme.ts      one theme object: colors, fonts, easings, springs (never inline a hex or easing in a component)
public/           assets referenced with staticFile()
```

- Defaults seen in sources: 1920x1080 or 1080x1920 at 30 fps; 60 fps only for heavy fast motion. Use a Still (no duration or fps) for thumbnails.
- Composition folder names: letters, numbers, hyphens only. Nest a composition with a Sequence that sets its own width and height.
- Props types as `type` aliases (not interfaces); defaultProps JSON-serializable (Date, Map, Set and staticFile allowed); zod schema top level is an object; use Remotion's color type for color pickers.
- Use `calculateMetadata` only for metadata that is truly dynamic (props, fetched data, asset durations); pass its abort signal to fetches. Keep static size, fps and duration inline. Inside components read fps from `useVideoConfig()`; `calculateMetadata` cannot read it.
- One giant component is a failure mode: split scenes and components.

## 4. Frame-driven animation

- Every animated value is a pure function of `useCurrentFrame()` (and fps, inputs, constants). Remotion renders frames in parallel and out of order: no state across frames.
- CSS transitions, CSS animations and Tailwind animate or transition classes do not render correctly: rewrite them with `interpolate` or `spring`.
- Express seconds as `n * fps` with fps from `useVideoConfig()`, never a hard-coded FPS constant and never magic frame numbers.
- `interpolate` does not clamp by default: set `extrapolateLeft` and `extrapolateRight` to `"clamp"`, both sides. Missing clamp shows elements before their entrance or after their exit.
- Multi-keyframe interpolation takes one easing per segment (n - 1 easings).
- Scale tweens look uneven when linear in scale: use a perceptual (logarithmic) scale mode for scale animations.
- Prefer the individual CSS `scale`, `translate`, `rotate` properties; use a `transform` string only for skew, perspective or order-sensitive chains.
- Deterministic randomness: `random("<stable-seed>")`, never `random(null)`.
- Continuous rotation derived from frame divided by seconds per revolution is the one place linear motion is correct.
- Infinite scroll or marquee loops: duplicate the content and translate from 0 to minus half so the reset frame matches the start.
- Posterize (sample every Nth frame) only when a stepped style is intended.
- Easing values, spring presets and timing: the ice-motion skill.

## 5. Sequencing and transitions

- Timing props: `from` places an item in its parent; `trimBefore` sets the first frame of its own timeline; `durationInFrames` selects the range; `playbackRate` stretches it (it occupies duration / rate frames in the parent); `loop` repeats it. Child frame = trimBefore + (frame - from) x playbackRate.
- Static visuals cannot loop; non-media items need an explicit duration to loop. `playbackRate` must be constant: for variable or extreme speed (above 4x or below 0.25x) pre-process with FFmpeg.
- Put timing props directly on components that accept them; do not wrap one timed component in a redundant Sequence. Use an explicit Sequence for a shared clock across siblings, size overrides, or children without timing props. Inside a 3D canvas every Sequence uses headless layout.
- Successive scenes go on a named Track as connected compositions. Overlapping scenes use TransitionSeries: each scene is the only child of its series sequence; total duration = sum of scenes minus each transition length. Overlays at a cut (light leaks) do not shorten the timeline; never place an overlay and a transition adjacent.
- Absolute starts (`<Sequence from>`) suit tight sub-30 s spots; `<Series>` auto-chaining suits long form where scenes flex, but drift compounds. Mixing both is allowed.
- Do not import custom transitions through a barrel file that pulls every presentation; import presentations directly.
- Built-in transitions: fade, slide, wipe, flip, clock wipe; custom presentations receive direction and progress 0 to 1. Spring transition length without explicit frames depends on fps. Which transition and how long: the ice-motion skill.

## 6. Media, fonts, async loading

- Never a raw HTML `<video>`: use `<OffthreadVideo>` or the `@remotion/media` Video and Audio components (frame-accurate). Images use Remotion's image component; animated GIF, APNG, WebP and AVIF use the animated image component (Chrome and Firefox), else the GIF package.
- Assets live in `public/` and are referenced with `staticFile()`. Guard optional assets with `getStaticFiles()` so a missing file is a warning, not a crash.
- Any async load (fonts, data, Lottie JSON, maps) blocks the frame with `delayRender` until ready and releases with `continueRender`; on error, continue without the asset rather than hang, or cancel the render with a clear message. Without the gate you ship empty plates that pass every hash check. Do not pass the whole film through props; close over it.
- Font source order and choice: the ice-direction skill (`references/type-pairing.md` section 1). Local fonts (user or project files, or a system font file copied in after its license check) through the fonts package from `public/`, one call per weight with the same family name. A Google Fonts family the direction chose may load through Remotion's font package (blocks until loaded; only needed weights and subsets; module top level): that is a disclosed network call, so with the offline switch on download its files into `public/` once and load them as local fonts instead.
- Measure or fit text only after fonts load, with identical font properties for measuring and rendering; use `outline` instead of `border` so measurement matches. In Studio, correct DOM measurements for the preview's scale transform.
- `gap` or `margin` in `em` resolves against the parent font size, not the big text: use px in flex containers around display type.
- Crop with crop ratios 0 to 1 (keyframable); never combine with clip-path.
- Lottie: fetch the JSON inside a delayRender gate, store in state, render with the Lottie component.
- Audio pitch (`toneFrequency`) applies only in server render, not preview; reverse playback is unsupported. Volume 0 to 1, keyframed with interpolate.
- Trim non-destructively with props; cut a standalone file with FFmpeg only when needed and always re-encode.

## 7. Audio-driven timing

- Generate voiceover first, then size scenes from measured audio (`calculateMetadata` reading durations with Mediabunny), subtracting TransitionSeries overlaps. Write the measured durations in one constants block that every start references.
- Before rendering, every scene's `durationInFrames` matches its actual audio; a mismatch is dead air or cut-off narration.
- Audio visualization: sample counts are powers of two (32 to 1024); pass audio data and the parent frame down; do not call the frame hook inside offset children. Pacing and mix rules: the ice-audio skill.

## 8. Effects and 3D

- Prefer a built-in effect on a component that accepts effects over a CSS imitation. Plain HTML, Sequence and AbsoluteFill take no effects: wrap in HtmlInCanvas to post-process. HtmlInCanvas preview needs the Chrome version and canvas draw-element flag recorded in `versions.json` (`runtimes.chrome.notes`, with a higher version for nesting); tell the user.
- WebGL effects, maps and Cesium need the ANGLE renderer: `--gl=angle` at render or in config.
- Custom effects: a reusable parameterized factory; 2D backend for simple pixel work, WebGL2 only when shader math needs it; stable cache key of all params; validate params; reset 2D context state; preserve alpha; free GPU resources in cleanup.
- Color correction ranges (neutral defaults): exposure -5 to 5 stops (0), temperature and tint -1 to 1, shadows, highlights, blacks, whites -1 to 1, contrast multiplier 1 around pivot 0.5, saturation multiplier 1, vibrance -1 to 1; order exposure, white balance, tonal regions, contrast, saturation, vibrance. LUTs: 3D `.cube` only, size 2 to 256, exactly size cubed rows, no strength parameter.
- Motion blur component: shutter angle default 180 (0 to 360), samples default 8 (1 to 64); call the frame hook inside the blurred child. Version-gated features (light leak 4.0.500+, motion blur 4.0.529+): check the pinned version.
- Grade and grain with `mixBlendMode` are fine here because the page is one DOM composite (contrast with HyperFrames overlay tracks, `hyperframes.md` section 12).
- 3D: wrap in Remotion's three canvas with explicit width and height and real lighting; no `useFrame`, no autonomous shader time; animate only from the frame or it flickers. More in `engine-choice.md` (section "Three.js guide").
- Dense charts: draw on canvas, scale the backing store by device pixel ratio.

## 9. Preview and render

- A request to make a video means a live Studio preview first. Start Studio and open the preview before writing compositions; keep it running. Deep link: server URL plus `/<composition-id>`. In an in-app browser start Studio without auto-open, open the printed URL, confirm Studio and then the composition load.
- Visual checks: render chosen frames to PNG (`npx remotion still <entry> <id> out.png --frame <n>`, add `--overwrite` or you inspect stale stills), or extract frames from the MP4 with `ffmpeg -ss`. Preview suspicious motion at 0.25x in Studio.
- Render the final video only when the user asks (render, export, MP4); suggest the Studio render button as the friendlier option. `npx remotion render <entry> <id> out/video.mp4 --codec h264 --crf <n>` (CRF by purpose: `render-export.md` section 2). Heavy blur stacks: `--image-format png`.
- If Chromium fails to launch with "Old Headless mode has been removed", use the headless shell build or `--browser-executable`.
- Transparent for editing software: ProRes 4444 in MOV, PNG frames, pixel format `yuva444p10le`. Transparent for browsers: VP9 WebM, PNG frames, `yuva420p`. Set in config (restart Studio) or per composition defaults.
- WebGL-heavy renders (maps, Cesium): ANGLE, concurrency 1, long timeouts (180 s CLI, 60 to 120 s per delayRender).
- If code changed outside the chat in a surprising way, do not overwrite it: treat it as intentional or ask.
- Lambda and SaaS rendering: only on request; credentials in `.env`, never pasted in chat; Lambda functions are tied to the Remotion version (redeploy after upgrades, redeploy the site after source changes); new AWS accounts may need a concurrency quota raise; before production cover rate limiting, auth, cost controls, output privacy, cleanup, progress and error reporting. For one-off renders prefer the CLI or Studio.

## 10. Operational traps

| Trap | Fix |
|---|---|
| `durationInFrames` longer than content | Dead air; size from measured audio |
| Stale stills | `--overwrite` |
| System default fonts on hero text | Load fonts through the font packages |
| Describing a render instead of producing it | Render frames and look at them before claiming |
| Remote GIFs | Need CORS |
| Whisper WebGPU transcription | Needs a compatible GPU; set the language explicitly with a multilingual model for non-English (including Arabic); ONNX runtime fails on Linux arm64 |
| Hosted SFX lists include meme clips from copyrighted media | Never use them in commercial work; source sounds through the ice-audio and ice-assets skills |
