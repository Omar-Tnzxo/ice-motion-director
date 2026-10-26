# Reading time and readability gates

Merged from lemomo-ai/lemo-opuscar (MIT), alexgreensh/anidoodle (MIT), echris6/motion-video-kit and the launch-motion group (MIT), Tejashmakwana/motionmaxxing (Apache-2.0), heygen-com/hyperframes (Apache-2.0: typography, docs reading budget, music-to-video, embedded captions), alchaincyf/huashu-art-motion (MIT), Omar-Tnzxo/video-production-studio, majedphotos/video-ad-editor (MIT), edenfunf/reelmimic (MIT), diffusionstudio/lottie and the launch group (MIT), plus ideas restated from Omar-Tnzxo/commercial-motion-design and Vincentwei1021/anything2explainer. Restructured; numbers kept.

The `ice-qa` skill runs these gates; this file owns the thresholds.

## 1. Canonical hold formula

Pick the row by text role and by whether a voice carries the same words. Then apply the floors in section 2. Count from the frame the last word or character is whole (fully entered, settled, legible), never from the start of its entrance; drawing or typing time never counts as reading time.

| Text role | Voice carries the words? | Hold (Latin script) | Sources |
|---|---|---|---|
| Caption / subtitle | Yes | At least 1.8 s and at least the spoken line plus 0.6 s for full subtitles; word-pop and karaoke cues at least 0.5 to 0.7 s; at most 17 characters per second | lemo, launch group, embedded captions |
| Display text that echoes the voice (kinetic VO films, explainers) | Yes | About 0.35 s per word plus 0.3 s settle, never under 1.2 s per card, longer for a number. Floor 0.45 s after the line is complete; comfortable 0.2 s per word for 2 to 5 words; 1.7 to 2.0 s for 6 to 8 words on two lines; total life per phrase about 0.25 to 0.35 s per word | launch group, motionmaxxing |
| Display text with no voice (no-VO films, kinetic type, title cards, data labels) | No | `(letters / 15 + 1.5)` s; or at least `max(0.8 s, words / 3 per second)` plus measured settle frames | lemo, commercial-motion-design |
| Short display words | Either | 1 to 3 display words 0.5 to 1 s; a sentence 1.5 to 2 s; never a paragraph. Hold each settled word at least 0.5 s, longer for the claim | motionmaxxing, anidoodle |
| Single number | Either | 0.5 to 1.2 s; longer when it carries the claim | motionmaxxing |
| Title card | No | At least 4 s (cinematic films); feature or business message at least 2.5 s; CTA at least 1.5 s readable at phone size (3 s for launch promos) | lemo, local skills, launch group |
| Final hold / end card | Either | 1.2 to 2 s (about 1.5 to 2 s readable for end cards); resolved CTA end hold 0.6 to 1.4 s | local skills, launch group, motionmaxxing |
| Source or citation caption | Either | At least 2.5 s at 50% opacity or more, attached to the shot's first beats | anything2explainer ideas |
| Texture copy (background type, UI filler) | n/a | No reading time; it is not meant to be read | motionmaxxing |

Simple fallback when nothing else is known: `hold = max(0.7 s, 0.3 s per word)`.

Reading-time budget per scene (planning, HyperFrames): no text 1.5 to 2 s; 1 to 3 words 2 to 3 s; 4 to 10 words 3 to 4 s; 11 to 20 words 4 to 6 s; 21 to 35 words 6 to 8 s; more than 35 words: split into two scenes. The last readable element finishes entering by 50% of the scene duration.

Fixed reading time rule: text on screen for 3 s must be readable in 2.

## 2. Floors and modifiers

- Minimum: every word on screen at least 0.6 s; text at least 8 clean frames; a phrase holds 0.4 to 0.7 s; a 700 ms reading hold before ornamental travel.
- Slower audiences (children, second-language viewers, non-experts): longer holds; multiply by 1.3 to 1.5 and log the factor.
- A card carrying a number holds longer than a card of the same word count.
- Never time text only by the available scene length; measure reading time with native readers or a documented conservative rate plus settle time.
- Make a film fast with fewer words per screen, not by cutting before people finish reading.
- Music films: a readable word holds at least 1 beat (headline 3 to 8 beats, sentence 4 to 10); a word held under 1 beat is texture.
- Typewriter or write-on text: it must be readable for a full hold after the last character (whiteboard reading time counts from the last item finishing; a typed RPG box holds at least 1.2 s after typing ends); typed text holds long enough to be read twice.
- Freeze-and-name beats: hold as long as the word takes to write plus one beat to read it.

## 3. Rates by script

| Script | Rate | Source |
|---|---|---|
| English display text | 15 letters per second plus 1.5 s base; lower bound about 13 characters per second | lemo, huashu |
| English captions | At most 17 characters per second | launch group |
| Chinese display text | `(characters / 4.5 + 1.5)` s | lemo |
| Chinese subtitles | About 7 to 9 characters per second (unverified heuristic) | huashu |
| CJK main word | 2-character main word at least 0.5 s; 7 to 8 character supporting line at least 1.0 s | huashu |
| Wide-character languages in sequenced lists | Lean high on per-character time (0.03 to 0.06 s per character) | HyperFrames |
| Arabic | See the `ice-arabic` skill | |

## 4. Readability gates (thresholds)

| Gate | Threshold |
|---|---|
| Glance test | A card is understood in under 1 s |
| Phone size | Read the whole frame shrunk to about 360 to 390 px wide (landscape film too); if a line is unreadable, delete secondary text before shrinking type. Also read a 960 x 540 downscale of every major beat by eye |
| Size floor in phone preview | Text size times min(1, view width / frame width) at least 16 px |
| Caption height | Captions at least 4.5 to 5% of frame height when the frame is shrunk to phone width |
| Clipping | No clipped words at the edges, no half-cut text, no overlapping text, no text in the caption band (unless it is the caption) |
| Fallback font | No fallback font or missing glyphs (tofu) in any frame (see `font-loading-and-measuring.md`) |
| Muted | The film works with sound off: on mute the viewer can state the business and the action |
| Edge cases | No orphan word or character on a line; the final caption or graphic clears before the video ends |
| Duplication | Narration and captions carry the words; graphics show the example, relationship, evidence or consequence. A third restatement as a headline needs a reason |
| Static text | Static copy only for a deliberate lockup, legal line, label or CTA hold; static text beside unrelated moving UI fails |

Legibility is partly not automatable: always look at the frames. Validate any automatic gate against a control known to trip it (a caption shifted 0.3 s, an omitted word) before trusting it.
