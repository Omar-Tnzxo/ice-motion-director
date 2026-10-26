# Transcript-driven editing (edit by reading, not watching)

Merged from browser-use/video-use (MIT), nateherkai/herk-edit-kit (MIT, Use Permission), majedphotos/video-ad-editor (MIT), Omar-Tnzxo/video-production-studio, digitalsamba/claude-code-video-toolkit (MIT). Model choice, language rules, the trusted-text rule and caption sync targets live in the ice-type skill (caption timing and truth); Arabic dialect correction lives in the ice-arabic skill.

## 1. Principle

Reason from the word-level transcript plus a few on-demand pictures, never from watching every frame. A packed phrase transcript plus a handful of filmstrips costs about a tenth of the tokens of raw ASR JSON and orders of magnitude less than frames. Audio is primary: cut candidates come from speech boundaries and silence gaps; drill into pictures only at decision points. Never reason about audio and video separately: every cut must work on both tracks.

## 2. Transcript contract

Every transcript the cutters read has this shape, times in seconds on the exact source file's timeline:

```json
{"text":"...","audio_duration_secs":0.0,"language_code":"<iso>",
 "words":[{"text":"...","start":0.0,"end":0.0,"type":"word","speaker_id":"<optional>"}]}
```

- Word-level timestamps are required. Paragraphs, SRT cues and segment-only output do not carry word timing: request word timestamps or force-align; never invent timing.
- Map a provider's word field to `text`, keep numeric start and end, and take the full source duration from `ffprobe`.
- Split long audio into chunks at silences (about 20 s chunks for hour-long episodes) and keep each chunk's offset; one-pass transcription of long episodes drops minutes and hallucinates stock phrases.
- Default engine: a local Whisper-class model with word timestamps (free, works offline, needed for Arabic dialects); the model size by hardware and language is `models.whisper` in the `ice-engines` skill's `references/versions.json`, downloaded only after the user's yes in the stage 01 message (without it: a model already on the machine, or the user's transcript or subtitle file with estimated word times, reported; when neither exists, report the blocker with its one install step and never download on your own). A hosted ASR such as ElevenLabs Scribe (diarization, audio events, verbatim fillers) is optional and paid: ask in the stage 01 message with the cost and the fact that audio leaves the machine; without a yes use the local model, log it, and say in the delivery note what the hosted service would add.
- Local Whisper tends to normalize fillers and drop stutters. When filler or stutter cutting matters, verify candidates on the timeline view or by listening, not by the text alone.
- Cache one transcript per source; never re-transcribe unless the source changed.

## 3. Read before cutting

1. Pack: `python scripts/pack_transcripts.py --edit-dir <edit dir>` writes `takes_packed.md`, phrases broken on silence of 0.5 s or more or on a speaker change, each prefixed `[start-end]`.
2. Pre-scan the packed text for verbal slips, repeated lines, abandoned starts, audio events (laughs, sighs, applause) and named people, products and numbers (named entities go to the truth check in the ice-assets skill before any graphic uses them).
3. Script gate: write the whole script as numbered sentences with retakes marked; the words are approved at 03 before any design (the user's review card in step mode; the approver role in auto mode, against the audio). Correct ASR errors before captions and keep the same word count per sentence (rules in the ice-type skill).
4. Look only at decision points: `python scripts/timeline_view.py <video> <start> <end> --transcript <json>` renders a filmstrip, a waveform, word labels and shaded silences of 400 ms or more. Use it for ambiguous pauses, retake choice and cut sanity checks; never in a loop over every phrase.
5. Write the strategy in 4 to 8 plain sentences (what stays, what goes, the order, the length, the look) in `ice/DIRECTION.md` before touching the cut; it is approved at 02 (the user's review card in step mode, the approver role in auto mode). An instruction to make and iterate a finished video already authorizes ordinary local editing and rendering: never ask again at every draft.

## 4. Assemble by meaning

- Assemble chronologically by story beat, not by source clip order. Pick a structure that fits the material (illustration only, choose by the footage, never by default): demo (hook, problem, solution, benefit, example, call to action); tutorial (intro, setup, steps, gotchas, recap); interview (question, answer, follow-up, repeated); event (arrival, highlights, quiet moments, departure); documentary (thesis, evidence, counterpoint, conclusion); performance (intro, verse, chorus, bridge, outro).
- Do not assume what kind of video it is: look at the material, ask, then edit.
- Over budget: drop a whole beat or trim tails, never squeeze speech.
- Keep an unavoidable slip with a note rather than cutting inside a phrase.
- The editor's output is a JSON EDL only (format in `clock-and-grouping.md`).

## 5. Timelines never mix

- Source time and edited time are different clocks. Every derived file names its clock. Fields prefixed `source` are on the source timeline; everything else is edited time.
- Each cutting stage emits an EDL and a retimed transcript (`scripts/cut-silences.mjs`, `scripts/apply-cuts.mjs`). The next stage reads the previous stage's video AND its retimed transcript. Never apply original timestamps to edited footage.
- Multi-source edits: `node scripts/edl-to-edited-transcript.mjs <edl.json>` converts per-source transcripts to the output timeline with `out = word.start - segment_start + segment_offset`.
- Re-transcribe the final narration and compare it with the script or the approved transcript before every final render.
