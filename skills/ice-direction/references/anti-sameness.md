# Anti-sameness: fingerprint, distance rule, default-look gate

Films must never converge on one look, palette, structure or workflow. This file defines the fingerprint record, the 4-of-6 distance rule and the default-look gate. `ice-direction` applies them at decision time; `ice-qa` re-checks them on the render and writes the fingerprint file after delivery.

## Contents

1. The six axes
2. Fingerprint record format
3. When two axes count as different
4. The 4-of-6 distance rule
5. The default-look gate
6. The default kit (warnings)
7. Structural sameness and the two-film test
8. Where each check runs

## 1. The six axes

| Axis | What it captures | Dials folded in (`pitch-round.md` B.2) |
|---|---|---|
| palette | polarity, accent hue, chroma strategy, number of active hues | color, ground, texture |
| type | display and body families, class pairing, weight strategy | type |
| layout | dominant composition families, density, depth | density, depth |
| motion | motion family, three core moves, camera language, frame clock | energy, camera |
| structure | concept, scene count band, main object per scene, opening, closing, device, arc, turn point | subject, voice |
| sound | lead (score, sound design, voice, silence), genre, tempo band, dramaturgy | sound |

## 2. Fingerprint record format

One JSON object per line in `~/.ice-motion-director/fingerprints.jsonl`. Local only, disclosed in the README, can be turned off by the user (then only the template distance applies, and the hand-off says so). The example is wrapped for reading; each record is stored on a single line.

```json
{"v":1,"date":"YYYY-MM-DD","project":"<slug>","brand":"<name or none>","film_type":"<type>","variant_of":null,
 "palette":{"polarity":"light|dark|color-field|photographic","accent_hue":0,"chroma":"mono-signal|duotone|multi-state|full","hues":0,"values":["#RRGGBB"]},
 "type":{"display":"<family>","body":"<family>","classes":"<class>+<class>","weights":"<e.g. 300/900>"},
 "layout":{"families":["<family>"],"density":"sparse|balanced|dense","depth":"flat|2.5d|3d"},
 "motion":{"family":"<calm|punch|editorial|one-take|handmade|physical|other>","core_moves":["<move>","<move>","<move>"],"camera":"<locked|continuous|punctuation|other>","clock":"smooth|twos|mixed-declared"},
 "structure":{"concept":"<one line>","scene_band":"1|2-4|5-8|9-14|15+","main_objects":["<noun>"],"opening":"<state>","closing":"<state>","device":"<device>","arc":"<arc>","turn_at":0.4},
 "sound":{"lead":"score|sound-design|voice|silence","genre":"<genre or none>","bpm_band":"<e.g. 90-110 or none>","dramaturgy":"<one line>"}}
```

Field vocabularies:

- Composition families: full-frame type, asymmetric editorial, centered object, wide environment, close detail, depth stack, split screen, diagram, image-led, grid, device in frame, one continuous canvas, negative-space call to action.
- Devices and arcs: the tables in `pitch-round.md` B.6.
- Opening and closing states: the `ice-ideas` skill, `references/concept-menus.md` sections 3 and 4.
- `variant_of`: the project slug when this film is a cutdown, aspect variant or language version of another film.

The structure line is also written in one human line in the treatment and the hand-off for later comparison: `concept · scene count · main object per scene · opening · closing`.

## 3. When two axes count as different

| Axis | Different when at least one holds |
|---|---|
| palette | polarity differs; accent hue differs by 45 degrees or more (OKLCH hue); chroma strategy differs |
| type | display family differs AND (class pairing differs OR weight strategy differs) |
| layout | dominant composition family differs, or fewer than half of the composition families are shared |
| motion | motion family differs, or at least 2 of the 3 core moves differ, or the camera language differs |
| structure | at least 3 of these 5 differ: concept, scene band, main objects, opening, closing |
| sound | lead differs, or genre differs, or dramaturgy differs |

A new palette on an old scene order is still a template: structure is judged separately from surface.

## 4. The 4-of-6 distance rule

| Compare against | Rule |
|---|---|
| The nearest bundled template, demo, worked example or style card (any skill) | Differ on at least 4 of 6 axes |
| Fingerprints of other brands or subjects (the most recent 30 entries) | Differ on at least 4 of 6 axes from every one |
| Fingerprints of the same brand (all entries) | Palette and type may stay brand-locked (exempt); of the remaining four axes at least 3 differ, and structure must differ |
| A film's own variants (`variant_of` set: cutdowns, aspect and language versions) | Exempt; they are the same film |

These numbers (30 recent entries, 3 of 4 axes for the same brand, a 45 degree accent hue distance, a 24 month research window) are the founder-approved defaults. A user may change them for their own projects; log the change as a D-entry.

How to find "the nearest" template: compare the direction against every bundled template, demo and style card the run could have read, and take the one with the most matching axes. Name it in the D-entry.

A user request to repeat ("make another like last time", "same style as my previous film") overrides the fingerprint rule for the axes the user named; log the override with the user's words. The template rule still applies.

On failure: the director changes the axes that match, starting with structure and motion, then re-runs the check. Never satisfy the rule by changing only colors.

News reel (edit type `news-reel`, style family `ice-styles/references/family-broadcast-news.md`): the genre style and the programme packages in that file are style cards.
- Genre use (the user's identity, no package skin): the film differs from every package card on at least 4 of 6 axes, as above. Palette and type change with the user's identity; structure changes with the content; layout or sound must still make the fourth axis, because the genre fixes the motion language.
- A remake whose stage 01 `identity` slot is "as they are" or "a mix" and whose reference is the programme a package card records: closeness to that reference is the remake mode's contract (structural fidelity, frame-locked or translation: the `ice-remake` skill, `references/rights-and-modes.md` section 3), not a failure of this rule against that card. The 4-of-6 rule still applies against every other card, template and demo; how much of the reference's structure is kept is what the mode says, and the content (concept, main objects) is the user's. Fingerprints of the outlet's own films follow the same-brand row. Log which case applies in the D-entry.

## 5. The default-look gate

The stock AI palette (blue and purple) dominating a film fails unless the brief gives a reason.

**At decision time (palette values):** a color is flagged when its hue is 225 to 300 degrees and its saturation is 0.30 or more (HSV). The palette fails when the ground, the surface, or the dominant accent is flagged.

**At render time (`ice-qa` runs the scan):** a frame is blue-purple when 30% or more of its pixels have hue 225 to 300 degrees, saturation 0.30 or more and brightness between 0.06 and 0.90. The film fails when blue-purple frames are 30% or more of the film; it warns at 12% or more.

**Not flagged:** navy and flat blue near hue 210; blue or purple used as a small semantic state.

**Valid reasons** (logged as a D-entry, quoted from the source): the brand's own palette; the user named these colors; the subject's real colors are blue or purple (illustration only: a night sky subject, a product whose material is that color, a team's official colors). "Looks techy" or "feels premium" is not a reason.

## 6. The default kit (warnings)

Each item below is a training-data default. One present needs a D-entry reason; three or more present in one direction without reasons fail the direction as "default kit".

- Purple-to-blue or purple-to-pink gradients; cyan on dark; neon glow; deep purple starfields.
- Glass cards, mesh gradient and specular sweeps used together.
- A dark opener of kinetic type as the first shot.
- Gradient text; left-edge accent stripes on cards; identical card grids; everything centered with equal weight.
- A default-look font from `type-pairing.md` section 5 as the display voice.
- AI symbols for "the product thinks" (orbs, sparkles, glowing brains, neural nets, robots).
- A fake cursor in a film about a product with no UI.
- Page chrome: kicker labels, counters, timecodes, headers that name the scene.
- The template skeleton: a first title that zooms then exits sideways, three parallel feature tiles, a typed search box, hook then feature then feature then promise then logo then call to action.

## 7. Structural sameness and the two-film test

- Before building, write the structure line beside the structure line of the brand's last film and the most recent fingerprint. If arc, device, climax and ending match, it is a variant with a new palette.
- Breaking the category expectation the same way twice is a house style.
- The brand test and the competitor swap: the ice-qa skill, `references/identity-tests.md` (their one home), run at 02 on the concepts, at 04 and 05 on masked frames, and at 09 as a confirmation.
- Avoid the core moves of the brand's last three films; never use the same core move twice in a row inside a film.

## 8. Where each check runs

| Check | Decision time (here) | Render time (`ice-qa`) |
|---|---|---|
| Default-look gate | palette values | frame scan thresholds above |
| Template distance | on the approved direction | on the contact sheet |
| Fingerprint | on the approved direction | final record written after delivery |
| Default kit | on each direction | slop scan |
| Brand test, competitor swap | 02 blind description; 04 and 05 masked frames | 09 masked draft frames (confirmation) |
| Studio benchmark | style frames at 05 (the ice-qa skill, `references/studio-benchmark.md`) | the 09 critic's craft score (confirmation) |

Sources: Ice AGENTS.md rule 2 and architecture section 5 (founder); lemomo-ai/lemo-opuscar "not the demo again" 4-of-6 (MIT); AbubakrChan/product-launch-motion dials and structural sameness (MIT); bangtutorial/bang-motion structure fingerprint and template skeleton (MIT, translated); alchaincyf/huashu-art-motion blue-purple gate thresholds (MIT, translated); video-production-studio anti-sameness (Omar-Tnzxo); majedphotos/video-ad-editor moves history (MIT); heygen-com/hyperframes lazy defaults (Apache-2.0); Tejashmakwana/motionmaxxing slop autopsy (Apache-2.0); howseen-ai/claude-motion-design "fight the fingerprint" (MIT).
