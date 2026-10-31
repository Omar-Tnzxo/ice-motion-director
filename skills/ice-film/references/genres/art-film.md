# Genre playbook: art film

Measured, not collected: 15 motion-led art films (festival and conference title films, series and film title
sequences, festival intros and abstract or generative films, from the studios', artists', festivals' and networks' own
channels) were measured with this plugin's own tools on 2026-10-31, plus an art film measure of holds, the opening and
the ending, the pace curve, palette changes, silences and peaks. Every number below is the corpus median and range,
with how many films hold it. A pattern in 60 percent or more of the films is a convention; 30 to 59 percent is an
option; under that it is not a rule. Read this file with the film type file; the type file decides structure, truth
and deliverables, this file gives the genre's measured grammar and the fingerprint the render is checked against.

## Scope

- Film type that points here: `art-film`. Use it for a motion-led art or experimental piece with nothing to sell, 30 s
  to 5 min: a festival or conference title film, a title sequence or opening credits, a festival or channel intro, an
  abstract or generative motion film, a brand-free mood piece, a style showcase.
- Not for: a brand film (`brand-film.md`), a type-led statement reel (`kinetic-type.md`), a picture for a whole song
  (`music-video.md`), a 2 to 8 s ident (`logo-sting.md`), a hype teaser (`hype-promo.md`). A style piece under 30 s
  keeps the type file's "Ten-second style film" option and is checked by its own plan, not by this fingerprint.
- Precedence: the user's words, a reference the film follows (its own measures win, `ice-remake`), and a chosen style
  outrank this file, through exemption rows lifting `genre:<key>` (the `ice-direction` skill, `references/treatment.md`
  section "Craft plan"). This file outranks the house defaults it names in "Rules this genre replaces". The flash
  safety limit is never outranked (section "Flashes and safety").

## Corpus

15 films, 46 to 214 s (median 90 s), all 16:9; 3 from the Arabic market (two Saudi festival intros, an Arabic
television programme's title sequence), the rest UK, US, Australia and Germany, 2013 to 2026. Sources and why each was
chosen are kept in the maintainers' research folder (`research/genre-playbooks/art-film/corpus/SOURCES.md`, outside
this repo). Four variants and two pace families showed up; pick both at 02 and log them in `ice/DIRECTION.md`:

| Variant | Films | What marks it |
|---|---|---|
| Title sequence | 6 | opening credits or a main title: credits (or the title alone) over designed imagery, ends on the show title; 46 to 115 s |
| Festival titles | 4 | a festival or conference opening film: an art piece with its credits, ends on the event name or a fade; 72 to 214 s |
| Festival intro | 2 | a short festival intro played before films: a story in drawn scenes, ends on the event name and credits; 70 to 90 s |
| Abstract or generative | 3 | forms, systems or bodies evolving with no story, few or no credits; 78 to 180 s |

| Measure | Kinetic family (10) | Held family (5) |
|---|---|---|
| Visual events per s | 1.53 (1.04 to 2.92) | 0.39 (0.26 to 0.68) |
| Median gap between visual events | 0.42 s (0.25 to 0.75) | 1.04 s (0.67 to 2.83) |
| Longest gap without an event | 3.7 s (0.9 to 10.0) | 10.0 s (7.6 to 35.8) |
| Whole-frame change (pixel scene) | 1.08 s (0.92 to 2.25) | 2.83 s (1.83 to 4.29) |
| Longest hold (one slow shot, by eye) | 4.2 s (1.5 to 24) | 6.6 s (4.5 to 11.5) |
| Credit or title card held | 2.2 s (1.25 to 5.3) | 3.6 s (2.2 to 5.7) |
| Fast-motion share (`film_gate.py`) | 0.26 (0.03 to 0.58) | 0.01 (0 to 0.34) |

The held family is the premium CG title sequence and the slow festival film (a dark ground, long camera drifts,
credits held 2 to 6 s); the kinetic family is drawn, stop-motion, painted, generative and mirrored footage pieces.

## Conventions (60 percent or more)

| Convention | Number (median, range) | Held | How it is measured |
|---|---|---|---|
| One motif carries the film and keeps changing state | one motif transformed (8) or a few alternating (6); 8 states (5 to 15) | 14 of 15; 4 or more states 15 of 15 | coding sheet `art.motif` |
| The motif comes back at the end | | 14 of 15 | coding sheet `art.motif.returns_at_end` |
| One material or medium to the last frame | 3D CG 6, drawn 4, mixed 3, footage 1 | 12 of 15 | coding sheet `art.material` |
| A limited palette in each section, shifting between sections | 3 main hues (1 to 6); palette shifts at 4 section changes (0 to 7) | 3 hues or fewer 11 of 15; shifts 12 of 15 (one palette throughout 3 of 15) | `art_measure.py` palette; coding sheet `art.palette` |
| The picture never stops: holds drift or breathe | still share of the body 0.03 (0 to 0.19); longest true still 1.0 s (0 to 5.4) | still share 0.15 or less 13 of 15; longest still 3 s or less 13 of 15; holds that drift or breathe 15 of 15 | `art_measure.py` holds |
| Long slow shots inside a moving film | longest hold 5.1 s (1.5 to 24) | 3 s or more 11 of 15 | coding sheet `art.stillness.longest_hold_s` |
| Whole-frame change | pixel scene median 1.33 s (0.92 to 4.29) | 0.8 to 6 s 15 of 15; 1 to 4 s 13 of 15 | `genre_check.py` scene changes |
| Shot lengths vary | coefficient of variation of scene lengths 0.9 (0.43 to 2.16) | 0.5 or more 14 of 15 | `art_measure.py` pace |
| The pace changes over the film | busiest quarter 1.9 times the calmest (1.0 to 10.8); a slow and a fast section | 1.5 times or more 10 of 15; slow and fast sections 10 of 15 | `art_measure.py` pace; coding sheet `art.sections` |
| An image at once, then a calm start | first image at 0 s (0 to 3.1); 2 events in the first 3 s (0 to 12) | first image by 0.5 s 10 of 15, by 3 s 14 of 15; 2 events or fewer 9 of 15 | `art_measure.py` opening; `genre_check.py` |
| Never opens on a title card or a logo | | 14 of 15 (the one is a channel ident before the film) | coding sheet `art.opening.kind` |
| Cuts are not placed on the beat | cut beat lift 0.92 (0.39 to 2.38) | under 1.5 in 10 of 11 with 8 or more cuts; locked to the music's onsets 0 of 11 | the music video wave's beat measure |
| Hard cuts are the common seam, with some seams made of the film's own matter | hard cuts 80 percent of transitions (0 to 89) | some or most seams in the medium 14 of 15; dissolves under half 15 of 15 | coding sheet `transitions`, `art.transitions_in_medium` |
| Music without a voice carries the film | | 12 of 15 | sound map; coding sheet `art.sound_picture` |
| The picture's energy follows the score | loudness and picture activity correlate 0.38 (-0.23 to 0.89); loudest 4 s at 60 percent of the runtime (9 to 81) | 0.3 or more 9 of 15; the loudest part in the second half 11 of 15 | `art_measure.py` energy and peak |
| A hero moment late in the film | at 61 percent of the runtime (14 to 81) | 50 to 85 percent 11 of 15 | coding sheet `art.evolution.hero_moment_s` |
| Credits or a title as short cards | 4 words per card (2 to 8); held 2.6 s (1.25 to 5.7); 1 or 2 type styles (1 to 4) | type in 13 of 15 (credits 11, title only 2); 4 words or fewer 10 of 13; 1.5 to 4 s 8 of 13; 2 styles or fewer 10 of 13 | coding sheet `art.type` |
| Several camera moves | 3 distinct moves (0 to 5) | 3 or more 12 of 15 | coding sheet `art.camera` |
| Designed light moments | 2 (0 to 8) | 1 or more 10 of 15; 2 or more 9 of 15 | coding sheet `art.light_events` |
| Length | 90 s (46 to 214) | 45 s to 3.6 min 15 of 15 | duration |
| Mixed quieter than social | -17.1 LUFS (-26.9 to -8.5) | -14 or quieter 12 of 15 | sound map |

## Options (30 to 59 percent; the variant and the brief decide)

| Option | Held | Use when |
|---|---|---|
| A black lead-in before the first image (0.6 to 3.1 s) | 5 of 15 (3 title sequences, 2 festival films) | a title sequence or a festival film that opens out of darkness; the lead-in carries the first sound |
| Ends on black (a fade or a cut) | 6 of 15 | a mood piece; the last image fades with the score |
| Ends on the title, the event name or a logo card | 8 of 15; the title or name last 7 of 15 | title sequences and festival pieces; the closing card holds 1 to 5.3 s (median 3.2) before any credit roll |
| A breath: 2 s or more of near stillness inside the body | 7 of 15 | before the turn or the hero moment |
| Builds to a peak or an arch | 8 of 15 | a story or a reveal; otherwise a transformation chain, a steady drift or a loop |
| The ending echoes the opening | 8 of 15 | one-motif films |
| Four or more camera moves | 5 of 15 (median 3) | CG title sequences |
| Credits set inside the scene (on surfaces, in the world) | 5 of 11 with credits | CG title sequences; otherwise centred overlay cards |
| A dark ground for most of the film | 7 of 15 | the held family |
| Score-led with hits on the picture | 6 of 15 | festival intros and kinetic pieces |
| Two or fewer hard cuts per 10 s | 8 of 15 | the held family and generative films |

## Measured and rejected

These ideas were tested on the corpus and did not hold; they are not rules for this genre. Do not add them back from
memory.

| Idea | Held | What the corpus does instead |
|---|---|---|
| Length 10 to 60 s | 3 of 15 | 46 to 214 s, median 90 s; the 10 to 60 s style film stays the short option |
| Hero moment at 60 to 75 percent of the runtime | 4 of 15 | late, at 50 to 85 percent (11 of 15) |
| End frame held 0.8 to 1.2 s | 1 of 15 | a final hold of 3.0 s (0 to 11.5), or a fade to black |
| A pace change and a breath in every film | 4 of 15 | a pace change (10 of 15); the breath is an option (7 of 15) |
| Avoid hard cuts; transitions made of the medium | hard cuts under half of transitions 4 of 15; most seams in the medium 4 of 15 | hard cuts 80 percent of seams, some seams in the medium (14 of 15) |
| At least four different camera moves | 5 of 15 | 3 (0 to 5) |
| Every visible action has a sound | 3 of 15 (sound on the move lift 1.08, 0.89 to 1.40) | the score carries the film; hits on some moves |
| At least two real silences | 0 of 15 (2 films have one) | a continuous score; quiet comes from the arrangement, not from silence |
| One style and palette to the last frame | palette 3 of 15 | one material (12 of 15), the palette shifts by section (12 of 15) |
| A scene ceiling of 5 s | 7 of 15 by eye (longest hold 5.1 s, 1.5 to 24) | one or more slow shots of 5 to 12 s carried by a camera drift |
| A busy hook: 4 or more events in the first 3 s | 4 of 15 | an image at once, then a calm start (2 events) |
| No true still over 1 s | 8 of 15 | no true still over 3 s (13 of 15) |
| A cinematic title of 45 to 90 s has 7 to 12 scenes | 3 of 8 | 14 scenes (7 to 18) |
| Cuts on the beat | 2 of 11 at a lift of 1.2 | cuts at chance against the beat (0.92) |

## Flashes and safety

3 of 15 films exceed the WCAG limit of 3 flashes per second (mirrored footage at 10 per second, laser flicker at 6, a
tiled light step at 5). Ice never copies them: the strobe safe mode stays absolute in this genre, and the pace comes
from cuts, morphs and light sweeps under the limit.

## Rules this genre replaces

Each general rule stays the house default for every other film; its own file names this genre as the exception.

| General rule | Where | In this genre |
|---|---|---|
| Fit 10 to 60 s | `film-types/art-film.md` Fit | 30 s to 5 min measured (median 90 s); 10 to 60 s is the short style film |
| Hero moment at 60 to 75 percent, end frame held 0.8 to 1.2 s | `film-types/art-film.md` Structure options; `openers-and-endings.md` section 2 | the ten-second style film; longer pieces put the hero moment at 50 to 85 percent and hold the end 1.5 to 5 s or fade |
| A pace change and one breath | `film-types/art-film.md` Rhythm ranges | a pace change; the breath is an option |
| Avoid default fades and hard cuts | `film-types/art-film.md` Transition policy | hard cuts are the common seam; some seams made of the film's own matter |
| At least four camera moves | `film-types/art-film.md` Camera policy | three or more |
| A sound on every action, two real silences | `film-types/art-film.md` Sound policy | the score carries the film; silences are not required |
| Longest still 1 s | `film-types/art-film.md` Richness floor | 3 s, holds drifting or breathing |
| One style and palette to the last frame | `ice-motion/references/motion-language-by-type.md` | one material; the palette may shift by section |
| Never a black frame over 0.3 s at the open | `openers-and-endings.md` section 2 | a black lead-in of up to 3.1 s opens a title sequence |
| A scene ceiling of 5 s | `ice-motion/references/anti-slideshow-and-density.md` section 3 | a slow shot of 5 to 12 s on a camera drift is this genre's named reason |
| Cinematic title 45 to 90 s with 7 to 12 scenes | `ice-motion/references/anti-slideshow-and-density.md` section 3 | 7 to 18 scenes |
| Fast-motion share red under 0.035, blank run 0.3 s red | `ice-qa/references/motion-density.md` section 3 | the held family runs under 0.035; a black lead-in or tail is the genre's open and close |

## Coding sheet

The reviewer fills the shared sheet of every genre (text, hero, transitions, camera, end card), then the art block
below, from the frames of the render (one strip every 3 s, zoom strips at 12 fps where needed) and the art measures.
A field that cannot be read is `null` with a note. Times in seconds. Credits show real names: count, never copy.

| Field | What to write |
|---|---|
| `art.variant` | `title-sequence`, `festival-titles`, `festival-intro`, `abstract-generative`, `narrative-short` |
| `art.material` | `3d-cg`, `2d-drawn`, `live-action`, `mixed`, `generative-code`, `stop-motion`, `collage` |
| `art.motif` | `main` (a few words), `distinct_motifs`, `variations` (clearly different states of the main motif), `mode` (`one-motif-transformed`, `few-motifs-alternating`, `vignettes-no-motif`, `one-world-travelled`), `returns_at_end` |
| `art.evolution` | `shape` (`build-to-peak`, `steady-drift`, `episodic-vignettes`, `transformation-chain`, `arch`, `loop`), `turn_s`, `hero_moment_s`, `note` |
| `art.sections` | stretches a viewer would name by look or pace: `start`, `end`, `what`, `palette` (a few words), `pace` (`slow`, `medium`, `fast`) |
| `art.palette` | `kind` (`monochrome`, `limited-2-3`, `one-palette-throughout`, `shifts-per-section`, `full-colour`), `main_colours`, `shifts_between_sections`, `dark_ground` |
| `art.stillness` | `longest_hold_s` (the longest slow shot by eye), `holds_over_3s`, `hold_kind` (`true-still`, `slow-drift`, `breathing-texture`, `none`), `camera_drifts_in_holds` |
| `art.camera` | `distinct_moves`, `kinds` (push-in, pull-out, orbit, track, crane, drift, static, rack-focus) |
| `art.type` | `use` (`credits`, `title-only`, `statement-lines`, `none`), `cards`, `words_per_card_median`, `card_hold_median_s` (12 fps zoom strips of three cards), `placement`, `font_styles`, `first_type_s`, `title_s` |
| `art.sound_picture` | `relation` (`score-led-hits`, `score-bed-loose`, `sound-design-led`, `song-led`, `silent`), `hits_seen`, `voice` |
| `art.opening` | `kind` (`from-black-fade`, `from-black-cut`, `cold-in-motion`, `title-first`, `macro-detail`, `logo`), `first_image_s` |
| `art.ending` | `kind` (`title-card`, `fade-to-black`, `cut-to-black`, `held-final-image`, `loop`, `logo`), `final_hold_s`, `title_last`, `echoes_opening` |
| `art.transitions_in_medium`, `art.light_events`, `art.flash_or_strobe_seen` | most, some or none of the seams made of the film's own matter; designed light moments; any strobe seen |
| `end_card.start_s` | the first frame of the closing title, event name, logo card or end credit roll (null when the film ends on an image) |

## Fingerprint

`genre_check.py check --genre art-film --video <render> --coding ice/review/genre-coding.json` (the `ice-qa` skill)
runs at gate D on every draft of a film of this genre that follows no reference, and its numbers go into the delivery
report. A red key is fixed in the film (a motif that keeps changing, a closing card held long enough to read, more
change inside a dead stretch), never by padding with idle motion; a key the user, a reference or the chosen style sets
differently is lifted by its exemption row and passed as `--exempt <key>=<source>`. Keys marked `-` are reported for
the critic, not gated. The type keys read "no type" and pass when the film shows no credits or title.

Calibration: only keys that 14 or more of the 15 corpus films hold are gated, at bounds that cover the corpus, and one
gated key may miss (`misses_allowed 1`, printed yellow with a sentence in the delivery report). The pace keys are set
wide enough for both families; the variant is reported (`art_variant`) for the critic. On its own corpus the line passes
15 of 15 films: 13 green and 2 yellow (a festival film of mirrored footage vignettes with no motif, and an upload that
opens on its commissioner's channel ident). The return of the motif at the end (14 of 15, the same vignette film) is
reported, not gated, so one film without a motif is one allowed miss, not two.

Genre fingerprint: events_per_s >=0.2; median_event_gap_s <=3.0; scene_median_s 0.4-5.0; art_motif_mode one-motif-transformed|few-motifs-alternating|one-world-travelled; art_motif_states >=4; art_card_words <=10; art_card_hold_s >=1.0; art_opening from-black-fade|from-black-cut|cold-in-motion|macro-detail; misses_allowed 1; max_event_gap_s -; hook_events_3s -; cuts_per_10s -; hard_cut_share -; move_onset_lift -; art_variant -; art_motif_returns -; art_palette_shifts -; art_longest_hold_s -; art_end -; art_end_hold_s -.
