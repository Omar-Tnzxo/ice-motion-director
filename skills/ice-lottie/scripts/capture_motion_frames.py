#!/usr/bin/env python3
# Adapted from nolangz/pixel2motion (MIT, Copyright (c) 2026 Nolan Lai). Changes: replaced dash characters;
# UTF-8 console output for Windows; clear messages naming the pinned packages when one is missing; an installed
# Chrome or Edge (or CHROME_PATH) is used when Playwright's own Chromium is not downloaded.
"""Capture deterministic animation frames from a Pixel2Motion HTML deliverable.

Loads showcase/minimal Pixel2Motion HTML with ?t=<ms> for each requested timestamp
(every animation paused and seeked, no wall-clock racing), screenshots #logo-root,
assembles a labeled film strip for multimodal inspection, and optionally pixel-diffs
the last captured frame against the verified static render to check the Final Frame
Contract.

Requires playwright==1.58.0, plus pillow==12.3.0 and numpy==2.4.6 for --strip and
--compare-final (see requirements.txt next to this file). The browser is Playwright's
Chromium when downloaded (python -m playwright install chromium, a browser download:
ask the user first), else the binary in CHROME_PATH, or an installed Chrome or Edge.
If Playwright is unavailable, capture the same ?t=<ms> URLs with whatever real-browser
screenshot tooling exists; wall-clock screenshots of a running animation are not
acceptable QA evidence.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

REQUIREMENTS = Path(__file__).resolve().parent / "requirements.txt"
PLAYWRIGHT_HINT = (
    "Install it into a project virtual environment after the user agrees: "
    f'python -m pip install -r "{REQUIREMENTS}"\n'
    "Then it needs a browser: CHROME_PATH, or an installed Chrome or Edge, is used when found; otherwise run "
    "python -m playwright install chromium, which is a browser download, so ask the user first."
)


def need_image_packages() -> None:
    try:
        import numpy  # noqa: F401
        from PIL import Image  # noqa: F401
    except ImportError as exc:
        sys.exit(
            "capture_motion_frames.py needs pillow==12.3.0 and numpy==2.4.6 for --strip and --compare-final "
            f"(missing: {exc.name}). Install them into a project virtual environment after the user agrees: "
            f'python -m pip install -r "{REQUIREMENTS}"'
        )


def launch_chromium(p):
    """Playwright's Chromium if downloaded, else CHROME_PATH or an installed Chrome or Edge; never downloads."""
    from playwright.sync_api import Error as PlaywrightError

    attempts: list[dict] = [{}, {"channel": "chrome"}, {"channel": "msedge"}]
    exe = os.environ.get("CHROME_PATH") or os.environ.get("CHROME_BIN")
    if exe:
        attempts.insert(0, {"executable_path": exe})
    for kwargs in attempts:
        try:
            return p.chromium.launch(**kwargs)
        except PlaywrightError:
            continue
    sys.exit(
        "No browser found for Playwright. Set CHROME_PATH to an installed Chrome or Edge binary, or, after the "
        "user agrees to a browser download, run: python -m playwright install chromium"
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Capture animation frames at fixed timestamps for motion QA.")
    parser.add_argument("html", type=Path, help="Animated HTML file with Pixel2Motion QA hooks.")
    parser.add_argument("--times", required=True, help="Comma-separated timestamps in ms, e.g. 0,300,700,1200,1500.")
    parser.add_argument("--out", type=Path, default=Path("motion_frames"), help="Directory for frame PNGs.")
    parser.add_argument("--strip", type=Path, default=None, help="Optional labeled film-strip PNG path.")
    parser.add_argument(
        "--compare-final",
        type=Path,
        default=None,
        help="Static render PNG to diff against the LAST captured frame (Final Frame Contract).",
    )
    parser.add_argument("--viewport", default="900x600", help="Browser viewport WxH (default 900x600).")
    parser.add_argument("--scale", type=float, default=2.0, help="Device scale factor (default 2 for crisp frames).")
    parser.add_argument("--report", type=Path, default=None, help="Optional JSON report path.")
    return parser.parse_args()


def capture_frames(html: Path, times: list[int], out_dir: Path, viewport: tuple[int, int], scale: float) -> list[Path]:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        sys.exit(
            f"capture_motion_frames.py needs playwright==1.58.0. {PLAYWRIGHT_HINT}\n"
            "Or capture the ?t=<ms> URLs with another real-browser tool."
        )

    out_dir.mkdir(parents=True, exist_ok=True)
    frames: list[Path] = []
    url_base = html.resolve().as_uri()
    with sync_playwright() as p:
        browser = launch_chromium(p)
        page = browser.new_page(
            viewport={"width": viewport[0], "height": viewport[1]},
            device_scale_factor=scale,
        )
        for t in times:
            page.goto(f"{url_base}?t={t}")
            page.wait_for_function("window.__p2mReady === true")
            target = page.locator("#logo-root")
            frame_path = out_dir / f"frame_{t:06d}ms.png"
            target.screenshot(path=str(frame_path))
            frames.append(frame_path)
            print(f"captured t={t}ms -> {frame_path}")
        browser.close()
    return frames


def build_strip(frames: list[Path], times: list[int], strip_path: Path) -> None:
    from PIL import Image, ImageDraw

    images = [Image.open(f).convert("RGB") for f in frames]
    label_h = 28
    cell_w = max(img.width for img in images)
    cell_h = max(img.height for img in images) + label_h
    strip = Image.new("RGB", (cell_w * len(images), cell_h), "#ffffff")
    draw = ImageDraw.Draw(strip)
    for i, (img, t) in enumerate(zip(images, times)):
        x = i * cell_w + (cell_w - img.width) // 2
        strip.paste(img, (x, label_h))
        draw.text((i * cell_w + 8, 6), f"t={t}ms", fill="#333333")
        if i:
            draw.line([(i * cell_w, 0), (i * cell_w, cell_h)], fill="#dddddd", width=1)
    strip_path.parent.mkdir(parents=True, exist_ok=True)
    strip.save(strip_path)
    print(f"strip -> {strip_path}")


def compare_final(final_frame: Path, static_render: Path) -> dict:
    import numpy as np
    from PIL import Image

    def to_rgb_on_white(path: Path) -> Image.Image:
        img = Image.open(path)
        if img.mode in ("RGBA", "LA", "P"):
            img = img.convert("RGBA")
            base = Image.new("RGBA", img.size, "#ffffff")
            base.alpha_composite(img)
            return base.convert("RGB")
        return img.convert("RGB")

    frame = to_rgb_on_white(final_frame)
    static = to_rgb_on_white(static_render)
    if static.size != frame.size:
        static = static.resize(frame.size, Image.LANCZOS)
    a = np.asarray(frame, dtype=np.float32)
    b = np.asarray(static, dtype=np.float32)
    diff = np.abs(a - b)
    result = {
        "final_frame": str(final_frame),
        "static_render": str(static_render),
        "mean_abs_diff": round(float(diff.mean()), 3),
        "max_abs_diff": float(diff.max()),
        "pct_pixels_off_by_25plus": round(float((diff.max(axis=2) >= 25).mean() * 100), 3),
    }
    print(
        f"final-frame diff: mean={result['mean_abs_diff']} max={result['max_abs_diff']} "
        f"pixels>=25: {result['pct_pixels_off_by_25plus']}%"
    )
    print("Numbers are advisory, confirm the match with multimodal visual inspection.")
    return result


def main() -> int:
    for _stream in (sys.stdout, sys.stderr):
        if hasattr(_stream, "reconfigure"):
            _stream.reconfigure(encoding="utf-8", errors="replace")
    args = parse_args()
    if args.strip or args.compare_final:
        need_image_packages()
    times = [int(t.strip()) for t in args.times.split(",") if t.strip()]
    if not times:
        raise SystemExit("No timestamps given.")
    w, _, h = args.viewport.partition("x")
    viewport = (int(w), int(h))

    frames = capture_frames(args.html, times, args.out, viewport, args.scale)

    report: dict = {"html": str(args.html), "times_ms": times, "frames": [str(f) for f in frames]}
    if args.strip:
        build_strip(frames, times, args.strip)
        report["strip"] = str(args.strip)
    if args.compare_final:
        report["final_frame_contract"] = compare_final(frames[-1], args.compare_final)
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, indent=2), encoding="utf-8")
        print(f"report -> {args.report}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
