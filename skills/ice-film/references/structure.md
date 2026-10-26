# Structure: the shape of the film

How to pick and check the film's backbone before any script line or frame. Type-specific skeletons live in `film-types/`; this file holds the rules every structure obeys.

## Contents

1. One claim
2. Structure families
3. Beat roles and lengths
4. Energy curve and the middle
5. Beat tests
6. Endings and payoff
7. Films that differ in structure
8. Structure record

## 1. One claim

- One claim per film, the emotional change (PAGE), and the order of locking (story, frames, style, copy, motion): the `ice-direction` skill, `references/treatment.md` sections 1-3 (the rules only; this file does not restate them).
- Where to read them at stage 02. `ice/plan/TREATMENT.md` does not exist yet: the `ice-direction` skill writes it after the 05 direction round (its step 13). Take the lines from the stage 01 and 02 files that do exist:
  - The claim: the chosen concept's D-entry in `ice/DIRECTION.md` and its card in `ice/plan/concepts.md` (the logline and the hero moment), checked against the `message` row and the `## Intent` section of `ice/BRIEF.md`. When they disagree, the user's words in `ice/BRIEF.md` win and the gap gets a D-entry.
  - The emotional change: the PAGE lines (audience and emotion, where the viewer starts and ends) from the chosen concept card and the `## Intent` section of `ice/BRIEF.md`. When no file states it, write it from those two files, mark it as derived, and log it with a D-entry.
  - Write both into the structure record (section 8); the treatment written at 05 keeps the same claim and emotional change. Never create `ice/plan/TREATMENT.md` at this stage.
- The idea must predict the hero moment. If you cannot name the one frame someone would screenshot and send to a friend, you have a topic, not an idea.

## 2. Structure families

Pick one parent skeleton (two may combine; one leads). The film-type file lists the options with numbers; these families recur across types.

| Family | Shape | Watch-out |
|---|---|---|
| Problem, solution | hook, problem, solution, proof, CTA | the most common shape; never the default |
| Before, after | old state, the bridge, the new state | the bridge must be the product doing something |
| Transformation chain | one element transforms through every beat | the most over-used shape among skilled films; earn it |
| Claim, cut, proof, CTA | type claim, then operation that proves it | a claim made by type is a hook; a claim made by operation is a proof |
| Demonstration of one real task | one operation documented end to end | keep every step real |
| A single held shot that slowly changes | one frame, one evolving state | needs a real turn |
| Stillness that breaks | quiet, then one event | the break must mean something |
| A joke with a character | setup, turn, punchline | the character acts, never narrates |
| A typographic essay | the brand's voice as type | see `film-types/kinetic-type.md` |
| A montage of real output | proof of range as a wall | never a slow tour |
| Discovery story | something works, works badly, you see why, you change direction | honest bridges, not fake drama |
| Reveal, proof, behind the scenes, contrast, accumulation | narrative shapes for brand and story films | start from a tension gap |
| Archetypes by genre | tutorial: intro, setup, steps, gotchas, recap; documentary: thesis, evidence, counterpoint, conclusion; travel or event: arrival, highlights, quiet moments, departure; music: intro, verse, chorus, bridge, outro | teaching films go to ice-explainer |

Write three structure candidates that differ in their central picture idea (one element transforms through everything, one camera move through scale, a before and after split, a chain reaction where each beat starts the next, a physical metaphor, a typographic system), not three stories told with the same cards. ice-direction runs the pitch and critic; this file only checks the structure.

## 3. Beat roles and lengths

Roles: hook, problem, turn, product intro, feature, benefit, proof, social proof, brand, CTA. One clear job per beat.

- Measured role lengths, proof cadence and time skeletons for short and 45-60 s films: the `ice-motion` skill, `references/shot-blueprints.md` section 3.
- Beat length, energetic edit density and scene counts by type: the `ice-motion` skill, `references/anti-slideshow-and-density.md` section 3.
- Brand arrival at the turn: the `ice-motion` skill, `references/seams-and-carry.md` section 6.
- Film-side: at most three proofs in a row unless one object runs through them. Per-type ranges live in `film-types/<type>.md`.

## 4. Energy curve and the middle

- Energy curve (where the strongest frame sits), shot-length variation and bursts: the `ice-motion` skill, `references/anti-slideshow-and-density.md` section 3. A concept without hits (one element transforming, one continuous camera move) is valid.
- The middle fails through equal density: break it with acceleration, proof, a reset, a scale change, a quiet frame, new material or a camera change.
- Rhythm model to find gaps: hook, establish, accelerate, proof, quiet reset, build, payoff, CTA, clean resolve.
- Contrast creates impact: a calm beat makes the next dramatic beat hit harder.

## 5. Beat tests

- Delete test: delete the beat; if the viewer loses no belief, delete it for real.
- "And" test: if the beat's sentence needs "and", split the beat or drop half.
- Purchase test: each beat buys a specific belief ("buys the belief that ..."), never "visual interest". Two beats with the same purchase merge or escalate.
- Causal test: the viewer understands [claim] because [object] visibly changes from [state A] to [state B], causing [next state]. If this cannot be completed from rendered frames, reject the beat; if most primary beats fail, reject the candidate.
- Reorder test: if beats can be shuffled without breaking causality, the sequence is a slideshow.
- Importance budget: mark each beat 1 (connective: fast, small), 2 (supporting) or 3 (the point: slower, larger, held to reading time plus 0.5-1 s, its own sound). At most 25% of beats are 3. Animating every line the same is the top machine tell.

## 6. Endings and payoff

- The payoff reuses earlier visual logic (the recurring line, object, material, type behaviour or camera direction); no brand-new effect at the climax.
- The ending resolves the protagonist into the result, the brand or the CTA; an unrelated CTA card fails; an open ending must be declared.
- The final frame is simpler than the densest middle frame; it clears and holds. One ending is stronger than two.
- Make the final beat the shortest transition and the longest lingering object.
- Hold and CTA numbers by scope: `openers-and-endings.md`.

## 7. Films that differ in structure

Sameness hides in structure, not in surface. Two films for different briefs must not share a skeleton with a new skin.

- Vary across films: rhetorical device, arc, where the turn lands (around 40% is the default; try 15% or 75%), the ending, the climax mechanic, the opening state, copy placement, human presence, sound dramaturgy. Breaking the category expectation twice in the same way is itself a house style.
- Structure fingerprint (concept, scene band, main objects, opening, closing), when two structures count as different, and the 4-of-6 distance rule against templates, demos and earlier films: the `ice-direction` skill, `references/anti-sameness.md` sections 3-4. Write the structure line into `ice/plan/structure.md` and the delivery report; ice-qa measures it.
- The default kit and the template skeleton to avoid: the same file, section 6.
- Canonical components (a title that zooms then exits sideways, three parallel feature tiles, a typed input box, a push-through between scenes, a light leak at a cut, logo plus CTA stacked in the centre as the last scene) appear only when the concept demands them, at most two per film.

## 8. Structure record

Write `ice/plan/structure.md` with: film type; the one claim; the emotional change; the chosen option and two rejected options with reasons; length, aspect, fps; beat list with roles and importance; the energy-curve peak time; the structure fingerprint line.

Sources: AbubakrChan/product-launch-motion, Tejashmakwana/motionmaxxing, heygen-com/hyperframes, bangtutorial/bang-motion, feitangyuan/onetake (ideas), commercial-motion-design (Omar-Tnzxo), imMamdouhaboammar/motion-graphics-skills (ideas only), digitalsamba/claude-code-video-toolkit, browser-use/video-use (archetypes).
