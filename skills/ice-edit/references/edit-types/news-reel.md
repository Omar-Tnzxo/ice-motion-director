# Edit type: news reel (presenter-led news or explainer reel on one studio take)

Sources: frame measurements of six presenter reels from three broadcast news programme packages (numbers are measured facts at 25 fps, given in frames and seconds), the reel editing tutorials of Muhamd Helal and Ahmed Maher (ideas only, restated), and the 2026-10-29 trials (a long episode cut into a reel). Package skins: the `ice-styles` skill, `references/family-broadcast-news.md` section 2.

Stage order: 01 03 02 04 06 05 [07 08a] 08b 09 10
Leads with: the footage. 01 ingests and transcribes first and, for a long episode, ranks the candidate passages (section 5); 03 is the paper edit (hook, passages in reel order, the pauses that take archive); 04 is the element plan, line by line; 06 is the rough cut with the digital camera and the archive bursts, then the cut lock; 05 sets the package or the user's identity on style frames.

## 1. When this type applies

A presenter (host, anchor, explainer) speaks to camera in one locked studio take that is reframed digitally, with graphics on the spoken words, archive or B-roll in the pauses, and a branded end card; vertical or horizontal. It applies when the user supplies any of:
- raw studio footage of a presenter (one or more takes);
- a long episode, talk show, interview or programme recording to cut a reel from (section 5);
- a news programme's reel as the reference, plus footage to cut in its style (the reference's measured numbers win over the house values here).

Routing: `ice-motion-director/references/classify.md` sends the request to the `ice-edit` route, and `SKILL.md` section 2 (first row) picks this file. The look is the style "Presenter news reel" (`ice-styles/references/family-broadcast-news.md` section 1). A programme package's skin (its colours, fonts, logos, end card, fixed marks) is used as it is only when the stage 01 `identity` slot is "as they are" or "a mix"; otherwise the same role logic carries the user's own palette, fonts and marks (`ice-remake/references/rights-and-modes.md` section 1, "The identity fits the content"). The broadcast package (logo bug, programme name, progress bar, location tag, lower third, glass plates and pills, glow and scanline titles, glow disc, flashes, typed question cards, branded end card) is allowed in this type, each element with its reason row (`ice-remake/references/notes-files.md` section 6, `REASONS.md`; QA exemption: `ice-qa/references/slop-scan.md` section 4, "Broadcast package (news reel)").

Not this type: two or more people in conversation with no graphic layer (`podcast.md`); a fast, hook-driven creator reel (`shorts-reels.md`); a speaker selling a product (`talking-head-ad.md`); a narrated film with no presenter footage (the `ice-explainer` skill).

## 2. Pipeline

1. **01 Ingest and read.** Probe and transcribe every source (word level). A long episode: rank the candidate passages (section 5) before anything else. A reference: run the ice-remake analysis; it measures the pacing events (`ice-remake/references/measuring.md`, "Pacing events"), the fixed marks ("Fixed marks"), the depth, 3D and camera ("Depth, 3D and camera") and the element reasons (`REASONS.md`), not only colours and text. Copy the reference's `maxEventGap` and `eventsPerMinute` into `plan.reference` (`clock-and-grouping.md` section 3, lesson L9). Check the source height against the largest zoom (`ice-motion/references/camera.md`, "Digital camera on one take (news reel)", "Source height"); footage still to be shot gets the checklist of `ingest-and-ledger.md`, "Shooting for a news reel".
2. **03 Paper edit.** The chosen passages in reel order (hook first, payoff last, section 5); the pauses after a sentence that ends on a noun naming filmable reality are marked for archive (section 4). The presenter's talk inside one passage is never cut on screen; a retake or a join inside a take hides in a camera move (re-entry pull-out or blur reframe) or under archive.
3. **02 Approach.** The rhythm targets: the reference's measured values, else section 3.
4. **04 Element plan.** One row per spoken line, at most one element per line (or camera only), each tied to its trigger word with its reason (`broll-and-motion-broll.md` section 1). Tag the roles first (speaker, discussed person, voice, place, object, programme) and take the first match: opening frame (package sting or opening move), new opening question (question card or plate, disc behind the lit presenter, push-in on the question word; a follow-up question gets no disc), a discussed person named (silhouette or sepia portrait, `layers-and-isolation.md` section 3b), a place (map, flag), a number with a unit (fact pin), a quote, the programme name (ghost title), a topic change (wash or flash on the breath), a noun naming filmable reality at a sentence end (archive, section 4), a topic keyword (about 1 word in 4, the package's text device), the call to action, otherwise camera only. Every depth or 3D element of the reference maps to a shot with its build route (`ice-motion/references/depth-and-3d.md`, "Build routes for depth and 3D"; lesson L12); an element with no route is a finding.
5. **06 Rough cut.** Cuts between passages, the digital camera on each take (`camera.md`, "Digital camera on one take (news reel)"), the archive bursts (section 4), the clock locked on one EDL.
6. **05 Look.** Package or user identity on style frames; captions in the preset "News sentence captions" (`ice-type/references/caption-styles.md`) or in "Keyword mode" (`ice-type/references/captions-system.md`) as the reference measures; fixed marks in their slots (`ice-remake/references/rights-and-modes.md`, "Fixed identity marks", checked by `ice-qa/references/identity-tests.md`, "Fixed identity marks"; lesson L10).
7. **07 Build.** Matte the presenter for the whole take and build the matte kit (`layers-and-isolation.md` sections 2 and 3b); room graphics ride the camera, screen graphics do not (`layer: rig` or `layer: screen`, `camera.md` section 8); captions last.
8. **08 Sound.** Voice-led mix: `ice-audio/references/mix-and-master.md`, row "News reel, speech-led"; effects tied to moves: `ice-audio/references/sfx.md`, "Broadcast SFX by move"; music: `ice-audio/references/music-choice-and-licensing.md`, "News reel music". Never fade the last spoken word.
9. **09 Review.** Pacing against the reference (`ice-qa/references/motion-density.md`, "Pacing against the reference", blocking), depth and camera against the reference ("Depth and camera against the reference"), fixed marks, the speaker lit (`layers-and-isolation.md` section 5), clarity read 3 (a news reel is promotional).
10. **10 Deliver.** Captions pass the fresh transcript gate (`ice-qa/references/captions-and-sync.md`, "Fresh transcript gate"; lesson L11, blocking); the delivery note names the flash mode (section 4) and lists each outside item's license status.

## 3. Rhythm

House values from the measured packages, used only when no reference is supplied; with a reference, its own numbers win. Never speed up the voice.

| Measure | Value |
|---|---|
| Speech | Arabic presenter 1.9-2.1 words per voiced second (90-125 wpm); English presenter 2.8-2.9 (about 170 wpm) |
| Presenter on screen | 75-87 percent of the programme time (end card excluded); absent only for archive bursts, single B-roll cutaways and the end card |
| Presenter takes | One continuous take per passage, 5-37 s on screen (10-24 s in the English package), no jump cut inside it |
| Inner events in a take | One visual event every 1.2-3 s (camera move start, graphic in or out, wash, flash); never idle more than about 3 s. Camera numbers (15.8-27.8 moves per minute, scale range, eases, anchor): `ice-motion/references/camera.md`, "Digital camera on one take (news reel)" |
| Event gap | Camera moves and graphics count as events in `plan.events`; a gap over 2.2 s needs a `holdReason` (`scripts/validate-plan.mjs`); with a reference, its longest gap x 1.10 + 1 frame and its density x 0.90 are blocking limits that no hold reason excuses (lesson L9) |
| Median shot (hard cuts) | 4.5 s, mean 6.7 s in the English package; with archive bursts the distribution is bimodal (presenter takes against 2-36 f clips), so measure presenter takes and archive clips apart |
| Single B-roll cutaway | 2-4 s (median 2.2 s), no voice gap needed |
| Montage burst | Archive bursts, section 4; a cold open of 5-7 image beats at 1.5-2 s each (section 5) |
| Text on screen | Keyword 21-49 f (0.84-1.96 s); topic pill 72-74 f (2.88-2.96 s); quote card until 7-9 f (0.28-0.36 s) after the sentence; sentence captions, chunks of median 6 words, 2.23 s |
| Call to action | Starts 4.9-5.6 s before the end card; the background desaturates over 26-36 f (1.04-1.44 s): `broll-and-motion-broll.md` section 3, "CTA desaturation (news reel)" |
| End card | After the last word: hard cut 10-22 f (0.4-0.88 s) later, or a 10 f (0.4 s) dissolve, or a ring mask closing on the presenter; built in 78-88 f (3.12-3.52 s), then a static hold of 2.2-6.5 s, no fade to black; 3.9-11.5 s in all. Skin: `family-broadcast-news.md` section 2 |
| Length | 36-78 s for a promo reel (a reel cut from a long episode: 55-70 s), up to about 3 min for an English explainer reel |

Rhythm row: mean_shot_s -; max_shot_s 37; first_cut_s -; max_event_gap_s 3; holds never.

Where the row's numbers come from: the Presenter takes row (one take of 5-37 s, the end card excluded) and the Inner events row (never idle more than about 3 s); the mean shot stays open because the distribution is bimodal (Median shot row); holds never: a presenter talking with no inner event is dead air even when the hold is declared (`ice-qa/references/motion-density.md` section 3). The row is read by the `ice-qa` skill's `scripts/film_gate.py` on the render's detected cuts when no reference is followed (`references/motion-density.md` section 6.3); a `-` is not gated.

Transitions: hard cuts between passages, each hidden in a camera move; designed transitions only on phrase boundaries (19 of 20 measured within 0-3 frames of a caption change), each with its meaning: white flash into or out of B-roll, red flash on a turn to threat or conflict, a monochrome strobe only at a chapter break (rationed: 3 in a 3 min reel), a red screen flash or a blur-out with an over-exposed entry into archive. Keyframes: `ice-motion/references/cut-catalog.md`, "Broadcast transitions". Logos and the progress bar are never moved by the camera or hit by a flash.

### Coverage floor

Minimums the edit plan and the render must meet; the measures, the reference rule and exemptions: the `ice-qa` skill, `references/motion-density.md` section 6.2. `scripts/validate-plan.mjs` reads this table. With a reference, its measured values win: `plan.reference` replaces the first two rows (its events per minute x 0.90, its longest gap x 1.10 plus one frame; lesson L9), and its measured presenter share sets `broll_share` through an exemption row whose source is the reference.

| Measure | Floor | Where the number comes from |
|---|---|---|
| `element_events_per_min` | 24.5; 20 | Inner events in a take: one visual event every 1.2 to 3 s (Rhythm), so one per 3 s at the slow end (the fail line); the measured talk-show package runs one every 1.76 to 2.45 s (`ice-styles/references/family-broadcast-news.md` section 2.1, Rhythm), so one per 2.45 s is the strict line |
| `longest_bare_talk_s` | 3 s | Inner events in a take: never idle more than about 3 s (Rhythm) |
| `trigger_coverage` | 100 percent | Every content trigger answered within 1.5 s or declined with its reason (`motion-density.md` section 6.2); the element plan's tag list (section 2, step 4) names the kinds |
| `broll_share` | 13 percent; 10 percent | Presenter on screen at most 87 percent of the programme time, end card excluded (Rhythm): archive bursts and cutaways fill the other 13 percent or more; 10 percent of the whole runtime, end card included, is the fail line |

## 4. Archive burst

A run of archive clips with no voice, in the pause after a sentence that ends on a noun naming what the clips show. It says "this is real".

| Measure | Value |
|---|---|
| Trigger | The sentence's last noun names filmable reality (an event, a street, a place, a force); never during a question (0 of 5 measured); always inside a speech pause (4 of 4) |
| Cut-in | 9-11 f (0.36-0.44 s) after the naming noun ends (`clock-and-grouping.md` section 4, row "Archive cut"; plan scene `cut: "archive"`) |
| Shots | 6-12 clips in 3.6-6.9 s: 8 clips at a mean of 0.86 s, or 12 clips accelerating (measured lengths 23, 11, 9, 12, 11, 6, 6, 5, 4, 4, 2, 2 f) |
| Voice | None over the burst; the bed rises under it (`ice-audio/references/mix-and-master.md`, row "News reel, speech-led") |
| Return | The next sentence starts under the archive 18-26 f (0.72-1.04 s) before the presenter is seen again (inside the 0.5-1.5 s carry of `ice-motion/references/seams-and-carry.md` section 2), or the cut back lands 1-4 f after the presenter's first syllable; the cut back starts the re-entry pull-out (`camera.md` section 8) |
| Red-frame treatment | Into the burst: a red screen flash 12 f (2 in, 5 hold, 5 out) starting about 11 f after the naming noun's onset, or a 6 f blur-out with a 2-4 f over-exposed entry. Inside: a red multiply on the first frame of each clip, short red flashes (1 f attack, 4-6 f decay), and in faithful mode a red and normal frame interleave (5-9 f). Keyframes: `cut-catalog.md`, "Broadcast transitions"; clip treatments (black and white, grain and scratches, red wash): `broll-and-motion-broll.md` section 3, "News reel B-roll treatments" |
| Text | None over the burst in the Arabic packages; the English package keeps its captions on a bottom black gradient |

Photosensitivity: the burst and its flashes run in the safe mode by default and in the measured faithful mode only when the user asks for it in their own words; the rule, the limit and the safe replacements live in `ice-audio/references/cue-map-and-beat-sync.md` section 6. No strobe in the first 3 s. The delivery note names the mode used.

Each clip gets its footage ledger row (`ingest-and-ledger.md` section 4) with its source, owner and license status; the burst uses real, dated footage of the named thing (`ice-assets/references/sourcing-and-licenses.md` section 0), never a generic stand-in.

## 5. From a long episode to a reel

When a reference reel exists, its measured hook and structure win over this section (`ice-remake/references/measuring.md`, "Reel cut from a long episode"). Otherwise:

1. **Read the whole episode.** A reading agent that is not the cutter reads the full word-level transcript end to end and writes `ice/plan/candidates.md`: 4 to 6 candidates, each with its passages (speaker, in point at the first word's start, out point at the next word's start, length), the cleaned text, the hook line, the payoff line, and every filmable noun with its time.
2. **Score in this order.** Each criterion 0 to 10, total out of 50; a tie goes to the higher score on the earlier criterion.
   - C1 hook: the sharpest line a stranger understands in under 4 s (a contrast, a number with stakes, a question).
   - C2 self-contained with a payoff: the reel makes sense without the episode, and its payoff answers the hook inside the reel.
   - C3 filmable: every named thing exists as real, dated footage, or as a graphic built from the truth sheet.
   - C4 fluency: clean speech, few false starts, joins possible at pauses.
   - C5 balance and accuracy: every claim stays with the person who made it, and no cut or order change alters what a passage means.
   A candidate under 5 on C2 or C5 is dropped whatever its total. The trial winner scored 42 of 50. A critic reviews the ranking; the choice, its score and the runner-up go into `ice/DIRECTION.md`.
3. **Passages.** 1 to 3 passages from one or two speakers. At most one passage leaves source order: the hook, lifted from later in the episode and played first (measured in the trial: a 3.9 s hook, then two passages of 37 s and 29 s in source order). The measured programme reels are built on one presenter take of 28-37 s of talk plus archive.
4. **Payoff.** The last spoken line before the sign-off, inside the last 15 percent of the spoken time, followed only by a held beat of about 0.4 s, the call to action and the end card.
5. **Hook length.** The hook sentence runs 3.9-7.1 s of speech; the first full idea is complete by 5.0-10.4 s; the first cut (usually archive) comes after the hook, at 7.4-10.9 s.
6. **The first seconds.** Frame 0 is already in motion (an opening move from about 1.39x, a package sting at frame 1, or a red frame); the voice starts within 4 f (0.16 s), or by 1.0 s after a cold-open silhouette lit 2-3 f before the first word; the first spoken noun is on screen as it is said (0-6 f after its onset); the programme is named by about 3 s when the package names it. The hook sentence may carry camera only. No written hook ahead of the speech (this replaces the written hook of `short-form-hooks.md` section 6 for this type): words on screen follow the spoken words at the package's or the reference's measured lead, a few frames either side of the word onset, and a muted viewer gets the hook from the picture and the spoken words shown as said.
7. **Cold open (English package).** A 2-frame cover, the presenter as a silhouette, a red circle drop at 4-12 f (0.17-0.47 s), light on at about 0.87 s, speech at 1.0 s, the question as a headline by 2.93 s, then 5 image beats of the people discussed (1.0-2.6 s each) to about 14 s, and the promise line at about 17 s. The presenter is never dark again after the first word.
8. **Length.** As long as the passages need to reach the payoff: 55-70 s measured (references 36-78 s); a cutdown that loses the payoff is not offered.
9. **The episode's own camera angles.** A reel cut from a multi-camera episode uses the episode's own angles (wides, over-the-shoulder, two-shots, the second speaker's close), not only the close single: about the share the measured reference reels use (counted on the reference's contact sheet), and without a reference at least one wide or over-the-shoulder shot in every 20 s of speech. Each angle change sits on a sentence or a turn, never inside a word (lesson L37).
10. **Whose claim it is.** A claim shown on screen keeps its owner: a title, card or plate that states a claim names its speaker or source in the same card ("a part of French society says:", the guest's name), never as a bare statement beside a channel mark (lesson L37).
11. **Archive keeps its date.** Archive older than the current year carries its year (or full date) on screen while it plays, so old footage never passes as current; the footage ledger row names the date (lesson L37).

## 6. Rules this type replaces

Each rule below stays in force everywhere else; the scope line in its file points here.

| Rule | Where | In a news reel |
|---|---|---|
| Average shot 1.1-1.4 s, none over 2.8 s, first cut at 0.6-1.0 s | `house-style-numbers.md` section 2, `shorts-reels.md` rhythm ranges | Section 3: one take per passage, inner events every 1.2-3 s |
| Speaker about 45 percent, never gone over about 3.5 s; layout shares | `house-style-numbers.md` section 3, `shorts-reels.md` | Presenter 75-87 percent; absences only for archive bursts (3.6-6.9 s), cutaways (2-4 s) and the end card |
| Locked zoom per segment, ceiling 1.20x, calm 6 changes per 30 s, zoom out only as a return | `house-style-numbers.md` section 4, `talking-head-ad.md`, `shorts-reels.md` camera policy | `ice-motion/references/camera.md`, "Digital camera on one take (news reel)"; ceiling = source height / output height |
| Every layout change a hard cut; crossfades banned in reels | `shorts-reels.md` transition policy, `ice-motion/references/transition-policy.md` | Broadcast transitions on phrase boundaries (section 3); the 10 f dissolve to the end card and short cold-open dissolves when measured |
| No intro or outro card; the file ends on the last word | `shorts-reels.md` rhythm ranges | A branded end card after the last word, held static (section 3) |
| Event gap over 2.2 s fails without a hold reason | `clock-and-grouping.md` section 3, `scripts/validate-plan.mjs` | Unchanged without a reference; with one, the reference's limits (lesson L9) |
| Scene cut within -0.15 to +0.2 s of its anchor | `clock-and-grouping.md` section 4 | Archive cut 0.36 s after the naming noun (section 4) |
| Text behind the subject once or twice per video | `layers-and-isolation.md` section 3 | The measured count, logged (`layers-and-isolation.md` section 3b) |
| Spotlight ramp 0.2-0.3 s | `broll-and-motion-broll.md` section 3 | CTA desaturation 26-36 f (1.04-1.44 s) |
| Footage of people untouched | `ingest-and-ledger.md` section 5 | Plate reactions behind the matte and measured B-roll treatments; the speaker stays at source exposure |
| Written hook readable from frame 1 on every reel cut from an episode | `short-form-hooks.md` section 6 | No written hook ahead of the speech (section 5) |
| Split: B-roll on top, speaker below | `vertical-conversion.md` section 3 | Presenter on top, evidence below a feathered seam (`vertical-conversion.md` section 3, "Split (news reel)") |

Unchanged in this type: every element on its trigger with its reason (`broll-and-motion-broll.md` section 1), the speaker lit and unmarked (`layers-and-isolation.md` section 5), the truth rules (spoken words on screen verbatim, numbers from the truth sheet), and the ice-audio skill's ladder for music and SFX.
