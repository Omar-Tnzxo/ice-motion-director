# Trigger evals

`trigger-eval.json` checks that the router skill (`skills/ice-motion-director`) fires for video and motion requests and stays quiet for near misses. It holds should-trigger and should-not-trigger prompts in English, Modern Standard Arabic (`ar`) and Egyptian Arabic (`ar-EG`). Each item is `{ "query", "should_trigger", "lang" }`; `query` and `should_trigger` are the format the skill-creator trigger tools read, and `lang` is only a label for the report.

The near misses are the useful half: engine debugging, file conversion, frontend animation code, summaries, and posts that are not a film. Add a prompt whenever a real request routed wrongly, and keep both halves about the same size.

## Run it

You need Claude Code (`claude` on PATH), Python 3.10 or newer, and the skill-creator plugin from the official Claude plugin marketplace. Run the router's description against the set, three runs per prompt:

```bash
cd <skill-creator plugin folder>/skills/skill-creator
python -m scripts.run_eval --eval-set <this repo>/evals/trigger-eval.json --skill-path <this repo>/skills/ice-motion-director --runs-per-query 3 --verbose
```

- Windows (PowerShell): set `$env:PYTHONUTF8 = "1"` first, so the Arabic prompts are read as UTF-8. cmd: `set PYTHONUTF8=1`. macOS and Linux need nothing extra.
- Run it once more with HyperFrames (and Remotion, if you use it) installed for the same user, because the router must win against their entry skills on film requests. Note in the pull request which other video skills were installed.
- Pass: every should-trigger prompt fires in at least 2 of 3 runs, and no should-not-trigger prompt fires in more than 1 of 3. To improve a failing description, use the same folder's `scripts.run_loop` with this eval set; it keeps a held-out part of the set so the description is not tuned to these exact prompts.

## With `claude plugin eval`

`claude plugin eval` reads one folder per case (`<case>/prompt.md` plus `graders/*.md`), not this JSON file, so it finds no cases here and the file stays the single source. To run a prompt through it, make a local case folder below the plugin, for example `evals/local/<case>/`, with the prompt in `prompt.md` and a `tool_used` grader on the `Skill` tool whose input matches `ice-motion-director` (a `max: 0` grader for a should-not-trigger prompt), then run `claude plugin eval <this repo> --eval-dir evals/local`. Do not commit `evals/local/`: the plugin stays near its file budget. Check `claude plugin eval --help` for the current options first.
