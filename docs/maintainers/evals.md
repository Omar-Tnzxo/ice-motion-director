# Behaviour evals

The tests in `tests/` prove that a rule is written. The behaviour suite proves that an agent with Ice installed applies it on its own: it runs Ice on real inputs with a plain user prompt, stops at the stage 06 preview, and graders judge the plan files against every lesson in [`lessons.md`](lessons.md). Run it before every release tag.

The suite is one file, [`evals/behavior.mjs`](../../evals/behavior.mjs): the cases, the graders and a builder that writes the case folders `claude plugin eval` reads into `evals/generated/` (ignored by git, so the plugin stays inside its file budget and no footage is ever committed). The trigger set in `evals/trigger-eval.json` is separate ([`evals/README.md`](../../evals/README.md)).

## 1. What you need

- **A machine that can confine a shell.** Ice needs Bash for FFmpeg, Node and Python, and `claude plugin eval` refuses any run that grants Bash or PowerShell where it has no sandbox backend. Native Windows has none: run the suite on Linux or macOS with the sandbox installed (on Linux, bubblewrap and socat), or inside WSL2 on Windows.
- **Claude Code 2.1.269 or newer, logged in** (`claude auth status` shows `"loggedIn": true`). Every run is a full `claude` child on your own credential, and the judge uses it too; an expired session stops the suite at its first run.
- **Ice's own tools on that machine:** Node 22 or newer, FFmpeg, Python 3.10 or newer, Chrome or Chromium for renders, and `yt-dlp` for the builder. Ice installs its pinned Python packages and models itself.
- **Disk room.** The input cache holds about 100 MB. Each run's workspace sits in the system temp folder and can reach a few GB (models, frames, previews): point `TMPDIR` (and on Windows `TEMP` and `TMP`) at a drive with room before you run.

## 2. Build the cases

```bash
node evals/behavior.mjs list
node evals/behavior.mjs build --inputs <cache folder> --local <folder with the local inputs>
```

`build` downloads each input from its link, trims it to 10-45 s (enough for a reel, cheap to analyse) and writes `evals/generated/<case>/case.yaml` and `scaffold.sh`. The scaffold only copies the trimmed files from the cache into the empty workspace, so it stays inside the 120 s scaffold limit. Inputs with no public link are looked up in `--local` by file name; `list` names each one and where it came from. A case whose inputs are missing is skipped with the reason, and the others still build. Use `--case <name>` (repeatable) for some cases, and `--no-fetch` to write only the cases whose inputs are already cached.

## 3. Run the suite

```bash
claude plugin eval . --eval-dir evals/generated --scaffold --allow-tools Bash Write Edit WebFetch WebSearch --ablation none --trust-plugin --output-dir <results folder> --max-cost-usd <budget>
```

- `--allow-tools`: the cases list these tools, but a tool that can change files or reach the network runs only when the command line grants it too. Without the Bash grant the tool-call graders cannot pass, and the run warns about each one before it starts.
- `--ablation none`: the prompts start with the plugin's own command, so a run without the plugin would only measure that the command is missing, at double the cost.
- One case: `--case aj-obama`. The five trials: `--tag trial`. The other styles: `--tag style`.
- Each case allows up to 200 turns and 3600 s, and runs once (`--runs 2` or more for a release check, because LLM graders vote and one run can be unlucky). `-j 2` runs two cases at once on the same credential.
- The judge is Haiku by default; `--judge-model` sets another one for the LLM graders.
- Results: `report.html` and `aggregate-result.json` in the output folder (published privately to claude.ai unless `--no-publish`). A grader's name starts with its lesson id (`l5-speaker-stays-lit` is lesson L5), so a red row points straight at the rule.
- **Release check:** keep `aggregate-result.json` of each release. A new release is tagged only when no case scores lower than in the previous release, and every failed grader is either fixed in the skills or explained in the release notes.

## 4. The cases

Every prompt is the user's words only: the command `/ice-motion-director:ice`, the idea, the files, and one sentence a user types (no start questions, show me the preview before the build). No rule is ever written into a prompt: what the lessons taught must come from the skills.

| Case | Comes from | Input (trimmed) | Facets |
|---|---|---|---|
| `aj-carney` | trial run-carney | a head of government's video message, an Al Jazeera English reel as reference | speaker, reference, marks, media |
| `aj-obama` | trial run-obama | the 2015 Weekly Address (public domain), the same reference | speaker, reference, marks, media |
| `aj-greenscreen-ad` | trial run-greenscreen | a green-screen service ad, the same news reference, the user asks for the news identity | speaker, reference, marks, media, conflict |
| `aj360-leadership` | trial run-aj360 | a 10 s speaker clip, an Al Jazeera 360 promo as reference | speaker, reference, marks, media |
| `mohawalat-episode` | the Mohawalat Fahm showcase | 40 s of a talk-show episode, two programme reels as references | speaker, reference, marks, media |
| `product-ad-scratch` | another style | no files: a vertical app ad from one sentence | media |
| `podcast-clip` | another style | 40 s of a NASA video podcast | speaker |
| `explainer-voiceover` | another style | 35 s of a NASA expert's voice as the voiceover | media |
| `motion-remake-brand` | another style | another brand's launch motion film as the reference for a browser ad | reference, media, conflict |

Facets decide which graders a case gets: `speaker` (a person speaks on camera), `reference` (a style reference video), `marks` (the reference keeps fixed identity marks on screen), `media` (the film needs outside footage, photos or brand material), `conflict` (the content type or the brand differs from the reference's).

## 5. The graders

`claude plugin eval` has no code graders, so each check is one of: a regex over a plan file at its fixed path, a regex over the list of files the run created (paths that hold a reference id), a regex over the tool calls in the trace (what the agent wrote or ran, never a skill file it read), a tool count, or an LLM judge that reads one file or the last reply and votes PASS or FAIL with its reason.

| Grader | Lesson | Reads | Passes when |
|---|---|---|---|
| `no-final-render` | case | created files | nothing under `ice/renders/final/` |
| `stops-at-preview` | case | last reply (LLM) | the reply shows the preview and asks for approval, without the waived start questions |
| `l1-no-code-sound-run` | L1 | trace | no shell call ran mgaudio or an FFmpeg tone or noise source |
| `l1-real-music-and-sfx` | L1 | `ice/DIRECTION.md` (LLM) | every music and sound decision names real recorded material |
| `l2-media-fetched` | L2 | created files | the run fetched footage, photos, sound or brand material into the project's `assets/` itself |
| `l2-sources-recorded` | L2 | created files | a download sidecar in `ice/assets/sources/`, `CREDITS.md`, the footage ledger or `BRAND-MATERIAL.md` exists |
| `l3-no-install-question` | L3 | last reply (LLM) | no question about installing free tools or downloading free media |
| `l4-reason-columns` | L4 | `ice/plan/storyboard.md` | the element table has Trigger and Reason columns |
| `l4-storyboard-linted` | L4, L12 | trace (Bash calls) | `storyboard_lint.py` ran (checks 17 and 21: triggers, reasons, cited words, depth routes) |
| `l4-triggers-cite-the-words` | L4 | `ice/plan/storyboard.md` (LLM) | every element quotes the words it follows and gives a real reason |
| `l4-reference-reasons` | L4 | created files | `ice/reference/<ref-id>/REASONS.md` exists |
| `l5-speaker-stays-lit` | L5 | `ice/plan/storyboard.md` (LLM) | the speaker is never dimmed, silhouetted or put in the disc |
| `face-clear-of-text` | L5 | `ice/plan/storyboard.md` (LLM) | no text or graphic is planned over the face or hands |
| `l6-finishing-measured` | L6 | trace | the run wrote the "Finishing layer" table of the reference's `ANALYSIS.md` |
| `l6-finishing-by-reason` | L6 | `ice/DIRECTION.md` (LLM) | each finishing effect has its place, value and reason |
| `l7-identity-fits-content` | L7 | `ice/DIRECTION.md` (LLM) | the identity fits the content; the reference's identity is an alternative only |
| `l8-disk-space-checked` | L8 | trace (Bash calls) | `ice-state.mjs space` ran |
| `l9-reference-events` | L9 | created files | the reference's `analysis/events.json` exists |
| `l9-gap-checked` | L9 | trace (Bash calls) | `validate-plan.mjs` or `motion_check.py` ran on the plan |
| `l10-marks-measured` | L10 | trace | the run wrote the reference's `Fixed marks:` line |
| `l10-marks-in-their-slots` | L10 | `ice/plan/storyboard.md` (LLM) | each fixed mark keeps one measured slot, none invented |
| `l12-reference-depth` | L12 | created files | the reference's `analysis/depth.json` exists |
| `l12-depth-routes` | L12 | `ice/plan/storyboard.md` (LLM) | each depth, 3D or camera element has its `build:` route |

Not covered, by design: L11 (captions against a fresh transcript of the delivered audio) runs at stages 09 and 10, after these cases stop, and needs a full-run case. Numbers the graders cannot compute (the longest gap in seconds, face boxes, loudness) are checked through the scripts Ice must run and the files they write.

## 6. A new lesson gets a grader and a case

When a lesson lands in [`lessons.md`](lessons.md) (rule, scope, test), add its behaviour check in the same change:

1. **Grader.** Add an entry to `GRADERS` in `evals/behavior.mjs`: `lesson` (its id), a `name` that starts with the lowercase id, `when` (the facets of the cases where the lesson's scope holds; a general lesson is `() => true`), and the `spec`. Pick the cheapest grader that proves the behaviour: a regex over a plan file at its fixed path; a regex over `files` for files whose path holds a reference id; a regex over `trace` with the `CALL` prefix for content written to such a file; `tool_used` for a script the rule says to run; an LLM judge (one fixed file or `last_message`) only for judgement, with criteria that say exactly what passes and what fails.
2. **Case.** If no case has the facet the lesson needs, add one to `CASES`: a real input with a public link (a `youtube` id, or `local` with a note on where the file came from), trimmed to 10-45 s, rights left with the owner (fetched at build time, never committed), and a prompt in the user's own words that never states the rule. Add a facet when a new kind of case needs one.
3. **Prove it.** Build and run the case the lesson came from on the version before the fix (the grader should fail) and on the version with the rule (it should pass).
4. **Record it.** Add the grader to the table of section 5.
