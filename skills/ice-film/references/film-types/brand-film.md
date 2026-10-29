# Film type: brand film

Fields in order: Fit, Purpose, Structure options, Rhythm ranges, Timing master, Transition policy, Camera policy during holds, Sound policy, Text density, Truth and content, Richness floor, QA thresholds, Deliverables, Pointers.

Stage order: 01 02 03 [04 05] 06 [07 08a] 08b 09 10
Leads with: the story.

## Fit

- A brand, identity, manifesto, mission or purpose film; a brand showreel or agency reel; a rebrand reveal; an identity-system showcase.
- Not for: a product demo (`product-launch.md`, `ui-walkthrough.md`); a 2-8 s ident (`logo-sting.md`); an app brand's ad whose goal is an action in the app (`app-ad.md`, by the tie-breaker in `../film-setup.md` section 1).

## Purpose

- The viewer leaves with a feeling the brand owns, not a feature list. Name the emotional register precisely (for illustration only: quiet authority, earned relief, controlled anticipation), never "exciting" or "premium".
- One narrative job dominates: reveal, prove, celebrate, provoke, document or invite.
- A brand whose offer is an app, a SaaS or a product: the feeling rides on the product doing its real job in at least one full beat, clear enough that a cold viewer names it (`../film-setup.md` section 1, "Product job", which also holds the brand film versus app ad tie-breaker).

## Structure options

| Option | Use when | Skeleton and numbers |
|---|---|---|
| Brand system showcase | A new identity or a rebrand | 8-12 acts without cuts (motif object, logo, colour field, manifesto, asset parade, mascot if any, manifesto 2, brand guide pages, logo returns, loop); 25-30 s loop; acts 2.5-4 s; two energy peaks; brand colour full-frame only in two acts of about 3 s as chapter markers |
| One motif, transformed (showreel) | Agency reels, single-accent brands | the brand's most reduced element opens the reel, becomes each chapter's material, closes as punctuation in the lockup; 6-7 labelled craft chapters; development, then a short flurry of cuts, then the lockup on the measured grid of the chosen track (showreel pacing shares: the `ice-audio` skill, `references/cue-map-and-beat-sync.md` section 6) |
| Archival manifesto | Category creation, mission films | about 55 s at 24 fps; public-domain archive and real history; one hero object is the only saturated colour; one coined word |
| Darkness to light | Wellness, faith, NGOs, holiday films (no people needed) | about 37 s, 9:16; a cold colourless world darkens, one golden beam enters, coloured light multiplies; sound follows the light |
| It was an ad all along | Campaigns, retail, events | 30 s; a making-of process resolves into the key visual |
| Notch or device world | Brands with an iconic device language | 6-8 scenes of about 2.5 s; one background and one caption per scene; springs worked out from the start of the film so a reopening element continues from where it is |
| Narrative shapes | Story-led brand films | reveal, proof, behind-the-scenes, transformation, contrast, or accumulation; start from a tension gap (seen versus hidden, complex versus simple, before versus after, chaos versus control) |
| Image-led spine | Photo or footage-rich brands | imagery, motif, benefit, emotional payoff, logo |

## Rhythm ranges

- Density breathes: one object, then a wall of type, a grid, a crowd, one hero object, the flurry, one word again.
- Energy curve (where the strongest frame sits, the ending smaller than the climax): the `ice-motion` skill, `references/anti-slideshow-and-density.md` section 3.
- The middle fails through equal density: break it with acceleration, a quiet frame, a scale change, new material or a camera change.

Rhythm row: mean_shot_s -; max_shot_s -; first_cut_s -; max_event_gap_s -; holds excuse.

Where the row's numbers come from: No field is gated: the structure options disagree (cut-free acts of 2.5-4 s, scenes of about 2.5 s, an archival film with no number) and calm brands expect still holds (Camera policy during holds). The row is read by the `ice-qa` skill's `scripts/film_gate.py` on the render's detected cuts when no reference is followed (`references/motion-density.md` section 6.3); a `-` is not gated.

## Timing master

Music-led by default; voice-led with a manifesto voiceover; free for a calm film without a steady beat. When the music is a score composed by code, its tempo is chosen at 05 with the sound lead, written into the cue sheet at 06 and composed at 08a; a licensed track that leads the cut is taken at 01 like a track-led type (the `ice-audio` skill, `SKILL.md` section 4, steps 1, 3 and 5). Clock modes: the `ice-audio` skill, `references/cue-map-and-beat-sync.md` section 1; cutting on the grid and the pre-drop gap: the same file, section 6. Film-side cue rules: `../cue-sheet.md`.

## Transition policy

- Nearly every transition turns the current object into the next one; hard cuts are reserved for a flurry.
- Every chapter change flips value (dark to light) or saturation (neutral to full-bleed accent).
- Ground or colour changes need a visible trigger (a wipe, an object, a push into a colour field, a cut on the beat), never an unmotivated crossfade.

## Camera policy during holds

| Scope | Policy |
|---|---|
| Premium, editorial, calm brands | Still holds are allowed and expected: fast move, complete stillness, next move |
| Energetic showreels | The camera never sleeps; every transition rides a streak or blur trail; a 1 s rest every 7-8 s of kinetic density |

## Sound policy

Music is the spine. One held-back colour or sound appears only in the climax. If the music resolves on the logo, add no separate sting. Details: ice-audio.

## Text density

Manifesto lines word by word on beats; about 6% of frame height per line, at most 2 lines; three type voices at most (display, accent, mono machine layer). Type rules: ice-type.

## Truth and content

Exact colours from the current logo file, the brand's type (or its closest free substitute, documented), official logo files only; 3-5 verified, dated facts for any kinetic type. Only brand marks the user has the right to use (ice-assets).

## Richness floor

Minimums the render must meet; measures, exempt shots and how to fix a thin frame: the `ice-motion` skill, `references/composition-and-staging.md` section 7. ice-qa measures them. A calm or premium brand subtracts clutter, never these; designed true stills are declared in the motion plan and do not count against `in_shot_motion` or `longest_still`.

| Measure | Floor |
|---|---|
| `hero_share` | 30 percent (the motif object, the person, the place) |
| `hero_width` | 40 percent for manifesto lines |
| `frame_fill` | 10 of 16 cells |
| `empty_half` | 2 s in total for 16:9, only inside declared true-still punctuation; 0.5 s for vertical |
| `depth_layers` | 3 (2 for a flat print style that carries grain or texture) |
| `in_shot_motion` | 70 percent |
| `longest_still` | 1.5 s outside declared true stills |
| `surface_detail` | yes in every shot |
| `light_events` | 2 per film (darkness-to-light films build the whole film on them) |
| `real_material` | 100 percent: the brand's current logo files, exact colours and type read from its own materials |

## QA thresholds

- Brand test and competitor swap at the brand film's share: every masked frame reads as the brand (6 of 6 at 09). The tests, the masking and the stages they run at (02 written, 04 and 05 on masked frames, 09 as a confirmation): the `ice-qa` skill, `references/identity-tests.md`.
- Every transition transforms the object (except flurry cuts); value flips at every chapter change.

## Deliverables

16:9 master; loopable version when built as a loop; 9:16 and 1:1 re-laid out; poster; stills. See `../delivery.md`.

## Pointers

Style catalogs: ice-styles. Colour psychology and direction: ice-direction. Showreel HUD and motion: ice-motion. Endings: `../openers-and-endings.md`.

Sources: bangtutorial/bang-motion, nateherkai/herk-edit-kit, video-production-studio (Omar-Tnzxo), charlie947/motion-graphics-skills, imMamdouhaboammar/motion-graphics-skills (ideas only), Tejashmakwana/motionmaxxing.
