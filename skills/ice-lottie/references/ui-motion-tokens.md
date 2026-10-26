> Adapted from Omar-Tnzxo/motion-interaction-studio (founder's skill, SKILL.md, references/personality-by-industry.md, tools/motion-tokens.mjs). Changes: only the parts that apply to Lottie, animated SVG and UI motion assets; restructured into tables; added the token to Lottie mapping; merged the curve libraries of diffusionstudio/lottie and nolangz/pixel2motion (both MIT) into one table.

# UI Motion Tokens and the Reusable Curve Library

Use when an asset will live inside a product UI (app, site, desktop), when the
user asks for motion tokens, or when a Lottie or SVG asset must feel like the
product it ships in. One token source drives the product's live motion and
every authored asset, so a 260 ms spring in code and a Lottie confirmation feel
like one product.

## Contents

- Purpose gate
- Timing table (live product UI)
- Easing and spring rules
- Choreography and spatial rules
- Reduced motion, performance, never on refresh
- Direction and culture (RTL)
- Industry preset ids (18 plus neutral)
- Reusable curve library
- Spring model
- Generating tokens and mapping them into Lottie

## Purpose gate

Every motion answers one of four questions, or it is removed:

| Purpose | Question it answers | Typical assets |
|---|---|---|
| Feedback | Did my input register, is it working, did it succeed or fail? | press, loader, success, error, hold progress |
| Orientation | Where am I, where did that come from, where did it go? | sheet from its edge, popover from its trigger, toast from its edge |
| Continuity | What changed? | state morph, number change, list insert or remove |
| Delight | A small, rare, earned brand moment | first success, streak, milestone; never on routine actions, never blocking |

## Timing table (live product UI)

| Kind | Range | Notes |
|---|---|---|
| Press, toggle, color, hover | 70 to 150 ms | must feel instant; never delay the action |
| Small state change (label swap, icon, checkbox) | 150 to 250 ms | |
| Medium (popover, tab indicator, card, toast) | 200 to 350 ms | |
| Large (dialog, sheet, page) | 250 to 450 ms | mobile full screen up to 500 ms |
| Brand moments, number rolls | 500 to 1000 ms | rare, skippable, never in a loop users wait on |
| Exits | 50 to 70 % of the entrance | the user already decided |

Authored Lottie assets use the frame ranges in the recipes; see the scoped
timing table in SKILL.md for how the two fit together.

## Easing and spring rules

- Entrances decelerate (ease out, arrive and settle); exits accelerate (ease
  in); on-screen moves use ease in out or a spring; progress that represents
  time is linear. Avoid the default `ease` and `linear` for movement.
- Springs for anything interruptible or gesture driven: they keep velocity.
- Bounce 0 to 0.15 for professional products; 0.2 to 0.35 only for playful
  categories; never elastic overshoot on text or data.
- Premium comes from timing, restraint and polish, not effects. Brand bans
  (glow, glass, gradients, neon, a banned color) beat trends: a spotlight that
  reads as a glow is a glow.

## Choreography and spatial rules

- One focal motion at a time; secondary elements follow with a stagger of 25 to
  80 ms and a total cap (usually 300 to 600 ms). Per-item delay that respects
  the cap: `min(step, cap / max(1, count - 1))`.
- Parents before children, primary before secondary, top start before bottom
  end in the reading direction. Related things move together; unrelated things
  do not move.
- Things come from where they live and return there. Forward navigation moves
  toward the inline end, back toward the inline start (mirrored in RTL).
  Travel is small (4 to 24 px); nothing flies across the screen.
- Animations never block input; a new state interrupts the old one from its
  current value. Loading states start after about 300 ms only.

## Reduced motion, performance, never on refresh

- Reduced motion is designed, not disabled: remove travel, scale, parallax,
  auto-playing loops, shakes and staggers; keep opacity, color, progress fills,
  state labels and focus changes. For a Lottie asset, ship a static final-frame
  fallback (or the settled frame number) the developer shows under the setting.
- Animate transform and opacity (platform equivalents elsewhere). Never write
  CSS custom properties every frame on the root or across many elements. Loops
  stop when idle, hidden or off screen. Frame budget 16.7 ms at 60 Hz, 8.3 ms at
  120 Hz. Heavy media (Lottie, Rive, video previews) loads lazily.
- Polling, websocket updates and re-renders never replay entrances.
- No flashing above 3 per second.

## Direction and culture (RTL)

- Motion direction in RTL scripts (Arabic, Hebrew, Persian, Urdu), the
  never-mirror list, Arabic animation units, kashida and digits: the
  `ice-arabic` skill, `references/letterforms-in-motion.md` sections 1 and 6,
  and its SKILL.md hard rules.
- Arab-market culture note for premium and trustworthy categories and seasonal
  themes: the `ice-motion` skill, `references/motion-language-by-type.md`
  section 4.

## Industry preset ids (18 plus neutral)

Preset values (durations, curves, springs, stagger, bans), the conservative
rule for products that span two categories, and the metaphor rule: the
`ice-motion` skill, `references/motion-language-by-type.md` section 3.

Each category there maps to one preset id in `scripts/motion-tokens.mjs`; the
script holds the same values and is what generates tokens. Duration slots are
`tap`, `instant`, `quick`, `fast`, `normal`, `slow`, `xslow`; springs are
`snap`, `glide`, `land`.

| Category (ice-motion section 3) | Preset id |
|---|---|
| Gaming, esports | `gaming-esports` |
| Fintech, banking | `fintech-banking` |
| Healthcare | `healthcare` |
| Kids, education | `kids-education` |
| Luxury, fashion | `luxury-fashion` |
| E-commerce, retail | `ecommerce-retail` |
| SaaS, developer tools | `saas-devtools` |
| Media, streaming | `media-streaming` |
| Social, creator | `social-creator` |
| Travel, hospitality | `travel-hospitality` |
| Food delivery | `food-delivery` |
| Real estate | `real-estate` |
| Fitness, sports | `fitness-sports` |
| Government, public | `government-public` |
| Crypto, web3 | `crypto-web3` |
| AI products | `ai-products` |
| Productivity | `productivity` |
| Automotive | `automotive` |
| Unknown category | `neutral` (the script default) |

Convert each duration slot to frames at the asset's frame rate with the
mapping table at the end of this file before writing Lottie keyframes.

## Reusable curve library

One table, deduplicated. Pick by behavior, then adjust one quality; never
invent a curve when one here fits. Values are cubic-bezier `x1,y1,x2,y2`.

| Name | Curve | Behavior | Source |
|---|---|---|---|
| entrance-sharp | .20,.75,.34,.94 | fast in, soft land; mask-wipe deceleration | diffusionstudio |
| settle-soft | .00,.65,.51,.99 | deep ease-out, no bounce; count-up landing, logo lockup | diffusionstudio |
| kinetic-ui | .85,.46,.14,.53 | lively small state move; not every UI move | diffusionstudio |
| expressive-pop | .94,.75,.34,.94 | fast-out plus soft settle; focal word or flourish only | diffusionstudio |
| travel-balanced | 1.00,.49,.00,.55 | S-curve travel, camera, state to state | diffusionstudio |
| exit-accelerate | 1.00,.02,.54,.42 | slow start, fast end; hard-cut companion | diffusionstudio |
| travel-cut | .15,.85,.95,.05 | fast-slow-fast, never settles; only before a cut or mask | diffusionstudio |
| standardOut | 0.2,0,0,1 | standard decelerate (product default) | motion-interaction-studio |
| standard | 0.4,0,0.2,1 | natural in-out | studio, pixel2motion |
| standardIn | 0.4,0,1,1 | exits | studio |
| broadcastOut | 0.23,1,0.32,1 | slam in, long soft landing | studio |
| expoOut | 0.16,1,0.3,1 | universal strong ease-out | studio, pixel2motion |
| expoInOut | 0.87,0,0.13,1 | dramatic in-out | studio |
| quartOut | 0.25,1,0.5,1 | airy decelerate | studio |
| quintOut | 0.22,1,0.36,1 | brisk decelerate, settle | studio, pixel2motion |
| iosSheet | 0.32,0.72,0,1 | sheets and panels | studio |
| gentle | 0.25,0.1,0.25,1 | calm, healthcare | studio |
| sineInOut | 0.37,0,0.63,1 | breathing loops | studio |
| cubicInOut | 0.65,0,0.35,1 | editorial in-out | studio |
| backOut | 0.34,1.56,0.64,1 | overshoot; playful only, scale amplitude with duration | studio, pixel2motion |
| softBackOut | 0.34,1.3,0.64,1 | gentle overshoot | studio |
| emphasizedDecel | 0.05,0.7,0.1,1 | emphasized entrance | studio |
| emphasizedAccel | 0.3,0,0.8,0.15 | emphasized exit | studio |
| quadIn | 0.5,0,0.75,0 | soft exit | studio |
| enter (calm) | 0,0,0.2,1 | confident ease-out | pixel2motion |
| narrative | 0.34,0,0.14,1 | sharp interest, soft resolution; deliberate sequences | pixel2motion |
| friendly | 0.25,0.46,0.45,0.94 | middle-of-the-road entrance | pixel2motion |
| elegant | 0.4,0,0.6,1 | extended symmetric | pixel2motion |

Linear is correct only for continuous rotation, progress that represents time,
scanners and mechanical seams.

## Spring model

Springs are authored as visual duration and bounce (0 to 1), mass 1:
`stiffness = (2 * PI / duration_s)^2`, `dampingRatio = 1 - bounce`,
`damping = 2 * dampingRatio * sqrt(stiffness)`. The generator samples the step
response into a CSS `linear()` easing and reports the real settle time.

## Generating tokens and mapping them into Lottie

```bash
node scripts/motion-tokens.mjs --list
node scripts/motion-tokens.mjs --preset <preset-id> --format all --out <dir>
node scripts/motion-tokens.mjs --custom <brand>.json --format json
node scripts/motion-tokens.mjs --preset <preset-id> --set dur.fast=<ms> --format css
```

Formats: css, ts, dart, swift, kotlin, json. Node (minimum in the ice-engines
`versions.json`), no dependencies, no network. A custom JSON may contain `"extends": "<preset-id>"` and any subset of
fields; keep it in the user's repo.

Mapping a token into a Lottie file:

| Token | Lottie |
|---|---|
| duration in ms | frames = round(ms / 1000 * fr); keep `fr` at the asset's frame rate |
| cubic-bezier `x1,y1,x2,y2` | start keyframe `o:{x:[x1],y:[y1]}`, end keyframe `i:{x:[x2],y:[y2]}` |
| spring with bounce 0 | the nearest ease-out curve over the reported settle time |
| spring with bounce above 0 | a settle-back keyframe past the target (amplitude from the bounce), then ease back; or sample the step response every 2 to 4 frames as baked keyframes |
| stagger step and cap | per-item start offset in frames, capped by the cap |
| distances | px in the composition's coordinate space, scaled by `w` of the target slot |

Never use CSS `var()` tokens as timing functions inside `@keyframes` in the
animated SVG route: Chromium drops them and the segment runs linear (see
`logo-pipeline.md`). Keep tokens for durations and delays only and write
literal curves with a comment naming the token.
