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
| Fast | Brief asks for speed, 45 to 120 s, one idea, draft or internal use | 02 and 05 decided in one batched direction pass with fewer options; the 06 sample is judged by the critic, and auto mode skips the preview approval because the brief asked for speed (logged) | `references/fast-pipeline.md` |
| Standard | Public film up to about 3 min | The full spine stage by stage; the 06 sample is the preview for the router's approval stop | `SKILL.md`, stage by stage |
| Long-form | Over 3 min, chapters, or many shots built in parallel | Chapters planned at 03; the 06 sample is the first 30 s; builders and critics per chapter group at 07 and 09 | `references/long-form-explainers.md` |

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
