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

The table picks the engine; whether it can run here is settled by section 7. When the chosen engine is not installed and may not be installed (refused, offline, or the install failed), walk the fallback ladder in section 7.4: rung C renders the same film as an HTML capture page with the bundled `scripts/render-html.mjs` and the user's installed browser, with nothing installed, and section 7.5 names the gates that replace HyperFrames lint and `check`.

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

This section is the single home of tool prerequisites for every route; other skills point here. Never install anything, download a browser or change a system setting (PATH, execution policy, long paths) without the user's consent: name the tool, the exact pinned version from `versions.json`, the size when known, and the command, then wait.

### 7.1 What each route needs

| Route | Always | Sometimes (the workflow says when) |
|---|---|---|
| `ice-film` | Node, FFmpeg, Chrome, Chromium or Edge; Python with `ice-qa/scripts/requirements.txt` | The engine package from section 1 |
| `ice-explainer` | Node, FFmpeg, Python with `ice-qa/scripts/requirements.txt`, a local speech-to-text model with word timestamps | TTS, only if the user chose it |
| `ice-remake` | Node, FFmpeg, Chrome, Chromium or Edge; Python with `ice-qa/scripts/requirements.txt` (numpy and opencv-python-headless, also used for camera and color measurement) | The engine package from section 1 |
| `ice-edit` | FFmpeg and ffprobe, Node, Python with `ice-qa/scripts/requirements.txt`, local speech-to-text | Playwright for motion overlays |
| `ice-lottie` | Node | A browser for previews |
| `ice-ideas` | Nothing | Nothing |

Python is required whenever a film is delivered: the richness floor is measured by `ice-qa/scripts/film_gate.py` (Python, numpy, opencv-python-headless), and a richness measure left unmeasured blocks delivery (the `ice-qa` skill, hard release gates). Without Python the film can be planned, built and reviewed by eye, but not delivered: name the install in the stage 01 message, and never replace the measure with an estimate.

### 7.2 Check order (once at intake, in this order; record every result in `ice/DIRECTION.md`)

1. Node: `node --version`, at or above `runtimes.node.minimum` in `versions.json` (the zero-install renderer needs the global WebSocket of that version).
2. FFmpeg and ffprobe: `ffmpeg -version` and `ffprobe -version`, at or above `runtimes.ffmpeg`.
3. Browser. Windows PowerShell: `Get-Item "$env:ProgramFiles\Google\Chrome\Application\chrome.exe", "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe" -ErrorAction SilentlyContinue`. macOS: `ls "/Applications/Google Chrome.app" "/Applications/Microsoft Edge.app"`. Linux: `command -v google-chrome google-chrome-stable chromium chromium-browser microsoft-edge`. A browser in another folder: the user gives its path; set it as `ICE_CHROME` for the renderer and as `CHROME_PATH` for the `ice-qa` scripts (PowerShell `$env:ICE_CHROME = "<path>"`, cmd `set ICE_CHROME=<path>`, macOS and Linux `export ICE_CHROME="<path>"`; the same forms for `CHROME_PATH`).
4. The engine chosen in section 1, inside the film project: `npm ls hyperframes` (or `remotion`, or `playwright-core`). Installed at the pinned version: use it. Another version already pinned by the project: keep it. Missing: section 7.4.
5. Python, on every route that delivers a rendered film (7.1): `python --version` (macOS and Linux: also `python3 --version`), at or above `runtimes.python`. Python packages: each skill's `requirements.txt`. A compatible version that is already installed may be used as it is; record each such package and its version in the delivery note. Anything that must be installed goes into a project virtual environment (`python -m venv .venv`); never install into the system Python. Music by code needs only numpy (the `ice-audio` skill, `references/music-by-code.md` section 1).
6. Network: ask only when a step in 7.4 needs a download; a "no" holds for the whole session.

### 7.3 Install commands (give the line for the user's OS; the user runs or approves it)

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
| B | Engine missing, network possible | The engine's name and pinned version, that it installs into this project only, which downloads it needs (HyperFrames also asks for its pinned Chrome build, a second download), and that rung C works without installing anything | After a yes, run the pinned commands below and check the installed version. A yes to the package is not a yes to the browser download: ask for each |
| C | The user says no, there is no network, or rung B failed | The film is rendered by the bundled HTML renderer with their installed browser and nothing is installed; the look is the same; the HyperFrames lint, `check`, Studio preview and registry blocks are replaced by the gates in 7.5 | The zero-install steps below |
| D | No Chrome, Chromium or Edge, and the user cannot install one | Motion design needs a browser to render; offer the browser line from 7.3 | Edits and conversions continue with FFmpeg only (section 1 row 2). Never build a substitute rasterizer (ImageMagick, PIL or SVG frame pipelines); stop and report the blocker |

Rung B commands (exact versions from `versions.json`, `npm`; never `@latest`, never an `npx` that downloads a package):
- HyperFrames: `npm install --save-dev --save-exact hyperframes@<npm.hyperframes>`; then `npm ls hyperframes` must print that version. The browser: `npx hyperframes browser ensure`, after its own yes. Guide: `hyperframes.md`.
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
