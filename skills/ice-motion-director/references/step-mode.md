# Step mode: one stage at a time

Step mode runs one stage of the production spine, writes its artifact, and stops with a review card. The user discusses and revises the stage as long as they want; the stage is approved only on their word. The command skills (`ice`, `ice-status`, `ice-01-brief` to `ice-10-deliver`) all send the agent here. The logic lives only in this file.

Step mode is `ice-direction`'s collaborative mode at every stage: at stage 01 the stage 01 questions (four choices for every open decision slot, in rounds of at most 4) are asked first, before the 01 review card; after 01, every question and every choice a skill would put to the user goes into that stage's review card, never into a separate stop. No skill adds its own stop (`ice-motion-director/SKILL.md` section 5, "Stops").

`ice-state` below stands for `node <ice-motion-director folder>/scripts/ice-state.mjs`, run from the user's project folder (`references/state.md`, "The state tool"). It reads and writes `ice/state.json` and computes every refusal, so you never work out prerequisites by hand. No Node: apply section 3 by hand.

Contents: 1. Commands. 2. The dispatcher. 3. Prerequisites. 4. Review card. 5. Discussion and approval. 6. Status view.

## 1. Commands

| Command | Stage | Runs |
|---|---|---|
| `ice` | none | Auto mode from the first stage not ready (router section 5); starts a new project when there is none |
| `ice-status` | none | The status view (section 6); changes nothing |
| `ice-01-brief` | 01 brief | Research first (business, brand, industry rules), then the project brief, supplied material and the four-choice questions for every open decision |
| `ice-02-concept` | 02 concept | Divergent pitch, critique, one concept |
| `ice-03-script` | 03 script | Copy, on-screen text and voiceover per language, timed to beats; versions and cutdowns planned |
| `ice-04-storyboard` | 04 storyboard | Rough boards, composition, transitions, timing, shot plan |
| `ice-05-look` | 05 look | Mood board, palette, type, style, motion language, sound lead, style frames |
| `ice-06-animatic` | 06 animatic | Storyboard and look merged: timed stills or rough motion with temp sound, cue sheet locked |
| `ice-07-build` | 07 build | The full film in the chosen engine |
| `ice-08-sound` | 08 sound | Part a: score, SFX and voice from the cue sheet. Part b: mix and master on the draft |
| `ice-09-review` | 09 review | Gates and independent critic rounds, fix loop |
| `ice-10-deliver` | 10 deliver | Final renders and versions, captions, delivery report |

The user names the command in the form their agent shows (`/ice-03-script`, `$ice-03-script`, `/ice-motion-director:ice-03-script`); all mean the same. A plain sentence that asks for one stage by name or number (in any language) counts as that stage's command.

## 2. The dispatcher

Run these steps in order for a stage command. `NN` is the stage number of the command; "extra direction" is the text the user typed after it (it may be empty).

1. **Check.** Run `ice-state check NN`.
   - Exit 1: say the printed sentence to the user in their language, then stop. Change nothing. (With no project and `NN` not `01`, the sentence asks them to run `ice-01-brief`; attached material is welcome there, and intake marks it supplied.)
   - Exit 3: say in one plain sentence that this film does not need this stage and why (route or size), name the next command it printed, and stop.
   - Exit 0: continue. The printed line says what to do with the stage: run it, fill only the missing parts of a `partial` one, validate a `supplied` one, resume one in progress, or reopen an approved one.
2. **Start or open the project.** No project and `NN` is `01`: start a new project through router sections 2 and 3 with `--mode step`; the extra direction is the request itself, so write it into `ice/BRIEF.md` slots with `source: prompt` (it holds for every later stage). Stage 01 is `ice-direction/SKILL.md` section 3, Part A, steps 1 to 7: the research of steps 1 to 5 runs before the questions of step 6, and those questions are asked in this turn, in rounds of at most 4 with the agent's question tool (`references/harness.md`), before the 01 review card; the card then shows the answers. Only the user's own words waive them. Part B, steps 8 to 14, runs after 01, at the stages that own each decision (mainly 02 and 05). An existing project: run `ice-state set mode step`. From now on, stop after every stage until the user types `ice` (back to auto mode) or asks in plain words to finish the rest on their own.
3. **Handle the stage's status** (from the check line).
   - `supplied`: do not rebuild it. Validate only facts, timing fit, languages and rights, then go to step 7. It stays `supplied`.
   - `partial`: fill only the missing fields (the gap note already went out at 01), log each one in `ice/DIRECTION.md` with its reason and source, keep the user's own fields as they are.
   - `approved`: the user is reopening it; `ice-state set NN in_progress` applies the reopening rule and prints the files that may be stale (`references/state.md`, "Mid-run redirect"). Then run it again with the extra direction, and update or confirm each printed file in the same pass.
4. **Open the stage row.** Open the active workflow's `SKILL.md`, section `## Spine stages`, the row for `NN`. Open the files that row marks as required, the ones marked "only if" when their condition holds, and nothing from later stages. If the workflow has no such section, use the stage meaning in `references/routes.md` for the route and the workflow's own steps that produce that artifact.
5. **Run the stage.** `ice-state set NN in_progress` (a split stage: the part the check named, for example `08a`). For any stage after 01, the extra direction is a user instruction for this stage: record it in `ice/DIRECTION.md` with `source: user`. It never overrides the hard rules (no invented facts, rights, the quality floor); when it conflicts with one, say which rule and offer the closest version that keeps it. Parallel lane partners (section 3) run in the same turn only when the user asked for both.
6. **Write the artifact** to the path the row names.
7. **Critic pass.** The critic the workflow's crew row assigns to this stage reviews the artifact before the user sees it, never the builder. With no critic assigned to this stage, a fresh read-only check of the row's "Done when" column, item by item, stands in. Fix what it blocks; keep its notes for the card.
8. **Update state.** `ice-state set NN in_review --artifact <path> --notes "<one line>"` (a `supplied` stage keeps its status; only add `--notes`).
9. **Show the review card** (section 4) and stop. Do not start the next stage.

## 3. Prerequisites

A stage is ready when its status is `approved`, `supplied` or `not_used`. A stage's prerequisites are every stage that comes before its group in the project's `order` (`references/state.md`, "Stage order"). Stages in the same bracket are parallel partners and do not wait for each other. `ice-state check` applies all of this; the table is for agents without Node and for explaining a refusal.

Matrix for the default order (`01 02 03 [04 05] 06 [07 08a] 08b 09 10`). Another order: apply the rule above to that order instead of this table.

| Stage | Needs ready first | Parallel partner |
|---|---|---|
| 01 brief | nothing | none |
| 02 concept | 01 | none |
| 03 script | 01, 02 | none |
| 04 storyboard | 01, 02, 03 | 05 |
| 05 look | 01, 02, 03 | 04 |
| 06 animatic | 01 to 05 | none |
| 07 build | 01 to 06 | 08 part a |
| 08 part a: score, SFX, voice | 01 to 06 | 07 |
| 08 part b: mix and master | 01 to 07, 08 part a, and a draft render on disk | none |
| 09 review | 01 to 08, and a draft render on disk | none |
| 10 deliver | 01 to 09 | none |

When the first stage that is not ready is waiting for review, the refusal is the review message ("The <stage> is waiting for review ..."), not the "Before the ..." sentence. Its own command shows its card again.

Extra check: 07 also needs the engine prerequisites (`references/prerequisites.md`). When a tool is missing, tell the user the one install step for their operating system and wait for their consent.

## 4. Review card

Show this at the end of every stage and after every revision. Plain words, short lines, no jargon; technical detail stays in the run files. Write it in the user's language. Placeholders are in angle brackets.

```markdown
### Stage <NN>: <stage name>, ready for your review

**What I made.** <one to three plain sentences>. Saved in `<artifact path>`.

**Preview.**
<the preview for this stage, see the table below>

**Options I considered.**
| Option | In one line | Why it was or was not chosen |
|---|---|---|
| <option> | <what it is> | <reason> |

**Why this one.** <one or two sentences tied to the brief>

**Critic's notes.** <what the critic flagged, what was fixed, anything still open>
<at a stage that closes a cold-viewer clarity read: the viewer's plain answers next to the takeaway, and the match>

**Your choices.** <one to four open choices, each with the recommended option first; or "None, everything is decided">

**Next.** Say "approved" (or anything that means it) to lock this stage, then run `<next command>`. Or tell me what to change: I will revise and show this card again.
```

Clarity read on the card: at 05 (or 04 when it is drawn last), 06 and 09 the stage closes a cold-viewer read. The card shows the viewer's plain answers next to the takeaway written at 02, as the `ice-qa` skill's `references/clarity-gate.md` section 9 says; that file holds the rules, including a failed read and the user's acceptance of one.

What to put under Preview:

| Stage | Preview |
|---|---|
| 01 | The brief as a short table of slots with where each came from, each answered decision slot marked with the user's answer. "Your choices" lists only the slots taken by default (skipped or waived), each with its three alternatives |
| 02 | Every concept in one or two lines, the chosen one first |
| 03 | The script itself, beat by beat with timing, per language; the planned versions and cutdowns |
| 04 | The storyboard table; a contact sheet of the rough boards when they were drawn |
| 05 | The mood board, the style frame images (how many: `ice-film/references/storyboard.md` section 7), the palette and the typefaces in one line each |
| 06 | The animatic file and a contact sheet; the cue sheet beats in one line each |
| 07 | A contact sheet of the draft and three to five key frames |
| 08 | Part a: the score, effects and voice in plain words. Part b: the mix file and its loudness as measured numbers |
| 09 | Each gate with its measured number and pass or fail; what was fixed |
| 10 | Every delivered file with its language, aspect ratio and length; the permissions a brand owner would need; the run log share file `ice/case-study/run-log.html` with its size |

Show images inline when the agent can display them; otherwise give their paths. Options that were not considered for this stage (a supplied artifact, for example) are written as "You supplied this; I checked <what>".

## 5. Discussion and approval

- While the stage is `in_review`, every message about it is a revision request or a question. Revise the artifact, log the change in `ice/DIRECTION.md`, run the critic pass again on what changed, and show the card again with only the changed parts filled in plus the Next line. There is no limit on rounds.
- A request for alternatives (for illustration only, several shapes: "two other concepts", "a warmer palette", "a shorter opening") gets real new options, not a reworded copy of the current one.
- Approval comes only from the user's own words that clearly approve this stage, in any language. When the meaning is unclear, ask one short question: "Shall I lock stage <NN> and move on?" Silence, a thumbs-up on another topic, or approval of a different stage is not approval.
- On approval: `ice-state set NN approved --by user` (a split stage: its part, for example `08a`), then name the next command it prints (both commands when the next group is a parallel lane). If the approving message also asks to go on, start the next stage as if its command was typed.
- If the user asks to change an earlier approved stage, run its command again (step 3 reopens it) and say in one line which later stages go back to review. The review card of the reopened stage lists the stale files it updated and the ones it confirmed.

## 6. Status view

For `ice-status`, run `ice-state show` and present its output, changing nothing: one summary line (project, route and film type, size, mode), the stage table with plain-word statuses, then "Next:" with the command to run. Translate it into the user's language; keep file paths and commands as they are.

Without Node, build the same view from `ice/state.json`. Plain words for statuses: `missing` "not started", `supplied` "you supplied it", `partial` "you supplied part of it", `in_progress` "in progress", `in_review` "waiting for your review", `approved` "approved", `not_used` "not needed for this film". What comes next: the first group in the order with a stage that is not ready; inside it a stage waiting for review first (review it; its command shows the card again), then a stage in progress (its command resumes it), then the stages to run. Everything ready: the film is delivered; changes reopen the stage that owns them.

No `ice/state.json`: say there is no project in this folder yet and that `ice-01-brief` starts one step by step, or `ice` runs everything from one prompt.
