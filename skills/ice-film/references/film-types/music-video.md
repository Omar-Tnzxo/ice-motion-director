# Film type: music video

Fields in order: Fit, Purpose, Structure options, Rhythm ranges, Timing master, Transition policy, Camera policy during holds, Sound policy, Text density, Truth and content, Richness floor, QA thresholds, Deliverables, Pointers.

Stage order: 01 02 03 [04 05] 06 [07 08a] 08b 09 10
Leads with: the music. 01 takes the user's track, runs its sync license check and measures the beat map (`ice-audio`); 03 holds the lyric or on-screen lines (only titles and credits when there are none); 04 boards on the beat grid; 08 mixes the given track at its normal place.

## Fit

A film where the track is the spine: lyric video, beat-cut promo, audio-reactive visual, song storyboard, event or nightlife promo, montage from clips set to music.

## Purpose

One idea for the whole video, carried by the music's structure. Act the lyric, do not write it.

## Structure options

| Option | Skeleton and numbers |
|---|---|
| Song sections | intro, verse, chorus, bridge, outro; chapters equal song sections, each with one setting and a small palette; a recurring set and an escalating motif; a cast table with arcs. Measured (`../genres/music-video.md`): something changes on screen at most section starts (palette, setting or type style, 9 of 14), the chorus keeps its treatment each time (11 of 12), a later chorus escalates in 7 of 12 (an option) |
| Beat-cut music video | up to a full song; effect intensity follows section energy (intro low, chorus full); cuts on beats; never a slideshow or a generic visualizer. The beat lock and the energy climb are Ice house choices for a film cut to its own beat map: the measured genre cuts on the beat at chance (8 of 8) and follows the sung words and phrases (`../genres/music-video.md`, Measured and rejected), so they never fail a film |
| Lyric as character | 50 s to a full song; one or two lyric lines at a time (measured: 2 typical in 5 of 9, 1 in 4 of 9), 2 to 4 words per line, each line held at least one beat (0.8 to 2.3 s), words arriving with the singing; huge words on the hook (5 of 9, an option); supplied lyrics are authoritative (`../genres/music-video.md`) |
| Audio-reactive hero | 15-40 s; a beat map of kicks, snares and hats drives light, detail and lens |
| Frame skeleton from the track | cut frames at hard stops, surges and drops, roll edges, onset deserts and big energy jumps (expect about 1-6 frames); pacing either beat-cut or phrase-flow; frames tile the track exactly |
| Montage | score clips by motion, steadiness and sharpness; strongest first; vary lengths (illustration only: 1.0, 0.82, 1.24, 0.94 times the base); 20-40 s for social; whole-frame shots on beats |

## Rhythm ranges

- Hard hits are 0 ms (easing a hit kills it); anticipated moves start about 40-190 ms early so they complete on the anchor.
- A readable word holds at least one beat (headline 3-8 beats); a camera move at most once per phrase; a dense flip or strobe system runs at most 2-3 s (cap about 4 s).
- Calm tracks: pace by phrase, never by per-onset cuts on an unreliable grid.

Rhythm row: mean_shot_s -; max_shot_s -; first_cut_s -; max_event_gap_s -; holds excuse.

Where the row's numbers come from: No field is gated: pace follows the track (beat-cut or phrase-flow), so no fixed number holds for the type; the measured pace of the genre (a new event about every 0.33 s and a whole-frame change about every second in a built picture, none in a held picture) is gated by the genre fingerprint of `../genres/music-video.md`, not by this row. The row is read by the `ice-qa` skill's `scripts/film_gate.py` on the render's detected cuts when no reference is followed (`references/motion-density.md` section 6.3); a `-` is not gated.

## Timing master

The track, analyzed by one beat analyzer and trusted (ice-audio). Film duration equals the audio duration. Never change duration or audio timing to hide a sync issue.

## Transition policy

Hard cuts on anchors are the native seam; a drop is a regime change, a downbeat is a cut within the regime. Let silence remove density. Measured (`../genres/music-video.md`): the anchors of professional music videos are the sung words, the line changes and the phrase, not the beat grid (cuts on the beat at chance in 8 of 8, on the downbeat at chance); a built picture changes its whole frame about every second, a held picture never cuts.

## Camera policy during holds

Verse: slow push and drift. Chorus: faster. Interlude: pull out. Transition peaks on beats. Measured: a faster chorus camera in 5 of 14 (`../genres/music-video.md`); an option for a built picture, not a rule.

## Sound policy

The user's track only; a handful of big SFX at most, from the SFX ladder (`ice-audio/SKILL.md` section 5).

## Text density

Lyrics placed from supplied lyrics or a transcription the user checks, each line landing with its sung words (word by word in 6 of 9 measured lyric films, a whole line at its first sung word in 3 of 9); one or two lines at a time, 2 to 4 words per line, each held at least one beat, sung words readable for 80 percent or more of the singing (`../genres/music-video.md`).

## Truth and content

Music rights recorded with the use case (platforms, Content ID); artist names and images only with rights (ice-assets, ice-audio).

## Richness floor

Minimums the render must meet; measures, exempt shots and how to fix a thin frame: the `ice-motion` skill, `references/composition-and-staging.md` section 7. ice-qa measures them. Silences that clear the frame on purpose are declared rests.

| Measure | Floor |
|---|---|
| `hero_share` | 30 percent |
| `hero_width` | 50 percent for lyric hook words |
| `frame_fill` | 11 of 16 cells |
| `empty_half` | 1 s in total outside declared rests |
| `depth_layers` | 3 |
| `in_shot_motion` | 90 percent |
| `longest_still` | 4 s outside declared rests in a built picture (measured 1.7 to 12.3 s, median 3.3, `../genres/music-video.md`); a held picture (lyric over a held or looped picture, a loop visualizer) declares its held picture as the rest |
| `surface_detail` | yes in every shot |
| `light_events` | 1 per song section |
| `real_material` | 100 percent for artist names, images and marks (with rights) |

## QA thresholds

Cut offsets measured against the grid when the film is cut to its beat map (a house choice; the measured genre is not); the picture closes with the song's own end (fade, a credits or logo card, or a cut to black, held 3 s or less: 11 of 14 measured); no unintended static spans. The genre fingerprint of `../genres/music-video.md` (ice-qa `scripts/genre_check.py check --genre music-video`, gate D). Flash safety stays absolute: 6 of 14 measured videos exceed 3 flashes per second, Ice never copies them.

## Deliverables

16:9 and 9:16 per platform; lyric `.srt` when lyrics exist. See `../delivery.md`.

## Pointers

Measured genre playbook: `../genres/music-video.md` (the two families and four variants, lyric lines, sections and chorus, the close, rejected rules, the fingerprint; read at 02, 04 and 08). Beat grid, splicing, back-timing: ice-audio. Motion primitives per anchor: ice-motion.

Sources: heygen-com/hyperframes (music-to-video), edenfunf/reelmimic, video-production-studio (Omar-Tnzxo), huashu-art-motion, browser-use/video-use (archetypes).
