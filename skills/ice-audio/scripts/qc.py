#!/usr/bin/env python3
# Adapted from digitalsamba/claude-code-video-toolkit tools/qc.py (MIT, Copyright (c) 2024 Digital Samba). Changes: Remotion and scenes.json project loaders and the sync_timing and win_encoding imports replaced by an engine-agnostic reader of the Ice cue sheet or a folder of voice lines; render target and true peak now set from the chosen loudness profile; ffmpeg runs with stdin closed; ASCII report icons; dash characters replaced.
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
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
import statistics
import subprocess
import sys
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
    ap.add_argument("--target-lufs", type=float, default=RENDER_LUFS,
                    help=f"Integrated loudness target for the render (default {RENDER_LUFS:.0f})")
    ap.add_argument("--true-peak", type=float, default=RENDER_TRUE_PEAK,
                    help=f"True peak limit for the render in dBTP (default {RENDER_TRUE_PEAK:.0f})")
    ap.add_argument("--scene-lufs", type=float, default=SCENE_LUFS,
                    help=f"Target for voice lines when fixing (default {SCENE_LUFS:.0f}, headroom for music)")
    ap.add_argument("--fix", action="store_true",
                    help="Normalise loudness: lines in place (originals in .qc-backup/), render to <name>.loudnorm.mp4")
    ap.add_argument("--skip-loudness", action="store_true", help="Skip the slower per-line loudness pass")
    ap.add_argument("--strict", action="store_true", help="Exit 1 on warnings too")
    ap.add_argument("--json", action="store_true", help="Output JSON for scripting")
    args = ap.parse_args()

    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        print("Error: ffmpeg and ffprobe are required on PATH.", file=sys.stderr)
        return 1
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
