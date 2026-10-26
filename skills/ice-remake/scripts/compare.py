# Adapted from edenfunf/reelmimic (MIT, Copyright (c) 2026 ReelMimic contributors; see LICENSE-reelmimic.txt). Changes: explicit --analysis/--plan/--video/--out paths instead of one fixed project layout; our shots matched by index instead of zip (a shot too short to measure no longer shifts every later pair); shebang dropped; dash characters replaced; UTF-8 console output and JSON files closed after use (BOM tolerated) for Windows; images written through analyze.imwrite so non-ASCII Windows paths work; a clear message naming the pinned packages when numpy or OpenCV is missing; usage on one line (no POSIX line continuation).
"""compare.py: put every shot of our film next to the reference shot it was planned from, with the numbers that matter.

    python compare.py --analysis <ice>/reference/<ref-id>/analysis --plan <ice>/plan/shots.json --video <our-render.mp4> --out <ice>/review/remake/compare

Reads <analysis>/report.json (reference, from analyze.py) and the plan JSON (each shot's "ref_shot": the reference
shot number it maps to, and start_s/end_s). Analyses our video with the same measurements, then writes into --out:
    compare_<id>.jpg   reference frames (top row) vs ours (bottom row), 3 moments each, with the stats
    compare.json       per shot: reference vs ours: camera kind/pace/speed, brightness, contrast, dark ratio, colourfulness
    compare_all.jpg    every pair at mid-shot on one sheet
Open the images and score each shot. Numbers flag, eyes decide.
"""
import argparse, json, os, sys
try:
    import numpy as np, cv2
except ImportError as exc:
    sys.exit(f"compare.py needs numpy==2.4.6 and opencv-python-headless==4.10.0.84 (missing: {exc.name}). Install them "
             'into a project virtual environment after the user agrees: python -m pip install -r "'
             + os.path.join(os.path.dirname(os.path.abspath(__file__)), "requirements.txt") + '"')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from analyze import shot_details, imwrite  # same measurements for both films


def load_json(path):
    with open(path, encoding="utf-8-sig") as f:
        return json.load(f)


def grab(path, t, w=480):
    cap = cv2.VideoCapture(path); cap.set(cv2.CAP_PROP_POS_MSEC, max(0, t) * 1000); ok, f = cap.read(); cap.release()
    if not ok: return np.zeros((round(w * 9 / 16), w, 3), np.uint8)
    return cv2.resize(f, (w, round(w * f.shape[0] / f.shape[1])))


def fit(img, w, h):
    canvas = np.zeros((h, w, 3), np.uint8); s = min(w / img.shape[1], h / img.shape[0])
    im = cv2.resize(img, (max(1, int(img.shape[1] * s)), max(1, int(img.shape[0] * s))))
    y, x = (h - im.shape[0]) // 2, (w - im.shape[1]) // 2; canvas[y:y + im.shape[0], x:x + im.shape[1]] = im; return canvas


def label(img, text, y=18):
    cv2.rectangle(img, (0, y - 16), (img.shape[1], y + 6), (0, 0, 0), -1)
    cv2.putText(img, text, (6, y), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (235, 235, 235), 1, cv2.LINE_AA); return img


def main():
    for _stream in (sys.stdout, sys.stderr):
        if hasattr(_stream, "reconfigure"):
            _stream.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser()
    ap.add_argument("--analysis", required=True, help="reference analysis folder written by analyze.py")
    ap.add_argument("--plan", required=True, help="plan JSON with shots[].id, start_s, end_s, ref_shot")
    ap.add_argument("--video", required=True, help="our rendered film")
    ap.add_argument("--out", required=True, help="folder for compare_*.jpg and compare.json")
    a = ap.parse_args(); A = a.analysis
    rep = load_json(os.path.join(A, "report.json"))
    plan = load_json(a.plan)
    ref_video = os.path.join(A, rep.get("analysed", "source.mp4"))
    if not os.path.exists(ref_video): ref_video = os.path.join(A, rep.get("source", "source.mp4"))
    ours = a.video
    ref_shots = {d["shot"]: d for d in rep.get("shot_details", [])}
    spans = [[s["start_s"], s["end_s"]] for s in plan["shots"]]
    our_by_shot = {d["shot"]: d for d in shot_details(ours, spans, spans[-1][1])}   # keyed by 1-based shot index
    out_dir = a.out; os.makedirs(out_dir, exist_ok=True)
    W, H = 400, 225; rows = []; result = []
    for idx, s in enumerate(plan["shots"], 1):
        od = our_by_shot.get(idx)
        if od is None:
            print(f"{s['id']}: too short to measure, compare by eye"); continue
        rn = s.get("ref_shot"); rd = ref_shots.get(rn)
        top, bot = [], []
        for k in (0.2, 0.5, 0.8):
            t_o = s["start_s"] + (s["end_s"] - s["start_s"]) * k; bot.append(fit(grab(ours, t_o, W), W, H))
            if rd: top.append(fit(grab(ref_video, rd["start"] + (rd["end"] - rd["start"]) * k, W), W, H))
            else: top.append(np.full((H, W, 3), 25, np.uint8))
        rl = rd and f"REF #{rn}  {'/'.join(rd['camera']['kind'])} {rd['camera']['pace']}  bright {rd['look']['brightness']}  dark {rd['look']['dark_ratio']}" or "REF: none mapped"
        ol = f"OURS {s['id']}  {'/'.join(od['camera']['kind'])} {od['camera']['pace']}  bright {od['look']['brightness']}  dark {od['look']['dark_ratio']}"
        top[0] = label(top[0], rl); bot[0] = label(bot[0], ol)
        pair = np.vstack([np.hstack(top), np.hstack(bot)])
        imwrite(os.path.join(out_dir, f"compare_{s['id']}.jpg"), pair, [cv2.IMWRITE_JPEG_QUALITY, 88])
        rows.append(np.hstack([top[1], bot[1]]))
        result.append({"id": s["id"], "ref_shot": rn, "ref": rd and {"camera": rd["camera"], "look": rd["look"]}, "ours": {"camera": od["camera"], "look": od["look"]}})
    if rows:
        imwrite(os.path.join(out_dir, "compare_all.jpg"), np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 85])
    with open(os.path.join(out_dir, "compare.json"), "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=1)
    for r in result:
        rc, oc = (r["ref"] or {}).get("camera", {}), r["ours"]["camera"]
        flag = "" if not rc or rc.get("pace") == oc.get("pace") or (rc.get("pace") != "still" and oc.get("pace") != "still") else "  ← motion mismatch"
        print(f"{r['id']} ↔ ref #{r['ref_shot']}: ours {oc.get('kind')} {oc.get('pace')} vs ref {rc.get('kind')} {rc.get('pace')}{flag}")
    print("wrote", out_dir)


if __name__ == "__main__":
    main()
