# 2D, 2.5D and 3D motion

When to fake depth, when to use real 3D, and the measured values for depth moves. Engine setup (Three.js, WebGL, seek adapters) is owned by the ice-engines skill.

## 1. Choose the dimension

| Choose | When |
|---|---|
| Flat 2D | The style's point is flatness (print, poster, diagram, Swiss, Bauhaus); stay flat on purpose with hard colour, hard shadow, grain, and still a ground with an edge and an object with a cause |
| 2.5D (planes in depth) | Usually cheaper and clearer than 3D: background, middle, hero, foreground occluder; parallax; skewed stacked planes 2-3 layers about 90 px apart for space, hierarchy and indexing |
| Real 3D | The idea is physical: an object with mass that catches light or that the brand makes, hidden surfaces revealed by rotation, real occlusion, a real camera, material and lighting; depth must explain hierarchy, separation, assembly, routing, comparison or transformation |

- 3D only where it explains something physical or spatial; typography and UI stay crisp 2D.
- Never fake an orbit with a CSS rotation of a flat image; CSS perspective skews flat planes with no light source and no camera. Real depth, lighting or camera motion means a real 3D engine.
- Spend the hero 3D moment once ("one hero object, spent on one event, never on two consecutive beats"); use HTML-in-canvas or shader beats for 1-3 hero beats per video, not every beat: the contrast between flat beats and rich beats is part of the storytelling.
- A 3D move needs FG, MG and BG roles, a point of interest, perspective, measurable parallax, occlusion, consistent light and contact shadows, and a numeric frame where it recombines into the flat narrative.
- Slop 3D: default grey material, a spinning logo for no reason, orbiting an object when the film is not about its form, 3D on every beat, bloom haze, lens flares, glossy clip-art icons, a tilted card as "depth", 3D bar charts and rotating pies.

## 2. Parallax and planes

- Far background at a fraction of the camera's rate, content at full rate, foreground at several times (illustration only: one fifth, one, six times with a strong foreground blur).
- Plane at depth z scales by lens / (D + z), D = 1 / zoom; never hand each plane its own drift.
- Parallax ratios used by sources: 0.3 / 0.6 / 1.0; 1 : 0.8 : 0.6 (isometric); 2-2.4x between neighbours; up to 5-6 layers (far 0.05, mid 0.12-0.3, near 0.65, subject 1.0, foreground 1.5 blurred and dark).
- The cue that does the most depth work is occlusion, not blur; prefer one strong foreground element crossing the lens.
- Two planes, one slow move each, in opposite directions is the minimal parallax; never per-element drift.
- Depth without an engine: preserve-3d and a static z of 12-22 px on story elements. Opacity or filter on a preserve-3d element flattens it; a filter on a 3D-transformed element flattens it.
- Fine textures (2 px features, 24 px spacing or smaller) must not live in a continuously zoomed layer: enlarge them or move them to screen space.

## 3. Depth of field

- Blur 3-6 px per depth step, max 8 / 16 / 24 px; dim non-focus layers 0.4-0.7 (rarely below 0.35); focus change 0.5-1.2 s.
- Blur the small or grouped layers, not the giant one; the focal layer is genuinely sharp; settle sharp before a handoff.
- Rack focus on UI: blur 0.7 to 5.5 to 10 to 11 px over about 0.7 s (cap about 11 px) with 0.1 darkening; pull focus back by animating blur 4 to 0 over about 0.46 s, never by opacity. Defocus by blur, not opacity: 4 px still readable, 7-15 px non-hero, cap about 11 px under a headline.
- Rack of attention without blur (drawn styles): emphasis by stroke weight, saturation and value contrast.
- DOF from a lens: sigma = 6.7 x |D - focus| / D px at 1080 tall (flat captions cap at 1.2 px).

## 4. 3D camera flight (HTML or real 3D)

- One perspective wrapper, one camera state object, one transform writer; perspective set once and never tweened; transform order translate3d then rotateX then rotateY; landing poses are authored, not derived.
- Perspective 700-1400 px (moving 800-1200); |rotateX| at most about 65 degrees, |rotateY| at most about 30.
- Z budget: camera z + prop z at most about 0.6 x perspective.
- Dive and land 0.6-1.0 s (under 0.5 s reads as a cut); flatten 1.2-2.0 s; pan 0.8-1.5 s (whip 0.5-0.8); power4.out for dives and landings, power2 in-out for repositioning; no spring or back on the camera.
- Holds at least 0.8 s, final dwell at least 1 s; drift 2-8 px, rotation at most 0.5 degrees.
- Keep the world clean: no filter, opacity under 1, overflow, clip-path or mask on the world wrapper (it flattens 3D); travel blur on the stage.
- Reads happen at landings: angled, blurred, flying text is texture.
- Camera pitch for product maquettes 35-55 degrees, no roll, minimum distance; narrow field of view about 25-35 degrees; depth of field spent on one rack focus.

## 5. Depth moves (value tables)

| Move | Values |
|---|---|
| Page scroll in 3D | static tilt Y 4-12 degrees (either side), X 0-6, perspective 800-2000 px; scroll 0.8-1.8 s with one ease for all scrolls; spotlight fade 0.4-0.8 s; shadow direction matches tilt; page content is real, not a screenshot |
| Split tilt cards | perspective 1000-2400 px; tilt 10-18 degrees (overshoot 4-12); card 480-820 px; entry 0.6-1.2 s; float 3-8 px counter-phase; body copy at most 2 lines per card; symmetric weight |
| Orbit entry | radius X 300-900 px, Y/X 0.4-0.7; 4-25 s per revolution (at least time on screen); entry 0.4-0.8 s; stagger 0.06-0.12 s; 4-12 items; items flip in place at their orbital position, not at the centre; the centre element is the headline, lifted forward |
| Depth scatter assemble | 4-14 elements; radius 250-700 px; Z near +150 to +450, far -150 to -500; tumble 40-110 degrees; assemble 0.7-1.4 s power3.out (never an in ease); n x stagger shorter than the assemble; golden-angle scatter by index; resolve flat |
| Text depth layers | 4-6 layers, offsets 1-3 px (over 4 px reads as glitch), back alpha 0.6-0.85 stepping 0.08-0.15 to a floor of 0.1-0.2; hero 200-340 px; cascade 0.04-0.10 s; back layers never more saturated than the front; no text-shadow with layered depth; no per-letter animation on the stack |
| Hacker flip 3D | font 6-10 percent of the frame's short side; flip 0.4-1.0 s; character stagger 0.03-0.08 s; reveal threshold 0.5-0.7; flicker 3-6 frames per glyph swap; perspective on the scene root; no decorative chrome, the flip is the beat |
| Exploded layers | separate on coherent axes from a visible cause and recombine into the exact receiving object; smootherstep with at most 5 ms stagger per course (a cubic ease-out starts at full speed and pops for one frame); slow breathing of +10-15 percent after the lift; text stays camera-facing |
| Device hero | arrive already turning; one move only (15-25 degree turntable or a dolly); hold at least 0.5 s; text never in 3D; device turn 8-14 degrees; phone in context 45-65 percent of frame height, cropped at an edge; six held poses inside 0.4 s under about 1870 px perspective is a measured phone move |
| Turntable plus push | about 7 degrees over 4 s plus a 1.06 push |
| Measured device fold | see the hinge keys in `springs-and-curves.md`; lock the camera during the motion and reframe after landing; keep at least 60 percent of glass reflections through a fold; fix light flashes by widening the light, not dimming it |
| Isometric | orthographic, 35.264 degree elevation, 45 degree azimuth; moves on integer grid modules; camera pans only, no rotation; Z order follows screen y |
| 3D title | one slow steady dolly forward and slightly up; no shake, no spins; ground under the title dark enough that reflections never show through letters; subtle bloom only |

## 6. Real 3D look rules

- Without an environment map everything is grey plastic; soft area lights plus a low-intensity HDRI read more real than bright ambient light; one light with no ambient renders a flat black cutout (add a fill).
- Tone-map before bloom; filmic tone mapping for dark chrome, neutral when a brand colour must be exact; bloom strength about 0.03-0.08.
- Extruded chrome type with flat faces flashes whole letters: bend the shading normals. Chrome-on-black with bloom is a house style to avoid.
- Render family per film (one, or two if the switch is a moment): flat solid, soft clay, glossy, glass, isometric, realistic PBR, neon line.

Sources: hyperframes skills (3d-camera-flight, 3d-page-scroll, split-tilt-cards, orbit-3d-entry, depth-scatter-assemble, text-depth-layers, hacker-flip, depth-of-field, techniques), hyperframes docs (runtimes and 3D), motionmaxxing (world.md, ui-demo, motion.md), motion-video-kit (three-js patterns, product hero realism), product-launch-motion (05 camera), anidoodle (camera), community camera-3d-captions, mg-styles-15 (isometric), charlie947 motion-graphics, huashu-art-motion, commercial-motion-design (founder), ideas from anything2explainer, imMamdouhaboammar (rewritten).
