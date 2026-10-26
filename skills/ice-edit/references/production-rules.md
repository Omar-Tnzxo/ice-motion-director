# Mandatory production rules and self-review at every cut

Merged from browser-use/video-use (MIT: hard rules, self-eval), nateherkai/herk-edit-kit (MIT, Use Permission: AGENTS, editing playbook, short-form-edit quality gates), majedphotos/video-ad-editor (MIT), Omar-Tnzxo/video-production-studio, Barty-Bart/motion-graphics (MIT). The full gate catalog, critic roles and the delivery report format live in the ice-qa skill; this file holds the rules an editor applies while cutting.

## 1. Hard rules (production correctness; break one and the edit is wrong)

1. Burned caption order in the filter chain: the `ice-type` skill, `references/caption-timing-and-truth.md` section 5.
2. Overlays are time-shifted so their frame 0 lands at their window start (`setpts=PTS-STARTPTS+T/TB`).
3. Every segment boundary gets a short audio fade (`cut-craft.md` section 3), or joins pop.
4. Never cut inside a word; pad every cut edge (`cut-craft.md`).
5. Transcript type for editing: the `ice-type` skill, `references/caption-timing-and-truth.md` section 2.
6. Every later timing change rebuilds dependent captions, graphics and sound from the same map (`clock-and-grouping.md`). Source time, edited time and the output-time caption formula: the `ice-type` skill, `references/caption-timing-and-truth.md` section 5.
7. Cache transcripts per source; never re-transcribe an unchanged file.
8. The strategy is approved at 02 before the cut (the user's review card in step mode, the approver role in auto mode); honor approvals already given; never ask again for what is already approved.
9. Preserve raw files; never overwrite an approved version.
10. Independent animation slots are built in parallel by sub-agents, one file per sub-agent, each with a complete brief (goal, absolute output path, exact spec: resolution, fps, codec, pixel format, CRF, duration; palette values; font file path; frame-by-frame timeline with easing; anti-list; deliverable checklist with an `ffprobe` check). Render slots may proceed on the obvious reading of an ambiguous brief; creative choices go back to the director.
11. Never publish, post, schedule or contact anyone. Delivery is files and links, unless the user explicitly authorizes an upload.
12. Clamp every overlay to the media duration, or the render shows a black tail past the video.
13. Paid calls (hosted ASR, AI footage, TTS) happen only after the user's yes to the concrete request and its cost, asked in the stage 01 message. Without a yes take the free local path, log it, and say in the delivery note what a yes would add. Keep task IDs and reuse successful outputs.
14. Never grade or recolor a person by default (grade policy in `ingest-and-ledger.md` section 5).

## 2. Self-review at every cut (before showing anything)

Verify your own output first: if you would not ship it, do not present it. Review the encoded file, never the code or a browser preview alone.

| Check | How |
|---|---|
| Every cut, plus and minus 1.5 s | Frame strip of about 10 frames each side (catches one-frame empty panels, flashes and captions over the wrong shot), listen at the join, waveform spike check |
| Overlays and captions at each cut | Subtitle hidden behind an overlay, overlay misaligned, caption crossing a cut on the wrong spot (placement rule: the `ice-type` skill, `references/caption-placement-safe-zones.md` section 4) |
| First 2.5 s | Frame by frame: nothing over the mouth or chin, first word survives any opening sound, motion in the first second |
| First frame of every face shot and every inserted recording | No empty viewport from a fractional seek; nothing covers the face |
| Last 2 s and 2 or 3 midpoints | Hero frames at full size and at phone size |
| Duration | `ffprobe` duration against the EDL and the plan |
| Loudness and balance | Measure; do not assume. Targets, balance and stereo versus mono measurement: the `ice-audio` skill, `references/mix-and-master.md` sections 5 and 7 |
| Words | Fresh ASR of the final audio against the approved text; listen to every join and the last syllable |
| Smoothness | Contiguous frames across every transition window, not beat frames: a big jump then near-identical tiles means a front-loaded ease, a halt then a new motion means two moves, a single odd tile means a pop |

Use a cheap draft for cut-point checks and a preview quality render for review (`render.py --draft` and `--preview`). Cap self-review at 3 passes; after that, report the remaining issues to the user instead of looping.

## 3. Honest reporting

- Listening versus signal analysis: the `ice-qa` skill, `references/captions-and-sync.md` section 4. Claims of a pass and how each claim was checked: the `ice-qa` skill, `references/delivery-report.md` section 1.
- Negative controls for validators: the `ice-qa` skill, `references/captions-and-sync.md` section 1. Never loosen a validator to reach green. If a schema differs, adapt the validator explicitly; never skip it silently.
- Automated video-watching critics: the `ice-qa` skill, `references/frame-checks.md` section 3. Persona panel instead of a score for edits: the `ice-qa` skill, `references/critic-loop.md` section 4.
- Never label a draft as final, never invent retention numbers, and never promise virality.
- Record the result in the delivery report `ice/review/NOTE.md` (format owned by the `ice-qa` skill, `references/delivery-report.md`); for an edit, its "Not checked" line also names doubtful words, removed lines and substituted tools.
- For publishable work, brief a separate critic: roles and the roast brief: the `ice-qa` skill, `references/critic-loop.md` sections 1 and 8. In an edit it catches cut-off payoff lines, half-second memes and unreadable text at phone size.

## 4. Note-to-rule loop

When the user gives a note on a draft:
1. Fix the edit.
2. Offer (in the reply that delivers the fix, never as a stop) to write the note into the project as a rule, a check or a script parameter, so the next edit starts from it. Record the note and the resulting rule together in `ice/plan/edit-notes.md`.
3. If the user says a beat is too long, do not restore it to satisfy a generic coverage rule.
4. A small request changes only that part; add one new element at a time and show it.

Examples of notes turned into rules (illustration only, from one creator's history): unreadable white captions on bright pages became a measured contrast check; "every shot has to move" became a ban on still images as B-roll; cheap laser sound effects became a softer sound palette; lips drifting behind the voice became exact-frame cuts plus a per-cut sync check; a cut natural pause became phrase-boundary cutting.

## 5. Working style with the user

- Say in one line what you understood, where you are and what comes next, in the user's language. Never hand the user a list of commands to run.
- Ask only inside the router's stops (`ice-motion-director/SKILL.md` section 5, "Stops"): the single stage 01 message and the one preview approval in auto mode, the review card in step mode, and only when the answer changes the edit. Anything else in auto mode: decide, log it in `ice/DIRECTION.md`, report it in the delivery note. Question count, format and order: the `ice-direction` skill, `references/questions.md` section 2.
- Show one contact sheet or one short preview per review, not a pile of images.
- One render at a time per machine; do not run heavy ASR or encodes in parallel with a render.

## 6. Conflicting source rules (both kept, scoped)

| Topic | Scope A | Scope B |
|---|---|---|
| Silence threshold | Fast reels: pauses over about 0.2 s; fast ads 0.35 s | Long-form 0.55 s with breath; calm speakers 1.0 to 1.2 s; deliberate speakers keep their pauses by default |
| Join sound | Every segment edge: 30 ms fades (field pipeline 35 / 70 ms) | Inserting air: 40 ms equal-power crossfade into room tone |
| Render method | One-pass exact frames for one talking-head source | Per-segment extract plus lossless concat for multi-source and overlays |
| Grade | Default: untouched | Bounded auto grade only after its before/after is approved at 05 |
| Repeat footage | Short form: once per reel | Long-form: never adjacent, at most twice |
| B-roll motion | House short form: every shot moves, slow push-in | Framed B-roll in long-form explainers: untouched |
| Transitions | Footage-led reels: hard cuts by purpose | Graphic-only shorts: follow the ice-motion skill's catalog |
| Caption band | Generated frames: reserve the bottom band | Footage-led: captions are an overlay placed by the speaker's framing |
| Sync after re-transcription | Target: sentence starts within 0.1 s | Field playbooks allow 0.15 s (the `ice-type` skill, `references/caption-timing-and-truth.md` section 3) |
