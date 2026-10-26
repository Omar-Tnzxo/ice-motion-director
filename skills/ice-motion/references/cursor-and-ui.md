# Cursor as actor and UI demonstration motion

How a pointer, a press, typing and UI states move inside a film. Scope: product launch, app ad, UI walkthrough, explainer with screens, social short with UI. App and site UI motion itself (shipping components) is owned by ice-lottie; reconstructing real UI from captures by ice-assets; typing cadence of display type by ice-type.

## 1. The cursor is a stage prop

| Rule | Values (scoped by source genre) |
|---|---|
| Size | Never life size (about 32 px at 1920 disappears). Stage-prop arrow about 44 x 54 px with a heavy stroke and a deep shadow (launch films); oversized cursor about 7 percent of frame width (about 134 px at 1920) full-frame and 4.6-5.5 percent inside mocks, never smaller (theatrical demos); rest size 0.04-0.06 W (product-demo films); 48-96 px at 1080p for press reactions |
| Design | One designed cursor per film, vector, never the OS arrow, never an emoji, never an I-beam; white with a 3-4 px dark outline on dark grounds, black with a 1 px white edge on pale; brand-motif cursor when recognizable; a single persistent arrow suits product demos, a hand that swaps in before the click suits playful films; do not mix |
| Origin | Transform origin at the tip (about 14-21 percent x, 6-14 percent y of the glyph); position by the tip; a 4 px miss reads as missing the button |
| Entry | Enters from off-screen (from below, starting about 115-120 percent of the height), 0.4-0.92 s power3.out; or oversized, scaled about the tip, about 60 percent of travel in the first frame, 0.5-0.9 s total, shrinking 15-20 percent near a close target |
| Path | Curved, with heading rotation; a slight human arc (about 6 percent perpendicular); arcs may dip about 0.23 H; stepped films move in 2-frame steps each about 0.72 of the previous; lean with velocity (clamp about -vx x 0.0045 to plus or minus 14 degrees) and an optional short trail sampled at earlier times |
| Park | Parks before it acts: 2 frames on an obvious button, 3-5 frames when switching, 5-15 frames when the camera zooms; finish the zoom before the press; hover states appear early (about 0.4 s before a drop) |
| Off-duty | Drifts aside 0.5-0.9 s during beats it does not own; exits by acceleration (0.04-0.06 W per frame) off an edge with power2.in over 0.5-0.7 s, or shrinks in place over about 9 frames; never an opacity fade in place (one source fades it when its work is done: acceptable only in calm films) |
| Layer | Own top layer; stays inside the frame at every zoom |
| Send-only cursor | Enters about 0.4-0.7 s before the last character of a prompt lands |
| Multiple cursors | 2-4 actors with one job each; legs 0.6-1.2 s power2 in-out; rests 0.5-1.5 s; action beats at least 1 s apart; two cursors within about 80 px read as a glitch; interleave, never chord; camera locked; actors are people (name pills about 0.06 W x 0.04 H) |

## 2. The click

| Element | Values |
|---|---|
| Lead the travel, land the beat | cursor travel 0.2-0.3 s before the word or beat; the click lands on the word |
| Cursor press | 2 frames down to 0.71-0.90 scale (tip pushed down about 0.03 H), 3 frames back; or press 0.06-0.12 s half yoyo; or a Gaussian dip of 16 percent over about 45 ms |
| Target press | 0-1 frame after the cursor minimum, to 0.63-0.81 (measured) or 0.92-0.97 (UI-scale buttons); cursor compresses more than the target |
| Asymmetry | 6 frames down, 10 up (compress and expand about 1:2); at most one rebound style per film; a release may rebound about +5 percent |
| Response | The answer is in the UI: a hard colour step, a tint plate about 0.25 opacity, a bar dip of 15 percent recovering in about 4 frames, a sheen 25-45 px over 7-16 frames, a glow of 35 px at 40 percent about 7 frames after the press decaying over 0.3 s; brightening the target beats a ripple ring |
| Ripple (scoped) | Measured launch films: no ripple ring and no white flash as the default (one film of seven used it). Playful or tutorial films may use a ring: 0.4-1.0 s to 3-6x, staggered 0.06-0.12 s (reference: ring 5x over 0.7 s power2.out after a 0.08 s press) |
| Cut on the click | Cut at maximum compression or before the release when the click causes the next scene; "the click ignites the next beat" |
| Camera | Still during the click (see `camera.md`) |
| Physical press reaction | approach 0.7-1.3 s; press 0.1-0.25 s; release 0.4-0.7 s; intensity 0.05 / 0.10 / 0.15; bounce 1.6 / 2.0 / 2.4; same press scale on cursor and button |
| Press-release spring (hero button) | button at least 3-5 percent of the canvas; linear press, spring release; burst behind the button (peak scale 3-8), never in front; dwell at least 1 s (2 s dramatic) |

## 3. Drag, toggles, cascades

- Drag: ghost opacity 0.5-0.75; lift scale 1.03-1.08; travel 0.6-1.2 s power2 in-out; drop at exactly travel start plus travel duration; the drop is one frame with stacked feedback; grab has weight; resize uniformly from an anchor corner. A drop may be the film's single overshoot. Dropped cards may shrink to nothing about their centres in 3 frames each with a 1-frame stagger instead of flying to slots.
- Direct manipulation: while the pointer holds, the value is computed from its position; on release it springs from where it was.
- Control and target sync: scrub 0.8-1.6 s on one shared ease for both the control and its readout; never stagger the target behind the readout; the readout is data, no overshoot; 2-4 beats with holds of 0.3-0.8 s; end on a landed edit.
- Toggle: 2 frames: the knob moves, one pale in-between frame, full colour; no glow, no bounce, no ring.
- Cascade after a master action: starts about 5 frames after the master, 2-3 frames per item with uneven gaps, 5-7 items, at most 0.6 s; a 2D wave is origin-first with a convex front.
- Checklist: a three-state machine (waiting, working, done), about 0.9 s per row, batons overlapping; each step is a concrete verb plus a number or object; at least three items in progress at once in agent films.
- Menus: a height wipe of about 4 frames with rows 1-2 frames apart; never fade a whole panel in.
- Card birth: a 1-frame pale slab with about 25-30 px horizontal blur grows to 0.5 H over about 14 frames, about 22 frames apart; newest cards insert at the top and fill 2-4 frames later; older cards shove in jerks with one 2-frame hold.
- Carousels: the stop is the selection, no overshoot.
- Card to canvas: animate a zoom out.

## 4. Typing and agent states inside UI

- Typing rates by viewer task: recognising a command about 82-85 characters per second; reading content 21-24 per second in bursts; a short result burst about 84; human authoring 30-45; field fill about 70; narrated UI 25 per second; long prompts 70-85 per second in bursts of 3-6 characters per frame.
- Letter-by-letter typing is only for the product's own input field, with an authored irregular rhythm (bursts, a pause after a space, a slower last word); a metronomic character per frame is a slop tell. Never type a headline; never type placeholder text (placeholder is grey and clears in one frame). Arabic is never typed letter by letter (see ice-arabic).
- Caret: appears about 0.04 s (1 frame) before the first character; solid while typing; blinks only in idle waits after typing, on its own clock (half period 0.2-0.4 s, steps); omitted when the field shows a result. A prompt ends without a full stop and holds about 0.5-0.6 s with a blinking caret before the cursor moves.
- Agent working state: status text per whole word, blur 12 px and opacity 0.1 to sharp in 4-5 frames, then two shimmer passes (band about 0.23 W, 13 frames each, about 6 frames apart); no spinner, no dots, never per character; one persistent marker that never flies in from above and never bounces; honest thinking states, not an endless shimmer.
- Logs and feeds: start populated and moving, accelerate from about 6 to 250 px per frame over about 55 frames, decelerate over about 9 frames onto one readable block held 0.8 s.
- Output stats appear whole; control-driven values animate. Timecodes and scrubbers creep sub-pixel, never tick.

## 5. Showing UI

- Crop to one object and magnify: modal or dashboard 1.4-2x, one card or button 2.3-4.4x, then pull back; keep the top and bottom about 28 percent of the frame empty around a magnified card; readable text at least 4 percent of height.
- UI is a magnified fragment with identity (real icon, sender, time, a sentence a person would write), cropped by the frame edge, readable by camera, never by inflated type; a window to be read takes about 70-80 percent of frame width.
- Never show nav bars, footers, cookie banners, URL bars, scrollbars, window controls, real OS cursors or browser chrome.
- A scene opens on UI already built and moving; a product shot lifts from near-black over 9-30 frames with a colour wash sweep, not an opacity fade.
- Highlights are content-hugging rounded rectangles drawn on then off; never a thin frame or a circle on a menu row; highlights animate on after the text settles, never pre-applied.
- Annotations on scrolling or moving images are pinned to content coordinates, not screen coordinates.
- One close-up per operation; the camera follows the hand between them; the wide shot only when the relation is the point.
- A prompt-box plus send-arrow plus cursor-click beat is already a cliche of AI-product films: use only when the product really is typed into, and make the result the hero.

## 6. Timed recipes (30 fps, starting points, never defaults)

| Recipe | Frames | Shape |
|---|---|---|
| Prompt, send, agent result | about 205 | prompt types, cursor parks, press, working state, result lands, hold |
| Toggle, cascade, claim | about 175 | toggle 2 frames, cascade 5-7 items, claim lands |
| Drag, drop, output cascade, headline | about 135 | |
| Checklist to reveal | about 165 | |
| Carousel select to form commit | about 270 (two clips) | |

Each needs one specific case with stakes, real and slightly odd content, and the consequence shown before the claim.

Sources: motionmaxxing (ui-demo.md, motion.md), hyperframes skills (cursor-click-ripple, cursor-drag, multi-cursor, physics-press-reaction, press-release-spring, control-target-sync, camera-cursor-tracking, oversized-cursor, typing rules), product-launch-motion (05 cursor and click stack, technique), Barty-Bart motion-broll, community vox-explainer, ideas from onetake, video-talkcraft (rewritten).
