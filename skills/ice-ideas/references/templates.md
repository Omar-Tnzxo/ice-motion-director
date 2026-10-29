# Output templates

Exact shapes for every ice-ideas deliverable. Angle brackets are slots filled from this brief; never leave a slot holding example text. Write files in the user's language for prose and keep keys in English.

Contents: 1 Idea set, 2 Concept card, 3 Hook sheet, 4 Open-loop ledger, 5 Script table, 6 Storyboard plan, 7 Shot table, 8 Animatic spec, 9 Treatment, 10 Campaign matrix, 11 Hand-off note (with hand-off routing and rules), 12 Files read and written.

> The open-loop ledger schema is adapted from nateherkai/herk-edit-kit `references/curiosity-and-entertainment.md` (MIT and pipeline use permission: "Retain this notice when redistributing the kit or substantial portions of its source materials."). Changes: example values replaced by slots. The storyboard frame fields follow heygen-com/hyperframes docs (Apache-2.0). The shot table columns follow alchaincyf/huashu-art-motion (MIT). The script table follows Omar-Tnzxo video-production-studio.

## 1. Idea set (`ice/plan/concepts.md`)

```markdown
# Ideas: <project>
Date: <runtime date>
Message: This film tells <audience> that <message>.
Grounding: <brief slots used>; research <note ids with dates>
Typical direction for this category (named, not recommended): <one line>

<concept cards, all presented before any recommendation>

Recommendation (after all cards): <card id> because <one line>; mix allowed: <yes/no, which parts>
Critic note (ice-direction): <summary>
```

## 2. Concept card

```markdown
## <id>. <title>
- Logline: <one sentence predicting the hero moment>
- Why it works: <reason for this audience> (source: <brief slot / research note>)
- Hook 0-3 s: seen: <...>; heard: <...>
- Carrier: <what survives every boundary>
- Beat sheet: <t0-t1 job>, <t1-t2 job>, ...
- Hero moment: <what> at about <s>
- Literal anchors: <each symbolic device -> the real thing it stands for -> where it is first seen; or "no symbolic device"> (grounding rule: the `ice-qa` skill, `references/clarity-gate.md` section 6)
- Product beat: <for a brand whose offer is an app, a SaaS or a product: the beat where it does its real job, cause then effect; else "none">
- Proof shots: <real sources>
- End card and CTA: <...>
- Rules out: <...>
- Look intent: <one line>
- Risk: <...>
- Fingerprint: <concept> . <scene count> . <main object per scene> . <opening> . <closing>
```

## 3. Hook sheet (`ice/plan/hooks.md`)

```markdown
# Hooks: <project>
Priority test: benefit <...>; open question <...>; payoff at <s>
| Opening | Leads with | Frame 0 | By 1 s | By 3 s | Heard | Muted read | Choice notes |
|---|---|---|---|---|---|---|---|
| A | <typography/object/camera/...> | | | | | | |
| B | | | | | | | |
| C | | | | | | | |
Chosen: <A/B/C> because <reason>
```

## 4. Open-loop ledger (`ice/plan/open-loops.json`)

```json
{
  "opening": { "benefit": "<...>", "evidenceBy3": "<...>", "payoffTime": 0.0 },
  "loops": [
    {
      "id": "main",
      "question": "<honest viewer question>",
      "object": "<visible unresolved state>",
      "setup": 0.0,
      "updates": [{ "time": 0.0, "state": "<partial answer or reminder>" }],
      "closure": 0.0,
      "resolution": "<what visibly resolves>",
      "supportingSpeech": "<verbatim line, or labelled paraphrase>"
    }
  ]
}
```

`opening` is optional. Times are output seconds; at most one main and one secondary loop open at once.

## 5. Script table (`ice/plan/script.md`)

```markdown
# Script: <project>
Language and dialect: <...>; length target: <s>; pace source: ice-audio <entry>; word budget: <n>
| Shot | Time | Visual (real source) | On-screen text (quoted) | VO line | Delivery | Visual cue | Music and SFX |
|---|---|---|---|---|---|---|---|
| 1 | <a-b> | <...> | "<...>" | "<...>" | <...> | <number/name/contrast/metaphor/none> | <...> |
Facts used: <truth sheet ids>
Illustrative content declared: <none / list>
```

## 6. Storyboard plan (`ice/plan/storyboard.md`)

The `ice-qa` storyboard linter reads this file: keep the three style lock lines and the shot table (section 7) exactly as named. Format the linter reads: the `ice-qa` skill, `references/storyboard-lint.md` section 1.

```markdown
# Storyboard: <project> (v<n>)
Message: <...> | Arc: <...> | Audience: <...> | Mood: <...>
Direction: colour rule <from ice-direction>; reveal pacing <spoken cues / timestamps>; breather: frame <n>; negative list: <...>
Callback: planted in frame <n> as <...>; returns in frame <m> as <...>

<style lock lines and shot table from section 7>

## Frame <n> (<a-b s>)
type: <...> | persuasion: <...> | beat: <...> | focal: <...> | roles: <fg / support / bg>
Elements: <element, motion, layout, style, timing; one sentence each>
Hold: <still / slow push>, per ice-motion policy
Sketch: <path to wireframe or text grid>
Changelog: v<n>: <change>
```

## 7. Shot table

Each lock line sits on its own line above the table. The nine linter columns come first, named exactly (`Trigger` and `Reason` tie every element to the script line that justifies it: the `ice-qa` skill, `references/storyboard-lint.md` section 3b); extra columns (`#`, `Sound`) are allowed after them.

```markdown
Style: <one sentence; one style for the whole film>
Palette: <3 to 6 hex values with roles, copied from ice/DIRECTION.md>
Characters: <none / hands and backs only / frame library <path> / rig <path>>
| Time | Object | Action | Camera | On-screen text | Trigger | Reason | Method | Tags | # | Sound |
|---|---|---|---|---|---|---|---|---|---|---|
| <a-b> | <noun> | <the object's own verb> | <...> | "<quoted text or none>" | "<script sentence or word>" at <s> | <what it means, who it is on, why its colour and shape> | <template:<name> / code scene / footage <file>> | <at most 3> | <n> | <...> |
```

## 8. Animatic spec (`ice/plan/animatic.md`)

```markdown
# Animatic: <project>
Must prove: <story questions the animatic answers>
| # | In | Out | Sketch | VO draft | Rough sound | Loop state |
Receiving workflow renders: low resolution, speech, rough sound; lock the cut after review.
```

## 9. Treatment (`ice/plan/TREATMENT.md`)

Treatment template, rules and self-check: the `ice-direction` skill, `references/treatment.md` sections 5 to 10.

## 10. Campaign matrix (`ice/plan/campaign.md`)

```markdown
Campaign idea: <concept card id>
| Execution | Platform | Aspect | Length | Audience slice | Language | Hook | CTA | Varies | Fixed | New material needed |
```

## 11. Hand-off note (`ice/plan/handoff.md`)

```markdown
Target workflow: <ice-film / ice-explainer / ice-edit / ice-remake / ice-lottie>
Film or edit type: <type name from architecture section 4>
Approved files: <paths and versions>
Viewer takeaway: <path to the block under the chosen concept in ice/plan/concepts.md; the build route's cold-viewer reads are matched against it>
Stated by the user: <...>
Inferred and decided: <...> (logged in ice/DIRECTION.md)
Open questions: <...>
Required inputs: <...>
Commercial use: <yes/no/unknown>
```

### Hand-off routing and rules (moved from the ice-ideas SKILL.md, section 6)

| The approved idea is | Hand to | Pass along |
|---|---|---|
| A motion film from scratch (launch, app ad, brand film, logo sting, kinetic type, data story, social short, hype promo, UI walkthrough, music video, art film, industry spot) | `ice-film` | concept card, hook sheet, script, storyboard, treatment |
| A film where the voiceover leads (explain, teach, narrate, document) | `ice-explainer` | script (approved), storyboard, research facts |
| An edit of the user's footage (shorts, talking-head ad, podcast, long-form) | `ice-edit` | hook sheet, open-loop ledger, story plan built on the transcript |
| A new film in the style of a reference | `ice-remake` | concept card and treatment; the reference analysis is `ice-remake`'s job |
| Lottie, UI motion, loader, icon | `ice-lottie` | concept card and motion intent |
| A campaign | one hand-off per execution, same workflow each time unless a variant changes type | campaign matrix row plus its own hook |

Hand-off rules:
- Write `ice/plan/handoff.md` (the template above): target workflow, approved files, what is stated vs inferred, open questions, required inputs only the user can give.
- Revision is not confirmation. Step mode: an edited plan goes back on its stage's review card, and only the user's own words approve it. Auto mode: the approver role passes it, it is logged in `ice/DIRECTION.md`, and the delivery note says what changed.
- Never change `route` or `order` in `ice/state.json` and never start building inside this skill. The hand-off note names the receiving workflow; the stages after the last deliverable are already `not_used` with the note `not asked; hand-off` (the skill's `## Spine stages`), so the run ends at 10.
- The build starts only when the user asks for it in their own words. Then the router switches the route and order and sets those stages back to `missing` (the skill's `## Spine stages`, "Route changes").
- Stopping here is the normal end: deliver and offer the build in one line.

## 12. Files read and written (moved from the ice-ideas SKILL.md, section 2)

| Reads | Writes |
|---|---|
| `ice/BRIEF.md` (router + `ice-direction`) | `ice/plan/concepts.md` (concept set) |
| `ice/DIRECTION.md` (decisions so far) | `ice/plan/hooks.md` (hook sheet, openings) |
| `ice/research/` (dated notes) | `ice/plan/open-loops.json` (when loops are used) |
| User material: product, site, script, transcript, brand files | `ice/plan/script.md` (script table) |
| `ice/state.json` | `ice/plan/storyboard.md`, `ice/plan/animatic.md` |
| | `ice/plan/TREATMENT.md`, `ice/plan/campaign.md`, `ice/plan/versions.md` |
| | `ice/plan/mood-board/` and style frame notes (when 05 runs) |
| | `ice/plan/handoff.md` (what the next workflow receives) |
