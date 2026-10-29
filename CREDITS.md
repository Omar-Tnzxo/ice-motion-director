# Credits

Ice Motion Director is built by Omar-Tnzxo on top of the work of many open-source authors. This file credits every source whose material or ideas are in this repository, says what was used and where it lives, and links each license.

How to read it:

- **License text**: the original license of each source, byte-identical, is in [`LICENSES/`](LICENSES/) as `<owner>__<repo>.txt`. Apache-2.0 sources that ship a NOTICE file also have `<owner>__<repo>.NOTICE.txt` there (see [`NOTICE`](NOTICE)).
- **Changes**: every copied or adapted file starts with a notice line naming its source and what was changed.
- **Ideas only**: sources without an open license were never copied. Their ideas were rewritten in this repository's own words and structure, and they are credited here as inspiration with a link only.

## 1. Verbatim sources (MIT, Apache-2.0, CC0)

Files from these sources were copied (some adapted, as their notice lines say), and their rules were merged into the skills.

| Source | Author | License | What we used | Where it lives |
|---|---|---|---|---|
| [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | HeyGen, Inc. and contributors | Apache-2.0 | Composition contract, motion doctrine, seam gate script, pitch round, captions, docs and registry rules; also the upstream of the founder's local `product-launch-video` skill | `skills/ice-qa/scripts/seam-gate.mjs`, `skills/ice-direction/references/pitch-round.md`; rules across ice-engines, ice-motion, ice-type, ice-edit, ice-audio, ice-film |
| [heygen-com/hyperframes-community-skills](https://github.com/heygen-com/hyperframes-community-skills) | HyperFrames community contributors | Apache-2.0 | Vox-style explainer doctrine (vector law, overlap law, seam and dead-time gates), 3D-camera captions, session films | Rules in ice-motion, ice-qa, ice-type, ice-engines, ice-film, ice-ideas, ice-audio, ice-assets |
| [edenfunf/reelmimic](https://github.com/edenfunf/reelmimic) | ReelMimic contributors | MIT | Reference analysis, shot mapping, climax duel, crew and motion check scripts | `skills/ice-remake/scripts/` (`analyze.py`, `clip_strip.py`, `compare.py`), `skills/ice-qa/scripts/motion_check.py`, `skills/ice-assets/scripts/detect_crop.py`; rules in ice-remake and others |
| [nateherkai/herk-edit-kit](https://github.com/nateherkai/herk-edit-kit) | Nate Herk and the kit contributors | MIT, plus the Herk Edit Kit Use Permission for pipeline resources | Silence and retake cutters, EDL review, plan and footage validators, beat grid, reference analyzer, beat-sync validator, editing playbook | `skills/ice-edit/scripts/`, `skills/ice-qa/scripts/validate-beat-sync.mjs`; rules in ice-edit, ice-type, ice-audio |
| [digitalsamba/claude-code-video-toolkit](https://github.com/digitalsamba/claude-code-video-toolkit) | Digital Samba | MIT | Pacing and loudness QC, vertical cutdown, script-to-ASR caption alignment | `skills/ice-audio/scripts/pacing.py`, `qc.py`, `skills/ice-edit/scripts/cutdown.py`, `skills/ice-type/scripts/align_script_to_asr.py` |
| [alexgreensh/anidoodle](https://github.com/alexgreensh/anidoodle) | Alex Greenshpun | Apache-2.0 (NOTICE kept) | Facts check tool and workflow, 32 hand-drawn styles, music and style adaptation rules | `skills/ice-assets/scripts/facts.mjs`, `skills/ice-assets/references/truth-sheet.md`; rules in ice-styles, ice-audio, ice-motion |
| [lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) | LemoLab | MIT (code and docs) | 51-style library, treatment and benchmark method | Rules in ice-styles, ice-direction and others |
| [alchaincyf/huashu-art-motion](https://github.com/alchaincyf/huashu-art-motion) | alchaincyf (花叔 · 花生) | MIT | Film gate and storyboard lint scripts, 36 styles and 9 grammars, breakdown numbers | `skills/ice-qa/scripts/film_gate.py`, `storyboard_lint.py`; rules in ice-styles, ice-remake and others |
| [Vincentwei1021/mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15) | Vincentwei1021 | MIT | `mgaudio` music-by-code library, render harness, rubric, 15 motion graphics styles | `skills/ice-audio/scripts/mgaudio/`, `skills/ice-engines/scripts/render-html.mjs`, `skills/ice-qa/references/critic-prompts.md`; rules in ice-styles |
| [echris6/motion-video-kit](https://github.com/echris6/motion-video-kit) | echris6 | MIT | Business motion film critic prompts, frozen-time, loudness and contact sheet scripts, product hero realism | `skills/ice-qa/scripts/` (`quick-checks.mjs`: the frozen-time, loudness and contact sheet scripts, ported to Node), `skills/ice-qa/references/critic-prompts.md` |
| [AbubakrChan/product-launch-motion](https://github.com/AbubakrChan/product-launch-motion) | Abubakr Chan | MIT | Spring and track technique, story and truth rules, creative direction dials | `skills/ice-motion/scripts/springs.mjs`, `skills/ice-assets/references/truth-sheet.md`, `skills/ice-direction/references/pitch-round.md` |
| [howseen-ai/claude-motion-design](https://github.com/howseen-ai/claude-motion-design) | Raphaël Aubry, founder of [Howseen](https://howseen.ai) | MIT | Capture hygiene for frame rendering, remake and product film modes, frame-locked remake method | `skills/ice-engines/scripts/render-html.mjs` (merged); rules in ice-remake, ice-edit, ice-film |
| [haidrrrry/claude-remotion-skill](https://github.com/haidrrrry/claude-remotion-skill) | haidrrrry | MIT | Motion craft rules for code-driven video (entrances, stagger, layer stack, zero-asset audio) | Rules in ice-motion, ice-engines, ice-audio, ice-type, ice-qa, ice-film |
| [iart-ai/motion-skills](https://github.com/iart-ai/motion-skills) | iart.ai | MIT | Deliver-and-verify loop, MP4 probe script | The `probe` subcommand of `skills/ice-qa/scripts/quick-checks.mjs` (ported to Node); rules in ice-engines |
| [Barty-Bart/motion-graphics](https://github.com/Barty-Bart/motion-graphics) | Bart | MIT (icon paths from Lucide, ISC) | Motion B-roll engine, object separation, sound effects licensing workflow; the sound-pass method its author credits to Vox ([@Voxyz_ai](https://x.com/Voxyz_ai)) | `skills/ice-edit/scripts/motion-broll/`; rules in ice-edit, ice-assets, ice-audio |
| [charlie947/motion-graphics-skills](https://github.com/charlie947/motion-graphics-skills) | Charlie Hills ([newsletter](https://charliehills.substack.com), link back requested by the author) | MIT | Brand intake, MOVES and LOOK split, brand outranks reference | Rules in ice-direction, ice-remake, ice-styles, ice-film |
| [bangtutorial/bang-motion](https://github.com/bangtutorial/bang-motion) | [Bang Tutorial](https://youtube.com/bangtutorial) | MIT | Opener and bumper concepts, "rhythm, not skin" reference rule | Rules in ice-film, ice-ideas, ice-remake, ice-styles |
| [nolangz/pixel2motion](https://github.com/nolangz/pixel2motion) | Nolan Lai | MIT | Logo raster to SVG to motion pipeline, logo reveal references, SVG and motion audit scripts | `skills/ice-lottie/references/` (logo pipeline and five references), `skills/ice-lottie/scripts/` (five Python scripts) |
| [Tejashmakwana/motionmaxxing](https://github.com/Tejashmakwana/motionmaxxing) | Tejas Makwana ([FinalMotion](https://finalmotion.video)) | Apache-2.0 (NOTICE kept) | 12 measured eases, look and lint gates, Chrome DevTools helper, treatment rules | `skills/ice-motion/scripts/measured-eases.mjs`, `skills/ice-qa/scripts/` (`look.py`, `lint.mjs`, `_cdp.mjs`) |
| [diffusionstudio/lottie](https://github.com/diffusionstudio/lottie) | Diffusion Studio Inc. | MIT | Lottie player contract, spec map, SVG compatibility, design and motion taste, recipes | `skills/ice-lottie/references/` |
| [vincentsch/explainroo](https://github.com/vincentsch/explainroo) | Vincent Schmalbach | MIT | Whiteboard explainer method; its bundled Lucide license text | Rules in ice-explainer, ice-type; `skills/ice-edit/scripts/LICENSE-lucide.txt` |
| [browser-use/video-use](https://github.com/browser-use/video-use) | Browser Use | MIT | EDL renderer, grade, packed transcripts, timeline view, edit-by-reading principles | `skills/ice-edit/scripts/` (`render.py`, `grade.py`, `pack_transcripts.py`, `timeline_view.py`) |
| [bradautomates/claude-video](https://github.com/bradautomates/claude-video) | Bradley Bonanno | MIT | Frame sampling budget and runtime helpers | `skills/ice-remake/scripts/` (`frames.py`, `runtime.py`) |
| [majedphotos/video-ad-editor](https://github.com/majedphotos/video-ad-editor) | Majed Alzaabi | MIT | Arabic kashida and shaping helpers, font readiness check, talking-head ad editing rules | `skills/ice-arabic/references/kashida.md`, `fonts-and-shaping.md`; rules in ice-edit, ice-type |
| [yihui-dev/awesome-opus5-5-videos](https://github.com/yihui-dev/awesome-opus5-5-videos) | yihui-dev (list); every video and prompt belongs to its creator | MIT (list) | Index of community prompt files | `skills/ice-styles/references/prompt-library-index.md` (index with links, not a copy) |
| [zhuyansen/awesome-claude-video-skills](https://github.com/zhuyansen/awesome-claude-video-skills) | zhuyansen (list); listed names and descriptions belong to their authors | CC0 1.0 (list) | Map of video skill repos used to find sources | Rules in ice-assets |

## 2. Sources whose ideas were rewritten (inspiration only)

These sources have no open license or a proprietary one. Nothing was copied from them; ideas were restated in this repository's own words and merged with other rules. Their license files are not in `LICENSES/` because none of their material is here.

| Source | Author | License | Credited for |
|---|---|---|---|
| [remotion-dev/skills](https://github.com/remotion-dev/skills) | Remotion | No license file (Remotion License applies upstream) | Ideas on clip and caption grouping, adaptive silence thresholds, voiceover-sized compositions |
| [remotion-dev/remotion](https://github.com/remotion-dev/remotion) | Remotion | Remotion License (source available) | Engine notes, including the Company License warning for teams of 4 or more |
| [vibe-motion/skills](https://github.com/vibe-motion/skills) | vibe-motion | No license file | Ideas on motion craft, Lottie and UI motion |
| [imMamdouhaboammar/motion-graphics-skills](https://github.com/imMamdouhaboammar/motion-graphics-skills) | Mamdouh Aboammar | Proprietary, all rights reserved | Ideas on reference fidelity, layer stacks, mixing references and editing, all rewritten |
| YouTube tutorials [du47cp9LccY](https://www.youtube.com/watch?v=du47cp9LccY), [vyX-4ACMmp0](https://www.youtube.com/watch?v=vyX-4ACMmp0), [q4okDye8Xw4](https://www.youtube.com/watch?v=q4okDye8Xw4), [ItJb2PFd-ME](https://www.youtube.com/watch?v=ItJb2PFd-ME), [Xwmf57_bS68](https://www.youtube.com/watch?v=Xwmf57_bS68), [7LjFsMQAdhk](https://www.youtube.com/watch?v=7LjFsMQAdhk), [tpXmHvmZo4Q](https://www.youtube.com/watch?v=tpXmHvmZo4Q), [xXYS7ypXUlI](https://www.youtube.com/watch?v=xXYS7ypXUlI) | Muhamd Helal | Standard YouTube licence | Ideas only: Arabic news explainer reels (depth sandwich, glow disc, kashida keywords, glass shapes), scene composition, compositing with a 3D set, motion curves |
| YouTube tutorial [sv4v8OnjkUg](https://www.youtube.com/watch?v=sv4v8OnjkUg) and the author's public asset folder | Ahmed Maher | Standard YouTube licence; the asset folder carries no licence | Ideas only: the scanline title texture, glow stacking, camera nulls, sound design and the voice chain (values restated as measurements; no preset or project file copied) |
| YouTube tutorials [qDkAbFRDO_M](https://www.youtube.com/watch?v=qDkAbFRDO_M), [TXE746k1rbs](https://www.youtube.com/watch?v=TXE746k1rbs) | Ismail Ait toulba | Standard YouTube licence | Ideas only: topic wheels and typed question cards |
| YouTube tutorial [Vxccy35yxYw](https://www.youtube.com/watch?v=Vxccy35yxYw) | Ahmed Eltanany | Standard YouTube licence | Ideas only: the two-layer typing head |
| YouTube tutorial [5Npr0d75050](https://www.youtube.com/watch?v=5Npr0d75050) | Soni Designer (Hossam Abdelrahman) | Standard YouTube licence | Ideas only: typed title frames and drop exits |
| YouTube tutorial [XjREwYRUEGg](https://www.youtube.com/watch?v=XjREwYRUEGg) | Channel name not recorded | Standard YouTube licence | Ideas only: one-word reels and a broadcast voice EQ |
| YouTube tutorial [2ePEfR_FBb8](https://www.youtube.com/watch?v=2ePEfR_FBb8) | Victor Grubbe | Standard YouTube licence | Ideas only: clean talking-head reel pacing |
| Six public Al Jazeera reels (Al Jazeera Arabic, Al Jazeera 360, Al Jazeera English) | Al Jazeera Media Network | Standard YouTube licence | Measurements only (colours, type, timings, camera, depth, finishing, sound levels) behind the broadcast news style; no footage, logo, programme mark, text or sound was copied into this repository |

## 3. Noncommercial folders (PolyForm Noncommercial 1.0.0)

These folders are copied as published, keep their own license and Required Notice, and are excluded from this repository's Apache-2.0 grant. The router uses them only after the user confirms the work is noncommercial.

| Source | Author | Required Notice | Where it lives |
|---|---|---|---|
| [feitangyuan/onetake](https://github.com/feitangyuan/onetake) | Patrick | `Required Notice: Copyright (c) 2026 Patrick. onetake is free for noncommercial use only.` | `skills/ice-film/noncommercial/onetake/` |
| [Vincentwei1021/video-talkcraft](https://github.com/Vincentwei1021/video-talkcraft) | Vincent Wei | `Required Notice: Copyright (c) 2026 Vincent Wei (https://github.com/Vincentwei1021/video-talkcraft)` | `skills/ice-explainer/noncommercial/video-talkcraft/` |
| [Vincentwei1021/anything2explainer](https://github.com/Vincentwei1021/anything2explainer) | Vincent Wei | `Required Notice: Copyright (c) 2026 Vincent Wei (https://github.com/Vincentwei1021/anything2explainer)` | `skills/ice-explainer/noncommercial/anything2explainer/` |

## 4. vendor/hypit (modified Apache-2.0)

| Source | Author | License | What we used | Where it lives |
|---|---|---|---|---|
| [hypit-ai/hypit](https://github.com/hypit-ai/hypit) | Hypit.AI | Hypit Open Source License (Apache-2.0 with added conditions; no commercial redistribution, keep the Hypit name, logo and copyright information) | Reference video, brief, project files, script and time, review and craft notes. Face swap, host swap and voice cloning parts were left out | `skills/ice-remake/vendor/hypit/` (its own `LICENSE` and `README.md`) |

This folder is excluded from the Apache-2.0 grant of this repository and is never sold.

## 5. The founder's own skills

Written by Omar-Tnzxo and merged here under this repository's Apache-2.0 license.

| Skill | What it gave | Where it lives |
|---|---|---|
| video-production-studio | Production pipeline, truth sheet, real capture, AI media policy, audio mastering script, talking-head editing | `skills/ice-audio/scripts/master_audio.py`, `skills/ice-assets/`; rules in most skills |
| motion-interaction-studio | Motion tokens per brand and industry, morph patterns | `skills/ice-lottie/scripts/motion-tokens.mjs`; rules in ice-motion, ice-arabic |
| brand-identity-studio | Brand system intake, color and type science | Rules in ice-direction, ice-type, ice-assets, ice-arabic, ice-audio |
| commercial-motion-design | Commercial ad direction, camera inference, reference rubric | Rules in ice-direction, ice-film, ice-motion, ice-remake and others |

## 6. Release asset packs (not in this repository)

**Sound effects, published:** [`assets-sfx-v1`](https://github.com/Omar-Tnzxo/ice-motion-director/releases/tag/assets-sfx-v1), 128 recorded effects in 24 types, fetched on demand by `skills/ice-audio/scripts/match_music.py pack fetch` and checked by SHA-256, never inside the plugin. Every file is CC0 1.0 or public domain, from [Kenney](https://kenney.nl/assets), [OpenGameArt](https://opengameart.org) (items listed as CC0), [Freesound](https://freesound.org) (sounds whose own page shows CC0 1.0) and [Wikimedia Commons](https://commons.wikimedia.org) (CC0 or public-domain templates). The author, title, page and check date of each file are in the pack's `LICENSES.md` and `manifest.json`; a film that uses a file credits it in its own `ice/assets/CREDITS.md`.

**Still planned** (instrument samples for opt-in music by code, and textures), CC0 items with recorded provenance only:

| Source | License | Planned use | Credit |
|---|---|---|---|
| [Versilian Community Sample Library (VCSL)](https://github.com/sgossner/VCSL), as packaged in Vincentwei1021/mg-styles-15 `lib/audio/samples/` | CC0 1.0 | Sampled instruments for `mgaudio` | Versilian Studios and VCSL contributors (optional under CC0, given here) |
| Barty-Bart/motion-graphics `skills/sound-effects/sfx/` | CC0 1.0 per file (Freesound and Kenney; per-file authors in its `LICENSES.md` and `manifest.json`) | Recorded SFX kit | Freesound uploaders as listed in the source manifest; the one Mixkit item there is not CC0 and is excluded |
| [Kenney](https://kenney.nl/assets) audio packs | CC0 1.0 | Extra UI and impact sounds | Kenney (optional under CC0, given here) |
| [Poly Haven](https://polyhaven.com) HDRIs, textures and models, as packaged in lemomo-ai/lemo-opuscar and Vincentwei1021/mg-styles-15 | CC0 1.0 | 3D, glass, paint and print looks | Poly Haven (optional under CC0, given here) |
| Vincentwei1021/mg-styles-15 `assets/textures/` (paper, grain, dust, washi) | CC0 (per its README) | Grain and paper textures | Vincentwei1021 |

If LemoLab style cards (CC BY 4.0) are ever added to a gallery, they must credit **LemoLab** with a link to [lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) and state the changes, as its author asks.

## Excluded sources

Reviewed and not used: calesthio/OpenMontage (AGPL-3.0 editing program), video-shotcraft, MoneyPrinterTurbo, Drift and Deep-Live-Cam.

## Corrections

If you are an author listed here and want a credit changed, open an issue.
