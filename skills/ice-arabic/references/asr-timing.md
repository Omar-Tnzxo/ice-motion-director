> Sources: majedphotos/video-ad-editor (MIT, Copyright (c) 2026 Majed Alzaabi) `SKILL.md`, `references/landscape.md`, `references/phone-cloud-playbook.md`, `references/windows.md`, `references/podcast-hook.md` (translated); Omar-Tnzxo video-production-studio `references/talking-head.md`, `tools/transcribe.py` (founder's own); bradautomates/claude-video (MIT) transcription notes; heygen-com/hyperframes (Apache-2.0) transcription language rule; remotion transcription note. Ideas from imMamdouhaboammar/motion-graphics-skills rewritten. Changes: merged, scoped, dash characters removed.

# ASR for Arabic: timing only

ASR gives word timings. The words on screen come from the approved script (or, for footage, the corrected and approved transcript). Never paste raw ASR text into captions.

## 1. Settings

| Setting | Value |
|---|---|
| Language | Force `ar` (or the exact language code). Never auto-detect for Arabic; a small model can mislabel the language. A caption translation request is never the spoken-language hint |
| Model family | Multilingual only. `.en` models translate non-English audio into English |
| Model size | Medium or larger for dialect speech (small breaks on dialect); large-v3 or its turbo variant when available; a dialect fine-tune when one exists for the profile. Small only on a CPU-limited machine, followed by full manual correction and a doubt list |
| Word timestamps | On |
| Voice activity detection | On |
| Conditioning on previous text | Off |
| Temperature | 0 |
| Initial prompt | Brand names, product terms and names from the truth sheet |
| Parakeet and other European-only models | Not for Arabic |

## 2. Long audio

- Never transcribe a long episode in one pass: it dropped minutes and invented a stock "subscribe to the channel" line.
- Cut about 20 s chunks at silences, transcribe each, shift timestamps by each chunk's offset; a failed chunk becomes a reported gap, never a silent hole.

## 3. Hallucination guards

- ASR invents phrases over silence, especially trailing silence (stock subscribe or thank-you lines).
- Drop words with near-zero duration and anything after the last scripted word.
- If a transcript is garbage, retry once with a larger model; if it is still garbage, stop and report instead of captioning it.

## 4. Correcting and aligning

1. Talking-head footage: print numbered sentences with times; mark near-duplicate sentences (the first is usually the mistake, the second the correction); a human approves the script before design.
2. Fix misheard words keeping the same word count per sentence; empty a word to delete it; never invent; list doubtful words for the user.
3. Scripted voiceover: align ASR words to the script's word list and take every on-screen word from the script.
4. Arabic matching traps when comparing ASR words to script words: digits versus number words (a spoken number word counts as the digit), clitics split or merged (و، ب، ل، ال), MSA spellings of dialect words, and letter variants. Normalize before comparing (for example treat أ إ آ as ا, ة as ه, ى as ي) and keep the script's spelling for display.
5. Cross-check word times against measured pauses (silence detection around -40 dB): pauses over about 120 ms should fall on word gaps.
6. Fire each word cue a small fixed lead before it is spoken (0 to 0.1 s), never after.

## 5. After render

- Re-transcribe the delivered audio; sentence starts must sit within 0.1 s of caption times for word-highlight captions and about 0.15 s for sentence cards.
- Compare the words too, not only the times: run `align_script_to_asr.py --check-captions` from the `ice-type` skill on the captions and the fresh transcript (it folds diacritics, tatweel, alef forms, alef maqsura and yaa, taa marbuta and haa, and Arabic-Indic digits, so spelling variants do not count as mismatches; pass `--max-offset 0.1` for word-highlight captions). Gate and resolution: the `ice-qa` skill, `references/captions-and-sync.md`, "Fresh transcript gate".
- Seam check on edits: transcribe about 4 s around every join and look for repeated or cut words.
- Anchor captions, scenes and SFX to "sentence N, word K" of the corrected transcript, never to typed seconds, so deleting a sentence ripples safely.


## Arabic voiceover and TTS

> Sources: Omar-Tnzxo video-production-studio `references/audio.md`, `references/concepts-and-scripts.md` (founder's own, wording kept); majedphotos/video-ad-editor (MIT, Copyright (c) 2026 Majed Alzaabi) `references/motion-mode.md`, `references/onboarding.md`, `motion/ENGINE-API.md` (translated); heygen-com/hyperframes (Apache-2.0) narration note. Changes: merged, dialect generalized, project paths removed, dash characters removed.


Mixing, loudness, ducking and audio editing traps belong to `ice-audio`. This file holds voice choice and text preparation for Arabic.

### 1. Choosing the voice

- There is no default voice: the user chooses. Cast from reference ads of that market (age, gender, energy that fit the audience), generate the same two or three lines with two or three candidate voices, check each with ASR for clarity, and let the user choose by ear.
- Generate the voiceover early: its word timings drive shot lengths, captions and motion.

| Situation | Voice route |
|---|---|
| A tested voice reads the profile's dialect well | That dialect voice (free engines such as edge-tts list voices for many Arabic locales, with word timings) |
| No free voice carries the dialect (they sound like formal Arabic with an accent, or break the dialect) | A premium voice, a cloned voice, or a fully diacritized MSA read when the brand allows it |
| The person on camera or the owner records | Their own voice; never cut inside speech; levels per `ice-audio` |
| An engine without word timings | Align the generated audio with ASR (`references/asr-timing.md`) |

Cloning a real person's voice follows the `ice-assets` skill, `references/ai-media-policy.md` section 9: no permission question, one neutral rights line in the brief.

### 2. Preparing Arabic text for TTS

- Write numbers as words in the chosen dialect in the voiceover text; the screen keeps digits.
- Write brand names and loanwords the way they sound in the target dialect. If a voice mispronounces a name, try it with full vowel marks in Arabic letters (slot: `<brand name with full diacritics>`), and test the Latin spelling too; keep whichever the engine reads right. Screen copy still follows the truth sheet spelling.
- For fully diacritized MSA reads: diacritize every word; write a final ta marbuta as ha in the spoken text when the engine pronounces it wrongly; avoid the dagger alef.
- Punctuation costs time: TTS pauses at colons, ellipses and every comma. A tight line loses extra commas before it loses words.
- Premium voices: one take for the whole script, then cut at the silences into one file per line (generating line by line changed the tone). Confirm every cut by transcription.

### 3. Pace

| Variety | Human ad read (words per second) |
|---|---|
| Egyptian, Levantine | 2.2 to 2.6 |
| Gulf, MSA | 2.0 to 2.4 |
| English (for mixed films) | 2.5 to 3.0 |

- Free TTS voices are slower once their pauses count (about 2.0 to 2.3 for Egyptian at +22%). Plan about 10 to 12 words for a 6 s shot at that pace.
- Rate settings seen: ad energy +15% to +25%; calm brand films +0% to +10%. Do not speed past about +30%; a fit tool may stretch a line from -15% to +35%, but a line that still does not fit gets shorter, not faster.
- One VO line per shot; the line starts after the shot starts and ends before the cut (except deliberate J and L cuts). The first word starts within 0.3 to 0.8 s of the film start; the last line ends before the end card's final second.

### 4. Checks

Listen to every line before building on it, and transcribe it with a medium or larger model: every word present, no swapped dialect words, numbers spoken as intended.


## Dialect as a setting

> Sources: Omar-Tnzxo video-production-studio `references/concepts-and-scripts.md`, `references/industry-playbooks.md`, `references/audio.md`, `references/intake-and-routing.md`, `references/anti-sameness.md` (founder's own, wording kept, Egyptian items framed as one profile); majedphotos/video-ad-editor (MIT, Copyright (c) 2026 Majed Alzaabi) `references/podcast-hook.md`, `references/phone-cloud-playbook.md`, `references/motion-mode.md` (translated; Kuwaiti default turned into one profile). Changes: dialect made a setting, project-specific paths removed, dash characters removed.


### 1. Rule

The dialect is a slot in `ice/BRIEF.md`, filled per project. No file in this repo assumes a country.

| Brief says | Set |
|---|---|
| A city or country audience | That city's spoken dialect ("Write in the audience's real dialect"); ads in the Arab world speak the city's dialect, not MSA, unless the brand voice is formal |
| A formal brand, government, pan-Arab audience, or the user asks for formal | MSA |
| "Arabic" only, with a script or voiceover to write | Ask once through `ice-direction`, recommended option first (the audience city's dialect if known) |
| "Arabic" only, text-light film with no voice | Decide (MSA or the most likely audience dialect) and log why |

### 2. Profile template

Fill one block per project (store it with the brand design system under `language`):

```
dialect: <city or region, or MSA>
register: <everyday spoken | polished spoken | formal>
spelling_conventions: <list of chosen spellings for common words>
use_words: <everyday words this audience says>
avoid_words: <MSA words nobody says here, other-region words, rural words, each with its replacement>
loanwords_in_use: <English or French words this audience really uses>
digits: <western | arabic-indic>
currency_word: <as written in this dialect>
pace_wps_human: <range>
tts_voices_tested: <engine and voice ids, with verdict>
asr_hint: <language code, model, dialect fine-tune if any>
native_reader: <who signs off>
learned: <dated corrections from the native reader>
```

Fill it from the user's answers, the brand's existing copy, dated research built from brief slots (`ice-direction`), and the native reader (the user by default, `SKILL.md` section 2 rule 10). Never from memory alone.

### 3. Dialect review (every line, every time)

1. Read each word and flag: rural or other-region words, MSA words nobody says in that city, translated phrasing, English words the audience does not use (keep the ones they do).
2. Read it aloud with the chosen TTS voice. A line that sounds translated is rewritten, not tweaked.
3. Spelling: consistent conventions from the profile; no diacritics except where a word would be misread; digits from the profile.
4. Brand and product names: exactly as the brand writes them, in the script language (Arabic name in Arabic copy).
5. Ask the user, a native of the city, to read the final script once. Their corrections go into the profile under `language` and `learned`.

Common drift to catch: builders and sub-agents rewording the approved voiceover, drifting into MSA, or translating an English idea word for word.

### 4. Copy bans in Arabic

- Translated MSA marketing phrases inside a dialect ad (illustration only: "اكتشف عالم", "استمتع بتجربة فريدة").
- Paragraphs and extra slogans on screen; full stops after headlines.
- Concrete over abstract: a specific everyday line beats a generic promise (general copy rules live in `ice-direction`).

### 5. Example profiles (illustration only, never defaults)

These show how real projects filled the setting. Copy none of them onto a different audience.

**Egyptian, Cairo (from the founder's campaigns)**
- Spelling conventions: "إيه", "عشان", "دلوقتي".
- Loanwords in use: "أوردر", "ديليفري".
- Rural flag example: "قوطة" reads rural in Cairo; use "طماطم".
- Currency: "جنيه". Digits: Western unless the brand uses Arabic-Indic.
- Pace: human read 2.2 to 2.6 words per second; free Egyptian TTS at +22% about 2.0 to 2.3 once pauses count.
- TTS voices that read it: edge-tts `ar-EG-ShakirNeural` (male), `ar-EG-SalmaNeural` (female).
- ASR: an Egyptian fine-tuned faster-whisper model when cached, else large-v3 turbo.

**Gulf, Kuwaiti (from video-ad-editor)**
- Use words: شنو، شلون، ليش، بس، الحين، وايد، جذي، أبي، مو، اللي.
- Avoid (MSA or other region): وش، كيف، فقط، لماذا، الآن، جداً، سوف، ليس، الذي.
- Pace: Gulf and MSA reads 2.0 to 2.4 words per second.
- ASR errs on Gulf dialect words (a phrase split into a different word); keep unknown words literal and list doubts.
- Free TTS voices broke the dialect; the project used fully diacritized MSA TTS or the person's own voice.

**MSA (formal)**
- Pace 2.0 to 2.4 words per second; diacritize fully for TTS; still avoid stiff translated phrasing.

**Other varieties** (Levantine, Saudi, Emirati, Iraqi, Maghrebi, Sudanese and more): the sources hold no word lists. Build the profile by research and a native reader. Levantine human reads share the 2.2 to 2.6 words per second range with Egyptian. edge-tts lists voices for ar-SA, ar-AE, ar-JO, ar-LB, ar-MA and other locales; test each by ear.

### 6. Hooks and narration in a dialect

- Written hooks pass the profile's use and avoid lists (`references/arabic-captions.md`, section 7).
- Narrator ads in a dialect market: study the local narrator style first (real ads from that market). Patterns found in one market study, to test elsewhere rather than assume: two short questions as the hook; one turn word with a beat of air; one idea per line; the brand said alone; the CTA last.
- Seasons and occasions change tone (`references/arabic-qa-checks.md` (section "Sacred text, seasons and culture")).
