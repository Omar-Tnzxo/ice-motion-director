# Edit type: shorts and reels (vertical, cut from a speaker's footage)

Sources: nateherkai/herk-edit-kit (MIT, Use Permission: short-form-edit, editing playbook, legacy short-form-video lessons), majedphotos/video-ad-editor (MIT), Omar-Tnzxo/video-production-studio, AbubakrChan/product-launch-motion (MIT), digitalsamba/claude-code-video-toolkit (MIT).

Stage order: 01 03 02 04 06 05 [07 08a] 08b 09 10
Leads with: the footage. 01 ingests and transcribes first; 03 is the paper edit (clean cut on the transcript, three rough openings, open loops); 04 is the beat plan; 06 is the low-resolution animatic and the cut lock.

## Purpose
A 15 to 90 s vertical video (1080x1920 by default) that convinces in the first three seconds and pays off before the call to action. A 16:9 version, when asked, is composed separately.

## Pipeline
1. Probe source and any reference; transcribe. With a reference: contact sheets and a timestamped table (time, spoken idea, visual change, sound cue, viewer question, payoff); borrow editorial mechanisms, never its script, assets or branded copy (deeper analysis in the ice-remake skill).
2. Asset shortlist with exact usable intervals.
3. Silence and retake tools, then a full manual transcript review; save source-time cut reasons; render the clean cut once; derive word timing from the frame-aligned EDL.
4. Beat plan in `ice/plan/storyboard.md`, `ice/plan/open-loops.json`, three rough openings in the hook sheet `ice/plan/hooks.md`, low-res animatic, lock the cut (`short-form-hooks.md`).
5. Plan files and validators: `validate-plan.mjs`, `validate-footage.mjs` (`clock-and-grouping.md`, `ingest-and-ledger.md`).
6. Build, mix, self-review, entertainment review, delivery report `ice/review/NOTE.md`, final.

## Structure options (choose by the material)
- House reel: hook, credibility line, early blurred list, items, callback resolution, call to action (`short-form-hooks.md` section 3).
- Raw reel: no B-roll and no music. Cut retakes, stutters and dead air only, keeping the last clean take; one word on screen at a time, small, lower middle, synced to the exact word; when the speaker points while naming a tool, the tool's verified logo pops where they point with a quiet tap.
- Long to short: screen recording on top, face below, word captions on the seam; the value or claim in the first 3 s, proofs in the long video's order, a complete takeaway at the end. Every number on screen must be explainable from what the short showed; name things before using them; never assemble a call to action the speaker did not say. One topic per short.
- Highlight from an episode: see `podcast.md`.

## Rhythm ranges (house measurements; starting points, not law)
| Measure | Value |
|---|---|
| Speech start and end | Within 0.1 s; ends right after the last word; no intro or outro card; do not force a long-form 4 to 6 s outro |
| Pauses | Under about 0.2 s between phrases; natural beats 0.2 to 0.4 s stay |
| Speech rate | 4.0 to 4.7 words per second of edited real speech after dead air is removed; not a voiceover pace |
| Shots | Average 1.1 to 1.4 s, none over about 2.8 s; first cut at 0.6 to 1.0 s |
| Layout shares | Split 30 to 42%, full B-roll 50 to 55%, punch-in 5 to 15% |
| Presence | Speaker about 45%, never gone over about 3.5 s |
| Event gap | Over 2.2 s fails without a recorded hold reason |
| Length | Platforms treat vertical uploads up to about 3 min as shorts (TikTok 10 min); re-verify |

## Transition policy (scoped)
- Footage-led reel (house style): every layout change is a hard cut; assign any designed transition by editorial purpose, never by rotation.
- Fully graphic motion shorts (no speaker footage) follow the ice-motion skill's cut catalog; the older rule that two consecutive transitions must differ applies there, not to A-roll cuts.

## Camera policy during holds
B-roll shots move (real motion or a slow push-in); speaker shots hold a locked zoom per segment.

## Sound policy
Music bed under the voice, ducked; first 1 to 2 s often quieter with the beat landing on the second line; SFX selection, banned sounds and density: the `ice-audio` skill, `references/sfx.md` sections 1 and 4; levels and loudness: the `ice-audio` skill, `references/mix-and-master.md` section 5. Never fade the last spoken word.

## Text density
Captions carry the words; graphics show the example, relation or evidence. Safe zones and working regions: `vertical-conversion.md` section 4.

## QA thresholds
Validators green with negative controls; frame strips across every cut; first 2.5 s frame by frame; every word whole at every cut; each aspect ratio verified on its own including opening and call to action; entertainment review recorded.
