# Genre playbook: hype promo

Measured, not collected: 14 official hype promos (league and team hype videos, a fight teaser, game launch and season
trailers, a festival lineup, a launch event invitation, a sponsor spot, a series teaser, a headliner announcement, a
broadcaster promo and a season launch, from the owners' own channels) were measured with this plugin's own tools on
2026-10-31. Every number below is the corpus median and range, with how many films hold it. A pattern in 60 percent or
more of the films is a convention; 30 to 59 percent is an option; under that it is not a rule. Read this file with the
film type file; the type file decides structure, truth and deliverables, this file gives the genre's measured grammar
and the fingerprint the render is checked against.

## Scope

- Film type that points here: `hype-promo`. Use it for a short music-led teaser or sizzle that builds excitement for
  something that is coming or happening: an event, a match, a fight, a season, a festival lineup, a game or season
  launch, a launch event invitation, a show or series, 14 to 51 s (15 and 30 s are the common lengths).
- Not for: a hype cut whose subject is a physical product (`product-launch.md`), an app or interface promo
  (`ui-motion.md`), a type-led statement reel where words are the main actors (`kinetic-type.md`), a brand story about
  values (`brand-film.md`), a 2 to 8 s ident (logo sting), an agency showreel cut from existing work (edit type
  showreel), a long hype package of 2 minutes or more with interviews (edit type, long form).
- Precedence: the user's words, a reference the film follows (its own measures win, `ice-remake`), and a chosen style
  outrank this file, through exemption rows lifting `genre:<key>` (the `ice-direction` skill, `references/treatment.md`
  section "Craft plan"). This file outranks the house defaults it names in "Rules this genre replaces". The flash
  safety limit is never outranked (section "Flashes and safety").

## Corpus

14 films, 14 to 51 s (median 30 s; 12 of 14 within 10 to 37 s), all 16:9 (the owners post the horizontal master on
YouTube; vertical cutdowns live on other platforms). Sport (league, team, fight, sponsor, broadcaster: 7), games (2),
music and festivals (2), a launch event (1), a series (1), and a city season from the Arabic market (1). Sources and why
each was chosen are kept in the maintainers' research folder (`research/genre-playbooks/hype-promo/corpus/SOURCES.md`,
outside this repo). Two variants showed up; pick one at 02:

| Variant | Films | What marks it |
|---|---|---|
| A. Beat-cut montage | 9 (montage, lineup reveal, sponsor spot) | real footage or game render cut hard to the music: counted shot 0.52 s (0.33 to 1.26), 11.3 hard cuts per 10 s (5.7 to 32.7), a cut every 1.6 beats (0.62 cuts per beat, 0.23 to 1.4), 2.4 visual events per s (1.9 to 3.1), 7 events in the first 3 s (4 to 10), text slams 5 (0 to 12), effects 170 per minute (127 to 276), 15 to 51 s |
| B. Slow-burn teaser | 5 (a fight teaser, a launch invitation, an athlete spot, a series teaser, a headliner reveal) | few or no cuts: counted shot 2.4 s (0.8 to 3.7), 0.6 hard cuts per 10 s (0 to 8.3), one built reveal (a light, a shape, a match cut chain, a single camera pull), longest gap up to 8.5 s, a date or a name as the payoff, 14 to 30 s |

Variant B is a real part of the genre, not a weak A: the plugin's fingerprint is set on variant A, and a B film lists
exemption rows for `events_per_s`, `median_event_gap_s`, `max_event_gap_s`, `scene_median_s`, `hook_events_3s`,
`hard_cut_share` and `sfx_per_min` in its craft plan, with "variant B, slow-burn teaser" as the source.

## Conventions (60 percent or more)

| Convention | Number (median, range) | Held | How it is measured |
|---|---|---|---|
| Something new about every third of a second | 2.13 visual events per s (0.2 to 3.07); median gap 0.33 s (0.25 to 3.21) | 1.0 or more 12 of 14; gap 0.83 s or less 13 of 14 | `genre_check.py measure` events |
| No long dead stretch | longest gap without an event 2.0 s (0.75 to 8.5) | 4.5 s or less 12 of 14; 3 s or less 8 of 14 | same |
| Short scenes | counted scene 0.88 s (0.33 to 3.66); 0.4 to 1.6 s in 10 of 14; variant A 0.52 s | 1.2 s or less 9 of 14 | coding sheet scenes |
| Hard cuts carry the film | 9.1 frame-accurate hard cuts per 10 s (0 to 32.7); hard cuts 94 percent of seams (0 to 100); carried seams (morph, scale-through, push, camera through) 40 percent or more in only 1 of 14 | half the seams or more 11 of 14; 2 or more cuts per 10 s 11 of 14 | coding sheet transitions; frame-accurate cut count |
| A cut every one to four beats | 0.45 cuts per tracked beat (0 to 1.4) | 0.25 to 1.5 in 10 of 14 | librosa beat grid against the cuts |
| Shot lengths vary | coefficient of variation 1.07 (0.52 to 1.47) | 11 of 11 films with 5 cuts or more | frame-accurate cuts |
| Busy hook | 5.5 events in the first 3 s (0 to 10); the first change by 1.0 s (median 0.7 s) | 4 or more 9 of 14; first change by 1.0 s 8 of 13 | `genre_check.py`; coding sheet hook |
| Real material carries it | live sport, staged live action or a mix | 12 of 14 (game render 1, motion graphics 1) | coding sheet `hype.material` |
| The peak sits late | the visible peak (fastest burst, biggest reveal or title slam) at 70 percent of the runtime (34 to 88) | 50 to 95 percent in 13 of 14 | coding sheet `hype.visible_peak_s` |
| The name is withheld to the close | the event, game or campaign title first appears at 82 percent of the runtime (2 to 92) | in the last 25 percent in 11 of 14 | coding sheet `hype.title_first_s` |
| The brand is around before that | logos on kit, courts, screens or a small mark before the end card | 9 of 14 | coding sheet `brand_presence` |
| The end says when or where | a date, a date and platform, or a URL | 10 of 14; a date on screen 9 of 14 (first at 26.5 s, 12.8 to 47.7) | coding sheet `hype.date_or_cta` |
| The close is centred and held | logo or title centred 11 of 14, on a plain ground 10 of 14; end hold 3.05 s (0.7 to 6.1), 1.5 s or more 11 of 14; the end card is 14 percent of the runtime (8 to 24) | 11 of 14 | coding sheet end card and `hype.end_hold_s` |
| On-screen text, short | text in 14 of 14; a slam carries 3.5 words at the median (2 to 10), 8 or fewer in 7 of 8 films with slams | 14 of 14 | coding sheet text and `hype` |
| Slow motion inside the fast cut | 2 slow-motion shots (0 to 6) | 9 of 14 | coding sheet `hype.slow_motion_shots` |
| No dissolves | dissolves 0 (0 to 4) | 9 of 14 | coding sheet transitions |
| Dense sound effects | the sound map hears 147 effects per minute (36 to 276); 60 or more in 12 of 14 | 12 of 14 | `sound_map.py` |
| Music 100 to 165 BPM | median 136 BPM (103 to 162) | 14 of 14 | librosa on the percussive part (`hype_measure.py`) |
| Loudness | -15.0 LUFS (-23.5 to -6.0); -18 to -8 in 10 of 14 | 10 of 14 | `sound_map.py` |
| Length | 30 s (14 to 51); 10 to 37 s | 12 of 14 | duration |

## Options (30 to 59 percent; the brief and the variant decide)

| Option | Held | Use when |
|---|---|---|
| Text slams: a word or short line arrives at once with impact | 8 of 14 (3 or more in 6; variant A 7 of 9) | names, a campaign line, lineup names, numbers; slams follow the text rules of the type file |
| A big slam spanning half the frame or more | 5 of 14 | one campaign word or the title |
| A spoken line or voice (a quote, commentary, a voiceover, dialogue) | 8 of 14 | the moment has a voice worth hearing; music still leads |
| Builds, then releases into a faster or brighter run | 8 of 14 | most variant A films with a slower first third |
| Hero faces (a face a third of the frame high) 3 shots or more | 8 of 14 | athletes, artists, characters are the draw |
| Shake or glitch hits added in the edit | 6 of 14 | game, fight and street energy; never on a calm brand |
| A rest (0.9 s or more without a new event) about every 8 s | 7 of 14 | variant B always; variant A once before the peak |
| A loudness ramp into a hit (a riser by level and brightness) | 7 of 14 | into the peak or the title |
| A clear music drop (6 dB or more) | 5 of 14, at 59 percent of the runtime when present | the track has one; otherwise the music runs hot from the start |
| Cuts that land on strong drum hits above chance | 4 of 11 films with 5 cuts or more (lift 1.05 median) | an Ice build: syncing is free when Ice cuts to its own beat map (see Measured and rejected) |
| A countdown | 2 of 14 | a date reveal, a start light, days to go |
| WCAG flashes over 3 in 1 s | 5 of 14 (see "Flashes and safety") | never: the safe mode stays |

## Measured and rejected (the corpus did not confirm these; never write them as rules)

- Runtime 10 to 20 s as the genre's length: 4 of 14. The genre runs 30 s at the median; 15 s is a common cutdown.
- Tempo 120 to 140 BPM as the band: 6 of 14 (median 136 BPM, 103 to 162). The band is 100 to 165.
- Scenes of 1.5 to 3 s: 2 of 14 (median 0.88 s; variant A 0.52 s).
- A shape carries every transition, hard cuts at most twice: 3 of 14 have two cuts or fewer (all variant B); carried
  seams reach 40 percent in 1 of 14. Hard cuts carry the genre.
- Every cut within 2 frames of a beat: cuts sit on the tracked beat above chance in 2 of 11 (lift 0.84 median), lock to
  one beat phase in 2 of 11 (Rayleigh test), land on strong drum hits above chance in 4 of 11, and visual events land on
  audio onsets above chance in 3 of 14 (`move_onset_lift` median 0.97). Professional hype cuts follow the music's
  phrases and accents, not a frame-locked grid. Cutting on the beat stays an Ice house choice; it is not a genre fact
  and not part of the fingerprint.
- Cutting accelerates from beats to 8ths to 16ths: more cuts in the last 40 percent than in the first in 2 of 11.
- Big events every 0.66 to 0.83 s: the genre is faster (median gap 0.33 s); 0.83 s or less holds in 13 of 14, so the
  old figure is a floor, not the pace.
- A hook in the first 0.5 s: 4 of 13 (median first change 0.7 s; 1.0 s holds in 8 of 13).
- A hero moment at 60 to 75 percent: 4 of 14 (median 70 percent, 50 to 95 in 13 of 14).
- The drop at 60 to 75 percent: 2 of 14; a clear drop at all in only 5 of 14.
- An end hold of 0.6 to 1.4 s: 3 of 14 (median 3.05 s).
- About 15 sound effects per minute: 0 of 14 (median 147).
- One signature riser per film: the sound map labels no riser in any film (the dense mix hides them); a level ramp
  shows in 7 of 14. Not measurable as a ceiling; the house rule stays a default outside this genre.
- -14 LUFS plus or minus 1: 3 of 14. The deliverable is still mastered to the platform target (`ice-audio`); the
  corpus spread is reported, not copied.
- Speed ramps as a habit: 2 of 14 seen (most coders could not judge ramps from strips; recorded as unmeasured, not as
  absent). Black beats between shots: 3 of 14. Visible white flash frames: 3 of 14.

## Flashes and safety

5 of 14 films exceed 3 WCAG flashes in a 1 s window (up to 12), 10 of 14 have 2 or more. Coders saw a white flash
frame in only 3: the WCAG flashes come from hard cuts between shots of very different brightness (stage lights,
fireworks, saturated cards against dark footage) at the corpus pace. The plugin's strobe safe mode stays absolute for
this genre (`ice-audio` skill, `references/cue-map-and-beat-sync.md`, "Strobe safe mode"; `ice-qa` craft gate
`flashes`): at variant A's pace, plan the luminance order of the shots so that no 1 s window alternates dark and bright
more than 3 times (group bright shots, step through mid tones, or hold one ground across a burst), and check the flash
count on the animatic, not only on the render.

## Rules this genre replaces

| House rule | Where | What this genre uses instead |
|---|---|---|
| 10 to 20 s runtime | `film-types/hype-promo.md` Fit | 15 to 35 s (30 s master, 15 s cutdown) |
| Scenes of 1.5 to 3 s; 6 to 8 scenes | `film-types/hype-promo.md` Structure options | variant A: counted shots 0.3 to 1.3 s; variant B: 0.8 to 3.7 s |
| A shape carries every transition; a hard cut at most twice | `film-types/hype-promo.md` Transition policy | variant A: hard cuts carry 90 percent or more of seams; carried seams are accents |
| Composed end frame 0.8 to 1.2 s; resolved end hold 0.6 to 1.4 s | `film-types/hype-promo.md` Ten-second hero arc; `ice-motion` holds-and-stillness section 3 | end hold 1.5 to 6 s (median 3 s), end card at most 25 percent of the runtime |
| About 15 effects per minute | `ice-audio` `references/sfx.md` section 4 | 60 or more per minute (median 147) |
| Big events every 0.66 to 0.83 s | `ice-motion` motion-language-by-type | median event gap 0.33 s (variant A) |
| Tempo 120 to 140 BPM | `film-types/hype-promo.md` Structure; `ice-audio` music-choice table | 100 to 165 BPM |

## Coding sheet

A fresh reviewer codes a render (or a corpus film) with the shared coding sheet of the genre playbooks plus these keys
at the end of the same JSON (`hype` block and `voice`). Code only what the frames show; `null` and a note when unsure.

```json
{
  "hype": {
    "variant": "beat-cut-montage | slow-burn-teaser | graphic-slam | lineup-reveal | other",
    "material": "live-sport-footage | game-render | live-action-staged | motion-graphics | mixed",
    "text_slams": 0, "slam_max_words": 0, "slam_big": 0,
    "speed_ramps": 0, "slow_motion_shots": 0, "flash_frames_seen": 0, "black_beats": 0, "shake_or_glitch": 0,
    "visible_peak_s": null, "build_then_release": true, "title_first_s": null,
    "date_or_cta": "date | date-and-place | platform-or-url | date-and-platform | none", "date_first_s": null,
    "countdown": false, "faces_hero_shots": 0, "end_hold_s": 0.0
  },
  "voice": "none | spoken | sung"
}
```

- A text slam: a word or short line that arrives at once with impact (hard in, scale pop, stamp, shake), not a fade or a
  subtitle. `slam_big`: slams spanning half the frame width or more.
- `visible_peak_s`: the fastest burst, the biggest reveal or the title slam. `title_first_s`: first on-screen event,
  game, season or campaign name. `end_hold_s`: the final static card.
- `transitions` (shared sheet) gives `hard_cut_share`: hard cuts over all counted seams.

## Fingerprint

Keys measured by `genre_check.py measure` and read from the coding sheet (`hard_cut_share`). Set on variant A's
range (each bound at or just outside the variant A minimum or maximum); a variant B film lifts the keys named in
"Corpus" with exemption rows. Check of 2026-10-31 on the measured corpora: variant A 9 of 9 pass (6 green, 3 yellow);
variant B 5 of 5 red without their exemption rows (as intended); other genres: product launch 1 green of 15 (7 red),
UI motion 1 of 15 (11 red), brand film 0 of 14 (7 red), kinetic type 0 of 11 (10 red), explainer 1 of 15 (13 red).

Genre fingerprint: events_per_s >=1.8; median_event_gap_s <=0.45; max_event_gap_s <=4.5; scene_median_s 0.6-1.3; hook_events_3s >=4; hard_cut_share >=0.75; sfx_per_min >=100; misses_allowed 1; cuts_per_10s -; move_onset_lift -; end_logo -; end_background -.
