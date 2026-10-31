# Genre playbook: news reel

Measured, not collected: 14 news reels from 9 newsrooms (Al Jazeera Arabic and English, AJ+, AJ+ Arabic, BBC News,
Reuters, Vox, The New York Times, Asharq News, Sky News Arabia, Al Arabiya; 7 in Arabic) were measured with this
plugin's own tools and a transcript on 2026-10-31. Every number below is the corpus median and range, with how many
reels hold it. A pattern in 60 percent or more of the reels is a convention; 30 to 59 percent is an option; under that
it is not a rule. Read this file with the `ice-edit` skill's edit type `news-reel` (`references/edit-types/news-reel.md`)
and the style family `ice-styles/references/family-broadcast-news.md`: the edit type decides the pipeline, truth and
archive rules, the style family holds the measured programme packages, this file gives the genre's measured grammar
across newsrooms and the fingerprint the render is checked against.

## Scope

- Route that points here: the edit type `news-reel` (the `ice-edit` skill). Use it for a short news or explainer-news
  reel of 30 to 140 s, vertical or horizontal, where a voice or on-screen words carry facts over a presenter, news
  footage, maps or data: a programme promo, a breaking story, a wire explainer, a human story, an interview clip.
- The style family `family-broadcast-news.md` gives the skin of the three measured programme packages (variant A
  below); a package's numbers win over this file's medians when the user follows that package or a reference of it.
- Not for: a narrated explainer with no news footage and no presenter (the `ice-explainer` skill, `genres/explainer.md`),
  a creator's talking short (`genres/social-short.md`), a data story built only from charts (film type `data-story`).
- Precedence: the user's words, a reference the reel follows (its own measures win, `ice-remake`; lesson L9), and a
  chosen programme package outrank this file, through exemption rows lifting `genre:<key>` (the `ice-direction` skill,
  `references/treatment.md` section "Craft plan"). This file outranks the house defaults it names in "Rules this genre
  replaces". The truth rules never yield: spoken words on screen verbatim, numbers from the truth sheet, a claim keeps
  its owner, archive keeps its date (edit type `news-reel` section 5).

## Corpus

14 reels, 45 to 193 s (median 81 s), 12 at 9:16 and 2 at 16:9: two Al Jazeera Arabic programme promos (Scenarios,
Mohawalat Fahm), the Mohawalat Fahm horizontal promo and the Al Jazeera English presenter explainer (the four reels the
founder gave as references, already broken down frame by frame), a BBC breaking short, a Reuters explainer, a Vox
explainer, a New York Times reporter short, an AJ+ captioned story, an AJ+ Arabic human story, an Asharq News update,
a Sky News Arabia interview clip, an Al Arabiya list explainer and a BBC horizontal explainer. Sources and why each was
chosen are kept in the maintainers' research folder (`research/genre-playbooks/news-reel/corpus/SOURCES.md`, outside
this repo). Three variants showed up; pick one at 02 from what the footage is:

| Variant | Reels | What marks it |
|---|---|---|
| A. Presenter or reporter on camera | 9 (the 4 programme reels, Reuters, NYT, AJ+ Arabic, Sky News Arabia, BBC 16:9) | the presenter or reporter on screen 54 percent of the runtime (43 to 79; 60 or more only in the 3 Al Jazeera Arabic programme reels and Reuters), counted shot 2.6 s (0.4 to 23.3), captions of the voice in 6 of 9 and keyword supers in the 2 Arabic programme promos, a card closes 5 of 9 |
| B. Footage under a voice | 2 (BBC, Vox) | a reporter or narrator voice over 92 to 99 percent of the runtime, news footage 52 to 64 percent, the reporter seen in short stand-ups (29 to 36 percent), sentence captions with the spoken word marked on every cue, a headline from frame 0 |
| C. Captioned footage, no narrator | 3 (AJ+, Asharq, Al Arabiya) | footage 76 to 81 percent, the story told in headline cards of 5 to 10 words over it, soundbites or music only, 1 to 5 source labels, a card closes 2 of 3 |

## Conventions (60 percent or more)

| Convention | Number (median, range) | Held | How it is measured |
|---|---|---|---|
| Something new on screen about every third of a second | median event gap 0.33 s (0.33 to 0.58); 2.23 events per s (1.12 to 2.98) | 14/14 at 0.6 s or less; 14/14 at 1.0 per s or more | `genre_check.py measure` |
| No long dead stretch in the body | longest event gap before the end card 3.0 s (0.6 to 4.6) | 4.0 s or less 13/14; 5.0 s or less 14/14 | events up to the coded `end_card.start_s` |
| Busy first 3 s | 6.5 events (4 to 9) | 3 or more 14/14 | `hook_events_3s` |
| Whole-frame change | pixel scene median 1.5 s (0.9 to 3.8) | 3.0 s or less 13/14 | `scene_median_s` |
| Counted shots | 2.7 s at the median (0.4 to 23.3) | 2 to 6 s 11/14 | coding sheet |
| The first concrete fact early | a number, a named place, person or organisation, or a dated event at 2.4 s (0 to 20.7) | by 15 s 13/14; by 5 s 12/14; by 3 s 8/14 | coding sheet, `news.first_fact_s` |
| Voiced reels speak from the first second | first word 0.0 s (0 to 1.7) | within 1.0 s 10/11; within 0.5 s 9/11 | transcript, then the coder |
| No headline ahead of the voice | | 11/11 voiced reels | a headline at the open is said at once |
| The words are on screen | captions, keyword supers or headline cards | 13/14 | coding sheet |
| Captions repeat the voice word for word | | 10/10 voiced captioned reels, Arabic included | coding sheet |
| Caption cues short | 5 words per cue (2.5 to 10) | 8 or fewer 10/13; 6 or fewer 9/13 | coding sheet |
| Captions in the lower middle | centre at 0.69 of the height (0.56 to 0.88) | 0.5 to 0.85: 12/13; clear of the bottom 20 percent 12/13 | coding sheet |
| Small caption letters with a legibility aid | cap height 2.1 percent of the frame height (1.5 to 4.2); a box, shadow, plate or gradient | 2 to 4.5 percent 8/13; an aid 11/13 | measured on full-size frames |
| Attribution on screen | lower thirds 1.5 (0 to 8), source labels 1 (0 to 11) | a lower third or a source label 11/14; a person who speaks on screen gets a strap 7/7 | coding sheet |
| A voice carries the reel | voice 80 percent of the runtime (0 to 100) | half or more 11/14 | transcript and coder |
| The carrying voice's speaker is seen | 51 percent of the runtime (0 to 100) | a quarter or more 11/14 | coding sheet |
| Real footage in the reel | footage and archive 23 percent (0 to 81) | 10 percent or more 10/14 | coding sheet |
| A channel or programme mark from the start | logo bug on screen through the body | 12/14; told by 3 s 12/14 | coding sheet |
| No jump cut inside a presenter's talk | | 7/9 presenter reels (the two that cut are an interview clip and a field story) | coding sheet |
| A branded close | a logo sting or a card | 9/14 | coding sheet |
| Music under the reel | a bed under all of it, staying under the last line (`ice-audio/references/mix-and-master.md` section 5, news reel item 8) | 9/14; somewhere 11/14 | coding sheet and `sound_map.py` |
| Western digits, right to left Arabic, no text over a face | | 11/11 with numbers; 7/7 Arabic; 13/14 | coding sheet |
| Vertical 9:16 | | 12/14 | |

## Options (30 to 59 percent; the variant and the brief decide)

A designed end card after the last word (8 of 14: the 4 Al Jazeera programme reels, Vox, Asharq, Al Arabiya, BBC 16:9;
3.5 to 21 s, median 5.6 s) or ending on the last shot (5 of 14: BBC, Reuters, AJ+, AJ+ Arabic, Sky News Arabia) or a
0.8 s logo sting (NYT); a headline on screen from the first second, said by the voice at once (7 of 14); running
captions of the voice (8 of 14) against keyword supers (2) or headline cards (3); caption cues of 4 words or fewer
(6 of 13); a first fact by 1.5 s (6 of 14); real footage a third of the runtime or more (5 of 14); source labels
(8 of 14); a quote on screen (6 of 14); length 36 to 78 s (6 of 14; 120 s or less 12 of 14); the presenter 60 percent
of the runtime or more (4 of 9 presenter reels); a map or a data callout (6 of 14).

## Measured and rejected

| Hypothesis | Held | Note |
|---|---|---|
| The presenter on screen 75 to 87 percent of the programme time | 2/14 | true of the Al Jazeera Arabic programme packages only; 47 percent at the median |
| The longest event gap 3 s or less | 7/14 (body) | the body gap is 3.0 s at the median; 4.0 s holds 13 of 14 |
| A designed end card closes every news reel (6 of 6) | 8/14 | the programme packages close on a card; newsroom shorts often end on the last shot |
| Length 36 to 78 s | 6/14 | 81 s at the median; promo reels are the short end |
| Caption letters at least 4.5 percent of the frame height in font size (a cap height of about 3 percent) | 2/13 | cap height 2.1 percent at the median; the newsrooms keep captions small with a box or shadow |
| Arabic captions of 5 to 7 words | 0/3 | Arabic running captions run 3 to 4 words per cue |
| Arabic on-screen text complements the voice, never word for word | 0/5 | every voiced Arabic reel shows the spoken words verbatim |
| Sentence captions centred at about 81.5 percent of the height | 5/8 | measured on one English package; across newsrooms the centre is 0.69 |
| Mix at -16 LUFS +/-1 | 2/14 | uploads measure -19.6 LUFS at the median (-27 to -10.6); a delivery profile, not a style: the house row stays |
| Sounds placed on the moves (lift 1.2 or more) | 1/14 | median lift 1.08 |
| A map in a news reel | 3/14 | rare even in the map series measured (an interview clip) |
| A data callout | 4/14 | |
| A progress bar | 1/14 | the Al Jazeera English package only |
| Graphics as the main picture a quarter of the runtime | 0/14 | no graphics-led explainer in the corpus; such a reel reads `genres/explainer.md` |

## Coding sheet

A fresh reviewer, never the builder, codes the render from its 10-frame strips every 3 s
(`ice-remake/scripts/clip_strip.py`; always one strip for 0 to 3 s and one for the last 3 s) and the fresh transcript,
into `ice/review/genre-coding.json`, with the same fields the corpus was coded with. The shared field
`end_card.start_s` (the first frame of the closing card or sting; empty when the reel ends on its last shot) stops the
event gaps. Under one key `news`:

- `variant` (presenter-led, footage-voiceover, captioned-footage, graphic-explainer), `story_kind`, `carrier`.
- `first_fact_s`: the first moment a concrete fact is said or shown (a number with its unit, a named place, a named
  person or organisation, a dated event); a greeting, a question or the programme name is not a fact; a cover frame
  shorter than 0.5 s does not count. `first_fact_what`.
- `headline`: `present`, `first_s`, `kind`, `words`. `quotes_on_screen`.
- `lower_thirds`: `count`, `first_s`, `kinds`, `position`. `source_labels`: `count`, `kinds`.
- `maps`: `count`, `kind`. `data_callouts`: `count`, `kinds`.
- `material_share`: `presenter`, `interviewee_or_soundbite`, `footage`, `archive_or_ugc`, `graphics`, `end_card`
  (shares of the runtime, sum about 1). `speaker_on_screen_share`.
- `captions`: `kind` (full-sentence, phrase, keyword-supers, headline-cards, none), `words_per_cue_median`,
  `y_center_share` (0 top, 1 bottom), `position`, `colour`, `legibility_aid`, `text_height_share` (cap height, or alef
  height in Arabic, over the frame height), `follows_voice`, `highlight_share`.
- `logo`: `bug_on_screen`, `bug_position`, `first_s`. `progress_bar`. `music` (bed-under-all, bed-in-parts, none).
- `ending`: `kind` (logo-sting, end-card, tune-in-card, cta-card, content), `start_s`, `length_s`.
- `digits` (western, arabic-indic, mixed, none), `text_over_face`, `jump_cuts_in_talk`.

## Fingerprint

`genre_check.py check --genre news-reel --video <render> --coding ice/review/genre-coding.json` (the `ice-qa` skill)
runs at gate D on every draft of a news reel that follows no reference, and its numbers go into the delivery report. A
reel that follows a reference runs it with `--reference-measures` and `--reference-coding` (lesson L48). A red key is
fixed in the reel (more happening in a long gap, the first fact earlier in the hook, the spoken words on screen), never
by padding with idle motion; a key the user, a reference or the chosen package sets differently is lifted by its
exemption row and passed as `--exempt <key>=<source>`. Keys marked `-` are reported for the critic, not gated.

Calibration: only keys that 13 or more of the 14 corpus reels hold are gated, at bounds that cover them: the pixel keys
hold in 14 of 14, `news_first_fact_s` in 13 of 14 at 15 s (12 of 14 at 10 s) and `news_words_on_screen` in 13 of 14;
the two coding keys are gated because a news reel that hides its facts fails its job. One gated key may miss
(`misses_allowed 1`, printed yellow with a sentence in the delivery report). `max_event_gap_s` stops at the coding
sheet's `end_card.start_s`. On its own corpus the line passes 14 of 14 reels (8 green, 6 yellow): the Mohawalat Fahm
horizontal promo (first fact at 20.7 s) and the BBC 16:9 explainer (no captions) use their allowed miss.

Genre fingerprint: events_per_s >=1.0; median_event_gap_s <=0.7; max_event_gap_s <=5.0; scene_median_s 0.8-4.2; hook_events_3s >=3; news_first_fact_s <=15; news_words_on_screen true; misses_allowed 1; cuts_per_10s -; sfx_per_min -; move_onset_lift -; news_variant -; news_presenter_share -; news_footage_share -; news_caption_words -; news_caption_y -; news_attribution -; news_ending -.

## Rules this genre replaces

Each general rule stays the house default (or the measured package value) where it is written; its own file names this
genre as the exception.

| General rule | Where | In this genre |
|---|---|---|
| Presenter on screen 75 to 87 percent of the programme time | edit type `news-reel` section 3, Rhythm | the Al Jazeera Arabic package value; across newsrooms 47 percent at the median, 40 percent or more in 9 of 14; footage-led reels have no presenter |
| The reel ends on a designed end card (6 of 6) | `family-broadcast-news.md` section 1.1 item 9; `openers-and-endings.md` section 6 | a branded close 9 of 14, a designed card 8 of 14, the last shot 5 of 14 |
| Length 36 to 78 s for a promo reel | edit type `news-reel` section 3 | 45 to 193 s, median 81 s, 120 s or less 12 of 14 |
| A presenter take is required; a news reference without one asks for presenter footage | `ice-motion-director/references/classify.md` | 5 of 14 reels have no presenter: when the followed reference itself shows no presenter, footage under a voice (B) and captioned footage (C) run the same edit type with this file's variant and no presenter footage is asked for; a reference with a presenter or anchor on screen keeps the house rule |
| Captions at least 4.5 percent of the frame height in font size (a cap height of about 3 percent) | `ice-type/SKILL.md` section 2 | cap height 2.1 percent at the median (1.5 to 4.2), 3 percent or more in 2 of 13, always with a box, shadow or plate; the house floor stays the default, a reel that follows a reference may match it |
| Arabic captions of about 5 to 7 words; on-screen text complements the voice | `ice-arabic/references/arabic-captions.md` section 3 | Arabic news captions run 3 to 4 words per cue and repeat the voice verbatim (5 of 5) |
| News sentence captions centred at about 81.5 percent of the height | `ice-type/references/caption-styles.md` section 4 | the English package's value; across newsrooms the centre is 0.69 (0.56 to 0.88) |

Sources: measured on the corpus above with `ice-remake/scripts/analyze.py` and `clip_strip.py`,
`ice-audio/scripts/sound_map.py`, `ice-qa/scripts/film_gate.py` and `genre_check.py`, a faster-whisper transcript, and
coded with the coding sheet above; the four Al Jazeera reels also with the frame studies behind `family-broadcast-news.md`.
