# Edit type: podcast and interview

Sources: majedphotos/video-ad-editor (MIT: podcast, landscape, podcast-hook), Omar-Tnzxo/video-production-studio, browser-use/video-use (MIT), heygen-com/hyperframes (Apache-2.0: docs, media-use transcript cut), plus ideas restated from hypit-ai/hypit and remotion-dev/skills (ideas only).

Stage order: 01 03 02 04 06 05 [07 08a] 08b 09 10
Leads with: the footage. 01 ingests, syncs the cameras and makes the speaker-labelled transcript first; 03 is the paper edit (dead air and the camera plan from speech, or the numbered list of candidate reels with their hooks); 06 is the rough cut.

## Purpose
Two shapes: a full episode (usually 16:9) cleaned and switched between cameras, or short reels cut from a long episode with a written hook.

## Pipeline: multi-camera episode
1. Probe every camera; detect broken or frozen cameras; sync all angles by audio cross-correlation.
2. Transcribe with speaker labels (diarization), long audio in about 20 s chunks at silences (a single pass over a long episode drops minutes and invents stock phrases; small models fail on dialect).
3. Silence: trim only long dead air (about 1.0 to 1.2 s or more); keep 400 to 600 ms of air at speaker handoffs; adaptive detection for the room (`silence-and-retakes.md`).
4. Camera plan from speech: switch to the speaker after about 1 s of continuous speech; cut toward a meaningful reaction when it adds something (disbelief, a laugh); never alternate cameras on a timer.
5. Self-review, master, deliver.

## Pipeline: episode to reels
1. Propose a numbered list of candidate clips, each with 3 hook options in the speaker's own words; build at most 6 before the pick (the user's review card in step mode; a critic, then the approver role, in auto mode).
2. Each reel opens on its strongest line from the middle (a 3 to 12 s audio hook), then plays the context in order; one topic per short (split rather than compress).
3. Seams: the next segment starts after the hook sentence ends (no half-word repeats), never on the host's last word, snapped to the quietest point between words; run a seam check (transcribe about 4 s around each join).
4. Written hook rules in `short-form-hooks.md` section 6; reframe in `vertical-conversion.md`.

## Structure options
- Full episode, wide plus close-ups.
- Split screen top and bottom for the opening, establishing both people before the first question ends, the listener doing small silent actions.
- Reels with written hook, speaker-colored captions so the viewer knows who speaks even over B-roll.

## Rhythm ranges
| Measure | Value |
|---|---|
| Opening | Hook as a full-screen close-up |
| Shot length | Minimum 2 s; no switch before 4 s; no shot over 9 s |
| Head close-ups | 3 to 8 s, at least 8 s apart |
| 16:9 wide | On silence or overlap, plus about 4 s of wide every 45 s |
| Overlay cards | Card count formula in `house-style-numbers.md` |

## Transition policy
Hard cuts between cameras. No invented travel or establishing shots between interview setups; cut directly. J and L cuts at speaker handoffs are welcome.

## Camera policy during holds
Locked angles; listeners stay alive through their own small movements, not added camera moves.

## Sound policy
Keep each speaker's channel clean; never let two copies of the same voice overlap. Loudness target for podcast delivery differs from social (ice-audio skill).

## Text density
Caption handoff on speaker turns: the `ice-type` skill, `references/captions-system.md` section 5. Lower thirds name a person once, at their first appearance.

## QA thresholds
Single-subject check before any matting or embedded captions (split multi-speaker clips per shot or refuse). Seam check at every join. Re-transcription sync target: the `ice-type` skill, `references/caption-timing-and-truth.md` section 3.
