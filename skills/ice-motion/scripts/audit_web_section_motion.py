#!/usr/bin/env python3
# From the founder's commercial-motion-design skill (Omar-Tnzxo, Apache-2.0 in this repo). Changes: usage notes;
# UTF-8 console output for Windows. Standard library only; Python 3.9+ on Windows, macOS and Linux.
# Usage: python audit_web_section_motion.py <project folder>   (exit 1 = REJECT: animated web sections)
"""Reject common animated-web-section patterns in code-rendered commercials."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import re
import sys


TEXT_EXTENSIONS = {".css", ".html", ".htm", ".js", ".jsx", ".ts", ".tsx"}
EXCLUDED_DIRS = {"node_modules", ".git", "dist", "build", "out", "renders", "rendered_frames", "coverage", ".next"}


def main() -> None:
    for _stream in (sys.stdout, sys.stderr):
        if hasattr(_stream, "reconfigure"):
            _stream.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser()
    parser.add_argument("project", type=Path)
    args = parser.parse_args()
    root = args.project.resolve()
    # Judge excluded folders only below the project folder: a project that itself sits inside a folder named
    # "build", "out" or "dist" must still be scanned.
    files = [path for path in root.rglob("*") if path.is_file() and path.suffix.lower() in TEXT_EXTENSIONS
             and not any(part.casefold() in EXCLUDED_DIRS for part in path.relative_to(root).parts[:-1])]
    corpus = "\n".join(path.read_text(encoding="utf-8", errors="ignore") for path in files)
    compact = re.sub(r"\s+", " ", corpus.casefold())

    signals: list[dict[str, object]] = []

    def add(name: str, count: int, threshold: int, weight: int, detail: str) -> None:
        if count >= threshold:
            signals.append({"signal": name, "count": count, "weight": weight, "detail": detail})

    scene_layers = len(re.findall(r"scene-layer", compact))
    heading_wrappers = len(re.findall(r"kinetic-text-wrap|scene-heading|section-title|hero-title", compact))
    scene_toggles = len(re.findall(r"classlist\.toggle\s*\([^)]*visible", compact))
    title_fade_moves = len(re.findall(r"(?:text|title)[a-z0-9_.]*\.style\.opacity[\s\S]{0,220}(?:translatey|translate3d)", corpus.casefold()))
    pulses = len(re.findall(r"pulse|bobb|float|ambient|particle|glow|math\.sin", compact))
    card_terms = len(re.findall(r"card|tile|grid|dashboard", compact))
    flex_column_space = int(bool(re.search(r"scene-layer[^{]*\{[^}]*display\s*:\s*flex[^}]*flex-direction\s*:\s*column[^}]*justify-content\s*:\s*space-between", compact)))

    add("repeated-scene-layer", scene_layers, 3, 2, "shared scene wrapper repeats across the film")
    add("repeated-heading-wrapper", heading_wrappers, 3, 2, "copy is structured as recurring page headings")
    add("visibility-toggle-transitions", scene_toggles, 3, 2, "scenes are replaced by visibility windows")
    add("repeated-title-fade-translate", title_fade_moves, 3, 3, "primary copy repeats generic entrance grammar")
    add("decorative-loop-language", pulses, 4, 1, "ambient/pulse/float language may disguise static focal content")
    add("card-grid-density", card_terms, 10, 1, "component-card vocabulary dominates temporal design")
    add("flex-column-space-between", flex_column_space, 1, 4, "scene layout is literally a vertical website section")

    score = sum(int(signal["weight"]) for signal in signals)
    core_web_pattern = flex_column_space and scene_layers >= 3 and heading_wrappers >= 3
    rejected = bool(core_web_pattern or score >= 7)
    report = {
        "project": str(args.project.resolve()),
        "filesScanned": len(files),
        "riskScore": score,
        "classification": "REJECT: animated web sections" if rejected else "PASS: no strong web-section signature",
        "signals": signals,
        "note": "Heuristic source audit; rendered creative-director review remains mandatory.",
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    raise SystemExit(1 if rejected else 0)


if __name__ == "__main__":
    main()
