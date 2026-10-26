# Export and delivery of an edit

Merged from browser-use/video-use (MIT), nateherkai/herk-edit-kit (MIT, Use Permission), digitalsamba/claude-code-video-toolkit (MIT: ffmpeg skill), majedphotos/video-ad-editor (MIT), Omar-Tnzxo/video-production-studio, plus ideas restated from imMamdouhaboammar/motion-graphics-skills (ideas only). Platform specs, engine render flags and cover design live in the ice-engines skill; loudness targets and mixing in the ice-audio skill; the delivery report format and gates in the ice-qa skill.

## 1. Quality ladder

| Stage | Settings | Purpose |
|---|---|---|
| Draft | 720p, x264 ultrafast, CRF 28 | Cut points only |
| Preview | 1080p, x264 medium, CRF 22 | Review and self-check |
| Cut stage files | x264 medium, CRF 18, AAC 192k, `+faststart` | Silenced and clean cuts |
| Final (default) | x264 fast CRF 20 per segment, composite CRF 18 | Delivery from `render.py` |

These rows describe `render.py`'s own stages. Codec and quality for every other purpose (archive master, upload master, social master with a size cap, draft, review copies sized for chat): the `ice-engines` skill, `references/render-export.md` sections 2 and 4; where they differ from a row above, re-encode the `render.py` output to the owner's values.

Output resolution and frame rate: match the source unless asked. Frame rate rules, one frame rate per film and final file sanity: the `ice-engines` skill, `references/render-export.md` sections 1 and 2.

## 2. Delivery encode checks

- Encode tail, color range and tags, and when to re-encode: the `ice-engines` skill, `references/render-export.md` sections 2 and 3. Re-encode phone HEVC or full-range footage.
- Probe the delivered file: resolution, frame rate, duration against the plan, no dropped frames, audio present.
- Loudness: master once on the final mix. Loudness profile per edit type (long-form and podcast use a different target from social), measurement and the mono trap: the `ice-audio` skill, `references/mix-and-master.md` sections 5 and 7. `render.py` always normalizes to -14 LUFS, -1 dBTP, LRA 11 unless you pass `--no-loudnorm`; when the chosen profile differs, pass `--no-loudnorm` and master with the `ice-audio` skill's tools.
- When an HTML engine re-encodes audio quieter, remux the mastered WAV into the render: `ffmpeg -i <render> -i <master.wav> -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest <final>`.
- Black-frame gate: the `ice-qa` skill, `references/delivery-checks.md` section 2.
- A playable final MP4 with its absolute path and hash; never label a draft as final.

## 3. Deliverables

| File | Rule |
|---|---|
| Master MP4 | Naming and version keeping: the `ice-engines` skill, `references/render-export.md` section 8. Keep a changelog of edit passes |
| Versions and cutdowns | Exactly the ones planned at 03 in `ice/plan/versions.md` (ratios, reels, languages, 15 s and 6 s cutdowns, each cutdown with its own hook); each composed and verified on its own |
| Captions | `.srt` (and `.vtt` when asked) from the same timings that were rendered; a `.txt` transcript for the post description; an un-captioned master (caption rules in the ice-type skill) |
| Edit record | EDLs, retimed transcripts, approved cuts with reasons, plan files, the footage ledger |
| Review | The delivery report `ice/review/NOTE.md` (see `production-rules.md` section 3) |
| Stems | Music-only and voice-only stems when the user may re-edit |
| Editable hand-off | When the user will finish in their own editor, deliver clips named by timeline in-point plus the plan, and say so |

Keep the user's own edits and levels from any studio session; re-place audio on new frame times instead of overwriting them.
