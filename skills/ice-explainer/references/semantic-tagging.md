# Semantic tagging

Spine stage 04, tagging step. Output: `ice/plan/semantics.json`. Tagging writes down what each sentence does, so the right visual is chosen and required elements cannot be forgotten. Reviewers who only check "is what is on screen right" miss "is what should be on screen there"; this file makes the second check possible.

## 1. Record per sentence

| Field | Content |
|---|---|
| `id` | Sentence id from `words.json` |
| `text` | Display text |
| `words` | First and last word index |
| `tags` | 1 or 2 tags from the closed list (section 2); first is primary |
| `weight` | `main` (may introduce a new element) or `sub` (only changes existing elements) |
| `entities` | Names, numbers, dates, products, places mentioned |
| `need` | One line: what the viewer must see for this sentence to land |
| `inputs` | Material available: host, footage, image, screenshot, live UI, text only, invented scene |
| `required` | Required element family when the tag demands one (section 3) |
| `segment` | Back-filled with the segment id at the segments step of stage 04 |

## 2. Closed tag list

Use only these. A sentence that seems to need a new tag gets the closest one plus a note; new tags are added to this file deliberately, not per film.

| Tag | The sentence | Typical visual job |
|---|---|---|
| `hook` | Opens a gap or stake | One striking picture event |
| `question` | Poses a question to answer later | Question visible on screen, answer withheld |
| `setting` | Places the story in time or place | Map, date stamp, location photo |
| `person` | Introduces the speaker or someone else | Name plate, portrait, role |
| `definition` | Names and explains a term | Term card or labeled diagram |
| `claim` | States a point | Promoted phrase or diagram state; do not overuse |
| `evidence` | Shows a document, quote, screenshot or source | Real material with source line |
| `quantity` | Gives one number | Number-carrying visual that settles when spoken |
| `trend` | Numbers over time or across items | Chart that grows with the words |
| `comparison` | Sets two or more things side by side | Split, slider, two columns in one world |
| `reversal` | Pivots ("but", "except", "until") | Starts the next segment; stage clears or flips |
| `cause` | Links cause and effect | Arrow, chain, reaction on the cause frame |
| `step` | One step of a process | Next station on a consistent stage |
| `mechanism` | How something works inside | Diagram assembling, transform, machine part moving |
| `example` | A concrete instance | The real thing, or the running example |
| `analogy` | Maps to a familiar object | The object, behaving like the concept |
| `list` | Several parallel items | Items appearing one by one as spoken |
| `limit` | Caveat, risk, warning | Restrained mark, warning color only if semantic |
| `reaction` | Emotion, joke beat, surprise | Reaction picture, held silence |
| `recap` | Thesis or takeaway | Clear last-frame picture, short promoted line |
| `action` | Call to action | CTA card with given link or offer only |
| `aside` | Low-weight connective | No new element; camera or existing element change |

Warn when more than half the sentences are tagged `claim`: that is the dump tag, and it hides real jobs.

## 3. Required element families

Missing any of these is a hard fail at verification.

| Tag or entity | Required on screen |
|---|---|
| `person` (self or other) | Name plate with name and role, one line, above the caption band |
| `action` | CTA card using only a link or offer from the user or the product's site |
| `quantity`, or a `trend` that must be quantified | A visual that can carry the number; the number traces to the facts list |
| `evidence` with a quote | Quote card plus visible source |
| Any named entity (section 4 of `references/research-and-facts.md`) | Its visual inside its segment |

News reel (edit type `news-reel`, style family `ice-styles/references/family-broadcast-news.md`), replacing the rows above where they differ:

| Tag or entity | Required on screen |
|---|---|
| `question`, a new opening question | The question card or plate with the words verbatim; the question disc behind the lit presenter only where the package uses it, never on a statement or a follow-up question (`family-broadcast-news.md` section 1.3 and section 2.3; layer and trigger: the `ice-edit` skill, `references/layers-and-isolation.md`, "3b. Programme matte kit"). Write `opening question` or `follow-up question` in `need` |
| `question`, a follow-up question | No disc and no new card: a plain caption or title only |
| `evidence` with a quote | The quoted words verbatim from the fresh transcript: a sentence the presenter reads becomes a frosted quote card with a pin (`family-broadcast-news.md` section 2.3); a source the narrator reads is a card in the set with a marker and a white caption in quote marks (section 2.2); another audible voice gets its caption in the other-voice colour. The source line still shows |
| `person` | A name super only for a person who speaks on screen, at his first appearance; a person only mentioned gets no name super (his portrait, silhouette or the words beside the head follow the package) |

## 4. Weight rules

- Only `main` sentences may introduce a new element. `sub` sentences change existing elements (highlight, recolor, move, count, annotate).
- Every segment has at least one `main` sentence.
- An `aside` or a `sub` sentence with nothing to change can be covered by a single short camera move instead of forcing an element.

## 5. From tags to visuals

1. Filter visual candidates by `inputs` first (what material exists), then by `tags`. A card or scene is listed only under the tags it was built for (`references/card-library.md`).
2. Pick a grammar per section from what the sentences are doing (`references/grammar-selection.md`).
3. Write the chosen card or scene into the segment. Any deviation from the top candidate, or any exemption from a required family, needs a written reason (at least a short sentence) inside that segment.

## 6. Coverage gate

Before build, check:
- Every sentence has a tag, a weight and a segment.
- Every required family in section 3 is assigned to a concrete element in a segment.
- Every entity listed has a visual.
- Every `quantity` maps to a facts-list entry.

After render, the verifier repeats the check on the film itself (`references/verification-loop.md`).
