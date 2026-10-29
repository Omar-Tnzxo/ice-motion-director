---
name: ice-05-look
description: >-
  Step mode: runs stage 05 (look) of Ice Motion Director, then stops for review. Use it only when the
  user types /ice-05-look or $ice-05-look.
license: Apache-2.0
metadata:
  author: Omar-Tnzxo
  version: 0.2.4
  opencode/slash: "true"
---

# ice-05-look: stage 05, look

This is a command. It runs stage 05 (look) of the production spine and nothing else: a mood board, then palette, type, style, motion language and sound lead, shown as style frames made with the brand's real material (how many: `ice-film/references/storyboard.md` section 7). It can run at the same time as stage 04 (storyboard); once both are drawn, a first-time viewer who knows nothing of the plan must understand them.

1. Take the text the user typed after the command (in Claude Code it is also given as `$ARGUMENTS`). It may be empty. It is extra direction for this stage.
2. Open the [`ice-motion-director`](../ice-motion-director/SKILL.md) skill's [`references/step-mode.md`](../ice-motion-director/references/step-mode.md) and run its dispatcher (section 2) for stage 05.
3. The dispatcher starts with the state check, run from the user's project folder: `node <ice-motion-director folder>/scripts/ice-state.mjs check 05` ([the script](../ice-motion-director/scripts/ice-state.mjs)). Exit 1: say the printed sentence to the user and stop, changing nothing. Exit 3: say this film does not need the stage and name the next command it printed.
4. Otherwise follow the dispatcher exactly: it runs the stage from the active workflow's `## Spine stages` row and ends with the review card.
5. Stop after the review card. Do not start another stage in this turn unless the user approves and asks to go on.
6. Talk to the user in plain words and in their language.
