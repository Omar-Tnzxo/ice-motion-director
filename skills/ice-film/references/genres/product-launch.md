# Genre playbook: product launch without screens

Measured, not collected: 15 official launch films of physical products (earbuds, headphones, phones shown as objects,
a watch, glasses, a mouse, a car, sneakers, a power tool battery, a fragrance, a lip oil, home machines, a drink) were
measured with this plugin's own tools on 2026-10-31. Every number below is the corpus median and range, with how many
films hold it. A pattern in 60 percent or more of the films is a convention; 30 to 59 percent is an option; under that
it is not a rule. Read this file with the film type file; the type file decides structure, truth and deliverables,
this file gives the genre's measured grammar and the fingerprint the render is checked against.

## Scope

- Film types that point here: `product-launch` (a product without screens, or a device shown as an object), and
  `hype-promo` when its subject is a physical product. Use it whenever the physical product itself is the main material
  of a launch, hero or reveal film, 15 to 90 s.
- Not for: a product whose interface is the main material (`ui-motion.md`), a brand film about values with the product
  in passing (`brand-film`), a talking-head or review edit (ice-edit), a teaching explainer (ice-explainer), a
  motion graphics teaser with no product footage or render (the hype-promo type file keeps its own rules).
- A device with a screen (phone, watch) belongs here when the film shows it as an object (material, shape, colour,
  camera, wear); when the film walks its interface, use `ui-motion.md`.
- Precedence: the user's words, a reference the film follows (its own measures win, `ice-remake`), and a chosen style
  outrank this file, through exemption rows lifting `genre:<key>` (the `ice-direction` skill, `references/treatment.md`
  section "Craft plan"). This file outranks the house defaults it names in "Rules this genre replaces".

## Corpus

15 films, 15 to 87 s (median 37.5 s), all 16:9 (official channels post launch films horizontally). 14 brand uploads and
1 studio upload. Sources and why each was chosen are kept in the maintainers' research folder
(`research/genre-playbooks/product-launch/corpus/SOURCES.md`, outside this repo). Two variants showed up and are measured
apart where they differ:

| Variant | Films | What marks it |
|---|---|---|
| A. Object film | 11 (rendered or studio product shots carry it, often cut with a few in-use shots) | the product on a built ground (dark in 6 of 11), turntables, macro details, light sweeps, dissolves allowed, a closing packshot |
| B. In-use film | 4 (people using the product in the world carry it) | faster cuts (5.5 hard cuts per 10 s against 3.1), no studio ground, no dissolves, the product in use by second 0, a tagline at the end |

## Conventions (60 percent or more)

| Convention | Number (median, range) | Held | How it is measured |
|---|---|---|---|
| Something new about every third of a second | 1.96 visual events per s (1.24 to 2.75); median gap 0.33 s (0.33 to 0.67) | 15 of 15 | `genre_check.py measure` events |
| No long dead stretch | longest gap without an event 2.6 s (1.0 to 5.0); 3 s or less in 9 of 15 | 15 of 15 at 5 s | same |
| Busy first 3 seconds, moving at once | 5 events in the first 3 s (2 to 10); 4 or more in 14 of 15; the first change by 0.5 s in 10 of 15 (median 0.28 s) | 14 of 15 | same; coding sheet hook |
| Short scenes | a scene a viewer counts lasts 1.6 s at the median (0.85 to 2.3); about 18 scenes per 30 s (12 to 29) | 15 of 15 at 2.3 s or less | coding sheet scenes |
| The frame changes about every 1.2 s | median whole-frame change 1.17 s (0.83 to 1.75) | 15 of 15 | `genre_check.py` scene changes |
| Hard cuts carry the film | 3.5 hard cuts per 10 s (1.3 to 11); hard cuts are 62 percent of the seams (33 to 100); carried seams (morph, scale-through, push, camera through) only 8 percent at the median, never 40 percent | 15 of 15 at a third of the seams or more | `genre_check.py` cuts; coding sheet transitions |
| The product is seen by second 4 | first product frame at 0.17 s (0 to 14.4) | 11 of 15 | coding sheet `product.first_product_s` |
| The hook is the product itself, whole or in part | | 10 of 15 (variant B 4 of 4) | coding sheet hook |
| Macro detail shots: a material, seam, button or part fills the frame | 2 per film (0 to 12); macro and close shots are 60 percent of all shots (14 to 100) | 12 of 15; close half or more in 10 of 15 | coding sheet |
| The product in use by a person | 2 shots (0 to 22) | 10 of 15 (variant B 4 of 4, A 6 of 11) | coding sheet |
| A turntable or orbit around the product | 1 shot (0 to 4); two or more in 6 of 15 | 10 of 15 | coding sheet |
| A light sweep travels across the product | 1 shot (0 to 6) | 10 of 15 (variant A 9 of 11) | coding sheet |
| Two or more colourways shown | 2 (1 to 8) | 8 of 13 that show one product | coding sheet |
| Rendered studio shots carry or share the film | | 11 of 15 (cgi-studio or mixed); in-use shots carry or share it in 10 of 15 | coding sheet `product.hero_shot_kind` |
| The camera moves | | 11 of 15 | coding sheet |
| No voice: music and effects only | | 10 of 15 | coding sheet `voice` |
| Short on-screen text | some text in 14 of 15; at most 6 words per line (median 5.5) | 9 of 14 | coding sheet |
| The product name appears as text | at 2.1 s (0 to 81) | 10 of 15 | coding sheet |
| Closing packshot: the product is on screen in the closing beat, with or just before the brand mark | | 11 of 15 | coding sheet `end_card.product_in_close` |
| The brand mark lands centred | end card 3.9 s (1.2 to 5.5); 1.5 s or longer in 12 of 14; on a plain ground in 9 of 15 | 10 of 15 | coding sheet |
| The brand also appears before the end card | first brand mark at 0 s (0 to 71) | 10 of 15 | coding sheet |
| Sound effects are dense | the sound map hears 42 effects per minute (14 to 128); 10 or more | 15 of 15 | `sound_map.py` |
| Music 95 to 140 BPM | median 121 BPM (87 to 159) | 10 of 12 with a readable tempo | `sound_map.py` (tempo confidence 0.3 or more) |
| Loudness | -13.1 LUFS (-17.9 to -7.4); -16 to -12 in 8 of 15; louder than -11 in 4 | 15 of 15 in -18 to -7 | `sound_map.py` |
| Length | 37.5 s (15 to 87); 20 to 90 s | 13 of 15 | duration |

## Options (30 to 59 percent; the variant decides)

| Option | Held | Variant A | Variant B | Use when |
|---|---|---|---|---|
| Dissolves between product shots | 6 of 15 | 6 of 11 | 0 of 4 | light-led object reveals (a product appearing out of dark, finish to finish); never two copies of one thing, never in the in-use variant |
| Dark studio ground | 6 of 15 | 6 of 11 | 0 of 4 | premium, metal, glass, light-led products; a light or coloured ground in the others |
| Silhouette reveal (first seen partly hidden in dark, shadow or a crop) | 6 of 15 | 5 of 11 | 1 of 4 | an object film whose first beat is the reveal |
| On-screen numbers or specs | 7 of 15 (median 1, up to 11) | 7 of 11 | 0 of 4 | the product has one or a few approved numbers; one per 10 s is rare (2 of 15) |
| The product on screen 60 percent of the runtime or more | 8 of 15 (median 0.6) | 6 of 11 | 2 of 4 | object films; in-use films share the frame with people |
| Three or more macro details | 7 of 15 | 5 of 11 | 2 of 4 | material and craft are the claim |
| Text lines appear whole (cut in or fade), not built word by word | 7 of 14 | 5 of 11 | 2 of 3 | a calm object film; the others rise or build per line (7 of 14) |
| End card carries a tagline | 8 of 14 | 5 of 11 | 3 of 3 | the brand has an official line |
| A device's own screen shown working | 7 of 15 | 3 of 11 | 4 of 4 | the screen is a feature, not the film |
| Slow motion or a speed ramp | 5 of 14 | 3 of 10 | 2 of 4 | action, sport, liquid |
| A voice (spoken line or dialogue) | 5 of 15 | | | a narrated launch keeps the type file's narrated rules |
| Sounds placed on moves above chance (`move_onset_lift` 1.2 or more) | 5 of 15 (median lift 1.14) | 4 of 11 | 1 of 4 | impacts and whooshes on product moves; most films stay near chance |
| Music 115 to 140 BPM | 6 of 12 | 4 of 8 | 2 of 4 | energetic cuts; the full measured band is 95 to 140 |

Pick the variant at 02 from the brief and the brand's own recent launch films: a product sold on material, finish and
engineering leans A; a product sold on what it lets people do (sport, travel, wear, drive) leans B; most films mix a
few in-use shots into A. Log the choice in `ice/DIRECTION.md`.

## Measured and rejected

These were measured and did not hold as stated, so they are not rules for this genre; do not add them back from memory.

| Hypothesis | Measured |
|---|---|
| Scenes change every 2.5 to 3 s (the founder's UI motion note, re-tested here) | 0 of 15; the counted scene median is 1.6 s (0.85 to 2.3). Scenes of 2 to 4 s (the UI motion convention) hold in 3 of 15. |
| Music 120 to 126 BPM (the founder's UI motion note, re-tested here) | 2 of 12 with a readable tempo; the median is 121, but the band is wide (87 to 159). |
| A sound on every move | 5 of 15 place sounds on moves above chance; median lift 1.14. Effects are dense (median 42 per minute) and land on impacts, cuts and reveals. |
| Carried transitions as the norm (morph, scale-through, push, camera through at 40 percent or more of seams) | 0 of 15; median 8 percent. Hard cuts carry this genre. |
| Few hard cuts (2.5 or fewer per 10 s, the UI motion bound) | 4 of 15; median 3.5. |
| One proof per 8 to 10 s as on-screen numbers | 2 of 15 show one number per 10 s; 8 of 15 show none. Proof here is the product seen working and in close detail. |
| Exploded or x-ray views | 4 of 15. A strong move when the inside is the claim; not the genre's habit. |
| One emphasis word per line in an accent colour | 2 of 14 films with text. |
| A closing offer (price, date, availability or URL) | 2 of 15. Launch films close on the product and the mark; the offer lives in the post and the cutdowns. |

## Coding sheet

What pixels cannot read is coded by a fresh reviewer (never the builder) from 12 fps strips of the render
(`ice-remake/scripts/clip_strip.py`), into `ice/review/genre-coding.json`, with the same fields the corpus was coded
with: the shared fields of `ui-motion.md` (Coding sheet) plus these.

- `hook_0_3s.kind`: `product-hero` when the first 3 s show the product itself, whole or in part.
- `transitions`: counts of `hard_cut`, `morph_or_match`, `scale_through`, `push_or_slide`, `camera_move_through`,
  `dissolve`, `other` (flash, glitch, whip blur).
- `end_card`: `logo_position`, `background`, `length_s`, `tagline`, and `product_in_close` (true when the product is on
  screen in the closing beat, with or just before the brand mark).
- `product`: `hero_shot_kind` (cgi-studio, live-action-studio, live-action-in-use, mixed when two each take 30 percent
  or more), `first_product_s`, `product_on_screen_share` (0.0 to 1.0), `ground` (dark, light, coloured-solid,
  environment, mixed), `turntable_or_orbit`, `macro_detail`, `light_sweep`, `in_use_people` (shot counts),
  `exploded_or_xray`, `silhouette_reveal`, `screen_ui_shown` (true or false), `colourways_shown`, `spec_callouts`
  (each on-screen number or spec once), `name_reveal_s` (first time the product name is text, null if never),
  `close_offer` (none, price, date, availability, url, mixed).
- `shot_scales`: shot counts for `macro` (a detail fills the frame), `close` (the whole product fills most of it),
  `medium`, `wide`.
- `speed_ramps` (shot count) and `voice` (none, spoken, sung).

## Fingerprint

`genre_check.py check --genre product-launch --video <render> --coding ice/review/genre-coding.json` (the `ice-qa`
skill) runs at gate D on every draft of a film of this genre that follows no reference, and its numbers go into the
delivery report. A red key is fixed in the film (more product acts in a long gap, a tighter first 3 s, shorter scenes,
cuts instead of slow carried moves), never by padding with idle motion; a key the user, a reference or the chosen style
sets differently is lifted by its exemption row and passed as `--exempt <key>=<source>`. Keys marked `-` are reported
for the critic, not gated.

Calibration: only keys that 13 or more of the 15 corpus films hold are gated, at bounds that cover the corpus, and one
gated key may miss (`misses_allowed 1`, printed yellow with a sentence in the delivery report). On its own corpus the
line passes 15 of 15 films. The end card pixel keys are reported only: official uploads end on several seconds of black
(space for the platform's end screen) in 3 of 15, so the last second of an upload is not the end card. Conventions held
by 60 to 80 percent (the product by second 4, macro detail, in use, the closing packshot, the centred mark) are craft
targets for the storyboard and the critic, reported by the check, never gated. The line is a pace check: it flags 8 of
the 15 UI motion corpus films, but a fast cut UI film can pass it, so the reviewer's sheet (`hero_shot_kind`,
`product_first_s`, `end_product`) and the critic confirm that the product is the hero.

Genre fingerprint: events_per_s >=1.2; median_event_gap_s <=0.7; max_event_gap_s <=5.0; scene_median_s 0.8-1.8; hook_events_3s >=2; cuts_per_10s >=1.3; hard_cut_share >=0.33; misses_allowed 1; product_first_s -; end_product -; end_logo -; end_background -; hero_shot_kind -; ground -; text_reveal -; emphasis_share -; sfx_per_min -; move_onset_lift -; end_center_dx -; end_bg_std -.

## Rules this genre replaces

Each general rule stays the house default for every other film; its own file names this genre as the exception.

| General rule | Where | In this genre |
|---|---|---|
| Crossfades and dissolves banned between scenes in product launches | `ice-motion/references/transition-policy.md` section 3; `film-types/product-launch.md` Transition policy | an option of the object film (6 of 11), for light-led reveals; still never two copies of one thing; the in-use film keeps the ban (0 of 4) |
| A light sweep over chrome is refused as a default | `ice-motion/references/transition-policy.md` section 6 | a light sweep across the product is a convention (10 of 15; variant A 9 of 11), one per film at the median; it still needs a light source that belongs to the shot |
| SFX density ceiling of about 15 events per minute | `ice-audio/references/sfx.md` section 4 | 10 or more effects per minute, median 42 in 15 films, on impacts, cuts and reveals; still never one under every motion |
| End on an action, not a centred card; logo and CTA centred only when the brief asks | `openers-and-endings.md` section 6 | the close is a packshot with or just before the brand mark (11 of 15), the mark centred in 10 of 15, the closing beat 1.2 to 5.5 s (median 3.9); the end hold rows still apply to the landed lockup |
| A logo only at the end is a wasted sticker | `launch-principles.md` section 6 | the centred closing mark is the genre's close; showing the brand earlier stays a good idea (10 of 15) |
| Compositions 12 to 15 per 30 s for energetic edits | `film-types/product-launch.md` Rhythm ranges | about 18 scenes per 30 s (12 to 29), a scene a viewer counts lasting 1.6 s at the median |
| About one proof per 8 to 10 s | `film-types/product-launch.md` Rhythm ranges | proof is the product working and in macro detail; on-screen numbers are an option (7 of 15), never a rate |
| One emphasis word per headline carries the accent | `film-types/product-launch.md` Text density | not a default: 2 of 14 films with text colour a word |
| Beat-grid hype at usually 120 to 140 BPM; a hard cut only on a downbeat, at most twice | `film-types/hype-promo.md` Structure options and Transition policy | a hype cut of a physical product follows this playbook: 95 to 140 BPM (median 121), hard cuts carry most seams (3.5 per 10 s) |

Sources: measured on the corpus above with `ice-audio/scripts/sound_map.py`, `ice-qa/scripts/film_gate.py` and
`genre_check.py`, and `ice-remake/scripts/clip_strip.py` strips; coded with the coding sheet above.
