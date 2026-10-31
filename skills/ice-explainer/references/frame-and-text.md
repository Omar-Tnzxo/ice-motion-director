# Frame and text in explainers

Spine stages 05 and 07. What fills the frame and how much text it carries. Typography details, caption styling and readability gates belong to `ice-type`; platform safe zones to `ice-engines`.

## 1. Hero and size

- Full frames: a big hero inside a built world, never a small element on an empty stage; the explainer floor (`hero_share`, `frame_fill`, `depth_layers`, `in_shot_motion`, `longest_still`) is in the `ice-motion` skill, `references/composition-and-staging.md` section 7.3. "Minimal" subtracts clutter, never fullness.
- Hero size and the support budget for explainers (invented hero 40 to 60 percent of the frame; 1 hero plus at most 2 supporting elements): the `ice-motion` skill, `references/composition-and-staging.md` sections 1 and 2. The hero enters on beat 1 or 2.
- Three size tiers only: hero, support (about 60 to 110 px at 720p), labels (about 22 to 30 px at 720p, never below the `ice-type` floor). Labels count toward the visible-element limit in the same `ice-motion` file, section 4.
- Naturally small subjects (timelines, formulas, tables, flows) still get a hero: a big number, an enlarged current item, a magnified detail.
- Size references at 720p: phone mock at least 300x520, person 96 px or more, box or document 160 px or more tall, book 240 px or more wide, formula main term 48 px and result 72 px or more, a year or big number 96 to 150 px, chart card 440x300 or more.
- Empty-stage rule: the largest content object under 110 px (720p) for more than 45 frames is a medium defect; under 80 px is high. A cleared, light-only opening can trip this; give it a temporary hero on the first beat.
- Show "many" as an orderly matrix of small squares lit on beats, never scattered small icons. Backgrounds are ground pattern only.
- Centering the subject group and placement opposite a person: the `ice-motion` skill, `references/composition-and-staging.md` section 5.

## 2. One focus at a time

- Exactly one element at full emphasis at any moment; everything already drawn stays quiet but legible. Hierarchy comes from the ratio between active and quiet, never from making everything dark.
- Accent discipline and color states (same meaning, same color, same place): the `ice-direction` skill, `references/color.md` section 6.
- At most one highlight moment per chapter (a reveal, thesis, big number or symbol), at least 90 frames long, never "a capsule, an icon and one line".
- The most expensive effect in the film appears at most twice: the core concept's first appearance and, optionally, the final callback.

## 3. Screen text

- Screen text is a distilled phrase (a few words; about 12 to 14 CJK characters), never a copy of the narration sentence. Measured: at most 8 display words readable at once in 10 of 15 explainers (median 7), labels naming things in the picture (median 5 per film), display text on about a third of the runtime (the `ice-film` skill, `references/genres/explainer.md`).
- On-screen words do one of three jobs: drive the eye, promote one sentence per act, name things.
- At most three text levels per screen. An explanation longer than two lines splits into two beats.
- Only one hero-sized number or big word per screen.
- Long-form budget: about 20 on-screen words per section; labels are 1 to 2 words under their element; if it does not get a word, it does not get drawn.
- Reading time and slower-audience modifiers: the `ice-type` skill, `references/reading-time.md` sections 1 and 2.
- Plates and scrims behind text, and readable text drawn last above every layer: the `ice-type` skill, `references/caption-placement-safe-zones.md` sections 4 and 5. Text on screenshot text gets a solid card.
- Numbers and big words land on objects in the film's world (a screen, a sign, a blackboard, a price tag) where the grammar allows; a separate flat text card inserted mid-film reads as a slide.
- A picture that does not read is fixed in the picture (the `ice-type` skill, `references/captions-system.md` section 2).

## 4. Captions decision

Captions on or off by context, text roles (never show the spoken sentence as display text at the same time): the `ice-type` skill, `references/captions-system.md` sections 1 and 2. Reserved caption band and animations yielding to it: same skill, `references/caption-placement-safe-zones.md` section 3. Explainer type policy, in line with those files:

| Situation | Captions |
|---|---|
| Cartoon stage, whiteboard, collage, persistent-world long-form | Off by default; key words live in the picture (signs, labels, handwriting); on only if asked |
| Platform requires burned subtitles for the audience | On, whole sentences, plain |

Subtitles go last in the render chain so overlays never hide them (`ice-engines`). Caption styling, line lengths and keyword-pop limits come from `ice-type`; Arabic captions from `ice-arabic`.

## 5. Real material

| Topic | Rule |
|---|---|
| Real events, places, products, documents, people | Real footage or images are required. A film with zero footage or image shots fails; under one third warns. "No footage" is not a design choice: degrade from video to images, then to the unfinished list. Exception: a product, service or policy explained as a mechanism (what it does, how it works), when its real look is not the point, may be fully drawn (the drawn variant; 4 measured professional explainers of a real product or policy carry 0 to 6 percent real material, the `ice-film` skill, `references/genres/explainer.md`); its logo and colours stay real (`ice-assets`) |
| A real web page exists | Never fake it with a mock; film the real capture (`references/grammar-selection.md` (section "Code, pull request, product UI and website explainers")) |
| Narration talks about an output or an effect | Show a real clip of it, muted |
| Abstract concepts | Invented visuals that embody the metaphor |
| Long dim UI panels or waveforms | Replace with real footage; they lose viewers |

## 6. First and last frame

- The first frame is often the cover on social apps: it carries the title or product name as plain readable text from frame zero, never a blank, a fade from black or a tiny unreadable window. This is for vertical and square social cuts; a 16:9 explainer published with its own cover or thumbnail may open on its first picture (3 of 13 measured horizontal explainers had text on frame zero, the `ice-film` skill, `references/genres/explainer.md`).
- The last frame shows the main idea clearly and holds long enough to read and screenshot.

## 7. Clutter limits

- Nothing within about 60 px of the frame edge at 1080p (under 64 px counts as touching).
- Bounding boxes never intersect except deliberate overlays (annotation on media, caption band, chip on footage).
- Same-color plates in one group read as empty boxes; give list chips distinct plates.
- No decoration without a one-line reason.
