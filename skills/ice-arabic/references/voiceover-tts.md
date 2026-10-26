> Sources: Omar-Tnzxo video-production-studio `references/audio.md`, `references/concepts-and-scripts.md` (founder's own, wording kept); majedphotos/video-ad-editor (MIT, Copyright (c) 2026 Majed Alzaabi) `references/motion-mode.md`, `references/onboarding.md`, `motion/ENGINE-API.md` (translated); heygen-com/hyperframes (Apache-2.0) narration note. Changes: merged, dialect generalized, project paths removed, dash characters removed.

# Arabic voiceover and TTS

Mixing, loudness, ducking and audio editing traps belong to `ice-audio`. This file holds voice choice and text preparation for Arabic.

## 1. Choosing the voice

- There is no default voice: the user chooses. Cast from reference ads of that market (age, gender, energy that fit the audience), generate the same two or three lines with two or three candidate voices, check each with ASR for clarity, and let the user choose by ear.
- Generate the voiceover early: its word timings drive shot lengths, captions and motion.

| Situation | Voice route |
|---|---|
| A tested voice reads the profile's dialect well | That dialect voice (free engines such as edge-tts list voices for many Arabic locales, with word timings) |
| No free voice carries the dialect (they sound like formal Arabic with an accent, or break the dialect) | A premium voice, a cloned voice, or a fully diacritized MSA read when the brand allows it |
| The person on camera or the owner records | Their own voice; never cut inside speech; levels per `ice-audio` |
| An engine without word timings | Align the generated audio with ASR (`references/asr-timing.md`) |

Cloning a real person's voice follows the `ice-assets` skill, `references/ai-media-policy.md` section 9: no permission question, one neutral rights line in the brief.

## 2. Preparing Arabic text for TTS

- Write numbers as words in the chosen dialect in the voiceover text; the screen keeps digits.
- Write brand names and loanwords the way they sound in the target dialect. If a voice mispronounces a name, try it with full vowel marks in Arabic letters (slot: `<brand name with full diacritics>`), and test the Latin spelling too; keep whichever the engine reads right. Screen copy still follows the truth sheet spelling.
- For fully diacritized MSA reads: diacritize every word; write a final ta marbuta as ha in the spoken text when the engine pronounces it wrongly; avoid the dagger alef.
- Punctuation costs time: TTS pauses at colons, ellipses and every comma. A tight line loses extra commas before it loses words.
- Premium voices: one take for the whole script, then cut at the silences into one file per line (generating line by line changed the tone). Confirm every cut by transcription.

## 3. Pace

| Variety | Human ad read (words per second) |
|---|---|
| Egyptian, Levantine | 2.2 to 2.6 |
| Gulf, MSA | 2.0 to 2.4 |
| English (for mixed films) | 2.5 to 3.0 |

- Free TTS voices are slower once their pauses count (about 2.0 to 2.3 for Egyptian at +22%). Plan about 10 to 12 words for a 6 s shot at that pace.
- Rate settings seen: ad energy +15% to +25%; calm brand films +0% to +10%. Do not speed past about +30%; a fit tool may stretch a line from -15% to +35%, but a line that still does not fit gets shorter, not faster.
- One VO line per shot; the line starts after the shot starts and ends before the cut (except deliberate J and L cuts). The first word starts within 0.3 to 0.8 s of the film start; the last line ends before the end card's final second.

## 4. Checks

Listen to every line before building on it, and transcribe it with a medium or larger model: every word present, no swapped dialect words, numbers spoken as intended.
