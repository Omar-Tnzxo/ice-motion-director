# Harness: tool names per agent

Tool names differ by agent. Read only the section for the agent you are running in, once per session.

Contents: [Claude Code](#claude-code-cli-desktop-and-ide), [Codex](#openai-codex-cli-ide-and-app), [Gemini CLI and Antigravity](#gemini-cli-and-antigravity), [any other agent](#any-other-agent).

Stage 01 questions on every agent (`ice-direction/references/questions.md` section 2): every open decision slot is asked, exactly 4 options per question built from the brief and the research, the recommended option first and marked "(Recommended)" with a one-line reason, the user free to write their own answer, at most 4 questions per round and several rounds when more slots are open. Only the user's own words waive them. The rows below map that shape to each agent's tool.

Sub-agents on every agent: run critics, approvers and checkers in the foreground, or wait for each one you started in the background before you continue. Never end a turn "waiting for the approver" while that approver is your own sub-agent: the turn is yours until it returns. A sub-agent returns its findings as text; the agent that started it writes the files the run needs (an `ANALYSIS.md`, a review note), because some harnesses keep sub-agents from writing files. When the director itself runs as a sub-agent and a write is refused, write the file under another name or folder, copy it to the path the run expects, and say so in the decision log.

## Claude Code (CLI, desktop and IDE)

| Need | Use |
|---|---|
| Sub-agent for a role (critic, researcher, builder) | The `Agent` tool. Give each role a fresh agent with the role brief from the owning skill; a critic never sees the builder's reasoning, only the files |
| Web research | `WebSearch` for discovery, `WebFetch` to read a page. Build every query from brief slots plus today's date (`ice-direction` research rules) |
| Stage 01 questions | `AskUserQuestion`, one call per round: up to 4 questions (its limit), each with a header of at most 12 characters, `multiSelect: false`, and exactly 4 options; the recommended option first, its label ending in "(Recommended)"; each description says what the viewer will see or hear. The tool adds the free answer ("Other") itself, so never spend one of the 4 options on it |
| Run scripts and tools | `Bash` or `PowerShell`, whichever the session offers; call scripts with paths relative to the skill folder |
| Read and write files | `Read`, `Write`, `Edit` |
| Look at frames or contact sheets | `Read` on the image file |
| Parallel work | Several `Agent` calls in one message, each owning different files |

Skills from this plugin are invoked as `ice-motion-director:<skill>` when installed as a plugin, or by their plain name when installed as skills. Stage commands are typed `/ice-01-brief`; the plugin form `/ice-motion-director:ice-01-brief` always works. The text after the command arrives as `$ARGUMENTS`.

## OpenAI Codex (CLI, IDE and app)

| Need | Use |
|---|---|
| Sub-agent for a role | Use Codex sub-agents when your version offers them. Otherwise run each role as a separate step: write the role's output to its file, then review from the files only, never from the builder's chain of thought |
| Web research | The web search tool when it is enabled for the session. If it is off, say so, ask the user to enable it or to supply sources, and record the gap in `ice/DIRECTION.md` |
| Stage 01 questions | A question tool when the session offers one, with the same shape as Claude Code. Otherwise one chat message per round: up to 4 numbered questions, each with options a) to d), a) marked "(Recommended)" with its reason, then "Or write your own answer" (template: `ice-direction` questions section 2), and wait for the reply |
| Run scripts and tools | The shell tool; respect the sandbox and ask before any network or install step |
| Read and write files | The file and patch tools |
| Other skills | Mention a skill by name (`$ice-film`) to load it; domain skills of this plugin load only when named |
| Stage commands | The user types `$ice-01-brief` and the like; the text after it is the extra direction for the stage. Run the state tool with `--prefix '$'` so the commands it prints match |

## Gemini CLI and Antigravity

| Need | Use |
|---|---|
| Sub-agent for a role | Use sub-agents when your version offers them. Otherwise run each role as a separate step and review from the files only |
| Web research | The Google web search and web fetch tools. Every query is built from brief slots plus today's date; drop any term that does not trace to the brief |
| Stage 01 questions | A question tool when your version offers one, with the same shape as Claude Code. Otherwise one chat message per round: up to 4 numbered questions, each with options a) to d), a) marked "(Recommended)" with its reason, then "Or write your own answer", and wait for the reply |
| Run scripts and tools | The shell command tool; ask before any network or install step |
| Read and write files | The file read and write tools |
| Stage commands | Gemini CLI: `/ice-01-brief` and the like come from the extension's `commands/` files, which name the skill to open. Antigravity: the same names as skills |

Before acting on any rule, open the file the skill names and read it. Do not rely on memory of a similar skill: rules here are scoped to film types and an unscoped guess is usually wrong.

## Any other agent

Cursor, GitHub Copilot, Windsurf, Cline, Roo Code, Kilo Code, OpenCode, Amp, Goose, Kiro, Qwen Code and others.

| Need | Use |
|---|---|
| Sub-agent for a role | Your agent's sub-agent or task feature if it has one. Without it, run each role as a separate step: write the output to its file, then review from the files only |
| Web research | Your web search tool if available. Without it, ask the user for sources or to enable search, and log the gap in `ice/DIRECTION.md`. Never fill a research gap from memory and present it as research |
| Stage 01 questions | Your agent's question tool when it has one (with the same shape as Claude Code: up to 4 questions, 4 options each, recommended first). Otherwise one chat message per round: up to 4 numbered questions, each with options a) to d), a) marked "(Recommended)" with its reason, then "Or write your own answer", and wait for the reply |
| Run scripts and tools | Your terminal tool. Ask before installs or network calls |
| Skills | Open a skill by reading `skills/<name>/SKILL.md` in the installed folder when your agent does not load skills by name |
| Stage commands | Most agents show skills as `/ice-01-brief` and the like. When yours shows no commands, the user can write "run stage 01" or "show the status" in plain words; treat that the same way |

Rules that matter most on agents without sub-agents:
- Keep building and reviewing apart in time: finish and save the build, then start the review as a new step that reads only the saved files and the role brief.
- Read the exact reference file a skill names before acting; do not guess a rule from a similar tool.
