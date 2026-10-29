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
| Song sections | intro, verse, chorus, bridge, outro; chapters equal song sections, each with one setting and a small palette; a recurring set and an escalating motif; a cast table with arcs |
| Beat-cut music video | up to a full song; effect intensity follows section energy (intro low, chorus full); cuts on beats; never a slideshow or a generic visualizer |
| Lyric as character | 50 s to a full song; one lyric line per scene; huge words on the hook; supplied lyrics are authoritative |
| Audio-reactive hero | 15-40 s; a beat map of kicks, snares and hats drives light, detail and lens |
| Frame skeleton from the track | cut frames at hard stops, surges and drops, roll edges, onset deserts and big energy jumps (expect about 1-6 frames); pacing either beat-cut or phrase-flow; frames tile the track exactly |
| Montage | score clips by motion, steadiness and sharpness; strongest first; vary lengths (illustration only: 1.0, 0.82, 1.24, 0.94 times the base); 20-40 s for social; whole-frame shots on beats |

## Rhythm ranges

- Hard hits are 0 ms (easing a hit kills it); anticipated moves start about 40-190 ms early so they complete on the anchor.
- A readable word holds at least one beat (headline 3-8 beats); a camera move at most once per phrase; a dense flip or strobe system runs at most 2-3 s (cap about 4 s).
- Calm tracks: pace by phrase, never by per-onset cuts on an unreliable grid.

## Timing master

The track, analyzed by one beat analyzer and trusted (ice-audio). Film duration equals the audio duration. Never change duration or audio timing to hide a sync issue.

## Transition policy

Hard cuts on anchors are the native seam; a drop is a regime change, a downbeat is a cut within the regime. Let silence remove density.

## Camera policy during holds

Verse: slow push and drift. Chorus: faster. Interlude: pull out. Transition peaks on beats.

## Sound policy

The user's track only; a handful of big SFX at most, from the SFX ladder (`ice-audio/SKILL.md` section 5).

## Text density

Lyrics placed on the beat grid from supplied lyrics or a transcription the user checks; one line per scene.

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
| `longest_still` | 0.5 s outside declared rests |
| `surface_detail` | yes in every shot |
| `light_events` | 1 per song section |
| `real_material` | 100 percent for artist names, images and marks (with rights) |

## QA thresholds

Cut offsets measured against the grid; the ending reaches a musical landing or forms a deliberate loop; no unintended static spans.

## Deliverables

16:9 and 9:16 per platform; lyric `.srt` when lyrics exist. See `../delivery.md`.

## Pointers

Beat grid, splicing, back-timing: ice-audio. Motion primitives per anchor: ice-motion.

Sources: heygen-com/hyperframes (music-to-video), edenfunf/reelmimic, video-production-studio (Omar-Tnzxo), huashu-art-motion, browser-use/video-use (archetypes).
