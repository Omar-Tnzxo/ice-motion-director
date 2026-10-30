> Adapted from diffusionstudio/lottie (MIT, Copyright (c) 2026 Diffusion Studio Inc.). Changes: "verify in Skottie" scoped to the delivery target; added the RTL wipe note and the official-vector intake rule; replaced dash characters.

# SVG Compatibility

Use this reference whenever the source artwork is SVG or the output depends on
SVG-like path behavior.

## Prevention-First Intake

- Use the official or user-supplied vector of a brand mark. Never redraw a mark
  that already exists as SVG, AI, PDF or a Lottie/After Effects export: point at
  that file and convert it. Raster-to-vector fitting (`logo-pipeline.md`) is
  only for a raster the user owns when no vector exists.
- Inspect the `viewBox`, width, height, coordinate origin, groups, masks,
  gradients, style tags, and text before animating.
- Preserve the intended viewBox and scale the Lottie composition around it.
- Inline or resolve CSS-dependent styling. Avoid external classes, inherited
  styles, web fonts, CSS variables, and filters that Skottie may not match.
- Keep layer names meaningful when splitting paths for animation.
- Compare the settled Lottie frame against the source SVG before finishing.

## Geometry Cleanup

- Resolve nested transforms into path/group coordinates when practical.
- Expand strokes to fills when stroke joins, caps, dash behavior, or scaling may
  render differently in Skottie or downstream players.
- Keep strokes as strokes when trim-path drawing is the animation itself, but
  verify cap/join behavior.
- Flatten unnecessary groups, but keep semantically useful groups for animation
  control.
- Avoid fragile boolean intersections when a simple separate path stack is
  visually equivalent.

## Fill Rules And Compound Paths

- Watch self-intersections, compound paths, and holes. Even-odd and non-zero
  fill rules can differ after conversion.
- Prefer clean compound paths with explicit intended holes.
- If a shape relies on overlapping subpaths to cancel areas, consider splitting
  or rebuilding it into simpler visible shapes.
- Verify holes at frame `0`, during reveal, and at the settled frame.

## Masks, Clips, Gradients, And Effects

- Use masks and clip paths only when needed; simple grouped shapes are safer.
- If a mask moves, check all masked frames for popping or disappearing content.
- Prefer simple linear/radial gradients. Provide solid fallback shapes if the
  look is critical.
- Rebuild SVG filters, shadows, blurs, and blend modes as simple Lottie shapes
  or restrained effect layers where possible.
- Align crisp icon geometry to avoid fuzzy fractional-pixel edges.

## Text And Morphing

- Convert SVG text to paths when exact typography matters or font availability is
  uncertain.
- Keep text editable only when the player text-slot behavior is the main need.
- Avoid path morphing unless source and target paths have compatible vertex
  structure and direction.
- For incompatible morphs, use masks, crossfades, staggered replacement, or
  layer assembly instead.

## Renderer Differences

- Browser SVG, Skottie, and downstream web playback may disagree on
  intersections, masks, gradients, strokes, and unsupported effects.
- Verify in the delivery target's renderer as the source of truth, and in
  Skottie as the reference when it is available.
- For website export risk, prefer explicit fills, simple masks, local assets,
  and fewer renderer-specific features.

## Animation Strategy

- For logos, separate mark, wordmark, accents, and background policy.
- For icons, animate semantic parts rather than arbitrary path fragments.
- For diagrams, preserve reading order and trace paths in the direction users
  should understand them.
- Wipes, fills and sweeps follow the reading direction: right to left for
  Arabic, Hebrew, Persian and Urdu content. Clocks, media timelines, numbers,
  check marks and logos never mirror.
- For generic SVGs, first identify what should move: path drawing, reveal masks,
  layer assembly, color transition, or transform choreography.
- Keep transparent output by default unless the user requests a full-frame
  background.

## Verification

- Compare the settled Lottie frame against the source SVG at matching scale.
- Check frame `0`, the main action frame, and the settled frame.
- Look for holes filling incorrectly, clipped strokes, gradient jumps, masked
  areas disappearing, and intersections rendering differently than the source.


## Lottie Spec Map

> Adapted from diffusionstudio/lottie (MIT, Copyright (c) 2026 Diffusion Studio Inc.). Changes: "verify in Skottie" scoped to the delivery target; added the lottie-web transform note from AbubakrChan/product-launch-motion (MIT); replaced dash characters.


Use this reference when authoring or debugging Lottie JSON structure. It is a
curated map of the upstream spec for this project, not a replacement for it.

Upstream specs:

- https://github.com/lottie/lottie-spec/tree/main/docs/specs

### Core Structure

- Top-level documents should include `v`, `fr`, `ip`, `op`, `w`, `h`, `nm`,
  `assets`, and `layers`.
- `ip` is inclusive and `op` is exclusive. `ip: 0`, `op: 90`, `fr: 60` renders
  frames `0..89`.
- Prefer a meaningful top-level `nm`; the player shows it as the canvas label.
- Keep assets local to the scene folder and reference images by bare filename in
  `assets[].p`.

### Properties And Keyframes

- Static properties use `{ "a": 0, "k": value }`.
- Animated properties use `{ "a": 1, "k": [keyframes] }`.
- Keyframes must be sorted by ascending `t`.
- Non-hold interpolation should put `o` on the start keyframe and `i` on the
  destination keyframe; the final keyframe does not need an outgoing `o`.
- Scalar animated values use arrays in keyframes, for example `"s": [45]` for
  rotation or opacity.
- Color values are RGB or RGBA floats in `0..1`; opacity values are `0..100`.
- Easing handle `x` values are `0..1`; `y` values may exceed that range for
  controlled overshoot.
- A cubic-bezier `(x1,y1,x2,y2)` splits across two keyframes: it is the
  **outgoing** handle of the start keyframe `o:{x:[x1],y:[y1]}` and the
  **incoming** handle of the end keyframe `i:{x:[x2],y:[y2]}`.
- Overshoot: prefer a short settle-back keyframe past the target; the compact
  alternative is pushing the end `i.y` above 1. Anticipation: push the start
  `o.y` below 0.

### Layers

- Shape layers use `ty: 4`.
- Image layers reference entries in `assets`.
- Layer visibility is `ip <= frame < op`.
- Parent transforms compose through `parent` references. Avoid cycles.
- Mattes, masks, precomps, and time remap are valid but more fragile; use them
  only when simpler shape/layer structure will not produce the result.

### Shapes

- Group related shapes with `ty: "gr"` and put the group transform
  `ty: "tr"` last in the group's `it` array.
- Styles apply to shapes that precede them within the current scope. A shape
  without an applicable fill or stroke will not render.
- Shapes render in reverse stack order inside groups. Verify visually when layer
  order matters.
- Common primitive types:
  - rectangle: `ty: "rc"`
  - ellipse: `ty: "el"`
  - path: `ty: "sh"`
  - polystar: `ty: "sr"`
  - fill: `ty: "fl"`
  - stroke: `ty: "st"`
  - trim path: `ty: "tm"`
  - group transform: `ty: "tr"`

### Slots

- Define reusable values in top-level `slots`.
- Reference a slot with `sid` on a compatible property.
- Slot type is inferred from the slot value. Keep slot values compatible with
  every property that references that `sid`.
- If a property has a missing `sid`, renderers may fall back to the inline value
  or a type default. Do not rely on missing slots.

### Asset And Renderer Notes

- Image asset dimensions should match the expected `w` and `h` bounds when
  possible.
- SVG, masks, gradients, blend modes, and intersections can differ between
  renderers. Verify in the delivery target's renderer (Skottie as reference
  when available).
- Avoid expressions or renderer-specific extensions unless the player explicitly
  supports them.
- lottie-web: an animated multi-dimensional layer transform can silently blank
  the whole layer. When the target is the web, inspect every animated layer at
  its first and last keyed frames in lottie-web and restructure (for example
  split the property or move the motion to a parent) if a layer vanishes.
- To cue a layer later, shift its keyframe times; do not rely on moving the
  layer's start-time field.
