# Atomic moves: value tables

Small, reusable moves with their measured ranges. Glue 2-4 of them into one timeline per scene; that is faster and cleaner than starting from a full template. Moves already detailed elsewhere are listed with a pointer. Type-specific moves (kinetic word reveals, captions, keyword glow, typewriter cadence, terminal text) are owned by the ice-type skill. Engine components that implement these moves are listed by the ice-engines skill.

## 1. Entrances and reveals

| Move | Values | Never |
|---|---|---|
| Spring-pop entrance | power3.out default; back.out only in a playful variant (overshoot at most about 2); pop 0.4-0.7 s; hero visible by t 0.5 s; stagger min(0.06 s, 0.5 s / items); 3-9 items (above 9 switch to a wipe); y rise 0-32 px | rely on a hidden start state from CSS |
| Center-outward expansion | 3-8 items; expand 1.0-1.8 s power3.out; stagger 0.04-0.08 s; the burst is the beat | in eases; a page-style label parked below the burst; dense logo walls of 12 or more bursting from one centre |
| Waterfall entry | see `cut-catalog.md` section 11 | fading an arrival |
| Depth scatter assemble | see `depth-and-3d.md` | |
| Orbit 3D entry | see `depth-and-3d.md` | |
| Split tilt cards | see `depth-and-3d.md` | |
| Grid card assemble | staggered cascade, about 1 item per second for lists | |
| Reveal from behind | a thing comes out from behind something already in the picture (the picture supplies the mask), 0.4-0.7 s settling | a mask in mid-air with nothing drawn at its edge |
| Reveal by light | the scene exists from frame 0 but dark; light arrives and finds the subject | styles with no light (flat vector, diagrams) |
| Line or bar wipe | rules and bars grow scaleX from 0 with origin at the inline start | |
| Lower third | bar wipes in scaleX from 0, text slides up behind it, hold, slide out; 3-6 s; title-safe lower band. News reel two-box name super: the `ice-type` skill, `references/type-effects-specs.md`, table "Broadcast text" | |
| Motion vocabulary (short motion graphics) | slide y 150 / x 200 power4.out; scale grow 0.6 s power2.out; scale punch from 0.6 back.out(2.2) (playful); fade 0.4 s; fade with blur 14 px; word reveal stagger 0.1; wave per item 0.04; slam y -300 plus shake; emphasis scale pulse 1.12, shake 9 px, glow, colour shift; exits fade 0.4 power2.in, slide out, scale out 1.06; accents underline sweep, bar wipe, hold breath 1.015 | |
| Directional blur entries | in-up 0.8 s, stagger 0.024, from 60 percent y with scaleY 1.45 power4.out and vertical blur 30 to 0; in-left 0.75 s from -45 percent x with blur 50 to 0; out-up 0.4 s to -70 percent power2.in with blur 0 to 45 | leaving the blur filter on after the move (filtered elements re-rasterize every frame) |

## 2. Emphasis and data

| Move | Values | Never |
|---|---|---|
| Counting with dynamic scale | 2-3 digits ideal; start size 40-60 percent of the end size; count 1.2-2.5 s (power3.out preferred) or stepped per frame with decaying steps (15-23 steps in 0.5-0.9 s, the last 3 frames barely move); suffix 0.3-0.6 s after the count, back factor 1.4-2.0; tabular figures; round to the value; label is big text and arrives after the number lands; hero claims land on a round value, product data on an exact un-round value | font size changes per frame; back or elastic on the digits; a lone number without a cause or label (reads hollow) |
| Count during | the number changes while the thing it counts changes and stops on the frame the action stops. News reel (edit type `news-reel`, style family `family-broadcast-news.md`): a number the speaker says (a span of years, a day count, a toll) may count in its own beat with the spoken number as its trigger and cause (section 7, "Counter with colour change") | counting after the action; a counted stat slide that nobody says |
| Stat bars and fills | 4-6 bars, the last is the accent; fill 0.8-1.2 s matched to the count; stagger 0.06-0.1 s; scale from the baseline origin; fill and count peak together | height tweens, gridlines and legends as decoration |
| Chart scrub readout | 10-40 points; scrub 1.5-3 s power1 in-out; leave at least 0.8 s after the driver ends; single driver; text writes only when the index changes; the chart pre-exists | back.out on a read head (an overshooting read head looks broken) |
| Chart staging | layout 0-0.5 s, gridlines left to right, labels, data, accent change, annotation; 0.5-1.3 s per stage (about 1 s per step); bars grow from 0 with a 0.22 s lag, total about 1.3 s, labels counting at the bar top; lines drawn by time, not arc length (steep parts draw faster), about 1.5-2 s; annotations trigger when the line head passes the event; hold at least 0.5 s after numbers settle | truncated axes, bouncing bars, 3D bars, rotating pies, morphing between different metrics |
| Vertical spring ticker | item height equals the container height; 1-4 steps of 0.3-0.7 s spaced 0.3-0.5 s so springs overlap; bounce 1.4-2.5 (playful); sum springs in one update | swapping items by rewriting content between steps |
| Gradient text sweep | span 200-400 percent; sweep 1.2-3 s linear; word lag 0.25-0.5 s; settle by crossfade | tweening gradient stops; keyframe shimmer loops |
| Marker patterns | highlight, circle, burst (about 12 lines at 30 degrees), scribble, strike; cycle modes every 2-3 caption groups at high energy, 3-4 medium, 4-5 low | |
| Ambient glow bloom | see `physics-and-morphing.md` section 6 and `composition-and-staging.md` section 6 | |
| SVG icon enrichment | rotate parts about their own centre via the transform attribute; pulse 2-4 cycles per 3-5 s; dash flow offset an integer multiple of the dash period; phase-offset parts | wall-clock animation loops |
| SVG path draw | see `physics-and-morphing.md` section 5 | |
| AI tracking box | detection box recomputed per frame from the target, L-brackets not a full border, confidence flicker inside 95-99, size jitter 5-10 percent at a non-integer frequency multiple, rate under about 0.6 Hz, entry back.out 1.2-2.5 | tweening the box separately from its target |
| Avatar cloud network | 8-12 avatars on an ellipse (ratio 1.5-3), 80-120 px; hub 0.4-0.6 s; avatar stagger 0.06-0.10 s; lines draw outward 0.4-0.7 s; climax dwell at least 1 s | a centre that does not match the hub's real centre |
| Dynamic content sequencing | 3-6 entries; base 0.6-1.5 s per entry plus 0.03-0.06 s per character (lean high for wide-character scripts); holds 0.5-1.0 s mid, 1.0-2.0 s final | |

## 3. Swaps, displacement, impact

| Move | Values | Never |
|---|---|---|
| Scale swap | see `cut-catalog.md` section 3 | |
| Theme crossfade morph | see `cut-catalog.md` section 6 | |
| Card morph anchor | see `cut-catalog.md` section 6 | |
| Reactive displacement | driver 0.6-1.4 s back.out 1.2-2.0; victim 40-50 percent of the driver (cap about 0.6 s); intruder tilt 5-15 degrees settling flat; single driver; same axis, opposite directions; dwell at least 1 s | two independent tweens pretending to collide |
| Ticker takeover | the hero crashes in and shoves text: a collision, not a fade | |
| Kinetic beat slam | beat spacing 1.2-1.8 s (under 0.8 frantic, over 2.5 loses the pulse); entrance 0.35-0.6 s, exits at most 0.25 s; display 150 px and heavier; exactly one accent hue; one beat array; a different entrance per phrase | one reused punch-in for every line (the flat-but-competent tell) |
| Motion blur streak | out eases only (power4.out default); move 0.25-0.6 s (over about 0.7 s reads as a focus pull); peak blur 8-30 (default 18); 2-4 ghosts (more reads as strobe) at 0.3-0.6 opacity; blur peaks at peak speed and resolves to 0 at the settle; entrances and arrivals only; sharp dwell at least 1 s after | thin type under about 120 px (it swallows the smear) |
| Impact shake | see `camera.md` section 6 | |
| Particle burst | see `anti-slideshow-and-density.md` section 5 | |
| Chromatic glitch | see `cut-catalog.md` section 12 | |
| Contact | see `physics-and-morphing.md` section 3 | |

## 4. Camera and cursor moves

Coordinate target zoom, viewport change, multi-phase camera, camera-cursor tracking: `camera.md` section 4-5. Cursor click, drag, multi-cursor, press reactions, control sync: `cursor-and-ui.md`. Nudge curve: `timing-and-easing.md` section 8.

## 5. Showreel chapter recipes (energetic, illustration only)

- Bounce fall power2.in, rise power2.out, contact squash 1.35 x 0.7 for 2-3 frames then a settle.
- A laser line: scaleX to about 200 at 4 px, a 2-frame flash.
- Kinetic letters dropping from -120 px with 1-frame shuffled offsets.
- A per-frame driver (a pure function of time) draws canvas effects from seeded values and drives any HUD; properties touched by many tweens across the reel (a shared flash, an inverted class) are computed in that driver to stay seek-safe.
- Staggered phases finish before their cut: latest completion = start + max delay + duration.

## 6. Picking by intent (move steers)

| You need | Use | Avoid when |
|---|---|---|
| A headline landing word by word with narration | per-word rise (ice-type) | the line must swap mid-scene |
| A technical claim resolving | scramble or decode reveal | the brand is calm or premium (glyph churn reads noisy) |
| One sentence carrying several value words | kinetic word swap in a fixed slot | alternatives differ wildly in length, or long lists |
| A personified "someone clicks it and it works" | oversized cursor | a normal cursor pressing your own button is enough (press-ripple) |
| One number as proof | count-up | the number needs context or comparison (use a chart story) |
| A trend or comparison | chart story | only one number exists |
| A breath, opening or chapter card | title card lockup (low motion is the statement) | the scene needs energy or a second phase |
| A drawn mark | single path draw | multi-stroke art that needs a visible pen (use a hand-drawn ink sequence) |
| An ending that asks for action | CTA close | the ending is identity (logo close) |
| Several features to scan | grid assemble | features relate to one centre (constellation hub) |
| A visual before and after | wipe comparison | the states are sequential (cut or cut-the-curve) |
| Kinetic handoff | cut-the-curve | calm passages (a hard velocity cut there reads like a glitch); never as a hold |
| One confident reveal from a point | iris | both states must stay inspectable side by side |
| A crafted materialize moment | particle or pixel reveal | sober enterprise registers |
| Instrumented precision | telemetry HUD | non-technical audiences (reads as noise) |
| Energy between montage beats | whip-pan cut | quiet enterprise registers |
| Browsing or cycling options | spring stack shuffle | items that assemble once and rest |
| An editorial aside | annotation callout | plain emphasis is enough |

## 7. Broadcast news moves

Scope: news reel (edit type `news-reel`, style family `family-broadcast-news.md`) and any film whose reference measures the move; each element is part of the broadcast package (the `ice-styles` skill, `references/family-broadcast-news.md`), so it needs its trigger and its reason row (REASONS.md, the `ice-remake` skill, `references/notes-files.md` section 6) and is never a default look for an unrelated request. Colours below are the measured package values: they are used as they are only when the stage 01 `identity` slot is "as they are" or "a mix"; otherwise the same roles carry the user's own palette (the `ice-remake` skill, `references/rights-and-modes.md` section 1). Numbers at 25 fps unless marked; px values are at 1080 px frame width (multiply by frame width / 1080), and tutorial speeds in px/s were read in the tutor's own comp. Curves: `springs-and-curves.md` section 7, "Broadcast settle". Ice renders in code, so every row says how to build it in HTML, CSS, SVG or canvas.

| Move | Values | Build in code | Never |
|---|---|---|---|
| Glow disc | A soft red disc behind the speaker's head: 36-47 percent of frame width, centre at about 37.5 percent of frame height; linear gradient from about #881F25 (its dark end at 50 percent opacity, at the bottom, so the lower part melts into the set) to #D52A31 or #DA051D; a radial blur on the rim (tutorial: Radial Fast Blur amount 50); blend normal, sometimes soft light. Fly-in from off frame over 45-58 f (1.8-2.32 s) with a first-frame speed spike (1900-2500 px/s in the tutor's comp) and a long settle; hold; rise 17 f (0.68 s) easing in (peak about 450 px/s); drop accelerating to about 1700 px/s into the cut, stopping on the cut frame. Package variants: a 30 f (1.2 s) J or U swoop of about 1400 px at 1280 wide, 130 down to 5 px per frame (horizontal promo); a drop from above, top edge 0 to 375 px in 22 f (0.88 s) outCubic-like, diameter 438-448 px constant, out by a 17 f fade (vertical). Its trigger and its layer (between the plate and the person matte): the `ice-edit` skill, `references/layers-and-isolation.md`, section "3b. Programme matte kit" | An SVG `<circle>` or a `div` with a `linear-gradient` fill and `border-radius: 50%`, a `filter: blur()` copy behind it for the rim glow, placed under the person matte layer; GSAP or a pure function of time for the path | On a speaker who is dark or not speaking (`layers-and-isolation.md`, "The speaker stays lit"); without its trigger |
| Counter with colour change | A spoken number counts 0 to its value in 30 f (1.2 s; tutorial f25-f55), built as a stroke copy (outline) over a 70 percent opacity fill copy; the fill turns red to white in 17 f (0.68 s); the number rises in with a hard expo-out first-frame spike (6600 px/s in the tutor's 2160 wide comp) | Two stacked text layers (`-webkit-text-stroke` copy and a fill copy at 0.7 opacity), digits from `Math.round` of an eased progress, colour by interpolating the two hex values in the same frames | Counting a number nobody says; a stat slide (see the scope line on "Count during" in section 2) |
| Tapered glow arc | A white 8 px stroke on the disc's circle, tapered to zero width at both ends (taper 50 / 50 percent), trimmed to an 18 percent arc (trim 73-91 percent), with a wide soft glow (tutorial: radius 300, exposure 0.5, screen); it starts when the disc lands (fade 0 to 1 in 6 f, never visible while the disc still moves) and orbits 1.4 turns in 77 f (3.08 s, tutorial f25 to f102) | Canvas: draw the arc as many short segments whose `lineWidth` follows a taper curve, rotate by an eased angle; glow = a blurred copy with `globalCompositeOperation = "screen"`. SVG: a filled tapered path (SVG strokes cannot taper) rotated about the disc centre | An arc that keeps orbiting after the beat ends; more than one per frame |
| Scanline title texture | Titles and kinetic words only. Horizontal stripes like Venetian blinds: period 7 px, 45 percent of each period cut (about 3 px transparent), no feather; a horizontal jitter re-seeded about 10 times a second (tutorial: amount 9 px, size 12 px, seed = floor(time x 10)), so the jitter steps every 2-3 frames at 25 fps; a glow from a 60 percent brightness threshold with radius 10 px; a white, very soft halo (58 percent opacity, offset 5 px, softness 300). Measured on the English package: scanline pitch 3.9-10.6 px, about 40 percent modulation, glow 12-18 px | Stripes: `mask-image: repeating-linear-gradient(to bottom, #000 0 3.85px, transparent 3.85px 7px)` on the text. Jitter: draw the glyphs to a canvas and offset horizontal bands by values from a seeded generator keyed on floor(t x 10) (never `Math.random`, `ice-engines` skill, `references/determinism.md`). Glow: `text-shadow: 0 0 10px` in the title colour (CSS has no threshold, so glow only the bright text layer). Halo: `filter: drop-shadow(0 5px 150px rgba(255,255,255,0.58))`. HyperFrames ignores blend modes on overlay tracks: draw the stack onto one canvas (`ice-engines` skill, `references/hyperframes.md` section 12) | On captions, lower thirds, logos, or packages that do not measure it (the Arabic packages measured none) |
| Four-layer glow | Four additive glows of radius 20, 60, 180 and 540 px, each at low intensity (0.12, tripled), from a 50 percent threshold, composited behind the element | Four `text-shadow` or `drop-shadow` layers `0 0 20px`, `0 0 60px`, `0 0 180px`, `0 0 540px` at alpha about 0.12-0.36 each, behind the sharp element; on a canvas, four blurred copies added with `"lighter"` | On a light ground (glow reads only on dark grounds); glow limits: `composition-and-staging.md` section 6 |
| Title pill | A topic phrase in a coloured pill. Fly-in from off screen in 6 f (0.24 s) along a short diagonal, growing in width (at 1080 wide: x 850 to 120, y 1202 to 1014, width 230 to 960 px), with motion blur on the fly-in only, overshoot of about 34 px peaking 3 f after the landing, then settle; hold 72-74 f (2.9-3.0 s) while receding about 36 percent in width over 36 f. Grow variant: 15 f (0.6 s) from 94 to 790 px wide with the right edge fixed, outCubic 0.53 / 0.81 / 0.94. Exit: one white frame (the pill turns white), then a collapse toward its right end in 6-8 f (width 364 to 20 px), accelerating like inQuad | A `div` with `border-radius` and `transform` (translate, scaleX with `transform-origin: right`), the white frame as one step of the background colour; motion blur by a directional blur copy only during the fly-in (`motion-blur-and-clock.md` section 3) | Its overshoot or white frame copied to other elements: these are the scoped exceptions of `timing-and-easing.md` section 7 and `cut-catalog.md` section 13 |
| Brand sting | A small square of about 100-150 px that blinks on stepped frames: f1 half, f2-3 off, f4-12 on, f13-16 off, f17-25 on (one template); variant: f1 ghost, f2-3 off, f4-12 on, f13 off, f14 ghost, f15 off; it rides the zoom (layer `rig`, 151 x 99 to 190 x 124 px in 12 f). With it, the background wash steps (10 f: deep 4 f, light 2 f, lifted pale 4 f; or 6 f: 3 steps of 2 f) and a pale rectangle of about 8 percent white, about 700 px wide, on frames 3-4 of the wash; laid over the start of a big zoom, on the first frame and at section starts. The wash layer itself: `layers-and-isolation.md`, section "3b. Programme matte kit" | Opacity set per frame from a table (steps, `steps()` easing or a frame lookup), never tweened (`motion-blur-and-clock.md` section 1) | Flashing faster than the photosensitivity limit (`ice-audio` skill, `references/cue-map-and-beat-sync.md` section 6) |
| Topic wheel (one sub-brand) | A big thin dial off frame to one side (radius about 950 px at 1920 x 1080) carrying the topics on its arc; it turns in eased steps (tutorial keys -65, -14 and +2.9 degrees at about 0.67, 2.07 and 2.97 s, about 80 percent influence, `springs-and-curves.md` section 7); labels counter-rotate so they stay upright; inactive topics defocused (box blur about 3 px with a 98 px feathered mask); a cyan glow on the active topic | One rotating wrapper; each label inside gets `rotate(-angle)`; the active label is the one nearest the reading point | Free spinning; more than one wheel |
| Tick ruler | 39 short white ticks (8 px stroke, repeated at a fixed step) under the person matte, drifting sideways for about 6 s, the band masked with a 64 px feather at both ends | An SVG `<pattern>` or a row of lines translated linearly, masked with a `linear-gradient` | Ticks that mean nothing; a ruler without a disc or counter it belongs to |
| Box opening from a line | A thin outlined box (for example 1060 x 194 px, 5 px stroke at 1920 wide) opens from a line at its inline start in 21 f (0.84 s), expo out (peak about 4000 px/s); then its text types in (the `ice-type` skill, `references/type-effects-specs.md`, table "Broadcast text") | `scaleX` from 0 with `transform-origin` at the inline start (right in Arabic), or `clip-path: inset()` | A box that opens after its text |
| Element flicker exit | The beat's elements leave together by opacity 100, 50, 100, 0 on keys 3 f apart (0.36 s), ending on the camera's last key: `cut-catalog.md` section 13 | Opacity table per frame | A tweened fade instead |
| Word slide-up (preset values) | Per word: from +50 px below and opacity 0, a reveal window sweeping linearly across the words; each word lands on a fast-start, soft-end curve (ease high -50 percent, low 100 percent). Word reveals are owned by the `ice-type` skill | Per-word spans, start times from the sweep | Letter splitting in Arabic (joins break) |
| Darkening for a grave word (one package) | The whole room darkens (exposure 0 to -2.96 linear over 0.62 s, then the layer fades out over about 0.48 s) while the face is kept; a red multiply flash of 61 percent fading to 0 in 0.133 s (about 3 f) | A dark overlay with a hole for the person matte; the multiply flash as a red layer with `mix-blend-mode: multiply` on the canvas route | Darkening the speaker while speaking (`layers-and-isolation.md`, "The speaker stays lit") |
| Glowing red dot | A 59 px glowing red dot that travels with a 79 percent ease, a light sweep across it and a jitter re-seeded about 10 times a second | A blurred copy behind a sharp dot, seeded jitter as in the scanline row | A dot with no plate or line it belongs to |

The card field with a camera push-through lives in `depth-and-3d.md` section 5 ("Card field push-through"); the routes that build depth and 3D: `depth-and-3d.md` section 7, "Build routes for depth and 3D".

Sources: hyperframes skills (48 atomic rules, motion-graphics vocabulary, examples), hyperframes docs (registry catalog use_when and avoid_when), herk-edit-kit (motion-showreel), charlie947 motion-graphics (directional blur recipes), motionmaxxing (type.md counters), huashu-art-motion (finance chart staging), anidoodle (reveal cards); section 7 from measurements of three broadcast news packages and the reel tutorials of Muhamd Helal, Ahmed Maher, Ismail Ait toulba and Ahmed Eltanany (ideas only).
