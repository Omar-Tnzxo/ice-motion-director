# Minimal motion for talk-driven films

Spine stage 07. In a voice-led film the picture supports the words; motion that competes with the voice is noise. Exact easing curves, springs and the transition catalog are in `ice-motion`; this file holds the explainer doctrine and its scopes.

## 1. Why explainers look like slideshows

The four causes of the slideshow look in narrated films and their fixes: the `ice-motion` skill, `references/anti-slideshow-and-density.md` section 1. Fix the cause, not the symptom: adding wobble to pass a motion check makes a different defect.

## 2. Layer budget

A shot has up to seven layers: camera, focus, subject, attached effects, supporting cast, environment, masks. Hero moments run 4 to 6 active layers, transitional shots 2 to 3, rest moments only the camera.

## 3. Element life cycle

- Enter, hold, exit. Entrance length and entrance versus exit asymmetry: the `ice-motion` skill, `references/timing-and-easing.md` section 4. Exits for narrated explainers: same skill, `references/transition-policy.md` section 4.
- One accent hit at a time. Only one element enters at a time.
- One subject per beat, how the old subject yields (real exit, demote in place, camera leaves), the three-step handover, subject-group and element limits, the empty quadrant: the `ice-motion` skill, `references/composition-and-staging.md` sections 1, 4 and 5. A fourth subject group needs one to really exit first.
- Layout events (recomposition, host form change) 2 to 4 per minute, only on a new argument, a chart swap, a before and after, or a conclusion; never on a timer.
- Two sequential moves on one subject (merge them into one gesture): the `ice-motion` skill, `references/timing-and-easing.md` section 5. The pause between a major action and its result: the `ice-motion` skill, `references/holds-and-stillness.md` section 2.
- The viewer tracks one or two simultaneous animations; never more.
- Settle: after the last element of a shot lands, hold 1 to 1.5 s (30 to 45 frames) with no new elements, no camera moves and no HUD changes before the exit. "Enter then freeze for seconds" and "land then cut immediately" are both defects.

## 4. Stillness policy (scoped)

Hold policies and the rules shared by every policy: the `ice-motion` skill, `references/holds-and-stillness.md` sections 1 and 2. Explainer type policy, in line with that file:

| Film type | Rule |
|---|---|
| Card and talk films (presenter or plain voice over cards and footage) | Elements hold dead still after landing. No idle wobble, breathing, sweeps or exposure pulses. Life in holds comes only from the camera |
| Diagram topic explainers | Sustained verb action: each caption block's verb has an on-screen action continuing to the next beat (data flowing, cells lighting, a dot traveling, typing). No element fully still for more than 3 s. If there is no verb, let it be still rather than add floating |
| Collage explainers | Idle sine loops (breathe, float, drift, glow pulse) are banned as sustained motion; pause at any second and something meaningful is mid-flight; slow creeps of 1 to 2 percent per second on a plate are legitimate |
| Cartoon stage and continuous-action films | The world is alive: many meaningful moving things (machines turning, water flowing, characters idling), and the hero never stops; slow background motion to about 40 percent for reading instead of stopping it |
| Kinetic type sections | Words never move after landing; motion comes from page changes, beat micro-punches and slight camera drift |

Everywhere: never add motion only to pass a metric; true stillness needs a verb action, tiny motion needs a larger motion, not more elements.

## 5. Camera policy (scoped)

| Film type | Rule |
|---|---|
| Card and talk films | Camera-only life: the slow scale curve per shot and its last key beyond the shot end (the `ice-motion` skill, `references/holds-and-stillness.md` sections 1 and 2, policy B). No pans, rotation, blur curves or shake on the scene camera. One camera technique per media segment (push plus pan reads as shaky hands) |
| Diagram topic explainers | Moves per chapter and per shot, move length, timing against glitches, entrances and the exit, the full-shot push exception: the `ice-motion` skill, `references/camera.md` section 7. Explainer values: push about 1.0 to 1.33 over about 33 frames toward the hero, pull back over 37 to 45 frames; above about 1.4 strokes look thick. A sentence with no new element may be covered by one 30-frame push |
| Calm product explainers without cuts | The camera is the editor: every scene change is a push, pull or glide (0.6 to 1.2 s, smooth or heavily damped), or a short blur dissolve; nothing bounces; after an action the camera pulls back for a beat so the viewer knows where they are |
| Collage | See `references/grammar-selection.md` (section "Collage explainers (archival desk style)") (camera smooth, elements stepped) |
| Whiteboard | Board pans; see `references/grammar-selection.md` (section "Whiteboard, hand-drawn and pen explainers") |
| Long-form persistent world | Named world windows and altitudes; see `references/run-setup.md` (section "Long-form explainers") |

When the camera moves, push density limits, overscan, raster sources and log-space zoom: the `ice-motion` skill, `references/camera.md` sections 1, 3 and 7. HUD and captions sit outside the camera rig and never move with it (same file, section 3).

## 6. Text-only shots

A shot of only text gets a companion schematic drawn to the line's meaning (icons, boxes, arrows, small labels): outline only, one stroke style, drawn on at near-constant speed then still; connectors draw before nodes light; labels large enough to read (otherwise they are decoration); the core graphic takes 20 to 45 percent of frame height. A schematic never replaces real footage when real footage exists.

## 7. Boundaries between segments (scoped)

| Film type | Rule |
|---|---|
| Card and talk films | Every boundary gets an explicit treatment; no bare cuts. Transition kinds per film: the `ice-motion` skill, `references/transition-policy.md` section 2 (a 100 s film has 5 to 7 boundaries). Reserve the strongest (a black slam) for the single biggest reversal |
| Diagram explainers | Write boundaries as "outgoing fades to zero over its last frames while incoming starts entering on its first frame"; a written "hard cut" made both sides wait and left blank frames. Exits before a cut reach exactly zero on a power curve; 0 to 4 frames of overlap, never blank frames |
| Collage and storytime | Hard cuts dominate, placed on punctuation and breaths |

Everywhere: transitions sit at breaths and topic changes, never mid-sentence. Carry across boundaries (same component and parameters, chapter openings carrying the previous hero): the `ice-motion` skill, `references/seams-and-carry.md` sections 5 and 7. Choose transitions from `ice-motion`; seam verification is in `ice-qa`.

## 8. Frame-rate layers

Smooth camera with stepped hand-made elements: the `ice-motion` skill, `references/physics-and-morphing.md` section 3. All smooth reads as corporate promo; all stepped reads as wobble. Smooth easing (a power-3 class ease) is the default for explainer elements; bounce and elastic are out, except storytime pose snaps and kinetic slams where a small overshoot is part of the grammar.

## 9. Scoped conflicts across explainer files (both rules hold, in their scope)

| Topic | Rule A, scope | Rule B, scope | Where |
|---|---|---|---|
| Stillness | Elements dead still after landing; life comes from the camera only (card and talk films) | A sustained verb action continues on screen; no element fully still over 3 s (diagram and topic explainers) | `references/minimal-motion.md` |
| Camera | One slow scale curve per shot, push 1.00 to 1.06, no pans (card and talk films) | Camera moves budgeted per chapter, push to about 1.33 toward the hero (diagram explainers); board pans (whiteboard); world windows (long-form) | `references/minimal-motion.md` |
| Cuts | Every boundary gets an explicit treatment, no bare cuts (card films) | Hard cuts on punctuation dominate (collage, storytime) | `references/minimal-motion.md`, `references/grammar-selection.md` (section "Collage explainers (archival desk style)") |
| Shot length | One idea per scene, 4 to 15 s, split by paragraph | One sentence per shot (short collage explainers, storytime) | `references/word-timed-segments.md` |
| Visual lead | Picture lands with or slightly before its word | Handwriting starts slightly after its phrase (whiteboard) | `references/word-timed-segments.md` |
| Captions | On by default for vertical, square and 4:5 social | Off by default; words live in the picture (cartoon stage, whiteboard, collage, persistent-world long-form unless asked) | the `ice-type` skill, `references/captions-system.md` section 2; `references/frame-and-text.md` |

Speaking rate and word budgets: the `ice-audio` skill, `references/voiceover.md` section 3.
