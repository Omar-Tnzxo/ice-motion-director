> From the founder's commercial-motion-design skill (Omar-Tnzxo, Apache-2.0 in this repo), references/composition-and-camera.md. Unchanged except this notice. Move durations and camera policy by type: `camera.md`.

# Composition and semantic camera reference

Camera motion is narrative punctuation, not a global scale effect. Adobe distinguishes camera position, point of interest, zoom, angle of view, focus distance, and depth of field; keep those roles conceptually separate even in a 2D implementation.

## Frame contract

For each scene record:

```text
focal bbox: x, y, width, height
safe margin: x, y
camera anchor: focal center
start zoom / apex zoom / settle zoom
camera verb: hold / push / pull / truck / orbit / reframe / impact
semantic purpose: inspect / commit / reveal / compare / release / bridge
foreground z / focal z / background z
portrait overrides
```

## Text focus-unit contract

Before animating important copy, split it in reading order and record:

```text
unit ID / exact words / semantic role
text bbox and optical center
camera start / arrival / zero-velocity dwell / departure
minimum readable frames
next phrase or proof target
handoff direction / occlusion / sound bridge
```

Do not rely on scale alone. Combine scale with a small target-anchored reframe when necessary, and let the previous unit remain legible only if it supports the sentence rather than competing with the new owner. During the dwell, reduce camera velocity to nearly zero; micro parallax may continue below the threshold that disturbs reading.

### Camera necessity test

For every proposed camera move, render or mentally compare a locked-camera alternative. Keep the move only if it supplies at least one function the static composition cannot supply as clearly: reading-order control, inspection of small evidence, reveal of scale or context, continuity between separated spaces, or reinforcement of a decisive physical action. A new sentence, a musical beat, or an entering icon is not sufficient justification by itself. When the elements already create the hierarchy, let them move inside a stable frame.

Useful phrase transitions:

- push from a general claim into one highlighted word, then pull out to the mechanism that proves it;
- truck along a sentence only when the reading direction and composition support the move;
- use a word's underline, mask, stroke, or geometry as the incoming proof object's path;
- let a proof object occlude the outgoing phrase, then inherit its screen direction and color.

## Dimensional scene contract

For a 3D or simulated-3D beat, record camera position and point of interest separately from object transforms. Require at least two depth planes with different parallax and a readable occlusion event. Add contact shadows or projected shadows that agree with one light direction. Keep text on a camera-facing plane unless rotation is itself the explanation.

An exploded-view mechanism should show a cause for separation, preserve shared alignment guides, and recombine or hand off to the next owner. A perspective transform without parallax, occlusion, or depth-dependent scale is not sufficient evidence of 3D.

## Choreography

| Camera verb | Use when | Required anchor behavior |
|---|---|---|
| Push-in | inspect a mechanism or commit to an action | aim at the semantic target, not canvas center |
| Pull-out | reveal result, scale, context, or secondary benefits | preserve the outgoing focal point until the reveal reads |
| Lateral truck | continue direction or move between related spaces | maintain parallax and screen direction |
| Orbit | reveal form, dimensionality, or relationship | keep point of interest stable and avoid unreadable text rotation |
| Reframe | transfer attention between distinct claims | move only after the new target has a visible cause |
| Impact move | reinforce a real collision or musical hit | use a brief displacement and damped recovery; never continuous shake |

Do not animate camera and focal object with the same transform by default; that often cancels relative motion and produces a fake zoom. Record their screen-space paths separately. During a handoff, the camera may anticipate by a few frames, arrive with the focal impact, then settle after the object.

For 2D camera simulation, calculate translation around the target anchor:

`screenPoint = cameraAnchor + (worldPoint - cameraAnchor) × zoom`

Use optical offsets only after the numeric anchor is correct. A push/pull must not crop the target's motion-blur envelope, shadow, or Arabic copy.

## Optical checks

- Measure visible bounds after transforms, not layout bounds before transforms.
- Include glows, strokes, and drop shadows when checking crop risk.
- Avoid centering purely by bounding boxes when a shape has unequal visual weight; apply small documented optical offsets.
- Keep Arabic line widths compact enough to read in one fixation.
- Do not put title and main UI on the same vertical band unless one clearly dominates.

## Responsive art direction

Landscape often supports side-by-side explanation and evidence. Portrait should usually stack title, focal UI, and proof. Reduce horizontal camera travel, enlarge touch targets and semantic icons, and test the entire 9:16 safe area rather than reusing 16:9 percentages.

Retarget the choreography, not just the coordinates: convert wide trucks into shorter vertical reframes when appropriate, recompute focal anchors, parallax distances, orbit radii, and entry/exit vectors, and preserve the same narrative arrival frame.

Source basis: [Adobe After Effects camera layers and points of interest](https://helpx.adobe.com/after-effects/desktop/work-with-layers/camera-layer/cameras-lights-points-interest.html) and BUCK's [Sonos case study](https://buck.co/work/sonos-move), where continuous camera movement and echo lines jointly express freedom of movement and bridge spaces.
