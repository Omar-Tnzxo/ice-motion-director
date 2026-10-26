# Word-timed segment contract

Spine stage 04, segments step. Output: `ice/plan/segments.json` (machine contract) and `ice/plan/storyboard.md` (human view of the same plan). Engines read the contract; the per-engine wiring lives in `ice-engines`.

## 1. Contract shape

Slots in angle brackets. This is a shape, not an example to copy.

```json
{
  "film": {
    "fps": "<from ice-engines platform spec>",
    "width": "<px>", "height": "<px>",
    "voice": "<path to final voice audio>",
    "words": "ice/plan/words.json",
    "voice_hash": "<hash of the voice file the cues were planned against>"
  },
  "segments": [
    {
      "id": "<seg-NN>",
      "sentences": ["<sentence ids from semantics.json>"],
      "range": { "from_word": "<word index>", "to_word": "<word index>", "lead_s": "<seconds before first word>", "tail_s": "<seconds after last word>" },
      "job": "<one primary visual job: hook | definition | data | process | comparison | evidence | conclusion | action>",
      "grammar": "<grammar id chosen in grammar-selection>",
      "card_or_scene": "<library id, or 'custom' with a reason>",
      "layout": "<layout recipe name>",
      "required": ["<required families this segment must show>"],
      "cues": [
        {
          "anchor": { "word": "<spoken word text>", "nth": "<occurrence index, 1 based>" },
          "offset_s": "<negative to lead, positive to lag>",
          "kind": "<enter | exit | highlight | count | draw | move | camera | swap | sound>",
          "target": "<element id>",
          "lands": "<reveal | settle>"
        }
      ],
      "boundary_out": "<transition name from ice-motion, or 'carry' with the carried element id>",
      "unfinished": ["<anything not collected or not built, never hidden>"]
    }
  ]
}
```

Rules for the contract:
- A cue names a word (text plus occurrence) and an offset; it never stores a typed second. Frames are computed from `words.json` right before render.
- `lands: reveal` means the element is first visible on the anchor time. `lands: settle` (numbers, counters) means it finishes on the anchor, so it starts earlier by its own duration.
- If the voice file's hash no longer matches `voice_hash`, the render refuses rather than drifting silently. Re-plan from the new words.
- Every segment lists `unfinished`, even when empty. Gaps are never dressed up as design choices ("this film has no footage" is not a style).

## 2. Segment boundaries

- Segments follow picture units (semantic paragraphs), not sentences. One primary visual job per segment.
- Short sentences (under about 3 s, or one caption block) merge into neighbors as beats.
- Segment frame range: from the first sentence's start minus about 8 frames to the next segment's first sentence start minus about 9 frames; the last 8 frames are the exit budget (30 fps values; scale by fps).
- The first elements start on the segment's first frame. Never more than 1.5 s of empty stage before the first anchor; carry an element over from the previous segment instead.
- Compute the frames left after the last block: a long entrance can overflow and pop in at full state in the next segment.
- Tail guard: an anchored action lands at least 0.7 s before the segment exit (machine floor 0.5 s), or it moves to the next segment.
- Text and picture start and end together: the segment ends when its last exit ends; at most 0.4 s of background or media keeps running after the text left.

### Segment length by mode

| Mode | Length rule |
|---|---|
| Standard explainers | One idea per scene, usually 1 to 3 sentences, 4 to 15 s; a scene over 40 s of narration should be split |
| Diagram topic explainers | At least 120 frames (4 s at 30 fps) per shot |
| Parameterized clip pipelines | A clip holds at most 8 s; 3 to 8 s clips are most comfortable with 2 to 5 cues |
| Collage shorts (30 to 60 s) | 8 to 14 shots, one sentence each; shot 1 is the question |
| Storytime | One sentence per shot, cuts in the breath between sentences |

## 3. Lead and lag

| Element | Timing against its word |
|---|---|
| Text naming a noun | Starts 0.2 to 0.3 s before the noun so it is readable on the word |
| Diagram parts, long-form world elements | Enter 0.15 to 0.25 s ahead of the anchor word |
| General cue window | Enter within 6 frames before to 3 frames after the anchor |
| Payoff | Start earlier by the reveal duration so the landing frame is the spoken payoff word |
| Numbers and counters | Settle on the spoken number: count start = word time minus count duration; never assert "over" or "plus" while counting |
| Slow narration (collage) | The visual may lead by about 1 to 1.5 s (show before tell) |
| Concept transforms | Animation begins on the action verb; wait about 1 s after the sentence |
| Handwriting (whiteboard) | Starts 0.2 to 0.8 s after the phrase begins (median about 0.5 s), finishes within 1 s after the phrase ends: write slightly behind, never ahead |
| Reactions | Start about 100 ms before their cause completes, never after |
| Hits with sound | Picture rather early than late, at most one frame early; sound may lead by up to 40 ms or lag by up to 60 ms |
| Clicks in UI scenes | No clicks in the first 0.7 s of a scene (covered by the incoming transition) |

Camera moves finish before their beat rather than starting on it.

## 4. Spec floors

- The first cue of a segment is a picture event (a curve drawing, a screenshot, data growing, a dive, an icon, a number), not a title at zero.
- Text cues are at most half of a segment's cues; the same cue kind is not used three times in a row.
- On-screen text per element is a distilled phrase (about 14 characters for CJK, a few words for Latin scripts), never the subtitle sentence.
- Elements before their anchor are fully invisible. Inline numbers are gated together with the characters after them.
- Never parallel-reveal two independent elements: one thing, pause, next thing.
- Something visibly changes every 2 to 4 seconds; a gap of 6 s or more between new elements is flagged.

## 5. Lint before build

Fail (fix before build):
- Unknown grammar, card or cue kind; a kind the chosen grammar does not draw does nothing silently, so it must be caught here.
- Missing fields, missing asset files, all cues outside the segment.
- A sentence with no cue; a required family with no element.
- A cue anchored to a word that does not exist at that occurrence.

Warn (fix or justify in the segment):
- Long empty start or end; cues piled on the same frame; clip over 8 s in clip pipelines.
- Same layout recipe in consecutive segments; same card in 3 consecutive segments.
- Tail guard under 0.7 s.

## 6. Storyboard view

`ice/plan/storyboard.md` renders the contract for humans. Head block: style lock lines (grammar, palette, type, character if any, from `ice/DIRECTION.md`), layout rhythm table (segment, layout, container, host form if any), the sample segment id. Then one row per segment: time range, the sentences, object (noun) and action (verb), camera, on-screen text, card or scene, assets line, self-checks copied from the card's pitfalls, sound cues, unfinished. End with the "unfinished or not collected" section.
