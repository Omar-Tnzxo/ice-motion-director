> Sources: majedphotos/video-ad-editor (MIT, Copyright (c) 2026 Majed Alzaabi), Omar-Tnzxo video-production-studio, motion-interaction-studio and brand-identity-studio (founder's own). Ideas from imMamdouhaboammar/motion-graphics-skills, commercial-motion-design and a noncommercial product-demo source rewritten (no text copied). Changes: translated, merged, scoped, dash characters removed.

# Bidi, numerals and line breaks

## 1. Direction setup

- Set RTL on every Arabic block (`dir="rtl"`, correct `lang`). Check alignment, punctuation, numerals and mixed runs visually on rendered frames.
- Let the browser bidi algorithm order the line, but never trust it with neighbors: isolate.

## 2. Isolate Latin runs and numbers

- Treat each Latin run (product names, platform names, AI terms, URLs, handles, years, version numbers) as one deliberate unit: wrap it in `<bdi>` or a span with `unicode-bidi: isolate` (and `dir="ltr"` for Latin). Without isolation, punctuation jumps and phrases reorder.
- Punctuation that belongs to the Arabic sentence stays outside the isolated run.
- Keep the natural internal order of a name with its number (a product name followed by its version stays in that order; never flipped).
- Balance the Latin run optically against the Arabic mass (size or weight) so it does not overpower the sentence. Latin never takes Arabic shaping rules.
- No English in Arabic deliverables except approved brand and technical terms.
- Subtitle files (SRT, VTT): players often lack isolation. Put a right-to-left mark (U+200F) at the start of any cue line that begins with Latin or a digit, and around Latin runs that end a line, then check the cue in a real player.

## 3. Names in each script

Decide once, with the brand, how its name is written in Arabic and where the Latin form stays, and record it in the truth sheet (`ice-assets`). Arabic copy uses the Arabic name; voiceover text follows the voice doc. Brand and product names are reproduced exactly as the brand writes them.

## 4. Numerals

| Decision | Rule |
|---|---|
| Which system | One per film, from the language profile. Western digits (0-9) by default for social ads and edits; Arabic-Indic digits when the brand, market or formal register uses them, and for verse numbers in sacred text |
| Code points | Arabic-Indic digits are U+0660 to U+0669. Persian and Urdu forms are U+06F0 to U+06F9 and differ in shape for 4, 5, 6. Never mix systems in one film |
| Engine conversion | If an engine converts digits automatically, make the conversion follow the profile; some Arabic fonts draw Arabic-Indic shapes for Western code points (locale features), so confirm the shape in rendered pixels |
| Counters | Tabular (fixed-width) digits so the number does not jitter |
| Numbers and units | A number stays on the same line as its unit |
| Ranges | In Arabic copy, write a range with words rather than a symbol range (illustration only: `30 لـ 45 دقيقة`, `من 3 إلى 5 أيام`) |
| Screen vs voice | The screen shows digits; the voiceover text spells numbers as words in the chosen dialect (`references/voiceover-tts.md`) |
| Currency | The currency word the audience uses, in the dialect's spelling |
| Stretching | Numbers never take kashida |

Every number on screen traces to the truth sheet (`ice-assets`); never invent a number to use a counter.

## 5. Line breaking

1. Break by meaning: emphasis, rhythm, balance, reading order. Never in the middle of a fixed phrase; fix the composition instead of splitting the phrase.
2. A long caption sentence shrinks to fit two lines rather than paging through several cards.
3. Balanced splits, no orphan word on the last line.
4. In written hooks an ellipsis may break the line: the idea above, the twist below.
5. Every single-line display phrase: `white-space: nowrap` plus a measured width check against the frame. Shrink-to-fit wrapping of Latin names is silent and collides with layout below.
6. Check that no word is clipped at the right edge (where Arabic lines start).
7. Shorten the copy before shrinking it below the size floor.
8. No full stop at the end of headlines or hooks (a question mark or ellipsis is fine).

## 6. Several languages in one film

- One composition serves every language through a parameter; never fork the file. The source language version must stay pixel identical after adding a language (check with frame diffs).
- Write each language's line natively for about the same duration; never translate word for word. Lines naming UI labels use the localized label.
- Load a locale's font only for that language.
- Apply every review note to every language and every cut, then re-render all of them.
- Never assume English as the copy language; the language comes from the brief.
