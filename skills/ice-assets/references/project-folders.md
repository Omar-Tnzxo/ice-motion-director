# Asset folders, naming and record formats in the user's project

> Merged from: Omar-Tnzxo/video-production-studio (owner), Barty-Bart/motion-graphics (MIT, CREDITS.txt and manifest fields), edenfunf/reelmimic (MIT, ASSETS.md rows), heygen-com/hyperframes (Apache-2.0, project-relative paths), plus ideas rewritten from vibe-motion/skills (asset manifest) and imMamdouhaboammar/motion-graphics-skills (ASSETS.md log). Dash characters replaced.

Everything below lives in the user's project, never inside this skill folder. Never assume a sibling-relative path to another project or skill: the project may live anywhere.

## 1. Layout

```
<project>/
  ice/
    assets/
      TRUTH.md            truth sheet (template: assets/truth-sheet.template.md)
      facts.json          claims ledger (truth-sheet.md section 10)
      manifest.json       one row per asset used in the film (section 3)
      CREDITS.md          one row per external item (section 4)
      generated.json      generation ledger (ai-media-policy.md section 7)
      BRAND-MATERIAL.md   real brand material ledger: item, source, date, status (brand-authenticity.md section 10)
      brand-sheet.json    the main page's brand sheet, the one every skill reads (brand-authenticity.md section 10 step 3)
      captures/<brand>/   per-page brand sheets written by capture-brand.mjs --sheet (working records, no manifest row)
  assets/
    brand/                logo masters (SVG first), brand kit files, exactly as received
    fonts/                font files plus their license texts
    capture/              screen recordings and screenshots (CFR copies), with capture date and build in the manifest; capture/<brand>/<page>/ holds capture-brand.mjs shots (PNGs; older runs also left brand-sheet.json here, which the gate accepts)
    footage/              user footage (read only) and licensed stock clips
    images/               photos, cutouts, textures, plates
    audio/                licensed or supplied music, SFX and voice recordings as received (selection: ice-audio skill; generated score, stems and mixes live in ice/audio/)
    generated/            accepted generated items only (drafts stay in a temp folder)
    3d/                   models, HDRIs, PBR textures
  temp/                   downloads in progress, drafts, reference videos for analysis; never committed
```

Rules:
- Asset paths in compositions are project-root relative; never `../` chains, never a network import, never a remote URL at render time.
- Keep originals as received in `assets/brand/` and `assets/footage/`; edits go to new files.
- Large originals (raw generations, 4K masters of stock) stay out of version control; the film uses compressed copies (WebP or compressed PNG for stills, CFR H.264 for clips).
- Never invent asset filenames in compositions: every path must exist and have a manifest row.

## 2. Naming

`<role>_<subject>_<variant>_<source>.<ext>`, lowercase, hyphens inside words, no spaces, Latin characters only (Arabic and other scripts belong in the manifest `label`, not the filename). Slots, illustration only:
- `logo_<brand>_mono-light_official.svg`
- `capture_<feature>_<lang>_<build>.mp4`
- `photo_<subject>_cutout_<source>.webp`
- `sfx_<event>_<library-id>.wav`

Delivery file names belong to the render stage (see the ice-engines skill).

## 3. manifest.json

```json
{ "version": 1, "assets": [
  { "id": "<a1>", "role": "<role from brand-authenticity.md section 9>", "label": "<human name in any language>",
    "path": "assets/<folder>/<file>",
    "source": { "type": "<allowed type>", "url": "<https link or user-provided://original-name>" },
    "verified_against": "<page or file compared with>", "checked": "<YYYY-MM-DD>",
    "rights": { "owner": "<owner>", "license": "<name and version>", "use": "<allowed use>", "attribution": "<text or none>" },
    "authenticity": "verified | generated | code-built | text-set",
    "sha256": "<optional checksum>",
    "used_in": ["<scene or shot ids>"], "changes": "<crops, cutouts, grades applied>" } ] }
```

Extra fields by case (checked by `scripts/validate-assets.mjs`): a text-set wordmark (no logo exists) has `text`, `font` and `no_logo_confirmed` and needs no `path`; a code-built `ui` or `product` rebuild has `verified_against` (the local capture) and `fidelity` (`score` 0.9 or more, `checked_by`, `sheet`, `share_sheet`); a code file that rebuilds several captures takes a list in `verified_against` and one `fidelity` entry per capture (`against` plus the same fields), or one row per capture sharing the `path`. Rules: `brand-authenticity.md` sections 4, 9 and 10. A drawn hero object (character, object, vehicle, machine, building, scene) also records `source_rung`, 1 to 5: its rung on the ladder of art sources (`sourcing-and-licenses.md` section 1b), with the reason the higher rungs did not fit logged in `ice/DIRECTION.md`.

## 4. CREDITS.md

One table, one row per external item (paste-ready credit for attribution licenses):

| File | Site | Original URL | License and version | Author / attribution text | Changes | Used in | Checked |
|---|---|---|---|---|---|---|---|

Rows whose license is unclear say "license unconfirmed" in the license column and are listed again in the delivery notes.

## 5. Delivery notes (asset part)

The delivery notes written by the workflow include: what is real (captured UI, copy, footage) and what is illustrative or generated; the facts check result and which claims a human verified; the permissions list (the ice-qa skill, `delivery-report.md` section 2: logo and trademark, captured UI, brand fonts, third-party content left in screens, music sync, likeness, draft disclaimer wording); official files downloaded under the default, with where each came from (`brand-authenticity.md` section 10 step 6); the music license; the credits; any substituted font or tool. QA owns the rest of the delivery report (see the ice-qa skill).
