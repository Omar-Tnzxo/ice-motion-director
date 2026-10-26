> Adapted from nolangz/pixel2motion (MIT, Copyright (c) 2026 Nolan Lai). Changes: replaced dash characters; the axis tables and personality preset values now live once in the ice-motion skill, and this file keeps the CSS token mapping, the token trap and the universal tokens.

# Motion Personality: Brand → Parameters

Translate brand identity into motion parameters systematically. Never pick easing or duration by taste, derive them here, record the derivation in `motion_spec.md`.

## Step 1 and Step 2: Axes and principle parameters

The energy and tone axes, reading the mark for evidence, and the principle parameters per axis: the `ice-motion` skill, `references/motion-language-by-type.md` section 4. User-stated brand words override visual inference.

## Step 3: Personality presets as tokens

Pick the closest personality preset in the `ice-motion` skill, `references/motion-language-by-type.md` section 4 (values: duration, entrance, settle, squash, overshoot, emphasize, avoid), then adjust from the axes. Define the chosen values once as CSS custom properties:

| Token | Column in the ice-motion preset table |
|---|---|
| `--p2m-duration` | Duration (reveal total; loops use the loop value when the preset gives one) |
| `--p2m-ease-enter` | Entrance, as a literal `cubic-bezier(...)` (or `ease-in-out` where the preset says so) |
| `--p2m-ease-settle` | Settle |
| `--p2m-squash` | Squash, as a fraction (a percent divided by 100) |
| `--p2m-overshoot` | Overshoot scale (1.0 lands exactly) |

`--p2m-duration-part` (one part's duration) takes a value inside the part timing band of that section's energy table. `reveal-patterns.md` uses these tokens and multiplies them; it never hardcodes values.

> **Token trap (Chromium)**: custom properties do NOT resolve in `animation-timing-function` declarations inside `@keyframes`, `animation-timing-function: var(--p2m-ease-enter)` is silently dropped and the segment runs with the animation's base timing function (usually `linear`), the exact mechanical motion these presets exist to prevent. Nothing errors and evenly-spaced frame strips look fine. Use the tokens in `animation:` shorthands (durations/delays resolve correctly) and as documentation, but write literal `cubic-bezier(...)` values inside keyframes with a comment naming the token. Verify with `scripts/probe_motion_continuity.py --probe`.

## Step 4: Sanity checks

The three-word check, the competitor-logo check and the without-the-product check: the `ice-motion` skill, `references/motion-language-by-type.md` section 4. Token rule: the same token values drive the reveal, loop and hover variants; never define a second token set per variant.

## Universal tokens (work for any personality)

```css
--p2m-ease-out-universal: cubic-bezier(0.16, 1, 0.3, 1);
--p2m-ease-natural: cubic-bezier(0.4, 0, 0.2, 1);
--p2m-ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);   /* scale amplitude with duration */
--p2m-ease-narrative: cubic-bezier(0.34, 0, 0.14, 1);   /* deliberate sequences */
```
