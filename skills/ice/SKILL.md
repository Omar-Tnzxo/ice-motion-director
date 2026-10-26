---
name: ice
description: >-
  Command: runs or resumes Ice Motion Director in auto mode, from the brief to the delivered film. Use
  it only when the user types /ice or $ice.
license: Apache-2.0
metadata:
  author: Omar-Tnzxo
  version: 0.2.1
  opencode/slash: "true"
---

# ice: run or resume the whole production

This is a command. It runs the production spine in auto mode: every remaining stage, stopping only where the router's stops table (`ice-motion-director/SKILL.md` section 5, "Stops") allows. A plain request for a video does the same without the command.

1. Take the text the user typed after the command (in Claude Code it is also given as `$ARGUMENTS`). It may be empty. When it describes a film, it is the request. When it is a change or a note, it is extra direction for the current project.
2. Open the [`ice-motion-director`](../ice-motion-director/SKILL.md) skill.
3. If `ice/state.json` exists in the working folder, run `node <ice-motion-director folder>/scripts/ice-state.mjs set mode auto` ([the script](../ice-motion-director/scripts/ice-state.mjs)) and resume from the first stage that is not ready, as the router's sections 1 and 5 say. Otherwise start a new project from the router's section 1 with that text as the request. Empty text and no project: ask in one plain sentence what the film is for.
4. Follow the router exactly from there. The user can switch to step mode at any point by typing a stage command.
5. Talk to the user in plain words and in their language.
