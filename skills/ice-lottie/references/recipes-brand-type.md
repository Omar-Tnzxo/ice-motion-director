> Adapted from diffusionstudio/lottie (MIT, Copyright (c) 2026 Diffusion Studio Inc.). Changes: several recipe files merged into one; heading levels shifted; "Skottie" read as the delivery target renderer; replaced dash characters.

# Recipes: Brand And Type (logo, SVG animation, typography, starter projects)

Read the one recipe that matches the main deliverable. Wherever a recipe says
"Skottie", verify in the delivery target's renderer, with Skottie as reference
when available. Frame counts assume 60 fps. A raster logo with no vector goes
through `logo-pipeline.md` first. Arabic or mixed-direction copy: never
per-letter motion; see the ice-arabic skill.

## Contents

- Recipe: Logo Animation
- Recipe: SVG Animation
- Recipe: Typography Animation
- Recipe: Starter Projects

## Recipe: Logo Animation

Use for brand marks, wordmarks, logo reveals, intro/outro marks, app splash
marks, and SVG logo sources.

### User-Language Aliases

- "make my logo move", "logo reveal", "animate our mark", "app splash"
- "draw in this logo", "intro logo", "outro bug", "wordmark animation"

### Defaults

- Preserve brand shape, color, spacing, and final lockup unless asked to
  redesign.
- Default to transparent background.
- Build toward a clean lockup, settle, then hold. The held lockup is where the
  brand registers.
- Ask for brand constraints only when the source does not imply them or when the
  user asks for a specific style.
- Read `svg-compatibility.md` when the logo source is SVG.

### Presets

- `mark-draw`: trim-path or mask reveal for line/outline logos.
- `assemble-settle`: pieces enter from nearby offsets and settle into the mark.
- `premium-fade`: soft opacity/scale reveal with subtle final polish.
- `accent-sweep`: brand accent passes across the mark, then disappears.
- `wordmark-cascade`: letters or word groups reveal in restrained stagger.
- `splash-pop`: compact app/splash reveal with a short hold.
- `shape-vocabulary-build`: brand shapes assemble first; wordmark lands as the
  payoff.

### Timing And Easing

- Simple mark: 45-75 frames.
- Mark plus wordmark: 75-120 frames.
- Use low-overshoot premium settles unless the brand is explicitly playful.
- Keep final 10-20 frames stable enough for a clean logo lockup.

### Ask Only When Needed

- Ask for transparent vs full-frame if the intended use is unclear.
- Ask for brand adjectives only when the prompt gives no style direction.
- Ask whether to animate the full lockup or mark-only when both are present and
  the requested use is ambiguous.

### Construction Notes

- Separate mark, wordmark, and accent layers when possible.
- Keep final pose exactly aligned to the source logo.
- If the logo has distinctive modules, strokes, or brand shapes, animate those
  before revealing the wordmark. Do not show the full answer too early.
- Avoid distorting brand geometry through squash, bounce, rotation, or blur-like
  effects unless the user requests that personality.
- If a background is requested, expose `bgColor` and keep logo colors editable
  only when useful.

### Common Failure Modes

- Final frame does not match the source lockup.
- Wordmark letter spacing drifts during or after motion.
- Decorative effects overpower brand recognition.
- Wordmark appears before the build earns it.
- Transparent output accidentally includes background pixels.

### Acceptance Checks

- Final frame is a faithful logo lockup.
- Lockup holds long enough to read after the reveal.
- Transparent output contains no unintended background pixels.
- Motion feels brand-appropriate, not generic.
- SVG intersections, holes, masks, and strokes render correctly in Skottie.

## Recipe: SVG Animation

Use for generic "animate this SVG", SVG-to-Lottie, vector illustration reveals,
and SVG assets that are not clearly logo/icon/UI/lower-third/product/diagram
work.

Always read `svg-compatibility.md` with this recipe.

### User-Language Aliases

- "turn this SVG into Lottie", "animate this vector", "SVG reveal"
- "make this illustration move", "draw this SVG", "bring this SVG to life"

### Defaults

- Keep output transparent unless the SVG is clearly a full-frame illustration or
  the user requests a background.
- Preserve the source composition and viewBox.
- Animate meaningful structure: groups, paths, strokes, accents, labels, or
  visual flow.
- Route technical diagrams, product promos, and effect-led requests to their
  specific recipes when those are the main deliverable.

### Presets

- `path-draw`: strokes draw on with trim paths, then settle/fill.
- `layer-unfold`: grouped elements reveal in depth or reading order.
- `fill-sweep`: solid regions receive a directional color or opacity reveal.
- `illustration-drift`: tiny grouped parallax/position motion after reveal.
- `morph-lite`: small shape/position changes, only when source paths are safe.

### Timing And Easing

- Simple SVG/icon: 45-90 frames.
- Complex illustration: 90-180 frames.
- Use trim-path pacing based on perceived length, not raw segment count.
- Use calm ease-out for assembly and avoid morphing unless geometry is safe.

### Ask Only When Needed

- Ask what part should move if the SVG is complex and no intent is given.
- Ask transparent vs full-frame only when source framing is ambiguous.
- Ask whether exact final fidelity matters if the prompt invites creative
  transformation.

### Construction Notes

- Inspect groups and paths before deciding animation units.
- Resolve SVG styling and transforms enough that Lottie output is predictable.
- Use masks/reveals for complex filled shapes; use trim paths for clean strokes.
- Avoid path morphing unless paths have compatible vertex structure.
- Expose slots for accent color, background color when used, and optional scale
  or emphasis controls when useful.

### Common Failure Modes

- Final frame no longer matches the source.
- Hidden CSS styling disappears after conversion.
- Fill rules or masks break holes/intersections.
- Arbitrary path fragments move without a readable idea.

### Acceptance Checks

- Final frame matches the SVG source visually unless creative change was asked.
- No holes, clips, masks, gradients, or intersections break in Skottie.
- The animation has a clear reading order or reveal logic.
- Transparent/full-frame background policy is intentional.

## Recipe: Typography Animation

Use for titles, title cards, quotes, kinetic typography, text reveals, captions,
handwritten/path reveals, text morphs, counters, and short message-led scenes.

### User-Language Aliases

- "animate this headline", "make a title card", "kinetic type", "quote reveal"
- "handwritten text", "draw this word on", "typewriter", "morph this text"
- "add text for X", "caption this", "animated number/stat"

### Defaults

- Ask for exact copy only if missing.
- Default to transparent background for overlay/title elements; use a slotted
  background for full-frame title cards.
- Prefer readable hierarchy over novelty.
- Establish type hierarchy, line composition, and final-frame balance before
  adding accents or effects.
- Choose the type voice deliberately: serif for human/editorial authority,
  grotesque for product/function, monospace for technical labels, expressive
  display type when the word itself is the subject.
- Prefer native Lottie text (`ty:5`). It renders in the player when the scene
  ships its font: drop a `.ttf`/`.otf`/`.ttc` next to `lottie.json`, declare it in
  the Lottie `fonts.list` with `fFamily` matching the font's embedded family name,
  and reference it from text documents via `f`. See the "Native Text" section of
  the player-contract reference. Fall back to vector/shape text only for
  deliberate path-level effects (stroke-on reveals, glyph morphs, handwriting),
  not as a font workaround.
- For **editable multi-word slots** (headlines, subtitles, quotes, CTAs), author the
  text document as **box text**, add `sz: [w, h]` and `ps: [x, y]` so a longer edit
  wraps at a fixed width instead of overflowing. Keep **point text** (no `sz`) for
  single glyphs, numeric/tile scenes, logos, and choreographed type. Box text is
  top-aligned and does not clip to its height; see the "Point Text vs Box Text"
  section of the player-contract reference.

### Category Distinctions

- Title card: strong final still, clear hierarchy, restrained reveal.
- Quote reveal: reading pace, line rhythm, attribution after the main idea.
- Editorial text reveal: polished line breaks, masks, layout, and negative
  space.
- Handwritten/path reveal: natural stroke order, trim timing, and ink hold.
- Kinetic typography: type-driven choreography tied to meaning, not only a text
  entrance.
- Text morph: compatible paths only; otherwise use mask, crossfade, replacement,
  or layout change.
- Text-on-path or camera-follow text: typography remains primary; use camera
  scene motion as secondary only when framing movement is requested.

### Typography Roles

- Anchor text stabilizes the composition and may stay still or move subtly.
- Support text provides context and should usually be calmer than the main
  phrase.
- Active text carries the main motion idea. For kinetic typography, choose at
  least one active word or phrase before authoring.

### Kinetic Quality Bar

- For "kinetic typography", animate at least one major word or phrase with
  meaning-driven position, scale, masking, layout change, framing/camera
  movement, rhythmic timing, or emphasis.
- Slide, fade, scale, and stagger are valid tools, but uniform entrance motion
  applied to every word is not enough for kinetic typography.
- Preserve readability. Kinetic type needs contrast between active motion and
  stillness; not every word should compete for attention.
- Let semantic words influence motion: `fall` drops, `rise` lifts, `snap` hits
  sharply, `break` separates, `flow` travels smoothly, `soft` eases gently,
  `heavy` lands with weight, `loud` expands or hits harder, `quiet` recedes,
  `fast` compresses timing, and `slow` holds longer.

### Presets

- `title-clean`: restrained title reveal with strong final still.
- `editorial-reveal`: calm mask reveal, line rhythm, slight position settle.
- `quote-lift`: quote enters by line, attribution follows after a readable beat.
- `kinetic-word-choreography`: one active word drives layout, scale, or rhythm.
- `kinetic-snap`: semantic active word hits sharply, support text stays calmer.
- `statement-mask`: line-by-line mask reveal with strong still-frame hierarchy.
- `word-per-beat`: one word or phrase owns each beat, then resolves to a held
  lockup.
- `typewriter-clean`: stepped character/word reveal with a soft cursor/accent.
- `handwritten-trace`: path reveal following writing direction, subtle ink hold.
- `text-morph-lite`: crossfade/mask/position replacement unless paths are safe.
- `text-path-follow`: text follows a curve or camera-framed path while readable.
- `numeric-pop`: numbers scale or count in, supporting labels settle softly.

### Timing And Easing

- Short title/card: 60-120 frames.
- Longer quote: 90-180 frames.
- Typewriter/handwritten: pace by readability, not constant path length alone.
- Use ease-out for entrances, stepped timing for typewriter, and low overshoot
  only for kinetic/playful styles.
- Kinetic typography: build around phrase-level beats; active words can move
  more strongly while anchor/support text holds the composition.

### Ask Only When Needed

- Ask for exact text if absent.
- Ask for brand or font files when source context is missing and typography is
  central (user and project fonts come first; otherwise the ice-direction font
  order, `references/type-pairing.md` section 1, picks a system or Google Fonts
  family by fit).
- Ask whether output should be full-frame or transparent if ambiguous.

### Construction Notes

- Break text into semantic lines, words, or glyph groups based on the preset.
- Keep line lengths short enough for the canvas and target use.
- Keep one focal line or phrase dominant; support text should clarify rather
  than compete.
- Use masks or shape reveals for premium title work; use opacity/position
  stagger for simpler captions.
- Use per-line mask reveals and meaning-based line breaks for statement/title
  work. Avoid random per-letter motion unless the prompt asks for it.
- For kinetic typography, define anchor, support, and active text roles before
  keyframing.
- Avoid applying the same opacity/position/scale entrance to every word. Offset
  properties and timing according to meaning, reading order, and emphasis.
- Use lines, dots, dividers, glows, and ornaments only when they guide reading
  order, reveal text, emphasize a word, support rhythm, or reinforce semantic
  motion.
- Use path morphing only with compatible path structures; otherwise use
  replacement, reveal, or crossfade.
- Expose useful slots: text content when supported, accent color, background
  color for full-frame cards, and timing/scale only when user editing matters.
- Expose a text slot when the copy should be user-editable from the properties
  panel. The slot still requires the scene's font to be present, same as any
  native text.

### Common Failure Modes

- Text becomes unreadable mid-animation.
- Line breaks feel accidental.
- The final frame is visually weaker than the motion.
- Handwritten reveals move against the natural stroke direction.
- Text morphs warp because path structures are incompatible.
- Kinetic typography is only a uniform word-by-word entrance.
- Every word moves equally, so no active phrase leads the viewer.
- Decorative accents fill space but do not guide reading or meaning.
- Type accents or effects arrive before the hierarchy and line breaks are
  resolved.
- Typeface choice does not match the message tone.

### Acceptance Checks

- First and final frames are clean still compositions.
- Text is readable at all inspected frames.
- Staggering supports meaning instead of making words hard to follow.
- Kinetic prompts have an active word or phrase with semantic, type-driven
  motion.
- Anchor/support text stabilizes the composition and does not compete with the
  active phrase.
- Accents support reading rhythm, reveal, emphasis, or semantic motion.
- Type hierarchy, line breaks, and optical placement pass before effects are
  considered polish.
- If type is the subject, each major beat is readable as a strong still frame.
- No text touches unsafe edges or clips during motion.

## Recipe: Starter Projects

Use when the user wants to start from a type of animation rather than provide a
specific scene. Starters are briefs and defaults, not prebuilt JSON templates.

### User-Language Aliases

- "start a project for X", "make me a template", "give me a starting point"
- "create a reusable animation pack", "make a launch animation from scratch"

### Starter Types

- `brand-logo-pack`: transparent logo reveal, optional short/long variants.
- `kinetic-title-card`: full-frame typography with slotted background/accent.
- `broadcast-lower-third`: reusable transparent overlay with name/title slots.
- `product-ui-feedback`: compact UI success/error/loading microinteractions.
- `icon-loader-set`: small transparent loopable icons and loaders.
- `svg-illustration-reveal`: SVG-derived vector reveal with compatibility pass.
- `product-launch-card`: feature/product announcement with title, media, accent.
- `diagram-explainer`: technical line trace with labels and callouts.
- `data-stat-card`: KPI/stat/chart scene with count-up and direct labels.
- `brand-card-system`: reusable layout skeleton, type system, and accent rule.
- `parallax-scene`: layered pan/zoom or camera-follow composition.
- `ambient-field`: two-tone background from one anchor plus one derived field.
- `generative-loader`: one repeated primitive with phase offsets and clean loop.
- `effects-led-promo`: title/product scene with glow, glass, sweep, or burst.

### Briefing Defaults

If the user does not provide details, choose sensible defaults:

- Canvas: 512x512 for icons/logos/loaders, 1920x1080 for broadcast/title/promo
  work, or match the source SVG/viewBox when supplied.
- Frame rate: 60 fps.
- Duration: 60-120 frames for compact work, 120-180 frames for title/promo/story
  work.
- Background: transparent for reusable overlays/assets, slotted background for
  full-frame compositions.
- Controls: expose only values the user is likely to edit.

### Ask Only When Needed

- Ask for exact copy/assets if the starter cannot be meaningful without them.
- Ask intended placement/platform only when size/background policy is unclear.
- Ask whether the starter should include an exit animation for overlays.

### Acceptance Checks

- The starter produces a concrete scene direction, not a generic list of ideas.
- The selected primary recipe is clear before JSON authoring starts.
- The background policy and output size match the intended use.
- Any starter with stats, charts, loops, particles, or fields has a Skottie-safe
  construction plan before authoring.
