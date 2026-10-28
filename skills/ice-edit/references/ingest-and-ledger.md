# Ingest, probe and the footage ledger

Merged from nateherkai/herk-edit-kit (MIT, Use Permission), browser-use/video-use (MIT), majedphotos/video-ad-editor (MIT), Omar-Tnzxo/video-production-studio, Barty-Bart/motion-graphics (MIT), plus ideas restated in our own words from Vincentwei1021/video-talkcraft (noncommercial, ideas only). Numbers kept as measured.

## 1. Project folder and file hygiene

| Rule | Detail |
|---|---|
| Preserve raw | Never overwrite or re-encode the original. Copy or link it into the project as the source; every stage writes a new file name |
| One stage, one file | Name outputs by stage (silenced, cut, graded, captioned, master). Archive obsolete work; never overwrite an approved version |
| Session outputs | All edit outputs live in the project's edit folder inside the user's project, never inside the skill folder |
| Session memory | Keep `ice/plan/edit-notes.md`: strategy, decisions with reasons, outstanding items. On resume, summarize the last session in one sentence before acting |
| Reuse | Reuse verified transcripts and assets. Re-transcribe only when the source file changed (hash differs). Never substitute an older take |
| Credentials | Keep keys out of compositions, screenshots, transcripts and commits. A tool that names a service does not mean the integration exists: check what is installed first |

## 2. Probe every source before deciding anything

Run `ffprobe` on every file and record, per source: duration, resolution, display rotation, average and real frame rate, codec, pixel format, color transfer, audio streams and channels.

| Finding | Action |
|---|---|
| Variable frame rate (average differs from real rate, or frame gaps) | Convert to constant frame rate before cutting or segmenting (`-vsync cfr -r <fps>`); masking and overlays break on VFR |
| Dropped frames (gap between frame timestamps over 0.07 s) | Repair with motion interpolation (`minterpolate=fps=<fps>:mi_mode=mci`) before cutting. Phone browser recordings measured 13 to 54% dropped |
| Hidden duplicated frames (a near-zero frame difference repeating at a fixed period, for example every 6 frames) | Treat as wrong frame rate; conform before cutting |
| HDR source (`color_transfer` is `smpte2084` or `arib-std-b67`) | Tone map to Rec.709 SDR before any grade or merge (`render.py` does this per segment). Convert each clip separately before joining, or the tag is lost and colors turn pale or orange. On Apple devices the vendor converter is more faithful when available |
| Rotation side data | Swap width and height for quarter turns; ffmpeg autorotates on decode |
| Full-range or HEVC phone footage | Re-encode to H.264 High, yuv420p, tv range, bt709 tags for delivery |
| No speech in a source that a cutter needs | The cutting renderers expect one video and one audio stream; supply an audio track (silent if needed) |
| Speaker footage frame rate differs from the film | Change the film's frame rate to the footage's rate rather than duplicating frames. Speaker footage duration must match its voice to the frame; more than 1 frame off reads as lip drift |
| Layout math | Compute layouts from the measured display aspect, never the container's nominal one. Store speaker geometry as fractions of the source size |
| Color matrix | Frames extracted by ffmpeg are bt709 pc; browser JPEG decode is bt601 pc. A mismatch turns skin yellow or green: tag and convert explicitly |

Also check light and color with a scope (waveform, vectorscope) once per source, and note the face and hand areas: nothing may later cover them (see `layers-and-isolation.md`).

## 3. Inventory pass (cheap first)

1. Probe all sources (section 2).
2. Transcribe each source once and cache it (see `transcript-editing.md`).
3. Pack transcripts into phrase lines (`scripts/pack_transcripts.py`).
4. Look at one or two filmstrips per source (`scripts/timeline_view.py`) or a 1 fps contact sheet (`fps=1,scale=160:-1,tile=10x5`) to learn the framing and spot burned-in text.
5. Write a shortlist of usable intervals: exact source start and end, what happens, the visible consequence, provenance, and the story role.

Long sources: never pull a short clip by seeking over HTTP; download the full stream once (with the user's rights to it) and cut locally.

## 4. The footage ledger (no repeated shot)

Every inserted shot (B-roll, screen recording, generated clip, archive) gets one row in `assets/footage-ledger.json`:

```json
[{"scene":"<scene id>","sourceSceneId":"<semantic name of the moment>",
  "asset":"assets/<file>","sha256":"<64 lowercase hex>",
  "sourceStart":0.0,"sourceEnd":0.0,
  "framing":{"9x16":"<what stays visible>","16x9":"<what stays visible>"}}]
```

Rules:
- Intervals refer to that exact local file, before any speed change. Record upstream provenance in the row as `"source":{"url":"<URL or supplied path>","owner":"<who made or holds it>","license":"licensed | unknown | needs purchase","checked":"<date>"}` (`ice-assets/references/sourcing-and-licenses.md` section 0: rights are the user's; the status is a record, never a block, and the delivery note lists every item that needs a license before publishing).
- Scene identity survives crop, grade, speed, reverse and transcode: another crop, file name, speed, reverse or grade does not make a new scene. Re-encoding changes hashes, so semantic identity and a visual review are still needed.
- Repeat policy by edit type:

| Edit type | Repeat rule |
|---|---|
| Shorts and reels, talking-head ad | Each scene once per reel. Using the same scene in two requested aspect ratios is expected |
| Long-form, podcast | The same file never in adjacent shots and at most 2 shots per film |
| All | A callback must develop the idea into a new state and composition; it is never permission to replay footage |

- Check with `node scripts/validate-footage.mjs <project>`: missing scene identity, missing or mismatched hash, repeated scene, overlapping intervals of the same file, ledger rows for unselected scenes.
- Keep a duration ledger beside it: authentic footage, generated illustration, designed graphics, speaker-only time. Explain the denominator; count a split panel once. Captions over footage stay footage. A still image with a camera move is a photographic layer, not moving B-roll. There is no default graphics or B-roll percentage.

## 5. Grade policy (footage of people)

| Situation | Rule | Source |
|---|---|---|
| Default for talking heads, podcasts, captions-only edits | Deliver the footage untouched: no grade, tint, LUT, blur or scanline on the person | majed, founder, hyperframes embedded-captions |
| User asks for polish, or the scope shows a real exposure problem | Measure, make one before/after pair, apply only after it is approved at 05 (the user's review card in step mode, the approver role in auto mode) | founder |
| Approved correction | `scripts/grade.py --analyze` proposes a bounded correction (at most about 8% on any axis, no color shift; targets luma range about 0.72, mean about 0.48, saturation about 0.25). Put a grade in the EDL `grade` field only after approval; `render.py` applies it per segment during extraction, never after concat | video-use |
| Creative look | Opt-in by name only (`warm_cinematic` is too aggressive for ordinary launch content); test skin tones first. Treatment recipes and looks belong to the ice-styles skill | video-use |
| Whole-media limits | A grade or effect applies to the whole clip; it does not isolate or track a face, a plate or an address. Say so instead of pretending | hyperframes media-use |

## 6. Tools and consent items

Tools: `ffmpeg` and `ffprobe` on PATH, Node and Python, each at the minimum in the `ice-engines` skill's `references/versions.json` (`runtimes`); Python packages from `scripts/requirements.txt`. Transcription defaults to a local Whisper-class model with word timestamps. Consent items: a hosted ASR, AI footage or TTS (optional and paid, with its cost), a model download (matting, segmentation, ASR, with its size) and the Playwright install for motion B-roll. Ask them inside the stage 01 message when the need is known then. Without a yes, take the path that needs none (local, free, or the original frame), log it in `ice/DIRECTION.md`, and say in the delivery note what a yes would add. Never install, download or spend on your own.

Shooting tip, in the same stage 01 message, whenever the edit separates the speaker from the background (text behind the speaker, a new backdrop, a cutout layout) and the footage is still to be shot or can be shot again: in plain words, a green screen or an evenly lit plain wall in a colour the speaker is not wearing; a locked-off camera on a tripod with a few seconds of the empty room before the speaker steps in; even light with no shadow on the wall and no change of exposure or white balance during the take; and a wide frame with space above the head. Footage shot this way separates with FFmpeg alone, with no model download (`layers-and-isolation.md` section 2). Already shot otherwise: name the model route and its size as a consent item instead.

## 7. Supplied or partial material

Footage is always supplied here; it is never rewritten, only cut. The router's intake table sets what each supplied item does to its stage. Differences on this route: a transcript or subtitle file is used at 01 after a spot check against the audio (word times are estimated only when no word-level transcript can be made, and the report says so); a script, paper edit or list of selects is validated at 03 against the transcript (every line exists, the length fits the target) and only its missing silence and retake decisions are filled; a supplied approach or reference edit skips 02, and a style reference runs the analysis step of the ice-remake skill at 01; a B-roll plan, shot list or inserts are validated at 04 for timing against the words and recorded with their source and license status in the footage ledger; a grade (LUT) is applied at 05 like a caption style or brand kit, with only the missing look fields filled; a showreel's track gets its sync license check and beat map at 01. Supplied material that breaks a hard rule (an invented fact, a cut inside a word, a misleading cut of a real clip) is never silently changed (`ice-direction/references/intake-and-brief.md` section 8 says what each mode does). Partial material: fill only the missing fields with this stage's method, log each fill in `ice/DIRECTION.md` with its reason and source, keep the user's own fields unchanged, and keep the stage `partial` until the fills are approved.
