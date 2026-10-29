# Measuring the reference

Read this after the first whole-piece watch. Numbers point; eyes decide. Every number below either feeds the stats contract in `shot-mapping.md` or tells you where to look.

## 1. Run the analyzer

```
python <skill>/scripts/analyze.py <ice>/reference/<ref-id>/<file> --out <ice>/reference/<ref-id>/analysis
```

Local files only, no network. Optional `--cache-dir <folder>` reuses an earlier analysis of the same file; without it nothing is written outside `--out`.

Dependencies: Python and ffmpeg/ffprobe on PATH at the minimums in the `ice-engines` skill's `references/versions.json`; `numpy`, `opencv-python-headless`, `scenedetect`, `librosa` and (for `clip_strip.py`) `Pillow`, installed from this skill's `scripts/requirements.txt` (exact pins kept in sync with `versions.json`) into a project virtual environment without a question, as section 7 says. Record the versions used in the delivery report. If a package is missing, the matching section of `report.json` comes back empty; say so instead of guessing those numbers.

Outputs: `source.<ext>`, `proxy.mp4` (when cropped or longer than 120 s), `audio.wav`, `sheet_1fps.jpg`, `sheet_scenes.jpg`, `report.json`. Open both sheets before reading the JSON. You get: screen-recording crop, shot list and pacing, per-shot camera move and speed (optical flow), per-shot light and color, BPM and beats, climax candidates, flash frames.

## 2. What each measurement means

| Field | Method | Thresholds and meaning |
|---|---|---|
| `orientation` | Edges on 12 frames: text lines and UI rows make the row profile change fast; a picture stored turned 90 degrees shows the opposite. The turn direction comes from left-aligned lines | `rotated` with `confidence` high: the analysis runs on `upright.mp4` turned `applied` degrees clockwise and `picture` holds the real size. Low confidence: nothing is turned; look at the sheets and rerun with `--rotate 90` or `--rotate 270` (right-to-left text can flip the guess). `frames.py --rotate` turns extracted frames the same way |
| `crop` | ffmpeg cropdetect (limit 24) over the first 60 s at 2 fps; else the band of rows with the most temporal change. Then checked: a letterbox band must stay black in every sample, a phone-chrome band must be static and not empty | Phone screen recordings and letterboxed clips are analysed on the cropped `proxy.mp4`; a refused crop is reported in `crop_refused` (a dark-mode design is not a letterbox). `--no-crop` skips cropping. Always compare against the file in `report.json` "analysed" |
| `shots`, `pacing` | PySceneDetect ContentDetector, threshold 22 | count, mean, shortest, longest shot in seconds; `mean_shot_beats` when music is present |
| `palette` | 8 colour clusters over 24 frames, near-duplicates merged | Each colour with its share and role: `ground` (largest share), `text` (lightest near-neutral), `accent` (most saturated, not tiny), `secondary`. Per-shot `dominant` colours are mostly the ground on a dark design; read `palette` |
| `shot_details[].camera` | Every half second (a quarter of the shot under 2 s): corners tracked on 480 px greyscale (top 1/25 strip ignored), a similarity transform fitted with RANSAC (so a panel or a moving object over part of the frame does not move it), rates per second smoothed over three steps; `segments` groups the steps by kind, so a slow push inside a long one-take shot keeps its own segment and speed. A camera move needs one motion field over the picture: the agreeing points must be half or more of the tracked points and span half the frame or more; otherwise the step is a locked camera with element motion (a list scrolling, a card sliding over an empty ground). `element_motion_time_pct` and each segment's `elements_move` report that motion | Per second: zoom (log scale) above 0.006 = push_in or pull_out; pan above 0.008 = move_left or move_right; tilt above 0.008 = move_up or move_down; rotate above 0.01 = roll/orbit; below all of them but 0.002 or more = drift; otherwise static. The shot's `kind` lists the kinds covering a quarter of it or more. Pace: speed below 0.006 still, below 0.04 slow, below 0.12 medium, else fast |
| `shot_details[].look` | per-shot pixels | brightness (luma mean), contrast (luma std), dark_ratio (luma below 0.08), colourfulness (Hasler-Susstrunk style), 4 dominant colors by k-means |
| `look_summary` | over shots | low_key_shots (share with dark_ratio above 0.5), moving_camera_shots, mean brightness, camera kinds |
| `audio.bpm` | The beat grid that the tracked beats agree with best (phase coherence over periods within 10 percent of the median interval) | `bpm_reads` keeps the median interval (biased on a jittery beat list), the mean interval and the tracker's own value; `bpm_range` spans them. With a sound map, the recipe prefers the sound map's tempo at confidence 0.35 or more |
| `audio` | L, R and L+R measured separately; mono more than 10 dB below the louder channel means phase-inverted, so one channel is used; loudnorm to -14 LUFS, true peak -1.5; silent below -45 dB | `bpm` from the median inter-beat interval, `beats`, `first_beat`, `noise_floor_db` (10th percentile of 0.5 s windows), `best_30s_starts` (onset density, stepping every 4 beats) |
| `audio.peak_candidates` | loudness, onset strength and spectral bandwidth in 0.25 s steps, each z-scored and summed, smoothed over 4 steps | candidate where the mean of the next 1 s rises 0.8 or more above the previous 2 s; a quieter "held breath" just before scores higher; snapped to the nearest beat; at least 6 s apart; top 3; `drop` when the rise is 2.5 or more, else `lift` |
| `stillness` | 6 fps, 160x90 greyscale. Content = pixels ever lit above the ground; per step, the share of the content that changes beyond max(3x the clip's noise floor, 8 of 255) | `ratio`: steps where under 0.5 percent of the content changes (nothing moves); `calm_ratio`: under 6 percent (only a small element such as a cursor moves); `calm_runs`: the longest calm stretches. `raw_frame_ratio` is the old whole-frame method, which calls a small element moving on a near-black ground still; do not use it on dark UI |
| `boundaries` | Frame-to-frame difference 0.3 s each side of every detected shot boundary | `cut` when one frame holds half the change or more; `gradual` for a dissolve, morph, wipe or fast move. Only cuts count as cuts in the recipe |
| `pacing.one_take` | Shot detection found no hard cut | The whole film is one shot; its grammar is in `camera.segments` and `structure` |
| `structure` | 6 fps, 96x54 greyscale: black holds (under 0.5 percent of pixels lit); a steady fall or rise in brightness into or out of black is `fade_out` or `fade_in` (otherwise `cut_to_black` or `cut_from_black`); a small element lighting up after black is an overlay `over: black`; an 8 x 6 grid of cells where a few cells change hard while the rest stay calm is an overlay | Overlays: `pop` (two frames or less), `scale-in` (the changed area grows by a third or more) or `reveal`, with `region` as frame shares. A one-take film's transitions and density come from here; confirm each on frames |
| `flashes` | 6 fps, 64x36 luma | frames above 0.75 luma and 0.3 above their darkest neighbor within 2 frames; at least 1 s apart. Often marks a hit. |

Audio health: `silent: true` means the real audio file is missing: ask for it inside the stage 01 message; with no answer, measure tempo and peaks from the picture only (cuts, flashes, motion), mark the audio measures unmeasured, log it and report it. `phase_inverted: true` or a noise floor above -45 dB means usable; state the ceiling in the delivery note (step mode: also on the 01 review card).

Camera inference by eye, when flow is ambiguous: foreground and background shifting by different amounts means a truck with parallax; scale around one stable point means a push or pull; a changing silhouette means an orbit; one object moving against a still frame is object motion, not camera.

## 3. Extra measurements worth taking

| Measure | How | Why |
|---|---|---|
| Stillness ratio | Measured by `analyze.py` (`stillness`, section 2) on the content region against its noise floor; the whole-frame method (mean grey difference under 2 of 255) is biased on dark grounds | Some genres are a third still; a cut every second is not every style |
| Cut bursts | Cut times on a timeline | Where energy concentrates; long quiet stretches are design too |
| Beat grid fit | Fit cut and hit times to a grid with the largest step that keeps about 80% of events as inliers (least-residual fitting picks uselessly tiny steps) | Tells whether cuts land on beats, half beats or freely |
| Motion area | Per-shot heatmap of moving pixels | Shows whether a shot is one moving element or a whole moving picture |
| Element scale | Hero height as a share of frame height, per shot | Feeds subject-size rules in `climax-duel.md` |
| Text-card share | Seconds of text-only frames over runtime | Feeds the plus or minus 30 percent contract |
| Entrance types | List of how elements arrive (cut in, rise, mask, scale, draw-on) with counts | Type and motion language |

The reference frame for a transition is the last frame before it; earlier frames may still carry debris from the previous transition.

## 4. Genre claims need samples

Before saying "this style always does X", measure 2-5 representative works of that style. Impressions of a style are often wrong: well-known signature transitions turn out to appear rarely, and channels believed to be busy are mostly static. With one reference, describe that reference, not the genre.

## 5. Audio analysis is a candidate

Machine "listening" (an omni model, a tagger) only proposes. Instruments may be right; BPM, motif counts and per-segment effects are often wrong. Confirm tempo with onset detection and confirm every peak by looking at 12 fps strips.

## 6. Record

Copy the decisive numbers into `ANALYSIS.md` (section "Measured") and the per-shot table into `TIMELINE.md`. Keep `report.json` untouched as evidence.

## 7. Scripts and installs

Paths are inside this skill's folder. The scripts put their own folder on `sys.path`, so they run under `python -I` (the isolated mode used for untrusted media).

| Script | Does | Needs |
|---|---|---|
| `scripts/frames.py` | Timestamped frames: uniform, keyframe, scene-change and cue engines; duration-based budget; near-duplicate removal | Python, ffmpeg, ffprobe |
| `scripts/analyze.py` | Crop, shots, per-shot camera and look, tempo, beats, peaks, flashes, contact sheets | ffmpeg, numpy, opencv-python-headless, scenedetect, librosa |
| `scripts/clip_strip.py` | 12 fps strips, reference row above ours | ffmpeg, Pillow |
| `scripts/compare.py` | Per-shot reference versus ours with the same measurements | numpy, opencv-python-headless, scenedetect (via analyze.py) |
| `scripts/runtime.py` | Helper for frames.py | none |
| `scripts/recipe.py` | Portable style recipe from `report.json`, the notes and an optional `sound_map.json` (`style-recipe.md`) | Python only (standard library) |

Minimum Python and FFmpeg versions: `runtimes` in the `ice-engines` skill's `references/versions.json`. Packages: `scripts/requirements.txt` (exact pins kept in sync with `versions.json`), installed into a project virtual environment without a question: they are free and pinned (owner decision, 2026-10-29; the one rule for installs, what is recorded and what stays a question: `ice-engines/references/engine-choice.md` section 7, "Installs without a question"). Each install is recorded (what, version, size, where) in `ice/DIRECTION.md` and the delivery note. When an install cannot run (no network, `ICE_OFFLINE=1`, or it needs an administrator password, which is one plain step told to the user): run what the installed tools allow, mark every number that could not be measured as unmeasured in `ANALYSIS.md` and judge those by eye from frames, log it, and say in the delivery note what the install would add.

**Disk space and clean-up** (the one rule: `ice-engines/references/engine-choice.md` section 7, "Disk space"). Check free space before the reference download and before `analyze.py`, and work on a drive that has room. A reference video is downloaded at the output resolution, not above it (1080p for a 1080 film: `ice-assets/references/sourcing-and-licenses.md` section 5). Files that can be rebuilt are deleted once their notes are written: the `frames/` folders after `ANALYSIS.md`, `TIMELINE.md` and `REASONS.md` are done (move any frame worth reopening into `evidence/` first; a later frame is rebuilt with the same `frames.py` command), and the heavy files in `analysis/` (`proxy.mp4`, `upright.mp4`, `audio.wav`) and any scratch measuring output after the stage 10 recipe export. Keep `report.json`, the contact sheets, `evidence/`, the notes files, `peaks.json` and `sound_map.json`. Log what was deleted and how much space it freed in `ice/DIRECTION.md`. All scripts read local files only and never use the network. Licenses: `scripts/LICENSE-reelmimic.txt`, `scripts/LICENSE-claude-video.txt`.

## 8. Sound map

Stage 01, after `analyze.py`, once per reference: `python <ice-audio>/scripts/sound_map.py <reference file> --out <ice>/reference/<ref-id>` (`<ice-audio>` is the `ice-audio` skill's folder; the reference folder itself, where `scripts/recipe.py` reads `sound_map.json`). Installs follow that script's own requirements and section 7 (free pinned packages, no question); when they cannot run, skip it and the recipe says "no sound map". Build the music questions of the stage 01 four-choice round from `music.instrumentation_guess` and `music.genre_guess`: the top proposal first with its confidence as the reason, alternatives from the next proposals and the brief. Nothing from the map is logged as fact before the user answers or waives the questions. Full rules: `ice-audio/references/sound-map.md` section 4.

## 9. Finishing layer

Owner decision, 2026-10-29: the finishing seen in a reference (motion blur, blur for depth and for entrances and exits, film texture, vignette, glow, grade) is measured, not guessed, and later applied only where its row says. Scope: every reference video; for an image set or a saved site, the effects a still shows (grain, halftone, vignette, glow, grade). Written at stage 01 into the "Finishing layer" table of `ANALYSIS.md` (`notes-files.md` section 1), one row per effect and passage, with five cells: **where** (which shots, moves, elements or seconds), **how much** (a number with its unit), **measured how** (the tool and the frames, or "by eye on" the named frame files), **why** (what it signals at those places, read from where it occurs and what it lands on, the way `REASONS.md` reads an element). An effect that marks an element (text that arrives blurred, a flash that introduces a person) also goes into that element's `REASONS.md` row. When the reference shows no finishing, write one row `none seen` so the recipe does not call it unknown.

Tools, all already used by this skill: `analyze.py` (`report.json`), `frames.py` (`--no-dedup`, `--resolution`, `--timestamps`), `clip_strip.py`, and FFmpeg. Two FFmpeg helpers serve several rows:
- **Per-frame levels:** `ffmpeg -i <file> -vf signalstats,metadata=print:file=levels.txt -f null -`, run from inside the reference folder so the output name has no drive letter (a colon inside a filter option breaks the filter on Windows). Every frame gets `YAVG` (mean luma), `YMIN`, `YMAX` and `SATAVG`.
- **A calibration ladder** for effects no script measures: take a sharp, clean frame of the same reference, make copies with a known amount of the effect (blur: `gblur=sigma=<n>`; grain: `noise=alls=<n>:allf=t`; vignette: `vignette=angle=<radians>`), lay them beside a crop of the effect frame at the same size, and record the nearest step. Save the ladder under `evidence/` with the step values in the file names.

| Effect | Where to look | How much (unit) | Measured how |
|---|---|---|---|
| Motion blur on fast moves | Segments `analyze.py` marks `fast`, whips and fast element moves found in pass 4 | Streak length in px and the shutter it implies: streak divided by the movement per frame, times 360 degrees. Movement per frame: camera speed (frame shares per second) times the frame width, divided by the fps; for an element, its shift between two consecutive frames | `frames.py --no-dedup --timestamps` on two consecutive frames of the move; streak and shift measured on the same frame size, stated |
| Blur for depth | Shots where one layer is soft while another is sharp (a soft background behind a sharp subject, a soft foreground) | Gaussian sigma in px of each soft layer, at the stated frame size | Calibration ladder |
| Blur on entrances and exits | Elements and shots that arrive or leave soft (text, cutouts, shot changes) | Frames from fully soft to sharp (count and seconds), the first frame's sigma, and whether opacity, position or scale move with it | Every frame of a 1 s window (`frames.py --no-dedup --timestamps` at each frame time) against the ladder |
| Grain | Which passages carry it (all, some, none) | Ladder step (the `noise` strength), and whether it changes every frame or stays fixed | Calibration ladder on a flat area (sky, wall, plain ground); say when the reference's compression hides grain finer than it keeps |
| Specks, scratches, dust | Passages with old-film texture | Specks per second, their size in px, light or dark | Count on `clip_strip.py` strips at 12 fps over the passage |
| Halftone or dot screen | Passages, images or type that carry it | Dot pitch in px and screen angle | By eye on a 1:1 crop (`frames.py --resolution` at the full width) |
| Flicker | Steady passages that pulse in brightness | Spread (standard deviation) of `YAVG` over the passage after removing its slow trend, in luma levels | Per-frame levels; `analyze.py` `structure.luma_6fps` sees only slow flicker |
| Flash | Hits and seams with a bright frame | Peak level and the frames it takes to fall back | `analyze.py` `flashes`, then per-frame levels around each |
| Vignette | Every shot, or some | Corner luma over centre luma, on several shots of different content (a darkening that stays whatever the content is the vignette; one shot proves nothing) | Calibration ladder, or FFmpeg `crop` of each corner and the centre with `signalstats` |
| Glow (bloom, halo) | Around bright type, lights and highlights | Halo radius in px and how far it lifts the ground just outside the edge, in luma levels | A 1:1 crop beside a frame of the same shot without the bright element, by eye or by pixel sampling |
| Grade | Per passage (a passage in its own grade, such as monochrome or a tint, is its own row) | Black and white points (low and high `YMIN` and `YMAX` over the passage: blacks well above 16 are lifted), contrast and colourfulness, palette with roles, the cast in shadows and highlights | `analyze.py` `look` and `palette`, per-frame levels, pixel samples on named frames |

**Applying it.** An effect is applied in the new film only where its row's where and why hold for a new shot (planned per shot in `shot-mapping.md` section 2, `finishing`), never on everything: an effect the reference uses on some shots goes only on the new shots with the same reason, and only an effect seen on every shot (a constant grade, a constant grain) becomes a film-wide setting. How to make each effect with Ice's tools: `ice-motion/references/motion-blur-and-clock.md`, section "Finishing layer". `scripts/recipe.py` carries the table into the recipe's Look section.
