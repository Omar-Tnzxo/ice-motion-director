# Style method: how to use, adapt, combine and add a style

Read this before you apply any catalog entry. It holds the rules that are true for every style. Each catalog entry then adds only what is specific to that style. Styles drawn in code also follow `code-illustration-craft.md` (construction, value and light, surface, line, depth, animation-ready structure).

Contents
1. What a style is (and is not)
2. Fixed versus free: what a style locks and what the brief decides
3. Picking a style for the job
4. Writing the style lock for a film
5. Medium-true motion
6. Transitions made from the medium
7. One film, one style (and the scoped exceptions)
8. Characters, text and small objects inside a style
9. Adapting a style from a user image or a named tradition
10. Building a new style entry
11. Validating a style before it carries a film
12. Music by style family

## 1. What a style is (and is not)

- A style is a way of making marks. It is defined by five physical things: the MARK (what touches the surface and how), the EDGE (how a form ends), the ORDER of marks (what goes down first), the SURFACE (paper, board, screen, glass, film stock) and the PALETTE LOGIC. Write all five before any code.
- Changing the palette alone never makes a new style. A recoloured drawing is one drawing in another outfit. If two style entries could share one renderer with a palette swap, they are one style.
- Noise or grain laid over a flat vector picture is not a style. A style needs a form layer (clean shapes) and a medium layer (the physical process that makes the marks).
- A style is not a story. A style entry never supplies the subject, the characters, the shot list, the opening or the ending.
- "Premium", "cinematic", "modern" and "clean" are not styles. Translate each into concrete choices (restraint, precise type, controlled scale, tactile print, documentary realism) per brief.
- Style serves content. Look at the material available and at what each section must explain, then choose. Real footage, screenshots, photos or product output beat a code-drawn imitation: when real material exists it is the main picture and the style only frames, annotates and moves the camera over it.

## 2. Fixed versus free

| The style entry locks (keep all of it) | The brief decides (never take it from a demo) |
|---|---|
| Look and materials | Subject, message, characters (or none) |
| Palette logic (how many hues, what the accent means, light or dark base) | Exact palette values (derive from the brand or topic; entry hex values are examples) |
| Type families and caption treatment | All copy, all numbers |
| Motion quality (stepping, easing family, how things appear and leave) | Structure, beat order, durations |
| Camera grammar (the vocabulary of moves) | The camera path actually used |
| Sound palette (instrument families, foley materials) | Melody, score shape, mix moments |
| Native moves (a menu) | Which native moves the story needs, where the signature shot falls |
| Pitfalls | Opening and ending |

- Write the treatment (structure, logline, shot list) BEFORE reading any demo, sample or example film for the style. Use demos only to learn a technique (a brush engine, a rig, a shader, a mix), never their story, shots, props, composition or timeline.
- Never bend the topic toward the demo. Swapping new text into a demo is a technical check only, never a delivery.
- Because the style fixes the medium, a film in a known style wins its difference from the demo on the axes the style leaves open (structure and layout above all), never by recolouring. The distance gate and its six axes: the `ice-direction` skill, `references/anti-sameness.md` sections 1 and 4; run it there.
- Every concrete example inside an entry (a subject, a palette, a scene) is illustration only. Rebuild from the brief.

## 3. Picking a style for the job

1. Read `ice/BRIEF.md` slots: film type, goal, audience, platform, language, mood, brand inputs, available real material.
2. Shortlist three or more candidates from the selection tables in `SKILL.md`, from at least two different families. Include at least one that is not the obvious first idea: the first style that comes to mind for a topic is usually its cliche.
3. For each candidate check "Do not use when" against the brief. Drop any that collide.
4. Hand the shortlist to the ice-direction skill for the pitch round, critique and approval. Do not pick alone.
5. If the user named a style, match it by name or alias in `references/catalog-index.md`. No clear match: show the two or three closest and ask. If the user named no style and asks to choose, offer two or three that fit the topic and show the full family list in the user's language. Never drop, merge or rename catalog entries when showing them.
6. When the user names a style, still run the three-direction gate on composition (three different compositions or interpretations of that style, not three recolours). In unattended runs execute the brief's direction and list the two alternatives in one sentence each in the decision log.

Pick by job before looks (hand-made families):

| The piece is | Reach for (families) |
|---|---|
| warm, human, a brand with a smile | pencil and watercolour, crayon, cut paper, gouache storybook |
| serious, a report, a founder essay | ballpoint, ink and line-wash, engraving, stipple, charcoal |
| explainer, how it works, infographic | chalkboard, blueprint, whiteboard, isometric, ballpoint with drafted labels |
| loud, social, a launch | marker comic, risograph, poster color-block, halftone |
| a poster, a cover, one image people keep | engraving, risograph, cut paper, silkscreen, woodcut |

A brand that adopts a hand keeps it: every later hero, spot and card in the same mark is what makes a set read as a system. Record the chosen style in the brand's motion file so later films stay in it (or deliberately leave it, logged with a reason).

## 4. Writing the style lock for a film

Put these lines at the top of the shot table before any shot row (the shot table format is owned by the workflow skill; these lines are the style part):

- `Style:` one sentence naming the entry and its scope (one style for the whole film, or the scoped exception from section 7).
- `Medium recipe:` MARK, EDGE, ORDER, SURFACE, PALETTE LOGIC, NOT-ITS-NEIGHBOUR (the nearest style it must not drift into, and the one difference that keeps it apart).
- `Palette:` 3 to 6 named roles with values (ground, surface, ink, secondary ink, one or two accents). Within a film add only lighter, darker or transparent variants; a new hue mid-film only with a logged reason (the `ice-direction` skill, `references/color.md` section 5). Decide light or dark base once and do not jump between them. Colour psychology and the blue-purple default-look gate belong to ice-direction and ice-qa.
- `Characters:` none, hands and backs only, or an approved frame library or model sheet. Characters are built once and posed afterwards; never redrawn per shot.
- `Signature features:` testable statements (numbers, frame counts, curves), never adjectives. Write "overshoot to 108 % then settle by 0.5 s", not "bouncy". Map every signature feature to at least one moment in the film.
- `Craft:` the chosen entry's craft profile (its family default line plus the entry's own line, section 10), copied at 05 into `ice/plan/craft-plan.json`. There its `needs` become `use` rows and the plan's `style_needs` (an item marked `scoped:` becomes a `scoped` row with that limit); its `never` become `not_use` rows carrying the profile's reason and the plan's `style_never`; each `serves when` item gives the how of the row its trigger kind decides from the content (drafted at 02, mapped to shots at 04), and an item whose trigger is absent stays `not_use` with what was looked for and where. Every item whose device a default ban would block becomes an exemption row with source kind `style`, lifting the rule id the item names after `lifts` (illustration only: fewer than 3 tones for a flat style, sparse frames for a minimal style, glow for a neon style, dissolves for a luxury style, typing for a terminal style). The plan, its precedence and its exemption rows: the `ice-direction` skill, `references/treatment.md` section "Craft plan".

## 5. Medium-true motion

- Animate with the style's own motion logic, not one generic fade or ease for every style: ink moves with wind, washes spread from where the brush touched, misregistered plates lag a fast move and catch up, halftone dots swell, paper slides and presses, frescos barely move while gazes and hand-offs do. Medium-true motion is worth more than any amount of generic easing.
- Marks arrive; they rarely fade. In hand-made styles a mark is seen being made (it grows along its path) or it is placed whole; ink and paint never move once laid, paper and props do.
- Two frame-rate layers are common: elements stepped (on twos at 12 fps, on threes, 8 to 12 fps for pixel sprites or stop-motion), camera and light smooth on every frame. All smooth reads as corporate promo; all stepped reads as wobble or lag.
- Line boil (redrawing a line with a new seed every 2 or 3 frames) belongs to line-art and cel styles and to small motif areas. Reseeding full-screen strokes at 6 to 8 fps is flicker, not life: keep stroke positions fixed and let a direction field or light vary continuously instead.
- A picture in an art style must stay alive: one main action plus two to four motif loops native to that style (in short segments, motion must be fast enough to read). Never sacrifice that life for still images switching.
- Process films (a picture that draws itself): frame 0 is the bare surface; passes follow the medium's real order; a short beat of rest between passes; the last held frames equal the finished still exactly. Do not fade or scale anything in.
- Timing of process marks: long strokes cover more pixels per frame, short fiddly marks take longer per pixel (a useful cost model is a fixed cost per pen lift plus a length term).
- Camera moves inside a style are covered by the ice-motion skill (camera grammar, holds, push density). An entry may restrict them (for example: a drafting-office style has no camera moves during the process film).

## 6. Transitions made from the medium

- Design every transition inside the medium. Ask: in what physical way does this style's picture appear? (A watercolour floods, a print is pulled, a mosaic flips its tiles, a VHS tape loses sync, a cut-paper piece is lowered and pressed, a chalk board is wiped, a light sweeps and only lit pixels exist.) Use that process to contaminate the old picture and reveal the new one through the process's shape, then add a short accent or overshoot on the beat.
- In a film that changes style (section 7 exceptions), the transition into a segment is that segment's signature language, never a generic library wipe.
- Give complex signature transitions 0.48 to 0.5 s: with in-out easing the ends are invisible, so a 0.34 s complex transition reads as only about 0.2 s and looks like a plain wipe. Simple ones can run about 0.4 s.
- A beat accent on a transition must hit both the outgoing and the incoming layers on the same frame; accenting only the new layer makes the picture land 0.1 to 0.17 s after the sound.
- Default fades and plain hard cuts are a last resort in style-led films. The cut and transition catalog and its per-film-type policy (where crossfades are allowed) are owned by the ice-motion skill.

## 7. One film, one style (and the scoped exceptions)

Default: one style, one palette, to the last frame. People, animals, props, charts, captions and inserts all pass through the same medium. A clean unified film that slightly resembles slides beats a collage that changes style every shot. A shot with "another film's colours" (a white chart in a night film, a neon frame in a paper film) is redrawn.

| Film situation | Rule |
|---|---|
| Any single-subject film (launch, brand, explainer, story, ad) | One style throughout. Change composition and camera between shots, never the style |
| Same scene across eras or styles (art-history speedrun, a city across a century, a life from youth to old age) | Style changes per segment by design. Keep a fixed scene skeleton so the change is visible, one continuous anchor (a counter, a hero action on global time), each segment a living painting, each transition the next style's signature language. See `art-history-eras.md` |
| The story changes state (memory, dream, a before/after turn, a world crossing) | The medium may change only at that story turn, never as a parade of style vignettes |
| Opener or promo skin built from two directions | Two directions may be blended deliberately into ONE coherent skin for the whole piece. Log which elements come from which |
| A grammar change inside a narrated film | Grammars may switch by section, never within a section, and all sections share one theme palette (see `narration-grammars-1.md`) |

## 8. Characters, text and small objects inside a style

- Any object, character or scene drawn in code (SVG, HTML and CSS, Canvas, Three.js) follows `code-illustration-craft.md`: silhouette first, one shape language, three tones per object under one light, cast and contact shadows, a texture layer, one line policy, depth, named groups with pivots, and the art check at 05 and 07.
- Characters must pass through the style's material treatment (stroke texture, grain, paper multiply, ink bleed edge, halftone, plate offset). Characters that skip it look pasted on; this is the most common weakness across art styles.
- People and background are rendered on separate layers with their own stroke directions; a crowd sharing the ground's horizontal strokes "lies down".
- Weathering (peeling, stains, cracks, foxing) goes only on backgrounds, never across a character, where it reads as holes or dirt.
- A rough character is worse than no character. Without a validated character route, show hands and backs only, or make the object the protagonist. No faces on objects unless one anthropomorphic object is the deliberate protagonist and was approved. Character fidelity checks are owned by ice-qa; character route choice by the workflow.
- Text inside a style is drawn in the style's material where possible (stroked letters, carved letters, neon tube letters, mosaic letters at least two stones wide, chalk letters). In coarse-grain styles (pixel, mosaic) letters need thick monospaced strokes at least two grains wide, or thin letters break. Verify that every glyph exists in any font used; a missing glyph silently falls back. Typography rules in general are owned by the ice-type skill; Arabic letterforms by ice-arabic.
- Make small motifs bigger than you think: detail that reads at full screen in a still often vanishes in motion at final size. Check at final output size.
- Large areas go to the style renderer; small objects and characters sit on their own layer with finer parameters; outlines last. Big strokes shatter small props.
- Never change renderer parameters (stone size, stroke density) only inside the moving region: when it stops it reads as a patch.
- Regional palettes beat global colour jitter: give each region of a painted picture its own small swatch group and draw strokes from it, mixing back part of the underpainting value to keep the drawing.

## 9. Adapting a style from a user image or a named tradition

Borrow the hand, never the picture.

1. Separate four things: style language (brushwork, material, colour relations, light, form, space: survives a change of subject), composition tendencies (re-solve them per frame), content and motifs (famous figures, landmarks, signature objects: never auto-imported) and narrative (decided by the brief).
2. For a named artist, studio or period, scope it first (which period, which work family). A studio or a long career is not one shared look.
3. Look at the originals: at least three different works (different subjects, scales or lighting). Consecutive frames, crops of one painting or recolours do not count. If you cannot see enough, mark the gap; never claim to have seen.
4. Write the medium recipe (MARK, EDGE, ORDER, SURFACE, PALETTE, NOT) plus 3 to 5 observable traits as must-have, bonus and taboo, and two differences from the nearest neighbouring style.
5. Recompose with the style's own organizing logic (for example a one-corner composition with a large void, a tilted-up ground plane, a cropped foreground, a sky taking half the frame). Draw a DIFFERENT subject from the reference.
6. Compare stills side by side with the originals, iterate on the recipe (not the numbers); two or three rounds is normal. Measurements help you look; they do not decide.
7. No-copy rules: never trace, re-lay-out or re-stage the reference; no reference pixel is drawn; a living artist's signature motifs are never reproduced and labels use technique names; studio or franchise characters, costumes and title compositions are never copied. A similarity score cannot certify "not a copy". Embed a user's image only when they ask for exactly that.
8. Save the adapted style as a house style with provenance: file hash, filename, date, who supplied it, whether it is embedded, and one sentence on what was NOT taken from it.

Reference fidelity for remakes of a whole film (shot mapping, rhythm transfer) is owned by the ice-remake skill. "Make it like this" usually means the reference's energy and rhythm, not its skin; copying the skin of a supplied reference is a violation unless the user explicitly asks for that style, and even then take its principles and motion language, never its scenes.

## 10. Building a new style entry

Start from the nearest existing entry and change the MARK, never only the colours.

1. Name the medium physically: what touches the surface, how wet, how it lifts, what the surface does back. Ask "how is this picture made in reality?" and code that process.
2. Fill the entry fields used across this catalog: Look; Medium-specific moves (mark, edge, order of marks, stepping, motif loops, signature transition); Palette; Type and captions; Sound; Craft profile (below); Use when; Do not use when; Common mistakes (problem -> fix); Source or provenance.
3. Write signature features as testable numbers. Write a short creative seed with beats per second only to test the style, then delete it from the entry: entries never carry a story.
4. Render one still of the hardest subject in the style and critique it before using the style for anything else.
5. Run the validation in section 11. Until it passes, label the entry "research recipe".

**Craft profile.** It states what the style needs to reach its full capacity, so no style is made below it because nobody asked. Closed vocabulary: the 18 craft codes `camera`, `depth`, `composite`, `light`, `finish`, `type`, `transition`, `data`, `cutout`, `sfx`, `music`, `ambience`, `foley`, `silence`, `voice`, `rhythm`, `footage`, `identity` (what each covers: the `ice-direction` skill, `references/treatment.md` section "Craft plan").
- Each family file holds one line in its shared rules: `- **Craft profile (family default):** needs: <code> (<how, with a pointer to the owner file>), ...; serves when: <code> (<the trigger kind in the content>), ...; never: <code> (<the medium's reason>).`
- An entry inherits it, and every entry writes one line after its Sound line (just before its Source line when it has no Sound line), in the same item form: an entry whose own text matches the family default exactly writes the bare marker `- **Craft profile:** family default`, so no entry inherits silently; an entry whose medium adds to it or differs writes `- **Craft profile:** family default; needs also: ...; serves when also: ...; never: ...`. An entry may name a family code again to add its own how, or move a family `serves when` code up to `needs also`; it never moves a family need down to `serves when also`, and only its `never` removes a family need.
- `needs`: without it the style fails its own authenticity test (section 11). `serves when`: the content decides, by the trigger kind named. `never`: the medium excludes the whole dimension, with its reason. One code sits in one list only; a list with nothing in it is left out. Codes a profile leaves out are decided by the type default and the content triggers (the same `treatment.md` section).
- `scoped:` inside an item is a limit the medium sets on that dimension (a paper style's depth is shadow and gap, never faked 3D). It is kept with the item, never dropped, and the item's row becomes `scoped` whenever it is used.
- `lifts <gate>:<rule id>` inside an item names the default ban the item overrides whenever its row is `use` or `scoped`. An item that says "an entry whose Look ..." lifts only for an entry whose own text says so.
- `(research: validate)` marks an item the source did not state and that was reasoned from the medium (the sound of every entry whose source left sound unspecified). It is used like any other item and logged as research in `ice/DIRECTION.md`; when the frames or a fresh critic show it wrong for the entry, the entry's line is corrected.
- Tones, texture and line per family stay owned by `code-illustration-craft.md` section 8; music and foley materials per family by section 12 below. The family lines point to them and never restate them.

## 11. Validating a style before it carries a film

- Style authenticity test: an expert names the style in one second; every signature feature is present and correctly executed.
- Stills test: remove the artist name and famous landmarks; form, colour and light, brushwork and space are still recognizable; side by side with the nearest neighbour there is a real difference.
- Dynamic test: contact points, occlusion, texture staying on its surface, identity of characters, material unity, watched at normal speed. Good stills do not prove smooth animation; a reasonable written plan does not prove the picture works.
- Score a new or rebuilt style on a 100-point sheet with a pass gate of 80 and at most two rounds: signature hit 35 (minus 7 per missing must-have), medium credibility at 1:1 zoom 20, composition and narrative 15, figure and object form 15 (childish or sticker-like scores under 8), motion 10 (alive without flicker, motion on events), technical 5. Vetoes: signature under 25, or any hero figure instantly childish. A separate reviewer scores; when self-score and independent score differ, the lower stands. Below 80 after two rounds, the entry stays a research recipe.
- Honest status labels: research recipe (sources and a hypothesis, no validated implementation), single-scene implementation (covers that scene only), cross-scene validated (independent review of different new scenes). One branch of a family passing does not validate the family. Never present a research recipe as implemented quality.
- Film-level gates (motion density, blank frames, palette share, loudness) are owned by the ice-qa skill.

## 12. Music by style family

The sound line in each entry names instrument families and foley materials. The composition method, mixing, loudness and beat grid are owned by the ice-audio skill. Starting points by family (illustration only; the brief and the reference listening decide):

| Style family | Music direction that fits (tempo is a starting range) | Foley materials |
|---|---|---|
| Flat vector, product pop | bright pop or future-bass, about 120 to 150 BPM | pops, clicks, soft whooshes on shape wipes |
| Line art, luxury, architecture | felt piano, string swell, ambient around 70 to 80 BPM | pen whisper following tip speed, a chime on fill |
| Isometric, sticker explainer | light explainer bed around 112 BPM, marimba plucks | clicks and pops per landing, ticking count-ups |
| 3D render, clay, glass | ambient pad or pop, ASMR detail | thuds, squishes, glass taps, pops |
| Cel boil, collage, rubber hose | lo-fi, jazzy pizzicato, hot jazz for 1930s cartoon | cartoon SFX, paper, scissors, vinyl, slaps |
| Liquid, morph | future-bass, plucky arpeggio | gloops, pours, pitched whoosh per morph |
| Bauhaus, Swiss, pictogram | minimal techno or clicks around 120 to 124 BPM | clicks locked to the grid, one action per beat |
| Synthwave, VHS, neon | synthwave around 100 BPM in a minor key | gated snare, tape stop, crash on title slam |
| HUD, FUI, sci-fi | darksynth around 110 BPM | beeps, scan sweeps, lock tones, alarms |
| Pixel, 8-bit | chiptune around 150 BPM, at most 4 voices, no reverb | jump, coin, chest, menu blips |
| Aurora, glass UI | ambient pad, shimmer | subtle UI ticks; nothing fast |
| Variety-show captions | bouncy variety bed around 112 to 128 BPM | boing, pop, slide whistle, record scratch |
| East Asian ink, paper-cut, shadow puppet | instruments native to the tradition (plucked zither, bamboo flute, gongs, folk percussion) | brush, paper, lamp flicker, rod clicks |
| Evidence and documentary looks | restrained score in the style's own instruments; avoid generic piano and strings | the real material: paper, magnets, marker, instruments |

Never default to generic "piano and strings" for every style: score in the instruments of the style's sound palette.

Sources: lemomo-ai/lemo-opuscar (AGENTS.md, DIRECTOR.md, MIT); alexgreensh/anidoodle (`references/styles.md`, `realism-and-craft.md`, `craft-bar.md`, `workflows/adapt-a-style.md`, `workflows/explainer.md`, Apache-2.0); alchaincyf/huashu-art-motion (SKILL.md, `references/04`, `07`, `08`, `15`, `16`, `风格配方/_转场_迁移测试.md`, MIT, translated); Vincentwei1021/mg-styles-15 (prompts, template.md, lib/audio/README.md, MIT); bangtutorial/bang-motion (SKILL.md, MIT, translated); ideas from imMamdouhaboammar/motion-graphics-skills (rewritten, no text copied).
