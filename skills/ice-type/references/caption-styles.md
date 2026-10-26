# Caption styles and looks

Merged from heygen-com/hyperframes (Apache-2.0: embedded-captions CATALOG, aesthetic-principles, rail, motion-vocabulary, direction-catalog, typography-presets; media-use captions authoring and motion; registry caption templates; docs captions catalog), nateherkai/herk-edit-kit (MIT), browser-use/video-use (MIT), majedphotos/video-ad-editor (MIT), digitalsamba/claude-code-video-toolkit (MIT), Vincentwei1021/mg-styles-15 (MIT), yihui-dev/awesome community skills (vox-explainer, captions), plus ideas restated from Vincentwei1021/video-talkcraft and alchaincyf/huashu-art-motion. Restructured; numbers kept.

Fonts named below describe what the sources measured. They are illustration only: the family comes from the brand or from the `ice-direction` skill's type pairing, never from this file by default.

## Contents
1. Style axes
2. Tone to style table
3. Caption motion vocabulary
4. House styles (scoped presets)
5. Look catalog (35 identities)
6. Style rules that hold everywhere
7. Conflicts and their scope

## 1. Style axes

Every caption style is a choice on these axes. Decide each one and log it:

| Axis | Options |
|---|---|
| Chunking | 1, 2, 3 words, phrase, sentence (see `captions-system.md` 5.2) |
| Case | UPPER, Title, sentence case, lowercase |
| Placement | Margin from bottom, placed zone, seam, embedded (see `caption-placement-safe-zones.md`) |
| Surface | Bare with stroke or shadow, local scrim, box or card, pill, band |
| Reveal | Whole group, word on start, karaoke color, typewriter, burn-in |
| Emphasis | Color, scale, weight, accent face, highlight capsule, marker |
| Motion energy | Still, gentle fade-up, pop, slam |

## 2. Tone to style table

| Tone | Face class | Weight | Motion | Duration | Size (landscape 1080 tall unless noted) |
|---|---|---|---|---|---|
| Hype | Heavy condensed | 800 to 900 | Scale-pop, `back.out(1.7)` | 0.1 to 0.2 s | 72 to 96 px |
| Corporate | Clean sans | 600 to 700 | Fade plus slide, `power3.out` | 0.3 s | 56 to 72 px |
| Tutorial | Monospace | 500 to 600 | Typewriter | 0.4 to 0.5 s | 48 to 64 px |
| Storytelling | Serif | 400 to 500 | Slow fade | 0.5 to 0.6 s | 44 to 56 px |
| Social | Rounded, playful | 700 to 800 | Bounce | | 56 to 80 px |

Do not match a hype style to calm content. Do not mix caption styles inside one section. Do not stack a heavy effect on every word.

Tone to timing (enter stagger / hold or exit):

| Direction | Stagger | Hold | Move |
|---|---|---|---|
| Documentary | 150 ms | 600 ms | Burn-in, about 70% opacity feel, no emphasis |
| Conversational | 80 ms | 400 ms | Word fade-up |
| Energetic | 50 ms | 300 ms | Word pop |
| Poetic | 250 ms | 1200 ms | Etch |
| Investigative | 25 ms per character | 500 ms | Typewriter, cursor 600 ms |
| Keynote | Phrase | 600 ms | Swipe |

Stagger ladder: 40 ms machine-gun, 80 ms conversational, 150 ms documentary, 250 ms or more poetic.

## 3. Caption motion vocabulary

| Move | Spec |
|---|---|
| Word fade-up (default) | 80 ms stagger, y 8 to 0 px, `cubic-bezier(.2,.7,.2,1)` |
| Word pop | 60 ms, `cubic-bezier(.34,1.56,.64,1)`. Never for documentary |
| Swipe reveal | 400 ms clip-path, `cubic-bezier(.77,0,.175,1)` |
| Drop and settle | 120 ms |
| Etch | 600 ms |
| Crosshair | 200 ms |
| Breathing hold | scale 1.00 to 1.008 over 2 s |
| Cascade | plus or minus 40 px, once per 30 s at most |
| Burn-in | 1 frame |
| Typewriter | 25 to 35 ms per character |

Rules:
- Minimum 0.4 s per word visible; 200 to 220 ms stagger per word in phrase reveals; hold the full phrase 0.4 to 0.6 s. Entries under 150 ms read as frantic.
- Exit is the entry reversed at about 60 to 75% of its duration. Never fade out during speech.
- `linear` is almost always wrong for caption motion.
- Animate transform and opacity only. Do not animate `letter-spacing` or `filter: blur` on word entrance.
- Premium flow: 2 to 4 words per line, about 380 to 520 ms per word (premium pacing is slower than the hype style); climax hold at least 1 s after its entrance (entrances 0.6 to 1.6 s); flow words enter in 0.30 to 0.50 s with 50 to 150 ms stagger. `bounce.out` and `elastic.out` are forbidden except in a playful look. The flow stays clean; the big mood move and any scene effect happen only at the climax.

Karaoke baseline (hype and social narration): every energy level uses a karaoke highlight as the base. High energy: accent color plus glow plus about 15% scale. Low energy: a 3% white shift. Active word pop 0.06 to 0.12 s, scale about 1.08 to 1.1. Music under the voice: modulate scale 3 to 6% per group from the audio envelope, computed at build time (see the `ice-audio` skill for envelope extraction).

## 4. House styles (scoped presets, illustration only)

Each preset is one measured source style. Use it as a reference point for its scope, never as the default for an unrelated film.

| Preset | Scope | Spec |
|---|---|---|
| Boxed hard-swap | Shorts and reels, educational talking head | 1 to 3 words, split on phrase boundaries; hard swap with no pop, appear 2 frames before the first word; heavy sans all caps about 62 to 64 px at 1080 wide; accent serif on 5 to 20% of chunks for soft words, never two serif chunks in a row; color on 25 to 45% of chunks (red loss or wrong way, teal concept, green action or payoff); every caption in the same dark box with a thin light edge so it reads on black, white and footage alike. Mixing boxed and bare captions looks cheap |
| Bare karaoke | Hype shorts, creator reels | Heavy sans 900, 46 to 58 px at 1080 wide, white base; active word scale 1.08 plus accent color; stroke via layered `text-shadow`; no background pill; pop 0.08 to 0.12 s |
| Big karaoke block | Hype social, registry caption blocks | Proportional face at least 96 px (monospace 64 to 72 px); `-webkit-text-stroke` 2 to 3 px or multi-layer `text-shadow`; template: 900 weight, 128 px uppercase, stroke 3 px `rgba(0,0,0,0.8)`, `paint-order: stroke fill`, shadow `0 4px 12px rgba(0,0,0,0.5)`, fit max width 1550 base 128 min 48, entrance scale 1.3 in 0.15 s `back.out(2)`, karaoke color plus scale 1.1 in 0.06 s, exit 0.1 s before group end |
| Rail | Talking head, explainer, long-form, accessibility | Lower third centered; at most 2 lines, about 32 to 42 characters per line; size `calc(0.045 * frame height)`; one clean sans 500 to 600; local scrim 30 to 40% sized to the text, never frame-wide; 150 to 250 ms fade-up in and fade-down out; inline emphasis at most a 1.1x pop; never behind the subject |
| Glass long-form caption | Long-form, podcast | Bottom 72 px, padding 12 by 22 px, radius 14 px, `rgba(10,8,5,0.55)` plus blur 8 px, 500 weight 28 px line height 1.3 at 1080 tall; captions as top-level siblings outside sub-compositions on their own track |
| Bold overlay | Shorts | About 2-word chunks, uppercase, break on punctuation and pauses of 0.3 s or more, grow to 3 words rather than flash a cue under 0.35 s; bold white on outline |
| Natural sentence | Long-form, interviews | 4 to 7 word chunks, sentence case, break on natural pauses, larger face, bottom margin 60 to 80 (ASS `MarginV`) |
| Calm premium card | Premium talking-head ad | Card fades only; spoken word does not jump; hot word does not pulse; spoken-word color change stays; no word effects in such videos |
| Podcast shadow | Podcast clips | White text with shadow, 2 to 3 words, spoken word in accent color |
| Plain sentence subtitle | Platforms that require burned subtitles, documentary explainers | Whole sentence appears and leaves at once, no animation, no punctuation except inside numbers or versions; pauses become separate cards. The only animated exception is a keyword pop, at most 3 times per film, delayed after the sentence appears, scaled from the word's baseline, one word per sentence. Landscape: bottom 100 px, max width 66%, 44 px weight 600 (38 px over 24 characters). Vertical: bottom 350 px, 90% width, 48 px. Chinese-platform variant: white 50 px, 10 px black stroke, whole sentence cut in and out |
| Explainer rail (vox-like) | Explainers with collage visuals | 30 px 600 weight dark ink, bottom center (y about 980 at 1080), white glow on dark sections, single-frame hard cuts between cues (no fades) |
| Broadcast | News-like, documentary | 160 to 180 wpm speech, 32 to 34 characters per line, 1.5 s minimum gap, 40% gradient pill |
| Variety reaction text | Comedy, variety shorts | Fill plus thick white stroke plus colored outer stroke or shadow; pop scale 0 to 1.15 to 1.0 in about 8 frames, or per-character bounce with 2-frame stagger; decoration matched to the emotion; appears 2 to 3 frames after the voice or beat (it reacts); wiggle on long holds |
| Remotion-style pages | Remotion builds | Karaoke on, max 7 words, max 42 characters on one line at 1080p, new page after a 600 ms pause, hold 400 ms, bottom 80 px, page ends at sentence punctuation, active word in the theme accent. TikTok-style: combine tokens within 1200 ms, heavy weight, 2 to 4 words per page, at about 65% height |

## 5. Look catalog (35 identities)

The HyperFrames embedded-captions catalog defines 35 named looks. Each is engine-locked to its HyperFrames compiler (see the `ice-engines` skill, HyperFrames guide); in other engines treat a look as a design direction to rebuild, not a preset to call.

| Family | Looks | Surface |
|---|---|---|
| Classic embedded column flow | cream (warm poetic glow), ink (letterpress on bright surfaces), editorial (lowercase italic serif), keynote (confident centered), documentary (burn-in stillness), neon, glitch, chrome (liquid metal sheen), velocity (words arrive along motion vectors) | Words flow in a column inside the scene |
| Classic, body in front | loud (percussive type that competes with the face) | Body words in front of the subject |
| Rail plus one apex | anchor (quiet fade-up rail, apex settles behind the subject), ordnance (stamped rail, detonation apex), terminal (typed console, glyph-decode apex), neonsign (warm tube rail, hand-written neon apex), scoreboard (split-flap chyron), transit (LED departure strip), vhs (camcorder OSD), arcade (8-bit HUD), dossier (manila case file, rubber stamp), laser (beam-ignited words), thunder (rain-washed rail, bolt apex), hologram (projection plate), biolume (deep-sea glow), aurora (iridescent serif sheen), spectrum (oscilloscope band), papercut (stop-motion paper chips), popup (pop-up book), chalkboard (chalk band), graffiti (marker rail, spray tag apex), brush (washi band, sumi-e apex), inkwater (ink bleed rows), ransom (collage chips) | Verbatim rail or panel plus one apex |
| Other surfaces | stardust (accumulating poem, letters condense from dust), stomp (full-frame takeover cards with a void before the drop), lastpage (manuscript rail plus a blurred future field revealed by one rack focus) | |

Shortlisting:
- Must-read content (accessibility, tutorials, news): rail or panel looks: anchor, ordnance, terminal.
- "Embedded", "cinematic", "premium": the column-flow ten, chosen by register and scene luminance (bright scene: ink; warm dark: cream; fashion: editorial). Bright plus must-read: anchor.
- "Explosive", "VFX", "like After Effects": ordnance (a word explodes), stomp (the frame), terminal (a decode), loud (every beat).
- Named worlds map directly (console to terminal, neon signs to neonsign, poem or memory to stardust, reveal or prophecy to lastpage).
- Scene constraints veto last: luminance above 180 kills cream and screen-blend looks; dusk or dark unlocks neon and neonsign.
- Unsure: anchor. Exception: an explicit "embed in the scene" or "cinematic" request outranks the conservative default.
- Do not override a look's color, blend, shadow, filter or motion curves. A scene that fights the look gets a different look (bright: ink), never a recolor.

The classic looks share one hero three-act: dim the co-visible captions, enter the hero per letter with amplitude proportional to loudness, then breathe and glow.

## 6. Style rules that hold everywhere

1. The subject always wins. Occlude, don't hover (embedded captions sit behind the subject, not floating in front of the face).
2. Kill the constant lower third when the framing allows: close-up to an upper sidebar or crown, mid-shot to the back wall, wide to a lower third offset. (Rail looks keep their rail: this rule is for embedded and cinematic looks.)
3. One family, two weights maximum for captions. Mixing a sans, a script and a serif in one clip is the number one amateur tell.
4. Tracking tightens as size grows: display -0.015 to -0.035 em; body +0.005 to +0.015 em.
5. One hue plus neutrals (warm white, graphite, an accent sampled from the scene).
6. Never italicize for emphasis in captions (allowed: a literal quotation, a foreign word, thought versus spoken).
7. Commit to a style: one look for the whole video. Climax dwell at least 1 s.
8. The final caption clears before the video ends.
9. Every AI caption tool ships a preset picker; this skill directs: choose by content, scene and audience, and log the reason.

## 7. Conflicts and their scope

| Rule A | Rule B | Scope |
|---|---|---|
| Boxed captions with a thin light edge, hard swap, no pop | Bare karaoke with stroke, no pill, scale pop | Boxed: educational and mixed-background shorts where footage, black and white grounds alternate. Bare karaoke: hype and creator shorts over consistent footage |
| A hard white pill box is the last resort and banned on cinematic looks | Pills and cards as the default surface in talking-head ad cards and karaoke pills | Pills allowed in social, talking-head ad and podcast clip styles; banned in embedded, cinematic and art film captions |
| Never italicize for emphasis | Accent serif or italic serif chunk for soft words (boxed shorts, editorial looks, camera 3D editorial heroes) | Italic only as a declared look element (editorial, accent voice) used rarely; never as ad hoc emphasis inside a plain caption |
| Captions animate (karaoke, pop) | Plain whole-sentence subtitles with no animation | Animated: social shorts, reels, hype. Plain: documentary, long-form, explainers on platforms that require burned subtitles, broadcast |
| Hard cuts between cues | Fade-up in and out 150 to 250 ms | Hard cuts: explainer rails and boxed shorts. Fades: rail looks over live footage |
| Caption appears 2 frames before the word | Reaction text appears 2 to 3 frames after | Captions lead speech; reaction text (variety style) lags because it reacts |
