# Run setup

Read at the start of every run and on every resume (section 1), and in full at spine stage 01, after the ice-direction intake: the project files this workflow reads and writes, the noncommercial gate, the run mode, the decision rules and the step order. Also the index of domain skills this workflow calls, for any stage.

Contents: 1 Inputs and outputs. 2 Noncommercial material gate. 3 Run mode. 4 Rules for decisions. 5 Pipeline order. 6 Domain skills this workflow calls.

## 1. Inputs and outputs

| Item | Where | Notes |
|---|---|---|
| Brief | `ice/BRIEF.md` (router + `ice-direction`) | Read first. Slots that matter most here: goal, audience, language and dialect, platform, duration, message, must-include content, voice source, commercial or not |
| Direction | `ice/DIRECTION.md` | Palette, type, look, grammar picks with reasons. Never override a logged decision without logging the change |
| Research | `ice/research/` | Dated notes and the facts list (stage 01, research and facts step) |
| Plan | `ice/plan/` | `script.md`, `versions.md`, `voice/`, `words.json`, `semantics.json`, `segments.json` (this route's cue sheet), `storyboard.md`, `mood-board/`, `style-frames/` |
| Review | `ice/review/` (written by `ice-qa` and critics) | Gate outputs, critic notes, delivery report |
| Film | Project output folder chosen by `ice-engines` | MP4 plus caption sidecars, chapters list and cover when the platform uses them |

## 2. Noncommercial material gate

`noncommercial/video-talkcraft/` and `noncommercial/anything2explainer/` (in this skill's folder) hold PolyForm Noncommercial reference files. Before opening any of them, check `commercial_use` in `ice/state.json`.

| `commercial_use` | Action |
|---|---|
| `yes` or `unknown` | Do not open or use those folders, and do not ask only to unlock them. Everything needed is in `references/` |
| `no`, confirmed by the user in words | You may read them for extra depth; log the confirmation in `ice/DIRECTION.md` |

Never copy text or code from those folders into a film project or into another skill.

## 3. Run mode

The run mode is derived from the size, the brief and the platform at 01, never asked. Write it as `run_mode` in `ice/state.json` (`ice-state set run_mode <fast, standard or long-form>`) and as a D-entry in `ice/DIRECTION.md`; `subtype` is `explainer`, the film type the ice-qa scripts read. It never changes the stops: those come only from the router's stops table (`ice-motion-director/SKILL.md` section 5, "Stops"), as "Stops and approvals" in this skill's `SKILL.md` says.

| Mode | Use when | What it changes | Read |
|---|---|---|---|
| Fast | Brief asks for speed, 45 to 120 s, one idea, draft or internal use | 02 and 05 decided in one batched direction pass with fewer options; the 06 sample is judged by the critic, and auto mode skips the preview approval because the brief asked for speed (logged) | `references/run-setup.md` (section "Fast pipeline: brief to film in minutes") |
| Standard | Public film up to about 3 min | The full spine stage by stage; the 06 sample is the preview for the router's approval stop | `SKILL.md`, stage by stage |
| Long-form | Over 3 min, chapters, or many shots built in parallel | Chapters planned at 03; the 06 sample is the first 30 s; builders and critics per chapter group at 07 and 09 | `references/run-setup.md` (section "Long-form explainers") |

## 4. Rules for decisions

- What this workflow needs from the user (voice source, consent for an install, a download or a paid or cloud voice, and for long-form the length and the language when open) goes inside the single stage 01 message, through the `ice-direction` question rules (four options per question, the recommended one first, at most 4 questions per round, plain words). At any later stage: auto mode decides, logs and reports; step mode puts it in that stage's review card.
- The script (03) is the cheapest place to change anything. After timing exists, one changed word means a retime. So the script is approved before the voice step: by the approver in auto mode, on the 03 review card in step mode.
- Decide everything else yourself and log it in `ice/DIRECTION.md` with the reason.

## 5. Pipeline order

The stages, their steps, files and checks are in `## Spine stages` of this skill's `SKILL.md`. Stage numbers are always two digits; the steps inside a stage carry names, never numbers. Run the steps in the order listed. Each step writes its file before the next starts. A step whose check fails goes back, never forward.

The voice and timing steps (stage 03) before the segments step (stage 04) is fixed: timing comes from real audio durations, never from estimates. When the user will record the voice later, build to estimated timing, hand over the full voice script in the message, and retime to the recording when it arrives (`references/voice-first-timeline.md`, section on late voice).

## 6. Domain skills this workflow calls

| Need | Call |
|---|---|
| Questions, research queries, palette, type, pitch round, anti-sameness | `ice-direction` |
| Grammar and style catalog (collage, whiteboard, concept transform, kinetic, keynote UI, chart, storytime, drawing media) | `ice-styles` |
| Easing curves, cut and transition catalog, seams, camera arithmetic | `ice-motion` |
| Captions, subtitle styling, kinetic type, readability gates | `ice-type` |
| TTS engines and settings, pacing clamps, music bed, SFX, mix, loudness | `ice-audio` |
| Arabic and RTL text, dialect voice, Arabic word timing | `ice-arabic` |
| Engine choice, render, export, platform sizes and safe zones | `ice-engines` |
| Asset sourcing and licenses, truth sheet, logos, fonts | `ice-assets` |
| Gates, dead-time and motion checks, critic loop, fingerprint, delivery report format | `ice-qa` |


## Fast pipeline: brief to film in minutes

Use when the brief asks for speed, the film is 45 to 120 s with one idea, or a draft is wanted. Quality floor is unchanged: facts, word timing and verification still run. What shrinks is the number of stops and options.

### 1. Behavior

- Decide the normal things yourself: look, length, voice, layout, wording. Log each choice in `ice/DIRECTION.md` with its reason.
- Questions go only in the single stage 01 message, and only when you cannot continue without them: the topic is unclear, a fact that matters cannot be checked, the user wants a paid or cloud service that is not set up, or the request is something code cannot make (for example camera footage that does not exist). After 01, auto mode decides, logs the choice in `ice/DIRECTION.md` and reports it in the delivery note (a fact that cannot be checked is left out; an impossible item is replaced by what code can make, labelled); step mode puts it on that stage's review card.
- Render early, render often: placeholders before assets, estimated timing before the voice, silent before audio. Show intermediate renders rather than describing them.

### 2. Tool stack (local first)

| Need | Choose | Rule |
|---|---|---|
| Voice | A local TTS engine already installed, or the user's recording | If none is installed, a free local engine with an exact pin in `ice-engines/references/versions.json` is installed without a question and recorded (`ice-engines/references/engine-choice.md` section 7.6). With no pinned engine: build to estimated timing with the late-voice rule (`references/voice-first-timeline.md` section 9), log it, and say in the delivery note what a voice engine would add. Cloud TTS only with the consent in `references/voice-first-timeline.md` |
| Word timing | Engine word boundaries, or a local speech recognizer with word timestamps plus forced alignment to the script | Never estimate from character counts |
| Picture | The engine `ice-engines` picks for the platform (canvas with a headless browser, HyperFrames, Remotion) | Deterministic: every frame a pure function of time, seeded randomness only |
| Music and SFX | The user's track, or real library music and recorded SFX from the `ice-audio` ladders (`ice-audio/SKILL.md` section 5); offline with nothing on disk, no bed and a "music needed" line in the delivery note | Optional in fast mode; music made by code only when the user asks for it (`ice-audio/SKILL.md` core rule 7) |

Arabic or a language the local engine does not voice: call `ice-arabic` before choosing the voice.

### 3. Defaults (when the brief is silent)

| Item | Default |
|---|---|
| Length | 45 to 120 s |
| Size | From the platform slot via `ice-engines`; landscape when no platform is named |
| Frame rate | 30 fps |
| Pace | 1.0; 1.15 to 1.3 for social or expert viewers; above 1.4 is hard to follow |
| Scene | One idea, 1 to 3 sentences, 4 to 15 s |
| Change rate | Something new every 2 to 4 s |
| Elements on screen | At most 5 or 6 |
| Captions | On for vertical, square and 4:5; sidecar files always |

### 4. Steps

Run these named steps in the order listed. The two-digit number after each name is the spine stage it belongs to (`../SKILL.md`, `## Spine stages`); in fast mode the angle (02) and the look (05) are decided in one batched direction pass, and the sample (06) needs no user stop.

- **Facts (01):** a short research note with sources for every number and name (`references/research-and-facts.md`). Never invent a number; leave out what cannot be checked.
- **Script (03):** question or problem first, small steps, one concrete example, one plain closing sentence (`references/script-writing.md`).
- **Voice (03):** voice, then speech check; fix pronunciation with display and spoken pairs.
- **Tags and segments (04):** tag sentences and write segments with word cues (`references/semantic-tagging.md`, `references/word-timed-segments.md`). Every sentence triggers at least one picture.
- **Build (07):** lay out each scene as the picture it should be at its end; let the camera find the close-ups.
- **Check before rendering (07):** layout, contrast, small text at player width, caption band clear, stale stretches (`references/research-and-facts.md` (section "Verification loop for agents that cannot watch") section 2). Fix every error and warning.
- **Stills (07):** stills and a contact sheet; judge them like a viewer.
- **Draft, then final render (07 draft, 10 final):** draft with no motion blur and fast settings, then the final render; the verify step below runs on the final file before anything is reported.
- **Verify (09):** re-transcribe the mix, loudness and peaks via `ice-audio`, black frames and silence via `ice-qa`.
- **Report (10):** file paths (film, captions, chapters, cover), duration, verification numbers, and what could not be checked. Never hand over the draft as the final.

### 5. When fast mode must stop

Switch to standard mode, log the switch in `ice/DIRECTION.md` and report it (auto mode: in the delivery note; step mode: on the current review card) when: the film grows past about 3 minutes, a required fact cannot be sourced, the user asks for revisions of the look, or a critic finds a P0 that needs a new script.


## Long-form explainers

Films over about 3 minutes, chaptered films, and any film built by several agents in parallel.

### 1. Length and chapters

- Never cap length and never assume it silently. An open length goes inside the stage 01 message (`ice-direction` question rules); unanswered, take the brief's platform default, log it as a D-entry and report it. Plan with the length budgets in `references/script-writing.md` section 10 (sentence and chapter counts per length: the `ice-ideas` skill, `references/script-writing.md` section 3).
- A very long request (illustration: ten minutes) is settled at 01 the same way, then built chapter by chapter as separate projects of about 90 s or less, joined at the end. This is a build strategy, not a length cap.
- Chapter cards appear only in films over about 3 minutes; each chapter is 60 s or more.
- A chapter progress bar switches its highlight at the chapter card's start, not at the chapter's first sentence. HUD label changes keep the capsule, morph its width over about 10 frames, fade the old text out and the new in; offset HUD changes from big effects by a few frames.
- Platform chapters (where the platform supports them): at least 3, each 10 s or longer, titles 1 to 60 characters.

### 2. Persistent world (one space, never reset)

A new graphic every few seconds makes the viewer restart comprehension every few seconds. For long arguments, the film lives in one space:
- Decide the spatial grammar before building anything and hold it for the whole runtime. Break it once, deliberately, for meaning.
- An element, once drawn, is never redrawn, moved or relabeled.
- Three altitudes: world, region, detail. Move between adjacent ones; jumping from detail to world is reserved for a payoff.
- Name framings as exact world windows, not scale factors; window edges fall between labels. Reuse the same window for the same purpose; near-identical framings read as drift.
- Movement duration varies with distance travelled, not one global preset.
- One traveling subject carries the story; its state visibly changes; it never teleports and moves along drawn connectors at constant speed.
- Spotlight: exactly one element at full brightness at a time; context dimmed but legible; finished props retire fully, not to a half-visible gray. One opacity authority per element per time window.
- Open loops in long-form (a visibly incomplete thing in the world, re-shown at every boundary, closed on the opening image): the `ice-ideas` skill, `references/hooks-and-openers.md` section 6. In a persistent world the incomplete thing is part of the world (illustration only: an empty socket on a spine, a ghosted top of a stack, an unfilled column, a blank end of a timeline).
- A counter needs a name: pair the numeral with a 1 to 2 word label of the current item.
- Time everything to word starts, entering 0.15 to 0.25 s ahead of the anchor; never divide a section evenly into beats. Any stretch over about 1.5 s with nothing happening is a dead screen.
- When a presenter is on camera, aim for about 40 percent presence across a graphics-led film; footage handling is `ice-edit`.

### 3. Production at scale

- Split the build into groups of shots (about 5 to 7 groups for a 4 to 5 minute film), one builder agent per group, dispatched in waves of about 4. Check machine-wide agent capacity first.
- One heavy task per agent: agents that already read many images fail often on a second heavy task.
- Agents write to disk as they go; an agent that holds everything to the end can lose an hour of work. Before relaunching a dead agent, check its files on disk; a nudge often revives it.
- Before fanning out, run a short probe render of any shared system (camera states, shared components) to catch problems that would make every group fail.
- Put cross-group constants and helpers in a shared library before dispatch; any tool the protocol names must exist there. One generator per section; edit the generator, never its generated output; shared modules are not touched by parallel builders. Namespace shared definitions (for example SVG ids) before assembly.
- Builders report storyboard errors they find; approved fixes become film-wide rules.
- Spot-check builder self-reports, but gather full evidence before concluding a builder was wrong.

### 4. Gates for long films

Approved below means: by the user in step mode; in auto mode by the critic and the approver, except item 4, which is the router's one preview approval when the session is interactive and the user did not say not to ask.

1. Length and language settled at 01 (answered or defaulted and logged).
2. Script approved with chapter names and seams.
3. Voice approved when the voice was open.
4. First group built, first 30 s rendered with voice, approved, before other groups start.
5. Full render v1 with contact sheets and frame metrics.
6. Review per chapter by fresh critics (at most about 7 shots each, plus one cross-chapter consistency pass), fix agents per 1 to 2 groups, render, recheck by new critics, final check. Let critics verify a proposed fix before it is dispatched.
7. Verify the assembled film, never section prototypes.

Reference result from a measured long explainer: version 1 had 1 high, 23 medium and 42 low findings, mostly blank frames at cuts, entrances crossing the caption band, exits not reaching zero and too-short overlay exits; two review rounds reached zero high and zero medium.

### 5. Session memory

Keep `ice/state.json` current and a short running log of decisions (with numbers) so a fresh session can resume. When a session degrades (re-deriving decided things, longer and less certain answers), write state to disk and continue in a fresh session that verifies before it trusts.
