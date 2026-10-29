# Remake production crew

Read this when the approved plan moves into production with several agents. The crew catches defects where they are made: characters before shots, every shot as soon as it is built, the climax before delivery. Generic gates, the critic loop mechanics and the delivery report belong to the ice-qa skill; this file holds the remake-specific roles and the reference-relative checks.

## 1. Roles

| Role | Count | Session | Writes | Never |
|---|---|---|---|---|
| Director | 1 | one session for the whole film | notes files, plan, shared setup, assembly, revisions | grades its own climax |
| Character designer | 1 per character | fresh | one definition file per character, a character sheet | draws inside shot files |
| Builder | up to 6 | kept across its fix rounds (it remembers the details) | only its own shot files, a done note per chunk | edits shared files |
| Shot reviewer | 1 per finished chunk | always fresh | review notes for that chunk | builds |
| Final critic | 1 | always fresh, read-only | critique and the duel verdicts | edits anything |

Reviewers are fresh because they built nothing and have nothing to defend. Builders keep their session so fixes stay consistent.

## 2. Setup before builders start (director)

- One file per shot; a master that references every shot up front so builders touch only their own file.
- Chunks of 1-4 shots, about as many chunks as builders; keep continuous actions and shots with many cross-seam handoffs in one chunk.
- Lock shared specs now, because they are what final critics reject most: caption layer, end treatment (never a hard cut to full black in the last frames; fade at least 0.4 s with captions fading too; a measured no-fade end card overrides the end fade: when the reference ends on a still end card held to its last frame with no fade, the film does the same, as measured, with its build and hold from `TIMELINE.md`), finishing layer (texture, vignette, one grade per color-arc section; keep the reference's paper texture or hand-drawn boil if it has one, it is texture, not noise), hero-shot effects, climax sound, mix. Specific numbers for captions, mix and grade: the ice-type, ice-audio and ice-motion skills.
- Character gate before shots: a sheet per character (front, 3/4, side, 8 or more expressions, the 6 or more poses this film uses) reviewed at full resolution by a fresh reviewer, fixed until it passes, then a line-up of all characters together. Building shots during the character gate is off by default: on real runs, character files changed under the builders and every chunk needed an extra round.
- A design image the user owns is the specification: measure its proportions and lock them as constants; accessories bind to the right body anchors; compare every pose against it.

## 3. Builder rules

- Before starting, open the already-passed shots and match line width, palette, character size, caption style and pacing, so the film looks made by one person.
- Each hero shot is compared with the reference peak (`clip_strip.py --vs`); a weaker hit (small subject, empty frame, no hold, covered by a flash, no anticipation or impact) is a blocker.
- Render and check a shot as soon as it is done (start, middle and end stills, a 12 fps strip of every action, full-resolution crops), then write the done note at once so a reviewer starts.
- Shared problems are reported, not fixed in place. Shared-file fixes during parallel production are additive or backward-compatible only (add a new hand shape, never change an existing one) and announce how builders call the new feature.
- Preview only the frames needed; no repeated full renders while others render.

## 4. Review protocol

- Severity: blocker = a defect a viewer notices at normal speed and size; polish = visible only zoomed in or on angles the film does not use. A review passes when it lists no blocker; polish is handed on and never holds the line.
- Every issue states shot, time or frame, what is seen, and how to fix it. No impossible requests.
- Before and after proof for every claimed fix: the `ice-qa` skill, `references/critic-loop.md` section 5.
- From round 2, new findings fail a round only if they are blockers; no magnifier hunts each round.
- Items only the user can supply (lyrics text, own design images, a logo) are `needs_user`: not defects, they never trigger fixes. Step mode: they go on the stage's review card. Auto mode: decide (a labelled placeholder, or a neutral original in its place), log it in `ice/DIRECTION.md`, report it in the delivery note, and keep building.
- Round limits for character, chunk and final reviews, and the converging-list rule: the `ice-qa` skill, `references/critic-loop.md` section 6.

## 5. Reference checks the remake adds

| When | Check | Tool |
|---|---|---|
| Each finished chunk | Mapped camera kind and pace per shot | `compare.py` (re-measures with the same functions as the reference) |
| Each hero shot | Peak strip against the reference peak | `clip_strip.py --vs` |
| Plan and first render | Stats contract within 30 percent | `shot-mapping.md` section 4 |
| First render | Fidelity self-check | `fidelity-contract.md` section 6 |
| Plan, then every render | Pacing against the reference (blocking) | `ice-qa/references/motion-density.md`, "Pacing against the reference", with `analysis/events.json` (`measuring.md` section 10) |
| Style frames, then build frames | Fixed marks in their measured slots | `ice-qa/references/identity-tests.md`, "Fixed identity marks" |
| Storyboard, then first render | Depth and camera against the reference (blocking) | `ice-qa/references/motion-density.md`, "Depth and camera against the reference", with `analysis/depth.json` (`measuring.md` section 12) |
| Before delivery | Climax duel and reference-relative scores | `climax-duel.md` sections 4 and 6 |

After each chunk and after assembly:

```
python <skill>/scripts/compare.py --analysis <ice>/reference/<ref-id>/analysis --plan <ice>/plan/shots.json --video <render.mp4> --out <ice>/review/remake/compare
python <skill>/scripts/clip_strip.py <render.mp4> --range <a>:<b> --vs <ice>/reference/<ref-id>/analysis/proxy.mp4 --vs-range <c>:<d> --out <ice>/review/remake/<name>.jpg
```

## 6. Efficiency (measured on real runs)

About 60 percent of agent time went to screenshots and to waiting on background jobs. So: plan the time points first and capture them in one call; fix a batch, then capture once; run long renders in the foreground with a timeout and split any render that may exceed about 9 minutes; never background a job and guess; keep concurrent browser captures low (at most 4 reviews per project at once; 6 builders measured on a 12-core, 32 GB machine); kill only processes you started.

## 7. User feedback after delivery

Time-stamped notes ("second N looks odd") change only the affected shots; re-render only that range from the cache and re-encode. A change that drops part of the reference's core (the climax, a two-character story) is named before doing it: on the review card in step mode; in auto mode the user's newest explicit note wins, and the loss is logged in `ice/DIRECTION.md` and reported in the delivery note.
