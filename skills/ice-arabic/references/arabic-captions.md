> Sources: majedphotos/video-ad-editor (MIT, Copyright (c) 2026 Majed Alzaabi) `SKILL.md`, `references/word-fx.md`, `references/cut-styles.md`, `references/podcast-hook.md`, `references/scenes.md`; Omar-Tnzxo video-production-studio `references/talking-head.md`, `references/qa-and-delivery.md`; heygen-com/hyperframes (Apache-2.0) caption grouping. Ideas from imMamdouhaboammar/motion-graphics-skills rewritten. Changes: translated from Arabic, merged, Kuwaiti-specific word lists moved to dialect profiles, dash characters removed.

# Arabic captions and written hooks

General caption design (styles, base sizes, grouping theory) is owned by `ice-type`. This file holds the Arabic rules that override or extend it.

## 1. Where the words come from

1. Captions and on-screen words come from the approved script. ASR provides timing only (`references/asr-timing.md`).
2. Footage without a script: correct the transcript first, have a human approve it, and treat the approved transcript as the script.
3. A corrected sentence keeps the ASR word count for that sentence, or every timing after it shifts. Delete a word by emptying it (the audio stays).
4. Never invent words the speaker did not say. When unsure, generalize instead of guessing, and list the doubtful words for the user.

## 2. Units and highlights

- Whole words only; one element per word; never per-character spans.
- Karaoke highlight: color (and optional small scale) of the whole spoken word. A key word may get a highlight capsule when spoken.
- A highlighted or popped word stays until its sentence ends, at least 0.6 s; never a half-second flash.
- One caption group visible at a time.
- Keyword captions (news reel, edit type `news-reel`, or a reference that measures them): instead of a caption track, about 1 word in 4 is shown large, the content noun phrase that carries the clause, verbatim in the spoken form, never paraphrased, never late (first frame 20 f early to 3 f late against the word at 25 fps, median 4 f early). Each keyword is one whole shaped word or phrase revealed by a pointer-led mask, right to left, and leaves by a blink exit. Rules and numbers: the `ice-type` skill, `references/captions-system.md` "Keyword mode" and `references/type-effects-specs.md` table "Broadcast text". A keyword that sits on a stretched or justified line follows `references/kashida.md` section 4b.
- Red-to-white change (crimson-to-white title, scoped as above): the loaded word arrives crimson a few frames after it is spoken and turns white once said (measured 4 to 20 f after the word starts, colour change over 8 to 12 f). The colour changes on the whole shaped word at once, never on part of a word; it is a title, not a karaoke highlight, so a caption track in the same film keeps its own highlight logic (`ice-type` `references/type-effects-specs.md`, row "Crimson-to-white title").

## 3. Lines and length

- At most 2 lines; about 5 to 7 words per caption on reels; maximum line width about 730 px on a 1080-wide frame for card captions, 820 px for captions without a card (940 px entered the Instagram button column).
- Number and unit on one line; a long sentence shrinks to fit two lines instead of paging.
- Sizes: start from the `ice-type` caption scale and scale Arabic about 1.2 times.
- On-screen text complements the voiceover; it does not repeat it word for word. The frame shows the key words; the voice carries the sentence.

## 4. Timing

- A caption card appears about 0.1 s before its first word (never after) and leaves about 0.28 s after its last.
- First caption visible within the first 0.5 s on social formats.
- Sync after render: sentence starts within 0.1 s for word-highlight captions, about 0.15 s for sentence cards (`references/asr-timing.md`).

## 5. Placement

- Never on the face or hands. When the video sits in a card, the caption sits fully above the card, never on its edge. Captions placed at a fixed height fell onto the face when the video moved into a card; compute the caption position from the video's current rectangle.
- When a motion scene writes the same sentence on screen, hide that sentence's caption; two texts split attention.
- After a partial layered or behind-the-person effect, the caption shows only the words the effect did not show.
- A written hook hides every other text while it shows.
- Inside platform safe zones (`references/safe-zones-rtl.md`).

## 6. Caption styles scoped by type

| Style | Holds in |
|---|---|
| Still captions: fade in and out only, spoken word changes color, no jump, no pulse, no word moves | Calm premium ads, brand films |
| Word highlight plus occasional word moves on single words | Shorts and reels, energetic talking-head ads |
| White text with shadow, 2 to 3 words, spoken word in the accent color | Podcast clips |
| No captions (the hero word is the text) | Collage-style edits |
| Keyword captions with a pointer-led reveal and a blink exit, no running caption track | News reel whose package or reference runs no full captions (section 2) |
| Phrase captions wiped on right to left in 1 to 4 word chunks (type-on phrase captions) | Horizontal news reel versions whose reference measures them (`ice-type` `references/caption-styles.md`) |

## 7. Written hook over footage (shorts and reels from long episodes)

- Mandatory on reels cut from an interview or episode: readable from frame 1, shown for 0.9 s plus 0.28 s per word (1.6 to 3.0 s).
- Not the first sentence said: built from the strongest line in the clip.
- 3 to 8 words, two lines at most, at least one pull device (number, contradiction, question, curiosity gap, command, story); curiosity needs a real gap word, not a pointer word.
- Only words and numbers the speaker said (a number spoken as a word counts). Its promise resolves inside the clip. If 75 percent or more of its words come from the first two lines, it fails.
- Written in the profile's dialect, checked against the profile's word lists (`references/dialect-profiles.md`).
- Profile digits, no emoji, no names the audience does not know, no final full stop.
- Size at least 68 px; words settle with about 0.045 s stagger; an accent bar wipes from the right in 0.1 to 0.35 s; everything readable at frame 0 (it doubles as the cover).
- Hook card bounds on 1080x1920: x 140 to 940, y 230 to 1480.
- Show three hooks for the first reel; the user picks; keep that style for the rest.
- Hook formulas (fill from the speaker's own words): number plus paradox; question with two colliding numbers; failure before success; half-sentence story; contrary command; curiosity gap.

## 8. Sidecar files

- SRT: at most 42 characters per line, 2 lines per cue, from the same timings that were rendered; right-to-left marks as in `references/bidi-numerals-line-breaks.md`.
- Arabic WebVTT sidecar built from the script with ASR timings when viewers need captions.
- A `.txt` of the full corrected transcript for the post caption.
