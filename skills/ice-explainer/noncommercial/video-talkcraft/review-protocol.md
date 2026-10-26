> Translated from Chinese into English from Vincentwei1021/video-talkcraft (PolyForm Noncommercial 1.0.0). Noncommercial use only.

> Adapted from Vincentwei1021/video-talkcraft (PolyForm-Noncommercial-1.0.0). Changes: em dash and en dash characters replaced with colons, commas or hyphens. Noncommercial use only; see LICENSE and README.md in this folder.

# Review protocol (Gate 2 independent review · Gate 3 rule compliance · revision discipline · review loop)

Two kinds of readers: the **producer** (when to dispatch a review, what materials to prepare, how to re-check after fixes) and the **reviewer subagent** (fresh context, must read this file first when dispatched).
The five commands of the Gate 1 machine gate and the frame-extraction commands for review materials are in `SKILL.md` ⑥⑦; they are not repeated here.

## 1. Gate 2: independent review

### 1.1 Definition of independent
- **An independent subagent must be dispatched; the producer may not self-review**: whoever made it has blind spots about their own frames.
- **Independent = fresh context**: do not fork / reuse the production conversation as the "reviewer", and do not run a followup re-review on the same reviewer:
  a forked reviewer inherits the producer's point of view, and the reference it checks against is the SHOTBOOK the producer wrote, forming a self-confirming loop (P0/P1/P2 all zero, while the finished film is full of problems).
- The producer's own first-pass layout check is also delegated to a subagent (give it paths to stills / contact sheets, it returns only a text defect list): the image tokens of dozens of pictures never enter the main context.

### 1.2 The five-piece review kit (none may be missing)
1. **SHOTBOOK + review contact sheet** (output of `contact_sheet.py`, for full-page browsing) + path to the raw frame directory (go back to suspicious frames and zoom in one by one).
2. **Original-card comparison frames**: for every slug in the SHOTBOOK, extract 2 frames from `gallery/media/<slug>.mp4` and put them side by side with frames of the corresponding shot in the finished film,
   so the reviewer judges slug by slug "is this an implementation of the same card?" (if fidelity never enters the reviewer's view, it will never be caught).
   For cards without an mp4 (on a fresh clone `gallery/media/` is not in the repo), use the
   `tools/.verify/<slug>-t0.png / -t1.png` produced by `node scripts/verify-demo.mjs <slug>` instead.
3. **Word-landing checklist**: for every anchor in beats.json, the settled frame + anchor word + the time it should land, to check "when this word is spoken, is the picture responding exactly then".
4. **SFX audibility report**: the output of `sfx_check.py --mix` (the reviewer has no ears; the machine report is its ears).
5. **Semantic annotation + card candidate table**: `semantics.json` (②-1, sem / weight per sentence) and `qa/card-candidates.md` (output of `card_match.py`) + each shot's **card-selection line**, to check §1.3 "semantic coverage": are the cards that should be there present, and has any material been pasted in bare.

Also attach the **design checklist** from SHOTBOOK §0 (background asset placement table, SFX cue count, host form table), for the third category of checks in §1.5.

### 1.2.5 Reviewer execution discipline (it only counts as a review if you get a report, finalized 2026-09-06)

- **Incremental writes to disk**: the reviewer subagent first writes a `REVIEW.md` skeleton (materials list + three empty sections P0/P1/P2), then **appends one line after each shot it finishes**, and may not hold everything for one delivery in its final message:
  when dozens of images blow up the context, the final message never gets sent at all; on 2026-09-06 three dispatches produced zero output three times, 146 minutes gone.
  After the last shot, write the **closing line** `## Review complete · viewed N/N shots`: the producer only accepts this line as proof that "the review is done" (§1.6 WAIT), not the subagent's completion notification.
- **Terminate and re-dispatch after 10 minutes with no increment**: the producer watches the mtime / line count of `REVIEW.md`; if it has not grown in 10 minutes, kill it and change strategy (split, fewer images); never wait 85 minutes.
  How dispatch / wait / liveness / re-dispatch map onto each harness: see the §1.6 primitive table.
- **Sharded review**: for films with > 8 shots, split by act / shot range into 2-3 reviewer subagents (each ≤7 shots + the global §0 materials), each writing `REVIEW-<range>.md`;
  the last one does only cross-act consistency (skin / camera language / host form rhythm / **layout rotation**: the rhythm of the whole film is visible only to someone who watches the whole film). The context is small enough not to blow up, and the shards can run in parallel.
- **Handling when no report can be obtained**: after 3 dispatches still no report on disk → the deliverable must be labeled "**No independent review obtained**" with the three failure reasons attached;
  the producer is **forbidden** to self-review and deliver as "reviewed" (silent self-confirmation = Gate 2 exists in name only).

### 1.3 Review scope and rubric
Produce a `[P0/P1/P2]` defect list along **readability / composition / information delivery / texture / factual consistency + fidelity / word landing** (remind the reviewer: entrance in-between states are not defects).
The focus is **quality defects in the finished film**, not rule compliance (rule items are in Gate 3): elements overlapping / covering / piling up, inaccurate motion positions (annotation not landing on the target,
misplaced emphasis, elements leaving the frame), image noise / compression artifacts / render ghosting, unintended jitter or flicker, text clipped at the edges, **messy layout**
(more than 3 subject groups on one screen, a fully packed layout with no empty quadrant, on-screen text duplicating the full subtitle sentence, the face safe zone invaded by text or its background, multiple hero shapes competing for attention).
**Style consistency** (check the settled frames against SHOTBOOK §0 `G0 style profile` and each shot's **skin line**, design-language §0.4): the card's neutral demo skin leaking into the finished film (demo blue accent / hairline white cards / grayscale placeholder shapes appearing as-is),
two skins for the same kind of card (inconsistent card shapes / chart axis language), a light/dark background strategy that does not match the style profile: all recorded as P1; the G0 block and skin lines from the SHOTBOOK must be handed over together with the five-piece kit.
**Semantic coverage** (since 2026-09-22; check against `semantics.json` and each shot's **card-selection line**, materials see §1.2 item five): self-introduction / introducing others / call to action in the semantics with no card of matching semantics (the library has a dedicated card family that was not used, regardless of main or supporting sentence), a `data` main sentence tagged `need: quantify` but no graphic card that carries the quantity, a material line declaring V / image / screenshot but pasted in bare (no hosting card: a card that consumes the material family and is not a transition structure / subtitle decorative-text type; a single-video shot also not wrapped in ThemeFrame): recorded as P1; a shot that writes "semantic deviation ← reason" does not count as a defect. The reviewer must check **whether what should be there is there**, not only whether what is there is right: in a film on 2026-09-21 the self-introduction had no name strap, and all three reviews judged it defect-free, precisely because the rubric lacked this item.
**Layout rotation** (2026-09-21 user feedback "the layout is too fixed"; check against the SHOTBOOK G0 layout rhythm table + view the settled frames of three adjacent shots in a row): 3 consecutive shots with no change in host form × position and material container,
the same presentation card used for 3 shots in a row or for >1/3 of the film, the same B-roll reused in adjacent shots: recorded as P1; if the review comment can say "again a round badge bottom-left + a box in the middle + text on the right", it holds (cinematography.md §4.5 item 9).

### 1.4 Defect severity
- **P0** = viewers will certainly notice and it hurts understanding: factual / text / glyph errors, unreadable, audio-visual misalignment, elements colliding and covering body text, annotation pointing at the wrong target.
- **P1** = violates a hard rule or is clearly off: staggered-timing ghosting, word landing off by >0.3s, sound effects missing for a whole shot, clearly not matching the original-card comparison frames,
  web evidence pasted statically instead of filmed (SKILL.md ③), any of the nine layout-spec items failing (`layout.md` §9: hugging the edge / inverted spacing / misaligned / off-center /
  annotation not enclosing / font size below tier / bounding boxes intersecting / same color within a group / unreadable at 390 width), neutral card not skinned per the style profile (design-language §0.4),
  monotonous layout (§1.3 layout rotation: 3 consecutive shots with same form and same container / same card for 3 shots in a row / one card >1/3),
  semantic event with no card or material pasted in bare (§1.3 semantic coverage).
- **P2** = texture blemishes: density / whitespace / styling, recorded but does not block acceptance.

**Only after P0 + P1 are fixed does it pass.**

### 1.5 Three kinds of defects that per-sentence frame extraction cannot see (the matching materials must be provided)
- **Misplacement in short-lived motion** (annotations / arrows live only 1~2s, per-sentence frame extraction will very likely miss them) → use **motion anchor frames** (the settled frame at each accent +0.25s)
  to check one by one "did it frame / point at / circle the target".
- **Jitter / flicker** (temporal defects, never visible in a single frame) → use both: the concurrent raster-jitter judgment of `motion_check`
  (it only measures ≤12 fixed crop windows at 18s intervals and skips fast-motion windows: it is a dedicated gate for "concurrent raster disease", not full temporal coverage; `--anchors` also brings anchors into the windows)
  + `qa_extract` extracting three-frame burst pairs for anchors in anchors.json marked `"burst": true` (state switches / high risk): between the three frames there should only be designed continuous motion;
  back-and-forth oscillation or fine texture crawling is a defect; extract all with `--bursts` only when the jitter gate fires and human eyes are needed to locate the cause.
- **Design not delivered** (backgrounds / sound effects / persistent elements planned in SHOTBOOK §0 silently missing: a reviewer who does not know "it should be there" will never report it)
  → send the design checklist attached in §1.2 to the reviewer and check item by item "plan vs finished film".

### 1.6 Dispatch primitive table (harness-agnostic, 2026-09-07)

This protocol describes review dispatch using only the six verbs below. **The verbs are the contract, the table is the translation**: switching harness just adds a column; not one word of §1.1-§1.5 changes.
The subagent's entire world = the dispatch packet + files on disk: do not expect it to see the production conversation, memory or loaded skills.

- **PACKET** (dispatch packet): one self-contained prompt = the path of this file ("must read first when dispatched") + the paths of the five-piece kit (§1.2) + the shard range + the report path on disk `REVIEW[-range].md`. **Pass it verbatim**; no summarizing or paraphrasing.
- **DISPATCH**: start a subagent with a **fresh context** to run the PACKET (§1.1 definition of independent).
- **FAN-OUT**: sharded review (§1.2.5) = start 2-3 mutually independent DISPATCHes at the same time. The harness concurrency limit **only reduces parallelism, never scope**: above the limit, run in waves; do not merge two shards into one review to fit the limit.
- **WAIT**: the completion criterion is **the closing line appearing in `REVIEW.md` on disk** (§1.2.5), not the harness completion notification: notifications can be lost, can arrive before the write to disk, or can correspond to empty output. Even after a notification, go read the disk.
- **LIVENESS**: every 2-3 minutes look at the mtime / line count of `REVIEW.md`; no growth in 10 minutes → terminate it and go to RE-DISPATCH (§1.2.5).
- **RE-DISPATCH**: the same PACKET + one line of failure reason + the changed strategy (finer shards / fewer images), started in a **new** subagent; 3 cumulative attempts with no report → deliver labeled "No independent review obtained" (§1.2.5).
  **There is no "producer does it themselves" fallback tier**: that would make Gate 2 exist in name only; it is not a fallback.

| Verb | Claude Code | Codex CLI | No native dispatch (any harness) |
|---|---|---|---|
| DISPATCH | `Agent` tool, `subagent_type: "general-purpose"`; **`fork` forbidden** (inheriting the production context = self-confirming loop) | `spawn_agent`, PACKET passed with the prompt; the subagent inherits the parent cwd, which conveniently shares the project directory | headless CLI subprocess: write the PACKET to a file, start `claude -p "$(cat packet.md)"` / `codex exec` in the background, stdin from /dev/null, stdout into a log |
| FAN-OUT | multiple Agent calls in the same message, each with `run_in_background: true` | multiple `spawn_agent` (asynchronous by nature) | multiple background processes |
| WAIT | completion notifications arrive automatically, **treat them only as hints**: after receiving one, still read `REVIEW.md` and confirm the closing line | after `wait_agent` collects all ids, likewise read the disk and confirm the closing line | poll `REVIEW.md`; do not rely on the process exit code |
| LIVENESS / KILL | `TaskStop` stops a subagent with no increment | `interrupt_agent` **really interrupts it** (a stuck subagent holds a concurrency slot; without interrupting, RE-DISPATCH may fail to start; to free the slot also `close_agent`), only then `spawn_agent` a new context | `kill` the process |
| RE-DISPATCH | a new Agent call; **forbidden** to use `SendMessage` for a followup re-review on the same reviewer (§1.1) | a new `spawn_agent`, do not reuse the old thread | a new process |
| Re-review after revision | same as DISPATCH: yet another fresh context | same as DISPATCH | same as DISPATCH |

Harness notes:
- **Codex**: dispatching subagents is gated by policy: **the user must explicitly allow delegation in this session**; writing it in a skill file does not count. Without authorization, fold a one-line question ("The review needs to dispatch parallel subagents, is that OK?") into the first user pause that already exists in the flow, without an extra interruption; verbal permission or a standing authorization in `AGENTS.md` both count. Still not obtained → use the third column, headless; **never silently downgrade to self-review**.
- **Claude Code**: `fork` and `SendMessage` to the same reviewer are both forbidden primitives here, not "a more token-efficient option".
- Vocabulary mapping: "in the same message" and "run in the background" elsewhere in the docs are Claude Code wording; replace them with this harness's equivalents per the table above; `Read` / `Write` / `Bash` are capability names, not tool names.

## 2. Gate 3: rule compliance

- Check every shot against the eight items of `cinematography.md` §5: camera moving in the resting frame / no full stillness in any 1s / every boundary has a transition treatment with continuous motion /
  anchor quantization error ≤16.7ms / one lead per beat, steps aside once done speaking / layout budget met / no web evidence anywhere pasted statically / text and picture start and end together.
- **Debug overlays (slug labels / shot numbers / grid lines / safe-zone frames) must not appear in the delivery render**: if needed, hang them on a `debugOverlay` input prop, off by default for delivery.
- **Final readability check**: **shrink the finished film to 390px wide** (the actual width of a landscape film when scrolled on a phone) and watch it again; every line must be readable: a full-screen desktop preview is not the acceptance standard;
  when it does not fit, first cut secondary copy; do not shrink the font size, and do not leave single-character orphan lines.

## 3. Revision discipline

- **Three-stage timecode loop**: for every timecode the user annotated, extract that frame before the change → extract the same frame after the change → extract the same frame again from the final film; write the three paths into REVIEW.
- Fixes to **state-type animations** (step aside / swap positions / reveal) must cover **the union of the whole affected interval** (start / midpoint / end + before and after each boundary);
  "the annotated frame is fine now" cannot stand in for acceptance of the whole segment.
- When the same problem is **reworked a second time**, REVIEW must keep a record of "why the first fix failed".
- Revision re-checks must give **measured numbers** (first discernible time / time swallowed / pixel share); "looks fine now" does not count: a quantitative standard is what makes multiple rounds converge.
- Fix verification **renders only the affected segment through the gates** (`render_shots.mjs --changed sNN`; freezedetect can run on a single segment), not a full render.

## 4. Review loop policy

After the first cut passes all machine gates, do only **1 round** of independent review → fix P0/P1 (re-checks give measured numbers, render only the segment changed) → **deliver right away**, then put two things in front of the user together:
1. Ask the user **whether to continue automatic review and revision**: if continuing, each round still uses a fresh reviewer context, and automatic rounds are capped at **3 rounds** in total;
   if P0/P1 remain after 3 rounds, stop and hand the remaining defect list, each round's fix record and "why it was not fixed" to the user as-is for a decision (endless self-review and self-fixing does not converge and only burns budget).
2. **Open the motion workbench at the same time** (command in SKILL.md ⑧) and point out: if you do not want to run automatic rounds, you can fine-tune it yourself in the workbench (text / color / font size / position / speed changes, each adjusted visually, then export directly).

The deliverable comes with this round's list of remaining P2 items: the right to decide "record but do not fix" belongs to the user.
