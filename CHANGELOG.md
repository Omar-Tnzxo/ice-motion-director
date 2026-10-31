# Changelog

Every notable change to Ice Motion Director is listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/). Installed plugins update only when this version number changes.

## 0.2.8 - 2026-10-31

Three film genres are now measured, not collected: each playbook comes from a corpus of professional films measured with the plugin's own tools, and each carries a fingerprint that the render is checked against at gate D (`ice-qa/scripts/genre_check.py`).

### Added

- **Genre playbooks with a checkable fingerprint.** `ice-film/references/genres/` holds one playbook per genre: conventions with their median, range and how many films hold them, the variants, the hypotheses that were measured and rejected, a coding sheet for what pixels cannot read, and a `Genre fingerprint:` line. `genre_check.py measure|check|genres` measures a render the way the corpus was measured.
- **UI and app motion ads (L42),** from 15 films: the app ad, the product launch with screens and the UI walkthrough point to it.
- **Product launch without screens (L44),** from 15 official launch films: object film and in-use film variants, hard cuts carrying the film (3.5 per 10 s), counted scenes of 1.6 s, the product by second 4, macro, turntable and light sweep shots, a closing packshot and dense effects. The product launch type and a hype cut of a physical product point to it.
- **Kinetic type (L45),** from 11 films: words on screen most of the runtime, lines of about 2 words, mixed emphasis in one accent hue, one sans family at several weights, a 1.0 s line hold and a centred end card on a plain ground.
- **Support the project:** a README section and a Sponsor button.

### Changed

- **General rules a genre contradicts are scoped, never deleted (AGENTS.md rule 6):** dissolves and light sweeps in product launches, the SFX ceiling of about 15 per minute, centred end cards, the hype hard cut limit, one highlight form per film, serif plus sans, the kinetic type end hold and dead air rule, and music-led kinetic type at any length without a voice. Each stays the house default and names its genre as the exception.
- **README** opens with the six real showcase films.

### Fixed

- **`analyze.py` no longer dies silently (L43)** when librosa's beat tracker crashes the interpreter on some Windows CPUs: the audio runs in a child process, a crash is retried once for a plain CPU target, and a second crash is reported in `report.json` with a non-zero exit.

## 0.2.7 - 2026-10-30

Every gap the completeness audit of 0.2.6 found between the founder's decisions, the research and the skills is closed, each as a lesson (L27 to L41) with its rule and its test.

- **Silence is never a waiver anywhere (L27).** Every workflow asks the stage 01 questions in rounds; none takes a default when no one answers.
- **No sound by code by default, in styles and remakes too (L28),** and loudness always from the `ice-audio` profile table.
- **The craft plan is locked before the script (L29):** `ice-state.mjs check 03` refuses without it.
- **A look you chose is never pushed away (L30); the speaker never dims in a package (L31); free installs and downloads are never asked (L32); rights stay yours in every route (L33).**
- **No "unofficial" line and no AI label inside the film (L34):** both go to the delivery note and the post caption (founder decision, 2026-10-30).
- **Arabic typing in a real product input box (L35),** and Arabic is never set with ffmpeg drawtext.
- **Fingerprints and local libraries by script (L36):** `film_gate.py fingerprint check|write`, `fetch_media.py index`.
- **News reel rules from the trials (L37):** the episode's own camera angles, whose claim it is, archive dates, minors, and an ad that reads as an ad in its first 3 s.
- **Case study v2 (L38):** `export-case-study.mjs --site` writes the gallery package: the film in full HD beside the raw source cut by the EDL, the source and why those minutes, the prompt with its English translation, the story with real times, the disclaimer and credits.
- **Auto mode shows each stage as it lands (L39),** without a new stop.
- **Short music fails the master; beat error, halftone and fringe are measured (L40).**
- **Portraits and flags by route, code-drawn art at stage 05, and a `music_options` setting for 2 or 3 tracks (L41).**
- **Housekeeping:** 32 small reference files merged into their siblings (599 to 567 files); `gates.mjs` warns when the last version check is older than 30 days; the behaviour check before a release is a manual one-prompt run on a clean Claude (founder decision, 2026-10-30).

## 0.2.6 - 2026-10-30

The gates now look at the finished video itself, not only at the plan: pace, depth, finishing, grade, fixed marks, the speaker's light and every sound effect are measured on the render. Real footage comes through a shipped fetcher with its records, an After Effects project you supply is read, and every style states its own craft. Each lesson is listed in `docs/maintainers/lessons.md` (L21 updated, L23 to L26) with its rule and its test.

### Added

- **Pace measured on the render (L23).** `motion_check.py --measure` fails an event the plan declares but the render does not show ("declared, not visible") and checks mean shot length and cuts per minute on detected cuts against the reference; `compare.py` detects the film's own cuts. Without a reference, every film and edit type carries a `Rhythm row:` line (mean shot, longest shot, first cut, longest gap between events) that `film_gate.py` gate 5 checks on the render.
- **A shipped fetcher for real footage (L24).** `ice-assets/scripts/fetch_media.py` searches and fetches from Openverse, Wikimedia Commons, Internet Archive, NASA and single official clips through the pinned yt-dlp, with the words taken from your script or brief, and writes each item's source, owner, license status, size and hash; `ICE_OFFLINE` and `sources.json` turn it down.
- **After Effects projects are read (L24).** `ice-remake/scripts/analyze.py` reads an `.aep` you supply (never runs it) and lists its comps, layers and transform keys in `aep.json`, with what it could not decode.

- **Every sound effect is heard, on time (L25).** `master_audio.py --no-sfx-premix` writes the same mix without effects, and `qc.py --audit` measures each cue against it: a hero effect that is masked or late blocks delivery, more than half masked blocks, and level jumps at cuts and the longest unchanged repeat go to the "For your ears" list with their times.

- **Pixels of the render checked (L26).** `craft_gate.py measure` writes depth planes from optical flow, and `build` checks finishing per shot against the plan, the grade of each source class, fixed marks in their slots (never riding the camera) and the speaker's light inside and outside the recede windows.

### Changed

- **Every style entry states its craft (L21).** All 162 catalog entries now carry their own craft profile line or an explicit `family default` marker, checked against each entry's text; every `lifts` id is a real gate rule id.
- `probe-mp4.mjs` is now the `probe` subcommand of `ice-qa/scripts/quick-checks.mjs`, same checks and output.

## 0.2.5 - 2026-10-29

Every video at its full capacity, without being asked. An audit of six trials found that a craft reached a film only when its type file named it, a reference measured it, the news reel package carried it, or the user asked; everything else stayed off, and about 150 taste rules were written as absolute bans. Now the director decides every craft for every video from what the content, the type, the reference and the chosen style call for, in every style, and the gates check that each decision reached the film. Each lesson is listed in `docs/maintainers/lessons.md` (L13 to L22) with its rule and its test.

### Added

- **Ice's own CC0 sound-effects pack** (founder decision D4): 128 recorded effects in 24 types (whooshes, impacts, sub drops, risers, UI, ticks, paper, typing, room tones), each file CC0 1.0 or public domain, published as the Release asset `assets-sfx-v1` and pinned by SHA-256 in `ice-engines/references/versions.json`. `match_music.py pack fetch` downloads it once into your user folder without a question (turned off by `ICE_OFFLINE=1` or `sources.json`); `pack list --type <type>` lists the sounds of a move with their sync point and levels. It comes after your own files and libraries on the SFX ladder; sound made by code stays only when you ask for it. `--profile under-speech` is the plain name of the speech-safe filter for any film.
- **The craft plan (L13).** At stage 02 the director writes `ice/plan/craft-plan.json`: one row for each of 18 crafts (camera, depth, compositing, light and focus, grade and finishing, type, transitions, data and maps, cutouts, sound effects, music, ambience, foley, silence, voice, rhythm, real footage, identity), used, used with a limit, or left out, each with its reason and source. "Not asked" is never a reason. Rows are mapped to shots at 04 and locked with the style at 05; defaults per video type and content triggers (a number becomes a counter, a place a map, a long take a moving camera) live in `ice-direction/references/treatment.md`. `AGENTS.md` rule 20.
- **The craft gate** (`ice-qa/scripts/craft_gate.py`): `plan` checks the plan; `build` checks the render (evidence for every used craft, text over a face, flashes over the safe mode, an idle camera on a long take); `measure` gives the camera track, flashes, finishing, focus and faces of any video, a reference or a render.
- **Text never covers a face, checked on frames (L16).** Face boxes against text and card boxes on every sample, at least 30 percent of the face uncovered in every 0.3 s window.
- **A craft profile for every style (L21):** what each style family needs, when a craft serves it, and what its medium forbids, copied into the craft plan at 05; 70 thin entries carry their own line.
- **The mix audit and a list for your ears (L18).** `qc.py --audit` measures the delivered mix (loudness by the chosen profile, voice over music in the voice band, clicks, clipping, DC, phase, stream spec, silences, the music ending) and blocks delivery on a fail; `align_script_to_asr.py --stem` tells a word the mix masked from one a model mishears; the delivery note carries a generated "For your ears" list of 5 to 7 moments to hear. `qc.py --diagnose` switches voice cleanup on by symptom.
- **A coverage floor for edits (L17):** elements per minute, the longest bare talk, the share of content triggers answered and the B-roll share, per edit type, checked on the plan and the render.
- **One grade per source class (L20):** outside material (archive, agency footage, stills, screenshots) takes one treatment that marks it as outside; `grade.py` presets `news_clean`, `outside_mono`, `outside_desat_lift`, `outside_warm_duotone`, applied per EDL range by `render.py`.

### Changed

- **Taste bans are conditions (L14).** Every craft and taste rule is a default that yields to the user's own words, a measured reference value, the chosen style's craft profile or a content trigger, recorded as an exemption row with the shots and the amount; the gate scripts read those rows. Truth, rights, safety, accessibility, legibility, Arabic correctness and the lit speaker are never lifted.
- **Depth is a craft (L15):** card fields, 2.5D planes, push-throughs and text in depth are used when the content, the type, the reference or the style calls for them; a lone tilted card still fails.
- **The speaker recedes, never darkens (L19):** while an inserted image or card of another person or thing is the subject, the speaker may step back as a smaller, partly desaturated plane; a dimming of at most 15 percent and a light defocus only while the speaker is silent; never darkened, defocused, fully grey or marked while speaking, and back on the frame the image leaves.
- **Anti-sameness guards Ice's own choices (L22, founder decision):** a reference, style, brand identity or series look the user chose is exempt from the template distance, the fingerprint and the unexpected directions.
- **Every edit gets the full review:** an independent critic, a clarity read sized to the job, the studio benchmark, and the brand test whenever the edit carries an identity.
- `contact-sheet.mjs`, `frozen-time.mjs` and `loudness.mjs` are now one file, `ice-qa/scripts/quick-checks.mjs` (`sheet`, `frozen`, `loudness`), with `loudness --profile` exiting 1 outside the profile. The caption sync tolerance is 0.1 s (0.15 s for sentence cards).

## 0.2.4 - 2026-10-29

News reels at broadcast level from a plain prompt: a measured study of six public Al Jazeera reels and sixteen editing tutorials becomes Ice's own rules, written in our words (ideas and measurements only; no footage, logo, programme mark, text or sound copied). Four new lessons from the trials become default rules with tests (`docs/maintainers/lessons.md`, L9 to L12).

### Added

- **Broadcast news style family** (`ice-styles/references/family-broadcast-news.md`): the "presenter news reel" genre (one studio take reframed digitally, graphics on the speaker's words, archive in the pauses, a designed end card) with its colour-role contract and per-line decision order, and three programme packages by the numbers (Al Jazeera Arabic shorts, Al Jazeera English, "Mohawalat Fahm" on Al Jazeera 360): colours and the job of each, fonts and free alternatives, type scale, moves with frames and easing, sound effects timed to the moves, music, rhythm, depth and camera, fixed marks, reasons and finishing. A package skin is used as it is only when you choose the reference's identity; otherwise the roles carry your own palette, fonts and marks. Sub-brand patterns and the glass studio reel are included.
- **News reel edit type** (`ice-edit/references/edit-types/news-reel.md`): pipeline, rhythm, archive bursts, and how to cut a long episode into a reel (picking the strongest passage, the payoff, a hook of a few seconds). A programme matte kit for the depth sandwich, background washes, the question disc, silhouettes and sepia portraits of the people discussed, always with the speaker lit.
- **Moves and type with their values:** the digital camera on one take, the glow disc, counter, tapered glow arc, scanline title texture (Venetian blinds, jitter and glow), title pill, broadcast transitions and the broadcast settle curve; the pointer reveal and the coloured-head typewriter as mask reveals, the blink exit, the two-box lower third, the glass subtitle box, news sentence captions coloured by voice, keyword mode, and justified and hollow kashida blocks.
- **Sound by the numbers:** a speech-led news reel loudness and ducking profile, sound effects tied to each move type, news reel music, a broadcast voice chain, and strobes safe by default (the reference's own strobe only when you ask). `match_music.py sfx --profile news-reel`.

### Changed

- **The QA gates let a measured broadcast package pass and still fail decoration.** Logo bug, programme name, progress bar, location tag, glass plates, glow and scanline titles, flashes, typed question cards, the glow disc and the branded end card are allowed in a news reel or when the reference measures them, each with its reason row; every older rule stays for the other film types.
- **No gap without an event (L9).** The longest gap and the event density are measured on the reference; a film that exceeds them is not delivered, and a declared hold does not excuse it (`motion_check.py --reference-events`, `validate-plan.mjs` with `plan.reference`, `recipe.py --events`).
- **Fixed identity marks keep their slot (L10).** A reference's corner logo, programme name or bug is measured and placed at the same position and size, or your own mark takes that slot; checked from the style frames on.
- **Captions face a fresh transcript (L11).** The final audio is transcribed again and compared with the captions before delivery, a blocking gate (`align_script_to_asr.py --check-captions`).
- **Depth, 3D and camera carry over (L12).** Every aspect of a reference is measured and carried over, not only its colours and text: depth planes and parallax, push-throughs, the share of frames where the camera moves, 3D elements and depth of field, each with its trigger and a build route (CSS 3D, Three.js, Remotion three or Blender), gated within 30 percent of the reference.

## 0.2.3 - 2026-10-29

Lessons from four trials of 0.2.2 on raw news footage become default rules: your prompt stays the idea and your files, and Ice applies what the trials taught on its own. Each lesson is listed in `docs/maintainers/lessons.md` with the trial it came from, its scope, where the rule lives and the test that guards it (founder decision, `AGENTS.md` rule 19).

### Changed

- **Real music and sound, picked by ear.** Music and sound effects come from real libraries and real recordings, ranked by how close they measure to your reference or your kind of video (tempo, key, brightness, loudness range, sections). When you are there, you hear two or three options laid on the video at equal loudness and pick one, with the one preview you already approve; when nobody can answer, Ice takes the closest and names the other two in the delivery note. Music and sound made by code (mgaudio) are used only when you ask for them by name. A comfortable mix: the music sits under the speech, with no repeated pulse. New scripts: `match_music.py` (also ranks hero sound effects) and `preview_options.py`.
- **Real material found without being asked.** For every scene about a real event, statement, place, person or object, Ice searches for the most recent real, official footage and photos and downloads them: the owner's own download pages first, then official channels, then agencies through your own login, then CC footage, then stock, then graphics labelled as illustration. The same ladder, real first and code last, covers photos of people, flags, maps, fonts, overlays and LUTs. Free downloads need no question; `ICE_OFFLINE=1` or an optional `~/.ice-motion-director/sources.json` turns them down. A reference link is downloaded so it can be measured.
- **Free tools and models install without a question.** Whisper, demucs and the other free packages and models a route needs are installed at pinned versions and recorded in `ice/DIRECTION.md` and the delivery note. Only paid services, accounts, sign-ins and spending are asked; a system tool is one plain step for your system.
- **A reason for every element.** From any reference, Ice writes a reasons table (`REASONS.md`): each element, what triggers it in the speech, what it means, who it is on, when it appears and leaves, and why its colour and shape are so. Every storyboard row carries its trigger and reason (storyboard lint check 17), an element with no reason is cut, and the critics check it.
- **The speaker stays lit.** In news, explainers, talk shows, podcasts and interviews, dimming, silhouettes, circles and target marks fall only on the people being talked about; the speaker or guest keeps their exposure and colour.
- **The finishing layer, measured.** Motion blur, blur for depth and for entrances and exits, grain and old-film texture, vignette, glow and grade are measured from the reference (where, how much, why) and applied only there, with Ice's own tools. The slop scan lets a measured finishing effect pass and still fails decoration.
- **The identity fits the content.** When your video's content type differs from the reference's (a news reference for a service ad), Ice recommends the same editing principles with your identity or the real brand's; in auto mode that is the decision taken, and a version with the reference's own identity is one answer away.
- **Disk space and source quality.** Ice checks free space before downloads, installs and renders (`ice-state.mjs space`), works on a drive with room, downloads long sources at the output resolution (1080p for a 1080 video) and deletes heavy intermediates that can be rebuilt once their stage is approved.

## 0.2.2 - 2026-10-28

### Changed

- **Rights are yours; one record instead of blocks.** A reference's own logo, end card, identity, footage, music and voice-over can go into your video as they are, or the same style can carry your identity, or a mix: a stage 01 question whose recommendation follows your words. Every outside item (footage, music, logos) is recorded with its source, owner and license status (licensed, unknown, needs purchase). The delivery note lists what needs a license before publishing, with one neutral line that rights are yours and one line for anything a platform may mute. No permission questions, no repeated warnings. The limits on real people, the truth rules and the untrusted-content rule are unchanged.
- **Real footage first.** For a real event, statement, place or person, Ice searches for the best real, official, recent clip (news agencies, official channels, press conferences, officials' accounts), licensed or not, then stock, then graphics or generation.
- **Music.** A reference's track or any available track is an option beside new music. The sync license check runs as before and records a status; it no longer drops a track.
- `validate-assets.mjs` prints license problems as `LICENSE` lines for the delivery note instead of failing, and accepts a `web-found` source with its URL, owner and license status.

### Added

- **Speaker isolation with no model download.** Green screen or a plain wall: FFmpeg `chromakey` or `hsvkey` with `despill`. A locked-off camera with a few seconds of the empty room: FFmpeg `backgroundkey`. Commands measured on test clips, with tuning numbers. The model route stays for other footage. The stage 01 message of an edit that separates the speaker carries a shooting tip (green screen or plain wall, tripod, even light, a wide frame above the head).

## 0.2.1 - 2026-10-26

### Changed

- The 15 internal skills (the six workflows and the nine domain skills) now start their description with "Internal part of Ice Motion Director, not a command: start with /ice.", so the `/` menu marks them and points to the right command. Only the 13 commands are meant to be typed. The frontmatter stays portable (Agent Skills keys only).
- The README says to start the first message with `/ice-motion-director:ice` in Claude Code, so the director loads for sure even when other video skills are installed, and it describes the stage 01 questions as they run: four options per question, at most four per message, none when the prompt covers everything or you say "don't ask".

## 0.2.0 - 2026-10-26

The first public version.

### Added

- **Cold-viewer clarity gate.** A fresh reviewer who gets no brief, only what an audience would see (style frames and storyboard, then the animatic, then the draft), writes what happens, what is sold and the one idea. The film is built and delivered only when that matches the concept. Films for apps and products must show the product doing its real job. The remake and edit stage tables run the same reads.
- **Four choices for every open decision.** At stage 01, after a quick research pass, every decision your words leave open is asked as a question with four options, the recommended one first with its reason. You can always write your own answer, or say "don't ask" to take every recommendation.
- **Checks at the earliest stage.** Every check runs at the first stage whose material can show the problem, at the strength of the final gate. Brand identity tests (random frames must read as the brand) and a side-by-side benchmark of the style frames against real studio work are wired into the router, the routes and the workflows.
- **Style recipes.** A reference video, image set or saved site becomes one portable recipe (`STYLE-RECIPE.md` and `style-recipe.json`): measured grammar, palette, typefaces, camera and element motion, tempo, the feeling over time, open slots and a ready prompt. Ice rebuilds the style on your footage or from scratch.
- **Sound map.** A reference video's sound is mapped into music sections and energy, sound effects by type and time, voice, and loudness. Genre and instruments are proposals you confirm.
- **Drawn art quality.** Craft rules for code-drawn illustration, an art check at the style frames (05) and again at the build (07), a ladder of art sources (your art, licensed libraries, AI art only when you start it, 3D, hand-coded SVG last) and a vectorizer that rebuilds traced images by parts.
- **Run log.** Every run logs your words, short summaries of the agent's replies and every file sent or received, and delivery exports one small self-contained share file with keys, contacts and paths masked. The agent's transcript is never read.
- **Local gates.** `node scripts/gates.mjs` runs every check, and a git pre-push hook runs it before each push. Hosted CI is gone.
- A test that every `SKILL.md` carries the same version as the plugin manifests.
- `CHANGELOG.md`.

### Changed

- **No rights or consent gate.** Ice never asks whether a reference is yours or whether you have a person's permission; you carry those rights, recorded in one neutral line. Two limits stay: the reference's own footage, music, voice, logos and characters never ship (the style is recreated instead), and real people's likenesses are never used in sexual, demeaning or deceptive content. Platform AI labels are your business at upload.
- The README install section leads with the interactive `npx skills add`, which asks for agents and scope, then shows the flag forms, the native plugin installs and a new Update section.
- README and landing page links point to the site on Cloudflare (https://ice-motion-director.omarhassan.workers.dev/).
- The README gallery shows the Spotify concept ad, an unofficial concept, with a "View workflow" button. Gallery demos carry the unofficial line in the caption and the landing card, not in the film.

### Fixed

- Sound map: a beat read from the low band, a continuous low bed counted as music, energy-relative sections with a final-hit outro, weighted genre proposals, and sung versus spoken vocals (a vocal running through the music reads as probably sung).
- Reference analysis and recipes: camera versus element motion, one-take structure, robust tempo, palette roles, and honest recipe text.
- Recipe-only runs: orientation, crop, seams, free time, a slim stage 01, and export as a recipe instead of a missing film.
- QA: stillness measured on the content region, a cursor line, one rule for when a critic report is required, and lint C6 judging the on-screen box (skipping tilted 3D planes) with text size as drawn.
- Engines: `render-html` fails fast on missing files, serves the project folder and composites in software.
- Audio: music starts at full level in the master, with explicit music edge flags; `pedalboard` pinned to a build that imports on CPUs without AVX-512.
- Assets: screen captures handle language, buttons, redirects, consent banners, empty shots and UI strings; the validator finds its sheet path and handles rebuilds from several captures.
- The case study and run log never export raw UI-fidelity sheets; the run log embeds the images shared in the conversation.
- Maintenance fixes before the repo went public.

## 0.1.0 - 2026-10-20

The first private build.

### Added

- 16 merged skills from about 34 open-source video and motion repos plus the founder's own skills, with a router skill as the one entry point and plugin manifests for Claude Code, Codex, Cursor, Gemini and `npx skills`.
- Step mode: 12 stage commands (`/ice-01-brief` to `/ice-10-deliver`, plus `/ice` and `/ice-status`) for every agent, each ending in a review card.
- The production spine scaled by film size, stage order per film and edit type, supplied-material intake, the business brief, industry advertising rules and the case study export.
- The `ice-style` preset library, the real-brand material rule, a richness floor and the AI media policy.
- Cross-platform scripts, pinned dependencies in one `versions.json`, freshness checks, an asset manifest validator and verified platform safe zones.
- The voxel ice mascot, icons and brand guide; a README with install steps for every agent and operating system; credits and byte-identical third-party licenses.

### Fixed

- Arabic word counts, false freeze detection, scoped end holds and the richness gate in QA.
- A numpy-only music fallback, a 48 kHz true-peak master, a zero-install HTML renderer and an engine fallback ladder.
- Every `SKILL.md` kept under 20 KB for agents that cut long skills, with a size test.
