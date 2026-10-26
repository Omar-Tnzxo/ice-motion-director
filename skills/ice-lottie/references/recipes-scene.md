> Adapted from diffusionstudio/lottie (MIT, Copyright (c) 2026 Diffusion Studio Inc.). Changes: several recipe files merged into one; heading levels shifted; "Skottie" read as the delivery target renderer; replaced dash characters.

# Recipes: Scenes (data and stats, diagrams, product promo, camera, visual effects)

Use these only when the deliverable is a Lottie scene. A rendered film of the
same kind belongs to the ice-film or ice-explainer workflow. Wherever a recipe
says "Skottie", verify in the delivery target's renderer, with Skottie as
reference when available. Frame counts assume 60 fps.

## Contents

- Recipe: Data, Stats, And Charts
- Recipe: Diagram And Technical Animation
- Recipe: Product, Launch, And Social Promo
- Recipe: Camera And Scene Motion
- Recipe: Visual Effects

## Recipe: Data, Stats, And Charts

Use for KPI cards, stat reveals, big-number scenes, pitch-slide charts,
dashboard metrics, progress/goal cards, social-proof rows, data-derived
textures, and simple chart animations.

### User-Language Aliases

- "animate these KPIs", "stat card", "big number reveal", "metric animation"
- "pitch chart", "growth chart", "bar chart", "line chart", "data slide"
- "dashboard metric", "progress card", "results row", "social proof"

### Defaults

- Choose one data archetype before authoring. Do not improvise a layout for a
  number.
- The headline should state the insight; the chart or figure confirms it.
- Use one semantic accent against neutral, two values of one hue, or one
  saturated hue per card.
- Default to borderless figures in negative space, or even self-contained cards.
  Do not wrap a stat triad in an extra outer framing card or border unless the
  user asks. Use exactly one surface tone; never stack two near-black or
  near-white tints. If columns need separation, use one hairline of one color
  between equal columns only, and prefer whitespace first.
- Count up figures with baked keyframes and tabular numerals unless the prompt
  asks for static text.
- Use slotted background for full-frame data scenes; transparent only when the
  user asks for overlay/asset output.

### Archetype Picker

- Hero figure: one emotional metric, extreme figure-to-label contrast.
- KPI grid or stat-card triad: several parallel proofs using one repeated
  template.
- Results rows: hairline label/value rows for credible outcomes.
- Comparison chart: one accent-vs-neutral bar, line, strip, or scale graphic.
- Progress/goal card: actual vs target, goal line, weekly bars, or ring nesting.
- Dashboard metric mock: one hero metric, one chart, and light supporting state.
- Social proof: outcome-tied logo/name row, metric, and attribution.
- Data-derived texture: heat map, mosaic, or dot/ring field where the pattern
  is data, not decoration.

### Timing And Easing

- Compact stat card: 60-120 frames.
- Multi-card/grid/chart reveal: 120-210 frames.
- Use calm ease-out and no bounce for finance, research, enterprise, and serious
  data.
- Small pops are acceptable for badges, consumer/wellness warmth, or bold social
  panels.
- Support text arrives after the figure or geometry resolves.

### Construction Notes

- Bake counters and odometer rolls. Do not rely on live expressions in Skottie.
- Use tabular or fixed-width numeral shapes so digits do not jitter.
- Sync counts to geometry: line reaches point, bar reaches height, segment
  reaches width, or ring reaches target.
- Direct-label values on points, bars, cards, rows, or panels. Avoid axis
  decoding when the scene is short.
- Use trim paths for lines, hairlines, axes, callout arrows, rules, and flows.
- Use masks or clip reveals for rounded bars/cards so radii do not distort.
- Use slots for insight/headline text, key values, accent color, background
  color, and optional chart colors when useful.
- Placeholder third-party logos, compliance marks, or headshots unless the user
  supplied rights-safe assets.

### Common Failure Modes

- Title names the topic but not the insight.
- Static number appears with a fade instead of a count-up.
- Values require axis/legend decoding.
- Rainbow chart color decorates instead of teaching.
- Too many metrics compete in one beat.
- Serious data uses bouncy or theatrical motion.
- An unnecessary outer framing card or border wraps the stat group when
  whitespace and alignment would carry it.
- Multiple dividers use slightly different colors or weights (for example a title
  underline plus column rules that do not match).
- Two stacked near-black or near-white tints read as a muddy box instead of one
  clean surface.
- Dashboard mock looks dense but the state is incoherent.
- Rounded bars/cards stretch because they were scaled instead of revealed.
- Label and value in a row share a baseline, so the smaller label sinks below the
  larger value instead of reading as one aligned row.
- Label/figure spacing or row spacing is eyeballed, so the vertical rhythm looks
  uneven.

### Acceptance Checks

- The data archetype matches the metric's job.
- The headline states the point and the data confirms it.
- Figures are direct-labeled, counted up, and readable.
- Label and value in each row are cap-center aligned and optically centered in the
  pill, card, or row, and the value stays centered through the count-up.
- Stacked label/figure spacing and row-to-row spacing follow a consistent rhythm.
- Chart geometry and numeric labels resolve together.
- Palette uses semantic color, not decorative color.
- No outer framing card or border unless it does a job whitespace cannot; any
  dividers are a single hairline and one color between equal columns; exactly one
  surface tone is used; hierarchy still reads with all chrome removed.
- Final frame works as a clear still data slide.
- Motion adds comprehension and does not overdramatize serious data.
- Counters, masks, trim paths, and rounded reveals are Skottie-safe.

## Recipe: Diagram And Technical Animation

Use for technical diagrams, flow traces, line animations, callouts, architecture
explainer graphics, process steps, and data/connection reveals.

### User-Language Aliases

- "trace this diagram", "animate the flow", "show the pipeline"
- "technical line animation", "callout animation", "draw the connection"
- "architecture explainer", "step-by-step diagram", "network/path reveal"

### Defaults

- Prioritize clarity over decoration.
- Follow the object budget in `design-taste.md`: start with the smallest set of
  nodes, paths, labels, and accents that explains the system.
- Reveal in the order the viewer should understand the system.
- Do not treat "technical" as dark grid, blue arrows, empty rounded cards, and
  decorative circles. Pick a concrete visual system.
- Use transparent background for overlays/assets; use slotted background for
  full-frame explainers.
- Read `svg-compatibility.md` when the source diagram is SVG.

### Before Authoring

- Define the final-frame topology: primary path, supporting clusters, callout
  positions, and strongest still-frame read.
- Choose a visual system: editorial light, product UI, schematic minimal,
  branded system map, dense dashboard detail, or presentation-grade explainer.
- Choose the structural relationship: chain for sequence, bracket for
  part-whole, orbit for convergence, radial for system, grid for comparison,
  or hairline rows for evidence.
- Decide the node/detail strategy. Each node should communicate role, state,
  sequence, metric, UI fragment, icon, or label.
- Decide what the lines mean: data flow, dependency, sequence, ownership, or
  state transition.
- Keep believability separate from density: use coherent system states and
  clear workflow labels instead of fake technical micro-detail.

### Presets

- `flow-trace`: lines draw in path order, nodes activate after connection.
- `callout-pop`: labels or badges enter after their target is visible.
- `scan-highlight`: highlight travels across a path or system segment.
- `node-network`: nodes appear in clusters, connections follow.
- `step-build`: diagram builds one logical step at a time.
- `orbit-system`: radial nodes draw in, orbit subtly, and counter-rotate labels
  to keep them upright.

### Timing And Easing

- Simple diagram: 75-150 frames.
- Multi-step explainer: 150-300 frames.
- Use linear or near-linear trim for technical traces, with eased activation for
  nodes and labels.
- Hold after each major step long enough for comprehension.

### Ask Only When Needed

- Ask for the intended reading order if it is not clear from the diagram.
- Ask whether labels should be editable when text is prominent.
- Ask full-frame vs transparent only if destination is unclear.

### Construction Notes

- Separate paths, nodes, labels, and highlights.
- Use trim paths for lines and small opacity/scale settles for nodes.
- Avoid path morphing; technical diagrams need stable geometry.
- Keep labels aligned and readable throughout the trace.
- Give each node useful interior detail: icon, number, small label, status dot,
  mini UI row, thumbnail, metric, or port.
- Use arrows only when direction is ambiguous. Vary line weight, opacity, or
  style to show primary and secondary flow.
- Use grids as alignment structure or axes, not decorative wallpaper.
- Turn floating circles into ports, status indicators, badges, or remove them.
- Use tonal rings, hairlines, halftone-like dots, or subtle value steps for
  depth before glow or shadows.
- For orbit/radial systems, counter-rotate text/icons if the parent rotates.
- If the final frame feels crowded, reduce nodes, merge labels, or emphasize the
  primary path before adding more detail.

### Common Failure Modes

- Everything reveals at once, losing the explanation.
- Lines draw opposite the intended flow.
- Labels overlap or appear before their target.
- Decorative effects reduce technical clarity.
- Empty rounded rectangles make the diagram feel placeholder-like.
- Dark grid plus blue arrow chains make the scene feel generic unless requested.
- Generic node mesh suggests "technical" without explaining a relationship.
- Large blank regions weaken the final poster frame.
- Fake complexity adds visual noise without explaining the system.
- Dense meaningful-looking detail makes the system harder to understand.

### Acceptance Checks

- The reveal order explains the system.
- Final frame is a clean, accurate diagram.
- Lines, arrows, labels, and callouts stay readable.
- Nodes contain enough information to be meaningful without the animation.
- The final topology feels balanced, with intentional negative space.
- Decoration has a job: grouping, state, brand, attention, or structure.
- Diagram structure communicates the relationship without relying on labels
  alone.
- Detail improves comprehension without crowding the final composition.
- SVG source diagrams preserve holes, clipping, and intersections.

## Recipe: Product, Launch, And Social Promo

Use for product launches, feature announcements, app/product card reveals,
release notes visuals, social promos, and short marketing-style Lottie scenes.

### User-Language Aliases

- "product launch animation", "feature announcement", "new feature promo"
- "social post animation", "app screenshot reveal", "launch card"
- "show off this product", "announcement banner", "release animation"

### Defaults

- Treat the product/feature as the hero.
- Use full-frame composition unless the user asks for a transparent asset.
- Keep copy short and readable; animate one message clearly.
- Pair one claim with one product-proof object. Avoid screenshot collages.
- Avoid generic launch-card layouts when no product signal is visible.
- Follow the object budget in `design-taste.md`: hero first, support detail
  second, accent system last.
- Expose slots for headline, subhead, accent color, and background color when
  useful.

### Before Authoring

- Define the hero: product screenshot, feature surface, logo, object, or single
  message.
- Define the product signal: UI fragment, thumbnail, feature callout, data chip,
  branded shape, or recognizable workflow step.
- Define the proof: screenshot detail, believable UI state, metric, workflow
  step, customer result, or capability demo.
- Define the final poster frame: headline position, product scale, CTA/message
  focus, and supporting detail.
- Define believability through coherent product state, workflow, copy, and
  hierarchy, not by adding more interface fragments.
- Decide which accents support the offer. Remove decoration that does not frame,
  reveal, or emphasize the product.

### Presets

- `hero-card-reveal`: product card/screenshot enters, headline follows.
- `feature-spotlight`: one feature area highlights with label/callout.
- `launch-burst`: title/product reveal with restrained celebratory accents.
- `social-loop`: short looping promo with clear first/final frame.
- `update-stack`: multiple feature chips/cards stagger into place.
- `proof-object`: claim enters, one product proof animates, support copy follows.

### Timing And Easing

- Single announcement: 90-150 frames.
- Multi-beat product scene: 150-240 frames.
- Use premium ease-out for hero elements and small staggers for supporting
  copy/chips.
- Keep any loop subtle enough for social/product contexts.

### Ask Only When Needed

- Ask for exact headline/subhead if missing.
- Ask for product asset/screenshot if the prompt expects one but none exists.
- Ask aspect ratio only if platform is unclear and it changes composition.

### Construction Notes

- Build around a hero layer, copy group, accent layer, and optional background.
- Use camera scene motion as secondary when the prompt asks for pan/zoom/tour.
- Use visual effects as secondary for glow, glass, sweep, or burst treatments.
- Use one contained gradient or idle loop at most unless the prompt is
  effect-led.
- Demonstrate the claim with a believable artifact; do not only assert "fast",
  "easy", or "trusted".
- Avoid stuffing too many feature points into one short scene.
- Replace empty cards with screenshot detail, mini UI rows, product thumbnails,
  feature labels, metric chips, or branded placeholders with clear meaning.
- Use supporting chips or callouts only when they clarify the feature or offer.
- If the scene feels crowded, simplify the offer, enlarge the hero, or merge
  support details before adding more product chrome.
- Keep the final frame strong enough to work as a static product graphic.

### Common Failure Modes

- Looks like a generic ad rather than the user's product.
- Claim is not backed by a visible product proof.
- Too much copy appears too fast.
- Effects compete with the product.
- Final frame lacks a clear offer or feature focus.
- Product surface is too small, blank, or abstract to identify.
- Empty cards and decorative accents make the scene feel template-like.
- Believable-looking UI detail is dense but does not explain the product.

### Acceptance Checks

- Product/feature is unmistakably the hero.
- Claim, product proof, and final message agree.
- The scene includes product-specific visual information, not only generic
  containers.
- Product/content detail is coherent and readable without becoming crowded.
- Copy is readable and not overcrowded.
- Final frame works as a poster frame.
- Motion feels polished, not like a template dump.

## Recipe: Camera And Scene Motion

Use for camera-following motion, pan, zoom, parallax, layered scene movement,
hero pushes, product screenshot tours, and animated scene framing.

### User-Language Aliases

- "pan across this", "zoom into the product", "camera follow"
- "parallax scene", "Ken Burns style", "move through the interface"
- "push in", "pull back", "follow the path", "scene motion"

### Defaults

- Choose one dominant camera idea: push, pull, pan, follow, or parallax.
- Keep the main subject readable throughout the move.
- Use full-frame background policy unless the result is a transparent asset.
- Treat camera motion as attention direction, not decoration.
- Use camera motion to improve attention and final-frame framing, not to hide a
  weak composition.

### Presets

- `premium-push`: slow push-in with subtle foreground/background separation.
- `guided-pan`: horizontal or vertical pan revealing steps in order.
- `focus-follow`: camera follows one hero object or path.
- `layered-parallax`: foreground/midground/background move at different rates.
- `product-tour`: screenshot/product card moves through 2-3 feature beats.

### Timing And Easing

- Compact camera move: 60-120 frames.
- Product or scene tour: 120-240 frames.
- Use smoother easing than object motion; abrupt camera stops feel cheap.
- Hold briefly after the camera arrives so the final message lands.

### Ask Only When Needed

- Ask which subject to follow if the scene has multiple heroes.
- Ask output size/platform if framing depends on aspect ratio.
- Ask whether text must remain readable throughout the move when uncertain.

### Construction Notes

- Prefer grouped/parented transforms over animating every child independently.
- Keep scale changes modest unless the move is the concept.
- Counter-animate text or labels if camera motion makes them hard to read.
- Use parallax only when layered depth exists or can be built cleanly.
- If the final frame feels like an accidental crop, revise the layout or camera
  endpoint before adding more movement.

### Common Failure Modes

- Camera crops the hero subject or text.
- Parallax layers move without a clear depth hierarchy.
- Motion sickness from too much scale/position change.
- Final frame feels like an accidental crop.
- Camera motion adds energy but does not improve hierarchy or framing.

### Acceptance Checks

- The viewer's eye follows the intended subject.
- Important text remains readable or resolves quickly.
- First and final frames are clean compositions.
- Camera motion enhances the message instead of hiding weak layout.
- Final camera position lands on the strongest still frame.

## Recipe: Visual Effects

Use for glass/metal/shader-like sweeps, glow, gradient and fill effects, light
passes, playful bubbles, bursts, sparkles, confetti-like accents, and effect-led
animations.

This recipe is usually secondary. Use it as primary only when the effect itself
is the main deliverable.

### User-Language Aliases

- "add a glow", "glass sweep", "metal shine", "gradient wave"
- "bubble burst", "playful pop", "sparkle", "shine pass"
- "fill effect", "liquid reveal", "make it feel premium"

### Defaults

- Keep the base composition readable without the effect.
- Use effects to reveal, emphasize, or transition, not as constant decoration.
- Every effect needs a job: reveal, emphasis, transition, state feedback, or
  material behavior.
- Effects cannot compensate for weak hierarchy, spacing, or final-frame
  composition. Revise the base design first.
- Treat blur, glow, glass, chrome, dither, true 3D, and displacement as
  render-risky. Approximate with vector shapes or bake as assets.
- Prefer simple Lottie shapes, gradients, masks, and opacity layers over
  renderer-specific filters.
- Preserve transparent output when used with logos, icons, overlays, or SVG
  assets.

### Presets

- `glass-sweep`: translucent angled pass across text, logo, or product.
- `metal-sheen`: narrow highlight sweep with quick fade and subtle contrast.
- `soft-glow`: restrained halo pulse behind the hero subject.
- `gradient-fill`: color/fill transition moving across a shape or word.
- `bubble-burst`: playful circles expand/fade around a success or reveal.
- `spark-accent`: tiny highlights appear around a final settle.
- `ambient-field`: one anchor generates a quiet two-tone field or loop behind
  the main content.
- `phase-primitive`: one repeated primitive animates with offset timing and a
  seamless loop.

### Purpose Pairings

- Replace random glow with a focal halo tied to the hero subject, active state,
  or final settle.
- Replace loose circles with action-state feedback, ports, badges, particles
  from a burst origin, or remove them.
- Replace generic sweeps with masked material passes across a specific surface:
  logo edge, text face, card glass, product screen, or metal rim.
- Replace muddy gradients with semantic fills: progress, selection, heat,
  transfer, reveal, or brand color transition.
- Treat "premium" as restraint, crisp masking, material consistency, and a clean
  final frame, not more glow.
- Treat "technical" as precision, structure, and information clarity, not neon
  decoration.
- Prefer a field generated from the hero subject over generic particle scatter.

### Timing And Easing

- Sweeps: 30-75 frames, usually faster than the main reveal.
- Glow pulses: 45-90 frames, low amplitude.
- Bursts: 20-45 frames, quick expansion and fade.
- Use ease-out on expansion, linear or near-linear on light passes, and avoid
  long lingering effects unless ambient motion is requested.

### Ask Only When Needed

- Ask whether the desired feel is premium, playful, technical, or magical if the
  prompt only says "make it cool".
- Ask whether the effect should loop if it sounds ambient.
- Ask for brand color constraints when effects change the palette.

### Construction Notes

- Keep effect layers separate and named.
- Clip/sweep effects with masks only when necessary and verify all frames.
- For ambient/generative effects, use one anchor, one field, one ground, and one
  motion archetype.
- Bake particle, orbit, noise, and expression-like systems to keyframes.
- Use additive-looking color choices cautiously; Skottie/browser output can vary.
- Limit effects on text until legibility is confirmed.
- For typography, use accents or effects only when they support reading rhythm,
  text reveal, word emphasis, or semantic motion.

### Common Failure Modes

- Effect overwhelms the message.
- Glow or sweep clips at canvas edges.
- Gradient/fill effects become muddy.
- Playful bursts feel random because they are not tied to an action beat.
- Decorative effects hide weak composition instead of improving it.
- Premium treatment becomes a pile of glow, glass, and gradients.
- Render-only effects are promised as native vector Lottie behavior.
- Ambient field becomes generic wallpaper unrelated to the subject.
- Typography effects become filler instead of supporting the phrase.
- Effect layers make the object budget feel crowded.

### Acceptance Checks

- Effect supports the primary recipe's message.
- Effect purpose is identifiable even in the final frame.
- Base composition remains strong if the effect is removed.
- Ambient/generative effects are semantically anchored and loop cleanly.
- Typography effects help the viewer read or feel the phrase.
- Final frame is clean after the effect passes.
- No effect layer creates unintended background pixels.
- Skottie render matches the intended intensity and clipping.
