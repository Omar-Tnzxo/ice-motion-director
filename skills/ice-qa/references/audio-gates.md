# Audio gates on the exported file

Measure the exported MP4, never the intermediate WAV or the stems: normalization and encoding change relative levels. Loudness targets and mix rules are owned by the ice-audio skill (by film type and platform); this file is how the check is run and read. Sources: motionmaxxing (Apache), motion-video-kit (MIT), product-launch-motion (MIT), claude-code-video-toolkit (MIT), mg-styles-15 (MIT), Barty-Bart (MIT), video-use, explainroo, video-ad-editor, anidoodle, hyperframes audio skill (Apache), founder skills; PolyForm explainer sources (ideas rewritten).

## 1. Commands

```
node scripts/loudness.mjs final.mp4         # integrated I, LRA, true peak, short-term loudness per second
python scripts/look.py final.mp4 --out ice/review/look --expect-audio   # AUDIO block: LUFS, LRA, TP, audible span, silent tail, dropouts, onsets vs cuts
ffmpeg -i final.mp4 -af ebur128=peak=true -f null -    # raw measurement
```

## 2. Checks

| Check | Pass when | Source |
|---|---|---|
| Integrated loudness | Measured I inside the chosen profile's target and tolerance. Profiles and tolerances: the `ice-audio` skill, `references/mix-and-master.md` section 5. A news reel (edit type `news-reel`, style family `family-broadcast-news.md`) is measured against the row "News reel, speech-led" of that file, not the social profile | product-launch-motion, mg-styles-15, explainroo |
| True peak | Measured TP at or under the profile's ceiling (same owner section). AAC adds a little, so expect the measured peak about 0.2 dB above the master's limiter setting | product-launch-motion, claude-code-video-toolkit |
| Quiet is not safe | A render well under target fails too: platforms turn loud content down but never turn quiet content up. Fail and warn floors: the `ice-audio` skill, `references/mix-and-master.md` section 5. | claude-code-video-toolkit, motion-video-kit |
| Loudness range | Measured LRA inside the profile's LRA range: the `ice-audio` skill, `references/mix-and-master.md` section 5. | motion-video-kit |
| Scene consistency (narrated films) | Per-scene VO loudness spread against the median scene. Accept and fix windows: the `ice-audio` skill, `references/mix-and-master.md` section 5; short-window reliability: same file, section 6. | claude-code-video-toolkit |
| Silence | Measured lead, tail and inside gaps against the owner limits: the `ice-audio` skill, `references/mix-and-master.md` sections 4 and 7. When the film opens on sound, the first 100 ms sit within about 12 dB of the peak | motionmaxxing, product-launch-motion |
| Music fit | Music covers the whole cut; audible span at least 85% of the request. Leading and trailing silence limits: the `ice-audio` skill, `references/mix-and-master.md` section 4. Landing on the end card: the `ice-audio` skill, `references/cue-map-and-beat-sync.md` section 7. | motionmaxxing |
| Effects present and audible | Each SFX cue is measurably present in the delivered mix (compare the same window against the previous master); solo peak at least -45 dBFS and audible in the mix; fail if more than half are masked by the voice or fewer than max(3, length / 30 s) are unmasked; re-run on the delivered file after normalization. Per-cue audibility thresholds: the `ice-audio` skill, `references/sfx.md` section 6. | product-launch-motion, PolyForm ideas |
| Effects level | Measured in-band lift and 2 to 8 kHz spikes against the owner levels: the `ice-audio` skill, `references/sfx.md` section 6. | motion-video-kit, motionmaxxing |
| Relative levels | Short-term loudness of the end card against the dialogue, and effects against speech: the `ice-audio` skill, `references/mix-and-master.md` section 7. A breach is a bug | video-use |
| Voice over bed | The voice is legible without the bed sounding hollowed, and the bed comes back up between phrases; a bed that sounds notched under the voice means the ducking is too strong | hyperframes audio |
| Comfortable mix (every film with sound) | Two halves. The music sits under the speech: the bed level and ducking of the `ice-audio` skill, `references/mix-and-master.md` section 3, measured on the exported file. No repeated pulse: no music bed or SFX layer whose energy repeats as a steady throb the ear tires of; no script in this repo measures it, so it is a named item of the human listening check (same file, sections 3 and 8, with what to listen for), and the audio report says "repeated pulse: not heard", "heard at <time>" or "not listened by a human". Heard at any time fails | owner decision, 2026-10-29 |
| Arc | Judge the loudness arc per beat with K-weighted loudness, not RMS: the landing reads louder than the move into it | PolyForm ideas |
| Spectrum (optional) | Master bands roughly sub 5-35%, bass 30-65%, presence 1-5%, brilliance 0.5-6%; warnings at sub over 45%, presence over 7% (harsh), a silence gap over 0.6 s | mg-styles-15 |
| Hero moments audible | The hero moments are audible on a laptop at normal volume with the music on | motion-video-kit |
| Picture-sound ending | When the film ends in black, the score is silent within one frame of the picture | hyperframes-community-skills |
| Mix graph | When the engine builds a mix chain, read the lane ids back: a lane pointing at a missing node is pruned silently; reverb and delay tails make tracks longer than the composition (expected) | hyperframes audio |

Before applying an audio fix, state what you would expect to measure if you are wrong, and check that too (hyperframes audio). Batch audio changes and verify once with a full render plus master (product-launch-motion).

## 3. Honesty

You cannot hear the score. Every claim about sound comes from a measurement or from a human; say which. Report the numbers, never "sounds good". A waveform establishes levels and timing, not whether the music is emotionally right (anidoodle, video-use, herk-edit-kit).
