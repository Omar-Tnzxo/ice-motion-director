# Sound effects: selection, placement, audibility, library

Read when building the SFX pass from the cue sheet, when choosing between recorded and code-made sounds, and before delivery to prove every SFX is audible. Sources: Barty-Bart sound-effects (MIT), anidoodle sound design (MIT), motionmaxxing sound-sync (Apache-2.0), echris6 motion-video-kit (MIT), herk-edit-kit (MIT), browser-use/video-use (MIT), lemo-opuscar (MIT), mg-styles-15 (MIT), product-launch-motion (MIT), claude-motion-design (MIT), haidrrrry claude-remotion-skill (MIT), explainroo (MIT), majed video-ad-editor (MIT), hyperframes media-use (Apache-2.0), video-production-studio (founder), with ideas restated from commercial-motion-design, Mamdouh, hypit and noncommercial sources.

## 1. Principles

1. Every SFX has a visible cause. Effects that match nothing on screen are banned. If you cannot say what a sound marks, cut it. Restraint is the design.
2. One sound per event, not per element; one identity per cause ("every press of every button is the same click"), with varied takes or seeds so repeats do not sound robotic. Change the sound only when the event's dramatic role changes.
3. Match the material and the physics: paper, wood, metal, glass, ink and plastic sound different. A chime on a click is the most common template tell.
4. Effects only on real direction changes, landings, contacts and reveals. Never under every motion and never a constant bed of whooshes. Let some cuts pass without a whoosh.
5. Silence is a tool: drop every effect (and dip the bed) about half a second before the most important line or hit. Quiet is scored, not leftover; record the reason for each silence.
6. When a graphic or component already produces its own sound, do not duplicate it with another track.
7. Banned: a stock swoosh on every cut, trailer booms and risers everywhere, laser zaps, pitch-drop plops and sci-fi chirps in non-sci-fi films, sharp swooshes, an ending chime by reflex.

## 2. Recorded or code-made

| Scope | Use |
|---|---|
| Physical contact in real or realistic worlds (product films with mechanics, paper and desk worlds, footage edits, brand films for clients) | Recorded sounds (CC0 or licensed). Synthesized "thocks" were rejected as a pitched tom; layered real recordings about 100 ms long (a key press plus a soft body punch) worked. One synthetic tone per event was rejected as cheap. |
| Synthetic picture worlds (UI blips, pixel and 8-bit, HUD, glitch, liquid, cartoon, abstract graphics) and zero-asset films | Code-made SFX (mgaudio `sfx.*`, see music-by-code.md section 7). Build each effect from layers: a 1 to 4 ms filtered noise transient, a body, a tail. "A single noise burst is not an effect. It is a click." Real objects have partials and a noise transient; raw sines read as chiptune. |
| No assets and no generator available | Never ship silent unless asked: synthesize a minimal kit (noise-burst whoosh, pitch-drop pop, sine-thump kick or bass, detuned-sine pad) and say it is a placeholder. |

Code material palette: filtered noise sweeps for air, inharmonic partials for glass, a pitched knock plus snap for wood, a saturated pitched-down sine for sub hits, a rising resonance for bubble pops. Add harmonics above any sub so landings are heard on phone speakers.

## 3. Event to sound map (defaults, then vary)

| Event | Sound | Placement | Level (relative) |
|---|---|---|---|
| Movement, spatial move, camera push | Soft air whoosh, length matched to the move | Pass-by peak at the move's peak speed; file starts about 2 to 4 frames before | -4 dB (library pass) or -10 to -14 dB under the VO peak |
| Scene cut | Short soft whoosh, or a soft thud or tick with 0.15 s tail, or nothing | 2 frames early | -8 to -12 dB under VO peak |
| Appear, card pop | Pop | On the frame | -6 dB |
| Click, press, toggle | Short dry click | On the press frame (button goes down) | -6 to -10 dB under VO peak |
| Typing | Quiet keyboard texture, one long sample clipped to the typing length, or one tick per word | Follows the typing animation's rhythm | -16 to -22 dB under VO peak; typing does not duck music |
| Build-up | Riser | Ends exactly on the next hit | -6 dB |
| Reveal, logo slam | Impact or low hit with 0.6 to 1.0 s tail; the loudest SFX | On the frame | 0 dB (library), -6 to -10 under VO peak |
| Success, check | Pop or one short warm tone | On the frame | quiet |
| Error, tech | Glitch, or a dry stop for an X | On the frame | quiet |
| Hover, small UI | Very quiet tick | On the frame | lowest |
| Counter running | Soft tick every 3rd to 4th value, or a tick loop that slows as it settles; thud when the number lands | Ticks while counting, thud on settle | -16 to -20 |
| One-frame flips | Tiny pop | On the frame | -12 to -16 |
| Cascade of 5 to 7 items | Sparse, uneven ticks on 2 or 3 of them | On those landings | -14 to -18 |
| Wipe | Filtered sweep | Through the wipe | -12 to -16 |
| Continuous reveals (slow pulls, focus, quote cards) | Nothing, or one very light cue | | |
| Bed (optional) | Ambience or room tone | Whole scene | about -35 LUFS, never digital silence |

Per-character typing ticks are allowed only in a VO-free UI demo where typing is slow and visible, at a low level, with every tick a different variation ("twenty key ticks are twenty different ticks"); with a voice, use texture or per-word ticks.

Sub-bass hits: one long quiet low hit under the thesis and one under the CTA (about 1.7 to 1.8 s, linear gain about 0.2), with about 0.3 s of silence before, never on a product beat. Keep only one sub hit owner in any moment.

## 4. Density

- Default ceiling: about 15 events per minute in voice-led films and ads, peaks under about -18 dBFS, always under the voice. About 8 well-chosen effects in 18 s reads as designed; about 20 reads as generic.
- Choose 3 to 5 SFX kinds per film and reuse them; fifteen distinct sounds sound like a library demo.
- At most two cues in any 100 ms; if two land within 40 ms keep one; at most three simultaneous cues; soften cues that cluster within about 0.15 s (x0.6 gain). Never two sounds on one instant by accident.
- One signature riser and one signature impact per film; a second riser halves both. Transitions get soft whooshes or swishes only.
- Nothing repeats as a tic: a cue firing more than twice in a 45 s film becomes noticeable.
- Exception (scoped): motion-only product films where a client asked for sound on every mechanical move: micro sounds on each small move are allowed when each is a real recording tied to a visible contact and peaks at or below the local music peak.
- A request for "more SFX" means a richer event score (anticipation, contact, docking, reveal each with distinct sounds), never louder music or a whoosh on every cut.
- Looping elements stay silent (the sound would repeat with every loop).

## 5. Placement rules

1. Place by the sound's measured sync point, not the file start: the transient peak (argmax of the absolute signal, or the first sample above about -30 dBFS of the peak) for one-shots, the pass-by peak for whooshes, the end for risers and swells. Trim recording lead-in (some whoosh files peak 1.5 s in; a 33 ms lead-in made every hit 2 frames late). In a timeline: start = event time minus the sound's sync offset; re-derive after every retime of the host scene.
2. Never late: a transient may sit up to 1 to 2 frames early, never after its picture.
3. Bind envelopes to motion phases: anticipation (charge), travel (whoosh following speed, not elapsed time), contact (transient on the exact frame), recovery (tail ends with the visual settle). Pen and drag sounds follow the measured speed of the element.
4. Moving sounds travel across the stereo field; pan each to its screen x (about +/-0.6). Hits stay mono-safe (M/S widening, no Haas on anything that must survive mono).
5. Tuned effects follow the film's key (pentatonic of the key, or `m.form.chord_at(t)`); there is no default key.
6. Musical moments snap to bar and beat; UI sounds (typing, clicks) stay on the picture.
7. J and L cuts: an ongoing scene sound crosses the cut (heard 0.3 to 0.8 s before its picture, or still heard 0.5 to 1.5 s after), never a hit. Room tone continues across views of one place; a change of place or perspective may deserve an audible handoff. Use sound as a transition at least twice in narrative films.
8. Fades: 30 ms fades at every segment boundary prevent pops; long samples clipped to a short motion get a short end fade; cut from the first transient, not from zero; watch the truncation seam when a cue is shorter than its asset.
9. In seek-driven compositions preload audio at init and use a fire-once guard per cue; `ffmpeg adelay` is in milliseconds.

## 6. Audibility (a cue nobody hears is a bug)

- Measure each cue in its own window against the music-only render, not full-band loudness of the whole mix. Use K-weighted loudness over a 15 to 500 ms speaking window, and the cue's own band.
- Fail when a cue sits more than 6 dB under the ducked score in its window. Transients may sit at -3 to -6 relative, sustained cues want -3 or better. Raise the cue's own gain first; a launch film may raise a buried cue at most +8 dB.
- With a voice: a cue is audible when its transients land within roughly 12 dB of the narration in that window (read a per-100 ms envelope, not one window peak). Short effects peaking about 11 to 14 dB under voice peaks stay clear without masking speech.
- In-band levelling (calm films): about +3 to +4 dB over the music in the effect's own band, with the 2 to 8 kHz lift capped at about 4 dB (never spiking 10 dB or more); whooshes as a soft air pass at +2 to +3 dB raising short-term loudness at most 0.5 LU; hero mechanical moves +8 to +10 dB in-band with an explicit cap. Peak cap: no effect more than about 6 dB over the local music peak (8 dB for the signature hit). Level floors: over a dead stop or sparse intro, set a minimum absolute level so "+N dB over the music" does not vanish. Report the 150 ms "body" RMS lift, not only the 50 ms peak.
- If an asset's mean level is more than about 15 dB below the narration, no cue volume will save it: level the asset itself (gain plus limiter plus fade, keep the original, name the derived file with a suffix).
- Clean sources: high-pass about 150 to 220 Hz, low-pass about 6.5 to 11 kHz, click-free fades (10 ms in, 0.15 s out). Reject candidates with more than 50 % energy below 150 Hz, more than 40 % above 6 kHz, or noise-like character; calm-film whooshes had little energy below 150 Hz and an 80 to 400 ms rise.
- Avoid foley and music piling under 300 Hz: high-pass foley around 220 Hz, lift above 3 kHz.
- Every row of the sound plan must be measurably present in the final mix (ice-qa checks it).

## 7. SFX library policy

1. The plugin ships no audio files. It ships code-made SFX (mgaudio) and this policy. CC0 packs (Freesound CC0 sounds, Kenney packs, the CC0 VCSL samples) are offered only in the optional, disclosed Release asset pack.
2. Search order for recorded sounds: the user's own files, the asset pack if installed, Freesound with the CC0 filter, Kenney, then category-licensed libraries whose terms cover the use case. License classes, each library's recorded terms and the license check per file: the `ice-assets` skill, `references/sourcing-and-licenses.md` sections 2 and 3.
3. Name effects concretely when searching (a material and an action, never "dramatic sound"); prefer clips of 15 s or less. Shortlist 3 to 5 candidates with link, creator and license for each hero sound; step mode puts them on the review card, auto mode picks by measurement (sync point, spectrum fit, audibility) and lists the others in the delivery note. No match: skip the cue and say so rather than failing or inventing.
4. Bundled previews may be compressed: for hero sounds fetch the original into the user's project. Freesound needs a free account that only the user can create: ask for it inside the router's stops (`ice-motion-director/SKILL.md` section 5, "Stops"); without it, use a code-made SFX or a preview that passes the audibility check, and note it in the delivery note.
5. Library hygiene for any pack: leading silence trimmed, max 4 s (risers 6 s, ambience 20 s with 1 s fades), one-shots peak-normalized to -3 dBFS (raw generations differ by 20 dB), ambience at -35 LUFS, 48 kHz, mono when channels are identical, a manifest entry per file (file, category, duration, source URL, license, attribution) and a license row.
6. Every recorded sound file gets one row in `ice/assets/CREDITS.md`: the `ice-assets` skill, `references/project-folders.md` section 4. Unknown license is unusable until checked.
7. AI SFX generators are optional and user-initiated: say the service, cost and that the sound is generated; describe the material and action specifically; keep under the service's length limit.

## 8. Feedback rounds

- When a client dislikes an effect, replace it with a cleaner one; do not delete it. Keep hero moments audible.
- Isolate complaints with a music-only render; change one thing per round and name it by timestamp; re-level effects for each music option.
