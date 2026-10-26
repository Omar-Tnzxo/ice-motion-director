# Remotion: Studio-editable code rules

> Ideas from remotion-dev/skills interactivity guidance (no license file; rewritten in this repo's words, nothing copied). Changes: reorganized as a checklist.

Remotion Studio can edit a composition visually and write the change back into the source. It edits the JSX node that produced an item, so code must be written in a shape Studio can find and rewrite. Apply these rules whenever the user will open the project in Studio or asks for an editable template.

## 1. One written node per editable item

- Every composition, clip, scene, layer or sequence that must be edited on its own gets its own written JSX node with its props inline.
- Use `.map()` or loops only for things meant to be one template (bars, particles). Never for items that need their own name, timing, order or deletion.
- Do not wrap scenes in extra Sequence or AbsoluteFill on a Track; keep layout-only containers as plain HTML; put background and alignment on the scene instance.
- Be selective: too many interactive elements in one component make the timeline messy.

## 2. Inline literals

- Keep `interpolate` calls inline in the `style` prop with hard-coded output ranges, easing and extrapolation. Input ranges may use only `fps`, `durationInFrames`, `width`, `height` and simple multiply or subtract with numbers.
- Style objects are plain inline literals: no constants, spreads, memo or math.
- Fixed one-use text is written inline in the element; variables only for dynamic or reused text.
- Give interactive elements a hard-coded descriptive name.
- Composition id is a string literal; size, fps, duration and defaultProps inline with no type assertions; defaultProps as an inline object literal (never a variable, import, spread, helper or `satisfies` wrapper).
- Effects arrays are inline with hard-coded parameters and a stable shape; when one version needs effects and another does not, render two separate elements.

## 3. Interactive factory and schema

- Make scenes and reusable elements with Remotion's interactive component factory; set layout explicitly (full-frame for scenes, none for bounded elements); register the same exported reference (not the inner component) as a composition with representative inline defaults.
- Schema fields need a default and a description. Transform and opacity fields are added automatically: do not declare them. Built-in schema fragments exist for text, background, border radius, border, captions and children.
- Keyframable field types: number, color, boolean (hold), font weight, transforms, UV point, SVG path. Not keyframable: string, array, asset, font family, captions.

## 4. Connected compositions and pre-compose

- A connected composition opens without its parent, so it carries its own typography and font loading and takes background and alignment from its registration defaults. Verify by opening it standalone. Match the parent's fps and size unless intended.
- A "pre-compose" request is done only when the markup is extracted into a named component AND registered as its own composition with size, fps, duration and equivalent defaults.

## 5. Paths and captions

- Use Remotion's editable Path element for SVG paths; static path data inline; morph with the multi-path interpolator inline; evolve strokes with dasharray and dashoffset.
- Clip and caption grouping, source-relative caption timestamps, whitespace-sensitive words and the page-break flag: the `ice-type` skill, `references/caption-timing-and-truth.md` section 5.
- Remotion shape for that group: the video and its captions sit in the same Sequence, with `from` set on the group; each clip's captions are an inline array on its own captions node, so Studio can edit them.

## 6. Timeline editing structure

- Clips that move independently: place each video directly with name, `from`, trim and duration inline (gaps and overlaps allowed).
- Clips that must stay adjacent: TransitionSeries sequences with hard-coded name and duration, never `from`.
