# Kinetic typography techniques

Merged from Tejashmakwana/motionmaxxing (Apache-2.0: type.md, judgment, slop, ui-demo, brand), heygen-com/hyperframes (Apache-2.0: animation rules waterfall-entry, kinetic-beat-slam, gsap-effects, techniques, blueprints kinetic-type-beats, cut catalog, animate-text adapter names), the launch-motion group (MIT: product-launch-motion, claude-motion-design, motion-skills, claude-remotion-skill), nateherkai/herk-edit-kit (MIT), diffusionstudio/lottie (MIT: motion taste, typography recipe), Barty-Bart and charlie947 motion-graphics (MIT), alchaincyf/huashu-art-motion (MIT), edenfunf/reelmimic (MIT), alexgreensh/anidoodle (MIT), yihui-dev community prompts, plus ideas restated from imMamdouhaboammar/motion-graphics-skills, Vincentwei1021/anything2explainer (card ideas), bangtutorial/bang-motion, Omar-Tnzxo/commercial-motion-design and vibe-motion/skills. Restructured; numbers kept.

Easing families, springs and camera moves belong to the `ice-motion` skill. This file covers how words move.

## Contents
1. Principles
2. Preparing copy
3. Word onset gaps
4. Entry mechanics
5. Exits and swaps
6. Holds after landing
7. Typing (allowed contexts and rules)
8. Beat and music type
9. Named techniques
10. Conflicts and their scope

## 1. Principles

- Kinetic typography is phrase performance, not uniform text entrance. Animate at least one major word or phrase with meaning-driven position, scale, masking, layout change, framing, rhythm or emphasis. A uniform entrance applied to every word is not kinetic type.
- Semantic map (choose motion from the word): fall drops, rise lifts, snap hits sharply, break separates, flow travels, soft eases gently, heavy lands low with weight, loud expands or hits harder, quiet recedes, fast compresses timing, slow holds longer.
- Act out meaning for the one word that carries the film, once per film (illustration only; take the word from this film's script: a bar slices "splitting"; "with leverage" widens its own tracking; "more expensive" tightens; a word too big for the frame makes the camera pan across it).
- Choose the smallest text unit that helps meaning: phrase, line, word, glyph, outline. Per-character is not more advanced. Avoid random per-letter motion unless the prompt asks for it.
- Different entrance per phrase: one reused entrance for every line is the flat-but-competent tell.
- Importance budget per beat: 1 connective (fast, small, a cut or word swap), 2 supporting, 3 the point (slower, larger, held to reading time plus 0.5 to 1 s, its own sound). At most 25% of beats are the point. Animating every line the same is the number one AI tell.
- Typography motion feel: support words settle soft; the active word pops or enters sharp. Mask wipes enter sharp and the revealed content settles soft.
- Type is part of the choreography: text in a morphing container gets its own enter and exit timing (exit short and early) or old and new text overlap; content enters after its container starts morphing and leaves before the next morph.
- If text moves internally, move the glyphs or masked bands, not only decorations around the text.
- Giant single word as a slide (one word over 0.3 of the height on a flat ground, no object) is slop. A giant or cropped word works when the idea wants it huge, it arrives once with a cause (a camera pan across it, a surface), and scale is not spent again.

## 2. Preparing copy

- Segment by breath: English about 3 to 7 words; Chinese about 4 to 12 characters (other scripts: see `ice-arabic` for Arabic).
- Tag scenes Hook, Build, Punch, Resolve; 1 to 2 emphasis words per scene.
- Kinetic type sections work for lists, quotes, numbers and chapter cards. A whole film of type needs evidence pages or a grammar change every 30 to 60 s.
- Read the design file first: the same shot under two different design files should look different.

## 3. Word onset gaps

| Context | Gap between whole words | Frames at 30 fps |
|---|---|---|
| Fast hook | 0.07 to 0.12 s | 2 to 4 |
| Standard headline | 0.12 to 0.20 s | 4 to 6 |
| Voice-led | 0.25 to 0.40 s | 8 to 12 |
| Before a stinger | 1.5 to 2x the base gap | |
| Drum hits | 2 frames | |
| Voice-tied list items | 0.7 to 1.0 s | |
| Kinetic opener stagger | 0.06 to 0.10 s per word | |

Without a voice: add plus or minus 40% jitter in a speech pattern; never a constant interval. Exception: a technical ident may use a constant interval (for example 10 frames), the one place uniform gaps are right. With a voice, anchor word entries to measured word onsets.

## 4. Entry mechanics

Menu (pick per phrase by meaning):

| Mechanic | Use for |
|---|---|
| Rise with smear | 3 to 5 words building sense |
| Pop whole with x-decay | A spoken sentence |
| Start oversized, shrink into place | First word, thesis or payoff, once |
| Blur-resolve in place | Status, CTA, secondary lines |
| Per-glyph variety | One differing word, rare |
| Hard step | Crisp, fintech, technical films |
| Wave typing | A long prompt in a wide box |
| Color sweep | Alive while held (an agent thinking) |

Measured specs:
- Word entry curve: 59% of travel in 5 frames (0.17 s), 80% by 10, 91% by 16, tail 0.4 to 1.2 s (or decay 0.6 to 0.72 per frame); no overshoot and no opacity ramp in restrained systems.
- Waterfall entry: opacity is binary (0 to 1 via a set), never fade an arrival. Overlap, don't queue: the next element starts within plus or minus 1 to 2 frames of the previous one settling; gaps shrink. Anchor words Y 60 to 80 px in 0.16 to 0.20 s; normal 40 to 50 px in 0.13 to 0.16 s; light 30 to 48 px in 0.10 to 0.13 s; `power4.out` (never an in-out ease on an entry); one direction per cascade; split the final word into fragments.
- Decaying slide: the first word carries momentum and tail words decay. Carrier 360 px, then 120, 60, 25, 12 px; carrier `expo.out` 0.33 s, tail `power2.out` 0.20 s. Gentler variant: 80 to 12 px decay per word, like a camera settling.
- Line by line, cued to words: enter 0.30 s, rise 28 px, stale lines dim to 0.30 opacity, shift 10 px; the final line as word-level micro-hits.
- Masked rise: translateY 105% inside an `overflow: hidden` line, word stagger about 55 ms with a small rotation. Give the mask about 0.2 em padding and a matching negative margin so descenders are not cut; inspect a settled frame.
- Blur-in: 16 px to 0 over 0.5 s `expo.out`, once. Optional blur-in text 18 to 26 px to 0, rise 16 to 40 px, 0.7 to 1.0 s; eyebrow, product name and subtitle staggered 0.2 to 0.4 s.
- Tracking-in on one short headline only: from very loose to slightly negative em on one spring with the deblur; the fade shorter than the spring; no overshoot.
- Per-word say and unsay: each word in its own nowrap span, `yPercent 60 to 0`, `scaleY 1.3 to 1`, stagger 0.07 to 0.12 with a vertical blur; a keyword highlighter scales in from the left after the words finish. Never make a breakable phrase one span (it overflows in 9:16).
- Word reveal per 3 frames with a snappy spring, translateY 30 to 0, pixel gaps.
- Soft blur-in per character: blur about one sixth of the font size, position finishes in the first third while blur continues, stagger under 0.1 s (lowest energy).
- Character rise: position and fade on separate curves, fade longer than travel, travel about 44% of the font size, no blur, no scale.
- Lead word zoom: the first word (4 characters or fewer) at about 2.3x center, then shrinks and slides into its line on one curve.
- Words grey or blurred to dark and sharp in about 0.12 to 0.2 s per word (no-VO app films).
- Emphasis word carries the accent; a highlight starts only when its line is readable and animates on (bar width 0% to 100% in about 0.4 s, circles draw on in about 0.4 s).

## 5. Exits and swaps

- Exits are faster than entries and overlap the next entries by about 2 frames: exit one word per frame, each 3 to 4 frames (up 0.07 of the height, fade toward light grey), entries 2 to 3 frames apart settling over about 15 frames.
- Text swap is sequential, not overlapped (for example outgoing 0.16 s, incoming right after); or a hard swap in one frame; or a backspace metaphor without re-centering survivors. Pair a fade with outward motion or a replacing icon.
- Waterfall cut: per word exit x 0 to -230 px in 0.34 s `power4.in`, fade 0.18 s, stagger about 0.022 s; entry x +230 to 0 from opacity 0.35 in 0.3 s `power4.out` with shrinking gaps (start 0.05 s, times 0.84 per word); whole-line fade about 0.3 s ending about 0.02 s before the cut.
- Name morph: flip per glyph left to right at 2 to 2.4 frames at 60 fps from a fixed left anchor; two independent soft masks, never a crossfade.
- Content swaps inside a container with a short blur.
- Kinetic beat blueprint: nothing from the prior beat lingers; the final beat resolves and holds.
- Title demote: the title stands at least 18 frames, then in one 20-frame move scales to 0.4 and docks top-left as a label while content grows underneath without a gap.
- Text that must stay sharp during a handoff: never scale a blurry copy; crossfade only the fill.

## 6. Holds after landing (scoped)

| Rule | Scope |
|---|---|
| Words never move after landing; motion comes from beat micro-punches, page changes, entering evidence or a slight camera drift | Kinetic type essays, explainer type pages |
| A held line drifts (for example -88 px, about 6.9% of the width, over 1.1 s); shrink 5 to 10% per second by default; accelerate 2 to 5x in the last frames before a cut | Product launch, app ad, hype promo |
| True static hold only right after a payoff lands | All restrained films |
| Every beat has a readable landing then an accelerating exit; no motionless stretch over about 0.6 s | Launch films (camera policy per type in the `ice-motion` skill) |

## 7. Typing (allowed contexts and rules)

Headline typing is banned: letter-by-letter typing with a caret is for the product's own input field, terminals, code, an investigative typewriter caption look, or a typing joke. There is no narrative exception in product launch, app ad or brand film headlines.

| Rule | Value |
|---|---|
| Rates by task | Recognize a command about 82 to 85 characters per second; read content 14 to 30 (21 to 24 bursty); long prompt or result 70 to 85 in bursts of 3 to 6 characters per frame; human authoring about 30 to 45; field fill about 70; wave typing about 45 |
| Characters per second by tone | Dramatic 3 to 5; narration 8 to 12; tech or code 15 to 20; fill 30 and up |
| Terminal sequences | 48 to 96 px font; keystrokes 0.06 to 0.20 s apart, pauses 0.3 to 0.6 s; smooth typing chars x 0.06 to 0.12 s; finish at least about 1 s before the scene ends |
| Typed lines | 4 to 8 s per typed line with color segments (3 to 4 colors max) |
| Authored rhythm | Bursts of 1-frame letters, a 6 to 10 frame pause after a space, skipped intermediate states, a slower last word. A metronomic character per frame is the clearest slop tell |
| Caret | Show it about 1 frame (0.04 s) before the first character; solid while typing, never blinking during typing; blink only in idle waits on its own clock (period 0.6 to 1.2 s, whole blink cycles per scene, `steps(1)` for the blink); omit it if the field is a result; width 8 to 24 px or about 0.3 x font size; one cursor visible at a time; no gap between text and cursor; never go from hidden to solid |
| Prompt end | No final period; hold about 0.5 to 0.6 s with a blinking caret before the cursor moves |
| Placeholder | Placeholder grey, cleared in one frame; never type placeholder text |
| Error retype joke | Type, pause with a blinking cursor, delete faster, retype; the three speeds are the joke; remove the cursor when done |
| Layout | Monospace plus `white-space: pre`; `min-width` on the text wrapper; center on the full string's width, not the partial string, or the text slides during the reveal; the cursor follows the end of the measured string |

## 8. Beat and music type

- Kinetic beat slam: beat spacing 1.2 to 1.8 s (under 0.8 s reads frantic, over 2.5 s loses the pulse); entrances 0.35 to 0.6 s, exits 0.25 s or less; exactly one accent hue; display 150 px and up in a heavy face; one beat array, not scattered offsets.
- Kinetic triplet: three words or phrases, two beats each (three for a handwritten word so it can be read), each with its own treatment and background, swapped hard on the beat; each enters with a fast blur or slide and lands with a slight overshoot.
- Brand slam: heavy grotesk all caps revealed by masks on consecutive 1/16 notes, a mono kicker above, an italic serif line below; weight can morph thin to black; the full stop detaches and grows.
- Big changes on beats, typography on 1/8 or 1/16 notes; overshoot slightly for impacts then settle (beat grid owned by the `ice-audio` skill).
- Benefits staccato: 8 to 12 short value phrases at about 0.4 s per beat; statement relay: 2 to 4 statements held about 1.5 s or more; verb barrage at about 0.2 s cadence with hard cuts; a relay-to-URL end card holds about 40 to 75% of the runtime in that blueprint.
- Kinetic shot (launch): 3.5 to 5 s, 3 to 5 lines, one emphasis verb each, stale lines at 0.30 opacity, rise 28 px in 0.3 s on the measured verb, the last line three micro-hits, final 4 px settle with about 8% ground brighten; camera locked; fails on even rhythm. Held thesis 1.8 to 2.5 s, deliberately the shortest frame.
- Durations: short title 60 to 120 frames, quote 90 to 180 frames at 30 fps; a motion graphic with no narration is usually under 10 s (up to about 30 s); first and last frames of an overlay clear cleanly.

## 9. Named techniques

Vocabulary of effects (names for the storyboard; specs for the numeric ones are in `type-effects-specs.md`):

- Per character: soft blur-in, per-character rise, bottom-up letters, top-down letters, stagger from center, stagger from edges, hacker flip.
- Per word: crossfade, spring scale-in, shared-axis Y, blur-out up, kinetic center build, short slide right or down, depth-parallax words, decaying slide, waterfall.
- Per line: mask reveal up, line-by-line slide.
- Whole block: micro scale-fade, shimmer sweep, fade-through, shared-axis Z or X, scale-down fade, focus-blur resolve, statement mask, gradient text sweep.
- Structural cards: word slot cycle (sentence stem fixed, the end capsule flips phrases about every 0.7 s, the final phrase gets the only overshoot, hold 1.5 s or more), slab punch title (block expands from center first, then text hard-cuts in; slant is a fixed shape), font contrast emphasis (key word swapped to an accent face at 1.5 to 2x on a shared baseline, never with bounce), quote card (an opaque plate, up to 5 lines line by line, quiet exit), quote marks that clamp in from opposite corners on the same frame, count badge title (number scales in place, recolors only on landing, then pushes the measure word out), keyword tunnel (dark grounds only, foreground still, integer loop count), 3D pan along a sentence wider than the frame (1, at most 2, segments per film; about 2.9 s `power1.inOut`, rotateY 10 to -10 degrees, words dim to about 20% until passed), spotlight reveal (a swinging lamp beam reveals the label; scale the lamp from its tip).
- Write-on and drawn: written on, never faded; one line at a time (never more than one full line on screen; old words leave at twice the pace they came; each new line's first word on a beat); signature written on, readable at 100% and vanishing into the art at thumbnail size, 75 frames to read after the last stroke.

## 10. Conflicts and their scope

| Rule A | Rule B | Scope |
|---|---|---|
| Typing banned on headlines | Typewriter captions, terminal sequences, investigative directions | Typing only where a real input, console or typewriter world exists; never for product launch, app ad or brand film headlines |
| No overshoot, no opacity ramp on entries | Overshoot and bounce entries (playful, social, kinetic triplet landings) | Restrained systems (product launch, app ad, UI walkthrough, brand film) vs playful and hype films |
| Uniform gaps are slop | Constant intervals for a technical ident | Ident only |
| Exit about 2 frames, one word per frame | Exit = entry reversed at 60 to 75% (captions) | Display type vs caption groups |
