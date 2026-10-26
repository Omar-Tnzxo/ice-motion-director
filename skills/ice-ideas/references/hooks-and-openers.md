# Hooks, openers, open loops and endings

The first three seconds decide whether the rest is watched. This file owns how hooks are conceived and written; the opening gate that checks the encoded render is owned by the `ice-qa` skill, and the opening hit mix by the `ice-audio` skill.

> Sources: nateherkai/herk-edit-kit `short-form-edit` and `references/curiosity-and-entertainment.md` (MIT and pipeline use permission: "Retain this notice when redistributing the kit or substantial portions of its source materials."), Tejashmakwana/motionmaxxing (Apache-2.0), Omar-Tnzxo video-production-studio (founder), AbubakrChan/product-launch-motion (MIT), lemomo-ai/lemo-opuscar (MIT), Vincentwei1021/mg-styles-15 (MIT), alchaincyf/huashu-art-motion (MIT), edenfunf/reelmimic (MIT), bangtutorial/bang-motion (MIT), heygen-com/hyperframes-community-skills vox-explainer (Apache-2.0), heygen-com/hyperframes creative story spine (Apache-2.0). Ideas only, rewritten: imMamdouhaboammar/motion-graphics-skills, Vincentwei1021/video-talkcraft, Vincentwei1021/anything2explainer. Quoted lines keep their authors' wording.

## 1. The priority test

"In the first 3 seconds is someone convinced they need to watch until the end?" (herk-edit-kit). Record three things for every hook: the viewer benefit, the unresolved question, and the exact payoff that later earns it. If the opening only earns "that looked cool" and cannot answer "why should I stay?", rewrite it. Never invent a percentage of viewers convinced; internal comparisons are editorial judgment, not audience tests.

## 2. Hook rules (one canonical list)

1. Open inside a concrete situation or problem, never on a definition, an agenda ("today we will talk about"), a title card or a slow logo reveal (lemo-opuscar, anything2explainer ideas, huashu-art-motion).
2. Open on the tension, the payoff, a question or a pattern interrupt, "never on the logo" (founder). Exception: logo sting and rebrand reveal, where the mark's arrival is the story.
3. Open on motion at frame 0: something already mid-action. Never an empty or black frame longer than 0.3 s (mg-styles-15, motionmaxxing).
4. The first frame is readable: it is also the cover and the poster on many platforms (founder).
5. The visual hook and the spoken hook say different things that complete each other (founder). Muted test: would the first 2 seconds stop the thumb with the sound off?
6. The first second makes a promise; the first three establish the world, the tone, the hierarchy and one signature behaviour (Mamdouh, ideas only).
7. Name the thing: for creator shorts the hook is "a claim or command that names the tool or person" (herk-edit-kit). Hook outcome in the viewer's language, not the maker's inventory; numbers only when they carry stakes (hyperframes story spine).
8. For narrated films the first sentence carries the hook: a number or a conflict (video-talkcraft, ideas only).
9. The hook promise must be one this material can fulfil. Reject vague teasing, a fabricated failure, a withheld topic or "wait for it" (herk-edit-kit).
10. Loudness is never the only hook; "A quiet impossible-looking result can beat a loud montage." Avoid a mandatory stamp, flash or 0.3 s effect (herk-edit-kit).
11. A recorded talk caps the edit: "Script the hook before you record." (herk-edit-kit). Hand creators their hook line before they film.

## 3. Hook timing by film type

| Film type | Timing |
|---|---|
| Social short, app ad, reel, feed placement | Readable caption or picture within 0.5 s; hook complete by 3 s (founder, mg-styles-15) |
| Short motion graphic with a hero moment | Hook in the first 0.5 s, escalation, one hero moment at about 60 to 75 percent of runtime, composed end frame held about 0.8 to 1.2 s (mg-styles-15) |
| Type-only hook (kinetic type, launch) | May run 2 to 3 s (motionmaxxing) |
| Product launch 30 to 90 s | Hook 0 to 3 s; "The claim lands inside the first 10 seconds" (product-launch-motion) |
| Narrated explainer over 2 minutes | Concrete opening scene first, stakes within the first minute (anything2explainer ideas) |
| Logo sting | The reveal is the hook; no lead-in |

Cold open (result first) when the result is self-evident, the pain is already known, or the film is under 30 s; problem first when the audience does not know the problem yet (product-launch-motion).

## 4. Hook generators

- **Opening menu:** `references/concept-menus.md` section 3.
- **Three opening angles** (herk-edit-kit): problem first, result glimpse, recognition first.
- **A concrete small scene:** hands or one object doing something tied to the topic (huashu-art-motion).
- **Recognition hook** for explainers: something the viewer has seen all their life without knowing why (vox-explainer topic filter).
- **Paths:** the five paths in `references/divergent-sets.md` section 2 each imply a different first frame.

## 5. Three provisional openings

Before the rest of the film is built, write three materially different openings that lead into the same truthful content (herk-edit-kit; Mamdouh, ideas only).

1. Make them differ in what leads: typography, object, camera, depth, image, negative space or material.
2. For each, write the first-3-seconds plan: frame 0, what is seen by 1 s and 3 s, what is heard, the benefit, the open question, evidence by second 3, the payoff time.
3. Compare on topic clarity, curiosity, muted comprehension, follow-through into the next beat, the first frame, readability, brand fit, originality, phone legibility and simplicity. Never pick the loudest or busiest by default.
4. Write the three openings, the choice and the one-line reasons in the hook sheet `ice/plan/hooks.md` (`references/templates.md` section 3), and log the decision in `ice/DIRECTION.md`.

In this skill the openings are text frames plus wireframe sketches (`references/storyboards-and-animatics.md`). The receiving workflow renders their first seconds cheaply before building on (for launches the `ice-film` skill builds the first 10 s in two or three styles first). "If the first 3 s would not stop your own scroll, rebuild them before the rest."

## 6. Open loops

Use when the story has an honest unresolved question: open loops with planted objects suit shorts, talking-head ads, long-form and story-led films. Do not force suspense or withhold the topic into a plain explanation, tutorial or UI walkthrough.

Rules (herk-edit-kit):
- A loop is a viewer question tied to a visible unresolved state. "A recurring object alone is not an open loop: establish what is missing or unresolved, then visibly change that state."
- "Pick an unresolved state viewers can understand immediately." Make the missing information specific.
- Map setup, partial answers, reminders and resolution. "Default to one main loop and at most one secondary loop open at once."
- "Close the promised lesson before the CTA; a comment request must not be the only answer."
- List-based films: show all items early, blurred, as the loop; "Showing all answers on the first card closes a list-based loop prematurely."
- Long-form: "Never say 'we'll come back to this.' Leave something visibly incomplete in the world and return to it." Re-show it at every chapter boundary (about two seconds each), advance it visibly, close on the opening image.
- An ad may resolve a concrete example or explain a mechanism before inviting the viewer to learn more; it must not promise a full tutorial and deliver only a sign-up CTA.
- The planted object resolves at the payoff (object callback); a muted viewer still follows the central idea.

Ledger: write `ice/plan/open-loops.json` (schema in `references/templates.md`). Times are output seconds; `supportingSpeech` stays verbatim when quoting and is labelled when paraphrased.

Direct each sequence by answering: expectation (what does the viewer think happens next?), development (what changes their understanding?), payoff (what lands?), attention (which single thing should the eye follow?), rhythm (where does density rise, release, resolve?), sound (which cue anticipates, contacts or releases; which cuts stay quiet?).

## 7. Endings

- "An ending that echoes. Bookend the opening, reveal the scale, or let the character do the thing right the second time." (lemo-opuscar)
- The ending returns to the opening and reframes it; never a summary list or a farewell (anything2explainer ideas).
- The payoff reuses earlier visual logic (the recurring line, object, material, type behaviour, camera direction); no new effect at the climax (Mamdouh, ideas only). The ending calls back the climax emotion (reelmimic).
- End on an action of the hero or the main object, not a centred quote card (huashu-art-motion).
- Let the brand arrive at the turn, near the middle of the energy curve, not only at the end (motionmaxxing). Vary where the turn lands between projects (product-launch-motion: try earlier or later than the default 40 percent).
- Closing shapes: `references/concept-menus.md` section 4. CTA rules: `references/script-writing.md` section 5.

## 8. Self-check

- [ ] The hook names a benefit, a question and its payoff time.
- [ ] Frame 0 is in motion and readable muted; the logo does not open the film (unless sting).
- [ ] Timing matches the film type row in section 3.
- [ ] Three openings written, compared and the choice logged.
- [ ] Every open loop has a visible unresolved state and a closure before the CTA.
- [ ] The ending echoes or reframes the opening.
