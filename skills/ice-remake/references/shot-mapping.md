# Shot mapping and the stats contract

Read this when writing the plan. Shot-by-shot mapping is the core of a style remake: every planned shot cites the reference shot whose technique it uses, and the film's measured stats stay within plus or minus 30 percent of the reference.

## 1. Order of work

1. Split the reference shot list (`TIMELINE.md`) into sections: opening, each selling point or story beat, climax, ending.
2. Confirm the reference's peaks with 12 fps strips and write `peaks.json` (`climax-duel.md` sections 1-2). Then design our peaks first: which planned shots are hero shots, what their hit frame is.
3. Map every other shot to a reference shot: `ref_shot`, `ref_what`, engine-ready `camera`, `anchor`. Time everything by meaning (`word-anchored-timing.md`): words, beats, actions; never copied reference seconds.
4. Carry elements only with their reasons (owner decision, 2026-10-29). An element of the reference (text, shape, cutout, map, colour wash, transition, a sound that marks it) enters the plan only with its `REASONS.md` row (`notes-files.md` section 6) and only where the new script holds an instance of the same trigger kind: each appearance names its row and the word or sentence of the new script that switches it on, and it lands on the role its row names (the speaker or guest stays lit: `ice-edit/references/layers-and-isolation.md`, section "The speaker stays lit"). An element with no row, with a row whose trigger kind or meaning is `unknown`, or with no trigger in the new script is cut and listed under `cut_elements` with the reason; it is never copied blind. The finishing layer follows the same rule: an effect of the "Finishing layer" table of `ANALYSIS.md` goes only on the shots where its where and why hold (`measuring.md` section 9).
5. Write `ice/plan/shots.json` and `ice/plan/storyboard.md`.
6. Check the contract (section 4), row by row against `shot_details`, and variety (section 5). Fix mismatches or write the reason in the shot's `notes`.
7. At stage 06 the storyboard, with a short explanation, is the preview for approval. No final production before the plan is approved. Who approves follows the router's stops table (`ice-motion-director/SKILL.md` section 5, "Stops"): the user on the 06 review card in step mode; in auto mode the user at the one preview stop when the session is interactive and the user did not say not to ask, otherwise the critic and the approver. The storyboard and the key frames together are that preview.

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
      "text_overlay": [{ "text": "<user copy only>", "at": [0, 0], "position": "<slot>" }],
      "elements": [{ "element": "<REASONS.md element>", "reason_row": 0, "trigger": "<word or sentence of the new script>", "on": "<role it lands on>", "in": "<cue>", "out": "<cue>" }],
      "finishing": [{ "effect": "<effect from the Finishing layer table>", "amount": "<measured amount>", "why": "<its reason, true for this shot>" }],
      "hero": false, "notes": ""
    }
  ],
  "cut_elements": [{ "element": "<REASONS.md element>", "why": "<no reason row | reason unknown | no trigger in the new script>" }],
  "peaks": [ "see climax-duel.md" ],
  "required_inputs": [{ "id": "<slot>", "kind": "<lyrics | design image | product photo | logo | audio>", "label": "<slot>", "why": "<slot>" }],
  "open_questions": []
}
```

Rules:
- Every shot carries `ref_shot`, `ref_what` and a `camera` spec the engine can use directly. A shot with no reference counterpart says `"ref_shot": null` and gives the reason in `notes`; keep these rare.
- Shots carry both beats and seconds when there is music; without music, beats may be omitted.
- Every entry in `elements` cites a `REASONS.md` row and a `trigger` taken from the new script; `finishing` lists only effects whose measured row holds for this shot; whatever is left out is in `cut_elements` (section 1, item 4).
- `required_inputs` lists only what the user alone can give. Before approval each is provided or explicitly skipped; in auto mode with no answer, it is replaced by a labelled placeholder, logged in `ice/DIRECTION.md` and listed in the delivery note, so production never stalls on a missing file.
- `open_questions`: real user decisions only, at most 4. Step mode: they go on the review card. Auto mode: each is decided, logged and reported.
- Each user-driven plan change: `version` plus 1 and a changelog line. If a change sacrifices the reference's core (removes the climax, turns a two-character story into a solo), say so explicitly.

## 3. Camera must match

The camera move type and pace class of each shot match its reference shot: a slow push maps to a slow push. If the reference moves in nearly every shot, the plan may not contain dead static shots. When the engine's speed differs, scale it: speed scale = reference speed / our measured speed (floor about 0.2), then re-measure.

## 4. The stats contract (plus or minus 30 percent)

| Stat | Reference source | Allowed range |
|---|---|---|
| Mean shot length (s, and beats when musical) | `pacing.mean_shot_s` | within 30 percent |
| Text-only card share of runtime | measured (`measuring.md` section 3) | within 30 percent |
| Low-key (dark) shot share | `look_summary.low_key_shots` | within 30 percent |
| Moving-camera shot share | `look_summary.moving_camera_shots` | within 30 percent |
| Camera pace mix per section | `shot_details[].camera.pace` | same class per mapped shot |
| Stillness ratio (when measured) | measured | within 30 percent |

A stat outside its range needs a written reason in `ice/DIRECTION.md` (for example a platform that forces shorter shots) or a fix. After rendering, `compare.py` re-measures our film with the same functions:

```
python <skill>/scripts/compare.py --analysis <ice>/reference/<ref-id>/analysis --plan <ice>/plan/shots.json \
  --video <render.mp4> --out <ice>/review/remake/compare
```

It prints "motion mismatch" when one side is still and the other is not. Numbers flag; open `compare_*.jpg` and judge.

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

Logline; world and color arc; motif; protagonist emotion arc; a shot table with beats, transition in, event, reaction, camera, `ref_shot`, and each element with the word or sentence that triggers it; the cut elements with their reasons; the scene-setup share calculation; the stats table from section 4 with reference value, plan value and percent difference.
