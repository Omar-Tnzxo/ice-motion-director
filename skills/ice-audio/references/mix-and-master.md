# Mix, carve, loudness and delivery measurement

Read when balancing voice, music and SFX, when choosing the loudness target, when mastering, and before delivery (measure the exported MP4, then the human listen). Sources: hyperframes-audio skill and audio-effects docs (Apache-2.0), Barty-Bart sound-effects (MIT), anidoodle (MIT), claude-code-video-toolkit qc (MIT), herk-edit-kit (MIT), browser-use/video-use (MIT), product-launch-motion (MIT), echris6 motion-video-kit (MIT), mg-styles-15 (MIT), lemo-opuscar (MIT), explainroo (MIT), majed video-ad-editor (MIT), motionmaxxing (Apache-2.0), huashu-art-motion (MIT), lists-community day-in-my-life and session-story (Apache-2.0), video-production-studio (founder), reelmimic (MIT), with ideas restated from hypit and noncommercial sources.

## Contents
1. Mixing method
2. Frequency slots
3. Voice over music: levels, ducking, carve, the comfortable mix
4. Silence, room tone, edges
5. Loudness profiles (scoped)
6. Mastering recipes and traps
7. Measuring the exported file
8. Human listening check
9. Audio report

## 1. Mixing method

- "A mix is a set of relationships, not a stack of processors." When two things fight, find what they fight over (usually a band) and give it to the one that needs it; turning one down is rarely the fix.
- Priority: voiceover, then SFX, then music. "If you can't hear the narration over the effects, drop the score until you can."
- Order: subtract before you add, level after you filter, relationships after level, character and ceiling last.
- Balance by stem RMS or per-event in-band loudness, not only integrated LUFS: normalizing the whole mix never fixes balance. Compare levels inside event windows and shared bands, against a music-only render.
- Three layers in narrative films: ambience, foley or SFX, music; duck the music under dialogue and key foley.
- Normalization prepares a source; balance is decided in the mix. Machine-generated speech often arrives far below a mastered music track: that gap is arithmetic, not taste.
- Engine specifics (volume attributes, automation lanes, audio groups, effect registries in HyperFrames or Remotion) live in the ice-engines skill. This file holds the numbers those settings must reach.

## 2. Frequency slots

| Band | Range | Rule |
|---|---|---|
| Rumble | 20 to 80 Hz (sub to 60) | One owner at a time, mono. Rumble under 80 Hz at or under -5 dB relative. HPF the master about 28 Hz. |
| Weight, bass | 60 to 250 Hz | Root only; keep 20 to 120 Hz around -3 dB relative to the rest; give bass 2nd and 3rd harmonics. Mono below about 120 Hz. |
| Mud | 250 to 500 (600) Hz | Thin it, do not stack it. Find mud per 0.5 s window by band share. |
| Middle | 500 Hz to 2 kHz | One lead at a time. |
| Presence | 2 to 5 kHz | Voice intelligibility lives here (1 to 4 kHz under a voice belongs to the voice). |
| Edge, air | 5 to 16 kHz (to 20) | Detail, sibilance, shimmer. |

- At most 3 to 4 instrument families at once outside the climax.
- Phone rule: phone speakers drop almost everything under 150 Hz (one measured bed had 93 % of its energy there). Every low part needs harmonics above 500 Hz; keep some content at 0.4 to 10 kHz (a pluck, hats); check the mix through a 200 Hz high-pass.
- Mono safety: widen with M/S, never Haas (1 to 30 ms delays are dangerous in mono). In 150 Hz to 2 kHz, L/R correlation at least 0.3; at most 1.5 dB of extra mono loss (mono reading lower than the stereo reading minus 3 dB).
- Depth = quieter, darker, wetter, softer attack. Reverb: pre-delay 10 to 30 ms; one shared room for all SFX (about 1.1 s decay, 12 ms pre-delay, send 15 to 70 % by distance); delay times synced to tempo (quarter note = 60000 / BPM ms).

## 3. Voice over music: levels, ducking, carve, the comfortable mix

Canonical bed level (merged from 9 sources): while speech plays, the music sits 10 to 14 dB under the voice (start at 11 to 12 dB), so the voice is about 10 to 15 dB over the music. Scoped variants:

| Scope | Bed under voice |
|---|---|
| Talking-head ad, shorts and reels, product launch with VO | Duck 8 to 12 dB relative to the bed's own unducked level; about 11 dB under voice RMS |
| Explainer with continuous dense narration | 12 to 15 dB under; or music only in gaps |
| Whiteboard or lecture style | No music under speech is valid; music about 9 dB under if used |
| Brand film narration in the docs-narrator style | Music around -31 LUFS under a -14 to -16 voice, never masking it |
| Title cards and pauses between lines | Bed comes back up to be audible (about -24 to -28 dBFS RMS); no sidechain so strong the music disappears |
| News reel (edit type `news-reel`, style family `family-broadcast-news.md`) | The bed and ducking numbers of section 5, row "News reel, speech-led": they replace the 10 to 14 dB canon, the 8 to 12 dB duck and the carve for that type |

Ducking timing: attack about 80 to 200 ms (the ramp ends at the speech onset), release about 300 to 500 ms; envelopes release slowly on purpose so the bed does not snap back like a machine. Gaps shorter than attack plus release (about 0.4 s) recover only partly. Ramp the music out before a stinger or end card. Starting level for a bed under a voice is often 14 to 20 dB under the voice before adjusting to the track; a linear volume of about 0.1 to 0.15 in engines is a typical start.

Carve (preferred whenever music plays under a voice): instead of turning the whole bed down, take only the voice's bands (about 250 Hz to 2.5 kHz, deepest around 1.6 kHz) out of the music while the voice speaks; the bed keeps its low end and top. A volume duck alone is a draft, not a finished mix. Rules:
- The carve goes on the music, never on the voice (a voice carved against itself is a bug); against one voice group, never against several separate clips; keep bed, SFX and music out of the voice group.
- It follows the voice; no fixed-depth mode (a fixed dip thins the bed through every pause).
- Strength: a dip of about 10 dB is where a carve starts being heard as an effect; if the bed sounds notched rather than simply quieter, lower the strength. HyperFrames ships a carve tool whose default changed between versions (0.25 in the docs, 0.8 in the skill); read the installed version's default and judge by the rule above (see ice-engines for the command).
- Skip the carve only when there is no voice for the music to sit under (music video, title card, montage cut to the track).
- Without an engine carve, approximate with ffmpeg (illustration; tune thresholds by measurement):

```
ffmpeg -i music.wav -i voice.wav -filter_complex "[1:a]asplit=2[vk][vo];[0:a]acrossover=split='250 2500':order=4th[lo][mid][hi];[mid][vk]sidechaincompress=threshold=0.03:ratio=6:attack=80:release=400[midd];[lo][midd][hi]amix=inputs=3:normalize=0[bed];[bed][vo]amix=inputs=2:normalize=0[out]" -map "[out]" mix.wav
```

A full-band sidechain duck for export only: `sidechaincompress=threshold=0.03:ratio=8:attack=200:release=400` (or threshold 0.035, ratio 9, attack 8, release 320 for a punchier reel bed); declare the duck in the composition when the engine supports it.

- When the user says the music is too loud, lower the music gain relative to the reviewed version, save the measured change, and verify after final normalization that the bed-to-voice ratio fell. A lower master level alone is not a fix.
- When speech carries the idea, music and effects yield around names, numbers, claims, punchlines and quiet reactions, and take space in pauses and action passages. No music peak may mask a key word.
- Drops that do not land: a 40 to 300 Hz high-pass build over the 2 s before and a -2.5 dB dip applied after the bus compressors turned a +0.2 LU drop into +2.7 LU.

**The comfortable mix (every film with sound, owner decision 2026-10-29).** Two conditions, both checked before delivery (`ice-qa/references/audio-gates.md`, row "Comfortable mix"):
1. The music sits under the speech: the bed level and ducking of this section (10 to 14 dB under the voice while it speaks, duck 8 to 12 dB, carve preferred), measured by `scripts/qc.py --audit` (check A3, voice over bed from the stems, section 7).
2. No repeated pulse: no music bed or SFX layer whose energy repeats as a steady throb the ear tires of. No script in this repo measures listening fatigue, so it is a named item of the human listening check (section 8); `qc.py --audit` only points the item at the stretch where one pattern repeats with the least change. What to listen for: one low thump, kick, hit or drone that repeats unchanged for more than about 8 bars or 15 s with nothing in the arrangement moving; a bed that swells and drops on every beat (pumping from a fast duck release or a sidechain on the music bus); the same effect firing at a regular interval (sfx.md section 4 already caps repeats); a loop seam heard on every pass. A steady groove is not this fault when chords, melody or layers move over it (music-choice-and-licensing.md section 3 item 5 asks for one). The fix is a different track or section, a gentler release (section 3 timing), or fewer effects, never a lower master.

## 4. Silence, room tone, edges

- Never digital silence inside a film: room tone or ambience about 22 dB under the cues, nearly mono. Sound by 0.5 s; no hole over 0.25 s unless declared in the cue sheet's `quiet` list; at least two real, designed silences in narrative films, before the turn or the peak.
- News reel (edit type `news-reel`, style family `family-broadcast-news.md`): the designed end silence and the bed leaving before the last word follow section 5, row "News reel, speech-led" item 8; the rules of this section hold everywhere else in the reel.
- Deliberate total stops (music-led edits) are short (about 0.4 s, at most one bar, at most once) and declared.
- The opening never surprises with excessive volume; music and ambience finish intentionally, never at the file edge; the last sound lands within 0.5 s of the last frame; at most 0.5 s of silence at the end; do not cut words, breaths or reverb tails at scene boundaries.
- Cold open: when the film's first sound is a hit (a music downbeat, a stinger, a horn), it plays at full level on frame 0. A fade-in at the film start is used only when the cue sheet asks for one at that cue; a fade the cue sheet did not ask for silences the hook. "Never surprises with excessive volume" means the level is set right, not that the first second is faded.
- Fade-in 4 to 5 ms on any full-level first sample (it clicks otherwise); this anti-click ramp is inaudible as a fade and does not count as one. 30 ms fades at every edit boundary.
- ffmpeg trap: trim with `atrim=start=S:end=E,asetpts=PTS-STARTPTS` and only then `afade`. An output `-ss` with `afade` fades on the source clock and later clips come out silent.

## 5. Loudness profiles (scoped)

Sources disagree (-14 vs -16 LUFS, -1 vs -1.5 vs -4 dBTP). Each holds in its scope. Pick one profile per deliverable, write it in `ice/DIRECTION.md`, and measure on the exported file.

| Profile | Integrated | True peak (on the encoded file) | LRA | Applies to | Gate (`--profile`) |
|---|---|---|---|---|---|
| Social and web, punchy | -14 LUFS (+/-0.5, accept +/-1) | at or under -1 dBTP | at most 9 to 11 LU; at least about 3 LU for energetic films | social short, app ad, product launch, hype promo, kinetic type, logo sting, music video, shorts and reels, talking-head ad, showreel, data story for social; YouTube (it turns loud files down but never quiet files up) | `social` I -14 +/-1, TP -1, LRA 3 to 11 (floor warns) |
| Gentle and spoken | -16 LUFS | at or under -1 dBTP | 1.5 to 3 LU calm; up to 9 | calm brand film, explainer, UI walkthrough, long-form, podcast, meditative art film; scene voice stems before the final mix | `gentle` I -16 +/-1, TP -1, LRA 1.5 to 9 |
| Strict headroom | -16 LUFS | under -4 dBTP | at most 11 | mixes mastered without a limiter that keep sharp transients, files that will be re-encoded more than once (messaging forwards, aggressive platform transcodes), or when the -1 dBTP master still overshoots after encode or distorts on a phone speaker | `strict` I -16 +/-1, TP -4, LRA up to 11 |
| Quiet client spec | -19 LUFS (one approved calm film); -29 to -34 LUFS for some product-page spec ads (start near -32 and let the music-only render settle it) | at or under -1 dBTP | n/a | only when the client or reference sets it; never as a default | `quiet-client` I -19 +/-1, TP -1, LRA any |
| Broadcast | -23 LUFS (EBU R128, Europe) or -24 LKFS (ATSC A/85, US) | per the broadcaster spec (R128: -1 dBTP; A/85: -2 dBTP) | per spec | TV and radio delivery; confirm the broadcaster's sheet | `broadcast-ebu` I -23 +/-1, TP -1, LRA any; `broadcast-atsc` I -24 +/-1, TP -2, LRA any |
| Reference match | the reference's integrated LUFS and true peak | match | match | remakes where the reference loudness is part of the brief (compare per-segment relative differences too) | `reference` I ref +/-1, TP ref, LRA any |
| News reel, speech-led | -16 LUFS (+/-1); the reference's own measured value within 1 LU when the remake asks for the reference's loudness | at or under -1 dBTP, also when the reference measures an over | 4 to 7 LU | the news reel (edit type `news-reel`, style family `family-broadcast-news.md`), vertical or horizontal, wherever it is posted; numbers below | `news-reel` I -16 +/-1, TP -1, LRA 4 to 7 |

- Gate column: what `scripts/qc.py --audit --profile <id>` and the `ice-qa` skill's `scripts/quick-checks.mjs loudness <film> --profile <id>` enforce on the exported file (both exit 1 outside it; a test keeps both scripts equal to this column). `ref` means the reference's measured values, passed with `--target-lufs` and `--true-peak`; `--target-lufs` also carries a client's own spec (quiet client) and a news reel remake that asks for the reference's loudness (item 2 below). `any` sets no bound; a floor that warns goes to the ear list (section 8) instead of blocking.

- Accept window: a scene or line more than 1.5 LU from the median sounds uneven (fix tolerance 1.0 LU). A final mix under -19 LUFS fails the social profile; warn from -17.
- Scope of the social thresholds: the -19 fail and the -17 warning belong to the Social and web profile only. A news reel takes the row "News reel, speech-led", so a voice-led mix at -20.7 LUFS that matches its reference is not a social fail; a news reel goes to -14 only when the user asks for it in their own words.

**News reel, speech-led (numbers).** Measured on six broadcast reels at 25 fps (Arabic talk-show promos, an Arabic explainer promo in vertical and horizontal, an English explainer reel); the package values sit in `ice-styles/references/family-broadcast-news.md` section 2, these are the sound numbers.
1. Measured loudness per package: talk-show promo -18.9, -13.8 and -18.3 LUFS; explainer promo -16.9 (vertical) and -14.7 (horizontal); English explainer -20.7. Median -17.6 LUFS, LRA 3.9 to 7.5 LU, voice stems -13.9 to -22.5 LUFS. Three of the six reach 0.0 to +1.1 dBTP: overs are never copied.
2. Which target (two sources disagree: one recommends -16, another the reference's own value; both sit inside the measured range, so each is kept in its scope). A news reel made from a plain prompt, or a remake whose brief says nothing about loudness: -16 LUFS integrated, -1.0 dBTP, LRA 4 to 7 LU. A remake whose brief or fidelity mode asks for the reference's loudness: the reference's measured integrated value within 1 LU, true peak still at or under -1 dBTP. Log the choice and its reason in `ice/DIRECTION.md`.
3. Voice: mono and centred, voice LRA 2.5 to 6 LU, moderate compression (crest 15 to 17 dB on 1 s windows), high-pass 80 to 135 Hz, dry with no reverb (pauses reach room tone in 50 to 100 ms). Arabic voices sit dark (de-essed); an English voice stays bright. The chain: `voiceover.md` section 7, "Broadcast voice chain".
4. Room tone: continuous inside the single take; natural at -55 to -57 dBFS, or cleaned to -66 to -75 dBFS.
5. Bed level under the voice, two settings only: an ambient pad (pulseless) 28 to 31 dB under the voice, or a darker percussive bed 14 to 15 dB under; the English explainer bed sits 22 dB under while the presenter talks. Which bed goes with which package: `music-choice-and-licensing.md`, "News reel music".
6. Ducking. The Arabic packages do not duck: 4 of 6 beds stay flat across speech (within about 3 dB); set the bed once and automate only its entrance, its pull-outs and its exit, never a pump keyed to the voice. Where a light duck is measured it is 3 to 8 dB, attack 50 to 100 ms, release about 0.5 s (one talk-show promo, the English reel, which also lifts the bed about 12.7 dB in pauses and B-roll). The horizontal explainer package (AJ360) moves the bed by section, not by syllable: 10 to 15 dB under the voice on the presenter, up 10 to 12 dB on B-roll, back down within about 0.4 s when the presenter returns, and nearly gone (about 20 dB under) through long graphics-only stretches.
7. Stereo: voice mono; beds and SFX wide; booms, thumps and subs mono (never anti-phase, which loses about 8 dB on a phone); the end-card swish mono.
8. Silence as an effect (scope line for section 4 of this file and section 7's end-card check): the bed leaves 1.1 to 3 s before the last word of the call to action so the last line is voice alone; 0.4 to 1.3 s of room tone before the hard cut; the end card ends in silence (4.5 to 7.7 s after the template sounds in the talk-show promo, 3.3 s after the bed tail in the vertical explainer) or fades its outro to zero over the last 1.8 to 2.4 s (horizontal explainer, English reel). In a news reel this designed end silence replaces "at most 0.5 s of silence at the end" and "the end card must not sit 15 dB under the dialogue"; a sub boom on an edit may sit 13 to 17 dB over the voice because it lives below 150 Hz (`sfx.md` section 3b), which replaces "effects must not be louder than speech" for that sound.
9. Cuts: no crossfades. Cut in room tone, or cover the cut with a boom 1 to 4 f later; the voice may run 12 f (0.48 s) into an archive flash (L-cut) and return 1 to 4 f before the picture (J-cut); audio overlaps only under a picture dissolve.
- Gentle styles never put a compressor on the master; dense styles reach -14 through a look-ahead true-peak limiter. Cap limiter work at about 4 dB (gentle) or 6 dB (dense).
- When unspecified by platform, keep headroom: -14 / -1 dBTP is the plugin default for anything posted to feeds, -16 / -1 for anything mostly spoken.
- A master's true peak before AAC encoding should sit about 0.5 dB or more under the delivery limit; a limiter ceiling for noise-heavy material at least 2 dB under a hard delivery limit (true-peak detectors can read up to 1.7 dB over on full-band noise).

## 6. Mastering recipes and traps

Master once: mix to PCM, then normalize the final mix, never each stem by loudnorm in sequence (a single-pass loudnorm compresses SFX transients).

Bundled tool (Windows, macOS, Linux): `python "${CLAUDE_SKILL_DIR}/scripts/master_audio.py" --video PICTURE.mp4 --out OUT.mp4 --vo VOICE.wav --music MUSIC.wav --music-gain -18 --music-start OFFSET --music-fade-out 0 --sfx sfx.json --target-lufs -14 --true-peak -1.5`. It mixes, ducks the music under the voice (`--no-duck` to disable), measures the mix with ffmpeg `ebur128`, applies the linear gain to the target, limits true peaks with `alimiter` at 4x the sample rate, writes AAC at 48 kHz, copies the video stream, then measures the exported file with `ebur128=peak=true`. A true peak above `--true-peak` lowers the limiter ceiling and renders again (at most 5 renders). `master.json` beside the output holds `status` (`pass` or `fail`), `problems` and every render tried; the script exits 1 when the exported file misses the true-peak target, is not 48 kHz, or is more than 1 LU off the loudness target, and when the voiceover is still sounding at the last frame (`cut_at_end` records voice or SFX energy cut at the film end). Never re-run it at a lower `--true-peak` to dodge a fail: read `problems` first. `sfx.json` is a list of `{"file", "at", "gain_db"}` where `at` is the file start (event time minus the sound's sync offset, sfx.md section 5). Set `--target-lufs` and `--true-peak` from the profile in section 5; use `--music-fade-out 0` when the track is back-timed so its own ending lands on the end card. Its duck is a full-band sidechain: carve first (section 3) when the mix needs it. Values in the command are placeholders.

Music edges in `master_audio.py`. Only these four flags change the start or end of the music; nothing else in the script fades, trims or delays it, and voice and SFX are never faded. Set each one from the cue sheet, never by habit:

| Flag | Default | What it does |
|---|---|---|
| `--music-fade-in SEC` | 0 (none) | Fade-in from the film start. At 0 the music plays at full level from frame 0, which is what a cold open needs (section 4). Pass a value only when the cue sheet asks for a fade-in on the first cue; when `--music-start` cuts into the middle of a waveform, a 4 to 5 ms value (0.005) is the anti-click ramp, not a fade. |
| `--music-fade-out SEC` | 1.5 | Fade-out ending on the last frame. Pass 0 when the track's own ending (a button, a held chord) lands on the end card; keep a fade only for loops and beds (music-choice-and-licensing.md, ending rule). |
| `--music-start SEC` | 0 | Seconds into the file where the film starts (back-timing). |
| `--music-loop` / `--no-music-loop` | loop | When the track is shorter than the film, loop restarts it from its top (an audible restart); `--no-music-loop` lets it end and the film continue without it. Either way the music is too short: fix the edit or the cue first. |

Each fade is capped at half the film length. `master.json` records the values actually applied under `music_edges`, with `looped` or `ends_before_film` true when the track was shorter than the film; a reviewer reads it before blaming the score for a quiet or a cut edge. Before version 2026-10-21 the script forced a 1.5 s music fade-in with no way to turn it off; a hook mastered with an older copy was faded by the script, not by the score.

Manual two-pass loudnorm, only when the bundled tool cannot be used (illustration; replace I, TP, LRA with the chosen profile). loudnorm switches to dynamic mode and upsamples to 192 kHz whenever linear gain would break the peak target, so keep `aresample=48000` in the chain and `-ar 48000` on the output, and measure the exported file (section 7):

```
ffmpeg -hide_banner -i film_premaster.mp4 -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null -
# read measured_I, measured_TP, measured_LRA, measured_thresh, target_offset from the JSON, then:
ffmpeg -hide_banner -i film_premaster.mp4 -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=MI:measured_TP=MTP:measured_LRA=MLRA:measured_thresh=MTH:offset=OFF:linear=true,alimiter=limit=0.891:level=disabled:attack=5:release=50,aresample=48000" -c:a aac -b:a 192k -ar 48000 -movflags +faststart film.mp4
```

- Copy the video stream; AAC 192 to 256 kbps, 48 kHz stereo.
- Traps: AAC encoding adds about 0.5 to 1.4 dB of true peak over the PCM it was given (measured on pilot films at 192 kbps), so a limiter set exactly at the target misses it on the exported file; `linear=true` does not back off new transients (one master peaked at +1.1 dBFS); `alimiter` adds makeup gain unless `level=disabled` (one master landed at -13.0 LUFS and 0.0 dBFS); quote the whole `-af` chain; loudnorm is unreliable on clips under 3 s (measure the whole film, not short scenes).
- If a master stalls at -15 or -16: a light compressor (about -20 dB threshold, 3:1) before normalization, or a chain of gain, compressor, ceiling, second compressor, gain and final ceiling (one HyperFrames chain reached -13.8 LUFS and -1.3 dBTP where a single compressor plus limiter stopped near -20).
- Quieter after an edit: find the spike with a 4x oversampled peak scan and dip that hit about 4 dB for about 60 ms instead of lowering the whole master.
- Opt-in code scores (`ice-audio/SKILL.md` core rule 7): mgaudio exports already mastered (`m.export(lufs=..., tp=...)`); the final film mix (voice plus score plus SFX) is still measured and normalized once.
- Keep the user's own studio edits and levels; re-place audio on new frame times. Export music-only and voice-only stems with every delivery; keep previous versions.

**News reel build chain (recorded SFX only).** The sound of a news reel (section 5, row "News reel, speech-led") built with ffmpeg when `master_audio.py` cannot express it (no duck, section moves of the bed, one input per event). Values are the measured starting points; slots in `<...>` come from the plan. Every effect is a recorded library sound from the SFX ladder (`ice-audio/SKILL.md` section 5), never a sound made by code unless the user asked for it in their own words (core rule 7).
1. Voice: the chain of `voiceover.md` section 7, "Broadcast voice chain", kept mono.
2. Bed: measure the voice with `ebur128`, then `volume` so the bed sits at the level of section 5 item 5 (voice minus 29 dB for an ambient pad, voice minus 14 dB for a percussive bed). Entrance `afade=t=in:d=0.03` in the first pause after the greeting; call-to-action exit `afade=t=out:d=2` ending at or before the last word. Section moves (B-roll up, presenter down within 0.4 s) are `volume` automation on the bed (`volume='<expression of t>':eval=frame`), not a compressor. Only the English look ducks: `[voice]asplit=2[vk][vo];[bed][vk]sidechaincompress=threshold=0.03:ratio=3:attack=20:release=500[bd]` (3 to 8 dB of reduction).
3. SFX: one input per event, `adelay=<ms>|<ms>` = the visual frame time plus the offset of `sfx.md` section 3b minus the sound's own sync offset (`sfx.md` section 5), `volume` to the level of section 3b; `highpass=f=4000` on chatter and ticks, `lowpass=f=150` and a mono sum on booms and thumps; one sample per type for the whole reel (the references reuse one chatter and one end-card pair); then `amix=inputs=<N>:normalize=0`.
4. Bus: `alimiter=limit=0.89:level=disabled` (about -1 dBTP, no makeup gain), then the two-pass `loudnorm` of this section with `I=-16:TP=-1:LRA=7` (or the reference's value per section 5 item 2), and the exported file measured (section 7).
5. Cuts and silence: hard `concat` cuts with no `acrossfade`, except `acrossfade=d=0.4` under a picture dissolve; the end silence with `apad` or `anullsrc` after the end-card sounds.
6. Finishing of the effects: dry. Chatter and ticks decay to -30 dB within 70 to 470 ms, swishes within 70 to 80 ms; only booms and thumps carry tails (to -20 dB in 0.25 to 1.4 s; one measured boom of 4.7 s carries the voice into the archive). No reverb on the voice or the effects.

## 7. Measuring the exported file

Measure the exported MP4 (the file you ship), never only the WAV: AAC adds a little peak, and sync can shift.

```
ffmpeg -hide_banner -i film.mp4 -af ebur128=peak=true -f null - 2>&1 | tail -n 12
ffmpeg -hide_banner -i film.mp4 -af "pan=mono|c0=0.5*c0+0.5*c1,ebur128=peak=true" -f null - 2>&1 | tail -n 12
ffmpeg -hide_banner -i film.mp4 -af ebur128=framelog=verbose -f null - 2>&1 | grep "S:"
ffmpeg -hide_banner -i film.mp4 -af silencedetect=noise=-50dB:d=0.25 -f null - 2>&1 | grep silence_
```

- Bundled gate on the mix (08b on the draft, 10 on the delivered file): `python "${CLAUDE_SKILL_DIR}/scripts/qc.py" --audit --project . --render OUT.mp4 --stems ice/audio/stems --cue-sheet ice/plan/cue-sheet.json [--sfx ice/audio/sfx.json] --profile <id>` (the profile id from the gate column of section 5; needs numpy). It writes `ice/review/audio-audit.json` (per check: value, threshold, source, pass, blocking) and `ice/review/ear-list.json`, prints the `## For your ears` block, and exits 1 on a blocking item. Checks: A1 loudness against the profile; A3 voice over bed in voiced 100 ms windows, full band and 1 to 4 kHz, from the stems (a voice stem is named voice, vo, vocals, dialogue, speech or narration; mix and master files are skipped; the rest is bed; without stems it is "unmeasured" and blocks, unless `--separate` splits the render with an installed demucs or `--no-speech` declares a film with no spoken word); A5 read from the speech check below; A6 clicks and truncation at the joins of the cue sheet and the SFX list; A8 clipping runs; A9 DC offset; A10 stereo balance, band correlation and mono loss; A11 stream spec and audio against video length; A12 undeclared holes and declared `quiet` windows; A13 music ending and voice cut at the end (reads `master.json`); A15 effects under speech (blocking in a news reel). Which items block: the `ice-qa` skill, `references/audio-gates.md` section 2b.
- Speech check on the mix (every film with speech, captions or not): the `ice-type` skill's `scripts/align_script_to_asr.py --stem <voice stem> --mix OUT.mp4 <script>` transcribes both with the same pinned model, tells masked words (right in the stem, lost in the mix: exit 1) from misheard ones (wrong in both: the ear list), and applies the floors of the speech bullet below.
- Voice line gate: `python "${CLAUDE_SKILL_DIR}/scripts/qc.py" --project . --cue-sheet ice/plan/cue-sheet.json --render OUT.mp4 --profile <id> --json` (`--target-lufs` and `--true-peak` override the profile for a client spec or the reference's values). Exit 1 means an error (cut-off line, missing file, unmeasurable render); `--fix` writes `<name>.loudnorm.mp4` and keeps originals in `.qc-backup/`. It covers loudness, pacing and slot fit only; the commands above cover mono, short-term and silence by hand.
- Read Integrated (I), LRA and True peak from the summary. Measure stereo: a mono file reads about 3 dB lower (one reel shipped too loud because of it). Also read the mono downmix for the mono-loss rule (section 2).
- Short-term loudness per second: reject near-silent intros, unintended dips and early decay; the end card must not sit 15 dB under the dialogue; effects must not be louder than speech except the one strongest hit.
- Silence: no unintended gap over 0.25 s, no tail over 0.5 s; adapt the silencedetect floor from loudnorm's `input_thresh` on noisy material.
- Sync: compare audio onsets near each picture cut (share of cuts within +/-80 ms of an onset); spot-check five caption words and every hero hit against the waveform at their frames; voice still intelligible over music (re-run speech recognition on the final mix with the speech check above; a match under 0.8 per scene or 0.85 overall means lower the music or fix pronunciation: the mix losing words the clean stem keeps blocks, both losing them goes to the ear list).
- Every row of the sound plan is measurably present (sfx.md section 6).
- Hand all numbers to ice-qa, which records them in `ice/review/` and gates delivery.

## 8. Human listening check (before delivery)

The agent cannot hear. It never says a mix "sounds good".
1. Render a review file and give the user, in the delivery note (auto mode) or on the review card (step mode), never as an extra stop, the 5 riskiest timestamps to check with headphones (largest beat error, long sounds such as typing and risers, the reveal, the first sound after a silence, the loudest moment), plus one 8 s excerpt with the most important mood change, and the repeated-pulse item of the comfortable mix (section 3): the longest stretch where one sound repeats on a steady beat. The list is generated by `scripts/qc.py --audit` (`ice/review/ear-list.json` and the printed `## For your ears` block: 5 to 7 items ranked by risk, each with a time range, a yes or no question, why a machine could not settle it and the fix on "no"; doubtful words come first, added by the speech check of section 7); copy it, never write it by hand.
2. Ask them to listen once without watching, on ordinary headphones and on a phone or laptop speaker.
3. Score feedback by timestamp, change one thing per round, isolate music complaints with a music-only render.
4. If no human listened, the delivery report says "not listened by a human" next to the audio numbers.

## 9. Audio report (hand to ice-qa; template)

```
Audio report
- Mode and clock: <voice-led | music-led | hybrid | free>
- Music: <source, track or recipe, BPM, key/mode>, license: <name, checked YYYY-MM-DD | NOT CONFIRMED>, use case: <slot>
- Voice: <recording | TTS provider and voice, disclosed>
- Beat grid: phase shift <ms>, cut-to-beat errors <list ms>, share of cuts on onsets <pct>
- SFX: <count> events, <kinds> kinds, sources and licenses in `ice/assets/CREDITS.md`
- Loudness profile: <name>; measured on <file>: I <LUFS>, TP <dBTP>, LRA <LU>, mono I <LUFS>
- Silences: declared <list>, unintended <none | list>
- Speech intelligibility over music: <A3 median and 5th percentile from `ice/review/audio-audit.json`; A5 masked, misheard and low-confidence counts from `ice/review/speech-check.json` | not checked>
- Human listen: <who, device, ear-list items answered, repeated pulse heard or not | not listened by a human>
- Not checked: <list>
```
