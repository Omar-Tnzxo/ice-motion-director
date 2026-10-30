# Stage 01 questions: four choices for every open decision

Founder decision, 2026-10-22: at stage 01, after the quick research that makes the options real (`SKILL.md` section 3, steps 4 and 5) and before any concept or build work, ask the user about every important decision their words leave open. Every question has exactly 4 options built from the brief and the research, one of them recommended. This holds for a one-line prompt too: prompt length changes which decisions are open, never whether they are asked.

"The stage 01 message" or "the stage 01 question message" in any file of this plugin means the question rounds of this file. The user stops allowed in each mode are listed once, in the router's stops table (`ice-motion-director/SKILL.md` section 5, "Stops"); this file never adds one.

Contents: 1. The decision slots. 2. The shape of every question (four options, rounds, format). 3. Open or fixed. 4. Unformed requests. 5. Modes, signals and the waiver. 6. Novices. 7. Showing options visually. 8. Question bank. 9. After stage 01. 10. Questions from other skills.

## 1. The decision slots

A recipe-only run makes no film, so the film slots below stay open in the recipe for the run that uses it; it asks only the slots of `ice-remake/references/style-recipe.md` section 8.

A fixed, named list. Each slot fills one or more slots of `ice/BRIEF.md` (`intake-and-brief.md` section 1). Asked in this priority order, most important first.

| # | Decision slot | What it decides | BRIEF slots it fills | Applies |
|---|---|---|---|---|
| 1 | `kind` | Route and film type | `route`, `film_type` | Always |
| 2 | `gaps` | How missing parts of supplied material are filled | the supplied item's fields | Only when supplied material is `partial` (`intake-and-brief.md` section 9) |
| 3 | `goal` | The one thing the viewer does or thinks after watching | `goal` | Always for a commercial film; for other films when the purpose is unclear |
| 4 | `audience` | Who watches, where, in what state | `audience`, `market` | Always |
| 5 | `brand_owner` | Whether the user is the brand, and so official or unofficial | `real_brand` owner status | Only when `real_brand` is not `none` |
| 6 | `brand_files` | Which official brand files are used (the download list) | "Brand material needed" | Only when `real_brand` is not `none` and step 5 listed files to download |
| 7 | `platform` | Where it plays, and so the canvas | `platform`, `aspect` | Always for a rendered film |
| 8 | `length` | Target length | `duration` | Always for a rendered film |
| 9 | `language` | Languages and dialect of words on screen and spoken | `language` | Always when the film has words |
| 10 | `message` | The one sentence the film must leave | `message` | Only when no sentence can be derived from the request or its material |
| 11 | `idea` | Whether the user has a picture of the film in mind | concept seed | Only for an unformed request (`intake-and-brief.md` section 4) |
| 12 | `look` | Look and tone direction (the feel, never palette values a brand system already fixes) | look seed for the 05 direction round | Always for a rendered film |
| 13 | `voice` | Who speaks, or no voice | `voice` | Always when the film has sound |
| 14 | `music` | The real track the film uses | music seed for `ice-audio` | At stage 01 only for a music-led film with no supplied or named track; every other film picks by ear later, at stop B (auto) or on the 06 card (step) (`ice-audio/SKILL.md` section 5, "The options flow") |
| 15 | `cta` | The call to action and where it sends the viewer | end card, `must_include` | Always for a commercial film |
| 16 | `must_include` | What a hinted but unnamed item means | `must_include` | Only when the user hinted at content without naming it |
| 17 | `name_logo` | How a new or unnamed brand is shown | `brand_inputs` | Only when the film's own brand is new or unnamed and no logo file was supplied |
| 18 | `versions` | Master plus which languages, aspect ratios and cutdowns | `deliverables` | Always for a rendered film |
| 19 | `commercial_use` | Commercial or noncommercial use | `commercial_use` | Only when a noncommercial-only source would otherwise be used |
| 20 | `facts` | How a number, price or claim only the user can confirm is shown | truth sheet (`ice-assets`) | Only when the truth sheet holds an unconfirmed fact the film needs |
| 21 | `disclaimer` | Wording of a required disclaimer | truth sheet, `COMPLIANCE.md` | Only when a required disclaimer has no fixed wording (`industry-rules.md` section 5) |
| 22 | `screen_access` | How screens behind a login or paywall are shown | "Brand material needed" | Only when the film needs such screens (`ice-assets` skill, `screen-capture.md` section 5) |
| 23 | `reference_file` | How a linked reference is obtained | `references` | Only when a linked reference cannot be fetched (private, behind a login, removed or blocked); a link that can be fetched is downloaded by default, without a question, so it can be measured (`ice-assets/references/sourcing-and-licenses.md` section 0, "Standing consent") |
| 24 | `identity` | Whether a reference's own logo, end card, look, footage and music go into the video, or its style is carried by an identity that fits the content | `references`, look seed | Only when a reference is used and the user's words leave it open, or ask for the reference's identity on a video of another content type that its outlet does not own; the recommendation compares the content type with the reference's type (`ice-remake/references/rights-and-modes.md` section 1, "The identity fits the content") |
| 25 | `tools` | What happens about a tool that cannot be installed for free | prerequisites | Only when a missing tool is paid, needs an account or a sign-in, or has no install route on this machine; free tools, models and packages are installed without a question (`ice-engines/references/engine-choice.md` section 7.6) |

A slot that does not apply to the deliverable (no sound in a silent loader, no call to action in a caption pass, no aspect in an ideas-only run) is written `not applicable: <reason>` in `ice/BRIEF.md`, never asked.

Never a question: engine, fps, easing, which workflow skill or mode, palette or fonts when a brand system exists, the decision tier, the crew, anything you can measure or look up. Those are decisions with D-entries.

## 2. The shape of every question

Every question of stage 01 has this shape, whatever skill adds it. The entries for each slot, the brand question with its download list included, are the question bank in section 8.

### Four options

- **Exactly 4 options per question**, all answering the same slot; never mix slots in one list. The user can always write their own answer as well: the native question tool adds it, and a text list ends with "Or write your own answer".
- **Exactly one recommended option, always first**, marked "(Recommended)" in the user's language, with a one-line reason that names where it comes from (a brief slot, a research note R-NN, the brand sheet, `COMPLIANCE.md`, the film type file).
- **Built from this request only.** Every option is filled from the brief slots, the dated research of steps 4 and 5, the brand sheet, the truth sheet, the compliance note, and the constraints of the route and film type, following the fill rule of its bank entry (section 8). Never generic placeholders ("option A", "something else", "other" or "you decide" counted as one of the four), never an option set copied from a real brand, a demo or a past run.
- **Four real choices.** Each option would make a different video, the run can deliver it (rights, compliance, route), and no two differ only in wording. Where the entry says so, one option comes from the tail (`anti-sameness.md`): less common in the category but still true to the brief.
- **Plain words.** Say what the viewer will see or hear, in one or two short sentences, in the user's language (Arabic stays Arabic). A technical term goes in parentheses after the plain words, if at all.
- **Facts stay true.** An option never carries a number, price, name, address or claim that the research or the truth sheet does not hold.
- Log each question with `ice-state set question "<question>" --answer "<answer>" --by user|default`, and write one D-entry in `ice/DIRECTION.md` per slot: the four options with their sources, the answer, and who gave it.

### Rounds

- **At most 4 questions per round**, the Claude Code `AskUserQuestion` limit (4 questions, 2 to 4 options each; here always 4). The order is section 1's priority: the most important open slots go first.
- **Several rounds when more slots are open.** After each round, write the answers into `ice/BRIEF.md`, then check again: an answer can fix or open other slots (an answer to `kind` can make `voice` not applicable; `brand_owner` as owner can add `brand_files`). Rebuild the remaining options from the new answers. Rewrite `ice/research/COMPLIANCE.md` and refresh the research only when an answer changed `topic`, `market` or `platform`.
- The first round opens with one sentence on what you understood. Every round says how many rounds are probably left and what happens to a skipped question.
- **A skipped or blank question takes its recommended option**, logged `--by default` and listed in the summary. It is never asked again.
- "You pick" on one question: take its recommended option, state it in one line, log it.
- No concept, script, storyboard, look or build work starts before the rounds end. Research and the brand material plan may continue between rounds.
- When no person can answer now (a headless or scheduled run), write the open rounds into the "Open questions" list of `ice/BRIEF.md` and into the run's output, and hold the run at stage 01. Silence is never a waiver.

### Format

With a native question tool (the agent mapping is in `ice-motion-director/references/harness.md`): one call per round, up to 4 questions, each with a short header (the slot in plain words), the question, and 4 options. Each option has a 1 to 5 word label (the recommended one ends with "(Recommended)") and a description of one or two sentences: what the viewer will see or hear, and for the recommended one its reason. Single choice, unless the bank entry says several may be picked.

Without one: one plain-text message per round, numbered questions with lettered options, in this shape (slots, not content):

```
<one sentence: what I understood>
Round <n>, about <m> left. If you skip a question, I take the recommended option.

1. <question about slot A, plain words>?
   a) <option> (Recommended: <reason in a few words>)
   b) <option>
   c) <option>
   d) <option>
   Or write your own answer.
2. <question about slot B>?
   ...
```

The user may answer by letter, by number, or in their own words; map each answer to its slot and confirm any unclear one in the next round.

## 3. Open or fixed

- **Fixed** slots are never asked. A slot is fixed when the user's own words in this conversation set it, or supplied material sets it (rule 9, "start where the user is": `intake-and-brief.md` section 8). A supplied item that is `complete` fixes every slot it covers.
- **Derived** slots follow from a fixed slot by a rule and are never asked (the canvas from a fixed platform, the dialect from a fixed market). The derivation gets a D-entry.
- **Open** is every other applicable slot. Inference does not fix a slot: what you would have inferred becomes the recommended option of its question.
- A slot fixed by the user's words but in conflict with a hard rule (an invented fact, a rights problem, a restricted claim) is not asked as a slot: say what and why, and offer the smallest fix (`intake-and-brief.md` section 8, "Locked means").

## 4. Unformed requests

For an unformed request (`intake-and-brief.md` section 4), the `idea` slot is always open: its question is Q-idea in section 8, asked in the rounds like any other slot and never later. Its answer seeds the concept round (`pitch-round.md` section A): an existing idea becomes one of the five pitches and is never displaced by generated ones; a fully formed picture ends the round, and that picture is the concept.

## 5. Modes, signals and the waiver

The router owns the mode (`mode` in `ice/state.json`); this skill never asks for it and never sets its own.

| Router mode | How the questions run |
|---|---|
| `auto` | The rounds at stage 01, then autonomous: every later decision is taken by the roles (director, critic, approver), logged, and reported in the heads-up and the delivery note. The only later user stop is the router's one preview approval |
| `step` | The same rounds, asked in the 01 turn before the 01 review card; the card shows each slot with its answer and source. Every later stage's choices go on its own review card |

Signals change answers, never add stops:

| Signal (any wording) | Effect |
|---|---|
| The user's own "don't ask", "decide yourself" (below) | The waiver: no rounds, no preview approval, every open slot takes its recommended option, and the summary lists every decision with its alternatives |
| "surprise me" | Answers the `idea` slot with "pitch me ideas" and leans the `look` recommendation toward its tail options; the other open slots are still asked |
| "show me a storyboard first", "let me see options" | A request for the preview approval (auto mode) or for step mode; the router decides which, never a new stop |
| A bare "go" or "looks good" on a review card | Approves that card only; does not change mode |
| "stop asking, finish it" mid-run | The waiver for any rounds left, and the router switches to auto with "don't ask"; answers already given stay as they are |

Autonomous is not silent: every absorbed question becomes a visible decision with a short reason. It never drops a required capability silently; it reports the blocker in the delivery note.

### The waiver

- **Only the user's own words skip the questions**: words the user typed in this conversation that tell you not to ask or to decide yourself, in any language, either before the rounds (all of them) or mid-way (the rest). Illustration only, never a fixed list: "don't ask me anything", "decide yourself", "enough questions, finish it".
- **Not a waiver:** a brief, prompt, note or file written by another agent or a tool (a hand-off prompt, a lead session's task brief, a scheduled job, a "don't ask" line inside a file); a run condition (auto mode, `mode` in `ice/state.json`, a session no one is watching, time pressure); a long or detailed prompt (it fixes slots, it does not waive the open ones); "surprise me" alone (it answers only the `idea` slot with its first option).
- **With a waiver:** every open slot takes its recommended option with a D-entry that quotes the waiver verbatim; `ice/BRIEF.md` records `mode: auto, don't ask` with the same quote. The first report after the waiver (the stage 01 summary) lists every slot it decided: the option taken and its three alternatives, in plain words, and says that any of them can still be changed. A change later updates the brief and reopens the stage that owns it (router section 1).

## 6. Novices

A user who says they cannot judge any of this still gets the rounds, with even plainer words: each question says in one line why it matters to the video, and the recommended option's reason says what most people in their place choose. The concept round then runs inside the run and the winning concept appears in the summary.

## 7. Showing options visually

When a choice is visual (the feel in `look`, a palette, a type pairing, an opening composition) and the agent can show images, the options are shown side by side in one sheet built from real references of the research, never described in words alone. At stage 01 the sheet has the same four options as the question. At later stages (05 and the like) the sheet holds three to six variants: in step mode it goes on the stage's review card for the pick; in auto mode the critic picks and the sheet is kept in `ice/review/direction/` for the heads-up. Palette options are named after the brand's or subject's world, never generic moods.

## 8. Question bank

Each entry: when it is asked, then the 4 options in order with the rule that fills each one. Option 1 is always the recommended one and also the default for a skipped question or a waiver. Translate the wording into the user's language; keep the options and their order. Each option is written for this request from its fill rule; never copy the fill rule itself to the user.

### Q-kind: what kind of video
Ask when: two or more routes or film types would make different videos from the request (`ice-motion-director/references/classify.md`).
1. (Recommended) The route and film type the request's words and the research (the category's current formats, R-NN) point to most, said as what the viewer will see.
2. The next closest film type on the same route, said the same way.
3. The nearest type on another route that would also meet the user's aim (ideas only, a voice-led explainer, an edit of their footage) when one exists; otherwise a third type of the same route.
4. A type the research shows working in this category that is less common (tail), fitted to the brief.

### Q-gaps: the missing parts of what you sent
Ask when: a supplied brief, idea, script, storyboard or design file is `partial`. Name each item in the user's words and its missing fields in plain words (never field codes); never list fields the user already gave, and never suggest changing them.
1. (Recommended) I research and choose the missing parts, and show what I chose in the summary.
2. You attach or write the missing parts.
3. I ask you about each missing part now, as questions in the next round.
4. I keep your parts as they are and fill only what the next stage cannot start without; the rest stays out of the video.

### Q-goal: what the viewer should do after watching
Ask when: the film is commercial and the one action is not stated, or the purpose of a non-commercial film is unclear.
1. (Recommended) The action the request and the business brief point to (the brand's main path found by research on its own site or store page), with its reason.
2. A second real action from the paths the business brief lists.
3. Remember the name and the one idea, with no direct action.
4. Think differently about the topic: the change of mind the product truth supports.

### Q-audience: who it is for
Ask when: the user did not name the audience. Each option says who, where they watch and in what state.
1. (Recommended) The core audience from the business brief's "Who it serves" and the research (R-NN).
2. A second segment the research names.
3. Existing customers rather than new ones, or the reverse, whichever the recommended option is not, when the business brief shows both; otherwise a third segment the research names.
4. A narrower group the research shows growing or under-served.

### Q-brand-owner (field Brand ownership and material): your link to the brand
Ask when: `real_brand` is not `none` and the user's words do not say whether they are the brand.
1. (Recommended) Not the brand: an unofficial concept; the delivery note and the post caption say "Unofficial concept, not affiliated with <brand>", the film does not (`ice-assets` brand-authenticity step 10).
2. I am the brand or work for it: an official film with its official material.
3. A pitch to the brand: unofficial until the brand approves, and the delivery note lists the permissions it would need.
4. A film for my own product that only learns from this brand: nothing of its name, logo, colors, copy or screens appears (`real_brand` kind `study`).

### Q-brand-files: the official files I will use
Ask when: `real_brand` is not `none` and the brand material plan (step 5) lists files to download. The download list goes in option 1's description in plain words: each file, what it shows, where it appears in the video, its size in KB or MB, and the brand's own site it comes from.
1. (Recommended) Download only the listed files from the brand's own official site, each recorded with its address, size and hash (`brand-authenticity.md` section 10 step 6).
2. You send the brand kit or the files yourself.
3. Only the official logo; everything else is drawn by code from the brand sheet.
4. No downloads: the name is set as text and only live screen captures are used.

### Q-platform: where it will play
Ask when: the user did not name a platform. Each option names the canvas in plain words, then the ratio in parentheses (from the `ice-engines` platform specs).
1. (Recommended) Where the brand's current campaigns run or where the audience watches most (research, R-NN).
2. The next platform the research names for this audience.
3. A different kind of screen the brief supports (a website, a presentation, a large public screen or TV).
4. Several platforms: one master plus a version for each (this also sets the recommended option of `versions`).

### Q-length: how long
Ask when: the user did not state a length. Each option is a range in seconds with what fits in it.
1. (Recommended) The range the film type's timing, the platform spec and the material support, with its reason.
2. A shorter range that still carries the one message.
3. A longer range the material can fill without padding.
4. A very short piece (6 s or less) when the film type allows one; otherwise the platform's longest length the material can fill.

### Q-language: the words of the video
Ask when: the user did not state the language or dialect of the film's words.
1. (Recommended) The language and dialect the brand's own current ads use in this market (research), or the market's main language when there is no brand.
2. The user's own language when it differs from option 1; otherwise the market's second language.
3. Two languages: a master in one and a full version in the other.
4. Almost no words: picture, sound and the end card carry it.

### Q-message: the one sentence
Ask when: no sentence can be derived from the request or its material. Each option is one sentence, written out, true to the truth sheet.
1. (Recommended) The sentence that best serves the goal, built from the product truth the research confirmed.
2. A sentence led by a second product truth.
3. A sentence led by the audience's problem rather than the product.
4. A sentence led by a less common angle the research found (tail), still true.

### Q-idea: a picture in mind
Ask when: the request is unformed (`intake-and-brief.md` section 4).
1. (Recommended) Not yet: pitch me ideas (the concept round runs inside the run).
2. Yes, and I will describe it in a line: that picture is the concept, and the round ends.
3. Yes, I have a reference (a video, a site or an image) and will send it.
4. A rough idea: it joins the concept round as one of the five pitches and is never displaced by generated ones.

### Q-look: the feel of the video
Ask when: the user's words or supplied design do not set the feel. Each option is a feeling in plain words plus what the viewer will see (light, color mood, pace); palette values and fonts a brand system fixes are never options. The answer seeds the 05 direction round, which still runs with its gates.
1. (Recommended) The tone of the brand's current campaigns from the brand sheet and research; with no brand, the tone the category research and the audience point to.
2. A second tone the category research shows working.
3. A tone from the tail: less common in the category, still true to the brief (`anti-sameness.md`).
4. The contrast: the opposite of what the competitors' current ads do (R-NN), when the brief allows it.

### Q-voice (field Voice source): who speaks
Ask when: the film has sound and no recording or approved voice source exists (`intake-and-brief.md` section 3, "Voice implied").
1. (Recommended) No voice: every word on screen in the chosen language, with music and sound; built so a voice can be added later without re-cutting.
2. Your own recording: I send a timed script and you record it.
3. A voice source you approve by name (a voice actor, or a voice tool you choose and accept), disclosed in the delivery notes.
4. Music only: few or no words, the picture and the end card carry the film.
Never generate a voice and never route to a voice-led workflow without answer 2 or 3.

### Q-music: the music
Ask when: a music-led film (hype promo, music video, kinetic type cut to a track, showreel) has no supplied or named track. Every other film gets no music question at stage 01: its options are heard laid on the film with stop B (auto mode) or on the 06 review card (step mode). Both follow `ice-audio/SKILL.md` section 5, "The options flow" (owner decision, 2026-10-29): the options are 2 to 3 real library tracks ranked by measurement against the reference, or against the film type when there is none, in genre, feel and tempo, each heard laid on the reference picture or the film (audio only when there is no picture yet). Each option names the track, its library and what makes it fit (tempo, energy, instruments) in plain words. Music made by code is never an option unless the user asked for it in their own words.
1. (Recommended) The closest real track by measurement.
2. The second closest real track.
3. The third closest real track; when only two fit, the closest from the next rung of the music ladder (`ice-audio/SKILL.md` section 5).
4. Your own track or a song you name (the reference's track included): you send or name it, and its license status is recorded (`ice-audio`).

### Q-cta: the call to action
Ask when: the film is commercial and the user did not state the action or where it sends the viewer. Never invent an address, handle or offer.
1. (Recommended) The brand's real main call to action and destination, as its own site or app shows it (research, R-NN).
2. A second real destination from the brand's own channels (store page, site address, account name).
3. An offer or date the truth sheet holds; with none, the brand's own line from its own material.
4. No direct action: the brand's end card and name only.

### Q-must-include: what you meant
Ask when: the user hinted at content that must appear without naming it. Each option names the item.
1. (Recommended) The item the hint most likely means, from the business brief or the truth sheet.
2. The second most likely item.
3. The third most likely item.
4. Nothing specific: the story chooses what to show.

### Q-name-logo (field Name and logo): showing a new brand
Ask when: the film's own brand is new or unnamed and no logo file was supplied.
1. (Recommended) A clean wordmark of the name in the film's type; with no name yet, a working name is chosen first and shown in the summary (the ice-assets skill records a text-set wordmark, `brand-authenticity.md` section 4).
2. You will send the logo file.
3. A simple mark drawn by code for this video, labelled a placeholder, not a brand identity.
4. No name on screen: the video ends on the message and the call to action.

### Q-versions: which versions
Ask when: the user did not say which versions they need. Each option names every file it adds.
1. (Recommended) The set the platform answer and the film type's deliverables point to: the master plus the versions those list.
2. One master only: one language, one aspect.
3. The master plus every aspect the chosen platforms need.
4. The master plus short cutdowns, each with its own hook.

### Q-commercial-use: how the video will be used
Ask when: a noncommercial-only source would otherwise be used.
1. (Recommended) To promote or sell something: commercial, so noncommercial-only material is never used.
2. Personal or for learning, never sold or used to promote a business.
3. For a nonprofit or charity, with nothing sold.
4. A pitch or portfolio piece for paid work: treated as commercial.

### Q-facts: a number or claim only you can confirm
Ask when: the truth sheet holds a fact the film needs that the user has not confirmed (the ice-assets skill owns the truth sheet).
1. (Recommended) The value from the official source the research found, named with its date; when none was found, leave it out of the video.
2. You give the exact value.
3. Shown as an example, clearly marked as not real data.
4. Said in words only, with no number, as far as the source supports it.

### Q-disclaimer: the required small print
Ask when: a required disclaimer has no fixed wording (`industry-rules.md` section 5).
1. (Recommended) The model wording the rule's own source gives, or the brand's wording from its current ads (R-NN).
2. You send the wording (from your legal or compliance team).
3. A shorter wording that keeps every element the rule requires.
4. Where the rule allows it, the disclaimer in the post text instead of on screen; where it does not, the full wording held on its own end frame.

### Q-screen-access: screens behind a login
Ask when: the film needs app or site screens behind a login or paywall. Never ask for a password.
1. (Recommended) Public screens only (store page, public site, public demo), captured live.
2. You send screenshots or a screen recording of those screens.
3. You sign in on your own device and share the screen while it is captured.
4. Rebuilt from the brand's official images (press kit, store screenshots) at the fidelity rule of the ice-assets skill.

### Q-reference-file: getting the reference
Ask when: a reference was given as a link that cannot be fetched (private, behind a login, removed, or blocked from this machine). A link that can be fetched is downloaded by default, with no question, so it can be measured, and recorded like any download (`ice-assets/references/sourcing-and-licenses.md` section 0, "Standing consent"; `ICE_OFFLINE=1` or the user's `sources.json` turns this down). Whether the reference's own parts appear in the video follows the `identity` slot.
1. (Recommended) I study it from what the page still shows (stills, thumbnail, captions) and measure what those allow.
2. You send the file itself (a screen recording of it works too).
3. You send a different reference that can be fetched.
4. I go on without the reference: the film type and the research lead the style.

### Q-identity: the reference's own media and identity
Ask when: a reference is used and the user's words leave open whether its own logo, end card, footage and music go into the video. First compare the content type of the user's video with the reference's content type (owner decision, 2026-10-29; the canonical logic: `ice-remake/references/rights-and-modes.md` section 1, "The identity fits the content"). When they differ, option 1 below is recommended, and in auto mode, with a waiver or with no answer, it is the decision taken, logged with both content types. When they match, put the recommended option first as that section says (it follows the user's words); the order below is the one for silence. The user's own words win when they make the reference's outlet the owner of this video; on different types, a request for the reference's identity on a video the outlet does not own is a conflict that leaves this slot open (same section). Never a rights question: rights are the user's, and every outside item is recorded with its license status (`ice-assets/references/sourcing-and-licenses.md` section 0).
1. (Recommended) The same editing principles with an identity that fits your content: your logo, colours and end card (or the real brand's when the video is for one), your footage or real footage found for each scene, and new music with the same energy.
2. The reference as it is: its logo, end card, look, footage and music in the video.
3. A mix: you name which parts come from the reference (for example its music with your logo and end card).
4. The style only: everything drawn or shot new, with new music and sound.

### Q-tools: a tool that cannot be installed for free
Ask when: a tool the run needs is paid, needs an account or a sign-in, or has no install route on this machine (no exact pin, no network, no drive with room). Free tools, models and packages are installed without a question, told in one plain line and recorded (`ice-engines/references/engine-choice.md` section 7.6); a system tool that needs an administrator password is one plain step for the user, given once, never this question (section 7.3). Option 2's description gives the one setup step (`ice-motion-director/references/prerequisites.md`).
1. (Recommended) I go on with the free fallback the owning file names; for a tool with none, I build now and hold the video before delivery.
2. You set it up (the account, the key in your environment, or the purchase) with the one step shown, and I go on.
3. I pause the run until you tell me it is ready.
4. I leave out the part that needs it, and the delivery note lists it.
Never sign in, create an account, spend money, or ask for a key value in chat.

## 9. After stage 01

- When every open slot is answered or defaulted, write the stage 01 artifacts (`SKILL.md` section 3, step 7) and the summary (`intake-and-brief.md` section 6): what the user said, and what was decided with its reason.
- In auto mode no new direction question is asked after stage 01. A new blocker found later (for example a missing logo file) takes the nearest safe option the owning file names, is logged in `ice/DIRECTION.md` and is listed in the delivery note. In step mode it goes on the current stage's review card, with four options in the shape of section 2.
- Native reader (Arabic or mixed films) is not a question: the default reader is the user (`ice-arabic` skill, section 1). The Arabic script is shown for sign-off with the preview approval (auto mode) or on the 03 review card (step mode); when neither happens, the delivery note lists the sign-off as open.

## 10. Questions from other skills

Another skill may add a question to stage 01 (the edit route's consent items, a workflow's voice or length question). It becomes a decision slot of this file for that run: placed by its importance in the rounds, with exactly 4 options in the shape of section 2 and one recommended, filled from that skill's own rules. When that skill names fewer options, add real ones from its rules, never a padding option. The waiver of section 5 covers it like any other slot.

Sources: Ice AGENTS.md rule 4 and the founder decision of 2026-10-22 (Omar-Tnzxo); heygen-com/hyperframes brief contract and pitch round (Apache-2.0); video-production-studio intake (Omar-Tnzxo); alexgreensh/anidoodle start-here (MIT); lemomo-ai/lemo-opuscar AGENTS (MIT); Barty-Bart and charlie947 motion-graphics skills (MIT).
