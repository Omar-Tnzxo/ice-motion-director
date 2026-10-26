# Fonts: sourcing, licenses, embedding

> Merged from: majedphotos/video-ad-editor (MIT), Barty-Bart/motion-graphics (MIT), heygen-com/hyperframes (Apache-2.0), lemomo-ai/lemo-opuscar (MIT), nateherkai/herk-edit-kit (MIT), alchaincyf/huashu-art-motion (MIT), nolangz/pixel2motion (MIT), AbubakrChan/product-launch-motion (MIT), plus ideas rewritten from hypit-ai/hypit. Dash characters replaced.

This file covers getting a font file legally into the project and making sure the render uses it. Which typeface to choose and pairing: see the ice-direction skill. Type sizes, kinetic type and captions: see the ice-type skill. Arabic shaping, kashida and Arabic font behavior: see the ice-arabic skill.

## 1. Where fonts come from

The order is owned by the ice-direction skill (`references/type-pairing.md` section 1): fonts the user supplies or the project holds come first; beyond those, installed system fonts and Google Fonts have no fixed order, and the family that suits the film best wins. This table covers the license step for each source.

| Source | Use when | License step |
|---|---|---|
| Font files the user supplies or the project holds (brand faces included) | Always first | Confirm the license covers video and embedding for this use; if not, use the documented substitute |
| Installed system fonts | The direction chose a system family as the best fit | Check the font's own license or EULA: copy its file into the project only when copying and embedding are allowed; otherwise the family is not available for this film |
| Google Fonts | The direction chose a Google Fonts family as the best fit | A disclosed network call (say so before the first download); skipped when the offline switch is on (`ICE_OFFLINE=1` or the user asked for offline work). Download the files and the license text (usually SIL OFL 1.1). Manifest `source.type: font-library`, the family page as `source.url` |
| A copy of an open-licensed family already on the machine (an earlier download, another project of the same user, a font cache) | Downloads are off or refused, and the direction chose that family | Copy the file and its license text into `assets/fonts/`; confirm the license from the text file itself; manifest `source.type: font-library` with the family's public page as `source.url` and `changes: "local copy, no download"` |
| The brand's own webfont seen on its site (`capture-brand.mjs` lists it in `font_faces`) | A real brand film | The file belongs to the brand: embed it only when the user holds a license; otherwise the closest free substitute, documented (section 4) |
| Other open releases (a foundry's open release, an open-font specimen site) | The user or the direction names one | Download the files and the license text |
| Fonts bundled with this plugin's engines or kits | The engine ships them | Their license file travels with them |
| Commercial fonts found inside third-party repos or captured sites | Never, unless the user owns a license | Captured webfonts belong to the site owner; capture does not grant a license |

Rules:
- Get the files from the foundry or the open-font source, check script coverage, weights and license, and keep the source and the license file next to the font files.
- OFL fonts may be used commercially and redistributed with software; the font files may not be sold on their own. Keep the OFL text with every copy.
- Proprietary brand face unavailable: pick the closest free substitute and document it (name, why, what differs) in `ice/DIRECTION.md` and the delivery notes.

## 2. Script and weight coverage

- Check that the font has every glyph the film needs: Arabic letters and marks, Western and Arabic-Indic digits, currency signs, punctuation, Latin for mixed text. A missing glyph silently falls back to another font.
- Arabic subset loading (each weight loaded with Arabic sample text before the first frame, the Latin-only subset trap): the `ice-arabic` skill, `references/fonts-and-shaping.md` section 5.
- CJK: subset the font to the characters used (open-font services support text-specific subsets) to keep size reasonable.
- Variable fonts: use a file whose axis range covers every weight the film animates.

## 3. Embedding (the render never touches the network)

- Download woff2 or ttf files into the project (`assets/fonts/`, see `project-folders.md`) and declare them with local `@font-face`. Never link a web font service at render time.
- For a handoff to another tool or a single self-contained file, inline each brand font as a base64 `@font-face` source.
- Never reference a font by family name alone, system fonts included: names alias differently per machine, and some system font names render as a default serif in headless browsers. Bind every family, whatever its source, to a file inside the project.
- A `font-family` with no matching `@font-face` is an error, not a warning.
- Request each face before measuring text (for example `document.fonts.load()` for each family and weight); a generic "fonts ready" wait does not request a face that nothing has used yet. Engine-specific steps: see the ice-engines skill.

## 4. Matching a wordmark or a reference typeface

When a design needs a typeface that looks like a reference (never to rebuild a logo, see `brand-authenticity.md`):
1. List the fonts actually installed or downloaded; name-based font stacks silently fall back.
2. Set candidates at the reference's cap height, then rank by shape overlap of the rendered region and by ink-weight ratio; a weight ratio near 1 beats a slightly higher overlap.
3. Lock the width with a text-length adjustment if needed, and document the substitution.

## 5. Verification

- Render a test frame with every family, weight and script used, and compare against the expected glyphs (no tofu boxes, no fallback serif, correct Arabic joining).
- QA checks that the brand font loaded with no fallback in the delivered frames (see the ice-qa skill).
- Every font file has a row in `ice/assets/CREDITS.md` with its license.
