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
| Lower third | bar wipes in scaleX from 0, text slides up behind it, hold, slide out; 3-6 s; title-safe lower band | |
| Motion vocabulary (short motion graphics) | slide y 150 / x 200 power4.out; scale grow 0.6 s power2.out; scale punch from 0.6 back.out(2.2) (playful); fade 0.4 s; fade with blur 14 px; word reveal stagger 0.1; wave per item 0.04; slam y -300 plus shake; emphasis scale pulse 1.12, shake 9 px, glow, colour shift; exits fade 0.4 power2.in, slide out, scale out 1.06; accents underline sweep, bar wipe, hold breath 1.015 | |
| Directional blur entries | in-up 0.8 s, stagger 0.024, from 60 percent y with scaleY 1.45 power4.out and vertical blur 30 to 0; in-left 0.75 s from -45 percent x with blur 50 to 0; out-up 0.4 s to -70 percent power2.in with blur 0 to 45 | leaving the blur filter on after the move (filtered elements re-rasterize every frame) |

## 2. Emphasis and data

| Move | Values | Never |
|---|---|---|
| Counting with dynamic scale | 2-3 digits ideal; start size 40-60 percent of the end size; count 1.2-2.5 s (power3.out preferred) or stepped per frame with decaying steps (15-23 steps in 0.5-0.9 s, the last 3 frames barely move); suffix 0.3-0.6 s after the count, back factor 1.4-2.0; tabular figures; round to the value; label is big text and arrives after the number lands; hero claims land on a round value, product data on an exact un-round value | font size changes per frame; back or elastic on the digits; a lone number without a cause or label (reads hollow) |
| Count during | the number changes while the thing it counts changes and stops on the frame the action stops | counting after the action |
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

Sources: hyperframes skills (48 atomic rules, motion-graphics vocabulary, examples), hyperframes docs (registry catalog use_when and avoid_when), herk-edit-kit (motion-showreel), charlie947 motion-graphics (directional blur recipes), motionmaxxing (type.md counters), huashu-art-motion (finance chart staging), anidoodle (reveal cards).
