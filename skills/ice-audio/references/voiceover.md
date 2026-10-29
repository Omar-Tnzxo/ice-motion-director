# Voiceover and TTS: script for the ear, pacing, timing, cleanup

Read when a film has narration: before writing the script's spoken side, before generating or recording any voice, when a line is too fast or does not fit its scene, and when cleaning a recorded voice. Sources: claude-code-video-toolkit (MIT), hyperframes skills, docs and product-launch-video (Apache-2.0), motionmaxxing sound-sync (Apache-2.0), explainroo (MIT), product-launch-motion (MIT), herk-edit-kit (MIT), video-production-studio (founder), lists-community vox-explainer (Apache-2.0), huashu-art-motion (MIT), with ideas restated from hypit, talkcraft, anything2explainer and onetake (noncommercial, ideas only).

Arabic and dialect narration (dialect words per second, vocalized spelling, dialect review, Arabic voices) belong to the ice-arabic skill. Caption timing belongs to ice-type.

## 1. Voice is optional and disclosed

1. Default voice: a voiceover the whole way for ads and explainers; the person's own voice for talking heads. Default input is a finished recording plus a script that matches it; synthesis never replaces an existing recording.
2. Ask before using any TTS or transcription API, inside the router's stops (`ice-motion-director/SKILL.md` section 5, "Stops"), in the voice source question of the stage 01 message: state the provider, what data is sent, the credential needed and possible cost. Never ask the user to paste keys into chat; never write keys into a per-repo `.env`. No credential is not a green light to silently switch to another voice: in auto mode, when the film can run music-led with every word on screen, switch to that, log it and say so in the delivery note; otherwise stop the run as blocked and say plainly which voice or credential is missing. In step mode put it on the review card.
3. AI voices are disclosed in the delivery report. Never play an AI narrator over footage of a real person talking (viewers think that person speaks in the AI voice).
4. Voice cloning only when the user asks for it in this task. Whose voice may be cloned follows the `ice-assets` skill, `references/ai-media-policy.md` section 9 (no permission question; one neutral rights line in the brief). A voice heard in a reference film is never copied into the deliverable (the `ice-remake` skill, `references/rights-and-modes.md`).
5. Local free voices are fine for drafts after the user chose a synthetic voice; the final voice comes from 2 to 3 auditioned candidates (5 to 8 for a client) reading the same first lines: the user picks on the review card in step mode; in auto mode the director picks the candidate whose provider description fits the brief's audience, language and dialect, logs it, and lists the others in the delivery note. A remembered user preference beats a default. Pass the provider and voice from the user's ask explicitly: tools with a default voice silently ignore "a male voice" otherwise.
6. "If you cannot reach the chosen provider, say so and stop rather than substituting a different voice."

## 2. Write for the ear

- One idea per sentence, about 8 to 18 words (at most 14 for promos), verbs first, no parentheses, no stacked subordinate clauses. Say who does what. Every sentence adds a fact. End with a plain sentence that sums up the point.
- Tone: contractions, varied sentence length, read it out loud. Avoid slogans such as "seamless experience", "unlock the power of", "streamline your workflow".
- Write each VO line as discrete cues, not one run-on breath. 1 to 2 sentences per spoken beat, usually 6 to 20 words. Silent beats are allowed and common.
- On-screen words and spoken words differ: neither is a caption of the other. The picture may show the exact figure while the voice rounds it, and only ever round toward the less impressive number.
- Two-layer script: a display side and a spoken side. Write what you want the voice to say (TTS reads literally): numbers as words, initialisms spaced or comma-separated (never dotted like a web address), domains as "dot", symbols and versions spelled out. Try a product name in plain spelling first; respell only when the speech check mishears it. Homophones cannot be fixed by respelling: reword. Apply the same reading at every occurrence. Keep "pronounce as" instructions in delivery direction, never in the spoken words. Settle pronunciations before estimating duration. A term not in the pronunciation list that the voice may misread: take its pronunciation from the brand's or source's own audio or video when one exists, else the most common reading; log it, and list it in the delivery note (auto mode) or on the review card (step mode).
- Never speak commit hashes, ticket numbers or long codes; move numbers off the script onto a counter when they slow the read.
- The brand name said once near the turn (promos); CTA last; the first word within 0.3 to 0.8 s of film start; the last line ends before the end card's final second.
- Per line, add delivery direction ("flat and factual" style notes) in a separate field from the spoken text. "Fix wording, pronunciation or delivery in the script or voice direction rather than cutting around a bad read."

## 3. Pacing and word budgets

| Delivery | Rate | Use |
|---|---|---|
| Slow | 120 to 130 wpm (2.0 to 2.2 wps) | Technical explanations, complex concepts, tutorials, sign-offs |
| Standard | 140 to 160 wpm (about 2.5 wps, 150 wpm) | General narration, demos, overviews |
| Fast | 160 to 180 wpm (2.7 to 3.0 wps) | Energetic intros, recaps, CTAs, brisk social |
| Hook or claim lines | 1.5 to 2.5 wps | Let the claim land |
| Sign-off | 1.2 to 1.7 wps | |

- Plan budgets at 2.2 to 2.5 wps for explainers and anything TTS-voiced (TTS output is not reliably 150 wpm; a local English voice measured about 2.3 wps, so write about 125 to 140 wpm); 2.5 to 3.0 wps for ads and promos.
- Film totals: about 28 to 38 words at 15 s, 60 to 80 at 30 s, about 150 at 60 s; about 225 words at 90 s is the ceiling. The script should feel shorter than the video.
- Per-beat budgets (promo): hook 4 to 10 words, turn 6 to 12, proof 0 to 14, CTA 3 to 8. Per frame in narrated sequences: default at most 19 words (about 9 s); at most 26 words for at most 2 frames; over 26, trim or split.
- Flags: above about 170 wpm is rushed, under 110 wpm drags; below 6 words a wpm figure is noise.
- Make a film fast with fewer words per screen, never by cutting before people finish reading or hearing.

## 4. Duration estimate before generating

1. Count the spoken side (after pronunciation is settled). English counts syllables for fine estimates; Mandarin counts characters (about 5.5 per second at normal rate).
2. Estimate: words / planned wps, plus about 0.2 s after commas and 0.4 s after full stops; paragraph pauses longer. The finished film runs about 5 to 8 % longer than raw speech: that is the settle budget, not overrun.
3. If the estimate does not fit the requested length, reshape the passage (merge, split at a turn of thought, cut a clause) and re-estimate. Do not squeeze every line to its shortest; keep related lines at a coherent density.
4. Measure before promising a length. TTS punctuation pauses do not shrink with speed.
5. Expect drift: some TTS engines compress pauses and rush short sentences (a 50 s script may produce 40 to 45 s); short scenes drift more (a 5 s scene can be off 30 %, a 30 s scene about 10 %); tone presets change speed (one engine's "professional" ran about 10 % faster than "warm").

## 5. Generate, then measure and fix deterministically

1. Generate or record the voiceover before building a single frame: its word timings drive shot lengths, captions and motion.
2. One file per scene or line (regenerate one without redoing all), or for premium voices one take for the whole script cut at silences (consistent performance). Pass request continuity ids between generations when the provider supports it. Split long scripts (over about 5 minutes, or over the provider's per-request character limit) at sentence boundaries.
3. Get word timestamps. If the TTS returns none, force-align with a local Whisper model; never use English-only models for non-English audio (they translate). Paragraphs, SRT files and segment-only transcripts do not supply word timing; never invent timing. Use ASR times but the script's words (ASR mishears brand names).
4. Snap word and line starts to speech onset with silencedetect (about -40 dB, 0.08 s; 0.01 s at file edges): API alignment can run 50 to 300 ms past audible speech.
5. Speech check: re-transcribe every line and compare with the script; regenerate until it matches (English word for word; character similarity at least 0.92 for Chinese). Spot-check the first and last word of every line. Re-transcribe the full narration before every render.
6. Measure wpm per line (words / speech duration between first and last word). Above the ceiling (default 165 to 170 wpm): slow it with a pitch-preserving tempo change: factor = target_wpm / measured_wpm, clamped to 0.85 or more ("floor 0.85x so it never sounds processed"). Use the bundled tool: `python "${CLAUDE_SKILL_DIR}/scripts/pacing.py" --audio LINE.wav --text LINE.txt` to measure, add `--max-wpm 165` to fix in place (keep a copy of the original first); the plain command is `ffmpeg -i line.wav -af atempo=FACTOR line_slow.wav`. Run `scripts/qc.py --cue-sheet ice/plan/cue-sheet.json` to check every line's pace, slot fit and loudness spread at once. Sampling more takes does not fix pace; measuring and correcting does. TTS `speed` flags may be ignored; atempo is reliable.
7. Speeding up: never past about 1.1x to fit narration; energetic ads may go further only within the provider's natural range. A line that still does not fit gets shorter, not faster.
8. A cloned voice inherits the pace of its reference: record clone references at narration pace, 12 to 25 s of varied full sentences (under 8 s warn strongly, 8 to 12 s usable, about 25 words minimum), with a transcript that matches exactly what was said.
9. If pauses are not precise enough, add silence in post rather than fighting the TTS engine. An ellipsis is not a reliable pause (it can be voiced). Provider break tags have limits (one provider: at most 3 s per break, excess breaks cause speed artifacts).
10. Pitch and pace are independent when casting; cross-language voice transfer does not carry the target accent or cadence, so direct those explicitly.
11. Any timing change to the voice needs new captions and new cue frames.

## 6. Timing the film to the voice

- Real voice duration wins over estimates; silent scenes keep estimates; synced durations are never hand-edited.
- Scene length = narration length + tail hold + transition pad; tail hold 0.2 to 0.5 s, longer before a hero beat (about 0.25 s is the breath after the last word).
- Gaps: about 0.3 s between sentences (0.45 s in continuous narration), about 0.55 s at paragraph ends, longer only where the picture carries on alone. Pause at paragraph ends, not after every sentence: pausing every sentence makes the film drag.
- One VO line per shot: it starts after the shot starts and ends before the cut, except deliberate J and L cuts.
- Visuals appear slightly before the narration names them ("see then hear"); hits fire exactly on the word; cue the meaning, not the noun.
- A replacement VO means a full retime: re-transcribe; a uniform atempo allows only uniform rescaling of cue times (start / factor), spot-check 3 points. A single-line edit: regenerate that sentence, splice it, shift all downstream times by the delta.
- VO arriving after the picture: map old scene boundaries to new paragraph starts piecewise (pause detection about -30 dB relative to peak, pause at least 0.45 s, paragraph at least 0.8 s); tween durations stay, only positions stretch.

## 7. Recorded voice: trim and clean

1. Use the production master (48 kHz, 24-bit) in the edit, never the transcription file; no compression or auto loudness during cut assembly.
2. Order is fixed: trim, then timestamp, then annotate; editing audio after timestamps shifts every cue. Remove only fillers and stutters not in the script; never cut a word the ASR misheard. Cut points go to an energy valley (the quietest 10 ms), then snap to the frame grid. Show the trim report before writing and flag cuts that did not land in silence. The same edit list cuts the picture recorded with it.
3. Long pauses (0.7 s or more) compress to about 0.35 s using real room tone, never digital zero. Air between phrases is a donor slice of the track's own room tone with 10 ms fades; splice with a 40 ms equal-power crossfade into a word's natural decay (60 to 120 ms), never a hard butt. Never cut inside speech.
4. Level every line to the same loudness and limit only peaks (scaling a whole line to its loudest peak made one line 5 dB quieter). Do not over-level: a 4 to 6 dB spread across windows is normal speech, and levelling natural sentence declination is heard as robotic.
5. Cleanup chain by symptom (subtract before you add; corrective filters early, character in the middle, limiter last):

| Symptom | Fix |
|---|---|
| Hum or rumble | High-pass about 80 Hz |
| Boomy | -4 dB at 200 Hz, Q 1.4 (a low band more than about 4 dB above the 1 kHz band is a boom or mud candidate) |
| Muddy, dull | -3 dB at 250 Hz, Q 1.2 (a dull voice usually has too much low-mid, not too little top) |
| Boxy | -3 dB at 400 Hz, Q 1.4 |
| Unclear words | +2.5 dB at 3 kHz, Q 1, or carve the music instead (mix-and-master.md) |
| Harsh | -3 dB at 3.2 kHz, Q 1.6 |
| Sibilant | Narrow cut, sweep 5 to 9 kHz, Q 3 to 4, -3 to -5 dB |
| Room tone between words | Gentle gate (it does not remove noise) |
| Audible hiss | Needs a better source; say so and ship the honest fallback with its cost stated |

Check what a preset already contains before adding the same job (a doubled cut lands twice). Diagnose only by comparing inside the same file; the absolute spectrum of one unknown voice cannot be judged against another voice. Formants vary +/-10 dB, fundamentals run 85 to 255 Hz, sentences decline 5 to 6 dB as they end.
6. Own voice in a motion film: no limiter during the edit, aim near -20 LUFS for the voice stem (TTS stems near -14 to -16); louder needs asking.

**Broadcast voice chain** (news reel, edit type `news-reel`, and any presenter-led news or explainer edit; the order the broadcast editors use, ideas only, with the targets measured on six broadcast reels). Order: light denoise, shelf EQ, multiband compression with a limiter, volume. Corrective fixes from the table above come first when a symptom calls for them.
1. Light denoise: a few dB of reduction, never enough to smear consonants or make the room tone breathe (`afftdn=nr=8:nf=-50` is a light start; judge by the pauses).
2. Shelf EQ only: a low shelf and a high shelf, no narrow boosts. High-pass 80 to 135 Hz first (two stacked `highpass` stages for about 24 dB per octave; about 90 Hz for a warm look, 120 Hz for a lean one). Arabic broadcast voices measure dark (8 kHz about 27 to 29 dB under the 250 Hz to 1 kHz band) and are de-essed (`deesser=i=0.4`); an English broadcast voice measures bright (8 kHz about 4 dB under) and is left bright.
3. Multiband compression with a limiter: split at about 250 Hz and 4 kHz (`acrossover=split=250 4000:order=4th`), compress each band gently (about 2:1 low and high, 3:1 in the middle, attack about 10 ms, release about 150 ms), sum, then `alimiter=limit=0.89:level=disabled`. Target: voice LRA 2.5 to 6 LU and a crest of about 15 to 17 dB on 1 s windows (moderate compression, not a flat wall).
4. Volume: the stem level the mix needs (`mix-and-master.md` section 5, row "News reel, speech-led"); mono and centred (`pan=mono|c0=0.5*c0+0.5*c1`, back to stereo for the mix); dry, no reverb.

Phone or TV band-pass, only for a quoted voice heard through a phone or a broadcast (a caller, a clip quoted from a broadcast, a voice the picture shows on a screen), never on the presenter or the narrator: band-pass 300 Hz to 4 kHz with about 30 dB less outside the band (two stacked `highpass=f=300` and two `lowpass=f=4000`), an extra `lowpass=f=3000` for a phone line, then a compressor near `acompressor=threshold=-20.5dB:ratio=4.5`. The band-pass marks the voice as relayed; a real clip keeps its meaning (`ice-assets/references/sourcing-and-licenses.md` section 0, "What stays").
