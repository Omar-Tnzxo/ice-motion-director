#!/usr/bin/env python3
# Original to Ice Motion Director (Apache-2.0), from the 2026-10-29 editor-sources research (the tested prototypes
# match_music.py and rank_sfx.py, merged into one script with two modes). It measures with sound_map.py from this folder.
"""Rank real music tracks, or recorded sound effects, by measured closeness. No network: the candidates are local
files the sourcing routes already fetched (the ice-audio skill, SKILL.md section 5).

music mode: the reference (its sound_map.json, or the reference file itself, measured here) is compared with every
candidate track, each measured with sound_map.py. Distance per axis, then a weighted sum (lower is closer):
  tempo 0.30 (half and double time count as close; scaled down when the reference tempo confidence is low),
  brightness 0.20, loudness range 0.15, key on the circle of fifths 0.10 (relative major and minor are neighbours),
  section movement 0.10, genre 0.10, instruments 0.05.
When the reference has a voice, its brightness is read in the voice-free blocks only. The genre and instrument
guesses of a sound map are proposals: pass the ones the user confirmed with --genre and --instrument (the family
names SOUND-MAP.md prints) and they replace the reference's guesses.
Writes <out>/ranking.json (best first; each row names its candidate's sound map, which preview_options.py reads)
and one cand-<name>/ folder per candidate with its sound map (kept as a cache: a second run measures nothing again).

sfx mode: the selection rules of references/sfx.md sections 5 and 6 as numbers, per file: lead-in to the sync point,
rise time, tail, energy share under 150 Hz and over 6 kHz, peak. Rejects: over 50 % of the energy under 150 Hz
(whoosh), over 40 % over 6 kHz (any). Whooshes score on an 80 to 400 ms rise and a short lead-in; impacts on a
0.6 to 1.0 s tail and a fast transient. Lower score is better.

Usage (Windows, macOS, Linux; needs ffmpeg on PATH, ffprobe too for sfx, and numpy plus scipy from requirements.txt):
    python match_music.py music --ref <sound_map.json or reference file> --out <folder> <track> <track> [...]
    python match_music.py sfx --kind whoosh|impact [--out <folder>] <file> <file> [...]

Exit code: 0 on success, 2 for bad input (a missing file, no candidate that could be measured),
3 for a missing package or a missing ffmpeg or ffprobe.
"""
from __future__ import annotations

import argparse
import json
import math
import re
import shutil
import statistics
import subprocess
import sys
from pathlib import Path

import sound_map

WEIGHTS = {"tempo": 0.30, "key": 0.10, "brightness": 0.20, "dynamics": 0.15, "movement": 0.10, "genre": 0.10,
           "instruments": 0.05}
SILENT_DB = -45.0  # energy_curve blocks under this level are silences or cuts, not music
SFX_SR = 48000


def need_ffprobe() -> None:
    if shutil.which("ffprobe") is None:
        sys.stderr.write("match_music.py needs ffprobe on PATH (it ships with ffmpeg; see the ice-engines skill).\n")
        sys.exit(3)


# ---------------------------------------------------------------- music mode
def measure(audio: Path, folder: Path) -> dict:
    """Sound map of one file, cached in folder/sound_map.json."""
    target = folder / "sound_map.json"
    if target.is_file():
        return json.loads(target.read_text(encoding="utf-8"))
    m = sound_map.analyse(audio)
    folder.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(m, indent=2) + "\n", encoding="utf-8")
    return m


def fifths_index(key: str, mode: str) -> int | None:
    if key not in sound_map.PITCH:
        return None
    i = sound_map.PITCH.index(key)
    if mode == "minor":
        i = (i + 3) % 12  # the relative major
    return (i * 7) % 12


def features(m: dict, voice_free: bool, genre: list[str], instruments: list[str]) -> dict:
    mu = m.get("music") or {}
    voice = [(s["start"], s["end"]) for s in (m.get("voice") or {}).get("segments") or []]
    curve = [p for p in mu.get("energy_curve") or [] if p["rms_db"] > SILENT_DB]
    if voice_free and voice:
        free = [p for p in curve if not any(a <= p["t"] <= b for a, b in voice)]
        curve = free if len(free) >= 4 else curve  # too little voice-free time: use everything
    secs = mu.get("sections") or []
    guessed_genre = {g["name"] for g in mu.get("genre_guess") or []}
    guessed_inst = {g["name"] for g in mu.get("instrumentation_guess") or [] if "voice" not in g["name"]}
    return {
        "bpm": float(mu.get("tempo_bpm") or 0.0),
        "bpm_conf": float(mu.get("tempo_confidence") or 0.0),
        "key": f"{mu.get('key', '')} {mu.get('mode', '')}".strip(),
        "fifths": fifths_index(mu.get("key", ""), mu.get("mode", "")),
        "brightness": statistics.fmean([p["brightness"] for p in curve]) if curve else 0.0,
        "dyn_lu": float((m.get("mix") or {}).get("lra") or 0.0),
        "sections_per_min": 60.0 * len(secs) / max(float(m.get("duration_s") or 0.0), 1.0),
        "genre": set(genre) if genre else guessed_genre,
        "instruments": set(instruments) if instruments else guessed_inst,
    }


def jaccard_distance(a: set, b: set) -> float:
    if not a and not b:
        return 0.0
    return 1.0 - len(a & b) / len(a | b)


def distance(ref: dict, cand: dict) -> dict:
    parts = {}
    if ref["bpm"] and cand["bpm"]:
        parts["tempo"] = min(abs(math.log2(cand["bpm"] * f / ref["bpm"])) for f in (0.5, 1.0, 2.0)) / 0.25
    else:
        parts["tempo"] = 1.0
    if ref["fifths"] is None or cand["fifths"] is None:
        parts["key"] = 0.5
    else:
        d = abs(ref["fifths"] - cand["fifths"]) % 12
        parts["key"] = min(d, 12 - d) / 6.0
    parts["brightness"] = abs(ref["brightness"] - cand["brightness"]) / 0.15
    parts["dynamics"] = abs(ref["dyn_lu"] - cand["dyn_lu"]) / 6.0
    parts["movement"] = abs(ref["sections_per_min"] - cand["sections_per_min"]) / 6.0
    parts["genre"] = jaccard_distance(ref["genre"], cand["genre"])
    parts["instruments"] = jaccard_distance(ref["instruments"], cand["instruments"])
    parts = {k: min(v, 2.0) for k, v in parts.items()}
    # A tempo read with low confidence (speech over the bed, free time) counts less: 0.15 counts half.
    weights = dict(WEIGHTS, tempo=WEIGHTS["tempo"] * min(1.0, max(ref["bpm_conf"], 0.1) / 0.3))
    total = sum(weights[k] * v for k, v in parts.items()) / sum(weights.values())
    return {"total": round(total, 3), "parts": {k: round(v, 2) for k, v in parts.items()}}


def folder_name(path: Path, used: set[str]) -> str:
    base = "cand-" + (re.sub(r"[^A-Za-z0-9._-]+", "-", path.stem).strip("-.") or "track")
    name, n = base, 2
    while name.lower() in used:
        name, n = f"{base}-{n}", n + 1
    used.add(name.lower())
    return name


def run_music(args: argparse.Namespace) -> int:
    missing = [p for p in [args.ref, *args.candidates] if not p.is_file()]
    if missing:
        sys.stderr.write("error: not a file: " + ", ".join(str(p) for p in missing) + "\n")
        return 2
    sound_map.need_deps()
    out = args.out
    out.mkdir(parents=True, exist_ok=True)
    try:
        ref_map = (json.loads(args.ref.read_text(encoding="utf-8")) if args.ref.suffix.lower() == ".json"
                   else measure(args.ref, out / "reference"))
    except (SystemExit, ValueError, KeyError) as exc:
        sys.stderr.write(f"error: the reference could not be read or measured: {exc}\n")
        return 2
    ref = features(ref_map, True, args.genre, args.instrument)
    rows, skipped, used = [], [], {"reference"}
    for audio in args.candidates:
        folder = folder_name(audio, used)
        try:
            cand = features(measure(audio, out / folder), False, [], [])
        except SystemExit as exc:  # sound_map reports unreadable or too short audio this way
            skipped.append({"file": audio.name, "reason": str(exc)})
            continue
        rows.append({"file": audio.name, "path": str(audio.resolve()), "map": f"{folder}/sound_map.json",
                     "bpm": cand["bpm"], "key": cand["key"], "brightness": round(cand["brightness"], 3),
                     "dyn_lu": round(cand["dyn_lu"], 1), "genre": sorted(cand["genre"]), **distance(ref, cand)})
    if not rows:
        sys.stderr.write("error: no candidate could be measured: " + "; ".join(f"{s['file']}: {s['reason']}" for s in skipped) + "\n")
        return 2
    rows.sort(key=lambda r: r["total"])
    ref_out = {k: (sorted(v) if isinstance(v, set) else v) for k, v in ref.items()}
    ref_out["confirmed_tags"] = bool(args.genre or args.instrument)
    (out / "ranking.json").write_text(json.dumps({"version": 1, "reference": ref_out, "weights": WEIGHTS, "ranking": rows,
                                                  "skipped": skipped}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"reference: {ref['bpm']:.1f} BPM (confidence {ref['bpm_conf']:.2f}), key {ref['key'] or 'none'}, brightness "
          f"{ref['brightness']:.3f}, loudness range {ref['dyn_lu']:.1f} LU, genre {sorted(ref['genre'])}")
    for i, r in enumerate(rows, 1):
        print(f"{i}. {r['total']:.3f}  {r['file']}  {r['bpm']:.1f} BPM  {r['key'] or 'no key'}  brightness {r['brightness']}  "
              f"range {r['dyn_lu']} LU  {r['parts']}")
    for s in skipped:
        print(f"skipped {s['file']}: {s['reason']}")
    print(f"wrote {out / 'ranking.json'}")
    return 0


# ---------------------------------------------------------------- sfx mode
def need_numpy():
    try:
        import numpy
    except ImportError:
        sys.stderr.write("match_music.py sfx needs numpy. Install the pins in skills/ice-audio/scripts/requirements.txt "
                         "into a project virtual environment.\n")
        sys.exit(3)
    if shutil.which("ffmpeg") is None:
        sys.stderr.write("match_music.py needs ffmpeg on PATH (see the ice-engines skill for the install step).\n")
        sys.exit(3)
    need_ffprobe()
    return numpy


def load_sfx(np, path: Path):
    """Mono mix (mean of the channels) and the sample peak of the original channels."""
    probe = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=channels",
                            "-of", "csv=p=0", str(path)], stdin=subprocess.DEVNULL, capture_output=True)
    text = probe.stdout.decode("utf-8", "replace").strip().split(",")[0]
    if probe.returncode != 0 or not text.isdigit():
        raise ValueError("no audio stream")
    ch = int(text)
    raw = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", str(path), "-map", "0:a:0", "-ar", str(SFX_SR),
                          "-f", "f32le", "-"], stdin=subprocess.DEVNULL, capture_output=True)
    if raw.returncode != 0:
        lines = raw.stderr.decode("utf-8", "replace").strip().splitlines()
        raise ValueError(lines[-1] if lines else "ffmpeg could not decode it")
    frames = np.frombuffer(raw.stdout, dtype="<f4")
    frames = frames[: len(frames) - len(frames) % ch].reshape(-1, ch)
    if len(frames) < SFX_SR // 100:
        raise ValueError("under 10 ms of audio")
    return frames.mean(axis=1).astype(np.float64), float(np.max(np.abs(frames)))


def measure_sfx(np, path: Path) -> dict:
    x, peak = load_sfx(np, path)
    n = max(1, int(SFX_SR * 0.010))  # 10 ms RMS envelope
    env = np.sqrt(np.convolve(np.pad(x ** 2, (n // 2, n - n // 2 - 1)), np.ones(n) / n, mode="valid"))
    top = float(env.max()) or 1e-12
    sounding = np.nonzero(20 * np.log10(np.maximum(env, 1e-12) / top) > -40)[0]
    start, end = (int(sounding[0]), int(sounding[-1])) if len(sounding) else (0, len(x) - 1)
    sync = int(np.argmax(env))  # the pass-by peak of a whoosh, the body of a hit
    seg = env[start:sync + 1]
    a10, a90 = np.nonzero(seg >= 0.1 * top)[0], np.nonzero(seg >= 0.9 * top)[0]
    rise = (a90[0] - a10[0]) / SFX_SR if len(a10) and len(a90) else 0.0
    spec = np.abs(np.fft.rfft(x[start:end + 1])) ** 2
    freqs = np.fft.rfftfreq(end + 1 - start, 1 / SFX_SR)
    total = float(spec.sum()) or 1e-12
    rms = float(np.sqrt(np.mean(x[start:end + 1] ** 2))) or 1e-12
    return {"file": path.name, "lead_in_s": round(start / SFX_SR, 3), "sync_s": round(sync / SFX_SR, 3),
            "rise_ms": round(rise * 1000), "tail_s": round((end - sync) / SFX_SR, 2),
            "low_share": round(float(spec[freqs < 150].sum()) / total, 2),
            "high_share": round(float(spec[freqs > 6000].sum()) / total, 2),
            "peak_db": round(20 * math.log10(max(peak, 1e-12)), 1), "rms_db": round(20 * math.log10(rms), 1)}


def score_sfx(kind: str, m: dict) -> tuple[float, list[str]]:
    notes, s = [], 0.0
    if kind == "whoosh" and m["low_share"] > 0.5:
        notes.append("reject: over 50% of the energy under 150 Hz (high-pass it and measure again)")
        s += 10
    if kind == "impact" and m["low_share"] > 0.9:
        notes.append("weak on phones: under 10% of the energy over 150 Hz")
        s += 3
    if m["high_share"] > 0.4:
        notes.append("reject: over 40% of the energy over 6 kHz")
        s += 10
    if kind == "whoosh":
        s += 0 if 80 <= m["rise_ms"] <= 400 else min(abs(m["rise_ms"] - 240) / 160, 3)
        s += min(m["lead_in_s"] / 0.1, 2)
    else:
        s += 0 if 0.6 <= m["tail_s"] <= 1.0 else min(abs(m["tail_s"] - 0.8) / 0.4, 3)
        s += min(m["rise_ms"] / 30, 2)  # a hit wants a fast transient
    if m["peak_db"] <= -12:
        notes.append("quiet file: level it before use (sfx.md section 6)")
        s += 1
    return round(s, 2), notes


def run_sfx(args: argparse.Namespace) -> int:
    missing = [p for p in args.files if not p.is_file()]
    if missing:
        sys.stderr.write("error: not a file: " + ", ".join(str(p) for p in missing) + "\n")
        return 2
    np = need_numpy()
    rows, skipped = [], []
    for path in args.files:
        try:
            m = measure_sfx(np, path)
        except ValueError as exc:
            skipped.append({"file": path.name, "reason": str(exc)})
            continue
        s, notes = score_sfx(args.kind, m)
        rows.append({**m, "path": str(path.resolve()), "score": s, "notes": notes})
    if not rows:
        sys.stderr.write("error: no file could be measured: " + "; ".join(f"{s['file']}: {s['reason']}" for s in skipped) + "\n")
        return 2
    rows.sort(key=lambda r: r["score"])
    for i, r in enumerate(rows, 1):
        print(f"{i}. {r['score']:5.2f} {r['file']}: rise {r['rise_ms']} ms, sync {r['sync_s']} s, tail {r['tail_s']} s, "
              f"under 150 Hz {r['low_share']}, over 6 kHz {r['high_share']}, peak {r['peak_db']} dB {' '.join(r['notes'])}")
    for s in skipped:
        print(f"skipped {s['file']}: {s['reason']}")
    if args.out:
        args.out.mkdir(parents=True, exist_ok=True)
        target = args.out / f"sfx-{args.kind}-ranking.json"
        target.write_text(json.dumps({"version": 1, "kind": args.kind, "ranking": rows, "skipped": skipped}, indent=2,
                                     ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"wrote {target}")
    return 0


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Rank real music tracks against a reference, or recorded sound effects, by measurement. No network.",
                                 epilog="Then lay the best 2 or 3 tracks on the film with preview_options.py.")
    sub = ap.add_subparsers(dest="mode", required=True)
    mu = sub.add_parser("music", help="rank candidate tracks against a reference sound map")
    mu.add_argument("--ref", type=Path, required=True, help="the reference's sound_map.json, or the reference video or audio file")
    mu.add_argument("--out", type=Path, required=True, help="folder for ranking.json and the candidates' sound maps")
    mu.add_argument("--genre", action="append", default=[], help="a genre family the user confirmed (repeatable); replaces the reference's guesses")
    mu.add_argument("--instrument", action="append", default=[], help="an instrument family the user confirmed (repeatable)")
    mu.add_argument("candidates", type=Path, nargs="+", help="local candidate tracks")
    sx = sub.add_parser("sfx", help="rank recorded sound effects of one kind")
    sx.add_argument("--kind", choices=("whoosh", "impact"), required=True)
    sx.add_argument("--out", type=Path, help="folder for sfx-<kind>-ranking.json (optional)")
    sx.add_argument("files", type=Path, nargs="+", help="local candidate sound files")
    args = ap.parse_args(argv)
    if args.mode == "music":
        return run_music(args)
    return run_sfx(args)


if __name__ == "__main__":
    sys.exit(main())
