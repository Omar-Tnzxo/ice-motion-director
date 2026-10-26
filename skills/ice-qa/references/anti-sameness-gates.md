# Anti-sameness gates

The checks that stop every film from converging on one look. The system itself (research, pitch round, decision log, the fingerprint record format) is owned by the ice-direction skill; this file is how ice-qa enforces it on the plan and the render. Sources: huashu-art-motion (MIT), lemo-opuscar (VERBATIM_OK), bang-motion (MIT), product-launch-motion (MIT), motionmaxxing (Apache), Barty-Bart and charlie947 (MIT), claude-code-video-toolkit (MIT), video-ad-editor, awesome-opus video list (MIT list text), founder skills; IDEAS_ONLY sources rewritten.

## 1. Default-look gate (blue and purple)

The gate, its thresholds and the valid reasons are defined in the ice-direction skill, `references/anti-sameness.md` section 5. This section only says which script measures what.

| Check | Tool | Light |
|---|---|---|
| Palette on the plan | `storyboard_lint.py` check 13 flags every palette hex in the zone (a stricter pre-check than the owner's ground, surface or dominant accent rule) | red; yellow with an `Allow blue-purple: <reason>` line, where the reason is one the owner accepts (brand palette, user named the colours, the subject's real colours) or names the hex's small semantic role |
| Render | `film_gate.py` gate 3 measures the owner's render-time thresholds (2 fps, 160 px) | red exits 2; yellow at the owner's warn level |
| Exemption | `film_gate.py --allow-blue-purple "<reason quoted from the D-entry>"`; the reason is written into the delivery report facts | yellow |

Calibration: across 88 films the approved ones peaked at 0.10 (most 0); rejected ones measured 0.46-1.00; a deep purple starfield with a white-shell robot measured 0.94. Flat navy (hue about 210) is not in the zone (huashu). The same look is named in other sources: purple gradients on white (claude-code-video-toolkit frontend guidance), purple-to-blue backgrounds as "the worn-out AI look" (video-ad-editor), purple-to-blue banned by default (Barty-Bart, charlie947, founder skills).

The default kit list and its fail rule (three or more without reasons fail the direction) are in `references/anti-sameness.md` section 6 of the ice-direction skill. Further default looks to question on the sheet (each needs a reason in `ice/DIRECTION.md`):
- Deep teal water, waves and white centred type for a promo (the awesome-opus video list's default AI promo look).
- Near-black ground with radial glow and gold or coral spark (premium pastiche, `slop-scan.md` N11).
- Purple-to-orange gradients; glass plus mesh plus light sweeps together; kinetic type on a dark opener; a fake cursor without a real UI (product-launch-motion).
- The same skin as the previous product: dark ground, blue accent, glow, nebula, the same font (bang-motion).

## 2. Template distance (at least 4 of 6 axes)

Every film differs from its nearest bundled template, demo or sample on at least 4 of the 6 axes. The axes (palette, type, layout, motion, structure, sound) and when an axis counts as different are defined in the ice-direction skill, `references/anti-sameness.md` sections 1, 3 and 4; this file only runs the check on the render.

Procedure:
1. Name the nearest template or demo (the one the build started from, or the closest by film type). Record it in `ice/review/template-distance.md`.
2. For each axis write the template's value and the film's value from `ice/DIRECTION.md` and the render, and mark differ or same with the owner's "different when" test.
3. Compare the contact sheet with the template's poster or sheet side by side.
4. When a render of the template exists, run `film_gate.py film.mp4 --template <template render>`: `template_sim_share` is the share of the film's duration whose composition matches the template's first 12 s (yellow above 0.30).
5. Fewer than 4 axes differ: fail, return to the ice-direction skill for the axes that match.

Supporting rules:
- Demos and samples teach the method only: their compositions, characters, props, story, arc, shots and timeline never enter a film as-is (huashu, lemo-opuscar).
- A starter is architecture, not style: grey colours, an unchosen fallback font and a placeholder background still visible in the render mean the style was never derived.
- Structural sameness (a new palette on an old scene order, the same break of the category expectation twice): judged by the owner's structure axis and two-film test, `references/anti-sameness.md` sections 3 and 7 of the ice-direction skill. On the render, check where the turn lands, the climax mechanic, copy placement and human presence against the template and the brand's last film.

## 3. Fingerprint check and write

The fingerprint file is `~/.ice-motion-director/fingerprints.jsonl`. It is local only, disclosed in the README, and the user can turn it off (then skip this section, rely on the template distance alone and say so in the report). The record format, the axis tests and the thresholds are owned by the ice-direction skill, `references/anti-sameness.md` sections 2 to 4; read them before checking or writing. The approved defaults, quoted so the check is exact:

| Compare against | Pass when |
|---|---|
| Records of other brands or subjects: the 30 most recent entries | The film differs on at least 4 of the 6 axes from every one |
| Records of the same brand (all entries) | Palette and type are exempt (brand-locked); at least 3 of the remaining 4 axes differ, and structure is one of them |
| Records whose `variant_of` names this film, or this film's own variants | Exempt (cutdowns, aspect and language versions are the same film) |

An axis differs by the owner's section 3 tests (for palette: polarity differs, the OKLCH accent hue differs by 45 degrees or more, or the chroma strategy differs). A user may change these defaults for their projects through a logged D-entry; use the logged values then. A user request to repeat ("same style as last time") overrides the check for the axes the user named; quote it in the report.

Check (before render approval, after the direction is locked):
1. Build the candidate record for this film in the owner's record format from `ice/DIRECTION.md` and the contact sheet.
2. Select the comparison sets above from the file (most recent 30 records of other brands; every record of the same brand; skip variants) and apply the rules.
3. On a fail, report the closest record's date, brand and the axes that match, and return those axes to the ice-direction skill (structure and motion first). Never edit or delete previous lines to pass.

Write (at delivery, only for an approved film: auto mode, the approver role passed 09; step mode, the user approved the 09 card):
1. Append one line in the owner's record format (`"v":1`, every field filled), with the runtime date and the project name the user gave (no client data beyond it).
2. Never write a fingerprint for an unapproved or abandoned render.

## 4. Fresh-eyes tests

Each test runs first at 05 on the style frames (the look critic), where a fail is cheap to fix, and again by the critic before render approval at 09 as a confirmation (`docs/maintainers/architecture.md` 2b, "Earliest stage"). The previous-film and reference-skin tests run at 05 on the direction as well.

| Test | Fail when | Source |
|---|---|---|
| Brand test and competitor swap | Defined, staged and passed only by `identity-tests.md` (02, 04 and 05, confirmed at 09) | motionmaxxing, product-launch-motion |
| Three words | Describe the film in three words; they do not match the brand words in the brief | pixel2motion |
| Would a viewer guess AI | Name three reasons a viewer would guess AI; any reason found is fixed | founder skills |
| Two films | Two films built from this repo for unrelated products are not unmistakably different (re-run after any skill edit) | product-launch-motion eval method |
| Look of its own | Compared with a no-skill baseline on the same brief, the film has no look of its own | awesome-opus video list |
| Previous film | The palette, stage, camera grammar or transitions of the previous film carried into this one; tools are reusable, looks are not | PolyForm ideas, rewritten |
| Reference skin | The user's reference was copied in skin (palette, font, layout) instead of rhythm; say so in one sentence and offer a version born from the brief (ice-remake owns remakes) | bang-motion |
