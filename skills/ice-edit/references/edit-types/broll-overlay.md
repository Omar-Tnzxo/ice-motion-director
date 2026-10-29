# Edit type: B-roll overlay (inserts and motion clips over existing footage)

Sources: Barty-Bart/motion-graphics (MIT: motion-broll), nateherkai/herk-edit-kit (MIT, Use Permission), AbubakrChan/product-launch-motion (MIT), Omar-Tnzxo/video-production-studio, heygen-com/hyperframes (Apache-2.0: talking-head recut, lower thirds), alchaincyf/huashu-art-motion (MIT), plus ideas restated from hypit-ai/hypit (ideas only).

Stage order: 01 02 04 06 05 [07 08a] 08b 09 10
Leads with: the footage. 01 inspects the footage and gets the word times first; 02 sets density, look and what to avoid; 04 is the plan table per line; 06 is the composite preview with rough inserts (the preview for the router's approval stop). 03 is `not_used` because no speech is cut; when the edit also cuts speech, use the line below instead.
Stage order with a speech cut: 01 03 02 04 06 05 [07 08a] 08b 09 10

## Purpose
The user's footage stays the spine; the job is to add inserts, motion clips, lower thirds or cards that land on the spoken words, either as a finished composite or as clips for the user's own editor.

## Pipeline
1. Intake inside the single stage 01 message (only what the files do not answer): footage, transcript or subtitle file (or transcribe), density (light, medium, heavy), look or brand, what to avoid or include. Unanswered items take a default, logged in `ice/DIRECTION.md`.
2. Inspect the footage: specs, a 4x4 contact sheet, layout sections (full frame, picture-in-picture, black), the speaker's box over time and any resize (`scripts/motion-broll/inspect_video.py`). Word times from a word-level transcript, or estimates from a subtitle file (`scripts/motion-broll/words.py`).
3. Plan table per line: in-out, the line, the trigger word or sentence with its time (an element with no trigger and reason is cut), what appears and who it is on, treatment (full cutaway, panel, nothing), why (`broll-and-motion-broll.md` section 1). The table is approved like any stage: by the user's review card in step mode, by the approver role in auto mode.
4. Source or build each insert (preference order in `broll-and-motion-broll.md` section 2); log footage in the ledger. Motion clips: write fragments and build them with the bundled engine (`broll-and-motion-broll.md` section 6: `build.py`).
5. Stills at settled and mid-change times (`beats.js`); fix; render clips at the video's resolution and frame rate (`render.js`, transparent panels to ProRes 4444 `.mov`).
6. Composite preview (hard cuts, original audio, last-frame hold) with `composite.py`, then `make_pages.py` for the clip viewer, the before/after compare page and `TIMING.md`.

## Structure options
- Full-frame cutaways of 3 to 10 s with at least 2 s of face between.
- Transparent panels in empty space, possibly one long continuous piece.
- Lower thirds over live footage: cardless when possible, at least the block's own timeline length (most run about 5 s including the designed exit), kept in the title-safe lower band, never rendered behind the footage.
- Overlay cards (titles, data callouts, quotes, side panels) on a long talking head, count by formula.

## Rhythm ranges
| Measure | Value |
|---|---|
| Density | Light 2 to 4 per minute, medium 4 to 7, heavy most lines |
| Changes inside a clip | One per spoken beat, about 0.4 to 1.2 s apart |
| Cutaway length | The length of the idea, 3 to 10 s |
| Face between cutaways | At least about 2 s |
| Never | In the first second of the hook, or on personal, emotional or opinion lines |

Rhythm row: mean_shot_s -; max_shot_s -; first_cut_s -; max_event_gap_s -; holds excuse.

Where the row's numbers come from: No field is gated: the speaker's own shots between cutaways run as long as the density leaves them (light 2 to 4 inserts per minute), so no shot or gap number holds for every density; cutaway length and density stay with the plan check. The row is read by the `ice-qa` skill's `scripts/film_gate.py` on the render's detected cuts when no reference is followed (`references/motion-density.md` section 6.3); a `-` is not gated.

## Coverage floor

Minimums the edit plan and the render must meet; the measures, the reference rule and exemptions: the `ice-qa` skill, `references/motion-density.md` section 6.2. `scripts/validate-plan.mjs` reads this table. Medium density is the default: the light numbers are the fail line, and a medium or heavy plan that warns under the first number is fixed before 07.

| Measure | Floor | Where the number comes from |
|---|---|---|
| `element_events_per_min` | 8; 4 at light density | Density (Rhythm ranges): medium 4 to 7 inserts per minute, each entering and leaving (2 events), so 4 x 2 at the low end; light 2 to 4 per minute, so 2 x 2 |
| `longest_bare_talk_s` | 15 s; 30 s at light density | The spacing of insert starts at the low end of each density: 60 / 4 for medium, 60 / 2 for light |
| `trigger_coverage` | 100 percent | Every content trigger answered within 1.5 s or declined with its reason (`motion-density.md` section 6.2) |
| `broll_share` | 20 percent; 10 percent at light density | Inserts per minute at the density's low end times the shortest cutaway of 3 s (Cutaway length): 4 x 3 s and 2 x 3 s per 60 s |

## Transition policy
Cutaways enter and leave on hard cuts against the A-roll unless the plan names a reason; within a motion clip the shape never cuts (it morphs).

## Camera policy during holds
Inside a clip, the camera zooms so each state fills the frame; on footage, a slow push-in or none per edit type.

## Sound policy
Covered speech stays the performance audio; an insert over the speaker never needs a new voice. Effects only on visible actions (ice-audio skill).

## Text density
Labels taken from the transcript; never invented numbers, quotes or prices; illustrative items listed as such.

## QA thresholds
Every change lands on its word; no cramped, clipped or unreadable state; cursor inside the frame at every zoom; clips match source fps and resolution; alpha clips verified over both dark and light footage.
