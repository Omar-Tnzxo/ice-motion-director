# Motion language by film type, edit type, industry and brand

The scope hub. Every scoped rule in this skill is summarized here by type so a workflow can set the motion language in one pass. Type names follow the type lists in the ice-film workflow's `SKILL.md` section 4 and the ice-edit workflow's `SKILL.md` section 2; the full type files (structure, sound, text density, QA thresholds) live in the ice-film and ice-edit workflows. These are defaults when the brief is silent: the brief and the direction log override them, with the reason logged.

## Contents
1. Film types
2. Edit types and explainers
3. Industry personality presets
4. Brand personality presets (marks and stings)
5. Arabic and right-to-left motion (pointer)

## 1. Film types

| Type | Hold policy | Transitions | Camera | Overshoot | Clock and blur | Pace |
|---|---|---|---|---|---|---|
| Product launch | A (alive) or D (no idle, narrated) | Cut on motion, carried object; no crossfades; 1-2 designed accents | With intent: push before the cursor, still on the click, pull-backs reveal scale | Tiny; one visible spring per film | 30 or 60 fps; smear or shutter | Beats 3-7 s; strongest frame at 60-75 percent; end hold 0.6-1.4 s |
| App ad | A or D | Container morph, hand carry, one-shape morph | Zoom so each state fills the frame | Tiny; press rebound about +5 percent | 60 fps for fast UI | Something on every beat; CTA at most 25 percent |
| Brand film | C (true still as punctuation) or A, calm | Crossfade and slow dissolve allowed if calm; match cuts | Slow steady dolly, slow drift or locked; no shake | None to tiny | 24 fps filmic; shutter | Contrast of long holds and few bursts; may end calmly |
| Logo sting | A tail or a designed still 0.5-0.67 s after the settle | Mark arrives by cause; mask, draw-on, assemble, crash-in | Locked or one push | By brand personality (section 4) | 30-60 fps | 2-5 s; lockup hold 0.6-1.4 s (calm marks up to about 2.5 s settle) |
| Kinetic type | C rests between bursts, or A | Hard cuts on beat, waterfall cuts, fill zoom, bands | Follows beats and accents; micro-drift | Slam spring about 8 percent on hero words | 30 fps; smear | Word onsets 2-12 frames apart; beat spacing 1.2-1.8 s for slams |
| Data story | B (camera only) or C; numbers settle and hold at least 0.5 s | Hard cuts keeping layout; morph only between the same metric; zoom-through into a detail | Hold while a chart grows; slow push about 1 s on a named point | None (data never overshoots) | 30 fps; crisp | Staged builds of 0.5-1.3 s per stage |
| Social short | A | Cut on motion, whip, cut-the-curve | Hook density not managed in the first 3 s | Tiny | 30 fps | Hook motion in the first 0.5 s; 9:16 layout re-composed, never cropped |
| Hype promo | A, with bursts | Cut on beat, whips, flash only with cause, strobe for breadth | Punches and slams counted but frequent | One spring or playful | 60 fps; smear | Big events every 0.66-0.83 s; a 1 s rest every 7-8 s |
| UI walkthrough | D (no idle) | Camera is the editor; container replacement; no plain cuts | Locked during typing and streaming; zoom to clicks | None to tiny | 30 or 60 fps; crisp | Reading holds after each result about 0.5 s; one close-up per operation |
| Music video | C rests and A sections | Beat-locked cuts, J and L cuts, regime changes on drops | Verse slow push and drift, chorus faster, interlude pull out; at most one camera move per phrase | By style | Constant-interval cuts allowed | A readable word holds at least one beat; hits at 0 ms |
| Art film | A (the painting stays alive: one main action plus 2 motif loops) | The next style's own physical process (melt, light, page turn) | May drift slowly | By style | Style clock (on twos for drawn) | One style and palette to the last frame |
| Industry spot (business commercial) | A with at most about 1 s frozen per 30 s | Carried object, foreground fly-through, request-picker-confirmation for services | Lead subject 60-85 percent of the frame | Tiny | 60 fps master for motion work | 12-15 compositions per 30 s, beats 1.4-3.5 s; CTA readable at phone size at least 1.5 s |

## 2. Edit types and explainers

| Type | Hold policy | Transitions | Camera | Notes |
|---|---|---|---|---|
| Explainer (ice-explainer) | B (camera-only life; elements dead still after landing) | Hard cuts on sentence punctuation dominate; designed transitions every 4-7 s; carry within a diagram | Manage pushes; glides free; push to read, pull out after | One subject per beat with demote-in-place; something changes every 2-4 s; one example carries the whole film |
| Long-form | B | Hard cuts, J and L cuts; 2-3 effect transitions per film | Fixed crop per shot | Graphics 3-10 s with at least 2 s of face between |
| Podcast | B | Cuts on speaker change | Fixed crops, zoom cycles locked per segment | Layout changes 2-4 per minute, only on new arguments |
| Talking-head ad | B, face first | Cuts; graphics land on the spoken word | Calm: zoom 1.00-1.06, no change before 4 s, at most 6 changes per 30 s; hyper: layout switch every 1.5-2 s | Motion in the first second (a static first frame scrolls away); face safe zone never covered |
| Shorts and reels | A | Fast cuts, one topic per short | Faster cuts, quick real-face shots | Split rather than compress long sources |
| B-roll overlay | B | Full cutaways or transparent panels; graphics land on spoken words | Pinned to content coordinates | Final graphic clears before the video ends; alpha exports via ice-engines |
| Showreel | A | Cut on motion, velocity-matched whips naming the matching tween | Camera never sleeps | Scenes 1.0-2.0 s; new element every 0.3-0.6 s; hold logo 1.5-2 s |
| News reel (edit type `news-reel`) | A, carried by inner events on one take | Hard cuts mostly; broadcast seams with their meanings (`cut-catalog.md` section 13) | Digital camera on one take, 15.8-27.8 moves per minute, face-anchored (`camera.md` section 8) | Broadcast settle curves (`springs-and-curves.md` section 7); package moves (`atomic-moves.md` section 7); pacing against the reference; style family `family-broadcast-news.md` |

## 3. Industry personality presets

Durations in ms (tap / instant / quick / fast / normal / slow / extra slow); springs as visual duration ms / bounce (snap, glide, land); stagger step / cap ms. Take the more conservative preset when two apply. Safety, money and health always win over playfulness. Glanceable contexts get fewer, calmer motions.

| Category | Durations | Curve | Springs | Stagger | Metaphor and don'ts |
|---|---|---|---|---|---|
| Gaming, esports | 90/120/180/250/400/600/800 | (0.23,1,0.32,1); panels (0.32,0.72,0,1) | 260/0, 340/0.12, 400/0.15 | 50 / 400 | Slam in, land exactly, leave faster; no neon glows, glass, RGB gradients or wobbly bounces |
| Fintech, banking | 100/140/200/260/360/520/700 | (0.2,0,0,1) | 280/0, 360/0, 420/0.05 | 40 / 300 | A precise instrument in a calm room; no confetti on payments, no bouncy numbers, no slot-machine digit rolls on balances |
| Healthcare | 100/160/220/300/420/600/800 | (0.25,0.1,0.25,1) | 320/0, 400/0, 480/0.05 | 40 / 240 | Never more than 3 flashes per second; no shakes; no celebration around diagnoses or results |
| Kids, education | 100/150/220/320/480/700/1000 | soft back (0.34,1.3,0.64,1), emphasized (0.34,1.56,0.64,1) | 300/0.2, 400/0.3, 500/0.35 | 70 / 600 | Playful overshoot allowed; no dark patterns, no punishing shakes |
| Luxury, fashion | 120/200/300/450/700/1000/1400 | expo out (0.16,1,0.3,1), in-out (0.65,0,0.35,1) | 500/0, 700/0, 800/0.05 | 80 / 640 | An editorial magazine spread; clip-path image reveals; no bouncy springs, no wiggling badges, no spinners on the storefront |
| E-commerce, retail | 90/120/180/240/360/520/700 | quint out (0.22,1,0.36,1) | 260/0.05, 320/0.15, 400/0.2 | 40 / 320 | Nothing that slows checkout; no fake scarcity timers |
| SaaS, developer tools | 80/100/150/200/300/450/600 | (0.2,0,0,1) | 220/0, 280/0, 340/0.08 | 30 / 200 | Speed is the feature; no bounce, no decorative in-app hero motion |
| Media, streaming | 100/150/220/320/500/750/1000 | quint out (0.22,1,0.36,1) | 320/0, 420/0.08, 500/0.1 | 50 / 400 | Focus scale 1.05-1.1 over 150-200 ms; never animate layout over video or motion over subtitles |
| Social, creator | 80/120/180/260/380/560/800 | quint out (0.22,1,0.36,1) | 260/0.1, 340/0.2, 420/0.25 | 40 / 320 | No endless engagement loops, no shaking notifications |
| Travel, hospitality | 100/150/220/300/450/650/900 | quart out (0.25,1,0.5,1) | 320/0.05, 400/0.1, 480/0.12 | 60 / 480 | No heavy parallax, no price countdown pressure |
| Food delivery | 80/120/180/240/360/520/800 | quint out (0.22,1,0.36,1) | 240/0.1, 320/0.2, 400/0.25 | 40 / 320 | A warm kitchen pass: quick, appetizing, rewarding; no jumpy map markers, no celebration when an order is late |
| Real estate | 100/150/220/320/480/700/1000 | quart out (0.25,1,0.5,1) | 340/0, 420/0.05, 500/0.08 | 60 / 420 | No bouncy springs, no spinning 3D logos |
| Fitness, sports | 80/110/160/220/340/500/800 | broadcast out (0.23,1,0.32,1) | 220/0.1, 300/0.2, 380/0.25 | 40 / 320 | No celebrations covering the timer, no shame motion |
| Government, public | 100/120/160/200/250/300/400 | standard (0.4,0,0.2,1) for everything | 240/0, 280/0, 320/0 (no bounce) | none | No decorative motion, no hold to confirm |
| Crypto, web3 | 80/110/160/220/320/480/700 | (0.2,0,0,1) | 220/0, 300/0.05, 360/0.1 | 30 / 240 | Price flashes under 300 ms with colour plus an arrow, never colour only; no hype glow, no slot-machine numbers |
| AI products | 90/130/200/280/420/640/900 | (0.32,0.72,0,1) | 300/0, 380/0.08, 460/0.1 | 30 / 300 | Honest thinking states, not an endless shimmer; no glowing orbs or purple gradients by reflex |
| Productivity | 70/100/140/200/280/400/560 | (0.2,0,0,1) | 200/0, 260/0.05, 320/0.1 | 25 / 200 | No confetti on every completed task |
| Automotive | 100/150/200/280/400/600/800 | (0.2,0,0,1) | 300/0, 380/0, 440/0.05 | none | Crossfades between pages; no staggers, parallax or loops in UI while driving |

Unknown category: a neutral preset (quick, damped, small travel).

Write the chosen personality as one metaphor plus 3 to 5 rules, derived from the brief and logged in `ice/DIRECTION.md` (`motion-grammar.md` section 8). Never reuse a metaphor from these tables or from an earlier project word for word.

Films and marketing sites for a category use the category preset plus longer brand moments in the hero. Do not encode the topic into motion style by cliche (slower easing because the topic is cultural, bounce because the topic is entertainment): energy level controls entrance force and density, the brand and brief control character.

## 4. Brand personality presets (marks and stings)

Locate the brand on two axes, energy (low: calm, premium, institutional; high: sporty, startup, entertainment) and tone (serious to playful). Read the mark itself for evidence: sharp geometric forms point to engineered, serious motion; organic curves to flowing motion; rounded shapes and bright colors to soft, playful motion. User-stated brand words override visual inference.

| Principle | Low energy | High energy |
|---|---|---|
| Squash and stretch | 0-10 percent | 20-40 percent |
| Anticipation | 50-100 ms | 150-300 ms |
| Part timing | 400-800 ms | 100-250 ms |
| Exaggeration | 0-15 percent | 25-50 percent |
| Follow-through | Extended soft settle | Quick bounce |

| Principle | Serious | Playful |
|---|---|---|
| Arcs | Direct, near-linear paths | Curved, bouncy paths |
| Secondary action | Minimal (shadow, fade) | Abundant (sparkle, ripple) |
| Squash and stretch | Replaced with plain scale | Embraced |
| Appeal style | Clean, geometric | Round, organic |

Pick the closest preset, then adjust from the axes. "Source placement" lists where the source put each preset; it is a starting point, and the brief and the industry preset (section 3) decide.

| Personality | Source placement | Duration | Entrance | Settle | Squash | Overshoot | Emphasize | Avoid |
|---|---|---|---|---|---|---|---|---|
| Playful, joyful | Consumer apps, kids, social | About 900 ms (loops 1.5-2 s) | (0.34,1.56,0.64,1) | (0.22,1,0.36,1) | About 18 percent | 1.08 | Squash and stretch, exaggeration, secondary action | Long anticipation |
| Elegant, premium | Luxury, fashion, hospitality | About 1600 ms | (0.4,0,0.6,1), symmetric extended | (0.16,1,0.3,1) | 0 | 1.02 or none | Slow timing, staging, long graceful arcs, restraint; fades and mask wipes over movement | Bounce, squash, fast cuts |
| Trustworthy, professional | Fintech, enterprise, B2B, healthcare | About 700 ms | (0,0,0.2,1) confident ease-out | (0.4,0,0.2,1) | 0 | 1.0 (lands exactly) | Smooth slow in and out, consistent timing, one easing family everywhere | Overshoot, randomness, secondary flourishes |
| Energetic, bold | Sports, gaming, startups, media | About 600 ms | (0.16,1,0.3,1) explosive out | (0.34,1.56,0.64,1) | About 25 percent | 1.12 | Fast timing, exaggeration, strong anticipation (coil before release), impact frames | Slow fades, symmetric easing |
| Calm, caring | Wellness, meditation, education | About 1400 ms (breathing loops 3-4 s) | Ease-in-out | (0.4,0,0.6,1) | About 4 percent | 1.0 | Symmetric oscillation, arcs, gentle staging; opacity and blur over translation | Anything sudden; keep amplitudes small |
| Friendly, approachable | Small business, community, services | About 850 ms | (0.25,0.46,0.45,0.94) | (0.22,1,0.36,1) | About 8 percent | 1.04 | Middle of every axis: soft deformation, moderate timing, one gentle secondary action | |

The same values drive the reveal, loop and hover variants of one mark: one brand, one motion voice.

Usage context bands for marks: splash or intro 1.2-2 s; header reveal 0.3-0.8 s; hover 0.15-0.3 s (ease-out only, returning to the exact rest state); loading or idle loops 1.5-4 s per cycle; attention shake about 0.4 s once. A 2 s splash that plays on every route change is a bug. Sanity check: describe the result in three words and compare with the brief; if a competitor's logo could wear the same motion unchanged, push one principle further toward the personality; shown without the product around it, the motion must still read as this brand. Logo vector preparation and the final-frame contract: ice-lottie.

Arab-market culture note: premium and trustworthy brands (banking, government, real estate) are expected to be calm and polished; playful bounce reads as cheap there faster than in some other markets. Seasonal themes stay optional, short and respectful (no religious symbols as confetti).

## 5. Arabic and right-to-left motion (pointer)

Motion direction rules for Arabic and mixed films (fills, wipes, slides and sweeps follow the reading direction; timelines, numbers, clocks and chart time axes never mirror; never animate Arabic text per letter; per word or per line only; masks must not clip the longer vertical extents) are owned by the ice-arabic skill. This skill's direction rules (the current, wipe direction, forward navigation toward the inline end) are written in reading-direction terms so they mirror correctly.

Sources: motion-interaction-studio (personality-by-industry, motion-tokens presets), pixel2motion (motion personality, twelve principles for logos), huashu-art-motion (camera by grammar), video-ad-editor (talking-head pace), hyperframes skills and docs, motionmaxxing, motion-video-kit, product-launch-motion, herk-edit-kit, ideas from video-talkcraft, vibe-motion (rewritten); commercial-motion-design (founder).
