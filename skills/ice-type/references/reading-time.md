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
| Fallback font | No fallback font or missing glyphs (tofu) in any frame (see `type-system.md` (section "Font loading, fallback and text measurement")) |
| Muted | The film works with sound off: on mute the viewer can state the business and the action |
| Edge cases | No orphan word or character on a line; the final caption or graphic clears before the video ends |
| Duplication | Narration and captions carry the words; graphics show the example, relationship, evidence or consequence. A third restatement as a headline needs a reason |
| Static text | Static copy only for a deliberate lockup, legal line, label or CTA hold; static text beside unrelated moving UI fails |

Legibility is partly not automatable: always look at the frames. Validate any automatic gate against a control known to trip it (a caption shifted 0.3 s, an omitted word) before trusting it.


## Text density and hierarchy per film type

Merged from heygen-com/hyperframes (Apache-2.0: frame-worker, kinetic-type module, music-to-video, docs motion graphics), nateherkai/herk-edit-kit (MIT), Tejashmakwana/motionmaxxing (Apache-2.0), alexgreensh/anidoodle (MIT), alchaincyf/huashu-art-motion (MIT), edenfunf/reelmimic (MIT), vincentsch/explainroo (MIT), Barty-Bart and charlie947 motion-graphics (MIT), diffusionstudio/lottie (MIT), the launch-motion group (MIT), Omar-Tnzxo/video-production-studio, yihui-dev community skills, plus ideas restated from imMamdouhaboammar/motion-graphics-skills, Omar-Tnzxo/commercial-motion-design, Vincentwei1021/video-talkcraft, Vincentwei1021/anything2explainer, bangtutorial/bang-motion and vibe-motion/skills. Restructured; numbers kept.

### 1. Universal density rules

1. Visible text is not a transcript. The voice carries the sentence; the frame shows 1 to 5 key words (a hero word, a stat, one emphasis word). Never caption the voiceover in display type; never put the whole narration on screen.
2. Write for glance comprehension: a card reads in under 1 s. Avoid repeating the voiceover, long sentences, vague hype words, too many highlighted words.
3. On-screen words do one of three jobs: drive the eye, carry one promoted sentence per act, or name things.
4. Copy compression: 2 to 6 words, at most two phrases per beat, verb plus noun, sentence case; never a sentence over about 7 words on screen. Keep the longer original line as the voiceover.
5. Lists read aloud only work when each item appears on screen.
6. When the prompt carries more than one idea (long text, several claims, a feature list, several stats, timeline, before and after, quote plus proof), chapter it into separate beats rather than fitting it on one screen. Explanations longer than 2 lines split into two beats. Split pages rather than shrinking type.
7. Each text beat is one claim followed by the picture that proves it. Numbers in a script get a visual built from the number, not only a caption.
8. Never lift a word, label or wordmark out of a style or design file as copy: a style spec is not content. Copy given in quotes is used exactly; unquoted copy may be paraphrased.
9. Text to evidence at every moment is one of: text owns focus and prepares the evidence; text and evidence are one transforming object; evidence owns focus with text labeling it; a deliberate handoff.

### 2. Per film type (names as in the ice-film and ice-edit type files)

| Type | Words on screen | Text share and hierarchy |
|---|---|---|
| Product launch | 3 to 7 words a frame, few frames; collapse word cards into one claim then proof | Title-only frames at most 15% of runtime; never three text beats in a row without a product image; claim on screen in the first seconds for muted viewers |
| App ad | 2 to 6 words per beat; typed requests 20 to 70 characters taken from the product | Text labels evidence; UI text that is not the hero becomes texture |
| Brand film | 1 to 5 words for impact lines, 6 to 12 for supporting claims, one primary message per beat | One expressive type moment; one caption per scene at most in quiet styles |
| Logo sting | Wordmark plus at most a short line | No tagline unless the brand has one |
| Kinetic type | Main word at most 4 characters CJK or a short word; supporting line at most 14 CJK characters; Latin copy segmented by breath, about 3 to 7 words, shown 1 to 4 words a line (median 2), at most 8 at once, about 1.75 words per second of text time (`ice-film` skill, `references/genres/kinetic-type.md`) | 1 to 2 emphasis words per scene; Hook, Build, Punch, Resolve; if a section is all text for more than 30 to 60 s, switch grammar or insert an image page every 2 pages |
| Data story | Title states the conclusion; subtitle carries metric and unit; source line | One annotation per shot; structure first, then data, then annotation |
| Social short | Hook up to 3 lines of about 19 characters; at most 5 words on screen; Reels captions at most 5 to 7 words, 2 lines | Readable from frame 1; written hook 1.5 to 3 s |
| Hype promo | 1 to 3 words per beat (kinetic triplets, verb barrages) | Words held under 1 beat are texture |
| UI walkthrough | Labels 1 to 2 words under their element | Exactly one readable object per frame; everything else texture |
| Music video | Readable word at least 1 beat; lines at most about 56 characters | Lyrics only from the user |
| Art film | Often none; text drawn in the style's material | A picture that does not read is fixed in the picture |
| Industry spot | Brief decides; official terminology only | Every number traceable to a source |
| Explainer (ice-explainer) | About 20 on-screen words per section, no sentences; labels 1 to 2 words; distilled phrases 12 characters or fewer (CJK) | Captions carry the speech; display text names and points |
| Talking-head ad, shorts and reels (edit) | Captions per `captions-system.md`; one graphic at the top | Narration and captions carry the words; graphics show the example, relationship, evidence or consequence |
| Long-form, podcast (edit) | Captions plus sparse labels | Chapter card every 2 to 3 minutes in long explainers |

Per-shot caps measured in source styles (illustration of scale): at most 8 CJK characters of in-picture text per shot with the VO in subtitles; drawn style caption cards at most 16 CJK or 40 Latin characters; RPG text boxes one line of about 20 CJK characters; product titles 3 to 8 characters or words; quote wraps at 34 characters or fewer, sticky notes 28, spines 22; bio lines about 65 characters; graffiti words read up to 4 letters (open-counter letters read best).

### 3. Callouts and annotation

- One or two callouts on screen at a time; the dot follows the thing, the label holds still; a busy area gets a backing or no callout.
- One callout per sentence; a thin leader line then typed text about 40 characters per second; hold about 3 s, then erase.
- An anchor label is bold small caps of 3 words or fewer plus a curved arrow whose tip touches the subject; an arrow without text has no point.
- Underline, never strike through, for pointing; not more than one word a line or twice a film.
- Read every on-screen text in reading order after each new card: adjacent cards can form a wrong sentence.
- Label chips that name the scene ("Messages", "Editor") are slop in UI films: the UI itself shows which app it is.

### 4. Text over picture

- Words get their own space by default (their own frame, or their own column). Type over the picture only when the area is calm, the type belongs to the scene, the frame would pass as a poster, and it reads with sound off. Never over a face, a product's UI, the detail the shot is about, or busy texture. In doubt, the word gets its own frame.
- Oversized words may enter on opposing axes and mask or reveal the next scene, but never sit still over busy footage without a backing.
- In drawn worlds, text drawn in the style's material (stroked lettering, mosaic letters, neon tubes) beats a font. Coarse styles (pixel, mosaic) need monospaced thick strokes at least 2 grains wide; thin fonts break.
- Generated images: tell the image model to leave text out when the text must animate; code draws it. Decorative in-picture text, if any, is spelled verbatim in the prompt and checked.
