> Translated from Chinese into English from Vincentwei1021/video-talkcraft (PolyForm Noncommercial 1.0.0). Noncommercial use only.

> Adapted from Vincentwei1021/video-talkcraft (PolyForm-Noncommercial-1.0.0). Changes: em dash and en dash characters replaced with colons, commas or hyphens. Noncommercial use only; see LICENSE and README.md in this folder.

# Semantic Annotation (②-1): make the talking-head script and the card library speak the same vocabulary

Finalized 2026-09-22. **Why this step exists**: before it, the card-selection funnel had only one filter, "input type" (does this shot have B-roll / an image / a person),
and the script side had never been annotated: nobody wrote down anywhere "what this sentence is doing". As a result:

> "I'm Wanli" was treated as just another argument keyword and given the lowest-energy text card in the whole library (soft-blur-in),
> while the library's P0 `lower-third-nameplate` (name bar) was right there on the shelf, its "use-when" line explicitly saying "also used for self-introduction", and nobody looked it up at that moment.
> Three independent reviews all judged this shot defect-free: because the review rubric only checks "is what was placed correct" (fidelity / skinning / layout), not "is what should be placed actually there".

This is not one type of semantics slipping through; it is that **the demand side had no structured artifact**. Data sentences paired with text cards, quotes without a source, portrait footage pasted bare, long screenshots stuck statically on screen,
all leak through the same gap. Semantic annotation is the artifact that fills this gap: it lets `card_match.py` produce candidates, `preflight.py` check coverage, and reviewers reconcile.

## Artifact: `semantics.json` at the project root

```bash
python3 <skill>/scripts/semantic_annotate.py --init          # after ②: generate a skeleton from audio/timestamps.json (with lexical hints)
#   fill in sem / weight / entities / need sentence by sentence
python3 <skill>/scripts/semantic_annotate.py --stats         # validation + distribution
python3 <skill>/scripts/semantic_annotate.py --sync-shots    # after ④ SHOTBOOK is written: backfill shot (touches only shot, annotations are kept)
```

**The order is hard**: ② timestamps → ②-1 annotation (there is no shot breakdown yet, so `shot` may be empty) → ④ SHOTBOOK → `--sync-shots` backfill → card_match / preflight.
**After shot boundaries change**, rerun `--sync-shots` too: `--check` verifies each sentence's `shot` against where its time falls, and a mismatch is an immediate FAIL (otherwise the coverage gate would check this sentence against the wrong shot's cards).
If the backfill is missed, `card_match` reports "no main sentence" for every shot and preflight's semantic coverage spins idle over the whole thing (2026-09-22 independent review P0-1; now both places FAIL immediately and name this step).

```json
{"version": 1, "source": {"timestamps": "audio/timestamps.json", "shots": "remotion/shots.json"},
 "sentences": [
  {"i": 59, "t": 113.36, "text": "I'm Wanli", "shot": "s11",
   "sem": ["self-introduction"], "entities": ["Wanli"], "need": ["identity"], "weight": "main"}
 ]}
```

| Field | Meaning | Vocabulary |
|---|---|---|
| `i` / `t` / `text` | Correspond sentence by sentence to `timestamps.json` (the script checks character by character; after a script edit or re-cut the annotation is invalid and `--init` must be rerun) |, |
| `shot` | Which shot it belongs to. At `--init`, filled automatically if a shot source already exists, otherwise left empty; **after ④, backfill with `--sync-shots`** (by the start/end seconds in SHOTBOOK headings, or `shots.json`) | Shot ids from SHOTBOOK / shots.json |
| `sem` | **What this sentence is doing**, multiple allowed | 26-term closed vocabulary, see `taxonomy.md` "Semantic index" (source: `VOCAB` in `scripts/cards_index.py`) |
| `entities` | Numbers with units / person names / brands / URLs / places: ③ footage gathering searches by these | Free text |
| `need` | Visual need | evidence / identity / quantification / comparison / structure / emphasis / none |
| `weight` | `main` = main sentence, **only main sentences may introduce new elements**; `sub` = supporting sentence, only changes to existing elements are allowed | main / sub |
| `exempt` | Exempts a specific lexical hard rule; the value is the reason (≥4 characters) | `{"data": "the three thousand here is a metaphor"}` |

The `weight` column also turns "no new element per sentence" (cinematography §4.5) into something machine-readable:
each shot needs at least one `main` (none = new elements have nowhere to hang, the script WARNs), and `sub` sentences get no new cards.

## Annotation discipline

1. **A card is listed only under the semantics it specifically serves**, and a sentence is tagged only with what it actually does. `argument` is the fallback tier; don't use it as a trash can:
   in the library, `argument` keeps only 3 whole-sentence cards (soft-blur-in / per-character-rise / alt-block-lines), and that is exactly the intent.
2. **Lexical pre-screening is not judgment**. The script has only three hard rules (I am / my name is X → self-introduction; like / subscribe / "triple combo" → call to action; quantity words → data),
   which catch systematic omissions; the other ten are WARN hints. The real judgment is human.
3. **Annotation is a derived artifact**. `text` matching the timestamps character for character is a hard rule: pre-cut → timestamps → annotation → everything after; the order cannot be reversed.
4. **`argument` has a share gate**: more than half of the sentences tagged as argument → WARN. Tagging everything as argument disables the coverage gate entirely (argument is in neither the hard rules nor the soft rules).
5. **Exemptions and deviations both need reasons** (both ≥4 characters, the two standards are aligned): at the sentence level use `exempt` (when a lexical hard rule misfires), at the shot level use, in SHOTBOOK,
   `- Semantic deviation: self-introduction ← identity was already given in the opening, s11 does not repeat it` (accepted as a list item or a table row, a reason is required; an empty reason or a `<semantic>` placeholder does not pass, and preflight WARNs with a format hint).
   A deviation applies only to **semantics written in that shot's body**: written in another shot, naming a semantic this shot does not have, or written in the "Unfinished list" section, none of these pass (preflight WARNs and names it).

## How downstream uses it

| Stage | Usage |
|---|---|
| ③ Footage | The footage shopping list is generated from `need` / `entities`: `evidence` means capture the real page, `identity` needs an avatar / account info, `quantification` needs a chart or data source |
| ④ SHOTBOOK | `python3 <skill>/scripts/card_match.py --out qa/card-candidates.md` produces candidates per shot (semantics × footage × card index); each shot writes one line `- Card selection: <semantic> → <card>, ...`; when picking a card outside the candidates, write one line `- Semantic deviation: <semantic> ← reason` |
| ④→⑤ gate | The "Semantic coverage" section of `preflight.py`. First it checks ownership sentence by sentence: **any sentence whose `shot` is empty or is not a shot in this SHOTBOOK → FAIL** (those sentences would be silently skipped, making the conclusion unreliable). Then four checks: ① **self-introduction / introducing others / call to action** without a card for that semantic → FAIL (these three have dedicated card families and no substitute; **regardless of main / sub**, tagging as sub still counts); ② a `data` main sentence whose `need` includes `quantification` but with no card able to carry the number (data infographic cards, or `data` / `emphasis` / `enumeration` / `comparison` semantics: numbers often land on parallel cards as item labels) → FAIL; ③ the other 13 semantics (quote / comparison / definition / steps / enumeration / time-place / mechanism / choice / process demo / spatial narrative / rhetorical question / punchline / chapter) → WARN; ④ the footage row declares V / image / screenshot but there is no receiving card → FAIL. Receiving card = a footage-consuming family + category is not transition structure / styled captions + not a card that carries only the person (the corner window of `host-shrink-to-chip` holds the speaker, not footage; if it counted as receiving, this gate would only trigger when "there isn't even a corner window"); when the shot body mentions the component name `ThemeFrame`, or a frame word and a footage word are on the same line (e.g. "wrap the B-roll video area in a magazine frame"), it drops to WARN: merely mentioning "person half-body uses the magazine frame" in the layout line does not count, that is the name G0 gives the person container (third-round review P1-T1). Shots missing the "skin line" are not exempt (FAIL if there is footage or hard semantics). Writing a "Semantic deviation" lets it pass |
| ⑦ Review | The semantic annotation + candidate table go into the review materials (review-protocol §1.2, fifth item), and the rubric gains two P1 items: semantic event without a card, footage pasted bare |

Without `semantics.json`, preflight falls back to a lexical safety net on `script.txt` (I am X / like and subscribe → no matching semantic card in the whole film → WARN),
but per-shot coverage cannot be checked: **don't skip this step**.

## Inventory gaps (exposed when the index was built on 2026-09-22)

- **Rhetorical question**: only `title-demote-to-label` (the question is demoted into a label, the answer unfolds below) barely covers it; there is no dedicated "pose a question without answering right away" card.
- **Call to action**: only `subscribe-cta`; the two follow cards (`x-follow-card` / `douyin-follow-card`) explicitly say in their own md "proof, not a call to action",
  so they are `introducing others`. The Douyin follow card also needs real account info (avatar / nickname / Douyin ID / follower count); without it, don't make it, write it into the "Unfinished list", and don't fake it.
- **Mechanism**: only `source-converge` (many-to-one convergence).

These are real gaps; the index honestly shows "(no card yet)" and nothing is forced in: either add a card, or write a deviation reason in SHOTBOOK.
