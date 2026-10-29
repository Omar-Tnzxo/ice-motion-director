---
name: ice-style
description: >-
  Command: browses 150+ Ice Motion Director motion styles, or starts a film in one. Use it only when
  the user types /ice-style or $ice-style.
license: Apache-2.0
metadata:
  author: Omar-Tnzxo
  version: 0.2.5
  opencode/slash: "true"
---

# Ice Style: the style library as presets

## 1. Read what the user typed

Take the text the user typed after the command (in Claude Code it is also given as `$ARGUMENTS`). Decide the mode, first match wins:

| The text is | Mode |
|---|---|
| Empty, or "list", "all", "library" | Browse the families (section 2) |
| A family name or part of one (for example "paper", "data", "cartoon", "art history") | List that family (section 2) |
| A style name, alias or id, with or without a brief after it | Run the style (section 3) |
| A description of a look ("hand-drawn and warm", "retro game") | Suggest the 3 closest styles from the library and ask which one |

## 2. Browse

Open the `ice-styles` skill's `references/catalog-index.md`. It holds every style with its id, a one-line look and its best use, grouped by family.

- **Browse the families:** show one short table: family, number of styles, three example style names, what the family is good for (take it from the family's styles). End with two lines: `/ice-style <family>` to see a family, `/ice-style <style> <what your film is about>` to start a film.
- **List a family:** show that family's table as it is in the index (style, id, looks like, best for). End with the same run line.
- Keep it scannable: no extra commentary, plain words, no internal file names in the message.

## 3. Run a style

1. **Match.** Find the style in the catalog index by id, name or alias. Ignore case, spaces and hyphens. No clear match: show the 3 closest (name, looks like) and ask which one.
2. **Show the style card.** Open the style's entry in its family file in the `ice-styles` skill and show a short card: name, what it looks like, best for, not a good fit for, what the user should expect (pace, texture, sound). One short paragraph or a small table.
3. **Get the brief.**
   - The user already wrote what the film is about after the style: use it.
   - Nothing written: ask one question, "What is the film about?", and offer the platform and length as optional, with a recommended default (vertical, 15 to 30 seconds). If the user says "decide", pick and say what you picked.
4. **Start the film.** Open the `ice-motion-director` skill and follow it from its first section (a new project in auto mode, with the router's stops (`ice-motion-director/SKILL.md` section 5, "Stops") and nothing more), with these inputs added to the request:
   - The style is user-supplied and locked for stage 05 (look). Record it in `ice/BRIEF.md` with `source: user (ice-style preset <id>)`.
   - Everything else (concept, palette within the style, structure, sound) is still decided by the normal process, so the film is not a copy of the style's demo (the anti-sameness rules of `ice-direction` still apply to every axis except the style itself).
   - If the style needs real material (the evidence and data family does), the brief must say where it comes from; when it does not, that question goes into the router's single stage 01 message, never a separate stop.

## 4. Rules

- A preset locks the look family only. It never skips the business brief, research, concept or quality gates.
- Style names are generic descriptions. When a style is inspired by a known studio, show, artist or channel, say so only as "inspired by <name>" inside the card, never as the style's name.
- If the user asks for a style that is not in the library, say so, suggest the 3 closest, and offer to build a custom look through the normal direction process.
- Plain language in every message to the user.
