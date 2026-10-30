> Sources: majedphotos/video-ad-editor (MIT, Copyright (c) 2026 Majed Alzaabi), Omar-Tnzxo video-production-studio and brand-identity-studio (founder's own), heygen-com/hyperframes (Apache-2.0), alchaincyf/huashu-art-motion (MIT). Ideas from imMamdouhaboammar/motion-graphics-skills rewritten. Changes: translated, merged, author's default fonts turned into options, dash characters removed.

# Arabic fonts, sizes and font checks

Font licensing and file sourcing belong to `ice-assets`; pairing decisions go through `ice-direction`. This file holds what is specific to Arabic and to multi-script films.

## 1. Selecting a face

1. Fonts the user supplies or the project holds come first (ask for brand font files). Check that they cover Arabic glyphs and the weights the film needs.
2. Otherwise follow the font-source order in the `ice-direction` skill, `references/type-pairing.md` section 1: installed system fonts and Google Fonts are one pool with no fixed order, and the Arabic family that suits this film best wins (Google Fonts, with Fontsource and github.com/google/fonts as no-key routes to the same open families, is a disclosed network call made without a question; with the offline switch on, choose from installed system fonts and the user's font folders only). Every candidate must cover the script at every weight used. Families seen in the sources, all SIL OFL (illustration of range, not defaults; the fingerprint check in `ice-qa` blocks repeating the last project's choice):

| Family | Character | Typical role |
|---|---|---|
| Cairo (variable) | Contemporary sans, wide weight range | Display or text |
| IBM Plex Sans Arabic | Neutral, technical, has a Latin sibling | Text, UI, mixed copy |
| Noto Kufi Arabic (variable) | Geometric Kufi | Display, Kufi grid effects |
| Noto Sans Arabic | Neutral Naskh-based sans | Text |
| Readex Pro (variable) | Wide, modern, Latin sibling | Display, mixed copy |
| Tajawal | Geometric sans, light to black | Text and display |
| Lalezar | Single heavy display weight | Hooks, layered text |
| Aref Ruqaa | Ruqaa calligraphic | Pen-writing effects, accents |
| Amiri Quran | Uthmani Quranic | Quran text only |

3. One family, two weights is a strong default for captions; a display plus text pair for films. The font-role map is a contract for the whole film, never swapped scene by scene.
4. For a mixed Arabic and Latin line, decide which face draws Latin: the Arabic face's own Latin, or the brand's Latin face listed first in the stack with the Arabic face second, so Latin keeps the house face. Record it.

**Broadcast and news looks (scoped: news, documentary, explainer and reels whose reference or brief is a broadcaster's on-screen look).** Broadcasters' own Arabic faces are usually custom and not sold, and the Gulf and Egyptian broadcast staples are commercial families: neither can be fetched by Ice. Match the reference's look with the measuring method of `ice-assets` (`fonts.md` section 4) over free candidates, and log the measured match. Families that measured close to one wide, low-contrast, geometric, heavy broadcast look in the sources research (illustration of range only, never a default; the fingerprint check still applies):

| Family | Character | Typical role |
|---|---|---|
| Alexandria (variable 100 to 900, own Latin) | Wide geometric, heavy weights | Headlines, kinetic captions |
| Readex Pro (variable) | Very low contrast, wide | Display; needs a HarfBuzz renderer (browser or libass) |
| Almarai (300 to 800) | Strong ExtraBold | Breaking bars and caption boxes, with a condensed Latin face for numbers |
| IBM Plex Sans Arabic | Neutral | Running text and captions |

Thmanyah (sans and serif families, free for design and video use, no redistribution) suits editorial and news work; Ice cannot fetch it, so it rides as a user download (`ice-assets`, `fonts.md` section 1; `ice-direction`, `type-pairing.md` section 1).

**Measured on one broadcaster's presenter reels (news reel, edit type `news-reel`; research dated 2026-10-29, six reels, three packages).** The same words were rendered in free candidates with a real shaping engine at matched alef height and compared on four width and stroke ratios: the Arabic running text (keywords, plates, pills, cards, captions, end-card lines) matched the Tajawal design within 0.1 to 4 percent of line width over four phrases (median 0.9 percent), either Tajawal itself or a house face drawn on it (pixels cannot tell which); the wider list above came from looks that were not measured this way, so it stays a range of candidates, and a measured match outranks it. English lines matched Montserrat (captions 500, names 800, headlines 800 to 900). Time digits are a DIN-type design, with Barlow Semi Condensed SemiBold 600 as the free stand-in; digits inside Arabic sentences follow the Arabic face. Measured weights: 800 for one to three word keywords, 700 for anything in a box, 500 for secondary lines, 300 for end-card footers. These families are that package's skin: use them as they are only when the stage 01 `identity` slot is "as they are" or "a mix" (`skills/ice-styles/references/family-broadcast-news.md` section 2); with the user's identity, pick the user's own face for the same roles and log it.

**Stroke contrast.** Stroke contrast is the ratio of the thickest stroke to the thinnest join (measured on the broadcast keywords as stem over baseline bar: 0.94 to 1.0, a monoline design). Low-contrast, wide, geometric faces keep their joins through glow, blur, digital zooms and compression, which a news reel applies to display text all the time; high-contrast faces (calligraphic, Naskh with thin joins) lose the thin strokes first. For news-reel display text choose a low-contrast face, bold, judged by eye on an Arabic sample at phone size with the film's glow and scale, and log the choice with what was compared. Values for faces not measured are never assumed: measure them the same way or judge them on the sample.

## 2. Size and weight

- Arabic reads smaller than Latin at the same nominal size. Scale Arabic about 1.2 times the Latin size the `ice-type` scale gives (estimate; confirm on a phone-size proof).
- Faces differ in advance width at the same size. Re-measure every layout after changing face or weight.
- Covers and thumbnails: Bold or Black only, never Light or Thin.
- Inside films: a weight hierarchy. Not every headline in Black; never three levels in the heaviest weight at once.
- No capitals in Arabic: replace uppercase emphasis with size, weight or color.
- No fake italic or oblique, no one-axis scaling of glyphs. Change width or weight only on a real variable axis.
- Secondary text at least about 40 px on a 1080-wide frame, contrast 4.5:1 or better.

## 3. Tracking ban

- `letter-spacing: 0` (normal) on every Arabic run. Latin display tracking rules from `ice-type` apply to Latin runs only.
- Create air with size, line height, word spacing, container width, weight, alternate cuts and layout.
- Never animate letter-spacing on Arabic.

## 4. Alternates and swashes

List the font's OpenType features before designing (`fontTools` reads WOFF2 once `brotli` is installed). Use an alternate or swash only when it solves composition: framing an element, making a path for a transition, anchoring a baseline, balancing negative space. A swash used because it exists reads as a font demo.

## 5. Loading

- Ship font files with `@font-face`; no font requests at render time. Never name a font that has no file in the project, even when it is installed on this machine: the render machine is a clean headless browser with no system Arabic fonts (a chosen system font is copied in as a file after its license check, `ice-assets`). Never romanize Arabic copy to dodge a missing font; ship one that covers it.
- Font services split families into subset files (the subset trap, `ice-assets` `fonts.md` section 2: an Arabic subset has no `:` and no Western digits). Ship the full file. In the browser, Google Fonts loads subsets on demand: loading a family without Arabic sample text fetches only the Latin subset, and every measurement (kashida, wrapping, layered text) runs on a fallback about 20 percent narrower. Load each used weight with an Arabic sample.
- Wait for the fonts before the first frame and before any measurement; race the wait against a timeout and report which font failed. Never render on after a silent timeout.

Adapted from `compose.REFERENCE.html` (video-ad-editor, MIT), comments translated, timeout handling changed to fail loudly:

```js
// Load every weight with Arabic sample text; without it only the Latin subset arrives.
function arabicFontsReady(family, weights = ['400', '600', '700', '800', '900'], ms = 10000) {
  const load = Promise.all(weights.map(w => document.fonts.load(`${w} 60px "${family}"`, 'عربي ـ 123')));
  const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error(`font not ready: ${family}`)), ms));
  return Promise.race([load.then(() => document.fonts.ready).then(() => true), timeout]);
}
```

The readiness promise must resolve to a plain value (see `references/arabic-qa-checks.md` (section "Arabic failure lessons"), render hang).

## 6. Per-language font check (gate)

Renderers (tested 2026-10-29 on one Arabic headline with mixed digits and punctuation across several open families): headless Chrome with `@font-face` and libass (the ffmpeg `ass` filter with complex shaping) shaped and ordered every font correctly; ffmpeg `drawtext` (even with `text_shaping=1`) drew presentation forms, boxes and dropped letters and crashed on woff2; Pillow without raqm left letters unjoined and reversed. Arabic is drawn only by a renderer that passed (`ice-assets`, `fonts.md` section 3).

Run for every script present in the film (Arabic, Latin, digits, and any other script):
1. Coverage: read the font's character map and confirm every code point used in the copy exists. Text measurement alone can miss a missing glyph on some systems. Arabic-script languages need their extra letters (Persian `پ چ ژ گ ک ی`, Urdu `ٹ ڈ ڑ ں ے`, their digit forms).
2. Paint check: render an Arabic-only sample and a Latin-only sample separately. Compare each against the generic family and against an undeclared family; if the width matches a fallback, the font did not load. A mixed sample hides a Latin-only subset and once passed a broken font.
3. Pixel check: in delivered frames, confirm the painted font (not the CSS name) drew the Arabic glyphs: no tofu boxes, no fallback shapes, no disconnected letters.
4. Red run: strip the Arabic glyphs from a copy of the font by subsetting, rerun steps 1 to 3, and confirm the gate fails. A deleted file is not a realistic failure.

Fallback font or tofu is a hard failure.

## 7. Encoding on Windows

The default Windows code page (`cp1252`) breaks any Arabic print or file write in Python. Force UTF-8 in every script (`encoding='utf-8'` on files, `PYTHONUTF8=1` in the shell) before handling Arabic.
