# Voice-first timeline

Spine stage 03, voice and timing steps (and stage 08 when the voice is replaced). Timing comes from real audio, never from estimates. Engine settings, pacing clamps, mixing and loudness are owned by `ice-audio`; Arabic word timing by `ice-arabic`.

## 1. Fixed order

Lock script, then voice, then trim (recordings only), then word alignment, then speech check, then timing table, then tagging, then segments, then build. Editing the audio after timestamps exist shifts every beat; if you must, go back to alignment.

## 2. Voice source

Voice source rules (recording as default, consent before any cloud TTS or transcription, auditioning 2 to 3 voices, no AI narrator over a real person talking): the `ice-audio` skill, `references/voiceover.md` section 1. Explainer additions:

| Source | Rule |
|---|---|
| Finished human recording | The script is edited to match what was said |
| Local TTS | Check what is installed first. Installing an engine or downloading a model is disclosed (name, size) inside the stage 01 message and needs the user's yes. Without a yes (or when the user said not to ask): no install, no download; use an engine already installed, or the "voice arriving later" row; log it and say in the delivery note what a yes would add |
| Voice arriving later | Build to estimated timing, hand over the full voice script in the message (one paragraph per scene, numbers written as said, natural pace, about 1 s between paragraphs), retime on arrival (section 9) |

The voice preference and every consent above (cloud TTS, transcription, an install) are asked once, inside the stage 01 message, with a short option list; never a long menu and never at a later stage. Step mode may show the audition on the 03 review card.

## 3. Trimming a human recording

- Trim order, what may be removed, long-pause compression with room tone, energy-valley cut points, the trim report and cutting the picture with the same edit list: the `ice-audio` skill, `references/voiceover.md` section 7. Editing itself is `ice-edit`.
- Explainer addition: head padding 0.25 s, tail padding 0.5 s.

## 4. Pauses

Gaps between sentences and at paragraph ends, where to pause, the first word's start time and adding silence in post when TTS pauses are imprecise: the `ice-audio` skill, `references/voiceover.md` sections 2, 5 and 6. Explainer additions:

| Gap | Value |
|---|---|
| Before a chapter | about 1.5 s |
| Tail after last word | 0.8 to 3 s depending on the end card |

A paragraph-final subtitle block shorter than 45 frames gets 15 to 30 extra frames of gap (no word changes).

## 5. Word alignment

- Word timestamps from the engine or from forced alignment, never invented: the `ice-audio` skill, `references/voiceover.md` section 5. Request word boundaries explicitly and verify they are not empty.
- Engines without word boundaries: synthesize per subtitle block and concatenate, so each block start is exact.
- Long audio fed whole to some aligners fails near 200 s; split at silences into chunks of 75 s or less.
- Flag any sentence whose alignment match is under 0.90 for a human listen.
- Quantization to frames: error is at most half a frame (16.7 ms at 30 fps). Never claim better than that.

## 6. Speech check

Run the speech check (the `ice-audio` skill, `references/voiceover.md` section 5) before tagging.
- Fix mishearings with the display and spoken pair, or reword homophones.
- CJK and other languages: compare by sound, not by the characters the recognizer chose. Do not reword only because different characters came back.
- Some languages show a few unconfirmed words normally; fix a word when it stays unconfirmed in several scenes or the user hears it wrong.

## 7. Durations, drift and length

- Pacing tiers, rushed and dragging flags, the TTS budget for explainers, measured engine rates, drift, the settle budget, cloned voice pace and the slow-down floor: the `ice-audio` skill, `references/voiceover.md` sections 3 to 5.
- Total film duration is at least narration length plus 1 s; hold the final frame at least 1 s.
- If the voiced length misses the requested length by more than 15 percent, add or remove sentences. Do not change the speech rate.
- Demo footage inside a scene: speed = raw demo length divided by narration length, typically 1.5x to 2x; recompute after the real voice exists.

## 8. Timing table

`ice/plan/words.json` holds every word with start, end, text, sentence id, paragraph id and occurrence index. Sentence and paragraph rows derive from it. Every later time in the project is computed from this file.

## 9. Retiming

Retiming for a replaced voice, a single changed line and a voice that arrives after the picture (pause detection thresholds, piecewise mapping): the `ice-audio` skill, `references/voiceover.md` section 6. Explainer additions:

| Change | Do |
|---|---|
| Whole voice replaced | After the retime, regenerate segments from words and re-run checks |
| One line changed | Re-align the spliced region |
| Voice arrives after a build to estimates, noisy recording | Use a silence threshold of about -25 dB relative to peak instead |
| Any shift after graphics exist | Apply through a scripted transform derived from the edit list, then review the diff. Never hand-edit times |

## 10. Time bases

Three time bases exist: absolute film time, segment-local time, and sequence-local time including lead. Convert in one helper only. Absolute seconds appear in scene code only as named values, never as literals inside function calls, so retiming tools can find them. Render the audio once for the whole film, never per segment, and assert per-segment and total frame counts (one frame off shifts every later beat by 33 ms at 30 fps).

## 11. Captions source

The trusted-text rule (captions spell the approved words, recognition supplies timing only) and the stale-script match threshold: the `ice-type` skill, `references/caption-timing-and-truth.md` section 1. Regenerate captions after any re-timing. Caption styling is `ice-type`.
