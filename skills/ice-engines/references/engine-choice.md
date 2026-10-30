# Engine choice

Pick one primary engine per film before any code is written. Log the choice in `ice/DIRECTION.md` with its reason (see the ice-direction skill, decision log). Several runtimes may live inside one primary engine (for example Lottie, Three.js and GSAP inside one HyperFrames composition); the primary engine owns the clock and the render.

## 1. Decision procedure (first match wins)

| # | Condition (read from `ice/BRIEF.md`) | Primary engine |
|---|---|---|
| 1 | Output format is Lottie JSON, an app or web UI animation, a loader or an icon | Lottie (authoring belongs to the ice-lottie skill) |
| 2 | Job is only cutting, trimming, reframing, loudness, concatenation, speed change, GIF or format conversion of existing media | FFmpeg only |
| 3 | User or project already uses Remotion, or asks for it by name | Remotion (license check, section 3) |
| 4 | User or project already has a working deterministic renderer (HyperFrames project, `seek(t)` page, Remotion project) | Keep it. Migrate only for a measured benefit (preview speed, reliable export, validation, catalog, audio, diagnostics), never to adopt a newer runtime |
| 5 | Film is a painted, hand-drawn, pixel, paper or cel art style where every frame is drawn procedurally | Canvas 2D or p5 inside the HTML capture harness |
| 6 | One frame-perfect page per film with heavy per-pixel work, custom subframe motion blur, or a single-file deliverable that must open by double click | HTML canvas with Playwright and FFmpeg |
| 7 | A real 3D object, occlusion, lighting or camera through space is the hero | Three.js inside HyperFrames (adapter) or inside the HTML capture harness |
| 8 | Every other film made from scratch: product launch, app ad, brand film, logo sting, kinetic type, data story, social short, hype promo, UI walkthrough, music video, industry spot, explainer, captions and overlays on footage | HyperFrames |

HyperFrames is the default because it adds a lint and browser `check` gate, snapshots, Studio preview, an audio mix graph, a registry of blocks and seek adapters for every runtime. It is not mandatory for brief-only or critique-only jobs, environments that cannot run it, or needs it does not support; write the reason for any fallback.

The table picks the engine; whether it can run here is settled by section 7. When the chosen engine is not installed and cannot be (network off, no drive with room, or the install failed), walk the fallback ladder in section 7.4: rung C renders the same film as an HTML capture page with the bundled `scripts/render-html.mjs` and the user's installed browser, with nothing installed, and section 7.5 names the gates that replace HyperFrames lint and `check`.

## 2. Engine table

Runtime minimums (Node, Python, FFmpeg) and every exact package pin in the Needs column come from `versions.json`; never write them from memory.

| Engine | Best for (film types) | Avoid when | Needs | Render time (sources' measurements) | License |
|---|---|---|---|---|---|
| HyperFrames | All film types in ice-film, explainers, captioned footage, overlays with alpha, music-synced cuts | Output must be one double-click HTML file; the machine cannot run headless Chrome | Node, FFmpeg, Chrome (pinned by CLI) | 1080p30 draft fast; parallel workers about 256 MB each; 4K about 4x slower per frame | Apache-2.0 (HeyGen). GSAP it loads is under the GSAP Standard "No Charge" license (free incl. commercial, not OSI) |
| Remotion | Teams already on React; Studio-editable templates; data-driven batch videos; maps with Cesium; SaaS render APIs | For-profit company of 4+ employees without a Remotion Company License | Node, React, exact `remotion` versions | Similar to HTML capture; Lambda for scale | Remotion License: free for individuals, for-profit companies with at most 3 employees, non-profits and evaluation; Company License required for 4+ employees (remotion.pro/license). Nobody may sell a derivative of Remotion itself |
| HTML canvas with Playwright and FFmpeg | Single-page `renderAt(t)` films, painted styles, custom motion blur, frame-locked remakes, offline HTML deliverables | You need lint, audio mix graph or registry blocks (use HyperFrames) | Node, FFmpeg, an installed Chrome, Chromium or Edge (nothing to install; `playwright-core` optional) | About 0.15 to 0.25 s per frame at 1080p for light DOM; 1 to 1.5 min wall time per film second at 8 subframes; painted p5 150 to 350 ms per frame | Bundled `scripts/render-html.mjs` MIT |
| Three.js | Hero 3D object, product turntable, camera flight, globe | Flat UI tours (spend 3D on one hero or lockup shot) | `three` pinned, WebGL (GPU or SwiftShader) | About 7 to 11 fps at 1080p on a laptop GPU; `--scale` does not cut WebGL cost | MIT |
| Lottie | Logos, icons, loaders, UI micro-interactions, character bodies inside a film | Effects outside the Lottie feature set (blur, glass, true 3D, displacement) | lottie-web or Skottie player | Light | lottie-web MIT; authoring rules in ice-lottie |
| FFmpeg only | Edits, cut-downs, reframes, speed ramps, GIFs, alpha checks, masters | Any new motion design | FFmpeg | Fastest | LGPL/GPL builds; use as a tool, do not redistribute |
| p5 (with p5.brush) | Watercolour, gouache, charcoal, crayon, handwriting, painted portraits | Crisp brand type, photoreal output, footage over about 10 s (5 to 20 s per frame) | `p5`, `p5.brush` pinned, HTML capture harness | Slow; a 30 s painted film took 15 to 30 min | p5 LGPL-2.1 (load from npm, do not vendor), p5.brush MIT |

## 3. Remotion license gate

Before routing to Remotion, read the brief slot "commercial or not" and the client type. If the film is made for or by a for-profit organization with 4 or more employees, tell the user in plain words that Remotion needs a paid Company License for that use and offer HyperFrames or the HTML capture harness, which avoid it. A license change is announced for Remotion 5.0: re-check the terms at the runtime date before relying on this table. Log the answer.

## 4. Runtime pick inside a composition

| Need | Runtime |
|---|---|
| Layout and shaped text (including Arabic) | HTML and CSS in the DOM |
| Paths, logos, masks, diagrams | SVG |
| Dense procedural 2D, particles, grain | Canvas 2D |
| Sequencing, masks, camera-like moves, stagger, motion paths | GSAP (default for about 95% of motion work) |
| After Effects exports, character bodies | Lottie |
| Real depth, occlusion, lighting | Three.js |
| Lightweight tween library | Anime.js v4 |
| Repeated motifs, shimmer | CSS keyframes (finite) |
| Native element animations | WAAPI |
| GPU canvases, shaders | TypeGPU or WebGL (needs WebGPU or SwiftShader) |

Never draw Arabic text in Canvas when shaping is unreliable; keep it in DOM or SVG (see the ice-arabic skill).

## 5. Reuse ladder (stop at the first rung that works)

1. Code already in the user's project.
2. A HyperFrames registry block or component (search first, see `hyperframes.md` section 9).
3. A HyperFrames adapter or CLI feature.
4. Native HTML, CSS, SVG, Canvas, Web Audio, WebGL.
5. GSAP.
6. Three.js, only for real depth.
7. Custom infrastructure, last.

Libraries that animate only in real time (Spline runtime, Unicorn Studio, live framer-motion or CSS transitions, interaction spring solvers) cannot be seeked: port the idea to `renderAt(t)`, never run them live. Seekable libraries: GSAP (paused timeline), Anime.js (`autoplay: false`, seek in ms), Theatre.js (`sheet.sequence.position = t`), lottie-web (`goToAndStop`), Rive runtime (seek-deterministic, but authoring is GUI only, so an agent cannot author a Rive file).

## 6. Python engines (only when the user's project already uses them)

| Engine | Use | Rules |
|---|---|---|
| moviepy 2.x | Sub-30 s spots in one `build.py`, text over generated clips, no Node | Render text with PIL to transparent PNG (TextClip `method='label'` clips ascenders and descenders), pad = max(20, size // 4), cache by content hash; use `subclipped`, `with_duration`, `with_start`, `with_position`, `with_effects`; `ColorClip` takes RGB tuples; always set `size=(W, H)` on `CompositeVideoClip`; Pillow at the version in `versions.json` (10 or newer is required for `Image.Resampling.LANCZOS`) |
| Manim | Math and diagram explainers | Iterate at `-ql` (854x480@15), `-qm` 1280x720@30, `-qh` 1920x1080@60; all concatenated clips share resolution, fps and codec |
| Blender (Cycles) | Photoreal 3D product shots | Render a PNG sequence from a script, then mux with FFmpeg; type and grain as an HTML overlay pass |

## 7. Prerequisites: check order, install, fallback ladder

This section is the single home of tool prerequisites for every route; other skills point here. Free tools, models and packages a route needs are installed by Ice itself, without a question, at their exact pins (7.6), after a disk space check (7.7). A question is asked only for a paid service, anything that needs an account or a sign-in, or spending. Ice never changes a system setting (PATH, execution policy, long paths) and never runs the operating system's package manager: a system tool (7.3) is one plain step for the user.

### 7.1 What each route needs

| Route | Always | Sometimes (the workflow says when) |
|---|---|---|
| `ice-film` | Node, FFmpeg, Chrome, Chromium or Edge; Python with `ice-qa/scripts/requirements.txt` | The engine package from section 1 |
| `ice-explainer` | Node, FFmpeg, Python with `ice-qa/scripts/requirements.txt`, a local speech-to-text model with word timestamps | TTS, only if the user chose it |
| `ice-remake` | Node, FFmpeg, Chrome, Chromium or Edge; Python with `ice-qa/scripts/requirements.txt` (numpy and opencv-python-headless, also used for camera and color measurement) | The engine package from section 1 |
| `ice-edit` | FFmpeg and ffprobe, Node, Python with `ice-qa/scripts/requirements.txt`, local speech-to-text | Playwright for motion overlays |
| `ice-lottie` | Node | A browser for previews |
| `ice-ideas` | Nothing | Nothing |

Python is required whenever a film is delivered: the richness floor is measured by `ice-qa/scripts/film_gate.py` (Python, numpy, opencv-python-headless), and a richness measure left unmeasured blocks delivery (the `ice-qa` skill, hard release gates). Without Python the film can be planned, built and reviewed by eye, but not delivered: give the plain step of 7.3 once, and never replace the measure with an estimate.

### 7.2 Check order (once at intake, in this order; record every result in `ice/DIRECTION.md`)

1. Node: `node --version`, at or above `runtimes.node.minimum` in `versions.json` (the zero-install renderer needs the global WebSocket of that version).
2. FFmpeg and ffprobe: `ffmpeg -version` and `ffprobe -version`, at or above `runtimes.ffmpeg`.
3. Browser. Windows PowerShell: `Get-Item "$env:ProgramFiles\Google\Chrome\Application\chrome.exe", "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe" -ErrorAction SilentlyContinue`. macOS: `ls "/Applications/Google Chrome.app" "/Applications/Microsoft Edge.app"`. Linux: `command -v google-chrome google-chrome-stable chromium chromium-browser microsoft-edge`. A browser in another folder: the user gives its path; set it as `ICE_CHROME` for the renderer and as `CHROME_PATH` for the `ice-qa` scripts (PowerShell `$env:ICE_CHROME = "<path>"`, cmd `set ICE_CHROME=<path>`, macOS and Linux `export ICE_CHROME="<path>"`; the same forms for `CHROME_PATH`).
4. The engine chosen in section 1, inside the film project: `npm ls hyperframes` (or `remotion`, or `playwright-core`). Installed at the pinned version: use it. Another version already pinned by the project: keep it. Missing: section 7.4.
5. Python, on every route that delivers a rendered film (7.1): `python --version` (macOS and Linux: also `python3 --version`), at or above `runtimes.python`. Python packages: each skill's `requirements.txt`. A compatible version that is already installed may be used as it is; record each such package and its version in the delivery note. Anything that must be installed goes into a project virtual environment (`python -m venv .venv`); never install into the system Python. Music by code needs only numpy (the `ice-audio` skill, `references/music-by-code.md` section 1).
6. Network: never a question. Installs (7.6) and free downloads use it unless `ICE_OFFLINE=1` is set, `downloads` is `off` in the user's `sources.json` (`ice-assets/references/sourcing-and-licenses.md` section 0, "Standing consent"), or the user's own words in this conversation ask for no installs or downloads; then every step that needs the network takes its fallback (7.4 rung C), logged in `ice/DIRECTION.md`.

### 7.3 System tools: one plain step for the user

These tools install system-wide through the operating system's package manager, which may ask for an administrator password, so Ice never runs these lines itself. When one is missing: give the user the one line for their operating system, once, in plain words (never as a four-option question), take the free fallback meanwhile (7.4 rung C, FFmpeg-only work, or for Python: build and review now, hold before delivery), and go on with the tool once the user says it is installed. Record the step and the fallback in `ice/DIRECTION.md` and the delivery note.

| Need | Windows (PowerShell or cmd) | macOS (Homebrew) | Ubuntu or Debian | Fedora | Arch |
|---|---|---|---|---|---|
| Node.js LTS | `winget install --id OpenJS.NodeJS.LTS -e` | `brew install node@24` | nvm from its official repository, reopen the shell, `nvm install --lts` (the apt package is too old on Ubuntu 24.04) | `sudo dnf install nodejs` (older releases: nvm) | `sudo pacman -S nodejs npm` |
| git | `winget install --id Git.Git -e` | `brew install git` | `sudo apt install git` | `sudo dnf install git` | `sudo pacman -S git` |
| FFmpeg | `winget install --id Gyan.FFmpeg -e` | `brew install ffmpeg` | `sudo apt install ffmpeg` | `sudo dnf install ffmpeg-free` | `sudo pacman -S ffmpeg` |
| Chrome or Chromium | `winget install --id Google.Chrome -e` | `brew install --cask google-chrome` | Chrome from the official .deb, or `sudo snap install chromium` | `sudo dnf install chromium` | `sudo pacman -S chromium` |
| Python 3 | `winget install --id Python.Python.3.13 -e` | `brew install python` | `sudo apt install python3 python3-pip python3-venv` | `sudo dnf install python3 python3-pip` | `sudo pacman -S python python-pip` |

OS notes: on Windows open a new terminal after a winget install so PATH updates; if PowerShell blocks `npx`, use `npx.cmd`; deep folders can pass the 260-character limit (`git config --global core.longpaths true` helps git; the OS-wide setting is the user's choice). macOS: Homebrew lives in `/opt/homebrew` on Apple Silicon. Fedora's `ffmpeg-free` lacks some patented encoders: if H.264 export fails, say so and offer a VP9 or AV1 export, or the full FFmpeg from the distro's extra repository. WSL: install tools inside WSL only when the agent itself runs inside WSL.

### 7.4 Fallback ladder when the chosen engine is not installed (walk it top down, never improvise)

| Rung | Situation | Tell the user | Do |
|---|---|---|---|
| A | Engine installed at the pinned version | Nothing | Build with it |
| B | Engine missing, network possible | One plain line as it happens: the engine's name, pinned version and size, and that it goes into this project only (7.6) | Install it without a question (7.6): the pinned commands below, then check the installed version. HyperFrames' pinned Chrome build is a second install of the same kind. Record both |
| C | Network off (7.2 step 6), no drive with room (7.7), or rung B failed after one retry | The film is rendered by the bundled HTML renderer with their installed browser and nothing is installed; the look is the same; the HyperFrames lint, `check`, Studio preview and registry blocks are replaced by the gates in 7.5 | The zero-install steps below |
| D | No Chrome, Chromium or Edge, and the user cannot install one | Motion design needs a browser to render; offer the browser line from 7.3 | Edits and conversions continue with FFmpeg only (section 1 row 2). Never build a substitute rasterizer (ImageMagick, PIL or SVG frame pipelines); stop and report the blocker |

Rung B commands (exact versions from `versions.json`, `npm`; never `@latest`, never an `npx` that downloads a package):
- HyperFrames: `npm install --save-dev --save-exact hyperframes@<npm.hyperframes>`; then `npm ls hyperframes` must print that version. The browser: `npx hyperframes browser ensure` (it runs the project's pinned CLI, so it is not an unpinned `npx`). Guide: `hyperframes.md`.
- Remotion: the license gate (section 3) first, then the exact versions in `remotion.md`.
- Optional Playwright driver for the HTML renderer: `npm install --save-exact playwright-core@<npm.playwright-core>`. Not needed when a local browser exists.

Rung C, zero install, step by step:
1. Confirm that 7.2 steps 1 to 3 passed (Node, FFmpeg, a browser). Nothing else is needed: `scripts/render-html.mjs` carries a built-in Chrome DevTools driver and finds Chrome, Chromium or Edge in the usual folders (or uses `ICE_CHROME`).
2. Write the film as one page that follows the page contract in `html-canvas-capture.md` section 2 (`window.renderAt(t)`, `window.__ready`, `window.DEMO`). Libraries come from files inside the project; offline and not in the project means the motion is written in plain JavaScript from `t`, never fetched.
3. From the film project folder, proof stills: `node "<ice-engines>/scripts/render-html.mjs" film/index.html --stills <proof times>`. Its first four lines name the served folder, the driver and browser, the compositing mode (software by default, deterministic) and the browser version: copy them into `ice/DIRECTION.md`. It serves the project folder that holds `ice/`, so the page reaches `assets/`; a `[missing file]` stop names the file and the `--root` fix (`html-canvas-capture.md` section 3).
4. Look at the stills and fix them, then a draft: `node "<ice-engines>/scripts/render-html.mjs" film/index.html --scale 0.5 --fps 30 --crf 23 --noaudio --out <draft path>`.
5. Run the replacement gates in 7.5, then the final with the mastered audio (`--audio <master.wav>`) and the settings in `html-canvas-capture.md` section 4.
6. Log in `ice/DIRECTION.md`: engine "HTML capture, zero install", the rung and its reason, the driver and browser lines.

Never on rung C: copy `playwright-core` from an npm cache or another project, install anything globally, run an unpinned `npx`, or write another renderer.

### 7.5 Gates on the HTML capture route (what replaces the HyperFrames gates)

| HyperFrames gate | On the HTML capture route |
|---|---|
| `npx hyperframes lint` (composition contract) | The `ice-qa` skill's `scripts/lint.mjs` on the page (it seeks `renderAt` and `seek` pages), plus the checklist in `determinism.md` read line by line against the page |
| `check`: console errors, failed requests | `render-html.mjs` stops on page errors and prints `[console error]` lines, failed requests and `[missing file]` lines: zero page errors, no failed request and no missing file before a draft |
| `check`: layout, overflow, contrast, static sweep, motion sidecars | Stills at 9 evenly spaced times plus every transition start and end, judged with the `ice-qa` skill's frame checks; motion and freezes with its motion and frozen-time scripts on the draft |
| `snapshot --at` | `render-html.mjs --stills <times>` |
| Seam gate with a ledger | The `ice-qa` skill's `references/seam-gate.md`; its script seeks `window.__seek`, which must apply synchronously, so alias it to a synchronous `renderAt`. An async `renderAt` page is checked with stills one frame either side of each cut |
| Studio preview | The page's own preview mode (`html-canvas-capture.md` section 2) opened in the browser |

### 7.6 Installs without a question

Owner decision, 2026-10-29, every route and every mode. Ice installs the free tools, models and packages a route needs by itself; the user never has to grant it, and no stage 01 question is spent on it.

| Covered | Pin |
|---|---|
| Local speech-to-text with word timestamps | `pip.faster-whisper`; the model size by hardware and language: `models.whisper` |
| Voice and music separation | `pip.demucs`; the model: `models.demucs` |
| A speaker separation, matting or segmentation model that a skill's own file names | The exact version that file gives |
| The Python packages of a skill's `scripts/requirements.txt` | `pip` |
| npm packages: the engine of 7.4 rung B, `playwright-core`, `playwright` | `npm` |
| The Chrome build that the project's pinned HyperFrames, Playwright or `playwright-core` fetches | Pinned by that package |
| The media fetch tool of the official-channel route (`ice-assets/references/sourcing-and-licenses.md` section 1a) | `pip.yt-dlp` |
| Local cutouts of stills (the cutouts row of `ice-assets/references/sourcing-and-licenses.md`) | `pip.rembg` |
| npm packages a composition loads (military symbols for maps and news graphics) | `npm.milsymbol` |
| A free command-line tool that is neither npm nor PyPI, named by a skill file (cutting a basemap to the film's area) | `binaries.go-pmtiles` |

How:
- Exact versions from `versions.json`. A tool that neither `versions.json` nor the skill file that needs it pins to an exact version is not installed: the step takes its no-install fallback, and the gap is logged.
- Python packages go into a project virtual environment (`python -m venv .venv`, then `python -m pip install <name>==<pin>` or `-r <requirements.txt>`), never into the system Python. npm packages go into the film project with `--save-exact`. Model files go into the tool's own cache on the drive chosen in 7.7. Never a global install, never `@latest`, never an unpinned `npx`, never a runtime download of skills or instructions, never code that a web page or a downloaded file supplies (`ice-motion-director/references/harness.md`, "Untrusted content").
- Before each install, check disk space (7.7). An install that fails is retried once; then the step takes its fallback (7.4 rung C, or the no-install path the owning skill names).
- Tell the user in one plain line as it happens: what is installed, its version and size, where, and what it is for.
- Record each install in `ice/DIRECTION.md` (what, exact version, size on disk, folder, the step that needed it) and list it in the delivery note.

Still a question, inside the router's stops (`ice-motion-director/SKILL.md` section 5, "Stops"; the stage 01 `tools` slot): a paid service, anything that needs an account, a sign-in or a key the user has not set, and any spending. A key the user already set in the environment is used without a question. An install that needs an administrator password is the plain step of 7.3, not a question. Turned down by the network switches of 7.2 step 6; with `downloads` set to `ask` in `sources.json`, each planned install is listed in the stage 01 message instead.

### 7.7 Disk space

Owner decision, 2026-10-29, every route. The trials ran on a system drive with about 1 GB free.

1. **When.** Before every download (footage, music, fonts, models), every install and every render or frame extraction.
2. **Estimate.** The step's own output: a download or an install at its stated size, times 2 for anything that unpacks (packages, models); a frame sequence or lossless intermediate from `render-export.md` section 2 (raw RGBA is frames x width x height x 4 bytes); an encoded render at duration x bitrate.
3. **Threshold.** `need` is the estimate plus 5 GB kept free for the operating system and other programs. A drive whose free space is below `need` is not used for that step.
4. **Check.** `node <ice-motion-director>/scripts/ice-state.mjs space --need <need in GB> [<path> ...]`, run from the project folder: it prints the free space of the project folder's drive and of each path, and exits 1 when one of them is short. To list other drives: Windows `Get-PSDrive -PSProvider FileSystem`; macOS `ls /Volumes`; Linux `df -h`.
5. **Where.** First the project folder. When its drive is short, a drive that has room: the heavy intermediates (frame sequences, proxies, chunks, separated stems) go into one scratch folder there, and the caches follow through the variables the tools honour, set for that command only (never in a shell profile or a system setting): `HF_HOME` (Hugging Face models), `TORCH_HOME` (torch weights), `PIP_CACHE_DIR`, `npm_config_cache`, `PLAYWRIGHT_BROWSERS_PATH`, and the temp folder (`TEMP` and `TMP` on Windows, `TMPDIR` on macOS and Linux). The project virtual environment may sit on that drive too. The `ice/` run files, the sources and the finals stay in the project folder.
6. **No drive has room.** First delete the rebuildable intermediates (`render-export.md` section 9). Still short: tell the user in one plain line how much space the step needs and on which drive, take the lighter path meanwhile (a smaller draft, fewer stills, a smaller model), and hold that step.
7. **Record** each check (path, free GB, need) and the chosen drive and folders in `ice/DIRECTION.md`.

Source size: long sources are downloaded at the output resolution, not above it (`ice-assets/references/sourcing-and-licenses.md` section 5).


## Lottie as an engine (playback and capture)

> Merged from heygen-com/hyperframes adapters (Apache-2.0), AbubakrChan/product-launch-motion and diffusionstudio/lottie (MIT). Changes: merged, reworded, dashes removed.

This file covers only how Lottie plays inside a deterministic render. Authoring Lottie JSON (spec map, slots, controls, Skottie compatibility, SVG conversion, recipes) belongs to the ice-lottie skill: open that skill for any Lottie deliverable.

### 1. Players

| Player | Use | Pin |
|---|---|---|
| lottie-web | Lottie inside HyperFrames or an HTML capture page | lottie-web (bodymovin) at the exact version in `versions.json`, vendored or a pinned CDN URL |
| Skottie (canvaskit-wasm) | Previewing and exporting standalone Lottie work; closest to mobile players | canvaskit-wasm full build at the exact version in `versions.json` (the ice-lottie player uses the same one) |
| Remotion Lottie component | Lottie inside Remotion | Same version as the project's Remotion packages |

### 2. Deterministic playback rules

- Local JSON only; no remote `path` URLs; no async registration.
- `autoplay: false`. Seek with `goToAndStop(frame, true)` from the engine time (HyperFrames pushes the instance to `window.__hfLottie` and seeks it for you).
- Always set `loop`: lottie-web treats a missing `loop` as true, and a numeric loop count does not repeat under seeking.
- No playback-rate scaling in HyperFrames: bake non-default speed into the asset.
- There is no per-animation start offset: author the whole performance as one Lottie, or cue by shifting keyframe times inside the JSON, not by the layer start-time field.
- An animated multi-dimensional layer transform can silently blank the whole layer in lottie-web: split dimensions or verify at several frames.
- Lottie frame math: `ip` inclusive, `op` exclusive (`ip: 0, op: 90, fr: 60` renders frames 0 to 89). Map engine time to Lottie frames with the file's own `fr`.
- Characters: the Lottie owns the body, GSAP owns everything around it; read beat times from Lottie `markers`; when a walk cycle travels, match travel speed to the stride or the feet slide. License every character; never ship one copied from a site.

### 3. Render-risky features

Treat blur, bloom, glass, chrome, dither, true 3D and displacement as renderer-risky in Lottie; bake counters, particle offsets, orbit math and expression-like systems to keyframes before relying on Skottie; path morphs need compatible vertex structures. Details and fixes: the ice-lottie skill.


## Canvas 2D and p5

> Merged from alexgreensh/anidoodle (Apache-2.0), edenfunf/reelmimic engine-kit (MIT), heygen-com/hyperframes-community-skills p5 skills (Apache-2.0), alchaincyf/huashu-art-motion (MIT); ideas from imMamdouhaboammar/motion-graphics-skills and noncommercial sources (rewritten). Changes: merged, reworded, dashes removed.

Both run inside the HTML capture harness (`html-canvas-capture.md`) or as a HyperFrames canvas layer. Style choice (watercolour, riso, pixel, paper cut-out, cel, crayon): the ice-styles skill.

### 1. Canvas 2D contract

- One pure function paints every frame: `renderFrame(frame, env)` or `renderAt(t)`. No values kept between calls, no timers.
- Randomness only from a seeded generator or a hash of a stable key (`hash()`, `rnd(key)`, `s.rand()`, `s.noise()`). Prove determinism: draw the same frame twice and compare hashes (a reproducible still is the receipt).
- One file per shot; shot files only call the shared library and the cast; they never redraw a character's body parts themselves. Shared files (characters, palette, master) are read-only for shot builders; shared-file fixes are additive and backward compatible.
- Everything drawn by code: no image files you did not generate, no network at render time.
- Characters drawn in code: limbs always attached; original designs only, never an existing IP character.
- Budget: keep the median frame well under 150 ms (p95 under 200) for light art; painted engines up to about 2.5 s per frame.
- Canvas shadow blur, offsets and filters ignore the transform: multiply them by device pixel ratio times zoom.
- Scale the whole drawing to fill the frame rather than redrawing it per format.
- Pick one unit for time (seconds) and keep it.
- A blank page is usually a name declared twice.
- Pixel reads: `getContext("2d", { willReadFrequently: true })`.
- Arabic and other complex scripts: never draw them in Canvas when shaping is unreliable; keep text in DOM or SVG above the canvas (see the ice-arabic skill).
- Transparent output: skip the paper fill; carry texture in the marks.
- Dark gradients band in 8-bit encoding: overlay a fixed noise tile (alpha 7/255 or less) in device pixels, or encode with grain-friendly settings (`render-export.md` section 3).

### 2. p5 and p5.brush

- Pin `p5` and `p5.brush` from npm at their exact versions in `versions.json` (p5 is LGPL-2.1: load it, do not vendor a modified copy). Stock p5.brush darkens saturated pigment (about pigment x 0.85 minus 0.075); check colours against the brief and correct in the palette.
- Never declare a global function whose name p5 or the window already uses (`line`, `dot`, `box`, `screen`); never shadow engine function names with locals.
- p5.brush mixes colour like pigment: paper strokes go in a second pass; never draw a paper stroke that an ink shape should cover.
- Painted pitfalls: huge filled shapes with bleed show a translucent band when zoomed out (use a wash); props drawn in an arm hook rotate with the arm (draw them in world coordinates).
- The stroke lattice for repainted footage is built once from frame 1 and locked, so the painting never boils while the subject moves.
- Re-running with the same seed must produce identical canvas bytes; the last frame shows the complete artwork.
- Cost: 150 to 250 ms per wide frame, about 350 ms busy, 0.7 to 1 s for page turns; a 30 s painted film takes 15 to 30 min. Do not use p5 painting for crisp brand type, photoreal output, or footage longer than about 10 s.
- Render the paper world wide, then crop the camera path in post. Iterate one dial at a time against a fixed seed. Re-render only changed shots (frame-range cache); never delete all frames and redo the whole film.


## Three.js guide

> Merged from heygen-com/hyperframes adapters and registry templates (Apache-2.0), echris6/motion-video-kit and AbubakrChan/product-launch-motion (MIT), Tejashmakwana/motionmaxxing (Apache-2.0), Vincentwei1021/mg-styles-15 (MIT); ideas from remotion-dev/skills and vibe-motion/skills (rewritten). Changes: merged, reworded, dashes removed.

### 1. When

Use Three.js for a real 3D hero: product turntable, extruded logo, camera flight, globe, depth with occlusion and lighting. Spend it on one hero or lockup shot, not on flat UI tours. Scale alone is fake depth; DOM 3D (perspective on a stable parent, `preserve-3d`) covers simple tilts (camera rules: the ice-motion skill).

### 2. Setup

- Pin one exact version per project and record it: the `three` version in `versions.json` by default (HyperFrames VFX blocks were built on 0.147.0 and bloom examples on 0.181.2; keep a project's existing pin). three r181 leaked memory through `PMREMGenerator`: dispose environment maps.
- Load as an ES module through an importmap with the pinned version in both entries (`three` and `three/addons/`), or vendor the files. A double-clicked `file://` page will not load modules: serve over HTTP.
- Text extrusion needs TTF, OTF or WOFF fonts, not WOFF2.

### 3. Render contract

- No rAF loop, no `setAnimationLoop`, no timers, no physics history. Expose `pose(t)` and `render(t)` and call `renderer.render()` only from the engine's seek: HyperFrames `hf-seek` event or `window.__hfThreeTime`; HTML capture `window.renderAt(t)`; Remotion `useCurrentFrame()`. Retime with `(t - start) * speed`.
- HyperFrames: always set the root `data-duration` (no inference for Three.js); heavy CPU setup registers a `window.__hf.buildReady` promise; GSAP may animate a plain state object that the render function reads (state proxy pattern), with `tl.eventCallback("onUpdate", renderScene); renderScene();`.
- Renderer: `new WebGLRenderer({ alpha, antialias: true, preserveDrawingBuffer: true })`, pin size and `setPixelRatio(1)` (or a fixed 1.5 for crisper edges, never `devicePixelRatio`), SRGB output, ACES filmic tone mapping (exposure about 1.1 in source templates). Tone-map before bloom.
- Use `compileAsync` before the first frame. Avoid post passes that depend on previous frame history.
- Imported animations: drive `AnimationMixer.setTime(t)` from engine time.
- Seeded PRNG (mulberry32) for any procedural placement.
- Camera cuts inside one canvas: declare each cut time once as a constant; verify the last frame before the cut and the first frame after it.

### 4. Lighting and shading traps

- One light with no ambient renders lit meshes as a flat black cutout: add a fill (for example a hemisphere light).
- Clamp the cosine to [0, 1] before `pow(1 - cosine, exponent)` in shaders.
- WebGL shader art: include a Canvas 2D gradient fallback.
- Instanced and shader effects are invisible to DOM checks: verify with ghosted keyframe views and snapshots.

### 5. Headless and performance

- GPU and SwiftShader output differ by about 38 dB PSNR: pin one mode for the whole film. Without a GPU, headless WebGL renders black unless SwiftShader or ANGLE flags are set.
- About 7 to 11 fps at 1080p on a laptop GPU; lowering capture scale does not cut WebGL cost.
- Remotion: wrap in the three canvas with explicit width and height, render with `--gl=angle`, every Sequence inside the canvas uses headless layout, no `useFrame`.
- Measured product-hero realism (motionmaxxing and motion-video-kit): accumulation motion blur with N subframes at `t + ((i + 0.5) / N - 0.5) * shutter`; 10 subframes left combing, 24 over the fastest 0.5 s were clean; shutter about 300 degrees on the fastest swing easing to 180, ramped over about 6 frames. Author stage colour against the decoded output; judge on encoded frames only.

### 6. Blender alternative

For photoreal materials beyond WebGL, render a PNG sequence from a Blender Cycles script and composite type and grain as an HTML overlay pass; mux with FFmpeg.


## FFmpeg-only engine

> Merged from digitalsamba/claude-code-video-toolkit, nateherkai/herk-edit-kit, browser-use/video-use, Barty-Bart/motion-graphics, AbubakrChan/product-launch-motion (all MIT), heygen-com/hyperframes (Apache-2.0); ideas from remotion-dev/skills and imMamdouhaboammar/motion-graphics-skills (rewritten). Changes: merged, reworded, dashes removed.

Use FFmpeg alone for jobs that create no new motion design: trims, cuts, concatenation, speed changes, reframes, GIFs, conversions, alpha checks, masters. Edit decisions (what to cut, pacing, B-roll) belong to the ice-edit skill; loudness targets and mixing to the ice-audio skill. Requirement: FFmpeg and ffprobe on PATH, at or above the minimum in `versions.json` (`runtimes.ffmpeg`).

### 1. Cutting and joining

| Rule | Scope |
|---|---|
| Trimming at arbitrary points re-encodes; stream copy (`-c copy`) can silently drop video or freeze first frames when the seek point is not on a keyframe | Every trim |
| Select exact frame numbers in one pass for talking footage; encoding segments separately and concatenating drifted lip sync by about a frame at half the joins | Talking head, podcast, interview, anything with lip sync |
| Concatenating segments rendered by one renderer with identical settings may use the concat demuxer with `-c copy` | Chunked renders of graphic films |
| Per-segment extract then lossless concat avoids double-encoding when overlays are added later | Edit pipelines that re-encode once at the end |
| Do not put many `trim` branches in one filter graph (9 branches ran out of memory); cut each segment with `-ss` before `-i`, then concat | Long edits on small machines |
| Write long filter graphs to a script file (`-filter_complex_script`) | Many cuts |
| 30 ms audio fades at every join so joins do not click | Every audio join |

### 2. Speed and frame rate

- Speed: `setpts=PTS/<speed>` for video, `atempo=<speed>` for audio (0.5 to 2.0 per filter; chain for 4x or 8x). Prefer FFmpeg preprocessing over engine playback rates for extreme (above 4x, below 0.25x) or variable speed.
- Variable frame rate sources: convert to constant first (`-vsync cfr -r <fps>` or `-fps_mode cfr`).
- Footage for a seek-driven engine: re-encode all-intra (`-g 1 -keyint_min 1 -bf 0`) or with one keyframe per second (GOP = fps) so seeks do not freeze. Generated clips at 24 fps can be retimed with `setpts` and `fps=<target>` in the same pass.
- Footage at 30 fps inside a 60 fps render shows each frame twice; that is expected.

### 3. Reframing (cut-downs)

- Re-lay out per aspect ratio when the film is made from code (`platform-specs.md`). For existing footage: crop mode for talking heads and single subjects; blur-fill mode (frame over a blurred copy at quarter size, `boxblur=12:3`, then `eq=brightness=-0.12:saturation=1.15`) for slides and screen recordings; pad mode with the brand ground.
- Fitted modes shrink text: a 1080p source in 9:16 shows at about 56% scale; a modest zoom (about 1.3) trades edges for size; consider re-rendering with larger captions first.
- Even dimensions: `scale=trunc(iw/2)*2:trunc(ih/2)*2`.

### 4. HDR sources

HLG (`arib-std-b67`) or PQ (`smpte2084`) sources going to SDR need `zscale` plus `tonemap=hable` to Rec.709, otherwise the result looks oversaturated and blown out.

### 5. Useful recipes

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


## Remotion: Studio-editable code rules

> Ideas from remotion-dev/skills interactivity guidance (no license file; rewritten in this repo's words, nothing copied). Changes: reorganized as a checklist.

Remotion Studio can edit a composition visually and write the change back into the source. It edits the JSX node that produced an item, so code must be written in a shape Studio can find and rewrite. Apply these rules whenever the user will open the project in Studio or asks for an editable template.

### 1. One written node per editable item

- Every composition, clip, scene, layer or sequence that must be edited on its own gets its own written JSX node with its props inline.
- Use `.map()` or loops only for things meant to be one template (bars, particles). Never for items that need their own name, timing, order or deletion.
- Do not wrap scenes in extra Sequence or AbsoluteFill on a Track; keep layout-only containers as plain HTML; put background and alignment on the scene instance.
- Be selective: too many interactive elements in one component make the timeline messy.

### 2. Inline literals

- Keep `interpolate` calls inline in the `style` prop with hard-coded output ranges, easing and extrapolation. Input ranges may use only `fps`, `durationInFrames`, `width`, `height` and simple multiply or subtract with numbers.
- Style objects are plain inline literals: no constants, spreads, memo or math.
- Fixed one-use text is written inline in the element; variables only for dynamic or reused text.
- Give interactive elements a hard-coded descriptive name.
- Composition id is a string literal; size, fps, duration and defaultProps inline with no type assertions; defaultProps as an inline object literal (never a variable, import, spread, helper or `satisfies` wrapper).
- Effects arrays are inline with hard-coded parameters and a stable shape; when one version needs effects and another does not, render two separate elements.

### 3. Interactive factory and schema

- Make scenes and reusable elements with Remotion's interactive component factory; set layout explicitly (full-frame for scenes, none for bounded elements); register the same exported reference (not the inner component) as a composition with representative inline defaults.
- Schema fields need a default and a description. Transform and opacity fields are added automatically: do not declare them. Built-in schema fragments exist for text, background, border radius, border, captions and children.
- Keyframable field types: number, color, boolean (hold), font weight, transforms, UV point, SVG path. Not keyframable: string, array, asset, font family, captions.

### 4. Connected compositions and pre-compose

- A connected composition opens without its parent, so it carries its own typography and font loading and takes background and alignment from its registration defaults. Verify by opening it standalone. Match the parent's fps and size unless intended.
- A "pre-compose" request is done only when the markup is extracted into a named component AND registered as its own composition with size, fps, duration and equivalent defaults.

### 5. Paths and captions

- Use Remotion's editable Path element for SVG paths; static path data inline; morph with the multi-path interpolator inline; evolve strokes with dasharray and dashoffset.
- Clip and caption grouping, source-relative caption timestamps, whitespace-sensitive words and the page-break flag: the `ice-type` skill, `references/caption-timing-and-truth.md` section 5.
- Remotion shape for that group: the video and its captions sit in the same Sequence, with `from` set on the group; each clip's captions are an inline array on its own captions node, so Studio can edit them.

### 6. Timeline editing structure

- Clips that move independently: place each video directly with name, `from`, trim and duration inline (gaps and overlaps allowed).
- Clips that must stay adjacent: TransitionSeries sequences with hard-coded name and duration, never `from`.
