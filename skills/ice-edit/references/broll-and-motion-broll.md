# B-roll and motion B-roll timed to words

Merged from nateherkai/herk-edit-kit (MIT, Use Permission: editing playbook, short-form-edit, premium motion and footage), Barty-Bart/motion-graphics (MIT: motion-broll), Omar-Tnzxo/video-production-studio, majedphotos/video-ad-editor (MIT), AbubakrChan/product-launch-motion (MIT), alchaincyf/huashu-art-motion (MIT), heygen-com/hyperframes (Apache-2.0), plus ideas restated from hypit-ai/hypit, imMamdouhaboammar/motion-graphics-skills and Vincentwei1021/video-talkcraft (ideas only). Asset licensing, logos, portraits and the truth sheet belong to the ice-assets skill; motion grammar and easing to the ice-motion skill.

## 1. Decide per spoken line: what goes on screen

Plan a table before any build; it is approved at 04 (the user's review card in step mode, the approver role in auto mode):

| # | In-out (edited time) | The line it covers | Trigger: word or sentence, edited time | What appears, and who it is on | Treatment | Why |
|---|---|---|---|---|---|---|

Every element tied to its trigger (owner decision, 2026-10-29; every edit type): each insert, overlay, keyword, lower third, circle or other mark, cutout and motion B-roll in the plan has one row whose trigger is the transcript word or sentence that calls for it, with its edited time, and whose "Why" says what the element means there. An element with no trigger in our speech and no reason is cut, however good it looked in a reference. When the edit follows a reference, its element reasons table is built first (format: the "Element reasons" section of `ice-remake/references/notes-files.md`, notes file `REASONS.md`) and each row here names the reasons row it carries over; the element lands on our trigger, never on the reference's timing. A mark or dimming is on the person or thing our speech talks about, never on the speaker (`layers-and-isolation.md` section 5).


Treatment per line:

| Treatment | When |
|---|---|
| Full-frame cutaway | The line describes something to see: a product, a process, a comparison, a number, a chapter change. Cut away for the length of the idea (3 to 10 s), then give the face back |
| Panel in empty space | A transparent clip (alpha) in the empty area of the frame, sized to stay clear of the speaker's box at every moment; may run 15 s or more as one continuous piece. If the speaker's box changes size, size for the largest box or split the clip |
| Nothing | The line is about the speaker (personal, emotional, opinion), it sits in the first second of the hook, or it is too close to another clip. Leave at least about 2 s of face between cutaways |

Every picture must advance the argument (context, proof, action, the exact screen, or a structural graphic). A generic picture for every noun gives activity without proof. Two valid relationships: exact correspondence (the picture is on screen while the claim is spoken) or one visual thought carried across several pictures (a habit, a process) that need not cut on each noun.

## 2. Source preference (best first)

1. Real footage of the thing named.
2. A real screen recording of the site or app, zoomed into the part being talked about, with a visible cursor.
3. An animated UI mock (typing, rows ticking, a counter climbing), labelled as an example; only with real data.
4. Short highlight crops of a real page (under 1 s) on tool names, prices, badges.
5. Licensed stock footage of the person, place or action, checked per item.
6. Generated video last, only when the user allowed it, as concrete metaphors (an idea made literal), never generic "person at a computer" shots.

Order of preference and license checks: the `ice-assets` skill, `references/sourcing-and-licenses.md` sections 1 and 3. Real footage from outside is searched and fetched by Ice itself on the free no-account routes, with no question, at the output resolution (same file, sections 1a and 5); check free space first (`ingest-and-ledger.md` section 6). Generated media policy: the `ice-assets` skill, `references/ai-media-policy.md` section 1.

Rules that hold everywhere:
- Video beats images. An AI still image used as B-roll is a build error; stills only become first frames for AI video. A still with a camera move is a photographic layer, not moving B-roll.
- Animation goes only where real footage or a screen recording cannot explain (a number comparison, a structure). Before and after stays the real person and real recordings.
- Never invent numbers, quotes, prices or results. Use relative bars, skeleton text lines or labels taken from the transcript, and list what is illustrative.
- Show the subject's real objects pulled from the words: the folder, the terminal, the file, the product, the result.
- Prefer authentic human reactions where they support the story. Let a distinctive source moment shape the idea.

## 3. Footage handling

| Rule | Detail |
|---|---|
| Aspect is sacred | Images, screen recordings and logos keep their original ratio: contain, scale uniformly, never stretch; crop only on request |
| Read in one glance | Fit the complete action and its result before considering a tighter crop. Keep subject, action and consequence visible through the whole interval, captions outside the action. Inspect start, middle and end in each ratio at phone size |
| No blurred duplicate by reflex | Do not fill vertical frames with a blurred copy of the same clip as an automatic answer (see `vertical-conversion.md` for when blur fill is right) |
| Web pages | A whole page shrunk to phone size is unreadable: crop to the phrase and highlight it on the spoken word. Highlight only the half sentence being spoken; split a two-line sentence into two highlights. Rectangle estimates are often off by 20 to 30%: verify on a rendered still |
| Small UI | Small UI floating in empty space is the fastest "AI edit" tell. Zoom UI so it fills the panel |
| Motion | Every shot moves (real motion, or a slow push-in on footage in house short-form style); no frozen frames. Inside a decorative frame in long-form explainers the footage stays untouched (no zoom, no filter) |
| Screen capture | Never accept cookie or terms dialogs while recording; close them or use another page. Browser recorders capture CSS pixels, so high-density recordings come out small: capture frame by frame instead. Some docs sites scroll an inner container: scroll with the wheel, not `window.scrollTo`. Never show real credentials or personal data |
| Montage | Give a montage room to play once at native speed |
| Stills bracketing | In HTML engines, bracket a video element with a poster frame before and a last frame after, to cover startup flicker and end black |
| Background footage | Behind text: darken and desaturate (brightness about 0.35 to 0.50, saturation 0.5 to 0.7) with a scrim only under the text, never by lowering opacity; motion at most about 0.6% zoom per second |
| Spotlight inside footage | Dim surroundings 30 to 50% and desaturate 40 to 60% (never black or gray), ramp 0.2 to 0.3 s, keep the target's original pixels, restore on time. On B-roll and subjects' footage only, never on the speaker's shot (`layers-and-isolation.md` section 5) |
| CTA desaturation (news reel) | News reel (edit type `news-reel`, style family `family-broadcast-news.md`): the call-to-action mood switch replaces the 0.2 to 0.3 s ramp above. Trigger: the call-to-action words (measured 3 f before "follow us" to 10 f after the time line), on the whole frame or the background only as the reference shows. Ramp 26 to 36 f (1.04 to 1.44 s at 25 fps), near linear (measured saturation index from 85-102 down to 38-45); the speaker's luma is kept or raised, never lowered (measured 45 to 53), so the white icons and the platform plate become the brightest things. Holds to the cut to the end card. Reason: colour drains so the call to action reads first |

### News reel B-roll treatments

News reel (edit type `news-reel`, style family `family-broadcast-news.md`): each treatment goes only on archive or B-roll, never on the studio footage of the speaker (no grain, dust, scanlines or leaks on studio footage: 6 of 6 measured reels), each with its plan row and reason. Numbers are tutor or measured values; a reference's own measurement wins (`ice-remake/references/measuring.md`, section "Finishing layer").

| Treatment | Where | How | Reason |
|---|---|---|---|
| Black and white | Archive and B-roll that sits behind the cut-out or under a title | Full monochrome tint (100 percent) | Marks the picture as from outside the studio; keeps the lit presenter the only colour |
| Grain and scratches | Archive only, never on footage shot for the reel | Film grain and scratch overlay at a low strength measured on the reference | Says "archive"; on new footage it would lie about its age |
| Red wash | Crowds, war, army or violence footage named in the speech, never on the people the story sympathises with | Red multiply on the first frame of each clip, or a held tint that decays over about 8 f | Heat and alarm; the package's red used as a meaning, not a decoration |
| Mosaic on a map flag | A flag laid over a map shape | Mosaic (tutor value 150) plus a soft glow | Turns the flag into a texture on the land instead of a second picture |
| Over-exposed entry | The first 2-4 f of an archive burst after a blur-out | Luma lifted to about 150-175, then the clip's own grade | The archive arrives "burnt", a cue that it is real footage |
| Behind the cut-out | B-roll on layer 3 behind the presenter | About 25 percent opacity, feathered mask 73-173 px (`layers-and-isolation.md` section 3b) | Context without competing with the lit presenter |

Archive burst timing and flashes: `edit-types/news-reel.md` section 4.

Generated footage (optional, paid, disclosed, user-initiated): length, continuity, screens and inspection of generated clips: the `ice-assets` skill, `references/ai-media-policy.md` sections 5 and 6. Generation success is not asset QA.

## 4. Motion B-roll timed to words (one shape that never cuts)

A motion B-roll clip is one shape that never cuts: it morphs size, corners and color from state to state while its content swaps with a short blur. A cursor drives changes with real clicks and drags, and every change lands on a spoken word.

| Rule | Value |
|---|---|
| Pace | Pace to speech, not music: one change per spoken beat, about 0.4 to 1.2 s apart |
| Word anchoring | Clip-local time = word time minus the clip's in-point; prefer real word timestamps. Subtitle-file word times: the `ice-type` skill, `references/caption-timing-and-truth.md` section 2 |
| Payoff landing | Start a reveal its own duration early so the landing frame coincides with the spoken payoff word |
| Sync durations | Simple cards: rough floor 3 s, typical 5 to 7 s; complex diagrams 8 to 14 s; beat accents 0.5 to 2 s ("recognizable at 1x", not fully parseable). Over voiceover a clip lasts at least narration length plus 1 s; hold the final state at least 1 s before the cut |
| One thing at a time | Never reveal two independent elements at once; one thing, pause, the next |
| Text inside a morphing container | Give the swapping text its own enter and exit timing, or old and new text overlap |
| Camera | Zoom so each state fills the frame (about 1.2 to 1.6 for cards, 1.8 to 2.2 for pills). Cursor size and framing under zoom: the `ice-motion` skill, `references/camera.md` section 5 |
| End | A clip ends by holding its last state; the composite holds the last frame if its slot is longer |
| Match the video | Clips match the video's resolution and frame rate. Name each clip file by its timeline in-point |
| Alpha panels | Write transparent clips as ProRes 4444 `.mov` (`prores_ks -profile:v 4 -pix_fmt yuva444p10le`); opaque clips as H.264 (`-crf 14 -pix_fmt yuv420p -movflags +faststart`). Never put `will-change` on anything the camera scales (blurry text) |
| Look | No fixed house palette or font: take the look from the project direction (ice-direction skill). Banned by default: bouncy easing, particles, glows, gradients on UI chrome, mixed icon stroke weights, dead time, template looks, made-up data |

Review: stills at each settled state and mid-morph on the key words (panels shown on black). Fix anything cramped, clipped, unreadable, off-word, or a cursor leaving the frame; check once more. Composite the clips over the source for a preview with hard cuts and the original audio, and offer a before/after compare page. Say plainly when a preview is for review and the user will place clips in their own editor.

## 5. Choosing the build engine per slot

Engine per slot (decision procedure, license gate, Python engines such as Manim only when the user's project already uses them): the `ice-engines` skill, `references/engine-choice.md` sections 1, 3 and 6. Log the engine chosen for each slot and its reason.

For one-shape motion B-roll clips use the bundled engine (section 6). Await font loading and assert it before the first frame; fonts fail silently.

## 6. The bundled motion B-roll engine (`scripts/motion-broll/`)

Adapted from Barty-Bart/motion-graphics (MIT). Every frame is a pure function of time: springs are closed-form step responses, a value that changes target many times is the sum of one spring per change, there are no CSS transitions or timers, so any frame renders on its own. Headless Chromium captures 4 subframes per frame across a 180 degree shutter and ffmpeg blends them into motion blur. Works on Windows, macOS and Linux.

Setup (once per project, network): the Playwright install below is free and pinned, so it runs without a question after the free space check and is recorded (`ingest-and-ledger.md` section 6). When the space check fails or the install cannot finish, build the slot with an engine that needs no install (the `ice-engines` skill, `references/engine-choice.md` section 7, fallback ladder) or use a plain insert, log it, and say in the delivery note what the install would add. Install: in a `motion/` folder of the user's project, with Node, Python and ffmpeg present at the minimums in the `ice-engines` skill's `references/versions.json` (`runtimes`), create `package.json` containing `{"private":true}`, then run `npm install --save-exact playwright@1.49.1` (the exact version in `versions.json`, `npm.playwright`) and `npx playwright install chromium` (about 150 MB download). Python helpers need `numpy` for `inspect_video.py`. Transparent clips need an ffmpeg build with the `prores_ks` encoder (`ffmpeg -hide_banner -encoders` lists it). Run the Node scripts from the `motion/` folder (they find Playwright there); use `python` or `python3` as your system names it. `<skill>` below is this skill's folder.

| Step | Command |
|---|---|
| Inspect footage | `python <skill>/scripts/motion-broll/inspect_video.py work/source.mp4 work` writes `contact.png` and `video.json` (size, fps, sections `full`, `pip`, `black`, the speaker box per picture-in-picture section, and a warning when the box moves or resizes) |
| Word times from a subtitle file | `python <skill>/scripts/motion-broll/words.py transcript.srt > work/words.txt` (estimates, plus or minus 0.2 s; prefer a word-level transcript) |
| Plan | Table from section 1, approved at 04 |
| Write clips | One fragment per clip in `clips/NN-name.html` (contract below) |
| Build | `python <skill>/scripts/motion-broll/build.py dist clips/*.html [--font <file>] [--mono <file>] [--font-system "<Family>" or --font-google "<Family>"] [--mono-system "<Family>" or --mono-google "<Family>"] [--fonts fonts.json] [--offline]` (font rules below) |
| Check stills | `node <skill>/scripts/motion-broll/beats.js dist/NN-name.html work/NN.png <t1> <t2> ...` at settled and mid-morph times; panels show on black |
| Render | `node <skill>/scripts/motion-broll/render.js dist/NN-name.html out/NN-name_<in>.mp4 <fps>`; transparent clips to `.mov` (ProRes 4444). Slower than real time; two clips in parallel on a multi-core machine |
| Preview and pages | Write `plan.json`, then `python <skill>/scripts/motion-broll/composite.py plan.json out/preview.mp4` and `python <skill>/scripts/motion-broll/make_pages.py plan.json out/preview.mp4` (writes `viewer.html`, `compare.html` with side by side, stacked and wipe modes, and `TIMING.md`) |

Fonts (UI face and mono face):
1. Project or user-supplied font files always come first (`--font`, `--mono`, or `"file"` in the JSON).
2. Otherwise use the font the direction step chose as the best fit for this film (read the type block in `ice/DIRECTION.md`; the order and the choice are owned by the ice-direction skill, `references/type-pairing.md` section 1). Installed system fonts and Google Fonts have no fixed order: pass whichever source the direction named, `--font-system "<Family>"` or `--font-google "<Family>"` (same for `--mono-...`). Naming both for one face stops the build. The choice can also be written once to a JSON file and passed with `--fonts`: `{"ui": {"system": "<Family>"} or {"google": "<Family>"} or {"file": "<path>"}, "mono": {...}}`; command-line flags override the JSON, and a file always wins.
3. Nothing chosen: the generic system stack. Never fill the gap with a house default family.

Google Fonts is a network call at build time to fonts.googleapis.com and fonts.gstatic.com; the files are cached in `dist/.font-cache` and embedded in each page, so rendering itself needs no network. The plugin README discloses this call. A system family named with `--font-system` must be installed on every machine that renders; to keep renders portable, copy that family's file into the project after its license check (ice-assets) and pass it with `--font` instead. A Google family travels inside the page. Arabic or mixed text needs a family with Arabic glyphs (ice-arabic skill).

Offline switch: pass `--offline` to `build.py` and `make_pages.py`, or set the environment variable `ICE_OFFLINE=1` (macOS and Linux: `ICE_OFFLINE=1 python ...`; Windows PowerShell: `$env:ICE_OFFLINE="1"`; Windows cmd: `set ICE_OFFLINE=1`). Offline uses only project files and installed system fonts: a Google choice falls back to the generic system stack with a warning, so ask the direction step for a system family when the build must stay offline. A failed download behaves the same. The review pages (`viewer.html`, `compare.html`) link Google Fonts and load them in the viewer's browser when opened; offline mode removes those links.

Fragment contract (one HTML fragment per clip):
- `<title>` names the clip; optional `<style>` holds clip CSS; slots are `<div data-slot="world">...</div><!--/world-->` (elements beside the shape), `<div data-slot="shape">...</div><!--/shape-->` (one `.L` layer per state, anchored inside the shape) and optionally `over`.
- A `<script>` calls `M.scene({...})` with: `W`, `H` (match the video) and `T` (seconds); `bg` (canvas color from the project palette, or `null` for a transparent panel rendered to `.mov`); `center` (screen point the camera centers on; move it for panels); `intro` (time the shape pops in, `null` if already on screen); `SH` (the states the one shape morphs through, each `{w,h,r,bg,cam}`); `start` and `SEQ` (`[[clip-local time, state], ...]`, each on its word); `layers` (`{el, tin, tout, anchor:'c'|'t'|'l', update(t,g)}`); `cursor` (`{size, clicks:[t], drags:[[t0,t1]], keys:[[t,x,y], ...]}`); optional `geom(t,g)` (move the shape or camera focus, for example while dragging) and `extra(t,g)`.
- Coordinates are world pixels; the shape is centered at world (0,0). The camera draws `center + cam x (world - focus)`.
- Engine calls on `window.M`: `track(v0, [[t, value, spring?]...])`, `ctrack` (colors), spring presets `MORPH`, `FAST`, `SLOW`, `SOFT`, `CAM`, `INSTANT` (their values and when to use each: the `ice-motion` skill, `references/springs-and-curves.md` section 4); `vis(t, tin, tout, {din, lin, lout})` content swap (defaults din 0.07, lin 0.26, lout 0.12, blur 12 px, enter scale 0.94 to 1, exit scales down 3%); `apply`, `path` (cursor path with a slight human arc of 6%), `crossTimes` (when a dragged value crosses thresholds), `icon(name, size, color)` (one 24-grid stroke set with equal stroke width; add more Lucide-style paths, ISC), `setText`, `eo`, `eio`, `clamp`, `lerp`, `S`.
- Patterns: pill to card to control (states plus layers); liquid indicator (leading edge on `FAST`, trailing on `SLOW`); typing (slice the text by time, with a caret); rows or bars appearing on words; direct manipulation (while held the value follows the cursor, on release it springs from there); drag and drop (`geom` follows the cursor, a world-slot target, camera focus moves); transparent panel (`bg:null`).
- Interaction vocabulary to map ideas onto: primary action (pill plus click), progress (loader, bars, lanes), confirmation (check, toast), live status, detail card with a drag, slider with rubber band, toggle, tabs, chart with tooltip, search and filter list, file drag to a drop target, terminal typing, side-by-side comparison, chapter card.
- Cursor press timing and scale, and the shape intro pop: the engine implements them from `cursor.clicks` and `intro`; the numbers are owned by the `ice-motion` skill, `references/springs-and-curves.md` section 4.

`plan.json` (paths relative to it): `{"title", "video", "fps", "clips":[{"id","title","line","in","out","kind":"full"|"panel","file"}], "notes":[what is illustrative]}`. `out` is when the clip leaves the timeline; a shorter clip holds its last frame in the composite.

The engine's base CSS keeps a neutral warm-gray canvas and near-black ink only as a fallback; set colors and fonts from the project direction in every clip so no two projects share a look.
