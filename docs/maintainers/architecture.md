# Architecture

How Ice Motion Director is built: the skill map, the routing logic, the files that pass between steps, and how the merged sources are placed. Read `AGENTS.md` first; this file assumes its rules.

## 1. Three tiers of skills

All skills live in `skills/<name>/` and ship inside the plugin. Names are kebab case and equal their folder.

### Tier 1: router (the only auto-triggering skill)

| Skill | Job |
|---|---|
| `ice-motion-director` | Entry point for any request to make, edit, remake, animate, plan or render a video or motion graphic. Reads project state, classifies the request, runs the stage 01 intake through `ice-direction`, then runs the production spine (2b) stage by stage in the chosen workflow, keeping the run on its order, its stops and `ice/state.json` until delivery. Under 200 lines. |

### Tier 2: workflows (each owns one kind of deliverable)

| Skill | Owns | Typical input |
|---|---|---|
| `ice-film` | Motion films made from scratch, every film type in section 4 | A prompt, a design file, brand assets |
| `ice-explainer` | Narrated explainers where the voiceover leads and the visuals follow it | A topic, a script, or a document |
| `ice-remake` | A new film in the style of a reference (video, site, image set) | A reference plus the user's own content |
| `ice-edit` | Editing real footage: long-form, podcast, talking-head ad, shorts and reels, captions, B-roll overlays, showreel cuts | Video or audio files, a transcript |
| `ice-lottie` | Lottie and UI motion for apps and sites: loaders, icons, micro-interactions, logo loops | A UI, an icon, a logo |
| `ice-ideas` | Ideas, concepts, scripts and storyboards without rendering | A goal or a product |

Workflows call domain skills by name. They never restate a domain rule; they point to the file that holds it.

### Tier 3: domain skills (called by workflows; implicit invocation off)

| Skill | Holds |
|---|---|
| `ice-direction` | Intake, clarifying questions, dated research, pitch round, critique, consultation and approval for every creative decision; color psychology; type pairing; the anti-sameness system; the treatment and the craft plan (with the precedence order and the exemption rows) |
| `ice-motion` | Motion grammar, measured timing and easing curves, spring formulas, the cut and transition catalog, camera, composition, continuity (carry), holds; each rule scoped to film types |
| `ice-type` | Typography in motion, kinetic type, captions and subtitles, readability gates |
| `ice-arabic` | Arabic and RTL: letterforms and dots in motion, kashida, bidi, captions, numerals, dialect voiceover, ASR timing |
| `ice-audio` | Music and SFX from real libraries, ranked by measurement and picked by ear from 2 to 3 options laid on the film (music by code only when asked for by name), voiceover and TTS pacing, beat grid, mixing, the comfortable mix and loudness gates |
| `ice-styles` | Catalogs of film styles, art styles, drawing styles, motion design styles and narration grammars, each as one reference file |
| `ice-engines` | Engine choice and per-engine guides (HyperFrames, Remotion, HTML canvas with Playwright and FFmpeg, Three.js, Lottie, FFmpeg only, p5), determinism, render and export, platform specs and safe zones |
| `ice-assets` | Asset sourcing (real first: the most recent real, official footage and photos found and downloaded without being asked) and license records, fonts, footage, icons, the truth sheet (names, numbers and claims rendered exactly), brand asset authenticity |
| `ice-qa` | Every gate and critic loop: storyboard lint, pre-render lint, frame and seam checks, slop scan, motion density, captions match, loudness, climax comparison against a reference, the cold-viewer clarity gate, the brand test and competitor swap, the studio benchmark, the craft gate (`craft_gate.py`), delivery report |

Total: 29 skills: the router, 6 workflows, 9 domain skills and 13 command skills (`ice`, `ice-status`, `ice-01-brief` to `ice-10-deliver`, `ice-style`; 2c). File budget (AGENTS.md size limits): aim for 512 files, 600 at most; merge small files before adding new ones.

## 2. Routing

The router runs these parts in order (its sections 1 to 5; then come step mode, the rules for every route, the skill map, the harness and the file list).

1. **Project state** (first match wins): an existing Ice project in the working folder resumes at the stage in `ice/state.json`; a request to change an existing render goes back to that project's workflow; otherwise it is a fresh request.
2. **Classify the request** (first match wins):
   1. The user supplies footage or audio to cut: `ice-edit`.
   2. The user supplies a reference and asks for that style or "like this": `ice-remake`.
   3. The user asks only for ideas, concepts, a script or a storyboard: `ice-ideas`.
   4. The output is Lottie, an app or web UI animation, a loader or an icon: `ice-lottie`.
   5. A voiceover leads the film (explain, teach, narrate, document): `ice-explainer`.
   6. Any other film: `ice-film`.
   Compound requests: footage plus a style reference runs `ice-edit` with the analysis step of `ice-remake`; a logo sting renders through `ice-film` unless the output format is Lottie.
3. **Stage 01 intake**: `ice-direction/SKILL.md` section 3, Part A, steps 1 to 7, defined only there: the research (business brief, brand material plan, industry and platform ad rules) runs before the one question message of step 6, then step 7 writes the stage 01 artifacts (`ice/BRIEF.md`, section 3 below; `ice/DIRECTION.md`; `ice/research/COMPLIANCE.md`). Questions only through `ice-direction` rules and only at the router's stops.
4. **The spine** (2b): the router runs the remaining stages through the active workflow's `## Spine stages` rows. Open decisions are made through Part B (steps 8 to 14) at the stage that owns them, mainly 02 concept and 05 look, never before 01 is done. A detailed prompt or design file locks most decisions; direction then checks conflicts and fills only the gaps. Prompt length changes who decides, never the quality.
5. **Route once, then stay**: the route is chosen once; the router keeps the run on its order, its stops and `ice/state.json` until delivery. A route change (for example ideas becoming a build) needs the user's own word.
6. **Harness table**: tool names for Claude Code, Codex, Cursor, Gemini and other agents in `references/harness.md`, one section per agent.

## 2b. The production spine

Every route runs on one numbered spine of ten stages, the way a production company works. The router owns the spine and `ice/state.json`; each workflow owns what each stage means for its deliverable; domain skills supply the rules. A stage is done when its artifact exists and is approved (by the user in step mode, by the approver role in auto mode).

| # | Stage | What happens | Main artifacts | Owner of the rules |
|---|---|---|---|---|
| 01 | brief | Research first: the business brief (what it is, audience, product truth, market and competitors, brand identity and real material, current campaigns, tone), the brand material plan and the industry and platform ad rules; then the project brief and the stage 01 questions (four choices for every open decision slot, at most 4 per round) | `ice/BRIEF.md`, `ice/research/` (with `COMPLIANCE.md`), `ice/assets/brand-sheet.json`, `ice/DIRECTION.md` header | `ice-direction` intake, `ice-assets` |
| 02 | concept | Divergent pitch (at least two unexpected), critique, one concept chosen; its viewer takeaway (what it sells, the offer's job, the one-line idea, the literal anchors) is the target of every clarity read | `ice/plan/concepts.md`, concept entry in `ice/DIRECTION.md` | `ice-direction`, `ice-ideas`, `ice-qa` (takeaway and grounding rule) |
| 03 | script | Copy, on-screen text and voiceover per language (transcreated, not translated), timed to beats; versions and cutdowns planned | `ice/plan/script.md`, `ice/plan/versions.md` | `ice-ideas` rules, the workflow |
| 04 | storyboard | Rough boards, composition, transitions, timing table, shot plan; with 05, clarity read 1 | `ice/plan/storyboard.md`, `ice/plan/shot-plan.md` | the workflow, `ice-motion` |
| 05 | look | Look development: a mood board, then palette, type, style, motion language, sound lead; style frames with the brand's real material (the count: `skills/ice-film/references/storyboard.md` section 7); when 04 and 05 are both drawn, clarity read 1 on the storyboard strip and the style frames | look entries in `ice/DIRECTION.md`, `ice/plan/mood-board/`, `ice/plan/style-frames/`, `ice/review/clarity/` | `ice-direction`, `ice-styles`, `ice-type`, `ice-assets`, `ice-qa` |
| 06 | animatic | The storyboard and the look merged: timed stills or rough motion with temp sound; cue sheet locked; clarity read 2 before any build | `ice/plan/cue-sheet.json`, `ice/renders/animatic.mp4` | the workflow, `ice-audio`, `ice-qa` |
| 07 | build | Full animation in the chosen engine at the richness floor | project source, `ice/renders/draft-<n>.mp4` | the workflow, `ice-engines`, `ice-motion` |
| 08 | sound | Part a: score, SFX and voiceover from the locked cue sheet. Part b: mix and master on the draft | `ice/audio/` | `ice-audio` |
| 09 | review | Clarity read 3 on the draft, then gates and independent critic rounds, fix loop | `ice/review/` | `ice-qa` |
| 10 | deliver | Final renders and versions (languages, aspect ratios, cutdowns), captions, delivery report with the permissions a brand owner would need, fingerprint | `ice/renders/final/`, `ice/review/NOTE.md` | the workflow, `ice-qa`, `ice-engines` |

**The spine is a contract, not a straitjacket** (founder decision, 2026-10-20). It fixes the artifacts and the approval points. Inside each stage, a workflow keeps its own proven method (crews, internal steps, scripts) from its sources.

**Depth by size.** The size of the job sets how deep the spine runs:

| Size | Typical jobs | How the spine runs |
|---|---|---|
| Micro | 6 s or less, or one asset: loader, icon, logo sting, quote card, caption pass | Three passes: brief and look (01, 02, 05 condensed), build and sound (07, 08), review and deliver (09, 10). Lean crew, one review round |
| Standard | 7 to 60 s films, single edits, including their cutdowns and language versions | Full spine, lean crew, review rounds by the crew tiers in `ice-film` |
| Long or campaign | Over 60 s, chapters, or several films | Full spine, standard or full crew, chapters planned at 03 |

Size, film type and brief decide the other dials (the `ice-direction` tier, the crew row, the explainer run mode); the agent derives them and never asks. Versions and cutdowns are planned at 03 whenever the brief or the film type's deliverables list them, at any size.

**Stage order by film type.** The numbers stay the same; the order in which stages lead changes with the kind of film. Orders are written in the machine-readable form the state tool reads: stage numbers in run order, a parallel lane in brackets, a split stage with a part letter.

| Kind of film | Leads with | Order |
|---|---|---|
| Ads, launches, brand films, explainers | Story | `01 02 03 [04 05] 06 [07 08a] 08b 09 10` (the default) |
| Art films, title sequences, loops, abstract pieces | Look | `01 02 03 05 04 06 [07 08a] 08b 09 10`; 03 stays whenever words appear on screen |
| Music videos, hype promos, lyric films | Music | `01 02 03 [04 05] 06 [07 08a] 08b 09 10`, with the track and its beat map fixed as a 01 artifact so 04 and 06 sit on the beat grid; 03 stays whenever words appear on screen |
| Data stories | Data | The default, with the data verified and sourced in 01 |
| App, SaaS and product UI films | Real screens | `01 02 03 05 04 06 [07 08a] 08b 09 10` when the look depends on the captured UI (screens captured in 01), otherwise the default |
| Edits | Footage | 01 with ingest and transcript first, then the edit type's own line |
| Remakes | Reference | 01 with reference analysis first, then the default |

Each film-type file in `ice-film` and each edit-type file in `ice-edit` names its order in one `Stage order:` line in this form.

**Industry rules.** Stage 01 always includes dated research on the advertising rules for the industry and market in the brief, and on the ad policies of the target platforms (for example required risk or medical disclaimers, claims that need proof, age limits, restricted categories), before the stage 01 questions are written. The result goes to `ice/research/COMPLIANCE.md`, required disclaimers go to the truth sheet, and `ice-qa` checks that they are on screen and readable.

**Cold-viewer clarity gate** (founder decision, 2026-10-21; `AGENTS.md` rule 13). Craft gates prove a film is well made, not that a stranger understands it. At 02 the concept writes its viewer takeaway: what it sells, the offer's job (what the product or brand does for people), the one-line idea and the literal anchor of every symbolic device. Then a fresh, read-only viewer who gets no brief, concept or script, only what an audience would see, writes what happens, what is sold, what the product does, the one idea and every moment it did not understand: read 1 on the storyboard strip and the style frames when 04 and 05 are both drawn, read 2 on the animatic at 06, read 3 on the draft at 09 before the critic rounds. The approver matches each report against the takeaway; a FAIL blocks 07 (reads 1 and 2) or 10 (read 3) in every mode, auto included, and sends the film back to the stage that owns the miss. Two parts of the rule shape the work before any read: the grounding rule (every symbol shown with or after the literal thing it stands for, every sound, action and claim from a visible source, product interactions as they really happen) and the product job rule (a film for an app, SaaS or product brand shows the product doing its real job, whatever the film type; for an app brand a viewer who cannot name that job moves the film toward the app ad's conventions). Micro jobs get one light read on the draft. One home: `skills/ice-qa/references/clarity-gate.md`; the stage rows, the approver's checklist and the review rubric point to it.

**Earliest stage** (founder decision, 2026-10-22). **09 should find nothing new.** Every check runs first at the earliest stage whose material can show the problem, with the same test at the same strength as its final run; the late run stays as a confirmation. A fail first found at 09 or 10 is logged as a miss of the earlier stage, and the fix ledger names which. An early fail is cleared only by changed material (a changed concept or look) re-tested at full strength by a fresh critic or viewer; a pass that rests on a note, a promise or a later stage is refused (no paper patches: `skills/ice-direction/references/roles.md` section 5, check 9). The brand test and the competitor swap live in `skills/ice-qa/references/identity-tests.md`; the side-by-side with real studio work at 05 lives in `skills/ice-qa/references/studio-benchmark.md`. The audit below maps every check run at 07, 09 or 10 to its earliest stage; `tests/shift-left.test.mjs` checks that each file in the "Where it runs early" column names the check's term.

| Check | Late run (confirmation) | Earliest stage | Where it runs early | Term |
|---|---|---|---|---|
| Brand test | 09: masked draft frames, with clarity read 3 | 02 blind description; 04 and 05 masked frames, with clarity read 1 | `skills/ice-qa/references/identity-tests.md`, `skills/ice-direction/references/pitch-round.md`, `skills/ice-qa/references/clarity-gate.md`, `skills/ice-film/SKILL.md` | `brand test` |
| Competitor swap | 09: first full-film critic | 02 blind description; 04 masked strip; 05 masked frames | `skills/ice-qa/references/identity-tests.md`, `skills/ice-direction/references/pitch-round.md`, `skills/ice-direction/references/roles.md`, `skills/ice-qa/references/storyboard-lint.md` | `competitor swap` |
| Cold-viewer clarity | 09: read 3 on the draft | 02 takeaway and grounding; 04 and 05 read 1; 06 read 2 | `skills/ice-qa/references/clarity-gate.md`, `skills/ice-film/references/storyboard.md` | `read 1` |
| Craft against real studio work | 09: the critic's craft score | 05: studio benchmark on the style frames | `skills/ice-qa/references/studio-benchmark.md`, `skills/ice-direction/references/pitch-round.md`, `skills/ice-film/SKILL.md`, `skills/ice-film/references/storyboard.md` | `studio benchmark` |
| Richness floor | 07 and 09: `film_gate.py` | 05: the direction's Floor lines and the style frames; 06 stills board | `skills/ice-direction/references/pitch-round.md`, `skills/ice-direction/references/roles.md`, `skills/ice-film/references/storyboard.md` | `richness floor` |
| Default-look gate (blue and purple) | 09: `film_gate.py` gate 3 | 04: palette lint on the plan; 05: palette values | `skills/ice-direction/references/anti-sameness.md`, `skills/ice-direction/references/roles.md` | `default-look` |
| Template distance (4 of 6 axes) | 09: contact sheet and `--template` | 05: the approved direction | `skills/ice-direction/references/anti-sameness.md`, `skills/ice-film/SKILL.md` | `distance` |
| Fingerprint | 09: before render approval (written at 10) | 05: the approved direction | `skills/ice-direction/references/anti-sameness.md`, `skills/ice-direction/references/roles.md` | `fingerprint` |
| Slop scan | 07 and 09: on frames | 03: on copy; 05: on the style frames | `skills/ice-qa/SKILL.md`, `skills/ice-film/references/storyboard.md` | `slop scan` |
| Fresh-eyes tests (AI tells, a look of its own, previous film, reference skin) | 09: before render approval | 05: on the style frames and the direction | `skills/ice-qa/references/anti-sameness-gates.md`, `skills/ice-film/references/storyboard.md` | `fresh-eyes` |
| Slide look (PowerPoint tests) | 07: contact sheet | 04: adjacent beats as silhouettes | `skills/ice-film/references/storyboard.md` | `powerpoint-tests.md` |
| Art craft (primitive code-drawn art) | 07: `art-check.mjs` on the build | 05: art check on the style frames drawn in code | `skills/ice-qa/references/pre-render-lint.md`, `skills/ice-qa/references/studio-benchmark.md`, `skills/ice-styles/references/code-illustration-craft.md` | `art check` |
| Page chrome (G5) | 07: `lint.mjs` | 04: chrome audit on paper | `skills/ice-qa/references/storyboard-lint.md` | `chrome audit` |
| Element reasons (trigger and reason) | 09 critics, frame check R1 | 04 | `skills/ice-qa/references/storyboard-lint.md`, `skills/ice-film/references/storyboard.md`, `skills/ice-explainer/references/word-timed-segments.md` | `trigger` |
| Seams | 07 and 09: seam gate | 04: carry and handoff contract, seams check | `skills/ice-qa/references/storyboard-lint.md`, `skills/ice-film/references/storyboard.md` | `seam` |
| End hold, CTA share, dead air (G3, motion density) | 09: `look.py`, `motion_check.py` | 04: beat lengths and CTA share; 06: animatic timing | `skills/ice-qa/references/storyboard-lint.md` | `CTA share` |
| Proof and copy readable at delivery size (G1) | 09 and 10 | 04: proof readable at plan time; 05: frames at phone size | `skills/ice-qa/references/storyboard-lint.md`, `skills/ice-film/references/storyboard.md` | `readable` |
| Safe zones | 10: delivery checks | 05: style frames with the platform's safe zone overlay | `skills/ice-film/references/storyboard.md` | `safe zone` |
| Claims and numbers against the truth sheet | 10: assets and claims | 03: script; 04: chronology and truth | `skills/ice-film/SKILL.md`, `skills/ice-qa/references/storyboard-lint.md` | `truth` |
| Required disclaimers and restricted claims | 10: compliance gate | 01: compliance note; 04: compliance pre-check (a shot and a hold each) | `skills/ice-qa/SKILL.md` | `compliance pre-check` |
| Official logo and real brand material | 10: assets and claims | 05: style frames with the brand's real material | `skills/ice-film/references/storyboard.md` | `real material` |
| Captions and picture on the word | 10: captions and sync | 06: cue sheet word timings | `skills/ice-film/references/cue-sheet.md` | `captions` |
| Loudness | 10: `quick-checks.mjs loudness` | 08b: mix and master | `skills/ice-film/SKILL.md` | `loudness` |
| Arabic and RTL correctness | 10: release gate | 03: script; 05: style frames | `skills/ice-film/SKILL.md` | `Arabic` |
| Versions (languages, aspect ratios, cutdowns) | 10: every version rendered | 03: versions plan | `skills/ice-film/SKILL.md` | `versions` |
| Pacing against the reference (longest gap and events per minute, L9) | 07 and 09: `motion_check.py --reference-events` | 04: the plan's events against the reference (`validate-plan.mjs` with `plan.reference`); 06: animatic timing | `skills/ice-qa/references/motion-density.md`, `skills/ice-edit/references/clock-and-grouping.md`, `skills/ice-edit/references/edit-types/news-reel.md` | `longest gap` |
| Fixed identity marks (logo, programme name, corner bug in their measured slot, L10) | 07 and 09: build and draft frames | 05: the style frames | `skills/ice-qa/references/identity-tests.md`, `skills/ice-remake/references/shot-mapping.md` | `Fixed identity marks` |
| Depth, 3D and camera against the reference (L12) | 09: `motion_check.py --reference-depth` | 04: every depth or 3D row names its build route (storyboard lint check 21) | `skills/ice-qa/references/storyboard-lint.md`, `skills/ice-motion/references/depth-and-3d.md` | `build route` |
| Craft plan (every craft the content, the reference and the style call for, rule 20) | 09: `craft_gate.py build` | 02 draft; 04 `craft_gate.py plan`; 05 lock with the style's craft profile | `skills/ice-direction/references/treatment.md`, `skills/ice-direction/SKILL.md`, `skills/ice-film/SKILL.md`, `skills/ice-motion-director/references/routes.md`, `skills/ice-qa/SKILL.md` | `craft plan` |
| Captions against a fresh transcript (L11) | 09 and 10: `align_script_to_asr.py --check-captions` on the final mix | 07: the draft's audio, once the voice is locked | `skills/ice-qa/references/captions-and-sync.md`, `skills/ice-type/references/caption-timing-and-truth.md` | `Fresh transcript gate` |
| File spec, frame 0, blacks and freezes, the climax duel's motion | 07, 09, 10 | stays late: only a render shows it | - | - |

**Parallel lanes.** After 03: 04 storyboard (rough boards, composition, timing) runs in parallel with 05 look (mood board and style frames); 06 animatic merges both and needs both. After 06: 08 runs in two parts, 08a score, SFX and voice from the locked cue sheet, in parallel with 07 build, and 08b mix and master on the 07 draft, after 07. Real-screens-led films capture the real screens in 01 and run 05 before 04 when the look depends on the captured UI. In 10, each language and each aspect ratio renders in parallel. Agents with sub-agents use these lanes; agents without them run the lanes one after another.

**Start where the user is.** Intake detects supplied material, locks it, checks it against the fields its stage needs, and starts at the first stage still missing. One owner holds both tables (what each kind of material becomes and its stage effect, and the required fields per artifact): `ice-direction/references/intake-and-brief.md` sections 8 and 9. Supplied material is never silently rewritten. Missing fields get the `gaps` question of the stage 01 questions (four options, research and fill recommended); without an answer the workflow fills only those fields, logs each in `ice/DIRECTION.md`, and keeps the user's own fields unchanged.

**What each stage means per route.**

| Route | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| `ice-film` | brief | concept | script | storyboard | look | animatic | build | sound | review | deliver |
| `ice-explainer` | brief | concept | narration script | storyboard | look | voice-first animatic | build | voice, score, mix | review | deliver |
| `ice-remake` | brief plus reference analysis | treatment mapped to the reference | script | shot mapping | look locked to the reference | animatic | build | sound | review plus climax duel | deliver |
| `ice-edit` | brief plus ingest | edit approach | paper edit from the transcript | B-roll and overlay plan | grade and caption style | rough cut | fine cut and overlays | sound | review | deliver |
| `ice-lottie` | brief | concept | not used | states and frames | look | not used | build | not used | review | deliver |
| `ice-ideas` | brief | concepts | script | storyboard | optional style frames | optional animatic spec | hand-off | hand-off | review of the idea set | hand-off |

**Two modes, one mode system.** The router's `auto` and `step` are the only modes; `ice-direction`'s autonomous and collaborative wording maps onto them.
- Auto (default): a plain prompt runs the spine from the start stage to delivery, autonomous after the stage 01 message. It stops at most twice: (a) the stage 01 questions (every open decision slot, 4 options each with one recommended, at most 4 per round, before stage 02; the download list, the gap note and any install step among them; skipped only by the user's own words), and (b) one preview approval (style frames or animatic) only when the session is interactive and the user did not say not to ask. The final render needs no further approval. Every other "ask the user" in any skill becomes "decide, log in `ice/DIRECTION.md`, and report in the delivery note". The router's "Stops" table is the only list of stops; no skill adds its own.
- Step: collaborative at every stage. Numbered stage commands run one stage, write its artifact and stop with a review card: what was made (with previews: frames, style frames, contact sheets, the animatic), the options considered and why this one won, the critic's notes, the open choices (every question of that stage goes here), and the next command. The user can discuss and iterate on the stage as long as they want (for illustration only: "show me two other concepts", "make the palette warmer", "shorten beat 3"); each revision updates the stage artifact and the decision log; approval moves to the next stage.
- Official brand files when the user said not to ask: downloaded only from the brand's own official domain (press, brand or newsroom pages), each recorded with URL, size and hash and named in the delivery note; never from a third-party site without asking; with no official file, the name is set as text in the style of the brand's typeface, and the note says so.
- Plain language in both modes: messages to the user explain decisions without jargon, and technical detail stays in the run files. Commands: `/ice` (run or resume in auto mode), `/ice-status` (where the project is and what comes next), `/ice-01-brief` through `/ice-10-deliver`. A stage command refuses to run when an earlier stage is neither done nor supplied, and names the missing one.

### 2c. Contracts that make the spine work

These shapes are fixed so the router, the workflows and the stage commands agree.

**Workflow section.** Every workflow `SKILL.md` has a section titled exactly `## Spine stages` with this table, one row per stage the route uses (rows the route does not use say `not used`):

| Stage | What this workflow does in it | Files to open | Done when |
|---|---|---|---|

It also states, in that section, its depth by size (micro, standard, long) and, for `ice-film` and `ice-edit`, that each type file names its stage order in a line starting `Stage order:` (machine-readable form, 2b). Every "Files to open" cell marks each file as required or "only if <condition>", so a standard ad (7 to 60 s) reaches its first artifact having read only required files (target: under 40,000 tokens of instructions). The 01 row calls `ice-direction`'s intake explicitly (business brief, brand material plan, `ice/research/COMPLIANCE.md`). In `ice-film` and `ice-explainer` the 02 row's "Done when" names the viewer takeaway and the rows that close a clarity read (the later of 04 and 05, 06, 09) name its PASS; Every workflow's 02 row (the remake's 01 row as well) names `ice/plan/craft-plan.json`, its 04 row the plan check and its 05 row the lock (`skills/ice-direction/references/treatment.md` section "Craft plan"). `ice-ideas` writes the takeaway at 02; the other routes take their reads from the route contracts in `skills/ice-motion-director/references/routes.md` and the gate file.

**Workflows never bypass the router.** Workflow descriptions say they are started by the Ice Motion Director router and are used only when it, or the user by name, calls them; user trigger phrases live only in the router's description. Each workflow's first step checks `ice/state.json` and, when it is missing, opens the router first. The router's description is the entry point even when other video or engine skills (HyperFrames, Remotion) are installed, and carries English and Egyptian Arabic trigger phrases; `evals/trigger-eval.json` tests it.

**State.** `skills/ice-motion-director/references/state.md` is the single schema of `ice/state.json`; no file writes a key outside it. Top level: project, route, subtype (the film type the `ice-qa` scripts read: film type, edit type, `explainer`, or the deliverable), run_mode (a workflow's own run mode, such as the explainer's), mode, size, order, current, step, crew, crew_flags, stages, commercial_use, language, questions, created, updated, history, approvals. `stages` is keyed `"01"` to `"10"`; each value is `{ "status": "missing" | "supplied" | "partial" | "in_progress" | "in_review" | "approved" | "not_used", "artifact": "<path>", "updated": "<ISO 8601>", "notes": "<one line>" }` plus the optional `minutes`, `roles` and, for a stage the order splits (08a, 08b), `parts`. The zero-dependency Node script `skills/ice-motion-director/scripts/ice-state.mjs` (`init`, `show`, `set`, `check NN`, `next`) is its only writer: it validates every write against the schema, applies the reopening rule, takes a lock so parallel lanes cannot clobber the file, and refuses a stage whose prerequisites are missing by naming the command to run first (like spec-kit's prerequisite check). Auto mode moves a stage to `approved` after the approver role passes it; step mode only after the user says so (the script refuses an approver approval in step mode).

**Stage commands.** One thin skill per command (`ice`, `ice-status`, `ice-01-brief` to `ice-10-deliver`) that tells the agent to open the router's step-mode section for that stage; the logic lives once, in the router, and every stage command starts with `ice-state.mjs check NN`. Descriptions are command-only and short (about 120 characters: what it runs, then "Use it only when the user types /name or $name"), so they never compete with the router for a plain request. Claude Code, Cursor, VS Code, Copilot CLI, Cline, Qwen, Kiro and Antigravity show skills as `/name`; Codex uses `$name`; OpenCode needs `metadata.opencode/slash: "true"`; Gemini CLI gets one `commands/<name>.toml` per command. Each command skill uses only the portable frontmatter keys and sets `allow_implicit_invocation: false` in `agents/openai.yaml`.

**Review card** (step mode, end of every stage): what was made (with previews: frames, mood board, style frames, contact sheet, animatic), the options considered and why this one won, the critic's notes, the open choices (the stage's questions live here, never in a separate stop), and the next command. The user may discuss and revise as long as they want; approval moves the stage to `approved`.

**Run log.** Every run, in auto and step mode, keeps `ice/log/conversation.jsonl`, written only with `ice-state.mjs log` (schema and rules: `skills/ice-motion-director/references/state.md`, "Run log"): the user's words verbatim, the agent's replies as summaries of 600 characters at most, and every file sent or received. It is never built from the agent's transcript (founder decision, 2026-10-21: privacy and size).

**Case study export.** Stage 10 exports the whole run at every delivery (the case study card is always used for the gallery demos and optional as a portfolio piece for users). `ice-qa` owns the exporter. Output `ice/case-study/case-study.json` plus compressed preview media in `ice/case-study/media/` (WebP stills, short MP4 or WebP loops for the animatic), and the share file `ice/case-study/run-log.html` (one self-contained page: header with the prompt and the final result, the conversation, then all images; 8 MB target), built only from the run files, never from memory. Keys, tokens, email addresses, phone numbers and absolute paths are masked in the export only. Which model and effort produced a gallery demo is not part of this export; the landing page records it for each demo card separately:

```json
{
  "slug": "<kebab id>", "title": "<film title>", "brand": "<brand>", "unofficial": true,
  "prompt": "<the user's prompt, verbatim>", "mode": "auto | step", "route": "<route>", "film_type": "<type>", "size": "micro | standard | long",
  "supplied": [ { "kind": "<brief | script | storyboard | ...>", "status": "complete | partial", "filled_fields": ["<field>"] } ],
  "questions": [ { "question": "<text>", "answer": "<text>", "answered_by": "user | default" } ],
  "stages": [ {
    "id": "01", "name": "brief", "summary": "<plain-language paragraph>",
    "decisions": [ { "decision": "<what>", "options": ["<option>"], "chosen": "<option>", "reason": "<why>", "source": "<brief slot | research note | reference>" } ],
    "artifacts": [ { "path": "media/<file>", "type": "image | video | text", "caption": "<what it shows>" } ],
    "critic": [ { "round": 1, "verdict": "<ship | one more pass | ...>", "score": "<as the rubric gives it>", "notes": ["<note>"], "fixes": ["<fix>"] } ],
    "minutes": 0, "roles": ["<role>"]
  } ],
  "research": [ { "question": "<RQ>", "sources": [ { "title": "<title>", "url": "<url>", "date": "<YYYY-MM-DD>" } ] } ],
  "gates": [ { "name": "<gate>", "result": "pass | warn | fail", "value": "<measured>", "threshold": "<target>" } ],
  "versions": [ { "language": "<code>", "aspect": "<16:9 | 9:16 | 1:1>", "seconds": 0, "file": "<renders path>" } ],
  "metrics": { "loudness_lufs": 0, "true_peak_dbtp": 0, "fps": 0, "resolution": "<w x h>" },
  "credits": [ "<line>" ], "tools": [ "<engine and scripts used>" ],
  "conversation": [ {
    "at": "<ISO 8601, UTC>", "stage": "<NN>", "from": "user | agent", "text": "<user words in full, or the agent's summary; masked>", "note": "<what an image shown only in chat contains>",
    "attachments": [ { "path": "media/<file> | <project-relative path>", "kind": "image | video | audio | text", "direction": "from_user | to_user", "note": "<only when left out: raw fidelity sheet kept local>" } ]
  } ],
  "notes": [ { "field": "<field>", "note": "<what is missing or was masked>" } ]
}
```

The landing page renders each case study as a card with the full stage-by-stage workflow; the README gallery shows the final film with a "View workflow" button that deep-links to that card.

**Refusal.** A stage command whose earlier required stages are neither `approved`, `supplied` nor `not_used` refuses in one plain sentence and names the command to run first (the spec-kit pattern). `ice-state.mjs check NN` computes it from the project's `order` and exits 1 with the sentence; when the blocking stage waits for review, the sentence says so instead. 08 part b and 09 also need a draft render on disk.

## 3. Files passed between steps

All run files live in an `ice/` folder inside the user's project.

| File | Written by | Contents |
|---|---|---|
| `ice/state.json` | router (`ice-state.mjs`) | The run state; the one schema is `skills/ice-motion-director/references/state.md` |
| `ice/BRIEF.md` | router + `ice-direction` | Slots: goal, audience, platform, aspect ratio, duration, language and dialect, message, must-include content, brand and design inputs, references, constraints, commercial use (`commercial_use`, the same name and values as in `ice/state.json`). Every slot names its source: prompt, design file, reference, answer, or decision |
| `ice/DIRECTION.md` | `ice-direction` | One entry per decision: options considered, choice, reason, source (research with date, brief slot, reference) |
| `ice/research/` | `ice-direction` | Dated research notes; every query listed with the brief slots it came from |
| `ice/plan/` | workflow | Storyboard, shot plan, cue sheet, script |
| `ice/plan/craft-plan.json` | `ice-direction` (drafted at 02, the remake at 01; locked at 05), mapped by the workflow at 04 | One row per craft dimension (use, not used or scoped, with its reason, source and check) and the exemption rows; schema, precedence and rules: `skills/ice-direction/references/treatment.md` section "Craft plan"; read by `craft_gate.py` and the gate readers of `ice-qa` |
| `ice/assets/` | `ice-assets` | Truth sheet, facts, manifest, credits, `BRAND-MATERIAL.md` and the one brand sheet path, `ice/assets/brand-sheet.json` |
| `ice/review/` | `ice-qa` | Critic notes, gate outputs, the delivery report with measured numbers |
| `~/.ice-motion-director/fingerprints.jsonl` | `ice-qa` | One line per finished film: palette, type, layout, motion language, structure, sound. Local only, disclosed in README, can be turned off |

## 4. Film types and scoped rules

`ice-film` holds one reference file per film type in `references/film-types/`: product launch, app ad, brand film, logo sting, kinetic type, data story, social short, hype promo, UI walkthrough, music video, art film, industry spot. `ice-edit` holds one per edit type in `references/edit-types/`: long-form, podcast, talking-head ad, shorts and reels, B-roll overlay, showreel.

The per-type craft defaults (which of the 18 craft dimensions each film and edit type uses by default, which a content trigger switches on, and which the style or the reference decides) are summarized in `skills/ice-direction/references/treatment.md` section "Craft plan"; the numbers stay in the type files.

Every type file declares the same fields so conflicting source rules are resolved by scope, not by deletion: purpose, structure options (several, never one), rhythm ranges, transition policy (for example whether crossfades are allowed), camera policy during holds (still or slow push), sound policy, text density, a richness floor table (hero_share, hero_width, frame_fill, empty_half, depth_layers, in_shot_motion, longest_still, surface_detail, light_events, real_material; definitions in ice-motion composition-and-staging section 7, measured by ice-qa), QA thresholds. Domain skills tag each scoped rule with the types where it holds.

## 5. Anti-sameness system

Implemented in `ice-direction` and enforced in `ice-qa`:
- Research queries are assembled from brief slots plus the runtime date; any term that does not trace to the brief is dropped before the query runs.
- Pitch round: several directions, at least two unexpected ones, judged by a separate critic.
- Distance from templates: the film differs from its nearest bundled template or demo on at least 4 of 6 axes (palette, type, layout, motion language, structure, sound).
- Fingerprint check against the local fingerprint file: a new film may not repeat a previous fingerprint.
- Default-look gate: stock AI palette dominance (blue and purple) without a reason in the brief fails.
- Brand test and competitor swap: from 02 on, at the same strength as at 09 (`skills/ice-qa/references/identity-tests.md`).
- Decision log: every choice in `DIRECTION.md` has a reason and a source.

## 6. Writing rules for skill files

- Follow `docs/maintainers/repo-standards.md` section B: portable frontmatter, router description names every deliverable and trigger phrase, domain skills opt out of implicit invocation, `agents/openai.yaml` per skill, references one level deep, files over 300 lines get a contents list.
- Imperative voice, decision tables over prose, one job per section.
- Weak-agent-proof: no single concrete example that can be copied out of context; slots or several varied examples marked as illustration.
- Numbers are kept exactly as measured in the source, with the film types they apply to.
- Every rule appears once, in the skill that owns its domain.

## 7. Where merged material goes

| Source material (extraction file) | Main destination |
|---|---|
| hyperframes-skills, hyperframes-docs-registry | `ice-engines` (HyperFrames guide, lint, render), `ice-motion` (motion grammar, blueprints, cut catalog), `ice-audio` (mix system), router (intent layer, route contracts) |
| reelmimic, hypit, claude-video, howseen remake mode | `ice-remake` (reference analysis, shot mapping, climax duel, crew roles); hypit files in `ice-remake/vendor/hypit/` with its license |
| herk-edit-kit, video-use, claude-code-video-toolkit, video-ad-editor | `ice-edit`, `ice-type` (captions), `ice-audio` (VO pacing, loudness) |
| motionmaxxing, bang-motion, huashu film gate, motion-video-kit critic loop | `ice-qa` (slop scan, gates, critic roles), `ice-motion` (measured curves) |
| lemo-opuscar, huashu-art-motion, anidoodle, mg-styles-15, prompt library index | `ice-styles` |
| explainroo, anything2explainer ideas, video-talkcraft, huashu narration grammars | `ice-explainer` |
| product-launch-motion, charlie947, Barty-Bart explainers, commercial-motion-design, product-launch-video | `ice-film` film types |
| pixel2motion, diffusionstudio lottie, vibe-motion ideas | `ice-lottie` and the logo sting type |
| video-ad-editor, Mamdouh ideas, video-production-studio | `ice-arabic` |
| Barty-Bart sound-effects, mg-styles mgaudio, anidoodle music method, lemo audio chain | `ice-audio` |
| Remotion ideas, haidrrrry, claude-code-video-toolkit Remotion parts | `ice-engines` Remotion guide |
| video-production-studio truth sheet, vibe-motion authenticity gate, anidoodle facts.json | `ice-assets` |
| onetake, video-talkcraft, anything2explainer verbatim files | `skills/<owner skill>/noncommercial/<source>/` with their license; the owner skill marks them noncommercial-only |
