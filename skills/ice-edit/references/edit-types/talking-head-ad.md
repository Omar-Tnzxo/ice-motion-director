# Edit type: talking-head ad (vertical reel or paid social ad from one speaker)

Sources: majedphotos/video-ad-editor (MIT), Omar-Tnzxo/video-production-studio, nateherkai/herk-edit-kit (MIT, Use Permission), Barty-Bart/motion-graphics (MIT), browser-use/video-use (MIT), group-c judgment rules (MIT), plus ideas restated from imMamdouhaboammar/motion-graphics-skills (ideas only).

Stage order: 01 03 02 04 06 05 [07 08a] 08b 09 10
Leads with: the footage. 01 ingests and transcribes first; 03 is the paper edit (corrected script, duplicate takes dropped, silences by speaker style); 04 is the scene design and the depth moments; 06 is the rough cut with the preview sheet.

## Purpose
A 15 to 60 s vertical ad or reel where one person speaks to camera, recomposed for the phone with scenes, captions, a few inserts and a clear call to action. Arabic speakers: run the ice-arabic skill for dialect correction, captions and text-behind-head effects.

## Pipeline
1. Probe: dropped frames, HDR, light and color scope, face and hand areas (`ingest-and-ledger.md`).
2. Optional local denoise when the room is noisy (ice-audio skill).
3. Transcribe with word timestamps; correct the transcript keeping word counts; show the whole script and drop duplicate takes (the first of two identical sentences is usually the mistake).
4. Cut silences by speaker style (`silence-and-retakes.md` section 3: fast 0.35 s, calm 1.0 to 1.2 s; deliberate speakers: decide by the rule there).
5. Cut and zoom: locked zoom per segment; fixed head-top crop for card layouts (`vertical-conversion.md`).
6. Design scenes: three visual ideas per sentence, keep the strongest; plan 2 to 3 depth moments for the whole ad (an element behind the speaker, a voice waveform, a brand shape in motion) and state them in one line before drawing; pick a layout mode per line. Every overlay, keyword, lower third, mark and insert sits on the word or sentence that triggers it, with its reason (`broll-and-motion-broll.md` section 1). Speaker look and marks: the speaker stays lit and unmarked; dimming, silhouettes, rings and target marks go only on the people talked about (`layers-and-isolation.md` section 5).
7. Six-frame preview sheet, then mid-frame of every scene before the full render.
8. Sound effects from the visual event map, master, SRT and TXT.
9. Verify: safe zones, sync, loudness, eye sheet, file size; cover as first frame.

## Structure options (illustration only, choose by the script)
- Hook claim, proof, mechanism, call to action.
- Problem in the speaker's words, demo insert, result, call to action.
- Question hook, three short answers each with one insert, recap.

## Rhythm ranges
| Measure | Value |
|---|---|
| Something moves | In the first second; something happens every 2 to 4 s |
| Zoom | Normal cycle up to 1.14; calm 1.00 to 1.06 with no change before 4 s and at most 6 changes per 30 s; never above 1.20 |
| Pace modes | Calm, normal, hyper (hyper: layout switch every 1.5 to 2 s, effects under 15 per minute) |
| Inserts | 3 to 4 B-roll inserts per video; one hero per scene |
| Voice-only stretches | Once or twice, 4 to 8 s, never hook or call to action |
| Importance budget | Grade each line 1 (connective: fast, small, a cut or word swap), 2 (supporting), 3 (the point: slower, larger, held for reading time plus 0.5 to 1 s, its own sound). At most 25% of lines are 3. Animating every line the same is the top AI tell |
| Popped words | Stay until their sentence ends, at least 0.6 s |

## Transition policy
Speech joins are hard cuts. Scene or idea changes may use a fast transition of about a third of a second. Never the same move twice in a row; accents only at their moment, never repeated.

## Camera policy during holds
Static zoom per segment. Calm premium ads keep captions still (card fades only, no word jumps).

## Sound policy
Sound effects only on meaningful moments. SFX density, levels and the silence before the key line: the `ice-audio` skill, `references/sfx.md` sections 1 and 4. Call a background track "background audio"; its content is a stage 01 question when the brief leaves it open, otherwise it is chosen from the ice-audio skill's ladder (sound made by code only when the user names it) and the choice is logged. No track is used before its sync license check (`ice-audio/references/music-choice-and-licensing.md` section 5).

## Text density
One text at a time: when a graphic writes the spoken sentence, hide that caption. Numbers, names, dates and percentages on screen come from the truth sheet (ice-assets skill); a value the truth sheet does not hold stays off screen.

## QA thresholds
Caption sync targets (first caption, re-transcription check): the `ice-type` skill, `references/caption-timing-and-truth.md` section 3. Safe-zone check renders each moment twice with two video colors (unchanged pixels are your drawing) and counts text in button zones; file under 30 MB; cover readable at the profile grid size.
