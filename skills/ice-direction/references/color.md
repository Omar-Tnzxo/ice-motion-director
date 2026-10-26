# Color decisions

How a palette is chosen: psychology for this audience, current conventions for this film type, contrast, and construction. Color grading of footage is not here (`ice-edit`, `ice-engines`); caption color rendering is in `ice-type`; the render-time default-look scan is in `ice-qa`.

## Contents

1. Inputs and precedence
2. Psychology for the audience
3. Conventions for the film type
4. Polarity and ground
5. Palette construction
6. Accent discipline and color states
7. Gradients, glow, glass and texture (scoped)
8. Contrast and color vision
9. Presenting options
10. Gate checks at decision time
11. Conflicts scoped

## 1. Inputs and precedence

1. Owner rules and the brand system: exact values, quoted. The brand color is sacred; how it is applied is the film's decision. Brand bans hold in every medium. For a real brand (`real_brand` slot), the brand system is what the ice-assets skill read from the brand's own guidelines and site into the brand sheet `ice/assets/brand-sheet.json` (`brand-authenticity.md` section 10 step 4: guidelines, then site color tokens, then the button accent and the heading ink, then painted-area shares); those values are locked inputs, and the palette decision only assigns roles and proportions. No brand sheet yet: the palette decision waits for it.
2. The user's answers.
3. A LOOK reference the user owns or names as their look (`reference-fidelity.md`).
4. The subject's own real colors (the product, its material, its place).
5. Research and construction (sections 2 to 5).

Never guess a brand hex (see `intake-and-brief.md`). Official partner and third-party logos keep their own colors on neutral clear space; never recolor a mark to match the palette. There is no default palette in this plugin: palette libraries and example palettes in any skill are references, never defaults.

## 2. Psychology for the audience

Color meaning is cultural, categorical and contextual. There is no universal table ("blue means trust") that holds for every audience.

1. Name the target emotion from the brief (`pitch-round.md` B.3: the claim's emotional shape) and the audience's state.
2. Run research RQ-color (`research.md`) for this `market`, `audience` and `topic`: associations, taboos, religious or national meanings, seasonal colors, and semantic conventions. Illustration only: the colors for "up" and "down" in financial data are reversed between some markets; mourning and celebration colors differ by region; a sports or political color can claim a hue in one country. Verify each such claim for the actual market; never apply it from memory.
3. Ask the consultant one specific question when the market's meaning is uncertain or sensitive.
4. Translate emotion into color behavior, not only hue: saturation level, value contrast, temperature, number of active colors, and where the accent appears. Illustration only: relief reads through falling density and lighter grounds; precision through restraint and one signal; play through more hues with meanings and faster color events.
5. Record in the D-entry which association each palette role carries for this audience and which source says so.

## 3. Conventions for the film type

1. From research RQ-category, write the category's color convention in one sentence (what the films of this type and topic currently use).
2. Decide deliberately: **meet** it (recognition, trust, an unfamiliar product in a trusted category) or **break** it (differentiation in a tired category). Log the decision and the reason.
3. Breaking the convention the same way in every film is itself a house style; check the fingerprints (`anti-sameness.md`).
4. Category-to-polarity mappings found in other sources (for example "tech and finance dark, food and kids light") are conventions to verify by research, not defaults.

## 4. Polarity and ground

- Decide light vs dark (or color field, or photographic ground) first, with a written reason from the brief or research. "Tech topic" alone is not a reason for dark; light is as premium as dark.
- A flat single-color ground for every scene is a slop pattern. Build the ground as a surface: material, paper, a lit gradient that behaves like one real light, the subject's own imagery, or two flat value layers.
- Between acts the ground may change polarity as a chapter device (light to dark to light, dark bookends around a light middle). It changes only at a hard cut or through a growing or carried object; never by a flash or a crossfade between two saturated fields (the midpoint makes an off-palette third color). Transition mechanics are in `ice-motion`.
- Otherwise keep one ground logic for the whole film and never jump between light and dark without a story reason.
- No pure `#000000` or `#FFFFFF` grounds by default: tint neutrals toward the accent hue or the subject's warmth. Pure black and white are allowed as a deliberate monochrome direction (logo sting, kinetic type, Lottie for UI, a print-like flat brand) when the D-entry says so.

## 5. Palette construction

**Roles first, values second.** Name roles before choosing values:

| Role | Job |
|---|---|
| ground | the dominant surface |
| surface | cards, panels, secondary planes (often a tonal step of ground) |
| ink | main text and key lines |
| ink_muted | secondary text, inactive elements |
| accent (signal) | the one thing that matters most in a frame |
| accent_small_text | deeper variant of the accent hue for small text that must pass contrast |
| accent_2 (optional) | a second signal with its own named meaning |
| states (optional) | named semantic colors (done, error, gain, the AI is acting), each with one meaning |
| image color | the colors real photos or footage bring |

**Size**: 3 to 6 colors plus tonal steps. Within a film add only lighter, darker and transparent variants; never introduce a new hue mid-film without a D-entry.

**Starting proportions** (adjust with reason): about 65 to 85% ground and neutrals, 10 to 25% ink and imagery, 5 to 15% accent; the 60/30/10 split is the same idea for color-field films.

**Building scales in OKLCH** (perceptually even):
1. Fix the hue of each role (from brand, subject or decision).
2. Make a lightness ladder from about 0.97 down to about 0.15; chroma peaks mid-scale and tapers at both ends.
3. Gamut-map to sRGB by reducing chroma (keep lightness and hue); note the P3 value for the main hue when the delivery supports wide gamut.
4. Tint neutrals toward the accent hue (a small chroma, about 0.005 to 0.02), never dead grey.
5. Pick accent and secondary colors by an explicit harmony rule (complementary, split complementary, analogous, triadic) and write the rule and the reason.

**Real material**: when real photos, footage or product UI exist, take one or two accent colors from them and keep the base; product UI and real interfaces keep their own skin.

**Unify mixed sources**: one grade and one light logic for all assets (handled by `ice-edit` and `ice-motion`); the palette decision names the target look.

## 6. Accent discipline and color states

- One saturated accent per frame, pointing at one thing. Accent is a signal, not a flood. Never put the accent on a word because of its position; put it where the meaning is.
- Write an **accent budget** in the D-entry: the classes of element allowed to take the accent (illustration only: the emphasis word of a headline, the key figure, the active step, a state change, the call to action).
- At most one saturated hue per film plus, at most, one semantic signal color, unless the film is a data story or explainer whose colors each teach a category or state: then 2 to 5 named color states are allowed, each with one meaning, each triggered by a real on-screen event. Same meaning, same color, same place, all film long; never two meanings in one hue.
- Semantic green and red appear once each in the whole film, if at all, outside data stories.
- A full-frame brand-color moment is powerful only when used once (or twice as chapter markers) and earned.
- Two hues that form one gradient ramp count as one accent. A third hue is almost always a mistake.

## 7. Gradients, glow, glass and texture (scoped)

| Treatment | Allowed when | Never |
|---|---|---|
| Gradient | It is the brand's own material, carries data, or behaves like one real light that changes with the mood | As a constant two-color backdrop; full-screen linear gradients on dark grounds (they band under compression) |
| Glow, bloom | One real light source with a job, at low strength | The same floor glow under every scene; radial glow plus vignette plus orb around a logo on near-black (the premium pastiche) |
| Glass, frosted panels | The brand's own UI uses it, and the base composition reads with the effect removed | As "premium" garnish |
| Grain, paper, halftone | Texture explains a material (paper for paper, film grain for footage, halftone for print); noticed after the design | As dirt, or as "depth" on flat vector |
| Flat color | The brand is genuinely flat (printed, poster-like): stay flat on purpose with hard color, hard shadow, a ground with an edge | Flat grey mid-tone grounds |

Every use needs a D-entry reason. Brand bans override all of these.

## 8. Contrast and color vision

- **WCAG 2.2 contrast ratio** = (L1 + 0.05) / (L2 + 0.05), where L is relative luminance (0.2126 R + 0.7152 G + 0.0722 B on linearized sRGB channels) and L1 is the lighter color.
- Targets at decision time: body and small text 4.5:1 or better; large display words and UI shapes 3:1 or better; accent used on small text uses `accent_small_text` (a deeper variant of the same hue) to reach 4.5:1. APCA Lc may be reported alongside for display type.
- Bright brand fills get a dark label (on-accent color); white on bright yellow, lime or gold usually fails (around 1.2 to 1.7:1).
- Never stack opacity on already dim text over a light ground; use a solid darker color.
- Check every text role on every ground and surface it will appear on, in each polarity used. Caption contrast against product UI and footage is checked by `ice-type`.
- Semantic colors must stay distinguishable under deuteranopia and protanopia; pair state color with shape, icon or label anyway.
- A grade or texture applied later can break contrast: `ice-qa` checks with the grade off and on.

## 9. Presenting options

- The direction round carries three palettes (one per direction); a palette picker may show 5 or 6.
- Name palettes after the brand's or subject's world, not generic moods.
- Mix polarities across options (dark, light, tinted) even for calm subjects.
- Every option must be distinct at swatch size: if two share ground lightness and a similar accent hue (within about 30 degrees), cut one. Test: would the difference show in a 14 px swatch chip?
- Show options as one sheet of swatches applied to a sample frame with the film's real words, not as a list of hex codes.

## 10. Gate checks at decision time

Before approval, run on the palette values (definitions in `anti-sameness.md`):

- **Default-look check**: thresholds, the roles that fail (ground, surface or dominant accent) and the valid reasons: `anti-sameness.md` section 5 (the gate definition).
- **Distance**: the palette axis compared with the nearest bundled template or demo and with recent fingerprints.
- **Contrast**: section 8 targets met for every text role.

## 11. Conflicts scoped

| Sources disagree | Scope chosen |
|---|---|
| "Tech, cinema, finance dark; food, wellness, kids light" vs "tech alone is no reason for dark" vs "background not dark by default" | All film types: polarity is a logged decision from research and brief; the category mapping is a convention to verify and then meet or break |
| "No pure black or white" vs "with no brand, prefer pure black/white contrast" | Tinted neutrals by default; pure black and white only as a declared monochrome direction (logo sting, kinetic type, Lottie, flat print brands) |
| "One accent" vs "five colors, five meanings" vs "two to five named states" | One saturated accent per frame for every type; multiple named states only in data story, explainer and UI walkthrough where each color teaches a meaning |
| "No gradients, no glass" vs "gradients and light encouraged when they are the brand's material" | Section 7: allowed only as brand material, data, or one real light, with a reason; never as default |
| "Ground never static" vs "same background across all scenes" | Same ground logic across the film; the ground itself may carry slow light or material change; polarity changes only as chapter devices at cuts or carried objects |

Sources: brand-identity-studio color method (Omar-Tnzxo); video-production-studio design system (Omar-Tnzxo); heygen-com/hyperframes house style, video composition and design picker (Apache-2.0); AbubakrChan/product-launch-motion accent budget and brand-fit slots (MIT); Tejashmakwana/motionmaxxing ground strategy, accent meanings, brand capture, world rules (Apache-2.0); alchaincyf/huashu-art-motion palette rules and blue-purple thresholds (MIT, translated); bangtutorial/bang-motion palette sources (MIT, translated); herk-edit-kit semantic palette (MIT); vincentsch/explainroo same meaning same color (MIT); ideas from imMamdouhaboammar/motion-graphics-skills, Vincentwei1021/video-talkcraft and vibe-motion/skills, rewritten.
