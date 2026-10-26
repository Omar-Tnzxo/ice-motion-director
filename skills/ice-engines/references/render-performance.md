# Render performance and reliability

> Merged from heygen-com/hyperframes docs (Apache-2.0), edenfunf/reelmimic, howseen-ai/claude-motion-design, heygen-com/hyperframes general-video, Barty-Bart/motion-graphics, lemomo-ai/lemo-opuscar (MIT); ideas from imMamdouhaboammar/motion-graphics-skills and noncommercial sources (rewritten). Changes: merged, reworded, dashes removed.

## 1. What costs time

| Cost | Fix |
|---|---|
| `filter: blur()`, `backdrop-filter`, big blurred gradients, many shadowed elements | Fewer large blur layers; draw glows once on a canvas or as an image; one CSS declaration took a demo from 25.0 s to 9.8 s |
| Multipass media effects (Blur, Bloom, Kuwahara paint) | More than two full-frame multipass layers visible at once needs a playback check |
| Images far larger than delivery size | Resize near delivery dimensions |
| Reading layout and writing styles in the same frame | Precompute layout constants |
| Missing timeline registration in HyperFrames | Fixed 45 s wait on every render; add `data-no-timeline` or register |
| WebGL shader transitions | Page-side shaders run about 6x faster than the alternative path |
| VP9 WebM | CPU heavy; `--vp9-cpu-used` higher is faster |
| 4K | About 4x slower per frame |
| Motion blur | Multiplies time by the subframe count |
| Effect nodes on `self` or `backdrop` in a HyperFrames vfx chain | Pins the whole composition to one screenshot worker; add chains only to layers that need per-pixel work; give `.hf-vfx-in` an explicit pixel box |
| Agent overhead | About 60% of agent time in one measured pipeline went to screenshots and sleep-then-check loops |

Performance limits from one production kit (use as a starting budget): blur sigma at least 1 (below 0.8 is ignored), at most about 600 DOM nodes, 6 SVG filters and 1 video per frame; a 30-frame test render should take 3 to 12 s.

Method: change one expensive feature, record again, keep the version that moves the bottleneck.

## 2. During iteration

- Draft quality; inspect snapshots before another full render; resize large source media; simplify expensive filters; do not raise resolution or frame rate before it is needed.
- Plan the time points first and capture them in one call; fix a batch of issues, then capture once more. Crop from full-resolution frames instead of re-rendering zoomed views. Cache captures by a hash of the build files.
- Preview only the needed frames while builders work: no repeated full renders, no large worker pools.
- Re-render only changed shots or ranges; never delete all frames and redo the whole film. Feedback about one moment changes only that shot and re-renders that frame range.
- Small films build faster inline: up to about 6 short scenes (measured 5 scenes about 9 min inline vs about 21 min split across workers); above that, 2 to 3 scenes per worker in a single wave.

## 3. Concurrency budgets

- Each HyperFrames worker or capture browser costs about 256 MB; HyperFrames auto-sizes workers and drops to low-memory mode at 8 GB RAM or less.
- Snapshot processes: at most about 3 concurrent machine-wide (lock files, stale after 900 s, 3 retries on navigation timeout); 13 at once meant 80 to 200 Chrome processes and screenshot timeouts. At most 4 shot reviews per project at once; 6 builders measured fine on 12 cores and 32 GB.
- One full render at a time machine-wide by default (the bundled renderer's slot lock).

## 4. Long-running commands

- Run renders and captures in the foreground with a long timeout. Never background a command and guess with sleeps: background processes may be killed at the end of the turn and nobody reports their completion. Split renders that may exceed about 9 minutes into ranges and run each in the foreground; required outputs must exist before the turn ends. HyperFrames alternative: detached render with `HYPERFRAMES_RENDER_DETACHED=1`, then read the log and the file.
- Supervise long commands with a stall timeout and a hard timeout (suggested: browser audit 45 s stall and 180 s hard; tests 60 and 300; snapshots 60 and 300; full renders heartbeat-based). Retry only commands declared idempotent; never auto-retry publish, push, deploy, purchase or destructive work.
- Report progress by frame count in a readable log, not by file size.
- Kill only processes you started; never a broad pattern kill of Chrome or node (other agents use them).
- Only modify project files: no shell profile, environment or system settings changes.

## 5. GPU

- GPU use is three separate claims (browser raster, media decode, final encode): probe each. Software renderers (SwiftShader, llvmpipe, lavapipe) are slower and differ in pixels; use CPU fallback only with the user's permission and pin one mode for the whole film.
- Browser compositing is a separate switch from WebGL. The bundled `scripts/render-html.mjs` composites in software by default (`--disable-gpu-compositing`) because GPU compositing made frames depend on render history (`determinism.md` section 6); WebGL still runs on the GPU, and this default needs no permission. Measured cost, 2026-10-21, Windows 11, integrated AMD GPU, Chrome 149, best of 3 runs on a busy machine, software then GPU: a 640x360 CSS 3D test page 0.29 s vs 0.24 s per still (120-frame video 17.8 s vs 16.1 s), a 1080p 2.5D CSS film 1.12 s vs 0.87 s per still, so about 10 to 30 percent slower; the pilot run that found the problem saw no loss. Measure on the render machine before quoting a render time. `--gpu` (or `ICE_GPU=1`) buys that speed back only for drafts nobody compares frame by frame.
- WSL2 often falls back to software WebGL.
- Background removal and segmentation on CPU are slow (about 5 s per frame for one segmentation model; CPU matting about 2 fps): when there is no GPU, process only the part of the clip that is needed.
