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

Long sources: download once and cut locally; a short window from a host that serves byte ranges may be cut straight from the URL (seeking rule: `ice-assets/references/sourcing-and-licenses.md` section 5), at the output resolution (a 1080 output fetches 1080p, never a larger master; resolution and route: `ice-assets/references/sourcing-and-licenses.md` section 5). Check free space first (section 6).

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
- Agency or archive clips also record what their on-screen labels show: `"place":"<city, country as the label shows it>","date":"<the date the footage was shot>","credit":"<the credit line, agency or owner>"`, taken from the source's own metadata or page, never guessed. The location tag and the vertical source credit read these fields (the `ice-type` skill, `references/type-effects-specs.md`, section "Broadcast text"); a field that cannot be found stays empty and its label is not shown.
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
| News reel (edit type `news-reel`, style family `family-broadcast-news.md`) | The person stays untouched; the plate reactions of the matte kit (wash, brand flash, room darkening, room desaturation) change the plate behind the matte only, and archive or B-roll get the treatments of `broll-and-motion-broll.md` section 3. A blur on the presenter only as a measured transition (blur reframe, blur-out into archive, 3 to 22 f) or a measured defocus while a foreground card takes focus (tutor value: Gaussian 10 to 15, never more); desaturation and push-back only as `layers-and-isolation.md` section 3b allows | measured broadcast reels, tutors (ideas only) |

### Finishing layer (owner decision, 2026-10-29)

Scope: every edit that follows a reference, and any edit whose `ice/DIRECTION.md` logs a reason for an effect. Motion blur on fast moves, blur for depth and for entrances and exits, grain and old-film texture, vignette, glow and grade are applied only on the shots and at the amounts the reference measurement or a logged reason names, never on everything, and made with FFmpeg or the engine the edit already uses. Measuring them: `ice-remake/references/measuring.md`, section "Finishing layer". Making each one: `ice-motion/references/motion-blur-and-clock.md`, section "Finishing layer". A measured effect overrides this skill's default bans (glow, blur, texture) only on the measured shots. On the speaker's shots an effect never darkens, desaturates or tints the speaker (`layers-and-isolation.md` section 5). Without a reference or a logged reason, the defaults above hold.

## 6. Tools, installs and disk space

Tools: `ffmpeg` and `ffprobe` on PATH, Node and Python, each at the minimum in the `ice-engines` skill's `references/versions.json` (`runtimes`); Python packages from `scripts/requirements.txt`. Transcription defaults to a local Whisper-class model with word timestamps.

- **Free tools and models install without a question (owner decision, 2026-10-29).** Whisper, demucs, the speaker separation model, the matting or segmentation model, the Playwright install for motion B-roll and the pinned Python and Node packages are installed by Ice itself when the edit needs them, pinned to `versions.json`, and each install (what, version, size, where) is recorded in `ice/DIRECTION.md` and the delivery note. A question is asked only for a paid service or anything that needs an account, a sign-in or spending (a hosted ASR, AI footage or TTS, with its cost), inside the stage 01 message when the need is known then; without a yes take the free local path, log it, and say in the delivery note what the service would add. An install that needs an administrator password is one plain step told to the user. Canonical rule: `ice-engines/references/engine-choice.md` section 7, "Installs without a question".
- **Footage from outside.** Footage, photos, maps and overlays the edit needs from outside are searched and fetched by Ice itself on the free no-account routes, with no question, and each gets its ledger row (section 4): `ice-assets/references/sourcing-and-licenses.md` sections 1a and 5.
- **Disk space first.** Before any ingest copy, download, model install or render, run `node <ice-motion-director>/scripts/ice-state.mjs space --need <GB>` with the estimated size and follow the rule in the "Disk space" subsection of `ice-engines/references/engine-choice.md` section 7 (work on a drive that has room).
- **Clean up what can be rebuilt.** Proxies, extracted frames, contact sheets' source frames and scratch stems that a script can rebuild are deleted once the stage that uses them is approved, and each deletion is logged in `ice/plan/edit-notes.md`. The raw sources, the transcripts, the EDLs and every approved render are never deleted.

Shooting tip, in the same stage 01 message, whenever the edit separates the speaker from the background (text behind the speaker, a new backdrop, a cutout layout) and the footage is still to be shot or can be shot again: in plain words, a green screen or an evenly lit plain wall in a colour the speaker is not wearing; a locked-off camera on a tripod with a few seconds of the empty room before the speaker steps in; even light with no shadow on the wall and no change of exposure or white balance during the take; and a wide frame with space above the head. Footage shot this way separates with FFmpeg alone, with no model download (`layers-and-isolation.md` section 2). Already shot otherwise: the model route above is installed without a question and recorded.

### Shooting for a news reel

Scope: a news reel (edit type `news-reel`, style family `family-broadcast-news.md`) or a glass studio reel (`family-broadcast-news.md` section 4) whose footage is still to be shot or can be shot again. The tutors agree the look is about 90 percent decided at the shoot. Give the user these points in plain words in the stage 01 message:
- **Shoot wide.** The presenter centred with space on every side (no tight 50 or 85 mm framing): the digital camera needs room to move and the graphics need room around the person.
- **Headroom for the digital zoom.** The source height must be at least the largest zoom of the take times the output height (`ice-motion/references/camera.md`, "Digital camera on one take (news reel)", "Source height"): one measured package reaches about 2.14x, so a 1080 wide vertical needs a 4K-class plate; shooting 4K for a 1080 output is the safe default. The plate is scaled to about 125 percent before animating so no move shows an edge.
- **Distance from the wall.** The presenter about 2.5 to 3 m in front of the wall or the cyc: no shadow on the wall, a clean key, and room for a projected circle or graphics behind the head.
- **Coloured light.** A dark set with one diagonal beam, or a white cyc painted by coloured lights with a projected circle behind the presenter (glass studio reel); even light on the face, with no change of exposure or white balance during the take.
- **One locked take.** A tripod, one continuous take per passage (the measured talks run 28 to 37 s with no cut), a few seconds of the empty set before the presenter sits (an empty plate for the key of `layers-and-isolation.md` section 2), and a green screen or plain wall when a virtual set is planned.
- **Frame rate.** The delivery rate from the start (the measured programmes are 25 fps); never mix rates inside one reel.

## 7. Supplied or partial material

Footage is always supplied here; it is never rewritten, only cut. The router's intake table sets what each supplied item does to its stage. Differences on this route: a transcript or subtitle file is used at 01 after a spot check against the audio (word times are estimated only when no word-level transcript can be made, and the report says so); a script, paper edit or list of selects is validated at 03 against the transcript (every line exists, the length fits the target) and only its missing silence and retake decisions are filled; a supplied approach or reference edit skips 02, and a style reference runs the analysis step of the ice-remake skill at 01; a B-roll plan, shot list or inserts are validated at 04 for timing against the words and recorded with their source and license status in the footage ledger; a grade (LUT) is applied at 05 like a caption style or brand kit, with only the missing look fields filled; a showreel's track gets its sync license check and beat map at 01. Supplied material that breaks a hard rule (an invented fact, a cut inside a word, a misleading cut of a real clip) is never silently changed (`ice-direction/references/intake-and-brief.md` section 8 says what each mode does). Partial material: fill only the missing fields with this stage's method, log each fill in `ice/DIRECTION.md` with its reason and source, keep the user's own fields unchanged, and keep the stage `partial` until the fills are approved.
