> Sources: ideas from imMamdouhaboammar/motion-graphics-skills failure reports (rewritten, no text copied); majedphotos/video-ad-editor (MIT, Copyright (c) 2026 Majed Alzaabi) dated rule notes (translated); Omar-Tnzxo video-production-studio parallel-production notes (founder's own); heygen-com/hyperframes (Apache-2.0) captions decision gate; alchaincyf/huashu-art-motion (MIT) glyph-check note. Changes: condensed to symptom, cause, rule; dash characters removed.

# Arabic failure lessons

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
