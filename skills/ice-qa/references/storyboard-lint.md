# Storyboard lint (plan-time gates)

Run before any code. A red storyboard is fixed on paper; it is ten times cheaper than fixing a composition. Sources: huashu-art-motion storyboard lint (MIT, ported), motionmaxxing storyboard checks (Apache), motion-video-kit storyboard critic (MIT), bang-motion structural bans (MIT), founder skills, IDEAS_ONLY ideas from imMamdouhaboammar and the PolyForm explainer sources rewritten.

## 1. The table format the linter reads

Write `ice/plan/storyboard.md` with the style lock above the table (lock lines are defined by the ice-styles skill; the linter reads `Style:`, `Palette:` with hex values, `Characters:`, optional `Allow blue-purple:` and `Style exception:`), then one row per shot:

`Time | Object | Action | Camera | On-screen text | Trigger | Reason | Method | Tags`

`Trigger` and `Reason` are required in every film type (section 3b). Two optional columns are read when present: `Cites` (the exact spoken phrase the row's text or graphic follows, quoted, with `#2` for its second occurrence; the storyboard twin of `cites` and `cites_occurrence` in `plan/shots.json`) and `Subject` (one role word: `speaker`, `discussed person`, `voice`, `place`, `object`, `programme`, `whole frame`; the `ice-remake` skill, `references/notes-files.md` section 6). A row that shows a depth or 3D element names its build route in the Method cell as `build: <route>`.

Workflows may add columns (Buys, Role, Carrier, Sound); the linter ignores columns it does not know. Run:

```
python scripts/storyboard_lint.py ice/plan/storyboard.md --script ice/plan/script.md
```

Exit 1 = red: fix and re-run; do not start building. Exit 0 with yellows: start, and write the reason for each yellow into the delivery report.

The first line names the film type and the row of `motion-density.md` section 6 it used (from `--type "<film type>"`, else `ice/state.json` `subtype`, else the `film_type` row of `ice/BRIEF.md`). Write the On-screen text cell exactly as the script has it, diacritics included: the linter removes combining marks before counting, so never make a stripped copy of the table to pass it.

## 2. The 21 machine checks

| # | Check | Light |
|---|---|---|
| 1 | Object column names a concrete thing, not a layout word (title, bullet, card, background) and not an empty picture (blank, flat colour, black screen) | red |
| 2 | Action column has the object's own verb, not appears, shows, fades in | red |
| 3 | On-screen text is at most 8 units (a CJK character or a word counts one; Arabic harakat, shadda and other combining marks never split a word). Scoped exception: end-card rows tagged `CTA block` in the Tags column may carry the facts a viewer needs to act (name, date, time, place, store line, link) up to 8 + the type's `cta_info_units` (16 for product launch, app ad, industry spot, social short, hype promo, UI walkthrough, brand film, talking-head ad, shorts and reels, news reel; no exception elsewhere: `motion-density.md` section 6). The exception itself and how to split a long block across at most three end shots: the `ice-film` skill, `references/film-types/industry-spot.md`, Text density. Never shorten an address or a date to pass | red |
| 4 | First shot is not text-led (a text noun heads the Object phrase, "headline over a photo"; a text word inside a description, "the stroke of the word", does not count) | red (4+ units of text on shot 1: yellow) |
| 5 | Text-led shots are at most 30% of shots | red |
| 6 | Shot length 2-6 s; 6-8 s or under 2 s yellow; over 8 s red; more than a fifth of shots at 6-8 s red. Scoped exception (news reel on one locked studio take, edit type `news-reel`): a declared `Style exception:` line naming the continuous take turns both reds into yellows; the take's inner events are then gated by the pacing check (`motion-density.md`, "Pacing against the reference"; with no reference, `news-reel.md` section 3 "Rhythm") | red/yellow |
| 7 | Three shots in a row with the same camera value (hold and glide excepted) | yellow |
| 8 | Last shot is not text-led (quote card, pure text card); a `CTA block` row is text-led only by its Object or Method, not by its text count. A news reel's branded end card (and any measured end card) is tagged `CTA block` in the Tags column and named as the card in the Object column ("end card ..."), so it passes; its hold is the `news reel` row of `motion-density.md` section 6 | red |
| 9 | Every on-screen number (percent, year, number with unit) is said in the script (digits or English words) | red |
| 10 | At most 3 tags per shot | yellow |
| 11 | No separate number card in the middle of the film | yellow |
| 12 | Style lock lines present (Style, Palette, Characters) | red |
| 13 | Every palette hex in the blue-purple zone is flagged (zone, the ground, surface or dominant accent rule and the valid reasons: the `ice-direction` skill, `references/anti-sameness.md` section 5). A flagged ground, surface or dominant accent passes only with an `Allow blue-purple:` line giving a valid reason; any other flagged hex passes with an `Allow blue-purple:` line naming its small semantic role or a valid reason (gate: `anti-sameness-gates.md` section 1). At most 6 hue families: hues within 30 degrees are one family and near-greys one neutral family, so the lit and shadow steps of a hue (`ice-direction` colour roles and tonal steps) are listed in full and count once | red/yellow |
| 14 | No code-drawn people, chibi figures, robots or stick figures without a frame library or rig; no faces on coins, balls, ions | red/yellow |
| 15 | No three inward pushes in a row | yellow |
| 16 | Accent moves (fast push, slam, whip) on at most a third of shots | yellow |
| 17 | Every row has a `Trigger` and a `Reason` cell that is not empty and not only a pointer to the source or a taste ("reference", "style", "decoration", "looks good"); a table without both columns is red (section 3b) | red |
| 18 | With a `Cites` column and `--script`: every cited phrase occurs in the script at least as often as its occurrence says, compared after Unicode normalisation with combining marks removed and Arabic forms folded (tatweel; alef, hamza-carrier, alef maqsura and taa marbuta forms). A Cites column without `--script` is a yellow (not checked) | red |
| 19 | With a `Subject` column: the subject is one role word of the vocabulary above (underscores and hyphens read as spaces); an empty cell or another word is yellow | yellow |
| 20 | With a `Cites` column: the row's on-screen words are words of its cited phrase, in order (spoken words are never paraphrased on screen; digits are left to check 9). Rows tagged `CTA block` use their own wording and are exempt | yellow |
| 21 | A row whose Object, Action, Camera, Method or Tags names a depth or 3D element (2.5D, 3D, parallax, push-through, card field, cards in space, extruded text, wrapped text or text on a cylinder, virtual set, depth planes; "no 3D" does not count) names its build route as `build: <route>`, one of `css-3d`, `threejs-hyperframes`, `remotion-three`, `blender` (only when Blender is installed); no route or an unknown one is red (lesson L12; routes: the `ice-motion` skill, `references/depth-and-3d.md`, "Build routes for depth and 3D") | red |

Plus: one reusable template or clip file running over 8 s in total is red; more than 2 template families mixed is red (yellow with a declared style exception); time spans that do not join, and a table with no camera move at all, are yellow.

Arabic number words are not parsed by check 9: write digits in the script or confirm those numbers by hand. Arabic-Indic and Persian digits are read.

Checks 18 to 21 come from the reference-reasons validator proposal (cited phrase in the transcript, subject role, verbatim on-screen words, depth build route); the checks that need a face track, colour sampling or the reasons table (face box, colour roles, NEVER predicates, flash windows, camera scale) run on the frames instead: `frame-checks.md` section 4 (R2, R3, P1, A5) and the `ice-remake` skill's fidelity checks.

## 3. Plan checks a person or critic runs (not machine-checkable)

Answer each in one sentence in `ice/review/storyboard-review.md`.

| Check | Pass when | Source |
|---|---|---|
| Buys | Every row completes "Buys ___: the viewer ___." without the word "and"; delete a beat and the viewer loses a belief, else delete it for real | motionmaxxing |
| Beat lengths | 90-210 f at 30 fps (3-7 s); a type-only hook 60-90 f; beats vary in length, shorten then linger | motionmaxxing |
| CTA share | CTA beat at most 25% of the film; its resolved end hold planned at 0.6-1.4 s (scoped by film type, see `motion-density.md` section 4) | motionmaxxing |
| Seams | Every seam names a carried object, or is a deliberate hard cut with a reason | motionmaxxing, hyperframes motion doctrine |
| One new thing per beat | No beat repeats a sentence without escalation | motionmaxxing |
| Proof readable at plan time | The proof object is planned at >= 0.55 W with text >= 0.04 H (gate G1) | motionmaxxing |
| Strongest frame | Named, at 60-75% of the runtime; it is the frame someone would screenshot | motionmaxxing |
| Chrome audit | No labels, counters, timecodes, kickers in any row (gate G5 on paper) | motionmaxxing |
| Picture audit | "A flat colour", "a card on a flat colour" and "a block of text" are rejected answers to "what is the picture" | motionmaxxing |
| Decided or reached for | Each choice is decided for this brand, not reached for (see `slop-scan.md` section 3) | motionmaxxing |
| Another brand's film | The competitor swap of `identity-tests.md`, run by the storyboard critic on the masked strip (section 3 of that file) | motionmaxxing, product-launch-motion |
| Importance budget | At most 25% of beats at importance 3 (the point) | motionmaxxing |
| Chronology and truth | The order matches how the real service works; every claim is provable from the truth sheet (ice-assets skill) | motion-video-kit |
| Distinct jobs | Each beat has a distinct composition and business job; filler beats named and cut | motion-video-kit |
| CTA on mute | The call to action is unmistakable with the sound off | motion-video-kit |
| One example | One concrete example runs through the film; adjacent shots differ in composition; the first 3 s are a small scene, not the topic | huashu |
| Every sentence has a picture | Every narrated sentence causes a visible change; a sentence with no visual change is a high-severity defect | PolyForm explainer ideas (rewritten) |
| Template skeleton | Not the skeleton "hook, feature, feature, promise, logo, CTA" with text-zoom opener, three feature tiles and a typed search box unless the concept demands it (two or more of those = template) | bang-motion |
| Beat test sentence | Each primary beat completes: the viewer understands [claim] because [object] visibly changes from [state A] to [state B], causing [next state]. Most primary beats failing rejects the plan | founder skills |

## 3b. Every element has a trigger and a reason (owner decision, 2026-10-29)

Scope: every film type, with or without a reference. Trials that copied a reference's marks, circles and overlays with no reason behind them came out as blind copies; a picture element that nothing in the film asks for is decoration.

- An element is anything the viewer sees placed on purpose: the row's Object, and every mark, circle, arrow, highlight, dimming, cut-out, label, caption style, overlay, colour block or texture laid over it. Every appearance is a row of its own, or one line inside its row's `Reason` cell starting with the element's name.
- `Trigger`: the script sentence or the word that justifies the appearance, quoted, with its time from the script or the word timings. In a film without speech (music video, logo sting, silent loop) the trigger is the music or sound cue from the cue sheet, or the story event the element belongs to.
- `Reason`: what the element means, who or what it is on, and why its colour and shape are what they are (a colour from the palette's role, a shape from the concept or the brand, never "it looked good").
- An element with no trigger or no reason is cut before 05, never kept with an invented reason. A reason may never be "it is in the reference": the reference explains where the idea came from, not why it belongs in this film.
- With a reference: the reference's reasons table (the notes file `REASONS.md`, format in the `ice-remake` skill, `references/notes-files.md`, section "Element reasons") is read next to the storyboard. A carried-over element passes only when its reason in the reference still holds in the new film: the same kind of trigger exists in this script, on the same kind of subject (illustrations only, two of many: a circle that marks the person being accused carries over to a film that accuses someone, not to a film where nobody is accused; a strike-through on an old price carries over to a film that announces a lower price, not to one that sells a service with no price). Where it does not hold, the element is cut or re-reasoned from this film's script.
- Where it runs: the linter (check 17) at 04, the earliest stage that can show it, and the storyboard critic reads every reason for truth (`critic-prompts.md`, "Storyboard critic"). The final review confirms it on the frames (`critic-prompts.md`, "Stage critic" item 5 and "Full-film critic"); a new element there with no row is a finding.

## 4. Storyboard boards

- Build boards from real settled stills of the real drawing code, one per shot, tiled into one sheet (6-9 key shots for a short film), each labelled with shot number, framing, duration and line. Never present AI-painted frames as the storyboard: they promise a film the code will not match (founder skills, lemo-opuscar).
- A confirmed board (approved by the user in step mode, or by the approver role in auto mode) is a valid place to stop when the user only wanted a plan; building means dressing that confirmed layout, not redrawing it (hyperframes).
- Revise exactly the frames the user names (on a review card or in a later message), then re-present (hyperframes).
- Before approval, render each hit frame at final quality next to the reference's same frame when a reference exists (see `climax-duel.md`).
