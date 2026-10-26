# HyperFrames CLI: dev loop, preview, render

> Adapted from heygen-com/hyperframes skills/hyperframes-cli and docs (Apache-2.0, (c) 2026 HeyGen, Inc.). Changes: merged, reorganized, dashes replaced, cloud credentials and telemetry commands removed or gated. Flags are for the CLI version pinned in `versions.json` (`npm.hyperframes`); for another pinned version run `npx hyperframes <cmd> --help` first and trust it over this table.

## 1. Dev loop (order)

1. Scaffold: `npx hyperframes init <project>` (examples: blank, warm-grain, play-mode, swiss-grid, vignelli, decision-tree, kinetic-type, product-promo, nyt-graph; these are references, never defaults). Resolutions: landscape 1920x1080, portrait 1080x1920, square 1080x1080, plus 4K variants. `--video`/`--audio` auto-transcribe with a local Whisper model download (ask first).
2. Find the move: registry search (`hyperframes.md` section 9). Author by hand only once nothing fits.
3. Author against the composition contract. Inspect timing with `npx hyperframes timeline --json` (rows with absStart, absEnd, file; duration sources authored, media, default, inner, pending).
4. Lint while editing: `npx hyperframes lint`. Do not prepend a redundant lint before `check`.
5. Final gate: `npx hyperframes check` (section 3).
6. Snapshots of sub-compositions and proof times: `npx hyperframes snapshot --at <t1,t2,...> --describe false`. Always pass `--describe false` so frames are not uploaded to a hosted captioning model.
7. Preview: `npx hyperframes preview --background`; confirm HTTP 200 at `http://localhost:<port>/#project/<name>` (default port 3002); stop with `preview --stop`. Look at it at full speed: preview stutter does not mean render stutter.
8. Render only after the user approves the final preview. Passing checks is never a reason to render.
9. Verify the output file (section 6).

Deictic edits ("make this bigger"): `npx hyperframes preview --context --json --context-fields selection`, use `selection.target.hfId`; on `no-selection` ask the user to click the element. Never infer the target from a screenshot when the CLI can give a stable id.

## 2. Snapshot and keyframe proof

- `snapshot --at` times: first frame, proof poses, final minus hold, exact final. For a camera cut inside one canvas, check the last frame before the cut `(Math.ceil(cut * fps) - 1) / fps` and the first after (`--no-end`).
- `snapshot --zoom "#selector"` gives a real 3x crop; never CSS zoom or a viewport resize.
- `npx hyperframes keyframes .` with `--json`, `--runtime all`, `--shot`, `--layout strip`, `--ghost --angle` shows motion: even ghost spacing means constant speed, clustered ghosts mean slow-in or settle, large gaps mean fast travel. Trust painted pixels over logs; a helper-selector shot is not proof.
- Inspect the opening 30 seconds and every reported problem time at full resolution; zoom into fine geometry, text and WebGL edges instead of judging a contact sheet alone.
- Treat tiny unstyled content, canvas-sized icons, missing hero elements or timeline-registration timeouts as render-blocking mount defects.

## 3. `check` (browser gate)

`check` runs lint first and skips the browser entirely on a lint error: then it reports `0 sample(s)` and `0/0 text checks`, which looks clean but means nothing ran (`browserSkipped: true`, empty layout, motion and contrast sections). Fix lint errors first.

| Flag | Default | Use |
|---|---|---|
| `--samples` | 9 | Midpoint samples across the duration |
| `--at` | none | Extra sample times |
| `--at-transitions` | off | Also sample every tween start and end (catches transient overlaps at seams) |
| `--tolerance` | 2 px | Allowed overflow |
| `--no-contrast` | off | Skip WCAG contrast |
| `--strict` | off | Warnings fail the gate |
| `--snapshots` | off | Save sampled frames |
| `--caption-zone "x0=0;y0=.82;x1=1;y1=1;severity=error;seek=.25,1"` | none | Gate a caption band |
| `--frame-check` | off | Flags media breaching the frame beyond max(120 px, 6% of the min canvas dimension) |

What it audits: runtime console errors, failed requests, layout (overflow, clipping, held overlaps, occlusion by video alpha, coordinate-frame drift), `*.motion.json` assertions, WCAG AA contrast (4.5:1 normal text, 3:1 large text of 24 px+ or 19 px+ bold, sampled at 5 grid points, with a `suggestedColor`).

Severity rules: single-sample transients demote to info; a held `content_overlap` is an error; held `canvas_overflow` of 5% or more is a warning; text under transparent video: a word 80% hidden, or two neighbouring words each half hidden, is an error; a single glyph (digit, `$`, `.`) flags at any coverage. `sweep_static`: a composition of 3 s or more with no visible change fails; mark intended stills with `data-no-timeline`. Fix a reveal that completes early by spreading it or keeping one meaningful element alive, never with a token slow drift (motion policy: the ice-motion skill).

Escape hatches silence more than they look: `data-layout-allow-occlusion` also silences the contrast gate for that subtree. Before adding `data-layout-allow-overflow`, snapshot and confirm. Use the narrowest hatch on the specific participant.

Motion sidecar `<file>.motion.json`: `appearsBy` (opacity at least 0.5 by a time), `before`, `staysInFrame`, `keepsMoving` (default `maxStaticSec` 2). A missing selector fails loudly.

`check` is necessary, not sufficient: it passes compositions that render nothing (a blank plot raises no error) and canvas shader defects can survive it. Compare the live preview and the decoded render at matching times. Look at the PNGs before tuning automated warnings.

`doctor --json` always exits zero: gate on its payload (`.ok`).

## 4. Render

`npx hyperframes render [--output <file>] [flags]`. Read the summary's second line: `beginframe` vs `screenshot` capture, GPU mode, stage timings. `screenshot` plus `software gpu` on Linux is the slow path. macOS and Windows use screenshot capture; Linux chrome-headless-shell uses BeginFrame.

| Flag | Values and notes |
|---|---|
| `--quality` | `draft` while iterating, `looks` (CRF 16 on the standard preset; the CLI default in the pinned version; older docs call it `standard`) for the first real encode, `delivery` for final. Older prompting docs name the ladder draft / standard / high: read `--help` of the pinned version |
| `--fps` | 1 to 240 or a rational (`30000/1001`); default the composition's `data-fps`, else 30. 60 fps doubles render time; use it only when the source or destination needs it |
| `--format` | `mp4`, `webm` (VP9, alpha capable), `mov` (fixed ProRes 4444, alpha; `--crf` and `--video-bitrate` rejected), `gif` (fps capped at 30, prefer 15, no audio), `png-sequence`, `hls` (segment default 4 s, 1 to 60; SDR only, no GPU encode, not on cloud) |
| `--crf` | 0 to 51, or `--video-bitrate`, never both |
| `--video-frame-format png` | For UI recordings, screen captures and color-sensitive footage |
| `--hdr` / `--sdr` | HDR is MP4 only (H.265 10-bit PQ/HLG, source-detected); use software encoding for HDR10 delivery |
| `--resolution` | Supersample to an integer multiple of the authored size, same aspect ratio; MP4 only, not with HDR or alpha. `4k`/`landscape-4k` 3840x2160, `portrait-4k` 2160x3840, `square-4k` 2160x2160 |
| `--workers` | 1 to 24; each spawns Chrome (about 256 MB); auto-sized, low-memory mode at 8 GB RAM or less; `--workers 1` for bit-exact output or video layers |
| `--gpu` | Hardware GPU; on macOS WebGL grounds may need `PRODUCER_BROWSER_GPU_MODE=hardware` |
| `--docker --strict` | Reproducible render with pinned Chromium, fonts and FFmpeg |
| Timeouts | `--browser-timeout` default 60 s; `--player-ready-timeout` default 45000 ms; `--protocol-timeout` default 300000 ms, capped at 30 min. Heavy projects: `--player-ready-timeout 180000 --browser-timeout 180` |
| `--vp9-cpu-used` | -8 to 8, higher is faster |
| `--batch rows.json --output "renders/{name}.mp4"` | No `--variables` with `--batch`; `--batch-concurrency` default 1, raise only after one real render is stable; `--batch-fail-fast`; done means the manifest has no failed rows and every output exists, is non-empty, and has a plausible duration |

Best-quality master recipe recorded in a source: `render --quality delivery --crf 10 --resolution portrait-4k --video-frame-format png` (about 3 to 4x the 1080p render time). Higher output resolution adds no detail to low-resolution media; a higher frame rate does not improve motion authored for a lower cadence.

Long renders: run in the foreground with a long timeout, or detach with `HYPERFRAMES_RENDER_DETACHED=1` in its own process group and then check the log and the output file. Never background a render and guess with sleeps.

Sandboxed Chrome (for example a macOS seatbelt sandbox blocking the browser): do not build a substitute rasterizer (ImageMagick, PIL or SVG frame pipelines). The deliverable is the checked composition plus a blocker note; write the summary as soon as the blocker is identified.

Provenance metadata tags (`hyperframes_renderer`, `hyperframes_version`) can be stripped with `ffmpeg -i out.mp4 -map_metadata -1 -c copy clean.mp4`; never use them as an authenticity or licensing check.

## 5. Special outputs

- Slideshows: never `hyperframes render` a deck into MP4 (it renders only the first composition and silently truncates). Serve with `hyperframes present`.
- Figma imports: freeze assets first; never leave a Figma URL in the composition.
- Compare: `compare` (max 16 variants) and `grade-compare` (up to 16 cells, 4 per row) are review surfaces, not quality gates.
- Beats: `hyperframes beats` needs local music marked `data-timeline-role="music"`; a track without a steady beat gets no beat file (beat-sync policy: the ice-audio skill).
- Cloud, Lambda and Cloud Run renders spend money or credits on the user's account and upload the project: only on the user's explicit request; credentials from environment variables only, never pasted in chat. Lambda: archive max 200 MB, 15 min limit, SDR only; never ignore all of `assets/` in `.hyperframesignore`.
- Publish is private by default; `--public` only on request; a publish is the user's action, never automatic.

## 6. Verify the output

- The file exists and is non-empty.
- `ffprobe -v error -show_format -show_streams <file>`: duration equals the root `data-duration`; fps, resolution and codec match the brief.
- Alpha files: look for `ALPHA_MODE=1` in ffprobe tags for WebM (a pix_fmt-only check gives false negatives) and inspect one decoded frame over a contrasting background (`render-export.md` section 5).
- Watch the first and final seconds, captions, cuts and the most complex transition in the decoded file. The preview proves the project plays; the exported file proves the delivery. Full delivery gates: the ice-qa skill.
