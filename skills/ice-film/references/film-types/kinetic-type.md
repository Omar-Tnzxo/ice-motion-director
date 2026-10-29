# Film type: kinetic type

Fields in order: Fit, Purpose, Structure options, Rhythm ranges, Timing master, Transition policy, Camera policy during holds, Sound policy, Text density, Truth and content, Richness floor, QA thresholds, Deliverables, Pointers.

Stage order: 01 02 03 [04 05] 06 [07 08a] 08b 09 10
Leads with: the words, which are the story. When the words are cut to a track (lyric lines) the film is music-led in the same order: 01 also takes the track, runs its sync license check and measures the beat map (`ice-audio`), and 04 boards on the beat grid.

## Fit

- A typography-led film where the words changing are the motion: manifesto, quote, statement, list, lyric lines, chapter cards, a text-only promo or opener.
- If a whole section is text for more than 30-60 s inside another film type, switch grammar or insert an image or evidence beat.

## Purpose

Motion is the message. The type performs the meaning of the words (a word about splitting splits, a word too big for the frame makes the camera pan across it), at most once per film for the one word that carries it.

## Structure options

Tempo, line counts, opacities and hold numbers for the first eight options: the `ice-type` skill, `references/kinetic-type.md` section 8 (copy segmentation by breath: section 2). This table names the skeletons only.

| Option | Skeleton |
|---|---|
| Line by line on words | a few lines, one emphasis verb each, stale lines dimmed, each line rising on its measured word, the last line as word-level micro-hits; camera locked |
| Held thesis | deliberately the shortest frame; second half dimmer with no accent; one wipe through the hinge word; the last moment locked; near-silence |
| Staccato value montage | short value phrases, each flashing and clearing on its beat |
| Statement relay | a few held statements; nothing from the prior beat lingers |
| Verb barrage | single-word verbs on hard cuts, resolving on one defining word |
| Relay to end card | statements hand off to a URL or name card that holds a large share of the runtime |
| Kinetic triplet | three words or phrases, each with its own treatment and background, swapped hard on the beat |
| Hook, build, punch, resolve | copy segmented by breath; 1-2 emphasis words per scene |
| Architectural speech | 20 s loop; words take physical roles from their own letterforms; stillness as punctuation; exact words only |
| Street-poster bumper | condensed display type on a strict grid; per-glyph springs; one camera that only punches in |
| Sentence pan | one sentence wider than the frame, panned once with words dimmed until passed; a special moment used at most twice per film |

## Rhythm ranges

- Word onset gaps and beat tempos: the `ice-type` skill, `references/kinetic-type.md` sections 3 and 8. Reading time, minimum holds per language and beats per readable word in music films: the `ice-type` skill, `references/reading-time.md` sections 1-2.
- Shot length variation (equal word beats read as slides): the `ice-motion` skill, `references/anti-slideshow-and-density.md` section 3.

Rhythm row: mean_shot_s -; max_shot_s -; first_cut_s -; max_event_gap_s -; holds excuse.

Where the row's numbers come from: No field is gated: the structure options run from word hits to a held thesis that is truly still, so no single number holds for the type; word and beat timing stay with the `ice-type` skill. The row is read by the `ice-qa` skill's `scripts/film_gate.py` on the render's detected cuts when no reference is followed (`references/motion-density.md` section 6.3); a `-` is not gated.

## Timing master

Voice-led with a voiceover, music-led with music, reading time (mode `free`) when silent. Clock modes: the `ice-audio` skill, `references/cue-map-and-beat-sync.md` section 1; cutting type on the grid: the same file, section 6. Film-side cue rules: `../cue-sheet.md`.

## Transition policy

Hard-cut word swaps are right inside a burst of hits. Between phrases use velocity-matched exits and entries (cut-the-curve or waterfall cuts; numbers in ice-motion). Two consecutive scenes never use the same entrance direction, size and position.

## Camera policy during holds

Camera locked on type lines; camera punches only on accents; a held thesis is truly still.

## Sound policy

Hits on hits, silence before the thesis. Ice-audio owns levels.

## Text density

One statement per shot, at most about 5 words on screen unless a deliberate text wall is the image. One highlight form per film (or none). Arabic: whole words or lines only, never letter by letter (ice-arabic).

## Truth and content

Approved copy only; quotes verbatim with attribution; facts dated and sourced (ice-assets).

## Richness floor

Minimums the render must meet; measures, exempt shots and how to fix a thin frame: the `ice-motion` skill, `references/composition-and-staging.md` section 7. ice-qa measures them. Statement frames may be mostly free of ink, but the ground is a surface and the type is big.

| Measure | Floor |
|---|---|
| `hero_share` | n/a (type is the hero) |
| `hero_width` | 60 percent for hero lines and statements |
| `frame_fill` | 6 of 16 cells |
| `empty_half` | 0 s for vertical (re-break lines to fill the band); 2 s in total for 16:9 |
| `depth_layers` | 2 (type and a ground with its own plane, light or texture) |
| `in_shot_motion` | 75 percent (a held thesis is a declared true still) |
| `longest_still` | 1 s outside declared rests |
| `surface_detail` | yes in every shot |
| `light_events` | 1 |
| `real_material` | 100 percent when a real brand's name, logo or type appears; otherwise n/a |

## QA thresholds

Every line readable at phone size during its hold; no two texts overlapping during a swap; the emphasis word carries the accent; nothing smaller than the readability floor (ice-type).

## Deliverables

Master in the brief's aspect; vertical re-laid out (lines re-broken by meaning, never shrunk); loop when built as one. See `../delivery.md`.

## Pointers

Type motion, captions, readability gates: ice-type. Arabic type in motion: ice-arabic. Cut catalog: ice-motion.

Sources: AbubakrChan/product-launch-motion, heygen-com/hyperframes (blueprints, motion-graphics), Barty-Bart/motion-graphics, bangtutorial/bang-motion, video-production-studio (Omar-Tnzxo), huashu-art-motion.
