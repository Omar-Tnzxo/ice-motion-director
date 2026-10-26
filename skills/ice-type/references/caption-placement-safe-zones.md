# Caption and text placement, safe zones, contrast

Merged from heygen-com/hyperframes (Apache-2.0: embedded-captions layout and aesthetic principles, frame-worker caption keep-out, captions-overlay, studio safe zones, media-use captions), nateherkai/herk-edit-kit (MIT), majedphotos/video-ad-editor (MIT), browser-use/video-use (MIT), vincentsch/explainroo (MIT), AbubakrChan/product-launch-motion (MIT), alexgreensh/anidoodle (MIT), Barty-Bart/motion-graphics (MIT), echris6/motion-video-kit (MIT), edenfunf/reelmimic (MIT), alchaincyf/huashu-art-motion (MIT), digitalsamba/claude-code-video-toolkit (MIT), Omar-Tnzxo/video-production-studio, yihui-dev community skills (camera-3d-captions), plus ideas restated from Vincentwei1021/video-talkcraft, Vincentwei1021/anything2explainer, bangtutorial/bang-motion, imMamdouhaboammar/motion-graphics-skills and remotion-dev/skills. Restructured; numbers kept.

Platform export specs (sizes, fps, codecs) belong to the `ice-engines` skill. This file holds where text may sit.

## 1. Vertical video: platform safe zones and the caption baseline

Platform safe zones (published per-platform margins with last-verified dates, Instagram caption band and grid crop, generic vertical rules): the `ice-engines` skill, `references/platform-specs.md` section 3. Re-check the source before a campaign and record the check date in `ice/DIRECTION.md`. Place every caption and text element inside the margins that section gives for the platform slot in `ice/BRIEF.md`.

Caption baseline on vertical video: platform UI covers roughly the bottom 25 to 30%, so an ASS `MarginV` of about 90 puts the caption baseline about 30% up; do not go below about 75 without a reason. Plain 9:16 captions sit about a quarter of the way up. Adjust captions to the actual face position in each layout (section 4).

Badges and subtitles go on opposite sides; on vertical video a badge sits bottom-left because the right edge holds the like bar.

## 2. Landscape and broadcast safe areas

Action-safe and title-safe areas, generic and pixel margins, scene padding and the YouTube bottom band: the `ice-engines` skill, `references/platform-specs.md` section 3. Captions and key content stay inside title-safe.

## 3. Caption bands and keep-outs (scoped)

| Approach | Rule | Scope |
|---|---|---|
| Reserved band | The bottom about 17% belongs to the caption pill: plan all content into the top about 83% (at most y 900 on a 1080-tall frame, 1600 on a 1920-tall portrait). Holds even when captions are disabled, so a later captioned export still works | Films built from scratch with voiceover that will carry burned captions (explainers, faceless explainers, data stories with VO) and parallel scene workers |
| Overlay law | A caption is composited on top of the finished film as an overlay, not a reserved zone; center the composition on the true vertical center; only keep critical small text out of the bottom about 80 px center span | Adding captions to an existing composition or recut where reflowing every scene is not possible |
| Protection band (explainer grammars) | Subtitle band y 900 and below on 1080; subject groups end at y 860 or higher; frame decorations at least 60 px above the band; slide-up entrances limited to 120 px over 22 frames so they never cross the band | Explainers with plain burned subtitles |
| Own band under the picture | Captions in their own band under the art, never over it; on 9:16 the band sits at the bottom of the safe zones | Drawn and illustrated films |
| Grammars yield | Animation with in-picture text moves out of the subtitle band; the band does not move per segment (subtitles are burned at export and moving them touches the export chain, while animation is parameterized and cheap to move). Where in-picture text must compete, skip burning for that segment | Explainers with burned subtitles |

Band positions measured in sources (illustration of scale, not defaults): portrait subtitle band about y 1400 to 1520 with a bottom margin of 490 to 570; landscape bottom 160 to 220; 1280 x 720 explainer: content y 110 to 620, subtitle band y 637 to 690 empty, progress bar y 687 to 720. Card-content end above y about 1640 on 1920 tall when karaoke pills sit there.

Landscape caption positions: bottom 80 to 120 px. Portrait: about 600 to 700 px from the bottom for social captions (or at about 65% height). Lower thirds about 100 px from the bottom.

## 4. Placement relative to people and content

1. Never over the mouth or chin, least of all in the first second, when the viewer decides whether the person is real. Never over the eyes (keep a 20 px margin). The caption never sits on the speaker's face.
2. In a split screen: on the seam. In a punch-in: on the shirt, not the jaw. On a shot that is text to read: move to a clear zone.
3. Face coverage: the face must never be 100% covered continuously; in every 0.3 s window at least 30% of the face box is uncovered. Measure the face safe zone with a detector (face box expanded upward about 60% for hair, plus a 30 px margin, union over time) when text, cards or subtitles must avoid the host entirely.
4. Clean-zone priority for placed captions: the corner farthest from the head, then a strip above the head (30 px margin), then a lower third. Use the gaze direction's looking room as the tiebreaker. Center a crown only when the subject is within 10% of center, with at least 15% clean space each side.
5. Never switch spatial zones mid-sentence. A caption that runs across a cut moves to the new shot's spot on the cut frame.
6. Never cover the subject, the product, the action or the detail the shot is about. Captions stay outside the action and its consequence.
7. Letterbox and pillarbox bars are caption real estate.
8. Talking-head vertical layouts: speaker at the bottom, one graphic at the top, captions, nothing else (crowded vertical layouts are recognizable as default AI output).
9. Text to be read is drawn on top, last, regardless of its object's layer (photos, clips or later cards covering text is the most common bug). Captions also sit above any dim or spotlight layer.
10. Subtitle band moves wait until host geometry transitions finish (about 0.45 s).
11. In 3D or camera-moving shots, captions and HUD sit on a screen layer outside the camera rig and never move with the camera.

Arabic layouts (caption above a video card, RTL positions): see the `ice-arabic` skill.

## 5. Contrast and backing

Measure, do not guess: sample the luminance of the pixels behind every caption.

| Background luminance under the text (0 to 255) | Treatment |
|---|---|
| Under 60 | Light text reads as is |
| 60 to 180 | Add a glyph scrim (stroke or soft shadow) |
| Over 180 | Opaque text plus scrim; never bare light text. Screen blend fails here |

Contrast ladder for embedded and cinematic looks (try in order): blend (overlay or screen) when it reads; a 2 to 3 px dark stroke plus a soft drop shadow; a narrow gradient bar; a local dim plate at 10 to 15%; last resort a hard pill box (banned on cinematic directions).

Hard rules:
- Never white on light. A dark caption box disappears on a dark background unless it has a thin light edge.
- Text is never set over a busy picture without a plate under it (solid or softly tinted panel, scrim, or a clear patch). Squint at the frame: if a letter disappears, the plate is missing.
- Text crossing skin or light clothing gets a dark halo. Captions in camera shots go over the dark side of the frame.
- Captions must contrast with the product UI they sit on, not only with their own card: a dark UI needs a clearly different caption treatment (for example dark text on a light card).
- WCAG contrast 4.5:1 or better for captions and secondary text.
- Heavy outline at least 8 px at 1080p plus drop shadow or translucent bar when captions must read over white or light objects.
- Tint for legibility over busy footage: a dark tint at about 0.55 opacity; lower-third bar about 140 px tall at about 0.75 opacity.
- Add the contrast layer in the host, not inside a caption component. No `text-shadow` on the group container; put shadows on the text.
- When footage replaces a designed scene, re-pick caption contrast from the actual new background, including qualifiers and small secondary text.
- Choose caption colors that pass contrast at text size: green, orange and red are often light enough for shapes but too light for text; automatic label colors need contrast of at least 3:1 against their ground.
