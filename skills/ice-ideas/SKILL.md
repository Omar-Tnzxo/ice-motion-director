---
name: ice-ideas
description: "Internal part of Ice Motion Director, not a command: start with /ice. Workflow of Ice Motion Director for ideas without a render: concept sets with at least two unexpected directions, hooks and first-3-second openers, open loops, scripts, storyboards and animatic specs with frame sketches, treatments, and campaign series with platform variants, ending in a hand-off note for the workflow that would build it. Started by the Ice Motion Director router (ice-motion-director), which creates the project first; use only when the router hands off or the user names ice-ideas. Other Ice workflows also call it by name for its concept and script rules."
license: Apache-2.0
metadata:
  author: Omar-Tnzxo
  version: 0.2.6
---

# ice-ideas

You write ideas, not renders. Every output of this skill is a document (and optional plain wireframe sketches) that a person can approve, and that another Ice workflow can build from without asking again.

## First step

Look for `ice/state.json` in the working folder.
- Missing: stop reading this skill. Open the router (`ice-motion-director/SKILL.md`) and follow it; it creates the project, runs the stage 01 intake and calls this workflow back.
- Present: read it and resume at `current` in the recorded `mode`. Never re-ask what the files answer.
- Called by another Ice workflow for its 02 or 03 rules: the state already exists. Use the rules of that stage only, then return to the caller; the caller's route and order stay as they are.

## 1. Non-negotiables

1. **Grounded, never stock.** Every concept, hook and line traces to a slot in `ice/BRIEF.md`, to the user's material, or to a dated note in `ice/research/`. No idea may come from an example in this skill's files: the examples there are marked "illustration only" and show a pattern, never content.
2. **Research is dated and slot-built.** Ask the `ice-direction` skill for research. Query slots and the trace check: the `ice-direction` skill, `references/research.md` sections 3 and 4.
3. **Truth first.** No invented numbers, results, prices, dates, testimonials, user counts or features. Facts come from the truth sheet (see the `ice-assets` skill, truth sheet). Illustrative content is allowed only when declared in the delivery notes.
4. **Divergence is required.** An idea set always holds several genuinely different directions, at least two of them unexpected. The pitch round mechanics (how many, how sampled, who judges, in what order) belong to the `ice-direction` skill, pitch round. This skill generates the raw material and the deliverable documents.
5. **One idea per film.** A concept is chosen, never averaged. Mixing parts of two is allowed only under one parent concept.
6. **Plain words to the user.** Short status lines in the user's language. Questions go only into the stage 01 message (the `ice-direction` skill, section 3 Part A step 6: every open decision slot, exactly 4 options with the recommended one first, at most 4 per round); after 01 see "Stops and approvals" in `## Spine stages`.

## 2. Inputs and outputs

Read `references/templates.md` (section 12, "Files read and written") when you need the map of project files this workflow reads and writes.

Every choice you make goes into `ice/DIRECTION.md` with option set, choice, reason and source. A decision that lives only in chat is lost on resume.

## 3. Pick the deliverable

| User asks for | Deliver | Read first |
|---|---|---|
| "ideas", "concepts", "directions", a pitch | Concept set (cards), then develop the chosen one on request | `references/idea-craft.md`, `references/divergent-sets.md`, `references/concept-menus.md` |
| A hook, an opener, "the first 3 seconds", retention | Hook sheet with three provisional openings; open-loop ledger when the story has an honest open question | `references/hooks-and-openers.md` |
| A script, voiceover, copy, ad text | Script table (and loops if any) | `references/script-writing.md` |
| A storyboard, shot list, beat sheet, animatic | Storyboard plan, shot table, animatic spec with frame sketches | `references/storyboards-and-animatics.md` |
| A treatment, a creative proposal, a director's note | Treatment document (`ice/plan/TREATMENT.md`) | The `ice-direction` skill, `references/treatment.md` |
| A campaign, a series, variants, cutdowns, "versions for each platform" | Campaign matrix plus per-variant hooks | `references/campaigns-and-variants.md` |
| More than one of the above | Run them by stage: concept and treatment (02), hook, script and campaign (03), storyboard (04), style frame notes (05), animatic spec (06). Stop at the last one asked for; which stages run is fixed at 01 (`## Spine stages`, "Which stages run") | All of the matching rows |

Exact output shapes for every deliverable: `references/templates.md`.

## 4. Workflow

The steps carry names, never numbers; the two-digit number after each name is the spine stage it belongs to (next section). Run them in the order listed.

- **Resume or start (01).** If `ice/plan/` already holds an approved concept or script, continue from it; never re-interrogate a half-built project. A specific change request edits only that part.
- **Check the brief (01).** The message sentence must exist ("This film tells <audience> that <message>"). If length, language or platform are missing and the deliverable depends on them (a script always does), they are questions of the stage 01 message; without an answer, take the default and log it. Everything else: decide, log, state the assumption in one line, continue.
- **Ground (01).** The `ice-direction` intake research (RQ-business, RQ-brand, RQ-rules) has run first; request more dated research from `ice-direction` only when the brief names a market, category or audience you have no fresh notes for. Extract the product truth and brand inventory (`references/idea-craft.md`, section 2). List the facts you may use. Mark the stages that do not run (`## Spine stages`, "Which stages run").
- **Diverge (02).** Generate candidates from at least three different generators in `references/divergent-sets.md`. Kill candidates that fail the idea tests (`references/idea-craft.md`, section 5). Write survivors as concept cards.
- **Pitch (02).** Hand the cards to the `ice-direction` pitch round and critic. Present all directions before any recommendation. Step mode: all directions go on the 02 review card and the user picks. Auto mode: execute the critic's pick, log it, and list the others in one sentence each in the delivery note.
- **Develop (02 to 06)** only the stages that run: treatment (02); hook sheet, script, campaign matrix and versions (03); storyboard (04) and style frame notes with a mood board (05), in parallel when both run; animatic spec (06), which needs both 04 and 05. Each step builds on the approved one before it; the script is the only home of spoken words.
- **Check (09).** Run the self-checks at the end of each reference you used. Ask the `ice-qa` skill for the storyboard lint and the slop scan on copy before delivery. Builders never grade their own work.
- **Deliver and hand off (10)** (section 6).

## Spine stages

The router owns the spine and the `stages` map in `ice/state.json`. This workflow covers the planning half of the spine and ends with a hand-off note for the workflow that would build; it also supplies the 02 and 03 rules other workflows call. A stage is done when its artifact exists and passes the check in the last column. This route has one machine-readable order line (the router's order text, read by `ice-state`), copied into `order` at 01:

Stage order: 01 02 03 [04 05] 06 07 08 09 10
Leads with: the idea. The concept, then the words, then the pictures. 07 and 08 stay in the line, but on this route they are always `not_used`.

**Parallel lanes.** When both run, 04 (storyboard) and 05 (style frame notes and mood board) run in parallel after 03; 06 (the animatic spec) needs both. 08 never runs here, so there is no 08a or 08b part. Agents without sub-agents run 04 and 05 one after another.

**Which stages run.** Fixed at 01 from the deliverables asked (section 3), right after `order` is set:
- 01, 09 and 10: always.
- 02: always (`supplied` when the user gave the concept).
- 03: when a hook, script or campaign is asked, or when 04 or 06 runs.
- 04: when a storyboard is asked, or when 06 runs.
- 05: when style frame notes are asked, or when 06 runs.
- 06: when an animatic spec is asked.
- 07 and 08: never.

Every other stage (in particular every stage between the last deliverable asked and 09) is set to `not_used` with the note `not asked; hand-off` (`ice-state set <NN> not_used --notes "not asked; hand-off"`), never left `missing`. The router's auto loop then ends at 10 and never rolls into a build.

**Route changes.** This workflow never changes the route; `ice/plan/handoff.md` only names the receiving workflow. When the user later asks, in their own words, to build the idea, the router switches `route` and `order` and sets every stage marked `not asked; hand-off` back to `missing` (`ice-motion-director/references/state.md`, "Resume" step 4); the approved plan files are reused.

**Read budget.** Each row below marks its files **Required** (open them, in the order listed) or **Only if <condition>** (open only when the condition holds). A file named with a section: read only that section. Open nothing else, and nothing a file merely mentions, unless the stage cannot be finished without it. `references/` paths are inside this skill; a path starting with another skill's name is in that skill's folder, next to this one. Section 7 is an index, not a reading list.

**Stops and approvals.** The router's stops table (`ice-motion-director/SKILL.md` section 5, "Stops") is the only list of times the run waits for the user. Auto mode asks only in the single stage 01 message and at the one preview approval, and only when the session is interactive (a person can answer now) and the user did not say not to ask; on this route the preview is the style frame notes (05) or the animatic spec (06) when one of them runs, and there is none otherwise. Every other "ask" in this skill and its files means, in auto mode: decide, log it in `ice/DIRECTION.md`, report it in the delivery note; in step mode: put it on that stage's review card. Approval: the user in step mode; in auto mode the approver role (`ice-direction/references/roles.md` section 5), who checks the row's "Done when" item by item.

| Stage | What this workflow does in it | Files to open | Done when |
|---|---|---|---|
| 01 brief | ice-direction intake first: research RQ-business, RQ-brand and RQ-rules, then the one question message; it writes the business brief, the brand material plan and the compliance note (steps the router already ran are not repeated). Then resume or start, check the brief, ground: message sentence, product truth and brand inventory, the list of usable facts; mark the stages that do not run | Required: `ice-direction/SKILL.md` section 3 Part A (stage 01 intake, steps 1 to 7, and the files those steps name); `references/idea-craft.md` sections 1 and 2; `ice-assets/references/truth-sheet.md` | `ice/BRIEF.md` has its business brief filled or marked "not a business" and holds the message sentence; `ice/research/COMPLIANCE.md` exists; a real brand has `ice/assets/BRAND-MATERIAL.md` and `ice/assets/brand-sheet.json`; the usable facts are listed and each traces to the truth sheet or a dated note in `ice/research/`; every stage that does not run is `not_used` with the note `not asked; hand-off` |
| 02 concepts | Diverge and pitch: concept cards from at least three generators, at least two unexpected, judged by the ice-direction pitch round; the treatment when asked | Required: `ice-direction/references/pitch-round.md` section A; `references/divergent-sets.md`; `references/idea-craft.md` sections 3 to 6; `references/templates.md` sections 1 and 2; `ice-qa/references/clarity-gate.md` sections 2 and 6; `ice-direction/references/treatment.md` section "Craft plan". Only if a starting shape is needed: `references/concept-menus.md`. Only if a treatment is asked: `ice-direction/references/treatment.md` and `references/templates.md` section 9 | `ice/plan/concepts.md` holds every card with the critic's verdict and the chosen card's viewer takeaway; the chosen concept is logged in `ice/DIRECTION.md`; `ice/plan/craft-plan.json` is drafted for it; `ice/plan/TREATMENT.md` exists when it was asked |
| 03 script | Hook sheet with three provisional openings, open loops when the story has an honest open question, the script table per language when a script is asked or 04 or 06 runs, the campaign matrix when asked. Versions step: when a script is asked and the brief lists versions (languages, aspect ratios, 15 s and 6 s cutdowns), plan each with its own hook, in the campaign matrix when there is one, otherwise in `ice/plan/versions.md` | Required: `references/hooks-and-openers.md`; `references/templates.md` sections 3 to 5. Only if the script table is written: `references/script-writing.md`. Only if a campaign is asked or the brief lists versions: `references/campaigns-and-variants.md` and `references/templates.md` section 10 | `ice/plan/hooks.md` and, when written, `ice/plan/script.md` pass the self-checks of their references; `ice/plan/open-loops.json` and `ice/plan/campaign.md` exist when used; versions the brief lists are in the campaign matrix or `ice/plan/versions.md` |
| 04 storyboard | Storyboard plan, shot table and frame sketches, with the hold behavior stated per frame | Required: `references/storyboards-and-animatics.md` sections 1 to 5 and 7 to 8; `references/templates.md` sections 6 and 7; `ice-qa/references/storyboard-lint.md` | `ice/plan/storyboard.md` is lint clean (ice-qa); the craft plan's `use` rows carry `craft:<code>` tags and `craft_gate.py plan` passes |
| 05 look | Style frame notes or plain wireframe sketches, with a mood board next to them; the look itself is decided by ice-direction or the receiving workflow | Required: `ice-film/references/storyboard.md` section 7 (the mood board and style frames rows). Only if style frames are drawn: `ice-qa/references/studio-benchmark.md` and, for a brand, `ice-qa/references/identity-tests.md` section 3. Only if the look is not decided yet: `ice-direction/SKILL.md` section 3 Part B step 10 | the notes are in `ice/plan/` and the mood board in `ice/plan/mood-board/`, each look choice logged in `ice/DIRECTION.md`; when style frames are drawn, the craft plan is locked with the style's craft profile |
| 06 animatic | The animatic spec (timing per frame, speech and rough sound) for the receiving workflow to render, built on 04 and 05 | Required: `references/storyboards-and-animatics.md` section 6; `references/templates.md` section 8 | `ice/plan/animatic.md` exists |
| 07 build | Never built here; set `not_used` (`not asked; hand-off`) at 01 | none | `not_used`; `ice/plan/handoff.md` names the receiving workflow |
| 08 sound | Never produced here; set `not_used` (`not asked; hand-off`) at 01; music or voice notes travel in the hand-off | none | `not_used`; the notes are in `ice/plan/handoff.md` |
| 09 review | Review of the idea set: the self-checks of each reference used, the ice-qa storyboard lint and the slop scan on copy, by a critic who did not write | Required: `ice-qa/SKILL.md`; `ice-qa/references/slop-scan.md`. Only if 04 ran: `ice-qa/references/storyboard-lint.md`. Only if 04 or 05 drew frames: `ice-qa/references/clarity-gate.md` sections 3 to 5 and 7 (the micro read) | the critic's notes are in `ice/review/`; every P0 is fixed; drawn frames passed the micro clarity read |
| 10 deliver | Deliver the documents and write the hand-off note (section 6); the run ends here | Required: `references/templates.md` section 11 | `ice/plan/handoff.md` lists the target workflow, the approved files (`ice/plan/craft-plan.json` among them, for the build route's 07 and 09 build check), stated versus inferred items, open questions and the inputs only the user can give; `route` in `ice/state.json` is unchanged |

**Depth by size.** Size here is the size of the film the ideas are for.

| Size | Idea jobs | How the spine runs here |
|---|---|---|
| Micro: 6 s or less, or one asset | ideas for a loader, an ident, a quote card | 01, then 02 with a short card set (still at least two unexpected), then the other stages that run; one review round at 09 |
| Standard: 7 to 60 s | a concept set, a script or a storyboard for an ad, a launch or a short | Every stage that runs, in order, up to the last deliverable asked, then 09 and 10 |
| Long or campaign: over 60 s, chapters, series or versions | a long-film treatment, a campaign with platform executions | Every stage that runs; chapters, executions and cutdowns are planned at 03 in the campaign matrix; one hand-off per execution |

**Supplied or partial material.** The router's intake table sets what each supplied item does to its stage. Differences on this route: a supplied concept makes 02 `supplied` and the next stage that runs starts from it; a supplied script is validated at 03 for facts, timing fit and languages, and hooks are proposed only when asked. Partial material: fill only the missing fields with this stage's method, log each fill in `ice/DIRECTION.md`, keep the user's own fields unchanged, and keep the stage `partial` until the fills are approved.

## 5. Scoped rules (sources disagree; both hold where stated)

Each scoped rule lives with its topic. Read `references/hooks-and-openers.md` (sections 2, 3 and 6) for hook timing, opening, cold open and suspense; `references/divergent-sets.md` (section 6) for candidate count and mixing; `references/script-writing.md` (section 5) for the CTA; `references/storyboards-and-animatics.md` (section 2) for hold frames.

## 6. Hand off the approved idea

Read `references/templates.md` (section 11, "Hand-off routing and rules") when handing off: which workflow receives which idea, what to pass along, and the hand-off rules.

## 7. Files

Index only: each stage opens the files its `## Spine stages` row marks.

| File | Open when |
|---|---|
| `references/idea-craft.md` | Any concept work: what an idea is, grounding, ownership, idea tests, honesty |
| `references/divergent-sets.md` | Generating a concept set: generators, recombination, concept card fields, selection |
| `references/concept-menus.md` | You need starting shapes: concept menu, feature presentation menu, metaphor patterns, category spines to break |
| `references/hooks-and-openers.md` | Hooks, first 3 seconds, three provisional openings, open loops, endings |
| `references/script-writing.md` | Any script, voiceover or on-screen copy |
| `references/storyboards-and-animatics.md` | Storyboards, shot tables, frame sketches, animatic specs |
| `references/campaigns-and-variants.md` | Series, cutdowns, hook variants, platform executions |
| `references/templates.md` | The exact output shape of every deliverable above |

Owned elsewhere (call by name, never restate): pitch round, research, color and type choice, the treatment (`ice-direction`); script shapes bank and film-type structures (`ice-film`); motion grammar, cuts, camera, holds (`ice-motion`); captions and kinetic type (`ice-type`); Arabic dialect and RTL copy (`ice-arabic`); voiceover pace and TTS (`ice-audio`); style catalogs (`ice-styles`); platform specs and safe zones (`ice-engines`); truth sheet and asset rights (`ice-assets`); gates and critics (`ice-qa`).
