---
name: ice-03-script
description: >-
  Step mode: runs stage 03 (script) of Ice Motion Director, then stops for review. Use it only when
  the user types /ice-03-script or $ice-03-script.
license: Apache-2.0
metadata:
  author: Omar-Tnzxo
  version: 0.2.21
  opencode/slash: "true"
---

# ice-03-script: stage 03, script

This is a command. It runs stage 03 (script) of the production spine and nothing else: the copy, on-screen text and voiceover for each language, timed to the beats, plus the plan for versions and cutdowns.

1. Take the text the user typed after the command (in Claude Code it is also given as `$ARGUMENTS`). It may be empty. It is extra direction for this stage.
2. Open the [`ice-motion-director`](../ice-motion-director/SKILL.md) skill's [`references/step-mode.md`](../ice-motion-director/references/step-mode.md) and run its dispatcher (section 2) for stage 03.
3. The dispatcher starts with the state check, run from the user's project folder: `node <ice-motion-director folder>/scripts/ice-state.mjs check 03` ([the script](../ice-motion-director/scripts/ice-state.mjs)). Exit 1: say the printed sentence to the user and stop, changing nothing. Exit 3: say this film does not need the stage and name the next command it printed.
4. Otherwise follow the dispatcher exactly: it runs the stage from the active workflow's `## Spine stages` row and ends with the review card.
5. When the film has a narrator (the `voice` answer at 01 is the user's recording or their voice provider), the script also writes `ice/audio/voice/lines.json`: each line's display and spoken sides, its direction (intent, energy, delivery, tags) and its slot (the `ice-audio` skill, [`references/voice-director.md`](../ice-audio/references/voice-director.md) section 4). For Arabic, numbers are words in the film's variety and the marking follows the `ice-arabic` skill's `references/voice-arabic.md`; then `python <ice-arabic folder>/scripts/spoken_numbers.py check ice/audio/voice/lines.json` must pass.
6. Stop after the review card. Do not start another stage in this turn unless the user approves and asks to go on.
7. Talk to the user in plain words and in their language.
