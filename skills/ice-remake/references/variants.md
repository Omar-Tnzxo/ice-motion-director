# Variant generation

Read this when the user wants several versions of a finished remake (other hooks, languages, products, aspect ratios, lengths, treatments). Variants share one reference reading and reuse accepted material; only what changes is rebuilt.

## 1. Structure

```
ice/reference/<ref-id>/          read once, shared by every variant
ice/plan/                        the base production
ice/variants/<variant-name>/
  BRIEF-DELTA.md                 what differs from the base brief, in the user's words
  TREATMENT.md                   only if the creative answer changes
  plan/shots.json                re-anchored plan
  review/
```

Each variant links back to the shared reference and the base plan instead of copying them. A similarly named folder elsewhere on the machine is not an asset library: reuse only what this project's files point to.

## 2. Axes (illustration only, pick what the brief asks for)

| Axis | Usually changes | Usually kept |
|---|---|---|
| Hook or opening | The first 1-3 s, sometimes the CTA | Body, caption system, climax |
| Language | Script, captions, voiceover take, text layout (RTL: the ice-arabic skill) | Structure, anchors, graphics |
| Product or topic | Script lines, demo, props, claims, CTA | Format, caption system, reveal components |
| Aspect or platform | Composition per format (re-layout, never crop), safe zones | Timeline and anchors |
| Length | Which sections survive, compress or expand | Climax and ending rhyme |
| Treatment (look) | Palette, type, texture, motion character as one system | Mechanics from the fidelity contract |

Each variant still passes the stats contract, the fidelity check and the climax duel against the same reference, and the anti-sameness checks of the ice-direction and ice-qa skills (a variant set must not collapse into one look unless the brief asks for one look).

## 3. Reuse versus rebuild

| Change | Needs |
|---|---|
| A moved card, a new crop, a caption restyle, a graphic re-timing | Reuse the accepted renders and audio; re-composite only |
| A changed spoken line or performance | New voiceover take (and any generated footage it drives), then re-alignment |
| A new language | New take; re-resolve every anchor from the new alignment. Optional time-warp: map matching words of the two languages and warp the timeline between them, then confirm the untouched source-language version is pixel-identical |
| A new track | New BPM and offset; beat anchors re-resolve; climax re-checked |

Reuse is explicit: write in each variant's plan which earlier renders, stems and alignments it reuses. An unchanged file name is not proof that a render is still valid. Never pay for or regenerate work that an earlier accepted output already covers; any new generation is an intentional, disclosed choice inside the user's agreed scope.

## 4. Batch order

1. Freeze the base: approved plan, shared specs, accepted audio and renders.
2. Write every `BRIEF-DELTA.md` first (from the variants planned at 03 in `ice/plan/versions.md`); show the list on the review card in step mode, and log it and report it in the delivery note in auto mode.
3. Build variants in parallel, one builder per variant, each touching only its own folder.
4. Review each with a fresh reviewer; compare variants side by side for unintended sameness or drift.
