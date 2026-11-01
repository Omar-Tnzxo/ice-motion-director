# Arabic voice: the spoken side, numbers, tashkeel, dialect voices and failure modes

Read when an Arabic line will be voiced, by a provider or by the user: at 03 to write each line's spoken side, before generating any take, and when a take mispronounces. The voice stage itself (routes, providers, takes, fit, finish) is the `ice-audio` skill, `references/voice-director.md`; the dialect setting and ASR rules are `asr-timing.md`. Sources: the founder's rules and voice test (2026-11-01), the provider documents read on 2026-11-01, and measured tests named per row.

## 1. Founder decisions (2026-11-01)

- Omar's words on Arabic voice: "اما العربي ياريت تبحث بردو بس من تجاربي الشخصية ان الارقام تتكتب عربي زي 100.000 تتكتب "مية الف" والجمل تتكتب بالتشكيل الدقيق".
- Omar listened to five test clips and picked the first: "اول فويس افضل فويس مصري". That clip is the **Egyptian default**: the ElevenLabs library voice "Omar - Deep & Confident Egyptian Voice" (`erFJevGCT0rMZPhBbaep`, accent label Egyptian) on `eleven_v4`, a warm delivery tag, numbers written as Egyptian words, no full tashkeel.
- Defaults that follow from it:

| Variety | Voice | Numbers | Tashkeel | Emotion |
|---|---|---|---|---|
| Egyptian | The default voice above when the user's provider account has it; else search the provider's library for a native Egyptian voice (language Arabic, accent Egyptian, a use case that fits the film) and audition 2 to 3 (`voice-director.md` section 5) | Egyptian words (section 2) | Only on words the engine could read two ways and on loanwords (section 3) | Audio tags and the text (`voice-director.md` section 5) |
| MSA | A native Arabic voice that reads MSA well (several Egyptian library voices state MSA too); audition 2 to 3 | MSA words with the sentence's case | Full and accurate on every word | Audio tags and the text |
| Another dialect (Gulf, Levantine, Maghrebi and others) | A native voice of that dialect from the provider's library; no founder default | That dialect's words | Ambiguous words and loanwords | Audio tags and the text |

The default voice is a starting point for Egyptian films, never a rule for other varieties, and the user's own choice always wins. The dialect itself is still the setting of `asr-timing.md` ("Dialect as a setting"); no file assumes a country.

## 2. Numbers, dates and money as words

The spoken side writes every number as words in the film's variety; the screen and the captions keep digits by `bidi-numerals-line-breaks.md`. Measured on `eleven_v4` with an Egyptian voice (2026-11-01): "100.000" in digits was read as MSA "مائة ألف" in the middle of an Egyptian sentence; written "مية ألف" it was read as Egyptian. The engine guesses the variety of digits; the script decides it.

- Convert with `python "${CLAUDE_SKILL_DIR}/scripts/spoken_numbers.py" convert --variety egyptian|msa "<text>"` and check the lines file with `python "${CLAUDE_SKILL_DIR}/scripts/spoken_numbers.py" check ice/audio/voice/lines.json` (exit 1 when a spoken side still has digits; `voice_fit.py fit` checks it too).
- Separators by shape: a dot or comma followed by groups of exactly three digits groups thousands (the Egyptian "100.000" is one hundred thousand); any other is a decimal mark ("2,5" is two and a half). Read the source's own convention when it is a quoted figure, and keep the truth sheet's value.
- Illustrations of the method (not fixed phrases):

| On screen | Egyptian spoken side | MSA spoken side |
|---|---|---|
| 100.000 | مية ألف | مِئَةُ أَلْفٍ |
| 2.500 | ألفين وخمسمية | أَلْفانِ وَخَمْسُمِئَةٍ |
| 25% | خمسة وعشرين في المية | خَمْسَةٌ وَعِشْرُونَ بِالمِئَةِ |
| 3:30 | تلاتة ونص | الثّالِثَةُ وَالنِّصْفُ |
| A date | خمسة وعشرين <month> | الخامِسِ وَالعِشْرِينَ مِنْ <month> |
| A phone number | digit groups with a comma between groups | the same in MSA words |

- MSA case endings depend on the sentence: the script gives plain nominative words; the agent marks the case per line and the native reader signs off (`SKILL.md` core rule 10).

## 3. Tashkeel

- **MSA:** full, accurate tashkeel on every word, case endings, shadda and tanween included; no dagger alef; a final taa marbuta written as haa in the spoken side only when the engine misreads it.
- **Egyptian and other dialects:** mark by the dialect's own pronunciation, never by MSA grammar (for illustration: `عَنْدِنا` not `عِنْدَنا`, a sukun at phrase ends, no MSA case endings). Mark every word the engine could read two ways, every loanword and every name; leave the rest plain. Measured (2026-11-01, Egyptian default voice): the same sentence fully marked read word for word the same, with word times within 0.04 s, and cost 43 percent more (diacritics count as characters). When the first hero line misreads, generate it once fully marked and once marked only where ambiguous, keep the style that reads right by the speech check and the user's ear, and use it for the whole film.
- Keep two fields per line: `display` in normal spelling for the screen and captions, `spoken` with the marking and number words. Captions never show the spoken spelling.

## 4. Brand names and English inside Arabic

1. The name in Arabic letters as the dialect says it, with tashkeel; 2. the Latin spelling; 3. on `eleven_v4`, an IPA spelling between slashes; 4. a pronunciation dictionary rule (alias) that fixes it everywhere. Keep the first that reads right, log it in `ice/DIRECTION.md`, and apply it at every occurrence.
- Keep English words few inside one Arabic sentence: a run of English words can pull the rest of the line into another accent.

## 5. Failure modes and fixes

| Failure | Fix |
|---|---|
| Digits read in MSA or English inside a dialect line | Numbers as words in the variety (section 2) |
| The line drifts to MSA or to another dialect | A native voice of the dialect; dialect words early in the line; dialect marking; a new take |
| Letters read in another dialect's way (for illustration: ج or ق in an Egyptian line) | A voice with that dialect's accent label; respell in the spoken side as the dialect says it |
| MSA case endings voiced in a dialect line | Remove case marks; sukun at phrase ends |
| A brand misread | Section 4, in order |
| A tag read aloud | The model has no tags (`eleven_multilingual_v2` and similar): remove the brackets |
| The accent is lost on a voice from another language | A native voice of the variety; `eleven_v4` neutralises cross-language accents |
| A short line rushed or its last syllable swallowed | End with a full stop and a short pause tag, or merge it with the next line |
| A sound-effect tag in an Arabic line | Banned (`ice-audio` core rule 7): remove it |

## 6. Checking an Arabic take

Transcribe every take with a medium or larger model (`asr-timing.md`) and compare it with `spoken` after Arabic folding. A model can write Egyptian speech in MSA spelling (in the founder's test it wrote "لدينا" for "عندنا" on all three Egyptian takes alike): an ASR spelling difference is not a voice error when every take shows it; listen, and never change the voice to match an ASR spelling.
