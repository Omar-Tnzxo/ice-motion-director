# State and resume

Every Ice project keeps its run files in an `ice/` folder inside the user's project. The router owns `ice/state.json`, and this file is its only schema: no skill writes a key that is not listed here. Every stage, in auto mode and in step mode, updates its entry in `stages` when it starts, when it writes its artifact and when it is approved.

## The state tool (use it instead of editing the file)

`scripts/ice-state.mjs` in this skill's folder (Node, no dependencies) is the one writer of `ice/state.json`. Run it from the user's project folder (or pass `--dir <project folder>`); below, `ice-state` stands for `node <ice-motion-director folder>/scripts/ice-state.mjs`.

| Command | Does |
|---|---|
| `ice-state init --project <slug> --route <film, explainer, remake, edit, lottie or ideas> --mode <auto or step>` (optional `--subtype`, `--size`, `--order`, `--language`, `--commercial-use`) | Creates the file at stage 01 with all ten stages; stages left out of the order become `not_used` |
| `ice-state show` | The stage table in plain words and what comes next (the `ice-status` view). `--json` for machines |
| `ice-state check <NN>` | Exit 0: stage NN may run (it prints what to do: run, fill, validate, resume). Exit 1: refused; say the printed sentence to the user, in their language, and stop. Exit 3: the film does not need this stage |
| `ice-state next` | The stage or parallel group to run next; `none` when every stage is ready (the auto loop ends there) |
| `ice-state set <NN> <status> --artifact <path> --notes "<line>"` | Moves a stage (or a part such as `08a`); adds the `history` line; applies the reopening rule; refuses a stage whose earlier stages are not ready |
| `ice-state set <NN> approved --by user` or `--by approver` | Records the approval. In step mode only `--by user` is accepted |
| `ice-state set <key> <value>` | Any top-level key below that is not written by the tool itself, for example `mode step`, `order "<order>"`, `crew standard`, `crew_flags "real brand UI, two languages"`, `run_mode fast` |
| `ice-state set question "<question>" --answer "<answer>" --by user` (or `--by default`) | Adds one stage 01 question and its answer to `questions` |
| `ice-state log --from user` or `--from agent`, with `--text "<text>"` or `--text-file <path>`, plus `--attach <path>` (repeatable) and `--note "<one sentence>"` | Appends one entry to the run log, `ice/log/conversation.jsonl` (section "Run log") |
| `ice-state space --need <GB> [<path> ...]` (optional `--json`; no project needed) | Prints the free disk space of the project folder's drive and of each path (a path not created yet is measured at its nearest existing parent). Exit 0: every one has at least `<GB>` free; exit 1: one is short; exit 2: a usage error. Run it before every download, install and render; the threshold and where to work instead: `ice-engines/references/engine-choice.md` section 7.7, "Disk space" |

Codex users see commands as `$name`: add `--prefix '$'` so the printed command names match. When Node is not installed (the ideas route needs nothing else), edit the file by hand with exactly this schema and apply the rules below yourself.

## ice/state.json

```json
{
  "project": "<short slug chosen at intake>",
  "route": "film | explainer | remake | edit | lottie | ideas",
  "subtype": "<film type, edit type or deliverable named by the workflow>",
  "run_mode": "<optional: the workflow's own run mode, when it has one>",
  "mode": "auto | step",
  "size": "micro | standard | long",
  "order": ["01", "02", "03", ["04", "05"], "06", ["07", "08a"], "08b", "09", "10"],
  "current": "<stage number now running or waiting for review, for example 05>",
  "step": "<optional: the workflow's own step name inside the current stage>",
  "crew": "lean | standard | full",
  "crew_flags": ["<plain complexity flag from the workflow's crew table>"],
  "stages": {
    "01": { "status": "approved", "artifact": "ice/BRIEF.md", "updated": "<ISO 8601>", "notes": "<one line>", "minutes": 12, "roles": ["researcher", "approver"] },
    "08": { "status": "in_progress", "artifact": "ice/audio/", "updated": "<ISO 8601>", "notes": "", "parts": { "a": "approved", "b": "missing" } }
  },
  "commercial_use": "yes | no | unknown",
  "language": "<BCP 47 code of the main version>",
  "questions": [ { "question": "<text>", "answer": "<text>", "answered_by": "user | default" } ],
  "created": "<ISO 8601 date and time>",
  "updated": "<ISO 8601 date and time>",
  "history": [ { "at": "<ISO 8601>", "stage": "<NN>", "note": "<one line: what changed and why>" } ],
  "approvals": [ { "at": "<ISO 8601>", "stage": "<NN or NNx>", "what": "<the artifact approved>", "by": "user | approver role" } ]
}
```

- `subtype` is what the `ice-qa` scripts read as the film type: the film type (`ice-film`), the edit type (`ice-edit`), `explainer` (`ice-explainer`), the type of the new film (`ice-remake`), or the deliverable (`ice-lottie`, `ice-ideas`). It is the same value as the `film_type` slot of `ice/BRIEF.md`. A run mode never goes here.
- `run_mode` is the workflow's own run mode, when it has one: `fast`, `standard` or `long-form` (`ice-explainer` section 3), or the remake mode (`ice-remake` section 1). Optional on other routes.
- `crew` and `crew_flags` are the workflow's crew row and its complexity flags (`ice-film` section 7, `ice-explainer` section 8). Optional on routes without a crew table.
- `questions` is the stage 01 question message and its answers, read by the case study export.
- The `stages` example shows two entries; the real file always has all ten keys, `"01"` to `"10"`.

Each stage entry: `status`, `artifact` (path relative to the project folder, empty while `missing`), `updated` (ISO 8601), `notes` (one line, plain words), and optionally `minutes` (a number, when the agent can measure it), `roles` (the plain role names that worked on it) and `parts` (only for a stage the order splits, see "Stage order"). No other keys.

## Stage statuses

| Status | Meaning | Set when |
|---|---|---|
| `missing` | Nothing exists yet | The project is created and the user supplied nothing for this stage |
| `supplied` | The user gave this artifact complete; it is locked | Intake detects it and every required field is present. It stays `supplied` after validation; it never moves to `in_review` |
| `partial` | The user gave part of it | Intake detects it with fields missing; the gap note was sent |
| `in_progress` | The stage is running | The stage starts, or it is reopened |
| `in_review` | The artifact is written and waits for approval | The artifact is saved; in step mode the review card is shown |
| `approved` | Done | Auto mode: the approver role passed it (router section 5). Step mode: the user said so |
| `not_used` | The route or the size does not use this stage | The route's `## Spine stages` row says `not used`, the size skips it, or the stage order leaves it out |

Rules:
- Create the file in stage 01 as soon as the route is known (router section 3), with `"01"` set to `in_progress` and the other nine stages set from the detection of supplied material and from the route.
- A stage counts as ready for the stages after it only when it is `approved`, `supplied` or `not_used`. A `partial` stage becomes `approved` once its filled fields pass review.
- Never mark a stage `approved` in step mode without the user's own words of approval. Record each approval in `approvals`.
- Reopening a stage (a change request, or its command typed again) sets it to `in_progress`. Every later stage that is `approved` goes back to `in_review` with the note `upstream change in <NN>`. Stages the user supplied stay `supplied`. A planned part of a split stage (for example `08b` after `08a`) is not a reopening.
- `commercial_use` comes from the brief. `unknown` blocks any material marked noncommercial-only until the user answers.
- A reopening also makes files stale, earlier ones included: run the checklist in "Mid-run redirect" before the reopened stage goes back to review.

## Mid-run redirect

A redirect (a change request, a narrowed delivery, a new world or look after review) reopens the stage that owns the change. The status rule above handles `ice/state.json`; this checklist handles the files. When stage NN reopens, `ice-state set NN in_progress` prints the rows below whose "Stale when" column holds NN (only on a reopening, after the usual `Saved.` line). Open each listed file in one pass and either update it or write in the reopened stage's notes that it still holds. Rows of a stage this project does not use are skipped.

- A row can belong to an earlier stage than the one reopened (a storyboard change can break the script's word budget). A small consistency fix there gets a D-entry; a change to that stage's substance reopens it too.
- Never delete a superseded line: mark it (`superseded by <ID>` in the BRIEF ledger, `superseded by D-NN` in `ice/DIRECTION.md`).
- The `ice/plan/` names are the film route's. The other routes keep the `all` rows and check, for every stage from NN on, the files their workflow's `## Spine stages` row names.

| Files | Stage | Route | Stale when | Check |
|---|---|---|---|---|
| `ice/BRIEF.md` requirements ledger | 01 | all | any | Rows the new instruction reverses are marked superseded; the new instruction gets its own row |
| `ice/DIRECTION.md` D-entries | any | all | any | Every entry whose reason cites what changed (a default kit, an old length, an old look) gets a new D-entry |
| `ice/BRIEF.md` slots, `ice/research/COMPLIANCE.md` | 01 | all | 01 | The changed slots; ad rules again when platform, market or industry changed |
| `ice/assets/TRUTH.md`, `ice/assets/facts.json`, `ice/assets/BRAND-MATERIAL.md`, `ice/assets/brand-sheet.json` | 01 | all | 01, 02, 03 | Every claim, number, logo and screen in the new copy is on the truth sheet; the brand material still fits |
| `ice/plan/concepts.md`, the concept D-entry | 02 | film | 01 | Message, audience and goal still match the chosen concept |
| `ice/plan/structure.md` | 02 | film | 01, 02 | Claim, emotional change, length, option and fingerprint line |
| `ice/plan/craft-plan.json` | 02 | film | 01, 02, 03, 04, 05 | One row per craft dimension, every trigger of the changed content answered, no banned reason (`ice-direction/references/treatment.md` section "Craft plan"); checked again at 04 (every `where` id still in the storyboard) and at 05 (the lock against the chosen style): `craft_gate.py plan` |
| `ice/plan/script.md` | 03 | film | 01, 02, 04 | Word budget for the current length and beats, copy of changed beats, every language |
| `ice/plan/hooks.md`, `ice/plan/open-loops.json` | 03 | film | 02, 03, 04, 05 | The openings still lead into the new content; the render study line |
| `ice/plan/versions.md` | 03 | film | 01, 03 | Languages, aspect ratios, cutdowns and lengths match the brief now |
| `ice/plan/storyboard.md`, `ice/plan/shot-plan.md`, `ice/plan/motion-plan.md`, `ice/plan/rough-board.png` | 04 | film | 02, 03, 05 | Beat table, shot contracts, carry and handoff, real copy and reading times, lock lines |
| `ice/plan/TREATMENT.md` | 05 | film | 02, 03, 04, 05 | Claim, world and motion thesis |
| `ice/plan/mood-board/`, `ice/plan/style-frames/`, the look D-entries | 05 | film | 01, 02, 03, 05 | Real copy and brand material on the frames; palette, type, style and sound lead still fit |
| `ice/review/template-distance.md`, `ice/review/look/` | 05 | all | 05 | Nearest template and the 4-of-6 distance for the new look; look gates again |
| `ice/plan/cue-sheet.json`, `ice/plan/stills-board.png`, `ice/renders/animatic.mp4` | 06 | film | 03, 04, 05, 06 | Timing master, every cue, the stills board at the richness floor |
| project source, `ice/renders/draft-<n>.mp4` | 07 | all | 04, 05, 06, 07 | Rebuild the changed shots; a new draft is a new file |
| `ice/plan/sound-plan.md`, `ice/audio/`, `ice/assets/CREDITS.md` | 08 | all | 03, 05, 06, 08 | Voice for changed lines, sound lead, cue placement, credit rows |
| `ice/review/` gate outputs and critic notes | 09 | all | 02, 03, 04, 05, 06, 07, 08, 09 | Old verdicts do not carry to a new draft: gates and critics run again |
| `ice/renders/final/`, `ice/review/NOTE.md`, the fingerprint, `ice/case-study/` | 10 | all | any | New versioned files; never overwrite a delivered render |

## Stage order

`order` lists the stages in the order this project runs them. A nested list is a parallel lane: its stages may run at the same time, and neither waits for the other. A stage with a letter (`08a`, `08b`) is split into parts that run at different points; the stage is ready when every part is. Written as text (the form `Stage order:` lines and `ice-state set order` use): `01 02 03 [04 05] 06 [07 08a] 08b 09 10`.

Take the order, first match wins:
1. `ice-film` and `ice-edit`: the line starting `Stage order:` in the chosen film type or edit type file.
2. Any route: the stage order stated in the active workflow's `## Spine stages` section.
3. Neither found: the default order, `01 02 03 [04 05] 06 [07 08a] 08b 09 10`.

What the default lanes mean:
- **04 with 05.** After 03, the storyboard (rough boards, composition, timing) and the look (mood board and style frames) run in parallel. 06, the animatic, merges both and needs both.
- **07 with 08a, then 08b.** After 06, part 08a (score, sound effects and voice from the locked cue sheet) runs in parallel with 07, the build. Part 08b (mix and master) runs on the 07 draft, after 07.
- **Real screens lead.** Films led by real screens (app ads, UI walkthroughs, product launches with screens) capture the screens in 01 and may run 05 before 04 when the look depends on the captured UI: `01 02 03 05 04 06 [07 08a] 08b 09 10`.

Stages that the order leaves out are `not_used`.

## Resume

1. Run `ice-state show` (or read `ice/state.json`), then read `ice/BRIEF.md`, `ice/DIRECTION.md` and the artifact of the `current` stage.
2. Trust the files over memory. If a file and the chat disagree, the file wins unless the user says otherwise now.
3. Continue at `current` in the recorded `mode`. Never re-ask a question the files already answer.
4. If the user's own new message changes the route (for example ideas become a film), record the change in `history`, update `route` and `order`, and continue at the first stage of the new order that is not ready, reusing every approved file. A route never changes without the user's word.
5. An old state file with a `stage` text field and no `stages` map: `ice-state init` upgrades it (all stages `missing`, a `history` line saying so); then set the stages the old file shows as finished.

## Run log

One small file holds the whole conversation of the run, in auto mode and in step mode: the user's words in full, the agent's replies as short summaries, and every file sent or received. `ice-qa` turns it into the share file `ice/case-study/run-log.html` at delivery (`ice-qa/references/delivery-report.md` section 4). The log is built only from these calls. Never read, copy or import the agent's own transcript or session files: that would break the user's privacy, and transcripts are too large to analyse.

When to log:
- Every user message, verbatim, as soon as it arrives: the first prompt (log it before `init` too; with no state file the entry gets stage 01), the answers to the stage 01 message, every approval, change request and mid-run note. Never shorten, translate or correct it.
- After each turn that ends, or that sends the user a preview, one summary of the reply: 1 to 3 plain sentences, 600 characters at most (a longer one is refused with exit 1; summarise and log again).
- Every file sent to the user or received from them, as `--attach <path>` on the entry of the message that carried it: style frames, mood boards, drafts, contact sheets, the final film, the user's screenshots, references and footage. A file inside the project is referenced by its project-relative path; a file outside it is copied into `ice/log/media/`.
- An image the user pasted into the chat that is not a file on disk: `--note "<one sentence on what it shows>"` on that message's entry. Never invent a file name or save a file that does not exist.

How:
- Short one-line text: `--text "<text>"`.
- Text with several lines, quotes or shell characters: write it, unchanged, to the scratch file `ice/log/pending.txt` (overwrite it each time) and pass `--text-file ice/log/pending.txt`. User text over 4,000 characters is moved to `ice/log/messages/<entry number>.md` and the entry points to it with `text_file`, so the log stays small and nothing is lost.
- Each entry is one JSON line: `at` (UTC, ISO 8601), `stage` (the `current` stage of `ice/state.json`), `from` (`user` or `agent`), `text`, optionally `text_file`, `note`, and `attachments`, a list of `{ "path": "<project-relative path>", "kind": "image | video | audio | text", "direction": "from_user | to_user" }`.
- The log stays verbatim on the user's machine. Masking of keys, tokens, email addresses, phone numbers and absolute paths happens only in the export.

## Folder layout

| Path | Owner | Holds |
|---|---|---|
| `ice/state.json` | router | This schema |
| `ice/BRIEF.md` | `ice-direction` | Brief slots with sources, the business brief, the brand material plan |
| `ice/DIRECTION.md` | `ice-direction` | Decision log (created at 01 with its header) |
| `ice/research/` | `ice-direction` | Dated research notes, `R-NN-<question code>.md`, and the compliance note `COMPLIANCE.md` |
| `ice/plan/` | the workflow | Canonical names: `concepts.md`, `craft-plan.json` (the craft plan: drafted at 02 by `ice-direction`, mapped at 04, locked at 05; `ice-direction/references/treatment.md` section "Craft plan"), `script.md`, `hooks.md` (three openings), `open-loops.json`, `storyboard.md`, `shot-plan.md`, `cue-sheet.json` (format: `ice-audio`), `sound-plan.md`, `motion-plan.md`, `TREATMENT.md` (written by `ice-direction`), `mood-board/`, `style-frames/`, `versions.md` (languages, aspect ratios and cutdowns planned at 03) |
| `ice/assets/` | `ice-assets` | Truth sheet, facts, credits, licensed media, `brand-sheet.json` |
| `ice/audio/` | `ice-audio` | Score, SFX, voiceover, mixes |
| `ice/reference/` | `ice-remake` | Reference frames, measurements, notes |
| `ice/review/` | `ice-qa` | Gate outputs, critic notes, `NOTE.md` delivery report |
| `ice/renders/` | the workflow | `animatic.mp4`, `draft-<n>.mp4`, `final/`; never overwrite a delivered render |
| `ice/log/` | router (`ice-state log`) | The run log: `conversation.jsonl`, `messages/` (long user messages), `media/` (copies of files from outside the project) |
| `ice/case-study/` | `ice-qa` | `case-study.json`, `media/` and the share file `run-log.html`, written at delivery |
