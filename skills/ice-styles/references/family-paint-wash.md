# Family: paint and wash

Watercolour, ink wash, gouache and oil. Read `style-method.md` first. Every entry's examples are illustration only.


## Shared rules for this family

- Decide transparent or opaque first. Transparent media (watercolour, ink wash) are laid light to dark, never cover, and the paper is the white. Opaque media (gouache, oil) are laid dark to light, every pass covers the one before, and white is paint.
- Washes spread from where the brush touched along a wet front and stop short of their outline; they never wipe in as a straight mask and never fade.
- Paint texture comes from the medium's real behaviour (bristle streaks, pooling at the bottom edge, backruns, flying white, impasto ridges), not from a noise overlay.
- Characters and props go through the same paint treatment as the background (see `style-method.md` section 8). Full-screen strokes are never reseeded per frame.
- Every object, character or scene this family draws in code follows `code-illustration-craft.md` (three tones under one light, cast and contact shadows, a texture layer, one line policy, named groups); section 8 there says how this family renders each rule.

## Watercolour and pencil

### Watercolor Brush (`watercolor`)
- **Look:** A hand-painted journal page on warm, fibrous cotton paper that paints itself in translucent brush strokes with dry-brush flying white, with handwritten notes and pen leader lines beside what is painted; no vector line anywhere (a darker edge stroke is the only "line"). Not ink wash (colour, not ink tones), not impasto, not a children's crayon book, not vector illustration with a watercolour texture laid on top.
- **Medium-specific moves:** painting-in is the main motion: objects appear stroke by stroke, structure before detail (trunk, branches, leaves; outline wash, shadow, accent), progress driven by screen position or a cue; each stroke is a variable-width ribbon (~±22 % roughness, ~0.55-0.6 body opacity) plus 3-9 bristle tracks at 30-85 % opacity that break into dashes; washes are painted in 3 jittered passes at a third opacity each so edges pool; depth by parallax layers (farther = smaller, lighter, less saturated) with paper-coloured mist bands between; sway only after an object is finished (~0.006 skew for trees, 0.01-0.03 for grass); brush-edge wipes (wavy vertical clip) reveal scenes, labels open with a left-to-right clip; paper-coloured mist with a wavy rising edge erases; events can be phased to the music's beat grid; smooth easing, 60 fps suits the slow brush, nothing jitters; "burst" paints a whole group in <= 1 s for a peak.
  - Camera: long lateral dolly over a continuous world (transect, route, timeline); vertical tilt along one object (scale); locked sheet with things painted in; slow push into a detail; pull-back to a map or diagram; mist wash to blank paper (chapter end); page turn or new sheet sliding over; change in time on a locked view. No hard video cuts, no dissolves between unrelated pictures.
- **Palette:** paper is the white, never paint pure white; darker = more passes, not darker pigment; 3-5 hues per scene plus ink (a warm near-black and a lighter brown) for lines, text, edges, stems; colour may carry data or mood (blend sky and ground by a measured value, quantised into 4-6 bands so it reads as paint); one recurring accent (vermilion, rain blue). Examples: arid-to-wet red ochre, sage, straw, blue-grey, deep green; harbour dawn #f3e2c8 sky, #9fb4c4 water, #5f7486 hulls, accent #c8442a; vegetable garden #e8e0c0 soil, #8ea860 leaves, #4e6e3c shade, accent #d9632e.
- **Type and captions:** elegant serif for titles and subtitles, handwriting for notes, small wide-tracked mono for measured labels, and a matching serif for every other script on screen (Arabic: the ice-arabic skill). Families chosen per the ice-direction skill, `references/type-pairing.md`; a default-look face (several elegant serifs are on that list) needs a D-entry reason. Notes drawn over a paper-coloured halo, revealed left to right like writing, with a pen leader growing to the specimen. Subtitles sit on the paper, no box: centred bottom, serif italic ~36 px, 2 balanced lines max, second language beneath at ~2/3 size, ink ~78 % over a paper halo; hold >= max(1.8 s, speech + 0.6 s). Numbers spelled out for TTS, digits on screen.
- **Sound:** acoustic and gentle music (felt piano, fingerpicked guitar, woodwinds, light strings, glockenspiel, kalimba, soft pads), a licensed track can be edited on beat-aligned jumps; foley from the scene's matter (paper brush rustle per painting-in as band-passed noise with light tremolo and a panned sweep, pencil scratch for notes, soft stamp thump, page flips, nature beds of the subject); silence = brush lifted, only paper and room. Mix: voice a few dB over music, music ducked ~4 dB with a smoothed envelope, short soft reverb, -14 LUFS; limit peaky TTS before level-matching; warm unhurried documentary read.
- **Use when:** nature and science journals, botany and ecology, travel, food and recipes, anatomy of an object, gradients across space or time (transects, maps in time), calm educational content with real numbers.
- **Do not use when:** the brief needs bold graphic punch, fast kinetic energy or crisp UI; heavy text or dense charts dominate; the tone is corporate tech or high-contrast night.
- **Common mistakes:**
  - Offscreen wash strips too short flatten tall shapes and expose seams on tilts -> size strips well beyond the frame.
  - A translucent wash ending at its canvas edge shows a hard seam -> extend below the frame and fade to paper.
  - Strokes built per frame disagree between parallel render workers -> build them under a fixed seed.
  - Thousands of strokes per frame too slow -> cache finished objects as sprites.
  - Beat-locked animation drifts after a music re-edit -> re-derive it when the edit changes.
- **Variation slots:** (illustration only)
  - Structure: a journal kept over one year, one locked page per month painted over the last; anatomy of one object dissected into labelled painted close-ups; a process painted step by step down one tall sheet with a tilt.
  - Opening: a finished painting watched backwards to its first stroke, then forwards; a close-up of wet pigment spreading, pulled back to show what it became; a handwritten question on blank paper answered by painting.
  - Ending: the page left unfinished, brush lifted mid-stroke; one detail held as the rest fades to paper; the sheet dries and is filed into a stack.
- **Source:** lemomo-ai/lemo-opuscar `styles/watercolor/STYLE.md` (MIT; demo media CC BY 4.0 LemoLab).

### Pencil and watercolour (`ranunculus`, hand)
- **Look:** HB pencil and pan watercolour on cold-press: washes that never quite fill their outline, form shaded toward one light, graphite over the paint.
- **Medium-specific moves:** pencil lay-in light enough to live under paint; first light washes one per mass, each spreading from where the brush touched along a ragged wet front and stopping short of its outline (follow the real silhouette, never a disc); form washes toward the light, outer parts to centre; graphite last, erased wherever a later-painted part sits over it (a hand does not draw what it cannot see). Motion: pencil fast and light, washes slow (about 20 frames each), smaller parts quicker, graphite brisk; wet fronts still moving on the last frame of their operation.
- **Palette:** clear transparent pigments; paper is the white.
- **Sound:** brush water, paper, birds; gentle acoustic.
- **Use when:** warm, human brands, botanical, wellness, cooking, journals.
- **Do not use when:** bold loud social hooks; data-heavy pieces.
- **Common mistakes:** washes filling outlines exactly -> stop short; opaque white paint -> paper is the white.
- **Source:** alexgreensh/anidoodle `references/styles/ranunculusDraw.md`, `references/styles.md` (Apache-2.0).

### Storybook pencil and watercolour (`storybook`, hand)
- **Look:** soft graphite and gentle pan watercolour on warm cold-press, drawn for a recurring character; construction lines left in the page as picture books do.
- **Medium-specific moves:** construction in blue-grey (head and body ovals, gesture, face cross, footprint), a light pencil drawing head first and down, washes each spreading from the side facing the light, the final line at full weight, paint flicked off the brush last. The character is built once as a module and posed; nothing redraws it.
- **Palette:** gentle transparent washes on warm paper; one consistent thin transparency throughout (unlike the folk-tale hand).
- **Sound:** soft acoustic, music box, light woodwinds.
- **Use when:** children's stories, mascot introductions, gentle onboarding, family brands.
- **Do not use when:** loud launches; technical data.
- **Common mistakes:** gradients painted into a pooled paint layer change how later strokes rasterize (frame order leaks into pixels) -> paint glows on their own cached surface.
- **Source:** alexgreensh/anidoodle `references/styles/storybookDraw.md` (Apache-2.0).

### Ink and line-wash (`wren`, hand)
- **Look:** watercolour washes on cold-press first, then a flexible steel nib in dark ink over the dried washes, then spatter.
- **Medium-specific moves:** a wash laid as a bead pulled down the shape with a wavering wet front and a darker pigment line riding it; pigment slides down and pools along each shape's bottom edge; backruns (a pale cauliflower with a crinkled dark rim) where a wetter drop touched; highlights lifted out; then the pen: focal subject first, contours left open where light eats the edge, thick on the press and hair-thin on the lift; then spatter dots landing one after another.
- **Palette:** transparent washes in a natural key; dark ink line.
- **Sound:** nib scratch, water, birdsong; chamber or acoustic music.
- **Use when:** nature, travel journals, serious but warm editorial, food and craft.
- **Do not use when:** flat bold brand colour; hard-tech futurism.
- **Common mistakes:** line first then wash (that is pencil and watercolour order) -> wash first, line after; closed outlines everywhere -> leave contours open in light.
- **Source:** alexgreensh/anidoodle `references/styles/wrenDraw.md`, `references/styles.md` (Apache-2.0).

### Folk-tale storybook (`folkTale`, hand)
- **Look:** storybook painting in the folk-tale manner: gouache and watercolour over a full HB pencil drawing on warm cream paper; the painting carried only as far forward as needed, the back left as bare drawing.
- **Medium-specific moves:** depth is the medium: foreground (depth about 0) opaque, saturated, textured gouache with separately painted leaves, rays and blades; middle (about 0.3-0.6) colour mixed toward a warm haze, paint thinning and stopping short of its pencil line; far (0.9 and beyond) pencil line only on the cream sheet; a golden haze band over the middle before the foreground is painted. Pencil line breathes with pressure and is gone over a second time slightly off; gouache edge wobbles with dry-brush drags and a darker settling rim. Order: whole scene in pencil, then paint back to front. Motion: nothing fades or scales; washes sweep behind a wet front, leaves grow from stalks then take veins, petals land one by one; the last 30 frames hold the still.
- **Palette:** cream paper `#f4edda`, warm haze `#f2e9c9`, sap and olive greens, ochre, cadmium yellow and orange, vermilion accent, cobalt violet, burnt umber, graphite `#6f665a`.
- **Characters:** warm caricature (round heads, rosy cheeks, dot eyes with a catchlight); proportions true to age (a child of about six is a little under six heads tall); folk costume carries pattern.
- **Sound:** folk instruments of the culture being drawn (never a copied traditional melody); birds, wind.
- **Use when:** folk tales, heritage, children's stories, regional food and craft brands.
- **Do not use when:** modern tech; minimalist brands.
- **Common mistakes:** painting everything at one transparency (that is the storybook hand) -> change the medium with distance; painting the back of the picture -> leave it as pencil.
- **Source:** alexgreensh/anidoodle `references/styles/folkTale.md` (Apache-2.0).

## Ink wash and sumi-e (merged: three sources)

One loaded brush, ink diluted in steps, empty paper as space. All three sources agree: paper is the base and ink is only added; every stroke is one gesture laid once; there is no drawn outline; the seal is stamped last; a blank sheet is not a cover frame (open with the first strokes already down or being laid).
- **Use when:** cultural brands, poetry, martial-arts and heritage stories, tea, calligraphy-adjacent pieces, calm luxury.
- **Do not use when:** dense data, loud social hooks, colour-led brands.
- **Sound:** instruments of the tradition (plucked zither, bamboo flute, guqin-like tones), brush on paper, wind; long silences. Never copy a traditional melody.
- **Scoped variants:** the film variant (xieyi ink, one stroke = a mountain or a cut, camera as a handscroll) for 30-60 s stories; the hand variant (hair-model brush, five dilutions, manual order) for process films and stills; the art-history card for speedrun or homage segments.

### Chinese Ink Wash (`ink-wash`)
- **Look:** Xieyi ink painting on warm rice paper (about #F2ECDE), painted and unrolled before the viewer: black ink in five tones plus one vermilion seal; forms made by loaded "boneless" brushstrokes whose dark edge is the contour, wet washes that bleed, and dry fast strokes with flying white; 60-80 % of the frame is empty paper. Not watercolour (no colour washes), not vector art with a brush texture (no flat fills or closed outlines), not a calligraphy title sequence.
- **Medium-specific moves:** figures step at 12 fps (on twos) while their position, camera, blooms, ripples and splatter move on ones at 24 fps; strokes seeded by index with bristle breaks computed along normalized arc length so flying-white gaps do not crawl, only a small boil on width noise; things are painted into existence in drawing order, bloom or dissolve into mist, never tweened like vector shapes; stillness before action: hold with at most a slow push-in, then the decisive stroke crosses the frame in a few frames, consequences only after it finishes; five ink tones by opacity (burnt ~.96, thick ~.82, heavy ~.60, light ~.34, clear ~.16); ink multiplied onto paper; wet layer bleeds with edge pigment accumulation and granulation, dry layer gets only fibre jitter; mountains dissolve downward into mist; water is blank paper moved by faint dry streaks and ink rings; ink-bloom transitions grow the next scene inside a spreading drop with a dark tide line; a mass can split along a cut with splatter left behind.
  - Camera: locked frame on the paper; right-to-left handscroll pan (time and distance); vertical hanging-scroll tilt; lateral tracking with lead room and slow far parallax; high wide with a tiny figure in blank paper; low angle with a dark towering mass and slow push-in with shake; hard cut to an extreme close-up (the style's only hard cuts); push into an ink bloom or mist; pull back until a mark joins the whole; return to an earlier framing. Never a generic dissolve or wipe.
- **Palette:** ink only, from cool grey at low density to warm black at full density, no other hue; one vermilion (about #B02E22) for the seal and at most one tiny story accent the protagonist carries, never a red wash or red type; far = pale and soft, near = dark and textured; if a frame gets busy, remove ink rather than add tone.
- **Type and captions:** subtitles are inscriptions: classical italic serif (Cormorant Garamond italic), ink-coloured, no box, <= 2 lines, placed in each shot's empty paper, a small vermilion square marking each line start, appearing wet and drying in a fraction of a second; hold >= max(1.8 s, speech + 0.6 s). Titles written on the painting in vertical columns in empty space with a code-drawn vermilion seal (lines knocked out of an irregular red square with paste speckles), moving with the world. Calligraphy uses an OFL brush font only as a skeleton traced in stroke order with hidden-tip entry and tapered exits.
- **Sound:** guqin-led, not piano and strings (open and stopped strings, slides, vibrato, glassy harmonics), a low breathy xiao, big drum and timpani for mass, frame drum for steps, a small gong for the seal, pentatonic modes; cue to picture, never loop (unmetred plucks for emptiness, a pulse for movement, rolls for mass, strokes can land on plucks); silence is literal (zero music, ambience and reverb tails with short fades, at most one sound inside); foley of ink drop (short tink + soft wet thud), brush air (band-passed noise with bristle grain, never a metal whoosh), steps on water, wet splatter ticks, seal (wooden thump + paper crackle). Voice: calm, few lines like colophons; duck music ~8 dB.
- **Use when:** contemplative brand stories, heritage and culture, journeys and histories told as a scroll, nature and seasons, a single decisive moment, processes where one gesture creates the whole.
- **Do not use when:** the content needs colour coding, data charts or many labels; the tone is loud, playful or high-tech; the audience or topic would make East Asian painting conventions feel arbitrary or appropriative.
- **Common mistakes:**
  - Dry brush looks like dashed lines -> breaks from long-scale noise and an ink load that drops along the stroke.
  - Parallel semi-transparent strokes make bodies look like organ pipes -> one base mass plus two loaded strokes.
  - Big side-brush strokes look like a hairbrush -> a gradient mass plus a few low-dryness strokes; cache gradients per pixel to avoid band seams.
  - Clipping calligraphy by the font outline notches junctions -> use the font as a skeleton only.
  - Uniform hatching inside a wave turns into wire mesh -> loaded strokes along the face.
- **Variation slots:** (illustration only)
  - Structure: one large character stroke by stroke, each stroke opening a vignette; a hanging-scroll tilt from sky to ground through four stages; two brushes in dialogue until they meet in one bloom.
  - Opening: in motion, a painted figure already moving as the world washes in; ink first, a fully inked frame lifted where light or a road appears; a wet stroke fills the frame and reveals what it drew only when it lifts.
  - Ending: one small mark held while the ink around it dries; evaporation, un-painting in reverse stroke order; the brush stopping before the last stroke lands.
- **Source:** lemomo-ai/lemo-opuscar `styles/ink-wash/STYLE.md` (MIT; demo media CC BY 4.0 LemoLab).

### Sumi-e (`sumiE`, hand)
- **Look:** one soft goat-and-wolf-hair brush loaded from an inkstone on unsized xuan paper that drinks ink on contact; nothing corrected or covered; every mark one gesture laid once.
- **Medium-specific moves:** a hair-model brush: each hair spends its own ink load with travel, edge hairs first; loaded hairs merge into one solid mark, running dry they skip and give flying white along the stroke, splitting at the lift; the brush is a cone so ends are pointed or rounded, never square; at slow points (touch-down, node pause, lift) ink bleeds into the fibres as a feathered halo; tone only by five dilutions (scorched 1, thick 0.82, heavy 0.6, light 0.38, clear 0.2), dilute ink goes slightly cool, never brown; a stroke never stacks with itself, ink darkens only where a second stroke crosses. Order: the classic manual order for the subject (stalks first in single upward strokes pausing at nodes, nodes darker, branches, leaves front thick and back light, birds in manual order, dry accents), the seal stamped last. Motion: a stroke grows at a hand's pace, slow points keep soaking after the brush leaves, a beat between passes, the seal pressed in one short press.
- **Palette:** one ink, five dilutions, one cinnabar seal `#b8352b` (invented seal-script mark, not text); warm unbleached xuan `#f3ede0`.
- **Source:** alexgreensh/anidoodle `references/styles/sumiE.md` (Apache-2.0).

### Chinese ink wash, freehand xieyi (Bada Shanren / Qi Baishi) (`17_ink`, implemented, quality 2 stars)
- **Look:** paper is the ground and ink only adds; brush strokes with pressure, dry-brush streaks (feibai), ink blooms soaking outward, reserved white areas, five ink tones, sparing mineral colour, a red seal.
- **Medium-specific moves:** order: rice paper (cached) -> wash layer (pale far hills, vermilion sun) -> mist bands -> static strokes (written live, then cached) -> foliage -> figures (colour wash plus scorched-ink contour) -> steam threads -> seal. Paper: texture `#efe6d0` plus 2,600 fibre arcs (half brown alpha 0.05-0.13, half light alpha 0.12-0.27), vignette to alpha 0.22. Brush: Catmull-Rom densify then resample every 4px of arc length; pressure profile = smoothstep(0, head, q) x (1-0.7 smoothstep(1-tail, 1, q)) x (0.85+0.15 noise); wet core as a ribbon of width w x profile x (1-0.85 dry q^0.8) at alpha tone x 0.72; bristles as continuous polylines offset +/-0.475w x profile, broken where noise < dry q^1.2 x 0.95+0.05 (that gap is feibai), butt caps. Settings: frames w 14-18 dry 0.45-0.6; table w 22; drapery w 4-6 dry 0.3-0.4 tone 0.78; ground line w 5 dry 0.85 tone 0.35. Wash: draw shape off-screen, multiply onto paper in two passes: halo blur halo(0.4+grow) alpha haloA x grow, body blur(1.6-0.6 grow); grow runs 0 to 1 so ink visibly spreads. Reserve whites by cutting them out of the wash layer rather than painting white. Motif loops: strokes write themselves at the open (each stroke reveal = smoothstep over lt/0.45 in drawing order); bamboo branch sway sin(2.9t) x 0.11, leaves flip sin(7t+g) x 0.2; mist bands (blur 14, alpha 0.72) drifting 150-270px/s; a two-stroke bird crossing at 420px/s flapping about 8 times per second; shrimp with travelling-wave antennae and body bend sin(7t) x 0.12; seal stamped from 1.5x to 1x at lt 0.3-0.4 with multiply. Signature transition: used as an opening; strokes write the picture onto blank paper (start at lt+0.12 so frame 0 is not empty).
- **Palette:** ink [16,14,12] at tones scorched 0.9 / thick 0.8 / heavy 0.6 / light 0.35 / clear 0.15; ochre `#c47a3c`; indigo blue `#6f8aa0`, `#7d97ab`; rattan yellow rgba(226,170,52,0.75) multiply; rouge [190,40,40] only in three accents; vermilion sun `#d8553f`; seal `#c4281e`.
- **Sound:** not specified in source; score in instruments native to the period or medium.
- **Use when:** Chinese heritage and poetry films, calligraphy or tea brands, calm openings where the picture writes itself, education on literati painting.
- **Do not use when:** dense information or many coloured elements; figures must be detailed and expressive (figures are not freehand enough); fast action with lots of overlapping shapes (multiply washes show through each other).
- **Common mistakes:** bristles drawn as separate round-capped segments stacked dark knots like bamboo joints or rope -> one continuous path per bristle with butt caps; static strokes repainted each frame (thousands of bristles) -> cache after the write-on; a bird routed through foliage was invisible -> move its path above the mist band; transparent multiply washes let lines behind show through shapes (read as wrong layering) -> clip and paint a paper-coloured underlay inside each silhouette before washing; first frame as blank paper -> offset the write-on so frame 0 already has strokes.
- **Known weakness:** figures not freehand enough (review score 6/10).
- **Source:** alchaincyf/huashu-art-motion `references/风格配方/17_ink.md` (MIT, translated).

## Gouache

### Mid-century gouache (`midCentury`, hand)
- **Look:** opaque matte designer's gouache on warm illustration board in the 1950s-60s storybook manner; flat shapes visible only at their slightly ragged edges, dry brush dragged over flats, a loose brush-and-ink line printed off register on its own plate.
- **Medium-specific moves:** flat shapes laid big to small (sorted by area, stacking kept), polygons keep their corners (cut, not rounded); dry-brush bristle streaks that break as the brush runs out; the line goes on last, thick-thin, wandering past the colour with a plate offset of about (+5, -4) px. Figures true to age (a child of about eight is six heads).
- **Palette:** warm board, mustard, tomato, turquoise, olive, deep green-black, pink, cream.
- **Sound:** cool jazz, vibraphone, brushes.
- **Use when:** retro brands, family products, travel, how-to and help content with charm.
- **Do not use when:** high-tech futurism; photographic products.
- **Common mistakes:** torn fibres and lifted pieces (that is cut paper) -> painted edges and dry brush; line registered exactly on the colour -> keep it off register.
- **Source:** alexgreensh/anidoodle `references/styles/midCentury.md` (Apache-2.0).

## Oil and glaze

### Impasto Palette Knife (`impasto`)
- **Look:** A moving oil painting made of thick palette-knife strokes: big, flat, sharp-edged planes of colour with ridges, lips and broken run-outs, raked by light over a height field; clear and graphic at thumbnail size, tactile at 100 % crop. Value structure first, hard edges at the focus, calm planes elsewhere. Not a swirling post-impressionist filter, not a brush texture over flat vector art, not watercolour, not a painterly photo filter.
- **Medium-specific moves:** smooth 24 fps, no stepping; static paint never moves, only what the story moves (weather, figures, props, light); moving figures are procedural strokes rebuilt each frame from fixed seeds so paint does not boil; actions land on the music grid; anticipation, action, follow-through on every gesture; strokes 1.7-3.1 x radius long, 0.95-1.45 x radius wide, slanted ends, about ±13 degree angle and ±6 % value jitter, each may drag a second colour; stroke size by importance and depth, strokes never cross shape groups; thin blurred underpainting (~1.5 px) under strokes; reflections are stacks of short horizontal knife dabs under each light; titles laid in by the knife in about a second and can be washed, scraped or painted over; colour re-laid stroke by stroke from a grey version as a reveal wave; raking light dropped to a grazing angle at the peak; paint-over sweeps as transitions; render 2x supersampled, no film grain.
  - Camera: slow truck and push on a wide; push-in through a silence; tilt up from the ground or a reflection; pull-back from a close-up; rotating overhead crane-out (pattern from many); same wide repeated (before/after); locked frame with moving light; macro slide along the paint surface; whip-pan into a new painted plate. Keep the camera inside the painted plate. Transitions: paint-over sweeps and scrapes, hard cuts on beats; no dissolves (two layers of ridges turn to mud).
- **Palette:** planes of mixed, slightly broken colour; gradients only as stroke-to-stroke steps; warm light against cool shadow by default; brightest purest chroma reserved for the story's subject, not the background; colour can be an event (every stroke holds a grey and a colour version: a monochrome world with one coloured exception, or a world re-laid from grey to colour). Example palettes: after-rain sunset (cobalt to peach to gold sky, ochre facades, full-chroma props); harvest field (straw yellow, burnt sienna, one viridian machine); night kitchen (umber shadows, sodium orange, one cold blue window). Sample knife colours: #D97757 with #f0a07a, core #f6c0a0.
- **Type and captions:** serif display face (Cormorant, OFL) for knife-laid titles that move with the world; small text (credits, data, captions) stays crisp overlay text since knife strokes cannot carry small letters; subtitles in plain serif, <= 2 lines, in a calm plane, hold >= max(1.8 s, speech + 0.6 s).
- **Sound:** palette-knife scrapes on every repaint or paint-over, wet dabs, scene materials (wet stone, nylon, wood, fabric, glass); layered beds (a hiss, near grains, one distinct detail), filtered under cover; acoustic instruments with hand-made grain (solo strings, accordion, pizzicato, harp arpeggios, glockenspiel or celesta for pops, piano, guitar, woodwinds; solo for a lonely world, ensemble for a shared one); options: one action = one sound = one cut, pops pitched as a rising arpeggio, an unresolved phrase resolved later, hard silence to digital zero with at most one sound, a J-cut of the next scene's foley into a silence. Mix: music and ambience duck ~8 dB under voice, -14 LUFS; can carry a film without narration.
- **Use when:** emotional or lyrical brand films, cities and places, seasons and weather, transformation or recovery stories, "one coloured thing" in a grey world, music-locked short films.
- **Do not use when:** small text, data or precise diagrams must be read inside the image; the brief wants a clean digital, technical or documentary-evidence look; heavy compression or tiny delivery sizes will destroy knife edges.
- **Common mistakes:**
  - Canvas-coloured outlines where confined strokes shrink near edges -> add the blurred underpainting.
  - Wrong draw order covers objects (ground painted over building feet) -> order the reference layers correctly.
  - Plain rectangles read as posts -> give silhouettes taper, a lit edge and one or two defining dabs; check proportions at thumbnail size.
  - Grain or heavy compression destroys knife edges -> no grain, supersample, high bitrate.
  - Strokes re-seeded every frame boil -> fixed seeds per stroke.
- **Variation slots:** (illustration only)
  - Structure: one object passing through many hands, one painted plate per hand; a still life that comes alive as light crosses it hour by hour; a portrait painted coarse to fine, each layer a decade.
  - Opening: the bare canvas, first knife stroke as the first event; macro on a ridge of paint pulling back to become a mountain or roof; mid-action across a finished plate.
  - Ending: scraped back to the underpainting leaving one mark; raking light sinking until only ridges glow, then black; the painting revealed hanging in a room.
- **Source:** lemomo-ai/lemo-opuscar `styles/impasto/STYLE.md` (MIT; demo media CC BY 4.0 LemoLab).

### Oil on canvas (`paintedOil`, hand)
- **Look:** opaque oil with hog-bristle flats and filberts on toned linen, lean block-in to fat impasto (a classic still-life kitchen palette).
- **Medium-specific moves:** each stroke lands square and loaded, every bristle streaking its own line, outer bristles breaking first as paint runs out, carrying two colours (loaded and picked up wet into wet); ridges catch a light line toward the window and a dark one away; impasto highlights as short thick dabs with a hairline cast shadow; edges found on the lit side and lost in shadow. Order: white priming, toning rub, thin umber drawing, dark masses big brush lean paint, mid tones, lights fatter, impasto, final dark accents; background strokes never cross objects. Size hierarchy: a big flat for walls, a medium brush following each form, a small brush for accents only; strokes follow form (hoops around a vessel, wrapping a fruit's cross-section). Motion: each pass sweeps its area at a hand's pace, impasto slower, a beat between passes, nothing fades.
- **Palette:** umbers, burnt sienna, yellow ochre, terre verte, Naples yellow, lead white; canvas weave multiplied under and lightly over.
- **Sound:** quiet studio, brush on canvas; chamber strings or solo piano only if fitting.
- **Use when:** artisan food, luxury, heritage, galleries, emotional premium pieces.
- **Do not use when:** speed, tech, flat brand colour.
- **Common mistakes:** transparent washes (that is watercolour) -> opaque dark to light; strokes starting as square slabs -> feather in.
- **Source:** alexgreensh/anidoodle `references/styles/paintedOil.md` (Apache-2.0).

### Broken colour (`brokenColour`, hand)
- **Look:** oil straight from the tube on lead-white primed linen, one sitting outdoors; short separate opaque dabs from a loaded flat hog brush, two or three unmixed colours side by side for the eye to mix; the linen weave shows in the thin lay-in and the gaps.
- **Medium-specific moves:** each dab lands blunt, pushes a lighter ridge up one side and a darker groove on the other, drags thin where it lifts; dab colour sampled from a smooth colour field then broken (hue plus or minus 0.03, value plus or minus 0.07, saturation up); complementary accents dropped by rule (orange or rose into blue shadow, violet into gold); stroke directions follow the plane (water flat and long, sky varied along cloud banks, figures upright); masts and thin lines are one pull of a rigger. Order: thin warm imprimatura, placement in thinned ultramarine, masses in big averaged dabs, broken dabs visited along a smooth order field, forms restated, accents, reflections as horizontal bars, last sparkles. Process film: every dab pulled along its length in 2-4 frames, passes abut, the painting advances in an irregular front, never a scanline.
- **Palette:** high key: lead white, cadmium orange and red, chrome yellow, rose madder, cobalt violet, ultramarine, viridian. No black: the darkest dark is ultramarine plus rose.
- **Sound:** outdoor ambience, brush on canvas; light chamber music.
- **Use when:** light and atmosphere, travel, leisure, outdoor brands, seasons.
- **Do not use when:** transparent watercolour delicacy is wanted; precise diagrams or text-heavy content.
- **Common mistakes:** outlines or a clean circle (a craft-bar failure) -> forms end where dabs stop, edges found on sunlit rims and lost in haze; per-patch random draw order leaves vertical seams -> visit dabs along a smooth order field; form modelled by value -> form comes from temperature.
- **Source:** alexgreensh/anidoodle `references/styles/brokenColour.md` (Apache-2.0).

### Dream glaze (`dreamGlaze`, hand)
- **Look:** the hand-painted dream photograph: resin-thinned oil glazes with a tiny soft brush on a smooth white ground; enamel-flat, no visible stroke; every form turned by value steps too fine to see under one low sun; every edge hard, near and far alike; depth only from haze and scale.
- **Medium-specific moves:** forms as height fields lit by one sun with warm sun, cool sky and warm ground bounce; cast shadows computed on the ground; grounds laid in rows with a wavering lower edge; forms laid in shadow tone then worked up dark to light (shadows finish first, highlights last); handwriting runs out along its line; nothing fades.
- **Palette:** ultramarine falling through turquoise to lemon at the horizon, ochre and umber plain, waxy flesh, violet-umber shadows, one saturated orange kept for a single accent; a fine linen weave at about 4 %.
- **Subject rule:** soft things that should be hard, things held up that should fall, one object repeated to the horizon, one image hiding a second meaning. Invent props for the brief; never re-stage a known painting and never reuse the sample picture's props.
- **Sound:** sparse, airy, slightly uncanny textures; long silences.
- **Use when:** conceptual brand films, art films, ideas about time, scale, the subconscious.
- **Do not use when:** literal product demos; fast cutting.
- **Common mistakes:** visible brushwork or soft edges (that is painted oil) -> hide the brush, keep every edge hard; drama put in the paint -> drama lives in the idea and the light.
- **Source:** alexgreensh/anidoodle `references/styles/dreamGlaze.md` (Apache-2.0).

