# Adapted from edenfunf/reelmimic (MIT, Copyright (c) 2026 ReelMimic contributors),
# .claude/skills/video-clone/scripts/analyze.py (detect_crop, ui_strip_crop, make_proxy).
# Changes: extracted into a standalone CLI; prints JSON with an ffmpeg crop command; optional --apply
# writes a cropped CFR copy; download and analysis code removed; arrow characters replaced; UTF-8 text
# and process I/O for Windows, ffmpeg runs with stdin closed, the printed command is quoted for the
# current OS, a one-line warning names the pinned packages when the UI-band fallback cannot run.
#
# MIT License text: permission is hereby granted, free of charge, to any person obtaining a copy of this
# software, to deal in the software without restriction, subject to including the copyright notice and
# this permission notice in all copies. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
"""Find the real picture inside a phone screen recording (black bars or static UI bands).

Usage:
    python detect_crop.py <video> [--apply out.mp4] [--fps 30]

Works on Windows, macOS and Linux. Needs ffmpeg and ffprobe on PATH. The UI-band fallback needs
numpy==2.4.6 and opencv-python-headless==4.10.0.84 (requirements.txt next to this file); without them
only the black-bar detection runs, with a warning. Prints JSON: {"crop": {...} or null, "ffmpeg": "<command>"}.
"""
import argparse, collections, json, os, re, shlex, subprocess, sys
from pathlib import Path

REQUIREMENTS = Path(__file__).resolve().parent / "requirements.txt"


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace",
                          stdin=subprocess.DEVNULL)


def shell_command(cmd):
    """The command as one line the user can paste into this OS's shell."""
    return subprocess.list2cmdline(cmd) if os.name == "nt" else shlex.join(cmd)


def probe(path):
    r = run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:format=duration",
             "-of", "json", path])
    if r.returncode:
        sys.exit("ffprobe failed: " + r.stderr[-500:])
    j = json.loads(r.stdout)
    s = j["streams"][0]
    return int(s["width"]), int(s["height"]), float(j["format"]["duration"])


def detect_crop(path, dur, w, h):
    """Most common cropdetect box over the first 60 s; None if the picture already fills the frame."""
    r = run(["ffmpeg", "-hide_banner", "-i", path, "-t", str(min(dur, 60)), "-vf", "fps=2,cropdetect=limit=24:round=2:reset=1",
             "-f", "null", "-"])
    boxes = collections.Counter(re.findall(r"crop=(\d+:\d+:\d+:\d+)", r.stderr))
    if not boxes:
        return None
    cw, ch, cx, cy = map(int, boxes.most_common(1)[0][0].split(":"))
    if cw * ch > .85 * w * h:
        return None
    return {"w": cw, "h": ch, "x": cx, "y": cy, "note": "picture is a strip inside a larger frame (black bars)"}


def ui_strip_crop(path, dur, w, h):
    """Screen recordings can put the picture between busy UI bands that cropdetect cannot see through.
    Find the band of rows whose content changes most over time: that is the playing picture."""
    try:
        import numpy as np, cv2
    except ImportError:
        print("detect_crop.py: UI-band fallback skipped, it needs numpy==2.4.6 and opencv-python-headless==4.10.0.84. "
              "Install them into a project virtual environment (no question needed: ice-engines engine-choice.md section 7.6: free pinned packages install without a question): python -m pip install -r "
              + str(REQUIREMENTS), file=sys.stderr)
        return None
    cap = cv2.VideoCapture(path)
    if not cap.isOpened():
        print("detect_crop.py: UI-band fallback skipped, OpenCV could not open the video "
              "(on Windows, a path with non-ASCII characters can cause this; copy it to an ASCII path).", file=sys.stderr)
        return None
    frames = []
    for k in range(12):
        cap.set(cv2.CAP_PROP_POS_MSEC, (k + .5) / 12 * dur * 1000)
        ok, f = cap.read()
        if ok:
            frames.append(cv2.cvtColor(cv2.resize(f, (w // 4, h // 4)), cv2.COLOR_BGR2GRAY).astype("float32"))
    cap.release()
    if len(frames) < 4:
        return None
    var = np.stack(frames).std(axis=0).mean(axis=1)  # temporal change per row
    rows = np.where(var > max(6.0, var.max() * .35))[0]
    if not len(rows):
        return None
    runs, start = [], rows[0]
    for a, b in zip(rows, rows[1:]):
        if b != a + 1:
            runs.append((start, a))
            start = b
    runs.append((start, rows[-1]))
    y0, y1 = max(runs, key=lambda r: r[1] - r[0])
    y0, y1 = int(y0 * 4), int((y1 + 1) * 4)
    if (y1 - y0) > .85 * h or (y1 - y0) < .15 * h:
        return None
    return {"w": w, "h": (y1 - y0) // 2 * 2, "x": 0, "y": y0, "note": "moving picture band between static UI"}


def main():
    for _stream in (sys.stdout, sys.stderr):
        if hasattr(_stream, "reconfigure"):
            _stream.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video")
    ap.add_argument("--apply", help="write a cropped constant-frame-rate copy to this path")
    ap.add_argument("--fps", type=int, default=30)
    a = ap.parse_args()
    w, h, dur = probe(a.video)
    crop = detect_crop(a.video, dur, w, h) or ui_strip_crop(a.video, dur, w, h)
    vf = (f"crop={crop['w']}:{crop['h']}:{crop['x']}:{crop['y']}," if crop else "") + f"fps={a.fps}"
    out = a.apply or "out.mp4"
    cmd = ["ffmpeg", "-y", "-i", a.video, "-vf", vf, "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "copy", out]
    print(json.dumps({"source": {"w": w, "h": h, "duration": dur}, "crop": crop, "ffmpeg": shell_command(cmd)}, indent=2,
                     ensure_ascii=False))
    if a.apply:
        r = run(cmd)
        if r.returncode:
            sys.exit("ffmpeg failed: " + r.stderr[-800:])


if __name__ == "__main__":
    main()
