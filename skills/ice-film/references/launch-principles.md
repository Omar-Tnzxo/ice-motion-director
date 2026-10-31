# Launch-film principles

Rules for every film that shows a product (product launch, app ad, UI walkthrough, hype promo, industry spot with a product). Read only the sections the stage row of `../SKILL.md` names: section 4 at 01, sections 6-7 at 02, sections 1-3 and 8-9 at 04, section 5 at 07.

## Contents

1. Director stance
2. One shape that never cuts
3. The cursor as an actor
4. Approved numbers only
5. Real product, rebuilt honestly
6. Signature move
7. Films that differ in structure
8. Feature presentation menu
9. UI motion menu

## 1. Director stance

- Direct first, implement second: a creative plan (story, payoff, brand, sound arc, beat-by-beat scene plan with framing, interactions, transitions and sound cues) before any animation code. Show the state list on the beat grid (or on the word cues) before writing code.
- Make creative calls without waiting, log each as a decision in `ice/DIRECTION.md`, and list them in the delivery report so the user can overturn any in one reply. Wait for the user only at the router's stops (`ice-motion-director/SKILL.md` section 5, "Stops").
- Be inventive about the film; be boringly disciplined about the build.
- Green tooling is not a good film: a composition can lint clean, render without error and still be a slideshow. Clean, smooth, error-free versions still get rejected for being basic, empty or slow.
- Something happens on every beat; there is no dead time. Micro-interactions (button press, knob stretch, pill lag, click ripple, counter settle) are what make it read as expensive.
- Make it easy to follow: one clear takeaway per scene, short prompts and answers, enough settled time to read the result. When a beat feels rushed, simplify the content or add beats rather than rushing the viewer.
- Carry one recognizable customer example through the demo. Simplify real product behaviour for film without inventing actions or outcomes.
- Iterate by keeping what the user liked: strong beats survive between versions; change the rest.

## 2. One shape that never cuts

The doctrine for music-first UI morph films, one-take launches and loops (scope: `film-types/product-launch.md` option "one shape", `film-types/ui-walkthrough.md` one-take, social loops). Other types may cut; see each type's transition policy.

- One-shape rules (one element morphing through every state, text inside a morphing container, the camera filling each state, springs and edge splits, loops that close): the `ice-motion` skill, `references/camera.md` (section "One-take films: one shape, one world, one camera") section 2.
- Text swaps inside a morphing container: the `ice-motion` skill, `references/cut-catalog.md` section 6. Overshoot by film type: `references/timing-and-easing.md` section 7 of the same skill. Loop closure: `references/holds-and-stillness.md` section 5 of the same skill.
- Carry at every section boundary in every launch film: the `ice-motion` skill, `references/seams-and-carry.md` section 1.

## 3. The cursor as an actor

- A cursor (or a finger, or the film's own subject) drives every change with real clicks and drags; the viewer must see the cause, not just the effect. A page reacting to nothing reads as a screensaver. This is part of the grounding rule (the `ice-qa` skill, `references/clarity-gate.md` section 6): typing, scrolling and results happen as they really happen in the product.
- Cursor design, size, entry, park, off-duty exit, layer, click, direct manipulation and camera during the click: the `ice-motion` skill, `references/cursor-and-ui.md` sections 1-3, and `references/camera.md` section 5. Never fade the cursor out in place except in calm films (owner rule, section 1 "Off-duty").
- The hand is the cheapest carrier: keep it on screen across a boundary it caused.
- A fake cursor over a fake UI is a tell: the cursor only operates real (rebuilt) interfaces.

## 4. Approved numbers only

- The truth sheet (ice-assets) is a whitelist, not a guideline. Every number, price, time, logo, face, screenshot and testimonial on screen or in the voiceover comes from it. A shot that wants a fifth stat when the list has four gets four.
- With no approved numbers, the order is: the customer's own data with written permission, a published case study, a defensible product count, or none. A film with zero numbers beats one with invented ones; use relative bars, progress, skeleton lines, or the product's real capabilities as a list.
- Example content inside the UI (a prompt, a file name, a project name) may be believable and illustrative; claims about the product itself (stats, user counts, ratings, offers like "free") may not. Illustrative content is declared in the delivery report; sample data on screen carries an illustrative label.
- Real data shown as rolling numbers is pulled read-only; invent the micro-story if needed, keep the big numbers true, and say which is which in the report.
- CTAs use only the URL or offer the user or the product's site gave; with none, end on the name and tagline.
- Customer and partner logos appear one by one as beats, never a website-style row, and only brands that really used the product, with permission. A quote attributed to a face reads as a person; a real face under an invented name is worse than none (use initials).

## 5. Real product, rebuilt honestly

- Capture or rebuild, reconstruction versus fabrication, and labels for recreated UI: the `ice-assets` skill, `references/screen-capture.md` section 5, `references/truth-sheet.md` sections 6-7 and 9. Generated media stays optional, user-initiated and disclosed: `references/ai-media-policy.md` section 1 of the same skill.
- Do not lift the product website's copy, UI, stats or images wholesale as the film; invent the scenes from the product's real behaviour. Do not use the product's own marketing images as a shortcut.
- Never show a page as a thumbnail expecting its motion to read: either full-frame with the hand, or a live component of it inside a card.
- Chrome to omit (navigation bars, footers, scrollbars, browser chrome, OS cursors): the `ice-assets` skill, `references/screen-capture.md` section 6.

## 6. Signature move

- Name one signature move per film: it expresses the claim, repeats two or three times, and is cheap enough to do perfectly. Take the product's core verb and make the film do it.
- Name three signature transformations you can describe without effect names.
- Give the logo a job (the button, the cursor, a word in the sentence); a logo that only appears at the end as a sticker is wasted. UI and app motion genre (`genres/ui-motion.md`): the logo centred on a plain ground is the measured close of the genre (13 of 15 films) and is not a sticker there; an earlier job for the logo stays welcome (9 of 15 show the brand before the end).
- In films that scored best, the strongest moment was the brand's own inventory (its icon, material, control) turning into the product's action.

## 7. Films that differ in structure

Canonical rules live in `structure.md` section 7 (structure fingerprint, canonical-component cap, template distance). Launch-specific additions:

- Two launch films built with this skill must be unmistakably different. Write three genuinely different directions and kill two (ice-direction runs the round).
- A film that fails the competitor swap has no direction (the `ice-qa` skill, `references/identity-tests.md`, run from 02).
- When a brief matches a worked example direction bundled anywhere in this plugin, that direction is automatically one of the three candidates and automatically one of the two killed.
- Never default to a template's story or carry the previous film's look (palette, stage, camera grammar, transitions); tools are reusable, looks are not.

## 8. Feature presentation menu

Feature presentation menu (instead of the automatic "three feature tiles"): the `ice-ideas` skill, `references/concept-menus.md` section 2. Pick by the product; two consecutive films never use the same method.

## 9. UI motion menu

Choose what the product flow needs: component assembly; a felt click; a panel that blooms into the next step; a file flying to a drop zone; charts filling in sequence; windows floating tilted in 3D; a window carousel; content changing while the container stays; running chips; a role pop with label pills; integration badges; an integration burst and orbit; a thick 3D app icon; a device carrying the UI; a card lifted out; UI exploding into a diagram; depth focus; a UI and claim split screen. At least one live UI act per app or SaaS film: assembled, used, producing a result, never a still zoomed screenshot. Motion numbers: ice-motion.

Sources: AbubakrChan/product-launch-motion, Barty-Bart/motion-graphics, bangtutorial/bang-motion, feitangyuan/onetake (ideas), howseen-ai/claude-motion-design, echris6/motion-video-kit, Tejashmakwana/motionmaxxing, charlie947/motion-graphics-skills, video-production-studio (Omar-Tnzxo), heygen-com/hyperframes.
