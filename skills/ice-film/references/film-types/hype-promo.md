# Film type: hype promo

Fields in order: Fit, Purpose, Structure options, Rhythm ranges, Timing master, Transition policy, Camera policy during holds, Sound policy, Text density, Truth and content, Richness floor, QA thresholds, Deliverables, Pointers.

Stage order: 01 02 03 [04 05] 06 [07 08a] 08b 09 10
Leads with: the music. 01 takes the given track or chooses one, runs its sync license check and measures the beat map (`ice-audio`); 03 keeps the on-screen copy; 04 boards on that beat grid; 08 keeps its normal place.

## Fit

A 15-35 s teaser, sizzle, trailer, event countdown or launch hype cut, driven by its music (measured: 30 s median, 14 to 51 s in 14 official hype promos; a 30 s master and a 15 s cutdown are the common pair; the measured genre playbook `../genres/hype-promo.md`). A 10 s hero arc stays a valid option below.

## Purpose

Energy and one remembered idea. Keep to one idea per scene; 6 strong scenes beat 8 weak ones.

## Structure options

| Option | Skeleton and numbers |
|---|---|
| Beat-grid hype | <runtime 15-35 s from BRIEF> on <the measured tempo of the chosen track, usually 100-165 BPM (genre median 136)>; bars = runtime x tempo / 240 (4/4); a motion-graphics build: 6-8 scenes of 1.5-3 s on that grid; a footage build follows the genre's variant A (`../genres/hype-promo.md`: counted shots 0.3 to 1.3 s, a cut every 1 to 4 beats): brand slam, kinetic triplet, one signature "how did they make that" visual, proof only if real numbers exist (else real capabilities that slam in), end card |
| Rhythmic collage | 12-20 cuts of 0.3-0.8 s with a motif every 4 beats |
| Showreel flurry | development chapters, a flurry of about 6 cuts in 4 beats (one beat each, then half beats), then a lockup |
| Countdown or save the date | the date and place exact, a teaser of the moment, the ticket or link |
| Beat-cut montage (measured variant A, `../genres/hype-promo.md`) | real footage or game render cut hard: about 11 cuts per 10 s, counted shots 0.3 to 1.3 s, a busy first 3 s (4 or more events), the peak late (50 to 95 percent), the name withheld to the close, a date or platform on a centred card held 1.5 to 6 s |
| Slow-burn teaser (measured variant B, `../genres/hype-promo.md`) | few or no cuts, one built reveal (a light, a shape, a match cut chain, one camera pull) paying off on a date or a name; its craft plan lifts the genre keys named in the playbook with exemption rows |
| Ten-second hero arc | a hook in the first 0.5 s (never more than 0.3 s of empty or black), an escalation, one hero moment at 60-75% of the runtime, a composed end frame held 0.8-1.2 s |

## Rhythm ranges

Big changes on beats; typography on 1/8 or 1/16 notes; slams accelerate from beats to 8ths to 16ths. Every cut, flash and invert within 2 frames of a grid line. Burst, then a short rest, then the slam. The beat lock and the acceleration are Ice house choices for a film Ice cuts to its own beat map: the measured genre does not show them (`../genres/hype-promo.md`, Measured and rejected), so they never fail a film that follows a reference.

Rhythm row: mean_shot_s -; max_shot_s -; first_cut_s -; max_event_gap_s 4.5; holds never.

Where the row's numbers come from: max_event_gap_s: the measured genre (`../genres/hype-promo.md`: longest gap without an event 2.0 s at the median, 4.5 s or less in 12 of 14 films and in every variant A film); a slow-burn teaser lifts it with its exemption row; holds never: no scene without motion, the end card is the only hold (Camera policy during holds); the shot fields stay open because the Ten-second hero arc gives no cut count. The row is read by the `ice-qa` skill's `scripts/film_gate.py` on the render's detected cuts when no reference is followed (`references/motion-density.md` section 6.3); a `-` is not gated.

## Timing master

The measured beat grid of the track (ice-audio analyzes it; check the kick-band phase so cuts do not land half a beat late). See `../cue-sheet.md`.

## Transition policy

Motion-graphics hype (no footage or render carries it): a shape carries the eye across every transition (a spark becomes a line, the line floods into the next background, a full stop detaches and becomes the next scene's object). A hard cut between scenes only on a downbeat, at most twice, except inside the flurry. Footage or game-render hype (the measured genre `../genres/hype-promo.md`, variant A): hard cuts carry 90 percent or more of the seams (94 percent at the median in 14 films; carried seams reach 40 percent in only 1), no dissolves; carried seams are accents. A hype cut whose subject is a physical product (footage or a render of the product) follows the measured genre `../genres/product-launch.md` instead: hard cuts carry most seams (3.5 per 10 s, 62 percent of seams in 15 films), still cut on the beat.

## Camera policy during holds

No scene without motion; the end card is the only hold.

## Sound policy

Punchy: kick on every beat, claps on 2 and 4, a riser into the slam and the end card, an impact on each flood, a whoosh on every carried transition; music under the hits. Ice-audio owns the mix. Density: 60 or more effects per minute (median 147 in 14 measured films, `../genres/hype-promo.md`); the default ceiling of `ice-audio` `references/sfx.md` section 4 does not apply.

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

Cut offsets within about 35 ms of a beat or half beat (a house choice, see Rhythm ranges); something happens on every beat; no stock-template look; differs from the last hype film on the fingerprint (ice-qa). The genre fingerprint of `../genres/hype-promo.md` (ice-qa `scripts/genre_check.py check --genre hype-promo`, gate D). Flash safety stays absolute: at the genre's cut pace, plan the shots' brightness order so no 1 s window alternates dark and bright more than 3 times, checked on the animatic (the playbook's "Flashes and safety").

## Deliverables

16:9 and 9:16 masters, a 6 s bumper cut, poster. See `../delivery.md`.

## Pointers

Measured genre playbook: `../genres/hype-promo.md` (the two variants, pace, cuts, the close, rejected rules, the fingerprint; read at 02, 04 and 08). Beat analysis and splicing: ice-audio. Flurry and slam motion: ice-motion. Styles: ice-styles. A physical product hype cut: the measured genre playbook `../genres/product-launch.md` (pace, cuts, tempo 95 to 140 BPM, the closing packshot, the fingerprint).

Sources: Barty-Bart/motion-graphics, bangtutorial/bang-motion, nateherkai/herk-edit-kit, Vincentwei1021/mg-styles-15, AbubakrChan/product-launch-motion.
