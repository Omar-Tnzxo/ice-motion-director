# Physics, character motion and shape morphing

Animation principles as engineering, physical recipes with frame counts, morphing rules and loops. Character drawing, rigs and art-style specifics belong to the ice-styles skill; logo vector preparation to ice-lottie.

## 1. Principles as engineering

- Write the action as one sentence (subject, intention, force, destination, feeling); rank primary and secondary actions; block named phases and poses before choosing curves; prefer a phase table to one opaque easing expression.
- Phase vocabulary: rest, anticipation, commitment, passing pose, apex or decision, contact, overshoot, settle. A button press: rest, press, contact, overshoot, settle. A camera move: establish, accelerate, reveal, brake, settle.
- Build order: constraints and contacts, then a readable primary path with the subject as a plain shape, then poses and deformation at force events, then follow-through, then secondary action, then accents (smear, blur, particles, shake) only where speed or impact justifies them.
- Keep position and velocity continuous across phases unless there is a deliberate hit or cut; one state evaluator; derive velocity analytically or by central differences; lock the trajectory at the commitment event.
- Drive stretch, cross-axis squash, smear length, appendage lag, impact compression and shake amount from sampled speed and force, normalized to subject size; clamp exaggeration.
- Follow-through without simulation: sample the primary at time minus a delay; vary delays and amplitudes down the hierarchy; closed-form damped oscillator for recoil; seeded noise evaluated from time.
- Pivots: ground contact for landing, pressed surface for buttons, attachment point for hanging objects, joint for swings; recompute position after scaling so the anchor does not drift.
- Tuning order: contacts and bounds, key poses and silhouette, phase durations and spacing, path and orientation, squash and overshoot and settle, overlap and secondary, then accents.
- Defaults to avoid: one linear progress for every property; a symmetric parabola assumed to make a good jump; bounce or elastic without a named force and pivot; continuous squash and stretch; secondary motion leading the primary; exaggerating every channel.
- Review: the action reads from a few stills; anticipation points toward the coming action; path, orientation and deformation agree with velocity; impact scales with incoming speed; secondary starts later and settles later; holds do not freeze every channel (where the hold policy allows life); no effect hides a weak pose.

## 2. Ratios and timings

| Element | Values | Scope |
|---|---|---|
| Anticipation : action : follow-through | about 20 : 50 : 30 (a 1.5 s reveal: about 0.3 s, 0.75 s, 0.45 s); logo pipelines also use 1/5 : 1/2 : 3/10 | Logo stings, character, physical beats |
| Anticipation | 0.15-0.3 s, about a quarter of the action's size; 20-30 percent of the main action's duration at any time scale; never an empty delay; never anticipate text; motion with no anticipation reads as a glitch on brand entrances | Physical actions, logos |
| Small anticipation | 8 px over 0.05 s; x and y on different eases so the path bows; leave a one-frame gap, never butt-join | UI and launch films |
| Follow-through | segments lag 0.05-0.1 s each, swing scaled 1 + 0.15-0.2 per segment; drag hierarchy offset 2-4 frames (about 35-70 ms at 60 fps); not for stiff materials (wood and metal do not whip), not for rigid UI | Character, organic, logos |
| Settle | nothing stops dead: one overshoot of 4-8 percent then a decay, at rest by 0.3-0.5 s; heavier things overshoot less and take longer; not on type being read while it lands | Physical objects (scope of overshoot: see `timing-and-easing.md` section 7) |
| Commercial action at 60 fps | 3-8 frames anticipation, 6-18 frames travel, 1-3 frames contact deformation, 6-16 frames damped recovery; larger or softer objects need more, rigid UI less | Commercial films |
| Stagger of parts | 10-20 percent of a part's own duration; never all parts starting or stopping on the same frame (the most common mechanical-motion mistake); heavier parts move slower | Logos, assemblies |
| Assembly | parts back to front, 0.08-0.12 s apart, at most about seven in flight at once | Reveals |

## 3. Physical recipes

- Squash and stretch: personality-gated. Playful brands 10-25 percent (volume-preserving, for example 1.2 x 0.85, never 1.2 x 1); professional brands plain scale (0 percent); about 5 percent at 100 ms, up to 30-40 percent only in deliberate 1.2 s and longer brand moments. Landing squash 0.8 vertical by 1.15 horizontal recovering over 30 percent of the bounce. Contact squash 1.25 x 0.8 for about 60 ms on hops; flight stretch up to 1.15 x 0.9.
- Smear frame: stretch the object 150-300 percent for exactly one frame (cel and drawn styles).
- Throw or drop, attraction or magnetic merge, rigid UI closure, delete into a bin, the physical decision contract, sound coupled to motion phases and the semantic material matrix: use `timing-and-easing.md` (section "Motion choreography recipes") (the founder's original recipes).
- Contact: dust, a splash or a compressed shadow on the frame of the hit, clearing over 0.4-0.8 s, sound on the same frame.
- The world answers: secondary elements driven from the primary at a delay (grass bends in the wake, rings spread), never drawing the eye off the subject at the moment that matters.
- Press and release: linear press, spring release. Press scale 0.88 / 0.92 / 0.96 (never below 0.85 or above 0.98); press 0.10-0.30 s, release 0.40-0.90 s; same press scale on cursor and button in a shared array, or cursor compresses more (0.80-0.90) than the target (0.92-0.97). Details for UI demos: `cursor-and-ui.md`.
- Living assets in illustrated worlds (when the hold policy allows life): sway plus or minus 22-28 px over 1.3-1.8 s with a small rotation of about 1.5 degrees and a slow scale over the scene, different phase per object (plus or minus 10 px over 2 s looks static); idle torso about 1.1 degrees over 1.7 s, blink 0.1-0.15 s at uneven gaps, chest over 3-4 s.
- Stepped motion: hand-made, printed, cut-paper and doodle material animates on twos (each pose held 2 frames at 24 fps, 12 drawings per second) or on threes for holds, while camera and important spatial motion stay smooth. Never mix step rates inside one moment (it reads as a bug). Cutouts drop in one frame with a light contact; stamps tilt a few degrees and land in a one-frame snap. Never line boil or stop-motion jitter on finished clean drawings.

## 4. Shape morphing

- Morph only when the viewer can answer why A becomes B; a morph between strangers is a wipe. Prefer morphing the same object between states over spawning new objects when continuity matters.
- Equal vertex counts and a matched first vertex (same start point and winding) or the shape knots; resample both shapes to equal point counts with aligned starts.
- Complex A to B goes through an intermediate primitive (A to circle or capsule to B), each half 8-12 frames, with 10-15 percent squash and stretch plus slight rotation, on an in-out curve such as (0.7, 0, 0.3, 1) with 3-frame cushions; check every midpoint still.
- Morph from primitive (logos): proportions 25 : 50 : 25 between few-knot paths with identical command structure; cross-fade fallback only when structures differ.
- Card and container morphs: 0.6-1.2 s on an in-out ease, never back or elastic (overshoot fights the shape change); a container morph glide about 0.8 s with the camera on the same curve; author the layout at its final state and fake the collapsed state with transforms; grow 0.35-0.6 s power3.out (below about 0.3 s pushed content teleports), collapse 0.2-0.35 s power3.in; growth needs a cause (a click, a wrap, a status) or it reads haunted.
- Morph a dot into a tile by drawing the final tile and scaling it down into a circle with a matching radius, then tweening back to scale 1 (never tween width and height).
- Liquid: a wave-front mask with 3-5 phase-offset bulges; metaball look by blur then alpha threshold; a neck snaps with a rebound of 2-3 frames each end; liquid is flung, never moved at a constant speed ((0.22, 1, 0.36, 1)); secondary drops lag 2-3 frames and squash on landing; melting picture flows down with round-headed drops.
- A faint ghost of the start state sells the change: a dim outline where the button or card began lets the eye follow the move.
- Theme or skin morph: nothing tweens but opacity, the anchor never moves (see `cut-catalog.md`).
- Name morph across identities: flip per glyph left to right at about 2 frames at 60 fps with a fixed anchor; never crossfade two names.

## 5. Drawing on

- A drawn line must land on something; trim paths follow the natural reading or construction order at a visually even speed; each stroke takes the time its length asks for (stroke time = length / pen speed, minimum about 0.04 s per stroke).
- SVG path draw: segment 0.3-0.8 s; the next segment starts at 70-80 percent of the previous; lead-in about 0.2 s; fill or brand fade after the last stroke plus about 0.2 s over 0.3-0.8 s; strokes power2.out or linear, never back or elastic (pens do not bounce); overestimate length by about 5 percent; draw-on shape 10 : 70 : 20, fills fade in during the last 20-25 percent; multiple strokes staggered 10-15 percent of one stroke in writing order.
- Hide a path until its cue: round or square caps at zero dash length show a dot at the start (butt caps avoid it); dashed lines open with a clip, not a dash offset.
- A fade standing in for drawing is a tell in drawn registers: marks are made in the order a hand makes them.

## 6. Loops and periodic motion

- Seamless: identical first and last frames in position, opacity, colour and perceived velocity; integer wave cycles; closed rotations; wrapped drift; recycled emanation rings.
- Repeated fields need phase offsets by index, distance, row or path position; lockstep pulsing reads mechanical.
- Concurrent idle elements: divide amplitudes by sqrt(N) and stagger periods (illustration only: 2.6, 2.9, 3.3 s).
- Sine idle (where allowed): scale amplitude 0.008-0.015 default (0.02-0.04 only for isolated, short, kinetic uses); y 2-3 px; period 1.5-3 s (2.5-4 s for long idles); prefer reveal, then jitter, then breath; at the upper end across 5 or more consecutive scenes the film reads as shimmering.
- Ambient glow bloom: breathe period 2.5-4 s, amplitude 0.02-0.05 opacity or 0.01-0.03 scale; a sweep passes once in 0.8-1.6 s fully off-surface; shimmer passes 1.2-1.8 s in whole numbers, killed at the resolve.
- Flow (belts, particles): store a tweened distance and compute positions as (seed + flow x speed) mod span; constant speed after a smooth start.
- Position of particles and simulations is a pure function of time; anything needing integration is simulated once at load from a fixed seed.

Sources: vibe-motion disney-animation-rule (ideas, rewritten), pixel2motion (twelve principles for logos, reveal patterns), hyperframes skills (rules: anchored-layout-expand, card-morph-anchor, particle-burst, press-release-spring, sine-wave-loop, ambient-glow-bloom, svg-path-draw), anidoodle (motion deck acting cards), mg-styles-15 (morph, liquid, cel), Barty-Bart motion-graphics, charlie947 motion-graphics, herk-edit-kit (motion-showreel), huashu-art-motion, motion-video-kit, product-launch-motion, reelmimic, lemo-opuscar, commercial-motion-design (founder), ideas from onetake, imMamdouhaboammar (rewritten).
