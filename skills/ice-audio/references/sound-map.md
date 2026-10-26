# Sound map of a reference: fields, methods, limits, use

Read before studying the sound of a reference video (a remake, a style recipe, a "make it sound like this" request), and before using any value from `sound_map.json`. The script is `scripts/sound_map.py`; it maps what the soundtrack does over time so a recipe or a remake can rebuild the sound design with its own sounds. It never copies audio.

The agent cannot listen. Every value below comes from measurement by the fixed rules in section 2. Times, levels, tempo and loudness are measurements. Section labels, effect types, key, instruments and genre are readings of those measurements, each with a confidence. Instruments and genre are proposals only: the user confirms them in the stage 01 four-choice questions (`ice-direction` skill, `references/questions.md`) before anything is built on them.

## 1. The file

`sound_map.json`, schema version 1. The fields and the key order are fixed; a consumer reads it unchanged.

| Field | Meaning | Unit |
|---|---|---|
| `version` | Schema version, `1` | integer |
| `duration_s` | Length of the decoded audio | seconds |
| `music.present` | A music bed is there: a steady beat (tempo confidence 0.35 or more), or a continuous low harmonic bed with no silent gaps (10th percentile of the harmonic level under 200 Hz at -40 dBFS or more and of the mix at -45 dBFS or more), or sung vocals, or a sustained harmonic bed over half the file while speech covers under half | boolean |
| `music.tempo_bpm` | Beat tempo of the bed, 55 to 200 BPM, with a prior centred on 120 | BPM, 0 when the file is under 4 s |
| `music.tempo_confidence` | Strength of the beat periodicity, from the full band or from the low band when that is clearer by 0.1 or more: under 0.35 is free time (section 4) | 0 to 1 |
| `music.key`, `music.mode` | Tonic as a sharp name (`C`, `C#` ... `B`) and `major` or `minor`; empty when no music | text |
| `music.sections[]` | `start`, `end` (seconds), `label` (a guess: `intro`, `build`, `drop`, `break`, `main`, `outro`), `energy` (0 to 1, 1 = the loudest section, linear over 24 dB below it). Neighbours with the same label are merged | |
| `music.energy_curve[]` | `t` (block start, seconds), `rms_db` (mean level of the whole mix, dBFS RMS), `brightness` (spectral centroid on a log scale: 100 Hz = 0, 1 kHz = 0.5, 10 kHz = 1). Blocks of 0.5 s, longer for files over 5 minutes (600 points at most) | |
| `music.instrumentation_guess[]` | `name` (a generic family, never a product) and `confidence` (capped at 0.7). Two entries carry the vocal flag: `sung vocals` (a sung line, section 2.11b) and `spoken voice over the music` (speech segments over a bed) | |
| `music.genre_guess[]` | `name` (a broad family) and `confidence` (0.6 x the family's score, so 0.6 at most), three at most, each with a score of 0.5 or more; when none fits, `notes` says so with the closest family | |
| `sfx[]` | `t` (onset, seconds), `dur` (seconds), `type` (one of `impact`, `whoosh`, `riser`, `downer`, `click`, `swell`, `stinger`, `other`), `confidence` (0 to 1), `peak_db` (loudest 46 ms of the effect's own energy above the bed, dBFS RMS) | |
| `voice.present`, `voice.segments[]` | Spoken voice only (a voice-over, dialogue): segments that pass the four voice cues of section 2.11 and are not part of a sung line, `start` and `end` in seconds; a weaker candidate is not counted and is written in `notes` as possible voice with its score and weakest cue. No transcript: faster-whisper is not pinned in this repo | |
| `mix` | `integrated_lufs`, `true_peak_dbtp`, `lra` (LU) from ffmpeg `ebur128` on the original audio; `-70` stands for silence | |
| `notes[]` | Plain sentences: the bed method used, the key confidence, dropped level steps, removed speech transients, the listening caveat | |

Next to it: `SOUND-MAP.md` (the same data as tables for people, with the date measured) and `sound-map.svg` (a timeline: sections shaded with their energy, the level curve, the brightness curve, one coloured marker and bar per effect, voice bars, a time axis).

## 2. How each value is measured

All analysis runs on mono audio decoded by ffmpeg at 22,050 Hz; frames of 2048 samples every 512 (23 ms), Hann window, 24 log-spaced bands from 40 Hz to 11 kHz (the first band starts at 0 Hz). Band power is calibrated to dBFS mean square.

1. **Separation.** Harmonic and percussive separation by median filtering of the magnitude spectrogram (17 frames along time for harmonic, 17 bins along frequency for percussive), soft power masks. The harmonic part feeds key, voice and tonality; the percussive part feeds the beat.
2. **Beat grid.** Onset strength is the positive band-level rise of the percussive part. Its autocorrelation, weighted by a log-normal prior around 120 BPM, picks the beat period, refined by a parabola and then by a weighted line fit through the strongest onset near each predicted beat. Confidence is the normalised autocorrelation peak mapped 0.05 to 0.5 onto 0 to 1. The same is run on the onsets of the percussive part under 150 Hz (kick and bass); when its confidence beats the full band's by 0.1 or more, it is used and `notes` says so, because a vocal or a busy top can hide a pulse the kick still carries.
3. **Music bed.** With a steady beat, the bed at each frame is the median of the same phase in the two periods before and after (five copies, each widened by a 3-frame maximum to absorb timing jitter). The period is 1, 2, 3 or 4 beats: the one whose median frame residual is lowest, and among fits within 0.5 dB the longest, so a long riser is not swallowed. Without a steady beat, the bed is an 8 s running median. The same bed is built for the harmonic and the percussive parts.
4. **Effect candidates.** Excess per band is the level above the bed in dB. The frame score is the mean of the six largest band excesses (0 to 30 dB). A region is a run of frames with score 3 dB or more and an effect level of -60 dBFS or more, gaps of up to 4 frames merged, kept only when one frame reaches 8 dB with the effect holding 30 percent of the frame's energy at -50 dBFS or more. A sharp onset is a frame where at least 4 bands rise 9 dB within two frames while standing 6 dB over the bed; a region is split at a sharp onset at least 6 frames after its start (a riser into its hit becomes two events). So an effect is either off the repeating grid, or on it with a different spectral shape, which is what makes it stand out from the bed.
5. **Effect features.** Duration; peak position as a fraction of the duration; level slope (dB per second, line fit over frames within 30 dB of the peak); centroid of the effect's own spectrum per frame and its range and change in octaves; tonality (share of the effect's excess energy in the harmonic part); width (share of bands 6 dB over the bed at the peak); low-band excess under 150 Hz; decay time to 20 dB under the peak; distance to the nearest section edge. The onset of a sharp event is refined on the waveform (first crossing of 30 percent between the window's low and high envelope).
6. **Effect types**, checked in this order. Sharp-start events (peak within 0.1 s of the onset):

   | Type | Rule |
   |---|---|
   | click | 0.12 s or shorter, centroid at 2.5 kHz or higher, under 45 percent of the bands |
   | stinger | tonality 0.6 or more and within 0.6 s of a section edge |
   | impact | broadband (30 percent of the bands or more) or a low-band excess of 12 dB or more: sharp attack, fast decay |
   | other | anything else, confidence 0.45 at most |

   Gradual events:

   | Type | Rule |
   |---|---|
   | (dropped) | longer than 8 s, or 1.5 s or longer with a flat level (under 2 dB/s) and under 0.6 octave of centroid movement: a section change, counted in `notes` |
   | riser | 0.8 s or longer, peak in the last 35 percent, level rising 3 dB/s or more, centroid rising 0.3 octave or more; confidence higher when a hit follows within 0.3 s |
   | downer | 0.6 s or longer, peak in the first 35 percent, level falling 3 dB/s or more, centroid falling 0.3 octave or more |
   | whoosh | 0.15 to 1.6 s, centroid range 0.6 octave or more, tonality under 0.65 (a noise band with a pitch or centroid sweep) |
   | swell | 0.8 s or longer, level rising 2 dB/s or more, tonality 0.55 or more (slow and tonal) |
   | click | under 0.15 s with a centroid at 2.5 kHz or higher |
   | other | anything else |

   Confidence = 0.3 + 0.65 x (mean of the type's soft criteria) x (0.5 + 0.5 x clarity), capped at 0.95, where clarity maps the region's best score from 6 to 14 dB onto 0 to 1.
7. **Sections.** Boundaries come from two sources. Level steps: where the mean level of the next 1.5 s differs from the previous 1.5 s by 4 dB or more, moved to the sharpest rise or fall within 0.5 s. Novelty: half-second blocks of band levels and chroma, each feature standardised, cosine self-similarity and a Gaussian checkerboard kernel (half-width one eighth of the file, between 1.5 and 8 s); peaks of 0.25 or more count when they are 2 s or more from a level step. Boundaries closer than 1.5 s keep the larger step; the others snap to a beat within 0.15 s when the beat is steady. A **final hit** is the last peak of the final 6 s within 6 dB of its loudest, standing 6 dB over the 2 s before it, followed by 12 dB of decay to the end with no new rise of 6 dB: the outro then starts at the last fall within 4.5 s before the hit (or at the hit) and no boundary is kept inside it. Labels use intensity relative to the whole piece: 0.65 x energy + 0.35 x onset density (4 onsets a second counts as full). The last section is `outro` after a final hit or when it is 0.05 under the one before. A section within 0.1 of the top intensity and 0.12 over the one before is `drop`; a section 0.12 under both neighbours is `break`; a loud section followed by a break and a drop is the peak of a `build`; walking back from each drop, quieter sections become `build`; quiet sections before the music gets going are `intro`; the rest is `main`.
8. **Key and mode.** Chroma of the harmonic part from 55 Hz to 5 kHz, summed over frames louder than -50 dBFS, correlated with the 24 rotated Krumhansl-Kessler profiles. A correlation under 0.6 or a margin under 0.03 over the next key is written in `notes` as low.
9. **Instrumentation proposals**, each a ramp of named features, kept from 0.15: low percussive share with a steady beat (kick or bass drum); high percussive share above 5 kHz with frequent onsets (hi-hats or cymbals); mid percussive share with a steady beat (snare, clap or hand percussion); low harmonic share under 200 Hz (bass); mid harmonic share with a steady level (sustained pads, strings or organ) or with frequent harmonic onsets (plucked or struck keys and strings); high harmonic share above 4 kHz (bright leads, brass or distorted synth); speech-like coverage (vocals).
10. **Genre proposals.** Each family is a weighted mean of trapezoid or ramp memberships over tempo, beat strength, low-end share, percussive share, brightness, onset density, loudness range and voice coverage, so one feature outside the usual range lowers a family's score instead of zeroing it. Families: electronic dance with a four-on-the-floor pulse, hip-hop or trap, drum and bass or breakbeat, pop or rock band, cinematic or orchestral underscore, ambient or drone, acoustic or folk, upbeat corporate background, lo-fi or chill. No proposal without music.
11. **Voice.** Candidates: the harmonic part between 250 Hz and 3.5 kHz over the bed (or over its 10th percentile when there is no steady beat), in 1 s windows every 0.25 s, where the level is over -50 dBFS for 40 percent of the window, varies by 3 dB or more, and 35 percent or more of its amplitude modulation from 1 Hz up lies at the syllable rate (2.5 to 8 Hz); gaps under 0.4 s merged, segments under 0.8 s dropped. A syllable-rate envelope alone is not a voice (traffic, machines and drum patterns have one), so each candidate is scored on four cues, each 0 to 1: **harmonicity**, the share of frames with a clear harmonic series from 80 to 400 Hz (8 harmonics, measured after held notes are removed with a per-bin median over 2 s blocks), between 25 and 80 percent as speech alternates voiced and unvoiced sounds; **pitch glide**, consecutive voiced frames that stay within 3 semitones and move 0.1 to 1.5 semitones, as intonation glides while instruments and horns hold or jump; **formant movement**, how fast the sixth-octave shape of the voice band changes over 0.1 s, as vowels change every syllable; **off the beat grid**, 1 minus the phase lock of the envelope's rises to the beat and the half beat. Score = half the weakest cue + half the mean; a segment is voice from 0.6, and from 0.35 it is written in `notes` as possible voice with low confidence. Inside and within 0.3 s of a voice segment, effects other than risers, downers and wide noisy impacts are removed as speech transients.
11b. **Sung or spoken.** Only when music is likely (a steady beat, a continuous low bed, or a harmonic bed): 4 s windows every 1 s, mostly voiced, are a sung line when all four hold: held notes take 45 to 75 percent or more of the voiced time (pieces of 0.15 s or more within 1 semitone), 30 to 50 percent or more of the held time has vibrato (detrended pitch moving 0.1 to 1.2 semitones RMS at 4 to 8 Hz), a new held note comes about once a second or faster, and the vowel shape moves as in 2.11. Windows merge into segments of 3 s or more; their mean is the confidence of `sung vocals`, and spoken segments that overlap them by half are dropped from `voice`. **Continuous vocal:** when the voice segments, or the longest one, cover 85 percent or more of the sounding time (frames over -50 dBFS) while music is likely, the vocal is called probably sung, never a bare voice: a voice-over leaves gaps between lines, a song's vocal runs through. Its confidence is 0.35 + 0.35 x coverage from 0.85 to 1 + 0.15 x held-note share from 0.3 to 0.75 + 0.15 x vibrato share from 0.2 to 0.5; it is written as `sung vocals` in `instrumentation_guess` (the `spoken voice over the music` entry is dropped) and in `notes`, `voice` keeps the timing, and the summary line and `SOUND-MAP.md` say "probably sung" with the confidence. The recipe treats it as a song (section 4.8) until the user says it is a voice-over. Otherwise, for spoken segments, `notes` gives their held-note and vibrato shares so the reading can be checked (a sung line measures about 0.75 and 0.5 or more).
12. **Mix.** ffmpeg `ebur128=peak=true` on the original file's first audio stream: integrated loudness, true peak, loudness range.

## 3. Known failure cases

- **Relative keys.** Major and its relative minor share notes; the profile can pick either. Read `mode` as weak unless the margin note is clear.
- **Tempo octave.** Half or double tempo is possible on sparse or busy drums; the prior favours 80 to 160 BPM. Free-time music, rubato and tempo changes give a low confidence and a time-median bed.
- **Not four beats to a bar.** The bed period search covers 1 to 4 beats; odd meters and swing may leave regular hits as low-confidence `other` events.
- **Busy or changing music.** Fills, new instruments entering, a vocal phrase or a filter sweep in the music itself stand out from the bed exactly as an effect does. They come out as effects (often `other`, `whoosh` or `swell`). A sound designed into the music cannot be told apart from an added effect.
- **Section edges.** The bed lags a big level change by up to two periods: a drop can leave short false events right after it; long flat ones are dropped and noted.
- **Layered effects.** An impact on top of a whoosh, or two effects closer than about 0.1 s, merge into one event typed by its strongest part.
- **Very quiet effects** (under -50 dBFS or less than 8 dB over the bed) are missed. Effects under dense speech are less reliable, and speech under loud music is often missed.
- **Speech versus singing.** Singing without vibrato (straight-tone or pitch-corrected pop, rap, chant) does not pass the sung test and reads as spoken or as nothing; a dense mix can hide the vocal pitch. Heavily processed, whispered or monotone speech can score under 0.6 and land in `notes` only. When the recipe depends on it, ask the user whether the vocal is sung or spoken. No words are transcribed.
- **Speech outside voice segments.** Over a silent bed, syllable onsets of speech that falls outside the detected segments can come out as impacts or clicks; compare them with the voice segments before using them.
- **Endings.** A fade-out has no final hit, so it is an outro only when it is quieter than the section before. A last hit with a long tail over continuing music is not a ring-out.
- **Compression.** Low-bitrate audio smears transients; onset times stay within about 25 ms, types may drift towards `other`.
- **Mono.** The analysis is mono: panning and stereo width are not mapped.

## 4. How a recipe or a remake uses it

1. Run it once per reference, at intake or stage 01, with `--out ice/reference/<ref-id>` (the reference folder itself, not a subfolder): the ice-remake `scripts/recipe.py --ref ice/reference/<ref-id>` reads `<ref>/sound_map.json` from there by default. Log the run in the decision log with the file's name and the date.
2. Put the instrumentation and genre proposals into the stage 01 four-choice questions as options built from the map (the top proposal first, with its confidence as the reason, alternatives from the next proposals and from the brief). Never write a genre or instrument into `ice/DIRECTION.md` as fact until the user answered or waived the questions in their own words.
3. Use measurements directly: `tempo_bpm` (when its confidence is 0.35 or more) as the tempo band of the new score, `sections` and `energy_curve` as the shape of the new arc, `mix` as the loudness reference (the delivery profile still comes from `mix-and-master.md`).
4. Use `sfx[]` as a density and placement map, not a copy list: how many effects per 10 seconds, which types, where they sit against the sections (risers into section edges, impacts on drops, whooshes on cuts). Each new effect still needs a visible cause in the new film (`sfx.md` section 1) and its own sound, recorded or code-made.
5. Treat events under 0.5 confidence as hints. Before building a cue on one, find its cause in the reference picture (the frame at `t`); if the picture shows nothing, leave it out.
6. Voice segments give the talk-to-music ratio and where the music ducks. Transcribe only through the voiceover workflow, with the user's consent for any model download.
7. **Free time.** A tempo confidence under 0.35 means the map found no steady pulse: rubato, a score that changes tempo, a beatless pad, a busy mix whose kick is too soft to read, or no music. Then `tempo_bpm` is not a tempo: the recipe does not copy it, does not build a beat grid or cut on beats from it, and times cuts, effects and the voice to the picture and to `sections` and `energy_curve` instead (cut density from the reference's shots). When `music.present` is still true, the stage 01 questions ask about the music's pulse (a steady groove, a free-time score, or no music) with the map's reading as the recommended option, and the cue sheet's clock is the voice or the picture, never a guessed beat. A recipe never writes a BPM it did not measure with a confidence of 0.35 or more.
8. **Vocals.** `sung vocals` means the reference has a song with a vocal line: the recipe calls for a song or an instrumental with the vocal's role (the user's licensed track, or a code score with a lead melody), never a cloned voice. `voice` segments mean a voice-over: the recipe plans a script, word budgets and ducking (`voiceover.md`, `mix-and-master.md`). Both readings are confirmed at stage 01 like the other guesses.
9. The anti-sameness rule still holds: the new soundtrack takes the structure, not the reference's sounds, melody or arrangement.

## 5. Running it

```
python "${CLAUDE_SKILL_DIR}/scripts/sound_map.py" <video or audio file> --out <folder>
```

For a reference the folder is always `ice/reference/<ref-id>`, so the recipe finds `ice/reference/<ref-id>/sound_map.json`:

```
python "${CLAUDE_SKILL_DIR}/scripts/sound_map.py" <reference file> --out ice/reference/<ref-id>
```

Needs ffmpeg on PATH and numpy plus scipy at the pins in `scripts/requirements.txt` (no other package, no network). It reads only the given file and writes three files into the folder. A minute of audio takes about 5 seconds. Exit 2 for a missing file, no audio stream or under 1 second of audio; exit 3 for a missing package or ffmpeg.
