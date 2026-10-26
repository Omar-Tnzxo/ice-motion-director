# Seams and carry: continuity across boundaries

A film reads as one film when something crosses every boundary. This file owns the carry principle, the vector law, handoff planning and continuity tolerances. Seam construction numbers are in `cut-catalog.md`; seam verification scripts and gates belong to the ice-qa skill.

## 1. The carry principle

- At every section boundary something on screen survives and visibly moves, scales or changes role into the next beat. Scenes that are swapped by hiding one and showing the other are slides, even with perfect rhythm.
- Build a carry from one element changing, never from two elements crossfading: an observer sees a replacement.
- The eye follows objects, not abstractions: hand a concrete object across the cut at matched position and velocity.
- The destination is in place before the move starts: there is never an empty frame between scenes.
- Bare cuts belong inside a burst of hits, into the end card, or where something else carries (a match, the voice, the beat).
- Carry scoring (idea, rewritten): count a boundary as carried when a survivor moves at least about 2 percent of the frame diagonal or scales about 10 percent or more; as anchored when a large survivor stays unchanged (half credit); as bare otherwise. A film averaging under about half carried fails; under about 0.7 is a warning. In tests this separated accepted from rejected cuts where no rhythm metric did. A one-world camera film has few boundaries; judge it by eye. Measurement: ice-qa.

## 2. Kinds of carry

| Carry | How it works | Scope |
|---|---|---|
| Identity | One element transforms through the whole film (a dot, a card, a word) | One-shape films, logo stings, product launch |
| Container | The pressed thing becomes the result (container morph) | UI walkthrough, app ad |
| Aperture | A stage opens from the subject (iris from the thing the next scene is about) | Any |
| Push-through | The camera pushes through a card until it is the scene | Launch, explainer |
| Hop | The subject hops to the next item along drawn connectors at constant speed | Explainer, data story |
| Cast to lockup | The cast gathers and folds into the lockup | Endings |
| Cause | Each beat is the collision that starts the next | Hype promo, kinetic, comedy |
| Scale | Each level is drawn inside the previous one, so nothing is ever replaced | Data story, explainer, brand film |
| Hand | The cursor (or a hand) stays on screen across a boundary it caused; the cheapest carrier | UI walkthrough, app ad |
| Label | A label on one scene travels across the seam and lands as the heading of the next, on its first frame | Explainer, launch |
| Sound | J-cut or L-cut: the next scene is heard 0.3-0.8 s before it is seen, or the last scene heard 0.5-1.5 s into the next (sound design owned by the ice-audio skill) | All, at least twice in story films |
| Effect becomes environment | A burst becomes the next ground, a flood becomes the next background | Launch, hype |

Continuity devices ranked by strength: carried object; same pose and velocity; same layout geometry; transition that starts in A and finishes in B; blur-matched cut; running voice-over; effect becoming environment. Also: match cuts on shape, position, direction, scale, colour, edge or composition; a hero prop; a persistent frame whose absence is the accent; audio as the spine; beat-locked cutting; accumulation (nothing ever exits).

A carrier must move, scale or change role at every seam; a pinned object (the same small object at the same coordinates through three or more shots) is a slop pattern. A mascot or persistent actor that only watches is decoration. Shared colour alone is not identity; fade-replace is not transformation.

## 3. The vector law and the current

- How scene A exits determines how scene B enters: same axis, same direction, matched speed, cut mid-motion on both sides.
- On the Z axis, direction is the sign of the scale change. A receding exit answered by a grow-from-small entry is a mirrored vector: the most common violation.
- The incoming side picks up at least 50 percent of the way through the notional path.
- The current: one dominant screen direction per film (illustration only: a film may choose inline-start to inline-end, or always upward; in right-to-left languages the default follows the reading direction, see the ice-arabic skill).
- Reserved vectors carry meaning: upward = elevation or conclusion; Z forward = deeper into the same thought; Z backward = arrival; a scale burst = leaving a world.
- Never run consecutive seams in opposing directions. A direction change needs a visible cause (a click, a bounce, an impact) or a chapter boundary.
- Keep one wipe direction and one title position through a sequence of similar shots; rotate wipe direction only across acts.
- Screen direction is preserved across cuts (a subject leaving right enters the next shot from the left).

## 4. Handoff planning (write before building)

For every seam, write the exit state of A at its last 1-3 frames and the entry state of B at its first frame, as a contract:
- carried element and its id
- x and y position, size (percent of frame height), scale, rotation, opacity (state a constant explicitly: "opacity 1", never an omission)
- velocity (direction and speed), blur in px
- ground colour, on-screen text
- which word of a voice line falls on the cut, if a line spans the seam
- at least one other object already moving at B's frame 0

Rules: B's frame 0 equals A's exit state; cut at maximum velocity or just before a hold, never after a settle; overlap neighbouring shots by 6-12 frames when continuity helps (one shot owns the velocity, the next owns the destination); fast 60 fps ads may plan 8-18 frame overlaps unless music demands a hard cut.

## 5. Tolerances

| Check | Tolerance | Source context |
|---|---|---|
| Persistent object across a seam | same screen position and size within 2 px | drawn and canvas films |
| Match boundary anchors | within 1 px and 0.5 degrees (centre, size, rotation) unless a deliberate impact cut is documented | commercial films |
| Carrier rectangle continuity (gate) | 12 px centre, 5 percent size | HTML launch films |
| Carried object position | within about 0.02 of the frame | launch films |
| Zoom isolation pair | centres within about 30 px, sizes within about 10 percent | collage explainers |
| Seam direction | a turn of more than 30 degrees or a speed that drops or jumps is flagged | all |
| Speed match | warn at a speed ratio of 3; target within about 5 percent | all |
| Travelling lines | start exactly at the source anchor, end exactly at the destination anchor; a line ending in open space fails | all |

Same component with the same parameters on both sides of a seam makes the boundary frame pixel-identical. Match everything once: a property that flips on the cut frame pops. Measure positions at runtime after transforms (including glows, strokes, shadows); never hand-type screen coordinates when a world-to-screen function exists.

## 6. Root protagonist and role mutations

For films that must feel like one continuous product journey, use `continuous-journey.md` (the founder's original): one root protagonist with a state chain and role mutations, identity inheritance channels, state density over cut density, hard-cut records, text that acts, functional 2.5D, semantic closure and the rejection checklist. The machine-checkable form is the motion contract (`assets/motion-contract.example.json`, validated by `scripts/validate_motion_contract.py`). Additional carry rules from other sources:
- The brand often arrives best at the turn, near the middle of the energy curve, or the logo lands from the travelling object (the logo arrives by cause, never by default).
- Chapter openings carry the previous chapter's hero or symbol, shrunk or moved, instead of clearing and redrawing; the previous hero shrinks to about 0.6 and moves to a corner over about 16 frames rather than vanishing.

## 7. Opening and closing seams

- Open on motion at frame 0: a card already mid-open, a word already half-risen, a log already scrolling; never on a logo or an empty frame (exception: a piece that draws itself, where the empty page is the opening). Frame 0 must still be a finished composition (it is the thumbnail on many platforms).
- Within about 10 frames after any cut, a main visual is entering.
- Never open a shot with more than 1.5 s of empty stage before its first anchor.
- Close: return to the open (the last frame echoes the first, now understood), subtract (motion slows, parts leave, a breath, one soft last event), or land the mark from the travelling actor. One ending is stronger than two.

## 8. Edit hygiene that protects seams

- Edits re-open the seam: any change in the first or last second of a scene re-checks that seam; a voice regeneration re-opens every seam it moves.
- Elements are fully invisible before their reveal (not dimmed previews); do not mount semantic children before their reveal frame.
- Semantic content is atomic: card shell, icon, label and material appear together unless assembly is the action.
- Declare the expected count of state symbols (checks, cursors, logos) on every overlap frame; two checks visible is a duplicate state.
- The outgoing scene reaches zero ownership before the incoming takes over, except for a planned overlap with an occlusion path.
- Camera moves and full-frame wipes sequence, never overlap (camera first, then wipe; a cover layer goes opaque before the camera moves under it).
- Opaque stage background behind every seam (an unpainted root flashes white at seams in HTML engines; the fix is engine-specific, see ice-engines).

Sources: hyperframes skills (motion-doctrine vector law, cut-the-curve, product-launch-video handoff contract, seam-craft), community vox-explainer (motion continuity, seam gate), motionmaxxing (director continuity and handoff planning), anidoodle (relay and seam checks), motion-video-kit, product-launch-motion, herk-edit-kit (video-storytelling), diffusionstudio lottie, lemo-opuscar, ideas from onetake, anything2explainer, video-talkcraft (rewritten); commercial-motion-design (founder).
