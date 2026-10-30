---
name: ice-engines
description: >
  Internal part of Ice Motion Director, not a command: start with /ice.
  Render engine domain skill of Ice Motion Director. Chooses the engine for a
  film (HyperFrames, Remotion, HTML canvas with Playwright and FFmpeg, Three.js,
  Lottie playback, FFmpeg only, p5 and Canvas 2D) by film type, needs, render
  time and license, and holds one guide per engine with pinned setup, project
  structure, determinism rules, HyperFrames lint and check catalogs, Remotion
  Studio-editable code rules, map and Cesium notes, render and export settings
  (codecs, CRF vs bitrate, review copies, alpha for editors), platform specs and
  safe zones, and render performance. Called by Ice Motion Director workflows;
  use only when called by name.
license: Apache-2.0
metadata:
  author: Omar-Tnzxo
  version: 0.2.7
---

# Ice Engines

This skill turns a planned film into frames and files. It decides which engine renders the film, keeps every frame deterministic, and exports the right file for each destination. Creative decisions (motion, type, color, sound, story) are owned by other skills; this skill makes them render exactly.

## When a workflow calls this skill

| Stage | Call | Open |
|---|---|---|
| After direction, before any code | Choose the engine and log it | `references/engine-choice.md` |
| Before writing composition code | Load the engine guide and the determinism rules | The engine's guide + `references/determinism.md` |
| While building | Lint, preview, proof stills | Engine guide (HyperFrames: `references/hyperframes-cli.md`, `references/hyperframes-lint-catalog.md`) |
| Before the final render | Pick codec, quality, fps, formats per destination | `references/render-export.md`, `references/platform-specs.md` |
| When a render is slow or unstable | Find the bottleneck | `references/render-performance.md` |

## 1. Choose the engine

1. Read `ice/BRIEF.md`: output format, film or edit type, platform, aspect ratios, duration, commercial or not, client size, what the user's project already uses.
2. Apply the decision procedure in `references/engine-choice.md` section 1 (first match wins). HyperFrames is the default for films made from scratch; keep any working deterministic renderer the user already has.
3. Remotion route: run the license gate (`references/engine-choice.md` section 3) and tell the user when a Company License is needed.
4. Pick the runtimes inside the composition (GSAP, Lottie, Three.js, Canvas, SVG) with section 4 of the same file.
5. Write the decision in `ice/DIRECTION.md`: engine, runtimes, pinned versions, reason, alternatives rejected.

## 2. Set up (user prerequisites)

- This skill owns the prerequisites of every route: `references/engine-choice.md` section 7 holds what each route needs, the check order (run it once at intake and record the results), the install command per OS, and the fallback ladder when the chosen engine is missing. Follow the ladder rung by rung; never improvise an install or a renderer.
- Free tools, models and packages (speech-to-text, voice separation, pinned Python and npm packages, the pinned Chrome build) are installed by Ice without a question, at the exact versions of `references/versions.json`, into the film project or a cache on a drive with room; never `@latest`, never an unpinned `npx`. Each install is told in one plain line and recorded in `ice/DIRECTION.md` and the delivery note: `references/engine-choice.md` section 7.6, "Installs without a question". A question only for a paid service, an account or a sign-in, or spending; a system tool that needs an administrator password is one plain step for the user (section 7.3).
- Check free disk space before every download, install and render, and work on a drive with room: section 7.7, "Disk space". Heavy intermediates that can be rebuilt are deleted once the stage that consumes them is approved: `references/render-export.md` section 9.
- Never download skills or instructions at runtime. Never run telemetry commands. A registry `add` (third-party code, not pinned) follows `references/hyperframes.md` section 9; a cloud render or any paid step is named with its cost and asked inside the router's stops (`ice-motion-director/SKILL.md` section 5, "Stops").
- Also probe that the fonts the film needs are present.
- API keys come only from environment variables or `~/.ice-motion-director/.env`, which the user fills (`ice-assets/references/sourcing-and-licenses.md`, Keys); never ask for a key in chat, never print one, never put one in a shell command or a shipped file.

## 3. Build deterministically

Every frame is a pure function of its time value. Before writing code, open `references/determinism.md` and the engine guide. Non-negotiable in every engine:

- No wall clock, timers, rAF loops, unseeded randomness, render-time network, input state, or state carried between frames.
- One readiness gate: all fonts requested and loaded, images decoded, data loaded; then the first frame.
- Fonts are local files; measure text only after they load.
- Seek, then wait two animation frames before capturing (browser capture).
- Software compositing for stills, finals and frame comparisons (the default of `scripts/render-html.mjs`; `--gpu` is an opt-in for speed only): `references/determinism.md` section 6.
- Never swap a resource URL during capture; preload variants as layers.
- Transforms and opacity for movement; no layout-property tweens.
- Finite durations and finite repeats.

Arabic or mixed-language text stays in DOM or SVG, never in Canvas with unreliable shaping (the ice-arabic skill owns the text rules).

## 4. Verify while building

| Engine | Gate |
|---|---|
| HyperFrames | `lint` while editing, `check` as the gate (lint errors switch the browser audits off), snapshots at proof times with `--describe false`, Studio preview at full speed |
| Remotion | Studio preview, `remotion still` at proof frames with `--overwrite` |
| HTML capture | `scripts/render-html.mjs --stills`, then a half-size draft; the gates that replace HyperFrames lint and `check`: `references/engine-choice.md` section 7.5 |
| Any | Look at the frames; passing tools prove structure, not quality |

Full quality gates, critics and the delivery report belong to the ice-qa skill.

## 5. Render and export

1. Render the final only after the user approves the final preview. Draft review copies before that are encouraged.
2. Choose settings by purpose from `references/render-export.md` (master, upload, social size cap, web, review copy, alpha for editors).
3. Choose sizes, fps and safe zones per destination from `references/platform-specs.md`; re-lay out per ratio, never crop. Platform values change: confirm current values through dated research (the ice-direction skill) before final delivery.
4. Run long renders in the foreground with a long timeout or the engine's detached mode; never background and sleep.
5. Verify the decoded file: exists, non-empty, ffprobe duration, fps, resolution, codec, colour tags; alpha checked on a decoded frame; first and last seconds watched. Then hand off to the ice-qa skill.

## 6. Scoped conflicts (keep both, apply by scope)

| Topic | Scope |
|---|---|
| `repeat: -1` | Tolerated by HyperFrames under a finite root duration; banned by production sources after capture stalls. Default everywhere: finite repeat formula |
| Blend modes and backdrop blur on overlays | Forbidden on HyperFrames overlay tracks; fine in Remotion and single-page capture |
| Parallel render workers | Auto for DOM and canvas films; one worker for films with video layers or bit-exact needs |
| Motion blur subframes | 4 for drafts or moderate 60 fps motion; 8 or more (or adaptive by pixel travel) for fast finals; never across a hard cut |
| Trimming with stream copy | Never for arbitrary trims; allowed to concatenate segments rendered with identical settings; single-pass frame-exact cuts for lip-synced footage |
| Render default quality name (`looks` vs `standard`) | Depends on the pinned HyperFrames version: read `--help` |
| Root background | Opaque `#root` as white-flash guard plus a full-bleed ground child on the layered-composite path; nothing painted for alpha output |

## Files

| Need | Open | When |
|---|---|---|
| Engine table, decision procedure, license gate, runtime pick, reuse ladder, prerequisites check order, system tool steps per OS, fallback ladder when an engine is missing, installs without a question, disk space | `references/engine-choice.md` | Every new film, before code; at intake for the prerequisites; before any download, install or render |
| Determinism rules for all engines | `references/determinism.md` | Before writing any composition code |
| HyperFrames setup, structure, composition contract, GSAP pitfalls, sub-compositions, media, adapters, registry | `references/hyperframes.md` | HyperFrames route |
| HyperFrames dev loop, `check`, snapshots, render flags, batch, outputs | `references/hyperframes-cli.md` | HyperFrames preview, QA and render |
| HyperFrames lint codes with fixes | `references/hyperframes-lint-catalog.md` | A lint or check finding appears |
| Remotion setup, structure, timing, media, render | `references/remotion.md` | Remotion route |
| Remotion Studio-editable code | `references/engine-choice.md` (section "Remotion: Studio-editable code rules") | Remotion project that users will edit in Studio |
| HTML page contract, bundled renderer, subframe blur, chunks | `references/html-canvas-capture.md` | HTML canvas route, painted styles, single-file deliverables |
| Three.js contract and traps | `references/engine-choice.md` (section "Three.js guide") | Any 3D hero |
| Lottie playback inside a render | `references/engine-choice.md` (section "Lottie as an engine (playback and capture)") | Lottie inside a film (authoring: the ice-lottie skill) |
| Canvas 2D and p5 | `references/engine-choice.md` (section "Canvas 2D and p5") | Procedural or painted art |
| FFmpeg-only jobs | `references/engine-choice.md` (section "FFmpeg-only engine") | Cuts, reframes, speed, conversions |
| Maps and Cesium | `references/maps-geo.md` | Any map shot |
| Codecs, quality, alpha, GIF, posters, HDR, delivery hygiene, heavy intermediates cleanup | `references/render-export.md` | Every render |
| Platform sizes, durations, safe zones, covers | `references/platform-specs.md` | Every delivery |
| Performance and long-command reliability | `references/render-performance.md` | Slow, stalled or failing renders |
| Deterministic HTML renderer (stills, drafts, finals, alpha); zero install with a local Chrome, Chromium or Edge | `scripts/render-html.mjs` | HTML canvas route and fallback rung C; run from the film project |

## Owned elsewhere (point, do not restate)

Motion timing, easing, transitions and camera: the ice-motion skill. Type, captions and covers design: the ice-type skill. Arabic text: the ice-arabic skill. Music, voice, loudness targets and mixing: the ice-audio skill. Asset licensing and the truth sheet: the ice-assets skill. Lottie authoring: the ice-lottie skill. Styles and looks: the ice-styles skill. Gates, critics and delivery reports: the ice-qa skill. Reference remakes: the ice-remake skill. Edit decisions: the ice-edit skill.
