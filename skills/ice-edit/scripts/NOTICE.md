# Bundled scripts: index, provenance and licenses

Every script here was read in full before it was copied. None calls a paid service, uploads media, or downloads code at run time. One disclosed network call exists: when the direction chose a Google Fonts family, `motion-broll/build.py` downloads it at build time (cached and embedded), and the `motion-broll` review pages link Google Fonts; `--offline` or `ICE_OFFLINE=1` turns both off (fonts then come from project files or installed system fonts). They need `ffmpeg` and `ffprobe` on PATH; Node scripts in this folder use only Node built-ins, while `motion-broll/render.js` and `beats.js` also need Playwright installed in the user's project; `timeline_view.py` also needs `numpy` and `Pillow` (exact pins in `requirements.txt`). Minimum Node and Python versions: `runtimes` in the `ice-engines` skill's `references/versions.json`.

Transcription is not bundled. Use a local word-level ASR (Whisper-class with word timestamps) by default. A hosted ASR (for example ElevenLabs Scribe) is optional, paid, and used only after the user's yes (asked in the stage 01 message) to the cost and to uploading the audio; without it the local ASR is used.

## Index

| Script | Job | Source | License | Copy |
|---|---|---|---|---|
| `cut-silences.mjs` | Transcript-driven silence trim with breath model, EDL, retimed transcript, optional ffmpeg cut | nateherkai/herk-edit-kit | MIT + Herk Edit Kit Use Permission | Changed (comments) |
| `find-cut-candidates.mjs` | Stutter, retake (Jaccard) and false-start candidates for review | nateherkai/herk-edit-kit | MIT + Use Permission | Changed (Unicode tokens, comments) |
| `apply-cuts.mjs` | Apply reviewed cuts, retime transcript, optional ffmpeg cut | nateherkai/herk-edit-kit | MIT + Use Permission | Changed (comments) |
| `build-edl-review.mjs` | Self-contained HTML review page for any EDL | nateherkai/herk-edit-kit | MIT + Use Permission | Changed (title text) |
| `edl-to-edited-transcript.mjs` | Multi-source EDL plus per-source transcripts to an edited-timeline transcript | nateherkai/herk-edit-kit (`video-use-to-hyperframes-transcript.mjs`) | MIT + Use Permission | Changed (renamed, comments) |
| `validate-plan.mjs` | Plan validator: caption word exactness, source mapping, frame-aligned scenes, event gaps, coverage floor, triggers, craft tags | nateherkai/herk-edit-kit | MIT + Use Permission | Changed (notice line; reference pacing L9, archive cut, coverage floor L17, triggers, craft tags, craft-plan exemptions) |
| `validate-footage.mjs` | Footage ledger validator: sha256, repeated scenes, overlapping intervals | nateherkai/herk-edit-kit | MIT + Use Permission | Unchanged (notice line added) |
| `beatgrid.mjs` | Showreel cut sheet on a beat grid | nateherkai/herk-edit-kit | MIT + Use Permission | Unchanged (notice line added) |
| `music-grid.mjs` | Measured beat period, kick-band phase, per-bar energy | nateherkai/herk-edit-kit | MIT + Use Permission | Unchanged (notice line added) |
| `analyze-reference.mjs` | Contact sheets, hard cuts, luminance, RMS, onsets, cut offset from the beat | nateherkai/herk-edit-kit | MIT + Use Permission | Unchanged (notice line added) |
| `render.py` | EDL renderer: per-segment extract with 30 ms fades, lossless concat, PTS-shifted overlays, subtitles last, HDR tone map, two-pass loudnorm | browser-use/video-use | MIT | Changed (untyped words, paths, comments, grade per EDL range L20, `--dry-run`) |
| `grade.py` | Grade presets and a bounded auto grade | browser-use/video-use | MIT | Changed (paths, comments, `news_clean` and the outside-material presets) |
| `pack_transcripts.py` | Phrase-level packed transcript (`takes_packed.md`) | browser-use/video-use | MIT | Changed (paths, comments) |
| `timeline_view.py` | Filmstrip plus waveform plus word labels PNG for a range | browser-use/video-use | MIT | Changed (untyped words, paths, comments) |
| `cutdown.py` | 16:9 to 9:16, 1:1 or 4:5 reframe (blur, crop, pad) with segments | digitalsamba/claude-code-video-toolkit | MIT | Changed (helper inlined, `--brand` removed, paths) |
| `motion-broll/motion.js` | Closed-form spring engine, content swaps, cursor path, icon set, scene runner | Barty-Bart/motion-graphics | MIT (icons adapted from Lucide, ISC) | Unchanged (notice line added) |
| `motion-broll/build.py` | Fragment to self-contained page | Barty-Bart/motion-graphics (`engine/build.py` + `engine/base.css`) | MIT | Changed (CSS inlined; project font files first, then the directed system or Google family with no fixed order, Google families embedded at build time; offline switch; UTF-8 I/O) |
| `motion-broll/render.js`, `motion-broll/beats.js` | Motion-blur render (alpha to ProRes 4444), stills contact sheet | Barty-Bart/motion-graphics | MIT | Changed (Playwright resolved from the working folder, `pathToFileURL` for Windows) |
| `motion-broll/inspect_video.py`, `words.py`, `composite.py`, `make_pages.py` | Footage layout inspection, subtitle-file word estimates, composite preview, review pages and TIMING.md | Barty-Bart/motion-graphics | MIT | Changed (UTF-8 I/O for Windows, usage checks, templates path, a dash character; `composite.py` creates its output folder) |
| `motion-broll/viewer.html`, `motion-broll/compare.html` | Clip viewer and before/after compare templates | Barty-Bart/motion-graphics | MIT | Unchanged apart from the notice comment (Google Fonts links kept; stripped by `make_pages.py --offline`) |

The motion B-roll engine needs Playwright with Chromium in the user's project (a one-time network install, free and pinned, run without a question after the free space check and recorded; see `references/broll-and-motion-broll.md` section 6). Nothing in it downloads at run time.

Known limits: `find-cut-candidates.mjs` uses an English stop-word list, so non-English retake scores run a little high; review every candidate. `timeline_view.py` labels use system fonts without Arabic shaping. `render.py --build-subtitles` writes uppercase Helvetica captions; for Arabic or styled captions build the caption layer with the ice-type and ice-arabic skills instead.

## Uses by job

Paths in this table are relative to the ice-edit skill folder.

| Script | Use |
|---|---|
| `scripts/cut-silences.mjs` | Transcript silence trim, EDL, retimed transcript, optional cut (`--apply`) |
| `scripts/find-cut-candidates.mjs` | Stutter, retake and false-start candidates for review |
| `scripts/apply-cuts.mjs` | Apply reviewed cuts and retime |
| `scripts/build-edl-review.mjs` | HTML page to review any EDL |
| `scripts/edl-to-edited-transcript.mjs` | Edited-timeline transcript from a multi-source EDL |
| `scripts/validate-plan.mjs`, `scripts/validate-footage.mjs` | Plan and footage ledger gates |
| `scripts/render.py`, `scripts/grade.py` | EDL render (fades, concat, overlays, subtitles last, HDR, loudnorm), bounded grade |
| `scripts/pack_transcripts.py`, `scripts/timeline_view.py` | Packed phrase transcript, filmstrip plus waveform at decision points |
| `scripts/cutdown.py` | Reframe to 9:16, 1:1 or 4:5 (blur, crop, pad) with segments |
| `scripts/music-grid.mjs`, `scripts/beatgrid.mjs`, `scripts/analyze-reference.mjs` | Beat grid, cut sheet, cut offsets of a render |
| `scripts/motion-broll/` (`build.py`, `render.js`, `beats.js`, `motion.js`, `inspect_video.py`, `words.py`, `composite.py`, `make_pages.py`, two page templates) | One-shape motion B-roll engine: build, stills, motion-blur render, alpha panels, composite preview, viewer and compare pages (setup in `references/broll-and-motion-broll.md` section 6; needs a one-time Playwright install, free and pinned, run without a question and recorded (`references/ingest-and-ledger.md` section 6); fonts: project or user font files first, then the font the direction chose from either an installed system family or Google Fonts (a disclosed build-time network call), with no fixed order between those two; `--offline` or `ICE_OFFLINE=1` allows only project and system fonts) |

## License texts

The full license texts travel next to the scripts, byte-identical to their sources (do not edit them):

| File | Covers | Source file |
|---|---|---|
| `LICENSE-herk-edit-kit.txt` | nateherkai/herk-edit-kit (MIT, Copyright (c) 2026 Nate Herk) | `LICENSE` |
| `LICENSE-herk-edit-kit-use-permission.txt` | nateherkai/herk-edit-kit pipeline resources (Herk Edit Kit Use Permission) | `licenses/PIPELINE-USE-PERMISSION.txt` |
| `LICENSE-video-use.txt` | browser-use/video-use (MIT, Copyright (c) 2026 Browser Use) | `LICENSE` |
| `LICENSE-motion-graphics.txt` | Barty-Bart/motion-graphics (MIT, Copyright (c) 2026 Bart) | `LICENSE` |
| `LICENSE-claude-code-video-toolkit.txt` | digitalsamba/claude-code-video-toolkit (MIT, Copyright (c) 2024 Digital Samba) | `LICENSE` |

No brand assets of the herk-edit-kit are bundled here. The same texts are also kept at the repository root in `LICENSES/`, and `CREDITS.md` lists every source.

Icon paths in `motion-broll/motion.js` are adapted from Lucide (ISC License; some icons derive from Feather, MIT). The full text is `LICENSE-lucide.txt`, copied byte-identical from the Lucide license file bundled in vincentsch/explainroo (`engine/icons/LICENSE-lucide.txt`).
