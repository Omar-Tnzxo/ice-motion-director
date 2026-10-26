# Changelog

Every notable change to Ice Motion Director is listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/). Installed plugins update only when this version number changes.

## 0.2.0 - 2026-10-26

The first public version.

### Added

- **Cold-viewer clarity gate.** A fresh reviewer who gets no brief, only what an audience would see (style frames and storyboard, then the animatic, then the draft), writes what happens, what is sold and the one idea. The film is built and delivered only when that matches the concept. Films for apps and products must show the product doing its real job. The remake and edit stage tables run the same reads.
- **Four choices for every open decision.** At stage 01, after a quick research pass, every decision your words leave open is asked as a question with four options, the recommended one first with its reason. You can always write your own answer, or say "don't ask" to take every recommendation.
- **Checks at the earliest stage.** Every check runs at the first stage whose material can show the problem, at the strength of the final gate. Brand identity tests (random frames must read as the brand) and a side-by-side benchmark of the style frames against real studio work are wired into the router, the routes and the workflows.
- **Style recipes.** A reference video, image set or saved site becomes one portable recipe (`STYLE-RECIPE.md` and `style-recipe.json`): measured grammar, palette, typefaces, camera and element motion, tempo, the feeling over time, open slots and a ready prompt. Ice rebuilds the style on your footage or from scratch.
- **Sound map.** A reference video's sound is mapped into music sections and energy, sound effects by type and time, voice, and loudness. Genre and instruments are proposals you confirm.
- **Drawn art quality.** Craft rules for code-drawn illustration, an art check at the style frames (05) and again at the build (07), a ladder of art sources (your art, licensed libraries, AI art only when you start it, 3D, hand-coded SVG last) and a vectorizer that rebuilds traced images by parts.
- **Run log.** Every run logs your words, short summaries of the agent's replies and every file sent or received, and delivery exports one small self-contained share file with keys, contacts and paths masked. The agent's transcript is never read.
- **Local gates.** `node scripts/gates.mjs` runs every check, and a git pre-push hook runs it before each push. Hosted CI is gone.
- A test that every `SKILL.md` carries the same version as the plugin manifests.
- `CHANGELOG.md`.

### Changed

- **No rights or consent gate.** Ice never asks whether a reference is yours or whether you have a person's permission; you carry those rights, recorded in one neutral line. Two limits stay: the reference's own footage, music, voice, logos and characters never ship (the style is recreated instead), and real people's likenesses are never used in sexual, demeaning or deceptive content. Platform AI labels are your business at upload.
- The README install section leads with the interactive `npx skills add`, which asks for agents and scope, then shows the flag forms, the native plugin installs and a new Update section.
- README and landing page links point to the site on Cloudflare (https://ice-motion-director.omarhassan.workers.dev/).
- The README gallery shows the Spotify concept ad, an unofficial concept, with a "View workflow" button. Gallery demos carry the unofficial line in the caption and the landing card, not in the film.

### Fixed

- Sound map: a beat read from the low band, a continuous low bed counted as music, energy-relative sections with a final-hit outro, weighted genre proposals, and sung versus spoken vocals (a vocal running through the music reads as probably sung).
- Reference analysis and recipes: camera versus element motion, one-take structure, robust tempo, palette roles, and honest recipe text.
- Recipe-only runs: orientation, crop, seams, free time, a slim stage 01, and export as a recipe instead of a missing film.
- QA: stillness measured on the content region, a cursor line, one rule for when a critic report is required, and lint C6 judging the on-screen box (skipping tilted 3D planes) with text size as drawn.
- Engines: `render-html` fails fast on missing files, serves the project folder and composites in software.
- Audio: music starts at full level in the master, with explicit music edge flags; `pedalboard` pinned to a build that imports on CPUs without AVX-512.
- Assets: screen captures handle language, buttons, redirects, consent banners, empty shots and UI strings; the validator finds its sheet path and handles rebuilds from several captures.
- The case study and run log never export raw UI-fidelity sheets; the run log embeds the images shared in the conversation.
- Maintenance fixes before the repo went public.

## 0.1.0 - 2026-10-20

The first private build.

### Added

- 16 merged skills from about 34 open-source video and motion repos plus the founder's own skills, with a router skill as the one entry point and plugin manifests for Claude Code, Codex, Cursor, Gemini and `npx skills`.
- Step mode: 12 stage commands (`/ice-01-brief` to `/ice-10-deliver`, plus `/ice` and `/ice-status`) for every agent, each ending in a review card.
- The production spine scaled by film size, stage order per film and edit type, supplied-material intake, the business brief, industry advertising rules and the case study export.
- The `ice-style` preset library, the real-brand material rule, a richness floor and the AI media policy.
- Cross-platform scripts, pinned dependencies in one `versions.json`, freshness checks, an asset manifest validator and verified platform safe zones.
- The voxel ice mascot, icons and brand guide; a README with install steps for every agent and operating system; credits and byte-identical third-party licenses.

### Fixed

- Arabic word counts, false freeze detection, scoped end holds and the richness gate in QA.
- A numpy-only music fallback, a 48 kHz true-peak master, a zero-install HTML renderer and an engine fallback ladder.
- Every `SKILL.md` kept under 20 KB for agents that cut long skills, with a size test.
