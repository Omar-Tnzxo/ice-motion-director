> Adapted from majedphotos/video-ad-editor (MIT, Copyright (c) 2026 Majed Alzaabi), files `references/word-fx.md`, `references/cut-styles.md`, `references/phone-cloud-playbook.md`, `scripts/compose.REFERENCE.html`, and from Omar-Tnzxo video-production-studio `references/talking-head.md`. Changes: translated from Arabic, comments in code translated, numbers kept, Mac-only tooling generalized, author's brand colors removed, dash characters removed. Scope note from imMamdouhaboammar/motion-graphics-skills and motion-interaction-studio ideas (rewritten).

# Kashida (tatweel, U+0640)

Kashida lengthens the connection between two joined letters. In motion it is a display effect: one word stretches on its spoken beat, or stretches so the connection alone passes behind a person. It is never justification filler.

## 1. Where it is allowed

| Use | Allowed in | Banned in |
|---|---|---|
| A single stretched hero word on its spoken beat | Talking-head ad, shorts and reels, social short, kinetic type, hype promo | Sacred text, numbers, Latin words |
| Text behind the person, layered hook | Talking-head ad, shorts and reels (needs a person mask) | Any shot where the person is in a small card |
| Justifying a line, filling width, decorating captions | Never | Every type |
| UI copy in app ad, UI walkthrough | Never (shows the product wrongly) | Every type |

Limit: at most twice per video for any stretch effect. Repeated on every line it turns from "wow" into noise.

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

## 5. Text behind the person (talking-head ad, shorts and reels)

The word is set large and stretched so only the kashida passes behind the speaker's head; letters stay visible on both sides. Requires a person segmentation mask (owned by `ice-edit`).

Rules, at 1080x1920:
1. Letters never go behind the head. The kashida alone covers the head width plus a 36 px margin; the word starts right of the head and ends left of it.
2. The whole word stays inside the frame with 40 px on each side. Shrink the font (down to 44 px) until it fits; if it still does not fit, render the line as a normal caption.
3. 1 to 3 words behind the head; sentence of 1 to 4 words lasting at least 0.85 s; at most twice per video; best on the hook or the peak idea.
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
- Mid-frame of each effect: no letter behind the person, no clipped word, depth order right, clean mask edges (hair, hands, frame bottom) on three hard frames, mask edge change between frames below 0.003 on average.
