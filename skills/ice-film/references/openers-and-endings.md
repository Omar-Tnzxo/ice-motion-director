# Openers and endings

How a film starts and how it lands: the hook rules, the three provisional openings, the first-3-seconds gate, open loops, and endings with their hold rules. This file is complete for the openings step of spine stage 03, the opening render study at stage 07 (section 3) and the ending: the rules below are the working set, quoted in short form from the `ice-ideas` skill (`references/hooks-and-openers.md`, `references/templates.md`), which keeps the long form and wins if the two ever differ. Open the idea menus only when you need more candidates (section 1).

## Contents

1. Where candidate ideas come from
2. Hook rules and timing
3. Three provisional openings
4. First-3-seconds gate
5. Open loops (shorts)
6. Endings and end-card holds

## 1. Where candidate ideas come from

Menus to draw candidates from (premise, structure, camera, fits), used as menus, never as scripts: the `ice-ideas` skill, `references/concept-menus.md` section 1 (19 opener concepts), section 3 (opening menu and the eight text doors) and section 4 (closing menu).

Film-side rules: an opener (25-40 s promo, intro or launch opener) picks one concept as its parent skeleton; two may combine, one leads. Two consecutive openers for the same brand never use the same concept.

## 2. Hook rules and timing

Priority test for every hook: "In the first 3 seconds, is someone convinced to watch until the end?" Record the viewer benefit, the unresolved question and the exact payoff that later earns it.

1. Open inside a concrete situation, tension, payoff or question; never on a definition, an agenda, a title card or a slow logo (exception: logo stings and rebrand reveals, where the mark's arrival is the story).
2. Motion at frame 0: something already mid-action; never an empty or black frame longer than 0.3 s.
3. The first frame is readable and full: it is also the cover. It meets the type's richness floor (`film-types/<type>.md`, "Richness floor").
4. Muted test: would the first 2 seconds stop the thumb with the sound off? The visual hook and the spoken hook say different things that complete each other.
5. The promise must be one this material can keep: no vague teasing, fabricated failure, withheld topic or "wait for it". Loudness is never the only hook.

| Film type | Hook timing |
|---|---|
| Social short, app ad, feed placement | Readable caption or picture within 0.5 s; hook complete by 3 s |
| Short motion graphic with a hero moment | Hook in the first 0.5 s, escalation, hero moment at 60-75 percent of runtime |
| Type-only hook (kinetic type, launch) | May run 2-3 s |
| Product launch 30-90 s | Hook 0-3 s; the claim lands inside the first 10 s |
| Logo sting | The reveal is the hook; no lead-in |

Cold open (result first) when the result is self-evident, the pain is known or the film is under 30 s; problem first when the audience does not know the problem yet.

## 3. Three provisional openings

The openings are chosen in two passes, because a render needs the look (05), the cue sheet (06) and the engine (chosen at 07 with the `ice-engines` skill). Stage 03 compares written plans; stage 07 compares renders.

At stage 03 (openings step):

1. Write three materially different openings that lead into the same truthful content; they differ in what leads (typography, object, camera, depth, image, negative space or material).
2. For each, write the first-3-seconds plan: frame 0, what is seen by 1 s and by 3 s, what is heard, the benefit, the open question, the evidence by second 3, the payoff time.
3. A fresh critic (never the builder) compares the three plans on topic clarity, curiosity, muted comprehension, follow-through into the next beat, the first frame, readability, brand fit, originality, phone legibility and simplicity. Never pick the loudest or busiest by default. On a lean crew this critic is the storyboard critic (`film-setup.md` section 2). The winner is provisional: the storyboard (04) and the cue sheet (06) are built on it. Render nothing at 03.
4. Write the hook sheet `ice/plan/hooks.md` (template below) with `Render study: pending (07)` and log the provisional choice in `ice/DIRECTION.md`.

At stage 07 (first build step, before the full draft):

5. Render study. In the engine chosen for the build (`ice-engines/SKILL.md`), with the 05 look and the cue sheet timing, render only the first 2-4 s of each of the three openings at draft resolution and put them side by side. The studies may be time-shifted or built in isolation from the film; the critic judges only their first 3 s and never flags the shift itself as a defect. The same critic rule as step 3 compares them on the same criteria.
6. When a different opening wins, update the plan files first (`ice/plan/hooks.md`, the opening rows of `storyboard.md` and `shot-plan.md`, the first cues of `cue-sheet.json`), then build. Set `Render study: done, <A/B/C> <confirmed or replaced>` in `ice/plan/hooks.md` and log the result in `ice/DIRECTION.md`.
7. For a launch film, the same idea at larger scale, also at 07: build the first 10 s in two or three styles, pick one, then build the rest.

When 03 is not used (a micro film) or the opening was supplied by the user, there are no three openings: the first-3-seconds gate (section 4) runs on the one opening, and `Render study:` reads `not used`.

Hook sheet template:

```markdown
# Hooks: <project>
Priority test: benefit <...>; open question <...>; payoff at <s>
| Opening | Leads with | Frame 0 | By 1 s | By 3 s | Heard | Muted read | Choice notes |
|---|---|---|---|---|---|---|---|
| A | <typography/object/camera/...> | | | | | | |
| B | | | | | | | |
| C | | | | | | | |
Chosen: <A/B/C> because <reason>
Render study: <pending (07) | done, <A/B/C> confirmed or replaced | not used>
```

## 4. First-3-seconds gate

Mandatory for social shorts, app ads and hype promos; recommended for every film. The opening is its own gated edit: the priority test and the hook rules of section 2 on the chosen opening, then the frame-by-frame check on the encoded opening (including the first spoken word surviving the opening hit): the `ice-qa` skill, `references/captions-and-sync.md` section 2.

A calm opening that holds a finished first frame on purpose (at most about 0.7 s) lists that hold in the `quiet` list of `ice/plan/cue-sheet.json`, so the freeze checks of ice-qa read it as declared, not as dead air.

## 5. Open loops (shorts)

Use only when the story has an honest unresolved question; never force suspense into a plain explanation or walkthrough.

- A loop is a viewer question tied to a visible unresolved state; a recurring object alone is not a loop.
- At most one main loop and one secondary loop open at once.
- The promised answer closes before the CTA; a comment request is never the only answer. List films show all items early, blurred, as the loop.
- Keep the ledger `ice/plan/open-loops.json` next to the storyboard (schema: the `ice-ideas` skill, `references/templates.md` section 4).

## 6. Endings and end-card holds

Ending rules:

- The ending echoes: bookend the opening, reveal the scale, or let the hero do the thing right the second time; never a summary list or a farewell.
- The payoff reuses earlier visual logic (the recurring line, object, material, type behaviour, camera direction); no new effect at the climax. End on an action of the hero or the main object, not a centred quote card.
- Choose the close from the idea, not by habit; one ending beats two. Logo plus CTA stacked in the centre only when the brief asks for an explicit CTA.
- UI and app motion genre (`genres/ui-motion.md`): the two items above are scoped there; the measured close is the logo centred on a plain solid or soft gradient ground, 2 to 6 s in all (median 3.5 s, 13 of 15 films), after the hero's last action. The end hold rows below still apply.
- News reel (edit type `news-reel`, style family `ice-styles/references/family-broadcast-news.md`): the branded end card is the genre's close (6 of 6 measured reels), not an extra CTA: a hard cut, a short dissolve or a mask from the presenter into a designed card (programme or brand mark, title, when and where to watch or follow), built in reading order and held still with no fade. Package values: that file, section 2; the end-hold limit: the `ice-qa` skill, `references/motion-density.md`.

End holds, scoped by film type (owner: the `ice-motion` skill, `references/holds-and-stillness.md` section 3):

| Scope | Hold |
|---|---|
| Resolved lockup (product launch, app ad, hype promo, social short) | 0.6-1.4 s from landed to last frame; the whole CTA beat at most 25 percent of the film |
| CTA with a URL, offer, date or address | Readable at phone size at least about 1.5 s (3 s in launch recipes, or the reading time of the CTA block in industry spots and event invites) |
| Calm brand and art films | May end calmly or fade |
| Standalone logo sting file | Ends on 10-20 frames of exactly the static logo (`film-types/logo-sting.md`) |
| News reel branded end card (edit type `news-reel`) | Built over 1.7-3.5 s (78-88 frames at 25 fps in the Arabic packages), then still for 2.2-6.5 s as the package measures, no fade to black (`ice-styles/references/family-broadcast-news.md` section 2; check row: `ice-qa/references/motion-density.md`) |

- Declare the CTA's start as its own event in the cue sheet (and in the events file the ice-qa end-hold check reads), so the check measures the CTA hold, not the length of the last shot.
- Idle motion ends about 0.3 s before the last frame when the film does not loop.
- The wordmark is fully revealed just before it is spoken.
- Do not cut the music dead: end on the music's own cadence or button (the `ice-audio` skill, `references/cue-map-and-beat-sync.md` section 7).

Sources: bangtutorial/bang-motion (opener concepts, openings, closings; translated from Indonesian), nateherkai/herk-edit-kit (three openings, first-3-seconds gate, open loops), imMamdouhaboammar/motion-graphics-skills (opening studies, ideas only), charlie947/motion-graphics-skills, Tejashmakwana/motionmaxxing (end-hold gate), Vincentwei1021/mg-styles-15, AbubakrChan/product-launch-motion, lemomo-ai/lemo-opuscar, huashu-art-motion, video-production-studio (Omar-Tnzxo).
