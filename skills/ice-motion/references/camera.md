# Camera: punctuation, not decoration

## Contents
1. When the camera moves
2. Camera policy by film type
3. Camera rig rules
4. Move catalog with measured durations
5. Camera and the cursor
6. Shake, handheld and follow
7. Density limits
8. Digital camera on one take (news reel)

## 1. When the camera moves

- The camera is punctuation, not decoration for every sentence. Before each move answer: where should the viewer look now, and can they read it at this framing; is this a transition or an accent; what was the previous camera move.
- A camera move needs exactly one reason: reading order, detail inspection, scale reveal, spatial continuity, or decisive action. A beat or a new sentence is not a reason by itself (a music-led style or a reference that measures beat moves makes rhythm a reason, with its plan row). Compare against a locked camera; keep the move only if it is clearer. The full camera necessity test, the frame and text focus-unit contracts, the camera verb table and the 2D anchor formula are in `camera.md` (section "Composition and semantic camera reference") (the founder's original).
- Long takes (any film or edit type): a single take over about 8 s gets a visible change every 3 to 5 s, or within the reference's longest measured gap when there is one (lesson L9): a camera move with a word trigger (in on the stressed noun, out before text lands, the face panned away from incoming text, the return from B-roll hidden inside a pull-out) or a graphic in or out. A slow creep alone is the floor, not the ceiling. The camera mode of such a take is the plan's `camera` row (the `ice-direction` skill, `references/treatment.md` section "Craft plan"): a fixed crop per segment, or the continuous digital camera of section 8, chosen by the reference, the style or the take length. The news reel numbers of section 8 are the measured case of this rule.
- If it is readable, do not move. Hold when the picture moves by itself (footage, a line being drawn, a growing curve) and while the viewer reads.
- Transitions use slow moves; fast push, slam and whip are accents reserved for reveals, reversals, key numbers and punchlines, countable in one film.
- Go in and come back out: after pushing in, pull out, glide away, or cut to another framing; never three inward pushes in a row; never zoom in and straight back out; never the same move on two adjacent shots; never reverse direction without a cause. On a continuous camera over one take (section 8: a news reel, a long take whose plan chooses it, or a reference that measures it) the in and out alternation is the language, each move with its own word trigger; section 8 replaces this line there.
- One camera language per film; one eased move per scene in calm films; at most two real camera moves per shot in UI films, and the frame is locked during typing, submit and streaming (the content scrolls, the camera does not).
- A move is what carries the spatial relationship between two shots; translating the scene and translating the camera are the same transform.
- "Not moving is not automatically good": a static plain frame with nothing happening was rejected; the camera, objects or new information must carry the time (see `holds-and-stillness.md` for the scoped policy).
- Readability comes from the camera, never from inflating the interface: keep UI at real size and push onto the one element.

## 2. Camera policy by film type

| Type | Policy |
|---|---|
| Explainer, science, finance, whiteboard, collage | Manage pushes, glides are free; push to the line to read, pull out after reading; slow push about 1 s when naming a data point; fast push only for the one or two key numbers; hold while a chart grows |
| Storytime, comedy, talking-head | Manage pushes, not cuts: mostly hold plus hard jump-in (about 2x on the same world); reactions held 0.8 s or more with the camera still |
| UI walkthrough, keynote and screenshot tutorial | Full-bleed screenshot; push only to the unreadable part, one or two pushes per image, then return or glide to the next area; camera locked during clicks and streaming |
| Kinetic type and music-cut sections | Fast-push count not managed; camera follows beats and accents; a camera move at most once per phrase, not per beat by default (a beat-pulse style or a reference that measures beat moves keeps them, with its plan row) |
| Music video | Verse: slow push and drift; chorus: faster; interlude: pull out; transition peaks on beats |
| Social short hook (first 3 s) | Density not managed; return to normal rhythm after 3 s |
| Art film, art-style pictures | The painting stays alive; one main action plus 2 motif loops; the camera may drift slowly |
| Brand film, calm luxury | One slow steady dolly or locked frames; no shake, no spins |
| Product launch, app ad | Camera with intent: push before the cursor arrives, still during the click, release after the state resolves; pull-backs reveal scale |
| Talking-head reframes | Never a per-frame face follow (it jitters). A fixed crop per segment by default; a continuous digital camera anchored on the median face point (section 8) when the reference or the chosen style uses one, or for a single take over about 8 s with no cuts (section 1, long takes); the choice is the plan's `camera` row |
| News reel (edit type `news-reel`) | One locked take reframed by a continuous digital camera: section 8, the measured case. The anchor is fixed per take (the median face point), so it is still never a per-frame face follow |

## 3. Camera rig rules

- One camera wrapper carries the whole world; one state object, one writer function. Everything the camera moves is inside the rig; labels, captions, HUD, light leaks, vignette and grain sit outside it (light in front of the lens). News reel (edit type `news-reel`, style family `family-broadcast-news.md`): plates, titles, discs and pills that belong to the room ride inside the rig, captions and fixed marks stay outside; the split and its tags are in section 8, "Room and screen layers".
- Outer node scales (dolly), inner node translates or turns; never animate the camera and the focal object with the same transform (it cancels the relative motion).
- Screen point = anchor + (world point - anchor) x zoom; single-wrapper counter-translate T = -offset x S.
- Zoom from the target box: zoomMax = min(viewW / (targetW + 2 margin), viewH / (targetH + 2 margin)); default commercial range 0.94-1.16 (a reference's measured range, or section 8 for a continuous camera, replaces it); anchor push-ins at the target centre, never the canvas centre; never zoom into an off-centre dot (open the dot instead).
- Interpolate zoom in log space (zooming linearly in scale feels wrong; easing log2 zoom spends time evenly per stop); for multi-key zooms use one monotone cubic that never overshoots or reverses.
- Camera ease is smoother than object ease: ease-in-out on segments, critically damped springs (z 1) if springs; spring or back on a camera reads as the world wobbling. News reel: the measured push and pull eases of section 8 and the broadcast settle (`springs-and-curves.md` section 7) replace the in-out rule; still no spring or back.
- Encode camera windows as from, apex, dwell end, to, target, reason; assert a locked camera outside them; velocity near zero during reading dwell.
- Overscan: the world is larger than the frame; clamp translation so edges never show; plate padding for whips and trucks.
- Raster sources need resolution at least rendered size x scale; text and UI meant for deep zoom are authored as vector or DOM.
- Line weight at close range: divide strokes by zoom^0.35 so a close-up feels close, not enlarged (drawn styles); or keep strokes in screen pixels so pushing in does not thicken them.
- Never put will-change (or similar caching) on anything the camera scales: text renders blurry.

## 4. Move catalog with measured durations

| Move | Duration | Values | Notes |
|---|---|---|---|
| Hold | per voice or reading | no move | reading, picture moving by itself, silence after a joke |
| Slow push | 0.6-1.5 s (up to 2 s for long distance) | push until the target is readable, typically 10-40 percent; sine in-out | explainers; follow the beat on music |
| Slow push across a whole shot | the shot length | 3-6 percent, linear for this move only (an eased drift stops at both ends and the stop is dead air) | policy A and B holds |
| Pull out | 0.8-2 s | fast start, long tail | back to the whole; closes a section |
| Glide to next item | 0.5-0.9 s | sine in-out; 1.3-1.8 s along a drawn string | speed follows a moving object |
| Fast push (punch) | 0.25-0.35 s | 18-32 percent then hold; kinetic variant: push 6 frames plus 2 frames pull back | accent only |
| Slam | 0.17 s | scale 1.55 to 0.94 to 1.0 | big text, number, stamp; at most once per shot |
| Whip | 0.26-0.30 s | expo in-out with motion blur; see cut catalog | sudden gaze shift, comedy |
| Whip to rest | 0.4-0.7 s | ease out, the last third is the slow part | inside one scene, under the speed ceiling |
| Commercial camera move | 1.5-3 s | smooth in-out | calm ads; entrances after the frame moves |
| Push and pull measured | push median 1.46x over 10 frames; pull 1.32x over 13 frames; wrapper pulls 1.82x, 62 percent ease-in | 1.25x for a 6-frame punch, 1.4x for 12-18 frames, 1.5x for 20-45 frames, 2.4x only for slow drifts; a reveal pull 1.8x with an ease-in; the hero scale move per moment about 4x | launch films |
| One-frame snap reveal | 1 frame then 0.3-0.6 s tail | ratio 0.56-0.77 in one frame, then a decelerating tail (9-18 frames); never one global ease-out zoom | the camera reveals or reframes the product |
| Two pushes | | different accelerations, never one ease | |
| Coordinate target zoom | 1.0-2.0 s (under 0.8 feels like a teleport, over 2.5 drags) | 1.5x modest, 3x dominant, 5x and more extreme; dwell at least 1 s (1.5-2 ideal); target at most about 88 percent of the canvas at peak | |
| Viewport change | 1.0-2.0 s | 1.3x, 1.6-2.0x typical, 3x and more; dwell at least 1 s | |
| Multi-phase camera | phase 2 at 0.3-1.0 s for 1.0-1.8 s; phase 3 at 2.0-4.0 s for 1.0-2.0 s | phase scales 0.88-0.96, 0.98-1.02, 1.04-1.15; drift 1-3 cycles, 2-8 px x and 1-4 px y, frequency ratio 1.2-1.5 (about 1.3 organic) | hero reveal after the pull-back lands |
| Zoom-out workspace reveal | one decelerating zoom-out | open at 4-12x; no zoom-in anywhere; camera static outside the single reveal | |
| Pull-back reveal | 1.5-3 s | the larger thing is in the world from the start, never faded in at the end | |
| Detail-first open | 1.5-3 s | zoom 4-6 down to 1 | |
| Dolly zoom (vertigo) | 1-2.5 s | dolly 1.6-3x, at least two planes behind the subject | once per film, a realisation beat |
| Turn (2.5D) | | perspective 2200-2800; rotationY from -6 to -10 degrees ending at -1 to -2 (never exactly 0); rotationX 2 to 0.5; power1 in-out | UI hero shots |
| Accelerating scroll | about 1.8 s | about 6 px per frame up to about 250 px per frame (0.35 H per frame), no blur, then decelerate over 9 frames onto one readable block held 0.8 s | logs, feeds |
| Pan | | about 1.2 H per second falling to 0.18 H per second over 2 s; parallax speed ratios 2-2.4x | |
| Camera micro-drift | continuous | at least about 0.003 H per frame (about 1 px per frame); end still accelerating with no settle | policy A films only |
| Collage camera | | born in close-up of the first asset (z about 1.4 settling to 1.32), glide to the second as it enters, zoom out to home (1.0-1.2 s) as the title appears, still at home until the transition; text at least 0.1 s after home | collage explainers |
| Flythrough path (3D) | | continuous curvature, constant ground speed by arc length, heading aimed at a point ahead on the path, bank into turns (gain about 0.6, max about 7.5 degrees); calm reference about 0.54 km per second | map and terrain films |

Dive with a constant octave rate and the push-through camera: see `cut-catalog.md` section 3.

## 5. Camera and the cursor

- Settle the push before the cursor arrives; hold still through the click; release after the state resolves. A camera still moving during a click steals the click.
- Zoom to a click target 0.3-0.5 s before the cursor arrives (scale 1.4-2.2, power2 in-out over 0.6-0.9 s), target slightly above centre; then back to wide or glide to the changed panel (0.7-1 s); 1-3 important clicks per act get a zoom.
- Fixed-point trick: set the transform origin on the clicked control so it stays put while the world scales.
- Camera-cursor tracking: cursor target fraction 0.5-0.75 of the frame; track 0.8-2.0 s power2 or power3 in-out; back.out reads as UI bounce, not camera.
- Keep the cursor inside the frame at every zoom, including during morphs; the cursor keeps a constant screen size when the UI zooms (or 1.5x when the UI zooms 2.33x).
- Push-in never crops the preview out; a CTA is fully built before any push-in on it begins.

## 6. Shake, handheld and follow

- Impact shake: amplitude 0.8-1.5 percent of width in screen pixels, a little rotation, attack about 2 frames then a squared decay, low-frequency seeded gradient noise (about 10 Hz at 30 fps), never white noise per frame; full strength on the hit, gone within a beat; at most two per film and only on a real contact; on a separate wrapper. The count of two is the default; a handheld, found-footage or action style, or a reference that measures more, sets its own count with its plan row. Banned in calm, premium, UI-narrated and health films; narrated UI films want no shake (a 180-degree shutter turns shake into double images).
- Handheld float: a slow two-sine wobble that fades to zero in holds, plus a decaying deterministic shake on landings (energetic films only).
- Follow with lag: 0.1-0.2 s lag, lead room ahead of the subject; key the camera about 0.1 s ahead of the subject on sine in-out to follow; key the landing point before a snap on expo in-out to whip.
- Never lose the subject: declare which elements must stay in frame and check every frame; at deep zoom (past about 20x) key the anchor's screen position and the log of zoom.

## 7. Density limits

- In explainer, science, finance, whiteboard and collage films: fast push, slam and whip together at most one third of shots; no three consecutive inward pushes; about 8 or more push-ins per minute is a warning (one measured 102 s film pushed about 48 times, all inward, and was rejected as too fast and not smooth). On a continuous camera (section 8: a news reel, a long take, a reference that measures its moves per minute) those moves per minute replace this warning when the moves alternate in and out and each one has a word trigger; push-ins that are all inward or have no word trigger still warn.
- Narrated explainers: at least 3 camera moves per chapter, at most 1 per shot, 30-45 frames in-out; never during glitches or staggered entrances; moves finish before the beat, not start on it; end at least 30 frames before the shot exit (a gentle 1.0-1.05 push across the whole shot is the exception).
- Camera never moves under a fixed overlay that must stay registered. On a continuous camera (section 8, the news reel its measured case): captions, logo bug and programme name are screen layers that need no registration to the room, so the camera moves under them while room graphics move with it (section 8).
- Use at least four different camera moves and real changes of framing across a story film; a 2D film has a camera too.
- Two same-size shots in a row feel flat: vary shot size (wide, medium close-up, close-up); camera welcomes, it does not chase.

## 8. Digital camera on one take (news reel)

Scope: news reel (edit type `news-reel`, the `ice-edit` skill, `references/edit-types/news-reel.md`; style "Presenter news reel", the `ice-styles` skill, `references/family-broadcast-news.md` section 1), any edit whose reference measures a continuous digital camera on one take, or any single take over about 8 s whose plan's `camera` row chooses the continuous camera (section 1, long takes; the numbers below are then starting points, scaled to the take and the speech). The general rule is "a single take over about 8 s gets a visible change every 3 to 5 s" (section 1); this section is its measured broadcast case. For that scope only it replaces the push warning of section 7, "never zoom in and straight back out" (section 1), the fixed crop of the talking-head row (section 2), the commercial zoom range of section 3, and the zoom ceiling and locked zoom per segment of the `ice-edit` skill (`references/house-style-numbers.md` section 4). Everywhere else those rules stand. With a reference, its own measured moves win over the numbers below (measured with the `ice-remake` skill, `references/measuring.md`); per-package values: `family-broadcast-news.md` section 2. Numbers at 25 fps, in frames (f) and seconds.

**What it is.** One locked studio take; one scale track (plus a small position track) on one wrapper that holds the video and every room graphic. The camera never sleeps but never wanders: every move starts on a word or on a graphic that needs room.

| Measure | Value (three measured programme packages) |
|---|---|
| Moves per minute | 15.8-27.8 (one move every 2.2-3.8 s; 9-18 per reel) |
| Framing range in one take | 1.64-2.6x between the widest and the tightest framing |
| One move | scale ratio x0.60-x2.10 in 9-83 f (0.36-3.32 s) |
| Push-in | 20-66 f (0.8-2.64 s), x1.08-x2.03; outQuad or outCubic (progress about 0.29-0.63 / 0.65-0.86 / 0.89-0.98 at 25 / 50 / 75 percent of the time); peak speed 1.2-3.0 percent of scale per frame |
| Pull-out | 9-64 f (0.36-2.56 s), x0.60-x0.85; inOutQuad or inOutSine for calm pulls, outQuad or outCubic for quick ones; peak 2.2-3.4 percent of scale per frame |
| Breathing move (one package) | in x1.19-x1.32, out x0.81, 15-80 f (0.6-3.2 s), inOutCubic or inOutSine |
| Pull-out under a card | x0.71-x0.75 over 48-83 f (1.92-3.32 s), near linear: the card recedes with the room |
| Slow creep | a 3-4 s stretch with no graphic: linear x1.16 over about 74 f (2.96 s) |
| Holds between moves | median 18-20 f (0.72-0.8 s), range 6-78 f |
| Opening move | 1.386x to 1.0 in 38 f (1.52 s), 90 percent done by f17, outCubic, anchored near the top edge |

**Anchor.** Zoom about the median face point of the take (the median of the face centre over the whole take), fixed for the take: never a per-frame follow, so the head never jitters. By package: the Arabic packages anchor at the face (the top edge for an opening move); the English package anchors at the frame centre. A move may add a position change, because scale alone cannot move the frame up or down.

**When each move fires.** Every move has a trigger in the words or in a graphic, like every element (the `ice-qa` skill, `references/storyboard-lint.md` section 3b).
- Out before a text lands: pull out so the incoming text has room; the move starts between 10 f (0.4 s) before the phrase and 2 f after it, or on the cut frame back to the presenter, or 4-12 f (0.16-0.48 s) after a card's first frame.
- In on the key noun: push in on the key noun, a question word, or the first stressed word of a new phrase, starting between 7 f before and 9 f after the word onset (10 f before to 15 f after on a question).
- Pan the face away from the text side: a long phrase that needs a side block in a close framing moves the camera so the face goes to the side opposite the incoming text. Pan out starts 7 f before the phrase, about 30 percent of frame width in 29 f (1.16 s, inOutSine); pan back about 24 percent of width in 42 f (1.68 s, outCubic), starting 4 f after the block leaves. Text never covers the face; the camera moves the face instead.
- Spatial words may act the zoom (out on a word meaning far, in on a word meaning near, in the film's language): 29-58 f. Weak evidence (one pair): only when such words are spoken.
- Re-entry pull-out: after a cut back from archive or B-roll, start at about 2.1x (2.05-2.10x) and pull out to 1.0 over 26-28 f (1.04-1.12 s; outCubic about 0.58 / 0.88 / 0.98, or outQuad 0.50 / 0.77 / 0.91), starting on the cut frame, 1-4 f after the presenter's first syllable: the cut hides inside the motion. One package's variant: 1.63x blurred for 3 f, then 8 f to 1.15x.
- English package variants: a pull-back of about x0.77 over about 49 f (outCubic-like, 90 percent at 0.95 s); the blur reframe (`cut-catalog.md` section 13, "Broadcast transitions").

**Source height.** The source height must be at least the largest total scale of the take times the output height (2.14x in one measured package: a 4K-class plate for a 1080 wide vertical). When it is not, cap the largest scale at source height / output height and log the cap as a D-entry in `ice/DIRECTION.md`. A framing below 1.0x (wider than the source frame) needs overscan: pad the plate (the `ice-type` skill, `references/depth-and-embedded-captions.md` section 3) so no edge ever shows. Shooting for it: the `ice-edit` skill, `references/ingest-and-ledger.md`, section "Shooting for a news reel".

**Null punch-outs (tutorial build, translated to code).** The plate is first scaled to 125 percent so moves never show an edge; a parent null (in code: the camera wrapper) carries the moves. Punch-out 260 to 100 percent in 24 f (0.96 s), with a position move from tight on the face to the full frame, fast start and slow end; or 191 to 100 percent in 36 f (1.44 s), out influence 48.6 percent (`springs-and-curves.md` section 7, "Broadcast settle"). Tilt moves with the elements: the wrapper moves about 8 percent of frame height in 16 f (0.64 s, peak about 0.73 frame heights per second on the first frame, long decay), holds 13 f (0.52 s), and returns in 16 f with no bounce. The total scale on the source is plate x wrapper (1.25 x 2.6 = 3.25x), and the source height rule above applies to that total. Spread the keys so no move is harsh.

**Room and screen layers.** Plates, titles, discs and pills that belong to the room ride the camera rig: same wrapper, same anchor, same ease and same frames as the zoom (measured: a keyword shrinks from 830 to 676 px and rises 84 px with a pull-out; plates follow the zoom within 1-4 px). Captions, logo bug, programme name, progress bar and end card stay on the screen layer: they never scale or move with the camera (the tutors never parent the channel logo or the programme title to the camera). Tag every element `layer: rig` or `layer: screen` in `plan/shots.json`. Check legibility at the smallest scale of the take: the font size in px times the smallest scale must still meet the size floor of the `ice-type` skill (`references/sizes-and-scale.md` section 4). Fixed identity marks measured from a reference sit where measured (`composition-and-staging.md` section 4).

**Build.** HyperFrames or HTML: one transformed wrapper around the video and the `layer: rig` graphics, scale tweened in log space (section 3), transform origin at the anchor; Remotion: `interpolate` on the same wrapper. Screen layers are siblings outside the wrapper. No motion blur on digital zooms (`motion-blur-and-clock.md` section 3).

Sources: huashu-art-motion (camera language, measured durations), motionmaxxing (motion.md camera, ui-demo), hyperframes skills (camera rules, blueprints), hyperframes docs (motion.mdx, vocabulary), anidoodle (camera.md, motion deck), product-launch-motion (05 camera, cursor), claude-motion-design, Barty-Bart motion-graphics, charlie947 motion-graphics (shot-size rig), video-ad-editor, lemo-opuscar, group-d explainer engine, commercial-motion-design (founder), ideas from onetake, anything2explainer, remotion skills, imMamdouhaboammar (rewritten); section 8 from measurements of three broadcast news packages and the reel tutorials of Muhamd Helal (ideas only).


## Composition and semantic camera reference

> From the founder's commercial-motion-design skill (Omar-Tnzxo, Apache-2.0 in this repo), references/composition-and-camera.md. Unchanged except this notice. Move durations and camera policy by type: `camera.md`.


Camera motion is narrative punctuation, not a global scale effect. Adobe distinguishes camera position, point of interest, zoom, angle of view, focus distance, and depth of field; keep those roles conceptually separate even in a 2D implementation.

### Frame contract

For each scene record:

```text
focal bbox: x, y, width, height
safe margin: x, y
camera anchor: focal center
start zoom / apex zoom / settle zoom
camera verb: hold / push / pull / truck / orbit / reframe / impact
semantic purpose: inspect / commit / reveal / compare / release / bridge
foreground z / focal z / background z
portrait overrides
```

### Text focus-unit contract

Before animating important copy, split it in reading order and record:

```text
unit ID / exact words / semantic role
text bbox and optical center
camera start / arrival / zero-velocity dwell / departure
minimum readable frames
next phrase or proof target
handoff direction / occlusion / sound bridge
```

Do not rely on scale alone. Combine scale with a small target-anchored reframe when necessary, and let the previous unit remain legible only if it supports the sentence rather than competing with the new owner. During the dwell, reduce camera velocity to nearly zero; micro parallax may continue below the threshold that disturbs reading.

#### Camera necessity test

For every proposed camera move, render or mentally compare a locked-camera alternative. Keep the move only if it supplies at least one function the static composition cannot supply as clearly: reading-order control, inspection of small evidence, reveal of scale or context, continuity between separated spaces, or reinforcement of a decisive physical action. A new sentence, a musical beat, or an entering icon is not sufficient justification by itself. When the elements already create the hierarchy, let them move inside a stable frame.

Useful phrase transitions:

- push from a general claim into one highlighted word, then pull out to the mechanism that proves it;
- truck along a sentence only when the reading direction and composition support the move;
- use a word's underline, mask, stroke, or geometry as the incoming proof object's path;
- let a proof object occlude the outgoing phrase, then inherit its screen direction and color.

### Dimensional scene contract

For a 3D or simulated-3D beat, record camera position and point of interest separately from object transforms. Require at least two depth planes with different parallax and a readable occlusion event. Add contact shadows or projected shadows that agree with one light direction. Keep text on a camera-facing plane unless rotation is itself the explanation.

An exploded-view mechanism should show a cause for separation, preserve shared alignment guides, and recombine or hand off to the next owner. A perspective transform without parallax, occlusion, or depth-dependent scale is not sufficient evidence of 3D.

### Choreography

| Camera verb | Use when | Required anchor behavior |
|---|---|---|
| Push-in | inspect a mechanism or commit to an action | aim at the semantic target, not canvas center |
| Pull-out | reveal result, scale, context, or secondary benefits | preserve the outgoing focal point until the reveal reads |
| Lateral truck | continue direction or move between related spaces | maintain parallax and screen direction |
| Orbit | reveal form, dimensionality, or relationship | keep point of interest stable and avoid unreadable text rotation |
| Reframe | transfer attention between distinct claims | move only after the new target has a visible cause |
| Impact move | reinforce a real collision or musical hit | use a brief displacement and damped recovery; never continuous shake |

Do not animate camera and focal object with the same transform by default; that often cancels relative motion and produces a fake zoom. Record their screen-space paths separately. During a handoff, the camera may anticipate by a few frames, arrive with the focal impact, then settle after the object.

For 2D camera simulation, calculate translation around the target anchor:

`screenPoint = cameraAnchor + (worldPoint - cameraAnchor) × zoom`

Use optical offsets only after the numeric anchor is correct. A push/pull must not crop the target's motion-blur envelope, shadow, or Arabic copy.

### Optical checks

- Measure visible bounds after transforms, not layout bounds before transforms.
- Include glows, strokes, and drop shadows when checking crop risk.
- Avoid centering purely by bounding boxes when a shape has unequal visual weight; apply small documented optical offsets.
- Keep Arabic line widths compact enough to read in one fixation.
- Do not put title and main UI on the same vertical band unless one clearly dominates.

### Responsive art direction

Landscape often supports side-by-side explanation and evidence. Portrait should usually stack title, focal UI, and proof. Reduce horizontal camera travel, enlarge touch targets and semantic icons, and test the entire 9:16 safe area rather than reusing 16:9 percentages.

Retarget the choreography, not just the coordinates: convert wide trucks into shorter vertical reframes when appropriate, recompute focal anchors, parallax distances, orbit radii, and entry/exit vectors, and preserve the same narrative arrival frame.

Source basis: [Adobe After Effects camera layers and points of interest](https://helpx.adobe.com/after-effects/desktop/work-with-layers/camera-layer/cameras-lights-points-interest.html) and BUCK's [Sonos case study](https://buck.co/work/sonos-move), where continuous camera movement and echo lines jointly express freedom of movement and bridge spaces.


## One-take films: one shape, one world, one camera

Films built without scene cuts: a single element that morphs through every state, or a single world the camera travels. Use when the brief, the direction pitch or the reference calls for "one continuous" film. Typical scope: product launch UI-morph films, app ads, logo stings, loops, explainers on one canvas, art films that travel through paintings.

### 1. Three forms

| Form | What persists | Typical length | Fits |
|---|---|---|---|
| One shape | One element morphs its size, radius and colour through 8-12 states while its content swaps with a short blur | 10-30 s, often a loop | UI showcase, app ad, product launch, social short |
| One world canvas | A layout about 3x the frame (or larger) holds all stations; the camera travels between them; nothing resets | 20-90 s | Explainer, data story, UI walkthrough, whiteboard, collage |
| One travelling actor | A hero object travels through stations whose state it changes | 15-60 s | Brand film, explainer, hype promo |

### 2. One-shape rules

- Every state is the same element. Transitions are morphs, camera moves and zooms into an element that becomes the next scene.
- Springs everywhere, a tiny overshoot at most (damping 0.72-0.9; 1.0 for camera and text); no bouncy easing.
- Leading and trailing edges ride different springs so indicators, knobs and pills stretch (`edgeSplit` in `scripts/springs.mjs`).
- Text inside a morphing container has its own enter and exit timing: exit short and early, enter after the morph starts, so old and new text never overlap.
- A cursor drives every change with real clicks and drags; while held, the value is computed from the cursor position; on release it springs back from wherever it was.
- The camera zooms so each state fills the frame; empty frames are a bug. Pull-backs reveal scale (one item becomes a grid of hundreds).
- Music-first timing: choose the track first, build on its beat grid (about 120 BPM is a common choice, never a default), start on a downbeat, place the drop on the biggest state change; something happens on every beat. Beat analysis is owned by the ice-audio skill.
- Show the state list on the beat grid before writing code.
- Loops: the last frame is the first frame, cursor position and speed included.
- Banned in this form: bouncy easing, particle bursts, glows, gradients on UI chrome, mismatched icon strokes, dead time, template looks.

### 3. One-world rules

- The video lives in a single space and never resets: an element, once drawn, is never redrawn, moved or relabelled without a visible cause.
- Decide the spatial grammar before building and hold it for the whole runtime; break it exactly once, deliberately, for meaning.
- Three altitudes (world, region, detail): move between adjacent ones; jumping from detail to world is disorienting unless it is the payoff.
- Name framings as exact world windows, not scale factors; window boundaries fall between labels; reuse the same window for the same purpose (near-identical framings read as drift).
- Lay out each scene as one picture on the full canvas the way it should look at the end, and let the camera find the close-ups. Put the next element near the one it follows so one shot shows both.
- While a shot holds, every card and label is fully in the shot or fully out of it (arrows and lines may run off the edge); push half-visible neighbour labels out of frame.
- Camera landing is computed from what must be read now (target box plus margin), never hand-typed coordinates.
- A faint lattice on a far layer (a dot grid moving with the camera at depth about 1.2) makes camera moves readable on an empty ground.
- Scenes on one canvas: whiteboard films pan only about 0.23 frame width (about 75 percent overlap) so viewers see the previous block's edge; collage films build objects, relations and camera first, decoration last.
- Every label belongs to its station: it arrives with it and leaves before the camera leaves.
- Long scroll worlds: the camera only moves forward (target = running maximum of the hero position plus a lead, then smoothed), so it never stops and rewinds; check for backward camera motion.
- Time events relative to the interaction (when the hero reaches the station), never as seconds after a segment starts, so walk speed can change without editing every segment.

### 4. One-actor rules

- One simple, readable hero that never disappears or gets replaced (it may change shape for a moment, then return).
- When the hero leaves a station it was part of, the station keeps a dim outline of the empty slot.
- Follow camera: target = blend of hero position (plus about 0.15 s of velocity lead) and a fixed anchor for the current station, smoothed by a critically damped spring (w about 6); anchor weight about 0.7 during an interaction, 0.15 during flights, 0.85 on the payoff hold; the hero never leaves the middle half of the frame.
- Tight during each interaction: the station fills about half the frame width; the hero about 50-70 px on screen at 1080p (at least 24 px when the reveal frames the whole course).
- Payoff hold 0.4-0.6 s fully in frame before the launch to the next station.
- Hops on parabolas with constant gravity, landing on the beat; squash on contact (1.25 x 0.8 for about 60 ms, spring back), stretch along velocity in flight (up to 1.15 x 0.9).
- Slow-motion reveal: warp time so the flight fills the reveal window, slowest at the apex (often 5-10x slower there).
- Loop seam at the hero's landing on the first station: the last frame looks exactly like the first.

### 5. One-take continuity devices

- Dive into a logo with zoom from 1 to 10 and blur, out of the next shot.
- A J-cut leads the picture by 4-12 frames.
- Match cut = same shape, same place and size on the cut frame.
- Forbidden in one-take films: crossfades, unmotivated blur dissolves, resets to an empty frame.

### 6. When not to use a one-take form

- The brief has unrelated topics with no relation to draw (a canvas route would be long and empty).
- The film is read-critical text or legal copy.
- The reference (ice-remake) uses hard cuts as its grammar.
- A one-take film still needs contrast: bursts and rests, close and wide, fast and slow.

Sources: product-launch-motion (v2 SKILL.md, technique.md), community prompt library (one-shape UI morph prompts), Barty-Bart motion-graphics (explainer-engaging, explainer-default, motion-broll), claude-motion-design, herk-edit-kit (video-storytelling), huashu-art-motion (long scroll, whiteboard grammar), group-d explainer engine (camera and layout rules), video-ad-editor (one-take rules).
