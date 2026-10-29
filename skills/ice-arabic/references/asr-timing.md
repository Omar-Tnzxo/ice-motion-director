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
