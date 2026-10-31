# Genre playbook: UI and app motion ads

Measured, not collected: 15 films of the genre (9 motion design pieces the founder picked, 6 official brand launch
films) were measured with this plugin's own tools on 2026-10-31. Every number below is the corpus median and range,
with how many films hold it. A pattern in 60 percent or more of the films is a convention; 30 to 59 percent is an
option; under that it is not a rule. Read this file with the film type file; the type file decides structure, truth and
deliverables, this file gives the genre's measured grammar and the fingerprint the render is checked against.

## Scope

- Film types that point here: `app-ad`, `product-launch` (a product with screens), `ui-walkthrough`. Use it whenever
  product interface parts are the main material of a short promo (app promo, feature launch, SaaS or tool launch, UI
  motion design reel), 10 to 70 s.
- Not for: a product without screens (`product-launch.md`), a talking-head edit with screen inserts (ice-edit), a teaching explainer
  (ice-explainer), a long tutorial that walks every screen at real speed (the ui-walkthrough "Calm demo" option keeps
  its own pace; the fingerprint is reported, not gated, for it).
- Precedence: the user's words, a reference the film follows (its own measures win, `ice-remake`), and a chosen style
  outrank this file, through exemption rows lifting `genre:<key>` (the `ice-direction` skill, `references/treatment.md`
  section "Craft plan"). This file outranks the house defaults it names in "Rules this genre replaces".

## Corpus

15 films, 10 to 67 s (median 34 s); 10 horizontal, 3 vertical, 2 feed. Sources and why each was chosen are kept in the
maintainers' research folder (`research/genre-playbooks/ui-motion/corpus/SOURCES.md`, outside this repo). Two variants
showed up and are measured apart where they differ:

| Variant | Films | What marks it |
|---|---|---|
| A. Motion design promo | 9 (designer pieces for SaaS, creative tools and consumer apps) | words build one by one with a colour accent, a cursor presses free-floating UI parts, carried transitions, 3D depth |
| B. Brand launch film | 6 (official launch films of well-known software brands) | headlines rise or type line by line in one colour, more hard cuts, the product often inside its window or device |

## Conventions (60 percent or more)

| Convention | Number (median, range) | Held | How it is measured |
|---|---|---|---|
| Something new about every half second | 1.45 visual events per s (0.43 to 2.36); median gap 0.33 s | 14 of 15 | `genre_check.py measure` events |
| No long dead stretch | longest gap without an event 3.1 s (1.3 to 6.2) | 15 of 15 | same |
| Busy first 3 seconds | 7 events in the first 3 s (1 to 11); 4 or more | 12 of 15 | same |
| Scenes a viewer counts change every 2 to 4 s | median scene 2.5 s (1.7 to 4.5); variant A 2.0 s | 10 of 15 | coding sheet scenes |
| The frame changes a lot more often than the scene | median whole-frame change 1.6 s (0.8 to 6.2); 0.8 to 2.4 s | 13 of 15 | `genre_check.py` scene changes |
| Moderate hard cuts | 1.5 hard cuts per 10 s (0 to 7.6); 2.5 or fewer | 12 of 15 | `genre_check.py` cuts |
| Every text line animates in (by word, line or typing); none is just static | | 14 of 14 with text | coding sheet |
| Short lines | 5 words per line at most (4 to 12); 6 or fewer | 10 of 14 | coding sheet |
| UI parts are the hero (a button, field, card, menu, chip, chart), not a whole screen | | 13 of 15 | coding sheet |
| UI floats free of any device frame | | 10 of 15 (variant A 8 of 9) | coding sheet |
| A cursor presses UI at least once; when there is a pointer it is a cursor, not a finger | median 1 press (0 to 7) | 9 of 15; cursor 9 of 9 | coding sheet |
| A virtual camera moves (drift, push, 3D tilt) | | 13 of 15 | coding sheet |
| The film ends on the logo centred on a plain ground (solid or soft gradient) | end card 3.5 s (1.8 to 6.3) | 13 of 15 | coding sheet; `genre_check.py` end card |
| The brand also appears before the end card | first brand mark at 7 s (0 to 34) | 9 of 15 | coding sheet |
| Music 100 to 125 BPM | median 114 BPM | 7 of 10 with a readable tempo | `sound_map.py` (tempo confidence 0.3 or more), `analyze.py` |
| Sound effects are dense, but placed on events, not on every move | sound map hears 36 effects per minute (2 to 137); 10 or more | 11 of 15 | `sound_map.py` |
| Loudness | -14.2 LUFS (-24.7 to -10.0); -16 to -12 | 10 of 15 | `sound_map.py` |
| Length | 34 s (10 to 67); 20 to 60 s | 10 of 15 | duration |

## Options (30 to 59 percent; the variant decides)

| Option | Held | Variant A | Variant B | Use when |
|---|---|---|---|---|
| Words build one by one (word by word) | 8 of 14 | 7 of 8 | 1 of 6 | variant A; a voice-free film where the words carry the story |
| One accent colour marks the key or the newest word of a line | 7 of 14 (20 percent of lines or more: 6) | 7 of 8 | 0 of 6 | variant A; the accent is one brand colour, used on one word per line at most |
| Carried transitions (morph, scale-through, push, camera through) are 40 percent or more of all transitions | 8 of 14 | 6 of 8 | 2 of 6 | variant A; variant B cuts more (hard cuts about half of all transitions) |
| UI in 3D depth (tilted planes, parallax, depth of field) | 9 of 15 | 7 of 9 | 2 of 6 | when the product's UI is flat enough to read when tilted |
| Typing inside a real input field | 7 of 15 | | | when the product's job starts from typed input |
| End card carries a tagline | 5 of 13 | | | when the brand has an official line |
| Hook opens on UI in motion or bold text | 8 of 15 | | | the others open on a person, a logo or a scene; all open with motion |

Pick the variant at 02 from the brief and the brand's own films: a brand whose recent official films are calm and
line-led stays in B; a promo for a tool, an app feature or a social feed leans A. Log the choice in `ice/DIRECTION.md`.

## Measured and rejected

These were hypotheses from the founder's own viewing (2026-10-31). They were measured and did not hold as stated, so
they are not rules; do not add them back from memory.

| Hypothesis | Measured |
|---|---|
| The whole scene changes every 2.5 to 3 s | 2 of 9 of the founder's films and 5 of 15 overall sit in 2.5 to 3.0 s; the counted scene median is 2.0 s in his set and 2.5 s overall (1.7 to 4.5). Rule kept: scenes of 2 to 4 s. |
| Text appears word by word (as the genre default) | 8 of 14 films with text (7 of 8 in variant A, 1 of 6 in variant B). It is variant A's convention, not the genre's. |
| One important word in a different colour in every line | 7 of 14 films use colour emphasis at all, and only on 7 percent of lines at the median. Kept as variant A's option. |
| Music 120 to 126 BPM | 1 of 10 films with a readable tempo (median 114, range 101 to 160). Kept: 100 to 125 BPM, 7 of 10. |
| A small click on every move | sounds land on moves no more often than chance in 13 of 15 films (`move_onset_lift` median 1.03; 1.2 or more in 2). Effects are dense (median 36 per minute) but sit on presses, landings and reveals. The general rule "never under every motion" stays. |

## Coding sheet

What pixels cannot read is coded by a fresh reviewer (never the builder) from 12 fps strips of the render
(`ice-remake/scripts/clip_strip.py`), into `ice/review/genre-coding.json`, with the same fields the corpus was coded
with:

- `text`: `dominant_reveal` (word_by_word, line, letter, typed, static or none), `lines_total`,
  `lines_with_emphasis_colour` (a word or phrase in a colour different from the rest of its line), `max_words_per_line`.
  Text lines are the film's headline and body copy only: UI labels, bracketed or subtitle captions and end card lines
  are not counted (the end card is coded in `end_card`), and `dominant_reveal` is the most frequent mode over the
  counted lines, so two coders of the same film agree.
- `hero`: `ui_parts_hero` (true when UI parts, not whole screens, carry the shots), `device_frame` (none, phone,
  laptop, browser-window, mixed).
- `interaction`: `presses` (a pointer touching a part, or the part reacting as pressed under it), `pointer`
  (cursor, finger, none, both; any pointer shown, even one that only rides along), `typing_in_field`.
- `transitions`: counts of `hard_cut`, `morph_or_match`, `scale_through`, `push_or_slide`, `camera_move_through`,
  `dissolve`, `other`.
- `end_card`: `start_s` (when the end card appears; the event gaps stop there), `logo_position` (center, left, other,
  none), `background` (plain-solid, plain-gradient, ui, footage, none), `length_s`, `tagline`.
- `scenes`: one row per scene a viewer would count (`start`, `end`, `hero`).

## Fingerprint

`genre_check.py check --genre ui-motion --video <render> --coding ice/review/genre-coding.json` (the `ice-qa` skill)
runs at gate D on every draft of a film of this genre that follows no reference, and its numbers go into the delivery
report. A red key is fixed in the film (more UI acts in a long gap, a tighter first 3 s, a centred plain end card), never
by padding with idle motion; a key the user, a reference or the chosen style sets differently is lifted by its
exemption row and passed as `--exempt <key>=<source>`. Keys marked `-` are reported for the critic, not gated. A film
that follows a reference (a remake) runs the same check with `--reference-measures <reference measures>` and
`--reference-coding <reference coding sheet>`: each gated key and `presses` is held to the reference's own value
(within 30 percent, as the pacing gate), and the genre line's light is printed beside it.

The longest gap is measured on the body: with a coding sheet the event list stops at `end_card.start_s`, so the held
end card is judged by the end card keys (measured that way the corpus body gaps run 0.84 to 6.17 s). `pointer_presses`
is a house rule the corpus confirms: every one of the 9 films that shows a pointer presses with it at least once (the
6 others show none), so a pointer that only rides along while UI parts change on their own fails, and no allowed miss
lifts it (the cause of every UI change is visible: `film-types/ui-walkthrough.md`, the clarity gate).

Calibration: only keys that 13 or more of the 15 corpus films hold are gated, at bounds that cover the corpus, and one
gated key may miss (`misses_allowed 1`, printed yellow with a sentence in the delivery report). On its own corpus the
line passes 13 of 15 films; the two it flags are the 10 s icon loop with no text and no end card, and the calm dark
launch film with 0.43 events per second. Conventions held by 60 to 86 percent (a busy first 3 s, at most 2.5 hard cuts
per 10 s, presses, depth) are craft targets for the storyboard and the critic, reported by the check, never gated.

Genre fingerprint: events_per_s >=1.0; median_event_gap_s <=0.6; max_event_gap_s <=6.2; scene_median_s 0.8-6.2; text_reveal word_by_word|line|typed|letter; ui_hero true; end_logo center; end_background plain-solid|plain-gradient; pointer_presses >=1; misses_allowed 1; hook_events_3s -; cuts_per_10s -; end_center_dx -; presses -; emphasis_share -; hard_cut_share -; sfx_per_min -; move_onset_lift -; end_bg_std -.

## Rules this genre replaces

Each general rule stays the house default for every other film; its own file names this genre as the exception.

| General rule | Where | In this genre |
|---|---|---|
| SFX density ceiling of about 15 events per minute | `ice-audio/references/sfx.md` section 4 | 10 or more effects per minute, median 36, on presses, landings, morph hits and reveals; still never one under every motion (section 1 item 4 holds) |
| A logo only at the end is a wasted sticker | `launch-principles.md` section 6 | the centred logo on a plain ground is the genre's close (13 of 15); giving the logo an earlier job stays a good idea (9 of 15 show the brand earlier) |
| End on an action, not a centred card; logo and CTA centred only when the brief asks | `openers-and-endings.md` section 6 | a centred logo end card of 2 to 6 s (median 3.5) on a plain ground is the measured close; the end hold rows still apply |
| One emphasis word per headline carries the accent | `film-types/product-launch.md` Text density | variant A's option, not a default: 0 of 6 brand launch films colour a word |
| Music near 120 BPM for one-shape UI films | `film-types/product-launch.md` Structure options | 100 to 125 BPM, median 114 |

Sources: measured on the corpus above with `ice-remake/scripts/analyze.py`, `frames.py` and `clip_strip.py`,
`ice-audio/scripts/sound_map.py`, `ice-qa/scripts/film_gate.py` and `genre_check.py`; coded with the coding sheet above.
