# Ice Motion Director: Repo Standards Spec

Target: one open-source repo that installs as a Claude Code plugin, a Codex plugin, and a generic Agent Skills bundle (`npx skills add`), and that passes the review bars of Anthropic's plugin directory / `claude-plugins-official` and OpenAI's Codex plugin directory (`openai/plugins`).

Research date: 2026-10-19. Sources studied (shallow clones in a local reference folder outside this repo, plus a local clone of `heygen-com/hyperframes`):

| Source | What it gave us |
|---|---|
| `anthropics/skills` | Skill template, README style, pointer to the spec at agentskills.io |
| agentskills.io/specification | The normative SKILL.md format |
| `anthropics/claude-plugins-official` | `marketplace.json` schema, internal plugins `frontend-design` and `playground`, CI policy (license check, frontmatter validator, security scan prompt in `.github/policy/prompt.md`) |
| code.claude.com docs (plugins-reference, publish, skills) and claude.com pre-submission checklist | `plugin.json` fields, validation, directory checks |
| Anthropic Software Directory Policy (support.claude.com article 13145358) | Content and behavior policy |
| `obra/superpowers` | Multi-harness packaging (10 manifests), router skill, README install-per-agent style |
| `openai/plugins` | `.agents/plugins/marketplace.json`, `.codex-plugin/plugin.json`, `agents/openai.yaml`, plugins hyperframes, remotion, creative-production, chatcut, superpowers |
| developers.openai.com plugins build + submission pages, learn.chatgpt.com build-skills | Codex manifest limits and review rules |
| `heygen-com/hyperframes` | Large multi-skill repo with a router skill, 5 manifests, skills.sh grouping |
| `nextlevelbuilder/ui-ux-pro-max-skill`, `Leonxlnx/taste-skill`, `pbakaus/impeccable` | README visual craft |
| `vercel-labs/skills` | `npx skills add` discovery rules |

---

## A. Required files and manifests

### A.1 Claude Code plugin

**Files**

```
<repo root = plugin root>
├── .claude-plugin/
│   ├── plugin.json          # manifest (technically optional, required by us)
│   └── marketplace.json     # self-hosted marketplace so users can /plugin install today
├── skills/<skill-name>/SKILL.md
├── README.md                # >= 40 words outside code blocks (directory blocks otherwise)
└── LICENSE                  # or "license" in plugin.json (directory blocks if neither)
```

Only `plugin.json` (and `marketplace.json`) go inside `.claude-plugin/`. `skills/`, `commands/`, `agents/`, `hooks/` stay at the plugin root. A `CLAUDE.md` at the plugin root is not loaded and `claude plugin validate` warns about it.

**`plugin.json` fields** (from the plugins-reference page)

| Field | Notes |
|---|---|
| `name` | Only required key. Kebab-case, no spaces, `@`, `:`, slashes. Immutable once published. Reserved: must not start with `claude-`, `anthropic-`, `anthropics-`, `cc-plugin-`; `official` next to `claude`/`anthropic` is an error; `claude` as a whole word elsewhere is a warning |
| `displayName` | UI label, free casing. Change this, never `name` |
| `version` | String. If set, users stay on it until you bump it. Omit to let git SHA drive updates |
| `description` | Short. Must match real behavior (the security reviewer checks this) |
| `author` | `{ "name" (required), "email", "url" }` |
| `homepage` | Must parse as a URL or the plugin fails to load |
| `repository`, `license` (SPDX), `keywords` | Metadata |
| `icon`, `documentationUrl`, `supportUrl`, `privacyPolicyUrl`, `termsOfServiceUrl` | Read only by Anthropic's directory listing. Put them only in `plugin.json`, never in a marketplace entry |
| `skills` | Adds to the default `skills/` scan |
| `commands`, `agents`, `outputStyles` | Replace their default folder when set |
| `hooks`, `mcpServers`, `lspServers` | Merge with `hooks/hooks.json`, `.mcp.json`, `.lsp.json` |
| `userConfig` | Values prompted on enable; `sensitive: true` stores in the OS keychain |
| `dependencies`, `defaultEnabled`, `settings`, `metadata`, `experimental.evals` | Optional |

All component paths start with `./` and must stay inside the plugin root. `${CLAUDE_PLUGIN_ROOT}` (install dir, changes on update), `${CLAUDE_PLUGIN_DATA}` (persistent), `${CLAUDE_SKILL_DIR}` (skill folder) are the path variables.

**Minimal valid example** (real, `anthropics/claude-plugins-official/plugins/frontend-design/.claude-plugin/plugin.json`):

```json
{
  "name": "frontend-design",
  "description": "Frontend design skill for UI/UX implementation",
  "author": {
    "name": "Anthropic",
    "email": "support@anthropic.com"
  }
}
```

**Full example from an accepted third-party plugin** (real, `heygen-com/hyperframes/.claude-plugin/plugin.json`):

```json
{
  "name": "hyperframes",
  "description": "HyperFrames by HeyGen. Write HTML, render video. Compositions, GSAP and runtime adapter animations, captions, voiceovers, audio-reactive visuals, and website capture for HyperFrames.",
  "version": "0.8.174",
  "author": { "name": "HeyGen", "email": "hyperframes@heygen.com", "url": "https://hyperframes.heygen.com" },
  "homepage": "https://hyperframes.heygen.com",
  "repository": "https://github.com/heygen-com/hyperframes",
  "license": "Apache-2.0"
}
```

**Self-hosted `marketplace.json`** (real, `obra/superpowers/.claude-plugin/marketplace.json`):

```json
{
  "name": "superpowers-dev",
  "description": "Development marketplace for Superpowers core skills library",
  "owner": { "name": "Jesse Vincent", "email": "jesse@fsck.com" },
  "plugins": [
    {
      "name": "superpowers",
      "description": "Core skills library for Claude Code: TDD, debugging, collaboration patterns, and proven techniques",
      "version": "7.0.0",
      "source": "./",
      "author": { "name": "Jesse Vincent", "email": "jesse@fsck.com" }
    }
  ]
}
```

Several plugins from one repo: taste-skill and hyperframes list two entries with `"source": "./"` and an explicit `"skills": ["./skills/a", "./skills/b"]` array each (for example a default plugin and an opt-in "classics" plugin). When an entry with source at the marketplace root lists `skills`, only those load.

**Entry in `claude-plugins-official`** (how accepted third-party plugins are listed; Anthropic writes this, not us). Real entries:

```json
{
  "name": "hyperframes",
  "description": "HyperFrames by HeyGen. Write HTML, render video. Compositions, GSAP and runtime adapter animations, captions, voiceovers, audio-reactive visuals, and website-to-video capture for HyperFrames.",
  "author": { "name": "HeyGen" },
  "category": "design",
  "source": {
    "source": "url",
    "url": "https://github.com/heygen-com/hyperframes.git",
    "sha": "8d2b6e7bdc1c2c26d1abf64ef075c00a1bb230a2"
  },
  "homepage": "https://hyperframes.heygen.com"
}
```

```json
{
  "name": "superpowers",
  "description": "Superpowers teaches Claude brainstorming, subagent driven development with built in code review, systematic debugging, and red/green TDD. Additionally, it teaches Claude how to author and test new skills.",
  "category": "development",
  "source": { "source": "url", "url": "https://github.com/obra/superpowers.git", "sha": "bb92a77741419a4ab5f06e711a283343f1ada0c3" },
  "homepage": "https://github.com/obra/superpowers.git"
}
```

Facts about that marketplace:
- Top level: `$schema` (`https://anthropic.com/claude-code/marketplace.schema.json`), `name`, `description`, `owner`, `renames`, `plugins`.
- Entry fields in use: `name`, `description`, `author`, `category`, `source`, `homepage`, optional `version`, `strict`, `skills`, `lspServers`, `displayName`.
- `source` forms: `"./plugins/x"` (internal), `{ "source": "url", "url", "sha" }`, `{ "source": "git-subdir", "url", "path", "ref", "sha" }`. External entries are pinned to a commit `sha`; a bot (`bump-plugin-shas.yml`) bumps the sha and re-validates.
- Categories in use (count): development 123, productivity 69, database 39, monitoring 22, security 18, deployment 9, design 8, automation 3, learning 3, location 2, math 2, testing 2, migration 1. Ours: `design` (same as hyperframes).
- Skill-bundle form without our own `plugin.json`: `"strict": false` plus `"skills": ["./skill-a", ...]`; skills register as `<plugin>:<skill>`.
- `name` is immutable; renames go in the top-level `renames` map.

### A.2 Codex plugin

**Files**

```
<repo root = plugin root>
├── plugin.json                    # NEW portable manifest (agent-plugins schema) with extensions.com.openai
├── .codex-plugin/
│   ├── plugin.json                # compatibility overlay, still what openai/plugins entries use
│   └── assets/                    # optional; remotion and superpowers keep icons here
├── .agents/plugins/marketplace.json   # self-hosted Codex marketplace
├── assets/icon.png (or .svg)      # composerIcon, square, >= 48x48
├── assets/logo.png                # logo, square, >= 48x48
└── skills/<skill>/
    ├── SKILL.md
    └── agents/openai.yaml         # per-skill Codex UI metadata (optional, every catalog plugin has it)
```

Codex rule: when the root `plugin.json` contains `extensions.com.openai`, `.codex-plugin/plugin.json` is ignored entirely (no merge). Keep them identical or ship only one. Hyperframes ships both: root `plugin.json` with `"$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json"` (no Codex block) and a full `.codex-plugin/plugin.json`.

**Manifest fields and hard limits** (OpenAI submission page)

| Field | Limit |
|---|---|
| `name` | required, max 64, lowercase, digits, single hyphens |
| `version` | required for Codex, explicit semver |
| `description` | max 4000 |
| `author.name` / `email` / `url` | 120 / 320 / 2048 |
| `homepage` | https, max 2048 |
| `skills` | `"./skills/"` |
| `interface.displayName` | required, max 30 |
| `interface.shortDescription` | required, max 30 |
| `interface.longDescription` | required, max 4000 |
| `interface.developerName` | required, max 80 |
| `interface.category` | required. Values seen in catalog: Developer Tools, Productivity, Creativity, Communication, Education & Research, Data & Analytics, Finance, Business & Operations, Security, Scientific Research. Ours: `Creativity` (same as hyperframes, remotion, chatcut, creative-production) |
| `interface.capabilities` | required for Codex, max 20 items x 120 chars, `[]` allowed. Seen: `Read`, `Write`, `Interactive` |
| `interface.defaultPrompt` | up to 3, max 128 chars each, unique, no @mentions |
| `interface.brandColor` / `brandColorDark` | `#RRGGBB`, contrast >= 2:1 against white / against #212121 |
| `interface.composerIcon`, `interface.logo` | required. PNG, JPEG, WebP or SVG, <= 5 MiB, square, >= 48x48, raster <= 4096 px. `composerIconDark`, `logoDark`, `screenshots` optional |
| `websiteURL`, `supportURL`, `privacyPolicyURL`, `termsOfServiceURL` | all four required only for an MCP app; https, max 1024. Skills-only plugins in the catalog still set website and usually privacy + terms (superpowers points privacy and terms at GitHub's policies) |

**Example** (real, `openai/plugins/plugins/hyperframes/.codex-plugin/plugin.json`):

```json
{
  "name": "hyperframes",
  "version": "0.1.2",
  "description": "Write HTML, render video. Compositions, GSAP animations, captions, voiceovers, audio-reactive visuals, and website-to-video capture for HyperFrames.",
  "author": { "name": "HeyGen", "email": "hyperframes@heygen.com", "url": "https://hyperframes.heygen.com" },
  "homepage": "https://hyperframes.heygen.com",
  "repository": "https://github.com/heygen-com/hyperframes",
  "license": "Apache-2.0",
  "keywords": ["hyperframes", "video", "html", "gsap", "animation", "composition", "rendering", "captions", "tts", "audio-reactive"],
  "skills": "./skills/",
  "interface": {
    "displayName": "HyperFrames by HeyGen",
    "shortDescription": "Write HTML, render video",
    "longDescription": "Build videos from HTML with HyperFrames. ...",
    "developerName": "HeyGen",
    "category": "Creativity",
    "capabilities": ["Read", "Write"],
    "websiteURL": "https://hyperframes.heygen.com",
    "defaultPrompt": [
      "Turn this website into a 20-second product promo",
      "Create an animated title card with kinetic type",
      "Add synced captions to this voiceover"
    ],
    "brandColor": "#0a0a0a",
    "composerIcon": "./assets/icon.png",
    "logo": "./assets/logo.png"
  }
}
```

Observation: the version of hyperframes in `openai/plugins` (0.1.2, 5 skills) is a snapshot mirror of the upstream repo (0.8.174, 21 skills). Its README says the skills are authored upstream and mirrored. Expect OpenAI to mirror a frozen copy of our repo, so the plugin must be self-contained and must not depend on runtime downloads of newer skills.

**Marketplace file** `.agents/plugins/marketplace.json`. Real catalog entry (`openai/plugins/.agents/plugins/marketplace.json`):

```json
{
  "name": "openai-curated",
  "interface": { "displayName": "Codex official" },
  "plugins": [
    {
      "name": "hyperframes",
      "source": { "source": "local", "path": "./plugins/hyperframes" },
      "policy": { "installation": "AVAILABLE", "authentication": "ON_INSTALL", "products": ["CODEX"] },
      "category": "Creativity"
    }
  ]
}
```

Self-hosted form (real, `obra/superpowers/.agents/plugins/marketplace.json`): same shape with `"source": { "source": "url", "url": "./" }`. Documented source types: `local` (`path` starting `./`), `url`, `git-subdir` (`url`, `path`, `ref` or `sha`), `npm` (`package`, `version`, `registry`). `policy.installation`: `AVAILABLE`, `INSTALLED_BY_DEFAULT`, `NOT_AVAILABLE`. `policy.authentication`: `ON_INSTALL` (58 entries) or `ON_USE` (7). `category` is required.

**`skills/<skill>/agents/openai.yaml`** (keys counted across 459 catalog files: `interface.display_name` 459, `interface.short_description` 459, `default_prompt` 177, `policy.allow_implicit_invocation` 104, `icon_small`/`icon_large` 94, `brand_color` 93, `dependencies.tools` 2). Real examples:

```yaml
# openai/plugins/plugins/hyperframes/skills/hyperframes/agents/openai.yaml
interface:
  display_name: "HyperFrames"
  short_description: "Create video compositions, animations, title cards, overlays, captions, voiceovers, audio-reactive visuals, and scene transitions in HyperFrames HTML."
```

```yaml
# openai/plugins/plugins/remotion/skills/remotion-best-practices/agents/openai.yaml (router skill)
interface:
  display_name: '/remotion-best-practices'
  short_description: 'Route Remotion tasks to the right workflow'
  icon_small: './assets/remotion-icon.png'
  icon_large: './assets/remotion-icon.png'
  brand_color: '#0B84F3'
  default_prompt: '$remotion-best-practices: Make a promo video for my product'
```

```yaml
# a skill that declares a CLI it needs (from the emulator QA plugin)
dependencies:
  tools:
    - type: "cli"
      value: "ffmpeg"
      description: "Encode and probe video"
policy:
  allow_implicit_invocation: true
```

`policy.allow_implicit_invocation: false` keeps a skill out of automatic matching (explicit `$skill-name` still works). Codex discovers skills in `.agents/skills` (repo and parents), `~/.agents/skills`, `/etc/codex/skills`, and system skills. The initial skills list is capped at 2% of context (8,000 chars when unknown), so many verbose descriptions crowd each other out.

### A.3 Generic Agent Skills (`npx skills add <owner>/<repo>`)

No manifest needed. The `vercel-labs/skills` CLI:
- Looks for a root `SKILL.md`, then `skills/`, `skills/.curated/`, `skills/.experimental/`, `skills/.system/`, and agent folders such as `.claude/skills/`, each walked up to 3 levels deep. A shallower `SKILL.md` shadows deeper ones. Falls back to a recursive search.
- Also reads skill paths declared in `.claude-plugin/marketplace.json` or `plugin.json`. This is how hyperframes shows a "Core Skills" group in the picker.
- Frontmatter `metadata: { internal: true }` hides a skill unless `INSTALL_INTERNAL_SKILLS=1` (hyperframes uses this for repo-internal skills in `.agents/skills/`).
- Flags users will copy: `--skill <name>` (or `'*'`), `--all`, `-a claude-code|codex|cursor|opencode|gemini-cli`, `-g` (global), `-l` (list), `-y`.
- Install paths: Claude Code `.claude/skills/` (`~/.claude/skills/`), Codex `.agents/skills/` (`~/.agents/skills/`), Cursor `.agents/skills/` (`~/.cursor/skills/`), Gemini CLI `.agents/skills/` (`~/.gemini/skills/`).
- Listing on skills.sh happens through installs; the badge is `[![skills.sh](https://skills.sh/b/<owner>/<repo>)](https://skills.sh/<owner>/<repo>)` (used at the top of `anthropics/skills`).

Install lines to publish:

```bash
npx skills add <owner>/ice-motion-director                       # picker
npx skills add <owner>/ice-motion-director --skill ice-motion-director   # router only
npx skills add <owner>/ice-motion-director --all                 # everything
```

### A.4 Other harnesses (optional, superpowers and hyperframes ship them)

| Harness | File | Real example |
|---|---|---|
| Cursor | `.cursor-plugin/plugin.json` | `{ "$schema": "https://cursor.com/schemas/cursor-plugin/plugin.json", "name", "displayName", "description", "version", "author", "publisher", "homepage", "repository", "license", "logo", "category": "developer-tools", "keywords", "tags", "skills": "./skills/" }` |
| Gemini CLI | `gemini-extension.json` + `GEMINI.md` | `{ "name": "superpowers", "description": "...", "version": "7.0.0", "contextFileName": "GEMINI.md" }`, GEMINI.md imports the router with `@./skills/<router>/SKILL.md` |
| Antigravity, Devin, Kimi, Hermes, Muse | `.<harness>-plugin/plugin.json` | superpowers only |
| OpenCode, Pi | `.opencode/`, `package.json` `pi` block | superpowers only |
| Portable | root `plugin.json` with agent-plugins schema | hyperframes |

Keep every `version` field in sync with one script (superpowers: `.version-bump.json` lists 12 file/field pairs; hyperframes: `set-version` updates five manifests).

---

## B. SKILL.md authoring rules

### B.1 Frontmatter (agentskills.io spec, the portable baseline)

| Field | Rule |
|---|---|
| `name` | Required. 1 to 64 chars. `a-z`, `0-9`, `-` only. No leading/trailing hyphen, no `--`. Must equal the parent folder name |
| `description` | Required. 1 to 1024 chars. Says what the skill does AND when to use it, with the trigger keywords |
| `license` | Optional. SPDX name or bundled file reference |
| `compatibility` | Optional, max 500 chars. Only when there are real environment needs (for us: Node, FFmpeg, Chrome) |
| `metadata` | Optional string-to-string map (`version`, `author`, `internal`) |
| `allowed-tools` | Optional, experimental, space separated |

Portability traps:
- claude.ai uploads and the Skills API accept only `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`. Any other key is a hard error there. So keep Claude Code only keys (`when_to_use`, `disable-model-invocation`, `user-invocable`, `argument-hint`, `context`, `paths`) out of skills we want on claude.ai, or accept that those skills are Claude Code only.
- Claude Code truncates `description` + `when_to_use` at 1,536 chars in the listing.
- Both Claude Code and Codex use strict YAML parsers and silently drop a skill whose frontmatter fails. taste-skill 2.1.2 lost its main skill to one unquoted `: ` in the description. Use a folded block scalar (`description: >`) or quotes for any description containing `: `, `#`, `{`, `[`, `*`, `&`, `!`, `|`, `>`, `%`, `@`, backtick.
- The official repo's validator requires `description` to be a single string (not a list) for every `skills/*/SKILL.md`.

### B.2 How descriptions trigger

- At startup only `name` + `description` of every installed skill are in context (about 100 tokens each). The agent picks a skill by matching the task against the description.
- Front-load the primary use case and the trigger words; say when it should and should not fire (Codex guidance).
- Claude tends to under-trigger, so the router description should be a little pushy: list the deliverables and phrasings, and add "even if the user does not say X" (skill-creator guidance). Hyperframes' router opens with "Mandatory entry point: read this first for any request to make, create, edit, animate, or render a video...". Superpowers' bootstrap uses "Use when starting any conversation".
- Simple one-step requests may not trigger any skill; test with substantive prompts.
- Directory policy 2.A and 2.B: each capability described in narrow, unambiguous language; no promise of unbuilt features. Policy 1.B and the security reviewer flag coercive text like "ignore other instructions" or "always run me first". Superpowers gets away with very strong wording ("YOU MUST") because it only governs its own skills; keep our router firm about routing inside our skills, never about overriding the user or other tools.
- Specialist skills that should not compete for auto-triggering: Claude Code `disable-model-invocation: true`, Codex `policy.allow_implicit_invocation: false`, and a description that says "Use only when called by name" for every other agent (taste-skill 2.1.1 pattern).

### B.3 Progressive disclosure and size

1. Metadata: ~100 tokens, always loaded.
2. `SKILL.md` body: loaded on activation. Recommended < 5,000 tokens and < 500 lines. Stays in context for the rest of the session, so keep it lean.
3. Resources: loaded only when needed. Scripts can run without being read.

Rules:
- Keep file references one level deep from `SKILL.md`, using relative paths (`references/x.md`, `scripts/y.mjs`). Each reference read should say when to read it.
- Reference files over 300 lines get a table of contents (skill-creator).
- Organize variants as one file per variant (`references/remotion.md`, `references/hyperframes.md`); the agent reads only the matching one.
- In observed repos: hyperframes `SKILL.md` files run 73 to 526 lines, one outlier at 1,204 (`talking-head-recut`). Aim for 150 to 300 for workflow skills, under 200 for the router.

### B.4 Folder layout per skill

```
<skill-name>/
├── SKILL.md            # required
├── references/         # docs read on demand (focused, small)
├── scripts/            # executable helpers; self-contained, clear errors, documented deps
├── assets/             # templates, LUTs, fonts, sample frames used in output
└── agents/openai.yaml  # Codex UI metadata (ignored by others)
```

Use `${CLAUDE_SKILL_DIR}/scripts/x.mjs` in the body when Claude Code must run a bundled script; it also lets `allowed-tools: Bash(${CLAUDE_SKILL_DIR}/scripts/render.mjs *)` pre-approve exactly that script.

### B.5 Content style inside skills

- Imperative voice. Decision tables over prose. One job per section.
- Output contracts as exact templates.
- "Principle of lack of surprise": nothing a user would not expect from the description. All behavioral guidance human-readable (policy 2.G: no hidden, obfuscated or encoded instructions).
- No instructions fetched at runtime from a remote source (policy 2.F). This rules out the hyperframes pattern `npx hyperframes skills update <workflow>` for us: bundle every workflow.

---

## C. Folder layout for a large multi-skill repo with a router

### C.1 How superpowers routes

- One bootstrap skill, `using-superpowers`, whose description is "Use when starting any conversation". It holds the rule (check skills before any action), a skill priority order (process skills first, then implementation skills), and a red-flags table of rationalizations.
- A `SessionStart` hook (`hooks/hooks.json`, matcher `startup|clear|compact`) injects the bootstrap. Harnesses without hooks rely on the description (verified on Antigravity in their release notes).
- Per-harness tool mapping lives in `skills/using-superpowers/references/<harness>-tools.md` (claude-code, codex, gemini, antigravity, hermes, muse, pi). The router says "If your harness appears here, read its reference file".
- Skills chain by name in their text ("superpowers:brainstorming first, then implementation skills"). Each workflow skill names the next one.
- The Codex copy in `openai/plugins` ships `"hooks": {}` because the public Codex directory rejects lifecycle hooks.

### C.2 How hyperframes routes

- `skills/hyperframes/SKILL.md` is the single entry point. Body structure:
  1. "Start from project state": a first-match table (existing project op, edit, `BRIEF.md` exists, resume, fresh creation).
  2. "Route fresh creation": a priority table mapping deliverable to workflow skill, plus an "ambiguities" list.
  3. "Route once, then leave": the intent interview writes `BRIEF.md`; later steps read only that file.
  4. "Load domain skills on demand": a need-to-skill table and a cross-domain table ("zoom in here" needs skills X + Y + Z).
- Before committing to a route it reads `references/routes/<workflow>.md` (one small contract file per route: input, output, trigger). Only the matched file.
- Three tiers of skills: router (1), creation workflows (10, each owning a deliverable), domain skills (9 atomic capabilities like core, animation, keyframes, audio, media, cli).
- Workflow skills use sub-agents with role files (`motion-graphics/agents/director.md`, `builder.md`, `finalize.md`) and a typed handoff file (`shot-plan.json`).
- Repo-internal skills sit in `.agents/skills/` with `metadata.internal: true`, separate from the published `skills/`.
- README mirrors the same three tables (Router, Creation workflows, Domain skills) so humans see the same map as the agent.

### C.3 Recommended layout for Ice Motion Director

Plugin at the repo root (pattern of superpowers, hyperframes, taste-skill; avoids the stricter "plugin folder is a subfolder" script checks).

```
ice-motion-director/
├── .claude-plugin/
│   ├── plugin.json
│   └── marketplace.json            # 1 plugin, or 2: "ice-motion-director" + opt-in extras
├── .codex-plugin/
│   └── plugin.json                 # interface block, skills "./skills/"
├── .agents/plugins/marketplace.json
├── .cursor-plugin/plugin.json      # optional
├── gemini-extension.json           # optional, contextFileName GEMINI.md
├── GEMINI.md                       # @./skills/ice-motion-director/SKILL.md
├── AGENTS.md                       # contributor rules for agents (superpowers style)
├── plugin.json                     # optional portable agent-plugins manifest
├── assets/
│   ├── icon.svg  icon.png          # square, >= 48 px, <= 5 MiB
│   ├── logo.png  logo-dark.png
│   └── readme/                     # small WebP/PNG/GIF only (no mp4 in repo, see E.3)
├── skills/
│   ├── ice-motion-director/        # ROUTER. Only skill with a pushy description.
│   │   ├── SKILL.md                # state table, route table, domain table, ambiguity list
│   │   ├── references/
│   │   │   ├── routes.md               # one section per route contract
│   │   │   ├── intent-interview.md
│   │   │   ├── brief-format.md         # BRIEF.md schema written once, read by workflows
│   │   │   ├── step-mode.md            # stage commands, prerequisites, review card
│   │   │   └── harness.md              # one section per agent: tool names
│   │   └── agents/openai.yaml
│   ├── <workflow-a>/               # e.g. motion-graphic, product-promo, edit-footage, captions, explainer
│   │   ├── SKILL.md
│   │   ├── agents/openai.yaml
│   │   ├── roles/director.md builder.md reviewer.md   # sub-agent briefs
│   │   └── references/
│   ├── <domain-x>/                 # e.g. motion-principles, typography-in-motion, color, audio-sync, render-qa
│   │   ├── SKILL.md                # user-invocable false / implicit false if only the router calls it
│   │   ├── references/  scripts/  assets/
│   │   └── agents/openai.yaml
├── evals/                          # claude plugin eval cases + trigger evals
├── tests/                          # frontmatter, manifest sync, link checks
├── scripts/                        # repo tooling (version bump, package-codex-zip); NOT referenced by skills
├── docs/                           # long docs, per-harness install pages
├── .githooks/pre-push             # runs scripts/gates.mjs before each push (no hosted CI)
├── CHANGELOG.md
├── LICENSE                         # Apache-2.0 recommended (see E.1)
├── SECURITY.md
├── CONTRIBUTING.md
├── CREDITS.md
└── README.md
```

Routing rules to write into the router:
- First-match project-state table, then a deliverable priority table, then "route once, then leave" with a `BRIEF.md` handoff.
- One contract per route, as one section of `references/routes.md`, read only for the matched route.
- A need-to-domain table and a cross-domain table for compound edit phrases.
- A harness pointer to `references/harness.md`, one section per agent.
- No hooks in the published plugin (Codex public directory rejects them; Anthropic's scan treats unscoped prompt/tool hooks as a fail). If a bootstrap is wanted for Claude Code, a `SessionStart` only, gated, network-free hook in a separate opt-in plugin is the maximum.
- Every workflow and domain skill bundled. No runtime installs of skills.

---

## D. README anatomy of the best repos

### D.1 Section order (synthesized from hyperframes, superpowers, taste-skill, ui-ux-pro-max, impeccable)

1. Centered logo via `<picture>` (light/dark).
2. One badge row (4 to 6 badges).
3. One-line bold tagline.
4. Nav links row (Docs, Showcase, Discord) separated by `|` or `·`.
5. Hero media (800 px wide image, GIF, or video).
6. Two to three sentence plain description.
7. Quick start: the one-liner for the most popular agent, then per-agent installs.
8. A first prompt to try, in a blockquote.
9. How it works (diagram or 5-step numbered list).
10. Skills map: Router / Workflows / Domain tables (hyperframes) or grouped bullet list (superpowers).
11. Gallery (2-column table of results), then before/after.
12. Requirements, Troubleshooting / FAQ (`<details>`).
13. Privacy and network disclosure, telemetry (opt-out documented).
14. Contributing, Community, Credits, License, author line.

Lengths observed: superpowers ~400 lines, hyperframes 364, taste-skill 257, impeccable 530, ui-ux-pro-max 732. taste-skill is the tightest and the best model for us.

### D.2 Hero and media techniques that work on GitHub

- Logo with theme switch (hyperframes):
  ```html
  <p align="center">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.svg">
      <source media="(prefers-color-scheme: light)" srcset="assets/logo-light.svg">
      <img alt="Ice Motion Director" src="assets/logo-light.svg" width="300">
    </picture>
  </p>
  ```
- Banner image full width: `<img src="assets/readme/banner.webp" width="100%" alt="...">` (taste-skill uses WebP for banner and gallery; files are 25 to 30 KB each).
- Animated demo as image: `<img src="https://github.com/user-attachments/assets/<uuid>" width="800" alt="...">` (hyperframes hero) or a GIF on a CDN at `width="800"` (ui-ux-pro-max).
- Real video with sound: upload the MP4 by dragging it into a GitHub issue or PR comment, copy the `https://github.com/user-attachments/assets/<uuid>` URL, and put it on its own line or in `<video src="..." controls muted width="800"></video>`. GitHub renders those URLs as a player; an MP4 committed in the repo and referenced by relative path is not played inline, only linked. Upload caps (from GitHub docs, verify at upload time): images and GIFs 10 MB, videos 10 MB on free plans, 100 MB on paid.
- Video for long films: link to a GitHub Release asset (taste-skill links its launch film to the v2.0.0 release) or YouTube with a poster image linking to it.
- GIF budget: 800 px wide, 10 to 15 fps, under 5 MB, 3 to 8 second loops. Prefer animated WebP (smaller) where the target renders it; GitHub does.
- Always meaningful `alt` text that describes the frame (taste-skill gallery alts describe each page).
- Directory listing caveat: Anthropic's directory shows the README as the listing description and wants bundled images in Markdown image syntax. Keep at least the first screenful readable when HTML is stripped, and use `![alt](assets/readme/x.webp)` for bundled images.

### D.3 Badges

- Shields.io, one style per row. taste-skill uses neutral `24292f` flat badges for website, license, "Agent Skills compatible", "Codex / Cursor / Claude install" (anchors to `#install`), changelog. hyperframes uses npm version, downloads, license, node version, Discord. ui-ux-pro-max uses `for-the-badge` counts (rules, styles), which reads heavy.
- Add the skills.sh badge. Keep donation and sponsor blocks below the fold (taste-skill and ui-ux-pro-max put them near the top; impeccable and superpowers do not, and read cleaner).

### D.4 Install one-liners per agent

Superpowers gives a heading per harness with 1 to 3 commands each; taste-skill gives the `npx skills` line first, then `<details>` blocks per agent. Use taste-skill's compact form:

```markdown
## Install

npx skills add <owner>/ice-motion-director

<details><summary>Claude Code plugin</summary>
/plugin marketplace add <owner>/ice-motion-director
/plugin install ice-motion-director@ice-motion-director
</details>

<details><summary>Codex plugin</summary>
codex plugin marketplace add <owner>/ice-motion-director
codex plugin add ice-motion-director@ice-motion-director
Start a new Codex session afterwards so the skills load.
</details>

<details><summary>Cursor / Gemini CLI / OpenCode / others</summary> ... </details>
```

After listing: add the official lines (`/plugin install ice-motion-director@claude-plugins-official`; Codex app: Plugins sidebar, Creativity section) at the top, as superpowers does. Also state requirements right under install (taste-skill: Node 22+, a Chrome, no API keys, network only for X).

### D.5 How it works

- Hyperframes: one paragraph plus a short real code sample, then one sentence on the render pipeline.
- Superpowers: narrative paragraphs, then "The Basic Workflow" as a numbered list where each item names a skill and when it activates.
- taste-skill: "A build runs in six steps" numbered list.
- For us: a numbered pipeline (brief, storyboard, build, render, review) where each step names its skill, plus one diagram image (SVG with light/dark variants via `<picture>`, or a Mermaid block which GitHub renders natively).

### D.6 Gallery tables

taste-skill pattern:

```html
<table>
  <tr>
    <td width="50%"><img src="examples/a.webp" alt="..."></td>
    <td width="50%"><img src="examples/b.webp" alt="..."></td>
  </tr>
</table>
```

Hyperframes uses a 2-column table of linked template thumbnails, each linking to a live page. For motion: each cell is a short looping WebP or GIF poster linking to the full MP4 (user-attachments or release). Add the brief that produced it under each cell in `<sub>`. ui-ux-pro-max and taste-skill add an honesty caption ("illustrative, not a benchmark", "photographs are real, credited"); do the same, with a CREDITS file for every third-party asset in the demos.

### D.7 Credits, community, license

- `CREDITS.md` (hyperframes, taste-skill `examples/v2/CREDITS.md`) for assets, fonts, music and upstream ideas. Impeccable credits its origin (Anthropic's frontend-design) in the first section.
- Contributors avatars row or `contrib.rocks`; star-history badge at the end (taste-skill).
- License section one line. Author line at the very end (impeccable).

### D.8 Writing tone

- Short declarative sentences, present tense, second person. One idea per paragraph. Numbers over adjectives (impeccable: "1 skill, 24 commands ... 61 deterministic detector rules").
- Lead with the outcome, then the mechanism. Name the problem the skill fixes concretely (impeccable lists the exact AI design tells).
- Plain words, technical where it matters (exact commands, versions, file names).
- Honest scope notes and disclosures (superpowers and impeccable each have a telemetry section stating what is sent and how to turn it off).
- One exemplary line, the hyperframes tagline: "Write HTML. Render video. Built for agents." Others worth studying without copying: taste-skill's gallery lead-in (a short sentence that says each example came from one brief) and superpowers' closing line of "How it works" (the skills trigger on their own, so the user does nothing special).

---

## E. Acceptance signals for the official marketplaces

### E.1 Anthropic (directory and `claude-plugins-official`)

How listing works:
- Third-party plugins are submitted through the developer portal at claude.ai/directory/manage (paid claude.ai plan; on Team/Enterprise an Owner or a member with the Directory permission). The repo README still links the older form `clau.de/plugin-directory-submission`. External PRs to `claude-plugins-official` are auto-closed unless they only add entries for a source repo that already backs a live plugin. `claude-plugins-official` itself is curated by Anthropic ("ask your partner contact"); a directory listing reaches claude.ai, Cowork and Claude Code (`<name>@synced`).

Portal validation (Blocks unless noted):
- A folder with `.claude-plugin/plugin.json`; one plugin per submission.
- README of at least 40 words outside code blocks. A `LICENSE` file or `license` field.
- Name: lowercase, digits, hyphens, max 64, distinctive, not a reserved word alone (`claude`, `anthropic`, `official`, `plugin`, `mcp`, `test`), not taken, not a look-alike of a brand (held), forks need their own name (held). `displayName` and `author.name` in one script, no invisible characters.
- `description`, `author`, `version` set (warning).
- No `.DS_Store`, `Thumbs.db`, `desktop.ini`, `__MACOSX`. Cross-platform file names (no colon, no trailing dot, no `con.md`, no case-only duplicates). No symlinks, submodules, or LFS pointers for loaded files. No `export-ignore`, `export-subst`, or content filters in `.gitattributes`.
- Repo under 50 MiB archived and 256 MiB unpacked, under 10,000 entries, every plugin file under 5 MiB.
- Held for review: any non-image, non-font file over 256 KiB; more than 512 files; any binary other than PNG, JPEG, GIF, WebP, fonts (so `.mp4`, `.mov`, `.pdf`, `.zip`, `.ico` in the plugin folder get held); package launchers (`npx`, `uvx`, `bunx`...) even pinned; `package.json` + lockfile at the plugin root; local MCP servers launched through a shell or `npm run`.
- Blocks: unpinned `npx`/`uvx` (`@latest` or ranges); a registry config (`.npmrc`) next to a launcher; real credentials anywhere (use `userConfig` with `sensitive: true`); remote MCP URLs that are not `https`/`wss`.
- Skill, command and agent frontmatter must parse; `description` must be a string; folder and file names spelled exactly (`skills/`, `SKILL.md`, `hooks/`).

Security scan (the AI reviewer prompt in `.github/policy/prompt.md` plus the portal scan):
- Reads the whole shipped repo, including hidden folders (`.claude/`, `.codex/`), `scripts/`, `examples/`, `tests/`.
- Fails on: malware, deception, exfiltration, prompt injection aimed at the model or reviewer, coercive "ignore other instructions" text, cross-service credential use, any `UserPromptSubmit`/`PreToolUse`/`PostToolUse` hook without a project-relevance gate, any undisclosed outbound network call (telemetry needs disclosure plus an opt-out in the description or README), a description that hides hooks, telemetry or data access.
- Flags (not fails) `may_make_external_network_calls` and `may_download_additional_software`. Disclose both in the README.
- Commit readable source; minified or packed code is held.

Directory policy items that shape our content:
- 4.B: software that uses AI models to generate images, video or audio is prohibited, except design-focused tools that create visual aids, provided standalone generation is not the primary service. Ice Motion Director must present itself as a motion design and editing director that writes code (HTML/CSS/GSAP, Remotion, FFmpeg) and renders deterministically. Any AI image, video or voice generation stays optional, secondary, user-initiated, and disclosed. Hyperframes (category design, with TTS as a side capability) is the accepted precedent.
- 3.E: at least three working example prompts. 3.C: document how it works, its purpose, and troubleshooting. 3.B: verified contact and support channel. 3.G: maintain it. 1.D: collect only what the function needs. 1.E: no IP infringement (fonts, music, footage in examples must be licensed; keep CREDITS).
- 2.D/2.E: do not coerce Claude into calling other external software, do not interfere with other tools. 2.F: no runtime-fetched instructions. 2.G: no hidden or encoded instructions.

License: every Anthropic internal plugin must carry Apache 2.0 (`validate-licenses.yml`). Third-party listings only need a license; accepted peers use Apache-2.0 (hyperframes, impeccable), MIT (superpowers, taste-skill, remotion), GPL-3.0-only (chatcut). Apache-2.0 is the safest match for both catalogs and gives a patent grant.

Versioning: increment `version` on every release (otherwise `claude plugin update` says already latest), or omit it and let the commit SHA drive updates. The official marketplace pins external entries to a SHA and bumps it with a bot that re-validates. Tag releases with `claude plugin tag` (`{name}--v{version}`). Never rename `name`.

Quality tools: `claude plugin validate --strict ./` in the local gates (fails on warnings), `claude plugin eval` (cases in `evals/`, compares output with and without the plugin), skill-creator trigger evals (`evals.json`, 60/40 train/test description optimization).

### E.2 OpenAI (Codex plugin directory, `openai/plugins`)

- `openai/plugins` is OpenAI-maintained (its README calls it a curated collection of examples; no contribution path). Public listing happens through the plugin submission portal; published plugins appear in the universal directory shared by ChatGPT and Codex.
- Who submits: organization owners or members with Apps Management Write; publisher identity verification required; policy attestations at submission.
- Skills-only plugins are allowed and need no MCP test cases or demo recording. Choose "Skills only".
- Not accepted: lifecycle hooks; `apps` / `.app.json` references in the ZIP. Remove both from the submitted package.
- ZIP upload (hyperframes notes a 100 MB cap). Each change to metadata, assets or skills is a new ZIP and a new reviewed version; one active review at a time.
- Required skill scans must finish clean; `name` and `description` valid in every `SKILL.md`; `onboardingSkill` (if used) must point inside the package.
- Hard limits from A.2 (displayName 30, shortDescription 30, up to 3 default prompts of 128, icons square >= 48 px, brand colors with 2:1 contrast).
- No secrets in the package. Feedback comes by email; appeal by replying.
- Precedents in Creativity: hyperframes, remotion (MIT, `ON_INSTALL`, `products: ["CODEX"]`), chatcut, creative-production (`ON_USE`).

### E.3 What this means for our repo

- No hooks in the shipped plugin. No `.app.json`. No MCP server (keeps both reviews skills-only).
- No runtime skill downloads, no unpinned `npx`. If skills call a CLI (Remotion, HyperFrames, FFmpeg), document it as a user prerequisite, pin exact versions in any command a skill writes (`npx remotion@4.x.y`), and declare it in `agents/openai.yaml` `dependencies.tools` and in `compatibility`.
- No `.mp4`/`.mov` committed (held, and the plugin folder is the whole repo). README video goes to GitHub user-attachments or Releases. Repo images: WebP/PNG/GIF under 5 MiB each, ideally under 1 MiB.
- Every text file under 256 KiB, total plugin under 512 files where possible (hyperframes is far above this and gets reviewer holds; we should not).
- Dev-only agent config (`.claude/settings.json`, `.codex/hooks.json` with pre-commit hooks like hyperframes ships) is read by the scanner. Keep it out of the repo or make it obviously dev-only and harmless.
- README has a "Privacy and network" section: what runs locally, what touches the network (font CDNs, stock media search, optional AI generation), what is never sent, and how to disable each.
- CHANGELOG.md with dated SemVer entries (taste-skill and superpowers `RELEASE-NOTES.md` style: what changed, why, issue links).

---

## F. Verification checklist

### F.1 Manifests

- [ ] `.claude-plugin/plugin.json`: `name` = `ice-motion-director` (kebab, no reserved words), `displayName`, `version` (SemVer), `description` matching behavior, `author{name,email,url}`, `homepage` (valid URL), `repository`, `license` = `Apache-2.0`, `keywords`.
- [ ] Directory listing fields in `plugin.json` only: `icon`, `documentationUrl`, `supportUrl`, `privacyPolicyUrl`, `termsOfServiceUrl` (all https).
- [ ] `.claude-plugin/marketplace.json`: `name`, `owner`, `plugins[]` with `name` identical to `plugin.json`, `source: "./"`, `description`, `version`.
- [ ] `.codex-plugin/plugin.json`: `name`, `version`, `description`, `author`, `homepage`, `repository`, `license`, `keywords`, `skills: "./skills/"`, `interface{displayName<=30, shortDescription<=30, longDescription<=4000, developerName<=80, category: "Creativity", capabilities: ["Read","Write"], websiteURL, privacyPolicyURL, termsOfServiceURL, supportURL, defaultPrompt (<=3, <=128 chars), brandColor, brandColorDark, composerIcon, logo}`.
- [ ] If a root `plugin.json` exists with `extensions.com.openai`, it is identical in content to `.codex-plugin/plugin.json`.
- [ ] `.agents/plugins/marketplace.json`: `name`, `interface.displayName`, `plugins[]{name, source{source:"url"|"local"...}, policy{installation:"AVAILABLE", authentication:"ON_INSTALL"}, category:"Creativity"}`.
- [ ] Optional `.cursor-plugin/plugin.json`, `gemini-extension.json` + `GEMINI.md`.
- [ ] One version-bump script updates every manifest; the local gates fail if versions differ.
- [ ] Icons: square, >= 48 px, <= 5 MiB, PNG or SVG, light and dark logo; brand colors pass 2:1 contrast on white and #212121.

### F.2 Skills

- [ ] Every `skills/<x>/SKILL.md` starts with `---` on line 1; strict YAML parse passes; `name` equals folder name, kebab, <= 64; `description` a single string, 1 to 1024 chars, quoted or folded if it contains `: `.
- [ ] Only portable frontmatter keys (`name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`) in skills meant for claude.ai; Claude Code only keys documented where used.
- [ ] Router description names every deliverable and trigger phrase; specialists have short descriptions and opt-out of implicit invocation where they should only be called by the router.
- [ ] Every skill has `agents/openai.yaml` with `interface.display_name` and `interface.short_description`; router has `default_prompt`.
- [ ] `SKILL.md` bodies under 500 lines (router under 200); references one level deep; reference files over 300 lines have a contents list.
- [ ] No runtime-fetched instructions, no hidden or encoded text, no coercive "ignore other instructions" phrasing.
- [ ] Every bundled script: self-contained, readable (not minified), documented deps, clear errors, exact pinned versions for any package it runs.
- [ ] `npx skills add <owner>/ice-motion-director --list` shows the expected skills; internal skills carry `metadata.internal: true`.

### F.3 Repo hygiene and size

- [ ] `LICENSE` (Apache 2.0 text), `README.md` (>= 40 words outside code), `CHANGELOG.md`, `SECURITY.md`, `CONTRIBUTING.md`, `CREDITS.md`, `AGENTS.md`.
- [ ] No `.DS_Store`, `Thumbs.db`, `desktop.ini`, `__MACOSX`; no symlinks, submodules, LFS; no `export-ignore`/`export-subst`/filters in `.gitattributes`.
- [ ] Cross-platform names (no colons, trailing dots, device names, case-only twins).
- [ ] Repo < 50 MiB archived, < 256 MiB unpacked, < 10,000 entries; every file < 5 MiB; non-image files < 256 KiB; aim for <= 512 files.
- [ ] No `.mp4`, `.mov`, `.pdf`, `.zip`, `.ico`, executables committed.
- [ ] No hooks, no `.app.json`, no MCP config in the shipped plugin; no `.npmrc`/registry configs; no `package.json` + lockfile at the root (or accept a reviewer hold).
- [ ] No secrets anywhere, including examples and docs; no reading of env credentials.
- [ ] Dev-only agent config is absent or harmless and disclosed.

### F.4 Behavior and policy

- [ ] Positioned as a code-based motion design and editing director; AI media generation is optional, secondary, user-initiated, disclosed (Anthropic policy 4.B).
- [ ] README "Privacy and network" section lists every network touch and download, with opt-outs; no telemetry (or disclosed with opt-out).
- [ ] At least three working example prompts in README and in `defaultPrompt` (max 3 for Codex).
- [ ] Support channel (Issues link, email) and a maintained-by line.
- [ ] All demo assets licensed and credited.

### F.5 Tests and local gates

No hosted CI (founder decision, 2026-10-22). `node scripts/gates.mjs` runs every check below that is automated; the git pre-push hook in `.githooks/` runs it before each push (enable once per clone with `git config core.hooksPath .githooks`), and `--all` adds the Python pins import and the render smoke test after a version bump.

- [ ] `claude plugin validate --strict ./` passes.
- [ ] `skills-ref validate` passes for every skill.
- [ ] Strict YAML frontmatter test for every `SKILL.md` and `agents/openai.yaml` (taste-skill `tests/frontmatter.mjs` pattern).
- [ ] Codex manifest lint: field lengths, icon dimensions, color contrast, paths exist.
- [ ] Manifest version sync test; internal link checker for all relative paths in skills and README.
- [ ] `claude plugin eval` suite in `evals/` with with-plugin vs without-plugin comparisons; trigger evals for the router (should-trigger and should-not-trigger prompts).
- [ ] Load test on each surface: Claude Code (local marketplace install), Codex (local marketplace), `npx skills add`, one other agent.
- [ ] Packaging script builds the Codex ZIP (hooks and apps stripped, < 100 MB) from the committed HEAD.
- [ ] No em dash or en dash characters anywhere (repo rule).

### F.6 README

- [ ] `<picture>` logo (light/dark), 4 to 6 badges incl. skills.sh, bold tagline, nav row.
- [ ] Hero demo: user-attachments video or 800 px WebP/GIF under 5 MB with alt text.
- [ ] Install: `npx skills add` first, then `<details>` per agent (Claude Code, Codex, Cursor, Gemini, OpenCode), official-marketplace lines once listed, requirements right below.
- [ ] First prompt to try; "How it works" numbered pipeline naming skills; diagram.
- [ ] Skills map tables (Router, Workflows, Domain).
- [ ] Gallery 2-column table with brief captions; before/after; honesty caption.
- [ ] FAQ / Troubleshooting, Privacy and network, Contributing, Credits, License, author line.
- [ ] First screen readable as plain Markdown (directory listing renders the README).
