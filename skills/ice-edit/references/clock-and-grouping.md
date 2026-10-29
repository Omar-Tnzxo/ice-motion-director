# One shared clock: EDL, plan, anchors and clip grouping

Merged from browser-use/video-use (MIT: EDL), nateherkai/herk-edit-kit (MIT, Use Permission: plan schema, video-storytelling, video-beats, beat-sync gate), digitalsamba/claude-code-video-toolkit (MIT: audio-anchored timelines), Omar-Tnzxo/video-production-studio, heygen-com/hyperframes (Apache-2.0: creator editing recipes, talking-head recut), plus ideas restated from remotion-dev/skills (ideas only: clip and caption grouping).

## 1. The rule

Picture, captions, graphics, music and sound effects all move on one clock: the edited timeline derived from the locked cut. Never hard-code a second count where a word should anchor; place things at "sentence N, word K" of the corrected transcript and compute the time from it. When a line or a cut changes, everything anchored to it moves with it.

## 2. EDL (multi-source cut list for `render.py`)

```json
{"sources":{"<name>":"<path to source>"},
 "ranges":[{"source":"<name>","start":0.0,"end":0.0,"beat":"<label>","note":"<why>"}],
 "grade":"<omit unless approved: preset name, raw filter, or auto>",
 "overlays":[{"file":"<path>","start_in_output":0.0,"duration":0.0}],
 "subtitles":"<optional path to master.srt>"}
```

- Ranges play in order; times are source times. Output offsets accumulate range by range.
- `python scripts/render.py <edl.json> -o <out> --draft` (720p, CRF 28, cut-point check only), `--preview` (1080p, CRF 22, review), final (CRF 20, then two-pass loudnorm). `--build-subtitles` writes `master.srt` from per-source transcripts in `<edit dir>/transcripts/`; `--fps` forces one output rate.
- `node scripts/edl-to-edited-transcript.mjs <edl.json>` writes the edited-timeline transcript every later layer reads.

## 3. Plan map for short-form builds (`assets/plan.json`)

Seconds are edited time except fields prefixed `source`. Quantize cuts and scene boundaries to 1/fps; keep precise ASR word times rather than rounding each word.

```json
{"duration":0.0,"fps":30,
 "reference":{"maxEventGap":0.0,"eventsPerMinute":0.0},
 "scenes":[{"id":"s00","start":0.0,"end":0.0,"layout":"face","kind":"<asset stem>",
            "anchor":"<exact transcript phrase>","anchorTime":0.0,"holdReason":"<optional>","cut":"<optional: archive>"}],
 "events":[{"time":0.0,"type":"<real visual action>","visual":"s00","anchor":"<phrase>"}],
 "captions":[{"start":0.0,"end":0.0,"words":[{"text":"...","start":0.0,"end":0.0,"sourceStart":0.0,"sourceEnd":0.0}]}]}
```

- Layouts: `face`, `split`, `paper`, `broll`, `broll-split`. A B-roll scene's `kind` names `assets/<kind>.mp4`.
- `events` are real visual actions, never filler entries added to satisfy cadence. In a news reel a camera move start, a graphic in or out, a flash and a colour wash each count as an event (`edit-types/news-reel.md` section 3).
- `reference` (optional, lesson L9, every edit that follows a reference): copied from the reference's events file `ice/reference/<ref-id>/analysis/events.json` (measured with `ice-remake/references/measuring.md`, section "Pacing events"): `maxEventGap` is its longest gap between consecutive events in seconds, `eventsPerMinute` its event density, holds excluded. With it, the plan's gap limit is `maxEventGap x 1.10 + 1/fps` instead of 2.2 s and a `holdReason` does not excuse a gap above it; the plan also fails when its events per minute (events of `type` or `kind` `hold` excluded) fall below `eventsPerMinute x 0.90`. Only changed material clears a fail, or the user's own words accepting a slower pace, logged in `ice/DIRECTION.md`. The same gate runs on the render: `ice-qa/references/motion-density.md`, "Pacing against the reference". Without `reference` the 2.2 s rule below holds unchanged.
- `cut: "archive"` (news reel archive burst, `edit-types/news-reel.md` section 4): the scene's anchor is the noun that names what the archive shows, `anchorTime` its end, and the cut sits 0.36 s after it (row "Archive cut" in section 4); the anchor tolerance below is applied around that point.
- `assets/transcript.json` holds the retained words with text, start, end, sourceStart, sourceEnd. `assets/edit-decisions.json` holds `duration`, `fps`, `keeps` (`{sourceStart,sourceEnd,start,end}`) and the reviewed removal reasons. Every retained word maps back to one kept range without crossing a cut; when no edit was made and `sourceStart` is absent, adapt the validator explicitly.
- Check: `node scripts/validate-plan.mjs <project>`. It fails on: caption word count or text differing from the retained words, caption times more than 0.005 s from the transcript, a word crossing a cut or mapped more than 0.006 s off (keep-range tolerance 0.016 s), scene gaps or overlaps over 0.005 s, scenes not frame-aligned, an anchor more than 0.15 s before or 0.2 s after its scene start, missing moving B-roll, a visual-event gap over 2.2 s without `holdReason` (with `reference`: a gap over the reference limit, or a density under it, whatever the hold reason), caption groups truncating words or overlapping. It reports average shot length, the largest event gap and the speaker share (with `reference`, also `eventsPerMinute`). It checks timing and coverage, not creative quality.

## 4. Anchor leads (scoped, all kept)

| Element | Enters | Scope |
|---|---|---|
| Short-form scene cut | Within -0.15 to +0.2 s of its anchor word | Shorts and reels plan |
| Archive cut | 0.36 s (9 f at 25 fps) after the end of the noun that names what the archive shows, inside the speech pause; never during a question. Replaces the scene-cut window above for that cut only (plan scene `cut: "archive"`) | News reel (edit type `news-reel`, style family `family-broadcast-news.md`): archive burst, `edit-types/news-reel.md` section 4 |
| Caption or impact event | Sync target: the `ice-type` skill, `references/caption-timing-and-truth.md` section 3 | Short-form |
| Persistent-world graphic element | 0.15 to 0.25 s before the anchor word | Long-form graphics-led |
| Overlay card (lower third, takeover) | 0.2 to 0.6 s before the anchor; stays until the topic ends; clears 0.1 to 0.5 s before the next card | Long-form talking head |
| Beat-sync gate on word-anchored overlays | Between 0.2 s after and 1.8 s before the anchor word (suggested lead 0.5 s); each overlay names its exact transcript phrase | Long-form overlays |
| Visual before narration | The picture appears slightly before the words describe it ("see, then hear") | Explainer inserts |
| Payoff reveal | Starts its own duration early so it lands on the payoff word | All |
| Count-up | Ends on the number word's start, with any shake or sound on the same frame; each finished component holds at least 1.2 s | Talking-head ad |

Never divide a section evenly into beats; time everything to word starts. Overlay card durations (long-form defaults): overview 8 to 10 s, stat 5 to 8 s, explanation card 12 to 30 s, long topic card 25 to 45 s. A card that appears on the right topic but lasts 5 to 8 s while the speaker discusses it for 20 to 40 s is a defect.

## 5. Audio-anchored timelines

- Lock audio first (the cut, or the generated voiceover), read real durations, then place visuals at absolute times computed from it. Keep a comment block or plan file at the top as the source of truth; every start refers to it. Durations are read, never estimated, so drift is impossible.
- Absolute starts suit tight ad-style edits and anything under about 30 s. Auto-chaining scenes end to end suits long-form sections that may flex, but drift compounds; mix the two when the engine allows.

## 6. Clip and caption grouping (idea from remotion-dev/skills, restated)

- A clip and its captions as one group, timestamped relative to the source file: the `ice-type` skill, `references/caption-timing-and-truth.md` section 5. Overlays synchronized to a clip join the same group, so trim, duration, speed and position apply to them once.
- Clips that move independently are placed one by one (gaps and overlaps allowed). Clips that must stay adjacent go in a sequence whose durations are fixed, never positioned by hand.
- In HTML timeline engines, all captions sit on one dedicated caption track above the clips.

## 7. Changing the timeline after graphics exist

- Every later timing change (even a 2 s air pass) goes through a scripted transform that shifts every time after each edit point, derived from the canonical edit list itself, followed by a diff review. Never hand-edit baked times.
- A changed cut or a regenerated voice re-opens every seam, caption and sound cue after it; rebuild them from the same map.
- Copying a group of clips: add one delta to every member's start, give new unique ids and the next free track, leave the originals untouched. Adding media starts at the playhead or the requested time, never a silent zero.
- Splitting a section with a speed change: new length = old length / rate; every later start moves by the same delta.
