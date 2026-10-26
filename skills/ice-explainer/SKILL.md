---
name: ice-explainer
description: "Internal part of Ice Motion Director, not a command: start with /ice. Workflow of Ice Motion Director for narrated explainer films where the voiceover leads: a researched script, the voice and its word timing, word-timed segments and a verified explainer (collage, whiteboard, pen, concept transform, kinetic, card based, code or UI walkthrough, long-form chaptered film). Started by the Ice Motion Director router (ice-motion-director), which creates the project first; use only when the router hands off or the user names ice-explainer."
license: Apache-2.0
metadata:
  author: Omar-Tnzxo
  version: 0.2.1
---

# Ice Explainer

The voice is the clock. Every picture change hangs on a spoken word, every number on screen traces to a source, and an agent that cannot watch or listen proves the film works with measurements.

## First step

Look for `ice/state.json` in the working folder.
- Missing: stop reading this skill. Open the router (`ice-motion-director/SKILL.md`) and follow it; it creates the project, runs the stage 01 intake and calls this workflow back.
- Present: read it and resume at `current` in the recorded `mode`. Never re-ask what the files answer.

Not this route (go back through the router and record why in `history`): the film still works with the voice removed, or no voice source exists (ice-film); footage to cut (ice-edit); "make it like this" with a reference (ice-remake); ideas or a script only (ice-ideas).

**Read budget.** Each `## Spine stages` row marks its files **Required** (open them, in the order listed) or **Only if <condition>** (open only when the condition holds). A file named with a section: read only that section. Open nothing else, and nothing a file merely mentions, unless the stage cannot be finished without it. The section 9 table is an index, not a reading list. `references/` paths are inside this skill; a path starting with another skill's name is in that skill's folder, next to this one.

**Stops and approvals.** The router's stops table (`ice-motion-director/SKILL.md` section 5, "Stops") is the only list of times the run waits for the user. Auto mode asks only in the single stage 01 message and at the one preview approval (the 06 sample, only when the session is interactive and the user did not say not to ask). Every other "ask" in this skill and its files means, in auto mode: decide, log it in `ice/DIRECTION.md`, report it in the delivery note; in step mode: put it in that stage's review card. Consent items (installing a tool, downloading a model or a file, paid or cloud TTS) follow the same rule: they are asked only inside the stage 01 message; without a yes, take the path that needs none, log it, and say in the delivery note what a yes would add. Approval: the user in step mode; in auto mode the critic the crew row assigns (section 8), then the approver role (`ice-direction/references/roles.md` section 5), who checks the row's "Done when" item by item. Clarity reads 1 to 3 below are the cold-viewer gate (`ice-qa/references/clarity-gate.md` sections 1, 3 and 8): a FAIL blocks 07 or 10 in every mode.

## 1. Inputs and outputs

Read `references/run-setup.md` (section 1) at the start of every run and on every resume: where the brief, direction, research, plan, review files and the film live.

## 2. Noncommercial material gate

Never open `noncommercial/` before reading `references/run-setup.md` (section 2) and passing its `commercial_use` check.

## 3. Pick the run mode

Fast, standard or long-form, derived at 01 and never asked. Read `references/run-setup.md` (sections 3 and 4) at stage 01 to pick the mode and for the rules on what goes to the user and what you decide.

## 4. Pipeline order

Read `references/run-setup.md` (section 5) at stage 01: step order, the fixed voice-before-segments order and the late-voice rule.

## Spine stages

The router owns the spine and the `stages` map in `ice/state.json`; this section says what each stage means when the voice leads. A stage is done when its artifact exists and passes the check in the last column; it is approved as "Stops and approvals" above says. Two things differ from a film made from scratch: the voice is recorded and aligned inside 03, because it is the clock for everything after it, and `ice/plan/segments.json` is this route's cue sheet.

**Parallel lanes.** After 03, 04 (tags, segments and the storyboard: rough boards, composition and timing on the word cues) runs in parallel with 05 (mood board and style frames); 06 merges both and needs both. After 06, 08a (music bed and SFX from the locked segments, and the final voice master; the voice itself was recorded at 03) runs beside 07, and 08b (mix and master on the 07 draft) after 07. Agents without sub-agents run a lane's stages one after another. Copy this line into `order` (micro size leaves 06 out):

Stage order: 01 02 03 [04 05] 06 [07 08a] 08b 09 10
Leads with: the voice. 01 researches the facts and settles the voice source; 03 writes, voices and aligns the script, so every later stage times to real words; 06 is the sample segment on the real voice.

| Stage | What this workflow does in it | Files to open | Done when |
|---|---|---|---|
| 01 brief | ice-direction intake first: research RQ-business, RQ-brand and RQ-rules, then the one question message (the voice source and any consent item go inside it); it writes the business brief, the brand material plan and the compliance note (steps the router already ran are not repeated). Then: the run mode (section 3), size, crew row (section 8). Research and facts step: the topic research note `ice/research/R-NN-RQ-topic.md`, every number, name, date and quote sourced | Required: `ice-direction/SKILL.md` section 3 Part A (stage 01 intake, steps 1 to 7, and the files those steps name); `references/run-setup.md`; `references/roles.md` section 7; `references/research-and-facts.md`. Only if a researcher sub-agent: `references/roles.md` section 1. Only if a real brand or product: `ice-assets/references/brand-authenticity.md` | `ice/BRIEF.md` has its business brief filled or marked "not a business"; `ice/research/COMPLIANCE.md` exists; a real brand has `ice/assets/BRAND-MATERIAL.md` and `ice/assets/brand-sheet.json`; `subtype` (`explainer`), `run_mode`, `size`, `order`, `crew` and `crew_flags` are in `ice/state.json`; facts are in `ice/assets/TRUTH.md` and `ice/assets/facts.json` with unverified items listed |
| 02 concept | Angle: the one thesis the film proves, its structure, its hook type and the film-level grammar family, chosen through the ice-direction pitch round and its critic | Required: `ice-direction/references/pitch-round.md` section A; `references/script-writing.md` sections 2, 3 and 9; `references/grammar-selection.md`; `ice-qa/references/clarity-gate.md` sections 2 and 6. Only if a brand: `ice-qa/references/identity-tests.md`. | the concept entry in `ice/DIRECTION.md` names the angle, the structure with its reason, the hook type and the grammar family, and lists the rejected options; the viewer takeaway is in `ice/plan/concepts.md`; for a brand, the chosen concept passed the brand test and competitor swap on its blind description |
| 03 narration script | Script step: display script and pronunciation script. Versions step: every version the brief asks for (languages, aspect ratios, 15 s and 6 s cutdowns, chapters), each cutdown with its own hook. Then the voice step (the source settled at 01: the user's recording, a local TTS engine already installed, or cloud TTS only with consent; no consent and no recording: the late-voice rule, `references/run-setup.md` section 5) and the timing step | Required: `references/script-writing.md`; `references/voice-first-timeline.md`. Only if a scriptwriter sub-agent: `references/roles.md` section 2. Only if long-form: `references/long-form-explainers.md` section 1. Only if Arabic or mixed: `ice-arabic/SKILL.md` | the script passes the spine test and the deletion test, fits its length budget, has the banned tells removed and was approved before the voice step; `ice/plan/versions.md` lists each version with its length, aspect, language and hook (or says "master only"); `ice/plan/voice/` holds the audio; `ice/plan/words.json` has real word boundaries, the speech check passed and the length is within 15 percent of target (late voice: timing marked estimated and the voice script handed over) |
| 04 storyboard | Tagging step, then the grammar and segments step: every sentence gets a tag and a picture change anchored on a spoken word; the storyboard is rough boards, composition and timing, without the look. Runs beside 05 | Required: `references/semantic-tagging.md`; `references/grammar-selection.md`; `references/word-timed-segments.md`. Only if a card or scene library grammar: `references/card-library.md`. Only if annotator or segment planner sub-agents: `references/roles.md` sections 3-4 | `ice/plan/semantics.json` tags every sentence from the closed list and lists required elements; `ice/plan/segments.json` and `ice/plan/storyboard.md` are lint clean, every sentence drives a picture change, and the unfinished list is present |
| 05 look | ice-direction decides palette, type and the grammar's look; this workflow makes the mood board and the style frames (how many: `ice-film/references/storyboard.md` section 7) at the explainer floor (full frames, big hero inside a built world, real copy). Runs beside 04 | Required: `ice-direction/references/pitch-round.md` section B; `ice-film/references/storyboard.md` section 7 (mood board and style frames); `ice-styles/SKILL.md`; `references/frame-and-text.md`; `ice-qa/references/studio-benchmark.md`. Only if a card grammar: `references/card-library.md`. Only if a real brand or product: `ice-assets/references/brand-authenticity.md` sections 3-4 | look entries in `ice/DIRECTION.md` each have a reason and a source; the mood board is in `ice/plan/mood-board/` and the style frames in `ice/plan/style-frames/`, full, with real material where the topic is real; clarity read 1 (with 04) passes; for a brand, with the brand test and swap on masked frames; the studio benchmark is logged and a capped gap was told to the user; code-drawn frames pass the art check (`ice-film/references/storyboard.md` section 7) |
| 06 voice-first animatic | Merge 04 and 05. Sample step: the whole film as a skeleton with placeholders on the real voice in the chosen look, plus one fully built sample segment (the hardest one, or the first 30 s for long-form). This sample is the preview for the router's approval stop | Required: `references/verification-loop.md` section 1 | the sample renders with its voice; `ice/plan/segments.json` is locked as the cue sheet; clarity read 2 passes on the sample; approved (the user in step mode; in auto mode the user at the preview stop when it applies, otherwise the critic and approver) |
| 07 build | Every segment built on the word cues, static checks and stills per segment; shot builders per chapter group on long films. Runs beside 08a | Required: the file of the chosen grammar (`references/vox-collage.md`, `references/whiteboard-and-pen.md`, `references/concept-transform.md`, `references/code-and-ui-explainers.md`, or `references/card-library.md` for card films); `references/minimal-motion.md`; `references/frame-and-text.md`; `references/verification-loop.md` section 2. Only if fast mode: `references/fast-pipeline.md`. Only if long-form: `references/long-form-explainers.md` sections 2-3. Only if shot builder sub-agents: `references/roles.md` section 5 | static checks and stills are clean for every segment; the art check confirms 05 on the build; the draft is a new file `ice/renders/draft-<n>.mp4` |
| 08 voice, score, mix | 08a, beside 07: music bed, SFX and the final voice master from the locked segments; no track is used before its sync license check; a replaced voice goes back to the timing step of 03 first. 08b, after 07: mix and master under the voice on the draft | Required: `ice-audio/SKILL.md`. Only if a music track: `ice-audio/references/music-choice-and-licensing.md` section 5. Only if the voice is replaced or arrives late: `references/voice-first-timeline.md` section 9 | 08a: bed, SFX and voice master are in `ice/audio/` with rows in `ice/assets/CREDITS.md`; 08b: the mix sits on the latest draft and the ice-audio loudness gate passes |
| 09 review | Beat landing table, coverage, final-mix re-transcription, a fresh critic round | Required: `references/verification-loop.md`; `ice-qa/SKILL.md`. Only if a critic sub-agent: `references/roles.md` section 6 | clarity read 3 passed before the critic round; reports are in `ice/review/` with P0 and P1 findings fixed; the re-transcribed mix matches the script |
| 10 deliver | Final render after 09 (no further approval in auto mode), then every version planned at 03 (rendered in parallel), with caption sidecars, chapters list and cover when the platform uses them; the delivery report | Required: `references/verification-loop.md` section 8; `ice-qa/references/delivery-report.md` | finals are new files in `ice/renders/final/`; every version in `ice/plan/versions.md` is rendered; `ice/review/NOTE.md` names what was measured and what was not checked, and lists the permissions a brand owner would need |

**Depth by size.** The run mode (section 3) and the size work together; the size never removes the fact check, the real-voice timing, the critic or the final-mix re-transcription.

| Size | Explainer jobs | How the spine runs here |
|---|---|---|
| Micro: 6 s or less, or one asset | one explained term as a card, one animated definition | Three passes: 01, 02 and 05 condensed (the micro count of style frames, `ice-film/references/storyboard.md` section 7) with the script and voice of 03; 07 and 08 together; 09 with one critic round, then 10. 04 shrinks to one segment and 06 is `not_used` |
| Standard: 7 to 60 s, its cutdowns and versions included | a short social explainer, a product or feature explained | Fast or standard mode; full spine, lean crew; stops as the router's table says, with the 06 sample as the preview (fast mode skips the preview) |
| Long or campaign: over 60 s, chapters, or several versions | a full explainer up to about 3 min, a long-form or chaptered film, a series | Standard mode up to about 3 min, long-form mode beyond it; chapters and versions are planned at 03 in `ice/plan/versions.md`; builders and critics per chapter group at 07 and 09 |

**Supplied or partial material.** The router's intake table sets what each supplied item does to its stage. Differences on this route: a topic, article, document or pull request is a source for 01, not proof of third-party claims, so every fact is still sourced; a supplied script is only validated (facts, length budget, banned tells, reported and never rewritten) and the voice and timing steps still run; a recorded voiceover skips the voice step of 03, is trimmed and runs the timing step, and 08 mixes it instead of producing it; a supplied storyboard or shot list is validated against the word cues and gets only the tags and segment fields it lacks. Partial material: fill only the missing fields with this stage's method, log each fill in `ice/DIRECTION.md`, keep the user's own fields unchanged, and keep the stage `partial` until the fills are approved.

## 5. Hard rules

1. Audio is the clock. Cues name a spoken word (plus occurrence and offset), never a typed second. Convert to frames only right before render.
2. Every sentence triggers at least one visible change. A sentence with no picture change is a high-severity defect.
3. Show it when it is said. Elements are fully invisible before their anchor, not dimmed previews.
4. Never invent a number, quote, customer, result, version or real person's face. A claim without a source is cut or shown plainly as a metaphor.
5. Screen text is not the narration. Labels, numbers and short phrases only; never caption the voice in display type. If captions are on, do not also show the sentence being spoken.
6. Required elements are protected: a person introduced gets a name plate, a quantity gets a number-carrying visual, a quote gets its source, a call to action gets its card. Missing one fails the film.
7. Real material first when the topic is real (events, products, places, documents). Invented visuals are for abstract concepts, and never imitate a real photograph. A real brand or product appears only through its real material (live captures, official kits, colours and fonts read from its own site, untouched logos, UI rebuilt at 90 percent fidelity or better); never guess its look (`ice-assets`). Full frames and the explainer floor: `references/frame-and-text.md` section 1.
8. The builder never grades its own work. Critics are fresh-context and read-only.
9. Re-transcribe the final mix and compare it to the script before calling the film done.
10. Arabic or mixed language: call `ice-arabic` for dialect voice, word timing and RTL text before the script step of stage 03.

## 6. Scoped conflicts (both rules hold, in their scope)

Read `references/minimal-motion.md` (section 9, scoped conflicts) when two explainer rules seem to disagree (stillness, camera, cuts, shot length, visual lead, captions) or for the speaking-rate pointer.

## 7. Domain skills this workflow calls

Read `references/run-setup.md` (section 3) when a stage needs a domain skill its row does not name.

## 8. Roles

Read `references/roles.md` (section 7) at stage 01 for the crew row (`crew`, `crew_flags`, critic rounds) and the auto-mode stage approvals, and its role section when briefing a sub-agent.

## 9. Files

| Open | When |
|---|---|
| `references/run-setup.md` | Required: section 1 on every start and resume; all of it at stage 01 (noncommercial gate, run mode, decision rules, pipeline order); section 6 when a domain skill is needed |
| `references/research-and-facts.md` | Stage 01, and whenever a number or name enters the script or screen |
| `references/script-writing.md` | Stage 03 (and 02 for the spine, openings and structures): spine, openings, felt numbers, seams, length budgets, banned tells |
| `references/voice-first-timeline.md` | Stage 03 voice and timing steps, and 08 when the voice is replaced: voice source, trimming, pauses, alignment, retiming |
| `references/semantic-tagging.md` | Stage 04 tagging step: closed tag list, weights, required elements |
| `references/grammar-selection.md` | Stage 04 (and 02 for the film-level family): which visual grammar fits what the narration is doing |
| `references/word-timed-segments.md` | Stage 04 segments step: segment contract, cue anchoring, lead and lag table, lint |
| `references/card-library.md` | Stages 04, 05 and 07: card and scene library logic, shot patterns, rotation |
| `references/minimal-motion.md` | Stage 07: motion rules for talk-driven films, camera and stillness scopes; section 9 when two scoped rules seem to conflict |
| `references/frame-and-text.md` | Stages 05 and 07: hero size, empty stage, screen text, captions decision |
| `references/vox-collage.md` | Building a collage or archival explainer |
| `references/whiteboard-and-pen.md` | Building a whiteboard, hand-drawn, pen or lesson explainer |
| `references/concept-transform.md` | Building a mechanism, math, scale or machine-metaphor explainer |
| `references/code-and-ui-explainers.md` | Pull requests, code, product UI, websites, terminals |
| `references/long-form-explainers.md` | Over 3 min, chapters, persistent world, parallel builders |
| `references/fast-pipeline.md` | Fast mode end to end |
| `references/verification-loop.md` | Stages 06 (sample), 07 (static checks), 09 and 10 |
| `references/roles.md` | Required at stage 01: section 7 (crew row, stage approvals). Briefing a sub-agent (researcher, scriptwriter, annotator, segment planner, shot builder, critic) |
