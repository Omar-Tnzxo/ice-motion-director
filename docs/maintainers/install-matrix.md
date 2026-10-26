# Install matrix (verified 2026-10-19)

This file is the verified source for every install command in the README. Each row cites the page or source file it was checked against on 2026-10-19. Anything that could not be checked against a primary source is marked **UNVERIFIED** and must not appear in the README until someone verifies it.

Placeholders used below:

- Repo: `Omar-Tnzxo/ice-motion-director` (HTTPS: `https://github.com/Omar-Tnzxo/ice-motion-director`).
- Plugin name and marketplace name: both `ice-motion-director` (the `name` in `.claude-plugin/marketplace.json`, `.agents/plugins/marketplace.json` and every `plugin.json` must match this, see section D).
- `<skill>`: a folder name under `skills/`. The router skill is the one most users need.

Path notation: `~` means the user home. On Windows that is `%USERPROFILE%` in cmd and `$HOME` (same as `$env:USERPROFILE`) in PowerShell, for example `C:\Users\<you>`. A path written `~/.claude/skills` is `%USERPROFILE%\.claude\skills` in cmd and `$HOME\.claude\skills` in PowerShell. Paths starting with `~/.config/` stay under the home folder on Windows too (`%USERPROFILE%\.config\...`); this was confirmed on a Windows 11 machine for `~/.config/opencode`.

While the repo is private, every remote install below needs git credentials that can read it (git credential helper, `gh auth login`, or SSH). Public installs need nothing extra.

---

## A. Universal installers

### A1. `skills` CLI by Vercel Labs (recommended one-liner)

Source: https://github.com/vercel-labs/skills (README and `src/agents.ts`, `src/installer.ts`, `src/skill-lock.ts` read on 2026-10-19). npm package `skills`, latest 1.7.2, requires **Node 22.20.0 or newer** (`npm view skills engines`).

Same command on macOS, Linux, WSL, Windows PowerShell and Windows cmd. The README leads with the interactive form, which asks for the agents and the scope (project or global); every skill stays selected because the skills open each other:

```
npx skills add Omar-Tnzxo/ice-motion-director
```

The no-questions form for every agent, global: `npx skills add Omar-Tnzxo/ice-motion-director -g --all` (`--all` is `-s '*' -a '*' -y`). Flags re-checked against `npx skills@1.7.4 add --help` on 2026-10-26. There is no command that lists agent names: an unknown name with `-a` stops the install and prints every valid name.

| Task | Command |
|---|---|
| Install, interactive (pick skills, agents, scope) | `npx skills add Omar-Tnzxo/ice-motion-director` |
| List skills in the repo without installing | `npx skills add Omar-Tnzxo/ice-motion-director --list` |
| Install one skill | `npx skills add Omar-Tnzxo/ice-motion-director --skill <skill>` |
| Install globally (user dir) instead of project | add `-g` (or `--global`) |
| Pick agents | `-a claude-code -a codex -a cursor` (repeatable; `--agent '*'` for all) |
| Everything, no prompts | `npx skills add Omar-Tnzxo/ice-motion-director --all` |
| CI or scripted | `npx skills add Omar-Tnzxo/ice-motion-director --skill <skill> -g -a claude-code -y` |
| Copy instead of symlink | add `--copy` |
| Use a skill without installing | `npx skills use Omar-Tnzxo/ice-motion-director@<skill>` (prints a prompt; add `--agent claude-code` to launch the agent) |
| List installed | `npx skills list` (alias `ls`; `-g` for global; `-a <agent>` to filter) |
| Update | `npx skills update` (all), `npx skills update <skill>`, `-g` global only, `-p` project only, `-y` non-interactive |
| Remove | `npx skills remove <skill>`, `npx skills remove Omar-Tnzxo/ice-motion-director` (everything from this source), `--global`, `--agent <a>`, `--all` |
| Search the registry | `npx skills find <query>` |

Other accepted sources: full GitHub URL, `.../tree/main/skills/<skill>` URL, any git URL (`git@github.com:...`), GitLab and Azure Repos URLs, local path, or a direct `SKILL.md`/archive URL.

How it works (from source):

- **Scope**: project install (default) writes to `./<agent dir>/skills/`; `-g` writes to the agent's global dir (table A3).
- **Canonical copy**: skills are copied once into `.agents/skills/` (project) or `~/.agents/skills/` (global) and each agent dir links to that copy. The lock file is `~/.agents/.skill-lock.json` (or `$XDG_STATE_HOME/skills/.skill-lock.json`).
- **Agent detection**: each agent has a `detectInstalled` check that looks for its config folder in the home dir, for example `~/.claude` (or `$CLAUDE_CONFIG_DIR`) for Claude Code, `~/.codex` (or `$CODEX_HOME`) for Codex, `~/.cline` for Cline, `~/.config/amp` for Amp, `~/.gemini/antigravity` for Antigravity, `%APPDATA%\Zed` for Zed on Windows. If none is found, it asks which agents to target.
- **Discovery in our repo**: it walks `skills/` (up to 3 levels) and also reads skills declared in `.claude-plugin/marketplace.json` and `.claude-plugin/plugin.json`. A `SKILL.md` needs `name` and `description` in its frontmatter or it is skipped.
- **Windows**: symlinks are created as **directory junctions** (`symlink(..., 'junction')`), so no admin rights or Developer Mode are needed. Use `--copy` on file systems that do not support junctions (some network drives, FAT32 USB sticks) or when the repo will be zipped.
- **Telemetry**: anonymous; disable with `DISABLE_TELEMETRY=1` or `DO_NOT_TRACK=1`.

Shell quoting:

- macOS, Linux, WSL, PowerShell: `--skill '*'` works.
- cmd: single quotes are passed literally. Use `--all`, or `--skill "*"`.
- PowerShell on a fresh Windows install: if `npx` fails with "running scripts is disabled on this system", the default execution policy blocks `npx.ps1`. Either run `npx.cmd skills add ...` or allow local scripts once for the current user: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`. This is standard Windows PowerShell behavior, not something specific to `skills`.

### A2. Other universal installers

| Tool | Install our repo | Update | Remove | Notes | Source |
|---|---|---|---|---|---|
| GitHub CLI `gh skill` | `gh skill install Omar-Tnzxo/ice-motion-director --all --agent claude-code --scope user` | `gh skill update` | UNVERIFIED (no remove subcommand listed) | Flags: `--agent`, `--scope project\|user` (default project), `--pin <tag or sha>`, `--dir <path>`, `--all`. Aliases `gh skill add`, `gh skills add`. Non-interactive default agent is `github-copilot`. Supports about 50 agents. Minimum `gh` version not stated. | https://cli.github.com/manual/gh_skill_install |
| `openskills` | `npx openskills install Omar-Tnzxo/ice-motion-director` then `npx openskills sync` | `npx openskills update` | `npx openskills remove <skill>` | Default `./.claude/skills`; `--universal` uses `./.agent/skills`; `--global` uses `~/.claude/skills`. `sync` writes the skill list into `AGENTS.md`. Node 20.6+. Last npm publish 2026-01-17 (1.5.0), so treat as low maintenance. | https://github.com/numman-ali/openskills |
| `skillkit` | `npx skillkit add Omar-Tnzxo/ice-motion-director` | `skillkit update` | `skillkit remove <skill>` or `skillkit remove --source Omar-Tnzxo/ice-motion-director` | Detects installed agents (claims 46), `skillkit sync` writes into agent configs, `skillkit translate <skill> --to cursor` converts formats. Node 18+. npm 1.24.0. | https://github.com/rohitg00/skillkit |
| Amp `amp skill add` | `amp skill add Omar-Tnzxo/ice-motion-director` | UNVERIFIED | UNVERIFIED | Amp only. `--global` installs under `~/.config/agents/skills/`. Whether a multi-skill repo installs all skills is UNVERIFIED. | https://ampcode.com/docs/customize/skills |

Recommendation: the README shows A1 first. `gh skill` is worth one line because many users already have `gh`. Do not lead with `openskills` or `skillkit`.

### A3. Agents supported by `npx skills` and their directories

Copied from the README's supported-agents table (2026-10-19, 80 agents total). Project paths are relative to the repo you work in; global paths live under the home folder (Windows: `%USERPROFILE%`).

| Agent | `--agent` | Project | Global |
|---|---|---|---|
| AiderDesk | `aider-desk` | `.aider-desk/skills/` | `~/.aider-desk/skills/` |
| Amp, Replit, Universal | `amp`, `replit`, `universal` | `.agents/skills/` | `~/.config/agents/skills/` |
| Antigravity | `antigravity` | `.agents/skills/` | `~/.gemini/antigravity/skills/` |
| Antigravity CLI | `antigravity-cli` | `.agents/skills/` | `~/.gemini/antigravity-cli/skills/` |
| AstrBot | `astrbot` | `data/skills/` | `~/.astrbot/data/skills/` |
| Autohand Code CLI | `autohand-code` | `.autohand/skills/` | `~/.autohand/skills/` |
| Augment | `augment` | `.augment/skills/` | `~/.augment/skills/` |
| IBM Bob | `bob` | `.bob/skills/` | `~/.bob/skills/` |
| Claude Code | `claude-code` | `.claude/skills/` | `~/.claude/skills/` |
| OpenClaw | `openclaw` | `skills/` | `~/.openclaw/skills/` |
| Cline, Codex, Dexto, fx, Kimi Code CLI, Loaf, Pi, Sarvam Code, Warp, Zed | `cline`, `codex`, `dexto`, `fx`, `kimi-code-cli`, `loaf`, `pi`, `sarvam-code`, `warp`, `zed` | `.agents/skills/` | `~/.agents/skills/` |
| CodeArts Agent | `codearts-agent` | `.codeartsdoer/skills/` | `~/.codeartsdoer/skills/` |
| CodeBuddy | `codebuddy` | `.codebuddy/skills/` | `~/.codebuddy/skills/` |
| Codemaker | `codemaker` | `.codemaker/skills/` | `~/.codemaker/skills/` |
| Code Studio | `codestudio` | `.codestudio/skills/` | `~/.codestudio/skills/` |
| Command Code | `command-code` | `.commandcode/skills/` | `~/.commandcode/skills/` |
| Continue | `continue` | `.continue/skills/` | `~/.continue/skills/` |
| Cortex Code | `cortex` | `.cortex/skills/` | `~/.snowflake/cortex/skills/` |
| Crush | `crush` | `.crush/skills/` | `~/.config/crush/skills/` |
| Cursor | `cursor` | `.agents/skills/` | `~/.cursor/skills/` |
| Deep Agents | `deepagents` | `.agents/skills/` | `~/.deepagents/agent/skills/` |
| Devin for Terminal | `devin` | `.devin/skills/` | `~/.config/devin/skills/` |
| Droid (Factory) | `droid` | `.agents/skills/` | `~/.factory/skills/` |
| Eve | `eve` | `agent/skills/` | project only |
| Firebender | `firebender` | `.agents/skills/` | `~/.firebender/skills/` |
| ForgeCode | `forgecode` | `.forge/skills/` | `~/.forge/skills/` |
| Gemini CLI | `gemini-cli` | `.agents/skills/` | `~/.gemini/skills/` |
| GitHub Copilot | `github-copilot` | `.agents/skills/` | `~/.copilot/skills/` |
| Goose | `goose` | `.goose/skills/` | `~/.config/goose/skills/` |
| Grok Build | `grok` | `.grok/skills/` | `~/.grok/skills/` |
| Hermes Agent | `hermes-agent` | `.hermes/skills/` | `~/.hermes/skills/` |
| inference.sh | `inference-sh` | `.inferencesh/skills/` | `~/.inferencesh/skills/` |
| Jazz | `jazz` | `.jazz/skills/` | `~/.jazz/skills/` |
| Junie | `junie` | `.junie/skills/` | `~/.junie/skills/` |
| iFlow CLI | `iflow-cli` | `.iflow/skills/` | `~/.iflow/skills/` |
| Kilo Code | `kilo` | `.agents/skills/` | `~/.kilo/skills/` |
| Kimchi | `kimchi` | `.kimchi/skills/` | `~/.config/kimchi/harness/skills/` |
| Kiro CLI | `kiro-cli` | `.kiro/skills/` | `~/.kiro/skills/` |
| Kode | `kode` | `.kode/skills/` | `~/.kode/skills/` |
| Lingma | `lingma` | `.lingma/skills/` | `~/.lingma/skills/` |
| MCPJam | `mcpjam` | `.mcpjam/skills/` | `~/.mcpjam/skills/` |
| MiniMax Code | `minimax-code` | `.minimax/skills/` | `~/.minimax/skills/` |
| Mistral Vibe | `mistral-vibe` | `.vibe/skills/` | `~/.vibe/skills/` |
| Moxby | `moxby` | `.moxby/skills/` | `~/.moxby/skills/` |
| Mux | `mux` | `.mux/skills/` | `~/.mux/skills/` |
| OpenCode | `opencode` | `.agents/skills/` | `~/.config/opencode/skills/` |
| OpenHands | `openhands` | `.openhands/skills/` | `~/.openhands/skills/` |
| Ona | `ona` | `.ona/skills/` | `~/.ona/skills/` |
| Posit Assistant | `posit-assistant` | `.posit/assistant/skills/` | `~/.posit/assistant/skills/` |
| Qoder | `qoder` | `.qoder/skills/` | `~/.qoder/skills/` |
| Qoder CN | `qoder-cn` | `.qoder/skills/` | `~/.qoder-cn/skills/` |
| Qwen Code | `qwen-code` | `.qwen/skills/` | `~/.qwen/skills/` |
| Reasonix | `reasonix` | `.reasonix/skills/` | `~/.reasonix/skills/` |
| Rovo Dev | `rovodev` | `.rovodev/skills/` | `~/.rovodev/skills/` |
| Roo Code | `roo` | `.roo/skills/` | `~/.roo/skills/` |
| Tabnine CLI | `tabnine-cli` | `.tabnine/agent/skills/` | `~/.tabnine/agent/skills/` |
| Terramind | `terramind` | `.terramind/skills/` | `~/.terramind/skills/` |
| Tinycloud | `tinycloud` | `.tinycloud/skills/` | `~/.tinycloud/skills/` |
| Trae | `trae` | `.trae/skills/` | `~/.trae/skills/` |
| Trae CN | `trae-cn` | `.trae/skills/` | `~/.trae-cn/skills/` |
| Windsurf (Devin Desktop) | `windsurf` | `.windsurf/skills/` | `~/.codeium/windsurf/skills/` |
| ZCode | `zcode` | `.zcode/skills/` | `~/.zcode/skills/` |
| Zencoder, Zenflow | `zencoder`, `zenflow` | `.zencoder/skills/` | `~/.zencoder/skills/` |
| Neovate | `neovate` | `.neovate/skills/` | `~/.neovate/skills/` |
| Pochi | `pochi` | `.pochi/skills/` | `~/.pochi/skills/` |
| PromptScript | `promptscript` | `.agents/skills/` | project only |
| AdaL | `adal` | `.adal/skills/` | `~/.adal/skills/` |

Where an agent's own docs disagree with this table, section B lists the agent's own paths and the README must follow the agent's docs for manual installs.

---

## B. Per-agent matrix

Support levels:

- **Native plugin**: the agent installs our repo as a plugin or extension and gets updates through its own manager.
- **Native skills**: the agent reads `SKILL.md` folders from a directory; install with `npx skills` or a manual copy.
- **Rules-only fallback**: no skill loader; point the agent at the router `SKILL.md` through its rules file.

### B0. Manual copy recipe (all OSes)

Every "manual" cell below means: clone once, then copy the `skills/` folders into `DEST`.

macOS, Linux, WSL:

```bash
git clone --depth 1 https://github.com/Omar-Tnzxo/ice-motion-director /tmp/imd
mkdir -p "DEST" && cp -R /tmp/imd/skills/. "DEST/"
```

Windows PowerShell:

```powershell
git clone --depth 1 https://github.com/Omar-Tnzxo/ice-motion-director "$env:TEMP\imd"
New-Item -ItemType Directory -Force "DEST" | Out-Null
Copy-Item -Recurse -Force "$env:TEMP\imd\skills\*" "DEST"
```

Windows cmd:

```bat
git clone --depth 1 https://github.com/Omar-Tnzxo/ice-motion-director "%TEMP%\imd"
xcopy "%TEMP%\imd\skills" "DEST" /E /I /Y
```

Update a manual install: `git -C /tmp/imd pull` (PowerShell `git -C "$env:TEMP\imd" pull`, cmd `git -C "%TEMP%\imd" pull`), then repeat the copy. Prefer `npx skills update` where it applies.

### B1. Matrix

| Agent | Support | Install | Update | Manual DEST (macOS/Linux, Windows) | Windows and OS notes | Source |
|---|---|---|---|---|---|---|
| **Claude Code** (CLI, Desktop Code tab, VS Code, JetBrains) | Native plugin | In a session: `/plugin marketplace add Omar-Tnzxo/ice-motion-director` then `/plugin install ice-motion-director@ice-motion-director`. From any shell: `claude plugin marketplace add Omar-Tnzxo/ice-motion-director` then `claude plugin install ice-motion-director@ice-motion-director` (add `--scope project` or `--scope local`). One step (v2.1.292+): `claude plugin install ice-motion-director --marketplace Omar-Tnzxo/ice-motion-director`. Desktop app: **+ > Plugins > Add plugin**. VS Code: `/plugins`. | `claude plugin update ice-motion-director@ice-motion-director`, or `/plugin` > Marketplaces > Update marketplace. Third-party marketplaces have auto-update **off** by default; users can enable it in `/plugin` > Marketplaces. Remove: `claude plugin uninstall ice-motion-director@ice-motion-director`. | Skills only: `~/.claude/skills/<skill>/` (project `.claude/skills/`). Windows `%USERPROFILE%\.claude\skills\`. | Same commands in PowerShell, cmd, macOS, Linux, WSL. In WSL the plugin lands in the Linux home, not visible to Claude Code running on Windows. Pin a tag with `#v1.0.0` after the repo. Skills invoked as `/ice-motion-director:<skill>`. Validate before release: `claude plugin validate .` | https://code.claude.com/docs/en/discover-plugins , https://code.claude.com/docs/en/plugin-marketplaces , https://code.claude.com/docs/en/skills ; CLI help checked locally on 2.1.303 |
| **Claude.ai and Claude Desktop (chat, Cowork)** | Native plugin (account level) or uploaded skill | Plugin: **Customize > Plugins > Add > Add marketplace**, enter `Omar-Tnzxo/ice-motion-director` (private repos need the Claude GitHub App). Or **Add > Upload plugin** with a `.zip` holding exactly one `.claude-plugin/plugin.json`. Single skill: zip the skill folder, then **Customize > Skills > + > Create skill > Upload a skill**. Requires **Settings > Capabilities > Code execution and file creation** on Free, Pro, Max. | **Check for updates** on the plugin, or turn on **Sync automatically** for a github.com marketplace. Uploaded skills: re-upload. | Not applicable | Same on every OS (browser or Desktop app). Zip on Windows: right-click > Compress, or PowerShell `Compress-Archive -Path skills\<skill> -DestinationPath <skill>.zip`; macOS/Linux `zip -r <skill>.zip <skill>`. Folder name must equal the skill `name`. Size limits: see platform-support page (not checked). | https://claude.com/docs/plugins/overview , https://support.claude.com/en/articles/12512180-using-skills-in-claude |
| **Codex CLI** | Native plugin | `codex plugin marketplace add Omar-Tnzxo/ice-motion-director` (pin with `@ref` or `--ref main`), then `codex plugin add ice-motion-director@ice-motion-director`, or open `/plugins` in a session and install. Start a new session afterwards. | `codex plugin marketplace upgrade ice-motion-director`. Remove: `codex plugin remove ice-motion-director@ice-motion-director`, `codex plugin marketplace remove ice-motion-director`. | Skills only: `~/.agents/skills/<skill>/` (repo: `.agents/skills/`). Windows `%USERPROFILE%\.agents\skills\`. | `codex plugin add/list/remove` verified in `openai/codex` main (`codex-rs/cli/src/plugin_cmd.rs`) and used by Leonxlnx/taste-skill; docs page only shows marketplace commands and `/plugins`. Cache: `~/.codex/plugins/cache/<marketplace>/<plugin>/<version>/` (`%USERPROFILE%\.codex\...`). `CODEX_HOME` overrides `~/.codex`. Docs list no `~/.codex/skills`; use `~/.agents/skills`. In-session installer: `$skill-installer`. | https://developers.openai.com/plugins/build/plugins , https://learn.chatgpt.com/docs/plugins , https://learn.chatgpt.com/docs/build-skills , https://github.com/openai/codex/blob/main/codex-rs/cli/src/plugin_cmd.rs |
| **Codex app (ChatGPT desktop)** | Native plugin | **Plugins** tab, search or browse, open details, select **+**. Reads repo marketplaces at `.agents/plugins/marketplace.json` and legacy `.claude-plugin/marketplace.json`. | From the Plugins tab. | Not applicable | Adding a personal GitHub marketplace in the app UI is not documented ("workspace admins can import and sync a GitHub marketplace"): UNVERIFIED for individual users. Upload limit for a Codex plugin archive is 100 MB (per hyperframes README, UNVERIFIED in OpenAI docs). | https://learn.chatgpt.com/docs/plugins , https://developers.openai.com/plugins/build/plugins |
| **Cursor** | Native plugin + native skills | Team marketplace: Dashboard **Plugins & MCPs > Import from Repo** with the GitHub URL (needs `.cursor-plugin/marketplace.json`), then each user installs from **Customize**. Skills only: `npx skills add Omar-Tnzxo/ice-motion-director -a cursor`. `/add-plugin <name>` works only for plugins in Cursor's public marketplace (seen in obra/superpowers README; not in Cursor docs: UNVERIFIED). | Team marketplace **Enable Auto Refresh** (re-index at most every 10 min) or **Refresh**. Skills: `npx skills update`. | Project `.agents/skills/` or `.cursor/skills/`; global `~/.agents/skills/` or `~/.cursor/skills/` (`%USERPROFILE%\.cursor\skills\`). Also reads `.claude/skills/`, `.codex/skills/` and their `~` versions. | No OS-specific steps in docs. | https://cursor.com/docs/context/skills , https://cursor.com/docs/plugins |
| **Gemini CLI** | Native plugin (extension) | `gemini extensions install https://github.com/Omar-Tnzxo/ice-motion-director` (flags: `--ref <ref>`, `--auto-update`, `--pre-release`, `--consent`, `--skip-settings`). Needs `git`. Not available inside the interactive CLI. | `gemini extensions update ice-motion-director` or `--all`. Remove: `gemini extensions uninstall ice-motion-director`. | Skills only: `~/.gemini/skills/` or `~/.agents/skills/` (workspace `.gemini/skills/` or `.agents/skills/`). Or `gemini skills install https://github.com/Omar-Tnzxo/ice-motion-director.git --path skills/<skill> --scope user --consent`. | Installs to `~/.gemini/extensions/` (`%USERPROFILE%\.gemini\extensions\`). Restart the CLI after changes. Google moved unpaid and Google One users from Gemini CLI to Antigravity CLI on 2026-06-18, so list Antigravity CLI right next to it. Help output checked locally on 0.51.0. | https://geminicli.com/docs/extensions/reference/ , https://geminicli.com/docs/cli/skills/ |
| **Antigravity CLI (`agy`)** | Native plugin (converts Claude plugins) | `agy plugin install https://github.com/Omar-Tnzxo/ice-motion-director` | Reinstall with the same command (no `update` subcommand). Remove: `agy plugin uninstall ice-motion-director`. | `~/.gemini/antigravity-cli/skills/` (workspace `.agents/skills/`). | Verified locally: `agy plugin validate` rejects a Claude-only layout with "This looks like a Claude Code plugin: `plugin install` converts it". A root `plugin.json` (or `.antigravity-plugin/` / `.gemini-plugin/`) loads natively and passed `agy plugin validate`. `agy plugin import gemini\|claude` imports existing installs. | https://antigravity.google/docs/skills , https://antigravity.google/docs/plugins ; local `agy plugin --help` and `agy plugin validate` |
| **Antigravity app and IDE** | Native skills | `npx skills add Omar-Tnzxo/ice-motion-director -a antigravity` (writes the legacy global path) or manual copy. | `npx skills update` | Workspace `.agents/skills/` (legacy `.agent/skills/` still read). Global `~/.gemini/config/skills/` (legacy `~/.gemini/antigravity/skills/` still read). Windows `%USERPROFILE%\.gemini\config\skills\`. | Docs give no Windows notes; both global folders were found on a Windows 11 test machine. | https://antigravity.google/docs/skills |
| **GitHub Copilot CLI** | Native plugin | `copilot plugin marketplace add Omar-Tnzxo/ice-motion-director` then `copilot plugin install ice-motion-director@ice-motion-director` (or `/plugin install ice-motion-director@ice-motion-director` in a session). | `copilot plugin update ice-motion-director`. Remove: `copilot plugin uninstall ice-motion-director`. | `~/.copilot/skills/` or `~/.agents/skills/`; project `.github/skills/`, `.claude/skills/`, `.agents/skills/`. | Reads `marketplace.json` from `.github/plugin/` first, then `.claude-plugin/`. Which `plugin.json` paths it accepts is not stated (UNVERIFIED). | https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/plugins-finding-installing , https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/plugins-marketplace , https://docs.github.com/en/copilot/concepts/agents/about-agent-skills |
| **GitHub Copilot in VS Code** | Native plugin + native skills | Command Palette **Chat: Install Plugin From Source**, enter `https://github.com/Omar-Tnzxo/ice-motion-director`. Or add the repo to setting `chat.plugins.marketplaces` and install from Extensions view `@agentPlugins`. Requires `chat.plugins.enabled: true`. Skills only: `npx skills add Omar-Tnzxo/ice-motion-director -a github-copilot`. | **Extensions: Check for Extension Updates** (auto every 24 h with `extensions.autoUpdate`). Bump `version` to ship an update. | Project `.github/skills/`, `.claude/skills/`, `.agents/skills/`; personal `~/.copilot/skills/`, `~/.claude/skills/`, `~/.agents/skills/`. | Recognized manifests: root `plugin.json` (Agent Plugins 1.0 or Copilot), `.claude-plugin/plugin.json`, `.plugin/plugin.json`. `chat.agentSkillsLocations` is deprecated. | https://code.visualstudio.com/docs/copilot/customization/agent-plugins , https://code.visualstudio.com/docs/copilot/customization/agent-skills |
| **Windsurf (now Devin Desktop)** | Native skills | `npx skills add Omar-Tnzxo/ice-motion-director -a windsurf` or manual. | `npx skills update` | Workspace `.devin/skills/` (legacy `.windsurf/skills/` read). Global `~/.codeium/windsurf/skills/` or `~/.config/devin/skills/`. Also `.agents/skills/` and `~/.agents/skills/`. | Docs only give Windows paths for enterprise system skills (`C:\ProgramData\Devin\skills\`). Windsurf docs URL now redirects to docs.devin.ai. | https://docs.devin.ai/desktop/cascade/skills |
| **Cline** | Native skills | `npx skills add Omar-Tnzxo/ice-motion-director -a cline` or manual. | `npx skills update` | Project `.cline/skills/` (recommended), `.clinerules/skills/`, `.claude/skills/`. Global `~/.cline/skills/`, Windows `C:\Users\USERNAME\.cline\skills\`. | Conflict: `npx skills` writes Cline to `.agents/skills/` and `~/.agents/skills/`, which Cline's docs do not list. For Cline, document the manual path `~/.cline/skills/` until Cline confirms `.agents/skills`. Skills are on by default. | https://docs.cline.bot/features/skills |
| **Roo Code** | Native skills | `npx skills add Omar-Tnzxo/ice-motion-director -a roo` or manual. | `npx skills update` | Project `.roo/skills/` or `.agents/skills/`; global `~/.roo/skills/` or `~/.agents/skills/`. Windows `%USERPROFILE%\.roo\skills\`. Mode-specific: `.roo/skills-<mode>/`. | Docs moved to roocodeinc.github.io. | https://roocodeinc.github.io/Roo-Code/features/skills |
| **Kilo Code** | Native skills | `npx skills add Omar-Tnzxo/ice-motion-director -a kilo` or manual. | `npx skills update` | Project `.kilo/skills/` or `.agents/skills/`; global `~/.kilo/skills/` (Windows `\Users\<you>\.kilo\skills\`) or `~/.agents/skills/`. | `.kilocode/skills/` is not in current docs. | https://kilo.ai/docs/customize/skills |
| **OpenCode** | Native skills | `npx skills add Omar-Tnzxo/ice-motion-director -a opencode` or manual. | `npx skills update` | Project `.opencode/skills/`, `.claude/skills/`, `.agents/skills/`; global `~/.config/opencode/skills/`, `~/.claude/skills/`, `~/.agents/skills/`. Windows `%USERPROFILE%\.config\opencode\skills\` (confirmed on disk). | OpenCode also has its own plugin system (obra/superpowers uses an `.opencode/INSTALL.md` flow); not needed for skills. | https://opencode.ai/docs/skills |
| **Amp** | Native skills | `amp skill add Omar-Tnzxo/ice-motion-director` (`--global` for `~/.config/agents/skills/`) or `npx skills add ... -a amp`. | UNVERIFIED for `amp skill`; `npx skills update` | Project `.agents/skills/` or `.claude/skills/`; global `~/.config/agents/skills/`, `~/.agents/skills/`, `~/.config/amp/skills/`, `~/.claude/skills/`, `~/.claude/plugins/cache/`. | Amp also reads Claude Code plugin caches, so a Claude Code plugin install is visible to Amp. | https://ampcode.com/docs/customize/skills |
| **Goose** | Native skills | `npx skills add Omar-Tnzxo/ice-motion-director -a goose` or manual. | `npx skills update` | Project `.agents/skills/` (also `.goose/skills/`, `.claude/skills/`); global `~/.agents/skills/` (also `~/.claude/skills/`). Plugins: `~/.agents/plugins/<name>/`. | Conflict: `npx skills` writes global Goose skills to `~/.config/goose/skills/`, which current Goose docs no longer list. Document `~/.agents/skills/` for manual installs. Built-in Skills extension is on by default. | https://goose-docs.ai/docs/guides/context-engineering/using-skills |
| **Kiro (IDE, CLI, Web)** | Native skills | IDE/CLI/Web: Kiro panel > **Agent Steering & Skills** > **+** > **Import a skill** > GitHub, paste `https://github.com/Omar-Tnzxo/ice-motion-director/tree/main/skills/<skill>` (repo root URLs are rejected). Or `npx skills add ... -a kiro-cli`. | Re-import; `npx skills update` | Workspace `.kiro/skills/`; global `~/.kiro/skills/` (docs mark global as IDE only). | Kiro CLI custom agents must add `"resources": ["skill://.kiro/skills/**/SKILL.md"]` in `.kiro/agents/<agent>.json` (vercel-labs/skills README). | https://kiro.dev/docs/skills/ |
| **Qwen Code** | Native plugin (reads Claude and Gemini formats) | `qwen extensions install Omar-Tnzxo/ice-motion-director` (pick the plugin when prompted), or `qwen extensions install https://github.com/Omar-Tnzxo/ice-motion-director:ice-motion-director` for the Claude marketplace entry. | `qwen extensions update ice-motion-director` or `--all`. Remove: `qwen extensions uninstall ice-motion-director`. | `~/.qwen/skills/` (project `.qwen/skills/`). | Claude plugins are converted at install. Under cmd, POSIX hook gates do not run (we ship no hooks, so no impact). | https://qwenlm.github.io/qwen-code-docs/en/users/extension/introduction/ , https://qwenlm.github.io/qwen-code-docs/en/users/features/skills/ |
| **Trae / Trae CN** | Native skills | `npx skills add Omar-Tnzxo/ice-motion-director -a trae` (or `-a trae-cn`). | `npx skills update` | Project `.trae/skills/`; global `~/.trae/skills/` (CN: `~/.trae-cn/skills/`). | Official page did not render for verification: paths are from vercel-labs/skills only. UI import flow UNVERIFIED. | https://docs.trae.ai/ide/skills (unreadable), vercel-labs/skills README |
| **Zed** | Native skills | Manual copy (no CLI install in docs) or `npx skills add ... -a zed`. | `npx skills update` | Global `~/.agents/skills/`; project `<worktree>/.agents/skills/`. Each skill must be a direct child (no nesting). Project skills load only from trusted worktrees. | Docs give no Windows path; `npx skills` detects Zed on Windows via `%APPDATA%\Zed`. | https://zed.dev/docs/ai/skills |
| **Warp** | Native skills | `npx skills add Omar-Tnzxo/ice-motion-director -a warp` or manual. | `npx skills update` | Project `.warp/skills/`, `.agents/skills/` (also `.claude/skills/`, `.codex/skills/`); global `~/.agents/skills/`. | Official skills page returned 404; paths from Warp's "Skills as Agents" page and warpdotdev/oz-skills: precedence order UNVERIFIED. | https://docs.warp.dev/agent-platform/cloud-agents/skills-as-agents , https://github.com/warpdotdev/oz-skills |
| **Augment (Auggie CLI and IDE)** | Native skills | `npx skills add Omar-Tnzxo/ice-motion-director -a augment` or manual. | `npx skills update` | Project `.augment/skills/`, `.claude/skills/`, `.agents/skills/`; global `~/.augment/skills/`, `~/.claude/skills/`, `~/.agents/skills/`. | No Windows notes in docs. | https://docs.augmentcode.com/cli/skills |
| **Continue** | Native skills (UNVERIFIED in Continue docs) | `npx skills add Omar-Tnzxo/ice-motion-director -a continue` | `npx skills update` | `.continue/skills/`, `~/.continue/skills/` (vercel-labs/skills only). | Continue's skills docs page returned 404; a docs branch exists but was not confirmed live. Treat as UNVERIFIED. | vercel-labs/skills README |
| **JetBrains Junie** | Native skills (UNVERIFIED in Junie docs) | `npx skills add Omar-Tnzxo/ice-motion-director -a junie` | `npx skills update` | `.junie/skills/`, `~/.junie/skills/` (vercel-labs/skills and `gh skill` list Junie). | Junie docs site rendered empty. UNVERIFIED. Claude Code itself runs in JetBrains terminals, so Claude Code users there use the Claude Code row. | vercel-labs/skills README, https://cli.github.com/manual/gh_skill_install |
| **Factory Droid** | Native skills; plugin commands UNVERIFIED in Factory docs | Skills: `npx skills add Omar-Tnzxo/ice-motion-director -a droid`. Plugin (per obra/superpowers README): `droid plugin marketplace add https://github.com/Omar-Tnzxo/ice-motion-director` then `droid plugin install ice-motion-director@ice-motion-director`. | `npx skills update` | Project `.factory/skills/` (also `.agents/skills/`, `.agent/skills/`); global `~/.factory/skills/` (also `~/.agents/skills/`). | Factory skills docs do not document `droid plugin`. | https://docs.factory.com/cli/configuration/skills |
| **Kimi Code CLI** | Native skills; plugin UNVERIFIED | `npx skills add Omar-Tnzxo/ice-motion-director -a kimi-code-cli`. Plugin (per obra/superpowers README): `/plugins install https://github.com/Omar-Tnzxo/ice-motion-director`. | `npx skills update` | Project `.kimi-code/skills/` or `.agents/skills/`; user `~/.kimi-code/skills/` (`$KIMI_CODE_HOME/skills/`) or `~/.agents/skills/`. | No Windows notes. | https://moonshotai.github.io/kimi-code/en/customization/skills |
| **Grok Build CLI** | Native plugin (UNVERIFIED in xAI docs) | Per obra/superpowers and pbakaus/impeccable READMEs: `grok plugin install Omar-Tnzxo/ice-motion-director --trust`. Skills: `npx skills add ... -a grok`. | `npx skills update` | `.grok/skills/`, `~/.grok/skills/` (`$GROK_HOME`). | Not checked against xAI docs. | vercel-labs/skills README |
| **Devin CLI** | Native plugin (UNVERIFIED in Devin docs) | Per obra/superpowers README: `devin plugins install Omar-Tnzxo/ice-motion-director`. Skills: `npx skills add ... -a devin`. | `devin plugins update ice-motion-director` (same source) | `.devin/skills/`, `~/.config/devin/skills/`. | Not checked against Devin docs. | https://docs.devin.ai/desktop/cascade/skills (paths only) |
| **Any other agent** (no skill loader) | Rules-only fallback | Clone (B0) anywhere, then add one line to the agent's rules file (`AGENTS.md`, `.cursorrules`, `CONVENTIONS.md`, and so on): "For any video, motion or editing request, read `<clone path>/skills/<router>/SKILL.md` first and follow it." | `git pull` in the clone | Not applicable | Use an absolute path; on Windows write it with forward slashes or escaped backslashes. | Agent Skills spec: https://agentskills.io |

---

## C. README install-section pattern

### What the top repos do (READMEs read on 2026-10-19)

| Repo | Stars | First install line | Structure |
|---|---|---|---|
| obra/superpowers | 301,881 | Claude Code official marketplace `/plugin install superpowers@claude-plugins-official` | `## Installation` then one `###` heading per agent (Claude Code, Antigravity, Codex App, Codex CLI, Cursor, Devin CLI, Factory Droid, Gemini CLI, Copilot CLI, Grok, Kimi, OpenCode, Pi, Qwen, Hermes, Muse), each with install and update; separate `## Updating`. No universal installer line. |
| nextlevelbuilder/ui-ux-pro-max-skill | 137,453 | Claude marketplace two-liner | Big `for-the-badge` shield row, then `## Installation`: Claude marketplace, own CLI (`uipro init --ai <agent>`), global install, `## Prerequisites` (Python). |
| Leonxlnx/taste-skill | 99,130 | `npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"` | One-liner first, then collapsed `<details>` blocks: "Claude Code plugin", "Codex plugin" (`codex plugin marketplace add` + `codex plugin add`), "From a clone". Flat badges including "Agent Skills compatible" and an install badge linking to `#install`. |
| pbakaus/impeccable | 82,938 | Quote-box quick start at line 5: `npx impeccable install` | `## Installation` with numbered options (CLI installer recommended, git submodule, plugin, website download, copy from repo with project and global path per agent). Ships a `.cmd` launcher for Windows. |
| heygen-com/hyperframes | 67,215 | `claude plugin marketplace add` + `claude plugin install` under "With an AI coding agent" | Badges (npm, downloads, license, `node >=22`), Quick Start with Claude plugin first, then `npx skills add`, then manual CLI. Per-OS install lines (macOS brew, Ubuntu apt, Windows winget) for prerequisites. |
| remotion-dev/skills | 5,358 | `npx skills add remotion-dev/skills` | One line, then the skills list. |

### The pattern

1. A hero, then one small badge row (license, "Agent Skills compatible", supported agents count, an "Install" badge that jumps to `#install`). Keep badges flat, not `for-the-badge`, so they fit on phones.
2. The **one-liner first**, above the fold: the universal installer. Then the strongest native plugin path (Claude Code) as the second block.
3. Every other agent in its own **collapsible `<details>` block**, each holding install, update and remove, with the command in a fenced block. The most popular agents first (Claude Code, Codex, Cursor, Gemini or Antigravity, Copilot), then alphabetical.
4. Prerequisites per OS in their own collapsible block, with winget, brew and apt lines side by side (hyperframes style).
5. A short "Update" and "Uninstall" section, and a link to this matrix for every other agent.
6. Never more than two commands per agent in the visible part; long explanations go below the fold or into docs.

### Draft README section for this repo

Commands below come only from section B rows that are verified. Rows marked UNVERIFIED are left out on purpose.

````markdown
## Install

**Any agent (Claude Code, Codex, Cursor, Gemini, Copilot, Windsurf, Cline, Roo, Kilo, OpenCode, Antigravity, Amp, Goose, Kiro, Qwen, Trae, Zed, Warp and 60 more):**

```bash
npx skills add Omar-Tnzxo/ice-motion-director
```

It asks which agents to install into and whether to install for this project or globally. Keep every skill selected: the skills open each other. A flags table follows (`-g --all`, repeated `-a`, `-g`, `--copy`). The live version of this section is the README; keep the two in step.

**Claude Code plugin (recommended for Claude Code):**

```bash
claude plugin marketplace add Omar-Tnzxo/ice-motion-director
claude plugin install ice-motion-director@ice-motion-director
```

Inside a session the same thing is `/plugin marketplace add Omar-Tnzxo/ice-motion-director` then `/plugin install ice-motion-director@ice-motion-director`.

<details>
<summary><b>Claude.ai and Claude Desktop</b></summary>

Open **Customize > Plugins > Add > Add marketplace** and enter `Omar-Tnzxo/ice-motion-director`. Turn on **Code execution and file creation** in **Settings > Capabilities** first. Updates: **Check for updates** on the plugin page.
</details>

<details>
<summary><b>Codex (CLI and app)</b></summary>

```bash
codex plugin marketplace add Omar-Tnzxo/ice-motion-director
codex plugin add ice-motion-director@ice-motion-director
```

Or run `/plugins` in Codex and install it from there. Start a new session afterwards. Update: `codex plugin marketplace upgrade ice-motion-director`. In the Codex app, use the **Plugins** tab.
</details>

<details>
<summary><b>Cursor</b></summary>

```bash
npx skills add Omar-Tnzxo/ice-motion-director -a cursor
```

Teams can import the repo as a team marketplace (Dashboard, Plugins & MCPs, Import from Repo) and install it from **Customize**.
</details>

<details>
<summary><b>Gemini CLI and Antigravity</b></summary>

```bash
gemini extensions install https://github.com/Omar-Tnzxo/ice-motion-director
agy plugin install https://github.com/Omar-Tnzxo/ice-motion-director
```

Update Gemini with `gemini extensions update ice-motion-director`; reinstall with the same `agy` command to update Antigravity CLI. Antigravity app and IDE: `npx skills add Omar-Tnzxo/ice-motion-director -a antigravity`.
</details>

<details>
<summary><b>GitHub Copilot (CLI and VS Code)</b></summary>

```bash
copilot plugin marketplace add Omar-Tnzxo/ice-motion-director
copilot plugin install ice-motion-director@ice-motion-director
```

VS Code: Command Palette, **Chat: Install Plugin From Source**, paste `https://github.com/Omar-Tnzxo/ice-motion-director`. Update: `copilot plugin update ice-motion-director`.
</details>

<details>
<summary><b>Qwen Code</b></summary>

```bash
qwen extensions install Omar-Tnzxo/ice-motion-director
```

Update: `qwen extensions update ice-motion-director`.
</details>

<details>
<summary><b>Windsurf, Cline, Roo Code, Kilo Code, OpenCode, Amp, Goose, Kiro, Trae, Zed, Warp, Augment and others</b></summary>

```bash
npx skills add Omar-Tnzxo/ice-motion-director -a <agent>
```

Agent ids: `windsurf`, `cline`, `roo`, `kilo`, `opencode`, `amp`, `goose`, `kiro-cli`, `trae`, `zed`, `warp`, `augment`. Manual copy paths for every agent and OS: [docs/maintainers/install-matrix.md](docs/maintainers/install-matrix.md).
</details>

<details>
<summary><b>Windows notes</b></summary>

- All commands above work the same in PowerShell and cmd.
- If PowerShell says "running scripts is disabled", run `npx.cmd skills add ...` or `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once.
- `--all` works the same in PowerShell and cmd (in cmd, `--skill '*'` does not work; quote it as `--skill "*"`).
- In WSL, install inside WSL only if your agent also runs inside WSL.
</details>

### Prerequisites

| | Windows (PowerShell or cmd) | macOS | Linux |
|---|---|---|---|
| Node 22.20+ | `winget install OpenJS.NodeJS.LTS` | `brew install node@24` | nvm (see below) |
| git | `winget install Git.Git` | `brew install git` | `sudo apt install git` |
| FFmpeg | `winget install Gyan.FFmpeg` | `brew install ffmpeg` | `sudo apt install ffmpeg` |
| Chrome | `winget install Google.Chrome` | `brew install --cask google-chrome` | see docs |
````

Note: the draft's Prerequisites table must be finalized from section E once the skills fix their real requirements (FFmpeg and Chrome are only needed if bundled scripts render video or capture the browser).

---

## D. Files the repo must contain for each native path

| Path | Required files | Key fields and rules | Source |
|---|---|---|---|
| `npx skills`, `gh skill`, openskills, skillkit, all native-skills agents | `skills/<skill>/SKILL.md` | YAML frontmatter on line 1 with `name` (lowercase, hyphens, equal to the folder name) and `description`. Keep skills at most 3 levels under `skills/`. Optional `metadata.internal: true` hides a maintainer-only skill. | vercel-labs/skills README |
| Claude Code plugin | `.claude-plugin/plugin.json`, `skills/` at plugin root | `name` must equal the marketplace entry `name`. Skills are invoked as `/<plugin name>:<skill>`. | code.claude.com plugin-marketplaces |
| Claude Code marketplace (same repo) | `.claude-plugin/marketplace.json` | Required: `name`, `owner` (`{"name": ...}`), `plugins` (each with `name` and `source`). For a plugin at repo root use `"source": "./"`; paths are relative to the directory that holds `.claude-plugin/`, never use `..`. `claude plugin validate .` must print `Validation passed`. Names in the reserved official list are refused. | code.claude.com plugin-marketplaces |
| Claude.ai upload | A `.zip` with exactly one `.claude-plugin/plugin.json` | No `.zip` may be committed (repo rule); build it in CI or a release. | claude.com/docs/plugins/overview |
| Codex plugin | `.codex-plugin/plugin.json` (compatibility manifest) or a portable root `plugin.json`; `skills/` | Portable packages discover root `skills/`, no `skills` field needed. OpenAI-only settings go under `extensions.com.openai`. Stable kebab-case `name`. | developers.openai.com/plugins/build/plugins |
| Codex marketplace | `.agents/plugins/marketplace.json` | `name`, `interface.displayName`, `plugins[]` with `name`, `source: {"source": "local", "path": "./"}`, `policy: {"installation": "AVAILABLE", "authentication": "ON_INSTALL"}`, `category`. Codex app also reads `.claude-plugin/marketplace.json` as legacy. | developers.openai.com/plugins/build/plugins |
| Cursor plugin | `.cursor-plugin/plugin.json` (only `name` required); optional `rules/*.mdc` | Components found in default folders (`skills/`, `rules/`, `mcp.json`). | cursor.com/docs/plugins |
| Cursor import from GitHub | `.cursor-plugin/marketplace.json` | Required for Customize "From GitHub Repository" and team "Import from Repo". Without it, Cursor users rely on `npx skills`. | cursor.com/docs/context/skills |
| Gemini CLI extension | `gemini-extension.json` at repo root, `GEMINI.md`, `skills/` | `name` (lowercase, dashes, should match the install directory name), `version`, optional `contextFileName` (defaults to `GEMINI.md`). Our repo must not declare `mcpServers` (repo rule). Use `${extensionPath}` and `${/}` for any path. | geminicli.com/docs/extensions/reference |
| Qwen Code | Nothing extra: reads `gemini-extension.json` and Claude marketplaces. A `qwen-extension.json` is optional. | Root `plugin.json` (Agent Plugins v1) is also accepted. | qwenlm docs |
| Antigravity CLI (native, no conversion) | Root `plugin.json` (or `.antigravity-plugin/plugin.json` / `.gemini-plugin/plugin.json`), `skills/` | Checked with `agy plugin validate`: `{"name","version","description"}` at root passes. Without it, `agy plugin install` converts the Claude plugin. | local `agy plugin validate` |
| VS Code Copilot plugins, Agent Plugins standard | Root `plugin.json` with `"$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json"`, `name`, `description`, `version`, `author` | One root `plugin.json` serves VS Code, Codex portable packages, Antigravity CLI and Qwen. Keep `version` in sync with every other manifest. | cursor.com/docs/plugins, agent-plugins.org, code.visualstudio.com agent-plugins |
| Copilot CLI marketplace | `.github/plugin/marketplace.json` (preferred) or `.claude-plugin/marketplace.json` (also read) | Reusing `.claude-plugin/marketplace.json` is enough; a `.github/plugin/` copy is optional. | docs.github.com plugins-marketplace |
| Rules-only fallback | `AGENTS.md` pointer to the router skill | Already present for maintainers; add a user-facing line in README instead of changing the maintainer `AGENTS.md`. | agentskills.io |

Consistency checks before every release:

- The same `name` (`ice-motion-director`) and `version` in `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json`, `.agents/plugins/marketplace.json`, `.cursor-plugin/plugin.json`, `.cursor-plugin/marketplace.json`, root `plugin.json` and `gemini-extension.json`.
- `claude plugin validate .` and `agy plugin validate .` both pass.
- `npx skills add . --list` lists every skill (local path install).
- No `.zip`, no hooks, no MCP servers, no runtime downloads (repo rules).

---

## E. Prerequisites per OS

Versions below were read from the package registries on 2026-10-19. Package IDs were checked with `winget show --id <id> --exact` on Windows 11, the Homebrew formulae API, Fedora mdapi (rawhide), the Arch package API and Launchpad (Ubuntu 24.04 noble).

| Need | Windows (PowerShell and cmd, same command) | macOS (Homebrew) | Ubuntu/Debian | Fedora | Arch |
|---|---|---|---|---|---|
| Node.js 22.20+ (the `skills` CLI requires `>=22.20.0`; current LTS is 24.22.0 "Krypton") | `winget install --id OpenJS.NodeJS.LTS -e` (24.20.0 in winget) or `winget install Schniz.fnm` then `fnm install --lts` | `brew install node@24` (24.22.0) or `brew install node` (26.12.0, not LTS) | Do **not** use `apt install nodejs`: Ubuntu 24.04 ships 18.19. Use nvm: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh \| bash`, reopen the shell, `nvm install --lts` | `sudo dnf install nodejs` gives 22.23 on rawhide (enough); older Fedora: use nvm | `sudo pacman -S nodejs npm` (26.12.0) |
| git | `winget install --id Git.Git -e` | `brew install git` (or Xcode Command Line Tools: `xcode-select --install`) | `sudo apt install git` | `sudo dnf install git` | `sudo pacman -S git` |
| FFmpeg | `winget install --id Gyan.FFmpeg -e` (9.0.2) | `brew install ffmpeg` (9.0.2) | `sudo apt install ffmpeg` (6.1.1 on 24.04) | `sudo dnf install ffmpeg-free` (9.0.2; patent-encumbered codecs such as H.264 encode need the RPM Fusion `ffmpeg`, setup UNVERIFIED here) | `sudo pacman -S ffmpeg` |
| Chrome or Chromium | `winget install --id Google.Chrome -e` | `brew install --cask google-chrome` (the `chromium` cask is disabled) | Chrome: `wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb` then `sudo apt install ./google-chrome-stable_current_amd64.deb`. Chromium on Ubuntu is a snap: `sudo snap install chromium` (`apt install chromium-browser` only installs the snap). Debian: `sudo apt install chromium` | `sudo dnf install chromium`, or Chrome RPM `https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm` | `sudo pacman -S chromium` |

Verify after install (every OS): `node --version`, `npx --version`, `git --version`, `ffmpeg -version`, and for Chrome `google-chrome --version` (Linux), `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --version` (macOS); on Windows check `winget list --id Google.Chrome`.

OS caveats:

- **Windows PATH**: winget installs need a new terminal window before `node`, `git` or `ffmpeg` resolve.
- **Windows PowerShell execution policy**: see A1 (`npx.cmd` or `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`).
- **Windows symlinks**: `npx skills` uses directory junctions (no admin needed). Our own scripts must not create symlinks (repo rule).
- **Windows long paths**: deep `node_modules` or skill trees can pass the 260-character limit. Run `git config --global core.longpaths true` before cloning. Enabling OS-wide long paths is a system setting the user changes themselves (Group Policy or the `LongPathsEnabled` registry value); agents must not change it.
- **Windows line endings**: `.gitattributes` must keep `SKILL.md` and scripts at LF so frontmatter parsing is identical on every OS.
- **Case sensitivity**: macOS and Windows file systems are case-insensitive by default, Linux is not. Skill folder names must be lowercase and referenced with exact case.
- **WSL**: WSL has its own home (`/home/<you>`), its own Node and its own agent config folders. Install skills and prerequisites inside WSL only for agents that run inside WSL. Chrome inside WSL needs WSLg (Windows 11) to show a window; headless use works without it.
- **Apple Silicon**: Homebrew lives in `/opt/homebrew`; all formulae above have arm64 builds.
- **Linux without root**: use nvm or fnm for Node; FFmpeg and Chromium need the distro package manager or a static build.
