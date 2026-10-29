#!/usr/bin/env python3
# Original to Ice Motion Director (Apache-2.0), from the 2026-10-29 editor-sources research (the tested prototype
# preview_options.py), with the music measured again after the limiter and the film's own voice kept on request.
"""Lay 2 or 3 music options on the same picture at the same measured loudness, and write a page to compare them by ear.

Each option: the picture of --video (an animatic, style frames timed as a video, the draft, or a reference), the
track started at its strongest section that still fills the picture (--align strong, read from the track's sound map
that match_music.py wrote) or placed so its own ending lands on the last frame (--align end, the back-timed edit of
references/music-choice-and-licensing.md section 4), a 0.3 s fade-in when it starts mid-track, a 1.5 s fade-out when
it is cut before its own ending. The music of every option is measured with ffmpeg ebur128 and given a linear gain to
the same integrated loudness (measured again after the limiter and corrected, at most twice, until it is within 0.2 LU), so
the choice is made on the music, not on its level. With --keep-film-audio the picture's own sound (a voice or a scratch
voice) stays, and the music sits --bed-under-voice dB under it (references/mix-and-master.md section 3). Without
--video, the options are audio only (option-N.m4a) at --length seconds.
Metadata per track, when a sidecar sits next to it (<track>.json or <track file name>.json from the sourcing routes):
title, creator, license, license status, source URL. All of it goes into compare.html and options.json.

Usage (Windows, macOS, Linux; needs ffmpeg and ffprobe on PATH; standard library only; no network):
    python preview_options.py --video <film> --out <folder> [--ranking <ranking.json>] <track 1> <track 2> [<track 3>]
    python preview_options.py --length 30 --out <folder> <track 1> <track 2> [<track 3>]

Exit code: 0 on success, 1 when ffmpeg fails, 2 for bad input, 3 for a missing ffmpeg or ffprobe.
"""
from __future__ import annotations

import argparse
import html
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

FADE_IN = 0.3
FADE_OUT = 1.5
LIMIT = 0.84  # sample ceiling of the preview limiter, about -1.5 dBFS


class FfmpegError(Exception):
    pass


def run(cmd: list[str]) -> str:
    r = subprocess.run(cmd, stdin=subprocess.DEVNULL, capture_output=True)
    err = r.stderr.decode("utf-8", "replace")
    if r.returncode != 0:
        lines = err.strip().splitlines()
        raise FfmpegError(f"{cmd[0]} failed: {lines[-1] if lines else 'exit ' + str(r.returncode)}")
    return r.stdout.decode("utf-8", "replace") + err


def duration(path: Path) -> float:
    out = run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(path)])
    try:
        return float(out.strip().splitlines()[0])
    except (ValueError, IndexError):
        raise FfmpegError(f"ffprobe could not read the duration of {path}") from None


def has_audio(path: Path) -> bool:
    out = run(["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries", "stream=index", "-of", "csv=p=0", str(path)])
    return bool(out.strip())


def integrated(path: Path, start: float = 0.0, length: float | None = None, af: str = "") -> float:
    """Integrated loudness (LUFS) of a window of a file, after an optional filter chain."""
    window = ["-ss", f"{start:.3f}"] + (["-t", f"{length:.3f}"] if length else [])
    err = run(["ffmpeg", "-nostdin", "-hide_banner", "-nostats", *window, "-i", str(path), "-map", "0:a:0",
               "-af", (af + "," if af else "") + "ebur128", "-f", "null", "-"])
    found = re.findall(r"^\s*I:\s+(-?inf|-?\d+(?:\.\d+)?) LUFS", err, flags=re.M)
    value = float(found[-1]) if found else float("-inf")
    if value == float("-inf") or value < -69:
        raise FfmpegError(f"{path.name} is silent in the measured window")
    return value


def strongest_start(sound_map: Path | None, picture: float, music: float) -> float:
    if not sound_map or not sound_map.is_file():
        return 0.0
    secs = json.loads(sound_map.read_text(encoding="utf-8")).get("music", {}).get("sections") or []
    for s in secs:
        if s.get("energy", 0) >= 0.7 and s.get("label") != "intro" and music - s["start"] >= picture:
            return float(s["start"])
    return 0.0


def sidecar(track: Path) -> dict:
    for p in (track.with_name(track.name + ".json"), track.with_suffix(".json")):
        if p.is_file():
            try:
                data = json.loads(p.read_text(encoding="utf-8"))
                return data if isinstance(data, dict) else {}
            except ValueError:
                return {}
    return {}


def ranking_row(ranking: dict | None, track: Path) -> dict:
    rows = (ranking or {}).get("ranking") or []
    path = str(track.resolve())
    return next((r for r in rows if r.get("path") == path), None) or next((r for r in rows if r.get("file") == track.name), {})


def music_stem(track: Path, start: float, length: float, fade_out: bool, target: float, out: Path) -> float:
    """Render the trimmed, faded music at the target loudness into out (WAV, 48 kHz stereo); return its measured LUFS."""
    fades = []
    if start > 0:
        fades.append(f"afade=t=in:d={FADE_IN}")
    if fade_out:
        fades.append(f"afade=t=out:st={max(length - FADE_OUT, 0.0):.3f}:d={FADE_OUT}")
    chain = ",".join(fades)
    gain = target - integrated(track, start, length, chain)
    measured = target
    for _ in range(3):
        af = ",".join(fades + [f"volume={gain:.2f}dB", f"alimiter=limit={LIMIT}:level=false"])
        run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", f"{start:.3f}", "-t", f"{length:.3f}", "-i", str(track),
             "-map", "0:a:0", "-af", af, "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", str(out)])
        measured = integrated(out)
        if abs(measured - target) <= 0.2:
            break
        gain += target - measured  # the limiter took some level: correct it
    return measured


def link(url: str) -> str:
    safe = html.escape(url)
    return f'<a href="{safe}">{safe}</a>' if re.match(r"https?://", url) else safe


def page(cards: list[dict], video: bool, target: float, keep: bool) -> str:
    items = []
    for c in cards:
        media = (f'<video src="{html.escape(c["file"])}" controls preload="metadata"></video>' if video
                 else f'<audio src="{html.escape(c["file"])}" controls preload="metadata"></audio>')
        dist = "" if c["match_distance"] is None else f"<br>match distance {c['match_distance']:.3f} (lower is closer)"
        short = f"<br>the track ends {c['short_by_s']:.1f} s before the picture" if c["short_by_s"] > 0 else ""
        items.append(f"""<figure>{media}
<figcaption><b>Option {c['option']}</b>: {html.escape(c['title'])}<br>{html.escape(c['creator'])}<br>
license: {html.escape(c['license'])}, status: {html.escape(c['license_status'])}<br>
starts {c['start_s']:.1f} s into the track, music at {c['music_lufs']:.1f} LUFS{dist}{short}<br>{link(c['source_url'])}</figcaption></figure>""")
    voice = " The film's own voice stays; the music sits under it." if keep else ""
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Music options</title>
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark light">
<style>body{{font:15px/1.5 system-ui,sans-serif;margin:16px;background:#111;color:#eee}}
main{{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}}
video,audio{{width:100%;background:#000}}figure{{margin:0}}a{{color:#9cf;word-break:break-all}}</style></head>
<body><h1>Music options</h1>
<p>Same picture, every option's music at the same measured loudness ({target:.1f} LUFS).{voice} Play each one and pick by ear.</p>
<main>{''.join(items)}</main></body></html>
"""


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Lay 2 or 3 music options on the same picture at equal measured loudness and write compare.html. No network.",
                                 epilog="Rank the candidates first with match_music.py music; pass its ranking.json to start each track at its strongest section.")
    ap.add_argument("tracks", type=Path, nargs="+", help="2 or 3 local tracks, best first")
    ap.add_argument("--out", type=Path, required=True, help="folder for option-N files, options.json and compare.html")
    ap.add_argument("--video", type=Path, help="the picture to lay the options on (animatic, draft or reference)")
    ap.add_argument("--length", type=float, help="seconds of music per option when there is no --video")
    ap.add_argument("--ranking", type=Path, help="ranking.json from match_music.py (match distance and each track's sound map)")
    ap.add_argument("--align", choices=("strong", "end"), default="strong",
                    help="strong: start at the strongest section that fills the picture; end: the track's own ending lands on the last frame")
    ap.add_argument("--target-lufs", type=float, default=-16.0, help="music loudness of every option (default -16)")
    ap.add_argument("--keep-film-audio", action="store_true", help="keep the picture's own sound (a voice) with the music under it")
    ap.add_argument("--bed-under-voice", type=float, default=12.0, help="dB the music sits under the film's own sound (default 12)")
    ap.add_argument("--height", type=int, default=540, help="preview height in pixels (default 540)")
    args = ap.parse_args(argv)

    if not 2 <= len(args.tracks) <= 3:
        sys.stderr.write("error: give 2 or 3 tracks\n")
        return 2
    missing = [p for p in [*args.tracks, args.video, args.ranking] if p and not p.is_file()]
    if missing:
        sys.stderr.write("error: not a file: " + ", ".join(str(p) for p in missing) + "\n")
        return 2
    if not args.video and not (args.length and args.length > 0):
        sys.stderr.write("error: give --video, or --length for audio-only options\n")
        return 2
    if args.keep_film_audio and not args.video:
        sys.stderr.write("error: --keep-film-audio needs --video\n")
        return 2
    for tool in ("ffmpeg", "ffprobe"):
        if shutil.which(tool) is None:
            sys.stderr.write(f"preview_options.py needs {tool} on PATH (see the ice-engines skill for the install step).\n")
            return 3
    ranking = json.loads(args.ranking.read_text(encoding="utf-8")) if args.ranking else None
    args.out.mkdir(parents=True, exist_ok=True)
    try:
        picture = duration(args.video) if args.video else float(args.length)
        target = args.target_lufs
        if args.keep_film_audio:
            if not has_audio(args.video):
                sys.stderr.write("error: --keep-film-audio: the video has no audio stream\n")
                return 2
            target = integrated(args.video) - args.bed_under_voice
        cards = []
        for i, track in enumerate(args.tracks, 1):
            music = duration(track)
            row = ranking_row(ranking, track)
            if args.align == "end":
                start = max(music - picture, 0.0)
            else:
                smap = (args.ranking.parent / row["map"]) if row.get("map") else None
                start = strongest_start(smap, picture, music)
            length = min(picture, music - start)
            cut_early = args.align == "strong" and start + length < music - 0.05
            stem = args.out / f"option-{i}-music.wav"
            lufs = music_stem(track, start, length, cut_early, target, stem)
            if args.video:
                name = f"option-{i}.mp4"
                mix = (["-filter_complex", "[0:a:0][1:a:0]amix=inputs=2:duration=first:normalize=0,"
                        f"alimiter=limit={LIMIT}:level=false[a]", "-map", "0:v:0", "-map", "[a]"]
                       if args.keep_film_audio else ["-map", "0:v:0", "-map", "1:a:0"])
                run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", str(args.video), "-i", str(stem), *mix,
                     "-t", f"{picture if args.keep_film_audio else length:.3f}",
                     "-vf", f"scale=-2:{args.height}", "-c:v", "libx264", "-preset", "veryfast", "-crf", "28",
                     "-pix_fmt", "yuv420p", "-ar", "48000", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart",
                     str(args.out / name)])
            else:
                name = f"option-{i}.m4a"
                run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", str(stem), "-c:a", "aac", "-b:a", "160k",
                     str(args.out / name)])
            stem.unlink(missing_ok=True)
            meta = sidecar(track)
            cards.append({"option": i, "file": name, "track": track.name, "path": str(track.resolve()),
                          "title": str(meta.get("title") or track.stem),
                          "creator": str(meta.get("creator") or meta.get("author") or meta.get("artist") or "unknown"),
                          "license": str(meta.get("license") or meta.get("license_id") or "unknown"),
                          "license_status": str(meta.get("license_status") or "unknown"),
                          "source_url": str(meta.get("source_url") or meta.get("url") or ""),
                          "start_s": round(start, 2), "music_lufs": round(lufs, 1),
                          "short_by_s": round(max(picture - (music - start), 0.0), 1), "match_distance": row.get("total")})
            print(f"{name} <- {track.name}: starts {start:.1f} s, music {lufs:.1f} LUFS, match {row.get('total')}")
    except FfmpegError as exc:
        sys.stderr.write(f"error: {exc}\n")
        return 1
    spread = max(c["music_lufs"] for c in cards) - min(c["music_lufs"] for c in cards)
    (args.out / "options.json").write_text(json.dumps({"version": 1, "picture": str(args.video or ""), "length_s": round(picture, 3),
                                                       "align": args.align, "music_target_lufs": round(target, 1),
                                                       "loudness_spread_lu": round(spread, 1), "keep_film_audio": args.keep_film_audio,
                                                       "options": cards}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    (args.out / "compare.html").write_text(page(cards, bool(args.video), target, args.keep_film_audio), encoding="utf-8")
    print(f"music loudness spread {spread:.1f} LU; wrote {args.out / 'compare.html'} and options.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
