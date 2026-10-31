# Adapted from edenfunf/reelmimic (MIT, Copyright (c) 2026 ReelMimic contributors; see LICENSE-reelmimic.txt). Changes: URL download (yt-dlp) removed, local files only; analysis cache made opt-in with --cache-dir; shebang dropped; dash characters replaced; UTF-8 console output for Windows; a missing optional package (opencv, scenedetect, librosa) prints a one-line warning naming its pinned version and its report section stays empty (librosa used to crash the run), a missing numpy, ffmpeg or ffprobe stops with a clear message; images are written through cv2.imencode so non-ASCII Windows paths work; no cache is written while a package is missing.
# 2026-10-29 (0.2.6): an After Effects project (.aep or .aet, a RIFX file) is read instead of analysed as video: its
# compositions, layers and the keyframes of transform properties go to aep.json (standard library only, no ffmpeg); best
# effort, with a list of what was not decoded; nothing in the file is ever run.
"""analyze.py: take a reference video (a local file the user supplied) apart for style analysis.

    python analyze.py <local-file> --out <ice>/reference/<ref-id>/analysis [--cache-dir DIR] [--no-cache]
    python analyze.py <project.aep> --out <ice>/reference/<ref-id>/analysis      (an After Effects project, see below)

Writes into --out:
    source.<ext>      a copy of the input file
    proxy.mp4         the video cropped to the real picture (phone UI / letterbox removed) when a crop was needed
    audio.wav         mono audio, phase-safe and loudness-normalised (only if the input has sound)
    sheet_1fps.jpg    one frame per second, tiled: look at this first
    sheet_scenes.jpg  the middle frame of every detected shot
    report.json       everything measured: size, crop, shots, pacing, tempo, beats, audio health, best 30 s windows,
                      and peak_candidates (where the music builds and hits: the reference's likely goosebump moments),
                      per-shot camera segments, and structure (fades, black holds, overlays popping, revealing or
                      scaling in), so a one-take film with no hard cut still has a grammar

With --cache-dir, results are cached per input (file content) in that folder: the same reference is analysed once.
Without it nothing is written outside --out. This script never uses the network.

An After Effects project (.aep or .aet) is read, never opened in After Effects and never run: aep.json lists the
compositions (size, frame rate, duration), their layers (name, source, start, in and out) and the keyframes of the
transform properties (time, value, interpolation, influence, spatial tangents), static transform values, which other
properties carry keys or expressions, and what could not be decoded. Key times are raw time / the comp's time scale
(30720 = 30 x 1024 in the measured project: raw / 1024 is 1/30 s, not a frame); check them against a render of the comp.

Lessons baked in (each one broke a real run):
    - phone screen recordings: the video is a strip in the middle of a UI → cropdetect, then analyse the proxy
    - stereo recordings with inverted phase cancel to silence when summed to mono → measure L, R and L+R separately
    - loudness: normalise the chosen channel so beat tracking sees the music, not the noise floor
    - numba's compiled beat tracker can crash the interpreter on some CPUs (an AMD znver3 under Windows, 2026-10-31)
      → the audio runs in a child process, retried once for a plain x86-64 target; a crash is reported, never silent
"""
import argparse, faulthandler, hashlib, importlib.util, json, os, re, shutil, struct, subprocess, sys, collections

ANALYZE_VERSION = 7   # bump when report.json gains fields, so cached analyses are redone

FFMPEG_FALLBACK = os.environ.get("FFMPEG_DIR", "")   # folder with ffmpeg/ffprobe when they are not on PATH
if not shutil.which("ffmpeg") and FFMPEG_FALLBACK and os.path.isdir(FFMPEG_FALLBACK):
    os.environ["PATH"] += os.pathsep + FFMPEG_FALLBACK

ROTATE_VF = {0: "", 90: "transpose=1,", 180: "hflip,vflip,", 270: "transpose=2,"}   # degrees clockwise to make upright
REQUIREMENTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "requirements.txt")
# import name -> (pinned package, the report section that stays empty without it)
OPTIONAL = {"cv2": ("opencv-python-headless==4.10.0.84", "crop band, scene sheet, per-shot camera and look"),
            "scenedetect": ("scenedetect==0.6.7", "shot detection"),
            "librosa": ("librosa==0.11.0", "audio tempo, beats and peaks")}


def missing_optional():
    """Warn once per missing optional package (stderr) and return their import names."""
    missing = [m for m in OPTIONAL if importlib.util.find_spec(m) is None]
    for m in missing:
        pin, what = OPTIONAL[m]
        print(f"warning: {pin} is not installed; skipped: {what} (install it, no question needed, ice-engines engine-choice.md section 7.6: "
              f"python -m pip install {pin})", file=sys.stderr)
    return missing


def imwrite(path, img, params=()):
    """cv2.imwrite fails silently on non-ASCII paths on Windows; encode in memory and write the bytes instead."""
    import cv2
    ok, buf = cv2.imencode(os.path.splitext(path)[1], img, list(params))
    if ok:
        with open(path, "wb") as f:
            f.write(buf.tobytes())
    return ok


def run(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace", **kw)


def probe(path):
    r = run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height,r_frame_rate,channels",
             "-of", "json", path])
    if r.returncode != 0:
        sys.exit(f"ffprobe could not read {path}: {r.stderr.strip()[-500:]}")
    j = json.loads(r.stdout)
    v = next((s for s in j["streams"] if s["codec_type"] == "video"), None)
    a = next((s for s in j["streams"] if s["codec_type"] == "audio"), None)
    fps = None
    if v and v.get("r_frame_rate") and v["r_frame_rate"] != "0/0":
        n, d = v["r_frame_rate"].split("/"); fps = round(float(n) / float(d), 3)
    return {"duration": float(j["format"]["duration"]), "width": v and v["width"], "height": v and v["height"], "fps": fps,
            "has_audio": a is not None, "channels": a and a.get("channels")}


def fetch(src, out):
    """Local files only. A link is not fetched: ask the user for the file they own or are licensed to use."""
    if not os.path.isfile(src):
        sys.exit(f"not a local file: {src}\nAsk the user for the reference file itself; "
                 "this script does not download links.")
    dst = os.path.join(out, "source" + os.path.splitext(src)[1].lower())
    shutil.copyfile(src, dst); return dst


def detect_crop(path, dur, w, h):
    """Most common cropdetect box over the whole video; None if the picture already fills the frame."""
    r = run(["ffmpeg", "-hide_banner", "-i", path, "-t", str(min(dur, 60)), "-vf", "fps=2,cropdetect=limit=24:round=2:reset=1",
             "-f", "null", "-"])
    boxes = collections.Counter(re.findall(r"crop=(\d+:\d+:\d+:\d+)", r.stderr))
    if not boxes: return None
    cw, ch, cx, cy = map(int, boxes.most_common(1)[0][0].split(":"))
    if cw * ch > .85 * w * h: return None
    return {"w": cw, "h": ch, "x": cx, "y": cy, "note": "picture is a strip inside a larger frame (screen recording / letterbox)"}


def ui_strip_crop(path, dur, w, h):
    """Phone screen recordings put the video between two busy UI bands that cropdetect can't see through (they aren't
    black). Find the band of rows whose content changes most over time: that's the playing video."""
    try:
        import numpy as np, cv2
    except ImportError:
        return None
    cap = cv2.VideoCapture(path); frames = []
    for k in range(12):
        cap.set(cv2.CAP_PROP_POS_MSEC, (k + .5) / 12 * dur * 1000)
        ok, f = cap.read()
        if ok: frames.append(cv2.cvtColor(cv2.resize(f, (w // 4, h // 4)), cv2.COLOR_BGR2GRAY).astype("float32"))
    cap.release()
    if len(frames) < 4: return None
    var = np.stack(frames).std(axis=0).mean(axis=1)            # temporal change per row
    rows = np.where(var > max(6.0, var.max() * .35))[0]
    if not len(rows): return None
    # the longest run of consecutive active rows
    runs, start = [], rows[0]
    for a, b in zip(rows, rows[1:]):
        if b != a + 1: runs.append((start, a)); start = b
    runs.append((start, rows[-1]))
    y0, y1 = max(runs, key=lambda r: r[1] - r[0])
    y0, y1 = int(y0 * 4), int((y1 + 1) * 4)
    if (y1 - y0) > .85 * h or (y1 - y0) < .15 * h: return None
    return {"w": w, "h": (y1 - y0) // 2 * 2, "x": 0, "y": y0, "note": "moving picture band between static UI (phone screen recording)"}


def _grey_samples(path, dur, n=12, width=320):
    import cv2
    cap = cv2.VideoCapture(path); out = []
    for k in range(n):
        cap.set(cv2.CAP_PROP_POS_MSEC, (k + .5) / n * dur * 1000)
        ok, f = cap.read()
        if ok: out.append(cv2.cvtColor(cv2.resize(f, (width, max(2, round(width * f.shape[0] / f.shape[1])))), cv2.COLOR_BGR2GRAY).astype("float32"))
    cap.release()
    return out


def orientation(path, dur):
    """Is the picture stored sideways inside the frame (a landscape design saved in a portrait file with no rotation
    flag, or the reverse)? Text lines and UI rows make the row profile of edges change fast and the column profile
    slow; turned 90 degrees, the opposite. The turn direction is guessed from left-aligned lines (their starts line up,
    their ends are ragged), so right-to-left text can flip it: look at the sheets."""
    try:
        import numpy as np, cv2
    except ImportError:
        return None
    def hf(p):
        k = 9; sm = np.convolve(p, np.ones(k) / k, mode="same")
        return float(np.mean(np.abs(p - sm)[k:-k]) / (np.mean(p) + 1e-6))
    def ragged(E):
        rows = [r for r in range(E.shape[0]) if E[r].sum() > 3]
        if len(rows) < 6: return 0.0
        st = [np.nonzero(E[r])[0][0] for r in rows]; en = [np.nonzero(E[r])[0][-1] for r in rows]
        return float(np.log((np.std(en) + 1) / (np.std(st) + 1)))   # above 0: starts aligned, ends ragged
    scores, ccw = [], 0.0
    for g in _grey_samples(path, dur):
        E = np.hypot(cv2.Sobel(g, cv2.CV_32F, 1, 0), cv2.Sobel(g, cv2.CV_32F, 0, 1)) > 40
        if E.sum() < 200 or min(E.shape) < 24: continue
        scores.append(float(np.log((hf(E.sum(1).astype(float)) + 1e-6) / (hf(E.sum(0).astype(float)) + 1e-6))))
        ccw += ragged(np.rot90(E, 1)) - ragged(np.rot90(E, -1))
    if len(scores) < 4: return {"rotated": False, "rotate": 0, "confidence": "unmeasured", "note": "too few frames with edges"}
    med = float(np.median(scores)); agree = sum(1 for x in scores if x < 0) / len(scores)
    rotated = med < -0.35 and agree >= 2 / 3
    out = {"rotated": rotated, "rotate": (270 if ccw >= 0 else 90) if rotated else 0, "score": round(med, 2), "agree": round(agree, 2),
           "confidence": ("high" if med < -0.6 and agree >= .8 else "low") if rotated else ("high" if med > 0.35 else "low")}
    if rotated:
        out["note"] = (f"content looks stored sideways; turn {out['rotate']} degrees clockwise to view (direction guessed from "
                       "left-aligned lines). If the sheets come out upside down, rerun with --rotate " + str(90 if out["rotate"] == 270 else 270))
    return out


def crop_check(path, dur, w, h, crop, kind):
    """Refuse a crop that would cut off picture. A letterbox band must be black in every sample; phone chrome must be
    static and must hold something (a near-black, empty band means there is no chrome: a dark-mode design, not a
    screen recording)."""
    try:
        import numpy as np
    except ImportError:
        return crop, None
    fr = _grey_samples(path, dur, 16, 320)
    if len(fr) < 4: return crop, None
    s = 320 / w
    x0, y0, x1, y1 = int(crop["x"] * s), int(crop["y"] * s), int((crop["x"] + crop["w"]) * s), int((crop["y"] + crop["h"]) * s)
    mask = np.ones(fr[0].shape, bool); mask[max(0, y0 + 1):max(0, y1 - 1), max(0, x0 + 1):max(0, x1 - 1)] = False
    if mask.sum() < 20: return crop, None
    band = np.stack([f[mask] for f in fr])
    if crop["w"] * crop["h"] < 0.15 * w * h:
        return None, "crop refused: it would keep less than 15 percent of the frame, which no letterbox or phone chrome does"
    if kind == "letterbox":
        lit = int((band > 40).sum(axis=1).max())
        if lit >= 12: return None, f"letterbox crop refused: the cut-off band shows picture ({lit} lit pixels in one sample)"
    else:
        moving = float((band.std(axis=0) > 8).mean()); empty = float(band.mean()) < 15
        if moving > 0.02: return None, f"UI strip crop refused: the cut-off band moves ({round(moving * 100, 1)} percent of its pixels)"
        if empty: return None, "UI strip crop refused: the cut-off band is near-black and empty, so there is no phone chrome"
    return crop, None


def make_proxy(path, crop, out, rotate=0, name="proxy.mp4"):
    """Analysis copy: cropped to the picture (if needed) and with a keyframe every 12 frames, so the hundreds of random
    seeks in shot_details() decode a few frames instead of up to 8 s of video each (same pixels, ~2x faster analysis)."""
    dst = os.path.join(out, name)
    f = ROTATE_VF[rotate] + (f"crop={crop['w']}:{crop['h']}:{crop['x']}:{crop['y']}" if crop else "")
    vf = ["-vf", f.rstrip(",")] if f else []
    run(["ffmpeg", "-v", "error", "-y", "-i", path, *vf, "-c:v", "libx264", "-preset", "veryfast", "-crf", "16", "-g", "12", "-an", dst])
    return dst


def shots(path):
    try:
        from scenedetect import detect, ContentDetector
    except ImportError:
        return []
    lst = detect(path, ContentDetector(threshold=22))
    sec = lambda x: x.seconds if hasattr(type(x), "seconds") else x.get_seconds()
    return [[round(sec(a), 3), round(sec(b), 3)] for a, b in lst]


def sheets(path, dur, cuts, out):
    n = int(min(dur, 64)); cols = 8; rows = max(1, -(-n // cols))
    run(["ffmpeg", "-v", "error", "-y", "-i", path, "-vf", f"fps={n / dur:.5f},scale=300:-2,tile={cols}x{rows}", "-frames:v", "1",
         os.path.join(out, "sheet_1fps.jpg")])
    if cuts:
        try:
            import cv2, numpy as np
        except ImportError:
            return
        step = max(1, len(cuts) // 48); mids = [(a + b) / 2 for a, b in cuts][::step][:48]
        cap = cv2.VideoCapture(path); tiles = []
        for m in mids:
            cap.set(cv2.CAP_PROP_POS_MSEC, m * 1000); ok, f = cap.read()
            if ok:
                f = cv2.resize(f, (300, round(300 * f.shape[0] / f.shape[1])))
                cv2.putText(f, f"{m:.1f}s", (6, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 0), 3); cv2.putText(f, f"{m:.1f}s", (6, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1)
                tiles.append(f)
        cap.release()
        if tiles:
            h = tiles[0].shape[0]; tiles = [t if t.shape[0] == h else cv2.resize(t, (300, h)) for t in tiles]
            while len(tiles) % 8: tiles.append(np.zeros_like(tiles[0]))
            grid = np.vstack([np.hstack(tiles[r:r + 8]) for r in range(0, len(tiles), 8)])
            imwrite(os.path.join(out, "sheet_scenes.jpg"), grid, [cv2.IMWRITE_JPEG_QUALITY, 85])


CAM_LIMITS = {"zoom": 0.006, "pan_x": 0.008, "tilt_y": 0.008, "rotate": 0.01}   # per second; below all of them but above
DRIFT_MIN = 0.004                                                                    # DRIFT_MIN the camera drifts


def _similarity(g0, g1):
    """Similarity transform between two greyscale frames from tracked corners (RANSAC, so a panel popping in over part
    of the frame does not move the estimate). Returns zoom (log scale), pan_x, tilt_y (centre shift as a share of the
    frame) and rotate (radians), or None when there is too little texture to track."""
    import numpy as np, cv2
    H_, W_ = g0.shape
    mask = np.full(g0.shape, 255, np.uint8); mask[: max(1, H_ // 25)] = 0   # thin top strip: browser tab bars
    p0 = cv2.goodFeaturesToTrack(g0, 400, 0.01, 8, mask=mask)
    if p0 is None or len(p0) < 12: return None
    p1, st, _ = cv2.calcOpticalFlowPyrLK(g0, g1, p0, None, winSize=(21, 21), maxLevel=3)
    ok = st.ravel() == 1
    if ok.sum() < 12: return None
    a0, a1 = p0[ok].reshape(-1, 2), p1[ok].reshape(-1, 2)
    M, inl = cv2.estimateAffinePartial2D(a0, a1, method=cv2.RANSAC, ransacReprojThreshold=2.0)
    if M is None or inl is None or inl.sum() < 10: return None
    inl = inl.ravel().astype(bool)
    moved = np.hypot(*(a1 - a0).T) > 3.0                     # points that moved at all (480 px frame)
    pred = a0 @ M[:, :2].T + M[:, 2]
    off_model = np.hypot(*(a1 - pred).T) > 3.0               # points the global model does not explain
    # A camera move is one motion field over the whole picture. The agreeing points must cover most of the frame;
    # when they sit in one region (a list scrolling in a column, a card sliding over an empty dark ground) it is
    # element motion in a locked frame, not a camera move.
    ip = a0[inl]
    spread = min((ip[:, 0].max() - ip[:, 0].min()) / W_, (ip[:, 1].max() - ip[:, 1].min()) / H_)
    is_global = inl.mean() >= 0.5 and spread >= 0.5
    if is_global:
        elements = float(off_model.mean())
        scale = float(np.hypot(M[0, 0], M[1, 0])); ang = float(np.arctan2(M[1, 0], M[0, 0]))
        cx, cy = W_ / 2, H_ / 2
        nx, ny = M[0, 0] * cx + M[0, 1] * cy + M[0, 2], M[1, 0] * cx + M[1, 1] * cy + M[1, 2]
        cam = {"zoom": float(np.log(max(scale, 1e-6))), "pan_x": float((nx - cx) / W_), "tilt_y": float((ny - cy) / H_), "rotate": ang}
    else:
        elements = float(moved.mean())
        cam = {"zoom": 0.0, "pan_x": 0.0, "tilt_y": 0.0, "rotate": 0.0}
    return {**cam, "elements": elements}


def _cam_kind(r):
    kind = []
    if abs(r["zoom"]) > CAM_LIMITS["zoom"]: kind.append("push_in" if r["zoom"] > 0 else "pull_out")
    if abs(r["pan_x"]) > CAM_LIMITS["pan_x"]: kind.append("move_left" if r["pan_x"] > 0 else "move_right")   # content moves right → camera moves left
    if abs(r["tilt_y"]) > CAM_LIMITS["tilt_y"]: kind.append("move_up" if r["tilt_y"] > 0 else "move_down")
    if abs(r["rotate"]) > CAM_LIMITS["rotate"]: kind.append("roll/orbit")
    if not kind: kind = ["drift"] if max(abs(r[k]) for k in CAM_LIMITS) >= DRIFT_MIN else ["static"]
    return kind


def camera_track(cap, a, b):
    """Camera over one shot: a similarity transform every half second (a quarter of the shot when it is shorter than 2 s),
    smoothed over three steps, classified per step and grouped into segments. Slow push-ins in a long one-take shot
    show up as their own segment instead of being averaged away."""
    import cv2
    step = 0.5 if b - a >= 2 else max(0.05, (b - a) / 4)
    ts = [a + step / 2 + k * step for k in range(int((b - a) / step) + 1)]
    ts = [t for t in ts if t < b] or [(a + b) / 2]
    prev, raw = None, []
    for t in ts:
        cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000); ok, f = cap.read()
        if not ok: continue
        g = cv2.cvtColor(cv2.resize(f, (480, round(480 * f.shape[0] / f.shape[1]))), cv2.COLOR_BGR2GRAY)
        if prev is not None:
            m = _similarity(prev[1], g); dt = t - prev[0]
            raw.append((prev[0], t, {k: (v if k == "elements" else v / dt) for k, v in m.items()} if m else None))
        prev = (t, g)
    keys = ("zoom", "pan_x", "tilt_y", "rotate")
    steps = []
    for j, (t0, t1, r) in enumerate(raw):
        near = [x[2] for x in raw[max(0, j - 1): j + 2] if x[2]]
        if not near: continue
        sm = {k: sorted(x[k] for x in near)[len(near) // 2] for k in keys + ("elements",)}
        steps.append((t0, t1, sm))
    segs = []
    for t0, t1, r in steps:
        kind = _cam_kind(r); sp = max(abs(r[k]) for k in keys)
        if segs and segs[-1]["kind"] == kind and abs(segs[-1]["end"] - t0) < 1e-6:
            segs[-1]["end"] = t1; segs[-1]["_sp"].append(sp); segs[-1]["_el"].append(r["elements"])
        else:
            segs.append({"start": t0, "end": t1, "kind": kind, "_sp": [sp], "_el": [r["elements"]]})
    merged = []   # a segment under 1 s between neighbours joins the one before it
    for sg in segs:
        if merged and (sg["end"] - sg["start"] < 1.0 or merged[-1]["kind"] == sg["kind"]):
            merged[-1]["end"] = sg["end"]; merged[-1]["_sp"] += sg["_sp"]; merged[-1]["_el"] += sg["_el"]
        else:
            merged.append(sg)
    span = sum(t1 - t0 for t0, t1, _ in steps) or 1
    mv = {k: round(sum(r[k] * (t1 - t0) for t0, t1, r in steps) / span, 4) for k in keys}
    cover = {}
    for sg in merged:
        for k in sg["kind"]: cover[k] = cover.get(k, 0) + sg["end"] - sg["start"]
    moving = [k for k, v in sorted(cover.items(), key=lambda kv: -kv[1]) if k not in ("static", "drift") and v >= 0.25 * span]
    mv["kind"] = moving or (["drift"] if cover.get("drift", 0) >= 0.25 * span else ["static"])
    mv["speed"] = round(sum(max(abs(r[k]) for k in keys) * (t1 - t0) for t0, t1, r in steps) / span, 3) if steps else 0.0
    mv["pace"] = "still" if mv["speed"] < 0.006 else "slow" if mv["speed"] < 0.04 else "medium" if mv["speed"] < 0.12 else "fast"
    mv["segments"] = [{"start": round(sg["start"], 2), "end": round(sg["end"], 2), "kind": sg["kind"],
                       "speed": round(sum(sg["_sp"]) / len(sg["_sp"]), 4),
                       "elements_move": sum(1 for e in sg["_el"] if e > 0.1) * 2 > len(sg["_el"])} for sg in merged]
    # element motion: steps where part of the picture moves on its own (over a locked or moving camera)
    mv["element_motion_time_pct"] = round(100 * sum((t1 - t0) for t0, t1, r in steps if r["elements"] > 0.1) / span) if steps else 0
    return mv


def shot_details(path, cuts, dur):
    """Same as _shot_details_part over all shots, split across processes (seeking a long video is the slow part)."""
    spans = cuts or [[0.0, dur]]
    n = min(8, max(1, (os.cpu_count() or 2) - 1), max(1, len(spans) // 12))
    if n <= 1: return _shot_details_part(path, spans, 0)
    from concurrent.futures import ProcessPoolExecutor
    size = -(-len(spans) // n); parts = [(path, spans[k:k + size], k) for k in range(0, len(spans), size)]
    with ProcessPoolExecutor(len(parts)) as ex:
        res = list(ex.map(_shot_details_star, parts))
    return [x for part in res for x in part]


def _shot_details_star(args): return _shot_details_part(*args)


def _shot_details_part(path, spans, offset):
    """Per shot: camera motion (tracked corners every half second → push/pull/pan/tilt/rotate/drift/static, speed and
    time segments) and look (brightness, contrast, dark ratio, colourfulness, dominant colours). These numbers let the
    plan and the review match the reference shot by shot."""
    try:
        import numpy as np, cv2
    except ImportError:
        return []
    cap = cv2.VideoCapture(path); out = []
    for i, (a, b) in enumerate(spans, offset):
        n = max(3, min(10, int((b - a) * 5))); ts = [a + (b - a) * (k + .5) / n for k in range(n)]
        looks = []
        for t in ts:
            cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000); ok, f = cap.read()
            if ok: looks.append(cv2.resize(f, (320, round(320 * f.shape[0] / f.shape[1]))))
        if len(looks) < 2: continue
        mv = camera_track(cap, a, b)
        px = np.concatenate([l.reshape(-1, 3) for l in looks]).astype(np.float32)
        lum = (0.114 * px[:, 0] + 0.587 * px[:, 1] + 0.299 * px[:, 2]) / 255
        rg = px[:, 2] - px[:, 1]; yb = 0.5 * (px[:, 2] + px[:, 1]) - px[:, 0]
        colorful = float(np.sqrt(rg.std() ** 2 + yb.std() ** 2) + 0.3 * np.sqrt(rg.mean() ** 2 + yb.mean() ** 2)) / 255
        sample = px[:: max(1, len(px) // 4000)]
        crit = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
        _, lab, cen = cv2.kmeans(sample, 4, None, crit, 2, cv2.KMEANS_PP_CENTERS)
        order = np.argsort(-np.bincount(lab.ravel(), minlength=4))
        dom = ["#%02X%02X%02X" % (int(cen[k][2]), int(cen[k][1]), int(cen[k][0])) for k in order]
        out.append({"shot": i + 1, "start": round(a, 2), "end": round(b, 2), "camera": mv,
                    "look": {"brightness": round(float(lum.mean()), 3), "contrast": round(float(lum.std()), 3),
                             "dark_ratio": round(float((lum < 0.08).mean()), 3), "colourfulness": round(colorful, 3), "dominant": dom}})
    cap.release()
    return out


def audio(path, info, out):
    """Pick a phase-safe channel mix, normalise, then measure tempo, beats and the densest 30 s windows."""
    if not info["has_audio"]: return {"present": False}
    if importlib.util.find_spec("librosa") is None:
        return {"present": True, "skipped": f"{OPTIONAL['librosa'][0]} not installed: no tempo, beats or peaks measured"}
    import numpy as np, librosa
    raw = os.path.join(out, "_stereo.wav")
    run(["ffmpeg", "-v", "error", "-y", "-i", path, "-vn", "-ac", "2", "-ar", "22050", raw])
    y, sr = librosa.load(raw, sr=22050, mono=False)
    if y.ndim == 1: y = np.stack([y, y])
    db = lambda x: float(20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12))
    L, R, M = db(y[0]), db(y[1]), db((y[0] + y[1]) / 2)
    phase_inverted = M < max(L, R) - 10
    mix = "pan=mono|c0=c0" if phase_inverted else "pan=mono|c0=0.5*c0+0.5*c1"
    wav = os.path.join(out, "audio.wav")
    run(["ffmpeg", "-v", "error", "-y", "-i", path, "-vn", "-af", f"{mix},loudnorm=I=-14:TP=-1.5", "-ar", "44100", wav])
    os.remove(raw)
    y, sr = librosa.load(wav, sr=22050, mono=True)
    level = db(y)
    if level < -45:
        return {"present": True, "silent": True, "levels_db": {"L": L, "R": R, "mono": M}, "phase_inverted": phase_inverted,
                "note": "no usable sound: ask the user to re-record with system audio on, or to supply the audio file"}
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units="time")
    tempo = float(np.atleast_1d(tempo)[0])
    # Tempo: the beat grid that all tracked beats agree with best (phase coherence over periods within 10 percent of
    # the median interval). The median interval of a jittery beat list is biased; it, the mean interval and the
    # tracker's own estimate are kept as the range.
    ibi = np.diff(beats); bpm = float(60 / np.median(ibi)) if len(ibi) else tempo
    bpm_reads = {"median_interval": round(bpm, 2)}
    if len(beats) >= 8:
        cand = np.arange(bpm * 0.9, bpm * 1.1, 0.05)
        coh = [abs(np.mean(np.exp(2j * np.pi * beats * c / 60))) for c in cand]
        bpm_reads.update(grid_fit=round(float(cand[int(np.argmax(coh))]), 2), mean_interval=round(float(60 / np.mean(ibi)), 2),
                         tracker=round(tempo, 2))
        bpm = bpm_reads["grid_fit"]
    on = librosa.onset.onset_strength(y=y, sr=sr); ot = librosa.times_like(on, sr=sr)
    win, dur = 30.0, len(y) / sr
    cands = []
    for i in range(0, len(beats), 4):
        s = beats[i]
        if s + win > dur: break
        cands.append((float(on[(ot >= s) & (ot < s + win)].mean()), float(s)))
    cands.sort(reverse=True)
    # noise floor: the quietest 10th percentile of 0.5 s windows
    hop = sr // 2; w = [db(y[i:i + hop]) for i in range(0, len(y) - hop, hop)]
    peaks = peak_candidates(y, sr, beats)
    return {"present": True, "silent": False, "levels_db": {"L": round(L, 1), "R": round(R, 1), "mono": round(M, 1)},
            "phase_inverted": bool(phase_inverted), "noise_floor_db": round(float(np.percentile(w, 10)), 1) if w else None,
            "bpm": round(bpm, 2), "bpm_reads": bpm_reads, "bpm_range": [round(min(bpm_reads.values()), 2), round(max(bpm_reads.values()), 2)],
            "beat_seconds": round(60 / bpm, 4), "first_beat": round(float(beats[0]), 3) if len(beats) else None,
            "beats": [round(float(b), 3) for b in beats],
            "best_30s_starts": [{"start": round(s, 2), "density": round(m, 3)} for m, s in cands[:5]],
            "peak_candidates": peaks,
            "quality_warning": ("mono only (phase-inverted stereo)" if phase_inverted else None)}


def audio_child(path, out, result):
    """--audio-child: audio() alone, its result written to a JSON file for the parent (see audio_start)."""
    crash = os.environ.get("ICE_TEST_AUDIO_CRASH")   # tests only: "always", or "native" = crash until the generic retry
    if crash == "always" or (crash == "native" and os.environ.get("NUMBA_CPU_NAME") != "generic"):
        faulthandler._sigsegv()
    res = audio(path, {"has_audio": True}, out)
    with open(result, "w", encoding="utf-8") as f: json.dump(res, f)


def audio_start(path, info, out, env=None):
    """Start audio() in a child process, so it runs beside the video work and a native crash in numba's compiled
    beat tracker (seen with llvmlite 0.48 on an AMD znver3 under Windows) cannot kill the whole analysis."""
    if not info["has_audio"]: return None
    res, log = os.path.join(out, "_audio.json"), os.path.join(out, "_audio.log")
    if os.path.exists(res): os.remove(res)
    cmd = [sys.executable, *(["-I"] if sys.flags.isolated else []), os.path.abspath(__file__), path, "--out", out, "--audio-child", res]
    with open(log, "w", encoding="utf-8") as f:
        return {"proc": subprocess.Popen(cmd, env=env, stdout=f, stderr=subprocess.STDOUT), "result": res, "log": log}


def audio_finish(job, path, info, out):
    """Wait for the audio child. A crash is retried once with NUMBA_CPU_NAME=generic (numba then compiles for a plain
    x86-64 target, which fixed the znver3 crash); a second crash returns an error entry that main() reports loudly."""
    if job is None: return {"present": False}
    for attempt in (1, 2):
        rc = job["proc"].wait()
        with open(job["log"], encoding="utf-8", errors="replace") as f: log = f.read().strip()
        if rc == 0 and os.path.isfile(job["result"]):
            with open(job["result"], encoding="utf-8") as f: res = json.load(f)
            for p in (job["result"], job["log"]): os.remove(p)
            if log: print(log, file=sys.stderr)
            if attempt == 2: res["numba_cpu"] = "generic (the default target crashed)"
            return res
        code = f"{rc}, signal {-rc}" if rc < 0 else f"0x{rc:08X}" if rc > 255 else str(rc)   # Windows: 0xC0000005 is a crash
        if attempt == 1:
            print(f"audio   the audio analysis crashed (exit {code}); retrying with NUMBA_CPU_NAME=generic", file=sys.stderr)
            job = audio_start(path, info, out, dict(os.environ, NUMBA_CPU_NAME="generic"))
    return {"present": True, "error": f"the audio analysis crashed twice (exit {code}), the second time with NUMBA_CPU_NAME=generic: "
            "no tempo, beats or peaks measured", "log": job["log"], "log_tail": log[-1500:]}


def peak_candidates(y, sr, beats, n=3):
    """Where the music builds and then hits: the moments a reference spends its biggest visual on. Three curves in
    0.25 s steps (loudness, onset strength, spectral fullness), each z-scored and summed, because mastered pop is
    loudness-flat and only gets fuller and busier at a chorus. A candidate is the sharpest rise from the 2 s before to
    the 1 s after, scored higher when a quieter stretch (the held breath) sits right before it; snapped to the nearest
    beat. Numbers only point: the director confirms by looking at the frames."""
    import numpy as np, librosa
    hop = sr // 4
    rms = librosa.feature.rms(y=y, frame_length=hop * 2, hop_length=hop)[0]
    onset = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
    bw = librosa.feature.spectral_bandwidth(y=y, sr=sr, hop_length=hop)[0]
    m = min(len(rms), len(onset), len(bw))
    if m < 24: return []
    z = lambda v: (v - v.mean()) / (v.std() + 1e-9)
    cur = z(20 * np.log10(rms[:m] + 1e-9)) + z(onset[:m]) + z(bw[:m])
    sm = np.convolve(cur, np.ones(4) / 4, mode="same")
    out = []
    for i in range(8, m - 4):
        before, after = sm[i - 8:i].mean(), sm[i:i + 4].mean()
        rise = after - before
        if rise < 0.8: continue
        dip = float(sm[i - 8:i].min())
        out.append((rise + 0.5 * max(0.0, before - dip) + 0.3 * after, i * 0.25, rise, after))
    out.sort(reverse=True)
    picked = []
    for score, t, rise, after in out:
        if len(beats): t = float(beats[np.argmin(np.abs(np.asarray(beats) - t))])
        if any(abs(t - p["t"]) < 6 for p in picked): continue
        picked.append({"t": round(t, 2), "rise": round(float(rise), 2), "level_after": round(float(after), 2),
                       "kind": "drop" if rise >= 2.5 else "lift"})
        if len(picked) >= n: break
    return sorted(picked, key=lambda p: p["t"])


def flashes(path, dur):
    """Frames much brighter than the frames around them (white flash / impact frames) and the busiest cut stretch:
    references often mark their hit with a flash. 6 fps luminance, 64 px wide."""
    import numpy as np
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", "fps=6,scale=64:36,format=gray", "-f", "rawvideo", "-"],
                       capture_output=True)
    a = np.frombuffer(r.stdout, np.uint8)
    if not len(a): return []
    lum = a[: len(a) // (64 * 36) * 64 * 36].reshape(-1, 64 * 36).mean(1) / 255
    out = []
    for i in range(2, len(lum) - 2):
        ctx = np.r_[lum[i - 2:i], lum[i + 1:i + 3]]
        if lum[i] > 0.75 and lum[i] - ctx.min() > 0.3:
            t = round(i / 6, 2)
            if not out or t - out[-1] > 1: out.append(t)
    return out


def structure(path, dur):
    """Structure cues that are not hard cuts, so a one-take film still has a grammar: fades to and from black, black
    holds, and local changes over a stable picture (panels, cards, captions, a logo) with how they arrive (a pop of
    one or two frames, a slower reveal, or a scale-in whose changed area grows). 6 fps, 96x54 greyscale."""
    import numpy as np
    W, H, FPS = 96, 54, 6
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", f"fps={FPS},scale={W}:{H},format=gray", "-f", "rawvideo", "-"],
                       capture_output=True)
    a = np.frombuffer(r.stdout, np.uint8)
    n = len(a) // (W * H)
    if n < 3: return {"fades": [], "black": [], "overlays": []}
    fr = a[: n * W * H].reshape(n, H, W).astype(np.float32) / 255
    m = fr.mean((1, 2)); t = lambda i: round(i / FPS, 2)
    lit = (fr > 0.08).reshape(n, -1).mean(1)            # share of pixels that are not black
    black = lit < 0.005
    fades, holds, overlays, i = [], [], [], 0
    while i < n:
        if not black[i]: i += 1; continue
        j = i
        while j + 1 < n and black[j + 1]: j += 1
        holds.append({"start": t(i), "end": t(j + 1)})
        k = i   # walk back over a steady fall in brightness
        while k > 0 and m[k - 1] > m[k] + 0.002: k -= 1
        if i > 0: fades.append({"kind": "fade_out" if i - k >= 2 else "cut_to_black", "start": t(k), "end": t(i)})
        k = j
        while k + 1 < n and m[k + 1] > m[k] + 0.002: k += 1
        if j + 1 < n:
            if lit[min(n - 1, k + 1)] < 0.3:   # only a small element lights up: a reveal over black (a logo, a line), not a fade
                grow = lit[j + 1: k + 2]
                overlays.append({"start": t(j + 1), "end": t(k + 1), "dir": "in", "over": "black",
                                 "kind": "scale-in" if len(grow) >= 3 and grow[-1] > 1.3 * grow[0] else ("pop" if k - j <= 2 else "reveal")})
            else:
                fades.append({"kind": "fade_in" if k - j >= 2 else "cut_from_black", "start": t(j + 1), "end": t(k + 1)})
        i = j + 1
    # local change: an 8 x 6 grid of cells; a frame is active when a few cells change hard while the rest stay calm
    gy, gx = 6, 8
    cells = np.abs(np.diff(fr, axis=0)).reshape(n - 1, gy, H // gy, gx, W // gx).mean((2, 4))
    act = []
    for f in range(n - 1):
        c = cells[f]; med = float(np.median(c)); hot = c > max(0.04, 3 * med + 0.02)
        fading = abs(m[f + 1] - m[f]) > 0.02 and hot.mean() > 0.6
        act.append(hot if (0 < hot.sum() <= 0.6 * hot.size and not fading and not black[f] and not black[f + 1]) else None)
    f = 0
    while f < len(act):
        if act[f] is None: f += 1; continue
        g, areas = f, []
        union = np.zeros((gy, gx), bool)
        while g < len(act) and (act[g] is not None or (g + 1 < len(act) and act[g + 1] is not None)):
            if act[g] is not None: union |= act[g]; areas.append(int(act[g].sum()))
            g += 1
        ys, xs = np.nonzero(union)
        y0, y1, x0, x1 = ys.min() * H // gy, (ys.max() + 1) * H // gy, xs.min() * W // gx, (xs.max() + 1) * W // gx
        frames = g - f
        half = max(1, len(areas) // 2)
        kind = "pop" if frames <= 2 else ("scale-in" if len(areas) >= 3 and np.mean(areas[half:]) > 1.3 * np.mean(areas[:half]) else "reveal")
        if not any(o.get("over") == "black" and o["start"] - 0.4 <= t(f + 1) <= o["end"] + 0.4 for o in overlays):
            overlays.append({"start": t(f + 1), "end": t(g + 1), "kind": kind,   # diff f sits between frames f and f + 1
                             "region": [round(x0 / W, 2), round(y0 / H, 2), round(x1 / W, 2), round(y1 / H, 2)],
                             "area": round(float(union.mean()), 2)})
        f = g + 1
    overlays.sort(key=lambda x: x["start"])
    return {"fades": fades, "black": holds, "overlays": overlays, "luma_6fps": [round(float(x), 3) for x in m]}


def stillness(path, dur):
    """Share of time in which nothing moves, measured on the content, not the whole frame: a small element moving on
    a near-black ground barely moves the whole-frame mean, so the raw method calls it still. Content = pixels that are
    ever lit above the ground; a step is still when under 0.5 percent of the content changes by more than the clip's
    own noise floor. 6 fps, 160x90 greyscale. The raw whole-frame ratio (mean difference under 2 of 255) is kept for
    comparison."""
    import numpy as np
    W, H, FPS = 160, 90, 6
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", f"fps={FPS},scale={W}:{H},format=gray", "-f", "rawvideo", "-"],
                       capture_output=True)
    a = np.frombuffer(r.stdout, np.uint8)
    n = len(a) // (W * H)
    if n < 3: return None
    fr = a[: n * W * H].reshape(n, H, W).astype(np.float32) / 255
    ground = float(np.percentile(fr, 10))
    content = (fr.max(axis=0) > ground + 0.06)
    if content.mean() < 0.01: content = np.ones((H, W), bool)
    d = np.abs(np.diff(fr, axis=0))
    noise = float(np.percentile(d[:, content], 50)) if content.any() else 0.0
    thr = max(3 * noise, 8 / 255)
    changed = (d[:, content] > thr).mean(axis=1)
    still = changed < 0.005
    calm = changed < 0.06   # held: nothing, or only a small element (a cursor, a pulse), moves
    raw = d.reshape(n - 1, -1).mean(axis=1) < 2 / 255
    runs, i = [], 0
    while i < len(calm):
        if calm[i]:
            j = i
            while j + 1 < len(calm) and calm[j + 1]: j += 1
            if (j - i + 1) / FPS >= 0.5: runs.append([round(i / FPS, 2), round((j + 1) / FPS, 2)])
            i = j + 1
        else:
            i += 1
    return {"ratio": round(float(still.mean()), 2), "calm_ratio": round(float(calm.mean()), 2),
            "raw_frame_ratio": round(float(raw.mean()), 2), "content_area": round(float(content.mean()), 2),
            "noise_floor": round(noise * 255, 2), "calm_runs": sorted(runs, key=lambda x: x[0] - x[1])[:5],
            "method": ("ratio: 1/6 s steps where under 0.5 percent of the content changes beyond max(3x the noise floor, 8 of 255); "
                       "calm: under 6 percent (only a small element moves); runs: the longest calm stretches of 0.5 s or more")}


def palette(path, dur):
    """The film's palette with roles and shares: 8 colour clusters over 24 frames, near-duplicates merged. Roles: the
    ground (the largest share), the text (the lightest near-neutral), the accent (the most saturated colour that is
    not tiny), the rest secondary. Per-shot `dominant` colours stay as they were; on a dark ground they are mostly
    the ground, so the recipe reads this instead."""
    try:
        import numpy as np, cv2
    except ImportError:
        return None
    cap = cv2.VideoCapture(path); px = []
    for k in range(24):
        cap.set(cv2.CAP_PROP_POS_MSEC, (k + .5) / 24 * dur * 1000); ok, f = cap.read()
        if ok: px.append(cv2.resize(f, (160, max(2, round(160 * f.shape[0] / f.shape[1])))).reshape(-1, 3))
    cap.release()
    if not px: return None
    data = np.concatenate(px).astype(np.float32)
    crit = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 1.0)
    _, lab, cen = cv2.kmeans(data, 8, None, crit, 3, cv2.KMEANS_PP_CENTERS)
    share = np.bincount(lab.ravel(), minlength=8) / len(lab)
    cl = []
    for k in np.argsort(-share):
        b, g, r = (float(x) for x in cen[k])
        hit = next((c for c in cl if np.hypot(np.hypot(c["rgb"][0] - r, c["rgb"][1] - g), c["rgb"][2] - b) < 24), None)
        if hit: hit["share"] += float(share[k]); continue
        cl.append({"rgb": (r, g, b), "share": float(share[k])})
    for c in cl:
        r, g, b = (x / 255 for x in c["rgb"]); mx, mn = max(r, g, b), min(r, g, b)
        c["lum"] = 0.299 * r + 0.587 * g + 0.114 * b; c["sat"] = (mx - mn) / mx if mx > 0 else 0.0; c["chroma"] = mx - mn
    roles = {}
    roles["ground"] = max(cl, key=lambda c: c["share"])
    light = [c for c in cl if c is not roles["ground"] and c["sat"] < 0.25 and c["lum"] > 0.55]
    if light: roles["text"] = max(light, key=lambda c: c["lum"])
    vivid = [c for c in cl if c is not roles["ground"] and c["share"] >= 0.003 and c["sat"] > 0.4]
    if vivid: roles["accent"] = max(vivid, key=lambda c: c["chroma"])
    out = []
    for c in sorted(cl, key=lambda c: -c["share"]):
        role = next((k for k, v in roles.items() if v is c), "secondary")
        out.append({"hex": "#%02X%02X%02X" % tuple(int(round(x)) for x in c["rgb"]), "share": round(c["share"], 3), "role": role})
    return out


def boundaries(path, cuts):
    """What each detected shot boundary is: a hard cut changes the picture in one frame; a dissolve, morph, wipe or
    fast move spreads the change over several. Frame-to-frame difference over 0.3 s each side, 160 px greyscale."""
    try:
        import numpy as np, cv2
    except ImportError:
        return []
    cap = cv2.VideoCapture(path); fps = cap.get(cv2.CAP_PROP_FPS) or 30; out = []
    for t in cuts:
        cap.set(cv2.CAP_PROP_POS_MSEC, max(0, t - 0.3) * 1000); prev, d = None, []
        for _ in range(int(0.6 * fps) + 1):
            ok, f = cap.read()
            if not ok: break
            g = cv2.cvtColor(cv2.resize(f, (160, 90)), cv2.COLOR_BGR2GRAY).astype("float32") / 255
            if prev is not None: d.append(float(np.abs(g - prev).mean()))
            prev = g
        if len(d) < 3: continue
        share = max(d) / (sum(d) + 1e-6)
        out.append({"t": round(t, 3), "kind": "cut" if share >= 0.5 and max(d) > 0.04 else "gradual", "peak_share": round(share, 2)})
    cap.release()
    return out


def cache_key(src):
    """Local file → its size plus the first and last 4 MB (the same file copied into another project hits)."""
    h = hashlib.sha1(f"v{ANALYZE_VERSION}|".encode())
    size = os.path.getsize(src); h.update(str(size).encode())
    with open(src, "rb") as f:
        h.update(f.read(4 << 20))
        if size > 8 << 20: f.seek(-(4 << 20), 2); h.update(f.read())
    return h.hexdigest()[:16]


# ---------------------------------------------------------------- After Effects projects (.aep, .aet): read, never run
# A RIFX file: big-endian chunks (4-byte id, 4-byte size, body, padded to even), LIST chunks hold a 4-byte type and
# children. Layouts below were checked on a real project against its tutorial's recorded timeline (2026-10-29).
AEP_TRANSFORM = {"ADBE Anchor Point": "Anchor Point", "ADBE Position": "Position", "ADBE Position_0": "X Position",
                 "ADBE Position_1": "Y Position", "ADBE Position_2": "Z Position", "ADBE Scale": "Scale",
                 "ADBE Orientation": "Orientation", "ADBE Rotate X": "X Rotation", "ADBE Rotate Y": "Y Rotation",
                 "ADBE Rotate Z": "Rotation", "ADBE Opacity": "Opacity"}
AEP_SPATIAL = {"ADBE Anchor Point", "ADBE Position"}
AEP_INTERP = {1: "linear", 2: "bezier", 3: "hold"}
AEP_TIME_SCALE = 30720   # 30 x 1024: raw key time / 1024 was 1/30 s in the measured project (lesson of 2026-10-29)
AEP_NOT_DECODED = [
    "effect parameters: keyed effect properties are listed by match name and key count, their meaning is not read",
    "masks, shape paths and shape-layer contents", "text layer contents, fonts and styles",
    "parenting, 3D switches, blend modes, track mattes and motion blur switches", "markers and time remapping values",
    "footage paths beyond the file name; solids' names and colours"]


def rifx_tree(data, start, end, depth, notes):
    """[(id, list type or None, body start, body end, children or None)] for the chunks between start and end."""
    out, pos = [], start
    while pos + 8 <= end:
        cid = data[pos:pos + 4]
        size = int.from_bytes(data[pos + 4:pos + 8], "big")
        b0, b1 = pos + 8, pos + 8 + size
        if b1 > end:
            notes.append(f"chunk {cid.decode('latin-1')} at byte {pos} runs past its parent; read up to the parent's end")
            b1 = end
        if cid in (b"LIST", b"RIFX") and b1 - b0 >= 4:
            if depth >= 64:
                notes.append(f"LIST nested deeper than 64 at byte {pos}: not read")
                kids = []
            else:
                kids = rifx_tree(data, b0 + 4, b1, depth + 1, notes)
            out.append((cid, data[b0:b0 + 4], b0 + 4, b1, kids))
        else:
            out.append((cid, None, b0, b1, None))
        pos = b0 + size + (size & 1)
    return out


def _u(data, a, n, signed=False):
    return int.from_bytes(data[a:a + n], "big", signed=signed)


def _utf8(data, node):
    return data[node[2]:node[3]].split(b"\0")[0].decode("utf-8", "replace").strip()


def _child(node, cid, ltype=None):
    return next((c for c in node[4] or [] if c[0] == cid and (ltype is None or c[1] == ltype)), None)


def _name(data, node):
    c = _child(node, b"Utf8")
    return _utf8(data, c) if c else ""


def aep_footage_name(data, item):
    """A footage item's file name from its Pin/Als2/alas record (JSON with the full path; only the base name is kept)."""
    pin = _child(item, b"LIST", b"Pin ")
    als = _child(pin, b"LIST", b"Als2") if pin else None
    alas = _child(als, b"alas") if als else None
    if not alas:
        return ""
    try:
        full = json.loads(data[alas[2]:alas[3]].split(b"\0")[0].decode("utf-8")).get("fullpath") or ""
    except (ValueError, AttributeError):
        return ""
    return re.split(r"[\\/]", full)[-1]


def aep_key(raw, dims, spatial, scale):
    """One keyframe: 8 head bytes (time u32, in and out interpolation codes) then big-endian doubles. Non-spatial:
    values, in speeds, in influences, out speeds, out influences (5 per dimension). Spatial: 6 ease doubles, values,
    in tangents, out tangents. A record of another size keeps its time and says the values were not decoded."""
    t = _u(raw, 0, 4)
    k = {"t_raw": t, "t_s": round(t / scale, 4),
         "interp": [AEP_INTERP.get(raw[4], f"code {raw[4]}"), AEP_INTERP.get(raw[5], f"code {raw[5]}")]}
    n = (len(raw) - 8) // 8
    d = struct.unpack(f">{n}d", raw[8:8 + 8 * n])
    r = lambda xs: [round(x, 4) for x in xs]
    if dims and spatial and n == 6 + 3 * dims:
        k.update(value=r(d[6:6 + dims]), speed_in=round(d[2], 4), influence_in=round(d[3], 4), speed_out=round(d[4], 4),
                 influence_out=round(d[5], 4), tangent_in=r(d[6 + dims:6 + 2 * dims]), tangent_out=r(d[6 + 2 * dims:6 + 3 * dims]))
    elif dims and n == 5 * dims:
        k.update(value=r(d[:dims]) if dims > 1 else round(d[0], 4), speed_in=r(d[dims:2 * dims]), influence_in=r(d[2 * dims:3 * dims]),
                 speed_out=r(d[3 * dims:4 * dims]), influence_out=r(d[4 * dims:5 * dims]))
    else:
        k["not_decoded"] = f"values of a {len(raw)}-byte key record for {dims or 'unknown'} dimensions"
    return k


def aep_property(data, node, match, scale):
    """A tdbs property: dimensions and spatial flag (tdb4), static value (cdat), keys (list: lhd3 + ldat), expression."""
    tdb4, cdat, expr = _child(node, b"tdb4"), _child(node, b"cdat"), _child(node, b"Utf8")
    dims = _u(data, tdb4[2] + 2, 2) if tdb4 and tdb4[3] - tdb4[2] >= 8 else 0
    spatial = bool(data[tdb4[2] + 7] & 0x02) if tdb4 and tdb4[3] - tdb4[2] >= 8 else match in AEP_SPATIAL
    out = {"match": match}
    if expr:
        out["expression"] = _utf8(data, expr)[:300]
    lst = _child(node, b"LIST", b"list")
    head = _child(lst, b"lhd3") if lst else None
    body = _child(lst, b"ldat") if lst else None
    if head and body and head[3] - head[2] >= 20:
        count, size = _u(data, head[2] + 10, 2), _u(data, head[2] + 16, 4)
        if count and size >= 8 and body[3] - body[2] >= count * size:
            out["keys"] = [aep_key(data[body[2] + i * size: body[2] + (i + 1) * size], dims, spatial, scale) for i in range(count)]
    if "keys" not in out and cdat and dims:
        n = min(dims, (cdat[3] - cdat[2]) // 8)
        vals = [round(x, 4) for x in struct.unpack(f">{n}d", data[cdat[2]:cdat[2] + 8 * n])]
        out["static"] = vals if dims > 1 else vals[0]
    return out


def aep_walk_props(data, node, path, scale, found):
    """Every property under node: a tdmn chunk names the LIST that follows it; groups (tdgp and others) are walked."""
    pending = None
    for c in node[4] or []:
        if c[0] == b"tdmn":
            pending = data[c[2]:c[3]].split(b"\0")[0].decode("latin-1")
        elif c[0] == b"LIST" and pending:
            if c[1] == b"tdbs":
                found.append((path + [pending], aep_property(data, c, pending, scale)))
            elif pending != "ADBE Group End":
                aep_walk_props(data, c, path + [pending], scale, found)
            pending = None
        elif c[0] == b"LIST" and c[1] == b"tdgp":   # a layer's root group has no match name before it
            aep_walk_props(data, c, path, scale, found)


def aep_read(path):
    with open(path, "rb") as f:
        data = f.read()
    if data[:4] != b"RIFX":
        raise ValueError("not an After Effects project: the file does not start with RIFX (an .aepx is XML: save the project as .aep)")
    notes = []
    if data[8:12] != b"Egg!":
        notes.append(f"form {data[8:12].decode('latin-1')!r} is not 'Egg!' (an After Effects project): read as far as it goes")
    tree = rifx_tree(data, 12, len(data), 0, notes)
    items = []

    def collect(nodes):
        for c in nodes:
            if c[4] is None:
                continue
            if c[1] == b"Item":
                items.append(c)
            collect(c[4])
    collect(tree)
    by_id, comps, footage, folders = {}, [], [], []
    for it in items:
        idta = _child(it, b"idta")
        if not idta or idta[3] - idta[2] < 20:
            continue
        kind, iid = _u(data, idta[2], 2), _u(data, idta[2] + 16, 4)
        name = _name(data, it) or (aep_footage_name(data, it) if kind == 7 else "")
        by_id[iid] = name or f"(unnamed item {iid})"
        (comps if kind == 4 else footage if kind == 7 else folders if kind == 1 else []).append((iid, name, it))
    report = {"file": os.path.basename(path), "kind": "after-effects-project", "bytes": len(data),
              "reader": "analyze.py (best effort; nothing in the file is run)",
              "units": "times in seconds = raw / time_scale; Opacity and Scale are fractions (1.0 = 100 percent); rotation in "
                       "degrees; position and anchor point in pixels; influence as a fraction of the key span (0.33 = 33 percent)",
              "compositions": [], "footage": [{"id": i, "name": n or f"(unnamed item {i})"} for i, n, _ in footage],
              "folders": [n for _, n, _ in folders if n], "not_decoded": list(AEP_NOT_DECODED), "notes": notes}
    for iid, name, it in comps:
        c = {"id": iid, "name": name or f"(unnamed comp {iid})"}
        cdta, scale = _child(it, b"cdta"), AEP_TIME_SCALE
        if cdta and cdta[3] - cdta[2] >= 158:
            b = cdta[2]
            fdiv, fdvd, sdvd, sdiv = _u(data, b + 4, 4), _u(data, b + 8, 4), _u(data, b + 44, 4), _u(data, b + 48, 4)
            c.update(width=_u(data, b + 140, 2), height=_u(data, b + 142, 2),
                     fps=round(fdvd / fdiv, 3) if fdiv else _u(data, b + 156, 2),
                     duration_s=round(sdvd / sdiv, 3) if sdiv else None,
                     background="#" + data[b + 52:b + 55].hex())
            scale = sdiv or AEP_TIME_SCALE
        else:
            c["not_decoded"] = "comp settings (no readable cdta chunk)"
        c["time_scale"] = scale
        layers = []
        for order, lay in enumerate((x for x in it[4] if x[1] == b"Layr"), 1):
            L, lscale = {"order_in_file": order}, scale
            ldta = _child(lay, b"ldta")
            if ldta and ldta[3] - ldta[2] >= 44:
                b = ldta[2]
                src = _u(data, b + 40, 4)
                lscale = _u(data, b + 16, 4) or scale
                for key, at in (("start_s", 12), ("in_s", 20), ("out_s", 28)):
                    div = _u(data, b + at + 4, 4)
                    L[key] = round(_u(data, b + at, 4, signed=True) / div, 4) if div else None
                if src:
                    L["source"] = by_id.get(src, f"(item {src})")
            L["name"] = _name(data, lay) or L.get("source") or f"(layer {order})"
            found = []
            aep_walk_props(data, lay, [], lscale, found)
            transform, other, exprs = {}, [], 0
            for path_, prop in found:
                m = prop["match"]
                if "ADBE Transform Group" in path_ and m in AEP_TRANSFORM:
                    prop["name"] = AEP_TRANSFORM[m]
                    transform[m] = {k: v for k, v in prop.items() if k != "match"}
                else:
                    if prop.get("keys"):
                        other.append({"property": m, "group": " > ".join(path_[:-1][-2:]), "keys": len(prop["keys"])})
                    exprs += 1 if prop.get("expression") else 0
            L["transform"] = transform
            if other:
                L["other_keyed"] = other
            if exprs:
                L["other_expressions"] = exprs
            layers.append(L)
        c["layers"] = layers
        report["compositions"].append(c)
    if not comps:
        notes.append("no composition was found in the file")
    return report


def aep_main(src, out):
    try:
        rep = aep_read(src)
    except (OSError, ValueError) as e:
        sys.exit(f"could not read {src}: {e}")
    dst = os.path.join(out, "aep.json")
    with open(dst, "w", encoding="utf-8") as f:
        json.dump(rep, f, ensure_ascii=False, indent=1)
    for c in rep["compositions"]:
        print(f"comp    {c['name']}: {c.get('width')}x{c.get('height')} {c.get('fps')} fps {c.get('duration_s')} s, {len(c['layers'])} layers")
        for L in c["layers"]:
            keyed = [f"{p['name']} {len(p['keys'])} keys" for p in L["transform"].values() if p.get("keys")]
            if keyed or L.get("other_keyed"):
                print(f"  layer {L['name']}: {', '.join(keyed) or 'no transform keys'}"
                      + (f"; other keyed: {len(L['other_keyed'])}" if L.get("other_keyed") else ""))
    for n in rep["notes"]:
        print("note   ", n)
    print("not decoded:", "; ".join(rep["not_decoded"]))
    print("wrote", dst)


def is_aep(src):
    if os.path.splitext(src)[1].lower() in (".aep", ".aet"):
        return True
    try:
        with open(src, "rb") as f:
            head = f.read(12)
        return head[:4] == b"RIFX" and head[8:12] == b"Egg!"
    except OSError:
        return False


def summary(rep, out):
    info, crop, au = rep["video"], rep["crop"], rep["audio"]
    print(f"video   {info['width']}x{info['height']} {info['fps']}fps {info['duration']:.1f}s" + (f"  crop → {crop['w']}x{crop['h']} ({crop['note']})" if crop else ""))
    if rep.get("orientation"): print(f"orient  {rep['orientation']}")
    if rep.get("crop_refused"): print(f"crop    {rep['crop_refused']}")
    if rep.get("stillness"): print(f"still   {rep['stillness']['ratio']} (calm {rep['stillness']['calm_ratio']}) on the content ({rep['stillness']['content_area']} of the frame); raw whole-frame {rep['stillness']['raw_frame_ratio']}")
    print(f"shots   {rep['pacing']}")
    if rep.get("look_summary"): print(f"look    {rep['look_summary']}")
    if au.get("error"):
        print("audio   CRASHED:", au["error"])
    elif au.get("skipped"):
        print("audio   skipped:", au["skipped"])
    elif au.get("silent"):
        print("audio   SILENT:", au["note"])
    elif au.get("present"):
        print(f"audio   {au['bpm']} bpm, first beat {au['first_beat']}s, noise floor {au['noise_floor_db']} dB, phase_inverted={au['phase_inverted']}")
        print(f"best 30s windows: {[c['start'] for c in au['best_30s_starts']]}")
        print(f"peak candidates (build → hit): {[(p['t'], p['kind']) for p in au.get('peak_candidates', [])]}")
    else:
        print("audio   none")
    if rep.get("flashes"): print(f"flash frames: {rep['flashes']}")
    st = rep.get("structure") or {}
    if st.get("fades") or st.get("overlays"):
        print(f"structure fades {[(x['kind'], x['start']) for x in st['fades']]}, overlays {[(x['kind'], x['start']) for x in st['overlays']][:20]}")
    for x in rep.get("shot_details", [])[:3]:
        print(f"camera  shot {x['shot']}: {x['camera']['kind']} {x['camera']['pace']}, segments {[(g['start'], g['end'], '/'.join(g['kind'])) for g in x['camera'].get('segments', [])]}")
    print("wrote", os.path.join(out, "report.json"))


def main():
    for _stream in (sys.stdout, sys.stderr):
        if hasattr(_stream, "reconfigure"):
            _stream.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser()
    ap.add_argument("src"); ap.add_argument("--out", required=True)
    ap.add_argument("--no-cache", action="store_true")
    ap.add_argument("--cache-dir", help="opt-in cache folder; nothing is cached without it")
    ap.add_argument("--no-crop", action="store_true", help="analyse the whole frame: no letterbox or phone-chrome crop")
    ap.add_argument("--rotate", default="auto", choices=["auto", "0", "90", "180", "270"],
                    help="degrees clockwise that make a sideways picture upright; auto turns it only when the orientation check is sure")
    ap.add_argument("--audio-child", help=argparse.SUPPRESS)   # internal: see audio_start
    a = ap.parse_args()
    faulthandler.enable()   # a native crash prints where it happened instead of ending the run without a word
    if a.audio_child:
        audio_child(a.src, a.out, a.audio_child)
        return
    if os.path.isfile(a.src) and is_aep(a.src):   # an After Effects project: read with the standard library only
        os.makedirs(a.out, exist_ok=True)
        aep_main(a.src, a.out)
        return
    if importlib.util.find_spec("numpy") is None:
        sys.exit("analyze.py needs numpy==2.4.6. Install it into a project virtual environment (no question needed: ice-engines engine-choice.md section 7.6: free pinned packages install without a question): "
                 f'python -m pip install -r "{REQUIREMENTS}"')
    for tool in ("ffmpeg", "ffprobe"):
        if not shutil.which(tool):
            sys.exit(f"{tool} is not on PATH. Install FFmpeg (it ships both tools) or set FFMPEG_DIR to the folder "
                     "that holds them, then retry.")
    os.makedirs(a.out, exist_ok=True)
    if not os.path.isfile(a.src):
        fetch(a.src, a.out)   # exits with the local-file message
    key = cache_key(a.src); cdir = os.path.join(a.cache_dir, key) if a.cache_dir else None
    if cdir and not a.no_cache and os.path.isfile(os.path.join(cdir, "report.json")):
        shutil.copytree(cdir, a.out, dirs_exist_ok=True)
        with open(os.path.join(a.out, "report.json"), encoding="utf-8") as f: rep = json.load(f)
        print(f"cache   same reference analysed before ({key}): reused")
        summary(rep, a.out); return
    missing = missing_optional()
    src = fetch(a.src, a.out)
    info = probe(src)
    crop = orient = crop_note = None; rot = 0; base = src; bw, bh = info["width"], info["height"]
    if info["width"]:
        orient = orientation(src, info["duration"])
        rot = int(a.rotate) if a.rotate != "auto" else (orient["rotate"] if orient and orient["rotated"] and orient["confidence"] == "high" else 0)
        if orient is not None: orient["applied"] = rot
        if rot:
            base = make_proxy(src, None, a.out, rot, "upright.mp4")
            if rot in (90, 270): bw, bh = bh, bw
        if not a.no_crop:
            crop, kind = detect_crop(base, info["duration"], bw, bh), "letterbox"
            if not crop: crop, kind = ui_strip_crop(base, info["duration"], bw, bh), "ui"
            if crop: crop, crop_note = crop_check(base, info["duration"], bw, bh, crop, kind)
    vid = make_proxy(base, crop, a.out) if crop or info["duration"] > 120 else base
    aud = audio_start(src, info, a.out)   # audio (librosa) in a child process, in parallel with the video work
    cuts = shots(vid) if info["width"] else []
    one_take = bool(info["width"]) and not cuts and "scenedetect" not in missing and info["duration"] > 0
    if one_take: cuts = [[0.0, round(info["duration"], 3)]]   # no hard cut found: the whole film is one shot
    lens = [b - a_ for a_, b in cuts]
    if info["width"]: sheets(vid, info["duration"], cuts, a.out)
    rep = {"source": os.path.basename(src), "input": a.src, "video": info, "crop": crop, "analysed": os.path.basename(vid),
           "orientation": orient, "picture": {"width": bw, "height": bh, "rotate": rot}, **({"crop_refused": crop_note} if crop_note else {}),
           "shots": cuts, "pacing": {"count": len(cuts), "mean_shot_s": round(sum(lens) / len(lens), 2) if lens else None,
                                     "shortest_s": round(min(lens), 2) if lens else None, "longest_s": round(max(lens), 2) if lens else None},
           "audio": audio_finish(aud, src, info, a.out),
           "shot_details": shot_details(vid, cuts, info["duration"]) if info["width"] else []}
    if one_take: rep["pacing"]["one_take"] = True
    if len(cuts) > 1: rep["boundaries"] = boundaries(vid, [a_ for a_, _ in cuts[1:]])
    if info["width"]: rep["flashes"] = flashes(vid, info["duration"]); rep["structure"] = structure(vid, info["duration"]); rep["stillness"] = stillness(vid, info["duration"]); rep["palette"] = palette(vid, info["duration"])
    sd = rep["shot_details"]
    if sd:
        dark = sum(1 for x in sd if x["look"]["dark_ratio"] > 0.5) / len(sd)
        moving = sum(1 for x in sd if x["camera"]["kind"] != ["static"]) / len(sd)   # drift counts as moving
        rep["look_summary"] = {"low_key_shots": round(dark, 2), "moving_camera_shots": round(moving, 2),
                               "mean_brightness": round(sum(x["look"]["brightness"] for x in sd) / len(sd), 3),
                               "camera_kinds": sorted({k for x in sd for k in x["camera"]["kind"]})}
    if rep["audio"].get("bpm") and lens:
        rep["pacing"]["mean_shot_beats"] = round(rep["pacing"]["mean_shot_s"] / rep["audio"]["beat_seconds"], 1)
    with open(os.path.join(a.out, "report.json"), "w", encoding="utf-8") as f:
        json.dump(rep, f, ensure_ascii=False, indent=1)
    if cdir and (missing or rep["audio"].get("error")):
        print("cache   not written: an optional package is missing or the audio analysis crashed, so this analysis is incomplete")
    elif cdir:
        try:   # cache the whole analysis folder (the agents later read source/proxy from it too)
            shutil.copytree(a.out, cdir, dirs_exist_ok=True, ignore=shutil.ignore_patterns("STYLE.md", "route.json", "proposed_style_*", "song", "lyrics"))
        except OSError as e:
            print("cache   not written:", e)
    summary(rep, a.out)
    if not os.path.isfile(os.path.join(a.out, "report.json")):
        sys.exit(f"error: no report.json in {a.out}: the analysis did not finish")
    if rep["audio"].get("error"):
        sys.exit(f"error: report.json was written, but {rep['audio']['error']}. The log is {rep['audio']['log']}; "
                 "tell the user the tempo and beats are missing, and measure them another way before relying on them.")


if __name__ == "__main__":
    main()
