# Canvas 2D and p5

> Merged from alexgreensh/anidoodle (Apache-2.0), edenfunf/reelmimic engine-kit (MIT), heygen-com/hyperframes-community-skills p5 skills (Apache-2.0), alchaincyf/huashu-art-motion (MIT); ideas from imMamdouhaboammar/motion-graphics-skills and noncommercial sources (rewritten). Changes: merged, reworded, dashes removed.

Both run inside the HTML capture harness (`html-canvas-capture.md`) or as a HyperFrames canvas layer. Style choice (watercolour, riso, pixel, paper cut-out, cel, crayon): the ice-styles skill.

## 1. Canvas 2D contract

- One pure function paints every frame: `renderFrame(frame, env)` or `renderAt(t)`. No values kept between calls, no timers.
- Randomness only from a seeded generator or a hash of a stable key (`hash()`, `rnd(key)`, `s.rand()`, `s.noise()`). Prove determinism: draw the same frame twice and compare hashes (a reproducible still is the receipt).
- One file per shot; shot files only call the shared library and the cast; they never redraw a character's body parts themselves. Shared files (characters, palette, master) are read-only for shot builders; shared-file fixes are additive and backward compatible.
- Everything drawn by code: no image files you did not generate, no network at render time.
- Characters drawn in code: limbs always attached; original designs only, never an existing IP character.
- Budget: keep the median frame well under 150 ms (p95 under 200) for light art; painted engines up to about 2.5 s per frame.
- Canvas shadow blur, offsets and filters ignore the transform: multiply them by device pixel ratio times zoom.
- Scale the whole drawing to fill the frame rather than redrawing it per format.
- Pick one unit for time (seconds) and keep it.
- A blank page is usually a name declared twice.
- Pixel reads: `getContext("2d", { willReadFrequently: true })`.
- Arabic and other complex scripts: never draw them in Canvas when shaping is unreliable; keep text in DOM or SVG above the canvas (see the ice-arabic skill).
- Transparent output: skip the paper fill; carry texture in the marks.
- Dark gradients band in 8-bit encoding: overlay a fixed noise tile (alpha 7/255 or less) in device pixels, or encode with grain-friendly settings (`render-export.md` section 3).

## 2. p5 and p5.brush

- Pin `p5` and `p5.brush` from npm at their exact versions in `versions.json` (p5 is LGPL-2.1: load it, do not vendor a modified copy). Stock p5.brush darkens saturated pigment (about pigment x 0.85 minus 0.075); check colours against the brief and correct in the palette.
- Never declare a global function whose name p5 or the window already uses (`line`, `dot`, `box`, `screen`); never shadow engine function names with locals.
- p5.brush mixes colour like pigment: paper strokes go in a second pass; never draw a paper stroke that an ink shape should cover.
- Painted pitfalls: huge filled shapes with bleed show a translucent band when zoomed out (use a wash); props drawn in an arm hook rotate with the arm (draw them in world coordinates).
- The stroke lattice for repainted footage is built once from frame 1 and locked, so the painting never boils while the subject moves.
- Re-running with the same seed must produce identical canvas bytes; the last frame shows the complete artwork.
- Cost: 150 to 250 ms per wide frame, about 350 ms busy, 0.7 to 1 s for page turns; a 30 s painted film takes 15 to 30 min. Do not use p5 painting for crisp brand type, photoreal output, or footage longer than about 10 s.
- Render the paper world wide, then crop the camera path in post. Iterate one dial at a time against a fixed seed. Re-render only changed shots (frame-range cache); never delete all frames and redo the whole film.
