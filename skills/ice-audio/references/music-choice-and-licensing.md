# Music choice, sourcing and licensing

Read when the film needs music: before any cue sheet is final, before searching for a track, and before any AI-generated or opt-in code score. Sources: Barty-Bart/motion-graphics (sound-effects, MIT), echris6/motion-video-kit (MIT), alexgreensh/anidoodle (MIT), heygen-com/hyperframes (media-use, product-launch-video, Apache-2.0), claude-code-video-toolkit (MIT), video-production-studio and brand-identity-studio (founder), herk-edit-kit (MIT), browser-use/video-use (MIT), reelmimic (MIT), lemo-opuscar (MIT), plus ideas restated from hypit and noncommercial sources.

## 1. First decide whether the film has music at all

| Situation | Decision |
|---|---|
| User says "no audio" | Fully silent file. Say so in the report. Note: "no narration" is not "silent". |
| User says "no music" | No bed. SFX and voice may remain. |
| Whiteboard or lecture style explainer where the voice carries everything | No music under speech is a valid choice; music may play only in gaps. |
| Muted-first social placement | Music still ships, but the story must also work muted (claims on screen, owned by ice-type). |
| Talking-head or podcast edit | Bed is optional; the person's voice leads. |
| Everything else | Music is expected. A silent explainer or promo feels unfinished; never ship silent by default. |

Listen to what the material already carries before adding sound (existing footage audio, room tone, a supplied track). Designed quiet is a choice; silence by default is a failure.

## 2. Pick the source (owner decision, 2026-10-29: real tracks by default)

Rights are the user's (the `ice-assets` skill, `references/sourcing-and-licenses.md` section 0): a reference's own track, the user's track or any available commercial track is a valid choice when the user wants it; its license status is recorded and listed in the delivery note, and a track that platform matching may mute or claim gets one information line there. The rows below are defaults for when the user did not name the music. Every default is a real track found down the music ladder (`ice-audio/SKILL.md` section 5), ranked by measurement and picked by ear through the options flow there. Music made by code is opt-in only (`ice-audio/SKILL.md` core rule 7): code scores were rejected as noise (pulses, banging, drones), and library catalogs cover synthetic styles too.

| Scope (film or edit type) | Default source | Why |
|---|---|---|
| User supplied or named a track (their own, the reference's, any available song) | That track, measured and edited to picture | The user's choice wins. Section 5 records its license status; nobody asks where it came from. |
| brand film, industry spot, product launch, talking-head ad, long-form, podcast, showreel | A real human-made library track, one continuous piece unless the type splices | Client rounds rejected generated scores as "off brand" and synthesized hits as unprofessional; a real track edited to picture landed. |
| art film, kinetic type, logo sting, data story, UI walkthrough loops, any film in a code-native art style (chiptune, synthwave, pixel, HUD, Bauhaus, liquid, lo-fi collage and similar) | A real library track whose genre, instruments and production fit the style's sound palette (electronic, chiptune, synth and glitch catalogs exist on the ladder's routes) | A synthetic picture world takes synthetic-sounding music made by people who produce it, not a code score. |
| app ad, social short, hype promo | A real library track with a hook in the first 2 to 4 s | Feed ads need a hook; the license status is recorded for paid placement (section 5). |
| The user wants zero third-party assets | The user's own music; without it, no bed and the delivery note says "music needed" | Zero third-party assets is not a request for music made by code. |
| A music brand: the brand's product is music (a streaming service, a label, an artist, a radio station, a music app) | Default: a real library track, with the catalog inside captured screens shown as the brand's published demo content or neutral placeholders (the `ice-assets` skill, third-party content inside a brand's screens). A catalog track when the user asks for one, recorded `needs purchase` (composition and recording) | A catalog track implies an artist's endorsement, so it is the user's call, not a default. |
| No track fits, or none can be had (offline, downloads turned off, nothing found) | No bed. The delivery note says "music needed" and names 3 real tracks that fit the measured target (the last rung of the music ladder, `ice-audio/SKILL.md` section 5); never a code score | The film never waits on a download, and a stand-in made by code was rejected as noise. |
| User asks for AI music generation (a generator service) | Optional, user-initiated, disclosed (section 6) | Never the primary service of this plugin. |

## 3. Choose by brief, never by adjective

1. Write the music brief as numbers before searching or composing: use case, film length, loop or not, 3 to 5 picture beats with their times, the person's own feeling words, mode (voice-led, music-led, hybrid).
2. Match the music to the audience of the brand, not to a generic "tech launch" sound. Search by the film's category or industry slot from `ice/BRIEF.md`; a local folk flavour is a user choice, never a default derived from the country.
3. Web research queries are built only from brief slot terms, the runtime date and the frame words of the `ice-direction` skill, `references/research.md` section 3, and pass its trace check (section 4); a term that does not trace is removed. Structured library filters are not web queries (owner decision, 2026-10-29): where a library's search offers fields for tempo, mode, mood, genre or instrumental, they may carry the measured tempo window (the reference tempo, its half or its double, plus or minus 8 BPM, only when its confidence is 0.35 or more, `sound-map.md` section 4 item 7; without a reference, the tempo table below for the brief's feel), the measured mode, instrumental, and the mood and genre tags the user confirmed at stage 01 (a sound map's guesses are proposals until then). Free-text search words in a library still trace to the brief.
4. Tempo starting ranges (pick inside, then confirm by ear):

| Feel or use | BPM range | Source |
|---|---|---|
| Regal, slow luxury | 60-80 | product-launch-motion |
| Smooth, calm brand, home services | 84-110 (home services measured 84-88, major key) | motion-video-kit, product-launch-motion |
| Ads and reels default | 90-120 | video-production-studio |
| Elite or sophisticated launch | 115-123 | product-launch-motion |
| Hype, sizzle, showreel | 120-130 and above 125 | product-launch-motion, herk motion-showreel |
| UI and app motion ads (measured) | 100-125, median 114 (7 of 10 films with a readable tempo) | `ice-film` skill, `references/genres/ui-motion.md` |
| Meditation, ambient loop | 50-70, no percussion | anidoodle |

Tempo and mode are the strongest emotional cues: filter candidates by both (item 3), then rank them by measurement (`scripts/match_music.py`, `ice-audio/SKILL.md` section 5).

5. "Chill still needs a pulse": a calm film still needs a steady groove that starts on the first beat; reject tracks with near-silent intros, dips or early decay (check short-term loudness per second). News reel: a pulseless pad is the measured bed of the talk-show package, so "News reel music" (section 4b) replaces this item for that type.
6. Avoid for client brand work unless the brief asks: vocals or humming under narration, lo-fi vinyl crackle, ukulele and whistling corporate stock, trailer hits, EDM drops, stacked risers, anything "epic". Leave out vocals unless the film is a sting or music video.
7. Under narration use instrumental tracks with clear narration space (a mid range that leaves 1 to 4 kHz for the voice). Music-forward moments (title, CTA, music video) may use louder or vocal material.
8. Deliver 2 to 3 options (5 to 7 for a picky client with back-timed tracks) under the same picture at identical measured loudness with `scripts/preview_options.py` (option files and `compare.html`; `--align end` for the back-timed edit of section 4 item 3), effects re-levelled per option, files named by track. Who hears them and when: the options flow, `ice-audio/SKILL.md` section 5. Always also deliver a music-only render as a fallback and for isolating complaints.
9. Breadth across projects: vary meter, harmonic rhythm, groove family and form length. Two scores for two products should not be siblings. Record genre, BPM, key and mode in `ice/DIRECTION.md`. The fingerprint's sound axis: the `ice-direction` skill, `references/anti-sameness.md` section 1.

## 4. Editing a licensed track to picture

1. Analyze the actual final file (not a preview): BPM, downbeat, sections, energy per bar, drop, ending cadence. Use cue-map-and-beat-sync.md for measurement.
2. Check where it really starts: a library track often opens on a quiet build that drains the first seconds of a short film. Compare the opening against later 5 second sections; start at a stronger clean section with a short fade-in and keep the track's real ending (recheck after every timing change so music never ends early).
3. Default edit (brand film, calm pieces, any client who dislikes "sudden cuts"): back-timing. Line the track up so its own final hit lands on the end-card cut to the frame, play it as one continuous piece from film 0, nothing cut, looped or spliced. Move the picture to the beat, not the music. Varispeed up to 1.7 % (about 0.3 semitone) is inaudible if the tempo must match a grid.
4. Splice edits (hype promo, showreel, music video, or when the client wants a drop): cut on bar lines only, equal-power crossfades about 12 ms, each cut placed 12 ms before the grid point so the transient survives, a 5 ms fade-in on the first sample, stretch at most 0.5 % between cuts. A dead stop (about 0.4 s) before the drop is allowed once per film, at most one bar.
5. If the track is longer than the film and back-timing does not fit, make one cut on a downbeat into the last bars so the track's own ending lands on the end card.
6. Ending (a news reel follows section 4b, which may end the bed before the end card): finish on the end card with a clean button or held final chord whose tail rings to the last frame. Never a cut-off and never dead air after it. A fade-out is reserved for loops and ambient beds; if a track has no usable ending inside the film length, fade over at least 1 to 2 s ending after the last spoken word, and never fade the last spoken word.
7. If the music resolves on the logo, do not add a separate musical sting (key clash), and on calm pieces do not cut the music out before the logo.
8. Check what each section plays: a solo hand-drum stretch can read as comic; prefer opening on a melodic section. A percussive-only stretch can be found by harmonic-percussive separation.
9. Anything visual driven by the music (pumping, beat lights) is re-driven from the chosen track and knows its own start time in the film.
10. Loop deliverables ship as WAV: MP3 encoder padding clicks or gaps at the loop point.

## 4b. News reel music

Scope: the news reel (edit type `news-reel`, style family `family-broadcast-news.md`). Measured on six broadcast reels; the bed levels and ducking live in `mix-and-master.md` section 5, row "News reel, speech-led". The bed is a real library track found down the music ladder and picked by ear through the options flow (`ice-audio/SKILL.md` section 5), never a code score unless the user asks for one in their own words (core rule 7).

| Package (`ice-styles/references/family-broadcast-news.md` section 2) | Genre and character | Tempo and pulse | Level under the voice | Structure |
|---|---|---|---|---|
| Talk-show promo | Dark ambient pad or drone in a minor key, no drums; slow low swells allowed | No usable pulse (clarity 0.07 to 0.10) | 28 to 31 dB under | Enters in the first pause after the greeting (about 1.0 to 1.15 s, up in 20 to 30 ms); flat under the talk; fades over about 2 s during the call to action and is gone 0.7 to 1.8 s before the cut; no music on the end card |
| Talk-show promo, heavier variant | Darker drone with mid tonal lines and soft percussion | Weak pulse (about 0.19) | About 15 dB under | Enters with the end of the opening package; may be pulled out for about 3.5 s under a key quote and come back on a boom; out about 3 s before the voice ends |
| Explainer promo, vertical | Bass-heavy percussive bed (about 92 % of its energy under 150 Hz) | Weak pulse (about 0.12) | About 14 dB under | From the opening boom; up in the archive montage; a held bass note under the sign-off title; fades through the end card, then silence |
| Explainer promo, horizontal | Rhythmic half-time groove | The only real pulse (clarity about 0.30, half-time near 101 BPM) | 10 to 15 dB under on the presenter, up on B-roll | Opening hit; up in montages; fades under the closing promise; a loud outro on the end card faded to zero over the last 2 s or so |
| English explainer | Bright news bed (centroid about 2.6 kHz) | Weak pulse (about 0.12) | About 22 dB under the talk, up in pauses and B-roll | Pre-roll before the voice; steps back for actuality; outro on the end card with a 1.8 s fade to silence |

Rules:
1. Choose the row by the package the stage 01 answers chose (or the package the reference measures); a news reel in the user's own identity takes the row whose job fits the content (a talk-show promo, an explainer with archive, an English-style explainer) and a track of its own (anti-sameness: the structure, never the reference's track, unless the user chose the reference's own recordings, `ice-remake/references/rights-and-modes.md` section 1).
2. Library filters (section 3 item 3): instrumental, the measured mode, the confirmed mood and genre tags; a tempo window only when the measured pulse has a confidence of 0.35 or more (`sound-map.md` section 4 item 7). A pulseless bed is ranked by brightness, loudness range, key and section movement (`scripts/match_music.py music` scales the tempo weight down when the reference's tempo confidence is low), and its share of energy under 150 Hz is checked by ear against the row.
3. Cuts and graphics follow the words, never a beat grid, except a voiceless montage cut to hits (`cue-map-and-beat-sync.md` section 5, row "News promo").
4. How it starts: never a fade from the film start; the bed enters on its measured entrance (first pause, the opening hit, or a pre-roll) with a short 30 ms ramp.
5. How it ends, back-timed to the end card (section 4 item 3, `scripts/preview_options.py --align end`): when the package carries an outro on the end card, the track's outro or final hit lands on the end-card cut and fades to zero in the last 1.8 to 2.4 s; when the package ends the bed before the card (talk-show promo), the back-timing places the fade so the bed is gone 0.7 to 1.8 s before the cut and the end card carries only its own sounds, then silence (`mix-and-master.md` section 5, row "News reel, speech-led" item 8).
6. Chosen by ear: 2 to 3 options laid under the animatic or the draft at equal measured loudness (section 3 item 8); without a listener the closest by measurement is used and the delivery note names the other two.

## 5. Sync license check and license record (a status, never a block)

Run this check when a track is picked, before it enters the cue sheet: 01 for music-led films (hype promo, music video, kinetic type cut to a track, showreel), 08a for the others. Its result is the track's license status (`licensed` when every row passes, otherwise `unknown` or `needs purchase` with the failing rows named); it never drops a track the user chose. Opt-in music made by code (`ice-audio/SKILL.md` core rule 7) skips the table (it is license-clean) but still gets its credits row.

1. The general record for every music file, supplied or found (rights are the user's, the record and the "Needs a license before publishing" list, use case, dated license page check, license classes, CC BY scope by film type, recorded library terms): the `ice-assets` skill, `references/sourcing-and-licenses.md` sections 0, 2 and 3.
2. The sync table. A row that does not pass, or is unknown, is written into the status.

| Check | Passes when |
|---|---|
| Composition (publishing) sync right | the license lets this musical work be set to picture for this use |
| Master use right | the license covers this exact recording (a library license usually grants both rights; a commercially released song never does without both rights holders) |
| Use | the brief's use is listed: organic social, paid ads, client work, broadcast, app store page, event screen, as the brief says |
| Platforms | every target platform in the brief is covered (some free libraries cover one platform only) |
| Territory | the brief's market is covered |
| Term | the license lasts as long as the film will run; a dated term goes in the delivery note |
| Edits | cutting, looping, back-timing and cutdowns are allowed |
| Content ID | the track will not claim the user's upload, or the license names how to clear a claim |
| Attribution | the required credit fits the film (ads take attribution-free music unless the user accepts a credit line) |
| Proof | the license page or certificate is saved under `ice/assets/` with the date it was checked |

3. Not every row passes: the track stays when it was chosen; its `CREDITS.md` row says `unknown` or `needs purchase` with the rows that did not pass and where the license can be bought when known, and the delivery note lists it under "Needs a license before publishing", plus one information line when platform matching may mute or claim it. It is never described as cleared.
4. Every row passes: one row in `ice/assets/CREDITS.md` with the license, its terms (use, platforms, territory, term) and the proof file; the delivery note repeats the terms the owner must respect.
5. When the user named no music and no track fits, section 2 decides (no bed, and the delivery note says "music needed" with 3 named real tracks).
6. Download location: the `ice-assets` skill, `references/project-folders.md` section 1. Never into the skill folder, never committed to the plugin. Which downloads need a question: the `ice-assets` skill, `references/sourcing-and-licenses.md`.
7. Credits: one row per music file in `ice/assets/CREDITS.md`: the `ice-assets` skill, `references/project-folders.md` section 4. CC0 files and opt-in code scores get a row too.
8. Supplied reference audio: measure L, R and L+R separately (phase-inverted stereo cancels in mono; if mono is more than 10 dB under the louder channel, use one channel). A level under -45 dB counts as silent: do not use it; say in the delivery note (or on the review card in step mode) that a proper file is needed. A noise floor above -45 dB is usable; state the quality ceiling the same way.

## 6. AI music generators (optional)

Use only when the user asks for one, and say which service, what is sent, what it costs and that the result is AI-generated. When used:
- Describe the measured grammar (tempo, kick pattern, claps on 2 and 4, density, a button ending), never brands or artists (requests naming them are refused and the habit copies others' identity).
- Prompt in layers: genre, emotion, instruments, timbre, era, production; avoid contradictions; put BPM and key in the tool's parameters, not in the caption; sparse captions leave room; repetition marks priority. For beds, request instrumental only.
- For one bed across scenes generate one long track. To fight samey output, vary seeds, BPM and key, and generate several variations; a fixed seed keeps a brand's sonic family consistent.
- Respect service concurrency limits and back off on rate-limit errors (one source measured 2 parallel requests, retry after 30 to 40 s).
- A generated track still passes the guards table in music-by-code.md section 4, the comfortable mix in mix-and-master.md section 3 and the human listen in mix-and-master.md section 8.
