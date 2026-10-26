# Whiteboard, hand-drawn and pen explainers

Use when the narration reasons step by step, or teaches a method by hand. Palettes, stroke styles and drawing media come from `ice-styles`. Rules marked "synthesis" combine several sources rather than one measured reference.

## 1. Pick one board grammar per film

The big-board and page-per-idea variants (camera moves per minute, board pans, whips, cuts per minute, look, hand, writing speed and sync, line widths, ending, sound, common mistakes) are owned by the `ice-styles` skill, `references/narration-grammars-1.md` section 4. This file adds the build rules the owner does not hold and the pen lesson grammar.

| Grammar | Shape | Fits |
|---|---|---|
| One big board | Everything accumulates on one large canvas; the camera travels; a final pull-out shows the whole map | "Why" chains, arguments, talks |
| Page per idea | One sheet per page, hard cut to the next page | Short physics or science answers |
| Pen lesson (synthesis) | A board that fills in teaching order; erase or new page between problems; camera static or very slow, no decorative moves | Worked problems, math, drawing lessons |

Never mix grammars in one film.

## 2. Sync with the voice

- Writing sync (say a line, write a line, write slightly behind), pre-drawn setups, transitions on topics, drawing through pauses: the `ice-styles` skill, `references/narration-grammars-1.md` section 4. Reading time counted from the last item finishing: the `ice-type` skill, `references/reading-time.md` section 2.
- A noun picture may drop in about 0.3 s after its word.
- The first stroke of a block syncs with the camera's arrival.

## 3. Drawing speed (scoped)

| Context | Speed |
|---|---|
| Dense fast board (measured from real whiteboard films) | The `ice-styles` skill, `references/narration-grammars-1.md` section 4 (writing speed, icons, heads, stroke time, complex illustrations never drawn on camera). Real films are sped up 5 to 12x |
| Readable lesson board (engine guideline) | Text 7 to 10 characters/s; icon lines about 1500 to 2500 px of line per second; a character figure 1.0 to 1.3 s; hold each finished drawing 0.3 to 0.8 s, longer for the key point |

## 4. Drawing on (scoped)

- Lesson and engine-built boards: everything is drawn on with the hand; nothing pops in.
- Dense fast boards (keyword pops), zigzag glyph reveals, erase or keep but never fade: the `ice-styles` skill, `references/narration-grammars-1.md` section 4.

## 5. The hand

- The hand (entry, frame share, exits, glides between strokes, never hiding a read, checking the end frame): the `ice-styles` skill, `references/narration-grammars-1.md` section 4.
- End each block with at least 0.4 s hand-free.

## 6. Composition

- Planning the final image first, groups per block, pan overlap, wordiness, rotating block templates, shape checks and straight-segment rectangles: the `ice-styles` skill, `references/narration-grammars-1.md` section 4.
- Framing is computed from the block's stroke bounding box plus margin; push half-cut old text out of frame.
- Key content top-left to center; pen order left to right, top to bottom.

## 7. Line and color

- Marker width, line types and the accent share: the `ice-styles` skill, `references/narration-grammars-1.md` section 4. Each accent has one meaning (illustration only: problem, good, product); color states: the `ice-direction` skill, `references/color.md` section 6.
- Zooming past about 2x thickens lines; build close-ups at larger size near zoom 1.
- Characters at least about 30 px tall in medium shots; text at least about 90 px at zoom 1 on a 1080p board; keep drawings out of the caption band while a caption shows.

## 8. Ending

Closing reveal of the whole board: the `ice-styles` skill, `references/narration-grammars-1.md` section 4.

## 9. Sound

Music under speech for whiteboard and lecture films: the `ice-audio` skill, `references/mix-and-master.md` section 3.

## 10. Pen lessons and worked problems (synthesis)

- Write the question on the board before demonstrating.
- Geometry before algebra: show the shape first, the equation second. Never show a symbol before showing what it stands for.
- Pen colors are concept colors and stay fixed for the film (at most four).
- Dim and reveal for formulas: the full expression faint, terms lit one at a time as spoken, finished terms dimmed.
- One concept on screen at a time; marks are drawn on, never faded in; the diagram assembling is the explanation.
- Drawing lessons: 6 to 8 steps in teaching order (placement and gesture, big shapes, construction, value masses, local color, edges and details, accents), each with what to look at, how, and the common mistake; construction lines on their own layer, erased to a faint ghost later; corrections are shown as authored events (old mark erased first). A numbered reveal with captions is not a lesson.
- Recreating a user's own drawing is labeled as one way to draw it, not a record of how it was drawn.

## 11. Common mistakes

The `ice-styles` skill, `references/narration-grammars-1.md` section 4 (common mistakes and transitions that do not belong to the grammar).
