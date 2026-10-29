# Film type: industry spot

Fields in order: Fit, Purpose, Structure options, Rhythm ranges, Timing master, Transition policy, Camera policy during holds, Sound policy, Text density, Truth and content, Richness floor, QA thresholds, Deliverables, Pointers.

Stage order: 01 02 03 [04 05] 06 [07 08a] 08b 09 10
Leads with: the story.

## Fit

A 15-40 s commercial for a real business in a named industry (restaurant, real estate, clinic, home services, retail, hospitality, events, automotive, finance, education, nonprofit). Software products lean on `product-launch.md` or `app-ad.md`; this file adds the industry rules.

## Purpose

Business purpose on mute: by the end, a first-time viewer can say what the business does and what to do next with the sound off. Proof beats promise; one job per film (visit, call, book, buy, follow).

## Structure options

| Option | Skeleton and numbers |
|---|---|
| Business storyboard | 12-15 distinct compositions for a 30 s film; vary scale (macro, wide, overhead, UI close-up, type impact); each row: time, visual, business job, transition and the surviving object |
| Direct response, wireframe first | 15-30 s; 9 one-line beats: pain, reframe, name, how, objection, range, numbers, offer, CTA; layout locked before styling |
| Service spine | context, process, evidence, outcome, promise, logo |
| Request to confirmation | request, picker, selected time, confirmation (service businesses) |
| Place walkthrough or map story | the location on a map with real travel times, a walk through the space; renders labelled as renders |
| Food montage on the beat | steam, the sound of cooking, the first bite, the crowd |
| Timeline reel | company history or anniversary, one moment per scene |

## Industry playbook

| Industry | Proof to show | Hooks that work | Claims and risks |
|---|---|---|---|
| Consumer apps | latest-build screen recordings, real catalog photos | the everyday moment it rescues, a chat or notification format | times as ranges; coverage named exactly; fees and minimums out |
| Fintech, banking, wallets | real screens with demo accounts, the transfer moment | the fee or wait they hate, before and after | rates, fees, limits, licences and risk warnings need legal wording; never promise returns |
| SaaS and B2B | one workflow end to end, cursor driven | the painful manual task, a verified number the buyer cares about | customer logos only with permission; no competitor names without legal approval |
| E-commerce and D2C | real product footage, macro details, the product in use | the problem in the first second, unboxing, a texture close-up | prices and offers with dates; material claims verified; reviews real and attributed |
| Restaurants and food | real food, the kitchen, the place | steam, frying sound, the first bite | prices change; calorie, halal and allergy statements exact |
| Real estate | real footage or labelled renders, floor plans, map with real travel times | the view, the monthly plan, "walk with me" | prices, plans, dates and licence numbers exact; no guaranteed returns |
| Education and creators | the teacher, real lessons, outcomes | a common mistake, a quick win | no guaranteed income or grades |
| Health, clinics, fitness | real staff with real credentials, the facility | a common question answered, a myth corrected | no cure claims; no before and after without approval |
| Hospitality and travel | real location footage in season | the view in the first frame | seasonal prices; photos of the actual place |
| Events | venue, approved speaker or artist photos, the date | countdown, save the date | date, place, ticket link exact; rights for names and images |
| Automotive | real cars, interiors, the drive | the sound, the detail | specs and prices exact; no dangerous driving |
| Nonprofit and public sector | real people and places shown with dignity | one person's story, one sourced number | no exploitation imagery |
| Games | real gameplay capture with rights | the best 2 seconds of play | ratings and platforms exact |

When the industry is not listed, take the closest row and let the stage 01 RQ-rules research and `ice/research/COMPLIANCE.md` (ice-direction) settle its regulations; a rule the research cannot settle goes into the stage 01 message as one question. Regulated claims (health, finance, real estate, education results, children) stay off until the owner sends approved wording. Seasons, representation and dialect come from the brief and the research, never from assumption; when they would change the film and stay open, they go into the stage 01 message, and with no answer the neutral choice is logged and reported (ice-arabic for Arabic markets).

## Rhythm ranges

- 30 s: about 12-15 compositions, beats of 1.4-3.5 s; frame 0 is a finished composition.
- Pilot set: one 20-30 s film plus two hooks plus two aspects.

Rhythm row: mean_shot_s -; max_shot_s -; first_cut_s -; max_event_gap_s 3.5; holds excuse.

Where the row's numbers come from: max_event_gap_s: beats of 1.4-3.5 s (above); compositions are not shots (a carried transition changes the composition without a cut), so the shot fields stay open; holds excuse: calm spots may hold locked reading frames (Camera policy during holds). The row is read by the `ice-qa` skill's `scripts/film_gate.py` on the render's detected cuts when no reference is followed (`references/motion-density.md` section 6.3); a `-` is not gated.

## Timing master

Voiceover when the market expects it; otherwise a back-timed real track whose own ending lands on the end card (ice-audio). See `../cue-sheet.md`.

## Transition policy

Hand objects across scenes at exact pixel coordinates so the last frame of one scene equals the first frame of the next for the carried object; avoid near-black transition frames and pale low-contrast text on key messages (phone viewing).

## Camera policy during holds

| Scope | Policy |
|---|---|
| Energetic spots | No hold over about 0.6 s except the CTA; reading holds only on business-message frames with a slow 3-6% push (the `ice-motion` skill, `references/camera.md` section 4) |
| Calm spots (services, health, premium) | Locked reading holds are allowed; motion stays gentle |

## Sound policy

Music matched to the buyer's customer, with tempo ranges by category: the `ice-audio` skill, `references/music-choice-and-licensing.md` section 3. Calm films want sparse SFX: one soft whoosh on real transitions, small clean sounds on real actions. Ice-audio owns levels and loudness.

## Text density

One message per frame; the CTA readable at phone size for at least about 1.5 s; business name and action exact.

Scoped exception, the CTA block (industry spots and event invites): the facts a viewer needs to act (name, event or offer, date, hours, address or link) may run to about 16 text units on the end card, above the per-shot text cap. Hold the block for its reading time (the `ice-type` skill, `references/reading-time.md`), or split it across at most three end shots that each add one fact while the earlier facts stay. Mark the end-card rows `CTA block` in the storyboard Tags column so the ice-qa storyboard lint applies this exception instead of the general cap; never shorten an address or a date to pass a lint.

## Truth and content

- Approved claims, the negative list and labels for concept films and illustrative content: the `ice-assets` skill, `references/truth-sheet.md` sections 6 and 9.
- Generated imagery (optional, user-initiated, disclosed, never shown as a real job, customer or result): the `ice-assets` skill, `references/ai-media-policy.md` section 1.
- Local life, not stock life: real streets, real area names, the way people of that city talk.
- A named real business, or a real reference brand for the field: research it (dated today) and use its real material: its own site and app captured live, its official brand or press kit, colours and fonts read from its own site, its untouched logo, its real place. Never invent its look; when the material cannot be obtained, the `ice-assets` skill, `references/brand-authenticity.md` decides what happens (in the stage 01 message, or the no-answer path it defines).

## Richness floor

Minimums the render must meet; measures, exempt shots and how to fix a thin frame: the `ice-motion` skill, `references/composition-and-staging.md` section 7. ice-qa measures them. Calm spots (services, health, premium) subtract clutter, never these.

| Measure | Floor |
|---|---|
| `hero_share` | 40 percent in feature shots (target: the lead subject spans 60-85 percent of the usable frame) |
| `hero_width` | 50 percent for the business name in the CTA block |
| `frame_fill` | 12 of 16 cells (the CTA end card may go 4 below) |
| `empty_half` | 0 s for vertical; 1 s in total for 16:9 |
| `depth_layers` | 3 (the place, the subject, a foreground element of the place) |
| `in_shot_motion` | 85 percent for energetic spots; 75 percent for calm spots |
| `longest_still` | 0.6 s for energetic spots and 1.2 s for calm spots, outside declared reading holds |
| `surface_detail` | yes in every shot |
| `light_events` | 1 per 10 s of runtime |
| `real_material` | 100 percent: the real place, product, people and logo; renders labelled as renders |

## QA thresholds

- Muted viewer states the business and the action; frozen time at most about 1 s per 30 s (energetic); every claim true or labelled; brand colour sampled correctly.
- End hold: the CTA block holds for its reading time, which may exceed the 0.6-1.4 s lockup hold. Declare the CTA block's start as its own event in the cue sheet (and in the events file the ice-qa end-hold check reads) so the check measures the CTA reading hold against the reading time, not the lockup limit.

## Deliverables

16:9 and 9:16, two hooks, a 15 s cutdown, poster, licences and a generation ledger when any asset was generated. See `../delivery.md`.

## Pointers

Truth sheet and asset rights: ice-assets. Arabic markets: ice-arabic. Music by category: ice-audio.

Sources: video-production-studio (Omar-Tnzxo), echris6/motion-video-kit, AbubakrChan/product-launch-motion, Tejashmakwana/motionmaxxing.
