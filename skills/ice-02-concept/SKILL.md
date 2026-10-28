---
name: ice-02-concept
description: >-
  Step mode: runs stage 02 (concept) of Ice Motion Director, then stops for review. Use it only when
  the user types /ice-02-concept or $ice-02-concept.
license: Apache-2.0
metadata:
  author: Omar-Tnzxo
  version: 0.2.2
  opencode/slash: "true"
---

# ice-02-concept: stage 02, concept

This is a command. It runs stage 02 (concept) of the production spine and nothing else: a divergent pitch with at least two unexpected ideas, the critic's comparison, and one concept with the plain takeaway a first-time viewer must get.

1. Take the text the user typed after the command (in Claude Code it is also given as `$ARGUMENTS`). It may be empty. It is extra direction for this stage.
2. Open the [`ice-motion-director`](../ice-motion-director/SKILL.md) skill's [`references/step-mode.md`](../ice-motion-director/references/step-mode.md) and run its dispatcher (section 2) for stage 02.
3. The dispatcher starts with the state check, run from the user's project folder: `node <ice-motion-director folder>/scripts/ice-state.mjs check 02` ([the script](../ice-motion-director/scripts/ice-state.mjs)). Exit 1: say the printed sentence to the user and stop, changing nothing. Exit 3: say this film does not need the stage and name the next command it printed.
4. Otherwise follow the dispatcher exactly: it runs the stage from the active workflow's `## Spine stages` row and ends with the review card.
5. Stop after the review card. Do not start another stage in this turn unless the user approves and asks to go on.
6. Talk to the user in plain words and in their language.
