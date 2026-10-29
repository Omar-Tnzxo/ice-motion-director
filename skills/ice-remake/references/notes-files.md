# The remake notes files

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
    REASONS.md                     why each element appears: trigger, meaning, target, in and out (section 6)
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

## The notes files at a glance

Written at stages 01 and 02, and read on resume.

| File | Holds |
|---|---|
| `ice/reference/<ref-id>/ANALYSIS.md` | Why the reference works: medium, systems, measured numbers, 3-5 keys |
| `ice/reference/<ref-id>/TIMELINE.md` | What happens when and what it does for the viewer; per-shot table |
| `ice/reference/<ref-id>/REASONS.md` | Why each element of the reference appears (section 6); required for every reference |
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

## Finishing layer (measuring.md section 9; read by scripts/recipe.py)
| Effect | Where | How much | Measured how | Why |
|---|---|---|---|---|

## Keys to why it works
3-5 lines, each tied to evidence (time + file).

## Reference quality (optional, 0-2 each with a measured reason)
causal clarity, timing and spacing, physical credibility, camera intent, material coverage,
transition ownership, sound coupling. A high count of changes never offsets a zero in clarity or ownership.

## Recipe notes (read by scripts/recipe.py; one line each, mechanisms in words, "unknown" when not seen)
Content type: <what kind of piece the reference is: news, ad, explainer, music video, documentary, tutorial, talk, trailer, or another named kind>
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

## 6. Element reasons (REASONS.md)

Owner decision, 2026-10-29: an element copied from a reference without its reason makes a blind copy. Every reference, in every mode, gets `ice/reference/<ref-id>/REASONS.md`: one row per element, saying what switches it on, what it means, who or what it is on, when it comes and goes, and why it looks the way it does. It is written at stage 01 during the watching passes (`watching.md` section 2, pass 8) and the measuring passes (`measuring.md`), and it is reference truth only: how the new film uses an element is decided in the plan (`shot-mapping.md` section 1).

**What counts as an element.** Anything the viewer sees or hears that marks something, read from the reference itself: on-screen text of every kind (headlines, keywords, captions, name straps, datelines, credits, counters), shapes, circles and discs, frames and boxes, cutouts and silhouettes, dimming or highlighting of a person, maps, icons and logos, colour washes and tints, transitions, punch-ins and reframes, and sounds that mark an element (a hit, a whoosh, a riser tied to it). One row per kind of element, not per appearance: the instances cell lists the appearances. A kind seen once still gets a row. Persistent chrome (a logo bug, a progress bar) gets a row whose trigger kind is `always`.

```
# Element reasons: <ref-id>
Sources: <transcript file, frame folders, strips and measures used>

| # | Element | Trigger kind | Trigger instances (words or cue, with time) | Meaning | On whom or what (role) | In (cue, time) | Out (cue, time) | Why this colour and shape | Evidence |
|---|---|---|---|---|---|---|---|---|---|
```

| Column | Holds |
|---|---|
| Element | What it is, in plain words: kind, look and position |
| Trigger kind | What in the words switches it on, as a mechanism. Illustration only, several kinds: a person or group is named; a number is said; a list is spoken; a question is asked; a written source is quoted; a place is named; a new speaker starts; a section turns. In a passage with no speech: the beat, action, cut or sound that switches it on. `always` for persistent chrome. A reference with no time axis (an image set, a static page): the role the element plays in the composition |
| Trigger instances | Two or three appearances with the exact words (or the cue) and their time from the word-level transcript (`watching.md` section 5); `static` for a reference with no time axis |
| Meaning | What the element tells the viewer at that moment |
| On whom or what (role) | The role it lands on (the speaker, the people talked about, a quoted source, a place, the product, the whole frame), never only a name. When the reference marks people (dimmed, silhouetted, circled, targeted, highlighted), record which role is marked and which role stays lit. In the new film the speaker or guest stays lit and clear: `ice-edit/references/layers-and-isolation.md`, section "The speaker stays lit" |
| In, Out | The cue and the time it arrives and leaves (on the word, a fixed delay after the shot starts, at the next phrase, on a cut) |
| Why this colour and shape | What the colour, shape, size and texture signal, tied to the reference's own system (its accent rule, its type system, its finishing layer) |
| Evidence | Frame files, strips and transcript lines that show it |

**When a reason cannot be read.** Any cell that the evidence does not settle says `unknown: <what would settle it>` (a denser strip around one appearance, the transcript of that passage, a second appearance, the sound map's effect at that time). An element whose trigger kind or meaning is still unknown at the end of stage 01 goes into the "Open questions" of `ANALYSIS.md`, and it does not carry over to the new film (`shot-mapping.md` section 1).

**Done when.** Every element seen in passes 1, 3, 4 and 6 of `watching.md` has a row; every cell is filled or says `unknown: ...`; a sound effect that the sound map places on an element sits in that element's row. Who reads it: the shot mapping and the fidelity contract (`shot-mapping.md`, `fidelity-contract.md`), the style recipe (`style-recipe.md`), the ice-edit workflow when it runs this analysis, and the element-reasons check of the `ice-qa` skill.
