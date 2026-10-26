# Three.js guide

> Merged from heygen-com/hyperframes adapters and registry templates (Apache-2.0), echris6/motion-video-kit and AbubakrChan/product-launch-motion (MIT), Tejashmakwana/motionmaxxing (Apache-2.0), Vincentwei1021/mg-styles-15 (MIT); ideas from remotion-dev/skills and vibe-motion/skills (rewritten). Changes: merged, reworded, dashes removed.

## 1. When

Use Three.js for a real 3D hero: product turntable, extruded logo, camera flight, globe, depth with occlusion and lighting. Spend it on one hero or lockup shot, not on flat UI tours. Scale alone is fake depth; DOM 3D (perspective on a stable parent, `preserve-3d`) covers simple tilts (camera rules: the ice-motion skill).

## 2. Setup

- Pin one exact version per project and record it: the `three` version in `versions.json` by default (HyperFrames VFX blocks were built on 0.147.0 and bloom examples on 0.181.2; keep a project's existing pin). three r181 leaked memory through `PMREMGenerator`: dispose environment maps.
- Load as an ES module through an importmap with the pinned version in both entries (`three` and `three/addons/`), or vendor the files. A double-clicked `file://` page will not load modules: serve over HTTP.
- Text extrusion needs TTF, OTF or WOFF fonts, not WOFF2.

## 3. Render contract

- No rAF loop, no `setAnimationLoop`, no timers, no physics history. Expose `pose(t)` and `render(t)` and call `renderer.render()` only from the engine's seek: HyperFrames `hf-seek` event or `window.__hfThreeTime`; HTML capture `window.renderAt(t)`; Remotion `useCurrentFrame()`. Retime with `(t - start) * speed`.
- HyperFrames: always set the root `data-duration` (no inference for Three.js); heavy CPU setup registers a `window.__hf.buildReady` promise; GSAP may animate a plain state object that the render function reads (state proxy pattern), with `tl.eventCallback("onUpdate", renderScene); renderScene();`.
- Renderer: `new WebGLRenderer({ alpha, antialias: true, preserveDrawingBuffer: true })`, pin size and `setPixelRatio(1)` (or a fixed 1.5 for crisper edges, never `devicePixelRatio`), SRGB output, ACES filmic tone mapping (exposure about 1.1 in source templates). Tone-map before bloom.
- Use `compileAsync` before the first frame. Avoid post passes that depend on previous frame history.
- Imported animations: drive `AnimationMixer.setTime(t)` from engine time.
- Seeded PRNG (mulberry32) for any procedural placement.
- Camera cuts inside one canvas: declare each cut time once as a constant; verify the last frame before the cut and the first frame after it.

## 4. Lighting and shading traps

- One light with no ambient renders lit meshes as a flat black cutout: add a fill (for example a hemisphere light).
- Clamp the cosine to [0, 1] before `pow(1 - cosine, exponent)` in shaders.
- WebGL shader art: include a Canvas 2D gradient fallback.
- Instanced and shader effects are invisible to DOM checks: verify with ghosted keyframe views and snapshots.

## 5. Headless and performance

- GPU and SwiftShader output differ by about 38 dB PSNR: pin one mode for the whole film. Without a GPU, headless WebGL renders black unless SwiftShader or ANGLE flags are set.
- About 7 to 11 fps at 1080p on a laptop GPU; lowering capture scale does not cut WebGL cost.
- Remotion: wrap in the three canvas with explicit width and height, render with `--gl=angle`, every Sequence inside the canvas uses headless layout, no `useFrame`.
- Measured product-hero realism (motionmaxxing and motion-video-kit): accumulation motion blur with N subframes at `t + ((i + 0.5) / N - 0.5) * shutter`; 10 subframes left combing, 24 over the fastest 0.5 s were clean; shutter about 300 degrees on the fastest swing easing to 180, ramped over about 6 frames. Author stage colour against the decoded output; judge on encoded frames only.

## 6. Blender alternative

For photoreal materials beyond WebGL, render a PNG sequence from a Blender Cycles script and composite type and grain as an HTML overlay pass; mux with FFmpeg.
