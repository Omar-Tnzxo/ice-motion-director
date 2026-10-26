---
name: ice-motion
description: >
  Motion craft for every Ice Motion Director film and edit: motion grammar and movement jobs,
  measured timing and easing curves, closed-form spring formulas, hold and stillness policies,
  the cut and transition catalog with exact numbers, seam continuity and the carry principle,
  camera moves as punctuation, composition, hero size and the visual richness floor, 2D and 3D motion, shape morphing,
  the cursor as actor, one-take films, anti-slideshow and motion density rules, each scoped
  to the film or edit types where it holds. Called by Ice Motion Director workflows; use only
  when called by name.
license: Apache-2.0
metadata:
  author: Omar-Tnzxo
  version: 0.2.0
---

# Ice Motion: motion craft

This skill decides how things move. It is called by a workflow (ice-film, ice-explainer, ice-remake, ice-edit, ice-lottie) after the brief and direction exist. It writes the motion plan; it never builds or renders.

## 1. What this skill owns and what it points to

| Owns | Points to |
|---|---|
| Movement jobs, motion verbs, cause and effect | Kinetic type, captions, reading time, typing cadence of display type: **ice-type** |
| Durations, easing, staggers, overlap, springs | Music, SFX, voiceover, beat grids, word timing: **ice-audio** |
| Hold policy (alive, camera-only, true still, no idle) | Gates, seam verification, frame scans, density measurement: **ice-qa** |
| Cut and transition catalog, transition policy | Engine syntax, render, shutter capture, platform safe zones: **ice-engines** |
| Seams, carry, vector law, handoffs | Art and drawing styles, character rigs, narration grammars: **ice-styles** |
| Camera, composition, hero size, staging light, the richness measures | Palette, type pairing, anti-sameness fingerprints, decision log: **ice-direction** |
| 2D, 2.5D and 3D motion; physics; morphing; loops | Arabic and right-to-left letterforms and directions: **ice-arabic** |
| Cursor and UI demonstration motion inside films | Shipping app and site UI motion, Lottie, logo vector prep: **ice-lottie** |
| Move deck, atomic moves, shot blueprints | Asset truth, real UI capture, logos: **ice-assets** |

Point to other skills by name; never restate their rules.

## 2. Procedure when called

1. Read the brief slots (film or edit type, platform, aspect, duration, language, register, brand words) and the direction log. If the type is missing, ask the workflow, do not guess.
2. Open `references/motion-language-by-type.md` and set the film's motion language: hold policy, transition policy, camera policy, overshoot policy, clock and blur grammar, pace. Apply the industry and brand personality presets only where the brief is silent.
3. Write the motion personality: one metaphor plus 3-5 rules (`references/motion-grammar.md` section 8). Several varied examples exist there; never copy one.
4. Deal the motion palette: 3 core moves, at most 2 accents, at most 1 signature, avoiding the previous film's core moves (`references/move-deck.md`, `references/anti-slideshow-and-density.md` section 6).
5. For every beat, write its movement job and verb, timing and ease, and its importance level (`references/motion-grammar.md`, `references/timing-and-easing.md`, `references/measured-motion.md`).
6. For every boundary, write a seam row with the carrier, exit and entry vectors and the reason (`references/seams-and-carry.md`, `references/transition-policy.md`, `references/cut-catalog.md`).
7. For every camera move, write its reason and window (`references/camera.md`).
8. Check the plan against the anti-slideshow rules and the density targets for the type (`references/anti-slideshow-and-density.md`), and against the visual richness floor: read the floor numbers from the film type's "Richness floor" table (the ice-film workflow's `references/film-types/<type>.md`) and the measures and fixes in `references/composition-and-staging.md` section 7. A shot below the floor is re-staged before anything is built.
9. For commercials, product journeys and no-voice-over text-led films, also write the machine-checkable motion contract (shape: `assets/motion-contract.example.json`; doctrine: `references/continuous-journey.md`) and run `python scripts/validate_motion_contract.py ice/plan/motion-contract.json --project-root .` until it prints PASS. Hand the plan to the workflow; ice-qa verifies the render. Three things the validator checks literally:
   - References: three role-specific references with decomposition notes. When the dated research found no reference you could actually watch, write `"references": []` (or the ones you have) plus `"referencesWaiver": {"reason": "<what was searched, why none is watchable>", "researchNote": "ice/research/<note>.md"}`; never point a reference at a note that describes a film you did not see.
   - Lineage: across each boundary it compares ids, not pictures: `transition.semanticId` of the outgoing scene must equal `entry.semanticId` of the next scene, so give the carried object the same `semanticId` on both sides. That the picture really carries is judged on the render by ice-qa and the reviewer.
   - Generic verbs (slide, grow, scale, float and the rest of its list) fail unless the object literally is that mechanism; then add `"literalMechanism": "<the real mechanism in one sentence>"` to that `primaryMotion` or text unit.
10. Log every motion decision with its reason and source through ice-direction (`ice/DIRECTION.md`).

## 3. Universal laws (hold in every type)

1. Every movement does a job (direct attention, carry continuity, show change, express character) or it is cut.
2. Motion follows meaning: flows flow, builds assemble, countdowns tick, routes draw in their direction, numbers count while their cause changes.
3. One focal motion at a time; supporting elements wait, the focal one never waits.
4. Entrances decelerate, exits accelerate, on-screen moves ease in and out, impacts accelerate into contact; never linear for spatial moves unless mechanical; never one ease on everything (at least 3 easing characters per film).
5. Exits are faster than entrances; entries use 2-3 decaying channels, never opacity alone; never grow from zero.
6. Staggers stay under about 0.5 s per group, irregular, in order of importance; offsets shorter than the moves they offset.
7. Contrast is the message: vary speed (slowest scene about 3x the fastest), shot length, density and stillness; spend scale, effects and accents once.
8. Something crosses every boundary: a carried object, a matched vector, the voice or the beat; scene A's exit decides scene B's entry (same axis, direction, speed).
9. The camera is punctuation: it moves for one named reason, slow for transitions, fast only for accents, never three pushes inward in a row.
10. Holds are decisions: the film's hold policy is chosen by type and applied everywhere; a scene that runs out of content is shortened or given story, never wobble.
11. Every frame is a pure function of time: closed-form springs, seeded randomness, no wall clock, no stateful solvers.
12. Effects never compensate for weak layout, weak poses or missing evidence.

## 4. Conflicts resolved by scope (summary)

| Question | Answer by type | File |
|---|---|---|
| What moves during a hold? | Alive (launch, app ad, social, hype), camera only (explainer, talking-head, data, long-form), true still as punctuation (brand, art rests, kinetic rests, comedy), no idle (UI walkthrough, narrated launch) | `references/holds-and-stillness.md` |
| Crossfades? | Banned between scenes in launch, app ad, hype, kinetic, collage, music-led, social; allowed as "this continues" in calm brand, art, long-form, podcast, chart-to-chart | `references/transition-policy.md` |
| Hard cuts? | About 95 percent of changes in edited footage, explainers and collage; in camera-is-the-editor films only on a downbeat, at most twice | `references/transition-policy.md` |
| Overshoot? | None for data, finance, health, luxury, camera, text; tiny for launch and UI; one spring per consumer film; playful only for kids and mascots | `references/timing-and-easing.md` |
| Exits on non-final scenes? | Banned where the transition is the exit (assembled launch films); short accelerating exits or demote-in-place in narrated explainers | `references/transition-policy.md` |
| Fill the frame or big empty ground? | Fill (business spots, explainers, every vertical ad) or about 70 percent textured ground (minimal genre references, calm brands, landscape only): choose by reference genre and register. Either way the type's richness floor holds; "premium" subtracts clutter, never fullness | `references/composition-and-staging.md` sections 2 and 7 |
| Camera during holds? | Slow push 3-6 percent (policies A and B); locked (C and D) | `references/camera.md`, `references/holds-and-stillness.md` |

## 5. Output contract: the motion plan

The workflow stores it as `ice/plan/motion-plan.md`. Fill every slot; slots are placeholders, never example values.

```
## Motion language
type: <film or edit type> | hold policy: <A|B|C|D> | transitions: <primary + accents> | camera policy: <...>
overshoot: <none|tiny|one spring|playful> | clock: <fps, smooth or stepped> | blur grammar: <smear|crisp|shutter>
personality: <one metaphor> + <3-5 rules>
palette: core <move, move, move> | accents <move, move> | signature <move or none>
richness: hero_share <n> | hero_width <n or n/a> | frame_fill <n of 16> | empty_half <s> | depth_layers <n> | in_shot_motion <n percent> | longest_still <s> | light_events <n> | real_material <percent or n/a> (floor numbers from the film-type file)

## Beats (one row each)
| t in-out | beat role | importance 1-3 | focal element | job | verb | ease | duration | stagger | buys |

## Seams (one row per boundary)
| cut t | out motion (axis, direction, speed, blur) | seam type | in motion | carrier | ease pair | cue | reason |

## Camera windows
| from | apex | dwell end | to | target | move | reason |
```

## 6. Files

| Need | Open | When |
|---|---|---|
| Set the motion language for a type, industry or brand | `references/motion-language-by-type.md` | First, every time |
| Decide whether and why something moves; verbs; cause and effect; personality | `references/motion-grammar.md` | Planning every beat |
| Durations, ease direction, staggers, overlap law, overshoot policy, timing anchors | `references/timing-and-easing.md` | Timing every beat |
| Measured human numbers and the 12 fitted eases | `references/measured-motion.md` and `scripts/measured-eases.mjs` | Launch, app ad, UI, hype; matching a reference move |
| Spring formulas, damping guide, preset families, named cubic-bezier curves | `references/springs-and-curves.md` and `scripts/springs.mjs` | Any spring or custom curve |
| What happens during holds; end holds; freezes; loops | `references/holds-and-stillness.md` | Before any hold or ending |
| Exact construction of a cut or transition | `references/cut-catalog.md` | Building a seam |
| Which transition, how many, crossfade and exit policy, seam plan fields | `references/transition-policy.md` | Choosing seams |
| Carry, vector law, handoff contracts, tolerances, root protagonist | `references/seams-and-carry.md` | Every boundary |
| One-shape, one-world and one-actor films | `references/one-take-films.md` | The direction calls for a continuous film |
| Camera reasons, rig rules, move durations, shake, density limits | `references/camera.md` | Any camera move |
| Focal point, hero size, layers, layout, staging, staging light, the visual richness floor (section 7) | `references/composition-and-staging.md` | Framing every shot; checking the plan in step 8 |
| 2D vs 2.5D vs 3D, parallax, depth of field, 3D flight values | `references/depth-and-3d.md` | Depth or 3D beats |
| Slideshow failure modes, rhythm, density targets, spending rules | `references/anti-slideshow-and-density.md` | Reviewing the plan |
| Animation principles as engineering, physics recipes, morphing, draw-on, loops | `references/physics-and-morphing.md` | Physical or morphing beats |
| Cursor, click, drag, toggles, agent states, UI demo recipes | `references/cursor-and-ui.md` | Any UI demonstration |
| Small moves with value tables and an intent picker | `references/atomic-moves.md` | Choosing a move for one beat |
| 46-card move deck, refused names, mechanism catalogs | `references/move-deck.md` | Dealing the motion palette |
| Time-coded blueprints, shot constructions, time skeletons | `references/shot-blueprints.md` | Planning a shot sequence |
| Frame clocks, blur grammars, when to motion-blur, grain | `references/motion-blur-and-clock.md` | Setting the clock and blur |
| One root protagonist, state chain, inheritance channels, hard-cut records, text that acts, closure (founder's original) | `references/continuous-journey.md` | Commercials and product journeys |
| Physical decision contract, throw, attraction, rigid UI closure, sound by motion phase (founder's original) | `references/motion-choreography.md` | Physical or causal beats |
| Frame and text focus-unit contracts, camera necessity test, camera verbs, 2D anchor formula (founder's original) | `references/semantic-camera.md` | Every camera decision in commercials |
| Motion contract shape | `assets/motion-contract.example.json` | Writing a motion contract (values are illustration only) |

Scripts (Windows, macOS, Linux). Minimum Node and Python versions: `runtimes` in the `ice-engines` skill's `references/versions.json`; Python packages: `scripts/requirements.txt` (exact pins in sync with `versions.json`).

| Script | Runtime | Use |
|---|---|---|
| `node scripts/measured-eases.mjs [ease] [samples]` | Node | Print or import the 12 measured eases |
| `node scripts/springs.mjs [w z seconds]` | Node | Print or import closed-form springs and settle times |
| `python scripts/validate_motion_contract.py <contract.json> [--project-root <folder>]` | Python, standard library | Strict causal, temporal, disclosure, lineage, camera and sound contract gate; exit 1 lists failures |
| `python scripts/audit_web_section_motion.py <project folder>` | Python, standard library | Rejects animated-web-section code patterns (exit 1) |
| `python scripts/audit_motion.py --video <mp4> --audio <wav>` | Python with numpy and opencv-python-headless | Audio onsets and visual-change density versus a reference; a diagnostic, not a verdict |

The founder's files carry the note "From the founder's commercial-motion-design skill".
