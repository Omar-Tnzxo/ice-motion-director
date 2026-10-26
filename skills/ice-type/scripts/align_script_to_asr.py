#!/usr/bin/env python3
# Adapted from digitalsamba/claude-code-video-toolkit (MIT, Copyright (c) 2024 Digital Samba), tools/captions.py.
# Changes: kept only the script-to-transcript alignment (align, norm); removed transcription engines,
# Remotion output and toolkit imports; made word normalization Unicode-aware (any script with spaces);
# added JSON file input/output, two input key formats and a CLI exit code for stale scripts;
# UTF-8 console output so Arabic or other non-ASCII words print on Windows.
"""Align approved script words onto ASR word timings.

Captions must spell what the script says; ASR supplies timing only.

Usage:
    python align_script_to_asr.py SCRIPT.txt ASR_WORDS.json [-o OUT.json] [--min-match 0.6]

ASR_WORDS.json: a JSON array of words, each either {"w", "s", "e"} or {"word", "start", "end"}
(seconds). Output: a JSON array of {"w", "s", "e"} in script order, plus a summary on stderr.

Exit codes: 0 ok, 2 bad input, 3 match ratio below --min-match (script probably stale).
Needs only the Python 3.8+ standard library.
"""
from __future__ import annotations

import argparse
import difflib
import json
import re
import sys
from pathlib import Path

MIN_MATCH_RATIO = 0.6  # below this share of script words found in the transcript, the script is probably stale
MIN_WORD_SPAN = 0.12   # seconds given to each interpolated word when there is no room


def norm(word: str) -> str:
    """Lowercase and keep letters, digits and apostrophes from any script."""
    return "".join(ch for ch in word.lower() if ch.isalnum() or ch == "'")


def load_heard(path: Path) -> list[dict]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise ValueError("ASR file must be a JSON array of words")
    heard = []
    for item in data:
        if "w" in item:
            w, s, e = item["w"], item["s"], item["e"]
        elif "word" in item:
            w, s, e = item["word"], item["start"], item["end"]
        else:
            raise ValueError(f"word entry without w/word key: {item}")
        if str(w).strip():
            heard.append({"w": str(w).strip(), "s": float(s), "e": float(e)})
    return heard


def script_words(text: str) -> list[str]:
    """Split narration into words. Strips markdown headings and bracketed stage directions."""
    lines = [ln for ln in text.splitlines() if not ln.lstrip().startswith("#")]
    body = re.sub(r"\[[^\]]*\]", " ", "\n".join(lines))
    return body.split()


def align(script: list[str], heard: list[dict]) -> tuple[list[dict], float]:
    """Map script words onto heard-word timings; interpolate unmatched runs.

    Returns the timed script words and the share of them matched directly.
    """
    sm = difflib.SequenceMatcher(
        a=[norm(w) for w in script],
        b=[norm(h["w"]) for h in heard],
        autojunk=False,
    )
    starts: list[float | None] = [None] * len(script)
    ends: list[float | None] = [None] * len(script)
    matched = 0
    for a, b, n in sm.get_matching_blocks():
        matched += n
        for k in range(n):
            starts[a + k] = heard[b + k]["s"]
            ends[a + k] = heard[b + k]["e"]
    total_end = heard[-1]["e"] if heard else 0.0
    i = 0
    while i < len(script):
        if starts[i] is not None:
            i += 1
            continue
        j = i
        while j < len(script) and starts[j] is None:
            j += 1
        lo = ends[i - 1] if i > 0 else 0.0
        hi = starts[j] if j < len(script) else total_end
        span = max(hi - lo, MIN_WORD_SPAN * (j - i))
        for k in range(i, j):
            starts[k] = lo + span * (k - i) / (j - i)
            ends[k] = lo + span * (k - i + 1) / (j - i)
        i = j
    words = [{"w": w, "s": round(starts[k], 3), "e": round(ends[k], 3)} for k, w in enumerate(script)]
    return words, matched / max(len(script), 1)


def main() -> int:
    for _stream in (sys.stdout, sys.stderr):
        if hasattr(_stream, "reconfigure"):
            _stream.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser(description="Align approved script words onto ASR word timings.")
    ap.add_argument("script", help="Narration-only script text file (UTF-8)")
    ap.add_argument("asr", help="ASR word timings JSON")
    ap.add_argument("-o", "--out", help="Output JSON path (default: stdout)")
    ap.add_argument("--min-match", type=float, default=MIN_MATCH_RATIO,
                    help=f"Minimum share of script words matched (default {MIN_MATCH_RATIO})")
    args = ap.parse_args()

    try:
        text = Path(args.script).read_text(encoding="utf-8")
        heard = load_heard(Path(args.asr))
    except (OSError, ValueError, KeyError, json.JSONDecodeError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 2
    words = script_words(text)
    if not words:
        print("Error: script has no words", file=sys.stderr)
        return 2
    if not heard:
        print("Error: ASR file has no words", file=sys.stderr)
        return 2

    timed, ratio = align(words, heard)
    payload = json.dumps(timed, ensure_ascii=False, indent=1) + "\n"
    if args.out:
        Path(args.out).write_text(payload, encoding="utf-8")
    else:
        sys.stdout.write(payload)
    print(f"{len(timed)} script words, {ratio:.0%} matched to ASR", file=sys.stderr)
    if ratio < args.min_match:
        print("WARNING: script and audio disagree; is the script stale?", file=sys.stderr)
        return 3
    return 0


if __name__ == "__main__":
    sys.exit(main())
