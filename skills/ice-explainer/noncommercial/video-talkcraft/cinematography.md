> Translated from Chinese into English from Vincentwei1021/video-talkcraft (PolyForm Noncommercial 1.0.0). Noncommercial use only.

> Adapted from Vincentwei1021/video-talkcraft (PolyForm-Noncommercial-1.0.0). Changes: em dash and en dash characters replaced with colons, commas or hyphens. Noncommercial use only; see LICENSE and README.md in this folder.

# Cinematic Standard: Removing the PPT Feel (a shot methodology for talking-head videos)

Source: conclusions from several debugging rounds on the ai-math-video project (diagnose → restructure → measure). This is not an optional style suggestion,
it is a **structural requirement**: when it is not met, the final cut inevitably looks like "playing a PPT".

## 0. The four root causes of the PPT feel (for self-checking)

1. **No camera layer**: the canvas is static, and elements merely fade in or slide in on a fixed stage. Adding "a very slow push from 100% to 104~106% per scene (or the reverse, a very slow pull out)" removes half of the PPT feel.
2. **Elements die after they enter**: every animation is an entrance (opacity/translate reaches its target and freezes): this is exactly the PPT "entrance effect" model. The sense of motion comes from continuous movement: **it is carried by the very slow push/pull of the scene camera**, not by elements jiggling on their own.
3. **Hard page-flip cuts between scenes**: at a Sequence boundary all content is replaced instantly. Transitions must rely on **motion continuity**, not on a crossfade.
4. **Document layout + information pile-up**: title at top left plus a grid of bullet points is typesetting thinking, not composition thinking; elements only come in and never leave, so by the end the screen is full of still objects. **One beat tells only one protagonist**, and once it is done it yields.

## 1. Seven-layer shot model (vocabulary)

| Layer | Responsibility | Typical actions |
|---|---|---|
| L1 Camera | Carries the viewer through space | **Very slow push in / very slow pull out** (the only required motion; truck/orbit/dutch are no longer used as scene-camera moves) |
| L2 Focus | Decides what is optically readable | Blur-to-sharp entrance, rack focus, collective defocus leaving only the subject |
| L3 Subject | Motion and transformation of the single protagonist | Entrance, relay, morph, kinetic type |
| L4 Attached effects | Material and state cues on the subject | Glow, rim, particles, flash |
| L5 Supporting cast | Interacts with and reinforces the subject | Counter-motion, light beams, rings, timelines, parallax layers |
| L6 Environment | Atmosphere | Per-act color temperature (static token, optional); breathing vignette / light sweep / exposure pulse have been removed |
| L7 Mask | Controls visibility and framing | Stroke travel, scanline reveal, clip reveal |

Layer budget: **4-6 active layers at hero moments; 2-3 layers in transition shots**; at rest moments it is allowed for only the camera layer to move (very slow push/pull),
**subject idle and environment breathing are no longer required** (that "everything is always moving" approach went too far and does not suit talking-head video: the viewer is listening to a person speak and reading subtitles, so the only life the frame needs is a barely perceptible camera breath).

## 2. Global systems (before implementing any scene; the template already provides the code)

The code is in `template/motion-systems/`, fully deterministic (zero Math.random) and seek-safe.
**Subtract motion (the canonical rule)**: the motion system for a talking-head video keeps only two things: **G1 a very slow camera push in or pull out** + **G3 the yield state machine**.
Subject idle micro-motion, environment breathing vignette / diagonal light sweep / exposure pulse, camera accent pulses, x/y pans, rotation and blur curves are all **no longer required**;
G2 parallax and G4 per-act color temperature are downgraded to optional. The template code keeps these capabilities but turns them off by default (`Live idle={false}`, the three `Environment` options off by default).

### G1 CameraRig (camera.tsx)
- Each scene has **only one very slow scale curve**: push 1.00→1.04~1.06 or pull 1.06→1.00 (choose the direction by the shot's intent), continuous throughout, with the last key placed beyond the end of the shot (§6).
- **Do not** do x/y pans, rotation (dutch) or blur curves, and **do not add** accent pulses / shake: leave `impulses` as an empty array; footage that needs its own motion uses a camera-move card applied to the footage layer, not the scene camera.
- Put `CamState` (including progress) into Context; 3D scenes drive the THREE camera with the same progress: one camera, two projections.
- Camera paths are centralized in a single table in shots.ts (table-driven, decoupled from scene implementation), and each entry states the push / pull direction and the reason.
- **Start together, end together**: continuous motions such as the camera curve, the live-action base bed and the slow push on footage have duration = shot length; **write a rate, not a fixed number of seconds**
  (scale 0.5%/s, truck 2.8px/s); the base bed closes together with the footage during the 0.4s text exit. Waiting for the longest tween to finish before ending the shot = the tail where "the text is gone but the picture is still idling".

### G2 Parallax depth planes (Plane in camera.tsx): optional, not installed by default
- Scene content is layered: grid background depth 0.5, particles 0.72, main content 1.0, 3D canvas 1.08, foreground accents 1.12-1.2.
- `offset = cam.x × (depth − 1)`, with scale biased the same way. During push/pull the foreground and background move at different speeds, giving depth, **but this is no longer required**: a static act backdrop + a very slow camera push/pull is enough.

### G3 Yield state machine (life.tsx): idle micro-motion removed
- Lifecycle: forming → resolved → **handing-off** → gone, all pure functions of frame.
- During resolved the element **stays still**: `Live` defaults to `idle={false}`, and once an element settles it does not move a single pixel: the life of the frame is handled by the very slow camera push/pull.
- Yield rule: at the new subject's entrance frame −6f, the old subject starts `<Live demoteAt={new subject anchor seconds}>` (within 0.5s it shrinks to 0.92 + moves up + brightness −66% + 3px blur). Declarative: pass the next subject's ASR anchor directly to the previous subject.
  **demoteAt = demote and stay, not exit**: after dimming the element still occupies its slot in place and counts toward the §4.5 on-screen budget, and the new subject must not be placed in its position (the old name `retireAt` read as "exit" and directly caused a P0 text collision; renamed on 2026-09-06; the old name is still a deprecated alias).
- `<Defocus>` does the L2 collective defocus (only adds blur and lowers opacity, does not move position).
- **There are three ways to yield; choose by "will this element come back"**: not referred to again after this beat →
  **true exit** (0.15-0.5s exit, then gone from the layout); about to be referred back to / compared → demote and stay (Live retire / Defocus, kept in place);
  long-take segment → yield by the camera moving away. Demotion is a legitimate tool, but **a demoted element that stays still occupies the layout**: the §4.5 layout budget
  (≤3 groups on screen, an empty quadrant) must count it; on a light background a demoted blurred shape is still eye-catching, so do not keep more than 1 demoted group on screen.

### G4 Environment (env.tsx): only per-act color temperature remains, optional
- The breathing vignette and diagonal light sweep **have been removed** (`breathe`/`sweep` default false); if a vignette is wanted, it is a **static** layer in the act backdrop recipe (design-language §1.1), not motion.
- Per-act color temperature forms the emotional curve (1.2s cross-fade at act boundaries: "let the change be felt rather than seen").
- The exposure pulse **has been removed** (`pulses` default false); accents are expressed by the subject's own entrance animation.
- The event table keeps only ACTS (per-act color temperature, optional); EXPOSURE_HITS / TRANSITION_FLASHES / VIGNETTE_TIGHTEN are left empty and unused.

### G5 Line-drawing schematic (schematic.tsx): required for text-only shots, not installed for other shots
- For shots whose footage line is only "text" (except chapter cards), the subject plane must add one more layer of "something to look at": a line-drawing schematic of icons + boxes + arrows + small labels (`template/motion-systems/schematic.tsx`; icons in `icons.ts` are generated by `scripts/fetch_icons.py`).
- Three vital rules: **drawn by the machine in one stroke** (pathLength normalized + dashoffset, power2.inOut, still once drawn), **light up where the line reaches** (connecting lines are drawn first, nodes pop after being lit), **one skin** (ink 3px + accent, frosted whiteboard backing, dark token on dark backgrounds).
- Each beat of the schematic is tied to a word anchor (beats.json) and stacks with the G1 push/pull; it is not a fourth subject: it and that shot's title are two halves of the same subject group. Rules, the semantic graphics dictionary and the placement self-check are in `references/schematic.md`.

## 3. Motion transition library (Sequences overlap by 12-16 frames)

**Hard rule: every shot boundary must have an explicit transition treatment; bare cuts are forbidden**:
one of the six styles / caret-wipe / shape-wipe / long-take continuous camera move / graphic relay (`line-carry-transition◎`: shot A's underline runs off frame and wraps around to become shot B's picture frame; used only once per film as the signature spot), pick one of five; the SHOTBOOK states which one each boundary uses.
(black-slam's "last 1 frame opacity=0 hard out" is a designed transition and does not count as a bare cut; a bare cut is when content at a Sequence boundary
is replaced instantly as a whole with no treatment.)

Mechanism: in shots.ts each shot declares `lead` (extra frames rendered before the narration) and `tail`, and adjacent Sequences overlap;
`ShotFade` only does pixel fading, **motion is carried in the same direction by the camera curves on both sides**.
Code: `template/motion-systems/transitions.tsx`: ShotFade + CamKey generators for the six styles
(pushThroughOut/settleIn/whipOut/whipIn/blowoutOut/pullBackIn, spread directly into path)
+ overlay layers (Overexpose bright core, Shatter+ParticleDrift particle weld).

Each style has a recipe card (parameter table / known pitfalls / HTML demo in `references/cards/<slug>.md`):

| Transition | Outgoing side | Incoming side | Card |
|---|---|---|---|
| Push-through | Camera accelerates its push + blur rises | Starts from blurred high scale and settles back in the reverse direction (same direction of travel) | push-through-transition |
| Overexpose flip | Push toward the evidence object to 1.5x + white radial overexposure (asymmetric envelope: rises over the 10 frames before the cut, falls over the 10 frames after) | Pulls out from the bright core | overexpose-flip-transition |
| Whip pan | Whips out along x + blur 8 + slight rotation | Enters in the **same direction**, brakes in 0.35s + second-stage settle | whip-pan-transition |
| Black slam | Freeze-frame flash → last 1 frame opacity=0 (hardOut) | lead:0, enters at full brightness, and the opening carries its own motion | black-slam-transition |
| Pull-back cool-down | Everything sinks into near black + color temperature shifts | The only scale<1 start in the film, pulling back + rack focus | pullback-cool-transition |
| Particle weld | Subject shatters into particles (deterministic function of index) that drift upward | The next scene's particles/starfield spawn at the same position to take over (material continuity) | particle-weld-transition |

Black slam may be used only once per film, reserved for the biggest reversal. **One boundary uses only one style**; a 100s film has 5~7 boundaries, and reusing the same style gives more stylistic coherence than using all six.

### 3.5 Long-take mode (one-take, an alternative paradigm to transitions)

Multiple shots is editing thinking; a long take is spatial thinking: all content is pinned at different coordinates on one world canvas,
and one camera **moves continuously** across it following the narration, with new content forming only as the camera approaches: there is no Sequence switch, and spatial continuity itself is the transition.
Code `template/motion-systems/longtake.tsx` (WorldRig station table + WorldPlane parallax + WorldItem pins + useArrive proximity reveal);
selection and iron rules are in `references/cards/long-take-world.md`. Suitable for passages with a spatial / process / timeline metaphor;
a whole act can be a long take while transitions between acts still use the six styles. A long take is not exempt from the yield rules,
camera speed ≤1.5 screen widths/second, and the station layout must prevent "giveaways en route" (half-formed content of adjacent stations entering the frame).

## 4. SHOTBOOK specification (the storyboard must be written as a layer matrix)

Before writing the layer matrix, use the **three-plane layering worksheet** in `references/shot-design.md` (background plane / subject plane / text plane
+ a motion menu for each plane + seven shot-type presets) to set each shot's skeleton, then expand it into a beat-by-beat matrix.

Before implementation you must produce SHOTBOOK.md (a complete example is in `references/shotbook-example.md`):

```markdown
### S3 · 25.04-43.24 · Intent: a number stuck for 46 years is pushed open     ← one-sentence intent
| Beat | Layer | Object | Action | Role |
|---|---|---|---|---|
| 36.08 stuck at the exponent | L3' | 0.5991 big number | Emerges at center; ball cluster brightness −25% | The number takes over as subject, environment cedes energy |
| 41.52 zero point six zero four four | L3'' | 0.6044 | Old number struck through and knocked down, new number punches in on the same frame | Single-frame replacement = hero moment |
```

- Beat column = the anchor word from ASR word-level timestamps + absolute seconds; **every action row must answer "who is it supporting"; if it cannot, delete it**.
- For each scene write a one-sentence intent + the single subject relay line (who yields to whom).
- **The first line under each shot title is "Footage:"** (machine-readable; `scripts/preflight.py` stats each one):
  `- Footage: V (public/broll/gpu.mp4) · Image (public/stills/a.jpg, public/stills/b.jpg) · Screenshot (public/pages/gh/page.png) · Text`
  Codes follow the input type index in taxonomy.md (V = B-roll video · Image = image · Screenshot = web page/UI evidence · UI = UI self-demo · Text = text only · Host = talking-head person);
  V / Image / Screenshot must give a path, "to be collected" = FAIL; zero V / Image in the whole film = FAIL (live-action footage is mandatory, SKILL.md ③).
- At the end, attach each shot's camera direction (push / pull, start and end scale) and the layer count at hero moments.
- **G0 must attach a "layout rhythm table"** (added on 2026-09-21 after user feedback that "the layout is too fixed"; write it **before** the per-shot matrices: only with the whole film's rhythm laid out in one table can you see "eight shots all the same";
  `scripts/preflight.py` uses it to check consecutive identical states and the number of container types, and uses each shot's skin line to check repeated use of the same card and its share):

  ```markdown
  | Shot | Host form · position | Footage container | Main card |
  |---|---|---|---|
  | s01 | Half body · right | None (text in left column) | count-badge-title |
  | s02 | Corner badge · bottom left | Framed · center | split-60-40-story |
  | s03 | Off screen 4s → corner badge · bottom right | Full-bleed fullscreen | bed + crash-zoom-punch |
  | s04 | Half body · left | None (quote) | quote-card |
  ```
  Host form vocabulary: half body / corner badge (bottom left · bottom right) / inside a split-screen cell / cut-out stuck to a corner / off screen; footage container vocabulary: none / full-bleed fullscreen / framed / split-screen cell / base bed / multi-image arrangement / 3D wall / long page.
  3 consecutive shots with the same form + same container = FAIL; the same presentation card used in 3 consecutive shots or in >1/3 of the film = FAIL (§4.5 item 9).
- **Mandatory section "## Unfinished / Not Collected List"**: any "this film does not do X" must go one of two ways: write it into §0 as a design decision (+ rationale), or write it into this section (+ the blocking reason + which fallback sources were tried).
  The content may be "none", but the section may not be missing (preflight checks that the section exists). What it blocks is "unfinished work being packaged as a design principle and thereby becoming a premise that is no longer questioned".

### 4.5 Layout budget (the nemesis of clutter, the canonical rule)

> The budget governs "how much to place"; **where, how big and how to align** are in `references/layout.md` (grid / spacing tokens / alignment / centering / type scale / collisions / backing colors / nine-item check); check both together.

A shot judged "cluttered" is usually not because a single animation is wrong, but because **the layout has no budget**: elements only come in and never leave, all four corners plus the middle band are occupied, the same information is written twice. When writing the SHOTBOOK, check each shot:

1. **Split shots by semantic paragraph**; mechanical one-sentence-per-shot is forbidden; each shot is allowed only one primary visual job
   (one of hook/definition/data/process/comparison/conclusion/CTA).
2. **Pivot sentences belong to the next shot**: a "but this time it is not X" style turn/negation/rhetorical question is the **first beat** of the next shot: move the cut point forward to the start of the pivot sentence,
   clear the old shot first, and put the opening animation (strike-and-replace/question box) on a clean stage, not stacked on the old topic's full frame.
3. **On-screen budget**: at any moment subject groups ≤3 (subtitles/persistent elements do not count; **demoted elements that stay do count**);
   before a 4th group enters, one group must truly exit. Add a column "on-screen count" to the layer matrix for self-checking.
4. **Whitespace anchor**: each shot keeps at least one empty quadrant throughout; a ring-shaped full board with all four corners plus the middle band occupied = a hollow center with no path for the eye, judged cluttered.
5. **One hero treatment per screen**: when several numbers/big texts are on screen together, only one gets the hero treatment (large size/color block/color change),
   the rest are demoted to inline notes: three numbers with three hero treatments compete with each other and read as cluttered.
6. **On-screen text does not copy the subtitles**: on-screen text is a distillation of ≤12 characters, not a transcript of the narration; repeating a full subtitle sentence = the same information shown twice on screen.
7. **Layout event budget**: layout-level changes such as host form switches/composition rearrangement happen 2-4 times per minute; "a switch is punctuation, not a metronome":
   the only legitimate triggers are a new argument/chart replacement/before-and-after comparison/conclusion; mere passage of time or each subtitle line does not count.
8. **Staggered three-step order (the canonical rule)**: the old panel **fully exits** → the host changes position/the new subject enters → only then does the new panel fade in; the three must not overlap.
   For shots with the host present, first run `scripts/face_bbox.py` to determine the face safe zone (criteria in host-footage.md §3), and place the main information panel on the side opposite the host.
9. **Layout rotation budget (finalized by the user on 2026-09-21: in the final cut "most of the latter part has the host in the bottom left corner, the footage in a box in the middle and text on the right, far too fixed")**:
   items 1-8 govern within a shot; this item governs between shots: "every shot is correct" does not equal "the whole film looks good"; 8 out of 11 shots using the same 60/40 card is a final cut where every shot passed the gate.
   - The same **presentation-type card** (footage presentation / host interaction / data infographic / camera move) may not be used in 3 consecutive shots (2 in a row is fine, the 3rd shot must change style), and its share of the film is ≤1/3 (for films with ≥6 shots);
   - Of the two variables **host form × position** (half body / corner badge bottom left / corner badge bottom right / inside a split-screen cell / cut-out stuck to a corner / briefly off screen) and **footage container** (full-bleed fullscreen / framed / split-screen cell / base bed / multi-image arrangement / 3D wall / long page),
     at least one must change across 3 consecutive shots; neither changing = P1; films with ≥8 shots use at least three footage containers. A single B-roll is chosen from the seven styles in shot-design.md §2⑦, with adjacent shots in different styles; multiple footage items follow the relationship table in §2④′;
   - The same B-roll file does not go into two adjacent shots and appears in ≤2 shots in the whole film (change the footage or use `ffmpeg -ss` to take a different segment); the layout line is measured shot by shot, never copied from the previous shot;
   - Relationship to item 7: **rotation means changing the composition, not adding motion**: changing the layout at a cut is already one layout event, so do not manufacture extra host back-and-forth; the cap of 2-4 per minute still applies; inside each style there is still only the very slow camera push/pull.
   Machine gate: `scripts/preflight.py` uses the G0 layout rhythm table (§4) + each shot's skin line to check: repeated use / share / consecutive identical states FAIL; copied layout lines / reused footage / missing table WARN.

- **Accompanying graphics for text-only shots** (2026-09-07): for shots whose footage line is only "Text", the layer matrix must add one row "G5 accompanying graphic ← one-sentence relationship" (`references/schematic.md` §1); only text animations piling up = a slideshow, and preflight gives a WARN.

## 5. Acceptance criteria (check each item after rendering)

1. Active layers on hero frames 4-6; on any rest frame **the camera is moving** (very slow push in or pull out; ≥2 layers is no longer required)
2. **No 1-second sample of frames may be fully static**: `python3 scripts/motion_check.py <video>` detects this automatically (the tool's default threshold is 0.8s, stricter than the 1s criterion); a FAIL must be fixed
   - Two kinds of **stillness required by a card's finalized spec** will hit this gate: `logo-enter◇` "the settled state is the final frame, no idle", and
     `stage-keyframe-tour◇` "the hold must be truly still". **The treatment is not an exemption, it is to let the scene camera move for it**
     : the camera keeps pushing/pulling very slowly while the card itself does not move a single pixel (measured to turn FAIL into PASS).
3. **Every shot boundary has an explicit transition treatment (check boundary by boundary against the SHOTBOOK, bare cuts are forbidden)**; at transitions the motion direction of the shots before and after is continuous (except black slam)
4. Anchor → frame quantization error ≤16.7ms (30fps); do not claim <5ms (that requires 120fps)
5. One beat has only one protagonist; once done it must yield, no piling up to fill the screen (the three yield methods are in §2 G3; demoted elements that stay count toward the on-screen budget)
6. Layout budget (§4.5) checked shot by shot: on-screen subject groups ≤3, an empty quadrant present, a unique hero treatment, no full-sentence repetition between on-screen text and subtitles,
   the face safe zone never intruded at any moment (**the background of text also counts as intrusion**)
7. **No web evidence is statically pasted on screen**: for each web page / long page shot, check against the SHOTBOOK its shooting method
   (one of scroll / tour / zoom / highlight / push, shot-design.md §2④) and coordinate source (`targets.json`); a static screenshot as that beat's subject = P1
8. **Text and picture start together and end together**: the end of the last exit in each shot = the end of the shot; before the shot ends there must be no "text already gone, base bed / footage idling alone for >0.4s";
   for multi-footage shots check relationship → whether the layout is right (shot-design.md §2④′), and for parallel sentences check one style per shot and the three items appearing one at a time (layout.md §7.1)
9. **The layout rotates** (2026-09-21): looking at the key frames of three adjacent shots together, host form × position or footage container has changed at least once; no presentation card is used in 3 consecutive shots, and no card takes >1/3 of the film:
   if the reviewer sees "again the round badge in the bottom left + box in the middle + text on the right", record P1 (§4.5 item 9; compare against the SHOTBOOK G0 layout rhythm table)

## 6. Engineering iron rules (distilled from working code)

- anime.js v4 bridge (anime-remotion.ts): `engine.useDefaultMainLoop = false`; build the timeline in useLayoutEffect (autoplay:false) + every frame `tl.seek(((frame-lead)/fps)*1000)`: the seek must complete synchronously before Remotion captures the frame.
- three.js bridge (three-anime.ts): bare WebGLRenderer + `import 'animejs/adapters/three'`; render order seek → onCamera → render; remotion.config needs `setChromiumOpenGlRenderer('angle')`.
- **Zero Math.random**: all randomness goes through `rand(seed)` sin-hash / index modulo / double sine.
- **Use a finite large number for a "never happens" sentinel, not `Infinity`** (`const NEVER = 1e6`):
  once `until = Infinity` / `outAt ?? Infinity` enters an `interpolate` inputRange,
  Remotion throws `inputRange must contain only finite numbers` on the first frame: it is a hard error, not a silent degradation.
- **The camera curve's last key must land beyond the end of the film**: all CameraRig tracks use `Easing.inOut(Easing.sin)`,
  **so the end velocity is zero**. When the last key sits exactly on the end of the film, the final 0.8~0.9s slows to a dead stop and motion_check still reports stillness
  (measured). Push the last key past the film length (extrapolating its value accordingly), and the curve never settles inside the film:
  this is the same thing as the camera-move rule "the camera is never still / power2.out may not be used", it just happens on the **camera table**.
- **Newly written card components include `if (abs < at) return null` by default**: without it, the component hangs on screen in its p=0
  state from the start of the shot (measured to appear 4.5s earlier than its own anchor).
- **Fine textures are banned from the camera scaling layer** (finalized in practice on 2026-08-28): dot grids/fine grids with features ≤2px and spacing ≤24px
  placed in a layer that the camera scales continuously crawl at sub-pixel level, and the whole area reads as "the picture is shaking". Either enlarge the features
  (dot diameter ≥2.5px, spacing ≥32px), or move the texture to a static screen-space layer (something like CanvasBands).
- **A defocus (blur) exit only works on dark backgrounds**: on a light background, adding blur to the exit side overlaps with the white veil of the next shot's overlap,
  and the whole page reads as "going blurry" rather than "cooling down": the same reason "white flash fails on light backgrounds"; on light backgrounds exits use only ShotFade + a very light shrink back.
  Also: an in-shot closing camera move (pull out/re-center) must **come to rest** before the overlap begins; a pull-out midway state stacked with the white veil is guaranteed to look blurry.
- **Absolute seconds in scene code may only appear on named props** (`at=` / `demoteAt=` / `tl(...)`),
  not inside function arguments like `ease(abs, 106.9, ...)`: remapping/re-editing tools find anchors by syntactic position,
  and literals inside function arguments are the batch most easily missed during bulk rescheduling (in v4, 31 missed edits directly produced a P0).
- Initial `opacity:0` for anime target elements is written in the inline style (prevents flashing before the timeline is seeked).
- Lead compensation goes through one place: the ready-made `motion-systems/time.ts` (useAbs/useToLocal). Three time bases: absolute seconds (the SHOTBOOK source of truth) / shot-local (inside CameraRig/WorldRig) / Sequence-local (template parts such as Live/Defocus/particles, including lead): scene components always convert via time.ts, do not each compute their own (known pitfall: Counter's startSec must add lead/fps).
- Time uses **absolute seconds** as the analytical source of truth and is converted to frames only once at the Remotion boundary; do not round early. When a shot ≠ a sentence (multiple sentences aggregated), anchors are always written as absolute-second literals; tSay's sentence-level scene-local is used only in single-sentence shots.
