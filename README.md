<p align="center">
  <img src="brand/mascot-seated.webp" alt="Ice, the Ice Motion Director mascot: a voxel ice cube in a navy beret, sitting in a wooden director's chair with a clapperboard" width="180">
</p>

<h1 align="center">Ice Motion Director</h1>

<p align="center">
  <b>Turn your coding agent into a motion design and video editing studio.</b><br>
  Describe a video, hand it your footage, or show it a reference. It researches, asks, plans, writes every frame as code, renders an MP4 on your computer and checks it before you see it.
</p>

<p align="center">
  <a href="https://github.com/Omar-Tnzxo/ice-motion-director/releases/latest"><img alt="Latest release" src="https://img.shields.io/github/v/release/Omar-Tnzxo/ice-motion-director?color=FF6F5E&label=release"></a>
  <a href="LICENSE"><img alt="License: Apache-2.0" src="https://img.shields.io/github/license/Omar-Tnzxo/ice-motion-director?color=1E2A5A"></a>
  <a href="https://ice-motion-director.omarhassan.workers.dev/"><img alt="Website" src="https://img.shields.io/badge/website-ice--motion--director-7FD8FF"></a>
</p>

<p align="center">
  <a href="#quick-start">Quick start</a> ·
  <a href="#install">Install</a> ·
  <a href="#try-it">Try it</a> ·
  <a href="#the-ten-stages-at-a-glance">Ten stages</a> ·
  <a href="#why-it-is-different">Why it is different</a> ·
  <a href="#gallery">Gallery</a> ·
  <a href="#faq">FAQ</a> ·
  <a href="https://ice-motion-director.omarhassan.workers.dev/">Website</a>
</p>

<!-- Each preview is a short loop of the real delivered film; click it to open the case study with the full video and every stage. -->
<table>
  <tr>
    <td colspan="2" width="50%" valign="top"><a href="https://ice-motion-director.omarhassan.workers.dev/showcase/spotify-concept-ad/"><img src="assets/readme/gallery/spotify-concept-ad.webp" width="100%" alt="Spotify concept ad: a drawn night street in a traffic jam; after play is pressed, the honks, the drill and the motorbike become the beat and the windows light up"></a><br><sub><b>Spotify</b> concept ad, made from scratch</sub></td>
    <td colspan="2" width="50%" valign="top"><a href="https://ice-motion-director.omarhassan.workers.dev/showcase/aj360-raw-edit/"><img src="assets/readme/gallery/aj360-raw-edit.webp" width="100%" alt="AJ360 style edit: a seated presenter with Arabic kinetic words, NASA mission-control footage and an app end card"></a><br><sub><b>AJ360 style edit</b>, raw take recut in a reference style</sub></td>
  </tr>
  <tr>
    <td width="25%" valign="top"><a href="https://ice-motion-director.omarhassan.workers.dev/showcase/mohawalat-fahm-france-reel/"><img src="assets/readme/gallery/mohawalat-fahm-france-reel.webp" width="100%" alt="Mohawalat Fahm reel: a vertical Arabic reel cut from a TV talk-show episode, with lower thirds, big Arabic keywords and protest footage"></a><br><sub><b>Mohawalat Fahm</b> reel</sub></td>
    <td width="25%" valign="top"><a href="https://ice-motion-director.omarhassan.workers.dev/showcase/carney-alberta-aj-reel/"><img src="assets/readme/gallery/carney-alberta-aj-reel.webp" width="100%" alt="Carney on Alberta: a vertical news reel of a government video message with a red disc, a name strap, bullet cards and a result card"></a><br><sub><b>Carney on Alberta</b></sub></td>
    <td width="25%" valign="top"><a href="https://ice-motion-director.omarhassan.workers.dev/showcase/obama-iran-aj-reel/"><img src="assets/readme/gallery/obama-iran-aj-reel.webp" width="100%" alt="Obama on Iran: a vertical news reel of a weekly address over a map wall, with flags, a figure card and big keywords"></a><br><sub><b>Obama on Iran</b></sub></td>
    <td width="25%" valign="top"><a href="https://ice-motion-director.omarhassan.workers.dev/showcase/aj-greenscreen-lawyers-ad/"><img src="assets/readme/gallery/aj-greenscreen-lawyers-ad.webp" width="100%" alt="Green screen ad: a keyed presenter over a map wall with big numbers, the Capitol, real footage and the advertiser's end card"></a><br><sub><b>Green screen ad</b></sub></td>
  </tr>
</table>

<p align="center"><sub>Real deliveries, shown as short silent loops. Click any one for the full video, the prompt and every stage. Unofficial tests and concepts, not affiliated with the brands shown (<a href="#gallery">details</a>).</sub></p>

---

## What it does

Ice Motion Director is an open-source set of agent skills for motion graphics, motion design and video editing in Claude Code, Codex, Cursor, Gemini CLI and 40+ other coding agents. You describe the video in one prompt (or hand it your footage, or a reference), and your agent takes it from the brief and the script to a rendered MP4, writing every frame as code and checking it before you see it. It is free under Apache-2.0 and needs no After Effects and no paid video model.

**Who it is for:** founders and marketers who need an ad, a launch film or social cuts without a studio; editors and newsrooms who want reels, shorts and talking-head edits cut from long footage; designers and developers who want Lottie and UI motion with a handoff; and anyone who writes in Arabic or mixes Arabic and English.

One router skill reads your request and sends it to the right workflow:

| You ask for | It runs | You get |
|---|---|---|
| A film made from scratch: launch film, app ad, brand film, logo sting, kinetic type, data story, social short | `ice-film` | A finished MP4 plus a delivery report |
| A video where a voice explains something | `ice-explainer` | A narrated explainer with captions |
| "Make it like this" with a reference video, site or images | `ice-remake` | A new film in that style, with your content |
| An edit of your own footage: YouTube, podcast clips, talking-head ads, shorts, news reels, B-roll | `ice-edit` | The cut, captions, vertical versions |
| Lottie, loaders, icons, UI motion for an app or site | `ice-lottie` | Lottie JSON or animated SVG plus a developer handoff |
| Ideas, hooks, scripts, storyboards | `ice-ideas` | A concept set and a script, ready to build |

Every film is code (HTML, CSS, GSAP, Remotion, Lottie or FFmpeg) and renders the same way every time. Nothing is generated as stock footage: text, numbers and logos are always set in code, exactly as you approved them.

## Quick start

About a minute of your time; the film itself takes longer (see the note below). This uses Claude Code; every other agent is in [Install](#install).

**1. Install** (needs Node, FFmpeg, Chrome and Python 3 on your computer: [prerequisites](#prerequisites)):

```bash
claude plugin marketplace add Omar-Tnzxo/ice-motion-director
claude plugin install ice-motion-director@ice-motion-director
```

**2. Open Claude Code in an empty folder and send one message:**

```text
/ice-motion-director:ice Make a 20-second launch film for my note-taking app. Here is the site: <your URL>
```

**3. Answer its questions, then let it run.** It researches your business first, then asks about every decision your message leaves open, four options each with the recommended one first (say "decide yourself" to skip them). If you are there, it shows you one preview and lets you pick the music from real tracks laid on the film. Then it runs to the end: the film lands in `ice/renders/final/` and the delivery note, with every decision and its measured checks, in `ice/review/NOTE.md`.

## Two ways to use it

1. **One prompt, for everyone.** In Claude Code, start your first message with `/ice-motion-director:ice`, then describe the film in your own words, short or long. The command makes Claude Code load the director's instructions itself, so the run starts the right way even when other video skills are installed. A prompt without the command usually works too, but then the agent picks the skill on its own, which is not guaranteed. Other agents: see [how to type the commands](#how-to-type-the-commands). The director researches your business first, then asks about every decision your prompt leaves open: four options per question with the recommended one first, at most four questions per message, and more than one message when many decisions are open (including which official brand files it may use). It asks nothing when your prompt already covers everything, or when you say "don't ask" or "decide yourself". Then, only if you are there to answer, one preview: the style frames or the animatic. After that it runs to the final file with no more questions. Everything it decided is logged and explained in the delivery note.
2. **Step by step, for people who want to steer.** Run one stage at a time with numbered commands. In Claude Code the form that always works is `/ice-motion-director:ice-01-brief` to `/ice-motion-director:ice-10-deliver`. Each stage stops with a review card; talk it through, ask for changes or other options as often as you like. Say "approved" to lock the stage (it then names the next command), or "approved, go on" to lock it and start the next stage. See [Workflow, step by step](#workflow-step-by-step).

You can switch at any time: type a stage command in the middle of a one-prompt run, or `/ice` to let it finish the rest on its own.

> **What a first film takes.** From you: one prompt that starts with the command, then the questions on every open decision (four options each, at most four per message, none if your prompt covers everything or you say "don't ask") and, if you are there, one preview, where you also hear two or three real music options laid on the film and pick one. Behind it, your agent runs all ten stages with several helper agents, so even a short ad runs for a while and uses far more of your plan than a chat answer. If your agent hits a usage limit in the middle, type `/ice` (or send the same prompt) later: it resumes from `ice/state.json` where it stopped.

## Why it is different

- **The same professional floor for every prompt.** A one-line prompt gets the full process. A detailed brief or a design file gets the same quality and every spec you gave is obeyed. Prompt length only changes who makes each decision.
- **A reason for every element.** Every card, keyword, disc or overlay names the line that triggers it, what it means and when it leaves; an element with no reason is cut. With a reference, nothing is copied blindly. ([`notes-files.md`](skills/ice-remake/references/notes-files.md) section 6, checked by [`storyboard_lint.py`](skills/ice-qa/scripts/storyboard_lint.py))
- **The speaker stays lit.** In news, explainer and talk-show edits, dimming, silhouettes and discs are for the people being talked about, never for the person speaking; the speaker may only recede inside a planned window and is measured on the render. ([`layers-and-isolation.md`](skills/ice-edit/references/layers-and-isolation.md) section 5)
- **Real music and real sound.** Music and sound effects are real recordings from libraries, matched to your film, with two or three tracks laid on the film for you to pick by ear; Ice also publishes its own pack of 128 CC0 effects, fetched once on first use. Sound made by code is used only when you ask for it by name. ([`ice-audio`](skills/ice-audio))
- **Checked before you see it.** The builder never grades itself: separate critic roles and a fresh viewer who never saw the brief judge the work, and scripted gates measure the render itself (pace, faces under text, flashes, the speaker's light, every sound effect in the mix, loudness). Any failed hard gate blocks delivery, and the delivery report carries the measured numbers. ([`ice-qa`](skills/ice-qa))
- **Finds real material on its own.** For a real event, person or place it looks for the most recent real, official footage and photos and downloads them, each recorded with its source and license status. You never have to ask for any of this in your prompt: your prompt is the idea and your files.
- **No two films look alike.** Each film starts with research dated today and built only from your brief, a pitch round with unexpected directions, and a check against your previous films and every bundled template. A film that drifts to the stock AI look (blue and purple everywhere, with no reason in the brief) fails its own gate. A look you chose yourself is always kept.
- **Arabic and right-to-left are first class.** Letterforms and dots in motion, kashida, bidi, numerals, Arabic captions and dialect as a setting.
- **Lessons become rules.** Every note from the founder and every trial run becomes a rule with a test that stops it coming back: 41 so far, listed in [`lessons.md`](docs/maintainers/lessons.md).

## Install

**Any agent (Claude Code, Codex, Cursor, Gemini, Copilot, Windsurf, Cline, Roo, Kilo, OpenCode, Antigravity, Amp, Goose, Kiro, Qwen, Trae, Zed, Warp and more):**

```bash
npx skills add Omar-Tnzxo/ice-motion-director
```

It asks two things: which agents to install into, and whether to install for this project only or for every project on your computer (global). Keep every skill selected: the skills open each other, so picking only some breaks the run. Needs Node 22.20 or newer ([prerequisites](#prerequisites)).

Prefer no questions? Add flags:

| You want | Add |
|---|---|
| Every agent, every project, no questions | `-g --all` (the same as `-g -s '*' -a '*' -y`) |
| Only the agents you name | `-s '*' -a claude-code -a cursor` (one `-a` per agent) |
| Every project instead of this one | `-g` (without it, skills go into the current project) |
| Copies instead of links | `--copy` (for drives that cannot hold links, such as some network or USB drives; Windows itself needs no developer mode, links are made as junctions) |
| The list of agent names | Pass any unknown name, such as `-a help`: the tool stops and prints every valid name. |

**Claude Code plugin:**

```bash
claude plugin marketplace add Omar-Tnzxo/ice-motion-director
claude plugin install ice-motion-director@ice-motion-director
```

Inside a session: `/plugin marketplace add Omar-Tnzxo/ice-motion-director`, then `/plugin install ice-motion-director@ice-motion-director`.

<details>
<summary><b>Claude.ai and Claude Desktop</b></summary>

Open **Customize > Plugins > Add > Add marketplace** and enter `Omar-Tnzxo/ice-motion-director`. Turn on **Code execution and file creation** in **Settings > Capabilities** first. Update with **Check for updates** on the plugin page.

What works there: the brief, research, concepts, scripts and storyboards. Rendering needs a browser and FFmpeg on a computer, which the chat's code sandbox may not offer (not verified), so render the film with a local agent such as Claude Code.
</details>

<details>
<summary><b>Codex (CLI and app)</b></summary>

```bash
codex plugin marketplace add Omar-Tnzxo/ice-motion-director
codex plugin add ice-motion-director@ice-motion-director
```

Or run `/plugins` in Codex and install it from there, then start a new session. Update: `codex plugin marketplace upgrade ice-motion-director`. In the Codex app, use the **Plugins** tab.
</details>

<details>
<summary><b>Cursor</b></summary>

```bash
npx skills add Omar-Tnzxo/ice-motion-director -a cursor
```
</details>

<details>
<summary><b>Gemini CLI and Antigravity</b></summary>

```bash
gemini extensions install https://github.com/Omar-Tnzxo/ice-motion-director
agy plugin install https://github.com/Omar-Tnzxo/ice-motion-director
```

Update Gemini with `gemini extensions update ice-motion-director`; run the same `agy` command again to update Antigravity CLI. Antigravity app and IDE: `npx skills add Omar-Tnzxo/ice-motion-director -a antigravity`.
</details>

<details>
<summary><b>GitHub Copilot (CLI and VS Code)</b></summary>

```bash
copilot plugin marketplace add Omar-Tnzxo/ice-motion-director
copilot plugin install ice-motion-director@ice-motion-director
```

VS Code: Command Palette, **Chat: Install Plugin From Source**, paste `https://github.com/Omar-Tnzxo/ice-motion-director`. Update: `copilot plugin update ice-motion-director`.
</details>

<details>
<summary><b>Qwen Code</b></summary>

```bash
qwen extensions install Omar-Tnzxo/ice-motion-director
```

Update: `qwen extensions update ice-motion-director`.
</details>

<details>
<summary><b>Windsurf, Cline, Roo Code, Kilo Code, OpenCode, Amp, Goose, Kiro, Trae, Zed, Warp, Augment and others</b></summary>

```bash
npx skills add Omar-Tnzxo/ice-motion-director -a <agent>
```

Agent ids: `windsurf`, `cline`, `roo`, `kilo`, `opencode`, `amp`, `goose`, `kiro-cli`, `trae`, `zed`, `warp`, `augment`. Manual copy paths for every agent and every OS: [install matrix](docs/maintainers/install-matrix.md).
</details>

<details>
<summary><b>Windows notes</b></summary>

- Every command above works the same in PowerShell and cmd.
- If PowerShell says running scripts is disabled, use `npx.cmd skills add ...`, or allow scripts for your user once with `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.
- `--all` works the same in PowerShell and cmd (in cmd, `--skill '*'` does not work; quote it as `--skill "*"`).
- In WSL, install inside WSL only when your agent also runs inside WSL.
- Links are made as directory junctions, so no admin rights or developer mode are needed. If a drive refuses them, add `--copy`.
</details>

### Update

Skills installed with `npx skills add`:

```bash
npx skills update
```

Add `-g` to update only global skills, or `-p` for only this project's. Plugins update through their own manager, and an update arrives only when a new version of Ice is released:

| Agent | Update |
|---|---|
| Claude Code | `claude plugin update ice-motion-director@ice-motion-director` (or `/plugin` > Marketplaces > Update marketplace) |
| Claude.ai and Claude Desktop | **Check for updates** on the plugin page |
| Codex | `codex plugin marketplace upgrade ice-motion-director` |
| Gemini CLI | `gemini extensions update ice-motion-director` |
| Antigravity CLI | run `agy plugin install https://github.com/Omar-Tnzxo/ice-motion-director` again |
| GitHub Copilot | `copilot plugin update ice-motion-director` |
| Qwen Code | `qwen extensions update ice-motion-director` |

What changed in each version: [CHANGELOG](CHANGELOG.md).

### Prerequisites

Your agent checks these for the route you pick and tells you what is missing, with the one command for your system. Free packages and models a route needs (transcription, stem separation and similar) it installs on its own at pinned versions and names in the delivery note; anything paid or behind an account is asked first. Exact minimum versions live in [`versions.json`](skills/ice-engines/references/versions.json).

| Need | Windows | macOS | Ubuntu or Debian | Fedora | Arch |
|---|---|---|---|---|---|
| Node.js (LTS) | `winget install --id OpenJS.NodeJS.LTS -e` | `brew install node@24` | nvm, then `nvm install --lts` | `sudo dnf install nodejs` | `sudo pacman -S nodejs npm` |
| FFmpeg | `winget install --id Gyan.FFmpeg -e` | `brew install ffmpeg` | `sudo apt install ffmpeg` | `sudo dnf install ffmpeg-free` | `sudo pacman -S ffmpeg` |
| Chrome or Chromium | `winget install --id Google.Chrome -e` | `brew install --cask google-chrome` | Chrome .deb or `sudo snap install chromium` | `sudo dnf install chromium` | `sudo pacman -S chromium` |
| Python 3 | `winget install --id Python.Python.3.13 -e` | `brew install python` | `sudo apt install python3 python3-venv` | `sudo dnf install python3` | `sudo pacman -S python` |

Ideas and scripts need nothing. Lottie needs Node. Every delivered film (films, explainers, remakes and edits) needs Node, FFmpeg, a browser and Python 3 with the quality-check packages: without Python a film can be built but not delivered, because its richness check cannot run.

## Try it

Start your agent in an empty folder and paste one of these. In Claude Code, put `/ice-motion-director:ice` in front of it so the director is sure to start:

```text
Make a 20-second launch film for my note-taking app. Here is the site: <your URL or files>
```

```text
Cut this podcast recording into three vertical shorts with Arabic captions.
```

```text
Make a 30-second film for my bakery in the style of this reference video. <attach the file>
```

```text
Explain how our refund process works in a 60-second narrated video for new customers.
```

```text
Give me five ad concepts and a script for a real-estate open day, then build the one I pick.
```

## The ten stages at a glance

Every film runs through the same ten stages, like a production company. Short pieces such as a loader or a logo sting skip the stages they do not need, and anything you already have (your script, your storyboard, your music) is checked, not redone.

| Stage | Command | What it makes | You review |
|---|---|---|---|
| 01 Brief | `/ice-01-brief` | Research on your business, brand and the advertising rules of your industry, then the brief | The questions on every open decision, then the brief |
| 02 Concept | `/ice-02-concept` | Several ideas, at least two unexpected, a critic's pick, and the craft plan | The ideas side by side |
| 03 Script | `/ice-03-script` | On-screen words and voiceover, timed to the beats, plus the versions you will get | The script |
| 04 Storyboard | `/ice-04-storyboard` | Every shot as a sketch, with framing, length and transition | The storyboard |
| 05 Look | `/ice-05-look` | Mood board, colors, fonts and style frames with your brand's real material | The style frames |
| 06 Animatic | `/ice-06-animatic` | A rough, timed version of the film | The animatic, and the music from two or three real tracks |
| 07 Build | `/ice-07-build` | The full film, animated in code | Key frames and a draft |
| 08 Sound | `/ice-08-sound` | Music, sound effects, voice, then the mix | Each part, and the measured loudness |
| 09 Review | `/ice-09-review` | Scripted gates and fresh critics, then fixes | Each check with its measured result |
| 10 Deliver | `/ice-10-deliver` | Final files in every language, size and length asked for, captions and the delivery report | The delivered files |

## Workflow, step by step

With the commands you run the stages one at a time. Each stage ends with a review card: what was made (with previews), the options considered and why this one won, the critic's notes, and the choices still open. Nothing moves on until you say it is approved. Type anything after a command to steer that stage, for example a tone, a length or a detail to keep.

1. `/ice-01-brief`: research on your business, brand and the advertising rules of your industry first, then who the film is for, the message, platform and length, plus anything you already have. **You review:** the brief, after the questions on every open decision (four options each, at most four per message).
2. `/ice-02-concept`: several ideas, at least two of them unexpected, and the one the critic picked. **You review:** the ideas side by side.
3. `/ice-03-script`: the words on screen and the voiceover for each language, timed to the beats, plus the shorter cuts and other versions you will get. **You review:** the script.
4. `/ice-04-storyboard`: every shot as a rough sketch, how it is framed, how long it lasts and how it moves to the next. **You review:** the storyboard.
5. `/ice-05-look`: a mood board, then colors, fonts, style and motion feel, shown as a few still frames. **You review:** the mood board and the style frames. Stages 4 and 5 can run at the same time.
6. `/ice-06-animatic`: the storyboard and the look together, as a rough, timed version of the film with temporary sound. **You review:** the animatic, and you pick the music from two or three real tracks laid on it.
7. `/ice-07-build`: the full film, animated in code. **You review:** key frames and a draft.
8. `/ice-08-sound`: in two parts. First the music (the real track you picked), the sound effects (real recordings) and the voiceover (this can happen while the film is built), then the final mix on the draft. **You review:** each part; the mix with its loudness measured.
9. `/ice-09-review`: quality checks and independent critics, then fixes. **You review:** each check with its measured result.
10. `/ice-10-deliver`: the final files in every language, size and length you asked for, with captions and a delivery report that also lists the permissions a brand owner would need. **You review:** the delivered files.

Also: `/ice-status` shows every stage, its status and the command to run next; `/ice` runs or resumes everything on its own. A stage that needs an earlier one tells you which command to run first, and a stage waiting for your review says so. Stages you already supplied (your own script or storyboard, for example) are checked, not redone. Short pieces such as a loader or a logo sting skip the stages they do not need.

### How to type the commands

How to type the commands in your agent:

| Agent | Type |
|---|---|
| Claude Code, Cursor, GitHub Copilot, Cline, Qwen Code, Kiro, Antigravity | `/ice-01-brief` |
| Claude Code with the plugin installed | `/ice-01-brief`, or the namespaced form `/ice-motion-director:ice-01-brief`, which always works |
| Codex | `$ice-01-brief` |
| Gemini CLI | `/ice-01-brief`, from the extension's commands |
| OpenCode | `/ice-01-brief` |
| Agents without custom commands | Say it in plain words, for example "run stage 3" or "show the status" |

## How it works

```mermaid
flowchart TD
    A[Your request] --> B{Router}
    B -->|footage| E[ice-edit]
    B -->|reference| R[ice-remake]
    B -->|ideas only| I[ice-ideas]
    B -->|Lottie or UI| L[ice-lottie]
    B -->|voice leads| X[ice-explainer]
    B -->|any other film| F[ice-film]
    subgraph Spine["The ten stages, run by the chosen workflow"]
      S01["01 Brief: research first, then one message (stop A)"] --> S02["02 Concept"] --> S03["03 Script and versions"]
      S03 --> S04["04 Storyboard"] & S05["05 Look: mood board and style frames"]
      S04 & S05 --> S06["06 Animatic (stop B: one preview, only if you are there)"]
      S06 --> S07["07 Build"] & S08a["08a Music, effects and voice"]
      S07 & S08a --> S08b["08b Mix and master"]
      S08b --> S09["09 Review: gates and fresh critics"] --> S10["10 Deliver"]
    end
    E & R & I & L & X & F --> S01
    S10 --> O["Film, versions and delivery report"]
```

1. **Route.** The router reads your project state and request and picks one workflow; the workflow says what each of the ten stages means for its kind of film.
2. **Brief (01).** Research comes first: your business, your brand's real material, and the advertising rules of your industry and platforms. Then the questions on every open decision (stop A): four options each, at most four per message, more than one message when needed, or none when your prompt covers everything or you said "don't ask".
3. **Concept and script (02, 03).** A pitch with unexpected directions and a critic's pick; then the words for each language, with the shorter cuts and other versions planned.
4. **Storyboard and look (04 with 05).** They run side by side: rough boards and timing next to a mood board and style frames made with your brand's real material. The animatic (06) merges them, and if you are there you see one preview before the build (stop B).
5. **Build and sound (07 with 08a, then 08b).** The film is written as code while the music, effects and voice are fitted to the locked timing; the final mix is done on the draft.
6. **Review and deliver (09, 10).** Quality gates and fresh critics on the exported file, then every version and caption, and `ice/review/NOTE.md` with measured numbers and the permissions a brand owner would need. In one-prompt mode an approver role signs off each stage; step by step, you do.

Everything lives in an `ice/` folder in your project, so any session can resume where the last one stopped.

## Skills

You type only the 13 commands at the bottom of this table (`/ice`, `/ice-status`, `/ice-style`, `/ice-01-brief` to `/ice-10-deliver`); the router starts on its own or with `/ice`. Your agent's `/` menu may list the other skills too, because the Agent Skills format has no portable way to hide them: their descriptions start with "Internal part of Ice Motion Director, not a command: start with /ice." The director opens them for you.

| Tier | Skill | What it owns |
|---|---|---|
| Router | [`ice-motion-director`](skills/ice-motion-director) | Project state, classification, the ten-stage spine, the stops |
| Workflow | [`ice-film`](skills/ice-film) | Films from scratch, 12 film types |
| Workflow | [`ice-explainer`](skills/ice-explainer) | Voiceover-led explainers |
| Workflow | [`ice-remake`](skills/ice-remake) | A new film in the style of a reference |
| Workflow | [`ice-edit`](skills/ice-edit) | Editing real footage, 7 edit types (news reels included) |
| Workflow | [`ice-lottie`](skills/ice-lottie) | Lottie and UI motion |
| Workflow | [`ice-ideas`](skills/ice-ideas) | Concepts, hooks, scripts, storyboards |
| Domain | [`ice-direction`](skills/ice-direction) | Brief, questions, research, decisions, the craft plan (every craft the video needs, without being asked), color, type pairing, anti-sameness |
| Domain | [`ice-motion`](skills/ice-motion) | Timing, easing, springs, cuts, camera, composition |
| Domain | [`ice-type`](skills/ice-type) | Typography in motion, captions, readability, safe zones |
| Domain | [`ice-arabic`](skills/ice-arabic) | Arabic and right-to-left |
| Domain | [`ice-audio`](skills/ice-audio) | Music and SFX from real libraries, picked by ear; voiceover, mixing, loudness, a mix audit and a short list for your ears |
| Domain | [`ice-styles`](skills/ice-styles) | 156 film, art, drawing and motion styles, each with the crafts it needs, and a measured broadcast news family |
| Domain | [`ice-engines`](skills/ice-engines) | Engine choice, determinism, render, export, platform specs |
| Domain | [`ice-assets`](skills/ice-assets) | Truth sheet, real-first sourcing with each item's license status, brand assets |
| Domain | [`ice-qa`](skills/ice-qa) | Quality gates (the craft gate: faces, flashes, camera, finishing), critics, delivery report |
| Command | [`ice-style`](skills/ice-style) | The style library as presets: browse 156 styles or start a film in one |
| Commands | [`ice`](skills/ice), [`ice-status`](skills/ice-status), [`ice-01-brief`](skills/ice-01-brief) to [`ice-10-deliver`](skills/ice-10-deliver) | Step mode: run, resume or check the production spine one stage at a time |

## Gallery

Every video below is a real delivery made with Ice Motion Director, published with its full case study: the prompt in its original language, the questions, every stage with its media, the critic rounds and the checks on the delivered file. One was made from scratch from a one-line prompt; five are edits of raw footage in the style of a reference, the trials whose notes became the rules in [`lessons.md`](docs/maintainers/lessons.md).

<!-- gallery:start -->
| Video | What it is | Route | Language, aspect, length | Case study |
|---|---|---|---|---|
| **Spotify concept ad** | A brand film made from scratch from a one-line Arabic prompt, then five feedback rounds from the owner; a drawn street in a traffic jam turns into the beat. Unofficial concept, not affiliated with Spotify. | `ice-film` | English, 16:9, 35 s | [<img alt="View workflow" src="https://img.shields.io/badge/View_workflow-FF6F5E">](https://ice-motion-director.omarhassan.workers.dev/showcase/spotify-concept-ad/) |
| **Mohawalat Fahm reel** | A vertical reel cut from a full TV talk-show episode on the protests in France, in the programme's own reel style. Unofficial edit, not an Al Jazeera production. | `ice-edit` | Arabic, 9:16, 66 s | [<img alt="View workflow" src="https://img.shields.io/badge/View_workflow-FF6F5E">](https://ice-motion-director.omarhassan.workers.dev/showcase/mohawalat-fahm-france-reel/) |
| **Carney on Alberta** | An official government video message recut as a news reel, with real agency footage and the result card. Unofficial test, not an Al Jazeera or Government of Canada production. | `ice-edit` | English, 9:16, 96 s | [<img alt="View workflow" src="https://img.shields.io/badge/View_workflow-FF6F5E">](https://ice-motion-director.omarhassan.workers.dev/showcase/carney-alberta-aj-reel/) |
| **Obama on Iran** | A presidential weekly address recut as a long news reel with a map wall, figure cards and keywords. Unofficial test, not an Al Jazeera production. | `ice-edit` | English, 9:16, 3 min 22 s | [<img alt="View workflow" src="https://img.shields.io/badge/View_workflow-FF6F5E">](https://ice-motion-director.omarhassan.workers.dev/showcase/obama-iran-aj-reel/) |
| **AJ360 style edit** | A seated presenter take recut with Arabic kinetic words, NASA inserts and an app end card. Unofficial test, not an Al Jazeera or Al Jazeera 360 production. | `ice-edit` | Arabic, 16:9, 13.5 s | [<img alt="View workflow" src="https://img.shields.io/badge/View_workflow-FF6F5E">](https://ice-motion-director.omarhassan.workers.dev/showcase/aj360-raw-edit/) |
| **Green screen ad** | A 70-second green screen ad keyed into a studio wall, with real footage and the advertiser's own identity. Unofficial concept, not an ad by or for ConsultasAbogado.com. | `ice-edit` | English, 9:16, 73 s | [<img alt="View workflow" src="https://img.shields.io/badge/View_workflow-FF6F5E">](https://ice-motion-director.omarhassan.workers.dev/showcase/aj-greenscreen-lawyers-ad/) |
<!-- gallery:end -->

All of them, with before-and-after players for the edits: [showcase](https://ice-motion-director.omarhassan.workers.dev/showcase/). The footage and marks in each video belong to their owners; each case study lists the sources and their licenses.

## On the website

The [website](https://ice-motion-director.omarhassan.workers.dev/) explains Ice for people who do not read GitHub: [how it works](https://ice-motion-director.omarhassan.workers.dev/how-it-works/), [install per agent](https://ice-motion-director.omarhassan.workers.dev/install/), [showcase](https://ice-motion-director.omarhassan.workers.dev/showcase/), [compare](https://ice-motion-director.omarhassan.workers.dev/compare/) and [FAQ](https://ice-motion-director.omarhassan.workers.dev/faq/).

It is available in 31 languages: [العربية](https://ice-motion-director.omarhassan.workers.dev/ar/) · [Español](https://ice-motion-director.omarhassan.workers.dev/es/) · [Français](https://ice-motion-director.omarhassan.workers.dev/fr/) · [Deutsch](https://ice-motion-director.omarhassan.workers.dev/de/) · [Português (Brasil)](https://ice-motion-director.omarhassan.workers.dev/pt-br/) · [Русский](https://ice-motion-director.omarhassan.workers.dev/ru/) · [Türkçe](https://ice-motion-director.omarhassan.workers.dev/tr/) · [हिन्दी](https://ice-motion-director.omarhassan.workers.dev/hi/) · [日本語](https://ice-motion-director.omarhassan.workers.dev/ja/) · [한국어](https://ice-motion-director.omarhassan.workers.dev/ko/) · [简体中文](https://ice-motion-director.omarhassan.workers.dev/zh-hans/) · [Bahasa Indonesia](https://ice-motion-director.omarhassan.workers.dev/id/), and more from the language menu on the site.

## What it does not do

- **It does not shoot live action.** It edits footage you supply and builds everything else as motion design in code.
- **It is not a photoreal CGI or character-animation studio.** Complex character rigs, lip sync and heavy photoreal 3D are outside its range; stylized 2D, kinetic type, collage, pixel, hand-drawn and light 3D are its home.
- **It is not an AI video generator.** AI images, video or voices are optional extras you can ask for, never the main engine. Text, numbers and logos are always set in code.
- **It does not invent facts about real brands.** Real brands get their real material; anything it cannot obtain, it asks you for.

## Privacy and network

- **Runs locally.** Films render on your machine with your browser and FFmpeg. Nothing is uploaded by these skills.
- **Network calls, all disclosed:** web research for direction (through your agent's own search tool); downloads of free real media it picks on its own (music, sound effects, footage, photos, flags, maps, fonts) from public libraries and official sources, each recorded in the project with its source and license status; installs of free tools and models at pinned versions, named in the delivery note; Google Fonts when the chosen font comes from there. Turn the downloads off with `--offline` or `ICE_OFFLINE=1`. Before large downloads and renders it checks free disk space and works on a drive with room.
- **Optional and only on request:** AI image, video or voice generation, hosted transcription or TTS. These may cost money and are never used without your say-so.
- **Run log:** each project keeps a short log of your messages, reply summaries and shared files in `ice/log/`, and delivery turns it into one self-contained page, `ice/case-study/run-log.html`. Both stay on your machine and nothing is uploaded; keys, email addresses, phone numbers and folder paths are masked in the exported files only.
- **Local memory:** a small fingerprint file at `~/.ice-motion-director/fingerprints.jsonl` stores the palette, type and structure of each finished film so the next one does not repeat it. Delete it any time.
- **Sources setup (optional).** Ice works with no keys. To go further, put free keys (for example a sound library's API key) in `~/.ice-motion-director/.env`, one `NAME=value` per line, and set downloads, routes and your own library folders in `~/.ice-motion-director/sources.json` (`downloads`: `allowed`, `ask` or `off`; `local_libraries`: folders of your sound packs, footage or fonts, searched before any network route). `ICE_OFFLINE=1` turns every download off. Full list: `skills/ice-assets/references/sourcing-and-licenses.md` section 0.
- **No telemetry.**

## FAQ

<details>
<summary><b>How do I make motion graphics or an animated video with Claude Code, Codex or Cursor?</b></summary>

[Install](#install) Ice into your agent, open it in an empty folder and start your first message with the command (`/ice-motion-director:ice` in Claude Code; other agents in [how to type the commands](#how-to-type-the-commands)), then describe the video in plain words, for example the product, the length and where it will be posted. The command loads the director for sure, even when other video skills are installed. The router skill picks the workflow, researches your business, asks about every open decision (four options each, at most four per message) and then runs the ten stages up to a rendered MP4. If you prefer to steer each step, use the stage commands `/ice-01-brief` to `/ice-10-deliver` instead.
</details>

<details>
<summary><b>Does it need After Effects, a GPU or a paid video model?</b></summary>

No. Films are written as code (HTML, CSS, GSAP, Remotion, Lottie or FFmpeg) and rendered with a browser and FFmpeg on a normal computer, using the [prerequisites](#prerequisites) above. AI images, video, voices and hosted transcription are optional extras that may cost money and are used only when you ask for them. The one real cost is your agent's usage: a full film runs many stages and helper agents, so it uses far more of your plan than a chat answer.
</details>

<details>
<summary><b>How long does a film take, and what does it cost?</b></summary>

The software is free. A film runs all ten stages with several helper agents, research, renders and reviews, so even a short ad runs for a while and uses far more of your agent's plan than a chat answer. If a usage limit stops it in the middle, type `/ice` later and it resumes from `ice/state.json`. Paid services (AI generation, hosted voices or transcription) are used only when you ask for them.
</details>

<details>
<summary><b>Can it edit my own footage?</b></summary>

Yes, that is the `ice-edit` workflow: long-form and course videos, podcast episodes and clips, talking-head ads, shorts and reels, B-roll and motion overlays timed to words, and showreels cut to the beat. It transcribes your footage word by word with a local Whisper-class model (downloaded only after you say yes), edits on that transcript, then cuts, captions and renders the MP4 with EDLs and caption files. It does not shoot anything, so the footage has to come from you. Five of the [gallery](#gallery) videos are edits of this kind.
</details>

<details>
<summary><b>Does it work in Arabic?</b></summary>

Yes. Arabic and right-to-left are first class through the `ice-arabic` skill: connected letterforms and dots that survive animation, kashida, bidi isolation for mixed Arabic and English, numerals, Arabic captions and platform safe zones, and dialect as a setting for scripts and voice. You can also write your prompt in Arabic.
</details>

<details>
<summary><b>How is it different from writing Remotion or HyperFrames code by hand?</b></summary>

Remotion and HyperFrames are render engines, and Ice uses them (plus Three.js, Lottie, p5 and plain FFmpeg) underneath; `ice-engines` picks one per film. What Ice adds is the production work around the code: the researched brief, concepts, script, storyboard, style frames, animatic, sound design and mix, and separate critics and quality gates on the exported file. You still get the project as code in your folder, so you can open it and change anything by hand.
</details>

<details>
<summary><b>Can it make a video in the style of one I like?</b></summary>

Yes, with `ice-remake`: give it a reference video, a saved site or a set of images and it measures the style (pacing, palette, type, motion, sound) and rebuilds it with your content. It can also save that style as a portable recipe (`STYLE-RECIPE.md` and `style-recipe.json`) to reuse later. You choose whether the reference's own footage, music, logo and end card go into your film as they are, or the same style carries your identity, or a mix. Rights are yours: Ice records where every outside item came from and lists what needs a license before you publish.
</details>

<details>
<summary><b>What can it not do?</b></summary>

It does not shoot live action, it is not a photoreal CGI or character-animation studio (complex rigs, lip sync, heavy photoreal 3D), and it is not an AI video generator. It also does not invent a real brand's look: when it cannot get the brand's real material, it asks you for it. See [What it does not do](#what-it-does-not-do).
</details>

<details>
<summary><b>Can I use the films commercially?</b></summary>

Yes, the films you make are yours. A few bundled folders named `noncommercial/` carry their authors' noncommercial licenses; the workflows check your project's commercial-use answer and skip them for commercial work.
</details>

<details>
<summary><b>Which render engine does it use?</b></summary>

`ice-engines` picks per film: HyperFrames, Remotion, HTML canvas with Playwright and FFmpeg, Three.js, Lottie, p5 or FFmpeg alone. Remotion needs a company license for some businesses; the skill tells you when that applies.
</details>

<details>
<summary><b>It asked me questions. Can I skip them?</b></summary>

Say "decide for me" or "don't ask". It will choose, log every reason in `ice/DIRECTION.md`, and list every choice in the delivery report, so you can change any of them in one reply.
</details>

## Credits

Ice Motion Director merges and rewrites the best open-source motion and video skills into one system. Every source, its author and its license are listed in [CREDITS.md](CREDITS.md); license texts are in [LICENSES/](LICENSES).

## License

[Apache-2.0](LICENSE). Folders named `noncommercial/` and `vendor/hypit/` keep their own licenses, stated inside them.

<p align="center">
  Created by <a href="https://github.com/Omar-Tnzxo"><b>Omar-Tnzxo</b></a>
</p>
