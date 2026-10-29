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
      FETCH-LIST.md       items only the user can download: accounts, subscriptions, purchases (section 4b)
      sources/            one download sidecar per fetched file, <file name>.json (section 3b)
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
    overlays/             real filmed overlays: dust, scratches, film leader, smoke, fire, light leaks (sourcing-and-licenses.md section 4b)
    luts/                 .cube LUTs: the user's, real print-film LUTs, or one generated for the film
    inbox/                files the user downloads from FETCH-LIST.md; emptied by Ice (section 4b)
  temp/                   downloads in progress (temp/dl/), the fetch cache (temp/cache/), drafts, reference videos for analysis; never committed
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

## 3b. Download sidecar

Every file Ice fetches from a route (`sourcing-and-licenses.md` section 4) gets one sidecar, `ice/assets/sources/<file name>.json`, written at download time (a working record in `ice/assets/`, so it needs no manifest row of its own), plus its manifest row (section 3) and its `CREDITS.md` row (section 4). Fields:

```json
{ "file": "assets/<folder>/<file>", "route": "<route id from sourcing-and-licenses.md section 4>",
  "title": "<title at the source>", "author": "<creator or owner>",
  "license": "<license id or none>", "license_url": "<https link or none>",
  "license_status": "licensed | unknown | needs purchase",
  "source_url": "<the page the item was found on>", "media_url": "<the file URL fetched>",
  "rendition": "original | preview | <height>p", "window": "<start-end in seconds, or full>",
  "probe": { "codec": "<codec>", "width": 0, "height": 0, "fps": 0, "duration_s": 0, "bytes": 0 },
  "fetched": "<YYYY-MM-DD>", "sha256": "<checksum>" }
```

`probe` holds the ffprobe facts of the saved file (`width`, `height` and `fps` only for pictures and video). A file that came from `assets/inbox/` has `route: "user-download"` and the subscription or store it came from as `source_url` when the user gave it.

## 4. CREDITS.md

One table, one row per external item (paste-ready credit for attribution licenses):

| File | Site | Original URL | Owner | License status (`licensed` with id and version, `unknown`, `needs purchase`) | Author / attribution text | Changes | Used in | Checked |
|---|---|---|---|---|---|---|---|---|

Rows whose status is `unknown` or `needs purchase`, or whose license does not cover the brief's use, are listed again in the delivery notes under "Needs a license before publishing" (`sourcing-and-licenses.md` section 0).

## 4b. FETCH-LIST.md and the inbox

Ice never signs in, buys or uses a subscription by itself (`sourcing-and-licenses.md` section 0). When the best item sits behind one (a news agency, a stock or music subscription, a model store, a font sent by email form, a page that needs a sign-in), Ice writes one entry per needed item in `ice/assets/FETCH-LIST.md`, in plain words:

| # | Scene or use | What to get | Where (the site, and a direct search or item link when there is one) | Measured target (length, resolution, BPM window, key or mood, as the item needs) | Save as | Status (`waiting`, `received`, `skipped`) |
|---|---|---|---|---|---|---|

The user downloads into `assets/inbox/`. Ice picks each file up, matches it to its entry, probes and measures it, renames it by section 2, moves it to its folder with its manifest row, sidecar and credits row, and marks the entry `received`; the scene meanwhile uses the next free rung of the ladder (`sourcing-and-licenses.md` section 1) and swaps in the received file. `assets/inbox/` is empty at the pre-render gate (a file left there has no manifest row and fails it). Entries still `waiting` at delivery are listed in the delivery note.

## 5. Delivery notes (asset part)

The delivery notes written by the workflow include: what is real (captured UI, copy, footage) and what is illustrative or generated; the facts check result and which claims a human verified; the permissions list (the ice-qa skill, `delivery-report.md` section 2: logo and trademark, captured UI, brand fonts, third-party content left in screens, music sync, likeness, draft disclaimer wording); official files downloaded under the default, with where each came from (`brand-authenticity.md` section 10 step 6); every route contacted and every file fetched without a question (standing consent, `sourcing-and-licenses.md` section 0); the open `FETCH-LIST.md` entries; the music license; the credits; any substituted font or tool. QA owns the rest of the delivery report (see the ice-qa skill).
