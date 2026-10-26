# Long-form explainers

Films over about 3 minutes, chaptered films, and any film built by several agents in parallel.

## 1. Length and chapters

- Never cap length and never assume it silently. An open length goes inside the stage 01 message (`ice-direction` question rules); unanswered, take the brief's platform default, log it as a D-entry and report it. Plan with the length budgets in `references/script-writing.md` section 10 (sentence and chapter counts per length: the `ice-ideas` skill, `references/script-writing.md` section 3).
- A very long request (illustration: ten minutes) is settled at 01 the same way, then built chapter by chapter as separate projects of about 90 s or less, joined at the end. This is a build strategy, not a length cap.
- Chapter cards appear only in films over about 3 minutes; each chapter is 60 s or more.
- A chapter progress bar switches its highlight at the chapter card's start, not at the chapter's first sentence. HUD label changes keep the capsule, morph its width over about 10 frames, fade the old text out and the new in; offset HUD changes from big effects by a few frames.
- Platform chapters (where the platform supports them): at least 3, each 10 s or longer, titles 1 to 60 characters.

## 2. Persistent world (one space, never reset)

A new graphic every few seconds makes the viewer restart comprehension every few seconds. For long arguments, the film lives in one space:
- Decide the spatial grammar before building anything and hold it for the whole runtime. Break it once, deliberately, for meaning.
- An element, once drawn, is never redrawn, moved or relabeled.
- Three altitudes: world, region, detail. Move between adjacent ones; jumping from detail to world is reserved for a payoff.
- Name framings as exact world windows, not scale factors; window edges fall between labels. Reuse the same window for the same purpose; near-identical framings read as drift.
- Movement duration varies with distance travelled, not one global preset.
- One traveling subject carries the story; its state visibly changes; it never teleports and moves along drawn connectors at constant speed.
- Spotlight: exactly one element at full brightness at a time; context dimmed but legible; finished props retire fully, not to a half-visible gray. One opacity authority per element per time window.
- Open loops in long-form (a visibly incomplete thing in the world, re-shown at every boundary, closed on the opening image): the `ice-ideas` skill, `references/hooks-and-openers.md` section 6. In a persistent world the incomplete thing is part of the world (illustration only: an empty socket on a spine, a ghosted top of a stack, an unfilled column, a blank end of a timeline).
- A counter needs a name: pair the numeral with a 1 to 2 word label of the current item.
- Time everything to word starts, entering 0.15 to 0.25 s ahead of the anchor; never divide a section evenly into beats. Any stretch over about 1.5 s with nothing happening is a dead screen.
- When a presenter is on camera, aim for about 40 percent presence across a graphics-led film; footage handling is `ice-edit`.

## 3. Production at scale

- Split the build into groups of shots (about 5 to 7 groups for a 4 to 5 minute film), one builder agent per group, dispatched in waves of about 4. Check machine-wide agent capacity first.
- One heavy task per agent: agents that already read many images fail often on a second heavy task.
- Agents write to disk as they go; an agent that holds everything to the end can lose an hour of work. Before relaunching a dead agent, check its files on disk; a nudge often revives it.
- Before fanning out, run a short probe render of any shared system (camera states, shared components) to catch problems that would make every group fail.
- Put cross-group constants and helpers in a shared library before dispatch; any tool the protocol names must exist there. One generator per section; edit the generator, never its generated output; shared modules are not touched by parallel builders. Namespace shared definitions (for example SVG ids) before assembly.
- Builders report storyboard errors they find; approved fixes become film-wide rules.
- Spot-check builder self-reports, but gather full evidence before concluding a builder was wrong.

## 4. Gates for long films

Approved below means: by the user in step mode; in auto mode by the critic and the approver, except item 4, which is the router's one preview approval when the session is interactive and the user did not say not to ask.

1. Length and language settled at 01 (answered or defaulted and logged).
2. Script approved with chapter names and seams.
3. Voice approved when the voice was open.
4. First group built, first 30 s rendered with voice, approved, before other groups start.
5. Full render v1 with contact sheets and frame metrics.
6. Review per chapter by fresh critics (at most about 7 shots each, plus one cross-chapter consistency pass), fix agents per 1 to 2 groups, render, recheck by new critics, final check. Let critics verify a proposed fix before it is dispatched.
7. Verify the assembled film, never section prototypes.

Reference result from a measured long explainer: version 1 had 1 high, 23 medium and 42 low findings, mostly blank frames at cuts, entrances crossing the caption band, exits not reaching zero and too-short overlay exits; two review rounds reached zero high and zero medium.

## 5. Session memory

Keep `ice/state.json` current and a short running log of decisions (with numbers) so a fresh session can resume. When a session degrades (re-deriving decided things, longer and less certain answers), write state to disk and continue in a fresh session that verifies before it trusts.
