# Build status and resume guide

## Current state (2026-10-31)

- Released: 0.2.10 (2026-10-31): the genre check reads the body, a followed reference and the pointer (L48), after the explainer (L46) and brand film (L47) playbooks of 0.2.9.
- Public repository since 2026-10-26, Apache-2.0, no hosted CI: `node scripts/gates.mjs` runs every check and the pre-push hook runs it.
- 29 skills: 13 commands (`ice`, `ice-status`, `ice-style`, `ice-01-brief` to `ice-10-deliver`), the router `ice-motion-director` and 15 internal skills. 48 lessons in `docs/maintainers/lessons.md`, each with its test.
- File budget: about 580 files against the 600 cap of `tests/repo.test.mjs`; merge small files before adding new ones.
- Release check: a manual one-prompt run on a clean Claude before every major release (`AGENTS.md`, Behaviour check before a release).

Everything below is the build history from 2026-10-19, kept as written; numbers in it (skills, tests, files, CI) are from that day.

## History (2026-10-19)

Read `AGENTS.md` and `docs/maintainers/architecture.md` first.

## Done
1. 35 source repos starred, sorted into GitHub lists, cloned to a local folder of source clones outside this repo (read-only, untrusted, never committed).
2. 19 extraction files in an extraction folder next to those clones (rules ledgers with tags, licenses, reusable files). Shared briefs there: `BRIEF.md` (extraction), `SYNTHESIS-BRIEF.md` (skill building).
3. Repo standards spec (`repo-standards.md`), architecture, Apache-2.0 license, NOTICE, first mascot draft (`brand/mascot.svg`, beret needs a redesign).

## In progress when this file was written
- 15 skill-building agents, one per skill in `skills/`. Each writes `skills/<name>/` and a merge log named `<name>.md` in a merge-log folder next to the source clones. A skill is finished only if its merge log exists and its `SKILL.md` parses.
- Install matrix research writing `docs/maintainers/install-matrix.md` (per agent and per OS).

## How to resume a skill that did not finish
Start a fresh agent with: "Read `SYNTHESIS-BRIEF.md` in the extraction folder and follow it. Your skill: `<name>`" plus the line for that skill below. Delete the half-built `skills/<name>/` first if its merge log is missing.

| Skill | Budget | Owns (summary) | Main extraction inputs |
|---|---|---|---|
| ice-direction | 30, high effort | BRIEF slots, 1-4 clarifying questions, dated research from brief slots, pitch round, critic, consultant, approver roles, DIRECTION.md, color psychology, type pairing, fingerprint format, 4-of-6 distance, default-look gate, reference fidelity, mixing references | hyperframes-skills, mamdouh, group-a, omar-local, mg-styles-15, reelmimic, lists-community-prompts, huashu, lemo, hypit, group-b |
| ice-motion | 35, high | Motion grammar, measured curves, springs, holds vs push by type, cut catalog, seams and carry, camera, composition, density, cursor actor | hyperframes-skills, hyperframes-docs-registry, group-c, group-a, anidoodle, huashu, noncommercial-ideas, omar-local, lists, group-b, mg-styles-15, remotion, mamdouh |
| ice-type | 20, medium | Type in motion, kinetic type, captions styles, reading time, safe zones, script-matched captions | hyperframes-skills, hyperframes-docs-registry, herk, lemo, claude-code-video-toolkit, group-d, lists, huashu, anidoodle |
| ice-arabic | 20, high | Arabic letterforms and dots, kashida, bidi, numerals, Arabic captions, dialect as a setting, ASR timing, failure lessons | group-d (video-ad-editor), mamdouh, omar-local |
| ice-audio | 35, high | Music sourcing from real libraries with options by ear (code-generated music with mgaudio only on request), beat grid, SFX, VO pacing, ducking, loudness scoped by platform, listening check | group-b, mg-styles-15, anidoodle, lemo, claude-code-video-toolkit, hyperframes x2, group-a, herk, omar-local |
| ice-styles | 60, medium | Style catalogs (lemo 51, huashu 36 + 9 grammars, anidoodle 32, mg-styles 15, a broadcast news family measured on six public reels), prompt library index with credits | lemo, huashu, anidoodle, mg-styles-15, lists, group-b |
| ice-engines | 40, high | Engine choice, per-engine guides, determinism, lint, render and export, platform specs | hyperframes x2, remotion, group-a, claude-code-video-toolkit, mg-styles-15, reelmimic, anidoodle, group-c, huashu |
| ice-assets | 20, medium | Licensed sourcing, truth sheet and facts.json, brand authenticity, AI media policy, screen captures | omar-local, group-c, anidoodle, claude-code-video-toolkit, hyperframes-docs-registry, group-a, reelmimic, group-d |
| ice-qa | 40, high | All gates (storyboard lint, slop scan, density, seams, captions match, loudness run, climax duel), critic roles, delivery report, copied gate scripts | group-c, huashu, group-b, hyperframes x2, herk, claude-code-video-toolkit, group-a, mg-styles-15, reelmimic, anidoodle |
| ice-film | 35 + noncommercial/onetake 12, high | From-scratch pipeline, roles, 12 film-type files, script shapes, openers, logo sting | group-a, group-b, omar-local, hyperframes-skills, noncommercial-ideas, mg-styles-15, herk |
| ice-explainer | 30 + 2 noncommercial folders, medium | VO-led explainers, semantic tags, word-timed segments, fast pipeline, verify loop | noncommercial-ideas, group-d, huashu, group-b, lists, claude-code-video-toolkit, anidoodle |
| ice-remake | 35 + vendor/hypit 15, high | Reference watching and measuring, 4 notes files, shot mapping, fidelity, climax duel, variants | reelmimic, hypit, group-d, group-a, mamdouh, lists |
| ice-edit | 40, high | 7 edit types (news reel added in 0.2.4), transcript editing, silence and retakes, room tone, house style numbers, B-roll, vertical ads, shorts | herk, group-d, claude-code-video-toolkit, hyperframes-skills, group-b, remotion, omar-local |
| ice-lottie | 25, medium | Lottie and Skottie rules, UI motion, logo raster to SVG, exports, dev handoff | group-c, group-b, omar-local, hyperframes-docs-registry |
| ice-ideas | 20, medium | Concepts, hooks, scripts, storyboards, treatments, campaign variants | hyperframes-skills, herk, group-b, noncommercial-ideas, hypit, lists, omar-local, group-a |

## Progress since (2026-10-19, evening)
- All 16 skills, manifests, README, brand (voxel ice mascot, seated cut-out), CREDITS, LICENSES, CI, freshness job, tests (55 pass) and the consistency pass are committed. Repo at 511 files.
- Running: 3 pilot demo films in a local demos folder next to the source clones, outside this repo (01-saas-launch, 02-delivery-app-arabic, 03-real-estate), driven by a `PILOT-BRIEF.md` in that folder. Each writes `PILOT-NOTES.md` with skill problems. Next: fix those problems, then render the remaining industry demos (real estate, delivery app, SaaS, bakery, fitness, fintech, fashion, clinic, education, travel, automotive, gaming, beauty, coffee, logistics, events, nonprofit, music, sports, cybersecurity), host videos and GIFs as GitHub user-attachments or Release assets (the repo is at the 512 file limit), fill the README gallery.

## Next steps after all skills exist
1. Write the router skill `skills/ice-motion-director/` (state table, classify table, intake, direction, hand-off, harness refs) and all manifests (Claude, Codex, Cursor, Gemini, `npx skills`).
2. Cross-skill review: duplicates, broken links, dash check, file budget (about 512), every script cross-platform (Windows, macOS, Linux), strict YAML. Also: restore every copied license text byte-identical to its source (agents replaced dashes inside some); translate the Chinese files in `noncommercial/` to English with a translation note; write an original asset-manifest validator for ice-assets; pin exact versions for ice-remake `analyze.py` dependencies; add Snapchat and Facebook Reels safe zones from fresh research; make ice-explainer point to ice-ideas for narration writing rules; check every skill (ice-direction, ice-type, ice-arabic, ice-engines, ice-edit) uses the AGENTS.md font rule (user fonts first, then best fit between system and Google Fonts); define a version refresh policy for pinned tool versions (hyperframes, remotion) and dated platform specs (a CI check plus a dated "last verified" line in ice-engines).
3. Build `CREDITS.md` and `LICENSES/` from the merge logs; optional CC0 audio pack as a Release asset.
4. Mascot redesign, visual README (install per agent and per OS from `install-matrix.md`), 15 to 30 industry demo films hosted as user-attachments, GIFs in README.
5. Keep the repo private; the founder publishes it. Install locally for all agents with the maintainer's own skill sync tool (kept outside this repo).

## 2026-10-22
- Hosted CI removed by the founder's decision: `.github/workflows/` is gone. `node scripts/gates.mjs` runs every check, and the git pre-push hook in `.githooks/` runs it before each push; `--all` adds the Python pins and the render smoke test after a version bump. Version freshness is a by-hand step before each release (`node scripts/freshness.mjs`).

## 2026-10-26
- Version 0.2.0, the first public version: every manifest and every `SKILL.md` `metadata.version` bumped together (a test now checks the skills too), `CHANGELOG.md` added, and the README install section rewritten (interactive `npx skills add` first, a flags table, native plugin installs, an Update section).
