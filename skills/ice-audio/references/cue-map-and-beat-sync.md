# Cue map, beat grid and sync

Read when planning timing for any film with sound: before animating (the cue map comes first), when measuring a music file, when landing cuts on beats, and when the music must end on the end card. Sources: lemo-opuscar, mg-styles-15, Barty-Bart sound-effects, herk-edit-kit motion-showreel, anidoodle, motionmaxxing (Apache-2.0), product-launch-motion, claude-motion-design, hyperframes skills and docs (Apache-2.0), huashu-art-motion, video-production-studio, explainroo, reelmimic, majed video-ad-editor (all MIT unless noted), plus ideas restated from commercial-motion-design, Mamdouh and noncommercial sources.

## 1. Pick the clock (one per film)

| Mode | Use for | The clock |
|---|---|---|
| Voice-led | explainers, product story, talking-head ad, UI walkthrough with narration, long-form | The voice. "Once a video has a voice, the voice is the clock"; the narration never waits for the visuals. Cues name words, not seconds. |
| Music-led | kinetic type without a voiceover at any length (measured: 9 of 11 films, 15 to 76 s, `ice-film` skill, `references/genres/kinetic-type.md`), logo sting, hype promo, showreel, music video, social short without voice | The beat grid of the chosen or composed music. Storyboard timings in beats, not seconds. |
| Hybrid | one VO line over a music bed (hook, turn or CTA only) | The voice for spoken beats; the grid for everything else. Voice and music grids meet only at the payoff. |
| No voice, no beat (calm, rubato, ambient music) | art film, calm brand film | Phrases and energy. Every reveal is cued to what motivates it: a measured SFX transient, reading time, or the on-screen action. Never force a cut onto every measured beat. |

A film that tries to be voice-led and music-led at once cuts to nothing. Choose one and write it in the cue sheet.

## 2. The cue sheet (single source of truth)

Write it before animating. The picture locks to it, the score and SFX read it, captions and checks read it. Never retime one consumer without the others. Store it as `ice/plan/cue-sheet.json`.

Required fields:
- `fps`, `duration`, `mode` (voice-led, music-led, hybrid, free).
- `music`: source (file path or generator recipe), license status, `bpm`, `beats_per_bar`, `first_downbeat` (seconds in the film), `offset_in_track` (seconds), `drop`, `outro`, sections.
- `voice`: one entry per line with text, file, start, end and word timings (from voiceover.md).
- `events`: one row per moment with `t` (film seconds, from the picture's own export when the engine can export it), `frame` = round(t x fps), `kind`, `what` (the visible cause), `word` (the word it lands on, voice-led films), `sound` (SFX name or none and why), `gain`, `pan` (screen x mapped to about +/-0.6), `phase` (anticipation, travel, contact, recovery).
- Declared silences (`quiet`: start, end, reason).

Prefer exporting event times from the composition itself (the engine writes events with time, kind, pan, strength) over retyping times. Write in-shot landings as beat numbers or word references and convert to frames only right before render. If the voice changes and the frames no longer match, refuse to render rather than drifting silently.

Put a short beat sheet as a comment at the top of the composition script too: one row per moment with time, what happens, which sound, and the word it carries.

## 3. Measure the music (never trust a grid you did not check)

1. Use one analyzer and trust it; do not re-measure beats by ear or with a second tool. Analyze the actual final file.
2. Estimate tempo and beats. Check half and double time. Warn outside 80 to 150 BPM. Use the measured BPM (129, not the nominal 128).
3. Correct the phase on the kick band. Full-band trackers can lock onto off-beat hats and put every splice half a beat late. Low-pass the music below 120 Hz, detect onsets there, take the median offset of the kicks from the grid lines, and shift the whole grid by it. After the fix the kick phase sits within about 25 ms of 0. Plot the first 4 bars of the low band against the grid lines and save the plot as `ice/audio/beatgrid.png` (it is the beat map artifact of a music-led stage 01); show it on the review card in step mode and attach it to the delivery note in auto mode.
4. A grid is reliable only when the music is genuinely rhythmic. Rolls near zero, mostly sparse phases and a low onset rate mean the grid is a metronome the tracker invented: use phrases, energy changes, hard stops and silences instead. A track without a steady beat gets no grid.
5. Find the drop by energy, never by an auto grid: per-bar low-band and full-band energy, then 20 to 50 ms windows around the jump. A drop is a jump of about 10 dB or more in the low band (one tool uses: next bar 4.5 dB or more louder). Map riser, drop, break and return.
6. Store integer frames as round(seconds x fps).

Illustration only (adapt paths; verify with the plot):

```python
# beat grid with kick-band phase correction (librosa and scipy, pinned in scripts/requirements.txt)
import sys, numpy as np, librosa, scipy.signal as ss
y, sr = librosa.load(sys.argv[1], sr=22050, mono=True)
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units='time')
low = ss.sosfiltfilt(ss.butter(4, 120, 'low', fs=sr, output='sos'), y)
kicks = librosa.onset.onset_detect(y=low, sr=sr, units='time')
offs = [k - beats[np.argmin(np.abs(beats - k))] for k in kicks] if len(beats) else []
shift = float(np.median(offs)) if offs else 0.0
print({'bpm': float(np.atleast_1d(tempo)[0]), 'first_beat': float(beats[0] + shift) if len(beats) else None,
       'phase_shift_s': shift, 'kick_count': len(kicks)})
```

## 4. Grid arithmetic

- Beat length = 60 / BPM seconds; a bar = beats_per_bar x 60 / BPM; at 30 fps a beat is 1800 / BPM frames.
- Prefer a tempo whose beat is whole frames: at 30 fps 90 BPM = 20 f, 100 = 18 f, 120 = 15 f, 150 = 12 f, 180 = 10 f; at 24 fps 120 BPM = 12 f, 180 = 8 f. At 120 BPM, cuts fall on x.0 and x.5 s; a sixteenth is 125 ms.
- When the picture comes first: make each segment an integer number of beats or eighths and tweak the tempo per segment (one film used 86 to 104 BPM) so every boundary hits a downbeat; listeners do not notice tempo differences of about +/-8 % but do notice instrument changes off the downbeat. With opt-in music made by code, `sync.fit_bpm` picks the tempo whose 8th-note grid best fits the hits.
- Montage shot lengths are integer frame counts so nothing drifts.

## 5. Sync tolerances and lead times

| What | Rule |
|---|---|
| Primary visual contact (hard cut, slam, hit) | On the cue frame: within 2 frames or 40 ms, whichever is stricter. Hard hits are 0 ms; easing a hit kills it. |
| Secondary accents | Within 80 ms. |
| Sound before or after picture | Prefer picture early rather than late, at most 1 frame early. Broadcast tolerance (EBU R37): sound leading at most 40 ms, lagging at most 60 ms. A sound after its picture reads as lag, which viewers always notice. |
| Anticipated moves | Start about 40 to 190 ms (about 0.05 s typical) before the beat so they complete on it; reactive entrances fire 0 to 45 ms after. Never start a slow ease on the beat. |
| Text in voice-led films | Land text 0 to 2 frames before its word's start; up to 5 frames (0.16 s) for a reveal that must be complete when spoken; builds end at the word's start. Numbers settle when spoken (count start = spoken time minus count duration). |
| Transitions in voice-led films | Start 3 to 6 frames before the line ends; cut in the breath between sentences, never across meaningful syllables. |
| Beat-cut edits | The beat frame must show a visible full-frame change; a punch that moves only the new layer delays the felt hit by 0.1 to 0.17 s. |
| Reveal point | Segment start = bar line minus (reveal point x transition duration); perceived arrival is at about 90 % of the displacement. |
| News promo (news reel: edit type `news-reel`, style family `family-broadcast-news.md`) | The words are the clock, never a beat grid: the measured beds have no usable pulse (pulse clarity 0.07 to 0.19 in the Arabic packages; one horizontal explainer bed about 0.30 at a half-time near 101 BPM), so cuts, graphics and their sounds follow the word timings and the moves. Each sound sits against its visual move by the frame offsets of `sfx.md` section 3b (for example a sub boom +1 to +4 f after an edit, a riser ending 1 to 2 f before a cut, a glint on the settle frame), which replace the generic lead times of this table for that type. Only a voiceless archive montage is cut to hits (a hit every about 0.4 s, -2 to +5 f from each cut). Flashes and transition sounds sit on phrase boundaries or in breaths. |

Detailed motion timing (eases, holds, carry) belongs to the ice-motion skill; this table only fixes where the sound and the picture meet.

## 6. Cutting on the grid (density)

- Cut on downbeats, not every beat. Big changes on beats, typography on 1/8 or 1/16 notes in music-led films. One action, one sound, one cut, but leave time to see.
- Strong beats get real transitions; off-beat cuts get no transition. Never the same transition family back to back.
- Dense music regions carry rapid state progress; sparse regions carry reading and typing; strong onsets carry decisive contact; the ending cadence reduces density. Use musical rests; do not fill every subdivision.
- A camera move at most once per phrase, never per beat (a news reel follows `ice-motion/references/camera.md` "Digital camera on one take (news reel)" instead); a dense flip or strobe system runs at most 2 to 3 s; in safe mode no strobe and at most 3 flashes per second (WCAG 2.3.1), as the strobe safe mode below sets out.

**Strobe safe mode for archive bursts and flashes (the photosensitivity home, every film type).** Safe mode is the default for every film, news reels and remakes included: no more than 3 flashes in any 1 s window, general or red (WCAG 2.3.1; one flash is an on and an off: a luminance swing of at least 10 % of full scale over more than a quarter of the frame, or any change into or out of saturated red), and no strobe or flash run in the first 3 s. Measured broadcast packages go over it (a frame interleave at 12.5 Hz for 5 to 9 f, a red frame every 3rd frame at 8.3 Hz over 25 f, a mono strobe of 8 f with 4 or more large luma swings), so safe mode replaces them, at 25 fps:
1. A per-frame red interleave in an archive burst: one 2 f (0.08 s) red multiply frame per clip, at least 9 f (0.36 s) apart (2.8 Hz).
2. Red or crimson first frames on montage cuts: spaced at least 9 f apart; a cut that comes sooner gets no red frame.
3. A mono strobe: one 2 f invert, then a 6 f (0.24 s) decay.
4. White flashes: at most 3 in any 1 s window, each on a phrase boundary (`ice-motion/references/cut-catalog.md` "Broadcast transitions").
5. The sounds follow the replacement: one hit per remaining flash (`sfx.md` section 3b).

Faithful mode (the reference's own strobe, frame for frame) only when the user asks for it in their own words; the request is logged in `ice/DIRECTION.md`. The delivery note states the mode in one line either way (safe mode with what it replaced, or faithful mode at the user's request with the flash count per second it reaches).
The flashes per 1 s window are counted on the render by `craft_gate.py build` (the `ice-qa` skill's scripts).
- One pre-drop gap (music ducked for half a beat, or dropped 8 to 15 dB or cut out for 0.2 to 0.5 s) may come before the main hit; the first sound after a silence should be one of the most important in the film.
- Do not land every sound change on a cut: when about 60 % of cuts carried exact sound changes the edit sounded metronomic. Pros land about a third of cuts on an audible hit; one reference analysis found about 70 % of cuts within 40 ms of a hit in a music-led edit. Measure the share and report it.
- Showreel pacing illustration (15 s at about 129 BPM, 32 beats): roughly 75 % development, 13 % flurry, 12 % resolve.
- Reject a pre-CTA stretch with no visible change longer than 0.75 s unless a musical rest and a narrative reason are written in the cue sheet.

## 7. Landing the music on the end card (cut from the end)

1. Find the track's own ending (final hit or button plus ring-out). Measure it; do not trust the title.
2. Back-time: offset = end_card_cut_time minus final_hit_time_in_track. Start the track at that offset so the film opens mid-track and the final hit lands on the end-card cut to the frame.
3. Then snap the picture's other cuts to that grid. If the final hit is an off-beat push, put it on the cut anyway; other cuts then sit on off-beats, still on the 8th-note grid.
4. For a drop on the product's big moment with a fixed song start: start = drop_in_song minus drop_in_film, starting about 3 ms before a bar's kick onset. If both the drop and the ending must land, prefer moving picture; otherwise use one bar-line splice (music-choice-and-licensing.md section 4).
5. If you cannot retime the animation, move where the music starts: search offsets and pick the one with the smallest cut-to-beat error. Report the error per cut in ms.
6. The final chord or tail rings to the last frame; the last voice line ends before the end card's final second.
7. With a library track, back-time it so its own ending lands on the end card (music-choice-and-licensing.md section 4; `scripts/preview_options.py --align end` lays the options that way). Only with an opt-in code score (`ice-audio/SKILL.md` core rule 7), pass `outro` (the end-card time) to the recipe so the button lands there.

## 8. Audio-reactive picture

- Never analyze audio in real time inside the render loop: extract per-frame data offline once (FFT bands, RMS, onsets) to JSON, inline or loaded synchronously, and read it deterministically by frame.
- Drive one or two visual parameters from beat, onset, envelope, phrase or silence, never everything. Bass to scale, treble to glow or contrast, amplitude to opacity, mids to shape.
- Text and logos stay subtle (3 to 6 % scale, at most about 30 % glow); backgrounds can swing 10 to 30 %. Skip audio reactivity for calm and tutorial pacing.
- Banned decoration: equalizer bars, spectrum analyzers, waveform displays, musical-note clip art, rainbow cycling, strobing white on beats, pulsing orbs (ice-qa slop scan).
- Engine-specific hooks (per-frame sampling calls, beat commands) live in the ice-engines skill.
