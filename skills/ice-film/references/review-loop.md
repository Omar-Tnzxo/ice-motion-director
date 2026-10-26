# Review loop

The loop that turns a draft into a film: render, watch, write the defect list, fix, re-render as a new file, repeat. Gates, thresholds, critic scoring rubrics and scans belong to ice-qa; this file runs the loop.

## Contents

1. The loop
2. Builder is never judge
3. Round types
4. Passes
5. Fix order and stop rule
6. Notes from the user
7. Versions and authority
8. Deadline mode

## 1. The loop

`render, watch, write the defect list, fix, re-render as a NEW file, repeat`. Write the defect list before opening an editor. Record every fix in the fix ledger `ice/review/fixes.json` with before and after evidence: the `ice-qa` skill, `references/critic-loop.md` section 5.

## 2. Builder is never judge

- Roles, the fresh read-only critic, and the review packet (what the critic gets and never gets): the `ice-qa` skill, `references/critic-loop.md` sections 1-2. Reviewer brief for this workflow: `../roles/reviewer.md`.
- Before the first full-film round, clarity read 3 must pass: a cold viewer with no brief at all says what the draft sells, what the product does and its one idea, matched by the approver (the `ice-qa` skill, `references/clarity-gate.md`). A fail goes back to its owning stage, not into this loop.
- A fresh critic restates the film's message from the frames alone; if it cannot, the film fails. This restatement does not replace the cold viewer's read, because the critic has read the brief.
- Verification of previous findings (FIXED, PARTLY, STILL PRESENT) and regressions: the same file, section 3.

## 3. Round types

Round types and what each critic checks (storyboard, asset, component, full film, verification, entertainment): the `ice-qa` skill, `references/critic-loop.md` section 3. Prompts with slots and the verdict words per round: the `ice-qa` skill, `references/critic-prompts.md`.

Film-side additions:

- A component gets its own round and its verdict before it is assembled into the film.
- Full-film rounds use contact sheets every 0.1-0.25 s plus dense windows around every transition, and also look small: at phone width and as a thumbnail.

## 4. Passes

The four passes inside one review (full speed, muted, audio only, frame and boundary) and the mandatory visual pass list: the `ice-qa` skill, `references/critic-loop.md` section 3. Note what was seen versus measured.

## 5. Fix order and stop rule

- Severity levels, scores by film type and the triage order: the `ice-qa` skill, `references/critic-loop.md` section 4. Fix the largest meaningful gap first (section 5 of the same file).
- Round limits and stop rules: the same file, section 6. The crew row (`film-setup.md` section 2) sets the planned rounds: lean 2 (one full-film round, one verification round), standard and full up to 3. If issues remain after the planned rounds, stop looping and list them in the delivery note (auto mode) or on the 09 review card (step mode).

## 6. Notes from the user

- Translating a note into a mechanism, asking "at which second?", replacing a disliked effect, and sweeping the film for the same class of issue: the `ice-qa` skill, `references/critic-loop.md` section 7.
- One-note prompt for a fix round: "Fix one thing only: <the note>. Keep the motion, the timing and the loop exactly as they are. Report what changed."

## 7. Versions and authority

- Never overwrite a render; keep the previous version beside the new one for comparison.
- Authority order when signals disagree, and restoring a preferred previous version: the `ice-qa` skill, `references/critic-loop.md` section 6.
- Status labels are only the four in the `ice-qa` skill, `references/delivery-report.md` section 1: technical green, creative candidate, technical green creative rejected, reviewer approved. Unapproved files never carry "final", "master" or "approved" in their names; the delivered master is `<project>_<film>_<aspect>_<length>s_v<N>` until it is approved (`delivery.md` section 2).

## 8. Deadline mode

Deadline mode: the `ice-qa` skill, `references/critic-loop.md` section 6 (row "Deadline mode"). List every component that was not re-verified in the report.

Sources: echris6/motion-video-kit (critic loop), AbubakrChan/product-launch-motion, commercial-motion-design (Omar-Tnzxo), Vincentwei1021/mg-styles-15 (jury rubric), howseen-ai/claude-motion-design, charlie947/motion-graphics-skills, Tejashmakwana/motionmaxxing, nateherkai/herk-edit-kit, video-production-studio (Omar-Tnzxo).
