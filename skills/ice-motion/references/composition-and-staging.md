# Composition, staging and hero size

How a frame is staged so motion can be read. Type sizes and readability are owned by the ice-type skill; platform safe zones and aspect specs by the ice-engines skill; colour and palette by the ice-direction skill.

## 1. One focal point

- The viewer finds the focal point within about half a second; the eye knows where to look in the first second of every shot.
- One hero per frame, at most 3 visible subject groups; one primary anchor, optional supporting secondary, never three equal. Two panels only if one is at least 2x the other's area, or the camera moves between them.
- 1 hero plus at most 2 supporting elements on screen; hook peaks may show up to 4 groups for under 0.5 s.
- A frame you cannot describe in one sentence has no hero; a sentence that starts "a card on a flat colour" describes a deck frame.
- Squint test: one display moment dominates at 3-6x its neighbour. Hierarchy uses at least two of: size (3:1), weight, contrast, position (upper third is strong), motion.
- Large scale ratios (one huge element against small labels); avoid medium-sized everything.
- Keep 1-2 reading targets at a time.

## 2. Hero size (scoped)

| Rule | Value | Holds in |
|---|---|---|
| Lead subject in feature beats | 60-85 percent of the usable frame; no small card in a big empty field | Industry spot, business commercial, app ad |
| Invented hero (abstract visual) | 40-60 percent of the frame | Explainer |
| Primary visual | at least 40 percent of the canvas | Product launch |
| Hero occupancy | hero 28-55 percent, support 10-25 percent, micro icon 4-10 percent | Commercial films with UI |
| Subject | at least half the frame, background changes with the content | Art-style explainers |
| Subject at key moments | at least a third of the frame height | Story films, character films |
| Camera resting on an item | item fills 80-90 percent of the frame | Investigation desk, collage |
| Readable proof fragment | at least 0.55 W or cropped by the frame edge, UI text at least 0.04 H | Product launch, UI walkthrough |
| Small elements, big ground | about 70 percent of the frame empty ground, and the ground is a surface (texture, light, material), never a flat fill | Minimal product films with a calm genre reference, landscape only (scoped: the measured genre was about 34 percent dead still, small elements on white). Not in a vertical ad or at phone size by default: there the richness floor of section 7 wins, unless a minimal style or a reference sets the floor through its exemption row (section 7) |
| Statement frames | 85-95 percent free of ink (free of ink is not flat: the ground is a surface) | Kinetic statements |
| Hero text | 60-80 percent of the frame width; display type about a tenth of frame width | Kinetic type, title cards |
| Character | close-up 55-65 percent of frame height, wide at least 35 percent | Character explainers |
| Make small things bigger than you think | detail that reads at 22-50 px often needs 44-74 px | Drawn and art styles |

Conflict note: "fill the frame" (business commercials, explainers) and "small elements on a big ground" (minimal SaaS reference genre, calm brands) are both right. Choose by the film's reference genre and brand register, log it, and keep it consistent through the film. A mostly empty frame works only with exactly one subject, something leading the eye (cursor, voice, eyes), for under about 1.5 s, and not at phone size, unless a minimal or sparse style or a reference whose measured fill is lower sets the floor (section 7, exemption rows). Either choice must still meet the richness floor of the film type, or the floor that source sets (section 7).

## 3. Layers and depth

- Every frame is ground, light, depth or texture, material, and sound; "a card on a flat colour" has only one of six.
- At least 2 layers per beat; three depth layers minimum in most commercial frames (background treatment, midground content, foreground accents); about 6-10 visual roles is a starting point, not a contract.
- Layer order back to front: ground; texture (screen-fixed); background UI defocused 4-11 px; hero and camera group; claim text (screen-fixed, never blurred while UI is); in-front accents; caption pill; cursor on its own top layer.
- Occlude rather than fade: occlusion implies physical space; fades imply a slide deck. A headline behind a device with a sparkle in front sells depth.
- Pick a few depth cues (scale, occlusion, shadow, blur, perspective, parallax, light, overlap, focus) and keep them consistent; a small elevation system (low, medium, high) with one light direction; not everything floats.
- A frame that fills all its roles at t = 0 is a poster, not a scene: build it over time.

## 4. Layout grammar

- Video frame, not web page: anchor to edges and use split frames; centred and floating is a web pattern. Compose asymmetrically (60/40 or 70/30), never one element centred in emptiness by default; a symmetric or sparse style (illustration only, several kinds: a centred tableau, a Swiss poster, a product on a seamless ground) or the reference's measured composition passes with its exemption row.
- Layout vocabulary: centred, rule of thirds, split screen, layered depth, asymmetric 60/40 or 70/30, triptych, full-width strip. Composition families to rotate: full-frame type, asymmetric editorial, centred object, wide environment, close detail, depth, quiet proof, diagram, image-led, negative-space CTA.
- Statement placement (launch genre): baseline y 0.52-0.54 of the height, ink span 0.30-0.56 W for 3-5 words; final title slightly off centre at x 0.46-0.47 (exact centre reads as a template); thesis word about 33 percent of the height centred; a left-aligned split phrase at x 0.10-0.14, one line, cut within 1.2 s; centre band y 0.43-0.55. Statements are centred only when paced to speech, never as a page.
- No text, label, logo or counter lives in the outer 0.12 W / 0.10 H band (no page chrome) by default. A recurring identity mark chosen at 01 (illustration only: a channel bug, a series title, a progress bar) passes when the plan's `identity` row names it and the element carries `data-identity-mark`; an editorial or Swiss grid style that sets type to the edge passes with its exemption row (`lint:C1`), and the platform UI safe zones still apply (the `ice-direction` skill, `references/treatment.md` section "Craft plan"). Scope (lesson L10): fixed identity marks measured from a reference (logo bug, programme name, corner bug, progress bar, location tag) sit where measured, at the measured position and size, even inside that band; with the user's identity the user's mark takes the same slot (the `ice-remake` skill, `references/rights-and-modes.md`, subsection "Fixed identity marks"; checked by the `ice-qa` skill, `references/identity-tests.md`, "Fixed identity marks"). News reel (edit type `news-reel`, style family `family-broadcast-news.md`): the package's fixed marks sit at the positions of `family-broadcast-news.md` section 2. Text-safe margins for 1080 frames: at least 80-160 px from the edges depending on source; never `top: N px` absolutely positioning a whole content container.
- Grids stay symmetric (equal card sizes and gaps); edges snap to column lines; spacing hierarchy: outer margin at least group gap at least inner gap.
- Every shot keeps at least one empty quadrant; all four corners plus the centre filled reads as clutter. At most 5-6 actively visible elements; leave at least 15 percent of the frame empty in diagram films.
- Adjacent shots never share the same composition: change composition and camera, never the style. The same layout recipe at most 3 shots in a row and not over a third of a film of 6 or more shots; same presentation card not in 3 consecutive shots.
- Edge cropping says there is more than you see: crop avatar sets and devices at the edge (a fully visible phone is a mock-up), let containers overflow, crop text by the box edge instead of wrapping, leave the second figure cropped and moving. What the camera is about to cut fades before it does.
- Portrait (9:16) is a new layout, never a crop of 16:9: reorder, stack, shorten lines, retarget the camera, preserve narrative arrival frames; set em by width, lines at most 0.8 W, centre band y 0.40-0.52 so platform UI never covers it.

## 5. Staging over time

- One subject per beat. When the next subject arrives, the previous one yields: a real exit (0.15-0.5 s) if it is not referenced again; demote in place (shrink to about 0.92, shift up, darken about two thirds, 3 px blur, within 0.5 s, starting about 6 frames before the new anchor) if it will be compared; or the camera leaves it. A demoted group still occupies its slot. On light grounds at most one demoted group at a time. (Idea, rewritten.)
- Handover without overlap for panels: old panel exits fully, then the host repositions or the new subject enters, then the new panel arrives.
- In travelling-camera worlds, quantity is shown on one readable plane with depth by scale, at most about three visible; the nearest leaves by moving past the lens, never by fading.
- Protect the mouth, key gesture, product fact or text carrying the current beat; the face safe zone is never entered by text or cards in talking-head and B-roll overlay edits (how to measure it: the `ice-type` skill, `references/caption-placement-safe-zones.md` section 4).
- With a person on screen the information group goes to the opposite half; without one, the bounding box of the subject group is centred (more than about 48 px off is a defect).
- The final frame is simpler than the densest middle frame: the ending resolves, clears and holds.

## 6. Light (staging level)

- One light logic and one lens per film: assets in four rendering styles read as stock.
- Key plus rim plus falloff plus contact shadow; flat fills with a drop shadow and a glow on every element feel cheap. A subject with no cast shadow is pasted on.
- A sweep of light across a surface reads as premium; a wide flash over the whole object at once reads as a glitch. Use the sweep on the one thing the idea is about, once (specular sweep: one pass per named beat, never a loop; skewed band, fade in 0.14 s, out 0.2 s). A material that shines (illustration only: jewellery, a watch, a car, glass cards) or a style or reference that sweeps every card sets its own count with its plan row. The measured case, news reel (edit type `news-reel`, style family `family-broadcast-news.md`) and glass studio reels: a slow sweep inside a glass card or along a map edge (about 3 s, angle about -30 degrees, white or the package red, additive) is allowed on each card or map the words name, once per appearance.
- Glow: on the hero only, peak opacity at most 0.45 (default 0.15-0.30), darker and more saturated than the hero surface, landing with the hero as one beat; more than one glowing element per frame reads as a casino by default. When the chosen style's medium is light (illustration only, several kinds: neon signage, a CRT or synthwave look, broadcast titles) or a reference shows several glows together, the glows keep the stated or measured strength and count, only on dark grounds, each with its trigger and plan row. The news reel is the measured case (edit type `news-reel`, style family `family-broadcast-news.md`): the measured package glows (keywords, the glow disc, the tapered arc, the scanline title stack) may share a frame when the reference shows them together, each with its trigger, at the measured strength, glow exposure kept low (about 0.2-0.5), and only on dark grounds (`atomic-moves.md` section 7). The same floor glow under every scene is a template; a halo only at an event.
- Brand colour as light more often than paint; ration the accent so it arrives as the brand (one accent per scene, colour meanings owned by ice-direction).
- Reveal by light: the scene is there from the first frame but dark; light arrives (a door, a lamp, the sun) and finds the subject.
- Bloom only on true light sources, low strength, high threshold; judge bloom at 1:1, never from a thumbnail.

## 7. Visual richness floor

Professional ads are full and alive. A film that is clean but sparse (a small hero on a big flat field, an empty half of a vertical frame, nothing moving inside the shot) fails by default, even when every other gate passes. The user's own words, a minimal or sparse style (its craft profile) or a reference whose measured fill, layers or motion is lower sets its own floor through an exemption row (`film:<richness key>`, `lint:depth_layers`) of a source kind the allowed-kinds table allows for those ids, never `content` (the `ice-direction` skill, `references/treatment.md` section "Craft plan", 11.7); the floor becomes the lower of the type's floor and that source's value, and an unsourced sparse frame, or one sparse by the agent's own restraint, still fails. This section defines the measures; each ice-film film-type file sets the minimum for its type in a "Richness floor" table that uses exactly these names; ice-qa measures them on stills and the render.

### 7.1 Premium means subtract clutter, never fullness

"Premium", "minimal" and "restraint" remove clutter: page chrome, extra effects, extra subject groups, decorative idle loops, a second accent, a third font. They never remove fullness: hero size, frame fill, depth, light, texture, real material and life inside the shot. If a frame falls below the floor after subtraction, enlarge the hero, bring the world in (environment, props from the brief's world, light) or move the camera closer; never accept the empty frame as "calm" on the agent's own taste. Emptiness is accepted only when the chosen style declares it or the reference measures it, through its exemption row (section 7); restraint the agent chose is never that source. Restraint means one focal point inside a built world, not an empty world.

### 7.2 The measures (stable names)

| Name | What it measures | When it is read | Counts as passing |
|---|---|---|---|
| `hero_share` | Area of the hero's bounding box (the visible part when cropped by the frame edge) divided by the frame area, in percent | The decisive frame of every shot (the frame in the shot plan's decisive state) | At or above the type's floor in every non-exempt shot |
| `hero_width` | Width of the hero text or wordmark ink divided by the frame width, in percent | Decisive frame of type-led shots, statements and lockups | At or above the floor; used instead of `hero_share` when the hero is type |
| `frame_fill` | Share of the 16 cells of a 4 x 4 grid over the frame that carry content: part of a subject, a prop, a foreground or background element with visible detail, readable type, or a light gradient with visible falloff. A cell of flat or near-flat ground is empty; grain or noise alone does not fill a cell | Decisive frame of every shot | At or above the floor in every non-exempt shot |
| `empty_half` | Seconds during which one half of the frame (top or bottom half of a vertical frame; left or right half of a landscape or square frame) holds only flat ground | Whole film | At or below the type's ceiling; declared rests listed in the motion plan do not count |
| `depth_layers` | Distinct depth layers visible in the shot: foreground (an occluder, a cropped prop, a blurred near object), subject, background (environment, set, textured ground with its own plane) | Decisive frame of every shot, and the shot plan's layer manifest | At or above the floor in every non-exempt shot |
| `in_shot_motion` | Share of the film's runtime during which something inside the frame moves on its own: the subject, a secondary element, light, a texture, playing media, a counter. Camera-only movement does not count. Holds the motion plan declares as true still (hold policy C) or as reading holds are taken out of the runtime before the share is computed | Whole film | At or above the floor |
| `longest_still` | Longest run in seconds with nothing moving inside the frame, outside declared holds | Whole film | At or below the ceiling |
| `surface_detail` | The ground of every shot carries at least one of: grain, material texture, light gradient or falloff, pattern, environment. A flat single-colour fill fails | Every shot | `yes` in every shot (flat colour is allowed only for a declared punctuation frame under 1 s, or when the style itself is flat print and carries grain or texture) |
| `light_events` | Visible light changes inside the film: a sweep across the hero, light arriving, a shadow moving, a lamp or screen turning on, a reflection travelling | Whole film | At or above the floor |
| `real_material` | When the brief names a real brand (or a reference brand is used): share of the shots showing that brand's product, screens, logo or colours that use its real material (live captures of its site or app, official brand or press kit files, colours and fonts read from its own site, untouched official logos, UI rebuilt at 90 percent fidelity or better) | Every shot that shows the brand | 100 percent; an invented or guessed brand look is a release blocker. How to obtain and verify the material: the `ice-assets` skill, `references/brand-authenticity.md` and `references/screen-capture.md`. With no real brand: `n/a` |

The floors are minimums a render must never go under; the hero-size targets in section 2 stay the aim. Exempt shots: a burst frame under 0.5 s, a declared true-still punctuation frame (hold policy C) under 1 s, a transition in flight (the frames between two decisive states). The end card is not exempt from `surface_detail` and `depth_layers`; it may run below the `frame_fill` floor by at most 4 cells (a CTA block needs clear reading space).

### 7.3 How the plan meets the floor

- Write the type's floor numbers into the motion plan (`Richness` line, `SKILL.md` section 5) and give every shot contract its `alive` and `layers` fields (the ice-film workflow's `references/storyboard.md` section 6).
- Fill, in this order, when a still is below the floor: enlarge or crop in on the hero; add the world the brief implies (place, props, people's hands, the product's real material); add a foreground layer that crosses the frame; add light (one key, a falloff on the ground, one sweep on the hero); add texture to the ground. Never fill with unrelated stock objects, floating particles, ambient blobs or extra text.
- Keep life inside the shot with one main action plus small secondary life (steam, a cursor, a ticking counter, a reflection, fabric, water, a screen playing), each with a cause from the story. Secondary life stays visibly subordinate (law 3 in `SKILL.md`); it is never an idle wobble on the hero.
- A vertical frame is filled top to bottom: when the hero is wide, stack the story vertically (the hero plus its cause above or its result below, a foreground crop at the bottom edge) instead of leaving a band of ground.
- Defaults for types without an ice-film type file: explainers use `hero_share` 30, `frame_fill` 10 of 16, `depth_layers` 2, `in_shot_motion` 60 percent (camera-only life is policy B, so most life comes from builds and drawing), `longest_still` 3 s; remakes use the reference's measured values when the fidelity contract locks them, otherwise the floor of the nearest ice-film type.

Sources: motionmaxxing (layout.md, world.md, judgment.md, director.md), hyperframes skills (motion-principles, video-composition, product-launch visual-design, faceless-explainer), hyperframes docs (visual-specs), motion-video-kit, product-launch-motion, huashu-art-motion, anidoodle, claude-remotion-skill, herk-edit-kit, group-d engines (manim, explainer, video-ad-editor), lemo-opuscar, ideas from video-talkcraft, anything2explainer, onetake, imMamdouhaboammar, hypit (rewritten); commercial-motion-design (founder).
