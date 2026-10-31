---
name: ice-type
description: >
  Internal part of Ice Motion Director, not a command: start with /ice.
  Typography in motion for Ice Motion Director films and edits: kinetic typography techniques,
  text hierarchy and density per film type, font sizes per aspect ratio, reading-time formulas
  and readability gates, caption and subtitle systems (drop, rail, embed, word-by-word, 3D depth
  captions), caption placement and platform text safe zones, the trusted-text rule (captions match
  the script, ASR gives timing only), and font loading and fallback rules.
  Called by Ice Motion Director workflows; use only when called by name.
license: Apache-2.0
metadata:
  author: Omar-Tnzxo
  version: 0.2.8
---

# ice-type

Owns every word that appears on screen: display type, kinetic type, captions and subtitles. Workflows call this skill when a storyboard, script or edit plan contains on-screen text.

Not owned here (point, never restate):
- Arabic, RTL, bidi, Arabic captions and fonts: the `ice-arabic` skill.
- Font family choice, pairing, palette: the `ice-direction` skill.
- Easing families, springs, camera, cuts: the `ice-motion` skill.
- Font and asset licensing, truth sheet for names and numbers: the `ice-assets` skill.
- Platform export specs and engine guides: the `ice-engines` skill.
- Running gates and critics: the `ice-qa` skill (this skill sets the thresholds).
- Voiceover pacing, beat grid, ASR engine setup: the `ice-audio` skill.

## 1. Inputs and outputs

Read `ice/BRIEF.md` slots: film or edit type, platform, aspect ratio, language, audience, voiceover yes or no, captions requested yes or no. Write every type decision (sizes, caption style, reading rates, safe zone source and check date) to `ice/DIRECTION.md` with its reason and the reference file it came from.

## 2. Workflow

1. **Classify the text.** For each on-screen text, assign a role: caption, display (hero, headline, support, label), title card, lower third, diegetic, texture. See `references/captions-system.md` section 1 and `references/type-system.md` section 1.
2. **Decide captions on or off** with the table in `references/captions-system.md` section 2. Speech in social edits: on. No-voice motion films: off, text performs.
3. **Set density** for the film type with `references/reading-time.md` (section "Text density and hierarchy per film type"). Cut copy before shrinking type.
4. **Set sizes** for the aspect ratio and viewing context with `references/sizes-and-scale.md`. Respect the phone floors for any feed delivery.
5. **Set the type system** (weights, family count, tracking, case, punctuation, numbers) with `references/type-system.md`, using the families chosen by `ice-direction`.
6. **Choose motion** for display text with `references/kinetic-type.md`; pull numbers for named effects from `references/type-effects-specs.md`.
7. **Build captions** (when on): grouping in `references/captions-system.md`, look in `references/caption-styles.md`, text and timing in `references/caption-timing-and-truth.md`, position and contrast in `references/caption-placement-safe-zones.md`, embedded or 3D captions in `references/depth-and-embedded-captions.md`.
8. **Load fonts** as files and assert them before the first frame with `references/type-system.md` (section "Font loading, fallback and text measurement").
9. **Set holds** with `references/reading-time.md` and hand its gate thresholds to `ice-qa`.

## 3. Non-negotiables

1. Captions spell the approved words; ASR supplies timing only. Align script to ASR with `scripts/align_script_to_asr.py`; a match below 60% means a stale script: stop and ask. Before delivery, check the captions against a fresh transcript of the final audio with `scripts/align_script_to_asr.py --check-captions` (`references/caption-timing-and-truth.md` section 6).
2. Never invent speech, numbers, names or lyrics. Lyrics come only from the user.
3. Visible display text is not the transcript: 1 to 5 key words, never the narration sentence twice on screen.
4. Every text holds long enough to read (section 4); count from the frame it is whole.
5. No text under the phone floor for feed deliveries (no text below 30 px on a 1080-wide vertical, body at least 44 px; captions at least 4.5% of frame height).
6. No text inside platform UI zones; never over the mouth, eyes or the detail the shot is about.
7. Measure contrast from the real pixels behind the text; never white on light.
8. Fonts ship as files, load before frame 0, and are asserted; no fallback font or missing glyph in any frame.
9. Headline typing (letter by letter with a caret) is banned outside a real input, console or typewriter look. The pointer reveal and the coloured-head typewriter of `references/type-effects-specs.md` "Broadcast text" are mask reveals, not typing (news reel and measured references only).
10. One caption look per video; one family and at most two weights for captions.

## 4. Quick numbers (defaults until a reference says otherwise)

| Need | Default | Reference |
|---|---|---|
| Hold, display text with no voice | `letters / 15 + 1.5` s (Latin) | `reading-time.md` |
| Hold, display text echoing the voice | 0.35 s per word + 0.3 s, at least 1.2 s | `reading-time.md` |
| Hold, subtitle | at least 1.8 s and at least spoken line + 0.6 s | `reading-time.md` |
| Caption reading speed | at most 17 characters per second | `reading-time.md` |
| Caption cue | up to 6 words or 2.5 s; at most 2 lines of 32 to 42 characters | `captions-system.md` |
| Caption sync | within 2 frames of the word onset; group in 0.08 s early | `caption-timing-and-truth.md` |
| Caption size | cap height 3.5 to 5% of frame height | `sizes-and-scale.md` |
| Readable floor | 4% of frame height; below 2% is texture | `sizes-and-scale.md` |
| Title-safe | Platform safe zones and title-safe areas: the `ice-engines` skill, `references/platform-specs.md` section 3 | `caption-placement-safe-zones.md` (caption placement inside them) |

When two references give different numbers, use the row scoped to the current film or edit type; every conflict table names the scope.

## 5. Files

| File | Open when | Holds |
|---|---|---|
| `references/captions-system.md` | Any spoken content; deciding captions on or off; grouping words | Text roles, on/off table, drop/rail/embed model, routing, grouping limits per style, emphasis distribution, head-following captions |
| `references/caption-styles.md` | Choosing a caption look | Style axes, tone table, caption motion vocabulary, scoped house presets, the 35-look catalog, style conflicts |
| `references/caption-timing-and-truth.md` | Writing caption text or timing | Trusted-text rule, transcription rules, sync targets, lead and tail, edit timeline rules, deliverables |
| `references/caption-placement-safe-zones.md` | Placing any text or caption | Caption bands and baselines, face rules, contrast ladder (the platform safe zones themselves: `ice-engines` `references/platform-specs.md`) |
| `references/depth-and-embedded-captions.md` | Cinematic, behind-subject or 3D captions | Embed craft, occlusion gate, camera 3D caption setup, depth, moves, timing, checks |
| `references/reading-time.md` | Setting any hold; QA thresholds | Hold formulas by role, floors, rates by script, readability gates |
| `references/sizes-and-scale.md` | Setting font sizes | %H role scale, landscape, vertical, caption sizes, web to video scale |
| `references/type-system.md` | Setting weights, families count, tracking, case, punctuation, numbers | Type roles, weight systems, scoped family rules, tracking and alignment, emphasis, numerals |
| `references/reading-time.md` (section "Text density and hierarchy per film type") | Writing on-screen copy; storyboarding text | Density rules, words per film type, callouts, text over picture |
| `references/kinetic-type.md` | Animating display text | Principles, onset gaps, entry mechanics, exits, holds, typing rules, beat type, named techniques |
| `references/type-effects-specs.md` | The storyboard names an effect | Numbers for depth, glow, sweeps, counters, odometers, markers, broadcast text (pointer reveal, coloured-head typewriter, blink exit, scanline headline, lower third, location tag, source credit, glass subtitle box, crimson-to-white title), write-on, Lottie text |
| `references/type-system.md` (section "Font loading, fallback and text measurement") | Before any render with text | Font files, loading, glyph coverage, measuring and fitting, determinism |
| `scripts/align_script_to_asr.py` | A script exists and ASR timings exist; before delivery of any captioned film | Aligns script words onto ASR timings, exit 3 on a stale script; `--check-captions` checks delivered captions against a fresh transcript, exit 4 on a mismatch |
