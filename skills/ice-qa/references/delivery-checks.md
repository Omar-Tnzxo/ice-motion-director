# Delivery checks: the file, safe zones, assets, compliance, render approval

Checks on the exported files before they are handed over. Platform specs and safe-zone geometry are owned by the ice-engines skill; asset rights and the truth sheet by ice-assets. Sources: iart motion-skills (MIT), hyperframes and its docs (Apache), herk-edit-kit (MIT), motionmaxxing (Apache), claude-motion-design (MIT), claude-code-video-toolkit (MIT), video-ad-editor, explainroo, anidoodle, lemo-opuscar, mg-styles-15 (MIT), product-launch-motion (MIT), motion-video-kit (MIT), founder skills; imMamdouhaboammar (ideas rewritten).

## 1. Render approval (before the final render)

The user stops are the router's stops table (`ice-motion-director/SKILL.md` section 5, "Stops"); this section adds none.
- **Auto mode.** The router's one preview approval (style frames or animatic, before 07) is the user's approval of the film; it happens only when the session is interactive and the user did not say not to ask. The final render then needs no further approval: render it once the gates and the critic loop pass, and show it in the delivery note with the contact sheet and the gate numbers. Ordinary local renders are always authorized; publishing, uploading, posting or sending never are without an explicit yes, and the agent does not do them in auto mode (hyperframes, herk-edit-kit).
- **Step mode.** The contact sheet, the gate numbers and the open yellows go on the 09 review card; render the final after the user approves that card. Silence is not approval. Honour approvals already given and an instruction to "make it and iterate".
- Long films: render the whole film or shot by shot as the workflow's plan says (never a new question); build and check the first group (about the first 30 s) before dispatching the rest (PolyForm ideas, rewritten).
- Never change a fixed duration to hide a defect (hyperframes).

## 2. The file itself

| Check | Pass when | Source |
|---|---|---|
| Exists and decodes | File exists, is non-empty, decodes; `look.py` G0 passes | hyperframes, motionmaxxing |
| Spec | `node scripts/probe-mp4.mjs final.mp4 <WxH> <fps>`: resolution exact, fps within +-0.5, duration equal to the composition duration (ffprobe), codec h264 unless the platform asks otherwise | iart motion-skills, hyperframes |
| Frame count | Exact frame count for the planned duration; even frame spacing (no variable frame rate unless intended) | anidoodle, founder skills |
| Audio stream | Present exactly when scored; muxed if missing | anidoodle, reelmimic |
| Audio audit (lesson L18) | `python scripts/qc.py --audit` of the ice-audio skill exits 0 and `ice/review/ear-list.json` exists; `align_script_to_asr.py --stem` (ice-type) finds no masked word (`audio-gates.md` section 2b) | Ice |
| Frame 0 | Not near-blank; a finished composition, not a half-entered word | anidoodle, motion-video-kit |
| Black and NaN frames | `ffmpeg -i final.mp4 -vf blackdetect=d=0.03:pix_th=0.06 -f null -` reports 0 except intended blacks; no NaN or corrupt frames | herk-edit-kit, lemo-opuscar |
| Colour | TV-range BT.709 for web delivery; brand colours sampled from the delivered frames match the tokens (tone mapping in 3D shifts colours, so measure) | claude-motion-design, motion-video-kit |
| Fonts | No fallback fonts or tofu boxes in delivered frames | mg-styles-15, ice-assets skill |
| Technical polish | No jitter (unless intended), popping, aliasing, banding, shimmer on thin lines, half-loaded images | mg-styles-15 |
| Fast start | MP4 with fast start for web delivery | herk-edit-kit |
| Size | Fits the platform limit (a social ad under about 30 MB; a thumbnail at most 2 MB at 1280x720, else JPEG) | video-ad-editor, claude-code-video-toolkit |
| Alpha deliverables | Extract one RGBA frame and inspect it over a contrasting background; never trust a player that always shows black behind alpha | hyperframes docs |
| Every ratio | Each requested aspect ratio independently framed and reviewed (start, middle, end and action peaks), correct duration, final hash recorded; a stale export is a fail | herk-edit-kit |
| Platform copies | Never upload a draft; after the user uploads, also check the platform's lower-quality copy (a 480p copy broke 24 px text) | explainroo |

## 3. Safe zones

Read the platform's zones from the ice-engines skill, then check on delivered frames:
- No text, logo or face in the platform's button and caption zones. Zone values per platform, and the generic vertical rules when no platform number exists: the `ice-engines` skill, `references/platform-specs.md` section 3. Key text sits inside the central region decided at storyboard time (claude-motion-design).
- A safe-zone render test: render each moment twice with two different background colours behind the video area; pixels that do not change are your drawing; count drawn text pixels inside button zones; any hit fails (video-ad-editor).
- Captions never cover key action, faces or the mouth; subtitles are not hidden behind overlays (lemo-opuscar, video-use, herk-edit-kit).
- Graphics entering the subtitle band on light, clean backgrounds can be caught by counting dark pixels in that band on a caption-free render; textured backgrounds give false positives, so confirm by eye (huashu subzone idea).

## 4. Assets and claims

- Every on-screen number, name, date, price and claim traces to the truth sheet (ice-assets skill); illustrative data is labelled where the brief allows and declared in the report; a target is never shown as a result (charlie947, founder skills).
- Logo fidelity: the exact supplied or official asset, compared with every encoded occurrence (proportion, colour, letterforms); a redrawn, recoloured or distorted logo is a release blocker (herk-edit-kit, imMamdouhaboammar idea).
- No repeated footage disguised as new (replayed, renamed, recropped, reversed or regraded): keep a hash and interval ledger (herk-edit-kit).
- Product photos with unapproved text are cropped; private data blurred in screen captures; no fake posts for real people (product-launch-motion, video-ad-editor).
- Other rights holders' content inside captured or rebuilt brand screens (cover art, artists' or users' names and faces, user posts, other brands' products): on the delivered stills, everything visible matches the manifest row's `third_party_content`; anything not replaced is in the permissions list (the ice-assets skill, `brand-authenticity.md` section 11.2).
- Delivery states whether the film is an unofficial concept and lists every permission a brand owner or rights holder would need before publication (`delivery-report.md` section 2, "Permissions") (vibe-motion idea, product-launch-motion).

## 5. Hard release gates (regardless of average quality)

Wrong approved copy; malformed Arabic or RTL; a distorted or recoloured official logo; an invented claim; an unreadable key scene at delivery size; an incomplete or desynced encode (imMamdouhaboammar, rewritten); a required disclaimer missing, altered, too short or too small in any version, or a restricted claim on screen or in the voiceover (section 7); a cold-viewer clarity FAIL on the draft, or a required read that never ran (`clarity-gate.md`). Any one blocks delivery even when every other score is high.

Blocking gates from a reference and from the fresh transcript (owner decision, 2026-10-29): delivery is refused while any row below fails or never ran for a film it covers. Only the clearing named in its home clears it.

| Gate | Covers | Fails when | Home |
|---|---|---|---|
| Pacing against the reference (L9) | Any video made with a reference | `ice/review/motion/pacing.json` says `ok: false`, or is missing | `motion-density.md`, "Pacing against the reference" |
| Fixed identity marks (L10) | Remakes and edits that follow a reference with an organisation's identity | A fixed mark of the reference is missing, out of its slot or off its size on a frame where the reference shows it | `identity-tests.md`, "Fixed identity marks" |
| Fresh transcript gate (L11) | Every edit and every film with captions or on-screen speech text | `ice/review/captions-check.json` says `ok: false` with a mismatch not resolved in `ice/review/captions-check.md`, or is missing | `captions-and-sync.md`, "Fresh transcript gate" |
| Depth and camera against the reference (L12) | Any video made with a reference that has 3D, 2.5D or camera movement | `ice/review/motion/depth-check.json` says `ok: false`, or is missing | `motion-density.md`, "Depth and camera against the reference" |

## 6. Versions and hygiene

- Never overwrite a render: every delivered file follows the naming pattern of the `ice-engines` skill, `references/render-export.md` section 8, with a new version number per render; raws kept next to each master; A/B against the previous version is how a fix is proven (product-launch-motion).
- Honest statuses only: technical green, creative candidate, technical green creative rejected, reviewer approved. Filenames contain final, master or approved only after the film is approved (auto mode: the approver role passed 09; step mode: the user approved the 09 card). Keep a candidate manifest with SHA-256, dimensions, fps, duration and codecs (founder skills).
- When a version is chosen (by the user, or by the approver role in auto mode), freeze code, timeline, mix and subtitles together; keep the candidates (huashu).
- Delivery hygiene: project-unique names, one folder per round, scan staged files for secrets and oversized media (motion-video-kit).
- Tell the user where the video and its subtitle files, chapters and cover are, its length, what the gates said, and what could not be checked (explainroo).

## 7. Compliance: required disclaimers and restricted claims

Inputs: the "Required disclaimers" section of `ice/assets/TRUTH.md` (the ice-assets skill, `truth-sheet.md` section 12), the "Restricted claims and words" table of `ice/research/COMPLIANCE.md` (the ice-direction skill, `industry-rules.md` section 4), the claims list the facts check uses (every on-screen string and narrated line), the transcript of the delivered audio, and every delivered version (each language and each aspect ratio). The thresholds belong to the ice-type skill; this gate only measures against them.

**7.1 At plan time (gate step A).** Every required disclaimer has a storyboard shot, its exact text in the script, and a planned hold at least the required hold below. No script line, on-screen string or planned image matches a restricted item. A miss is red.

**7.2 On the delivered file (gate step G), for each disclaimer and each version:**

| Check | Pass when |
|---|---|
| Present and exact | The exact text from `TRUTH.md` for this language is on screen in its planned shots, character for character, read on full-resolution stills from the delivered file at its first settled frame, middle and last frame (`ffmpeg -ss <seconds> -i <delivered file> -frames:v 1 <still>.png`). A spoken disclaimer is also in the transcript word for word. Arabic is checked by the ice-arabic rules |
| Held long enough | Measured from the first frame where the whole text is settled to the last frame before it starts to leave, at least the longer of: the rule's minimum in `TRUTH.md`, and the hold from the ice-type skill, `reading-time.md` section 1 (row "Display text with no voice", or the echo row when the voice says the same words), with its section 2 floors and section 3 rate for the script |
| Legible size | Text size on the delivered frame (font px times every group scale and camera zoom, as the ice-type skill's `sizes-and-scale.md` section 4 says) at least the larger of: the rule's minimum, the readable floor in `sizes-and-scale.md` section 2, the floor for the delivery's ratio in sections 3 and 4, and the phone preview floor in `reading-time.md` section 4 |
| Readable on its ground | Contrast and backing as the ice-type skill's `caption-placement-safe-zones.md` section 5 sets for secondary text; never over moving busy picture without a backing |
| Not covered | Outside the platform's button and caption zones (section 3) and not hidden by any overlay |

**7.3 Restricted claims.** Search the claims list and the transcript of each version for every restricted item, in each language, including inflected forms and digits written either way. Look at the contact sheet and the stills by eye for restricted kinds of image (the compliance note names them), including text inside captured screens and generated media. Any hit fails, unless the compliance row was updated with the owner's approval and its date.

**7.4 Result.** Write `ice/review/compliance.md`: one row per disclaimer per version (ID, version, present, exact, hold measured and required, size measured and required, contrast, zone, result) and one row per restricted hit (item ID, where, timecode). A compliance note with `Status: not run` or `partial` makes this gate `NOT CHECKED` for the missing part: never write PASS for it, and tell the user in plain words in the delivery which rules were not checked. A film with no required disclaimers and no restricted items reports `N/A` with the compliance note's status and date. The delivery always says the rules come from dated research for the user's market and platforms, not legal advice.
