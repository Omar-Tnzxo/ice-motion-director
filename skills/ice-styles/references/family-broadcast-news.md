# Family: broadcast news (presenter news reel and programme packages)

The presenter-led news or explainer reel: one locked studio take reframed digitally, graphics that fire on the speaker's words, archive in the pauses, a designed end card. Read `style-method.md` first. Section 1 is the genre style every news reel uses; section 2 records three programme packages measured on real reels; section 3 the patterns of smaller sub-brands; section 4 the glass studio reel.

How to read the numbers:
- Every value comes from a measurement study of six published reels (2026-10-29): frames at 25 fps (frame n starts at n/25 s), sizes in px at 1080 px wide unless a line says otherwise. Scale sizes by frame width / 1080. Frames are written "6 f (0.24 s)".
- Lead and lag: element first frame minus the onset frame of the word it cites; negative = before the word. It is the `lead_frames` field of `plan/shots.json`.
- Hex values, fonts, marks and end cards in section 2 are evidence of a programme's skin. They are used as they are only when the stage 01 `identity` slot is "as they are" or "a mix" (the `ice-remake` skill, `references/rights-and-modes.md` section 1 and its subsection "The identity fits the content"). Otherwise keep the role structure and take every value from the film's palette, fonts and marks in `ice/DIRECTION.md`. A package is never a default look for an unrelated request.
- Channel and programme names identify the measured reference only. This repo holds none of their logos, logotypes, footage, sound or copy (section 5).
- "weak (1)" = seen once in six reels: use it only when the reference shows it or the reason row is strong.

Contents
1. Presenter news reel (the genre)
2. Programme packages
3. Sub-brand patterns
4. Glass studio reel
5. Never copy

## 1. Presenter news reel (the genre)

### Presenter News Reel (`presenter-news-reel`)
- **Look:** One presenter in a real lit studio (dark set with a diagonal beam, or a map wall), shot once on a locked camera and reframed digitally all reel long. Graphics sit around and behind the presenter on a person matte: the words being said, the places and people being discussed, archive in the pauses. Clean digital picture with crushed blacks, warm or cool highlights from the set, real background defocus and glow on display text. Ends on a designed end card held still. Not visual journalism (black with grain and reading beats, `directions-openers-explainers.md` section 4), not a talking-head ad (one fixed zoom per segment), not a cartoon presenter (y6, `narration-grammars-2.md`).
- **Framing:** wide source plate, presenter centred with room on every side; digital framings from wide to a tight face crop (a range of 1.64-2.6x inside one take); the face anchor stays the median face point (no per-frame follow). Camera numbers: the `ice-motion` skill, `references/camera.md`, section "Digital camera on one take (news reel)". Room graphics ride the camera transform (`layer: rig`); captions, logo bug and progress bar stay fixed (`layer: screen`).
- **Colour roles:** the colour-role contract below (1.2): one job per hue, white for spoken words, the brand accent only on brand marks.
- **Type roles:** one sans for all running text (in Arabic a geometric, low-contrast sans with Western tabular digits; digits of a time or date pill in a condensed DIN-like face); weight carries hierarchy (heaviest for 1 to 3 word keywords, bold inside any box, medium for secondary lines, light for footers); emphasis by container, size and colour role, never by mixing weights in one line or colouring single words; no stroke on any text; glow on display text only. Type pairing and font choice: the `ice-direction` skill, `references/type-pairing.md`; Arabic rules: the `ice-arabic` skill.
- **Timing:** a visual event every 1.2-3 s while the presenter talks, inside one continuous take (takes of 28-37 s with no cut); a camera move when no graphic fires; archive bursts only in speech pauses; the end card built in 1.7-3.5 s (78-88 f in the Arabic packages) then held still for 2.2-6.5 s. Pacing against a reference (longest gap, events per minute): the `ice-qa` skill, `references/motion-density.md`, "Pacing against the reference".
- **Transitions:** none inside the talk (no jump cut on the presenter; a size change goes through a camera move or a blur reframe); flashes, washes and archive cuts sit on breaths and phrase boundaries (19 of 20 measured transitions within 0-3 frames of a caption change). Move catalog: `ice-motion/references/cut-catalog.md`, section "Broadcast transitions".
- **Sync to the voice:** every element cites a spoken phrase (`cites`, `cites_occurrence`), lands on one subject role (`subject`) and has a measured lead or lag (`lead_frames`); typed keywords lead their word by about 4 f (0.16 s), titles that colour while spoken lag by about 8 f (0.32 s). One element per transcript line at most (1.3).
- **Captions or keywords:** one of three caption modes per package: keyword mode (about 1 word in 4, verbatim, its own role: `ice-type/references/captions-system.md`, "Keyword mode"), news sentence captions on every line coloured by whose voice is heard (`ice-type/references/caption-styles.md`, preset "News sentence captions"), or short type-on chunks (horizontal versions). On-screen words are the spoken words, never a paraphrase; only the end card has its own wording.
- **Sound:** a dry, mono, centred voice leads; the bed is set once under it; under speech, effects live only in the sub band (under 150 Hz) or the air band (over 4 kHz); no risers; silence on exits, captions, logos and slow reframes. Loudness and ducking: `ice-audio/references/mix-and-master.md`, row "News reel, speech-led"; effects per move: `ice-audio/references/sfx.md`, "Broadcast SFX by move"; music: `ice-audio/references/music-choice-and-licensing.md`, "News reel music".
- **Use when:** a news, current-affairs, explainer or programme-promo reel carried by one presenter or host; a reel cut from a long episode; any request whose reference is such a reel; footage of a presenter take that needs a graphic layer.
- **Do not use when:** there is no presenter take (pick visual journalism, y2 investigator collage or a data look); a product ad or brand film (the broadcast package reads as a channel, not a brand); the presenter footage is shot tight with no headroom for digital framing and no reshoot is possible (then fixed framings only, logged); the subject is fiction or entertainment that would borrow the authority of news.
- **Common mistakes:**
  - Jump cuts inside the talk -> one continuous take; change size by a camera move or a blur reframe.
  - Darkening, silhouetting or tinting the speaker while he speaks -> the speaker stays lit (1.4); dark treatments fall on the people discussed.
  - Paraphrased words on screen -> verbatim words from the fresh transcript, checked by the caption gate (`ice-qa/references/captions-and-sync.md`, "Fresh transcript gate").
  - The brand accent used as a text colour -> accent only on brand marks and as light (wash, glow, leak).
  - Two keyword groups up at once -> one group, or one designed stack.
  - Text over the face -> move the camera so the face makes room (pan or pull-out), never the text over the face.
  - A gap with no event -> a camera move or a graphic every 1.2-3 s; the pacing gate blocks delivery.
  - Logo bug or progress bar moved by the camera or hit by a flash -> they live on the screen layer, above every effect.
  - Per-frame strobes copied by default -> strobe safe mode (`ice-audio/references/cue-map-and-beat-sync.md` section 6).
- **Variation slots:** (illustration only)
  - Structure: a cold open of discussed-person beats then the presenter; a question-led promo that opens and closes on the programme name; a long take carried by graphics with one archive burst in the middle.
  - Opening: a brand sting on frame 1 with a background wash; a pull-out from a tight framing on frame 0; the presenter as a silhouette lit by an exposure flash just before his first word.
  - Ending: a hard cut to a black end card; a dissolve to a dark brand ground; a ring mask closing around the presenter into the end card.
- **Source:** measurement study of six programme reels, 2026-10-29 (measured numbers and ideas; no material copied); editors' tutorials on the same style (ideas only).

### 1.1 House grammar shared by all packages

1. One locked camera on the presenter; all reframing is digital. None of five measured Arabic takes has a cut inside the talk; the English reel changes size only through blur reframes.
2. The presenter sits on his own matte layer: washes, discs, ghost titles and archive pass behind him, plates and captions in front (layer kit: `ice-edit/references/layers-and-isolation.md`, section "3b. Programme matte kit").
3. White carries the words; every other colour has exactly one job (1.2).
4. The speaker stays lit while his voice is heard; darkness and silhouettes belong to the people being discussed (1.4).
5. On-screen text is the spoken words, short, and never covers a face (0 of 58 measured text events).
6. Clean digital picture: no grain, dust, leaks or scanlines on studio footage; display text glows.
7. Graphics arrive and leave by flicker or blink in 3-8 f (0.12-0.32 s), not by slow fades or bounces.
8. Transitions and exits sit in breaths or on phrase boundaries, never mid-phrase.
9. The reel ends on a designed end card with a still hold and no fade to black (6 of 6).
10. Western digits only, in every language (6 of 6).

What varies per programme (the skin, section 2): accent hues, the text entry device (typed pointer, pill, colouring title, flicker headline), the caption mode, the end-card world, the archive treatment, the fixed-mark positions.

### 1.2 The colour-role contract

| Role | Its one job | Never |
|---|---|---|
| Word white (warm or cool off-white, or pure white) | The spoken words and neutral information | Any other job |
| Brand accent | Brand marks (logo, disc, divider, end card); in the body only as light (wash, glow, leak) | A word colour in the body |
| Pointer colour | The moving pointer that writes or marks words, and the brand sting | Text; resting more than 2-3 frames |
| Sepia or desaturation | Images from outside the studio (archive, stills, portraits of cited voices) | The studio footage or the speaker |
| Red (or the programme's attention colour) | Attention, a question, threat or alarm, a fact dot | A brand mark when the brand accent is another hue; the speaker |
| Near-black | An anonymous force being discussed | The speaker |
| Arrival colour (optional) | A word in the instant it arrives or is spoken (4-12 f), settling to white | A resting colour |
| Other-voice colour (optional) | Captions of any audible voice that is not the narrator | The narrator |
| Chrome silver (87-91 % white) | Fixed brand marks, so the words stay the brightest thing | Content text |

- Foreign colours (flags, a national symbol) appear only as assets and are absorbed into the palette when named.
- The whole frame desaturates only for the call to action ("now we promote"), with the speaker's brightness kept.
- A news reel may carry 2 to 5 named role colours (the scope line in `ice-direction/references/color.md` section 6); a role colour on another role's element fails.

### 1.3 Decision procedure (per transcript line, first match wins, one element per line at most)

The per-line element order of an edit is applied by the `ice-edit` skill, `references/edit-types/news-reel.md` section 2, step 4; this section names the triggers and roles it reads.

0. Tag the subjects of the line first with the role words of the reasons file: `speaker`, `discussed person`, `voice` (heard, not on screen), `place`, `object`, `programme`, `whole frame`. The speaker is never the subject of a dark treatment.
1. First frame and first word: the package sting or opening move. The hook sentence gets a camera move only, or the package's main text device.
2. A new opening question: the question card or plate with the words verbatim, a push-in on the question word, and the question disc behind the lit speaker where the package uses one. A follow-up question: no disc, plain caption or title only.
3. A person discussed is named: the package's discussed-person device (dark rim-lit cut-out in front, sepia portrait behind, words beside the head for groups). A person who speaks on screen: a lower third 2-6 f (0.08-0.24 s) after his first cut, and the other-voice caption colour while his voice is heard.
4. A place: map land shape, flag in its real colours, a landmark still, a country tint on a map wall.
5. A number with a unit: a fact pin on the number (weak (1)); no numbers inside keywords.
6. A quote: another voice audible -> other-voice caption; the narrator reads a text -> card on the wall with a marker, white caption in quote marks; the presenter reads a full sentence from his paper -> pinned quote card.
7. The programme name is said: ghost title or title with disc behind the speaker.
8. A topic change or section start: the package's section device (background wash, white flash, red flash for a turn to threat, a strobe for a chapter break in safe mode), on the breath.
9. A sentence ends on a noun that names filmable reality: archive or B-roll in the pause, 9-11 f (0.36-0.44 s) after the noun.
10. A topic keyword (a content noun phrase, about 1 word in 4): the package's text device.
11. "Follow us" or the broadcast time: the call to action (desaturation, icon row, platform plate), then the end card.
12. Otherwise: a camera move only (push-in on the stressed noun, pull-out when the next element needs room), one move every 1.2-3 s.

Every element chosen here gets its row in the reasons file (`ice-remake/references/notes-files.md` section 6, REASONS.md) and in `plan/shots.json`; the storyboard validator reads them.

### 1.4 The speaker stays lit

The rule and its layer recipe live in the `ice-edit` skill, `references/layers-and-isolation.md`, section "The speaker stays lit". Measured basis: 0 instances of a darkened, silhouetted or tinted speaker in about 284 s of presenter speech across six reels; 10 of 10 dark treatments fall on people or forces discussed. Variants seen and allowed: the narrator as a silhouette for 0.8 s before his first word, lit by an exposure flash 2-3 f before he speaks; the speaker desaturated and dimmed (never silhouetted) while a discussed person's image is in front (weak (1)); a whole-frame desaturation for the call to action with his brightness kept or raised. The red disc behind a speaking host appears 6 times, every time with the host fully lit.

### 1.5 Never (genre-wide, from counts over the six reels)

These rules read from counts of 0 over a measured number of chances; copy the ones the reference confirms into the `## Never` block of REASONS.md.
- Never cover a face with text (0 of 58 text events).
- Never paraphrase spoken words on screen (every measured keyword, card and caption is verbatim).
- Never show two keyword groups at once, except one designed stack.
- Never cut inside the presenter's talk; never cut to archive during a question (0 of 5).
- Never put a lower third on someone only mentioned.
- Never move the logo or the progress bar with the camera or hit them with a flash.
- Never place a transition mid-phrase.
- Never use grain, dust, scanlines or leaks on studio footage (texture only on archive or on headline type where measured).
- Never Arabic-Indic digits; never social icons in platform colours (white, in a row).

### 1.6 How this family is used

- **Route:** the router classifies the request; a presenter-led news or explainer reel runs the edit type `news-reel` (`skills/ice-edit/references/edit-types/news-reel.md`), which opens this file for the look. A remake of such a reel runs the `ice-remake` skill with the same edit type.
- **Selection:** `SKILL.md` lists this style under the film type "News reel", the industry "News, media, public sector" and "Footage edits needing a graphic layer". It still goes into the shortlist with candidates from other families and through the pitch round (`style-method.md` section 3).
- **Identity:** by default the genre carries the user's own palette, fonts and marks on the role contract above. A package skin from section 2 is used only when the `identity` slot is "as they are" or "a mix" (`rights-and-modes.md` section 1), and then its fixed marks sit where measured (`rights-and-modes.md`, subsection "Fixed identity marks"; checked by `ice-qa/references/identity-tests.md`, "Fixed identity marks"). Official logos and end-card files are fetched at run time per `ice-assets/references/sourcing-and-licenses.md` section 0, never drawn.
- **Reasons:** every element of the broadcast package (logo bug, programme name, progress bar, location tag, lower third, glass plates and pills, glow and scanline titles, glow disc, flashes, typed question cards, branded end card) needs its reason row. With the row it passes the slop scan (`ice-qa/references/slop-scan.md`, section 4, "Broadcast package (news reel)"); without it, it is slop.
- **Distance:** a news reel in the genre with the user's identity differs from every package card in section 2 on at least 4 of 6 axes; a remake that takes a package as it is follows the remake mode's contract (`ice-direction/references/anti-sameness.md` section 4).
- **Depth, 3D and camera:** every depth plane, push-through, 3D element and camera share of the reference is measured (`ice-remake/references/measuring.md`, "Depth, 3D and camera") and built by a route (`ice-motion/references/depth-and-3d.md`, section "Build routes for depth and 3D"). Each package below lists its own values.
- **Craft profile (family default):** a one-line summary of section 1 and the package blocks of section 2 (the values stay there): needs: camera (a digital camera on one locked take, `ice-motion/references/camera.md`, "Digital camera on one take (news reel)"), cutout (a person matte with graphics around and behind the presenter), type (keyword, sentence or type-on captions in the spoken words), rhythm (a visual event every 1.2-3 s while the presenter talks), voice (a dry, mono, centred voice leads), sfx (scoped: under speech only in the sub or air band, no risers), music (one bed set under the voice), silence (on exits, captions, logos and slow reframes), light (real background defocus and glow on display text; the speaker stays lit, 1.4), finish (scoped: a clean digital picture with crushed blacks, no grain, dust, scanlines or leaks on studio footage, 1.5), transition (scoped: none inside the talk; flashes, washes and archive cuts on breaths, 1.5), identity (the fixed marks and the end card in their slots, each with its reason row, 1.6 and `ice-qa/references/slop-scan.md` section 4); serves when: footage (a pause in the speech, or a place, person or event named: archive bursts), data (a spoken, true number or a place: a counter with colour change or a map), depth (a person discussed or several items named: the depth sandwich and the planes of section 2), composite (a keyed presenter or a cut-out: contact with the set and edge match).

Where the builds live (this file holds only the per-package values):

| Element | Canonical build |
|---|---|
| Digital camera, room and screen layers | `ice-motion/references/camera.md`, "Digital camera on one take (news reel)" |
| Glow disc, counter with colour change, tapered glow arc, scanline title texture, title pill, brand sting, topic wheel, box from a line | `ice-motion/references/atomic-moves.md`, "Broadcast news moves" |
| White flash, red flash, flicker exit, screen glitch clip, light-bar wipe, drop exit, blur reframe | `ice-motion/references/cut-catalog.md`, "Broadcast transitions" |
| Broadcast settle curve, two-null overlap | `ice-motion/references/springs-and-curves.md`, "Broadcast settle" |
| Pointer reveal (RTL), typewriter with a coloured head, blink exit, scanline headline, lower third, location and date tag, vertical source credit, glass subtitle box, crimson-to-white title | `ice-type/references/type-effects-specs.md`, table "Broadcast text" |
| Kashida display blocks, hollow kashida | `ice-arabic/references/kashida.md`, "4b. Justified display blocks" and "Hollow kashida" |
| Depth sandwich, background wash and brand flash, question disc, ghost programme title, discussed-person silhouette, sepia portrait, B-roll behind the cut-out, spotlight, virtual set | `ice-edit/references/layers-and-isolation.md`, "3b. Programme matte kit" |
| Glass and backdrop blur in HyperFrames | `ice-engines/references/hyperframes.md` |
| Archive burst, rhythm, a reel from a long episode | `ice-edit/references/edit-types/news-reel.md` |

## 2. Programme packages

Each package is a complete skin by the numbers, so an agent can rebuild it without the research. Under each: colours, type, motion, depth and 3D, sound effects, music, rhythm, fixed elements, reason rules, finishing, conflicts between its own reels (scoped choices: follow the reel being remade; with no single reel, take the majority value and log it), and the paragraph "With the user's identity".

Fonts measured on all three packages (all SIL OFL 1.1, from Google Fonts):

| Use | Font and weights | Why it matches |
|---|---|---|
| Arabic running text (keywords, plates, pills, cards, captions, end-card lines) | Tajawal 300, 500, 700, 800 | Rendered with a real shaping engine against the reels: line width over alef height within 0.1-4 % (median 0.9 %), same kaf, lam-alef, final yeh and ta marbuta; the house face is either built on these drawings or is Tajawal itself. Other wide Arabic sans faces miss the width by 5-30 % |
| Western digits in time or date pills | Barlow Semi Condensed 600 (stand-in for the DIN digits the channel guidelines name) | Same rounded-rectangle 0 with straight sides, straight diagonal into a flat-based 2, vertical spine on the 5; regular-width Barlow is 4 % too wide. Digits inside an Arabic sentence follow the Arabic face |
| English | Montserrat (variable) 400-900 | Width over x-height 26.69 measured vs 26.34 (the next candidates 23.3-25.3); wide M whose vertex reaches the baseline |
| A placeholder for a programme logotype | Noto Kufi Arabic Black or Kufam | Only for the user's own programme name; never an imitation of a channel's logotype |

Package skin values that the `ice-type` skill's table "Broadcast text" reads (one row per value kind; the full tables are in each package below):

| Value | 2.1 talk-show promo | 2.2 explainer reel | 2.3 explainer promo |
|---|---|---|---|
| Pointer colour | #FFD967 (rim #A0522D to #D69347; resting caret #F2861D) | none | none (sub-brand heads in section 3: #FFDE00, #E0A300, #FFC44D) |
| Arrival or coloured-head colour | the pointer | flicker from 2-5 % white | captions arrive cyan #CFEDEE to #D4F1F4 and settle to #FDFAFD in 4-5 f; titles arrive #C23447 and cool to #D6CCCE in 8-12 f |
| Text glow halo | warm orange-red 12-16 px (one reel tight 5 px plus a 40-60 px tail, one 7 px) | headlines white 12-18 px; captions none | card text white 4 px; titles crimson 12 px; captions none |
| Caption voice hues | no captions (keyword mode) | narrator #FDFEFF, any other audible voice #F6879C | captions white #FDF9FC (one voice) |
| Lower third name and role | none | name #88022A on #EFEFEF; role #F8FBFA on #0E0C0A | none |
| Location tag | none | lines #FEF9F3 on dark strips; squares #CF2E5C and #A708F2 | none |
| Word ink at rest | #FFFBF5, #FEFCF7 (one reel #FFFFFF) | #FDFEFF, headlines #FDFFFF | #FFF9F8, #FDFAFD, #FFF5F4 |

Arabic in every package: tracking 0 (spacing by kashida only), no tashkeel in running text, the Arabic question mark on question cards, line breaks on phrase boundaries. Glow and kashida on Arabic display text are allowed here because the references measure them (scope lines in the `ice-arabic` skill).

### 2.1 Al Jazeera Arabic shorts (talk-show promo package)

Package id `aj-arabic-talkshow-promo`. Reels measured: three promos of a weekly talk show (Scenarios), 36.1-46.6 s, 1080x1920, 25 fps. Dark warm studio, one seated host; verbatim keywords typed by a yellow square pointer; the brand orange-red only as light, glow and end card; warm frosted plates; a black end card.

**Colours**

| Hex | Job |
|---|---|
| #FFFBF5, #FEFCF7 (one reel #FFFFFF) | Spoken keyword ink |
| Glow hue about 13 degrees: #4B1E12 at 4 px, #27181C at 12 px (tones #7C4330, #F2B27C, #C0560A) | Warms the white and separates it from a dark suit |
| #FFD967 (range #FFDC67 to #FFEB6B) | The pointer and the sting square only |
| #A0522D to #D69347 | The pointer's lit rim |
| #F2861D | Resting caret after typing ("finished"), one reel |
| #C7A95B, #7F633F, #B1834F | Small anchor square under plates |
| #BE5225, #C0672A | Thin orange rule under or along the text |
| #FF4000 (dividers #FF3F00 to #FF4300) | Programme brand: full strength only on the end card |
| Normal wall #332C2A, #2F2521, #1D1711; washed wall #4F2719, #4B2313, #573425, washed floor #963E1A, #B0582F, #97653F; one reel #2B1409 -> #331F13 on the wall, #792F0E -> #863511 on the floor | Brand wash on the background only, in steps |
| 20-30 % white | Ghost programme title |
| Fill #2E2726 to #3D302B, about rgba(55,45,40,0.85-0.88); rim #5F4E3F | Warm frosted plate (not black, not navy) |
| Mid #865E3D, median #9A7358 with lifted blacks | Sepia: images from outside the studio |
| #060301 to #0A0704 | Near-black anonymous silhouettes |
| #9BE1F4 -> #D5E8EE -> #F0BB78 | A foreign symbol absorbed into the amber on the name (weak (1)) |
| #E5C77B, #9C6732 | Place (map land) |
| #7B737A, x2.5 in the call to action | Studio light beam, CTA spotlight |
| #080808 ground, watermark 5-8 levels above it | End card |
| #DEE1E6, #F4F4F2, #C5C3BF; programme tag #E8EAEC | Channel logo silver and programme tag, below content white |

Footage grade: blacks crushed (p1 0-3), p99 177-252, saturation 84-100 of 255, warm highlights (R minus B +25 to +51), neutral shadows. Call to action: saturation -48 to -57 %.

**Type** (Tajawal; sizes at 1080 wide)

| Style | Weight, size | Layout |
|---|---|---|
| Single keyword | 800, 112 px (glyph extent 11.1-11.4 % W), line height 1.1 | Line 66-76 % W, no container, glow |
| Free keyword | 800, ink 86 px | Width 62.6 % W |
| Headline stack | 800 for the head noun (top to baseline 78 px), 700 for the modifier (51 px); baselines 146 px apart, line height 1.5 | Head noun bigger whatever the spoken order; orange rule 12-14 px |
| Justified block | 700-800, 70-100 px per line, pitch about 1.5 | Kashida to one block width |
| Plate keyword | 700, 90 px, line height 1 | Plate 727x187 (67 % W), radius 23, padding L50 R47 T53 B41; or 604x178, radius 15-20 |
| Side block | 700, 29-30 px | Block 461 px (42.6 % W), pitch 108-115 |
| Call-to-action plate | 700, 62.5 px | Small plate and an icon row at y 1330-1400 |
| End-card lines | 300, 64 px, line height 1.75 | Kashida to 593-600 px wide |
| Broadcast time digits | Barlow Semi Condensed 600, 92-94 px (digits 66 px) | Right of an 8x150 px brand divider |

Keyword glow: `text-shadow: 0 0 3px rgba(255,120,60,.55), 0 0 18px rgba(255,64,0,.30), 0 0 40px rgba(255,64,0,.15)` (halo 12-16 px; one reel a tight 5 px plus a 40-60 px warm tail, another 7 px).

**Motion** (builds in the homes of 1.6; these are the package values)

| Element | Values |
|---|---|
| Push-in | 20-66 f (0.8-2.64 s), x1.08-x2.03, outQuad or outCubic (progress 0.65-0.86 at half time), peak 1.2-3.0 % per frame; opening push-in ramps in over 11 f; face or top-edge anchor; no overshoot (0 of 37 moves), no motion blur |
| Pull-out | 9-64 f (0.36-2.56 s), x0.60-x0.85, inOutQuad or inOutSine |
| Holds between moves | median 18-20 f (0.72-0.8 s), range 6-78 f |
| Pan for text room (weak (1)) | 325 px (30 % W) out in 29 f (1.16 s), 255 px back in 42 f (1.68 s), inOutSine or outCubic |
| Slow creep (weak (1)) | x1.16 over 74 f (2.96 s), linear, on a 3-4 s stretch with no graphic |
| Pointer reveal | Dot of 10-24 px at the line's right end grows to line height (95-194 px) in 5-6 f (0.2-0.24 s) while travelling right to left at 45-127 px per frame, near linear, braking on the last frame; the text is revealed by a mask behind the pointer (no fade, no per-letter state); 7-12 f (0.28-0.48 s) per line; pointer removed 1-2 f after it stops; next line 1-2 f later (stacks 4-9 f) |
| Resting caret (one reel) | The pointer collapses into a caret about 37x62 px at the line's left end, held to the exit |
| Kashida stretch | All lines grow to one width in 1-7 f, ease out |
| Blink exit | Last full frame N; N+1 and N+2 off; N+3 a ghost at 25-60 % (slightly larger or shifted 4-8 px); N+4 off. Plates: off 5 f, ghost 4 f at 50 %. Stacks leave line by line 4-6 f apart |
| Plate build | 1-2 px line -> about 15 px pill -> full plate in 12 f (0.48 s), growing leftward with the pointer |
| Brand sting square | f1 half, f2-3 off, f4-12 on, f13-16 off, f17-25 on; about 100-150 px; rides the zoom |
| Background wash | 10 f: deep 4 f, light 2 f, lifted pale 4 f (one reel 6 f in three 2 f steps); a pale rectangle about 8 % white and 700 px wide on frames 3-4; laid over the start of a big zoom; outside the person matte only (saturation inside the matte changes -6 to +4, outside +40 to +144) |
| Ghost programme title | Blink-in 5 f, slides left to right at 25-44 px per frame, flat 20-30 % opacity, blink-out 4-5 f, behind the head |
| Discussed-person symbol (weak (1)) | Rises 504 px in 15 f; colour flip over about 14 f on the name; exit falls 614 px in 21 f, accelerating (inCubic), slight rotation. The speaker meanwhile desaturates and dims over 45 f and the zoom eases from x1.41 to x1.0 |
| Sepia still behind the host | In over 12-34 f (S-curve), out in 3-6 f |
| Call to action | Desaturation near linear over 26-36 f (1.04-1.44 s); light beam x2.5 over 89 f peaking on the platform words; bottom of frame darkened 23 %; background blurred +2.5 px; 8 white icons left to right, 3-5 f apart, each popping in 2-4 f |
| End card | Hard cut; logo rises 216-435 px in 28-30 f with the remaining distance x0.8 per frame (outExpo-like), wordmark from the brand colour to white in 9-12 f; divider grows to 150-153 px in 6-7 f; time block slides out from behind the divider over 30-41 f (mask); two lines rise 18 px and fade in over 21-28 f; channel logo in over 30-42 f; staggers +21, +9, +12 f (or +24, +6, +6, +3 f); build 78-84 f (3.12-3.36 s), then still for 4.5-6.5 s, no fade |

**Depth, 3D and camera.** No real 3D. Layers back to front: set plate, wash and ghost title and sepia stills, person matte, keywords and plates, chrome. Keywords and plates ride the digital zoom (a keyword shrinks 830 -> 676 px and rises 84 px with a pull-out; plates follow within 1-4 px). Camera moving in 38-63 % of frames (one reel 582 of 920 frames, another 269 of 703); 15.8-27.8 moves per minute; framing range x1.0-x2.14 in one take, so the source plate must be at least 2.14x the output height (a 4K-class plate). No parallax inside the room, no push-through. Real background defocus 2.6-13 px sigma more than the face (shoot shallow). Depth hierarchy device (weak (1)): when a discussed person's image comes forward, the speaker is desaturated and pushed back (zoom x1.41 -> x1.0) and returns to full colour as the image leaves (trigger: the name of the person discussed). A stock 3D waving flag loop in real colours on a country name. Build routes: `ice-motion/references/depth-and-3d.md`, "Build routes for depth and 3D".

**Sound effects** (move types: `ice-audio/references/sfx.md`, "Broadcast SFX by move"; package values)

| Sound | Timing against the visual move | Level |
|---|---|---|
| Write-on chatter (75-99 % of energy above 4 kHz, 2-5 bursts of 90-920 ms) | First burst 0 to +2 f from the pointer's first frame (median +1), last on its removal frame, so it sits under the spoken word | -29 to -46 dBFS, 14-27 dB under the voice |
| Opening swish (above 4 kHz, 130-140 ms) | f3, one frame before the sting square is fully on | about -40 dBFS |
| Wash hit: high tick (130-250 ms) and low thump (280-360 ms, under 150 Hz, 2.4-3.1 s tail) | Tick 1-2 f before the first coloured frame; thump on the second colour step (+1 to +2 f) | -40 to -42 and -36 to -38 dBFS |
| Sub boom on a fast move (one reel) | -1 to +5 f from a fast ease-out zoom start, the falling symbol or the wash | low band -8 to -10 dBFS |
| Low swell and whoosh with the symbol (weak (1)) | Swell (0.7 s) ends on the colour flip (-4 to +3 f); whoosh (350 ms) +6 f after the fall starts | -24 to -26 dBFS |
| Low thump | A heavy picture entering behind the host | under the voice, sub band |
| Icon tick stream | One tick about every 2.7 f over 1.4 s, from +1 to +3 f after the first icon | -30 to -43 dBFS |
| End-card pair: bright mono downward swish (16 -> 1 kHz, 120 ms), then a soft low chime (280-350 Hz, 0.7 s) | Swish at cut +9 f (logo rise +3 to +6 f); chime peak at cut +37 f (divider and time +3 to +12 f) | about voice level (-20.5 and -19.7 dBFS); then 4.5-7.7 s of near silence |
| Silence | Exits, captions, logos, slow reframes, sepia stills, portraits | none |

The end-card pair is one channel's own template: source equivalents of the same type, never the file.

**Music** (`ice-audio/references/music-choice-and-licensing.md`, "News reel music"). A dark, pulseless minor ambient pad or drone (pulse clarity 0.07-0.10; slow low pulses in one reel; one reel a darker drone with mid tonal lines and soft percussion, clarity 0.19). Enters in the first pause after the greeting (1.0-1.15 s) with a 20-30 ms rise; level set once, 28-31 dB under the voice (one reel 15 dB), no ducking; one reel pulls it out for 3.5 s under a key quoted line and brings it back on a boom (weak (1)). Faded out over about 2 s during the call to action, gone 1.1-3 s before the last word; no music on the end card. No usable pulse: cuts and graphics follow words, never a beat grid. Mixes measured -13.8 to -18.9 LUFS (targets: `ice-audio/references/mix-and-master.md`, row "News reel, speech-led").

**Rhythm.** Speech 1.88-2.08 words per second (112-125 wpm); 27-29 % of words shown as keywords; one visual event every 1.76-2.45 s; a keyword on screen 21-49 f (mean 34 f, 1.36 s); one continuous take of 28.1-37.2 s; hook: first change on f1, programme named at 3.04-3.12 s, topic complete at 5.0-10.4 s; first second: logos on at f0, sting square from f1, wash f5-14, push-in to x1.34-x1.59 over 22-41 f; no archive montage (single sepia stills behind the host instead); call to action starts 4.9-5.6 s before the cut; end card 8.0-9.76 s long (build 78-84 f, still 4.5-6.5 s).

**Fixed elements** (layer `screen`, on from f0 to the hard cut, never moved by the camera or touched by a wash)

| Mark | Position at 1080x1920 | Percent of frame | Size |
|---|---|---|---|
| Channel logo (two reels) | top-left x 108-205, y 228-387 | x 10.0-19.0 % W, y 11.9-20.2 % H | 98x160 px, 9.1 % W, silver |
| Channel logo (third reel, sides swapped) | top-right x 850-945, y 213-361 | x 78.7-87.5 % W, y 11.1-18.8 % H | same |
| Programme tag (two reels) | top-right x 730-970, y 286-327 | x 67.6-89.8 % W, y 14.9-17.0 % H | 241x42 px, 22 % W, mirrored side margin 110 px |
| Programme tag (third reel) | top-left x 131-346, y 286-323 | x 12.1-32.0 % W, y 14.9-16.8 % H | same |

Safe zones: the top 0-220 px stays clear (marks start at y 213-229); no text below y 1400-1499; keywords between y 390 and 1499, x 123-976 (chest and hands). End-card column centred at x 540, width 595 (margins 245 and 240): logo y 345-442 (icon 96 px), title y 547-665, time block y 776-934 with the divider at x 535-545, lines y 956-1236, channel logo y 1365-1637.

**Reason rules**

| Element | Trigger | Lands on | Lead or lag | Why |
|---|---|---|---|---|
| Typed keyword | The content noun phrase or strong adjective that carries the clause, about 1 word in 4, verbatim; never verbs or function words | `object` or `place` (the topic), never a person | -20 to +3 f, median -4 f (-0.16 s) | Typing = live reporting; white = the speaker's own words; a hair early so the eye lands with the ear |
| Keyword exit | The next phrase | the keyword | blink -13 to +3 f vs its onset, median -4 f | Never two groups at once |
| Frosted plate | Same trigger, only at a wide framing (x1.1-1.24) or over the busy floor, suit or hands | the topic | built with the pointer, -10 to +2 f | Legibility (11.8:1 on the plate), not emphasis |
| Headline stack or justified block | A 2-5 word topic phrase or noun chain (the episode question) | the topic | each line 1-11 f before its word | A rectangle reads as a headline |
| Category tag with icon (weak (1)) | The speech names the type of a statement | a `discussed person`'s statement | +10 f | Icon plus one word = a label, not a quote |
| Ghost programme title | The programme name | `programme` | -29 to 0 f | 20-30 % white behind the head never competes with face or keyword |
| Brand sting and wash | Frame 1; the clause that starts the topic, turns the premise into a question, or starts the tune-in | `programme` (background only) | wash -7 to +3 f vs the clause's first word | Brand colour as light on the set; the host untouched |
| Discussed-person silhouette (weak (1)) | A named actor of the story as the sentence subject | `discussed person` | rises 30 f before the name | Anonymous and ominous; the speaker only desaturated |
| Sepia portrait or still behind the host (weak (1) each) | The word naming a cited voice's statement, or a power named as actor | `discussed person` | -2 to -17 f | Outside pictures never rival the live host |
| Near-black silhouettes in front, sepia archive behind (weak (1)) | The action of a force being discussed | `discussed person` (a group) | +2 f and -3 f | The host stays lit and sharp behind them |
| Map land shape in gold (weak (1)) | A place name set up by the phrase that introduces it | `place` | -41 f | Gold = place; it lights the wall warm |
| Flag in real colours | A country name or adjective | `place` | -7 to -13 f | Factual asset, keeps its own colours |
| Push-in | A key noun, a question word, the first stressed word of a new phrase | the `speaker`'s statement | -7 to +4 f vs the clause's first word | Intimacy and emphasis |
| Pull-out or pan | A layer must be added around the host (7 of 9 typed phrases appear during or right after a pull-out or pan) | `whole frame` | out -10 to +2 f | Room for the text |
| Call to action | The "follow us" sentence | `programme` | desaturation -3 to +10 f; platform plate up 62-78 f before the platform words | Colour drains so the icons and plate are brightest; the host is not darkened |
| End card | After the last word | `programme` | hard cut +10 to +22 f | When and where to watch |

Never in this package: zoom overshoot; motion blur on text or zooms; subtitles (keyword layer only); numbers inside keywords; lower thirds; social icons in platform colours; music on the end card.

**Finishing.** Clean digital: no grain (studio noise 0.16-0.9), dust, leaks, scanlines or added vignette; no chromatic aberration except a 1.5 px red and blue split on the social icons; crushed blacks, warm highlights; real background defocus; glow on keywords; frosted plates with backdrop blur 12-24 px, a warm tint and a 1-1.5 px light rim (background detail drops from 7-21 to 2-3); pointer rim glow 15-20 px; sepia stills at partial opacity. The premium feel comes from the lit set, depth of field, glow on display text and constant camera life, not from texture.

**Conflicts between its reels** (scoped choices): keyword ink warm off-white (two reels) or pure white (one); wash 10 f in 4-2-4 steps (two) or 6 f in 2-2-2 steps (one); icons pop in 2-4 f (two) or fade in 10-14 f (one), stagger 3, 4 or 5 f; channel logo top-left (two) or top-right (one); keyword lead median -2.5, -4 or -7.5 f; kashida on short words inside boxes (two reels do it) against the type study's "never in single-line plates" (follow the reel); keyword glow 12-16 px, tight 5 px plus tail, or 7 px.

**With the user's identity.** The roles carry over and the values change: keyword ink becomes the user's light neutral warmed toward their accent; the pointer becomes one high-visibility colour of their palette with no other job; their brand colour replaces the orange-red, still only as light, wash and on the end card; the plate is a tonal step of their ground; sepia stays for outside images, toned toward their warm or cool neutral. Their Arabic face (or the type-pairing choice) takes the same weight roles (800 keyword, 700 boxed, 500 secondary, 300 footer) and the same scale; their numeral face sets time and date digits. Their logo and programme name sit in the same slots at the same sizes (`rights-and-modes.md`, "Fixed identity marks"); the end card is built from their logo, title and time or call to action with the same build order and hold. Moves, timings, sound types and rhythm stay as measured.

### 2.2 Al Jazeera English (explainer reel package)

Package id `aj-english-explainer-reel`. Reel measured: one English explainer, 193.1 s, 1080x1920, delivered at 30 fps but cut at 25 fps (author at the delivery frame rate; values here are at 25 fps). Standing presenter keyed against a teal map wall with a deep red set; sentence captions on every line coloured by voice; uppercase scanline headlines; crimson lower thirds; flash transitions; a progress bar; a red-to-violet end card.

**Colours**

| Hex | Job |
|---|---|
| #FDFEFF | Narrator caption, neutral information |
| #F6879C | Caption of any other audible voice (translated soundbite, a crowd); never the narrator |
| #FDFFFF; #F2D4D8 over red; #DD5B60 (weak (1)) | Headline; headline over red; headline turned red |
| #DE0015 peak, #C60012 centre, edge #9D0516 -> #2F0A0E, ground #040000 to #1B090B | Cold-open threat circle behind the people discussed |
| #EB182F | Fact dot (bullets, fact pin) |
| #F41238 | Running count number (a "Day N" title) |
| #88022A on #EFEFEF | Person's name in the lower third |
| #F8FBFA on #0E0C0A (translucent) | Role line under the name; location tag lines (#FEF9F3) |
| #C21B37 | Marker on a quoted post |
| #CF2E5C and #A708F2 | Two small squares of the location tag (the end-card gradient family) |
| #16171C -> #3E1B20 | Bullet card glass |
| #4F6973 land, #5C0005 subject country, #830002 curtains, #251728 shadows | Set: teal complement with the subject country in red |
| #FCF9FA logo; #848484 fill on #1F1F1F track | Brand chrome, never touched by effects |
| #480082, #9F616D, #770021; footer #F4D1D7 on #B72336 | End-card gradient |

Grade: studio blacks crushed (p1 1), saturation 150 of 255, cool teal highlight cast #83989F; archive black and white (saturation 3, p1 59, p99 215) with grain and scratches; B-roll ungraded with a bottom black gradient (luma x0.4 from y 1100 to 1480).

**Type** (Montserrat; sizes at 1080 wide)

| Style | Weight, size | Layout |
|---|---|---|
| Caption | 500, 49-50 px (4.6 % W), line height 57 px (1.15-1.17), sentence case | Chunks of median 6 words (2.23 s), at most 2 lines; line 1 top at y 1518, line 2 at y 1575, centred on x 540; max line 826 px (76 % W) measured, about 560 px typical |
| Name (lower third) | 800 caps, 59 px (cap 41.5) | #EFEFEF box 650x80 at x 113, y 1254-1334 (65-70 % H) |
| Role | 500 caps, 28.5 px, tracking +0.07 em | Dark strip y 1335-1389 under the name box |
| Headline | 800-900 caps, cap height 97-152 px (9-14 % W), about 161 px font for a six-letter word | Line pitch 1.38x cap; scanlines (period 3.8-4.0 px, up to 10.6 px), glow 12-18 px white |
| Bullets and fact pin | 800-900 caps, 53 px (cap 37-40); pin cap 45 | Line height 1.09; card x 222-862, radius about 40; dots 38 px (bullets) and 64 px (pin) |
| Location tag | 400 caps, 27-28 px, 2 lines, pitch about 38 | Right-aligned at x about 1005, each line on a dark translucent strip |
| End-card footer | 500, about 28 px | Actions in title case separated by bullets |

Casing: captions in sentence case; names, roles, headlines, bullets and tags in caps; dates as day, three-letter month, year in caps; straight apostrophes.

**Motion**

| Element | Values |
|---|---|
| Pull-back | About 49 f (90 % done at 0.95 s), x0.77, outCubic-like, anchored on the frame centre (540, 960) |
| Blur reframe | About 22 f (blur out 13, in 9), scale change x0.81-x1.43, blur sigma 1 -> 16-25 px, cut at the blur peak; on a caption chunk boundary (0-2 f); the only way the presenter changes size (4 of 4) |
| Stills | 50-225 f each, push x1.077 per 2 s, pan 26 px per second, linear |
| Flicker-in | 2 dim frames (2-5 %), 1 off, 2 on, 1 off, on (about 6 f, 0.24 s); line 2 +6 to +9 f; then a rise of 32-50 px over 20-27 f, ease out |
| Flicker-out | x1.3 (2 over-bright frames), x1.0 (2), x0.55 (2), x0.27 (2), off: 7-8 f; or a horizontal slice displacement over 3-4 f (glitch exit) |
| Lower third | Left edge x 520 -> 119 (401 px) in 24 f, outQuad (0.31, 0.70, 0.90 at quarter times); the mask reveals faster so the right edge overshoots 28-46 %; out 8 f inCubic |
| Bullet card | The dot flickers in, its text 6-9 f later; the card grows from its centre in 10-13 f; earlier bullets move up half the new height (54-72 px) |
| Fact pin (weak (1)) | Dot flicker (faint, on, off, on over about 5 f), then the words one by one about 2 f apart |
| Threat circle drop | First drop 8 f, outBack with 11 % overshoot; later drops 11-13 f, outQuad, no overshoot |
| Light-on | Presenter luma 22 -> 188 -> 47 over 5 f (the excess x0.55 per frame) with a blur-in over the same frames, 2-3 f before his first word |
| White flash | Peak 1-2 f (luma 171-253), exponential decay over 7-13 f, on the chunk boundary (10 uses) |
| Red flash | Saturation 175-190, picture and captions blurred, 4-8 f, on the chunk boundary (4 uses) |
| Chapter strobe | 8 f of greyscale, invert and threshold frames (3 uses); default safe mode: one 2-frame invert and a 6-frame decay |
| Cut-out first | The next subject's cut-out flashes white or red over the current shot 4 f before its background arrives |
| Progress bar | Fill x = 140 + 4.264 t px (t in seconds), linear, full at 188.8 s = the end-card handover |
| End card | Emblem write-on about 12 f; a gradient ring mask closes around the presenter in about 30 f; the call-to-action line types in about 13 f; icons about 2 f apart; still 2.2 s on a slowly drifting gradient |

**Depth, 3D and camera.** No real 3D; 2.5D layers. Cold open: background, headline, cut-out photo of the person discussed, fog in the bottom band (y over 1100), captions, chrome; the headline sits behind the subject in 5 of 5 beats. Cards are placed inside the map-wall plane and take the wall's colour (a quoted post turns cyan #B8E1EE). Portrait cards carry a 3-4 px white sticker edge. The presenter is keyed against the map wall. The camera works by shots (19 shots per minute) and blur reframes, plus slow pushes and pans on stills; no push-through, no depth of field beyond the set's own. The share of frames with a moving camera was not measured here: measure it on the reference (`ice-remake/references/measuring.md`, "Depth, 3D and camera"). Build routes: `ice-motion/references/depth-and-3d.md`, "Build routes for depth and 3D".

**Sound effects**

| Sound | Timing against the visual move | Level |
|---|---|---|
| Cold-open beat hit (89-99 % under 150 Hz) | 2-7 f before the new image, on the dip that starts the beat | -6 to -18 dBFS |
| White-flash whoosh-boom (sub, tails 0.7-4.5 s) | +3 to +6 f after the white frame (median about 150 ms) | -19.6 to -23.8 dBFS (voice level) |
| Strobe boom or glitch | +5 to +8 f after the strobe starts | -21.6 to -29.8 dBFS |
| Graphic flicker tick (above 4 kHz, 40-360 ms) | -6 to +2 f from the flicker-in; on the fact pin when its text completes | -19 to -31 dBFS |
| Light-on hit (low, 130 ms) | +1 f after the exposure flash | -21.3 dBFS |
| Actuality (soundbites, a crowd) | With the footage; the bed steps back | at or above voice level |
| Silence | Exits, captions, lower thirds, logo, progress bar | none |

**Music.** A bright news bed (spectral centroid 2.6 kHz, pulse clarity 0.12). Pre-roll before the voice; about 22 dB under the talk; up by about 12.7 dB in pauses and B-roll; light ducking (-2.9 dB at voice onsets, +4.8 dB back over 0.5-0.8 s after offsets); steps back for actuality; an outro on the end card faded to zero over 1.8 s. Mix measured -20.7 LUFS, LRA 6.5, a bright voice (high-pass 80-90 Hz).

**Rhythm.** Speech 2.8-2.9 words per second (about 170 wpm); captions on 100 % of words plus 10 headlines; 29 scenes in 193 s (median 4.5 s); presenter shots median 5.25 s (holds of 10-24 s carried by captions and headlines), other shots median 2.20 s (B-roll 2-4 s); a caption chunk every 2.2 s; hook: the question on screen at 2.93 s, five image beats in 14.07 s (1.5-2 s each), the promise at 17.3 s; first second: a 2-frame cover, the silhouette, the circle drop at 0.17-0.47 s, light-on at 0.87 s, speech at 1.0 s; end card 3.9 s with a 2.2 s still hold.

**Fixed elements** (layer `screen`, untouched by flashes)

| Mark | Position at 1080x1920 | Percent of frame | Size and timing |
|---|---|---|---|
| Logo bug (emblem over a boxed wordmark) | x 112-223, y 324-433 | x 10.4-20.6 % W, y 16.9-22.6 % H | 111 px wide (10.3 % W); the whole body |
| Progress bar | x 133-945, y 1718-1729 | x 12.3-87.5 % W, y 89.5-90.1 % H | 11 px tall, #848484 on #1F1F1F; fills over the body |
| Location and date tag | right-aligned at x 969-1005, y 362-418 | x 89.7-93.1 % W (right edge), y 18.9-21.8 % H | On agency footage only: +9 f after the cut, held about 8.8 s, out about 1.5 s before the cut |
| Vertical source credit | the left edge, on agency footage | - | With the footage |

This layout ignores the Shorts interface (captions at y 1518-1620 and the bar at y 1718 sit inside it): fine for full-bleed delivery; for Shorts move both above the platform's bottom band (`ice-arabic/references/safe-zones-rtl.md`).

**Reason rules**

| Element | Trigger | Lands on | Lead or lag | Why |
|---|---|---|---|---|
| Caption | Every spoken line | `voice` (whose voice is heard: white narrator, pink another audible voice; a text the narrator reads stays white in quote marks) | pink from the soundbite's cut frame (0) | Colour = voice identity |
| Scanline headline | The punch words of the sentence (a noun phrase or a verdict), never words already in the caption | `object` (the claim) | lands 0-11 f before the lead-in caption changes; leaves about 2 f before the next caption | Uppercase, heavy, scanlines and glow = a broadcast headline |
| Lower third | The first time a person who speaks on screen appears (not when a name is said) | `speaker` or the on-screen `voice` | 2-6 f after that person's first cut | The name is the most important word; none for people only mentioned |
| Location and date tag | Agency footage | `place` (provenance) | +9 f after the cut | Provenance, small, top right |
| Bullet card | A sentence announcing what is known for sure, then each item named | `object` | each bullet 9-18 f after its chunk starts, on the key noun | A checklist the viewer can hold |
| Fact pin (weak (1)) | A number with a unit | `object` | text complete 4 f before the caption | Red dot = fact |
| Post card with marker (weak (1)) | The narrator introduces a primary source, then reads it | `object` (evidence) | marker 2-4 f after the quote chunk starts, about 17 f per line | Proof, placed inside the wall |
| Threat circle beats | People discussed in the cold open | `discussed person` | image cut on the lead-in chunk, headline on the punch words | Red halo = danger around the subjects of the story |
| Silhouette pre-roll | Frame 0 to the first word | `speaker` | lit 2-3 f before the first word | The narrator steps into the light; never dark again |
| Map-wall country tint (weak (1)) | A topic change to the parties | `place` | 15-20 f after the chunk starts | The only warm area on a teal map |
| Portrait cards (weak (1)) | The parties of a deal named in one sentence | `discussed person` | about 0 f | Who is involved; held about 11 s |
| Running count title | The speech gives the running count (days of an event) over archive | `object` | on the count | A count of time passing; the number traces to the facts list |
| White flash | Entering or leaving B-roll, a new evidence block | `whole frame` | on the chunk boundary | Neutral "new scene" |
| Red flash | A turn to threat or conflict | `whole frame` | on the chunk boundary | Red = conflict |
| Chapter strobe | A chapter break (at most 3 per reel) | `whole frame` | on the chunk boundary | The strongest transition, rationed |
| Blur reframe | A breath on a chunk boundary | `speaker` | 0-2 f | A change of shot size without a jump |

**Finishing.** Studio clean (no grain); archive stills black and white with grain (high-pass deviation 1.88, about 4 px) and scratches on the archive layer only; scanlines only on headline, bullet and counter type (about 40 % modulation); headline glow 12-18 px; captions with no glow (or a soft 2 px dark shadow over picture: conflict below); a bottom caption bed over B-roll and archive (luma x0.89 at y 1000 to x0.43 at y 1480); fog and dust only in the cold open; sticker edge 3-4 px on portrait cards; no motion blur on graphics.

**Conflicts in the measurements** (scoped choices): caption with no shadow (frame breakdown) or a 2 px soft dark shadow over picture (type study): use the shadow only over busy picture; caption max line 826 px or about 560 px typical: break on phrases first, keep at most 2 lines; the pink caption marks a voice, not a quotation (the narrator's read quote stays white): voice wins; zoom anchor on the frame centre here, on the face in the Arabic packages: follow the reel.

**With the user's identity.** The narrator stays white; the other-voice colour becomes a light tint from the user's palette that is clearly distinct from white and passes 4.5:1, never used for the narrator; the name super takes their accent on their light neutral; the threat and fact red becomes their attention colour (or stays red as a semantic signal when their palette has no warm signal, logged); the map wall or set takes their ground and a complement. Their Latin face takes the same weights (500 captions, 800 names, 800-900 headlines) and the same scale; their numeral face sets counts and dates. Their bug and progress bar sit in the same slots; their end card uses their logo on a gradient of their brand colours with the same build order and hold.

### 2.3 Mohawalat Fahm on Al Jazeera 360 (explainer promo package)

Package id `mohawalat-fahm-promo`. Reels measured: two promos of one explainer programme: vertical 78.22 s at 1080x1920, horizontal 59.84 s at 1276x718, both 25 fps. Wood or curtained room, a host reading from papers; a coral or crimson disc behind the lit host; red pills; pinned quote cards; red light flashes into desaturated archive; a navy end card.

**Colours**

| Hex | Job |
|---|---|
| #FD3636, #FE3232 | In-picture graphics red: pills, flashes, tints |
| #E71435, #E51539 | Programme logo crimson, end card only |
| Vertical #DB595E -> #D73B40 (flat, soft left-to-right gradient); horizontal core #B5213B with falloff #85323A -> #53242C (shaded sphere lit top-left) | Disc behind the host (two values: conflict below) |
| #F76363 -> #F35354 | Programme-title circle at the sign-off |
| #E71A36, #EB1732 with a 13 px halo; #FF9998 centre with a 39 px halo | Dot and pin on plates and cards |
| About #FF2E38 as a screen blend | Transition flash (light, not paint) |
| Multiply about #F46A74 (vertical), about #D46874 (horizontal) | Archive tint |
| #E2021E (green 0) | Cold-open red monochrome frame (horizontal) |
| #C23447 -> #D6CCCE -> #B6AEAB | Title arrival red cooling to silver |
| #CFEDEE to #D4F1F4 -> #FDFAFD | Caption arrival cyan (platform), settling to white |
| #2092AB, #9EC9C5 | Platform marks (badge dot, globe) |
| #211C1E at 43 % with a #741D1C streak (vertical); pinkish glass #6B5557 with a #C8999D rim (horizontal) | Quote card and plate |
| #FFF9F8, #FDFAFD, #FFF5F4 | All text at rest |
| Navy #021359 to #061A5B with #BFCCFA only for the episode name (vertical); navy-violet #3F426B with a teal globe horizon (horizontal) | End card |
| #B9292F | Red dot of the programme name (top right) |

Grade: studio p1 11-18, p99 188-241, saturation 104 (vertical) and 66-72 (horizontal); archive desaturated (saturation 19-54, lifted blacks p1 28-43) under the red multiply.

**Type** (Tajawal; vertical sizes at 1080 wide, horizontal at 1276 wide where noted)

| Style | Weight, size | Layout |
|---|---|---|
| Topic pill | 700, 66 px | Coral capsule 790x106 (73 % W), radius 53, padding L21 R30 T31 B16; white on coral about 3.5:1, compensated by size and weight; no kashida |
| Quote or question card | 700, 62 px, line height 1.47 (91 px) | Frosted plate 755 px wide with a 1 px light rim, red streaks and a red pin; 2-3 lines kashida-justified (704, 710, 563 px); Arabic question mark when it is a question |
| Keywords beside the head | 800, about 110 px | Fill white to #908580 top to bottom; blur-in; flank the face, never over it |
| Programme title behind the host | 700 with long kashida, about 116 px, 2 lines | Kashida opens a gap so the head sits inside the word; glow |
| Captions (horizontal) | 700, 47 px at 1276 wide (40 px at 1080, 71 px at 1920) | One line, centred at 78.6 % of frame height |
| Plates (horizontal) | 700 | One line, 39-42 % W, centred at 56-58 % of frame height; titles at 15-40 % of frame height |
| End card | Subtitle about 64 px, episode title about 72 px kashida-justified to equal width, channel line 500 at 42 px | Centred; time digits in Barlow Semi Condensed 600 (body about 51 px) inside a navy capsule with a light border |

Glow: card text tight 4 px white (`text-shadow: 0 0 4px rgba(255,255,255,.35)`); titles 12 px crimson; horizontal captions none.

**Motion**

| Element | Values |
|---|---|
| Opening (vertical) | Pull-out 1.386 -> 1.0 in 38 f (90 % by f17), outCubic, anchored near the top (y about 200) |
| Opening (horizontal) | Red monochrome frame on f0, a second hit and the disc swoop on f5, focus pull f0-16 |
| Breathing push-in | 32-37 f (vertical), 15-49 f (horizontal), x1.19-x1.32, inOutCubic, inOutSine or outQuad; face anchor (638, 130 at 1276 wide); two push-ins carry a 1.3-2.8 % overshoot |
| Breathing pull-out | x0.81 over 37 f (vertical), 39-80 f (horizontal), inOutSine or outQuad |
| Pull-out under a card | x0.71-x0.75 over 48-83 f, near linear: the card recedes with the room |
| Re-entry pull-out | Starts on the cut frame, 1-4 f after the first syllable: 2.05-2.10x -> 1.0 in 26-28 f (outCubic or outQuad); horizontal: 1.63x blurred for 3 f then 8 f to 1.15x |
| Zoom acts the word (weak (1)) | Out on a word of distance (starts -2 f before the clause, lands inside the word, 29 f), in on a word of closeness (+5 f, 58 f) |
| Topic pill fly-in | 6 f from off-screen bottom right (x 850 -> 120, y 1202 -> 1014, width 230 -> 960), a 34 px overshoot 3 f later, motion blur on the fly-in only; then recedes in depth (width -36 % over 36 f) |
| Topic pill grow (second form) | 15 f, width 94 -> 790, right edge fixed at x 940, outCubic (0.53, 0.81, 0.94) |
| Pill hold and exit | Held 72-74 f (2.9 s); flashes from red to white, then collapses toward its right end in 6-8 f (width 364 -> 20), accelerating (inQuad-like): the one white-flash exit of the package |
| Quote card | A red capsule rises from y 1700 to 1300 in 10 f and widens 30 -> 380 px, then the plate opens to 516-856 px with masked text: 20-23 f in total; out by a 9 f linear fade |
| Plate (horizontal) | Rises 58 px (8.1 % of frame height) in 20 f, outQuad, with a 6 f blur-in, its dot +11 f; drifts up 1 px per frame while held; a swap: out 12 f, the next widens from the centre 205 -> 550 px in 15 f |
| Keywords blur-in | Blur 6 px -> 0 with opacity over 12-15 f, ease out |
| Type-on caption (horizontal) | Right-to-left wipe at 26.8 px per frame, linear, 11-12 f per 2 words; the newest letters cyan, white within 4-5 f; out in 1 f; the next chunk 5 f later |
| Colouring title (horizontal) | Ink #C23447 -> #E24F65 -> #ED7A8B -> #EEA2B0 -> #D6CCCE over 8-12 f, linear in hue; hold 15-40 f; fade 12 f |
| Disc swoop (horizontal) | 30 f along a J or U path of about 1400 px, 130 -> 5 px per frame, strong ease out, settling behind the head on the question's last word |
| Disc drop (vertical) | Slides down from above, top edge 0 -> 375 px in 22 f (outCubic-like), diameter 438-448 px (about 41 % W) constant; out by a 17 f fade. The disc keeps about 25-32 % of frame height in both formats |
| Programme-title circle | Diameter 92 -> 292 px in 10 f (outQuart), the text 3-5 f before the circle |
| Spark on the paper (weak (1)) | 3 f on the verb just before a pill keyword |
| Red light leak (vertical) | 27-28 f, peaks at 26 % and 9.4 % of the frame, #A44135 and #B96356, screen blend |
| Archive entry (vertical) | Red screen flash 0 -> 100 % in 2 f, hold 5, out 5 (12 f); interleave of outgoing and incoming frames every frame for 5-9 f; red flashes with a 1-frame attack and a 4-6 f decay (strobe safe mode by default) |
| Archive entry (horizontal) | Blur-out 6 f with a brightening, cut to over-exposed archive for 2-4 f; a crimson multiply on the first frame of each clip (every third frame, 8.3 Hz: safe mode spaces them at least 9 f apart); clips shrinking 23, 11, 9, 12, 11, 6, 6, 5, 4, 4, 2, 2 f; return by a 3 f blur-in on a 1.63x punch, then 8 f to 1.15x |
| Room darkening and crosshair (weak (1), horizontal) | Room luma 65 -> 33 with the face kept at 84-93; relit 7-15 f after the clause |
| Badge and app pill (horizontal) | Exactly 216 f (8.64 s) and 222 f (8.88 s) each |
| End card (vertical) | A 10 f dissolve to navy; build over 88 f in reading order (dot, +10 f subtitle, +20 and +28 f title lines, logotype over 52 f, +40 f channel line, +56 f time pill, +76 f channel logo); a channel logo swap over 22 f; only the background light rings move; 11.48 s |
| End card (horizontal) | A 3D phone swings edge-on across the frame in 14 f while the studio crossfades for about 8 f; orbit line +16 f, text +22 f; still 2.8 s while the audio fades; 6.1 s |

**Depth, 3D and camera.**
- Vertical: a 2.5D card field (weak (1)): the first pill, six tilted photo cards with red pins and the presenter share one virtual space. Trigger: the sentence that names the events, then the verb of spreading (card 1 +2 f, a card every 5 f, each with a 1-2 f red glowing rectangle first; the push-through starts -1 f against the verb). The camera pulls back to x0.40 (outQuad); near cards shrink about twice as fast as the background (-23 % against -12 % over 40 f: a parallax ratio of about 1.9); then the camera pushes through the field x2.1 in 69 f (inOutSine, peak +3.9 % per frame). Near cards and their pins fall out of focus into soft red bokeh (depth of field per card). The first pill recedes in depth after its fly-in.
- Vertical: the presenter is rotoscoped: the disc and the programme title sit behind his head (room, then disc or title, then person, then plates and cards, then chrome). All presenter moves are digital (no parallax inside the room); the B-roll slide is a pure translation.
- Horizontal: real 3D only on the end card (the phone turning in space with the orbit line passing behind and in front of it) and on a 3D waving flag on a glowing pole on the country name (a cloth loop, flag -13 f and label -7 f against the name); everything else is 2D layers with the disc and titles between the set and the presenter. Locked camera, digital zoom 1.00-1.64x anchored on the face, 15 moves, no pan or tilt; rack focus on f0-16 and into and out of archive.
- Both: real background defocus 3.0-6.9 px sigma more than the face; the camera never idle for more than about 3 s (17.7 moves per minute vertical, 23.3 horizontal); the exact share of moving frames was not measured: measure it on the reference (`ice-remake/references/measuring.md`, "Depth, 3D and camera").
- An editor's rebuild of the horizontal promo (ideas and values from a tutorial project): a 35 mm camera on nested nulls (z 870 -> 0 in 1.18 s with 16.8 and 100 % influence, then z 0 -> 736 over 0.65-2.4 s), a text ring wrapped on a cylinder (Y rotation 59 -> 13 degrees in 1.05 s, fade out 0.27 s), an exposure darkening of -2.96 stops over 0.62 s, a red multiply flash from 61 % to 0 in 0.133 s.
- Build routes for each kind (card field, flag, phone in space, wrapped text, depth of field per plane): `ice-motion/references/depth-and-3d.md`, "Build routes for depth and 3D".

**Sound effects**

| Sound | Timing against the visual move | Level |
|---|---|---|
| Sub boom on an edit (97-100 % under 150 Hz, mono, rise 50-120 ms, decay 0.6-1.4 s) | +1 to +4 f after each cut into or out of archive or B-roll, and on the opening | low band -3.8 to -8.3 dBFS (13-17 dB over the voice, which it can be only because it is sub-only) |
| Montage cut hits (horizontal) | On each cut or crimson frame, -2 to +5 f (median +2), accelerating with the cuts | -6 to -16 dBFS, only where there is no voice |
| Card or pill thump (vertical; 77-96 % under 150 Hz, 70-90 ms) | +1 to +2 f from each card pop | -20 to -33 dBFS |
| Tick run, shimmer, soft whoosh (horizontal) | Ticks every 5-6 f while words scroll; shimmer +4 to +24 f on the programme title; whoosh +4 to +11 f on each question plate with the disc | -26 to -36 dBFS |
| Glitch stutter (vertical; 8 high stripes in 0.5 s) | On the frame interleave | -15 to -20 dBFS |
| Actuality | The real event in archive, with no voice over it | at or above voice level |
| Click (50 ms, 1-4 kHz) | +12 f into the end-card logo swap | -41 dBFS |
| Silence | The quote cards (read text arrives in silence), exits, captions, slow reframes | none |

**Music.** Vertical: a bass-heavy percussive bed (pulse clarity 0.12, minor, 92 % of energy under 150 Hz) about 14 dB under the voice, from the opening boom, up in the montage, a held bass note under the sign-off title, fading through the end card, then 3.3 s of digital silence. Horizontal: a rhythmic half-time groove (about 101 BPM, clarity 0.30) about 14 dB under the voice, an opening hit, up in the montages (the only place cut to hits), fading at 46-52 s, a loud platform outro at 54-57 s, then cut and faded to silence by 59.3 s. Level set once, no ducking. Mixes measured -16.9 and -14.7 LUFS; voice high-pass 110-135 Hz.

**Rhythm.** Speech 2.08 words per voiced second, 1.18 overall (vertical); 1.50 overall and 1.72 in segments, 90-103 wpm (horizontal); on-screen text: 7 verbatim text events in 78 s (vertical), captions on 86 % of words (horizontal); one visual event every 1.2-3 s; pills 72-74 f; cards held to 7-9 f after the sentence; hook: first text at 4.68 s (vertical), first word on screen on f6 (horizontal); a presenter long take of 33.5 s carried by graphics (horizontal). Archive bursts: 8 shots in 6.92 s (mean 21.6 f) with no voice for 6.3 s (vertical); 3.6-3.8 s inside speech pauses with clips shrinking from 23 f to 2 f (horizontal). The cut to archive lands 9 f after the last word ends (horizontal) or the flash 11 f after the noun's onset (vertical); the voice may run 12 f into the flash; the return cut lands 1-4 f after the presenter's first syllable; the next sentence may pre-lap 18-26 f under the archive. End card 11.48 s (vertical, build 88 f), 6.1 s (horizontal).

**Fixed elements**

| Mark | Position | Percent of frame | Size and timing |
|---|---|---|---|
| Channel logo (vertical) | top-left x 37-182, y 198-338 at 1080x1920 | x 3.4-16.9 % W, y 10.3-17.6 % H | 145 px wide (13.4 % W), 22 px inside the 220 px top zone; f0 to the end-card dissolve |
| Programme name (vertical) | top-right x 718-960, y 241-301, red dot x 976-1000, y 266-290 | x 66.5-88.9 % W, y 12.6-15.7 % H; dot x 90.4-92.6 % W | 242 px wide (22.4 % W), dot 24 px; f0 to the end-card dissolve, 0 on/off changes |
| Platform or programme logo (horizontal) | bottom-left slot x 92-158, y 522-665 at 1276x718 | x 7.2-12.4 % W, y 72.7-92.6 % H | 66 px wide (5.2 % W); time-sliced, never two marks at once |
| "Now showing" badge (horizontal) | top-right x 1100-1203, y 55-82 | x 86.2-94.3 % W, y 7.7-11.4 % H | 216 f, twice |
| App pill (horizontal) | bottom centre x 510-764, y 607-664 | x 40.0-59.9 % W, y 84.5-92.5 % H | 222 f, with the first question plate |

Margins 6-8 % in the horizontal version; settled cards end at y 1440 or above in the vertical one. From horizontal to vertical: the marks move from the bottom-left slot to the top band; plates go from one line at 39-42 % W on light pink glass to two lines at 72-77 % W on dark glass; emphasis moves from silver colouring words to a red pill and floating photo cards; captions exist only in the horizontal; archive accents move from multiply pulses to red leaks and full red flashes.

**Reason rules**

| Element | Trigger | Lands on | Lead or lag | Why |
|---|---|---|---|---|
| Topic pill (vertical) | The noun phrase naming the topic of a new sentence | `object` (the topic), never a person | -6 to +2 f | A coral capsule = the programme talking; exits on the next verb phrase |
| Pinned quote or question card (vertical) | A full sentence the host reads from his paper, word for word | `object` (the sentence) | -6 to +17 f vs the phrase onset; out +7 to +9 f after its last word | Glass keeps him visible; the pin pins it to his paper |
| Glass plate with a red dot (horizontal) | The key sentences: claims and new opening questions | `object` (the argument) | +5 to +20 f; out 0 to +7 f after the last word, or cut away by archive 9 f after | Glass keeps the speaker visible; the dot ties it to the disc |
| Question disc behind the lit host | Horizontal: each new opening question (3 of 3, against 0 of 2 statements and 0 of 2 follow-ups), the violent hook clause (1), behind the flag on the country name (1), the programme title at the sign-off. Vertical: the programme title, and once a statement naming new actor groups (weak (1)) | `programme` (the programme asking; the host as the asker, never the accused) | swoops in with the plate (+5 to +20 f), settles on the question's last word; leaves 7 f after the question ends, as a follow-up starts | A stage spotlight in the programme colour; the host stays lit |
| Two keywords flanking the head (weak (1)) | Two nouns naming new actor groups | `discussed person` (as words) | -4 f | Words, not a darkened figure, for groups |
| Colouring title (horizontal) | The single loaded word or noun pair of the phrase | `object` or `place` | lags: +4 to +20 f after the word starts (median about +8 f); red ends -10 to +5 f of the word's end | Red = being said now; white = said, kept as a note |
| Type-on caption (horizontal) | Linking narration in 1-4 word chunks, starting on the first content word | `voice` | -2 to +4 f after the content word; +9 to +16 f after a leading conjunction or preposition | Verbatim subtitle; the cyan entry = the platform's voice |
| Flag | The country name right after the set-up phrase | `place` | flag -13 f, label -7 f | Factual asset |
| Card field and push-through (weak (1)) | The events named, then a verb of spreading | `object` (the events) | card 1 +2 f; push-through -1 f vs the verb | The camera moves through the pictures as the words say they spread |
| Archive burst | A sentence ending on a noun that names what is shown; never during a question (0 of 5) | `whole frame` | cut +9 f after the last word ends; flash +11 f vs the noun's onset | Evidence; red = heat and alarm |
| Red light leak (weak (1)) | The breath between the hook sentence and the first statement | `whole frame` | starts -3 f vs the end of the hook, ends +9 f after the next word | Brand red as light bridges the pause |
| Room darkening and crosshair (weak (1)) | A clause about a person discussed being targeted | `discussed person` (the host only stands in the target position; his face stays lit) | darkening 0 f, crosshair +1 f | A sniper sight; the room goes half dark, the face does not |
| Push-in | A key noun or a question word | the `speaker`'s statement | -7 to +9 f (horizontal); -10 to +15 f on questions (vertical) | Intimacy for the argument |
| Pull-out | The cut back to the host; a card's first frame | `whole frame` | on the cut frame; +4 to +12 f after the card | The cut hides inside the motion; room for the card |
| Badge, app pill | The call-to-action sentence (0 f); the first question plate | `programme` | 0 f | Brand marks rationed in time, never stacked |
| Programme title with disc | The programme name at the sign-off | `programme` | pre-glow +12 f vs the name's first word, white on its second (vertical); disc +30 f (horizontal) | The logo motif in the room, the host lit in front; held 2.2 s |
| End card | After the last word | `programme` | dissolve +57 f (vertical); phone swing +27 f (horizontal) | When and where to watch |

Never in this package: text red at rest (0 of 9 and 0 of 15 text events); the disc on a statement plate or a follow-up question; text over an archive montage; an archive cut during a question; captions in the vertical version; a sound on the quote cards.

**Finishing.** Clean picture (noise 0.5-0.9 on flat areas, no scanlines); defocused backgrounds (3-6.6 px); red light leaks of 27-28 f only in the vertical version; glow on pins (halo 39 px, dot 13 px) and on title text (12 px crimson); motion blur only on the 6 f pill fly-in; the red flash as a screen blend (red clips at 252, green and blue keep 78-82 % of the picture); the archive tint as a multiply at about 73 % (red x0.96, green x0.42, blue x0.46, blacks stay black); in the horizontal version a vignette (corners against centre 0.38-0.41) that darkens slightly on new elements (weak) and a rack focus at the opening; frosted cards (#211C1E at 43 % vertical, lifted pinkish glass horizontal); one 4 px colour fringe at the warp edge of the first archive shot (once, do not generalize).

**Conflicts between its reels** (scoped choices): the disc marks new opening questions in the horizontal reel (3 of 3) but not in the vertical one (0 of 5 questions), where it marks the programme title and once a statement: follow the reel, and with neither, keep the question rule and the sign-off; disc colour light coral flat (vertical) or a crimson shaded sphere (horizontal); quote card timing (-6 to +17 f) against plate timing (+5 to +20 f): each for its own element; the host is dimmed once for 26 f coming out of archive (luma 39 against 57): the speaker-lit rule forbids darkness and silhouettes while he speaks, not every brightness change; an editor's rebuild adds risers ending 1-2 f before cuts and a glint when a card settles, while the measured reels have no riser longer than 0.7 s: follow the measured reel, add risers only when the reference has them.

**With the user's identity.** The roles carry over: the in-picture attention red becomes the user's attention colour (pills, flashes, tints, pins); the programme crimson becomes their brand colour, on the end card only; the disc is a shaded sphere in their attention colour behind the lit host, with the same triggers; the cyan arrival becomes their secondary or platform colour, lasting 4-5 f; the navy end card becomes their dark brand ground with one distinct colour reserved for the episode title. Their Arabic face takes 800 for keywords, 700 for pills, cards and captions, 500 for secondary lines, kashida only where the reference measures it. Their logo and programme name with its dot take the same slots and sizes; values of moves, sound, rhythm and depth stay as measured.

## 3. Sub-brand patterns

Smaller programmes of the same network share the house grammar (a near-black or desaturated ground with one saturated accent per programme, big titles with glow and texture, feathered masks, logos fixed while everything else moves, one key element per beat). Each adds one signature device. Values come from editors' rebuilds (ideas only); measure the real reference when one is given.

| Pattern | Format | Device and numbers | Build |
|---|---|---|---|
| Question card (Midan) | 1920x1080 or 1080x1920, 25 fps | A white outlined box (1060x194 at 1920 wide, stroke 5 px) opens from a dot and a line in 21 f (0.84 s, expo out); the question is typed by a mask with a glowing yellow head (#FFDE00, or a second layer in #E0A300 with a strong soft glow) running 2-7 f off the white text, at about 27 characters per second (73 characters in 59 f); red corner brackets, dashed rules; a black-and-white satellite still (gamma about 0.34) with red masked zones feathered wide. Arabic tracking stays 0 | `ice-type/references/type-effects-specs.md`, "Broadcast text" (typewriter with a coloured head); box from a line: `ice-motion/references/atomic-moves.md`, "Broadcast news moves" |
| Topic wheel (Ateer) | 1920x1080, 29.97 fps | A large thin dial off-frame right (radius about 950 px) with the topics on its arc; eased rotation steps of -65, -14 and +2.9 degrees at f20, f62 and f89 (about 80 % influence); labels counter-rotated to stay level; inactive topics defocused under a feathered mask; cyan glow; bokeh orbs only with a named reason | `atomic-moves.md`, "Broadcast news moves" (topic wheel) |
| Documentary title frame | 1080x1920, 25 fps | A title frame opening from the centre; text revealed by a per-letter mask at 2.4-3.3 f per letter with a yellow copy (#FFC44D) 4 f ahead of the white; a light beam; a 3D camera settle (z -1507.7 to -2666.7 with a 5 degree tilt); a 5 f drop exit with vertical blur | `cut-catalog.md`, "Broadcast transitions" (drop exit); `springs-and-curves.md`, "Broadcast settle" |
| Flat ident (AJ+) | 1280x720, 25 fps | Flat 2D yellow (#EBBB22) and black on light grey (#F3F3F3), character animation, the logo slam at 40-45 % of a 10 s ident | `atomic-moves.md`, "Broadcast news moves" (brand sting) |

## 4. Glass studio reel

### Glass Studio Reel (`glass-studio-reel`)
- **What it is:** a presenter reel whose value is decided at the shoot: the presenter shot wide in a white cyc studio painted by coloured lights, with a projected circle of light behind the head; a few large frosted glass capsules that magnify and refract the shot and carry the text; glowing gradient titles with kashida; props placed in depth between the subject and the wall; slow light sweeps and tapered glowing lines. Aliases: "glass shape", "liquid glass reel", "glassmorphism reel", "glass shape style". The market name of its visual part follows the 2025 liquid-glass interface language; no established name exists for the whole reel.
- **How it differs from a news reel:** the edit is simple and the shoot carries it (the tutors put it at about 90 % shooting, location and light); the screen holds a few large designed glass objects instead of many cuts and word captions; motion is slow reveals and sweeps, not punch-ins and shakes; elements live in depth around the subject.
- **Numbers (from editors' rebuilds, ideas only):**
  - Glass: a shape that blurs and brightens what is behind it (blur 50 and brightness 50 in After Effects units) and magnifies it 110-130 %, optional 3 % noise; a rim of 2-3 px white at 30-50 % (or a soft-light copy of the stroke at 50 %); edge refraction from an inner glow (size 30-35, range 50 %) used as a displacement map; a light sweep inside at -30 degrees, red or white, additive. A glass plugin preset reads: strength 20, index of refraction 1.5, blur 11, white tint 10 %, specular 300, softness 14, edge 8, angle -45.
  - Capsules: 426x102 px with radius 26 at 720 wide (59 % W), 1428x310 px with radius 136 at 2160 wide (66 % W); they open by width from 0 to full in 27-51 f (1.1-2.0 s).
  - Glow: low exposure (0.2-0.5) so it stays comfortable; glow reads on dark areas and coloured light, not on white cyc.
  - Defocus: 10-15 on the presenter (never more), 2-3 on composited props; masks always feathered.
  - Plate: upscaled to about 125 % before any move, so moves never show an edge.
- **Shooting:** distance from the wall, coloured light on the cyc, the projected circle, wide framing and headroom: `ice-edit/references/ingest-and-ledger.md`, section "Shooting for a news reel". When the footage was shot tight or flat, say so at stage 01 and offer a virtual set (`layers-and-isolation.md`, "3b. Programme matte kit").
- **Text:** the glass subtitle box: `ice-type/references/type-effects-specs.md`, table "Broadcast text". Gradient titles with kashida: `ice-arabic/references/kashida.md`.
- **Engine:** backdrop blur and blend modes are an engine limit in HyperFrames; the route is in `ice-engines/references/hyperframes.md`.
- **Depth:** props in z around the subject, a glow disc behind the head, glass in front, the title on top; parallax from one camera on a null; build routes: `ice-motion/references/depth-and-3d.md`, "Build routes for depth and 3D".
- **Colour:** glass here is the medium of the style, chosen with its reason row; elsewhere glass stays a legibility device with a D-entry (`ice-direction/references/color.md` section 7).
- **Use when:** a presenter or founder reel, a promo or an explainer where the user can shoot in a lit studio, or supplies footage shot that way; the reference is a glass studio reel.
- **Do not use when:** the footage is tight, flat or outdoors and no virtual set fits; a hard news story (glass reads as promotion); many fast facts that need captions on every line (pick the presenter news reel).
- **Common mistakes:**
  - Glass with nothing behind it to refract -> glass only over the lit set or the subject, never over a flat ground.
  - Many small glass chips -> a few large capsules, one at a time.
  - Glow on the white cyc -> glow on dark or coloured areas only, low exposure.
  - Punch-ins and shakes from ordinary reels -> slow reveals, sweeps and depth moves.
- **Variation slots:** (illustration only)
  - Structure: one capsule per idea across a single take; a title, three capsules and a closing title; a prop that moves in depth as the thread of the piece.
  - Opening: the light circle blooming behind the presenter; a capsule opening by width on the first word; a slow dolly between props into the presenter.
  - Ending: the capsules leaving in depth; the title settling as the light circle fades; the presenter alone in the coloured light.
- **Source:** editors' tutorials on the glass shape style and their asset folders (ideas and values only).

## 5. Never copy

- No channel logo, programme logotype, watermark, badge or programme icon is drawn, traced or stored in this repo. When the `identity` slot is "as they are" or "a mix", the official files are fetched at run time and recorded (`ice-assets/references/sourcing-and-licenses.md` section 0); otherwise the user's marks take the slots, or the name is set as text (`ice-assets/references/brand-authenticity.md`).
- No copy text of theirs in this repo or in a new film's words: episode titles, slogans, taglines, end-card lines, broadcast-time lines and platform lines. A new film's words come from the user's content and the transcript; the reference's own files enter a film only through `rights-and-modes.md` section 1.
- No footage, archive, stills, cut-out photos, music or sound files taken from a reel into the repo; the end-card swish and chime are one channel's sound template: source sounds of the same type.
- A programme's hues as a set are its skin: use them only under the identity choice above; otherwise keep the role logic with the user's colours.
- Render at the delivery frame rate: never copy a duplicated-frame retime (an end card at about 18 effective fps) or a 30 fps conform of a 25 fps master.
- No photosensitive strobes by default: per-frame interleaves, red frames every third frame and chapter strobes go through strobe safe mode (`ice-audio/references/cue-map-and-beat-sync.md` section 6); the faithful version only when the user asks in their own words.
- Do not copy flaws: codec blocks and colour fringes, anti-phase sub booms that vanish in mono, true-peak overs, captions inside the Shorts interface band when the delivery is Shorts.
