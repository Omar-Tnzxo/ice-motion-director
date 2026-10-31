# Film setup: type and crew

Stage 01 picks the film type and the crew row; every later stage reads the crew row for its critic, its approver and its review rounds. Paths below are written from the skill folder, as in `../SKILL.md` (`references/` and `roles/` are inside this skill).

## Contents

1. Film types
2. Crew size and sub-agent roles
3. Music at 01

## 1. Film types

Every type file has the same fields: Fit, Purpose, Structure options (several), Rhythm ranges, Timing master, Transition policy, Camera policy during holds, Sound policy, Text density, Truth and content, Richness floor, QA thresholds, Deliverables, Pointers, and its `Stage order:` line. The Richness floor table uses the same measures in the same order (`hero_share`, `hero_width`, `frame_fill`, `empty_half`, `depth_layers`, `in_shot_motion`, `longest_still`, `surface_detail`, `light_events`, `real_material`); ice-qa reads them by name.

Measured genre playbooks: `genres/<genre>.md`, one per genre, measured on a corpus of professional films (conventions with numbers, the variants, rejected hypotheses, a coding sheet and a `Genre fingerprint:` line). A type file names its playbook in Pointers; read it at 02 (variant and conventions), at 04 (pace, transitions, end card) and at 08 (music and SFX density); its fingerprint runs at 07 and 09 (`ice-qa/scripts/genre_check.py`, gate D). Today: `genres/ui-motion.md` for app ads, product launches with screens and UI walkthroughs.

| Type | Signals in the brief | File |
|---|---|---|
| Product launch | launch, announce, release, feature film, landing hero, sizzle, rescue a basic launch film | `references/film-types/product-launch.md` |
| App ad | mobile app ad, store promo, an app's ad for a feed | `references/film-types/app-ad.md` |
| Brand film | brand, identity, manifesto, mission, rebrand, showreel | `references/film-types/brand-film.md` |
| Logo sting | logo reveal, ident, bumper, intro or outro, 2-8 s | `references/film-types/logo-sting.md` |
| Kinetic type | typography, quote, statement, text-only, lyric lines | `references/film-types/kinetic-type.md` |
| Data story | stat, chart, milestone, report, numbers lead | `references/film-types/data-story.md` |
| Social short | reel, short, story, 6-60 s for a feed | `references/film-types/social-short.md` |
| Hype promo | teaser, trailer, countdown, hype, 10-20 s on a beat | `references/film-types/hype-promo.md` |
| UI walkthrough | demo, tour, onboarding, how the product works | `references/film-types/ui-walkthrough.md` |
| Music video | track-led, lyric video, beat-cut, audio-reactive | `references/film-types/music-video.md` |
| Art film | style piece, painted or hand-made look, experimental | `references/film-types/art-film.md` |
| Industry spot | a real business in a named industry, 15-40 s commercial | `references/film-types/industry-spot.md` |

Two types fit: pick the one whose purpose matches the goal, borrow parts of the other, log it; ask only when they would make different films, and then inside the stage 01 message. Industry rules (`industry-spot.md`) apply on top of any type in a regulated or named industry.

**Product job** (founder decision, 2026-10-21). When the brand's offer is an app, a SaaS or a product (the product truth in the business brief of `ice/BRIEF.md`), every film type, brand film included, shows the product doing its real job in at least one full beat: the real product or its real screens in use, the cause and then the effect, clearly enough that a cold viewer names what it does (`ice-qa/references/clarity-gate.md` sections 5 and 6). A feeling, a world or a metaphor may carry the rest of the film; it never replaces that beat. A type's own purpose line (the brand film's feeling over features, for one) never removes it.

**Brand film or app ad, for an app brand.** When the brand's offer is an app and both types fit, decide in this order and log the D-entry:
1. The brief's goal asks the viewer to do something in the app (for illustration only, several shapes: open it, search, order, book, try it): app ad, borrowing the brand film's feeling and transitions where they serve.
2. The goal is a brand feeling or a position with no action in the app: brand film, with the product job beat above.
3. A cold viewer who cannot name what the product does, at any clarity read (`ice-qa/references/clarity-gate.md` section 1), moves the film toward the app ad's conventions: the product beat becomes one of the structure options of `references/film-types/app-ad.md` built on the real screens (for example "Moment rescued" or "Before, one press, after"), with the app ad's CTA rule. The change is a new D-entry that supersedes the type choice, and the reads run again.

The app ad's length, CTA and screen rules adapt to the asked length and to an unofficial concept (`references/film-types/app-ad.md`, sections Fit, Purpose, Rhythm ranges, Truth and content, Deliverables); they never rule the type out.

## 2. Crew size and sub-agent roles

Scale sub-agents and review rounds to the film; a 20 s ad does not need 20 dispatches. Count every dispatch of the run, the ice-direction roles included.
1. Start from the length row.
2. Move one row up per complexity flag: a real brand's UI or product rebuilt at 90 percent fidelity; two or more language versions (a Latin brand name inside an Arabic film does not count); more than one master aspect composed separately; real 3D; more than 8 shots split across builders. Never above Full.
3. Write the row and its flags in `ice/state.json` (`crew`) and the delivery report.

| Crew | Film length | Sub-agents, whole run | How the dispatches are spent | Film review rounds |
|---|---|---|---|---|
| Lean | up to 20 s | 5 to 8 | 1 researcher; 1 critic for the concept set; 1 critic for the direction set (palette, type, sound lead and motion language each with its own options); 1 approver pass for all decisions; 1 storyboard critic who also judges the openings; 2 film reviewers | 2: full film, then verification |
| Standard | 21 to 45 s | 8 to 12 | Lean plus a consultant for culture-sensitive or regulated choices, a separate hook critic, a third film reviewer, a builder only when the film splits by file | up to 3 |
| Full | over 45 s, or a campaign with cutdowns and languages | 12 to 20 | the ice-direction full tier; builders by file; a reviewer per round per master; the climax duel when a reference is matched | up to 3 per master |

Stage approvals in auto mode: a stage with a critic in this table is judged by it; every other stage passes on the approver's batched check of its "Done when" column (`ice-direction/references/decision-process.md` section 3), and one approver dispatch may cover several stages. Batch, never skip: one dispatch may judge several decisions when each has its own options and verdict. Never shrinks with the crew: a reviewer who did not build judges every round; three options and a critic at every fork; the truth pass, the stills check, the richness floor; the cold-viewer clarity reads, each a fresh dispatch of its own, never batched and not counted in the row's numbers (`ice-qa/references/clarity-gate.md` section 7).

Roles: director (always, usually the main agent; `roles/director.md`); builder (long films split by file, or parallel films; `roles/builder.md`); reviewer (every round, fresh; `roles/reviewer.md`); finalizer (after 09; a lean crew's director may finalize; `roles/finalizer.md`). On a short film the director may build alone, but a separate reviewer judges every round.

## 3. Music at 01

Track-led types (hype promo, music video, kinetic type cut to a track, showreel) take or choose the track, run its sync license check and measure its beat map now; other music-led types (brand film by default) do so only when a licensed track already leads; otherwise they shortlist real tracks at 05, picked by ear from 2 to 3 options (`ice-audio/SKILL.md` section 5). The track that leads is chosen at 01 because the cut is built on its beat map; a film led by voice or picture picks its music later, from real library options laid on the animatic.
