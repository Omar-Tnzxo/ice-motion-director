# Frame checks on the rendered file

How to look at a render honestly, which frames to pull, and the per-frame checklist. Always pull frames from the delivered MP4, never from the composition or preview: renders lie, the file does not. Sources: motionmaxxing (Apache), motion-video-kit (MIT), product-launch-motion (MIT), reelmimic (MIT), herk-edit-kit (MIT), huashu-art-motion (MIT), anidoodle, claude-motion-design (MIT), iart motion-skills (MIT), Barty-Bart and charlie947 (MIT), pixel2motion (MIT), hyperframes (Apache), video-use, claude-video, video-ad-editor, lemo-opuscar, founder skills; IDEAS_ONLY sources (imMamdouhaboammar, PolyForm explainer sources) rewritten.

## Contents
1. Honest seeing (do this first)
2. The look pass with `look.py`
3. Sampling plans by question
4. Gates G0-G5 and the frame review checklist
5. Motion that stills cannot show
6. Text, layout and readability
7. Characters, drawings and generated assets
8. Logic and numbers on screen
9. Loops and final frames

## 1. Honest seeing

1. Is there a film in this file? Non-blank, the picture moves, the length is the planned length, audio present when planned (G0). A 15 s black render was once certified "VERIFIED / CLEAN": read the numbers.
2. Is there one frame worth a screenshot? If you cannot point to it, the hero moment is missing.
3. Describe every sheet frame in one sentence: what is on screen, what is the hero, would it pass as a slide or a web page. A frame you cannot describe in one sentence has no hero; a sentence that starts "a card on a flat colour" is a deck frame. The sentences go in the delivery report.
4. Four looks at the same footage: thumbnail (can you read the claim at thumbnail size?), cover (the brand test and competitor swap on masked frames, `identity-tests.md`, already run at 04 and 05, confirmed here; cover the text: is there still a picture?), mid-change (frames two before every cut and mid-transition: blended half-states, a blank frame, a beat that settled before the cut?), real speed (watch once at speed: reading time, the breath before the payoff, where it drags).
5. You cannot watch video; you only see frames. Every claim about motion, sound or timing comes from a measurement or from a human, and the report says which (anidoodle, bang-motion).

## 2. The look pass

```
python scripts/look.py ice/build/final.mp4 --out ice/review/look --expect <seconds> --expect-audio [--strict]
```

Writes `sheet.jpg` (16 frames, 4 columns, timecodes), `cuts.txt`, `still.txt` (stretches >= 0.6 s unchanged), `mid.jpg` (2 frames before each cut, max 12), `strips.jpg` (cut-1 | cut | cut+1), `gates.json`. Prints G0, G2, G3, the audio audit and the motion note. `--strict` exits 3 on any FAIL. Cut detection prefers an events file (`<film>.events.json` with cut/show/hide events); it counts show/hide events as cuts, so read the final-shot share with that in mind. G3 takes its limit from the film type and a declared CTA start (`motion-density.md` sections 4 and 6) and prints which limit it used.

Companion tools: `node scripts/contact-sheet.mjs film.mp4 out.jpg [every_s] [cols] [rows] [start] [dur]` for denser sheets; `scripts/motion_check.py film.mp4 --out dir` for freezes (no region moves: the most-changed 12 px cell of a 192 px wide frame changes by under 1/255 for >= 1.0 s; declared holds from the cue sheet's `quiet` list or `hold` events are listed apart), black frames (luma < 0.04), white flashes (luma > 0.92), a hard cut to black at the end, and hard cuts (over 50% of 8x8 cells change > 0.1 and whole change > 0.1); it writes a strip per flag: open every strip. `scripts/film_gate.py` measures the richness floor of the film type on the render (`motion-density.md` section 6.1).

## 3. Sampling plans by question

| Question | Sample | Source |
|---|---|---|
| General critique | A frame every 0.5 s (contact sheet), filmstrips around the fastest and most important moves and the hero moment, full-resolution frames at 5-8 key times | mg-styles-15 |
| Full-film critic | Frames every 0.2 s on timestamped sheets plus dense 1/30 s windows around every transition | motion-video-kit |
| Component critic | A sheet every 0.1 s plus native frames at key times | motion-video-kit |
| Edit render | Every cut +-1.5 s, first 2 s, last 2 s, two or three midpoints | video-use |
| Seams | A 10-frame strip each side of every cut (catches one-frame empty panels and captions over the wrong shot) | herk-edit-kit |
| Smoothness | Contiguous frames across every transition window, never beat frames: `ffmpeg -i render.mp4 -vf "select='between(n,A,B)',scale=480:270,tile=layout=6x7" -frames:v 1 tile.png` | herk-edit-kit |
| Actions and hits | A 12 fps strip of consecutive frames over every action (take, turn, sit, jump, expression change, prop move); always 12 fps, not 24 | reelmimic |
| Phone readability | `fps=1,scale=360,tile=5x3`; read a 960x540 downscale of every major beat by eye; shrink a landscape film to 390 px wide | claude-motion-design, herk-edit-kit, PolyForm ideas |
| Opening | The first 2.5 s frame by frame and the first frame of every face shot (nothing covers the mouth) | herk-edit-kit |
| Word-exact checks | 8-15 timestamps that each fall on a spoken word, not round numbers; read every PNG | herk-edit-kit |
| Frame-by-frame gate (product journeys, final masters) | Decode every frame in order into sheets of at most 60 frames labelled with absolute frame numbers; the manifest frame count equals the composition duration; a lossless clip 24 frames either side of every scene boundary; sparse 4-8 fps sheets do not satisfy this gate | founder skills |
| Snapshot timing | Inside beats (60-70% in), never at boundaries | herk-edit-kit, product-launch-motion |
| Risk windows | Every host form switch and wipe time +-0.5 s; burst triples (three consecutive frames) on state-change anchors catch flicker that fixed windows miss | PolyForm ideas (rewritten) |

Stills are sampled where the designer expects action; defects live between samples, so the full measured audits (motion, freeze, flash) run too. An AI video model watching the render is useful for candidate problems only: it is noisy and hallucinates; verify each complaint on real frames (herk-edit-kit). Do not score talking-head quality with a similarity metric: use high-frequency energy over time plus a contact sheet by eye; when a metric and a contact sheet disagree, the sheet is right (claude-code-video-toolkit).

## 4. Gates G0-G5 and the frame review checklist

| Gate | Pass when | Computed by |
|---|---|---|
| G0 render exists | Decodes; >= 5% of frames have picture content; >= 5% of frames change; duration matches the plan +-0.15 s; audio present and not silent when planned | `look.py` |
| G1 proof readable | The one readable UI object has text >= 0.04 H and the fragment fills >= 0.55 W (or is cropped by the frame edge), lit, in a world. A ~0.3 W card with ~0.03 H text in an empty ground fails unless it is a deliberate wide establishing shot under 1 s before a push-in | by eye, with your own measurements |
| G2 no empty frame | No run of more than 3 consecutive flat frames (luma std < 1.5 and range < 8 on a 96x54 frame); a dip of <= 3 frames inside a dive is allowed | `look.py` |
| G3 end card short | Scoped by film type, see `motion-density.md` sections 4 and 6; an end card that carries a URL or a legal line (`[label: ...]`) holds at least its reading time; a CTA reached by a push-in or morph declares its start (cue-sheet event of kind `cta`, or a `show` event labelled `cta`) | `look.py` (reads the type; `--hold-warn` overrides) |
| G4 one hero per frame | Two panels only if one is >= 2x the other's area or the camera moves between them | by eye |
| G5 no page chrome | `lint.mjs` passes, and the outer 12% band of every sheet frame is clean by eye | `lint.mjs` + eye |

G1 and G4 have no script: judge them on the sheet and stills, give your own measured numbers, say so in the report, never estimate. A gate that fails is fixed, not argued; a PASS is a floor, not a verdict.

Notice-it questions (answer each in a sentence): is it a slide (cover the text: every frame still a picture; at most 3 flat grounds per film)? is the ground made of something? does the proof have identity (real icon, sender, time, sentence)? is the captured material used? could this be another brand's film? where is the screenshot-worthy frame? decided or reached for? is emptiness doing a job (mostly empty frames only as a breath under ~1.5 s)? does the film breathe (motion note)?

Checklist on cuts and motion (pass criteria; fixes belong to the ice-motion skill):

| # | Check | Pass when |
|---|---|---|
| A1 | Crossfade between scenes | No frame shows two scenes blended, unless the film type's transition policy allows it (ice-motion skill) |
| A2 | Cut lands mid-motion | Between cut-2 and cut-1 at least one major object moves >= 0.01 W, scales >= 3% or is blurred |
| A3 | First frame after a cut moves | Cut and cut+1 differ by >= 0.02 W displacement or are blurred |
| A4 | Continuity | Beat N's last frame shares an object (within 0.03 of position), ground, string or cursor with beat N+1's first, unless the hard cut is the meaning |
| A5 | Flashes and dips | No flat white or black frame between scenes except a designed slam or a one-frame black before a build. In a news reel (edit type `news-reel`, style family `family-broadcast-news.md`) or when the reference measures it: the white and red flashes of the package on phrase boundaries, with their reason row, in strobe safe mode unless the user asked for the faithful one (`slop-scan.md` section 4, "Broadcast package (news reel)") |
| A6 | Dead air at a cut | <= 3 empty frames; 0 when scenes are matched |
| B1 | Holds | Read the film's hold policy from the motion plan first (policies: the `ice-motion` skill, `references/holds-and-stillness.md` section 1). Policies A, B and D: no still run > 0.6 s (18 f) outside a payoff hold or a designed breath; breath and payoff hold lengths: same file, section 2. Policy C (true stills): a still run passes when the motion plan declares it as a rest; an undeclared still run > 0.6 s still fails |
| B2 | Overshoot | Visible springs and overshoot match the film type's row in the overshoot policy: the `ice-motion` skill, `references/timing-and-easing.md` section 7. Overshoot on data, counters, read text or the camera fails in every type |
| B3 | Ease direction | Entrances decelerate, exits accelerate |
| B5 | Staggers | Gaps vary; the largest gap sits before the key word |
| B6/B7 | One blur grammar, one clock | No mix of smear and shutter; one step rate per moment |
| B8 | Finishing layer | Every blur, grain, specks, halftone, flicker, vignette, glow and grade sits on the shots, at the amount and for the reason its measurement or D-entry gives (the `ice-motion` skill, `references/motion-blur-and-clock.md`, "Finishing layer"); one applied to every shot with no such source fails, and so does one the measurement asks for that is missing |
| P1 | Speaker stays lit | News, explainer and talk-show films with a speaker or guest on screen: the speaker stays lit and clear in every frame; dimming, silhouette, circles and marks fall only on the people being talked about (the `ice-edit` skill, `references/layers-and-isolation.md`, "The speaker stays lit") |
| R1 | Element reasons | Every element on the sheet has its row in the storyboard with a trigger and a reason, and appears at that trigger (`storyboard-lint.md` section 3b); an element with no row fails |
| R2 | Colour roles | Every non-neutral colour on a frame maps to exactly one role of the palette (ground, ink, accent, states, image colour): sample each colour on the stills and name its role. A role colour on another role's element fails. News reel: every non-neutral colour on a frame maps to one role of `family-broadcast-news.md` section 1.2 (the `ice-styles` skill); a role colour on another role's element fails (illustrations only: a brand accent used as a word colour, a pointer colour left as text, a quote colour on the narrator's words). Roles: the `ice-direction` skill, `references/color.md` |
| R3 | Fixed identity marks | With a reference whose organisation's marks sit fixed on screen, every fixed mark is in its measured slot on every frame where the reference shows it (`identity-tests.md`, "Fixed identity marks") |
| H1 | Logo arrival | Full opacity on its first frame, arriving oversized or built from parts; never grown from zero or faded up (unless the type's close policy says otherwise) |
| H2/H3 | Ending | Last frame has content; anything held > 0.6 s has a living element; resolved end hold within the type's limit |
| I1-I3 | Rhythm | Beat lengths vary and the last lingers; a ~20-character phrase is on screen >= 1.2 s (hold >= 0.45 s); a 2-word phrase >= 0.5 s; a new element every >= 0.3 s on average, a major event at most every ~0.8 s |

Type, colour, cursor and counter checks in the same review: one weight system, no letter-typed headline (a news reel's typed question card is a mask reveal and passes with its reason row), no opacity-only headline entrance, headline >= 7% H, readable UI text >= 4% H, one accent meaning, arrival tints decay to ink, no stock glows (a measured or reasoned glow passes: `slop-scan.md` section 5, "Finishing effects"; a news reel's title glow and glow disc pass with their reason row: `slop-scan.md` section 4, "Broadcast package (news reel)"), UI shown as a cropped fragment without browser chrome, at most 3 focal groups per frame, frame 0 populated, cursor without ripple ring, counters stepped per frame. The rules themselves are owned by ice-type (type), ice-motion (motion, cursor, counters), ice-direction (colour).

Fix order: anything untrue or broken; the idea; connections between beats; hierarchy and scale; timing; surface and finish; sound polish. Do not tune easing while the idea is unclear (motionmaxxing). Review order for critics: concept, hierarchy, type, colour, composition, asset cohesion, motion, timing, audio, technical (imMamdouhaboammar, rewritten).

## 5. Motion that stills cannot show

- Smoothness of camera moves cannot be seen from stills: watch the whole film at normal speed, at least the densest 30 s (huashu).
- Preview suspicious motion at 0.25x: easing flaws invisible at 1x are obvious at quarter speed (claude-remotion-skill). For GSAP pages, slow review with `gsap.globalTimeline.timeScale(0.1)`; a browser playback rate does not slow GSAP (founder skills).
- Defect signatures in a contiguous strip: a big jump then near-identical tiles (front-loaded ease); a halt then different motion (two moves); a single odd tile (a pop) (herk-edit-kit).
- Pops (a pose, expression or prop swapped with no in-between) are not detectable by frame difference: find them by looking at 12 fps strips. In a hero shot, a pose changing in one frame or a protagonist under 30% of frame height at the hit or hold is a must-fix; performance shots completely still for over 1 s, props teleporting, a whole body sliding rigidly are blockers (reelmimic).
- Probe that the designed easing actually runs: computed values matching the linear fraction at every timestamp mean a timing function was dropped; sweep ink-pixel deltas every ~10 ms across handoffs: a flatline then a jump is the stall-and-pop signature (pixel2motion).
- Single-frame flash detector and one-frame pops: frame-difference spikes > 3x their neighbours; intentional beat cuts show up too, say so rather than hide them (claude-motion-design, founder skills). Scan for one-frame luma flashes and extreme brightness jumps, then inspect each candidate on the video (imMamdouhaboammar, rewritten).
- Dropped frames in captured footage: a gap > 0.07 s between frame timestamps (video-ad-editor).
- Inserted screen recordings: inspect the first encoded frame of each; fractional seeks can leave an empty viewport (herk-edit-kit).

## 6. Text, layout and readability

- Every frame, including mid-transition: no text over text, no title flying through another, no titles spliced by a wipe, no double-printed state swaps (label A to B overlapping for a few frames), no orphaned markup rendering at the canvas origin (motion-video-kit, product-launch-motion).
- Extract the last frame of every shot: anything mid-tween at a hard boundary that should be settled is a defect (product-launch-motion).
- Clip audit: sample every 0.1 s, measure each visible text run against the frame and every clipping ancestor, report cuts lasting >= 0.5 s; declare intentional crops in markup (imMamdouhaboammar, rewritten).
- Phone gate: support copy turning to noise, Arabic hard to parse, tiny logos, desktop-dependent detail or lost object recognition fails; when unclear, reduce rather than add (imMamdouhaboammar). On-screen text times the player scale must be >= 16 px; a 24 px terminal text sharp at 1080p was unreadable in a platform's 480p copy and went to 40 px (explainroo).
- Layout measurements: equal spacing in lists and rows, aligned left edges, lead subject 60-85% of the frame in feature beats (motion-video-kit); under 64 px from the frame edge counts as touching it; annotation boxes derived from the measured target with 16-24 px equal margins, more than 8 px off is rework; labels 36 px or larger, icons 72 px or larger, the core graphic 20-45% of frame height (PolyForm ideas, rewritten).
- Empty stage: the largest content object under 110 px for more than 45 frames is a medium defect, under 80 px high; more than 40% of a frame as an unbroken flat colour is sparse (PolyForm ideas; hyperframes website-to-video).
- Readability by camera, not by inflated type; contrast WCAG AA on settled text (transitional fades excepted); measure contrast on composited pixels, not CSS values. Readability rules and caption placement are owned by the ice-type skill; safe zones by ice-engines (checks in `delivery-checks.md`).
- Design review order on the final still: focal point, placement and spacing, hierarchy, typography, vertical alignment (inspect rows zoomed in), colour roles, object necessity. A scene that renders correctly still fails when hierarchy, spacing, colour restraint, object necessity or final-frame composition is weak; reject placeholder-looking scenes (text-to-lottie).

## 7. Characters, drawings and generated assets

- Character gate before shots: a character sheet (front, 3/4, side, 5+ expressions, 6+ action poses used in this film) reviewed by a fresh reviewer on full-resolution crops; proportion drift, wrong limb count, accessories on the wrong part are blockers (reelmimic).
- Body checks: every part connected (head, neck, body, upper arm, forearm, hand, hip, leg, foot); no floating hands, no arms glued to the body edge; no seams or double outlines at joints; uniform line weight; held objects touch the hand; no silhouette notches or diagonal cuts when raising a hand or turning; no interpenetration; depth order right (reelmimic).
- Drawing detail pass: faces (mouth line, eyelids, brows, ear rim), hands and feet (digits separated, contact shadow), joins between forms, markings that follow the surface; zoom to 3x on joints; a subject with no cast shadow is pasted on (anidoodle).
- Character self-check: six frames side by side; no generic AI little person, no white-shell robot, no faces on objects, same rendering as the background (huashu).
- Expressions checked at final size: "worried" and "angry" are one eyebrow flip apart (lemo-opuscar).
- Generated images and clips: open every image; check extra fingers, malformed hands, gibberish focal text, unintended marks and implausible actions across the whole selected interval; generation success is not asset QA; never present an AI frame as product proof (herk-edit-kit, explainroo, motionmaxxing).
- Vector traces: smoothness is a hard gate over IoU (stair-steps, chatter, pixel-grid runs or noisy knots at 200-400% zoom fail at any IoU); compare the settled frame against the source SVG at matching scale (pixel2motion, text-to-lottie).

## 8. Logic and numbers on screen

- Read all on-screen text in reading order: adjacent cards can form a wrong sentence (huashu).
- Check number semantics, not just looks: "grew 9x" against "grew to 9x", one line ending at 268 while another ends at 286.40 (huashu).
- State labels must not contradict the values ("Open" while a number counts down) (motion-video-kit).
- Intermediate values of a count-up are also on-screen numbers: make them unreadable or do not count (PolyForm ideas).
- Statically extract every literal that can appear on screen from the source and reconcile it with the truth sheet (ice-assets skill); pixel review misses unsampled frames. Cross-check every worked example against other labels (a 30x mismatch slipped through visual review) (PolyForm ideas).
- Reviewers check what should be on screen, not only whether what is on screen is right (a missed name plate passed three reviews) (PolyForm ideas).
- What a card, caption or screenshot says matches the footage (same item, title, place) (founder skills).
- A whiteboard pen must not end covering a word that inverts the meaning (huashu).

## 9. Loops and final frames

- Loops: measure the seam, do not eyeball it: 0 pixels different between the first and last frame, checked in position and in velocity (seek(0) against seek(T), T-1f, T-1.75f; cycles must be whole); a loop target such as 180 frames, seam 0.0-0.3, excursion 0.7-2.8 (an excursion near zero means nothing moves); never measure motion at the halfway frame (charlie947, claude-motion-design).
- Final frame contract for logos: the end frame equals the verified static frame with 0 diff in the same pipeline (pixel2motion).
- The final frame looks finished, not like the last rendered frame (text-to-lottie).
- A process film's last held frames equal the finished still exactly (ice-styles skill).
