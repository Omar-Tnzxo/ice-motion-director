# Measuring the reference

Read this after the first whole-piece watch. Numbers point; eyes decide. Every number below either feeds the stats contract in `shot-mapping.md` or tells you where to look. Every aspect of a reference is measured and carried over, not only its colours and text: pace (section 10), fixed marks (section 11), depth, 3D and camera (section 12, where the principle lives), finishing (section 9) and sound (section 8).

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

Copy the decisive numbers into `ANALYSIS.md` (section "Measured") and the per-shot table into `TIMELINE.md`. Keep `report.json` untouched as evidence. Then take the measures `analyze.py` does not: pacing events (section 10), fixed marks (section 11), depth, 3D and camera (section 12), the finishing layer (section 9), and, for a reel cut from a long episode, section 13.

## 7. Scripts and installs

Paths are inside this skill's folder. The scripts put their own folder on `sys.path`, so they run under `python -I` (the isolated mode used for untrusted media).

| Script | Does | Needs |
|---|---|---|
| `scripts/frames.py` | Timestamped frames: uniform, keyframe, scene-change and cue engines; duration-based budget; near-duplicate removal | Python, ffmpeg, ffprobe |
| `scripts/analyze.py` | Crop, shots, per-shot camera and look, tempo, beats, peaks, flashes, contact sheets | ffmpeg, numpy, opencv-python-headless, scenedetect, librosa |
| `scripts/clip_strip.py` | 12 fps strips, reference row above ours | ffmpeg, Pillow |
| `scripts/compare.py` | Per-shot reference versus ours with the same measurements | numpy, opencv-python-headless, scenedetect (via analyze.py) |
| `scripts/runtime.py` | Helper for frames.py | none |
| `scripts/recipe.py` | Portable style recipe from `report.json`, the notes and an optional `sound_map.json` (`style-recipe.md`); with `--events`, only the pacing events file `analysis/events.json` (section 10) | Python only (standard library) |

Minimum Python and FFmpeg versions: `runtimes` in the `ice-engines` skill's `references/versions.json`. Packages: `scripts/requirements.txt` (exact pins kept in sync with `versions.json`), installed into a project virtual environment without a question: they are free and pinned (owner decision, 2026-10-29; the one rule for installs, what is recorded and what stays a question: `ice-engines/references/engine-choice.md` section 7, "Installs without a question"). Each install is recorded (what, version, size, where) in `ice/DIRECTION.md` and the delivery note. When an install cannot run (no network, `ICE_OFFLINE=1`, or it needs an administrator password, which is one plain step told to the user): run what the installed tools allow, mark every number that could not be measured as unmeasured in `ANALYSIS.md` and judge those by eye from frames, log it, and say in the delivery note what the install would add.

**Disk space and clean-up** (the one rule: `ice-engines/references/engine-choice.md` section 7, "Disk space"). Check free space before the reference download and before `analyze.py`, and work on a drive that has room. A reference video is downloaded at the output resolution, not above it (1080p for a 1080 film: `ice-assets/references/sourcing-and-licenses.md` section 5). Files that can be rebuilt are deleted once their notes are written: the `frames/` folders after `ANALYSIS.md`, `TIMELINE.md` and `REASONS.md` are done (move any frame worth reopening into `evidence/` first; a later frame is rebuilt with the same `frames.py` command), and the heavy files in `analysis/` (`proxy.mp4`, `upright.mp4`, `audio.wav`) and any scratch measuring output after the stage 10 recipe export. Keep `report.json`, `events.json`, `depth.json`, the contact sheets, `evidence/`, the notes files, `peaks.json` and `sound_map.json`. Log what was deleted and how much space it freed in `ice/DIRECTION.md`. All scripts read local files only and never use the network. Licenses: `scripts/LICENSE-reelmimic.txt`, `scripts/LICENSE-claude-video.txt`.

## 8. Sound map

Stage 01, after `analyze.py`, once per reference: `python <ice-audio>/scripts/sound_map.py <reference file> --out <ice>/reference/<ref-id>` (`<ice-audio>` is the `ice-audio` skill's folder; the reference folder itself, where `scripts/recipe.py` reads `sound_map.json`). Installs follow that script's own requirements and section 7 (free pinned packages, no question); when they cannot run, skip it and the recipe says "no sound map". Build the music questions of the stage 01 four-choice round from `music.instrumentation_guess` and `music.genre_guess`: the top proposal first with its confidence as the reason, alternatives from the next proposals and the brief. Nothing from the map is logged as fact before the user answers or waives the questions. Full rules: `ice-audio/references/sound-map.md` section 4.

**Speech-led reference** (a voice covers most of the track: a news reel, a talk, an explainer): the sound map finds effects under dense speech less reliably, so the SFX targets come from the picture events instead. Every row of the `TIMELINE.md` per-shot table and of its `## Events` table (section 10) whose picture event can carry a sound (a camera move, a graphic in or out, a flash, a cut into archive) gets its sound written from a listen at that time (the `sound cue` cell of a per-shot row, the `note` of an Events row): the effect type, its offset to the picture event in frames, and its level under the voice, or "none". The sound map's effects confirm or add to these cues; a cue no listen confirms stays `unknown: a listen at <t> s`. Which effect goes with which move: `ice-audio/references/sfx.md`, section "Broadcast SFX by move".

## 9. Finishing layer

Owner decision, 2026-10-29: the finishing seen in a reference (motion blur, blur for depth and for entrances and exits, film texture, vignette, glow, grade) is measured, not guessed, and later applied only where its row says. Scope: every reference video; for an image set or a saved site, the effects a still shows (grain, halftone, vignette, glow, grade). Written at stage 01 into the "Finishing layer" table of `ANALYSIS.md` (`notes-files.md` section 1), one row per effect and passage, with five cells: **where** (which shots, moves, elements or seconds), **how much** (a number with its unit), **measured how** (the tool and the frames, or "by eye on" the named frame files), **why** (what it signals at those places, read from where it occurs and what it lands on, the way `REASONS.md` reads an element). An effect that marks an element (text that arrives blurred, a flash that introduces a person) also goes into that element's `REASONS.md` row. When the reference shows no finishing, write one row `none seen` so the recipe does not call it unknown.

Tools, all already used by this skill: `analyze.py` (`report.json`), `frames.py` (`--no-dedup`, `--resolution`, `--timestamps`), `clip_strip.py`, and FFmpeg. Two FFmpeg helpers serve several rows:
- **Per-frame levels:** `ffmpeg -i <file> -vf signalstats,metadata=print:file=levels.txt -f null -`, run from inside the reference folder so the output name has no drive letter (a colon inside a filter option breaks the filter on Windows). Every frame gets `YAVG` (mean luma), `YMIN`, `YMAX` and `SATAVG`.
- **A calibration ladder** for effects no script measures: take a sharp, clean frame of the same reference, make copies with a known amount of the effect (blur: `gblur=sigma=<n>`; grain: `noise=alls=<n>:allf=t`; vignette: `vignette=angle=<radians>`), lay them beside a crop of the effect frame at the same size, and record the nearest step. Save the ladder under `evidence/` with the step values in the file names.

**Seven numeric measures.** They give numbers where the ladder gives a nearest step; take them per passage on frames without overlays (a frame before a graphic enters, or a box that avoids every graphic, caption and mark), at full width (`frames.py --resolution` at the frame width, `--no-dedup --timestamps`), in luma levels 0-255 (`0.299 R + 0.587 G + 0.114 B`). No script ships for them: write a short scratch script with `numpy` and `opencv-python-headless` (already in `scripts/requirements.txt`) in the run's scratch folder, never in the project. Methods restated from the owner's research measuring tools (2026-10-29).

| Measure | Box | Method | Reads as |
|---|---|---|---|
| Grain std | A flat area (wall, sky, plain ground, plate) on 3 frames of the passage and 3 of another | Luma minus its Gaussian blur at sigma 3 px (a high-pass), then the standard deviation of that residual; grain size is twice the half width of its autocorrelation | Studio digital footage sits well under 1; a clear added grain sits near 2 or above. The same value on every shot is a film-wide grain; a value only on some passages belongs to their source |
| Halftone or scanline FFT ratio | The same flat box | Power spectrum of the high-pass box under a Hann window, the centre (DC) zeroed; the strongest peak divided by the spectrum median, with its period in px and its angle | A ratio above about 200 is a periodic pattern. It is an overlay (halftone, scanlines, screen) only when the same period and angle recur on other shots and areas; once only, it is content (blinds, wood, a floor) |
| Vignette ratio | Four corner patches and a centre patch, each a tenth of the shorter frame side | Mean corner luma over mean centre luma | Under 1 darkens the corners. Measure it on several shots of different content: a ratio that stays whatever the content is the vignette; one shot proves nothing |
| Chromatic aberration offset | A box around a high-contrast edge near the frame border | Sobel edges of each channel; phase correlation of the R edges and of the B edges against the G edges, in px along x and y | Under about 0.3 px is none (antialiasing); a steady split above 1 px on the same element kind is an effect: write which elements carry it |
| Glow radius | A box around bright type or a bright shape on a darker ground | Ground = the 20th percentile of the box, core = pixels above ground plus 80 percent of (the 99.5th percentile minus ground); a distance transform from the core; the radius in px where the mean of each one-pixel ring falls to ground plus 10 percent of the range | The halo radius per element kind (title, pin, disc); compare with a frame of the same shot without the element when the ground is busy |
| Blur sigma | A box on each layer (subject face, background, a plate) of one frame | Variance of the Laplacian of each box; sigma more than the sharpest box is about the square root of (sharpest variance over this variance) minus 1, in px at that frame size | Relative and rough: confirm any value the film will copy with the calibration ladder. It gives the background defocus behind a subject and the depth of field of section 12 |
| Black and white levels | The whole frame, on frames of each passage | Luma p1, p50 and p99, beside the per-frame `YMIN` and `YMAX` | p1 at or near 0 means crushed blacks; p1 well above 16 means lifted blacks; p99 under about 235 means held highlights. Add the shadow and highlight cast (mean colour of the darkest and the brightest tenth) |

Each number goes into the effect's row of the table below (how much, measured how), with the frame files in Evidence.

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

## 10. Pacing events

Owner decision, 2026-10-29 (lesson L9; scope: general, any video made with a reference). A reference's pace is measured as events, not only as shot lengths: a film made with it is not delivered while its longest gap is longer, or its events per minute fewer, than the reference allows (the gate and its tolerances: `ice-qa/references/motion-density.md`, "Pacing against the reference"; the plan-level twin, `plan.reference`: `ice-edit/references/clock-and-grouping.md`). The warning is a blocker, never a note.

**What counts as an event.** Every authored visual change: a cut or a gradual seam (dissolve, morph, wipe), the start of a camera move (digital zooms, pans and reframes included), a graphic in and a graphic out (text, card, plate, pill, disc, map, flag, cut-out, lower third), a flash, a colour wash. Not an event: a hold (a held frame, a black hold; written with kind `hold` for the record), motion inside an element that stays (a counter ticking, a loop). Caption chunks count as `graphic` events with the note `caption` on both sides or on neither: count them when the reference shows captions, and the film's events file then lists its own. A `sound` row is written only where a sound is the only change over a held picture. The rule for every kind: the reference and the film are counted the same way.

**How it is read.**
1. `analyze.py` (section 1): every shot boundary, hard or gradual; the start of every moving camera segment; `flashes`; the `structure` overlays (pop, reveal, scale-in) and fades.
2. The `## Events` table of `TIMELINE.md` (`notes-files.md` section 2): one row per event the analyzer misses or cannot name: every graphic in and out at its first frame (from 12 fps strips, `clip_strip.py`), every camera move under about 1 s found with the finer method of section 12, every colour wash.
3. Write the file: `python <skill>/scripts/recipe.py --ref <ice>/reference/<ref-id> --events`. It merges both sources, keeps one event per kind within one frame, writes `analysis/events.json` and prints the longest gap and the events per minute. Python standard library only. Run it again after every new row.
4. Check by eye: open the longest gap on a strip. A change in it that no row lists gets its row, then run step 3 again. An analyzer event that is not authored (a compression flicker, a person moving inside a locked shot) is deleted from `events.json` by hand last, with the reason in the `Pacing:` line, because a rerun rewrites the file.

**Events file schema** (one format for the reference and the film): `{"duration": <seconds>, "fps": <optional>, "events": [{"t": <seconds>, "kind": "cut|camera|graphic|flash|sound|hold", "end": <seconds, holds only>, "note": "<optional>"}]}`. Reference: `ice/reference/<ref-id>/analysis/events.json`. Film: `<render>.events.json` next to the render. A reader accepts `type` in place of `kind` (the film's events file of `ice-qa/scripts/motion_check.py` writes `type`) and a bare list of events when the duration comes from the video or the plan.

**The two numbers.** Longest gap: the largest difference between consecutive event times, with 0 and `duration` as the bounds. Events per minute: events (holds excluded) divided by the duration, times 60. Both are always recomputed from `events`; the stored `longest_gap`, `longest_gap_at` (the gap's start and end, in seconds) and `events_per_minute` fields are informational.

**Recorded.** The two numbers go into "Measured" of `ANALYSIS.md`, and the Recipe notes get one line, read by `scripts/recipe.py` into the recipe's `pacing` block next to the numbers it measures:
`Pacing: longest gap <s> s at <start>-<end> s, <n> events per minute, kinds <the kinds counted>; <what the measure misses, or none>`

## 11. Fixed marks

Owner decision, 2026-10-29 (lesson L10; scope: category: remakes and edits that follow a reference with an organisation's identity). A mark that stays on screen through the reference (a channel logo, a programme name or logotype, a corner bug, a badge, a progress bar, a watermark) is part of its identity and is measured like any element. Where the new film puts it depends on the `identity` choice: `rights-and-modes.md` section 1, "Fixed identity marks". The check: `ice-qa/references/identity-tests.md`, "Fixed identity marks".

**What to measure, per mark** (on the first and the last frame where it shows and on three frames between, at full width: `frames.py --resolution <frame width> --no-dedup --timestamps`):

| Field | Holds |
|---|---|
| what | The mark in plain words (channel logo, programme name with its dot, corner bug), never its copy |
| x, y | The top-left corner of its box as percent of the frame width and height |
| w | Its width as percent of the frame width (the height follows from the mark) |
| opacity | Percent, from pixel samples of the mark against the ground beside it; 100 when solid |
| colour | Hex of its ink, from pixel samples |
| first, last | First and last frame (and seconds) where it shows, and any gaps; a slot shared in time by two marks lists both with their frames |
| layer | `screen` when the camera never moves it and flashes never hit it (the usual case); `rig` when it moves with the picture, said in the row |
| in, out | How it arrives and leaves (on from frame 0, draws on over n frames, fades), when it does |

Each mark also gets a `REASONS.md` row with trigger kind `always` (`notes-files.md` section 6). The Recipe notes get one line, read by `scripts/recipe.py` into the recipe field `fixed_marks`:
`Fixed marks: <what> x <x>% y <y>% w <w>%, opacity <n>%, <hex>, frames <first>-<last>, layer <screen or rig>; <the next mark> (or: none)`

## 12. Depth, 3D and camera

Owner decision, 2026-10-29 (lesson L12; scope: general, any video made with a reference). **Every aspect of a reference is measured and carried over: 3D, depth, camera, finishing and sound, not only its colours and text.** This is the one home of that principle; the other files point here. Trials failed because a reference's photo-card field with a push-through, its 3D flags, its speaker pushed back in depth and a camera moving in about half of its frames were never measured, so none of them reached the films.

**Why `analyze.py` is not enough for the camera.** Its camera track (section 2) fits one transform every half second and joins segments under 1 s into their neighbour, so a move of 21 to 80 frames (0.84 to 3.2 s at 25 fps) is averaged away or merged, and `moving_camera_shots` counts shots, not frames. Use it to find the passages; measure the moves with the finer method below.

| Item | How to detect | How to measure | Field |
|---|---|---|---|
| Camera moving share | Any passage where the whole picture scales, slides or turns (digital moves on one take count) | Every frame of the passage at 480 px wide (FFmpeg at the native rate into the scratch folder, or `frames.py --no-dedup --timestamps` at each frame time); a similarity transform fitted frame to frame the way `analyze.py` does (tracked corners, pyramidal optical flow, RANSAC), scales chained, and re-anchored by a direct check against a frame 1 to 2 s earlier, because a chain drifts (5 to 10 percent was measured). A frame moves when its change is above the section 2 thresholds divided by the fps. Share = moving frames over all frames. Each move: start and end frame (2 and 98 percent of its change), scale ratio, anchor (the point that stays: a face, the frame centre), and its ease: progress at 10, 25, 50 and 75 percent of its time passed to `nearest()` in `ice-motion/scripts/measured-eases.mjs` | `camera_moving_share` |
| Depth planes and parallax ratio | During a move, near and far things shift or scale by different amounts (the eye test of section 2); one plate zoomed digitally moves as one plane | The same per-frame fit restricted to a box on each plane (a near card, a mid layer, the background); count the planes with distinct rates; parallax ratio = the nearest plane's speed over the farthest's (illustration only: a near layer shrinking 23 percent while the back shrinks 12 percent over the same frames gives about 1.9). One plane: null. A person made a back plane (desaturated, dimmed and pulled back while another image comes forward) is a plane too: note it | `layers`, `parallax_ratio` |
| Push-through | A move during which layers grow past the frame edge and leave, so the camera passes through them | Count them; per push-through: start and end frame, scale ratio of the nearest plane, ease (as above) | `push_through` |
| 3D elements | The far edge shortens as a thing turns, shading changes with the turn, the layer order changes (a line passing behind then in front), cloth moves | Kind (`card_field`, `flag`, `globe`, `extruded_text`, `wrapped_text`, `cards_in_space`, `set`, `other:<word>`), turn range in degrees and frames, scale, duration, ease, and whether it is real 3D or flat layers at depth (2.5D) | `elements_3d` |
| Depth of field | One plane is soft while another is sharp; focus moves between them (a rack focus) | Blur sigma per plane box (section 9, "Seven numeric measures"), per plane step; a rack focus as that value over time | `dof` |
| Trigger in the speech | Each item above switches on somewhere | The words that switch it on, from the word-level transcript (`watching.md` section 5), with the time; in a passage with no speech, the beat, cut or action | `triggers` |

**Depth file schema** (reference and film): `{"camera_moving_share": <0..1, share of frames where the camera or plate moves>, "layers": <depth planes counted>, "parallax_ratio": <speed of the nearest plane over the farthest, or null>, "push_through": <count of camera moves that pass through planes>, "elements_3d": [<kinds: "card_field", "flag", "globe", "extruded_text", "wrapped_text", "cards_in_space", "set", "other:<word>">], "dof": {"present": true|false, "blur_px": <per plane step, or null>}, "triggers": [{"kind": "<one of the above or camera|dof>", "t": <s>, "words": "<the spoken words that switch it on>"}]}`. Reference: `ice/reference/<ref-id>/analysis/depth.json`, written by hand from these measures. Film: `<render>.depth.json` next to the render, written from the plan and the build, with `camera_moving_share` measured on the render when possible. A reference with no depth, 3D or camera movement still gets the file (share 0, layers 1, empty lists), so "none" is a measured value.

**Recorded and carried.** Every depth or 3D element kind gets a `REASONS.md` row (trigger kind, meaning, role, in and out). The Recipe notes get one line, read by `scripts/recipe.py` into the recipe field `depth` (with `depth.json` beside it when it exists):
`Depth: camera moving <share> of frames; <n> planes, parallax <ratio or none>; push-throughs <n>; 3D <kinds or none>; depth of field <yes, px per plane step, or no>; triggers <kind at t s on the words that switch it on; ...> (or: none)`
Each element is mapped to a shot of the new film with its build route (`shot-mapping.md` section 1, item 6; routes: `ice-motion/references/depth-and-3d.md`, "Build routes for depth and 3D"). The gate: `ice-qa/references/motion-density.md`, "Depth and camera against the reference".

## 13. Reel cut from a long episode

When the reference reel was cut from a longer episode, or the user supplies both, measure how the reel was made from it, beside the reel's own grammar. Method: word-level transcripts of both (`watching.md` section 5), each reel sentence aligned to the episode transcript by its words, and a frame check at every join.

| Measure | Holds |
|---|---|
| Hook | Its length in seconds and frames from the first frame, what it is (a question, a claim, a clip, a number), and whether it comes from the episode's opening or from later |
| Passages used | Each passage's in and out in the episode and in the reel, in reel order: kept in order or moved, and how much of each sentence was kept (trims land on word boundaries) |
| Placement | Where each passage sits in the reel, as a share of the reel's runtime, and its job (hook, set-up, evidence, turn, payoff, sign-off) |
| Payoff | Where the answer or the strongest line sits, as a share of the runtime, and whether the reel ends on it or on a sign-off |
| Dropped | What the episode holds that the reel leaves out, with the reason it reads as dropped |

Recorded as a `## Passages` table in `TIMELINE.md`: `| reel in-out s | episode in-out s | job | trimmed |`. The rules for cutting a new reel this way: `ice-edit/references/edit-types/news-reel.md`, section 5 ("From a long episode to a reel").
