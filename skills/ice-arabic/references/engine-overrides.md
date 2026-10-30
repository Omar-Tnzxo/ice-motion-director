> Sources: heygen-com/hyperframes skills (Apache-2.0) caption and media internals, read for RTL impact; majedphotos/video-ad-editor (MIT); Omar-Tnzxo motion-interaction-studio (founder's own); digitalsamba/claude-code-video-toolkit (MIT) problem notes; group-c Lottie notes; remotion transcription note. Ideas from imMamdouhaboammar/motion-graphics-skills and commercial-motion-design rewritten. Changes: restated as RTL overrides, dash characters removed.

# RTL overrides per engine

Engine choice belongs to `ice-engines`. This file lists what each engine needs so Arabic shapes and orders correctly.

## 1. Shaping support

| Path | Arabic shaping | Do |
|---|---|---|
| Browser DOM (HyperFrames, Remotion, Playwright pages) | Reliable | Default for Arabic. Root `<html dir="rtl" lang="ar">` (or the right `lang` per language); `dir="ltr"` on Latin-only elements |
| SVG `<text>` in Chromium | Reliable | Good for paths and masks |
| Canvas 2D in Chromium | Works with care | `ctx.direction = 'rtl'`, Arabic font loaded first, `textAlign` set explicitly; verify a proof frame. Prefer DOM or SVG when shaping is uncertain |
| Shaped outlines (HarfBuzz to SVG paths) | Exact | Use when browser shaping is inconsistent, for letter effects, and for engines that cannot shape |
| Pillow (Python) | Broken by default | Needs the RAQM layout engine, or `arabic_reshaper` plus `python-bidi`; otherwise letters render disconnected and reversed |
| FFmpeg `drawtext` | Depends on the build | Needs a build with fribidi and harfbuzz and text shaping on; safer to render text in a browser layer |
| Lottie and Skottie | Untested for Arabic | Convert Arabic text to shape layers from a shaped source |
| Three.js `TextGeometry` | No shaping | Use shaped SVG outlines extruded, or a DOM or canvas texture |
| Image and video generators | Garbled letters | Never ask them for Arabic text; composite live text |

## 2. HyperFrames caption and media defaults to override

| HyperFrames default | Why it breaks Arabic | Override |
|---|---|---|
| Caption blocks that create one span per character (`...-ch-...` ids) | Each letter falls to its isolated form | One span per word |
| Fit text after `toUpperCase()` | No-op for Arabic; measures with the wrong expectations | Fit the Arabic string as is, after the Arabic font has loaded |
| Uppercase climax styles and negative display tracking (for example -0.03em) | No capitals; tracking breaks joining | Emphasis by size, weight or color; letter-spacing 0 |
| Italic presets (intro, dream styles) | No true Arabic italic; faux oblique distorts | Upright weights only |
| Entrances with negative `xPercent` (whip from the left) and side-specific exits | Direction is Latin | Multiply by the direction sign; enter from the inline start |
| Font rule suggesting romanization for non-Latin text | Erases the language | Ship a font that covers Arabic |
| Kokoro TTS voices | No Arabic voice | Use an engine with Arabic voices (`references/asr-timing.md` (section "Arabic voiceover and TTS")) |
| Default transcription model (Parakeet, European languages) | No Arabic | Use the Whisper path with `--language ar` and an explicit multilingual model; `.en` models translate to English |
| Registry search | Catalog metadata is English | Search in English for the move; write on-screen copy in Arabic |
| Caption grouping by spaces | Works for Arabic words; ASR may split or merge clitics | Group on corrected words aligned to the script (`references/asr-timing.md`) |
| Karaoke scale and color per word | Fine on whole words | Keep, whole words only |
| `-webkit-text-stroke` outlines | Some Arabic fonts show overlapping contours at joins | Check joins on a proof frame; prefer `paint-order: stroke fill` or a shadow stack |

Keep the HyperFrames caption hygiene that already suits Arabic: one caption group visible at a time, a hard hide at each group end, never cover the face, `overflow: visible`, no `left: 50%` plus translate centering.

## 3. GSAP

- SplitText: `type: 'lines'` (or words) for joining scripts, never `'chars'`; `mask: 'lines'`; split after fonts load.
- Horizontal moves times the direction sign; `transformOrigin` from the inline start.
- In seek-driven renders, build timelines after the Arabic fonts are ready and before the first seek; state changes by `set`, not callbacks.

## 4. Canvas compose pages (talking-head engines)

- Page `dir="rtl" lang="ar"`; canvas `direction = 'rtl'`; caption lines `textAlign = 'right'` or centered; interface handles drawn with `direction = 'ltr'`.
- All Arabic fonts and weights loaded before the first frame, including collage and layered-text faces.
