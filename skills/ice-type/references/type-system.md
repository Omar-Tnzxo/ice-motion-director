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
- Highlight one word per headline at most (hero color, animated underline, or a pill scaling in behind it about 5 frames after the word lands). Highlights are optional: without them, emphasis comes from dim-to-full word reveals, size or weight, a pause, or an object beside the word. If used: one highlight shape per video, not every sentence, different from previous projects; ornaments only from brand shapes. Kinetic type films are the measured exception: two or more treatments mixed in one accent hue, on about a third of the lines (the `ice-film` skill, `references/genres/kinetic-type.md`). Highlight only the intended word.
- One emphasis device per line; never combine two on one line. Restrained systems also ban underline and glow emphasis.
- Never fake italics or width: no synthetic slant (except a declared CJK slant style), no stretching glyphs on one axis; animate width only on a real variable axis.
- Use OpenType alternates or swashes only when they solve composition (frame an element, make a path, anchor a baseline); list a font's features first.
- Bilingual pairs: the second language is a smaller grey subline, never the same size or the accent color; one line per language, never wrapped.
  Scope line: a caption in a second hue for another audible voice (`caption-styles.md` section 6, rule 5; preset "News sentence captions" is its measured case) is not a bilingual pair: it is the only caption line, in the film's language, coloured by whose voice is heard. The grey subline rule still holds whenever two languages show at once.
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
- One hue plus neutrals for captions (a second hue only for a second audible voice: `caption-styles.md` section 6, rule 5); one accent for kinetic beats (accent hue exactly one in beat-slam styles).
- Ghost text and big year numbers: one style per video, visible fill opacity at least 0.18 to 0.25 (not 0.08 to 0.12).
- Glow on dark grounds only. Gradient fills on type are banned in restrained films by default and must be verified in capture where used (see `type-system.md` (section "Font loading, fallback and text measurement")); a chrome, gradient-brand or dreamy style, or the brand's own gradient wordmark, uses them with its plan row, and thin Arabic joins keep their legibility check.
- Scope line, measured or declared glow on display text (a reference that measures it, or a chosen style whose medium is light: illustration only, several kinds: neon titles, CRT or arcade titles, broadcast titles; the plan row: the `ice-direction` skill, `references/treatment.md` section "Craft plan"): display text may glow at the measured or stated radius, via `text-shadow`, on dark grounds, with its reason row. The measured case is the broadcast package (news reel, edit type `news-reel`, style family `family-broadcast-news.md`): keyword halo 12 to 16 px in the brand's attention hue, tight 4 to 5 px glow on card text, 12 to 18 px white on headlines (values per package in `skills/ice-styles/references/family-broadcast-news.md` section 2). Captions, lower thirds and end-card small lines get no glow unless measured. The restrained-system ban on glow emphasis is unchanged elsewhere.
- Color roles and palette decisions: the `ice-direction` skill.


## Font loading, fallback and text measurement

Merged from heygen-com/hyperframes (Apache-2.0: frame-worker, determinism rules, creative typography, docs GSAP and send-to guides, lint rules), browser-use/video-use (MIT), Barty-Bart motion-graphics (MIT), nateherkai/herk-edit-kit (MIT), lemomo-ai/lemo-opuscar (MIT), alchaincyf/huashu-art-motion (MIT), the launch-motion group (MIT), yihui-dev community skills (camera-3d-captions, vox-explainer), Vincentwei1021/mg-styles-15 (MIT), Omar-Tnzxo/video-production-studio, plus ideas restated from hypit-ai/hypit, remotion-dev/skills, imMamdouhaboammar/motion-graphics-skills and Vincentwei1021/anything2explainer. Restructured; numbers kept.

Font licensing and sourcing: the `ice-assets` skill. Family choice and the font-source order (user or project fonts first, then installed system fonts and Google Fonts with no fixed order, best fit for the film; Google Fonts is a disclosed network call with an offline switch): the `ice-direction` skill, `references/type-pairing.md` section 1. Arabic font loading and shaping: the `ice-arabic` skill.

### 1. Ship font files, never names

1. Every family, whatever its source (user, project, system, Google Fonts or a font an engine happens to bundle), is bound to a file inside the project and declared with local `@font-face`; never a bare family name, never a web font service at render time, base64 inlining for portable renders: the `ice-assets` skill, `references/fonts.md` section 3, and the `ice-direction` skill, `references/type-pairing.md` section 1 step 4. An unbound name aliases silently to a default on a clean render machine.
2. Put the literal family name from the `@font-face` declaration on the element.
3. One `@font-face` per weight and style you use. Synthetic bold and italic are disabled in deterministic renders: declaring 700 on a regular file does not make it bold.
4. Licenses and embedding rights: the `ice-assets` skill, `references/fonts.md`.
5. For non-Latin text, use a shipped font that covers the script, or transliterate; choose fallback stacks per writing system, and order them deliberately (Latin face first or the CJK face first for a unified line); judge the pairing in the same line.
6. CJK fonts are large: subset to the characters used (keep full-width space at its correct width when subsetting).
7. Variable fonts: animate weight or width only through real axes (`wght`, `opsz`, `SOFT` via `font-variation-settings`); when laying out by measurement, pin the axes and set `font-optical-sizing: none`, or the optical size follows the rendered size and words overlap. Use a range font (`wght@100..900`) for a weight morph.
8. Connected compositions or scenes that open on their own must each load their own fonts.

### 2. Load before the first frame

- An embedded font does not load until something uses it, and frame 0 can paint in a fallback. Load every face explicitly before the first seek or capture: request it with `document.fonts.load('<weight> <size> "<family>"', sampleText)`; `document.fonts.ready` only waits for faces already requested.
- Then assert it: `document.fonts.check('<weight> <size> "<family>"')` must be true or the build throws. In image libraries (PIL and similar) pass an explicit font file path; never rely on a default font.
- Load with sample text in the target script so subset files for that script are fetched.
- Font loading slows parallel capture: lower the worker count if navigation times out on font loading.

### 3. Glyph coverage

- Fonts with missing glyphs fall back silently. Verify coverage for every character you render (currency, approx, not-equal, arrows, CJK punctuation) with a glyph check; keep a matching fallback for symbols.
- Some glyph checkers parse only WOFF1 or TTF: convert or check the TTF source.
- Never rebuild a logo or wordmark from a font; a missing mark is asked for: the `ice-assets` skill, `references/brand-authenticity.md` sections 3 and 4. Matching a reference typeface for other text (cap height, overlap and ink-weight ranking, width lock, documented substitution): the `ice-assets` skill, `references/fonts.md` section 4. Rendering detail for that width lock: `textLength` plus `lengthAdjust="spacingAndGlyphs"`, size tuned to the reference cap height in 2 to 3 iterations.
- Delivery gate: no fallback fonts or tofu in any frame (run by the `ice-qa` skill).

### 4. Measuring and fitting text

- Measure or fit text only after fonts finish loading, with identical font properties for measuring and rendering. Never trust a width measured before the web font loaded.
- Dynamic text: fit with a measurement helper (for example HyperFrames `fitTextFontSize(text, { maxWidth, fontFamily, fontWeight })` and its pretext measurement API); give a font string like `"<weight> <size>px <family>"`.
- Under a camera scale or transform, measure with canvas `measureText` or offset metrics, not transformed DOM rects.
- Use `outline` instead of `border` on measured boxes so measurement matches render.
- `em` gaps and margins in flex containers resolve against the parent font size (often 16 px), not the text size: use px values around big type.
- No `<br>` in body text: forced breaks ignore the rendered font width. Exception: short display titles where each word is deliberately on its own line.
- Every single-line display phrase gets `nowrap` plus a measured width check against the frame; shrink-to-fit wrapping of Latin names happens silently.
- Text elements that are transformed must be block-level and sized; pulsing absolutely positioned decoratives need clearance at their peak size.
- Caption elements are absolutely positioned; `overflow: visible` (never hidden) so scaled words are not clipped; center with explicit width and offset, not `left: 50%; translateX(-50%)`; max width 1600 px landscape, 900 px portrait. Small overflow warnings (1 to 4 px) on scaled highlight words are known false positives.
- If letters will stagger, give each its own element; a single text node cannot cascade. No baked transforms that fight the choreography.
- CJK line boxes sit ink 3 to 7 px low: pre-offset centered CJK text; Latin needs no offset and no horizontal squeeze.
- Any group scale multiplies the font size for legibility checks.

### 5. Determinism for animated text

- Animated text must be seekable: state changes use timeline sets, never callbacks that a seek does not fire; cursors and decorative blinkers use timeline sets at intervals, not CSS animations.
- Never `from(opacity 0)` at the same position as `set(opacity 1)` on the same element.
- One owner per (element, property) at any instant.
- Text inspection hooks must report an element's full text from its first visible frame (a typewriter that reports only the typed letters fails reading checks).
- Hard kill each caption group at its end.
