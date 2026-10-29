# Speaker isolation and caption layers

Merged from heygen-com/hyperframes (Apache-2.0: remove-background, embedded-captions, composition patterns, docs), Barty-Bart/motion-graphics (MIT: object-separation), majedphotos/video-ad-editor (MIT), nateherkai/herk-edit-kit (MIT, Use Permission), Omar-Tnzxo/video-production-studio, yihui-dev community camera-3d-captions (Apache-2.0), plus ideas restated from imMamdouhaboammar/motion-graphics-skills, hypit-ai/hypit and Vincentwei1021/video-talkcraft (ideas only). Caption text, grouping, styles and the drop, rail and embed model belong to the ice-type skill; Arabic text behind a subject (kashida crossing the head) belongs to the ice-arabic skill.

## 1. Layer stack (back to front)

1. Backdrop (original plate, or a replacement backdrop).
2. Graphics that sit behind the speaker (text behind subject, maps, shapes).
3. The speaker (matte or the original video).
4. Foreground UI, overlays and captions. Captions are never behind the speaker, except a deliberate embedded peak word designed with the ice-type skill.

News reel: the six-layer order of section 3b.

## 2. Isolating the speaker

Methods that need no model come first: they are part of FFmpeg (no download, no install, real time on CPU). Pick by how the footage was shot:

| Footage | Method | Download |
|---|---|---|
| Green or blue screen, or an evenly lit plain wall | `chromakey` (or `hsvkey`) plus `despill` | None |
| Locked-off camera with a few seconds of the empty room (at the start of the take, or as its own clip from the same tripod position) | `backgroundkey` (FFmpeg 6.1 or newer; check with `ffmpeg -filters`) | None |
| Anything else (moving camera, busy room, no empty plate) | Person matting or prompted segmentation (table below), installed without a question when it is free and pinned (`ingest-and-ledger.md` section 6) | The model |

Commands, measured on synthetic 1280x720, 25 fps clips made with `lavfi` (FFmpeg 8.1): a 300x500 subject on a 0x00B140 green, and a 300x500 or 640x700 subject over a static bar pattern with grain added (`noise=alls=6:allf=t`). In every run below the background came out fully transparent (alpha 0) and the subject fully opaque (alpha 255); the transparent share matched the background's share of the frame (0.837 and 0.514). Read the screen's colour from the footage first (a pixel of the background in a frame without the speaker), then:

```
# Green screen or plain wall, to an alpha master (ProRes 4444)
ffmpeg -i in.mp4 -vf "chromakey=color=0x00B140:similarity=0.12:blend=0.05,despill=type=green" -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le speaker_alpha.mov

# The same key in HSV terms, steadier on an unevenly lit wall (hue in degrees)
ffmpeg -i in.mp4 -vf "hsvkey=hue=142:sat=0.7:val=0.5:similarity=0.2:blend=0.05,despill=type=green" -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le speaker_alpha.mov

# Straight onto a new backdrop in one pass
ffmpeg -i backdrop.mp4 -i in.mp4 -filter_complex "[1]chromakey=color=0x00B140:similarity=0.12:blend=0.05,despill=type=green[fg];[0][fg]overlay=format=auto:shortest=1,format=yuv420p" -c:v libx264 -crf 16 out.mp4

# Locked-off camera, the empty room as its own clip: the plate goes first, the key learns it, then it is trimmed off
ffmpeg -i plate.mp4 -i talk.mp4 -filter_complex "[0:v][1:v]concat=n=2:v=1:a=0,backgroundkey=threshold=0.3:similarity=0.1:blend=0.02,trim=start=<plate seconds>,setpts=PTS-STARTPTS" -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le speaker_alpha.mov
```

Tuning, measured:
- `chromakey` / `hsvkey`: raise `similarity` in steps of 0.02 until the screen is gone in the worst-lit corner, and stop before hair or clothes start to go; `blend` 0.02 to 0.08 softens the edge. `despill` removes the green fringe; use `type=blue` for a blue screen. A speaker wearing the screen's colour cannot be keyed: use the model route.
- `backgroundkey` learns the background from the first frame it sees, so that frame must be the empty room. Its `threshold` is a scene-change reset, not a key strength: when the whole frame changes by more than it, the filter takes that frame as the new background and the speaker vanishes. Measured: with grain, 0.04 reset on noise alone (whole frame transparent); 0.08 held a speaker covering 16 percent of the frame but reset when the speaker covered 49 percent; 0.2 and 0.5 held both. Start at 0.3. `similarity` (default 0.1) is the per-pixel tolerance: raise it for grain or compression noise, lower it when a speaker's clothes match the wall. The camera, exposure, white balance and light must not change during the take; any change shows as holes or a halo.
- Check alpha on three hard frames (hair, hands, the frame bottom) before the full render, as for any matte below.

Model-based isolation, for footage the two keys cannot handle:

| Tool | Use | Notes |
|---|---|---|
| Person matting (u2net human segmentation class, CPU) | Talking heads, text behind subject, cutout layouts | Alpha output as VP9 WebM (about 1 MB per 4 s), ProRes 4444 `.mov` or PNG frames; quality fast CRF 30, balanced 18, best 12. CPU only, about 2 fps at 1080p. The background plate it writes is hole-cut, not inpainted: a clean empty plate needs an inpainting model |
| Prompted segmentation (SAM 2.1 class), local | Objects, props, hands, any non-person subject | Model by machine: 12 GB or more GPU large (898 MB), smaller GPU or Apple Silicon base-plus (323 MB), CPU tiny (156 MB). CPU is slow (about 5 s per frame): suggest separating only the needed range. Work at 960 px wide (the model resizes to 1024 itself, smaller is not faster). Convert variable frame rate first. Nothing is uploaded |
| A real empty plate | Background replacement behind a locked-off speaker, and the `backgroundkey` route above | About 5 s of the empty room from the same tripod position, when the user supplied it or a stage 01 question asked for it. Auto mode with no plate: decide the fallback (keep the original room, or a hole-cut matte over a designed backdrop), log it in `ice/DIRECTION.md` and report it in the delivery note |

Model downloads are large: use them only when neither key above fits the footage. A free model pinned in the `ice-engines` skill's `references/versions.json` is installed without a question once the free space check passes, and recorded (`ingest-and-ledger.md` section 6); a paid or account-bound model stays a question. When the space check fails or the install cannot finish: keep the original frame (no isolation), log it, and say in the delivery note what the model would add.

Mask quality:
- Try a short range first (about 20 frames), check it, then run the full range in chunks (60 frames, each seeded by the previous last mask).
- Spill onto something that is not the subject: add a negative point there and rerun; a missing part: add a positive point. Anything attached to the subject counts as part of it unless excluded.
- Masks are hard-edged: clean on objects and hands, weaker on soft hair. Compare edges (hair, hands, frame bottom) on 3 hard frames before a full render; jitter metric: mean mask edge change under 0.003 between frames.
- Feather mattes 2 to 4 px and tint rims to match darker backdrops. Never hide a bad mask with glow.
- Keep the original frame when the room matters, the mask chatters, or the lighting will not match.
- Never composite a cutout over a different take of the same person.

## 3. Frame-aligned layers

- A cutout and its original background must stay frame-aligned: give both media the same start and playback offset, and show or hide them through wrappers, not by retiming one of them. Different starts cause a one-frame jitter at the cut.
- In HyperFrames, timed elements are forced visible; wrap the video in an untimed div and animate the wrapper for push-ins and picture-in-picture. Do overlays in post with ffmpeg against a PNG sequence when WebM alpha decoding is flaky; decode alpha WebM with the explicit VP9 decoder or the transparent area renders black.
- Full frame to picture-in-picture: swap the backdrop first, hold, then scale and move the speaker, then reveal the information that needed the space. Never all on one frame (it shows a double speaker).
- Text behind subject: real occlusion by the matte, with slight opposite drift on the two layers. Use it as a scarce peak (once or twice per video, 1 to 3 words). Cutout effects need segmentation and run at most once or twice per video. News reel (edit type `news-reel`, style family `family-broadcast-news.md`), or any edit whose reference measures more uses: the cap is the measured count of the reference (or of the package, `family-broadcast-news.md` section 2), logged in `ice/DIRECTION.md` with the count and its source; the occlusion and edge checks still apply (section 3b).
- Speaker badge (long-form explainer with B-roll): once placed it is locked (no drift or breathing) while the speaker keeps moving inside it; in the lower third, bottom on the action-safe margin; badge and captions on opposite sides; in vertical video the badge goes bottom-left because the right edge holds the platform's buttons. Establish the speaker full or half body for the hook (about the first 8 s) before shrinking to a badge.

## 3b. Programme matte kit

Scope: news reel (edit type `news-reel`, style family `family-broadcast-news.md`; `edit-types/news-reel.md`), or an edit whose reference measures these devices. Everywhere else the scarcity rules of section 3 hold. Numbers are measured at 25 fps; with a reference, its own values win. Each device gets its plan row with the trigger word and the role it is on (`broll-and-motion-broll.md` section 1, roles from `ice-remake/references/notes-files.md` section 6).

**The depth sandwich is the layout, not a peak.** In this scope the presenter is matted for the whole take (5 of 6 measured reels) and every room graphic of every beat sits between the plate and the cut-out. Segment the presenter once and keep the matte as a track for the take (section 2); feather it (tutor value: feather 5 with contrast 80 percent on a 2160 wide plate) and run the three-hard-frame edge check of section 2 before the full render.

Layer order (back to front):

| # | Layer | What sits there | Camera |
|---|---|---|---|
| 1 | Plate | The studio take, or a virtual set (below) | rig |
| 2 | Plate reactions | Background wash, brand flash, room darkening for a spotlight, room desaturation | rig |
| 3 | Behind the person | Question disc, ghost programme title, titles behind the head, sepia portrait, B-roll behind the cut-out, maps and flags | rig |
| 4 | The person (matte) | The presenter, lit at source exposure (section 5) | rig |
| 5 | In front of the room | Glass plates, quote cards, pills, a discussed person's silhouette, anonymous silhouettes of a force | rig |
| 6 | Screen | Captions, logo bug, programme name, progress bar, location tag | screen (never moved by the camera, never hit by a flash) |

Room and screen tags: `layer: rig` or `layer: screen` in `plan/shots.json` (`ice-motion/references/camera.md`, "Digital camera on one take (news reel)").

**Background wash and brand flash.** On layer 2 only, so the person is untouched: measured, the saturation inside the matte moved -6 to +4 while the background moved +40 to +144. Envelope 10 f (0.4 s: deep 4 f, light 2 f, lifted pale 4 f) or 6 f (three steps of 2 f), often with a pale rectangle of about 8 percent white on its middle frames, laid over the start of a big zoom. Trigger: frames 1 to 5 of the reel, and the clause that opens a topic, turns a premise into a question, or starts the tune-in line, -7 to +3 f against the clause's first word (2 to 3 per reel). It is a plate reaction (the `ice-type` skill, `references/depth-and-embedded-captions.md` section 1), not a ground change. Its colour is the package's brand colour or the user's (`family-broadcast-news.md` section 2).

**Question disc.** Layer 3, behind the lit presenter's head. Trigger: each new opening question (3 of 3 question plates against 0 of 2 statement plates and 0 of 2 follow-up questions); also the programme title at the sign-off, and weakly a violent hook clause or the flag on a country's name. It enters with the question's plate, 5-20 f (0.2-0.8 s) after the question's first word, settles behind the head on its last word, and leaves 7 f (0.28 s) after the question ends, as a follow-up starts. Never on a statement, a follow-up or a darkened person. Look and motion: `ice-motion/references/atomic-moves.md`, "Broadcast news moves".

**Ghost programme title.** Layer 3, on the spoken programme name (-29 to 0 f against the name), white at 20-30 percent opacity behind the head, sliding across at 25-44 px per frame, blink-in 5 f, blink-out 4-5 f before the first keyword or at the next flash. It never competes with the face or a keyword.

**Discussed-person silhouette with the symbol flip.** For an actor of the story named as the subject of the sentence (a leader, a state, a group), never the speaker: a dark rim-lit cut-out made from a licensed portrait (curves to near black, rim glow; provenance in the footage ledger), on layer 5 in front of a symbol or the disc, a headline behind it. It rises about 30 f (1.2 s) before the name; the symbol behind it flips from its own colours to the house palette on the frame of the spoken name (about 14 f, lead 0); it falls out (about 21 f) when the speech moves to the next person. Groups named as new actors are shown as words beside the lit head instead; a collective force acting gets anonymous near-black silhouettes in front with sepia archive behind (weak, one instance each).

**Sepia portrait of a quoted or discussed person.** Layer 3, behind the speaker, recognisable (not dark): on the word naming the person's statement or title (-2 to -17 f), in over 12-34 f, out over 3-6 f as the speech moves on; sepia at 60-70 percent opacity. Sepia is reserved for pictures from outside the studio. Licensed portrait or still, logged.

**B-roll behind the cut-out.** Layer 3: footage at about 25 percent opacity with a feathered mask of 73-173 px (tutor values, scale with the frame width), usually black and white; a map video on the wall at about 13 percent in a hard-light blend. Treatments: `broll-and-motion-broll.md` section 3, "News reel B-roll treatments".

**Spotlight on a discussed person.** For a clause about targeting or striking a discussed person: the room (layer 2) goes to about half its luma through a radial mask that excludes the matte, at the noun that names the target, and is relit 7-15 f after the clause ends; the presenter's face keeps its source luma. A target mark (a crosshair, a ring) goes on the discussed person's picture, never on the presenter, even where a reference placed it over the presenter's head (section 5, "Copying a reference"). Weak: one instance.

**Virtual set.** When the room is not the set: a keyed or matted presenter over a built backdrop (gradient, a still, a render) with the disc behind the head, props as layers in depth and parallax from the camera wrapper. Ground the person with a fake floor shadow made from their own matte (extract the alpha, squash it vertically, shear it away from the key light, blur it, tint it 2 to 3 shades darker than the floor) or with a real shadow catcher. Routes and limits: `ice-motion/references/depth-and-3d.md`, "Build routes for depth and 3D". Match the light: the key's direction and colour on the person must agree with the set.

**The split seam.** Presenter on top, evidence below a feathered seam: `vertical-conversion.md` section 3, "Split (news reel)".

**The speaker in this kit.** The speaker or guest is never darkened, silhouetted or tinted while speaking, and never placed inside the disc, a symbol or a mark. Desaturation and a push-back (scale down) of the speaker are used only where the reference measures them: while a discussed person's image is foregrounded (measured: over 45 f, back to full colour as the image leaves) and in the call-to-action mood switch (`broll-and-motion-broll.md` section 3, "CTA desaturation (news reel)"); the luma check of section 5 still holds. One measured exception to "never dark": a presenter seen as a silhouette for under 1 s before the first word of a cold open, lit 2-3 f before speaking (`edit-types/news-reel.md` section 5).

Check: at 04 the plan names each device's layer, trigger word and role; at 07 the stills at each device's settled time show the speaker at source exposure (section 5), the matte edges clean on three hard frames, and no layer 3 element covering the face.

## 4. Caption layer placement on footage

| Topic | Where the rule lives |
|---|---|
| Face, hands, layout spots (seam, shirt, clear zone), captions across a cut | The `ice-type` skill, `references/caption-placement-safe-zones.md` section 4 |
| Contrast, dark side of the frame, halo over skin, re-picking contrast after a footage swap | The `ice-type` skill, `references/caption-placement-safe-zones.md` section 5 |
| Caption band policy (reserved band or overlay law, scoped) | The `ice-type` skill, `references/caption-placement-safe-zones.md` section 3 |
| Platform safe zones | The `ice-engines` skill, `references/platform-specs.md` section 3 |
| Never blink out, speaker-turn handoffs | The `ice-type` skill, `references/captions-system.md` section 5 |
| Head-following captions | The `ice-type` skill, `references/captions-system.md` section 7 |
| When to refuse or split a clip before captioning | The `ice-type` skill, `references/captions-system.md` section 4 |

Rules specific to edits with layers:
- Card layouts: the caption sits fully above the video card.
- One text at a time: when a graphic writes the spoken sentence, hide that caption; a caption below plus text above splits attention.
- Before matting or embedded captions, split multi-speaker or hard-cut clips per shot (the matte follows one subject per shot).

## 5. The speaker stays lit

Rule (owner decision, 2026-10-29). Scope: news and current-affairs reels, explainers with a presenter, talk shows, podcasts and interviews, and every other edit where a person on screen talks about other people, places or groups. Other film types (drama, music video, fiction, a designed character film) follow their own treatment and are outside this section.

- **Who the devices are for.** Dimming, silhouette, desaturation, a circle or ring around a face, crosshair or target marks, a warning halo or disc, a strike-through and any similar device that singles someone out belong to the people, places and groups being talked about: their photos, their footage, their cutouts. They are never applied to the speaker, presenter, host, interviewer or guest who is talking, in any shot of them.
- **Exposure and colour.** The speaker keeps the source exposure and colour. A grade may match the speaker's shots to each other or fix a measured exposure problem (`ingest-and-ledger.md` section 5); it never darkens, desaturates or tints the speaker to set a mood.
- **Marks.** The speaker stays clear of every mark: nothing from the list above sits on or around their face or body, and a mark aimed at someone else is placed so it does not touch the speaker's box.
- **Isolation.** The isolated speaker layer (section 2) is composited lit, at source exposure, in front of any dimmed or marked layer behind it (section 1, layer 3). A cutout of the speaker is never placed inside a subject's ring, disc or silhouette treatment.
- **Copying a reference.** A device seen in a reference follows the role, never the screen position: read in the reference's speech who that person is (the reasons table of the edit, see the B-roll plan in `broll-and-motion-broll.md` section 1) before copying it. In the edit it lands on the person our speech talks about, at the word that names them.
- **Text over the speaker's shot.** Contrast for a text card comes from a scrim under the text only. A full-frame takeover that blurs or dims the whole shot behind its text is used only when the reference measurement or a logged reason shows it; it lasts only while the text is on screen, and the speaker returns at source exposure as the text leaves. It is a legibility device, never a look held on the speaker.
- **Measured exception (news reel).** In the scope of section 3b only, the speaker may be desaturated and pushed back where the reference measures it (a discussed person's image foregrounded, the call-to-action mood switch), never darkened or silhouetted while speaking; the check below still holds.
- **What does not change.** A deliberate story choice the user asked for in their own words (a speaker hidden in silhouette to protect their identity, a speaker shot in the dark on purpose) is followed and logged in `ice/DIRECTION.md` with the user's words. A reference, a template or a brief written by another agent never counts as that request.
- **Check.** At 04 the plan names, for every device, who it is on. At 07 the stills at each device's settled time show the speaker at source exposure: the mean luma of the speaker's box stays within about 5 percent of the same box in the source frame (outside a text takeover), and no mark touches that box.
