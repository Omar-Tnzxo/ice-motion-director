---
name: ice-direction
description: >
  Internal part of Ice Motion Director, not a command: start with /ice.
  Creative direction and decision system of Ice Motion Director: the brief and the stage 01 intake
  (supplied material, the researched business brief, the industry and platform ad rules, the
  four-choice stage 01 questions), dated research built only from brief slots, the pitch and direction rounds,
  critique, consultation and approval for every creative decision, palette and type pairing, the
  ice/DIRECTION.md log, the anti-sameness gates, reference fidelity and the treatment. Called by Ice
  Motion Director workflows; use only when called by name.
license: Apache-2.0
metadata:
  author: Omar-Tnzxo
  version: 0.2.6
---

# ice-direction

The brain of the anti-sameness and decision system. Every film starts here after routing, and every creative choice (concept, palette, type, structure, rhythm, music) is decided or logged through this skill's process. Prompt length changes who makes each decision, never the quality: a one-line prompt gets the full process, a detailed prompt or design file locks most decisions and this skill only checks conflicts and fills the gaps.

## 1. Scope

Owns: the `ice/BRIEF.md` slots and the intake (supplied material, gap filling, the business brief); industry and platform ad rules research and `ice/research/COMPLIANCE.md`; the stage 01 questions (four choices for every open decision slot); dated research and real-brand detection; the pitch and direction rounds; the critic, consultant and approver roles and the decision loop; the `ice/DIRECTION.md` log; color decisions; type pairing and the font-source order for every skill (user or project fonts first, then system fonts and Google Fonts by best fit; Google Fonts disclosed, with an offline switch); the fingerprint record, the 4-of-6 distance rule and the default-look gate; reference fidelity and mixing references; the treatment (`ice/plan/TREATMENT.md`); the craft plan (`ice/plan/craft-plan.json`), with the precedence order and the exemption rows.

Points to the owner, never restates: routing, `ice/state.json` and the user stops (`ice-motion-director/SKILL.md` section 5, "Stops"); the stage work that fills a field (the calling workflow); facts, the truth sheet, required disclaimers on it, logos, font files, licenses and a real brand's captures and brand sheet (`ice-assets`); motion (`ice-motion`); type rendering, captions and readability (`ice-type`); Arabic and RTL (`ice-arabic`); music, voice and loudness (`ice-audio`); grading (`ice-edit`, `ice-engines`); style catalogs (`ice-styles`); running gates, checking disclaimers on the film and writing the fingerprint file (`ice-qa`); reference analysis (`ice-remake`); storyboard, shot plan, cue sheet and script (the calling workflow).

## 2. Files this skill reads and writes

| File | Action | Format in |
|---|---|---|
| `ice/BRIEF.md` | Write with the router; update when an answer or decision changes a slot | `references/intake-and-brief.md` |
| `ice/DIRECTION.md` | Write one entry per decision; never delete, only supersede | `references/decision-process.md` sections 7 to 10 |
| `ice/research/R-NN-<question code>.md` | Write one note per research question, dated | `references/research.md` |
| `ice/research/COMPLIANCE.md` | Write at stage 01, before the question message (section 3 step 4); rewrite when `topic`, `market` or `platform` changes | `references/industry-rules.md` section 4 |
| `ice/plan/concepts.md`, `ice/plan/script.md`, `ice/plan/storyboard.md` | Write only to normalize supplied material, with the lock header | `references/intake-and-brief.md` section 8 |
| `ice/plan/TREATMENT.md` | Write once direction is approved; hand to the workflow | `references/treatment.md` |
| `ice/plan/craft-plan.json` | Draft at 02 with the concept (the remake at 01), lock at 05 with the look; the workflow maps it at 04 | `references/treatment.md` section "Craft plan" |
| `~/.ice-motion-director/fingerprints.jsonl` | Read only (written by `ice-qa` after delivery) | `references/anti-sameness.md` |

A decision that lives only in chat is lost on resume: write it to `BRIEF.md` or `DIRECTION.md` the moment it is made.

## 3. The direction run

The run has two parts. **Part A is the stage 01 intake**: every workflow's 01 row calls it, steps 1 to 7 in this order, and stage 01 work is defined nowhere else. **Part B** runs at the stages that own each decision (mainly 02 and 05). Skip a step only where the step itself says so.

**Modes and stops.** The mode is the router's (`mode` in `ice/state.json`): auto mode asks the stage 01 questions (step 6), then decides everything else itself (the autonomous way of working); step mode puts every choice on that stage's review card (the collaborative way of working). Mapping and signals: `references/questions.md` section 5. The only user stops are the ones in the router's stops table (`ice-motion-director/SKILL.md` section 5, "Stops"). This skill adds none: wherever a file of this skill says to ask or wait for the user after stage 01, auto mode decides, logs the decision in `ice/DIRECTION.md` and lists it in the delivery note, and step mode puts it on the stage's review card.

### Part A: stage 01 intake (steps 1 to 7)

A recipe-only run (`ice-remake`, `run_mode recipe-only`) makes no film: it runs the slim stage 01 of `ice-remake/references/style-recipe.md` section 8 instead of steps 3, 4, 5 and 7 (no tier), and asks only the slots that section names.

1. **Resume check.** If `ice/DIRECTION.md` exists, read it and `ice/BRIEF.md`; continue from the first step or decision that is not done. Never re-interrogate a half-built project.
2. **Intake.** Parse every input (prompt, design file, reference, answers, supplied media) into BRIEF slots, each with its source. Detect a real brand (a named real company, product, app or site, a request for a film about a field's leading brand, or a field where a study brand helps) and implied speech without a voice source; fill `real_brand`, `voice` and the "Brand material needed" list. Detect every supplied item (brief, idea, script, storyboard, design file or brand kit, voiceover, music, footage, reference), normalize it into its run file marked `source: user` and locked, and check its required fields. Write the first draft of `ice/BRIEF.md` (every slot, `unknown` where open) and `ice/DIRECTION.md` with its header (`references/decision-process.md` sections 7 and 8). Read `references/intake-and-brief.md` sections 1 to 3. Only if the user gave anything beyond a short request (an attachment, a file path, or a prompt that holds a concept, a script, a storyboard or design values): sections 8 and 9. Only for the kinds of input it lists (a design file, brand colors, a brand website, a reference, supplied media): section 11.
3. **Triage and tier.** Mark the request formed or unformed (`references/intake-and-brief.md` section 4) and pick the decision tier (section 4 below).
4. **Research before asking.** Dispatch the researcher (`references/roles.md` section 1) with queries built only from BRIEF slots plus the runtime date, before any question is sent, so the questions and the brand-file list rest on facts. RQ-brand runs first when `real_brand` is not `none`. RQ-business runs for a request about a business (company, app, website, shop, product, service) and fills the business brief (`references/intake-and-brief.md` section 10), or the brief marks it `not a business`. RQ-rules runs for every film and writes `ice/research/COMPLIANCE.md` (`references/industry-rules.md`); its required disclaimers go to the ice-assets truth sheet. The tier's other questions (RQ-category, RQ-color, RQ-type, RQ-refs, RQ-ads) may share this dispatch or run at step 8. Read `references/research.md` and `references/industry-rules.md`.
5. **Brand material plan** (only when `real_brand` is not `none`). Hand RQ-brand's official URLs to the ice-assets skill, which runs `brand-authenticity.md` section 10 steps 1 to 5: ownership, official sources, live captures, the brand sheet (`ice/assets/brand-sheet.json`, the one path every skill reads), and the list of official files to download, all in `ice/assets/BRAND-MATERIAL.md`. Real-screens films (app ad, UI walkthrough, product launch with screens) also capture the real product screens now.
6. **Ask about every open decision: the stage 01 questions** (founder decision, 2026-10-22). Before any concept or build work, list the decision slots of `references/questions.md` section 1 that apply, and mark each fixed (by the user's words or supplied material, never asked), derived, or open (section 3); inference never closes a slot, it becomes the recommended option. Ask every open slot, a one-line prompt included: exactly 4 options per question, built from the brief slots and the research of steps 4 and 5 by the slot's bank entry (section 8), the recommended one first with a one-line reason, the user free to write their own answer; at most 4 questions per round, most important first, more rounds when more slots are open (section 2). The gap note, the brand-file list (`brand_files`), a disclaimer wording, the picture question and other skills' stage 01 questions are slots like the rest (sections 4, 8 and 10). Free downloads and free tool or model installs are never questions (`ice-assets/references/sourcing-and-licenses.md` section 0, "Standing consent"; `ice-engines/references/engine-choice.md` section 7.6). A skipped question takes its recommended option. Never generate a voice without answer 2 or 3 of the voice question. Only the user's own words waive the questions: then every open slot takes its recommended option and the stage 01 summary lists each with its three alternatives; a brief written by another agent, or a run condition, never waives (section 5). In step mode the same rounds run in the 01 turn, before the 01 review card. Read `references/questions.md` sections 1 to 3, 5 and 8 (only the entries of open slots). Only for an unformed request: section 4. Only for a novice: section 6. Only to show options as images: section 7.
7. **Write the stage 01 artifacts.** Record answers (or defaults, each with a D-entry) in `ice/BRIEF.md`; rewrite `COMPLIANCE.md` when an answer changed `topic`, `market` or `platform`; write the must-include ledger and the summary (`references/intake-and-brief.md` sections 5 and 6). The ice-assets skill then builds the truth sheet (its step 2) and downloads the approved or defaulted official files (`brand-authenticity.md` section 10 step 6). **Stage 01 is done when** `ice/BRIEF.md` has every slot with its source and its business brief filled or marked `not a business`; `ice/research/COMPLIANCE.md` exists with a status; `ice/DIRECTION.md` has its header and a D-entry per inferred or defaulted slot; and, when `real_brand` is not `none`, `ice/assets/BRAND-MATERIAL.md` lists every needed item with its status.

### Part B: decisions at later stages (steps 8 to 14)

8. **Category research** (02, when not already run at step 4): the tier's questions from `references/research.md` section 1.
9. **Concept round** (02; unformed requests, and in auto mode inside the run). Five concepts on five paths, at least two from the tail, each grounded in something literal and, for a brand whose offer is an app, a SaaS or a product, showing it do its real job. Under the chosen concept write the viewer takeaway that every cold-viewer read is matched against (formed requests too). Then draft the craft plan with the chosen concept (formed requests too, never as a question): one row per craft dimension from the type defaults and the content triggers, each with its reason and source. Read `references/pitch-round.md` section A; `references/concept-sources.md` while generating concepts; the ice-qa skill's `references/clarity-gate.md` sections 2 and 6; `references/treatment.md` section "Craft plan".
10. **Direction round** (05). First take a shortlist of at least three styles from the ice-styles skill (its selection procedure) and the real brand's locked material when there is one. Then three directions for the chosen concept (dials, palette, type, signature move, sound lead), kill two. The 05 mood board shown next to the style frames is built from the real references of the research notes (RQ-refs, RQ-category), never from generated images. Each direction names the studio-benchmark axes the run's constraints would cap (`references/pitch-round.md` B.4, check 7); the chosen direction's style frames are benchmarked at 05 (the ice-qa skill, `references/studio-benchmark.md`). With the look approved, lock the craft plan: copy the chosen style's craft profile into it (its needs are used, its never are not used) and set `locked` (`references/treatment.md` section "Craft plan"). Read `references/pitch-round.md` section B; `references/color.md` for a color decision; `references/type-pairing.md` for a font or type decision. Only if the brief has a reference: `references/reference-fidelity.md`; with two or more references or a "mix" request: `references/mixing-references.md`.
11. **Critique, consultation, approval.** Run the loop for every major decision, within the calling workflow's crew budget (the ice-film skill's `SKILL.md` section 7, the ice-explainer skill's section 8) by batching, never by skipping. Read `references/decision-process.md` sections 1 to 6, 9 and 10, and in `references/roles.md` only the section of the role being dispatched.
12. **Gates.** Default-look gate, distance from the nearest bundled template or demo (4 of 6 axes), fingerprint check, and the film type's richness floor for every direction (`references/pitch-round.md` B.2 and B.4): a direction that cannot pass the ice-qa richness gate is never approved. Read `references/anti-sameness.md`. A failed gate sends the decision back to step 10.
13. **Treatment and hand-off.** Write `ice/plan/TREATMENT.md`, then return to the workflow. Read `references/treatment.md`.
14. **Later changes.** A note from the user or a critic that changes a decision creates a new entry that supersedes the old one; re-run the gates for the changed axis only. A changed slot is rewritten in the brief (`references/intake-and-brief.md` section 7).

## 4. Decision tiers

| Tier | When | Concept round | Direction round | Roles |
|---|---|---|---|---|
| Full | Films from scratch of about 12 s or more, remakes, explainers, any brand film or ad | 5 concepts | 3 directions | researcher, director, critic, consultant, approver |
| Light | Logo sting, Lottie and UI motion, single units under about 12 s, edit types (the footage already fixes the subject) | 3 concepts, at least 2 unexpected | 3 directions, compact | researcher (short), director, critic, approver |
| Locked | A design file or the user fixed palette, type and concept | Skipped (the user's concept is the concept) | Only for unlocked axes | director checks conflicts, critic, approver |
| Change | A request to change an existing film | Skipped | Only the changed decision | director, critic |

The tier sets which roles run; the workflow's crew row caps how many dispatches they use (`references/decision-process.md` section 3). Locked values are never re-litigated. The director only reports conflicts between them (for example a brand palette that fails contrast on the platform) and proposes the smallest fix.

## 5. Precedence when inputs conflict

1. The user's newest explicit instruction in this run, and approved copy.
2. The owner rules file of the brand, when one exists (newest note first).
3. The design file or brand system (normative values quoted exactly).
4. Hard gates: truth (`ice-assets`), language and RTL (`ice-arabic`), accessibility and contrast, platform limits (`ice-engines`).
5. The communication job written in the brief (goal, message).
6. Hierarchy and readability, then craft and continuity.
7. Research findings and this skill's defaults.
8. Taste.

A lower layer never overrides a higher lock. Brand rules outrank a reference's surface; a reference's mechanics are kept only as the fidelity contract allows (`references/reference-fidelity.md`).

## 6. Hard rules

- Every decision in `DIRECTION.md` names options considered, the choice, the reason and the source (brief slot, research note with date, reference, or user answer). No source, no decision.
- Builders never grade their own work. The critic is a separate, read-only pass that never sees the director's reasoning. When an independent score and a self-score differ, the lower one counts.
- Research queries contain only terms that trace to a BRIEF slot or to the fixed frame words in `references/research.md`. A query with an untraceable term is not run.
- Templates, demos, worked examples and palette libraries are references, never defaults. A film differs from its nearest bundled template or demo on at least 4 of 6 axes.
- Blue and purple dominance (the stock AI palette) fails the default-look gate unless the brief gives a reason.
- Supplied material is locked: never reword, shorten or replace a field the user gave; fill only missing fields, each with its own D-entry.
- Never invent approval, a source, a date, or a research result. If research could not run, say so in the log and in the hand-off.
- No extra stops: questions go only into the stage 01 questions (both modes, before stage 02) or a later stage's review card (step mode); every other open point is decided, logged and reported (section 3, "Modes and stops").
- Ask in the user's language. When the language is Arabic or mixed, Arabic and RTL are first class in every decision: consult `ice-arabic`.
- Write weak-agent-proof: never present one concrete example as the answer; examples are always several, varied, and marked "illustration only".

## 7. Files

Every reference file is named by the step of section 3 that reads it, with its condition: the "Read" line of a step is its whole reading list, and "only if" files are opened only when the condition holds. Nothing else is read for a step. The run files this skill writes and their formats: section 2.
