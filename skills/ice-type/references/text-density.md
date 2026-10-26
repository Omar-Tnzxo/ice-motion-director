# Text density and hierarchy per film type

Merged from heygen-com/hyperframes (Apache-2.0: frame-worker, kinetic-type module, music-to-video, docs motion graphics), nateherkai/herk-edit-kit (MIT), Tejashmakwana/motionmaxxing (Apache-2.0), alexgreensh/anidoodle (MIT), alchaincyf/huashu-art-motion (MIT), edenfunf/reelmimic (MIT), vincentsch/explainroo (MIT), Barty-Bart and charlie947 motion-graphics (MIT), diffusionstudio/lottie (MIT), the launch-motion group (MIT), Omar-Tnzxo/video-production-studio, yihui-dev community skills, plus ideas restated from imMamdouhaboammar/motion-graphics-skills, Omar-Tnzxo/commercial-motion-design, Vincentwei1021/video-talkcraft, Vincentwei1021/anything2explainer, bangtutorial/bang-motion and vibe-motion/skills. Restructured; numbers kept.

## 1. Universal density rules

1. Visible text is not a transcript. The voice carries the sentence; the frame shows 1 to 5 key words (a hero word, a stat, one emphasis word). Never caption the voiceover in display type; never put the whole narration on screen.
2. Write for glance comprehension: a card reads in under 1 s. Avoid repeating the voiceover, long sentences, vague hype words, too many highlighted words.
3. On-screen words do one of three jobs: drive the eye, carry one promoted sentence per act, or name things.
4. Copy compression: 2 to 6 words, at most two phrases per beat, verb plus noun, sentence case; never a sentence over about 7 words on screen. Keep the longer original line as the voiceover.
5. Lists read aloud only work when each item appears on screen.
6. When the prompt carries more than one idea (long text, several claims, a feature list, several stats, timeline, before and after, quote plus proof), chapter it into separate beats rather than fitting it on one screen. Explanations longer than 2 lines split into two beats. Split pages rather than shrinking type.
7. Each text beat is one claim followed by the picture that proves it. Numbers in a script get a visual built from the number, not only a caption.
8. Never lift a word, label or wordmark out of a style or design file as copy: a style spec is not content. Copy given in quotes is used exactly; unquoted copy may be paraphrased.
9. Text to evidence at every moment is one of: text owns focus and prepares the evidence; text and evidence are one transforming object; evidence owns focus with text labeling it; a deliberate handoff.

## 2. Per film type (names as in the ice-film and ice-edit type files)

| Type | Words on screen | Text share and hierarchy |
|---|---|---|
| Product launch | 3 to 7 words a frame, few frames; collapse word cards into one claim then proof | Title-only frames at most 15% of runtime; never three text beats in a row without a product image; claim on screen in the first seconds for muted viewers |
| App ad | 2 to 6 words per beat; typed requests 20 to 70 characters taken from the product | Text labels evidence; UI text that is not the hero becomes texture |
| Brand film | 1 to 5 words for impact lines, 6 to 12 for supporting claims, one primary message per beat | One expressive type moment; one caption per scene at most in quiet styles |
| Logo sting | Wordmark plus at most a short line | No tagline unless the brand has one |
| Kinetic type | Main word at most 4 characters CJK or a short word; supporting line at most 14 CJK characters; Latin segments by breath, about 3 to 7 words | 1 to 2 emphasis words per scene; Hook, Build, Punch, Resolve; if a section is all text for more than 30 to 60 s, switch grammar or insert an image page every 2 pages |
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

## 3. Callouts and annotation

- One or two callouts on screen at a time; the dot follows the thing, the label holds still; a busy area gets a backing or no callout.
- One callout per sentence; a thin leader line then typed text about 40 characters per second; hold about 3 s, then erase.
- An anchor label is bold small caps of 3 words or fewer plus a curved arrow whose tip touches the subject; an arrow without text has no point.
- Underline, never strike through, for pointing; not more than one word a line or twice a film.
- Read every on-screen text in reading order after each new card: adjacent cards can form a wrong sentence.
- Label chips that name the scene ("Messages", "Editor") are slop in UI films: the UI itself shows which app it is.

## 4. Text over picture

- Words get their own space by default (their own frame, or their own column). Type over the picture only when the area is calm, the type belongs to the scene, the frame would pass as a poster, and it reads with sound off. Never over a face, a product's UI, the detail the shot is about, or busy texture. In doubt, the word gets its own frame.
- Oversized words may enter on opposing axes and mask or reveal the next scene, but never sit still over busy footage without a backing.
- In drawn worlds, text drawn in the style's material (stroked lettering, mosaic letters, neon tubes) beats a font. Coarse styles (pixel, mosaic) need monospaced thick strokes at least 2 grains wide; thin fonts break.
- Generated images: tell the image model to leave text out when the text must animate; code draws it. Decorative in-picture text, if any, is spelled verbatim in the prompt and checked.
