> Adapted from majedphotos/video-ad-editor (MIT, Copyright (c) 2026 Majed Alzaabi), files `references/word-fx.md`, `references/cut-styles.md`, `references/phone-cloud-playbook.md`, `scripts/compose.REFERENCE.html`, and from Omar-Tnzxo video-production-studio `references/talking-head.md`. Changes: translated from Arabic, comments in code translated, numbers kept, Mac-only tooling generalized, author's brand colors removed, dash characters removed. Scope note from imMamdouhaboammar/motion-graphics-skills and motion-interaction-studio ideas (rewritten).

# Kashida (tatweel, U+0640)

Kashida lengthens the connection between two joined letters. In motion it is a display effect: one word stretches on its spoken beat, or stretches so the connection alone passes behind a person. It is never justification filler. The one scoped exception is the justified display block of a news reel or a measured reference (section 4b): display text set to one width on purpose, never running text or captions.

## 1. Where it is allowed

| Use | Allowed in | Banned in |
|---|---|---|
| A single stretched hero word on its spoken beat | Talking-head ad, shorts and reels, social short, kinetic type, hype promo | Sacred text, numbers, Latin words |
| Text behind the person, layered hook | Talking-head ad, shorts and reels (needs a person mask) | Any shot where the person is in a small card |
| Justifying a line, filling width, decorating captions | Never | Every type |
| UI copy in app ad, UI walkthrough | Never (shows the product wrongly) | Every type |
| Justified display block (news reel) | News reel (edit type `news-reel`, style family `family-broadcast-news.md`) and any film whose reference measures it: multi-line display blocks (headline stacks, quote and question cards, a programme title with a gap for the head) and end-card lines, built per section 4b; hollow words per section 4c | Captions, numbers, Latin words, sacred text, UI copy, single-line pills (unless the reference stretches them, see the scope rows below) |

Limit: at most twice per video for any stretch effect. Repeated on every line it turns from "wow" into noise.

Scope lines (they replace the rows above only where stated; every other type keeps them):
- The five film types in the first row and the twice-per-video limit hold for the single hero stretch and the behind-the-person effects. In a news reel, and when a reference measures kashida, the justified display block row also holds: the count follows the reference (the measured packages justify every multi-line display block and the end card), is logged with its reason, and the twice-per-video limit does not apply to it. With no reference, a news reel keeps at most twice per video.
- "Justifying a line, filling width: never" stays true for running text and captions; a justified display block is a layout of display text, never applied to a caption or a sentence the viewer reads as subtitles.
- Stretch inside a single-line pill or plate (the sources disagree, both kept): the measured references differ by package: one package stretches short words inside its plates (one stretch in a short word) and letter-spaces a small tag with tatweel, another never stretches inside its pills, and the type study states "never in single-line pills or plates". Follow the reference's own measured habit when there is one; with no reference, never stretch inside a single-line pill or plate.

## 2. Placement rules (never break)

1. Insert kashida only after a letter that connects to the next letter.
2. Never after these non-forward-joining letters: `ا أ إ آ د ذ ر ز و ؤ ة ء ى`.
3. Never between lam and alef (`لا لأ لإ لآ` never split).
4. Diacritics are not letters: find the position from the base letter and place the kashida after its diacritics, never between a letter and its mark. Illustration only: in `تحرّك`, a kashida after `رّ` breaks the word (ra does not join forward); valid spots are after `ح` or after the first `ت`.
5. The next character must be an Arabic letter and not `ء`.
6. A word with no valid point gets no stretch. Give it a pulse instead, or move it to the front line (section 5).
7. Numbers and Latin words never stretch.

## 3. Reference implementation

Valid kashida insertion points (returns string indices where the kashida goes). From `compose.REFERENCE.html`, comments translated:

```js
// Letters that never join forward, an Arabic-letter test, and combining marks (including tatweel).
const NO_FWD = new Set([...'اأإآدذرزوؤةءى']), AR = /[ء-ي]/, MARK = /[ً-ٰٟـ]/;
// Valid kashida positions. Diacritics are not letters: the position is computed from the base
// letter and the kashida goes after its marks. Lam followed by alef never splits.
function kashidaPoints(w) {
  const p = [];
  for (let i = 0; i < w.length - 1; i++) {
    if (MARK.test(w[i])) continue;
    let j = i + 1; while (j < w.length && MARK.test(w[j])) j++;
    if (j >= w.length || NO_FWD.has(w[i])) continue;
    const nx = w[j]; if (!AR.test(nx) || nx === 'ء') continue;
    if (w[i] === 'ل' && 'اأإآ'.includes(nx)) continue;
    p.push(j);
  }
  return p;
}
```

Measuring one kashida unit in the loaded font (difference of two widths, so side bearings cancel):

```js
ctx.font = font;
const k = ctx.measureText('اـــا').width - ctx.measureText('اــا').width; // width of one tatweel
```

## 4. How to stretch

- Stretch by pixels, not by repeating `ـ`. Render the word once with a short kashida, find the thin horizontal run of the kashida in the rendered pixels, and scale a narrow slice taken from its middle (a slice about 0.36 of the kashida width worked) to the target length. Changing the count of tatweel characters per frame makes the word jump and leaves gaps.
- Single hero stretch: use the last valid point of the word.
- Behind a person: try every valid point and choose the one that best balances the visible letters on the two sides of the head.
- Load the font with an Arabic sample before measuring (`references/fonts-and-shaping.md`); a fallback font is about 20 percent narrower and moves every point.
- A stretched hero copy can sit above the caption in the theme's accent color while the caption keeps the plain word.

## 4b. Justified display blocks

Scope: the justified display block row of section 1 (news reel, or a reference that measures it). Browsers do not justify Arabic with kashida reliably (`text-justify: kashida` is not applied in Chrome), and CSS `letter-spacing` breaks the joins (`references/fonts-and-shaping.md` section 3), so the block is built by hand:

1. Break the lines by meaning first (`references/bidi-numerals-line-breaks.md`); a block reads as a headline only when each line is a phrase.
2. Load the fonts with an Arabic sample, then measure each line's natural width in the loaded font (`canvas.measureText` or the rendered box).
3. Target width W = the widest line's natural width. An end card or a card with a designed column uses the column width as W (measured: end-card lines stretched to 593 to 600 px on a 1080 px wide frame; quote card lines 704 and 710 px).
4. Per line, distribute the missing width (W minus the natural width) over its valid points (`kashidaPoints`, section 3): at most one stretch per word, none in a word that has no point, none in numbers or Latin runs. Prefer the line's last word and points after letters of the seen, sad, taa, kaf, lam and baa families; the measured cards use 1 to 2 long stretches per line, spread over 1 to 3 words at most. A line with no valid point keeps its natural width: break the lines again rather than fake it.
5. The last line of a multi-line card may stay natural when the reference leaves it short (measured lines 704, 710 and 563 px); otherwise every line reaches W.
6. Stretch by pixel slice (section 4), never by changing the count of tatweel characters per frame.
7. Animate the width from natural to W on the block's own ease over the frames measured on the reference (measured: all lines grow to one width in 1 to 7 f, 0.04 to 0.28 s at 25 fps, ease out); every line of the block grows in the same frames.
8. End-card lines are all stretched to the same W, so the card reads as one column.
9. Check: every stretch sits on a returned point; at full stretch every justified line is within 1 px of W; the stretched words still read at phone size.

## 4c. Hollow kashida

Scope: news reel or a reference that measures it; one display word (a stretched hero or a word beside a figure), never captions, numbers, Latin, sacred text or UI copy.

A hollow word shows its outline with a faint fill. Stroking shaped Arabic outlines each glyph on its own, so the strokes also draw the inner join lines where joined letters overlap; the word then looks cut into pieces. The fix is an inverted matte:

1. Build the stretched word once (section 4 or 4b) and keep three copies of exactly that shape: a fill copy, a stroke copy and a visible fill copy.
2. The stroke copy is matted by the fill copy inverted (only the stroke outside the letter union survives), which removes every inner join line and leaves one clean outer contour. In SVG: a mask made of a white rectangle with the fill text in black, applied to the stroked text; in canvas: draw the stroke, then the fill with `globalCompositeOperation = 'destination-out'`; from a rendered alpha image: the outline is the alpha dilated by the outline width minus the alpha itself. Draw the stroke at twice the visible outline width, because half of it is removed.
3. The visible fill copy sits inside at 30 to 40 percent opacity (measured), in the same colour as the outline.
4. Check at full resolution and at phone size: no inner line at any join, dots and marks complete, the thinnest join still reads.

## 5. Text behind the person (talking-head ad, shorts and reels)

The word is set large and stretched so only the kashida passes behind the speaker's head; letters stay visible on both sides. Requires a person segmentation mask (owned by `ice-edit`).

Rules, at 1080x1920:
1. Letters never go behind the head. The kashida alone covers the head width plus a 36 px margin; the word starts right of the head and ends left of it.
2. The whole word stays inside the frame with 40 px on each side. Shrink the font (down to 44 px) until it fits; if it still does not fit, render the line as a normal caption.
3. 1 to 3 words behind the head; sentence of 1 to 4 words lasting at least 0.85 s; at most twice per video; best on the hook or the peak idea. Scope line, news reel (edit type `news-reel`): a programme title with long kashida gaps for the head and other text behind the presenter follow the reference's measured count, logged (the matte kit: the `ice-edit` skill, `references/layers-and-isolation.md`, section "3b. Programme matte kit").
4. Full-screen moments only. When the video sits in a card, skip the effect.
5. The normal caption hides while the effect shows, so text never appears twice.

## 6. Layered hook (three layers around the person)

The strongest hook form: the sentence splits by the person's outline.
1. One word above the head, very large, stretched to the full frame width (above the Instagram top band, y 170 and lower, and one third larger than the lines behind).
2. One or two words behind the head or neck (three at most): letters on both sides, kashida alone behind.
3. The rest in front of the body: smaller, no kashida, word by word as spoken.

Rules:
- Heavy fill, thin stroke, hard drop shadow plus a soft shadow, so it reads on any background. Colors come from the palette decided by the `ice-direction` skill in `ice/DIRECTION.md`: the fill takes the palette's lightest ink, the stroke and both shadows its darkest. With no palette decided yet, ask the user or log a D-entry in `ice/DIRECTION.md` before rendering; never another brand's palette.
- Sentence 2 to 8 words, at least 1.2 s; once per video (twice at most); longer sentences use a word range.
- Front text never on the face: the first front line starts under the chin (chest preferred). With no room down to y 1490, shrink; then allow down to y 1600, before the bottom band at 1620.
- Lines entering the right button column (y 1100 to 1750) stay at x 940 or less; the front block is 820 px wide, centered.
- Words that cannot go behind (no kashida point, Latin, numbers) drop to the front line; they are never cut and never removed. Reading order stays above, behind, front. Latin words and numbers keep their order (a product name followed by its version number stays in that order).
- No room above the head: the first word goes behind the head instead.
- Font shrinks to 64 px minimum. Very wide display faces push words to the front because they no longer fit beside the head; a heavier, narrower display face reads closer to the intended look.
- Stability: build one union mask per sentence (average of the frame masks) and compute the person's extent row by row once per sentence, so the layout does not jitter and letters never enter an area the person occupied even briefly. Keep chair backs and objects touching the head inside the head column.
- After a partial effect, the caption shows only the words the effect did not show; a sentence shown entirely by the effect has no caption.
- Stop any hook zoom during the layered moment; the zoom used to erase the text.

## 7. Checks

- Run `kashidaPoints` on every stretched word in the timeline; any stretch outside a returned point fails.
- Justified blocks and hollow words: the checks of sections 4b and 4c.
- Mid-frame of each effect: no letter behind the person, no clipped word, depth order right, clean mask edges (hair, hands, frame bottom) on three hard frames, mask edge change between frames below 0.003 on average.
