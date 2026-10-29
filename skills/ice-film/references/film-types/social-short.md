# Film type: social short

Fields in order: Fit, Purpose, Structure options, Rhythm ranges, Timing master, Transition policy, Camera policy during holds, Sound policy, Text density, Truth and content, Richness floor, QA thresholds, Deliverables, Pointers.

Stage order: 01 02 03 [04 05] 06 [07 08a] 08b 09 10
Leads with: the story.

## Fit

A 6-60 s piece built from scratch for a feed (Reels, TikTok, Shorts, Stories, LinkedIn, X), usually vertical or 4:5. Cutting a short out of existing footage belongs to ice-edit.

## Purpose

Earn the watch in the first 3 seconds, then pay it off inside the film. Virality is an aspiration, not a result the film can guarantee; the job is a specific reason to stay and a payoff that keeps the promise.

## Structure options

| Option | Skeleton and numbers |
|---|---|
| 30 s reel architecture | 0-1.5 s hook (movement in the first 15 frames), 1.5-3 s context, 3-22 s body of 3-4 beats, 22-27 s payoff (the biggest animation), 27-30 s calm CTA |
| Open loop | hook, open loop, escalation, evidence, payoff, CTA; one main loop and at most one secondary loop open at once; the promised answer closes before the CTA (see `../openers-and-endings.md`) |
| Short skeletons by length | 10 s: hook 3.0, proof 4.5, CTA 2.5. 15 s: hook 4.0, proof 4.5, proof 3.5, CTA 3.0. 16-18 s: hook 3.0, proof A 4.5-5.0, proof B 4.5-5.0, CTA 2.5-3.5 |
| Promo for a piece of content | 15 s: 0-3 s hook (a question works better than a statement), 3-11 s three proof frames of about 2.5 s with 3-5 word labels and a slow push, 11-15 s name and where to read or watch, held still |
| Scene count by length | social reel 10-15 s with 5-7 scenes |
| One change, looped | 5-9 s; one hero object fills 60-70% of the frame and shows one satisfying change, then resets (A becomes B) |
| Listicle timed to the voice | 30-60 s, 9:16; the voice is rendered first and its timing drives the cut; facts from official sources |
| Data-feel middle | for scenes 3-5 of a 15-20 s short, where attention drops hardest, use visuals that read as evidence (numbers, diagrams, real output), not typography plus an icon |

## Rhythm ranges

- Something moves in the first second; on-screen text before 0.5 s; the first frame is readable and meaningful (it is also the cover).
- The hook lands in about the first 0.5 s; pattern-interrupt (change exactly one thing) if a unit runs past about 2.5 s.
- A 1-2 s event rhythm is a pacing diagnostic, not a cutting schedule; keep a longer hold when a developing action earns it and record why.
- Vary rhythm by sequence: a short cluster of discoveries, a brief anticipation, a payoff.

Rhythm row: mean_shot_s -; max_shot_s -; first_cut_s -; max_event_gap_s 2.5; holds excuse.

Where the row's numbers come from: max_event_gap_s: a unit running past about 2.5 s gets a pattern interrupt (above); holds excuse: a longer hold that a developing action or a payoff earns is declared with its reason (above, and Camera policy during holds); the shot fields stay open because the hook is about motion, not a cut. The row is read by the `ice-qa` skill's `scripts/film_gate.py` on the render's detected cuts when no reference is followed (`references/motion-density.md` section 6.3); a `-` is not gated.

## Timing master

The voiceover when there is one; otherwise the music grid, with reading windows. See `../cue-sheet.md`.

## Transition policy

Assign transitions by editorial purpose, never by rotating through a list; no two adjacent shots that look like the same card reveal with the headings hidden.

## Camera policy during holds

Holds are allowed when an action or a payoff earns them (a payoff hold of at least 1 s, ideally 1.5 s); otherwise keep one element alive.

## Sound policy

Muted-first: the film must work with sound off. With sound, the opening impact aligns with the visual landing within two frames and never buries the first spoken word. Ice-audio owns the mix.

## Text density

- Claim on screen as type in the first seconds. Caption grouping and words per cue by caption style: the `ice-type` skill, `references/captions-system.md` section 5.
- Narration and captions carry the words; graphics show the example, relationship or consequence, not a third restatement.
- Platform safe zones per network: ice-engines.

## Truth and content

Do not invent a result to make a more satisfying payoff; do not withhold the topic, fabricate a failure or add a vague "wait for it". Every number on screen is explainable from what the short showed (ice-assets).

## Richness floor

Minimums the render must meet; measures, exempt shots and how to fix a thin frame: the `ice-motion` skill, `references/composition-and-staging.md` section 7. ice-qa measures them. A muted thumb at phone size decides: a small hero on a big field scrolls past.

| Measure | Floor |
|---|---|
| `hero_share` | 40 percent (50 percent in a "one change, looped" short) |
| `hero_width` | 50 percent for type hooks |
| `frame_fill` | 12 of 16 cells |
| `empty_half` | 0 s |
| `depth_layers` | 3 |
| `in_shot_motion` | 90 percent |
| `longest_still` | 0.6 s outside the payoff hold and the CTA |
| `surface_detail` | yes in every shot |
| `light_events` | 1 per 10 s of runtime |
| `real_material` | 100 percent when a real brand, product or app appears |

## QA thresholds

- First-3-seconds gate: "In the first 3 seconds, is someone convinced to watch until the end?" Record the viewer benefit, the unresolved question, the visible evidence by second 3 and the exact payoff scene.
- Muted comprehension test; a fresh viewer can state the one idea.
- Each aspect ratio is composed, not cropped, and verified on its own, opening and CTA included.

## Deliverables

9:16 main; 4:5 and 1:1 when asked; cover frame; captions file; per-platform encodes. See `../delivery.md`.

## Pointers

Openers, three provisional openings, open loops: `../openers-and-endings.md`. Captions: ice-type. Safe zones and encodes: ice-engines.

Sources: haidrrrry/claude-remotion-skill, nateherkai/herk-edit-kit, Tejashmakwana/motionmaxxing, charlie947/motion-graphics-skills, heygen-com/hyperframes, howseen-ai/claude-motion-design, video-production-studio (Omar-Tnzxo), digitalsamba/claude-code-video-toolkit.
