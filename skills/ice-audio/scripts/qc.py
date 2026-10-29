#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = ["numpy==2.4.6"]
# ///
# Adapted from digitalsamba/claude-code-video-toolkit tools/qc.py (MIT, Copyright (c) 2024 Digital Samba). Changes: Remotion and scenes.json project loaders and the sync_timing and win_encoding imports replaced by an engine-agnostic reader of the Ice cue sheet or a folder of voice lines; render target and true peak now set from the chosen loudness profile; ffmpeg runs with stdin closed; ASCII report icons; dash characters replaced.
# 2026-10-29 (0.2.5): --audit mode added (the delivered mix measured and gated: loudness against --profile, voice over
# bed from the stems, clicks at joins, sample clipping, DC, stereo and mono, stream spec, holes and declared silences,
# music ending, SFX under speech; writes ice/review/audio-audit.json with the presence of each sound code, and the
# human ear list ice/review/ear-list.json), --diagnose (intake symptoms of a recorded voice: ice/audio/voice-diagnosis.json),
# --profile and --profiles (the gate column of mix-and-master.md section 5); numpy only in --audit and --diagnose
# (imported there). The legacy modes and their output are unchanged.
# 2026-10-29 (0.2.6): --audit adds A7 (level jumps at cuts, ear list only), A14 (each effect cue against the no-SFX
# premix of master_audio.py --no-sfx-premix or --premix: in-band lift, level under the ducked score, sync; a hero cue
# not heard or late blocks, more than half masked blocks) and A17 (the longest unchanged repeated pattern in the music
# and SFX stems, moved out of the ear-list fallbacks into its own check); the cue sheet's "hero" flag is read; the sfx
# presence follows A14 when it was measured.
"""
Audio QC before and after render: catch the problems that otherwise show up in the final film.

Checks, without changing anything:

  * timing    : per voice line, narration longer than its slot (cut off) or much
                shorter (dead air). Slots come from the cue sheet (start/end per line).
  * pacing    : words-per-minute per line, from the line's text (see pacing.py)
  * loudness  : per-line integrated LUFS + true peak via ffmpeg `loudnorm`:
                clipping risk, and lines noticeably louder/quieter than the rest
  * render    : with --render, the exported film's loudness against the chosen
                profile (default -14 LUFS integrated, -1 dBTP).

`--fix` normalises loudness (and only loudness): out-of-range line files are
rewritten in place with originals kept in `.qc-backup/`, and a render is
written to a new `<name>.loudnorm.mp4` with the video stream copied.

Inputs (pick one source of voice lines, or none):
  --cue-sheet ice/plan/cue-sheet.json   voice entries {"text", "file", "start", "end"};
                                         relative files resolve from the project folder
  --lines DIR                            every .wav/.mp3/.m4a with a same-name .txt beside it

Usage (Windows, macOS, Linux; needs ffmpeg and ffprobe on PATH):
    python qc.py --project . --cue-sheet ice/plan/cue-sheet.json
    python qc.py --project . --lines ice/audio/voice --render out/film.mp4
    python qc.py --render out/film.mp4 --target-lufs -16 --true-peak -1 --fix
    python qc.py --project . --cue-sheet ice/plan/cue-sheet.json --json

Exit code: 0 when there are no errors (warnings allowed, unless --strict),
1 otherwise, 2 for bad input.

Audit mode (08b on the draft, 10 on the delivered file; needs numpy from requirements.txt):
    python qc.py --audit --render out/film.mp4 --profile <id> [--stems ice/audio/stems]
                 [--cue-sheet ice/plan/cue-sheet.json] [--sfx ice/audio/sfx.json] [--premix FILE] [--project .] [--json]
    python qc.py --profiles          # the profile table as JSON (ids, targets, tolerances)

  --profile: one id of the "Gate (--profile)" column of the ice-audio skill, references/mix-and-master.md
             section 5; --target-lufs and --true-peak override it (a client spec, the reference's values; the
             `reference` profile needs both).
  --stems:   a folder of film-length stems that start at film 0. Voice stems are the files whose name starts with
             voice, vo, vocals, dialogue, dialog, speech or narration; files named mix, master, premix or
             premaster are skipped; sfx, fx or effects files are the effects stem; every other audio file is
             bed. Without stems the voice-over-bed check (A3) is "unmeasured" and blocks, unless --separate is
             given and demucs is installed (it then splits the render), or --no-speech declares a film with no
             spoken word at all.
  --premix:  the same mix without the SFX layer (master_audio.py --no-sfx-premix FILE, read from master.json by
             default; or the engine's render with the SFX layer muted). Without it A14 is "not run", and
             "unmeasured" (blocking) when a hero cue exists. A hero cue: its cue-sheet event has "hero": true, or
             its kind, what or sound names a hero, signature, reveal, payoff or logo moment.
  Checks: A1 loudness, A3 voice over bed, A5 (read from align_script_to_asr.py --stem), A6 clicks and
  truncation at joins, A7 level jumps at cuts (ear list only), A8 clipping runs, A9 DC offset, A10 stereo, phase
  and mono loss, A11 stream spec and length, A12 holes and declared silences, A13 music ending and cut voice,
  A14 each effect cue heard and in sync, A15 effects under speech, A17 the longest repeated pattern (ear list only).
  Writes <project>/ice/review/audio-audit.json (per check: value, threshold, source, pass, blocking; "presence":
  music, voice, sfx, ambience, foley and silence found measured or cued, with "presence_sources") and
  <project>/ice/review/ear-list.json (5 to 7 items for a human ear), and prints the "## For your ears" block.
  Exit 0 no blocking item, 1 a blocking item, 2 bad input.

Intake diagnosis (01 ingest or 08a, on the user's recorded voice or footage audio; needs numpy):
    python qc.py --diagnose ice/inbox/<voice or footage> [--project .] [--json]
  Noise floor (pauses over -55 dBFS), mains hum (50 or 60 Hz and harmonics 10 dB over their neighbourhood),
  boom (the 125 Hz octave more than 4 dB over the 1 kHz octave in speech), sibilance, clipping runs and music
  under speech; writes <project>/ice/audio/voice-diagnosis.json. Each candidate names its row of the cleanup
  table (the ice-audio skill, references/voiceover.md section 7). Exit 0, or 2 for bad input.
"""
from __future__ import annotations

import argparse
import datetime
import importlib.util
import json
import math
import re
import shutil
import statistics
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from pacing import pace_label, probe_duration  # noqa: E402

AUDIO_EXTS = (".wav", ".mp3", ".m4a", ".aac", ".ogg", ".flac")
DEAD_AIR_SECONDS = 3.0      # slot runs this much longer than its narration
RENDER_LUFS = -14.0
RENDER_TRUE_PEAK = -1.0
SCENE_LUFS = -16.0          # leaves headroom for music + sfx in the mix
SCENE_TRUE_PEAK = 0.0       # stems are allowed near full scale; the render gets the profile's rule
SCENE_SPREAD_LU = 1.5       # line this far from the median sounds uneven
FIX_TOLERANCE_LU = 1.0
MIN_LOUDNESS_SECONDS = 3.0  # loudnorm's integrated measure is unreliable below this


# ---- Findings ----------------------------------------------------------

class Report:
    def __init__(self):
        self.findings: list[dict] = []
        self.data: dict = {}

    def add(self, level: str, check: str, message: str, **extra):
        self.findings.append({"level": level, "check": check, "message": message, **extra})

    def count(self, level: str) -> int:
        return sum(1 for f in self.findings if f["level"] == level)


def _run(cmd: list[str], timeout: int) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace",
                          timeout=timeout, stdin=subprocess.DEVNULL)


# ---- Loudness ----------------------------------------------------------

def _num(value) -> float | None:
    try:
        v = float(value)
    except (TypeError, ValueError):
        return None
    return None if v in (float("inf"), float("-inf")) else v


def measure_loudness(path: Path) -> dict | None:
    """Integrated LUFS, true peak and LRA via ffmpeg loudnorm's first pass."""
    try:
        r = _run(["ffmpeg", "-hide_banner", "-nostats", "-nostdin", "-i", str(path), "-vn",
                  "-af", "loudnorm=print_format=json", "-f", "null", "-"], timeout=600)
    except (OSError, subprocess.TimeoutExpired):
        return None
    m = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", r.stderr or "")
    if not m:
        return None
    raw = json.loads(m.group(0))
    return {
        "lufs": _num(raw.get("input_i")),
        "true_peak": _num(raw.get("input_tp")),
        "lra": _num(raw.get("input_lra")),
        "thresh": _num(raw.get("input_thresh")),
        "offset": _num(raw.get("target_offset")),
        "_raw": raw,
    }


def normalize_loudness(src: Path, dst: Path, target: float, true_peak: float,
                       measured: dict, video: bool = False) -> str | None:
    """Second loudnorm pass using the first pass's measurements. Returns an error or None."""
    raw = measured["_raw"]
    af = (
        f"loudnorm=I={target}:TP={true_peak}:LRA=11"
        f":measured_I={raw['input_i']}:measured_TP={raw['input_tp']}"
        f":measured_LRA={raw['input_lra']}:measured_thresh={raw['input_thresh']}"
        f":offset={raw['target_offset']}:linear=true"
    )
    # loudnorm resamples to 192 kHz internally; bring it back down.
    cmd = ["ffmpeg", "-y", "-v", "error", "-nostdin", "-i", str(src), "-af", af, "-ar", "48000"]
    if video:
        cmd += ["-c:v", "copy", "-c:a", "aac", "-b:a", "192k"]
    elif dst.suffix.lower() == ".mp3":
        cmd += ["-b:a", "192k"]
    cmd.append(str(dst))
    try:
        r = _run(cmd, timeout=1200)
    except (OSError, subprocess.TimeoutExpired) as e:
        return str(e)
    return (r.stderr or "").strip()[-300:] if r.returncode != 0 else None


# ---- Loading voice lines -----------------------------------------------

def load_cue_sheet(project: Path, sheet: Path, report: Report) -> list[dict]:
    """Voice lines from the cue sheet: [{label, audio_path, text, slot_seconds}]."""
    data = json.loads(sheet.read_text(encoding="utf-8"))
    report.data["source"] = str(sheet)
    lines = []
    voice = data.get("voice") or []
    if isinstance(voice, dict):
        voice = voice.get("lines", [])
    for i, v in enumerate(voice):
        f = v.get("file")
        if not f:
            continue
        p = Path(f)
        if not p.is_absolute():
            p = project / p
        if not p.exists():
            report.add("error", "assets", f"{f}: voice file named in the cue sheet does not exist", file=f)
            continue
        slot = None
        if v.get("start") is not None and v.get("end") is not None:
            slot = float(v["end"]) - float(v["start"])
        lines.append({"label": f"{i + 1:02d}", "audio_path": p, "text": v.get("text", ""),
                      "slot_seconds": slot})
    report.data["assets_checked"] = len(voice)
    return lines


def load_lines_dir(folder: Path, report: Report) -> list[dict]:
    """Every audio file in the folder; text from the same-name .txt when present."""
    report.data["source"] = str(folder)
    lines = []
    for i, p in enumerate(sorted(x for x in folder.iterdir() if x.suffix.lower() in AUDIO_EXTS)):
        txt = p.with_suffix(".txt")
        text = txt.read_text(encoding="utf-8") if txt.exists() else None
        lines.append({"label": f"{i + 1:02d}", "audio_path": p, "text": text, "slot_seconds": None})
    report.data["assets_checked"] = len(lines)
    return lines


# ---- Checks ------------------------------------------------------------

def check_timing(lines: list[dict], report: Report):
    timed = 0
    for t in lines:
        audio, slot = probe_duration(t["audio_path"]), t["slot_seconds"]
        t["audio_seconds"] = audio
        if audio is None or slot is None:
            continue
        timed += 1
        if audio > slot:
            report.add("error", "timing",
                       f"{t['label']}: narration {audio:.1f}s > slot {slot:.1f}s, will be cut off",
                       file=t["audio_path"].name)
        elif slot - audio > DEAD_AIR_SECONDS:
            report.add("warn", "timing",
                       f"{t['label']}: slot {slot:.1f}s, narration {audio:.1f}s, "
                       f"{slot - audio:.1f}s of trailing silence",
                       file=t["audio_path"].name)
    report.data["lines_timed"] = timed


def check_pacing(lines: list[dict], report: Report):
    measured = 0
    for t in lines:
        if not t.get("text"):
            continue
        wpm, label = pace_label(t["text"], t.get("audio_seconds"))
        if wpm is None:
            continue
        measured += 1
        if label in ("fast", "slow"):
            report.add("warn", "pacing",
                       f"{t['audio_path'].name}: {wpm:.0f} wpm ({label}; comfortable is 140-160)",
                       file=t["audio_path"].name, wpm=wpm)
    report.data["pacing_measured"] = measured


def check_line_loudness(lines: list[dict], report: Report) -> dict[Path, dict]:
    levels: dict[Path, dict] = {}
    for t in lines:
        f, dur = t["audio_path"], t.get("audio_seconds")
        if dur is not None and dur < MIN_LOUDNESS_SECONDS:
            continue
        m = measure_loudness(f)
        if m and m["lufs"] is not None:
            levels[f] = m
    report.data["line_loudness"] = {
        f.name: {"lufs": m["lufs"], "true_peak": m["true_peak"]} for f, m in levels.items()
    }
    if not levels:
        return levels
    for f, m in levels.items():
        if m["true_peak"] is not None and m["true_peak"] > SCENE_TRUE_PEAK:
            report.add("warn", "loudness", f"{f.name}: true peak {m['true_peak']:+.1f} dBTP, clipped",
                       file=f.name)
    if len(levels) >= 3:
        median = statistics.median(m["lufs"] for m in levels.values())
        report.data["line_loudness_median"] = median
        for f, m in levels.items():
            delta = m["lufs"] - median
            if abs(delta) > SCENE_SPREAD_LU:
                word = "louder" if delta > 0 else "quieter"
                report.add("warn", "loudness",
                           f"{f.name}: {m['lufs']:.1f} LUFS, {abs(delta):.1f} LU {word} than the other lines "
                           f"({median:.1f})", file=f.name)
    return levels


def check_render(render: Path, report: Report, target: float, true_peak: float) -> dict | None:
    if not render.exists():
        report.add("error", "render", f"{render} not found")
        return None
    m = measure_loudness(render)
    if not m or m["lufs"] is None:
        report.add("error", "render", f"{render.name}: could not measure loudness (no audio stream?)")
        return None
    report.data["render"] = {"file": str(render), "lufs": m["lufs"], "true_peak": m["true_peak"], "lra": m["lra"]}
    if m["lufs"] < target - 2:
        # Platforms turn loud content down but never turn quiet content up.
        report.add("warn", "render", f"{render.name}: {m['lufs']:.1f} LUFS, quieter than the {target:.0f} target; "
                   "platforms will not raise it")
    elif m["lufs"] > target + 1:
        report.add("warn", "render", f"{render.name}: {m['lufs']:.1f} LUFS, platforms will turn it down "
                   f"{m['lufs'] - target:.1f} dB")
    if m["true_peak"] is not None and m["true_peak"] > true_peak:
        report.add("warn", "render", f"{render.name}: true peak {m['true_peak']:+.1f} dBTP, over the "
                   f"{true_peak:+.1f} dBTP limit (clipping risk after lossy encoding)")
    return m


# ---- Fix ---------------------------------------------------------------

def fix_lines(levels: dict[Path, dict], target: float, true_peak: float, report: Report) -> list[str]:
    fixed = []
    for f, m in levels.items():
        off_target = abs(m["lufs"] - target) > FIX_TOLERANCE_LU
        clipping = m["true_peak"] is not None and m["true_peak"] > SCENE_TRUE_PEAK
        if not (off_target or clipping):
            continue
        backup_dir = f.parent / ".qc-backup"
        backup_dir.mkdir(exist_ok=True)
        backup = backup_dir / f.name
        if not backup.exists():  # never overwrite the true original on a re-run
            shutil.copy2(f, backup)
        tmp = f.with_name(f".qc-tmp-{f.name}")
        err = normalize_loudness(f, tmp, target, true_peak - 0.5, m)
        if err:
            tmp.unlink(missing_ok=True)
            report.add("error", "fix", f"{f.name}: normalisation failed: {err}", file=f.name)
            continue
        shutil.move(str(tmp), str(f))
        fixed.append(f.name)
        report.findings = [x for x in report.findings
                           if not (x["check"] == "loudness" and x.get("file") == f.name)]
        report.add("info", "fix", f"{f.name}: {m['lufs']:.1f} to {target:.0f} LUFS "
                   f"(original in {backup_dir.name}/)", file=f.name)
    return fixed


def fix_render(render: Path, m: dict, target: float, true_peak: float, report: Report) -> Path | None:
    out = render.with_name(f"{render.stem}.loudnorm{render.suffix}")
    # Margin under the ceiling: the AAC re-encode adds a little true peak back
    err = normalize_loudness(render, out, target, true_peak - 0.5, m, video=True)
    if err:
        report.add("error", "fix", f"{render.name}: normalisation failed: {err}")
        return None
    report.add("info", "fix", f"wrote {out.name} ({m['lufs']:.1f} to {target:.0f} LUFS); "
               f"{render.name} is unchanged; re-run with --render {out.name} to confirm")
    return out


# ---- Output ------------------------------------------------------------

ICONS = {"error": "x", "warn": "!", "info": "-"}


def print_report(report: Report):
    d = report.data
    print(f"Audio QC: {d.get('source', 'render only')}", file=sys.stderr)
    print(f"  lines: {d.get('assets_checked', 0)} | timed: {d.get('lines_timed', 0)} | "
          f"pacing measured: {d.get('pacing_measured', 0)} | "
          f"loudness measured: {len(d.get('line_loudness', {}))}", file=sys.stderr)
    if "line_loudness_median" in d:
        print(f"  line loudness median: {d['line_loudness_median']:.1f} LUFS", file=sys.stderr)
    if "render" in d:
        r = d["render"]
        tp = f"{r['true_peak']:+.1f} dBTP" if r["true_peak"] is not None else "n/a"
        print(f"  render: {r['lufs']:.1f} LUFS, {tp}, LRA {r['lra']}", file=sys.stderr)
    print(file=sys.stderr)
    for check in ("assets", "timing", "pacing", "loudness", "render", "fix"):
        items = [f for f in report.findings if f["check"] == check]
        if not items:
            continue
        print(f"{check}:", file=sys.stderr)
        for f in items:
            print(f"  {ICONS[f['level']]} {f['message']}", file=sys.stderr)
    errors, warns = report.count("error"), report.count("warn")
    verdict = "FAIL" if errors else ("PASS with warnings" if warns else "PASS")
    print(f"\n{verdict}: {errors} error(s), {warns} warning(s)", file=sys.stderr)


# ---- Audit (--audit): the delivered mix, measured and gated --------------

# One row per --profile id. Mirrors the "Gate (--profile)" column of the ice-audio skill, references/mix-and-master.md
# section 5; tests/audio-fixes.test.mjs checks that the two agree and that quick-checks.mjs loudness carries the same
# table. i and tp None: the reference's own values, passed with --target-lufs and --true-peak. lra_min_warns: the LRA
# floor goes to the ear list instead of blocking.
PROFILES = {
    "social": {"row": "Social and web, punchy", "i": -14.0, "i_tol": 1.0, "tp": -1.0,
               "lra_min": 3.0, "lra_max": 11.0, "lra_min_warns": True},
    "gentle": {"row": "Gentle and spoken", "i": -16.0, "i_tol": 1.0, "tp": -1.0,
               "lra_min": 1.5, "lra_max": 9.0, "lra_min_warns": False},
    "strict": {"row": "Strict headroom", "i": -16.0, "i_tol": 1.0, "tp": -4.0,
               "lra_min": None, "lra_max": 11.0, "lra_min_warns": False},
    "quiet-client": {"row": "Quiet client spec", "i": -19.0, "i_tol": 1.0, "tp": -1.0,
                     "lra_min": None, "lra_max": None, "lra_min_warns": False},
    "broadcast-ebu": {"row": "Broadcast", "i": -23.0, "i_tol": 1.0, "tp": -1.0,
                      "lra_min": None, "lra_max": None, "lra_min_warns": False},
    "broadcast-atsc": {"row": "Broadcast", "i": -24.0, "i_tol": 1.0, "tp": -2.0,
                       "lra_min": None, "lra_max": None, "lra_min_warns": False},
    "reference": {"row": "Reference match", "i": None, "i_tol": 1.0, "tp": None,
                  "lra_min": None, "lra_max": None, "lra_min_warns": False},
    "news-reel": {"row": "News reel, speech-led", "i": -16.0, "i_tol": 1.0, "tp": -1.0,
                  "lra_min": 4.0, "lra_max": 7.0, "lra_min_warns": False},
}

AUDIT_SR = 48000
BED_BAND_DB = {"default": (10.0, 14.0), "news-reel": (14.0, 31.0)}  # median voice over bed, full band (mix-and-master.md 3 and 5)
VOICE_STEMS = ("voice", "vo", "vocals", "dialogue", "dialog", "speech", "narration")
SFX_STEMS = ("sfx", "fx", "effects")
SKIP_STEMS = ("mix", "master", "premix", "premaster")
CLIP_LEVEL = 10 ** (-0.1 / 20)   # -0.1 dBFS
DC_LIMIT = 0.001
HOLE_DB, HOLE_S = -50.0, 0.25
QUIET_DIP_DB = 6.0
CUT_TAIL_DB = -40.0               # energy after the film end that counts as a cut sound
EAR_MIN, EAR_MAX = 5, 7
EAR_CAPS = {1: 3}                 # words may take 3 items; every other source 1 (notes order, ear list rules)
MM = "the ice-audio skill, references/mix-and-master.md"
NO_EAR = "the ear list"


def _numpy():
    try:
        import numpy  # noqa: PLC0415 (only the audit needs it)
    except ImportError:
        print("qc.py --audit needs numpy: install the pins of skills/ice-audio/scripts/requirements.txt into the project "
              "virtual environment (python -m pip install -r requirements.txt).", file=sys.stderr)
        sys.exit(2)
    return numpy


def _r(x, n=2):
    try:
        v = float(x)
    except (TypeError, ValueError):
        return None
    return None if math.isnan(v) or math.isinf(v) else round(v, n)


def _fmt(t: float) -> str:
    t = max(0.0, t)
    return f"{int(t // 60)}:{t % 60:04.1f}"


def decode_audio(path: Path, channels: int = 2):
    """Audio of any media file as float32 samples (n, channels) at 48 kHz, or None."""
    np = _numpy()
    cmd = ["ffmpeg", "-v", "error", "-nostdin", "-i", str(path), "-map", "0:a:0", "-ac", str(channels),
           "-ar", str(AUDIT_SR), "-f", "f32le", "-"]
    try:
        r = subprocess.run(cmd, capture_output=True, stdin=subprocess.DEVNULL, timeout=3600)
    except (OSError, subprocess.TimeoutExpired):
        return None
    if r.returncode != 0 or not r.stdout:
        return None
    return np.frombuffer(r.stdout, dtype="<f4").reshape(-1, channels)


def measure_ebur128(path: Path, mono: bool = False) -> dict | None:
    """Integrated loudness, LRA and true peak of the file's first audio stream (ffmpeg ebur128=peak=true)."""
    af = "ebur128=peak=true:framelog=quiet"
    if mono:
        af = "aformat=channel_layouts=stereo,pan=mono|c0=0.5*c0+0.5*c1," + af
    try:
        r = _run(["ffmpeg", "-hide_banner", "-nostats", "-nostdin", "-i", str(path), "-map", "0:a:0", "-af", af,
                  "-f", "null", "-"], timeout=3600)
    except (OSError, subprocess.TimeoutExpired):
        return None
    text = r.stderr or ""
    if r.returncode != 0 or "Summary:" not in text:
        return None
    tail = text[text.rfind("Summary:"):]

    def grab(pattern):
        m = re.search(pattern, tail)
        return None if not m else _num(m.group(1))

    return {"i": grab(r"I:\s*(-?[\d.]+|-inf)\s*LUFS"), "lra": grab(r"LRA:\s*(-?[\d.]+)\s*LU"),
            "tp": grab(r"Peak:\s*(-?[\d.]+|-inf)\s*dBFS")}


def probe_streams(path: Path) -> dict:
    try:
        r = _run(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_streams", "-show_format", str(path)], 120)
        return json.loads(r.stdout or "{}")
    except (OSError, subprocess.TimeoutExpired, json.JSONDecodeError):
        return {}


def _frames(x, n):
    k = len(x) // n
    return x[: k * n].reshape(k, n)


def _db(np, p):
    return 10 * np.log10(np.maximum(p, 1e-12))


def _band_power(np, win, lo, hi):
    """Full and band power per row of `win` (Hann window, rfft)."""
    w = np.hanning(win.shape[1])
    p = np.abs(np.fft.rfft(win * w, axis=1)) ** 2
    f = np.fft.rfftfreq(win.shape[1], 1.0 / AUDIT_SR)
    return p.sum(axis=1), p[:, (f >= lo) & (f < hi)].sum(axis=1)


def _runs(mask):
    """(start, end) index pairs of True runs, end exclusive."""
    out, start = [], None
    for i, v in enumerate(list(mask) + [False]):
        if v and start is None:
            start = i
        elif not v and start is not None:
            out.append((start, i))
            start = None
    return out


def _ear(start, end, question, why, fix, source, group, risk, measure):
    return {"start": _r(start), "end": _r(end), "time": f"{_fmt(start)}-{_fmt(end)}", "question": question,
            "why_not_machine": why, "fix_if_no": fix, "source": source, "group": group, "risk": _r(risk, 3),
            "measure": measure, "answer": None}


def _check(name, value, threshold, source, passed, blocking, findings=None, status=None):
    st = status or ("n/a" if passed is None else ("pass" if passed else ("fail" if blocking else "warn")))
    return {"name": name, "value": value, "threshold": threshold, "source": source, "pass": passed,
            "blocking": bool(blocking and passed is False) or status == "unmeasured" and bool(blocking),
            "status": st, "findings": findings or []}


# -- inputs --------------------------------------------------------------

def _stem_kind(path: Path) -> str:
    first = re.split(r"[^a-z0-9]+", path.stem.lower())[0] if path.stem else ""
    if first in SKIP_STEMS:
        return "skip"
    if first in VOICE_STEMS:
        return "voice"
    if first in SFX_STEMS:
        return "sfx"
    return "bed"


def load_stems(folder: Path) -> dict:
    stems = {"voice": [], "bed": [], "sfx": [], "skip": []}
    for p in sorted(x for x in folder.iterdir() if x.is_file() and x.suffix.lower() in AUDIO_EXTS):
        stems[_stem_kind(p)].append(p)
    return stems


def _sum_tracks(np, arrays):
    arrays = [a for a in arrays if a is not None and len(a)]
    if not arrays:
        return None
    n = max(len(a) for a in arrays)
    out = np.zeros((n, arrays[0].shape[1]), dtype=np.float64)
    for a in arrays:
        out[: len(a)] += a
    return out


def _times(v) -> list[float]:
    """Film times from a number, a {"t" | "start" | "time" | "at": s} object, or a list of either."""
    if isinstance(v, bool):
        return []
    if isinstance(v, (int, float)):
        return [float(v)]
    if isinstance(v, dict):
        k = next((k for k in ("t", "start", "time", "at") if isinstance(v.get(k), (int, float))
                  and not isinstance(v.get(k), bool)), None)
        return [] if k is None else [float(v[k])]
    if isinstance(v, list):
        return [x for i in v for x in _times(i)]
    return []


def load_cue_events(sheet: Path | None) -> dict:
    """Voice lines, sounding events, declared silences and extra joins from the cue sheet."""
    out = {"voice": [], "speakers": [], "events": [], "quiet": [], "joins": [], "music": False, "fps": None,
           "music_marks": []}
    if not sheet:
        return out
    data = json.loads(sheet.read_text(encoding="utf-8"))
    fps = float(data.get("fps") or 0) or None
    out["fps"] = fps
    music = data.get("music")
    out["music"] = bool(music.get("source") or music.get("file")) if isinstance(music, dict) else bool(music)
    if isinstance(music, dict):  # music changes that explain a level jump at a cut (A7)
        out["music_marks"] = [(t, f"music {k}") for k in ("drop", "outro", "sections") for t in _times(music.get(k))]
    voice = data.get("voice") or []
    if isinstance(voice, dict):
        voice = voice.get("lines", [])
    for v in voice:
        if isinstance(v, dict) and v.get("start") is not None and v.get("end") is not None:
            out["voice"].append((float(v["start"]), float(v["end"]), str(v.get("text", ""))))
            out["speakers"].append(v.get("speaker"))
    for e in data.get("events") or []:
        if not isinstance(e, dict):
            continue
        t = e.get("t")
        if t is None and e.get("frame") is not None and fps:
            t = float(e["frame"]) / fps
        if t is None:
            continue
        sound = str(e.get("sound") or "").strip()
        out["events"].append({"t": float(t), "kind": str(e.get("kind", "")), "what": str(e.get("what", "")),
                              "word": str(e.get("word", "")), "hero": e.get("hero") is True,
                              "sound": "" if not sound or sound.lower().startswith("none") else sound})
    for q in data.get("quiet") or []:
        if isinstance(q, dict) and q.get("start") is not None and q.get("end") is not None:
            out["quiet"].append((float(q["start"]), float(q["end"]), str(q.get("reason", ""))))
    out["joins"] = [float(t) for t in data.get("joins") or [] if isinstance(t, (int, float))]
    return out


def load_sfx_list(path: Path | None) -> list[dict]:
    if not path:
        return []
    raw = json.loads(path.read_text(encoding="utf-8"))
    items = []
    for it in raw if isinstance(raw, list) else []:
        if not isinstance(it, dict) or "file" not in it:
            continue
        f = Path(it["file"])
        f = f if f.is_absolute() else path.parent / f
        items.append({"file": f, "at": float(it.get("at", 0.0)), "gain_db": float(it.get("gain_db", 0.0)),
                      "dur": probe_duration(f) if f.exists() else None})
    return items


def separate_with_demucs(render: Path, work: Path) -> tuple[Path, Path] | None:
    """Voice and the rest of the render with demucs (pinned in versions.json), only when it is installed."""
    if importlib.util.find_spec("demucs") is None:
        return None
    wav = work / "render.wav"
    r = _run(["ffmpeg", "-y", "-v", "error", "-nostdin", "-i", str(render), "-map", "0:a:0", "-ac", "2",
              "-ar", "44100", str(wav)], 1800)
    if r.returncode != 0:
        return None
    r = _run([sys.executable, "-m", "demucs", "--two-stems", "vocals", "-n", "htdemucs", "-o", str(work), str(wav)], 7200)
    out = work / "htdemucs" / wav.stem
    if r.returncode != 0 or not (out / "vocals.wav").exists():
        return None
    return out / "vocals.wav", out / "no_vocals.wav"


# -- checks --------------------------------------------------------------

def audit_loudness(render: Path, prof: dict, target: float | None, peak: float | None) -> tuple[dict, dict | None]:
    m = measure_ebur128(render)
    i_t = target if target is not None else prof["i"]
    tp_t = peak if peak is not None else prof["tp"]
    thr = {"i": i_t, "i_tol": prof["i_tol"], "tp_max": tp_t, "lra_min": prof["lra_min"], "lra_max": prof["lra_max"],
           "lra_min_warns": prof["lra_min_warns"]}
    src = f'{MM} section 5, row "{prof["row"]}" (gate column)'
    if not m or m["i"] is None:
        return _check("Delivered loudness", None, thr, src, False, True, ["could not measure the render's loudness"]), m
    findings, hard, ear = [], False, []
    if abs(m["i"] - i_t) > prof["i_tol"] + 1e-9:
        hard = True
        findings.append(f"integrated {m['i']:.1f} LUFS is outside {i_t:g} +/-{prof['i_tol']:g}")
    if m["tp"] is not None and m["tp"] > tp_t + 1e-9:
        hard = True
        findings.append(f"true peak {m['tp']:+.1f} dBTP is over {tp_t:g}")
    lra = m["lra"]
    if lra is not None and prof["lra_max"] is not None and lra > prof["lra_max"] + 1e-9:
        hard = True
        findings.append(f"LRA {lra:.1f} LU is over {prof['lra_max']:g}")
    if lra is not None and prof["lra_min"] is not None and lra < prof["lra_min"] - 1e-9:
        msg = f"LRA {lra:.1f} LU is under {prof['lra_min']:g}"
        if prof["lra_min_warns"]:
            findings.append(msg + f" (a floor that warns: {NO_EAR})")
            ear.append(msg)
        else:
            hard = True
            findings.append(msg)
    c = _check("Delivered loudness", {"i": m["i"], "tp": m["tp"], "lra": lra}, thr, src,
               not hard and not ear, hard, findings)
    c["ear"] = ear
    return c, m


def audit_voice_over_bed(np, voice, bed, band: tuple[float, float]) -> tuple[dict, dict]:
    """A3 on mono stems at 48 kHz: voice over the rest per voiced 100 ms window, full band and 1 to 4 kHz."""
    n = int(0.1 * AUDIT_SR)
    L = max(len(voice), len(bed))
    v = np.zeros(L)
    b = np.zeros(L)
    v[: len(voice)] = voice
    b[: len(bed)] = bed
    V, B = _frames(v, n), _frames(b, n)
    vdb = _db(np, (V ** 2).mean(axis=1))
    vfull, vband = _band_power(np, V, 1000, 4000)
    bfull, bband = _band_power(np, B, 1000, 4000)
    src = (f"{MM} section 3 (bed {band[0]:g} to {band[1]:g} dB under the voice) and section 2 (1 to 4 kHz belongs to the "
           "voice); 5th percentile in 1 to 4 kHz under 0 dB blocks, under 6 dB goes to the ear list (sfx.md section 6)")
    thr = {"bed_band_db": list(band), "p5_band_block_db": 0.0, "p5_band_ear_db": 6.0}
    info = {"voiced": np.zeros(len(vdb), dtype=bool), "hop": 0.1}
    active = vdb > max(-60.0, float(np.percentile(vdb, 95)) - 40.0) if len(vdb) else vdb > 0
    if not active.any():
        return _check("Voice over bed", None, thr, src, None, False, ["no speech in the voice stem"]), info
    med = float(np.median(vdb[active]))
    voiced = active & (vdb >= med - 6.0)
    info["voiced"] = voiced
    full = np.clip(10 * np.log10(np.maximum(vfull, 1e-20) / np.maximum(bfull, 1e-20)), -80, 80)
    bandr = np.clip(10 * np.log10(np.maximum(vband, 1e-20) / np.maximum(bband, 1e-20)), -80, 80)
    fv, bv = full[voiced], bandr[voiced]
    value = {"voiced_windows": int(voiced.sum()), "median_full_db": _r(np.median(fv)), "median_band_db": _r(np.median(bv)),
             "p5_band_db": _r(np.percentile(bv, 5)), "share_band_under_6db": _r((bv < 6).mean(), 3),
             "share_band_under_0db": _r((bv < 0).mean(), 3)}
    findings, ear = [], []
    hard = value["p5_band_db"] < 0
    if hard:
        findings.append(f"in 1 to 4 kHz the bed is over the voice in {value['share_band_under_0db']:.0%} of voiced windows "
                        f"(5th percentile {value['p5_band_db']:+.1f} dB)")
    # every voiced run of 2 or more windows under 0 dB goes to the ear list
    idx = np.where(voiced)[0]
    runs = []  # voiced runs of 2 or more windows under 0 dB, merged across gaps up to 0.5 s into items up to 4 s
    for s, e in _runs(list(voiced & (bandr < 0))):
        if e - s < 2:
            continue
        if runs and s - runs[-1][1] <= 5 and e - runs[-1][0] <= 40:
            runs[-1] = (runs[-1][0], e)
        else:
            runs.append((s, e))
    for s, e in runs:
        worst = float(bandr[s:e].min())
        ear.append(_ear(s * 0.1, e * 0.1, f"At {_fmt(s * 0.1)}, is every word clear over the music?",
                        f"The bed is {abs(worst):.1f} dB over the voice in 1 to 4 kHz here (A3); whether the word "
                        "still reads depends on the word and the ear", "Lower or carve the bed here (mix-and-master.md "
                        "section 3), or move the hit off the word", "A3", 1, min(1.0, 0.9 + abs(worst) / 100),
                        f"A3: voice minus bed in 1 to 4 kHz {worst:+.1f} dB for {(e - s) * 0.1:.1f} s"))
    if not hard and value["p5_band_db"] < 6:
        k = int(idx[np.argmin(bv)])
        findings.append(f"5th percentile in 1 to 4 kHz is {value['p5_band_db']:+.1f} dB (under 6 dB: {NO_EAR})")
        ear.append(_ear(max(0, k * 0.1 - 0.5), k * 0.1 + 0.6, f"At {_fmt(k * 0.1)}, is the voice clear over the music?",
                        "The voice leads the bed by less than 6 dB in 1 to 4 kHz here (A3), the repo's masking line; "
                        "masking depends on the word", "Lower or carve the bed here (mix-and-master.md section 3)", "A3", 1,
                        0.8, f"A3: lowest voiced window {float(bv.min()):+.1f} dB in 1 to 4 kHz"))
    if value["median_full_db"] < band[0]:
        findings.append(f"median voice over bed {value['median_full_db']:.1f} dB is under the {band[0]:g} to "
                        f"{band[1]:g} dB band (bed too loud: {NO_EAR})")
        k = int(idx[np.argmin(fv)])
        ear.append(_ear(max(0, k * 0.1 - 1), k * 0.1 + 1, "Is the voice comfortable over the music here, without effort?",
                        f"The bed sits only {value['median_full_db']:.1f} dB under the voice on median (A3); comfort is "
                        "heard, the number only points to it", "Lower the bed 2 to 4 dB (mix-and-master.md section 3)",
                        "A3", 1, 0.7, f"A3: median voice over bed {value['median_full_db']:.1f} dB full band"))
    c = _check("Voice over bed", value, thr, src, not hard and not findings, hard, findings)
    if value["median_full_db"] > band[1]:
        c["notes"] = [f"median voice over bed {value['median_full_db']:.1f} dB is over the {band[1]:g} dB band (a bed "
                      "quieter than the type's canon is no intelligibility risk; check it is still heard)"]
    c["ear"] = ear
    return c, info


def _voiced_at(info: dict | None, cues: dict, t: float, pad: float = 0.05) -> bool:
    if info is not None and info["voiced"].any():
        hop = info["hop"]
        lo, hi = int(max(0.0, t - pad) / hop), int((t + pad) / hop) + 1
        return bool(info["voiced"][lo:hi].any())
    return any(s - pad <= t <= e + pad for s, e, _ in cues["voice"])


def _in_quiet(cues: dict, t: float) -> bool:
    return any(s <= t <= e for s, e, _ in cues["quiet"])


def audit_joins(np, mono, cues: dict, sfx: list[dict], info: dict | None) -> dict:
    """A6: clicks and truncation cliffs at every audio join named by the cue sheet and the SFX list."""
    joins = []
    for s, e, _ in cues["voice"]:
        joins += [(s, "voice start"), (e, "voice end")]
    joins += [(ev["t"], "effect cue") for ev in cues["events"] if ev["sound"]]
    joins += [(t, "join") for t in cues["joins"]]
    for it in sfx:
        joins.append((it["at"], "effect start"))
        if it["dur"]:
            joins.append((it["at"] + it["dur"], "effect end"))
    src = (f"{MM} section 4 (30 ms fades at every edit, 4 to 5 ms anti-click ramp); the ice-qa skill, "
           "references/captions-and-sync.md section 1, Acoustic forensics (truncation cliffs)")
    thr = {"step": 0.05, "step_local_rms_dbfs": -30.0, "cliff_db": 30.0, "cliff_pre_dbfs": -30.0, "hf_rise_db": 15.0}
    if not joins:
        return _check("Clicks and truncation at joins", None, thr, src, None, False, ["no joins given (cue sheet, --sfx)"])
    sr, n = AUDIT_SR, len(mono)
    w2, gap = int(0.005 * sr), int(0.001 * sr)
    planned_onset = ("effect cue", "effect start", "voice start")  # a sound that starts here explains a high-band rise
    findings, hard, ear, flagged = [], False, [], 0
    for t, kind in sorted(set(joins)):
        i = int(round(t * sr))
        if i - int(0.06 * sr) < 0 or i + int(0.06 * sr) >= n:
            continue
        seg = mono[i - int(0.05 * sr): i + int(0.05 * sr)].astype(np.float64)
        c = int(0.05 * sr)
        # an isolated step: a sample jump over 0.05 where the 50 ms around the join is quiet
        local = seg[c - int(0.025 * sr): c + int(0.025 * sr)]
        local_db = 10 * math.log10(max(float((local ** 2).mean()), 1e-12))
        near = seg[c - int(0.015 * sr): c + int(0.015 * sr)]
        step = float(np.abs(np.diff(near)).max()) if len(near) > 1 else 0.0
        # a truncation cliff: the 5 ms before a point against the 5 ms after it, sliding 1 ms across +/-15 ms
        cliff = 0.0
        for k in range(c - int(0.015 * sr), c + int(0.015 * sr), gap):
            pre, post = seg[k - w2 - gap: k - gap], seg[k + gap: k + gap + w2]
            pdb = 10 * math.log10(max(float((pre ** 2).mean()), 1e-12))
            qdb = 10 * math.log10(max(float((post ** 2).mean()), 1e-12))
            if pdb > thr["cliff_pre_dbfs"]:
                cliff = max(cliff, pdb - qdb)
        # a click in the high band: the loudest 3 ms frame over 4 kHz near the join against the loudest frame around it
        spec = np.fft.rfft(seg)
        f = np.fft.rfftfreq(len(seg), 1.0 / sr)
        spec[f < 4000] = 0
        e = _db(np, (_frames(np.fft.irfft(spec, len(seg)), int(0.003 * sr)) ** 2).mean(axis=1))
        mid = len(e) // 2
        inner, outer = e[max(0, mid - 3): mid + 4], np.concatenate([e[: max(0, mid - 5)], e[mid + 6:]])
        rise = float(inner.max() - outer.max()) if len(outer) and len(inner) else 0.0
        issues = []
        if step > thr["step"] and local_db < thr["step_local_rms_dbfs"]:
            issues.append(f"sample step {step:.3f} at {local_db:.0f} dBFS local level")
        if cliff > thr["cliff_db"]:
            issues.append(f"{cliff:.0f} dB envelope cliff")
        if rise > thr["hf_rise_db"] and kind not in planned_onset:
            issues.append(f"{rise:.0f} dB rise over 4 kHz")
        if not issues:
            continue
        flagged += 1
        blocks = kind.startswith("voice") or _voiced_at(info, cues, t) or _in_quiet(cues, t)
        msg = f"{_fmt(t)} {kind}: " + ", ".join(issues)
        findings.append(msg + (" (under speech or in a declared quiet: blocks)" if blocks else f" ({NO_EAR})"))
        hard = hard or blocks
        if not blocks:
            ear.append(_ear(t - 1.0, t + 1.0, f"Does the edit at {_fmt(t)} sound natural, with no click or cut word?",
                            "The join measured a click or cliff outside speech (A6); whether it is heard over the "
                            "music depends on the material", "Put a 30 ms fade at the join (mix-and-master.md section 4)",
                            "A6", 7, 0.4, "A6: " + ", ".join(issues)))
    c = _check("Clicks and truncation at joins", {"joins": len(set(joins)), "flagged": flagged}, thr, src,
               not findings, hard, findings)
    c["ear"] = ear
    return c


def audit_clipping(np, tracks: dict) -> dict:
    """A8: runs of 3 or more samples at or over -0.1 dBFS, per channel, on the render and every stem."""
    out, findings = {}, []
    for name, x in tracks.items():
        runs, first = 0, None
        for ch in range(x.shape[1]):
            m = np.abs(x[:, ch]) >= CLIP_LEVEL
            if not m.any():
                continue
            d = np.diff(np.concatenate(([0], m.astype(np.int8), [0])))
            starts, ends = np.where(d == 1)[0], np.where(d == -1)[0]
            sel = (ends - starts) >= 3
            runs += int(sel.sum())
            if sel.any():
                t0 = float(starts[sel][0]) / AUDIT_SR
                first = t0 if first is None else min(first, t0)
        out[name] = runs
        if runs:
            findings.append(f"{name}: {runs} clipped run(s), first at {_fmt(first)}")
    src = f"{MM} section 6 (master once; clipping in a stem survives normalization)"
    return _check("Sample clipping", out, {"level_dbfs": -0.1, "run_samples": 3, "allowed_runs": 0}, src,
                  not findings, True, findings)


def audit_dc(np, tracks: dict) -> dict:
    """A9: per channel mean on the render and every stem."""
    out, findings = {}, []
    for name, x in tracks.items():
        means = [float(x[:, ch].astype(np.float64).mean()) for ch in range(x.shape[1])]
        out[name] = [_r(m, 5) for m in means]
        worst = max(abs(m) for m in means)
        if worst > DC_LIMIT:
            findings.append(f"{name}: DC offset {worst:.4f} (limit {DC_LIMIT})")
    return _check("DC offset", out, {"abs_mean_max": DC_LIMIT}, "absolute mean over 0.001 fails (the opt-in mgaudio qc warns "
                  "at 0.002); a high-pass at the input removes it", not findings, True, findings)


def audit_stereo(np, x, render: Path, loud: dict | None) -> tuple[dict, list]:
    """A10: L/R balance, correlation under 150 Hz and in 150 Hz to 2 kHz, extra mono loss."""
    L, R = x[:, 0].astype(np.float64), x[:, 1].astype(np.float64)
    bal = 10 * math.log10(max(float((L ** 2).mean()), 1e-12) / max(float((R ** 2).mean()), 1e-12))
    n = AUDIT_SR
    FL, FR = _frames(L, n), _frames(R, n)
    value = {"balance_db": _r(bal)}
    findings, hard, ear = [], False, []
    if len(FL):
        w = np.hanning(n)
        SL, SR = np.fft.rfft(FL * w, axis=1), np.fft.rfft(FR * w, axis=1)
        f = np.fft.rfftfreq(n, 1.0 / AUDIT_SR)
        norm = n * float((w ** 2).sum()) / 2
        for key, lo, hi, floor in (("sub", 20, 150, 0.8), ("mid", 150, 2000, 0.3)):
            sel = (f >= lo) & (f < hi)
            cross = (SL[:, sel] * np.conj(SR[:, sel])).real.sum(axis=1)
            pl, pr = (np.abs(SL[:, sel]) ** 2).sum(axis=1), (np.abs(SR[:, sel]) ** 2).sum(axis=1)
            edb = _db(np, (pl + pr) / 2 / norm)
            if not (edb > -50).any():  # nothing in this band to judge
                value[f"{key}_correlation"] = None
                continue
            corr = float(cross.sum()) / math.sqrt(max(float(pl.sum()) * float(pr.sum()), 1e-30))
            value[f"{key}_correlation"] = _r(corr, 3)
            sig = (edb > -50) & (edb > edb.max() - 30)
            wc = cross / np.sqrt(np.maximum(pl * pr, 1e-30))
            anti = np.where(sig & (wc < 0))[0]
            if key == "sub" and len(anti):
                hard = True
                findings.append(f"anti-phase low end (under 150 Hz) in {len(anti)} s, first at {_fmt(float(anti[0]))}")
            if corr < floor:
                findings.append(f"{key} correlation {corr:.2f} is under {floor}")
    mono = measure_ebur128(render, mono=True)
    if loud and mono and loud.get("i") is not None and mono.get("i") is not None:
        extra = (loud["i"] - 3.0) - mono["i"]
        value["mono_i"] = mono["i"]
        value["extra_mono_loss_db"] = _r(extra)
        if extra > 1.5:
            hard = True
            findings.append(f"extra mono loss {extra:.1f} dB (limit 1.5)")
    if abs(bal) > 1.0:
        findings.append(f"left and right differ by {abs(bal):.1f} dB (voice-led mixes keep the voice centred)")
        ear.append(_ear(0, 8, "Does the voice sit in the centre, not pulled to one side?",
                        f"Left and right differ by {abs(bal):.1f} dB (A10); a wide bed can cause it without moving the voice",
                        "Pan the voice centre, mono (mix-and-master.md section 5, news reel item 7)", "A10", 8, 0.3,
                        f"A10: L/R balance {bal:+.1f} dB"))
    src = f"{MM} section 2 (mono safety) and section 5 row news reel item 7 (subs mono, never anti-phase)"
    thr = {"balance_db_max": 1.0, "sub_correlation_min": 0.8, "mid_correlation_min": 0.3, "extra_mono_loss_db_max": 1.5}
    c = _check("Stereo, phase and mono", value, thr, src, not findings, hard, findings)
    return c, ear


def audit_stream(render: Path, profile_id: str) -> tuple[dict, float | None]:
    """A11: audio codec, rate, channels, bitrate, and audio against video length."""
    info = probe_streams(render)
    streams = info.get("streams") or []
    a = next((s for s in streams if s.get("codec_type") == "audio"), None)
    v = next((s for s in streams if s.get("codec_type") == "video"), None)
    src = f"{MM} section 6 (AAC 192 to 256 kbps, 48 kHz stereo); lengths within one frame (an incomplete or desynced encode)"
    thr = {"codec": "aac (broadcast: per spec)", "sample_rate": AUDIT_SR, "channels": 2, "bitrate_kbps": [192, 256],
           "length_tolerance": "one frame (at least one 1024-sample AAC frame)"}
    if not a:
        return _check("Stream spec and length", None, thr, src, False, True, ["no audio stream"]), None
    rate = int(a.get("sample_rate") or 0)
    ch = int(a.get("channels") or 0)
    br = _num(a.get("bit_rate"))
    adur = _num(a.get("duration")) or _num((info.get("format") or {}).get("duration"))
    value = {"codec": a.get("codec_name"), "sample_rate": rate, "channels": ch,
             "bitrate_kbps": _r(br / 1000, 1) if br else None, "audio_s": _r(adur, 3)}
    findings, hard = [], False
    if rate != AUDIT_SR:
        hard = True
        findings.append(f"sample rate {rate} Hz, not {AUDIT_SR}")
    if ch != 2:
        hard = True
        findings.append(f"{ch} audio channel(s), not 2")
    if a.get("codec_name") != "aac" and not profile_id.startswith("broadcast"):
        hard = True
        findings.append(f"codec {a.get('codec_name')}, not AAC")
    if br and not 0.95 * 192000 <= br <= 1.05 * 256000:
        findings.append(f"bitrate {br / 1000:.0f} kbps is outside 192 to 256")
    vdur = None
    if v:
        vdur = _num(v.get("duration")) or _num((info.get("format") or {}).get("duration"))
        num, _, den = str(v.get("avg_frame_rate") or v.get("r_frame_rate") or "30/1").partition("/")
        try:
            fps = float(num) / float(den or 1)
        except (ValueError, ZeroDivisionError):
            fps = 30.0
        value["video_s"] = _r(vdur, 3)
        value["fps"] = _r(fps, 3)
        tol = max(1.0 / max(fps, 1.0), 1024.0 / AUDIT_SR) + 0.001
        if adur is not None and vdur is not None and abs(adur - vdur) > tol:
            hard = True
            findings.append(f"audio {adur:.3f} s against video {vdur:.3f} s (more than one frame apart)")
    else:
        findings.append("no video stream: the length check is skipped")
    return _check("Stream spec and length", value, thr, src, not hard and not [f for f in findings if "bitrate" in f],
                  hard, findings), vdur or adur


def audit_silences(np, mono, cues: dict, profile_id: str) -> dict:
    """A12: undeclared holes under -50 dBFS over 0.25 s, declared quiet windows 6 dB under the 2 s before."""
    hop = int(0.01 * AUDIT_SR)
    e = _db(np, (_frames(mono.astype(np.float64), hop) ** 2).mean(axis=1))
    audible = np.where(e > HOLE_DB)[0]
    src = (f"{MM} section 4 (no hole over 0.25 s unless declared in the cue sheet's quiet list); the ice-audio skill, "
           "references/cue-map-and-beat-sync.md section 2 (quiet); news reel end silence: section 5 item 8")
    thr = {"hole_dbfs": HOLE_DB, "hole_s": HOLE_S, "quiet_dip_db": QUIET_DIP_DB}
    if not len(audible):
        return _check("Holes and declared silences", None, thr, src, False, True, ["the render is silent"])
    first, last = int(audible[0]), int(audible[-1])
    findings, hard, holes = [], False, []
    for s, en in _runs(list(e[first: last + 1] <= HOLE_DB)):
        ts, te = (first + s) * 0.01, (first + en) * 0.01
        if te - ts < HOLE_S:
            continue
        declared = any(qs - 0.1 <= ts and te <= qe + 0.1 for qs, qe, _ in cues["quiet"])
        digital = bool((e[first + s: first + en] < -90).any())
        holes.append({"start": _r(ts), "end": _r(te), "declared": declared, "digital": digital})
        if not declared:
            hard = True
            findings.append(f"undeclared hole {_fmt(ts)}-{_fmt(te)}" + (" (digital silence)" if digital else ""))
    quiet = []
    level = lambda a, b: 10 * math.log10(max(float((10 ** (e[a:b] / 10)).mean()), 1e-12))  # noqa: E731 (energy mean)
    for qs, qe, reason in cues["quiet"]:
        a0 = max(0.0, qs - 2.0)
        if qs - a0 < 0.5 or int(qs / 0.01) >= len(e):
            quiet.append({"start": qs, "end": qe, "checked": False})
            continue
        before = level(int(a0 / 0.01), int(qs / 0.01))
        inside = level(int(qs / 0.01), max(int(qe / 0.01), int(qs / 0.01) + 1))
        dip = before - inside
        quiet.append({"start": qs, "end": qe, "dip_db": _r(dip), "checked": True})
        if dip is not None and dip < QUIET_DIP_DB:
            hard = True
            findings.append(f"declared quiet {_fmt(qs)}-{_fmt(qe)} ({reason or 'no reason'}) is only {dip:.1f} dB under "
                            "the 2 s before")
    tail = (len(e) - 1 - last) * 0.01
    lead = first * 0.01
    if tail > 0.5 and profile_id != "news-reel":
        findings.append(f"{tail:.1f} s of silence at the end (over 0.5 s; a news reel's designed end silence is exempt)")
    value = {"lead_s": _r(lead), "tail_s": _r(tail), "holes": holes, "quiet": quiet}
    return _check("Holes and declared silences", value, thr, src, not findings, hard, findings)


def audit_ending(np, render: Path, film_s: float | None, master_json: Path | None, voice) -> tuple[dict, list]:
    """A13: looped or short music (master.json), voice or effects cut at the film end."""
    findings, hard, ear, value = [], False, [], {}
    data = None
    if master_json and master_json.is_file():
        try:
            data = json.loads(master_json.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            data = None
    if data:
        value["master_json"] = str(master_json)
        edges = data.get("music_edges") or {}
        if (edges.get("looped") or edges.get("ends_before_film")) and film_s:
            what = "restarts from its top inside the film (looped)" if edges.get("looped") else "ends before the film"
            findings.append(f"the music {what} ({NO_EAR})")
            end = edges.get("music_duration_sec")
            t = (float(end) - float(edges.get("start_sec") or 0)) if end else film_s - 2
            ear.append(_ear(max(0.0, t - 3), min(film_s, t + 3), f"Does the music at {_fmt(t)} carry on without an "
                            "audible restart or an early stop?", f"master.json records that the track {what} (A13); a "
                            "pad can loop unheard, a song cannot", "Back-time a longer track or cut on a bar line "
                            "(music-choice-and-licensing.md section 4)", "A13", 3, 0.65, f"A13: music {what}"))
        cut = data.get("cut_at_end") or {}
        if (cut.get("voice") or {}).get("cut"):
            hard = True
            findings.append(f"voice cut at the film end: {cut['voice'].get('seconds_after_end')} s of speech after the last frame")
        for s in cut.get("sfx") or []:
            findings.append(f"effect cut at the film end: {Path(str(s.get('file'))).name} ({NO_EAR})")
            if film_s:
                ear.append(_ear(max(0, film_s - 3), film_s, "Does the last effect end naturally, not cut off?",
                                "master.json records an effect still sounding at the last frame (A13); a cut tail can be "
                                "intended on a hard cut", "Place the effect earlier or fade its tail before the end",
                                "A13", 7, 0.35, f"A13: {Path(str(s.get('file'))).name} cut at the end"))
    if voice is not None and film_s:
        k = int(film_s * AUDIT_SR)
        after = voice[k:]
        if len(after) > int(0.05 * AUDIT_SR):
            fr = _frames(after.astype(np.float64), int(0.05 * AUDIT_SR))
            peak = float(_db(np, (fr ** 2).mean(axis=1)).max()) if len(fr) else -120.0
            value["voice_after_end_db"] = _r(peak)
            if peak > CUT_TAIL_DB:
                hard = True
                findings.append(f"the voice stem carries speech after the film end ({peak:.0f} dBFS): the last words are cut")
    src = ("the ice-audio skill, references/music-choice-and-licensing.md section 4 item 6 (ending), "
           f"{MM} section 6 (music edges recorded in master.json)")
    passed = None if not value and not findings else not findings
    c = _check("Music ending and cut sounds", value, {"voice_after_end": "blocks", "looped_or_short_music": NO_EAR,
               "effect_after_end": NO_EAR}, src, passed, hard, findings)
    return c, ear


def audit_sfx_under_speech(np, sfx_track, voice_info: dict | None, voice, profile_id: str) -> tuple[dict, list]:
    """A15: per effect overlapping voiced windows, its energy share in 150 Hz to 4 kHz and its level against the voice."""
    src = ("the ice-audio skill, references/sfx.md section 3b, NEVER item 1 (news reel: under speech, sub or air only); "
           "other types: a hit on a word goes to the ear list")
    thr = {"voice_band": [150, 4000], "share_max": 0.5, "blocks": profile_id == "news-reel"}
    if sfx_track is None or voice_info is None or not voice_info["voiced"].any():
        return _check("Effects under speech", None, thr, src, None, False, ["no effects stem or list, or no voice stem"]), []
    n = int(0.1 * AUDIT_SR)
    S = _frames(np.concatenate([sfx_track, np.zeros(max(0, len(voice_info["voiced"]) * n - len(sfx_track)))]), n)
    V = _frames(np.concatenate([voice, np.zeros(max(0, len(S) * n - len(voice)))]), n)
    k = min(len(S), len(V), len(voice_info["voiced"]))
    S, V, voiced = S[:k], V[:k], voice_info["voiced"][:k]
    sfull, sband = _band_power(np, S, 150, 4000)
    sdb = _db(np, (S ** 2).mean(axis=1))
    vdb = _db(np, (V ** 2).mean(axis=1))
    active = sdb > max(-60.0, float(sdb.max()) - 40.0)
    events, findings, hard, ear = [], [], False, []
    for s, e in _runs(list(active & voiced)):
        share = float(sband[s:e].sum() / max(sfull[s:e].sum(), 1e-20))
        rel = float(sdb[s:e].max() - vdb[s:e].max())
        events.append({"start": _r(s * 0.1), "end": _r(e * 0.1), "voice_band_share": _r(share, 3), "level_vs_voice_db": _r(rel)})
        if share > 0.5:
            if profile_id == "news-reel":
                hard = True
                findings.append(f"effect at {_fmt(s * 0.1)} under speech has {share:.0%} of its energy in 150 Hz to 4 kHz")
            elif rel > -6:
                findings.append(f"effect at {_fmt(s * 0.1)} sits on a word ({share:.0%} in the voice band, {rel:+.0f} dB "
                                f"against the voice: {NO_EAR})")
                ear.append(_ear(s * 0.1 - 0.5, e * 0.1 + 0.5, f"Does the effect at {_fmt(s * 0.1)} leave the word under it clear?",
                                f"The effect sits in the voice band ({share:.0%}) within 6 dB of the voice (A15); whether it "
                                "covers the word is heard", "Move the hit to a breath or lower it (sfx.md section 6)",
                                "A15", 6, 0.55, f"A15: voice-band share {share:.0%}, {rel:+.0f} dB against the voice"))
    passed = not findings if events else True
    return _check("Effects under speech", {"events": events}, thr, src, passed, hard, findings), ear


def read_speech_check(project: Path, no_speech: bool) -> tuple[dict, list]:
    """A5 from align_script_to_asr.py --stem (ice/review/speech-check.json), and unresolved L11 caption mismatches."""
    src = (f"{MM} section 7 (floors 0.8 per scene, 0.85 overall); the ice-type skill, scripts/align_script_to_asr.py "
           "--stem (masked words block)")
    ear = []
    cap = project / "ice" / "review" / "captions-check.json"
    if cap.is_file():
        try:
            cc = json.loads(cap.read_text(encoding="utf-8"))
            for m in (cc.get("mismatches") or [])[:3]:
                t = float(m.get("t") or 0)
                ear.append(_ear(t - 0.4, t + 0.8, f"Is the word here \"{m.get('caption') or m.get('heard')}\"?",
                                f"The captions say \"{m.get('caption')}\" and a fresh transcript heard \"{m.get('heard')}\" "
                                "(L11); a wrong word and a misheard right word look the same to the machine",
                                "Fix the caption, or re-record or respell the word", "L11", 1, 0.85,
                                f"L11: {m.get('kind')} caption word"))
        except (OSError, json.JSONDecodeError, ValueError, TypeError):
            pass
    if no_speech:
        return _check("Masked or garbled words", None, {}, src, None, False, ["declared: no speech"]), ear
    f = project / "ice" / "review" / "speech-check.json"
    if not f.is_file():
        return _check("Masked or garbled words", None, {}, src, None, False,
                      ["not run: python <ice-type skill>/scripts/align_script_to_asr.py --stem <voice stem> --mix <render> "
                       "<script> (writes ice/review/speech-check.json)"], status="not run"), ear
    try:
        rep = json.loads(f.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return _check("Masked or garbled words", None, {}, src, False, True, ["speech-check.json is unreadable"]), ear
    blocking = list(rep.get("blocking") or [])
    value = {"overall_mix": (rep.get("overall") or {}).get("mix"), "counts": rep.get("counts")}
    return _check("Masked or garbled words", value, rep.get("floors") or {}, src, not blocking, bool(blocking), blocking), ear


# -- A7 level jumps at cuts ----------------------------------------------

CUT_KINDS = re.compile(r"\b(cut|transition|edit|join)\b", re.I)
JUMP_MIX_LU = 6.0        # whole mix, no cue to explain it (provisional, notes A7)
JUMP_DIALOGUE_LU = 3.0   # the same voice across a join: the 1.5 LU unevenness line of mix-and-master.md section 5, scaled
EXPLAIN_S = 0.5          # a cue this close to the cut explains a jump


def momentary_loudness(path: Path) -> list[tuple[float, float]]:
    """Momentary loudness (K-weighted, 400 ms) every 100 ms from ffmpeg ebur128: [(window end in s, LUFS)]."""
    try:
        r = _run(["ffmpeg", "-hide_banner", "-nostats", "-nostdin", "-i", str(path), "-map", "0:a:0", "-af", "ebur128",
                  "-f", "null", "-"], timeout=3600)
    except (OSError, subprocess.TimeoutExpired):
        return []
    out = []
    for m in re.finditer(r"\bt:\s*([\d.]+)\s.*?\bM:\s*(-?[\d.]+|-?inf|nan)", r.stderr or ""):
        v = _num(m.group(2))
        out.append((float(m.group(1)), -120.0 if v is None or math.isnan(v) else max(-120.0, v)))
    return out


def scene_cuts(render: Path) -> list[float]:
    """Picture cuts of the render by ffmpeg scene detection (scene score over 0.3 on a 160 px wide copy)."""
    try:
        r = _run(["ffmpeg", "-hide_banner", "-nostats", "-nostdin", "-i", str(render), "-map", "0:v:0", "-vf",
                  "scale=160:-2,select=gt(scene\\,0.3),showinfo", "-f", "null", "-"], timeout=3600)
    except (OSError, subprocess.TimeoutExpired):
        return []
    return [] if r.returncode != 0 else [float(x) for x in re.findall(r"pts_time:([\d.]+)", r.stderr or "")]


def picture_cuts(render: Path, cues: dict) -> tuple[list[float], str]:
    """Cut and join times: the cue sheet (events of kind cut, transition, edit or join, and "joins"), the render's
    events file (<render>.events.json, kind or type "cut"), else scene detection on the render."""
    times = [e["t"] for e in cues["events"] if CUT_KINDS.search(e["kind"])] + list(cues["joins"])
    src = ["cue sheet"] if times else []
    for p in (render.with_suffix(".events.json"), render.parent / (render.name + ".events.json")):
        if not p.is_file():
            continue
        try:
            data = json.loads(p.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            break
        evs = data.get("events") if isinstance(data, dict) else data
        got = []
        for e in evs if isinstance(evs, list) else []:
            t = e.get("t", e.get("time")) if isinstance(e, dict) else None
            if isinstance(t, (int, float)) and str(e.get("kind") or e.get("type") or "").lower() == "cut":
                got.append(float(t))
        if got:
            times += got
            src.append(p.name)
        break
    if not times:
        times = scene_cuts(render)
        if times:
            src.append("scene detection on the render")
    merged: list[float] = []
    for t in sorted(times):
        if not merged or t - merged[-1] > 0.15:
            merged.append(t)
    return merged, ", ".join(src) or "none found"


def _line_at(cues: dict, t: float) -> int | None:
    return next((k for k, (s, e, _) in enumerate(cues["voice"]) if s <= t <= e), None)


def _same_speaker(cues: dict, a: int | None, b: int | None) -> bool:
    if a is None or b is None or a == b:
        return True
    sa, sb = cues["speakers"][a], cues["speakers"][b]
    return not (sa and sb and sa != sb)


def audit_level_jumps(np, render: Path, cues: dict, sfx: list[dict], info: dict | None, voice, film_s: float) -> dict:
    """A7: momentary loudness 0.5 s before and after each cut and join; the same voice across a join. Ear list only."""
    src = (f"{MM} section 5 (a line more than 1.5 LU from the median sounds uneven; scaled to 3 LU for one voice across a "
           "join); the whole mix over 6 LU with no cue to explain it (provisional); never blocks: the ear list")
    thr = {"mix_lu": JUMP_MIX_LU, "dialogue_lu": JUMP_DIALOGUE_LU, "window_s": 0.4, "guard_s": 0.1,
           "explained_within_s": EXPLAIN_S}
    cuts, where = picture_cuts(render, cues)
    cuts = [c for c in cuts if 0.5 <= c <= film_s - 0.5]
    if not cuts:
        return _check("Level jumps at cuts", None, thr, src, None, False,
                      ["no cut found (cue sheet events of kind cut or transition, joins, <render>.events.json, scene "
                       "detection)"])
    series = momentary_loudness(render)
    if not series:
        return _check("Level jumps at cuts", None, thr, src, None, False, ["could not read the momentary loudness"])
    T = np.array([s[0] for s in series])
    M = np.array([s[1] for s in series])
    marks = [(e["t"], f"cue \"{e['sound']}\"") for e in cues["events"] if e["sound"]]
    marks += [(it["at"], f"effect {Path(it['file']).name}") for it in sfx]
    marks += list(cues["music_marks"])
    for s, e, _ in cues["quiet"]:
        marks += [(s, "declared quiet start"), (e, "declared quiet end")]
    for s, e, _ in cues["voice"]:
        marks += [(s, "voice line start"), (e, "voice line end")]
    vp = None
    if voice is not None and info is not None and info["voiced"].any():
        vp = (_frames(np.asarray(voice, dtype=np.float64), int(0.1 * AUDIT_SR)) ** 2).mean(axis=1)
    rows, findings, ear = [], [], []
    for c in cuts:
        pre = float(M[int(np.argmin(np.abs(T - (c - 0.1))))])   # the 400 ms ending 0.1 s before the cut
        post = float(M[int(np.argmin(np.abs(T - (c + 0.5))))])  # the 400 ms starting 0.1 s after it
        if pre <= -70 and post <= -70:
            continue
        jump = post - pre
        why = next((label for t, label in marks if abs(t - c) <= EXPLAIN_S), None)
        row = {"t": _r(c), "pre_lufs": _r(pre, 1), "post_lufs": _r(post, 1), "jump_lu": _r(jump, 1), "explained_by": why,
               "voice_jump_db": None}
        flagged = []
        if abs(jump) > JUMP_MIX_LU and not why:
            flagged.append(("mix", jump, JUMP_MIX_LU))
        same = _same_speaker(cues, _line_at(cues, c - 0.3), _line_at(cues, c + 0.3))
        if vp is not None and same:  # the voice stem's voiced 100 ms frames within 1 s on each side
            a = [k for k in range(int((c - 1.0) / 0.1), int((c - 0.1) / 0.1)) if 0 <= k < len(vp) and info["voiced"][k]]
            b = [k for k in range(int((c + 0.1) / 0.1) + 1, int((c + 1.0) / 0.1)) if 0 <= k < len(vp) and info["voiced"][k]]
            if len(a) >= 2 and len(b) >= 2:
                vj = 10 * math.log10(max(float(vp[b].mean()), 1e-12) / max(float(vp[a].mean()), 1e-12))
                row["voice_jump_db"] = _r(vj, 1)
                if abs(vj) > JUMP_DIALOGUE_LU:
                    flagged.append(("voice", vj, JUMP_DIALOGUE_LU))
        elif vp is None and same and _line_at(cues, c - 0.3) is not None and _line_at(cues, c + 0.3) is not None:
            hit = next((label for t, label in marks if abs(t - c) <= EXPLAIN_S and not label.startswith("voice")), None)
            if abs(jump) > JUMP_DIALOGUE_LU and not hit and not any(f[0] == "mix" for f in flagged):
                flagged.append(("voice", jump, JUMP_DIALOGUE_LU))
        rows.append(row)
        for kind, size, limit in flagged:
            if kind == "mix":
                findings.append(f"{_fmt(c)}: the mix jumps {size:+.1f} LU across the cut with no cue to explain it ({NO_EAR})")
                ear.append(_ear(c - 1.5, c + 1.5, f"Does the level change at {_fmt(c)} feel intended, not a slip?",
                                f"The mix jumps {size:+.1f} LU across the cut and no cue in the cue sheet explains it (A7); an "
                                "intended change and a slip measure the same", "Match the levels across the cut with a 30 ms "
                                "fade (mix-and-master.md section 4), or name the cue that motivates the change in the cue sheet",
                                "A7", 7, 0.4 + min(0.15, (abs(size) - limit) / 40), f"A7: {size:+.1f} LU across the cut"))
            else:
                findings.append(f"{_fmt(c)}: the voice changes {size:+.1f} dB across the join ({NO_EAR})")
                ear.append(_ear(c - 1.5, c + 1.5, f"Does the voice keep the same level across the cut at {_fmt(c)}?",
                                f"The voice changes {size:+.1f} dB across the join (A7, over {limit:g}); a new take, mic or "
                                "emphasis can be intended", "Even the line levels (mix-and-master.md section 5, accept "
                                "window)", "A7", 7, 0.45 + min(0.15, (abs(size) - limit) / 40),
                                f"A7: voice {size:+.1f} dB across the join"))
    c = _check("Level jumps at cuts", {"cuts": len(cuts), "cut_source": where, "jumps": rows}, thr, src, not findings,
               False, findings)
    c["ear"] = ear
    return c


# -- A14 every effect cue heard and in sync --------------------------------

SFX_LIFT_DB = 3.0             # in-band lift over the premix (sfx.md section 6)
SFX_REL_FAIL_DB = -6.0        # more than 6 dB under the ducked score in its band: masked (sfx.md section 6)
SFX_MISSING_DB = 0.3          # a lift under this: nothing measurable
SFX_FLOOR_DBFS = -45.0        # the cue's own level floor (audio-gates.md section 2, effects present and audible)
SFX_LATE_S = 0.010            # never late; 10 ms is the measurement's resolution
SFX_MATCH_S = 0.5             # an SFX list item belongs to the cue-sheet event within this time
SFX_HOP_S = 0.0025
SFX_BODY_S = 0.15             # the 150 ms body of a cue (sfx.md section 6)
PREMIX_MATCH_DB = 1.0         # premix and render agree this closely away from the cues, or the premix is stale
HERO_CUE = re.compile(r"\b(hero|signature|reveal|payoff|logo)\b", re.I)
OCTAVES = [31.5 * 2 ** k for k in range(10)]  # octave centres 31.5 Hz to 16 kHz


def _octave_powers(np, x):
    p = np.abs(np.fft.rfft(x * np.hanning(len(x)))) ** 2
    f = np.fft.rfftfreq(len(x), 1.0 / AUDIT_SR)
    return np.array([float(p[(f >= c / 2 ** 0.5) & (f < c * 2 ** 0.5)].sum()) for c in OCTAVES])


def _dominant_band(np, powers) -> tuple[float, float] | None:
    """The contiguous octaves around the loudest one holding at least a quarter (-6 dB) of its energy, in Hz."""
    if not len(powers) or float(powers.max()) <= 1e-18:
        return None
    k = int(np.argmax(powers))
    lo = hi = k
    while lo > 0 and powers[lo - 1] >= 0.25 * powers[k]:
        lo -= 1
    while hi < len(powers) - 1 and powers[hi + 1] >= 0.25 * powers[k]:
        hi += 1
    return OCTAVES[lo] / 2 ** 0.5, min(OCTAVES[hi] * 2 ** 0.5, AUDIT_SR / 2)


def _band_env(np, x, lo: float, hi: float, hop: int):
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1.0 / AUDIT_SR)
    spec[(f < lo) | (f >= hi)] = 0
    return (_frames(np.fft.irfft(spec, len(x)), hop) ** 2).mean(axis=1)


def _attack(np, env) -> int | None:
    """Index of the first hop within 12 dB of the envelope's maximum (the attack edge)."""
    if not len(env) or float(env.max()) <= 1e-18:
        return None
    return int(np.argmax(env >= float(env.max()) * 10 ** -1.2))


def sfx_cue_list(np, cues: dict, sfx: list[dict]) -> list[dict]:
    """Effect cues: every sounding cue-sheet event, matched to the nearest SFX list item whose sync point (file start plus
    the file's loudest sample, sfx.md section 5 item 1) lies within 0.5 s, then every SFX list item left over."""
    items = []
    hop = int(SFX_HOP_S * AUDIT_SR)
    for it in sfx:
        a = decode_audio(it["file"]) if it["file"].exists() else None
        sync, band, onset = 0.0, None, None
        if a is not None and len(a):
            m = a.astype(np.float64).mean(axis=1)[: int(30 * AUDIT_SR)]
            sync = float(np.argmax(np.abs(m))) / AUDIT_SR
            band = _dominant_band(np, _octave_powers(np, m[: int(4 * AUDIT_SR)]))
            k = None if band is None else _attack(np, _band_env(np, m, band[0], band[1], hop))
            onset = None if k is None else k * SFX_HOP_S
        items.append({"file": it["file"], "band": band, "planned": it["at"] + sync, "start": it["at"], "sync": sync,
                      "onset": onset})
    out, used = [], set()
    for e in sorted((e for e in cues["events"] if e["sound"]), key=lambda e: e["t"]):
        near = [k for k in range(len(items)) if k not in used and abs(items[k]["planned"] - e["t"]) <= SFX_MATCH_S]
        k = min(near, key=lambda k: abs(items[k]["planned"] - e["t"])) if near else None
        it = None if k is None else items[k]
        if k is not None:
            used.add(k)
        cue = {"t": e["t"], "label": e["sound"], "hero": e["hero"] or bool(HERO_CUE.search(" ".join(
            (e["kind"], e["what"], e["sound"])))), "picture_event": True}
        out.append({**cue, **_file_part(it)})
    for k, it in enumerate(items):
        if k not in used:
            out.append({"t": it["planned"], "label": it["file"].name, "hero": False, "picture_event": False,
                        **_file_part(it)})
    return sorted(out, key=lambda c: c["t"])


def _file_part(it: dict | None) -> dict:
    keys = ("band", "planned", "start", "sync", "onset")
    return {"file": None if it is None else it["file"].name, **{k: None if it is None else it[k] for k in keys}}


def measure_cue(np, R, P, cue: dict, fps: float, film_s: float) -> dict:
    """In-band lift of the render over the premix in the cue's loudest 150 ms, its level against the premix (the ducked
    score), its own level, and its sync point against the event time. The sync point: the cue's attack edge in the
    render, moved by the file's own attack and sync point (sfx.md section 5 item 1), so a limiter that flattens a loud
    hit does not move it; a cue with no file is a contact, its attack edge is its sync point."""
    t = cue["t"]
    planned = cue["planned"] if cue["planned"] is not None else t
    first = min(t - (cue["sync"] or 0.0), cue["start"] if cue["start"] is not None else t)  # the file's start is inside
    a, b = max(0.0, first - 0.25), min(film_s, len(R) / AUDIT_SR, max(t, planned) + 0.5)
    row = {"t": _r(t, 3), "label": cue["label"], "hero": cue["hero"], "file": cue["file"],
           "picture_event": cue["picture_event"]}
    hop, pad = int(SFX_HOP_S * AUDIT_SR), int(0.2 * AUDIT_SR)
    i0, i1 = int(a * AUDIT_SR), int(b * AUDIT_SR)
    j0, j1 = max(0, i0 - pad), min(len(R), i1 + pad)
    if i1 - i0 < int(SFX_BODY_S * AUDIT_SR) + hop:
        return {**row, "status": "not measured", "sync": "not measured", "offset_ms": None,
                "note": "the cue sits outside the film or at its edge"}
    r, p = R[j0:j1], P[j0:j1]
    band = cue["band"]
    if band is None:  # no file: the octaves where the render rises over the premix
        band = _dominant_band(np, np.maximum(_octave_powers(np, r[i0 - j0:i1 - j0]) - _octave_powers(np, p[i0 - j0:i1 - j0]), 0))
    if band is None:
        return {**row, "band_hz": None, "lift_db": 0.0, "rel_db": None, "level_dbfs": None, "status": "missing",
                "sync": "not measured", "offset_ms": None}
    k0, k1 = (i0 - j0) // hop, (i1 - j0) // hop
    er, ep = _band_env(np, r, band[0], band[1], hop)[k0:k1], _band_env(np, p, band[0], band[1], hop)[k0:k1]
    w = int(round(SFX_BODY_S / SFX_HOP_S))
    sr_, sp_ = np.convolve(er, np.ones(w), "valid"), np.convolve(ep, np.ones(w), "valid")
    lifts = 10 * np.log10((sr_ + 1e-20) / (sp_ + 1e-20))
    j = int(np.argmax(lifts))
    lift = float(lifts[j])
    s_body = max(float(sr_[j] - sp_[j]), 0.0)
    rel = 80.0 if sp_[j] <= 1e-18 else (-80.0 if s_body <= 0 else 10 * math.log10(s_body / float(sp_[j])))
    S = np.maximum(er - ep, 0.0)
    level = 10 * math.log10(max(float(S.max()), 1e-12))
    if level < SFX_FLOOR_DBFS or lift < SFX_MISSING_DB:
        status = "missing"
    elif rel < SFX_REL_FAIL_DB:
        status = "masked"
    elif lift < SFX_LIFT_DB:
        status = "weak"
    else:
        status = "audible"
    row.update({"band_hz": [round(band[0]), round(band[1])], "lift_db": _r(lift, 1), "rel_db": _r(max(-80.0, min(80.0, rel)), 1),
                "level_dbfs": _r(level, 1), "status": status, "sync": "not measured", "offset_ms": None})
    k = _attack(np, S) if status in ("audible", "weak") else None
    if k is not None:
        sync_t = (j0 + (k0 + k) * hop) / AUDIT_SR
        if cue["onset"] is not None:
            sync_t += cue["sync"] - cue["onset"]
        off = sync_t - t
        tol = min(2.0 / max(fps, 1.0), 0.040)
        row.update({"sync_t": _r(sync_t, 3), "offset_ms": _r(off * 1000, 0),
                    "sync": "late" if off > SFX_LATE_S else ("early" if off < -tol else "on time")})
    return row


def _premix_from_master(master_json: Path | None) -> Path | None:
    if not master_json or not master_json.is_file():
        return None
    try:
        f = (json.loads(master_json.read_text(encoding="utf-8")).get("no_sfx_premix") or {}).get("file")
    except (OSError, json.JSONDecodeError, AttributeError):
        return None
    return Path(f) if f and Path(f).is_file() else None


def audit_sfx_cues(np, mono, premix: Path | None, cues: dict, sfx: list[dict], fps: float, film_s: float) -> dict:
    """A14: per cue, presence and audibility against the no-SFX premix, and sync against the event frame."""
    src = ("the ice-audio skill, references/sfx.md section 6 (in-band lift at least 3 dB; more than 6 dB under the ducked "
           "score fails; the level floor) and section 5 item 1 (the sync point); references/cue-map-and-beat-sync.md "
           "section 5 (within 2 frames or 40 ms, never late); which results block: the ice-qa skill, "
           "references/audio-gates.md section 2b")
    thr = {"lift_db_min": SFX_LIFT_DB, "under_ducked_score_fail_db": SFX_REL_FAIL_DB, "level_floor_dbfs": SFX_FLOOR_DBFS,
           "masked_share_max": 0.5, "early_ms_max": round(min(2.0 / max(fps, 1.0), 0.040) * 1000),
           "late_ms_max": round(SFX_LATE_S * 1000), "hero_blocks": "not heard (masked or missing) or late"}
    cl = sfx_cue_list(np, cues, sfx)
    name = "Effects heard and in sync"
    if not cl:
        return _check(name, None, thr, src, None, False, ["no effect cue (cue sheet sounding events, --sfx)"])
    heroes = [c for c in cl if c["hero"]]
    how = ("render the premix with master_audio.py --no-sfx-premix <file> (or the engine's render with the SFX layer "
           "muted) and pass --premix <file>")
    P = decode_audio(premix) if premix and premix.is_file() else None
    problem = None
    if P is None:
        problem = f"not measured: no premix; {how}"
    else:
        P = P.astype(np.float64).mean(axis=1)
        if abs(len(P) - len(mono)) > int(0.5 * AUDIT_SR):
            problem = f"the premix lasts {len(P) / AUDIT_SR:.2f} s against the render's {len(mono) / AUDIT_SR:.2f} s: {how}"
        else:
            P = np.concatenate([P, np.zeros(max(0, len(mono) - len(P)))])[: len(mono)]
            n = int(0.1 * AUDIT_SR)
            fr, fp = _db(np, (_frames(mono, n) ** 2).mean(axis=1)), _db(np, (_frames(P, n) ** 2).mean(axis=1))
            away = np.ones(len(fr), dtype=bool)
            for c in cl:
                for tt in (c["t"], c["planned"] if c["planned"] is not None else c["t"]):
                    away[max(0, int((tt - 0.75) / 0.1)): int((tt + 1.5) / 0.1) + 1] = False
            sel = away & (fr > -60) & (fp > -60)
            if sel.sum() >= 5 and abs(float(np.median(fr[sel] - fp[sel]))) > PREMIX_MATCH_DB:
                problem = (f"the premix does not match the render ({float(np.median(fr[sel] - fp[sel])):+.1f} dB away from "
                           f"the cues): render both from the same master_audio.py run")
    if problem:
        if heroes:
            return _check(name, None, thr, src, None, True, [problem + f"; {len(heroes)} hero cue(s) cannot be verified"],
                          status="unmeasured")
        return _check(name, None, thr, src, None, False, [problem], status="not run")
    rows = [measure_cue(np, mono, P, c, fps, film_s) for c in cl]
    measured = [r for r in rows if r["status"] != "not measured"]
    masked = [r for r in measured if r["status"] in ("masked", "missing")]
    findings, hard, ear = [], False, []
    for r in measured:
        who = f"{'hero cue' if r['hero'] else 'cue'} \"{r['label']}\" at {_fmt(r['t'])}"
        if r["status"] in ("masked", "missing"):
            what = (f"is not heard: lift {r['lift_db']} dB"
                    + ("" if not r.get("band_hz") else f" in {r['band_hz'][0]} to {r['band_hz'][1]} Hz")
                    + ("" if r["rel_db"] is None else f", {r['rel_db']} dB against the mix without effects")
                    + ("" if r["level_dbfs"] is None else f", own level {r['level_dbfs']} dBFS"))
            findings.append(f"{who} {what}" + (" (blocks)" if r["hero"] else ""))
            hard = hard or r["hero"]
        elif r["status"] == "weak":
            findings.append(f"{who} lifts its band only {r['lift_db']} dB (under {SFX_LIFT_DB:g}: {NO_EAR})")
        if r["sync"] == "late":
            findings.append(f"{who} lands {r['offset_ms']:+.0f} ms after its frame" + (" (blocks)" if r["hero"] else ""))
            hard = hard or r["hero"]
        elif r["sync"] == "early":
            findings.append(f"{who} lands {abs(r['offset_ms']):.0f} ms before its frame (over {thr['early_ms_max']} ms)")
    share = len(masked) / len(measured) if measured else 0.0
    if share > 0.5:
        hard = True
        findings.append(f"{len(masked)} of {len(measured)} cues are not heard (more than half: blocks)")
    weak = sorted((r for r in measured if r["status"] == "weak"), key=lambda r: r["lift_db"])
    if weak:
        r = weak[0]
        ear.append(_ear(r["t"] - 1, r["t"] + 1, f"Can you hear the {r['label']} at {_fmt(r['t'])} clearly over the music?",
                        f"It lifts its band only {r['lift_db']} dB over the mix without effects (A14, under {SFX_LIFT_DB:g} dB); "
                        "whether it reads depends on the sound and the ear", "Raise the cue's own gain first, at most "
                        "+8 dB (sfx.md section 6), or carve the bed in its band", "A14", 6, 0.6 if r["hero"] else 0.5,
                        f"A14: lift {r['lift_db']} dB"))
    gray = [r for r in measured if r["offset_ms"] is not None and 40 <= abs(r["offset_ms"]) <= 300
            and not (r["hero"] and r["sync"] == "late")]
    if gray:
        r = max(gray, key=lambda r: abs(r["offset_ms"]))
        off = r["offset_ms"] / 1000
        ear.append(_ear(r["t"] - 1, r["t"] + 1, f"Does the sound at {_fmt(r['t'])} land with its picture, not "
                        f"{'late' if off > 0 else 'early'}?", f"Its sync point measures {off * 1000:+.0f} ms from the frame "
                        "(A14), inside the 40 to 300 ms zone where perception varies with the material",
                        f"Move the sound {'earlier' if off > 0 else 'later'} by about {abs(off) * 1000:.0f} ms", "A14", 3,
                        0.5 + min(0.2, abs(off)), f"A14: offset {off * 1000:+.0f} ms"))
    value = {"premix": str(premix), "cues_measured": len(measured), "not_heard": len(masked),
             "not_heard_share": _r(share, 3), "cues": rows}
    c = _check(name, value, thr, src, not findings, hard, findings)
    c["ear"] = ear
    return c


# -- A17 the longest repeated pattern ------------------------------------

REPEAT_WINDOW_S = 15.0
REPEAT_PERIODICITY = 0.5   # onset-flux autocorrelation at 0.3 to 2 s lags: a steady pulse, else a sustained sound
REPEAT_CHANGE_DB = 1.5     # level and band change between 2 s blocks at or under this: nothing moving (provisional)


def audit_repeat(np, src, film_s: float, measured_on: str) -> dict:
    """A17: the stretch where one pattern repeats with the least change; it always gives the human ear item its range."""
    doc = (f"{MM} section 3, the comfortable mix item 2 (a thump, kick, hit or drone unchanged for more than about 8 bars "
           "or 15 s with nothing moving); fatigue is judged by ear, this check places the ear-list item; never blocks")
    thr = {"window_s": REPEAT_WINDOW_S, "change_db_max": REPEAT_CHANGE_DB, "pulse_periodicity": REPEAT_PERIODICITY,
           "provisional": True}
    name = "Repeated pattern"
    if src is None or film_s < REPEAT_WINDOW_S:
        return _check(name, None, thr, doc, None, False, ["the film is under 15 s" if src is not None else
                                                          "no music or effects stem"])
    src = np.asarray(src, dtype=np.float64)
    h = int(0.02 * AUDIT_SR)
    env = _db(np, (_frames(src, h) ** 2).mean(axis=1))
    if not len(env) or float(env.max()) < -60:
        return _check(name, None, thr, doc, None, False, ["no music or effects sound"])
    flux = np.maximum(0, np.diff(env, prepend=env[:1]))
    # octave levels 63 Hz to 8 kHz per 2 s block, the median of its 100 ms frames: a sustained change of the
    # arrangement moves it, a one-shot hit does not
    n = int(0.1 * AUDIT_SR)
    F = _frames(src, n)
    pw = np.abs(np.fft.rfft(F * np.hanning(n), axis=1)) ** 2 if len(F) else np.zeros((0, n // 2 + 1))
    f = np.fft.rfftfreq(n, 1.0 / AUDIT_SR)
    oct_ = np.stack([pw[:, (f >= c / 2 ** 0.5) & (f < c * 2 ** 0.5)].sum(axis=1) for c in OCTAVES[1:9]], axis=1)
    nb = len(oct_) // 20
    bands = np.median(oct_[: nb * 20].reshape(nb, 20, 8), axis=1) if nb else np.zeros((0, 8))
    bdb = np.maximum(10 * np.log10(np.maximum(bands, 1e-12)), -120.0)
    win, step = int(REPEAT_WINDOW_S / 0.02), 50
    scores = []
    for s in range(0, max(1, len(flux) - win + 1), step):
        x = flux[s:s + win] - flux[s:s + win].mean()
        ac = np.fft.irfft(np.abs(np.fft.rfft(x, 2 * len(x))) ** 2)[: len(x)]
        per = float(ac[15:100].max() / ac[0]) if ac[0] > 0 else 0.0
        blocks = [float(env[s + i: s + i + 100].mean()) for i in range(0, win - 99, 100)]
        change = float(np.mean(np.abs(np.diff(blocks)))) if len(blocks) > 1 else 0.0
        sub = bdb[s // 100: min(len(bdb), (s + win) // 100)]
        spec = 0.0
        if len(sub) > 1:
            live = sub.max(axis=0) > float(sub.max()) - 30  # the bands that carry the sound in this window
            spec = float(np.mean(np.abs(np.diff(sub[:, live], axis=0)))) if live.any() else 0.0
        scores.append(((0.5 + 0.5 * min(1.0, max(0.0, per))) * max(0.0, 1 - max(change, spec) / 6), s, per, change, spec))
    k = max(range(len(scores)), key=lambda j: scores[j][0])
    top, lo, hi = scores[k], k, k
    while lo > 0 and scores[lo - 1][0] >= 0.8 * top[0] > 0:
        lo -= 1
    while hi < len(scores) - 1 and scores[hi + 1][0] >= 0.8 * top[0] > 0:
        hi += 1
    t0, t1 = scores[lo][1] * 0.02, min(film_s, scores[hi][1] * 0.02 + REPEAT_WINDOW_S)
    _, _, per, change, spec = top
    unchanged = max(change, spec) <= REPEAT_CHANGE_DB and t1 - t0 >= REPEAT_WINDOW_S
    kind = "a steady pulse" if per >= REPEAT_PERIODICITY else "a sustained sound"
    value = {"start": _r(t0), "end": _r(t1), "seconds": _r(t1 - t0, 1), "kind": kind, "periodicity": _r(per, 3),
             "level_change_db": _r(change), "band_change_db": _r(spec), "score": _r(top[0], 3), "measured_on": measured_on}
    findings = [f"{kind} runs unchanged for {t1 - t0:.0f} s ({_fmt(t0)}-{_fmt(t1)}; periodicity {per:.2f}, "
                f"level change {change:.1f} dB, band change {spec:.1f} dB: {NO_EAR})"] if unchanged else []
    c = _check(name, value, thr, doc, not findings, False, findings)
    c["ear"] = [_ear(t0, t1, "Does this stretch tire you (one sound repeating on a steady beat)?",
                     f"Listening fatigue has no measure; this is the longest stretch where one pattern repeats with the "
                     f"least change (A17: periodicity {per:.2f}, level change {change:.1f} dB, band change {spec:.1f} dB, "
                     f"{measured_on})", "Another section or track, a gentler duck release or fewer effects "
                     "(mix-and-master.md section 3)", "A17", 4, 0.6 if unchanged else 0.45,
                     f"A17: {t1 - t0:.0f} s, score {top[0]:.2f}")]
    return c


# -- the ear list --------------------------------------------------------

HERO = re.compile(r"reveal|payoff|hero|signature|drop|logo|slam|impact|cta|end card|endcard|button", re.I)
LONG = re.compile(r"riser|swell|typing|texture|drone|rumble|build", re.I)


def _short_term(np, mono, block=0.4):
    n = int(block * AUDIT_SR)
    return _db(np, (_frames(mono.astype(np.float64), n) ** 2).mean(axis=1))


def ear_candidates(np, mono, cues: dict, film_s: float, sync_measured: bool = False) -> list[dict]:
    """The always-available sources of the ear list: hero moment, worst sync (when A14 did not measure the cues),
    8 s excerpt, long sounds, plus fallbacks (opening, ending, phone speaker) so every film with sound gets at least
    5 items. The repeat stretch is A17's item (audit_repeat)."""
    out = []
    st = _short_term(np, mono)
    loud_t = float(np.argmax(st)) * 0.4 if len(st) else 0.0
    # 2. the hero moment: the reveal or payoff hit, else the first sound after a declared silence, else the loudest moment
    hero = [e for e in cues["events"] if HERO.search(" ".join((e["kind"], e["what"], e["sound"])))]
    if hero:
        t, what = hero[0]["t"], hero[0]["what"] or hero[0]["kind"]
        out.append(_ear(t - 1.5, t + 2.5, f"Does the {what or 'hero moment'} at {_fmt(t)} land: clear, on time, not buried?",
                        "Whether a moment lands is felt; the arc check measures loudness only", "Raise the hit or clear "
                        "the bed under it; move it earlier if it feels late", "hero", 2, 0.6, "cue sheet hero event"))
    elif cues["quiet"]:
        t = cues["quiet"][0][1]
        out.append(_ear(t - 1.5, t + 2.5, f"Does the first sound after the silence at {_fmt(t)} land?",
                        "A designed silence works only if the return is felt", "Shape the return (level, attack) or "
                        "lengthen the silence", "hero", 2, 0.6, "first sound after a declared quiet window"))
    else:
        out.append(_ear(loud_t - 1.5, loud_t + 2.5, f"Does the loudest moment at {_fmt(loud_t)} land, without strain?",
                        "No hero event is named in the cue sheet; this is the loudest 0.4 s by measurement",
                        "Lower the peak or move it to the moment that matters", "hero", 2, 0.55, "loudest short-term block"))
    # 3. the worst sync: a sounding cue whose onset lands 40 to 300 ms off its frame (A14 gives it when it measured)
    hop = int(0.005 * AUDIT_SR)
    e5 = _db(np, (_frames(mono.astype(np.float64), hop) ** 2).mean(axis=1))
    worst = None
    for ev in [] if sync_measured else cues["events"]:
        if not ev["sound"]:
            continue
        k0, k1 = int((ev["t"] - 0.1) / 0.005), int((ev["t"] + 0.3) / 0.005)
        best, bk = 0.0, None
        for k in range(max(10, k0), min(len(e5), k1)):
            s = float(e5[k] - np.median(e5[k - 10:k]))
            if s > best:
                best, bk = s, k
        if bk is None or best < 6:
            continue
        off = bk * 0.005 - ev["t"]
        if 0.04 <= abs(off) <= 0.3 and (worst is None or abs(off) > abs(worst[1])):
            worst = (ev, off)
    if worst:
        ev, off = worst
        out.append(_ear(ev["t"] - 1, ev["t"] + 1, f"Does the sound at {_fmt(ev['t'])} land with its picture, not "
                        f"{'late' if off > 0 else 'early'}?", f"Its onset measures {off * 1000:+.0f} ms from the frame, "
                        "inside the 40 to 300 ms zone where perception varies with the material",
                        f"Move the sound {'earlier' if off > 0 else 'later'} by about {abs(off) * 1000:.0f} ms", "sync", 3,
                        0.5 + min(0.2, abs(off)), f"onset offset {off * 1000:+.0f} ms"))
    # 4. the longest repeated pulse: A17 (audit_repeat)
    # 5. the 8 s excerpt with the largest energy and colour change
    if film_s > 0:
        blk = int(0.5 * AUDIT_SR)
        B = _frames(mono.astype(np.float64), blk)
        if len(B) >= 2:
            lv = _db(np, (B ** 2).mean(axis=1))
            p = np.abs(np.fft.rfft(B * np.hanning(blk), axis=1)) ** 2
            f = np.fft.rfftfreq(blk, 1.0 / AUDIT_SR)
            cen = (p * f).sum(axis=1) / np.maximum(p.sum(axis=1), 1e-20)
            wlen = min(16, len(B))
            best, bs = -1.0, 0
            for s in range(0, len(B) - wlen + 1):
                h = wlen // 2
                ch = abs(float(lv[s + h:s + wlen].mean() - lv[s:s + h].mean())) + \
                    abs(float(cen[s + h:s + wlen].mean() - cen[s:s + h].mean())) / 500
                if ch > best:
                    best, bs = ch, s
            out.append(_ear(bs * 0.5, (bs + wlen) * 0.5, "Listen to this excerpt once without watching: does its feeling "
                            "fit the story at this point?", "The meaning of music is not measurable; this is the 8 s with "
                            "the largest energy and colour change", "Swap the track or the section (the alternatives of the "
                            "options flow)", "excerpt", 5, 0.4, f"change score {best:.1f}"))
    # 6. long sounds named by the cue sheet
    for ev in cues["events"]:
        if LONG.search(" ".join((ev["kind"], ev["what"], ev["sound"]))):
            out.append(_ear(ev["t"] - 2, ev["t"] + 1, f"Does the {ev['sound'] or ev['kind']} at {_fmt(ev['t'])} sit right, "
                            "neither too long nor covering a word?", "Long sounds are judged in context; the level "
                            "only says it is present", "Shorten or lower it (sfx.md section 6)", "long", 6, 0.45,
                            f"cue sheet {ev['kind']}"))
            break
    # 8. fallbacks: the ending, the opening, the phone speaker
    end = film_s
    out.append(_ear(max(0, end - 4), end, "Does the sound end with the picture: nothing cut, no dead air?",
                    "The ending is measured for holes and cuts; whether it resolves is heard", "Back-time the music or "
                    "move the last sound (music-choice-and-licensing.md section 4)", "ending", 8, 0.3, "last 4 s"))
    out.append(_ear(0, min(3, end), "Does the opening start at the right level: no click, nothing faded that should hit?",
                    "A cold open is a choice in the cue sheet; the ear confirms it", "Remove an unasked fade or add a "
                    "4 to 5 ms ramp (mix-and-master.md section 4)", "opening", 8, 0.28, "first 3 s"))
    out.append(_ear(loud_t - 2, loud_t + 2, "On a phone speaker, does the loudest moment still sound full, not thin "
                    "or distorted?", "Phone translation of the low end is heard; a 200 Hz high-pass only simulates it",
                    "Give the low parts harmonics above 500 Hz (mix-and-master.md section 2)", "phone", 8, 0.26,
                    "loudest short-term block"))
    for c in out:
        c["start"] = _r(max(0.0, min(c["start"], end)))
        c["end"] = _r(max(c["start"], min(c["end"], end)))
        c["time"] = f"{_fmt(c['start'])}-{_fmt(c['end'])}"
    return out


def select_ear_items(cands: list[dict]) -> list[dict]:
    order = sorted(cands, key=lambda c: (c["group"], -(c.get("risk") or 0)))
    taken, count = [], {}
    for c in order:
        if len(taken) >= EAR_MAX:
            break
        g = c["group"]
        if count.get(g, 0) < EAR_CAPS.get(g, 1):
            taken.append(c)
            count[g] = count.get(g, 0) + 1
    for c in order:
        if len(taken) >= EAR_MIN:
            break
        if c not in taken:
            taken.append(c)
    taken = sorted(taken, key=lambda c: -(c.get("risk") or 0))
    return [{**c, "n": i} for i, c in enumerate(taken, 1)]


def ear_block(items: list[dict], status: str) -> str:
    secs = sum(max(0.0, (c["end"] or 0) - (c["start"] or 0)) + 5 for c in items) * 2
    cell = lambda s: str(s).replace("|", "/").replace("\n", " ")  # noqa: E731
    lines = [f"## For your ears (about {max(1, math.ceil(secs / 60))} minutes; headphones, then a phone speaker; listen "
             "once without watching)",
             "| # | Time | Listen for | Answer | Why a machine could not settle it | If \"no\" |",
             "|---|---|---|---|---|---|"]
    for c in items:
        lines.append(f"| {c['n']} | {c['time']} | {cell(c['question'])} | {cell(c.get('answer') or 'yes / no')} | "
                     f"{cell(c['why_not_machine'])} | {cell(c['fix_if_no'])} |")
    lines.append(f"Status: {status} (until answered; answers are logged with `ice-state.mjs log`)")
    return "\n".join(lines)


def write_ear_list(path: Path, own: list[dict], render: Path) -> dict:
    """Merge this run's candidates with the word items align_script_to_asr.py --stem wrote (source A5)."""
    old = {}
    if path.is_file():
        try:
            old = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            old = {}
    kept = [c for c in old.get("candidates") or [] if c.get("source") == "A5"]
    cands = own + kept
    items = select_ear_items(cands)
    data = {"generated_by": sorted({"qc.py --audit", *(old.get("generated_by") or [])}),
            "date": datetime.date.today().isoformat(), "render": str(render),
            "status": "not listened by a human", "items": items, "candidates": cands}
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    return data


# -- presence of each sound code (read by the craft gate) -------------------

PRESENCE_STEMS = {"music": ("music", "score", "bed", "track", "song", "mx"),
                  "ambience": ("ambience", "ambiance", "amb", "ambient", "room", "roomtone", "atmos", "atmosphere"),
                  "foley": ("foley",)}
PRESENCE_CUES = {"sfx": None, "ambience": re.compile(r"ambien|room tone|roomtone|atmos", re.I),
                 "foley": re.compile(r"foley", re.I)}


def sound_presence(np, stems: dict | None, dec: dict, voice_info: dict | None, cues: dict, sfx: list[dict],
                   sfx_track, checks: dict, no_speech: bool, master_json: Path | None) -> tuple[dict, dict]:
    """Measured or cued presence of music, voice, sfx, ambience, foley and a verified designed silence.

    A stem counts when its loudest 0.4 s reaches -60 dBFS; the cue sheet, the SFX list and master.json count as cued."""
    def active(a) -> bool:
        if a is None or not len(a):
            return False
        return bool(_short_term(np, a.astype(np.float64).mean(axis=1)).max() > -60) if len(a) >= int(0.4 * AUDIT_SR) else False

    pres = {k: False for k in ("music", "voice", "sfx", "ambience", "foley", "silence")}
    how = {k: "not found" for k in pres}
    for p in (stems or {}).get("bed", []):
        first = re.split(r"[^a-z0-9]+", p.stem.lower())[0]
        for code, names in PRESENCE_STEMS.items():
            if first in names and active(dec.get(p)):
                pres[code], how[code] = True, f"stem {p.name}"
    if not no_speech:
        if voice_info is not None and voice_info["voiced"].any():
            pres["voice"], how["voice"] = True, "voice stem (voiced windows)"
        elif cues["voice"]:
            pres["voice"], how["voice"] = True, "cue sheet voice lines"
    a14 = (checks.get("A14") or {}).get("value") or {}
    if a14.get("cues_measured"):  # measured in the mix: present only when at least one cue is heard
        heard = [c for c in a14.get("cues") or [] if c.get("status") in ("audible", "weak")]
        pres["sfx"], how["sfx"] = bool(heard), f"A14: {len(heard)} of {a14['cues_measured']} cue(s) heard in the mix"
    elif sfx_track is not None and len(sfx_track) and float(np.abs(sfx_track).max()) > 0.001:
        pres["sfx"], how["sfx"] = True, "effects stem or SFX list"
    elif sfx or any(e["sound"] for e in cues["events"]):
        pres["sfx"], how["sfx"] = True, "cue sheet sounding events"
    if not pres["music"]:
        mj = None
        if master_json and master_json.is_file():
            try:
                mj = json.loads(master_json.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError):
                mj = None
        if mj and mj.get("music_edges"):
            pres["music"], how["music"] = True, "master.json music_edges"
        elif cues["music"]:
            pres["music"], how["music"] = True, "cue sheet music"
    for code in ("ambience", "foley"):
        if not pres[code] and any(PRESENCE_CUES[code].search(" ".join((e["kind"], e["what"], e["sound"]))) for e in cues["events"]):
            pres[code], how[code] = True, "cue sheet events"
    quiet = ((checks.get("A12") or {}).get("value") or {}).get("quiet") or []
    ok = [q for q in quiet if q.get("checked") and (q.get("dip_db") or 0) >= QUIET_DIP_DB]
    if ok:
        pres["silence"], how["silence"] = True, f"{len(ok)} declared quiet window(s) verified (A12)"
    return pres, how


# -- intake diagnosis of a recorded voice (--diagnose) ---------------------

def run_diagnose(args) -> int:
    """Symptoms of a recorded voice or footage track that switch on the cleanup table of voiceover.md section 7."""
    np = _numpy()
    project = Path(args.project).resolve()
    src = Path(args.diagnose)
    src = src if src.is_absolute() else project / src
    x = decode_audio(src) if src.is_file() else None
    if x is None:
        print(f"Error: no readable audio in {src}", file=sys.stderr)
        return 2
    mono = x.astype(np.float64).mean(axis=1)
    n = int(0.05 * AUDIT_SR)
    F = _frames(mono, n)
    if len(F) < 20:
        print("Error: the source is shorter than 1 s.", file=sys.stderr)
        return 2
    lv = np.maximum(_db(np, (F ** 2).mean(axis=1)), -120.0)
    live = lv > -90
    floor = float(np.percentile(lv, 10))  # pauses of digital silence count: they are a clean floor
    top = float(np.percentile(lv[live], 90)) if live.any() else -120.0
    speech = live & (lv >= top - 20)
    pause = lv <= floor + 6
    w = np.hanning(n)
    P = np.abs(np.fft.rfft(F * w, axis=1)) ** 2
    f = np.fft.rfftfreq(n, 1.0 / AUDIT_SR)
    band = lambda rows, lo, hi: _db(np, P[rows][:, (f >= lo) & (f < hi)].sum(axis=1))  # noqa: E731
    # hum: the quietest 1 s frames (speech hides the mains line), the line and its harmonics against their neighbourhood
    H = _frames(mono, AUDIT_SR)
    hum = {"frequency": None, "prominence_db": 0.0}
    if len(H):
        hl = (H ** 2).mean(axis=1)
        H = H[hl <= np.percentile(hl, 30)] if len(H) > 2 else H
        ph = (np.abs(np.fft.rfft(H * np.hanning(AUDIT_SR), axis=1)) ** 2).mean(axis=0)
        for f0 in (50, 60):
            prom = []
            for h in (1, 2, 3):
                c = f0 * h
                near = np.concatenate([ph[c - 12: c - 2], ph[c + 3: c + 13]])
                prom.append(10 * math.log10(max(float(ph[c - 1: c + 2].max()), 1e-20) / max(float(np.median(near)), 1e-20)))
            if max(prom) > hum["prominence_db"]:
                hum = {"frequency": f0, "prominence_db": _r(max(prom))}
    rows = np.where(speech)[0]
    boom = sib = None
    if len(rows):  # octave bands: 125 Hz (boom and proximity) against 1 kHz; the loudest sibilants against the presence band
        boom = float(np.median(band(rows, 88, 177) - band(rows, 707, 1414)))
        sib = float(np.percentile(band(rows, 5000, 9000), 99) - np.median(band(rows, 1000, 4000)))
    quiet_rows = np.where(live & (lv <= np.percentile(lv[live], 20)))[0] if live.any() else rows
    flat = None
    if len(quiet_rows):
        q = P[quiet_rows][:, (f >= 100) & (f < 8000)] + 1e-20
        flat = float(np.mean(np.exp(np.log(q).mean(axis=1)) / q.mean(axis=1)))
    music = flat is not None and flat < 0.1 and top - floor < 30
    clips = audit_clipping(np, {src.name: x})["value"][src.name]
    symptoms = {
        "noise_floor": {"value_dbfs": _r(floor), "threshold_dbfs": -55.0, "candidate": floor > -55.0,
                        "fix": "Light denoise (voiceover.md section 7, Broadcast voice chain item 1; Audible hiss row)"},
        "hum": {"value": hum, "threshold_db": 10.0, "candidate": hum["prominence_db"] > 10.0,
                "fix": "High-pass about 80 Hz; a notch at the mains line and its harmonics (Hum or rumble row)"},
        "boom": {"value_db": _r(boom), "threshold_db": 4.0, "candidate": boom is not None and boom > 4.0,
                 "fix": "-4 dB at 200 Hz, Q 1.4 (Boomy row)"},
        "sibilance": {"value_db": _r(sib), "threshold_db": 6.0, "candidate": sib is not None and sib > 6.0,
                      "note": "provisional threshold: the loudest 5 to 9 kHz frames against the median 1 to 4 kHz level",
                      "fix": "Narrow cut swept 5 to 9 kHz, -3 to -5 dB, or a de-esser (Sibilant row)"},
        "clipping": {"runs": clips, "candidate": clips > 0, "fix": "Needs a better source; say so (Audible hiss row: honest fallback)"},
        "music_under_speech": {"pause_flatness": _r(flat, 3), "speech_over_floor_db": _r(top - floor), "candidate": music,
                               "fix": "Separate the voice first (demucs, versions.json pip.demucs, --two-stems vocals), then clean the voice stem"},
    }
    out = {"tool": "qc.py --diagnose", "date": datetime.date.today().isoformat(), "source": str(src),
           "speech_frames": int(speech.sum()), "pause_frames": int(pause.sum()), "symptoms": symptoms,
           "candidates": [k for k, v in symptoms.items() if v["candidate"]]}
    dest = project / "ice" / "audio" / "voice-diagnosis.json"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    if args.json:
        print(json.dumps(out, ensure_ascii=False, indent=1))
    else:
        print(f"Voice diagnosis: {src.name} (written to {dest})")
        for k, v in symptoms.items():
            print(f"  {k}: {'CANDIDATE' if v['candidate'] else 'clean'}" + (f": {v['fix']}" if v["candidate"] else ""))
    return 0


# -- driver --------------------------------------------------------------

def run_audit(args) -> int:
    np = _numpy()
    project = Path(args.project).resolve()
    if not args.render:
        print("Error: --audit needs --render.", file=sys.stderr)
        return 2
    if args.profile not in PROFILES:
        print(f"Error: --audit needs --profile, one of: {', '.join(PROFILES)}.", file=sys.stderr)
        return 2
    prof = PROFILES[args.profile]
    if prof["i"] is None and (args.target_lufs is None or args.true_peak is None):
        print("Error: the reference profile needs --target-lufs and --true-peak (the reference's measured values).",
              file=sys.stderr)
        return 2
    rel = lambda p: None if not p else (Path(p) if Path(p).is_absolute() else project / p)  # noqa: E731
    render = rel(args.render)
    if not render.is_file():
        print(f"Error: render not found: {render}", file=sys.stderr)
        return 2
    try:
        cues = load_cue_events(rel(args.cue_sheet))
        sfx = load_sfx_list(rel(args.sfx))
    except (OSError, ValueError, TypeError, json.JSONDecodeError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 2
    x = decode_audio(render)
    if x is None:
        print(f"Error: {render.name} has no readable audio stream.", file=sys.stderr)
        return 2
    mono = x.astype(np.float64).mean(axis=1)
    checks, ear = {}, []

    c, loud = audit_loudness(render, prof, args.target_lufs, args.true_peak)
    checks["A1"] = c
    if c.get("ear"):
        ear.append(_ear(0, min(8.0, len(mono) / AUDIT_SR), "Does the mix breathe: quiet and loud moments, not one flat "
                        "wall?", "; ".join(c["ear"]) + " (A1); a calm film can be flat on purpose", "Bring back the "
                        "designed dips (mix-and-master.md section 4) or use a gentler limiter", "A1", 8, 0.32, "A1 LRA floor"))

    # stems or separation
    stems, work, notes = None, None, []
    voice = bed = sfx_track = None
    stem_tracks, dec = {}, {}
    if args.stems:
        folder = rel(args.stems)
        if not folder.is_dir():
            print(f"Error: stems folder not found: {folder}", file=sys.stderr)
            return 2
        stems = load_stems(folder)
        dec = {p: decode_audio(p) for k in ("voice", "bed", "sfx") for p in stems[k]}
        stem_tracks = {p.name: a for p, a in dec.items() if a is not None}
        vs = _sum_tracks(np, [dec[p] for p in stems["voice"]])
        bs = _sum_tracks(np, [dec[p] for p in stems["bed"] + stems["sfx"]])
        ss = _sum_tracks(np, [dec[p] for p in stems["sfx"]])
        voice = None if vs is None else vs.mean(axis=1)
        bed = None if bs is None else bs.mean(axis=1)
        sfx_track = None if ss is None else ss.mean(axis=1)
    elif args.separate and not args.no_speech:
        work = Path(tempfile.mkdtemp(prefix="ice-qc-"))
        sep = separate_with_demucs(render, work)
        if sep:
            va, ba = decode_audio(sep[0]), decode_audio(sep[1])
            voice = None if va is None else va.astype(np.float64).mean(axis=1)
            bed = None if ba is None else ba.astype(np.float64).mean(axis=1)
            notes.append("voice and bed separated from the render with demucs (htdemucs)")
    if sfx_track is None and sfx:
        n = len(mono)
        tr = np.zeros(n)
        for it in sfx:
            a = decode_audio(it["file"]) if it["file"].exists() else None
            if a is None:
                continue
            a = a.astype(np.float64).mean(axis=1) * 10 ** (it["gain_db"] / 20)
            s = int(round(it["at"] * AUDIT_SR))
            if s < 0:
                a, s = a[-s:], 0
            m = max(0, min(len(a), n - s))
            tr[s:s + m] += a[:m]
        sfx_track = tr

    # A3 voice over bed
    band = BED_BAND_DB["news-reel" if args.profile == "news-reel" else "default"]
    if args.bed_band:
        try:
            lo, hi = (float(v) for v in args.bed_band.split(","))
            band = (lo, hi)
        except ValueError:
            print("Error: --bed-band takes two numbers, LOW,HIGH (dB).", file=sys.stderr)
            return 2
    voice_info = None
    a3_src = f"{MM} section 3 (bed under the voice), measured from the stems"
    if args.no_speech:
        checks["A3"] = _check("Voice over bed", None, {}, a3_src, None, False, ["declared: no speech (--no-speech)"])
    elif voice is not None and bed is not None:
        c, voice_info = audit_voice_over_bed(np, voice, bed, band)
        checks["A3"] = c
        ear += c.get("ear", [])
    elif voice is not None:
        c, voice_info = audit_voice_over_bed(np, voice, np.zeros(1), band)
        checks["A3"] = c
    else:
        why = ("no voice stem in --stems" if args.stems else
               "demucs is not installed (versions.json pip.demucs) or the separation failed" if args.separate else
               "no --stems given")
        checks["A3"] = _check("Voice over bed", None, {"bed_band_db": list(band)}, a3_src, None, True,
                              [f"unmeasured: {why}; pass --stems <folder> (the run's stems), or install demucs and add "
                               "--separate, or --no-speech for a film with no spoken word"], status="unmeasured")

    c, wear = read_speech_check(project, args.no_speech)
    checks["A5"] = c
    ear += wear
    c = audit_joins(np, mono, cues, sfx, voice_info)
    checks["A6"] = c
    ear += c.get("ear", [])
    tracks = {render.name: x, **stem_tracks}
    checks["A8"] = audit_clipping(np, tracks)
    checks["A9"] = audit_dc(np, tracks)
    c, sear = audit_stereo(np, x, render, loud)
    checks["A10"] = c
    ear += sear
    c, film_s = audit_stream(render, args.profile)
    checks["A11"] = c
    film_s = film_s or len(mono) / AUDIT_SR
    checks["A12"] = audit_silences(np, mono, cues, args.profile)
    mj = rel(args.master_json) if args.master_json else render.parent / "master.json"
    c, eear = audit_ending(np, render, film_s, mj, voice)
    checks["A13"] = c
    ear += eear
    c, fear = audit_sfx_under_speech(np, sfx_track, voice_info, voice, args.profile)
    checks["A15"] = c
    ear += fear
    c = audit_level_jumps(np, render, cues, sfx, voice_info, voice, film_s)
    checks["A7"] = c
    ear += c.get("ear", [])
    premix = rel(args.premix) if args.premix else _premix_from_master(mj)
    fps = cues["fps"] or (checks["A11"].get("value") or {}).get("fps") or 30.0
    c = audit_sfx_cues(np, mono, premix, cues, sfx, float(fps), film_s)
    checks["A14"] = c
    ear += c.get("ear", [])
    # A17 on the music and effects stems (ambience and room tone left out: steady by design), demucs's no-vocals
    # part, else the render
    if stems:
        rs = _sum_tracks(np, [dec[p] for p in stems["bed"] if re.split(r"[^a-z0-9]+", p.stem.lower())[0]
                              not in PRESENCE_STEMS["ambience"]] + [dec[p] for p in stems["sfx"]])
        rep_src, rep_on = (None if rs is None else rs.mean(axis=1)), "music and effects stems"
    elif bed is not None:
        rep_src, rep_on = bed, "the render without its voice (demucs)"
    else:
        rep_src, rep_on = mono, "the render (no stems: the voice can hide or imitate a repeat)"
    c = audit_repeat(np, rep_src, film_s, rep_on)
    checks["A17"] = c
    ear += c.get("ear", [])
    ear += ear_candidates(np, mono, cues, film_s, sync_measured=bool(((checks["A14"].get("value") or {})
                                                                      .get("cues_measured"))))
    if work:
        shutil.rmtree(work, ignore_errors=True)

    checks = {k: checks[k] for k in sorted(checks, key=lambda k: int(k[1:]))}
    presence, presence_how = sound_presence(np, stems, dec, voice_info, cues, sfx, sfx_track, checks, args.no_speech, mj)
    blocking = [k for k, v in checks.items() if v["blocking"]]
    review = project / "ice" / "review"
    ear_data = write_ear_list(review / "ear-list.json", ear, render)
    audit = {"tool": "qc.py --audit", "date": datetime.date.today().isoformat(), "render": str(render),
             "profile": {"id": args.profile, **prof, "target_override": args.target_lufs, "true_peak_override": args.true_peak},
             "stems": None if not stems else {k: [p.name for p in v] for k, v in stems.items()},
             "presence": presence, "presence_sources": presence_how,
             "notes": notes, "checks": checks, "blocking": blocking, "passed": not blocking,
             "ear_list": str(review / "ear-list.json")}
    (review / "audio-audit.json").write_text(json.dumps(audit, ensure_ascii=False, indent=1, default=str) + "\n",
                                            encoding="utf-8")
    if args.json:
        print(json.dumps({**audit, "ear_items": ear_data["items"]}, ensure_ascii=False, indent=1, default=str))
    else:
        print(f"Audio audit: {render.name} against profile {args.profile} ({prof['row']})")
        for k, v in checks.items():
            word = {"pass": "PASS", "fail": "FAIL", "warn": "WARN", "n/a": "n/a", "unmeasured": "FAIL",
                    "not run": "NOT RUN"}.get(v["status"], v["status"].upper())
            print(f"  {k} {v['name']}: {word}" + ("" if not v["findings"] else ": " + "; ".join(v["findings"]))
                  + "".join(f" (note: {x})" for x in v.get("notes") or []))
        print("BLOCKING: " + (", ".join(blocking) if blocking else "none"))
        print()
        print(ear_block(ear_data["items"], ear_data["status"]))
    return 1 if blocking else 0


# ---- Main --------------------------------------------------------------

def main() -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass
    ap = argparse.ArgumentParser(description="Audio QC: voice line timing, pacing, loudness, render loudness")
    ap.add_argument("--project", default=".", help="Project folder for relative paths (default: current folder)")
    ap.add_argument("--cue-sheet", help="Ice cue sheet JSON with voice lines")
    ap.add_argument("--lines", help="Folder of voice line audio files with same-name .txt files")
    ap.add_argument("--render", help="Exported film to check against the loudness profile")
    ap.add_argument("--target-lufs", type=float, default=None,
                    help=f"Integrated loudness target for the render (default {RENDER_LUFS:.0f}, or the --profile's)")
    ap.add_argument("--true-peak", type=float, default=None,
                    help=f"True peak limit for the render in dBTP (default {RENDER_TRUE_PEAK:.0f}, or the --profile's)")
    ap.add_argument("--profile", choices=list(PROFILES),
                    help="Loudness profile id (mix-and-master.md section 5, gate column); required with --audit")
    ap.add_argument("--profiles", action="store_true", help="Print the profile table as JSON and exit")
    ap.add_argument("--audit", action="store_true",
                    help="Measure and gate the delivered mix (needs --render and --profile; writes ice/review/"
                         "audio-audit.json and ice/review/ear-list.json; exit 1 on a blocking item)")
    ap.add_argument("--stems", help="With --audit: folder of film-length stems (voice*, vo*, dialogue*, ... ; the rest is bed)")
    ap.add_argument("--sfx", help="With --audit: the sfx.json list given to master_audio.py (effect edges and levels)")
    ap.add_argument("--master-json", help="With --audit: master.json of master_audio.py (default: beside the render)")
    ap.add_argument("--premix", help="With --audit: the same mix without the SFX layer (default: master.json "
                                     "no_sfx_premix, written by master_audio.py --no-sfx-premix); A14 measures each cue against it")
    ap.add_argument("--separate", action="store_true",
                    help="With --audit and no stems: split the render with demucs when it is installed")
    ap.add_argument("--no-speech", action="store_true",
                    help="With --audit: the film has no spoken word at all (the voice checks are n/a)")
    ap.add_argument("--bed-band", help="With --audit: LOW,HIGH dB of voice over bed for the film type "
                                        "(mix-and-master.md section 3; default 10,14, news reel 14,31)")
    ap.add_argument("--diagnose", metavar="SOURCE",
                    help="Intake diagnosis of a recorded voice or footage track: noise floor, hum, boom, sibilance, "
                         "clipping, music under speech; writes ice/audio/voice-diagnosis.json (voiceover.md section 7)")
    ap.add_argument("--scene-lufs", type=float, default=SCENE_LUFS,
                    help=f"Target for voice lines when fixing (default {SCENE_LUFS:.0f}, headroom for music)")
    ap.add_argument("--fix", action="store_true",
                    help="Normalise loudness: lines in place (originals in .qc-backup/), render to <name>.loudnorm.mp4")
    ap.add_argument("--skip-loudness", action="store_true", help="Skip the slower per-line loudness pass")
    ap.add_argument("--strict", action="store_true", help="Exit 1 on warnings too")
    ap.add_argument("--json", action="store_true", help="Output JSON for scripting")
    args = ap.parse_args()

    if args.profiles:
        print(json.dumps(PROFILES, indent=1))
        return 0
    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        print("Error: ffmpeg and ffprobe are required on PATH.", file=sys.stderr)
        return 1
    if args.audit:
        return run_audit(args)
    if args.diagnose:
        return run_diagnose(args)
    prof = PROFILES.get(args.profile or "") or {}
    if args.target_lufs is None:
        args.target_lufs = prof.get("i") if prof.get("i") is not None else RENDER_LUFS
    if args.true_peak is None:
        args.true_peak = prof.get("tp") if prof.get("tp") is not None else RENDER_TRUE_PEAK
    if not (args.cue_sheet or args.lines or args.render):
        print("Error: give --cue-sheet, --lines or --render.", file=sys.stderr)
        return 2

    project = Path(args.project).resolve()
    report = Report()
    lines: list[dict] = []
    if args.cue_sheet:
        sheet = Path(args.cue_sheet)
        sheet = sheet if sheet.is_absolute() else project / sheet
        if not sheet.is_file():
            print(f"Error: cue sheet not found: {sheet}", file=sys.stderr)
            return 2
        lines = load_cue_sheet(project, sheet, report)
    elif args.lines:
        folder = Path(args.lines)
        folder = folder if folder.is_absolute() else project / folder
        if not folder.is_dir():
            print(f"Error: lines folder not found: {folder}", file=sys.stderr)
            return 2
        lines = load_lines_dir(folder, report)

    check_timing(lines, report)
    check_pacing(lines, report)
    levels = {} if args.skip_loudness else check_line_loudness(lines, report)
    render_path = None
    if args.render:
        render_path = Path(args.render)
        render_path = render_path if render_path.is_absolute() else project / render_path
    render_m = check_render(render_path, report, args.target_lufs, args.true_peak) if render_path else None

    if args.fix:
        report.data["fixed_lines"] = fix_lines(levels, args.scene_lufs, args.true_peak, report)
        if render_m:
            out = fix_render(render_path, render_m, args.target_lufs, args.true_peak, report)
            report.data["fixed_render"] = str(out) if out else None

    failed = report.count("error") > 0 or (args.strict and report.count("warn") > 0)
    if args.json:
        print(json.dumps({**report.data, "findings": report.findings,
                          "errors": report.count("error"), "warnings": report.count("warn"),
                          "passed": not failed}, indent=2, default=str))
    else:
        print_report(report)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
