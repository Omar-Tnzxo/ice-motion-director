# Font loading, fallback and text measurement

Merged from heygen-com/hyperframes (Apache-2.0: frame-worker, determinism rules, creative typography, docs GSAP and send-to guides, lint rules), browser-use/video-use (MIT), Barty-Bart motion-graphics (MIT), nateherkai/herk-edit-kit (MIT), lemomo-ai/lemo-opuscar (MIT), alchaincyf/huashu-art-motion (MIT), the launch-motion group (MIT), yihui-dev community skills (camera-3d-captions, vox-explainer), Vincentwei1021/mg-styles-15 (MIT), Omar-Tnzxo/video-production-studio, plus ideas restated from hypit-ai/hypit, remotion-dev/skills, imMamdouhaboammar/motion-graphics-skills and Vincentwei1021/anything2explainer. Restructured; numbers kept.

Font licensing and sourcing: the `ice-assets` skill. Family choice and the font-source order (user or project fonts first, then installed system fonts and Google Fonts with no fixed order, best fit for the film; Google Fonts is a disclosed network call with an offline switch): the `ice-direction` skill, `references/type-pairing.md` section 1. Arabic font loading and shaping: the `ice-arabic` skill.

## 1. Ship font files, never names

1. Every family, whatever its source (user, project, system, Google Fonts or a font an engine happens to bundle), is bound to a file inside the project and declared with local `@font-face`; never a bare family name, never a web font service at render time, base64 inlining for portable renders: the `ice-assets` skill, `references/fonts.md` section 3, and the `ice-direction` skill, `references/type-pairing.md` section 1 step 4. An unbound name aliases silently to a default on a clean render machine.
2. Put the literal family name from the `@font-face` declaration on the element.
3. One `@font-face` per weight and style you use. Synthetic bold and italic are disabled in deterministic renders: declaring 700 on a regular file does not make it bold.
4. Licenses and embedding rights: the `ice-assets` skill, `references/fonts.md`.
5. For non-Latin text, use a shipped font that covers the script, or transliterate; choose fallback stacks per writing system, and order them deliberately (Latin face first or the CJK face first for a unified line); judge the pairing in the same line.
6. CJK fonts are large: subset to the characters used (keep full-width space at its correct width when subsetting).
7. Variable fonts: animate weight or width only through real axes (`wght`, `opsz`, `SOFT` via `font-variation-settings`); when laying out by measurement, pin the axes and set `font-optical-sizing: none`, or the optical size follows the rendered size and words overlap. Use a range font (`wght@100..900`) for a weight morph.
8. Connected compositions or scenes that open on their own must each load their own fonts.

## 2. Load before the first frame

- An embedded font does not load until something uses it, and frame 0 can paint in a fallback. Load every face explicitly before the first seek or capture: request it with `document.fonts.load('<weight> <size> "<family>"', sampleText)`; `document.fonts.ready` only waits for faces already requested.
- Then assert it: `document.fonts.check('<weight> <size> "<family>"')` must be true or the build throws. In image libraries (PIL and similar) pass an explicit font file path; never rely on a default font.
- Load with sample text in the target script so subset files for that script are fetched.
- Font loading slows parallel capture: lower the worker count if navigation times out on font loading.

## 3. Glyph coverage

- Fonts with missing glyphs fall back silently. Verify coverage for every character you render (currency, approx, not-equal, arrows, CJK punctuation) with a glyph check; keep a matching fallback for symbols.
- Some glyph checkers parse only WOFF1 or TTF: convert or check the TTF source.
- Never rebuild a logo or wordmark from a font; a missing mark is asked for: the `ice-assets` skill, `references/brand-authenticity.md` sections 3 and 4. Matching a reference typeface for other text (cap height, overlap and ink-weight ranking, width lock, documented substitution): the `ice-assets` skill, `references/fonts.md` section 4. Rendering detail for that width lock: `textLength` plus `lengthAdjust="spacingAndGlyphs"`, size tuned to the reference cap height in 2 to 3 iterations.
- Delivery gate: no fallback fonts or tofu in any frame (run by the `ice-qa` skill).

## 4. Measuring and fitting text

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

## 5. Determinism for animated text

- Animated text must be seekable: state changes use timeline sets, never callbacks that a seek does not fire; cursors and decorative blinkers use timeline sets at intervals, not CSS animations.
- Never `from(opacity 0)` at the same position as `set(opacity 1)` on the same element.
- One owner per (element, property) at any instant.
- Text inspection hooks must report an element's full text from its first visible frame (a typewriter that reports only the typed letters fails reading checks).
- Hard kill each caption group at its end.
