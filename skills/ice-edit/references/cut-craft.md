# Cut craft: where to cut and how joins sound

Merged from nateherkai/herk-edit-kit (MIT, Use Permission: editing playbook, video-storytelling, cut-mistakes), browser-use/video-use (MIT), majedphotos/video-ad-editor (MIT), Omar-Tnzxo/video-production-studio, digitalsamba/claude-code-video-toolkit (MIT), heygen-com/hyperframes (Apache-2.0, creator editing recipes), plus ideas restated from hypit-ai/hypit and imMamdouhaboammar/motion-graphics-skills (ideas only).

## 1. Where a cut may land

| Rule | Detail |
|---|---|
| Between phrases, never inside one | A phrase is what is said in one breath. Cut at real silence between phrases or sentences |
| Never inside a word | Snap every cut edge to a word boundary from the transcript |
| Silence quality | Silences of 400 ms or more are the cleanest; 150 to 400 ms boundaries are usable after a visual and listening check; under 150 ms is unsafe (mid-phrase) |
| Word decay | Cut only after a word fully decays: transcripts end words 40 to 80 ms before the final consonant dies. Own-voice narration: cut at the quietest 10 ms valley |
| No double cuts | Avoid two hard cuts inside one short clause |
| Both tracks | Every cut must work on picture and sound together |

## 2. Padding (absorbs ASR drift of 50 to 100 ms)

| Pace | Pad before first kept word / after last | Source |
|---|---|---|
| Fast reels and ads | About 0.06 s / 0.08 s (tight) up to 0.05 s / 0.08 s | mamdouh idea, video-use example |
| Default working window | 30 to 200 ms each side; tighter for fast pace, looser for cinematic | video-use |
| Phone or cloud field pipeline | 0.13 s tail after each segment; each segment's audio starts 0.16 s early; the last segment runs to the file end with a 150 ms fade | majed |

## 3. Join sound (scoped, all kept)

| Situation | Join | Source |
|---|---|---|
| Every rendered segment boundary (any edit type) | 30 ms audio fade in and out at each edge (`afade=t=in:st=0:d=0.03`, `afade=t=out:st=<dur-0.03>:d=0.03`), or audible pops | video-use, toolkit cutdown |
| Phone or cloud field pipeline | Fade in 35 ms, out 70 ms | majed |
| Stutter or false-start cut between two spoken words | Hard join is usually clean; add a 20 to 30 ms fade for tighter audio | herk cut-mistakes |
| Adding air between sentences (long-form) | Insert a donor slice of the track's own room tone with 10 ms fades, spliced into the word tail with a 40 ms equal-power crossfade into the tail's own decay. Never butt tone against a word tail (a decay naturally takes 60 to 120 ms) | herk video-storytelling |
| Any inserted silence | Never digital silence (`anullsrc`) against a real floor around -50 to -70 dBFS: it is an audible dropout | herk |

Air pass (long-form): flag sentence-boundary gaps about 10 times tighter than the speaker's own median gap (one measured speaker: median 470 ms, flagged joins at 20 to 40 ms) and insert 4 to 8 frames of air; never touch the words. Between sentences a talking head is near-still, so holding the frame for 4 to 8 frames is invisible.

## 4. Split edits, holds and reactions

- J-cut: the next shot's sound leads its picture by 4 to 12 frames (about 0.15 s). L-cut: the sound of a shot continues under the next picture. In engines that place media as elements, every video in a J or L cut is muted and its sound is its own audio element; two sounds never overlap from the same source.
- A-roll speech joins are direct cuts by default. A crossfade between speaking clips eats word windows and can overlap speech; do not ask clips for silent handles.
- Holding, looping or retiming footage is an expressive choice with a recorded reason, never a consequence of a window being longer than the clip.
- Podcasts and interviews: cut to the speaker or to a meaningful reaction, never on a timer (details in `edit-types/podcast.md`).

## 5. Rendering the cut without drift

| Method | Use when | Note |
|---|---|---|
| One-pass trim and concat filtergraph (`cut-silences.mjs`, `apply-cuts.mjs`) | One talking-head source, lip sync critical | Selects exact frames in one pass; encoding each segment separately and concatenating drifted lip sync by about a frame at half the joins in one measured case |
| Per-segment extract plus lossless concat (`render.py`) | Multi-source EDLs, overlays and subtitles added later, grades per segment | Avoids double encoding; every segment shares one frame rate (forced or the first source's rate) because `-c copy` concat needs it |
| Per-segment `-ss` before `-i`, then the concat demuxer | Many segments on a low-memory machine | Nine or more trim branches in one filtergraph ran out of memory in the field |

Whatever the method: normalize every input to the same frame time base before overlaying; build final face crops from the native-resolution source, not a downscaled proxy; then prove sync (section 6).

ffmpeg traps:
- Trim audio with `atrim=start=S:end=E,asetpts=PTS-STARTPTS` first, then fade. An output-side `-ss` with `afade` fades on the source clock, so every clip after the first comes out silent.
- Speed: `setpts` multiplier = 1/speed, `atempo` = speed, `atempo` limited to 0.5 to 2.0 (chain it for more). Use pre-processing for extreme or variable speed. In timeline engines, consumed source = timeline duration x rate, and every later start moves by the same delta.
- Source cuts are structural edits (in-points and durations), never keyframe animation.

## 6. Prove every cut

- Lip sync: compare each cut frame against the raw; a matching frame count alone does not prove the right frames were picked.
- Every word whole: transcribe about 4 s around every join and compare with the raw; ASR can guess a clipped word correctly while a listener hears it broken, so also listen. Look for repeated or cut words.
- Acoustic audit at junctions: whole-track scan for runs of digital-zero samples inside pauses, millisecond envelope check at each junction edge, and a fresh ASR pass of the delivered audio diffed against the expected text. What clients call stutters are usually truncation cliffs and dead holes, not doubled words.
- Never fade the last spoken word.
