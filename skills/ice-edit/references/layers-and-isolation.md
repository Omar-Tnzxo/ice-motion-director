# Speaker isolation and caption layers

Merged from heygen-com/hyperframes (Apache-2.0: remove-background, embedded-captions, composition patterns, docs), Barty-Bart/motion-graphics (MIT: object-separation), majedphotos/video-ad-editor (MIT), nateherkai/herk-edit-kit (MIT, Use Permission), Omar-Tnzxo/video-production-studio, yihui-dev community camera-3d-captions (Apache-2.0), plus ideas restated from imMamdouhaboammar/motion-graphics-skills, hypit-ai/hypit and Vincentwei1021/video-talkcraft (ideas only). Caption text, grouping, styles and the drop, rail and embed model belong to the ice-type skill; Arabic text behind a subject (kashida crossing the head) belongs to the ice-arabic skill.

## 1. Layer stack (back to front)

1. Backdrop (original plate, or a replacement backdrop).
2. Graphics that sit behind the speaker (text behind subject, maps, shapes).
3. The speaker (matte or the original video).
4. Foreground UI, overlays and captions. Captions are never behind the speaker, except a deliberate embedded peak word designed with the ice-type skill.

## 2. Isolating the speaker

Methods that need no model come first: they are part of FFmpeg (no download, no consent item, real time on CPU). Pick by how the footage was shot:

| Footage | Method | Download |
|---|---|---|
| Green or blue screen, or an evenly lit plain wall | `chromakey` (or `hsvkey`) plus `despill` | None |
| Locked-off camera with a few seconds of the empty room (at the start of the take, or as its own clip from the same tripod position) | `backgroundkey` (FFmpeg 6.1 or newer; check with `ffmpeg -filters`) | None |
| Anything else (moving camera, busy room, no empty plate) | Person matting or prompted segmentation (table below), asked in the stage 01 message with its size | The model |

Commands, measured on synthetic 1280x720, 25 fps clips made with `lavfi` (FFmpeg 8.1): a 300x500 subject on a 0x00B140 green, and a 300x500 or 640x700 subject over a static bar pattern with grain added (`noise=alls=6:allf=t`). In every run below the background came out fully transparent (alpha 0) and the subject fully opaque (alpha 255); the transparent share matched the background's share of the frame (0.837 and 0.514). Read the screen's colour from the footage first (a pixel of the background in a frame without the speaker), then:

```
# Green screen or plain wall, to an alpha master (ProRes 4444)
ffmpeg -i in.mp4 -vf "chromakey=color=0x00B140:similarity=0.12:blend=0.05,despill=type=green" -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le speaker_alpha.mov

# The same key in HSV terms, steadier on an unevenly lit wall (hue in degrees)
ffmpeg -i in.mp4 -vf "hsvkey=hue=142:sat=0.7:val=0.5:similarity=0.2:blend=0.05,despill=type=green" -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le speaker_alpha.mov

# Straight onto a new backdrop in one pass
ffmpeg -i backdrop.mp4 -i in.mp4 -filter_complex "[1]chromakey=color=0x00B140:similarity=0.12:blend=0.05,despill=type=green[fg];[0][fg]overlay=format=auto:shortest=1,format=yuv420p" -c:v libx264 -crf 16 out.mp4

# Locked-off camera, the empty room as its own clip: the plate goes first, the key learns it, then it is trimmed off
ffmpeg -i plate.mp4 -i talk.mp4 -filter_complex "[0:v][1:v]concat=n=2:v=1:a=0,backgroundkey=threshold=0.3:similarity=0.1:blend=0.02,trim=start=<plate seconds>,setpts=PTS-STARTPTS" -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le speaker_alpha.mov
```

Tuning, measured:
- `chromakey` / `hsvkey`: raise `similarity` in steps of 0.02 until the screen is gone in the worst-lit corner, and stop before hair or clothes start to go; `blend` 0.02 to 0.08 softens the edge. `despill` removes the green fringe; use `type=blue` for a blue screen. A speaker wearing the screen's colour cannot be keyed: use the model route.
- `backgroundkey` learns the background from the first frame it sees, so that frame must be the empty room. Its `threshold` is a scene-change reset, not a key strength: when the whole frame changes by more than it, the filter takes that frame as the new background and the speaker vanishes. Measured: with grain, 0.04 reset on noise alone (whole frame transparent); 0.08 held a speaker covering 16 percent of the frame but reset when the speaker covered 49 percent; 0.2 and 0.5 held both. Start at 0.3. `similarity` (default 0.1) is the per-pixel tolerance: raise it for grain or compression noise, lower it when a speaker's clothes match the wall. The camera, exposure, white balance and light must not change during the take; any change shows as holes or a halo.
- Check alpha on three hard frames (hair, hands, the frame bottom) before the full render, as for any matte below.

Model-based isolation, for footage the two keys cannot handle:

| Tool | Use | Notes |
|---|---|---|
| Person matting (u2net human segmentation class, CPU) | Talking heads, text behind subject, cutout layouts | Alpha output as VP9 WebM (about 1 MB per 4 s), ProRes 4444 `.mov` or PNG frames; quality fast CRF 30, balanced 18, best 12. CPU only, about 2 fps at 1080p. The background plate it writes is hole-cut, not inpainted: a clean empty plate needs an inpainting model |
| Prompted segmentation (SAM 2.1 class), local | Objects, props, hands, any non-person subject | Model by machine: 12 GB or more GPU large (898 MB), smaller GPU or Apple Silicon base-plus (323 MB), CPU tiny (156 MB). CPU is slow (about 5 s per frame): suggest separating only the needed range. Work at 960 px wide (the model resizes to 1024 itself, smaller is not faster). Convert variable frame rate first. Nothing is uploaded |
| A real empty plate | Background replacement behind a locked-off speaker, and the `backgroundkey` route above | About 5 s of the empty room from the same tripod position, when the user supplied it or a stage 01 question asked for it. Auto mode with no plate: decide the fallback (keep the original room, or a hole-cut matte over a designed backdrop), log it in `ice/DIRECTION.md` and report it in the delivery note |

Model downloads are large: use them only when neither key above fits the footage; name the model and its size in the stage 01 message when the need is known then, and download only after a yes. Without a yes: keep the original frame (no isolation), log it, and say in the delivery note what the download would add.

Mask quality:
- Try a short range first (about 20 frames), check it, then run the full range in chunks (60 frames, each seeded by the previous last mask).
- Spill onto something that is not the subject: add a negative point there and rerun; a missing part: add a positive point. Anything attached to the subject counts as part of it unless excluded.
- Masks are hard-edged: clean on objects and hands, weaker on soft hair. Compare edges (hair, hands, frame bottom) on 3 hard frames before a full render; jitter metric: mean mask edge change under 0.003 between frames.
- Feather mattes 2 to 4 px and tint rims to match darker backdrops. Never hide a bad mask with glow.
- Keep the original frame when the room matters, the mask chatters, or the lighting will not match.
- Never composite a cutout over a different take of the same person.

## 3. Frame-aligned layers

- A cutout and its original background must stay frame-aligned: give both media the same start and playback offset, and show or hide them through wrappers, not by retiming one of them. Different starts cause a one-frame jitter at the cut.
- In HyperFrames, timed elements are forced visible; wrap the video in an untimed div and animate the wrapper for push-ins and picture-in-picture. Do overlays in post with ffmpeg against a PNG sequence when WebM alpha decoding is flaky; decode alpha WebM with the explicit VP9 decoder or the transparent area renders black.
- Full frame to picture-in-picture: swap the backdrop first, hold, then scale and move the speaker, then reveal the information that needed the space. Never all on one frame (it shows a double speaker).
- Text behind subject: real occlusion by the matte, with slight opposite drift on the two layers. Use it as a scarce peak (once or twice per video, 1 to 3 words). Cutout effects need segmentation and run at most once or twice per video.
- Speaker badge (long-form explainer with B-roll): once placed it is locked (no drift or breathing) while the speaker keeps moving inside it; in the lower third, bottom on the action-safe margin; badge and captions on opposite sides; in vertical video the badge goes bottom-left because the right edge holds the platform's buttons. Establish the speaker full or half body for the hook (about the first 8 s) before shrinking to a badge.

## 4. Caption layer placement on footage

| Topic | Where the rule lives |
|---|---|
| Face, hands, layout spots (seam, shirt, clear zone), captions across a cut | The `ice-type` skill, `references/caption-placement-safe-zones.md` section 4 |
| Contrast, dark side of the frame, halo over skin, re-picking contrast after a footage swap | The `ice-type` skill, `references/caption-placement-safe-zones.md` section 5 |
| Caption band policy (reserved band or overlay law, scoped) | The `ice-type` skill, `references/caption-placement-safe-zones.md` section 3 |
| Platform safe zones | The `ice-engines` skill, `references/platform-specs.md` section 3 |
| Never blink out, speaker-turn handoffs | The `ice-type` skill, `references/captions-system.md` section 5 |
| Head-following captions | The `ice-type` skill, `references/captions-system.md` section 7 |
| When to refuse or split a clip before captioning | The `ice-type` skill, `references/captions-system.md` section 4 |

Rules specific to edits with layers:
- Card layouts: the caption sits fully above the video card.
- One text at a time: when a graphic writes the spoken sentence, hide that caption; a caption below plus text above splits attention.
- Before matting or embedded captions, split multi-speaker or hard-cut clips per shot (the matte follows one subject per shot).
