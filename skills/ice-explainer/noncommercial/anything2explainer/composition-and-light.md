> Translated from Chinese into English from Vincentwei1021/anything2explainer (PolyForm Noncommercial 1.0.0). Noncommercial use only.

> Adapted from Vincentwei1021/anything2explainer (PolyForm-Noncommercial-1.0.0). Changes: em dash and en dash characters replaced with colons, commas or hyphens. Noncommercial use only; see LICENSE and README.md in this folder.

# Composition and light (visually driven rules)

> This file answers "how big to draw, who glows, and how to choreograph set pieces". It was added on 2026-09-08 after a frame-by-frame comparison of "eCPM and ad auctions" (made with the skill) and the sample film "RAG and knowledge bases": the two films have almost the same number of motion events, rhythm and total soft-glow area; the whole gap lies in the four points below. Build groups must read it after `style-guide.md`; QC uses the criteria in §6.

| Metric (final film frame by frame, content area) | Ad auctions | RAG sample film |
|---|---|---|
| Mean change per frame / motion events per minute | 0.47 / 72 | 0.56 / 76 |
| Median height of the largest object | 172px | 219px |
| Share of time the largest object is <110px for ≥1.5s | 29% | 12% |
| Light-effect words in source halo / sweep / ghost | 0 / 0 / 0 | 14 / 12 / 5 |
| skew / perspective / rotate in source | 1 / 0 / 4 | 7 / 1 / 15 |

## 1. Subject hierarchy: one hero per shot
- **There must be a hero**: every shot has one subject occupying ≥1/3 of the main content area's height: a graphic ≥170px tall, or large text / a big number ≥96px with a full line width ≥300px (Orbitron / Audiowide / Noto 900, three or more characters; two or three characters at 96px cannot carry the frame, go up to 110-150px or pair it with a graphic). The hero enters on the 1st or 2nd beat, and all later elements are arranged around it.
- **Three size tiers**: hero ≥170 / supporting 60-110 / labels and captions 22-30. ≤4 supporting elements, ≤6 labels. No fourth size outside these three tiers.
- **Size cheat sheet**: phone mock ≥300×520 with the first item on its screen readable; human figure ≥96; computer case / database / document card ≥160 tall; book / exam paper ≥240 wide; main formula term ≥48px, result term ≥72px; year / big number 96-150px; chart card ≥440×300.
- **Inherently small subjects need a hero**: timelines, formulas, tables and processes are not big enough on their own and must be paired with a hero: a big number ("0.1 s" at 96px rather than 34px), a glowing current item (current row enlarged 1.15 + purple light), a close-up under a magnifying glass. One line + a few 34px capsules holding 100 frames is a defect.
- **Show "many" with a matrix, not debris**: convey quantity with arrays or grids of ≥6px square dots, neatly arranged, lit / unlit on the beats; do not scatter small icons in the background. **The only background is the backdrop** (star points or dot-field wave); any "atmospheric small element" dilutes the hero.
- **Empty-stage criterion**: largest object in the content area <110px tall for >45 frames → medium defect; <80px for >45 frames → high.

## 2. Light follows the hero
- **The hero always carries light**: a graphic hero uses `GLOW_PURPLE` (two-layer purple soft glow; wrapping it in `HeroGlow` is enough) or a `HaloRing` underneath; large text uses `TEXT_GLOW` + a hard purple drop shadow `6px 6px 0 PURPLE` (same as wide-font text / the film title); orange metric numbers use `GLOW_ORANGE`. A white line-art graphic with only `BLOOM_SOFT` is not enough.
- **Supporting elements do not glow**: capsules, process tracks, labels, table rows and captions have no glow by default. Only the one "current focus" may have `GLOW_PURPLE_S`, ≤1 per frame; when the focus moves, the previous glow goes out within 8 frames.
- **Three levels of light**: white bloom (persistent on structural lines) < purple soft glow (hero always on + current focus) < white flash (events, 3-6 frames). Only these three are used in the whole film, and light colors are only purple / orange / red.
- **Light must move**: the hero's light breathes on a 30-frame cycle ±15%; when a focus activates, α goes 0→1 over 8 frames; on exit the light goes out first (6 frames), then everything fades out; do not hard-cut with full light.
- **A hard drop shadow is standard for "heavy" text**: Audiowide/Orbitron large text always gets `6px 6px 0 PURPLE` (or PURPLE_DEEP) + `0 0 28px rgba(102,45,248,.45)`; Noto 900 large text uses a 1-2.5px purple stroke `paintOrder: stroke fill` + purple soft glow.

## 3. Set pieces
At most 1 per chapter: the chapter's thesis sentence, the hero's entrance, or the closing payoff, pick one of three. Write it into "Global constraints §Set piece list" at the storyboard stage with its type marked; build groups choreograph it by that type and must not fob it off with the ordinary shot's "capsule + icon + one line of text".

**The light sweep is the most expensive move in the film and is reserved for the most important titles and concepts** (user ruling, 2026-09-17): the entrance-type opening with three passes of purple light sweeps + stage light lines + ghost outlines, **≤2 in the whole film**: the film's core concept must get 1 at its first appearance, and the optional 2nd can go to a callback at the end or a second hero. The storyboard's "Global constraints" lists a separate **light-sweep whitelist** (shot numbers); shots not on the list never use `LightSweep` / `StageLine` / `GhostText`; thesis, big-number and symbol-type set pieces use their own variant choreography: indigo-purple large text `GlitchIn`, `BigNumber` counting and `HaloRing` are already enough. Bad example: the fifth film had 8 three-pass sweeps across 47 shots (including big-number and thesis types), and the user said of the final film "too frequent"; the sample film had only 1 across 44 shots (SC08, RAG's entrance). `selfcheck.py` counts them statically; the final check verifies.

**Standard choreography (entrance type, ≥90 frames; relative frames in `fx.tsx`'s `SET_PIECE`; only for shots on the light-sweep whitelist)**
| Relative frame | Action | Component |
|---|---|---|
| T0 | Clear the stage: the previous shot has already gone to zero, only the backdrop remains |, |
| T0+4 / +22 / +40 | Three passes of purple light bars sweeping across (3 bars per pass, 2-frame stagger, 16 frames, α .6/.55/.55 with white core) | `LightBar` |
| T0+18 | Central stage light line widens to 720, then breathes | `StageLine` |
| T0+37 | White stroke outline of the hero text faintly appears at 10% (foreshadowing) | `GhostText` |
| T1 (beat frame) | Light line flashes white for 3 frames then disappears; hero `GlitchIn` (rgbSplit 8 / slices 20 allowed) | `GlitchIn` |
| T1+12 | `emphasisPulse` 1.11 |, |
| T1+16 | Chinese subtitle line slides in from below Δ80 / 22 frames | `slideUp` |
| T1+24 | Word breakdown / labels `SoftIn` with 2-frame stagger | `SoftIn` |

**Variants (no sweeps / stage light lines / ghost outlines; a clear stage or hand-off + white flash is enough to open)**
- Thesis type: the chapter's thesis sentence as two lines of large text Audiowide / Noto 900 96 + hard purple shadow, first line `GlitchIn`, second line SoftIn, a static white line between them; paired with one 33-frame push-in.
- Big-number type: `BigNumber` counts into place over 20 frames + small unit text + one comparison object (an icon or another number) + orange question mark / conclusion `GlitchIn`. Sample film SC39 "1,000,000 tokens".
- Symbol type: subject `slideUp` Δ≤170 + `HaloRing` underneath drawn on over 20 frames (outer and inner rings with white strokes, purple gradient fill, 3 dashed ripple rings with one phase every 2 frames) + conclusion large text Noto 900 60px with purple stroke `GlitchIn`. Sample film SC44 "knowledge base = moat".
- Year / source type: year `BigNumber` 96px rolling into place + institution capsule + a paper card / results-page card ≥240 wide beside it; the year may not stand alone on an empty screen for more than 30 frames.

## 4. Depth and hand-off
- Shots about space, hierarchy or indexing use tilted planes: `skewX(-20deg) scaleY(.5)` stacked 2-3 layers, 90px between layers, with paths drawn on between layers; filtering uses the `Trap` funnel; rotation only for gears, dials and turntables. A film that is flat throughout is a defect.
- Hand-off shift: the previous shot's hero shrinks and moves aside to make room for the new hero (`kf` 16 frames `easeInOutPow(2.5)`, shrinking to 0.6 at the same time), rather than disappearing and being redrawn small. The two hand-off shots share the same component with the same parameters.
- Camera moves: ≥3 per chapter, ≤1 per shot, using `CameraRig`; fixed-point push-in 1→1.33 / 33 frames centered on the hero, hand-off shift 16 frames, whole-group pans and parallax to show "many"; during camera moves the HUD / subtitles do not move, and moves do not overlap glitches or staggered entrances. Budget and frame counts in `motion-vocabulary.md` §Camera movement.

## 5. Build-group self-check (written into the BUILD_NOTES shot table, one row per shot)
| Shot | Hero | Hero height px | Hero's light | Set piece | Supporting count / label count |
Rows with a hero height <170 or "no light" must state the reason; the empty-stage criterion must never be hit.

## 6. QC criteria (paired with `scripts/frame_metrics.py`)
The script's "subject scale" = height of the largest connected object; wide-but-short objects (a line of large text, a wide card) are converted as min(width, 4×height)/2.5; the characters of one line of text (character spacing ≤40px) are merged into one object; star points do not count (when the backdrop is the dot-field wave `config.bg='dots'`, the script removes the dots using the same grid coordinates and raises the soft-glow brightness floor from 10 to 22: the dot-field base color #0b0c11 is slightly blue, and without raising the floor the whole screen counts as soft glow); sweep / stage light line / halo phases (content-area soft glow ≥10000px²) do not count as an empty stage, and these frames are excluded from the subject median.
- Per-shot median subject scale <170 → low; <110 with no large-area light activity for >45 frames → medium; <80 for >45 frames → high.
- No soft-glow spot of ≥3000px² in the hero area of a set-piece shot → medium; soft glow <800px² in the hero area of an ordinary shot → low (hero without light).
- ≥8 separate purple patches in one frame (purple fragment index) → low, a hint that purple is sprinkled onto supporting elements.
- ≥10 scattered small shapes <60px in the background (excluding star points / backdrop dot field) → medium (debris). **Regular point clouds / square-dot arrays (vector spaces, exposure walls) also trigger this rule and are allowed by design: QC judges by looking at the frame: a regular layout lit on the beats is a matrix; randomly scattered small icons are debris.**


## 7. Verb-driven continuous action + settle hold ("still right after entering" and "cut right after settling" are both defects)
- The two symptoms are two sides of the same coin. Fourth film: elements came in on the beats and then sat still waiting for the next beat, with only the soft glow breathing (still right after entering). The fifth film overcorrected per "no stillness >30 frames": 47 shots with 34 push-ins and 48 "continuous" sentences; last-beat elements had just settled when the final 8-frame exit began, and the user's exact words were "every animation has only just settled when it immediately cuts to the next shot, with almost no pause" (cut right after settling). The quantification of the "still right after entering" side is in `lessons.md`, fourth film.
- Rule one (continuity): **for the verb spoken in each subtitle block, the picture must have an action that lasts until the next beat** (data flow / pulse dots running along arrows / typing line by line / lighting cell by cell / growth / rotation / gates opening and closing / a queue compressing); after entering, elements may not be completely still for **>3 s** (90 frames). **Do not add floating, drifting or breathing to static objects just to hit the metric**: the action must be the verb's own action; a shot where no verb action can be found should rather stay still; stillness ≤3 s is not a defect. A shot without any other camera move may add one slow 1.0→1.05 push-in spanning the shot (it counts as that shot's one camera move; after the slow push-in content must stay within x 89-1191 / y 122-607).
- Rule two (hold): **after each shot's last-beat elements settle there must be a 30-45 frame (1-1.5 s) stable period before the exit** (a shot = one paragraph of narration, so the hold falls at the end of the paragraph; no hold when beats change between clauses within a paragraph). Settle = the frame on which the last entrance / camera move of the last beat ends; during the stable period no new elements, no camera moves, no HUD changes; verb actions already running may continue. Exit start ≥ settle frame + 30. **Camera moves stay out of the last beat**: the end frame of any push-in / shift ≤ exit start − 30 (except a slow 1.0→1.05 push-in spanning the shot).
- Where the time comes from (user ruling: the final film may be 5-8% longer than the pure voice-over in exchange for holds): **pauses go only at paragraph ends, not after every sentence**: the narration is split into paragraphs by blank lines (one paragraph = one shot of 2-4 sentences); `tts_build.py` uses `GAP` 10 frames within a paragraph and adds `PARA_GAP` 20 frames at the paragraph end (30 in total ≈ 1 s); when the last block of a paragraph's final sentence is short (<45 frames, listed with ¶ by `tts_build.py`), add `## gap 15-30` at the copywriting stage, or pull the last-beat elements forward onto the previous block at the storyboard stage; short sentences (<3 s or a single block) do not become their own shot but are merged into an adjacent shot as a beat (shot ≠ sentence, see `motion-vocabulary.md` §Beats). Adding pauses between clauses makes the whole film feel draggy (user feedback).
- Boundaries unchanged: one hero, one flicker, only the backdrop as background, no debris.
- Quantification (`scripts/motion_check.py`): in the content area (excluding HUD / subtitles / progress bar), sampled at 320×180, a frame-to-frame mean grey change <0.35 counts as a still frame. Criteria: **per-shot longest stillness ≤3.0 s** (>3 s → medium; full-resolution changed pixels <800 truly still → give a verb action, 800-2500 small-area action → increase the amplitude rather than adding elements); **last-beat stable period ≥30 frames** (the number of consecutive frames in the last stretch of "no large-area change" before the exit starts; <30 → medium: delay the exit or pull the last-beat elements forward, not add action); the stillness ratio is reported but not judged. **The re-measurement on the final film's fin_frames is the criterion**: group-level low-resolution renders are too lenient.
- Storyboard format: at the end of each shot's "Motion" column write two sentences, "Continuous: ..." and "Hold: last beat X settles at f → exit at f, N frames"; add §9 to the global constraints; build groups add two columns, "motion_check longest stillness / last-beat stable period", to the BUILD_NOTES shot table.
