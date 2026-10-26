> From the founder's commercial-motion-design skill (Omar-Tnzxo, Apache-2.0 in this repo), references/motion-choreography.md. Changes: dash characters replaced; the matrix example row is marked illustration only.

# Motion choreography recipes

Use these as starting contracts, then tune frame counts to the measured music and the object's scale, mass, and material. Do not paste the same recipe onto every object.

## Physical decision contract

For each moving object record:

```text
mass impression / rigidity / dominant force
start pose / anticipation pose / travel path / contact pose / recovery pose
position path independent from timing curve
peak speed frame / contact frame / final rest frame
secondary parts and follow-through delay
camera response / sound response
```

At 60fps, a crisp commercial action often uses 3-8 frames of anticipation, 6-18 frames of travel, 1-3 frames of contact deformation, and 6-16 frames of damped recovery. These are defaults, not quotas. Large or soft objects need more spacing and recovery; rigid UI state changes need less deformation.

## Recipes

### Throw or drop

- Establish a source and destination; never spawn the object mid-flight.
- Use a curved spatial path when gravity acts. Keep path geometry separate from speed interpolation.
- Rotate according to angular momentum, not a decorative constant spin.
- Accelerate downward during free fall. At contact, compress along the collision normal and widen perpendicular to it while approximately preserving volume.
- Reverse with lower energy for a bounce, then shorten each subsequent interval and displacement.
- Delay flexible appendages, shadows, dust, or container response by 1-4 frames for follow-through.

A simple screen-space ballistic path is `p(t)=p0+v0·t+0.5·g·t²`. Treat `g`, restitution, and damping as art-directed parameters; the trajectory still needs internally consistent acceleration and contact.

### Attraction, suction, or magnetic merge

- Show the force source before the object accelerates.
- Begin with low velocity, increase acceleration as distance closes, orient the object toward the field, then compress or merge at contact.
- Use overshoot only when the receiving material is elastic. A rigid lock should stop sharply with a small structural response instead.
- Pull particles, trails, and audio pitch toward the same attractor; do not let decorations orbit independently.

### Rigid UI closure

- Select or mark the affected range first.
- Remove the range on the approval/contact frame.
- Move downstream elements by the exact removed distance; keep linked media synchronized.
- Add only slight overshoot if the interface language supports it. Do not squash rigid timeline clips like rubber.

### Delete into a bin

Bad: floating bin icons, identical cubic eases, no source, gravity, contact, or container reaction.

Better causal chain:

1. Selected fragments detach from their exact timeline locations.
2. A bin, aperture, or absorbing target opens and becomes the force source.
3. Fragments travel on individually offset but coherent arcs, with spacing that communicates acceleration.
4. Each fragment crosses the rim before disappearing; the rim or lid reacts on contact.
5. The final impact drives the timeline ripple closure.
6. The cleaned timeline, not a duplicate proxy, becomes the next scene's owner.

Use suction instead of gravity only when the target visibly emits that force. Never mix both without a readable change of force.

## Sound-driven motion

Map one visible cause to one sound identity:

| Motion phase | Sound role | Coupling rule |
|---|---|---|
| Anticipation | breath, charge, short reverse | envelope rises with visible stored energy |
| Travel | whoosh, friction, tonal glide | loudness or pitch follows speed, not elapsed time |
| Contact | click, snap, hit, cut | transient lands on the exact contact frame |
| Recovery | resonance, debris, tail | decay ends with visible settle |

Music defines phrase and impact opportunities; it does not excuse moving every object on every subdivision. Preserve rests and let secondary motion answer primary hits.

## Semantic material coverage matrix

Complete this before motion implementation:

| Claim | Observable evidence | Material property | Causal transformation | Next owner | Unrelated decoration removed? |
|---|---|---|---|---|---|
| Illustration only (one product, never a default): remove pauses | selected gaps and linked clips | absence + compression | gaps detach, target absorbs, timeline closes | cleaned timeline | yes |

Every primary claim must have observable evidence and a transformation. The same material may span scenes only when it is connective tissue with the same meaning.

## Evidence basis

- [Walt Disney Animation process](https://disneyanimation.com/process/animation/) identifies timing, staging, squash and stretch, anticipation, follow-through, secondary action, weight, and movement as foundations of believable performance.
- John Lasseter's [SIGGRAPH paper](https://dl.acm.org/doi/10.1145/37401.37407) applies traditional animation principles to computer animation.
- School of Motion's [Power of Animation Principles](https://www.youtube.com/watch?v=mT2Fv5bF6Ik) demonstrates how spacing changes the feel of motion and reviews arcs, anticipation, and timing.
- BUCK's [EA SPORTS FC 24 motion system](https://buck.co/work/ea-sports-fc-24) derives trajectory, formation, momentum, and match cuts from football rather than generic easing.
- [Material choreography](https://m2.material.io/design/motion/choreography.html) separates outgoing, incoming, and persistent elements and recommends shared transformations over competing independent movements.
- Ben Marriott's [animated intro workflow](https://www.youtube.com/watch?v=Ut8bDuNqbLo) shows frame-level cleanup and integrates dedicated music and sound design with animation.

These sources support the principles; numeric frame ranges and equations above are implementation heuristics inferred for short 60fps commercial work.
