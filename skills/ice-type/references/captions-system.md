# Caption system: roles, model, routing, grouping

Merged from heygen-com/hyperframes (Apache-2.0: embedded-captions, media-use captions, captions-overlay), nateherkai/herk-edit-kit (MIT), digitalsamba/claude-code-video-toolkit (MIT), browser-use/video-use (MIT), vincentsch/explainroo (MIT), majedphotos/video-ad-editor (MIT), AbubakrChan/product-launch-motion (MIT), Omar-Tnzxo/video-production-studio, plus ideas restated from hypit-ai/hypit, Vincentwei1021/anything2explainer, bangtutorial/bang-motion. Restructured; numbers kept.

Read this before deciding whether a film gets captions, what kind, and how words are grouped into cues. Styles live in `caption-styles.md`, timing and text truth in `caption-timing-and-truth.md`, placement in `caption-placement-safe-zones.md`, 3D and embedded captions in `depth-and-embedded-captions.md`.

## 1. Text roles (decide the role first, the look second)

| Role | What it carries | Rule |
|---|---|---|
| Caption | Speech as delivered | Verbatim (see `caption-timing-and-truth.md`). Role decides, not looks |
| Title / section label | A label held after or before a phrase | Typography, even when the words are also spoken |
| Lower third / name plate | Who or where | Separate text role, never inside the caption track |
| Paraphrase / promoted line | A distilled point | Separate role; never shown at the same time as the caption that says the same words |
| Diegetic text | Signs, screens, plates inside the world | Part of the picture, not a caption |
| Keyword text (keyword mode) | Single spoken content words or noun phrases shown large as the speech names them | Its own role, never a caption with words dropped: section 3b |

- Visible motion-graphics text is short copy (hero word, stat, one emphasis word), never a sentence from the narration. When the narration should be readable, turn captions on and do not also show the same sentence as display type (two texts split attention: the viewer asks "read above or below?").
- When motion text writes a sentence, hide that sentence's caption. After a partial effect (some words shown by the effect), the caption shows only the words the effect did not show. Whole sentence in the effect: no caption for it.
- Suppress caption cues that a promoted sentence on screen already carries.

## 2. Captions on or off (scoped)

| Context | Default | Why |
|---|---|---|
| Edit types with speech: shorts and reels, talking-head ad, podcast clips, long-form for social | On, burned in | Most social viewing is muted; captions are non-negotiable there |
| Long-form for YouTube or LinkedIn | Sidecar `.srt` always; burn in only when the platform or brief needs it | Platforms show their own subtitles; some markets need burned subtitles (decide from the brief's platform slot) |
| Explainer with voiceover, vertical, 4:5 or square | On, word-by-word highlight | Mobile, often muted |
| Explainer with voiceover, landscape | Brief decides; sidecar always | |
| Motion film with no voiceover (product launch, app ad, brand film, logo sting, kinetic type, hype promo, music video without lyrics) | Off. Text is the performer | Nothing spoken to caption |
| Drawn or cartoon worlds where the picture explains (some art films, story explainers) | Off, or captions in their own band under the picture | "A picture that does not read is fixed in the picture, never by adding a caption" |
| Collage cuts where the hero word is the text | Off | The hero word is the text |
| Lyric or music video with lyrics | Lyrics only from user-supplied text or LRC (never written, transcribed or quoted by the agent) | Copyright and truth |

Always keep an un-captioned master next to the captioned export, and ship `.srt` (and `.vtt` when asked) from the same timings that were rendered.

## 3. The caption model: drop, rail, embed

Every spoken word gets exactly one treatment:

| Treatment | What it is | Share |
|---|---|---|
| `drop` | Not shown: fillers, exact stutters, self-correction backtracks, interjections | Display about 70 to 85% of spoken words in edited social content; documentary keeps more. Scope line: the share applies to captions only; keyword mode (section 3b) shows about 27 to 29% of the words because it is a different role, and a film in keyword mode is never failed against this share |
| `rail` | Verbatim line in front of the picture (lower third or a placed band) | Carries most of the text |
| `embed` | A peak word composited behind the subject or into the scene | Scarce, earned peak |

Embed scarcity, per beat or thought block (not per clip): at most 1 hero per block, never two co-visible, at least a beat of air between hero windows (warn under 0.6 s), at most one apex (the largest hero, full lockup); other heroes are minor peaks. Embedding every word is the common mistake.

Dropping a structure word (article, negation, preposition) is a bug, not an edit.

## 3b. Keyword mode

Scope: news reel (edit type `news-reel`, style family `family-broadcast-news.md`) whose package or reference runs no full captions, or any film whose reference measures it. Keyword text is its own text role: it shows chosen spoken words large, in the room, instead of a caption track.

| Rule | Value |
|---|---|
| Share of words shown | About 27 to 29 percent of the spoken words (measured 14 of 52, and about 20 of 68), about 1 word in 4 |
| Which words | The content noun phrase or strong adjective that carries each clause (topic, place, action); never verbs alone, never function words; it refers to the topic, never to a person (people get their own elements) |
| Text | Verbatim from the transcript, in the spoken form and order; never paraphrased, never summarized, never translated into another wording |
| Timing | Never late: first frame 20 f early to 3 f late against the word onset at 25 fps, median 4 f early (`caption-timing-and-truth.md` section 3, "Broadcast text leads and lags") |
| Look and exit | Pointer reveal (RTL), glass subtitle box at wide framings, blink exit: `type-effects-specs.md`, table "Broadcast text" |
| One at a time | One keyword element on screen at a time; never two boxes at once |
| Captions with it | Keyword text and a caption never show the same words at once (section 1). When the brief or platform needs captions for muted viewing, the captions stay a separate rail and the keyword copy of those words hides the caption for its window, or the film runs captions only; the choice is logged |

Keyword words are picked from the fresh word-timed transcript and named per element in `plan/shots.json` (`cites` = the exact spoken phrase, `cites_occurrence`, `subject`, `lead_frames`).

## 4. Routing a caption request

1. Probe the clip: shot cuts (sample at 20, 50 and 80% of the duration), letterbox or pillarbox safe rect, background luminance under the caption zone, face position over time, existing burned-in captions (a 1 fps contact sheet shows them).
2. Pick the treatment by visual identity, not by engine. Default: the quiet rail. Use embed only when the user asks for a cinematic or "in the scene" treatment.
3. Shortlist 2 to 3 looks from `caption-styles.md` by content register, the user's own words and scene constraints; recommend one with a one-line reason; the user picks (autonomous runs: pick and log why in `ice/DIRECTION.md`). Never ask the user a backend question ("standard or cinematic").
4. Unsure: the rail.
5. Split multi-shot footage before captioning; a caption that runs across a cut moves to the new shot's position on the cut frame.

Refuse or downgrade embedded captions when: several speakers with hard cuts, no human subject, clip under 3 s, no speech, face never visible, source already has burned captions, garbage transcript after one retry with a larger model, busy handheld camera.

## 5. Grouping words into cues

A cue is a timed block of displayed speech, not a line. Group by meaning and reading time first; word or character caps are limits, not the grouping rule.

### 5.1 Break points (first match wins)

1. Sentence terminator.
2. Pause of 500 ms or more (any silence of 0.5 s or more, or a speaker change, also ends a packed transcript phrase).
3. Comma plus a pause of 250 ms or more, or any natural pause of 150 to 250 ms or more in fast social styles.
4. Discourse reset ("so", "but", "now" opening a new thought).
5. The cap for the style (table 5.2) or 2.5 s, whichever comes first.

Keep together: names, negation with its verb, article and noun, preposition and object, phrasal verbs, number and unit, idioms and collocations. Never strand a determiner at a cue end. Give a payoff or contrast its own handoff when useful. A visual line wrap is not a reason for a new cue.

### 5.2 Words per cue by style (scoped, all kept)

| Style or edit type | Words per cue | Lines | Other limits |
|---|---|---|---|
| Hype, shorts and reels word-pop | 1 to 3 | 1 | Grow to 3 words rather than flash a cue under 0.35 s |
| High energy social | 2 to 3 | 1 | |
| Conversational | 3 to 5 | 1 to 2 | |
| Calm, documentary | 4 to 6 | 1 to 2 | |
| Talking-head ad cards | 5 to 7 | at most 2 | Max line width about 730 px on a 1080-wide frame |
| Natural-sentence long-form | 4 to 7 | 1 to 2 | Sentence case |
| Rail, broadcast, long-form | Up to 6 words or 2.5 s | at most 2 | About 32 to 42 characters per line |
| Karaoke vertical pills | 1 to 3 | 1 | At most 22 characters |
| Remotion-style karaoke pages | up to 7 | 1 | At most 42 characters, new page after a 600 ms pause |
| Single-line subtitle blocks (explainers) | | 1, wrapping is a defect | At most 48 Latin characters (CJK: 16) |
| Platform phrase limits (explainers) | | | 28 characters portrait, 46 landscape, balanced split |

Density cap from speech rate (automatic grouping): above 3.5 words per second cap groups at 2 words, above 2.5 at 3, else 4; split on 0.18 s silence gaps; split on sentence punctuation.

Minimum cue: 2 words and 0.5 s on screen (single-word styles excepted: those still hold at least 0.5 s, and a popped word stays until its sentence ends or at least 0.6 s).

### 5.3 Handoffs

- Repeated tiny handoffs make viewers reacquire the text too often; an overfull block overloads one state. Wrong reading unit: change the handoff. Wrong size, wrap or placement: change the style.
- One caption group visible at a time. No two groups overlap in time and region.
- On a speaker turn, the previous speaker's caption hands off even if their face is still visible.
- Captions never blink out: on shots full of text to read, move to a clear zone instead of disappearing. Scope line: the blink exit of `type-effects-specs.md` "Broadcast text" is for titles and keyword text, never for captions; this rule holds in the news reel too.
- Never back-fill silence: if the speaker pauses 1.5 s or more, leave the screen without a caption. No `[laughs]` or `[sighs]` tags in styled social captions (accessibility subtitles may need them: brief decides).

## 6. Emphasis inside captions

- Emphasis is independent of grouping: a stable phrase, a current-word color, or a trail. Step mode activates whole units; wipe mode sweeps inside glyphs; both follow real speech timing including uneven delivery.
- Appearance (all at once, on word start, typewriter) and color change are separate choices.
- Distribution: about 70% plain body, 20% slight lift, 8% full emphasis, 2% climax (biggest, held 1.5 s, a breath before and after). Do not put the emphasis preset on more than about 30% of groups. Color on 25 to 45% of chunks in color-coded social styles, whole chunk only.
- Break the rhythm once per 30 s. Alternate emphasis treatments every 2 groups (high energy) to 4 to 5 groups (low energy). Emphasis words always break the pattern.
- Per-word styling candidates: brand names (larger or unique color), numbers (bold accent), emotional keywords (overshoot), the call to action. Group a compound or name as one unit when highlighting it; do not annotate every word.
- Speaker-colored captions clarify who speaks, even over full-frame B-roll; coordinate the colors with the scene palette.
- Keyword emphasis must preserve the speaker's wording.
- Inverse colour logic (scoped): the crimson-to-white title of `type-effects-specs.md` "Broadcast text" is crimson while its word is being said and white once said, the opposite of accent-on-active karaoke. It is a title role, not a caption; never mix the two logics in one caption track.

## 7. Head-following captions

Use only when the reference visibly uses them or the user asks; a visible face alone does not justify them. Rules: face box to head box with padding chosen per visible head (no universal multiplier); one box or none per frame per role; interpolate only inside one continuous shot and one person; stop at cuts and occlusion; leave room above the head for the whole cue. Detector face tracks are not identities: cuts split one person into several tracks, and picking the first or largest face can attach a guest's caption to the interviewer. Re-measure after any regeneration or reframe. Check first and last frame of each cue, top-edge clipping, collisions, jitter and wrong-person jumps.

## 8. Arabic and RTL captions

Arabic grouping, whole-word rules, bidi of Latin names inside Arabic lines, dialect ASR errors and Arabic caption metrics: see the `ice-arabic` skill.
