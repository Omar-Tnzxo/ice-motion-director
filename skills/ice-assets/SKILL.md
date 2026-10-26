---
name: ice-assets
description: "Asset sourcing and truth for Ice Motion Director films: the truth sheet and facts.json claims ledger (names, prices, numbers, quotes rendered exactly from approved text, required disclaimers from the compliance note), brand asset authenticity (official logos, real logo on the final frame, text-set wordmark for a brand with no logo, asset manifest gate), real brand material (live site captures and a brand sheet of colors and fonts at the film's aspect ratios, official kits, UI rebuilds at 90 percent fidelity, the unofficial-concept label), license checks and a credits record for fonts, footage, images, icons, 3D, music and SFX, screen recordings and product UI capture, the AI-generated media policy, asset folders and naming, and what never to use. Called by Ice Motion Director workflows; use only when called by name."
license: Apache-2.0
metadata:
  author: Omar-Tnzxo
  version: 0.2.0
---

# ice-assets

Owns every piece of material that enters a film and every fact the film states. Workflows call this skill at intake (truth sheet), before storyboard (claims ledger and asset plan), during build (capture, sourcing, fonts) and before render (manifest and credits gate). Other domains: story and color choices (ice-direction), type and captions (ice-type), Arabic text and digits (ice-arabic), music selection and mixing (ice-audio), engine and render steps (ice-engines), final gates (ice-qa).

## Non-negotiables

1. **Truth.** Every claim, number, price, time, feature, name and place on screen or in the voiceover comes from the truth sheet, built from real sources. Never invent shops, prices, ratings, testimonials, quotes, people, results or features. Unknown means generic, a question to the user, or left out.
2. **Exact text.** Names, UI labels, quotes, prices and CTAs are copied character for character from their source and rendered by code. Text and numbers are never baked into generated media.
3. **Real over drawn.** Show the real product: recordings from the latest build, real photos, official logos. Rebuild a screen only when recording is impossible, and then only with real data, at 90 percent fidelity or better against a capture. No build exists yet (pre-launch, a "new" app): no UI screens; show the mechanism with objects, or one concept screen labelled as illustrative (`references/screen-capture.md` section 5).
4. **Authentic identity.** Never fabricate, redraw, trace or generate a logo, wordmark, product, interface, mascot or named person. No verified original: ask for it in the stage 01 message (own brand with a logo; after 01, the default of `references/brand-authenticity.md` section 10 step 6 applies), set the name as a text-set wordmark (own brand the user confirmed has no logo), or write the name as text (third party, or a real brand with no official file). The final frame shows the real logo file, the text-set wordmark when no logo exists, or the name as text with the reason in the delivery note.
5. **Real brands use their real material.** A named real company, product, app or site (or a reference brand chosen for the field) is captured live and taken from official sources: screens, colors and fonts read from its own site, untouched official logos. Never invent or guess a brand's look; a film for a brand the user does not own ends "Unofficial concept, not affiliated with <brand>" (`references/brand-authenticity.md` section 10).
6. **Licensed or absent.** Every external item has a known license that allows this use, recorded at download time. Unknown license means do not ship.
7. **AI media is optional, secondary, user-initiated and disclosed.** Default scope is backgrounds and plates; never text, numbers, logos, UI or real people.
8. **Local and deterministic.** Every asset is in the user's project before render; nothing is fetched at render time.
9. **Ask before spending, inside the allowed stops.** Downloads, account actions and paid generation are asked once, in the stage 01 message (auto mode) or on a review card (step mode), with the exact item, its site, size and cost; the router's stops table (`ice-motion-director/SKILL.md` section 5, "Stops") is the only list of stops. Not approved there: official brand files follow `references/brand-authenticity.md` section 10 step 6 (the brand's own domain only, each recorded); every other third-party download, account action and paid generation is not made: use local, bundled or code-built material, log it in `ice/DIRECTION.md` and list it in the delivery note. Google Fonts files are a disclosed network call (`references/fonts.md` section 1), not a question.

## Workflow (run in this order; each step names its file)

| Step | When | Do | Output | Read |
|---|---|---|---|---|
| 1. Locate inputs | Stage 01, before the question message | Find every file the user says they supplied. Documents (brief, script, storyboard, design notes): read and classify them by the ice-direction skill's `intake-and-brief.md` section 8. Footage and audio: probe them. A file that cannot be found is one line in the stage 01 message with concrete routes (folder path, drive link, direct link) | Inventory list | Footage: `references/screen-capture.md` section 8 |
| 2. Truth sheet | Stage 01, after the question message; before any script line | Build from product, owner, public pages; approved figures, exact text, negative list; required disclaimers and restricted claims copied from `ice/research/COMPLIANCE.md` | `ice/assets/TRUTH.md` | `references/truth-sheet.md` sections 1 to 4, 6 and 12 (disclaimers), `assets/truth-sheet.template.md` |
| 3. Brand intake | Stage 01: the brand material plan (steps 1 to 5 of section 10) before the question message, downloads (step 6) after it | Official logos through the logo gate, typed hex codes, fonts, brand capture. A `real_brand` slot in the brief: run the real brand material procedure (official sources, `scripts/capture-brand.mjs` at the film's ratios, colors and fonts from the brand sheet, the download list inside the stage 01 message, unofficial label). No logo exists: text-set wordmark | Manifest rows, `assets/brand/`, `assets/capture/<brand>/`, `ice/assets/brand-sheet.json`, `ice/assets/BRAND-MATERIAL.md` | `references/brand-authenticity.md` sections 3 and 10 (section 4 only when no official logo file exists) |
| 4. Claims ledger | With the script and storyboard | One entry per claim with source sentence or `generated` label; storyboard rows carry claim ids | `ice/assets/facts.json` | `references/truth-sheet.md` sections 9 and 10 |
| 5. Asset plan | Storyboard | For each shot: capture, supplied, code-built, licensed or (if allowed) generated | Asset list per shot | `references/asset-rules.md` sections 1 and 2, `references/sourcing-and-licenses.md` section 1 |
| 6. Capture | Build | Record app, web or desktop; fix frame rate, drops, crop; a real brand: UI rebuilds and other rights holders' content | `assets/capture/` | `references/screen-capture.md`; a real brand: `references/brand-authenticity.md` section 11 |
| 7. Source and license | Build | Find, check license, download, prepare | `assets/*`, `CREDITS.md` rows | `references/sourcing-and-licenses.md`, `references/fonts.md` |
| 8. Generate (optional) | Only if the user allowed it | Within tier, with ledger and inspection | `generated.json` | `references/ai-media-policy.md` |
| 9. Pre-render gate | Before final render | Manifest checks pass, facts check passes or is N/A with reason, every font local, credits complete | Gate result to `ice/review/` | `references/asset-rules.md` section 3 |

## Files

Required at stage 01: this file down to the end of this section; `references/truth-sheet.md` sections 1 to 4, 6 and 12 with `assets/truth-sheet.template.md`. Only if `real_brand` is not `none`: `references/brand-authenticity.md` sections 3 and 10 (section 4 only when no official logo file exists). Only for real-screens films (app ad, UI walkthrough, product launch with screens): `references/screen-capture.md` sections 1 and 2. Every other file, and every other section, only when its row below applies.

| File | Open when |
|---|---|
| `references/truth-sheet.md` | Writing or checking any script line, number, quote, name, label or claim (section 5 from 03 on); building `TRUTH.md` and `facts.json`; required disclaimers (section 12) |
| `references/asset-rules.md` | The asset plan (step 5): the source for each shot and the scoped rules; the pre-render gate (step 9) |
| `references/brand-authenticity.md` | Handling any logo, wordmark (including a brand with no logo), product image, mascot, partner mark, brand capture from a URL, a real brand named in the brief (section 10), design files, or the asset manifest |
| `references/sourcing-and-licenses.md` | Finding stock footage, photos, archival images, icons, flags, 3D, textures, music or SFX; checking a license; the never-use list; credits |
| `references/fonts.md` | Getting, licensing, embedding or verifying a font file; matching a reference typeface |
| `references/screen-capture.md` | Recording an app, site or desktop; fixing frame rate, dropped frames or a phone-recording crop; capture vs rebuild; product photos and cutouts; probing user footage |
| `references/ai-media-policy.md` | The user asks for AI images, video or voice, or an asset is missing and generation might be offered |
| `references/project-folders.md` | Creating the asset folders, naming files, writing `manifest.json`, `CREDITS.md`, delivery notes |
| `assets/truth-sheet.template.md` | Copy to `ice/assets/TRUTH.md` at step 2 |
| `assets/asset-manifest.example.json` | Starting `ice/assets/manifest.json` at step 3 (slots only, replace every one) |
| `scripts/validate-assets.mjs` | Step 9 asset gate, and after any asset is added or changed (Node, no dependencies; exit 1 on FAIL) |
| `scripts/facts.mjs` | `init` at step 4; check at step 9 (Node, no dependencies; a missing facts file is a FAIL) |
| `scripts/capture-brand.mjs` | Step 3 for a real brand: captures at the film's ratios in the film's language (`--lang`) plus a brand sheet per page (`--sheet ice/assets/captures/<brand>/<page>.json`: colors, inks, fonts, tokens, button accent, logo candidates, interface strings, redirects, consent answer); act on its warnings (`brand-authenticity.md` section 10 step 3); the main page's sheet is copied to `ice/assets/brand-sheet.json`, the one path every skill reads. Node, a local Chrome or Edge (`ICE_CHROME`); `--help` |
| `scripts/detect_crop.py` | A phone or screen recording has bars or UI bands around the picture (Python, ffmpeg; numpy and opencv-python-headless optional, pinned in `scripts/requirements.txt`) |
| `scripts/vectorize.py` | AI art the user started (rung 3 of the ladder of art sources, `references/sourcing-and-licenses.md` section 1b) must become layered SVG: one named group per colour region; the traced art still moves as one piece until its parts are rebuilt (Python; vtracer pinned in `scripts/requirements.txt`) |

Minimum Node, Python and FFmpeg versions for these scripts: `runtimes` in the `ice-engines` skill's `references/versions.json`.
