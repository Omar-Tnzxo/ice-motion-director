#!/usr/bin/env python3
# Adapted from edenfunf/reelmimic (MIT), .claude/skills/video-clone/scripts/motion_check.py.
# Changes: dash characters replaced; the pop note names this skill's strip method; this header; UTF-8 process I/O and
# output on Windows; a clear error when numpy is missing. 2026-10-19 (pilot films): the analysis frame keeps the film's
# aspect ratio; a freeze is a stretch where no region of the frame moves (the most-changed cell decides), not a low
# whole-frame mean, so a small element moving steadily is not a freeze; declared holds (cue-sheet quiet list, hold
# events) are reported apart. 2026-10-29 (Obama trial, lessons L9 and L12): pacing against the reference (longest gap
# between events and events per minute) and depth and camera against the reference, both blocking; --pacing-only runs
# them with the standard library alone (numpy and ffmpeg load only on the video path). 2026-10-29 (0.2.5, craft plan):
# black frames, white flashes and the end cut to black are labelled "exempt frame:A5 by <row>" when an exemption row of
# ice/plan/craft-plan.json covers them (labels only: no check here fails on them). See NOTICE.md.
# Needs: Python 3.11+; on the video path also ffmpeg/ffprobe on PATH (or FFMPEG_DIR) and numpy (pinned in
# requirements.txt). --pacing-only needs neither.
"""motion_check.py: find the motion defects that stills can't show, in a rendered video; check the film's pacing, depth
and camera against its reference.

    python motion_check.py out/video.mp4 --out out/check/motion [--from 0 --to 30] [--events film.events.json]
           [--reference-events ice/reference/<ref-id>/analysis/events.json]
           [--reference-depth ice/reference/<ref-id>/analysis/depth.json] [--depth film.depth.json]
    python motion_check.py --pacing-only --events film.events.json --reference-events <ref events.json>
           [--reference-depth <ref depth.json> --depth film.depth.json] [--duration S] [--fps N] [--out DIR]

Video path. Looks at every frame (downscaled to 192 px wide, aspect ratio kept) and flags:
  freeze  a stretch longer than --freeze seconds (default 1.0) where NO region moves: every cell of a 12 px grid
          changes by less than --cell-eps (default 1.0 of 255) from frame to frame. One small element moving anywhere
          (a bar stretching, a cursor, water) means the frame is alive.
          Declared holds are not freezes: the `quiet` list of ice/plan/cue-sheet.json (found by walking up from the
          video) and {"type": "hold", "t": start, "end": end} entries (or "kind": "hold") in the events file (--events,
          or <video>.events.json next to the render). A freeze inside a declared hold is listed as "declared".
  black   frames that are (almost) black inside the film, and a hard cut to black at the end (no fade).
  flash   (almost) white frames: fine when designed, but they must not hide the moment they cover.
  Labels: a black run, a white flash or the end cut to black that an exemption row of ice/plan/craft-plan.json (found by
  walking up from the video, then the working folder) covers is printed and listed under "exempt" as
  "exempt frame:A5 by <row id> (<source kind>: <source ref>)" (frame-checks.md row A5, flashes and dips; a black run's
  length in seconds is checked against the row's amount); the others print "not exempt". The rule itself: the
  ice-direction skill, references/treatment.md section "Craft plan".
Writes <out>/motion.json and one strip per flag (<out>/<kind>_<time>.jpg, the frames around it); open the strips.
It also lists the hard cuts, to check against the plan's shot list.
Pops (a pose, expression or prop swapped with no in-between) are NOT detected here: frame differences can't tell them
from wipes and caption changes (tested on real runs). Find them by looking: a 12 fps strip of consecutive frames over
every action (see references/frame-checks.md).

Pacing against the reference (lesson L9, references/motion-density.md "Pacing against the reference"), with
--reference-events. One events format for the reference and the film:
  {"duration": <s>, "fps": <optional>, "events": [{"t": <s>, "kind": "cut|camera|graphic|flash|sound|hold",
   "end": <s, holds only>, "note": "..."}]}
  The kind may sit under "type" (the older film events file); a bare list of events is read when the duration comes
  from elsewhere (--duration, or the video on the video path). An event is an authored visual change: hold entries and
  sound entries are not events. The film's events: --events, else <video>.events.json next to the render.
  Longest gap = the largest difference between consecutive event times, with 0 and the duration as bounds; events per
  minute = events / duration x 60; both are always recomputed from the events (stored longest_gap, longest_gap_at and
  events_per_minute fields are ignored, whatever their shape). The film fails when its longest gap is over the reference's x 1.10 plus one
  frame (1 / fps; 0.04 s when no fps is known), or its events per minute are under the reference's x 0.90. A declared
  hold never excuses a gap. Result: a "pacing" block (reference and film, each with longest_gap, longest_gap_at as the
  pair [start, end] of that gap in seconds, and events_per_minute; ok; blocking: true; reasons), printed as JSON and written to <out>/pacing.json with --out.

Depth and camera against the reference (lesson L12, references/motion-density.md "Depth and camera against the
reference"), with --reference-depth and the film's --depth (else <video>.depth.json next to the render). One format:
  {"camera_moving_share": <0..1>, "layers": <n>, "parallax_ratio": <n or null>, "push_through": <n>,
   "elements_3d": ["card_field", "flag", "globe", "extruded_text", "wrapped_text", "cards_in_space", "set",
   "other:<word>"], "dof": {"present": true|false, "blur_px": <n or null>}, "triggers": [{"kind", "t", "words"}]}
  When the reference has 3D, 2.5D or camera movement: camera_moving_share, parallax_ratio and push_through of the film
  within 30 percent of the reference's (relative; a value the reference does not have is not asked for), every kind in
  the reference's elements_3d present in the film's, depth of field present when the reference has it. Result: a
  "depth" block of the same shape, printed as JSON and written to <out>/depth-check.json with --out.

Exit codes: 0 when every check run passes (the video checks alone never fail the exit); 1 when the pacing or the depth
check fails (a blocker: the film is not delivered); 2 on bad input (an unreadable or malformed file, no duration).
"""
import argparse, json, os, shutil, subprocess, sys

FFMPEG_FALLBACK = os.environ.get("FFMPEG_DIR", "")
if not shutil.which("ffmpeg") and FFMPEG_FALLBACK and os.path.isdir(FFMPEG_FALLBACK):
    os.environ["PATH"] += os.pathsep + FFMPEG_FALLBACK

np = None   # numpy loads only on the video path (load_numpy), so --pacing-only runs on the standard library alone


def load_numpy():
    global np
    try:
        import numpy
    except ImportError:
        sys.exit("motion_check.py needs numpy==2.4.6 for the video checks (--pacing-only needs none). Install it into a project virtual environment (no question needed: ice-engines engine-choice.md section 7.6: free pinned packages install without a question): "
                 "python -m pip install -r " + os.path.join(os.path.dirname(os.path.abspath(__file__)), "requirements.txt"))
    np = numpy


W, G, C = 192, 8, 12   # analysis width (height follows the aspect ratio); G x G grid for cuts; C px cells for freezes
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from storyboard_lint import project_ice, declared_times, exempt_line, exemption_for, find_craft_plan, load_craft_plan   # noqa: E402  (shared helpers and craft plan reader, standard library)


class BadInput(Exception):
    pass


# ---------------------------------------------------------------- pacing against the reference (lesson L9)
NOT_EVENTS = ("hold", "sound")   # an event is an authored visual change; holds and sound cues are not


def _num(v):
    return float(v) if isinstance(v, (int, float)) and not isinstance(v, bool) else None


def read_json(path, what):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except OSError as e:
        raise BadInput(f"cannot read the {what} {path}: {e.strerror}")
    except ValueError as e:
        raise BadInput(f"the {what} {path} is not valid JSON: {e}")


def read_events(path, what, duration=None, fps=None):
    """One events file -> dict(path, duration, fps, events [(t, kind)], holds [(start, end)]). The kind is read from
    "kind" or "type"; a bare list needs the duration from elsewhere."""
    data = read_json(path, what)
    if isinstance(data, list):
        raw, dur, f = data, None, None
    elif isinstance(data, dict):
        raw, dur, f = data.get("events"), _num(data.get("duration")), _num(data.get("fps"))
    else:
        raw, dur, f = None, None, None
    if not isinstance(raw, list):
        raise BadInput(f"the {what} {path} has no events list")
    dur = dur if dur and dur > 0 else duration
    if not dur or dur <= 0:
        raise BadInput(f"the {what} {path} has no duration: write \"duration\" in the file, or pass --duration")
    events, holds = [], []
    for e in raw:
        if not isinstance(e, dict) or _num(e.get("t")) is None: continue
        kind = str(e.get("kind") or e.get("type") or "").strip().lower()
        t = _num(e["t"])
        if kind == "hold":
            end = _num(e.get("end"))
            if end is not None: holds.append((t, end))
        elif kind not in NOT_EVENTS and 0 <= t <= dur:
            events.append((t, kind or "event"))
    return {"path": path, "duration": dur, "fps": f or fps, "events": sorted(events), "holds": sorted(holds)}


def pacing_numbers(ev):
    """Longest gap (with 0 and the duration as bounds), where it starts, events per minute."""
    times = [0.0] + [t for t, _ in ev["events"]] + [ev["duration"]]
    gap, at = max(((b - a, a) for a, b in zip(times, times[1:])), key=lambda g: g[0], default=(ev["duration"], 0.0))   # first longest
    return {"path": ev["path"], "duration": round(ev["duration"], 3), "events": len(ev["events"]),
            "longest_gap": round(gap, 3), "longest_gap_at": [round(at, 3), round(at + gap, 3)],
            "events_per_minute": round(len(ev["events"]) / ev["duration"] * 60, 2)}


def pacing_check(ref, film):
    r, f = pacing_numbers(ref), pacing_numbers(film)
    fps = film["fps"] or ref["fps"]
    frame = 1.0 / fps if fps else 0.04
    max_gap = r["longest_gap"] * 1.10 + frame
    min_epm = r["events_per_minute"] * 0.90
    reasons = []
    if f["longest_gap"] > max_gap + 1e-9:
        a, b = f["longest_gap_at"]
        held = [h for h in film["holds"] if h[0] < b and h[1] > a]
        reasons.append(f"longest gap without an event {f['longest_gap']:g} s ({a:g}-{b:g} s) is over the limit {max_gap:.3f} s "
                       f"(reference longest gap {r['longest_gap']:g} s x 1.10 + one frame)"
                       + (": a declared hold does not excuse it" if held else ""))
    if f["events_per_minute"] < min_epm - 1e-9:
        reasons.append(f"{f['events_per_minute']:g} events per minute is under the limit {min_epm:.2f} "
                       f"(reference {r['events_per_minute']:g} x 0.90)")
    return {"reference": r, "film": f,
            "limits": {"max_gap": round(max_gap, 3), "min_events_per_minute": round(min_epm, 2), "frame": round(frame, 4)},
            "ok": not reasons, "blocking": True, "reasons": reasons,
            "rule": "references/motion-density.md, \"Pacing against the reference\": cleared only by changed material "
                    "re-checked, or the user's own words accepting a slower pace, logged in ice/DIRECTION.md"}


# ---------------------------------------------------------------- depth and camera against the reference (lesson L12)
DEPTH_VALUES = ("camera_moving_share", "parallax_ratio", "push_through")


def read_depth(path, what):
    d = read_json(path, what)
    if not isinstance(d, dict):
        raise BadInput(f"the {what} {path} is not a JSON object")
    kinds = d.get("elements_3d") or []
    dof = d.get("dof") if isinstance(d.get("dof"), dict) else {}
    return {"path": path, "camera_moving_share": _num(d.get("camera_moving_share")), "layers": _num(d.get("layers")),
            "parallax_ratio": _num(d.get("parallax_ratio")), "push_through": _num(d.get("push_through")),
            "elements_3d": sorted({str(k).strip().lower() for k in kinds if str(k).strip()}) if isinstance(kinds, list) else [],
            "dof": bool(dof.get("present")), "dof_blur_px": _num(dof.get("blur_px")),
            "triggers": [t for t in d.get("triggers") or [] if isinstance(t, dict)]}


def depth_check(ref, film):
    has = bool(ref["elements_3d"] or ref["dof"] or any((ref[k] or 0) > 0 for k in DEPTH_VALUES) or (ref["layers"] or 0) > 1)
    show = lambda d: {k: d[k] for k in ("path", "camera_moving_share", "layers", "parallax_ratio", "push_through", "elements_3d", "dof")}
    out = {"reference": show(ref), "film": show(film) if film else None, "ok": True, "blocking": True, "reasons": [],
           "rule": "references/motion-density.md, \"Depth and camera against the reference\": cleared only by changed "
                   "material re-checked"}
    if not has:
        out["note"] = "the reference has no 3D, 2.5D or camera movement: nothing to carry over"
        return out
    reasons = out["reasons"]
    if film is None:
        reasons.append("the film's depth file is missing: write <render>.depth.json (or pass --depth) from the plan and the build")
    else:
        for k in DEPTH_VALUES:
            rv, fv = ref[k], film[k]
            if not rv: continue
            if fv is None:
                reasons.append(f"{k}: the reference has {rv:g}, the film has none")
            elif abs(fv - rv) > 0.30 * rv + 1e-9:
                reasons.append(f"{k}: film {fv:g} against reference {rv:g}, more than 30 percent apart "
                               f"(allowed {rv * 0.7:.3g} to {rv * 1.3:.3g})")
        missing = [k for k in ref["elements_3d"] if k not in film["elements_3d"]]
        if missing:
            reasons.append("3D or depth element(s) of the reference missing in the film: " + ", ".join(missing))
        if ref["dof"] and not film["dof"]:
            reasons.append("the reference has depth of field, the film has none")
    out["ok"] = not reasons
    return out


def write_block(out_dir, name, block):
    if not out_dir: return
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, name), "w", encoding="utf-8") as f:
        json.dump(block, f, indent=1, ensure_ascii=False)


def print_block(title, block, stream=None):
    stream = stream or sys.stdout
    print(f"{title}: {'PASS' if block['ok'] else 'FAIL (blocking: the film is not delivered)'}", file=stream)
    for r in block["reasons"]:
        print("  " + r, file=stream)


def beside(video, suffix):
    if not video: return None
    return next((c for c in (video + suffix, os.path.splitext(video)[0] + suffix) if os.path.isfile(c)), None)


def reference_checks(a, film_events_path, film_depth_path, video_duration=None, video_fps=None):
    """Runs the pacing and depth checks the flags ask for. -> ({name: block}, failed?)."""
    blocks = {}
    if a.reference_events:
        ref = read_events(a.reference_events, "reference events file")
        if not film_events_path or not os.path.isfile(film_events_path):
            raise BadInput("the pacing check needs the film's events: pass --events, or write <render>.events.json next to the render")
        fps = a.fps or video_fps
        film = read_events(film_events_path, "film events file", a.duration or video_duration, fps)
        blocks["pacing"] = pacing_check(ref, film)
        write_block(a.out, "pacing.json", blocks["pacing"])
    if a.reference_depth:
        ref = read_depth(a.reference_depth, "reference depth file")
        film = read_depth(film_depth_path, "film depth file") if film_depth_path and os.path.isfile(film_depth_path) else None
        blocks["depth"] = depth_check(ref, film)
        write_block(a.out, "depth-check.json", blocks["depth"])
    return blocks, any(not b["ok"] for b in blocks.values())


# ---------------------------------------------------------------- video path (numpy and ffmpeg)
def probe(path):
    """-> (fps, analysis height). The analysis frame is W px wide and keeps the film's aspect ratio."""
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate",
                        "-of", "csv=p=0", path], capture_output=True, text=True, encoding="utf-8", errors="replace")
    parts = (r.stdout.strip().splitlines() or ["16,9,24/1"])[0].strip(",").split(",")
    w, h = int(parts[0]), int(parts[1])
    n, d = parts[2].split("/")
    return float(n) / float(d), max(G * 2, int(round(h * W / w / 2)) * 2)


def probe_duration(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    try:
        return float(r.stdout.strip().splitlines()[0])
    except (IndexError, ValueError):
        return None


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


def video_check(a):
    load_numpy()
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
    ev = a.events or beside(a.video, ".events.json")
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
    # labels from the craft plan's exemption rows (frame:A5, flashes and dips); no new fail
    plan_path = find_craft_plan(os.path.dirname(os.path.abspath(a.video))) or find_craft_plan(os.getcwd())
    plan = load_craft_plan(plan_path) if plan_path else None
    end_t = round(a.a + (len(lum) - 1) / fps, 3)
    hits = [("black", (b["from"], b["to"]), round(b["to"] - b["from"] + 1 / fps, 3)) for b in rep["black"]] + \
           [("white flash", w, None) for w in white] + ([("end cut to black", (max(a.a, end_t - 0.5), end_t), None)] if end_hard_black else [])
    rep["exempt"] = []
    for kind, at, value in hits:
        row = exemption_for(plan, "frame:A5", t=at, value=value) if plan else None
        rep["exempt"].append({"kind": kind, "at": list(at) if isinstance(at, tuple) else at,
                              "label": exempt_line("frame:A5", row) if row else "not exempt"})
    if plan is not None:
        rep["craft_plan"] = str(plan_path)
    for z in freezes: strip(a.video, (z["from"] + z["to"]) / 2, fps, os.path.join(a.out, f"freeze_{z['from']:.2f}.jpg"))
    for b in rep["black"]: strip(a.video, b["from"], fps, os.path.join(a.out, f"black_{b['from']:.2f}.jpg"))
    blocks, failed = {}, False
    if a.reference_events or a.reference_depth:
        blocks, failed = reference_checks(a, ev, a.depth or beside(a.video, ".depth.json"), probe_duration(a.video), fps)
        rep.update(blocks)
    with open(os.path.join(a.out, "motion.json"), "w", encoding="utf-8") as f: json.dump(rep, f, indent=1)
    print(f"cuts {len(cuts)}  freezes {len(freezes)}  black {len(rep['black'])}  white {len(white)}  end_hard_black {end_hard_black}")
    for z in freezes: print(f"  freeze {z['from']:.2f}-{z['to']:.2f}s ({z['s']}s): no region of the frame moves")
    for z in declared: print(f"  declared hold, still {z['from']:.2f}-{z['to']:.2f}s ({z['s']}s): not a freeze")
    for x in rep["exempt"]:
        at = x["at"]
        print(f"  {x['kind']} {at[0]:.2f}-{at[1]:.2f}s: {x['label']}" if isinstance(at, list) else f"  {x['kind']} {at:.2f}s: {x['label']}")
    if holds: print(f"  declared holds read from {', '.join(hsrc)}: " + ", ".join(f"{s:g}-{e:g}s" for s, e, _ in holds))
    for name, b in blocks.items(): print_block(name, b)
    print("wrote", os.path.join(a.out, "motion.json"))
    return 1 if failed else 0


def main():
    ap = argparse.ArgumentParser(description="Motion defects on a render; pacing, depth and camera against the reference.")
    ap.add_argument("video", nargs="?", default=None); ap.add_argument("--out", default=None)
    ap.add_argument("--from", dest="a", type=float, default=0); ap.add_argument("--to", dest="b", type=float, default=0)
    ap.add_argument("--freeze", type=float, default=1.0)
    ap.add_argument("--cell-eps", type=float, default=1.0, help="a cell changing by at least this (0-255) counts as motion")
    ap.add_argument("--events", default=None, help="the film's events file: holds, and the events the pacing check reads (default: <video>.events.json if present)")
    ap.add_argument("--reference-events", default=None, help="the reference's events.json: run the pacing check (lesson L9)")
    ap.add_argument("--reference-depth", default=None, help="the reference's depth.json: run the depth and camera check (lesson L12)")
    ap.add_argument("--depth", default=None, help="the film's depth file (default: <video>.depth.json if present)")
    ap.add_argument("--pacing-only", action="store_true", help="no video: run only the reference checks, standard library only")
    ap.add_argument("--duration", type=float, default=None, help="film duration in seconds, when its events file has none")
    ap.add_argument("--fps", type=float, default=None, help="film frame rate, when its events file has none")
    a = ap.parse_args()
    for _stream in (sys.stdout, sys.stderr):
        if hasattr(_stream, "reconfigure"):
            _stream.reconfigure(encoding="utf-8", errors="replace")
    try:
        if a.pacing_only:
            if not (a.reference_events or a.reference_depth):
                print("--pacing-only needs --reference-events and/or --reference-depth", file=sys.stderr); return 2
            blocks, failed = reference_checks(a, a.events or beside(a.video, ".events.json"), a.depth or beside(a.video, ".depth.json"))
            print(json.dumps(blocks, indent=1, ensure_ascii=False))
            for name, b in blocks.items(): print_block(name, b, sys.stderr)
            return 1 if failed else 0
        if not a.video or not a.out:
            ap.print_usage(sys.stderr)
            print("the video path needs a video and --out (or use --pacing-only)", file=sys.stderr); return 2
        return video_check(a)
    except BadInput as e:
        print(f"motion_check.py: {e}", file=sys.stderr); return 2


if __name__ == "__main__":
    sys.exit(main())
