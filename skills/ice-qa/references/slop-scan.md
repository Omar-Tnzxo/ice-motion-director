# Slop scan

The slop scan looks for the defaults an AI reaches for instead of deciding. Run it on the plan (storyboard and copy), on the composition source, and on the contact sheet of the render. A film containing a never-ship item is not finished: delete the element, do not justify it. Sources: motionmaxxing `slop.md` and `judgment.md` (Apache, wording kept where quoted), product-launch-motion, motion-video-kit, Barty-Bart, charlie947, bang-motion, text-to-lottie (MIT), hyperframes docs and skills (Apache), huashu-art-motion (MIT), herk-edit-kit (MIT), explainroo, video-ad-editor, founder skills; IDEAS_ONLY sources (imMamdouhaboammar, vibe-motion, PolyForm explainer sources) rewritten in our words.

## Contents
1. The 12 never-ship items
2. The 25 ranked slop patterns (N1-N25)
3. Default reaches and the second-order house style (plan check)
4. Banned defaults across sources, scoped
5. When a "tell" is right (conditions)
6. Copy tells
7. How to report

## 1. The 12 never-ship items

1. Page chrome or HUD: a brand or film name in a corner, tracked-caps labels, counters ("02 / SPEAK"), timecodes, BPM, FPS or resolution text, progress bars, corner brackets, scene labels over a shot.
2. Deck layouts: a held left-aligned headline block, a kicker above a headline, a title then content, header, body and footer, "headline left, device right".
3. Generic web-component UI: a rounded card with a status dot and "label . $value", a "Good morning" card, toolbar emoji, zinc greys, skeleton bars; invented names or numbers where the capture has real ones.
4. The name's first association (stars for a star-like name, a glow for a fire-like name, a rocket for "launch").
5. Invented stats and proof, stat walls, a stat slide (centred big number over a small label), on-screen disclaimers the rules do not require.

Never slop: a label or disclaimer the rules require ("Example data", "Illustration", "Concept screen", the unofficial-concept line, a required disclaimer from `ice/research/COMPLIANCE.md`), set as the ice-assets skill's `truth-sheet.md` section 9 ("How a required on-screen label is set") or section 12 says. It is exempt from items 1, 2 and 5, from N1, N2 and N21, and from text-density counts; one set in another form (a corner badge, tracked caps, a pill) is still item 1.
6. Slogan copy: triplets of one-word sentences, "Not just X. It's Y.", "Unlock", "Meet X", "the future of".
7. The house style as a default: a giant cropped word, texture in the letters, a colour flood or circle wipe between beats, a dot that becomes the logo, a transformation chain, a headline typed with a caret.
8. Flat swatch grounds per scene, or a small card on a void (a 0.3 W object for a 1 s read in empty ground).
9. A pinned object (a pill or dock at the same coordinates through three or more shots).
10. A web-footer ending: logo, tagline, button and URL, or an end card held past the type's limit (1.4 s for launch-style films; see `motion-density.md` section 4).
11. Self-certification: no delivery report, gates claimed without script numbers, "justified" fails.
12. A film you did not look at.

(motionmaxxing; item 10 scoped by film type in this repo.)

## 2. The 25 ranked slop patterns

Each row: pattern, how to detect it on the sheet or in the source, the professional alternative. N9, N22, N23 and N24 are folded into the type, motion and transition checks noted.

| ID | Pattern | Detect | Instead |
|---|---|---|---|
| N1 | Corner chrome: tracked-caps names, counters, timecodes, BPM, brackets | Text under 0.04 H in the outer 14% band repeating on 3+ frames; uppercase with positive tracking; class names like hud, kicker, eyebrow, header, footer, meta, counter, progress, bracket | Nothing. The frame is the claim, the product, the logo once |
| N2 | Chapter or scene counter, a progress hairline | Digits plus slash or dash plus word; "chapter, scene, act, step N" | A ground change plus a carried object, never a label |
| N3 | Deck layout: left headline with sub-line, kicker, title top-left with content below | A text block with ink-left x < 0.2 and a smaller text under or over it | One centred line at y 0.52-0.54, or a split phrase whose far half is an object |
| N4 | Flat swatch ground per scene | Sample 9 points; under 6% luma range = flat; more than 3 distinct grounds in a film = deck | A surface from the capture (plate, screen, material, light) per act; flat only for a flood or dive under 1 s |
| N5 | Generic UI card as proof (white rounded card, three-circle toolbar, send arrow, tweet card, calendar) | A rounded rectangle with 3 identical small icons and no brand-specific detail | A magnified fragment of the captured UI with its real icon, sender, time and sentence, cropped by the frame edge |
| N6 | Feature tour: card plus caption x N, equal beats, caption at the same y | 3+ frames with the same layout at the same coordinates and different words | One proof, one object per frame; unequal beats that shorten then linger |
| N7 | Stat slide or stat wall | A 22-33% H number with a smaller label under it, centred, on a flat ground; count-up followed by a label | The number is the claim only inside a physical beat (a counter tied to the control that causes it); otherwise show the thing |
| N8 | Pinned element through 3+ shots | The same small object at the same x,y in 3+ consecutive frames | A carrier that moves, scales or changes role at every seam |
| N9 | Letter-typed headline with a caret | A caret in frames 0-2 on a headline; typing on a non-input element | Words arrive whole on the speech rhythm; typing only in the product's own input (ice-type skill) |
| N10 | Technique showreel: a new effect every beat, no motif | Adjacent frames share nothing; more than 4 unrelated canvas or SVG generators | One idea and only the effects it needs |
| N11 | Premium pastiche: near-black ground, ember or gold glow, vignette, lens flare | Radial brightness falloff to corners; warm halo behind the logo | A halo only at an event; the brand's real surface; light with a source |
| N12 | Serif-italic accent word inside a sans line | One italic serif word in a caption | One family; scale carries emphasis; a serif only if it is the brand's heading face |
| N13 | Tracked-caps tagline | Wide-spaced small caps | No tagline |
| N14 | End card = logo + tagline + CTA pill + URL | The last frame has more than 2 text groups | The name on the voice or one hard slam, short hold, mid-motion |
| N15 | Giant single word as a slide | One word over 0.3 H on a flat ground, no object | Spend scale once and give the word a surface or a physical cause |
| N16 | 3D tilt, 3D chart, orbits around a flat card | A perspective-skewed card; red 3D bars; a 3D import with no scene reason | A cropped held-pose device, a stepped 2D camera, or real 3D when the idea is physical |
| N17 | Invented proof or placeholder UI when real assets exist | Any person name, number or UI label not in the truth sheet or brief | Captured copy and screens; illustrative items declared in the delivery report |
| N18 | Brand = hex + font only: captured photos, signature graphic and real UI unused | Captured media files not referenced by the composition (a test film used 0 of 9) | Build the ground and the proof from the capture |
| N19 | Name-literal idea | Is the idea the dictionary meaning of the name? | One true feature or user moment from the brand inventory |
| N20 | Ghost decoratives: giant words at 3-9% opacity, hairline rules, grid patterns, grain as "depth" | Faint large text or lines behind content; opacity 0.03-0.09 on large text; 1 px rules; repeating gradients | None; texture only as a surface from the capture |
| N21 | Label chips naming the scene ("Messages", "Mail", "Editor") | Small text at x < 0.2, y < 0.14 on each UI shot | The UI shows which app it is; no caption |
| N22 | Uniform stagger: the same small slide-in (about 24 px, 4-6 px blur, 40-80 ms) on every text | Every entry with the same distance and equal gaps | Uneven gaps, a curve per role (ice-motion skill) |
| N23 | Hold-and-swap: each text held 1.2 s+ then replaced; frozen holds | `still.txt` stretches over 0.6 s | One living thing on every held frame; true holds only after a payoff (scoped, see `motion-density.md`) |
| N24 | Crossfade or dissolve between scenes, captions or cards | A frame showing two texts or two cards blended; scene-level opacity tweens | A hard cut mid-motion with a matched object, where the type's transition policy asks for it |
| N25 | Metronome sound plus self-certification | A printed BPM in the picture; no delivery report; a "CLEAN" lint on a film with under 5% pixel change | One to three hand-synced hits and designed silence; a mandatory report quoting script numbers |

## 3. Default reaches and the second-order house style (run on the plan)

Twelve reaches, each with its plan question:
1. Making a page instead of staging a picture: would this frame work as a slide or a website hero?
2. Showing everything with equal weight: what is the one true thing; which features did I leave out on purpose?
3. States instead of events: does the plan say what moves and what it causes, or only what is shown?
4. Premium pastiche (near-black, radial glow, gold spark, serif-italic word, tracked small caps; six of ten AI films sat on near-black, under a third of designer films did and almost half were bright).
5. Production metadata as decoration.
6. Filling holes with invented proof: did I open the captured screens and media first?
7. The first association of the name ("launch" gets a rocket, security gets a shield).
8. Effects standing in for quality: a new technique every beat to show range.
9. A script with illustrations: words first, a picture under each sentence (keep the writer: the copy is often the best part).
10. Sound as wallpaper: a fixed loop at a flat level, an onset every half second, no silence, no build; or silence by default.
11. The ending as a web footer: did the logo arrive by cause, is the ending smaller than the climax, is it short?
12. Minimalism as a hiding place: is more than a third of the film nearly still; where is the frame someone would screenshot?

Second-order house style (the "designed" default, measured in a 21-direction study: giant cropped word 20 of 21, material inside the letters 17, flood or circle wipe 19, dot-to-logo 11, a lockup built from the film's motif 21; eight brands read as one designer's reel in eight colourways): a giant word cropped off the frame edge in every film; a repeated-word marquee band; texture or video filling the letters; a colour flood or circle wipe between every beat; a dot that becomes the logo's dot; a lockup built from the motif; a text strip between rows of texture; everything moving all the time with holds forbidden; every film a chain of "X becomes Y becomes the logo". As proof of effort it is the new slop.

Self-check: would this pass the competitor swap (`identity-tests.md`), or is it the same film I would make for another brand? Which choices did I decide, and which did I reach for? Removing tells without adding substance gives clean, hollow films that lose to a plain film built on the brand's own material.

## 4. Banned defaults across sources, scoped

| Default | Status | Scope and source |
|---|---|---|
| Purple-to-blue or blue-purple gradient grounds, deep purple starfields, neon cyan-purple | Fail (machine gate in `anti-sameness-gates.md`) unless the brief names those colours | All film types (huashu, Barty-Bart, charlie947, video-ad-editor, hyperframes docs, founder skills, claude-code-video-toolkit) |
| Bouncy, elastic or back easing; continuous overshoot | Fail outside the one allowed spring per film | All types except playful character animation and logo stings whose motion personality calls for it (ice-motion skill) |
| Glow, bloom and neon on type and UI chrome; gradients on text | Fail unless the brand's own material | All types; brand bans hold in every medium: "a spotlight that reads as a glow is a glow" (founder skills) |
| Particle bursts, confetti, generic particle systems, sparkles, orbs, lens flares | Fail unless a named event needs them | All types; audio-reactive films never add equalizer bars, spectrum analyzers, waveform displays, note clip-art, rainbow cycling, white strobes on beats (hyperframes) |
| Typewriter headlines | Fail; typing only inside the product's own input | All types; always banned for Arabic (founder skills, ice-arabic skill) |
| Emoji as icons, stock icons, clip-art (shield, trophy, rocket, lightbulb), mismatched icon strokes | Fail | All types |
| AI symbols for "the product thinks" (glowing brains, neural nets, robots, sparkles, scrambled glyphs) | Fail; show an object from the customer's world | All types (motionmaxxing, founder skills) |
| Idle sine loops as sustained motion (breathe, float, drift, glow pulse) | Fail as a primary verb or to hide a static slide | Product launch, explainer, UI walkthrough, social short (hyperframes motion doctrine, founder skills). Exception: painted and crayon art films where line boil or idle life is the medium's own motion (reelmimic engines, ice-styles skill) |
| Glassmorphism, frosted glass panels | Fail as default "premium" | Allowed only in a SaaS product launch whose brand system uses glass (charlie947 launch recipe vs imMamdouhaboammar anti-slop list; scoped) |
| Fake HUD overlays, fake dashboards, fake video player chrome (progress bar, play button, timecode around a clip) | Fail | All types (vibe-motion idea, PolyForm idea, founder skills) |
| Dark or noisy backgrounds when the brand is light; small objects floating in empty space; grey placeholder bars | Fail | All types (charlie947, herk-edit-kit "small UI floating in empty space is the fastest AI edit tell") |
| Same ease, same speed, same entrance direction on every element | Fail | All types (hyperframes creative: at most 2 independent tweens with the same ease per scene; the slowest scene about 3x slower than the fastest) |
| Default-look fonts (the list, with the families flagged only as display faces) | Fail when `ice/DIRECTION.md` has no D-entry reason of an allowed kind | All types; list and allowed reasons: the `ice-direction` skill, `references/type-pairing.md` section 5. |
| Identical card grids, left-edge accent stripes, everything centred with equal weight, pure #000 or #fff | Question | All types (hyperframes house style: "the goal is intentionality, not avoidance") |
| Visible repeating geometric transition patterns (tile grids, hex cells, uniform dot arrays) | Fail | All types; organic noise transitions are fine (hyperframes) |
| Glitch on every text element, RGB split everywhere | Fail; one film went from 102 glitches to 21 after the user objected | All types; glitch only when on-brand, localized, at most about 6 frames (PolyForm ideas, motionmaxxing) |
| Ken Burns as the only motion on photos | Fail | Explainers and edits (bang-motion; founder skills) |

## 5. When a "tell" is right

| Tell | Works when |
|---|---|
| Typewriter with caret | The product is something you type into, or the caret becomes something (a divider, a letter of the logo); never as a reveal style on every line or a headline |
| Centred still end card | It follows sustained motion and echoes the opening; the logo arrived by cause; short |
| Soft gradient or glow | It is the brand's own material, a named object with a job, or one light source that changes with the mood. Glow limits: the `ice-motion` skill, `references/composition-and-staging.md` section 6 |
| Serif in a sans film | The brand's own face, or a deliberate second voice used rarely and large |
| Dissolve or blur | It copies a real gesture (focus pull, scroll, whip) with a direction, or the dissolve is the meaning; calm brands may fade |
| Hard colour flips | The colour change is the story beat and an object carries across the cut |
| Slide grammar | Paced to a voice at speech rate, type never changes position, a second visual voice adds wit; never as a page |
| Mostly empty frame | Conditions: the `ice-motion` skill, `references/composition-and-staging.md` section 2 (conflict note) |
| A number counting up | The number is the real offer and its size is the point, tied to a cause |
| Template moves | Deliberate quotation (satire: bland visuals against loaded copy) |
| Low frame rate, no blur | Used consistently as a chosen texture |
| Monospace headline | It does a job (reads like a bill or a log) and gives way to the brand font when the product arrives |
| Fade to black, a calm ending | The brand is calm and the film breathes throughout (22 of 51 gold films end calmly) |
| Giant cropped word | The idea wants that word huge, it arrives once with a cause, and scale is not spent again |
| Dot-to-logo, motif lockup, chain | It is this brand's idea (its mark really is that shape) and each link is true |
| 3D or tilted UI | The idea is physical, or a cropped held-pose device; never a tilted card as "depth" |
| Page chrome | Never |

Nothing here is a rule you pass: with a better reason you have a better film, but say the reason in one sentence about this brand (motionmaxxing). The skill's own defaults are options, not the house style: arrival from oversize, the carrier object and the built-from-parts logo become slop when every film uses them.

## 6. Copy tells (run on the script and every on-screen line)

- "Not just X. It's Y." and "More than X, it's Y."; triplets of one-word sentences; "Unlock your potential", "Meet X", "Introducing the future of", "superpowers", "seamless", "effortless", "reimagined", "all-in-one", "Revolutionize"; "Learn more" or "Get started free" as the last line; a chain of puns on the brand name; invented numbers, users, testimonials; a line that could be pasted into any other launch film unchanged (motionmaxxing, founder skills).
- Slogans and punchlines, "not X, but Y" twists, colon reveals, chains of three short sentences, filler words ("just", "simply", "really", "actually"), telling the viewer obvious things ("Let's dive in", "Stay tuned"); dash characters between phrases (explainroo).
- Reveal-declaratives ("Nobody signed these"), fake-candid openers ("Here's the trick"), restating what the demo proved, editorializing qualifiers; anything that fails the deletion test (vox-explainer).
- Unverified superlatives (cheapest, best, number one, certified, fresh daily) unless the owner approved the exact words; a time range from the source never rounded into a promise (founder skills).
- Triple adjectives in one phrase; on-screen disclaimers that no law or platform requires.
- In Arabic dialect films, translated formal phrases that do not belong to the dialect; dialect rules are owned by the ice-arabic skill.
- Title Case benefit lists read as a template; sentence case with a full stop reads as a person (motionmaxxing). A full stop after every two-word headline reads stiff (bang-motion). Write like the brand speaks, then cut half; an official launch line verbatim beats a stock one.

## 7. How to report

Write `ice/review/slop-scan.md`: one line per hit with ID, timecode or plan row, evidence (frame path or source line), and the instead-action. A hit on sections 1-2 is a blocker; a section 4 "question" needs a one-sentence reason in `ice/DIRECTION.md` or it becomes a blocker. Structural slop to also name: equal-emphasis frames, card soup, a scene sampler, layout repetition, a busy ending; typography slop: everything in the heaviest weight, transcript wallpaper, font-demo features, narrow headline walls, accidental crops; material slop: default fake premium, texture as dirt, inconsistent shadows, mixed asset worlds; review slop: vague notes, redesign disguised as polish, endless polishing (imMamdouhaboammar, rewritten). Final subtraction: remove any effect that does not improve meaning, hierarchy, continuity, material, emotion or brand; technical difficulty is not a reason to keep it.
