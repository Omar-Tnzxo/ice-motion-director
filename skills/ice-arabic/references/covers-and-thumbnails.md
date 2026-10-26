> Adapted from majedphotos/video-ad-editor (MIT, Copyright (c) 2026 Majed Alzaabi) `references/thumbnails.md` and `SKILL.md`, and Omar-Tnzxo video-production-studio `references/qa-and-delivery.md`. Changes: translated from Arabic, author's personal palette and font defaults removed (they come from the brand design system), dash characters removed. Numbers kept with their evidence grade.

# Covers and thumbnails with Arabic text

## 1. Why covers fail on phones

- The Instagram profile grid shows a cover at about 12 percent of its size: a 1080-wide cover becomes about 130 points wide on a 393-point phone (measured).
- Smallest readable iPhone text is 11 points, normal is 17 (Apple HIG). So 11 points needs about 91 px on the cover and 17 points about 141 px (points divided by 0.1204).
- Arabic reads smaller than Latin at the same size: scale it about 1.2 times (estimate).

## 2. Reel cover (1080x1920)

- The cover is the first frame of the video (inserted for about 0.1 s) and must be readable alone.
- Everything important sits inside an invisible centered square, y 420 to 1500. The profile grid crops 3:4 (y 240 to 1680), the feed 4:5 (y 285 to 1635).

| Item | Minimum |
|---|---|
| Arabic title | 170 px (best 190 to 230) |
| Any other text | 110 px, never under 91 |
| Words | 5 at most, 2 lines, about 9 characters per line at 170 px |
| Logo or icon | 200 px |
| Lines and strokes | 10 px |
| Weight | Bold or Black; no letter-spacing on Arabic |
| Contrast | 4.5:1 (3:1 for very large text) |
| Account handle | None |

Order inside the square: news elements on top if any, the face, the title on the chest. No word on the face. Cross and check marks on logos only for a "from X to Y" story.

## 3. YouTube thumbnail (16:9)

- 3840x2160 recommended plus a 1280x720 copy; under 2 MB for phone upload.
- On the 1280 copy: Arabic text at least 120 px (Latin 100), logo at least 140 px; keep the bottom-right 310x145 empty (duration badge).
- 3 to 5 words, one idea, a large face with a clear emotion.
- Make three variants (face plus word, face plus a news object, before and after); the user picks.

## 4. Look

Background, text color and fonts come from the brand design system (`ice-direction`, `ice-assets`); no fixed palette. Ask first whether to take the person's image from the video or from photos the user provides; a frame from the video usually has a neutral face and makes a weaker thumbnail.

## 5. Check

Preview the cover at its real phone sizes (reels tab, profile grid, far view) and the thumbnail at home-feed and side-list sizes. If it cannot be read in the preview, it cannot be read on the phone.
