# From brief to treatment

The brief says what the user wants. Research and the rounds say what is possible. The treatment says what this film is, in director's language, so the workflow can storyboard and build without guessing. It is written to `ice/plan/TREATMENT.md` after the direction is approved. This file owns the treatment for every workflow, including a treatment that the `ice-ideas` skill delivers on its own.

Contents: 1 Order of locking, 2 PAGE, 3 The one true thing and the inventory, 4 Motion thesis, 5 Treatment template, 6 Completeness check, 7 Hand-off rules, 8 Companion mode: the ceiling treatment, 9 Unattended runs, 10 Self-check.

## 1. Order of locking

Story, then frames, then style, then copy, then motion. A film styled before its story is locked is a template.

## 2. PAGE: what the film is for

Four lines, written before any effect is chosen; every later decision is judged against them.

| | Question | It decides |
|---|---|---|
| Problem | What true and annoying situation in the viewer's life does this change? (a situation, not a feature) | whether a beat earns its place |
| Audience | Who watches, where, in what state, for how long | pace, density, vocabulary, sound on or off |
| Goal | The one thing the viewer should do, think or repeat afterwards | structure and the ending |
| Emotion | Where the viewer starts and where they end | music, pace, weight, color |

The emotional change is the payload; features are the vehicle. The bigger the distance between start and end, the stronger the film.

## 3. The one true thing and the inventory

- **One claim, one film.** A short film lands one idea. Test: can the claim be said in seven words or fewer, out loud, without a conjunction?
- **Specific beats general**: a real example, a real number from the truth sheet (`ice-assets`), a real time of day. Leaving things out is the point; about 15 s holds 3 to 5 beats and one idea.
- **Brand or subject inventory** (one line each, "none" is an answer): the logo's shape, the core control a user touches, the signature material, the key verb, the success moment, the voice, the color logic, the type, what the brand would never do. The best moment is usually inventory turning into the product's action.
- Keep literal: logo, typefaces, color values and meanings, real UI, real copy, real behavior. Invent: stage, camera, light, metaphor, choreography, sound, drawn in the brand's grammar.

## 4. Motion thesis

One paragraph: the world; what moves and what stays; the recurring continuity device; the dominant transition family; how the brand owns the film; what the film refuses.

Each beat is later solved as three things (by the workflow): its message, its visual mechanism, and what it carries into the next beat. Never jump from script to scenes. In the storyboard every element of a beat then carries its trigger (the script sentence or word that justifies it) and its reason; an element with neither is cut (the `ice-qa` skill, `references/storyboard-lint.md` section 3b).

## 5. Treatment template

```markdown
# Treatment: <project name>
Runtime date: <YYYY-MM-DD>   Direction: D-NN   Concept: D-NN

## PAGE
Problem: ...
Audience: ...
Goal: ...
Emotion: from ... to ...

## Premise
<the concept in the sentence the user accepted>

## Viewer experience
<what expectation is set and how the reveal plays with it; the emotional register named specifically>

## Shape
Narrative job: ...   Tension gap: ...   Device: ...   Arc: ...   Turn at: about <n>%
Hook (0 to 3 s): <what is on screen and heard>
Hero moment: <the frame someone would screenshot>, at about <n>% of the runtime
Payoff and ending: <state; how it reuses earlier visual logic>
Call to action: <once, where, or none>
Pacing and energy: <intensity over time; where the breathers and the climaxes sit>

## Motion thesis
<paragraph from section 4>

## Casting and performance
<who appears: people, hands only, a character, or none; their attitude toward the subject and the listener. Humour, contrast or surprise must be something the viewer can actually experience on screen, never only described>

## Camera language
<one camera language for the whole film, in plain words; grammar from the `ice-motion` skill>

## Direction block
Dials: energy ..., density ..., ground ..., depth ..., camera ..., type ..., texture ..., color ..., subject ..., sound ..., voice ...
Palette: see D-NN (values in DIRECTION.md)
Type: see D-NN
Signature move: <one sentence; where it appears early, middle, end>
Sound lead: <score / sound design / voice / silence> (decided with ice-audio)
Structure line: <concept · scene count · main object per scene · opening · closing>

## Sound intent
<music role, voice casting, the few effects that mean something, or a deliberate silence>

## Title and subtitle intent
<what titles and subtitles do in this film, or none>

## Shot list summary
<per shot: framing, angle, move, duration, why. Films of about 60 s or shorter add a beat sheet by second. The full storyboard lives in ice/plan/storyboard.md, written by the workflow>

## Banned in this film
<brand bans, user dislikes, default-kit items not justified, the typical direction left behind>

## Benchmark
<1 or 2 reference works or styles named from the research, never a mood word: the principle borrowed (never the surface) and what not to take>

## Systems needed
<in plain words: captions, motion graphics, typography, footage, a counting number, a voice, a character, a map, generated material (optional and disclosed), sound; never tool names>

## Identity anchors
<what must stay recognizable across every shot: logo, colors, real UI, real copy>

## Risks and what it is wrong for
<...>

## Open questions
<only real user decisions that block the storyboard; at most 4>

## Required inputs
<only what the user alone can give: their product photos, logo, lyrics, recordings, private data>
```

## 6. Completeness check

The strongest creator prompts converge on the same parts; a treatment that misses one forces the builder to guess:

| Part | Where it lives |
|---|---|
| Inputs (assets, facts, references) | BRIEF.md Assets and the truth sheet |
| Direction with a banned list | Direction block and Banned |
| Structure on a grid or timeline | Shape (the workflow turns it into a beat grid or cue sheet) |
| Build constraints | The workflow and `ice-engines` |
| Known gotchas | Open questions and Banned |
| A start gate (what is shown before the full build) | The workflow's review loop (stills, opening studies) |

Vague mood words ("premium, modern, cinematic") are resolved into tokens and named behaviors before hand-off: exact values, named textures, type direction. Precision is cheap; density in the treatment never hurts the build.

## 7. Hand-off rules

What goes where:

| Document | Holds | Never holds |
|---|---|---|
| `ice/BRIEF.md` | Outcome, audience, platform, claims, CTA, language, references and what to inherit, private assets, hard constraints, reserved choices, budget; the user's own wording where reinterpretation is risky | Implementation; a reference's hook turned into a rule |
| `ice/plan/TREATMENT.md` | The creative answer (section 5) | Package names, tool or provider choice, build order, a second copy of the script |
| `ice/plan/script.md` | Every spoken and on-screen word | Direction notes beyond delivery |
| Reference analysis (owned by the `ice-remake` skill) | Why an old piece works | What the new piece is |

- The treatment is not a storyboard or a script; the workflow writes those in `ice/plan/` from it.
- Fix at the owner: a goal change goes to `BRIEF.md`; a story or design change goes to `DIRECTION.md` and this file; an implementation fix goes to the workflow's plan files. If the result looks wrong because the design was wrong, revise the treatment; if the design is sound but built wrong, repair the build.
- Do not add scenes, narration, music, captions or transitions the request did not call for without proposing the expansion first.
- Keep strong, approved beats between versions; iterate the rest.

## 8. Companion mode: the ceiling treatment

When the user wants to collaborate, arrive as the director, not the contractor. The first treatment is the ceiling: arc, design intent, each scene's motion named, transitions, audio identity or a deliberate silence, the user's material placed, a designed open and close. Flag the expensive layers. The user trims a treatment down; scope still follows section 7 (propose additions the request did not call for before adding them).

## 9. Unattended runs

Execute the chosen direction and, in the delivery notes, list the other directions in one sentence each. State each assumption in one line; never stop for routine questions.

## 10. Self-check

- [ ] Every template field is filled from this brief or says "none"; no slot holds example text.
- [ ] No tool names, providers or build order.
- [ ] Viewer experience and the emotional change are explicit.
- [ ] Motion thesis names what stays still and what the film refuses.
- [ ] Open questions are real user decisions (at most 4); missing material is under required inputs.
- [ ] No spoken or on-screen line exists outside the script.

Sources: Tejashmakwana/motionmaxxing PAGE, inventory and idea rules (Apache-2.0); AbubakrChan/product-launch-motion one claim one film (MIT); lemomo-ai/lemo-opuscar treatment, logline, shot list and benchmark (MIT); heygen-com/hyperframes prompt expansion, boundaries, specification dial and companion-mode ceiling plan (Apache-2.0); echris6/motion-video-kit named benchmark (MIT); edenfunf/reelmimic open questions and required inputs (MIT); alchaincyf/huashu-art-motion unattended runs (MIT); yihui-dev/awesome-opus5-5-videos prompt anatomy (structure only, our own wording); ideas from hypit (brief vs treatment, fix at the owner) and imMamdouhaboammar/motion-graphics-skills (motion thesis, beat as message, mechanism and carry), rewritten.
