# House style numbers (rhythm ranges by edit type)

Merged from nateherkai/herk-edit-kit (MIT, Use Permission: 27 top reels measured March to September 2026, video-beats, video-storytelling), majedphotos/video-ad-editor (MIT), Omar-Tnzxo/video-production-studio, heygen-com/hyperframes (Apache-2.0: talking-head recut card formula), Barty-Bart/motion-graphics (MIT: motion B-roll density), plus ideas restated from imMamdouhaboammar/motion-graphics-skills and Vincentwei1021/video-talkcraft (ideas only).

These are measured starting points, not law. They set rhythm ranges only; palette, type, look and structure come from the ice-direction skill and must differ between projects. The project brief overrides every number here; log any departure with its reason.

## 1. Speech rate and pacing diagnostics

| Measure | Value | Scope |
|---|---|---|
| Speech after cutting | 4.0 to 4.7 words per second; median gap between words 0.04 s, 90th percentile 0.1 s. This is the density of edited real speech after dead air is removed, not a voiceover pace: never use it to budget or time a voiceover script | Shorts and reels house style |
| Speech start | Within 0.1 s of the first frame; file ends right after the last word | Shorts and reels |
| First spoken word in ads with voiceover | The `ice-audio` skill, `references/voiceover.md` section 2 | Ads with voiceover |
| Never speed up the voice | Tightness comes from removing dead air between phrases | All |
| Educational speech | Give it room to breathe; the brief controls pacing | Long-form |

Narration rate for generated voiceover is owned by the ice-audio skill.

## 2. Shot length

| Measure | Value | Scope |
|---|---|---|
| Average shot | 1.1 to 1.4 s, none over about 2.8 s | Shorts and reels house style |
| First cut | 0.6 to 1.0 s, on the first charged word | Shorts and reels |
| Event cadence | Treat 1 to 2 s per visual event as a diagnostic, not a schedule. A visual-event gap over 2.2 s fails unless the scene carries a `holdReason` | Shorts and reels (plan validator) |
| Lists | Each item in a spoken list gets its own shot | Shorts and reels |
| Something every 2 to 4 s; a core move only on important sentences; a camera move at most once per scene; never the same move twice in a row | | Talking-head ad |
| Dead screen | Any stretch over about 1.5 s with nothing happening in a graphics-led video | Long-form persistent-world graphics |
| Visual beat cadence | Early video: no more than 20 to 30 s without a visual beat; main body: 30 to 45 s | Long-form talking head with overlay cards |

## 3. Layout shares and speaker presence

Vertical 1080x1920 house reel (every layout change is a hard cut):

| Layout | Share of the reel |
|---|---|
| Split: B-roll on top (y 0 to 880), speaker below | 30 to 42% |
| Full B-roll | 50 to 55% |
| Punch-in: tight speaker shot for pivots, emphasis and the call to action | 5 to 15% |

| Presence rule | Value | Scope |
|---|---|---|
| Speaker on screen | About 45% of the time, never gone for more than about 3.5 s; the first frame is a split with the topic's tool or brand on top | Shorts and reels |
| Speaker on screen | About 40% across a graphics-led video; long absences are fine at payoff beats, audit them rather than capping | Long-form |
| Face off, voice on | Once or twice per video, 4 to 8 s each, only for numbers, lists or comparisons, never in the hook or the final call to action | Talking-head ad |
| Face between cutaways | At least about 2 s | Motion B-roll over a talking head |
| Speaker absence | Never two consecutive shots without the speaker; one absence of 3 to 6 s at most once, and the next shot brings the speaker back | Long-form explainer with a host |
| Speaker form | Rotate the speaker's form and position across shots (full, half body, corner badge left or right, split cell, cutout, brief absence); three identical in a row is a defect | Long-form explainer with a host |
| Collage style | Speaker shows at least 3 s each time and at most 55% of the video | Collage reels |

## 4. Punch-ins and zoom (static per segment)

| Mode | Zoom cycle and limits |
|---|---|
| Normal | Locked zoom per segment cycling about 1.00, 1.08, 1.00, 1.06, 1.00, 1.12, 1.04, 1.14 |
| Calm or premium | 1.00 to 1.06; no zoom or layout change before 4 s on the same shot; at most 6 changes per 30 s |
| Hyper | Hook zoom plus a layout switch every 1.5 to 2 s; effects stay under 15 per minute |
| Ceiling | Ideal punch 1.12 to 1.15x; never above 1.20x on 1080p source |

- Lock each zoom to its segment by source start time so a re-cut keeps it.
- Vertical crop anchor about 12 to 18% from the top (face near 30% from the top); never center-crop a face (it clips foreheads).
- Break the zoom alternation when the meaning changes, or the automation shows.
- Zoom out only as a return from a zoom in; it never turns the frame into a card and never goes smaller than the source.
- Something must move in the first second; a static first frame gets scrolled past.

## 5. Overlay density

| Format | Density |
|---|---|
| Motion B-roll clips over a talking head | Light 2 to 4 per minute; medium (default) 4 to 7; heavy covers most lines with short gaps of face. About 33 s: medium 3 clips, heavy 4 to 5 |
| Short talking-head ad | 3 to 4 B-roll inserts per video; one hero per scene |
| Overlay cards on a long talking head (card count) | Base pace by duration: under 60 s one card per 6 to 8 s; 60 s to 3 min 8 to 12 s; 3 to 10 min 12 to 20 s; 10 to 30 min 20 to 35 s; over 30 min 30 to 60 s. Multiply the pace by density (high 0.7, medium 1.0, low 1.5). Cards = max(5, round(video seconds / pace)). A static one-liner gets boring past 8 s |
| Paper or full-frame takeover cards | Occasional punctuation, usually 4 to 12 s |

## 6. Multi-camera rhythm

| Measure | Value |
|---|---|
| Hook | Full-screen close-up |
| Switching | Switch to the speaker after about 1 s of continuous speech; no switch before 4 s; no shot over 9 s; minimum shot 2 s |
| Head close-ups | 3 to 8 s, at least 8 s apart |
| 16:9 episode | Wide shot on silence or overlap, plus about 4 s of wide every 45 s |
