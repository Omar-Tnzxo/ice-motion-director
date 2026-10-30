# Film type: product launch

Every film-type file uses the same fields in the same order: Fit, Purpose, Structure options, Rhythm ranges, Timing master, Transition policy, Camera policy during holds, Sound policy, Text density, Truth and content, Richness floor, QA thresholds, Deliverables, Pointers.

Stage order: 01 02 03 05 04 06 [07 08a] 08b 09 10
Stage order without screens: 01 02 03 [04 05] 06 [07 08a] 08b 09 10
Leads with: real screens when the product has them (app, SaaS, site, device interface): 01 captures the live product first and 05 runs before 04 because the look is the captured UI. A product without screens is story-led: use the second line.

## Fit

- A launch or feature-announcement film (20 to 90 s), a landing-page hero video, a demo reel, a conference sizzle, an investor-update film, or a rescue pass on a launch film that "looks basic".
- Not for: editing a talking head or a screen recording with captions on top (ice-edit); a film whose voiceover teaches a concept (ice-explainer); a 10 to 20 s beat-driven teaser (see `hype-promo.md`); a product tour that walks every screen (see `ui-walkthrough.md`).

## Purpose

- A launch film makes one promise about a product and shows it being kept. One claim, one film: about 45 s lands exactly one idea.
- Claim test: can you say the claim in seven words or fewer, out loud, without a conjunction? If not, split it or drop half.
- Build the sequence around the promise, not a feature list. A website is an information layout; a film is an emotional sequence. Reorder, merge and omit page content freely; never follow page order.
- Show the business purpose as cause and effect: every animated action visibly produces a result.

## Structure options

Pick one parent skeleton per film (two may combine, one leads). None is the default; the anti-sameness rules in `../structure.md` decide.

| Option | Use when | Skeleton |
|---|---|---|
| PAS | The pain is known and urgent | hook, pain, agitation, solution tease, product intro, proof or demo, CTA |
| Future pacing | It sells a new future or category | imagine, name the product, remove the pain, mechanism, outcome, CTA |
| Demo loop | The UI explains itself when shown working | question, product intro, demo cycle 1, demo cycle 2, trust, CTA |
| Before, after, bridge | It moves people from an old workflow to a better one | before, after tease, bridge (product), step 1, step 2, wow, CTA |
| Feature-benefit cascade | Feature-rich or desire-driven products | category hook, feature, benefit, feature, benefit, climax, CTA (always translate a feature into viewer value) |
| Argument then evidence (measured shares) | Narrated launch with a clear claim | problem 8-10%, agitate 8-10%, thesis 5%, product 30-35%, proof 20-25%, contrast 10%, CTA 8-10%; the claim lands inside the first 10 s; cap product beats at four |
| Claim, how, result cycles | Products whose results are visual | claim 1-2.5 s, how in the UI 2-6 s, result 4-6 s; 2 or 3 cycles; closing 4-5 s; luxury from restraint |
| Chain story | A workflow product where each step feeds the next | problem in the customer's own words (3-5 s), each step produces what the next one uses, the measurable result on screen, the price twist, the CTA; each step 2-7 s; every element finishes and stays readable at least 1.5 s |
| One shape, never cut (music-first UI morph) | App or SaaS with 8-12 UI states and a song | one element morphs through every state on a beat grid near 120 BPM, something happens on every beat, see `../launch-principles.md` |
| Continuous-take keynote launch | Consumer apps, AI products | 22-27 s, square, 60 fps; every scene grows out of the last (morphs, floods, iris); a real cursor; last frame equals first |
| Hook, one core interaction, proof of range | Fast launches | hook, one core interaction, a fast proof of range (a wall, never a slow tour), the brand moment, the call; a visual payoff every 3-5 s |
| Restraint product film | Fintech, B2B SaaS, premium software | 15 s master recomposed for 9:16; real dashboard rebuilt in layers; object-driven transitions; overshoot under 2%; one strong moment |
| Feature as transition | APIs, SDKs, infrastructure, AI platforms | 15 s; each transition demonstrates a feature; readable kinetic code; release status checked |
| Real-media launch trailer | Creator tools, consumer apps, video products | 20-25 s; real clips inside the design; stickers, stamps, counters on beats |
| It was an ad all along | Brand campaigns, retail, events | 30 s; a satisfying making-of process resolves into the key visual; text tiles flip last |
| Story spine by category | When the category is clear | AI or SaaS: intent, planning, capabilities, execution, output, proof, logo. Physical product: hero, interaction, feature macro, usage context, result, logo. Service: context, process, evidence, outcome, promise, logo. Image-led brand: imagery, motif, benefit, emotional payoff, logo |
| Seven-beat narrated launch (one option only) | A 45 s launch with a typed prompt | 0-4 s hook words; 4-9 s next words over proof; 9-17 s product working with the prompt typed live; 17-22 s a quality beat; 22-32 s how it works; 32-38 s the one number that matters, counted up, with its source; 38-45 s name, CTA, requirement |

Warning: hook, feature, feature, promise, logo, CTA is one possibility, never a default, and never used by two consecutive films (see the structure fingerprint in `../structure.md`).

## Rhythm ranges

| Measure | Range | Scope |
|---|---|---|
| Length | 20-90 s band; sweet spot 30-90 s; 30-45 s for a social launch; 45-90 s (default 60) for a calm narrated demo; ads: a 30-40 s main cut plus a 15 s cutdown | pick by platform slot in ice/BRIEF.md |
| Hook | One hook in the first 3-5 s; the promise lands by beat 2; a stranger knows what is launching by second 4 | all |
| Compositions | 12-15 per 30 s for energetic edits; beats 1.4-3.5 s | music-led, energetic |
| Beats | 3-7 s per beat; add beats rather than stretching one past 7.5 s | proof-led, narrated |
| Proof | About one proof per 8-10 s, never zero, at most three in a row unless one object runs through them; proof beats are about half the runtime | all |
| Energy | Strongest single frame at 60-75% of the film; beats shorten toward it | all |
| UI demo | A sequence of 3 or more consecutive feature beats on the same surface (input, response, result, benefit), not one isolated frame | when value depends on workflow |

Rhythm row: mean_shot_s -; max_shot_s -; first_cut_s -; max_event_gap_s 7.5; holds excuse.

Where the row's numbers come from: max_event_gap_s: never stretch a beat past 7.5 s (Beats row; energetic music-led beats of 1.4-3.5 s are stricter and stay a target); the shot fields stay open because the One shape, never cut and Continuous-take options have no cut; holds excuse: narrated cuts declare their reading holds (Richness floor, `longest_still`). The row is read by the `ice-qa` skill's `scripts/film_gate.py` on the render's detected cuts when no reference is followed (`references/motion-density.md` section 6.3); a `-` is not gated.

## Timing master

- Narrated launch: voice-led. Music-led launch: music-led, with the drop on the product's big moment. Silent launch: free (every reveal cued to what motivates it, never an estimate).
- Clock modes and their rules: the `ice-audio` skill, `references/cue-map-and-beat-sync.md` section 1. Film-side cue sheet rules: `../cue-sheet.md`.

## Transition policy

- Transitions carry meaning: zoom-through where one thing causes the next, a push through a product sequence. A film where every crossing is the same move reads as a slideshow.
- Crossfades and dissolves: banned between scenes in product launches; fade only a single object whose motion continues across the seam (the `ice-motion` skill, `references/transition-policy.md` section 3).
- One-shape and continuous-take launches: no cuts at all; every change is a morph, a camera move or a zoom into an element that becomes the next scene.
- Multi-frame narrated launches assembled from frames: a small set of between-frame transitions repeated (one primary for most seams, one or two accents), per `references/transition-policy.md` section 2 of the `ice-motion` skill.
- Every seam names its carrier (`../storyboard.md`). Cut catalog and numbers: ice-motion.

## Camera policy during holds

| Scope | Policy |
|---|---|
| Narrated launch | Camera locked while the viewer reads; no slow pan or push in the back half of a hold; at most one element stays alive during a hold |
| Music-led energetic launch | No motionless stretch over about 0.6 s except the CTA; reading holds only on message frames, with a slow 3-6% push (the `ice-motion` skill, `references/camera.md` section 4) |
| One shape, never cut | Holds end in a resolved state; the camera zooms so each state fills the frame (an empty frame is a bug) |

## Sound policy

- Narrated: narration loudest; the music bed so low that noticing it means it is too loud; a launch film does not need a score.
- Music-led: the soundtrack is chosen before choreography: energetic, brand-appropriate, with a build, a clear drop and a satisfying ending. BPM alone is not energy.
- UI sounds only on real actions. Levels, loudness targets and SFX families: ice-audio.

## Text density

- One clear takeaway per scene; short prompts and answers; enough settled time to read the result.
- Typing belongs only inside the product's real input box, never on headlines.
- One emphasis word per headline carries the accent. Reading-time rules and type scale: ice-type.

## Truth and content

- Approved figures only: every number, logo, face, screenshot and testimonial comes from the truth sheet (ice-assets). A shot that wants a fifth stat when the list has four gets four. Round only toward the less impressive number.
- No figures available: a film with zero invented numbers beats one with impressive fake ones; show relative bars, skeleton lines or real capabilities instead.
- Customer logos appear one by one as beats, never as a website "trusted by" row, and only brands that really ran with the product, with permission.
- Rebuild real surfaces faithfully: from live captures of the real product, at 90 percent fidelity or better, with colours and fonts read from the product's own site (the `ice-assets` skill, `references/screen-capture.md`); drawing a UI the product does not have, or guessing a real brand's look, is fabrication. Label reconstructions and illustrative data.
- Demo honesty: if a step takes three minutes, do not imply three seconds; show the honest end of a range.
- Pre-launch: design files, staging data, first units, testers; a pre-launch proof beat is not a stat. A concept film says it is a concept.
- Industry truth (hardware spec sheets, e-commerce real prices or none, dev tools never fake a green test run): `industry-spot.md` and ice-assets.

## Richness floor

Minimums the render must meet; measures, exempt shots and how to fix a thin frame: the `ice-motion` skill, `references/composition-and-staging.md` section 7. ice-qa measures them. "Premium" and "restraint product film" subtract clutter, never these.

| Measure | Floor |
|---|---|
| `hero_share` | 40 percent in product and proof shots (the primary visual takes at least 40 percent of the canvas) |
| `hero_width` | 30 percent for statement frames (3-5 words span 0.30-0.56 of the width) |
| `frame_fill` | 11 of 16 cells (16:9); 12 of 16 in the vertical re-layout |
| `empty_half` | 1.5 s in total for 16:9 (negative-space statement or CTA frames only); 0 s in the vertical re-layout |
| `depth_layers` | 3 (defocused background UI or set, the hero, a foreground accent or occluder) |
| `in_shot_motion` | 85 percent |
| `longest_still` | 0.6 s in music-led cuts outside the CTA; narrated cuts declare their reading holds, nothing else stands still over 1 s |
| `surface_detail` | yes in every shot |
| `light_events` | 1 per 15 s of runtime |
| `real_material` | 100 percent when the product is real (real UI captured or rebuilt at 90 percent fidelity or better, real logo, colours and fonts read from the brand's own site) |

## QA thresholds

- A stranger knows what is launching by second 4, muted.
- Every number traces to a source; five random reveals land on their word (narrated).
- A CTA with a URL or offer stays readable at phone size for at least 3 s; a lockup-only sign-off follows the end-hold gate in `../openers-and-endings.md`.
- Frozen time at most about 1 s per 30 s in energetic cuts.
- The film differs from its nearest template or demo on at least 4 of 6 axes (only for a look Ice picked: a look the user chose is exempt on the axes it fixes (`ice-direction/references/anti-sameness.md` section 4a)); a film that fails the competitor swap has no direction (ice-qa runs both gates; the swap from 02 on, `identity-tests.md`).

## Deliverables

16:9 master; 9:16 re-laid out (usually shorter: 45 s to 30 s, cutting a product-detail shot, never the claim); optional 1:1; captions burned plus `.srt`; a chosen poster frame; a silent cut; 3-6 stills; a 2-4 s loop; licences recorded. See `../delivery.md`.

## Pointers

Launch rules that span types: `../launch-principles.md`. Openers and endings: `../openers-and-endings.md`. Script shapes per beat role: `../script-shapes.md`. Motion grammar, cut catalog, camera: ice-motion. Truth sheet: ice-assets. Engines and aspect re-layout: ice-engines. Gates: ice-qa.

Sources: AbubakrChan/product-launch-motion, heygen-com/hyperframes (product-launch-video), charlie947/motion-graphics-skills, howseen-ai/claude-motion-design, echris6/motion-video-kit, bangtutorial/bang-motion, alexgreensh/anidoodle, Tejashmakwana/motionmaxxing, video-production-studio (Omar-Tnzxo).
