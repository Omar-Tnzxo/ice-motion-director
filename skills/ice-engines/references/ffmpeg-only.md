# FFmpeg-only engine

> Merged from digitalsamba/claude-code-video-toolkit, nateherkai/herk-edit-kit, browser-use/video-use, Barty-Bart/motion-graphics, AbubakrChan/product-launch-motion (all MIT), heygen-com/hyperframes (Apache-2.0); ideas from remotion-dev/skills and imMamdouhaboammar/motion-graphics-skills (rewritten). Changes: merged, reworded, dashes removed.

Use FFmpeg alone for jobs that create no new motion design: trims, cuts, concatenation, speed changes, reframes, GIFs, conversions, alpha checks, masters. Edit decisions (what to cut, pacing, B-roll) belong to the ice-edit skill; loudness targets and mixing to the ice-audio skill. Requirement: FFmpeg and ffprobe on PATH, at or above the minimum in `versions.json` (`runtimes.ffmpeg`).

## 1. Cutting and joining

| Rule | Scope |
|---|---|
| Trimming at arbitrary points re-encodes; stream copy (`-c copy`) can silently drop video or freeze first frames when the seek point is not on a keyframe | Every trim |
| Select exact frame numbers in one pass for talking footage; encoding segments separately and concatenating drifted lip sync by about a frame at half the joins | Talking head, podcast, interview, anything with lip sync |
| Concatenating segments rendered by one renderer with identical settings may use the concat demuxer with `-c copy` | Chunked renders of graphic films |
| Per-segment extract then lossless concat avoids double-encoding when overlays are added later | Edit pipelines that re-encode once at the end |
| Do not put many `trim` branches in one filter graph (9 branches ran out of memory); cut each segment with `-ss` before `-i`, then concat | Long edits on small machines |
| Write long filter graphs to a script file (`-filter_complex_script`) | Many cuts |
| 30 ms audio fades at every join so joins do not click | Every audio join |

## 2. Speed and frame rate

- Speed: `setpts=PTS/<speed>` for video, `atempo=<speed>` for audio (0.5 to 2.0 per filter; chain for 4x or 8x). Prefer FFmpeg preprocessing over engine playback rates for extreme (above 4x, below 0.25x) or variable speed.
- Variable frame rate sources: convert to constant first (`-vsync cfr -r <fps>` or `-fps_mode cfr`).
- Footage for a seek-driven engine: re-encode all-intra (`-g 1 -keyint_min 1 -bf 0`) or with one keyframe per second (GOP = fps) so seeks do not freeze. Generated clips at 24 fps can be retimed with `setpts` and `fps=<target>` in the same pass.
- Footage at 30 fps inside a 60 fps render shows each frame twice; that is expected.

## 3. Reframing (cut-downs)

- Re-lay out per aspect ratio when the film is made from code (`platform-specs.md`). For existing footage: crop mode for talking heads and single subjects; blur-fill mode (frame over a blurred copy at quarter size, `boxblur=12:3`, then `eq=brightness=-0.12:saturation=1.15`) for slides and screen recordings; pad mode with the brand ground.
- Fitted modes shrink text: a 1080p source in 9:16 shows at about 56% scale; a modest zoom (about 1.3) trades edges for size; consider re-rendering with larger captions first.
- Even dimensions: `scale=trunc(iw/2)*2:trunc(ih/2)*2`.

## 4. HDR sources

HLG (`arib-std-b67`) or PQ (`smpte2084`) sources going to SDR need `zscale` plus `tonemap=hable` to Rec.709, otherwise the result looks oversaturated and blown out.

## 5. Useful recipes

| Job | Command shape |
|---|---|
| Probe | `ffprobe -v error -show_format -show_streams <file>` |
| Frame at a time | `ffmpeg -ss <t> -i <file> -frames:v 1 <out.png>` (`-ss` seeking is more portable than `select=` filters) |
| Contact sheet | `-vf fps=<n>,scale=<w>:-1,tile=<cols>x<rows>` |
| Animated `eq` | Add `eval=frame` or the expression runs once and nothing moves |
| Remux mastered audio into a render | `-map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest` |
| Silent track when none exists | `anullsrc` input mapped as audio |
| Silence detection | Measure the file with `loudnorm` in JSON mode, use its input threshold as `silencedetect` noise with `d=0.5`, merge silences closer than 0.2 s, floor starts and ceil ends to frames (edit decisions: the ice-edit skill) |
| Strip metadata | `-map_metadata -1 -c copy` |

Encoder settings, GIFs, alpha and review copies: `render-export.md`.
