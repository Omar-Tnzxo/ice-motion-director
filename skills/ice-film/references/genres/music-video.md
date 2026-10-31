# Genre playbook: music video

Measured, not collected: 14 official music videos made with motion graphics or animation (lyric videos, animated
music videos and visualizers from the artists' and labels' own channels) were measured with this plugin's own tools on
2026-10-31, plus a beat, bar and section measure built for this genre and checked on a synthetic beat-cut video. Every
number below is the corpus median and range, with how many films hold it. A pattern in 60 percent or more of the films
is a convention; 30 to 59 percent is an option; under that it is not a rule. Read this file with the film type file;
the type file decides structure, truth and deliverables, this file gives the genre's measured grammar and the
fingerprint the render is checked against.

## Scope

- Film type that points here: `music-video`. Use it for a picture made for a whole song, 1 to 4 minutes: an official
  lyric video, an animated music video, a visualizer or an audio-reactive piece.
- Not for: live-action performance of a band or singer (an edit type, not a film from scratch), a 15 to 40 s
  type-led promo cut to music (`kinetic-type.md`), a hype teaser (`hype-promo.md`), a social short cut to a trending
  sound (`social-short.md`), a logo sting.
- Precedence: the user's words, a reference the film follows (its own measures win, `ice-remake`), and a chosen style
  outrank this file, through exemption rows lifting `genre:<key>` (the `ice-direction` skill, `references/treatment.md`
  section "Craft plan"). This file outranks the house defaults it names in "Rules this genre replaces". The flash
  safety limit is never outranked (section "Flashes and safety").

## Corpus

14 films, 117 to 241 s (median 219 s), all 16:9; 4 from the Arabic market (Egyptian pop and rap, a Palestinian
Chilean singer), the rest pop, rock, dance, reggaeton and a film studio's soundtrack, 2015 to 2026. Sources and why
each was chosen are kept in the maintainers' research folder (`research/genre-playbooks/music-video/corpus/SOURCES.md`,
outside this repo). Two families showed up; pick the variant at 02 and log it in `ice/DIRECTION.md`:

| Family and variant | Films | What marks it |
|---|---|---|
| Built picture: lyric-type | 4 | the words are the picture: lines set as images (2 to 10 type styles), words arriving with the singing, scenes changing with the lines |
| Built picture: animated-story | 4 | drawn, graphic or 3D scenes act the song; lyric lines in 2 of 4 |
| Built picture: abstract visualizer | 1 | audio-reactive texture cut hard |
| Held picture: lyric-over-loop | 3 | lyric lines over one held artist photo or cover art; no cuts; the most common Arabic official format (2 of the 3) |
| Held picture: loop visualizer | 2 | one seamless loop (6 to 13 s) of real art or footage, no lines |

| Measure | Built picture (9) | Held picture (5) |
|---|---|---|
| Visual events per s | 2.29 (1.21 to 2.95) | 0.35 (0.02 to 0.94) |
| Median gap between visual events | 0.33 s (0.25 to 0.50) | 2.5 s (0.33 to 27.8) |
| Longest gap without an event | 3.3 s (1.7 to 12.3) | 16 s (3.8 to 73.5) |
| Whole-frame change (pixel scene) | 1.08 s (0.92 to 1.25) | 80 s (4 to 153) |
| Edits per 10 s | 4.0 (0.3 to 5.1) | 0 |
| Visual events in the first 3 s | 7 (1 to 12) | 1 (0 to 3) |
| Main colours in the film | 5 (1 to 8) | 1 (1 to 3) |

## Conventions (60 percent or more)

| Convention | Number (median, range) | Held | How it is measured |
|---|---|---|---|
| The film runs the whole song | 219 s (117 to 241) | 13 of 14 within 2 to 4 min; 14 of 14 the full track | duration |
| A steady beat under the picture | pulse 4.3 (1.9 to 5.0); 107 BPM (89 to 136) | 14 of 14 | beat analyzer |
| The picture follows the sung words and the phrase, not the beat grid | cuts on the beat at chance (lift 0.95, 0.65 to 1.28); on the downbeat at chance | 8 of 8 films with cuts | cut times against the beat grid and chance |
| Lyric lines on screen in lyric videos and half the animated ones | | 9 of 14 | coding sheet `mv.lyrics.on_screen` |
| Sung words readable for most of the singing | 0.95 of the singing (0.8 to 0.95) | 5 of 5 coded | coding sheet `mv.lyrics.sung_share_with_lines` |
| Short lines | 3 words per line (2 to 4) | 9 of 9 at 4 or fewer | coding sheet `mv.lyrics.words_per_line_median` |
| A line holds at least one beat | 1.0 s (0.8 to 2.3) | 9 of 9 | coding sheet `mv.lyrics.line_hold_median_s` |
| One or two lines at a time | 2 typical (1 to 2), up to 4 | 9 of 9 at 2 or fewer typical | coding sheet `mv.lyrics.lines_on_screen_typical` |
| Words arrive with the singing | word by word | 6 of 9 (a whole line near its first sung word 3 of 9) | coding sheet `mv.lyrics.timing_by_eye`, 12 fps strips |
| A title card opens the video | 5.75 s (0 to 15) | 10 of 14 | coding sheet `mv.title_card` |
| The chorus repeats and keeps its treatment | 3 passes (2 to 4); same or partly same | repeats 12 of 14; treatment 11 of 12 | coding sheet `mv.chorus` |
| Something changes on screen at most section starts (palette, setting, type style) | | 9 of 14; palette or setting at a chorus start 9 of 14 | coding sheet `mv.sections` |
| No spectrum bars or waveform display | | 13 of 14 | coding sheet `mv.audio_reactive` |
| Built picture: something new about every third of a second | median gap 0.33 s; 2.3 events per s | 9 of 9 built | `genre_check.py measure` events |
| Built picture: the whole frame changes about every second | 1.08 s (0.92 to 1.25) | 9 of 9 built | `genre_check.py` scene changes |
| The close is short | end hold 2.05 s (0 to 24.9) | 3 s or less 11 of 14 | coding sheet `mv.ending.final_hold_s` |

## Options (30 to 59 percent; the variant and the song decide)

| Option | Held | Use when |
|---|---|---|
| A later chorus escalates (bigger, richer, more colour or more type) | 7 of 12 | built picture; the song's last chorus is its peak |
| The artist's likeness (photo, drawing or footage) | 8 of 14 | the artist supplies it; held-picture Arabic lyric videos use a photo |
| The picture's density climbs with the song's loudness | coders 5 of 14 (partly 5); pixels 4 of 14 | a song with a clear build and drop |
| Camera faster in the chorus than the verse | 5 of 14 | built picture with a virtual camera |
| Hook lines set bigger than verse lines | 5 of 9 with lines | the hook is a short title phrase |
| More than three type styles | 5 of 9 with lines (median 4, up to 10) | lyric-type: each line set as its own image |
| Some audio-reactive element (light, scale, a texture) | 5 of 14 | visualizers; a pulse on one or two parameters (`ice-audio` cue-map section 8) |
| A logo or credits card closes the video | 6 of 14 (fade-out 4, cut to black 2, held 2) | a label or film identity to show |
| Cuts that land a fixed few frames before a music hit | 3 of 8 (hit 0.06 to 0.21 s after the cut) | a drum-led song where the hits are the phrase |

## Measured and rejected

House rules that were measured on this genre and did not hold. They stay house defaults for other film types; for this
genre they are replaced by the numbers above. Do not add them back from memory.

| Rule | Measured |
|---|---|
| Cuts on beats | 0 of 8 at a beat lift of 1.5; lift median 0.95, chance level (a synthetic beat-cut video reads 2.94) |
| Primary cuts within 2 frames of a beat | 0 of 8 have half their cuts within 50 ms of a beat (median 0.18, chance 0.21) |
| Cut on downbeats, not every beat | 0 of 8; of the cuts that fall on a beat, 0.24 are on beat 1 (chance 0.25); bar lock 0 of 8 |
| Typography on 1/8 or 1/16 notes | 1 of 13 above chance on the half-beat grid |
| Effect intensity follows section energy | 4 of 14 by pixels (loudness and picture activity correlation median 0.12); an option, not a rule |
| Verse slow, chorus faster camera | 5 of 14 |
| One lyric line per scene | 4 of 9 show one line typically; 5 of 9 two |
| Up to three type voices | 4 of 9; lyric-type films use 4 to 10 |
| Big visual events once per beat (0.66 to 0.83 s) | 2 of 14; built films run 2.3 events per s |
| End hold at most 1.4 s | 5 of 14; median 2.05 s |
| Longest still 0.5 s outside declared rests | 0 of 14; built films 1.7 to 12.3 s |
| The ending forms a musical landing or a loop | 0 of 14 coded so; the picture closes with the song's own end |
| Social -14 LUFS | 3 of 14; the released masters sit at -8.45 LUFS (median) |
| Lyric line 0 to 2 frames before the sung word | not measurable: recognised word times on singing are 0.1 to 0.3 s loose; judged by eye on 12 fps strips instead |

## Flashes and safety

6 of 14 corpus films go over 3 flashes per second (up to 17), from colour pops and dark and bright cuts on hits. Ice
does not copy them: the strobe safe mode stays absolute (`ice-audio` `references/cue-map-and-beat-sync.md` section 6).
At the built pace, carry the hits with colour holds, pushes, scale pops and type swaps between frames of similar
brightness, plan the brightness order on the storyboard, and check flashes on the animatic (`craft_gate.py build`).

## Rules this genre replaces

Each general rule stays the house default for every other film; its own file names this genre as the exception.

| General rule | Where | In this genre |
|---|---|---|
| Primary visual contact within 2 frames of the cue; cut on downbeats; typography on 1/8 notes | `ice-audio/references/cue-map-and-beat-sync.md` sections 5 and 6 | cues are the sung words and the phrase; a beat-locked cut is a house choice, never a fail |
| Cuts on the beat grid | `ice-qa/references/motion-density.md` section 3 | the picture follows the sung words and phrases |
| End hold 1.4 s | `ice-qa/references/motion-density.md` section 6 table | 3.0 s (measured median 2.05, 11 of 14 at 3 s or less) |
| Big events every 0.66 to 0.83 s | `ice-motion/references/anti-slideshow-and-density.md` Kinetic density row | built picture: a new event every 0.33 s, the frame changing about every second |
| Up to three type voices | `ice-direction/references/type-pairing.md` section 4 | lyric-type videos set lines in 4 or more styles when each line is an image |
| Social -14 LUFS | `ice-audio/SKILL.md` loudness table | the user's master as it is (true peak fixed); platforms normalise |

## Coding sheet

What pixels cannot read is coded by a fresh reviewer (never the builder) from 12 fps strips of the render
(`ice-remake/scripts/clip_strip.py`), into `ice/review/genre-coding.json`, with the same fields the corpus was coded
with: the shared fields of `genres/ui-motion.md` "Coding sheet" (`text`, `transitions`, `end_card`, `scenes`, `hero`
and `interaction` filled honestly as none), plus one `mv` block. The reviewer reads the cue sheet's sections and the
sung line times, never the lyric text of someone else's song.

- `variant`: `lyric-type`, `lyric-over-loop`, `animated-story` or `visualizer`; `title_card` (present, start, length).
- `lyrics`: `on_screen`, `sung_share_with_lines` (share of the singing with its words readable),
  `lines_on_screen_typical` and `_max`, `unit` (word, line, couplet, block), `timing_by_eye` (word-timed, line-timed,
  loose, none), `words_per_line_median`, `line_hold_median_s` (median time a line stays fully readable), `position`,
  `hook_bigger`, `styles_count`, `rtl`.
- `sections`: one row per song section with `start`, `end`, `label` (intro, verse, pre-chorus, chorus, post-chorus,
  bridge, drop, instrumental, outro) and `change_at_start` (palette, setting, type-style, camera, density,
  character-action, none).
- `chorus`: `count`, `same_treatment` (same, partly, different), `escalates`, `motif`.
- `energy_follows_song_by_eye`, `busiest_section`, `audio_reactive` (`level`, `what`, `spectrum_or_waveform_shown`),
  `artist.likeness`, `palette_count`, `camera_by_section`, `loop` (`picture_loops`, `loop_len_s`), `ending` (`kind`,
  `final_hold_s`), `flash_or_strobe_seen`.

## Fingerprint

`genre_check.py check --genre music-video --video <render> --coding ice/review/genre-coding.json` (the `ice-qa` skill)
runs at gate D on every draft of a film of this genre that follows no reference, and its numbers go into the delivery
report. A red key is fixed in the film (shorter lyric lines, lines held a beat or more, fewer lines at once, the
chorus treatment kept, no waveform display, a new event about every third of a second in a built picture), never by
padding with idle motion; a key the user, a reference or the chosen style sets differently is lifted by its exemption
row and passed as `--exempt <key>=<source>`. A held-picture film (lyric over a held or looped picture, or a loop
visualizer) lists exemption rows for `events_per_s`, `median_event_gap_s`, `max_event_gap_s` and `scene_median_s`
with "variant held picture" as the source. The lyric keys read "no lines" and pass when the film shows no lyric lines.
Keys marked `-` are reported for the critic, not gated. No beat key is gated: the measured genre does not cut on the
beat grid.

Calibration: only keys that 13 or more of the 14 corpus films hold (the pace keys on the 9 built films) are gated, at
bounds that cover the corpus, and one gated key may miss (`misses_allowed 1`, printed yellow with a sentence in the
delivery report). On its own corpus the line passes 14 of 14 films: 10 green and 4 yellow (one animated story whose
chorus treatments differ, one Arabic lyric video with a waveform bar, each the allowed miss; one lyric video near the
event bounds).

Genre fingerprint: events_per_s >=1.1; median_event_gap_s <=0.55; max_event_gap_s <=15; scene_median_s 0.8-1.5; mv_lines_typical <=3; mv_words_per_line <=5; mv_line_hold_s >=0.7; mv_chorus_repeat same|partly; mv_waveform no; misses_allowed 1; hook_events_3s -; cuts_per_10s -; hard_cut_share -; move_onset_lift -; mv_variant -; mv_timing -; mv_end_hold_s -.

Sources: measured on the corpus above with `ice-audio/scripts/sound_map.py`, `ice-qa/scripts/film_gate.py` and
`genre_check.py`, `ice-remake/scripts/clip_strip.py`, and the maintainers' beat, section and lyric timing tools
(`research/genre-playbooks/tools/mv_measure.py`, outside this repo); coded with the coding sheet above.
