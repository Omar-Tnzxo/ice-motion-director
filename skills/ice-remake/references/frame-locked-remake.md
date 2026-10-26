# Frame-locked remake mode (frame by frame, parallel agents)

Read this only when the mode is frame-locked (`rights-and-modes.md`). It recreates a reference 1:1 in layout, size, position, timing, easing, camera, cuts, blur, cursor path and typing cadence, swapping only the content.

## 0. Gate

Frame-locked mode is available for any reference the user asks to remake frame by frame; record it in `BRIEF.md` with the neutral rights line of `rights-and-modes.md` section 1. Its two limits still apply: the reference's own footage, frames, music, voice-over, logos and characters are recreated, never placed in the film, and real people's faces and voices follow `ice-assets/references/ai-media-policy.md` section 9.

## 1. Phase 0: analysis (no building)

1. Extract every frame (0-based numbering) and the audio of the user's file; run `analyze.py` for shots and audio, and a frame-difference pass for hard cuts (mean absolute difference spikes).
2. Build contact sheets of about 6 frames per shot and read them.
3. Write `plan/SPEC.md`: a shot table (id, first frame, last frame, reference content, what replaces it) and the swap rules (section 3).

Expect few hard cuts: in modern launch-style films most apparent cuts are continuous camera or morph moves (often only 10-15 real cuts in a minute). Expect SPEC boundaries to be off by up to about 4 frames; builders correct them against the real cut frames.

## 2. Phase 1: engine (director, before any builder)

- One page whose picture is a pure function of the frame number F: no clock, no timers, no unseeded random (seeded hash only), no state carried between frames. Engine choice and determinism rules: the ice-engines skill.
- A shot registry (`SHOT({id, f0, f1, render})`), a camera, a cursor drawn to match the reference's cursor (often not the system arrow), text placed by ink edge, keyframe tables, and per-frame measured sample arrays.
- A palette filter that re-hues any leftover old-brand color.
- One placeholder file per builder group; smoke-test a side-by-side compare at three frames spread across the film before builders start.

## 3. Swap rules (fill per project)

- Old brand to the user's brand: mark, app icon, accent colors become brand tokens.
- Partner or co-brand marks: never imply a partnership that does not exist.
- People from the reference: replaced with logo tiles, cards or neutral shapes of the same size and motion.
- Copy is true for the user's brand; mock interface numbers read as examples.
- Never reuse the reference's music, voice or images.

## 4. Phase 2: parallel build

- Split shots into about 4 contiguous groups; one builder each, writing only its own group file (helpers prefixed with the group id), never the engine or scripts.
- One audio agent in parallel: analyse the reference's tempo, drop, hard stop and hit times (speech timing only as timing, never its words); a licensed or generated track stretched by no more than 8 percent and cut on bars so drops land on the reference times; effects synthesized on the reference hits; loudness per the ice-audio skill.
- Builder brief (write one per group, from these slots): working folder, page address, acceptance bar (section 5), swap rules, file rules, method (below), report format.
- Method: measure with numpy on reference frames (ink bounding boxes, typed character counts per frame, cursor tip, camera scale and offset, fade timing) and drive motion from those samples. For a physical move, measure angle or position keys from frames tiled at 10 and 30 fps and interpolate them with a monotone cubic (Fritsch-Carlson, zero end slopes); plot the per-frame speed, which should peak once and settle. A measured curve is rarely a stock smoothstep. Lock the camera during a measured move; reframe after it lands.
- Verify per shot with side-by-side compare sheets (reference above, ours below) at the first and last frame, keyframes and 2 frames into every transition, at most 15 frames per call. Never claim a match without viewing reference and ours together.
- Measure text widths only after fonts load. Check the reference's real cut frames rather than trusting the SPEC.

## 5. Acceptance bar

Shown side by side in sync, position and size error at most 1-2 percent of the frame; cuts 0 frames off. Differences are allowed only where the swap forces them (a longer brand name), and each is reported.

Builder report: `shot | frames | MATCHES / CLOSE / ROUGH | residual difference | frames that would drift | spec errors`.

## 6. Phase 3: integrate

- Full render in parallel chunks (about 3 for films longer than 25 s), mux the mix.
- QA: reference and ours one frame per second, every group seam, an old-brand color scan, and a stacked sync check.
- Optional split-screen deliverable ("original | remake") when the user asks for it (showing the original is the user's call, like every rights question): two panels with a gap and plain labels; set the sample aspect ratio to 1 or the panels distort. Credit the original; never claim a production time or method that is not true.
- The climax duel (`climax-duel.md`) still runs; in this mode `equal` is the target and `ref_better` still blocks.
