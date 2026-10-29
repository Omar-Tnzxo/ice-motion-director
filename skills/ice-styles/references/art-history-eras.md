# Art history: era specimens, the speedrun mechanism, and research recipes

Era specimens are styles tuned for speedrun, time-travel and homage films, where the same scene passes through many periods. Research recipes are documented hypotheses that have not reached implemented quality: never present them as finished styles. Read `style-method.md` first. Every entry's examples are illustration only. Every implemented specimen in the source shared one fixed demo room: objects such as the wall, floor, window, tiles, dress, hair or watch named in a palette or a move belong to that room and are never part of the style. Map each palette role (ground, main surface, figure, accent, light and shadow sides) to this brief's own scene objects. Related era entries elsewhere: rubber hose (`family-cartoon-film.md`), shadow puppetry (`family-print-paper-craft.md`).

Contents
- The same-scene, changing-style mechanism
- Era specimens
  - Palaeolithic cave painting
  - Egyptian tomb painting, c. 1350 BC
  - Attic black-figure pottery, c. 530 BC
  - Gothic illuminated manuscript, c. 1290
  - High Renaissance sfumato, Leonardo c. 1503
  - Art Nouveau poster, Mucha 1896
  - Klimt golden period, 1907
  - Munch expressionism, 1893
  - Dunhuang mural, High Tang
  - Infinity polka dots, obsessive dot repetition
  - Dali surrealism, 1931
  - Hopper American realism, hard light blocks
  - Silver Age four-colour comic, Kirby-era energy
  - Monet water lilies and Japanese bridge, 1899
  - Keith Haring line figures, 1982
  - Picasso Blue Period, 1903
  - Adult-animation flat outline cartoon
- Research recipes (not implemented quality)
  - Giotto narrative fresco
  - Piero della Francesca geometric clarity
  - Raphael harmonious grouping
  - Michelangelo sculptural tension
  - Guardi vedute: air, broken light, loose edges
  - Lorenzetti readable social space
  - Pietro da Cortona Baroque flowing groups
  - Renoir warm-cool figures
  - Pissarro life in motion
  - Sisley air and weather landscapes
  - Gauguin synthetism and symbolic colour
  - Chagall memory space and emotional colour
  - Ma Yuan one-corner composition and reserve
  - Persian miniature painting, Herat and early Tabriz
  - Digital construction-paper cut-out cartoon
  - Feature 3D animation family: shape, material, performance
  - Dunhuang mural, Northern Dynasties

## The same-scene, changing-style mechanism

Use only for films about change across eras or styles (art history in one minute, a city across a century, a life from youth to old age). Explainers, story films and single-style pieces compose by subject instead.

1. **Fixed scene skeleton.** One composition held across all segments (key objects within about plus or minus 40 px) so the eye is anchored and the style change is visible. Coordinates are one shared constant, never per segment. Transitions start from objects inside the picture.
2. **Each segment a living painting.** Segments may last only 0.25-1.4 s, yet must move: one hero action plus 2-4 small loops built from that era's own motifs. List the three most recognizable formal elements of each era and animate them. Short segments need fast motion; very short ones step at 15-30 fps.
3. **Transition = the next style's signature language.** The next era arrives by its own physical process (a page turns into a manuscript, tiles flip into a mosaic, a wave sweeps into a woodblock, brush dots fill into impressionism, pixels block into 8-bit, a wireframe then scanline render into early CGI). Never a generic library wipe. Give complex transitions 0.48-0.5 s, simple ones about 0.4 s. The first segment has no transition: it draws itself (strokes written, prints layered, pixels lit row by row). A camera punch (about 1.03 to 1.0 over about 20 frames) on the first frame of each transition, hitting both layers.
4. **Beat grid acceleration.** One fixed tempo for the film (<tempo from ice/plan/cue-sheet.json>; the source speedrun sat near 128 BPM, evidence only) with segment lengths counted in eighth notes and getting shorter. Several shapes, illustration only: a steady staircase down to one eighth, then a long ending; pairs of equal segments that halve each time; a long-short-long breath before a final burst; one held era interrupting the acceleration once. Every shape ends on a segment clearly longer than the ones before it; transitions shrink with the segments. Acceleration comes from shorter segments, not faster tempo. Music method in ice-audio.
5. **Continuous anchor and an ending gag.** One continuous element (a year counter read from global time, each era rendering the same number in its own lettering; or a hero action on global time that is never replayed per segment). The ending is acted with anticipation, squash and stretch, follow-through and a secondary action: watching for most of the film, laughing at the end is what makes people share.

Do not treat a list of eras as a quota; three strong eras beat sixteen weak ones. Never pixel-copy a period work.

Every era specimen and research recipe below inherits this line and adds its own after its Sound line:
- **Craft profile (family default):** needs: finish (the era's medium recipe: the entry's Medium-specific moves), rhythm (each segment a living painting: one hero action plus two to four motif loops from the era's own motifs, mechanism step 2), transition (the next era arrives by its own signature process, mechanism step 3; a research recipe with none in its source uses the native process its card names, or the medium's own process, `style-method.md` section 6); serves when: camera (a speedrun transition: the camera punch hitting both layers, mechanism step 3; a single-era film: a slow move over the picture), data (a speedrun or a sequence of dates: the year counter lettered in each era's own way, mechanism step 5), depth (near and far: by the era's own means as the entry's Look states), type (words on screen: lettered in the era's own material, `style-method.md` section 8), music (music in the type or the brief: instruments native to the period or medium; in a speedrun one fixed tempo with shortening segments, mechanism step 4), foley (a physical action or material on screen: soft, period-true sounds in the era's materials; research: validate), silence (a reveal, the key line or a held era: the sound drops out; research: validate).

## Era specimens

### Palaeolithic cave painting (`01_cave`, implemented, quality 3 stars)
- **Look:** pigment soaked into a relief rock wall, charcoal contours with sprayed fuzzy edges, flat ochre fills dirtied by the rock, negative hand stencils, firelight flicker, Lascaux-style dark dorsal shading on animals.
- **Medium-specific moves:** rock relief at half resolution 960x540: height = fbm(0.0022, 4 oct) + 0.16 fbm(0.011, 3 oct) + 0.03 noise(0.05); normals by finite difference x52, light (-0.55,-0.62,0.56), shade = clamp(0.5+(dot-0.56) x 0.9); base mixed between `#ce925a`, `#6e4426`, `#b6643a` by two low fbm layers, x(0.72+0.55 shade); two grain layers; 10 random-walk cracks (turn +/-0.45 rad, steps 14-40px, 12% branching) each with a light line offset 1.6px beneath; vignette r 260 to 1180 outer alpha 0.8. Every shape: stroke with a sparse charcoal-dot pattern (width 2lw+7), then a charcoal pattern with 7% holes (width 2lw), then opaque flat fill over the inner half. Charcoal boil: shift the two 256px patterns randomly every 1/9 s (geometry fixed, grain jumps). Then paint a rock texture only onto pigment pixels (shadow to black alpha (0.5-v) x 150, light to warm white alpha (v-0.5) x 50, damp patches alpha up to 70): one full-screen composite, 19ms. Hand stencil: Gaussian spray (sigma 46, 3,200 dots alpha 0.15-0.6 plus sigma 28, 1,400 dots) with the solid hand mask cut out, fill each mask part separately. Firelight: radial gradient centre drifting +/-60/+/-36px, intensity 0.14+0.11 noise(9.5t)+0.04 sin 23t+0.03 sin 37t, overlay blend at alpha intensity x 2.6, plus a counter-breathing vignette. Motif loops: animals alternate two leg poses every 7 frames at 60fps, bob 9px, head swing +/-0.12 rad, paired animals in antiphase; 49 embers rising over 5.5s with flicker 0.3+0.7|sin|, additive; hand stencils pulse with independent noise. Signature transition: used as the opening; none tested.
- **Palette:** wall `#ce925a / #6e4426 / #b6643a`; charcoal `#21150d`; red ochre `#9c3520 / #74261a`; yellow ochre `#c9772f`, `#cf8f2c`; chalk `#f0dfbf`; bison `#8c3d22`; horse `#cf8236`; hand `#8e2a1a`; embers `#ffe082`; stencil fill `#f6e2bc`.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: light (firelight flicker with a drifting centre and a counter-breathing vignette over a rock relief lit from one side, entry Look and moves), rhythm (animals alternating two leg poses in antiphase pairs, embers rising, hand stencils pulsing, entry moves); serves when also: ambience (a fire in the scene: crackle and cave room tone; research: validate).
- **Use when:** origin-of-humanity or "first ever" stories, archaeology, speedrun openings, primal music videos.
- **Do not use when:** modern products shown literally; fine detail or text; bright clean brands.
- **Common mistakes:** mid-frequency relief 0.35 with normals x60 looked like camouflage or dunes -> 0.16 and x52; additive firelight washed ochres to pink -> overlay blend; multiply pigment made chalk white vanish -> opaque fills dirtied by texture; one combined path for palm and fingers left nonzero holes -> fill each part; motion 0.62 vs target 0.86 -> local motion only (bigger fire drift, more embers, animal bob), reached 1.06; firelight +/-0.16 / +/-90px shook the frame -> pull back.
- **Known weakness:** human figures too smooth and cartoony (downsample contours to 12-16 points with hand jitter); relief shading does not change with firelight direction.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/01_cave.md` (MIT, translated).

### Egyptian tomb painting, c. 1350 BC (`02_egypt`, implemented, quality 3 stars)
- **Look:** no perspective, flat fills with clean 2.2-2.8px dark-brown contour (no boil), profile heads with frontal eyes and both shoulders frontal, register bands, four-colour block borders, hieroglyph columns, mottled plaster surface with hairline cracks crossing figures.
- **Medium-specific moves:** no stroke renderer; period feel comes from conventions, palette and pattern density. Cached static layer of plaster, columns, borders, furniture, multiply mottled plaster over everything plus grain and 6 random-walk cracks. Hieroglyphs: 24 hand-built glyphs (ankh, sun disc, owl, falcon, eye, cartouche, scarab, water ripple and others) at about 50px, 10-20 strokes each, line 3.1 round caps; fill columns with a seeded generator, scale = column width/78 x (1.0-1.14), gaps 6-11px, no adjacent repeats, at most 3 of a glyph per column, scarab and water down-weighted 60%. Frontal eye: almond white, pupil r 4.2 under the lid, 3.2px kohl line trailing 18px. Linen: skin fill then white at alpha 0.9 for translucency, 27 fine fan pleats rgba(120,96,70,0.5) 1.3px. Wigs as long strands with alternating herringbone notches every 8px (not beads). Motif loops: scarab pushing a sun ball (x = 800+642(lt-0.394), ball rotation = x/radius, legs alternate every 4 frames); Aten rays ending in small hands opening on a 0.4-0.45s cycle with a travelling length wave +/-9% and line 2.2 to 3.8; water glyph zigzags stepping at 12fps; inscriptions rewrite themselves (every 0.12s erase 6 glyphs with wall texture and redraw by dash-length reveal in bright gold `#f6c846` with 10px gold glow, 0.36s each, about 18 at once). Signature transition: vertical tapestry strips drop in and bounce.
- **Palette:** wall `#eadcb8` / `#d8c597`; border red `#b8322a`, blue `#2a58a8`, yellow `#e2b13a`, green `#2e8a55`, cream gaps `#f2ead6`, black seams `#231a14`; gold `#e0ab38 / #a8741c / #f3d27a`; deep blue band `#1c2236`; sun disc `#c8372b`, rays `#c23a2a`; skin `#e6b282`; lapis `#2c56b0`, turquoise `#3fa6a0`; line `#2a1810`.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: depth (scoped: no perspective, figures in register bands, entry Look), finish (mottled plaster with hairline cracks crossing figures, clean contours with no boil, flat fills; lifts `art:shading`, entry Look and moves), type (hieroglyph columns rewritten glyph by glyph in gold; readable text only with a verified meaning, entry moves and Do not use when).
- **Use when:** ancient history education, museum and heritage films, mythic storytelling, 1350 BC stop.
- **Do not use when:** modern 3D products; you cannot verify real hieroglyph meaning for readable text; casual comedy that trivialises sacred imagery.
- **Common mistakes:** unconstrained glyph placement filled the wall with scarabs like stickers -> repetition limits and weights; bead-tile wigs looked like caviar -> long strands with notches; arm IK with the hand at the vessel side flung the elbow out -> hold from below, shoulder forward; motion 0.32 vs 0.90 -> large local actions (sipping cycle, glyph rewrite, Aten pulse) reached 0.84; semi-transparent orange over the sun disc turned it orange -> halo and ring outside the disc; thin-line motion barely registers in 480x270 frame differences -> rely on larger moving areas; texture generation 170ms on first frame -> pre-warm at boot.
- **Known weakness:** raised arm elbow stiff.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/02_egypt.md` (MIT, translated).

### Attic black-figure pottery, c. 530 BC (`03_greek`, implemented, quality 3 stars)
- **Look:** three ingredients only: near-black glaze silhouettes with no outline, incised lines scratched through in bright clay orange, added purple-red bands and white dot strings; terracotta ground with wheel-throwing streaks; meander and lotus friezes.
- **Medium-specific moves:** ground at 480x270: fbm (0.016, 4 oct) +/-30 plus horizontal band noise (x 0.006, y 0.85) +/-9 upscaled; 560 faint horizontal throwing lines (150-1050px, alpha 0.03-0.08), 420 dark and 120 light specks, 5 cracks with a 1px light lower edge; warm centre lift 0.16; vignette 380 to 1180 rgba(30,6,0,0.62). Silhouettes filled `#1b120d`; incisions 1.5-2px in `#e8904c` for folds, features and overlaps (clip to body union and incise arm contours so black-on-black stays readable); purple bands with white dots r about 2 every 11-17px. Hand-written Greek letters from a stroke table (height 30, stroke 3.4, per-letter height x0.9-1.06, baseline +/-6%, vertex jitter 0.7px, small round o). Animals in the same technique (silhouette plus purple saddle plus incised stripes), never a cartoon colour animal. Motif loops: friezes pre-rendered as strips and scrolled (meander period 60px drifting 48px/s, lotus period 76px drifting 30px/s) with an eased one-period jump on the beat; dolphins swim +/-9px and +/-0.12 rad on a 0.85s period with phase offsets 1.3; a ship heaves +/-4px and rolls +/-0.025 rad over 0.9s; a hanging lyre swings 0.09 sin(2 pi lt/0.8+0.5); rosette spins 1.6 rad/s alternating direction; steam as wavy black lines. Signature transition: the scene rotates in like a vase turning on its cylinder.
- **Palette:** clay `#dc6a2f`, light clay panel `#e8803f`, glaze `#1b120d`, purple-red `#8a2a37`, white `#f6ead6`, incision `#e8904c`, gold hair `#f2bd48`, reserved clay `#f3cfa4`, added white `#efe1c8`.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: finish (near-black glaze silhouettes with incised lines through to the clay on a terracotta ground with wheel-throwing streaks, entry Look and moves), rhythm (friezes scrolling with an eased one-period jump on the beat, entry moves).
- **Use when:** myth and classics education, museum films, sport or Olympic heritage, 530 BC stop, elegant two-tone brand animation.
- **Do not use when:** many colours are needed; faces must emote in detail; photoreal products.
- **Common mistakes:** a full-colour cartoon animal broke the medium -> render every subject as glaze plus incision plus added colour; scrolling a periodic band by exactly one period makes start and end frames identical (reads as no motion) -> add steady drift (22 to 48px/s); alternating motifs double the true period (76 not 38) -> wrap at the real period; identical seeds for two grain layers -> different keys; a wide shallow vessel held to the lips read as a beak -> custom IK, vessel tilt at most 5 deg, hand under its foot.
- **Known weakness:** skirt hems a little thick.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/03_greek.md` (MIT, translated).

### Gothic illuminated manuscript, c. 1290 (`05_gothic`, implemented, quality 3 stars)
- **Look:** burnished gold-leaf grounds with diamond tooling, parchment, ivy-leaf borders in blue, red and gold, blackletter text with vermilion rubrics, marginal drolleries (snails, mice), haloes stamped with dots, grotesque human-faced animals.
- **Medium-specific moves:** gold leaf per pixel: f = 0.52 + 0.42 fbm(0.0035) + 0.5 horizontal burnish noise (x 0.004, y 0.09, y frequency 20x x) + top-left light +/-0.05 grain, interpolated `#9c6a1a -> #d9a63a -> #f8de86`; diamond tooling 46px with each line drawn dark then light offset 1.2px (engraved), 4 dots per diamond; faint leaf seams every 118x125px. Gold mask derived automatically from the static layer: alpha = clamp((r-b-70)/50) x clamp((g-b-30)/40) x clamp((r-140)/40), which excludes parchment (236,223,194) and pinks, so every gold area catches the sweep without redrawing shapes. Diagonal sheen: gradient band on a 920px scratch at slope 0.45, multiplied by the mask, added at alpha 0.85, moving at constant speed x = lerp(150,1650,(lt-0.08)/1.15); four-point star glints where |u - sweep| < 70. Motif loops: ivy stems of about 120 points each swaying sin(2.1t+0.09i) x 5, leaves every 3-5 points scaled 1.05-1.45 rocking 0.42; stained glass sparkles (40 points, lit when sin(5t+h) > 0.6); a snail crawling 62px/s; a mouse running 360px in about 1s; a dangling mouse swinging 0.32 sin 5.5t. Signature transition: a parchment page turn.
- **Palette:** parchment (236,223,194); gold `#9c6a1a / #d9a63a / #f8de86`; red robes with gold stripes every 20px; blue cloak; vermilion rubrics; leaf blue, red, gold.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: light (burnished gold leaf lit from the top left with diamond tooling and sparkles, entry Look and moves), type (blackletter text with vermilion rubrics; real text only when verified, entry Look and Do not use when).
- **Use when:** medieval history, book and library brands, luxury gold reveals, fairy-tale openings, 1290 stop.
- **Do not use when:** minimalist modern brands; dense real Latin text you cannot verify; fast action.
- **Common mistakes:** eased sweep left the gold before reaching the key area -> constant speed; leaves at 0.85 scale too sparse -> 1.05-1.45; 50px blackletter overflowed -> 44px; baseline for motion checks at lt 0 polluted by camera punch -> measure from lt 0.35.
- **Known weakness:** blonde hair reads like a hood.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/05_gothic.md` (MIT, translated).

### High Renaissance sfumato, Leonardo c. 1503 (`06_renaissance`, implemented, quality 2 stars)
- **Look:** soft smoky edges with legible features, volume by gradient not line, dark warm interior with a window light pool, true one-point perspective tiles, aerial perspective landscape fading blue, varnish yellowing, canvas weave, craquelure.
- **Medium-specific moves:** whole static layer drawn then cached through a 1.3px blur (global sfumato). Tiles by true projection y = 420 + f h/Z, x = 960 + f X/Z, f 1029, h 5.75, Z from 16 stepping 1.4; darken toward edges, keep only the window light pool. Landscape: three fbm ridges bluer and paler with distance (`#9fb4b8 -> #7d9294`), silver river widening 3 to 16px. Figures off-screen then composited twice: blurred 1.6px opaque plus a sharp copy at alpha 0.82; no outlines; folds as light rgba(200,70,60,0.3) and dark rgba(40,0,0,0.45) gradients. Overlay cached: vignette 0.3 at 0.55 to 0.8 at the edge, yellow varnish alpha 0.07, canvas weave every 3px, 9,000 oil-texture marks alpha 0.022-0.028 width 5-10 random direction, craquelure alpha 0.32 plus a white-inverted copy offset 1px at 0.16 additive (lifted varnish edges). Motif loops: a bat-winged ornithopter crossing with ribbed fan wings flapping 0.5+0.5 sin(12t+phase); 24 river glints drifting downstream; 14 birds; light shaft (wedge blurred 28px, screened) dimming 0.75 +/- 0.35 as cloud shadow passes; 70 dust motes. Signature transition: divine light through the window.
- **Palette:** wall texture `#43321f -> #22180e`; tiles `#a88c64 / #5c2418`; far hills `#9fb4b8 -> #7d9294`; velvet sheen rgba(170,200,140,0.45).
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: light (a dark warm interior with a window light pool, a light shaft dimming as cloud shadow passes, entry Look and moves), depth (true one-point perspective tiles and an aerial-perspective landscape fading blue, entry Look and moves), finish (a global sfumato blur, varnish yellowing, canvas weave and craquelure, entry Look and moves).
- **Use when:** invention and science history, museum and heritage films, classical portrait homage, 1503 stop.
- **Do not use when:** crisp graphic brands; fast cutting; bright high-key palettes.
- **Common mistakes:** 26,000 oil marks at alpha 0.05 following noise turned the wall into Van Gogh swirls -> 9,000 at 0.025 random direction; inner-edge darkening 26px alpha 0.45 made a white body look like a glass dome -> 14px alpha 0.22 and blend fur radially; floor too bright and contrasty looked like vector art -> darken all but the light pool; blur 2.6 with sharp copy 0.38 inverted depth of field (subject blurry, window sharp) -> 1.6 and 0.82; motion 0.20 vs 0.46 -> larger flyer, more birds, cloud shadows, reached 0.37.
- **Known weakness:** feels static; animals too cartoony.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/06_renaissance.md` (MIT, translated).

### Art Nouveau poster, Mucha 1896 (`10_nouveau`, implemented, quality 3 stars)
- **Look:** whiplash lines that swell and taper, thick outer contour with thin inner lines, haloes with rosette patterns, flowing hair masses ending in spiral curls, muted sage-to-peach grounds, gold frames, lithographic grain.
- **Medium-specific moves:** variable-width ribbon: densify points with Catmull-Rom, offset each point w/2 along the normal both sides, fill the closed polygon; swell profile = thin at both ends, fat in the middle (sine envelope); spiral endings shrinking radius to 15%. Thick-outside/thin-inside trick: render figures off-screen with 2px inner lines, make a dark-brown silhouette copy and draw it beneath at offsets (-1.5,-1.5), (3.5,4.5), (2,2.5): 1.5px rim with a 4-5px lower-right weight for only 3 extra draws. Background cached: three-band vertical gradient, ring-and-dot lattice (rows 54, columns 62, odd rows offset 31), upscaled small fbm at alpha 0.5 for litho mottling, mosaic band with 9 colours, title with 7px dark stroke then cream fill, gold frame 6px plus two 2px brown lines; grain on top. Hair = one mass with edges waving sin(6t+0.035y) x 9 plus thin S-locks with travelling waves sin(7.4q+phase-7t) x (6+20q) ending in 1.2-turn spirals, width 14-18 down to 2.5. Motif loops: sun rising behind hills at about 5px per frame with 14 leaded rays turning slowly; stained-glass tiles every 17px around an arch; flowers sway sin(7.5t+phase) x 13 + sin(3.1t+2 phase) x 5, opposite clumps in antiphase; halo dots rotating +0.9t with inner petals -0.63t; S-shaped decorative steam ribbons leaning with the action. Signature transition: a gold-edged organic wave grows out from the halo (0.24s).
- **Palette:** line `#4e3320`; gold `#c9a24a / #9c7a2e`; cream `#f6eedb`; ground `#b9cba0 -> #cfd3a6 -> #ecc9a2`; skin `#f6dcc4`; hair `#e8bf55 / #f6dc8a / #b9862a`; pink `#e6aaa5 / #d48e8c`; poppy `#d9706a / #b4504b`; ironwork `#3d7763`; halo `#ebb8b2`, teal ring `#5f9a8a`.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: finish (whiplash ribbons that swell and taper, a thick outer contour with thin inner lines, lithographic grain, entry Look and moves); serves when also: type (a title card: hand-lettered in the poster's line, entry Use when and Known weakness).
- **Use when:** beauty, perfume, tea and botanical brands, theatre posters, 1896 stop, decorative title cards.
- **Do not use when:** tech minimalism; grim or urgent subjects; dense UI.
- **Common mistakes:** a line-only overlay pass drew hidden contours through the torso -> draw lines per part in order off-screen then add the silhouette rim; hair as seven 34px bands looked like sausages -> mass plus thin S-locks up to 18px; vertical steam crossed the face when the vessel rose -> lean steam away.
- **Known weakness:** stiff seated animal pose; title font not hand-lettered.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/10_nouveau.md` (MIT, translated).

### Klimt golden period, 1907 (`18_klimt`, implemented, quality 3 stars)
- **Look:** flat gold-leaf grounds and robes packed with spirals, eye shapes, concentric circles and black-and-white rectangles, against naturalistic modelled faces and hands; gold dust glints; mosaic flower carpets.
- **Medium-specific moves:** gold leaf per pixel f = 0.5 + 0.55 fbm(0.004) + 0.5 noise(x 0.003, y 0.08) +/-0.05, interpolated [120,78,18] -> [196,148,52] -> [246,216,128]; leaf seams every 96px; wall multiplied by an upscaled small fbm for brown-gold mottling plus 9,000 gold and dark specks. Robe pattern: 150 random motifs (30% tricolour concentric circles, 32% gold spirals on dark brown turning +/-3 rad/s, 22% eye shapes blinking when sin(2.2t+phase) > 0.86, 16% white dot clusters with red centres) plus 60 black-and-white vertical rectangles with gold edges at the hem, all clipped to the silhouette; 3px dark robe outline. Face and hands: radial gradients `#fbe8da -> #f0cfb8 -> #d8a88c -> #b88068`, blurred blush, only a 1.2px pale contour (flat ornament vs modelled skin is the style). Motif loops: diagonal sheen 520px wide alpha 0.24 sheared (x - 0.45y), additive, constant speed from -200 to 2300 in 1.15s, drawn before figures so they block it; 420 gold specks becoming four-point stars (radius s(0.6+1.1a)) rising 26px/s; 34 gold flakes tumbling down 150px/s; carpet flowers nodding 0.35r. Signature transition: gold leaf spirals out from the focal head (72px squares ordered by 0.78 distance + 0.12 angle + 0.08 random; each tile drops from 1.3x with rotation and a moving gradient, bearing spiral, eye or circle tooling, then fades to reveal the new frame; 0.5s).
- **Palette:** gold [120,78,18] / [196,148,52] / [246,216,128]; circles red-white-blue, blue-gold-red, purple-white-gold; skin as above.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: light (a diagonal sheen across the gold that the figures block, gold specks turning to four-point stars, entry moves), finish (gold leaf with seams and tooled motifs against modelled faces and hands, entry Look and moves).
- **Use when:** luxury, jewellery and wedding films, Vienna 1900 homage, romantic music videos, gold reveal moments.
- **Do not use when:** sober or minimal brands; budget-conscious looks; high-speed action.
- **Common mistakes:** clipping motifs one by one with source-in erased each other -> clip the pattern layer once to the silhouette; sheen at alpha 0.38 read as lens flare -> 0.24; stars too big like Christmas decoration -> smaller radius; still adjacent-frame pairs (20 of 36) -> add tumbling flakes, rising dust, bigger nods (0 of 36); spirals on a face read as a rash -> body only, fewer.
- **Known weakness:** a hand on the table did not connect to its sleeve.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/18_klimt.md` (MIT, translated).

### Munch expressionism, 1893 (`19_munch`, implemented, quality 2 stars)
- **Look:** long thin translucent curved strokes flowing along a writhing field, no outlines, blood-orange banded sky, the whole world undulating, sickly yellow-green shadows on faces.
- **Medium-specific moves:** about 3,600 seeds on a 24px jittered grid, each tagged by region; integrate along a time-varying direction field with per-region [steps, step, width, alpha]: sky [32,7,10,0.78], fjord [26,6,9,0.78], wall [42,7,13,0.5], floor [32,8,12,0.55], plus 0-8 random steps (each stroke 200-300px); stop at region borders. No outline, semi-transparent; underlay a same-hue flat (wall `#a8401e -> #5a1a14`) so gaps show colour, not black. Fields: sky 0.55 sin(0.011x + 0.018y - 2.4t); fjord tangent around a centre; wall vertical with +/-0.5 sine; floor toward the vanishing point. Sky bands chosen by wavy y: yy = y + 22 sin(0.014x - 2.2t), band 28px, 7-colour cycle. Whole-world warp last: rows shifted 9 sin(0.012y + 4.2t) + 4 sin(0.031y - 6t), columns 6 sin(0.009x - 3.6t), in 4px bands, with a margin at least the max displacement. Motif loops: bands flowing, whole picture swaying, a distant screaming figure with mouth opening 7+2 sin 9t and body swaying sin(3.2t) x 0.12, hair as travelling waves sin(9q - 7t). Signature transition: scream warp (old picture row-warped amplitude 70e; wavy front y = lerp(-180, H+220, e) + 80 sin(0.0055x + 7p) pushes down; above it the new picture settles (warp 60(1-e)); four 26px bands `#b82a1e #e2541c #f08a24 #f4c03a` ride the front; 0.5s).
- **Palette:** sky cycle `#e2541c #f08a24 #f4c03a #c8301e #e8743a #f6a63a #b82a1e`; wall `#a8401e -> #5a1a14`; face shadow rgba(120,150,70,0.4) blurred 8.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: finish (long translucent curved strokes along a writhing field over a same-hue underlay, no outlines, entry Look and moves), light (sickly yellow-green shadows on faces under a blood-orange sky, entry Look), rhythm (the whole picture undulates, entry Look and moves).
- **Use when:** anxiety, stress and mental-health storytelling, horror-tinged music videos, expressionism education, 1893 stop.
- **Do not use when:** reassuring or joyful messaging; small text (it warps); cheap frame budget (90-140ms).
- **Common mistakes:** copying Van Gogh's dark outlines made caterpillar strokes read as Van Gogh -> no outline, longer strokes (10 to 26+ steps); [26,6,7,0.85] still read as Van Gogh -> longer, wider, more transparent; whole-frame warp exposed dark edges -> stretch each row by 2 x margin; comic handwriting fonts break the mood -> period serif.
- **Known weakness:** wall was once misread as Van Gogh.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/19_munch.md` (MIT, translated).

### Dunhuang mural, High Tang (`20_dunhuang`, implemented, quality 2 stars)
- **Look:** earth-red plaster ground, mineral blues and greens, iron-wire line of even width, flying apsaras with trailing ribbons, scattering flowers, faded and flaking surface with exposed white plaster, smoke-darkened tops.
- **Medium-specific moves:** ground texture `#a5452f` (dark `#7a3020`) with faded medallions, top scroll border and alternating triangle valance with gold beads, lotus tile floor (cached). Iron-wire line 2.6px `#5a2414`, faces `#8a3a24`. Ribbon = travelling-wave point list turned into a variable-width band with white dashed pattern and red dots; back segment x = back + 230q + 64q sin(4.2q - 5.5t), last 30% rising (lateral travel 200px+). Ageing overlay: saturation blend alpha 0.3 to fade, multiply light earth texture alpha 0.5; flaking where fbm(0.0032) + 0.12 noise(0.03) > 0.3 shows plaster `#d8c6a2` with a dark rim at 0.28-0.3; protect focal faces and figures from flaking; 500 random-walk cracks; 380px smoke gradient at the top. Motif loops: apsara crossing at 300px/s at 1.35x with three travelling-wave ribbons, one arcing from the shoulder over the head; auspicious clouds (round heads with tapering tails) drifting 40-76px/s; 30 four-petal flowers spinning and flipping as they fall; lamp flame 1+0.12 sin 17t+0.08 sin 29t with halo; 10 paint flakes peeling off and falling. Signature transition: apsara ribbon sweep (front x = lerp(W+260, -300, e) + 110 sin(0.006y + 5p) moves right to left, new picture on the right; three ribbons in stone green, earth red, azurite (widths 44/38/32) with white dash pattern ride the front; fragments of the old picture flip and fall like peeling paint; 0.5s).
- **Palette:** earth red `#a5452f`; stone green `#3f8f6e / #6ab08e`; azurite `#2f5f8f / #5a86b0`; white `#ecdfc4`; gold `#d8b05a`; plaster `#d8c6a2`.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: finish (earth-red plaster with an ageing overlay of fading, flaking and smoke-darkened tops, an iron-wire line of even width, entry Look and moves), rhythm (an apsara crossing with travelling-wave ribbons, falling flowers, peeling flakes, entry moves), light (a lamp flame with a halo, entry moves).
- **Use when:** Silk Road and Chinese heritage, Buddhist art education, cultural tourism, elegant flight and ribbon motion.
- **Do not use when:** clean modern brands; content where religious imagery would be disrespectful; small text.
- **Common mistakes:** ribbons with 18-34px sway nearly vertical read as chair posts -> 200px+ lateral travel and a rising tail; flaking at frequency 0.006 gave sesame-seed stains -> 0.0032 with a higher threshold; cheek red too strong looked like scars -> alpha 0.32; a solid green head halo read as a swim ring -> alpha 0.28 with a thin line; warm subjects turned muddy brown after fading -> start brighter.
- **Known weakness:** apsara figures crude.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/20_dunhuang.md` (MIT, translated).

### Infinity polka dots, obsessive dot repetition (`21_infinity_dots`, implemented, quality 3 stars)
- **Look:** Inspired by Yayoi Kusama. Hand-drawn slightly irregular dots covering every surface including bodies, red with white and yellow with black, infinity-mirror rooms of light points, the self dissolving into pattern. Learn the medium only; never reproduce the artist's signature motifs as the subject (Kusama is a living artist; the source's pumpkin and mirror-room motifs are hers).
- **Medium-specific moves:** one travelling wave scales every dot's radius: wave = 0.82 + 0.28 sin(0.012 dist - 6t), dist from the focal point, so the room breathes outward. Dots on hexagonal lattices taken modulo the real period: wall big 30px at 104 spacing plus small 10px offset set, +/-25-50% jitter, each a slight ellipse at random rotation; floor 9 rows growing 6 to 28px, squashed to 0.42 for perspective. Patterned surfaces crawl: dots clipped to a garment scroll down at 46px/s (y offset modulo spacing). Mirror room: 13x7x3 grid of light points in 6 colours flying at 0.3/s toward camera, projection F150, small solid cores plus 3.2x additive halo. Rows of black dots on a gourd shape largest in the middle column, breathing 1 +/- 0.025 sin 5t from the base. Ending: dissolve into a full-screen 120px hex dot lattice growing from the focal point to 0.47 of spacing, cap radius, hold about 0.15s. Signature transition: dots bloom on a 58px hex grid in order of distance from the focal point (outBack to 0.74 of spacing, exactly tiling), the new picture clipped inside the dots; unfinished dots have white rims that fade (0.48s).
- **Palette:** red ground with white dots; yellow with black dots; 6-colour light points.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: finish (hand-drawn, slightly irregular dots on every surface including bodies, entry Look), rhythm (one travelling wave scales every dot so the room breathes outward, entry moves), light (infinity-mirror rooms of light points, entry Look), depth (floor dot rows growing and squashed for perspective, entry moves).
- **Use when:** immersive or obsessive-pattern music videos, art education on repetition, abstract brand transitions, endings that dissolve into pattern.
- **Do not use when:** you would be imitating the artist's identity as a product look; detailed figures must separate from backgrounds; readable text.
- **Common mistakes:** random scattered lights with big halos became bokeh -> regular grid with small solid cores; unbounded dot growth ended on a white screen -> cap radius, end on the lattice; figure in the same dotted red as the wall dissolved -> 4.5px outline and keep secondary colour boundaries clean; no hold frame at the end -> hold about 0.15s.
- **Known weakness:** figures separate from the wall only by outline.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/21_kusama.md` (MIT, translated).

### Dali surrealism, 1931 (`23_dali`, implemented, quality 2 stars)
- **Look:** academic smooth volumes with no outlines, low sun casting very long sheared shadows across a desert plain, melting soft watches draped over edges, stilt-legged elephants on the horizon, ants. Dali works remain under copyright: learn the language, never copy a specific canvas.
- **Medium-specific moves:** background split into three cached layers because shadows must sit between them (sky, sea, rock, ground -> shadows each frame -> wall fragments -> blocks). Volume fill: linear gradient plus an inner shadow made by a blurred dark stroke inside the clip. Long shadows: draw every silhouette black off-screen, shear onto the ground with transform (1, 0, -kx, ky, kx yg, yg(1-ky)) where yg is each object's ground line, composite once at alpha 0.55 blur 1.5px (no overlap darkening), clip to the ground; sun low front-left so shadows fall back-right; kx = 0.85 + 0.6 easeInOut(lt/1.2) so shadows lengthen. Soft watch mapping: disc local (u,v); above the fold it lies flat (y squashed 0.28-0.32), below it hangs: X = cx + u(1 - flare q), Y adds d(0.62 + 0.3 sag) + a central Gaussian droop + sine ripple; rim, face, 12 ticks, hands and highlights all go through the same map; flare -0.12 (negative spreads like cloth), drip 0.18-0.4, sag 0.1 to 1.4 over 1.2s, hands 4.5-6.5 rad/s. Motif loops: watches keep sagging; stilt elephant walking 70px/s with legs at pi/2 phase, knee bend at 0.52 height, 14Hz bob; 9 ants circling an orange watch; shadows lengthening; soft tails drooping (tip y + q^2 x 34). Signature transition: melt (old frame sags in 4px columns, sag = 0.22 edge e, stretched 0.3; new picture above a falling liquid edge with 26 round-headed drips 10-32px wide and 60-280px long, profile (1-u^2)^0.3, dark blurred rim and highlight; 0.36s, 86ms).
- **Palette:** sky `#22407c -> #5f88bd -> #e9dcae`; sea `#8aa6b8 -> #4f6f86`; rock `#e8c27a / #9a6a34`; ground `#d2ad70 -> #7a5129`; wall `#f4ead2 -> #cdbf9f`; watch gold `#f0d27c / #9a7426`, dial `#f6efd6`.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: light (a low sun casting very long sheared shadows, smooth academic volumes with no outlines, entry Look and moves), composite (the long shadows composited between the background layers, entry moves), depth (a desert plain to the horizon with stilt-legged figures far off, entry Look).
- **Use when:** time, memory and procrastination themes, dreamlike music videos, surrealism education, 1931 stop.
- **Do not use when:** literal product clarity; cheerful flat brands; tight budgets (about 47ms per frame).
- **Common mistakes:** shadows cast toward the viewer were cut by the frame bottom -> light from low front-left, shadows lie back-right; shadows baked into one background could not sit under walls -> split layers; positive flare with heavy drip made ice-cream cones -> negative flare; sag 0.35 to 1.0 did not read as melting -> 0.1 to 1.4; dark counter text on a dark blue sky -> cream text with shadow.
- **Known weakness:** figures still look like vector illustration.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/23_dali.md` (MIT, translated).

### Hopper American realism, hard light blocks (`24_hopper`, implemented, quality 3 stars)
- **Look:** flat walls split by hard-edged sunlight shapes, cool green shadow side vs warm yellow lit side, window mullion shadows, figures' own shadows on the wall, quiet urban loneliness, barely visible brush drag.
- **Medium-specific moves:** dual-version clipping: draw the room twice with the same function into two caches, shadow version (cool green wall, dark floor) and lit version (warm yellow wall, light floor); each frame draw the shadow version, then clip the moving light polygon and draw the lit version inside: hard edges for free, and the light moves as a whole. Figures the same way (shadow colours, then lit colours inside the slanted light band). Light offset dx = 30 - 95 easeInOut(lt/1.25), so the edge slides about 95px and crosses a face from half-lit to fully lit. Cast figure shadow on the wall: silhouette shifted (+150, +18), painted with the shadow version only inside the light patch, so it follows the pose. Mullion shadows 24px vertical plus one diagonal parallel to the patch top. Paint drag: vertically stretched fbm (x 0.06, y 0.006) mainly, generated at 1/4 resolution, soft-light alpha 0.2. Motif loops: slow light drift (core); a barber pole across the street with stripes rising 60px/s; blind cord swaying sin(4.2lt) x 0.07 rad; 26 dust motes only inside the lit side; blinds at uneven heights 0.25-0.7 with 10px hard shadows. Signature transition: sun shaft (old frame multiplied cool green rgba(70,120,110, 0.7 min(1,2p)); a slanted light block (260px slant) sweeps across revealing the new frame with a screened warm light fading 0.45 to 0 over p 0.6-1, a moving mullion shadow and a bright leading edge; 0.34s, 76ms).
- **Palette:** shadow wall `#5d8679`, wainscot `#4b6d63`, floor `#5b3d2b`; lit wall `#efcf8f`, wainscot `#d8ad68`, floor `#c98b52`; dress shadow `#7a2c2a` / lit `#cc4a3c`; hair shadow `#a8893f` / lit `#f3d67e`; brick `#b4553a`.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: light (hard-edged sunlight shapes on flat walls, a cool shadow version and a warm lit version, the slow light drift as the core motion, entry Look and moves).
- **Use when:** solitude and city-life stories, morning or late-afternoon mood, real estate and hospitality, 1942 stop; the hard-light method transfers to any subject.
- **Do not use when:** high-energy hype edits; overcast or neon settings; crowded scenes.
- **Common mistakes:** horizontal fbm drag at alpha 0.35 made walls look like marble -> near-invisible vertical drag; inserting comments mid-line during batch edits commented out code -> edit carefully; updo and long red dress read as adult -> long loose hair and a hair band read young; grey-white secondary subject in shadow -> lighter shadow white `#dcd6c8`.
- **Known weakness:** a secondary subject stays in shadow throughout (deliberate loneliness, but dark).
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/24_hopper.md` (MIT, translated).

### Silver Age four-colour comic, Kirby-era energy (`27_kirby`, implemented, quality 2 stars)
- **Look:** four-colour offset print with misregistered colour plates, Ben-Day dots at different screen angles, heavy spotted blacks with feathered hatching, cosmic "krackle" energy dots, extruded block onomatopoeia, multi-panel layouts and caption boxes. Reference grammar only: never reproduce named characters, designs or compositions; scope one artist period first.
- **Medium-specific moves:** draw the same geometry twice: colour plate (paper `#f4ecd6`, flat fills, dot screens: wall cyan pitch 9 r 2.7 at 15 deg, floor violet pitch 9 r 3.2 at 75 deg, skin red pitch 7 r 1.5 at 75 deg), composited offset (4,3) for misregistration; ink plate on white (each part filled white, shaded, stroked 6px black) multiplied on top, so white is transparent and hidden lines vanish. Spotted blacks: crescent = path minus path shifted along the light by d1 (clip path, then even-odd clip of full-screen rectangle plus shifted path, fill black); feathering band = same with d2, filled with parallel lines along the light (9px spacing, 2.6px); d1/d2: skirt 16/34, torso 14/30, sleeve 10/22, hair 12/26, body 16/34, tabletop 10/18; light (-0.86,-0.5). Motif loops: krackle clusters of 16-26 black circles, distance R rnd^0.7, radius R(0.05+0.2(1-d/R)), re-seeded at 12fps, pulsing sin(18t+i), six clusters riding an S-shaped energy stream; speed lines 70-180 v px jittering at 12fps; onomatopoeia popping in with outBack, 7 black extrusion layers offset (0.8d, d), two-colour fill, 26-point burst, 12fps +/-3px jitter; a close-up panel with eyes following the action and 44 focus spikes. Signature transition: used as an opening in the source; none tested (a halftone print-plate slide-in fits the medium).
- **Palette:** paper `#f4ecd6`; cyan, violet, red dot screens; yellow, magenta panel grounds; black ink.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: finish (four-colour offset print with misregistered plates, Ben-Day dots at screen angles, spotted blacks with feathered hatching, entry Look and moves), type (extruded block onomatopoeia and caption boxes, entry Look and moves), rhythm (krackle clusters and speed lines jittering at 12 fps, entry moves).
- **Use when:** superhero-style hype, cosmic or sci-fi energy, comic homage, 1966 stop, action-heavy social ads.
- **Do not use when:** it could be mistaken for a specific publisher's property; calm luxury; realism.
- **Common mistakes:** onomatopoeia at full size covered faces -> move and scale to 0.82; a large black ellipse on a close-up made fur read as tortoiseshell -> narrow edge crescent; rings drawn whole pierce the planet -> back half first, front half last.
- **Known weakness:** reads more like clean pop comic; lacks blocky fingers, extreme perspective and muscular tension.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/27_kirby.md` (MIT, translated).

### Monet water lilies and Japanese bridge, 1899 (`28_monet`, implemented, quality 2 stars)
- **Look:** a whole wall of pond surface in horizontal broken strokes, floating lily pads, reflected sky and willow shadows, green arched bridge with wisteria, no outlines, warm-lit and violet-shadow figures.
- **Medium-specific moves:** base repainted each frame: water vertical gradient `#b9c7e6 -> #8fa6d6 -> #6c84bf -> #5a72a8` with 4 pale sky reflections, 5 willow-shadow bands with edges sin(0.03y - 3.2t + k) x 14, about 100 notched lily-pad ellipses (rx 38-78, ry 12-21), 40% with flowers. Four stroke passes, outline 0: water cell 9 len 34 width 6.5 horizontal (angle 0 +/-0.06) boil 6; view cell 6 len 13 width 4.5 (diagonal above, horizontal below) boil 6; floor cell 12 len 34 width 8 boil 0; frames cell 6 vertical and horizontal boil 0. A bridge or thin structure gets its own layer on a dark backing (`#24452a`) with a 20px dark green underline and light green highlight, fine strokes cell 5, else foliage swallows it. Figures: flat, fine strokes cell 6 len 12, coloured shadow (warm yellow alpha 0.22 lit side, violet alpha 0.32 shade side), features in `#5a4f8a`. Motif loops: 160 bright horizontal glints flickering clamp(sin(t(5..11)+phase) sin(2.3t+i)) and jumping +/-5px at 10fps; lilies drift x + sin(1.3t+phase) x 7 + 6t; 3 ripples as dashed ellipses (ry = 0.22 rx) expanding and fading; 12 wisteria strings of 9 shrinking dots swaying sin(2.4t+0.9i) x 8. Signature transition: ripple (old frame displaced in 6px rows by sin(0.045y - 26p) x 46 x sin(pi min(1,1.2p)) x (0.4+|y-cy|/H); new frame revealed through 3,600 horizontal stroke ellipses (40-110 x 9-17) spreading in rings from the focus with y weighted 1.9; 3 pale dashed rings at the front, 140 water-light lines; fade-in after p 0.85).
- **Palette:** water `#5b6fb5 #7d8fd0 #9db5e0 #6aa0a8 #b7a6d8 #d9c8e8 #8fb8a8 #a6c4e8 #c8b0d8` (mix 0.45); leaves `#5f8f4a #7fae5a #3f6f4a #9cc070 #6f9a7a #b4cc78`; pinks `#f0a0b8 #f7d0dc #fff2f4 #e88aa0`; floor `#c69a6a #b07a5a #d8b08a #9a6a7a #8a7aa8 #e0bc90`; glints `#fffbe8 #fdf0d0 #f8e0ec #e8f4ff`.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: light (reflected sky, willow shadows and glints flickering on the water, warm-lit and violet-shadow figures, entry Look and moves), finish (horizontal broken strokes over the whole pond surface, no outlines, entry Look and moves).
- **Use when:** calm nature, spa and garden brands, meditation, impressionism education, water-themed transitions.
- **Do not use when:** hard-edged products; fast edits; budgets under about 105ms per frame.
- **Common mistakes:** whole-frame 6fps boil gave 47% frame difference, pure noise -> boil only water and view, freeze floor and frames; wisteria as thick lines looked like smooth pills -> dot strings; text unreadable on strokes -> cream glow blur 18 behind it.
- **Known weakness:** awkward space (wall as pond, floor as wood).
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/28_monet.md` (MIT, translated).

### Keith Haring line figures, 1982 (`31_haring`, implemented, quality 3 stars)
- **Look:** 13px round-capped equal-weight black lines over flat saturated fills, featureless dancing figures with radiating motion ticks, everything bouncing to the beat, yellow and green grounds. Haring's works remain under copyright: learn the line and rhythm language, do not copy his icons.
- **Medium-specific moves:** every part filled then stroked; dancing figures as 7 capsule limbs plus a round head, all stroked 2x line width black first and filled after (union outline); 4 poses as local keypoints switched at 8fps hard cuts with no interpolation; arc marks beside moving hands. Radiating ticks: n short straight lines (length 22-34, width 7-9) on an ellipse around any object, angles changed at 8fps. Beat: bounce = |sin(t x 128/60 x pi)|^0.6; characters dy = -12 bounce, offset half a beat; furniture squashes about its feet (sy 1-0.07(1-bb), sx 1+0.05(1-bb)); frames rock +/-0.025 rad. Motif loops: radiant crawling baby (two-frame alternation) with 14 rays alternating length at 8fps; three dancing figures in different colours and phases (one mirrored); a pulsing heart with ticks. Signature transition: radiant figure zoom (a V-pose dancer scales s = 0.15 x 320^easeInOut(p) from the focus; outline drawn 30px black, limbs filled white off-screen then the new frame painted only inside them; 16 rays jump at 8fps; fade-in after p 0.82).
- **Palette:** yellow `#ffd51c`, green `#16a54a`, black 14px horizon; red, blue, pink figures.
- **Sound:** not specified in source; score in instruments native to the period or medium (the film's beat drives all motion; the source sat near 128 BPM, evidence only).
- **Craft profile:** family default; needs also: finish (13 px round-capped equal-weight black lines over flat saturated fills; lifts `art:shading`, entry Look), rhythm (everything bounces to the film's beat, poses switched at 8 fps with no interpolation, radiating ticks changing at 8 fps, entry Look and moves), music (the film's beat drives all motion, entry Sound).
- **Use when:** music videos, dance and street-culture brands, joyful community campaigns, beat-synced social ads, 1982 stop.
- **Do not use when:** subtle or serious tone; realistic faces needed; slow narration without a beat.
- **Common mistakes:** reversed end caps on limbs left holes at joints under thick strokes -> fixed capsule limbs; thin hair lines violate equal-weight line and cross faces -> remove them; window bars over the figure -> draw bars beneath; zoom exponent 0.08 x 40^ too slow then a hard cut, 0.15 x 120^ left gaps needing a one-frame fade judged a flash -> 0.15 x 320^.
- **Known weakness:** the main figure is not Haring enough.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/31_haring.md` (MIT, translated).

### Picasso Blue Period, 1903 (`36_picasso_blue`, implemented, quality 2 stars)
- **Look:** strict blue monochrome, broad dry low-contrast strokes softened by blur, confident unwavering Prussian-blue contours, elongated melancholy figures, slow breathing. Picasso works remain under copyright: learn the language, do not copy a specific canvas.
- **Medium-specific moves:** monochrome flat base, then wide dry strokes (wall cell 34, len 110, width 34, jitter 4, vertical +/-0.5 noise(0.003), palette mix 0.8; floor same, horizontal), blurred 7px and laid at 80%; 900 faint dry-brush hairs alpha 0.07 length 30-90; props drawn as their own layer after strokes; contours `#0c1830` 5px with no boil. Elongate figures with one matrix about the feet (scale 0.84 x 1.12; smaller subjects 0.82 x 1.14) applied consistently to paths, layers and lines. Separate local colours only by value. Slow timing: breathing sin(1.8t) x 0.026 (about 2x amplitude, 0.45x frequency of normal), actions take 1.25s instead of 0.9s, steam rises at half speed. Motif loops: sea waves drifting faster nearer the viewer (20 + 0.25(y - 400)), 14 flickering moonlight shards, a pale long cloud crossing the moon, slow breathing. Signature transition: colour drained to blue then wide brushes sweep in (old frame colour-blended rgba(45,90,148, min(1, 2.2p)) then darkened; 6 wide strokes each H/6+90 tall, tilted +/-18, brushing left to right staggered 0.07; brush heads with 6-7px sine-wobbled edges; 26 bristle streaks 80-280px behind each head).
- **Palette:** `#132240 / #1d3866 / #2d5a94 / #6b8fb6 / #b6c8d8`, teal-grey `#3b6878`; contour `#0c1830`; light hair `#cbd8e0` above skin `#90a9be`.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: finish (strict blue monochrome, broad dry low-contrast strokes softened by blur, dry-brush hairs, unwavering Prussian-blue contours; the blue palette lifts `film:blue_purple_share` when the brief chose this style, entry Look and moves), rhythm (slow breathing, entry Look and moves), light (flickering moonlight shards, entry moves).
- **Use when:** grief, loneliness, poverty or night-time reflection, melancholy music videos, 1903 stop.
- **Do not use when:** upbeat or brand-colour content; information graphics; fast energy.
- **Common mistakes:** a touch of ochre broke the monochrome -> all blue, separate by value; cell 16 len 40 width 14 vertical strokes read as rain or a blanket (impressionist) -> wide, long, low contrast, then blur; round stroke heads tiled like rows of heads -> blur 7px (true fix: flat stroke caps); masking a rectangle out of the stroke pass left a flat patch -> draw props as a separate layer afterwards.
- **Known weakness:** figure shapes not melancholy enough.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/36_picasso_blue.md` (MIT, translated).

### Adult-animation flat outline cartoon (`37_adult_flat_cartoon`, implemented, quality 2 stars)
- **Look:** Inspired by Rick and Morty. Flat hard-edged fills with a thin dark grey round-capped outline shared by characters and props, large eye whites with small dot pupils and no glossy highlights, few curves for faces, low-contrast mottling kept to backgrounds, no realistic lighting. Reference grammar only: never reproduce named characters, designs or compositions; scope one season or period first.
- **Medium-specific moves:** SVG pipeline, not canvas: 1920x1088 coordinates with viewBox 0 4 1920 1080; stroke `#222323` default 2.35px round caps and joins, detail lines 1.6-2.6px; sharp hair tips as mixed corner paths, cheeks and limbs as smooth paths; group body, head, arm-plus-held-object, eyelids and pupils; set the still first, then move groups by their anchors; tails as a centreline plus width profile into a closed outline (never new random shapes per frame). Deterministic seek(t, state) with look, blink and jump parameters, no accumulated state, so frames render out of order; render with partial raster disabled for pixel-identical frames. Motif loops: slow lift of a held object with the shoulder anchored and sleeve following, small head turns, gaze shifts, deterministic blinks, tail swish; jumps as a sine arc with shared body and tail offset (no landing squash). Walking needs two-bone IK driven by the toes with phase advanced by real distance (not built). Signature transition: decided by the narrative; none specified.
- **Palette:** warm grey wall `#cdbf96`, wood floor `#9b7752`, skin `#efc4a0`, sky `#a7d6ea`, outline `#222323`.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: finish (flat hard-edged fills with a thin dark grey round-capped outline shared by characters and props, no realistic lighting or glossy highlights; lifts `art:shading`, entry Look), rhythm (small deterministic acting: head turns, gaze shifts, blinks, a slow lift with the shoulder anchored, entry moves).
- **Use when:** adult-comedy explainers, sci-fi gag videos, original-character social content in a flat outline idiom.
- **Do not use when:** the result could be mistaken for the show or its characters; you need walking or complex acting (no walk rig); realistic portraits.
- **Common mistakes:** dropping the SVG into a canvas-only render loses the characters -> render the page with its own screenshot pipeline or export video first; auto-traced outlines used as a skeleton -> group semantically; sideways walking of frontal characters gives scissor legs -> widen foot bases, shorten steps, turn the gaze, never mirror asymmetric costumes; SVG filter regions in 0..1 units clip -> use real canvas coordinates; mixing SVG and canvas modules -> isolate in closures.
- **Known weakness:** shapes and complex motion need work; no walk rig.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/37_rick_morty.md` (MIT, translated).

## Research recipes (not implemented quality)

None of these passed the 80-point gate in `style-method.md` section 11. Use one only by running the adaptation protocol (section 9) with fresh originals, and label the result honestly. Scores are self / independent where both exist.

### Giotto narrative fresco (`38_giotto`, research recipe, v2 self-score about 65, below the 80 bar)
- **Look:** bodies as simple weighty blocks, bell-shaped robes whose folds carry weight, gazes that lock figures together, architecture and rock as stage blocks rather than camera perspective, matte fine-grained fresco colour, ultramarine sky with gold stars, a red-and-gold decorative border. Cracks and fading are conservation state, not style.
- **Medium-specific moves:** build readable silhouettes and blocks first, layer by contact, then matte colour and folds; never let surface cracks stand in for form. Fresco pass: light blur, lime-white veil, multiplied plaster, pinhole giornata seams, then the border. Layers: soft ultramarine sky, rock slopes, angled grey-pink buildings with crenellations, red-white diamond eaves band, figures with large heads, almond eyes and directed gaze. Motion stays on the narrative action (a hand-over arc, hem sway, dust on landing, a bird crossing); about 27% of frame pairs are static by design. Gold-ground panel painting is a different medium: never lay gold over the whole frame. Signature transition: none in source.
- **Palette:** ultramarine sky, earth red, ochre and olive robes, grey-pink architecture, red-gold border.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: depth (scoped: architecture and rock as stage blocks, not camera perspective, entry Look), finish (a fresco pass of light blur, lime-white veil, multiplied plaster and giornata seams, then the border; cracks never stand in for form, entry moves), rhythm (motion only on the narrative action, about 27 % of frame pairs static by design; lifts `film:in_shot_motion` and `film:longest_still` at that share, entry moves).
- **Use when:** early Renaissance education, heritage, solemn narrative scenes about handing over and carrying weight.
- **Do not use when:** you need certified style fidelity; fast-cut energy; equating stillness with slow motion.
- **Common mistakes:** none measured beyond the known weaknesses; the card warns against using crack texture instead of modelling.
- **Known weakness:** simple faces and hands, sparse crowds, single-layer fold shading, uniform grass tufts; 36ms per frame.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/38_giotto.md` (MIT, translated).

### Piero della Francesca geometric clarity (`39_piero`, research recipe, older single-scene trial only, no v2 score)
- **Look:** large forms resolved first, simple complete volumes, proportion, interval, perspective and negative space constraining each other, clear even light with restrained warm-cool, crisp primary boundaries, detail subordinate to measure; order does not mean forced central symmetry.
- **Medium-specific moves:** block in the scene at low detail to fix proportions and negative shapes, check perspective, then model and colour; keep forms intact and occlusion readable even in fast action; tempera versus oil differences should be kept. Code starts from geometry and lighting. Signature transition: none in source.
- **Palette:** clear, cool-warm restrained; saturation varies by medium, no fixed cream filter.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: light (clear even light with restrained warm-cool, entry Look), depth (perspective, interval and negative space constraining each other, forms intact and occlusion readable, entry Look and moves).
- **Use when:** calm, ordered explainers, architecture or science subjects, early Renaissance education.
- **Do not use when:** you need proven fidelity; organic loose subjects; "serene" is being used to force slow motion.
- **Common mistakes:** none measured in the card.
- **Known weakness:** only a technical single-scene check; style likeness limited and unvalidated.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/39_piero.md` (MIT, translated).

### Raphael harmonious grouping (`40_raphael`, research recipe, v2 self-score about 70)
- **Look:** continuous contours, rounded modelling of bodies and drapery, idealised but active figures, groups linked by gaze and gesture, layered red-blue-neutral colour, clear space with information priority; triangular grouping is one option, not a template.
- **Medium-specific moves:** draw a relationship map of people and objects first, then choose composition for the action; unify figure and setting in colour blocks, light direction and soft-hard edges. v2 tested a central-perspective barrel vault receding in N=9 geometric steps with coffers cut by angle, alternating pilasters and niches, a chequered floor by layer and column, a lunette band in gold-brown, red and ultramarine, saturated robes in conversing groups pointing at shared objects, small walkers in the distance. Signature transition: none in source.
- **Palette:** saturated red and blue robes with neutrals, gold-brown, ultramarine.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: depth (clear space, a central-perspective vault receding in geometric steps, entry Look and moves), light (one light direction unifying figure and setting, rounded modelling, entry Look and moves).
- **Use when:** collaborative or teaching scenes, institutional and education films, High Renaissance homage.
- **Do not use when:** you need proven fidelity; tense muscular drama (see Michelangelo); every shot forced into a central triangle.
- **Common mistakes:** none measured beyond weaknesses.
- **Known weakness:** bell-shaped robes and identical faces; niche statues read as candles; no sheen on skin and cloth.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/40_raphael.md` (MIT, translated).

### Michelangelo sculptural tension (`41_michelangelo`, research recipe, v2 self-score about 65)
- **Look:** volume made by skeleton, load, torsion and compression; clear overlaps and foreshortening; strong chiaroscuro for big masses; red-chalk study language; force comes from pose, not added muscle; unfinished figures emerging from rough stone.
- **Medium-specific moves:** v2 recipe: a grayscale form map (overlapping lit and dark ellipses for shoulder blades, spine groove, lats; light from upper left) -> deterministic hatching from value and gradient (mostly 50 deg, cross-hatched in darks) -> a broken, grainy chalk contour thickened on the shadow side, traced on the whole silhouette only -> cache; at runtime reveal top to bottom with the chalk following; lower end fades out as "unfinished"; paper with torn edges, mildew, fibres and illegible notes. Validate load-bearing silhouette and foreshortening before volume, clothing and light. Signature transition: none in source (a top-down chalk reveal is the native process).
- **Palette:** red chalk on warm paper; stone greys.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: light (strong chiaroscuro on big masses, light from the upper left, entry Look and moves), finish (red-chalk study language: hatching from value, a grainy chalk contour heavier on the shadow side, paper with torn edges and fibres, entry moves).
- **Use when:** effort, strength and struggle stories, anatomy or sculpture education, rescue or labour scenes.
- **Do not use when:** you need proven fidelity; default nudity or classical gods are not appropriate; gentle lifestyle content.
- **Common mistakes:** contouring each part separately exposes a doll-like assembly -> outline only the whole silhouette; an earlier machine-arm demo had nothing of the artist -> anchor on the drawing and sculpture language.
- **Known weakness:** head too round, upper arm short, no real torso twist; lights could be left as bare paper more boldly.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/41_michelangelo.md` (MIT, translated).

### Guardi vedute: air, broken light, loose edges (`42_guardi`, research recipe, v2 self-score about 78, not independently reviewed)
- **Look:** low horizon under a huge silver-grey-green sky, short quick dry strokes, dabbed highlights, broken edges with structure still legible, tiny figures reduced to a dark body with a dot of white and red, long thin boats, air binding everything.
- **Medium-specific moves:** separate layers each repainted with a broken dry-stroke pass (thin, low saturation): sky (wide cumulus, warm lights, cool shades), islands and towers, water (long sky-reflection strokes plus stretched, darkened reflections); small boats and figures redrawn on a small canvas and pasted back; water displaced row by row; clouds drift; birds. Different stroke directions for buildings, water and sky; bind textures to world or object coordinates so motion never reshuffles the whole frame. Signature transition: none in source.
- **Palette:** silver grey, warm grey, grey-green with local accents of white and red.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: light (broken light: dabbed highlights, warm lights and cool shades in a huge silver sky, entry Look and moves), depth (a low horizon, air binding everything, tiny figures at landscape scale, entry Look), finish (short quick dry strokes per layer, bound to world coordinates, entry moves).
- **Use when:** atmospheric city or harbour views, travel films, 18th-century homage, weather-driven moods.
- **Do not use when:** precise architectural measurement is needed (that is a different painter); generic sunny impressionism.
- **Common mistakes:** search results mixed in modern photos -> verify reference images before anchoring.
- **Known weakness:** towers read as stacked bricks; figures only silhouettes; lacks flickering white dots.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/42_guardi.md` (MIT, translated).

### Lorenzetti readable social space (`43_lorenzetti`, research recipe, v2 self-score about 72)
- **Look:** buildings stacked across the upper frame, rows of small arched windows in pink, grey and ochre walls, crenellated towers, ground-floor arcades cut open to show workshops, a band of small people each doing their own task, dark brown border; many simultaneous events with clear priority, paths and cause.
- **Medium-specific moves:** build the world canvas from how the places connect, give each activity a visible path, then paint in layers (sky, low mid-ground, main buildings, cut-away workshop, street, steps) and a fresco pass; small figures drawn every frame (circle dance, pack animals, scaffold hoist, craftsmen, flags). Figures: small heads, long bodies, narrow shoulders, robes flaring with fold lines, lit left and dark right, front foot out of the hem, three-quarter view; about 20 walkers cycling with near-large far-small scaling. Signature transition: none in source.
- **Palette:** earth and mineral colours, pink, grey and ochre walls, dark brown border; avoid an old-paper filter that darkens everything.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: depth (buildings stacked across the upper frame with cut-away workshops, near-large and far-small walkers, entry Look and moves), rhythm (many simultaneous small actions, each with a visible path, cause and priority, entry Look and moves), light (figures lit on the left and dark on the right, entry moves).
- **Use when:** logistics, civic and community process explainers, "how a city works" education, medieval homage.
- **Do not use when:** one-subject hero shots; you need proven fidelity.
- **Common mistakes:** an object reset by modulo flew back to its start -> hold the receiver still, attach the object, then move off; blank plaster showing between buildings, arms spread like cartoons, overlapping groups -> fixed in round two.
- **Known weakness:** street crowd should be several times denser; walls lack paint layers; proportions and drapery need work; no receding street.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/43_lorenzetti.md` (MIT, translated).

### Pietro da Cortona Baroque flowing groups (`44_cortona`, research recipe, v2 self-score about 70)
- **Look:** full figures, fabrics and masses pushing and pulling in groups, diagonal links and overlaps, figures and ribbons spilling over the frame, warm gold radiance in the centre, rich warm-cool colour layered by value, stucco frames with gilded medallions.
- **Medium-specific moves:** three stucco bands with egg-and-dart, corner gold medallions -> sky opening with radial light -> clouds as one lumpy mass lit along the direction toward the centre with outer arcs marking lobes -> figures rotating around the centre with red and blue ribbons expanded along the ellipse normal -> central figure with breathing gold light -> fresco pass. Plan three big groups and their lighting first, then detail; never let ornament cover the action. Signature transition: none in source.
- **Palette:** warm golds and rich reds against cool blues; stucco whites.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: light (a warm gold radiance at the centre with clouds lit toward it, entry Look and moves), rhythm (groups pushing and pulling around the centre, ribbons expanding along their path, entry Look and moves), depth (figures and ribbons spilling over the frame, entry Look), finish (stucco frames with gilded medallions and a fresco pass, entry moves).
- **Use when:** grand celebratory openings, theatre and opera, ceiling-like reveal shots, Baroque education.
- **Do not use when:** simple single-message content; small screens; proven fidelity required.
- **Common mistakes:** stacking per-sphere radial gradients for clouds reads as soap bubbles -> one lumpy mass lit by direction; ribbons at fixed angles become hair strands -> expand width along the path normal.
- **Known weakness:** bell robes; lacks strong foreshortening and chiaroscuro; highlight arcs cartoonish.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/44_cortona.md` (MIT, translated).

### Renoir warm-cool figures (`45_renoir`, research recipe, v2 self-score about 58, not independently reviewed)
- **Look:** soft and firm edges trading places, visible touches that never shatter faces or hands, warm skin with cool reflected light, coloured shadows (no global orange), rounded tactile bodies and fabrics, dappled light only where a light source and occluder justify it.
- **Medium-specific moves:** forms (canopy, sky gaps, trunks, sand, tables, distant crowd) then a broken-stroke repaint: canopy and ground in short diagonal strokes, crowd on its own layer in vertical fine strokes; dappled light layer (warm yellow lights, blue-violet shadows) cached twice and cross-faded with an offset so it shimmers, laid on figures at low alpha; foreground figures redrawn per frame on a small canvas. Finer strokes on skin and hands, looser on surroundings. Signature transition: none in source.
- **Palette:** warm skin, cool blue-violet shadows, warm yellow light patches.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: light (warm skin with cool reflected light, coloured shadows, dappled light only where a source and an occluder justify it, entry Look and moves), finish (a broken-stroke repaint, finer on skin and hands, looser on the surroundings, entry moves).
- **Use when:** convivial gatherings, warm human stories, 1870s-80s impressionism education.
- **Do not use when:** proven fidelity needed; warmth is being equated with slow pace; sharp graphic content.
- **Common mistakes:** crowd sharing horizontal ground strokes looked lying down -> separate layer with its own stroke direction; full-alpha light patches on figures cut them in half -> lower alpha; local mesh warps of a generated base faked grasping and valve turning -> real pose frames or hierarchical rigs.
- **Known weakness:** figures look doll-like; lacks warm pink skin and fabric sheen; mid-ground crowd too regular.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/45_renoir.md` (MIT, translated).

### Pissarro life in motion (`46_pissarro`, research recipe, v2 self-score about 75)
- **Look:** small directional touches building roads, buildings, vegetation and people; weather and time of day govern local colour; figures are participants placed in the environment at believable scale, not decoration dots; viewpoints from high to ground level.
- **Medium-specific moves:** forms (sky, distant church and hills, patchwork fields, path, trees) then broken strokes: sky long horizontal, ground following the terrain, tree crowns multidirectional short strokes, warm lights and cool darks with complementary jitter; cache; dynamic: drifting clouds, a top layer of fluttering leaf strokes, walkers drawn on a small canvas, stroked, pasted back and walking into depth; a path leads the eye in; tree shadows cross the road. Stable seeds and region masks for moving figures. Separate the neo-impressionist dot phase from the loose phase. Signature transition: none in source.
- **Palette:** greens with jumping orange and pink touches; warm lights, cool darks.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: light (weather and time of day govern local colour, warm lights and cool darks, entry Look and moves), depth (a path leading the eye in, walkers at believable scale moving into depth, entry Look and moves), finish (small directional touches by surface, entry Look and moves).
- **Use when:** everyday work and community life, rural or urban process films, impressionism education.
- **Do not use when:** close-up portraits; proven fidelity needed.
- **Common mistakes:** none measured beyond weaknesses; crowding should come from the story, not added people.
- **Known weakness:** faces are white blobs; tree crowns look like fluffballs without branches; distinction from Sisley still unverified side by side. 18ms per frame.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/46_pissarro.md` (MIT, translated).

### Sisley air and weather landscapes (`47_sisley`, research recipe, v2 self-score about 80, taste review pending)
- **Look:** sky and weather colour the ground, buildings and water; light broken touches following surfaces, simpler in the distance; continuous air layers; roads and horizons guide the eye; small figures and buildings at landscape scale. Not always sunny blue-green: snow, flood and overcast are core variants.
- **Medium-specific moves:** three layers repainted and cached separately: sky (a 2600px-wide cumulus band, warm white body, pale violet-grey shade side, warm yellow lit side, long horizontal strokes), water (sky reflection plus mirrored darkened reflections of houses, trees and poles, horizontal strokes), above-water landscape; dynamic: slow cloud drift, water displaced row by row more strongly nearer the viewer, a small boat drawn on its own canvas, stroked and pasted back, with a wake. Enlarged figures need their own structure and stroke density, never scaled-up dot people. Signature transition: none in source.
- **Palette:** warm whites, pale violet-greys, warm yellow light, grey-blue water.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: light (sky and weather colour the ground, buildings and water, entry Look), depth (continuous air layers, simpler in the distance, entry Look), finish (light broken touches following surfaces, entry Look and moves).
- **Use when:** weather, seasons, flood or snow stories, calm landscape films, impressionism education.
- **Do not use when:** character close-ups; dense action; proven fidelity needed.
- **Common mistakes:** a row of small gap dots on the left edge -> expand the broken-stroke pass 14px before blur and widen the row-displacement target.
- **Known weakness:** roofs read as flat slabs; boat reflection too dark; figures only silhouettes. 14ms per frame.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/47_sisley.md` (MIT, translated).

### Gauguin synthetism and symbolic colour (`48_gauguin`, research recipe, v2 self-score about 65)
- **Look:** large colour fields carrying mood and structure with a reason, simplified forms with firm contours, compressed or tilted space, subtle variation inside flat fields (never uniform black-outline vector fill), diagonal elements splitting the picture.
- **Medium-specific moves:** every form through a flat pass: short strokes following the stroke direction inside each colour block plus a deep ultramarine contour 5-8px; vermilion field, yellow-ochre slope and a violet-brown diagonal trunk splitting the frame; foreground figures cropped by the frame; colour fields stay attached to objects, never random per-frame colour changes. Tropical plants, brown skin and "exotic" decor are not the style; cultural subjects come from the brief. Signature transition: none in source.
- **Palette:** vermilion, yellow ochre, violet-brown, deep ultramarine contour.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: finish (large colour fields with short strokes inside each block and subtle variation, never a uniform outline fill, a deep ultramarine contour, entry Look and moves), depth (scoped: compressed or tilted space with diagonals splitting the picture, entry Look).
- **Use when:** emotionally coded scenes, night shops or interiors with bold colour, symbolism education.
- **Do not use when:** naturalistic colour is required; the brief would exoticise a culture; proven fidelity needed.
- **Common mistakes:** polyline figures read as meme stickers -> smooth closed curves; hat brims drawn over faces -> draw brims behind the face.
- **Known weakness:** naive small figures and animals; trunk too straight; lacks large violet-brown shadow areas. 8ms per frame.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/48_gauguin.md` (MIT, translated).

### Chagall memory space and emotional colour (`49_chagall`, research recipe, older single-scene trial only, no v2 score)
- **Look:** direction, scale and adjacency obey feeling while the main action stays readable; colour fields and local forms both carry emotion; figures, animals and objects keep recognisable character through distortion; real details and memory images coexist.
- **Medium-specific moves:** first define this story's real relationships and emotional relationships, then decide where scale or direction changes; keep identity and contact continuous through every distortion; images come from the new story, not a stock symbol list (no default floating couples, fiddlers, goats or villages). Signature transition: none in source.
- **Palette:** emotional colour fields, not a fixed saturated blue-red set.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: depth (scoped: direction, scale and adjacency follow feeling while the main action stays readable, contact kept through every distortion, entry Look and moves), finish (colour fields and local forms carrying emotion, entry Look).
- **Use when:** memory, migration, love and farewell stories, poetic music videos.
- **Do not use when:** literal instructional content; proven fidelity needed; merely liquefying realistic objects (that is closer to Dali).
- **Common mistakes:** none measured in the card.
- **Known weakness:** only a technical single-scene check.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/49_chagall.md` (MIT, translated).

### Ma Yuan one-corner composition and reserve (`50_ma_yuan`, research recipe, v2 self-score about 78, first independent review 74)
- **Look:** golden-brown silk ground, weight pushed to one corner, empty silk as real space, axe-cut texture strokes (broad flat side brush) on rocks, long drooping willow strands, tiny figures looking into emptiness, distant hills in pale ink wash with no contour.
- **Medium-specific moves:** silk ground (warp and weft with soft edges) -> distant hills by blurred wash -> rocks (polygon clip, broad flat axe-cut strokes, fine hard texture strokes, broken contour) -> old trunk as one continuous thick line with bark flicks -> dynamic: willow strands in clusters of varied curve and length swaying in wind, a figure seen from behind with one-stroke drapery left as bare silk, boat, birds, water lines -> multiplied silk texture overlay. Motion in the empty space only when the story needs it; never particles to fill blank areas. Signature transition: none in source.
- **Palette:** golden-brown silk, graded ink, restrained colour.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: depth (scoped: weight pushed to one corner, empty silk as real space, never particles to fill it; lifts `film:frame_fill`, `film:empty_half` and `film:hero_share`, entry Look and moves), finish (golden-brown silk with warp and weft, axe-cut strokes on rocks, pale wash hills with no contour, entry Look and moves).
- **Use when:** contemplative waiting or parting moments, Song dynasty heritage, minimalist poetic brand films.
- **Do not use when:** busy information; you would treat any ink look as this painter; proven fidelity needed.
- **Common mistakes:** evenly spaced vertical strands read as a fence -> clustered, curved, varied; filled-in figures -> back view plus drapery line; rectangular mist gradients showed seams -> radial gradients; segmented trunk read as bamboo and polygon wedges read as arrows -> reverted to one continuous line and short broad strokes.
- **Known weakness:** axe-cut strokes still dense; trunk ends blunt; seal only, no inscription. 8ms per frame.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/50_ma_yuan.md` (MIT, translated).

### Persian miniature painting, Herat and early Tabriz (`51_persian_miniature`, research recipe, v2 self-score about 80, taste review pending)
- **Look:** raised viewpoint, ground tipped up like a hanging carpet, buildings cut open to show interiors, all-over geometric tile patterns, gold edges and lapis borders, text blocks inside the picture, small side-turned figures with large turbans, fine lines and mineral colour fields.
- **Medium-specific moves:** flat fills with dark brown contour throughout; star-tile patterns tiled by period modulo; octagonal pools and zigzag channels with gold edges and celadon; dotted-leaf tree crowns; patterns follow surfaces and never drift during motion; separate subject layers from pattern layers. Motion: a water wheel turning, gold ripples running along channels, fish circling, petals drifting, small breathing figures. Never fake calligraphy: use real, reliable text or none. Pick one school and period; do not mix Persian, Mughal and other regions. Signature transition: none in source.
- **Palette:** lapis blue, gold, celadon, mineral reds and greens, dark brown line.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: depth (scoped: a raised viewpoint, the ground tipped up like a hanging carpet, buildings cut open, entry Look), finish (all-over tile patterns that follow surfaces and never drift, flat fills with a dark brown contour and gold edges; lifts `art:shading`, entry Look and moves), type (text blocks inside the picture in real, reliable script, or none, entry Look and moves).
- **Use when:** layered process narratives, libraries and gardens, Islamic art education, heritage films.
- **Do not use when:** you cannot source authentic script; mixing regional ornament as fake authenticity; proven fidelity needed.
- **Common mistakes:** none measured beyond weaknesses.
- **Known weakness:** figures small and simple; text blocks are fake cursive; ground lacks layering. 3ms per frame.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/51_persian_miniature.md` (MIT, translated).

### Digital construction-paper cut-out cartoon (`52_construction_paper_cutout`, research recipe, v2 self-score about 75)
- **Look:** Inspired by South Park. Geometric big silhouettes, jittery cut paper edges with fibre texture, eyes as two white ellipses with black dots stuck on the face, trapezoid bodies, short black post legs, flat fill with thin black outline, whole-piece translation and pivot rotation, limited acting carried by mouth shapes, gaze, pose switches and pauses. Reference grammar only: never reproduce named characters, designs or compositions; scope one season first; no need to copy offensive humour.
- **Medium-specific moves:** cut every shape with a jittered paper edge; original semantic SVG paper characters organised by parts, pivots and expression states; paper texture bound to part coordinates; character parts rotate around neck and shoulder pivots; mouth as a black half-ellipse opening and closing; footsteps and contacts as states, not whole-group sliding; snow stepped at 12fps. Avoid colour combinations of named characters. Signature transition: none in source.
- **Palette:** flat primaries and paper tones, thin black line.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: finish (jittered cut-paper edges with fibre texture bound to part coordinates, flat fills with a thin black outline; lifts `art:shading`, entry Look and moves), rhythm (whole-piece translation and pivot rotation; acting by mouth shapes, gaze, pose switches and pauses; snow stepped at 12 fps, entry Look and moves); serves when also: voice (a character speaks: mouth shapes carry the acting, entry Look).
- **Use when:** satirical or comedic explainers with original adult characters, low-budget limited animation, fast social content.
- **Do not use when:** it could be mistaken for the show; smooth 3D or heavy paper-sculpture looks; proven fidelity needed.
- **Common mistakes:** characters gliding as puppets -> stateful steps and contacts.
- **Known weakness:** characters from one mould; boarding motion is just translation plus hop; no lip sync to dialogue. 6ms per frame.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/52_south_park.md` (MIT, translated).

### Feature 3D animation family: shape, material, performance (`53_feature_3d_animation`, research recipe, older single-scene trial only, no v2 score)
- **Look:** Inspired by Pixar feature films. Recognisable silhouettes and proportions designed before surface detail; materials that tell story and character (cloth, skin, metal clearly different); light steering narrative focus, stylised physics allowed; acting with weight, gaze, anticipation and follow-through. Not a single style: big eyes, round faces and glossy plastic are not the definition. Reference grammar only: never reproduce named characters, designs or compositions; scope one film first.
- **Medium-specific moves:** faceless objects can use procedural 3D with keyframes or physics; the trial used an analytic mesh, not cloth simulation, and fixed timing so a door opens before cloth releases and cloth endpoints are constrained to floor height. Full 3D character modelling and rigging is not yet supported; never fake it with ball-and-cylinder people or one AI background. Signature transition: none in source.
- **Palette:** per film; no fixed gold rim light or blue-violet background.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: light (light steering narrative focus, entry Look), finish (materials that tell the story: cloth, skin and metal clearly different, entry Look), rhythm (acting with weight, gaze, anticipation and follow-through; events in causal order, entry Look and Common mistakes), depth (procedural 3D for faceless objects, entry moves).
- **Use when:** object-led product stories with causal acting, family entertainment tone, animation education.
- **Do not use when:** the pipeline lacks real modelling and rigging; you would add faces to every object; proven fidelity needed.
- **Common mistakes:** release before the door opened and floating cloth -> order events causally and constrain to the floor.
- **Known weakness:** only a technical single-scene check; no character pipeline.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/53_pixar.md` (MIT, translated).

### Dunhuang mural, Northern Dynasties (`55_dunhuang`, research recipe, v1 self-score about 72)
- **Look:** dry, old, cracked mineral colour on mud plaster: earth-red or cream grounds in stacked registers divided by multicolour bands with pearl roundels, white animals as single white shapes with one contour line, rows of narrow tall sawtooth mountains each one colour and shaded on one side with red ground between, comma-shaped blue-green wind leaves flipping back, flying figures horizontal with ribbons streaming back and lower body becoming a long trailing skirt, red-brown iron-wire line. Pick one period; do not merge Northern Dynasties with High Tang.
- **Medium-specific moves:** mud wall texture -> upper and lower registers, bands, top diamond band, bottom valance triangles (cached) -> sawtooth mountains (cached) -> dynamic: wind leaves flipping left in speed layers, flying figures with variable-width ribbons, falling flowers, white deer galloping in two beats (leap, gather) with hoof dust, drifting dust -> overlay of cracks, flaking and salt bloom painted over the picture (cracks cross figures) -> multiplied mud grain. Signature transition: none in this card (the High Tang card's ribbon sweep is the nearest native process).
- **Palette:** earth red `#92342d`; cream `#e8dcc5`; azurite `#3e919c`; malachite `#577f7a`; vermilion, ochre, lead white that darkens to grey-blue with age.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Craft profile:** family default; needs also: finish (dry, cracked mineral colour on mud plaster, with cracks, flaking and salt bloom painted over the picture, entry Look and moves), depth (scoped: stacked registers and rows of sawtooth mountains, entry Look), rhythm (wind leaves flipping in speed layers, a deer galloping in two beats, ribbons streaming back, entry moves).
- **Use when:** Silk Road and Buddhist heritage, Jataka-style storytelling, archaeology and museum films.
- **Do not use when:** polished gradient "national style" illustration is wanted; dense precise gold-line work (that is Persian miniature); proven fidelity needed.
- **Common mistakes:** none measured beyond weaknesses.
- **Known weakness:** mountains too geometric without layered rhythm; flying figures flat with no half-turn; lead-white darkening not done; High Tang branch not done; not tested across subjects or vertical format.
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/55_dunhuang.md` (MIT, translated).

