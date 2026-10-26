# One-take films: one shape, one world, one camera

Films built without scene cuts: a single element that morphs through every state, or a single world the camera travels. Use when the brief, the direction pitch or the reference calls for "one continuous" film. Typical scope: product launch UI-morph films, app ads, logo stings, loops, explainers on one canvas, art films that travel through paintings.

## 1. Three forms

| Form | What persists | Typical length | Fits |
|---|---|---|---|
| One shape | One element morphs its size, radius and colour through 8-12 states while its content swaps with a short blur | 10-30 s, often a loop | UI showcase, app ad, product launch, social short |
| One world canvas | A layout about 3x the frame (or larger) holds all stations; the camera travels between them; nothing resets | 20-90 s | Explainer, data story, UI walkthrough, whiteboard, collage |
| One travelling actor | A hero object travels through stations whose state it changes | 15-60 s | Brand film, explainer, hype promo |

## 2. One-shape rules

- Every state is the same element. Transitions are morphs, camera moves and zooms into an element that becomes the next scene.
- Springs everywhere, a tiny overshoot at most (damping 0.72-0.9; 1.0 for camera and text); no bouncy easing.
- Leading and trailing edges ride different springs so indicators, knobs and pills stretch (`edgeSplit` in `scripts/springs.mjs`).
- Text inside a morphing container has its own enter and exit timing: exit short and early, enter after the morph starts, so old and new text never overlap.
- A cursor drives every change with real clicks and drags; while held, the value is computed from the cursor position; on release it springs back from wherever it was.
- The camera zooms so each state fills the frame; empty frames are a bug. Pull-backs reveal scale (one item becomes a grid of hundreds).
- Music-first timing: choose the track first, build on its beat grid (about 120 BPM is a common choice, never a default), start on a downbeat, place the drop on the biggest state change; something happens on every beat. Beat analysis is owned by the ice-audio skill.
- Show the state list on the beat grid before writing code.
- Loops: the last frame is the first frame, cursor position and speed included.
- Banned in this form: bouncy easing, particle bursts, glows, gradients on UI chrome, mismatched icon strokes, dead time, template looks.

## 3. One-world rules

- The video lives in a single space and never resets: an element, once drawn, is never redrawn, moved or relabelled without a visible cause.
- Decide the spatial grammar before building and hold it for the whole runtime; break it exactly once, deliberately, for meaning.
- Three altitudes (world, region, detail): move between adjacent ones; jumping from detail to world is disorienting unless it is the payoff.
- Name framings as exact world windows, not scale factors; window boundaries fall between labels; reuse the same window for the same purpose (near-identical framings read as drift).
- Lay out each scene as one picture on the full canvas the way it should look at the end, and let the camera find the close-ups. Put the next element near the one it follows so one shot shows both.
- While a shot holds, every card and label is fully in the shot or fully out of it (arrows and lines may run off the edge); push half-visible neighbour labels out of frame.
- Camera landing is computed from what must be read now (target box plus margin), never hand-typed coordinates.
- A faint lattice on a far layer (a dot grid moving with the camera at depth about 1.2) makes camera moves readable on an empty ground.
- Scenes on one canvas: whiteboard films pan only about 0.23 frame width (about 75 percent overlap) so viewers see the previous block's edge; collage films build objects, relations and camera first, decoration last.
- Every label belongs to its station: it arrives with it and leaves before the camera leaves.
- Long scroll worlds: the camera only moves forward (target = running maximum of the hero position plus a lead, then smoothed), so it never stops and rewinds; check for backward camera motion.
- Time events relative to the interaction (when the hero reaches the station), never as seconds after a segment starts, so walk speed can change without editing every segment.

## 4. One-actor rules

- One simple, readable hero that never disappears or gets replaced (it may change shape for a moment, then return).
- When the hero leaves a station it was part of, the station keeps a dim outline of the empty slot.
- Follow camera: target = blend of hero position (plus about 0.15 s of velocity lead) and a fixed anchor for the current station, smoothed by a critically damped spring (w about 6); anchor weight about 0.7 during an interaction, 0.15 during flights, 0.85 on the payoff hold; the hero never leaves the middle half of the frame.
- Tight during each interaction: the station fills about half the frame width; the hero about 50-70 px on screen at 1080p (at least 24 px when the reveal frames the whole course).
- Payoff hold 0.4-0.6 s fully in frame before the launch to the next station.
- Hops on parabolas with constant gravity, landing on the beat; squash on contact (1.25 x 0.8 for about 60 ms, spring back), stretch along velocity in flight (up to 1.15 x 0.9).
- Slow-motion reveal: warp time so the flight fills the reveal window, slowest at the apex (often 5-10x slower there).
- Loop seam at the hero's landing on the first station: the last frame looks exactly like the first.

## 5. One-take continuity devices

- Dive into a logo with zoom from 1 to 10 and blur, out of the next shot.
- A J-cut leads the picture by 4-12 frames.
- Match cut = same shape, same place and size on the cut frame.
- Forbidden in one-take films: crossfades, unmotivated blur dissolves, resets to an empty frame.

## 6. When not to use a one-take form

- The brief has unrelated topics with no relation to draw (a canvas route would be long and empty).
- The film is read-critical text or legal copy.
- The reference (ice-remake) uses hard cuts as its grammar.
- A one-take film still needs contrast: bursts and rests, close and wide, fast and slow.

Sources: product-launch-motion (v2 SKILL.md, technique.md), community prompt library (one-shape UI morph prompts), Barty-Bart motion-graphics (explainer-engaging, explainer-default, motion-broll), claude-motion-design, herk-edit-kit (video-storytelling), huashu-art-motion (long scroll, whiteboard grammar), group-d explainer engine (camera and layout rules), video-ad-editor (one-take rules).
