# Genre playbook: social short

Measured, not collected: 14 social shorts (brand accounts, creators and trend templates, 6 in Arabic) were measured with
this plugin's own tools and a transcript on 2026-10-31. Every number below is the corpus median and range, with how
many shorts hold it. A pattern in 60 percent or more of the shorts is a convention; 30 to 59 percent is an option;
under that it is not a rule. Read this file with the film type file; the type file decides structure, truth and
deliverables, this file gives the genre's measured grammar and the fingerprint the render is checked against.

## Scope

- Film type that points here: `social-short`. Use it for a vertical feed piece of 7 to 60 s built for Reels, TikTok,
  Shorts or Stories: a person talking to camera with graphics, a brand skit or mascot scene, a product or app short, a
  trend template, a show or episode promo.
- The edit type `shorts-reels` (the `ice-edit` skill) reads variant A below for pace, captions and the first second when
  it cuts a short from a speaker's footage; its own Rhythm row and pipeline stay in force.
- Not for: a 16:9 ad that is later cropped (compose each ratio, the type file's QA thresholds), a news reel (edit type
  `news-reel`, its own measured package), a UI film that is not made for a feed (`ui-motion.md`).
- Precedence: the user's words, a reference the film follows (its own measures win, `ice-remake`), and a chosen style
  outrank this file, through exemption rows lifting `genre:<key>` (the `ice-direction` skill, `references/treatment.md`
  section "Craft plan"). This file outranks the house defaults it names in "Rules this genre replaces". Founder
  decisions are never outranked: a short for an app, SaaS or product brand still shows the product doing its real job.

## Corpus

14 shorts, 7 to 132 s (median 34 s), 13 at 9:16 and one at 4:5: a voice AI product reel, two creator talking hooks (one
Arabic), a motion creator's spec ad, a UI reel, a gaming split screen, a meme template, a mascot skit, a SaaS explainer
short, an Egyptian delivery app game show clip, a music and football partnership skit, an Arabic creator show clip, an
Egyptian telecom product short and an Arabic news programme promo. Sources and why each was chosen are kept in the
maintainers' research folder (`research/genre-playbooks/social-short/corpus/SOURCES.md`, outside this repo). Two
variants showed up; pick one at 02 from what the short is made of:

| Variant | Shorts | What marks it |
|---|---|---|
| A. People on camera | 8 (a face half the runtime or more, or a talking hook) | a face 82 percent of the runtime (27 to 100), first word by 0.9 s in 8 of 8 (median 0.01), counted shot 1.23 s (0.83 to 23.3; one long take in 2), captions on in 6 of 8, pixel scene median 1.04 s, ends on content in 4 of 8 and on a card in 4 |
| B. Designed, no people | 6 (UI motion, mascot, meme, product graphics) | no face (0 to 5 percent), morph or match transitions dominant in the 4 motion shorts, counted shot 2.29 s (1.5 to 5.0), no word captions (headlines or meme text only), a logo or CTA card closes 4 of 6, 7 to 87 s (median 20) |

## Conventions (60 percent or more)

| Convention | Number (median, range) | Held | How it is measured |
|---|---|---|---|
| The first second already speaks or reads | first spoken word 0.01 s (0 to 0.88) in voiced shorts; first readable text 0.12 s (0 to 4.8); the earlier of the two by 1.5 s | first word by 1.0 s 12 of 12 voiced; text by 1.0 s 10 of 14, by 3.0 s 13 of 14; either by 1.5 s 14 of 14 | transcript; coding sheet `social.hook_1s` |
| Something moves in the first 0.5 s; the first 3 s are busy | 6.5 visual events in the first 3 s (3 to 9) | moves by 0.5 s 13 of 14; 4 or more events 13 of 14 | coding sheet; `genre_check.py` hook events |
| Something new about every 0.4 s | median gap between visual events 0.42 s (0.33 to 0.96); 1.68 events per s (0.64 to 2.74) | gap 0.5 s or less 12 of 14; 1.0 events per s or more 13 of 14 | `genre_check.py measure` events |
| No long dead stretch | longest gap without an event 1.62 s (0.5 to 9.75) | 4.5 s or less 11 of 14; 7.5 s or less 13 of 14 | same |
| Whole-frame change | pixel scene median 1.5 s (0.75 to 4.0) | 0.7 to 4.2 s 14 of 14; 2.5 s or less 12 of 14 | `genre_check.py` scene changes |
| A voice carries most shorts | a voice over a quarter of the runtime, median 0.56 of it (0 to 0.98) | 12 of 14 | transcript |
| Voiced shorts put the words on screen | captions, supers or headlines that repeat the speech | 8 of 12 voiced (7 of 8 captioned voiced shorts repeat the voice) | coding sheet `social.captions` |
| Captions are short cues | word or phrase captions 2.5 words per cue (1 to 4) | 4 or fewer 6 of 6; 3 or fewer 5 of 6 | coding sheet `captions.words_per_cue_median` |
| Captions sit in the lower half, clear of the bottom band | caption centre at 68 percent of the height (22 to 88) | lower half 5 of 6; inside the bottom 20 percent 1 of 6; key text out of the bottom 20 percent 10 of 14, out of the right 15 percent 11 of 14 | coding sheet `captions.y_center_share`, `social.safe_zone` |
| Caption letters | cap height 3 percent of the frame height (2 to 4.5), bold in 7 of 9, sentence case in 9 of 9, a shadow, box or plate in 6 of 9 | 9 of 9 at 2 to 4.5 percent | coding sheet `captions` |
| Arabic shorts are laid out right to left, short cues | captions 1 to 3 words per cue in the 4 captioned Arabic shorts | right to left 5 of 5 Arabic shorts | coding sheet `social.rtl`, `captions` |
| A music bed or track under everything | | 14 of 14 | `sound_map.py`; coding sheet `social.music` |
| Social loudness | -14.4 LUFS (-26.5 to -14.1); creator and Instagram posts sit at -14, some brand uploads quieter | -15 to -13 in 9 of 14 | `sound_map.py` |
| The payoff lands before any CTA | payoff before the CTA | 5 of 6 shorts with both | coding sheet `social.payoff_s`, `social.cta` |
| Length | 34 s (7 to 132); 60 s or less | 11 of 14 | duration |
| Vertical | 9:16 | 13 of 14 (one 4:5 product reel) | |

## Options (30 to 59 percent; the variant and the brief decide)

- A face half the runtime or more (7 of 14; variant A only) and in the first second (7 of 14).
- A CTA (6 of 14): follow, link or order; it sits anywhere from the first second to the last (in the last 20 percent only
  2 of 14). A logo or CTA card closes 8 of 14 (2 to 6 s in 6 of 8, median 4.3 s); ending on content with no card closes 6
  of 14 (variant A 4 of 8). Choose from the brief: a brand account that needs the name at the end uses the card; a
  creator or trend post ends on the punchline.
- The brand can be told within 3 s (8 of 14); a brand shown first at 24 s happens in a game show clip.
- Counted shots of 2 s or less (7 of 14; variant A 5 of 8 at 1.5 s or less); 3.3 shots per 10 s or more 9 of 14.
- An accent colour in captions: either on most cues (3 of 6, a yellow word in each Arabic cue or a karaoke box) or on
  none (3 of 6).
- Hook device: a face acting or speaking in the first second (7 of 14), a curiosity gap or a relatable situation (5 of
  14), direct address (4 of 14).
- Overlays popped over the picture (6 of 14), creator grammar (native or a brand using it, 8 of 14).
- Payoff in the first half (5 of 13) or in the last 30 percent (5 of 13): the payoff place follows the idea, not a slot.
- Hard cuts 60 percent or more of transitions (6 of 12): the people variant cuts hard, the designed variant morphs.
- Tempo of the music 85 to 125 BPM folded (5 of 14; median 131, 85 to 162).

## Measured and rejected

House rules or common beliefs the corpus did not confirm. They are not rules of this genre; a film may still use them
when its idea needs them.

| Idea | Measured |
|---|---|
| A question works better than a statement as a hook | 0 of 14 shorts open on a question; curiosity gaps, a face acting and direct address carry the hooks |
| Colour on 25 to 45 percent of caption cues in colour-coded social styles | 0 of 6 captioned shorts: the accent is on nearly every cue (0.57 to 1.0) or on none |
| The payoff in the 22 to 27 s of a 30 s reel (73 to 90 percent of the runtime) | 3 of 13; the payoff sits from 4 to 95 percent (median 61) |
| The CTA closes the short (the 27 to 30 s calm CTA) | a CTA in 6 of 14, in the last 20 percent in 2 of 14 |
| 5 to 7 scenes per 10 to 15 s | 6 of 14 at 3.3 to 7 counted shots per 10 s; median 5.0 (0.4 to 10.5): a long take with graphics is as common as a fast cut |
| No gap between visual events over 2.5 s | 8 of 14; 4.5 s holds 11 of 14 |
| Captions in the bottom band | 1 of 6 (a gaming split screen); the rest sit at 50 to 72 percent of the height |
| Caption cap height 3.5 to 5 percent of the frame height | 1 of 9 captioned shorts; median 3 percent (2 to 4.5) |
| Seamless replay loop (last frame like the first) | 2 of 14 |
| Sounds placed on the moves (move_onset_lift 1.2 or more) | 1 of 14 (median 1.06): the music and the voice carry the sound, not effects on each move |
| Punch-ins or jump cuts in every talking short | 1 of 7 coded (one Arabic creator short cuts every 1 to 3 s but was not counted); not confirmed either way |

## Coding sheet

What pixels cannot read is coded by a fresh reviewer (never the builder) from 8 to 12 fps strips of the render
(`ice-remake/scripts/clip_strip.py`; always one strip for 0 to 3 s and one for the last 3 s), into
`ice/review/genre-coding.json`, with the same fields the corpus was coded with, under one key `social`:

- `hook_1s`: `first_text_s` (the first frame with readable text), `first_face_s`, `first_word_s` (listen; the first
  spoken word), `motion_in_first_0_5s`.
- `captions`: `kind` (word-captions, phrase-captions, headline-only, meme-top-text, supers, none),
  `words_per_cue_median` (words visible together in one cue), `y_center_share` (vertical centre of the caption block,
  0 top, 1 bottom), `highlight_share`, `text_height_share` (cap height over frame height), `follows_voice`.
- `face`: `share_of_runtime`. `voice`: `share_of_runtime`.
- `loop`: `ending` (seamless-loop, hard-stop, end-card, cta-card, cliffhanger). `cta`: `present`, `at_s`.
- `safe_zone`: `text_in_bottom_20pct`, `text_in_top_10pct`, `text_in_right_15pct`.
- `payoff_s`, `shots_counted`, `shot_median_s`.

## Fingerprint

`genre_check.py check --genre social-short --video <render> --coding ice/review/genre-coding.json` (the `ice-qa`
skill) runs at gate D on every draft of a short of this genre that follows no reference, and its numbers go into the
delivery report. A red key is fixed in the short (an earlier first word or line, more happening in a long gap, shorter
caption cues), never by padding with idle motion; a key the user, a reference or the chosen style sets differently is
lifted by its exemption row and passed as `--exempt <key>=<source>`. Keys marked `-` are reported for the critic, not
gated.

Calibration: only keys that 13 or more of the 14 corpus shorts hold are gated, at bounds that cover the corpus, and one
gated key may miss (`misses_allowed 1`, printed yellow with a sentence in the delivery report). `social_hook_word_s` is
the earlier of the first spoken word and the first readable text; `social_cue_words` is the words per cue of word or
phrase captions (0 when the short has none, so an uncaptioned designed short passes). On its own corpus the line passes
13 of 14 shorts; the one it flags is the telecom product short with three long shots and 0.64 events per second.

Genre fingerprint: events_per_s >=1.0; median_event_gap_s <=0.6; max_event_gap_s <=7.5; scene_median_s 0.4-4.2; hook_events_3s >=3; social_hook_word_s <=1.5; social_cue_words <=4; misses_allowed 1; cuts_per_10s -; sfx_per_min -; move_onset_lift -; end_bg_std -; social_face_share -; social_caption_y -; social_ending -; social_cta -; social_voice_share -.

## Rules this genre replaces

Each general rule stays the house default for every other film; its own file names this genre as the exception.

| General rule | Where | In this genre |
|---|---|---|
| Colour on 25 to 45 percent of chunks in colour-coded social styles | `ice-type/references/captions-system.md` section 6 | the accent sits on nearly every cue or on none (0 of 6 in the band) |
| Logo plus CTA stacked in the centre only when the brief asks | `openers-and-endings.md` section 6 | a logo or CTA card closes 8 of 14 shorts (2 to 6 s); ending on the punchline closes 6 of 14; the variant and the account decide |
| A unit past about 2.5 s gets a pattern interrupt (Rhythm row max_event_gap_s 2.5) | `film-types/social-short.md` Rhythm ranges | the longest gap is 1.62 s at the median and 4.5 s or less in 11 of 14; the row gates at 4.5 with the holds excuse |
| Caption cap height 3.5 to 5 percent of the frame height | `ice-type/references/sizes-and-scale.md` section 5 | cap height 3 percent at the median (2 to 4.5), 1 of 9 captioned shorts at 3.5 or more; bold with a shadow, box or plate keeps it legible |
| A question hook works better than a statement (content promo) | `film-types/social-short.md` Structure options | no measured short opened on a question; it stays an option of the promo row |

Sources: measured on the corpus above with `ice-remake/scripts/analyze.py` and `clip_strip.py`,
`ice-audio/scripts/sound_map.py`, `ice-qa/scripts/film_gate.py` and `genre_check.py`, a faster-whisper transcript, and
coded with the coding sheet above.
