# Edit type: long-form (YouTube and courses, talking head plus visual layer)

Sources: nateherkai/herk-edit-kit (MIT, Use Permission: edit-video, video-storytelling, hyperframes-video-beats), browser-use/video-use (MIT), Omar-Tnzxo/video-production-studio, heygen-com/hyperframes (Apache-2.0: talking-head recut), Barty-Bart/motion-graphics (MIT), plus ideas restated from Vincentwei1021/video-talkcraft (ideas only).

Stage order: 01 03 02 04 06 05 [07 08a] 08b 09 10
Leads with: the footage. 01 ingests and transcribes first; 03 is the paper edit (silence cut, retakes, air pass on the transcript); 02 picks the visual-layer structure; 06 locks the rough cut; 07 builds and reviews the visual layer per section.

## Purpose
Turn a raw recording (one speaker, several minutes or more) into a clean, breathing edit with a visual layer that helps comprehension without restarting it every few seconds.

## Pipeline
1. Ingest and probe (`ingest-and-ledger.md`); transcribe once.
2. Silence cut at `--gap 0.55` with breath (`silence-and-retakes.md`), then reviewed retakes on the silenced transcript.
3. Air pass: restore 4 to 8 frames of room tone where sentence joins are about 10 times tighter than the speaker's median (`cut-craft.md`).
4. Lock the cut; story pass on the locked transcript with anchors (`clock-and-grouping.md`).
5. Visual layer (choose one structure, below), built per section, each section rendered and reviewed muted before the rest.
6. Self-review at every cut, delivery report `ice/review/NOTE.md`, final render (`production-rules.md`, `export.md`).

## Structure options (choose by the material; never default)
- Overlay cards on the talking head: takeovers for the hook payoff, section changes, big stats, a thesis line or a short quote (sparse text, 4 to 12 s); lower thirds when the speaker should stay visible (one headline plus an optional subline, or a 2 to 4 item list; one card per topic span rather than many tiny flashes). Never cover a long explanation with a takeover.
- Persistent world (graphics-led explainer): one space that never resets; each element, once drawn, is never redrawn, moved or relabelled; one travelling subject carries the story. Open loops in a long-form world: the `ice-ideas` skill, `references/hooks-and-openers.md` section 6. World design, camera altitudes and spotlight belong to the ice-motion skill.
- Motion B-roll clips over the talking head (`broll-and-motion-broll.md`), density 2 to 7 per minute.
- Speaker plus framed B-roll with a speaker badge (`layers-and-isolation.md` section 3).

Do not add graphics just because a gap exists; add them when the narration has a topic, transition, proof point or mental model that benefits from support. Every overlay, keyword, lower third, mark and insert sits on the word or sentence that triggers it, with its reason (`broll-and-motion-broll.md` section 1). Speaker look and marks: the speaker stays lit and unmarked; dimming, silhouettes, rings and target marks go only on the people talked about (`layers-and-isolation.md` section 5).

## Rhythm ranges
| Measure | Value |
|---|---|
| Silence trim | Pauses of 0.55 s or more, breath 0.14 to 0.24 s kept |
| Visual beat cadence | No more than 20 to 30 s without a beat early, 30 to 45 s in the body |
| Card count (overlay recut) | Formula in `house-style-numbers.md` section 5 (minimum 5) |
| Dead screen (graphics-led) | Under about 1.5 s with nothing happening |
| Speaker presence (graphics-led) | About 40%, absences audited at payoff beats |
| On-screen words (graphics-led) | About 20 per section, labels 1 to 2 words, no sentences |
| Outro | Hold 4 to 6 s |

## Coverage floor

Minimums the edit plan and the render must meet; the measures, the reference rule and exemptions: the `ice-qa` skill, `references/motion-density.md` section 6.2. `scripts/validate-plan.mjs` reads this table. The visual beat cadence above counts overlay beats; this floor counts every visual change, cuts and camera moves included.

| Measure | Floor | Where the number comes from |
|---|---|---|
| `element_events_per_min` | 7.5 | One visible change per 8 s at least: a single take over about 8 s gets a visible change every 3 to 5 s (the `camera` row for speaker edits in the `ice-direction` skill, `references/treatment.md` section "Craft plan"); cards by the formula of `house-style-numbers.md` section 5 add to it |
| `longest_bare_talk_s` | 5 s; 8 s | The same row: a change every 3 to 5 s inside a take (strict line), and no take over about 8 s left without one (fail line) |
| `trigger_coverage` | 100 percent | Every content trigger answered within 1.5 s or declined with its reason (`motion-density.md` section 6.2) |
| `broll_share` | 0 percent | The structure decides (Structure options): motion B-roll at 2 to 7 clips per minute only in that structure; overlay cards and a persistent world carry the visual layer instead and count in `element_events_per_min` |

## Transition policy
- A-roll speech joins: hard cuts.
- Persistent world: no crossfade ever; full-bleed layers enter and exit by clip on an opaque background; camera moves and full-frame wipes run in sequence, never overlapping.
- Overlay cards: designed enter and exit; a card clears 0.1 to 0.5 s before the next.

## Camera policy during holds
Talking-head shots: static locked zoom per segment (calm cycle in `house-style-numbers.md`). Graphics-led holds: follow the ice-motion skill; vary move duration with distance travelled.

## Sound policy
Room-tone air, never digital silence. A quiet music bed under speech when used, chosen from the ice-audio skill's ladder (real library music; music made by code only when the user names it), levels in the same skill. Sound effects follow visible actions only.

## Text density
Glance comprehension: a card reads in under one second. No repetition of the whole voiceover, no long sentences, few highlighted words.

## QA thresholds
Black-detect reports 0; contiguous frame strips across every transition; legibility read by eye on a 960x540 downscale of every major beat; verify the assembled film, never section prototypes; acoustic audit at every junction (`cut-craft.md` section 6).
