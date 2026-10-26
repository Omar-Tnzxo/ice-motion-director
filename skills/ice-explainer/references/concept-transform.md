# Mechanism, math, scale and machine explainers

Use when the narration explains how something works inside. Grammar specs (colors, stroke widths, measured easings) are in `ice-styles`; easing math in `ice-motion`.

## 1. Concept transform (one structure turning into the next)

- Each shot names "who turns into whom". With no transform object, use another grammar.
- The first frame is the object itself (axes, grid, curve, shape); titles and formulas come later.
- At most two points on screen at once; a third needs earlier ones to become part of the picture or leave.
- A color table first: at most four semantic colors, and symbols in formulas share the color of their objects. Never change the color coding midway.
- Hold still during waits: no slow push, breathing or floating.
- Pacing: a single animation 1 to 3 s plus about 1 s of wait; one concept 8 to 20 s.
- Speed table (narrated math films): title 1.5 s plus 1.0 s wait; key equation 2.0 plus 2.0; transform 1.5 plus 1.5; supporting label 0.8 plus 0.5; fade out 0.5 plus 0.3; the "aha" 2.5 plus 3.0. A 2 s pause after a key reveal is never wasted.
- If you would explain it "first X, then Y, then Z", animate it. If you would explain it by pointing at parts of one picture, keep it static and point.
- Five boxes with clear labels beat twelve with abbreviations; merge "X" and "the output of X".
- Complex systems: zoom into one part, explain it, return to the whole.
- Scene durations: title 3 to 5 s, concept 10 to 20 s, equation 15 to 25 s, algorithm step 5 to 10 s, aha 15 to 30 s, conclusion 5 to 10 s.
- Vary consecutive scenes (dominant color, layout, entry, weight); no two identical in a row.
- Avoid: bloom and navy gradients that read as a tech slide deck; linear or generic easing with many fast animations.
- Text inside math engines: Latin monospace only where the engine's text renderer kerns badly; Arabic needs its own text path (`ice-arabic`, `ice-engines`).

## 2. Scale world

- Write the visual metaphor first: the abstract concept as a concrete object (cell, gear, pipe, city, water drop); never only a glowing ball with labels.
- At least one state change per sentence (pop, morph, dive, pull out). Two sentences with no change: add an event, not floating.
- The subject settles and holds; only the environment (distant particles, clouds) keeps moving gently.
- Before diving into an object, the target holds at least 0.3 s and lights up; zoom is interpolated logarithmically; never zoom a bitmap.
- Pull-outs reveal scale and should be at least as common as push-ins; zooms are travel and reveals, not fillers.
- Callouts: thin leader line then typed text; one callout per sentence; hold about 3 s.
- Avoid: everyone breathing to look "alive"; outlines or mid-gray grounds that slide the look into corporate flat illustration.

## 3. Machine metaphor

- List the concept's actions, then find a made object a general viewer recognizes that performs those same actions step for step (illustration only: a turnstile for "one at a time", a sieve for a filter, a ratchet for "only forward", a sluice for a queue). Say both descriptions aloud; if they do not line up step for step, pick another object.
- One part carries the story and alone gets the accent color.
- One model of time drives every part; nothing floats and nothing idles. Richness comes from construction, not surface pattern.
- Words on the machine come from its live state, not from a script running beside it.
- Optionally two films: the machine being drawn, then the machine running.

## 4. Technical diagram

- Define the final topology first; reveal in the order the viewer should understand the system.
- Choose the structural relation and keep it: chain for sequence, bracket for part and whole, orbit for convergence, radial for a system, grid for comparison, rows for evidence.
- Decide what lines mean before drawing any. Arrows only where direction is ambiguous.
- Technical traces draw near-linear; nodes and labels activate with easing. Connectors draw before nodes light; a gray to accent recolor is itself a narrative action.
- Labels never appear before their target. No empty rounded rectangles, no generic node mesh, no fake complexity.
- A diagram reveals a mechanism; a chart proves a claim; motion shows what changes.

## 5. Continuous action (one hero, one journey)

- One hero from the first second to the last; it never leaves the frame; the world changes around it.
- Always moving (looping parallax layers, speed lines), but slow the background for reading instead of stopping.
- Numbers are props in the world; the hero passes in front of them; changing numbers roll.
- Change viewpoint instead of cutting (side, head-on, banked, top-down); never three consecutive scenes from the same angle. Each fact gets its own instrument (a gauge, a map, a profile, an interior view).
- A route map simulation is the cheapest monotony breaker: marker on the path rotated to its tangent, stations popping as reached, map camera starting close then widening, totals after the zoom-out.
- Comparisons happen inside the same world, not in split panels. Keep the hero's silhouette, color and frame position constant.

## 6. Numbers inside mechanism films

- Write the chart's one point first; its title is that conclusion; annotate only that point.
- Data grows when its word is spoken, never all at once after a title.
- Bars start from zero; a non-zero axis is stated on screen; one highlight color, the rest gray.
- Hold at least 0.5 s after a number settles.
- Full chart grammar: `ice-styles`.
