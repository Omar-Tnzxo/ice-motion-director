# Lottie as an engine (playback and capture)

> Merged from heygen-com/hyperframes adapters (Apache-2.0), AbubakrChan/product-launch-motion and diffusionstudio/lottie (MIT). Changes: merged, reworded, dashes removed.

This file covers only how Lottie plays inside a deterministic render. Authoring Lottie JSON (spec map, slots, controls, Skottie compatibility, SVG conversion, recipes) belongs to the ice-lottie skill: open that skill for any Lottie deliverable.

## 1. Players

| Player | Use | Pin |
|---|---|---|
| lottie-web | Lottie inside HyperFrames or an HTML capture page | lottie-web (bodymovin) at the exact version in `versions.json`, vendored or a pinned CDN URL |
| Skottie (canvaskit-wasm) | Previewing and exporting standalone Lottie work; closest to mobile players | canvaskit-wasm full build at the exact version in `versions.json` (the ice-lottie player uses the same one) |
| Remotion Lottie component | Lottie inside Remotion | Same version as the project's Remotion packages |

## 2. Deterministic playback rules

- Local JSON only; no remote `path` URLs; no async registration.
- `autoplay: false`. Seek with `goToAndStop(frame, true)` from the engine time (HyperFrames pushes the instance to `window.__hfLottie` and seeks it for you).
- Always set `loop`: lottie-web treats a missing `loop` as true, and a numeric loop count does not repeat under seeking.
- No playback-rate scaling in HyperFrames: bake non-default speed into the asset.
- There is no per-animation start offset: author the whole performance as one Lottie, or cue by shifting keyframe times inside the JSON, not by the layer start-time field.
- An animated multi-dimensional layer transform can silently blank the whole layer in lottie-web: split dimensions or verify at several frames.
- Lottie frame math: `ip` inclusive, `op` exclusive (`ip: 0, op: 90, fr: 60` renders frames 0 to 89). Map engine time to Lottie frames with the file's own `fr`.
- Characters: the Lottie owns the body, GSAP owns everything around it; read beat times from Lottie `markers`; when a walk cycle travels, match travel speed to the stride or the feet slide. License every character; never ship one copied from a site.

## 3. Render-risky features

Treat blur, bloom, glass, chrome, dither, true 3D and displacement as renderer-risky in Lottie; bake counters, particle offsets, orbit math and expression-like systems to keyframes before relying on Skottie; path morphs need compatible vertex structures. Details and fixes: the ice-lottie skill.
