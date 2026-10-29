# From brief to treatment

The brief says what the user wants. Research and the rounds say what is possible. The treatment says what this film is, in director's language, so the workflow can storyboard and build without guessing. It is written to `ice/plan/TREATMENT.md` after the direction is approved. This file owns the treatment for every workflow, including a treatment that the `ice-ideas` skill delivers on its own.

Contents: 1 Order of locking, 2 PAGE, 3 The one true thing and the inventory, 4 Motion thesis, 5 Treatment template, 6 Completeness check, 7 Hand-off rules, 8 Companion mode: the ceiling treatment, 9 Unattended runs, 10 Self-check, 11 Craft plan (dimensions, the run file, decision rules, when per route, defaults per video type, content triggers, precedence and exemptions, checks, plain words to the user).

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

## Craft plan
<in plain words, one line per craft dimension used (what, where, why) and one line naming the dimensions not used with their reasons; the full rows live in ice/plan/craft-plan.json (section 11); never tool names>

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
| Every craft the content calls for, decided per dimension | The craft plan (section 11) and its Craft plan line |

Vague mood words ("premium, modern, cinematic") are resolved into tokens and named behaviors before hand-off: exact values, named textures, type direction. Precision is cheap; density in the treatment never hurts the build.

## 7. Hand-off rules

What goes where:

| Document | Holds | Never holds |
|---|---|---|
| `ice/BRIEF.md` | Outcome, audience, platform, claims, CTA, language, references and what to inherit, private assets, hard constraints, reserved choices, budget; the user's own wording where reinterpretation is risky | Implementation; a reference's hook turned into a rule |
| `ice/plan/TREATMENT.md` | The creative answer (section 5) | Package names, tool or provider choice, build order, a second copy of the script |
| `ice/plan/script.md` | Every spoken and on-screen word | Direction notes beyond delivery |
| `ice/plan/craft-plan.json` | One row per craft dimension with its decision, reason, source and check, and the exemption rows (section 11) | A row without a source; a device no content, reference, style or type default calls for |
| Reference analysis (owned by the `ice-remake` skill) | Why an old piece works | What the new piece is |

- The treatment is not a storyboard or a script; the workflow writes those in `ice/plan/` from it.
- Fix at the owner: a goal change goes to `BRIEF.md`; a story or design change goes to `DIRECTION.md` and this file; an implementation fix goes to the workflow's plan files. If the result looks wrong because the design was wrong, revise the treatment; if the design is sound but built wrong, repair the build.
- Content additions the request did not call for (scenes, narration, claims, on-screen copy) are proposed before they are added. Craft that serves the approved content (music, captions, transitions, sound, camera, depth, finishing) is the director's job: it goes into the craft plan (section 11) without waiting for the user to ask, and the delivery note lists it.
- Keep strong, approved beats between versions; iterate the rest.

## 8. Companion mode: the ceiling treatment

When the user wants to collaborate, arrive as the director, not the contractor. The first treatment is the ceiling: arc, design intent, each scene's motion named, transitions, audio identity or a deliberate silence, the user's material placed, a designed open and close. Flag the expensive layers. The user trims a treatment down; scope still follows section 7 (content additions the request did not call for are proposed before they are added; craft that serves the approved content goes into the craft plan, section 11).

## 9. Unattended runs

Execute the chosen direction and, in the delivery notes, list the other directions in one sentence each. State each assumption in one line; never stop for routine questions.

## 10. Self-check

- [ ] Every template field is filled from this brief or says "none"; no slot holds example text.
- [ ] No tool names, providers or build order.
- [ ] Viewer experience and the emotional change are explicit.
- [ ] Motion thesis names what stays still and what the film refuses.
- [ ] Open questions are real user decisions (at most 4); missing material is under required inputs.
- [ ] No spoken or on-screen line exists outside the script.
- [ ] The Craft plan line matches `ice/plan/craft-plan.json`: every dimension of section 11 has a row, and no row rests on a banned reason.

## 11. Craft plan

Founder decision, 2026-10-29 (`AGENTS.md` rule 20): every video uses every craft its content, type, scenes, speech, reference and style call for, without the user naming a technique. A one-line prompt and a long brief are weighed against the same list of crafts; prompt length changes who decides, never which crafts are considered. The craft plan makes this one decision per craft dimension, each with its reason and source, so a craft is never left out because nobody asked for it and never added as a reflex. This section is the one home of the craft plan, the per-type craft defaults, the content triggers, the precedence order and the exemption rows. Every other file points here in one line and never restates them.

### 11.1 Craft dimensions (closed list, one row each)

| Code | Dimension | Includes |
|---|---|---|
| `camera` | Camera | Moves, holds, digital reframes, push and pull, drift, the return from a cutaway |
| `depth` | Depth | 2.5D planes, parallax, card fields, push-through, real 3D, text in depth |
| `composite` | Compositing | Separation, mattes, contact and cast shadows, light wrap, edge match, keying quality |
| `light` | Light and focus | Light events, key and rim, relight of a keyed subject, depth of field, background defocus, glow from a source |
| `finish` | Grade and finishing | The film grade, a grade per source class (outside material), grain, texture, vignette, motion blur, halation, print texture |
| `type` | Type and captions | Kinetic type, captions, keyword emphasis, voice-coloured captions, name supers |
| `transition` | Transitions | Cut policy, carried transitions, meaning-led specials (flash, match, whip, dissolve, wipe, zoom-through) |
| `data` | Data, maps, counters | Counters, charts, maps and routes, timelines, list builds |
| `cutout` | Cutouts | Person or product cutouts, text behind a person, depth sandwich, the speaker receding as a back plane |
| `sfx` | Sound effects | Action, cut, card and UI sounds; archive-cut booms; sub or air under speech |
| `music` | Music | Track choice, edit to picture, bed level, duck or no duck, ending on the cut |
| `ambience` | Ambience | Room tone, location and city beds; never digital silence under speech |
| `foley` | Foley | Material sounds of physical actions on screen |
| `silence` | Silence | Designed silences, the dip before the key line, the end silence |
| `voice` | Voice | Diagnosis, cleanup (noise, hum, boom, sibilance), separation from music, the voice chain |
| `rhythm` | Rhythm and hook | Pace, shot length, event gaps, the first 3 s, the reference's pace |
| `footage` | Real material | Real footage, captures, photos, documents for real events, places, people and products |
| `identity` | Identity | Logo, fixed marks, programme or series bug, name plates, end card, brand colours |

A device sits in the row of the dimension it serves. What the treatment template once listed as "systems needed" are devices of these rows (illustration only, several kinds: captions under `type`; a counting number or a map under `data`; real captures under `footage`; a recorded voice under `voice`; a contact shadow under `composite`). A character or an illustration is a device of the row it serves; generated images, video or voice stay optional, started only by the user and disclosed (the ice-assets skill, `references/ai-media-policy.md`).

### 11.2 The run file `ice/plan/craft-plan.json`

The director writes it, the workflow maps it, the `ice-qa` gates read it.

```json
{
  "type": "<film or edit type>", "route": "<route>", "style": "<catalog id or none>", "reference": "<path or none>",
  "stage": "02 | 04 | 05", "locked": false,
  "style_needs": ["<code>"], "style_never": [{"dimension": "<code>", "reason": "<from the profile>"}],
  "rows": [{
    "dimension": "<code>", "decision": "use | not_use | scoped", "devices": ["<device>"],
    "where": ["<shot, scene, cue or event id>", "film"], "amount": "<number with a unit, floor value or reference value>",
    "trigger": "<content that calls for it, or 'type default'>", "reason": "<why it serves the video>",
    "source": "<user | reference | style | content | type, with file:line, reference row, profile line or the user's quoted words>",
    "check": "<script or critic item>", "evidence": "<filled at 07 and 09>"
  }],
  "exemptions": [{
    "id": "X-01", "lifts": ["<gate>:<rule id>"], "element": "<what is on screen or in the mix>",
    "source": {"kind": "user | reference | style | content", "ref": "<file and row, profile line, D-entry id, or quoted words>"},
    "shots": ["<shot ids or time ranges as 'a-b' seconds>", "all"],
    "amount": {"measure": "<name>", "value": "<value>", "tolerance": 0.10},
    "reason": "<what it means and why it is right here>", "stage": "04 | 05 | 07"
  }]
}
```

- `type` is the `subtype` of `ice/state.json`; `style` is the chosen style's catalog id from 05 (`none` before 05 or when no catalog style carries the film); `reference` is the reference folder in `ice/reference/` or `none`.
- `stage` is the last stage that wrote the plan; `locked` turns `true` at 05 and goes back to `false` only when 01 to 05 reopen.
- `style_needs` and `style_never` are copied at 05 from the chosen style's craft profile (the ice-styles skill, `references/style-method.md`, "Craft profile"): a `needs` item becomes a `use` row, a `needs` item marked `scoped:` a `scoped` row with its limit, a `serves when` item gives the `devices` of the row its content trigger decides, a `never` item (the whole dimension excluded by the medium) a `not_use` row, and every `lifts <gate>:<rule id>` an exemption row with `source.kind` `style` (11.7).
- `devices` are named as the owner file of the dimension names them (11.5, last column). `where` holds the ids stage 04 writes: storyboard rows tagged `craft:<code>` in their `Tags` cell (`ice-film`, `ice-explainer`, `ice-ideas`), `craft` on the rows of `ice/plan/shots.json` (`ice-remake`), `craft` on the scenes and events of the edit `plan.json` (`ice-edit`), state ids (`ice-lottie`); `film` covers the whole video.
- `amount` is a number with its unit, the floor value of the type file, or the reference value; `source` names its level of 11.7 (`user` 2, `reference` 3, `style` 4, `content` 5, `type` 6) with its pointer, and a hard rule (level 1) behind a `not_use` is quoted in `reason`; `check` names the script or the critic item that verifies the row; `evidence` is filled at 07 and 09 by the build check, never by hand without a measure.
- The `camera` row may carry `idle_max_s`, a number in seconds (optional): the longest run inside a shot with no visible change. A camera move, a cut, a declared event (the edit plan's `events`, the cue times of `ice/plan/cue-sheet.json`, a `<render>.events.json` beside the render) or a text or card box appearing or leaving resets the run. `craft_gate.py build` takes the limit from `idle_max_s`, else from the reference's measured value when there is one, else 5 s for speaker edits; it never reads the limit from the free-text `amount`.

`ice/DIRECTION.md` logs the plan once as the major decision "Craft plan" (`references/decision-process.md` section 1) and mirrors every exemption row in its "Craft exemptions" table. That entry is also the logged reason the finishing layer asks for (the ice-motion skill, `references/motion-blur-and-clock.md` section 6), so finishing never depends on a reference being present.

### 11.3 Decision rules

- **Every code of 11.1 has exactly one row.** The default decision is `use` wherever the dimension serves the content: the type defaults (11.5) say where it is used without a trigger, the content triggers (11.6) where the content switches it on.
- **`use`** names a trigger, a reason, a source and a check, and from 04 on at least one `where` id that exists in the storyboard, the shots or the edit plan.
- **`scoped`** is a use with a limit that a rule sets, with the same fields (illustration only, several kinds: depth spent on a few beats in a flat direction, the ice-motion skill, `references/depth-and-3d.md`; depth by gap and overlap in a paper style; a cap a hard rule sets).
- **`not_use`** needs a reason with a source, one of: no trigger in the content (name what was looked for and where), the type policy (file and section), the style profile's `never` (file and line), a hard rule, or the user's own words (quoted).
- **Banned reasons.** Never accepted, compared case-insensitively after trimming: "not asked", "not requested", "user did not ask", "not in the brief", "keep it simple", "to save time", "not needed" with no source, and an empty string. A row that rests on one of them fails the plan check.
- **The style's needs are used.** A code in `style_needs` is `use` or `scoped`, never `not_use`; a code in `style_never` is `not_use` with the profile's reason.
- **A reference wins on what it measures.** A dimension the reference measures is `use` at the measured amount; it is `not_use` only with a reason that starts with "content conflict:" and names the conflict. The skin follows the identity choice (lesson L7; the ice-remake skill, `references/rights-and-modes.md` section 1). A measured value is a target, not only a permission: what the reference has is carried (lessons L9 and L12).
- **Never asked, never silent.** The plan is the director's job. It is decided, logged and reported (11.9); a dimension is never left out because the user did not name it.

### 11.4 When: drafted, mapped, locked and checked per route

| Route | Draft (content-led rows) | Mapping (`where`) | Lock (style-led rows) | Plan check | Build check |
|---|---|---|---|---|---|
| `ice-film` | 02 with the concept | 04 storyboard rows tagged `craft:<code>` | 05 with the style frames | The later of 04 and 05, then 06 | 07, 09 |
| `ice-explainer` | 02 with the angle | 04 segments and storyboard | 05 | 04 to 06 | 07, 09 |
| `ice-remake` | 01, from the reference measurement: every measured dimension is a row | 04 shot mapping (`ice/plan/shots.json` rows carry `craft`) | 05 look locked to the reference | 04 to 06 | 07, 09, with the climax duel |
| `ice-edit` | 02 edit approach, from the transcript and the footage diagnosis | 04 B-roll and overlay plan (`plan.json` scenes and events carry `craft`) | 05 grade and caption style | 04, then 06 on the rough cut | 07, 09 |
| `ice-ideas` | 02 with the chosen concept | 04 storyboard | 05, only when frames are drawn | 04 | None: the hand-off carries the plan to the build route |
| `ice-lottie` | 02, with the dimensions a product asset has (the sound rows and `footage` are `not_use`, reason: the route makes a silent, drawn product asset, `ice-lottie/SKILL.md` section "Spine stages", row 08) | 04 states | 05 | 04 | 07 |

- The draft holds the content-led rows: the type defaults and the triggers found in the script, the transcript, the shot list and the brief. Mapping fills `where`. The lock adds the style-led rows (`style_needs`, `style_never`) and sets `locked`.
- Micro jobs keep the plan: one condensed pass at the brief and look step, and every row still exists.
- A reopening of 01 to 05 makes the plan stale: the triggers, the `where` ids and the lock are checked again (the router's `references/state.md`, "Mid-run redirect").

### 11.5 Defaults per video type

Codes: **U** used by default; **T** used when its trigger is in the content (11.6); **S** the chosen style decides (its craft profile); **R** the reference decides and the type default fills the rest; **N** not by default, with the reason in the cell. The numbers (floors, policies, amounts) live in the owner files of the last column and in each film or edit type file; this table only says whether the dimension is on.

| Dimension | Ads and launches (product launch, app ad, social short, hype promo, industry spot) | Brand, art, music video | Data story, explainer | Kinetic type, logo sting | UI walkthrough | Speaker edits (talking-head ad, podcast, long-form, news reel) | Shorts and reels | Footage-led edits (B-roll overlay, showreel) | Remake | Owner of the numbers |
|---|---|---|---|---|---|---|---|---|---|---|
| camera | U (hold policy A) | S (policy C allowed) | U (policy B creep) | T (one push, or locked) | U (to the active element; locked while typing) | U (a visible change every 3 to 5 s on a single take over about 8 s; push on the stressed noun; return from a cutaway inside a pull-out) | U | S (the clip's own motion carries) | R | The ice-motion skill, `references/camera.md` section 2 and `references/holds-and-stillness.md` section 1; the type file's camera policy during holds |
| depth | U (floor 3 layers; a card field when several items are named) | U (floor 2 to 3; a flat style takes depth by overlap and atmosphere) | U (floor 2; a card field for named items; real 3D for a physical or spatial idea) | T | U (UI planes, defocused ground) | T (a separable person and a peak word, or several items named together) | T | T (parallax on stills) | R | The ice-motion skill, `references/depth-and-3d.md`; the type file's richness floor (`depth_layers`) |
| composite | U whenever anything is composited: contact and cast shadows, light wrap, edge match | U | U | U | U | U (mask quality, the shadow of a keyed person) | U | T | R | The ice-edit skill, `references/layers-and-isolation.md` sections 1 to 3; the ice-motion skill, `references/composition-and-staging.md` section 6 |
| light | U (light events floor; a key on the product hero; depth of field on the hero) | U | T (a light event per section; focus on the active card) | T (one sweep) | T (defocused ground) | U (background defocus under a matte when the background is as sharp as the face; a keyed person relit to the set; never on the speaker while speaking) | T | N (footage as shot, unless the style or the reference treats it) | R | The ice-motion skill, `references/composition-and-staging.md` sections 6 and 7 (`light_events`) and `references/depth-and-3d.md` section 3 |
| finish | U (the film grade at 05; grain or none by the type's register) | U | U | U | U (clean digital, grade only) | U (grade the plate and the room, the person untouched; outside material gets one "from elsewhere" treatment) | U | U (one grade per source class) | R | The ice-motion skill, `references/motion-blur-and-clock.md` sections 5 and 6; `references/color.md` of this skill; the ice-edit skill, `references/ingest-and-ledger.md` section 5 |
| type | U | S | U | U | U | U (captions; a second hue for a second audible voice; a name super at a speaker's first on-screen appearance) | U | T | R | The ice-type skill, `references/captions-system.md`, `references/caption-styles.md` and `references/kinetic-type.md` |
| transition | U (type policy) plus T specials | S | U plus T | U | U | U plus T | U plus T | U | R | The type file's transition policy; the ice-motion skill, `references/transition-policy.md` and `references/cut-catalog.md` |
| data | T | T | U (data story) / T (explainer) | T | T | T | T | T | R | The type file; every number from the ice-assets truth sheet |
| cutout | T (a product with a clean silhouette) | S | T | T | T | T (one to three moments per video; the news reel layout uses it throughout) | T | N (no separable subject by default) | R | The ice-edit skill, `references/layers-and-isolation.md` sections 2 and 5; the ice-type skill, `references/depth-and-embedded-captions.md` |
| sfx | U (type density) | U | U | U | U (key ticks, clicks) | U (meaningful moments; sub or air under speech) | U | N for a showreel (the track carries) / U for a B-roll overlay, on visible actions | R | The ice-audio skill, `references/sfx.md` sections 3 and 4 |
| music | U | U | U (a steady bed, or none, by the speech) | U | U | T (a quiet bed by the speech; long-form and podcast may run without) | U | U for a showreel / N for a B-roll overlay (the host's track) | R | The ice-audio skill, `SKILL.md` sections 3 and 5 and `references/mix-and-master.md` section 3 |
| ambience | T | U (art film) / T | T | N (abstract) | N (UI) | U (room tone; never digital silence under speech) | T | T | R | The ice-audio skill, `references/mix-and-master.md` section 4 |
| foley | T | T | T | T | T (device sounds) | T | T | T | R | The ice-audio skill, `references/sfx.md`; the style's sound line (the ice-styles skill, `references/style-method.md` section 12) |
| silence | U (one designed silence before the reveal or the key line) | U | U | U (before the thesis) | T | U (the dip before the key line) | T (never in the first 3 s) | T | R | The ice-audio skill, `references/mix-and-master.md` section 4 |
| voice | T (the voiceover chain when there is a voice) | T | U | T | T | U (diagnosis at intake; cleanup by symptom) | U | T | R | The ice-audio skill, `references/voiceover.md` sections 1 and 7 |
| rhythm | U (type rhythm ranges, a hook in 3 s) | U | U | U | U | U (coverage floor; the reference's pace when there is one) | U | U | R | The type file's rhythm ranges; the ice-edit skill, `references/house-style-numbers.md`; the ice-qa skill, `references/motion-density.md` |
| footage | T | T | T | N (the type's own material: letters or the mark) | U (real captures) | T | T | U | R | The ice-assets skill, `references/sourcing-and-licenses.md` section 1 (the ladder, lesson L2) |
| identity | U (logo and end card) | U | T | U | U | T (a brand, channel, series or programme: its marks in their slots) | T | T | R | The ice-assets skill, `references/brand-authenticity.md`; the ice-qa skill, `references/identity-tests.md` section 8 |

### 11.6 Content triggers (the T cells)

Read from the script, the transcript (with word times), the shot list and the brief, on every route. Each trigger is answered by a `use` or `scoped` row whose `where` covers it (on edits within 1.5 s of the word), or by a `not_use` row whose reason names that trigger. The ice-explainer skill's tag set (`references/semantic-tagging.md`) is one way to find them on that route; these triggers hold on every route. Triggers are kinds of content, never a list of words to match.

| Kind of content | Dimension and device family it switches on |
|---|---|
| A number with a unit, a percentage, a money amount, a count | `data`: a counter, chart or proportion device |
| A place, a route, a distance, a travel time | `data`: a map or route; `footage`: a real shot of the place |
| Three or more items named together (people, events, documents, products) | `depth`: a card field or depth stack; or `data`: a list build |
| A date sequence, or a before and after | `data`: a timeline; `finish`: a grade per period |
| A real event, person, product or site named | `footage`: real material by the ladder (lesson L2); `identity` for a brand |
| A person speaks on screen for the first time | `type`: a name super |
| A second audible voice (a soundbite, a translated quote) | `type`: a second caption hue |
| The speaker's line names someone shown as an inserted image | `cutout` or `depth`: the speaker recedes by scale and saturation |
| A single take longer than about 8 s | `camera`: a visible change every 3 to 5 s |
| A physical action or a material on screen | `foley`; `sfx` |
| A real location on screen | `ambience` |
| A stressed claim, the thesis, a reveal | `silence` before it; a `camera` push; `type` emphasis |
| Material from outside the film's world (archive, agency, stills, screenshots) | `finish`: one outside-material treatment |
| A brand, channel, series or programme | `identity`: its marks in their slots, the end card |
| A product interaction | `footage` or `cutout`: the real UI or product, as it really happens (the ice-qa skill, `references/clarity-gate.md` section 6) |
| Dialogue recorded on location, or with music under it | `voice`: diagnosis and cleanup |

### 11.7 Precedence and exemptions

**Precedence.** For each device, the first level that speaks decides whether it is used; the levels below only shape how. This order settles the use of craft devices; conflicts between inputs (approved copy, brand rules, a design file) follow `ice-direction/SKILL.md` section 5.

| Level | Source | What it settles |
|---|---|---|
| 1 | Hard rules: the truth sheet, the rights record, safety and photosensitivity, the real-people limits (`AGENTS.md` rule 17), the speaker stays lit while speaking (lesson L5), AI media opt-in | Never overridden |
| 2 | The user's own words | A stated wish for or against a device, quoted |
| 3 | A measured reference value (`ice/reference/**`, the style recipe json, `depth.json`, `events.json`, the sound map) | The amount and the place of a device the reference shows |
| 4 | The chosen style's craft profile (`needs`, `never`) | What the medium needs to be itself, and what it forbids |
| 5 | A content trigger recorded in the plan (11.6) | A device the script, the transcript or a scene calls for |
| 6 | The film or edit type's default (11.5 and the type file) | Hold, transition and camera policies; the richness or coverage floor |
| 7 | Taste defaults (the slop scan, composition bans, industry presets) | Apply only when nothing above asks for the device |

Taste bans are defaults, not limits: a level 2 to 5 source overrides a level 7 ban. Level 1 is never overridden.

**A lift is recorded, never argued.** A gate that would fail a device a level 2 to 5 source calls for passes only through an exemption row in the `exemptions` array of the run file (11.2):
- `id`: `X-01` onward. `lifts`: one or more rule ids of the namespace below. `element`: what is on screen or in the mix.
- `source.kind`: `user`, `reference`, `style` or `content`, and for each id the row lifts only a kind the allowed-kinds table below allows; `source.ref`: the file and row, the profile line, the D-entry id, or the user's quoted words, never empty.
- `shots`: a list of shot ids or time ranges as `a-b` seconds, or the string `"all"` (a list holding `"all"` reads the same); `all` only when the source says the device holds for the whole video.
- `amount`: the measure the gate prints, its measured or declared value, and a tolerance (default 0.10).
- `reason`: what the element means and why it is right here. `stage`: 04, 05 or 07, where the row was written.
- **Stage 07 rows.** A row written at 07 comes only from `user`, `reference` or `style`. A `content` row is written by 05 at the latest: a content row added at 07, after a gate failed, is a paper patch (`AGENTS.md` rules 5 and 14) and fails the plan check (`craft_gate.py plan`).
- **Ignored rows.** A row with no `source.kind` among the four, an empty `source.ref`, or a kind the allowed-kinds table does not allow for one of its ids is ignored for that id, and the gate prints a warning.

**Rule ids** (the gate prefix plus the id the gate already prints): `lint:C1` to `lint:C7`, `lint:D1`, `lint:P1`, `lint:T1`, `lint:V1` to `lint:V5`, `lint:depth_layers`; `story:<check number>`, `story:filler_reason`; `film:fast_ratio`, `film:blank_run_s`, `film:blue_purple_share`, `film:<richness key>` (`hero_share`, `frame_fill`, `empty_half`, `depth_layers`, `in_shot_motion`, `longest_still`), `film:element_events_per_min`, `film:longest_bare_talk_s` (the edit coverage measures); `art:tones`, `art:shading`, `art:shapes`, `art:texture`, `art:shadow`; `look:G2`, `look:G3`; `seam:zero-overlap`; `plan:gap`, `plan:anchor`, `plan:coverage`; `contract:fade`; `slop:<item number or N id>`; `frame:<row id>`.

**Allowed kinds.** Which `source.kind` may lift which rule id (the never-lifted list below stays out of every row):

| Rule ids | Kinds that may lift them |
|---|---|
| `film:hero_share`, `film:frame_fill`, `film:empty_half`, `film:depth_layers`, `film:in_shot_motion`, `film:longest_still`, `film:element_events_per_min`, `film:longest_bare_talk_s`, `film:fast_ratio`, `film:blank_run_s`, `lint:depth_layers`, `art:tones`, `art:shading`, `art:shapes`, `art:texture`, `art:shadow`, `look:G2`, `look:G3`, every `story:<n>` | `user`, `reference`, `style`; never `content` (restraint or density the agent chose is not a source) |
| `film:blue_purple_share` | `user`, `reference`, `style`, `content` (the subject's real colours, logged) |
| `lint:T1` | `user`, `reference`, `style`, `content` (only the product's own input shown as it really works); Arabic letters growing one by one never |
| `frame:flash` | `user` only (the faithful strobe) |
| Every other id (`lint:C*`, `lint:D1`, `lint:P1`, `lint:V*`, `plan:*`, `contract:fade`, `seam:zero-overlap`, `slop:*`, `frame:<row id>` other than `frame:flash`) | `user`, `reference`, `style`, `content` |

**The pass rule.** A hit passes when a row lists its rule id in `lifts`, the hit's time or shot is inside `shots` (`all` covers everything), and the measured value is within `amount.value` x (1 + tolerance) when an amount is given. An amount on a floor rule id (the richness floors `hero_share`, `frame_fill`, `depth_layers`, `in_shot_motion`; `fast_ratio`; the edit coverage floors such as `element_events_per_min`; `art:tones`, `art:shapes`) passes when value x (1 + tolerance) reaches it; every other amount is a ceiling (`longest_bare_talk_s` among them). The gate prints `exempt <rule id> by <row id> (<source.kind>: <source.ref>)`. The same element with no row, on other shots, or above the amount still fails. The execution test stays: a lifted device must still be made well (a card field has parallax, occlusion and shadows; a glow sits at its measured or stated radius). The news reel allowances of 0.2.4 are one case of this rule: `[data-broadcast]` and `--broadcast-measured` stay as aliases of a row.

**Never lifted.** Truth and claims; rights; privacy; safety and the real-people limits; accessibility (contrast floors, the flash safe mode, which only the user's own words lift for the faithful strobe: the ice-audio skill, `references/cue-map-and-beat-sync.md` section 6); Arabic shaping and bidi; legibility floors; required labels; lesson L5 (the speaker stays lit while speaking). A row whose `lifts` names one of these is ignored and the gate prints a warning. `AGENTS.md` rule 2's template distance and fingerprint have no rule id here: they never apply on the axes a look the user chose fixes (the ice-direction skill, `references/anti-sameness.md` section 4a), and no row lifts them for Ice's own choices. The blue and purple share (`film:blue_purple_share`) is lifted by a row whose source is the brand palette, a measured reference palette or the chosen style's palette, which is the reason rule 2 asks for.

**Readers and the gate.** Python: `load_craft_plan(start)` and `exemption_for(plan, rule_id, t, shot, value)` in the ice-qa skill's `scripts/storyboard_lint.py` (with `CRAFT_CODES`, the 18 codes of 11.1 in order). Node: `loadCraftPlan(start)` and `exemptionFor(plan, ruleId, { t, shot, value })` exported by the ice-qa skill's `scripts/_cdp.mjs`. Skills that install alone (the edit plan validator, the motion contract validator) carry an inline reader of the same schema. The gate is `scripts/craft_gate.py` of the ice-qa skill: `plan`, `build` and `measure` (11.8).

### 11.8 Checks

| Stage | Check | Fails when |
|---|---|---|
| 02 | Plan drafted | `ice/plan/craft-plan.json` is missing when 02 closes |
| 04 to 06 (edits: 04 and 06) | `craft_gate.py plan <project>` | A dimension has no row or two; a `use` or `scoped` row has no `where` id found in the storyboard, the shots or the edit plan; a `not_use` reason is empty, banned or has no source; a style need is `not_use`; a reference-measured dimension is `not_use` without "content conflict:"; a trigger of 11.6 that the script can find (a number with a unit, a single take over about 8 s) has no row that answers it |
| 07, 09 | `craft_gate.py build <project> --render <mp4>` | A visual `use` row has no evidence (a pixel measure where one exists, a `data-ice-craft="<code>"` mark in the sampled frames of an HTML build, a scene or event tag on an edit); a sound `use` row has no measured or cued presence; text or a card covers a face; more than 3 flashes in any 1 s window. Unmeasured is never "n/a" |
| 09 | Critic item | The critic reads each `use` row against the frames and asks what the content, the reference or the chosen style called for that the video does not do (the ice-qa skill, `references/critic-prompts.md`) |

`craft_gate.py measure <video>` gives the same pixel measures (camera track and moves, flashes, finishing, focus, faces) for a reference at 01 and for a render. Where each check sits among the gates, and the release gates it feeds: the ice-qa skill, `SKILL.md`.

### 11.9 Plain words to the user

- **Auto mode:** the plan is never a question; the director decides it. The heads-up and the delivery note list, in one plain paragraph, the crafts used (what and where) and the crafts not used (with their reasons), and every exemption in a plain sentence.
- **Step mode:** the drafted plan rides on the 02 review card and the locked plan on the 05 review card (the remake shows the draft on the 01 card). The user may change any row there; their words become level 2 sources.
- Plain names to the user ("camera moves", "real footage", "sound of the room"); the codes stay in the run file.

Sources: Tejashmakwana/motionmaxxing PAGE, inventory and idea rules (Apache-2.0); AbubakrChan/product-launch-motion one claim one film (MIT); lemomo-ai/lemo-opuscar treatment, logline, shot list and benchmark (MIT); heygen-com/hyperframes prompt expansion, boundaries, specification dial and companion-mode ceiling plan (Apache-2.0); echris6/motion-video-kit named benchmark (MIT); edenfunf/reelmimic open questions and required inputs (MIT); alchaincyf/huashu-art-motion unattended runs (MIT); yihui-dev/awesome-opus5-5-videos prompt anatomy (structure only, our own wording); ideas from hypit (brief vs treatment, fix at the owner) and imMamdouhaboammar/motion-graphics-skills (motion thesis, beat as message, mechanism and carry), rewritten.
