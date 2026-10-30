# /// script
# requires-python = ">=3.11"
# dependencies = ["numpy==2.4.6", "opencv-python-headless==4.10.0.84"]
# ///
# Adapted from alchaincyf/huashu-art-motion (MIT), scripts/film_gate.py. Changes: all messages, comments and labels
# translated from Chinese to English; the demo-film template is no longer a default (pass --template to compare
# against the nearest bundled template or demo render); fix hints point to Ice Motion Director skills instead of
# huashu files; dependency versions pinned (scripts/requirements.txt); dash characters replaced; UTF-8 output on
# Windows and a clear error when numpy or opencv is missing. Measurement logic and thresholds of gates 1-3 unchanged;
# 2026-10-19: declared cuts from the events file or cue sheet, a correlation guard on detected cuts, and gate 4 (the
# richness floor of the film type, read from the ice-film skill). 2026-10-29 (0.2.5, craft plan): gates 1 to 4 read the
# exemption rows of ice/plan/craft-plan.json (film:fast_ratio, film:blank_run_s, film:blue_purple_share,
# film:<richness key>); a covered hit gets the light "exempt" and prints "exempt <rule id> by <row id> (<source>)";
# --allow-blue-purple stays as an alias of a user-sourced row; the film type for the floor may come from the craft plan;
# gate 4 also reads an edit type's coverage floor (motion-density.md section 6.2), the render-side twin of validate-plan.mjs.
# 2026-10-29 (0.2.6, pace on the render): gate 5 reads the film or edit type's "Rhythm row:" line (mean shot range,
# longest shot, first cut, longest event gap; motion-density.md section 6.3) on the detected cuts, which are now kept
# apart from declared cuts; red outside the row, yellow near it; skipped as a gate when the project follows a reference.
# See NOTICE.md.
"""film_gate.py: read a finished mp4 only and measure the "page-flip slideshow" feel. Run before delivery.

Usage:
  python film_gate.py film.mp4 [--json] [--vertical auto|yes|no] [--sub-band 0.15]
                      [--template nearest_template_render.mp4] [--allow-blue-purple "reason"]
                      [--type "film type"] [--events film.events.json]

  python film_gate.py fingerprint check|write --record record.json [--file fingerprints.jsonl]
      the fingerprint check and write of ice-qa references/anti-sameness-gates.md section 3 (no numpy needed):
      check exits 2 when the film repeats an earlier one; write appends an approved film's record.

Exit codes: red 2; yellow or green 0; file unreadable 1.
Needs only ffmpeg/ffprobe, numpy and opencv; it does not depend on any engine, so a film from any source can be measured.

Four gates.
Gate 1: fast-motion frame share (share of in-shot adjacent frame pairs whose mean grey difference is >= 9, at 12 fps,
320 px wide grey, with the bottom subtitle band masked; cut-like frames and crossfade windows are excluded entirely,
so a fast transition never counts). < 0.035 red, < 0.06 yellow.
Calibration (2026-10-09): 13 films the original author judged (9 approved, 4 rejected). It is the only metric that alone
separates the two groups cleanly with margin on both sides: approved minimum 0.068, rejected maximum 0.021; any frame
difference threshold between 6 and 13 separates them. Only 13 samples: read it as "no counterexample in these 13",
not as proven.

Gate 2 is a factual defect that needs no taste calibration: a near-blank mid-section. Excluding the first and last
0.5 s and transition windows (two frames around a cut, whole crossfades), a frame where under 0.2% of pixels have a
gradient > 24 (almost no edge or texture in the whole frame; same 12 fps, 320 px grey, subtitle band masked) is blank;
>= 0.3 s in a row is red, and the report gives every run's timecode. Judged by edges, not by colour: thin lines and
formulas on a black ground and whiteboard strokes are edges and are not flagged; a colour rule ("95% of the frame is
one colour") flagged approved whiteboard films as 3 s blank in the calibration set, so it is not used. None of the 32
calibration films (including the 13 judged ones, 9 approved) had even 2 blank frames in a row. The short-clip
downgrade does not apply to this gate.

Gate 3: blue-purple ground share (the original author: blue and purple gradients are the junk AI palette).
2 fps, 160 px wide RGB; a pixel with hue 225-300 deg, saturation >= 0.30 and value 0.06-0.90 is blue-purple; a frame
with >= 30% such pixels is a blue-purple frame. Share of blue-purple frames >= 0.30 red, >= 0.12 yellow.
Calibration (2026-10-10): across 88 films the 9 approved ones peaked at 0.10, most were 0; rejected films were
0.46-1.00 (a deep purple starfield with a white-shell robot measured 0.94). Flat navy (hue about 210) does not count.
When the brief itself needs blue-purple (the user named it), pass --allow-blue-purple "reason": an alias of a craft plan
exemption row sourced to the user's words; the gate passes as exempt and the reason is written verbatim into the facts
of the delivery report.

Exemption rows (2026-10-29): when ice/plan/craft-plan.json is found (walking up from the film, then the working
folder), a red or yellow of gates 1 to 4 that a row of its "exemptions" list covers gets the light "exempt" and prints
"exempt <rule id> by <row id> (<source kind>: <source ref>)". Rule ids: film:fast_ratio (whole film, value the fast
ratio, a floor: value x (1 + tolerance) at least the amount), film:blank_run_s (every blank run inside the row's shots, each run's
length at most amount x (1 + tolerance)), film:blue_purple_share (every blue-purple span inside the row's shots, the
share at most the amount), film:<richness key> (hero_share, frame_fill, in_shot_motion as floors over the whole film,
shares as fractions; empty_half per span and longest_still on its run as ceilings, in seconds). A share in an amount is
a fraction (0.4) or a percent with its sign (40 %). The film type for gate 4 comes from the craft plan's "type" when no
--type is given and the project names no film type that matches a row (remakes). The rule itself: the ice-direction
skill, references/treatment.md section "Craft plan".

Gate 4 for edit types (added 2026-10-29): when the type is an edit type of the ice-edit skill, its type file's "Coverage
floor" table is read (references/motion-density.md section 6.2): element_events_per_min is gated on the render (the
detected cuts, fades and fast-motion runs plus the authored events of the events file, holds and sound excluded, merged
within 0.3 s), the longest gap between those events is held against the longest_bare_talk_s ceiling as a lead (yellow:
the render cannot tell a speaker scene from B-roll), and trigger_coverage and broll_share are reported as checked on the
plan by the ice-edit skill's validate-plan.mjs. A row lifting film:<measure>, or plan:coverage, lifts them.

Gate 4 (added 2026-10-19 after the pilot films): the richness floor of the film type. The measures (hero_share,
frame_fill, empty_half, in_shot_motion, longest_still) are defined by the ice-motion skill
(references/composition-and-staging.md section 7.2); the floor numbers are read at run time from the ice-film type file's
"Richness floor" table for the film type (--type, else ice/state.json "subtype", else the film_type row of ice/BRIEF.md);
how each is measured: references/motion-density.md section 6.1. Under the lenient number of the owner cell is red,
under the strict one yellow. Declared holds (the cue sheet's quiet list, hold events) and a declared CTA start are read
from ice/plan/cue-sheet.json and the events file. Cuts: when the events file or the cue sheet declares cuts they are the
cuts; detection also needs the luma correlation of the pair to drop under 0.7, so a fast move inside one shot (a door
sliding past) is not a cut. A page flip (a cut with nothing moving in the 0.5 s on either side) is reported apart
from the hard cuts: it is not a visual event and does not end a still run.

Gate 5 (added 2026-10-29, 0.2.6): pace without a reference. The type file of the film type (the ice-film type file, or
the ice-edit type file for an edit type) holds one "Rhythm row:" line with mean_shot_s (a range), max_shot_s,
first_cut_s and max_event_gap_s (each a ceiling "<n>", a range "<a>-<b>", or "-" for not gated, in seconds) and "holds
excuse" or "holds never" (whether a declared hold's span is left out of an event gap). Measured on the detected cuts and
fades, never the declared cuts: shots under 3 analysis frames join the one before; the CTA or end card from its
declared start on is left to gate G3 (look.py); events are the detected cuts (page flips excluded), fades, fast-motion
run starts and the events file's declared visual events, merged within 0.3 s. Red outside the row by more than one
analysis frame (a range with no cut detected is red for first_cut_s), yellow inside it within 10 percent of the
range's width from an edge or of a ceiling. A row lifting film:<key> (source user, reference or style; a content row is
ignored) lifts it. When the project follows a reference (the craft plan names one, or a reference analysis holds
events.json), the reference's numbers win and the row is reported only. The rule: references/motion-density.md
section 6.3.

All other metrics are report-only (yellow at most, never blocking). Still-type metrics (still share, longest still,
longest gap without an event) would flag good "hold, burst, hold" films, so they must never be gates; a yellow only
means "go and look at this stretch".

What it cannot catch: a slideshow with one forced push-in per page (the push-in count gives a yellow to look at),
front-loaded pacing (see the worst 30 s window), page frames and small images on beige, an unclear explanation.
Fast-motion frames do not tell speed apart: a slow 20% push over about 1 s scores about the same as a 0.28 s fast push
(measured 2026-10-12), so do not speed camera moves up just to pass. The yellow "go and look" items and the
independent review are still required.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from storyboard_lint import (FILM_TYPES_DIR, _key, _table_after, declared_times, exempt_line, exemption_for,   # noqa: E402
                             find_craft_plan, load_craft_plan, owner_floor, parse_floor, project_ice,   # shared film-type helpers and craft plan reader
                             resolve_scope_with_plan)

try:
    import cv2
    import numpy as np
except ImportError as _missing:
    if sys.argv[1:2] == ["fingerprint"]:   # the fingerprint check needs no numpy or opencv
        cv2 = np = None
    else:
        sys.exit(f"film_gate.py needs numpy==2.4.6 and opencv-python-headless==4.10.0.84 (missing: {_missing.name}). "
                 "Install them into a project virtual environment (no question needed: ice-engines engine-choice.md section 7.6: free pinned packages install without a question): python -m pip install -r "
                 + os.path.join(os.path.dirname(os.path.abspath(__file__)), "requirements.txt"))

FPS = 12            # analysis frame rate
WIDTH = 320         # analysis width (vertical films are also 320 wide)
SAMPLE_FPS = 2      # sampling rate for the area metrics
DEFAULT_TEMPLATE = None   # pass --template to compare composition against the nearest bundled template or demo render

# ---------------------------------------------------------------- threshold table
# Only metrics with gate=True turn red and make the script exit non-zero; the rest are report-only (yellow at most,
# 'info' gets no light). Direction 'high_bad': larger is more suspicious; 'low_bad': smaller is more suspicious;
# 'info': number only, no judgement.
# Calibration: 2026-10-09, 13 films judged by the original author (9 approved, 4 rejected), see the file header.
# Do not change thresholds casually: a change needs re-calibration on newly judged films.
# Gates hold only metrics that alone separate approved and rejected films with margin on both sides (fast_ratio)
# and factual defects that need no calibration (blank_run_s, blue_purple_share).
# Yellow lines are empirical lines read from the same small set: never a verdict, only "go and look at this stretch".
METRICS = {
    # key: (label, direction, yellow, red, gate, unit)
    "fast_ratio":         ("fast in-shot motion frame share", "low_bad", 0.06, 0.035, True, ""),
    "blank_run_s":        ("near-blank mid-section (longest run)", "high_bad", None, 0.3, True, " s"),
    "blue_purple_share":  ("blue-purple ground share of duration", "high_bad", 0.12, 0.30, True, ""),
    "fast_ratio_worst_window": ("fast-motion share in the worst 30 s window", "low_bad", 0.02, None, False, ""),
    "top10_share":        ("motion concentration (top 10% frames' share of motion)", "info", None, None, False, ""),
    "drift_ratio":        ("slow drift frame share", "high_bad", 0.65, None, False, ""),
    "still_ratio":        ("still frame share (stillness itself is not bad)", "info", None, None, False, ""),
    "longest_still_s":    ("longest continuous still", "high_bad", 6.0, None, False, " s"),
    "event_rate":         ("visual event density", "low_bad", 2.0, None, False, " per 10 s"),
    "max_event_gap_s":    ("longest gap without an event", "high_bad", 15.0, None, False, " s"),
    "dead_bg":            ("dead background (unchanged in shot after camera compensation)", "high_bad", 0.80, None, False, ""),
    "dead_flat":          ("dead and flat empty ground", "high_bad", 0.50, None, False, ""),
    "flat_area":          ("flat colour / empty ground area", "info", None, None, False, ""),
    "flat_light":         ("light empty ground area (beige or white)", "high_bad", 0.35, None, False, ""),
    "page_frame_share":   ("fixed page-frame share of duration", "high_bad", 0.30, None, False, ""),
    "slow_zoom_share":    ("uniform slow zoom share of duration", "high_bad", 0.70, None, False, ""),
    "push_in_per_min":    ("push-ins (lower bound)", "high_bad", 8.0, None, False, " per min"),
    "fast_push_per_min":  ("of which fast pushes within 0.5 s", "info", None, None, False, " per min"),
    "push_in_share":      ("push-in share of push and pull events", "info", None, None, False, ""),
    "slow_cam_share":     ("slow drifting camera share of duration", "info", None, None, False, ""),
    "dissolve_share":     ("crossfade share of transitions", "high_bad", 0.60, None, False, ""),
    "local_fade_ratio":   ("in-place fade share of changing frames", "info", None, None, False, ""),
    "subject_box":        ("largest subject block share of frame", "info", None, None, False, ""),
    "template_sim_share": ("share of duration with the template's composition", "high_bad", 0.30, None, False, ""),
}


# ---------------------------------------------------------------- reading frames
def probe(path):
    out = subprocess.check_output([
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream=width,height:format=duration", "-of", "json", path])
    j = json.loads(out)
    s = j["streams"][0]
    return int(s["width"]), int(s["height"]), float(j["format"].get("duration", 0) or 0)


def decode_gray(path, fps=FPS, width=WIDTH, limit=None):
    W, H, dur = probe(path)
    h = int(round(H * width / W / 2) * 2)
    cmd = ["ffmpeg", "-v", "error"] + (["-t", str(limit)] if limit else []) + ["-i", path, "-vf",
           f"fps={fps},scale={width}:{h}:flags=area", "-pix_fmt", "gray", "-f", "rawvideo", "-"]
    raw = subprocess.check_output(cmd)
    n = len(raw) // (width * h)
    F = np.frombuffer(raw[: n * width * h], np.uint8).reshape(n, h, width)
    return F, (W, H, dur)


# ---------------------------------------------------------------- global camera motion
def pair_transform(a, b):
    """Similarity transform a->b (LK tracking + RANSAC). Returns (M 2x3, inliers, inlier ratio) or (None, 0, 0)."""
    pts = cv2.goodFeaturesToTrack(a, maxCorners=300, qualityLevel=0.01, minDistance=6, blockSize=5)
    if pts is None or len(pts) < 15:
        return None, 0, 0.0
    nxt, st, _ = cv2.calcOpticalFlowPyrLK(a, b, pts, None, winSize=(21, 21), maxLevel=3)
    ok = st.ravel() == 1
    if ok.sum() < 12:
        return None, 0, 0.0
    p0, p1 = pts[ok].reshape(-1, 2), nxt[ok].reshape(-1, 2)
    M, inl = cv2.estimateAffinePartial2D(p0, p1, method=cv2.RANSAC, ransacReprojThreshold=1.0)
    if M is None:
        return None, 0, 0.0
    ni = int(inl.sum())
    return M, ni, ni / len(pts)


def cam_speed(M, w, h, fps):
    """Mean displacement of the transform over a grid of points, in screen widths per second."""
    if M is None:
        return 0.0
    xs, ys = np.meshgrid(np.linspace(0, w, 7), np.linspace(0, h, 7))
    P = np.stack([xs.ravel(), ys.ravel(), np.ones(xs.size)], 1)
    Q = P @ M.T
    return float(np.hypot(*(Q - P[:, :2]).T).mean() / w * fps)


def to3(M):
    return np.vstack([M, [0, 0, 1]]) if M is not None else np.eye(3)


# ---------------------------------------------------------------- main analysis
def analyze(path, sub_band=None, vertical="auto", template=None, verbose=False, event_cuts=None):
    """event_cuts: cut times in seconds declared by the renderer or the cue sheet; when given they are the cuts (detection
    then only marks transition frames), so a cut between two shots on the same ground is not missed and a fast in-shot
    move (a door sliding past) is not counted as a cut."""
    F, (W0, H0, dur) = decode_gray(path)
    is_vert = (H0 > W0) if vertical == "auto" else (vertical == "yes")
    if sub_band is None:
        sub_band = 0.18 if is_vert else 0.15
    n, h, w = F.shape
    hc = int(round(h * (1 - sub_band)))
    F = np.ascontiguousarray(F[:, :hc])          # mask the bottom subtitle band
    h = hc
    if n < 4:
        raise RuntimeError("too few frames to analyse")
    F16 = F.astype(np.int16)

    # --- per frame pair: frame difference, camera transform, residual after compensation
    d = np.zeros(n - 1); loc = np.zeros(n - 1); spd = np.zeros(n - 1); zr = np.zeros(n - 1)
    fade_px = np.zeros(n - 1)
    corr = np.ones(n - 1); mov = np.zeros(n - 1, int)       # luma correlation of the pair; cells still moving after camera compensation
    MC = 8
    mh, mw = h // MC, w // MC
    Ms = []
    for i in range(n - 1):
        a, b = F[i], F[i + 1]
        diff = np.abs(F16[i + 1] - F16[i])
        d[i] = diff.mean()
        moved, wa = False, None
        if d[i] < 0.05:                          # identical: skip the estimate
            Ms.append(None); loc[i] = d[i]; fade_px[i] = -1; continue
        fa, fb = F16[i].astype(np.float32), F16[i + 1].astype(np.float32)
        fa -= fa.mean(); fb -= fb.mean()
        corr[i] = float((fa * fb).sum() / (np.sqrt((fa * fa).sum() * (fb * fb).sum()) + 1e-6))
        M, ni, ir = pair_transform(a, b)
        if M is not None and ni >= 20 and ir >= 0.35:
            s = float(np.hypot(M[0, 0], M[1, 0]))
            moved = abs(np.log(s)) > 1e-4 or abs(M[0, 2]) > 0.05 or abs(M[1, 2]) > 0.05
            if moved:
                wa = cv2.warpAffine(a, M, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
                loc[i] = np.abs(F16[i + 1] - wa.astype(np.int16)).mean()
            else:
                loc[i] = d[i]
            res_ = np.abs(F16[i + 1] - (wa.astype(np.int16) if moved else F16[i]))
            mov[i] = int((res_[: mh * MC, : mw * MC].reshape(mh, MC, mw, MC).mean((1, 3)) >= 2.0).sum())
            spd[i] = cam_speed(M, w, h, FPS)
            zr[i] = np.log(s)
            Ms.append(M)
        else:
            loc[i] = d[i]; Ms.append(None)
            mov[i] = int((diff[: mh * MC, : mw * MC].reshape(mh, MC, mw, MC).mean((1, 3)) >= 2.0).sum())
        # in-place fade: among pixels still changing after camera compensation, the share whose optical flow is
        # almost 0 (the position stays, only brightness changes)
        if d[i] > 0.3 and spd[i] < 0.05:
            base = wa if (Ms[-1] is not None and moved) else a
            ch = np.abs(F16[i + 1] - base.astype(np.int16)) > 10
            if ch.mean() > 0.003:
                fl = cv2.calcOpticalFlowFarneback(base, b, None, 0.5, 3, 15, 3, 5, 1.2, 0)
                mag = np.hypot(fl[..., 0], fl[..., 1])
                fade_px[i] = float((mag[ch] < 0.5).mean())
            else:
                fade_px[i] = -1
        else:
            fade_px[i] = -1
    # --- hard cuts
    # cut_like: every frame with a whole-frame jump not explained by camera motion (includes multi-frame tile, pixel
    # and whip transitions); all are excluded from motion statistics
    # cut: only the first frame of a run of cut_like frames, used to count cuts and split shots
    cut_like = np.zeros(n - 1, bool)
    for i in range(n - 1):
        lo, hi = max(0, i - 6), min(n - 1, i + 7)
        nb = np.concatenate([d[lo:i], d[i + 1:hi]])
        med = np.median(nb) if len(nb) else 0
        # a cut also changes the picture's structure: a fast move inside one shot (a door sliding past) keeps the luma
        # correlation high (0.8 or more measured), a cut drops it (0.3-0.6 measured on the pilot films)
        cut_like[i] = d[i] >= max(8.0, 3 * med + 2) and loc[i] >= 0.6 * d[i] and corr[i] < 0.7
    cut = cut_like & ~np.concatenate([[False], cut_like[:-1]])
    det_cut, det_like = cut.copy(), cut_like.copy()    # the detected cuts, kept apart from declared ones (rhythm rows)
    if event_cuts:
        cut = np.zeros(n - 1, bool)
        for tc_ in event_cuts:
            k = int(round(tc_ * FPS)) - 1
            if 0 <= k < n - 1:
                cut[k] = True; cut_like[k] = True

    # --- crossfades: endpoints differ a lot, every middle frame changes gently, middle frames are linear blends
    diss = []                               # (a, b, center)
    in_diss = np.zeros(n - 1, bool)
    cand = []
    for wdw in (2, 3, 5, 8, 12):            # half window 0.17 s to 1 s
        for t in range(wdw, n - wdw):
            a_, b_ = t - wdw, t + wdw
            if cut_like[a_:b_].any():
                continue
            seg = d[a_:b_]
            if seg.max() > 0.75 * seg.sum() or seg.sum() < 10:
                continue
            Dab = np.abs(F16[b_] - F16[a_])
            if Dab.mean() < 10 or (Dab > 20).mean() < 0.20:   # whole-frame fades; a local title fade covers only a few percent
                continue
            cand.append((t, wdw))
    cand_set = {}
    for t, wdw in cand:
        a_, b_ = t - wdw, t + wdw
        A = F16[a_].astype(np.float32); B = F16[b_].astype(np.float32)
        D = A - B; nd = float((D * D).sum()) + 1e-6
        res, alphas = [], []
        for k in range(a_ + 1, b_):
            X = F16[k].astype(np.float32) - B
            al = float((X * D).sum() / nd)
            r = np.abs(X - al * D).mean() / (np.abs(D).mean() + 1e-6)
            res.append(r); alphas.append(al)
        res = np.array(res); alphas = np.array(alphas)
        mono = np.all(np.diff(alphas) <= 0.08)
        mid = (alphas > 0.15) & (alphas < 0.85)        # middle frames that really are two pictures overlaid
        if (mid.sum() >= 2 and res[mid].mean() < 0.22 and res.mean() < 0.25 and mono
                and alphas[0] > 0.55 and alphas[-1] < 0.45):
            ks = np.arange(a_ + 1, b_)
            tc = int(ks[np.argmin(np.abs(alphas - 0.5))])       # the frame where the blend passes 0.5
            cand_set[(t, wdw)] = (a_, b_, res.mean(), float(np.abs(D).mean()), tc)
    # merge overlaps: largest endpoint difference first (the whole fade inside the window), then residual
    for key in sorted(cand_set, key=lambda k: (-round(cand_set[k][3], 0), cand_set[k][2])):
        a_, b_, _, _, tc = cand_set[key]
        if in_diss[a_:b_].any():
            continue
        in_diss[a_:b_] = True
        diss.append((a_, b_, tc))
    diss.sort()

    # --- shots
    bounds = sorted(set([0] + [i + 1 for i in np.where(cut)[0]] + [c for _, _, c in diss] + [n]))
    shots = []
    for s, e in zip(bounds[:-1], bounds[1:]):
        if e - s >= 3:
            shots.append((s, e))
        elif shots:
            shots[-1] = (shots[-1][0], e)
    if not shots:
        shots = [(0, n)]
    trans = cut_like | in_diss
    n_cut, n_diss = int(cut.sum()), len(diss)
    blank_runs = blank_frames(F, cut_like, in_diss)

    # --- motion distribution (transition frames excluded)
    mv = np.where(trans, np.nan, d)
    good = ~np.isnan(mv)
    mvv = mv[good]
    # Frame difference: mean absolute difference (0-255) at 12 fps, 320 px grey, subtitle band masked.
    # The fast threshold 9 comes from calibration (6-11 all separate approved and rejected; 9 has the most margin);
    # LK camera speed misses 0.3 s fast pushes and alone did not separate the groups, so it is not part of "fast".
    STILL, DRIFT_HI, FAST = 0.30, 3.0, 9.0
    still = mvv < STILL
    fast = mvv >= FAST
    drift = (~still) & (~fast) & (mvv < DRIFT_HI)
    srt = np.sort(mvv)[::-1]
    top10 = srt[: max(1, len(srt) // 10)].sum() / max(srt.sum(), 1e-6)

    # longest continuous still (whole frame sequence, broken by transitions)
    # page flips: a hard cut whose 0.5 s on both sides is still (nothing moves inside either picture) swaps one still
    # page for another. It is counted apart from the hard cuts, it is not a visual event, and it does not end a still run,
    # so a slideshow of still pages cannot pass as an edited film (ice-motion anti-slideshow-and-density section 1).
    half = max(2, int(round(0.5 * FPS)))

    def page_flips(cmask, clike):
        flip = np.zeros(n - 1, bool)          # first frame of a page-flip cut (like cut)
        flip_like = np.zeros(n - 1, bool)     # every cut-like frame of that cut
        for i in np.where(cmask)[0]:
            j = i
            while j + 1 < n - 1 and clike[j + 1]:
                j += 1
            before = [k for k in range(max(0, i - half), i) if not clike[k] and not in_diss[k]]
            after = [k for k in range(j + 1, min(n - 1, j + 1 + half)) if not clike[k] and not in_diss[k]]
            if len(before) >= 2 and len(after) >= 2 and all(d[k] < STILL for k in before + after):
                flip[i] = True
                flip_like[i:j + 1] = True
        return flip, flip_like
    flip, flip_like = page_flips(cut, cut_like)
    det_flip = page_flips(det_cut, det_like)[0] if event_cuts else flip
    n_flip = int(flip.sum())
    n_cut -= n_flip
    st_full = ((d < STILL) & ~trans) | flip_like
    longest = run = longest_at = 0
    for i, v in enumerate(st_full):
        run = run + 1 if v else 0
        if run > longest:
            longest, longest_at = run, i - run + 1

    # events: hard cuts, fades, fast motion runs (a run of fast frames counts once)
    fast_full = np.zeros(n - 1, bool)
    fast_full[good] = fast
    ev_t = [i for i in np.where(cut & ~flip)[0]] + [c for _, _, c in diss]
    prev, fast_starts = False, []
    for i, v in enumerate(fast_full):
        if v and not prev:
            ev_t.append(i)
            fast_starts.append(i)
        prev = v
    ev_t = sorted(ev_t)
    secs = n / FPS
    gaps = np.diff([0] + ev_t + [n - 1]) / FPS
    # merge events repeated within 0.3 s
    ev_m = []
    for t in ev_t:
        if not ev_m or t - ev_m[-1] > 0.3 * FPS:
            ev_m.append(t)
    event_rate = len(ev_m) / secs * 10

    # --- per shot: dead background, slow zoom curve
    dead_w, dead_flat_w, shot_w = [], [], []
    slow_zoom_dur, zoom_totals, slow_cam_dur = 0.0, [], 0.0
    for s, e in shots:
        L = e - s
        dur_s = L / FPS
        # cumulative transform: A_k maps the shot's first-frame coordinates to frame k
        A = [np.eye(3)]
        zc = [0.0]
        for k in range(s, e - 1):
            A.append(to3(Ms[k]) @ A[-1])
            zc.append(zc[-1] + (zr[k] if Ms[k] is not None else 0.0))
        zc = np.array(zc)
        # slow zoom: total zoom 2%-25%, monotonic over most of the shot, no fast push
        if dur_s >= 1.2:
            rates = np.abs(zr[s:e - 1]) * FPS
            tot = abs(zc[-1] - zc[0])
            active = (rates > 0.004).mean()
            sgn = np.sign(zr[s:e - 1]); sgn = sgn[sgn != 0]
            mono = abs(sgn.mean()) if len(sgn) else 0
            if 0.02 <= tot <= 0.25 and active >= 0.6 and mono >= 0.7 and np.percentile(rates, 95) < 0.25:
                slow_zoom_dur += dur_s
                zoom_totals.append(tot / dur_s)
            sp_ = spd[s:e - 1]
            if (sp_ > 0.004).mean() >= 0.6 and np.percentile(sp_, 95) < 0.2:
                slow_cam_dur += dur_s
        if dur_s < 0.6:
            continue
        idx = np.unique(np.linspace(s, e - 1, min(L, 24)).astype(int))
        r = idx[len(idx) // 2]
        Ar = A[r - s]
        stack, valid = [], []
        ones = np.full((h, w), 255, np.uint8)
        for k in idx:
            T = (Ar @ np.linalg.inv(A[k - s]))[:2]
            stack.append(cv2.warpAffine(F[k], T, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT))
            valid.append(cv2.warpAffine(ones, T, (w, h), flags=cv2.INTER_NEAREST, borderMode=cv2.BORDER_CONSTANT) > 0)
        stack = np.array(stack, np.int16); valid = np.array(valid)
        vcount = valid.sum(0)
        ok = vcount >= 0.8 * len(idx)
        big = np.where(valid, stack, -1000).max(0); small = np.where(valid, stack, 1000).min(0)
        rng = big - small
        dead = ok & (rng <= 12)
        ref = F[r]
        gx = cv2.Sobel(ref, cv2.CV_32F, 1, 0); gy = cv2.Sobel(ref, cv2.CV_32F, 0, 1)
        flatpx = cv2.blur(np.hypot(gx, gy), (9, 9)) < FLAT_GRAD
        denom = max(ok.sum(), 1)
        dead_w.append(dead.sum() / denom); dead_flat_w.append((dead & flatpx).sum() / denom); shot_w.append(dur_s)
    shot_w = np.array(shot_w)
    dead_bg = float(np.average(dead_w, weights=shot_w)) if len(shot_w) else 0.0
    dead_flat = float(np.average(dead_flat_w, weights=shot_w)) if len(shot_w) else 0.0
    slow_zoom_share = slow_zoom_dur / secs

    # --- push-in events: continuous in-shot scale-up (> 0.4% per frame at 12 fps, one-frame gap allowed) accumulating
    # >= 3% counts once; one finished within 0.5 s is a fast push. Added 2026-10-12 after a 102 s explainer (about 48
    # push-ins in code, all inward) was judged "too many, too fast, not smooth"; report-only, a yellow to go and look.
    # It is a lower bound: when live footage moves by itself the camera transform cannot be estimated (that film
    # measured 20, about 12 per minute).
    def zoom_runs(mask, sign):
        ev, i = [], 0
        while i < len(mask):
            if mask[i]:
                j = k = i
                while k + 1 < len(mask) and (mask[k + 1] or (k + 2 < len(mask) and mask[k + 2])):
                    k += 1
                    if mask[k]:
                        j = k
                seg = zr[i:j + 1] * sign
                if seg[seg > 0].sum() >= 0.03:
                    ev.append((i, j))
                i = j + 1
            else:
                i += 1
        return ev
    # exclude only the cut frame itself and crossfades: a fast push starting right after a cut would be swallowed whole by
    # the cut-like window, so using trans would miss half of them
    zx = cut | in_diss
    push_in = zoom_runs((zr > 0.004) & ~zx, 1)
    pull_out = zoom_runs((zr < -0.004) & ~zx, -1)
    fast_push = sum(1 for a, b in push_in if (b - a + 1) / FPS <= 0.5)
    zoom_cv = float(np.std(zoom_totals) / (np.mean(zoom_totals) + 1e-9)) if len(zoom_totals) >= 3 else float("nan")

    # --- area metrics on sampled frames
    step = max(1, FPS // SAMPLE_FPS)
    sidx = np.arange(0, n, step)
    if len(sidx) > 240:
        sidx = np.unique(np.linspace(0, n - 1, 240).astype(int))
    S = F[sidx]
    flat_area, flat_light, subj = [], [], []
    BS = 8
    gh, gw = h // BS, w // BS
    cell_tex = np.zeros((len(sidx), gh, gw), bool)
    for j, fr in enumerate(S):
        gx = cv2.Sobel(fr, cv2.CV_32F, 1, 0); gy = cv2.Sobel(fr, cv2.CV_32F, 0, 1)
        g = np.hypot(gx, gy)[: gh * BS, : gw * BS].reshape(gh, BS, gw, BS).mean((1, 3))
        lum = fr[: gh * BS, : gw * BS].reshape(gh, BS, gw, BS).mean((1, 3))
        flat = (g < FLAT_GRAD).astype(np.uint8)
        nl, lab, stats, _ = cv2.connectedComponentsWithStats(flat, connectivity=4)
        big = np.zeros_like(flat, bool)
        for c in range(1, nl):
            if stats[c, cv2.CC_STAT_AREA] >= 0.03 * gh * gw:
                big |= lab == c
        flat_area.append(big.mean()); flat_light.append((big & (lum > 150)).mean())
        cell_tex[j] = g >= PAGE_GRAD
        tex = (g >= TEX_GRAD).astype(np.uint8)
        if tex.sum() == 0:
            subj.append(0.0); continue
        cl = cv2.morphologyEx(tex, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
        nl, lab, stats, _ = cv2.connectedComponentsWithStats(cl, connectivity=8)
        k = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        comp = (lab == k).astype(np.uint8)
        cs, _ = cv2.findContours(comp, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        fill = np.zeros_like(comp); cv2.drawContours(fill, cs, -1, 1, -1)
        subj.append(float(fill.mean()))
    flat_area = np.array(flat_area)

    # --- fixed page frame: textured cells (type, lines, logo) at the same screen position that reappear unchanged while
    # the rest of the picture has changed a lot
    page_share = page_frame(S, sidx, cell_tex, BS, gh, gw, shots)

    # --- similarity to the template composition
    tsim_share, tsim_max = float("nan"), float("nan")
    if template:
        tsim_share, tsim_max = template_similarity(F, shots, template)

    # --- in-place fade share: among changing frames, the mean share where local structure keeps its sign (brightness
    # changes without movement)
    chg = (~trans) & (fade_px >= 0)
    lf = float(np.mean(fade_px[chg] > 0.7)) if chg.sum() > 5 else 0.0

    # front-loaded pacing: fast-motion share in the worst 30 s window (half the film when it is under 60 s)
    win = int(min(30.0, secs / 2) * FPS)
    fr_full = np.where(trans, np.nan, fast_full.astype(float))
    worst, worst_t = float("nan"), None
    if win >= FPS * 4:
        for st0 in range(0, n - 1 - win + 1, FPS):
            seg = fr_full[st0: st0 + win]
            v = np.nanmean(seg) if np.isfinite(seg).any() else 0.0
            if not (worst == worst) or v < worst:
                worst, worst_t = float(v), st0 / FPS
    by10 = [round(float(np.nanmean(fr_full[k: k + 10 * FPS])), 3) if np.isfinite(fr_full[k: k + 10 * FPS]).any() else 0.0
            for k in range(0, n - 1, 10 * FPS)]
    if os.environ.get("FILM_GATE_DUMP"):
        np.savez_compressed(os.environ["FILM_GATE_DUMP"], d=d, spd=spd, loc=loc, zr=zr, cut=cut, in_diss=in_diss, fade_px=fade_px)

    shot_len = np.array([(e - s) / FPS for s, e in shots])
    res = {
        "file": os.path.basename(path),
        "orientation": "vertical" if is_vert else "horizontal",
        "duration_s": round(secs, 2),
        "sub_band": sub_band,
        "shots": len(shots), "hard_cuts": n_cut, "page_flips": n_flip, "dissolves": n_diss,
        "asl_s": round(float(shot_len.mean()), 2),
        "dissolve_share": round(n_diss / max(1, n_cut + n_diss), 3),
        "fast_ratio": round(float(fast.mean()), 4),
        "top10_share": round(float(top10), 3),
        "drift_ratio": round(float(drift.mean()), 3),
        "still_ratio": round(float(still.mean()), 3),
        "longest_still_s": round(longest / FPS, 2),
        "longest_still_start_s": round(longest_at / FPS, 2),
        "event_rate": round(event_rate, 2),
        "max_event_gap_s": round(float(gaps.max()), 2),
        "dead_bg": round(dead_bg, 3),
        "dead_flat": round(dead_flat, 3),
        "flat_area": round(float(flat_area.mean()), 3),
        "flat40_frames": round(float((flat_area > 0.4).mean()), 3),
        "page_frame_share": round(page_share, 3),
        "slow_zoom_share": round(float(slow_zoom_share), 3),
        "slow_cam_share": round(float(slow_cam_dur / secs), 3),
        "zoom_curve_cv": round(zoom_cv, 3) if zoom_cv == zoom_cv else None,
        "push_in_per_min": round(len(push_in) / secs * 60, 1),
        "fast_push_per_min": round(fast_push / secs * 60, 1),
        "push_in_share": round(len(push_in) / max(1, len(push_in) + len(pull_out)), 2),
        "push_in_times_s": [round(a / FPS, 1) for a, _ in push_in],
        "subject_box": round(float(np.median(subj)), 3),
        "flat_light": round(float(np.mean(flat_light)), 3),
        "template_sim_share": round(tsim_share, 3) if tsim_share == tsim_share else None,
        "template_sim_max": round(tsim_max, 3) if tsim_max == tsim_max else None,
        "local_fade_ratio": round(lf, 3),
        "mean_diff": round(float(np.nanmean(mv)), 2),
        "fast_ratio_worst_window": round(worst, 4) if worst == worst else None,
        "worst_window_start_s": worst_t,
        "worst_window_len_s": round(win / FPS, 2),
        "fast_ratio_by_10s": by10,
        "blank_run_s": round(max((b - a for a, b in blank_runs), default=0.0), 2),
        "blank_runs_s": blank_runs,
        "cut_times_s": [round((i + 1) / FPS, 2) for i in np.where(cut)[0]],
        "cuts_from": "events" if event_cuts else "detected",
        "detected_cut_times_s": [round((i + 1) / FPS, 3) for i in np.where(det_cut)[0]],
        "detected_flip_times_s": [round((i + 1) / FPS, 3) for i in np.where(det_flip)[0]],
        "fast_run_starts_s": [round((i + 1) / FPS, 3) for i in fast_starts],
        "_mov": mov, "_trans": trans, "_flip": flip_like, "_events": [round((i + 1) / FPS, 3) for i in ev_m],
        "page_flip_times_s": [round((i + 1) / FPS, 2) for i in np.where(flip)[0]],
        "dissolve_times_s": [round(c / FPS, 2) for _, _, c in diss],
    }
    return res


FLAT_GRAD = 6.0     # an 8x8 block with mean gradient below this is "flat" (320 px grey)
BLANK_GRAD, BLANK_FRAC = 24.0, 0.002   # blank frame: under 0.2% of pixels with gradient > 24 (approved calibration films had a single-frame minimum of 0.30%, never two frames in a row below it)
BLANK_EDGE_S, BLANK_MIN_S = 0.5, 0.3   # skip the first and last 0.5 s; a run counts only from 0.3 s


def blank_frames(F, cut_like, in_diss):
    """Near-blank mid-section runs: [(start, end) seconds], only runs >= BLANK_MIN_S.
    Judged by edges (almost no gradient in the frame), not by colour; frames on both sides of a cut and crossfade windows
    do not count, and a run crossing them is broken there."""
    n = len(F)
    blank = np.zeros(n, bool)
    for i, fr in enumerate(F):
        g = np.hypot(cv2.Sobel(fr, cv2.CV_32F, 1, 0), cv2.Sobel(fr, cv2.CV_32F, 0, 1))
        blank[i] = (g > BLANK_GRAD).mean() < BLANK_FRAC
    ok = np.ones(n, bool)
    e = int(round(BLANK_EDGE_S * FPS)); ok[:e] = False; ok[max(0, n - e):] = False
    for i in np.where(cut_like | in_diss)[0]:
        ok[i] = False; ok[i + 1] = False
    runs, s0 = [], None
    for i, v in enumerate(list(blank & ok) + [False]):
        if v and s0 is None: s0 = i
        elif not v and s0 is not None:
            if (i - s0) / FPS >= BLANK_MIN_S - 1e-9: runs.append((round(s0 / FPS, 2), round(i / FPS, 2)))
            s0 = None
    return runs
TEX_GRAD = 14.0     # above this counts as "textured"
PAGE_GRAD = 25.0    # texture a page-frame cell needs (strong edges of type, thin lines, logos)


def page_frame(S, sidx, cell_tex, BS, gh, gw, shots):
    """Fixed page-frame share of duration.
    A cell "recurs" in a frame when it is strongly textured and appears unchanged at the same place in >= 3 frames that
    are >= 3 s apart and clearly different overall. Cells recurring in >= 25% of the film are page-frame cells
    (title bar, header, page number, logo, progress bar); a frame whose recurring page-frame cells total >= 1.5% of the
    picture is framed. Shots that only reuse the same footage or the same background recur sporadically and do not
    pass the 25% bar."""
    N = len(S)
    if N < 6:
        return 0.0
    desc = np.array([cv2.resize(fr[: gh * BS, : gw * BS], (gw * 4, gh * 4), interpolation=cv2.INTER_AREA)
                     for fr in S]).astype(np.float32)
    desc = desc.reshape(N, gh, 4, gw, 4).transpose(0, 1, 3, 2, 4).reshape(N, gh, gw, 16)
    small = np.array([cv2.resize(fr, (32, 18), interpolation=cv2.INTER_AREA) for fr in S]).astype(np.float32)
    t = sidx / FPS
    G = np.abs(small[:, None] - small[None]).mean((2, 3))
    far = (np.abs(t[:, None] - t[None]) >= 3.0) & (G > 12)
    persist = np.zeros((N, gh, gw), bool)
    for y in range(gh):
        for x in range(gw):
            tex = cell_tex[:, y, x]
            if tex.sum() < 3:
                continue
            v = desc[:, y, x]
            Dm = np.abs(v[:, None] - v[None]).mean(2)
            persist[:, y, x] = ((Dm < 6.0) & far & tex[:, None] & tex[None]).sum(1) >= 3
    chrome = persist.mean(0) >= 0.25
    framed = (persist & chrome).sum((1, 2)) / (gh * gw) >= 0.015
    return float(framed.mean())


def layout_desc(fr):
    e = cv2.Canny(fr, 60, 160).astype(np.float32)
    g = cv2.resize(e, (12, 8), interpolation=cv2.INTER_AREA).ravel()
    t = cv2.resize(fr, (12, 8), interpolation=cv2.INTER_AREA).astype(np.float32).ravel()
    g = (g - g.mean()) / (g.std() + 1e-6); t = (t - t.mean()) / (t.std() + 1e-6)
    return np.concatenate([g, t]) / np.sqrt(2 * g.size)


_TPL_CACHE = {}


def template_similarity(F, shots, template):
    if template not in _TPL_CACHE:
        T, _ = decode_gray(template, fps=2, limit=12)
        T = T[:24]                                       # the first 12 seconds
        T = T[:, : int(T.shape[1] * 0.85)]
        _TPL_CACHE[template] = np.array([layout_desc(x) for x in T])
    TD = _TPL_CACHE[template]
    sims, durs = [], []
    for s, e in shots:
        k = (s + e) // 2
        v = layout_desc(F[k])
        sims.append(float((TD @ v).max())); durs.append(e - s)
    sims, durs = np.array(sims), np.array(durs, float)
    return float(durs[sims >= 0.70].sum() / durs.sum()), float(sims.max())


# ---------------------------------------------------------------- richness floor (added 2026-10-19 after the pilot films)
# Measures defined by the ice-motion skill (references/composition-and-staging.md section 7.2); floors per film type read
# from the ice-film type files by storyboard_lint.owner_floor(). How each is measured: references/motion-density.md 6.1.
RICH_FPS, RICH_WIN, RICH_MIN_WIN = 4, 4.0, 1.0
MOVE_CELLS = 3          # a frame pair has in-shot motion when at least this many 8 px cells change by >= 2/255 after camera compensation
FLOORS = ("hero_share", "frame_fill", "in_shot_motion")      # floors; empty_half and longest_still are ceilings


def area_features(fr, BS=8):
    """One grey frame -> (hero_share 0-1, 4x4 content grid). Hero: bounding box of the largest connected detailed region
    after closing, filling and an opening that drops 1-cell lines (a rope, a page edge). Grid cell: content when >= 10% of
    its 8 px cells have detail or lie outside the large flat ground."""
    h, w = fr.shape
    gh, gw = h // BS, w // BS
    g = np.hypot(cv2.Sobel(fr, cv2.CV_32F, 1, 0), cv2.Sobel(fr, cv2.CV_32F, 0, 1))[: gh * BS, : gw * BS].reshape(gh, BS, gw, BS).mean((1, 3))
    flat = (g < FLAT_GRAD).astype(np.uint8)
    nl, lab, st, _ = cv2.connectedComponentsWithStats(flat, connectivity=4)
    ground = np.zeros_like(flat, bool)
    for c in range(1, nl):
        if st[c, cv2.CC_STAT_AREA] >= 0.03 * gh * gw:
            ground |= lab == c
    content = (~ground) | (g >= TEX_GRAD)
    grid = np.zeros((4, 4), bool)
    for i in range(4):
        for j in range(4):
            grid[i, j] = content[i * gh // 4:(i + 1) * gh // 4, j * gw // 4:(j + 1) * gw // 4].mean() >= 0.10
    tex = (g >= TEX_GRAD).astype(np.uint8)
    if not tex.any():
        return 0.0, grid
    cl = cv2.morphologyEx(tex, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
    cs, _ = cv2.findContours(cl, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    fill = np.zeros_like(cl); cv2.drawContours(fill, cs, -1, 1, -1)
    op = cv2.morphologyEx(fill, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    nl, lab, st, _ = cv2.connectedComponentsWithStats(op, connectivity=8)
    if nl < 2:
        return 0.0, grid
    k = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
    return float(st[k, cv2.CC_STAT_WIDTH] * st[k, cv2.CC_STAT_HEIGHT] / (gw * gh)), grid


def richness(path, res, floors, holds, cta_start, bounds, plan=None):
    """Measure the richness floor on the render. floors: {measure: (low, high, clause)}; holds: [(start, end, why)];
    bounds: extra window boundaries in seconds (show events); plan: the craft plan, whose exemption rows film:<key> turn a
    covered red or yellow into "exempt". Returns {measure: {...}} with value, light and detail."""
    F, (W0, H0, dur) = decode_gray(path, fps=RICH_FPS)
    vert = res["orientation"] == "vertical"
    n = len(F)
    t = np.arange(n) / RICH_FPS
    held = lambda x: any(s <= x <= e for s, e, _ in holds)
    hero, grids = [], []
    for fr in F:
        hs, gr = area_features(fr); hero.append(hs); grids.append(gr)
    hero, grids = np.array(hero), np.array(grids)
    # windows: cuts, show events and the CTA start split the film; parts over 4 s split again; read the settled half
    cuts = list(res.get("cut_times_s") or []) + list(bounds or []) + ([cta_start] if cta_start else [])
    edges = sorted({0.0, dur} | {float(c) for c in cuts if 0 < c < dur})
    wins = []
    for a, b in zip(edges[:-1], edges[1:]):
        k = max(1, int(np.ceil((b - a) / RICH_WIN - 1e-9)))
        wins += [(a + (b - a) * j / k, a + (b - a) * (j + 1) / k) for j in range(k)]
    wv = []
    for a, b in wins:
        if b - a < RICH_MIN_WIN:
            continue
        sel = (t >= (a + b) / 2) & (t < b)
        if sel.sum() == 0:
            continue
        cta = cta_start is not None and a >= cta_start - 1e-6
        wv.append({"from": round(a, 2), "to": round(b, 2), "cta": cta, "hero_share": float(np.median(hero[sel])) * 100,
                   "frame_fill": float(np.median(grids[sel].reshape(sel.sum(), -1).sum(1)))})
    out = {}
    for key in ("hero_share", "frame_fill"):
        vals = [w[key] for w in wv]
        out[key] = {"value": round(float(np.median(vals)), 1) if vals else None,
                    "weak": [w for w in wv if key in floors and w[key] < floors[key][0] - (4 if key == "frame_fill" and w["cta"] else 0)]}
    # empty half: every cell of one half is empty
    if vert:
        e = (~grids[:, :2, :].any((1, 2))) | (~grids[:, 2:, :].any((1, 2)))
    else:
        e = (~grids[:, :, :2].any((1, 2))) | (~grids[:, :, 2:].any((1, 2)))
    e = np.array([bool(x) and not held(tt) for x, tt in zip(e, t)])
    spans, s0 = [], None
    for i, x in enumerate(list(e) + [False]):
        if x and s0 is None: s0 = i
        elif not x and s0 is not None:
            if (i - s0) / RICH_FPS >= 0.5:      # a burst or transition frame under 0.5 s is exempt (composition-and-staging 7.2)
                spans.append((round(s0 / RICH_FPS, 2), round(i / RICH_FPS, 2)))
            s0 = None
    out["empty_half"] = {"value": round(sum(b - a for a, b in spans), 2), "spans": spans}
    # in-shot motion and the longest still, at the analysis rate, transitions and declared holds left out
    mov, trans = res["_mov"], res["_trans"]
    flip_like = res.get("_flip", np.zeros(len(mov), bool))
    tp = (np.arange(len(mov)) + 1) / FPS
    cta_ex = "longest_still" in floors and re.search(r"\bcta\b|end card", floors["longest_still"][2], re.I)
    keep = ~trans & np.array([not held(x) for x in tp])
    moving = mov >= MOVE_CELLS
    out["in_shot_motion"] = {"value": round(100 * float(moving[keep].mean()), 1) if keep.any() else None}
    if cta_ex:
        keep &= tp < (cta_start if cta_start is not None else dur + 1)
    runs, s0 = [], None                                  # still runs (start, end) in pair indexes; skipped pairs end a run
    for i in range(len(mov) + 1):
        still = i < len(mov) and ((keep[i] and not moving[i]) or bool(flip_like[i]))   # a page flip does not end a still run
        if still and s0 is None: s0 = i
        elif not still and s0 is not None:
            runs.append((s0, i)); s0 = None
    tail_note = None
    if cta_ex and cta_start is None and runs and runs[-1][1] >= len(mov) - 1:
        runs.pop()       # the type exempts the CTA hold and no CTA start is declared: the still run reaching the end is the end hold
        tail_note = "the still run that reaches the end (the end hold) is left out because this type exempts the CTA hold; declare the CTA start in the cue sheet to be exact"
    a_, b_ = max(runs, key=lambda r: r[1] - r[0], default=(0, 0))
    out["longest_still"] = {"value": round((b_ - a_) / FPS, 2), "at": round((a_ + 1) / FPS, 2) if b_ > a_ else None, "note": tail_note}
    # lights: floors red under the lowest number of the owner cell, yellow under the highest; ceilings the other way
    for key, m in out.items():
        fl = floors.get(key)
        v = m["value"]
        if not fl or v is None:
            m["light"] = "--"; continue
        lo, hi, clause = fl
        if key in FLOORS:
            m["light"] = "red" if v < lo else "yellow" if v < hi else "green"
        else:
            m["light"] = "red" if v > hi else "yellow" if v > lo else "green"
        if key in ("hero_share", "frame_fill") and m["light"] == "green" and m["weak"]:
            m["light"] = "yellow"            # the film's median passes but some beats fall under the floor
        m["floor"] = clause
        if m["light"] in ("red", "yellow") and plan:
            lines = richness_exemption(key, m, plan, dur)
            if lines:
                m["light"], m["exempt"] = "exempt", lines
    return out


def richness_exemption(key, m, plan, dur):
    """Exempt lines for a richness measure under its floor (or over its ceiling) that craft plan rows cover, else None.
    Floors over the whole film (shares as fractions); empty_half per span and longest_still on its run, in seconds."""
    rid = "film:" + key
    if key in FLOORS:
        v = m["value"] / 100 if UNITS.get(key) == " %" else m["value"]
        row = exemption_for(plan, rid, t=(0.0, dur), value=v)
        return [exempt_line(rid, row)] if row else None
    if key == "empty_half":
        spans = m.get("spans") or [(0.0, dur)]
        rows = [exemption_for(plan, rid, t=(a, b), value=m["value"]) for a, b in spans]
        return None if not all(rows) else [f"{exempt_line(rid, r)} on {a:g}-{b:g}s" for r, (a, b) in zip(rows, spans)]
    if key == "longest_still" and m.get("at") is not None:
        a = m["at"]
        row = exemption_for(plan, rid, t=(a, a + m["value"]), value=m["value"])
        return [f"{exempt_line(rid, row)} on {a:g}-{a + m['value']:g}s"] if row else None
    return None


BP_HUE, BP_SAT, BP_VAL, BP_FRAME = (225, 300), 0.30, (0.06, 0.90), 0.30


def blue_purple(path, fps=SAMPLE_FPS, width=160):
    """Blue-purple frame share and timecodes. A frame with >= 30% pixels of hue 225-300 deg, saturation >= 0.30 and
    value 0.06-0.90 is a blue-purple frame."""
    w, h = probe(path)[:2]
    hh = max(2, int(round(h * width / w / 2)) * 2)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", f"fps={fps},scale={width}:{hh}",
                          "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
    F = np.frombuffer(raw, np.uint8).reshape(-1, hh, width, 3).astype(np.float32) / 255
    if not len(F):
        return 0.0, []
    r, g, b = F[..., 0], F[..., 1], F[..., 2]
    mx, mn = F.max(-1), F.min(-1); d = mx - mn + 1e-6
    sat = d / (mx + 1e-6)
    hue = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    m = (hue >= BP_HUE[0]) & (hue <= BP_HUE[1]) & (sat >= BP_SAT) & (mx >= BP_VAL[0]) & (mx <= BP_VAL[1])
    bad = m.reshape(len(F), -1).mean(1) >= BP_FRAME
    spans, start = [], None
    for i, x in enumerate(list(bad) + [False]):
        if x and start is None: start = i
        if not x and start is not None:
            if i - start >= 2: spans.append((round(start / fps, 1), round(i / fps, 1)))
            start = None
    return round(float(bad.mean()), 3), spans


# ---------------------------------------------------------------- lights
SHORT_S = float(os.environ.get("FILM_GATE_MIN_S", 20))  # the calibration films were all 45 s or longer; below this length readings are noisy, so red drops to yellow (hint only)


FACT_GATES = {"blank_run_s", "blue_purple_share"}   # red however short the clip is (a palette does not change with length)


def gate_exemption(k, res, plan):
    """Exempt lines for gate metric k when craft plan rows (or the --allow-blue-purple alias) cover every hit, else None."""
    dur = float(res.get("duration_s") or 0)
    rid = "film:" + k
    if k == "fast_ratio":
        row = exemption_for(plan, rid, t=(0.0, dur), value=res[k])
        return [exempt_line(rid, row)] if row else None
    if k == "blank_run_s":
        runs = res.get("blank_runs_s") or []
        rows = [exemption_for(plan, rid, t=(a, b), value=round(b - a, 2)) for a, b in runs]
        return [f"{exempt_line(rid, r)} on {a:g}-{b:g}s" for r, (a, b) in zip(rows, runs)] if runs and all(rows) else None
    if k == "blue_purple_share":
        spans = res.get("blue_purple_spans_s") or [(0.0, dur)]
        rows = [exemption_for(plan, rid, t=(a, b), value=res[k]) for a, b in spans]
        if all(rows):
            return list(dict.fromkeys(exempt_line(rid, r) for r in rows))
        if res.get("allow_blue_purple"):   # alias of a row sourced to the user's words, covering the whole film
            return [f"exempt {rid} by --allow-blue-purple (user: {res['allow_blue_purple']})"]
    return None


def grade(res, plan=None):
    rows, red = [], False
    short = (res.get("duration_s") or 0) < SHORT_S
    res.setdefault("exempt", [])
    for k, (name, direc, y, r, gate, unit) in METRICS.items():
        v = res.get(k)
        if v is None or direc == "info":
            rows.append((k, name, v, "--", gate, unit)); continue
        bad = (lambda t: v >= t) if direc == "high_bad" else (lambda t: v <= t)
        lv = "red" if (gate and r is not None and bad(r)) else "yellow" if (y is not None and bad(y)) else "green"
        if lv == "red" and short and k not in FACT_GATES:
            lv = "yellow"; res["short_clip_note"] = (f"clip is {res.get('duration_s')} s, shorter than {SHORT_S} s: the fast-motion gate only "
                                                     "hints and does not block (the blank gate still blocks); run it again on the assembled film")
        if gate and lv in ("red", "yellow"):
            lines = gate_exemption(k, res, plan)
            if lines:
                lv = "exempt"; res["exempt"] += lines
        red |= lv == "red"
        rows.append((k, name, v, lv, gate, unit))
    return rows, red


# ---------------------------------------------------------------- read it out
FIX = ("Add in-shot motion where the viewer must look at that moment (camera and holds: see the ice-motion skill): a slow push "
       "(0.6-1.5 s) to read a detail, a lateral glide between several objects, a pull back to show the whole; an object's own large "
       "action (growing, a page turning, pouring, the action in live footage) also counts, and when live footage moves by itself, hold. "
       "Fast pushes and slams are accents, only for a reveal, a turn or a key number. A uniform slow push of a few percent per shot, "
       "fades and transitions do not count (transitions are excluded however fast). A slow 20% push over about 1 s scores about the same "
       "as a 0.28 s fast push, so do not speed pushes up to pass. Do not add one push per shot to pass either: a film that pushed every "
       "2 s was judged too many, too fast, not smooth.")

BLANK_FIX = ("Keep the protagonist or the main object in the frame during that stretch: to take a breath, let it stop, pull back, or "
             "glide from it to the next object; a transition must not rest on a flat ground (black, a flat flash, a gradient ground) for "
             "0.3 s or more. Whiteboard and black-ground films are not blank as long as strokes, lines or type are on screen.")

BP_FIX = ("Replace the blue-purple ground: use the film's own palette from ice/DIRECTION.md (ice-direction skill) for every scene; do not "
          "draw deep purple starfields, blue-purple gradients or neon cyan-purple glow. When a source needs it (the user named it, "
          "the brand, a measured reference palette or the chosen style's palette), record an exemption row film:blue_purple_share in "
          "ice/plan/craft-plan.json (or, for the user's words, --allow-blue-purple \"reason\"); the source goes into the delivery report.")


# report-only yellow items: one sentence saying where to look
LOOK = {
    "fast_ratio_worst_window": lambda r: f"{r['worst_window_start_s']:.0f}-{r['worst_window_start_s'] + r['worst_window_len_s']:.0f} s has almost no fast action (front-loaded pacing)",
    "drift_ratio": lambda r: f"{r['drift_ratio']:.0%} of frames drift slowly",
    "longest_still_s": lambda r: f"from {r['longest_still_start_s']:.1f} s nothing moves for {r['longest_still_s']:.1f} s",
    "event_rate": lambda r: f"only {r['event_rate']:.1f} visual events per 10 s on average",
    "max_event_gap_s": lambda r: f"up to {r['max_event_gap_s']:.1f} s without any cut or fast action",
    "dead_bg": lambda r: f"after camera compensation, on average {r['dead_bg']:.0%} of the picture never changes within a shot",
    "dead_flat": lambda r: f"{r['dead_flat']:.0%} of the picture is an empty ground that never changes",
    "flat_light": lambda r: f"empty beige or white ground covers {r['flat_light']:.0%} on average (fine for whiteboard-like light styles; confirm it is the style, not emptiness)",
    "page_frame_share": lambda r: f"{r['page_frame_share']:.0%} of the duration is framed by a fixed header, page number, title bar or logo",
    "slow_zoom_share": lambda r: f"{r['slow_zoom_share']:.0%} of the duration is uniform slow push or pull shots",
    "push_in_per_min": lambda r: (f"at least {r['push_in_per_min']:g} push-ins per minute (fast pushes {r['fast_push_per_min']:g}, push-ins are "
                                  f"{r['push_in_share']:.0%} of push and pull moves); push after push reads hurried and not smooth; watch it once at "
                                  f"normal speed: after a push in, is there a pull back or a glide (ice-motion skill)"),
    "dissolve_share": lambda r: f"{r['dissolve_share']:.0%} of transitions are crossfades",
    "template_sim_share": lambda r: f"{r['template_sim_share']:.0%} of the duration has almost the same composition as the template",
}


def explain(res):
    """One-line verdict + why + how to fix + where to look for yellow items. Uses only numbers measured in res."""
    fr, lv = res["fast_ratio"], res["lights"]["fast_ratio"]
    if lv == "exempt":
        head = f"fast in-shot action {fr:.1%}, under the default floor and lifted by the craft plan"
        lv = "green"
    elif lv == "red":
        head = ("the whole film has no fast in-shot action and reads like page flips" if fr < 0.005 else
                f"only {fr:.1%} of frames move fast inside a shot (red line 3.5%), it reads like page flips")
    elif lv == "yellow":
        head = f"fast in-shot action is low ({fr:.1%}, yellow line 6%), close to the page-flip feel"
    else:
        head = f"enough fast in-shot action ({fr:.1%})"
    if res.get("short_clip_note"):
        head += ". " + res["short_clip_note"]
    blank_red = res["lights"].get("blank_run_s") == "red"
    if blank_red:
        segs = ", ".join(f"{a:.2f}-{b:.2f} s" for a, b in res["blank_runs_s"])
        head = (f"{len(res['blank_runs_s'])} near-blank mid-section run(s) ({segs}), longest {res['blank_run_s']:.2f} s, "
                f"almost no edge or texture in the frame and no subject") + ("; also " + head if lv != "green" else "")
    bp = res["lights"].get("blue_purple_share")
    if bp in ("red", "yellow") and not res.get("allow_blue_purple"):
        segs = ", ".join(f"{a:.1f}-{b:.1f} s" for a, b in res["blue_purple_spans_s"][:6])
        msg = f"{res['blue_purple_share']:.0%} of the picture is a blue-purple ground ({segs})"
        head = (msg + ", the most typical AI palette" + ("; also " + head if lv != "green" or blank_red else "")) if bp == "red" else head + "; " + msg
    elif res.get("allow_blue_purple") and res["blue_purple_share"] >= METRICS["blue_purple_share"][2]:
        head += f"; blue-purple ground {res['blue_purple_share']:.0%}, declared as needed by the brief: {res['allow_blue_purple']}"
    elif bp == "exempt":
        head += f"; blue-purple ground {res['blue_purple_share']:.0%}, lifted by the craft plan"
    if res["lights"].get("blank_run_s") == "exempt":
        head += "; near-blank run(s) " + ", ".join(f"{a:.2f}-{b:.2f} s" for a, b in res["blank_runs_s"]) + " lifted by the craft plan"
    why = []
    if lv != "green":
        if res["slow_zoom_share"] >= 0.3:
            why.append(f"{res['slow_zoom_share']:.0%} of the duration is a uniform slow push or pull")
        if res["still_ratio"] >= 0.5:
            why.append(f"{res['still_ratio']:.0%} of frames are completely still")
        elif res["drift_ratio"] >= 0.4:
            why.append(f"{res['drift_ratio']:.0%} of frames only drift slowly")
        if res["hard_cuts"] + res["dissolves"] + res.get("page_flips", 0):
            why.append(f"picture change comes mostly from transitions (hard cuts {res['hard_cuts']}, page flips {res.get('page_flips', 0)}, fades {res['dissolves']}), and transitions are not in-shot action")
    look = [(k, LOOK[k](res)) for k, l in res["lights"].items() if l == "yellow" and k in LOOK]
    ww = None
    if res.get("worst_window_start_s") is not None:
        a = res["worst_window_start_s"]
        ww = {"start_s": a, "end_s": round(a + res["worst_window_len_s"], 2), "fast_ratio": res["fast_ratio_worst_window"]}
    fix = " ".join(x for x in (BP_FIX if bp == "red" else None, BLANK_FIX if blank_red else None, FIX if lv != "green" else None) if x) or None
    return {"summary": head, "why": why, "fix": fix, "look": look, "worst_window": ww, "blank_runs": res["blank_runs_s"]}


def declared_events(path, ice):
    """Cut and show times declared by the renderer's events file (<film>.events.json) and the cue sheet (kind "cut")."""
    cuts, shows = [], []
    for f in (path + ".events.json", os.path.splitext(path)[0] + ".events.json"):
        if os.path.isfile(f):
            try:
                with open(f, encoding="utf-8") as fh:
                    ev = json.load(fh)
            except (OSError, ValueError):
                continue
            ev = ev.get("events", []) if isinstance(ev, dict) else ev
            for e in ev if isinstance(ev, list) else []:
                if isinstance(e, dict) and isinstance(e.get("t"), (int, float)):
                    ty = str(e.get("type", "")).lower()
                    if "cut" in ty:
                        cuts.append(float(e["t"]))
                    elif ty == "show":
                        shows.append(float(e["t"]))
            break
    cs = os.path.join(str(ice), "plan", "cue-sheet.json") if ice else None
    if cs and os.path.isfile(cs):
        try:
            with open(cs, encoding="utf-8") as fh:
                for e in json.load(fh).get("events") or []:
                    if isinstance(e, dict) and isinstance(e.get("t"), (int, float)) and str(e.get("kind", "")).lower() == "cut":
                        cuts.append(float(e["t"]))
        except (OSError, ValueError, AttributeError):
            pass
    return sorted(set(cuts)), sorted(set(shows))


def measure(path, sub_band=None, vertical="auto", template=DEFAULT_TEMPLATE, allow_blue_purple=None, film_type=None,
            events=None):
    """Measure one finished film; returns the result with lights / gate_light / verdict / explain.
    allow_blue_purple: a non-empty reason when the brief itself needs blue-purple; the gate drops to yellow and the
    reason goes into the result. film_type: overrides ice/state.json and ice/BRIEF.md for the richness floor."""
    tpl = template if template and os.path.exists(template) else None
    cv2.setNumThreads(max(1, (os.cpu_count() or 2) // 2))
    here = os.path.dirname(os.path.abspath(path))
    ice = project_ice(here, os.getcwd())
    ev_path = events or next((c for c in (path + ".events.json", os.path.splitext(path)[0] + ".events.json") if os.path.isfile(c)), None)
    holds, cta_start, hsrc = declared_times(ice, ev_path)
    ev_cuts, shows = declared_events(path, ice)
    res = analyze(path, sub_band=sub_band, vertical=vertical, template=tpl, event_cuts=ev_cuts or None)
    res["blue_purple_share"], res["blue_purple_spans_s"] = blue_purple(path)
    if allow_blue_purple and allow_blue_purple.strip():
        res["allow_blue_purple"] = allow_blue_purple.strip()
    plan_path = find_craft_plan(here) or find_craft_plan(os.getcwd())
    plan = load_craft_plan(plan_path) if plan_path else None
    if plan is not None:
        res["craft_plan"] = str(plan_path)
    scope = resolve_scope_with_plan(film_type, (here, os.getcwd()), plan, plan_path)
    floors, fsrc, fnotes = owner_floor(scope["row"], "vertical" if res["orientation"] == "vertical" else "landscape")
    rich = richness(path, res, floors, holds, cta_start, shows, plan)
    cover, csrc = edit_coverage(scope, res, ev_path, plan)
    rich.update(cover)
    rh = rhythm_check(scope, res, holds, cta_start, ev_path, plan, ice)
    if rh:
        res["rhythm"] = rh
    for k in ("_mov", "_trans", "_flip", "_events"):
        res.pop(k, None)
    res["richness"] = {"film_type": scope["type_text"], "type_source": scope["type_source"], "row": scope["row"],
                       "floors_from": fsrc, "coverage_from": csrc, "notes": scope["notes"] + fnotes, "declared_holds": holds,
                       "cta_start": cta_start, "declared_from": hsrc, "measures": rich}
    rows, red = grade(res, plan)
    res["exempt"] += [x for m in rich.values() for x in m.get("exempt", [])]
    rhm = rh["measures"] if rh else {}
    res["exempt"] += rh["exempt"] if rh else []
    red = red or any(m.get("light") == "red" for m in rich.values()) or any(m["light"] == "red" for m in rhm.values())
    res["lights"] = {k: lv for k, _, _, lv, _, _ in rows}
    res["gate_metrics"] = [k for k, _, _, _, gate, _ in rows if gate]
    gl = [res["lights"][k] for k in res["gate_metrics"]]
    gl += [m.get("light") for m in rich.values()] + [m["light"] for m in rhm.values()]
    res["gate_light"] = "red" if "red" in gl else "yellow" if "yellow" in gl else "green"
    res["verdict"] = "red" if red else "pass"
    res["explain"] = explain(res)
    thin = [f"{k} {m['value']:g}{UNITS[k]} (floor: {m['floor']})" for k, m in rich.items() if m.get("light") == "red" and k not in COVER_KEYS]
    if thin:
        res["explain"]["summary"] = "the frame is under the richness floor of this film type: " + "; ".join(thin) + ". Also: " + res["explain"]["summary"]
        res["explain"]["fix"] = RICH_FIX + (" " + res["explain"]["fix"] if res["explain"]["fix"] else "")
    bare = [f"{k} {m['value']:g}{UNITS[k]} (floor: {m['floor']})" for k, m in rich.items() if m.get("light") == "red" and k in COVER_KEYS]
    if bare:
        res["explain"]["summary"] = "the edit is under the coverage floor of its type: " + "; ".join(bare) + ". Also: " + res["explain"]["summary"]
        res["explain"]["fix"] = COVER_FIX + (" " + res["explain"]["fix"] if res["explain"]["fix"] else "")
    slow = [f"{k} {m['value'] if m['value'] is not None else 'none'} (row: {m['limit']})" for k, m in rhm.items() if m["light"] == "red"]
    if slow:
        res["explain"]["summary"] = "the cut is outside its type's rhythm row: " + "; ".join(slow) + ". Also: " + res["explain"]["summary"]
        res["explain"]["fix"] = RHYTHM_FIX + (" " + res["explain"]["fix"] if res["explain"]["fix"] else "")
    return res, rows


# ---------------------------------------------------------------- edit coverage floor, render side (added 2026-10-29)
# The measures and the rule: references/motion-density.md section 6.2; the numbers: the "Coverage floor" table of the
# ice-edit type file. The plan check is the ice-edit skill's validate-plan.mjs; this is its render-side twin.
EDIT_TYPES_DIR = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "ice-edit", "references", "edit-types"))
COVER_KEYS = ("element_events_per_min", "longest_bare_talk_s", "trigger_coverage", "broll_share")
COVER_ON_PLAN = {"trigger_coverage": "needs the plan's triggers", "broll_share": "needs the plan's scene layouts"}
COVER_FIX = ("Put real elements on the triggers and inside the bare stretches (a graphic on the word, a camera move, B-roll on "
             "the named reality), from the craft plan's rows; never a floating, pulsing or idle loop added to pass the number "
             "(references/motion-density.md section 6.2).")


def edit_type_file(scope):
    """The ice-edit type file for the scope's row, or None: the row name that the film type text names, matched to a file
    by its letters ("shorts and reels" -> shorts-reels.md, "b-roll overlay" -> broll-overlay.md)."""
    names = [n.strip() for n in scope["row"].split("/") if n.strip()]
    text = " " + re.sub(r"[\W_]+", " ", (scope["type_text"] or "").lower()) + " "
    hits = sorted((text.find(" " + re.sub(r"[\W_]+", " ", n.lower()).strip() + " "), n) for n in names
                  if " " + re.sub(r"[\W_]+", " ", n.lower()).strip() + " " in text)
    name = hits[0][1] if hits else names[0]
    key = re.sub(r"[^a-z]", "", re.sub(r"\band\b", "", name.lower()))
    if not os.path.isdir(EDIT_TYPES_DIR):
        return None
    for f in sorted(os.listdir(EDIT_TYPES_DIR)):
        if f.endswith(".md") and re.sub(r"[^a-z]", "", f[:-3].lower()) == key:
            return os.path.join(EDIT_TYPES_DIR, f)
    return None


def declared_visual_events(ev_path):
    """Times of the events file's authored visual events (every type or kind except hold and sound)."""
    if not ev_path or not os.path.isfile(ev_path):
        return []
    try:
        with open(ev_path, encoding="utf-8") as fh:
            ev = json.load(fh)
    except (OSError, ValueError):
        return []
    ev = ev.get("events", []) if isinstance(ev, dict) else ev
    return [float(e["t"]) for e in ev if isinstance(e, dict) and isinstance(e.get("t"), (int, float)) and not isinstance(e.get("t"), bool)
            and str(e.get("type") or e.get("kind") or "").strip().lower() not in ("hold", "sound")] if isinstance(ev, list) else []


def edit_coverage(scope, res, ev_path, plan):
    """Gate 4 for edit types: the coverage floor measures with a render measure (element_events_per_min gated; the
    longest gap between events against the longest_bare_talk_s ceiling, a lead because the render cannot tell a speaker
    scene from B-roll); the plan-only measures are reported as checked on the plan. -> ({measure: {...}}, file)."""
    f = edit_type_file(scope)
    if not f:
        return {}, None
    lines = open(f, encoding="utf-8", errors="replace").read().splitlines()
    at = next((k for k, ln in enumerate(lines) if ln.lstrip().startswith("#") and "coverage floor" in ln.lower()), None)
    head, rows = _table_after(lines, at) if at is not None else (None, [])
    orient = "vertical" if res["orientation"] == "vertical" else "landscape"
    floors = {}
    for r in rows:
        k = _key(r[0])
        if k in COVER_KEYS and len(r) > 1:
            floors[k] = parse_floor(r[1], orient)
    if not floors:
        return {}, None
    dur = float(res.get("duration_s") or 0) or 1e-6
    ev = sorted(set(res.get("_events", [])) | {t for t in declared_visual_events(ev_path) if 0 <= t <= dur})
    merged = []
    for t in ev:                     # an event and a cut in the same moment count once
        if not merged or t - merged[-1] > 0.3:
            merged.append(t)
    times = [0.0] + merged + [dur]
    gap, gat = max(((b - a, a) for a, b in zip(times, times[1:])), default=(dur, 0.0))
    values = {"element_events_per_min": round(len(merged) / dur * 60, 1), "longest_bare_talk_s": round(gap, 2)}
    out = {}
    for k in COVER_KEYS:
        if k not in floors:
            continue
        fl = floors[k]
        if k in COVER_ON_PLAN:
            out[k] = {"value": None, "light": "--", "floor": fl[2] if fl else "n/a",
                      "note": f"checked on the plan by validate-plan.mjs ({COVER_ON_PLAN[k]})"}
            continue
        v = values[k]
        m = {"value": v, "floor": fl[2] if fl else "n/a"}
        if not fl:
            m["light"] = "--"
        elif k == "element_events_per_min":
            m["light"] = "red" if v < fl[0] else "yellow" if v < fl[1] else "green"
        else:
            m["light"] = "yellow" if v > fl[0] else "green"
            m["at"], m["note"] = round(gat, 2), "a lead: the render cannot tell a speaker scene from B-roll; the blocking bare-talk check is validate-plan.mjs"
        if m["light"] in ("red", "yellow") and plan:
            rid = "film:" + k
            span = (m["at"], m["at"] + v) if "at" in m else (0.0, dur)
            row = exemption_for(plan, rid, t=span, value=v)
            if not row:      # the plan check's lift, plan:coverage, also lifts its render-side twin
                rid = "plan:coverage"
                row = exemption_for(plan, rid, t=span, value=v if k == "element_events_per_min" else None)
            if row:
                m["light"], m["exempt"] = "exempt", [exempt_line(rid, row)]
        out[k] = m
    return out, f


# ---------------------------------------------------------------- rhythm row without a reference (added 2026-10-29, 0.2.6)
# The rule: references/motion-density.md section 6.3; the numbers: the "Rhythm row:" line of the ice-film type file or
# the ice-edit type file. Shots and the first cut come from the detected cuts and fades only (never the declared cuts).
RHYTHM_KEYS = ("mean_shot_s", "max_shot_s", "first_cut_s", "max_event_gap_s")
RHYTHM_LINE = re.compile(r"^\s*(?:[-*]\s+)?(?:\*\*)?Rhythm row:(?:\*\*)?\s*(.*)$")
RHYTHM_KINDS = ("user", "reference", "style")   # who may lift a rhythm red (restraint the agent chose is not a source)
RHYTHM_FIX = ("Re-cut toward the type's rhythm row: split a long shot on its words, move the first cut onto the first "
              "charged word, add a visible change (a cut, a camera move on a word, a graphic in or out) inside a long gap; "
              "never an idle loop added to pass a number (references/motion-density.md section 6.3).")


def rhythm_file(scope):
    """The type file holding the scope's rhythm row: the ice-edit type file, else the ice-film type file, else None."""
    f = edit_type_file(scope)
    if f:
        return f
    name = scope["row"].split("/")[0].strip().lower().replace(" ", "-")
    p = os.path.join(str(FILM_TYPES_DIR), name + ".md")
    return p if os.path.isfile(p) else None


def parse_rhythm_row(text):
    """The text after "Rhythm row:" -> {key: None (not gated) | (low or None, high)}, plus "holds": excuse | never.
    Fields are split on ';': "<key> -", "<key> <ceiling>" or "<key> <low>-<high>", seconds; "holds excuse|never"."""
    out = {}
    for cl in text.strip().rstrip(".").split(";"):
        m = re.match(r"^\s*([a-z_]+)\s+(.+?)\s*s?\s*$", cl.strip().lower())
        if not m:
            continue
        k, v = m.group(1), m.group(2).strip()
        if k == "holds":
            out["holds"] = "never" if v.startswith("never") else "excuse"
            continue
        if k not in RHYTHM_KEYS:
            continue
        r = re.match(r"^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$", v)
        c = re.match(r"^(\d+(?:\.\d+)?)$", v)
        out[k] = (float(r.group(1)), float(r.group(2))) if r else (None, float(c.group(1))) if c else None
    out.setdefault("holds", "never")
    return out


def read_rhythm_row(path):
    """-> (fields, line) of the file's first "Rhythm row:" line, or (None, None)."""
    try:
        lines = open(path, encoding="utf-8", errors="replace").read().splitlines()
    except OSError:
        return None, None
    for ln in lines:
        m = RHYTHM_LINE.match(ln)
        if m:
            return parse_rhythm_row(m.group(1)), ln.strip()
    return None, None


def has_reference(ice, plan):
    """True when the project follows a reference: the craft plan names one, or a reference analysis holds events."""
    ref = str((plan or {}).get("reference") or "").strip().lower()
    if ref and ref != "none":
        return True
    rd = os.path.join(str(ice), "reference") if ice else None
    return bool(rd and os.path.isdir(rd) and any(os.path.isfile(os.path.join(rd, x, "analysis", "events.json"))
                                                for x in os.listdir(rd)))


def cut_out(spans, holds):
    """Spans (a, b) with the declared hold spans removed."""
    for s, e in holds:
        nxt = []
        for a, b in spans:
            if e <= a or s >= b:
                nxt.append((a, b))
                continue
            if s > a:
                nxt.append((a, s))
            if e < b:
                nxt.append((e, b))
        spans = nxt
    return spans


def rhythm_values(res, holds, cta_start, ev_path, holds_excuse):
    """The four rhythm measures on the render. Shots split at the detected cuts (page flips included) and fades; spans
    under 3 analysis frames join the one before. The CTA or end card from its declared start on is left out of the
    longest shot and the event gaps (gate G3 holds it). Events: detected cuts (page flips excluded), fades, fast-motion
    run starts and the events file's declared visual events, merged within 0.3 s."""
    dur = float(res["duration_s"])
    end = cta_start if isinstance(cta_start, (int, float)) and 0 < cta_start < dur else dur
    bounds = sorted({t for t in res.get("detected_cut_times_s", []) + res.get("dissolve_times_s", []) if 0 < t < dur})
    spans, a = [], 0.0
    for b in bounds + [dur]:
        if spans and b - a < 3.0 / FPS:
            spans[-1] = (spans[-1][0], b)
        elif b > a:
            spans.append((a, b))
        a = b
    body = [(s, min(e, end)) for s, e in spans if s < end - 1e-6] or spans
    longest = max(body, key=lambda x: x[1] - x[0])
    flips = set(res.get("detected_flip_times_s", []))
    declared = [t for t in declared_visual_events(ev_path) if 0 <= t <= dur]
    ev = sorted({t for t in res.get("detected_cut_times_s", []) if t not in flips} | set(res.get("dissolve_times_s", []))
                | set(res.get("fast_run_starts_s", [])) | set(declared))
    merged = []
    for t in ev:
        if t < end and (not merged or t - merged[-1] > 0.3):
            merged.append(t)
    times = [0.0] + merged + [end]
    gaps = [(x, y) for x, y in zip(times, times[1:]) if y > x]
    if holds_excuse:
        gaps = cut_out(gaps, [(s, e) for s, e, _ in holds])
    gap = max(gaps, key=lambda g: g[1] - g[0], default=(0.0, 0.0))
    return {"mean_shot_s": (round(sum(e - s for s, e in spans) / len(spans), 2), (0.0, dur)),
            "max_shot_s": (round(longest[1] - longest[0], 2), longest),
            "first_cut_s": (round(bounds[0], 2), (0.0, bounds[0])) if bounds else (None, (0.0, dur)),
            "max_event_gap_s": (round(gap[1] - gap[0], 2), gap)}, {"shots": len(spans), "events": len(merged),
                                                                   "declared_events": len(declared), "end_s": round(end, 2)}


def rhythm_light(v, lim):
    """red outside the row's range (or over its ceiling) by more than one analysis frame; yellow inside but near it
    (within 10 percent of the range's width from an edge, or of a ceiling); else green."""
    lo, hi = lim
    tol = 1.0 / FPS
    if v is None:
        return "red"
    if lo is None:
        return "red" if v > hi + tol else "yellow" if v > 0.9 * hi else "green"
    if v < lo - tol or v > hi + tol:
        return "red"
    m = 0.1 * (hi - lo)
    return "yellow" if v < lo + m or v > hi - m else "green"


def rhythm_check(scope, res, holds, cta_start, ev_path, plan, ice):
    """Gate 5 (0.2.6): the type's rhythm row on the render when no reference is followed. -> dict or None."""
    f = rhythm_file(scope)
    fields, line = read_rhythm_row(f) if f else (None, None)
    if not fields:
        return None
    vals, info = rhythm_values(res, holds, cta_start, ev_path, fields["holds"] == "excuse")
    ref = has_reference(ice, plan)
    out = {"from": f, "row": line, "holds": fields["holds"], "reference": ref, "measures": {}, "exempt": [], "notes": [], **info}
    if ref:
        out["notes"].append("the project follows a reference: its own numbers win (motion_check.py, "
                            "references/motion-density.md section 7); the row is reported, not gated")
    for k in RHYTHM_KEYS:
        lim = fields.get(k)
        v, span = vals[k]
        m = {"value": v, "limit": None if lim is None else (f"{lim[1]:g}" if lim[0] is None else f"{lim[0]:g}-{lim[1]:g}"),
             "at": [round(span[0], 2), round(span[1], 2)]}
        if lim is None:
            m["light"] = "--"
        elif ref:
            m["light"] = "--"
        else:
            m["light"] = rhythm_light(v, lim)
            if v is None:
                m["note"] = "no cut detected"
        if m["light"] in ("red", "yellow") and plan:
            rid = "film:" + k
            row = exemption_for(plan, rid, t=tuple(span), value=v)
            kind = str(((row or {}).get("source") or {}).get("kind", "")).lower() if row else ""
            if row and kind in RHYTHM_KINDS:
                m["light"], m["exempt"] = "exempt", [exempt_line(rid, row)]
                out["exempt"].append(exempt_line(rid, row))
            elif row:
                out["notes"].append(f"exemption {row.get('id')} ignored for {rid}: a {kind or 'sourceless'} row cannot lift "
                                    f"a rhythm row (allowed: {', '.join(RHYTHM_KINDS)})")
        out["measures"][k] = m
    return out


def rhythm_lines(rh):
    L = [f"Rhythm row (references/motion-density.md section 6.3) from {rh['from']}: {rh['row'].split(':', 1)[-1].strip()}",
         f"  measured on detected cuts: {rh['shots']} shot(s); events {rh['events']} ({rh['declared_events']} declared in "
         f"the events file); holds {'excuse their span' if rh['holds'] == 'excuse' else 'never excuse a gap'}; "
         f"CTA or end card from {rh['end_s']:g} s left to gate G3"]
    for n in rh["notes"]:
        L.append("  note: " + n)
    for k, m in rh["measures"].items():
        v = "none" if m["value"] is None else f"{m['value']:g} s"
        L.append(f"  {LIGHT[m['light']]} gate    {k}: {v}" + (f"   row: {m['limit']}" if m["limit"] else "   (not in the row)")
                 + (f"   at {m['at'][0]:g}-{m['at'][1]:g}s" if k in ("max_shot_s", "max_event_gap_s") else "")
                 + (f"   {m['note']}" if m.get("note") else ""))
        for e in m.get("exempt", []):
            L.append("           " + e)
    if any(m["light"] in ("red", "yellow") for m in rh["measures"].values()):
        L.append("  How to fix the rhythm: " + RHYTHM_FIX)
    return L


LIGHT = {"red": "[RED]   ", "yellow": "[YELLOW]", "green": "[GREEN] ", "exempt": "[EXEMPT]", "--": "[  --  ]"}


def report_lines(res, rows):
    """Text report (terminal and delivery report share it)."""
    L = [f"{res['file']}  {res['orientation']}  {res['duration_s']}s  "
         f"shots {res['shots']} (hard cuts {res['hard_cuts']}, page flips {res.get('page_flips', 0)}, fades {res['dissolves']})  mean shot {res['asl_s']}s"]
    for k, name, v, lv, gate, unit in rows:
        vs = "-" if v is None else (f"{v:.3f}" if isinstance(v, float) else str(v))
        L.append(f"  {LIGHT[lv]} {'gate  ' if gate else 'report'}  {name}: {vs}{unit}")
    ex = res["explain"]
    if res.get("blank_runs_s"):
        L.append("  blank timecodes: " + ", ".join(f"{a:.2f}-{b:.2f}s" for a, b in res["blank_runs_s"]))
    if res.get("blue_purple_spans_s") and res["lights"].get("blue_purple_share") != "green":
        L.append("  blue-purple timecodes: " + ", ".join(f"{a:.1f}-{b:.1f}s" for a, b in res["blue_purple_spans_s"]))
    if res.get("allow_blue_purple"):
        L.append(f"  blue-purple declared as needed by the brief: {res['allow_blue_purple']}")
    if res.get("craft_plan"):
        L.append(f"  craft plan: {res['craft_plan']} (exemption rows read; rule: the ice-direction skill, references/treatment.md section \"Craft plan\")")
    # gate 1 to 3 exemptions here; the gate 4 and 5 ones print under their measure
    under = {x for m in res["richness"]["measures"].values() for x in m.get("exempt", [])} | set((res.get("rhythm") or {}).get("exempt", []))
    L += ["  " + e for e in res.get("exempt", []) if e not in under]
    if ex["worst_window"]:
        w = ex["worst_window"]
        L.append(f"  worst {w['end_s'] - w['start_s']:.0f} s window: {w['start_s']:.0f}-{w['end_s']:.0f}s, fast-motion share {w['fast_ratio']}; "
                 f"fast-motion share per 10 s: {res['fast_ratio_by_10s']}")
    L += richness_lines(res["richness"], res.get("cuts_from"))
    if res.get("rhythm"):
        L += rhythm_lines(res["rhythm"])
    return L


RICH_FIX = ("Re-stage the frame before anything else (the ice-motion skill, references/composition-and-staging.md section 7.3): "
            "enlarge or crop in on the hero; bring in the world the brief implies (place, props, hands, the product's real material); "
            "add a foreground layer that crosses the frame; add light; fill a vertical frame top to bottom by stacking the story. "
            "Never fill with unrelated stock objects, floating particles or extra text.")
UNITS = {"hero_share": " %", "frame_fill": " of 16", "empty_half": " s", "in_shot_motion": " %", "longest_still": " s",
         "element_events_per_min": " per min", "longest_bare_talk_s": " s", "trigger_coverage": " %", "broll_share": " %"}


def richness_lines(sc, cuts_from):
    """Text block for the richness floor."""
    L = [f"Richness floor: film type {sc['film_type'] or 'unknown'} ({sc['type_source'] or 'not found'}) -> '{sc['row']}'; "
         f"floors from {sc['floors_from'] or 'no owner table (numbers reported only)'}; windows split at {cuts_from} cuts"]
    if sc.get("coverage_from"):
        L.append(f"  edit coverage floor (render side; references/motion-density.md section 6.2) from {sc['coverage_from']}")
    for note in sc["notes"]:
        L.append("  note: " + note)
    holds = ", ".join(f"{a:g}-{b:g}s" for a, b, _ in sc["declared_holds"]) or "none"
    cta = sc["cta_start"] if sc["cta_start"] is not None else "not declared"
    L.append(f"  declared holds: {holds}; CTA start: {cta} (read from {', '.join(sc['declared_from']) or 'no cue sheet or events file'})")
    for k, m in sc["measures"].items():
        v = "-" if m["value"] is None else f"{m['value']:g}{UNITS[k]}"
        L.append(f"  {LIGHT[m.get('light', '--')]} gate    {k}: {v}" + (f"   floor: {m['floor']}" if m.get("floor") else "   (no floor for this type)"))
        for e in m.get("exempt", []):
            L.append("           " + e)
        if m.get("weak"):
            L.append("           beats under the floor: " + ", ".join(f"{w['from']:g}-{w['to']:g}s ({w[k]:.0f})" for w in m["weak"][:8]))
        if m.get("spans"):
            L.append("           empty-half spans: " + ", ".join(f"{a:g}-{b:g}s" for a, b in m["spans"][:8]))
        if k in ("longest_still", "longest_bare_talk_s") and m.get("at") is not None:
            L.append(f"           from {m['at']:g} s" + (f"; {m['note']}" if m.get("note") else ""))
        elif k in COVER_KEYS and m.get("note"):
            L.append("           " + m["note"])
    if any(m.get("light") in ("red", "yellow") for k, m in sc["measures"].items() if k not in COVER_KEYS):
        L.append("  How to fix a thin frame: " + RICH_FIX)
    if any(m.get("light") in ("red", "yellow") for k, m in sc["measures"].items() if k in COVER_KEYS):
        L.append("  How to fix a bare edit: " + COVER_FIX)
    L.append("  Not measured here: depth_layers and hero_width (lint.mjs, when the page marks them); surface_detail, light_events and "
             "real_material (critic, by eye).")
    return L


# ---------------------------------------------------------------- fingerprint (anti-sameness.md sections 2 to 4a)
FP_FILE = os.path.join(os.path.expanduser("~"), ".ice-motion-director", "fingerprints.jsonl")
FP_AXES = ("palette", "type", "layout", "motion", "structure", "sound")


def _fp_hue_far(a, b, limit=45):
    try:
        d = abs(float(a) - float(b)) % 360
    except (TypeError, ValueError):
        return True
    return min(d, 360 - d) >= limit


def fp_axis_differs(axis, a, b, hue_limit=45):
    """One axis of two fingerprint records, by the table of anti-sameness.md section 3."""
    x, y = a.get(axis) or {}, b.get(axis) or {}
    if axis == "palette":
        return x.get("polarity") != y.get("polarity") or _fp_hue_far(x.get("accent_hue"), y.get("accent_hue"), hue_limit) \
            or x.get("chroma") != y.get("chroma")
    if axis == "type":
        return x.get("display") != y.get("display") and (x.get("classes") != y.get("classes") or x.get("weights") != y.get("weights"))
    if axis == "layout":
        fx, fy = list(x.get("families") or []), list(y.get("families") or [])
        if not fx or not fy or fx[0] != fy[0]:
            return True
        return len(set(fx) & set(fy)) * 2 < max(len(set(fx)), len(set(fy)))
    if axis == "motion":
        cx, cy = set(x.get("core_moves") or []), set(y.get("core_moves") or [])
        return x.get("family") != y.get("family") or len(cx - cy) >= 2 or x.get("camera") != y.get("camera")
    if axis == "structure":
        keys = ("concept", "scene_band", "main_objects", "opening", "closing")
        norm = lambda v: sorted(v) if isinstance(v, list) else v
        return sum(norm(x.get(k)) != norm(y.get(k)) for k in keys) >= 3
    if axis == "sound":
        return any(x.get(k) != y.get(k) for k in ("lead", "genre", "dramaturgy"))
    raise ValueError(axis)


def fingerprint_check(rec, records, recent=30, hue_limit=45):
    """Compare a candidate record with the file. Returns (passed, lines)."""
    if rec.get("user_chosen"):
        return True, [f"exempt: a look the user chose ({rec['user_chosen'].get('kind', '?')}: {rec['user_chosen'].get('ref', '?')}); "
                      "not compared (anti-sameness.md section 4a), written with user_chosen filled"]
    pool = [r for r in records if not r.get("user_chosen") and r.get("project") != rec.get("project")
            and r.get("variant_of") != rec.get("project") and (not rec.get("variant_of") or rec.get("variant_of") != r.get("project"))]
    brand = (rec.get("brand") or "none").strip().lower()
    same = [r for r in pool if brand != "none" and (r.get("brand") or "none").strip().lower() == brand]
    others = [r for r in pool if r not in same][-recent:]
    lines, ok = [], True
    for r in others:
        diff = [ax for ax in FP_AXES if fp_axis_differs(ax, rec, r, hue_limit)]
        if len(diff) < 4:
            ok = False
            lines.append(f"FAIL: differs from {r.get('date')} {r.get('brand')} ({r.get('project')}) on {len(diff)} of 6 axes; "
                         f"matching: {', '.join(a for a in FP_AXES if a not in diff)} (change structure and motion first)")
    for r in same:
        diff = [ax for ax in FP_AXES[2:] if fp_axis_differs(ax, rec, r, hue_limit)]
        if len(diff) < 3 or "structure" not in diff:
            ok = False
            lines.append(f"FAIL: same brand as {r.get('date')} ({r.get('project')}): {len(diff)} of 4 open axes differ"
                         + ("" if "structure" in diff else ", structure matches") + f"; matching: {', '.join(a for a in FP_AXES[2:] if a not in diff)}")
    lines.insert(0, f"compared with {len(others)} recent records of other brands and {len(same)} of the same brand "
                    f"(records with user_chosen and variants left out)")
    return ok, lines


def fingerprint_main(argv):
    ap = argparse.ArgumentParser(prog="film_gate.py fingerprint",
                                 description="Fingerprint check and write (ice-qa references/anti-sameness-gates.md section 3).")
    ap.add_argument("action", choices=["check", "write"])
    ap.add_argument("--record", required=True, help="the candidate record, one JSON object (anti-sameness.md section 2)")
    ap.add_argument("--file", default=FP_FILE, help=f"fingerprints file (default {FP_FILE})")
    ap.add_argument("--recent", type=int, default=30)
    ap.add_argument("--hue", type=float, default=45, help="accent hue distance in OKLCH degrees")
    a = ap.parse_args(argv)
    try:
        rec = json.load(open(a.record, encoding="utf-8"))
    except (OSError, ValueError) as e:
        print(f"cannot read the record: {e}", file=sys.stderr); return 1
    missing = [k for k in ("v", "date", "project", "brand") + FP_AXES if k not in rec]
    if missing:
        print("record is missing: " + ", ".join(missing), file=sys.stderr); return 1
    records = []
    if os.path.exists(a.file):
        for line in open(a.file, encoding="utf-8"):
            if line.strip():
                try: records.append(json.loads(line))
                except ValueError: pass
    ok, lines = fingerprint_check(rec, records, a.recent, a.hue)
    print("\n".join(lines))
    if a.action == "check":
        print("Fingerprint: " + ("pass" if ok else "FAIL"))
        return 0 if ok else 2
    if not ok and not rec.get("user_chosen"):
        print("not written: an approved film passes the check first", file=sys.stderr); return 2
    os.makedirs(os.path.dirname(os.path.abspath(a.file)), exist_ok=True)
    with open(a.file, "a", encoding="utf-8") as f:
        f.write(json.dumps(rec, ensure_ascii=False, separators=(",", ":")) + "\n")
    print(f"written to {a.file}")
    return 0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("mp4")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--vertical", default="auto", choices=["auto", "yes", "no"],
                    help="orientation; auto decides from width and height. Only changes the subtitle band default")
    ap.add_argument("--sub-band", type=float, default=None,
                    help="share of the frame bottom masked as subtitle band; default 0.15 landscape, 0.18 vertical; 0 masks nothing")
    ap.add_argument("--template", default=DEFAULT_TEMPLATE, help="nearest template or demo render (its first 12 s are compared by composition)")
    ap.add_argument("--no-template", action="store_true")
    ap.add_argument("--allow-blue-purple", metavar="REASON", default=None,
                    help="the brief itself needs blue-purple (the user named it): give the reason; an alias of a craft plan exemption row sourced to the user, the blue-purple gate passes as exempt")
    ap.add_argument("--type", default=None, help="film type for the richness floor (default: ice/state.json subtype, ice/BRIEF.md film_type, then the craft plan's type)")
    ap.add_argument("--events", default=None, help="events file with cut, show and hold entries (default: <film>.events.json if present)")
    a = ap.parse_args()
    for _stream in (sys.stdout, sys.stderr):
        if hasattr(_stream, "reconfigure"):
            _stream.reconfigure(encoding="utf-8", errors="replace")
    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        print("ffmpeg/ffprobe required", file=sys.stderr); sys.exit(1)
    try:
        res, rows = measure(a.mp4, sub_band=a.sub_band, vertical=a.vertical, template=None if a.no_template else a.template,
                            allow_blue_purple=a.allow_blue_purple, film_type=a.type, events=a.events)
    except (subprocess.CalledProcessError, KeyError, IndexError, RuntimeError, ValueError) as e:
        print(f"cannot read this film: {a.mp4} ({e})", file=sys.stderr); sys.exit(1)
    red = res["verdict"] == "red"
    if a.json:
        print(json.dumps(res, ensure_ascii=False, indent=1))
    else:
        print("\n".join(report_lines(res, rows)))
        ex = res["explain"]
        tag = {"red": "RED, do not deliver", "yellow": "YELLOW, may deliver but a person must look", "green": "gates passed"}[res["gate_light"]]
        print(f"Verdict: {tag}: {ex['summary']}." + (" " + "; ".join(ex["why"]) + "." if ex["why"] else ""))
        if ex["fix"]:
            print("How to fix: " + ex["fix"])
        if ex["look"]:
            print("Yellow items (report-only, not blocking; go and look, and explain each one in the delivery report):")
            for _, t in ex["look"]:
                print("  - " + t)
        if not red:
            print("Reminder: the gates block almost no fast action, a blank mid-section, a blue-purple ground, a frame under the richness floor "
                  "and a cut outside its type's rhythm row; "
                  "the independent review is still required.")
    sys.exit(2 if red else 0)


if __name__ == "__main__":
    if sys.argv[1:2] == ["fingerprint"]:
        sys.exit(fingerprint_main(sys.argv[2:]))
    main()
