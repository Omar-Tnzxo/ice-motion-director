# Render and export settings

> Merged from heygen-com/hyperframes docs (Apache-2.0), digitalsamba/claude-code-video-toolkit, AbubakrChan/product-launch-motion, howseen-ai/claude-motion-design, haidrrrry/claude-remotion-skill, Barty-Bart/motion-graphics, nateherkai/herk-edit-kit, Vincentwei1021/mg-styles-15, alexgreensh/anidoodle, the founder's own skills; ideas from imMamdouhaboammar/motion-graphics-skills and noncommercial sources (rewritten). Changes: merged, deduplicated, scoped, dashes removed.

Contents: 1 Defaults. 2 Codec and quality by purpose. 3 Colour, grain, banding. 4 Review copies. 5 Alpha output for editors. 6 GIF, loops, posters, stills. 7 HDR and 4K. 8 Delivery hygiene. 9 Heavy intermediates. Loudness targets: the ice-audio skill. Delivery gates and report: the ice-qa skill.

## 1. Defaults

- 1920x1080 at 30 fps unless the brief or platform says otherwise. Do not over-spec resolution or frame rate: draft at 1080p30; 4K or 60 fps only after acceptance and only when the source or destination needs it.
- Frame rate by content: 60 fps for fast UI and motion-heavy films; 30 fps for talk, calm ads and screen content; 24 fps for a filmic, cel or 3D look. One fps across all segments of a film (concat copy needs a uniform rate).
- Frames = round(duration x fps); frame i sits at i / fps.
- Even width and height for every 4:2:0 encode.

## 2. Codec and quality by purpose

| Purpose | Container and codec | Quality setting | Extras |
|---|---|---|---|
| Lossless intermediate | MKV FFV1, or PNG sequence | Lossless | Raw RGBA costs frames x width x height x 4 bytes (about 25 GB per minute at 1080p30) |
| Archive or editing master | MP4 H.264 High or MOV ProRes | CRF 14 to 16 (`-preset slow`) | |
| Upload master for platforms that re-encode | MP4 H.264 High, yuv420p, AAC 48 kHz | CRF 16 to 18 (`-preset slow`) | Platforms re-compress: give headroom. A YouTube recipe: `-crf 18 -preset slow -profile:v high -level 4.0 -bf 2 -g 30`, AAC 192k 48 kHz |
| Social master with a size cap | MP4 H.264 | About CRF 21 with a 6 Mbps max rate keeps a vertical reel under about 30 MB | `-maxrate 6M -bufsize 12M` |
| Web playback | H.264 at a moderate CRF plus AV1 or VP9 WebM, 720p, capped bitrate | CRF 23 to 26 | Poster images, captions track; see section 8 |
| Draft | H.264 `-preset veryfast` | CRF 23 to 28 | Half resolution |
| Review copy for chat or email | H.264 | Bitrate arithmetic, not CRF (section 4) | |

CRF vs bitrate: CRF holds quality constant and lets size float, right for masters. Target bitrate (two-pass or capped) holds size, right when a platform or chat app has a file limit. Never combine `--crf` and `--video-bitrate` in one HyperFrames render.

Common encode tail for H.264 deliveries: `-pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -movflags +faststart`. A file showing `hevc` or `color_range=pc` where H.264 TV range was required is re-encoded. Wrong colour tags turn skin yellow or green.

Re-encode a master instead of `-c:v copy` when changing anything (one source measured 68 MB down to 38 MB with `-crf 19 -tune film` and no visible loss).

Final file sanity: roughly 3 to 10 MB per 10 seconds at 1080p for typical motion graphics; far outside that, check grain and bitrate settings. Web delivery of very high bitrate masters (37 to 100 Mb/s measured) re-encodes under about 28 Mb/s for streaming.

## 3. Colour, grain, banding

- Final encode converts full-range RGB captures to TV range: `scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p` plus the tags above.
- Dark gradients band in 8-bit H.264: add a static fine grain layer (about 0.06 alpha on dark, 0.09 on light) or a fixed noise tile (alpha 7/255 or less), or encode with `-tune grain` and a lower CRF (10 to 12) and check the encoded file, not the browser.
- Grain costs bitrate: per-frame re-seeded grain reads as electronic sizzle and encoded to 85 MB against about 9 MB ungrained in one test; a 54 s draft with full-frame animated grain hit 177 MB. Keep grain fine and low, change it on twos or at about 12 Hz, keep one grain level for the whole film, and cap the bitrate. Skip grain on crisp flat brands, pixel and vector styles; use less on light backgrounds.
- Colour grading decisions: the ice-styles and ice-motion skills; the encode just has to preserve them.

## 4. Review copies

- Size a chat or email review copy by bitrate arithmetic: total bitrate = size limit x 8 x 0.9 / duration (30 MB over 59 s is about 3.6 Mbps). Check the size before sending. The master stays in storage.
- A WhatsApp-sized copy is about 16 MB.
- Draft review copies early and often are encouraged (send the draft, ask for changes before the final). The final delivery render waits for the user's approval of the final preview.

## 5. Alpha output for editors

| Destination | Format | Settings |
|---|---|---|
| Editing software (Premiere, Resolve, Final Cut, After Effects) | MOV ProRes 4444 | `-c:v prores_ks -profile:v 4 -pix_fmt yuva444p10le -vendor apl0`; PCM audio if any |
| Browsers and web overlays | WebM VP9 | `-c:v libvpx-vp9 -pix_fmt yuva420p -auto-alt-ref 0`; Chrome honours alpha only when the stream carries `alpha_mode=1` |
| Frame handoff | PNG sequence | RGBA |
| Animated web stickers | APNG | RGBA |

- Leave every background unpainted (html, body, root, full-frame layers) or it is encoded as visible pixels. Element shadows remain.
- Verify alpha on a decoded frame: `ffmpeg -c:v libvpx-vp9 -i overlay.webm -frames:v 1 -pix_fmt rgba frame.png` and inspect it over a contrasting background; check the transparent pixel fraction of one frame (the MOV path can silently drop alpha). ffprobe may print `yuv420p` for a VP9 alpha WebM: look for the `alpha_mode=1` tag instead of trusting pix_fmt.
- Transitions that need the background (slides, wipes, brushes) become fades on transparent output. Keep text readable on unknown footage with cards or text backgrounds.
- Supersampled 4K and HDR cannot be combined with alpha formats in HyperFrames.
- B-roll panels and lower thirds for an editor: name each file by its timeline in-point, match the edit's resolution and fps.

## 6. GIF, loops, posters, stills

| Output | Settings | Scope |
|---|---|---|
| GIF preview of a film | fps 12 to 15, width 480 to 960 long side, lanczos, `palettegen=stats_mode=full` then `paletteuse` with dithering (`sierra2_4a` or `bayer:bayer_scale=3`) | Photographic or gradient content |
| GIF of flat graphics | `palettegen=max_colors=128:stats_mode=full`, `paletteuse=dither=none` (dither adds flicker to every frame of a flat image) | Flat vector art, loop covers |
| Email GIF | About 9 s, under 5 MB, 8 fps, 540 px wide, light denoise | Email |
| Loop cover | Rotate the loop so frame 1 is the finished picture (inboxes and link previews show frame 1); last frame equals the first in position and velocity; cycles are whole numbers | Loops |

- GIFs have no audio. Upload the GIF itself; check the uploaded link still ends in `.gif`.
- Poster: the first frame is often the cover on social apps (some apps ignore a chosen cover). Put a readable poster in frame 0 (overlay with `enable='eq(n,0)'` or author the title present from the first frame), never a blank, a fade from black, a mid-motion, half-typed or cursor frame; readable at 200 px wide. Cover and thumbnail design: the ice-type skill and `platform-specs.md`.
- Stills: common sizes 1600x900 web hero, 1200x630 social card, 1080x1080 square, 1080x1350 portrait, 2550x3300 letter at 300 dpi.

## 7. HDR and 4K

- HDR output is MP4 only (H.265 10-bit PQ or HLG); use software encoding for HDR10; distributed cloud renders are SDR. SDR deliveries from HDR sources need tone mapping (`engine-choice.md` (section "FFmpeg-only engine") section 4).
- 4K is about 4x slower per frame and 3 to 5x larger. Supersampling needs the same aspect ratio and an integer multiple. Never upscale a 1080p render and call it 4K. For a 1920x1080 composition, 3840x2160 source media already gives enough detail for a 2x display.
- Before a 4K or 60 fps master, render a short stress test (small text, gradients, glow, fast motion, 3D) and review at 100% and normal size.

## 8. Delivery hygiene

- Render and mux to a scratch path, verify with ffprobe and stills, then move into the final path; final paths hold only verified files.
- A process wrapper reads the encoder's exit status and fails loudly; prove it once by pointing the output at an impossible path.
- Render once with the tail, then cut exact-length variants by frame count from the same frames so deliverables cannot drift.
- Audio is rendered once for the whole film, never per segment (AAC priming delays drift each segment). Pad audio with `apad` and let the picture define the length; never let `-shortest` cut the picture to a shorter audio.
- Segment boundaries round exactly like the sequence; assert per-segment and total frame counts (one frame off shifts every beat by 33 ms at 30 fps).
- Naming: `<project>_<film>_<ratio>_<length>s_v<N>.mp4` (kebab-case project from the brand or topic, never a workspace name or timestamp); never overwrite an approved version; keep the previous version for comparison.
- Hand over with the master: brief, direction log, every third-party license, and the source that re-renders it from one command.
- Keep heavy renders out of git (release assets or artifact storage); keep at most one previous draft plus the final in the repo.
- Website video: poster first, `preload="none"`, created only when motion is allowed and near the viewport, autoplay only muted, AV1 or VP9 plus H.264 fallback, captions track attached.
- Never publish, post or schedule: delivery is files and links.

## 9. Heavy intermediates

Owner decision, 2026-10-29, every route. Files the run made that a script or a render can make again are deleted once the stage that consumes them is approved, so a long run does not fill the disk (`engine-choice.md` section 7.7, "Disk space").

| Intermediate | Deleted when |
|---|---|
| Frame sequences, render chunks, subframe captures, uncompressed or lossless intermediate renders of the film | Stage 07 (build) is approved and the draft that uses them is verified; after stage 10 for the frames of the final master, once that master is verified (section 8) |
| Proxies, extracted frames, frame grabs made only to measure or compare | The stage that measured them is approved; the measurements and contact sheets in `ice/` stay |
| Scratch stems, separated stems, mix previews, temp audio renders | Stage 08b (mix and master) is approved; the master mix and the stems the delivery lists stay |

Never deleted: the user's files and supplied sources, downloaded sources and official files (with their sidecars), everything under `ice/` that is a record (notes, measurements, contact sheets, reviews, the run log), the approved renders, the master and every deliverable, the one previous draft kept for comparison (section 8), and the source that re-renders the film. Only files this run created, inside the project folder or its scratch folder (`engine-choice.md` section 7.7), are deleted; nothing outside them. While a stage is still open, its intermediates stay, because changes re-render only the changed range (`render-performance.md` section 2).

Log each deletion in `ice/DIRECTION.md`: the path, the space freed, and the command that rebuilds it.
