#!/usr/bin/env python3
# Original to Ice Motion Director (Apache-2.0), from the 2026-10-29 editor-sources research (the tested prototypes
# match_music.py and rank_sfx.py, merged into one script with two modes). It measures with sound_map.py from this folder.
# 2026-10-29 (0.2.5): the pack mode (fetch and list Ice's own CC0 Release asset pack, founder decision D4) and the
# under-speech alias of the news-reel SFX profile.
"""Rank real music tracks, or recorded sound effects, by measured closeness. No network except `pack fetch` (the
pinned Release asset pack): the candidates are local files the sourcing routes already fetched (the ice-audio skill,
SKILL.md section 5).

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
--profile news-reel (references/sfx.md section 3b), or its alias under-speech for a cue under speech in any film:
under speech an effect is sub or air, so the two band rejects and the phone note are replaced by one reject: over
50 % of the energy in the 150 Hz to 4 kHz voice band (any kind). Impacts score on a 0.6 to 1.4 s tail (the sub booms
on edits); whooshes keep their rise and lead-in.

pack mode: Ice's own CC0 sound-effects pack, a Release asset pinned in ice-engines/references/versions.json
(`asset_packs.sfx`: tag, URL, SHA-256, size; the PACK constant below mirrors it and a test keeps the two equal).
`pack fetch` downloads it once into the user cache (~/.ice-motion-director/sfx-pack/<tag>/, or ICE_SFX_PACK_DIR),
checks the zip and every file against their SHA-256, and refuses unsafe paths; ICE_OFFLINE=1, "downloads": "off" or
"routes": {"ice_sfx_pack": false} in sources.json turn it down (the ice-assets skill, sourcing-and-licenses.md
section 0), and "ask" there needs --yes after the user agreed. `pack list` prints the files of one or more types with
their sync point and levels (references/sfx.md section 7), filtered for speech with --profile news-reel or
under-speech; rank hero sounds by piping the paths into the sfx mode.

Usage (Windows, macOS, Linux; needs ffmpeg on PATH, ffprobe too for sfx, and numpy plus scipy from requirements.txt):
    python match_music.py music --ref <sound_map.json or reference file> --out <folder> <track> <track> [...]
    python match_music.py sfx --kind whoosh|impact [--profile default|news-reel|under-speech] [--out <folder>] <file> [...]
    python match_music.py pack fetch [--force] [--yes]
    python match_music.py pack list --type <type> [--type <type>] [--profile default|news-reel|under-speech] [--max-dur <s>]

Exit code: 0 on success, 2 for bad input (a missing file, no candidate that could be measured, a pack that fails its
checksum or is not installed), 3 for a missing package or a missing ffmpeg or ffprobe.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import re
import shutil
import statistics
import subprocess
import sys
import tempfile
import urllib.request
import zipfile
from pathlib import Path

import sound_map

WEIGHTS = {"tempo": 0.30, "key": 0.10, "brightness": 0.20, "dynamics": 0.15, "movement": 0.10, "genre": 0.10,
           "instruments": 0.05}
SILENT_DB = -45.0  # energy_curve blocks under this level are silences or cuts, not music
SFX_SR = 48000
# Mirror of ice-engines/references/versions.json "asset_packs"."sfx"; tests/audio-fixes.test.mjs keeps the two equal.
PACK = {"tag": "assets-sfx-v1",
        "url": "https://github.com/Omar-Tnzxo/ice-motion-director/releases/download/assets-sfx-v1/ice-sfx-pack-v1.zip",
        "sha256": "5314683d340d04a99938a1b204876c812a50edaff15d76e94081525c088b5f8c",
        "bytes": 58620974,
        "folder": "ice-sfx-pack-v1",
        "route": "ice_sfx_pack"}
UNDER_SPEECH = ("news-reel", "under-speech")


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
            "voice_band_share": round(float(spec[(freqs >= 150) & (freqs <= 4000)].sum()) / total, 2),
            "peak_db": round(20 * math.log10(max(peak, 1e-12)), 1), "rms_db": round(20 * math.log10(rms), 1)}


def score_sfx(kind: str, m: dict, profile: str = "default") -> tuple[float, list[str]]:
    notes, s = [], 0.0
    if profile in UNDER_SPEECH:
        if m["voice_band_share"] > 0.5:
            notes.append("reject: over 50% of the energy in the 150 Hz to 4 kHz voice band (sfx.md section 3b)")
            s += 10
        if kind == "whoosh":
            s += 0 if 80 <= m["rise_ms"] <= 400 else min(abs(m["rise_ms"] - 240) / 160, 3)
            s += min(m["lead_in_s"] / 0.1, 2)
        else:
            s += 0 if 0.6 <= m["tail_s"] <= 1.4 else min(abs(m["tail_s"] - 1.0) / 0.4, 3)
            s += min(m["rise_ms"] / 40, 2)
        if m["peak_db"] <= -12:
            notes.append("quiet file: level it before use (sfx.md section 6)")
            s += 1
        return round(s, 2), notes
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


def pack_dir() -> Path:
    root = os.environ.get("ICE_SFX_PACK_DIR") or str(Path.home() / ".ice-motion-director" / "sfx-pack")
    return Path(root) / PACK["tag"]


def pack_manifest() -> dict | None:
    m = pack_dir() / PACK["folder"] / "manifest.json"
    if not (m.is_file() and (pack_dir() / "ok.json").is_file()):
        return None
    return json.loads(m.read_text(encoding="utf-8"))


def download_setting() -> tuple[str, str]:
    """The user's download setting for this route: ("allowed" | "ask" | "off", where it came from)."""
    if os.environ.get("ICE_OFFLINE") == "1":
        return "off", "ICE_OFFLINE=1"
    setting, origin = "allowed", "default"
    for f in (Path.home() / ".ice-motion-director" / "sources.json", Path.cwd() / "ice" / "sources.json"):
        if not f.is_file():
            continue
        try:
            s = json.loads(f.read_text(encoding="utf-8"))
        except (OSError, ValueError) as e:
            sys.stderr.write(f"warning: {f} is not readable JSON ({e}); its settings are ignored\n")
            continue
        downloads = s.get("downloads")
        if downloads in ("allowed", "ask", "off"):
            setting, origin = downloads, f"{f} downloads"
        route = (s.get("routes") or {}).get(PACK["route"])
        if route is False:
            setting, origin = "off", f"{f} routes.{PACK['route']}"
        elif route == "ask" and setting == "allowed":
            setting, origin = "ask", f"{f} routes.{PACK['route']}"
        cap = s.get("max_download_mb")
        if isinstance(cap, (int, float)) and PACK["bytes"] > cap * 1_000_000 and setting == "allowed":
            setting, origin = "ask", f"{f} max_download_mb {cap}"
    return setting, origin


def safe_member(name: str) -> bool:
    parts = Path(name.replace("\\", "/")).parts
    return not (name.startswith(("/", "\\")) or ".." in parts or (parts and ":" in parts[0]))


def run_pack_fetch(args: argparse.Namespace) -> int:
    setting, origin = download_setting()
    if setting == "off":
        print(f"pack not fetched: downloads are off ({origin}); the SFX ladder takes the next rung")
        return 0
    if setting == "ask" and not args.yes:
        print(f"pack not fetched: downloads need a yes ({origin}); ask the user (about {PACK['bytes'] / 1e6:.1f} MB, "
              f"{PACK['url']}), then run again with --yes")
        return 0
    if pack_manifest() and not args.force:
        print(f"pack {PACK['tag']} already at {pack_dir()}")
        return 0
    dest = pack_dir()
    dest.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(dir=dest) as tmp:
        z = Path(tmp) / "pack.zip"
        req = urllib.request.Request(PACK["url"], headers={"User-Agent": "IceMotionDirector (+https://github.com/Omar-Tnzxo/ice-motion-director)"})
        h = hashlib.sha256()
        try:
            with urllib.request.urlopen(req, timeout=120) as r, open(z, "wb") as f:
                while chunk := r.read(1 << 20):
                    h.update(chunk)
                    f.write(chunk)
        except OSError as e:
            sys.stderr.write(f"error: could not download {PACK['url']}: {e}\n")
            return 2
        if h.hexdigest() != PACK["sha256"]:
            sys.stderr.write(f"error: pack checksum {h.hexdigest()} is not the pinned {PACK['sha256']}; nothing kept\n")
            return 2
        with zipfile.ZipFile(z) as zf:
            bad = [n for n in zf.namelist() if not safe_member(n)]
            if bad:
                sys.stderr.write(f"error: unsafe path in pack: {bad[0]}; nothing kept\n")
                return 2
            shutil.rmtree(dest / PACK["folder"], ignore_errors=True)
            zf.extractall(dest)
    man = json.loads((dest / PACK["folder"] / "manifest.json").read_text(encoding="utf-8"))
    for row in man["files"]:
        f = dest / PACK["folder"] / row["file"]
        if not f.is_file() or hashlib.sha256(f.read_bytes()).hexdigest() != row["sha256"]:
            sys.stderr.write(f"error: {row['file']} does not match the manifest; run again with --force\n")
            return 2
    from datetime import datetime, timezone
    (dest / "ok.json").write_text(json.dumps({"tag": PACK["tag"], "sha256": PACK["sha256"],
                                              "fetched_at": datetime.now(timezone.utc).isoformat(timespec="seconds")}),
                                  encoding="utf-8")
    print(f"pack {PACK['tag']}: {len(man['files'])} files at {dest / PACK['folder']} (record: {PACK['url']}, CC0 or public domain)")
    return 0


def run_pack_list(args: argparse.Namespace) -> int:
    man = pack_manifest()
    if not man:
        sys.stderr.write("the pack is not installed: run match_music.py pack fetch\n")
        return 2
    root = pack_dir() / PACK["folder"]
    rows = [r for r in man["files"] if r.get("type") in args.type]
    if args.profile in UNDER_SPEECH:  # references/sfx.md section 3b: sub or air under speech
        rows = [r for r in rows if (r.get("band_share") or {}).get("voice_150_4k", 1.0) <= 0.5]
    if args.max_dur:
        rows = [r for r in rows if r.get("duration_s", 0) <= args.max_dur]
    for r in rows:
        print(f"{root / r['file']}\tsync {r.get('sync_s')} s ({r.get('sync_kind')})\t{r.get('duration_s')} s\t"
              f"{r.get('lufs_momentary_max')} LUFS-M\t{r.get('peak_dbfs')} dBFS\tcentroid {r.get('centroid_hz')} Hz")
    if not rows:
        sys.stderr.write(f"no pack file of type {', '.join(args.type)} passes the filters\n")
    return 0 if rows else 2


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
        s, notes = score_sfx(args.kind, m, args.profile)
        rows.append({**m, "path": str(path.resolve()), "score": s, "notes": notes})
    if not rows:
        sys.stderr.write("error: no file could be measured: " + "; ".join(f"{s['file']}: {s['reason']}" for s in skipped) + "\n")
        return 2
    rows.sort(key=lambda r: r["score"])
    for i, r in enumerate(rows, 1):
        print(f"{i}. {r['score']:5.2f} {r['file']}: rise {r['rise_ms']} ms, sync {r['sync_s']} s, tail {r['tail_s']} s, "
              f"under 150 Hz {r['low_share']}, over 6 kHz {r['high_share']}, voice band {r['voice_band_share']}, "
              f"peak {r['peak_db']} dB {' '.join(r['notes'])}")
    for s in skipped:
        print(f"skipped {s['file']}: {s['reason']}")
    if args.out:
        args.out.mkdir(parents=True, exist_ok=True)
        target = args.out / f"sfx-{args.kind}-ranking.json"
        target.write_text(json.dumps({"version": 1, "kind": args.kind, "profile": args.profile, "ranking": rows, "skipped": skipped}, indent=2,
                                     ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"wrote {target}")
    return 0


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Rank real music tracks against a reference, or recorded sound effects, by measurement; fetch and list Ice's CC0 SFX pack.",
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
    sx.add_argument("--profile", choices=("default",) + UNDER_SPEECH, default="default",
                    help="news-reel or under-speech: sub or air only under speech (references/sfx.md section 3b)")
    sx.add_argument("--out", type=Path, help="folder for sfx-<kind>-ranking.json (optional)")
    sx.add_argument("files", type=Path, nargs="+", help="local candidate sound files")
    pk = sub.add_parser("pack", help="fetch Ice's pinned CC0 sound-effects pack, or list its sounds of one type")
    pks = pk.add_subparsers(dest="action", required=True)
    pf = pks.add_parser("fetch", help="download the pinned pack once into the user cache and check its SHA-256")
    pf.add_argument("--force", action="store_true", help="download again even when the pack is installed")
    pf.add_argument("--yes", action="store_true", help="the user agreed, when sources.json says downloads ask")
    pl = pks.add_parser("list", help="print the pack files of one or more types with their sync point and levels")
    pl.add_argument("--type", action="append", required=True, help="a pack type from the manifest (repeatable)")
    pl.add_argument("--profile", choices=("default",) + UNDER_SPEECH, default="default",
                    help="news-reel or under-speech: keep only files with at most half their energy in 150 Hz to 4 kHz")
    pl.add_argument("--max-dur", type=float, help="keep files no longer than this many seconds")
    args = ap.parse_args(argv)
    if args.mode == "music":
        return run_music(args)
    if args.mode == "pack":
        return run_pack_fetch(args) if args.action == "fetch" else run_pack_list(args)
    return run_sfx(args)


if __name__ == "__main__":
    sys.exit(main())
