# Route contracts

One section per route. Read only the section of the matched route. Each table says what the route needs when its first stage starts, what it checks and what it delivers. Its "Spine stages" row says what each of the ten stages means on that route; the workflow's own `## Spine stages` section holds the detail and wins when the two differ.

Stage 01 on every route is `ice-direction/SKILL.md` section 3, Part A, steps 1 to 7: the research of steps 1 to 5 runs before the stage 01 questions of step 6 (four choices for every open decision slot), and step 7 writes the stage 01 artifacts. Part B, steps 8 to 14, runs after 01, at the stages that own each decision (mainly 02 and 05), never before 01 is done. "Needs at the start" is what Part A fills before the workflow's own 01 work: `ice/state.json` with stage 01 `in_progress`, `ice/BRIEF.md` with the slots below (or a logged default for each), and `ice/DIRECTION.md` with its header.

Contents: [ice-film](#ice-film), [ice-explainer](#ice-explainer), [ice-remake](#ice-remake), [ice-edit](#ice-edit), [ice-lottie](#ice-lottie), [ice-ideas](#ice-ideas).

## ice-film

| Field | Contract |
|---|---|
| Trigger | A finished film made from scratch: product launch, app ad, brand film, logo sting, kinetic type, data story, social short, hype promo, UI walkthrough, music video, art film, industry spot |
| Needs at the start | Brief slots: goal, audience, platform and aspect ratio, duration, language, message, must-include content, commercial use |
| Optional inputs | Design file, brand assets, logo, product screens or recordings, music the user owns |
| Gates the workflow runs | Truth sheet (`ice-assets`), storyboard lint and contact sheet (`ice-qa`), the cold-viewer clarity reads at the end of 04 and 05, at 06 and at 09 (`ice-qa/references/clarity-gate.md`), the preview approval of router stop B when it applies, delivery report; for a brand, the brand test and competitor swap at 02, 04 and 05, confirmed at 09 (`ice-qa/references/identity-tests.md`); the studio benchmark at 05 (`ice-qa/references/studio-benchmark.md`) |
| Output | Final MP4 (plus alpha or extra ratios when asked), `ice/review/NOTE.md`, credits |
| Noncommercial material | The workflow uses its `noncommercial/` folder only when `commercial_use` is `no` |
| Prerequisites | The engine picked by `ice-engines`; see `prerequisites.md` |
| Spine stages | 01 brief, 02 concept, 03 script, 04 storyboard, 05 look, 06 animatic, 07 build, 08 sound (08a with 07, 08b mix after it), 09 review, 10 deliver |
| Changes after delivery | Reopen the stage that owns the change (script, storyboard, build, sound); never patch only the render |

## ice-explainer

| Field | Contract |
|---|---|
| Trigger | A narrated film where the voiceover leads: explain, teach, narrate, document, walk through how something works |
| Needs at the start | Brief slots: goal, audience, language and dialect, platform, duration, message, voice source (user recording, TTS or none), commercial use |
| Optional inputs | Script, article, document, data, product, existing voiceover |
| Gates the workflow runs | Script approval (the user in step mode, the approver role in auto mode), word timing, re-transcription of the final mix, the cold-viewer clarity reads (end of 04 and 05, the 06 sample, 09), `ice-qa` gates, delivery report; for a brand, the brand test and competitor swap at 02, 04 and 05, confirmed at 09 (`ice-qa/references/identity-tests.md`); the studio benchmark at 05 (`ice-qa/references/studio-benchmark.md`) |
| Output | Final MP4, caption sidecars, chapter list when the platform uses chapters, `ice/review/NOTE.md` |
| Noncommercial material | Its `noncommercial/` folders are used only when `commercial_use` is `no` |
| Prerequisites | Engine from `ice-engines`, FFmpeg, a local speech-to-text model for timing; TTS only if the user chose it |
| Spine stages | 01 brief, 02 concept, 03 narration script, 04 storyboard, 05 look, 06 voice-first animatic, 07 build, 08 voice, score and mix, 09 review, 10 deliver |
| Changes after delivery | A changed word retimes everything after it: reopen at the script stage |

## ice-remake

| Field | Contract |
|---|---|
| Trigger | The user supplies a reference (video file, saved site or app, image set) and wants a new film in that style with their own content |
| Needs at the start | The reference as a file (a link is downloaded by default so it can be measured; the `reference_file` question of stage 01 only when it cannot be fetched; `ice-assets` sourcing rules); brief slots: the user's own content and message, rights status of each reference, commercial use |
| Gates the workflow runs first | Intake: no rights gate (rights are the user's responsibility, one neutral line in the brief); the reference's own footage, music, voice-over, logos and characters go in as they are or are recreated, as the `identity` slot says (`ice-remake/references/rights-and-modes.md` section 1); every outside item is recorded with its license status (`ice-assets/references/sourcing-and-licenses.md` section 0). Faces and voices of real people: `ice-assets` skill, `references/ai-media-policy.md` section 9; for a brand, the brand test and competitor swap at 02, 04 and 05, confirmed at 09 (`ice-qa/references/identity-tests.md`); the studio benchmark at 05 with the reference as one benchmark (`ice-qa/references/studio-benchmark.md`) |
| Gates during the run | Shot mapping to the reference, stats within the agreed range, the cold-viewer clarity reads (end of 04 and 05, 06, 09; `ice-qa/references/clarity-gate.md`), climax duel before delivery, `ice-qa` gates |
| Output | Final MP4, analysis notes, `ice/review/NOTE.md` |
| Prerequisites | FFmpeg, Python for the analysis scripts, the engine from `ice-engines` |
| Spine stages | 01 brief plus reference analysis, 02 treatment mapped to the reference, 03 script, 04 shot mapping, 05 look locked to the reference, 06 animatic, 07 build, 08 sound, 09 review plus climax duel, 10 deliver |
| Compound | Footage plus reference: `ice-edit` runs and borrows this workflow's analysis step |
| Style recipe | Export: stage 10 writes `ice/reference/<ref-id>/STYLE-RECIPE.md` and `style-recipe.json` (`ice-remake/references/style-recipe.md`). Recipe only: `run_mode recipe-only`, order `01 10`, delivers the recipe and its prompt block, no render. Incoming recipe: with footage `ice-edit`, without it this route in the header's mode (`classify.md`, "Style recipes") |

## ice-edit

| Field | Contract |
|---|---|
| Trigger | The user supplies video or audio to cut, clean, caption, reframe, split into clips, or add B-roll and motion overlays to |
| Edit types | Long-form, podcast, talking-head ad, shorts and reels, B-roll overlay, showreel (the workflow picks one) |
| Needs at the start | The media files; brief slots: goal, platform and aspect ratio, must-keep content, language, commercial use |
| Gates the workflow runs | Footage ledger, transcript-driven cut plan, self-review at every cut, captions matching the spoken words, loudness on the export, the cold-viewer clarity read 3 for edit types that sell or promote (`ice-qa/references/clarity-gate.md` section 1), delivery report; for those same edit types made for a brand, the brand test and competitor swap at 09 only (`ice-qa/references/identity-tests.md`); no studio benchmark |
| Output | Final MP4, edit decision list, retimed transcript, caption files, `ice/review/NOTE.md` |
| Noncommercial material | Never used on this route |
| Prerequisites | FFmpeg and FFprobe, Node, Python, a local speech-to-text model with word timestamps |
| Spine stages | 01 brief plus ingest, 02 edit approach, 03 paper edit from the transcript, 04 B-roll and overlay plan, 05 grade and caption style, 06 rough cut, 07 fine cut and overlays, 08 sound, 09 review, 10 deliver |
| Paid services | Hosted transcription, TTS or AI footage are optional and only with the user's consent |

## ice-lottie

| Field | Contract |
|---|---|
| Trigger | The output runs inside a product: Lottie JSON, animated SVG, loaders, icons, micro-interactions, lower thirds as overlays, logo loops, motion tokens |
| Not this route | A rendered film for a feed, ad or launch goes to `ice-film` or `ice-explainer` |
| Needs at the start | The UI, icon or logo source (vector preferred), target runtime (web, iOS, Android, After Effects), size and frame rate limits, the brief |
| Gates the workflow runs | Raster-logo intake gate, final frame equals the approved artwork, file weight and frame-rate checks, playback check in the target runtime |
| Output | Lottie JSON or animated SVG, preview GIF or MP4, developer handoff notes |
| Prerequisites | Node; the Lottie tools named by the workflow |
| Spine stages | 01 brief, 02 concept, 03 not used, 04 states and frames, 05 look, 06 not used, 07 build, 08 not used, 09 review, 10 deliver |

## ice-ideas

| Field | Contract |
|---|---|
| Trigger | The user wants ideas without a render: concepts, hooks, scripts, storyboards, animatic specs, treatments, campaign plans |
| Needs at the start | Brief slots: goal, audience, platform, message; the stage 01 research notes |
| Gates the workflow runs | At least two unexpected directions in every concept set, no invented facts, the viewer takeaway under the chosen idea (and the micro clarity read when frames are drawn), approval of the chosen idea; for a brand, the brand test and competitor swap at 02, and at 04 or 05 when frames are drawn (`ice-qa/references/identity-tests.md`); the studio benchmark only when style frames are drawn (`ice-qa/references/studio-benchmark.md`) |
| Output | Files in `ice/plan/` (ideas, hooks, script, storyboard, treatment, campaign) and `ice/plan/handoff.md` |
| End of the run | Every stage after the last deliverable the user asked for is `not_used`, so auto mode stops there. Building the idea is a new route and starts only on the user's own word: then update `route` and `order` and continue with the build workflow (`references/state.md`, "Resume" step 4) |
| Prerequisites | None beyond the agent itself |
| Spine stages | 01 brief, 02 concepts, 03 script, 04 storyboard, 05 optional style frames, 06 optional animatic spec, 07 and 08 hand-off to the build route, 09 review of the idea set, 10 hand-off |
