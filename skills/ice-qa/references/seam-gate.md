# Seam gate

A seam is a boundary between shots or scenes. The seam gate proves numerically that each planned seam does what the plan says: the outgoing side is still moving, the incoming side is already moving in the same direction at a similar speed, and the two are never visible together unless the seam is a designed match or morph. The vector law itself (axis, direction, speed, phase, carriers, the current) is owned by the ice-motion skill; this file is the check. Sources: hyperframes motion doctrine and seam-gate reference (Apache), hyperframes-community-skills vox-explainer (Apache), motionmaxxing (Apache), text-to-lottie chapterization (MIT), PolyForm explainer sources (ideas rewritten).

## 1. When it runs

- Every film with planned seams (all multi-scene films). It runs after the build and again after any edit to a scene's first or last ~1 s, after re-timing to a new voiceover, and after any VO regeneration: edits re-open the seam.
- For films joining material from another tool (a painted or p5 segment), verify that segment's seams numerically too; material from a generator is not final grammar.

## 2. The ledger (`ice/plan/ledger.json`)

Written before the master timeline, one row per seam:

```json
{
  "fps": 30,
  "seams": [
    { "id": "<from>-><to>", "cut": 0.0, "technique": "<cut name from the ice-motion catalog>",
      "exit":  { "selector": "#<outgoing carrier>", "axis": "x", "dir": -1 },
      "entry": { "selector": "#<incoming carrier>", "axis": "x", "dir": -1 } },
    { "id": "<from>-><to>", "cut": 0.0, "type": "match-cut",
      "carrier": { "out": "#<outgoing object>", "in": "#<incoming object>" } }
  ]
}
```

Values are slots (illustration only): `cut` is seconds on the master clock, the frame the incoming side ignites; `type` is `cut` (default, full vector checks), `match-cut` or `morph` (carrier continuity and overlap only); `axis` is `x`, `y` or `z` (z = scale); `dir` is the sign of motion (x -1 leftward, y -1 upward, z +1 push or growing, z -1 pull or shrinking); `selector` is the element that carries the seam motion (the wrapper when the master timeline moves it, the inner hero when the motion is authored inside the scene); `entry.scanRoot` (z seams) is the subtree scanned for sign-fighting entrances; `carrier` is optional on cuts and required on match cuts and morphs. If a row's exit and entry vectors mismatch, fix the plan, not the easing.

## 3. Running it

```
node scripts/seam-gate.mjs verify --ledger ice/plan/ledger.json --url http://localhost:<port>        # running preview
node scripts/seam-gate.mjs verify --ledger ice/plan/ledger.json --comp-url file:///<abs>/index.html  # a page with a seek hook
node scripts/seam-gate.mjs verify --ledger ice/plan/ledger.json --project <dir> --server-cmd "<preview command using {port}>"
node scripts/seam-gate.mjs probe --t <cut seconds> --url <preview>      # list movers around a cut to write ledger rows
```

Exit 0 = every seam passed; 1 = a FAIL; 2 = the tool could not run. The page must expose a seek hook: the HyperFrames player, `window.__seek(t)`, `window.renderAt(t)` or `window.seek(t)` (the render-html.mjs contract of the ice-engines skill; a returned promise is awaited, then two animation frames pass before sampling), `window.__timelines`, or gsap. A renderAt or seek page that declares `window.__ready` or `window.ready` is sampled only after it becomes `true`. The viewport takes the composition's size from `data-width`/`data-height` or `window.DEMO`. Restart a running server after edits or you verify a stale build.

## 4. What each check enforces

| Report row | Rule | Threshold |
|---|---|---|
| `ledger` | Exit and entry vectors match in the plan (axis and direction) | exact |
| `exit-moving`, `entry-moving` | No settled exit before the cut, no entry from rest after it | static below 15 px/s (x, y) or 0.04 scale/s (z), measured between cut-0.1 s and cut-1f, and cut+1f and cut+0.1 s |
| `exit-direction`, `entry-direction` | Measured sign equals the ledger sign (a mirrored zoom fails) | sign |
| `speed-match` (WARN) | Entry velocity about equal to exit velocity | ratio beyond 3 (or under 1/3) warns |
| `zero-overlap` | One side visible per frame, never both: a cut is not a dissolve | cumulative opacity > 0.04 at cut-1f for the incoming or cut+1f for the outgoing fails |
| `z-sign-scan` | The incoming scene's own entrances do not scale against the seam's Z sign | any element with scale velocity >= 0.04/s of the opposite sign |
| `carrier-*` | Carrier rect continuity across the cut, ancestor scale included | centre within 12 px, size within 5% |

Velocities are measured on bounding rectangles (centre for x and y, width ratio for z), so ancestor transforms count.

The usual cause of a zero-overlap FAIL: a clip whose `data-start` precedes its entry tween is shown at its initial opacity. Set the initial hidden state and `data-start` equal to the cut time, never earlier. Seek safety: author entrances as `fromTo(..., {immediateRender:false})`; full-frame incoming wrappers start hidden in HTML or CSS.

## 5. Without a DOM (video, canvas, Lottie, edited footage)

The script cannot measure pixels inside canvas or video. Use frames:
- Render the outgoing last frame and the incoming first frame, plus a contiguous strip of 3-8 frames each side. For cut-on-action, the outgoing side is still moving and direction and velocity match; if the object reaches its final target on the seam, it is a settle cut, not a cut on motion. A masked swap has no gap frame where neither side is composed (text-to-lottie).
- Zoom-isolation seams: centres within about 30 px and sizes within about 10%; fix by measuring, not eyeballing (vox-explainer).
- The composite speed between two overlapping stages never reaches zero; do not measure eases from player seek timestamps, which snap to the frame grid (vox-explainer).
- Carry score per cut (idea from the PolyForm explainer sources, rewritten): a carried survivor (moves at least 2% of the diagonal or scales 10% or more across the cut) scores 1, an anchored large unchanged survivor 0.5, a bare cut 0; a film averaging under 0.5 fails, under 0.7 warns. In that source this continuity score separated accepted from rejected cuts where no rhythm metric did (rejected 0.00 and 0.40, accepted 0.56 and 0.75). A one-world camera film has few boundaries: a pass over fewer boundaries than the beat sheet has is not evidence; judge by eye.
- Velocity-matched transition anti-patterns to flag: crossfades, full off-screen exits, an in-out ease across a cut, equal cascade gaps, zoom-through on body text, an unpainted root background showing at the cut (vox-explainer).

## 6. Scope

The seam gate applies where the type's transition policy (ice-motion skill, per film type) asks for cut-on-motion seams. Where the policy allows dissolves (calm brand films, some art films and documentary edits), the `zero-overlap` row is expected to fail on those seams: mark them `type: "morph"` with a carrier, or list them in the report as policy-allowed dissolves. Never use the policy to excuse an accidental dissolve.
