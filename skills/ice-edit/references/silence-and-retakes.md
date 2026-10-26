# Silence and retake removal

Merged from nateherkai/herk-edit-kit (MIT, Use Permission: cut-silences, cut-mistakes, short-form-edit, editing playbook), browser-use/video-use (MIT), majedphotos/video-ad-editor (MIT), Omar-Tnzxo/video-production-studio, howseen-ai/claude-motion-design (MIT, adaptive silencedetect), plus ideas restated from remotion-dev/skills and imMamdouhaboammar/motion-graphics-skills (ideas only).

## 1. Order of operations

1. Probe and transcribe (`ingest-and-ledger.md`, `transcript-editing.md`).
2. Cut silences first: `node scripts/cut-silences.mjs <raw.json> --video <raw> --apply` writes `<stem>.silence-edl.json`, `<stem>.silence-transcript.json`, `<stem>.silence-decisions.md` and the silenced video.
3. Find mistakes on the SILENCED transcript: `node scripts/find-cut-candidates.mjs <stem>.silence-transcript.json` writes `cut-candidates.json` and `.md`.
4. Review every candidate in context and write `approved-cuts.json` (`{"cuts":[{"start":s,"end":s,"reason":"..."}]}`, silenced timeline; an empty list is valid).
5. Apply: `node scripts/apply-cuts.mjs <silence-transcript> --cuts approved-cuts.json --video <silenced> --apply` writes the clean video and `mistakes-transcript.json`; that transcript becomes the project transcript.
6. Optional human check: `node scripts/build-edl-review.mjs <edl.json> --original <in> --edited <out>`; serve it with a Range-capable static server so video scrubbing works.
7. Then manually read the whole transcript once more: a zero-candidate report can miss an obvious retake.

## 2. Two ways to find silence (use both when they disagree)

| Method | When | How |
|---|---|---|
| Transcript gaps (default) | Speech with word timestamps | `cut-silences.mjs`: gaps between words, head and tail trim |
| Adaptive signal detection | No reliable word timing, music or noise beds, a cross-check of ASR gaps, pre-roll and tail trimming | Measure the file first, then detect with that file's own floor (below) |

Adaptive detection, in our own structure (idea from remotion-dev/skills; recipe from claude-motion-design):
1. Measure loudness: `ffmpeg -i <src> -af loudnorm=print_format=json -f null -` and read `input_thresh` (the EBU R128 gating threshold of this file).
2. Detect with that threshold as the noise floor: `ffmpeg -i <src> -af silencedetect=noise=<input_thresh>dB:d=0.5 -f null -`.
3. Count leading silence only if the first silence starts within 0.5 s of the file start.
4. Merge silences separated by less than 0.2 s of sound.
5. Snap trims to frames: round starts down and ends up.
6. Prefer non-destructive trims (in-points and durations in the composition). If a standalone file is needed, re-encode the cut: stream copy can freeze or drop the first frames when the cut is not on a keyframe.

A fixed `-32 dB` floor with a 0.35 s minimum is the field default for clean phone talking heads (majed); use the adaptive floor whenever the room or mic is unknown.

## 3. Silence thresholds are scoped by edit type (all kept)

| Edit type | Trim a pause when it is | Breath kept | Source |
|---|---|---|---|
| Shorts and reels (house fast style) | Longer than about 0.2 s between phrases | Natural beats after a comma or list marker run 0.2 to 0.4 s and stay | herk playbook |
| Talking-head ad, fast style | 0.35 s or more (silencedetect `-32 dB`, d 0.35) | Pad 0.13 s around speech, merge gaps under 0.20 s | majed `01_cut_plan` |
| Long-form talking head (default) | 0.55 s or more (`--gap 0.55`) | 0.24 s for pauses of 2 s or more, 0.20 s after a sentence end, 0.14 s otherwise; kept breath biased 55% after the previous word, 45% before the next | herk cut-silences |
| Calm, premium, emotional or slow speakers | About 1.0 to 1.2 s or more | 0.5 to 1 s natural breath kept | founder, majed cloud playbook |
| Sermon, reading, recitation, deliberate pauses | Keep the pauses by default (a stage 01 question only when the brief leaves it open and it changes the edit); when kept, cut nothing | All | majed |
| Podcast speaker handoffs | Keep 400 to 600 ms of air between speakers | | video-use |

Other silence numbers:
- Head pad 0.22 s before the first word, tail pad 0.34 s after the last (long-form defaults); short-form starts speech within 0.1 s and ends right after the last word.
- Keep ranges shorter than 0.04 s are dropped.
- Long-form default `--gap 0.55` removes about 15 to 20% of a typical raw take as pure silence. Lower the gap for a punchier cut; raise it for more breathing room. If sentence boundaries feel too tight, raise the sentence-break breath or the gap.
- Do not remove pauses that carry meaning. Fix one rushed section by restoring time locally, never by lowering the global threshold.
- Never speed the voice up to save time.

## 4. Mistakes and retakes

What counts: stutters ("the the", "I- I-"), immediately repeated words, false starts (an abandoned phrase that restarts), and retakes (a line said again: keep the clean take, drop the botched one). Deciding is judgment, not a formula: the detector proposes, the agent reviews.

Detector numbers (`find-cut-candidates.mjs`):

| Item | Value |
|---|---|
| Stutter | Same token, gap under 0.5 s; cut the first utterance |
| Segments | Split at a gap over 0.85 s, or a sentence end after 7.5 s elapsed, or at 16 s elapsed |
| Retake | Jaccard similarity of the first 18 content tokens of two segments of 0.34 or more, or 0.24 or more with the same opening (2 of the first 4 tokens) |
| Confidence | High at 0.45 or more, medium at 0.34 or more, low below (recommend review) |
| False start | Same opening, first take under 6 s, restart within 12 s |
| Search window | Up to 8 following segments within 75 s |
| Default cut | From the earlier take's start to the restart's start; widen when needed |

Review rules:
- Common false positives: emphatic repetition ("never, never"), a copula followed by a question ("the piece is, is this"), lists. Intentional repetition is not a mistake.
- Keep the last clean take of each line. When a sentence appears twice, the first is usually the mistake and the second the correction; drop duplicates before scene design.
- Join two takes only where both sides are silent. If the takes run together, play one take whole.
- A very clean delivery may yield zero cuts. That is valid; never cut natural speech to hit a quota.
- Remove abandoned takes; keep meaningful qualifications and the payoff; keep natural breath around joins.
- Fillers: drop a filler only when there is silence on both sides of it. A filler that runs straight into the next word stays, because cutting it clips the words around it (the measured lesson: the version with fewer cuts, all between phrases, ran 5 s longer and sounded right).
- Preserve peaks: laughs, punchlines and emphasis beats. Extend past an audio event such as laughter; the reaction is the beat.
- Save every reviewed decision with its source-time reason before applying. If no cuts are needed, keep the input or use an empty list.
- After silence trimming, pauses are short, so segments split mostly at the 7.5 s and 16 s limits and a short retake can hide inside one segment. When the silenced run finds little, run the finder on the raw transcript as a second view, then write the approved ranges in silenced time using each word's `source_start` and `start` in the silence transcript.
- Non-English transcripts: the stop-word list is English, so retake scores run high; review every candidate in context. Arabic dialect transcripts need correction first (ice-arabic skill).
