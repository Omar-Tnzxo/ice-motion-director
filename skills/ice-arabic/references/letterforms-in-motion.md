> Sources: majedphotos/video-ad-editor (MIT, Copyright (c) 2026 Majed Alzaabi), Omar-Tnzxo video-production-studio and motion-interaction-studio (founder's own). Ideas from imMamdouhaboammar/motion-graphics-skills and commercial-motion-design rewritten in this repo's words, no text copied. Changes: translated from Arabic, merged, restructured, dash characters removed.

# Arabic letterforms in motion

Arabic letters join. Each letter takes an initial, medial, final or isolated shape depending on its neighbors; dots, hamza and diacritics carry letter identity; there are no capitals, and the vertical extent (ascenders, descenders, marks) is larger than Latin at the same size. Latin motion habits break all of this. This file sets the units, patterns, clipping rules, direction and holds for any Arabic text that moves.

## 1. Animation units

| Unit | Status | How |
|---|---|---|
| Line or phrase | Default for headlines and display copy | Split by lines, mask each line, stagger lines by about 0.08 s |
| Word | Default for spoken-word sync and captions | Wrap each whole word in its own element; never wrap part of a word |
| Whole shaped run (word plus attached clitic or punctuation) | Allowed | Treat it as one word |
| Mask reveal across a joined word (the "typing" look) | Allowed | Draw the word fully joined, sweep a mask from its right edge to its left; letters never change shape |
| Connected components of a shaped line (letter groups, dots, marks) | Only for named letter effects, section 3 | Render the whole line shaped, split the rendered pixels or outlines into connected components, animate those, end every frame on the correct joined word |
| Single characters as separate elements | Never | Each wrapped letter falls back to its isolated form |
| Letter-by-letter typewriter | Never, in every film type | The visible shape changes as each letter arrives |

Notes:
- GSAP SplitText: for `ar`, `fa`, `ur`, `ps`, `ckb` and other joining scripts use `type: 'lines'` (or words), never `'chars'`. A published helper that keeps joining with zero-width joiners exists for true character-level needs; use it only after testing with the real copy and its diacritics.
- Highlighting: color or weight changes apply to whole words. A styled span inside a word (and always an `inline-block` one) can break joining.
- Choose the smallest unit that helps meaning. Per-character is not more advanced.
- Typing belongs only inside a real product input, and a real screen recording shows what the app does. In rebuilt UI, reveal Arabic input by word or by mask.

## 2. Arabic kinetic patterns that work

Use these as a menu, never as a fixed sequence:
- masked line rise (see section 4 for the padding trap);
- word-by-word arrival on the spoken cue;
- baseline shift of a word or line;
- large display crop where the word stays recognizable;
- a word becoming the layout (word to layout);
- paper, stamp or card reveal;
- a calligraphic path traced along the letter when the font supports it;
- weight or width change on a real variable axis (never one-axis scaling);
- phrase compression and expansion;
- spoken-word moves on a single word: drop, shake, crack, pulse, slam, kashida stretch (`references/kashida.md`). Moves with overshoot (a drop that settles with a small rebound) follow the bounce policy of the film type in `ice-motion`; with a no-bounce policy, land without rebound.

Fit the rhythm to the film type through `ice-motion`; something should happen about every 2 to 4 s in talking-head reels, and never the same word move twice in a row.

## 3. Letter effects (connected components)

Named effects that move parts of letters, built from a fully shaped line split into connected components so joins never break:

| Effect | What moves | Note |
|---|---|---|
| Dots fall (ijam drop) | The dots drop onto their letters | Banned on sacred text |
| Pen writing (qalam) | A pen traces the shaped outline | Prefer a calligraphic font (Ruqaa style) when loaded |
| Join snap | Letters start isolated and snap into the joined word | The only effect that shows isolated forms, because that is its meaning. Banned on sacred text |
| Kufi grid | The word rebuilds on a square Kufi grid | Needs a Kufi font |

Each effect ends on the exact correctly joined word. Never use any of them on sacred text (`references/sacred-and-cultural.md`).

## 4. Dots, marks and clipping

1. Never crop a letter that is read. A word cut at the frame edge can turn into a different word: a cut alef at the start of a word has done this on delivered films more than once.
2. Dots identify letters (a ya without its two dots reads as another letter). Any overlapping sheet, card, mask edge or object stays above the dot and descender zone of a word meant to be read.
3. A hero crop is allowed only when recognition survives at the final resolution, and it is declared in code (for example a `data-crop="intentional"` attribute) so audits skip it and readers see the decision.
4. Text revealed inside a polygon (light cone, torn edge, shaped mask) must sit fully inside the polygon at its widest reading frame. Rectangle-based audits cannot see this; check stills at full resolution.
5. Keep non-hero copy at least 48 px from every frame edge, more at the top and bottom where platform UI sits (`references/safe-zones-rtl.md`).
6. Give Arabic reveals more line height than Latin; descender and mark zones are deeper.
7. Masked rise trap: padding the mask so dots and descenders are not clipped after arrival makes the mask taller than the word. A waiting word parked just under its own height (for example at 105 percent) then shows through the padding as stray dots and smudges. Hide the waiting word (opacity 0 until its cue) and park it beyond the padded box (for example 130 percent). Example padding from a delivered film: about 0.12 em above and 0.3 em below.
8. Stray marks read as letter parts. Anything dot-like near Arabic (a round-capped path before it draws, a particle, a speck from a parked element) looks like a detached dot. Hide paths until their cue (butt caps avoid the start dot) and keep parked elements fully outside every mask.
9. Every single-line display phrase gets `white-space: nowrap` and a measured width check against the frame. Faces differ in advance width at the same size; switching a word from a sans to a serif display changes its width, so re-measure.

## 5. Blur and filters

- Motion blur hurts small Arabic. Put stronger blur on hero words and objects; keep supporting copy crisp at phone size.
- Do not animate `letter-spacing` or `filter: blur` on word entrances in captions.
- No gradient fill on Arabic text by default (thin joins vanish into the gradient), and no glow on Arabic text unless the brief asks by name.

## 6. Direction of motion

- Compose natively for RTL. Never mirror an English layout mechanically.
- Reading-direction motion goes right to left: fills, wipes, slides, swipes, shimmer sweeps, cursor cuts, page turns, mask wipes on wordmarks. Word cascades and stagger start at the right.
- Never mirror: media timelines, play icons, numbers, clocks and circular timers, chart time axes (in most products), check marks, brand logos.
- Forward progress travels toward the inline end (left in RTL); return travels toward the inline start. UI travel stays small (4 to 24 px).
- GSAP: multiply every horizontal `x` and `xPercent` by a direction sign (`-1` when the computed direction is `rtl`); set `transformOrigin` from the inline start. Staggering words in DOM order already runs right to left because DOM order is logical.
- A useful, optional RTL path: enter top right, travel toward the center, resolve lower left. It is one option, not a template.
- Comparisons: the first item sits on the right, the second on the left. When asking an image model for a two-part layout, name RIGHT and LEFT in that same order.
- Lockups: in RTL, reading starts on the right, so the symbol sits on the right.

## 7. Timing for Arabic text

- Holds: see the scoped row in `SKILL.md` section 3 (0.6 s minimum for any word and caption highlight; 0.9 s for an important standalone line in display-led film types). Payoff words hold at least 0.5 s after they settle.
- Never inherit the durations of a fast Latin reference. Record per line: locale, rendered line count and bounds, reading method, measured read frames, settle frames.
- Rate-based holds: when a hold is computed per character, use the high end of the range (about 0.06 s per character).
- Shorten copy before shrinking it or speeding it past comprehension. Keep an Arabic line readable in one fixation.
- Stagger: lines about 0.08 s apart; settling words in a written hook about 0.045 s apart; sibling elements by reading order, starting at the right.
