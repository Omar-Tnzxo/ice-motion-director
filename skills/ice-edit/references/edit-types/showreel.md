# Edit type: showreel and beat montage (existing clips cut to music)

Sources: nateherkai/herk-edit-kit (MIT, Use Permission: motion-showreel scripts, reference breakdown), majedphotos/video-ad-editor (MIT: montage, beat-fx), Omar-Tnzxo/video-production-studio, Barty-Bart/motion-graphics (MIT: sound pass beat checks). A showreel designed from scratch as motion graphics (chapters, HUD, brand motif) is a brand film owned by the ice-film skill; this file covers cutting real clips or existing work to a beat grid.

Stage order: 01 03 02 04 06 05 [07 08a] 08b 09 10
Leads with: the footage on the music's grid. 01 scans the clips, runs the track's sync license check and measures its beat map (both are 01 artifacts); 03 is the clip selection and the cut sheet; 06 is the rough cut on the beat grid; 08 keeps its normal place and mixes the checked track.

## Purpose
A short reel (often 15 to 40 s) of the user's own clips or past work, cut so every hard cut, flash and reveal lands on the music's grid, with density that breathes.

## Pipeline
1. Rights first, at 01: the track passes the sync license check (`ice-audio/references/music-choice-and-licensing.md` section 5) before any cut uses it; a track that fails is not used. Measure it: `node scripts/music-grid.mjs <track> --bpm <estimate> --beats --json grid.json` prints the period, the kick-band phase, and per-bar and per-beat energy to find the intro, riser, drop, break and return. Measuring the music (kick-band phase, tempo range, half and double time, finding the drop): the `ice-audio` skill, `references/cue-map-and-beat-sync.md` section 3.
2. Scan the clips: score by motion, steadiness, color, sharpness and exposure; trim the first and last third of a second; strongest clips first; drop near-duplicates (footage ledger).
3. Cut sheet: `node scripts/beatgrid.mjs --period <s> --fps <fps> --length <s> --chapters "<name>:<beats>, ..., <name>:rest"` lists chapter starts in seconds and frames; a chapter named Flurry lists one cut per beat, then per half beat.
4. Build on the beat grid and vary shot lengths (pattern 1.0, 0.82, 1.24, 0.94 times the base shot). Grid arithmetic and integer-frame shot lengths: the `ice-audio` skill, `references/cue-map-and-beat-sync.md` section 4.
5. Verify your own render: `node scripts/analyze-reference.mjs <render> <out dir> --bpm <bpm> --phase <phase>` reports hard cuts and their offset from the nearest beat and half beat, luminance per half second and RMS per quarter second.

## Structure options (illustration only)
- 15 s at about 129 BPM (32 beats): intro 4 beats, a long chapter 8 beats, three 4-beat chapters with the drop in the middle, a flurry of about 6 cuts in 4 beats (one beat each, then half beats), about 4 beats of resolve. Section shares for this pacing: the `ice-audio` skill, `references/cue-map-and-beat-sync.md` section 6.
- 20 to 40 s social montage: strongest shot first, sections following the track's own energy, ending on the track's own button.
- Reference-matched reel: measure the reference's cuts, energy and quiet stretches, then design against the numbers, never its order or assets.

## Rhythm ranges
| Measure | Value |
|---|---|
| Cut placement | The frame nearest the hit is the peak frame (worst case half a frame, 17 ms at 30 fps). Sync tolerances: the `ice-audio` skill, `references/cue-map-and-beat-sync.md` section 5. Showreel cut-offset gate: the `ice-qa` skill, `references/captions-and-sync.md` section 3 |
| Cuts on beats, pre-drop gap, share of cuts on hits | The `ice-audio` skill, `references/cue-map-and-beat-sync.md` section 6 |
| Density | Breathes: one subject, then many, then one again; never flat |
| Zoom | Only when the source is at least 1.5 times the output size |
| Tempo of shots on speech videos | Low density, clean style, avoid the hook and number moments |

## Transition policy
Hard cuts on the grid; letterbox moments at least 4 s apart. Transition families on the grid and the flash-safe limit: the `ice-audio` skill, `references/cue-map-and-beat-sync.md` section 6.

## Camera policy during holds
Clip motion carries the hold; added zooms only on oversized sources; intensity can follow beat energy (0.35 plus 0.65 times energy).

## Sound policy
The track plays from its first sound with one complete arc and a clean ending (no fade into silence mid-phrase); edits of the track itself belong to the ice-audio skill.

## Text density
Minimal: a title and a closing lockup at most, unless the brief asks for more.

## QA thresholds
Cut offset report from `analyze-reference.mjs` on the final render; luminance alternates where chapters should flip; the audio shows the pre-drop dip; six random frames each read as the brand or subject.
