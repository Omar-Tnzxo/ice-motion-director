# Critic loop: independent review, fixes with evidence, when to stop

Gates catch broken films; critics catch bad ones. A film that had only an auditor's loop or only a director's loop is not finished. Sources: motion-video-kit gauntlet (MIT), reelmimic (MIT), product-launch-motion (MIT), huashu-art-motion (MIT), herk-edit-kit (MIT), mg-styles-15 (MIT), video-use, claude-motion-design (MIT), hyperframes (Apache), founder skills; IDEAS_ONLY sources (imMamdouhaboammar, hypit, PolyForm explainer sources) rewritten.

## Contents
1. Roles
2. The review packet
3. Round types and what each critic checks
4. Severity and scores (scoped)
5. Fixes need before and after evidence
6. Round limits and stop rules
7. Taking notes from people
8. Running reviewers as agents

## 1. Roles

| Role | Does | Never does |
|---|---|---|
| Builder | Builds, self-checks with the gates, fixes, writes the fix ledger | Grades its own film, picks the creative baseline, writes "verified" |
| Critic (one per review) | A fresh agent or session with no build history: pulls its own frames from the artifact, measures, writes a report | Edits files (read-only: read, measure, look, write its report), receives the builder's reasoning or list of "what I fixed" |
| Verifier (next round) | A new critic that checks each prior item and hunts regressions | Reuses the previous critic's context |
| Stage critic (a spine stage the workflow's crew row gives a critic) | A fresh read-only agent that judges one stage artifact (brief, script, storyboard, look, sound plan) against the stage row's "Done when" column, the truth sheet and the compliance note, with the "Stage critic" prompt of `critic-prompts.md`; one dispatch may cover several stages | Judges a stage with no critic in the crew row (those pass on the approver's check alone), or rewrites the artifact |
| Cold viewer (clarity gate) | A fresh read-only agent that gets only what an audience would see (no brief, concept, script or reasons) and says what happens, what is sold, what the product does, the one idea and every moment it did not understand: `clarity-gate.md`, with the "Cold-viewer critic" prompt of `critic-prompts.md`. A new viewer for every read | Receives the brief, the takeaway or any earlier report; is batched with another role; matches its own answers against the takeaway (the approver does that) |
| Approver (auto mode) | Passes each stage before it is set `approved`: the ice-direction skill's `references/roles.md` section 5, "Approving a stage artifact" | Approves its own work, or passes a truth, rights, compliance or Arabic-correctness item that is not met |
| User or owner | Decides taste; approves only at the stops of the router's stops table (`ice-motion-director/SKILL.md` section 5, "Stops") (step mode: every review card) | (their newest note outranks everything) |

Rules:
- Builder is never the judge. Spawn a fresh critic for every review; no self-review, no forked reviewer, no follow-up questions to the same reviewer (motion-video-kit, PolyForm ideas, huashu).
- Builders keep their own context so they remember the details when fixing; reviewers are always fresh: they built nothing and have nothing to defend (reelmimic).
- Self-scores inflate: in one batch self-scores averaged about 10 points (max 17) above independent review. Put the independent score next to the self-score; the lower wins; any veto item means the status cannot be "done" (huashu).
- Delegated agents may draft; they never pick the creative baseline or certify quality. Inspect their files and renders yourself and spot-check their reports, but gather full evidence before concluding an agent was wrong (founder skills, PolyForm ideas).
- Catch defects where they are made: characters before shots, each shot as soon as it is built, the assembled film last (reelmimic).
- Long films (over about 8 shots or chapters) get at least two reviewers, each with 7 shots or fewer, plus one cross-act consistency pass (huashu, PolyForm ideas).

## 2. The review packet

Give the critic only:
- the artifact itself (MP4 path or the frames it will extract itself), never screenshots you chose;
- the brief, `ice/DIRECTION.md` and the user's own words, verbatim;
- reference files or descriptions (and, for remakes, the reference's peak ranges);
- the previous critic's report (verification rounds only);
- the gate outputs (`look.py`, `film_gate.py`, lint, seam gate, loudness) as numbers;
- for explainers: storyboard, contact sheets, the beat-landing table, the SFX audibility report.

Never: your reasoning, your list of fixes, your opinion of the film (motion-video-kit, PolyForm ideas). Ready-made prompts with slots: `critic-prompts.md`.

The cold viewer of the clarity gate is the one exception: its packet holds none of the above, only the frames or the film and a format line (`clarity-gate.md` section 3).

## 3. Round types

| Round | Artifact | Critic focus |
|---|---|---|
| Cold viewer | The storyboard strip and style frames (end of 04 and 05), the animatic (06), the draft (09) | The five plain answers from the viewer's packet alone, then the approver's match against the takeaway; PASS or FAIL, never averaged with scores (`clarity-gate.md`) |
| Stage | One stage artifact before the film exists (brief, script, look, sound plan) | Each "Done when" item met or not, claims against the truth sheet, restricted claims and required disclaimers, fit to the brief; PASS or REVISE (`critic-prompts.md`, "Stage critic") |
| Storyboard | Table plus rough or settled frames | Chronology against the real service, provable claims, distinct composition and job per beat, filler beats, CTA on mute |
| Asset | Stills and clips, character sheets | Geometry fidelity, believable joins, exposure, artifacts, fit to brief; characters against the design at full resolution |
| Component | An isolated render (stills plus a 3-4 s motion proof) | Material realism, camera, readability, collisions, pops, what information it adds |
| Full film | Whole render | Holds, empty space, transitions, text collisions, pacing, business clarity, audio |
| Verification | New render plus previous report | FIXED / PARTLY / STILL PRESENT per item, new regressions, SHIP or ONE MORE PASS |
| Entertainment | The animatic and the final, watched uninterrupted | Attention-drop timestamps, predictable sequences, unresolved promises, reading overload; separate from technical QA; never a fabricated retention score |

A full treatment for flagship films: several specialised critics (motion, image, sound, story, muted readability, UI fidelity and translations, brand and copy), each defect with frame numbers, severity and a measurable fix; a new version replaces the old only if side-by-side judges prefer it (claude-motion-design).

Four passes inside one critic review: full speed; sound off; audio only (eyes closed); frame and boundary review. Watch for one class of problem per pass (sync, motion, read: "what do you remember?"). Write the defect list before opening an editor (founder skills, product-launch-motion).

Mandatory visual pass list, attested item by item: full watch with audio, muted watch, the dense first second, every transition, every machine warning, the CTA and its hold, a contact sheet at phone scale, comparison against the thesis and the contract (imMamdouhaboammar, rewritten).

Creative-director test (before SHIP): a specific author is visible, not interchangeable across ten brands, one thesis not a bag of tricks, no template moments, no tech-flexing, an ending cleaner than the middle, one removable element named per crowded frame (imMamdouhaboammar, rewritten).

## 4. Severity and scores (scoped)

Severity, used by every critic:

| Level | Meaning | Examples |
|---|---|---|
| Blocker (P0) | A viewer notices at normal speed and size (phone or full screen), or understanding is harmed | A major confusion in a cold-viewer report (`clarity-gate.md` section 5), wrong facts or text, unreadable copy, A/V desync, collisions, broken limbs or floating parts, flicker or skipped frames, a subject too small, large empty or broken areas, failed primary transition, invalid asset |
| High (P1) | Breaks a hard rule | Beat off its word by more than 0.3 s, missing SFX, monotone layout, layout check failures |
| Polish (P2) | Visible only zoomed in several times, only on sheet layout, or on poses this film does not use | Handed on, never holds the line |

A review passes when nothing it lists is a blocker (reelmimic, PolyForm ideas). Deadline triage order: truthful comprehension, semantic transformations, readable type and focus, handoffs and physics, music and SFX, polish (founder skills).

Scores, scoped by film type:

| Type | Scale | Ship bar | Source |
|---|---|---|---|
| Reference remake (ice-remake) | 1-5 per category with the reference as the ruler (5 better than the reference, 4 same level, 3 visibly cheaper, 2 a notch below, 1 broken) | Every shot and category >= 4; any category < 4, any shot < 4 or a lost climax duel needs a must-fix; pass only with no must-fix | reelmimic |
| Style-led films (art film, a named motion style) | 1-10 per dimension (style fidelity, concept wow, motion craft, design and typography, finish and texture, sound and sync, technical); 5 student, 6 template level, 7 solid professional, 8 high-end agency, 9 award shortlist; most first renders deserve 5-7 | Aim for 9; fix the lowest first; do not regress strengths | mg-styles-15 |
| Style demos with a signature checklist | Score sheet out of 100 (signature 35, medium credibility 20, composition and narrative 15, figure and object form 15, motion 10, technical 5); vetoes: signature under 25, childish figures | 80, at most two rounds, else it stays a research recipe | huashu |
| Short launch films and loops | 1-10 per shot on readability, rhythm, shape continuity, branding, loop | Fix only shots at 7 or less; do not touch shots at 9+ | claude-motion-design |
| Edits and talking-head work | No total score: blocker list plus a persona panel ("would this viewer finish? where did they stop?") | No blockers | herk-edit-kit |

A requested "10/10" is an aspiration, not a score a validator can award. Judge by specific problems, never by chasing a total (herk-edit-kit, huashu). Do not give a whole row the same score to get it over with (reelmimic).

## 5. Fixes need before and after evidence

- Before a fix, state the problem, its consequence and the intended improvement. After it, rewatch the interval and the whole film; if it did not improve, revisit the explanation (hypit idea).
- Every "fixed" item goes into `ice/review/fixes.json` with full-resolution before and after crops of the same moment and region. Motion fixes need 12 fps consecutive frames as proof, not a single still. The next reviewer checks these first against the after images (not the description); claimed-but-not-fixed items return unchanged, marked "listed last round, still not fixed" (reelmimic).
- A defect is resolved only by a later rendered artifact, never by a source change (imMamdouhaboammar, rewritten).
- Fixes often create new defects (a covered element losing its z-order, a moved object now crossing a headline); new issues introduced by a change are must-fix (motion-video-kit, reelmimic).
- Fix the largest meaningful gap first; do not average a weak opening away with strengths elsewhere (motion-video-kit).
- One change per diagnostic render; only confirmed causes go into code or docs; hypotheses are labelled as such (imMamdouhaboammar, rewritten).
- Fix at the owner: a goal change goes back to the brief, a story or design change to direction, an implementation defect to the build. If the result is wrong because the design was wrong, revise the design (hypit idea). Script-level problems go back to the script; three rounds on the same problem with two failed fixes means return to the assets or the engine (huashu).
- Review record per finding: timecode, observed problem, root cause, change, re-verification; regressions kept separate from new findings (huashu). A critique ledger row: time, severity, failure, root cause, repair, recheck, owner, preserve constraint (founder skills).

## 6. Round limits and stop rules

One rule, for every film:

1. **Rounds come from the crew row.** The number of film review rounds is the "Film review rounds" or "Critic rounds" column of the workflow's crew row (the ice-film skill's `SKILL.md` section 7, the ice-explainer skill's section 8; remakes: 3 rounds per character and per shot, plus 1 when one blocker remains). Each round is one defect scan, one batch of fixes, one fresh verification critic (imMamdouhaboammar idea, reelmimic, video-use).
2. **One extension.** At the limit, keep going only while the list is short (2 items or fewer) and still shrinking, at most 2 extra rounds; a list that stops shrinking stops the loop (a real run went 8, 3, 2, 1 and stopped with its most visible defect unfixed) (reelmimic).
3. **What may ship at the end.** Only polish (P2) items may remain. A blocker (P0), a hard release gate, a richness measure under the floor, or a cold-viewer clarity FAIL (`clarity-gate.md`) never ships: it goes back to the owning stage (fix at the owner, section 5), and the rounds it takes are reported. High (P1) items left after the extension are listed in the delivery report's "Next fixes" with timecodes; in step mode they are on the 09 review card. No pause for the user in auto mode (the router's stops table (`ice-motion-director/SKILL.md` section 5, "Stops")) (motion-video-kit, reelmimic).
4. **Builder self-passes** before a critic sees the film: two or three honest passes, the three highest-impact fails fixed, re-rendered, re-checked once (motionmaxxing).
5. **Deadline.** Only when the user named a deadline: builders hard-stop and revert half-done work, integrate, render at delivery resolution only, one full-film critic, its top fixes in parallel, one verification critic, and every component whose last round was not re-verified is listed (motion-video-kit).

Moving "what the final critic keeps rejecting" forward into the build specs is the most effective speed-up (reelmimic). SHIP is not the end: plan for the client's own pass, deliver versions in a named folder, change by timestamp (motion-video-kit).

Authority order when signals disagree: the reviewer's or owner's latest explicit correction, then the last preferred version, then preserved uncommented shots, then a full-speed A/B, then automated checks. Technical green never cancels a reviewer veto. Silence on a shot means keep it; a replacement needs a measured benefit ("faster to build" is not one); if the reviewer prefers the previous version, restore it and apply only the requested deltas (founder skills).

## 7. Taking notes from people

A director's note is a symptom report, not a specification. Translate it into a mechanism before touching anything:

| Note | Literal reading (wrong) | Mechanism (right) |
|---|---|---|
| "Make it 3D" | Add a rotation | A camera rig and depth on the elements the story touches |
| "I don't like the ripple" | Delete one ripple element | Find everything that reads as a ripple |
| "It looks basic" | Add effects | Rebuild what the shot is, not how it is decorated |
| "Add a typing sound" | Raise the cue | Measure: the cue may exist and be arithmetically inaudible |
| "Speed it up" | Compress everything | Tighten clauses; keep or lengthen tail holds |
| "The cursor is bad" | Redraw it | It is probably invisible: size, stroke and shadow before shape |

Ask "at which second?"; reproduce it on the frame before fixing; reply in their words. When a note is wrong, the answer is a measurement, not an argument (product-launch-motion). A disliked effect is replaced with a clean one, not just deleted (motion-video-kit). When the owner flags one issue, sweep the whole film (all cuts, all languages, all ratios) for the same class and report the sweep (founder skills). A note-giving format for people: one thing per note, how it feels rather than how to fix it, pointed at a moment (charlie947). After each delivery, record the note and the rule it became, so the next film starts from it ("fix it, then add it to the skill") (herk-edit-kit, founder skills).

## 8. Running reviewers as agents

- Reviewers write their report to disk incrementally, one line per shot with an explicit completion line; no growth for 10 minutes means stop and re-dispatch; 3 failed dispatches means deliver marked "not independently reviewed" (PolyForm ideas, rewritten).
- One heavy task per agent (agents that already read many images fail about 30% of the time on a second heavy task); dispatch in waves of about 4; check the disk before relaunching an agent that died (PolyForm ideas, rewritten).
- Reviewers reuse the builder's images when they are newer than the shot file; re-capture only stale times or zooms, all in one call (screenshots are the most expensive step) (reelmimic).
- Ask critics for numeric readings; measurements beat "looks OK" and become evidence for the delivery report (PolyForm ideas). Let a critic verify a proposed fix before it is dispatched.
- Critics judge pixels and measurements, not intentions; "be blunt; no padding"; "report only problems you actually observe; if none, say so and do not invent a revision" (motion-video-kit, charlie947). Brief a critic to roast, not to praise: a verdict, ranked problems with timecodes and evidence, the fixes to do first (video-use).
