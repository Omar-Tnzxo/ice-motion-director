# Notices for the scripts in this folder

Every script here except `craft_gate.py` was copied from an open-source project, read in full before copying, and changed only as its first-line notice says; `craft_gate.py` was written for this repository (0.2.5) and falls under the repository's own license. None of them downloads anything or installs anything. Requirements (minimum Node, Python and FFmpeg versions: `runtimes` in the ice-engines `versions.json`): ffmpeg and ffprobe on PATH for all video scripts; Python; `numpy` for the video checks of `motion_check.py` (`--pacing-only` needs only the standard library); `numpy` and `opencv-python-headless` for `film_gate.py` and for `craft_gate.py measure` and `build` (`craft_gate.py plan` needs only the standard library) at the exact versions in `scripts/requirements.txt` (pinned in ice-engines `versions.json`) (ask the user before installing them); Node and a local Chrome or Edge (or `CHROME_PATH`) for `lint.mjs` and `seam-gate.mjs`; Node for the other `.mjs` files.

| File | Source | License | Status |
|---|---|---|---|
| `look.py` | Tejashmakwana/motionmaxxing, `scripts/look.py` | Apache-2.0 | adapted |
| `lint.mjs` | Tejashmakwana/motionmaxxing, `scripts/lint.mjs` | Apache-2.0 | adapted |
| `_cdp.mjs` | Tejashmakwana/motionmaxxing, `scripts/_cdp.mjs` | Apache-2.0 | adapted |
| `seam-gate.mjs` | heygen-com/hyperframes, `.claude/skills/motion-doctrine/scripts/seam-gate.mjs` | Apache-2.0 | adapted |
| `film_gate.py` | alchaincyf/huashu-art-motion, `scripts/film_gate.py` | MIT | adapted (translated) |
| `storyboard_lint.py` | alchaincyf/huashu-art-motion, `scripts/storyboard_lint.py` | MIT | adapted (ported to English tables) |
| `motion_check.py` | edenfunf/reelmimic, `.claude/skills/video-clone/scripts/motion_check.py` | MIT | adapted |
| `validate-beat-sync.mjs` | nateherkai/herk-edit-kit, `scripts/validate-beat-sync.mjs` | MIT | adapted |
| `quick-checks.mjs` | echris6/motion-video-kit, `business-motion-film/scripts/frozen-time.sh`, `loudness.sh` and `contact-sheet.sh`; iart-ai/motion-skills, `tools/verify/probe-mp4.sh` | MIT (both) | ported to Node, merged into one file with the subcommands `frozen`, `loudness` and `sheet` (0.2.5) and `probe` (from the former `probe-mp4.mjs`, 0.2.6) |

The prompts in `../references/critic-prompts.md` come from echris6/motion-video-kit (MIT) and Vincentwei1021/mg-styles-15 (MIT) under the same terms.

## License texts

The full license and notice texts travel next to the scripts, byte-identical to their sources (do not edit them). Changed files carry a notice saying so.

| File | Covers | Source file |
|---|---|---|
| `LICENSE-hyperframes.txt` | Apache License 2.0, as shipped by heygen-com/hyperframes (Copyright 2026 HeyGen, Inc.); the same license covers Tejashmakwana/motionmaxxing | heygen-com/hyperframes `LICENSE` |
| `NOTICE-motionmaxxing.txt` | The NOTICE file of Tejashmakwana/motionmaxxing (Apache-2.0 section 4(d) requires it to travel with `look.py`, `lint.mjs` and `_cdp.mjs`) | `NOTICE` |
| `LICENSE-huashu-art-motion.txt` | alchaincyf/huashu-art-motion (MIT) | `LICENSE` |
| `LICENSE-reelmimic.txt` | edenfunf/reelmimic (MIT, Copyright (c) 2026 ReelMimic contributors) | `LICENSE` |
| `LICENSE-herk-edit-kit.txt` | nateherkai/herk-edit-kit (MIT, Copyright (c) 2026 Nate Herk) | `LICENSE` |
| `LICENSE-herk-edit-kit-use-permission.txt` | nateherkai/herk-edit-kit pipeline resources (Herk Edit Kit Use Permission) | `licenses/PIPELINE-USE-PERMISSION.txt` |
| `LICENSE-motion-video-kit.txt` | echris6/motion-video-kit (MIT, Copyright (c) 2026 echris6) | `LICENSE` |
| `LICENSE-iart-motion-skills.txt` | iart-ai/motion-skills (MIT, Copyright (c) 2026 iart.ai) | `LICENSE` |
| `LICENSE-mg-styles-15.txt` | Vincentwei1021/mg-styles-15 (MIT, Copyright (c) 2026 Vincentwei1021) | `LICENSE` |

The same texts are also kept at the repository root in `LICENSES/`, and `CREDITS.md` lists every source.
