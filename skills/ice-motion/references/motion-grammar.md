# Motion grammar: what every movement is for

Read this before choosing any move. It decides whether a movement exists at all; the other files decide how it moves.

## 1. Every movement has a job

A movement that does none of these jobs is decoration, and decoration is what makes a film read as cheap. Cut it.

| Job | What it does | Typical moves |
|---|---|---|
| Direct attention | Tells the eye where to look now | Entrance of the focal element, push-in, rack of attention, highlight sweep, cursor arrival |
| Carry continuity | Connects two moments so they read as one film | Carried object, matched cut, camera travel on one canvas, shape that becomes the next shape |
| Show change | Makes a state change visible: before, change, after | Morph, count during an action, bar growing from its baseline, container replacement |
| Express character | Gives the subject mass, mood, voice | Overshoot (mass, eagerness), slow heavy entrance (importance), jitter (instability), stepped timing (handmade) |

Product UI motion uses an equivalent four-question test (feedback, orientation, continuity, delight); delight is a small, rare, earned moment, never on routine actions. UI motion itself is owned by the ice-lottie skill.

### The sentence test
Before a move is built, name what it means in one sentence that ends. If the sentence cannot be finished, cut the movement. For each primary beat, also complete: "The viewer understands [claim] because [object] visibly changes from [state A] to [state B], causing [next state]." A beat whose sentence cannot be completed from rendered frames is rejected; a film where most primary beats fail is rejected as a whole.

### "Make it move" is the wrong instruction
Movement says something about the thing that moves. Four decorative movements are worse than one motivated movement. Find the one thing that is genuinely changing, let it carry the frame, and do not set everything else wobbling.

## 2. Motion follows meaning

| The content is | The motion should |
|---|---|
| A flow (pipeline, delivery, data moving) | Flow continuously along its path |
| A build or assembly | Assemble, part by part, in construction order |
| A countdown or discrete state | Tick in discrete steps, never tween smoothly |
| A route or journey | Draw in the direction of travel |
| A number that changes because something happens | Count while the cause is changing and stop on the frame the cause stops, never after |
| Data in a chart | Follow its own logic: bars grow from the baseline, lines draw left to right in time order, segments widen to their proportion |
| Something unstable or failing | Jitter, stutter, quantized steps |
| Something important arriving | A slower, heavier entrance than its neighbours |

Data and numerals: see the ice-type skill for counter typography and readability; this file only owns how the value moves.

## 3. Verbs before curves

Every element gets a verb. If you cannot name the verb, the element is not designed yet. Write beats as verbs, then choose curves.

| Family | Verbs |
|---|---|
| Impact | slams, crashes, punches, stamps, shatters, drops |
| Directional | slides, pushes, pulls, wipes, cuts |
| Reveal | draws, fills, grows, expands, assembles, counts up |
| Organic | floats, drifts, breathes, pulses, orbits, morphs |
| Mechanical | types on, clicks, locks in, snaps, steps |

Describe each primary beat as: subject + intention + force + destination + feeling. "Premium, smooth, cinematic" predicts nothing; a verb with a force and a destination does.

The transition is the verb, the easing is the adverb: the same slide reads confident on a sharp ease-out, dreamy on a slow symmetric ease, playful on an overshoot.

## 4. Cause and effect

- Every animated action visibly produces a result. Every prompt, click or toggle the film starts is answered on screen.
- Causal chain for physical beats: cause, compress, release, flight, impact, recoil, reveal.
- Effects start on the causing frame (same timeline position), never "shortly after". Reactions scale with implied mass: big elements rebound slower, small ones snap.
- Reactions of the world may start about 0.1 s before their cause completes; never after.
- A transition is strongest when an action on screen causes it (a press opens the next scene, an object collides with the next beat).
- Derive related motion from the relationship: the pointer arrives at the control it presses, a badge follows its object, a rejected drag returns from where it reached. When the layout changes, the action stays intact.

## 5. Priority and focus

- One focal motion at a time. Secondary elements follow, visibly subordinate; background motion never counts as progress.
- Motion priority order: product or functional motion, then camera and crop, then typography, then secondary UI or imagery, then decorative accents. Particles and glows never lead.
- The element that moves first is read as most important: stagger in order of importance (or reading order, spatial order, depth, causality), never in DOM or list order by default.
- Delay the supporting elements, never the focal one. A focal element that waits reads as lag.
- Stagger what is happening, not what is merely present.
- Hierarchy inside motion: only the focal element gets the strongest personality (overshoot, snap, expressive curve); support uses quieter curves.
- Compound properties only when they tell one story: two properties agreeing on one claim beat four properties each making a different claim.

## 6. Contrast is the message

- Uniform motion is as flat as no motion. Emphasis is a contrast effect: speed, scale, stillness and density must vary across the film.
- Emphasis is spent, not spread: big needs small around it, one lit thing per frame, at most about a quarter of the beats are "the point", endings usually get smaller.
- Importance budget per beat: 1 = connective (fast, small, a cut or a word swap), 2 = supporting, 3 = the point (slower, larger, held to reading time plus 0.5-1 s, its own sound). At most 25 percent of beats are a 3. Animating every line the same way is the most common machine-made tell.
- Spend scale once per film; spend each effect once; never a new technique every beat (a technique showreel is a slop pattern).

## 7. Physics and character, briefly

Physical motion (anticipation, follow-through, squash, contact, spacing) is detailed in `physics-and-morphing.md`. The grammar-level rules:
- Pick the smallest set of animation principles that fixes the perceived problem; do not force all twelve into a shot. Staging, slow in and slow out, timing, follow-through and appeal are the minimum.
- Judge spacing more than curves: wide spacing reads as speed, a short preparation then a big spacing jump reads as force, tight spacing near an apex creates emphasis.
- Use asymmetry on purpose. Equal up and down, identical easing on every channel and parts moving in sync read as mechanical.
- The primary motion must read without blur, particles, trails or sound. Effects never compensate for a weak pose, weak layout or missing product evidence.

## 8. Motion personality

Each film has one motion personality, written as one metaphor plus 3 to 5 rules before any timing is chosen (illustration only, three unrelated briefs: "a precise instrument in a calm room: decelerate exactly, never bounce, never celebrate"; "a warm kitchen pass: quick, appetizing, a small bump on each add"; "broadcast graphics: slam in, land exactly, leave faster"). Brand rules beat trends: respect the brand's bans (glows, glass, gradients, neon). Premium comes from timing, restraint and polish, not from effects. Starting values by industry and by brand personality are in `motion-language-by-type.md`.

Sources: hyperframes docs (prompting/motion.mdx), hyperframes skills (creative beat-direction, motion-doctrine), motionmaxxing (judgment, director), motion-interaction-studio, product-launch-motion, motion-video-kit, diffusionstudio lottie (motion taste), anidoodle, commercial-motion-design (founder), ideas from vibe-motion and imMamdouhaboammar (rewritten).
