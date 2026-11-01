"""template.py: frame templates, films saved frame for frame so a new brand lands on the same frames.

    python template.py list
    python template.py show <template-id>
    python template.py init <template-id> <project folder> [--force]
    python template.py check <template-id> --render <mp4> [--project <folder>] [--camera] [--json <out>]

A template lives in ../templates/<id>/template.json (format: references/frame-templates.md). It holds the frame lock of a
film the founder approved: size, fps, frame count, cut frames, shots, per-frame camera matrices measured on the
original, letterbox bars per frame, text and icon slots, press frames, the music spec, the SFX map, the voice slots and
the loudness contour. Never the original's audio, images or words.

init writes into the project, all local, no network:
    film/measure/trk_<track>.json   one camera track per file, the engine's format ({anchor, a, b, frames: [{f, m}]})
    film/measure/bars2.json         [frame, top, bottom, left, right, null] per frame
    film/engine.js                  the frame-function engine (kept when present, unless --force)
    ice/reference/<id>/TIMELINE.md  the per-shot table and the locked events, standing in for a measured reference
    ice/reference/<id>/REASONS.md   one row per text, icon and media slot
    ice/plan/template-lock.json     a copy of template.json (the lock the build and check read)
    ice/plan/presses.json           one row per locked press, "built": false until the build shows it

check measures a render against the lock (numpy and ffmpeg; --camera adds opencv and re-tracks each camera path): frame
count, size and fps; each locked hard cut on its frame; loudness (integrated in the band, true peak, the short-term contour as a warning);
the warm turn's saturation; with --project, every press built. Exit 0 when nothing fails, 1 otherwise.
"""
import argparse, json, os, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
TEMPLATES = os.path.normpath(os.path.join(HERE, "..", "templates"))


def load(tid):
    p = os.path.join(TEMPLATES, tid, "template.json")
    if not os.path.isfile(p):
        sys.exit(f"no template '{tid}'; run: python template.py list")
    with open(p, encoding="utf-8") as fh:
        return json.load(fh)


def ids():
    return sorted(d for d in os.listdir(TEMPLATES) if os.path.isfile(os.path.join(TEMPLATES, d, "template.json")))


def cmd_list(_):
    for tid in ids():
        t = load(tid); n = t["names"]; f = t["format"]
        print(f"{tid}: {t['name']} | idea: {n['idea']['name']} | story: {n['story']['name']} | style: {n['style']['name']} "
              f"| genre: {n['video_type']['genre']} | {f['width']}x{f['height']}, {f['fps']} fps, {f['frames']} frames")


def cmd_show(a):
    t = load(a.id); n = t["names"]; f = t["format"]
    print(f"{t['name']} ({t['id']}): {t['summary']}")
    for k in ("idea", "story", "style"):
        print(f"{k}: {n[k]['name']} ({n[k]['id']}): {n[k]['why']}")
    print(f"video type: {n['video_type']['genre']}, {n['video_type']['subtype']}")
    print(f"format: {f['width']}x{f['height']}, {f['fps']} fps, {f['frames']} frames ({f['duration_s']} s)")
    print(f"hard cuts: {', '.join('f%d' % c for c in t['cuts']['hard_cuts'])}; shots {len(t['shots'])}; camera tracks {len(t['camera']['tracks'])}")
    print("presses: " + ", ".join(f"f{p['f']} {p['target']}" for p in t["presses"]["events"]))
    print("story beats: " + "; ".join(t["names"]["story"]["beats"]))
    print(f"credit: {t['credit']}")


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text)


def cmd_init(a):
    t = load(a.id); proj = os.path.abspath(a.project); meas = os.path.join(proj, "film", "measure")
    for name, tr in t["camera"]["tracks"].items():
        frames = [{"f": tr["a"] + i, "m": m} for i, m in enumerate(tr["m"])]
        write(os.path.join(meas, f"trk_{name}.json"), json.dumps({"anchor": tr["anchor"], "a": tr["a"], "b": tr["b"], "frames": frames}))
    bars = [[i] + row + [None] for i, row in enumerate(t["bars"]["per_frame_t_b_l_r"])]
    write(os.path.join(meas, "bars2.json"), json.dumps(bars))
    eng = os.path.join(proj, "film", "engine.js")
    if a.force or not os.path.exists(eng):
        os.makedirs(os.path.dirname(eng), exist_ok=True)
        shutil.copyfile(os.path.join(TEMPLATES, a.id, "engine.js"), eng)
    ref = os.path.join(proj, "ice", "reference", a.id)
    rows = ["| # | frames | story beat | camera, pace | tracks | transition in | picture |", "|---|---|---|---|---|---|---|"]
    for s in t["shots"]:
        c = s["camera"]
        rows.append(f"| {s['id']} | f{s['frames'][0]}-f{s['frames'][1]} | {s['story_beat']} | {c['move']}, {c['pace']} | "
                    f"{', '.join(c['tracks']) or 'none'} | {s['transition_in']} | {s['picture']} |")
    ev = ["| frame | kind | note |", "|---|---|---|"]
    ev += [f"| {c} | cut | locked hard cut |" for c in t["cuts"]["hard_cuts"]]
    ev += [f"| {p['f']} | press | {p['pointer']} on {p['target']} |" for p in t["presses"]["events"]]
    ev += [f"| {s['f'] if 'f' in s else s['frames'][0]} | sound | {s['role']} ({s['pack_type']}) |" for s in t["sound"]["sfx_map"]]
    f = t["format"]
    write(os.path.join(ref, "TIMELINE.md"), "\n".join([
        f"# Timeline: {a.id} (frame template, standing in for a measured reference)",
        f"Source: skills/ice-remake/templates/{a.id}/template.json. {f['width']}x{f['height']}, {f['fps']} fps, {f['frames']} frames. "
        "Frame numbers are 0-based. The lock does not move: only the content inside the slots changes (references/frame-templates.md).",
        "", "## Per-shot table", *rows, "", "## Events", *ev, ""]))
    rr = ["| # | Element | Beat | Frames | Rule | Role |", "|---|---|---|---|---|---|"]
    for s in t["text"]["slots"]:
        rr.append(f"| {s['id']} | text slot | {s['beat']} | f{s['frames'][0]}-f{s['frames'][1]} | {s.get('rule', '')} | {s['role']} |")
    for k in ("brand_glyph", "feature_icon"):
        i = t["icon"][k]; rr.append(f"| {k} | icon slot | | f{i['frames'][0]}-f{i['frames'][1]} | {i['rule']} | |")
    for m in t["assets"]["media_slots"]:
        rr.append(f"| {m['id']} | media slot | | f{m['frames'][0]}-f{m['frames'][1]} | {m['source']} | {m['role']} |")
    write(os.path.join(ref, "REASONS.md"), "\n".join([f"# Element reasons: {a.id} (frame template slots)", "", *rr, ""]))
    os.makedirs(os.path.join(proj, "ice", "plan"), exist_ok=True)
    shutil.copyfile(os.path.join(TEMPLATES, a.id, "template.json"), os.path.join(proj, "ice", "plan", "template-lock.json"))
    pp = os.path.join(proj, "ice", "plan", "presses.json")
    if a.force or not os.path.exists(pp):
        write(pp, json.dumps([dict(p, built=False, evidence="") for p in t["presses"]["events"]], indent=1))
    print(f"init {a.id}: {len(t['camera']['tracks'])} tracks, {len(bars)} bar rows, engine, TIMELINE.md, REASONS.md, "
          f"template-lock.json, presses.json in {proj}")


def ff(args):
    return subprocess.run(["ffmpeg", "-hide_banner", "-nostats", *args], capture_output=True, text=True, encoding="utf-8", errors="replace")


def probe(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-count_frames", "-show_entries",
                        "stream=width,height,r_frame_rate,nb_read_frames", "-of", "json", path], capture_output=True, text=True, encoding="utf-8")
    s = json.loads(r.stdout)["streams"][0]; n, d = s["r_frame_rate"].split("/")
    return int(s["width"]), int(s["height"]), float(n) / float(d), int(s["nb_read_frames"])


def frames(path, w, h, fmt="gray"):
    import numpy as np
    ch = 1 if fmt == "gray" else 3
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", f"scale={w}:{h}", "-fps_mode", "passthrough", "-f", "rawvideo", "-pix_fmt", fmt, "-"], capture_output=True)
    a = np.frombuffer(r.stdout, np.uint8)
    return a.reshape(-1, h, w) if ch == 1 else a.reshape(-1, h, w, 3)


def cut_scores(path):
    import numpy as np
    g = frames(path, 120, 90).astype(np.float32)
    d = np.abs(np.diff(g, axis=0)).mean(axis=(1, 2))  # d[i] = change from frame i to i+1
    return d


def loudness(path):
    r = ff(["-i", path, "-vn", "-af", "ebur128=peak=true", "-f", "null", "-"])
    import re
    tail = r.stderr[r.stderr.rfind("Summary:"):]
    get = lambda k: float(re.search(k + r":\s*(-?[\d.]+)", tail).group(1)) if re.search(k + r":\s*(-?[\d.]+)", tail) else None
    r2 = subprocess.run(["ffmpeg", "-v", "verbose", "-hide_banner", "-nostats", "-i", path, "-vn", "-af", "ebur128", "-f", "null", "-"],
                        capture_output=True, text=True, encoding="utf-8", errors="replace")
    st = []
    for line in r2.stderr.splitlines():
        m = re.search(r"t: ([\d.]+).*S:\s*(-?[\d.]+)", line)
        if m: st.append((float(m.group(1)), float(m.group(2))))
    return {"integrated": get("I"), "lra": get("LRA"), "true_peak": get("Peak")}, st


def track_rms(path, t):
    """Re-track every locked camera track on the render with the measuring tracker; median corner error in px per track."""
    import cv2, numpy as np
    W, H = t["format"]["width"], t["format"]["height"]; k = W / 720; w, h = 720, int(H / k)
    g = frames(path, w, h)
    corners = np.array([[0, 0, 1], [W, 0, 1], [W, H, 1], [0, H, 1]], float).T
    S, Si = np.diag([k, k, 1]), np.diag([1 / k, 1 / k, 1])
    def est(g0, g1, p0):
        if p0 is None or len(p0) < 8: return None, 0
        p1, st, _ = cv2.calcOpticalFlowPyrLK(g0, g1, p0, None, winSize=(31, 31), maxLevel=5)
        ok = st.ravel() == 1
        if ok.sum() < 8: return None, 0
        M, inl = cv2.estimateAffinePartial2D(p0[ok].reshape(-1, 2), p1[ok].reshape(-1, 2), method=cv2.RANSAC, ransacReprojThreshold=1.2, maxIters=5000)
        return (None, 0) if M is None else (np.vstack([M, [0, 0, 1]]), int(inl.sum()))
    def run(tr, step):
        # the measuring tracker (track_shot.py): direct flow from a key frame, re-keyed on the previous frame under 40 inliers
        anc = tr["anchor"]; res = {}; K = g[anc]; KT = np.eye(3); Kp = cv2.goodFeaturesToTrack(K, 900, 0.005, 5); prev = anc
        rng = range(anc + 1, tr["b"] + 1) if step > 0 else range(anc - 1, tr["a"] - 1, -1)
        for f in rng:
            M, n = est(K, g[f], Kp)
            if M is None or n < 40:
                K = g[prev]; KT = res.get(prev, np.eye(3)); Kp = cv2.goodFeaturesToTrack(K, 900, 0.005, 5)
                M, n = est(K, g[f], Kp)
                if M is None: M = np.eye(3)
            res[f] = M @ KT; prev = f
        return res
    out = {}
    for name, tr in t["camera"]["tracks"].items():
        if tr["b"] >= len(g):
            out[name] = None; continue
        res = {tr["anchor"]: np.eye(3)}; res.update(run(tr, 1)); res.update(run(tr, -1)); errs = []
        for i, m in enumerate(tr["m"]):
            got = (S @ res[tr["a"] + i] @ Si) @ corners
            want = np.vstack([np.array(m).reshape(2, 3), [0, 0, 1]]) @ corners
            errs.append(float(np.sqrt(((got[:2] - want[:2]) ** 2).sum(axis=0).mean())))
        out[name] = round(float(np.median(errs)), 2)
    return out


def cmd_check(a):
    import numpy as np
    t = load(a.id); f = t["format"]; c = t["checks"]; rep = {"template": a.id, "render": a.render, "rows": []}
    def row(name, status, value, want):
        rep["rows"].append({"check": name, "status": status, "value": value, "want": want})
    w, h, fps, n = probe(a.render)
    row("frames", "pass" if n == f["frames"] else "fail", n, f["frames"])
    row("size", "pass" if (w, h) == (f["width"], f["height"]) else "fail", f"{w}x{h}", f"{f['width']}x{f['height']}")
    row("fps", "pass" if abs(fps - f["fps"]) < 0.01 else "fail", round(fps, 3), f["fps"])
    d = cut_scores(a.render)
    for cf in c["cuts_on"]:
        i = cf - 1
        if i < 0 or i >= len(d):
            row(f"cut f{cf}", "fail", "outside the render", cf); continue
        lo, hi = max(0, i - 6), min(len(d), i + 7)
        near = np.delete(d[lo:hi], i - lo); base = float(np.median(near)) if len(near) else 0.0
        ok = d[i] >= 8 and d[i] >= 3 * max(base, 1.0) and d[i] == d[lo:hi].max()
        where = int(lo + np.argmax(d[lo:hi]) + 1)
        row(f"cut f{cf}", "pass" if ok else "fail", f"change {d[i]:.1f} (largest near f{where})", "the largest change within 6 frames, 3x the local median")
    has_audio = "Audio" in ff(["-i", a.render]).stderr
    if has_audio:
        L, st = loudness(a.render); lc = c["loudness"]
        lo, hi = lc["integrated_lufs"]
        row("integrated loudness", "pass" if L["integrated"] is not None and lo <= L["integrated"] <= hi else "fail", L["integrated"], f"{lo} to {hi} LUFS")
        row("true peak", "pass" if L["true_peak"] is not None and L["true_peak"] <= lc["true_peak_max"] else "fail", L["true_peak"], f"at most {lc['true_peak_max']}")
        row("loudness range", "info", L["lra"], "free (reference profile)")
        rc = [r for r in t["sound"]["loudness_contour"]["full_mix"] if r[2] > -70]
        dev = [abs(sv - float(np.interp(tt * f["fps"], [r[0] for r in rc], [r[2] for r in rc]))) for tt, sv in st
               if tt * f["fps"] > 30 and sv > -70 and rc[0][0] <= tt * f["fps"] <= rc[-1][0]]
        row("loudness contour", "pass" if dev and max(dev) <= 3 else "warn", round(max(dev), 1) if dev else "not measured", "within 3 LU of the reference contour")
    else:
        row("audio", "fail", "no audio stream", "a mixed track")
    sat_t = c.get("warm_turn_saturation_min")
    if sat_t:
        rgb = frames(a.render, 270, 202, "rgb24").astype(np.float32)
        picks = [i for i in range(600, 741, 20) if i < len(rgb)]
        if picks:
            cc = rgb[picks][:, 37:162, 62:207]; mx = cc.max(axis=3); mn = cc.min(axis=3)
            sat = float(np.where(mx > 0, (mx - mn) / np.maximum(mx, 1) * 255, 0).mean())
            row("warm turn saturation", "pass" if sat >= sat_t else "fail", round(sat), f"at least {sat_t} (centre of f600-f740)")
    if a.project:
        pp = os.path.join(a.project, "ice", "plan", "presses.json")
        if os.path.isfile(pp):
            ps = json.load(open(pp, encoding="utf-8")); miss = [p["f"] for p in ps if not p.get("built")]
            row("presses", "pass" if not miss and len(ps) >= c["presses_min"] else "fail", f"{len(ps) - len(miss)} of {len(ps)} built", f"all {c['presses_min']} locked presses built")
        else:
            row("presses", "fail", "no ice/plan/presses.json", "run init first")
    if a.camera:
        try:
            r = track_rms(a.render, t)
            lim = c["camera_track_median_px_max"]
            for k, v in r.items():
                eye = t["camera"]["tracks"][k].get("check")
                st = "warn" if eye else "pass" if v is not None and v <= lim else "fail"
                row(f"camera {k}", st, v, eye or f"median corner error at most {lim} px")
        except ImportError:
            row("camera", "warn", "not measured: opencv missing", "pip install the ice-remake requirements")
    bad = [r for r in rep["rows"] if r["status"] == "fail"]
    for r in rep["rows"]:
        print(f"{r['status'].upper():5} {r['check']}: {r['value']} (want {r['want']})")
    print("RESULT: " + ("FAIL, " + ", ".join(r["check"] for r in bad) if bad else "PASS"))
    rep["result"] = "fail" if bad else "pass"
    if a.json:
        write(a.json, json.dumps(rep, indent=1))
    return 1 if bad else 0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sp = ap.add_subparsers(dest="cmd", required=True)
    sp.add_parser("list")
    s = sp.add_parser("show"); s.add_argument("id")
    s = sp.add_parser("init"); s.add_argument("id"); s.add_argument("project"); s.add_argument("--force", action="store_true")
    s = sp.add_parser("check"); s.add_argument("id"); s.add_argument("--render", required=True); s.add_argument("--project")
    s.add_argument("--camera", action="store_true"); s.add_argument("--json")
    a = ap.parse_args()
    if a.cmd == "list": cmd_list(a)
    elif a.cmd == "show": cmd_show(a)
    elif a.cmd == "init": cmd_init(a)
    else: sys.exit(cmd_check(a))


if __name__ == "__main__":
    main()
