> Translated from Chinese into English from Vincentwei1021/video-talkcraft (PolyForm Noncommercial 1.0.0). Noncommercial use only.

> Adapted from Vincentwei1021/video-talkcraft (PolyForm-Noncommercial-1.0.0). Changes: em dash and en dash characters replaced with colons, commas or hyphens. Noncommercial use only; see LICENSE and README.md in this folder.

# Video Design Language (Default Layout System · Apple Paradigm)

A design language for 1080p video, rewritten from the Apple web design paradigm.
**Applicability: this is the default skeleton "when the user has no explicit style requirement", not a mandatory requirement of the skill**:
if the user names a style (variety-show feel / cyberpunk / hand-drawn on paper / the tone of some brand...), follow the user and replace the whole set;
the only hard constraint in this file that holds for any style is: **the replacement must also be a complete set of tokens; picking colors casually scene by scene is not allowed**.
With no explicit requirement: when starting a new film, first follow **§0 to determine the domain from the voiceover script and derive this film's style profile** (the skeleton stays the same, the skin follows the domain), then set the tokens per this file and materialize them as `theme.ts` in the project.

## 0. Domain sets the style: from voiceover script to style profile, then to card skinning (canonical, comes before the palette)

The motion cards in the library are **style-free neutral UI presentations** (demo-spec "visual baseline": white stage, zero decoration, grayscale placeholders): this is so the motion can be reused losslessly,
but it also means **pasting the demo skin straight into the final film is a "PPT sticker"**: in a film about Song dynasty porcelain, a hairline white card plus a chart with a blue accent reads as the wrong film, however correct the motion is.
So the first step at kickoff is not picking cards, it is **setting this film's domain and style**, then skinning every card per the style profile.

### 0.1 Determine the domain (answer after reading the whole script, write it into SHOTBOOK §0)
Three questions: (1) **What is it about**: topic words, density of proper nouns, ratio of data / quotes / cases; (2) **Who is it for**: peers, the general public, students or consumers;
(3) **What tone**: teaching, review, opinion, narrative, news. Write the domain as one word + one sentence of grounds ("Finance · 11 data points across the script + 3 citations of financial reports, tone is interpretation").
When unsure, decide by the dominant passages; a cross-domain film takes one dominant domain, and the other domain only lends its chart / footage language in the relevant acts, without changing the whole film's palette.

### 0.2 Domain to style profile (example rows, not exhaustive; one domain can have several profiles, pick the one closest to the tone)
| Domain | Background strategy | Accent / background tendency | Type character | Material & card shape | Chart / data language | Footage & bed character | Energy |
|---|---|---|---|---|---|---|---|
| Tech · AI · Developers | Light background by default, dark tiles for code / terminal | Cool blue or brand color; dark tiles near black | Geometric sans, monospaced numbers | Hairline cards, radius 12~16, glass / dark tiles | Minimal line charts + faint grid, `tabular-nums` | Screen recordings, terminals, UI screenshots | Medium |
| Finance · Business · Data interpretation | Light parchment background, or navy dark background for between-act contrast | Ink blue / dark green; up/down semantic colors only in charts | Sans body + serif big titles (newspaper feel) optional | Paper-feel white cards, table rules, little rounding | Full axes, real ticks, monospaced numbers, units after | Report / candlestick / news screenshots, city crowd beds | Low-medium |
| Education · Popular science · Knowledge | White / parchment | Warm orange or cyan | Rounded sans | Pastel backing chips, hand-drawn circle annotations, pencil lines | Graphics first (dot-matrix ratios, diagrams, step bars) | Illustrations, diagrammatic B-roll, blackboard feel | Medium |
| Lifestyle · Consumer · Reviews | Warm white | Brand color or warm color | Neutral sans | White-bordered photo cards + the single shadow, radius 20+ | Ratings / comparison tables / gauges | Live-action product shots, usage scenes | Medium |
| Humanities · History · Culture | Parchment alternating with dark ink background | Cinnabar / indigo / gold | Song-style / Kai-style character titles, sans body | Paper texture, ink stains, handwritten underlines, no shadow | Timelines, maps, few modern charts | Old photos, artifacts, ink-wash beds | Low |
| Health · Medical · Psychology | White + pale cyan | Teal green | Rounded sans | Large radii, few strokes, soft backing plates | Simplified diagrams, ratio dot matrices | Softened live-action people beds | Low |
| Workplace · Productivity · Methodology | Parchment | Blue or ink black | Sans | Checklist cards, sticky notes, step bars | Flowcharts, step bars, checkmarks | Screen recordings, document screenshots | Medium |
| Entertainment · Gaming · General news | Near black or high-saturation background | High-saturation clashing colors | Bold sans / italic | Hard-edged slabs, color blocks, outlined cards | Counters, rankings, slammed-in numbers | Gameplay, bullet comments, memes | High |

A profile only gives direction; the concrete values still land per the token discipline of §1~§4: one accent, one shadow, two font weights, alternating background colors split the acts, motion by subtraction: **the skeleton is the Apple paradigm, the skin belongs to the domain**.
Dark-dominant / high-saturation backgrounds are choices that depart from the light default: execute them only after writing the domain grounds in SHOTBOOK §0 **and getting the user's confirmation** (the confirmation gate stays, finalized by the user on 2026-09-06; in co-creation confirm during SHOTBOOK review, in autonomous mode also ask once before starting); "a tech topic" by itself is not a reason for a dark background (the tech profile gives material and graphic language, not "tech = black background").

### 0.3 How to write the style profile (first block of SHOTBOOK §0, `G0 style profile`)
```
G0 style profile
- Domain: Finance · interpretive tone (grounds: 11 data points / 3 report citations / audience: general retail investors)
- Background strategy: parchment #f5f5f7 dominant; act 3 (reversal) dark background #0f1e3d
- tokens: accent #1f4e8c · ink #1d1d1f · dim #7a7a7a · up #248a3d / down #d70015 (charts only)
- Type: titles "Source Han Serif" 600 / body PingFang SC 400 / numbers tabular-nums
- Material & cards: paper-feel white cards (1px #e0e0e0 stroke, radius 12, no shadow); evidence screenshots in white-bordered cards + the single shadow
- Charts: full axes + ticks, grid #ececf0, line 3px accent, round dot markers, units at caption level placed after
- Footage / beds: report / news screenshots; B-roll uses a duotone city crowd bed (design §1.2)
- Energy: low-medium; things not to do: no pastel chips, no hand-drawn circle annotations (use red boxes + table highlights instead)
```
The derived `theme.ts` (§7) and the act background choice (§1.1) both come out of this block; when the user names a style, write the user's style directly into this block, overriding the domain profile.

### 0.4 Neutral card skinning contract (application side, every selected card goes through it)
After `template/cards/<slug>.tsx` is copied into the project, **change the skin per the style profile, do not change the vital core**:
- **Do not touch (the motion itself)**: timing and easing, the three-part structure, geometric proportions and relative positions, motion direction and layer order, sound cues. The 0.55 similarity threshold in `scripts/card_lint.py` is exactly the margin left for skinning: changing the skin passes, rewriting the motion drops below it.
- **Must change (the skin)**: colors -> all replaced with theme tokens (the demo's #0066cc / #e3e3e8 etc. are never kept); font stack and weights -> style profile; radius / stroke / shadow / material (hairline card <-> white-bordered card <-> paper card <-> glass / dark tile);
  for **chart cards** the axes, grid, marker shapes, number font and unit notation; for **card-type cards** replace placeholder graphics with real footage or stylized graphics; icons line / filled unified across the whole film.
- **Follows semantics, not style**: a card's built-in semantic colors (highlighter yellow, up/down red/green, warning red) keep their hue, only their saturation level is adjusted per the style profile; **product UI cards** (chat-gpt / claude-code / x-follow-card and the like, where the skin is the content) are not skinned (already set in demo-spec).
- **Consistency**: same-type cards within one film share one skin: all cards one shape, all charts one axis language, all chips the same height and radius; **video container frames use one style per film** (the eight styles of `theme-frame.tsx` chosen by tone, §1.3; "one style" means the **frame shape**, not the container's size / position / proportion: full-bleed, framed, split cells, beds, multi-image must rotate per shot, cinematography §4.5 item 9), decorative lines and decorative text = this film's ink; **the four chapter cards share one font and layout, but each chapter has a different background / accent / motif** ("same family, different chapter": what stays consistent is the shape grammar, what rotates is the chapter color and theme motif); write the skinning list into that shot's **skinning row** in SHOTBOOK (`card name -> what skin was changed`), alongside the layout row, and after implementation pull look-test frames to check "does this look like it belongs to this film".
- **Counterexamples**: a neutral white card dropped straight into a humanities film (sticker feel); each card keeping its own demo color (a second accent); three data cards with three axis styles; putting the style into the motion (slowing the easing for a humanities film, adding bounce for an entertainment film: the energy profile only governs entrance force and density, it does not change a card's timing core).

Core character (four skeleton rules inherited from the Apple paradigm):
1. **Content is the protagonist, layout steps back**: no decorative gradients, no fancy borders; segment with white space and background color changes, not with lines.
   (The only exception: the 12 act backgrounds in the §1.1 background menu: light `pastel-mesh-flow` / dark `mesh-flow-dark` are the defaults, the rest are enabled per act.)
2. **The whole film has only one accent color**: every "look here" signal (keywords, underlines, annotations, CTA) uses the same accent.
3. **The whole system has only one shadow**: used only for "evidence footage" (screenshots/photos/live action); cards and text never get a shadow.
4. **Alternating background color is the sense of chapters**: switching between light and dark backgrounds between acts is itself the separator (matching the ACTS act table in env.tsx).

## 1. Palette

Dual mode: **the default dominant mode = light background** (Apple's native look: white/parchment + ink text + quiet blue). Dark backgrounds are only for act-level contrast
(punchline acts/reversal acts/code demo acts switch the whole act to a dark tile). Dark-dominant or other background strategies are decided by the **§0 style profile** per domain,
with the domain grounds written in SHOTBOOK §0 **and confirmed by the user**: "a tech topic" by itself is not a reason for a dark background (§0.2).

| token | Light mode | Dark mode | Use |
|---|---|---|---|
| canvas | `#ffffff` | `#1d1d1f` | Main canvas |
| canvas-alt | `#f5f5f7` parchment | `#272729` / `#2a2a2c` | Alternating act background (subtle step between adjacent acts) |
| ink | `#1d1d1f` | `#f5f5f7` | Titles and body text |
| ink-muted | `#7a7a7a` | `#a1a1a6` | Secondary info, source lines |
| hairline | `#e0e0e0` | `rgba(255,255,255,0.14)` | Card 1px hairline (replaces shadow for hierarchy) |
| **accent** | `#0066cc` | `#2997ff` | **The only accent color**: keyword color change, underlines, annotation leader lines, main chart series |
| positive / negative | `#248a3d` / `#d70015` | `#30d158` / `#ff453a` | **Only in charts and up/down annotations**, never a layout color |
| marker | `#FFE949` @60% multiply | Same as left (screen mode) | Only for highlighter sweeps over words |

Red line: no second "look here" color other than the accent is allowed; a semantic color appearing on body text/titles is a violation. Ambient colors in the background layer (the §1.1 act background color blobs, the multiple hues of the `flying-words` word cloud) are atmosphere, not signals, and do not count against this red line: they may only stay in the L6 background layer, the foreground still has just one accent.
The dark mode background is Apple's **neutral near black** (the #272729 family), not dark blue, and no decorative grid is added.
The deep-space-blue tech style in `template/motion-systems/theme.ts` (#070B14 + cyan grid + glow) is a **legacy variant**;
its visual character does not belong to this design language: use it only when the user explicitly asks for a tech style, and declare it in SHOTBOOK §0.

**"Energy" techniques on a light background** (the dark-background glow/exposure grammar does not work on white and is not Apple; replace it with):
hierarchy and emphasis via background color steps, hairlines, accent stroke/color change, punch scaling, the single shadow; for text-only shots the "second layer worth looking at" = a G5 line schematic (ink 3px stroke + accent emphasis + frosted whiteboard backing, `references/schematic.md`), not gradients, grids or glow;
ambient layer = an extremely light **static** vignette (`rgba(0,0,0,0.06~0.12)`, part of the act background recipe); darkening pulses and light sweeps are not done (motion by subtraction); dark code panels/terminal windows are treated as "dark tile cards" (Apple allows black video frames), they carry their own hierarchy and need no glow.

Two measured red lines on light backgrounds:
- **Transition white flashes fail on light backgrounds**: the white background baseline luminance is ≈237, stacking a 0.34 white flash has nowhere to rise (the same table on dark backgrounds shows a +29 luminance peak, on light backgrounds the measurement shows no peak).
  Overexposure page-flip transitions on light backgrounds are always done in reverse as a **darkening flash** (at the cut point the whole frame darkens 6~10% for one beat of 3~4 frames then rebounds), or a 2~3 frame paper-white hard cut to 255.
- **Do not stack opacity on dim elements**: `#7a7a7a` on white has only 4.29:1 headroom, stacking transparency inevitably drops it out of the readable zone
  (measured: unread subtitle words with opacity stacked fell to 2.06:1). Unread states/source lines/legends always use dim as a **solid color**; to make it fainter, change to a darker background and leave the text alone.

### 1.1 Background menu (12 kinds; code `template/motion-systems/backdrop.tsx`)

**Default act backgrounds: light `pastel-mesh-flow` (the flowing version of the original static pastel mesh) / dark `mesh-flow-dark`**.
The others replace them per act, declared in SHOTBOOK §0 with which acts use them; casually changing the background at the shot level is forbidden.
The flow built into act backgrounds **is not part of the motion system** (the motion system only has an extremely slow camera push/pull, cinematography §2); speed is uniformly **1.5×** (default value of the `speed` prop), the test being that staring at the subtitles for 3 seconds the eye should not be pulled away by the background. Everything is driven by `frame / fps` with zero randomness, reproducible frame by frame in Remotion;
GLSL kinds need `Config.setChromiumOpenGlRenderer('angle')` in `remotion.config.ts` (the same line as the three bridge).
Dark gradients band when encoded to H.264, so **every kind by default stacks a layer of static noise** (`grain` prop, dark .06 / light .09, overlay).

| kind | Dark/light | Recipe (1920×1080, 1.5× already included in speed) | When to use |
|---|---|---|---|
| **`mesh-flow-dark`** | Dark | Base `#0a1229`; four colors (navy / indigo / cyan / purple, saturation ≤60%) mixed by fbm domain-warp weights, GLSL time coefficient .04; brightest point L ≤35 | **Dark default**. Openings / brand / general |
| `aurora-veil` | Dark | Base `#05070c`; three fbm-warped horizontal bright bands hanging from the top (teal green -> blue purple), lower 60% pressed back to near black; deformation period 30s | Tech / punchline / reversal acts; put the title area in the dark part |
| `beams-grid` | Dark | Base `#08090d`; perspective floor grid (100px, `rgba(255,255,255,.06)`, rotateX 48°, radial mask fading into the distance) + cool top light `rgba(120,170,255,.18)`; **static** | Tech / data acts. The grid is a fine texture, only in a screen-space static layer |
| `spotlight-stage` | Dark | Base `#101116`; main light `rgba(41,151,255,.14)` diameter 65% slow sway 40s + secondary light `rgba(255,200,150,.05)` 55s + 60 floating dust particles (1.2~2.2px, brightness .25) | Punchline / people acts (upgrade of the current "centered spotlight" kind; the light spot center follows the subject's position) |
| `dot-field-wave` | Dark | Base `#0b0c11`; dot matrix at 36px spacing, 3px dot size `rgba(207,224,255,.2)`, one diagonal brightness wave passing every 14s (wave peak .8, dots enlarge to 4px), radial mask hides the four corners | Data / tech acts. Only in a screen-space static layer |
| `orbs-dark` | Dark | Base `#0b0d14`; three blur 70px light orbs (blue `.55` / purple `.45` / cyan `.35`, diameter 420~560) each orbiting an ellipse every 30~45s | Openings / emotional acts (Apple keynote style) |
| **`pastel-mesh-flow`** | Light | Base `#fbfbfd`; four pastel blobs (blue `.42` / pink `.38` / purple `.30` / cyan `.32`) positioned by sine + fbm, one full cycle every 35s, chroma constant | **Light default** (flowing version of the original pastel mesh; blob colors are atmosphere, not signals, "look here" is still accent only) |
| `paper-grain` | Light | Base `#f8f6f1 -> #f3f0e8`; paper texture feTurbulence (opacity .12, multiply) + a patch of window light `rgba(255,255,255,.7)` diameter 70% moving slowly from top left to top right over 60s | Document / humanities / text-dense acts; the window light does not pass over the title |
| `grid-spot-light` | Light | Base `#f5f6f8`; fine grid 100px `rgba(29,29,31,.055)` visible only near the light spot + pale blue soft light `rgba(120,180,255,.22)` diameter 60% patrolling over 45s | Data / tech acts (light). Avoid in text-dense shots; the grid goes in a screen-space static layer |
| `iridescent-sheen` | Light | Base `#fcfcfe`; fbm-driven thin-film interference color (cos palette), saturation 30%, amplitude .16, lightness clamped to L 86~100 | Brand / design topics; choose a dark accent to avoid clashing |
| `glass-blobs` | Light | Base `#fafafc`; three high-chroma color orbs (`#7aa7ff` / `#ffa3c4` / `#8fe3cf`, blur 40px, wandering over 28~40s) pressed behind a layer of frosted glass `rgba(255,255,255,.55)` + backdrop-blur 40px | Product / design / light-hearted topics; glass opacity below .45 competes with the text |
| `ink-wash` | Light | Base `#f6f3ea` rice paper + paper texture .10; fbm cloud mist (ink `rgba(40,44,52,·)`, alpha ≤ .20) drifting slowly right to left, time coefficient .025 (slowest) | Humanities / history / Chinese-style topics (pair with the chinese-aesthetics direction) |

Implementation: a whole-act `<Backdrop kind="…" />` per scene (default `speed=1.5`, `grain` on); `theme.ts` holds two tokens `bg.light = 'pastel-mesh-flow'`,
`bg.dark = 'mesh-flow-dark'`; acts with no special declaration in SHOTBOOK §0 reference the matching default by background lightness. The old three kinds (fine grid / static pastel mesh / centered spotlight)
are replaced by `grid-spot-light` / `pastel-mesh-flow` / `spotlight-stage` respectively.

### 1.2 Live-action bed (B-roll as background) processing chain (canonical)

When video footage is used as a low-presence moving background, **do not rely on adjusting opacity** (on a light background it washes into gray fog). Ambient layer parameter table:

| Step | Parameters | Notes |
|---|---|---|
| Darken + desaturate | `brightness .35~.50` + `saturate .5~.7` | Dark background default .42 / .55; on light backgrounds use same-source blur or a white scrim .75 instead |
| Gradient mask scrim | From the edge where the text sits `78% -> 0` (bottom 60~78% opaque) | Only darken the text area; a full-screen mask = back to "adjusting opacity". NN/g: 30% black is not enough, 50% is |
| Motion | Scale ≤0.6%/s or pan ≤3px/s, **duration = shot duration** | Only scale / extremely slow pan, no swinging; bed : content parallax 0.5 : 1.0 |
| Duotone (optional) | `grayscale 1 / contrast 1.15 / brightness .62` -> dark color `lighten` to lift blacks + theme color `multiply .85~.95` to tint whites | Desaturate first, then tint; unifies the character of multi-source B-roll |
| Same-source blur (optional) | Foreground card sharp; same footage `scale 1.25->1.295 + blur 26 + brightness .45 + saturate .8`, slowed to 0.5× | Only blur ≥20 reads as atmosphere; bed in sync with the foreground causes ghosting; card `bed-echo-blur` |
| Yield | On the same frame the foreground enters `.55 -> .28 + blur 8px`, 0.4s; back in .55s | Use brightness, not opacity (letting the background through turns it gray); aligns with Material 3 scrim .32 / Apple +35% |
| Start and end together | Bed fades out 0.4s on the same frame as the text exits | Leave no "text gone but the picture still there" tail |
| Footage selection | Slow content (timelapse / bokeh / overhead / blurred crowds), avoid readable text and frontal faces | Source average luminance (0~255) ≥100 to hold up under darkening; 0.5s crossfade at loop seams |

### 1.3 Eight video container frame styles (code `template/components/theme-frame.tsx`; finalized by the user on 2026-09-07)

Video inside a shot (screen recording / a single B-roll / a quoted clip) **is not pasted bare full-frame, not placed bare in a white card, and not wrapped in a fake player**: no progress bar / play button / timecode at all
(viewers will match the progress to the picture; if it does not match it is a lie, and if it does it is only a UI control, not design). Wrap the video area in a `<ThemeFrame kind>`: each style is an **object with a provenance**,
and the frame's vocabulary tells the footage's identity in place of the voiceover. Any card's video area can be wrapped (single-video shots must be wrapped; the bed-echo-blur foreground / the split-60-40-story left cell / the three images of gallery-wall-dolly can be wrapped in the same style).

| kind | Object | Elements | Decoration relay (finishes drawing ≤1.35s after the first stroke, then rests) | Tone |
|---|---|---|---|---|
| `browser-retro` | Mac OS 9 platinum window | Striped title bar + three square buttons, beveled nav buttons + white address bar, status bar + drag grip | None | Tech / tutorial / web screen recording |
| `magazine` | Magazine illustration | Full-width 1px rule + small letter-spaced caption, serif page number + short rule, paper white space as the border | Rule scaleX 0.4s -> caption and page number fade in -> short rule | Humanities / commentary |
| `film` | 35mm film | Dark film strip + top and bottom sprocket holes (holes = stage background color) + amber frame numbers | None | Documentary / quoting someone else's finished film |
| `polaroid` | Polaroid | White card with thick bottom border 96 + fixed tilt −1.5° + soft shadow | None (host places it with y 24->0, no bounce, no swing) | Lifestyle / vlog |
| `blueprint` | Engineering drawing | Inner and outer double lines + crosses at the four corners + top dimension line + 96px ticks + small monospaced text (same ink line set as the G5 schematic) | Outer line in one stroke 0.6s -> crosses -> dimension line -> ticks -> small text | Methodology / teardown |
| `laptop` | Laptop | Dark screen bezel radius 18 + camera dot + body base with central notch | None | Desktop screen recording |
| `stamp` | Postage stamp | Thick white border 22 + semicircular perforations on four sides (stage changed to very light gray `#f0f0f2`) | None | Light-hearted / culture |
| `hairline` | Double hairline | Picture radius 12 + hairline, a faint line ring expanded by 14 + short marks at the four corners | Faint line fades in 0.3s -> corner marks traced one by one | Minimal |

Division of labor and discipline:
- **The frame only handles its shape + its own decoration relay**; overall entrance / exit / extremely slow push of the whole frame belong to the host card or the shot layer (G1 camera / yield): the frame moves together with the video area, it does not move by itself. `at` is passed as the video area's landing start +0.5s.
- **One style per film**: all framed videos in one film use the same style, with the style name written into the SHOTBOOK skinning row; changing style = confused footage identity.
- **Zero processing of the picture inside the frame**: no filters / no scaling / no fade in or out; still images do not go into frames (the frame says "this is a recording").
- **Skin**: decorative lines / decorative text = this film's ink (`ink` prop); dark-background films: the browser switches to dark gray platinum, magazine / blueprint / double hairline switch to a bright hairline, polaroid / stamp stay white (they are white objects to begin with), film disappears on dark backgrounds, do not choose it.
- **Decorative text is decoration, not information** (Untitled / http:// / FIG. 01 / 024 / 24 · KODAK 400 / 768 · SCALE 1 : 1), at 9~12px it is not meant to be read; information goes through the subtitle / styled-text layer; `label` / `sub` can be changed or left empty.
- Size: `frameBox(kind, w, h)` gives the overall size and the video area offset; the host places the video area at the design coordinates (overall left = X − x, top = Y − y); the frame's four sides stay within action-safe, frame bottom edge to subtitle band ≥60px (full-width film is the exception, the subtitle band must be outside the film strip).
- Counterexamples: adding a progress bar / play button on the frame to make it "more like a player" (already rejected by the user); a browser in this shot, film in the next; adding Ken Burns on top of the video; a retro browser wrapping this film's own product UI (two layers of UI); polaroid tilt >3° or a drop with rebound.

## 2. Type scale (1920×1080 baseline; portrait reuses the same sizes, narrower line width wraps naturally)

Chinese = PingFang SC (Apple's official Chinese face, same family character as SF) -> fallback Noto Sans SC / Source Han Sans;
Latin and numbers = SF Pro Display (`system-ui`); monospace = SF Mono / Menlo. **Numbers always use `font-variant-numeric: tabular-nums`** (rolling counters do not jump in width).

| token | Size/weight/line height | Use |
|---|---|---|
| hero | 128 / 600 / 1.08 | Hero big text used 1-2 times per film (hook number, core word of a punchline) |
| display | 88 / 600 / 1.12 | Act titles, chapter card numbers |
| headline | 64 / 600 / 1.2 | In-scene subtitles, chart titles |
| tagline | 48 / 600 / 1.25 | Card titles, main line of name bars |
| body | 44 / 400 / 1.5 | Card explanations, quote body |
| subtitle | 44 / 600 / 1.35 | Subtitles (see §5) |
| caption | 32 / 400 / 1.4 | Annotations, legends, title lines |
| micro | 24 / 400 / 1.3 | Source lines, legal lines (screen corners) |

- Weight ladder **mainly the two levels 400 / 600** (Apple's 300/700 are reserved for very special moments: 300 = whispered punchline, 700 = slammed text). 500 is forbidden.
- Latin/numbers at display and above get `letter-spacing: -0.02em` (Apple tight); Chinese letter spacing 0, do not imitate Latin negative tracking.
- ≤3 text hierarchy levels per screen; an explanation longer than 2 lines should be split into two beats.
- **One hero treatment per screen**: when several numbers/big words share a screen, only one gets the hero/display level treatment
  (large size/color block/color change), the rest drop to body/caption inline notes: three numbers in three hero treatments fight each other and read as messy.
- **Type size is accepted on a phone**: shrink the landscape final film to **390px wide** and review it; it passes only if every line is readable (a desktop full-screen preview is not the acceptance standard);
  when it does not fit, **delete secondary copy first before considering type size**, orphan single-character lines are forbidden.

## 3. Spacing · radius · shadow

- **Spacing base 16px**: 16 / 24 / 32 / 48 / 64 / 96 / 160. Content to canvas edge ≥96px (action-safe), titles ≥160px (title-safe).
- **Landscape main content column ≤1440px centered** (Apple content width lock); full width is only for full-bleed footage and the background layer.
- **Radius grammar** (three levels, not mixed): `12` small items (chips/tags) · `28` cards (screenshot cards/info cards) · `pill` action items (buttons/progress). Full-bleed acts = 0.
- **There is only one shadow**: `0 12px 60px rgba(0,0,0,0.22)`, only for "evidence footage resting on the background" (screenshots/photos/phone cases). Card hierarchy comes from hairline + background color difference; text never gets a shadow (a subtitle stroke is a readability measure, not a shadow). Glow in dark mode belongs to the L4 motion layer, managed by the motion system, not written into the layout.

## 4. Motion tokens (the time dimension of the layout)

| token | Value | Notes |
|---|---|---|
| enter | 0.2-0.8s | Entrance; starts with `power3.out` |
| exit | 0.15-0.5s | Exits are always lighter than entrances |
| punch | 5-9 frames | Accent; scale +0.02~0.04, decaying envelope |
| press | scale 0.95 for one beat | "Clicked/stamped" feedback (the video version of Apple's system-wide micro-interaction) |
| overlap | 12-16 frames | Transition overlap (transitions.tsx) |
| camera | `inOutSine` | The only easing for camera curves |

**Two kinds of "aged" micro-jitter are forbidden (user's finalized preference)**: line boil on hand-drawn lines (the "boiling" of swapping deformation frames at 8~12fps after drawing)
and stop-motion jitter on cut-out elements (randomly offset steps timing) are never done: elements that have finished drawing/landed rest clean.
The handmade feel is expressed through the shapes themselves (skew, curvature, white borders, tape, shadow); "life" during holds only goes through systematic channels:
extremely slow camera push/pull (Live idle and ambient breathing are not done).

## 5. Subtitle spec (by aspect ratio)

> Page geometry: grid / spacing tokens / alignment / centering / minimum type level / collisions / backing plate colors: the full spec is in `references/layout.md`; this section only covers subtitles themselves.

| | Landscape 1920×1080 (default) | Portrait 1080×1920 (Douyin) |
|---|---|---|
| Position | Bottom centered, bottom 100px | Bottom centered, bottom 350px (avoid UI) |
| Width | maxWidth 66% (≈1270px) | maxWidth 90% |
| Size | 44 / 600; >24 characters drop to 38 | 48 / 600; >15 characters shrink the size |
| Style | Light background: ink set plainly with no stroke; dark background: white text + 6px black stroke | White text + black stroke (whole sentence appears hard) |
| Component | motion-systems/Subtitles.tsx (plain typesetting) | components version (whole sentence appears hard) |

**Plain typesetting iron rule (canonical)**: bottom read-along subtitles **get no motion at all**: the whole sentence appears hard and leaves hard,
no fade in or out, no word-by-word coloring, no pop, no floating. The only exception is the `keyword-pop-highlight` keyword pop,
and at **most 3 times** per film, unless the user explicitly asks for more (the component's `keywords` prop has this limit self-check built in).

**Subtitles have no punctuation (canonical)**: bottom read-along subtitles contain no sentence punctuation/quotes/brackets/dashes/ellipses:
periods and question marks are always removed; the pauses of long sentences are expressed by **splitting cards** (split one sentence into several subtitle cards at the pauses, one breath per card),
and the emotion of questions is left to the voiceover's tone. The only exception: half-width dots inside numbers/model names (`v0.1.1`, `83.8`) are kept.
Also: on-screen text and subtitles must not be the same full sentence: on-screen text is a distillation of ≤12 characters (cinematography.md §4.5).

Persistent elements (logo/mascot/progress bar/person badge): in landscape put them **bottom left or bottom right, either is fine** (no platform UI intrusion); in portrait they must be bottom left (the right edge is Douyin's like column).
Hard constraints such as the lower-third band for person badges follow `host-footage.md` §5.

## 6. Do / Don't

**Do**
- At the start of every act first ask "which level is this act's background": background color switches replace chapter divider lines.
- Keyword emphasis = accent color change + punch, at most one per sentence.
- Evidence footage (screenshots) always gets a white-bordered card + the single shadow + a slight Ken Burns, like "a real object lying on the table".
- Numbers use tabular-nums + hero/display type levels, units at caption level placed after and faded in.
- Every shot keeps at least one empty quadrant throughout (the full layout budget table is in cinematography.md §4.5).

**Don't**
- No second accent color; no shadows on cards/buttons/text; no decorative gradients (atmosphere comes from footage and the env layer).
- Do not mix two radius grammars on the same screen; do not let text go outside action-safe.
- No negative tracking for Chinese; no 300/700 for body text.
- On-screen text does not copy a full subtitle/voiceover sentence; no second hero-treated number/big word on the same screen.

## 7. Implementation: derive theme.ts from this file

A new project materializes the tokens into code (light mode example):

```ts
export const C = {
  bg: '#ffffff', bgAlt: '#f5f5f7', ink: '#1d1d1f', dim: '#7a7a7a',
  hairline: '#e0e0e0', accent: '#0066cc',
  positive: '#248a3d', negative: '#d70015', marker: '#FFE949',
};
export const T = {
  hero: {fontSize: 128, fontWeight: 600, lineHeight: 1.08},
  display: {fontSize: 88, fontWeight: 600, lineHeight: 1.12},
  headline: {fontSize: 64, fontWeight: 600, lineHeight: 1.2},
  tagline: {fontSize: 48, fontWeight: 600, lineHeight: 1.25},
  body: {fontSize: 44, fontWeight: 400, lineHeight: 1.5},
  caption: {fontSize: 32, fontWeight: 400, lineHeight: 1.4},
  micro: {fontSize: 24, fontWeight: 400, lineHeight: 1.3},
};
// Background assets land as named tokens (recipes in §1.1); light-background acts reference BG.mesh for the whole act by default
export const BG = {mesh: '…§1.1 four pastel blobs radial…', grid: '…', spotlight: '…'};
export const SHADOW_EVIDENCE = '0 12px 60px rgba(0,0,0,0.22)';
export const RADII = {chip: 12, card: 28, pill: 999};
```

The ACTS act color temperature table in env.tsx (optional) takes its values from this film's palette; the static vignette is part of the act background recipe (light background `rgba(0,0,0,0.06~0.12)`, the extremely light level).
