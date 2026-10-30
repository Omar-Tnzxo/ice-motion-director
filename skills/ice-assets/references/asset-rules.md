# Asset rules: source per shot, scoped rules, pre-render gate

The ice-assets rules read after stage 01: which source each shot uses (section 1, at the asset plan of step 5), the rules that hold only for some film types (section 2), and the gate before the final render (section 3, step 9). Paths such as `references/...` and `scripts/...` are inside the ice-assets skill.

## Contents

1. Decision table: which source for this shot
2. Scoped rules
3. Pre-render gate

## 1. Decision table: which source for this shot

| The shot needs | Use | Never |
|---|---|---|
| The product doing its job | Real capture of the latest build | A mock of a feature that does not exist |
| A screen that must change or be read large | Faithful code rebuild from a real screenshot, real data, fidelity 0.9 or better in the side-by-side check | Invented names, prices, timers, ratings; a rebuild from memory |
| A real brand's look (colors, type, UI) | Its own site and kit: `capture-brand.mjs` sheet, guidelines, live captures | A guessed hex, a lookalike font chosen from memory, an invented interface |
| The brand mark | Official file via the logo gate; text-set wordmark only when the user confirmed no logo exists | Redrawn, retyped, recolored, generated |
| The product with no build yet | Objects that show the mechanism, or one concept screen labelled illustrative | Fake branded screens presented as the app |
| A third-party company | Official mark when integration is real and agreed, else name as text | Implied endorsement, competitor named without approval |
| A number | The approved-figures list | Rounded up, "+", target shown as result |
| A real named person | Verified licensed portrait with provenance | Generated likeness, stock face as testimonial |
| A person, place, event or mood | User footage, then real footage found on the web (agencies, official channels, press conferences, official accounts), then stock, then generated if allowed (`sourcing-and-licenses.md` sections 0 and 1a) | A repost or thumbnail when the original exists; a clip cut to change its meaning |
| A drawn object, character or scene | The ladder of art sources, `references/sourcing-and-licenses.md` section 1b: the user's art, licensed vector libraries, AI art only when the user starts it (vectorized and rebuilt by parts), 3D with real lighting, hand-coded art last and held to the craft rules | Flat single-tone code art; an auto-traced image animated as if it had limbs |
| Background, texture, plate | Real first (`sourcing-and-licenses.md` section 1): the user's material, real scans, photos or footage from free routes, CC0 libraries or stock, each recorded with its license status; code-built when the plate is abstract (gradients, grids, data fields) or is glitch or grain; generated only if allowed | Images with a removed or cropped-out watermark; code dust, smoke or fire as a hero element |
| Words on screen | Code, from exact strings | Text inside a generated image |
| Music or SFX | The user's file, a reference's own track, or real library tracks and recorded sounds down the ladders of the ice-audio skill (`SKILL.md`), each recorded with its license status | A track with no record of where it came from; sound made by code that the user did not ask for |
| A font | Brand's licensed files or an open font with its license, embedded locally | Web font link at render, captured commercial fonts |

## 2. Scoped rules (sources disagree; each holds where stated)

| Topic | Rule A, where it holds | Rule B, where it holds |
|---|---|---|
| Illustrative data labels | Visible "Illustrative data" label on every frame: data story, explainers, UI walkthrough, any chart or counter with sample numbers | Declared in delivery notes only, no on-screen disclaimer: illustrative non-numeric copy in product launch, app ad, brand film, social short, hype promo |
| Missing logo | Asked in the stage 01 message: the film's own brand when a logo exists, all types; unanswered, the official-domain default of `brand-authenticity.md` section 10 step 6. Text-set wordmark: the film's own brand when the user confirmed no logo exists, all types except logo sting | Name as plain text: third parties in explainers, product launch, app ad, B-roll overlay, data story; a real brand whose official domain offers no logo file |
| Capture vs rebuild | Real screenshot as source of truth: site tours, static proof | Code rebuild with real data: parts that move, change state or must be read large |
| Attribution licenses (CC BY) | Allowed with credit: explainers, data story, documentary, long-form | Attribution-free only unless the user accepts a credit: ads, app ads, social shorts, hype promos, logo stings |
| Real footage requirement | Real footage or images mandatory (a film with none fails): narrated explainers about real-world topics, B-roll overlay | Not required: code-drawn styles (art film, kinetic type, logo sting, illustrated explainers) |
| Real usernames on screen | Real public posts with real handles when the feed itself is the subject, user told what was pulled | Blurred or demo data: product demos and app ads |
| Invented brand names | Allowed for template and style-study films with no client brand, and for a user's own new brand that has no name yet (the user accepts the name) | Never when a client brand exists, and never for gallery demos or "a film like the leading brand in this field": a real brand found by research, with its real material |

## 3. Pre-render gate

The final render does not start until all hold:
- `node <ice-assets>/scripts/facts.mjs --facts ice/assets/facts.json --claims <claims.json>` prints PASS, or N/A with a stated reason (a film with on-screen words or narration is never N/A).
- `node <ice-assets>/scripts/validate-assets.mjs --project <project root>` prints PASS: every row in `ice/assets/manifest.json` passes the checks in `brand-authenticity.md` section 9, every identity-bearing row is `verified` (or a `text-set` wordmark with its NOTE), official logo hashes match, UI rebuilds score 0.9 or more, every license that does not fit `commercial_use` is printed as a `LICENSE` line for the delivery note, attribution items have a credits line, and no file in `assets/` or `ice/assets/` lacks a row.
- Every asset path exists in the project; no remote, signed or expiring URL; every font is a local file.
- `ice/assets/CREDITS.md` has a row per external item with its source, owner and license status; every item that is not `licensed` for this use is in the delivery note's "Needs a license before publishing" list (`sourcing-and-licenses.md` section 0). License status never blocks the render.
- The final frame uses the real logo file (or the text-set wordmark, printed by the gate as a NOTE, when no logo exists, or the name as text when the brand's official domain offered no logo file, with the reason in the delivery note).
- Third-party content inside captured brand screens (cover art, artists' or users' names and photos, user posts, other brands' products) is replaced with licensed or neutral content (`brand-authenticity.md` section 11.2).
- A real brand: every UI rebuild has `fidelity.score` 0.9 or more against its capture; `BRAND-MATERIAL.md` has no `missing` item the film depends on; a film for a brand the user does not own carries "Unofficial concept, not affiliated with <brand>" in its delivery note and post caption, never inside the film.
- Generated items are within the tier the user allowed and are recorded in `generated.json`.
- Every required disclaimer in `TRUTH.md` section "Required disclaimers" has exact text, a `facts.json` entry and a storyboard shot. A wording still marked `draft, owner to approve` does not stop the render: the delivery note lists it as a confirmation the owner must give before publishing, and the film stays a review candidate.

Report the gate result in `ice/review/` and hand the delivered-file checks (logo audit on encoded frames, font fallback, claims on screen, required disclaimers on screen) to the ice-qa skill.
