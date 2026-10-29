# Type system in motion: roles, weights, families, tracking

Merged from heygen-com/hyperframes (Apache-2.0: creative typography and house style, embedded-captions principles, frame presets), Tejashmakwana/motionmaxxing (Apache-2.0), diffusionstudio/lottie (MIT: design taste), nateherkai/herk-edit-kit (MIT), the launch-motion group (MIT), Barty-Bart and charlie947 motion-graphics (MIT), digitalsamba/claude-code-video-toolkit (MIT), Vincentwei1021/mg-styles-15 (MIT), Omar-Tnzxo/video-production-studio and brand-identity-studio, plus ideas restated from imMamdouhaboammar/motion-graphics-skills, Omar-Tnzxo/commercial-motion-design, bangtutorial/bang-motion, Vincentwei1021/video-talkcraft and vibe-motion/skills. Restructured; numbers kept.

Which families to use (the font-source order with user and project fonts first, pairing, brand substitutes, default-look fonts) is decided by the `ice-direction` skill, `references/type-pairing.md`. This file holds how type behaves once chosen.

## 1. Type is architecture

- Define text roles before sizes: hero display, main statement, human voice or question, support, label, micro. Separate roles by size, family, weight, width, leading, alignment and crop.
- Time is hierarchy: in video, sequence replaces position. Motion is typography: a 0.1 s slam and a 2 s fade say different things with the same word.
- Assign every active text unit an anchor, support or active role. One focus per screen: one element enters at a time; supporting layers sit one level lower in saturation, contrast and line width than the hero.
- At most three text levels per screen. Only one hero-styled number or big word per screen; others drop to inline body or caption.
- Never three levels in the heaviest weight at once; not every headline in Black. One expressive type moment beats six.
- The font-role map is a contract for the whole film, never swapped scene by scene. Verify the actual font from rendered pixels.

## 2. Weight and contrast

| Rule | Value | Scope |
|---|---|---|
| Weight contrast | Extreme: 300 vs 900 (not 400 vs 700) | Title and display systems |
| Quick system | Headlines 700 to 900, body 300 to 400 | Social, hype, explainers |
| Restrained system | One family; weight 400 default, 350 to 450 on pale grounds, 450 to 550 headlines, 600 only on the wordmark, 650 for one word, pill or UI label, 900 only for a blurred hero counter entrance | Product launch, app ad, UI walkthrough, brand film |
| Two-weight system | 400 and 600; 300 and 700 only for rare whisper or slam moments | Explainers, documentary |
| Sentence case | Weight 500 to 600; all-caps bold only for one emphasis scene | Explainers, product launch |
| Dark backgrounds | Body 350 instead of 400; line height plus 0.05 to 0.1; display tracking plus 0.01 em | All |
| Premium restraint | Large light-weight type can feel more premium than heavy bold in restrained institutional scenes; heavy bold suits loud social and title work | Brand film vs hype promo |
| Display font in titles | At least 600 for launch titles | Product launch, app ad |

## 3. Families per film (scoped)

How many families a film uses, per film type, and the pairing and voice rules: the `ice-direction` skill, `references/type-pairing.md` section 4.

Rendering side, held here:
- One main type idea per composition (editorial, utilitarian, kinetic, playful, premium).
- Where the film type allows three type voices (showreel, hype promo, music video), type may also work as texture: repeated wallpaper, bands, inversions.
- Weights per family follow section 2.

## 4. Tracking, leading, alignment

- Tracking tighter than web: display -0.03 to -0.05 em (restrained systems -1.5% to -5.5% em; captions -0.015 to -0.035 em). Body plus 0.005 to 0.015 em. Mono HUD labels tracked about 0.2 em.
- CJK never gets negative tracking; Latin and digits at display size do. Connected scripts never get letter-spacing (see the `ice-arabic` skill).
- Line pitch 1.15 to 1.35 em; hero display line height about 1.05.
- Headline to the line below: gap about 0.5 to 0.8 of the headline cap height; one consistent spacing step between sibling blocks.
- Two runs of different sizes in one row align by cap-height centers, not a shared baseline (a shared baseline makes the smaller run sink).
- Text attached to an object sits beside it, not forced to center. Statements are centered only when paced to speech, never as a page.
- Avoid narrow headline walls: widen the zone or show fewer words. Long sentences split into two lines with different weights (500 then 600) or the second line enters later.
- Two consecutive scenes must not match in text size class, entry direction and text position.
- Re-center for 2 to 5 word spoken lines; fixed slots for boxes, loops, badges, survivors and lines over 6 words; left-anchored for typed UI; right-aligned around a still caret for numeric fields.

## 5. Case, punctuation, emphasis

- Sentence case or lowercase by default; all caps for one emphasis scene, HUD labels or a declared caption style. Title Case for emphasis only in styles that declare it.
- Titles, claims and short phrases have no final period by default (especially 4 words or fewer). `?` only for real questions; `!` very rare; periods only for a deliberate two-short-sentence style; decide once in the style brief. Punctuation can be a separate element that appears last.
- No sentence-ending punctuation on ad lines unless required.
- Highlight one word per headline at most (hero color, animated underline, or a pill scaling in behind it about 5 frames after the word lands). Highlights are optional: without them, emphasis comes from dim-to-full word reveals, size or weight, a pause, or an object beside the word. If used: one highlight shape per video, not every sentence, different from previous projects; ornaments only from brand shapes. Highlight only the intended word.
- One emphasis device per line; never combine two on one line. Restrained systems also ban underline and glow emphasis.
- Never fake italics or width: no synthetic slant (except a declared CJK slant style), no stretching glyphs on one axis; animate width only on a real variable axis.
- Use OpenType alternates or swashes only when they solve composition (frame an element, make a path, anchor a baseline); list a font's features first.
- Bilingual pairs: the second language is a smaller grey subline, never the same size or the accent color; one line per language, never wrapped.
  Scope line: a caption in a second hue for another audible voice (`caption-styles.md`, preset "News sentence captions") is not a bilingual pair: it is the only caption line, in the film's language, coloured by whose voice is heard. The grey subline rule still holds whenever two languages show at once.
- Tagline under the logo: tracked-caps taglines are a slop tell in restrained films; prefer no tagline.
- Never invent a tagline that could pass as official without labeling the film a concept.
- On-screen copy is correct and natural: proof it (a typo in your own copy is not a style), idiomatic, proper punctuation for the script. On CJK fonts curly quotes and ellipsis are full-width: on English text use straight quotes and three periods.

## 6. Numbers

- `font-variant-numeric: tabular-nums` (plus `font-feature-settings: "tnum" 1`) whenever numbers count, stack or tick, so digits do not jitter. Diagonal fractions and all-small-caps where they help; no ligatures in code.
- Number and its unit stay on one line.
- Check display fonts for missing glyphs (currency, approx, not-equal); a lone slashed zero reads as an icon.
- Numbers and claims rendered exactly as the truth sheet (see the `ice-assets` skill).

## 7. Color of type

- Ink for restrained systems is charcoal, not pure black (pure black only on the hero figure or wordmark); secondary connective words dim grey that never turns white.
- One hue plus neutrals for captions; one accent for kinetic beats (accent hue exactly one in beat-slam styles).
- Ghost text and big year numbers: one style per video, visible fill opacity at least 0.18 to 0.25 (not 0.08 to 0.12).
- Glow on dark grounds only. Gradient fills on type are banned in restrained films and must be verified in capture where used (see `font-loading-and-measuring.md`).
- Scope line, broadcast package (news reel, edit type `news-reel`, style family `family-broadcast-news.md`, or a reference that measures it): display text may glow as measured (keyword halo 12 to 16 px in the brand's attention hue, tight 4 to 5 px glow on card text, 12 to 18 px white on headlines; values per package in `skills/ice-styles/references/family-broadcast-news.md` section 2), via `text-shadow`, on dark grounds, with its reason row. Captions, lower thirds and end-card small lines get no glow. The restrained-system ban on glow emphasis is unchanged elsewhere.
- Color roles and palette decisions: the `ice-direction` skill.
