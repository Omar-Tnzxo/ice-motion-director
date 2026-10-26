# Verification loop for agents that cannot watch

Spine stages 06 (sample), 09 and 10. You cannot watch the film or hear the mix. Every claim about them comes from a measurement or from a human, and the report says which. Generic gates (dead time, motion density, seams, loudness, fingerprint, slop scan) and the delivery report format are owned by `ice-qa`; this file holds the explainer-specific loop and calls those gates.

## 1. First-shot gate (stage 06)

Build the whole film as a skeleton with placeholders, fully implement one sample segment (the hardest one, or the first 30 s for long films), render it with its voice, and get it approved before building the rest. Approval follows the router's stops table (`ice-motion-director/SKILL.md` section 5, "Stops"): in step mode the sample is on the 06 review card; in auto mode it is the one preview approval when the session is interactive and the user did not say not to ask (fast mode skips it), otherwise the critic and the approver judge it. Whether to render the whole film at once or segment by segment is decided, not asked: segment by segment for long-form and for any film whose sample needed fixes, at once otherwise; log the choice in `ice/DIRECTION.md`. Never start with a blind full render.

## 2. Static checks before any render

Run after the voice exists (some engines generate missing narration during checks).
- Layout: overlaps, elements touching the edge, text outside the frame, intersecting boxes.
- Contrast of text against what is actually behind it.
- Text size at player width (the phone gate): the `ice-qa` skill, `references/frame-checks.md` section 6. Check at a small feed width (about 854 px for 1080p landscape).
- Caption band clear of content when captions are on.
- Pronunciation flags from the speech check resolved.
- Stale stretches: no new element for more than 6 s between cues.
- Lint of `segments.json` (`references/word-timed-segments.md` section 5).
- Static extraction of every on-screen literal reconciled with the facts list.

## 3. Stills and sheets

- Sampling plans (risk windows around transitions and layout switches, three consecutive frames at state changes): the `ice-qa` skill, `references/frame-checks.md` section 3. Add one still per segment at its settled moment.
- Contact sheets at 0.3 to 0.5 scale for review; open a full-size frame only for a doubt the sheet raised. Do not re-read images you already judged.
- Judge like a viewer: is the text big enough; is anything cut off or on top of something else; is half the frame empty; does the sheet show something new every few seconds.
- Render one frame at 2x scale before trusting a still; transform errors can look right at 1x.

## 4. Beat landing table

For every cue: the anchor word's time, the measured first-visible (or settle) frame, the difference. Judge each difference with the beat check per block and the text lead window (text lands 0 to 2 frames before its word, never late): the `ice-qa` skill, `references/captions-and-sync.md` section 2, and the `ice-audio` skill, `references/cue-map-and-beat-sync.md` section 5. A sentence with no visual change is high severity (same `ice-qa` file).

| Finding | Severity |
|---|---|
| Anchored action less than 0.5 s before the segment exit | Medium |

## 5. Coverage

- Every required family from `semantics.json` is visible in its segment (name plates, numbers, sources, call to action).
- Every named entity appears.
- Every number on screen matches the facts list, including counter intermediate values.
- Reviewers check what should be on screen, not only whether what is on screen is right (a missing name plate once passed three reviews).

## 6. Final-mix re-transcription

Run speech recognition on the audio of the final rendered file (not the voice stem) and compare it with the script. Match floors per scene and overall, and what to do below them: the `ice-audio` skill, `references/mix-and-master.md` section 7 (gate: the `ice-qa` skill, `references/captions-and-sync.md` section 1). Re-transcribe before every final render: the `ice-audio` skill, `references/voiceover.md` section 5.
- Also confirm: duration equals the plan, frame counts per segment are exact, no black frames, no unintended silence, audio present exactly when expected.
- Loudness, true peak and effect audibility are measured by `ice-audio` and `ice-qa` on the delivered file; re-run the audibility check after normalization because it changes relative levels.

## 7. Independent critic

The critic loop is owned by the `ice-qa` skill, `references/critic-loop.md`: roles and the fresh-context critic (section 1), the review packet (section 2), P0, P1 and P2 severity (section 4), before and after evidence for fixes (section 5), round limits (up to 3 rounds, then remaining issues go to the user, section 6), reports written to disk and re-dispatch (section 8). Brief the critic with `roles.md` section 6. Explainer additions:
- A required element from `semantics.json` missing on screen, or a card that does not match its library card, counts as P1.
- The critic retells the story from the film before reading the brief; where the retelling differs, the film is at fault. This does not replace clarity read 3, which runs first with a viewer who never gets the brief or the story (the `ice-qa` skill, `references/clarity-gate.md`).
- Before changing anything, look at the biggest P0 and P1 once more at full size, trying to prove them wrong.

## 8. Delivery report

Write it per `ice-qa` format, including at least:
- Paths: film, caption files, chapters list, cover.
- Duration and frame count.
- Measured results: beat landing summary, re-transcription match, loudness and peak, gate outputs.
- Facts: which were independently checked, which came from the user, what was simplified, which data is illustrative.
- What could not be checked (for example: nobody listened to the music; platform compressed copies not checked) and what a human should look at.
- Never upload or present a draft as the final. After a platform upload, check its lower-quality copy as well as the full one.
