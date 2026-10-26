# Film type: art film

Fields in order: Fit, Purpose, Structure options, Rhythm ranges, Timing master, Transition policy, Camera policy during holds, Sound policy, Text density, Truth and content, Richness floor, QA thresholds, Deliverables, Pointers.

Stage order: 01 02 05 03 04 06 [07 08a] 08b 09 10
Leads with: the look. 05 explores the look right after 02; 03 holds the few words (titles, any spoken or written line, the end card; a wordless film writes only those); 04 is a loose board on the chosen look.

## Fit

A short where the medium and look carry the film: a style showcase, painted or drawn motion, a hand-made look, an experimental or festival piece, a "same scene through changing styles" film (10-60 s).

## Purpose

The canonical, instantly recognizable form of a style, used to say something. A clean, template-looking result is a fail.

## Structure options

| Option | Skeleton and numbers |
|---|---|
| Ten-second style film | a hook in the first 0.5 s, an escalation, one unmistakable hero moment at about 60-75% of the runtime, a composed end frame held 0.8-1.2 s with living micro-motion |
| Living painting scenes | each scene has one main continuous action plus 2-4 motif loops from the style's own world; the camera may drift slowly |
| One subject, one goal, one turn | setup, turn, an ending that echoes (bookend the opening, reveal the scale, or let the character do the thing right the second time) |
| One line through everything | a single unbroken line or object draws every scene |
| Material as mechanic | one material is the story mechanic (pixels at a fixed low resolution, clay on twos, sand drawn and wiped) |
| Changing styles or eras | one continuous anchor (a counter, a pose, a character) runs on global time while each segment re-renders in its era's style; segments are not a quota |
| Three candidate structures | write three; the first idea for a style is usually its cliché |

## Rhythm ranges

Vary the pace: at least one clear acceleration or deceleration and one breath; a film at one even speed has failed. One action, one sound, one cut, but not a cut on every beat.

## Timing master

Usually music or a score written to a cue map before animating; narration when the piece has a voice. See `../cue-sheet.md`.

## Transition policy

Transitions are designed inside the medium (the style's own matter becomes the transition) and carried by elements first; avoid default fades and hard cuts. Crossfades are allowed as "this continues" in art films, never as the default seam (the `ice-motion` skill, `references/transition-policy.md` section 3).

## Camera policy during holds

The picture stays alive (hero action plus motif loops); animate on twos where the style wants it, but keep camera and light smooth every frame (a stepped camera reads as lag). At least four different camera moves and real changes of framing across the film.

## Sound policy

Every visible action has a sound matched to its material; three layers (ambience, foley, music); at least two real silences before the turn or peak; sound used as a transition at least twice; score in the style's own instruments, not generic piano and strings (ice-audio).

## Text density

Minimal; titles and subtitles held long enough to read. Hold times for subtitles and title cards: the `ice-type` skill, `references/reading-time.md` section 1.

## Truth and content

References teach grammar only; never copy characters, designs, melodies, shots, logos or type designs. Real works, brands or people only with rights; otherwise fictional stand-ins (ice-assets).

## Richness floor

Minimums the render must meet; measures, exempt shots and how to fix a thin frame: the `ice-motion` skill, `references/composition-and-staging.md` section 7. ice-qa measures them. Real silences before the turn are declared rests.

| Measure | Floor |
|---|---|
| `hero_share` | 25 percent (the subject at least a third of the frame height at key moments) |
| `hero_width` | n/a unless a title is the hero (then 40 percent) |
| `frame_fill` | 10 of 16 cells |
| `empty_half` | 1.5 s in total, only inside declared rests |
| `depth_layers` | 3 (2 for a flat print or paper style that carries its material texture) |
| `in_shot_motion` | 85 percent (the painting stays alive) |
| `longest_still` | 1 s outside declared rests |
| `surface_detail` | yes in every shot: the medium's own material |
| `light_events` | 2 |
| `real_material` | n/a unless a real brand or work appears (then 100 percent, with rights) |

## QA thresholds

- Style authenticity: an expert names the style in one second; every signature technique is present and correct.
- Not the demo again: the six axes and the 4-of-6 distance rule against the nearest bundled demo: the `ice-direction` skill, `references/anti-sameness.md` sections 1 and 4.
- Critic scale for honest scoring: 5 student, 6 template, 7 professional, 8 agency, 9 award shortlist; first renders usually deserve 5-7 (ice-qa).

## Deliverables

Master, poster, credits file for every asset, treatment. See `../delivery.md`.

## Pointers

Style catalogs and art styles: ice-styles. Engines for painted or 3D routes: ice-engines.

Sources: Vincentwei1021/mg-styles-15, huashu-art-motion, lemomo-ai/lemo-opuscar, video-production-studio (Omar-Tnzxo), edenfunf/reelmimic.
