# Film type: app ad

Fields in order: Fit, Purpose, Structure options, Rhythm ranges, Timing master, Transition policy, Camera policy during holds, Sound policy, Text density, Truth and content, Richness floor, QA thresholds, Deliverables, Pointers.

Stage order: 01 02 03 05 04 06 [07 08a] 08b 09 10
Leads with: real screens. 01 captures the live product first; 05 runs before 04 because the look is the captured UI.

## Fit

- A paid or organic ad for a mobile app of any category (for illustration only: delivery, ride, booking, fintech, streaming, marketplace, social), for feeds, stories and store pages.
- Any asked length up to 60 s, official or an unofficial concept for a brand the user does not own. The length, CTA and screen rules below adapt to both; neither is a reason to pick another type. Choosing between this type and a brand film for an app brand: `../film-setup.md` section 1.
- Not for: a long feature tour (`ui-walkthrough.md`); a founder talking with app screens cut in (ice-edit, borrowing the app parts from here).

## Purpose

- One everyday moment the app rescues, shown with the real app doing its job. Proof beats promise.
- One job per film: download, order, book, follow. The CTA is said once and shown on the end card. When the user owns the brand: with the store badges or the link. For an unofficial concept (owner status `not owner` or `unknown`): no store badge, no link, no offer; the end card carries the official logo, the brand's own line as its pages state it today (from the truth sheet) or, with none, the name alone, and the unofficial line (`ice-assets/references/brand-authenticity.md` section 10, steps 1 and 10).

## Structure options

| Option | Use when | Skeleton and numbers |
|---|---|---|
| Moment rescued | Consumer apps with a relatable pain | the everyday moment (a situation, not a feature), the app opened, the core action, the result arriving, CTA |
| Object relay | Service journeys (order, pick, pack, deliver) | acts need, choose, collect, process or pack, arrive (drop non-distinctive acts); one hero object changes form but stays recognizable (item on screen, held product card, real object, package, parcel at the door); opening and closing about 2 s; choose and collect acts longest, 3-4.5 s; each act one action readable without sound or text; every transition carried by the object |
| Request, picker, confirmation | Booking and service apps | request, picker, selected option, confirmation; the most directly usable sequence for service businesses |
| Real-recording app glance (vertical) | Store promos, Reels and short-video ads | 45-50 s, 9:16; one feature per 2.5-5 s from real recordings; each feature breaks out of the phone |
| Product tour with claims | Several features, calm energy | 25-30 s; 10-11 acts of 2-5 s; only 1-2 cuts; one energy hit at the opening; alternate UI, claim, UI, never two claims in a row |
| Living UI ecosystem | Music-only film without voiceover | 50-60 s; 12-16 acts of 2-6 s; at most two hard cuts as chapter markers; readable without sound |
| Flat pop with photos | Youthful consumer brands | about 25 shots in 30 s (average about 1.2 s); people intros 1.5-3 s; montage 0.3-0.8 s on the beat; background changes always triggered |
| Chat thread | Apps where a conversation is the product | the request appears before its result; earlier answers stay; the thread scrolls; a follow-up animates inside the existing card |
| Before, one press, after | Non-chat apps with a visible state change | the problem state drawn from real data, one press of the app's action, every item springing to the after; never a screenshot slideshow |
| Prompt to result | Assistants, agents, ordering by request | 12-22 s; the request types, a thinking beat, the result floods in on the drop, shared-element handoffs |
| Product how-to in two steps | Simple products | 15-30 s, 9:16; product, two steps, the result with a readable dwell, the name; stop if a needed asset is missing |

## Rhythm ranges

| Measure | Range |
|---|---|
| Cuts | The main cut at the length the brief asks (30-40 s when it names none; the longer structure options above reach 45-60 s), plus the 15 s and 6 s cuts of Deliverables; each stands alone with its own hook |
| Feature on screen | At least 2.5 s |
| Chat playback | A five-beat exchange needs about 8 s with four push-ins; at 3-4 s it cannot be followed |
| Hook | Motion in the first second; first on-screen text before 0.5 s; the first frame is readable (it is also the cover) |

Rhythm row: mean_shot_s -; max_shot_s -; first_cut_s -; max_event_gap_s 6; holds excuse.

Where the row's numbers come from: max_event_gap_s is the longest act of the Structure options (acts of 2-6 s, Living UI ecosystem); the shot fields stay open because several options run with only 1 or 2 cuts; holds excuse: reading holds on UI are locked (Camera policy during holds). The row is read by the `ice-qa` skill's `scripts/film_gate.py` on the render's detected cuts when no reference is followed (`references/motion-density.md` section 6.3); a `-` is not gated.

## Timing master

Voiceover the whole way is the ad default when a voice source exists (the user's recording, or a voice the user chose): measured word times drive shot lengths, captions and motion (generate or record the voiceover early). Music-only ads: the beat grid with reading windows kept calm. See `../cue-sheet.md`.

| Situation | Timing master |
|---|---|
| A voice source exists | Voice-led |
| The prompt implies speech (for illustration only: "all the words in the local dialect", "people talking") but no allowed voice source exists: no recording, and the user has not chosen a synthetic voice | Music-led. Every word goes on screen in the requested language and dialect; ask inside the stage 01 message whether a voice will follow (recommended option: on-screen words now, voice later; also the default with no answer), log the choice in `ice/DIRECTION.md`, and never generate a voice the user did not choose |
| No speech implied | Music-led |

## Transition policy

- Carried transitions: the object, the phone, the hand or the result carries every seam.
- Hero beat: a real element breaks out of the phone or screen into the world (results fly out of the search, the map grows to fill the frame).
- No fade to black between shots; no crossfade as the default seam.

## Camera policy during holds

- The camera follows important taps (zoom toward the target before the cursor or finger arrives, still during the tap, release after the state resolves); numbers in ice-motion.
- Reading holds on UI are locked; narrated UI films use no camera shake.

## Sound policy

Voice over SFX over music. Music chosen by the ad's category, not the country, with tempo ranges: the `ice-audio` skill, `references/music-choice-and-licensing.md` section 3; cutting on the grid: `references/cue-map-and-beat-sync.md` section 6 of the same skill. A few UI sounds only on real actions. Levels and loudness: ice-audio.

## Text density

- On-screen text complements the voiceover, never repeats it word for word. Caption grouping and words per cue by caption style: the `ice-type` skill, `references/captions-system.md` section 5.
- CTA once at the end; never shouting copy ("download now" with exclamation marks).
- Positive features only: features that exist to handle failures (missing items, price changes, refunds, cancellations, complaints, change returned to a wallet) make viewers think of the failure; leave them out unless the owner asks.
- Arabic and dialect copy: ice-arabic.

## Truth and content

- Screens come from the latest build, recorded at real device resolution with a seeded demo account and demo data, when the owner gives that access. Without it (an unofficial concept, or no access offered at 01): live captures of the public pages, the store listing and the published demo screens, rebuilt at 90 percent fidelity or better (bullets below). Missing login access never rules this type out. Old screenshots show old screens: never reuse them.
- Never act for real during capture: stop before any real order, payment, booking, message or post.
- Invented user names, shops, prices, timers or ratings are still an invented screen. A rebuilt screen copies a real screenshot with real data.
- Delivery or wait times appear as the ranges in the truth sheet; fees and minimums that change stay out unless the owner fixes them. Truth sheet: ice-assets.
- A real app (named in the brief, or used as the field's reference brand): its real material only. Screens captured live from its store page, site or app, or rebuilt at 90 percent fidelity or better from those captures; colours and fonts read from its own site; the official logo untouched. Never guess its look; when the material cannot be obtained, the `ice-assets` skill decides what happens (`references/screen-capture.md` and `references/brand-authenticity.md`).
- The agent never logs in to the app. Screens behind a login come from the user's own recording or access offered in the stage 01 message; without it, use public pages, the store listing and the brand's published demo screens, and say so in the delivery note.
- Content inside a captured screen that belongs to others (cover art, artist or user photos, posts, names of real people, other brands' logos) is not the brand's material: replace it with the brand's published demo content, licensed content or neutral placeholders before the capture enters the film, and list it in the delivery note (ice-assets).

| App stage | What the screens may show |
|---|---|
| Live app with a build or a public store page | Real screens only, as above |
| Pre-launch, no build and no designs ("a new app" with nothing supplied) | No UI screens. Show the mechanism with real-world objects and places (the moment, the order arriving, the hand), or one concept screen labelled "Concept" on screen; whether designs exist is asked inside the stage 01 message (no answer: this row) |
| Pre-launch with design files from the user | The design files, labelled as a preview when the app is not public |

## Richness floor

Minimums the render must meet; measures, exempt shots and how to fix a thin frame: the `ice-motion` skill, `references/composition-and-staging.md` section 7. ice-qa measures them. "Premium" subtracts clutter, never these.

| Measure | Floor |
|---|---|
| `hero_share` | 40 percent in feature and result shots (a phone at 640-760 px wide in a 1080 x 1920 frame is about 45 percent); 30 percent in the everyday-moment shots |
| `hero_width` | 50 percent for the end-card name or store line |
| `frame_fill` | 12 of 16 cells |
| `empty_half` | 0 s (vertical: neither the top nor the bottom half is ever bare ground) |
| `depth_layers` | 3 (the moment's place behind, the hand or phone, a foreground crop or occluder) |
| `in_shot_motion` | 90 percent |
| `longest_still` | 0.6 s outside the CTA hold |
| `surface_detail` | yes in every shot |
| `light_events` | 1 per 10 s of runtime |
| `real_material` | 100 percent when the app or brand is real (live captures or rebuilds at 90 percent fidelity or better, the real logo); n/a only for a labelled pre-launch concept |

## QA thresholds

- Muted, would the first 2 seconds stop the thumb? The visual hook and the spoken hook say different things that complete each other.
- In a 1080-wide reel the phone screen is usually 640-760 px wide; push in on the part that matters.
- CTA readable at phone size at least 1.5 s (with store badges or link at least 3 s).
- A cold viewer names what the app does (`ice-qa/references/clarity-gate.md`).
- Platform safe zones respected (ice-engines).

## Deliverables

9:16 main, or the aspect the brief asks; 4:5 or 1:1 feed cut; 15 s and 6 s cutdowns with their own hooks (a 15 s master gets the 6 s cut only); per-language versions when asked; cover frame; captions file. Every version is planned at 03 in `ice/plan/versions.md`. See `../delivery.md`.

## Pointers

Device frames and real capture: ice-assets. Camera-follows-tap numbers: ice-motion. Dialect, bidi and Arabic captions: ice-arabic. Industry claim risks: `industry-spot.md`.

Sources: video-production-studio (Omar-Tnzxo), bangtutorial/bang-motion, echris6/motion-video-kit, alexgreensh/anidoodle, AbubakrChan/product-launch-motion, feitangyuan/onetake (ideas).
