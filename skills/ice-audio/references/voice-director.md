# Voice director: the voice stage, providers, direction, takes, fit and finish

Read when a film has a narrator: at stage 01 to ask `Q-voice` and pick the access route, at 03 to write each line's spoken side and direction, before generating or recording any line, when fitting lines to their frame slots, and at 08 for each line's processing. Writing for the ear, word budgets, duration estimates, pace measurement and recorded-voice cleanup stay in `voiceover.md`; mixing and loudness in `mix-and-master.md`; Arabic text preparation, dialect and numbers in the `ice-arabic` skill, `references/voice-arabic.md`. Sources: the provider documents and tests in section 2 (read 2026-11-01), the founder's own voice tests (2026-11-01), and the measured rules already in this skill.

## 1. Two routes, one stage (founder decision, 2026-11-01)

Ice gives a film a complete, professional voice by one of two routes, chosen by the user at stage 01 (`Q-voice`, `ice-direction/references/questions.md`):

1. **The user's recording.** Ice sends a timed script (every line with its slot in seconds, its spoken text and its direction) and the recording guide (section 7). The user records on a phone or a microphone and sends every take; Ice picks, fits and finishes them.
2. **A voice provider the user has.** The agent generates every line with the provider through the first access route that works (section 3), with the direction of section 5, takes of section 6 and fit of section 8, and records each take's source (section 9).

A voice is generated only when the user chose route 2 (AGENTS.md positioning: AI voice is optional, user-initiated and disclosed). Music and sound effects are never generated, by any provider or by code, on either route (core rule 7): a provider account that also offers music, sound effects, video to music or sound-making audio tags is used for the voice only.

## 2. Providers and models (read 2026-11-01; re-read the provider's model page before a run)

| Use | Provider and model | Why | Limits to plan around |
|---|---|---|---|
| Default for every language | ElevenLabs `eleven_v4` | The most directable voice: free-form audio tags in square brackets, 90+ languages, a large library of native voices per dialect, character timings back with the audio, Forced Alignment for any recording | No speed setting, no style setting, no SSML; 10,000 characters per request; tag reliability improving, so takes matter |
| Needs a speed setting or SSML breaks | ElevenLabs `eleven_multilingual_v2` | `speed`, `<break time="1.0s" />` up to 3 s, steady on long reads | No audio tags (brackets are read aloud); 29 languages |
| Second provider, and Arabic dialects when the default voice fails | Google `gemini-3.8-flash-tts` | Names Egyptian Arabic and Standard Arabic as separate languages, a natural-language style per turn, angle-bracket pause and breath tags, voice design | No word timings (align after, section 8); labelled preview |
| Steady fallback | Microsoft Azure AI Speech (Arabic locales such as `ar-EG`) | SSML prosody and lexicon, word boundary times | Little emotion for ads |
| Draft only | Local free engines already named in `ice-arabic` (edge-tts) | Free, word times | Never the final voice |
| Never | Hume (TTS and EVI APIs end 2026-11-13), PlayHT (closed 2025-12-31), OpenAI speech models (shut down 2027-01-06; their replacement is real-time only) | Ending or ended | |

Prices change: before a run, read the provider's current pricing page and state the expected cost in the stage 01 message. Measured on `eleven_v4` (2026-11-01): about 1 credit per character, and tags and Arabic diacritics count as characters (the same Egyptian sentence cost 53 credits unmarked and 76 fully marked).

**Licence.** A provider's free plan may forbid commercial use (ElevenLabs' free plan has no commercial licence; paid plans license audio made while subscribed). The source record (section 9) names the plan and the terms page read on the run's date; the delivery note says what the user's plan allows. A free-plan voice in a commercial film is listed as `needs purchase`, never hidden.

## 3. Access on any agent, never touching credentials

Take the first route that works; say in the stage 01 message which one the run will use.

1. **The provider's MCP server, already connected by the user** (for ElevenLabs the hosted server signs in through the user's own browser with OAuth; agents expose it as a connector or an MCP entry).
2. **The provider's API with the user's own key already in an environment variable** (for example `ELEVENLABS_API_KEY`, `GEMINI_API_KEY`, `AZURE_SPEECH_KEY` with `AZURE_SPEECH_REGION`). Check only that the variable exists; never print, log, copy or write a key.
3. **The agent's built-in browser on the provider's website** (Claude's in-app browser or Claude in Chrome, Antigravity's browser, any agent browser), where the user signs in himself. The agent pastes each line's spoken text and tags, picks the voice and model, generates, downloads into `ice/audio/voice/`, and records the take. A sign-in, plan, payment or terms page: stop and hand it to the user.
4. **The user generates or records and uploads** the files into `ice/audio/voice/`.

The agent never types a password or a key, never creates an account, never buys, upgrades or accepts terms for the user, and never moves a key into a project file. No route available and the user chose route 2: offer route 1 or on-screen words, as `Q-voice` says.

## 4. The voice lines file: `ice/audio/voice/lines.json`

One file per film, written at 03 and filled at 08a; `scripts/voice_fit.py` reads it. Fields:

| Field | Holds |
|---|---|
| `route` | `provider` or `recording` |
| `language`, `variety` | For example `ar` with `egyptian` or `msa`; `en` with the market |
| `fps` | The film's frame rate |
| `voice` | `provider`, `model`, `voice_id`, `voice_name`, `access` (mcp, api, browser, upload), `plan`, `license_terms` (terms page and the date read), `date`; for a recording: the speaker's name the user gives |
| `lines[]` | One object per narrator line |
| `lines[].id`, `display`, `spoken` | The line id; the text shown on screen and in captions; the text the voice reads (`voiceover.md` section 2 two-layer script; Arabic: numbers as words and the marking of `voice-arabic.md`) |
| `lines[].direction` | `intent` (what the line must make the viewer feel), `energy` (1 to 5), `delivery` (warm, close, bright, hushed and so on), `tags` (the provider's tags that express it), `beat` (the script beat and shot ids) |
| `lines[].slot` | `start_frame`, `end_frame` from the storyboard and animatic; `follows` (`cut`, `music phrase`, `beat`) |
| `lines[].takes[]` | `id`, `file`, `seed`, `request_id`, `date`, `words` (word list with start and end), `score` (`words_ok`, `emotion` 1 to 5, `artefacts`, `note`), `fitted_file` and `fit_factor` after fitting |
| `lines[].chosen` | The take id that goes into the film |
| `lines[].fx` | The line's processing (section 10) and its `verify` measure |

## 5. Direction: cast, then direct the line, not the film

1. **Cast before directing.** Audition 2 to 3 voices on the same two hero lines (the hook and the last line). Choose a voice whose own range already holds the film's main feeling; a calm voice will not shout well with a shouting tag. Prefer a native voice of the target language and dialect: `eleven_v4` drops the reference accent when a voice speaks another language. Founder defaults per language: `voice-arabic.md` section 1.
2. **An emotion map per line.** From the script's beats and the cue map, write each line's `intent`, `energy` and `delivery` before any tag. The arc of the film (for illustration only: curiosity, then tension, relief, confidence) decides where the delivery changes.
3. **Tags only where the delivery changes** (`eleven_v4`): one tag holds until the next. Describe how the line sounds, not what the speaker does: emotion words, delivery words (whispers, softly, slowly), voice quality, breaths and sighs, pauses. Stack two at most. Never a tag that makes a sound effect (applause, explosion, gunshot and the like): it is a generated effect inside the voice track and is banned (core rule 7).
4. **The text is the strongest control.** Short sentences, a comma for a breath, an ellipsis for weight, a full stop to end a thought, one capitalised word for stress in Latin scripts, a line break between beats. `[slowly]` with an ellipsis slowed an `eleven_v4` read from 2.2 to 1.6 words per second in the founder's test: use text and tags for pace before any post tempo.
5. **Gemini and other providers:** the style text names the dialect, the feeling and the pace per turn; tags in English inside non-English text; the transcript is read word for word, so no stage directions in it.
6. **Pronunciation:** settle it before estimating duration (`voiceover.md` section 2). On `eleven_v4` an IPA spelling between slashes fixes a stubborn word; a pronunciation dictionary (up to 3 per request, first match wins) fixes a brand everywhere at once.

## 6. Takes and selection

- 2 takes per line by default; 3 to 4 for the hook and the last line. Same voice, same model and same settings across the film; never mix voices or models inside one narrator.
- Consistency: generate the whole script in one request and cut at the silences into lines (most even tone), or line by line passing the neighbours' text or request ids (`previous_text`, `next_text`, up to 3 request ids) and a fixed `seed`. To patch one line, regenerate it with its neighbours' request ids.
- Pick in this order: every word right (speech check against `spoken`, after Arabic folding for Arabic), the feeling matches `direction`, the fit ratio (section 8), no artefacts (clicks, a metallic tail, a swallowed last syllable, a tag read aloud). Record every take's score; losing takes stay on disk with their rows for the review card.
- In step mode the review card plays the chosen take and the runner-up of each hero line; in auto mode the director picks by this order and the delivery note lists the alternatives.

## 7. The user's recording: guide and per-line timing

Send this with the timed script when the user chose route 1 (a template may carry its own measured guide, such as Feature Wish's `voice.recording_guide`; use the template's when there is one):

1. A quiet room with soft things around (a sofa, curtains, clothes); no fan, no hard echoing walls.
2. A phone or microphone a hand's width (15 to 20 cm) from the mouth, a little to the side so breaths do not hit it; the same place for every line.
3. Each line read three times in a row with a short pause between takes, in the feeling the script's direction gives.
4. Each line timed to its slot: the slot's seconds are written next to the line (frames divided by the frame rate); a phone stopwatch is enough.
5. WAV or the phone's best voice memo setting; send every take, Ice picks by measurement and the user's ear.

**Performance transfer.** When a feeling or timing is hard to describe, the user records a guide read at the exact pace and feeling, and the provider's speech to speech model (ElevenLabs `eleven_multilingual_sts_v2`) turns it into the chosen voice while keeping its timing frame for frame. This is route 2 with a recorded input: the output carries the provider record and `derived_from` the user's take.

## 8. Word timings and the fit to the slot

1. **Timings for every take.** ElevenLabs returns character timings with the audio (`/with-timestamps`): `python "${CLAUDE_SKILL_DIR}/scripts/voice_fit.py" words <answer.json>` turns them into words. A recording or a provider without timings: the provider's forced alignment when the user has it, else the local word-level ASR (`ice-arabic/references/asr-timing.md`; `ice-type` `align_script_to_asr.py` maps the script's words onto it). Snap starts to speech onset (`voiceover.md` section 5 item 4).
2. **Fit.** After cutting one take into lines, measure each cut clip's loudness over its whole length, not only where it starts: a fade or gain placed on the source timeline instead of the clip's own silences mutes every line after the first, so a clip that goes silent before its words end is cut again. Then `python "${CLAUDE_SKILL_DIR}/scripts/voice_fit.py" --project . fit ice/audio/voice/lines.json` measures each chosen take: ratio = speech span / slot seconds. Within 2 percent: `ok`. 0.92 to 1.08: `stretch` with pitch-kept tempo (`--apply` writes `<take>-fit.wav`). 0.85 to 0.92 or 1.08 to 1.10: `exception`, allowed for one line, never two in a row. Outside, or two exceptions in a row: `rewrite`: change the words, the delivery tags or the cut, then a new take; never more speed (`voiceover.md` section 5 items 6 and 7).
3. **Place.** The take's first word starts on the slot's first frame, or 0.1 to 0.3 s after the cut that shows what the line names (see then hear); a line's stressed word lands on a beat when the music has a clear pulse; leave the music a bar or two alone before a drop or a hero shot. Slide whole lines; never stretch single words. The picture moves to the voice only before the picture is locked (the voice comes before any frame, `ice-audio` section 4 step 2).
4. **Rows.** `python "${CLAUDE_SKILL_DIR}/scripts/voice_fit.py" --project . rows ice/audio/voice/lines.json` writes one manifest row per take and per fitted file, which the provenance gate reads.

## 9. Source record and disclosure

- Every provider take: `source.type` `generated`, `provider`, `model`, `voice_id`, `date`, and `rights.license_terms` (terms page and plan, read on the date); `voice_fit.py rows` writes them from `lines.json`. The gate (`ice-assets` `validate-assets.mjs --audio-only`, check 10) fails a provider voice without them, and fails any generated music or effect.
- Every recording: `user-provided`. A processed or fitted copy: `derived_from` its take.
- The delivery note says which lines are AI voiced, by which provider, model and voice, and what the user's plan allows. Real people's voices and clones follow `ice-assets/references/ai-media-policy.md` section 9; an AI narrator never plays over footage of a real person talking (`voiceover.md` section 1).

## 10. Finish: per-line processing and the mix

Corrective cleanup comes first (`voiceover.md` section 7, from measured symptoms). Then per line, only with a reason the picture or the script gives (the founder's rule that every element needs a reason):

| Line's reason | Processing | Verify |
|---|---|---|
| Default narrator | Dry and centred: high-pass 80 to 100 Hz, de-ess 5 to 9 kHz, gentle compression 2:1 to 3:1 (3 to 6 dB on peaks), presence only when masked | Side minus mid at or under -30 dB; level 30 dB down within 0.6 s of the last word |
| The picture places the voice in a space, or the line is a memory, a dream or a giant title | Short plate or room reverb, low send, 20 to 40 ms pre-delay, return high-passed so the lows stay dry | Tail to -30 dB measured and logged |
| One tagline word to ring out | A single echo or delay throw on that word | The throw ends before the next line |
| A voice the picture shows through a device (phone, radio, TV screen) | The band-pass of `voiceover.md` section 7 | Band 300 Hz to 4 kHz |
| A glitch beat in the film's motion language | Light distortion or bit reduction on that word only | Only on that word |

Then the mix: voice priority, carve or duck the bed 10 to 14 dB under the voice, recovery 150 to 400 ms after the line, the platform loudness profile (`mix-and-master.md`). Re-transcribe the final voice stem against `spoken` before every render.

## 11. Order on the spine

| Stage | Voice work |
|---|---|
| 01 | `Q-voice` with the route, the provider, the access route and the cost; the language and dialect profile (`ice-arabic`) |
| 03 | `lines.json`: display and spoken sides, direction, slots from the beat plan; Arabic numbers as words and marking; duration estimate |
| 04 to 06 | Slots refined to frames by the storyboard and animatic; casting takes on the hero lines when the route is a provider |
| 08a | Takes, selection, timings, fit, rows; with a provider route the voice is generated before 07 builds frames when the film is voice-led (`ice-audio` section 4 step 2) |
| 08b | Per-line processing, the mix, the speech check, the provenance gate |
| 10 | Delivery note: route, provider, model, voice, plan, AI disclosure, alternatives |
