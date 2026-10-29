# Adapted from edenfunf/reelmimic (MIT, Copyright (c) 2026 ReelMimic contributors; see LICENSE-reelmimic.txt). Changes: explicit --analysis/--plan/--video/--out paths instead of one fixed project layout; our shots matched by index instead of zip (a shot too short to measure no longer shifts every later pair); shebang dropped; dash characters replaced; UTF-8 console output and JSON files closed after use (BOM tolerated) for Windows; images written through analyze.imwrite so non-ASCII Windows paths work; a clear message naming the pinned packages when numpy or OpenCV is missing; usage on one line (no POSIX line continuation). 2026-10-29 (0.2.6, pace on the render): our shots are the film's own detected cuts (analyze.shots, the detector the reference was measured with), not the plan's spans, each mapped to the plan shot holding its middle; the stats contract of shot-mapping.md section 4 is checked on both sides and written to contract.json; exit 1 outside the contract, 2 on bad input or a missing package.
"""compare.py: put every shot of our film next to the reference shot it was planned from, with the numbers that matter,
and check the stats contract.

    python compare.py --analysis <ice>/reference/<ref-id>/analysis --plan <ice>/plan/shots.json --video <our-render.mp4> --out <ice>/review/remake/compare

Reads <analysis>/report.json (reference, from analyze.py) and the plan JSON (each shot's "ref_shot": the reference
shot number it maps to, and start_s/end_s). Detects our film's own cuts with the same detector as the reference
(analyze.py shots: PySceneDetect ContentDetector, threshold 22) and measures each detected shot with the same functions;
a detected shot takes the plan shot that holds its middle, and through it the reference shot. Writes into --out:
    compare_<id>.jpg   reference frames (top row) vs ours (bottom row), 3 moments each, with the stats (one per detected
                       shot: <id> is the plan shot's id, with -2, -3 when a plan shot holds more than one detected shot)
    compare.json       per detected shot: reference vs ours: camera kind/pace/speed, brightness, contrast, dark ratio,
                       colourfulness
    contract.json      the stats contract: each stat, reference and ours, the allowed range, ok, and the reasons
    compare_all.jpg    every pair at mid-shot on one sheet
Open the images and score each shot. Numbers flag, eyes decide; the contract decides the exit.

The stats contract (the ice-remake skill, references/shot-mapping.md section 4), within plus or minus 30 percent of the
reference (a share also within plus or minus 0.05, so a share near zero is not held to a hundredth):
    mean_shot_s           mean detected shot length (report.json pacing.mean_shot_s); not compared when the reference
                          has fewer than 3 detected shots (noted)
    mean_shot_beats       the same in beats, when the reference has it and the plan's music.bpm is set
    low_key_shots         share of shots whose dark ratio is over 0.5 (look_summary.low_key_shots)
    moving_camera_shots   share of shots whose camera is not static (look_summary.moving_camera_shots)
    stillness_ratio       analyze.py stillness on both films, when the reference has it
    camera_pace           per mapped shot: the same pace class, or a camera speed within 30 percent of the reference
                          shot's (a class boundary between two close speeds is not a mismatch)
The text-only card share is judged with the ice-remake skill, references/measuring.md section 3, not here.
A stat outside its range passes only through an exemption row of ice/plan/craft-plan.json lifting "contract:<stat>"
with source kind user or style and its reason logged in ice/DIRECTION.md (row format: the ice-direction skill,
references/treatment.md section "Craft plan"); it prints "exempt contract:<stat> by <row id> (<kind>: <ref>)".

Exit codes: 0 within the contract; 1 outside it (blocking at 07 after assembly); 2 on bad input or a missing package.
"""
import argparse, importlib, importlib.util, json, os, sys
try:
    import numpy as np, cv2
except ImportError as exc:
    print(f"compare.py needs numpy==2.4.6 and opencv-python-headless==4.10.0.84 (missing: {exc.name}). Install them "
          'into a project virtual environment (no question needed: ice-engines engine-choice.md section 7.6: free pinned packages install without a question): python -m pip install -r "'
          + os.path.join(os.path.dirname(os.path.abspath(__file__)), "requirements.txt") + '"', file=sys.stderr)
    sys.exit(2)
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from analyze import probe, shot_details, shots, stillness, imwrite  # same measurements for both films

BAND = 0.30          # the stats contract: within plus or minus 30 percent
SHARE_FLOOR = 0.05   # a share is also allowed plus or minus 0.05
MIN_REF_SHOTS = 3    # fewer detected reference shots: no shot-length statistic
LIFT_KINDS = ("user", "style")   # who may lift a contract stat (the reference cannot excuse a departure from itself)


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


def craft_plan_reader(start):
    """(plan, exemption_for, exempt_line) from the ice-qa skill's shared reader, or (None, None, None) without it."""
    qa = os.path.normpath(os.path.join(HERE, "..", "..", "ice-qa", "scripts"))
    if not os.path.isfile(os.path.join(qa, "storyboard_lint.py")):
        return None, None, None
    sys.path.insert(0, qa)
    try:
        lint = importlib.import_module("storyboard_lint")   # a sibling skill's script, loaded by name
    except Exception:   # noqa: BLE001  (the shared reader mid-change: no exemption applies, and the report says so)
        return None, None, None
    return lint.load_craft_plan(start), lint.exemption_for, lint.exempt_line


def within(ours, ref, share=False):
    tol = max(BAND * abs(ref), SHARE_FLOOR if share else 0.0)
    return abs(ours - ref) <= tol + 1e-9, [round(ref - tol, 3), round(ref + tol, 3)]


def plan_shot_for(plan_shots, a, b):
    """Index of the plan shot that holds the middle of [a, b], else the nearest one."""
    mid = (a + b) / 2
    for k, s in enumerate(plan_shots):
        if s.get("start_s", 0) <= mid < s.get("end_s", 0):
            return k
    return min(range(len(plan_shots)), key=lambda k: min(abs(plan_shots[k].get("start_s", 0) - mid),
                                                         abs(plan_shots[k].get("end_s", 0) - mid))) if plan_shots else None


def contract(rep, plan, ours_d, our_spans, our_still, pairs):
    """The stats contract rows: [{stat, reference, ours, allowed, ok, note}] and the reasons."""
    rows, reasons = [], []
    pace = rep.get("pacing") or {}
    look = rep.get("look_summary") or {}
    n_ref = pace.get("count") or 0
    ours_mean = sum(b - a for a, b in our_spans) / len(our_spans)

    def add(stat, ref, mine, share=False, note=None):
        if ref is None or mine is None:
            rows.append({"stat": stat, "reference": ref, "ours": mine, "ok": None, "note": note or "not measured on both sides"})
            return
        ok, rng = within(mine, ref, share)
        rows.append({"stat": stat, "reference": ref, "ours": round(mine, 3), "allowed": rng, "ok": ok, **({"note": note} if note else {})})
        if not ok:
            reasons.append(f"{stat}: ours {mine:.3g} against reference {ref:.3g}, outside {rng[0]:.3g} to {rng[1]:.3g}")

    if pace.get("mean_shot_s") is None:
        rows.append({"stat": "mean_shot_s", "reference": None, "ours": round(ours_mean, 3), "ok": False,
                     "note": "the reference has no detected shots: run analyze.py again with scenedetect==0.6.7 installed"})
        reasons.append("mean_shot_s: the reference was analysed without shot detection")
    elif n_ref < MIN_REF_SHOTS:
        rows.append({"stat": "mean_shot_s", "reference": pace["mean_shot_s"], "ours": round(ours_mean, 3), "ok": None,
                     "note": f"the reference has {n_ref} detected shot(s): too few for a shot-length statistic"})
    else:
        add("mean_shot_s", pace["mean_shot_s"], ours_mean)
        bpm = ((plan.get("music") or {}).get("bpm") or 0)
        if pace.get("mean_shot_beats") and bpm:
            add("mean_shot_beats", pace["mean_shot_beats"], ours_mean / (60.0 / bpm))
    if ours_d:
        low = sum(1 for x in ours_d if x["look"]["dark_ratio"] > 0.5) / len(ours_d)
        moving = sum(1 for x in ours_d if x["camera"]["kind"] != ["static"]) / len(ours_d)
    else:
        low = moving = None
    add("low_key_shots", look.get("low_key_shots"), low, share=True)
    add("moving_camera_shots", look.get("moving_camera_shots"), moving, share=True)
    ref_still = (rep.get("stillness") or {}).get("ratio")
    if ref_still is not None:
        add("stillness_ratio", ref_still, (our_still or {}).get("ratio"), share=True)
    bad = []
    for p in pairs:
        rc, oc = (p["ref"] or {}).get("camera") or {}, p["ours"]["camera"]
        if not rc: continue
        rs, os_ = rc.get("speed") or 0.0, oc.get("speed") or 0.0
        if rc.get("pace") != oc.get("pace") and abs(os_ - rs) > BAND * max(rs, 0.006) + 1e-9:
            bad.append(f"{p['id']} {oc.get('pace')} against ref #{p['ref_shot']} {rc.get('pace')}")
    rows.append({"stat": "camera_pace", "reference": "pace class per mapped shot", "ours": f"{len(bad)} mismatch(es)",
                 "ok": not bad, "mismatches": bad})
    if bad:
        reasons.append("camera_pace: " + "; ".join(bad))
    rows.append({"stat": "text_card_share", "ok": None, "note": "judged with references/measuring.md section 3, not by this script"})
    return rows, reasons


def main():
    for _stream in (sys.stdout, sys.stderr):
        if hasattr(_stream, "reconfigure"):
            _stream.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser(description="Our film against the reference shot by shot, and the stats contract.")
    ap.add_argument("--analysis", required=True, help="reference analysis folder written by analyze.py")
    ap.add_argument("--plan", required=True, help="plan JSON with shots[].id, start_s, end_s, ref_shot")
    ap.add_argument("--video", required=True, help="our rendered film")
    ap.add_argument("--out", required=True, help="folder for compare_*.jpg, compare.json and contract.json")
    a = ap.parse_args(); A = a.analysis
    if importlib.util.find_spec("scenedetect") is None:
        print("compare.py needs scenedetect==0.6.7 to detect our cuts with the reference's own detector (install it, no "
              "question needed: python -m pip install scenedetect==0.6.7)", file=sys.stderr)
        return 2
    try:
        rep = load_json(os.path.join(A, "report.json"))
        plan = load_json(a.plan)
    except (OSError, ValueError) as e:
        print(f"compare.py: cannot read the analysis or the plan ({e})", file=sys.stderr)
        return 2
    plan_shots = [s for s in plan.get("shots") or [] if isinstance(s, dict)]
    ref_video = os.path.join(A, rep.get("analysed", "source.mp4"))
    if not os.path.exists(ref_video): ref_video = os.path.join(A, rep.get("source", "source.mp4"))
    ours = a.video
    try:
        dur = probe(ours)["duration"]
        our_spans = shots(ours) or [[0.0, round(dur, 3)]]          # no hard cut detected: one take
        ours_d = shot_details(ours, our_spans, dur)                   # keyed by 1-based detected shot index
    except SystemExit as e:          # analyze.probe stops with ffprobe's message
        print(f"compare.py: {e}", file=sys.stderr)
        return 2
    except Exception as e:           # noqa: BLE001  (an unreadable video)
        print(f"compare.py: cannot measure {ours} ({type(e).__name__}: {e})", file=sys.stderr)
        return 2
    ref_shots = {d["shot"]: d for d in rep.get("shot_details", [])}
    our_by_shot = {d["shot"]: d for d in ours_d}
    out_dir = a.out; os.makedirs(out_dir, exist_ok=True)
    W, H = 400, 225; rows = []; result = []; used = {}
    for idx, (sa, sb) in enumerate(our_spans, 1):
        od = our_by_shot.get(idx)
        k = plan_shot_for(plan_shots, sa, sb)
        ps = plan_shots[k] if k is not None else {}
        pid = str(ps.get("id", f"shot{idx}"))
        used[pid] = used.get(pid, 0) + 1
        sid = pid if used[pid] == 1 else f"{pid}-{used[pid]}"
        if od is None:
            print(f"{sid} ({sa:g}-{sb:g} s): too short to measure, compare by eye"); continue
        rn = ps.get("ref_shot"); rd = ref_shots.get(rn)
        top, bot = [], []
        for f in (0.2, 0.5, 0.8):
            bot.append(fit(grab(ours, sa + (sb - sa) * f, W), W, H))
            if rd: top.append(fit(grab(ref_video, rd["start"] + (rd["end"] - rd["start"]) * f, W), W, H))
            else: top.append(np.full((H, W, 3), 25, np.uint8))
        rl = rd and f"REF #{rn}  {'/'.join(rd['camera']['kind'])} {rd['camera']['pace']}  bright {rd['look']['brightness']}  dark {rd['look']['dark_ratio']}" or "REF: none mapped"
        ol = f"OURS {sid} {sa:g}-{sb:g}s  {'/'.join(od['camera']['kind'])} {od['camera']['pace']}  bright {od['look']['brightness']}  dark {od['look']['dark_ratio']}"
        top[0] = label(top[0], rl); bot[0] = label(bot[0], ol)
        pair = np.vstack([np.hstack(top), np.hstack(bot)])
        imwrite(os.path.join(out_dir, f"compare_{sid}.jpg"), pair, [cv2.IMWRITE_JPEG_QUALITY, 88])
        rows.append(np.hstack([top[1], bot[1]]))
        result.append({"id": sid, "plan_shot": ps.get("id"), "start_s": round(sa, 3), "end_s": round(sb, 3), "ref_shot": rn,
                       "ref": rd and {"camera": rd["camera"], "look": rd["look"]}, "ours": {"camera": od["camera"], "look": od["look"]}})
    if rows:
        imwrite(os.path.join(out_dir, "compare_all.jpg"), np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 85])
    with open(os.path.join(out_dir, "compare.json"), "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=1)
    for r in result:
        rc, oc = (r["ref"] or {}).get("camera", {}), r["ours"]["camera"]
        flag = "" if not rc or rc.get("pace") == oc.get("pace") or (rc.get("pace") != "still" and oc.get("pace") != "still") else "  <- motion mismatch"
        print(f"{r['id']} <-> ref #{r['ref_shot']}: ours {oc.get('kind')} {oc.get('pace')} vs ref {rc.get('kind')} {rc.get('pace')}{flag}")
    our_still = stillness(ours, dur) if (rep.get("stillness") or {}).get("ratio") is not None else None
    stats, reasons = contract(rep, plan, ours_d, our_spans, our_still, result)
    planned = [round(float(s["start_s"]), 3) for s in plan_shots[1:] if isinstance(s.get("start_s"), (int, float))]
    detected = [round(sa, 3) for sa, _ in our_spans[1:]]
    exempt, notes = [], []
    if reasons:
        cp, exemption_for, exempt_line = craft_plan_reader(os.path.dirname(os.path.abspath(a.plan)))
        if exemption_for is None:
            notes.append("the ice-qa skill's shared craft plan reader was not found: no exemption row applies")
        kept = []
        for why in reasons:
            stat = why.split(":", 1)[0]
            row = exemption_for(cp, "contract:" + stat, t=(0.0, dur)) if cp and exemption_for else None
            kind = str(((row or {}).get("source") or {}).get("kind", "")).lower()
            if row and kind in LIFT_KINDS:
                exempt.append(exempt_line("contract:" + stat, row))
                continue
            if row:
                notes.append(f"exemption {row.get('id')} ignored for contract:{stat}: a {kind or 'sourceless'} row cannot "
                             f"lift a stats contract stat (allowed: {', '.join(LIFT_KINDS)})")
            kept.append(why)
        reasons = kept
    block = {"ok": not reasons, "blocking": True, "band": BAND, "share_floor": SHARE_FLOOR, "stats": stats,
             "reasons": reasons, "exempt": exempt, "notes": notes,
             "ours": {"shots": len(our_spans), "duration_s": round(dur, 3), "cuts_per_minute": round((len(our_spans) - 1) / dur * 60, 2),
                      "detector": "analyze.py shots (PySceneDetect ContentDetector, threshold 22)"},
             "plan_vs_render": {"planned_cut_times_s": planned, "detected_cut_times_s": detected,
                                "planned_not_detected": [t for t in planned if not any(abs(t - d) <= 0.2 for d in detected)],
                                "detected_not_planned": [d for d in detected if not any(abs(t - d) <= 0.2 for t in planned)],
                                "note": "a planned carried transition (a morph, a match move) is not a hard cut; read these as leads"},
             "rule": "the ice-remake skill, references/shot-mapping.md section 4"}
    with open(os.path.join(out_dir, "contract.json"), "w", encoding="utf-8") as f:
        json.dump(block, f, ensure_ascii=False, indent=1)
    print(f"stats contract: {'PASS' if block['ok'] else 'FAIL (blocking)'} ({len(our_spans)} detected shot(s) in {dur:.1f} s)")
    for r in stats:
        if r.get("ok") is False or r.get("note"):
            nums = "" if r.get("ours") is None and r.get("reference") is None else f" ours {r.get('ours')} vs reference {r.get('reference')}"
            print(f"  {r['stat']}:{nums}" + (f", allowed {r['allowed'][0]:g} to {r['allowed'][1]:g}" if r.get("allowed") else "")
                  + (f" ({r['note']})" if r.get("note") else ""))
    for x in reasons: print("  FAIL " + x)
    for x in exempt + notes: print("  " + x)
    print("wrote", out_dir)
    return 0 if block["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())
