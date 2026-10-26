> Translated from Chinese into English from Vincentwei1021/video-talkcraft (PolyForm Noncommercial 1.0.0). Noncommercial use only.

> Adapted from Vincentwei1021/video-talkcraft (PolyForm-Noncommercial-1.0.0). Changes: em dash and en dash characters replaced with colons, commas or hyphens. Noncommercial use only; see LICENSE and README.md in this folder.

# Demo and Recipe Card Authoring Spec

Library convention (finalized 2026-08-28): every motion effect = one recipe card (markdown) + one self-contained Remotion tsx source file
+ one runnable HTML demo. **The tsx is the canonical source the skill references** (lowest reuse cost: copy the single file into a Remotion project and it works),
the HTML demo is a build-free preview (opens directly in a browser, plays live in the gallery). The card explains when to use it and how to tune the parameters.

## Directory convention

```
references/cards/<slug>.md     # recipe card (frontmatter `code:` points to the tsx)
template/cards/<slug>.tsx      # self-contained Remotion source (the skill's preferred reference, see the tsx hard requirements below)
demos/<slug>/index.html        # self-contained HTML demo (may reference shared resources under ../_lib/)
demos/_lib/                    # gsap.min.js / lottie.min.js / demo-shell.css / demo-shell.js
                               # + sfx.js (WebAudio synthesized sound effect engine) / sfx-map.js (per-card cue table)
```

**Field-proven cards**: motion effects distilled from delivered projects; their production master lives in `template/motion-systems/` or
`template/components/` (the "Reuse guide" states the component file and key props); `template/cards/<slug>.tsx`
is still required (a standalone version with the same visuals as the demo).

## tsx source hard requirements (finalized 2026-08-28)

1. **Single self-contained file**: import only `react` and `remotion`; do not import other files from template/, and do not pull in external resources
   (icons/placeholders are always inline SVG/CSS). Demo-context footage (digital human, real hands) is injected via optional props
   (`hostSrc?/handSrc?: string`); when not passed, a grayscale silhouette/vector fallback is used.
2. **Export contract**: `export const meta = { width, height, fps: 30, durationInFrames }` +
   a default-exported component; the CONFIG constant sits at the top (same name and same comments as the demo's CONFIG).
3. **Pure-function rendering**: all state is derived from `useCurrentFrame()`; `Math.random`/`Date.now`/self-running animations are forbidden;
   for randomness use remotion's `random(seed)` (canvas cards may use `useEffect` keyed on the frame number to fully redraw every frame).
4. **Frame-by-frame visual parity with the HTML demo**: the demo is the visual source of truth. **After changing demo timing/visuals you must update the tsx too**
   (the same discipline as the sfx cue table).

## Demo hard requirements

1. **Single file**: all styles and logic live inside `index.html`; only shared files under `../_lib/` may be referenced. External CDNs are forbidden (the demo must open offline).
2. **Unified shell**: include `../_lib/demo-shell.css` and `../_lib/demo-shell.js`, draw content inside `<div id="stage">`, on the unified 960×540 standard stage.
   **Motion is independent of aspect ratio**: the point of the card library is reproducing the motion effect: the same effect should apply to landscape or portrait,
   and aspect ratio is a property of the application project's container, not of the effect. Demos do not distinguish landscape from portrait; aspect-ratio-related placement rules
   (subtitle position, safe areas) are handled on the application side by design-language.md §5. The demo itself has no subtitles and is not constrained by the subtitle band; but if the card's "Placement self-check" promises "stays out of the subtitle band / ≥48 from the frame edge", the demo geometry must actually satisfy it (review precedent: the first versions of crash-zoom / scanline had card bottoms at 495 / 464, contradicting the self-check): whatever cannot be promised is written as a final-video-side remedy (move the subtitles / raise the subject), and no promise inconsistent with the demo is left in place.
3. **Register a run function**: `DemoShell.register(({speed}) => { ... })`: every call must rebuild the animation from scratch (replay semantics). GSAP demos use `tl.timeScale(speed)` to support slow motion.
4. **Talking-head context, but no narration subtitles (finalized 2026-08-23)**: do not perform the effect in isolation: put a talking-head scene placeholder on the stage
   (`.host-placeholder` presenter / fake screenshot cards, etc.), so it is obvious at a glance "what this effect acts on".
   But the demo **has no narration/dialogue subtitles**: subtitles are not the effect itself and would pull the viewer's eye away from the effect;
   the demo focuses on the effect itself. Exception: when the effect itself is the subtitle (styled-caption cards), those words are the effect's object and stay.
   Placeholder material is always drawn with CSS/SVG; no external images.
5. **Technology choice**: prefer GSAP (`../_lib/gsap.min.js`) or plain CSS/SVG/Canvas. The effect's code must be **liftable**: the core animation logic is gathered into one block, parameters are top-level constants (`const CONFIG = {...}`), so someone can copy that block and use it.
6. **Realistic copy**: subtitles/titles use Chinese that reads like real talking-head lines (or English for English cards), not "Lorem ipsum" or "sample text".
7. **Self-verification**: after writing, you must run `node scripts/verify-demo.mjs <slug>` until ok=true with no warnings, then use Read to view the two screenshots `tools/.verify/<slug>-t0/t1.png`, and confirm visually that they match the card description (not a black screen / misalignment / overlapping text).
   **Instantaneous criteria need their own frame capture (added 2026-08-25)**: t0/t1 are two moments hit at random, and they cannot catch criteria that **hold for only one frame**, such as "is the cursor over the button on the click frame"
   (x-follow-card's "the mouse did not land on Follow" slipped through exactly this way). Wherever a card says
   "happens on the same frame", "the moment of the click", "the cursor lands on X", use `node scripts/shot-at.mjs <slug> <t>` to freeze the clock at that moment and check the screenshot;
   when the end state looks wrong, recheck with `--play` (seek does not replay intermediate frames, and when several tweens write to the same object the order is not guaranteed;
   `--play` is what the viewer actually sees).
   **The person must not be cut off or touch the edge (user-finalized 2026-08-25)**: the digital human must not have any part cut off by the left or right frame edge, nor touch the left or right border (breathing margin ≥10px). **The fix is to move the whole person toward the center of the frame** (change container positioning, give enough width), **not to shrink the person**: the person's size is part of the visual language, and must not be reduced just to fit a container. After moving in, **the person must not cover other content either** (titles, cards, charts and other parts of the effect itself); when neither side fits, adjust the layout (content yields, narrow the content column), do not sacrifice the person. The verify tool automatically checks for cut-off/edge contact and issues a warning. **Deliberate close-ups/crops** (picture-in-picture zoom, chip crop windows, etc.) add `data-crop-ok` on the cropping container as an exemption, and the card's "Motion scope" states that this is framing semantics. Leave margins when positioning the person container (.host-wrap/.host-col); do not use negative right/left to push the person out of frame.
8. **Sound effect cues (since 2026-08-24)**: every new card registers a cue table in `demos/_lib/sfx-map.js`:
   `"<slug>": [{ t, name, vol?, dur?, rate? }, ...]`, where t is demo seconds at speed=1 and name is one of
   the 13 timbres in `_lib/sfx.js` (whoosh/swipe/pop/click/tick/slam/riser/ding/scratch/typekey/paper/ping/lowpad).
   10 of these timbres have **real samples** (since 2026-08-25, from video-shotcraft's Mixkit library,
   base64-embedded in `_lib/sfx-samples.js`; source and regeneration in `_lib/sfx/ATTRIBUTION.md`);
   the engine prefers samples with synthesis as fallback; riser/ping/lowpad are still pure synthesis. The cue syntax is unchanged.
   Samples are decoded asynchronously; the engine starts decoding as soon as `sfx-samples.js` is in place, and for `pk:` samples that are "declared but
   not yet decoded" it holds and retries (up to 1s) instead of dropping them: otherwise **all-sample cards** (with not a single synthesized
   sound) would be completely silent; fixed 2026-08-26.
   Each card has 2~6 cues (except rapid tick/typekey runs), hitting only the effect's crucial beats; micro-motion/drift gets no sound.
   Zero changes to the demo page: the shell dispatches on the GSAP clock, so pause/slow motion/replay/seek sync automatically;
   sound only plays on the main screen (`?embed=1&controls=1`) and when opened standalone; gallery thumbnails are muted.
   **After changing demo timing you must update the cue t values too**.

   (Historical note: cue tables were tuned card by card and written back by the library author's local sound-design desk tool, which is not distributed with the library; the cue's two optional fields
   `clip`: play only the first N seconds with a 40ms fade-out at the end, mandatory when a long sample accompanies a short effect: and `note`: a remark on which action it accompanies,
   ignored by the engine: come from that tool.)

   **Library-wide sound pass (user-finalized 2026-08-26, 80 cards at the time, 78 now)**: after re-scoring every card, the total cue count went
   439 → 269, the volume ceiling was pressed down to 0.65, and 90% of hits now use real samples. The settled taste:
   - **Few and precise**: never stack two hits at the same moment (cases like the old "slam+whoosh on the same frame" were all cut to one hit);
     name bars/pure transitions keep only 1 very light hit, or are simply silent (`caret-wipe-transition`,
     `orbit-drift` have intentionally empty cue tables: closed-loop cards with sound would repeat it every loop).
   - **No closing chimes, no heavy slams**: the `ding`/`slam` timbres have been cleared from the whole library (the timbres still exist,
     new cards should not use them); transitions keep only the leading `riser` build-up, the landing gets no sound.
   - **Semantic matching**: typing = **one** `pk:text-keyboard` hit with clip covering the whole passage (not a per-key ladder);
     streaming output/progress = `pk:data-data-load-os`; drawing a line = `pk:text-marker-pen-line`;
     card sliding = `pk:paper-paper-slide`; pop-up = `pk:ui-pop`; clicking/lighting items one by one =
     `pk:ui-ui-click-tone`; a count settling/snapping into place = `pk:mech-lock-quick`; impact =
     `pk:impact-hit-fast-exciting`; camera-move air sound = `pk:transition-air-whoosh-powerful`
     pressed down to vol ≤0.3 as a noise bed. The mapping table is in `_lib/sfx/ATTRIBUTION.md`.
   - Rapid ladders (counting/per-character/per-line) keep their original rising vol/rate, only the timbre changes.

   **Production bridge (since 2026-08-27)**: cue tables do not only serve demos: **when a production picks a card, its sound effects come along too**
   (SKILL.md ④⑤). `node scripts/sfx_dump.mjs` decodes the embedded samples into `remotion/public/sfx/*.mp3`;
   SHOTBOOK copies the cues (card-relative seconds → absolute seconds), and the scene places them one by one with `<Audio>`.

## Recipe card format (frontmatter + five sections)

```markdown
---
name: <slug>
title: <Chinese card name, 2~8 characters>
one-liner: <what happens visually, said in one sentence, including the key sense of timing>
use-when: <which moment in a talking-head video; which tone>
duration: <typical total duration and key beats>
energy: low | medium | high
category: <category name>
priority: P0 | P1 | P2
reference: <which hosts/channels use it, comma-separated>
---

## Input types
| Talking-head video | B-roll video | Image |
|---|---|---|
| yes/no + reason | yes/no + reason | yes/no + reason |

## Common scenarios
1. <the scenario the demo performs>  2.~4. <three other high-frequency scenarios>

## Intent
Why a talking-head video needs this effect (what narrative problem it solves), plus 2~3 crucial points for doing it right.

## Motion core
Elements + motion + timing (frames/milliseconds) + easing + layering, so that an engineer can implement it directly after reading.

## Parameter table
| Parameter | Typical value | Tuning feel | (for each parameter, write "how it reads when larger/smaller")

## Known pitfalls
The easiest ways to make it look fake/cheesy, each with one sentence on "why it looks fake at a glance".

## Reuse guide
- HTML/GSAP: demos/<slug>/index.html, which constants to change to swap copy/swap color
- Remotion porting notes: frame-driven style, interpolate correspondences
- Editing software equivalents: what it is called in Jianying/AE/CapCut, which built-in feature can substitute
```

The "Input types" and "Common scenarios" sections (mandatory for new cards since 2026-09-05): the former's three columns each state whether this card takes a talking-head person / B-roll video / image and why (which layer it goes on),
and in the latter's four items, the first is the scenario the demo performs. Input types for older cards are in `references/taxonomy.md` "Input type index". When picking cards, these two sections go into SHOTBOOK together with "Placement self-check" (SKILL.md ④).

## Visual baseline (neutralization contract, finalized 2026-08-23)

The demo's mission is **to make the effect reusable without loss**: when another agent reuses a card, what it takes should be only
"the motion this card brings", migratable in the simplest way to any style and any size. The other half of neutralization is on the application side:
when a final video starts, first set the style tier from the talking-head script's domain; after the card is copied into the project, **skin it according to the style tier** (design-language §0.4): the demo's skin is not the final video's skin. Therefore:

1. **White stage by default**: `#stage` is uniformly white (demo-shell default #ffffff). Exceptions are allowed only when the effect semantically needs
   a non-white background to work (e.g. an overexposure transition needs dark content for contrast, hand-drawing on paper needs a paper color);
   the exception must be justified in the card's "Motion scope" section.
2. **Zero decorative style**: no style elements unrelated to the effect may appear in the demo: no decorative gradients/grids/
   noise/vignettes/brand palettes. Text uses black #1d1d1f and secondary gray #8a8a8a; colors **semantically required** by the effect
   (highlighter yellow, warning red, highlight colors) stay, but only on the effect itself.

   **Product-interface card exception (user-finalized 2026-08-25)**: when a card performs **the interface of a real product**
   (x-follow-card / chat-gpt / claude-code / glass-code-walk and the like), **the product's style must be fully reproduced**, without neutralization:
   colors, corner radii, spacing, font character, brand colors and marks are all copied from the source (the remocn registry's `THEMES` + `accentColor`),
   with the goal of "a screenshot placed next to the real product is indistinguishable". Reason: in these cards **the product skin is the content itself**: viewers must recognize at a glance
   "this is someone on X", "this is ChatGPT and not some other chat product", "I really had this tool do this";
   after grayscaling, the card becomes "some social card / some chat box / some terminal", the reference is gone, and so is the card's reason to exist
   (once grayscaled, chat-gpt degrades into "some chat box", and none of its five interface grammar features can be read).
   **What is editable is the content** (copy, names, commands, answers); the appearance is untouched.
   These cards must state in "Motion scope · Background requirement" "product skin = the content itself, user-finalized 2026-08-25: fully reproduce the product style",
   and in "Not part of this card" point out that **the skin belongs to the content, not to a swappable style** (the opposite of other cards).
   Note: this does not mean "brand assets may be pulled in": icons are still always drawn by hand as inline SVG, and the ban on external resources is unchanged.
3. **Minimal placeholders**: talking-head context placeholders (screenshots/charts, etc.) are expressed with the bare minimum of grayscale wireframes,
   just enough to show "what the effect acts on", with no realistic texture.
   **Presenter exception (finalized 2026-08-23)**: `.host-placeholder` (or any element with `data-dh-host`)
   gets a digital-human alpha video automatically injected by demo-shell (`_lib/dh-host.webm`, .mov on Safari),
   falling back automatically to a grayscale silhouette if loading fails. The digital human is **demo-context footage** and is not part of any card's effect itself:
   the "Not part of this card" item of the card's "Motion scope" section covers it by default. Footage source and regeneration method are in
   references/host-footage.md.
4. Easing defaults to `power2.out` / `power3.out` as a starting point; use `back.out`/`elastic` only for exaggerated bounce.
5. Chinese font stack: `"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`.
6. No line boil / stop-motion jitter (user-finalized, design-language.md §4).

## "Motion scope" section (mandatory for every card)

Beyond the five sections, a recipe card **must** add a `## Motion scope` section that clearly marks the boundary of "the motion this card brings":
the reuser uses it to know what to take, what to drop and what to change:

```markdown
## Motion scope
- Part of this card: <list of the effect itself: motion, timing, easing, layering relationships, item by item>
- Not part of this card: <parts of the demo that are only demo context: placeholders, sample copy, specific colors, fonts and font sizes>
- Migration interface: <which parameters to change when swapping style/size: color tokens, size baseline, duration scaling rules>
- Background requirement: <white is fine / needs an XX background (reason)>
```

## Card "Placement self-check" section (user-finalized 2026-09-05)

Cards with a target anchor (all emphasis-annotation cards, pip-zoom-box, viewfinder / circle annotation / underline / arrow / magnifier) must have a
"Placement self-check" section at the end of `references/cards/<slug>.md`: annotation geometry is derived back from the target's measured bounding box, padding is equidistant at 16~24, and a deviation >8px in the hero-frame check means rework. Cards restricted in what they apply to (e.g. gooey-morph is only for images)
and cards with color discipline (e.g. chapter-title-card changes color per chapter) likewise write these as standalone subsections. **These subsections are required reading when the skill picks cards** (SKILL.md ④ "Required card lessons when picking cards"):
once picked, copy them into that shot's self-check column in SHOTBOOK, and check them one by one after implementation: something written in the card but not carried into SHOTBOOK is as good as unwritten.
