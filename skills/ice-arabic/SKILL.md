---
name: ice-arabic
description: "Internal part of Ice Motion Director, not a command: start with /ice. Arabic and right-to-left rules for motion and video: letterforms and dots in motion, kashida, bidi isolation, numerals, line breaking, Arabic captions, platform safe zones for Arabic text, cover text sizes, Arabic font selection and per-language font checks, dialect as a setting for scripts and voiceover, ASR used for timing only, and Arabic failure lessons. Called by Ice Motion Director workflows; use only when called by name."
license: Apache-2.0
metadata:
  author: Omar-Tnzxo
  version: 0.2.7
---

# ice-arabic

Domain skill. Holds every rule for Arabic and right-to-left (RTL) text, captions, voice and timing in video. Workflows (`ice-film`, `ice-explainer`, `ice-remake`, `ice-edit`, `ice-lottie`, `ice-ideas`) call it by name; it never runs on its own.

Call it when any of these is true:
- The `language and dialect` slot in `ice/BRIEF.md` names Arabic, or any Arabic-script language (Persian, Urdu, Pashto, Kurdish Sorani), or Hebrew.
- The film mixes an RTL language with Latin text, names or numbers.
- Footage, voiceover or music lyrics to caption are in Arabic.

Arabic and right-to-left text are first class on every route. A film with malformed Arabic fails delivery whatever its other qualities.

## 1. Set the language profile first

Before any script, layout or caption work, fill a language profile and record it in the `language and dialect` slot of `ice/BRIEF.md`. Every choice names its source (prompt, design file, reference, answer, decision), and each decision goes to `ice/DIRECTION.md` through `ice-direction`.

| Field | Values | How to decide when the brief is silent |
|---|---|---|
| Script and direction | Arabic RTL, Persian RTL, Urdu RTL, Hebrew RTL, mixed with Latin | From the copy the user supplied |
| Variety (dialect) | A city or region dialect, MSA (formal), or mixed | From the audience city; formal brands and pan-Arab work lean to MSA. Never default to one country |
| Register | Everyday spoken, polished spoken, formal | From brand voice and film type |
| Digits | Western (0-9) or Arabic-Indic | Section 4 of `references/bidi-numerals-line-breaks.md` |
| Font roles | Display, text, Latin companion, sacred text if any | `references/fonts-and-shaping.md` with `ice-direction` type pairing |
| Voice source | Human, TTS with a dialect voice, TTS in diacritized MSA, the speaker on camera | `references/asr-timing.md` (section "Arabic voiceover and TTS") |
| ASR hint | Language code and model choice | `references/asr-timing.md` |
| Native reader | Who signs off the final script | The user by default, never asked as a question; or a person the user names |

Ask only when the answer changes the film. The usual case: there is a script or voiceover and the dialect is unknown. Ask once, through `ice-direction` question rules, with the audience city's dialect as the recommended option. Everything else is decided and logged.

The dialect is a setting, never a constant. No rule in this skill assumes Egyptian, Gulf, Levantine or any other variety; the profiles in `references/asr-timing.md` (section "Dialect as a setting") are illustrations of how to fill the setting.

## 2. Hard rules (every film type)

1. **Animate Arabic by line, phrase, word or whole shaped run.** Never split Arabic into single characters, never type it letter by letter. Letter-level effects work only on connected components of a fully shaped line. A pointer-led mask reveal and a coloured-head typewriter built as a mask over a pre-shaped line are not letter typing (`references/letterforms-in-motion.md` section 1). See `references/letterforms-in-motion.md`.
2. **No letter-spacing on Arabic.** Create air with size, leading, word spacing, width, weight and layout. Never animate letter-spacing on Arabic.
3. **Never clip a letter that is read.** Dots, hamza, diacritics, descenders and final forms stay whole. Any overlapping card, sheet, mask edge or polygon stays above the dot and descender zone of a word meant to be read.
4. **Kashida only by its placement rules** (`references/kashida.md`), only as a deliberate display effect, never as justification filler, never on sacred text, never on numbers. Note (scoped): in a news reel (edit type `news-reel`) or when a reference measures it, multi-line display blocks and end-card lines are justified to one width with kashida (`references/kashida.md` section 4b); that is a display layout, never applied to captions, numbers, Latin, sacred text or UI copy, and its count follows the reference.
5. **Isolate every Latin run and every number** inside Arabic lines so bidi never reorders them; punctuation sits outside the isolated run.
6. **One digit system per film,** taken from the profile, checked in rendered pixels.
7. **Break lines by meaning.** A number stays on one line with its unit. Shorten copy before shrinking it.
8. **Fonts are shipped files that cover every glyph used,** loaded with an Arabic sample before the first frame, and verified from rendered pixels, per script.
9. **On-screen words and captions come from the approved script.** ASR supplies timing only.
10. **Every script line passes a dialect review** against the selected profile, and a native reader signs off: the user by default (or a person the user names): the Arabic script is shown for sign-off with the preview approval in auto mode, or on the 03 review card in step mode; when neither happens, the delivery note lists the sign-off as open.
11. **Motion follows the reading direction.** Wipes, fills, slides, cursor sweeps and page turns travel right to left; media timelines, play icons, clocks and circular timers, chart time axes, check marks and brand logos never mirror (`references/letterforms-in-motion.md` section 6).
12. **Never let an image or video model draw Arabic letters.** Composite live text over generated material.
13. **Malformed Arabic shaping or RTL order is a hard release failure,** reported through `ice-qa` (`references/arabic-qa-checks.md`).

## 3. Scoped rules (sources disagree; each holds where stated)

Type names follow the film types of the `ice-film` skill (`references/film-types/`) and the edit types of the `ice-edit` skill (`references/edit-types/`).

| Topic | Rule A and where it holds | Rule B and where it holds |
|---|---|---|
| Kashida stretch | Allowed as a display effect, at most twice per video, under the placement rules: talking-head ad, shorts and reels, social short, kinetic type, hype promo | Banned as justification or decoration in body text and captions: every type. Banned on product UI text in UI walkthrough and app ad screens |
| Justified display block (news reel) | Display blocks and end-card lines justified to one width with kashida, the count following the reference: news reel (edit type `news-reel`) and any film whose reference measures it (`references/kashida.md` sections 4b and 4c) | Never in captions, numbers, Latin, sacred text or UI copy; with no reference, a news reel keeps the twice-per-video limit |
| Digits | Western digits: default for social ads and edits when the profile does not say otherwise | Arabic-Indic digits: when the brand, market or formal register uses them, and for verse numbers in sacred text |
| Reading hold for a word | At least 0.6 s for any word on screen and for a highlighted caption word (it stays to its sentence end): talking-head ad, shorts and reels, podcast, motion films with captions | At least 0.9 s for an important standalone Arabic line (54 frames at 60 fps) unless it stays legible through a handoff: product launch, app ad, brand film, kinetic type, hype promo, industry spot, logo sting |
| Caption sync tolerance | Sentence start within 0.1 s of the re-transcribed audio: word-highlight (karaoke) captions | Within about 0.15 s: sentence or card captions |
| Text weight | Bold or Black only: covers and thumbnails | A weight hierarchy, never three levels in the heaviest weight: inside the film |
| Text in Canvas 2D | Allowed in Chromium with `direction = 'rtl'`, the Arabic font loaded, and a pixel check: talking-head ad and shorts engines built on canvas | DOM or SVG text by default; Canvas only when shaping is proven: every other type |
| ASR model size | Medium or larger, or a dialect fine-tune, for dialect speech: every edit type | Small only on a CPU-limited machine, followed by full manual correction and a listed doubt report |
| TTS for a dialect | A dialect voice when a tested voice carries it: app ad, social short, product launch | Fully diacritized MSA, or a human or premium voice, when no free voice carries it: every type |
| Safe zone for text | The single platform's preset: one target platform | The conservative cross-platform band (y 360 to 1420 on 1080x1920, out of the right 120 px): one master posted to several platforms |
| Caption style | Word highlight and word moves: shorts and reels, talking-head ad with an energetic profile | Still captions (fade only, color change of the spoken word kept, no pulse, no word moves): calm premium ads and brand films |

## 4. Workflow hook points

| Stage of the calling workflow | Open |
|---|---|
| Intake (language slot) | This file, section 1; `references/asr-timing.md` (section "Dialect as a setting") |
| Script and copy | `references/asr-timing.md` (section "Dialect as a setting"); `references/bidi-numerals-line-breaks.md` |
| Voiceover | `references/asr-timing.md` (section "Arabic voiceover and TTS") |
| Transcribing footage or VO | `references/asr-timing.md` |
| Type and font choice | `references/fonts-and-shaping.md` |
| Building motion with Arabic text | `references/letterforms-in-motion.md`; `references/kashida.md` when a stretch effect is planned |
| Engine setup | `references/engine-overrides.md` |
| Captions and subtitles | `references/arabic-captions.md`; `references/safe-zones-rtl.md` |
| Cover or thumbnail | `references/arabic-qa-checks.md` (section "Covers and thumbnails with Arabic text") |
| Sacred text, seasons, culture | `references/arabic-qa-checks.md` (section "Sacred text, seasons and culture") |
| Debugging a strange Arabic defect | `references/arabic-qa-checks.md` (section "Arabic failure lessons") |
| QA before delivery | `references/arabic-qa-checks.md` (run through `ice-qa`) |

## 5. What other skills own

Point to these instead of restating them:
- `ice-type`: general typography, caption design systems, base caption sizes, readability gates. This skill adds the Arabic overrides (size factor, units, holds).
- `ice-motion`: easing curves, durations, springs, transitions, camera. This skill sets only direction and units for Arabic.
- `ice-audio`: mixing, loudness, music, SFX, VO pacing mechanics. This skill holds dialect voice choice and Arabic text preparation for TTS.
- `ice-engines`: engine choice, determinism, render, platform specs. This skill holds RTL overrides per engine and Arabic text placement inside safe zones.
- `ice-assets`: font licensing and sourcing, truth sheet, brand asset authenticity.
- `ice-direction`: questions to the user, research, type pairing, every decision record.
- `ice-edit`: silence cuts, segmentation masks, multi-cam, layouts for talking heads.
- `ice-qa`: runs the gates; this skill supplies the Arabic checks.

## 6. Output contract

When called, return to the workflow:
1. The filled language profile (section 1 table) with a source per field.
2. The list of Arabic rules that apply to this film type (section 2 plus the scoped rows of section 3 that match).
3. Any blocker: missing dialect for a VO, missing font coverage, sacred text without a verified source. A script without native sign-off is not a blocker when the user, the default reader, was not asked or did not answer: the delivery note lists the sign-off as open.

## Files

| File | Open when |
|---|---|
| `references/letterforms-in-motion.md` | Animating any Arabic text: units, allowed kinetic patterns, dots and clipping, masks, blur, motion direction, holds |
| `references/kashida.md` | Planning a stretched word, a text-behind-the-person effect or a layered hook; validating kashida placement |
| `references/fonts-and-shaping.md` | Choosing Arabic fonts, sizes and weights; loading fonts; running the per-language font check |
| `references/engine-overrides.md` | Setting up HyperFrames, GSAP, Remotion, Canvas, SVG, Pillow, FFmpeg, Lottie or Three.js for Arabic; overriding HyperFrames caption defaults |
| `references/bidi-numerals-line-breaks.md` | Mixed Arabic and Latin lines, numbers, units, ranges, line breaks, subtitle files, multi-language versions |
| `references/arabic-captions.md` | Building Arabic captions, karaoke highlights, hooks over footage, SRT and VTT sidecars |
| `references/safe-zones-rtl.md` | Placing Arabic text on vertical video for Instagram, TikTok, YouTube Shorts, Snapchat, Facebook Reels |
| `references/arabic-qa-checks.md` (section "Covers and thumbnails with Arabic text") | Reel covers, profile grid legibility, YouTube thumbnails with Arabic text |
| `references/asr-timing.md` (section "Dialect as a setting") | Filling the dialect setting, dialect review, spelling, dialect hooks, narrator patterns |
| `references/asr-timing.md` (section "Arabic voiceover and TTS") | Choosing an Arabic voice, preparing text for TTS, pace by dialect |
| `references/asr-timing.md` | Transcribing Arabic speech for timing, correcting transcripts, aligning to the script, sync checks |
| `references/arabic-qa-checks.md` (section "Sacred text, seasons and culture") | Quran or other sacred text, religious seasons, regional culture in motion and imagery |
| `references/arabic-qa-checks.md` (section "Arabic failure lessons") | A defect appeared; check whether it is a known Arabic failure before debugging |
| `references/arabic-qa-checks.md` | Before every review round and before delivery |
