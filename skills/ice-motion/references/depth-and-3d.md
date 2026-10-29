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
- Slop 3D: default grey material, a spinning logo for no reason, orbiting an object when the film is not about its form, 3D on every beat, bloom haze, lens flares, glossy clip-art icons, a tilted card as "depth", 3D bar charts and rotating pies. News reel (edit type `news-reel`, style family `family-broadcast-news.md`): the glow disc, a glowing orb, bokeh orbs and dust in a cold open are allowed only where the reference measures them or the package names them, each with its trigger and reason row (`atomic-moves.md` section 7; the `ice-qa` skill, `references/slop-scan.md` section 4, "Broadcast package (news reel)"); never as filler.

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
- News reel and compositing tutorials (edit type `news-reel`, style family `family-broadcast-news.md`): a foreground card may carry a heavy box blur (tutorial: Fast Box Blur 30, 3 iterations); the room behind may be defocused by an adjustment blur under an inverted elliptical mask with a wide feather (tutorial: Gaussian 25, feather 100 px), the presenter excluded; inactive text gets a light blur (box blur about 3 px) under a 98 px feathered mask. The presenter is defocused only while not speaking (for example while a card speaks for him), at most a light blur (tutorial: Gaussian 10-15, never more), and stays lit and sharp while speaking (the `ice-edit` skill, `references/layers-and-isolation.md`, "The speaker stays lit"). The 24 px cap above still holds.
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
| Card field push-through | N photo cards on K planes (measure N, K and the plane spacing on the reference); cards pop 5 f apart at 25 fps; each plane scales about 2x faster than the plane behind it; the camera pulls out (to about 0.40) and then pushes through (x2.1 in 69 f, inOutSine); real planes in a 2.5D or 3D engine, never a CSS tilt of one image; near cards leave past the lens, far cards carry the title; every card used as evidence carries its source tag. Route and full values: section 7 |
| Measured device fold | see the hinge keys in `springs-and-curves.md`; lock the camera during the motion and reframe after landing; keep at least 60 percent of glass reflections through a fold; fix light flashes by widening the light, not dimming it |
| Isometric | orthographic, 35.264 degree elevation, 45 degree azimuth; moves on integer grid modules; camera pans only, no rotation; Z order follows screen y |
| 3D title | one slow steady dolly forward and slightly up; no shake, no spins; ground under the title dark enough that reflections never show through letters; subtle bloom only |

## 6. Real 3D look rules

- Without an environment map everything is grey plastic; soft area lights plus a low-intensity HDRI read more real than bright ambient light; one light with no ambient renders a flat black cutout (add a fill).
- Tone-map before bloom; filmic tone mapping for dark chrome, neutral when a brand colour must be exact; bloom strength about 0.03-0.08.
- Extruded chrome type with flat faces flashes whole letters: bend the shading normals. Chrome-on-black with bloom is a house style to avoid.
- Render family per film (one, or two if the switch is a moment): flat solid, soft clay, glossy, glass, isometric, realistic PBR, neon line.

## 7. Build routes for depth and 3D

Scope: general, any video made with a reference (lesson L12), and any film whose plan holds a depth or 3D element. Every depth or 3D element of a reference is measured (the `ice-remake` skill, `references/measuring.md`, section "Depth, 3D and camera"; file `analysis/depth.json`) and maps to a shot of the new film with one build route, written as `build:` in the shot mapping and the storyboard; an element with no route is a finding reported to the user, never a silent drop. The QA gate that compares the film with the reference: the `ice-qa` skill, `references/motion-density.md`, "Depth and camera against the reference". Choose the dimension first (section 1); then the route by element kind below. Numbers are measured on broadcast packages (25 fps) and are starting points: the reference's own measurement wins.

**The four routes.**
| `build:` value | What it is | Covers | Limits |
|---|---|---|---|
| `css-3d` | Planes in a CSS perspective wrapper inside HyperFrames or the HTML route (2.5D from a matte: clean plate, person matte, glow disc, cut-out props and cards at their own depth, fake floor shadow from the person's own matte squashed, sheared, blurred and tinted 2-3 shades darker than the floor) | Card fields, cards in space, a phone or card turning, text rings made of strips, per-plane blur | No real light or bounce; a filter or opacity on a preserve-3d element flattens it (section 2); masks are coordinates in the plan, not drawn by hand |
| `threejs-hyperframes` | Three.js scene inside HyperFrames (the `ice-engines` skill, `references/threejs.md`) | Lit objects: globe, flag cloth, extruded text, GLTF props, a built set at lower realism (cove, spot and rect-area lights, a shadow-catching floor under the presenter card), bokeh depth of field | No path-traced bounce light; headless WebGL needs the SwiftShader or ANGLE flags (`threejs.md` section 5); pin GPU or software rendering for the whole film; time comes only from the frame |
| `remotion-three` | Three.js inside Remotion's three canvas (`ice-engines` skill, `references/remotion.md` and `threejs.md` section 5) | The same kinds as `threejs-hyperframes` when the film is built in Remotion | Explicit canvas size, `--gl=angle`, no `useFrame`, animation only from the frame |
| `blender` | A Blender scene rendered headless from a script (`blender -b set.blend -P build.py`), PNG sequence composited under the type (`threejs.md` section 6) | Photoreal sets, cloth flags, real shadows of a presenter card placed in the scene, lens depth of field focused on an object | Only when Blender is on the machine or installed for the run at a pinned version; models from a store need the user's own sign-in; slow renders |

A true 3D camera solve of moving-camera footage is not feasible headless today: shoot or pick locked takes, or pin a card to a flat surface with a 2D planar track (homography); say so when a reference needs more.

**Routes by element kind (the `elements_3d` kinds of `depth.json`).**
| Kind | Route (first choice, then fallback) | Needs | Values and limits |
|---|---|---|---|
| `card_field` (2.5D photo-card field with a push-through) | `css-3d`; `threejs-hyperframes` when cards must catch light | The cards' real images with their source tags (every card used as evidence carries its source); N cards on K planes measured on the reference | Measured: cards pop 5 f apart, each with a 1-2 f glowing red rectangle first; pull-out to 0.40 (outQuad); the near card shrinks about 2x faster than the room (-23 percent against -12 percent over 40 f); push-through x2.1 in 69 f (2.76 s), inOutSine, peak +3.9 percent of scale per frame. Each plane scales by lens / (D + z) (section 2), never a CSS tilt of one flat image; near cards leave the frame past the lens, far cards carry the title. Row "Card field push-through" in section 5 |
| `flag` (3D waving flag) | `threejs-hyperframes` or `remotion-three` (a plane with a seeded vertex wave from time only, lit); `blender` cloth when installed; otherwise a pre-rendered loop | The real flag artwork (official or public domain, the `ice-assets` skill) | A cloth simulation is pre-rendered, never run live in the render; seek-safe wave of the frame number; a glow on the pole only when measured |
| `globe` | `threejs-hyperframes` or `remotion-three` (sphere with a map texture, a glowing horizon) | Licensed map data or imagery (the `ice-engines` skill, `references/maps-geo.md`) | Rotation linear or on the calm curve (`springs-and-curves.md` section 7); no spin without a cause |
| `extruded_text` | `threejs-hyperframes` or `remotion-three` (extrusion of the glyph outlines); `blender` for photoreal | Glyph outlines from the shaped line: shape Arabic first (joins, RTL order) and extrude the shaped outlines, never per-letter geometry from an unshaped string | Bend the shading normals or flat faces flash whole letters (section 6); reads happen at landings |
| `wrapped_text` (text on a cylinder ring around the presenter) | `css-3d` (the shaped line rendered once as an image, sliced into narrow vertical strips, each strip placed with `rotateY(angle) translateZ(radius)`, back half hidden or dimmed behind the person matte); `threejs-hyperframes` (the line as a texture on an open cylinder) | The person matte, so the ring passes behind and in front of the presenter | Measured tutorial values: rotation about the vertical axis 59 to 13 degrees in 1.05 s on Easy Ease 33 / 33, rendered on the outside of the cylinder, layer fade out over 0.27 s; a 20 percent red glow plane with a very wide feather behind. Never split Arabic into letter spans (joins break). Existing captions on a ring: the `ice-type` skill, `references/depth-and-embedded-captions.md` |
| `cards_in_space` (a phone or card turning, an orbit line) | `css-3d` (`rotateY` on the card, the orbit an SVG ellipse split into a back half under the card and a front half over it); `threejs-hyperframes` when lit | The real screen or poster on the card (the `ice-assets` skill, `references/brand-authenticity.md` for a brand) | Measured end card: the phone turns edge-on across the frame in 14 f, then an 8 f crossfade; the orbit line draws 16 f later and the text 22 f later |
| `set` (a built virtual set behind the presenter) | `css-3d` from the matte (plate, props in depth, glow disc, fake floor shadow); `threejs-hyperframes` for a lit cove; `blender` for a photoreal set (cove, lights, a 50 mm f/2 camera with focus on an object, a shadow-catcher floor with a transparent film) | A person matte or a keyed shot; a shot taken locked off | Virtual set layer order and the spotlight: the `ice-edit` skill, `references/layers-and-isolation.md`, section "3b. Programme matte kit" |
| Depth of field per plane | Per plane `filter: blur()` on a pre-rendered copy (`css-3d`); the bokeh pass (`threejs-hyperframes`, `remotion-three`); the lens (`blender`) | The plane list with their depths | Measured background defocus: 3.0-6.9 px sigma more than the face; per depth step 3-6 px (section 3); the speaker stays sharp while speaking (section 3); never blur a `<video>` directly |
| Camera moves in z (a 3D camera, one node) | `css-3d` (one perspective wrapper, section 4) or a Three.js camera | A perspective that matches the lens: perspective px = frame width x focal length / 36 (a 35 mm lens on 1920 wide is about 1870 px) | Measured promo project: a 35 mm camera on nested nulls, z 870 to 0 in 1.18 s (influences 16.8 / 100 percent), then z 0 to 736 starting at 0.65 s and running to 2.4 s, the second move starting inside the first (`springs-and-curves.md` section 7, two-null overlap); a dolly of about 2.25 s peaking near 450 px/s; one sub-brand settles its camera from z -1507.7 to -2666.7 with a 5 degree tilt. The digital camera on a flat take: `camera.md` section 8 |

Write the film's own `<render>.depth.json` from the plan and the build (same schema as the reference's `depth.json`), with `camera_moving_share` measured on the render when possible, so the gate can compare the two.

Sources: hyperframes skills (3d-camera-flight, 3d-page-scroll, split-tilt-cards, orbit-3d-entry, depth-scatter-assemble, text-depth-layers, hacker-flip, depth-of-field, techniques), hyperframes docs (runtimes and 3D), motionmaxxing (world.md, ui-demo, motion.md), motion-video-kit (three-js patterns, product hero realism), product-launch-motion (05 camera), anidoodle (camera), community camera-3d-captions, mg-styles-15 (isometric), charlie947 motion-graphics, huashu-art-motion, commercial-motion-design (founder), ideas from anything2explainer, imMamdouhaboammar (rewritten); section 7 and the news reel lines from measurements of broadcast news packages and the compositing tutorials of Muhamd Helal and Ahmed Maher (ideas only).
