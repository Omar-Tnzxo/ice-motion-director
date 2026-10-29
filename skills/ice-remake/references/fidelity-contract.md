# Salience lock and the reference-fidelity contract

Read this before planning in structural fidelity, frame-locked or translation mode. It stops the most common remake failure: drifting from the reference's hard, defining mechanics to an easier, more familiar style while keeping only its mood.

## 1. Salience lock (write it before any build)

Presence in the reference is not prominence. A texture that appears in every frame can still be a supporting motif. Name, in `plan/FIDELITY.md`:

| Field | Content |
|---|---|
| Dominant language | The one or two mechanisms a viewer would name if asked "what is this video like" (a continuous camera through scale, objects handed across every cut, type that becomes the layout, a single morphing shape) |
| Secondary motifs | What supports the dominant language (grain, paper edges, tape, a color accent, a sound tic) |
| May translate | Surfaces that may change freely: copy, language, product, logo, accent color, legal substitutes |
| Forbidden shortcuts | The easier substitutes this particular reference tempts (section 3) |

A mechanism or motif enters this contract with its reason: the element rows it uses in `REASONS.md` (`notes-files.md` section 6). An element with no reason is never a must-preserve item; it is cut (`shot-mapping.md` section 1, item 4).

Salience inversion fails the contract: when a secondary motif becomes the whole film (a reference of complex object choreography with a little paper texture turns into a paper-texture film), the remake fails fidelity even though every element came from the source.

## 2. Must-preserve mechanisms

List at least two. Each entry:

```
- id: M<n>
  mechanism: <observable behavior, measured where possible>
  evidence: <reference times and evidence files>
  why it is hard: <what makes it costly to build>
  implementation: <how the target will realize it; engine and technique>
  proof: <the video evidence that will show it survived: strip range, compare sheet, measured stat>
```

Map every mechanism to an implementation and a proof before production. An unmapped mechanism stops work until it is planned. Only when it truly cannot be planned may it be dropped: in step mode the user accepts the loss explicitly on the review card; in auto mode the closest plannable substitute is chosen (never one from the forbidden substitutions, section 3), and the loss is logged in `ice/DIRECTION.md` and reported in the delivery note.

## 3. Forbidden substitutions

In a preserving mode, "faster" or "easier" is never a reason for any of these:

| Reference has | Tempting substitute |
|---|---|
| Object choreography carrying the message | Text cards |
| Complex masking or shape handoffs | A plain wipe |
| Objects or camera carried across scenes | Independent hard cuts |
| Spatial motion (depth, travel, scale change) | Texture or decoration |
| Real 3D or perspective | Flat decoration; a flat image rotated to fake depth |
| Dynamic framing | The same centered composition repeated |
| Real assets (the user's product, UI, photos) | Placeholders |
| A climax built from motion, composition and sound | A white flash covering the moment |

A deviation that looks good is still a deviation. Any structural change (shot rhythm, focal scale, transition family, type entrance, density curve, camera behavior, world alternation, ending) needs a written justification in `ice/DIRECTION.md`.

## 4. Image layer

Classify the reference's imagery before building: filmed, generated, stock, illustrated, code-drawn, screen capture. "Exactly like this" is judged on imagery first. If the target's imagery route differs (code-drawn instead of filmed), agree it with the user before production and state the gap.

## 5. Opening studies in a demanding remake

When the reference is hard, build 2-3 short opening studies (the first 2-4 s) and choose first by mechanism coverage, then phone readability, then originality. Never pick the busiest study by default.

## 6. Anti-shortcut self-check (run on the plan and again on the first render)

- Did the output keep the mechanics, or only the mood?
- Did scene construction get simpler than the reference?
- Did it collapse into cards, paper, grain or wipes?
- Did the density curve flatten (equal energy everywhere)?
- Did a component library or engine default decide the art direction?
- Did a secondary motif get promoted?
- Does every element carried over have its `REASONS.md` row and a trigger in the new script, and does every finishing effect sit only where its measured row says (`measuring.md` section 9)?
- Is every must-preserve mechanism visible in motion? Compare it on a 12 fps strip, never on a paired contact sheet of stills.

Any yes or failed check returns to the plan.

## 7. Scope

| Mode | Applies |
|---|---|
| Structural fidelity, frame-locked, translation | Full contract |
| Mix | Per gene: the contract applies to the mechanisms adopted from each reference |
| Inspiration | Not applied; use the governing-rule extraction in `rights-and-modes.md` |

Skin versus grammar and medium mismatch are scoped in `rights-and-modes.md` sections 4 and 5. Adapt the reference to the user's subject, product, words and platform with `adaptation-lenses.md`.
