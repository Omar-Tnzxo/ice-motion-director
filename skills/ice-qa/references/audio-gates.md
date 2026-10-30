# Audio gates on the exported file

Measure the exported MP4, never the intermediate WAV or the stems: normalization and encoding change relative levels. Loudness targets and mix rules are owned by the ice-audio skill (by film type and platform); this file is how the check is run and read. Sources: motionmaxxing (Apache), motion-video-kit (MIT), product-launch-motion (MIT), claude-code-video-toolkit (MIT), mg-styles-15 (MIT), Barty-Bart (MIT), video-use, explainroo, video-ad-editor, anidoodle, hyperframes audio skill (Apache), founder skills; PolyForm explainer sources (ideas rewritten).

## 1. Commands

```
python <ice-audio skill>/scripts/qc.py --audit --render final.mp4 --stems ice/audio/stems --cue-sheet ice/plan/cue-sheet.json --sfx ice/audio/sfx.json --profile <id>   # the blocking audit and the ear list (section 2b)
python <ice-type skill>/scripts/align_script_to_asr.py --stem <voice stem> --mix final.mp4 <script>   # masked or misheard words (A5)
node scripts/quick-checks.mjs loudness final.mp4 --profile <id>  # integrated I, LRA, true peak, short-term loudness per second; exit 1 outside the profile
python scripts/look.py final.mp4 --out ice/review/look --expect-audio   # AUDIO block: LUFS, LRA, TP, audible span, silent tail, dropouts, onsets vs cuts
ffmpeg -i final.mp4 -af ebur128=peak=true -f null -    # raw measurement
```

`<id>` is the profile logged in `ice/DIRECTION.md`, one id of the gate column of the `ice-audio` skill, `references/mix-and-master.md` section 5. Run the audit at 08b on the draft and at 10 on the delivered file; run the speech check first, so the audit reads its result and its doubtful words lead the ear list.

## 2. Checks

| Check | Pass when | Source |
|---|---|---|
| Integrated loudness | Measured I inside the chosen profile's target and tolerance. Profiles and tolerances: the `ice-audio` skill, `references/mix-and-master.md` section 5. A news reel (edit type `news-reel`, style family `family-broadcast-news.md`) is measured against the row "News reel, speech-led" of that file, not the social profile. Blocking: A1 of section 2b | product-launch-motion, mg-styles-15, explainroo |
| True peak | Measured TP at or under the profile's ceiling (same owner section). AAC adds a little, so expect the measured peak about 0.2 dB above the master's limiter setting | product-launch-motion, claude-code-video-toolkit |
| Quiet is not safe | A render well under target fails too: platforms turn loud content down but never turn quiet content up. Fail and warn floors: the `ice-audio` skill, `references/mix-and-master.md` section 5. | claude-code-video-toolkit, motion-video-kit |
| Loudness range | Measured LRA inside the profile's LRA range: the `ice-audio` skill, `references/mix-and-master.md` section 5. | motion-video-kit |
| Scene consistency (narrated films) | Per-scene VO loudness spread against the median scene. Accept and fix windows: the `ice-audio` skill, `references/mix-and-master.md` section 5; short-window reliability: same file, section 6. | claude-code-video-toolkit |
| Silence | Measured lead, tail and inside gaps against the owner limits: the `ice-audio` skill, `references/mix-and-master.md` sections 4 and 7. When the film opens on sound, the first 100 ms sit within about 12 dB of the peak | motionmaxxing, product-launch-motion |
| Music fit | Music covers the whole cut; audible span at least 85% of the request. Leading and trailing silence limits: the `ice-audio` skill, `references/mix-and-master.md` section 4. Landing on the end card: the `ice-audio` skill, `references/cue-map-and-beat-sync.md` section 7. | motionmaxxing |
| Effects present and audible | Each SFX cue is measurably present in the delivered mix: its band in its own window against the same mix without effects (A14 of section 2b); solo peak at least -45 dBFS and audible in the mix; fail if more than half are masked by the voice or fewer than max(3, length / 30 s) are unmasked (the count is checked by hand); re-run on the delivered file after normalization. Per-cue audibility thresholds: the `ice-audio` skill, `references/sfx.md` section 6. | product-launch-motion, PolyForm ideas |
| Effects level | Measured in-band lift and 2 to 8 kHz spikes against the owner levels: the `ice-audio` skill, `references/sfx.md` section 6. | motion-video-kit, motionmaxxing |
| Relative levels | Short-term loudness of the end card against the dialogue, and effects against speech: the `ice-audio` skill, `references/mix-and-master.md` section 7. A breach is a bug | video-use |
| Voice over bed | The voice is legible without the bed sounding hollowed, and the bed comes back up between phrases; a bed that sounds notched under the voice means the ducking is too strong. Measured: A3 and A5 of section 2b; the notched sound is an ear-list item | hyperframes audio |
| Comfortable mix (every film with sound) | Two halves. The music sits under the speech: the bed level and ducking of the `ice-audio` skill, `references/mix-and-master.md` section 3, measured by `qc.py --audit` (A3 of section 2b). No repeated pulse: no music bed or SFX layer whose energy repeats as a steady throb the ear tires of; no script in this repo measures it, so it is a named item of the human listening check (same file, sections 3 and 8, with what to listen for; A17 of section 2b gives the item its time range), and the audio report says "repeated pulse: not heard", "heard at <time>" or "not listened by a human". Heard at any time fails | owner decision, 2026-10-29 |
| Arc | Judge the loudness arc per beat with K-weighted loudness, not RMS: the landing reads louder than the move into it | PolyForm ideas |
| Spectrum (optional) | Master bands roughly sub 5-35%, bass 30-65%, presence 1-5%, brilliance 0.5-6%; warnings at sub over 45%, presence over 7% (harsh), a silence gap over 0.6 s | mg-styles-15 |
| Hero moments audible | The hero moments are audible on a laptop at normal volume with the music on | motion-video-kit |
| Picture-sound ending | When the film ends in black, the score is silent within one frame of the picture | hyperframes-community-skills |
| Mix graph | When the engine builds a mix chain, read the lane ids back: a lane pointing at a missing node is pruned silently; reverb and delay tails make tracks longer than the composition (expected) | hyperframes audio |

Before applying an audio fix, state what you would expect to measure if you are wrong, and check that too (hyperframes audio). Batch audio changes and verify once with a full render plus master (product-launch-motion).

## 2b. The audit (blocking items)

`qc.py --audit` (the `ice-audio` skill, `scripts/qc.py`; commands in section 1) measures the delivered mix and exits 1 on any item of the "Blocks" column; `audio-audit.json` keeps every value, threshold, source and verdict. The "Else" column never blocks: it becomes an item of the ear list (`ice/review/ear-list.json`) or a reported warning. A blocking item is fixed in the mix and the audit runs again; it is never explained away (`delivery-report.md` section 1).

| Item | Blocks | Else |
|---|---|---|
| A1 loudness | I outside the profile's tolerance, true peak over its ceiling, LRA outside a hard range (gate column of `mix-and-master.md` section 5); also `quick-checks.mjs loudness --profile` | an LRA floor that warns: ear list |
| A3 voice over bed | in voiced 100 ms windows, the 5th percentile of voice minus bed in 1 to 4 kHz under 0 dB; "unmeasured" (no stems, no separation, and speech not declared absent) | 5th percentile under 6 dB, voiced runs under 0 dB, a median under the type's bed band: ear list |
| A5 masked words | `align_script_to_asr.py --stem` exits 1: a word right in the clean stem and lost or changed in the mix; a scene under 0.8 or the film under 0.85 in the mix while the stem meets the floor | misheard (wrong in both), low confidence (probability under 0.5), both under the floor: ear list |
| A6 joins | a click (an isolated sample step, a spike over 4 kHz) or a truncation cliff at a voice join, under speech or inside a declared quiet window | the same elsewhere: ear list |
| A7 level jumps | never | momentary loudness over 6 LU apart in the 0.4 s before and after a cut or join with no cue within 0.5 s to explain it (a sounding event, an effect, a music drop or section, a declared quiet edge, a voice line edge), or one voice more than 3 LU apart across a join: ear list (provisional; the 1.5 LU line of `mix-and-master.md` section 5 scaled to a join). Cuts: the cue sheet's cut, transition, edit or join events and `joins`, else `<render>.events.json`, else scene detection |
| A8 clipping | any run of 3 samples at or over -0.1 dBFS on the render or a stem | |
| A9 DC offset | an absolute mean over 0.001 on the render or a stem | |
| A10 stereo | anti-phase low end (under 150 Hz) or extra mono loss over 1.5 dB | balance over 1 dB (ear list), low band correlation (report) |
| A11 stream | not 48 kHz, not 2 channels, not AAC (broadcast profiles: per their spec), audio and video more than one frame apart | bitrate outside 192 to 256 kbps (report) |
| A12 silences | an undeclared hole under -50 dBFS over 0.25 s; a declared `quiet` window not 6 dB under the 2 s before | more than 0.5 s of tail outside a news reel (report) |
| A13 ending | the voice still speaking after the last frame (`master.json` `cut_at_end`, or the voice stem) | a looped or short music track, an effect cut at the end: ear list |
| A14 effects heard and in sync | a hero cue not heard (in its band and its loudest 150 ms, more than 6 dB under the mix without effects, a lift under 0.3 dB, or its own level under -45 dBFS) or late (its sync point more than 10 ms after its frame, the measurement's resolution); more than half of the measured cues not heard; "unmeasured" (no premix, or a premix that does not match the render) while a hero cue exists | other cues: not heard, or early by more than 2 frames or 40 ms, or late (report); a lift under 3 dB (ear list); the worst offset of 40 to 300 ms (ear list). Thresholds: `sfx.md` section 6 and `cue-map-and-beat-sync.md` section 5 of the `ice-audio` skill |
| A15 effects under speech | news reel: an effect under speech with over 50 % of its energy in 150 Hz to 4 kHz | other types: an effect on a word within 6 dB of the voice: ear list |
| A17 repeated pattern | never | the stretch where one pattern repeats with the least change in the music and effects stems (ambience and room tone left out; the render without stems) always becomes the repeated-pulse item of the ear list, with its time range; 15 s or more with level and band change at most 1.5 dB between 2 s blocks, a steady pulse or a drone, is also reported (provisional thresholds) |

A14 measures every sounding event of the cue sheet and every item of `sfx.json` against the same mix rendered without the SFX layer: `master_audio.py --no-sfx-premix <file>` records it in `master.json`, where the audit reads it; an engine render with the SFX layer muted is passed with `--premix <file>`. A hero cue: its cue-sheet event has `"hero": true`, or its kind, what or sound names a hero, signature, reveal, payoff or logo moment. The sync point of a cue with a file is its attack edge in the render moved by the file's own attack and sync point (`sfx.md` section 5 item 1); a cue with no file is a contact, its attack is its sync point.

Beat error per cut (A20): `python sound_map.py <music or mix> --out <folder> --cuts <film>.events.json --fps <fps>` (the `ice-audio` skill) measures each cut against its nearest beat and fails a hard cut more than 2 frames or 40 ms off (the stricter), the tolerance of `cue-map-and-beat-sync.md` section 5; an input with no reliable beat grid is reported as not measured (lesson L40).

## 3. Honesty

You cannot hear the score. Every claim about sound comes from a measurement or from a human; say which. Report the numbers, never "sounds good". A waveform establishes levels and timing, not whether the music is emotionally right (anidoodle, video-use, herk-edit-kit). The human part is the ear list: its status stays "not listened by a human" until the user answers, and the answers are logged with the router's `ice-state.mjs log`.
