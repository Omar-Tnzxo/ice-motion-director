# Type effect specs (numbers for named effects)

Merged from heygen-com/hyperframes (Apache-2.0: animation rules 3d-text-depth-layers, asr-keyword-glow, context-sensitive-cursor, css-marker-patterns, discrete-text-sequence, dynamic-content-sequencing, gradient-text-sweep, hacker-flip-3d, vertical-spring-ticker, counting-dynamic-scale, shimmer component, registry catalog), the launch-motion group (MIT: odometer, counters, underline trap), Tejashmakwana/motionmaxxing (Apache-2.0), alchaincyf/huashu-art-motion (MIT: whiteboard, explainer grammars), edenfunf/reelmimic (MIT), yihui-dev community skills (vox-explainer highlights), Barty-Bart motion-graphics (MIT), plus ideas restated from Vincentwei1021/anything2explainer. Restructured; numbers kept. Use these only when the storyboard names the effect.

## Depth and glow

| Effect | Spec |
|---|---|
| 3D text depth layers | 4 to 6 layers; offsets 1 to 3 px (over 4 px reads as glitch); back layer alpha 0.6 to 0.85 stepping 0.08 to 0.15 to a floor of 0.1 to 0.2; hero 200 to 340 px; cascade 0.04 to 0.10 s; back layers never more saturated than the front; color via rgba, not opacity; no `text-shadow` alongside layered depth; no per-letter animation on top of the stack |
| Keyword glow synced to ASR | One linear driver over all words; attack 0.1 to 0.25 s, release 0.2 to 0.5 s, rest 0.15 to 0.4 s (karaoke 0.05 to 0.2); blur 15 to 25 px (karaoke 30 to 45); scale boost 0.03 to 0.10 (karaoke 0.15 to 0.25); karaoke style recommended for narration; brand word window 1.5 to 2x a normal word; glow via `text-shadow`, not `box-shadow`; climax dwell at least 1 s |
| Hacker flip 3D | Font 6 to 10% of the frame's shorter side; flip 0.4 to 1.0 s; character stagger 0.03 to 0.08 s; reveal threshold 0.5 to 0.7; flicker 3 to 6 frames per glyph swap; `perspective` on the scene root required; a ghost placeholder; no decorative chrome (the flip is the beat); secondary label 56 to 72 px caps |
| Gradient text sweep | Gradient span 200 to 400%; sweep 1.2 to 3 s linear; word lag 0.25 to 0.5 s; hue range 40 to 180 degrees; `background-size` over 100%; percent axis inverted; both `-webkit-background-clip: text` and `background-clip: text`; settle by crossfade, never by tweening color stops; no CSS keyframe shimmer. Verify in the actual capture: some capture paths render clipped-background text invisible; fall back to solid fills plus `text-shadow` bloom |
| Shimmer sweep | Position -20% to 120%, 1.2 s `power2.inOut`, stagger 0.15; width 20%, angle 120 degrees |
| Text over blur in cuts | Text-scale blur peak about 10 px (20 px smears into illegibility); both sides of a cut use the same peak; blur the wrapper, never the children |
| Texture on text | Masks for textured text; drop shadow on the wrapper, not on masked text |

## Sequences and counters

| Effect | Spec |
|---|---|
| Dynamic content sequencing (rotating entries) | Base 0.6 to 1.5 s per entry plus 0.03 to 0.06 s per character (lean high for wide-character scripts); hold mid entries 0.5 to 1.0 s, final 1.0 to 2.0 s; 3 to 6 entries; swap DOM only on the entry transition; `min-height` on the body |
| Discrete text sequence | Discrete jumps are instant; blink 0.5 to 0.8 s per cycle; see `kinetic-type.md` section 7 for typing |
| Vertical spring ticker | Item height about font size x 1.25 = container height exactly; 1 to 4 steps of 0.3 to 0.7 s spaced 0.3 to 0.5 s (spacing at most the step duration so springs overlap); bounce 1.4 to 2.5; sum the springs in one update; never update items via `innerHTML` between steps; tabular numerals |
| Counting with dynamic scale | 2 to 3 digits ideal; start size 40 to 60% of the end size; count 1.2 to 2.5 s (`power3.out` preferred); suffix 0.3 to 0.6 s with a back ease factor 1.4 to 2.0 after the count; tabular numerals mandatory; never set font size in the update; round, do not floor; no back or elastic ease on the count itself |
| Counter tweening | Tween a proxy object with snap (without it the label flickers with floats); ease to the exact final integer; digits near linear with a soft landing; scale grows 0.04 s before the digits; count only while the mechanism on screen changes it |
| Odometer | Digit at place p: `floor(v / 10^p) % 10 + max(0, (v % 10^p) - (10^p - 1))`; clip vertically only (`clip-path: inset(0 -80px)`); size each slot to its final glyph (proportional digits jump) |
| Spring counter (Remotion-style) | Damping 30, stiffness 60, tabular numerals |

## Marks and highlights

| Effect | Spec |
|---|---|
| Marker patterns | highlight (marker sweep), circle (hand-drawn ellipse), burst (about 12 lines at 30 degrees, length 40 to 80 px), scribble (control y 0 to 24, about 25 to 50 px half-wave), sketchout (rectangle outline). In captions, cycle modes every 2 to 3 groups (high energy), 3 to 4 (medium), 4 to 5 (low) |
| Article highlight | Text at readable size (not zoomed); the marker band grows left to right via `background-size` with `box-decoration-break: clone`, swept on after the text settles, never pre-applied |
| Highlight bar | Bar size 0% to 100% in about 0.4 s with a stepped ease; circles draw on via dash offset in about 0.4 s |
| Underline trap | Box bound to the word (left minus 6 px, width plus 16 px), `pathLength="100"`; measure with offset metrics, not transformed rects; a tight inline-block nowrap span |
| Selection boxes | 4 to 5 frames each with one empty frame between |
| Hand-drawn loop | 5 px stroke, about 9 poses at 2-frame holds on a 12 fps clock over 0.75 s |
| Dim and reveal (equations, lists) | Full content at opacity 0.2, highlight term by term, dim finished terms to 0.5 |
| Focus dim spotlight | Target unchanged, the rest dimmed up to about 0.55, focus jumps in about 0.2 s, restore after |

## Drawn and written text

| Effect | Spec |
|---|---|
| Whiteboard writing | Body about 16 characters per second; opening title about 7.5; voice about 13 characters per second, so writing roughly matches speech; text 7 to 10 characters per second in drawn styles (a character 1.0 to 1.3 s); hold each finished drawing 0.3 to 0.8 s; end with at least 0.4 s hand-free. Line width 0.6 to 0.7% of frame height, hatching about 0.3%, title cap height about 5.5%. Board content is erased or kept, never faded. Line types fixed: solid happened, dashed planned, dotted leader |
| Glyphs without stroke-order data | Reveal with 3 zigzag rows per glyph with the pen tip moving along (the pen leads the line); some keywords pop without the hand (0.3 s `backOut(2.2)`) |
| Timeline titles | Typed about 13 characters per second with a full-width rule; quotes in a handwriting ink bleed of about 2 s |
| Crayon and storybook write-on | 16 characters per second; one short sentence at least 1.4 s on screen |
| Lettering as strokes | Draw lettering as strokes (single-stroke gothic capitals, pointed-pen script) so no font is loaded; size drawn captions for the smallest delivery shape |

## Lottie text

- Native text: put the font file next to the Lottie JSON; the declared family must equal the font's real embedded family name, not the filename; a missing font renders the layer transparent (the classic blank-text failure).
- Text slots by default for headlines, hooks, titles, taglines, CTAs, lockups, product and feature names, short status callouts. Leave a layer unslotted when its exact string controls layout or timing (code rows, hand-spaced lists, cursor offsets, masks, per-character reveals, tiny labels).
- Point text for glyphs, digits, choreographed type, logos and code rows; box text for editable multi-word slots (top aligned, no vertical centering; height does not clip).
- Vector text placement: `capEm = capHeight / unitsPerEm` (fallback about 0.7; x-height about 0.52 em for all-lowercase); `baseline = cy + cap / 2`.
- Convert to paths when exact rendering matters and font support is uncertain. Other Lottie authoring: the `ice-lottie` skill.
