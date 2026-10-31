#!/usr/bin/env python3
# Ice Motion Director, 2026-10-31 (0.2.8): written for this repository, not adapted from a source. The measures were
# made for the first measured genre playbook (UI and app motion ads): the same code measured the 15-video corpus and
# measures a render, so a film is compared with the corpus on the very numbers the corpus was described by. The
# product launch and kinetic type playbooks (same release) add their coding keys to coding_value; no new pixel measure.
# The explainer playbook adds the expl_ keys: the sentence sample, spoken words per counted scene, the counted scene
# median (gated) and the voice rate, text, diagram, real material and build counts (reported). The brand film
# playbook adds the brand_ keys (carrier, counted shot median, first brand sighting, footage share), all reported.
"""genre_check.py: the genre fingerprint. Measures a video the way the genre corpus was measured and checks it against
the "Genre fingerprint:" line of the genre playbook (ice-film skill, references/genres/<genre>.md).

Usage:
  python genre_check.py measure <video> --out <json>
  python genre_check.py check --genre <name> (--video <mp4> | --measures <json>) [--coding <json>] [--json]
  python genre_check.py genres                      list the playbooks that carry a fingerprint

measure (numpy; ffmpeg and ffprobe on PATH): pixel and audio measures, written as JSON.
  scene_median_s     median gap between whole-scene changes (start and end included). A scene change is a peak over
                     10 (of 255) of the mean colour difference between the 0.3 s before and the 0.3 s after a point,
                     on a blurred 32x18 colour signature at 12 fps, peaks at least 0.6 s apart: hard cuts and fast
                     morphs count alike, a slow drift does not.
  cuts_per_10s       hard cuts (grey histogram correlation under 0.55 and mean grey change over 18) per 10 s.
  events_per_s       visual event onsets per second: the changed share of the frame (grey change over 6 at 12 fps,
                     160 px wide) rises from under 0.2 percent to 0.5 percent or more, or jumps by 2 points; onsets
                     at least 0.25 s apart.
  median_event_gap_s, max_event_gap_s   gaps between those onsets (start and end included).
  hook_events_3s     onsets in the first 3 s.
  sfx_per_min        transient onsets in the 2 to 9 kHz band (spectral flux over an adaptive threshold, at least
                     80 ms apart): clicks, ticks, pops and hits, music transients included (read it with the music).
  move_with_onset    share of visual onsets with an audio onset within 0.09 s: a sound on the move.
  move_onset_chance  the same share with the visual onsets shifted by 0.37 to 1.79 s (six shifts, wrapped): what a
                     track that dense gives by chance. move_onset_lift = move_with_onset / move_onset_chance; over
                     1.2 means sounds are placed on the moves, about 1 means they only happen to be near them.
  end_center_dx, end_center_dy, end_area, end_bg_std   the last 1.0 s averaged: the content box (pixels over 18 grey
                     levels from the border's median) centre offset from the frame centre as a share of width and
                     height, its area share, and the grey standard deviation outside it (low: a plain background).
check (standard library only with --measures): compares each fingerprint key with the measures, and the coding keys
with a coding sheet of the render (--coding: the genre playbook's coding sheet, filled by a fresh reviewer from the
render's frames, never by the builder). Each key is "<key> <low>-<high>", "<key> <=<n>", "<key> >=<n>" or
"<key> <value>|<value>" (one of); "-" means reported, not gated; "misses_allowed <n>" lets n gated keys miss (each
miss is then yellow and needs a sentence in the delivery report). A key misses outside its bound; yellow: inside but
within 10 percent of the range's width from an edge, or a coding key with no coding sheet. Red when more keys miss than
allowed: exit 2; 0 otherwise; 1 for bad input.

The fingerprint describes the genre, not one film: a film that follows a reference, a chosen style or the user's own
words on a key is checked against that source instead, with an exemption row of the craft plan lifting genre:<key>
(the ice-direction skill, references/treatment.md section "Craft plan"); the check prints the source it was given with
--exempt key=reason, and an exempt key is never red.
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

GENRES_DIR = Path(__file__).resolve().parents[2] / "ice-film" / "references" / "genres"
LINE = re.compile(r"^\s*(?:[-*]\s+)?(?:\*\*)?Genre fingerprint:(?:\*\*)?\s*(.*)$")
FPS = 12
W = 160
SHIFTS = (0.37, 0.61, 0.83, 1.13, 1.41, 1.79)
PIXEL_KEYS = ("move_onset_lift", "scene_median_s", "cuts_per_10s", "events_per_s", "median_event_gap_s", "max_event_gap_s",
              "hook_events_3s", "sfx_per_min", "move_with_onset", "end_center_dx", "end_center_dy", "end_area",
              "end_bg_std")


# ---------------------------------------------------------------- fingerprint line
def parse_fingerprint(text):
    """The text after "Genre fingerprint:" -> {key: ("range", lo, hi) | ("max", n) | ("min", n) | ("one_of", set) |
    None (reported only)}. Clauses are split on ';'."""
    out = {}
    for cl in text.strip().rstrip(".").split(";"):
        cl = cl.strip()
        m = re.match(r"^([a-z0-9_]+)\s+(.+)$", cl)
        if not m:
            continue
        k, v = m.group(1), m.group(2).strip()
        if k == "misses_allowed":
            out[k] = int(float(v))
            continue
        num = r"(-?\d+(?:\.\d+)?)"
        if v == "-":
            out[k] = None
        elif re.fullmatch(num + r"\s*-\s*" + num, v):
            a, b = re.fullmatch(num + r"\s*-\s*" + num, v).groups()
            out[k] = ("range", float(a), float(b))
        elif re.fullmatch(r"<=\s*" + num, v):
            out[k] = ("max", float(re.fullmatch(r"<=\s*" + num, v).group(1)))
        elif re.fullmatch(r">=\s*" + num, v):
            out[k] = ("min", float(re.fullmatch(r">=\s*" + num, v).group(1)))
        else:
            out[k] = ("one_of", {x.strip().lower() for x in v.split("|") if x.strip()})
    return out


def read_fingerprint(genre):
    p = GENRES_DIR / f"{genre}.md"
    if not p.is_file():
        return None, None, p
    for ln in p.read_text(encoding="utf-8", errors="replace").splitlines():
        m = LINE.match(ln)
        if m:
            return parse_fingerprint(m.group(1)), ln.strip(), p
    return None, None, p


def light(v, rule):
    if rule is None:
        return "--"
    kind = rule[0]
    if v is None:
        return "red"
    if kind == "one_of":
        vals = v if isinstance(v, (list, tuple, set)) else [v]
        return "green" if any(str(x).lower() in rule[1] for x in vals) else "red"
    if isinstance(v, bool):
        v = 1.0 if v else 0.0
    v = float(v)
    if kind == "max":
        return "red" if v > rule[1] + 1e-9 else "yellow" if v > 0.9 * rule[1] and rule[1] > 0 else "green"
    if kind == "min":
        return "red" if v < rule[1] - 1e-9 else "yellow" if v < 1.1 * rule[1] and rule[1] > 0 else "green"
    lo, hi = rule[1], rule[2]
    if v < lo - 1e-9 or v > hi + 1e-9:
        return "red"
    m = 0.1 * (hi - lo)
    return "yellow" if v < lo + m or v > hi - m else "green"


def coding_value(coding, key):
    """A coding key of the fingerprint read from the coding sheet (the playbook's coding sheet section)."""
    t = coding.get("text") or {}
    h = coding.get("hero") or {}
    i = coding.get("interaction") or {}
    tr = coding.get("transitions") or {}
    e = coding.get("end_card") or {}
    if key == "text_reveal":
        return t.get("dominant_reveal")
    if key == "emphasis_share":
        n = t.get("lines_total") or 0
        return round((t.get("lines_with_emphasis_colour") or 0) / n, 2) if n else 0.0
    if key == "ui_hero":
        return bool(h.get("ui_parts_hero"))
    if key == "presses":
        return i.get("presses")
    if key == "hard_cut_share":
        tot = sum(v for k, v in tr.items() if isinstance(v, (int, float)) and k != "dominant")
        return round((tr.get("hard_cut") or 0) / tot, 2) if tot else 0.0
    if key == "end_logo":
        return e.get("logo_position")
    if key == "end_background":
        return e.get("background")
    if key == "end_product":
        return e.get("product_in_close")
    p = coding.get("product") or {}
    if key == "product_first_s":
        return p.get("first_product_s")
    if key in ("hero_shot_kind", "ground", "close_offer"):
        return p.get(key)
    ty = coding.get("type") or {}
    if key == "type_text_share":
        return ty.get("text_on_screen_share")
    if key == "type_words_per_line":
        return ty.get("words_per_line_median")
    if key == "type_max_words":
        return ty.get("max_words_on_screen")
    if key == "type_only_share":
        return ty.get("type_only_share")
    b = coding.get("brand") or {}
    if key == "brand_carrier":
        return b.get("carrier")
    if key == "brand_shot_median_s":
        return (b.get("shot_len") or {}).get("median_s")
    if key == "brand_first_s":
        return (b.get("brand_first") or {}).get("any_s")
    if key == "brand_footage_share":
        ms = b.get("material_share") or {}
        return round((ms.get("live_action") or 0) + (ms.get("archive_or_ugc") or 0), 2) if ms else None
    ex = coding.get("explainer") or {}
    if key == "expl_sentence_change":
        ss = ex.get("sentence_sample") or []
        return round(sum(1 for s in ss if s.get("picture_change")) / len(ss), 2) if ss else None
    if key in ("expl_words_per_scene", "expl_scene_median_s"):
        lens = sorted(s["end"] - s["start"] for s in coding.get("scenes") or [] if "end" in s and "start" in s)
        if not lens:
            return None
        if key == "expl_words_per_scene":
            return round(ex["voice_words"] / len(lens), 1) if ex.get("voice_words") else None
        mid = len(lens) // 2
        return round(lens[mid] if len(lens) % 2 else (lens[mid - 1] + lens[mid]) / 2, 2)
    if key == "expl_wpm":
        return ex.get("wpm")
    if key == "expl_text_share":
        return ex.get("text_on_screen_share")
    if key == "expl_diagram_share":
        return ex.get("diagram_scene_share")
    if key == "expl_real_share":
        return ex.get("real_material_share")
    if key == "expl_builds":
        return (ex.get("builds") or {}).get("count")
    return coding.get(key)


# ---------------------------------------------------------------- measure
def need(tool):
    if not shutil.which(tool):
        sys.exit(f"genre_check.py needs {tool} on PATH (install FFmpeg: Windows winget install Gyan.FFmpeg, macOS brew "
                 "install ffmpeg, Linux your package manager).")


def _np():
    try:
        import numpy as np
        return np
    except ImportError:
        sys.exit("genre_check.py measure needs numpy==2.4.6 (scripts/requirements.txt): python -m pip install -r "
                 f'"{Path(__file__).resolve().parent / "requirements.txt"}"')


def _peaks(values, thr, min_gap):
    idx = []
    for i in range(1, len(values) - 1):
        if values[i] >= thr and values[i] >= values[i - 1] and values[i] >= values[i + 1]:
            if idx and i - idx[-1] < min_gap:
                if values[i] > values[idx[-1]]:
                    idx[-1] = i
                continue
            idx.append(i)
    return idx


def _frames(np, p):
    pr = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
                         "-of", "csv=p=0", str(p)], capture_output=True, text=True, encoding="utf-8").stdout.strip().split(",")
    w0, h0 = int(pr[0]), int(pr[1])
    h = max(2, int(round(W * h0 / w0 / 2)) * 2)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-vf", f"fps={FPS},scale={W}:{h}", "-f", "rawvideo",
                          "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
    n = len(raw) // (W * h * 3)
    return np.frombuffer(raw[: n * W * h * 3], np.uint8).reshape(n, h, W, 3).astype(np.float32), [w0, h0]


def _hist_corr(np, a, b):
    ha, _ = np.histogram(a, 32, (0, 255))
    hb, _ = np.histogram(b, 32, (0, 255))
    ha = ha - ha.mean()
    hb = hb - hb.mean()
    d = np.sqrt((ha * ha).sum() * (hb * hb).sum())
    return float((ha * hb).sum() / d) if d else 1.0


def _signature(f):
    h, w, _ = f.shape
    h2, w2 = h - h % 18, w - w % 32
    return f[:h2, :w2].reshape(18, h2 // 18, 32, w2 // 32, 3).mean((1, 3))


def _audio_onsets(np, p):
    sr, nper, hop = 22050, 1024, 256
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-vn", "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"],
                         capture_output=True).stdout
    x = np.frombuffer(raw, np.float32)
    if x.size < sr:
        return None
    nfr = 1 + (x.size - nper) // hop
    win = np.hanning(nper).astype(np.float32)
    idx = np.arange(nper)[None, :] + hop * np.arange(nfr)[:, None]
    spec = np.abs(np.fft.rfft(x[idx] * win, axis=1))
    f = np.fft.rfftfreq(nper, 1 / sr)
    band = (f >= 2000) & (f <= 9000)
    mag = np.log1p(spec[:, band] * 100)
    flux = np.concatenate([[0.0], np.maximum(np.diff(mag, axis=0), 0).sum(1)])
    k = 15
    pad = np.pad(flux, k, mode="edge")
    med = np.array([np.median(pad[i:i + 2 * k + 1]) for i in range(flux.size)])
    thr = med + 1.5 * flux.std() + 1e-6
    t = (np.arange(flux.size) * hop + nper / 2) / sr
    pk = _peaks(np.where(flux > thr, flux, 0), 1e-6, int(0.08 * sr / hop))
    return [round(float(t[i]), 3) for i in pk]


def measure(video):
    need("ffmpeg")
    need("ffprobe")
    np = _np()
    frames, size = _frames(np, video)
    n = len(frames)
    if n < FPS:
        sys.exit("genre_check.py: the video is shorter than 1 s or could not be read")
    grey = frames.mean(3)
    dur = n / FPS
    cuts = []
    for i in range(1, n):
        if _hist_corr(np, grey[i - 1], grey[i]) < 0.55 and np.abs(grey[i] - grey[i - 1]).mean() > 18:
            if not cuts or i - cuts[-1] > 2:
                cuts.append(i)
    sig = np.stack([_signature(f) for f in frames])
    k = max(2, int(0.3 * FPS))
    score = np.zeros(n)
    for i in range(k, n - k):
        score[i] = np.abs(sig[i - k:i].mean(0) - sig[i + 1:i + 1 + k].mean(0)).mean()
    sc = _peaks(score, 10.0, int(0.6 * FPS))
    lens = np.diff([0.0] + [i / FPS for i in sc] + [dur])
    changed = np.zeros(n)
    for i in range(1, n):
        changed[i] = (np.abs(grey[i] - grey[i - 1]) > 6).mean()
    ev = []
    for i in range(1, n):
        rise = (changed[i - 1] < 0.002 and changed[i] >= 0.005) or (changed[i] - changed[i - 1] >= 0.02)
        if rise and (not ev or i - ev[-1] >= int(0.25 * FPS)):
            ev.append(i)
    ev_s = [i / FPS for i in ev]
    gaps = np.diff([0.0] + ev_s + [dur])
    last = frames[max(0, n - FPS):].mean(0).mean(2)
    border = np.concatenate([last[:3].ravel(), last[-3:].ravel(), last[:, :3].ravel(), last[:, -3:].ravel()])
    bgc = float(np.median(border))
    mask = np.abs(last - bgc) > 18
    hh, ww = last.shape
    if mask.any():
        ys, xs = np.where(mask)
        dx = round(float((xs.min() + xs.max()) / 2 / ww - 0.5), 3)
        dy = round(float((ys.min() + ys.max()) / 2 / hh - 0.5), 3)
        outside = last[~mask]
        bg_std = round(float(outside.std()) if outside.size else 0.0, 1)
    else:
        dx = dy = None
        bg_std = round(float(last.std()), 1)
    on = _audio_onsets(np, video)
    def hits(times):
        return sum(1 for e in times if on and any(abs(e - o) <= 0.09 for o in on))
    hit = hits(ev_s)
    # chance: the same events shifted in time (wrapped), so a dense music track does not pass as sound design
    chance = (sum(hits([(e + sh) % dur for e in ev_s]) for sh in SHIFTS) / len(SHIFTS) / len(ev_s)) if on and ev_s else None
    return {
        "file": str(video), "duration_s": round(dur, 2), "size": size,
        "scene_changes_s": [round(i / FPS, 2) for i in sc], "hard_cuts_s": [round(i / FPS, 2) for i in cuts],
        "events_s": [round(t, 2) for t in ev_s], "audio_onsets_s": on,
        "scene_median_s": round(float(np.median(lens)), 2), "scene_min_s": round(float(lens.min()), 2),
        "scene_max_s": round(float(lens.max()), 2), "scenes": int(len(lens)),
        "cuts_per_10s": round(len(cuts) / dur * 10, 2), "events_per_s": round(len(ev_s) / dur, 2),
        "median_event_gap_s": round(float(np.median(gaps)), 2), "max_event_gap_s": round(float(gaps.max()), 2),
        "hook_events_3s": int(sum(1 for t in ev_s if t < 3.0)),
        "sfx_per_min": None if on is None else round(len(on) / dur * 60, 1),
        "move_with_onset": None if on is None or not ev_s else round(hit / len(ev_s), 2),
        "move_onset_chance": None if chance is None else round(chance, 2),
        "move_onset_lift": None if not chance else round(hit / len(ev_s) / chance, 2),
        "end_center_dx": dx, "end_center_dy": dy, "end_area": round(float(mask.mean()), 3), "end_bg_std": bg_std,
        "end_bg_luma": round(bgc, 1),
    }


# ---------------------------------------------------------------- check
LIGHTS = {"red": "[RED]   ", "yellow": "[YELLOW]", "green": "[GREEN] ", "exempt": "[EXEMPT]", "--": "[  --  ]"}


def check(genre, meas, coding, exempt):
    fp, line, path = read_fingerprint(genre)
    if fp is None:
        return {"genre": genre, "error": f"no 'Genre fingerprint:' line in {path}"}
    rows = {}
    allowed = fp.get("misses_allowed", 0)
    for k, rule in fp.items():
        if k == "misses_allowed":
            continue
        if k in PIXEL_KEYS:
            v, src = meas.get(k), "measured"
            if k in ("end_center_dx", "end_center_dy") and v is not None:
                v = abs(v)
        else:
            src = "coding sheet"
            v = coding_value(coding, k) if coding else None
        lt = light(v, rule)
        if k in exempt:
            lt = "exempt"
        elif v is None and src == "coding sheet" and rule is not None:
            lt = "yellow"
        elif v is None and k in ("sfx_per_min", "move_with_onset", "move_onset_lift") and rule is not None:
            lt = "yellow"
        rows[k] = {"value": sorted(v) if isinstance(v, set) else v, "rule": None if rule is None else
                   (f"{rule[1]:g}-{rule[2]:g}" if rule[0] == "range" else f"<={rule[1]:g}" if rule[0] == "max" else
                    f">={rule[1]:g}" if rule[0] == "min" else "|".join(sorted(rule[1]))),
                   "source": src, "light": lt}
        if k in exempt:
            rows[k]["exempt"] = exempt[k]
        if v is None and lt == "yellow":
            rows[k]["note"] = "no coding sheet: a fresh reviewer codes the render" if src == "coding sheet" else "no audio"
    misses = [k for k, r in rows.items() if r["light"] == "red"]
    red = misses if len(misses) > allowed else []
    if misses and not red:
        for k in misses:
            rows[k]["light"] = "yellow"
            rows[k]["note"] = (f"one of {allowed} allowed miss(es): a film of the genre may differ on {allowed} key(s); "
                               "say why in the delivery report")
    return {"genre": genre, "from": str(path), "line": line, "rows": rows, "red": red, "misses": misses,
            "misses_allowed": allowed,
            "verdict": "red" if red else "yellow" if any(r["light"] == "yellow" for r in rows.values()) else "green"}


def main():
    ap = argparse.ArgumentParser(description="Genre fingerprint: measure a video like the genre corpus, check it.")
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("measure", help="pixel and audio measures of a video, as JSON (numpy, ffmpeg)")
    p.add_argument("video")
    p.add_argument("--out", required=True)
    p = sub.add_parser("check", help="compare a video or its measures with a genre fingerprint")
    p.add_argument("--genre", required=True, help="playbook name: references/genres/<genre>.md of the ice-film skill")
    p.add_argument("--video")
    p.add_argument("--measures", help="a measure JSON (written by measure); standard library only")
    p.add_argument("--coding", help="the coding sheet of the render, filled by a fresh reviewer")
    p.add_argument("--exempt", action="append", default=[], help="key=source and reason (a craft plan row lifting genre:<key>)")
    p.add_argument("--json", action="store_true")
    sub.add_parser("genres", help="list the genre playbooks that carry a fingerprint")
    a = ap.parse_args()
    if a.cmd == "genres":
        for f in sorted(GENRES_DIR.glob("*.md")) if GENRES_DIR.is_dir() else []:
            fp, line, _ = read_fingerprint(f.stem)
            print(f"{f.stem}: {'fingerprint with ' + str(len(fp)) + ' keys' if fp else 'no fingerprint line'}")
        return 0
    if a.cmd == "measure":
        m = measure(Path(a.video))
        Path(a.out).parent.mkdir(parents=True, exist_ok=True)
        Path(a.out).write_text(json.dumps(m, indent=1), encoding="utf-8")
        print(f"wrote {a.out}: scene median {m['scene_median_s']} s, {m['events_per_s']} events/s, longest gap "
              f"{m['max_event_gap_s']} s, sfx {m['sfx_per_min']}/min, move with sound {m['move_with_onset']}")
        return 0
    if bool(a.video) == bool(a.measures):
        print("check needs exactly one of --video or --measures", file=sys.stderr)
        return 1
    try:
        meas = measure(Path(a.video)) if a.video else json.loads(Path(a.measures).read_text(encoding="utf-8"))
        coding = json.loads(Path(a.coding).read_text(encoding="utf-8")) if a.coding else None
    except (OSError, ValueError) as e:
        print(f"genre_check.py: cannot read input: {e}", file=sys.stderr)
        return 1
    exempt = {}
    for x in a.exempt:
        k, _, why = x.partition("=")
        exempt[k.strip()] = why.strip() or "no reason given"
    res = check(a.genre, meas, coding, exempt)
    if "error" in res:
        print(res["error"], file=sys.stderr)
        return 1
    if a.json:
        print(json.dumps(res, indent=1))
    else:
        print(f"Genre fingerprint {a.genre} from {res['from']}")
        for k, r in res["rows"].items():
            v = "none" if r["value"] is None else r["value"]
            print(f"  {LIGHTS[r['light']]} {k}: {v}   fingerprint: {r['rule'] or '- (reported)'}   ({r['source']})"
                  + (f"   exempt: {r['exempt']}" if r.get("exempt") else "") + (f"   {r['note']}" if r.get("note") else ""))
        print(f"verdict: {res['verdict']}")
    return 2 if res["red"] else 0


if __name__ == "__main__":
    sys.exit(main())
