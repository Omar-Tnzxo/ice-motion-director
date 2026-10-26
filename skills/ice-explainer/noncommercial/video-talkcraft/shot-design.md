> Translated from Chinese into English from Vincentwei1021/video-talkcraft (PolyForm Noncommercial 1.0.0). Noncommercial use only.

> Adapted from Vincentwei1021/video-talkcraft (PolyForm-Noncommercial-1.0.0). Changes: em dash and en dash characters replaced with colons, commas or hyphens. Noncommercial use only; see LICENSE and README.md in this folder.

# Layered shot design: background / subject / text (practical worksheet)

The seven-layer model in `cinematography.md` is the complete vocabulary; when actually designing each shot, first use the coarse-grained **three-plane layering**
worksheet to settle the content and motion of each plane, then expand it into the SHOTBOOK layer matrix. Mapping of the three planes to the seven layers:

| Plane | Contains these of the seven layers | Question it answers |
|---|---|---|
| Background plane | L1 camera + L5 parallax background + L6 environment | What is the "space" of this shot, and how does it stay alive throughout |
| Subject plane | L3 subject + L4 attachments + L5 supporting elements + L7 masks | Who is the one lead of this beat, and who is supporting it |
| Text plane | Subtitles + decorative text/annotations/labels (screen-space layers) | Where is the visual counterpart of the spoken information |

**Every shot must have an assignment for all three planes** (the background plane is never absent: this is exactly the cure for root cause 1 of the PPT feel);
if you cannot write motion for a plane, write "inherit the global system" (very slow camera push/pull), but never write "none".

## 1. Motion menu for each plane

### Background plane (pick 1 spatial base + a camera phrase; the environment layer is inherited automatically)
- **Spatial base**: 12 backdrops (`template/motion-systems/backdrop.tsx`, design-language §1.1; **light default pastel-mesh-flow / dark default mesh-flow-dark**,
  plus aurora veil / light-beam grid / dual spotlight / dot-matrix light wave / soft light orbs / paper-texture window light / grid soft light / thin-film iridescence / frosted color blobs / pale ink clouds) /
  solid-color backdrop (canvas tier) / 3D starfield or scene (three bridge) / full-bleed material (Ken Burns must be on) / **live-action bed** (B-roll as background)
- **Live-action bed** (B-roll as background; the processing chain and parameter table live canonically in design-language §1.2): darken + desaturate + scrim only over the text area + extremely slow motion (duration = shot duration),
  **not lowering opacity**; only for a single piece of material / portrait material use a same-source blur (card `bed-echo-blur`); when the foreground enters, the bed steps back one more notch; people never go into the bed
- **Camera phrase** (one continuous curve in shots.ts, **only two forms**):
  very slow push 1.00→1.04~1.06 (default) / very slow pull (settling, cooling, wrapping up). Pan / vertical crawl / orbit / dutch are no longer used as scene camera moves:
  when the material itself must move (conveyor listing, reading a long image, 3D inspection), apply a camera-move card to the **material layer**; the world-canvas long take (longtake.tsx, §3.5) is an optional paradigm
- **Environment**: per-act color temperature tiers (ACTS table, optional); no exposure pulses / vignette tightening / light sweeps

### Subject plane (one lead per beat, write the relay line clearly)
- **Entrance** (0.2-0.8s, more forceful than the exit): center slam (scale 3→1 / 1.8→1 backOut) / side press-in that makes room /
  blur→sharp rack focus / stroke draw-on (L7) / pop-in stacking (media-pop-in) / ball-by-ball, bar-by-bar stagger
- **Hold** (still, no idle micro-motion): once elements settle they do not move; the liveliness of the frame is carried by the very slow camera push/pull;
  **content** motion in the attachment layer (code scrolling up, a pointer moving, numbers rolling) belongs to the subject itself and runs as usual
- **Start and end together**: shot duration = length of the spoken sentence; the duration of continuous motion such as the bed / slow push is the shot duration (**write rates, not fixed seconds**:
  scale 0.5%/s, pan 2.8px/s); in the 0.4s when text exits, the bed and material wrap up with it: no tail where "the text is gone but the picture keeps idling" (in GSAP/Remotion, ending only after the longest tween finishes is exactly this trap)
- **Supporting interaction** (L5, every action answers "supporting whom"): opposite motion (ring expands vs card shrinks) / light beam bridging attention /
  timeline/evidence entering from the side / collective defocus leaving only the subject (Defocus)
- **Stepping aside** (starts −6f before the new subject's anchor; choose among three by "will it come back"): **true exit** (0.15-0.5s exit, then gone from the layout;
  preferred for elements that will not be referred back to after this beat) / demote and stay (shrink to 0.92 + move up + darken −66% + blur 3.2px, `Live demoteAt`:
  the remaining element **still occupies its original slot and counts toward the on-screen budget**; the new subject may not be placed in its position; on light backgrounds at most 1 group may stay on screen; the old name retireAt is deprecated) / strike-through knocking out the replaced item / shatter into particles (for transitions)

- **When the material is only "text", the subject plane = a line-drawing schematic** (G5, `references/schematic.md`): first write one sentence "talking about X, so draw Y", then take a shape from the semantic graphic dictionary (document = dog-eared page, comparison = two roads, classification = hub fan-out, negation = icon + cross, task = checklist card...); the title and schematic are two halves of the same subject group, and the schematic takes the empty quadrant.

### Text plane (beyond subtitles, screen space, not in the camera)
- **Subtitles**: position / font size / plain-typesetting iron rule / no punctuation, all per design-language.md §5; one subtitle style for the whole film
- **Emphasized words** (applied to titles/punchlines/standalone text layers, not the bottom subtitles): keyword accent color-swap pop /
  decorative-text triple-stroke character-by-character reveal (FlowerWord) / slammed word (SmashWord) /
  typeface contrast accent (type-contrast-emphasis: switch to serif italic and enlarge): at most one emphasis per sentence
- **Sentence-level text cards** (ported from shotcraft on 2026-09-05 ◎, applied to titles / claim sentences, not subtitles): for listing use word-slot rotation (`word-slot-cycle`: sentence stem pinned, the capsule at the end of the sentence swaps through N short phrases then resolves into the full sentence) /
  claim sentences establish the subject first (`lead-word-zoom-assemble`: first word at 2.3× fills the frame then shrinks back and the rest fills in) / section handover (`title-demote-to-label`: once the title is settled it shrinks to the top-left corner as a persistent signpost, and content grows beneath it) /
  correction (`error-retype`: type the wrong half sentence, then delete and retype) / number reveal (`countdown-arc-scatter`: the number sweeps an arc and lands as the first character of the title) / crisp entrance (`split-text-stagger`: character-by-character split rise + baseline grows out) /
  listing with images (`word-relay-filmstrip`: noun constant, verbs relay, the left-column screenshot steps one card); for noun explainers on dark backgrounds the background layer can use `flying-words` (keyword tunnel, foreground stays still as usual)
- **Annotations**: highlighter sweeping a word (on the material) / hand-drawn circle and arrow / callout leader line / pencil hand-drawing (PencilDraw) /
  one scan pointing out N places (`scanline-annotate◎`, multi-target screenshot) / crash push to a close-up held for one beat (`crash-zoom-punch◎`, settles still after 6 frames, ≤2 times per film) /
  reticle lock-on (`reticle-lock-on◎`: four corners pounce in from off-frame, overshoot the shrink then rebound and lock onto the target, the accent of "that's the one")
- **Information pieces**: name strap / chapter number / term explainer card / number roll: entrances use the three-stage pattern, hold with float

## 2. Shot type presets (seven types, copy then modify)

Each type gives the default assignment for the three planes; in the SHOTBOOK just state where you deviate from the preset.

### ① Hook shot (opening 5-8s)
- Background: default backdrop (`pastel-mesh-flow`) or `grid-spot-light` + slow camera push throughout, accelerating at the end toward the question mark/hook object (carrying into the transition)
- Subject: center-stage relay (2-3 successive subjects slam into the center, the previous one steps aside), the last one paired with collective defocus
- Text: big hero-tier text is the subject; subtitles are there from sentence 1

### ② Argument/narrative shot (8-18s, the most common)
- Background: grid or backdrop + camera split into 2-3 phrases (settle → follow → push toward the evidence)
- Subject: relay line of title → badge → material card; for listings use a conveyor flow (continuous drift left), not a static grid
- Text: keyword accent pop; any entity named must have a visual counterpart enter

- When an argument shot has no screenshot / live footage to show, do not fill the gap with "one more line of big text": add a line-drawing schematic that matches this sentence (G5), and keep text to labels and the conclusion only.

### ③ Data shot
- Background: backdrop darkened one notch to give the chart contrast; camera slowly pushes toward the chart's main bar/final value
- Subject: chart-grow item by item (stagger = the rhythm of the spoken listing), key bar highlighted + punch; numbers NumberRoll reach the final value in ≤26 frames;
  for "M out of N" proportions use the dot-matrix proportion chart `unit-grid-proportion◎` (100 countable individual cells + big number counting in sync, more intuitive than a bare percentage);
  for the mechanism of "several sources converging into one" use `source-converge◎` (many-to-one animated diagram, the result centered once convergence completes);
  for "which of N options to choose, and what happens after choosing" use `chip-grid-single-select◎` (single selection inverted to black + remaining items locked in place and demoted + formula row)
- Text: the conclusion line appears only 0.3s after the data settles (see the evidence first, then the verdict); unit caption tier comes after

### ④ Evidence/material shot (screenshots, live footage, chat logs)
- Background: backdrop + very slow camera Ken Burns (the material itself also carries a 1→1.04 slow push, the two layers at staggered speeds)
- Subject: white-border card + a single shadow, "placed on the table" (slight tilt 1-2°); highlighter/red line marks key points in sync with the reading; magnifier shows details;
  to distill a conclusion after reading a document use `doc-park-left-pill-deal◎` (document parked showing 35%, conclusions dealt slowly on the right + persistent explanation line); to recommend a book / a tool use `info-card-assemble◎` (info card builds itself field by field)
- Text: annotation text must not overlap the material's text (start a separate white card); source line in micro tier persistent in a corner
- Annotation geometry conversion (field trap): highlighter/red box position = original image coordinates × (card content width/original image width) **+ card padding**:
  missing the white border/padding puts it off by 1-2 line heights and it sweeps the wrong line; extract a frame and measure it precisely before writing coordinates
- **Filming web pages**: a web page judged usable during research must never be pasted in the finished film as a static screenshot: it is a physical object "filmed" by the camera;
  choose the filming method by the intent of the voiceover, **one main method per shot**:

  | What the voiceover is saying | Filming method | Card |
  |---|---|---|
  | "Let's look through it from the top, the key is this item" (docs/README/search results/rankings) | **Scroll**: page moves, camera still; constant scroll up ≈10% page height/s, decelerate ~1s before the key item, stop at the viewport midline for 1~2s, annotations preset and moving with the page | `evidence-scroll-tour◆` |
  | "Let me show you these three places" (multiple points of interest on a long landing page) | **Tour**: page lies still on a 3D stage, camera docks at each in turn, each stop holds truly still | `stage-keyframe-tour◇` |
  | "Look at this number/button/clause" | **Magnify**: a quick look then away → circular magnifier (body darkened + connector line pointing back); to keep it hanging → picture-in-picture | `magnifier-detail` / `pip-zoom-box◈` |
  | "It's this sentence/this word" | **Mark**: sweep a highlighter over the whole sentence, ink-underline a single word, circle and arrow on the material, four-corner region frame | `highlighter-sweep` / `ink-underline◇` / `scribble-annotation` / `corner-bracket-frame◈` |
  | "This page has N problems" (commenting on 3~5 places in turn) | **Scan**: a scan line sweeps at constant speed; as it passes each target a viewfinder pops + sidebar annotation + count, annotations persist until finished talking | `scanline-annotate◎` |
  | "It's this line" (held for one beat, the overview can go) | **Crash**: 6-frame crash push to the target text block, overshoot and recover then pin; the difference from "push" is that it is a cut, not hold motion | `crash-zoom-punch◎` |
  | A screen of page just held while talking | **Push**: slow push as base noise, origin bites the point of interest, does not stop during the hold | `slow-push-in` |
  | The target itself is moving (cursor/field being filled) | **Follow**: camera locked to the moving target | `cursor-locked-zoom◇` (paired with `cursor-actor-demo◆`) |

  Combination discipline: **no magnifier pop-ups and no live marking within scroll/tour segments** (the lifeline of evidence-scroll-tour is "the page is the only moving element"):
  magnifying and marking happen only in dwell segments or a still framing, in the order "scroll to → stop → mark/magnify → scroll again"; push and scroll do not stack (reads as shaky hands);
  at most 2 "marks" on the same page (one accent per screen). All coordinates come from `targets.json` measured from the DOM at capture time
  (broll-sources.md "Web page filming material capture"), then converted with the geometry formula in the previous item; annotations that scroll with the page are pinned to the page coordinate system.
  **No browser screen recording**: Remotion films on a long screenshot, is seek-safe and can anchor to words; screen recordings have unstable frame rates, and lazy loading and sticky headers break the illusion.
  A small screenshot that fits on one screen and only serves as a supporting stack item (one of several in media-pop-in) may enter a card statically but still carries Ken Burns, and must not be the subject of that beat.

### ④′ Multiple materials on one screen (two or more materials present at the same time)
The problem with multiple materials is not "how to fit them" but **where the viewer should look**. First ask: can it be told sequentially (one large image per item in rotation, `parallel-items-with-host` ⑦ / MKBHD measured split screen 0%)? If yes, do not put them on one screen.
- **Settle the relationship before the layout** (relationship → layout → card):

  | Relationship | Layout | Card |
  |---|---|---|
  | Primary and secondary (argument + two pieces of supporting evidence) | One main, two supporting: main image 55~60% width + two equal images in the right column | `still-layout-relay` (hero-duo) |
  | Parallel (three people / three periods) | Triptych of portrait images 4+4+4 columns | `still-layout-relay` (triptych) |
  | Contrast (before/after / old/new / A-B) | Two-way split + sliding divider, the two images **must share the same composition** | `split-compare-slider` |
  | Two things mentioned back and forth | Stacked front and back + focus relay (one sharp, one blurred) | `rack-focus-pair` |
  | Sequence · three equal examples | Photo-wall dolly (3D wall, overview → dock at each → pull back) | `gallery-wall-dolly` |
  | Sequence · several stops in order | Timeline photo strip (alternating above and below, pan stop by stop → pull back to see the whole strip) | `timeline-photo-strip` |
  | Listing ≥5 | Constant-speed conveyor + deceleration on key items | `filmstrip-conveyor` |
  | Converge → focus (pick one of four) | 2×2 grid collapses into one main + a column of thumbnails | `grid-to-hero` |
  | Converge → parallel (one stack → five) | Card stack fans out then lays flat | `stack-fan-out` |
  | Master/detail (watching a video while talking through points) | 60/40 split: material slow push on the left + title and pastel chips on the right | `split-60-40-story` |
  | Evidence-style stacking | Stacked at angles | `media-pop-in` |
- **Entrances have order and direction**: stagger 80~150ms, same direction; the lead lands first, supporting items follow; the whole group fading in at the same time and speed = PPT.
- **Only one lead at any moment**: the focus relay relies on **demoting the rest** (brightness .55~.6 / scale .985); the lead itself moves only 3~4%; switches take 0.4s, ≥1.5s between two switches.
- **Only two camera moves**: horizontal tour with docking (each stop's zoom happens around the current material) and push into one then pull back to the overview; inside a docking segment a 1→1.03 micro push prevents deadness.
- **Unified look**: white border / rounded corners / a single shadow consistent across the group; mixed landscape and portrait unified to the same frame ratio (crop, do not scale). Budget unchanged: ≤3 subject groups on one screen (one grid counts as 1 group), leave one empty quadrant for subtitles, text inside materials must not collide with subtitles.
- All geometry per `references/layout.md` (group bounding box centered, equal spacing 24~32 within a group, ≥96@1080p from the frame edge).

### ⑤ Punchline/turning-point shot
- Background: **full backdrop color change** (light↔dark contrast, the source of the chapter feel) + color temperature shift; camera changes direction (push → very slow pull)
- Subject: big text surfacing line by line (quote-card), the core word lands last + punch; everything else Defocus
- Text: in this type the text plane is the subject plane; subtitles may be hidden temporarily (the big text is the line itself)

### ⑥ Closing shot
- Background: starfield/deep space + camera forward dolly through the scene (or pull back after the last stop of a long take)
- Subject: epitaph-style sentences passing one by one (far → near), symbol callback (the opening hook object reappears), the final sentence wraps up in a golden glow
- Text: CTA/source information in micro tier, the curtain call fades out as a whole

### ⑦ B-roll shot (video material + host footage present at the same time)
- Background: full-frame bleed B-roll is the spatial base (its own motion is already moving; the camera only adds a very light slow push, the two layers at staggered speeds)
- Subject: **the B-roll is the lead of this beat; the host is demoted to a persistent corner badge**: a round avatar badge (`host-shrink-to-chip◆`) or a cut-out person pasted in a corner, placed at the bottom corner;
  the two routes, positions and all hard constraints (lower-third band / deadlock / the person must be moving / three don'ts) follow `host-footage.md` §5.
  **The corner badge is the default route, not the only one**: the form rotates shot by shot per the seven forms below (half body / badge bottom-left / badge bottom-right / inside a split cell / brief exit, host-footage.md §5 "Form rotation")
- **Seven presentations of a single B-roll (one form per shot, adjacent shots use different forms, the same form ≤1/3 of the film; finalized by the user on 2026-09-21: "it should keep switching to different shots to show things, even material presentation can use different methods")**:

  | Form | What it looks like | Host form | Card / component | What the voiceover is saying |
  |---|---|---|---|---|
  | ① Full-screen bleed + badge | B-roll full frame as the spatial base (`Bed`), annotations land only in empty areas | Badge bottom-left / bottom-right | `template/components/bed.tsx` + annotation card | The material itself has drama (action / scene), let it speak |
  | ② Framed + text on one side | Material goes into a `theme-frame` style frame, text on the side opposite the host | Badge or half body | `theme-frame.tsx` + text card | The material is evidence / a quote and must sit beside the text |
  | ③ 60/40 master/detail split | Left cell material slow push, right cell title + chips one by one | Badge; **or the host in the left cell** | `split-60-40-story◉` | "Watch it work while listening and taking notes", ≤4 points |
  | ④ Same-source blur bed | Foreground material as a white-border card + the same clip enlarged and blurred as the base | Badge | `bed-echo-blur◉` | Portrait material / only this one piece of material |
  | ⑤ Freeze-frame pointing | `ffmpeg -ss` takes a frame as an image, crash push / lock on / circle one spot in it | Badge or exit | `crash-zoom-punch◎` / `reticle-lock-on◎` / `corner-bracket-frame◈` | The voiceover is pointing at one spot in the material |
  | ⑥ Multi-material arrangement | ≥2 clips (or several frames of one clip) laid out by relationship; 3D wall / timeline strip carry their own camera moves | Badge or exit | §2④′ relationship table: `still-layout-relay` / `split-compare-slider` / `rack-focus-pair` / `gallery-wall-dolly` / `timeline-photo-strip` / `grid-to-hero` / `filmstrip-conveyor` | Parallel / contrast / sequence / converge |
  | ⑦ Material briefly alone | Host exits for 3-6s, material full-screen bleed + one line of label, host returns in the next shot | Exit (≤1 shot, must return in the next shot) | `Bed` + `slow-push-in` / `sway-parallax` | Emotional or scene sentences ("imagine..."), ≤2 times per film |

  Discipline: adjacent shots use different forms; ② and ③ are the two handiest forms for "material + text", and together still may not exceed 1/2 of the film; two consecutive shots without a person after ⑦ = a voiced-over PPT;
  **rotation means changing composition, not adding motion**: inside each form there is still only the very slow camera push/pull. Write it into the G0 layout rhythm table (cinematography.md §4) before expanding into the per-shot matrix; preflight checks consecutive use and share.
- Text: annotations land only in the empty areas of the B-roll; the corner badge and subtitles are on different sides
- Host appearance rhythm and staggered position changes: see `host-footage.md` §5 (establish the host in the first sentence before shrinking, 2-4 semantic triggers per minute, three-stage staggered order)
- Face safe zone: run `scripts/face_bbox.py` before starting, criteria in `host-footage.md` §3; put the main information panel on the side opposite the host
- **Parallel sentences** (host present + voiceover talking about "three things"): use one of the seven forms of `parallel-items-with-host` (horizontal row overhead / three horizontal bars gray to color / vertical column over blurred base /
  card stack at the top / vertical three-way cut / diagonal three-way cut / rotating big text in the background), one form per shot; the three disciplines are in layout.md §7.1
- **Only one piece of material / portrait material**: same-source blur bed `bed-echo-blur` (the host's own portrait original footage also works as the bed)
- **Host persistent + prop table**: `host-card-glass-board◎`: 9:16 host portrait card on the left, 3D glass board on the right as a prop table, props on the board relay with the voiceover (tile → connector line → result), the same board covers several props in a row without changing shots; the dark background is the domain skin, on a light background switch to white cards + hairlines
- **Pointing at one spot in B-roll**: first grab a frame (`ffmpeg -ss` takes that frame as an image), then point with an image annotation card (`crash-zoom-punch◎` / `reticle-lock-on◎` / `hand-drawn-ellipse◈`);
  the library no longer has annotation cards that manipulate video time (the user deleted freeze-frame-annotate on 2026-09-06); a shot can have only one time manipulator



## 3. How to write it into the SHOTBOOK

1. First fill in the three-plane worksheet for each shot (three-row table: background plane/subject plane/text plane → content + motion + relay line);
2. Then expand into the layer matrix (beat by beat, layer by layer, answering "supporting whom"), format in cinematography.md §4;
3. Self-check: is the background plane alive throughout? Is the subject relay line broken anywhere (a beat with no lead/two leads)? Is text-plane emphasis over-issued (>1 per sentence)?
   Is the layout budget met (cinematography.md §4.5)? Do the nine layout-spec items pass (`references/layout.md` §9)?
   Have the "known pitfalls" and "placement self-check" of each selected card been copied into the self-check column?
   Do **text and picture start and end together** (the last exit in each shot = end of shot, the duration of the bed / slow push = shot duration)?
4. Two filters for card selection (candidates can be computed directly by `scripts/card_match.py`, see `references/semantic-annotation.md`): first by material type: for each shot the SHOTBOOK states which of **person / V / image / screenshot / text / UI / scene** the input is, and picks cards that consume this input from the "Input type index" in `references/taxonomy.md`;
   then by the semantics of this spoken sentence: pick cards designed specifically for this semantics (self-introduction / data / contrast / listing / quote / call to action...) from the "Semantic index", and within the same semantics pick the tier by the G0 energy profile. Both indexes are generated by `scripts/cards_index.py` from card frontmatter; cards marked ◦ have no props for swapping content, and changing copy requires editing source (the md files of the two new batches of ◉◎ cards additionally open with an "Input type" table and four "Common scenarios" items).
5. For the selected cards, write a **skin line** (alongside the layout line) per the `G0 style profile` in SHOTBOOK §0: `card name → what skin was changed` (color tokens / fonts / corner radius and material / chart axes and markers / what material replaces placeholder shapes);
   cards are neutral UI, and entering the film without skinning is just pasting: the contract and exceptions are in design-language §0.4.

Example: S3 in `shotbook-example.md` shows how to write the "③ Data shot" preset plus deviations (3D base, dutch angle for a sense of deadlock).
