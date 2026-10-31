---
name: ice-styles
description: >-
  Internal part of Ice Motion Director, not a command: start with /ice.
  Style catalogs for motion films: 51 film styles, 15 motion design styles, 32 drawing styles (hands),
  36 implemented art-history styles plus 17 research recipes, 9 narration grammars for voiceover-led
  explainers, 10 opener style directions and 6 explainer looks, a broadcast news family (the presenter
  news reel genre, three measured programme packages, sub-brand patterns, the glass studio reel), and a credited index of the community
  Opus 5.5 prompt library. Each entry gives look, medium-specific moves, palette, sound, when to use,
  when not to use and common mistakes. Called by Ice Motion Director workflows; use only when called by name.
license: Apache-2.0
metadata:
  author: Omar-Tnzxo
  version: 0.2.8
---

# ice-styles

Holds the style catalogs. A workflow (ice-film, ice-explainer, ice-remake, ice-edit, ice-lottie, ice-ideas) opens this skill to shortlist styles for a brief, to load the full entry of a chosen style, or to pick a narration grammar. Direction decisions (which style wins) are made in the ice-direction skill.

## The one rule: a style is a starting reference, never a default

- Never apply a style because it is listed first, because it is the nearest match to a keyword, or because a demo exists. Shortlist at least three candidates from at least two families and hand them to ice-direction for the pitch round.
- An entry locks the medium (look, palette logic, motion quality, camera vocabulary, sound palette). The brief decides everything else: subject, structure, opening, ending, copy, exact colours. Never take a demo's story, shots, props, composition or timeline.
- A film made in a catalog style Ice picked must still differ from that style's demo and from any bundled template on at least 4 of 6 axes. A style the user named is exempt on the axes it fixes (`ice-direction/references/anti-sameness.md` section 4a); it still never takes the demo's story, shots or timeline. That gate, its six axes, the per-project fingerprint and the default-look gate are owned by the ice-direction skill, `references/anti-sameness.md` (decision), and the ice-qa skill (check); run them there. Because a style fixes the medium, a style film wins its difference on the axes the style leaves open (structure and layout above all), never by recolouring.
- Every example, palette value and scene inside an entry is illustration only. A Sound line names the genre and instruments as the target for real library tracks and recorded SFX; it never makes sound by code a default (`ice-audio/SKILL.md` core rule 7), and loudness comes from the `ice-audio` profile table.

## Procedure

1. Read `ice/BRIEF.md`. Note film type, goal, audience, platform, mood, industry, language, brand inputs and available real material.
2. If the user named a style, find it in `references/catalog-index.md` (name, alias or id) and open its family file. No clear match: show the two or three closest and ask once.
3. Otherwise shortlist from the selection tables below: take candidates from the film-type row, cross-check against the mood, audience and industry rows, keep the ones that appear in two or more rows, and add at least one less obvious candidate from another family. Open each candidate's entry and drop any whose "Do not use when" collides with the brief.
4. For a voiceover-led film, also pick the narration grammar per section from `references/narration-grammars-1.md`.
5. Pass the shortlist (with one line per candidate: why it fits, what it risks) to ice-direction. After approval, write the style lock (see `references/style-method.md` section 4) into the shot table and log the choice in `ice/DIRECTION.md` with its source entry. At 05, copy the chosen entry's craft profile (its family default line plus its own line) into `ice/plan/craft-plan.json`, as the `Craft:` line of `references/style-method.md` section 4 says.
6. During production, keep the chosen entry open; check every frame against its "Medium-specific moves" and "Common mistakes".

## Selection by film type (film types follow the ice-film and ice-edit type files)

| Film type | Candidates (family file) |
|---|---|
| Product launch (physical) | glass product render, exploded teardown, 3D render CGI (screen-tech-3d, evidence-data); isometric (graphic-design); risograph (print-paper-craft) |
| Product launch (software) or UI walkthrough | dark tech keynote, living screencast (screen-tech-3d); flat vector, morph (graphic-design); t2 keynote UI grammar (narration-grammars-2); editorial light or flat pop with photos (directions) |
| App ad | flat vector, morph (graphic-design); variety-show captions (cartoon-film); marker comic (cartoon-film); flat pop with photos, poster color-block (directions) |
| Brand film | one-line drawing, line art (drawing-line); watercolour, ink wash (paint-wash); cut paper, silkscreen poster (print-paper-craft); art deco (graphic-design); dream glaze (paint-wash) |
| Logo sting | line art, one-line (drawing-line); liquid, morph, Bauhaus (graphic-design); 3D render CGI (screen-tech-3d); see ice-lottie when the output is Lottie |
| Kinetic type | Swiss motion, Bauhaus, pictogram motion, spy titles (graphic-design); y5 kinetic type grammar (narration-grammars-2); poster color-block (directions) |
| Data story | data storytelling, data physicalization, iso infographic, sticker explainer (evidence-data); t3 finance chart grammar (narration-grammars-2); halftone newsprint (print-paper-craft) |
| Social short | variety-show captions, sci-fi sitcom toon (cartoon-film); halftone dossier, risograph (print-paper-craft); microgame (games-toys); poster color-block (directions) |
| Hype promo | synthwave, sci-fi interface (screen-tech-3d); poster color-block, grainy gradient, cinematic dark (directions); microgame (games-toys) |
| Music video | 80s cel anime, cel boil (cartoon-film); impasto oil (paint-wash); liquid (graphic-design); synthwave (screen-tech-3d); collage (print-paper-craft) |
| Art film | any art-history entry (art-history-painters, art-history-eras); dream glaze, sumi-e (paint-wash); charcoal erased and redrawn (drawing-line) |
| Industry spot | pick by the industry table below; evidence looks when real material exists (evidence-data) |
| Narrated explainer | pick a grammar per section (narration-grammars-1 and -2); then a look: whiteboard, chalkboard, blueprint (drawing-line); isometric (graphic-design); the six explainer looks (directions) |
| Process or "drawing itself" film | any anidoodle hand (drawing-line, paint-wash, print-paper-craft): each ships a medium order whose last frame is the still |
| Same scene across eras | the speedrun mechanism and era specimens (art-history-eras) |
| News reel (presenter-led news or explainer reel, edit type `news-reel`) | presenter news reel and, only when the `identity` slot is "as they are" or "a mix", the measured programme package of the reference (broadcast-news); glass studio reel when the footage was shot for it (broadcast-news); visual journalism look (directions); y2 investigator collage (narration-grammars-1) |
| Footage edits needing a graphic layer (shorts, B-roll overlays) | variety-show captions (cartoon-film); halftone dossier (print-paper-craft); y2 investigator collage (narration-grammars-1); presenter news reel when the footage is a presenter take with news or explainer content (broadcast-news); caption rules are owned by ice-type |

## Selection by mood

| Mood | Candidates |
|---|---|
| Calm, contemplative | sumi-e, ink wash, watercolour (paint-wash); line art (drawing-line); aurora glass (screen-tech-3d, only with a brand reason); low-poly island (screen-tech-3d) |
| Warm, human | pencil and watercolour, storybook, folk tale (paint-wash); crayon (drawing-line); cut paper, toy theatre (print-paper-craft); mid-century gouache (paint-wash) |
| Playful | rubber hose, mid-century toon, marker comic (cartoon-film); paper pop-up (print-paper-craft); brick toy, game show (games-toys); pastel playful (directions) |
| Energetic, loud | risograph, halftone dossier (print-paper-craft); poster color-block (directions); microgame (games-toys); variety-show captions (cartoon-film) |
| Serious, sober | ballpoint, stipple, engraving (drawing-line, print-paper-craft); satellite briefing, archive light table (evidence-data); y2 investigator collage (narration-grammars-1) |
| Premium, luxury | art deco (graphic-design); glass product render (screen-tech-3d); oil on canvas, dream glaze (paint-wash); single-line engraving (drawing-line); luxury dark (directions) |
| Nostalgic | silent film, rubber hose (cartoon-film); pixel art (games-toys); urban sketch (drawing-line); retro analog (directions); synthwave (screen-tech-3d) |
| Tense, mysterious | liminal found footage (cartoon-film); scratchboard, charcoal (drawing-line); Munch, Dali era specimens (art-history-eras) |
| Technical, precise | blueprint (drawing-line); Swiss motion (graphic-design); exploded teardown, lidar survey (evidence-data); ASCII CRT (screen-tech-3d); brutalist mono (directions) |

## Selection by audience

| Audience | Candidates |
|---|---|
| Children and families | crayon (drawing-line); storybook, folk tale (paint-wash); paper pop-up, toy theatre (print-paper-craft); brick toy (games-toys); rubber hose (cartoon-film) |
| General consumers | flat vector (graphic-design); cut paper (print-paper-craft); watercolour (paint-wash); flat pop with photos (directions) |
| Youth and social-first | variety-show captions, sci-fi sitcom toon (cartoon-film); risograph (print-paper-craft); pixel art, microgame (games-toys); poster color-block (directions) |
| Professionals and B2B | dark tech keynote, living screencast (screen-tech-3d); briefing board, iso infographic (evidence-data); editorial light (directions) |
| Developers | ASCII CRT, living screencast (screen-tech-3d); blueprint (drawing-line); t1 continuous derivation (narration-grammars-1); brutalist mono (directions) |
| Investors and finance readers | data storytelling, data physicalization (evidence-data); t3 finance chart (narration-grammars-2); editorial light (directions); engraving (print-paper-craft) |
| Science and academic | microscope, lidar survey (evidence-data); stipple (drawing-line); y1 flat science world, t1 (narration-grammars-1); chalkboard (drawing-line) |
| Culture and heritage | ink wash, sumi-e (paint-wash); shadow puppetry, red paper-cut, ukiyo-e (print-paper-craft); archive light table (evidence-data); era specimens (art-history-eras) |
| Luxury buyers | art deco (graphic-design); glass product render (screen-tech-3d); oil on canvas (paint-wash); line art (drawing-line) |

## Selection by industry

| Industry | Candidates |
|---|---|
| SaaS, developer tools | dark tech keynote, living screencast, ASCII CRT (screen-tech-3d); flat vector (graphic-design); blueprint (drawing-line) |
| AI products | living screencast (screen-tech-3d); t1 derivation (narration-grammars-1); one-line drawing (drawing-line); grainy gradient (directions, only with brand colours) |
| Fintech and finance | data physicalization, data storytelling (evidence-data); Swiss motion (graphic-design); engraving (print-paper-craft); flat pop with photos (directions) |
| E-commerce and delivery | flat vector, isometric (graphic-design); cut paper (print-paper-craft); continuous action explainer look (directions); tilt-shift miniature (games-toys) |
| Food and drink | watercolour (paint-wash); rubber hose (cartoon-film); collage (print-paper-craft); impasto oil (paint-wash); paper and print (directions) |
| Health and medical | microscope (evidence-data); stipple (drawing-line); y1 flat science world (narration-grammars-1); pencil and watercolour (paint-wash) |
| Education | whiteboard, chalkboard (drawing-line); y3 whiteboard, y1 (narration-grammars-1); iso infographic (evidence-data); crayon (drawing-line) |
| Real estate and architecture | projection on white model (evidence-data); urban sketch, line art (drawing-line); tilt-shift miniature (games-toys); isometric (graphic-design) |
| Automotive and hardware | exploded teardown (evidence-data); glass product render, 3D render CGI (screen-tech-3d); blueprint (drawing-line) |
| Travel and hospitality | silkscreen travel poster, ukiyo-e (print-paper-craft); urban sketch (drawing-line); watercolour (paint-wash); tilt-shift (games-toys) |
| Fashion and beauty | art deco (graphic-design); glass product render (screen-tech-3d); collage (print-paper-craft); luxury dark (directions) |
| Energy, climate, environment | satellite briefing, lidar survey (evidence-data); data storytelling (evidence-data); woodcut (print-paper-craft) |
| Gaming | pixel RPG, pixel sprite diorama, microgame (games-toys); 80s cel anime (cartoon-film); low-poly island (screen-tech-3d) |
| Music and events | synthwave (screen-tech-3d); risograph (print-paper-craft); pictogram motion, Bauhaus (graphic-design); 80s cel anime (cartoon-film) |
| News, media, public sector | presenter news reel, glass studio reel (broadcast-news); y2 investigator collage (narration-grammars-1); halftone newsprint (print-paper-craft); visual journalism look (directions); satellite briefing (evidence-data) |
| Culture, museums, heritage | archive light table (evidence-data); shadow puppetry, red paper-cut, stained glass (print-paper-craft); art-history entries |
| Crafts and handmade goods | embroidery, toy theatre (print-paper-craft); oil on canvas (paint-wash); coloured pencil (drawing-line) |

For Arabic or right-to-left films, any style works only after its type and caption rules pass the ice-arabic skill (letterforms in the style's material, bidi, numerals).

## Narration grammars (voiceover-led films)

| Voice is doing | Grammar | File |
|---|---|---|
| Explaining scale or a mechanism, calmly | y1 flat science world | `references/narration-grammars-1.md` |
| Arguing from documents, news, screenshots | y2 investigator collage | `references/narration-grammars-1.md` |
| Reasoning step by step | y3 whiteboard | `references/narration-grammars-1.md` |
| Deriving how one thing becomes another | t1 continuous derivation | `references/narration-grammars-1.md` |
| Telling a first-person story or joke | y4 storytime | `references/narration-grammars-2.md` |
| Listing, quoting, opening with a number | y5 kinetic type | `references/narration-grammars-2.md` |
| Presenting a product or a tutorial | t2 keynote UI | `references/narration-grammars-2.md` |
| Describing numbers over time | t3 finance chart | `references/narration-grammars-2.md` |
| Guiding through a history with a presenter | y6 presenter explainer | `references/narration-grammars-2.md` |

## Files

| Open | When |
|---|---|
| `references/style-method.md` | Always, before applying any style: fixed versus free, style lock (with the `Craft:` line), the craft profile format, medium-true motion, transitions from the medium, one style per film and its exceptions, adapting a style from an image or tradition, building and validating a new style, music by family |
| `references/code-illustration-craft.md` | Before drawing any object, character or scene in code: construction, value and light (three tones, cast and contact shadows), surface and texture, line policy, depth, named groups and pivots, the art check |
| `references/catalog-index.md` | To match a style the user named, or to see every entry and its file |
| `references/family-evidence-data.md` | Satellite, LiDAR, microscope, archive, briefing board, white model, teardown, data physicalization, data storytelling, iso infographic, sticker explainer |
| `references/family-drawing-line.md` | One-line and line art, whiteboard, chalkboard, blueprint, crayon, ballpoint, coloured pencil, charcoal, stipple, scratchboard, urban sketch |
| `references/family-paint-wash.md` | Watercolour, storybook, line-wash, folk tale, ink wash and sumi-e, mid-century gouache, impasto, oil, broken colour, dream glaze |
| `references/family-print-paper-craft.md` | Risograph, halftone, woodcut, ukiyo-e, engraving, silkscreen, cut paper, toy theatre, pop-up, red paper-cut, paper lightbox, collage, scrapbook, shadow puppetry, stained glass, embroidery |
| `references/family-graphic-design.md` | Flat vector, Swiss, Bauhaus, constructivism, pictogram, spy titles, art deco, morph, liquid, isometric |
| `references/family-screen-tech-3d.md` | Dark keynote, living screencast, sci-fi HUD, ASCII CRT, synthwave and vaporwave, aurora glass, glass product, 3D render, ray-traced CGI, low-poly |
| `references/family-cartoon-film.md` | Rubber hose, 80s cel anime, cel boil, sci-fi sitcom toon, mid-century toon, marker comic, variety-show captions, silent film, found footage |
| `references/family-games-toys.md` | Pixel art, pixel sprite diorama, microgame, game show, toy bricks, tilt-shift miniature |
| `references/family-broadcast-news.md` | Presenter news reel (the genre: house grammar, colour-role contract, decision procedure per transcript line), three programme packages by the numbers (colours, type, motion, depth and 3D, sound, rhythm, fixed marks, reason rules; a package skin only when the `identity` slot is "as they are" or "a mix"), sub-brand patterns, glass studio reel |
| `references/art-history-painters.md` | Painter and movement styles applied to a new subject |
| `references/art-history-eras.md` | The same-scene changing-style mechanism, era specimens, research recipes |
| `references/narration-grammars-1.md` | Grammar selection rules; y1, y2, y3, t1 |
| `references/narration-grammars-2.md` | y4, y5, t2, t3, y6 |
| `references/directions-openers-explainers.md` | Ten opener and promo style directions, background and render menus, six explainer looks, style territories |
| `references/prompt-library-index.md` | To study how strong community prompts for a request type or industry are structured (credited index; never copy prompt text) |

## Boundaries

- Camera grammar, timing, easing curves, the cut and transition catalog: ice-motion.
- Typography and captions in general: ice-type. Arabic and RTL: ice-arabic.
- Music composition, mixing, loudness, beat grid: ice-audio.
- Engines, determinism, rendering and export: ice-engines.
- Asset licensing, fonts, truth sheet: ice-assets.
- Gates, critics, fingerprints, delivery reports: ice-qa.
- Intake, research, pitch round, approvals, colour psychology, the 4-of-6 distance rule: ice-direction.
