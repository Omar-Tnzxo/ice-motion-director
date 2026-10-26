# Contributing to Ice Motion Director

Thank you for helping. Ice is a set of agent skills, so most contributions are careful writing: a rule, a reference, a style, a film type, a script or a test. This page is the short path. The full rules live in two places, and this page points to them instead of repeating them:

- [`AGENTS.md`](AGENTS.md): the product rules and every founder decision. Read it fully before your first change.
- [`docs/maintainers/`](docs/maintainers/): the architecture (`architecture.md`), the standards checklist the repo is measured against (`repo-standards.md`), the install matrix (`install-matrix.md`) and the stage commands (`stage-commands.md`).

By taking part you agree to the [Code of Conduct](CODE_OF_CONDUCT.md). Security problems go through [SECURITY.md](SECURITY.md), never a public issue.

## 1. Set up

You need:

| Tool | Version | Used for |
|---|---|---|
| Node.js | 22.20 or newer | the tests, the gates and every bundled `.mjs` script |
| Python | 3.11 or newer | the audio, quality-check and recipe scripts and their tests |
| FFmpeg | any current release | renders, audio and frame checks |
| Chrome or Chromium | any current release | rendering HTML films and the render smoke test |
| `claude` command | current | `claude plugin validate --strict` inside the gates |

Install commands for Windows, macOS and Linux are in the README's prerequisites section and in `docs/maintainers/install-matrix.md`.

Then, once per clone:

```bash
git config core.hooksPath .githooks
```

```bash
node scripts/gates.mjs
```

## 2. The gate is the pre-push hook

There is no hosted CI in this repo (founder decision, see `AGENTS.md`), and a test keeps `.github/workflows/` empty. The pre-push hook in `.githooks/` runs `node scripts/gates.mjs` before every push, and a push goes out only when it passes. So:

- Enable the hook as shown above. Never push with `--no-verify`.
- `node scripts/gates.mjs` runs the test suite and `claude plugin validate --strict .`. Run it before you open a pull request and paste its summary into the pull request. It runs at most 2 test files at once so a busy machine does not run out of memory; set `ICE_TEST_CONCURRENCY` to change that (1 is fully serial).
- After a version bump or a change to the pinned tools (`node scripts/freshness.mjs bump`), run `node scripts/gates.mjs --all`. It adds a clean Python environment that imports every pinned package and a one-second render smoke test.
- A red gate is fixed, never skipped.

## 3. Rules every change keeps

These come from `AGENTS.md` and `docs/maintainers/repo-standards.md`; the tests enforce most of them.

- **One canonical rule per idea.** Before you add a rule, search for it. If it already exists, change that one place and point to it from elsewhere. Two versions of the same instruction is a bug.
- **Weak-agent-proof writing.** Assume a weak agent will apply every sentence literally to an unrelated request. No literal example search queries and no single concrete example that could be copied out of context; give slots, or several varied examples marked as illustration only.
- **No em dash or en dash characters**, anywhere: code, comments, docs, commit messages. Use a comma, a period, a colon, parentheses, or a plain hyphen for ranges. Licence texts are the only exception and are never edited.
- **Everything in English**, and Arabic or RTL behaviour kept first class wherever text is shown.
- **`SKILL.md` stays lean**: under 500 lines (the router under 200), references one level deep, reference files over 300 lines carry a contents list. Stage command skills stay thin.
- **File budget**: the plugin aims for 512 files or fewer and may never pass 600. Merge small files before adding new ones. Every text file stays under 256 KiB and every file under 5 MiB. No `.mp4`, `.mov`, `.pdf` or `.zip` in the repo; demo videos go to GitHub user-attachments or Releases.
- **Licences**: every source is handled by its class in the table in `AGENTS.md` (verbatim, modified Apache, PolyForm Noncommercial, or ideas only). Never copy a file from another project without its licence and a credit in `CREDITS.md`, and never copy anything from a source with no licence; rewrite the idea in your own words instead.
- **Every operating system**: scripts run on Windows, macOS and Linux. Prefer Node or Python, use path APIs, never assume bash.
- **Pinned versions** live in one file, `skills/ice-engines/references/versions.json`; read it, never hardcode a version.
- **Read before you copy**: no script from anywhere enters the repo without being read, and no install step runs remote code silently.

## 4. Common contributions

### Add a style

1. Read `skills/ice-styles/references/style-method.md` and the family file your style belongs to (`skills/ice-styles/references/family-*.md`).
2. Add the style to that family file in the same fields as its neighbours. A style is a recipe with measured grammar, never a single look that every film would copy.
3. Add its row to `skills/ice-styles/references/catalog-index.md` (name, id, what it looks like, best use, source).
4. If it came from another project, add the credit and licence as in section 3. If it draws art in code, it follows `skills/ice-styles/references/code-illustration-craft.md`.

### Add a film type

1. Read `docs/maintainers/architecture.md` section 4 and `skills/ice-film/references/film-setup.md` section 1.
2. Copy the fields of an existing file in `skills/ice-film/references/film-types/` (edit types live in `skills/ice-edit/references/edit-types/`), including its `Stage order:` line, and fill every field for your type.
3. Add the type to the list and signals in `skills/ice-film/SKILL.md` and `film-setup.md`. When its rules conflict with another type's, keep both and scope each to its types (rule 6 in `AGENTS.md`).
4. Add a test that names the new file, so a broken link fails the gates.

### Submit a film to the gallery

Open a **Gallery submission** issue. Give the prompt you used, the agent and model, your answers to the stage 01 questions, a link to the video (a GitHub user-attachment or a public host, never a file in the repo) and, if you are willing, the run log share file `ice/case-study/run-log.html`, which masks keys, contacts and paths. The founder selects gallery films; the official demos follow the gallery rules in `AGENTS.md`. Only submit films you have the rights to share.

### Fix a bug

Reproduce it, add a test in `tests/` that fails without your fix, then fix it. Tests use Node's built-in test runner and the helpers in `tests/helpers.mjs`; zero dependencies.

## 5. Commits and pull requests

- Conventional commit prefixes: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`. A short, plain subject that says what changed, for example `fix: <what was wrong, in plain words>`.
- One idea per commit. Stage your own files by path; never `git add .` in a shared tree.
- Versions reach users only when the number changes. A release bumps the SemVer version in every manifest and every `SKILL.md` `metadata.version` in one commit; leave that to the maintainers unless asked.
- Fill the pull request checklist. A pull request is merged when the gates pass on the maintainer's machine and a maintainer has read it.

Questions and ideas are welcome in [Discussions](https://github.com/Omar-Tnzxo/ice-motion-director/discussions).
