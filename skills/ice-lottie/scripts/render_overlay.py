#!/usr/bin/env python3
# From nolangz/pixel2motion (MIT, Copyright (c) 2026 Nolan Lai). Changes: replaced dash characters; Chrome
# lookup also knows Windows Chrome and Edge locations and a CHROME_PATH override; UTF-8 console output for
# Windows; a clear message naming the pinned packages when Pillow or numpy is missing.
"""Render an SVG in headless Chrome and overlay it on the source raster for fit QA.

One command per fit iteration: renders the SVG at the source image's exact pixel
size (real browser, no rasterizer dependency), composites a cyan overlay of the
render silhouette onto the source, and reports IoU / src_only / render_only pixel
counts. Inspect the overlay with multimodal vision; use the numbers only as a
trend signal between iterations.

Requires pillow==12.3.0 and numpy==2.4.6 (requirements.txt next to this file; use a
project virtual environment) and a Chrome, Chromium or Edge binary (auto-detected on
Windows, macOS and Linux, or set CHROME_PATH or CHROME_BIN).
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


def _windows_candidates() -> list[str]:
    roots = [os.environ.get(name, "") for name in ("ProgramFiles", "ProgramFiles(x86)", "LOCALAPPDATA")]
    apps = [
        ("Google", "Chrome", "Application", "chrome.exe"),
        ("Chromium", "Application", "chrome.exe"),
        ("Microsoft", "Edge", "Application", "msedge.exe"),
    ]
    return [str(Path(root, *app)) for root in roots if root for app in apps]


CHROME_CANDIDATES = [
    os.environ.get("CHROME_PATH", ""),
    os.environ.get("CHROME_BIN", ""),
    *_windows_candidates(),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "google-chrome",
    "google-chrome-stable",
    "chromium",
    "chromium-browser",
    "chrome",
    "msedge",
    "microsoft-edge",
]


def find_chrome() -> str:
    for cand in CHROME_CANDIDATES:
        if not cand:
            continue
        if Path(cand).is_file():
            return cand
        found = shutil.which(cand)
        if found:
            return found
    raise SystemExit("No Chrome, Chromium or Edge found. Set CHROME_PATH to a browser binary.")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Render SVG via headless Chrome and build a cyan fit overlay.")
    parser.add_argument("svg", type=Path, help="Fitted SVG file.")
    parser.add_argument("source", type=Path, help="Source raster image (PNG/JPG/WebP).")
    parser.add_argument("--out", type=Path, required=True, help="Overlay PNG path (e.g. outputs/fit_iterations/01_x_overlay.png).")
    parser.add_argument("--render-out", type=Path, default=None, help="Also save the bare SVG render PNG here.")
    parser.add_argument("--report", type=Path, default=None, help="Optional JSON metrics path.")
    parser.add_argument(
        "--fg-threshold", type=int, default=720,
        help="Pixel is foreground when R+G+B < threshold (default 720 = non-near-white).",
    )
    return parser.parse_args()


def render_svg(svg: Path, width: int, height: int, chrome: str) -> Image.Image:
    from PIL import Image

    with tempfile.TemporaryDirectory() as td:
        wrapper = Path(td) / "wrap.html"
        shot = Path(td) / "shot.png"
        wrapper.write_text(
            "<!doctype html><html><head><style>html,body{margin:0;padding:0}</style></head>"
            f'<body><img src="{svg.resolve().as_uri()}" width="{width}" height="{height}"></body></html>',
            encoding="utf-8",
        )
        subprocess.run(
            [
                chrome, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                f"--screenshot={shot}", f"--window-size={width},{height}",
                "--default-background-color=FFFFFFFF", wrapper.resolve().as_uri(),
            ],
            check=True, capture_output=True,
        )
        return Image.open(shot).convert("RGB").copy()


def main() -> int:
    for _stream in (sys.stdout, sys.stderr):
        if hasattr(_stream, "reconfigure"):
            _stream.reconfigure(encoding="utf-8", errors="replace")
    args = parse_args()

    try:
        import numpy as np
        from PIL import Image
    except ImportError as exc:
        sys.exit(
            f"render_overlay.py needs pillow==12.3.0 and numpy==2.4.6 (missing: {exc.name}). Install them into a "
            'project virtual environment after the user agrees: python -m pip install -r "'
            + str(Path(__file__).resolve().parent / "requirements.txt") + '"'
        )

    src_img = Image.open(args.source).convert("RGB")
    W, H = src_img.size
    render = render_svg(args.svg, W, H, find_chrome())
    if args.render_out:
        args.render_out.parent.mkdir(parents=True, exist_ok=True)
        render.save(args.render_out)

    a = np.asarray(src_img).astype(int)
    b = np.asarray(render).astype(int)
    src_sil = a.sum(axis=2) < args.fg_threshold
    ren_sil = b.sum(axis=2) < args.fg_threshold

    over = a.copy()
    over[ren_sil] = (over[ren_sil] * 0.35 + np.array([0, 200, 220]) * 0.65).astype(int)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(over.astype(np.uint8)).save(args.out)

    inter = int((src_sil & ren_sil).sum())
    union = int((src_sil | ren_sil).sum())
    metrics = {
        "svg": str(args.svg),
        "source": str(args.source),
        "overlay": str(args.out),
        "iou": round(inter / union, 4) if union else 0.0,
        "src_only_px": int((src_sil & ~ren_sil).sum()),
        "render_only_px": int((ren_sil & ~src_sil).sum()),
    }
    print(f"IoU={metrics['iou']}  src_only={metrics['src_only_px']}  render_only={metrics['render_only_px']}")
    print("Numbers are a trend signal, judge the overlay visually.")
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
