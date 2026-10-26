# Industry and platform advertising rules

Stage 01 always researches the advertising rules of the brief's industry and market and the ad policies of the target platforms, and writes the result to `ice/research/COMPLIANCE.md`. This file says what to look for and how to record it. It is a research checklist, never legal advice: every rule the film follows comes from a dated source found in this run for the user's own market and platforms, never from this file or from memory.

## Contents

1. When it runs
2. Categories that usually carry rules
3. Queries and sources
4. The compliance note
5. Hand-off and what to tell the user

## 1. When it runs

| Situation | What runs |
|---|---|
| Any film that promotes a business, product, service, app, event or cause, or will run as an ad, sponsored post or store listing | Full: the industry rules for `topic` in `market`, plus the ad policy of every `platform` in the brief |
| A film with no promotion and no ad placement (personal art film, loop, portfolio piece with no brand) | Short: the general rules of each `platform` for the content shown; write `industry: none matched (<reason>)` |
| `market` or `platform` unknown when the research runs (it runs before the stage 01 message) | Research the most likely value by the brief, mark the note `Status: partial` and name the assumption; rewrite the note when the answers change `market` or `platform` |
| No web access | `Status: not run (<reason>)`; tell the user in plain words that the ad rules were not checked and that they must check them before publishing |

The note is written at stage 01, before the question message (the ice-direction `SKILL.md` section 3, step 4), because it can forbid a claim the concept depends on and can need a wording question.

## 2. Categories that usually carry rules

Match `topic`, `must_include` and the product truth against the left column. A brief can match several rows; research each one. The right column lists kinds of rule to look for, not rules: whether each applies, and its exact wording, depends on the market and platform and is found by research.

| Category (signals in the brief) | Kinds of rule to look for |
|---|---|
| Finance and investment (banks, loans, cards, insurance, trading, savings, payment apps) | Risk warnings and their exact wording; how rates, fees and returns may be shown (representative examples, full cost); licence or registration number on screen; bans on promising returns |
| Crypto and digital assets | Whether the category may advertise at all on each platform; pre-approval or certification by the platform; risk warnings; age and country targeting limits |
| Health and medicine (clinics, medicines, devices, telehealth, pharmacies) | Proof needed for any health claim; banned cure or guarantee words; "consult a doctor" or prescription lines; before and after images; licence display |
| Food supplements and vitamins | Claims the market allows and those it bans (treat, cure, prevent); required "not a medicine" or similar statements; proof of claims |
| Alcohol | Age gate and audience age limits; mandatory responsibility lines; bans on linking drinking to success, driving or youth; countries where it may not be shown |
| Tobacco, vaping and nicotine | Often banned from advertising entirely; health warnings and their size; age gates |
| Gambling and betting (casinos, sports betting, lotteries, games with prizes) | Licence display; age line; responsible-play line and helpline; platform pre-approval; country limits; bans on implying easy winnings |
| Real estate (developers, brokers, rentals) | Licence or registration numbers; how prices, payment plans and delivery dates may be stated; "renders are illustrative" lines; equal-access rules on who the ad may target |
| Children and education (toys, kids apps, schools, courses) | Rules on advertising to children and on showing them; proof of learning or job results; bans on pressure to buy |
| Politics and social issues (campaigns, elections, causes, advocacy) | Platform authorization and "paid for by" labels; blackout periods; ad library disclosure |
| Employment and jobs (hiring, recruiters, income opportunities) | Non-discrimination in targeting and wording; proof of income claims; bans on "get rich" framing |
| Dating and relationships | Platform pre-approval; age limits; bans on sexual content and on implying guaranteed matches |
| Weight loss and body image | Banned before and after or body-shaming content; proof of results; age targeting limits; required "results vary" style lines |
| Legal services | Rules on soliciting clients, on naming results or fees, and on the word "specialist"; licence display |

Rules that apply to every ad, whatever the category, also go in the note: proof for comparisons and superlatives, labels for sponsored or paid content, rules on prices and offers, and use of other brands' names and logos.

## 3. Queries and sources

Build queries with `research.md` sections 3 and 4. For this question only, the category name from section 2 that the brief matched counts as a frame term; record the match in the trace check (`topic = <value> (source) matched <category>`).

| Need | Patterns (slot names, never filled examples) |
|---|---|
| Market rules | `<topic> advertising rules <market> <year>` ; `<category> advertising regulations <market>` ; `<topic> ad disclaimer <market>` |
| Platform policy | `<platform> advertising policy <category> <year>` ; `<platform> ad policy <topic>` ; `<platform> restricted content <category>` |
| General ad rules | `advertising law <market> <year>` ; `comparative advertising rules <market>` |

Source order, best first: the regulator or official law text of the market; the platform's own policy pages; an industry body's published code; a law firm or trade publication summary, used only to find the official page. A rule backed only by the last kind is marked `unconfirmed`. Record each source as `research.md` section 6 says, with its published and accessed dates. Platform policies change often: anything older than 12 months is rechecked or marked `stale`.

## 4. The compliance note

File: `ice/research/COMPLIANCE.md`. One note per project, rewritten when the brief's `topic`, `market` or `platform` changes.

```markdown
# Compliance note: <project name>
Runtime date: <YYYY-MM-DD>
Status: <complete / partial: what is missing and why / not run: reason>
Brief slots used: topic = <...>, market = <...>, platform = <...>, language = <...> (sources)
Categories matched: <categories from industry-rules.md section 2, or none matched: reason>
Research notes: <R-NN files with the queries and trace check>

## Required disclaimers
| ID | Rule in plain words | Exact wording (or "not fixed by the rule") | Where and when it must show | Minimum size or time the rule states (or "not stated") | Languages | Source IDs | Confidence |
|---|---|---|---|---|---|---|---|

## Restricted claims and words
| ID | What may not be said or shown | Why (rule in plain words) | Source IDs | Applies to (market, platform) |
|---|---|---|---|---|

## Claims that need proof
| ID | Kind of claim | Proof the rule asks for | Source IDs |
|---|---|---|---|

## Targeting and placement limits
- <age gate, countries, audiences, pre-approval or authorization, each with source IDs>

## Sources
| ID | Title | Publisher | URL | Published | Accessed | Kind (regulator / platform / industry code / summary) |
|---|---|---|---|---|---|---|

## Open items for the owner
- <rules marked unconfirmed, wording the owner or their legal advisor must supply>
```

Write each restricted item as something a reviewer can find in a script: the words, the kind of image, or the kind of promise. "Be careful with claims" is not an item.

## 5. Hand-off and what to tell the user

- Every row of "Required disclaimers" is copied to the truth sheet's "Required disclaimers" section in the ice-assets skill (`truth-sheet.md` section 12). Wording the rule does not fix is drafted, marked `draft, owner to approve`, and asked in the stage 01 message (it counts toward the 4). Unanswered, it stays `draft, owner to approve`, the film uses the draft, and the delivery note lists it among the permissions and confirmations the owner must give before publishing.
- Every row of "Restricted claims and words" is added to the truth sheet's negative list, with its compliance ID.
- A concept, script line or shot that hits a restricted item is changed before it is approved; the D-entry names the compliance ID.
- The ice-qa skill checks on the delivered file that each required disclaimer is on screen, readable and held long enough, and that no restricted item appears (`delivery-checks.md` section 7).
- Tell the user in plain words, once at intake and again in the delivery: which rules were found, which wording they must confirm, and that this is research for their market and platforms, not legal advice; for regulated categories, a legal check before publishing is recommended.

Sources: Ice AGENTS.md rule 1 and architecture section 2b "Industry rules" (founder); video-production-studio regulated claims (Omar-Tnzxo).
