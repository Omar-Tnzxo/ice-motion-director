#!/usr/bin/env python3
"""
Sound map of a reference video or audio file: the music (tempo, key, sections, energy curve, instrument and
genre proposals), every sound effect with its time and type, the voice segments, and the mix loudness.

The agent cannot listen. Every value here is measured from the signal by the fixed rules written in
../references/sound-map.md. Instrument and genre lines are proposals with confidences; the user confirms them
in the stage 01 four-choice questions.

Writes into --out:
  sound_map.json   the map (schema version 1, references/sound-map.md section 1)
  SOUND-MAP.md     the same map for people
  sound-map.svg    a timeline picture: energy curve, sections, effect markers, voice segments

Usage (Windows, macOS, Linux; needs ffmpeg on PATH, and numpy plus scipy from requirements.txt):
    python sound_map.py <video or audio file> --out <folder>

For a reference, write into the reference folder itself, where the ice-remake recipe script reads
<ref>/sound_map.json by default:
    python sound_map.py <reference file> --out ice/reference/<ref-id>

Exit code: 0 on success, 2 for bad input (missing file, no audio stream, under 1 second),
3 for a missing package or a missing ffmpeg.
"""
from __future__ import annotations

import argparse
import json
import math
import re
import shutil
import subprocess
import sys
from datetime import date
from pathlib import Path

SR = 22050
N_FFT = 2048
HOP = 512
FPS = SR / HOP
N_BANDS = 24
FLOOR = 1e-8  # mean-square floor, -80 dBFS
VOICED_STRENGTH = 0.12  # pitch_track strength at which a frame counts as voiced
VOICE_SCORE = 0.6  # voice_evidence score from which a segment counts as voice
CONTINUOUS_VOCAL = 0.85  # share of the sounding time from which a vocal over music reads as probably sung
PITCH = ("C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B")
# Krumhansl-Kessler key profiles, index 0 = tonic.
KK_MAJOR = (6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88)
KK_MINOR = (6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17)
GUESS_NOTE = ("The agent cannot listen: instrumentation_guess and genre_guess are proposals from measured features. "
              "Confirm them with the user in the stage 01 four-choice questions before a recipe or a remake uses them.")

np = None
ndimage = None


def need_deps() -> None:
    global np, ndimage
    try:
        import numpy
        from scipy import ndimage as scipy_ndimage
    except ImportError as exc:
        sys.stderr.write(f"sound_map.py needs numpy and scipy ({exc.name} is missing). Install the pins in "
                         "skills/ice-audio/scripts/requirements.txt into a project virtual environment.\n")
        sys.exit(3)
    np, ndimage = numpy, scipy_ndimage
    if shutil.which("ffmpeg") is None:
        sys.stderr.write("sound_map.py needs ffmpeg on PATH (see the ice-engines skill for the install step).\n")
        sys.exit(3)


# ---------------------------------------------------------------- small helpers
def db(p):
    return 10.0 * np.log10(np.maximum(p, FLOOR))


def ramp(x: float, lo: float, hi: float) -> float:
    return float(min(1.0, max(0.0, (x - lo) / (hi - lo))))


def trap(x: float, a: float, b: float, c: float, d: float) -> float:
    """Trapezoid membership: 0 below a, 1 from b to c, 0 above d."""
    if x <= a or x >= d:
        return 0.0
    if b <= x <= c:
        return 1.0
    return (x - a) / (b - a) if x < b else (d - x) / (d - c)


def confidence(criteria: list[float], clarity: float) -> float:
    return round(min(0.95, 0.3 + 0.65 * (sum(criteria) / len(criteria)) * (0.5 + 0.5 * clarity)), 2)


def runs(mask) -> list[tuple[int, int]]:
    """Start and end frame (inclusive) of each run of True."""
    m = np.concatenate([[False], np.asarray(mask, bool), [False]]).astype(np.int8)
    d = np.diff(m)
    return list(zip(np.flatnonzero(d == 1).tolist(), (np.flatnonzero(d == -1) - 1).tolist()))


def merge_runs(rs: list[tuple[int, int]], gap: int) -> list[tuple[int, int]]:
    out: list[list[int]] = []
    for a, b in rs:
        if out and a - out[-1][1] - 1 <= gap:
            out[-1][1] = b
        else:
            out.append([a, b])
    return [(a, b) for a, b in out]


# ---------------------------------------------------------------- input
def decode(path: Path):
    cmd = ["ffmpeg", "-nostdin", "-v", "error", "-i", str(path), "-map", "0:a:0", "-vn", "-ac", "1",
           "-ar", str(SR), "-f", "f32le", "-"]
    r = subprocess.run(cmd, stdin=subprocess.DEVNULL, capture_output=True)
    if r.returncode != 0:
        msg = r.stderr.decode("utf-8", "replace").strip().splitlines()
        hint = "the input has no audio stream" if any("matches no streams" in s for s in msg) else (msg[-1] if msg else "")
        raise SystemExit(f"error: ffmpeg could not decode the audio of {path}: {hint}")
    return np.frombuffer(r.stdout, dtype="<f4").astype(np.float32)


def loudness(path: Path, notes: list[str]) -> dict:
    cmd = ["ffmpeg", "-nostdin", "-hide_banner", "-nostats", "-i", str(path), "-map", "0:a:0",
           "-af", "ebur128=peak=true", "-f", "null", "-"]
    r = subprocess.run(cmd, stdin=subprocess.DEVNULL, capture_output=True)
    err = r.stderr.decode("utf-8", "replace")
    summary = err[err.rfind("Summary:"):] if "Summary:" in err else ""

    def grab(pattern: str, fallback: float) -> float:
        m = re.search(pattern, summary)
        v = float(m.group(1)) if m else float("nan")
        return v if math.isfinite(v) else fallback

    num = r"(-?inf|-?\d+(?:\.\d+)?)"
    mix = {"integrated_lufs": round(grab(rf"I:\s+{num} LUFS", -70.0), 1),
           "true_peak_dbtp": round(grab(rf"Peak:\s+{num} dBFS", -70.0), 1),
           "lra": round(grab(rf"LRA:\s+{num} LU", 0.0), 1)}
    if not summary:
        notes.append("Loudness: ffmpeg ebur128 printed no summary; the mix values are placeholders.")
    return mix


# ---------------------------------------------------------------- spectral analysis
def spectrogram(x):
    pad = N_FFT // 2
    xp = np.pad(x, pad, mode="reflect")
    n_frames = 1 + (len(xp) - N_FFT) // HOP
    win = np.hanning(N_FFT + 1)[:-1].astype(np.float32)
    frames = np.lib.stride_tricks.sliding_window_view(xp, N_FFT)[::HOP][:n_frames]
    mag = np.empty((N_FFT // 2 + 1, n_frames), np.float32)
    for s in range(0, n_frames, 2048):
        mag[:, s:s + 2048] = np.abs(np.fft.rfft(frames[s:s + 2048] * win, axis=1)).T
    scale = 2.0 / (N_FFT * float(np.sum(win.astype(np.float64) ** 2)))  # band sums become mean-square (dBFS)
    return mag, scale


def band_layout():
    freqs = np.fft.rfftfreq(N_FFT, 1.0 / SR)
    edges = np.concatenate([[0.0], np.geomspace(40.0, SR / 2 + 1, N_BANDS)])
    idx = np.clip(np.searchsorted(edges, freqs, side="right") - 1, 0, N_BANDS - 1)
    B = np.zeros((N_BANDS, len(freqs)), np.float32)
    B[idx, np.arange(len(freqs))] = 1.0
    lo = edges[:-1].copy()
    lo[0] = 20.0
    return freqs, B, np.sqrt(lo * edges[1:])


def chroma_matrix(freqs):
    C = np.zeros((12, len(freqs)), np.float32)
    for i, f in enumerate(freqs):
        if 55.0 <= f <= 5000.0:
            C[int(round(69 + 12 * math.log2(f / 440.0))) % 12, i] = 1.0
    return C


# ---------------------------------------------------------------- tempo and beat grid
def tempo(onset):
    n = len(onset)
    if n < 4 * FPS:
        return 0.0, 0.0, None
    o = np.maximum(onset - ndimage.uniform_filter1d(onset, int(FPS)), 0)
    o = o - o.mean()
    spec = np.fft.rfft(o, 2 * n)
    ac = np.fft.irfft(np.abs(spec) ** 2)[:n]
    if ac[0] <= 0:
        return 0.0, 0.0, None
    ac = ac / ac[0]
    lo, hi = int(FPS * 60 / 200), min(int(FPS * 60 / 55) + 1, n // 2)
    if hi <= lo + 2:
        return 0.0, 0.0, None
    lags = np.arange(lo, hi)
    prior = np.exp(-0.5 * (np.log2(60 * FPS / lags / 120.0)) ** 2)
    best = int(lags[np.argmax(ac[lo:hi] * prior)])
    a, b, c = ac[best - 1], ac[best], ac[best + 1]
    den = a - 2 * b + c
    lag = best + (0.5 * (a - c) / den if den < 0 else 0.0)
    conf = ramp(float(b), 0.05, 0.5)
    return 60 * FPS / lag, conf, lag


def beat_grid(onset, lag: float):
    n = len(onset)
    best, phase = -1.0, 0.0
    for p in range(int(lag) + 1):
        idx = np.round(p + np.arange(0, (n - p) / lag) * lag).astype(int)
        s = float(onset[idx[idx < n]].sum())
        if s > best:
            best, phase = s, float(p)
    ks, js, ws = [], [], []
    for k in range(int((n - phase) / lag) + 1):
        c = int(round(phase + k * lag))
        lo, hi = max(0, c - 2), min(n, c + 3)
        if hi <= lo:
            continue
        j = lo + int(np.argmax(onset[lo:hi]))
        if onset[j] > 0:
            ks.append(k), js.append(j), ws.append(float(onset[j]))
    if len(ks) >= 4:
        lag, phase = np.polyfit(ks, js, 1, w=np.sqrt(ws))
    beats = (phase + lag * np.arange(0, int((n - phase) / lag) + 1)) / FPS
    return beats[beats >= 0], float(lag)


# ---------------------------------------------------------------- music bed
def periodic_bed(E, lag: float):
    """Median of the same bar phase over the neighbouring periods: the repeating music bed."""
    Em = ndimage.maximum_filter1d(E, 3, axis=1)
    T = E.shape[1]
    stack = np.full((5,) + E.shape, np.nan, np.float32)
    for i, k in enumerate((-2, -1, 0, 1, 2)):
        s = int(round(k * lag))
        if s >= 0:
            stack[i, :, :T - s] = Em[:, s:]
        else:
            stack[i, :, -s:] = Em[:, :T + s]
    return np.nanmedian(stack, axis=0)


def time_bed(E):
    return ndimage.median_filter(ndimage.maximum_filter1d(E, 3, axis=1), size=(1, int(8 * FPS) | 1), mode="nearest")


def choose_bed(E, Hb, Pb, beat_lag, tempo_ok: bool, notes: list[str]):
    T = E.shape[1]
    if tempo_ok:
        # The median frame cost ignores the minority of frames that hold effects, so a short period cannot win by
        # swallowing a long riser; ties within 0.5 dB go to the longer period, which keeps slow events visible.
        fits = []
        for mult in (1, 2, 3, 4):
            lag = beat_lag * mult
            if T < 3 * lag:
                continue
            bed = periodic_bed(E, lag)
            fits.append((float(np.median(np.sort(np.clip(db(E) - db(bed), 0, 30), axis=0)[-6:].mean(0))), mult, bed))
        if fits:
            floor_cost = min(f[0] for f in fits)
            _, mult, bed = max((f for f in fits if f[0] <= floor_cost + 0.5), key=lambda f: f[1])
            notes.append(f"Music bed: median of the same phase over neighbouring {mult}-beat periods.")
            return bed, periodic_bed(Hb, beat_lag * mult), periodic_bed(Pb, beat_lag * mult)
    notes.append("Music bed: no steady beat, so an 8 s running median is used; effects inside dense speech or "
                 "free-time music are less reliable.")
    return time_bed(E), time_bed(Hb), time_bed(Pb)


# ---------------------------------------------------------------- key
def key_of(chroma_total, notes: list[str]):
    if chroma_total.sum() <= 0:
        return "", ""
    v = chroma_total / chroma_total.sum()
    scores = []
    for mode, prof in (("major", KK_MAJOR), ("minor", KK_MINOR)):
        p = np.array(prof)
        for k in range(12):
            scores.append((float(np.corrcoef(v, np.roll(p, k))[0, 1]), PITCH[k], mode))
    scores.sort(reverse=True)
    (r, key, mode), r2 = scores[0], scores[1][0]
    notes.append(f"Key {key} {mode}: profile correlation {r:.2f}, margin over the next key {r - r2:.2f}"
                 + (" (low: treat the key as unknown)." if r < 0.6 or r - r2 < 0.03 else "."))
    return key, mode


# ---------------------------------------------------------------- sections
def novelty_cuts(E, chroma):
    """Block times (0.5 s blocks) of self-similarity novelty peaks: changes of texture or harmony."""
    blk = int(round(0.5 * FPS))
    nb = E.shape[1] // blk
    if nb < 8:
        return []
    bdb = db(E[:, :nb * blk]).reshape(N_BANDS, nb, blk).mean(2)
    ch = chroma[:, :nb * blk].reshape(12, nb, blk).sum(2)
    ch = ch / (ch.sum(0, keepdims=True) + 1e-12)
    F = np.vstack([bdb, ch])
    F = (F - F.mean(1, keepdims=True)) / (F.std(1, keepdims=True) + 1e-6)
    F = F / (np.linalg.norm(F, axis=0, keepdims=True) + 1e-9)
    S = F.T @ F
    W = int(min(16, max(3, nb // 8)))
    off = np.arange(-W, W) + 0.5
    g = np.sign(off) * np.exp(-0.5 * (off / (0.5 * W)) ** 2)
    K = np.outer(g, g)
    K /= np.abs(K).sum()
    nov = np.zeros(nb)
    for i in range(W, nb - W + 1):
        nov[i] = float((K * S[i - W:i + W, i - W:i + W]).sum())
    cuts = []
    for i in np.argsort(-nov):
        if nov[i] < 0.25:
            break
        if all(abs(i - c) >= W for c in cuts):
            cuts.append(int(i))
    return [c * blk / FPS for c in cuts]


def level_steps(level):
    """Frames where the mean level of the next 1.5 s differs from the previous 1.5 s by 4 dB or more, each moved to
    the sharpest rise or fall within 0.5 s. Returns (frame, step in dB)."""
    T, w = len(level), int(1.5 * FPS)
    if T <= 2 * w:
        return []
    cs = np.concatenate([[0.0], np.cumsum(level)])
    idx = np.arange(w, T - w)
    step = np.zeros(T)
    step[idx] = (cs[idx + w] - cs[idx]) / w - (cs[idx] - cs[idx - w]) / w
    d = np.zeros(T)
    d[3:-3] = level[6:] - level[:-6]
    out = []
    for i in np.argsort(-np.abs(step)):
        if abs(step[i]) < 4:
            break
        if all(abs(i - j) >= w for j, _ in out):
            lo, hi = max(0, i - int(0.5 * FPS)), min(T, i + int(0.5 * FPS) + 1)
            j = lo + int(np.argmax(d[lo:hi] * np.sign(step[i])))
            out.append((j, float(step[i])))
    return sorted(out)


def final_hit(level, duration):
    """Time of a last hit in the final 6 s that rings out to the end: 12 dB of decay, no new rise of 6 dB."""
    T = len(level)
    a = max(0, T - int(6 * FPS))
    if T - a < int(1.5 * FPS):
        return None
    seg = level[a:]
    peaks = np.flatnonzero((seg[1:-1] >= seg[:-2]) & (seg[1:-1] > seg[2:]) & (seg[1:-1] >= seg.max() - 6)) + 1
    if not len(peaks):
        return None
    pk = a + int(peaks[-1])  # the last loud peak, not the loudest: the groove before it can be louder
    before = level[max(0, pk - int(2 * FPS)):max(1, pk - int(0.3 * FPS))]
    if level[pk] - np.median(before) < 6:
        return None  # a beat like the ones before it, not a final hit
    post = level[pk:]
    if len(post) < int(0.5 * FPS) or level[pk] - post[-max(1, len(post) // 3):].mean() < 12:
        return None
    later = post[int(0.3 * FPS):]
    if len(later) and np.any(later - np.minimum.accumulate(later) > 6):
        return None
    lo = max(0, pk - int(0.3 * FPS))
    rise = np.diff(level[lo:pk + 1], prepend=level[lo])
    return (lo + int(np.argmax(rise))) / FPS


def sections(E, chroma, onset, beats, tempo_ok: bool, duration: float, notes: list[str]):
    total = db(E.sum(0))
    if duration < 4:
        return [{"start": 0.0, "end": round(duration, 3), "label": "main", "energy": 1.0}]
    level = ndimage.uniform_filter1d(total, max(1, int(0.1 * FPS)))
    steps = level_steps(ndimage.uniform_filter1d(total, max(1, int(0.25 * FPS))))
    cuts = [(j / FPS, s) for j, s in steps]
    cuts += [(t, 0.0) for t in novelty_cuts(E, chroma) if all(abs(t - c) >= 2.0 for c, _ in cuts)]
    hit = final_hit(level, duration)
    outro_start = None
    if hit is not None:
        falls = [c for c, s in cuts if s < 0 and hit - 4.5 <= c <= hit - 0.5]
        outro_start = max(falls) if falls else hit
        cuts = [(c, s) for c, s in cuts if c < outro_start - 1.0] + [(outro_start, -1.0)]
        notes.append(f"Final hit at {hit:.2f} s rings out to the end: the outro starts at {outro_start:.2f} s.")
    times = []
    for c, _ in sorted(cuts, key=lambda cs: -abs(cs[1]) - (100 if cs[0] == outro_start else 0)):
        if 1.0 <= c <= duration - 1.0 and all(abs(c - t) >= 1.5 for t in times):
            times.append(c)
    times.sort()
    if tempo_ok and len(beats):
        times = [float(beats[np.argmin(np.abs(beats - t))]) if t != outro_start and np.min(np.abs(beats - t)) <= 0.15 else t for t in times]
    edges = [0.0] + times + [duration]
    thr = onset.mean() + onset.std()
    secs = []
    for a, b in zip(edges[:-1], edges[1:]):
        fa, fb = int(a * FPS), max(int(a * FPS) + 1, int(b * FPS))
        lev = total[fa:fb]
        o = onset[fa:fb]
        peaks = int(np.sum((o[1:-1] > thr) & (o[1:-1] >= o[:-2]) & (o[1:-1] > o[2:]))) if len(o) > 2 else 0
        secs.append({"start": round(a, 3), "end": round(b, 3), "db": float(db(np.mean(10 ** (lev / 10)))),
                     "density": peaks / max(b - a, 1e-3)})
    top_db = max(s["db"] for s in secs)
    for s in secs:
        s["energy"] = round(max(0.0, min(1.0, 1 - (top_db - s["db"]) / 24)), 2)
        s["intensity"] = 0.65 * s["energy"] + 0.35 * min(1.0, s["density"] / 4)  # 4 onsets/s = a full groove
    n = len(secs)
    labels = ["main"] * n
    last_is_outro = n > 1 and (hit is not None or secs[-1]["intensity"] < secs[-2]["intensity"] - 0.05)
    body = range(n - 1) if last_is_outro else range(n)
    top = max(secs[i]["intensity"] for i in body)
    for i in body:
        if i and secs[i]["intensity"] >= top - 0.1 and secs[i - 1]["intensity"] <= secs[i]["intensity"] - 0.12:
            labels[i] = "drop"
    for i in body:
        if 0 < i < n - 1 and labels[i] == "main" and secs[i]["intensity"] <= min(secs[i - 1]["intensity"], secs[i + 1]["intensity"]) - 0.12:
            labels[i] = "break"
    for i in body:
        if labels[i] == "drop" and i + 2 < n and labels[i + 1] == "break" and labels[i + 2] == "drop":
            labels[i] = "build"  # the peak of a build that breathes before the real drop
    for i in body:
        if labels[i] != "drop":
            continue
        j = i - 1
        while j > 0 and labels[j] in ("main", "break", "build"):
            if labels[j] == "main":
                if secs[j]["intensity"] >= top - 0.1 and labels[j + 1] != "break":
                    break  # a loud section that does not breathe before the drop is not part of its build
                labels[j] = "build"
            j -= 1
    i = 0
    while i < n - 1 and labels[i] in ("main", "break") and secs[i]["intensity"] < top - 0.1:
        labels[i] = "intro"  # everything quiet before the music gets going
        i += 1
    if last_is_outro:
        labels[-1] = "outro"
    out = []
    for s, lab in zip(secs, labels):
        if out and out[-1]["label"] == lab:
            prev = out[-1]
            w0, w1 = prev["end"] - prev["start"], s["end"] - s["start"]
            prev["energy"] = round((prev["energy"] * w0 + s["energy"] * w1) / (w0 + w1), 2)
            prev["end"] = s["end"]
        else:
            out.append({"start": s["start"], "end": s["end"], "label": lab, "energy": s["energy"]})
    return out


# ---------------------------------------------------------------- voice
def pitch_track(Hmag, freqs):
    """Per frame: the strongest harmonic series with f0 from 80 to 400 Hz (1/8 semitone grid) and its strength, the
    weighted magnitude on its first 8 harmonics over all harmonic magnitude from 80 Hz to 4 kHz."""
    f0s = 80.0 * 2 ** (np.arange(int(96 * math.log2(5)) + 1) / 96)
    df = freqs[1]
    W = np.zeros((len(f0s), len(freqs)), np.float32)
    for i, f0 in enumerate(f0s):
        for h in range(1, 9):
            k = h * f0 / df
            if h * f0 > 4000:
                break
            k0 = int(k)
            W[i, k0] += (1 - (k - k0)) * 0.85 ** (h - 1)
            W[i, k0 + 1] += (k - k0) * 0.85 ** (h - 1)
    sal = W @ Hmag
    best = sal.argmax(0)
    band = (freqs >= 80) & (freqs <= 4000)
    strength = sal[best, np.arange(sal.shape[1])] / (Hmag[band].sum(0) + 1e-9)
    return f0s[best], strength


def moving_part(Hmag):
    """Harmonic magnitude minus its slow per-bin median (2 s blocks, median of three neighbours): held notes and
    pads drop out, a voice's moving partials stay."""
    blk = int(2 * FPS)
    T = Hmag.shape[1]
    nb = max(1, -(-T // blk))
    pad = np.pad(Hmag, ((0, 0), (0, nb * blk - T)), mode="edge")
    med = np.median(pad.reshape(Hmag.shape[0], nb, blk), axis=2)
    med = ndimage.median_filter(med, size=(1, 3), mode="nearest")
    return np.maximum(Hmag - np.repeat(med, blk, axis=1)[:, :T], 0)


def formant_profile(Hpow, freqs):
    """Sixth-octave harmonic levels from 250 Hz to 3.5 kHz per frame, mean removed: the shape of the voice band."""
    edges = np.geomspace(250.0, 3500.0, 24)
    idx = np.searchsorted(edges, freqs, side="right") - 1
    ok = (idx >= 0) & (idx < len(edges) - 1)
    B = np.zeros((len(edges) - 1, len(freqs)), np.float32)
    B[idx[ok], np.flatnonzero(ok)] = 1.0
    prof = db(B @ Hpow)
    return prof - prof.mean(0, keepdims=True)


def voice_candidates(Hb, ref, fc):
    """Windows whose harmonic voice-band level over the bed moves at the syllable rate (2.5 to 8 Hz)."""
    band = (fc >= 250) & (fc <= 3500)
    power = np.maximum(Hb[band] - ref[band], 0).sum(0)
    lev = db(power)
    amp = np.sqrt(power)
    win, hop = int(FPS), max(1, int(FPS * 0.25))
    freqs = np.fft.rfftfreq(win, 1.0 / FPS)
    syll = (freqs >= 2.5) & (freqs <= 8.0)
    body = freqs >= 1.0
    cand = np.zeros(len(lev), bool)
    for s in range(0, max(1, len(lev) - win + 1), hop):
        seg = lev[s:s + win]
        if len(seg) < win or np.mean(seg > -50) < 0.4 or np.std(np.maximum(seg, -60)) < 3:
            continue
        env = amp[s:s + win]
        p = np.abs(np.fft.rfft(env - env.mean())) ** 2
        if p[syll].sum() / (p[body].sum() + 1e-12) >= 0.35:
            cand[s:s + win] = True
    segs = [(a / FPS, (b + 1) / FPS) for a, b in merge_runs(runs(cand), int(0.4 * FPS))]
    return [(a, b) for a, b in segs if b - a >= 0.8], lev


def held_notes(semis, voiced) -> tuple[float, float, int]:
    """Over voiced runs of 0.2 s or more, split at jumps over 1 semitone: the share of time on held notes (pieces of
    0.15 s or more within 1 semitone of their median; singing holds notes, speech glides) and the share of held time
    with vibrato (detrended pitch moving 0.1 to 1.2 semitones RMS and crossing its mean 8 to 16 times a second, a
    4 to 8 Hz wobble that a voice has and a synth note or a horn does not), and the number of held notes."""
    held = vib = total = notes = 0
    for a, b in runs(voiced):
        if (b - a + 1) / FPS < 0.2:
            continue
        seg = semis[a:b + 1]
        total += len(seg)
        for piece in np.split(seg, np.flatnonzero(np.abs(np.diff(seg)) > 1) + 1):
            if len(piece) / FPS < 0.15 or np.any(np.abs(piece - np.median(piece)) > 1.0):
                continue
            held += len(piece)
            notes += 1
            if len(piece) / FPS >= 0.25:
                tt = np.arange(len(piece))
                r = piece - np.polyval(np.polyfit(tt, piece, 1), tt)
                zc = np.sum(np.diff(np.sign(r)) != 0) / (len(piece) / FPS)
                if 0.1 <= np.sqrt(np.mean(r ** 2)) <= 1.2 and 8 <= zc <= 16:
                    vib += len(piece)
    return (held / total, vib / max(held, 1), notes) if total else (0.0, 0.0, 0)


def formant_movement(p) -> float:
    if p.shape[1] <= 5:
        return 0.0
    x, y = p[:, :-4], p[:, 4:]
    corr = (x * y).sum(0) / (np.linalg.norm(x, axis=0) * np.linalg.norm(y, axis=0) + 1e-9)
    return float(np.mean(1 - corr))


def sung_segments(f0, strength, prof):
    """4 s windows (every 1 s) of a sung line: mostly voiced, a new held note about every second or faster, vibrato, and vowel changes in the
    voice band (an instrument lead holds notes with one fixed timbre). Returns [(start, end, confidence)]."""
    semis = 12 * np.log2(f0)
    voiced = strength >= VOICED_STRENGTH
    T, win, hop = len(f0), int(4 * FPS), int(1.0 * FPS)
    conf = np.zeros(T)
    for s in range(0, max(1, T - win + 1), hop):
        v = voiced[s:s + win]
        if len(v) < win or v.mean() < 0.5:
            continue
        held, vib, notes = held_notes(semis[s:s + win], v)
        c = min(ramp(held, 0.45, 0.75), ramp(vib, 0.3, 0.5), ramp(formant_movement(prof[:, s:s + win]), 0.1, 0.25),
                ramp(notes / (win / FPS), 0.8, 1.5))  # a sung line changes note at least about once a second
        conf[s:s + win] = np.maximum(conf[s:s + win], c)
    out = []
    for a, b in merge_runs(runs(conf >= 0.5), int(0.5 * FPS)):
        if (b - a + 1) / FPS >= 3.0:
            out.append((a / FPS, (b + 1) / FPS, float(conf[a:b + 1].mean())))
    return out


def voice_evidence(a, b, lev, f0, strength, prof, beat_period, tempo_ok):
    """Score 0 to 1 that a syllable-rate segment is speech, from four measured cues (references/sound-map.md 2.11)."""
    fr = slice(int(a * FPS), int(b * FPS))
    voiced = strength[fr] >= VOICED_STRENGTH
    semis = 12 * np.log2(f0[fr])
    both = voiced[1:] & voiced[:-1]
    d = np.abs(np.diff(semis))[both]
    near = d[d <= 3]
    continuity = len(near) / max(len(d), 1)
    glide = float(np.mean((near >= 0.1) & (near <= 1.5))) if len(near) >= 5 else 0.0
    harmonic = trap(float(voiced.mean()), 0.1, 0.25, 0.8, 0.95)
    movement = formant_movement(prof[:, fr])
    lock = 0.0
    if tempo_ok and beat_period > 0:
        seg = lev[fr]
        rise = np.maximum(np.diff(seg), 0)
        t = (np.arange(len(rise)) + 1 + int(a * FPS)) / FPS
        if rise.sum() > 0:
            for period in (beat_period, beat_period / 2):
                lock = max(lock, float(np.abs((rise * np.exp(2j * np.pi * t / period)).sum()) / rise.sum()))
    cues = {"harmonicity": harmonic, "pitch glide": ramp(glide * continuity, 0.25, 0.55),
            "formant movement": ramp(movement, 0.15, 0.4), "off the beat grid": 1 - ramp(lock, 0.35, 0.65)}
    return min(cues.values()) * 0.5 + 0.5 * sum(cues.values()) / len(cues), cues


# ---------------------------------------------------------------- sound effects
def refine_onset(x, t: float) -> float:
    a, b = max(0, int((t - 0.08) * SR)), min(len(x), int((t + 0.12) * SR))
    seg = x[a:b].astype(np.float64)
    if len(seg) < 64:
        return t
    env = np.sqrt(ndimage.uniform_filter1d(seg ** 2, max(1, int(0.002 * SR))))
    lo, hi = float(np.percentile(env, 20)), float(env.max())
    if hi <= lo:
        return t
    return (a + int(np.argmax(env >= lo + 0.3 * (hi - lo)))) / SR


def detect_sfx(x, E, Hb, Pb, bed, bedH, bedP, fc, edges_t, notes: list[str]):
    evb = np.maximum(E - bed, 0)
    evdb_b = db(evb)
    evtot = evb.sum(0)
    evdb = db(evtot)
    share = evtot / (E.sum(0) + FLOOR)
    X = db(E) - db(bed)
    score = ndimage.uniform_filter1d(np.sort(np.clip(X, 0, 30), axis=0)[-6:].mean(0), 3)
    evH = np.maximum(Hb - bedH, 0).sum(0)
    evP = np.maximum(Pb - bedP, 0).sum(0)
    jump = evdb_b - np.concatenate([evdb_b[:, :1], evdb_b[:, :1], evdb_b[:, :-2]], axis=1)
    sharp_n = ((jump > 9) & (evdb_b > -60) & (X > 6)).sum(0)
    sharp = (sharp_n >= 4) & (sharp_n == ndimage.maximum_filter1d(sharp_n, 5))
    sharp_frames = [a for a, _ in runs(sharp)]
    edge = (score >= 3) & (evdb >= -60)
    core = (score >= 8) & (share >= 0.3) & (evdb >= -50)
    regions = [(a, b) for a, b in merge_runs(runs(edge), 4) if core[a:b + 1].any()]
    subs = []
    for a, b in regions:
        cuts = [s for s in sharp_frames if a + 6 <= s <= b - 1]
        bounds = [a] + cuts + [b + 1]
        for s, e in zip(bounds[:-1], bounds[1:]):
            if e - 1 >= s:
                subs.append((s, e - 1, s in cuts))
    low = fc < 150
    events, dropped = [], 0
    for i, (a, b, split_start) in enumerate(subs):
        n = b - a + 1
        seg = slice(a, b + 1)
        L = ndimage.uniform_filter1d(evdb[seg], 3) if n >= 3 else evdb[seg].copy()
        pk = a + int(np.argmax(L))
        dur = n / FPS
        pp = (pk - a) / max(n - 1, 1)
        tt = np.arange(n) / FPS
        valid = L > L.max() - 30
        slope = float(np.polyfit(tt[valid], L[valid], 1)[0]) if valid.sum() >= 3 else 0.0
        cent = (fc[:, None] * evb[:, seg]).sum(0) / (evtot[seg] + 1e-20)
        lc = ndimage.uniform_filter1d(np.log2(np.maximum(cent, 20.0)), 3) if n >= 3 else np.log2(np.maximum(cent, 20.0))
        cv = np.flatnonzero(L > L.max() - 20)
        crange = float(lc[cv].max() - lc[cv].min()) if len(cv) else 0.0
        third = max(1, len(cv) // 3)
        cdelta = float(lc[cv[-third:]].mean() - lc[cv[:third]].mean()) if len(cv) >= 3 else 0.0
        tonal = float(evH[seg].sum() / (evH[seg].sum() + evP[seg].sum() + 1e-20))
        bands_ratio = float(np.mean(X[:, pk] > 6))
        low_excess = float(X[low, pk].max())
        cpeak = float(cent[pk - a])
        below = np.flatnonzero(L[pk - a:] < L[pk - a] - 20)
        decay = (below[0] if len(below) else n - (pk - a)) / FPS
        clarity = ramp(float(score[seg].max()), 6, 14)
        sharp_start = split_start or any(a - 2 <= s <= a + 2 for s in sharp_frames)
        attack = (pk - a) / FPS
        nxt = subs[i + 1] if i + 1 < len(subs) else None
        ends_in_hit = bool(nxt and nxt[2] and nxt[0] - b <= int(0.3 * FPS)) or bool(
            nxt and nxt[0] - b <= int(0.3 * FPS) and any(nxt[0] - 2 <= s <= nxt[0] + 2 for s in sharp_frames))
        t0 = a / FPS
        edge_dist = min([abs(t0 - e) for e in edges_t] or [99.0])
        kind, conf = None, 0.0
        if sharp_start and attack <= 0.1:
            t0 = refine_onset(x, t0)
            if dur <= 0.12 and cpeak >= 2500 and bands_ratio < 0.45:
                kind, conf = "click", confidence([1 - ramp(dur, 0.06, 0.15), ramp(cpeak, 2000, 5000), 1 - ramp(bands_ratio, 0.3, 0.6)], clarity)
            elif tonal >= 0.6 and edge_dist <= 0.6:
                kind, conf = "stinger", confidence([ramp(tonal, 0.55, 0.8), 1 - ramp(edge_dist, 0.3, 0.8), 1 - ramp(dur, 1.5, 3.0)], clarity)
            elif bands_ratio >= 0.3 or low_excess >= 12:
                kind, conf = "impact", confidence([max(ramp(bands_ratio, 0.25, 0.6), ramp(low_excess, 10, 20)), 1 - ramp(attack, 0.03, 0.12),
                                                   1 - ramp(decay, 0.8, 2.0), 1 - ramp(tonal, 0.6, 0.85)], clarity)
            else:
                kind, conf = "other", round(0.15 + 0.3 * clarity, 2)
        else:
            if dur > 8:
                dropped += 1
                continue
            if dur >= 1.5 and abs(slope) < 2 and crange < 0.6:
                dropped += 1
                continue
            if dur >= 0.8 and pp >= 0.65 and slope >= 3 and cdelta >= 0.3:
                kind, conf = "riser", confidence([ramp(dur, 0.8, 2.0), ramp(pp, 0.5, 0.85), ramp(slope, 3, 10), ramp(cdelta, 0.3, 1.0),
                                                  1.0 if ends_in_hit else 0.5], clarity)
            elif dur >= 0.6 and pp <= 0.35 and slope <= -3 and cdelta <= -0.3:
                kind, conf = "downer", confidence([ramp(dur, 0.6, 1.5), ramp(-slope, 3, 10), ramp(-cdelta, 0.3, 1.0)], clarity)
            elif 0.15 <= dur <= 1.6 and crange >= 0.6 and tonal < 0.65:
                kind, conf = "whoosh", confidence([ramp(crange, 0.5, 1.5), 1 - ramp(tonal, 0.5, 0.8), ramp(min(pp, 1 - pp), 0.05, 0.25),
                                                   1 - ramp(abs(dur - 0.7), 0.6, 0.9)], clarity)
            elif dur >= 0.8 and slope >= 2 and tonal >= 0.55:
                kind, conf = "swell", confidence([ramp(dur, 0.8, 2.0), ramp(slope, 2, 6), ramp(tonal, 0.55, 0.8), 1 - ramp(abs(cdelta), 0.4, 1.0)], clarity)
            elif dur < 0.15 and cpeak >= 2500:
                kind, conf = "click", confidence([1 - ramp(dur, 0.06, 0.15), ramp(cpeak, 2000, 5000)], clarity)
            else:
                kind, conf = "other", round(0.15 + 0.3 * clarity, 2)
        end_t = (b + 1) / FPS
        events.append({"t": round(t0, 3), "dur": round(max(end_t - t0, 1 / FPS), 3), "type": kind, "confidence": conf,
                       "peak_db": round(float(evdb[seg].max()), 1), "_wide": bands_ratio, "_tonal": tonal})
    if dropped:
        notes.append(f"{dropped} long flat level steps were read as section changes, not effects.")
    return events


# ---------------------------------------------------------------- guesses
def guesses(E, Hb, Pb, fc, music_frames, tempo_bpm, tempo_conf, onset, voice_cov, lra, brightness, notes):
    if not music_frames.any():
        return [], []
    e, h, p = E[:, music_frames].sum(1), Hb[:, music_frames].sum(1), Pb[:, music_frames].sum(1)
    st, sh, sp = e.sum() + 1e-20, h.sum() + 1e-20, p.sum() + 1e-20
    perc = float(sp / st)
    low = float(e[fc < 150].sum() / st)
    lowP, highP, midP = p[fc < 150].sum() / sp, p[fc > 5000].sum() / sp, p[(fc >= 150) & (fc <= 5000)].sum() / sp
    lowH, midH, highH = h[fc < 200].sum() / sh, h[(fc >= 200) & (fc <= 4000)].sum() / sh, h[fc > 4000].sum() / sh
    mid_band = (fc >= 200) & (fc <= 4000)
    mh = ndimage.uniform_filter1d(db(Hb[mid_band].sum(0)), int(FPS / 2))[music_frames]
    sustain_std = float(np.std(mh))
    hflux = np.maximum(np.diff(db(Hb[mid_band]), axis=1), 0).sum(0)
    secs = music_frames.sum() / FPS
    h_onsets = float((hflux > hflux.mean() + 2 * hflux.std()).sum() / max(secs, 1e-3))
    o_onsets = float((onset > onset.mean() + onset.std()).sum() / max(secs, 1e-3))
    pulse = ramp(tempo_conf, 0.2, 0.6)
    inst = [
        ("kick or bass drum", 0.7 * ramp(lowP, 0.1, 0.35) * pulse),
        ("hi-hats or cymbals", 0.7 * ramp(highP, 0.05, 0.25) * ramp(o_onsets, 1, 4)),
        ("snare, clap or hand percussion", 0.6 * ramp(midP, 0.2, 0.5) * pulse),
        ("bass (synth or electric)", 0.7 * ramp(lowH, 0.1, 0.35)),
        ("sustained pads, strings or organ", 0.6 * ramp(midH, 0.2, 0.5) * (1 - ramp(sustain_std, 3, 8))),
        ("plucked or struck keys and strings", 0.6 * ramp(midH, 0.2, 0.5) * ramp(h_onsets, 0.5, 3)),
        ("bright leads, brass or distorted synth", 0.5 * ramp(highH, 0.05, 0.2)),
        ("spoken voice over the music", 0.6 * ramp(voice_cov, 0.1, 0.5)),
    ]
    T = tempo_bpm if tempo_conf >= 0.35 else 0.0
    # Each family is a weighted mean of memberships (cue, weight), so one feature off the typical range lowers a
    # family's score instead of zeroing it. Tempo terms are 0 when the beat is not steady.
    genre = [
        ("electronic dance, four on the floor", [(trap(T, 110, 118, 132, 140), 2), (pulse, 2), (ramp(low, 0.15, 0.4), 1), (ramp(o_onsets, 2, 5), 1)]),
        ("hip-hop or trap", [(max(trap(T, 60, 68, 95, 100), trap(T, 125, 132, 160, 165)), 2), (ramp(low, 0.3, 0.55), 2), (pulse, 1),
                             (1 - ramp(brightness, 0.4, 0.6), 0.5)]),
        ("drum and bass or breakbeat", [(trap(T, 155, 160, 180, 185), 3), (ramp(o_onsets, 3, 6), 1)]),
        ("pop or rock band", [(trap(T, 85, 95, 140, 150), 1.5), (pulse, 1), (trap(low, 0.05, 0.12, 0.35, 0.45), 1), (ramp(voice_cov, 0.1, 0.4), 1),
                              (trap(perc, 0.15, 0.25, 0.45, 0.6), 0.5)]),
        ("cinematic or orchestral underscore", [(1 - pulse, 1.5), (1 - ramp(perc, 0.25, 0.45), 1), (ramp(lra, 6, 12), 1.5)]),
        ("ambient or drone", [(1 - pulse, 2), (1 - ramp(o_onsets, 0.5, 2.5), 1.5), (1 - ramp(lra, 8, 14), 0.5)]),
        ("acoustic or folk", [(1 - ramp(low, 0.1, 0.3), 3), (1 - ramp(perc, 0.3, 0.5), 1), (trap(T, 70, 80, 130, 145), 1),
                              (1 - ramp(brightness, 0.55, 0.75), 0.5)]),
        ("upbeat corporate background", [(trap(T, 92, 100, 125, 132), 1.5), (pulse, 1), (ramp(brightness, 0.4, 0.6), 1.5), (1 - ramp(lra, 6, 10), 1)]),
        ("lo-fi or chill", [(trap(T, 65, 72, 92, 98), 2), (pulse, 1), (1 - ramp(brightness, 0.35, 0.55), 1)]),
    ]
    scored = [(name, sum(m * w for m, w in cues) / sum(w for _, w in cues)) for name, cues in genre]
    inst_out = sorted(({"name": n, "confidence": round(min(0.7, c), 2)} for n, c in inst if c >= 0.15), key=lambda d: -d["confidence"])[:6]
    genre_out = sorted(({"name": n, "confidence": round(0.6 * c, 2)} for n, c in scored if c >= 0.5), key=lambda d: -d["confidence"])[:3]
    best = max(scored, key=lambda nc: nc[1])
    if not genre_out:
        notes.append(f"No genre proposal: no family fits half its cues (best: {best[0]}, {best[1]:.2f}). Ask the user for the genre.")
    return inst_out, genre_out


# ---------------------------------------------------------------- outputs
SVG_COLORS = {"impact": "#c0392b", "whoosh": "#2e86c1", "riser": "#d68910", "downer": "#7d3c98", "click": "#5d6d7e",
              "swell": "#17a589", "stinger": "#b7950b", "other": "#909497"}
SECTION_COLORS = {"intro": "#eaf2f8", "build": "#fef5e7", "drop": "#fdedec", "break": "#e8f8f5", "main": "#f4f6f6", "outro": "#f5eef8"}


def write_svg(path: Path, m: dict, title: str) -> None:
    W, H, L, R = 1200, 360, 60, 20
    dur = max(m["duration_s"], 1e-3)
    pw = W - L - R

    def X(t: float) -> float:
        return round(L + pw * min(max(t, 0.0), dur) / dur, 1)

    y0, y1 = 60, 210  # energy plot, top and bottom
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="sans-serif" font-size="11">',
           f'<rect width="{W}" height="{H}" fill="#ffffff"/>',
           f'<text x="{L}" y="18" font-size="13" fill="#1b2631">{esc(title)}</text>']
    for s in m["music"]["sections"]:
        out.append(f'<rect x="{X(s["start"])}" y="28" width="{max(1, X(s["end"]) - X(s["start"]))}" height="{y1 - 28}" '
                   f'fill="{SECTION_COLORS.get(s["label"], "#f4f6f6")}" stroke="#d5d8dc"/>')
        out.append(f'<text x="{X(s["start"]) + 4}" y="42" fill="#566573">{esc(s["label"])} {s["energy"]:.2f}</text>')
    for v in (-60, -40, -20, 0):
        yy = y1 - (v + 60) / 60 * (y1 - y0)
        out.append(f'<line x1="{L}" x2="{W - R}" y1="{yy:.1f}" y2="{yy:.1f}" stroke="#e5e7e9"/>')
        out.append(f'<text x="{L - 6}" y="{yy + 4:.1f}" text-anchor="end" fill="#7f8c8d">{v}</text>')
    out.append(f'<text x="{W - R - 4}" y="{y0 - 4}" text-anchor="end" fill="#2e86c1">brightness 1</text>')
    out.append(f'<text x="{W - R - 4}" y="{y1 - 4}" text-anchor="end" fill="#2e86c1">0</text>')
    curve = m["music"]["energy_curve"]
    if curve:
        pts = " ".join(f'{X(c["t"])},{y1 - (min(max(c["rms_db"], -60), 0) + 60) / 60 * (y1 - y0):.1f}' for c in curve)
        out.append(f'<polyline points="{pts}" fill="none" stroke="#1b2631" stroke-width="1.6"/>')
        pts = " ".join(f'{X(c["t"])},{y1 - c["brightness"] * (y1 - y0):.1f}' for c in curve)
        out.append(f'<polyline points="{pts}" fill="none" stroke="#2e86c1" stroke-width="1" stroke-dasharray="4 3"/>')
    for e in m["sfx"]:
        c = SVG_COLORS.get(e["type"], "#909497")
        out.append(f'<line x1="{X(e["t"])}" x2="{X(e["t"])}" y1="28" y2="{y1}" stroke="{c}" stroke-width="1.2"/>')
        out.append(f'<rect x="{X(e["t"])}" y="{y1 + 10}" width="{max(2, X(e["t"] + e["dur"]) - X(e["t"]))}" height="14" fill="{c}" opacity="0.8"/>')
        out.append(f'<text x="{X(e["t"]) + 2}" y="{y1 + 38}" fill="{c}" transform="rotate(30 {X(e["t"]) + 2} {y1 + 38})">{e["type"]} {e["confidence"]:.2f}</text>')
    for seg in m["voice"]["segments"]:
        out.append(f'<rect x="{X(seg["start"])}" y="{y1 + 72}" width="{max(2, X(seg["end"]) - X(seg["start"]))}" height="10" fill="#28b463"/>')
    out.append(f'<text x="{L - 6}" y="{y1 + 81}" text-anchor="end" fill="#28b463">voice</text>')
    out.append(f'<text x="{L - 6}" y="{y1 + 21}" text-anchor="end" fill="#566573">sfx</text>')
    step = next(s for s in (0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 1e9) if dur / s <= 16)
    k = 0
    while k * step <= dur + 1e-9:
        t = k * step
        out.append(f'<line x1="{X(t)}" x2="{X(t)}" y1="{y1 + 92}" y2="{y1 + 98}" stroke="#7f8c8d"/>')
        out.append(f'<text x="{X(t)}" y="{y1 + 110}" text-anchor="middle" fill="#7f8c8d">{t:g}s</text>')
        k += 1
    out.append(f'<text x="{L}" y="{H - 8}" fill="#566573">solid: level (dBFS RMS)   dashed: brightness 0..1   '
               'shaded: sections with energy   bars: effects and voice</text>')
    out.append("</svg>")
    path.write_text("\n".join(out) + "\n", encoding="utf-8")


def esc(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def vocal_reading(m: dict) -> float:
    """Confidence of `sung vocals` in the map, 0 when the map proposes none."""
    return next((g["confidence"] for g in m["music"]["instrumentation_guess"] if g["name"] == "sung vocals"), 0.0)


def write_md(path: Path, m: dict, source: str) -> None:
    mu, mix = m["music"], m["mix"]
    lines = [f"# Sound map: {source}", "",
             f"Measured {date.today().isoformat()} by `sound_map.py` (schema version {m['version']}). Duration {m['duration_s']:.2f} s.", "",
             "![Sound map timeline](sound-map.svg)", "",
             "> The agent cannot listen. Instruments and genre below are proposals from measured features; "
             "confirm them with the user in the stage 01 four-choice questions. Field meanings: "
             "`skills/ice-audio/references/sound-map.md`.", "",
             "## Mix", "",
             f"Integrated {mix['integrated_lufs']} LUFS, true peak {mix['true_peak_dbtp']} dBTP, loudness range {mix['lra']} LU.", "",
             "## Music", ""]
    if mu["present"]:
        key = f"{mu['key']} {mu['mode']}" if mu["key"] else "unknown"
        lines += [f"Present. Tempo {mu['tempo_bpm']} BPM (confidence {mu['tempo_confidence']}). Key {key}.", "",
                  "| Start s | End s | Label (guess) | Energy 0-1 |", "|---|---|---|---|"]
        lines += [f"| {s['start']:.2f} | {s['end']:.2f} | {s['label']} | {s['energy']:.2f} |" for s in mu["sections"]]
        lines += ["", "Instrumentation proposals: " + (", ".join(f"{g['name']} ({g['confidence']})" for g in mu["instrumentation_guess"]) or "none"),
                  "", "Genre proposals: " + (", ".join(f"{g['name']} ({g['confidence']})" for g in mu["genre_guess"]) or "none"), ""]
    else:
        lines += ["No music bed detected.", ""]
    lines += ["## Sound effects", ""]
    if m["sfx"]:
        lines += ["| Time s | Length s | Type | Confidence | Peak dBFS |", "|---|---|---|---|---|"]
        lines += [f"| {e['t']:.3f} | {e['dur']:.2f} | {e['type']} | {e['confidence']:.2f} | {e['peak_db']} |" for e in m["sfx"]]
    else:
        lines += ["None detected above the music bed."]
    lines += ["", "## Voice", ""]
    sung_c = vocal_reading(m)
    if m["voice"]["present"] and sung_c:
        lines += [f"Probably sung, not a voice-over (sung vocals confidence {sung_c:.2f}); vocal timing (seconds): "
                  + ", ".join(f"{s['start']:.2f}-{s['end']:.2f}" for s in m["voice"]["segments"]) + ". Confirm with the user."]
    elif m["voice"]["present"]:
        lines += ["Speech-like segments (seconds): " + ", ".join(f"{s['start']:.2f}-{s['end']:.2f}" for s in m["voice"]["segments"])]
    else:
        lines += ["No speech-like segments detected."]
    lines += ["", "## Notes", ""] + [f"- {n}" for n in m["notes"]]
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


# ---------------------------------------------------------------- main
def analyse(path: Path) -> dict:
    notes: list[str] = []
    x = decode(path)
    duration = len(x) / SR
    if duration < 1.0:
        raise SystemExit(f"error: {path} has {duration:.2f} s of audio; the sound map needs at least 1 second")
    mix = loudness(path, notes)
    mag, scale = spectrogram(x)
    freqs, B, fc = band_layout()
    Hm = ndimage.median_filter(mag, size=(1, 17), mode="nearest")
    Pm = ndimage.median_filter(mag, size=(17, 1), mode="nearest")
    Mh = Hm ** 2 / (Hm ** 2 + Pm ** 2 + 1e-12)
    del Hm, Pm
    pw = mag ** 2
    E = scale * (B @ pw)
    Hpow = pw * Mh
    Hb = scale * (B @ Hpow)
    Pb = np.maximum(E - Hb, 0)
    chroma = chroma_matrix(freqs) @ Hpow
    f0, f0_strength = pitch_track(moving_part(mag * Mh), freqs)
    prof = formant_profile(Hpow, freqs)
    del pw, Hpow, Mh, mag

    lp = np.maximum(db(Pb), -70)
    onset = np.maximum(np.diff(lp, axis=1, prepend=lp[:, :1]), 0).sum(0)
    tempo_bpm, tempo_conf, lag = tempo(onset)
    # A vocal or a busy top can hide the pulse in the full band; the kick under 150 Hz often still carries it.
    lowp = np.maximum(db(Pb[fc < 150]), -70)
    onset_low = np.maximum(np.diff(lowp, axis=1, prepend=lowp[:, :1]), 0).sum(0)
    low_bpm, low_conf, low_lag = tempo(onset_low)
    if low_lag is not None and low_conf > tempo_conf + 0.1:
        notes.append(f"Beat read from the low band (kick and bass): confidence {low_conf:.2f} against {tempo_conf:.2f} for the full band.")
        tempo_bpm, tempo_conf, lag, onset = low_bpm, low_conf, low_lag, onset_low
    tempo_ok = lag is not None and tempo_conf >= 0.35
    beats, beat_lag = beat_grid(onset, lag) if lag is not None else (np.array([]), 0.0)
    if lag is not None:
        tempo_bpm = 60 * FPS / beat_lag
    bed, bedH, bedP = choose_bed(E, Hb, Pb, beat_lag, tempo_ok, notes)

    mixdb = db(E.sum(0))
    music_frames = mixdb > -50
    harm_cover = float(np.mean(db(bedH.sum(0)) > -55))
    # Speech over silence falls quiet between phrases and has little under 200 Hz between words; a music bed does not.
    low_bed = float(np.percentile(db(Hb[fc < 200].sum(0)), 10)) >= -40 and float(np.percentile(mixdb, 5)) >= -45
    music_likely = bool(tempo_ok or low_bed or harm_cover >= 0.5)
    secs = sections(E, chroma, onset, beats, tempo_ok, duration, notes)
    edges_t = [s["start"] for s in secs[1:]] + [s["end"] for s in secs[:-1]]

    events = detect_sfx(x, E, Hb, Pb, bed, bedH, bedP, fc, edges_t, notes)
    ref = bedH if tempo_ok else np.percentile(Hb, 10, axis=1, keepdims=True)
    cands, vlev = voice_candidates(Hb, ref, fc)
    vsegs, unsure = [], []
    for a, b in cands:
        score, cues = voice_evidence(a, b, vlev, f0, f0_strength, prof, beat_lag / FPS if lag is not None else 0.0, tempo_ok)
        if score >= VOICE_SCORE:
            vsegs.append((a, b))
        elif score >= 0.35:
            weak = min(cues, key=cues.get)
            unsure.append(f"{a:.1f}-{b:.1f} s (score {score:.2f}, weakest cue: {weak})")
    if unsure:
        notes.append("Possible voice with low confidence, not counted as voice: " + "; ".join(unsure) + ".")
    sung = sung_segments(f0, f0_strength, prof) if music_likely else []
    probably_sung = 0.0
    if sung:
        before = len(vsegs)
        vsegs = [(a, b) for a, b in vsegs if sum(max(0.0, min(b, sb) - max(a, sa)) for sa, sb, _ in sung) < 0.5 * (b - a)]
        notes.append("Sung vocals (held notes with vibrato, a note about every second, moving vowels) at "
                     + ", ".join(f"{a:.1f}-{b:.1f} s (confidence {c:.2f})" for a, b, c in sung)
                     + f"; `voice` lists speech only{f', {before - len(vsegs)} sung segments removed from it' if before > len(vsegs) else ''}.")
    if vsegs:
        semis = 12 * np.log2(f0)
        voiced = f0_strength >= VOICED_STRENGTH
        mask = np.zeros(len(f0), bool)
        for a, b in vsegs:
            mask[int(a * FPS):int(b * FPS)] = True
        held, vib, _ = held_notes(np.where(mask, semis, 0.0), voiced & mask)
        # A voice-over leaves gaps between lines; a vocal that runs through most of the music is more likely the
        # track's own sung line, even when its pitch reads as spoken (a dense mix blurs held notes and vibrato).
        active = float(np.mean(mixdb > -50)) * duration
        cover = sum(b - a for a, b in vsegs) / max(active, 1e-3)
        longest = max(b - a for a, b in vsegs) / max(active, 1e-3)
        if music_likely and max(cover, longest) >= CONTINUOUS_VOCAL:
            probably_sung = round(0.35 + 0.35 * ramp(cover, CONTINUOUS_VOCAL, 1.0) + 0.15 * ramp(held, 0.3, 0.75) + 0.15 * ramp(vib, 0.2, 0.5), 2)
            notes.append(f"Vocal probably sung (confidence {probably_sung:.2f}), not a voice-over: it covers {100 * cover:.0f} percent of the "
                         f"sounding time (longest unbroken {100 * longest:.0f} percent) over music; held-note share {held:.2f}, vibrato "
                         f"share {vib:.2f}. `voice` keeps its timing; confirm sung or spoken with the user.")
        else:
            notes.append(f"Voice reads as spoken: held-note share {held:.2f} and vibrato share {vib:.2f} "
                         "(a sung line measures about 0.75 and 0.5 or more).")
    voice_cov = sum(b - a for a, b in vsegs) / duration
    kept = []
    for e in events:
        inside = any(a - 0.3 <= e["t"] <= b + 0.3 for a, b in vsegs)
        noisy_hit = e["type"] == "impact" and e["_wide"] >= 0.6 and e["_tonal"] < 0.4
        if inside and not (e["type"] in ("riser", "downer") or noisy_hit):
            continue
        e.pop("_wide"), e.pop("_tonal")
        kept.append(e)
    if len(kept) < len(events):
        notes.append(f"{len(events) - len(kept)} speech transients inside voice segments were not counted as effects.")
    events = sorted(kept, key=lambda e: e["t"])

    music_present = bool(tempo_ok or low_bed or sung or (harm_cover >= 0.5 and voice_cov < 0.5))
    if low_bed and not tempo_ok:
        notes.append("Music bed without a steady beat: a continuous low harmonic bed and no silent gaps.")
    step = max(0.5, duration / 600)
    blk = max(1, int(round(step * FPS)))
    cent = (fc[:, None] * E).sum(0) / (E.sum(0) + 1e-20)
    curve = []
    for s in range(0, E.shape[1], blk):
        ms = float(E[:, s:s + blk].sum(0).mean())
        c = float(np.median(cent[s:s + blk])) if ms > 1e-7 else 100.0
        curve.append({"t": round(s / FPS, 3), "rms_db": round(float(db(ms)), 1),
                      "brightness": round(min(1.0, max(0.0, math.log10(max(c, 100.0) / 100.0) / 2)), 3)})
    brightness = float(np.mean([c["brightness"] for c in curve])) if curve else 0.0

    key, mode = ("", "")
    if music_present:
        key, mode = key_of(chroma[:, music_frames].sum(1), notes)
    inst, genre = guesses(E, Hb, Pb, fc, music_frames, tempo_bpm, tempo_conf, onset, voice_cov, mix["lra"], brightness, notes) if music_present else ([], [])
    if sung and music_present:
        c = sum((b - a) * cf for a, b, cf in sung) / sum(b - a for a, b, _ in sung)
        inst = sorted(inst + [{"name": "sung vocals", "confidence": round(min(0.7, c), 2)}], key=lambda d: -d["confidence"])[:6]
    elif probably_sung and music_present:
        inst = [g for g in inst if g["name"] != "spoken voice over the music"]
        inst = sorted(inst + [{"name": "sung vocals", "confidence": round(min(0.7, probably_sung), 2)}], key=lambda d: -d["confidence"])[:6]
    if music_present:
        notes.append(GUESS_NOTE)
    if not tempo_ok:
        notes.append(f"No steady beat (tempo confidence {tempo_conf:.2f} under 0.35): treat the tempo as free time.")
    notes.append("No transcript: faster-whisper is not pinned in this repository, so only voice timing is mapped.")
    return {
        "version": 1,
        "duration_s": round(duration, 3),
        "music": {
            "present": music_present,
            "tempo_bpm": round(tempo_bpm, 1) if lag is not None else 0,
            "tempo_confidence": round(tempo_conf, 2),
            "beats_s": [round(float(b), 3) for b in beats] if tempo_ok else [],
            "key": key,
            "mode": mode,
            "sections": secs,
            "energy_curve": curve,
            "instrumentation_guess": inst,
            "genre_guess": genre,
        },
        "sfx": events,
        "voice": {"present": bool(vsegs), "segments": [{"start": round(a, 3), "end": round(b, 3)} for a, b in vsegs]},
        "mix": mix,
        "notes": notes,
    }


def voice_word(m: dict) -> str:
    sung_c = vocal_reading(m)
    if sung_c and m["voice"]["present"]:
        return f"probably sung ({sung_c:.2f})"
    if sung_c:
        return f"sung vocals ({sung_c:.2f})"
    return "spoken" if m["voice"]["present"] else "no"


def cut_times(path: Path) -> list[float]:
    """Cut times from an events file: a list of seconds, a list of {"t", "kind"} rows, or {"events": [...]}."""
    data = json.loads(path.read_text(encoding="utf-8-sig"))
    rows = data.get("events", data.get("cuts", [])) if isinstance(data, dict) else data
    out = []
    for r in rows if isinstance(rows, list) else []:
        if isinstance(r, (int, float)):
            out.append(float(r))
        elif isinstance(r, dict) and isinstance(r.get("t"), (int, float)) and "cut" in str(r.get("kind", r.get("type", "cut"))).lower():
            out.append(float(r["t"]))
    return sorted(out)


def beat_error(beats: list[float], cuts: list[float], fps: float) -> dict:
    """Beat error per cut (audio-gates.md A20): each cut against its nearest beat; a hard cut lands within 2 frames or
    40 ms, whichever is stricter (cue-map-and-beat-sync.md section 5)."""
    limit = min(2.0 / fps, 0.040)
    rows = []
    for t in cuts:
        b = min(beats, key=lambda x: abs(x - t))
        rows.append({"t": round(t, 3), "beat": round(b, 3), "error_ms": round((t - b) * 1000, 1)})
    errs = [abs(r["error_ms"]) for r in rows]
    return {"cuts": rows, "limit_ms": round(limit * 1000, 1), "max_ms": max(errs) if errs else None,
            "mean_ms": round(sum(errs) / len(errs), 1) if errs else None,
            "off_beat": [r for r in rows if abs(r["error_ms"]) > limit * 1000 + 1e-6], "pass": all(e <= limit * 1000 + 1e-6 for e in errs)}


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Map the music, sound effects, voice and loudness of a reference video or audio file.",
                                 epilog="For a reference: --out ice/reference/<ref-id>, the folder the ice-remake recipe.py reads sound_map.json from.")
    ap.add_argument("input", type=Path, help="video or audio file (anything ffmpeg decodes)")
    ap.add_argument("--out", type=Path, required=True, help="folder for sound_map.json, SOUND-MAP.md and sound-map.svg")
    ap.add_argument("--cuts", type=Path, help="events file of a beat-cut film: the beat error per cut (A20) against the "
                    "input's beat grid; exit 1 when a cut misses its beat by more than 2 frames or 40 ms")
    ap.add_argument("--fps", type=float, default=25.0, help="--cuts only: the film's frame rate (default 25)")
    args = ap.parse_args(argv)
    if not args.input.is_file():
        sys.stderr.write(f"error: {args.input} is not a file\n")
        return 2
    need_deps()
    try:
        m = analyse(args.input)
    except SystemExit as exc:
        sys.stderr.write(f"{exc}\n")
        return 2
    args.out.mkdir(parents=True, exist_ok=True)
    (args.out / "sound_map.json").write_text(json.dumps(m, indent=2) + "\n", encoding="utf-8")
    write_md(args.out / "SOUND-MAP.md", m, args.input.name)
    write_svg(args.out / "sound-map.svg", m, f"Sound map: {args.input.name}")
    mu = m["music"]
    print(f"duration {m['duration_s']} s | music {'yes' if mu['present'] else 'no'} {mu['tempo_bpm']} BPM "
          f"(conf {mu['tempo_confidence']}) | {len(mu['sections'])} sections | {len(m['sfx'])} effects | "
          f"voice {voice_word(m)} | {m['mix']['integrated_lufs']} LUFS")
    print(f"wrote {args.out / 'sound_map.json'}, SOUND-MAP.md, sound-map.svg")
    if args.cuts:
        beats = mu.get("beats_s") or []
        if not beats:
            print("beat error: no reliable beat grid in this input (tempo confidence under 0.35), so it is not measured")
            return 0
        be = beat_error(beats, cut_times(args.cuts), args.fps)
        m["beat_error"] = be
        (args.out / "sound_map.json").write_text(json.dumps(m, indent=2) + "\n", encoding="utf-8")
        print(f"beat error per cut: {len(be['cuts'])} cuts, max {be['max_ms']} ms, mean {be['mean_ms']} ms, limit {be['limit_ms']} ms: "
              + ("pass" if be["pass"] else "FAIL at " + ", ".join(f"{r['t']} s ({r['error_ms']:+} ms)" for r in be["off_beat"][:8])))
        return 0 if be["pass"] else 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
