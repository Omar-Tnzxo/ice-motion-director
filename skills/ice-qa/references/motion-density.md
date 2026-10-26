# Motion density, dead air and holds

How much the picture moves, where it stops, and when a stop is a defect. Sources disagree on purpose, so every threshold below is scoped by film type (type names from the architecture: product launch, app ad, brand film, logo sting, kinetic type, data story, social short, hype promo, UI walkthrough, music video, art film, industry spot; explainer; edit types long-form, podcast, talking-head ad, shorts and reels, B-roll overlay, showreel). Motion grammar and how to fix a hold are owned by the ice-motion skill. Sources: motionmaxxing (Apache), huashu-art-motion (MIT), motion-video-kit (MIT), anidoodle, reelmimic (MIT), herk-edit-kit (MIT), claude-code-video-toolkit (MIT), explainroo, hyperframes and hyperframes-community-skills (Apache), claude-motion-design (MIT), claude-remotion-skill (MIT), founder skills; PolyForm explainer sources (ideas rewritten).

## Contents
1. Tools and what they measure
2. Rules that hold for every type
3. Dead-air thresholds by type
4. End hold and CTA hold by type (gate G3)
5. Calibrated numbers and their limits
6. Scoped gate values read by the scripts (film type table)

## 1. Tools and what they measure

| Tool | Measures | Output |
|---|---|---|
| `look.py` | Mean frame-to-frame luma change on a 96x54 frame; still stretches >= 0.6 s; end hold against the film type's limit (section 6); local motion inside the end hold; G2 flat runs | Motion note (a question, not a gate), `still.txt` |
| `film_gate.py` | Fast in-shot motion share (12 fps, 320 px grey, subtitle band masked, transitions excluded); blank mid-section runs; blue-purple share; the richness floor of the film type (`hero_share`, `frame_fill`, `empty_half`, `in_shot_motion`, `longest_still`; section 6); report metrics (event density, longest still, dead background, page frame, slow zoom, push-ins per minute, crossfade share) | Red exits 2 |
| `motion_check.py` | Freezes >= 1.0 s where no region of the frame moves (the most-changed cell of a 16-column grid stays under 1/255), black and white frames, hard cut to black at the end; declared holds from the events file are reported apart | `motion.json` plus strips |
| `lint.mjs` | On the HTML composition: `depth_layers` (an unmarked page fails when the type has that floor) and the DOM hero share when the page marks it (section 6) | Richness line next to gate G5 |
| `frozen-time.mjs` | 10 fps grey difference, samples under YAVG 0.35 | Near-frozen seconds |
| HyperFrames `check` and animation map | `keepsMoving` (2 s default), `sweep_static` (3 s), dead zones | Findings |

## 2. Rules that hold for every type

- Still-type metrics (still share, longest still, longest gap without an event) are never gates on their own: they flag good "hold, burst, hold" films. Use them to decide where to look (huashu).
- Never add floating, drifting, breathing or idle loops to a static object just to pass a motion metric; if there is no verb action, let it be still, or add story, or move the camera with intent. A slow uniform push lowers the static number but still reads as a slideshow; the right fix for a static opening is an earlier first event (huashu, hyperframes motion doctrine, PolyForm ideas).
- A creeping camera changes every pixel and satisfies the tool while the eye sees a still: check by eye too (anidoodle).
- A frozen final second (bit-identical consecutive frames) is the cheap-motion tell you can test for (hyperframes docs).
- Distinguish true stillness from tiny motion: at full resolution, under about 800 changed pixels is true stillness (add a verb action); 800-2500 is tiny motion (enlarge the motion, do not add elements) (PolyForm ideas, rewritten).
- Small thin-line motifs barely register in small frame-difference analyses; visible motion needs locally large moving areas (huashu).
- Skip the first 0.35 s after a transition when measuring in-shot motion (a punch zoom makes the whole frame move) (huashu).
- Grain can cause false motion positives; dark grounds can make a rest metric over-read small detail; a narrated film is never quiet, so an "audio quiet" leg fails structurally (founder skills, PolyForm ideas).
- Motion density compared against a reference: median and p90 frame difference at the same sample rate, plus a count of low-change intervals (founder skills; climax and reference work in `climax-duel.md`).
- 0.5-8% motion area mostly looks good; more than 40% static frame pairs reads as stuck, except in explainer, story and text grammars where holds are correct (huashu qa).
- The motion note band (mean luma change 0-255) is a question, never a gate; band and questions: the `ice-motion` skill, `references/anti-slideshow-and-density.md` section 4 (Human motion band).

## 3. Dead-air thresholds by type

| Film or edit type | Freeze and dead-air limit | Holds that are allowed | Sources |
|---|---|---|---|
| Energetic product launch, industry spot, business commercial | Measured frozen time per 30 s and longest hold against the Frozen screen row: the `ice-motion` skill, `references/anti-slideshow-and-density.md` section 4. | Breath and payoff holds: the `ice-motion` skill, `references/holds-and-stillness.md` section 2. | motion-video-kit, motionmaxxing |
| App ad, UI walkthrough, hype promo | No frozen-time limit of their own: report frozen time; judge still runs with `frame-checks.md` B1 under the type's hold policy (the `ice-motion` skill, `references/holds-and-stillness.md` section 1) | Same as the row above | motion-video-kit, motionmaxxing |
| Narrated explainer, data story | Measured new-element interval and largest gap between authored events against the owner rows (Something new, Event density per beat): the `ice-motion` skill, `references/anti-slideshow-and-density.md` sections 3 and 4. A hint when no new element appears for more than 6 s | Holds are correct in explainer, story and text grammars; read time after a complete list counts from the last item finishing; hold >= 0.5 s after numbers settle | anidoodle, vox-explainer, explainroo, huashu |
| Explainer and art films, 1-2 min, gate run | `film_gate.py`: fast-motion share < 0.035 red, < 0.06 yellow; blank run >= 0.3 s red | | huashu |
| Social short, shorts and reels, talking-head ad | Visual-event gap over 2.2 s fails unless the scene declares a hold reason; first-three-seconds gate | | herk-edit-kit |
| Brand film (calm), art film, storytime | Report only; holds and stillness are design choices; designed silence for reactions >= 0.8 s with the camera held | Stillness before the climax 0.3-0.75 s; a calm film may end still | hyperframes motion doctrine, huashu storytime, motionmaxxing |
| Painted, crayon and line-art films | Idle life or line boil is the medium's motion and counts; reseeded full-screen strokes are flicker, not life | | reelmimic engines, huashu |
| Drawing and process films | Dead air over 1 s at a 0.02% change floor; a hand may rest half a second between passes | | anidoodle |
| Kinetic type, music video | Cuts on the beat grid; holds only after a payoff | | motionmaxxing, ice-audio skill |
| Long-form, podcast | A scene running 3.0 s longer than its narration is dead air; scenes over 40 s of narration get a split hint; frame-difference gates do not apply to a talking speaker | | claude-code-video-toolkit, explainroo |
| Performance shots with characters | Completely still for over 1 s is a blocker | | reelmimic |
| Any scene of 3 s or more (HyperFrames) | No visible change fails `sweep_static`; `keepsMoving` default 2 s | Mark intended stills | hyperframes |

Conflict scoped: "every 100 ms has an animating element" and "no dead air over 1 s" (herk legacy short-form rules) hold for shorts and reels only; "holds exist: at least 3 moments of stillness" (claude-remotion-skill) holds for product and brand films with music; "elements hold dead still after landing; life in holds comes only from the camera" (PolyForm ideas) holds for explainers built on a moving camera; "I'd rather have no motion than bad motion; no lazy breathing, no slow pan in the back half" (hyperframes product-launch-video, founder skills) holds for product launch and UI walkthrough. Variety: something new every 2-4 s in launch and social films (claude-motion-design, founder skills).

## 4. End hold and CTA hold by type (gate G3)

| Type | Resolved end hold | CTA share and readability | Sources |
|---|---|---|---|
| Product launch, app ad, hype promo, social short; logo sting uses the same limit | Resolved end-hold range and CTA share: the `ice-motion` skill, `references/holds-and-stillness.md` section 3. Under the range is a note (ends mid-motion); slow contraction does not make a 4-5 s hold acceptable | CTA share: same owner section | motionmaxxing |
| Direct-response ad, talking-head ad, industry spot whose CTA carries an action, URL or offer | Long enough to act: the CTA hold covers its reading time (the `ice-type` skill, `references/reading-time.md` section 1): at least about 1.5 s readable at phone size, at least 3 s in launch-video recipes | | motion-video-kit, charlie947 |
| Explainer, talking-head edit, long-form | Final-frame holds: the `ice-motion` skill, `references/holds-and-stillness.md` section 3 (scoped exceptions) | | hyperframes, motionmaxxing |
| Showreel | The outro holds 4 s or more | | herk-edit-kit motion showreel |
| Calm brand film, art film | Calm ending allowed: the `ice-motion` skill, `references/holds-and-stillness.md` section 3 | | motionmaxxing |
| Loops, Lottie, UI motion | No end hold; the loop seam is the gate (`frame-checks.md` section 9) | | charlie947 |

`look.py` reads the film type itself (`--type`, else `ice/state.json` `subtype`, else the `film_type` row of `ice/BRIEF.md`) and takes the limit from section 6; it prints the limit and where it came from. `--hold-warn <limit>` overrides it (`0` turns the end-hold check off for loops). When the end card carries the facts a viewer needs to act (the storyboard tags its rows `CTA block`, or the cue sheet declares the CTA start as its own event), the limit becomes the reading time of the CTA block text (the `ice-type` skill, `references/reading-time.md` section 1, display text with no voice: letters / 15 + 1.5 s), and `look.py` prints the reading time it used.

The CTA share is measured from the CTA start when one is declared, else from the last cut. Declare it as an event in `ice/plan/cue-sheet.json` whose `kind` is `cta` (the `ice-film` skill, `references/film-types/industry-spot.md`), or in the events file as `{"type": "show", "t": <seconds>, "label": "cta"}` (the renderer's `window.__events`, or `<film>.events.json` next to the render). A film that reaches its CTA with a push-in or a morph instead of a cut needs this, or the whole last shot counts as the CTA. Intended holds (a finished first frame held 0.7 s, a rest the motion plan declares) go in the `quiet` list of the cue sheet (start, end, reason; the `ice-audio` skill, `references/cue-map-and-beat-sync.md` section 2) or in the events file as `{"type": "hold", "t": <start>, "end": <end>}`; `motion_check.py` reports them apart from freezes, and `film_gate.py` leaves them out of `in_shot_motion`, `longest_still` and `empty_half`.

## 5. Calibrated numbers and their limits

- `film_gate.py` fast-motion gate: calibrated on 13 author-judged 1-2 min films (approved minimum 0.068, rejected maximum 0.021); read it as "no counterexample in these 13". Clips under 20 s are downgraded to yellow except the factual gates; run it on the assembled film. Push-in counting is a lower bound (live footage camera moves are not estimable); a slow 20% push over about 1 s scores like a 0.28 s fast push, so never speed moves up to pass (huashu).
- Push-ins: `film_gate.py` reports push-ins per minute; yellow at the warning rate in the owner's density limits: the `ice-motion` skill, `references/camera.md` section 7. Same move in every shot: the `ice-motion` skill, `references/holds-and-stillness.md` section 2.
- Measured progress example: frozen time went from about 10 s of 36 s to 0.7 s of 28.6 s over four critic rounds; none of the builder's own checks had flagged the first (motion-video-kit).
- A 7-window "wow" gate for short ads: split a 20 s film into 7 windows of about 2.9 s; each must be a YES; PARTIAL fails (motion-video-kit case study).
- Minimum visual beat: the `ice-motion` skill, `references/holds-and-stillness.md` section 2.

## 6. Scoped gate values read by the scripts (film type table)

`storyboard_lint.py`, `look.py`, `film_gate.py` and `lint.mjs` parse the table below to find the film type's row; keep its header and the type names exactly as written. Each script takes the film type from `--type`, else `subtype` in `ice/state.json`, else the `film_type` row of `ice/BRIEF.md` (both found by walking up from the input file), and uses the row whose name appears first in that text (`industry spot (real estate), borrowing the event-invite job from social short` uses `industry spot`). No type found: the scripts say so and use the `default` row. They always print the type and the row they used.

This table holds only ice-qa's own scoped values: the end-hold limit of gate G3 (owner of the numbers: the `ice-motion` skill, `references/holds-and-stillness.md` section 3, and section 4 above) and the CTA block text allowance of storyboard lint check 3 (`storyboard-lint.md` section 2; the exception itself: the `ice-film` skill, `references/film-types/industry-spot.md`, Text density).

Cell values: a number is a ceiling in seconds or units; `-` means not gated for that type (the number is still reported); `reading` means the reading time of the end-card text (letters / 15 + 1.5 s, CJK characters / 4.5 + 1.5 s; the `ice-type` skill, `references/reading-time.md` sections 1 and 3), 3.0 s when no storyboard is found. `end_hold_cta` applies instead of `end_hold_max` when the storyboard tags its end-card rows `CTA block` or the cue sheet declares the CTA start as its own event; the text read is the CTA block rows' on-screen text. `cta_info_units` is how many units a row tagged `CTA block` may carry above the 8-unit cap (0: no exception for that type). Whatever the cell says, an end card whose text carries a URL or a legal line (a required label or disclaimer, written `[label: ...]`) holds at least its reading time (the `ice-motion` skill, `references/holds-and-stillness.md` section 3); `look.py` raises the limit and prints why. A `-` cell stays ungated.

| Type | `end_hold_max` | `end_hold_cta` | `cta_info_units` |
|---|---|---|---|
| product launch | 1.4 | reading | 8 |
| app ad | 1.4 | reading | 8 |
| industry spot | reading | reading | 8 |
| social short | 1.4 | reading | 8 |
| hype promo | 1.4 | reading | 8 |
| ui walkthrough | 1.4 | reading | 8 |
| logo sting | 1.4 | 1.4 | 0 |
| kinetic type | 1.4 | reading | 0 |
| data story | 1.5 | reading | 0 |
| music video | 1.4 | 1.4 | 0 |
| brand film | - | reading | 8 |
| art film | - | - | 0 |
| explainer | 1.5 | reading | 0 |
| talking-head ad | reading | reading | 8 |
| shorts and reels | 1.4 | reading | 8 |
| long-form / podcast / b-roll overlay | - | - | 0 |
| showreel | - | - | 0 |
| default | 1.4 | reading | 0 |

### 6.1 Richness floor: read from the owners, never copied

The measures are defined in the `ice-motion` skill, `references/composition-and-staging.md` section 7.2; the numbers per type are the "Richness floor" table of each `ice-film` type file (`references/film-types/<type>.md`); explainers use the defaults of `composition-and-staging.md` section 7.3. `film_gate.py` and `lint.mjs` read those files for the film type at run time and print each number with the file it came from. A prose cell is read clause by clause (split on `;`): a clause that names the other orientation is skipped (`16:9`, square or landscape against vertical), notes in parentheses are ignored, and when a cell gives two numbers (energetic and calm spots, feature and everyday shots) the lenient one is the red line and the strict one the yellow line. A cell with no number (for example "only the end card") is printed as "judge by eye". Edit types and an unknown film type have no richness floor; the numbers are reported only.

How `film_gate.py` measures them on the render (4 fps for areas on the whole frame, 12 fps for motion with the subtitle band masked):
- Windows: the film is split at cuts, `show` events and the CTA start, and every part longer than 4 s into 4 s windows; each window is read in its settled second half; windows under 1 s are exempt (burst frames, transitions).
- `hero_share`: the bounding box of the largest connected region of visible detail (8 px cells at 320 px wide with edge strength 14 or more, closed, filled, and opened so a thin line such as a rope or a page edge does not join the box), as a percent of the frame. The gate reads the median over windows; windows under the floor are listed.
- `frame_fill`: a 4 x 4 grid; a cell carries content when at least 10 percent of its 8 px cells have detail or sit outside the large flat ground. Median over windows; the CTA window may go 4 cells below (`composition-and-staging.md` section 7.2).
- `empty_half`: seconds in which every cell of one half (top or bottom when vertical, left or right otherwise) is empty, outside declared holds.
- `in_shot_motion`: share of in-shot frame pairs (cuts and crossfades left out, declared holds left out) where at least 3 cells of 8 px still change by 2/255 or more after the camera move is compensated, so camera-only movement does not count.
- Page flips: a cut with nothing moving in the 0.5 s on either side swaps one still page for another. `film_gate.py` reports it as `page_flips`, never as a hard cut; it is not a visual event, and a still run continues across it.
- `longest_still`: the longest run of in-shot pairs without such a change, outside declared holds. When the type's cell says the CTA hold is exempt, the CTA window is left out.
- Declared holds: the `quiet` list of `ice/plan/cue-sheet.json` and `hold` events in the events file; the CTA start: a cue-sheet event whose kind is `cta` (or whose text names the CTA) or a `show` event labelled `cta`.
- `depth_layers` and `hero_width` are read only from an HTML composition that marks them (`lint.mjs`: elements with `data-ice-layer="<name>"` (`data-layer` is also read outside HyperFrames), or `window.__layers(t)` returning the layer names drawn at time t; `data-hero` on the hero element). A page that marks none fails when the film type's floor names `depth_layers` (unmeasured is never `n/a`); a canvas film exposes `window.__layers(t)`. A type with no `depth_layers` floor prints `n/a`. `surface_detail`, `light_events` and `real_material` are judged by the critic (`critic-loop.md`), not by a script.
- Calibration (2026-10-19), measured against the owners' floors: the pilot films the founder judged sparse read red (a 16:9 launch on a book page: `hero_share` 21, `in_shot_motion` 82; a vertical app ad with a small basket on a paper field: `hero_share` 13, `frame_fill` 6 of 16, `empty_half` 0.75 s); the fuller real-estate pilot passed with one weak beat (`hero_share` 61, one window at 32); two full reference films passed (`hero_share` 76 to 80, `in_shot_motion` 98 to 100). Limits: a textured or shaded ground counts as filled for `frame_fill` (it is a surface by the owner's definition), so a sparse film on paper can pass `frame_fill` and fail `hero_share`; a thin hero such as a line drawing reads small. Treat a red as "go and fix the frame", and a reading that contradicts the stills as a script limit to report in `NOTE.md`.
