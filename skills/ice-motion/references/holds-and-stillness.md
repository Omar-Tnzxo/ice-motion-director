# Holds and stillness

The sources disagree sharply about what happens while a frame holds. All of them are right in their scope; never pick one globally. Choose the hold policy from the film or edit type (film types: the ice-film workflow's `SKILL.md` section 4; edit types: the ice-edit workflow's `SKILL.md` section 2), write it in the motion plan, and apply it to every hold in the film.

## 1. The four hold policies

| Policy | What is alive during a hold | Holds in (film and edit types) | Source lineage |
|---|---|---|---|
| A. Alive hold | One living thing on the frame: a 1-3 px per frame linear drift, a 0.5-1 percent scale creep, a caret, a counter tick, light moving on the ground, playing video, or a breathing 1-2 percent scale | Product launch, app ad, hype promo, social short, logo sting tail, shorts and reels | hyperframes docs (motion.mdx: "never write holds motionless"), motionmaxxing law 8, anidoodle ("the camera may creep, the subject never stops") |
| B. Camera-only life | Elements land and hold dead still; the only life is one very slow scale curve on the scene camera (push 1.00 to 1.04-1.06 or the reverse, about 0.5 percent per second) | Explainer, talking-head ad, long-form, podcast, B-roll overlay, data story | talkcraft and anything2explainer (ideas, rewritten), huashu explainer camera (slow push), motion-video-kit (3-5 percent push on message frames) |
| C. True still, used as punctuation | Nothing moves: no drift, no camera, no settling. A rest is truly still so the next burst lands | Brand film, art film, music video rests, kinetic type pauses, comedy and storytime silences, calm luxury and editorial films | onetake (ideas, rewritten: at least 25 percent of frames still and at least one 1 s quiet stretch), hyperframes storyboards ("never ask for a slow drift"), claude-remotion-skill (HIT, hold 15-20 still frames, build, HIT) |
| D. No sustained idle at all | Idle loops (breathe, float, drift, glow pulse) are banned as sustained motion. A hold either keeps a staged reveal, sequenced UI life, cursor-led action or camera with intent running, or it is a short designed stillness; "no motion over bad motion"; the only sanctioned hold life is subtle jitter | UI walkthrough, product launch with narration, industry spot, any film where a screensaver look is the risk | hyperframes product-launch-video doctrine and motion-doctrine skill, commercial-motion-design (founder) |

How to choose when the type is mixed: narration present favours B; music-led and kinetic favours A or C (bursts and rests); UI demonstration favours D; calm or premium brand favours C; the brief's own words override all four. Log the choice in `ice/DIRECTION.md` through the ice-direction skill.

## 2. Rules that hold under every policy

- A hold is a decision, not leftover runtime. A scene that finishes entering with seconds left is a planning bug: add story (a new reveal, a camera move with intent, the next beat), or shorten the scene; never fill it with wobble.
- "Pause at any second: something meaningful is mid-flight, or the stillness is designed." Dead air means an accidental still, not a designed one.
- A designed breath of 0.6-1.5 s before a payoff, with a stated reason, is good under every policy.
- The dramatic comma: schedule a 0.3-0.75 s pause between the major action and its result.
- Hold the result: after the biggest change in the film, hold it (alive per the policy, but unbroken) for 1-2 s before anything else happens. Not in loops under 6 s.
- Payoff holds (measured): list 0.8 s, number 0.47 s, lockup 0.67 s, pile of shapes 0.8-1.0 s; hero figure up to 1.2 s.
- Minimum visual beat is 0.5 s; anticipation shorter than that belongs to sound, not to a separate scene.
- Fast move, then complete stillness, then next move reads expensive; constant motion reads amateur. Contrast is the point under every policy, including A (the life during an A-hold is small).
- Never a uniform slow push on every shot: in explainers, a few-percent push on every shot reads as a slideshow (policy B pushes alternate in and out, vary rate, and stop where the content is read).
- Camera motion during a hold must not fight motion already in the picture (playing footage, a line being drawn, a growing curve): if the picture moves by itself or the viewer is reading, the camera holds.
- A camera ease ending at zero velocity inside the shot reads as a frozen last second: put the last camera key beyond the shot end, or compute the ease over a window slightly longer than the shot. (Policy A and B.)
- Holds counted for density gates must be truly still or clearly alive; a creep of 2 percent or less scores as still in frame-difference metrics but is legitimate under A and B. Measurement and thresholds are owned by the ice-qa skill.

## 3. End holds and endings

- End on motion or on a designed stillness, never a fade to black by default.
- Resolved end-card hold (lockup landed to last frame): 0.6-1.4 s, and the whole CTA beat at most 25 percent of the film (product launch, app ad, hype promo, social short). If the film must run longer, add a proof beat or a second action, never a longer logo: a mark registers in about 0.5 s and a name in about 1 s.
- Scoped exceptions: calm brand films and art films may end calmly or fade (22 of 51 measured gold films ended calmly); end cards that must carry a URL or legal line hold for reading time (ice-type); talking-head and long-form edits hold the final frame at least 1 s before the cut; explainers hold the final takeaway frame 1-1.5 s; a still end card follows sustained motion and echoes the opening.
- The last frame of a film is a poster: no mid-motion half-typed frame, no cursor, unless the film deliberately ends mid-motion.
- The ending is usually one beat, smaller and quieter than the climax before it. Things leave, motion slows, the music lands (ice-audio), one last soft event.

## 4. Freezes and time ramps

- A freeze must keep something moving (a word being written, the camera creeping); a speed of zero with nothing moving is dead air.
- Time ramp: ease down over 0.2-0.35 s to 0.2-0.4 speed, hold 0.5-1.2 s, ease back over 0.3-0.6 s; the score keeps its own tempo; once per film; not in loops.
- Slow motion inside a scene draws at fractional time (motion is a function of time, never of a frame counter).

## 5. Loops

- Every motion is periodic over the loop: drive everything from t / duration through functions that repeat a whole number of times (sin(2 pi k t), integer k).
- Last frame equals first frame, including position, velocity, cursor position and speed; export without duplicating the end frame.
- Idle loops for marks: breathing up to 2 percent over 3-4 s; only one part may pulse (1.5-2 s); orbits strictly linear (1.2-2 s); stop or decay attention loops after 3-5 cycles when nothing is loading.

Sources: hyperframes docs and skills (motion.mdx, anatomy, storyboards, product-launch-video motion-language, motion-doctrine), motionmaxxing (motion.md, close.md, director.md), anidoodle (motion deck, craft bar), huashu-art-motion (camera language), motion-video-kit, claude-remotion-skill, product-launch-motion, video-production-studio, ideas from onetake, video-talkcraft, anything2explainer (rewritten), commercial-motion-design (founder).
