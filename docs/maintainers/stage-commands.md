# Stage commands: design and per-agent findings

Founder rule 10 asks for two first-class paths: one plain prompt for everyone, and numbered stage commands in the spec-kit style for people who want to steer. This file records how the commands are built and why. Findings checked on 2026-10-20; recheck each agent's docs before a release.

## Design

- **Commands are skills.** One thin skill per command: `ice` (run or resume auto mode), `ice-status` (where the project is), `ice-01-brief` to `ice-10-deliver` (one stage each). Each body only takes the typed text as extra direction and opens the router's `references/step-mode.md`; the dispatcher, the prerequisites matrix and the review card live there once (rule 7, one canonical rule).
- **Never implicit.** Each command skill's description says to use it only when the user types the command, and its `agents/openai.yaml` sets `allow_implicit_invocation: false`. The router stays the only skill that triggers on its own.
- **Portable frontmatter only:** `name`, `description`, `license`, `metadata` (`author`, `version`, `opencode/slash: "true"`).
- **Gemini CLI** gets one `commands/<name>.toml` per command: a `description` and a multiline `prompt` that names the `ice-motion-director` skill and ends with `{{args}}`.
- **Plain words still work.** On an agent with no command support, "run stage 03" or "show the status" maps to the same dispatcher.
- **Budget.** 12 skills (24 files) plus 12 TOML files. The router's route and harness files were merged (10 files into 2) to pay for part of it. The file budget is 512 as the aim and 600 as the hard limit (`tests/repo.test.mjs`).

## What the reference projects did

spec-kit, superpowers and hyperframes all moved from command files to skills, so their commands are now skills that agents list as slash commands. We follow the same pattern.

## Per agent

| Agent | How the user types it | Notes |
|---|---|---|
| Claude Code | `/ice-01-brief` | Skills show as `/name` when `name` is set. In a plugin the namespaced form `/ice-motion-director:ice-01-brief` always works. The typed text arrives as `$ARGUMENTS` |
| Cursor, VS Code, Copilot CLI, Cline, Kiro | `/ice-01-brief` | Skills show as `/name` |
| Qwen Code | `/ice-01-brief` | Extension skills are namespaced as `/ext:skill` |
| Antigravity | `/ice-01-brief` | Workflows ended on 2026-10-19; use skills |
| Codex | `$ice-01-brief` | Custom prompts are deprecated; commands without arguments are migrated to skills |
| Gemini CLI | `/ice-01-brief` | Never shows skills as slash commands, so the extension ships `commands/*.toml` with `{{args}}` |
| OpenCode | `/ice-01-brief` | Needs `metadata.opencode/slash: "true"` |
| Amp | plain words | Custom commands were removed |
| Zed | plain words | No custom commands |

## Tests

`tests/metadata.test.mjs` checks every command skill: present, portable frontmatter, `opencode/slash`, the "use it only when the user types" description, a thin body that takes `$ARGUMENTS` and links the step-mode file, `allow_implicit_invocation: false`, a short description of 30 characters or fewer, and a matching TOML with `{{args}}`.
