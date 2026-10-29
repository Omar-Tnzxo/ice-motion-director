# Studio benchmark at 05

Counts and gates prove the style frames clear a floor; they do not show how far the look sits from what a real studio ships in the same category. This check puts the style frames side by side with real reference ads from the run's own research, before anything is built, and tells the user plainly when the run's constraints cap the craft. This file is its one home; every other file points here. Founder decision, 2026-10-22 (the first gallery run judged its look by counts only, and the craft gap showed only after the build).

## Contents

1. When it runs
2. The references
3. The packet
4. The benchmark critic
5. The gap and what follows
6. Telling the user
7. Logging

## 1. When it runs

At 05, after the style frames are drawn and the look critic has passed them, before clarity read 1 closes the stage and before 06. It runs again whenever the look changes.

| Route or size | Runs |
|---|---|
| `ice-film`, `ice-explainer`, standard and long | Always |
| `ice-remake` | Always, with the user's reference as one of the references (the remake's ruler) |
| Micro jobs | One reference, the same axes |
| `ice-ideas` | Only when it draws style frames |
| `ice-edit` | At 05, on two graded stills of the footage with the planned overlays and captions, in place of style frames; the references are real edits of the same edit type |
| `ice-lottie` | Not run (the product UI sets the look) |

## 2. The references

Two or three real ads, never invented, taken from the run's own dated research: research note RQ-refs, else RQ-ads or RQ-category (the ice-direction skill, `references/research.md`). When none of those notes holds a fitting work, run RQ-refs now by that file's rules (queries from brief slots and the runtime date only) and record it.

Each reference must be:
- the same category as the brief, or the same film or edit type;
- current: released in the last 24 months before the runtime date, unless the brief asks for a period look;
- the best craft found: an award, a shortlist, a studio or agency case study, or the work research ranks highest; never the first result;
- viewable from an official source (the brand's or the studio's own channel or case study page), with its title, maker, date and URL recorded.

At most one reference may be the brand's own earlier work. Reference stills are review material only: they stay in `ice/review/benchmark/refs/`, are never placed in the film, and never enter the mood board as a tile to copy (`ice-film/references/storyboard.md` section 7).

## 3. The packet

The director copies into `ice/review/benchmark/packet/`:
- the current style frames, `frame-01.png` onward, in film order (for an edit: the two graded stills with their overlays);
- 2 to 4 stills per reference, `ref-<a|b|c>-01.png` onward, taken at its hook, its densest frame and its hero moment;
- `refs.txt`: one line per reference (title, maker, date, URL);
- `art-check.txt`: the art check output on the style frames drawn in code (`pre-render-lint.md` section 4b), or `n/a` with the reason;
- `constraints.txt`: the run's constraints in plain words, one per line: the engine, whether AI images or video are allowed (the ice-assets skill, `references/ai-media-policy.md`), the assets on hand (official files, captured screens, footage, illustrations), the budget of time the size allows.

No brief, concept, script or decision log goes in the packet.

## 4. The benchmark critic

A fresh, read-only critic that did not make the frames, with the prompt "Benchmark critic" in `critic-prompts.md`. It scores the style frames and the best reference on each axis, 1 to 10 on the scale of `ice-direction/references/roles.md` section 3 (5 student work, 6 template level, 7 solid professional, 8 high-end agency, 9 award shortlist, 10 best in the world).

| Axis | What is compared |
|---|---|
| Character design | Characters, or the hero object or product when there is no character: construction, appeal, specificity, pose |
| Lighting | Light direction, contrast, light events, how light models form |
| Depth | Layers, scale change, parallax room, atmosphere |
| Texture | Surface detail, grain, material, print or photographic finish |
| Composition | Hero size and placement, frame fill, balance, the eye path |
| Motion promise | What the frames promise about movement: poses mid-action, overlap, smear or blur, elements staged to move |

The craft axes (character design, lighting, texture) use the art check numbers of the same style frames (`pre-render-lint.md` section 4b, `scripts/art-check.mjs`): the packet carries its output as `art-check.txt`, and a hero object that fails the art check scores the frames at 5 or less on the axis that measure belongs to (tones and shading: lighting; shapes: character design; texture: texture). A gap on those axes names the failing measure.

For each axis: both scores, the gap (reference minus frames), one sentence on what the reference does that the frames do not, and one verdict: **closable** (name the change and the stage that makes it) or **capped by** a named line of `constraints.txt`. An axis that does not apply (no character and no hero object) is marked `n/a` with a reason.

Report: `ice/review/benchmark/r<round>.md`, under 400 words, then one line `seen vs measured`.

## 5. The gap and what follows

| Gap | Rule | Next |
|---|---|---|
| Small | No axis gap above 2 and the mean gap under 2 | Logged; 05 goes on |
| Large, closable | Any axis gap of 3 or more, or a mean gap of 2 or more, and every such axis is closable | Back to the direction round at 05 for those axes; new frames; a fresh critic scores them again. A plan to close it at the build does not count (`identity-tests.md` section 6, rule 3, holds here too) |
| Large, capped | A large gap on any axis the critic marked capped by a constraint | The user is told at 05, before 06 (section 6) |

## 6. Telling the user

One plain message, no jargon, at the end of 05: what the best reference does better in one sentence per capped axis, the constraint that caps it, and one question in the shape of the stage 01 questions (the ice-direction skill, `references/questions.md` section 2), with four options, the recommended one first:

- **Accept**: keep this look; the film is built at its best inside the current limits.
- **Change the look**: move to a style the current limits can reach at full craft, chosen in the direction round.
- **Lift a limit**: name the constraint to lift (supply files or footage, a different engine, or AI images or video, which the user chooses and which are disclosed in the delivery note).
- **Other**: the user's own words.

The recommended option is the one the critic's report supports: change the look when another style closes the capped axes, otherwise accept. Lifting a limit is never the default and never chosen for the user; AI images or video only on the user's own answer (the ice-assets skill, `references/ai-media-policy.md`).

Step mode: the message is the first item on the 05 review card. Auto mode: the message rides with the router's preview approval, stop B in the router's stops table (`ice-motion-director/SKILL.md` section 5, "Stops"), which is then taken on the style frames at 05; otherwise, and when the user does not answer or said not to ask, the recommended option is taken, logged, and named in the heads-up and the delivery note.

## 7. Logging

- D-entry `Studio benchmark`: the references with URLs and dates, the score table, the gap, the verdict per axis, the user's answer quoted or the default taken.
- `Gates:` line of the `ice/DIRECTION.md` summary: `benchmark max gap <n>, mean <n>, <small / closed r<round> / capped: told user / capped: default>`.
- The delivery report names the capped axes in plain words, so the user knows what limited the craft.

Sources: Ice founder decision, 2026-10-22; the reference-as-ruler scoring of edenfunf/reelmimic (MIT) and the climax comparison in `climax-duel.md`; the benchmark question RQ-refs of the ice-direction skill.
