---
name: ice-01-brief
description: >-
  Step mode: runs stage 01 (brief) of Ice Motion Director, then stops for review. Use it only when
  the user types /ice-01-brief or $ice-01-brief.
license: Apache-2.0
metadata:
  author: Omar-Tnzxo
  version: 0.2.11
  opencode/slash: "true"
---

# ice-01-brief: stage 01, brief

This is a command. It runs stage 01 (brief) of the production spine and nothing else: research on the business, the brand and the industry rules first, then the project brief, the supplied material and the stage 01 questions: every decision the user's words leave open, each with exactly 4 options and one recommended, in rounds of at most 4.

1. Take the text the user typed after the command (in Claude Code it is also given as `$ARGUMENTS`). It may be empty. With no project in the folder yet, it is the request itself: what the film is for, which holds for every later stage. With a project, it is extra direction for this stage.
2. Open the [`ice-motion-director`](../ice-motion-director/SKILL.md) skill's [`references/step-mode.md`](../ice-motion-director/references/step-mode.md) and run its dispatcher (section 2) for stage 01.
3. The dispatcher starts with the state check, run from the user's project folder: `node <ice-motion-director folder>/scripts/ice-state.mjs check 01` ([the script](../ice-motion-director/scripts/ice-state.mjs)). Exit 1: say the printed sentence to the user and stop, changing nothing.
4. Otherwise follow the dispatcher exactly: it starts or opens the project, runs the stage from the active workflow's `## Spine stages` row, and ends with the review card. Ask the stage 01 questions with your question tool before the card (the router's `references/harness.md`); the card shows the answers. Only the user's own words skip them.
5. Stop after the review card. Do not start another stage in this turn unless the user approves and asks to go on.
6. Talk to the user in plain words and in their language.
