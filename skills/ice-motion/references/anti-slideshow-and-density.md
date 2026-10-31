# Anti-slideshow rules and motion density

The most common failure of code-made films is a slideshow: animated website sections that enter once and freeze. This file owns the motion-side diagnosis and the density targets. The scripted gates that measure them (frozen time, dead air, frame difference, page-chrome lint) belong to the ice-qa skill; the visual anti-slop catalog (palette, fonts, chrome) belongs to ice-direction.

## 1. The failure modes

| Failure | What it looks like | Fix |
|---|---|---|
| Slideshow (dump, then freeze) | Everything enters in the first quarter of the scene, then holds; time becomes pagination | Sequential reveals across the later half, timed to the voice or the beat; something crosses the boundary |
| Screensaver | Everything drifts independently forever (breathing, floating, pulsing) | One motivated movement; idle loops are never the primary verb |
| Uniform energy | Every scene the same speed, same entrance, same duration | Contrast: bursts and rests, fast and slow, dense and isolated |
| Independent scenes | Unrelated reveals in sequence; nothing survives a boundary | One persistent actor or carried object (see `seams-and-carry.md`) |
| States instead of events | Things fade or rise in and hold; the plan says what is shown, not what happens | Write what moves and what it causes |
| Page layout | Fixed heading, subtitle, centred cards or grid, ambient particles, entrance, static hold, exit | Stage a picture, not a page; three or more scenes sharing this template means redesign the story |
| Technique showreel | A new effect every beat (morph, particle cube, ribbon, glitch, orbit rings) | One idea and only the effects it needs |
| Bad motion over no motion | A lazy breathing or back-half slow pan that fights the sightline | "No motion is better than bad motion" in UI and narrated launch films |

Four causes of the slideshow look in narrated films: no camera layer, elements dead after entering, hard page flips between scenes, document layout with accumulation (idea, rewritten).

## 2. The web-section test (per scene)

From the founder's commercial-motion-design skill (creative-director QA). For each scene answer yes or no:
- Is a heading parked at the top while a separate card or grid moves?
- Are most elements already visible near the start?
- Could the frame be exported as a landing-page hero with little loss?
- Is the primary action only an entrance, loop, or exit?
- Does the scene disappear because of a timer rather than causing the next scene?

Three yes answers fail the scene. If three or more primary scenes fail, reject the creative candidate. The source-code side of this test is automated by `scripts/audit_web_section_motion.py <project folder>` (exit 1 = animated web sections; a heuristic, the rendered review remains mandatory). The slide test (motionmaxxing): cover all text; if more than half the frames are a flat colour with a card or a block on it, it is a deck. Fix the picture, not the type.

## 3. Rhythm and variation

| Rule | Value | Scope |
|---|---|---|
| Shot length variation | lengths vary by at least 4x (for example short word hits next to long holds); coefficient of variation at least 0.25 | Launch, kinetic, hype, social, brand film (idea, rewritten) |
| Bursts | at least one burst (3 or more big changes within 1.5 s), not at a regular interval, if the reference genre has hits | Music-led and launch films |
| Never cut on a metronome | equal shots read as slides even when each shot moves | All except a deliberate technical ident or a beat-grid montage |
| Never end two shots the same way in a row | alternate spring-out, blur-out, hard cut | All |
| Something new | something changes every 2-4 s (a new element, an arrow, a highlight); a new visual element at least every 3 s (90 frames at 30 fps) | Explainer, talking-head, social; calm brand films may run longer with a designed stillness |
| Beat length | 3-7 s per beat in launch films (never above about 7.5 s); add beats rather than stretching; type-only hook 2-3 s | Product launch, app ad |
| Shot length | 2-6 s per shot, up to 8 s for individual shots | Explainers |
| Showreel pace | 1.5-4 s per idea, hard cuts, overlapping entrances | Showreel, hype |
| Kinetic density | big visual events every 0.66-0.83 s (about one per beat at 99-105 BPM); new element every 0.3-0.6 s (measured kinetic type: median gap 0.33 s, 1.6 visual events per s, `ice-film` skill, `references/genres/kinetic-type.md`); every 7-8 s of density give a 1 s rest beat | Kinetic type, music video, hype |
| Scene length ceiling | 5 s per scene unless there is a named reason (hero hold, cinematic push, long counter, a one-take or slow-reveal style, or the reference's longest scene). A single take may run much longer in any type when inner events carry it: a single take over about 8 s gets a visible change every 3 to 5 s (`camera.md` section 1, long takes), within the reference's longest gap and event density when there is one (the `ice-qa` skill, `references/motion-density.md`, "Pacing against the reference"). The news reel is the measured case (edit type `news-reel`, style family `family-broadcast-news.md`): a presenter hold of 10-34 s on one take, a camera move, graphic in or out, or flash at least every 2-5 s; B-roll shots 2-4 s; archive bursts of 0.3-0.5 s cuts | Social reel, launch teaser; long takes as scoped |
| Scene counts | social reel 9:16 10-15 s with 5-7 scenes; launch teaser 16:9 15-25 s with 7-10; product explainer 30-60 s with 10-18; cinematic title 45-90 s with 7-12; about 12-15 compositions per 30 s for energetic business ads | Starting points |

Energy curve: put the single strongest frame at about 60-75 percent of the film; beats shorten, entrances travel less and cadences tighten toward it; two or three high-energy peaks separated by quieter braking moments; the final beat is the shortest transition and the longest lingering object. Tempo shape for teaching films: slow, medium, fast (climax), slow (conclusion). Include one clear acceleration or deceleration and one breath; a film at one even speed has failed, unless an even tempo is the chosen style's declared medium (illustration only: an ambient loop, a locked-camera tableau) or the reference measures it.

## 4. Density targets (as questions, scoped)

These are targets the motion plan aims for; ice-qa measures them on the render. The per-type minimums for life inside the shot (`in_shot_motion`, `longest_still`) and for frame fullness live in the richness floor: `composition-and-staging.md` section 7 for the measures, the film-type file's "Richness floor" table for the numbers.

| Measure | Target | Scope |
|---|---|---|
| Frozen screen | at most about 1 s per 30 s; no hold over about 0.6 s except the CTA | Business commercial, industry spot, energetic launch |
| Still frames | at least about 25 percent dead still and at least one quiet stretch of 1 s or more | Calm minimal product films, brand film (idea, rewritten) |
| Dead air | nothing still longer than about 1 s unintentionally; something visibly changes every second | Drawn films, loops. Kinetic type: a landed line holds still for its reading time (median 1.0 s); the longest gap without an event stays at 6.2 s or less (measured median 3.1 s, `ice-film` skill, `references/genres/kinetic-type.md`) |
| Low-change interval before the CTA | at most 0.75 s unless a musical rest and a narrative reason are documented | Music-synced commercials (idea, rewritten) |
| Event density per beat | largest gap between authored events at most 3 s; a still run over 3 s is a planning bug | Collage explainers |
| Human motion band | mean frame-to-frame luma change median 6.8 (IQR 4.4-9.8) for whole human films: a question, never a gate; above about 10 ask whether the film breathes anywhere, below about 3 ask whether it exists | All, as a diagnostic |
| Final second | a frozen final second encodes far smaller than a moving one (211 KB vs 2.5 MB measured): a cheap-motion tell to look for | Policy A films |

Density comes from hierarchy: one primary camera or object move, supporting staggers on cards and labels, fine tertiary detail, all overlapping; do not start and stop the whole frame on every beat. "Subtle reads as static at 30 fps: err toward more movement than feels safe" holds for decorative-light commercial films; it does not license idle wobble (see `holds-and-stillness.md`).

## 5. Spending rules

- Effects, camera moves and staggers never compensate for weak layout or missing evidence: revise the composition first.
- Technical polish (3D, 60 fps, 4K, strong music) cannot rescue missing semantic motion.
- Spend scale once, colour floods once or twice, a shake at most twice, slow motion and freeze once each, a signature move three times (open, middle, close). These counts are defaults: a style whose grammar repeats a device, or the reference's measured count, sets the count with its plan row (the `ice-direction` skill, `references/treatment.md` section "Craft plan").
- One scene or beat has one main flourish.
- Particles are punctuation fired by a cause (an uncaused burst is noise): 10-18 pop or 24-40 dissolve, cap about 40; gravity 900-1600 px/s^2 for confetti; speed 250-700 px/s; cone 20-45 degrees; flight 0.7-1.4 s; position a pure function of time; start and end at opacity 0. Banned as a default in premium, B2B, finance, health, productivity and maps; a style whose medium uses them (illustration only: fantasy, a holiday snowfall, space) or an atmosphere the reference measures keeps them with its plan row.
- Never add equalizer bars, spectrum analyzers, waveform displays, musical note clip art, generic particle systems, rainbow colour cycling, strobing white on beats or abstract pulsing orbs as audio reaction by default. A format whose medium is the waveform (illustration only: a podcast audiogram, a visualizer video) or a reference that shows one keeps it with its plan row; strobes stay inside the photosensitivity rules. Audio-reactive motion (when the brief wants it): bass makes warmth swell, treble sharpens contrast; text and logo intensity subtle (at most about 5 percent scale, 30 percent glow), backgrounds 10-30 percent; skip it for calm or tutorial pacing. Audio data extraction: ice-audio.

## 6. Motion palette per film (anti-sameness at the motion level)

- One motion family (illustration only: calm, punch, editorial, one-take), three core moves (a text move, a transition, a camera or card move), at most two accents.
- Never the same move twice in a row; vary the motion verbs across the film and track them.
- Which earlier films' core moves to avoid (the brand's last three films; never the same core move twice in a row inside a film): the `ice-direction` skill, `references/anti-sameness.md` section 7; ice-qa runs the fingerprint check. When the agent is left to choose, every film reaches for the same three moves: deal from the move deck (`move-deck.md`) under that rule.
- This repo's own defaults (arrival from oversize, a carried dot that becomes the logo, a built-from-parts logo, a giant cropped word, a colour flood between beats) are options, not a house style: measured in a 21-direction study, these appeared in nearly every direction and made eight brands read as one designer's reel.
- Rotate reveal actions (already there at the cut, push in, glide to next, highlighter sweep, drawn string, stamp, tear): the same reveal sequence at most 3 times in a row.

Sources: hyperframes skills (product-launch-video motion-language, motion-doctrine, creative), hyperframes docs (motion.mdx, claude-design guides), motionmaxxing (slop.md, judgment.md, director.md, motion.md), motion-video-kit (quality bar), video-production-studio (anti-sameness), product-launch-motion (04, 09, 11), anidoodle, huashu-art-motion, herk-edit-kit (motion philosophy), claude-remotion-skill, lemo-opuscar, ideas from onetake, video-talkcraft (rewritten); commercial-motion-design (founder).
