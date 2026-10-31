# Genre playbook: logo sting

Measured, not collected: 15 logo stings and idents (15 brands: film studios, streamers, broadcasters, a console boot,
a car and a payment sound logo, an Arabic music app; 3 from Arabic channels) were measured with this plugin's own tools
on 2026-10-31, frame by frame. Every number below is the corpus median and range, with how many stings hold it. A
pattern in 60 percent or more of the stings is a convention; 30 to 59 percent is an option; under that it is not a
rule. Read this file with the film type file; the type file decides structure, truth (the official logo, untouched)
and deliverables, this file gives the genre's measured grammar and the fingerprint the render is checked against.

## Scope

- Film type that points here: `logo-sting`. Use it for a logo reveal, ident, bumper, channel intro or outro, studio
  or production logo, device boot screen or sound logo with its visual, rendered as video, 2 to 12 s (studio fanfares
  run up to about 25 s).
- Not for: a Lottie, web or app loader or a hover loop (the `ice-lottie` skill), the logo lockup at the end of a longer
  film (that film's genre file and `../openers-and-endings.md` section 6), a rebrand story of 30 s or more
  (`brand-film.md`).
- Precedence: the user's words, a reference the sting follows (its own measures win, `ice-remake`), and a chosen style
  outrank this file, through exemption rows lifting `genre:<key>` (the `ice-direction` skill, `references/treatment.md`
  section "Craft plan"). This file outranks the house defaults it names in "Rules this genre replaces". The truth rules
  of the type file (the official logo file, its proportions, never redrawn) are never outranked.

## Corpus

15 stings, 2.3 to 24.1 s (median 7.0 s), 14 at 16:9 and one at 4:3: 4 film studio or production logos, 4 streamer
stings, 4 broadcast idents (3 Arabic market channels, one by a recognised branding studio), a console boot, 2 sound
logos (car, payment) and an Arabic music app. Sources and why each was chosen are kept in the maintainers' research
folder (`research/genre-playbooks/logo-sting/corpus/SOURCES.md`, outside this repo). Two variants showed up; pick one
at 02 from the brief's length and use:

| Variant | Stings | What marks it |
|---|---|---|
| A. Mark sting | 8 (2.3 to 7.0 s, median 5.0) | the brand readable at 0.6 s (0 to 2.4), the logo locked at 2.9 s (0.6 to 4.1) after 2.0 s of build from its first visible part (0.4 to 4.1), held 1.3 s (1.0 to 2.9); 6 of 8 mix 2D and 3D, 6 of 8 on black; the sound peaks 0.19 s before the lock (2.6 s before to 0.35 s after) |
| B. Ident or studio fanfare | 7 (8.6 to 24.1 s, median 10.2) | a world first (a 3D scene, filmed footage, a long light build), the brand readable at 6.2 s (1.1 to 15.0), locked at 6.3 s (1.5 to 21.3), held 1.75 s (1.3 to 6.0); the music swells to its peak well before the lock (3.1 s before at the median) and resolves on it |

## Conventions (60 percent or more)

| Convention | Number (median, range) | Held | How it is measured |
|---|---|---|---|
| The logo holds after it locks, at least 1 s | final hold 1.67 s (1.04 to 6.04); 1.0 to 3.5 s in 14 of 15 | 15 of 15 at 1.0 s or more; 1.4 s or less only 6 of 15 | coding sheet `sting.final_hold_s` |
| The lock comes in the second half | lock at 57 percent of the runtime (10 to 88); 3.5 s (0.6 to 21.3) | 10 of 15 | coding sheet `sting.lock_s` |
| The brand reads early | first readable at 34 percent of the runtime (0 to 83); 2.3 s (0 to 15.0) | in the first half 11 of 15 | coding sheet `sting.first_readable_s` |
| A part of the mark from the first frames | first part of the mark at 0.17 s (0 to 8.0) | by 0.8 s 11 of 15 | coding sheet `sting.first_mark_s` |
| Two or more build modes in one sting | 2 modes (1 to 3) | 14 of 15 | coding sheet `sting.build_modes_all` |
| Depth: 3D, or 2D mixed with lit 3D parts | 3D 3, mixed 8, flat 2D 4 | 11 of 15 | coding sheet `sting.dimension` |
| The name follows the mark (stings with both) | the mark first, then the wordmark | 8 of 10 | coding sheet `sting.name_after_mark` |
| No tagline, URL or call to action | a tagline 2, a tagline and URL 1, a CTA card 1 | 11 of 15 | coding sheet `sting.tagline_or_url` |
| The logo centred at the lock | | 14 of 15 (one corner write-on at the end of a filmed ident) | coding sheet `end_card.logo_position` |
| The main move is never a fade from nothing | builds start from black with a real move (light, a camera, parts), from parts, a primitive, the previous logo, footage or a waveform | 14 of 15 | coding sheet `sting.build_mode`, `sting.from_what` |
| The lockup is not faded out | fade to black only in 3 of 15 (two studio fanfares that lead into a film, one broadcast sting) | 12 of 15 | coding sheet `sting.exit` |
| A sonic logo, always | a music sting resolving 9, a short melodic signature 2, one hit 2, a hum or tone 2 | 15 of 15 | coding sheet `sting.sonic_logo`; `sting.json` sound fields |
| The sound starts with the picture | sound start 0.29 s (0.03 to 2.02) | in the first 0.6 s 13 of 15 | `sting_measure.py` (research) or the render's waveform |
| The sound peaks at or before the lock, never after it | loudness peak 0.34 s before the lock (15.7 s before to 3.3 s after) | at or before the lock (within 0.15 s after) 11 of 15 | the render's loudness curve against the coded lock |
| The sound rings on through the hold, then a short silent tail | the sound ends 2.0 s after the lock (0.5 to 13.4); silent last 0.67 s (0.05 to 1.89) | rings 0.5 s or more 15 of 15; silent tail 0.3 s or more 11 of 15 | same |
| Sound sits on the moves | `move_onset_lift` 1.3 (0 to 3.0) | 1.2 or more in 9 of 13 with sound onsets | `genre_check.py measure` |
| Something new every 0.3 s while the logo builds | median gap between events before the lock 0.33 s (0.25 to 1.99) | 0.8 s or less 14 of 15 | `genre_check.py` events, body cut at the lock |
| No long dead stretch while it builds | longest gap before the lock 0.92 s (0.5 to 5.67) | 6.0 s or less 15 of 15; 3 s or less 13 of 15 | same |
| No flash over 3 per second | | 14 of 15 | the `ice-qa` skill's flash measure |

## Options (30 to 59 percent; the brief and the variant decide)

| Option | Held | Use when |
|---|---|---|
| End on the held logo (the last frame is the logo) | 7 of 15 | a standalone file, a channel ident, a sound logo, a boot screen |
| Exit after the hold: fade or cut to black, an animated exit, a reduction to a monogram, a cut to a CTA card | 8 of 15 (fade 3, animated out 2, cut 1, monogram 1, CTA 1) | the sting leads into a programme or film (studio and streamer logos), or the brand has a small mark for later use |
| Main build: reveal (light, a mask or a camera uncovers the finished mark) | 5 of 15 | premium, cinematic and broadcast marks |
| Main build: morph (a primitive, a waveform, blobs or the previous logo turns into the mark) | 5 of 15 | the mark has a shape another thing can become; sound logos and playful brands |
| Main build: draw-on (strokes write the mark) | 2 of 15 (one an Arabic calligraphic mark) | stroke and calligraphic marks |
| Locks on black or a dark gradient | 8 of 15 coded on black (light grounds 2, brand colour 1, a 3D scene 2, footage 2) | the brand guide does not set a ground |
| A camera move (push-in, pull-back, orbit, fly-through) | 6 of 15 | variant B, and A stings with a 3D mark |
| A light event (a glow rising, a flare) | 5 of 15 | dark grounds and 3D marks; the build move is the event otherwise |
| Starts on black for 0.1 s or more | 7 of 15 | a sting that plays before a programme |
| A hard cut inside the sting | 6 of 15 by the frame measure, 2 of them fast squashes or a scale-through that a viewer reads as one move (filmed idents and stings with a footage or macro opening) | variant B with footage; mark stings stay one continuous move |
| A lock at 60 to 85 percent of the runtime | 5 of 15 | |

## Measured and rejected

These ideas were tested on the corpus and did not hold; they are not rules for this genre. Do not add them back from
memory.

| Idea | Held | What the corpus does instead |
|---|---|---|
| A 2 to 8 s sting | 8 of 15 | mark stings 2.3 to 7 s, idents and studio fanfares 8.6 to 24 s; 2 to 12 s in 12 of 15 |
| 1.2 to 2.0 s of main motion | 2 of 15 | first mark to lock 2.7 s (0.4 to 20.8); 2.0 s in variant A, 6.3 s in variant B |
| End hold at most 1.4 s | 6 of 15 | 1.67 s at the median, 1.0 to 3.5 s in 14 of 15, up to 6.0 s on a boot ident |
| The final hit lands on the mark's settle | 2 of 15 coded on the lock; a top-3 hit within 0.15 s of the lock in 4 of 15 | the peak comes on or just before the lock (11 of 15), then the sound rings through the hold |
| The sound starts on or just before the first visual contact | 4 of 15 | it starts with the picture in the first 0.6 s (13 of 15), often before any part of the mark |
| A light event in every sting | 5 of 15 | the build move carries the sting; a light event is an option |
| The last 10 to 20 frames are always the logo | 7 of 15 | the held logo is the contract; 8 of 15 exit after the hold |
| Mixed to social -14 LUFS | 1 of 15 (median -19.9; archive uploads are re-encoded, so this is not a firm read) | keep the house loudness; this corpus cannot set it |
| A light sweep or glint as the main build | 0 of 15 (glints ride on top of another build) | reveal or morph carries it |
| A seamless loop | 0 of 15 | a sting plays once; loops belong to the `ice-lottie` skill |

## Coding sheet

The reviewer fills the shared sheet of every genre (text, hero, transitions, camera, end card, brand presence), then
the sting block below, from a dense strip of the render (12 frames per second; 6 for a sting over 10 s) and its
waveform. `end_card.start_s` is the lock (the first frame of the finished logo as it holds), so the event gaps of the
fingerprint stop there; `end_card.length_s` is the final hold. For `end_card.logo_position`, a logo is the brand's mark or its wordmark in the brand's own logotype; a line of plain text set in the film's type (a tagline, a credit, a product name), even centred, is not a logo: code `none` and put the line in `tagline`. A field that cannot be read is `null` with a note. Times
in seconds.

| Field | What to write |
|---|---|
| `sting.build_mode`, `sting.build_modes_all` | the main move: `draw-on`, `assemble`, `reveal`, `morph`, `light-sweep`, `scale-settle`, `live-action-to-logo`, `other`; then every mode seen, the main one first |
| `sting.from_what` | what the logo comes from: nothing, black, light, a primitive, parts, footage, the previous logo, a waveform, other |
| `sting.first_mark_s`, `sting.first_readable_s` | the first frame with any part of the final mark; the first frame a viewer could name the brand |
| `sting.lock_s`, `sting.final_hold_s` | the first frame of the finished logo as it holds; how long it holds still or near still (a glint or a slow gradient over it still counts) |
| `sting.exit` | `none`, `fade-to-black`, `cut-to-black`, `animated-out`, `reduce-to-monogram`, `cut-to-cta` |
| `sting.wordmark`, `sting.name_after_mark`, `sting.tagline_or_url` | mark and name together, mark only or wordmark only; the name after the mark (true, false, null with one of them); text beyond the logo |
| `sting.background`, `sting.dimension`, `sting.camera`, `sting.light_event`, `sting.particles_or_streaks`, `sting.loop` | the ground at the lock; 2D, 3D or mixed; the camera move; the light event; particles or streaks; a seamless loop |
| `sting.sonic_logo`, `sting.sound_vs_lock` | the sound's job (notes, hit, hum, voice, music sting, none); where its peak sits against the lock (before, on within 0.15 s, after) |
| `sting.arabic_text` | Arabic letters in the mark, the name or the tagline; they arrive by whole word (the `ice-arabic` skill) |

## Fingerprint

`genre_check.py check --genre logo-sting --video <render> --coding ice/review/genre-coding.json` (the `ice-qa` skill)
runs at gate D on every draft of a sting that follows no reference, and its numbers go into the delivery report. A red
key is fixed in the sting (a busier build, a hold of 1 to 3 s, the logo centred), never by padding with idle motion; a
key the user, a reference or the chosen style sets differently is lifted by its exemption row and passed as
`--exempt <key>=<source>`. Keys marked `-` are reported for the critic, not gated.

Calibration: only keys that 14 or more of the 15 corpus stings hold are gated, at bounds that cover the corpus with a
margin (no corpus sting sits in the yellow band near an edge), and one gated key may miss (`misses_allowed 1`, printed yellow with a sentence in the delivery report). On its own corpus the
line passes 15 of 15: 13 green, the console boot yellow (a slow glow-up, median gap 2.0 s before its lock) and the
filmed ident yellow (its logo writes on in a corner). The event gaps are read before the lock only (`end_card.start_s`),
so the held logo is judged by `sting_hold_s`, not as a gap; its ceiling of 6.1 s is the end-hold gate (the `ice-qa` skill,
`references/motion-density.md`, gate G3). `events_per_s`, `cuts_per_10s` and the `sting_` keys other
than the hold describe the variant and are reported.

Genre fingerprint: median_event_gap_s <=0.9; max_event_gap_s <=6.5; end_logo center; sting_hold_s >=0.9; misses_allowed 1; events_per_s -; hook_events_3s -; cuts_per_10s -; sfx_per_min -; move_onset_lift -; sting_build -; sting_exit -; sting_readable_s -; sting_lock_s -; sting_dimension -; sting_sonic -.

## Rules this genre replaces

Each general rule stays the house default for every other film; its own file names this genre as the exception.

| General rule | Where | In this genre |
|---|---|---|
| A 2 to 8 s sting | `film-types/logo-sting.md` Fit; `../film-setup.md` section 1 | 2 to 12 s; studio fanfares up to about 25 s (variant B) |
| 1.2 to 2.0 s of main motion | `film-types/logo-sting.md` Rhythm ranges | about 2 s from the first part to the lock in a mark sting, about 6 s in an ident; the 1.2 to 2 s splash band stays for app and web splashes (ice-lottie) |
| The final hit lands on the settle; sound starts just before the visual contact | `film-types/logo-sting.md` Timing master; `../logo-sting-pipeline.md` section 1 | the peak lands on or up to 0.5 s before the lock, the sound starts with the picture and rings through the hold |
| The last 10 to 20 frames are the static logo, nothing moves | `film-types/logo-sting.md` Camera policy during holds; `../openers-and-endings.md` section 6 | the held frames are the exact static logo; the sting ends on them or exits after them |
| End hold at most 1.4 s | the `ice-qa` skill, `references/motion-density.md` section 4 (gate G3 row); the `ice-motion` skill, `references/holds-and-stillness.md` section 3 | 1.0 to 6.1 s (median 1.7) |
| One light event as a floor | `film-types/logo-sting.md` Richness floor | an option (5 of 15); the build move is the event |
