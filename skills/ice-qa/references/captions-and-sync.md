# Captions match the script, and picture matches sound

Validators that prove the words on screen are the words spoken, and that picture events land on their words and hits. Caption style, timing targets and placement are owned by the ice-type skill (it ships the script-to-ASR aligner); edit plans and their validator by the ice-edit skill; beat grids and VO pacing by ice-audio; Arabic ASR timing by ice-arabic. This file is the gate. Sources: herk-edit-kit (MIT), motionmaxxing (Apache), product-launch-motion (MIT), claude-code-video-toolkit (MIT), explainroo, video-use, video-ad-editor, anidoodle, mg-styles-15 (MIT), hyperframes (Apache), hypit (ideas), claude-motion-design (MIT), founder skills; PolyForm explainer sources and imMamdouhaboammar (ideas rewritten).

## 1. Captions match the script

| Check | Pass when | Source |
|---|---|---|
| Fresh ASR on the delivered audio | Blocking, exact procedure in section 1b (Fresh transcript gate). Re-transcribe the final render and diff it against the approved script or edited transcript; measured sentence starts within the target: the `ice-type` skill, `references/caption-timing-and-truth.md` section 3. | founder skills, herk-edit-kit, ice-type skill |
| Word count and timing (edits) | The edit-plan validator in the ice-edit skill passes. Plan validation targets: the `ice-type` skill, `references/caption-timing-and-truth.md` section 3. Also no word crossing a cut, scenes contiguous and frame-aligned | herk-edit-kit |
| Every word whole | Compare the words at every cut of the final render with the raw recording. A transcript alone is not proof: speech-to-text guesses a clipped word correctly while a listener hears it broken | herk-edit-kit |
| Speech joins | Transcribe about 4 s around every join and look for repeated or cut words | founder skills |
| Acoustic forensics | Scan for runs of digital-zero samples inside pauses whose real floor is about -70 dBFS, and check the envelope at every junction edge at 1 ms resolution: what clients call "stutters" are usually truncation cliffs and dead holes | herk-edit-kit video storytelling |
| Speech match per scene | Re-run speech recognition on the final mix and compare the match per scene and overall with the floors: the `ice-audio` skill, `references/mix-and-master.md` section 7. Run by the stem mode of section 1b | explainroo |
| Alignment confidence | Any sentence whose alignment score is under 0.90 is flagged for a human listen; the stem mode of section 1b puts every word under 0.5 probability on the ear list | PolyForm ideas |
| Captions true | Every caption and on-screen claim passes the truth rule: the `ice-type` skill, `references/caption-timing-and-truth.md` section 1. | claude-motion-design |
| Visible text is not the narration | No sentence shown as display type and caption at once. Text roles: the `ice-type` skill, `references/captions-system.md` section 1. | hyperframes |
| Last syllable | The final syllable survives the export | herk-edit-kit |
| First caption | Measured time of the first visible caption against the target: the `ice-type` skill, `references/caption-timing-and-truth.md` section 3. | video-ad-editor |

Negative controls before trusting a validator: a caption shifted by 0.3 s, a one-frame scene gap and an omitted spoken word must each fail.

## 1b. Fresh transcript gate

Scope (lesson L11, owner decision, 2026-10-29): general, every edit and every film with captions or on-screen speech text. Trial: a news reel was delivered with captions that were never compared with a fresh transcript of its final audio. The gate is mandatory and blocking; it is the row "Fresh ASR on the delivered audio" of section 1, made exact.

1. Transcribe the delivered render's final mixed audio again: a new speech-to-text run on the exported file, never the transcript the captions were built from (word timings per the `ice-type` skill; Arabic per the `ice-arabic` skill).
2. Run the check (standard library only):

```
python skills/ice-type/scripts/align_script_to_asr.py --check-captions <captions .srt|.vtt|.json> <fresh asr words .json> -o ice/review/captions-check.json [--sentence-cards] [--allow-extra]
```

   It normalizes the words (Unicode, and Arabic folding of diacritics, tatweel, alef forms, alef maqsura and yaa, taa marbuta and haa), aligns caption words to heard words, and reports `missing` (in the captions, not heard), `extra` (heard, not in the captions), `changed`, and per cue the start offset from its first matched heard word. The offset limit is 0.1 s per cue and 0.15 s for a sentence card (a JSON cue with `"card": "sentence"`, or every cue with `--sentence-cards`), the delivery check of the `ice-type` skill, `references/caption-timing-and-truth.md` section 3; `--max-offset` sets one limit for every cue only when the caption plan records another tolerance. Report keys: `ok`, `caption_words`, `heard_words`, `match_ratio`, `mismatches` (`kind`, `caption`, `heard`, `t`), `offsets` (cues over the limit). Exit 0 passes; exit 4 blocks; exit 2 is bad input (fix the files and run again). `--allow-extra` (heard words absent from the captions do not fail) is used only when the caption plan drops fillers on purpose or the film is in keyword mode (the `ice-type` skill, `references/captions-system.md`, "Keyword mode"), and that use is logged in `ice/review/captions-check.md`.
3. Every mismatch is either fixed in the captions (then the check runs again on the new export) or resolved by a listen: the line in `ice/review/captions-check.md` names the cue, the time, what the captions say, what the speech model heard, and that a listen confirmed the captions (the model misheard). An unresolved mismatch or offset blocks.
4. Blocking at 09 on the draft and at 10 on the delivered file; delivery is refused without `ice/review/captions-check.json` for a film with captions or on-screen speech text (`delivery-checks.md` section 5). Earliest run: on the animatic's or draft's audio as soon as the voice is locked, so 10 finds nothing new.
5. Stem mode: masked or misheard (every voiced film, with or without captions; 08b on the draft, 10 on the delivered file). A caption check alone cannot tell a word the mix hid from a word the model hears in its common form. Transcribe the clean voice stem and the delivered mix with the same pinned model and align both to the approved script or the source transcript:

```
python skills/ice-type/scripts/align_script_to_asr.py --stem <voice stem .wav> --mix <render> <script .txt | source transcript .json> [--model <name>] [--language <code>]
```

   Each script word is `ok`, `masked` (right in the stem, lost or changed in the mix), `misheard` (wrong in both: pronunciation or the model) or `low_confidence` (a word probability under 0.5). It writes `ice/review/speech-check.json`; exit 1 blocks on a masked word, or on a scene under 0.8 or the film under 0.85 in the mix while the clean stem meets the floor (the floors of the `ice-audio` skill, `references/mix-and-master.md` section 7): the fix is in the mix (lower or carve the bed, move the hit), never in the captions. Misheard and low-confidence words, and floors missed in both transcripts, go to the ear list (`ice/review/ear-list.json`) as yes or no questions for a human ear; a caption mismatch of step 3 that the stem mode marks misheard is resolved by that ear item, never self-certified. The `--stem-words` and `--mix-words` options take words already transcribed (same model for both). Model choice (Arabic, dialect, noisy material): the `ice-engines` skill, `references/versions.json` (`models.whisper`).

## 2. Picture lands on its word

| Check | Pass when | Source |
|---|---|---|
| Beat anchors (HyperFrames-style projects) | `node scripts/validate-beat-sync.mjs <project>`: every beat file carries `data-anchor` with an exact transcript phrase; the beat enters between 0.2 s after and 1.8 s before that word (suggested lead 0.5 s); exit 1 on any miss | herk-edit-kit |
| Text lead | Measured lead of each word or line against its spoken start, inside the window: the `ice-audio` skill, `references/cue-map-and-beat-sync.md` section 5. | motionmaxxing, product-launch-motion |
| Five random reveals | Pick five reveals at random and check each against the word timestamps | product-launch-motion |
| Beat check per block | Look at block start minus 6, 0, plus 3 and plus 8 frames. A block that lands after its word is a defect; a block earlier than the lead window is a defect (window: the `ice-audio` skill, `references/cue-map-and-beat-sync.md` section 5). A sentence with no visual change is high severity | PolyForm ideas |
| Inner events | A scene can start on the right phrase and reveal its result on the wrong word: check events inside the scene, not only its window | hypit (idea) |
| Located, not guessed | Never claim an event happens at a guessed time; locate it from the script, the playhead or the media | hypit (idea) |
| Never hide sync | Never change duration or audio timing to hide a sync defect | hyperframes |
| Mute test | With the sound off the picture tells the same story; with the audio only nothing is missing | motionmaxxing |
| Business purpose on mute | A first-time viewer can say what the business does and what to do next with the sound off | motion-video-kit |
| Pacing | Measured wpm per line against the pacing bands and flags: the `ice-audio` skill, `references/voiceover.md` section 3. | claude-code-video-toolkit |
| First three seconds | Encoded opening read frame by frame against the hook rules and the hook timing for the film type: the `ice-ideas` skill, `references/hooks-and-openers.md` sections 2 and 3. Also check sound and impact aligned and the first spoken word surviving the impact mix | herk-edit-kit |

## 3. Picture lands on its hit (A/V sync)

| Check | Pass when | Source |
|---|---|---|
| Cut sync | `look.py` audio block: share of cuts within +-80 ms of a sound onset, reported and read against the cut density rules: the `ice-audio` skill, `references/cue-map-and-beat-sync.md` section 6. | motionmaxxing |
| Hit alignment | Visual hits aligned with audio onsets; onset precision about +-5 ms when measured with the ice-audio tools; read the spectrogram | mg-styles-15 |
| Cue frames | For every cue, one frame just before and just after it from the exported MP4 plus the waveform around it, on the riskiest timestamps. Which timestamps: the `ice-audio` skill, `references/mix-and-master.md` section 8. | Barty-Bart |
| Sync markers | Delivered sync within 1 ms at declared sync markers | anidoodle |
| Offset | Cross-correlate the delivered file's audio with the master mix: zero offset and the planned silent tail | imMamdouhaboammar (idea) |
| Lead-in samples | Every hit placed by the sound's measured sync point, never the file start: the `ice-audio` skill, `references/sfx.md` section 5. | motion-video-kit |
| Lip sync | Match cut frames against the raw: a matching frame count alone does not prove the right frames were picked; a person's review caught a drift every automated check missed | herk-edit-kit |
| Showreel beat cuts | Cut offsets within about 35 ms of a beat or half beat | herk-edit-kit |
| Ad delivery | Sync under 0.1 s | video-ad-editor |
| Picture and score end | Picture black and score silent within one frame of each other when the film ends in black | hyperframes-community-skills |

## 4. Honesty

A waveform establishes levels and timing, not whether the music is emotionally right; ASR establishes spoken content, not whether every audio edit sounds natural. Never count one as the other, and state which review modality was unavailable (herk-edit-kit).
