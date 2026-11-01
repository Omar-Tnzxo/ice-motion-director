#!/usr/bin/env python3
"""Voice lines: word timings, fit to the frame slot, and source rows (Ice Motion Director, ice-audio).

The voice stage keeps one file, ice/audio/voice/lines.json (fields: references/voice-director.md section 4). Every
line has a frame slot from the storyboard and animatic, takes with word timings, and one chosen take. This tool:

  words FILE [--out OUT]       turn a provider's timing answer into a word list [{"w", "start", "end"}]:
                               an ElevenLabs with-timestamps answer (alignment.characters and character start and
                               end times), a Forced Alignment answer (words with start and end), or a
                               faster-whisper style list (segments with words, or a flat list of words)
  fit LINES [--apply]          measure every chosen take against its slot and say what to do:
                                 ok        speech span within 2 percent of the slot
                                 stretch   ratio 0.92 to 1.08: pitch-kept tempo in post (--apply writes it)
                                 exception ratio 0.85 to 0.92 or 1.08 to 1.10: allowed for one line, never two
                                           lines in a row (--apply writes it and the report names it)
                                 rewrite   outside 0.85 to 1.10, or two exceptions in a row: change the words,
                                           the delivery tags or the cut, then a new take; never more speed
                               ratio = speech span (first word start to last word end) / slot seconds; a ratio over
                               1 means the take is long and is sped up by that factor.
                               Also checks: a provider take has its full source record, an Arabic spoken side has
                               no digits, every take file exists. Writes ice/audio/voice/fit.json; exit 1 on a
                               rewrite, a missing record or a missing file.
  rows LINES [--manifest M]    write or update one ice/assets/manifest.json row per take and per fitted file, in
                               the shape the provenance gate reads (ice-assets validate-assets.mjs check 10):
                               a provider take is source.type "generated" with provider, model, voice id, date and
                               licence terms; a recording is "user-provided"; a fitted file is derived_from its take.

Stdlib only; --apply needs ffmpeg on PATH. Python 3.10 or newer. Never generates sound: it measures and processes
takes that a provider or the user made (ice-audio core rule 7).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

DIGITS = re.compile(r"[0-9٠-٩۰-۹]")
OK_BAND = 0.02
STRETCH = (0.92, 1.08)
EXCEPTION = (0.85, 1.10)
PROVIDER_FIELDS = ("provider", "model", "voice_id", "license_terms", "date")


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def words_from_answer(data) -> list[dict]:
    """Word list from an ElevenLabs alignment, a Forced Alignment answer or a whisper-style transcript."""
    if isinstance(data, dict) and isinstance(data.get("alignment") or data.get("normalized_alignment"), dict):
        al = data.get("alignment") or data["normalized_alignment"]
        chars, starts, ends = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
        words, cur, s, e = [], "", None, None
        for ch, a, b in zip(chars, starts, ends):
            if ch.isspace():
                if cur.strip():
                    words.append({"w": cur, "start": round(s, 3), "end": round(e, 3)})
                cur, s = "", None
                continue
            if s is None:
                s = a
            cur, e = cur + ch, b
        if cur.strip():
            words.append({"w": cur, "start": round(s, 3), "end": round(e, 3)})
        return [w for w in words if not re.fullmatch(r"\[[^\]]*\]", w["w"])]
    if isinstance(data, dict) and isinstance(data.get("words"), list):
        data = data["words"]
    if isinstance(data, dict) and isinstance(data.get("segments"), list):
        data = [w for seg in data["segments"] for w in seg.get("words", [])]
    out = []
    for w in data or []:
        text = str(w.get("w", w.get("word", w.get("text", "")))).strip()
        if text and w.get("type", "word") == "word":
            out.append({"w": text, "start": round(float(w["start"]), 3), "end": round(float(w["end"]), 3)})
    return out


def chosen_take(line: dict) -> dict | None:
    takes = line.get("takes") or []
    return next((t for t in takes if t.get("id") == line.get("chosen")), None)


def classify(ratio: float) -> str:
    if abs(ratio - 1) <= OK_BAND:
        return "ok"
    if STRETCH[0] <= ratio <= STRETCH[1]:
        return "stretch"
    if EXCEPTION[0] <= ratio <= EXCEPTION[1]:
        return "exception"
    return "rewrite"


def apply_tempo(src: Path, factor: float) -> Path:
    if not shutil.which("ffmpeg"):
        raise SystemExit("ffmpeg is not on PATH: install it (ice-engines references/engine-choice.md) or run fit without --apply")
    dst = src.with_name(f"{src.stem}-fit.wav")
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(src), "-af", f"atempo={factor:.4f}",
                    "-ar", "48000", str(dst)], check=True)
    return dst


def fit(lines_path: Path, project: Path, apply: bool) -> dict:
    data = json.loads(lines_path.read_text(encoding="utf-8"))
    fps = float(data.get("fps") or 30)
    voice = data.get("voice") or {}
    route = data.get("route", "provider")
    rows, problems, last = [], [], None
    for line in data.get("lines", []):
        lid = line.get("id", "?")
        if str(data.get("language", "")).startswith("ar") and DIGITS.search(str(line.get("spoken", ""))):
            problems.append(f"{lid}: the spoken side has digits; write numbers as words (ice-arabic scripts/spoken_numbers.py)")
        take = chosen_take(line)
        if take is None:
            problems.append(f"{lid}: no chosen take")
            last = None
            continue
        file = project / str(take.get("file", ""))
        if not file.is_file():
            problems.append(f"{lid}: take file missing: {take.get('file')}")
        if route == "provider":
            rec = {**voice, **(take.get("source") or {})}
            missing = [k for k in PROVIDER_FIELDS if not str(rec.get(k, "")).strip()]
            if missing:
                problems.append(f"{lid}: provider take without its full record; missing {', '.join(missing)}")
        words = take.get("words") or []
        slot = line.get("slot") or {}
        if not words or "start_frame" not in slot or "end_frame" not in slot:
            problems.append(f"{lid}: needs word timings and a slot (start_frame, end_frame) to be fitted")
            last = None
            continue
        span = float(words[-1]["end"]) - float(words[0]["start"])
        slot_s = (float(slot["end_frame"]) - float(slot["start_frame"])) / fps
        ratio = span / slot_s if slot_s > 0 else float("inf")
        action = classify(ratio)
        if action == "exception" and last == "exception":
            action = "rewrite"
        row = {"id": lid, "take": take.get("id"), "span_s": round(span, 3), "slot_s": round(slot_s, 3),
               "ratio": round(ratio, 3), "action": action, "lead_in_s": round(float(words[0]["start"]), 3)}
        if action == "rewrite":
            row["why"] = ("the take is too long for its slot: fewer words, a shorter phrasing or a later cut, then a new take"
                          if ratio > 1 else "the take is too short for its slot: more words, slower delivery tags or an earlier cut, then a new take")
            problems.append(f"{lid}: ratio {ratio:.3f} needs a rewrite ({row['why']})")
        elif action in ("stretch", "exception") and apply and file.is_file():
            out = apply_tempo(file, ratio)
            row["fitted_file"] = str(out.relative_to(project)).replace("\\", "/")
            take["fitted_file"], take["fit_factor"] = row["fitted_file"], round(ratio, 4)
        rows.append(row)
        last = action
    if apply:
        lines_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    report = {"status": "fail" if problems else "pass", "fps": fps, "lines": rows, "problems": problems}
    out = lines_path.with_name("fit.json")
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return report


def manifest_rows(lines_path: Path, project: Path, manifest_path: Path) -> int:
    data = json.loads(lines_path.read_text(encoding="utf-8"))
    voice = data.get("voice") or {}
    route = data.get("route", "provider")
    manifest = {"version": 1, "assets": []}
    if manifest_path.is_file():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    by_id = {r.get("id"): r for r in manifest.setdefault("assets", [])}
    written = 0

    def put(row: dict):
        nonlocal written
        if row["id"] in by_id:
            by_id[row["id"]].update(row)
        else:
            manifest["assets"].append(row)
            by_id[row["id"]] = row
        written += 1

    for line in data.get("lines", []):
        for take in line.get("takes") or []:
            path = project / str(take.get("file", ""))
            if not path.is_file():
                continue
            rel = str(path.relative_to(project)).replace("\\", "/")
            rec = {**voice, **(take.get("source") or {})}
            if route == "provider":
                source = {"type": "generated", "provider": rec.get("provider"), "model": rec.get("model"),
                          "voice_id": rec.get("voice_id"), "voice_name": rec.get("voice_name"),
                          "date": rec.get("date"), "access": rec.get("access"), "seed": take.get("seed"),
                          "request_id": take.get("request_id")}
                rights = {"license_terms": rec.get("license_terms"), "plan": rec.get("plan"),
                          "owner": "<the user's provider account>"}
            else:
                source = {"type": "user-provided", "url": f"user-provided://{path.name}"}
                rights = {"owner": "<user>"}
            put({"id": f"voice-{take['id']}", "role": "voice", "path": rel, "sha256": sha256(path),
                 "source": {k: v for k, v in source.items() if v not in (None, "")},
                 "rights": {k: v for k, v in rights.items() if v not in (None, "")}, "line": line.get("id")})
            fitted = take.get("fitted_file")
            if fitted and (project / fitted).is_file():
                put({"id": f"voice-{take['id']}-fit", "role": "voice", "path": fitted, "sha256": sha256(project / fitted),
                     "derived_from": f"voice-{take['id']}", "processing": f"atempo {take.get('fit_factor')}",
                     "line": line.get("id")})
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return written


def main(argv: list[str] | None = None) -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--project", type=Path, default=Path("."), help="the film's project folder (default: here)")
    sub = ap.add_subparsers(dest="cmd", required=True)
    w = sub.add_parser("words", help="word list from a provider timing answer")
    w.add_argument("file", type=Path)
    w.add_argument("--out", type=Path)
    f = sub.add_parser("fit", help="fit every chosen take to its slot")
    f.add_argument("lines", type=Path)
    f.add_argument("--apply", action="store_true", help="write pitch-kept tempo copies for stretch and exception lines")
    r = sub.add_parser("rows", help="write manifest rows for every take")
    r.add_argument("lines", type=Path)
    r.add_argument("--manifest", type=Path, default=Path("ice/assets/manifest.json"))
    a = ap.parse_args(argv)
    project = a.project.resolve()
    if a.cmd == "words":
        words = words_from_answer(json.loads(a.file.read_text(encoding="utf-8")))
        text = json.dumps(words, ensure_ascii=False, indent=2)
        if a.out:
            a.out.write_text(text + "\n", encoding="utf-8")
        print(text)
        return 0
    if a.cmd == "fit":
        report = fit(a.lines.resolve(), project, a.apply)
        for row in report["lines"]:
            print(f"{row['id']}: ratio {row['ratio']} ({row['span_s']} s in {row['slot_s']} s) -> {row['action']}")
        for p in report["problems"]:
            print(f"FAIL {p}")
        print(report["status"].upper())
        return 1 if report["problems"] else 0
    manifest = a.manifest if a.manifest.is_absolute() else project / a.manifest
    n = manifest_rows(a.lines.resolve(), project, manifest)
    print(f"{n} voice row(s) written to {manifest}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
