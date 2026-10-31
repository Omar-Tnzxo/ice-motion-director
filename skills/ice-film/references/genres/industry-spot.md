# Genre playbook: industry spot

Measured, not collected: 15 industrial, B2B and corporate spots (energy, logistics, construction and heavy equipment,
manufacturing and automation, electrical engineering, real estate developers), from the companies' own channels or
the studio that made them, were measured with this plugin's own tools on 2026-10-31. Every number below is the corpus
median and range, with how many films hold it. A pattern in 60 percent or more of the films is a convention; 30 to 59
percent is an option; under that it is not a rule. Read this file with the film type file; the type file decides
structure, truth and deliverables, this file gives the genre's measured grammar and the fingerprint the render is
checked against.

## Scope

- Film type that points here: `industry-spot`, its B2B and corporate variant: a spot for an industrial, energy,
  logistics, engineering, construction or manufacturing company, or a real estate developer, 45 s to 3 min, made of
  footage, 3D process, product or site animation and motion graphics, sold to buyers, partners, governments or
  investors (a corporate film, a capability film, an operations or annual film, a project or development film).
- Not for: the 15 to 40 s local business commercial of the same type (restaurant, clinic, shop, a single listing),
  which keeps the type file's own rules (not measured here); a consumer brand anthem with no capability shown
  (`brand-film.md`); a narrated explainer of how one thing works (`explainer.md`); a chart-led film (`data-story.md`).
- Precedence: the user's words, a reference the film follows (its own measures win, `ice-remake`), and a chosen style
  outrank this file, through exemption rows lifting `genre:<key>` (the `ice-direction` skill, `references/treatment.md`
  section "Craft plan"). This file outranks the house defaults it names in "Rules this genre replaces". Truth and
  safety rules are never outranked: renders labelled as renders, protective gear on people in hazard shots, claims held
  for their reading time (section "Measured and not adopted").

## Corpus

15 films, 60 to 187 s (median 104 s), all 16:9: energy (5: two national oil companies, a petrochemicals major, a
renewables developer, a grid engineering firm), logistics (2), construction and heavy equipment (3), factory
automation (1), an engineering product launch (1), electrical cables and infrastructure (1), real estate developers
(2). 8 from the Arabic and Gulf market (Saudi Arabia, the UAE, Egypt). Sources and why each was chosen are kept in the
maintainers' research folder (`research/genre-playbooks/industry-spot/corpus/SOURCES.md`, outside this repo). Two
variants showed up; pick one at 02 from the material the film will be made of:

| Variant | Films | What marks it |
|---|---|---|
| A. Footage-led spot | 13 (live footage and archive 60 percent of the runtime or more) | footage 82 percent (65 to 95), 3D 6 percent (0 to 20) as inserts (a globe, a network, a plant cutaway), counted shot 1.2 s (0.9 to 1.4), 8 counted shots per 10 s, hard cuts 81 percent of transitions |
| B. 3D-led spot | 2 (3D animation 25 percent or more: an engineering product launch, a mega development) | 3D 33 and 50 percent, footage 45 to 48 percent; the product launch cuts slowly (counted shot 3.5 s, 1.3 cuts per 10 s, a 14 s 3D hold), the development film cuts like variant A (1.1 s) |

## Conventions (60 percent or more)

| Convention | Number (median, range) | Held | How it is measured |
|---|---|---|---|
| Something new about every 0.4 s | median gap between visual events 0.42 s (0.33 to 0.50); 1.80 events per s (1.45 to 2.30) | 15 of 15 | `genre_check.py measure` events |
| No long dead stretch | longest gap without an event 3.67 s (1.67 to 6.17) | 6 s or less 14 of 15; 8 s or less 15 of 15 | same |
| Whole-frame change about every second | pixel scene median 1.08 s (0.83 to 1.33) | 15 of 15 | `genre_check.py` scene changes |
| Cut, many shots | 7.3 hard cuts per 10 s by the pixel detector (1.3 to 13.1); 7.6 counted shots per 10 s (2.2 to 9.5); counted shot median 1.2 s (0.9 to 3.5) | 2 or more cuts per 10 s 14 of 15; 4 or more shots per 10 s 14 of 15; shot median 2.5 s or less 14 of 15 | `genre_check.py` cuts; coding sheet `ind.shots_counted`, `ind.shot_len` |
| Hard cuts carry the film, a few dissolves | hard cuts 81 percent of transitions (33 to 97); 6 dissolves (0 to 11) | 60 percent or more 13 of 15; 2 or more dissolves 12 of 15 | coding sheet transitions |
| Lengths vary; one or two long holds | coefficient of variation of scene lengths 0.55 (0.32 to 0.80); longest counted hold 5.9 s (2.2 to 14.3) | variation 15 of 15; hold 8 s or less 12 of 15 | `genre_check.py` scenes; coding sheet `ind.longest_hold_s` |
| A voice carries the film | voiceover (5) or voiceover plus supers (8); speech over 88 percent of the runtime (0 to 97) | 13 of 15 (one dialogue comedy, one supers-only) | coding sheet `ind.carrier`; a transcript of the render |
| Real footage carries the film, mixed with 3D or graphics | live footage plus archive 82 percent (45 to 95); at least two of footage, 3D and 2D graphics at 5 percent or more | footage 60 percent or more 13 of 15 (40 percent or more 15 of 15); mixed 14 of 15 | coding sheet `ind.material_share` |
| 3D animation as inserts | 3D 6 percent of the runtime (0 to 50): a globe or network (5), a site or building (4), a product (2) | 5 percent or more 10 of 15 (25 percent or more 2 of 15) | coding sheet `ind.material_share.cg_3d`, `ind.cg_3d_kind` |
| Capability is the proof | what the company can do or has (assets, technology, scale, people) shown | 15 of 15 (a named problem 4 of 15, a concrete result 5 of 15, the full problem-capability-result arc 1 of 15) | coding sheet `ind.proof` |
| Scale from the air | 6 aerial or drone shots (0 to 30); aerial plus wide shots 20 percent of the runtime (0 to 50) | 3 or more aerial shots 10 of 15; 20 percent or more 9 of 15; a scale shot in the first 10 s 9 of 15 | coding sheet `ind.scale_shots` |
| People at work, in protective gear | people on screen 45 percent of the runtime (12 to 97); 10 worker or engineer shots (0 to 28) | 30 percent or more 12 of 15; 3 or more worker shots 12 of 15; gear on all or most people in hazard shots 10 of 12 (all 1 of 12) | coding sheet `ind.people` |
| The company shows early; a logo before the end | identifiable at 12 percent of the runtime (1 to 96); first logo at 21.6 s (0.3 to 101) | by 25 percent 10 of 15; logo before the end card 13 of 15 | coding sheet `ind.brand_first`, `ind.logo_first_s` |
| A busy opening, not a logo | 6 events in the first 3 s (2 to 9); the hook is a place, a person, the planet or the work | 4 or more events 12 of 15; not a logo 12 of 15 | `genre_check.py`; coding sheet `hook_0_3s` |
| One music track under the whole film, resolving on the logo | music 15 of 15; resolves on the logo 13 of 15 (builds to a peak 7 of 15, an option) | 13 of 15 | coding sheet `ind.music` |
| No sound on every move | `move_onset_lift` 0.95 (0.76 to 1.08) | under 1.2 15 of 15 | `genre_check.py` |
| Claims short, few figures | on-screen claims in 9 of 15; 5 words per claim (3 to 10), 8 or fewer in 8 of 9; figures in only 4 of 15 | 6 words or fewer 6 of 9 | coding sheet `ind.claims` |
| The film ends on the logo centred on a plain ground, with its tagline | centred 15 of 15; plain ground 14 of 15; logo plus tagline 11 of 15 (logo only 4); card 4.5 s (1.4 to 10.3), 2 to 8 s 13 of 15 | 15 of 15 | coding sheet `end_card`, `ind.ending` |
| No call to action | no URL, phone, "contact us" or offer on the end card | 15 of 15 | coding sheet `ind.ending.cta` |
| Loudness | -14.3 LUFS (-21.1 to -9.9) | -16 to -12 in 10 of 15 | `sound_map.py` |
| Length | 104 s (60 to 187) | 45 s to 3 min 14 of 15 | duration |

## Options (30 to 59 percent; the brief and the variant decide)

| Option | Held | Use when |
|---|---|---|
| A process or product shown working step by step | 8 of 15 | operations, manufacturing and product films; the process in 3D when the camera cannot see inside |
| An object or movement carried across a cut | 6 of 15 (2 or more) | 3D-led films and graphic chapter turns |
| A map or globe of the company's reach | 4 of 15 | global footprint, logistics routes, export markets (`ice-engines/references/maps-geo.md`) |
| Figures on screen | 4 of 15 (one corporate film carries 20) | annual and capability films; each figure held for its reading time |
| A concrete result for a customer, a country or the planet | 5 of 15 | the brief has a verified outcome; it is the strongest proof when it exists |
| A named problem or need before the capability | 4 of 15 | sales spots (why choose us) and comedy spots |
| The music builds to a peak | 7 of 15 | anthem films; steady scores carry operations films |
| The camera moves in most shots | 8 of 15 (camera moving in 60 percent of shots, median) | drone glides, sliders and 3D camera moves; locked shots for people and machines at work |
| Frame 0 a finished composition (no fade from black) | 9 of 15 | the house default; a fade from black opens 6 of 15 |
| Supers that add facts beside the voice | 8 of 15 (carrier both) | capacities, places, years and names the voice does not say |

## Measured and rejected

These ideas were tested on the corpus and did not hold for this genre; they are not rules for it. Do not add them back
from memory.

| Idea | Held | What the corpus does instead |
|---|---|---|
| A 15 to 40 s commercial | 0 of 15 | 60 to 187 s, median 104 s; the short commercial is the type's other variant |
| 12 to 15 compositions per 30 s (4 to 5 shots per 10 s) | 0 of 15 | 7.6 counted shots per 10 s, 4 or more in 14 of 15 |
| Beats of 1.4 to 3.5 s | 3 of 15 (counted shot median inside) | counted shot 1.2 s, 2.5 s or less in 14 of 15 |
| Longest gap between events 3.5 s | 6 of 15 (pixel events); 4 of 15 (`film_gate.py`) | 3.67 s at the median, 6 s or less in 14 of 15 |
| Objects handed across scenes at exact coordinates | 6 of 15 | hard cuts (81 percent) and a few dissolves; carried transitions are an option |
| No hold over 0.6 s except the CTA (energetic); 1.2 s (calm) | 1 of 15; 3 of 15 (`film_gate.py` longest still) | longest still 2.67 s at the median, 6.2 s or less in 14 of 15 |
| Frozen time at most about 1 s per 30 s | 7 of 15 (still ratio 0.034 or less) | still ratio 0.04 (0 to 0.17), 0.15 or less in 14 of 15 |
| A CTA with an action on the end card | 0 of 15 | the logo and its tagline; the brief's channel (a site, a sales team) carries the action |
| Proof beats promise: a concrete result shown | 5 of 15 | capability shown (15 of 15) is the proof; a result is the option above |
| A map story with real travel times | 4 of 15 (maps of reach, never travel times) | an option for reach; travel times belong to the local real estate commercial |
| Gentle -16 LUFS | 5 of 15 | median -14.3 LUFS |
| A scene ceiling of 5 s | 6 of 15 | one or two holds of 6 to 8 s (8 s or less 12 of 15) on a scale shot or a 3D reveal |

## Measured and not adopted

The corpus does these, Ice does not: truth and reading rules outrank the genre.

| Corpus habit | Held | Ice keeps |
|---|---|---|
| Renders of unbuilt buildings, cities and plants shown with no label | 0 of 5 films with such renders label them | every render of something not built carries "Render" or "Artist impression" on screen (`../film-types/industry-spot.md` Truth and content; the `ice-assets` skill, `references/truth-sheet.md`) |
| Claims held shorter than their reading time | claim hold 1.8 s at the median (0.8 to 2.6), shortest 1.2 s (0.5 to 2.6); 1.5 s or more for every claim in 3 of 9 | each claim and figure held for its reading time (the `ice-type` skill, `references/reading-time.md` section 1); fewer claims, not shorter holds |
| Some people in hazard shots without protective gear | gear on all of them in 1 of 12 (most 9, some 2) | every person in a hazard shot wears the site's gear (helmet, vest, glasses, gloves), generated or filmed |

## Coding sheet

The reviewer fills the shared sheet of every genre (text, hero, transitions, camera, end card, brand presence), then
the `ind` block below, from the frames and a transcript of the render. A field that cannot be read is `null` with a
note. Times in seconds.

| Field | What to write |
|---|---|
| `ind.carrier` | `voice` (voiceover or interviews), `supers` (on-screen lines, no voice), `both` (a voice plus supers that add to it), `sung`, `dialogue`, `none`; subtitles of the voice count as `voice` |
| `ind.voice` | `kind` (voiceover, interview, both, none), `share_of_runtime` (0 to 1, from the transcript), `first_word_s`, `language` |
| `ind.material_share` | `live_footage`, `cg_3d` (3D process, product, site or network), `motion_graphics` (2D graphics, type on plain ground, flat maps, charts), `screens_or_ui`, `archive` (sum about 1); a 2D overlay on footage counts as footage |
| `ind.cg_3d_kind`, `ind.renders_labelled` | the main thing the 3D shows (process, product, site or building, network or globe, none); whether renders of unbuilt things carry a label (true, false, null when none) |
| `ind.claims` | `count`, `numbers` (claims with a figure), `first_s`, `hold_median_s` and `hold_min_s` (fully in to starting out), `words_median`, `kinds`, `style` (counter, static figure, figure with label, lower third); the end card is not a claim |
| `ind.scale_shots` | `aerial_or_drone`, `wide_establishing`, `share_of_runtime`, `first_s` |
| `ind.people` | `share_of_runtime`, `workers_shots`, `ppe_in_hazard` (all, most, some, none, n/a), `roles`, `talking_heads` |
| `ind.process_shown`, `ind.map_or_globe` | a stretch that shows how something works or is made; a map or globe of reach |
| `ind.proof` | `problem`, `capability`, `result` (true or false), their `order`, and `structure` (capability showcase, problem-capability-result, scale montage, vision of the future, process walkthrough, testimony) |
| `ind.shots_counted`, `ind.shot_len`, `ind.longest_hold_s`, `ind.camera_moving_share` | shots a viewer counts, by eye on the strips; a slow move inside one shot is one shot |
| `ind.brand_first`, `ind.logo_first_s` | the first moment the viewer can tell the company, and its first logo (on a helmet, a truck or a building counts) |
| `ind.music` | `kind`, `arc` (build-to-peak, steady, quiet-loud-quiet, drop-and-swell), `resolves_on_logo` |
| `ind.ending` | `line_before_logo`, `end_card_kind` (logo only, logo plus tagline, logo plus URL, logo plus CTA, logo plus contacts), `cta`, `cta_kind`, `cta_hold_s` |

## Fingerprint

`genre_check.py check --genre industry-spot --video <render> --coding ice/review/genre-coding.json` (the `ice-qa`
skill) runs at gate D on every draft of a B2B or corporate industry spot that follows no reference, and its numbers go
into the delivery report. A 15 to 40 s local business commercial does not run it. A red key is fixed in the film (more
shots, a busier middle, a centred end card on a plain ground, more real footage), never by padding with idle motion;
a key the user, a reference or the chosen style sets differently is lifted by its exemption row and passed as
`--exempt <key>=<source>`. Keys marked `-` are reported for the critic, not gated.

Calibration: only keys that 14 or more of the 15 corpus films hold are gated, at bounds that cover the corpus with
room, and one gated key may miss (`misses_allowed 1`, printed yellow with a sentence in the delivery report). On its
own corpus the line passes 15 of 15 films (section "Trial" of the research notes). `cuts_per_10s` is gated here: the
frame-rate cut detector reads this genre's cuts (detected hard cuts within 30 percent of the counted shots in 12 of 15), and
its floor of 1.0 per 10 s still lets the slow 3D-led product launch pass (1.3). The `ind_` keys split the variants and
the proof, and are reported for the critic.

Genre fingerprint: events_per_s >=1.2; median_event_gap_s <=0.6; max_event_gap_s <=7.0; scene_median_s 0.6-1.8; cuts_per_10s >=1.0; end_logo center; end_background plain-solid|plain-gradient; ind_footage_share >=0.4; misses_allowed 1; hook_events_3s -; hard_cut_share -; ind_carrier -; ind_cg_share -; ind_mg_share -; ind_claims -; ind_claim_hold_s -; ind_scale_share -; ind_people_share -; ind_ppe -; ind_proof -; ind_brand_first_s -; ind_cta -; sfx_per_min -; move_onset_lift -.

## Rules this genre replaces

Each general rule stays the house default for every other film (and for the 15 to 40 s local business commercial);
its own file names this genre as the exception.

| General rule | Where | In this genre |
|---|---|---|
| A 15-40 s commercial; 12-15 compositions per 30 s; beats of 1.4-3.5 s | `film-types/industry-spot.md` Fit and Rhythm ranges | 45 s to 3 min; about 8 counted shots per 10 s, shot median 1.2 s |
| Rhythm row `max_event_gap_s 3.5` | `film-types/industry-spot.md` Rhythm row | the longest gap the B2B variant needs, 9 s (`film_gate.py` measured 2.75 to 8.67 s in 14 of 15) |
| Hand objects across scenes at exact coordinates | `film-types/industry-spot.md` Transition policy | hard cuts with a few dissolves; a carried object is an option |
| No hold over 0.6 s except the CTA; frozen time at most about 1 s per 30 s | `film-types/industry-spot.md` Camera policy and QA thresholds; `ice-motion/references/anti-slideshow-and-density.md` section 4 Frozen screen | longest still up to about 6 s on a scale shot or a 3D reveal; still ratio 0.15 or less |
| The CTA block on the end card | `film-types/industry-spot.md` Text density and QA thresholds | the logo centred with its tagline, no call to action |
| Gentle -16 for calm industry spots | `ice-audio/SKILL.md` section 4 | social -14 (measured median -14.3) |
| A map story with real travel times | `film-types/industry-spot.md` Structure options | a map or globe of reach, an option |
