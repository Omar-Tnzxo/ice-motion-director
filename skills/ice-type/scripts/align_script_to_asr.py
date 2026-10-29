#!/usr/bin/env python3
# Adapted from digitalsamba/claude-code-video-toolkit (MIT, Copyright (c) 2024 Digital Samba), tools/captions.py.
# Changes: kept only the script-to-transcript alignment (align, norm); removed transcription engines,
# Remotion output and toolkit imports; made word normalization Unicode-aware (any script with spaces);
# added JSON file input/output, two input key formats and a CLI exit code for stale scripts;
# UTF-8 console output so Arabic or other non-ASCII words print on Windows.
# Ice 0.2.4: added the --check-captions mode (captions checked against a fresh transcript of the
# final audio, lesson L11) with Arabic folding; the alignment mode and its CLI are unchanged.
"""Align approved script words onto ASR word timings, or check captions against a fresh transcript.

Captions must spell what the script says; ASR supplies timing only.

Alignment mode (unchanged):
    python align_script_to_asr.py SCRIPT.txt ASR_WORDS.json [-o OUT.json] [--min-match 0.6]

    ASR_WORDS.json: a JSON array of words, each either {"w", "s", "e"} or {"word", "start", "end"}
    (seconds). Output: a JSON array of {"w", "s", "e"} in script order, plus a summary on stderr.
    Exit codes: 0 ok, 2 bad input, 3 match ratio below --min-match (script probably stale).

Caption check mode (the fresh transcript gate, lesson L11):
    python align_script_to_asr.py --check-captions CAPTIONS FRESH_ASR_WORDS.json
        [-o REPORT.json] [--max-offset 0.25] [--allow-extra]

    CAPTIONS: the delivered captions as .srt, .vtt or .json (a JSON array of words
    {"w"|"word"|"text", "s"|"start", "e"|"end"} or of cues {"text", "start", "end"}; an object with a
    "cues", "words" or "segments" array is also read). FRESH_ASR_WORDS.json: a NEW transcript of the
    final mixed audio, in the word formats of the alignment mode (never the transcript the captions
    were built from). Words are compared after normalization: Unicode NFKC, lowercase, letters,
    digits and apostrophes only, plus Arabic folding (diacritics and tatweel removed, alef forms to
    bare alef, alef maqsura to yaa, taa marbuta to haa, Arabic-Indic digits to Western digits).
    The report (stdout, and -o when given) has the keys ok, caption_words, heard_words,
    match_ratio, max_offset, mismatches (objects with kind "missing" = in the captions but not
    heard, "extra" = heard but not in the captions, "changed" = a caption word heard as another
    word; plus caption, heard and t in seconds) and offsets (cues whose start differs from the
    start of their first matched heard word by more than --max-offset seconds).
    --allow-extra: planned drops (fillers, keyword-only text) are still listed as "extra" but do
    not fail the check.
    Exit codes: 0 no mismatch and every offset within --max-offset, 4 otherwise, 2 bad input.

Needs only the Python 3.8+ standard library.
"""
from __future__ import annotations

import argparse
import difflib
import json
import re
import sys
import unicodedata
from pathlib import Path

MIN_MATCH_RATIO = 0.6  # below this share of script words found in the transcript, the script is probably stale
MIN_WORD_SPAN = 0.12   # seconds given to each interpolated word when there is no room
MAX_CUE_OFFSET = 0.25  # seconds a caption cue may start away from its first heard word in --check-captions


def norm(word: str) -> str:
    """Lowercase and keep letters, digits and apostrophes from any script."""
    return "".join(ch for ch in word.lower() if ch.isalnum() or ch == "'")


# Arabic folding for the caption check: marks and tatweel go, letter variants fold to one form.
_AR_MARKS = re.compile("[ؐ-ًؚ-ٰٟۖ-ۜ۟-۪ۨ-ۭـ]")
_AR_FOLD = str.maketrans({
    "أ": "ا", "إ": "ا", "آ": "ا", "ٱ": "ا",  # alef forms
    "ى": "ي", "ی": "ي",  # alef maqsura and Farsi yeh to yaa
    "ة": "ه",  # taa marbuta to haa
    **{chr(0x0660 + d): str(d) for d in range(10)},  # Arabic-Indic digits
    **{chr(0x06f0 + d): str(d) for d in range(10)},  # Extended Arabic-Indic digits
})


def fold(word: str) -> str:
    """Normalize a word for the caption check: NFKC, Arabic folding, then norm()."""
    w = unicodedata.normalize("NFKC", word)
    w = _AR_MARKS.sub("", w).translate(_AR_FOLD)
    return norm(w)


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


# ---------- caption check mode (lesson L11) ----------

_TIME = r"(?:(\d+):)?(\d{1,2}):(\d{2})[,.](\d{1,3})"
_CUE_TIME = re.compile(_TIME + r"\s*-->\s*" + _TIME)
_TAGS = re.compile(r"<[^>]*>|\{\\[^}]*\}")


def _secs(h: str | None, m: str, s: str, ms: str) -> float:
    return int(h or 0) * 3600 + int(m) * 60 + int(s) + int(ms.ljust(3, "0")) / 1000


def _parse_cue_text(text: str, start: float, end: float) -> dict | None:
    words = _TAGS.sub(" ", text).split()
    if not words:
        return None
    if end < start:
        raise ValueError(f"cue ends before it starts: {start} > {end}")
    return {"start": start, "end": end, "text": " ".join(words), "words": words}


def parse_subtitles(text: str) -> list[dict]:
    """Read SRT or WebVTT cues: every block whose timing line has 'start --> end'."""
    cues = []
    blocks = re.split(r"\n\s*\n", text.replace("\r\n", "\n").replace("\r", "\n").lstrip("﻿"))
    for block in blocks:
        lines = [ln for ln in block.split("\n") if ln.strip()]
        for idx, line in enumerate(lines):
            m = _CUE_TIME.search(line)
            if m:
                g = m.groups()
                cue = _parse_cue_text(" ".join(lines[idx + 1:]), _secs(*g[:4]), _secs(*g[4:]))
                if cue:
                    cues.append(cue)
                break
    return cues


def parse_caption_json(data) -> list[dict]:
    """Read a JSON array of words or of cues; each entry becomes one cue."""
    if isinstance(data, dict):
        for key in ("cues", "words", "segments"):
            if isinstance(data.get(key), list):
                data = data[key]
                break
    if not isinstance(data, list):
        raise ValueError("caption JSON must be an array of words or cues")
    cues = []
    for item in data:
        if not isinstance(item, dict):
            raise ValueError(f"caption entry is not an object: {item}")
        text = next((item[k] for k in ("w", "word", "text") if k in item), None)
        start = next((item[k] for k in ("s", "start") if k in item), None)
        end = next((item[k] for k in ("e", "end") if k in item), None)
        if text is None or start is None or end is None:
            raise ValueError(f"caption entry needs text and start and end: {item}")
        cue = _parse_cue_text(str(text), float(start), float(end))
        if cue:
            cues.append(cue)
    return cues


def load_captions(path: Path) -> list[dict]:
    suffix = path.suffix.lower()
    raw = path.read_text(encoding="utf-8-sig")
    if suffix in (".srt", ".vtt"):
        cues = parse_subtitles(raw)
    elif suffix == ".json":
        cues = parse_caption_json(json.loads(raw))
    else:
        raise ValueError(f"captions must be .srt, .vtt or .json, got {path.name}")
    return sorted(cues, key=lambda c: c["start"])


def check_captions(cues: list[dict], heard: list[dict], max_offset: float,
                   allow_extra: bool = False) -> dict:
    """Align caption words to freshly heard words; report mismatches and cue start offsets."""
    cap = []  # one entry per caption word: cue index, word, estimated time
    for ci, cue in enumerate(cues):
        n = len(cue["words"])
        for k, w in enumerate(cue["words"]):
            t = cue["start"] + (cue["end"] - cue["start"]) * k / n
            cap.append({"cue": ci, "w": w, "t": t})
    a = [fold(c["w"]) for c in cap]
    b = [fold(h["w"]) for h in heard]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    match_of: list[int | None] = [None] * len(cap)
    mismatches = []

    def missing(i):
        mismatches.append({"kind": "missing", "caption": cap[i]["w"], "heard": None, "t": round(cap[i]["t"], 3)})

    def extra(j):
        mismatches.append({"kind": "extra", "caption": None, "heard": heard[j]["w"], "t": round(heard[j]["s"], 3)})

    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == "equal":
            for k in range(i2 - i1):
                match_of[i1 + k] = j1 + k
        elif op == "delete":
            for i in range(i1, i2):
                missing(i)
        elif op == "insert":
            for j in range(j1, j2):
                extra(j)
        else:  # replace: pair words in order, leftovers are missing or extra
            pairs = min(i2 - i1, j2 - j1)
            for k in range(pairs):
                mismatches.append({"kind": "changed", "caption": cap[i1 + k]["w"],
                                   "heard": heard[j1 + k]["w"], "t": round(heard[j1 + k]["s"], 3)})
            for i in range(i1 + pairs, i2):
                missing(i)
            for j in range(j1 + pairs, j2):
                extra(j)

    offsets = []
    for ci, cue in enumerate(cues):
        first = next((k for k, c in enumerate(cap) if c["cue"] == ci and match_of[k] is not None), None)
        if first is None:
            continue
        h = heard[match_of[first]]
        off = cue["start"] - h["s"]
        if abs(off) > max_offset + 1e-9:
            offsets.append({"cue": ci + 1, "text": cue["text"], "caption_start": round(cue["start"], 3),
                            "heard_start": round(h["s"], 3), "heard_word": h["w"], "offset": round(off, 3)})

    matched = sum(1 for m in match_of if m is not None)
    failing = [m for m in mismatches if not (allow_extra and m["kind"] == "extra")]
    return {
        "ok": not failing and not offsets,
        "caption_words": len(cap),
        "heard_words": len(heard),
        "match_ratio": round(matched / max(len(cap), 1), 4),
        "max_offset": max_offset,
        "mismatches": mismatches,
        "offsets": offsets,
    }


def run_check(args) -> int:
    try:
        cues = load_captions(Path(args.script))
        heard = load_heard(Path(args.asr))
    except (OSError, ValueError, KeyError, TypeError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 2
    if not cues:
        print("Error: captions file has no cues with words", file=sys.stderr)
        return 2
    if not heard:
        print("Error: fresh transcript has no words", file=sys.stderr)
        return 2
    report = check_captions(cues, heard, args.max_offset, args.allow_extra)
    payload = json.dumps(report, ensure_ascii=False, indent=1) + "\n"
    if args.out:
        Path(args.out).write_text(payload, encoding="utf-8")
    sys.stdout.write(payload)
    print(f"{report['caption_words']} caption words, {report['heard_words']} heard, "
          f"{report['match_ratio']:.0%} matched, {len(report['mismatches'])} mismatches, "
          f"{len(report['offsets'])} cues over {args.max_offset} s", file=sys.stderr)
    return 0 if report["ok"] else 4


def main() -> int:
    for _stream in (sys.stdout, sys.stderr):
        if hasattr(_stream, "reconfigure"):
            _stream.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser(
        description="Align approved script words onto ASR word timings, or (--check-captions) "
                    "check delivered captions against a fresh transcript of the final audio.")
    ap.add_argument("script", help="Narration-only script text file (UTF-8); with --check-captions: "
                                   "the captions file (.srt, .vtt or .json)")
    ap.add_argument("asr", help="ASR word timings JSON; with --check-captions: the fresh transcript words")
    ap.add_argument("-o", "--out", help="Output JSON path (default: stdout)")
    ap.add_argument("--min-match", type=float, default=MIN_MATCH_RATIO,
                    help=f"Minimum share of script words matched (default {MIN_MATCH_RATIO})")
    ap.add_argument("--check-captions", action="store_true",
                    help="Check captions against a fresh transcript (exit 0 match, 4 mismatch, 2 bad input)")
    ap.add_argument("--max-offset", type=float, default=MAX_CUE_OFFSET,
                    help=f"With --check-captions: largest cue start offset in seconds (default {MAX_CUE_OFFSET})")
    ap.add_argument("--allow-extra", action="store_true",
                    help="With --check-captions: heard words missing from the captions are listed but do not fail")
    args = ap.parse_args()

    if args.check_captions:
        return run_check(args)

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
