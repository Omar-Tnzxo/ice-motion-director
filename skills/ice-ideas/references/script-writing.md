# Script writing

Scripts for ads, launches, explainers and shorts: spoken lines, on-screen copy and the visual cue each line asks for. The script is the only home of spoken words; briefs and treatments never keep a second copy.

Owned elsewhere: script shapes bank and story structures per film type (`ice-film`); voiceover pace, TTS and timing (`ice-audio`); Arabic dialect review and RTL copy (`ice-arabic`); caption layout (`ice-type`); facts (`ice-assets`, truth sheet); narrated explainer production (`ice-explainer`).

> Sources: AbubakrChan/product-launch-motion (MIT), Tejashmakwana/motionmaxxing (Apache-2.0), Omar-Tnzxo video-production-studio (founder), digitalsamba/claude-code-video-toolkit (MIT), heygen-com/hyperframes product-launch-video and docs prompting (Apache-2.0), vincentsch/explainroo (MIT), majedphotos/video-ad-editor (MIT), nateherkai/herk-edit-kit (MIT and pipeline use permission), alchaincyf/huashu-art-motion (MIT). Ideas only, rewritten: Vincentwei1021/anything2explainer, Vincentwei1021/video-talkcraft, hypit-ai/hypit. Quoted lines keep their authors' wording.

## 1. Before the first line

- Length and language must be known; when neither the prompt nor the brief gives them, they are questions of the stage 01 message (`ice-direction`), and without an answer the defaults are taken and logged (anything2explainer ideas). Everything else: decide and log.
- Echo the message sentence. "Do not storyboard until this is clear." (hyperframes)
- Script approval is the cheapest place to change the film: after it, timings are built on the words and changing one word means retiming (anything2explainer ideas). Step mode: the script goes on the 03 review card and only the user's own words approve it. Auto mode: the approver role checks it against the 03 row's "Done when", and the delivery note reports it.
- For narrated films the script comes first and sets all timing (explainroo); shot times are laid out from the real voiced length (reelmimic).

## 2. Word budget

`word budget = target seconds x pace (words per second for this language and voice) - pause seconds x pace`. Take the pace from the `ice-audio` skill for the chosen language, dialect and voice. Mark pauses in the script as `[pause 1.0s]` (claude-code-video-toolkit). If the voiced length misses the target by more than 15 percent, add or cut sentences; never change the speech rate to fit (anything2explainer ideas).

## 3. Structure

- One spine. If the sections could be shuffled without loss, there is no spine. A script written by following a source's table of contents becomes a tool list (anything2explainer ideas). "The source is ore, not an outline" (vox-explainer): one storyline, everything else becomes receipts.
- Reorder by narrative arc, not by the order things happened or the ticket order; capture the shift ("We went in doing X. We came out doing Y.") (claude-code-video-toolkit).
- Motivation before mechanism: what breaks without it, how it works, what it buys. Cut mechanism detail before cutting "why" sentences.
- "Contrast creates impact: A calm scene makes the next dramatic scene hit harder" (claude-code-video-toolkit).
- Explainers (anything2explainer ideas, numbers kept):

| Length | Sentences | Chapters |
|---|---|---|
| 2 to 3 min | 24 to 32 | one, no chapter cards |
| 3 to 5 min | 40 to 50 | 3 to 4, each 60 s or more |
| 5 to 8 min | 60 to 80 | 4 to 6 |

  Each chapter has one thesis sentence (its highlight candidate). End a chapter on a question or gap; open the next by naming what was achieved and posing the new question; never "next we look at". Chapter names are navigation labels: noun phrases, 14 Latin characters or fewer, parallel, no jokes.
- Short explainers have no single default shape. Several shapes, illustration only (pick or invent one that fits this topic and audience): a question, small steps, one concrete example; a misconception, the evidence that breaks it, the corrected picture; one running example followed from start to end, the principle named only once it is visible; a surprising result first, then how it happens. Every shape ends by returning to its opening and reframing it, never a summary list or a farewell: `references/hooks-and-openers.md` section 7 (explainroo, rewritten).
- Story shapes per film type: the `ice-film` skill, script shapes bank.

## 4. Sentences

1. One information point per sentence (video-talkcraft ideas). Test each: does the listener now know, see or feel something new? If not, cut it.
2. "If the sentence needs the word "and", split the beat or drop one half." Delete-the-beat test: if the viewer loses no belief, delete it (motionmaxxing). Repetition without escalation reads as padding.
3. Explainers: at most about 20 English words per sentence; every sentence must be drawable, and you note the visual relation it expresses while writing (anything2explainer ideas).
4. Ear writing: one clause per beat; short words; no stacked subordinate clauses; "Full stops are direction"; numerals written as said (product-launch-motion).
5. Vary rhythm: rewrite any run of three sentences with the same length and shape.
6. Plain words first, then the term; every term introduced is used again later. Every abstract noun gets a concrete instance; numbers convert to a felt scale or get cut. One analogy, only when it enables a real inference, carried through (anything2explainer ideas).
7. Cut restatements, announcement transitions ("let's look at") and lists over three items unless the list is the point.
8. Narration carries reasons, consequences, comparisons and judgment; the picture carries structure, sequence and quantity. Never describe the picture.
9. Voice: a person who finds this interesting talking to one smart friend; honest about limits; opinions allowed. Ads: "Write like the brand speaks, then cut half." (motionmaxxing)
10. Each line gets a delivery note (product-launch-motion example of the form: "Flat and factual, a list of chores, not a rally"). Start from how the speaker regards the subject and the listener, then the few details that decide how key moments land (hypit ideas).

## 5. Ads, launches and shorts

- One VO line per shot: the line starts after the shot starts and ends before the cut, except deliberate J and L cuts (founder).
- On-screen text complements the VO, never repeats it word for word. Reels: at most 5 to 7 words per caption, 2 lines (founder). Narration and captions carry the exact words; graphics show the example, relationship, evidence or consequence (herk-edit-kit).
- Concrete over abstract. Illustration only: a named everyday item plus a real time beats "everything you need, fast"; a named task done beats "boost productivity"; a real place beats "anywhere".
- Translate every feature into viewer value; one clear job per beat; cap product beats at four (product-launch-motion).
- Proof first, then the claim; strongest when "the product performs INSIDE the sentence" (motionmaxxing).
- CTA said once, at the end, shown on the end card, matching the platform, plus store badge or link when the user owns the brand (an unofficial concept carries no badge, link or offer: the ice-film skill, `references/film-types/app-ad.md`, Purpose); never "download now!!" (founder). One job per film: download, visit, call, book or follow. Scope: this holds for ads and app ads; brand films and openers get a logo plus a stacked CTA only when the brief asks for a CTA.
- Cutdowns (6 s, 15 s, main) each stand alone with their own hook: `references/campaigns-and-shot-mapping.md` (section "Variant generation").
- Talking head with no written script: work from the transcript, find the hook line (often in the middle), cut an arc of hook, context, value, payoff, CTA, mark lines that deserve B-roll, a callout or a motion scene; the cut itself is the `ice-edit` skill's job (founder).

## 6. Visual cues the script must flag

| In the line | The storyboard gets (motionmaxxing unless noted) |
|---|---|
| A number | "a visual built from that number, never a caption" |
| An abstract noun | a concrete metaphor (`references/concept-menus.md` section 5) |
| A name | a name or logo beat with its own hold |
| A contrast word (but, instead, not anymore) | a turn: change of ground, colour, scale or camera |
| A list | visuals chosen from the feature menu, never three tiles by default (bang-motion) |
| New information | a new visual response; a related sentence may change state in the same world instead of the shot (bang-motion) |

Brainstorm 3 to 4 visual ideas per important sentence; the picture must represent what is said, not decorate it (video-ad-editor).

## 7. Copy voice and tells

- Copy tells never to write (stock lines, case, verbatim launch lines, dialect copy): the `ice-qa` skill, `references/slop-scan.md` section 6. The `ice-qa` skill scans the script and every on-screen line for them before delivery.
- Quote exact on-screen copy in the script; unquoted copy gets paraphrased downstream (hyperframes docs).
- "Protect the writer: the copy is often the best part of an AI film." Do not let later stages paraphrase approved copy.

## 8. Self-check

- [ ] Length, language and message known; budget computed with the `ice-audio` pace.
- [ ] One spine; every sentence adds something; no three same-shape sentences in a row.
- [ ] Every number, name and claim traces to the truth sheet.
- [ ] Every line has a delivery note and a visual cue where section 6 applies.
- [ ] CTA once, at the end; no copy tell from the `ice-qa` slop scan list (section 7).
- [ ] Arabic or mixed language: sent through `ice-arabic` review.


## Campaigns, series and variants

One idea carried across several films, cutdowns, hooks, audiences, languages and platforms without becoming one tired template.

> Sources: Omar-Tnzxo video-production-studio (founder), echris6/motion-video-kit business offers (MIT), heygen-com/hyperframes docs and general-video (Apache-2.0), nateherkai/herk-edit-kit (MIT and pipeline use permission), charlie947/motion-graphics-skills (MIT). Ideas only, rewritten: hypit-ai/hypit (variant axes and material reuse).

### 1. Campaign idea first

- A campaign has one platform-independent idea (the concept card) and a set of executions. Every execution still passes the idea tests on its own.
- Write the campaign matrix (`references/templates.md`): one row per execution with platform, aspect, length, audience slice, language, hook, CTA, what varies, what stays fixed.
- Platform priority comes from the brief and dated research: ask where the money or attention is actually spent (founder). Platform specs and safe zones: `ice-engines`.
- Seasonal and cultural moments change tone and sometimes the genre; research them through `ice-direction`, never from memory.

### 2. What stays and what varies

| Fixed across the series | Varies per execution |
|---|---|
| The idea and its claim | The hook (each execution and cutdown has its own) |
| Signature move and carrier | Audience slice and situation |
| Caption system, reveal components, sound identity | Product, feature or topic per episode |
| Brand anchors | Language or dialect (rewritten, never translated literally; `ice-arabic` for Arabic) |
| Format of the series | Presenter, casting, effect treatment, aspect |

Variant axes (hypit ideas): swap the hook, the audience, the language, the product or feature, the topic, the presenter, the effect treatment. Each variant rewrites its lines and roles and keeps the format and reveal components. Inside a series, sameness of format is intended; across unrelated projects the fingerprint rules of `ice-direction` and `ice-qa` still apply.

### 3. Cutdowns and aspects

- "Cutdowns: 6 s, 15 s and the main cut each stand alone with their own hook." (founder). A cutdown is re-told, not trimmed: one claim, its own payoff, CTA held long enough to read.
- "each requested format has been composed, not merely cropped" (hyperframes). Write layout intent per aspect in the storyboard; never plan a centre crop as the vertical version.
- Pilot package for a new client (motion-video-kit): one 20 to 30 s film plus two hooks plus two aspects (16:9 and 9:16) equals four exports, one revision round.
- A launch package usually adds a 16:9 and a 4:5 cut (charlie947); the final list comes from the brief's platforms.

### 4. Hook variants and testing honesty

- Write two or three hook variants per execution from different angles (problem first, result glimpse, recognition first, or different opening menu items). Each must lead into the same truthful body.
- Never call internal hook comparisons an audience A/B test; never invent retention numbers. If the user later supplies real platform data, relate drop-offs to exact moments without claiming the edit caused them (herk-edit-kit).
- "Virality is an aspiration, not a result that editing can guarantee." (herk-edit-kit)

### 5. Production economy (hypit ideas)

- Variants reuse existing approved material where they can: a moved card or new crop reuses media; a changed spoken line or performance needs new material. Note which rows of the matrix need new recordings, footage or paid generation, so the cost is visible before approval.
- Keep shared references and brand anchors in one place; each variant gets its own brief, script and hand-off.

### 6. Self-check

- [ ] One idea; each execution passes the idea tests alone.
- [ ] Every cutdown and variant has its own hook and payoff.
- [ ] Each aspect is composed, with layout intent written.
- [ ] The matrix marks which rows need new material.
- [ ] No claimed test results or retention numbers.
