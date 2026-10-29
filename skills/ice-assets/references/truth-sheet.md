# Truth sheet and claims ledger

> Merged from: Omar-Tnzxo/video-production-studio (owner, verbatim allowed), AbubakrChan/product-launch-motion (MIT), alexgreensh/anidoodle (Apache-2.0), Barty-Bart/motion-graphics (MIT), majedphotos/video-ad-editor and vincentsch/explainroo (MIT), alchaincyf/huashu-art-motion (MIT), nateherkai/herk-edit-kit (MIT), plus ideas rewritten from imMamdouhaboammar/motion-graphics-skills, vibe-motion/skills and Tejashmakwana/motionmaxxing. Author sentences kept where quoted; dash characters replaced with commas or colons.

Read this before any script, storyboard or on-screen word is written. Every film that says or shows a fact keeps two files in the user's project:

| File | Holds | Read by |
|---|---|---|
| `ice/assets/TRUTH.md` | The truth sheet: what may be said, with proof, and what may not (template: `assets/truth-sheet.template.md`) | Script writer, storyboard, builders, critic |
| `ice/assets/facts.json` | The claims ledger: every claim the film makes, each with its exact source sentence or a `generated` label | `scripts/facts.mjs`, the critic, `ice-qa` |

## 1. Where truth comes from (primary sources first)

1. The product itself: the code (features that really exist and are customer-facing), the live app or site (record it), the database read only (prices, areas, times, settings), the official docs.
2. The owner's statements in this conversation, and an owner rules file if the brand has one (the owner's newest note outranks everything else).
3. The brand's public pages, newsroom, press kit, published case studies.

Authority when sources disagree: owner's newest note, then owner rules file, then design system, then truth sheet, then skill defaults. Facts still come only from the truth sheet unless the owner rules name an exception. If the website and the app say different things, ask the user in the stage 01 message when it is found there; found later, use only what both say (or leave the fact out), log it in `ice/DIRECTION.md` and list it in the delivery note (step mode: the review card).

Rules for research that feeds the sheet:
- Open every source you cite. Search engine redirect tokens are not links: agents have pasted grounding tokens as fake video ids. Check every URL resolves to what it claims.
- Archive a screenshot or saved copy of every fact source, not only the link; pages change.
- Locate every file the user says they supplied before planning; chat attachments may not reach the session. If a file is missing, name it in the stage 01 message with concrete routes (repo path, drive link, direct link); unanswered, plan without it and say so in the delivery note.
- Unknown brand facts are written as an explicit "ask the user" placeholder, never guessed. The question joins the stage 01 message; a placeholder still open after 01 keeps the fact out of the film and is listed in the delivery note.

## 2. The truth sheet (what it lists)

- The product in one sentence a grandparent understands, in the audience's language.
- Confirmed features, each with its proof (file path, screen, query, URL) and a one-line benefit.
- Coverage and timing exactly as configured (places, hours, ranges).
- Money: payment methods that work today; prices, fees and minimums are configured and changing, so they never go on screen unless the owner fixes them for this campaign.
- The approved-figures list (section 3).
- Exact-text items (section 4).
- The negative list: claims and content the film must NOT contain (section 6), including every restricted claim from `ice/research/COMPLIANCE.md` with its compliance ID.
- Required disclaimers (section 12).
- Claims that need the owner's confirmation, with the date asked and the answer.
- Store links and ids, and the asset inventory (logos, fonts, photos, footage with capture date and build, people and mascots with their rules).

## 3. Numbers: the approved-figures list

Write down the exact set of numerals allowed on screen or in the voiceover, each with its source. Refuse every other number, including plausible filler and round numbers you feel sure about. "The list is a whitelist, not a guideline: if a shot wants a fifth stat and the list has four, the shot gets four." (product-launch-motion)

| Rule | Detail |
|---|---|
| Ranges stay ranges | If the source gives a range, the film says the range ("about A to B"), never the low end alone and never a vague word such as "fast" |
| Round toward the less impressive number | "Only ever round toward the less impressive number. Rounding up is a fabrication." Never add "+", never round up, never swap a target for a real milestone |
| Results, targets, samples stay apart | A measured result, a target and sample data are three different things; never present a target as a result |
| Configured values | Fees, minimums, prices that may change stay off unless the owner fixes them |
| Data shows how, never how much | Animation changes how a number appears, never its value; bars start at 0; an axis that does not start at 0 says so on screen |
| Spoken vs shown | Write numerals in the script as they are said; the screen shows the exact sourced figure (the voice may round down, never up) |
| Digits | The digit system is chosen once per film by the `ice-arabic` skill, `references/bidi-numerals-line-breaks.md` section 4; the truth sheet records the exact value, and the chosen system only changes how it is drawn |

A product with no public numbers, or a pre-launch product: section 13.

## 4. Exact text (rendered character for character)

These items are copied, never retyped from memory, paraphrased or "improved":

| Item | Source of the exact string | Rule |
|---|---|---|
| Product and company names, plan names, feature names | The product UI, the official site | Copy spelling, casing and spacing exactly |
| UI labels, buttons, status names | The live app at capture time; for a captured web page, `ui_strings` in its brand sheet (placeholders, buttons, navigation, tabs, aria-labels), captured with `--lang` set to the film's language (`brand-authenticity.md` section 10 step 3) | "Copy labels, buttons and status names exactly." Record the page URL and capture language beside each string. Any UI word not in the truth sheet goes back for approval |
| Taglines and slogans the brand already uses | The site or brand guide | Use their real words for UI labels and taglines |
| Quotes and testimonials | The published page, with speaker and page | "Paraphrased testimonial is a violation; use the published sentence." A quote needs its speaker, role and page |
| Prices, dates, legal lines, CTA wording | The owner, word for word | The CTA is said once and shown once, exactly as approved |
| Sacred or canonical texts (scripture, legal statutes, official anthems) | A canonical API or official publication, cross-checked against a second source | Never typed from memory; for Quran text see the ice-arabic skill |
| Lyrics | Only the user's own or cleared lyrics | Never invent or transcribe lyrics of someone else's song |

Trusted text rule: words and numbers in the film are rendered by code from these strings. Text is never baked into a generated image or video (see `ai-media-policy.md`), and never read off a screenshot by eye when the original string is available.

## 5. Claims language

- Unverified superlatives are banned: cheapest, best, number one, highest quality, certified, fresh daily, unless the owner approves the exact words.
- Regulated claims (health, finance, real estate, education results, children, and every category the compliance note matched) stay off until the owner sends the approved wording; the rules found for the market and platforms are in `ice/research/COMPLIANCE.md` (the ice-direction skill, `industry-rules.md`).
- Say "looks like" when research only shows similarity; say "one reason", not "the reason".
- Captions about the making of the film stay true: no "made in 10 minutes" if it was not, no "no external tools" if outside tools were used, no "one shot" after iterations.
- Named entities: list every person, company, building or city, product or variant, and event in the script before storyboarding; each one needs a real, sourced image or a name in text (see `brand-authenticity.md` and `sourcing-and-licenses.md`).

## 6. The negative list (starter, adapt per project)

- No invented testimonial, rating, review, price, result, user count, attendance, award, certification, date, appointment, saving or warranty.
- No real person under an invented name, no invented person presented as real, no fake social post attributed to a real person, no platform logos on mock posts.
- No fake UI: nothing the product cannot actually do, no aspirational UI, no "coming soon" state dressed as current, no feature flag flipped only for the film. "Drawing a UI the product does not have is fabrication."
- No competitor named on screen without the owner's legal approval.
- No logo you lack permission to show; no recolored, stretched or redrawn logo.
- No decorative shape standing in for a real screen or a real artifact.
- No stock faces in proof beats (see section 8).

## 7. Honesty in demos

- If the product cannot do it, do not show it.
- "If a step takes three minutes, do not imply three seconds." Show the state (running, completed, result) and cut between states rather than animating a fake fast forward.
- Show the honest end of a range.
- Simplify real behavior for the film without inventing actions or outcomes.
- Dev tools: real terminal output and real timing; never fake a green test run or trim an error out of a log.
- Label every reconstruction in the storyboard so a reviewer can tell a design decision from a lie (rebuild rules: `screen-capture.md`).

## 8. Faces, people and quotes

| Situation | Allowed |
|---|---|
| A real named customer with a published case study | Their own published photo beside their own verbatim sentence, then name and role, then logo. "A quote attributed to a face reads as a person; the same quote attributed to a logo reads as copy." |
| A quote without a usable photo | The quote attributed to the name and logo |
| A real face under an invented name | Never (worse than a stock face) |
| Stock face in a proof or testimonial beat | Never; a stock face is recognizably invented |
| Fictional people inside illustrative UI (chat lists, feeds) | Initial avatars tinted from the accent; if faces are needed, generated fictional faces in a declared illustrative context only, never a real person, never with a real name, never with a watermark cropped off |
| Real people in user footage | Rights of the people shown: `ai-media-policy.md` section 9; blur other people's names and personal data in every frame |
| A named real person the story needs | A verified, licensed portrait with provenance; never a generated likeness presented as authentic |

## 9. Labels for illustrative and generated content (scoped)

Sources disagree on whether to label on screen. Use this scope:

| Content | Label | Film and edit types |
|---|---|---|
| Sample or example numbers in a chart, counter or dashboard | Visible "Illustrative data" or "Example data" label on every frame where they appear (localized to the film's language); real data never carries the badge | Data story, explainers, UI walkthrough, product launch, app ad |
| Plausible illustrative copy with no numbers (names in a mock chat, example queries) | Declared in the delivery notes, no on-screen disclaimer | Product launch, app ad, brand film, social short, hype promo |
| Example contacts, domains, emails | Must look like examples (reserved example domains) | All |
| A concept or spec film for a real brand the user does not own (or ownership is unknown) | The last-frame line "Unofficial concept, not affiliated with <brand>" (exact English words, plus a translation in the film's language when it is not English), repeated in the delivery notes and any caption; add "AI-generated imagery" when used (`brand-authenticity.md` section 10 step 10) | All |
| A generated image or clip on a factual or news topic | "Illustration" or "Reconstruction" on screen | Explainers, data story, industry spot, B-roll overlay |
| A generated product angle that could mislead | Labeled illustrative | Product launch, industry spot |
| A reconstructed UI that cannot be recorded | Labeled in the storyboard and notes; on screen as "illustrative" only if it shows data that is not real | UI walkthrough, app ad, product launch |

**How a required on-screen label is set** (every label above that shows on screen: "Illustrative data" or "Example data", "Illustration", "Reconstruction", "Concept screen", the unofficial-concept line). The QA gates allow it only in this form:
- **Text and marking.** The exact text from `TRUTH.md`, localized, rendered by code. In an HTML composition the element carries `data-required-label="<kind>"`; in the storyboard's On-screen text cell it is written `[label: <exact text>]`. The ice-qa page-chrome lint (G5), the storyboard text count and the slop scan exempt it in this form, and only in this form.
- **Type.** The film's body family, regular weight, sentence case, no added letter-spacing, never mono, never a pill, badge or bar. Size at least the readable floor for secondary text (the ice-type skill's `sizes-and-scale.md` section 2, and the floor for the delivery's ratio in sections 3 and 4) and at most 1.5 times that floor. Contrast as secondary text (`caption-placement-safe-zones.md` section 5 of the ice-type skill).
- **Position.** Attached to what it qualifies: directly under or beside the chart, counter or screen with the sample numbers, aligned to its edge, inside the platform's safe zone. Only when the illustrative content fills the frame: the bottom band inside the safe zone, aligned to the film's text margin. Never a free corner badge.
- **Time.** On every frame where the content it qualifies is on screen; the unofficial-concept line follows `brand-authenticity.md` section 10 step 10.
- **Scope: broadcast tags are not labels.** In a news reel (edit type `news-reel`, style family `family-broadcast-news.md`), or when the reference measures them, the location and date tag and the vertical source credit are allowed in their measured slot, as a tag or bar when the package draws them so, built per `ice-type/references/type-effects-specs.md` table "Broadcast text", with their facts (place, date, credit line) taken from the footage ledger. The rules of this list still hold for every required label above, in a news reel too.

## 10. facts.json (claims ledger)

> The format and check below are adapted from alexgreensh/anidoodle (Apache-2.0), `references/workflows/facts.md`. Changes: engine-specific commands replaced with `scripts/facts.mjs`, `id` field added.

- Every claim is listed: each line of words, each number, each label that asserts something, and each narrated sentence.
- Each has its source: the exact sentence it comes from, copied, and a URL or a file path.
- "Nothing is invented. No testimonial, rating, review, price, result, user count or real person that the sources do not give."
- What the film generates is labelled: a slogan, a drawn scene, a mock screen, sample data get `generated: true` with a note saying what it is. "A generated entry states no number; a number needs a source."
- "A claim you cannot source is cut", or shown plainly as a metaphor. Anything you cannot source becomes a question for the user, not a line in the film.

Shape (fields, not content to copy):

```json
{ "version": 1, "claims": [
  { "id": "<c1>", "claim": "<exact on-screen or spoken words>", "where": "on-screen | narration",
    "source": { "sentence": "<the exact sentence copied from the source>", "url": "<https link>" } },
  { "id": "<c2>", "claim": "<another claim>", "where": "narration",
    "source": { "sentence": "<exact sentence>", "file": "<path in the project>#<anchor>" } },
  { "id": "<c3>", "claim": "<slogan or illustrative line>", "where": "on-screen",
    "generated": true, "note": "<what it is, for example a slogan written for this film that states no fact>" } ] }
```

Check it with `node <skill>/scripts/facts.mjs --facts ice/assets/facts.json --claims <claims.json>` where `claims.json` is a JSON array of every string the film declares (on-screen words and narration). It fails when:
- a declared claim is not in `facts.json` (matched ignoring case, spacing and end punctuation);
- a sourced entry lacks the sentence, or a URL (http or https) or file;
- a generated entry has no note, or states a number;
- a number in a sourced claim is not in its source sentence (Arabic-Indic and Persian digits are compared as Western digits);
- a claim is still a TODO.

A film that declares no claims reports `N/A`, never a pass. The check cannot know a sentence is true: the critic reads each source beside the film, and the delivery says which facts were independently checked and what was simplified. Storyboard rows carry the claim id they show, so every frame with a claim traces to a ledger line.

## 11. Truth sources by industry

| Industry | Angle source | Approved figures | Watch for |
|---|---|---|---|
| Hardware | The physical before and after | Spec-sheet numbers only (battery hours, weight, dB) | A render pretending to be a photograph unless said; any spec not on the published sheet |
| E-commerce | The customer's outcome | Order counts, review counts, ratings from the store admin | A made-up happy-customer count; show the real cart and real price, or no price |
| Mobile app | A moment in someone's day | Store or analytics figures with permission | Invented user names in a screenshot are still an invented screen; use a seeded demo account and say so |
| Dev tool | The diff in the loop | Benchmarks with machine and command recorded | Faked green runs, trimmed errors |
| Service business | Real deliverables and named clients with permission | Engagement figures from the client | The unattributable industry statistic, the sector's equivalent of a stock face |
| Delivery, retail, local services | Coverage, timing and catalog from the live system | Configured ranges exactly as set | Fees and minimums that change; shop names and prices invented by builders |
| Regulated (health, finance, real estate, education, children) | Owner-approved wording only | Only with written approval | Any outcome claim |

Typical builder failures to check in review: invented shop or partner names, "certified" and quality words, fake prices or timers in rebuilt screens, reworded voiceover.

## 12. Required disclaimers

Lines the law of the market or a platform's ad policy requires the film to show or say (risk warnings, licence numbers, age lines, "results vary" lines, "paid for by" labels). They come only from the "Required disclaimers" table of `ice/research/COMPLIANCE.md`, written by the ice-direction skill (`industry-rules.md`); never add or drop one from memory.

| Column | Rule |
|---|---|
| ID | The compliance ID, unchanged |
| Exact text | Copied from the rule or the owner, per language version; a rule with no fixed wording gets a draft marked `draft, owner to approve`; the film may render with the draft, but it is never published as final until the owner approves it, and the delivery note lists it among the permissions the owner must give |
| Where | The shots, beats or the end card where it shows, and whether it is also spoken |
| Hold and size | The minimum the rule states, or `not stated`; the film always also meets the reading time and size floors of the ice-type skill (`reading-time.md` sections 1 to 4, `sizes-and-scale.md` section 2), whichever is longer or larger |
| Source | Compliance source IDs and the owner's approval with its date |

- A disclaimer is exact text (section 4): rendered by code, never baked into generated media, never shortened to fit a layout. A layout that cannot hold it changes, the disclaimer does not. It is marked like the labels of section 9 (`data-required-label="disclaimer"` on its element, `[label: <exact text>]` in the storyboard), so the QA lint and text counts exempt it; its size, hold and placement follow the "Hold and size" row above.
- Each disclaimer also gets a `facts.json` entry whose source is the rule's sentence and URL, so the claims check sees it.
- An approved storyboard names the shot that carries each disclaimer; a disclaimer with no shot blocks the storyboard.
- A film with no required disclaimers writes `none: <compliance note status and date>` in this section, never leaves it empty.

## 13. Numbers when the product has none published, and pre-launch products

Only when the product has no public numbers or is not launched yet (section 3 points here).

Building a list for a product with no public numbers, in order:
1. The customer's own dashboard or database, with written permission per figure; record the query or URL beside the number.
2. A published case study, press kit or investor update; cite the document.
3. A count you can defend from the product itself (index size, integrations, measured response time from your own monitoring), with the machine and command recorded for benchmarks.
4. None. "A film with zero invented numbers beats a film with impressive fake ones." Qualitative proof (a real quote, a real named logo, a real screen) carries a film on its own. With no numbers, show the state instead: relative bars, progress, a completed check.

Pre-launch products: "A pre-launch proof beat is not a stat." Legitimate sources before launch are design files and prototypes, a staging or seeded environment, first units you photograph, renders from the real CAD, the team and first testers with consent, and a pilot or beta cohort (the only honest source of a pre-launch figure). Show the mechanism working instead of claiming an outcome.
