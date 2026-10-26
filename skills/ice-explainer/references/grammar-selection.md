# Grammar selection

Spine stage 04 (and 02 for the film-level grammar family). A grammar is the visual language a section speaks (how pictures appear, move and change). The full catalog with measured specs, palettes and type for each grammar lives in `ice-styles`. This file decides which grammar a section needs, from what the narration is doing.

## 1. Rules

- Choose by what the narration is doing in that section, not by the topic's surface.
- A film may switch grammar by section (chapter or act). Never mix two grammars inside one section.
- At most two grammars in a short film (under about 90 s), unless the brief asks for a montage.
- Measure before you define: when the brief names a reference channel or style, analyze 2 to 5 real samples (shot length, still ratio, transition kinds) through `ice-remake` analysis or `ice-qa` tools. Remembered "signature features" are often wrong.
- Grammars and demo palettes are references, never defaults. The film must differ from the nearest bundled demo on at least 4 of 6 axes (`ice-direction`).

## 2. Narration function to grammar

| The narration is mainly | Prefer | Not | Avoid this grammar when |
|---|---|---|---|
| Arguing from real documents, news, archives, quotes, screenshots | Collage (desk of real material), `references/vox-collage.md` | Scale or cute concept worlds | No real material exists (becomes a fake archive) |
| Reasoning step by step, "why" chains | Whiteboard (one big board), `references/whiteboard-and-pen.md` | Full-screen swaps every sentence | Precise data, complex spatial action, high emotion |
| Teaching a method by hand (math, drawing, worked problems) | Pen on board, `references/whiteboard-and-pen.md` | Slides with bullets | The audience needs real-world footage |
| Showing how one structure turns into another (math, networks, algorithms) | Concept transform, `references/concept-transform.md` | Collage | Product launches, emotion, quick cuts under 8 s |
| Scale, "what is inside", mechanisms of nature or systems | Scale world (concept as an object you can dive into), `references/concept-transform.md` | Collage | Real people, events and archives |
| A process an object could perform | Machine metaphor, `references/concept-transform.md` | Abstract boxes | The match between object and concept is not step for step |
| Numbers, growth, trends, comparisons | Chart grammar (`ice-styles`), honest values | A single big-number page (unless only one number) | Unsourced data |
| Lists, stages, quotes, chapter openers | Kinetic type (`ice-styles`, `ice-type`) | Concept transforms | Stories, emotion, long dense voice, over 5 items, or more than 30 to 60 s all text |
| Product features, tutorials, specs | Keynote-style UI or UI walkthrough, `references/code-and-ui-explainers.md` | Transforms | Bad news, mechanisms, nothing real to enlarge |
| Code changes | Code editorial, `references/code-and-ui-explainers.md` | Generic tech glow | No real diff or PR available |
| First-person anecdotes, fails, jokes | Storytime (reaction poses, held silences) | Keynote | Dense tutorials, data, no "I" in the script |
| One continuous journey (route, pipeline, lifecycle) | Continuous action, one hero that never leaves frame, `references/concept-transform.md` | Cut-up slides | Many unrelated facts |
| A long argument (over 3 min) | Persistent world, `references/long-form-explainers.md` | A new picture every few seconds | Short social films |
| Presenter on camera plus graphics | Talking-head explainer with cards (`ice-edit` for footage, cards from `references/card-library.md`) | Full-frame host the whole time | No host footage |

## 3. Material fallbacks

| Material | Use |
|---|---|
| Real screenshots, clean | UI walkthrough grammar (tutorial) or collage (argument and evidence) |
| Only one number in a section | Big settling number, not a chart |
| No real material for a real-world topic | Ask for material inside the stage 01 message; otherwise label generated illustration and report it; never fake archive photos |
| Abstract topic, nothing to film | Invented visuals that embody the metaphor; the build of the diagram is the teaching; the invented hero fills 40 to 60 percent of the frame |

## 4. Drawing media for explainers

When the look is hand-made, pick a medium for the job and say why (specs in `ice-styles`): scrapbook for archival and research topics, blueprint for technical, chalkboard for a lesson, flat vector or isometric for products and systems, paper craft for children, marker comic for energetic films, engraving or ballpoint for serious reports. Change medium only when the story changes state, never as a row of style vignettes.

## 5. Record

Write the chosen grammar per section into `ice/DIRECTION.md` with the narration function that justified it, and into each segment's `grammar` field.
