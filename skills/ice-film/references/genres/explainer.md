# Genre playbook: explainer

Measured, not collected: 15 voice-led explainers (13 by recognised explainer studios, publishers and brands, 2 Al
Jazeera explainers the founder saved; 4 in Arabic) were measured with this plugin's own tools on 2026-10-31. Every
number below is the corpus median and range, with how many films hold it. A pattern in 60 percent or more of the films
is a convention; 30 to 59 percent is an option; under that it is not a rule. Read this file with the `ice-explainer`
skill; the skill decides the pipeline, truth and voice timing, this file gives the genre's measured grammar and the
fingerprint the render is checked against.

## Scope

- Route that points here: the `ice-explainer` skill (subtype `explainer`). Use it for every narrated film whose voice
  teaches a concept, a product, a process or a news story: animated, motion graphics, SaaS, science and news explainers,
  about 45 s to 4 min.
- Not for: a film that still works with the voice removed (`ice-film` types), a news reel cut from footage (edit type
  `news-reel`), an app ad whose hero is the UI (`genres/ui-motion.md`), a kinetic type film (`genres/kinetic-type.md`).
- Precedence: the user's words, a reference the film follows (its own measures win, `ice-remake`), and a chosen style
  outrank this file, through exemption rows lifting `genre:<key>` (the `ice-direction` skill, `references/treatment.md`
  section "Craft plan"). This file outranks the house defaults it names in "Rules this genre replaces".

## Corpus

15 films, 60 s to 3 min 54 s (median 2 min 25 s): TED-Ed, Kurzgesagt, BBC Ideas, The Economist, Vox, Slack, Dropbox,
Headspace, Kasra Design, Common Craft, AJ+ Arabic, BBC News Arabic, Asharq Bloomberg, Al Jazeera 360 and Al Jazeera
English. 13 at 16:9 or 4:3, 2 vertical. Sources and why each was chosen are kept in the maintainers' research folder
(`research/genre-playbooks/explainer/corpus/SOURCES.md`, outside this repo). Two variants showed up and are measured
apart where they differ:

| Variant | Films | What marks it |
|---|---|---|
| A. Drawn | 8 (TED-Ed, Kurzgesagt, Vox, Common Craft, Headspace, Kasra Design, The Economist, BBC Ideas) | illustration, icons and figures; real material 4 percent of the runtime; diagrams in about a quarter of the scenes (median 0.23); 2 builds and 2 to 3 visual metaphors per film; 0.4 hard cuts per 10 s; end card about 8 s |
| B. Real material or presenter | 7 (Al Jazeera 360, Al Jazeera English, Slack, Dropbox, AJ+ Arabic, BBC News Arabic, Asharq Bloomberg) | footage, photos or screen captures 71 percent of the runtime, or a presenter; hard cuts carry 84 percent of transitions (2.0 per 10 s); almost no diagrams (0.03); a visual event every 0.55 s (1.8 per s); end card about 4 s |

Pick the variant at 02: a news event, a place, a person, or a product whose real look must be seen leans B; a
mechanism, a science or policy idea, or a product explained by what it does leans A. Inside A, a continuous carried
canvas (morphs and matches dominate) and cut illustration (hard cuts between drawn scenes) are both professional; the
plan names which. Log the choice in `ice/DIRECTION.md`.

## Conventions (60 percent or more)

| Convention | Number (median, range) | Held | How it is measured |
|---|---|---|---|
| The voice runs nearly all the film and starts at once | voice on 92 percent of the runtime (73 to 99); first word at 0.5 s (0 to 6.0) | 70 percent or more: 15 of 15; first word in 3 s: 13 of 15 | first to last word, merged speech |
| A human English voice speaks fast | 166 words per minute (117 to 183); 135 to 185 | 10 of 11 English films (150 or more: 8 of 11) | words over first to last word |
| An Arabic voice speaks at about 1.7 words per second | 103 words per minute (90 to 117) | 4 of 4 Arabic films | same |
| Every sentence changes the picture | 10 of 10 sampled sentences at the median (7 to 10); 8 or more | 14 of 15 (10 of 10: 11 of 15) | coding sheet `explainer.sentence_sample` |
| A new counted scene about every sentence | 9.2 spoken words per counted scene (3.1 to 19.3); 15 or fewer | 14 of 15 | voice words over coded `scenes` |
| Scenes a viewer counts are short and vary | median 3.3 s (0.5 to 11.3), 2 to 6 s in 13 of 15; 15.8 per minute (5.5 to 26.2); coefficient of variation 0.61 | 13 of 15; 14 of 15; 15 of 15 | coding sheet `scenes` |
| Something small is always arriving | median gap between visual events 0.42 s (0.25 to 0.83); 1.39 events per s (0.74 to 2.83) | gap 0.6 s or less: 12 of 15; 1.0 per s or more: 11 of 15 | `genre_check.py measure` events |
| A pause is allowed, not a dead stretch | longest gap without an event 5.3 s (2.25 to 11.5); 6.2 s or less | 11 of 15 (12 s or less: 15 of 15) | same |
| Whole-frame change | median 1.75 s (1.0 to 45.5); 0.8 to 2.4 s | 12 of 15 | `genre_check.py` scene changes |
| Hard cuts stay moderate | 1.79 per 10 s (0.11 to 3.56); 2.5 or fewer | 13 of 15 | `genre_check.py` cuts |
| A busy first 3 s | 4 visual events (1 to 8); 4 or more | 10 of 15 | same |
| Screen text names things and stays short | display text on 31 percent of the runtime (3 to 85); 5 labels per film (0 to 13), 3 or more in 11 of 15; at most 8 words readable at once (median 7) | labels 11 of 15; 8 words 10 of 15 | coding sheet `explainer` |
| Display text rarely repeats the spoken sentence | never 7 of 15, sometimes 5, often 3 | at most sometimes: 12 of 15 | coding sheet |
| A map, chart or timeline appears; icons stand for ideas | | 11 of 15; 9 of 15 | coding sheet `diagram_kinds`, `icons` |
| Figures or people carry the scenes | in 58 percent of counted scenes (0 to 94); 30 percent or more | any: 13 of 15; 30 percent: 11 of 15 | coding sheet `character_scene_share` |
| A concept is built step by step | 2 builds per film (0 to 6), a build reaches 4 parts (0 to 9): one part per spoken point, earlier parts stay | 9 of 15; 4 parts or more: 9 of 15 | coding sheet `builds` |
| The virtual camera moves | | 11 of 15 | coding sheet `camera` |
| A music bed runs under the whole voice | | 10 of 15 (none 2, not readable 3) | `sound_map.py`, coding sheet |
| The film closes on a logo or a call to action | end card 5.6 s (0 to 14.7), 3 s or longer in 12 of the 13 films with one; logo centred on a plain ground | close 11 of 15; centred 10 of 15; plain ground 13 of 15 | coding sheet; `genre_check.py` end card |
| The brand or channel shows before the end | | 14 of 15 | coding sheet |
| Length | 145 s (60 to 234); 60 s to 4 min | 14 of 15 | duration |

## Options (30 to 59 percent; the variant decides)

| Option | Held | Variant A | Variant B | Use when |
|---|---|---|---|---|
| Hard cuts under 40 percent of transitions (carried seams: morph, match, push, camera move) | 6 of 15 | 5 of 8 | 1 of 7 | a drawn canvas the camera travels |
| Diagrams in 15 percent of counted scenes or more | 6 of 15 | 5 of 8 | 0 of 7 | a mechanism, numbers, a process |
| 2 or more visual metaphors (an abstract idea shown as a concrete object or action) | 6 of 15 | 5 of 8 | 1 of 7 | abstract or invisible ideas |
| Real material a third of the runtime or more | 6 of 15 | 0 of 8 | 6 of 7 | events, places, people, a product's real look |
| A number as the hero of its moment | 8 of 15 | | | the script carries a figure worth feeling |
| Display text on 30 percent of the runtime or more | 8 of 15 | | | lists, terms, numbers, news labels |
| Display text never repeats the spoken sentence | 7 of 15 | | | the default; a news keyword promoted per act is the other 5 |

## Measured and rejected

House rules or common beliefs measured on this genre that did not hold. They stay house defaults where their own file
scopes them; for this genre they are replaced by the numbers above. Do not add them back from memory.

| Rule | Measured |
|---|---|
| Narration at 140 to 160 wpm; explainers planned at 2.2 to 2.5 words per second | 1 of 11 and 2 of 11 English films; median 166 wpm. The TTS planning floor stays for TTS voices. |
| Above about 170 wpm is rushed | 4 of 11 professional English explainers run 172 to 183 wpm |
| A new visual element at least every 3 s | 1 of 15 keep every gap under 3 s; the median gap is 0.42 s and the longest 5.3 s |
| One idea per scene, 4 to 15 s | 3 of 15 by the scenes a viewer counts (median 3.3 s, about one sentence); 4 to 15 s is the planning segment |
| No bare cuts between explainer scenes | hard cut is the dominant seam in 9 of 15 |
| A real product needs real footage | 4 professional explainers of a real product or policy are drawn (0 to 6 percent real material) |
| Title text on the first frame | 4 of 15 (3 of 13 horizontal films) |
| End hold at most 1.5 s | end card 5.6 s at the median, 3 s or more in 12 of 13 |
| A sound placed on every move | sounds land on visual events no more often than chance in 14 of 15 (`move_onset_lift` median 1.0) |
| Open on a question | 3 of 15; statements 5, a scene 4, a title or ident 2, a presenter 1 |
| A recurring character or mascot | 3 of 15 |
| Section title cards | 2 of 15 |
| Gentle loudness -16 LUFS as a genre trait | 4 of 15 between -17 and -15 (uploads -24.2 to -12.8, median -17.7); a delivery target, not the genre |

## Coding sheet

What pixels cannot read is coded by a fresh reviewer (never the builder) from 12 fps strips of the render
(`ice-remake/scripts/clip_strip.py`) and the 09 re-transcription of the final mix, into `ice/review/genre-coding.json`,
with the same fields the corpus was coded with: the shared fields of `genres/ui-motion.md` "Coding sheet" (`scenes`,
`text`, `transitions`, `camera`, `end_card`, `brand_presence`, `hero` and `interaction` filled honestly as none), plus
one `explainer` block:

- `narration` (voiceover, presenter, presenter-and-voiceover, none) and `presenter_share`; `grammar` (flat 2D
  illustration, character animation, paper cutout, whiteboard, collage or archival, icon motion graphics, UI or
  product, 3D, footage plus graphics, presenter plus graphics, mixed).
- `voice_words` (spoken words in the re-transcribed final mix) and `wpm` (those words per minute from the first word to
  the last).
- `sentence_sample`: 10 spoken sentences spread evenly over the voice, each `{t, words, picture_change}`;
  `picture_change` is true when something new appears or the picture changes between the sentence's first word and its
  last word plus 0.5 s (a camera drift alone does not count).
- `scenes` (shared field): the scenes a viewer counts, a new picture rather than a new label on the same picture.
- `text_on_screen_share` (display text, running subtitles excluded), `captions_burned`, `screen_text_repeats_voice`
  (never, sometimes, often), `text_kinds` (label, key phrase, number, title card, quote, source credit),
  `max_display_words`.
- `diagram_kinds` (chart, map, flow or arrows, timeline, icon set, split compare, cross section),
  `diagram_scene_share`, `icons`.
- `characters` (none, generic figures, recurring character, mascot, real people), `character_scene_share`,
  `real_material_share` (footage, photographs, documents, screen captures).
- `builds`: `{count, max_parts, note}`; a build is one picture that grows part by part on successive spoken points,
  earlier parts staying on screen. `metaphor_visuals`: scenes where an abstract idea is shown as a concrete thing.
- `section_titles`, `hook_kind`, `first_frame_text`, `close`, `music_under_voice`.

## Fingerprint

`genre_check.py check --genre explainer --video <render> --coding ice/review/genre-coding.json` (the `ice-qa` skill)
runs at gate D on every draft of an explainer that follows no reference, and its numbers go into the delivery report.
A red key is fixed in the film (a picture change on the sentence that lacked one, a new counted scene where a scene
carries more than about two sentences, a shorter hold where nothing arrives for over 12 s), never by padding with idle
motion; a key the user, a reference or the chosen style sets differently is lifted by its exemption row and passed as
`--exempt <key>=<source>`. Keys marked `-` are reported for the critic, not gated.

Calibration: only keys that 14 or more of the 15 corpus films hold are gated, at bounds that cover the corpus, and one
gated key may miss (`misses_allowed 1`, printed yellow with a sentence in the delivery report). On its own corpus the
line passes 15 of 15 films: 5 green and 10 yellow (the Al Jazeera 360 explainer misses `expl_scene_median_s` with its
0.5 s archive bursts; the others sit near an edge). The variant numbers, the voice rate, the text and diagram shares
and the builds are craft targets for the storyboard and the critic, reported by the check, never gated.

Genre fingerprint: events_per_s >=0.7; median_event_gap_s <=0.9; max_event_gap_s <=12; expl_sentence_change >=0.7; expl_words_per_scene <=20; expl_scene_median_s 2-12; misses_allowed 1; scene_median_s -; cuts_per_10s -; hook_events_3s -; hard_cut_share -; expl_wpm -; expl_text_share -; expl_diagram_share -; expl_real_share -; expl_builds -; end_logo -; move_onset_lift -.

## Rules this genre replaces

Each general rule stays the house default for every other film; its own file names this genre as the exception.

| General rule | Where | In this genre |
|---|---|---|
| Plan explainers at 2.2 to 2.5 words per second; above about 170 wpm is rushed | `ice-audio/references/voiceover.md` section 3 | a human English voice at 2.5 to 3.0 words per second (150 to 180 wpm, measured median 166), rushed above about 185; the TTS budget stays for TTS voices |
| A new visual element at least every 3 s | `ice-motion/references/anti-slideshow-and-density.md` section 3 | median gap under about 0.6 s, longest gap at most 12 s (median 5.3) |
| One idea per scene, 4 to 15 s | `ice-explainer/references/word-timed-segments.md` section 2; `minimal-motion.md` section 9 | 4 to 15 s is the planning segment; the picture moves to a new counted scene about every sentence (median 3.3 s, 9 words) |
| No bare cuts in card films and explainer canvases | `ice-explainer/references/minimal-motion.md` sections 7 and 9; `ice-motion/references/transition-policy.md` section 1 | variant A cuts between drawn scenes or carries them; variant B cuts like an edit |
| Real footage required for a real product | `ice-explainer/references/frame-and-text.md` section 5; `ice-explainer/SKILL.md` rule 7 | a product, service or policy explained as a mechanism may be fully drawn (variant A) |
| Title text on the first frame | `ice-explainer/references/frame-and-text.md` section 6 | vertical social covers only |
| Explainer end hold at most 1.5 s | `ice-qa/references/motion-density.md` section 6; `ice-motion/references/holds-and-stillness.md` section 3 | the end card holds its reading time (measured 5.6 s median); the 1 to 1.5 s takeaway hold is the last spoken frame |

Sources: measured on the corpus above with `ice-audio/scripts/sound_map.py`, `ice-qa/scripts/film_gate.py` and
`genre_check.py`, `ice-remake/scripts/clip_strip.py`; voice rate from the films' own captions or a local transcript;
coded with the coding sheet above.
