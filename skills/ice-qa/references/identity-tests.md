# Brand identity tests

Two tests prove a film belongs to its brand and not to its category: the **brand test** and the **competitor swap**. This file is their one home: the wording, the material at each stage, who judges, the pass rule and what clears a fail. Every other file points here and never restates them. Founder decision, 2026-10-22: every check runs at its earliest stage with the same strength as the final gate (`docs/maintainers/architecture.md` 2b, "Earliest stage").

## Contents

1. The two tests
2. What counts as brand-owned
3. Where they run
4. Masking
5. The pass rule
6. On a fail: no paper patches
7. Logging

## 1. The two tests

| Test | The question, word for word |
|---|---|
| **Brand test** | With the brand's name, logo, wordmark and every brand UI, HUD or interface covered, does the material still read as this brand? |
| **Competitor swap** | Could the closest competitor run this material with only its own name, logo, UI and colours put in? If yes, it is the category's film, not this brand's |

They run on every film made for a named brand, company, product, app or service, whatever the route or film type. They do not run when the film has no brand (an art film, a personal piece, a subject explainer with no sponsor); the D-entry of the concept says so in one line.

The competitor is named, never imagined: the closest rival from the business brief's market and competitors section (`ice/BRIEF.md`) or research note RQ-category. When the brief names no rival, the critic takes the category's best-known brand from that research and writes which one it used.

The strength never changes between stages. Only the material changes: a written description at 02, masked frames at 04 and 05, masked frames from the draft at 09.

## 2. What counts as brand-owned

An element passes the tests only when it survives the masking of section 4 and a named competitor could not truthfully show it.

| Counts | Never counts |
|---|---|
| A product truth only this brand has (a feature, a fact, a behaviour of the real product that the rival does not offer) shown as it happens, not named | The brand's name, said, typed, searched or written anywhere, including inside its own UI |
| A distinctive brand code found by research: a signature shape or graphic device, a character or mascot it owns, a proprietary typeface, a campaign device it is known for, its real places, packaging or objects | The logo, the wordmark, app icons and any brand UI, HUD or interface |
| A tone of voice in the on-screen copy that research ties to this brand and not to its rivals | Colour alone (the swap changes colours) |
| | A category feature every rival has, or a feeling any brand in the category could claim |

A brand code is used as the brand really uses it (`ice-assets/references/brand-authenticity.md`); it is never invented to pass the test.

## 3. Where they run

| Stage | Material | Judge | How | A fail blocks |
|---|---|---|---|---|
| 02 concept | A **blind description** of every concept, written by the director: what the viewer sees and hears, in three to five sentences, with the brand's name, logo, wordmark, UI and colour words removed | The concept critic (`ice-direction/references/roles.md` section 3), on the blind descriptions before the named pitches | For each concept: which brand is this for, and which element told you? Could <the named competitor> run it? Then list the brand-owned elements by section 2 | That concept: it is replaced or changed before it is shown (`ice-direction/references/pitch-round.md` A.5) and is never chosen |
| 04 storyboard and 05 look | The rough board strip and the style frames, masked by section 4 | Brand test: the fresh viewer of clarity read 1, on the masked set first (`clarity-gate.md` sections 3 and 4). Competitor swap: the storyboard critic at 04 and the look critic at 05, on the same masked set | The viewer writes, per masked frame, the brand it thinks the film is for, or "I can't tell", before it opens the rest of the packet. The critic writes, per beat, what the named competitor would have to change beyond name, logo, UI and colours | 06 |
| 09 review | Six frames of the draft at random times (seeded by the round number, times written down), masked by section 4 | Brand test: the fresh viewer of clarity read 3, on the masked frames before the film. Competitor swap: the first full-film critic | As at 04 and 05 | 10 |

The 09 run is a confirmation. A film that passed at 04 and 05 and did not change its concept or look since should pass again; a fail here means an earlier run was weaker than this file asks, and the fix ledger says which.

Routes: `ice-film`, `ice-explainer` and `ice-remake` run all three; `ice-ideas` runs 02, and 04 or 05 when it draws frames; `ice-edit` runs 09 for edit types that sell or promote; `ice-lottie` runs none. Micro jobs (`clarity-gate.md` section 7) run the brand test on the style frames and the draft only.

## 4. Masking

Masked copies are made by the director before the judge sees anything, into `ice/review/identity/masked-<stage>/`, and the judge opens only that folder first.

- Cover with a flat mid-grey box, sized to the element plus a small margin: the logo, the wordmark, app icons, every brand UI, HUD or interface region, and every place the brand's name appears (on-screen copy, signs, captions, search fields).
- Leave everything else exactly as drawn: characters, objects, places, type that is not the name, colour, light, composition.
- At 02 the same removal is done in words: the blind description names none of the covered things and no colour.
- Never mask more to make a frame read as the brand, and never leave a covered element visible "because it is small".

## 5. The pass rule

| Test | PASS when |
|---|---|
| Brand test, brand film type | Every masked frame is named as the brand (all style frames at 05; 6 of 6 at 09) |
| Brand test, every other film type for a brand | The hero frame and at least two thirds of the masked frames are named as the brand (at least 4 of 6 at 09) |
| Brand test at 02 | The critic names the brand from the blind description and points to a section 2 element |
| Competitor swap, every stage | The hero moment and at least one other beat each hold a section 2 element the named competitor could not truthfully show |

A viewer answer "a music app", "a bank", or any category instead of the brand is a miss. A film type file may raise these shares in its QA thresholds; it never lowers them.

## 6. On a fail: no paper patches

1. **An early fail is cleared only by a changed concept or a changed look.** At 02 that is a different concept, or the same concept with a new brand-owned element written into what the viewer sees. At 04 and 05 it is redrawn frames that carry a section 2 element in the hero moment and in the beats that missed.
2. **The re-test runs at full strength, by a fresh judge,** on the changed material: a new blind description and a new critic at 02, new masked frames and a new viewer and critic at 04 and 05. A judge that saw the failing version has learned it.
3. **A pass never rests on a note, a promise or a later stage.** "The UI will make it clear", "the logo lands at the end", "the build will add it", a planned search query with the brand's name, or a critic's reservation marked as accepted do not clear a fail. The approver refuses any pass that does (`ice-direction/references/roles.md` section 5).
4. **Two failed rounds at the same stage:** go back one owner. A fail at 04 or 05 after two rounds goes to 02 with a superseding D-entry (the concept critic's next-ranked concept that passed at 02, or the same concept rebuilt around a brand-owned element). In step mode the user may accept a failed test in their own words; the acceptance is logged with their quote and named in the delivery note. In auto mode the film does not reach 06 or 10 with a failed test.

## 7. Logging

- Each run is one line in the `Gates:` line of the `ice/DIRECTION.md` summary: `brand test <02 / 04-05 / 09> <PASS / FAIL> r<round>`, `swap <02 / 04-05 / 09> <PASS / FAIL> vs <competitor> r<round>`.
- The judge's report goes to `ice/review/identity/<stage>-r<round>.md`: the masked files or the blind descriptions it saw, its answer per frame or per concept, the brand-owned elements found, and one line `seen vs measured`.
- The delivery report lists every run in its Gates table (`delivery-report.md`).

Sources: Ice founder decision, 2026-10-22 (the first gallery run passed a logo-only cover test at 02 and failed the brand film's logo-and-UI test at 09 with 0 of 6 frames); the cover-the-logo and competitor swap tests of Tejashmakwana/motionmaxxing (Apache-2.0) and AbubakrChan/product-launch-motion (MIT); the brand film QA thresholds of bangtutorial/bang-motion (MIT), rewritten.
