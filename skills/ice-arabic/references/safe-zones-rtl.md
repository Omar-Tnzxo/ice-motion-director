> Sources: Omar-Tnzxo video-production-studio `tools/safe_zones.py` and design-system template (founder's own); majedphotos/video-ad-editor (MIT, Copyright (c) 2026 Majed Alzaabi) `SKILL.md`, `references/cut-styles.md`, `references/motion-kit.md`, `references/moves.md`, `references/collage.md`, `scripts/08_safe_check.js`. Ideas from imMamdouhaboammar/motion-graphics-skills rewritten. Changes: merged into one table, translated, dash characters removed.

# Safe zones for Arabic text on vertical video

Platform specs and general safe zones are owned by `ice-engines`. This file holds where Arabic text may sit on a 1080x1920 frame and why RTL changes the risk.

## 1. Why RTL is different

Right-aligned Arabic lines start at the right edge, exactly where the like, comment and share column sits. A right-aligned line collides with the buttons first. Prefer centered lines, or cap the right edge of every text line at the column's left edge.

## 2. Presets (approximate; check against the live app)

| Platform | No text, top | No text, bottom | Right button column (no text) | Caution band |
|---|---|---|---|---|
| Instagram Reels | y 0 to 150 | y 1620 to 1920 | x 950 to 1080, y 1100 to 1750 | y 1500 to 1620 |
| TikTok | y 0 to 180 | y 1450 to 1920 | x 900 to 1080, y 850 to 1650 | y 1350 to 1450 |
| YouTube Shorts | y 0 to 160 | y 1500 to 1920 | x 920 to 1080, y 950 to 1700 | y 1400 to 1500 |
| Snapchat (estimate) | y 0 to 140 | y 1600 to 1920 | x 940 to 1080, y 1000 to 1600 | y 1480 to 1600 |
| Facebook Reels (estimate) | y 0 to 150 | y 1580 to 1920 | x 950 to 1080, y 1050 to 1700 | y 1460 to 1580 |

Caption band used by the founder's design system: y 220 to 1500.

## 3. Extra limits for Arabic text (Instagram-tuned, apply the same logic per platform)

- Any line entering the button column's height (y 1100 to 1750) stays at x 940 or less; front text blocks 820 px wide, centered.
- No text below y 1500 except the caption.
- Lower thirds stay inside y 1500 and x 920.
- Collage pages: 70 px margin around every word; no text in the last 300 px or the right strip y 1100 to 1750.
- Non-hero copy at least 48 px from any frame edge.
- Images (not text) may enter the bands on purpose, for example a large card in the upper two thirds with a small face card below.

## 4. Scoped choice

| Case | Use |
|---|---|
| One target platform | That platform's preset |
| One master posted to several platforms | Conservative band: text and logos between y 360 and 1420, out of the right 120 px. An example from a delivered film: 72 px sides, 200 px top, 330 px bottom |
| Profile grid cover | `references/covers-and-thumbnails.md` |

## 5. Check method

Render each text moment twice over two different solid video colors; pixels that do not change are your drawing. Count drawn text pixels inside the no-text zones and fail with a non-zero exit when any are found. Also confirm the first caption appears within 0.5 s. Apply the check to layered and behind-the-person effects with the person layer present.
