# Timing and easing

Rules for durations, ease direction, staggers and overlap. Measured values from human-made films are in `measured-motion.md`; spring and curve formulas in `springs-and-curves.md`. Reading time of text is owned by the ice-type skill; beat and phrase grids by the ice-audio skill.

## Contents
1. Ease direction
2. Duration tiers
3. Variety rules
4. Entrance and exit asymmetry
5. Stagger and overlap
6. Scene phases and offsets
7. Overshoot policy (scoped)
8. Spacing, phases and long moves
9. Timing anchors and drift
10. Mechanical rules that keep timing true

## 1. Ease direction

| Motion | Ease family | Why |
|---|---|---|
| Entering, landing, arriving | Ease-out (decelerate): "arrive and settle" | Ease-in on an entrance feels sluggish |
| Leaving | Ease-in (accelerate) | Ease-out on an exit feels reluctant |
| Moving between two on-screen positions | Ease-in-out or a spring | Both ends are at rest |
| Impacts (stamp, slam, drop onto a mark) | Ease-in into contact, then a short settle | An impact is an acceleration |
| Progress that represents time, constant rotation, belts, drifts | Linear | Constant rate is the meaning |
| Camera | Smoother than the objects in it; ease-in-out on segments | Abrupt camera stops feel cheap |
| Discrete states (typing, blink, counters, dial states) | Steps, never tweened | The step is the effect |

- Never linear for spatial movement unless mechanical motion is the intent; never the engine's default ease ("default ease everywhere is an opinion, not a decision").
- Under about 150 ms use ease-out only; 150-400 ms ease-out or a custom curve; 400 ms and longer may use a full ease-in-out.
- A front-loaded ease-out (power3 or power4 out) on a long move (over about 1 s) front-loads about 90 percent of the travel and then crawls: use an in-out ease or the three-phase nudge curve for long travel (section 8).
- Smoothstep everywhere makes every move the same soft S-curve: pick curves by how fast they reach 80 percent of travel (fast snaps reach it at about 23 percent of the time) and by the move's job.

## 2. Duration tiers

| Tier | Seconds | Reads as | Typical use |
|---|---|---|---|
| Instant | 0.15 | decisive | state flips, hard swaps |
| Fast | 0.15-0.3 | energy, urgency, confidence | small UI elements, words, presses |
| Medium | 0.3-0.5 | professional, most content | cards, lines of type, panels |
| Slow | 0.5-0.8 | gravity, luxury, contemplation | hero entrances, hook and end card |
| Very slow | 0.8-2.0 | cinematic, emotional, atmospheric | camera moves, reveals, dissolves in calm films |
| Camera moves | 1.5-3 (commercial default), 0.6-1.5 push, 0.8-2 pull (explainers) | intent | see `camera.md` |

Product UI timing table (also the base for UI moments inside films): press, toggle, colour, hover 70-150 ms; small state change 150-250 ms; medium (popover, tab indicator, card, toast) 200-350 ms; large (dialog, sheet, page) 250-450 ms, mobile full screen up to 500 ms; brand moments and number rolls 500-1000 ms; exits 50-70 percent of the entrance.

Larger travel takes longer; tiny UI is short, not theatrical; vary duration with the distance travelled and the mass, never one global preset. "Never give every move the same 0.4 s."

## 3. Variety rules

| Rule | Value |
|---|---|
| Different eases per composition | At least 3 easing characters across the beats (calm sine or power1, standard power3, punch power4 or expo) |
| Same ease reused | No more than 2 independent tweens with the same ease in one scene |
| Speed contrast | The slowest scene about 3x slower than the fastest |
| Entrance directions | Vary: from left, from right, from scale, opacity only, letter spacing; never `y: 30, opacity: 0` on everything |
| Staggers | Not the same stagger in every scene |
| Similar elements | Share one ease and duration intent (consistency inside a group, variety between groups) |
| Per-property orchestration | Locked (start and end together) for UI and mechanical sync; lead and follow for logo, hero and organic; early opacity with late settle for readability; single-property overshoot (only scale or rotation overshoots, position stays controlled) |

## 4. Entrance and exit asymmetry

- Entrances need longer than exits (a card takes about 0.4 s to appear and about 0.25 s to leave). Exit about 50-75 percent of the entrance; a velocity-matched cut inverts this (entry about 127 percent of exit, see `cut-catalog.md`).
- Entrances: 2 or 3 decaying channels together (offset plus scale or blur plus opacity), never opacity alone. Opacity is a helper, short (0.12-0.3 to 1 over 4-6 frames). Scale alone reads as a zoom.
- Never grow from zero and never fade up from nothing: start at 0.92-0.97 scale with opacity, or arrive from oversize (1.4-5x) and come down (see `measured-motion.md`, start oversized).
- A single entry stays at or under about 0.8 s.
- Exit with new motion, not the entry reversed: reversed motion reads as an undo. Exception, when calm or reverse symmetry is the point: what arrived over 0.5 s on a settling curve may leave over 0.25 s on an accelerating one along the same path.
- Exits on non-final scenes: see the scoped rule in `transition-policy.md` (in some grammars the transition is the exit).

## 5. Stagger and overlap

| Rule | Value |
|---|---|
| Group cap | Total stagger under about 500 ms regardless of item count (a whole wave under about 0.6 s reads as one gesture) |
| Per-item step | 30-80 ms for groups; frame-based: words 3, cards or list items 4-5, big blocks 6 frames at 30 fps |
| Cap formula | step = min(step, cap / max(1, count - 1)); spring-pop variant min(0.06 s, 0.5 s / item count) |
| Offset vs duration | Each offset clearly shorter than the animation it offsets (run each move about 2x longer than the gap); an offset longer than the animation becomes a queue |
| Measured human stagger | Onsets 1-3 frames apart with uneven gaps; 56 percent of sibling gaps are 1 frame; per-group median 3 frames; overlap ratio median 0.5 |
| Irregularity | No two elements share a start or an end time; never a metronomic constant interval (except a deliberate technical ident) |
| Cascades | Overlap, do not queue: the next element starts within about 2 frames of the previous settling, and gaps shrink |
| Readable groups | Check offset x (n - 1) + duration finishes before the next cue |
| Supporting delay | Compact UI 2-8 frames; expressive scenes 4-14 frames; scene-level beats 50-80 ms |
| Counted items | 0.10-0.15 s per item, only for 2-4 items |
| Never | Everything entering at once (reads as a slide transition); staggering with glitches |

Overlap law for two-stage moves (one element doing two consecutive moves): overlap the second stage by about 39 percent of a stage (usable band 35-45 percent) on a sharp in-out curve; below about 25 percent the corner hardens, past about 50 percent the two stages stop reading as two. The composite speed between the stages must never reach zero. Give the second stage a job (a word lifts to clear the space the next line reveals into). One wrapper per stage, each wrapper owning exactly one property.

Two sequential moves on the same subject that are not designed as stages read as a glitch: merge them into one gesture with one shared ease, landing on the same frame.

## 6. Scene phases and offsets

- Scene shape: Build (0-30 percent: elements enter), Breathe (30-70 percent: the content is read; what stays alive here is a scoped decision, see `holds-and-stillness.md`), Resolve (70-100 percent: exits or handoff; exits faster than entrances).
- Beat shape: prepare, move, settle, hold, hand off. The hold is where understanding happens.
- Do not start at t = 0 inside a scene: offset the first animation 0.1-0.3 s; zero delay feels like a jump cut. Exception: films that open mid-move (frame 0 already moving, see `seams-and-carry.md`).
- Reveal timing for narrated films: weight reveals to the back half of a shot; at t = 0 a frame carries only what the voice is saying at t = 0; do not dump everything in the first 25 percent. One beat can carry two cues, never three.
- Two things "at the same second" overlap for a few frames: give each a separate end and start (one finishes leaving before the next lands).
- Rhythm is named before it is built (illustration only: "fast-fast-SLOW-fast-accent-hold", "hook-hold-CTA", "slow-medium-FAST-slow"); derive it from the storyboard and the brand, not from a lookup.

## 7. Overshoot policy (scoped)

Sources disagree; each rule holds in its scope.

| Policy | Holds in | Values |
|---|---|---|
| No overshoot at all | Data story, fintech, health, government, legal, luxury, calm brand film, any number or counter, text meant to be read while landing, camera | Critically damped (z = 1); "a counter must never fly past its value and fall back"; spring or back on a camera reads as the world wobbling on a string |
| Tiny overshoot (alive, not bouncy) | Product launch, app ad, UI walkthrough, social short, most brand films | Spring damping 0.72-0.9 (about 1-1.5 percent at 0.80-0.85); `back.out` strength at or under about 1.4-1.7 on entries; overshoot under about 2 percent on logos |
| One visible physical reward | Consumer product launch, app ad, hype promo | At most one visible springy payoff per film (a few percent up to 12 percent on one object), or a press release rebound of about +5 percent; `popOver` peak 1.08 |
| Playful overshoot | Kids, playful consumer brands, mascots, kinetic type with comic intent | Bounce 0.2-0.35, `back.out` up to about 2, squash 10-25 percent; never on text, data or the camera |
| Measured broadcast exceptions | News reel (edit type `news-reel`, style family `family-broadcast-news.md`), one element row at a time, each with its reason row | The title pill's overshoot of about 34 px at 1080 wide (about 3 percent of frame width) peaking 3 frames after the landing (`atomic-moves.md` section 7, "Title pill"); the measured circle drop of the English package, outBack with about 11 percent overshoot on its first drop only (later drops 0 percent, outQuad); never on captions, counters, data or the camera |
| Banned | Everywhere | `bounce.out`, `elastic.out` as a house style; cartoon bounce on a professional product; overshoot on opacity (overshooting curves go on transforms only) |

Measured: only 8.8 percent of human moves overshoot by more than 3 percent; 88 percent of those peak late (median at 65-70 percent of the duration), median 19 percent of their own travel. "Smooth beats bouncy" is the default when the brief says nothing; "bouncy is the number one instant turn-off" in machine-made launch films.

## 8. Spacing, phases and long moves

- Three-phase nudge curve for long slides and camera travel: ramp-in power3.in (about 10 percent of distance, 20 percent of time), linear burst (about 65 percent, 18 percent), power4.out tail (about 25 percent, 62 percent). The tail is at least 3x the ramp-in in time. Reveal new content during the burst. Reference: 270 px in 0.57 s.
- Speed comes from big spacing jumps after short anticipation, overlapping outgoing and incoming action, short readable holds and asymmetric acceleration and braking. Avoid constant speed, uniform easing, a hard cut every second and equal-priority simultaneous actions.
- Readable target, then fast exit, then slowing arrival: change speed, never drift at a constant rate (except an intentional linear creep).
- Phase vocabulary for any event: setup, anticipation, commitment, impact or passing pose, brake, settle. Deformation, blur and recoil belong only around force events; not every beat needs a bounce.
- The final 10-20 percent of a move must feel intentional, not like numerical drift.

## 9. Timing anchors and drift

- Anchor every event to the thing that motivates it: the measured start of a spoken word (narrated films), a measured beat or hit (music-led films), the on-screen action, or reading time. The beat grid and word timing are owned by the ice-audio skill; this file only says what is anchored.
- Which clock a film runs on (voice, beat grid, hybrid or neither): the `ice-audio` skill, `references/cue-map-and-beat-sync.md` section 1.
- Event trigger and entrance duration are separate decisions: the anchor says when, a local duration gives the arrival its character. For a lead or lag, derive a named offset (for example anchor + 5 frames) instead of moving the anchor.
- Leads: reveals that must be complete when spoken lead the word by up to 0.16 s; text lands 0-2 frames before its word; reactive entrances may fire 0-45 ms after a hit; moves that must land on a beat start about 40-190 ms early; hard hits are 0 ms and never eased ("easing a hit kills it").
- Never place internal events at fixed fractions of an outer window (20, 50, 80 percent); give each meaningful action its own trigger.
- A fixed time does not move with pace changes; prefer cues.
- Absolute timestamps for tight spots under about 30 s; auto-chained scenes for long-form where scenes flex (drift compounds across the timeline).

## 10. Mechanical rules that keep timing true

These hold in every engine (engine syntax is owned by the ice-engines skill):
- Every frame is a pure function of time; no wall clock, timers, unseeded randomness or state carried between frames. The banned list and its replacements: the `ice-engines` skill, `references/determinism.md` section 1.
- `fromTo` with explicit start values; absolute values, never relative increments.
- Never two tweens on the same property of the same element at overlapping times; put one on a parent wrapper.
- Animate transforms and opacity, not layout properties (width, height, top, left, font size): layout properties snap to whole pixels and micro-stutter on slow tails. Grow type with scale, never font size.
- A count-up rounds with round, not floor, and lands exactly on the value.
- An easing solved numerically must return exactly 0 and 1 at the ends; every progress helper returns exactly 1 at or past its end.
- The frame timeline finishes before the clip ends (leave at least about 0.15 s) and the clip duration covers its last tween; a tween ending between two frame samples never renders its final state, so end it on a frame.

Sources: hyperframes skills (creative motion-principles, video-composition, animation adapters and rules, motion-doctrine), hyperframes docs (motion.mdx, claude-design guides, anatomy), motionmaxxing (motion.md, director.md), motion-interaction-studio, product-launch-motion (04 motion grammar), claude-remotion-skill, diffusionstudio lottie, pixel2motion, herk-edit-kit (video-storytelling, motion philosophy), community vox-explainer (overlap law), commercial-motion-design (founder), ideas from hypit, imMamdouhaboammar (rewritten).


## Motion choreography recipes

> From the founder's commercial-motion-design skill (Omar-Tnzxo, Apache-2.0 in this repo), references/timing-and-easing.md (section "Motion choreography recipes"). Changes: dash characters replaced; the matrix example row is marked illustration only.


Use these as starting contracts, then tune frame counts to the measured music and the object's scale, mass, and material. Do not paste the same recipe onto every object.

### Physical decision contract

For each moving object record:

```text
mass impression / rigidity / dominant force
start pose / anticipation pose / travel path / contact pose / recovery pose
position path independent from timing curve
peak speed frame / contact frame / final rest frame
secondary parts and follow-through delay
camera response / sound response
```

At 60fps, a crisp commercial action often uses 3-8 frames of anticipation, 6-18 frames of travel, 1-3 frames of contact deformation, and 6-16 frames of damped recovery. These are defaults, not quotas. Large or soft objects need more spacing and recovery; rigid UI state changes need less deformation.

### Recipes

#### Throw or drop

- Establish a source and destination; never spawn the object mid-flight.
- Use a curved spatial path when gravity acts. Keep path geometry separate from speed interpolation.
- Rotate according to angular momentum, not a decorative constant spin.
- Accelerate downward during free fall. At contact, compress along the collision normal and widen perpendicular to it while approximately preserving volume.
- Reverse with lower energy for a bounce, then shorten each subsequent interval and displacement.
- Delay flexible appendages, shadows, dust, or container response by 1-4 frames for follow-through.

A simple screen-space ballistic path is `p(t)=p0+v0·t+0.5·g·t²`. Treat `g`, restitution, and damping as art-directed parameters; the trajectory still needs internally consistent acceleration and contact.

#### Attraction, suction, or magnetic merge

- Show the force source before the object accelerates.
- Begin with low velocity, increase acceleration as distance closes, orient the object toward the field, then compress or merge at contact.
- Use overshoot only when the receiving material is elastic. A rigid lock should stop sharply with a small structural response instead.
- Pull particles, trails, and audio pitch toward the same attractor; do not let decorations orbit independently.

#### Rigid UI closure

- Select or mark the affected range first.
- Remove the range on the approval/contact frame.
- Move downstream elements by the exact removed distance; keep linked media synchronized.
- Add only slight overshoot if the interface language supports it. Do not squash rigid timeline clips like rubber.

#### Delete into a bin

Bad: floating bin icons, identical cubic eases, no source, gravity, contact, or container reaction.

Better causal chain:

1. Selected fragments detach from their exact timeline locations.
2. A bin, aperture, or absorbing target opens and becomes the force source.
3. Fragments travel on individually offset but coherent arcs, with spacing that communicates acceleration.
4. Each fragment crosses the rim before disappearing; the rim or lid reacts on contact.
5. The final impact drives the timeline ripple closure.
6. The cleaned timeline, not a duplicate proxy, becomes the next scene's owner.

Use suction instead of gravity only when the target visibly emits that force. Never mix both without a readable change of force.

### Sound-driven motion

Map one visible cause to one sound identity:

| Motion phase | Sound role | Coupling rule |
|---|---|---|
| Anticipation | breath, charge, short reverse | envelope rises with visible stored energy |
| Travel | whoosh, friction, tonal glide | loudness or pitch follows speed, not elapsed time |
| Contact | click, snap, hit, cut | transient lands on the exact contact frame |
| Recovery | resonance, debris, tail | decay ends with visible settle |

Music defines phrase and impact opportunities; it does not excuse moving every object on every subdivision. Preserve rests and let secondary motion answer primary hits.

### Semantic material coverage matrix

Complete this before motion implementation:

| Claim | Observable evidence | Material property | Causal transformation | Next owner | Unrelated decoration removed? |
|---|---|---|---|---|---|
| Illustration only (one product, never a default): remove pauses | selected gaps and linked clips | absence + compression | gaps detach, target absorbs, timeline closes | cleaned timeline | yes |

Every primary claim must have observable evidence and a transformation. The same material may span scenes only when it is connective tissue with the same meaning.

### Evidence basis

- [Walt Disney Animation process](https://disneyanimation.com/process/animation/) identifies timing, staging, squash and stretch, anticipation, follow-through, secondary action, weight, and movement as foundations of believable performance.
- John Lasseter's [SIGGRAPH paper](https://dl.acm.org/doi/10.1145/37401.37407) applies traditional animation principles to computer animation.
- School of Motion's [Power of Animation Principles](https://www.youtube.com/watch?v=mT2Fv5bF6Ik) demonstrates how spacing changes the feel of motion and reviews arcs, anticipation, and timing.
- BUCK's [EA SPORTS FC 24 motion system](https://buck.co/work/ea-sports-fc-24) derives trajectory, formation, momentum, and match cuts from football rather than generic easing.
- [Material choreography](https://m2.material.io/design/motion/choreography.html) separates outgoing, incoming, and persistent elements and recommends shared transformations over competing independent movements.
- Ben Marriott's [animated intro workflow](https://www.youtube.com/watch?v=Ut8bDuNqbLo) shows frame-level cleanup and integrates dedicated music and sound design with animation.

These sources support the principles; numeric frame ranges and equations above are implementation heuristics inferred for short 60fps commercial work.
