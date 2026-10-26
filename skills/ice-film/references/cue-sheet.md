# Cue sheet: one source of timing

Every film keeps one cue sheet, `ice/plan/cue-sheet.json`, that the picture, the sound pass, the captions and the checks all read. Retyped times drift; a cue sheet does not.

## Contents

1. Choose the timing master
2. Cue sheet format
3. Placement rules
4. Durations from the master
5. Export and checks

## 1. Choose the timing master

Clock modes (voice-led, music-led, hybrid, free) and which film types use each: the `ice-audio` skill, `references/cue-map-and-beat-sync.md` section 1. Pick one mode per film and write it in the cue sheet.

Film-side addition: a text-led film without voice or a steady beat runs on reading time. Write it as mode `free` and cue each reveal to its language-dependent reading hold (the `ice-type` skill), with music phrases only as a second layer.

## 2. Cue sheet format

Cue sheet schema and required fields (`fps`, `duration`, `mode`, `music`, `voice`, `events`, `quiet`): the `ice-audio` skill, `references/cue-map-and-beat-sync.md` section 2.

Film-side fields, added to every row of `events`:

- `anchor`: the word, beat number, transient id or reading rule the event comes from. An event without an anchor is an estimate and is not allowed.
- `importance`: 1, 2 or 3, so the sound pass and the checks know which events carry the film.
- Builders read event times from this file; they never retype them.

## 3. Placement rules

- Cue the meaning, not the noun: a count-up starts on the word that names the metric and finishes before the next clause.
- One beat carries at most two cues, never three.
- At t = 0 of a shot, the frame carries only what the voice is saying at t = 0; weight reveals to the back half of the shot.
- Lead and lag numbers (how early a move starts so it lands on its cue, how early a sound starts) belong to ice-motion and ice-audio; the cue sheet stores the landing time.
- Leave genuine breathers on either side of the busiest stretch; a cue sheet with a hit on every subdivision is beat-spam. Strong beats carry decisive state changes; subdivisions only secondary details.

## 4. Durations from the master

- Shot length from the voice, tail hold, real voice over estimates, and retiming after a voice change: the `ice-audio` skill, `references/voiceover.md` section 6.
- Grid arithmetic for music-led films: the `ice-audio` skill, `references/cue-map-and-beat-sync.md` section 4.
- Back-timing the music onto the end card: the `ice-audio` skill, `references/cue-map-and-beat-sync.md` section 7.
- Reading (all films): never shorten reading to hit a beat; rewrite the copy or move the cue.

## 5. Export and checks

- Exporting event times from the composition instead of retyping them: the `ice-audio` skill, `references/cue-map-and-beat-sync.md` section 2.
- Captions come from the same word timings that drive the picture.
- Picture-to-word checks before the final render (five random reveals, text lead): the `ice-qa` skill, `references/captions-and-sync.md` section 2. Also report cut offsets against the grid in ms and confirm every row of the sound plan exists in the mix.

Sources: AbubakrChan/product-launch-motion, heygen-com/hyperframes, Barty-Bart/motion-graphics, lemomo-ai/lemo-opuscar, Vincentwei1021/mg-styles-15, echris6/motion-video-kit, commercial-motion-design (Omar-Tnzxo), feitangyuan/onetake (ideas), haidrrrry/claude-remotion-skill.
