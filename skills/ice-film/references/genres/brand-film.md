# Genre playbook: brand film

Measured, not collected: 14 brand films (12 brands, from their own channels or the studio that made them) were measured
with this plugin's own tools on 2026-10-31. Every number below is the corpus median and range, with how many films hold
it. A pattern in 60 percent or more of the films is a convention; 30 to 59 percent is an option; under that it is not a
rule. Read this file with the film type file; the type file decides structure, truth and deliverables, this file gives
the genre's measured grammar and the fingerprint the render is checked against.

## Scope

- Film type that points here: `brand-film`. Use it for an emotional brand story with no product demo at its centre: a
  brand anthem, a campaign film, a purpose or mission film, a manifesto, a seasonal film (Ramadan, a national moment), a
  corporate "who we are" film, a rebrand reveal, 30 s to 3 min, filmed, animated or mixed.
- Not for: a product demo (`product-launch.md`, `ui-motion.md`), a type-led statement reel where words are the main
  actors (`kinetic-type.md`), a 2 to 8 s ident (logo sting), an agency showreel cut from existing work (edit type
  showreel).
- Precedence: the user's words, a reference the film follows (its own measures win, `ice-remake`), and a chosen style
  outrank this file, through exemption rows lifting `genre:<key>` (the `ice-direction` skill, `references/treatment.md`
  section "Craft plan"). This file outranks the house defaults it names in "Rules this genre replaces". Founder
  decisions are never outranked: the product job beat (`../film-setup.md` section 1) still holds.

## Corpus

14 films, 30 to 170 s (median 93 s), all 16:9: travel, outdoor apparel (2), sport (2), consumer tech, a wellness app,
marketing software, two telecom Ramadan films from the Arabic market, a ride app (a rebrand reveal for the Arabic market
and a story film for Pakistan), trucks and industry. Sources and why each was chosen are kept in the maintainers'
research folder (`research/genre-playbooks/brand-film/corpus/SOURCES.md`, outside this repo). Two variants showed up;
pick one at 02 from the material the film will be made of:

| Variant | Films | What marks it |
|---|---|---|
| A. Filmed brand film | 11 (live action or archive 60 percent of the runtime or more) | hard cuts 97 percent of transitions (36 to 100), counted shot 1.33 s (0.67 to 1.77), 6.6 shots per 10 s (5.0 to 12.3), longest hold 5.75 s (3.6 to 9.9), 60 to 170 s |
| B. Motion-led brand film | 3 (designed animation 60 percent or more: a rebrand reveal, an animated app film, a logo reveal) | hard cuts 29 percent of transitions (18 to 47), an object carried across a cut in every film (4 to 21 times), value flips at most chapter changes in 2 of 3, longest hold up to 24 s, 30 to 105 s |

## Conventions (60 percent or more)

| Convention | Number (median, range) | Held | How it is measured |
|---|---|---|---|
| Words carry the film: a voiceover, a sung lyric or dialogue | spoken or sung words over 72 percent of the runtime (0 to 95); half the runtime or more in 10 of 14 | 11 of 14 (voice 5, voice plus supers 1, dialogue 2, sung 3) | coding sheet `brand.carrier`; a transcript of the render |
| Something new about every 0.4 s | median gap between visual events 0.42 s (0.25 to 0.50); 1.73 events per s (0.67 to 2.31) | gap 14 of 14; 1.0 events per s or more 13 of 14 | `genre_check.py measure` events |
| No long dead stretch | longest gap without an event 4.75 s (2.0 to 12.0) | 6.2 s or less 12 of 14; 7.5 s or less 13 of 14 | same |
| Whole-frame change | pixel scene median 1.12 s (0.92 to 3.17) | 0.8 to 2.4 s 13 of 14 | `genre_check.py` scene changes |
| Short shots, many of them | counted shot median 1.33 s (0.60 to 4.90); 6.55 shots per 10 s (1.9 to 12.3) | 2.0 s or less 12 of 14; 5 or more per 10 s 11 of 14 | coding sheet `brand.shot_len`, `brand.shots_counted` |
| Filmed films cut hard | hard cuts 97 percent of transitions | 10 of 11 filmed films (0 of 3 motion-led) | coding sheet transitions |
| Lengths vary; slow and fast passages in one film | coefficient of variation of scene lengths 0.67 (0.46 to 1.80); 4 passages (3 to 7) | 14 of 14 | `genre_check.py` scenes; coding sheet `brand.passages` |
| One or two long holds at the emotional beats | longest hold 5.9 s (3.6 to 24.5) | 8 s or less 9 of 14 | coding sheet `brand.longest_hold_s` |
| The brand shows early, not only at the end | brand identifiable at 12 percent of the runtime (0 to 98); a logo before the end card | by 40 percent 11 of 14; logo before the end card 12 of 14 | coding sheet `brand.brand_first`, `brand.logo_only_at_end` |
| The film does not open on a logo; the first 3 s are busy | hook on people, a place, a bold line or the product in motion; 7 events in the first 3 s (0 to 11) | not a logo 12 of 14; 4 or more events 11 of 14 | coding sheet `hook_0_3s`; `genre_check.py` |
| Filmed material and people | live action plus archive 92 percent of the runtime (0 to 100); people are the protagonist | 11 of 14; people 10 of 14 | coding sheet `brand.material_share`, `brand.protagonist` |
| One music piece under the film, growing to a peak, resolving on the logo | music present 13 of 14; build-to-peak, quiet-loud-quiet or drop-and-swell 9 of 14 | resolves on the logo 11 of 14 | coding sheet `brand.music`; `sound_map.py` |
| On-screen lines land whole | static or line reveal | 6 of 8 films with supers (word by word 2 of 8) | coding sheet `text.dominant_reveal` |
| The film ends on the logo centred | centred 13 of 14; on a plain solid ground 11 of 14; card 4.8 s (1.8 to 11.6), 2 to 8 s in 12 of 14 | 13 of 14 | coding sheet `end_card`; `genre_check.py` end card |
| No call to action | | 10 of 14 | coding sheet `brand.ending.cta` |
| Length | 93 s (30 to 170); 60 to 180 s | 12 of 14 | duration |

## Options (30 to 59 percent; the brief and the variant decide)

| Option | Held | Use when |
|---|---|---|
| A spoken voice: voiceover, voiceover plus supers, or dialogue in scene | 8 of 14 | the brand has a point of view to say: manifesto, purpose, testimony and story films |
| A sung song carries the film (lyrics in scene or as lines on screen) | 3 of 14 (both Arabic Ramadan films, one tech anthem) | anthems and seasonal films; the lyric lines are the copy |
| Supers alone carry the film (music-led, no voice) | 3 of 14 | identity reveals and corporate claim films; variant B |
| Supers beside the main carrier (facts, names, places, the manifesto line) | 8 of 14; at most 7.5 words per super (1 to 18), 8 or fewer in 4 of 8 | the voice needs a fact, a name or a date pinned |
| End card with a tagline, hashtag or URL | 8 of 14 (logo only 5 of 14) | the campaign owns a line |
| A designed quiet beat: the music drops, a frame holds, one voice alone | 7 of 14 | before the last act or at the emotional turn |
| Two or more designed light moments (a sunrise, lights coming on, a beam) | 5 of 14 | darkness-to-light and outdoor films |
| An object or movement carried across a cut (match cut, split-screen match) | 5 of 14 (all motion-led films, and one archive anthem built on split-screen matches) | variant B, or a filmed film whose device is the match |
| The music peak at 60 to 85 percent of the runtime | 5 of 14 (peak position median 0.61, 0.02 to 0.94) | build-to-peak films; in voice-led films the words place the peak |
| Tempo 85 to 120 BPM | 5 of 9 confident reads (median 116.5, 91 to 160) | |
| Product on screen 25 percent of the runtime or less | 8 of 14 (median 20 percent, 0 to 60) | the product job beat still holds (founder decision) |

## Measured and rejected

These ideas were tested on the corpus and did not hold; they are not rules for this genre. Do not add them back from
memory.

| Idea | Held | What the corpus does instead |
|---|---|---|
| Music-led by default | 6 of 14 (no spoken carrier) | words carry 11 of 14: the voice, the lyric or the dialogue sets the clock |
| Nearly every transition turns the object into the next; hard cuts only in a flurry | 3 of 14 (all motion-led) | filmed films cut hard, 97 percent of transitions |
| Value or saturation flips at every chapter change | 2 of 14 | flips at some chapters (10 of 14) |
| Manifesto lines word by word on beats | 2 of 8 with supers | the line lands whole (6 of 8) |
| About 25 percent of the film dead still | 2 of 14 (still ratio median 0.06) | a designed quiet beat (7 of 14) inside a moving film |
| Something new at least every 3 s | 4 of 14 | the longest gap is 4.75 s, 6.2 s or less in 12 of 14 |
| A scene ceiling of 5 s | 5 of 14 | one or two emotional holds of 6 to 10 s are the named reason (8 s or less 9 of 14) |
| Two designed light events in every film | 5 of 14 (median 1) | one, or more in darkness-to-light films |
| End on an action, not a centred card | 1 of 14 | the logo centred on a plain ground |
| Gentle -16 LUFS for every brand film | 2 of 14 (the two calm films) | median -12.6; anthems and montages are mixed like social films |
| A sound on every move (`move_onset_lift` 1.2 or more) | 0 of 14 (median 1.04) | music and words; effects only where an action makes a sound |

## Coding sheet

The reviewer fills the shared sheet of every genre (text, hero, transitions, camera, end card, brand presence), then
the brand block below, from the frames and a transcript of the render. A field that cannot be read is `null` with a
note. Times in seconds.

| Field | What to write |
|---|---|
| `brand.carrier` | what carries the meaning: `voice` (a voiceover or interview), `supers` (on-screen lines, no voice), `both` (a voice plus supers that add to it), `sung` (lyrics), `dialogue` (characters in scene), `none`; subtitles of the voice count as `voice` |
| `brand.voice` | `kind`, `share_of_runtime` (0 to 1, from the transcript), `first_word_s` |
| `brand.supers` | `count`, `words_total`, `max_words_per_super`, `role` (manifesto line, caption fact, name or place, none); the end card and subtitles are not supers |
| `brand.shots_counted`, `brand.shot_len` (`median_s`, `min_s`, `max_s`), `brand.longest_hold_s` | shots a viewer counts, by eye on the strips; a slow move inside one shot is one shot |
| `brand.passages` and `brand.slow_fast_contrast` | stretches by pace (`slow`: shots of about 3 s or more; `fast`: under about 1.5 s) and whether both exist |
| `brand.quiet_moment` | `present`, `at_s`, `kind` (silence, music drop, still frame, single voice) |
| `brand.brand_first` (`any_s`, `kind`), `brand.logo_first_s`, `brand.logo_only_at_end` | the first moment the viewer can tell the brand, and the first logo |
| `brand.product_on_screen_share`, `brand.product_job_shown` | share of runtime with the product, app or service on screen; whether one beat shows its real job |
| `brand.protagonist`, `brand.real_people_or_talent` | people, one person, place, object or motif, the brand symbol; real customers, athletes or celebrities, actors, animated characters |
| `brand.music` | `kind`, `arc` (build-to-peak, steady, quiet-loud-quiet, drop-and-swell), `peak_s`, `resolves_on_logo`, `silence_before_end` |
| `brand.material_share` | `live_action`, `motion_or_animation`, `archive_or_ugc`, `screens_or_ui` (sum about 1) |
| `brand.narrative_job`, `brand.structure`, `brand.tension_gap` | reveal, prove, celebrate, provoke, document, invite; the structure option; the gap in a few words |
| `brand.transition_object_carry`, `brand.value_flips_at_chapters`, `brand.light_events` | carried transitions; most, some or none; designed light moments |
| `brand.ending` | `line_before_logo`, `cta`, `end_card_kind` (logo only, logo plus tagline, logo plus hashtag or URL, product) |

## Fingerprint

`genre_check.py check --genre brand-film --video <render> --coding ice/review/genre-coding.json` (the `ice-qa` skill)
runs at gate D on every draft of a film of this genre that follows no reference, and its numbers go into the delivery
report. A red key is fixed in the film (more shots or more change inside a long hold, a busier middle, a centred end
card), never by padding with idle motion; a key the user, a reference or the chosen style sets differently is lifted by
its exemption row and passed as `--exempt <key>=<source>`. Keys marked `-` are reported for the critic, not gated.

Calibration: only keys that 13 or more of the 14 corpus films hold are gated, at bounds that cover the corpus, and one
gated key may miss (`misses_allowed 1`, printed yellow with a sentence in the delivery report). On its own corpus the
line passes 13 of 14 films: 12 green and one filmed anthem yellow (its end logo sits left); the motion rebrand reveal
that holds its symbol for 15 s is red (0.67 events per s, a 12 s gap), the kind of film that lifts `events_per_s` and
`max_event_gap_s` by an exemption row naming its long reveal. `cuts_per_10s` is reported only: the pixel cut detector
finds under half the counted cuts in graded live action. The `brand_` keys split the two variants and are reported for
the critic.

Genre fingerprint: events_per_s >=1.0; median_event_gap_s <=0.6; max_event_gap_s <=7.5; scene_median_s 0.6-3.4; end_logo center; misses_allowed 1; hook_events_3s -; cuts_per_10s -; end_background -; hard_cut_share -; brand_carrier -; brand_shot_median_s -; brand_first_s -; brand_footage_share -; sfx_per_min -; move_onset_lift -.

## Rules this genre replaces

Each general rule stays the house default for every other film; its own file names this genre as the exception.

| General rule | Where | In this genre |
|---|---|---|
| Music-led by default | `film-types/brand-film.md` Timing master | word-led by default (11 of 14); music-led for supers-only films |
| Nearly every transition transforms the object; value flips at every chapter change | `film-types/brand-film.md` Transition policy and QA thresholds | the motion-led variant; filmed films cut hard and flip at some chapters |
| Manifesto lines word by word on beats | `film-types/brand-film.md` Text density | lines land whole (6 of 8); word by word is the motion-led option |
| A light events floor of 2 per film | `film-types/brand-film.md` Richness floor | 1; 2 or more for darkness-to-light films |
| About 25 percent of the film dead still | `ice-motion/references/anti-slideshow-and-density.md` section 4 | a designed quiet beat (7 of 14) inside a moving film |
| End on an action, not a centred card | `openers-and-endings.md` section 6 | the logo centred on a plain ground (13 of 14), 2 to 8 s |
| Gentle -16 for brand films | `ice-audio/SKILL.md` section 4 | calm films only; anthems and montages social -14 |
| A scene ceiling of 5 s | `ice-motion/references/anti-slideshow-and-density.md` section 3 | the emotional hold of 6 to 10 s, once or twice, is this genre's named reason |
