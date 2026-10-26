# Climax duel against a reference

The climax is the whole value of many films; "nothing is wrong" is not the goal. The duel compares our hit with a reference hit frame by frame, so a weaker climax cannot pass on averages. Reference analysis and its tools (peak detection, the strip and compare scripts) are owned by the ice-remake skill; this file is the gate. Sources: reelmimic (MIT, translated), motionmaxxing (Apache), motion-video-kit (MIT), mg-styles-15 (MIT), founder skills.

## 1. When it runs

| Situation | Reference | Required |
|---|---|---|
| Reference remake (ice-remake) | The analysed reference file and its peak ranges | Yes, for every hero shot and the film's climax |
| A film with a user-supplied reference for energy or quality | That reference's strongest moment, located by timestamp | Yes, for the climax |
| No reference | The previous approved version, or the strongest frame named in the plan | Blind A/B of versions (section 4) |

## 2. The duel

1. Locate our range: from the build start to the hit plus the hold after it. Locate the reference range from its peak list. Never guess a time: locate it from the plan, the playhead or the media.
2. Make a frame-aligned strip: reference row above, ours below, 12 fps, same number of frames, each frame labelled with its time (the ice-remake skill's strip tool). A reference row that comes out almost black means the wrong file or range: stop, do not compare.
3. Compare seven things: the build, the held breath before the hit, the hit frame, the hold after it, density, subject size, sound placement. Measure the loudness change around the hit on both (ebur128 or astats) instead of describing it.
4. Verdict: ours_better, equal or ref_better, with specific reasons.
5. Before plan approval, render each planned hit frame at final quality next to the reference's same frame; if ours is weaker, keep improving density, light, subject size or composition before handing it over, and write a one-line self-assessment.

## 3. Pass rules

- A climax that loses to the reference never passes, even if the critic forgot to list a fix for it: a lost duel automatically adds a must-fix.
- Even when ours_better, every weakness written in the reasons (protagonist too small, held breath too long, nothing to see after the hit, a misread accessory) is its own must-fix. The climax is never a nice-to-have.
- In a hero shot, a pose changing in one frame (no in-between) or the protagonist under 30% of frame height at the hit or the hold is a must-fix.
- A weaker hit (small subject, empty frame, no hold, covered by a flash, no anticipation or impact) is a blocker in the builder's own shot check, before any critic sees it.
- Flashes, irises and transitions may only be the fuse: a white flash or a transition must never cover the moment that should be seen (a hug, a reveal, an expression). Never cover an action you cannot animate with a flash or cutaway: add the pose or restage it.
- Every shot compared side by side scores 4 or more on the reference ruler before delivery (see `critic-loop.md` section 4).
- Numbers flag, eyes decide: a "motion mismatch" (one side still, the other moving) from the compare tool is a lead to look at, not a verdict.

(reelmimic)

## 4. Without a reference: blind A/B and the screenshot test

- Is there one frame worth a screenshot? Name it; it should be the hardest-worked frame, at about 60-75% of the runtime (energy curve owned by the ice-motion skill). If you cannot point to it, the hero moment is missing (motionmaxxing).
- A hook in the first 0.5 s, an unmistakable hero moment and a satisfying end frame (the concept-wow dimension, mg-styles-15).
- Blind A/B between versions: random left and right, synced playback, the person picks, marks slop, scores 1-10 and writes a note; judge the picture silent first, then each soundtrack alone; the verdict is appended to the taste record. Never certify your own film as good: only the user decides taste (motionmaxxing).
- A/B at identical resolution, frame rate, loudness, music and device, with synced timecodes, at full speed first (founder skills).
- A new version replaces the old only if side-by-side judges prefer it (claude-motion-design).
- For short ads, the window gate: split the film into windows of about 2.9 s (7 windows for 20 s); each must be a YES; PARTIAL fails (motion-video-kit).
