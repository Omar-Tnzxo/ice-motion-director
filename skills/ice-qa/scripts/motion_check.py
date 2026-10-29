#!/usr/bin/env python3
# Adapted from edenfunf/reelmimic (MIT), .claude/skills/video-clone/scripts/motion_check.py.
# Changes: dash characters replaced; the pop note names this skill's strip method; this header; UTF-8 process I/O and
# output on Windows; a clear error when numpy is missing. 2026-10-19 (pilot films): the analysis frame keeps the film's
# aspect ratio; a freeze is a stretch where no region of the frame moves (the most-changed cell decides), not a low
# whole-frame mean, so a small element moving steadily is not a freeze; declared holds (cue-sheet quiet list, hold
# events) are reported apart. See NOTICE.md.
# Needs: ffmpeg/ffprobe on PATH (or FFMPEG_DIR), Python 3.11+, numpy (pinned in requirements.txt).
"""motion_check.py: find the motion defects that stills can't show, in a rendered video.

    python motion_check.py out/video.mp4 --out out/check/motion [--from 0 --to 30] [--events film.events.json]

Looks at every frame (downscaled to 192 px wide, aspect ratio kept) and flags:
  freeze  a stretch longer than --freeze seconds (default 1.0) where NO region moves: every cell of a 12 px grid
          changes by less than --cell-eps (default 1.0 of 255) from frame to frame. One small element moving anywhere
          (a bar stretching, a cursor, water) means the frame is alive.
          Declared holds are not freezes: the `quiet` list of ice/plan/cue-sheet.json (found by walking up from the
          video) and {"type": "hold", "t": start, "end": end} entries in the events file (--events, or
          <video>.events.json next to the render). A freeze inside a declared hold is listed as "declared".
  black   frames that are (almost) black inside the film, and a hard cut to black at the end (no fade).
  flash   (almost) white frames: fine when designed, but they must not hide the moment they cover.
Writes <out>/motion.json and one strip per flag (<out>/<kind>_<time>.jpg, the frames around it); open the strips.
It also lists the hard cuts, to check against the plan's shot list.
Pops (a pose, expression or prop swapped with no in-between) are NOT detected here: frame differences can't tell them
from wipes and caption changes (tested on real runs). Find them by looking: a 12 fps strip of consecutive frames over
every action (see references/frame-checks.md).
"""
import argparse, json, os, shutil, subprocess, sys

FFMPEG_FALLBACK = os.environ.get("FFMPEG_DIR", "")
if not shutil.which("ffmpeg") and FFMPEG_FALLBACK and os.path.isdir(FFMPEG_FALLBACK):
    os.environ["PATH"] += os.pathsep + FFMPEG_FALLBACK

try:
    import numpy as np
except ImportError:
    sys.exit("motion_check.py needs numpy==2.4.6. Install it into a project virtual environment (no question needed: ice-engines engine-choice.md section 7.6: free pinned packages install without a question): "
             "python -m pip install -r " + os.path.join(os.path.dirname(os.path.abspath(__file__)), "requirements.txt"))

W, G, C = 192, 8, 12   # analysis width (height follows the aspect ratio); G x G grid for cuts; C px cells for freezes
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from storyboard_lint import project_ice, declared_times   # noqa: E402  (shared film-type and cue-sheet helpers)


def probe(path):
    """-> (fps, analysis height). The analysis frame is W px wide and keeps the film's aspect ratio."""
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate",
                        "-of", "csv=p=0", path], capture_output=True, text=True, encoding="utf-8", errors="replace")
    parts = (r.stdout.strip().splitlines() or ["16,9,24/1"])[0].strip(",").split(",")
    w, h = int(parts[0]), int(parts[1])
    n, d = parts[2].split("/")
    return float(n) / float(d), max(G * 2, int(round(h * W / w / 2)) * 2)


def frames(path, a, b, H):
    cmd = ["ffmpeg", "-v", "error"] + (["-ss", str(a)] if a else []) + ["-i", path] + (["-t", str(b - a)] if b else []) + \
          ["-vf", f"scale={W}:{H}:flags=area,format=gray", "-f", "rawvideo", "-"]
    raw = subprocess.run(cmd, capture_output=True).stdout
    arr = np.frombuffer(raw, np.uint8)
    return arr[: len(arr) // (W * H) * W * H].reshape(-1, H, W).astype(np.float32) / 255


def strip(path, t, fps, out, n=10):
    a = max(0.0, t - (n // 2) / fps)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{a:.3f}", "-i", path, "-frames:v", str(n),
                    "-vf", f"scale=320:-2,drawtext=text='%{{pts\\:hms\\:{a:.3f}}}':x=4:y=4:fontsize=14:fontcolor=white:box=1:boxcolor=black@0.5,tile={n}x1",
                    "-update", "1", out], capture_output=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video"); ap.add_argument("--out", required=True)
    ap.add_argument("--from", dest="a", type=float, default=0); ap.add_argument("--to", dest="b", type=float, default=0)
    ap.add_argument("--freeze", type=float, default=1.0)
    ap.add_argument("--cell-eps", type=float, default=1.0, help="a cell changing by at least this (0-255) counts as motion")
    ap.add_argument("--events", default=None, help="events file with hold entries (default: <video>.events.json if present)")
    a = ap.parse_args()
    for _stream in (sys.stdout, sys.stderr):
        if hasattr(_stream, "reconfigure"):
            _stream.reconfigure(encoding="utf-8", errors="replace")
    os.makedirs(a.out, exist_ok=True)
    fps, H = probe(a.video)
    F = frames(a.video, a.a, a.b, H)
    if len(F) < 3: raise SystemExit("no frames")
    t = lambda i: round(a.a + i / fps, 3)
    lum = F.mean((1, 2))
    d = np.abs(np.diff(F, axis=0))                                    # d[i] = change from frame i to i+1
    whole = d.mean((1, 2))
    gh = H // G
    cells = d[:, :gh * G].reshape(len(d), G, gh, G, W // G).mean((2, 4))   # (n, G, G)
    ch, cw = H // C, W // C
    local = d[:, :ch * C, :cw * C].reshape(len(d), ch, C, cw, C).mean((2, 4)).reshape(len(d), -1).max(1) * 255   # most-changed cell
    # cuts: most of the frame changes a lot at once (line boil / grain change everything a little, not a lot)
    big = (cells > 0.1).mean((1, 2))
    cut_at = {i for i in range(len(d)) if big[i] > 0.5 and whole[i] > 0.1}
    cuts = [t(i + 1) for i in sorted(cut_at)]
    ev = a.events or next((c for c in (a.video + ".events.json", os.path.splitext(a.video)[0] + ".events.json") if os.path.isfile(c)), None)
    holds, _, hsrc = declared_times(project_ice(os.path.dirname(os.path.abspath(a.video))), ev)
    held = lambda i: any(s <= t(i) and t(i + 1) <= e + 0.5 / fps for s, e, _ in holds)
    # a freeze: no region moves (the most-changed cell stays under --cell-eps), outside declared holds
    freezes, declared, run, hrun = [], [], 0, 0
    for i in range(len(d) + 1):
        still = i < len(d) and local[i] < a.cell_eps
        h = still and held(i)
        if still and not h: run += 1
        elif run:
            if run / fps >= a.freeze: freezes.append({"from": t(i - run), "to": t(i), "s": round(run / fps, 2)})
            run = 0
        if h: hrun += 1
        elif hrun:
            if hrun / fps >= a.freeze: declared.append({"from": t(i - hrun), "to": t(i), "s": round(hrun / fps, 2)})
            hrun = 0
    black, white = [], []
    for i, v in enumerate(lum):
        if v < 0.04 and (not black or t(i) - black[-1]["to"] > 1.5 / fps): black.append({"from": t(i), "to": t(i)})
        elif v < 0.04: black[-1]["to"] = t(i)
        if v > 0.92 and (not white or t(i) - white[-1] > 0.5): white.append(t(i))
    tail = lum[-int(fps * 0.5):] if len(lum) > fps else lum
    end_hard_black = bool(lum[-1] < 0.04 and len(tail) > 3 and tail[0] > 0.12 and np.min(np.diff(tail)) < -0.1)
    rep = {"video": a.video, "fps": fps, "frames": len(F), "cuts": cuts, "freezes": freezes, "declared_still": declared,
           "declared_holds": [{"from": s, "to": e, "reason": r} for s, e, r in holds], "holds_from": hsrc, "cell_eps": a.cell_eps,
           "black": [b for b in black if b["from"] > a.a + 0.2], "white_flash": white, "end_hard_cut_to_black": end_hard_black,
           "note": "open each strip. Pops are not detected here: check every action with a 12 fps strip of consecutive frames."}
    for z in freezes: strip(a.video, (z["from"] + z["to"]) / 2, fps, os.path.join(a.out, f"freeze_{z['from']:.2f}.jpg"))
    for b in rep["black"]: strip(a.video, b["from"], fps, os.path.join(a.out, f"black_{b['from']:.2f}.jpg"))
    with open(os.path.join(a.out, "motion.json"), "w", encoding="utf-8") as f: json.dump(rep, f, indent=1)
    print(f"cuts {len(cuts)}  freezes {len(freezes)}  black {len(rep['black'])}  white {len(white)}  end_hard_black {end_hard_black}")
    for z in freezes: print(f"  freeze {z['from']:.2f}-{z['to']:.2f}s ({z['s']}s): no region of the frame moves")
    for z in declared: print(f"  declared hold, still {z['from']:.2f}-{z['to']:.2f}s ({z['s']}s): not a freeze")
    if holds: print(f"  declared holds read from {', '.join(hsrc)}: " + ", ".join(f"{s:g}-{e:g}s" for s, e, _ in holds))
    print("wrote", os.path.join(a.out, "motion.json"))


if __name__ == "__main__":
    main()
