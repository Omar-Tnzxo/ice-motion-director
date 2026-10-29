# Cut and transition catalog (exact numbers)

How each seam is built. Which seam to use, how many and when is in `transition-policy.md`; the continuity logic behind seams is in `seams-and-carry.md`. Numbers assume 1920x1080 at 30 fps unless marked; scale distances with frame width.

## Contents
1. Anatomy of a cut on motion
2. Velocity-matched cuts
3. Zoom and scale cuts
4. Blur cuts
5. Wipes, masks, floods, irises
6. Container and state cuts
7. Whips and pans
8. Registry transitions (overlap blends)
9. Shader transitions
10. CSS transition details
11. Kinetic-type cuts
12. Special seams
13. Broadcast transitions

## 1. Anatomy of a cut on motion

- Outgoing shot A accelerates into the cut over its last 3-8 frames (about 0.2-0.4 s); its last frame is its fastest.
- The cut itself: one frame, zero fade.
- Incoming shot B's first frame is already moving or already built; it opens at the same speed, in the same screen direction, and comes to rest over 0.8-1.4 s (calm) or 0.3-0.5 s (energetic).
- Optional 0-3 empty frames only inside a dive.
- Author every seam as a pair: spec A's last 6 frames and B's first 6 together (object, position within about 0.02 of the frame, scale, colour, blur, ground, velocity).
- The incoming shot owns the cut frame.
- Both sides at rest, or both at one speed: never one side settled and the other moving ("settling to rest before the cut, or starting from rest after it, is a dead beat").

## 2. Velocity-matched cuts

| Cut | Exit | Swap | Entry | Use |
|---|---|---|---|---|
| Cut-the-curve (continuation cut) | x or y 0 to -230 px (about 12 percent of frame width), power4.in, 0.2-0.4 s; opacity fade completes at 25-30 percent of travel | hard cut at peak velocity (about 3,070 px/s for 230 px in 0.3 s) | from +230 to 0, power4.out, same distance and duration (entry at least as long as exit), ignites at about 0.35 opacity mid-path; optional blur 8-10 px | Default boundary in energetic launch, app ad, hype, social; partial travel, never full off-screen moves |
| Registry form of cut-the-curve | power4.in to the swap at cutFraction 0.33 | at peak speed | blurPx 12 default | same |
| Velocity-matched upward | y -150, blur 30 px, 0.33 s power2.in | | y 150 to 0, blur 30 to 0, 1.0 s power2.out | Adjacent beats in kinetic and showreel films |
| Whip (blur pan) | x -400, blur 24 px, 0.3 s power3.in | | x 400 to 0, 0.3 s power3.out | Energetic montage |
| Combined lateral and zoom | both sides shrink: exit 1 to 0.92 | | entry 1.08 to 1 | Lateral move with depth |
| Direct cut on stage change (explainer variant) | 0.28 s, offset = -d q^2 | cut | 0.42 s, offset = +d (1 - q)^3, d = 96 px horizontal or 72 px vertical, blur at most 10 px | Narrated explainers, continuous within a stage |

Speed match tolerance: exit and entry speeds within about 5 percent; the incoming side picks up at least 50 percent of the way through the notional path. Tween eases across the cut are power4.in then power4.out, never in-out on either side.

## 3. Zoom and scale cuts

| Cut | Exit | Swap | Entry | Use and limits |
|---|---|---|---|---|
| Zoom-through | scale 1.0 to 1.2, blur 0 to 10 px (text) power3.in, opacity 1 to 0.15 as a separate linear tween, 0.2 s | hard cut: incoming opacity 0.15, scale 0.75, blur 10 | 0.75 to 1.0, blur to 0, expo.out, 0.5 s | State change, section boundary, "one thing causes the next". Never both texts visible; headlines only, never body text (0.75 scale is unreadable) |
| Inverse zoom-through | 1.0 to 0.8 | incoming starts at 1.25 | 1.25 to 1.0, expo.out 0.5 s (total about 0.7 s, split 30/70) | Arrival and payoff beats only, never ordinary boundaries |
| Zoom-through (registry overlap form) | old scale 2.5, blur 8, power3.in | 0.4 s overlap | new 0.5 to 1, power3.out | High energy |
| Flight-through | push about 1.2 over 0.2 s | cut | incoming grows from about 2/3 size to rest over 0.5 s; a zoom that would open under 0.4 is refused | The thing flown into is what the next shot is about |
| Push-through (3D camera) | push in power2.in toward the text position, push 2.0 | cut | pull back from an oversized new scene (from 1.5) power3.out; in 0.5 s, out 0.95 s | About once per film in a flat direction, only when motivated; when depth is the medium (the plan's `depth` row from the style or a reference, `depth-and-3d.md` section 1) each push-through counts by its own trigger row |
| Explainer push cut | push world 1.05x | | new scene born at 1.08-1.12x settling to 1 in 0.8 s while old elements exit upward with blur | Explainers |
| Scale-swap | 0.3-0.5 s power2.in to scale 0.6-0.8 | overlap 0.1-0.2 s (above 0.3 s both are clearly visible together) | 0.45-0.7 s back.out 1.4-2.2; incoming above outgoing; shared origin | Playful swaps; bouncy ease only on the incoming |
| Scale cut (one frame) | | content and distance change in the same frame; background keeps its own scale | | "A zoom tween says camera, a one-frame cut says different distance" |
| Magnitude rule | | at the swap frame a continuing push needs the incoming field of view equal or tighter | | Otherwise it reads as a rubber band, and blur does not hide it |
| Zoom isolation (collage) | power4.in about 1.2 s to the measured overflow (4.5-7x) | swap | inverse arrival expo.out about 1.1 s from about 3.2 | Explainer collage; verify centres within about 30 px and sizes within about 10 percent |
| Dive into a logo detail | constant octave rate: scale 1, 1.02, 1.15, 1.46, 2.28, 4.52, 8.98, 14.67, 21.9 at 0, 0.067, 0.133, 0.2, 0.267, 0.333, 0.4, 0.467, 0.533 s (interpolate log scale), translating toward a feature | fade it in place in 3 frames, show 3 blank frames | zoom a container out to rest (about 0.62 s) | Brand to product; a raster above about 22x softens, so author the detail as vector |

## 4. Blur cuts

- Blur amount by size: text-scale 10 px (20 px smears text into illegibility); full-frame surfaces 18-20 px. Both sides use the same peak blur at the swap frame. Blur the wrapper, never the children.
- Blur-matched cut (smear films only): ramp the exit blur over 3-8 frames, start the entrance at or above the exit's blur (18 to 80 px) and resolve over about 8 frames (0.27 s).
- Rack-focus blur cut: at most once per about 8 s, only at a narrative beat; cut at peak blur (at least 6 px, peak 8-12, at most 16-18); about 1.06 lens-breathing scale; power2 eases. Never blur and opacity in one tween on one element (headless compositing bug); never blur a video element directly (wrap it).
- Blur by energy (for blur crossfades): calm 20-30 px over 0.8-1.2 s with a 0.3-0.5 s hold; medium 8-15 px over 0.4-0.6 s, hold 0.1-0.2 s; high 3-6 px over 0.2-0.3 s, no hold.
- Blur push (UI films): old to 0.92 scale with blur 24 and fade, new from 1.06 blurred to sharp, 0.55 s; underlay a 1.08x heavily blurred copy of the old frame to avoid black edges.

## 5. Wipes, masks, floods, irises

| Seam | Numbers |
|---|---|
| Wipe that starts in A | feather 0.31-0.42 of the wiped axis, 0.56-0.6 s (a short wash 0.28-0.32 s), painted in the next scene's ground colour; next hero starts 0.1-0.12 s before the wipe completes; rotate direction across the film; starts 0.1-0.2 s before the voice line ends |
| Clip-edge wipe through glyphs | 5 frames, accelerating |
| Two soft masks | erase front about 0.1 s ahead of the reveal front, never a crossfade |
| Stair or block wipe | grid jumps of about 0.06 W |
| Pixel dissolve | real cells 1.5-2.5 percent of W, stepped coverage 90, 60, 35, 10, 0 over about 0.33 s from one edge; "pixel occlusion reads as craft, opacity reads as default" |
| Flood | a circle from the source object must clear the farthest corner (distance to the farthest of the 4 corners x 1.05) in about 0.3-0.35 s, then contract into the next object; flood in 0.4 s or less, drain about 1 s |
| Iris | opens from the thing the next scene is about, 0.5-0.8 s, evenly in log space so it does not crawl then snap; centred on nothing it is only a shape |
| Brush wipe | 0.6-0.9 s, in the direction the story already moves; drawn registers only, at most once or twice per film |
| Mask reveal (logo, type) | proportions 15:60:25 (lead-in : wipe : settle), clip-path from the inline start; a premium pair adds 2-4 px drift; wipe direction = reading direction (right to left in Arabic, see the ice-arabic skill) |
| Ground flip by act | a growing object, a band crossing the frame, a cut hidden in fast motion, or a 0.5-0.7 s sRGB ramp timed to what leaves. A white flash is not a ground change or a filler between beats; it passes when it carries a meaning the plan states (illustration only, several kinds: a camera flash, a memory or time jump, light that bursts in the scene, a beat drop in a music-led film, a broadcast "new scene" seam), at the count the meaning allows, inside the photosensitivity rules (the `ice-audio` skill, `references/cue-map-and-beat-sync.md` section 6); the news reel's flashes are the measured case (section 13). A crossfade only where the type's transition policy allows it or the reference measures it (`transition-policy.md` section 3) |
| Object wipe near the lens | ornament close to the camera, about 2x frame height at that distance, diagonal power1.inOut about 1 s, scale peak exactly at the cut, alternate direction |
| Light leak | soft ball about 2400 px radial gradient, blur 64 px, screen blend, top layer, in sine.in 40 percent and out sine.out 60 percent, slow diagonal drift, alternate sides, tinted with the brand accent (scoped: warm, retro, cinematic films; a leak painted on a drawing reads as stock) |
| Light sweep across the cut | covers 40-60 percent of the frame at the cut, not 100 percent |

## 6. Container and state cuts

- Container replacement: contract A's container about 9 percent on a gentle accelerating ease, then replace it outright at full size with a faint halo and a one-step ground shift; a 1-frame empty capsule or card may be the placeholder; no frame is spent on a loading state.
- Grey dip: hide a replacement in a 4-frame flat grey dip, not a black cut, and carry the object's motion across.
- State change inside a scene: hard plateaus of 0.3-0.4 s with a 1-frame gap; never a crossfade.
- Card morph anchor: hold 0.6-1.5 s before the morph; morph 0.6-1.2 s power2.inOut (never back or elastic: overshoot fights the shape change); uniform-scale substitution instead of width and height tweens; the handoff anchor is pixel-identical to the card's final state; stacking by DOM order, never a z-index snap mid-fade.
- Theme crossfade morph: 3-5 skins, hold 0.8-1.5 s each, morph 0.25-0.4 s (about 0.3 canonical); nothing tweens but opacity; the anchor never moves; camera always static.
- Expand-rect shared element: the chosen card scales 1.06, others recede to 45 percent, it expands to full screen (radius 38 to 0) on a spring with no bounce (about 0.55 s); the new frame is opaque inside the card from its first frame; stop any floating before the expand.
- Text that swaps inside a morphing container gets its own timing: content enters after its container starts morphing and leaves before the next morph; swaps use a short blur (about 10-12 px) and a 0.15 s fade; one text layer on screen at a time. Reference timings: enter delay 0.07 s, enter 0.26 s, exit 0.12 s, blur 12 px, enter scale 0.94 to 1, exit scale down 3 percent.
- Sequential text swap: outgoing 0.16 s, incoming starts after it ends (power2.in out, then power2.out in); never two words overlapping with half opacity (a crossfade of two words dims their shared letters).

## 7. Whips and pans

- Measured whip: median 8 frames, peak speed at t = 0.25, peak about 13 percent of frame width per frame. Use 3-5 frames of travel around the peak, cut at peak speed, new content starting along the same vector.
- Whip entry half: whip ease 7-8 frames; departing half accelExit 6-10 frames, ending at peak speed.
- World whip with directional blur: world shifts 120-200 px with 18 px blur over 0.3 s, alternating direction.
- Background whip: translates about 1500 px in 6 frames with an 8 px blur.
- Whip-streak: the next scene's start lands at the streak's peak (about halfway) so the cut hides in the brightness.
- Whip with content changing during the whip (crisp films); blur-matched whips (smear films).
- Speed ceiling: past about 2.5 frame widths per second, blur stops reading as motion; cut on the beat instead.
- A whip needs matching direction, blur or occlusion logic and a clean landing; never repeat it back to back.

## 8. Registry transitions (overlap blends)

For engines that overlap two scenes (the injector extends the outgoing scene and pulls the incoming earlier):

| Type | Duration | Values |
|---|---|---|
| Crossfade | 0.5 s | power2.inOut |
| Blur crossfade | 0.6 s | blur 10 px, scale 1.03 / 0.97; default when the two scenes' backgrounds differ a lot |
| Push slide | 0.5 s | power3.inOut, plus or minus 1920 / 1080 |
| Zoom-through | 0.4 s | old scale 2.5 blur 8 power3.in, new 0.5 to 1 power3.out |
| Squeeze | 0.4 s | scaleX to a line, power3.inOut |

Maximum 2.0 s. Timing presets: snappy 0.2 s power4.inOut; smooth 0.4 s power2.inOut; gentle 0.6 s sine.inOut; dramatic 0.5 s power3.in then out; instant 0.15 s expo.inOut; luxe 0.7 s power1.inOut. Minimum transition 0.3 s, sweet spot 0.5 s; start the transition at boundary - duration / 2. Visible portion: in-out easing hides both ends, so a 0.34 s complex transition reads as 0.2 s; give designed transitions 0.48-0.5 s.

Frame-based tables for overlap engines at 30 fps: quick cut 10-15 frames, standard 20-30, dramatic 40-60, glitch 15-25, light leak 30-45 (a second source lists 15-20 / 30-45 / 50-60 / 20-30 / 45-60: use the first for social and energetic films, the second for calm and cinematic ones). Overlap engines: total duration = sum of scenes minus each transition length; overlays at a cut do not shorten the timeline; never place an overlay and a transition adjacent.

## 9. Shader transitions

Durations: domain-warp 0.5-0.8 s; ridged-burn 0.5-0.8; whip-pan 0.3-0.5; sdf-iris 0.5-0.7; ripple-waves 0.6-1.0; gravitational-lens 0.6-1.0; cinematic-zoom 0.4-0.6; chromatic-split 0.3-0.5; swirl-vortex 0.5-0.8; thermal-distortion 0.5-0.8; flash-through-white 0.01-0.3 (never as an invisible 0.01 s bridge); cross-warp-morph 0.5-0.8; light-leak 0.5-0.8; glitch 0.3-0.5.

Energy: calm or editorial cross-warp-morph, light-leak, domain-warp, thermal; medium cinematic-zoom, whip-pan, sdf-iris; high glitch, chromatic-split, ridged-burn; ethereal gravitational-lens, ripple-waves, swirl-vortex. Avoid transitions that create repeating geometric patterns (tile grids, hex cells, dot arrays); organic noise (fbm, domain warping) is fine. A brand reel of 5-7 beats usually wants 1-2 shader transitions (the hero reveal and the CTA); a 6-8 scene film about 2, the rest hard cuts. The shader is the exit: content stays visible, no exit tweens before it. Shader implementation and capture rules: ice-engines skill.

## 10. CSS transition details

3D card flip 180 degrees on Y, backface hidden, parent perspective 1200 px; card rotating in rotateY -35 to 0; blinds 6 x 180 px at 0.03 s or 12 x 90 px at 0.018 s (by energy: calm 4 horizontal or 6 vertical, medium 6-8 / 8, high 12-16 / 16); 5-block stagger 0.04 s; chromatic aberration plus or minus 80 px; ripple plus or minus 30 px with scale 0.97-1.03; VHS 20 strips x 54 px cloned from real content with a seeded generator; grid dissolve 4x3 or 12x10 cycling 5 palette colours; page burn: hide the outgoing at burn end with a set, content burns with the page (no falling debris), incoming fades from black at about 90 percent over 0.8-1.2 s power1.out; clock wipe as a 9-point polygon. Glitch overlays use normal blending at 35 percent opacity, not multiply (news reel: a recorded glitch clip in screen blend, section 13). Avoid star iris, tilt-shift, lens flare, hinge or door by default; a retro-TV, parody or miniature style, or a reference that uses one, keeps it with its plan row. Template order: position new scene, animate outgoing, swap, animate incoming, clean up overlays.

## 11. Kinetic-type cuts

- Waterfall (word cascade) cut: per word exit x 0 to -230, 0.34 s power4.in, fade 0.18 s power1.in, stagger about 0.022 s, last word dies at the cut; entry 0.3 s power4.out from opacity 0.35, entry gaps start at 0.05 s and multiply by about 0.84 per word; pre-set words hidden at build time. Whole-line variant fades about 0.3 s ending about 0.02 s before the cut.
- Cascade entry: arrivals are binary (opacity 0 to 1 by a set, never faded); anchor words y 60-80 px over 0.16-0.20 s, normal words 40-50 px over 0.13-0.16 s, light words 30-48 px over 0.10-0.13 s; power4.out, never in-out on an entry; one direction per cascade; split the final word into fragments to extend the climax.
- Fill zoom: the camera crashes into a shape whose colour is the next base (55 percent of the time expo.in to about 30x, 45 percent expo.out settle from 1.25).
- Bands: three slanted colour bands relay left to right, 12 percent stagger, the last one becomes the new base, 0.5 s expo.inOut.
- Push: 0.35 s expo.inOut.
- Word typography and reading time: ice-type skill.

## 12. Special seams

- Strobe or reel flip for breadth: first plate 2 frames, then 4 frames each (about 15 plates per second).
- Glitch bridge (a glitch, VHS or malfunction style named by the chosen style's craft profile, or a reference, sets its own length and count with its plan row; the news reel's Screen glitch clip of section 13 is the measured case): by default at most 6 frames, localized, one hard cut inside, matched sizes of A's last and B's first object, one rect per 2 frames; only if glitch is on-brand. The monochrome slice variant is the only form for restrained enterprise films; RGB split is a loud consumer and tech gesture (split 4-14 px, jitter step at least one render frame, entrance 0.25-0.6 s, burst 0.12-0.2 s; about 1 s reads as a broken render).
- One frame at 50 percent double exposure: at most one per film.
- Occlusion: a card rising 62 percent of 0.61 H in 0.13 s covers the change.
- Leave as arrived: what arrived over 0.5 s on a settling curve leaves over 0.25 s on an accelerating one along the same path.
- Effect becomes the next scene: a burst becomes the ground, a bead of 0.04 W grows x1.5-2.2 every 0.05 s to about 17x, a dot becomes a disc, a band sweeps; never a white flash as the effect itself. A flash with a stated meaning follows the ground-flip row of section 5; the news reel's white flash, red flash and the pill's white frame are its measured case (section 13 and `atomic-moves.md` section 7).
- Pull-back reveal with snap: the pull is released 0.40 s after the completion so cause and effect read.
- Wipe splicing two titles: the outgoing title leaves before the wipe and the incoming enters after it.
- Text over text mid-transition: leave while the covering sheet is still at least 93 percent opaque, or fade out then fade in at the destination.

## 13. Broadcast transitions

Scope: news reel (edit type `news-reel`, style family `family-broadcast-news.md`), any film whose reference measures the seam, and any film whose craft plan names a seam with the same meaning (the `ice-direction` skill, `references/treatment.md` section "Craft plan"); this section is the measured broadcast case of the meaning-led flash of section 5. Numbers at 25 fps (this section only; the rest of the file is at 30 fps). Every seam keeps its meaning: a flash used on a boundary that does not carry that meaning is decoration. Which of them a package uses, and how often: the `ice-styles` skill, `references/family-broadcast-news.md` section 2; how often hard cuts and dissolves appear: `transition-policy.md` section 3. Flash counts, strobes and archive interleaves follow the photosensitivity rules (default safe mode; faithful only when the user asks): the `ice-audio` skill, `references/cue-map-and-beat-sync.md` section 6. Colours are package values used as they are only when the stage 01 `identity` slot keeps them (`atomic-moves.md` section 7).

| Seam | Numbers | Meaning (English package unless named) | Build in code |
|---|---|---|---|
| White flash | 1-2 f peak (luma 171-253, about 2-3 f read by eye) then an exponential decay over 7-13 f (0.28-0.52 s), on the caption chunk boundary | Neutral "new scene": entering or leaving B-roll or a new evidence block (10 uses in one reel) | A white solid over the picture group, opacity 1 to 0 on an exponential curve; or `mix-blend-mode: screen` |
| Red flash with blur | 4-8 f (0.16-0.32 s): picture and captions tinted red (saturation 175-190) and blurred together; logo bug untouched | A turn to threat or conflict (4 uses in one reel) | A red multiply or colour layer plus `filter: blur()` on the content group; screen layers (logo, programme name) sit above it |
| Monochrome strobe | 8 f (0.32 s) of grayscale, inverted and threshold frames | A chapter break, the strongest seam, rationed (3 uses in one reel) | A per-frame filter list (`grayscale(1) invert(1)`, `contrast(4)`, `brightness(3)`); in safe mode one 2 f invert with a 6 f decay (the photosensitivity home above) |
| Red screen flash into archive (Arabic vertical package) | A #FF2E38 screen layer 0 to 100 percent in 2 f, hold 5 f, out 5 f (12 f, 0.48 s), starting about 11 f after the noun that names the archive; the voice runs 12 f into the flash | Red light means heat: the scene turns to the street or the event | Red solid with `mix-blend-mode: screen`; FFmpeg: a colour source blended in screen mode with the 2 / 5 / 5 envelope |
| Archive red flash (same package) | 1-frame attack, 4-6 f decay | A hit on each archive clip | Same layer, shorter envelope |
| Blur-out and burnt entry (Arabic horizontal package) | Blur from 6 f before the cut with a slight brighten, cut to an over-exposed first 2-4 f of archive; return: a 3 f blur-in on a 1.63x punch, then 8 f to 1.15x | The archive arrives burnt; the return hides inside the camera move (`camera.md` section 8) | `filter: blur() brightness()` keyframes on the picture group |
| Flicker exit | The beat's elements step opacity 100, 50, 100, 0 on keys 3 f apart (0.36 s), ending on the camera's last key | The beat is over; the next one starts clean | A per-frame opacity table, never a tween |
| Screen glitch clip | A recorded analog noise or glitch clip of about 0.5 s (0.3-0.7 s used) laid in screen blend over a card-to-photo cut; its sound is a short glitch stutter (`ice-audio` skill, `references/sfx.md`, section "Broadcast SFX by move") | Hides the cut and gives an analog, archival feel (one sub-brand package) | The clip as a video layer with `mix-blend-mode: screen` (or FFmpeg `blend=all_mode=screen`); a code-made noise plate from a seeded generator when no licensed clip exists |
| Light-bar wipe into the end card | A bright bar sweeps across the frame and the end card is revealed behind it; its whoosh lands into an impact about 7 f after the wipe starts. Measured on the same programme: the presenter shot leaves by a 3D phone turning edge-on across the frame in 14 f, then an 8 f crossfade to the end card | From the talk to "where to watch" | A blurred white bar translated across the frame with the end card unmasked behind its trailing edge (`clip-path` following the bar) |
| Drop exit with vertical blur (one sub-brand) | The whole title block drops off the bottom in 5 f (0.2 s), accelerating, with a vertical blur growing from 0 to very large (tutorial Gaussian 0 to 1000) | The card is done; the next picture follows | `translateY` on an in curve plus a vertical blur copy (canvas or SVG `feGaussianBlur stdDeviation="0 N"`) |
| Blur reframe of the presenter | About 22 f: blur out 13 f, cut at the blur peak to a new scale (x0.81-x1.43, anchored at the frame centre), blur in 9 f; blur from about 1 px up to 16-25 px | A breath on a caption chunk boundary: the shot size changes without a jump (4 uses in one reel) | `filter: blur()` keyframes on the picture group with the scale change on the peak frame |
| Cut-out first | The next subject's cut-out flashes white (or red) over the current shot 4 f before its own background arrives | Announces who comes next | The next shot's matte as a white silhouette layer for 4 f before the cut |
| Ring mask into the end card | The presenter leaves through a circular mask with a gradient ring that closes in about 30 f (1.2 s) as the last caption ends | Sign-off | `clip-path: circle()` tweened, plus the ring as a stroked circle |

The pill's own white frame before its collapse is an element exit, not a seam: `atomic-moves.md` section 7, "Title pill".

Sources: hyperframes skills (cut-catalog, cut-the-curve, transitions catalog and registry, rules), hyperframes docs (claude-design guides, registry catalog), community vox-explainer, measurements of three broadcast news packages and the reel tutorials of Muhamd Helal and Soni Designer (section 13, ideas only), motionmaxxing (transitions.md, motion.md), product-launch-motion, claude-motion-design, motion-video-kit, claude-remotion-skill, claude-code-video-toolkit, huashu-art-motion (grammars), anidoodle (motion deck), pixel2motion, Barty-Bart and charlie947 motion-graphics, ideas from anything2explainer, imMamdouhaboammar and remotion skills (rewritten).
