---
name: ice-audio
description: >
  Internal part of Ice Motion Director, not a command: start with /ice.
  Sound for Ice Motion Director films and edits: real music and recorded SFX from libraries, ranked by
  measurement and picked by ear from options laid on the film, a sync license check before any track is used,
  opt-in music made by code (bundled mgaudio toolkit), cue sheets,
  beat grids and beat sync, landing the music on the end card, sound effect selection, placement
  and audibility, SFX library policy, voiceover and TTS pacing with word budgets, ducking and
  voiceover carve, frequency-band mixing, scoped loudness and true-peak targets measured on the
  exported file, and the human listening check.
  Called by Ice Motion Director workflows; use only when called by name.
license: Apache-2.0
metadata:
  author: Omar-Tnzxo
  version: 0.2.7
---

# Ice Audio

Owns every sound decision in a film: whether there is music, where it comes from, how it is timed, which effects play, how the voice is written, paced and cleaned, how it is mixed, and what loudness ships. Workflows (ice-film, ice-explainer, ice-remake, ice-edit, ice-lottie, ice-ideas) call this skill; they never restate its rules.

Not owned here: caption timing and on-screen text (ice-type), Arabic dialect narration (ice-arabic), engine audio attributes and render commands (ice-engines), motion timing and transitions (ice-motion), asset sourcing outside audio (ice-assets), the final delivery gate and fingerprint file (ice-qa), creative direction and research (ice-direction).

## 1. Core rules

1. Sound is half the film. Never deliver silent unless the user asked for "no audio". "No narration" is not "silent". When no real track or recording can be had, the bed stays empty and the delivery note says "music needed" (section 5, the music ladder's last rung); a code score is never the fallback.
2. The agent cannot hear. It measures every step, never says a mix "sounds good", and ends every audio job with a human listening check (mix-and-master.md section 8).
3. Plan in data, never adjectives: a cue sheet with times, a music brief with numbers, a sound plan with one row per event and its visible cause.
4. One clock per film: the voice (voice-led) or the beat grid (music-led). Write it in the cue sheet.
5. Every sound has a visible cause or a written reason. Restraint is the design; silence is scored, not leftover.
6. Recorded, never blocked: every music and SFX file has a recorded source, owner and license status (`licensed`, `unknown`, `needs purchase`) checked against the stated use case; rights are the user's (the `ice-assets` skill, `references/sourcing-and-licenses.md` section 0). A reference's own track, the user's track or any available track is a valid choice. Every track gets the sync license check (music-choice-and-licensing.md section 5) before it is placed in the cue sheet; its result is a status for the delivery note, never a reason to drop the track.
7. AI voice, music or SFX generation is optional, user-initiated and disclosed. Real people's voices, clones included, follow the `ice-assets` skill, `references/ai-media-policy.md` section 9. Music and sound effects made by code (mgaudio) are opt-in only: used when the user asks for music or sound made by code in their own words; never a default, a fallback or a stand-in (owner decision, 2026-10-29).
8. Measure the exported MP4, not the intermediate WAV.
9. Anti-sameness: the sound axis (lead, genre, tempo band, dramaturgy) is logged in `ice/DIRECTION.md` with reasons; its definition and the distance rules: the `ice-direction` skill, `references/anti-sameness.md` section 1.
10. No extra stops. The router's stops table (`ice-motion-director/SKILL.md` section 5, "Stops") is the only list of times the run waits for the user. Picking music and hero SFX by ear rides with stops that already exist (the options flow, section 5); everywhere else a file of this skill says to ask: in auto mode decide by measurement (tempo, energy curve, landing on the end card, audibility), log the choice in `ice/DIRECTION.md`, and list the alternatives in the delivery note so the user can swap by ear later; in step mode put the options on the stage's review card. Which downloads and installs need no question: the `ice-assets` skill, `references/sourcing-and-licenses.md`, and the `ice-engines` skill, `references/engine-choice.md` section 7. A paid service or an account is asked only inside the router's allowed stops; without a yes, take the next rung of the section 5 ladders (or every word on screen instead of a voice) and say in the delivery note what a yes would add.

## 2. Inputs and outputs

| Reads | Writes |
|---|---|
| `ice/BRIEF.md` (film type, platform, language, commercial or not, supplied audio) | `ice/plan/cue-sheet.json` (clock, music, voice lines with word times, events, declared silences) |
| `ice/DIRECTION.md` (mood, style, music decision) | `ice/plan/sound-plan.md` (one row per event: time, cause, sound, level, reason) |
| Supplied music, voice or footage audio | `ice/audio/` (stems, score, voice lines, mix, `beatgrid.png`) |
| The rendered picture and its exported events | Rows in `ice/assets/CREDITS.md` for every music and SFX file (the `ice-assets` skill owns the format); the audio report handed to ice-qa |

## 3. Sound policy by type

Use the film and edit type names from the architecture. Each row is a default; the brief overrides it. "Library track" means a real track from the music ladder of section 5, picked by ear from 2 to 3 options (the options flow, section 5).

| Type | Mode | Music default | SFX density | Loudness profile |
|---|---|---|---|---|
| product launch | voice-led or music-led | library track back-timed to the end card | signature riser and impact once each, UI sounds on real actions | social -14 |
| app ad, social short, shorts and reels | hybrid or voice-led | library track with a hook in 2 to 4 s | at most about 15 per minute | social -14 |
| brand film, industry spot | voice-led or free | licensed human-made track, one continuous piece | sparse, material-true, recorded | gentle -16 (social -14 if posted to feeds) |
| logo sting | music-led | short library button or sting | one hero hit plus a few landings | social -14 |
| kinetic type | music-led (any length without a voiceover; voice-led when a voice carries the copy) | library track, cut on a whole-frame tempo | hits only on a few landings, never one per word | social -14 |
| data story | voice-led | steady bed leaving 1 to 4 kHz | counters and landings | gentle -16 or social -14 |
| hype promo, showreel | music-led | library track with bar-line splices | dense but every hit has a cause | social -14 |
| UI walkthrough | voice-led | quiet bed | clicks, typing texture, small UI | gentle -16 |
| music video | music-led | the user's track only | as the track allows | reference match or social -14 |
| art film | free or music-led | library track whose instruments fit the style's sound palette | material sounds, designed silences | gentle -16 |
| explainer (ice-explainer) | voice-led | steady bed or none under speech | one sound per moment, quiet typing | gentle -16 |
| long-form, podcast | voice-led | optional bed | minimal | gentle -16 |
| talking-head ad | voice-led | bed 10 to 14 dB under the voice | on visible actions only | social -14 |
| B-roll overlay | follows the host edit | none of its own | soft landings | host profile |
| Lottie and UI motion | none or UI sounds | none | per interaction, optional | not applicable unless rendered to video |

## 4. Order of work on the spine

Stage 08 runs in two parts: 08a beside the 07 build, from the locked cue sheet; 08b after 07, on the draft. The spine stage of each step:

| Step | Spine stage |
|---|---|
| 1. Decide the mode, the clock and whether music exists (music-choice-and-licensing.md sections 1 and 2). Log it | 05 (sound lead), confirmed at 06 |
| 2. Voice-led films: write the spoken side, estimate duration, take the voice the user chose at 01, generate or take the recording, align words, fix pace (voiceover.md). The voice comes before any frame | 03 |
| 3. Music-led films (hype promo, music video, kinetic type cut to a track, showreel): take the user's track, or rank real candidates and offer them with the stage 01 questions (section 5); run the sync license check; measure the beat grid with the kick-band phase check (cue-map-and-beat-sync.md section 3) | 01 |
| 4. Write the cue sheet before animating (cue-map-and-beat-sync.md section 2) | 06 |
| 5. Music for the other films: rank real candidates at 05 and lay the best 2 to 3 under the animatic for the pick (section 5); then run the sync license check on the chosen track, measure its beat grid and plan the landing on the end card | 05 and 06, then 08a |
| 6. SFX pass from the cue sheet events: select and place by sync point (sfx.md) | 08a |
| 7. Picture locks to the cue sheet (the workflow and ice-motion do this); export real event times from the draft composition | 07 |
| 8. Re-place SFX on the exported times, level for audibility; mix: voice priority, carve or duck, frequency slots, silences (mix-and-master.md sections 1 to 4) | 08b |
| 9. Master once to the chosen profile; on the exported MP4 run the speech check (the ice-type skill's `align_script_to_asr.py --stem`), then `scripts/qc.py --audit --profile <id>` with the stems and cue sheet; fix every blocking item, re-run (mix-and-master.md sections 5 to 7) | 08b, again at 10 |
| 10. Human listening check: the ear list from `qc.py --audit` (`## For your ears`), in the delivery note or the review card (mix-and-master.md section 8) | 08b card, 10 |
| 11. Hand the audio report to ice-qa (section 9). Add the audio rows to `ice/assets/CREDITS.md` | 08b, then 10 |

## 5. Where music and SFX come from, and who picks (owner decision, 2026-10-29)

Real first: music and effects come from real tracks and recordings, close to the reference (or to the film type when there is none) in genre, feel and tempo, chosen by measurement and then by ear. Each rung below names a route; endpoints, keys, download consent and license terms per library: the `ice-assets` skill, `references/sourcing-and-licenses.md`. Every file found gets its credits row (core rule 6). A higher rung that has nothing that fits sends the search down one rung.

**Music ladder.**
1. The user's track, the reference's own track, or a track the user named.
2. The user's subscription library: a subscription library connector the user has (one that searches by reference track, tempo, mood and key); otherwise a fetch list the user downloads into the project's inbox (Artlist, Envato, Motion Array and similar have no route Ice can sign in to).
3. Libraries the user set a key for: Jamendo, Freesound, AudioJungle previews.
4. No-key real tracks: Jamendo through Openverse, Incompetech, and real tracks already on the user's disk.
5. Last: no bed. The delivery note says "music needed" and names 3 real tracks found in this run's search that fit the measured target, each with its route and license status; when no search could run, it gives the measured target instead (tempo window, mode, length, the confirmed mood). Never a track it could not verify exists, and never a code score (core rule 7).

**SFX ladder.** For every picture world, synthetic ones included (designed UI, HUD, glitch and 8-bit packs exist in these libraries):
1. The user's files and local libraries.
2. Professional designed sounds: the Sonniss GDC bundles (single files pulled from the bundle), BBC Sound Effects (recorded `needs purchase` for publishing), Freesound with a key (originals and similarity search).
3. No key: Freesound through Openverse, Mixkit, Wikimedia Commons, Internet Archive, and Ice's CC0 pack, fetched without a question by `scripts/match_music.py pack fetch` (`references/sfx.md` section 7).
4. Last: skip the cue and say so in the delivery note. Never a sound made by code (core rule 7).

**Choosing.** Measure the reference with `scripts/sound_map.py` (in its voice-free windows when speech covers the bed), pull 10 to 20 candidates down the ladder, rank them with `scripts/match_music.py music`, and keep the best 2 to 3. Library search filters: music-choice-and-licensing.md section 3, item 3. Hero SFX (the signature impact and riser) get the same treatment: 2 to 3 measured candidates ranked with `scripts/match_music.py sfx`, laid on the same cut; every other effect is placed by measurement alone (sfx.md sections 5 and 6).

**The options flow.** The best 2 to 3 tracks are laid on the film at equal measured loudness with `scripts/preview_options.py` (option videos plus `compare.html`), and the user picks by ear. No new stop is added; where the options ride:

| Film or situation | Where the user hears the options |
|---|---|
| Music-led films (hype promo, music video, kinetic type cut to a track, showreel) | Stage 01, with the questions (the music question carries options 1 to 3 plus "your own track"), laid on the reference picture, or audio only when there is none |
| Every other film, auto mode | Stop B, the one preview approval (router `ice-motion-director/SKILL.md` section 5, "Stops"), laid under the animatic, or under the timed style frames when B is taken at 05 |
| Every other film, step mode | The 06 review card, laid under the animatic |
| Nobody can answer now (a non-interactive run), or the user said not to ask | The closest by measurement (rank 1), logged in `ice/DIRECTION.md` with its distance; the delivery note names the other two and the delivery folder carries `compare.html` and their option files |

After the pick: back-time the chosen track to the end card (music-choice-and-licensing.md section 4), then run the sync license check (its section 5) and record the status. When the brand's product is music, music-choice-and-licensing.md section 2 (music brands) applies first.

## 6. Numbers that hold everywhere

| Rule | Value |
|---|---|
| Hit sync | Primary contact within 2 frames or 40 ms (stricter wins), never late; secondary within 80 ms |
| Kick-band phase | Grid phase corrected on onsets below 120 Hz; residual within about 25 ms |
| Bed under voice | 10 to 14 dB under the voice while speaking; duck depth 8 to 12 dB; carve preferred over a plain duck |
| SFX density | About 15 events per minute default; at most 2 cues per 100 ms; one signature riser and one impact per film |
| SFX audibility | Fails more than 6 dB under the ducked score in its window |
| Narration pace | Budget 2.2 to 2.5 wps (explainers, TTS), 2.5 to 3.0 wps (ads); flag above about 170 wpm; slow with pitch-preserving tempo, factor at least 0.85 |
| Silence | No digital silence inside a film; no undeclared hole over 0.25 s; at most 0.5 s of silence at the end |
| Loudness | Social -14 LUFS / at or under -1 dBTP; gentle and spoken -16 LUFS / -1 dBTP; strict headroom -16 / under -4 dBTP; broadcast per spec. Full table: mix-and-master.md section 5 |
| Mono | Extra mono loss at most 1.5 dB; nothing important only below 150 Hz |

## 7. Bundled code

- `scripts/match_music.py` (Ice): `music` ranks candidate tracks against a reference's sound map by a weighted measured distance (tempo with half and double time, brightness, loudness range, key, section movement, genre, instruments; the user's confirmed tags replace the map's guesses) and writes `ranking.json`; `sfx` ranks recorded whooshes or impacts by the measures of sfx.md sections 5 and 6 (`--profile news-reel`: sub or air only, sfx.md section 3b). Local files only, no network; numpy and scipy (via `sound_map.py`).
- `scripts/preview_options.py` (Ice): lays 2 or 3 tracks on the same picture (or audio only), each from its strongest section or back-timed to the last frame, at equal measured loudness, the film's own voice kept on request; writes `option-N` files, `options.json` and `compare.html`; stdlib and ffmpeg.
- Opt-in tool, only under core rule 7: `scripts/mgaudio/`, the mgaudio toolkit from Vincentwei1021/mg-styles-15 (MIT): music recipes per style, SFX generators, mixer, mastering and QC; copied into `ice/audio/lib/mgaudio/` before use; numpy only; fast path, fallback mode and samples: music-by-code.md section 1.
- `scripts/master_audio.py` (founder's tool): mixes voice, music and SFX (a JSON cue list) and masters once to the chosen profile, measured on the exported file; music edges only from its four flags (no fade-in unless `--music-fade-in`, so a cold open hits at full level on frame 0); `master.json` holds `status` and `cut_at_end` (voice or SFX sounding at the last frame); exit 1 on a miss or a cut voice. Flags, renders and traps: mix-and-master.md section 6.
- `scripts/pacing.py` (from claude-code-video-toolkit, MIT): measures wpm per voice line and, with `--max-wpm`, slows a fast take in place with pitch-preserving atempo (floor 0.85).
- `scripts/qc.py` (adapted from claude-code-video-toolkit, MIT): voice lines from the cue sheet or a folder (slot fit, dead air, pace, loudness spread) and the exported film against the profile (`--profile`); `--fix` normalizes with backups; exit 1 on errors. `--audit` checks the delivered mix, writes `ice/review/audio-audit.json` and the ear list, and prints `## For your ears` (mix-and-master.md sections 7 and 8; blocking items: the `ice-qa` skill, `references/audio-gates.md` section 2b).
- `scripts/sound_map.py` (Ice): maps a reference's soundtrack (tempo, key, sections, energy curve, typed effects, voice, loudness, and instrument and genre proposals the user confirms at stage 01) into `sound_map.json`, `SOUND-MAP.md` and a timeline SVG; numpy, scipy and ffmpeg; fields, rules and limits: references/sound-map.md.
- master_audio.py, pacing.py, qc.py and preview_options.py run on Windows, macOS and Linux with Python, ffmpeg and ffprobe on PATH (minimums: the `ice-engines` skill's `references/versions.json`, `runtimes`); stdlib only, except `qc.py --audit` (numpy, `scripts/requirements.txt`). Run each as `python "${CLAUDE_SKILL_DIR}/scripts/<name>.py" --help` first. Other steps are ffmpeg commands in the references; no script downloads anything at runtime.

## 8. Files

| Need | Open | When |
|---|---|---|
| Is there music, which source, which track, tempo, search filters, the sync license check, editing a licensed track, AI music services | `references/music-choice-and-licensing.md` | Before any music search, purchase, generation or edit; section 5 before any track is used |
| Rank candidate tracks or hero SFX, lay 2 to 3 options on the film | `scripts/match_music.py`, `scripts/preview_options.py` | After the candidates are fetched, before the options flow (section 5) |
| Composing by code, recipes, the mgaudio API | `references/music-by-code.md` | Only when the user asked for music or sound made by code in their own words (core rule 7); its section 4 guards also check an AI-generated track |
| Clock choice, cue sheet fields, beat grid measurement, sync tolerances, cutting density, landing on the end card, audio-reactive data | `references/cue-map-and-beat-sync.md` | Before animating, and whenever timing changes |
| SFX selection by picture world, placement, density, audibility, library and license policy | `references/sfx.md` | During the SFX pass and before delivery |
| Voice source and disclosure, script for the ear, pacing and word budgets, duration estimate, max-wpm fix, alignment, recorded voice cleanup | `references/voiceover.md` | Before writing the spoken script and before generating any voice |
| Mixing method, frequency slots, ducking and carve, the comfortable mix (no repeated pulse), silences, loudness profiles, mastering commands, measuring the MP4, listening check, audio report | `references/mix-and-master.md` | During the mix, before mastering and before delivery |
| Map a reference's music, effects, voice and loudness; what each field means and how to use it | `scripts/sound_map.py`, `references/sound-map.md` | When a reference video's sound is studied (remake, style recipe), before stage 01 questions about its music |
| Mix and master a film's audio in one command | `scripts/master_audio.py` | After the SFX pass, with the profile from mix-and-master.md section 5 |
| Measure or fix narration pace | `scripts/pacing.py` | Right after each voice line is generated or recorded |
| Audio QC gate (slot fit, pace, loudness spread, render loudness); the mix audit and ear list (`--audit`) | `scripts/qc.py` | Before render with the cue sheet; `--audit` at 08b (draft) and 10 (delivered file) |
