# Fonts: sourcing, licenses, embedding

> Merged from: majedphotos/video-ad-editor (MIT), Barty-Bart/motion-graphics (MIT), heygen-com/hyperframes (Apache-2.0), lemomo-ai/lemo-opuscar (MIT), nateherkai/herk-edit-kit (MIT), alchaincyf/huashu-art-motion (MIT), nolangz/pixel2motion (MIT), AbubakrChan/product-launch-motion (MIT), plus ideas rewritten from hypit-ai/hypit. Dash characters replaced.

This file covers getting a font file legally into the project and making sure the render uses it. Which typeface to choose and pairing: see the ice-direction skill. Type sizes, kinetic type and captions: see the ice-type skill. Arabic shaping, kashida and Arabic font behavior: see the ice-arabic skill.

## 1. Where fonts come from

The order is owned by the ice-direction skill (`references/type-pairing.md` section 1): fonts the user supplies or the project holds come first; beyond those, installed system fonts and Google Fonts have no fixed order, and the family that suits the film best wins. This table covers the license step for each source.

| Source | Use when | License step |
|---|---|---|
| Font files the user supplies or the project holds (brand faces included) | Always first | Confirm the license covers video and embedding for this use; if not, use the documented substitute |
| Installed system fonts | The direction chose a system family as the best fit | Check the font's own license or EULA: copy its file into the project only when copying and embedding are allowed; otherwise the family is not available for this film |
| Google Fonts | The direction chose a Google Fonts family as the best fit | A disclosed network call (say so before the first download), made without a question (standing consent, `sourcing-and-licenses.md` section 0); skipped when the offline switch is on (`ICE_OFFLINE=1`, `downloads: off` in `sources.json`, or the user asked for offline work). Take the full file, not a subset (section 2): the css2 request sent with Ice's own plain User-Agent returns one full TTF per weight with every script; github.com/google/fonts holds the same families as full variable fonts with `OFL.txt` and `METADATA.pb`. Download the files and the license text (usually SIL OFL 1.1). Manifest `source.type: font-library`, the family page as `source.url` |
| Fontsource (api.fontsource.org, files on the jsDelivr CDN) | The direction chose an open family it lists; the same open catalog with no key | No key, no account. Its files are split by subset: fetch every subset the copy needs (an Arabic file and a Latin file) or take the full file from Google instead (section 2). Keep the OFL text; record the version fetched |
| GitHub releases of an open family | The newest version of an open family published by its designer | No key; download the release asset and its license file |
| A copy of an open-licensed family already on the machine (an earlier download, another project of the same user, a font cache) | Downloads are off or refused, and the direction chose that family | Copy the file and its license text into `assets/fonts/`; confirm the license from the text file itself; manifest `source.type: font-library` with the family's public page as `source.url` and `changes: "local copy, no download"` |
| The brand's own webfont seen on its site (`capture-brand.mjs` lists it in `font_faces`) | A real brand film | The file belongs to the brand: embed it only when the user holds a license; otherwise the closest free substitute, documented (section 4) |
| Other open releases (a foundry's open release, an open-font specimen site) | The user or the direction names one | Download the files and the license text |
| Fonts bundled with this plugin's engines or kits | The engine ships them | Their license file travels with them |
| Commercial fonts found inside third-party repos or captured sites | Never fetched by Ice; used only when the user owns a license or supplies the file | Captured webfonts belong to the site owner; capture does not grant a license |
| A user download Ice cannot fetch: Thmanyah (thmanyah sans and serif families, free for design and video use) and paid families the user owns | The direction or the user picks it; Thmanyah is offered for news, documentary and editorial films with Arabic on screen (the ice-direction skill, `references/type-pairing.md` section 1) | Ice cannot fetch it (an email form, or a purchase): one entry in `FETCH-LIST.md` (`project-folders.md` section 4b), the user downloads into `assets/inbox/` or a `local_libraries` folder (`sourcing-and-licenses.md` section 0). Thmanyah's license forbids redistribution, hosting and changes: copy it into the project's `assets/fonts/` for the render only, never commit it to a public repository, never bundle or ship it, never subset or edit the file; record `licensed` with its license name |
| Copies of commercial families already on the user's machine from font-sharing sites | The direction chose the family and the file is the user's | Usable (rights are the user's, `sourcing-and-licenses.md` section 0), recorded `needs purchase` and never as licensed; listed under "Needs a license before publishing" |

Rules:
- Get the files from the foundry or the open-font source, check script coverage, weights and license, and keep the source and the license file next to the font files.
- OFL fonts may be used commercially and redistributed with software; the font files may not be sold on their own. Keep the OFL text with every copy.
- Proprietary brand face unavailable: pick the closest free substitute and document it (name, why, what differs) in `ice/DIRECTION.md` and the delivery notes.

## 2. Script and weight coverage

- Check that the font has every glyph the film needs: Arabic letters and marks, Western and Arabic-Indic digits, currency signs, punctuation, Latin for mixed text. A missing glyph silently falls back to another font.
- **The subset trap.** Font services split a family into per-script files. An Arabic subset file (Google Fonts woff2 subsets, Fontsource `arabic-*` files) has no `:` and no Western digits; a Latin subset has no Arabic. Mixed copy then falls back glyph by glyph. Take the full file (the Google css2 TTF fetched with a plain User-Agent, or github.com/google/fonts), or ship every subset file the copy needs, and confirm with the coverage check below.
- Arabic subset loading in the browser (each weight loaded with Arabic sample text before the first frame, the Latin-only subset trap): the `ice-arabic` skill, `references/fonts-and-shaping.md` section 5.
- CJK: subset the font to the characters used (open-font services support text-specific subsets) to keep size reasonable.
- Variable fonts: use a file whose axis range covers every weight the film animates.

## 3. Embedding (the render never touches the network)

- Download woff2 or ttf files into the project (`assets/fonts/`, see `project-folders.md`) and declare them with local `@font-face`. Never link a web font service at render time.
- For a handoff to another tool or a single self-contained file, inline each brand font as a base64 `@font-face` source.
- Never reference a font by family name alone, system fonts included: names alias differently per machine, and some system font names render as a default serif in headless browsers. Bind every family, whatever its source, to a file inside the project.
- A `font-family` with no matching `@font-face` is an error, not a warning.
- **Never burn Arabic with ffmpeg `drawtext`.** Even with `text_shaping=1` it draws presentation-form code points: modern Arabic fonts show boxes for every letter, others lose isolated letters, and it crashes on `.woff2` files (tested 2026-10-29). Arabic text is drawn by the browser (`@font-face`) or by libass (the ffmpeg `ass` filter with complex shaping); Pillow only with raqm. Renderer results: the `ice-arabic` skill, `references/fonts-and-shaping.md` section 6.
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
