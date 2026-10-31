---
name: ice-status
description: >-
  Command: shows each stage of an Ice Motion Director project and what to run next. Use it only when
  the user types /ice-status or $ice-status.
license: Apache-2.0
metadata:
  author: Omar-Tnzxo
  version: 0.2.8
  opencode/slash: "true"
---

# ice-status: where the project is

This is a command. It shows the project's status and changes nothing.

1. Take the text the user typed after the command (in Claude Code it is also given as `$ARGUMENTS`). It may be empty. Use it only to focus the answer (for example on one stage); it never changes the project.
2. Open the [`ice-motion-director`](../ice-motion-director/SKILL.md) skill's [`references/step-mode.md`](../ice-motion-director/references/step-mode.md), section 6.
3. From the user's project folder run `node <ice-motion-director folder>/scripts/ice-state.mjs show` ([the script](../ice-motion-director/scripts/ice-state.mjs)) and present what it prints, translated into the user's language: one summary line, the stage table with plain-word statuses, then what is next and the command to run. Without Node, build the same view as section 6 says.
4. Do not run, revise or approve any stage.
5. Talk to the user in plain words and in their language.
