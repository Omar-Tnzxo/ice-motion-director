---
name: ice-qa
description: "Internal part of Ice Motion Director, not a command: start with /ice. Quality gates and the independent critic loop for Ice Motion Director films and edits: storyboard lint, pre-render lint, contact sheet before render, frame and seam checks, slop and PowerPoint-look scans, motion density and dead air, the blue-purple default-look gate, template distance and fingerprint checks, captions and sync validators, loudness and spec checks on the exported file, a climax duel against a reference, the compliance gate for required disclaimers and restricted claims, the cold-viewer clarity gate, render approval, the delivery report with measured numbers, the case study export and the run log share file. Called by Ice Motion Director workflows; use only when called by name."
license: Apache-2.0
metadata:
  author: Omar-Tnzxo
  version: 0.2.1
---

# ice-qa

Owns every gate and every critic between a plan and a delivered file. Workflows call this skill at each stage below; they never grade their own work and never restate a gate. All outputs go to `ice/review/` in the user's project.

## Non-negotiables

1. **Builder never grades itself.** Every review is done by a fresh agent with no build history (`references/critic-loop.md`). The builder runs gates and fixes; critics judge. A spine stage the crew row gives a critic is judged with the "Stage critic" prompt (`references/critic-prompts.md`); in auto mode the approver role then passes the stage (the ice-direction skill's `references/roles.md` section 5).
2. **Measure the delivered file.** Frames, loudness, sync and spec come from the exported MP4, never the composition, preview or stems.
3. **Numbers or nothing.** Never write "verified", "clean" or "done" without `ice/review/NOTE.md` quoting script output from this session (`references/delivery-report.md`). A 15 s black render was once certified clean.
4. **A failing gate is fixed, not argued.** A PASS is a floor, not taste. A yellow needs one sentence of reason in the report.
5. **You cannot watch or hear.** Every claim about motion or sound comes from a measurement or a person; say which.
6. **Every fix carries before and after evidence** from a later render (full-resolution crops; 12 fps strips for motion).
7. **Thresholds are scoped by film type.** Sources disagree on holds, end cards, dissolves and motion density; use the scope tables, never one global number.
8. **The user decides taste; approvals follow the router's stops table (`ice-motion-director/SKILL.md` section 5, "Stops")** (`ice-motion-director/SKILL.md` section 5), and this skill adds no stop. Auto mode: the router's one preview approval (style frames or animatic, only when the session is interactive and the user did not say not to ask) is the only user approval; the final render needs none and is shown in the delivery note. Step mode: the 09 and 10 review cards. Silence is never a yes. Publishing, uploading or sending always needs the user's explicit yes, and in auto mode the agent never does them.

## Gate pipeline

Gate steps are lettered so they are never confused with the spine stages 01 to 10; the second column names the spine stage each one runs in.

| Gate step | Spine stage | Gates | Tool | Read | Blocks on |
|---|---|---|---|---|---|
| A. Plan | 04 to 06 | Storyboard lint (16 checks), plan checks, storyboard critic, slop scan on copy, compliance pre-check (every required disclaimer has a shot and a hold, no restricted claim), default-look on the palette, template distance and fingerprint on the direction, brand test and competitor swap (02, 04, 05), studio benchmark and art check on the style frames (05), cold-viewer reads 1 (end of 04 and 05) and 2 (06) | `scripts/storyboard_lint.py` | `storyboard-lint.md`, `slop-scan.md`, `delivery-checks.md` section 7.1, `anti-sameness-gates.md`, `clarity-gate.md` | Any red; fewer than 4 of 6 axes differ from the nearest template or from a recent fingerprint (same-brand rule and defaults: `anti-sameness-gates.md` section 3); a clarity FAIL (blocks 06 or 07) |
| B. Build | 07 | Engine lint and check, contract scan, page-chrome lint (G5), art check (confirms 05), transition smoke test | engine CLI, `scripts/lint.mjs`, `scripts/art-check.mjs` | `pre-render-lint.md`, `engine-lint-catalog.md` | Lint errors; G5 fail |
| C. Contact sheet before render | 07 | One still per beat inside the beat, transitions at cut -0.1 s and +0.2 s, PowerPoint tests on the sheet | engine snapshots, `scripts/contact-sheet.mjs` | `pre-render-lint.md` section 5, `powerpoint-tests.md` | Slide test fail, clipped or colliding text |
| D. Draft render | 07 and 09 | G0-G5, motion density, freezes, seams, slop scan on frames, the film type's richness floor (hero share, frame fill, empty half, in-shot motion, longest still; layers from the page) | `scripts/look.py`, `scripts/film_gate.py`, `scripts/motion_check.py`, `scripts/seam-gate.mjs` | `frame-checks.md`, `motion-density.md` (section 6), `seam-gate.md`, `slop-scan.md` | Any gate FAIL; film gate red, including a richness measure under the floor |
| E. Critic loop | 09 | Cold-viewer read 3 on the draft before the first full-film round, then fresh critics per round, climax duel when a reference exists, fix ledger | `references/critic-prompts.md` | `clarity-gate.md`, `critic-loop.md`, `climax-duel.md` | A clarity FAIL; any blocker; a lost climax duel |
| F. Render approval | 09 | Auto mode: check that the router's preview approval was given or was not due (non-interactive, or "don't ask"); never a new question. Step mode: the sheet, gate numbers and open yellows go on the 09 review card | | `delivery-checks.md` section 1 | Step mode only: the user has not approved the 09 card |
| G. Final file | 10 | Spec, frame 0, blacks, safe zones, assets and claims, compliance (required disclaimers present, exact, held for their reading time and legible in every version; no restricted claim), captions and sync, loudness | `scripts/probe-mp4.mjs`, `scripts/loudness.mjs`, `scripts/validate-beat-sync.mjs`, `look.py --strict` | `delivery-checks.md`, `captions-and-sync.md`, `audio-gates.md` | Hard release gates (below) |
| H. Delivery | 10 | NOTE.md with measured numbers and the permissions list; fingerprint write (`anti-sameness-gates.md` section 3) | | `delivery-report.md`, `anti-sameness-gates.md` section 3 | Missing report |
| I. Case study and run log (every delivery) | 10 | Export the run as `ice/case-study/case-study.json` plus small preview media, and the share file `ice/case-study/run-log.html` from the run log, only from the run files, masked | `scripts/export-case-study.mjs` | `delivery-report.md` section 4 | Never blocks delivery |

Small requests scale the pipeline down, never the honesty: a single logo sting still runs gate steps C, D, G and H and the micro clarity read; an ideas-only request (ice-ideas) runs gate step A only.

**Cold-viewer clarity gate** (founder decision, 2026-10-21). Craft gates do not prove a stranger understands the film. A fresh viewer who gets only what an audience would see (no brief, concept or script) says what happens, what is sold, what the product does and the one idea; the approver matches that against the concept's takeaway. A FAIL blocks 07 (reads 1 and 2) and 10 (read 3) in every mode, auto included. Where it runs, the packet, the pass rule, the grounding rule for metaphors and real interactions, the micro version and what to do on a fail: `references/clarity-gate.md`, the one home of the rule.

## Hard release gates (any one blocks, whatever the scores)

Wrong approved copy; malformed Arabic or RTL text; a distorted or recoloured official logo; an invented claim or number not on the truth sheet; an unreadable key scene at delivery size; an incomplete or desynced encode; a blank or frozen render; a blue-purple film without a brief reason; a never-ship slop item; a required disclaimer missing, altered, too short or too small in any version; a restricted claim from `ice/research/COMPLIANCE.md` on screen or in the voiceover; a richness measure of the film type's floor that is under the floor or was never measured (no Python for `film_gate.py`, an unmarked page in `lint.mjs`, a critic who did not count the by-eye measures); a cold-viewer clarity FAIL, or a read the film's size requires that never ran (`references/clarity-gate.md`).

## Scope by film type (quick table)

| Type | End hold (G3) | Dead-air rule | Transition check | Score scale |
|---|---|---|---|---|
| Product launch, app ad, hype promo, logo sting | Resolved end hold and CTA share from the `ice-motion` skill (holds-and-stillness section 3) | Energetic launch: the frozen-time row of the `ice-motion` skill (anti-slideshow-and-density section 4); app ad, hype promo: frozen time reported, still runs judged by `frame-checks.md` B1 under the hold policy | Seam gate, no crossfades unless the type policy allows | Blockers + window gate |
| Direct-response ad, talking-head ad, industry spot with an action | CTA held for its reading time (`ice-type` reading-time section 1): at least ~1.5 s at phone size, 3 s in launch recipes | Event gap at most 2.2 s unless a hold reason; industry spot: the frozen-time row above | Seam strips | Blockers + persona panel |
| Narrated explainer, data story | Type policy (`ice-motion` holds-and-stillness section 3) | New-element interval and event gap per beat from the `ice-motion` skill (anti-slideshow-and-density sections 3 and 4); film gate | Seam gate | Blockers |
| Brand film (calm), art film | Calm ending allowed | Report only; holds are design (hold policy C) | Dissolves allowed by policy | 1-10 jury (style-led) |
| Social short, shorts and reels | Social short: as the product launch row; shorts and reels: short | Event gap at most 2.2 s; first-three-seconds gate | Strips across every cut | Blockers + persona panel |
| Showreel | Outro 4 s or more | Beat grid | Cut offsets within ~35 ms of a beat | Blockers |
| Reference remake | Per reference | Per reference | Per reference | 1-5 with the reference as the ruler; climax duel |
| Lottie, loops, UI motion | None; loop seam 0 px | Per player | Seam frames | Blockers |

Details and sources: `motion-density.md` sections 3-4, `critic-loop.md` section 4. The scripts read the film type themselves (`--type`, else `ice/state.json`, else `ice/BRIEF.md`) and print the limit they used: end holds and the CTA block allowance from `motion-density.md` section 6, the richness floor from the `ice-film` type file (section 6.1).

## Arabic and RTL

When the language is Arabic or mixed, add to every frame review: letter joining and dots intact in every frame of motion (including mid-transition), no letter-by-letter typing of Arabic, correct bidi order of mixed lines and numbers, caption timing from Arabic ASR; Arabic-Indic digits on screen are checked against the script like any number. The rules are owned by the ice-arabic skill; ice-qa only verifies them and treats malformed Arabic as a hard release gate.

## Scripts

Copied from open-source projects and adapted (notices in each file and `scripts/NOTICE.md`). Read a script's header before running it. Nothing here downloads or installs; a missing dependency is reported by the router's prerequisite check at stage 01 (with one install step for the user's system), never installed by the agent itself. Minimum Node, Python and FFmpeg versions: `runtimes` in the `ice-engines` skill's `references/versions.json`.

| Script | Does | Needs |
|---|---|---|
| `storyboard_lint.py` | 16 shot-table checks scoped by film type; exit 1 on red. Also holds the film-type, cue-sheet and floor helpers the other Python scripts import | Python, standard library |
| `lint.mjs` (+ `_cdp.mjs`) | Gate G5 page-chrome lint on an HTML composition (renderAt, seek, __seek, timelines, GSAP pages); depth layers and hero size when the page marks them | Node, Chrome or Edge |
| `art-check.mjs` (+ `_cdp.mjs`) | Art check on code-drawn art: per hero object, fill tones, shading, shape count, texture layer and shadow; at 05 on the style frames, at 07 on the build (`pre-render-lint.md` section 4b) | Node, Chrome or Edge |
| `look.py` | Contact sheet, cuts, stills, end hold against the film type's limit, G0/G2/G3, audio audit, motion note | Python, ffmpeg |
| `film_gate.py` | Fast-motion share, blank run, blue-purple share, the richness floor read from the film type's owner table, slideshow report metrics, template similarity | Python, numpy and opencv-python-headless (exact pins in `scripts/requirements.txt`), ffmpeg |
| `motion_check.py` | Freezes where no region moves (declared holds apart), black and white frames, hard cut to black, strips | Python, numpy, ffmpeg |
| `seam-gate.mjs` | Numeric seam verification against `ice/plan/ledger.json` | Node, Chrome or Edge, a seekable page |
| `validate-beat-sync.mjs` | Beat anchors against transcript word times | Node |
| `frozen-time.mjs`, `loudness.mjs`, `contact-sheet.mjs`, `probe-mp4.mjs` | Frozen seconds, EBU R128 loudness, tiled sheets, spec assertion | Node, ffmpeg |
| `export-case-study.mjs` | Case study JSON and preview media from the run files, plus the self-contained `run-log.html` (with `run-log.mjs`); missing data stays empty with a note | Node; ffmpeg and ffprobe optional (WebP stills, animatic and final film previews, file metrics) |

Tools owned elsewhere, called by name: the strip and compare tools for reference work (ice-remake), the edit-plan validator (ice-edit), the script-to-ASR aligner (ice-type), audio QC and synthesis (ice-audio).

## Files

No file here is read at stage 01. Each is read only at the gate step its row names.

| Open | When |
|---|---|
| `references/storyboard-lint.md` | Gate step A: running the linter, plan checks, boards |
| `references/pre-render-lint.md` | Gate steps B and C: order of work, contract scan, G5 lint, the contact sheet before render, calibrating gates |
| `references/engine-lint-catalog.md` | Reading a HyperFrames lint or check finding; Remotion, Lottie, p5, Three.js checks |
| `references/frame-checks.md` | Gate step D: honest seeing, sampling plans, G0-G5, the frame checklist, motion, text, characters, numbers, loops |
| `references/seam-gate.md` | Writing the ledger and running the seam gate; seams without a DOM |
| `references/slop-scan.md` | Never-ship list, N1-N25, default reaches, scoped bans, conditions, copy tells |
| `references/powerpoint-tests.md` | Slide tests, structural bans, fade-only and front-loaded sections, zoom floor, repetition limits |
| `references/motion-density.md` | Dead air, holds and end holds by film type; calibrated numbers |
| `references/anti-sameness-gates.md` | Blue-purple gate, template distance, fingerprint check and write, fresh-eyes tests |
| `references/captions-and-sync.md` | Captions match the script, picture on the word, A/V sync |
| `references/audio-gates.md` | Loudness and audio checks on the exported file |
| `references/delivery-checks.md` | Render approval, file spec, safe zones, assets and claims, release gates, versions, the compliance gate (section 7) |
| `references/clarity-gate.md` | The takeaway at 02; preparing a cold-viewer packet and dispatching the viewer (end of 04 and 05, 06, 09); the approver's match; the grounding rule; a failed read |
| `references/identity-tests.md` | The brand test and competitor swap: the blind description at 02, masked frames at 04 and 05 (with clarity read 1) and at 09 (with read 3), the pass rule, no paper patches |
| `references/studio-benchmark.md` | Gate step A at 05: the style frames beside 2 or 3 real reference ads, the craft gap by axis, telling the user about a capped gap |
| `references/critic-loop.md` | Roles (stage critic, cold viewer and approver included), packet, round types, severity and scores, fix evidence, round limits, notes from people |
| `references/critic-prompts.md` | Ready critic prompts with slots (stage artifact, component, full film, verification, cold viewer, storyboard, jury, remake, entertainment) |
| `references/climax-duel.md` | Comparing the climax with a reference or a previous version |
| `references/delivery-report.md` | Writing `ice/review/NOTE.md`, the after-delivery steps, the case study export and run log (section 4) |

## Outputs in `ice/review/`

`clarity/` (cold-viewer packets and reports), `storyboard-review.md`, `slop-scan.md`, `template-distance.md`, `look/` (sheet, cuts, stills, gates.json), `film-gate.json`, `motion/`, `seams.txt`, critic reports per round (`critic-<round>.md`), `fixes.json` with before and after crops, `ENTERTAINMENT-REVIEW.md` when run, `compliance.md`, and `NOTE.md`. The case study and the run log share file `run-log.html` go to `ice/case-study/`.
