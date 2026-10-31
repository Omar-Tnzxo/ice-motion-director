# Genre playbook: kinetic type

Measured, not collected: 11 films of the genre (10 by motion studios for real brands, 1 Arabic promo the founder saved)
were measured with this plugin's own tools on 2026-10-31. Every number below is the corpus median and range, with how
many films hold it. A pattern in 60 percent or more of the films is a convention; 30 to 59 percent is an option; under
that it is not a rule. Read this file with the film type file; the type file decides structure, truth and
deliverables, this file gives the genre's measured grammar and the fingerprint the render is checked against.

## Scope

- Film type that points here: `kinetic-type`. Use it whenever words are the main actors of a short film: a type-led
  promo, a brand manifesto or statement reel, a quote or list reel, a type-driven social ad, 10 to 90 s.
- Not for: captions on a talking head (ice-type captions), a news reel's titles (edit type `news-reel`), an app ad
  whose hero is the product's UI (`genres/ui-motion.md`), a lyric video cut word for word to a song (music video), a
  logo sting.
- Precedence: the user's words, a reference the film follows (its own measures win, `ice-remake`), and a chosen style
  outrank this file, through exemption rows lifting `genre:<key>` (the `ice-direction` skill, `references/treatment.md`
  section "Craft plan"). This file outranks the house defaults it names in "Rules this genre replaces".

## Corpus

11 films, 15 to 76 s (median 40 s), all 16:9; 2 in Arabic (right to left). Rail, bank, telecom, food tech, finance,
EV charging, a tech company's programme, a captions tool. Sources and why each was chosen are kept in the maintainers'
research folder (`research/genre-playbooks/kinetic-type/corpus/SOURCES.md`, outside this repo). Two variants showed up
and are measured apart where they differ:

| Variant | Films | What marks it |
|---|---|---|
| A. Pure type | 6 (words on a plain ground with the brand's shapes) | almost no hard cuts (median 0.3 per 10 s), text readable 87 percent of the runtime, type alone on screen about 60 percent of the time, no voiceover |
| B. Type over footage | 5 (words cut between and over real footage, device shots or photos) | many hard cuts (median 3.8 per 10 s, about 60 percent of transitions), whole-frame change every 1.2 s, type alone about 43 percent of the time, a voice in 2 of 5 |

## Conventions (60 percent or more)

| Convention | Number (median, range) | Held | How it is measured |
|---|---|---|---|
| Words are on screen most of the time | readable text 78 percent of the runtime (60 to 98); 50 percent or more | 11 of 11 | coding sheet `type.text_on_screen_share` |
| Every line animates in; letter by letter is never the main unit | | 11 of 11 | coding sheet |
| Words arrive one by one (word by word); the whole line at once is the other unit | | word 8 of 11, line 3 of 11 | coding sheet `type.reveal_unit` |
| Very short lines | 2 words per line (1 to 4); 3 or fewer | 8 of 11 (5 or fewer: 11 of 11) | coding sheet `type.words_per_line_median` |
| Few words readable at once | 6 at most at one time (4 to 10); 8 or fewer | 9 of 11 | coding sheet `type.max_words_on_screen` |
| Reading speed | 1.75 words per second of text time (1.1 to 3.5); 2.0 or fewer | 8 of 11 | words over the seconds with readable text |
| A line holds about a second | median line hold 1.0 s (0.4 to 3.0); 0.6 to 2.0 s | 8 of 11 | coding sheet `type.line_hold_median_s` |
| Emphasis on about a third of the lines, by mixed means, in one accent hue | 33 percent of lines (11 to 89); 2 or more treatments in one film (median 3: colour, scale, weight, italic, underline, box); one accent hue or none | emphasis 11 of 11; mixed 9 of 11; one hue 10 of 11 | coding sheet |
| One sans family at several weights | no serif 10 of 11; one family 6 of 11, two at most 9 of 11; 2 to 4 weights (median 3); bold or black present | 10 of 11 | coding sheet |
| Sentence or lower case; centred lines | | case 7 of 11; centred 8 of 11 | coding sheet |
| Camera locked on type; the words move, not the camera | | 10 of 11 | coding sheet `type.camera_on_type` |
| Many entrances | 5 entry kinds per film (4 to 8): mask rise, slide, scale pop, blur or fade, cut on, morph from a shape | 11 of 11 use 3 or more | coding sheet `type.entry_kinds` |
| Words act out their meaning | 2 words per film (0 to 7); at least 1 | 9 of 11 | coding sheet `type.meaning_moves` |
| Something new about every third of a second | median gap between visual events 0.33 s (0.33 to 0.50); 1.57 events per s (0.8 to 2.4) | 11 of 11 (events 1.0 per s or more: 9 of 11) | `genre_check.py measure` events |
| No long dead stretch | longest gap without an event 3.1 s (1.5 to 7.8); 6.2 s or less | 10 of 11 | same |
| The film opens on words | hook on bold or question text; 6 events in the first 3 s (0 to 9), 4 or more | text hook 10 of 11; 4 or more 8 of 11 | coding sheet; `genre_check.py` |
| Shot lengths vary | coefficient of variation of the scenes a viewer counts 0.43 (0.26 to 0.52); 0.25 or more | 11 of 11 | coding sheet scenes |
| Whole-frame change | median 1.5 s (1.1 to 5.5); 0.8 to 2.4 s | 8 of 11 | `genre_check.py` scene changes |
| Type mixes with other material in films over 30 s | type is the only hero 47 percent of the time (28 to 62); under 90 percent | 8 of 8 | coding sheet `type.type_only_share` |
| Music carries the film; no voiceover reads the copy | | 9 of 11 | coding sheet, `sound_map.py` voice |
| The film ends on the logo centred on a plain ground | end card 3.7 s (2.1 to 7.0), held still after its build; a tagline or URL 7 of 11 | 10 of 11; 1.5 s or longer 11 of 11 | coding sheet; `genre_check.py` end card |
| Length | 40 s (15 to 76); 20 to 60 s | 7 of 11 | duration |

## Options (30 to 59 percent; the variant decides)

| Option | Held | Variant A | Variant B | Use when |
|---|---|---|---|---|
| Ground with no footage (plain colour with the brand's shapes) | 6 of 11 | 6 of 6 | 0 of 5 | variant A; the statement needs no proof picture |
| Hard cuts 2.5 per 10 s or fewer | 7 of 11 | 6 of 6 (median 0.3) | 1 of 5 (median 3.8) | A carries changes by morphs, pushes and swaps; B cuts on the music between footage |
| Type alone on screen half the runtime or more | 5 of 11 | 5 of 6 | 0 of 5 | variant A |
| The whole line as the reveal unit | 3 of 11 | | | calm or premium films, statement relays, Arabic lines |
| Colour as the main emphasis | 3 of 11 | | | a brand with one strong accent colour |
| Weight or scale as the main emphasis | 5 of 11 | | | a brand whose palette is one colour plus neutrals |
| A voiceover reads or carries the copy | 2 of 11 | 0 of 6 | 2 of 5 | variant B with interviews or a narrator; the type then follows the voice's word onsets |

Pick the variant at 02 from the brief: real footage of the subject that must be seen, or a voice, leans B; a statement,
manifesto or offer carried by words alone leans A. Log the choice in `ice/DIRECTION.md`.

## Measured and rejected

House rules that were measured on this genre and did not hold. They stay house defaults for other film types; for this
genre they are replaced by the numbers above. Do not add them back from memory.

| Rule | Measured |
|---|---|
| At most about 5 words on screen | 5 of 11; median 6, 8 or fewer in 9 of 11 |
| One highlight form per film | 2 of 11; 9 of 11 mix 2 to 4 treatments in one accent hue |
| Serif plus sans, never two sans, for title-led films | 1 of 11 pairs a serif with a sans; 10 of 11 have no serif |
| Beat spacing 1.2 to 1.8 s | 3 of 11; median line hold 1.0 s, word barrages at 0.4 s |
| End hold at most 1.4 s | 0 of 11; end cards 2.1 to 7.0 s |
| Nothing still longer than about 1 s | 0 of 11; longest gap 3.1 s at the median; a landed line is held still to be read |
| A sound on every hit | sounds land on visual events no more often than chance in 11 of 11 (`move_onset_lift` median 1.02); the music carries the cut |
| Act out meaning once per film | 9 of 11 do it, median 2 words; the guard against a giant word as a slide still holds |
| Relay to an end card that holds 40 to 75 percent of the runtime | 0 of 11; the end card is 10 percent of the runtime at the median |

Arabic: 1 of the 2 Arabic films types its opening line letter by letter with a caret. With 2 films this does not
overturn the `ice-arabic` rule (rule 1, whole words or lines); the rule stands.

## Coding sheet

What pixels cannot read is coded by a fresh reviewer (never the builder) from 12 fps strips of the render
(`ice-remake/scripts/clip_strip.py`), into `ice/review/genre-coding.json`, with the same fields the corpus was coded
with: the shared fields of `genres/ui-motion.md` "Coding sheet" (`text`, `transitions`, `end_card`, `scenes`, `hero`
and `interaction` filled honestly as none), plus one `type` block:

- `words_total` (every readable word, end card included, texture copy and UI labels excluded), `lines_total_type`,
  `words_per_line_median`, `max_words_on_screen` (end card excluded).
- `reveal_unit` (letter, word, line, block, mixed) and `reveal_unit_counts`.
- `entry_kinds` and `exit_kinds`: counts per line (mask rise, slide, scale pop, fade or blur, cut on, typed, morph from
  a shape; exits by cut, reverse of entry, push out, mask out, morph into the next, fade).
- `emphasis_treatment` (every way a word is set apart in this film), `emphasis_dominant`, `lines_with_any_emphasis`,
  `accent_hues`.
- `type_families`, `families_count`, `weights_used`, `case`, `layout`.
- `text_on_screen_share` (share of the runtime with readable text), `type_only_share` (share where type is the only
  hero, on a plain ground or with shapes that serve it), `ground` (plain, plain-plus-shapes, footage, illustration, 3d,
  mixed).
- `line_hold_median_s` (time a line stays fully readable), `meaning_moves` (words that act out their meaning),
  `camera_on_type` (locked, drift, push, pan-or-track, mixed), `voiceover`, `rtl`.

## Fingerprint

`genre_check.py check --genre kinetic-type --video <render> --coding ice/review/genre-coding.json` (the `ice-qa` skill)
runs at gate D on every draft of a film of this genre that follows no reference, and its numbers go into the delivery
report. A red key is fixed in the film (more words on screen through the runtime, shorter lines, an animated entry for
every line, a centred end card on a plain ground), never by padding with idle motion; a key the user, a reference or
the chosen style sets differently is lifted by its exemption row and passed as `--exempt <key>=<source>`. Keys marked
`-` are reported for the critic, not gated.

Calibration: only keys that 10 or more of the 11 corpus films hold are gated, at bounds that cover the corpus, and one
gated key may miss (`misses_allowed 1`, printed yellow with a sentence in the delivery report). On its own corpus the
line passes 11 of 11 films: 9 green, the Arabic promo yellow (its end card puts the product beside the wordmark) and one
calm launch film yellow (its longest gap, 7.75 s, sits near the bound). Conventions held by 60 to 86 percent (events per
second, a busy first 3 s, cuts, the variant numbers) are craft targets for the storyboard and the critic, reported by
the check, never gated.

Genre fingerprint: median_event_gap_s <=0.6; max_event_gap_s <=8.0; text_reveal word_by_word|line|typed|letter; type_text_share >=0.5; type_words_per_line <=5; end_logo center; end_background plain-solid|plain-gradient; misses_allowed 1; events_per_s -; hook_events_3s -; scene_median_s -; cuts_per_10s -; hard_cut_share -; type_max_words -; type_only_share -; move_onset_lift -; end_center_dx -.

## Rules this genre replaces

Each general rule stays the house default for every other film; its own file names this genre as the exception.

| General rule | Where | In this genre |
|---|---|---|
| Kinetic type end hold at most 1.4 s | `ice-qa/references/motion-density.md` section 6 table | the reading time of the end-card text, at least 2 s (measured 2.1 to 7.0, median 3.7) |
| One highlight shape per video | `ice-type/references/type-system.md` section 5 | 2 to 4 treatments mixed (median 3) in one accent hue, on about a third of the lines |
| Serif plus sans for title-led films | `ice-direction/references/type-pairing.md` section 4 | one sans family at 2 to 4 weights; a second face only as a rare accent |
| Nothing still longer than about 1 s (Dead air) | `ice-motion/references/anti-slideshow-and-density.md` section 4 | landed lines hold to be read; the longest gap without an event stays at 6.2 s or less (10 of 11), median 3.1 |
| End on an action, not a centred card | `openers-and-endings.md` section 6 | the logo centred on a plain ground, 2 to 7 s, is the measured close |
| Act out meaning once per film | `ice-type/references/kinetic-type.md` section 1 | 1 to 3 words per film (median 2) |

Sources: measured on the corpus above with `ice-audio/scripts/sound_map.py`, `ice-qa/scripts/film_gate.py` and
`genre_check.py`, `ice-remake/scripts/clip_strip.py`; coded with the coding sheet above.
