> Adapted from diffusionstudio/lottie (MIT, Copyright (c) 2026 Diffusion Studio Inc.). Changes: several recipe files merged into one; heading levels shifted; "Skottie" read as the delivery target renderer; replaced dash characters.

# Recipes: UI Motion (loaders, icons, state feedback, micro-interactions, lower thirds)

Read the one recipe that matches the main deliverable. Wherever a recipe says
"Skottie", verify in the delivery target's renderer, with Skottie as reference
when available. Frame counts assume 60 fps. Live in-product timing follows
`ui-motion-tokens.md`; these frame ranges are for authored Lottie assets.

## Contents

- Recipe: Loaders, Icons, And State Feedback
- Recipe: UI Microinteractions
- Recipe: Lower Thirds

## Recipe: Loaders, Icons, And State Feedback

Use for loaders, spinners, progress loops, badges, simple icons, success/error
states, warning alerts, empty states, and compact status animations.

### User-Language Aliases

- "loading spinner", "looping loader", "progress ring", "animated icon"
- "success check", "error x", "warning triangle", "complete animation"
- "toast icon", "empty state", "status badge", "done indicator"

### Defaults

- Transparent background.
- Loop cleanly for loaders/spinners/progress.
- Play once and settle for success/error/warning states unless looping is asked.
- Keep geometry crisp and readable at small sizes.
- Prefer one primitive or icon idea repeated with phase offsets over unrelated
  moving parts.
- Add only one charm gesture, such as blink, bounce, pulse, or draw-on, when it
  fits the brand tone.

### Presets

- `orbital-loader`: rotating dots or marks with seamless timing.
- `stroke-trace`: icon stroke draws, holds briefly, then resets or loops.
- `pulse-badge`: compact scale/opacity pulse around a status symbol.
- `check-complete`: path draw plus short settle for success states.
- `error-shake`: brief x/alert emphasis, controlled and not frantic.
- `warning-pulse`: triangle/badge reveal with restrained attention pulse.
- `scan-progress`: linear or radial progress sweep with controlled repetition.
- `phase-dots`: repeated dots or marks animate with offset timing and a matched
  loop seam.

### Timing And Easing

- State feedback: 30-75 frames with a stable final pose.
- Loaders: 60-120 frame seamless loops.
- Use continuous linear only for rotational/progress loops.
- Use short ease-out or low-bounce spring-like settles for success states.

### Ask Only When Needed

- Ask loop vs one-shot only if the request is ambiguous.
- Ask target size if the icon must fit a specific UI slot.
- Ask brand/accent color if no source style exists.

### Construction Notes

- Use trim paths for strokes, checks, rings, and circular loaders.
- Match first and last frames for loops.
- Engineer loop seams with identical first/last state or a period-locked cycle.
- Avoid excessive detail below small-icon sizes.
- Expose slots for accent color, stroke width, and background only if full-frame.

### Common Failure Modes

- Loop seam is visible.
- Repeated parts move in lockstep and feel mechanical.
- Icon becomes unrecognizable during motion.
- State animation feels too playful for an error/warning.
- Stroke caps or joins render differently than expected.

### Acceptance Checks

- Loop seam is invisible when looping.
- Repeated motion uses phase offset unless lockstep is intentional.
- Icon remains recognizable during motion.
- Timing feels useful, not frantic.
- Transparent output has no unwanted background layer.

## Recipe: UI Microinteractions

Use for button states, toggles, feedback ticks, hover/click affordances,
notifications, progress states, onboarding hints, empty-state feedback, and
compact product UI motion.

### User-Language Aliases

- "button press", "hover animation", "toggle switch", "tap feedback"
- "toast notification", "progress bar", "confirmation feedback"
- "empty state motion", "form success", "small UI interaction"

### Defaults

- Short, responsive motion.
- Preserve the user's UI style if source context exists.
- Use subtle distances and clear state changes.
- Make the state change the climax. Everything before it is setup; everything
  after it is confirmation.
- Believability comes from coherent state, not dense UI detail.
- Transparent background unless demonstrating a full component card.

### Presets

- `soft-confirm`: success tick or status icon draws and settles.
- `toggle-shift`: knob slides with color/opacity state change.
- `button-press`: scale/brightness press and quick release.
- `notification-pop`: small card/icon enters, holds, exits.
- `progress-fill`: determinate bar/ring fill with readable easing.
- `empty-nudge`: small illustration or icon prompts action without noise.

### Timing And Easing

- Press/hover feedback: 8-18 frames.
- Toggle/progress/state transition: 18-45 frames.
- Notification enter/exit: 30-75 frames.
- Use low-distance ease-out. Avoid large overshoot in functional UI.

### Ask Only When Needed

- Ask for the UI state pair if not clear.
- Ask whether the animation is one-shot, reversible, or looped if ambiguous.
- Ask for exact label/copy only when text appears in the animation.

### Construction Notes

- Keep state transitions reversible when practical.
- Use consistent timing across related states.
- When one value drives multiple properties, keep them synchronized: handle
  position, fill amount, color, label, and dash style should agree.
- Expose slots for accent color, label text, and progress value when useful.
- Avoid large brand-intro motion in functional UI contexts.

### Common Failure Modes

- Animation feels slow after a user action.
- Motion is too large for the component's size.
- State change is unclear without reading surrounding UI.
- Active state, label, and geometry disagree.
- Final state does not align to the component geometry.

### Acceptance Checks

- Motion communicates the state change immediately.
- UI state is coherent and readable without extra surrounding context.
- No element jumps, clips, or overshoots awkwardly.
- The animation still reads when viewed small.
- Timing feels responsive at 60 fps.

## Recipe: Lower Thirds

Use for lower thirds, name tags, chyron, caption straps, speaker IDs, social
handles, labels, and transparent overlay text.

### User-Language Aliases

- "lower third", "speaker label", "name and title", "caption bar"
- "social handle overlay", "YouTube tag", "news chyron", "name strap"

### Defaults

- Transparent background.
- Keep within safe margins and avoid the canvas edges.
- Prioritize legibility and quick comprehension.
- Ask for name/title/copy if missing; otherwise create editable slots when text
  editing is expected.

### Presets

- `clean-slide`: bar or text slides in, content fades, soft settle.
- `broadcast-snap`: fast blocks with crisp stagger and confident exit.
- `minimal-line`: thin accent line draws, text follows.
- `pill-reveal`: rounded container scales/masks open around text.
- `social-tag`: icon/handle enters with compact bounce and hold.
- `caption-strap`: understated bar with strong text legibility.

### Timing And Easing

- Entry: 45-90 frames.
- Exit: 30-60 frames when requested.
- Use snappy ease-out for bars and softer ease for text.
- Keep the held state stable for reuse in editing timelines.

### Ask Only When Needed

- Ask for exact name/title/handle if absent.
- Ask whether an exit animation is needed if the user says "reusable" or
  "broadcast".
- Ask for placement only if bottom-left/default safe placement conflicts with
  the request.

### Construction Notes

- Expose slots for name, subtitle, accent color, and optional bar color.
- Keep lower-third elements grouped for easy positioning.
- Use masks for clean container reveals rather than clipping through the canvas.
- Leave safe margins for broadcast/video overlays.

### Common Failure Modes

- Text is too small to read over real footage.
- Overlay occupies too much of the frame.
- Entry motion distracts from the speaker/content.
- Background is accidentally opaque.

### Acceptance Checks

- Text is readable over varied backgrounds.
- The animation is transparent unless a background is explicitly requested.
- Entry and exit do not obscure too much of the frame.
- Final held state feels balanced and broadcast-ready.
