# Climax design and the climax duel

Read this when confirming the reference's peaks, designing the hero shots, and before delivery. The aim is a film that lands its peak at least as hard as the reference, not a film with nothing wrong. Impact comes from climax design, not from even effort across every shot.

## 1. Find and confirm the reference's peaks

Clues: `report.json` `audio.peak_candidates` and `flashes`. Clues only. For each candidate:

```
python <skill>/scripts/clip_strip.py <ice>/reference/<ref-id>/analysis/proxy.mp4 --range <t-2>:<t+2> --out <ice>/reference/<ref-id>/evidence/peak_<n>.jpg
```

(12 fps by default; use the file named in `report.json` "analysed"; the script stops if the reference rows are black.) Look at every strip and confirm the real hit. A reference without music still has one strongest moment (a gag, a reveal, a reversal): find it by eye. A short film may have only one peak.

Write `<ice>/reference/<ref-id>/peaks.json`:

```json
[{ "id": "P1", "from": 0.0, "hit": 0.0, "to": 0.0, "strip": "evidence/peak_1.jpg",
   "build": "<how tension stacks>", "hold": "<the held breath: what goes quiet, still or narrow, and for how long>",
   "hit_what": "<what flips on the hit frame: composition, color, action, sound>", "after": "<how long it holds, how it settles>",
   "sound": "<silence, wind-up, impact, downbeat>", "subject_fill": 0.0, "cut_on_hit": false, "kind": "<lift | drop | flip, optional>",
   "techniques": ["<each technique seen>"], "why_it_works": "<one line>" }]
```

## 2. Climax anatomy (the target must match it)

| Phase | Rule |
|---|---|
| Build | Tension stacks; something new every 1-1.5 s; never one composition held 3 s waiting for the hit |
| Held breath | Quiet, stop, narrow. Length within plus or minus 30 percent of the reference's held breath. A near-empty frame lasts no more than 1.2 s |
| Hit | Lands on a musical downbeat or section start. Composition, color, action and sound change on the same frame. Effects start on the causing frame, never shortly after |
| Hold | At least 1 s for the emotion to land; do not cut away at once |

The hit must be visible:
- At the hit frame and the hold, the protagonist fills at least 30 percent of frame height. To show scale, keep the protagonist in the foreground or enlarged at center, never a distant dot.
- Frame density at least as full as the reference's hit.
- Use at least as many techniques as the reference's hit used (custom poses, exaggerated faces, impact frames, smears, rays or particles, camera shake, color flip, wind-up and impact sound, silence before the hit). Prepare them up front as shared definitions.
- Flashes, irises and transitions may only be the fuse. A white flash or transition must never cover the moment that should be seen (a reveal, an embrace, an expression). Never use a flash or cutaway to hide an action you cannot build: add the pose or restage.

Subject size in other shots (separate context, kept separate): emotion, dialogue and expression shots keep the protagonist at 35 percent of frame height or more with a readable face; deliberate establishing wides are exempt. Hero action is written to the frame: anticipation, burst, hold.

## 3. Before approval: key frame versus reference

Render each hit frame next to the reference's and improve it until it is not weaker. Save each key-frame pair as `<ice>/review/remake/key_<n>_vs_ref.jpg` (reference left, ours right) and show it first among the style frames. Key-frame rule and self-assessment: the `ice-qa` skill, `references/climax-duel.md` section 2 (step 5).

## 4. The duel (before delivery, by a fresh read-only critic)

The builder never judges its own climax. Every peak: ours versus the reference, frame-aligned at 12 fps, plus loudness around the hit. `ref_better` never ships. For each peak, the critic's range is our `build_from_s` to `hit_s + hold_after_s` against the reference's `from` to `to`; make the strip with:

```
python <skill>/scripts/clip_strip.py <our-render.mp4> --range <a>:<b> --vs <ice>/reference/<ref-id>/analysis/proxy.mp4 --vs-range <c>:<d> --out <ice>/review/remake/duel_<n>.jpg
```

Duel steps, verdicts and must-fix rules: the `ice-qa` skill, `references/climax-duel.md` sections 2 and 3. Proof of motion fixes: the `ice-qa` skill, `references/critic-loop.md` section 5.

## 5. Sound at the climax

- Pre-place climax sound in the shared mix: silence or a drop-out before the hit, a rising wind-up, the impact or downbeat on `hit_s`.
- Never place the reference's own music, voice or effect recordings in the film: recreate them (new music in the same genre, tempo, energy and structure; new effects of the same types at the same moments; `rights-and-modes.md` section 1). With the user's own, licensed or generated track: stretch it by no more than 8 percent and cut on bar lines so its drops land on the reference's peak times, or re-time the plan to the new track's drops (`word-anchored-timing.md`). Mixing and loudness: the ice-audio skill.

## 6. Reference-relative scoring (final critic)

Score every shot from its `compare.py` pair as well as the whole film. Every category and every shot is scored 1-5 against the reference; anything under 4 is a must-fix. Then run the fidelity self-check (`fidelity-contract.md` section 6) on the render. The reference ruler and pass rule: the `ice-qa` skill, `references/critic-loop.md` section 4. Scoring categories: the `ice-qa` skill, `references/critic-prompts.md`, the Remake critic section.

Round limits and the general critic loop, gates and delivery report: the ice-qa skill. After the duel, hand to the ice-qa skill for the general gates and the delivery report. The report states honestly: path, length, resolution, one line per shot, which reference mechanisms were kept, any medium translation, any stat outside the contract with its reason, anything still a placeholder, every decision taken in place of the user, and the permissions a brand owner would need (logos, product screens, music, people shown).
