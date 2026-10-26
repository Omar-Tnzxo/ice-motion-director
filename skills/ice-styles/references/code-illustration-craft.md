# Code illustration craft: drawing objects, characters and scenes in code

Read this before any object, character, vehicle, machine, building or scene is drawn in code (SVG, HTML and CSS, Canvas, Three.js). It is the floor under every catalog style that draws in code. Founder decision, 2026-10-22: code-drawn art in early runs was primitive (flat single-colour geometric objects with no shading, texture or detail), and nothing raised the art itself. A style entry decides HOW each rule below is rendered (flat shapes, hatching, palette ramps, paint); it never removes the rule.

Before drawing anything in code, check the ladder of art sources (the ice-assets skill, `references/sourcing-and-licenses.md` section 1b): hand-coded art is the last rung, used only when the higher rungs do not fit, and then held to every rule here.

## Contents

1. Construction
2. Value and light
3. Surface
4. Line
5. Depth
6. Animation-ready structure
7. Production method
8. How each rule reads per style family
9. The art check (gate)
10. Writing these rules into a film

## 1. Construction

- **Silhouette first.** Block every hero object as one dark shape before any detail. It must read as what it is when filled solid at thumbnail size. A silhouette that reads only with its details is redrawn, not decorated.
- **One shape language per film.** Choose round, square or angular (or a stated mix with one dominant) from the brief's mood and the brand's own forms, write it in the style lock, and hold it for every object, character and prop. Round reads friendly and soft, square reads stable and dependable, angular reads fast or tense; the choice and its reason are logged.
- **Primary, secondary, tertiary forms.** Primary: the big mass that carries the silhouette (about 60 to 70 percent of the object). Secondary: the parts that say what the object is. Tertiary: small details that say what it is like (seams, bolts, labels, wear). Build in that order; never start from tertiary detail.
- **Proportions from real references.** For a real kind of object (a vehicle, a device, a body, a building), take proportions from two or more real reference photos found by the run's dated research (queries built from the brief's slots only), and write the key ratios (height to width, wheel or limb size to body, window to wall) in the style lock. Stylize by pushing those ratios on purpose, never by guessing them. Reference photos are measured, never traced and never placed in the film.
- **Character construction.** A character is built from volumes (head, rib cage, pelvis, limbs) with a clear line of action, readable pose in silhouette, and a model sheet (front, three quarter, side) before any shot uses it. Hands and faces get their own pass at final size.

## 2. Value and light

- **One light direction per scene.** Pick it (side, top, back, three quarter) and write it in the shot table. Every shadow, highlight and rim in the scene obeys it; a scene that cuts may change it only with a visible light source or a story reason.
- **At least three tones per object: base, shadow, highlight.** Each hero object carries a base tone, a shadow tone on the side away from the light, and a highlight tone on the side facing it. Shadow tones shift hue a little toward the ambient colour and drop in lightness; highlights shift toward the light's colour. A hero object drawn in one fill is primitive and fails the art check (section 9).
- **Rim light or edge accents on hero objects.** A thin lighter edge on the silhouette's lit or back-lit side separates the hero from the background. Secondary objects may skip it.
- **Cast and contact shadows.** Every object that touches a surface casts a shadow on it, in the direction the light sets. Under the contact point sits a small, darker, tighter contact shadow; the cast shadow grows softer and lighter with distance from the contact.
- **Ambient occlusion where forms meet.** Darken the creases where an object meets the ground, a wall or another object, and where parts of one object meet (a wheel in its arch, an arm at the body). A soft dark band a few percent of the object's size is enough.
- **Value before hue.** Check the frame in greyscale: the hero must hold the strongest value contrast in the frame, and the three tones of each object must stay distinct in grey.

## 3. Surface

- **Gradients on purpose.** A gradient models a curved form (light rolling across a cylinder or sphere) or a light falloff. It follows the scene's light direction. A gradient laid on every shape at the same angle is decoration and reads as template art.
- **A texture or grain layer.** Every film drawn in code carries a medium layer that matches the style: paper grain, print noise, brush texture, film grain, surface noise on materials. Build it deterministically (a seeded noise filter, a pattern tile, a scanned texture with a recorded licence) and keep it fixed to its surface, never reseeded per frame unless the style's medium does that (film grain does; paper does not). Grain laid over flat vector art is not a style on its own (`style-method.md` section 1); it is one layer of the finish.
- **Wear and small details at a set density.** Hero objects carry tertiary detail at a density written in the style lock as a count range per object (for example, a slot such as "<n> to <m> details per hero object"; the numbers come from the style and the shot size, never from this file). Details cluster where real use would put them (edges, handles, contact points) and stay sparse on broad planes. Secondary objects carry about half the hero density; background objects carry silhouette and value only.

## 4. Line

- **One line policy per film:** no line, uniform line, or variable weight. Write it in the style lock with the widths in pixels at the delivery size and hold it everywhere: characters, props, backgrounds and UI drawn in the style.
- Variable weight thickens on the shadow side and at overlaps, and thins toward the light.
- Outline colour is a dark of the local colour, not pure black, unless the style's medium uses black ink.
- Outlines are drawn last and at a fixed width in screen space; a scaled group must not thicken its lines (use `vector-effect: non-scaling-stroke` or redraw at the new scale).

## 5. Depth

- **Atmospheric perspective.** Objects farther away lose contrast and saturation and shift toward the sky or ambient colour. At least three depth bands (foreground, middle, background) in any scene with a horizon.
- **Scale cues.** Repeated objects (lamps, trees, windows, people) shrink with distance on a consistent horizon; known-size objects give the scene its scale.
- **Overlap.** Near forms overlap far ones; a scene where nothing overlaps reads as stickers on a flat board.
- Depth layers are marked for the richness floor (`data-ice-layer`, the ice-qa skill, `references/pre-render-lint.md` section 4).

## 6. Animation-ready structure

- **Named groups.** Every hero object is one group with a meaningful id (the object's role in the film), and every part inside it that is lit, moved or swapped is its own named group (body, wheel-front, door, arm-upper-left). No anonymous `path` soup.
- **Pivots at joints.** Each moving part's transform origin sits on its real joint (an axle, a hinge, a shoulder), set in the drawing's own coordinates, so a rotation turns it around the joint and not around the canvas corner.
- **Separate layers for parts that move.** Parts that move, light or deform independently are drawn as separate shapes, never merged into the body's path. Shadow and highlight shapes live inside the part they belong to, so they move with it; the cast shadow lives on the ground layer and is moved by the same driver as the object.
- **Mark the hero for the gate:** `data-art-hero="<role name>"` on each hero object's group (section 9).

## 7. Production method

1. **Build hero objects as reusable components** (a function, a symbol, a component) with parameters for the things shots change (pose, state, colour variant, lighting side). One source per object: a fix lands everywhere.
2. Order of work per component: silhouette, primary forms, value (three tones), cast and contact shadow, secondary forms, line, texture, tertiary detail, rim light.
3. **Check every component at two sizes before any shot uses it:** at thumbnail size (about 160 pixels wide: the silhouette reads, the three tones still separate) and at full size (the details hold, no broken joins, no gaps between parts, no line that thickens with scale). Save both stills in `ice/review/art/<component>-thumb.png` and `-full.png`.
4. Run the art check (section 9) on the component's test page, then on the style frames.
5. A component that fails is redrawn at the failing step; a filter or an overlay laid on top never counts as a fix for missing value, shadow or detail.

## 8. How each rule reads per style family

Two families can need different renderings of the same rule; both are right, each in its scope (`AGENTS.md` rule 6).

| Family or style | Three tones | Texture layer | Line |
|---|---|---|---|
| Flat vector, isometric, pictogram (`family-graphic-design.md`) | Flat shapes in three tone steps (cel shading), no gradients needed | Light grain or print noise; Swiss and Bauhaus grids may declare none with a reason | Usually no line or uniform |
| Cartoon and cel (`family-cartoon-film.md`) | Cel shadow and highlight shapes per part | Paper, cel or film grain by era | Variable weight ink |
| Drawing and line (`family-drawing-line.md`) | Tone by hatching density or pressure | The paper or board surface | The medium's own |
| Paint and wash (`family-paint-wash.md`) | Wash layers light to dark, or opaque dark to light | The paper and the bristle | Medium-led, often none |
| Print, paper and craft (`family-print-paper-craft.md`) | Plates, halftone area or paper layers with gap shadows | Paper fibre, ink spread, registration offset | Key plate |
| Pixel art (`family-games-toys.md`) | A palette ramp of at least three steps per material | The pixel grid itself (declare none for added grain) | Selective outline in the ramp's darkest step |
| Screen, tech and 3D (`family-screen-tech-3d.md`) | Real lighting (Three.js lights, shadows) or three modelled tones | Material roughness and noise maps | None or uniform |

A style that declares no texture or no cast shadow writes the reason in the style lock and on the hero group (`data-art-texture="none: <reason>"`, `data-art-shadow="none: <reason>"`); the art check prints the reason and turns that measure into a lead instead of a fail.

## 9. The art check (gate)

`node <ice-qa>/scripts/art-check.mjs <page.html | drawing.svg>` (the ice-qa skill; rule and thresholds in its `references/pre-render-lint.md` section 4b). It runs at 05 on the style frames (the earliest stage) and again at 07 on the build. Per hero object it measures distinct fill tones (fewer than 3 fails), shading, the shape count, a texture or grain layer and a shadow. A pass is a floor, not taste: the studio benchmark at 05 (the ice-qa skill, `references/studio-benchmark.md`) judges the craft against real studio work, and the art check numbers feed its character design, lighting and texture axes.

## 10. Writing these rules into a film

The style lock (`style-method.md` section 4) gains five lines, each filled from the brief and the research, never from this file's wording:
- shape language and its reason;
- light direction per scene (or per sequence);
- line policy and widths at delivery size;
- texture layer: what it is, how it is seeded, which surfaces carry it;
- detail density per hero object, and the reference photos the proportions came from (with their URLs and dates).

Sources: Ice founder decision, 2026-10-22; construction, value and light fundamentals as taught across illustration and animation practice, rewritten for code; the material-treatment and character rules of `style-method.md` section 8 (anidoodle, huashu-art-motion, lemo-opuscar).
