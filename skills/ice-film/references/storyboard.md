# Storyboard and shot plan

Turns the structure and script into beats a builder can execute and a critic can check. Stage 04 writes `ice/plan/storyboard.md`, the rough board and `ice/plan/shot-plan.md` without the look; stage 05 adds the mood board and the style frames; stage 06 merges both into the stills board (section 7).

## Contents

1. Lock lines
2. The beat table
3. Object and action columns
4. Carry and handoff contract
5. Video direction block
6. Shot plan (shot contracts)
7. Rough board, mood board, style frames, stills board and animatic
8. Storyboard checks

## 1. Lock lines

Above the table, the lock lines the `ice-qa` linter reads, named exactly `Style:`, `Palette:` (hex values) and `Characters:` (none, hands only, or a named character sheet), plus optional `Allow blue-purple:` and `Style exception:` lines: the `ice-qa` skill, `references/storyboard-lint.md` section 1. At 04 the look is not decided yet: write `Style: set at 05` and `Palette: set at 05`; stage 06 replaces them with the 05 decisions and runs the lint again. Film-side rule for `Style:`: one style per film, at most one supporting style; more than two styles in a short film reads as a template sampler. Also write length, aspect ratios, fps and the clock mode (`cue-sheet.md`).

## 2. The beat table

One row per beat. Write the linter's columns first, in this order: `Time | Object | Action | Camera | On-screen text | Trigger | Reason | Method | Tags` (the `ice-qa` skill, `references/storyboard-lint.md` section 1). `Time` is start and end in seconds (or beats on a music grid); `Camera` names the shot size and its reason, or "locked". `Trigger` quotes the script sentence or word (with its time) that justifies every element of the row, `Reason` says what each element means, who it is on and why its colour and shape; an element with neither is cut before 05 (the `ice-qa` skill, `references/storyboard-lint.md` section 3b, which also covers elements carried over from a reference). Then add these film columns (the linter ignores columns it does not know):

| Column | Contents |
|---|---|
| Role | short beat name; role from `structure.md` |
| Buys | the belief this beat buys, without "and" |
| VO or copy | the cue-segmented line from `script.md` |
| Moves and still | the one focus and what holds |
| Importance | 1, 2 or 3 |
| Entry and exit | how it starts and how it ends |
| Carrier | what survives into the next beat and what it does |
| Sound | the cue that marks it (word, beat, transient, or silence) |
| Assets | ids from the truth sheet or asset list only |
| Text covered | one line: what the frame shows if all text is hidden |

## 3. Object and action columns

- Object: a noun the viewer can point at; never title, bullet, text, list, label, subtitle, card, background, picture or icon, and never an empty shot, flat colour, black or gradient.
- Action: a verb that object performs; never appear, display, show, fade in or appear one by one.
- Tags: optional labels, at most 3 per row (the storyboard lint warns above that); `CTA block` marks the end-card rows of an industry spot or event invite.
- One example carries the whole film; the opening 3 s is a concrete small scene; the ending lands on an action of the hero or the main object. (Short form of the `ice-ideas` skill, `references/storyboards-and-animatics.md` section 4, which also holds the extra columns for story-led films and music videos.)
- Every extended graphic beat has an action with an outcome (for illustration only: a key seats and a project starts; criteria turn into checks); no settle-and-freeze title cards.
- Scenes must not be animated website sections: the web-section test, the `ice-motion` skill, `references/anti-slideshow-and-density.md` section 2.
- Grounding: every symbolic device shows its literal anchor first or with it (the `Literal anchors` line of the takeaway in `ice/plan/concepts.md` names the beat); every sound, action and claim has a visible source in its row's Object column; product interactions happen as they really happen. The one rule: the `ice-qa` skill, `references/clarity-gate.md` section 6.

## 4. Carry and handoff contract

- Name the carried element for every seam. Continuity devices ranked by strength and the kinds of carry: the `ice-motion` skill, `references/seams-and-carry.md` section 2. One root protagonist where the concept allows: section 6 of the same file.
- Every hard cut records its narrative reason, the measured cue it lands on (or a non-musical reason) and the surviving continuity channel.
- Handoff fields for parallel builds, written on both sides of the seam as `handoff_out` and `handoff_in`, and the matched-anchor tolerances: the `ice-motion` skill, `references/seams-and-carry.md` sections 4-5.

## 5. Video direction block

Written once at the top of the storyboard, then only deltas per beat: palette system (roles, accent budget; written at 06 from the 05 decisions), motion grammar and reveal model (what is revealed when), rhythm and held-frame allocation, the world per act (ground, light, depth, texture, sound), and the negative list (the slideshow and screensaver failure modes, the type's banned items). Restraint means one focal point inside a built world, not an empty world: write the type's richness floor numbers into this block (from `film-types/<type>.md`, "Richness floor") so every beat is staged against them.

## 6. Shot plan (shot contracts)

`ice/plan/shot-plan.md`, one contract per shot or frame file:

| Field | Contents |
|---|---|
| id and file | shot id and the composition file it lives in |
| frames or time range | absolute |
| claim and evidence | the truth-sheet id and the visible proof |
| start state | what is on screen at the first frame (frame 0 of the film is a finished composition, never empty or black) |
| decisive state | the frame that proves the beat (the screenshot frame) |
| handoff state | what leaves and in what state |
| focal owner | one per frame span; secondary motion visibly subordinate |
| motion verb and blueprint | the verb, and the ice-motion blueprint id if the beat uses a script shape |
| camera window | from, apex, dwell end, to, target, reason; locked outside the window |
| layer manifest | background, scene object, UI, effects, foreground copy, transition object, CTA, with explicit order; name the foreground, subject and background layers (`depth_layers`) |
| alive | what moves inside the shot from its first to its last frame besides the camera: the main action plus the secondary life (for illustration only: steam, a playing screen, a reflection, a ticking counter); a reading hold or true still is written as `declared hold <a-b s>` |
| richness | `hero_share` (or `hero_width`) and `frame_fill` estimated at the decisive state, against the type's "Richness floor" table; a shot below the floor is re-staged here, not in the build (`ice-motion/references/composition-and-staging.md` section 7) |
| cues | references into `ice/plan/cue-sheet.json` |
| assets | ids with provenance |
| QA checks | which stills and which gates prove it |

## 7. Rough board, mood board, style frames, stills board and animatic

| Board | Stage | What it is | File |
|---|---|---|---|
| Rough board | 04 | one blocking frame per shot in neutral grey: composition, hero size, depth layers, real copy and its reading time; no palette, type style or textures. It proves the staging, not the look | `ice/plan/rough-board.png` |
| Mood board | 05, next to the style frames | 6 to 12 tiles from the dated RQ-refs research and the brand's real material, each captioned with its source and the one thing it shows (palette, light, texture, type, motion idea). It aligns the look before the frames are built; it is not a style frame, not a template, and no tile is copied into the film | `ice/plan/mood-board/mood-board.png` plus its source list in `ice/plan/mood-board/sources.md` |
| Style frames | 05 | full-resolution frames with real copy, real fonts and the brand's real material (hook, mechanism, densest information, proof, CTA): 3 to 5, or 2 to 4 for a micro film. This row is the one rule for the count; every other file points here | `ice/plan/style-frames/frame-<n>.png` |
| Stills board | 06 | every shot built in its settled pose with the look (final layout, real assets, real text); one settled still per shot (about one second before its end), tiled with time, voiceover, text and motion note under each | `ice/plan/stills-board.png` |
| Animatic | 06, long films and any film with final music | the timed board or rough motion with the final audio: the `ice-ideas` skill, `references/storyboards-and-animatics.md` section 6 | `ice/renders/animatic.mp4` |

When 04 and 05 are both drawn, the rough board and the style frames become the packet of clarity read 1, stripped of every planning label (the `ice-qa` skill, `references/clarity-gate.md` section 3); the stills board or the animatic of 06 is the packet of read 2.

Checks on the style frames at 05, each the earliest run of a check 09 confirms (`docs/maintainers/architecture.md` 2b, "Earliest stage"):
- the brand test and competitor swap on masked copies of the strip and the frames (the `ice-qa` skill, `references/identity-tests.md`);
- the studio benchmark: the frames side by side with 2 or 3 real reference ads from the run's research, scored on named craft axes, a capped gap told to the user before 06 (the `ice-qa` skill, `references/studio-benchmark.md`);
- the slop scan and the fresh-eyes tests on the frames (the `ice-qa` skill, `references/slop-scan.md` and `references/anti-sameness-gates.md` section 4);
- readable at phone size and inside the platform's safe zone: every line of copy at the delivery size, with the safe zone overlay of the target platform (the `ice-qa` skill, `references/delivery-checks.md` section 3);
- the richness floor read by eye on each frame (hero share, frame fill, depth layers, surface detail) against the film type's table;
- the art check on every style frame drawn in code, before the look critic sees it: hero objects carry `data-art-hero`, the frame's page or SVG runs through `node <ice-qa>/scripts/art-check.mjs` (the `ice-qa` skill, `references/pre-render-lint.md` section 4b), and the output goes into the studio benchmark packet as `art-check.txt`. Objects are drawn to the `ice-styles` skill's `references/code-illustration-craft.md`; a fail is cleared only by redrawn art, re-checked. At 07 the same check runs on the build page as the confirmation.

Show one board per review, not a pile of images. Board rules, including never presenting AI-painted frames as the storyboard: the `ice-qa` skill, `references/storyboard-lint.md` section 4. When the brief says "storyboard only" or "ideas only", stop after the board and hand off (ice-ideas owns that deliverable).

## 8. Storyboard checks

- Run the linter and the plan checks (buys, beat lengths, CTA share, seams, importance budget, strongest frame, picture audit, another brand's film, chronology, distinct jobs, CTA on mute): the `ice-qa` skill, `references/storyboard-lint.md` sections 2-3. Adjacent beats as silhouettes: the `ice-qa` skill, `references/powerpoint-tests.md`.
- Film-side: lengths per role stay within the film type's rhythm ranges (`film-types/<type>.md`).
- Every element has a trigger and a reason (linter check 17; with a reference, the carried-over reasons are read against the reference's `REASONS.md`): the `ice-qa` skill, `references/storyboard-lint.md` section 3b.
- The storyboard critic is separate from the writer (`../roles/reviewer.md`).

Sources: AbubakrChan/product-launch-motion, heygen-com/hyperframes (visual design, handoffs), Tejashmakwana/motionmaxxing, commercial-motion-design (Omar-Tnzxo), video-production-studio (Omar-Tnzxo), huashu-art-motion, echris6/motion-video-kit, nateherkai/herk-edit-kit, lemomo-ai/lemo-opuscar.
