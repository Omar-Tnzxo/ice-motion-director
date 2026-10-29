# Talking head to vertical: reframe, layouts and safe zones

Merged from majedphotos/video-ad-editor (MIT), Omar-Tnzxo/video-production-studio (safe-zone data), digitalsamba/claude-code-video-toolkit (MIT: cutdown), nateherkai/herk-edit-kit (MIT, Use Permission), browser-use/video-use (MIT), heygen-com/hyperframes (Apache-2.0: talking-head recut), AbubakrChan/product-launch-motion (MIT), plus ideas restated from imMamdouhaboammar/motion-graphics-skills (ideas only). Platform specs beyond safe zones live in the ice-engines skill.

## 1. Pick the conversion path

| Source and goal | Path |
|---|---|
| Finished 16:9 film, slides or screen recording to a vertical, square or 4:5 copy | `python scripts/cutdown.py --input <file> --mode blur` (whole frame over a blurred, darkened copy of itself). Nothing is cut off |
| 16:9 talking head or single subject to vertical | `cutdown.py --mode crop` with `--focus` per segment (`--segment START-END@FOCUS`), or a fixed crop per shot built by hand (section 2) |
| Solid background behind a fitted frame | `cutdown.py --mode pad --pad-color "#RRGGBB"` (color from the project direction) |
| A talking-head ad built for vertical | Recompose: layouts in section 3, never a center crop of the 16:9 master |
| Long video to several shorts | Pick segments by meaning (see `edit-types/shorts-reels.md`), then reframe each |

Fitted modes shrink text: in 9:16 a 1920x1080 source shows at 56% scale, so burned captions and small slide text shrink with it. `--zoom 1.3` trades a little of each side for size, or re-render with larger captions first. The tool warns when a cut runs past the platform's short-form limit (YouTube Shorts and Instagram Reels about 3 min, TikTok 10 min, checked 2026-10; re-verify).

A center crop is not a second composition. Verify each requested aspect ratio on its own, including its opening and its call to action.

## 2. Reframing rules

- Fixed crop per shot, never per-frame face following (it jitters). Put the median face position about 30% from the top. News reel (edit type `news-reel`, style family `family-broadcast-news.md`): the digital camera zooms about the median face point of the take, fixed for the take (`ice-motion/references/camera.md`, "Digital camera on one take (news reel)"); the crop and the camera share that anchor, so the head never jumps between a reframe and a move.
- Zoom x1.35 when the face is under about 7% of the frame (wide shot), x1.6 when under about 3.5% (full studio). A 1080p source crops to 608x1080 and scales about x1.8.
- Head-top crop for any card layout: one fixed crop for the whole video, starting above the highest head point with 1.5% margin. Never cut the head; never leave an empty ceiling. A face anchor near 0.30 of the card height is the default; about 0.42 keeps the head near the card's top edge in reduced layouts.
- Build final crops from the native-resolution source, not from an editing proxy.
- Recommended output ratio from the source: aspect 1.5 or wider gives 16:9, 0.7 or narrower gives 9:16, otherwise 4:5. Settle ratio, layout and density before designing overlays: from the brief, or a stage 01 question when open; in auto mode with no answer, take the recommended ratio above and log it.

## 3. Layout modes for a vertical talking-head ad (1080x1920)

| Mode | What it shows | Use when |
|---|---|---|
| Full face | Speaker full screen | Talk without a graphic; emotion, questions, promises |
| Graphic top, face below | A graphic band (about y 280 to 520), then the caption, then the face at full width | The speaker comments on a drawing or a number |
| Small face card | A big board on top, caption, a small face card below (keep the head inside the card, never a sliced face) | B-roll or a big board; numbers and explanations |
| Voice only | No face, voice continues over a visual metaphor of the words | Once or twice per video, 4 to 8 s each, only for numbers, lists or comparisons, never in the hook or the final call to action |
| Split (house reel) | B-roll on top (y 0 to 880), speaker below | Most of a fast reel (shares in `house-style-numbers.md`) |
| Punch-in | Tight speaker shot | Pivots, emphasis, the call to action |
| Split (news reel) | Presenter close on top (measured x1.39), evidence below (a satellite, map or archive panel) under a feathered seam at about y 1000 (52 percent of the height); the panel slides up about 600 px with an ease out, its pictures change every 21 f (0.84 s at 25 fps) | News reel (edit type `news-reel`, style family `family-broadcast-news.md`): a sentence about evidence the viewer should see while the presenter keeps eye contact. The face anchor of section 2 applies to the top cell. The seam is always feathered, never a hard line; its width is measured on the reference, else start from the B-roll-behind-the-cut-out feather of `layers-and-isolation.md` section 3b and check on a still that no edge shows. The house order (B-roll on top) holds everywhere else |

Choose the mode from the meaning of the line: is the face or the drawing more important right now? One hero element per scene, at most one supporting element. Spread a board's elements over its full height. Every layout change is a hard cut in house reel style; in calm ads no layout change before 4 s on the same shot.

Long video recut into a framed composition (landscape templates): split layout puts the video in the right half (960, 0, 960, 1080); stack layout puts it on the top 52%; picture-in-picture bottom-right (1480, 760, 400, 300); full-bleed overlay; wrapper moves 0.5 to 0.7 s with an ease in and out.

## 4. Safe zones (vertical 1080x1920)

Per-platform safe zones, generic vertical rules (middle band, phone-safe start region, source margins) and the dated sources: the `ice-engines` skill, `references/platform-specs.md` section 3. Caption placement inside them: the `ice-type` skill, `references/caption-placement-safe-zones.md` sections 1 and 3.

Edit-specific working rules (always clamp them inside the delivery platform's safe zone; where they differ, the stricter value wins):
- Adjust captions to the actual face in every layout. Keep labels below the top 130 px.
- Front text width about 820 px, centered.
- A layout may let an image (not text) enter the bottom band on purpose.
- House values measured on organic reels, illustration only: lower thirds bottom-right inside y 1500 and x 920; hook card bounds x 140 to 940, y 230 to 1480. Shrink them to the platform's margins before use.
- Covers and first-frame crops (centered square, profile grid and feed crops, cover sizes): the `ice-engines` skill, `references/platform-specs.md` section 5; Arabic covers: the `ice-arabic` skill, `references/covers-and-thumbnails.md` section 2.

Subtitle filter placement: with libass, `MarginV=90` lands the baseline about 30% up the frame on any aspect; do not go below about 75 without a reason (platform UI covers roughly the bottom 25 to 30%).

## 5. First frame

Opening rules (first frame, motion in the first second, muted test, no bumper or stamp effect) and hook timing: the `ice-ideas` skill, `references/hooks-and-openers.md` sections 2 and 3. For a footage-led vertical edit, candidate first frames are a split with the topic's tool or brand on top, a result, or a face mid-word (illustration only; pick by the material).
