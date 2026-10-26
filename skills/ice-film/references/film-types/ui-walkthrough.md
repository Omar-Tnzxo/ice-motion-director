# Film type: UI walkthrough

Fields in order: Fit, Purpose, Structure options, Rhythm ranges, Timing master, Transition policy, Camera policy during holds, Sound policy, Text density, Truth and content, Richness floor, QA thresholds, Deliverables, Pointers.

Stage order: 01 02 03 05 04 06 [07 08a] 08b 09 10
Leads with: real screens. 01 captures the live product first; 05 runs before 04 because the look is the captured UI.

## Fit

A product UI demo, feature walkthrough, onboarding film or homepage product film (30-90 s, sometimes a 12 s loop), narrated or music-only, where the interface is the material. When the voiceover teaches concepts rather than showing the product, use ice-explainer.

## Purpose

Show the product being used: one operation at a time, the cause visible, the result readable.

## Structure options

| Option | Skeleton and numbers |
|---|---|
| Calm demo | default 60 s (range 45-90): open 0-5 s, the problem or ask about 5 s, 3-5 feature chapters of 8-15 s (a title line, a UI moment, a pull-back), optional proof (real numbers only), optional integrations, a closer, an end card of 3 s. Budget: 45 s holds 2-3 features of about 9 s and proof or integrations, not both; 60 s holds 3-4 features of about 10 s and one of them; 90 s holds 4-5 features of about 12 s and both |
| One-take hero through stations | default 12 s seamless loop (range 10-30, longer means more stations, not slower ones); one readable hero object hops between stations on one large canvas; each station visibly changes because of it; a payoff hold, a reveal of the whole course, a dive back to the first station |
| One-camera desktop teaser | about 27 s; pushes and pulls of 1.5-3 s; accurate app windows; a checklist of claims |
| Real-product state story | 12-15 s per cut; real UI states and data only; an accent element travels between states |
| Demo loop arc | question, product intro, demo cycle 1, demo cycle 2, trust, CTA |
| Shape per operation | pick from `../script-shapes.md`: cursor-driven workflow, device surface, panel edit with live sync, agent progress theater, prompt type submit generate |

## Rhythm ranges

- A title line holds about 2 s after it lands; UI runs at real speed (typing rates by viewer task, for example narrated UI against human authoring: the `ice-motion` skill, `references/cursor-and-ui.md` section 4); a pause of about 0.5 s after each result.
- Each feature at least 2.5 s on screen; one close-up per operation.

## Timing master

Narrated: voice-led; every beat names the word it lands on, so a new voice means re-reading word times, not redesigning. Music-only: music-led with reading windows. Clock modes: the `ice-audio` skill, `references/cue-map-and-beat-sync.md` section 1. Film-side cue rules: `../cue-sheet.md`.

## Transition policy

| Scope | Policy |
|---|---|
| Calm demo | The camera is the editor: no hard cuts; every scene change is a camera move (push, pull, glide), a morph or a carried object; no crossfades or dissolves between scenes (the `ice-motion` skill, `references/transition-policy.md` sections 2-3) |
| One-take stations | No cuts, no fades to black |
| Narrated operation demo | Close-up and camera-follow rules: the `ice-motion` skill, `references/cursor-and-ui.md` section 5 |

A preview that cuts away and comes back reads as two cuts; show the future through a lens or window over the base shot.

## Camera policy during holds

Locked while reading; after an action, a pull-back shows the whole screen for a beat so the viewer knows where they are; no camera shake in narrated UI films.

## Sound policy

A gentle bed (soft keys or plucks around 100-110 BPM for calm demos), key ticks while typing, soft clicks, a light tick per completed step. Ice-audio owns levels.

## Text density

At most one line of text plus one UI element on screen; text and UI rarely share the frame. Legibility is arithmetic: on-screen text size equals font size times replica scale times camera zoom; anything the voice names is at least 26 px on screen at 1080p; a window to be read fills about 70-80% of the frame width.

## Truth and content

- Rebuild the real UI from live captures at 90 percent fidelity or better (real layout, labels, colours, fonts, radii; simplify only by removing, never by redrawing) or use the real captures; never invent a feature; content on the replica comes from the product's real output.
- The cause is visible: a cursor clicks real element centres with a press and release.
- Hide account names, workspace names and anything the client does not want seen.

## Richness floor

Minimums the render must meet; measures, exempt shots and how to fix a thin frame: the `ice-motion` skill, `references/composition-and-staging.md` section 7. ice-qa measures them. Reading holds after each result are declared in the motion plan.

| Measure | Floor |
|---|---|
| `hero_share` | 40 percent for the window or device being used |
| `hero_width` | 70 percent for a window the viewer must read |
| `frame_fill` | 11 of 16 cells |
| `empty_half` | 0 s for vertical; 1 s in total for 16:9 |
| `depth_layers` | 2 (defocused background UI or desk, the active window); 3 when the device sits in a place |
| `in_shot_motion` | 70 percent |
| `longest_still` | 1 s outside declared reading holds |
| `surface_detail` | yes in every shot |
| `light_events` | 1 |
| `real_material` | 100 percent: real captures or rebuilds of the real UI at 90 percent fidelity or better |

## QA thresholds

Every operation readable at phone size; the cursor never leaves the frame at any zoom; compare the replica with the reference screenshots state by state until differences are deliberate.

## Deliverables

16:9 master, 9:16 re-laid out, per-language cuts from one composition, captions file. See `../delivery.md`.

## Pointers

Launch-wide UI rules: `../launch-principles.md`. Cursor and camera numbers: ice-motion. Real capture and replicas: ice-assets.

Sources: Barty-Bart/motion-graphics, howseen-ai/claude-motion-design, video-production-studio (Omar-Tnzxo), heygen-com/hyperframes (blueprints), feitangyuan/onetake (ideas).
