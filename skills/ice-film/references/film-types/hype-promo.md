# Film type: hype promo

Fields in order: Fit, Purpose, Structure options, Rhythm ranges, Timing master, Transition policy, Camera policy during holds, Sound policy, Text density, Truth and content, Richness floor, QA thresholds, Deliverables, Pointers.

Stage order: 01 02 03 [04 05] 06 [07 08a] 08b 09 10
Leads with: the music. 01 takes the given track or chooses one, runs its sync license check and measures the beat map (`ice-audio`); 03 keeps the on-screen copy; 04 boards on that beat grid; 08 keeps its normal place.

## Fit

A 10-20 s teaser, sizzle, trailer, event countdown or launch hype cut, driven by a fast beat grid.

## Purpose

Energy and one remembered idea. Keep to one idea per scene; 6 strong scenes beat 8 weak ones.

## Structure options

| Option | Skeleton and numbers |
|---|---|
| Beat-grid hype | <runtime 12-20 s from BRIEF> on <the measured tempo of the chosen track, usually 120-140 BPM>; bars = runtime x tempo / 240 (4/4); 6-8 scenes of 1.5-3 s on that grid: brand slam, kinetic triplet, one signature "how did they make that" visual, proof only if real numbers exist (else real capabilities that slam in), end card |
| Rhythmic collage | 12-20 cuts of 0.3-0.8 s with a motif every 4 beats |
| Showreel flurry | development chapters, a flurry of about 6 cuts in 4 beats (one beat each, then half beats), then a lockup |
| Countdown or save the date | the date and place exact, a teaser of the moment, the ticket or link |
| Ten-second hero arc | a hook in the first 0.5 s (never more than 0.3 s of empty or black), an escalation, one hero moment at 60-75% of the runtime, a composed end frame held 0.8-1.2 s |

## Rhythm ranges

Big changes on beats; typography on 1/8 or 1/16 notes; slams accelerate from beats to 8ths to 16ths. Every cut, flash and invert within 2 frames of a grid line. Burst, then a short rest, then the slam.

## Timing master

The measured beat grid of the track (ice-audio analyzes it; check the kick-band phase so cuts do not land half a beat late). See `../cue-sheet.md`.

## Transition policy

A shape carries the eye across every transition (a spark becomes a line, the line floods into the next background, a full stop detaches and becomes the next scene's object). A hard cut between scenes only on a downbeat, at most twice, except inside the flurry.

## Camera policy during holds

No scene without motion; the end card is the only hold.

## Sound policy

Punchy: kick on every beat, claps on 2 and 4, a riser into the slam and the end card, an impact on each flood, a whoosh on every carried transition; music under the hits. Ice-audio owns the mix.

## Text density

At most 3 colours per scene (not counting black and white); nothing smaller than readable at a glance; one emphasis per slam. A countdown or save-the-date end card carries the CTA block exception of `industry-spot.md` (Text density): date, place and link exact, held for reading time.

## Truth and content

Proof only from real numbers; dates, venues and artist names exact and cleared (ice-assets).

## Richness floor

Minimums the render must meet; measures, exempt shots and how to fix a thin frame: the `ice-motion` skill, `references/composition-and-staging.md` section 7. ice-qa measures them.

| Measure | Floor |
|---|---|
| `hero_share` | 40 percent |
| `hero_width` | 60 percent for slam words |
| `frame_fill` | 12 of 16 cells |
| `empty_half` | 0.3 s in total (an empty or black opening never runs past 0.3 s) |
| `depth_layers` | 3 |
| `in_shot_motion` | 95 percent |
| `longest_still` | only the end card |
| `surface_detail` | yes in every shot |
| `light_events` | 3 per film, each with a cause |
| `real_material` | 100 percent: real dates, venues, artist and brand material with rights |

## QA thresholds

Cut offsets within about 35 ms of a beat or half beat; something happens on every beat; no stock-template look; differs from the last hype film on the fingerprint (ice-qa).

## Deliverables

16:9 and 9:16 masters, a 6 s bumper cut, poster. See `../delivery.md`.

## Pointers

Beat analysis and splicing: ice-audio. Flurry and slam motion: ice-motion. Styles: ice-styles.

Sources: Barty-Bart/motion-graphics, bangtutorial/bang-motion, nateherkai/herk-edit-kit, Vincentwei1021/mg-styles-15, AbubakrChan/product-launch-motion.
