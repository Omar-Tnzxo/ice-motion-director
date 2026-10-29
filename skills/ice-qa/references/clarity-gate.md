# Cold-viewer clarity gate

Craft gates prove a film is well made; this gate proves a stranger understands it. A fresh, read-only viewer who knows nothing about the plan looks only at what an audience would see and says, in plain words, what happens, what is being sold, what the product does and the one idea. The film is built and delivered only when that matches what the film was made to say. Founder decision, 2026-10-21 (`AGENTS.md`, product rules). This file is the one home of the gate and of the grounding rule (section 6); every other file points here and never restates them.

## Contents

1. Where it runs
2. The takeaway (the target, written at 02)
3. The viewer's packet
4. The viewer's report
5. The match and the pass rule
6. The grounding rule
7. Size of the job
8. On a fail
9. Hosts without sub-agents, and step mode

## 1. Where it runs

| Point | Spine stage | What the viewer gets | A fail blocks |
|---|---|---|---|
| Target | 02 concept | Nothing yet. The director writes the takeaway (section 2); the concept critic checks it and the grounding of every concept (section 6) | The 02 approval |
| Read 1 | End of 04 and 05: one read, run when the later of the two is drawn | The storyboard strip and the style frames | 06 |
| Read 2 | 06 animatic | The animatic, or the timed stills board | 07 build |
| Read 3 | 09 review, before the first full-film critic round | The draft with its sound | 10 delivery |

Routes:

| Route | Reads |
|---|---|
| `ice-film`, `ice-explainer`, `ice-remake` | Target, reads 1, 2 and 3. A reference's look never excuses a film the viewer cannot follow |
| `ice-edit` | Read 3 only, for edit types that sell or promote (a talking-head ad, shorts or reels made to promote, a showreel); the footage already fixes the story. Its 02 approach writes the takeaway that read 3 is matched against |
| `ice-ideas` | Target at 02; a micro read (section 7) at 09 only when 04 or 05 drew frames. The takeaway travels in the hand-off |
| `ice-lottie` | None (product UI motion, not a film for an audience) |

A film reworked after any read (a user note, a changed concept, a new look or world) repeats every read from the first one whose material changed. Each read is logged in the `Gates:` line of the `ice/DIRECTION.md` summary as `clarity read-<n> <PASS or FAIL> r<round>` (`ice-direction/references/decision-process.md` section 7).

## 2. The takeaway (the target, written at 02)

The director writes this block under the chosen concept in `ice/plan/concepts.md` and quotes it in the concept's D-entry. It is plain speech, the way a viewer would retell the film to a friend: no slogan, no brand jargon, no metaphor words.

```markdown
## Viewer takeaway
Sells: <the brand, product or subject, named as the film shows it>
Offer's job: <what the product or brand does for people, as "<name> lets you <action> <object>" or "<name> <does what> for <whom>"; "none" only when no brand, product or offer is in the film>
One-line idea: <the one thing the viewer should get, one sentence, without "and">
Literal anchors: <for each symbolic or abstract device: the device -> the literal thing it stands for -> the beat where that literal thing is first seen; or "no symbolic device">
```

Rules:
- `Offer's job` comes from the product truth of the business brief (`ice/BRIEF.md`) and the truth sheet, never from the concept: the concept serves the offer, it does not redefine it.
- A brand whose offer is an app, a SaaS or a product always has an `Offer's job`, whatever the film type (the product job rule: `ice-film/references/film-setup.md` section 1).
- The takeaway is locked with the concept. Changing it is a new D-entry that supersedes the concept entry, and every read runs again.
- A user-supplied concept gets its takeaway written from the user's own words; the user's fields stay untouched.

## 3. The viewer's packet

The director copies the packet into its own folder, `ice/review/clarity/packet-<point>/` (point: `read-1`, `read-2`, `read-3`), and the viewer opens only that folder.

| Read | Files in the packet |
|---|---|
| 1 | `strip.png`: the rough board's frames in film order, each labelled only with its start time in seconds; then the style frames as `frame-01.png`, `frame-02.png` and so on, in film order. Beat names, notes, arrows, captions under frames and every planning label are removed first; words that are part of the picture (on-screen copy, interface text, signs) stay |
| 2 | The animatic video when one exists; otherwise the stills board rendered as a video at its cue times; otherwise the stills board image with each still's start time only |
| 3 | The latest draft video with its sound, renamed `film.mp4` |

Reads 1 and 3 of a film made for a brand also carry the brand test (`identity-tests.md`, its one home): a `masked/` folder inside the packet with the masked copies of section 4 of that file (at read 1 the strip frames and the style frames; at read 3 six frames of the draft at random times). The viewer opens `masked/` first and answers it before anything else (section 4).

Every packet also has `format.txt`, one line: length in seconds, aspect ratio, platform, and whether that platform plays muted first (from the brief's platform slot).

Never in the packet or in the dispatch: the brief, the concept, the takeaway, the script, the storyboard text, `ice/DIRECTION.md`, research notes, the truth sheet, earlier viewer reports, critic reports, the builder's notes, the user's words, or a file name that tells the intent. A viewer that opened any other project file has not read blind: its report is void and a new viewer reads again.

Every read uses a new viewer. A viewer that saw an earlier version has learned it.

## 4. The viewer's report

The viewer reads as an ordinary person at normal speed. First impression first: it goes through the packet once, in order, at the film's own pace (for a video, a contact sheet every 0.5 s read once in order), and writes answers 1 to 4 before any close study. Close study may add moments to answer 5; it never changes answers 1 to 4.

Speech: when the film has speech, the viewer makes its own transcript of the packet's audio with a local speech-to-text tool; that is what a viewer hears. Music and effects cannot be heard by an agent: the viewer names the moments that seem to rely on sound.

Report: `ice/review/clarity/<point>-r<round>.md`, plain words, under 300 words, with the prompt of `critic-prompts.md`, "Cold-viewer critic":

0. **Whose film is this** (reads 1 and 3 of a brand film only, from `masked/` before the rest of the packet): per masked file, the brand the viewer thinks it is for, or "I can't tell", and what told it. The approver judges it by `identity-tests.md` section 5, apart from the match below; a brand test FAIL blocks the same stage as a clarity FAIL.
1. **What happens**: the story in two to four sentences, in order.
2. **What it is selling**: the brand, product or subject, or "I can't tell".
3. **What the product does**: what it does for people, one sentence, or "I can't tell".
4. **The one idea or feeling**: one sentence.
5. **What I did not understand**: every such moment, with its time in seconds or its frame number, what was seen, and what the viewer thought it was.

Then one line, `seen vs measured`: what was looked at, what was measured, what could not be checked.

## 5. The match and the pass rule

The approver (`ice-direction/references/roles.md` section 5) matches the report against the takeaway after the report is written. The viewer never sees the takeaway; the builder never matches. The match goes into the stage approver report under `Clarity match`, one row per field:

| Field | Viewer answer | MATCH when |
|---|---|---|
| Sells | 2 | It names the same brand, product or subject |
| Offer's job | 3 | It names the same action for the same people or object, in any words. Naming only the category, only the brand, only a feeling, or a different job is a MISS. Skipped only when the takeaway says "none" |
| One-line idea | 4 | It says the same thing in other words. A vaguer, partial or different idea is a MISS |
| What happens | 1 | Nothing in it misreads the turn (the moment the change happens) or the hero moment |
| Confusions | 5 | None of them is major |

A confusion is **major** when it is about the brand, the offer, the idea, the turn or the hero moment; when a symbol was read as something other than its literal anchor; when the viewer did not see the cause of a product interaction; when, in a news, explainer or talk-show film, the viewer took the speaker or guest for one of the people being talked about (a dimmed, silhouetted or circled speaker: the `ice-edit` skill, `references/layers-and-isolation.md`, "The speaker stays lit"); or when the viewer was still unsure at the end. Every other confusion is minor, and every minor one still goes on the fix list.

On platforms that play muted first, answers 2, 3 and 4 must come from the picture alone: on-screen words and burned-in captions count, speech and sound do not (a moment the viewer marked as relying on sound does not count toward a MATCH).

**PASS**: MATCH on Sells, Offer's job (unless "none") and One-line idea; What happens without a misread; no major confusion. Anything else is a **FAIL**. There is no partial pass, no pass with notes, and no averaging against other gates or scores.

## 6. The grounding rule

One rule for every concept, board, frame and build. The concept critic checks it at 02, the storyboard critic at 04, the cold viewer tests it at every read.

1. **Literal before abstract.** Every abstract or symbolic device (a metaphor, a visual pun, a diagram or a world that stands for a real thing) is grounded in something literal the viewer recognises, shown before the device or with it: in the same frame, or in the shot just before. A device whose literal side never appears on screen is cut or replaced. Moving into a symbolic world is allowed only after the literal one is established, and a visible link back to it stays.
2. **Every sound, action and claim has a visible source.** A sound comes from a thing the viewer sees making it; a change comes from a seen cause (a hand, a cursor, an object, the product itself); a claim comes with seen proof or the truth sheet's on-screen source. Words on an empty ground standing in for a thing that is not shown fail.
3. **Product interactions happen as they really happen.** Typing, scrolling, tapping, dragging, searching, loading and results follow the real product's behaviour and order. Text in an input appears as it is typed, at the rates of `ice-type/references/kinetic-type.md` section 7 (Arabic input by word or by mask, as `ice-arabic/references/letterforms-in-motion.md` allows), never popping in whole; a list scrolls; a result arrives after its action, never before it.
4. **The offer's real job is seen.** When the takeaway has an `Offer's job`, at least one full beat shows it: the real product in use, the cause and then the effect, held long enough to read (`ice-type/references/reading-time.md`).

## 7. Size of the job

| Size | Reads | Report | Pass |
|---|---|---|---|
| Micro: 6 s or less, or one asset (a logo sting, a quote card, one stat, a caption pass) | Read 3 on the draft only; read 1 on the style frames as well when the film shows a product or makes a claim | Answers 1, 2 and 5 | Answer 2 names the brand or subject, and no major confusion. One revision round, then section 8 step 3 |
| Standard: 7 to 60 s | Target, reads 1, 2 and 3 | All five answers | Section 5 |
| Long or campaign: over 60 s, chapters, several films | Target, reads 1, 2 and 3; read 3 once per master | All five answers; answer 5 grouped by chapter | Section 5 |

Language and aspect versions of a film that passed inherit its pass. A cutdown with its own hook (a 15 s or 6 s cut) gets the micro read at 10 before it ships. These reads are never batched with another role and are never cut to fit a crew budget (`ice-film/references/film-setup.md` section 2).

## 8. On a fail

1. **The film does not move on.** A fail at read 1 blocks 06, at read 2 it blocks 07, at read 3 it blocks 10. This holds in auto mode with zero stops, and the approver never passes it after two returns (it sits with truth and rights in the never-passed list of `ice-direction/references/roles.md` section 5).
2. **Fix at the owner, then read again with a new viewer.** Revise the owning plan file first, redraw or rebuild what changed, then a fresh viewer reads the new packet:

| The viewer missed | Fix at |
|---|---|
| Sells | 05 (the logo, the product and the brand's real material on screen) and 04 (when and how long they show) |
| Offer's job | 04 (a full product beat: the real product, the cause, then the effect); 02 when the concept has no such beat |
| One-line idea | 04 (the turn shown, not implied); 03 (one line of copy that names the cause and the effect); 02 when the telling itself hides it |
| A symbol or a world | Section 6 rule 1: the literal anchor shown first; 05 when the whole look is abstract |
| A product interaction | 04 and 07: section 6 rule 3 |

3. **Two failed rounds at the same point: change the telling, not the polish.** Go back to 02 with a superseding D-entry: keep the concept and make its telling literal (the offer's job shown in the everyday moment it serves), or take the concept critic's next-ranked concept. For an app brand, the brand film versus app ad tie-breaker applies (`ice-film/references/film-setup.md` section 1). Then run every read again from read 1.
4. **Still failing after that:** nothing is built or delivered. The run is held before 07 or 10 with the viewer reports and one plain sentence for the user on what a viewer did not get, the same way a run is held for a missing required tool (`ice-motion-director/SKILL.md` section 3, item 2). The hold adds no question.
5. **Log** every read in the `Gates:` line (section 1); a fail that changes a decision gets its own D-entry; the delivery report lists every read with its verdict and the viewer's one-line idea (`delivery-report.md`, Gates table).

## 9. Hosts without sub-agents, and step mode

- **No sub-agents** (or the host declined them): a blind read is impossible, because the main agent knows the plan. Run it as a separate pass that opens only the packet, and list as a major confusion every frame whose meaning you know only from the plan. Mark the read `not independent` in its report, its D-entry and the delivery note. It still has to pass.
- **Step mode**: the five answers and the match go under "Critic's notes" on the review card of the stage the read closes (05, or 04 when it runs last; 06; 09). A FAIL is shown first, in plain words. The user may accept a failed read in their own words; that acceptance is logged with their quote and named in the delivery note. Without it, the stage stays in review.

Sources: Ice founder decision, 2026-10-21 (a first gallery run passed every craft gate while an ordinary viewer did not understand it); the fresh read-only critic and the "restate the message from the frames" test of echris6/motion-video-kit (MIT) and edenfunf/reelmimic (MIT); the cursor-as-cause rule of AbubakrChan/product-launch-motion (MIT); the concrete-over-abstract metaphor pattern of Tejashmakwana/motionmaxxing (Apache-2.0), rewritten.
