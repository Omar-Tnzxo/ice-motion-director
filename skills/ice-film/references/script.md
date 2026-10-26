# Script: words for the ear and the eye

How to write the voiceover or the on-screen copy after the structure is chosen. This file is complete for the script step of spine stage 03: the rules below are the working set, quoted in short form from the `ice-ideas` skill (`references/script-writing.md`, `references/templates.md`), which keeps the long form and wins if the two ever differ. Per-beat script shapes: `script-shapes.md`. Voice casting, TTS and pace measurement: ice-audio. Dialect and Arabic copy: ice-arabic.

## Contents

1. Inputs and modes
2. Writing for the ear
3. Word budget
4. Cue segmentation
5. Films without a voiceover
6. Script cues that become pictures
7. Copy voice and banned copy
8. Script file format

## 1. Inputs and modes

| Mode | When | Rule |
|---|---|---|
| Write | No script supplied | Write it yourself in the beat's script shape |
| Restructure | The user supplied source material | Rewrite, reorder, merge or omit to fit the structure and length |
| Verbatim | The user supplied final words | Never change a word; segment only at sentence or clause boundaries; the film's length follows the script |

The source document is the writer's input, never the viewer's context: the voiceover never refers to "this article" or "the page".

## 2. Writing for the ear

- One information point per sentence; if a sentence needs "and", split the beat or drop one half. If deleting a line loses the viewer no belief, delete it.
- One clause per beat, short words, no stacked subordinate clauses; vary sentence length (rewrite any run of three with the same shape).
- Concrete over abstract: a named everyday item and a real time beat a generic promise; every abstract noun gets a concrete instance.
- Narration carries reasons, consequences and judgment; the picture carries structure, sequence and quantity. Never describe the picture.
- One voiceover line per shot: it starts after the shot starts and ends before the cut, except deliberate J and L cuts.
- On-screen text complements the voice, never repeats it word for word; reels carry at most 5 to 7 words per caption on 2 lines.
- Proof first, then the claim; translate every feature into viewer value; at most four product beats.
- CTA said once, at the end, shown on the end card; store badges or a link only when the user owns the brand (an unofficial concept closes as `film-types/app-ad.md`, Purpose, says); never shouting copy.
- Claim timing: in a 30-90 s launch the claim lands inside the first 10 s; in social shorts and app ads the hook is complete by 3 s.
- Each line gets a delivery note (how the speaker regards the subject and the listener).
- Numbers are written as said in the voiceover text and as digits on screen. Round only toward the less impressive number; rounding up is a fabrication.
- Silent beats are allowed when the picture proves the point; leave them out of the spoken script.

## 3. Word budget

`word budget = target seconds x pace (words per second for this language and voice) - pause seconds x pace`. Take the pace for the language, dialect and voice from the `ice-audio` skill, `references/voiceover.md` section 3. Mark pauses as `[pause 1.0s]`. Measure before promising a length: render or record the voice, read its real duration; if it misses the target by more than 15 percent, add or cut sentences. A line that does not fit gets shorter, never faster.

## 4. Cue segmentation

Write each voiceover line as discrete cues, not one run-on breath. A line with clear phrase boundaries hands the shot its reveal cadence: each on-screen piece is revealed when the voice names it. A single long clause leaves the frame nothing to pace to. Every cue later names its word in `ice/plan/cue-sheet.json` (`cue-sheet.md`).

## 5. Films without a voiceover

Comprehension rides on copy, evidence, motion and music together. When the brief implies speech but no allowed voice source exists, every word goes on screen (the app-ad type file, "Timing master").

- Split the copy into focus units, one idea each: copy, reading order, enter, apex, dwell, proof action, handoff or exit.
- Duration of a unit comes from three constraints: language (enter, read, settle), action (anticipation, transformation, recovery) and music (phrases, accents, rests). Never divide the total evenly; never shorten reading to hit a beat (rewrite the copy or move the cue).
- At each moment one relationship holds: text owns focus and prepares evidence; text and evidence are one transforming object; evidence owns focus with text labelling it; or a deliberate handoff. Static text beside unrelated moving UI is not acceptable.
- Vary communication modes by meaning: a word becomes an object; text is revealed along a real path; a number counts only while the mechanism changes it; a label locks to its evidence and travels with it; type masks the next world; a silent proof shot follows a readable setup.

## 6. Script cues that become pictures

| In the line | The storyboard gets |
|---|---|
| A number | a visual built from that number, never a caption |
| An abstract noun | a concrete metaphor |
| A name | a name or logo beat with its own hold |
| A contrast word (but, instead, not anymore) | a turn: change of ground, colour, scale or camera |
| A list | visuals chosen for the items, never three tiles by default |
| New information | a new visual response, or a state change in the same world |

Write 3 to 4 visual ideas per important line; the picture represents what is said, it does not decorate it. A process in the script gets numbered steps acted in one world, never one tile per step.

## 7. Copy voice and banned copy

- Quote exact on-screen copy in the script; unquoted copy gets paraphrased downstream. Later stages never paraphrase approved copy.
- The banned copy tells (stock lines, launch clichés, dialect copy tells) are scanned by the `ice-qa` skill, `references/slop-scan.md` section 6, before delivery; read that section once while writing. Dialect copy review: the `ice-arabic` skill.

## 8. Script file format

Write `ice/plan/script.md` in this shape (slots, never example values):

```markdown
# Script: <project>
Mode: <Write | Restructure | Verbatim>
Language and dialect: <...>; length target: <s>; pace source: ice-audio <entry>; word budget: <n>
| Shot | Time | Visual (real source) | On-screen text (quoted) | VO line | Delivery | Visual cue | Music and SFX | Shape | Importance |
|---|---|---|---|---|---|---|---|---|---|
| 1 | <a-b> | <...> | "<...>" | "<...>" or none | <...> | <number/name/contrast/metaphor/none> | <...> | <script-shape id> | <1/2/3> |
Facts used: <truth sheet ids>
Illustrative content declared: <none / list>
```

Versions step (same stage): write `ice/plan/versions.md`, one row per version the brief or the type's Deliverables list, or the single line "master only":

```markdown
# Versions: <project>
| Version | Length | Aspect | Language | Hook (from hooks.md) | What changes from the master |
|---|---|---|---|---|---|
| <master or cutdown name> | <s> | <ratio> | <code> | <opening id> | <beats kept or cut, re-layout> |
```

Each cutdown keeps the claim and has its own hook; a language version is transcreated, not translated (ice-arabic for Arabic); an aspect version is re-laid out, never cropped.

Sources: AbubakrChan/product-launch-motion, heygen-com/hyperframes (product-launch-video, docs), commercial-motion-design (Omar-Tnzxo), video-production-studio (Omar-Tnzxo), Tejashmakwana/motionmaxxing, digitalsamba/claude-code-video-toolkit, heygen-com/hyperframes-community-skills (vox-explainer script notes), anything2explainer and video-talkcraft (ideas only, rewritten), video-ad-editor.
