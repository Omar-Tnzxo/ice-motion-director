# Springs and curves

Formulas and named curves. Closed-form springs ship as code in `scripts/springs.mjs` (`stepR`, `Track`, `vis`, `edgeSplit`, `fromDurationBounce`, `settleTime`); the 12 measured eases in `scripts/measured-eases.mjs`. Engine syntax for registering curves (GSAP CustomEase, Remotion spring config, CSS `linear()`) is owned by the ice-engines skill.

## 1. Seek-safe springs only

- Use closed-form step responses: a spring is a pure function of the time since its target changed, so any frame renders in any order.
- A value that changes target many times is the sum of one spring per change (`Track`).
- Stateful spring solvers from interaction libraries (that integrate a velocity frame by frame) are banned in renders: they cannot be seeked.
- Anything that truly needs history (a lagging follow camera, a simulation) is simulated once at load at 240 Hz from a fixed seed and read back with interpolation.
- Springs start at their event. A target that must arrive at time T is issued one settle-lead early (about 0.3 s, depends on w).
- Looping films: sum the springs of the previous one or two periods too, so the loop closes (the deltas sum to zero).

## 2. The step response

```
critically damped (z >= 1):  x(t) = 1 - e^(-w t) (1 + w t)
underdamped (z < 1):         wd = w sqrt(1 - z^2)
                             x(t) = 1 - e^(-z w t) (cos(wd t) + (z w / wd) sin(wd t))
```
w = speed (rad/s), z = damping ratio. Duration and bounce authoring (SwiftUI style): stiffness = (2 pi / duration)^2, z = 1 - bounce, damping = 2 z sqrt(stiffness), mass 1.

## 3. Damping guide (merged from all sources)

| z (damping ratio) | Overshoot | Use |
|---|---|---|
| 1.0 | none | Default for camera, text, data, counters; what power3.out approximates |
| 0.95 or more | none visible | Camera moves that must feel heavy |
| 0.85-0.9 | about 0.2-1 percent | "Alive, not bouncy": the iOS system default band; containers, morphs |
| 0.72-0.82 | about 1-4 percent | Tiny overshoot: UI morphs, cards, product launch springs |
| 0.60-0.70 | about 5-10 percent | Playful only |
| below 0.55 | large | Do not use |

Bounce authoring equivalents: bounce 0 (smooth), 0.15 (crisp, cards about 0.75 s, bubbles about 0.5 s), 0.3 (visible bounce, playful), above 0.4 reads cheap. Professional products 0-0.15; playful categories 0.2-0.35; never elastic on text or data.

Response time (seconds of visual duration): 0.25-0.35 tight snap (about 0.37-0.51 s to settle), 0.35-0.50 standard entrance (0.51-0.74 s), 0.50-0.70 weighted hero (0.74-1.03 s).

## 4. Preset libraries (pick one family per film)

| Family | Values |
|---|---|
| w and z (rad/s, ratio) | w 8 slow, 14 normal, 22 snappy; default w 14, z 0.82 |
| Named presets [w, z] | morph [15, 0.84], fast [27, 0.86], slow [12.5, 0.9], soft [10, 0.95], camera [7.5, 1], colour [20, 1]; content swap enter [26, 1] |
| Stiffness and damping (k / d, mass 1) | snappy UI 320/30, default containers and camera 170/26, heavy type and logos 120/24, playful mascots 180/12 |
| Remotion-style (damping, stiffness, mass) | snappy {14, 160, 0.6}, smooth {20, 90, 1}, bouncy {11, 170, 0.7} (playful only); firm push with no bounce: damping 200; no bounce: damping 20, stiffness 100 with overshoot clamping; slow: damping 20, mass 2 |
| Edge split | leading edge [34, 0.9], trailing edge [19, 0.9]: width = right - left; the edge moving forward uses the fast spring |
| Cursor press | dip at click - 0.07 s on [45, 1], release at click + 0.035 s on [22, 0.72]; cursor scale dips 13 percent, pressed shape 3.5 percent |
| Shape intro pop | [13, 0.78] from 0.55 to 1 scale, opacity over 0.12 s (playful register) |
| Slam spring | x(t) = 1 - e^(-10t) cos(2 pi 2.2 t): about 8 percent overshoot, settles in about 0.35 s; from 1.7x to 1, opacity 0 to 1 in the first 0.06 s (kinetic type, music-led) |

## 5. Named cubic-bezier curves

| Name | Curve | Role |
|---|---|---|
| expoOut (house ease-out) | (0.16, 1, 0.3, 1) | entrances, fades in; easeOutExpo |
| quintOut | (0.22, 1, 0.36, 1) | brisk retail and food entrances; liquid fling |
| quartOut | (0.25, 1, 0.5, 1) | travel, real estate |
| broadcastOut | (0.23, 1, 0.32, 1) | sport and esports slams that land exactly (news reels use section 7, "Broadcast settle") |
| standardOut | (0.2, 0, 0, 1) | fintech, SaaS precision |
| standard | (0.4, 0, 0.2, 1) | government, neutral moves |
| iosSheet | (0.32, 0.72, 0, 1) | panels, AI products |
| sineInOut | (0.37, 0, 0.63, 1) | camera, calm drift |
| cubicInOut | (0.65, 0, 0.35, 1) | morphs, luxury in-out |
| easeInOutQuint | (0.83, 0, 0.17, 1) | decisive in-out |
| expoInOut | (0.87, 0, 0.13, 1) | snappy hero transitions |
| overlap ease | (0.857, 0, 0.143, 1) | two-stage moves; peak velocity 7x the mean |
| morph glide | (0.45, 0, 0.15, 1) | container morphs about 0.8 s, camera on the same curve |
| entry in (exits only) | (0.7, 0, 0.84, 0) | exits |
| emphasizedDecel / Accel | (0.05, 0.7, 0.1, 1) / (0.3, 0, 0.8, 0.15) | large entrances and exits |
| backOut | (0.34, 1.56, 0.64, 1) | playful overshoot only |
| softBackOut | (0.34, 1.3, 0.64, 1) | kids, gentle playful |
| Easy ease (33% influence) | about (0.333, 0, 0.667, 1) | loops; peak over mean velocity 1.49 |
| 75% influence | about (0.75, 0, 0.25, 1) | strong in-out actions; for (a, 0, 1 - a, 1) the midpoint velocity over mean is exactly 1 / (1 - a) |

Lottie-safe anchors (motion behaviour, not layer type): entrance-sharp (0.20, 0.75, 0.34, 0.94) fast in, soft land; settle-soft (0.00, 0.65, 0.51, 0.99) deep ease-out, no bounce; kinetic-ui (0.85, 0.46, 0.14, 0.53) lively, not every UI move; expressive-pop (0.94, 0.75, 0.34, 0.94) fast out and soft settle; travel-balanced (1.00, 0.49, 0.00, 0.55) S-curve; exit-accelerate (1.00, 0.02, 0.54, 0.42); travel-cut (0.15, 0.85, 0.95, 0.05) only for moves interrupted by a cut, fast-slow-fast, never settles. Derive from the nearest anchor and change one quality; do not invent from nothing.

GSAP ease roles when that engine is used: power1/power2.out gentle secondary; power3.out the house entrance default; power4.out or expo.out punch and titles; sine.inOut calm, crossfades, drift; expo.inOut snappy hero transitions; none for camera creep and mechanical drivers; circ for orbital camera; steps(N) for typing, blink, counters; back.out(N) with N at or under 2 and elastic only in an explicitly playful register.

## 6. Other closed forms

- Smootherstep x^3 (x (6x - 15) + 10): starts and ends at zero velocity; use it where an ease-out starting at full velocity would pop for one frame (exploded 3D layers, staggered courses).
- Three-phase nudge: see `timing-and-easing.md` section 8.
- Monotone cubic (Fritsch-Carlson, zero end slopes) through measured keys when matching a real device or reference motion: the speed graph must peak once and then dwell. Reference foldable hinge 0 to 180 degrees in about 0.8 s: keys at 0, 0.08, 0.15, 0.23, 0.31, 0.39, 0.49, 0.59, 0.69, 0.80 s = 0, 20, 58, 82, 98, 116, 140, 159, 172, 180 degrees ("that is not a smoothstep").
- Hermite interpolation when both endpoint position and velocity matter; arc-length remapping for controlled speed along a curve.
- Perceptual scale: linear scale tweens look uneven (bigger scales feel slower); interpolate zoom and scale in log space.
- Ballistic flight: p(t) = p0 + v0 t + 0.5 g t^2; solve v0 so it lands on the next contact on the beat; keep gravity constant across the film.
- Bounded sine for life inside a hold: pi = pulse, 2 pi = settle; envelope the idle to 0 over the last 24 percent of the shot; during a hold at most one element stays alive (where the scoped hold policy allows any life at all, see `holds-and-stillness.md`).

## 7. Broadcast settle

Scope: news reel (edit type `news-reel`, style family `family-broadcast-news.md`) and news or programme promo reels, where it was measured; with a reference, its measured curves win (classify them with `nearest()` in `scripts/measured-eases.mjs`). Also available to any calm camera that must not stop (illustration only, several kinds: a brand film, a documentary, an explainer, a long take on a continuous camera), recorded in the plan's `camera` row: the calm school for camera moves, and the two-null overlap below whenever the camera must not stop. `broadcastOut` in section 5 is the sport and esports slam, a different curve. One motion family, fast start and long settle, taught in two schools of sharpness; pick one school per film (or the package's, `family-broadcast-news.md` section 2) and log it.

| School | After Effects keys | Curve in code | Progress at 25 / 50 / 75 percent of the time | Use |
|---|---|---|---|---|
| Hard expo-out (`newsSnap`) | Outgoing influence about 0-17 percent with a first-frame velocity spike (the tutors read 700-6600 px/s in their comps), incoming influence 100 percent | about (0.12, 1, 0, 1); range (0.10, 1, 0, 1) to (0.17, 1, 0, 1) | 0.94 / 0.99 / 1.00 (peak speed in the first 3-6 percent of the move) | Keywords, counters, discs and pills that must land at once and then settle for a long tail |
| Calm broadcast (`newsCalm`) | Outgoing influence 17-33 percent, incoming 84-100 percent, both speeds 0 (close to Easy Ease, "never sharp"); entries 1.1-1.9 s | about (0.25, 0, 0.08, 1); range (0.17, 0, 0, 1) to (0.33, 0, 0.16, 1) | 0.50 / 0.85 / 0.97 (range 0.34-0.62 / 0.81-0.88 / 0.96-0.98) | Programme promos, slow reveals and sweeps, the camera |

**Mapping After Effects influence to a cubic-bezier.** For one move of distance d over duration T, with the first key's outgoing speed v_out and influence a, and the last key's incoming speed v_in and influence b (influence as a fraction): k_out = v_out x T / d, k_in = v_in x T / d, and the curve is cubic-bezier(a, min(1, a x k_out), 1 - b, 1 - b x k_in). Easy Ease (33 / 33 percent, speeds 0) gives (0.333, 0, 0.667, 1), the row in section 5. A y value above 1 would overshoot: clamp it to 1 unless the reference measures an overshoot. Speeds are temporal (value per second), and for a position along a curved path they are speeds along the path; a curved path in After Effects (bent bezier handles on the position key) is a curved path in code too (an arc or a quadratic path), not a straight tween with a different ease.

**Shared curve and landing window.** Elements that move together share one curve and land inside the same 25-45 f window (1.0-1.8 s at 25 fps); the driving shape moves first and the others follow by 1-2 f; inside a shot, entrances land within frames 25-62 (1.0-2.5 s) of the beat while secondary moves (an arc, ticks) keep going for 3-6 s. An element becomes visible as it lands: ramp its opacity in the last part of its travel, never let it show while it slides (motion blur on the fly-in is the exception where the package measures it).

**Two-null overlap (a move never stops).** Chain two nested wrappers (outer and inner node, `camera.md` section 3); the second move starts inside the first, at about 40-60 percent of its duration, so the summed speed never reaches zero between them. Measured in one promo project: the camera's first move z 870 to 0 in 1.18 s on influences 16.8 / 100 percent (hard school, on the camera), the second z 0 to 736 starting at 0.65 s and running to 2.4 s; an entry on a curved path over 1.12 s on influences 33 / 84 percent (calm school) with a peak above 3000 px/s. In code: two nested elements each with its own tween, or one transform that sums both moves per frame. The camera rule "ease-in-out on segments" (`camera.md` section 3) is replaced in this scope by these curves and by the measured eases of `camera.md` section 8; springs and back curves stay off the camera.

Sources: product-launch-motion (technique.md, MIT), hyperframes skills (gsap easing adapter, spring dampingFraction table, overlap law), motion-interaction-studio (named curves, spring model), Barty-Bart motion-graphics (presets), claude-motion-design (k/d presets), claude-remotion-skill (theme), diffusionstudio lottie (anchors), huashu-art-motion (slam spring, SwiftUI mapping), motion-video-kit (smootherstep, measured hinge keys), ideas from remotion skills and vibe-motion (rewritten); section 7 from the reel tutorials of Muhamd Helal and Ahmed Maher and a promo project's keyframe values (ideas only).
