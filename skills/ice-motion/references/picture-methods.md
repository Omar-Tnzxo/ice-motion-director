# Picture methods: imagery that moves like film, not like sliding pictures

The one home for where a film's imagery comes from and how a picture element moves. Every other skill points here
and does not restate it (lessons L75). Code engines stay the renderer; this file is about what they render.

## 1. The banned look

The film's imagery hand-drawn as SVG or canvas code (flat fills, simple shapes, clip-art people, a drawn phone) and
moved by whole-layer translate, scale, rotate or opacity, like pictures sliding over a background. The owner's ban
(2026-11-01, verbatim in `docs/maintainers/lessons.md` L75): drawing as SVG code and moving it as if moving pictures
is primitive; professional animation methods exist besides drawing a vector in code and moving it crudely.

- Not banned: official brand vector files (logos, marks, the brand's own icons) used untouched; kinetic type; a
  captured or rebuilt real interface; a diagram whose lines draw on with meaning. They still meet the motion bar
  (section 5) when they move.
- Banned even when the drawing itself is careful: a drawn hero that only ever moves as one piece.

## 2. The model: the 9/10 remake

The remake the owner rated 9/10 is the method to copy, not its look:

1. Real official brand files, used as supplied, each with its manifest row and hash.
2. Real CC0 or licensed photos picked for the role they fill and matched in light and colour to the shot (grade,
   white point, grain), never a stock photo dropped in as is.
3. An AI background-removal cutout so a subject can leave its frame, cross an edge and sit on its own plane.
4. The real interface rebuilt with the brand's measured fonts and spacing, animated per element.
5. A camera measured from a professional reference with optical flow (`skills/ice-remake/references/measuring.md`),
   with directional motion blur matched to the reference's sharpness at that speed.
6. Per-frame choreography of text, icons and bars: every element has its own timing, ease and cause.
7. A reference-over-ours comparison after every shot, fixed before the next shot.

## 3. The imagery ladder

The first rung that fits the brief wins; the craft plan's `imagery` entry names it (the `ice-direction` skill,
`references/treatment.md`, section "Craft plan"). Sourcing and licences: `skills/ice-assets/references/sourcing-and-licenses.md`.

1. The user's material and official brand files.
2. Real photos and footage, matched in light and colour to the shot.
3. Designer-made Lottie and licensed layered illustration (separate parts, not one flat image).
4. AI imagery or AI video through the project's providers (user-initiated, `skills/ice-assets/references/ai-media-policy.md`);
   vectorized or cut into layered parts when it must move by parts.
5. 3D with lighting: licensed models, real materials, shadows (`depth-and-3d.md`, the `ice-engines` skill).
6. Hand-coded drawing, last, only under section 6.

## 4. The motion toolbox: per element, not per layer

| Method | What it gives | Owner of the how |
|---|---|---|
| 2.5D parallax from cutouts under a measured camera | planes at depth, depth of field, motion blur from the camera's speed | `depth-and-3d.md`, `camera.md`, `motion-blur-and-clock.md` |
| A 3D camera through space with lighting | real occlusion, light that changes as the camera moves | `depth-and-3d.md`, the `ice-engines` skill |
| Cutout people and products | a subject that crosses frame edges and planes | `skills/ice-edit/references/layers-and-isolation.md` |
| Element-level animation | secondary motion (parts lag the driver), overlap and follow-through, squash and stretch where the material allows | `physics-and-morphing.md` |
| Shape change | morph, path deform, mask growth, draw-on with a cause | `physics-and-morphing.md`, the `ice-lottie` recipes |
| Rigged parts | pivots, limbs, lids, hands, frame-by-frame pose swaps | the `ice-lottie` skill, `references/recipes-scene.md` |
| Light events on the element | sweeps, reflections, shadows that travel with it | `composition-and-staging.md`, `depth-and-3d.md` |
| Per-frame choreography for type and UI | each element with its own timing, ease and cause | `measured-motion.md`, `cursor-and-ui.md` |
| Moves measured from a reference | camera paths and timings copied as numbers | `measured-motion.md`, `skills/ice-remake/references/measuring.md` |

## 5. The motion bar

A moving element that is a still picture (a photo card, an icon, a drawn object, a product shot) gets at least one of:

- an internal change during its move: parts, shape, light, focus or texture change;
- a camera relationship: a parallax plane, depth blur or motion blur from the camera's speed;

else it does not move (it holds, or the cut carries the change). Measured on the render by the `ice-qa` craft gate
("moving pictures", `skills/ice-qa/references/frame-checks.md`) from stage 07, and on style frames by the art check's
`parts` measure (`skills/ice-qa/references/pre-render-lint.md`). Never lifted.

## 6. Hand-coded drawing as the main imagery

Allowed only when the craft plan's `imagery` entry says `code-drawn` (or `mixed` with code-drawn heroes) with a
reason and its source: the user's own words, a style the user chose by name, or the reference. Then
`skills/ice-styles/references/code-illustration-craft.md` and the art check hold, and the motion bar of section 5
still holds with no exemption. A drawn style's process (strokes, plates, halftone, cel) takes its input from a real or
AI source image or a 3D render wherever it can, and its characters are rigged parts.
