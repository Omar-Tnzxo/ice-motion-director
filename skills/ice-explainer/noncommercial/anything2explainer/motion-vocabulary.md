> Translated from Chinese into English from Vincentwei1021/anything2explainer (PolyForm Noncommercial 1.0.0). Noncommercial use only.

> Adapted from Vincentwei1021/anything2explainer (PolyForm-Noncommercial-1.0.0). Changes: em dash and en dash characters replaced with colons, commas or hyphens. Noncommercial use only; see LICENSE and README.md in this folder.

# Motion vocabulary (n = N − f0, where N is the frame number in the final video; everything is a pure function, randomness only via rnd)

## Entrances
| Name | Formula/component | Frames | Use |
|---|---|---|---|
| **SoftIn (default)** | `<SoftIn N f0>`: opacity easeOut(2.5), first frame ≈25%→1, rises 10px→0 | 8 | All text, labels, HUD word changes, small icons |
| GlitchIn (key word) | `<GlitchIn N f0>` 12-frame opacity template [.5,1,.5,0,.5,0,.5,1,.75,.5,.75,1] | 12 | **≤1 per shot**, only for the core term; the heavy rgbSplit/slices variant only for the opening, chapter cards, hero entrance and ending |
| Slide in from below | `top = yEnd + slideUp(n, Δ)`, Δ·(1−n/22)^2.5 | 22 | Cards, graphics; **Δ≤120** (Δ300 crosses the subtitle band), pair with a fadeIn over the first 6 frames |
| Slide in from the side | `left = xEnd − Δ·powOutRemain(n,18,2.5)`, Δ 260-320 | 18 | Alternative for entering from outside the safe area |
| Scale in | `scale = scaleIn(n)` (cubic-bezier(.1,.1,.35,1)) | 21 | Icons, balls, cards |
| Stagger | Element i starts at f0 + stagger(i, 2) | 2 per item | Lists, card arrays; **do not stagger with GlitchIn** (it looks like dropped frames) |
| Draw-on line/arrow | `<LineArrow p={clamp01(n/20)}>`, the arrow grows from its root, head follows the shaft | 16-28 | Connections, pointing |
| Draw-on box | SVG stroke-dasharray + dashoffset, or a clipPath rect wipe | 20-30 | Dashed boxes, check marks, paths |
| Typewriter | `text.slice(0, floor(n/2))`, 1 character every 2 frames | By character count | Questions, answers, prompt rules |
| Counter | Counter, value = kf(n,[[0,a],[20,b]]) rounded | 14-26 | Years, percentages, token counts |
| Line-by-line wipe | Each line clips width 0→100% over 2 frames | 2 per line | Text lines on document cards |

## Emphasis
| Name | Formula | Frames |
|---|---|---|
| Pulse | `scale = emphasisPulse(n, {peak: 1.11, up: 13, hold: 4, down: 13})` | 30 |
| Grey→purple color change | `mix(GREY, PURPLE, clamp01(n/11))` (border and fill change together) | 11 |
| Soft glow on | boxShadow GLOW_PURPLE_S with α 0→1 | 8 |
| White flash | Element filter brightness 1→1.6→1 | 6-10 |
| Highlight bar wipe | Semi-transparent purple bar scaleX 0→1 from the left | 12 |

## Light effects (who glows and how; rules in `composition-and-light.md`, components in `src/fx.tsx`)
| Name | Formula/component | Frames | Use |
|---|---|---|---|
| Hero steady glow | `<HeroGlow x y w h N>` two-layer soft purple glow + 30-frame breathing ±15%; or `LLMIcon glow` | Persistent | **Required on every shot's hero**; supporting elements do not get it |
| Purple light-bar sweep | `<LightSweep N rounds={[T0+4,T0+22,T0+40]}>` 3 bars per round, 2-frame stagger, 16 frames, α .6/.55/.55 with white core | 3×16 | **Only for entrance-type highlight moments, ≤2 in the whole video** (sweep whitelist): first entrance of the core concept + an optional callback at the end; not used for big-number / thesis / symbolic-object types |
| Stage line | `<StageLine N f0 flashAt>` widens to 720 over 14 frames → breathes → white flash on the beat frame, gone after 3 frames | 14+ | Foreshadowing line for where the hero lands; only appears with the sweep (entrance type only) |
| Ghost outline | `<GhostText opacity={ghostOpacity(N,f0,until)}>` white stroke at 10%, fading in and out | 12 fade-in | About 40 frames before the hero's big text appears; only appears with the sweep (entrance type only) |
| Halo ring | `<HaloRing p fillOp phase half>` white stroke draw-on over 20 frames + purple gradient over 12 frames + 3 dashed ripple rings, one phase every 2 frames | 20 | Under a symbolic object (three layers: back / body / front) |
| Purple hard shadow | Big text textShadow `6px 6px 0 PURPLE, 0 0 28px rgba(102,45,248,.45)` (`BigNumber` default) | Persistent | Audiowide / Orbitron big text, video title |
| Purple stroke | Noto 900 big text `WebkitTextStroke 2.5px PURPLE` + `paintOrder: stroke fill` + soft purple glow | Persistent | Conclusion big text |
| Orange glow | `GLOW_ORANGE` / orange textShadow | Persistent | Metric numbers, result items (−49%, ¥3.20) |
| Soft glow on | boxShadow `GLOW_PURPLE_S` α 0→1 | 8 | Shifting focus to a particular item |
| Light goes out first | Glow α→0 over the 6 frames before exit, then the whole element fades to zero | 6+8 | Exit of any element that carries light |
| White flash | filter brightness 1→1.6→1, or the flash of `StageLine` | 3-6 | Events: click, hit, gavel strike |
Within one frame: 1 hero light + ≤1 focus light; light comes only in three colors, purple / orange / red; white bloom is only for structural lines. The full choreography of three sweep rounds → stage line → outline → white flash + glitch is in `composition-and-light.md` §3 and `SET_PIECE` in `fx.tsx`.

## Exits (**must reach zero before a hard cut**)
| Name | Formula | Frames |
|---|---|---|
| Fade to zero | `opacity = 1 − (n/N)^1.5` (N=6-12), last frame 0 | 6-12 |
| Accelerating drop | `translateY(exitAccel(n, c))`, c 0.2-1.2, paired with fade to zero; limit to ≤10px if a subtitle band is next to it | 6-12 |
| Accelerating rise (overlay) | `dy = −(n/11)^2·440`, `opacity = 1 − (n/11)^1.6` | 12 |
| Slide out left | `translateX(−c·n²)` + fade to zero | 12-15 |
| Grey and sink | Turn grey over 11 frames + sink 12px over 12 frames ("memory" recedes into the background) | 12 |
Forbidden: using the 6.7%-per-frame exitFade alone before a hard cut (40-60% is still visible on the last frame, so it "pops"); ending a Sequence while visibility is >20%.

## Camera moves (camera work; components `CameraRig`/`camAt` in `fx.tsx`)
> Budget basis: the source video the style comes from has 6.6 whole-frame camera moves per minute, 16 frames on average, including push-ins / pull-outs / parallax / long scrolls; the first two videos had only 2.2-2.5 per minute and zero push-ins, and that is where most of the difference in feel came from (retrospective in `lessons.md` §style transfer). Below are the budget and the vocabulary.

**Budget**: ≥3 camera moves per chapter, ≤1 per shot; each move 30-45 frames easeInOut; no GlitchIn and no staggered entrances during a camera move (finish the entrance, hold ≥10 frames, then move); text legibility comes first, scale ≤1.33 (strokes scale with the group and look heavy above 1.4); the top HUD / process track / subtitles stay fixed in screen space, the camera moves only the content layer; **no camera move in the final beat**: the move's end frame ≤ exit start −30, and after a push-in hold 1-1.5 s before leaving (exception: a slow 1.0→1.05 push across the whole shot).

| Name | Formula / component | Frames | When to use |
|---|---|---|---|
| Push in on a point | `<CameraRig N keys={[{f:a,x:640,y:360,s:1},{f:a+33,x:px,y:py,s:1.33}]}>` (source: 1→1.329 / 33 frames bezier(.6,.05,.4,.95); 1→1.358 / 35 frames power 2.5) | 30-40 | Push toward the hero when it is still on its 2nd beat and will hold ≥60 more frames; fade in top/bottom vignettes over 18 frames during the push |
| Pull out / pull back | Same as above, reversed (source: 37-42 frames bezier(.55,.05,.4,1)) | 37-45 | Going from a detail back to the full view, closing a chapter, revealing a second subject that was cropped out |
| Hand-off move | The previous shot's hero `kf` scales down to 0.6 over 16 frames easeInOutPow(2.5) and moves to a corner, making room for the new hero; both shots share the same component with the same parameters | 16 | Required at every "no exit" hand-off; do not make it vanish in place and redraw |
| Whole-group pan (stage pan) | The whole group moves as a rigid body one screen to the left / 110px up (source: end of the flowchart section, conveyor belt rising) | 20-30 | One screen is finished and the next is beside it; a list longer than one screen |
| Full-page scroll | y offset easeInOutPow(2.5), can show a scrollbar | 43 | Long lists / long document cards |
| Parallax | 2-3 layers at different speeds (source: 6.4 / 9.6 / 12.8 px/frame, background layer darkened ×0.43), or the content layer moving 1.33× with the foreground | 26+ | Expressing "a lot" or "the world is big": screenshot walls, document walls, log streams |
| Accelerating exit | The whole scene pans down / left with steadily accelerating displacement, fully off screen on the last frame | 12-25 | Clearing the stage at chapter end, ending a metaphor |
| Whip | A hollow copy offset horizontally −63 / +38px for 1-3 frames then reset, or the whole group displaced for 3 frames + directional blur | 1-3 | The instant of a conflict / contrast switch, ≤2 per chapter |
| Screen-space vignette | Top/bottom linear-gradient black α .38-.42, fades in over 18 frames | 18 | In sync with a push-in; pulls attention to the center |
A camera move also counts as "one perceptible change per sentence": when a sentence has no new element, use one 30-frame push-in instead of forcing in an element.

## Beats
- Element appearance frame = start frame of the matching subtitle chunk (each | chunk in `script/timeline.md`); tolerance −6…+3.
- Every narration sentence has at least one perceptible visual change; only an element that is completely still for >3 s is a defect, **do not add breathing / floating / drifting to still objects just to have motion** (`composition-and-light.md` §7).
- **Shot ≠ sentence**: shots are split by visual unit; a short sentence (<3 s or only one subtitle chunk) merges into an adjacent shot as one beat, without its own entrance + exit; a single shot is ≥120 frames; if you can hand off (carry the same element into the next shot), do not clear the stage.
- Gaps between sentences: 10 frames within a paragraph (`tts_build.py` GAP, just enough for a breath), 30 frames at paragraph end (+`PARA_GAP`), 45 frames before a chapter: **pauses only at paragraph ends and page turns**; the final video being 5-8% longer than the pure voice track is the hold budget. Shot range = [first sentence from−8, next sentence from−9] (at chapter end / video end = last sentence to+2); exit in the last 8 frames, the next shot starts its entrance on its first frame.
- **Settle hold**: from the frame the final-beat element settles → exit start ≥30 frames (target 30-45, 1-1.5 s); no new elements and no camera moves during the hold. For paragraph-end sentences whose last chunk is <45 frames (listed by `tts_build.py` with ¶), pick one of three: move the final-beat element earlier onto the previous chunk / add `## gap 15-30` to the script / merge into an adjacent shot.
- The 45-frame gap before a chapter is for the chapter card: the previous chapter's last shot exitFades to zero → chapter card glitches in 3 frames later → accelerating rise in the last 12 frames → the new chapter's HUD fades in on the frame after the card ends.
- **A chapter boundary is not just a frame join**: the first shot of a chapter should carry over the hero / symbolic object from the previous chapter's last shot (same component, same parameters, can be shrunk and moved), not "clear the stage → chapter card → a brand-new picture"; the narration must also bridge from what came before to what comes next (`narration-storyboard.md` §1 "chapter boundaries need a setup, development, turn and resolution").

## Transitions (the storyboard must spell out both sides)
- How to write it: "A fades to zero over its last 8 frames + slight drop; B's first batch of elements SoftIn from its first frame". Do not write only "hard cut" (each side will read it as "I don't move, you only enter on the beat frame" → 6-8 frames of empty screen).
- Group boundary frames (where two build groups meet): each group implements against the storyboard on its own, and QC checks group boundary frames as a separate item; adjacent Sequences may overlap by 0-4 frames.
- Handing off the same element (e.g. a document card carried from one shot into the next): both shots share the same component + the same parameters, so the boundary frame is pixel-identical.
- Hand-off beats clearing the stage: a short sentence that finishes in one beat follows inside the previous shot (16-frame hand-off move to make room), do not clear the stage and redraw for it; save clearing for chapter openings, highlight moments and context switches.

## Glitch whitelist rules
- ≤1 GlitchIn per shot, only for "the word this shot is about"; in the storyboard the word glitch appears only in that one cell, everything else says "fade in".
- HUD word changes, process track, numbering, corner badges, small labels, numbers, icons: always SoftIn/fade in/scale.
- The final check scans the whole video with the 12-frame template; the hit count must equal the number of whitelist entries.
- **Sweep whitelist** works the same way: the three-round `LightSweep` (together with `StageLine` / `GhostText`) appears only in the ≤2 shots listed under the storyboard's "global constraints §sweep whitelist"; `selfcheck.py` counts by file, and the final check verifies by frame.
