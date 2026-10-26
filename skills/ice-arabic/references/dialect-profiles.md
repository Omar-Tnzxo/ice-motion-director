> Sources: Omar-Tnzxo video-production-studio `references/concepts-and-scripts.md`, `references/industry-playbooks.md`, `references/audio.md`, `references/intake-and-routing.md`, `references/anti-sameness.md` (founder's own, wording kept, Egyptian items framed as one profile); majedphotos/video-ad-editor (MIT, Copyright (c) 2026 Majed Alzaabi) `references/podcast-hook.md`, `references/phone-cloud-playbook.md`, `references/motion-mode.md` (translated; Kuwaiti default turned into one profile). Changes: dialect made a setting, project-specific paths removed, dash characters removed.

# Dialect as a setting

## 1. Rule

The dialect is a slot in `ice/BRIEF.md`, filled per project. No file in this repo assumes a country.

| Brief says | Set |
|---|---|
| A city or country audience | That city's spoken dialect ("Write in the audience's real dialect"); ads in the Arab world speak the city's dialect, not MSA, unless the brand voice is formal |
| A formal brand, government, pan-Arab audience, or the user asks for formal | MSA |
| "Arabic" only, with a script or voiceover to write | Ask once through `ice-direction`, recommended option first (the audience city's dialect if known) |
| "Arabic" only, text-light film with no voice | Decide (MSA or the most likely audience dialect) and log why |

## 2. Profile template

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

## 3. Dialect review (every line, every time)

1. Read each word and flag: rural or other-region words, MSA words nobody says in that city, translated phrasing, English words the audience does not use (keep the ones they do).
2. Read it aloud with the chosen TTS voice. A line that sounds translated is rewritten, not tweaked.
3. Spelling: consistent conventions from the profile; no diacritics except where a word would be misread; digits from the profile.
4. Brand and product names: exactly as the brand writes them, in the script language (Arabic name in Arabic copy).
5. Ask the user, a native of the city, to read the final script once. Their corrections go into the profile under `language` and `learned`.

Common drift to catch: builders and sub-agents rewording the approved voiceover, drifting into MSA, or translating an English idea word for word.

## 4. Copy bans in Arabic

- Translated MSA marketing phrases inside a dialect ad (illustration only: "اكتشف عالم", "استمتع بتجربة فريدة").
- Paragraphs and extra slogans on screen; full stops after headlines.
- Concrete over abstract: a specific everyday line beats a generic promise (general copy rules live in `ice-direction`).

## 5. Example profiles (illustration only, never defaults)

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

## 6. Hooks and narration in a dialect

- Written hooks pass the profile's use and avoid lists (`references/arabic-captions.md`, section 7).
- Narrator ads in a dialect market: study the local narrator style first (real ads from that market). Patterns found in one market study, to test elsewhere rather than assume: two short questions as the hook; one turn word with a beat of air; one idea per line; the brand said alone; the CTA last.
- Seasons and occasions change tone (`references/sacred-and-cultural.md`).
