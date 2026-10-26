# Security policy

## Supported versions

Only the latest release of Ice Motion Director receives security fixes. Before you report, check that the problem still happens on the latest release (update with the command for your agent in the README's install section).

## Reporting a vulnerability

Report privately through GitHub's private vulnerability reporting:

1. Open the repository's **Security** tab.
2. Choose **Report a vulnerability** (direct link: <https://github.com/Omar-Tnzxo/ice-motion-director/security/advisories/new>).
3. Describe the problem, the affected file or command, your operating system and agent, and the smallest steps that reproduce it.

Please do not open a public issue, discussion or pull request for a vulnerability until a fix is released. You will get a first answer within 7 days. Once the problem is confirmed, we agree on a fix and a disclosure date with you, release the fix, then publish the advisory with credit to you unless you ask to stay anonymous.

## Scope

In scope:

- **The bundled scripts.** Every `.mjs`, `.js` and `.py` file under `skills/` and `scripts/` runs locally on the user's machine, started by their agent. Examples of what counts: a script that writes outside the project folder it was given, runs a shell command built from untrusted input, follows a path or link out of its folder, downloads or runs code that was not pinned and disclosed, or leaks keys, contacts or paths into a share file such as `ice/case-study/run-log.html`.
- **The install paths.** The plugin manifests, the install commands documented in the README and `docs/maintainers/install-matrix.md`, and the pinned versions in `skills/ice-engines/references/versions.json`, where a documented step could install or run something other than what it says.
- **Instructions in the skills** that would lead an agent to run a dangerous command or send the user's files or data somewhere without telling them.

Out of scope:

- Vulnerabilities in the agents themselves (Claude Code, Codex, Cursor and the others), in Node, Python, FFmpeg or Chrome, or in third-party packages. Report those to their own projects. If a pinned version is affected, tell us so we can bump it.
- The content of films an agent makes, and prompt-injection risks inherent to the agent you run, unless a file in this repo makes them worse.
- The project website and the maintainers' own git hook in `.githooks/`, which never runs for users.
