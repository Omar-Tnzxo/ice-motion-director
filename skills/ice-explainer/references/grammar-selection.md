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
| Arguing from real documents, news, archives, quotes, screenshots | Collage (desk of real material), `references/grammar-selection.md` (section "Collage explainers (archival desk style)") | Scale or cute concept worlds | No real material exists (becomes a fake archive) |
| Reasoning step by step, "why" chains | Whiteboard (one big board), `references/grammar-selection.md` (section "Whiteboard, hand-drawn and pen explainers") | Full-screen swaps every sentence | Precise data, complex spatial action, high emotion |
| Teaching a method by hand (math, drawing, worked problems) | Pen on board, `references/grammar-selection.md` (section "Whiteboard, hand-drawn and pen explainers") | Slides with bullets | The audience needs real-world footage |
| Showing how one structure turns into another (math, networks, algorithms) | Concept transform, `references/grammar-selection.md` (section "Mechanism, math, scale and machine explainers") | Collage | Product launches, emotion, quick cuts under 8 s |
| Scale, "what is inside", mechanisms of nature or systems | Scale world (concept as an object you can dive into), `references/grammar-selection.md` (section "Mechanism, math, scale and machine explainers") | Collage | Real people, events and archives |
| A process an object could perform | Machine metaphor, `references/grammar-selection.md` (section "Mechanism, math, scale and machine explainers") | Abstract boxes | The match between object and concept is not step for step |
| Numbers, growth, trends, comparisons | Chart grammar (`ice-styles`), honest values | A single big-number page (unless only one number) | Unsourced data |
| Lists, stages, quotes, chapter openers | Kinetic type (`ice-styles`, `ice-type`) | Concept transforms | Stories, emotion, long dense voice, over 5 items, or more than 30 to 60 s all text |
| Product features, tutorials, specs | Keynote-style UI or UI walkthrough, `references/grammar-selection.md` (section "Code, pull request, product UI and website explainers") | Transforms | Bad news, mechanisms, nothing real to enlarge |
| Code changes | Code editorial, `references/grammar-selection.md` (section "Code, pull request, product UI and website explainers") | Generic tech glow | No real diff or PR available |
| First-person anecdotes, fails, jokes | Storytime (reaction poses, held silences) | Keynote | Dense tutorials, data, no "I" in the script |
| One continuous journey (route, pipeline, lifecycle) | Continuous action, one hero that never leaves frame, `references/grammar-selection.md` (section "Mechanism, math, scale and machine explainers") | Cut-up slides | Many unrelated facts |
| A long argument (over 3 min) | Persistent world, `references/run-setup.md` (section "Long-form explainers") | A new picture every few seconds | Short social films |
| Presenter on camera plus graphics | Talking-head explainer with cards (`ice-edit` for footage, cards from `references/card-library.md`); the presenter stays lit and clear, marks and dimming fall only on the people talked about (`ice-edit` skill, `references/layers-and-isolation.md`, "The speaker stays lit") | Full-frame host the whole time | No host footage |

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


## Whiteboard, hand-drawn and pen explainers

Use when the narration reasons step by step, or teaches a method by hand. Palettes, stroke styles and drawing media come from `ice-styles`. Rules marked "synthesis" combine several sources rather than one measured reference.

### 1. Pick one board grammar per film

The big-board and page-per-idea variants (camera moves per minute, board pans, whips, cuts per minute, look, hand, writing speed and sync, line widths, ending, sound, common mistakes) are owned by the `ice-styles` skill, `references/narration-grammars-1.md` section 4. This file adds the build rules the owner does not hold and the pen lesson grammar.

| Grammar | Shape | Fits |
|---|---|---|
| One big board | Everything accumulates on one large canvas; the camera travels; a final pull-out shows the whole map | "Why" chains, arguments, talks |
| Page per idea | One sheet per page, hard cut to the next page | Short physics or science answers |
| Pen lesson (synthesis) | A board that fills in teaching order; erase or new page between problems; camera static or very slow, no decorative moves | Worked problems, math, drawing lessons |

Never mix grammars in one film.

### 2. Sync with the voice

- Writing sync (say a line, write a line, write slightly behind), pre-drawn setups, transitions on topics, drawing through pauses: the `ice-styles` skill, `references/narration-grammars-1.md` section 4. Reading time counted from the last item finishing: the `ice-type` skill, `references/reading-time.md` section 2.
- A noun picture may drop in about 0.3 s after its word.
- The first stroke of a block syncs with the camera's arrival.

### 3. Drawing speed (scoped)

| Context | Speed |
|---|---|
| Dense fast board (measured from real whiteboard films) | The `ice-styles` skill, `references/narration-grammars-1.md` section 4 (writing speed, icons, heads, stroke time, complex illustrations never drawn on camera). Real films are sped up 5 to 12x |
| Readable lesson board (engine guideline) | Text 7 to 10 characters/s; icon lines about 1500 to 2500 px of line per second; a character figure 1.0 to 1.3 s; hold each finished drawing 0.3 to 0.8 s, longer for the key point |

### 4. Drawing on (scoped)

- Lesson and engine-built boards: everything is drawn on with the hand; nothing pops in.
- Dense fast boards (keyword pops), zigzag glyph reveals, erase or keep but never fade: the `ice-styles` skill, `references/narration-grammars-1.md` section 4.

### 5. The hand

- The hand (entry, frame share, exits, glides between strokes, never hiding a read, checking the end frame): the `ice-styles` skill, `references/narration-grammars-1.md` section 4.
- End each block with at least 0.4 s hand-free.

### 6. Composition

- Planning the final image first, groups per block, pan overlap, wordiness, rotating block templates, shape checks and straight-segment rectangles: the `ice-styles` skill, `references/narration-grammars-1.md` section 4.
- Framing is computed from the block's stroke bounding box plus margin; push half-cut old text out of frame.
- Key content top-left to center; pen order left to right, top to bottom.

### 7. Line and color

- Marker width, line types and the accent share: the `ice-styles` skill, `references/narration-grammars-1.md` section 4. Each accent has one meaning (illustration only: problem, good, product); color states: the `ice-direction` skill, `references/color.md` section 6.
- Zooming past about 2x thickens lines; build close-ups at larger size near zoom 1.
- Characters at least about 30 px tall in medium shots; text at least about 90 px at zoom 1 on a 1080p board; keep drawings out of the caption band while a caption shows.

### 8. Ending

Closing reveal of the whole board: the `ice-styles` skill, `references/narration-grammars-1.md` section 4.

### 9. Sound

Music under speech for whiteboard and lecture films: the `ice-audio` skill, `references/mix-and-master.md` section 3.

### 10. Pen lessons and worked problems (synthesis)

- Write the question on the board before demonstrating.
- Geometry before algebra: show the shape first, the equation second. Never show a symbol before showing what it stands for.
- Pen colors are concept colors and stay fixed for the film (at most four).
- Dim and reveal for formulas: the full expression faint, terms lit one at a time as spoken, finished terms dimmed.
- One concept on screen at a time; marks are drawn on, never faded in; the diagram assembling is the explanation.
- Drawing lessons: 6 to 8 steps in teaching order (placement and gesture, big shapes, construction, value masses, local color, edges and details, accents), each with what to look at, how, and the common mistake; construction lines on their own layer, erased to a faint ghost later; corrections are shown as authored events (old mark erased first). A numbered reveal with captions is not a lesson.
- Recreating a user's own drawing is labeled as one way to draw it, not a record of how it was drawn.

### 11. Common mistakes

The `ice-styles` skill, `references/narration-grammars-1.md` section 4 (common mistakes and transitions that do not belong to the grammar).


## Collage explainers (archival desk style)

Use when the narration argues from real material: documents, clippings, photos, maps, screenshots, quotes. The grammar (look, medium-specific moves, timing, rhythm, transitions, palette, type, common mistakes) is owned by the `ice-styles` skill, `references/narration-grammars-1.md` section 3; camera arithmetic by the `ice-motion` skill, `references/camera.md`. This file adds the build rules those owners do not hold. "Vox-style" names a design vocabulary only: never use that company's logos or imply it made the film, and never default to any brand's skin; a brand skin is an explicit user decision.

### 1. Material

- Real material as the main picture (the width floor) and static paper texture: the `ice-styles` skill, `references/narration-grammars-1.md` section 3.
- Real assets only: public-domain and openly licensed archives, official sources, the user's files (`ice-assets` for licenses and credits). Never recreate a photograph; an invented photo reads as slop. A recreated document is allowed only when flagged on the frame as a recreation.
- Before any build, make a design pass: a contact sheet of the real assets at small tile size, approved before any composition (by the critic in auto mode, on the stage's review card in step mode). It is about ten times cheaper than notes on a finished composition.

### 2. Scene construction

- One scene accumulates 3 to 5 elements: each phrase adds one, old ones stay. Useful set: subject, evidence (document, clipping, screen), scale (number or repetition), label or date stamp, a hand mark. Strong journalistic explainers run about 20 beats per 30 s.
- Build objects, relations and the camera first; paper texture and decoration last.
- Readable text drawn last, reading the cumulative desk in reading order after each new card, no replay after a push-in: the `ice-styles` skill, `references/narration-grammars-1.md` section 3. When neighboring cards form a wrong sentence, remove a card or write the qualifier in full.
- Repetition shows scale: one image multiplied into a grid, or a photo pulling out to reveal it sits on a cover.

### 3. Reveal actions

Reveal rotation (the action list and the at-most-3-in-a-row rule): the `ice-styles` skill, `references/narration-grammars-1.md` section 3. Add the circle reveal to that list. Static-card or side-by-side layouts at most one third of beats; no two consecutive beats share a layout recipe or treatment.

Technique floor for a 60 to 90 s collage film: at least one zoom-isolation swap (push into a detail until it fills, then swap), one inverse zoom arrival spent on a payoff beat, two drive-pasts or scale traversals, one background-dropped cutout, one newsprint layering moment, and the circle reveal for the thesis.

Zoom-in contract: a push into a photo has exactly two legal continuations: the background drops out (the subject becomes a cutout), or a full-frame hold with callouts. A push into a photo that then cuts to an unrelated composition is banned. When the technique floor and this contract conflict, the contract wins.

### 4. Timing

Camera and element timing, archive photos at the cut, underline, ellipse, highlighter, typing, map fills, first event, tempo tiers and speech sync: the `ice-styles` skill, `references/narration-grammars-1.md` section 3.

| Item | Value |
|---|---|
| Short film shape | 30 to 60 s, 8 to 14 shots, one sentence each; shot 1 is the question; first surprise within 5 s; last shot a takeaway of five words or fewer |

### 5. Camera recipe (collage scenes)

Per scene: born in a close-up of the first asset (zoom about 1.4 settling to about 1.32), glide to the second asset as it enters, zoom out to the home framing as the title appears, then hold still at home until the transition. Zoom-out takes 1.0 to 1.2 s; text is scheduled at least 0.1 s after the zoom-out completes (text born during the zoom feels cropped). Panorama pans 2.5 to 3 s. Between scenes push through about 0.9 s before the cut into the next scene's first asset, which appears within 0.1 s after the cut. No other scale animation on the rig. Rig rules (overscan, what sits outside the rig, zoom from the target box): the `ice-motion` skill, `references/camera.md` section 3. Camera landings from what must be read now and neighbor labels pushed out of frame: the `ice-styles` skill, `references/narration-grammars-1.md` section 3.

### 6. Transitions

Hard cuts on punctuation and the signature moves: the `ice-styles` skill, `references/narration-grammars-1.md` section 3. Transition counts per film and the crossfade ban for collage: the `ice-motion` skill, `references/transition-policy.md` sections 2 and 3; hand a concrete object across the cut instead. Velocity-matched seams and the seam gate: `ice-motion` and `ice-qa`.

### 7. Captions and words

Captions off by default: the words live in the picture (the `ice-type` skill, `references/captions-system.md` section 2). Highlights always animate on (bar grows, circle draws), never appear static. Anchors are bold small caps of three words or fewer with a curved arrow whose tip touches the subject; an arrow without text has no point. Type for names and places: the `ice-styles` skill, `references/narration-grammars-1.md` section 3.

### 8. Sound

A silent collage explainer feels unfinished: use a quiet bed with hits per shot and a lift on the last line, voice always on top (`ice-audio`).

### 9. Common mistakes

The `ice-styles` skill, `references/narration-grammars-1.md` section 3. Also: flat drift over cards (the slideshow tell); recreated photographs.


## Code, pull request, product UI and website explainers

Narrated films that explain software. A product promo without a leading voice belongs to `ice-film` (UI walkthrough or product launch types).

### 1. Pull request or code change

- Ingest the real change (title, description, diff, commits, authors) through the user's own tools. If the fetch fails, stop and report; never fabricate PR contents.
- Explain the change, not the diff file by file, and never read the description aloud. Show the behavior in motion (a mechanism beat).
- Archetypes: changelog, feature reveal, fix explainer (symptom, then cause, then fix), refactor walkthrough. Tests and refactors are not presented as product features.
- Lead with what users get, then the code.
- Show 2 to 4 real diff hunks in total, about 4 to 12 lines each; a whole file is unreadable at video scale. Quote code as a literal block; give the caret somewhere to rest; scrolling eases and settles, never snaps.
- A version number is the one fact you must never invent. Numbers that are not stakes move off the script onto a counter.
- Credits close: lead with the people who committed, ordered by commit count; the PR opener alone is not the author.
- Voice: plain, technical, unhurried; no hype.
- Pace and per-frame word budgets: the `ice-audio` skill, `references/voiceover.md` section 3 (use the explainer TTS budget). The whole film stays under about 400 words; the sweet spot is about 155 words or fewer.
- A mechanism diagram sequences at least three effects (entrance, development, settle); it never enters and freezes.
- Keep the caller's repository clean: project files go to the user's chosen output folder, never into the repository being explained.

### 2. Showing an interface inside an explainer

Choose per passage and keep roles clear:

| Need | Use |
|---|---|
| Exact wording or state | Screenshot of the real product |
| A real interaction and its response | Recording (fixed frame rate) |
| A concept with editable states | An authored component rebuilt from the real UI (real layout, labels, colors, fonts, radii, simplified) |

- Show the whole interface for orientation first, then a closer view to read a control. Judge text at delivery size: a sharp capture can be unreadable in a phone inset.
- An interaction needs a target, an action, a visible response, and time to register. A drag needs contact, displacement and the result (or the rejection).
- Product UI fills about 70 to 80 percent of a landscape frame's width when it is the subject.
- Headline over a UI zoom: keep it fully in view (zoom up to about 1.1) or zoom far enough that it leaves the frame (about 1.3 or more); in between it gets cut in half.
- Build order: background, camera, headline, screens, cursor last so it stays on top.
- Cursor: time each click to a spoken word; it arrives a beat before it clicks, moves on gentle curves, presses with a small dip; hover states change. No clicks in the first 0.7 s of a scene.
- Typing at real speed (about 25 characters per second), 0.5 s pause after each result.
- Real-time demos usually play 1.5x to 2x faster; recompute after the real voice exists.
- Chats are real threads: the request appears before its result, earlier messages stay, the thread scrolls.
- A non-chat product shows its UI in two states: the before (the problem), one press of its action, items moving to the after. Never a screenshot slideshow.

### 3. Websites are filmed, not pasted

- Capture the full page at 2x pixel ratio plus, in the same session, the measured boxes of every target you will point at. Flatten fixed and sticky headers, dismiss overlays, scroll first to trigger lazy images, wait for fonts. Pick the first visible match of a selector (hidden duplicates in navigation are a known trap).
- Capture failure is a hard stop: report it; never manufacture a synthetic replacement of a real site.
- Never use browser screen recordings as page footage (unstable frame rate, lazy-load and sticky-header artifacts, no alignment to words). Camera moves happen on the long capture.
- Techniques: scroll, tour, magnify, mark. One technique at a time: scroll, stop, mark or magnify, then scroll again; at most 2 marks per page.
- Scroll at about 10 percent of page height per second, decelerate before the key line, stop it near the viewport center for 1 to 2 s.
- Annotations are pinned to page coordinates, never screen coordinates, and their geometry comes from measured boxes (eyeballing drifts about 30 px; more than 8 px off on a still is rework).
- Source resolution must be at least frame size times the maximum zoom (illustration only: a 1080p frame pushed to 1.15 needs about 2200 px of width).
- Use real captures only for the user's own products or with permission; third-party sites carry terms and cookie banners.

### 4. Terminals and code cards

- Logs come out in bursts, never per character; commands type at human speed; a frozen line holds suspense with nothing blinking.
- Code walks: one continuous line position drives the camera and the highlight band together.
- Real tool and app skins are reproduced exactly; never invent a third-party product's interface for a claim about it.
- Code blocks are full-bleed; when captions are on, keep code above the caption band.

### 5. Truth rules

All of section 5 in `references/research-and-facts.md` applies: real wording, shipped features only, example data that looks like example data, no invented metrics, testimonials or prices.


## Mechanism, math, scale and machine explainers

Use when the narration explains how something works inside. Grammar specs (colors, stroke widths, measured easings) are in `ice-styles`; easing math in `ice-motion`.

### 1. Concept transform (one structure turning into the next)

- Each shot names "who turns into whom". With no transform object, use another grammar.
- The first frame is the object itself (axes, grid, curve, shape); titles and formulas come later.
- At most two points on screen at once; a third needs earlier ones to become part of the picture or leave.
- A color table first: at most four semantic colors, and symbols in formulas share the color of their objects. Never change the color coding midway.
- Hold still during waits: no slow push, breathing or floating.
- Pacing: a single animation 1 to 3 s plus about 1 s of wait; one concept 8 to 20 s.
- Speed table (narrated math films): title 1.5 s plus 1.0 s wait; key equation 2.0 plus 2.0; transform 1.5 plus 1.5; supporting label 0.8 plus 0.5; fade out 0.5 plus 0.3; the "aha" 2.5 plus 3.0. A 2 s pause after a key reveal is never wasted.
- If you would explain it "first X, then Y, then Z", animate it. If you would explain it by pointing at parts of one picture, keep it static and point.
- Five boxes with clear labels beat twelve with abbreviations; merge "X" and "the output of X".
- Complex systems: zoom into one part, explain it, return to the whole.
- Scene durations: title 3 to 5 s, concept 10 to 20 s, equation 15 to 25 s, algorithm step 5 to 10 s, aha 15 to 30 s, conclusion 5 to 10 s.
- Vary consecutive scenes (dominant color, layout, entry, weight); no two identical in a row.
- Avoid: bloom and navy gradients that read as a tech slide deck; linear or generic easing with many fast animations.
- Text inside math engines: Latin monospace only where the engine's text renderer kerns badly; Arabic needs its own text path (`ice-arabic`, `ice-engines`).

### 2. Scale world

- Write the visual metaphor first: the abstract concept as a concrete object (cell, gear, pipe, city, water drop); never only a glowing ball with labels.
- At least one state change per sentence (pop, morph, dive, pull out). Two sentences with no change: add an event, not floating.
- The subject settles and holds; only the environment (distant particles, clouds) keeps moving gently.
- Before diving into an object, the target holds at least 0.3 s and lights up; zoom is interpolated logarithmically; never zoom a bitmap.
- Pull-outs reveal scale and should be at least as common as push-ins; zooms are travel and reveals, not fillers.
- Callouts: thin leader line then typed text; one callout per sentence; hold about 3 s.
- Avoid: everyone breathing to look "alive"; outlines or mid-gray grounds that slide the look into corporate flat illustration.

### 3. Machine metaphor

- List the concept's actions, then find a made object a general viewer recognizes that performs those same actions step for step (illustration only: a turnstile for "one at a time", a sieve for a filter, a ratchet for "only forward", a sluice for a queue). Say both descriptions aloud; if they do not line up step for step, pick another object.
- One part carries the story and alone gets the accent color.
- One model of time drives every part; nothing floats and nothing idles. Richness comes from construction, not surface pattern.
- Words on the machine come from its live state, not from a script running beside it.
- Optionally two films: the machine being drawn, then the machine running.

### 4. Technical diagram

- Define the final topology first; reveal in the order the viewer should understand the system.
- Choose the structural relation and keep it: chain for sequence, bracket for part and whole, orbit for convergence, radial for a system, grid for comparison, rows for evidence.
- Decide what lines mean before drawing any. Arrows only where direction is ambiguous.
- Technical traces draw near-linear; nodes and labels activate with easing. Connectors draw before nodes light; a gray to accent recolor is itself a narrative action.
- Labels never appear before their target. No empty rounded rectangles, no generic node mesh, no fake complexity.
- A diagram reveals a mechanism; a chart proves a claim; motion shows what changes.

### 5. Continuous action (one hero, one journey)

- One hero from the first second to the last; it never leaves the frame; the world changes around it.
- Always moving (looping parallax layers, speed lines), but slow the background for reading instead of stopping.
- Numbers are props in the world; the hero passes in front of them; changing numbers roll.
- Change viewpoint instead of cutting (side, head-on, banked, top-down); never three consecutive scenes from the same angle. Each fact gets its own instrument (a gauge, a map, a profile, an interior view).
- A route map simulation is the cheapest monotony breaker: marker on the path rotated to its tangent, stations popping as reached, map camera starting close then widening, totals after the zoom-out.
- Comparisons happen inside the same world, not in split panels. Keep the hero's silhouette, color and frame position constant.

### 6. Numbers inside mechanism films

- Write the chart's one point first; its title is that conclusion; annotate only that point.
- Data grows when its word is spoken, never all at once after a title.
- Bars start from zero; a non-zero axis is stated on screen; one highlight color, the rest gray.
- Hold at least 0.5 s after a number settles.
- Full chart grammar: `ice-styles`.
