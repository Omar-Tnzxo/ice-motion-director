# The four notes files

Read this when writing or resuming the remake notes. Files are the memory: another session must be able to continue from them alone. Rewrite them when the truth changes; they are not logs.

## Layout

```
ice/
  BRIEF.md                         user truth (shared with the router; remake adds the References block)
  DIRECTION.md                     decision log (ice-direction)
  reference/<ref-id>/              reference truth: what the existing piece does
    <the user's file>
    analysis/                      analyze.py output, untouched
    frames/                        frames.py output
    evidence/                      strips and grids worth reopening, descriptive names
    ANALYSIS.md                    why it works (whole piece)
    TIMELINE.md                    what happens when, and what it does for the viewer
    peaks.json                     confirmed climaxes (climax-duel.md)
    sound_map.json                 the ice-audio sound map, when made (read only here)
    STYLE-RECIPE.md, style-recipe.json   the portable recipe (style-recipe.md), exported at stage 10
    PROGRESS.md                    only while reading is unfinished
  plan/                            target truth: what the new piece will be
    TREATMENT.md                   the director's answer
    FIDELITY.md                    salience lock and must-preserve contract (fidelity-contract.md)
    shots.json, storyboard.md      the mapped plan (shot-mapping.md)
  review/remake/                   compare sheets, strips, duel verdicts
  variants/<name>/                 one folder per variant (variants.md)
```

Reference truth and target truth stay separate. One reference can feed several targets without being copied; one target can cite several references.

## The four notes files at a glance

Written at stages 01 and 02, and read on resume.

| File | Holds |
|---|---|
| `ice/reference/<ref-id>/ANALYSIS.md` | Why the reference works: medium, systems, measured numbers, 3-5 keys |
| `ice/reference/<ref-id>/TIMELINE.md` | What happens when and what it does for the viewer; per-shot table |
| `ice/BRIEF.md` (References block) | Rights, mode, function, inherit, replace, avoid |
| `ice/plan/TREATMENT.md` | What the new film is: premise, arc, systems, climax, ending rhyme |

## Which file owns which fact

| A change in... | Goes to |
|---|---|
| The user's goal, facts, claims, constraints, requested replacements | `BRIEF.md` |
| Story, shot logic, visual system, performance, creative approach | `plan/TREATMENT.md` |
| What must be preserved from the reference and what may translate | `plan/FIDELITY.md` |
| Shot timing, camera spec, mapping, prompt or parameter fixes that keep the same design | `plan/shots.json` and the build files |
| New evidence about the reference | `ANALYSIS.md` or `TIMELINE.md`, which may then prompt a Treatment review |

If the film looks wrong because the design is wrong, revise the Treatment. If the design is sound and the build is wrong, repair the build.

## 1. ANALYSIS.md (why the reference works)

```
# Analysis: <ref-id>
Medium: <one of: 2d-painted, 2d-crayon, 2d-vector, 2d-pixel, 2d-paper, 2d-lineart, 2d-cel, 3d-stylized, 3d-photoreal, live-action, screen-ui, mixed>
Mode: <structural fidelity | frame-locked | translation | inspiration | mix>
Kind and function: <MOVES | LOOK | both>

## Whole piece
Promise and hook (first 3 s): ...
Argument or story, attention shifts, payoff, intended viewer response: ...
Emotion arc (wants, obstacle, gets): ...
Opening and ending rhyme, recurring motif, how jokes or surprises are built: ...

## Systems
One block per persistent system (caption, typography, MG, effect, audio, camera, character):
content and look; placement; entry; active behavior; persistence; exit; what it does for the viewer.

## Measured
Shots: count, mean / shortest / longest s, mean beats. Stillness ratio. Cut bursts.
Camera: moving share, kinds, pace mix. Look: low-key share, mean brightness, palette and color arc.
Text-card share. Hero scale at hits. Tempo and first beat. Peaks (see peaks.json).

## Keys to why it works
3-5 lines, each tied to evidence (time + file).

## Reference quality (optional, 0-2 each with a measured reason)
causal clarity, timing and spacing, physical credibility, camera intent, material coverage,
transition ownership, sound coupling. A high count of changes never offsets a zero in clarity or ownership.

## Recipe notes (read by scripts/recipe.py; one line each, mechanisms in words, "unknown" when not seen)
Transitions: <families, and how objects carry across seams>
Type behaviour: <entrance, hold, exit; headline to body size ratio>
Text-card share: <text-only seconds over runtime>
Composition: <framing habit, negative space, hero scale at hits>
Stillness: <only what analyze.py's content-region measure misses, for example what moves during a calm run>
Accent rule: <how many accents, where and when>
Material and light: <material category, texture, light mood>
Typefaces: <headline and body typefaces seen, or the closest named match>
Cursor: <none, or the pointer's style (arrow, hand, text caret, custom), its path and easing, and each click time with what the click does>
Motif and rhyme: <recurring motif, how the ending rhymes with the opening>
Feeling: <t1-t2 s: feeling, cause; ...>
Aspect: <only when the real picture differs from the file, for example 16:9 stored sideways>
Orientation: <only when the picture is stored turned; how to view it upright>
Caveats: <anything a reader of the numbers must know, for example camera kinds that are content motion in a locked frame>

## Open questions
```

The Recipe notes describe mechanisms; they never quote lines of copy or name a person (`style-recipe.md` section 3).

Report this to the user briefly: one table, the 3-5 keys, where the climax is and what it relies on. Step mode: on the 01 review card. Auto mode: it is not a stop; it goes in the delivery note (and in the 06 preview when that stop applies).

## 2. TIMELINE.md (time-located realization)

Sections are named by source time and a phase: `## <start>-<end> · <what happens for the viewer>`. Within each, connect active objects and their behavior to the words, pauses or actions they serve. Keep exact text, colors, positions, motion phases and timings where needed to reproduce the design, plus evidence paths.

Per-shot table (from `shot_details`, one row per reference shot):

| # | in-out s | content | camera kind, pace | light/dark | transition in | spoken idea | sound cue | viewer question | payoff |
|---|---|---|---|---|---|---|---|---|---|

Start each "transition in" cell with the family name (cut, morph, dissolve, wipe, whip, match cut, fade in), then any detail after a comma: `recipe.py` reads the words before the first comma as the family, and a row per detected shot lets it label every analyzer boundary.

Record both the source seconds and the expressive relationship (a reveal answers a question, an exit makes room for the next claim). Never copy a source timestamp into the target plan: the relationship survives, the seconds do not.

## 3. BRIEF.md, References block

The router and the ice-direction skill own `BRIEF.md`. The remake adds, per reference:

```
## References
- <ref-id> | <kind> | mode: <mode> | function: <MOVES | LOOK | both>
  inherit: <what the user wants carried over, in their words>
  replace: <assets that must be swapped: footage, music, people, logo, copy>
  avoid: <what must not be taken>
Rights to use the references are the user's responsibility.
```

Quote the user where reinterpretation could change the request. In a faithful adaptation, relationships the user did not mention inherit from the reference (structure, layer roles, promise and payoff); that is interpretation, not pixel copying. Never turn a reference's hook into a format rule inside the brief.

## 4. plan/TREATMENT.md (the new piece)

Director language, no package names or build order:
- Premise and the viewer experience; what expectation is set and how it is paid off.
- Story movement: hook, reveal, payoff, CTA; jobs of the major passages; pacing.
- Systems the target actually needs and how each requested replacement propagates through them (`adaptation-lenses.md`).
- Which reference supplies which function (with several references: `mixing-references.md`).
- Climax design (from `climax-duel.md`) and the ending that rhymes with it.
- Open creative questions that block specificity.

The Analysis says why the old piece works; the Treatment says what the new one is.

## 5. PROGRESS.md

A short snapshot: live question, what remains, next action, blockers, reusable renders. After an interruption, resume from these files and the existing renders; never redo finished work because context was lost.
