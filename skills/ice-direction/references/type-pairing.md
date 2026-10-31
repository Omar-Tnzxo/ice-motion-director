# Type pairing

How the film's typefaces are chosen. Sizes, tracking, line breaks, kinetic type and caption rendering belong to `ice-type`; font files, licenses and embedding belong to `ice-assets` and `ice-engines`; Arabic letterform rules belong to `ice-arabic`.

## 1. Font sources and order

This is the one font-source rule for every Ice skill; others point here.

1. **User and project fonts first.** Fonts the user supplies or the project already holds (brand faces included) always come first, serif included. Only when they do not cover the film's needs is a family chosen from the next step.
2. **Then system fonts and Google Fonts, with no fixed order.** Installed system fonts and Google Fonts are one pool (Fontsource and github.com/google/fonts are no-key routes to the same open catalog and join it, `ice-assets` skill, `fonts.md` section 1): the family that suits this film best wins (register, tension, scripts and weights covered, license), chosen in this type pairing step. Log the reason and the source (`user`, `project`, `system` or `Google Fonts`) in the type block.
3. **Google Fonts is a disclosed network call, made without a question** (standing consent for free downloads, `ice-assets` skill, `sourcing-and-licenses.md` section 0). Fetching a Google Fonts or Fontsource family (catalog or files) contacts their servers; say so before the first call. Offline switch: when the user asks for offline work, `ICE_OFFLINE=1` is set or `sources.json` says `downloads: off`, the pool is user, project and installed system fonts only. Downloads off or refused (offline switch, or the user said no to a download): the pool also includes copies of open-licensed families already on the machine (an earlier download, another project of the same user) when their license text is with them; such a family keeps source `google-fonts` (or its open-font origin) with the note "local copy, no download", and its file and license are copied in (`ice-assets` skill, `fonts.md` section 1).
4. **A user download for news and editorial Arabic (scoped: news, documentary, explainer and editorial films with Arabic on screen, when no user, project or brand face covers Arabic).** Thmanyah (free for design and video use, its license forbids redistribution) is a strong editorial family that Ice cannot fetch (an email form on its site). Name it once in the stage 01 message as an optional one-step download into `assets/inbox/` (its entry goes in `FETCH-LIST.md`, `ice-assets` skill, `project-folders.md` section 4b); this is an offer, not one of the stage 01 questions. Until the file arrives, or when nobody answers, the pool of step 2 decides; when it arrives it is a user font (step 1) and is still held to the fingerprint check. Paid families the user owns follow the same path.
5. **Every chosen family ships as a file.** Whatever the source, the render binds the family to a font file inside the project, never to a bare family name (determinism: `ice-engines`; files, licenses and embedding: `ice-assets`). A system font's file is copied into the project after its license is checked; a Google Fonts family is downloaded once with its license and cached in the project.

## 2. Brand type

- If the brand has its own typefaces, use them (section 1, step 1). Only when the brand has no face of its own is a pairing chosen.
- A real brand (`real_brand` slot): its faces are the families its own site uses, read from the ice-assets brand sheet `ice/assets/brand-sheet.json` (`fonts` with weights by text area, `font_faces`) and its guidelines, never guessed from the look. Its webfont files belong to the brand: when the user holds no license, choose the closest free substitute by the matching method in the ice-assets skill (`fonts.md` section 4) and log the substitution with the measured match.
- If the brand face lacks a script the film needs (for example Arabic) or a weight the direction needs, keep the brand face for what it covers and choose a companion for the missing script that matches its voice (section 6). Log the gap.
- In product films whose story is claim, how, result, the on-screen text may use the product's own UI font so the words and the UI read as one.
- A decorative display face is for the wordmark or one hero word only.

## 3. Choosing when there is no brand face

1. **Name the register.** What voice is the content speaking in: institutional authority, personal confession, technical precision, casual irreverence? The register narrows the field more than the category.
2. **Think physically.** Imagine the type as a physical object that belongs to this subject (illustration only: a museum caption, a hand-painted shop sign, a mainframe manual, a fabric label, a tax form, a train departure board). That object points at the right kind of typeface.
3. **Reject the first instinct.** The first face that feels right is usually the training-data default for that register. If it was used in a recent fingerprint, find another.
4. **Cross-check the assumption.** An editorial brief does not need a serif; a technical brief does not need a mono; a children's product does not need a rounded display face. The most distinctive choice often contradicts the category expectation; decide meet or break as in `color.md` section 3.
5. **Search, do not recall.** Build the shortlist from the pool in section 1: the installed system font list and, unless the offline switch is on, a current Google Fonts catalog query whose filters come only from brief slots (scripts and language on screen, register, film type), per `research.md`. Shortlist from several categories (sans, serif, mono, condensed or impact, script) and shuffle the top results so the same family is not always first. Licensing: `ice-assets`.

## 4. Pairing rules

Families per film (scoped; the default is the first row unless a later row names the film type):

| Rule | Scope |
|---|---|
| At most two families per film: one performs, one recedes. One expressive font per scene | Default for every film type not named below |
| One family, at most two weights; scale carries emphasis | Captions, talking-head ad, podcast, UI walkthrough, restrained product launch |
| One family plus at most one second face (a serif only when it is the brand's heading face, or a deliberate second voice used rarely and large) | Product launch, app ad, brand film |
| One display family plus one mono | Explainer, data story |
| Serif plus sans, never two sans | Title-led films without a brand face: art film, industry spot |
| One sans family at 2 to 4 weights (bold or black present); a second face only as a rare accent (measured: 10 of 11 films with no serif, `ice-film` skill, `references/genres/kinetic-type.md`) | Kinetic type |
| Up to three type voices: a heavy display for statements, a contrasting accent voice (an italic serif or the brand's UI face), a wide-tracked mono for the machine layer | Showreel, hype promo, music video. Log a D-entry naming each voice's job; the brand face, when there is one, stays one of the three |
| A different family per beat | Only a sizzle or showreel montage whose brief asks for maximal variety; never narrative or brand work. Log the reason |

- Never pair two fonts that are similar but not identical (two geometric sans, two transitional serifs, two humanist sans): friction without hierarchy. Either one family at two weights or optical sizes, or two families that contrast on several axes: serif plus sans, sans plus mono, condensed plus wide, geometric plus humanist.
- Do not pair two sans-serifs for headline and body by reflex; cross the boundary unless the brand face dictates otherwise.
- The tension between the two must mean something (mechanical vs human, public vs private, institutional vs personal). If the tension cannot be stated in a sentence, the pairing is arbitrary.
- Register switching: assign faces to communicative modes (statements, data, attribution) like voices in a conversation, not like levels on a page.
- Tension can live inside one family: monospaced vs proportional cuts of the same design, or two optical sizes, change one variable for dramatic contrast.
- Two expressive faces can coexist only when they share an attitude.
- Weight contrast must read in motion: plan extreme pairs (about 300 against 900) rather than 400 against 700; the exact sizes are set by `ice-type`.
- Numbers that change or stack need a family with tabular figures.
- Monospace only for code, data, terminals, logs or system-like content, or as a deliberate register that gives way to the brand face when the product arrives.

**Voice map (a starting meaning, scoped).** Serif reads as human or editorial authority; grotesque as product and function; monospace as technical; expressive display only when the words are the subject. This map is the default for UI walkthrough, data story, explainer and industry spot, where convention aids reading. For brand film, hype promo, kinetic type, art film and music video, test the opposite choice before accepting the map.

## 5. Default-look fonts

These families are the training-data defaults every model reaches for; they produce monoculture:

Inter, Roboto, Open Sans, Noto Sans, Arimo, Lato, Source Sans, PT Sans, Nunito, Poppins, Outfit, Sora, Playfair Display, Cormorant Garamond, Bodoni Moda, EB Garamond, Cinzel, Prata, Syne (the most overused "distinctive" display face), and as display faces also Montserrat and Arial. Shortlists also drift to the same handful of "distinctive" faces (several grotesques, a soft serif, a heavy display); treat any family used in the last fingerprints as taken.

Using one requires a D-entry reason: it is the brand's face, it covers a script no alternative covers at the needed weights, or it is a deliberate thematic match. Montserrat and similar families may serve as a quiet body companion with a reason; never as the characterful display voice by default.

## 6. Scripts and languages

- Every family must cover every script on screen at every weight used; check glyph coverage, not the family name.
- For Arabic or mixed Arabic and Latin, choose the Arabic face first (register, weights, legibility at phone size), then a Latin companion matched in visual weight, x-height to Arabic body proportion and voice; follow `ice-arabic` for shaping, numerals and mixed runs.
- Different Arabic faces have different advance widths at the same size; a font change after layout requires re-layout (`ice-type`).
- A system font is a candidate only when its file can be copied into the project under its license (section 1, step 4); the render machine never relies on what happens to be installed (`ice-engines`).

## 7. Presenting options

- The direction round carries three pairings, one per direction, from the searched shortlist, each crossing categories.
- Show each pairing set in the film's real words (headline, a number, a label) on the candidate palette, as one sheet.
- Each option states its register, the tension it expresses, scripts covered, and license status from `ice-assets`.

## 8. Record

Write the type block from `decision-process.md` section 9 with family, weights, role, scripts, source (user, project, system or Google Fonts) and the reason it fits this film best.

## Conflicts scoped

| Sources disagree | Scope chosen |
|---|---|
| "Follow the brand's own type, one neo-grotesk when none" vs "never two sans, pair serif with sans" | Brand face always wins; with no brand face, cross categories by default |
| "Serif for editorial, grotesque for product, mono for technical" vs "do not pick fonts by category reflex" | Voice map as default for UI walkthrough, data story, explainer, industry spot; challenged first for brand film, hype promo, kinetic type, art film, music video |
| Montserrat listed as safe and distinctive vs listed as not characterful | Allowed as a quiet companion with a reason; not as the display voice by default |
| "At most two families per film" vs "three type voices" and "a new family per beat" | Two by default; three voices only in showreel, hype promo and music video; a family per beat only in a sizzle or showreel montage that asks for it (section 4) |

Sources: heygen-com/hyperframes typography, banned list and design picker (Apache-2.0); bangtutorial/bang-motion characterful display rule (MIT, translated); Tejashmakwana/motionmaxxing brand type rules (Apache-2.0); diffusionstudio/lottie design taste type voice (MIT); video-production-studio design system (Omar-Tnzxo); brand-identity-studio RTL lockups (Omar-Tnzxo); idea from imMamdouhaboammar/motion-graphics-skills (Arabic advance widths), rewritten.
