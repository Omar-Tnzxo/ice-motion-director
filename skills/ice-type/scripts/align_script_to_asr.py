#!/usr/bin/env python3
# Adapted from digitalsamba/claude-code-video-toolkit (MIT, Copyright (c) 2024 Digital Samba), tools/captions.py.
# Changes: kept only the script-to-transcript alignment (align, norm); removed transcription engines,
# Remotion output and toolkit imports; made word normalization Unicode-aware (any script with spaces);
# added JSON file input/output, two input key formats and a CLI exit code for stale scripts;
# UTF-8 console output so Arabic or other non-ASCII words print on Windows.
# Ice 0.2.4: added the --check-captions mode (captions checked against a fresh transcript of the
# final audio, lesson L11) with Arabic folding; the alignment mode and its CLI are unchanged.
# 2026-10-29 (0.2.5): the --stem mode (masked words told apart from misheard ones: the clean voice stem and
# the delivered mix are transcribed with the same model and both aligned to the script; masked words exit 1,
# doubtful words go to ice/review/ear-list.json); the cue offset default is 0.1 s (0.15 s for sentence cards),
# matching caption-timing-and-truth.md; the ASR words file may carry a word probability ("p" or "probability").
"""Align approved script words onto ASR word timings, or check captions against a fresh transcript.

Captions must spell what the script says; ASR supplies timing only.

Alignment mode (unchanged):
    python align_script_to_asr.py SCRIPT.txt ASR_WORDS.json [-o OUT.json] [--min-match 0.6]

    ASR_WORDS.json: a JSON array of words, each either {"w", "s", "e"} or {"word", "start", "end"}
    (seconds). Output: a JSON array of {"w", "s", "e"} in script order, plus a summary on stderr.
    Exit codes: 0 ok, 2 bad input, 3 match ratio below --min-match (script probably stale).

Caption check mode (the fresh transcript gate, lesson L11):
    python align_script_to_asr.py --check-captions CAPTIONS FRESH_ASR_WORDS.json
        [-o REPORT.json] [--max-offset 0.1] [--sentence-cards] [--allow-extra]

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
    start of their first matched heard word by more than the cue's limit).
    Cue limit: 0.1 s; 0.15 s for a sentence card (a JSON cue with "card": "sentence" or
    "sentence_card": true, or every cue with --sentence-cards). --max-offset sets one limit for every cue.
    --allow-extra: planned drops (fillers, keyword-only text) are still listed as "extra" but do
    not fail the check.
    Exit codes: 0 no mismatch and every offset within its limit, 4 otherwise, 2 bad input.

Stem mode (masked or misheard words, any voiced film with or without captions):
    python align_script_to_asr.py --stem VOICE_STEM.wav --mix FILM.mp4 SCRIPT [--model base]
        [--language <code>] [--project .] [-o REPORT.json]
    python align_script_to_asr.py --stem-words STEM_WORDS.json --mix-words MIX_WORDS.json SCRIPT [...]

    The clean voice stem (film-length, starting at film 0) and the delivered mix are transcribed with
    the same pinned faster-whisper model (versions.json pip.faster-whisper; models.whisper), or read
    from word files in the alignment-mode formats with an optional "p" or "probability". SCRIPT is the
    approved script text (a scene is a paragraph: a blank line or a heading starts the next one) or
    the source transcript as JSON words (one scene unless the words carry "scene"). Both transcripts
    are aligned to SCRIPT and every script word is classified: ok; masked (right in the stem, lost or
    changed in the mix); misheard (wrong in both: pronunciation or the model); low_confidence (a word
    probability under 0.5, or right in the mix but not in the stem). Floors (mix-and-master.md section
    7): 0.8 matched per scene and 0.85 overall in the mix. The report (stdout, and -o or
    <project>/ice/review/speech-check.json) has ok, counts, overall, scenes, words (every word that is
    not ok) and blocking. Doubtful words (misheard, low confidence, and scenes under the floor in both
    transcripts) are added to <project>/ice/review/ear-list.json (the qc.py --audit format).
    Exit codes: 0 pass, 1 a masked word or a floor lost in the mix (the stem meets it), 2 bad input.

The alignment and caption modes need only the Python 3.8+ standard library; the stem mode needs
faster-whisper only when it transcribes (not with --stem-words and --mix-words).
"""
from __future__ import annotations

import argparse
import datetime
import difflib
import importlib
import json
import re
import sys
import unicodedata
from pathlib import Path

MIN_MATCH_RATIO = 0.6  # below this share of script words found in the transcript, the script is probably stale
MIN_WORD_SPAN = 0.12   # seconds given to each interpolated word when there is no room
MAX_CUE_OFFSET = 0.1   # seconds a caption cue may start away from its first heard word (caption-timing-and-truth.md)
SENTENCE_CARD_OFFSET = 0.15  # the same for a sentence card
SCENE_FLOOR, OVERALL_FLOOR = 0.8, 0.85  # --stem: share of script words heard in the mix (mix-and-master.md section 7)
LOW_PROBABILITY = 0.5   # --stem: a word heard with a lower probability is doubtful
DEFAULT_MODEL = "base"  # versions.json models.whisper cpu_default; pass --model for Arabic or noisy material


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
            word = {"w": str(w).strip(), "s": float(s), "e": float(e)}
            p = item.get("p", item.get("probability"))
            if p is not None:
                word["p"] = float(p)
            heard.append(word)
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


def _parse_cue_text(text: str, start: float, end: float, sentence_card: bool = False) -> dict | None:
    words = _TAGS.sub(" ", text).split()
    if not words:
        return None
    if end < start:
        raise ValueError(f"cue ends before it starts: {start} > {end}")
    return {"start": start, "end": end, "text": " ".join(words), "words": words, "sentence_card": sentence_card}


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
        card = str(item.get("card", "")).lower() == "sentence" or item.get("sentence_card") is True
        cue = _parse_cue_text(str(text), float(start), float(end), card)
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


def check_captions(cues: list[dict], heard: list[dict], max_offset: float | None,
                   allow_extra: bool = False, sentence_cards: bool = False) -> dict:
    """Align caption words to freshly heard words; report mismatches and cue start offsets.

    max_offset None: 0.1 s per cue, 0.15 s for a sentence card; a number: that limit for every cue."""
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
        card = sentence_cards or cue.get("sentence_card", False)
        limit = max_offset if max_offset is not None else (SENTENCE_CARD_OFFSET if card else MAX_CUE_OFFSET)
        if abs(off) > limit + 1e-9:
            offsets.append({"cue": ci + 1, "text": cue["text"], "caption_start": round(cue["start"], 3),
                            "heard_start": round(h["s"], 3), "heard_word": h["w"], "offset": round(off, 3),
                            "limit": limit})

    matched = sum(1 for m in match_of if m is not None)
    failing = [m for m in mismatches if not (allow_extra and m["kind"] == "extra")]
    return {
        "ok": not failing and not offsets,
        "caption_words": len(cap),
        "heard_words": len(heard),
        "match_ratio": round(matched / max(len(cap), 1), 4),
        "max_offset": max_offset if max_offset is not None else MAX_CUE_OFFSET,
        "sentence_card_offset": max_offset if max_offset is not None else SENTENCE_CARD_OFFSET,
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
    report = check_captions(cues, heard, args.max_offset, args.allow_extra, args.sentence_cards)
    payload = json.dumps(report, ensure_ascii=False, indent=1) + "\n"
    if args.out:
        Path(args.out).write_text(payload, encoding="utf-8")
    sys.stdout.write(payload)
    limit = f"{args.max_offset} s" if args.max_offset is not None else \
        f"{MAX_CUE_OFFSET} s ({SENTENCE_CARD_OFFSET} s sentence cards)"
    print(f"{report['caption_words']} caption words, {report['heard_words']} heard, "
          f"{report['match_ratio']:.0%} matched, {len(report['mismatches'])} mismatches, "
          f"{len(report['offsets'])} cues over {limit}", file=sys.stderr)
    return 0 if report["ok"] else 4


# ---------- stem mode: masked or misheard (0.2.5) ----------

def script_scenes(text: str) -> list[tuple[str, int]]:
    """Script words with their scene index: a blank line or a markdown heading starts the next scene."""
    out, scene, has_words = [], 0, False
    for line in text.splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            if has_words:
                scene, has_words = scene + 1, False
            continue
        for w in re.sub(r"\[[^\]]*\]", " ", line).split():
            out.append((w, scene))
            has_words = True
    return out


def load_reference_words(path: Path) -> list[tuple[str, int]]:
    """The script (text) or the source transcript (JSON words, an optional "scene" per word)."""
    if path.suffix.lower() == ".json":
        data = json.loads(path.read_text(encoding="utf-8-sig"))
        if isinstance(data, dict):
            data = next((data[k] for k in ("words", "segments") if isinstance(data.get(k), list)), None)
        if not isinstance(data, list):
            raise ValueError("a JSON source transcript must be an array of words")
        out = []
        for item in data:
            w = next((item[k] for k in ("w", "word", "text") if isinstance(item, dict) and k in item), None)
            if w is not None and str(w).strip():
                out += [(x, int(item.get("scene", 0))) for x in str(w).split()]
        return out
    return script_scenes(path.read_text(encoding="utf-8-sig"))


def transcribe_words(paths: list[Path], model_name: str, language: str | None) -> list[list[dict]]:
    """Word timings and probabilities of each file with ONE faster-whisper model (the same model for all)."""
    # Optional and installed on demand (versions.json pip.faster-whisper, in no requirements.txt): loaded by name.
    try:
        whisper = importlib.import_module("faster_whisper")
    except ImportError as exc:
        raise RuntimeError("faster-whisper is not installed: install the pin of versions.json (pip.faster-whisper) "
                           "into the project virtual environment, or pass --stem-words and --mix-words") from exc
    model = whisper.WhisperModel(model_name, device="auto", compute_type="auto")
    out = []
    for p in paths:
        segments, _info = model.transcribe(str(p), language=language, word_timestamps=True,
                                           condition_on_previous_text=False)
        out.append([{"w": w.word.strip(), "s": float(w.start), "e": float(w.end), "p": float(w.probability)}
                    for seg in segments for w in (seg.words or []) if w.word.strip()])
    return out


def _map_words(ref: list[str], heard: list[dict]) -> list[tuple[str, dict | None]]:
    """Per reference word: ("ok", heard word), ("changed", heard word) or ("lost", None)."""
    sm = difflib.SequenceMatcher(a=[fold(w) for w in ref], b=[fold(h["w"]) for h in heard], autojunk=False)
    out: list[tuple[str, dict | None]] = [("lost", None)] * len(ref)
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == "equal":
            for k in range(i2 - i1):
                out[i1 + k] = ("ok", heard[j1 + k])
        elif op == "replace":
            for k in range(min(i2 - i1, j2 - j1)):
                out[i1 + k] = ("changed", heard[j1 + k])
    return out


def classify_speech(ref: list[tuple[str, int]], stem: list[dict], mix: list[dict]) -> dict:
    words = [w for w, _ in ref]
    sm, mm = _map_words(words, stem), _map_words(words, mix)
    rows, counts = [], {"ok": 0, "masked": 0, "misheard": 0, "low_confidence": 0}
    scenes: dict[int, dict] = {}
    for k, (w, scene) in enumerate(ref):
        (s_st, s_h), (m_st, m_h) = sm[k], mm[k]
        ps = s_h.get("p") if s_h else None
        pm = m_h.get("p") if m_h else None
        if s_st == "ok" and m_st != "ok":
            cls = "masked"
        elif s_st != "ok" and m_st != "ok":
            cls = "misheard"
        elif s_st != "ok" or (ps is not None and ps < LOW_PROBABILITY) or (pm is not None and pm < LOW_PROBABILITY):
            cls = "low_confidence"
        else:
            cls = "ok"
        counts[cls] += 1
        sc = scenes.setdefault(scene, {"scene": scene + 1, "words": 0, "mix_ok": 0, "stem_ok": 0})
        sc["words"] += 1
        sc["mix_ok"] += m_st == "ok"
        sc["stem_ok"] += s_st == "ok"
        timed = m_h or s_h
        rows.append({"w": w, "class": cls, "scene": scene + 1, "t": round(timed["s"], 3) if timed else None,
                     "e": round(timed["e"], 3) if timed else None, "stem_heard": s_h["w"] if s_h else None,
                     "mix_heard": m_h["w"] if m_h else None, "p_stem": ps, "p_mix": pm})
    # a lost word has no time of its own: borrow its neighbours'
    for k, r in enumerate(rows):
        if r["t"] is None:
            prev = next((rows[j]["e"] for j in range(k - 1, -1, -1) if rows[j]["e"] is not None), 0.0)
            nxt = next((rows[j]["t"] for j in range(k + 1, len(rows)) if rows[j]["t"] is not None), prev + 0.5)
            r["t"], r["e"] = prev, max(prev, nxt)
    scene_rows = []
    for sc in sorted(scenes.values(), key=lambda x: x["scene"]):
        n = max(sc["words"], 1)
        mix_r, stem_r = round(sc["mix_ok"] / n, 4), round(sc["stem_ok"] / n, 4)
        scene_rows.append({"scene": sc["scene"], "words": sc["words"], "mix": mix_r, "stem": stem_r,
                           "pass": mix_r >= SCENE_FLOOR - 1e-9})
    n = max(len(ref), 1)
    overall = {"mix": round(sum(1 for x in mm if x[0] == "ok") / n, 4),
               "stem": round(sum(1 for x in sm if x[0] == "ok") / n, 4)}
    blocking = [f"masked: \"{r['w']}\" at {r['t']} s (right in the stem, "
                f"{'lost' if r['mix_heard'] is None else 'heard as ' + repr(r['mix_heard'])} in the mix)"
                for r in rows if r["class"] == "masked"]
    floor_both = []
    for sc in scene_rows:
        if not sc["pass"]:
            if sc["stem"] >= SCENE_FLOOR - 1e-9:
                blocking.append(f"scene {sc['scene']}: {sc['mix']:.0%} of its words heard in the mix (floor "
                                f"{SCENE_FLOOR:.0%}; the clean stem reaches {sc['stem']:.0%}): the mix loses them")
            else:
                floor_both.append(sc)
    if overall["mix"] < OVERALL_FLOOR - 1e-9 and overall["stem"] >= OVERALL_FLOOR - 1e-9:
        blocking.append(f"overall: {overall['mix']:.0%} heard in the mix (floor {OVERALL_FLOOR:.0%}; the clean stem "
                        f"reaches {overall['stem']:.0%}): the mix loses words")
    return {"ok": not blocking, "counts": counts, "overall": overall, "scenes": scene_rows,
            "floors": {"scene": SCENE_FLOOR, "overall": OVERALL_FLOOR, "low_probability": LOW_PROBABILITY},
            "words": [r for r in rows if r["class"] != "ok"], "blocking": blocking, "floor_in_both": floor_both}


def _fmt_t(t: float) -> str:
    t = max(0.0, t)
    return f"{int(t // 60)}:{t % 60:04.1f}"


def ear_items_for_words(report: dict) -> list[dict]:
    """Doubtful words as ear-list candidates (source A5, group 1), neighbours within 0.5 s merged."""
    doubt = [r for r in report["words"] if r["class"] in ("misheard", "low_confidence")]
    groups: list[list[dict]] = []
    for r in doubt:
        if groups and r["t"] - groups[-1][-1]["e"] <= 0.5:
            groups[-1].append(r)
        else:
            groups.append([r])
    items = []
    for g in groups:
        s, e = g[0]["t"] - 0.3, g[-1]["e"] + 0.3
        said = " ".join(r["w"] for r in g)
        heard = "; ".join(f"\"{r['w']}\": stem \"{r['stem_heard']}\", mix \"{r['mix_heard']}\""
                          + (f", probability {r['p_mix']:.2f}" if r["p_mix"] is not None else "") for r in g)
        mis = any(r["class"] == "misheard" for r in g)
        items.append({"start": round(max(0.0, s), 2), "end": round(e, 2), "time": f"{_fmt_t(s)}-{_fmt_t(e)}",
                      "question": f"Is it clearly \"{said}\"?",
                      "why_not_machine": ("The speech model heard another word in the clean voice and in the mix; a "
                                          "wrong word and a misheard right word look the same to the machine" if mis else
                                          "The speech model is unsure of this word; only an ear settles it"),
                      "fix_if_no": "Re-record or respell the word (voiceover.md section 2); if the bed covers it, lower the bed",
                      "source": "A5", "group": 1, "risk": 0.88 if mis else 0.75, "measure": "A5: " + heard,
                      "answer": None})
    for sc in report["floor_in_both"]:
        rows = [r for r in report["words"] if r["scene"] == sc["scene"]]
        if rows:
            s, e = rows[0]["t"], rows[-1]["e"]
            items.append({"start": round(max(0.0, s - 0.3), 2), "end": round(e + 0.3, 2),
                          "time": f"{_fmt_t(s - 0.3)}-{_fmt_t(e + 0.3)}",
                          "question": f"Is every word of scene {sc['scene']} clear?",
                          "why_not_machine": f"Only {sc['stem']:.0%} of the scene was heard even in the clean voice: "
                                             "pronunciation or the model, which only an ear tells apart",
                          "fix_if_no": "Re-record or respell the scene's unclear words (voiceover.md section 2)",
                          "source": "A5", "group": 1, "risk": 0.8, "measure": f"A5: scene {sc['scene']} below the floor "
                          "in the stem and the mix", "answer": None})
    return items


def append_ear_list(path: Path, items: list[dict]) -> None:
    """Replace this tool's earlier words in the ear list; words lead (3 at most), the list stays at 7 items or fewer."""
    data = {}
    if path.is_file():
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            data = {}
    cands = [c for c in data.get("candidates") or [] if c.get("source") != "A5"] + items
    others = [c for c in data.get("items") or [] if c.get("source") != "A5"]
    top = sorted(items, key=lambda c: -c["risk"])[:3]
    chosen = sorted(top + others, key=lambda c: -(c.get("risk") or 0))[:7]
    data.update({"generated_by": sorted({"align_script_to_asr.py --stem", *(data.get("generated_by") or [])}),
                 "date": datetime.date.today().isoformat(), "status": "not listened by a human",
                 "items": [{**c, "n": i} for i, c in enumerate(chosen, 1)], "candidates": cands})
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def run_stem(args) -> int:
    project = Path(args.project)
    try:
        ref = load_reference_words(Path(args.script))
        need = [p for p, words in ((args.stem, args.stem_words), (args.mix, args.mix_words)) if not words]
        if not ref:
            raise ValueError("the script has no words")
        if (not args.stem and not args.stem_words) or (not args.mix and not args.mix_words):
            raise ValueError("give the voice stem (--stem or --stem-words) and the mix (--mix or --mix-words)")
        for p in need:
            if not Path(p).is_file():
                raise ValueError(f"not found: {p}")
        heard = transcribe_words([Path(p) for p in need], args.model, args.language) if need else []
        stem = load_heard(Path(args.stem_words)) if args.stem_words else heard.pop(0)
        mix = load_heard(Path(args.mix_words)) if args.mix_words else heard.pop(0)
    except RuntimeError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 2
    except (OSError, ValueError, KeyError, TypeError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 2
    report = classify_speech(ref, stem, mix)
    report = {"mode": "stem", "date": datetime.date.today().isoformat(),
              "model": None if not need else args.model, "script_words": len(ref), **report}
    payload = json.dumps(report, ensure_ascii=False, indent=1) + "\n"
    out = Path(args.out) if args.out else project / "ice" / "review" / "speech-check.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(payload, encoding="utf-8")
    sys.stdout.write(payload)
    items = ear_items_for_words(report)
    append_ear_list(project / "ice" / "review" / "ear-list.json", items)
    c = report["counts"]
    print(f"{len(ref)} script words: {c['ok']} ok, {c['masked']} masked, {c['misheard']} misheard, "
          f"{c['low_confidence']} low confidence; mix {report['overall']['mix']:.0%}, stem {report['overall']['stem']:.0%}; "
          f"{len(items)} item(s) for the ear list", file=sys.stderr)
    for b in report["blocking"]:
        print(f"BLOCKING: {b}", file=sys.stderr)
    return 0 if report["ok"] else 1


def main() -> int:
    for _stream in (sys.stdout, sys.stderr):
        if hasattr(_stream, "reconfigure"):
            _stream.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser(
        description="Align approved script words onto ASR word timings, (--check-captions) check delivered "
                    "captions against a fresh transcript of the final audio, or (--stem) tell masked words from "
                    "misheard ones by transcribing the clean voice stem and the delivered mix.")
    ap.add_argument("script", help="Narration-only script text file (UTF-8); with --check-captions: "
                                   "the captions file (.srt, .vtt or .json); with --stem: the script or the "
                                   "source transcript (JSON words)")
    ap.add_argument("asr", nargs="?", help="ASR word timings JSON; with --check-captions: the fresh transcript "
                                           "words; not used with --stem")
    ap.add_argument("-o", "--out", help="Output JSON path (default: stdout; --stem: ice/review/speech-check.json)")
    ap.add_argument("--min-match", type=float, default=MIN_MATCH_RATIO,
                    help=f"Minimum share of script words matched (default {MIN_MATCH_RATIO})")
    ap.add_argument("--check-captions", action="store_true",
                    help="Check captions against a fresh transcript (exit 0 match, 4 mismatch, 2 bad input)")
    ap.add_argument("--max-offset", type=float, default=None,
                    help=f"With --check-captions: one cue start limit in seconds for every cue (default "
                         f"{MAX_CUE_OFFSET}, {SENTENCE_CARD_OFFSET} for sentence cards)")
    ap.add_argument("--sentence-cards", action="store_true",
                    help=f"With --check-captions: every cue is a sentence card ({SENTENCE_CARD_OFFSET} s limit)")
    ap.add_argument("--allow-extra", action="store_true",
                    help="With --check-captions: heard words missing from the captions are listed but do not fail")
    ap.add_argument("--stem", help="Stem mode: the clean voice stem (film-length, from film 0) to transcribe")
    ap.add_argument("--mix", help="Stem mode: the delivered render or mix to transcribe with the same model")
    ap.add_argument("--stem-words", help="Stem mode: words of the voice stem already transcribed (JSON)")
    ap.add_argument("--mix-words", help="Stem mode: words of the mix already transcribed (JSON)")
    ap.add_argument("--model", default=DEFAULT_MODEL,
                    help=f"Stem mode: faster-whisper model for both transcripts (default {DEFAULT_MODEL}; "
                         "versions.json models.whisper names the Arabic and noisy-material choices)")
    ap.add_argument("--language", help="Stem mode: language code for the speech model (default: detected)")
    ap.add_argument("--project", default=".", help="Stem mode: project folder that holds ice/ (default: current)")
    args = ap.parse_args()

    if args.stem or args.stem_words or args.mix or args.mix_words:
        return run_stem(args)
    if not args.asr:
        print("Error: give the ASR words file (or --stem and --mix for the stem mode)", file=sys.stderr)
        return 2
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
