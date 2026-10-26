# Word-anchored timing (so variants re-time themselves)

Read this when timing the plan and before building variants. Bind every graphic, caption, sound and effect to a meaning (a word, a phrase, a beat, an action), never to a fixed second. A new script, a new voice take, a new language or a new track then moves every element with its meaning. Fuller original text: `vendor/hypit/script-and-time.md`.

## 1. Anchors

| Anchor | Use for | Resolved from |
|---|---|---|
| Moment | An event: an answer, a verdict, a reveal, a hit | One word's start or end in the aligned voiceover, or one beat |
| Selection | A span: a demo covering an explanation, a comparison held through a claim | First and last word of the phrase |
| Beat | Music-led films without speech | BPM and offset: `t = offset + beat * 60 / BPM` |
| Action | Wordless passages | The moment an on-screen action completes |
| Clock | Literal intervals only when the interval is the design (a countdown, a fixed loop length) | Seconds |

Store the anchor in each shot (`anchor` in `plan/shots.json`) and in each timed element. Seconds are computed, never typed by hand.

## 2. Rules

- Never copy a reference timestamp into the target. Keep the relationship (the label lands with its noun; the exit clears room for the next claim). Keep an incidental lead or lag only when that offset is itself the design.
- The trigger and the entrance duration are separate choices: the anchor says when; a local duration in frames gives the arrival its character.
- For a deliberate lead or lag, define a named offset from the anchor (a few frames before the word) instead of moving the anchor.
- Do not place internal events at fixed seconds or at fixed fractions of an outer window. Each meaningful action (select, drop, reveal) gets its own anchor. Normalized progress is fine for motion inside one event.
- When an authored interval changes length, decide which part stretches and which keeps its readable duration, and write it down.
- Choose which side owns a pause: a held reaction may include the silence before the next word.
- Music: write all shot times in beats as well as seconds, so a new track needs only a new BPM and offset. Where the track starts (back-timed from its ending, so it may open mid-track) and where hits land: the `ice-audio` skill, `references/cue-map-and-beat-sync.md` section 7.
- Voiceover-led films: the voice is the clock; order of work and timing from the accepted take: the `ice-audio` skill, `references/voiceover.md` sections 4 to 6 (Arabic: the ice-arabic skill).
- A role change or a caption handoff does not need a new recording.

## 3. Re-timing check

After any change to the words, take, language or track: re-resolve every anchor, re-render, and check that each element still lands on its meaning. Check inner events, not just the outer window: a scene can start on the right phrase and reveal its result on the wrong word.
