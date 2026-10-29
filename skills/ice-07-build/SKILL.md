---
name: ice-07-build
description: >-
  Step mode: runs stage 07 (build) of Ice Motion Director, then stops for review. Use it only when the
  user types /ice-07-build or $ice-07-build.
license: Apache-2.0
metadata:
  author: Omar-Tnzxo
  version: 0.2.3
  opencode/slash: "true"
---

# ice-07-build: stage 07, build

This is a command. It runs stage 07 (build) of the production spine and nothing else: the full film in the chosen engine, at the film type's richness floor, rendered as a draft. The score, sound effects and voice (stage 08, part a) can be made at the same time.

1. Take the text the user typed after the command (in Claude Code it is also given as `$ARGUMENTS`). It may be empty. It is extra direction for this stage.
2. Open the [`ice-motion-director`](../ice-motion-director/SKILL.md) skill's [`references/step-mode.md`](../ice-motion-director/references/step-mode.md) and run its dispatcher (section 2) for stage 07.
3. The dispatcher starts with the state check, run from the user's project folder: `node <ice-motion-director folder>/scripts/ice-state.mjs check 07` ([the script](../ice-motion-director/scripts/ice-state.mjs)). Exit 1: say the printed sentence to the user and stop, changing nothing. Exit 3: say this film does not need the stage and name the next command it printed.
4. Otherwise follow the dispatcher exactly, engine prerequisites first: it runs the stage from the active workflow's `## Spine stages` row and ends with the review card.
5. Stop after the review card. Do not start another stage in this turn unless the user approves and asks to go on.
6. Talk to the user in plain words and in their language.
