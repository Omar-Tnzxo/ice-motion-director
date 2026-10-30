> Sources: ideas from imMamdouhaboammar/motion-graphics-skills and commercial-motion-design (rewritten); majedphotos/video-ad-editor (MIT, Copyright (c) 2026 Majed Alzaabi) verification steps (translated); Omar-Tnzxo video-production-studio QA and delivery (founder's own); Vincentwei1021/mg-styles-15 (MIT) fallback-font check. Changes: merged into one checklist for `ice-qa`, dash characters removed.

# Arabic QA checks (run through ice-qa)

Geometry is measured; taste is reviewed. Trust a measured check only after you have seen it fail on a reintroduced defect in a scratch copy. "No findings" means nothing unless you also report how much was measured (assert hero words are present, not only unclipped).

## 1. Hard failures (block delivery regardless of overall quality)

- Letters disconnected unexpectedly, or a word split into isolated forms.
- Fallback font or tofu anywhere.
- Punctuation reversed; Latin names or numbers reordered.
- A read letter, dot, hamza, diacritic or descender clipped; a crop that removes meaning.
- Mixed digit systems, or digits not matching the profile.
- Kashida outside a valid point, on numbers, Latin or sacred text.
- Sacred text not verbatim from a verified source, or animated beyond a calm reveal.
- On-screen words not in the approved script; invented words in captions.
- Weights collapsed into one voice; Arabic too small at phone scale.
- Arabic text in a platform no-text zone.

## 2. Measured checks

| Check | Method |
|---|---|
| Clip audit | Sample every 0.1 s; measure each visible text run against the frame and every clipping ancestor; report cuts lasting 0.5 s or more; skip text fully hidden in a mask; skip declared intentional crops; optional near-edge warning (48 px). Polygon clips and sibling occlusion need full-resolution stills |
| Waiting-word leak | At the frame before each masked reveal, confirm no pixels of the waiting word are visible |
| Font gate | `references/fonts-and-shaping.md` section 6, per script |
| Digits | Scan every rendered string for digit code points; one system only, matching the profile |
| Bidi | For each line with a Latin run or number, compare rendered order to the script |
| Kashida | Run the point finder on every stretched word (`references/kashida.md`) |
| Caption word count | Corrected sentences keep the ASR word count; every caption word exists in the approved script |
| Sync | Re-transcribe the delivered file; 0.1 s (word highlight) or about 0.15 s (sentence cards) |
| Safe zones | Two-color render diff, text pixels in no-text zones, first caption within 0.5 s |
| Holds | Every word at least 0.6 s; important standalone lines 0.9 s in display-led types |
| Cover | Sizes from `references/arabic-qa-checks.md` (section "Covers and thumbnails with Arabic text"); preview at real phone size |

## 3. Review by eye (never from a contact sheet alone)

- Watch the animated states: shaping during reveals, dots during masks, punctuation direction, isolation, vertical crops during rises, partial joined forms exposed by word reveals.
- Phone gate: muted at phone size; Arabic must parse at a glance; reduce rather than add when unclear.
- Take stills from the delivered MP4, not the composition. Full-resolution stills decide what contact sheets only flag.
- Dialect sign-off recorded from the native reader (the user by default (or a person the user names): the Arabic script is shown for sign-off with the preview approval in auto mode, or on the 03 review card in step mode; when neither happens, the delivery note lists the sign-off as open); doubtful words and removed lines listed.
- Report honestly: what was checked by eye, by numbers, what could not be checked, which words were corrected with doubt, which tools were substituted.


## Covers and thumbnails with Arabic text

> Adapted from majedphotos/video-ad-editor (MIT, Copyright (c) 2026 Majed Alzaabi) `references/thumbnails.md` and `SKILL.md`, and Omar-Tnzxo video-production-studio `references/qa-and-delivery.md`. Changes: translated from Arabic, author's personal palette and font defaults removed (they come from the brand design system), dash characters removed. Numbers kept with their evidence grade.


### 1. Why covers fail on phones

- The Instagram profile grid shows a cover at about 12 percent of its size: a 1080-wide cover becomes about 130 points wide on a 393-point phone (measured).
- Smallest readable iPhone text is 11 points, normal is 17 (Apple HIG). So 11 points needs about 91 px on the cover and 17 points about 141 px (points divided by 0.1204).
- Arabic reads smaller than Latin at the same size: scale it about 1.2 times (estimate).

### 2. Reel cover (1080x1920)

- The cover is the first frame of the video (inserted for about 0.1 s) and must be readable alone.
- Everything important sits inside an invisible centered square, y 420 to 1500. The profile grid crops 3:4 (y 240 to 1680), the feed 4:5 (y 285 to 1635).

| Item | Minimum |
|---|---|
| Arabic title | 170 px (best 190 to 230) |
| Any other text | 110 px, never under 91 |
| Words | 5 at most, 2 lines, about 9 characters per line at 170 px |
| Logo or icon | 200 px |
| Lines and strokes | 10 px |
| Weight | Bold or Black; no letter-spacing on Arabic |
| Contrast | 4.5:1 (3:1 for very large text) |
| Account handle | None |

Order inside the square: news elements on top if any, the face, the title on the chest. No word on the face. Cross and check marks on logos only for a "from X to Y" story.

### 3. YouTube thumbnail (16:9)

- 3840x2160 recommended plus a 1280x720 copy; under 2 MB for phone upload.
- On the 1280 copy: Arabic text at least 120 px (Latin 100), logo at least 140 px; keep the bottom-right 310x145 empty (duration badge).
- 3 to 5 words, one idea, a large face with a clear emotion.
- Make three variants (face plus word, face plus a news object, before and after); the user picks.

### 4. Look

Background, text color and fonts come from the brand design system (`ice-direction`, `ice-assets`); no fixed palette. Ask first whether to take the person's image from the video or from photos the user provides; a frame from the video usually has a neutral face and makes a weaker thumbnail.

### 5. Check

Preview the cover at its real phone sizes (reels tab, profile grid, far view) and the thumbnail at home-feed and side-list sizes. If it cannot be read in the preview, it cannot be read on the phone.


## Sacred text, seasons and culture

> Sources: majedphotos/video-ad-editor (MIT, Copyright (c) 2026 Majed Alzaabi) `SKILL.md` rule 12, `references/moves.md`, `references/gen-scenes.md` (translated); Omar-Tnzxo video-production-studio `references/industry-playbooks.md`, `references/generated-assets.md` and motion-interaction-studio `references/personality-by-industry.md` (founder's own). Changes: the source author's personal content restrictions turned into a brand setting, dash characters removed.


### 1. Quran text

- Copy the text verbatim from a trusted source (a Quran API or tool that serves the Uthmani or standard text), cross-check it against a second source, and pass it unchanged. Never type a verse from memory and never change a letter or a mark.
- Font: a Quranic Uthmani face (Amiri Quran in the sources); text around the verse uses the film's font.
- Motion: one calm motion only (a gentle reveal and hold). Banned on verse text: dots falling, join snap, kashida, glitch, letter effects, word moves, and any other kinetic move.
- No images of living beings over a verse; geometric ornament without figures is acceptable behind it.
- Verse numbers inside the end-of-verse sign use Arabic-Indic digits by default.
- Apply the same verbatim-source discipline to any other sacred or quoted religious text: source it, cross-check it, keep it unanimated except a calm reveal.

### 2. Seasons and occasions

- Ramadan, Eid, summer, back to school, national days and local sports moments change tone and timing. Ramadan ads are a genre of their own (family, generosity, the hour before iftar).
- Seasonal themes stay optional, short and respectful; no religious symbols used as confetti.

### 3. Motion culture

- Premium and trust brands (banking, government, real estate) are expected to be calm and polished in Arab markets; playful bounce reads as cheap there sooner than in some other markets. Pass this to `ice-motion` when choosing the motion personality.
- The main platform differs by market (for example Facebook, Instagram, TikTok and YouTube in one market; Snapchat, TikTok and Instagram in another; LinkedIn for B2B). Ask where the money will be spent.

### 4. Imagery around Arabic copy

- Generated images express the idea, never the product, and never carry readable text, logos or Arabic letters; composite live text instead.
- Content restrictions (for example whether to show people of a given gender, music, certain gestures or symbols) are brand or owner settings recorded in the brief, never assumed for all Arab audiences.
- Local realism in generated footage follows the market of the brief (vehicle plates, streets, dress); never blank or blurred placeholders.
- Never fake a social post for a real person.


## Arabic failure lessons

> Sources: ideas from imMamdouhaboammar/motion-graphics-skills failure reports (rewritten, no text copied); majedphotos/video-ad-editor (MIT, Copyright (c) 2026 Majed Alzaabi) dated rule notes (translated); Omar-Tnzxo video-production-studio parallel-production notes (founder's own); heygen-com/hyperframes (Apache-2.0) captions decision gate; alchaincyf/huashu-art-motion (MIT) glyph-check note. Changes: condensed to symptom, cause, rule; dash characters removed.


Search this list by symptom before debugging. General render fixes are owned by `ice-engines`; gates by `ice-qa`.

| # | Symptom | Cause | Rule |
|---|---|---|---|
| 1 | A word reads as a different word on the first frame | The frame edge cut its first letter (an alef), on two separate films | Never crop a read letter; measure, do not eyeball |
| 2 | A ya reads as another letter | A sheet overlapping the word's foot covered its dots | Overlaps stay above the dot and descender zone |
| 3 | A question mark missing during a reveal | The text sat outside a light-cone polygon at its widest frame | Polygon reveals contain the text at its widest reading frame; check full-resolution stills |
| 4 | A label clipped 7 px for half a second, missed in two eye passes | The label's own `overflow: hidden` | Run a clip audit sampling every 0.1 s against frame and clipping ancestors; report cuts lasting 0.5 s or more |
| 5 | Lines 2 to 27 px from the edge | Placed by eye | Non-hero copy at least 48 px from edges; confirm warnings at full resolution |
| 6 | Headline read as a font demo with an odd baseline | Swash used because it existed | Alternates only to solve composition |
| 7 | Stray dots and smudges where a word will later appear | Masks padded for dots made the mask taller; waiting words peeked through | Hide waiting words and park them beyond the padded box |
| 8 | A Latin product name wrapped onto two lines and hit the layout below | Absolutely positioned box without `nowrap`, shrink-to-fit | `nowrap` plus a measured width check on single-line phrases |
| 9 | Layout in preview differs from render; kashida and wraps wrong | Only the Latin subset of the font loaded; fallback about 20 percent narrower | Load each weight with Arabic sample text before measuring |
| 10 | A font gate passed a font with no Arabic glyphs | The gate measured a mixed Arabic and Latin sample | Measure scripts separately against generic and undeclared families; red-run with stripped glyphs |
| 11 | A stretched word broke in two | Kashida inserted after a ra that carried a shadda (diacritic counted as a letter) | Compute points from base letters, place kashida after marks |
| 12 | Stretched word jittered and showed gaps | Stretch done by adding tatweel characters per frame | Stretch a pixel slice from the kashida middle |
| 13 | Caption sat on the speaker's face | Caption fixed at one height while the video moved into a card | Position captions from the video's current rectangle |
| 14 | Caption entered the Instagram button column | Max width 940 px | 820 px without a card, 730 px card |
| 15 | Hook zoom erased the layered text | Zoom kept running during the effect | Stop the hook zoom during layered text |
| 16 | Render hung forever at the start | The readiness promise resolved with a GSAP timeline (a thenable), which deadlocks promise resolution | Resolve readiness with a plain value; race it against a timeout; reject with the failing asset path |
| 17 | Frames differed only under CPU load | A texture source URL was swapped per frame | Preload variants as layers and switch by opacity; compare two renders by frame hash, the second under load |
| 18 | Review copy too large to send | Sized by CRF | Size by bitrate arithmetic: the `ice-engines` skill, `references/render-export.md` section 4 |
| 19 | Captions showed a stock "subscribe" or "thank you" line at the end | ASR hallucinated over trailing silence; long file in one pass also dropped minutes | Drop words after the last scripted word and near-zero-duration words; 20 s chunks at silences |
| 20 | Dialect words garbled in the transcript | Small model on dialect speech | Medium or larger, dialect fine-tune when available |
| 21 | Arabic printed as question marks or crashed a Python tool on Windows | Default `cp1252` encoding | Force UTF-8 everywhere |
| 22 | A dot appeared near a word before a line drew | A round-capped path shows a dot at its start before its cue | Hide paths until their cue; butt caps |
| 23 | Builders invented shop names, timers and claims, reworded the VO, drifted to MSA, put captions in the bottom band and clipped the right edge | Briefs did not forbid it and review did not check it | Builder briefs forbid it explicitly; review checks each item (`references/arabic-qa-checks.md`) |
| 24 | A glyph check passed on one OS and failed on another | Coverage checked with text measurement | Read the font character map for coverage |
| 25 | Clipped Arabic on an Arab client's film | Any of the above | Treat as a release failure: it reads as carelessness about the language |
