# Measured motion: numbers from human-made films

Numbers measured frame by frame on 53 recreated professional launch moments (about 4,288 moves, 3-7 s moments, SaaS genre, single rater). They describe that genre: use them as calibrated defaults for product launch, app ad, UI walkthrough, hype promo and social short; treat them as a starting point elsewhere. Frames are at 30 fps unless marked. The 12 eases ship as code in `scripts/measured-eases.mjs` (run `node scripts/measured-eases.mjs` for the table, or import `EASE`, `sample`, `nearest`).

## Contents
1. Durations
2. Landing and leaving
3. The 12 measured eases
4. Pick the ease
5. Entries
6. Exits
7. Start oversized
8. Overshoot, drift, stillness
9. Camera multipliers (pointer)

## 1. Durations

| Property | Median frames (seconds) | Notes |
|---|---|---|
| Translate x / y | 12 (0.40) | p10-p90 for x: 3 / 6 / 12 / 24 / 38 |
| Scale | 10 (0.33) | |
| Rotation | 11 | |
| Opacity | 6 (0.20) | opacity is a short helper |
| Blur | 7 (0.23) | |
| Size | 8 | |
| All moves pooled | 10 (0.33) | 13 percent are 2-3 frame snaps; 12 percent run longer than 1 s |

Defaults: translate and scale entries 12 frames, opacity 6, blur 7; exits 13-14 frames for translate and 10 for scale. Treat 6 and 24 frames as the p25 and p75 edges.

By role (entry / exit frames): hook 12-14 / 10-12; turn 12-15 / 14-16 (33 percent ease-in); proof 12-14 / 12-16; CTA entries 6 frames with 39 percent snap curves and 4.3 percent overshoot. In a CTA halve supporting entry times (6 frames), make about 23 percent of moves snapSettle and 25 percent softLand; a hero mark or button runs 18-30 frames on snapSettle.

## 2. Landing and leaving

| Where | Ease-out | Linear | In-out | Ease-in |
|---|---|---|---|---|
| Landing | 58% | 14% | 10% | 16% |
| Leaving | 35% | | | 37% (scale leaving 42%, blur leaving 63%) |

Shape fingerprints (percent of travel done at 10 / 25 / 50 percent of the time): snap 50/86/95, firm 26/60/85, soft 9/35/73, linear 9/24/50, S-curve 2/11/41, gentle accel 2/7/23, hard accel 0/2/8. Exits accelerate and end at peak speed (peak at t about 0.9), but do not make every exit ease-in.

Transform entries outnumber opacity fades about 6 to 1 (3,392 vs 584). Exits: 60 percent moves, 15 percent fades, 25 percent hard steps. Where an element simply appears or disappears: entry 57 percent hard 1-frame cut, 43 percent fade; exit 63 percent cut, 37 percent fade. 96 percent of moments use hard visibility switches (median 20 distinct cut frames per moment). System events (a notification, a state) hard-cut on in 1 frame.

## 3. The 12 measured eases

| Name | Percent done at 10/25/50/75 of time | Frames p25/med/p75 | Share | Used for |
|---|---|---|---|---|
| cruise | 10/25/50/75 (linear) | 6/9/16 | 18% | fades, drift, camera creep, counters; every drift is linear |
| glide | 16/39/69/91 (power 1.7) | 7/10/18 | 14% | medium x/y/scale/blur lands and some fades |
| softInOut | 4/17/50/83 (S-curve) | 6/9/16 | 14% | opacity, blur, colour and ground ramps |
| softLand | 30/59/85/95 (expo k 3.4) | 6/12/21 | 9% | text rises, panel slides, scale-ins; 85% entries |
| gentleIn | 1/6/24/55 (power 2.07) | 6/9/17 | 9% | exits, fade-out starts, slow push-ins into a cut |
| snapSettle | 54/84/96/98 | 6/11/29 | 6% | hero entries, CTA moves |
| whip | 23/52/83/97 (power 2.5) | 8/13/21 | 6% | big fast moves; true whips 7-8 frames |
| accelExit | 0/3/16/47 (power 2.6) | 9/13/19 | 5% | the leaving curve, scale exits, pans off-frame |
| crashOut | 0/0/6/32 (power 4) | 11/17/31 | 4% | camera pull-offs and exits ending in a hard cut |
| popOver | 10/46/96/108 (peak 1.08 at t 0.72) | 11/15/27 | 2% | the late lean past the mark |
| crashIn | 91/118/110/103 (peak 1.18 at t 0.27) | 9/10/27 | 1% | slams that pass the mark at once and relax back |
| bounceHard | 13/62/138/139 (peak 1.48 at t 0.62) | 11/22/28 | <1% | the big overshoot; sparingly |

89 percent of measured moves lie within 0.12 of one of these, 53 percent within 0.06: interpolate between them. Use `nearest()` in the script to classify a move measured from a reference (ice-remake).

## 4. Pick the ease

| What moves | Ease | Frames | Notes |
|---|---|---|---|
| Card, panel, modal landing | softLand | 12 (6-21) | hero card in close-up: snapSettle 11 then a 0.4-0.6 s tail |
| Card inside a CTA | snapSettle | 6 | |
| Whole-word arrival | softLand | 12-15 | offset 0.03-0.07 H; hero first word snapSettle 10-18 |
| Logo crash-in from 3.5-3.75x | snapSettle | 18-30 | 39 percent of the drop in frame 1, 86 percent by frame 6, 1.0 at 0.67 s, then cruise creep 1.0 to 0.93 over 1+ s |
| Camera push | glide or cruise | 10-22 | slow creeps are linear |
| Camera punch or reveal snap | one-frame step then softLand tail | 9-18 | ratio 0.56-0.77 in 1 frame |
| Camera pull or pull-off | accelExit or crashOut | 13-17 | pulls are 62 percent ease-in |
| Whip, entry half | whip | 7-8 | peak speed at t 0.25 |
| Whip, departing half | accelExit | 6-10 | ends at peak speed on the cut |
| Drift, creep, ambient | cruise | 26+ | 1-3 px per frame |
| Press down | glide | 2-6 | |
| Release | popOver (or softLand for none) | 6-10 | +5 percent rebound |
| Fade | cruise | 4-7 | softInOut for ground ramps, gentleIn for fade-out starts |
| Blur-in focus reveal | glide or softInOut | 4-8 | 12 to 0 px in 4 frames |
| Blur-out | gentleIn | 7 | |
| Counter | values stepped per frame, steps decaying | 7-23 | never an eased tween of the digits when the number is the hero |
| Exit off-frame, shrink to cut | accelExit | 13 | |
| One physical reward | popOver, rarely bounceHard | 15 / 22 | once per film |

## 5. Entries

- Spend two or more decaying channels at once, never opacity alone. Shares: transform 71 percent, blur-in 8 percent, opacity-only 12 percent, hard cut 16 percent.
- Channel sizes: word offset 0.03-0.07 H below or 0.03 W beside (about 14-46 px); hero first word 0.10-0.24 H shrinking per word; cards rise 0.6 H or slide 0.14 W, 62-72 percent of travel in the first 4 frames; blur 3-6 px on type, 8-12 px status, 12-17 px hero counter, 18 px logo, over 4-8 frames; colour tint to ink over 4-17 frames; opacity 0.12-0.3 to 1 over 4-6 frames.
- Entries put most travel in the first 4-8 frames and then a long tail, no bounce.
- Start the beat already in progress on frame 0 and cut onto it. A state change in place: a 1-frame reveal of the final form with a small settle (3-10 percent over 7-14 frames) rather than a morph. Different offset and tail per entry.

## 6. Exits

| Type | Numbers |
|---|---|
| Accelerate off-frame | 6-10 frames (17 to 111 px per frame) |
| Shrink | to about 0.3 with jitter of about 1 px |
| Clip or mask wipe through glyphs | 5 frames, accelerating |
| Words out | 1 frame apart, 3-4 frames each, overlapping the next entrance by about 2 frames |
| Hard cut | 1 frame |
| Single-object fade | linear, 10 frames |

Exit with new motion, never the entry reversed (it reads as an undo).

## 7. Start oversized

| Thing | Start scale or size |
|---|---|
| Logo crash-in | 3.5-3.75x |
| Calm mark | 1.86x (calm brand logo may arrive at 1.1x on a long ease) |
| Logo plate scaleX | 1.46 (excess x0.72 per frame at 24 fps) |
| Emblem | 0.28 W with blur 18, excess halves every 2 frames, to 0.10 W |
| Opening word | 0.39 H to 0.09 H in 0.30 s |
| First kinetic word | 1.94x |
| Cursor | 1.5-2.2x, up to 5.1x |
| Camera on UI | 1.4-4.39x |

Rule: start at 1.4-5x and scale down to rest; never grow from zero, never fade up. Spend scale once per film and let the ending get smaller. Growth is allowed for cascades, a growing object that is the next scene, a loader dot becoming a code, and identity objects not smaller than about 0.30-0.60x. Scope: product launch, app ad, logo sting, hype promo; calm brand films and data stories use the 1.1x variant or plain entries.

## 8. Overshoot, drift, stillness

- 8.8 percent of moves overshoot by more than 3 percent; 88 percent of overshoots peak after 35 percent of the duration (median 0.65-0.70); median 19 percent of own travel. popOver at most once per beat. The one visible spring: snap to 0.9x of the target, spring to 1.0 over about 0.17 s; children on a 2-frame stagger with about 0.06 H overshoot.
- Drift is linear, median 26 frames, about 2.5 px per frame; background creeps 1.1-1.5 px per frame (0.02 W per 2.9 s, 0.027-0.07 W per second).
- Motion on about 99 percent of frames inside 3-7 s moments (not a whole-film target). A bright-ground hardware launch is still for about 55 percent of its length. Whole human films: mean frame-to-frame luma change median 6.8, IQR 4.4-9.8. These are questions, never gates: below the band ask what is alive between beats, above it ask whether the picture can be read. Gates are owned by the ice-qa skill.
- Payoff holds: list 0.8 s, number 0.47 s, lockup 0.67 s, pile of shapes 0.8-1.0 s. Elsewhere micro-drift: 1-2 px per frame line drift, 0.4 percent shrink steps, counters ticking, a dot grid drifting 0.02 W over 3 s.
- Anticipation is rare: only 5 percent of moves carry it (a 3-frame drift opposite to travel, or a 0.1 s still before a press); spend it on the key move.

## 9. Camera multipliers

Push, pull, whip, dive and snap numbers are in `camera.md` section 4.

Sources: motionmaxxing references/motion.md, director.md, type.md (Apache-2.0, author's numbers kept).
