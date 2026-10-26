# Delivery

What the user receives and what the report says. Encodes, platform specs and the measured delivery checks belong to ice-engines and ice-qa; this file defines the set and the report.

## Contents

1. Deliverable set
2. Naming and folders
3. The report
4. After delivery

## 1. Deliverable set

Every version below that the brief or the type asks for was planned at 03 in `ice/plan/versions.md`; delivery renders that list, it does not invent new versions.

| Item | Rule | Scope |
|---|---|---|
| Master | the brief's main aspect and length, mastered audio | all |
| Other aspects | re-laid out, never cropped; vertical cuts are often shorter (cut a product-detail beat, never the claim) | when the brief or type asks |
| Cutdowns | each cut (main, 15 s, 6 s) stands alone with its own hook | ads, launches |
| Captions | burned in and as a sidecar file from the same timings that were rendered; an uncaptioned master kept | narrated films |
| Poster or cover | the thesis or end lockup frame; poster rules: the `ice-engines` skill, `references/render-export.md` section 6, and covers per platform: `references/platform-specs.md` section 5 of the same skill | all |
| Silent cut and music-only version | for platforms that add their own audio and for sound complaints | launch films, ads |
| Stills | 3-6 key stills | launch and brand films |
| Loop | a 2-4 s loop or GIF of one complete idea | when useful |
| Source | the editable composition and plan files | all |
| Licences and credits | every third-party asset, font, music and SFX with its licence; a generation ledger (model, prompt, seed, job id, accepted window) when anything was generated | all |

## 2. Naming and folders

- Project-unique names from the brand or topic in kebab case, never the workspace name or a timestamp: `<project>_<film>_<aspect>_<length>s_v<N>.<ext>`.
- One folder per review round; approved items are copied to a `final/` folder: in step mode after the user approves at 10; in auto mode after 09 passes and the approver role checks the 10 row (no further user approval).
- "Final" in a brief or a conversation means the delivered master; its file name still carries `_v<N>` until it is approved that way. Only the copy in `final/` may drop the version or carry "final" (same rule as `review-loop.md` section 7).
- Never publish, post or schedule anything; delivery is files and links.

## 3. The report

The delivery report `ice/review/NOTE.md` uses the template of the `ice-qa` skill, `references/delivery-report.md` section 2, with every section filled, short, honest and in the user's language. Rules, status words and measured numbers: its section 1. The template already holds the film-side parts; fill them from this route's files:

- "Decided for you": every creative call made without asking (from `ice/DIRECTION.md`), so the user can overturn any in one reply.
- "The idea": the structure fingerprint line (`structure.md` section 7), how many axes differ from the nearest template, and one alternative direction for a next version.
- "Permissions": for a brand the user does not own, the owner's written permission for the logo, the screens and the name; for licensed music, the sync license terms (media, territory, term); for any person shown, their release; any regulated claim that needs the owner's approved wording (from `ice/research/COMPLIANCE.md`). Each line says what is needed and from whom, in plain words.
- "What a yes would add": every consent item the run skipped (an install, a download, a paid tool) and what it would change.

## 4. After delivery

- ice-qa writes the film's fingerprint to the local fingerprint file so the next film cannot repeat it.
- The user's verdict and the lesson from it go under `## User verdict` in `ice/review/NOTE.md` (the `ice-qa` skill, `references/delivery-report.md` section 3); a verdict that changes a decision also gets a superseding entry in `ice/DIRECTION.md`, so the next film in this project starts from it.
- A captioned claim about the process is true: no "made in minutes", "zero tools" or "one take" unless it was.

Sources: AbubakrChan/product-launch-motion, echris6/motion-video-kit, howseen-ai/claude-motion-design, video-production-studio (Omar-Tnzxo), lemomo-ai/lemo-opuscar, Vincentwei1021/mg-styles-15, commercial-motion-design (Omar-Tnzxo).
