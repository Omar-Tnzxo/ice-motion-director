# Sound effects: selection, placement, audibility, library

Read when building the SFX pass from the cue sheet, when choosing a sound for a picture world, and before delivery to prove every SFX is audible. Sources: Barty-Bart sound-effects (MIT), anidoodle sound design (MIT), motionmaxxing sound-sync (Apache-2.0), echris6 motion-video-kit (MIT), herk-edit-kit (MIT), browser-use/video-use (MIT), lemo-opuscar (MIT), mg-styles-15 (MIT), product-launch-motion (MIT), claude-motion-design (MIT), haidrrrry claude-remotion-skill (MIT), explainroo (MIT), majed video-ad-editor (MIT), hyperframes media-use (Apache-2.0), video-production-studio (founder), with ideas restated from commercial-motion-design, Mamdouh, hypit and noncommercial sources.

## 1. Principles

1. Every SFX has a visible cause. Effects that match nothing on screen are banned by default; a non-diegetic hit on a stated beat (a title on black, a reveal) passes when a trailer or horror style, or the reference's sound map, places it, with its plan row. If you cannot say what a sound marks, cut it. Restraint is the design.
2. One sound per event, not per element; one identity per cause ("every press of every button is the same click"), with varied takes or seeds so repeats do not sound robotic. Change the sound only when the event's dramatic role changes.
3. Match the material and the physics: paper, wood, metal, glass, ink and plastic sound different. A chime on a click is the most common template tell.
4. Effects only on real direction changes, landings, contacts and reveals. Never under every motion and never a constant bed of whooshes. Let some cuts pass without a whoosh.
5. Silence is a tool: drop every effect (and dip the bed) about half a second before the most important line or hit. Quiet is scored, not leftover; record the reason for each silence.
6. When a graphic or component already produces its own sound, do not duplicate it with another track.
7. Banned as defaults: a stock swoosh on every cut, trailer booms and risers everywhere, laser zaps, pitch-drop plops and sci-fi chirps in non-sci-fi films, sharp swooshes, an ending chime by reflex. A game, cyberpunk, cartoon or trailer style, or the reference's sound map, keeps the sounds it names with its plan row (the `ice-direction` skill, `references/treatment.md` section "Craft plan").

## 2. Recorded or designed library sounds, for every picture world (owner decision, 2026-10-29)

Effects come from the SFX ladder (`ice-audio/SKILL.md` section 5) in every film type. Sound made by code is opt-in only (`ice-audio/SKILL.md` core rule 7): code-made effects were rejected as noise, and one synthetic tone per event was rejected as cheap.

| Picture world | Use |
|---|---|
| Physical contact in real or realistic worlds (product films with mechanics, paper and desk worlds, footage edits, brand films for clients) | Recorded sounds. Synthesized "thocks" were rejected as a pitched tom; layered real recordings about 100 ms long (a key press plus a soft body punch) worked. |
| Synthetic picture worlds (UI blips, pixel and 8-bit, HUD, glitch, liquid, cartoon, abstract graphics) and films with no other assets | Designed library sounds: the ladder's libraries carry UI, HUD, glitch, 8-bit and cartoon packs made by sound designers. Search by the interface action or the material (section 7 item 3). |
| Nothing on the ladder fits, or no sound can be had | Skip the cue and say so in the delivery note (section 7 item 3). |

Phone rule for any source: a landing needs harmonics above any sub so it is heard on phone speakers (section 6 rejects and levels the rest). With opt-in sound made by code, music-by-code.md section 7 holds the generators and the layering rules (a noise transient, a body, a tail; "a single noise burst is not an effect").

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

News reel (edit type `news-reel`, style family `family-broadcast-news.md`): section 3b replaces this table and the sub-bass rule above.

## 3b. Broadcast SFX by move

Measured on six broadcast reels at 25 fps (talk-show promo, explainer promo vertical and horizontal, English explainer reel) and taught by broadcast editors (ideas only). Offsets are the sound's peak minus the first frame of the visual move, in frames at 25 fps (1 f = 0.04 s); negative = the sound comes first. The move homes: digital zoom in `ice-motion/references/camera.md` "Digital camera on one take (news reel)", flashes and wipes in `ice-motion/references/cut-catalog.md` "Broadcast transitions", discs, pills and counters in `ice-motion/references/atomic-moves.md` "Broadcast news moves", pointer reveal and typewriter in `ice-type/references/type-effects-specs.md` table "Broadcast text", washes in `ice-edit/references/layers-and-isolation.md` "3b. Programme matte kit". Every sound is a recorded library sound (section 2 and the SFX ladder); one sample per type for the whole reel. Rank candidates with `scripts/match_music.py sfx --kind impact --profile news-reel` (or `--kind whoosh`): that profile rejects a sound with over half its energy in the 150 Hz to 4 kHz voice band and keeps sub booms and air ticks. The build chain: `mix-and-master.md` section 6, "News reel build chain".

| Move | Sound | Timing against the move (25 fps) | Level |
|---|---|---|---|
| Pointer reveal or typed keyword | Write-on data chatter: high electronic beeps, 75 to 99 % of the energy above 4 kHz, 2 to 5 bursts spread over the pointer's 7 to 12 f | First burst 0 to +2 f (median +1 f) from the pointer's first frame, last burst on its removal frame; it sits under the spoken word | -29 to -46 dBFS, 14 to 27 dB under the voice |
| Typewriter with a coloured head (typing sound under a voice) | Typing texture, or one key tick per word (never per character), high-passed to air; the pointer reveal takes the chatter row above | First tick on the head's first frame (0 to +2 f), last on its last word; nothing on the blink exit | -29 to -46 dBFS, 14 to 27 dB under the voice (editors' clip gain about -5 dB) |
| Slow digital reframe (push, pull, drift) | Nothing (60+ measured reframes are silent) | | |
| Fast ease-out digital zoom that opens a new clause | Sub boom, 89 to 99 % under 150 Hz, rise 120 to 290 ms | -1 to +5 f (-0.04 to +0.2 s) from the zoom start | -8 to -10 dBFS low band, 12 to 14 dB over the voice median |
| Digital zoom where the reference measures a whoosh | Soft air whoosh, high-passed so its energy under speech is above 4 kHz | Pass-by peak at the zoom's peak speed; the file starts 2 to 4 f (0.08 to 0.16 s) before it | 10 to 14 dB under the voice peak |
| Background wash or brand flash (section start) | HF tick, then a low thump (280 to 360 ms, under 150 Hz, 2.4 to 3.1 s tail) | Tick 1 to 2 f before the first coloured frame; thump on the second colour step (+1 to +2 f) | Tick -40 to -42 dBFS, thump -36 to -38 dBFS |
| Edit into or out of archive or B-roll | Sub boom on the cut, mono, 97 to 100 % under 150 Hz, rise 50 to 120 ms, decay 0.6 to 1.4 s (up to 1.9 s) | +1 to +4 f (0.04 to 0.16 s) after the cut; never on the frame itself in the talk-show package | -3.8 to -8.3 dBFS low band, 13 to 17 dB over the voice |
| Pre-cut swell into and out of B-roll (horizontal explainer package only) | Short riser, 600 to 1300 Hz, rise about 0.5 s and never over 0.7 s, abrupt stop | Ends 1 to 2 f (0.04 to 0.08 s) before the cut, then the sub boom of the row above | About -17 to -20 dBFS |
| White flash in or out of B-roll | Low whoosh-boom, 85 to 99 % under 150 Hz, tail 0.7 to 4.5 s | +3 to +6 f (median about 0.15 s) after the white frame, on a phrase boundary | -19.6 to -23.8 dBFS (about voice level) |
| Red flash, strobe or glitch clip in archive | Low boom or a mid-high glitch; a stutter of 8 HF stripes in 0.5 s on an interleave | +5 to +8 f after the strobe starts; the stutter on the interleave; in the default strobe safe mode (`cue-map-and-beat-sync.md` section 6) one hit per replacement flash | -21.6 to -29.8 dBFS; stutter -15 to -20 dBFS |
| Graphic flicker-in (headline, bullet, fact pin) | HF tick, 63 to 99 % above 4 kHz, 40 to 360 ms | -6 to +2 f from the flicker-in; a fact pin on the text's completion | -19 to -31 dBFS |
| Card or title pill pops | Low thump, 70 to 90 ms, 77 to 96 % under 150 Hz | +1 to +2 f from each pop | -20 to -33 dBFS |
| A card or pill settles | Glint: a pure tone near 4.1 to 4.9 kHz, 0.2 to 0.25 s | On the settle frame (0 to +3 f) | About -20 dBFS in its band |
| Glow disc passes behind the presenter | Low thump | Peak about 0.3 s after the pass | About -24 dBFS |
| The key word or hit of a section | A camera shutter (the editors' choice), or a sub hit with a glint | 0 to +2 f from the word | Shutter at a clip gain of about -10 dB, then the check of section 6 |
| Counter running | A mechanical tick under the count, a thud when it lands | Section 3 counter row | -16 to -20 relative |
| Social icons | Tick stream, one tick every about 2.7 f over 1.4 s | From +1 to +3 f after the first icon | -30 to -43 dBFS |
| Archive montage (voiceless) | A low hit on every cut and every red frame, accelerating with the cuts, about 0.4 s apart | -2 to +5 f (median +2 f) from each cut | -6 to -16 dBFS (as loud as the voice) |
| Cold-open beat | Low hit | 2 to 7 f before the new image | -6 to -18 dBFS |
| Brand sting on frame 1 | Short bright swish, 98 to 100 % above 4 kHz, 130 to 140 ms | f3, one frame before the sting is fully on | About -40 dBFS |
| Presenter lit by an exposure flash | Low hit, 130 ms | +1 f after the flash | About -21 dBFS |
| End card | The package pair: a bright mono downward swish (120 ms), then a low chime about 280 to 350 Hz (0.7 s), then silence; or a whoosh into an impact; or the outro faded to zero | Swish at cut +9 f with the logo rise, chime peak at cut +37 f with the time block; the impact 7 f after the transition starts | Swish and chime at voice level (about -20 dBFS) |
| The real event on screen | Actuality from the footage itself, no voice over it | With the footage | At or above voice level |

Levels: the dBFS column is measured on the references (levels under speech are lower bounds: separation leaks vowels, so a sound may sit up to 6 dB higher) and wins. The editors' clip gains (typing about -5 dB, shutter about -10 dB, a click about -6.6 dB, whooshes at 0 then every effect lowered together to about -11 dB at the end) are gain on the clip in an editor, a starting point before the measured check of section 6.

Reason rules for sound (one sound per meaningful event, never one per word; the strongest sound goes to the most important word):

| Trigger | Sound | Meaning |
|---|---|---|
| A keyword is written | Chatter, high and quiet | Information entered live; it never competes with the voice saying the same word |
| A section changes without a cut | Tick and thump | New chapter |
| An edit leaves or returns to the presenter | Sub boom on the cut | Carries the join and says "different footage" |
| A fast move opens a new clause, an object falls past the camera | Sub boom | Weight on the turn of the argument |
| A heavy picture enters behind the presenter | Low thump | Threat |
| A montage of archive proof | A hit on every cut, accelerating | Evidence, urgency |
| The real event is on screen | Actuality, no voice-over | This is real |
| The call to action starts | The bed leaves | The promotion is spoken plainly, voice alone |
| A key quoted line | Bed pulled out for about 3.5 s, back on a boom (measured once: weak) | Silence makes the quote heavy |
| The end card | The package's end sounds, then silence or a faded outro | Sign-off |

Sound NEVER list (news reel):
1. No effect in the 150 Hz to 4 kHz voice band while the voice talks: under speech every sound is sub (under 150 Hz: booms, thumps) or air (above 4 kHz: chatter, ticks, glints). This replaces the band-share reject rule of section 6 for this type; the loud booms may be loud only because they are sub only.
2. No long riser: no build of 1 to 4 s before any flash, cut or end card; the only swell is the pre-cut swell row above (at most 0.7 s).
3. No whoosh on slow digital reframes.
4. No sound on exits (blinks, flickers, caption cuts, card fades), on captions, logos, badges, the progress bar or slow card builds.
5. No sound on images of people as such (no footsteps under silhouettes, nothing on sepia stills, portraits or read quote cards).
6. No reverb or stereo placement on the voice; no sound on the hard-cut frame itself in the talk-show package (the first end-card sound comes 9 f later).
7. No music on the talk-show end card.
8. No transition sound in the middle of a phrase: flashes and booms sit in breaths, on phrase boundaries or on J and L cut joins.
9. No loud hit over a spoken statement in the explainer package: the loud hits live in voiceless montages and on the end card.
10. Never copy the references' flaws: anti-phase subs, true-peak overs.

Density (scope line for section 4): in a news reel the "about 15 events per minute" ceiling and the "one signature riser" rule are replaced by this section: one sound per measured move type in the table, as many as the picture events carry (the reference's sound map, `sound-map.md` section 4 item 4, or the picture events when speech covers the track); montage hits every 0.4 s inside a voiceless montage; risers only as the pre-cut swell row, in the horizontal explainer package. The rules of section 4 against clusters (two cues within 40 ms, three at once) still hold.

## 4. Density

- Default ceiling: about 15 events per minute in voice-led films and ads, peaks under about -18 dBFS, always under the voice. A reference's sound map (its measured events per minute and riser count) or the chosen style's sound line (illustration only: a trailer with a riser per act, a cartoon, a Foley-dense film) replaces this ceiling and the signature riser rule below, with its plan row; the news reel is the measured case (section 3b, "Density"). About 8 well-chosen effects in 18 s reads as designed; about 20 reads as generic.
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
- Under speech, in any film: while a voice talks, an effect sits in the sub band (under 150 Hz) or the air band (over 4 kHz), so the 150 Hz to 4 kHz voice band stays clear (measured on broadcast packages; the news reel's section 3b NEVER item 1 is that case). The `news-reel` profile of `scripts/match_music.py sfx` ranks candidates for this band whatever the film type (section 7 item 3).
- Clean sources, for effects that play in the clear (no voice over them): high-pass about 150 to 220 Hz, low-pass about 6.5 to 11 kHz, click-free fades (10 ms in, 0.15 s out). Reject candidates with more than 50 % energy below 150 Hz, more than 40 % above 6 kHz, or noise-like character; calm-film whooshes had little energy below 150 Hz and an 80 to 400 ms rise. This band filter and reject rule never apply to an effect under speech (the line above), and a reference's sound map or the chosen style's sound line may set another band for effects in the clear, with its plan row.
- Avoid foley and music piling under 300 Hz: high-pass foley around 220 Hz, lift above 3 kHz.
- Every row of the sound plan must be measurably present in the final mix (ice-qa checks it).

## 7. SFX library policy

1. The plugin ships no audio files. Ice's own Release asset pack `assets-sfx-v1` (about 58.6 MB, 128 recorded effects in 24 types, each file CC0 1.0 or public domain, pinned in the ice-engines skill, `references/versions.json` `asset_packs.sfx`) is fetched once by `python scripts/match_music.py pack fetch` into `~/.ice-motion-director/sfx-pack/` and checked by SHA-256, the zip and every file. It is a free download with no account: standing consent, no question; `ICE_OFFLINE=1`, `"downloads": "off"` or `"routes": {"ice_sfx_pack": false}` in `sources.json` turn it down (the ice-assets skill, `references/sourcing-and-licenses.md` section 0). It is rung 3 of the SFX ladder (`ice-audio/SKILL.md` section 5): the user's own files and libraries come first. Its `manifest.json` gives every file a `type`, a sync point `sync_s` and its levels: pick the type by the move (the table below), list candidates with `pack list --type <type>` (add `--profile under-speech` for a cue under speech), rank hero sounds with the `sfx` mode, then place the file at event time minus `sync_s` (section 5 item 1). One file per type for the whole film (section 3b). A file used in a film is copied into `ice/assets/audio/sfx/` and gets its row in `ice/assets/CREDITS.md` from the manifest's `source` block, status `licensed`; the delivery note says in one line: SFX pack `assets-sfx-v1` (CC0), the number of files used, fetched from the project's GitHub Releases with no account. Sound made by code stays opt-in, used only when the user names it (`ice-audio/SKILL.md` core rule 7).
2. Search order: the SFX ladder (`ice-audio/SKILL.md` section 5). Routes, endpoints, keys, license classes, each library's recorded terms and the license check per file: the `ice-assets` skill, `references/sourcing-and-licenses.md`.
3. Name effects concretely when searching (a material and an action, never "dramatic sound"); prefer clips of 15 s or less. Hero sounds (the signature impact and riser): fetch 3 to 5 candidates, rank them with `scripts/match_music.py sfx --kind impact` or `--kind whoosh` (the measures of sections 5 and 6: lead-in, rise time, tail, energy under 150 Hz and over 6 kHz, peak; a news reel adds `--profile news-reel`, and any cue under speech in any film its alias `--profile under-speech`, sections 3b and 6), and lay the best 2 to 3 on the same cut; who hears them follows the options flow (`ice-audio/SKILL.md` section 5), and without a listener the best by measurement is placed and the others are listed in the delivery note. Every other effect is picked by measurement alone (sync point, spectrum fit, audibility). No match on any rung: skip the cue and say so rather than failing or inventing.
4. Library previews may be compressed: for hero sounds fetch the original into the user's project when the route allows it. No Freesound key is never a reason for a sound made by code: Freesound through Openverse needs no key (it serves Freesound's high-quality previews, which still pass through section 6). A key or an account that only the user can create is asked inside the router's stops (`ice-motion-director/SKILL.md` section 5, "Stops"); without it, use the no-key rungs and note in the delivery note what the key would add.
5. Library hygiene for any pack: leading silence trimmed, max 4 s (risers 6 s, ambience 20 s with 1 s fades), one-shots peak-normalized to -3 dBFS (raw generations differ by 20 dB), ambience at -35 LUFS, 48 kHz, mono when channels are identical, a manifest entry per file (file, category, duration, source URL, license, attribution) and a license row.
6. Every recorded sound file gets one row in `ice/assets/CREDITS.md`: the `ice-assets` skill, `references/project-folders.md` section 4. An unknown license is a status (`unknown` or `needs purchase`), listed in the delivery note, never a block (`ice-assets` skill, `references/sourcing-and-licenses.md` section 0).
7. AI SFX generators are optional and user-initiated: say the service, cost and that the sound is generated; describe the material and action specifically; keep under the service's length limit.

Pack types by move (item 1; the manifest's `types` block repeats these uses). Inside a type, in order: the under-speech band filter for a cue under speech, the duration fit (a whoosh about as long as the move, a riser at least as long as the build), the `sfx` ranking for hero sounds and measurement alone for the rest (item 3), one file per type for the film logged in `ice/DIRECTION.md`.

| Move or event (sections 3 and 3b) | Pack type |
|---|---|
| Camera push, spatial move, soft scene cut | `whoosh_soft` (pass-by peak on the move's peak speed) |
| Fast move, whip, hard transition | `whoosh_hard`, `transition` |
| Swipe, card slide, wipe | `swipe`; `paper` in desk worlds |
| Section change, time cut | `transition` |
| Card or pill pop, a heavy picture entering behind the presenter | `impact_low` |
| Reveal, logo slam, end card hit | `impact_cinematic` (the loudest effect) |
| Edit into or out of archive, a fast zoom that opens a clause, a montage cut | `sub_drop`, then `impact_low` |
| White or colour flash, exposure flash, a strobe replacement | `flash_hit` |
| Build-up into a hit | `riser_short` (news reel: at most 0.7 s, trimmed from the start; the sync point is the arrival) |
| Glitch transition, graphic flicker, tech error | `glitch` |
| Write-on keyword, pointer reveal, terminal or HUD build | `data_chatter` |
| Counter step, cascade landing, icon stream, hover | `tick` |
| Press, toggle, tap | `ui_click` |
| Appear, badge | `ui_pop` |
| Success, check, card settle | `ui_ding` |
| A message or phone notification on screen | `ui_notification` |
| A calm end card sign-off | `chime_low` |
| Typed text under a voice | `keyboard` (one per word) or `typing` (a texture clipped to the typing) |
| A key word or hit of a section, a photo, a freeze frame | `camera_shutter` |
| A page turn, a document sliding in | `paper` |
| A bed under a scene | `ambience_room_tone`, `ambience_crowd`, `ambience_city` (beds sit at -35 LUFS; the bed level comes from `mix-and-master.md`) |

## 8. Feedback rounds

- When a client dislikes an effect, replace it with a cleaner one; do not delete it. Keep hero moments audible.
- Isolate complaints with a music-only render; change one thing per round and name it by timestamp; re-level effects for each music option.
