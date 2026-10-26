# vendor/hypit

Selected remake documents from [hypit-ai/hypit](https://github.com/hypit-ai/hypit), © 2026 Hypit.AI.

## License (read before use or redistribution)

Everything in this folder is under Hypit's own license (`LICENSE` here): a modified Apache License 2.0 with extra conditions. It is **excluded from the Apache-2.0 grant** of the rest of Ice Motion Director. In short, and the `LICENSE` text governs:

- You may use these documents for your own organization's work, including commercial work for clients.
- You may not sell, license for a fee, or supply for commercial gain this folder or a derivative of it, and you may not use it to run a multi-tenant or hosted service, without written permission from Hypit.AI.
- Keep the Hypit name and copyright notices.

The `LICENSE` text is byte-identical to the Hypit original, dash characters included: license texts are the one exception to this repository's no-dash rule.

## What is here and why

| File | Upstream path | Use in ice-remake |
|---|---|---|
| `reference-video.md` | `skills/hypit/references/creation/reference-video.md` | Whole-then-detail reading of a reference, word-labelled grids, ANALYSIS and TIMELINE |
| `transformations.md` | `skills/hypit/references/creation/transformations.md` | Adaptation lenses and role propagation (trimmed, see below) |
| `brief.md` | `skills/hypit/references/creation/brief.md` | Brief vs Treatment, fix at the owning file |
| `project-files.md` | `skills/hypit/references/creation/project-files.md` | Reference truth vs target truth, one job per document, resume from files |
| `script-and-time.md` | `skills/hypit/references/creation/script-and-time.md` | Semantic (word-anchored) timing so variants re-time themselves |
| `review.md` | `skills/hypit/references/production/review.md` | Compare a reconstruction by function, repair the owning fact |
| `explainer-craft-notes.md` | `examples/complex-explainer/productions/explainer/CRAFT-NOTES.md` | Worked retrospective, illustration only |

Each file starts with a notice naming its source and any change. Links inside these files that point to documents not copied here refer to the upstream hypit repository layout; they are not part of this plugin.

## Not copied

Not copied into this folder:

- Hypit's face, host-swap, voice-cloning and motion-transfer flows. Ice Motion Director handles those uses itself under the `ice-assets` skill, `references/ai-media-policy.md` section 9.
- Link downloading (`hypit download`, yt-dlp wrappers, browser-impersonation transport).
- The Hypit CLI, SVML compiler, packages and example media (real-person photos, voices, soundtracks).

The `hypit` commands mentioned in these documents belong to the Hypit toolchain. Ice Motion Director does the same jobs with the bundled scripts in `../../scripts/` and the steps in `../../SKILL.md`.
