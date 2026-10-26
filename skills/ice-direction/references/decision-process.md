# The decision process and DIRECTION.md

Every major decision passes through analysis, dated research, critique, consultation and approval, and is written to `ice/DIRECTION.md`. Builders never grade their own work; critics are separate and read-only.

## Contents

1. Major decisions
2. The loop for one decision
3. Tiers, crew budget and batching
4. Independence
5. Locks and conflicts
6. Bounded effort
7. DIRECTION.md: file shape
8. Entry template
9. Palette and type blocks
10. The heads-up

## 1. Major decisions

| Decision | Decided by | Logged here |
|---|---|---|
| Concept (the telling) | ice-direction | yes |
| Direction (dials, signature move, structure) | ice-direction | yes |
| Palette | ice-direction | yes |
| Type pairing | ice-direction | yes |
| Reference mode and fidelity contract | ice-direction | yes |
| Voice source (when speech is implied) | ice-direction (`questions.md` field Voice source) | yes, as a plain decision without critic |
| Rhythm, motion language, transitions families | `ice-motion` | yes, same entry format, critic loop applies |
| Music, voice casting, sound lead | `ice-audio` | yes, same entry format, critic loop applies |
| Platform, aspect, engine | router and `ice-engines` | yes, as plain decisions without critic |

Minor choices (a single ease, a margin) are not logged here; their owners record them.

## 2. The loop for one decision

1. **Analysis** (director, `roles.md` section 2): state the question, the locked inputs, and at least two options (three for palette, type and direction). Each option names the brief slots and research it rests on.
2. **Research** (researcher, `roles.md` section 1): dated evidence for the open question, built by `research.md`. Skipped only when the decision is locked or the research already exists for this run.
3. **Consultation** (consultant, `roles.md` section 4): one specific question to an audience perspective (culture of the market, color meaning, accessibility, language and script, category expert). The consultant answers with evidence and risks; it never picks. Arabic and RTL questions go through the rules of `ice-arabic`.
4. **Critique** (critic, `roles.md` section 3): a fresh, read-only pass that receives only the options, the brief, the research notes and the consultant's answer. It never receives the director's reasoning or a list of what the director thinks is good. Verdict per option: KEEP, REVISE or REJECT, with reasons and a score.
5. **Revision**: the director revises only what the critic named. At most two revision rounds per decision.
6. **Approval** (approver, `roles.md` section 5): checks the chain (sources, dates, gates, locks). Step mode: after the chain check, the options, the critic's notes and the recommendation go on the stage's review card; the user's approval of the card is the approval. Auto mode: the approver approves and the decision appears in the heads-up and the delivery note, so the user can overturn any decision in one reply. Neither mode adds a user stop (the router's stops table (`ice-motion-director/SKILL.md` section 5, "Stops")).

A decision that fails approval twice: in step mode it goes on the review card as one multiple-choice item (recommended option first); in auto mode the approver picks the critic's highest-scored option, logs why, and the delivery note lists it.

## 3. Tiers, crew budget and batching

The tier from `SKILL.md` section 4 sets which steps of the loop run:

| Tier | Research | Consultant | Critic | Approver |
|---|---|---|---|---|
| Full | every open major decision | for palette, type, concept, and any culture-sensitive choice | every major decision | every major decision |
| Light | RQ-category and RQ-color only | only for culture-sensitive choices | concept and direction (palette and type judged together) | one pass for the set |
| Locked | only for unlocked axes | only when a locked value conflicts with the audience | conflict report only | one pass |
| Change | none unless the change opens a new axis | none | the changed decision | merged with critic |

The crew row of the calling workflow sets how many sub-agents those steps may use: the ice-film skill's `SKILL.md` section 7 (lean, standard, full by film length and complexity) and the ice-explainer skill's `SKILL.md` section 8. Direction roles count inside that row's budget for the whole run; never exceed it and never restate its numbers here. A lean or standard crew runs the Full tier's steps by batching:

- **Batch, never skip.** One researcher dispatch answers every research question of the run. One critic dispatch judges the concept set. One critic dispatch judges the direction set, where each direction option carries its own palette, type, sound lead and motion language, and each of those axes also lists its own options inside the option. One consultant dispatch (standard crew and above, or a culture-sensitive choice) answers all its questions. One approver pass checks every entry.
- **Direction-round axes share the direction's loop.** Palette, type, sound lead and motion language proposed inside the direction round are judged by the direction critic and consultant in that same dispatch; each still gets its own D-entry with its own options, but no separate research, consultant or critic dispatch.
- **Each decision keeps its own record.** A batched dispatch still writes a separate verdict per decision in its report, and every decision still gets its own D-entry with its own options list (two at least, three for concept, direction, palette and type), using the batched fields in section 8. A D-entry without its own options and verdict is returned by the approver, batched or not.
- **Floors that never shrink**: three options and an independent critic at every creative fork; the approver's chain check; research dated today or honestly marked.
- Scale the overhead to the job: a 5 s logo sting does not need the full chain; a launch film does.
- **Stage approvals in auto mode.** A stage whose crew row assigns a critic is judged by it; every other stage passes on the approver's check of its "Done when" column (`roles.md` section 5, "Approving a stage artifact"), and one approver dispatch may cover several stages, each with its own section.

## 4. Independence

- Run critic, consultant and approver in fresh contexts (sub-agents) when the host supports them. Dispatch with the full contents of the role file followed by a `Dispatch context` block (paths to the brief, the options file, research notes) copied verbatim, never paraphrased. Never rely on the child seeing the conversation.
- A step is complete when its artifact exists on disk (`ice/review/direction/<D-id>-<role>.md`; a batched dispatch writes one file named after its first D-id, and each entry it covers points to it). A missing artifact means the child failed: re-dispatch once with the same prompt, then report the failure.
- Hosts where sub-agents are missing, or the host's own permission prompt for them is declined: never ask a question of your own about it; run each role as a separate sequential pass that reads only its inputs, and mark those entries `critic: sequential pass, not independent`.
- The cold viewer of the clarity gate cannot be run as a sequential pass by an agent that knows the plan; without sub-agents follow the ice-qa skill, `references/clarity-gate.md` section 9.
- When a self-score and an independent score differ, the lower one counts. Self-scores run high (in one measured batch, about 10 points above independent review on a 100-point scale).
- Delegated agents may draft; they never pick the creative baseline or certify quality. The director reads their files itself.

## 5. Locks and conflicts

- Locked values (user answers, design file, owner rules, a real brand's material read by the ice-assets skill) are never re-decided. The director checks them for conflicts (contrast, script coverage, platform fit, default-look) and proposes the smallest fix as a new option. A fix that would change a locked value: in step mode it goes on the review card; in auto mode take the smallest fix that leaves the value unchanged (a backing card behind a low-contrast brand color, a larger size, a covering script font), log it and list it in the delivery note.
- A brand whose own palette is blue and purple passes the default-look gate with reason "brand palette" (`anti-sameness.md`); this is logged, not argued.
- Unresolved items stay marked unresolved. Never invent approval.

## 6. Bounded effort

- Fix the largest meaningful gap first; do not average a weak concept with strengths elsewhere.
- Stop at the quality bar, at diminishing returns, or when the user says stop; not after an arbitrary number of rounds. The two-round cap per decision prevents loops; a list that stops shrinking stops the loop.
- Moving what critics keep rejecting forward into the brief or the direction is the most effective speed-up.

## 7. DIRECTION.md: file shape

One file per project, `ice/DIRECTION.md`. One entry per decision: options considered, choice, reason, source. Entries are never deleted; a changed decision gets a new entry that supersedes the old one.

```markdown
# Direction: <project name>
Runtime date: <YYYY-MM-DD>   Mode: <auto / auto, don't ask / step, from the router>   Tier: <full / light / locked / change>   Crew: <lean / standard / full, from the workflow>

## Summary
Concept: <one sentence> (D-01)
Direction: <name and thesis> (D-02)
Palette: <roles and values> (D-03)
Type: <families and roles> (D-04)
Gates: default look <pass / fail / pass with reason D-NN>; distance <n of 6 vs template X>; fingerprint <pass / off>; clarity <read-1 / read-2 / read-3> <PASS / FAIL> r<round>, one per read (the ice-qa skill, `references/clarity-gate.md`); brand test and swap per run (`references/identity-tests.md` section 7 of that skill); benchmark gap (`references/studio-benchmark.md` section 7 of that skill)

## Decisions
<entries, newest last>

## Heads-up
<for the user, see section 10>
```

## 8. Entry template

```markdown
### D-NN <decision name>
Status: proposed | approved | superseded by D-NN | unresolved | unresearched
Question: <what had to be decided>
Locked inputs: <values that could not change, with source>
Options:
- A: <option> (rests on: <slots, research IDs>)
- B: <option> (rests on: ...)
- C: <option> (rests on: ...)
Choice: <letter and name>
Reason: <one to three sentences; why this serves the brief better than the others>
Sources: <brief slot (source) ; R-NN (YYYY-MM-DD) S-n ; reference name and mode ; user answer quoted>
Consultant: <question asked> -> <answer in one line> (ice/review/direction/D-NN-consultant.md)
Critic: <KEEP / REVISE / REJECT per option, score, top note> (ice/review/direction/D-NN-critic.md) [independent | sequential pass, not independent]
Judged in: <own dispatch | batched with D-NN, D-NN in ice/review/direction/D-NN-critic.md, verdict for this decision in its section "D-NN">
Approved by: (left empty by the director)
Gates: <which gates this decision touched and their result>
Left behind: <the most typical option that was deliberately not chosen>
Supersedes: <D-NN or none>
```

Rules:

- The director writes `Status: proposed` and leaves `Approved by` empty. Only two things fill it: the approver, once its report exists on disk, writing `approver agent on <YYYY-MM-DD> (<path of its report>)`; or, in step mode, the user's quoted words and the date from the review card. Only then does the status change to `approved`. A filled `Approved by` with no report or quote behind it is an invented approval (section 5).
- No source, no decision. "Taste" is allowed as a reason only next to at least one brief or research source.
- Quote locked values exactly (hex, font family, weight, user words).
- A decision made in chat is written here at once; a decision that lives only in chat is lost on resume.
- Honest statuses only: `unresearched` when research could not run, `unresolved` when the user must decide, `sequential pass, not independent` when roles could not run separately. Never upgrade a status without the evidence.
- Every value the workflow uses for color, type, rhythm, music and structure must trace to an approved entry. A build value with no entry is a bug to report.

## 9. Palette and type blocks

Palette and type decisions append a machine-readable block after the entry, so other skills read values instead of prose:

```yaml
palette:            # D-NN
  ground: "#RRGGBB"
  surface: "#RRGGBB"
  ink: "#RRGGBB"
  ink_muted: "#RRGGBB"
  accent: "#RRGGBB"
  accent_small_text: "#RRGGBB"   # deeper variant for small text, passes contrast
  accent_2: "#RRGGBB"            # optional, only with a named meaning
  states: {}                      # optional: name -> hex -> meaning
  polarity: light | dark | color-field | photographic
  proportions: "<ground %> / <ink and imagery %> / <accent %>"
  accent_budget: [<what may take the accent>]
  contrast: {ink_on_ground: <ratio>, accent_on_ground: <ratio>, small_text: <ratio>}
  brand_source: "<none | brand guidelines | ice/assets/brand-sheet.json (real brand)>"
type:               # D-NN
  display: {family: "<name>", weights: [<n>], role: "<role>"}
  body: {family: "<name>", weights: [<n>], role: "<role>"}
  scripts: [<latin, arabic, ...>]
  source: user | project | system | google-fonts   # per family; order rule in type-pairing.md section 1
  files: [<font file paths inside the project>]
  reason: "<why this family fits this film best>"
```

## 10. The heads-up

At hand-off write a short heads-up for the user, in their language. In auto mode it is posted while the run continues and copied into the delivery note; in step mode it is part of the review card.

- The concept and direction chosen, each in one line with its reason.
- The capabilities it rides, in plain words.
- The most typical direction deliberately left behind.
- Every inferred or defaulted brief value, grouped apart from what the user stated (voice source, brand ownership and logo defaults included).
- Anything unresearched, unresolved or not independently reviewed; real brand material still missing; official files downloaded under the default (where each came from), or the name set as text because no official file existed.
- One line: "Reply with the number of any decision to change it."

The heads-up lists decisions so the user can overturn any of them in one reply; it never asks a question and never waits for an answer.

Sources: Ice AGENTS.md rule 5 and architecture section 3 (founder); echris6/motion-video-kit Gauntlet (MIT); edenfunf/reelmimic crew roles (MIT); heygen-com/hyperframes subagent dispatch, hand-off and heads-up (Apache-2.0); alchaincyf/huashu-art-motion self-score inflation (MIT, translated); commercial-motion-design delegation, versioning rules and honest statuses (Omar-Tnzxo); AbubakrChan/product-launch-motion DECISION list and log (MIT); Tejashmakwana/motionmaxxing NOTE requirement (Apache-2.0); idea from hypit (files are memory), rewritten.
