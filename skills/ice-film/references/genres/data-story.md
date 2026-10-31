# Genre playbook: data story

Measured, not collected: 15 chart-led motion videos (newsroom chart stories, a newsroom data unit's reports, a
statistics publisher's chart race, annual report and budget highlights; 4 in Arabic) were measured with this plugin's
own tools on 2026-10-31. Every number below is the corpus median and range, with how many films hold it. A pattern in
60 percent or more of the films is a convention; 30 to 59 percent is an option; under that it is not a rule. Read this
file with the film type `film-types/data-story.md`: the type file decides truth, sourcing and the structure options,
this file gives the genre's measured grammar and the fingerprint the render is checked against.

## Scope

- Routes that point here: the `ice-film` film type `data-story` (a stat, a chart, a milestone, a report, numbers lead),
  and the `ice-explainer` skill when a narrated film's picture is led by charts and figures (variant A below: the
  explainer pipeline and voice timing stay; the chart grammar and this fingerprint come from this file). Films of about
  45 s to 3 min.
- Not for: a narrated explainer whose picture is mostly illustration, figures or footage with a chart now and then
  (`genres/explainer.md`), a news reel cut from footage (edit type `news-reel`), a single hero stat or chart loop under
  about 15 s (the type file's Hero stat and Chart loop options: this corpus has no film that short).
- Precedence: the user's words, a reference the film follows (its own measures win, `ice-remake`), and a chosen style
  outrank this file, through exemption rows lifting `genre:<key>` (the `ice-direction` skill, `references/treatment.md`
  section "Craft plan"). This file outranks the house defaults it names in "Rules this genre replaces". The truth rules
  of the type file (approved figures only, no source no clip, labelled sample data) are never lifted by a measure here.

## Corpus

15 films, 47 s to 2 min 59 s (median 98 s): Financial Times, Vox (2), Bloomberg, The Wall Street Journal, BBC
Newsnight, Visual Capitalist, Statista, AJ+ (2), Al Jazeera Arabic and its data unit (2), an agency's annual report
highlights for APICORP, an Omani budget video graphic and an Arabic economics infographic. All 16:9. Sources and why
each was chosen are kept in the maintainers' research folder (`research/genre-playbooks/data-story/corpus/SOURCES.md`,
outside this repo). Two variants showed up and are measured apart where they differ:

| Variant | Films | What marks it |
|---|---|---|
| A. Voiced chart story | 8 (FT, Vox y-axis, Bloomberg, WSJ, BBC Newsnight, Visual Capitalist, Al Jazeera x2) | a voice or presenter walks through a few charts: voice on 95 percent of the runtime; 150 s (68 to 179); a chart on screen 45 percent of the runtime; a finished chart holds 4.8 s at the median; real footage or a presenter around the charts (34 percent of the runtime); the first chart or figure at 9.9 s |
| B. Silent figure stream | 7 (Vox Game of Thrones colour, Statista race, AJ+ x2, APICORP, Oman budget, the Arabic infographic) | no voice; display text and a music bed carry it: text on 85 percent of the runtime, up to 13 display words at once (5 to 17); 5 hero numbers per film (0 to 9), each readable 4.6 s; 72 s (47 to 121); mostly drawn (real material 0 percent at the median); the first figure at 6.8 s |

Pick the variant at 02: a voiceover or presenter in the brief, an argument that needs a sentence per chart, or an
`ice-explainer` route leans A; a highlights reel, a report or budget in numbers, a social "by the numbers" or a chart
race leans B. Log the choice in `ice/DIRECTION.md`.

## Conventions (60 percent or more)

| Convention | Number (median, range) | Held | How it is measured |
|---|---|---|---|
| Data is on screen most of the film | a chart or a hero number on screen 58 percent of the runtime (23 to 100); charts or hero numbers are the hero of 65 percent of the counted scenes (14 to 100) | 40 percent of the runtime or more: 12 of 15; half the scenes: 12 of 15 | coding sheet `data.charts`, `data.hero_numbers`, `scenes` |
| Data comes early | the first chart or readable figure at 6.8 s (0 to 20.5); a figure readable by 20 s | by 25 s: 15 of 15; figure by 20 s: 11 of 15 | coding sheet `first_number_s`, `first_chart_s` |
| A figure rests readable | a hero number readable 4.6 s at the film median (0.95 to 7.7); 56 of 63 hero numbers 2 s or more; the shortest 0.9 s | 2 s or more: 9 of 11 films with hero numbers; 0.5 s or more: 11 of 11 | coding sheet `hero_numbers` start to end (a count is readable from the frame it lands) |
| A finished chart holds before the next change | 3.2 s at the film median (1.25 to 44.8); 3.05 s over 64 charts, 45 of 64 hold 2 s or more | 2 s or more: 12 of 14 films with charts | coding sheet `charts.hold_s` |
| Data draws fast | a chart's data draws in 1.05 s at the median (64 charts; 3 s or less: 50 of 64); film median 2.45 s | 3 s or less: 9 of 14 films | coding sheet `charts.draw_s` |
| Few figures at once | at most 2 figures readable together at the median (0 to 7) | 8 or fewer: 15 of 15; 4 or fewer: 12 of 15 | coding sheet `numbers_per_scene.max` |
| A hero number says what it counts | 50 of 66 hero numbers carry a label | most numbers labelled: 8 of 12 films | coding sheet `hero_numbers.with_label` |
| Structure first | the frame (axes, gridlines, baseline, outline) appears before the data in 23 of 34 framed charts; label before the data 13, after 13 | frame first in most framed charts: 7 of 11 films | coding sheet `charts.build_order` |
| The camera stays still while a chart is read | 55 of 64 charts locked; a push or a pan along a line in 5 | most charts locked: 12 of 14 | coding sheet `charts.camera` |
| The point is marked on the chart | an arrow, callout, shaded period, reference line or circle on 17 of 64 charts | at least once: 11 of 15 | coding sheet `annotations` |
| Few hard cuts | 0.55 per 10 s (0 to 2.08) | 1.0 or fewer: 13 of 15; 2.5 or fewer: 15 of 15 | `genre_check.py` cuts |
| Something small keeps arriving | 0.93 visual events per s (0.17 to 2.73); median gap 0.5 s (0.33 to 5.42) | 0.7 per s or more: 13 of 15; gap 0.9 s or less: 11 of 15 | `genre_check.py` events |
| A held chart may run long | the longest gap without an event 7.4 s (0.83 to 16.25) | 12 s or less: 9 of 15; 17 s or less: 15 of 15 | same |
| A busy first 3 s | 4 visual events (1 to 8) | 3 or more: 14 of 15 | same |
| Display text runs most of the film, short | display text on 75 percent of the runtime (25 to 100); at most 8 words readable at once at the median (2 to 17) | half the runtime: 11 of 15; 12 words or fewer: 11 of 15 | coding sheet |
| A music bed under the whole film | | 11 of 15 (the 4 without are newsroom voice pieces: FT, Bloomberg, WSJ, BBC) | `sound_map.py`, coding sheet |
| The voice, when there is one, runs nearly all the film and fast | voice on 95 percent of the runtime (79 to 98); English 188 words per minute (105 to 204); Arabic 115 and 133 | 85 percent or more: 7 of 8 voiced films; English 160 or more: 5 of 6 | transcript, first to last word |
| Real footage or photos around the data | 25 percent of the runtime (0 to 100) | a fifth or more: 9 of 15 | coding sheet `real_material_share` |
| Two or more hero numbers | 3 per film (0 to 15) | 9 of 15 | coding sheet |
| Close on a logo or a call to action | logo with a call to action 7, logo only 2, the last chart 5, a summary number 1 | 9 of 15 | coding sheet `close` |
| Length | 98 s (47 to 179) | 45 to 180 s: 15 of 15 | duration |

## Options (30 to 59 percent; the variant decides)

| Option | Held | Variant A | Variant B | Use when |
|---|---|---|---|---|
| A count-up or odometer on hero numbers (33 counts: 1.1 s at the median, 0.6 to 2.0; the label already on screen in 23 of 33) | 5 of 15 | 3 of 8 (Visual Capitalist, Al Jazeera x2) | 2 of 7 | a figure the viewer should feel grow; every count in a film the same length |
| A source line on screen with every chart or most | 7 of 14 films with charts (a source anywhere: 8 of 15) | 5 of 8 | 2 of 6 | always for real data in an Ice film (type file truth rules) |
| The unit on screen with every chart or most | 8 of 14 | 5 of 8 | 3 of 6 | always when the axis or label could be misread |
| Direct value labels on most charts (no legend) | 8 of 14; a legend on some charts 4 of 14 | | | the default; a legend only for 3 or more series |
| A value axis from zero on most charts | 5 of 9 with a value axis | | | bars always; a line may start elsewhere when the axis says so (Vox's y-axis film argues it) |
| The conclusion stated over the chart (title or the line spoken over it) | some or most charts: 6 of 14; most: 3 of 14 | | | the type file's one point per chart; in variant A the voice states it |
| Four or more charts | 6 of 15 | 4 of 8 | 2 of 7 | an argument in steps; otherwise 1 to 3 charts (8 of 15) |
| One accent on grey, or two colours compared | 6 of 15 (one accent 2, two colours 4; a category palette 3; no highlight colour 6) | | | one series is the point |
| A chart morphs into the next or is added to | 15 of 64 charts; most chart changes in 1 of 10 films | | | the same metric continues (a new year, a new unit) |
| A presenter on camera a fifth of the runtime or more | 4 of 15 | 4 of 8 | 0 of 7 | a newsroom piece with its own presenter |

## Measured and rejected

House rules or common beliefs measured on this genre that did not hold. They stay where their own file scopes them; for
this genre they are replaced by the numbers above. Do not add them back from memory.

| Rule | Measured |
|---|---|
| Count-ups decelerate over about 1.2 to 1.6 s | 0 of 5 counting films by their median count (1.0 s); 11 of 33 counts; counts run 0.6 to 2.0 s, median 1.1 |
| The label arrives after the number lands (value, then meaning) | 2 of 5 counting films; 10 of 33 counts; the label is usually on screen first or with the count |
| Staged builds of 0.5 to 1.3 s per stage | 4 of 14 films by their median draw; 30 of 64 charts; the data draws in 1.05 s at the median and 3 s or less in 50 of 64 |
| The chart title states the conclusion on every chart | 3 of 14 films; titles name the topic and the voice or a caption states the point |
| A source line on every chart | 7 of 14 films with charts (5 of 8 voiced films, 2 of 6 silent ones); Ice keeps it for truth, see Options |
| One chart morphs into the next; nothing pops | 1 of 10 films morph most chart changes; 23 of 64 charts arrive on a cut and 26 as a new build |
| A sound placed on every move; a soft tick while counting | sounds land on visual events no more often than chance in 13 of 15 films (`move_onset_lift` median 1.0) |
| Data stories are voice-led | 8 of 15; the silent figure stream (variant B) is music-led |
| End hold at most 1.5 s | 0 of 10 films with an end card; the card holds 5.85 s at the median (2.0 to 13.1); 5 films end on the last chart |
| Something new at least every 6 s | 4 of 15 keep every gap under 6 s; a finished chart is held for reading up to about 16 s |
| One saturated accent on grey or muted context | 2 of 15; see Options |
| Open on a figure or a chart | 3 of 15; a title 6, footage 3, a presenter 2, a statement 1 |
| 4:5 for feeds | 0 of 15 (all 16:9 uploads); a delivery choice from the brief, not a genre trait |

## Coding sheet

What pixels cannot read is coded by a fresh reviewer (never the builder) from 12 fps strips of the render
(`ice-remake/scripts/clip_strip.py`; a zoom strip over the first seconds of every chart and hero number) into
`ice/review/genre-coding.json`, with the same fields the corpus was coded with: the shared fields of
`genres/ui-motion.md` "Coding sheet" (`scenes`, `text`, `transitions`, `camera`, `end_card`, `brand_presence`, `hero`
and `interaction` filled honestly as none), plus one `data` block:

- `variant` (narrated-chart, chart-race, infographic-highlights, news-data-package, mixed), `narration` (voiceover,
  presenter, presenter-and-voiceover, none), `presenter_share`, `real_material_share`.
- `chart_scene_share`, `number_scene_share`: shares of the counted scenes whose hero is a chart or a hero number.
- `charts`: one row per chart a viewer counts, `{start, end, kind, build_order, draw_s, hold_s, units_on_screen,
  source_on_screen, direct_labels, legend, baseline_zero, highlight, from_previous, camera}`. A chart is a picture whose
  shapes are sized or placed by data (bar, line, area, pie, stacked, scatter, map with values, table, pictogram, race).
  `build_order`: the order frame (axes, gridlines, baseline, outline), data and label appear (frame-data-label,
  frame-label-data, data-then-frame, label-data, all-at-once, no-frame). `draw_s`: from the first data mark to the data
  complete. `hold_s`: from the data complete to the chart's next change.
- `hero_numbers`: one row per figure shown large as the point of its moment, `{start, end, text, counter, count_s,
  with_label, label_after_number}`; `start` is the first readable frame (the landing frame of a count), `end` the last;
  `counter` none, count-up, odometer or ticker (a value that runs with the data, such as a race's year).
- `numbers_per_scene` `{median, max}`: distinct figures readable together (not axis ticks).
- `source_line`, `units_line` (every-chart, most, some, none); `highlight_colour` (one-accent-on-grey, two-compare,
  category-palette, none); `counters`, `odometers`; `annotations` `{arrow_or_callout, shaded_period, reference_line,
  circle_or_box}`; `title_states_point` (most, some, none).
- `text_on_screen_share`, `max_display_words`, `first_number_s`, `first_chart_s`, `hook_kind`, `close`, `music`.

## Fingerprint

`genre_check.py check --genre data-story --video <render> --coding ice/review/genre-coding.json` (the `ice-qa` skill)
runs at gate D on every draft of a data story that follows no reference, and its numbers go into the delivery report.
A red key is fixed in the film (bring the first chart or figure forward, keep a chart or number on screen, hold a
finished chart or figure until it can be read, show fewer figures at once, cut less), never by padding with idle motion;
a key the user, a reference or the chosen style sets differently is lifted by its exemption row and passed as
`--exempt <key>=<source>`. Keys marked `-` are reported for the critic, not gated.

Calibration: only keys that 14 or more of the 15 corpus films hold are gated, at bounds that cover the corpus, and one
gated key may miss (`misses_allowed 1`, printed yellow with a sentence in the delivery report). On its own corpus the line passes 15 of 15 films: 12 green and 3 yellow (the Statista bar chart race misses
`median_event_gap_s` with one continuous race, 5.4 s between event onsets; the FT film's 16.25 s held chart and BBC
Newsnight's 1.0 s figure reading time sit near an edge). The variant numbers, chart holds, hero number reading time,
counters, source and unit lines, the build order and the highlight are craft targets for the storyboard and the critic,
reported by the check, never gated.

Genre fingerprint: data_first_s <=25; data_time_share >=0.2; data_read_s >=1; data_numbers_at_once <=8; cuts_per_10s <=2.5; median_event_gap_s <=1.5; max_event_gap_s <=17; misses_allowed 1; events_per_s -; scene_median_s -; hook_events_3s -; hard_cut_share -; move_onset_lift -; data_chart_hold_s -; data_hero_read_s -; data_counters -; data_source -; data_units -; data_build_frame_first -; data_highlight -; data_variant -; end_logo -.

## Rules this genre replaces

Each general rule stays the house default for every other film; its own file names this genre as the exception.

| General rule | Where | In this genre |
|---|---|---|
| Count-ups decelerate over about 1.2 to 1.6 s; the label after the number lands | `film-types/data-story.md` Rhythm ranges | a count runs 0.6 to 2.0 s (median 1.1), the same length for every count in a film; the label may sit on screen before the count |
| Staged builds of 0.5 to 1.3 s per stage | `ice-motion/references/motion-language-by-type.md` section 1; `atomic-moves.md` Chart staging | the frame first, then the data drawn in about 1 s (3 s or less), then the finished chart held at least 2 s (median 3.05 s per chart) |
| Data story end hold at most 1.5 s | `ice-qa/references/motion-density.md` section 6 | the end card holds its reading time (measured 5.85 s median); a film may end on its last chart |
| A hint when no new element appears for more than 6 s | `ice-qa/references/motion-density.md` section 4 | a finished chart or figure held for reading may run to about 16 s (longest gap 7.4 s median) |
| Data stories are voice-led | `ice-audio/SKILL.md` section 3 | variant A is voice-led; variant B (silent figure stream) is music-led |

Sources: measured on the corpus above with `ice-audio/scripts/sound_map.py`, `ice-qa/scripts/film_gate.py` and
`genre_check.py`, `ice-remake/scripts/clip_strip.py`; voice rate from the films' own captions or a local transcript;
coded with the coding sheet above.
