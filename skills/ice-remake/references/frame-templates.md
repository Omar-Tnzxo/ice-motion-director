# Frame templates: a film saved frame for frame for any brand

A frame template is a film the founder approved, measured frame by frame and saved with every brand, word, media item and sound turned into a slot. A new film made from it lands on the same frames: the same frame count, cuts, camera paths, bars, slot geometry, presses and hit frames, with the user's brand, idea, words, media and licensed sound inside the slots. It is stronger than a style recipe (`style-recipe.md`): a recipe carries a style's grammar and averages; a template carries the exact frames.

Templates live in `../templates/<id>/` (`template.json`, the lock; `engine.js`, the frame-function engine). `scripts/template.py` lists, shows, installs and checks them. The library (`ice-styles/references/catalog-index.md`, "Templates") lists every template beside the styles.

## 1. Starting a film from a template

1. The router recognises a template by its name or id in the user's words, or by `/ice-style <template id>` (`ice-motion-director/references/classify.md`, "Frame templates"). Route: this workflow, `run_mode frame-locked`, `template <id>` recorded in `ice/state.json` (`set template <id>`) and in the brief's References block as `<id> | template | mode: frame-locked | function: both`.
2. Stage 01 runs in full: the business brief, the brand research (dated), `COMPLIANCE.md`, the brand material plan and the four-choice questions for every slot the user's words leave open (`ice-direction/references/questions.md` section 1). The template adds its own open slots: the brand and its feature gap (or the template's equivalent idea slot), `Q-voice` (section 4), the music source (section 3) and the maker credit (the end card's name and handle). Only the user's own words waive the questions (AGENTS.md rule 4).
3. Right after the stage 01 answers, `python scripts/template.py init <id> <project>` writes the lock into the project: one camera track per file in `film/measure/`, `bars2.json`, `film/engine.js`, `ice/reference/<id>/TIMELINE.md` and `REASONS.md` (standing in for a measured reference, as a recipe's numbers do in `style-recipe.md` section 7 item 3), `ice/plan/template-lock.json` and `ice/plan/presses.json`.
4. The spine runs as a frame-locked remake whose reference is the template: 02 maps the brand onto the slots (section 2), 03 writes every slot's words inside its range, 04 copies the template's shots with the new content, 05 locks the look on the brand's real interface, 07 builds on the engine with the locked tracks, 08 lays licensed music and recorded effects on the locked frames, 09 runs `template.py check` beside the normal gates, 10 delivers.
5. No reference file ships with a template, so `compare.py` and the climax duel compare against the template's peaks and its proof film's numbers in `template.json`; the delivery note says so.

## 2. Adapting the slots to a new brand (how the proof film mapped Instagram to YouTube)

1. **Brand and gap.** Research the brand (dated) and list what its real product lacks that fits the template's problem. Pick one a stranger names in one line; prove on the brand's own help or product pages that it does not exist today; record the sources in the truth sheet.
2. **Brand test at stage 01, before any build.** A fresh critic reads the blind description and runs the brand test and the competitor swap (`ice-qa/references/identity-tests.md`). When a rival could own the idea, ride the feature on a ritual only this brand has. A film whose brand lives in its interface cannot pass the masked frame test, because the mask covers the interface; say so at 01, in the stage 01 message, and log it.
3. **Swap every element for the brand's own,** within 20 percent of the slot's word or letter range: the habit's verbs, the controls, the place where saved items pile up and its real name, the toast, the notification wording, the example items and the turn's medium.
4. **Brand colour moments:** exactly the template's (`colour.brand_moments`); the interface elsewhere is the brand's own neutral chrome.
5. **A press on every interface change,** on the locked press frames (`presses`, lesson L58): the pointer arrives 6 to 10 frames before and is on screen when the control changes.
6. **Truth:** every interface word is the brand's real wording or marked imagined in the truth sheet; claims are questions or imagined interface; no invented numbers.
7. **Unofficial concepts:** "Unofficial concept, not affiliated with <Brand>" goes into the delivery note and the suggested post caption, never inside the film (AGENTS.md, gallery demos).
8. **The lock does not move:** shot frames, cuts, camera tracks, bars, slot boxes and press frames stay; only the content inside the slots changes. A user who asks for another length or aspect gets the template's structure re-timed by `style-recipe.md` section 5, and the delivery note says the frame lock no longer holds.
9. **Choice, not sameness:** a template the user named is a look and structure the user chose (`ice-direction/references/anti-sameness.md` section 4a); content, brand, words, media and sound are new every time.

## 3. Sound

- Music and effects are real recordings with a license the user can show. Never the original film's own bed (its owner is unknown) and never code-made audio (`ice-audio/SKILL.md` core rule 7).
- **Music:** a licensed track that fits `sound.music_spec` (tempo band, a bright bed with the template's sections). Cut or crossfade it so its breaks start on the locked frames, time-stretch at most 4 percent, never move a picture frame to the music. Search through the `ice-audio/references/music-choice-and-licensing.md` ladder; every track gets its license row in `ice/assets/CREDITS.md`.
- **Effects:** `sound.sfx_map` gives each event its frame, role and pack type; take files from the Ice SFX pack (`ice-audio/references/sfx.md` section 7) by type, then Freesound CC0 through Openverse when a type is missing; place each by its sync point; one file per type.
- **Loudness:** `sound.music_spec.loudness` (the `reference` profile of `qc.py`, integrated within 1 LU of the target, true peak at or under -1 dBTP) and the reference's short-term contour (`sound.loudness_contour`). After the original's voice ends the bed sat about 8 dB under the full mix; never master a voiceless bed up to the full mix.

## 4. Voice

`voice.line_slots` gives every narrator line its frames and word range. Stage 01 asks `Q-voice` with the template's own options: the user records the lines (recommended when the template's turn depends on tone, lesson L63), a licensed voice the user starts (`ice-assets/references/ai-media-policy.md`), or no narrator, with every line then carried on screen and clarity read 1 asking the turn's tone.

## 5. Media and interface

- The brand's interface is rebuilt from its official sources at 90 percent fidelity or better (AGENTS.md rule 8); official icons untouched.
- `assets.media_slots` lists every photo or video slot with its frames, role, source ladder and measured targets. A slot with `targets` (for example a warm turn's saturation and luma) is matched by measurement at 05 and checked again by `template.py check` at 09.

## 6. Checks

`python scripts/template.py check <id> --render <mp4> --project <folder> --camera [--json ice/review/template-check.json]` runs at 07 on each draft and at 09:
- frame count, size and fps exactly the lock's;
- every locked hard cut is the largest picture change within 6 frames of its frame;
- loudness inside the band, true peak under the limit; the short-term contour within 3 LU of the reference's is a warning, never a block;
- media slot targets (the warm turn's centre saturation);
- every locked press marked built in `ice/plan/presses.json` with its evidence frame;
- `--camera`: each camera path re-tracked on the render with the measuring tracker, median corner error per track at most `checks.camera_track_median_px_max`; tracks marked `check: eye` are warnings, judged by the critic on a frame pair.
A fail goes back to the build like any gate; the result row goes into `ice/review/NOTE.md`.

## 7. Credit and limits

Every template keeps measured structure, timing, camera, slot geometry and the loudness profile of the original, never its audio, images or words. Its `credit` field names the original's maker when the file's metadata or the film itself names one; `CREDITS.md` repeats it.

## 8. Saving a new template

A film becomes a template only on the founder's word. Measure what the lock needs from the approved film's own project (its shot table, camera tracks, bars, text boxes on hold frames, icon keys, press frames, the sound map and the loudness contour), turn every brand-specific item into a slot with a rule and a range, write `template.json` in the format of the existing templates (`schema: ice-frame-template/1`), add the library row and a test, and record the lesson.

## 9. The templates

### Feature Wish (`feature-wish`)

- **Idea:** What if <Brand> had <Feature>? (`what-if-feature`): one question about a feature a famous app really lacks.
- **Story:** The Wish Demo (`habit-loss-wish-demo-turn`): habit (f0-f79, the habit acted in taps on the real interface), loss (f80-f196), wish (f197-f278), demo (f279-f449, the feature pressed, set, done, the notification arriving), proof (f450-f552, two everyday examples), warm turn (f553-f909, a third example that is a person, slowed and warmed, closed by one handwritten word), sign-off (f910-f1165, the maker's credit on black).
- **Style:** Interface Ride (`interface-ride`, `ice-styles/references/family-screen-tech-3d.md`).
- **Video type:** genre `ui-motion` (`ice-film/references/genres/ui-motion.md`), subtype "unofficial feature concept".
- **Lock:** 1080 x 810, 30 fps, 1166 frames; hard cuts f135, f197, f240; fade to the credit f910-f945; 17 shots, 15 measured camera tracks, bars on every frame, 22 text slots, the hero icon keyed on 29 frames (f342-f370), 7 presses (f13, f40, f108, f279, f321, f330, f482), 4 brand colour moments, no flashes.
- **Sound:** 96 to 108 BPM, breaks starting on f638 and f947, hits on f342 and f799; -14.2 LUFS; 20 effects by role; 7 narrator line slots.
- **Media target:** the warm turn (slot A06), a golden backlit person seen from behind, centre saturation 165 to 180 (the original measured 175; the proof film's 107 to 113 was its one weak point).
- **Proof film:** a YouTube "Watch Later Reminders" concept (remake test run 01, 2026-10-31), rated 9/10 by the founder.
- **Credit:** structure, timing and camera measured from an unofficial Instagram concept by @mosycreate (named on its own end card).
