# Transition policy: which seam, how many, when

Choose seams by meaning, energy and position; build them from `cut-catalog.md`. Conflicting source rules are kept and scoped.

## 1. A transition says how two scenes relate

| The relation | Seam |
|---|---|
| "This continues" (same world, same thought) | Carried object, cut on motion, or a crossfade where the policy allows it |
| "Next point" (a run of items) | Push, cut-the-curve in the film's current direction |
| "Something changed" (state change) | Zoom-through, container replacement, burn, ground flip with a carrier |
| "Wake up", disruption, register shift | Hard cut |
| "Drift with me" | Slow blur dissolve (calm films only) |
| "And now this" | The foreground becomes the transition |
| "The same thing, further along" | Persistent actor across the seam |
| "This one, out of all of those" | Selection to expansion (pick and grow) |
| "The same things, put in order" | Registered decomposition (parts sort into place; past about 7 moving at once the viewer loses the map) |
| "Next to that, over here" | Continuous canvas, the camera travels |
| "And this is what is inside" | Exploded layers (layers must be real parts in real order) |
| Arrival, payoff | Inverse zoom-through |
| A question answered by a name | Two soft masks |
| A montage of breadth | Strobe or reel flip |

Every seam needs a reason: preserve continuity, create contrast, reset rhythm or land a point. Do not vary transition types randomly. Every transition should demonstrate something (a feature, a cause), not simply replace one card with another. Do not invent transition names: build from the catalog or describe the mechanism.

## 2. How many kinds per film

- Pick one primary seam (about 60-70 percent of scene changes) plus 1-2 accents; repetition reads as professional. Never a different transition on every seam ("all six mechanisms in 30 s is a demo reel of moves, not a story").
- Designed seams: one or two mechanisms per film; a designed seam used a third time reads as a preset; the signature move may appear three times (open, middle, close).
- Shared-element morphs are exempt from the budget.
- Hard cuts: in professional video about 95 percent of scene changes are hard cuts and effect transitions are reserved for 2-3 key moments (scope: edited footage, explainers, Vox-style collage, documentary, long-form, podcast, talking-head; news reel, edit type `news-reel`: hard cuts stay the primary seam, but the measured reel used broadcast seams on about 40 percent of its scene changes, each with its meaning, `cut-catalog.md` section 13, and the reference's own share wins). A bare cut is legitimate when something else carries continuity (a match, the voice, the beat).
- Motion-design films where the camera is the editor (product launch one-shape films, UI walkthroughs, explainer-default canvases): no plain hard cuts between scenes; every scene change is a camera move, a morph or a carried object; a hard cut only on a downbeat, at most twice, or inside a burst of hits and into the end card. A chosen style whose measured grammar is hard cuts, or the reference's measured seams, wins over this default with its plan row.

## 3. Crossfades and dissolves (scoped conflict)

| Rule | Holds in |
|---|---|
| Crossfades banned between scenes by default ("no carrier at all"; "fades imply a slide deck"); fade only a single object whose motion continues across it. A reference that measures dissolves (their length and share), or the chosen style's craft profile (illustration only, several kinds: a calm luxury, memorial or dream medium), lifts the ban for the seams and the length it names, with its plan row (the `ice-direction` skill, `references/treatment.md` section "Craft plan") | Product launch, app ad, hype promo, UI walkthrough, kinetic type, Vox-style collage, music-led films, social short |
| Crossfade allowed as "this continues" and blur crossfade as the default when backgrounds clash; dissolves only where continuity does not matter | Calm brand film, art film, industry spot with a calm register, explainer chapters inside one diagram, long-form and podcast edits, data story between related charts of the same scale |
| Gentle moves (bloom, flip, push, a card growing into the frame) as the standard seam, designed mechanisms as judgement calls | Drawn and illustrated films, storybook and doodle registers |
| News reel (edit type `news-reel`, style family `family-broadcast-news.md`): hard cuts carry most seams (one measured English reel: 29 hard cuts, 10 white flash or flicker seams, 4 red flashes, 3 monochrome strobes, 4 blur reframes, 4 dissolves); dissolves only in the cold open (about 0.3 s between image and headline beats) and as short overlay dissolves (about 12 f at 25 fps) where the reference measures them; the end card may arrive by a dissolve of about 10 f when measured. The broadcast seams and their meanings: `cut-catalog.md` section 13 | The measured news reel case of the reference condition in the first row; without a reference or a style that names dissolves, the social-short ban holds |
| Product launch without screens (`ice-film` skill, `references/genres/product-launch.md`): in the object film variant, dissolves between product shots are a measured option (6 of 11 films; up to 12 in one 60 s film), used for light-led reveals and finish to finish changes; hard cuts still carry most seams (62 percent at the median). The in-use variant keeps the ban (0 of 4) | The measured case of the reference condition in the first row, for this genre without a reference; the never-dissolve-two-copies row below still holds |
| Fade to black only for the opening or final exit (never between every shot, never black straight into the accent colour), by default; a designed black beat declared in the cue sheet (a title card, an act break, a chapter dip) or measured on the reference passes at its length with its plan row | All types |
| Never dissolve two copies of one thing (at the halfway point the eye sees a ghost); never crossfade two screenshots that do not line up (double image): scroll one tall capture or match-cut | All types |
| Never fade the outgoing scene out and then the next one in: both scenes hand off at the same instant; the transition is the exit | All types |

## 4. Exits on non-final scenes (scoped conflict)

| Rule | Holds in |
|---|---|
| Exit animations banned except on the final scene: the transition (or shader) is the exit; usually do not exit anything, cut | Multi-scene compositions assembled with injected transitions, launch films, collage explainers |
| Elements exit with a short accelerating move before the scene changes (exit 0.15-0.5 s, lighter than the entrance), with a real exit when the element is not referenced again, a demote-in-place when it will be compared, or the camera leaving it in a long take | Narrated explainers, talking-head overlays, B-roll overlays, data stories with sequential points |
| Exit only when the departure is content (a dock 0.34 s power3.out, a wipe 0.32 s power2.inOut, scaffolding 0.24 s) | All types |

## 5. Choose by energy

| Energy | CSS-style seams | Shader seams | Duration | Eases |
|---|---|---|---|---|
| Calm | blur crossfade, focus pull, dissolve | cross-warp-morph, thermal | 0.5-0.8 s | sine.inOut, power1 |
| Medium | push slide, staggered blocks, cover | whip-pan, cinematic-zoom | 0.3-0.5 s | power2, power3 |
| High | zoom-through, overexposure, scale, destruction | ridged-burn, glitch, chromatic-split | 0.15-0.3 s | power4, expo |

## 6. Choose by mood

Warm: light leak, blur crossfade, film burn. Cold: squeeze, blinds, shutter, grid dissolve. Editorial: push, diagonal split, shutter, whip pan. Tech: grid dissolve, staggered blocks, glitch. Tense: glitch, VHS, ridged burn. Playful: elastic push, 3D flip, iris, swirl. Dramatic: zoom through, gravity drop, colour dip to black. Premium: focus pull, blur crossfade, cross-warp. Retro: film burn, light leak, VHS.

Refused as defaults (use only when the brand and idea, the chosen style's craft profile or a measured reference demand it, with its plan row and reason; the news reel's sweep on a card or map the words name and the Screen glitch clip of `cut-catalog.md` section 13 are the measured case): glitch without a cause, a light sweep over chrome, fade-in standing in for drawing, particle bursts on everything, cross dissolves between unrelated pictures, lens flares painted onto drawings, a colour flood or circle wipe between every beat, a shock zoom or rotation with blur at every cut. Instead: a cut on the beat, one shake on a real impact, light that belongs to the world, a reveal from behind, dust born on a real contact, a carried object.

Product launch without screens (`ice-film` skill, `references/genres/product-launch.md`): a light sweep across the product is the measured convention there (10 of 15 films, once per film at the median), not a refused default; it comes from a light that belongs to the shot (a moving key light, a rim, a reflection in the material), never a sweep painted over a flat image.

Transitions belong to the brand's own shapes and the medium's own physics; a generic wipe or slide-in reads as a template. Ask how this medium's picture would physically appear (a liquid melts, a light switches on, a page turns, a print registers) and reveal the next picture through that process. Prefer a transition native to the product (its own theme switch, its own gesture).

## 7. Choose by position in the film

| Position | Seam |
|---|---|
| Opening | The most distinctive, 0.4-0.6 s; or open mid-move with no transition |
| Between related points | The primary, about 0.3 s |
| Topic change | Something different from the primary |
| Climax | The boldest accent |
| Wind-down | 0.5-0.7 s |
| Outro | Slowest, simplest, 0.6-1.0 s |

Rhythm patterns (illustration only, three different films): "cut-cut-ACCENT-cut-cut-ACCENT-cut"; "carry-carry-carry-SIGNATURE-carry"; "cut on beat x4, burst, rest, morph".

## 8. Decision table by situation

| Situation | Seam |
|---|---|
| State change only | Hard cut on motion plus carried object |
| Ground or world change | Effect becomes the next scene, or ground flip with a carrier |
| Scale change | Scale cut (one frame) or flight-through |
| Text to UI | Wipe that starts in A |
| Line to line | Hard word replacement |
| Act change | Cut on motion plus a carried object |
| Brand to product | Dive or zoom-through into a logo detail |
| Product to sign-off | Container replacement, glitch bridge (on-brand only) or cut |
| Field to logo | Pixel dissolve |
| List to result | Container replacement |
| Read-critical content | Hold longer; never cut before it is understood |
| Calm luxury, institutional, legal text, final logo lockup | No high-energy chapter cuts; restrained mask or hold-and-settle cut |
| Energetic list, supercut, recap | Repeated armature (same layout and path, content changes) with hard cuts or jump cuts on motion |
| Narrative or product walkthrough | Continuous carry or motion-masked swap |
| Contrast or palette change | Occlusion wipe or hard cut |
| Premium, stat, proof | Restrained mask or hold-and-settle cut |

Interrupted motion (cut before the move settles) only reads as intentional under a repeated rhythm of about 3-4 or more beats; one isolated interrupted move looks broken. Author cut-on-motion exits so the natural end lives beyond the visible cut.

## 9. Writing the seam plan

One row per boundary, written before building (the ice-qa skill verifies it on the render):

| Field | Content |
|---|---|
| Cut time | frame or seconds |
| Chapter roles | outgoing role, incoming role |
| Readable window | when the outgoing message was readable, for how long |
| Outgoing motion | axis, signed direction, speed, blur, last-frame state |
| Seam type | from the catalog |
| Incoming motion | axis, direction, speed, first-frame state |
| Carrier | the surviving element, or "none" with the reason |
| Ease pair | exit ease, entry ease |
| Music or voice cue | the measured cue, or the reason there is none |
| Reason | continuity, contrast, rhythm reset or point landing |

Every hard cut records its narrative reason, a measured cue (or a non-musical reason), the surviving continuity channel, and why a transformation would be weaker. Every transition has exactly one owner and a named destination anchor. Each entry and exit comment names the matching move in the adjacent beat; if it cannot be named, the seam is not designed.

Sources: hyperframes skills and docs (transitions overview, registry, claude-design guides, motion-principles, frame-worker rules), motionmaxxing (transitions.md, judgment.md), anidoodle (motion grammar), diffusionstudio lottie (chapterization grammar), motion-video-kit, product-launch-motion, video-production-studio, Barty-Bart and charlie947 motion-graphics, huashu-art-motion, claude-code-video-toolkit, lemo-opuscar, commercial-motion-design (founder), ideas from onetake, video-talkcraft, imMamdouhaboammar (rewritten).
