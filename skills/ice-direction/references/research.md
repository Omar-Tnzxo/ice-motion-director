# Dated research

Fresh research before decisions keeps films from converging. It is built only from the user's brief and the runtime date, so it can never drift toward a topic the user did not ask about.

## Contents

1. What research is for
2. The runtime date
3. Query builder
4. Trace check
5. Running queries and reading sources
6. Recording: the research note
7. Freshness, limits and the no-web fallback

## 1. What research is for

Research answers direction questions. Facts and claims it finds (what a product does, its prices, its numbers) are not decided here: they go to the truth sheet in `ice-assets` with their source sentence, and only the truth sheet may put them in the film.

| Code | Research question | Feeds |
|---|---|---|
| RQ-category | What do current films of this `film_type` in this `topic` look like (structure, palette, type, motion, sound)? What does every other video on this subject look like? | The anti-pattern for the concept round; the meet-or-break decision |
| RQ-color | What do colors mean to this `audience` in this `market` and for this `topic` (associations, taboos, semantic colors such as up/down or danger)? | `color.md` psychology step |
| RQ-type | What type conventions exist for this `language` and script on this `platform` (scripts covered, common faces, what reads as dated)? | `type-pairing.md` |
| RQ-refs | Which real, viewable works can serve as benchmarks: one for narrative and transition grammar, one for typography and composition, one for sound and pacing? | Benchmark in the treatment; mechanisms to learn |
| RQ-ads (commercial ads only) | 8 to 15 real ads from 3 to 5 competitors in this `topic` and `market`, plus up to 3 admired brands in other categories only when a recorded source names them (second hop, section 4) | Hooks, beat shapes, open spaces nobody owns |
| RQ-business (any request about a business: company, app, website, shop, product or service) | What the business is and does, who it serves, its product truth (features, offers, coverage as published), its market and main competitors, its brand identity and real material, its current campaigns and tone of voice. The user's own words and files come first; research fills only the slots they left empty | The business brief in `BRIEF.md` (`intake-and-brief.md` section 10); facts with source sentences go to the ice-assets truth sheet |
| RQ-rules (every film; see `industry-rules.md` section 1 for the short form) | The advertising rules of this `topic` in this `market` and the ad policies of each `platform`: required disclaimers, restricted claims and words, claims that need proof, age and targeting limits | `ice/research/COMPLIANCE.md` (`industry-rules.md` section 4); required disclaimers to the truth sheet |
| RQ-brand (`real_brand` is not `none`) | For a named brand: its official site, press or brand kit page, brand guidelines, app store listings, current campaign, all dated today. For a `reference` or `study` brand: which brand leads this `topic` in this `market` today, by evidence (rankings, downloads, market reports), then the same official pages for the chosen one | The ice-assets real brand material procedure; locked palette and type inputs |

Run the questions the tier needs: full tier runs RQ-category, RQ-color and RQ-refs at least (plus RQ-type when the language is not Latin-script, plus RQ-ads for commercial ads); light tier runs RQ-category and RQ-color; locked and change tiers run only the question whose decision is open. Every tier runs RQ-rules, RQ-business when the request is about a business, and RQ-brand when `real_brand` is not `none`; all three run at stage 01, before the question message (`SKILL.md` section 3, step 4), so the questions, the download list and the business brief rest on them.

A brand or market the user invented (a demo brand, a fictional city) is never searched by its invented name: research its real `topic`, `market` and audience instead, and write "fictional brand, real category researched" in the note.

## 2. The runtime date

Read the date from the system clock or environment at the start of the run (for example the shell `date` command or the host's provided date). Never use a year remembered from training. Write the date in every research note and every research-backed D-entry. Year and month terms in queries come from this date only.

## 3. Query builder

A query is assembled from three kinds of terms:

1. **Slot terms**: words copied from BRIEF slot values (`film_type`, `topic`, `audience`, `market`, `platform`, `language`, the `real_brand` name, and brand or product names the user gave).
2. **Date terms**: the runtime year (and month when the question is about trends).
3. **Frame words**: only words from this fixed list:
   `video, film, ad, ads, advert, commercial, campaign, motion graphics, animation, launch, promo, explainer, examples, best, award, case study, breakdown, trends, design, color, colour, palette, meaning, symbolism, psychology, typography, font, fonts, typeface, script, branding, identity, style, aesthetic, conventions, mistakes, avoid, cliche, music, sound, voiceover, vertical, short, reel, title sequence, logo animation, kinetic type, data visualization, brand guidelines, brand kit, press kit, media kit, newsroom, logo, official, app, app store, website, screenshots, most popular, leading, top, ranking, market share, downloads, about, company, products, services, customers, reviews, pricing, competitors, alternatives, tone of voice, advertising, rules, regulations, law, policy, ad policy, advertising policy, restricted content, disclaimer, comparative`
   plus the same words in the brief's `language`.

Build each query from a slot pattern. Patterns (slot names, never filled examples):

| Question | Patterns (pick 3 to 6 per question) |
|---|---|
| RQ-category | `<topic> <film_type> <year>` ; `<topic> <film_type> examples` ; `<topic> ad <platform> <year>` ; `<film_type> <topic> cliche` ; `<topic> commercial <market> <year>` |
| RQ-color | `<topic> color meaning <market>` ; `color symbolism <market>` ; `<audience> <topic> palette` ; `<topic> branding colors <year>` |
| RQ-type | `<language> typography <film_type>` ; `<language> fonts <platform> <year>` ; `<language> script typeface design` |
| RQ-refs | `<film_type> <topic> award` ; `<film_type> case study breakdown` ; `best <film_type> <year>` |
| RQ-ads | `<topic> <market> ad <year>` ; `<brand or competitor named by the user> campaign` ; for admired brands outside the category: `best ad <year>` ; `<film_type> award <year>`, then the brand names those results return as second-hop terms (section 4) |
| RQ-business | `<real_brand or the business name the user gave> about` ; `<business name> products` ; `<business name> reviews` ; `<topic> <market> competitors <year>` ; `<business name> alternatives` ; `<business name> campaign <year>` |
| RQ-rules | The patterns in `industry-rules.md` section 3 |
| RQ-brand, named | `<real_brand> brand guidelines` ; `<real_brand> press kit` ; `<real_brand> official website` ; `<real_brand> app store` ; `<real_brand> campaign <year>` |
| RQ-brand, reference or study | `most popular <topic> <market> <year>` ; `most popular <topic> app <market> <year>` (only when the brief's product is an app) ; `leading <topic> <market> <year>` ; `<topic> <market> market share <year>` ; then the named patterns for the brand the sources agree on (a second-hop term, section 4) |

Write queries in the language that the target audience's own content uses, and also in English when English sources are likely to be richer. Both versions are logged.

## 4. Trace check

Before running any query, fill this table in the research note:

| Query | Term | Kind (slot / date / frame) | Slot and its source |
|---|---|---|---|

- Every term must be a slot term, a date term or a frame word. Drop any other term. If dropping it removes the query's subject, drop the whole query and log it as `dropped: untraceable`.
- A slot whose source is `decision D-NN` may be used only when that decision is logged with its reason.
- **Second hop.** A name found inside a recorded source (for example a competitor or a campaign title that a traced query returned) may be used in a follow-up query only if the note records the chain: term, source ID it came from, query ID that found the source. One hop only; a term found by a second-hop query is never queried again.
- Never add artists, studios, brands, styles, cities, events or years from memory. A query that names something the user did not and research did not return is a hallucinated query.

## 5. Running queries and reading sources

- Open every source you cite. Search-engine redirect tokens and grounding tokens are not links; agents have pasted them as fake video IDs. Verify each link resolves to the claimed page before recording it.
- **Watch the films, do not trust descriptions.** Written descriptions of ads and films are often wrong. For video sources, look at frames or the actual playback (contact sheets and transcripts are produced by the `ice-remake` analysis method). Record whether you watched, read, or only saw a thumbnail.
- **When the host cannot play video.** Look at what can be seen without a download: the platform's thumbnail and storyboard frames on the page, an official stills gallery, a transcript or caption file the page offers. Fill hook, palette and type from those frames only; write `not watched: <reason>` in the cuts per 10 s and sound fields instead of estimating them; mark the source `thumbnail` or `read`. A download for analysis needs no question when the file is free to fetch (`ice-assets/references/sourcing-and-licenses.md` section 5, after the disk space check); a file behind a sign-in, a key or a purchase is named once inside the stage 01 message, and without a yes the note uses what the page shows. A note whose film fields are mostly `not watched` has `Status: partial`.
- Research sources (including third-party videos) are downloaded under the standing consent for free downloads (`ice-assets/references/sourcing-and-licenses.md` section 0); prefer official pages and channels. Research teaches; placing a source's footage, logos, text or music in the film follows the `identity` choice and rule 18 (one record per item, rights are the user's), never a copy by default.
- Separate what is visible or audible from what you infer. "Looks like" when the evidence only shows similarity; "one reason", not "the reason".
- A reference counts only if it is real and viewable. Mood boards of stills, templates and AI-made examples do not count as references. (The mood board shown at 05 next to the style frames is built from these real references; it presents them, it is not evidence itself.)
- For each film studied, record: the hook (what is on screen and heard in the first 3 s), the beat shape, palette and type behavior, cuts per 10 s, sound and voice casting, the ending, and why it works or fails for this audience.
- Synthesize: patterns everyone uses (the anti-pattern to avoid copying), what works for this audience, open spaces nobody owns.

## 6. Recording: the research note

File: `ice/research/R-NN-<question code>.md`.

```markdown
# R-NN <question code>: <the question in one line>
Runtime date: <YYYY-MM-DD>
Status: <complete / partial: what is missing and why / not run: reason>
Brief slots used: <slot = value (source)>, ...

## Queries
| ID | Query | Language | Status (run / dropped: reason) |
|---|---|---|---|

## Trace check
| Query | Term | Kind | Slot and source / chain |
|---|---|---|---|

## Sources
| ID | Title | Publisher or channel | URL | Published | Accessed | How used (watched / read / thumbnail) |
|---|---|---|---|---|---|---|

## Observed
- <what the sources show, each line with source IDs>

## Inferred
- <interpretation, each line with source IDs and a confidence: high / medium / low>

## Conventions found
- <the category default, stated in one sentence>

## Open spaces
- <what nobody in the sample does>

## Stale or weak
- <sources older than the freshness window, single-source claims>
```

D-entries cite research as `R-NN (YYYY-MM-DD) source S-n`.

## 7. Freshness, limits and the no-web fallback

- Prefer sources published within 24 months of the runtime date for conventions and trends. Older sources are used only for evergreen principles and are labeled `evergreen` in the note.
- Bound the work: 3 to 6 queries per question, stop when the conventions are clear and at least three independent sources agree, or after two rounds of queries.
- Some queries ran and some failed, or films could only be read: `Status: partial` with what is missing; the D-entries that rest on the missing part say so.
- If the host has no web access or research fails, write the note with `Status: not run (<reason>)`, mark every affected D-entry `unresearched`, use this skill's principles, and say so in the hand-off heads-up. Never fabricate a source or a date.
- Research informs; it never decides. The director proposes, the critic judges, the approver approves (`decision-process.md`).

Sources: Ice AGENTS.md rules 2 and 3 and architecture section 5 (founder); video-production-studio truth and research (Omar-Tnzxo); commercial-motion-design reference rules (Omar-Tnzxo); heygen-com/hyperframes pitch round "what does every other video on this subject look like" (Apache-2.0); bradautomates/claude-video and herk-edit-kit reference analysis cautions (MIT); idea from imMamdouhaboammar/motion-graphics-skills (careful wording of similarity), rewritten.
