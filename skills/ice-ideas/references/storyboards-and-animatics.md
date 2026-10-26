# Storyboards and animatics

Storyboards, shot tables, frame sketches and animatic specs as deliverables. This skill writes them; the receiving workflow renders posed stills and the moving animatic. Motion grammar, cuts and camera are owned by the `ice-motion` skill; the storyboard lint by `ice-qa`.

> Sources: heygen-com/hyperframes docs `prompting/storyboards.mdx` and `prompting/anatomy.mdx`, skills creative and product-launch-video (Apache-2.0), alchaincyf/huashu-art-motion shot table template (MIT), edenfunf/reelmimic (MIT), nateherkai/herk-edit-kit (MIT and pipeline use permission), Omar-Tnzxo video-production-studio and commercial motion foundations (founder), Tejashmakwana/motionmaxxing (Apache-2.0), echris6/motion-video-kit (MIT), charlie947/motion-graphics-skills (MIT). Ideas only, rewritten: imMamdouhaboammar/motion-graphics-skills. Quoted lines keep their authors' wording.

## 1. Order of work

Order of locking: the `ice-direction` skill, `references/treatment.md` section 1.

Production sequence (founder): message, concept, references, boards, styleframes, animatic, shot contracts, animation, sound and mix, compositing, review, revision, approved master. A mood board is not a styleframe. This skill covers message through animatic spec. Plan visibly, then build without asking approval for every step (motion-video-kit).

## 2. Storyboard plan: prompt the plan, not the scenes (hyperframes)

State the film's shape once:
- **Message:** the one-sentence thesis. "If a frame doesn't serve it, cut the frame, not the message."
- **Arc:** the beat sequence named plainly, or a shape word (listicle) when frames are parallel.
- **Audience:** one phrase.
- **Mood:** one music or energy descriptor; frames agree with it even when silent.

Direction block, written once and inherited by every frame:
- Colour rule from `ice-direction` (for example a ground plus one ink, emphasis by inversion, scale or density, never a third hue; illustration only).
- Reveal pacing: narrated films show at t=0 only what the narrator is saying, each part arriving on its spoken cue; silent films key reveals to named timestamps.
- Hold behaviour, stated explicitly per frame (still, or a slow push): the policy per film type is the `ice-motion` skill's.
- **One breather:** exactly one deliberately calmer frame or longest read.
- **Negative list:** the clichés wrong for this film, stated once and checked against every frame.

Per-frame job:

```text
[type]        hook | pain_point | product_intro | feature_showcase | benefit_highlight | social_proof | cta | branding
[persuasion]  a named device
[beat]        the emotional beat
[focal]       the one thing the eye lands on
[roles]       foreground / supporting / background
```

"Never skip `persuasion` and `beat`." Persuasion is a named move (pain agitation, negative contrast, friction reduction, show-don't-tell proof, statistical proof, social proof, authority by association, risk reversal, future pacing, value stacking, rule of three, scarcity, status seeking, callback plus distillation), never "show benefit".

**Callback:** plant a motif early and say how it returns, denser or complete. The plan must say the second appearance is the same element.

## 3. Frames and beats

- "Each beat is a WORLD, not a layout." Give each beat a 2 to 3 sentence concept, mood direction by cultural reference rather than hex, choreography verbs, transition, depth layers, sound cues (hyperframes creative).
- Beat formula inside a frame: `[element] [motion] [layout] [style] [timing]`, one sentence per element. Beats get timestamps; say what the tail does; never schedule two things "at" the same second (the first ends, then the next starts) (hyperframes anatomy).
- Scenes add up to the exact length; one visual idea per scene and each grows out of the last (charlie947).
- Never jump from script to scenes: solve each beat as message, visual mechanism, and what carries into the next beat. Each beat adds information, feeling or transformation and passes on a surviving element; otherwise merge or cut (Mamdouh, ideas only).
- Prefer transformations (object to object, line to chart, word to layout) over "text appears, icon appears".
- "Something happens in every shot: an event, cause, reaction, set-ups that pay off." (reelmimic)
- Design the climaxes first; hero shots are written down to the frame (anticipation, burst, hold); a short film may have only one (reelmimic).
- Same scene and camera setup at most 40 percent of runtime (reelmimic).
- The middle fails through equal density: use acceleration, proof, a reset, a scale change, a quiet frame, new material or a camera change. Gap check against the rhythm model: hook, establish, accelerate, proof, quiet reset, build, payoff, CTA, clean resolve (Mamdouh, ideas only).
- Energetic 30 s films: about 12 to 15 distinct compositions; vary scale (macro, wide, overhead, UI close-up, type impact) (motion-video-kit). Calm films use fewer; film-type rhythm ranges live in `ice-film`.
- "a frame whose why cannot be traced to the message is a frame to cut, not to decorate"; a change now costs seconds, after build it costs minutes (hyperframes).

## 4. Shot table (huashu-art-motion)

Three lock lines before the table, named exactly `Style:`, `Palette:` and `Characters:`, and the column names the `ice-qa` linter reads (the `ice-qa` skill, `references/storyboard-lint.md` section 1). Exact shape: `references/templates.md` section 7.

| Column | Rule |
|---|---|
| Object | A noun the viewer can point at. Never: title, bullet, text, list, label, subtitle, card, background, picture, icon; never an empty shot, flat colour, black or gradient |
| Action | A verb that object performs. Never: appear, display, show, fade in, appear one by one |
| Tags | Optional labels; more than 3 per shot is a warning; never a row of glowing capsules |

The opening 3 s is a concrete small scene; the ending lands on an action of the hero or main object. One example carries the whole film. Story-led films add (reelmimic): logline, world and colour arc, motif, protagonist emotion arc, and per shot: beats, transition in, event, reaction, camera. Music videos: one idea for the whole video, a cast table with arcs, a recurring set and an escalating motif, chapters equal song sections; "Act the lyric, don't write it." (reelmimic)

## 5. Frame sketches

- Sketch each key frame as rough bounding boxes: a text grid or a plain SVG wireframe of labelled boxes, with the focal element marked. This doubles as the silhouette check (`ice-direction`).
- One poster frame per beat; the first frame doubles as the cover.
- "AI-painted scenes do not count as a rough board" (founder). Designed stills and posed stills from a draft composition are made by the receiving workflow.
- Mark the 9:16 safe region on every sketch when any vertical delivery is planned (zones from `ice-engines`).

## 6. Animatic spec

The animatic tests story before polish. This skill writes `ice/plan/animatic.md`: the ordered sketch frames with in and out times, the VO draft line under each, rough sound cues, the open-loop states, and the questions the animatic must answer.

The receiving workflow renders "a low-resolution moving animatic with speech and rough sound before polishing materials. Fix predictability, missing context, or weak payoffs at this stage." (herk-edit-kit). Lock the cut after the animatic, before polished graphics; any later timing change rebuilds captions, graphics and sound from the same map. The entertainment review of the animatic is the `ice-qa` skill's.

## 7. Plan changes

- Every user-driven change: version plus one and a changelog line. If a change sacrifices the core (removing the climax, two people to one), say so plainly (reelmimic).
- Open questions only for real user decisions (at most 4); missing material goes to required inputs, so production never stalls on it.
- Show the storyboard with a short explanation: step mode on the 04 review card; auto mode in the delivery note, after the approver role passed it (reelmimic).
- Integration check before hand-off: does every choice fit together? (illustration only: a vertical 90 s film with a chart-dense concept means charts a phone cannot read) (hyperframes).

## 8. Self-check

- [ ] Message, arc, audience, mood stated once; direction block with one breather and a negative list.
- [ ] Every frame has type, persuasion, beat, focal, roles.
- [ ] Objects are nouns, actions are verbs; no banned words in those columns.
- [ ] Scenes sum to the exact length; climaxes designed first; a callback planted and returned.
- [ ] Sketches exist for every key frame; hold behaviour stated per frame.
- [ ] Animatic spec lists what it must prove.
