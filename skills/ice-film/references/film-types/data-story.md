# Film type: data story

Fields in order: Fit, Purpose, Structure options, Rhythm ranges, Timing master, Transition policy, Camera policy during holds, Sound policy, Text density, Truth and content, Richness floor, QA thresholds, Deliverables, Pointers.

Stage order: 01 02 03 [04 05] 06 [07 08a] 08b 09 10
Leads with: the data. 01 verifies and sources every number before any concept.

## Fit

A film or unit where numbers lead: a hero stat, an animated chart, a milestone, a report highlight, a finance chart, a timeline, a map with routes. A narrated data explainer that teaches belongs to ice-explainer; when its picture is led by charts and figures (a voice walking through a few charts: variant A of the measured genre playbook `../genres/data-story.md`), ice-explainer keeps its pipeline and voice timing and takes the chart grammar and the fingerprint (`--genre data-story`) from that file.

## Purpose

One chart, one message. Write the chart's one point as a sentence first; the title states that conclusion; the chart or number confirms it. No sentence means no chart.

## Structure options

| Option | Skeleton and numbers |
|---|---|
| Hero stat | 3 s (5-7 s for two): start the count on the label word, not on the spoken number; a long count runs at constant speed; a scale-grow window of about 0.9 s; a settle of at most 2 px; about 2.5% dolly |
| Chart loop | four states: start, change (nothing fades out and gets replaced), hold with the headline value labelled, return; about 8 s: about 2 s change, 4 s hold, 1.5 s return; title, labels and axis never move |
| Milestone reveal | about 12 s loop; the number drawn from thousands of points that pull into the exact figure, an accent line, the label, a hold, the return; no bounce, confetti or sparkle bursts |
| Data physicalization | 10-30 s; one unit equals one real data point; the same data drives motion and sound; payoff number large |
| Finance arc | establisher, initiating, peak, release; hold while the chart grows; a slow push of about 1 s when naming a data point; a fast push only for the one or two key numbers |
| Timeline reel | 15-45 s; one moment per scene, the year large; the pause between beats matters more than the amount of information |
| Asset fusion | a real asset's geometry becomes the chart (a linear object becomes a timeline or gauge, a volume a pie, a height a bar, a container an exploded view); colours sampled from the asset |
| Route map | inline vector or baked map, never live tiles; 3-5 hero routes drawn 0.4-0.6 s each; a route is a flow with a vehicle, not a static arc |
| Information to visual | pick the form by the information type: part of a whole as a grid with some lit, percent as a filling ring or bar, trend as a line, comparison as two bars, ranking as a bar race, process as numbered steps, time as a clock, place as a map pin, money as a counter or receipt, cause and effect as dominoes |

## Rhythm ranges

Count-ups decelerate, then hold: a count runs 0.6 to 2.0 s (measured median 1.1 s over 33 counts in 5 films; 1.2 to 1.6 s in 11 of 33, `../genres/data-story.md`), every count in one film the same length; the label may already be on screen (23 of 33 counts) or arrive after the number lands (value, then meaning). A finished figure stays readable about 4.6 s (2 s or more for 56 of 63 measured hero numbers) and a finished chart about 3 s (2 s or more for 45 of 64 charts) before the next change. A number changes while the thing it counts is changing and stops on the frame the action stops.

Rhythm row: mean_shot_s -; max_shot_s -; first_cut_s -; max_event_gap_s -; holds excuse.

Where the row's numbers come from: No field is gated: this section times count-ups, not shots or gaps, and the structure options hold values for 4 s or more by design (Chart loop, Hero stat). The row is read by the `ice-qa` skill's `scripts/film_gate.py` on the render's detected cuts when no reference is followed (`references/motion-density.md` section 6.3); a `-` is not gated.

## Timing master

The voiceover word that names the metric, or the music phrase; silent units use reading time. See `../cue-sheet.md`.

## Transition policy

Data animates by its own logic: bars grow from the baseline, lines draw left to right, segments widen to proportion, dots populate. One chart morphs into the next; nothing pops.

## Camera policy during holds

Locked while the reader reads the value; at most one slow push on the named data point.

## Sound policy

A soft tick while counting that slows with the count, a landing sound on the final value; restrained bed (ice-audio). Measured (`../genres/data-story.md`): a music bed runs under 11 of 15 films (the 4 without are newsroom voice pieces); the silent figure stream (variant B, no voice) is music-led; sounds are not placed on every move (13 of 15 films land sounds on visual events no more often than chance), so the ticks and landings stay on counts and lands only.

## Text density

Direct labels on values; extreme figure-to-label scale contrast; labels at a readable size (small benchmark labels next to a count-up read as a template tell); one hero figure plus three to seven supporting facts at most.

## Truth and content

- Approved figures only, exactly as written: never round up, never add "+", never swap a target for a result. "No source, no clip."
- Keep measured results, targets and sample data apart; sample data carries an "Illustrative data" label on every frame; projections are labelled as projections.
- Numbers must be mutually derivable across shots (a multiple shown must compute from the values shown; "rose to" and "rose by" differ).
- Non-zero axes are stated; up and down colour conventions follow the audience's market. Charts never plot numbers you do not have: use an abstract non-chart visual or cut.
- Truth sheet: ice-assets.

## Richness floor

Minimums the render must meet; measures, exempt shots and how to fix a thin frame: the `ice-motion` skill, `references/composition-and-staging.md` section 7. ice-qa measures them. Locked reading holds on a value are declared in the motion plan.

| Measure | Floor |
|---|---|
| `hero_share` | 30 percent for the chart, map or physical asset |
| `hero_width` | 40 percent for a hero number |
| `frame_fill` | 10 of 16 cells |
| `empty_half` | 0 s for vertical; 1 s in total for 16:9 and square |
| `depth_layers` | 2 (3 for asset fusion and route maps) |
| `in_shot_motion` | 70 percent |
| `longest_still` | 1 s outside declared reading holds |
| `surface_detail` | yes in every shot |
| `light_events` | 1 |
| `real_material` | 100 percent when the data or asset belongs to a real brand (its real asset, colours and logo) |

## QA thresholds

Tabular digits so widths never jitter; the count lands on the exact integer; the same number matches across shots; the chart reads at phone size. Every data story: the genre fingerprint of `../genres/data-story.md` (the first chart or figure by 25 s, data on screen a fifth of the runtime or more, a finished chart or figure readable about 1 s or more at the median, at most 8 figures at once, few hard cuts, the event gaps), checked by the `ice-qa` skill's `scripts/genre_check.py` at 07 and 09.

## Deliverables

MP4 plus a looping GIF when it is a loop; 4:5 default for feeds; stills of the held state. See `../delivery.md`.

## Pointers

Measured genre playbook (conventions, the two variants, rejected rules, the fingerprint the render is checked against; read at 02, 04 and 08): `../genres/data-story.md`. Counter and odometer mechanics: ice-motion. Number typography: ice-type. Arabic numerals and bidi: ice-arabic.

Sources: AbubakrChan/product-launch-motion, charlie947/motion-graphics-skills, heygen-com/hyperframes (motion-graphics categories), video-production-studio (Omar-Tnzxo), huashu-art-motion, Tejashmakwana/motionmaxxing, diffusionstudio/lottie, alexgreensh/anidoodle.
