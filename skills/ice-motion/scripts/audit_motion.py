# From the founder's commercial-motion-design skill (Omar-Tnzxo, Apache-2.0 in this repo). Changes: usage notes;
# UTF-8 console output for Windows; a clear message naming the pinned packages when numpy or OpenCV is missing.
# Requires Python 3.11+ with numpy==2.4.6 and opencv-python-headless==4.10.0.84 (see requirements.txt next to this
# file), any OS.
# Usage: python audit_motion.py --video <render.mp4> --audio <mix.wav, 16-bit PCM> [--fps 60] [--sample-fps 4] [--out report.json]
# Reports audio onsets (frames) and per-sample visual change (median, p90, low-change count) to compare against a
# reference at the same sample rate. Grain can cause false positives. A diagnostic, not a verdict.
"""Quick audio-onset and video-change diagnostic for motion-design renders."""

from __future__ import annotations

import argparse
import json
import sys
import wave
from pathlib import Path

try:
    import cv2
    import numpy as np
except ImportError as exc:
    sys.exit(
        f"audit_motion.py needs numpy==2.4.6 and opencv-python-headless==4.10.0.84 (missing: {exc.name}). "
        'Install them into a project virtual environment (no question needed: ice-engines engine-choice.md section 7.6: free pinned packages install without a question): python -m pip install -r "'
        + str(Path(__file__).resolve().parent / "requirements.txt") + '"'
    )


def audio_onsets(path: Path, fps: int) -> list[dict[str, float | int]]:
    with wave.open(str(path), "rb") as src:
        rate = src.getframerate()
        channels = src.getnchannels()
        width = src.getsampwidth()
        raw = src.readframes(src.getnframes())
    if width != 2:
        raise ValueError("The diagnostic currently expects 16-bit PCM WAV")
    samples = np.frombuffer(raw, dtype=np.int16).astype(np.float32)
    if channels > 1:
        samples = samples.reshape(-1, channels).mean(axis=1)
    hop = max(1, int(rate * 0.01))
    energy = np.array([np.mean(np.abs(samples[i:i + hop])) for i in range(0, len(samples), hop)])
    novelty = np.maximum(0, np.diff(energy, prepend=energy[0]))
    threshold = np.percentile(novelty, 82)
    peaks: list[int] = []
    for index in range(1, len(novelty) - 1):
        if novelty[index] >= threshold and novelty[index] >= novelty[index - 1] and novelty[index] > novelty[index + 1]:
            if not peaks or index - peaks[-1] >= 8:
                peaks.append(index)
    return [{"seconds": round(index * hop / rate, 3), "frame": round(index * hop / rate * fps)} for index in peaks]


def video_change(path: Path, sample_fps: float) -> dict[str, float | int | list[float]]:
    cap = cv2.VideoCapture(str(path))
    source_fps = cap.get(cv2.CAP_PROP_FPS)
    stride = max(1, round(source_fps / sample_fps))
    previous = None
    changes: list[float] = []
    index = 0
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        if index % stride == 0:
            gray = cv2.cvtColor(cv2.resize(frame, (320, 180)), cv2.COLOR_BGR2GRAY)
            if previous is not None:
                changes.append(float(np.mean(cv2.absdiff(gray, previous)) / 255.0))
            previous = gray
        index += 1
    cap.release()
    if not changes:
        return {"samples": 0, "median": 0, "p90": 0, "low_change_count": 0, "changes": []}
    values = np.array(changes)
    threshold = max(0.006, float(np.median(values) * 0.42))
    return {"samples": len(changes), "median": round(float(np.median(values)), 6), "p90": round(float(np.percentile(values, 90)), 6), "low_change_count": int(np.sum(values < threshold)), "changes": [round(value, 6) for value in changes]}


def main() -> None:
    for _stream in (sys.stdout, sys.stderr):
        if hasattr(_stream, "reconfigure"):
            _stream.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser()
    parser.add_argument("--video", type=Path, required=True)
    parser.add_argument("--audio", type=Path, required=True)
    parser.add_argument("--fps", type=int, default=60)
    parser.add_argument("--sample-fps", type=float, default=4)
    parser.add_argument("--out", type=Path)
    args = parser.parse_args()
    report = {"audio_onsets": audio_onsets(args.audio, args.fps), "video_change": video_change(args.video, args.sample_fps)}
    payload = json.dumps(report, ensure_ascii=False, indent=2)
    if args.out:
        args.out.write_text(payload, encoding="utf-8")
    print(payload)


if __name__ == "__main__":
    main()

