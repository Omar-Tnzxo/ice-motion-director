> From the founder's commercial-motion-design skill (Omar-Tnzxo, Apache-2.0 in this repo), references/continuous-product-journey.md. Changes: dash characters replaced, validator path names this skill's script, Arabic section points to ice-arabic and ice-type for shaping and reading measurement.

# Continuous product journey and object-role mutation

Read this reference when a commercial must feel like one authored film rather than a sequence of sections, especially for product UI, no-voice-over explainers, short launch films, or code-rendered motion.

## Core model

Design a chain of semantic states around one **visual protagonist**. The protagonist may change shape, scale, material, depth, label, and even function, but its identity must remain traceable.

`origin → invitation → user action → product mechanism → selected state → result → brand/CTA resolve`

This is not a compulsory story order. It is a test: the viewer should be able to answer, “What object or state carried me from the previous idea into this one?”

### Identity is not appearance

A search icon can stretch into an input, the typed query can become a result card, the selected card can unfold into a player, and the player control can resolve into a brand mark. These are different roles of one causal chain. Preserve identity through at least one measurable inheritance channel:

- exact transform anchor;
- contour or silhouette;
- contained content;
- direction and velocity;
- mask or aperture;
- material state;
- sound bridge;
- causal action with a deliberately motivated cut.

Merely using the same color is not identity inheritance. Replacing one centered object with another after a fade is not a transformation.

## Journey contract

Before storyboarding, write:

- `protagonistSemanticId`: stable root identity for the film;
- `openingState`: what the viewer first understands;
- `stateChain`: ordered state and role mutations;
- `closingState`: the final meaning;
- `closureType`: brand resolve, CTA resolve, result resolve, or intentionally open;
- `closureEvidence`: the visible relationship between opening and ending;
- `hardCuts`: every hard cut with a narrative reason, music cue, and continuity channel.

Each state-chain row records:

`scene → semantic ID → role → state → inherited from → handoff method → visible proof`

Local scene continuity is not enough. A film can pass scene-to-scene transform checks while silently swapping the protagonist every time. The root identity and role mutation chain prevent this loophole.

## State density, not cut density

Professional short motion can contain many semantic states with few hard cuts. Expand, embed, extract, stack, browse, select, fold, dock, route, and resolve objects within the same spatial world. Use a hard cut only when it improves comprehension, contrast, scale, or musical structure.

For each hard cut document:

- what discontinuity requires a cut;
- the exact cue or phrase boundary;
- what survives the cut: position, silhouette, motion vector, sound, color role, content, or meaning;
- why an inherited transformation would be weaker.

“It lands on a beat” is not sufficient without measured audio evidence. “The next scene starts” is never a reason.

## Text must act

In a text-led film, text is not a heading above the action. Give each focus unit an event verb and attachment:

- type into a real control;
- become or reveal the search result;
- label the object while moving with it;
- wrap around the selected state;
- compress into the output;
- become the mask, path, frame, or final lockup.

Record `eventVerb`, `attachment`, `stateA`, `stateB`, and `renderedProof`. `proofOwner` and `nextTarget` alone are insufficient because they can be filled with plausible strings while the rendered text remains static.

Static text is allowed for a deliberate label, legal line, or final lockup. Its stillness must create contrast and reading space.

## Functional 2.5D

Use depth to explain browsing, hierarchy, routing, selection, assembly, or transformation. A valid 2.5D beat specifies:

- foreground, midground, and background roles;
- camera point of interest and perspective;
- measurable relative parallax;
- occlusion order;
- light direction and contact/cast shadow behavior;
- the semantic purpose of depth;
- the frame and transform where the dimensional object recombines with the continuing protagonist.

CSS tilt, `translateZ`, drop shadow, or a rotating card is not proof. If the same idea is equally clear flat, depth is decorative and should be removed or redesigned.

## Camera discipline

Let object motion carry most attention changes. Move the camera only for reading order, inspection, scale reveal, spatial continuity, or a decisive action. A short push is useful when it changes what the viewer understands; it is noise when it merely makes a beat feel busier.

Prefer a locked camera while a phrase is being read. Settle velocity near zero during the readable dwell. Use a pull-back when the viewer must discover the relationship between states, not simply because the next scene is larger.

## Music and causal sound

Map the actual final track into energy zones, phrase changes, rests, fills, decisive onsets, and ending cadence. Design the film around these zones rather than distributing scenes evenly.

- Dense musical region: rapid state progress, browsing, stacking, or selection.
- Sparse region or rest: typing, reading, inspection, or suspense.
- Strong onset: decisive contact or state confirmation.
- Ending cadence: reduce semantic density and let the closure settle.

Do not animate every subdivision. One strong contact can own a phrase. Every SFX must follow a visible cause through preparation, travel, contact, and tail. A mouse press sounds like a mouse press; a card detent differs from a material impact; a wordmark resolve may need no sound beyond the music.

## Arabic and dense-copy adaptation

Never copy the pace of a 9-10 second Latin-script reference directly. Preserve the state relationships, then retime for the real Arabic copy (shaping rules: ice-arabic; reading measurement: ice-type):

- shape and render the approved font first;
- measure the actual line count, bounding box, and visual density;
- use a conservative native reading test or recorded reviewer reading;
- add settle time after the text becomes fully formed;
- shorten copy before shrinking it or accelerating beyond comprehension;
- preserve music alignment by moving the action to another phrase or extending the edit, not by sacrificing readability.

Store locale, reading method, measured read frames, settle frames, and rendered proof in the contract.

## Evidence is an artifact, not a sentence

Do not satisfy the contract with persuasive strings such as “on the beat,” “text is attached,” “parallax is visible,” or “the CTA inherits the brand.” Point evidence fields to actual cue maps, rendered frames, frame measurements, or audit data. Bind music-zone evidence to the SHA-256 of the analyzed final track. Bind text to a semantic ID in the protagonist chain. Bind depth recombination numerically to the outgoing transition transform.

Run the validator (`scripts/validate_motion_contract.py`) with `--project-root` during production and delivery so declared evidence paths must exist. Structural validation can reject missing and self-contradictory contracts; it cannot determine whether a rendered image is truthful. The skeptical render critique and reviewer gate remain mandatory.

## Closure

The ending should resolve the protagonist, not abandon it for an unrelated CTA card. Valid closures include:

- transformed object returns to a recognizable opening silhouette;
- product result docks into the brand mark;
- control becomes the CTA affordance;
- opening question is answered by the final product state;
- intentionally open continuation, documented as such.

Closure is semantic, not merely chromatic. Reusing the accent color does not prove a loop.

## Rejection checklist

Reject the journey when any applies:

- scenes reset their entire object ownership;
- local semantic IDs match but the global protagonist cannot be traced;
- a hard cut has no measured cue and narrative reason;
- text has a lifecycle but no event or attachment;
- depth fields describe decoration rather than function;
- the music map has invented generic zones not derived from the supplied audio;
- the CTA arrives as a new card unrelated to the preceding result;
- reference pace overrides Arabic comprehension;
- the film copies reference artwork, brand assets, palette, UI, or exact sequence.
