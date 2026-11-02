---
name: ice-08-sound
description: >-
  Step mode: runs stage 08 (sound) of Ice Motion Director, then stops for review. Use it only when the
  user types /ice-08-sound or $ice-08-sound.
license: Apache-2.0
metadata:
  author: Omar-Tnzxo
  version: 0.2.21
  opencode/slash: "true"
---

# ice-08-sound: stage 08, sound

This is a command. It runs stage 08 (sound) of the production spine and nothing else. The stage has two parts: part a, the score, sound effects and voice from the locked cue sheet (it can run while the film is built); part b, the mix and master on the draft render, after the build. Each run of the command does the next part that is not done.

1. Take the text the user typed after the command (in Claude Code it is also given as `$ARGUMENTS`). It may be empty. It is extra direction for this stage.
2. Open the [`ice-motion-director`](../ice-motion-director/SKILL.md) skill's [`references/step-mode.md`](../ice-motion-director/references/step-mode.md) and run its dispatcher (section 2) for stage 08.
3. The dispatcher starts with the state check, run from the user's project folder: `node <ice-motion-director folder>/scripts/ice-state.mjs check 08` ([the script](../ice-motion-director/scripts/ice-state.mjs)). It names the part to run (`08a` or `08b`). Exit 1: say the printed sentence to the user and stop, changing nothing. Exit 3: say this film does not need the stage and name the next command it printed.
4. Otherwise follow the dispatcher exactly for that part: it runs it from the active workflow's `## Spine stages` row and ends with the review card.
5. When the film has a narrator, part 08a takes, picks and fits the voice by the `ice-audio` skill's [`references/voice-director.md`](../ice-audio/references/voice-director.md) (sections 5 to 8): every take recorded in `ice/audio/voice/lines.json`, then `python <ice-audio folder>/scripts/voice_fit.py --project . fit ice/audio/voice/lines.json --apply` (exit 1 names the lines to rewrite or re-take; never more speed) and `python <ice-audio folder>/scripts/voice_fit.py --project . rows ice/audio/voice/lines.json`, so every take is on record for the gate below.
6. In part 08b, on the draft mix and before the review card: `node <ice-assets folder>/scripts/validate-assets.mjs --project . --audio-only` ([the script](../ice-assets/scripts/validate-assets.mjs)). Exit 1 blocks: every sound needs a real source on record and no project code may make sound (the `ice-audio` skill, core rule 7); fix the mix, never the record.
7. Stop after the review card. Do not start another stage in this turn unless the user approves and asks to go on.
8. Talk to the user in plain words and in their language.
