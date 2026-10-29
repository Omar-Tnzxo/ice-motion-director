# Shot mapping and the stats contract

Read this when writing the plan. Shot-by-shot mapping is the core of a style remake: every planned shot cites the reference shot whose technique it uses, and the film's measured stats stay within plus or minus 30 percent of the reference.

## 1. Order of work

1. Split the reference shot list (`TIMELINE.md`) into sections: opening, each selling point or story beat, climax, ending.
2. Confirm the reference's peaks with 12 fps strips and write `peaks.json` (`climax-duel.md` sections 1-2). Then design our peaks first: which planned shots are hero shots, what their hit frame is.
3. Map every other shot to a reference shot: `ref_shot`, `ref_what`, engine-ready `camera`, `anchor`. Time everything by meaning (`word-anchored-timing.md`): words, beats, actions; never copied reference seconds.
4. Carry elements only with their reasons (owner decision, 2026-10-29). An element of the reference (text, shape, cutout, map, colour wash, transition, a sound that marks it) enters the plan only with its `REASONS.md` row (`notes-files.md` section 6) and only where the new script holds an instance of the same trigger kind: each appearance names its row and the word or sentence of the new script that switches it on, and it lands on the role its row names (the speaker or guest stays lit: `ice-edit/references/layers-and-isolation.md`, section "The speaker stays lit"). An element with no row, or whose known trigger kind has no instance in the new script, is cut and listed under `cut_elements` with the reason; it is never copied blind. A measured element whose meaning or trigger kind is `unknown` is not cut for lacking a guessed reason: a measured fact is a reason, so it is kept at its measured place (the matching passage of the new film) and amount with the reason `measured: <REASONS row>` (written `measured: <ref-id> REASONS.md #<row>`, the form the storyboard linter reads: the `ice-qa` skill, `references/storyboard-lint.md` section 3b) and named on the review card, its `unknown: <what would settle it>` left open in `REASONS.md`. The finishing layer follows the same rule: an effect of the "Finishing layer" table of `ANALYSIS.md` goes only on the shots where its where and why hold (`measuring.md` section 9).
5. Carry the fixed marks (lesson L10; scope: remakes and edits that follow a reference with an organisation's identity). Every fixed mark of the reference (`measuring.md` section 11) becomes a `fixed_marks` row of the plan on the screen layer (`layer: screen`: the digital camera never moves it and flashes never hit it), at its measured slot and size, on every passage of the new film that matches a passage where the reference shows it. Which mark fills the slot follows the `identity` choice: `rights-and-modes.md` section 1, "Fixed identity marks". A slot is never left empty because a mark was not fetched.
6. Carry depth, 3D and camera (lesson L12; scope: general, any video made with a reference; the principle: `measuring.md` section 12). Every depth or 3D element of the reference (each kind in `depth.json` `elements_3d`, each push-through, the planes and their parallax, the depth of field) maps to at least one shot of the new film, on a trigger of the same kind in the new script, with its build route `build:` one of `css-3d`, `threejs-hyperframes`, `remotion-three`, or `blender` when Blender is installed, chosen with `ice-motion/references/depth-and-3d.md`, "Build routes for depth and 3D". The plan's share of frames with the camera moving matches the reference's (section 4). An element with no route is a finding, never a silent drop: write it in `open_questions` with what would build it (an install, a model, a render), tell the user, and the depth gate (`ice-qa/references/motion-density.md`, "Depth and camera against the reference") still counts it as missing.
7. Write `ice/plan/shots.json` and `ice/plan/storyboard.md`.
8. Check the contract (section 4), row by row against `shot_details`, the pacing and depth numbers, and variety (section 5). Fix mismatches or write the reason in the shot's `notes`.
9. At stage 06 the storyboard, with a short explanation, is the preview for approval. No final production before the plan is approved. Who approves follows the router's stops table (`ice-motion-director/SKILL.md` section 5, "Stops"): the user on the 06 review card in step mode; in auto mode the user at the one preview stop when the session is interactive and the user did not say not to ask, otherwise the critic and the approver. The storyboard and the key frames together are that preview.

Engine choice and render: the ice-engines skill. Style catalogs: the ice-styles skill. Cuts, camera, easing: the ice-motion skill.

## 2. Plan schema (`plan/shots.json`)

```json
{
  "version": 1,
  "changelog": ["v1: first plan"],
  "reference": "<ref-id>",
  "mode": "<mode>",
  "format": { "width": 0, "height": 0, "fps": 0, "duration_s": 0 },
  "music": { "source": "user | licensed | generated | none", "bpm": 0, "offset_s": 0, "license": "<slot>" },
  "borrowed_from_reference": ["<technique 1>", "<technique 2>"],
  "shots": [
    {
      "id": "S<n>", "start_beat": 0, "end_beat": 0, "start_s": 0, "end_s": 0,
      "anchor": "<word, moment or beat this shot is bound to (word-anchored-timing.md)>",
      "summary": "<what happens>", "action": "<actions in time order; hero shots to the frame: anticipation, burst, hold>",
      "reads": ["<what the viewer must understand, and when>"],
      "ref_shot": 0, "ref_what": "<the technique used in that reference shot>",
      "camera": { "move": "<static | push_in | pull_out | pan | tilt | orbit | truck | crane | rack_focus>",
                  "pace": "<still | slow | medium | fast>", "lens_mm": 0,
                  "from": { "fill": 0.0, "angle": 0 }, "to": { "fill": 0.0, "angle": 0 }, "region": "<slot>", "dof": "<slot>" },
      "scene_setup": "<scene + camera setup id, for the variety check>",
      "transition_in": "<slot>", "transition_out": "<slot>",
      "text_overlay": [{ "text": "<user copy only>", "at": [0, 0], "position": "<slot>",
                         "cites": "<the exact spoken phrase>", "cites_occurrence": 1, "subject": "<role word>", "lead_frames": 0 }],
      "elements": [{ "element": "<REASONS.md element>", "reason_row": 0, "trigger": "<word or sentence of the new script>", "cites": "<the exact spoken phrase>", "cites_occurrence": 1, "subject": "<role word>", "lead_frames": 0, "on": "<role it lands on>", "in": "<cue>", "out": "<cue>", "layer": "<rig | screen>", "build": "<css-3d | threejs-hyperframes | remotion-three | blender: depth and 3D elements only>" }],
      "finishing": [{ "effect": "<effect from the Finishing layer table>", "amount": "<measured amount>", "why": "<its reason, true for this shot>" }],
      "hero": false, "notes": ""
    }
  ],
  "cut_elements": [{ "element": "<REASONS.md element>", "why": "<no reason row | no trigger in the new script>" }],
  "fixed_marks": [{ "mark": "<whose mark, in plain words>", "x_pct": 0, "y_pct": 0, "w_pct": 0, "opacity": 100, "from": "<cue>", "to": "<cue>", "layer": "screen", "identity": "<as they are | the user's | a mix>" }],
  "depth": { "camera_moving_share": 0, "layers": 1, "parallax_ratio": null, "push_through": 0, "elements_3d": [], "dof": { "present": false, "blur_px": null } },
  "peaks": [ "see climax-duel.md" ],
  "required_inputs": [{ "id": "<slot>", "kind": "<lyrics | design image | product photo | logo | audio>", "label": "<slot>", "why": "<slot>" }],
  "open_questions": []
}
```

Rules:
- Every shot carries `ref_shot`, `ref_what` and a `camera` spec the engine can use directly. A shot with no reference counterpart says `"ref_shot": null` and gives the reason in `notes`; keep these rare.
- Shots carry both beats and seconds when there is music; without music, beats may be omitted.
- Every entry in `elements` cites a `REASONS.md` row and a `trigger` taken from the new script; `finishing` lists only effects whose measured row holds for this shot; whatever is left out is in `cut_elements` (section 1, item 4).
- Every text overlay and every graphic element carries the reason fields: `cites` (the exact spoken phrase of the new script it answers), `cites_occurrence` (1 for the first time that phrase is said, 2 for the second), `subject` (one role word of `notes-files.md` section 6: `speaker`, `discussed person`, `voice`, `place`, `object`, `programme`, `whole frame`, equal to its row's role), `lead_frames` (the element's first frame minus the onset frame of that phrase's word; negative = before the word, inside the row's measured range). No planned element breaks a rule of the `Never:` field of `plan/FIDELITY.md` (`fidelity-contract.md` section 1).
- `fixed_marks` holds the slots of section 1, item 5; `depth` holds the planned values of section 1, item 6, and the film's `<render>.depth.json` is written from it and the build (`measuring.md` section 12). Every depth or 3D element in `elements` names its `build` route.
- `required_inputs` lists only what the user alone can give. Before approval each is provided or explicitly skipped; in auto mode with no answer, it is replaced by a labelled placeholder, logged in `ice/DIRECTION.md` and listed in the delivery note, so production never stalls on a missing file.
- `open_questions`: real user decisions only, at most 4. Step mode: they go on the review card. Auto mode: each is decided, logged and reported.
- Each user-driven plan change: `version` plus 1 and a changelog line. If a change sacrifices the reference's core (removes the climax, turns a two-character story into a solo), say so explicitly.

## 3. Camera must match

The camera move type and pace class of each shot match its reference shot: a slow push maps to a slow push. If the reference moves in nearly every shot, the plan may not contain dead static shots. On one take reframed digitally, the match is per move and per frame, not per shot: the moves, their scale ratios and eases from `measuring.md` section 12, and the share of frames with the camera moving. When the engine's speed differs, scale it: speed scale = reference speed / our measured speed (floor about 0.2), then re-measure.

## 4. The stats contract (plus or minus 30 percent)

| Stat | Reference source | Allowed range |
|---|---|---|
| Mean shot length (s, and beats when musical) | `pacing.mean_shot_s` (needs 3 detected shots or more) | within 30 percent |
| Cuts per minute on detected cuts | `analysis/craft-measure.json` (`craft_gate.py measure` of the reference) | within 30 percent (the pacing gate on the render: `ice-qa/references/motion-density.md`, "Pacing against the reference", "On the render") |
| Text-only card share of runtime | measured (`measuring.md` section 3) | within 30 percent |
| Low-key (dark) shot share | `look_summary.low_key_shots` | within 30 percent, and at least plus or minus 0.05 |
| Moving-camera shot share | `look_summary.moving_camera_shots` | within 30 percent, and at least plus or minus 0.05 |
| Camera pace mix per section | `shot_details[].camera.pace` | same class per mapped shot, or a camera speed within 30 percent of the reference shot's (two close speeds either side of a class line are not a mismatch) |
| Stillness ratio (when measured) | `stillness.ratio` | within 30 percent, and at least plus or minus 0.05 |
| Share of frames with the camera moving, parallax ratio, push-throughs | `analysis/depth.json` (`measuring.md` section 12) | within 30 percent; every 3D kind and the depth of field present (the gate: `ice-qa/references/motion-density.md`, "Depth and camera against the reference") |
| Longest event gap, events per minute | `analysis/events.json` (`measuring.md` section 10) | the pacing gate's own limits, not 30 percent: `ice-qa/references/motion-density.md`, "Pacing against the reference"; copied into `plan.reference` for the edit plan |

The "at least plus or minus 0.05" on a share keeps a share near zero from being held to a hundredth. The plan is checked against this table at 04. After rendering, `compare.py` detects our film's own cuts with the detector the reference was measured with (`analyze.py`, PySceneDetect, threshold 22), never the plan's spans, measures each detected shot with the same functions, maps it to the plan shot that holds its middle (and through it to the reference shot), and checks every row it can measure (mean shot length and beats, low-key share, moving-camera share, camera pace per mapped shot, stillness ratio; the text-only card share stays with `measuring.md` section 3):

```
python <skill>/scripts/compare.py --analysis <ice>/reference/<ref-id>/analysis --plan <ice>/plan/shots.json \
  --video <render.mp4> --out <ice>/review/remake/compare
```

It writes `compare_*.jpg` (one pair per detected shot), `compare.json` and `contract.json` (each stat, both values, the allowed range, `ok`, and the planned cuts it did not find as leads), and exits 1 outside the contract (2 on bad input or a missing package). Blocking after assembly at 07 and confirmed at 09; a run on one chunk reads as a lead. A stat outside its range is cleared by a fix re-checked, or by its reason logged in `ice/DIRECTION.md` (for example a platform the user named that forces shorter shots, or a chosen style whose own measure differs) together with an exemption row of the craft plan lifting `contract:<stat>` (`mean_shot_s`, `mean_shot_beats`, `low_key_shots`, `moving_camera_shots`, `stillness_ratio`, `camera_pace`) whose source kind is user or style; the reference never excuses a departure from itself. Row format: the `ice-direction` skill, `references/treatment.md` section "Craft plan". Numbers flag the gate; open `compare_*.jpg` and judge the craft by eye.

## 5. Variety and arc (apply after mapping)

- The same scene plus the same camera setup may not exceed 40 percent of runtime. Compute it from `scene_setup`.
- Between two climaxes, change scene, viewpoint or color world.
- In a build-up, something new appears every 1-1.5 s (camera move, composition change, new element). Never hold one composition for 3 s waiting for the hit.
- An emotion arc, not just rising energy: the subject wants something, meets an obstacle or a wait, and gets it at the climax.
- A hook within the first 3 s. The ending calls back the climax emotion (a rhyme with the opening).
- Narrated films: draft the voiceover first and lay out shot times from its real length (`word-anchored-timing.md`).

## 6. Scene order (scoped conflict)

| Mode | Rule |
|---|---|
| Structural fidelity, frame-locked, translation | Follow the reference's section structure; every shot cites its reference shot. Content, characters and copy stay original. Re-sequence when the user's content demands it and note why. |
| Inspiration, and LOOK-only references | Never mirror the reference's scene order or cut positions; take its governing rule, measured numbers and the tools behind its look. Copying its beats reads as plagiarism. |

## 7. storyboard.md

Logline; world and color arc; motif; protagonist emotion arc; a shot table with beats, transition in, event, reaction, camera, `ref_shot`, and each element with the word or sentence that triggers it; the cut elements with their reasons; the fixed marks with their slots; each depth or 3D element with its shot and build route; the scene-setup share calculation; the stats table from section 4 with reference value, plan value and percent difference.
