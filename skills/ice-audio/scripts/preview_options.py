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

sfx mode (references/sfx.md section 7 item 3; the idea of a blind pick with a taste memory comes from Clipwing's Real
SFX, MIT, rewritten here with no code copied): 2 or 3 recorded sounds on the same moment of the picture, each placed by
its measured sync point (match_music.py: an impact on its arrival, a whoosh on its pass-by peak, a riser on its end)
and brought to the same loudest-100 ms level, shuffled and named A, B, C. compare.html shows no file name, source or
score; options.json keeps the key. `serve` opens the page on 127.0.0.1 and the first saved click (a pick, and any
sound marked "never") goes to the user's taste file, ~/.ice-motion-director/sfx-taste.json (ICE_SFX_TASTE overrides
it), keyed by each file's SHA-256; `taste pick` saves a choice the user said in the chat. match_music.py reads the
taste in later films: a banned sound is left out of `pack list` and rejected in the `sfx` ranking, a loved one comes
first. Only real recordings go in, never sound made by code (the ice-audio skill, core rule 7). The sfx mode needs
numpy (scripts/requirements.txt); the music mode and `taste` need only the standard library.

Usage (Windows, macOS, Linux; needs ffmpeg and ffprobe on PATH; standard library only, numpy for sfx; no network):
    python preview_options.py --video <film> --out <folder> [--ranking <ranking.json>] <track 1> <track 2> [<track 3>]
    python preview_options.py --length 30 --out <folder> <track 1> <track 2> [<track 3>]
    python preview_options.py sfx --video <film> --at <s> --out <folder> [--kind impact|whoosh|riser] [--moment <text>] <sound> <sound> [<sound>]
    python preview_options.py serve <folder> [--port <n>] [--timeout <s>]
    python preview_options.py taste pick <options.json> <A|B|C|none> [--ban <label>] | taste show | taste forget <name or sha>

Exit code: 0 on success, 1 when ffmpeg fails, 2 for bad input, 3 for a missing ffmpeg or ffprobe.
"""
from __future__ import annotations

import argparse
import html
import json
import math
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


def music_options(project: Path | None) -> tuple[int, str]:
    """How many options the user hears: `music_options` (2 or 3) in sources.json, the project's file over the home file;
    3 by default (sourcing-and-licenses.md section 0, lesson L41)."""
    n, origin = 3, "default"
    for f in [Path.home() / ".ice-motion-director" / "sources.json"] + ([project / "ice" / "sources.json"] if project else []):
        try:
            v = json.loads(f.read_text(encoding="utf-8-sig")).get("music_options")
        except (OSError, ValueError, AttributeError):
            continue
        if v in (2, 3):
            n, origin = v, f"{f} music_options"
    return n, origin


# ---------------------------------------------------------------- sfx mode: a blind pick with a taste memory
SFX_LEVEL = -20.0  # dBFS of every option's loudest 100 ms, so the pick is made on the sound, not on its level
KIND_SYNC = {"impact": "peak", "whoosh": "pass_by", "riser": "end"}  # references/sfx.md section 5 item 1
LABELS = "ABC"
SERVED = re.compile(r"^(compare\.html|option-[ABC]\.(mp4|m4a))$")


def sfx_page(labels: list[str], video: bool, moment: str, serve_note: bool) -> str:
    items = []
    for lab in labels:
        name = f"option-{lab}.{'mp4' if video else 'm4a'}"
        media = (f'<video src="{name}" controls preload="auto" loop></video>' if video
                 else f'<audio src="{name}" controls preload="auto" loop></audio>')
        items.append(f"""<figure>{media}<figcaption><b>Sound {lab}</b><br>
<button data-pick="{lab}">This one</button> <button class="ban" data-ban="{lab}">Never use this sound</button></figcaption></figure>""")
    what = f" for {html.escape(moment)}" if moment else ""
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Sound options</title>
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark light">
<style>body{{font:15px/1.5 system-ui,sans-serif;margin:16px;background:#111;color:#eee}}
main{{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}}
video,audio{{width:100%;background:#000}}figure{{margin:0}}button{{font:inherit;margin-top:6px;padding:6px 12px}}
.ban{{opacity:.75}}.on{{outline:2px solid #9cf}}#done{{margin-top:16px;font-weight:600}}</style></head>
<body><h1>Sound options{what}</h1>
<p>The same moment with {len(labels)} recorded sounds, each at the same level, in a random order: you do not know which
file is which. Play each, then pick the one that fits. Mark any sound you never want again.</p>
<main>{''.join(items)}</main>
<p><button data-pick="none">None of them fits</button> <button id="send">Save my choice</button></p>
<p id="done"></p>
<script>
const S = {{pick: null, ban: []}};
const done = document.getElementById("done");
document.querySelectorAll("[data-pick]").forEach(b => b.onclick = () => {{
  S.pick = b.dataset.pick === "none" ? null : b.dataset.pick;
  document.querySelectorAll("[data-pick]").forEach(x => x.classList.toggle("on", x === b));
  save();
}});
document.querySelectorAll("[data-ban]").forEach(b => b.onclick = () => {{
  const l = b.dataset.ban;
  S.ban = S.ban.includes(l) ? S.ban.filter(x => x !== l) : [...S.ban, l];
  b.classList.toggle("on", S.ban.includes(l));
}});
document.getElementById("send").onclick = save;
function line() {{ return "pick " + (S.pick || "none") + (S.ban.length ? ", ban " + S.ban.join(" ") : ""); }}
async function save() {{
  if ({'true' if serve_note else 'false'} && location.protocol.startsWith("http")) {{
    try {{
      const r = await fetch("/choice", {{method: "POST", headers: {{"Content-Type": "application/json"}}, body: JSON.stringify(S)}});
      if (r.ok) {{ done.textContent = "Saved: " + line() + ". You can close this page."; return; }}
    }} catch (e) {{}}
  }}
  done.textContent = "Tell the agent: " + line();
}}
</script></body></html>
"""


def loudest_100ms(np, x) -> float:
    w = 4800  # 100 ms at 48 kHz
    if len(x) <= w:
        return float(np.sqrt(np.mean(x ** 2))) or 1e-12
    c = np.cumsum(np.concatenate([[0.0], x ** 2]))
    return float(np.sqrt((c[w:] - c[:-w]).max() / w)) or 1e-12


def run_sfx(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(prog="preview_options.py sfx",
                                 description="Lay 2 or 3 recorded sounds on the same moment, blind and level-matched, and write compare.html. No network.",
                                 epilog="Then: preview_options.py serve <out> (one click saves the pick and bans to the taste file), or taste pick.")
    ap.add_argument("sounds", type=Path, nargs="+", help="2 or 3 local recorded sound files (never sound made by code)")
    ap.add_argument("--at", type=float, help="the moment in the picture (s) the sound lands on (needed with --video)")
    ap.add_argument("--out", type=Path, required=True, help="folder for option-A..C files, options.json and compare.html")
    ap.add_argument("--video", type=Path, help="the picture (animatic, draft); without it the options are audio only")
    ap.add_argument("--kind", choices=tuple(KIND_SYNC), default="impact",
                    help="impact: sync on the arrival of a sharp hit; whoosh: the pass-by peak; riser: the end")
    ap.add_argument("--window", type=float, default=3.0, help="seconds of picture around the moment (default 3)")
    ap.add_argument("--moment", default="", help="what happens at the moment (shown on the page, kept in the taste file)")
    ap.add_argument("--keep-film-audio", action="store_true", help="keep the picture's own sound under the options")
    ap.add_argument("--height", type=int, default=540, help="preview height in pixels (default 540)")
    ap.add_argument("--seed", type=int, help="fix the shuffle (tests)")
    args = ap.parse_args(argv)

    import random
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    import match_music as mm

    missing = [p for p in [*args.sounds, args.video] if p and not p.is_file()]
    if missing:
        sys.stderr.write("error: not a file: " + ", ".join(str(p) for p in missing) + "\n")
        return 2
    taste = mm.load_taste()
    sounds = []
    for p in args.sounds:
        sha = mm.file_sha256(p)
        if sha in taste["ban"]:
            print(f"left out: {p.name} is banned in your taste file ({mm.taste_path()})")
        else:
            sounds.append((p, sha))
    if not 2 <= len(sounds) <= 3:
        sys.stderr.write(f"error: give 2 or 3 sounds that are not banned ({len(sounds)} left)\n")
        return 2
    np = mm.need_numpy()
    if args.keep_film_audio and not args.video:
        sys.stderr.write("error: --keep-film-audio needs --video\n")
        return 2
    if args.video and args.at is None:
        sys.stderr.write("error: --video needs --at, the moment the sound lands on\n")
        return 2
    try:
        total = duration(args.video) if args.video else args.window
        if args.video and not 0 <= args.at <= total:
            sys.stderr.write(f"error: --at {args.at} is outside the picture (0 to {total:.2f} s)\n")
            return 2
        if args.video:
            w0 = min(max(args.at - args.window / 2, 0.0), max(total - args.window, 0.0))
            length = min(args.window, total)
        else:
            w0, length = 0.0, args.window
            args.at = min(1.0, length / 3)
        if args.keep_film_audio and not has_audio(args.video):
            sys.stderr.write("error: --keep-film-audio: the video has no audio stream\n")
            return 2
        order = list(range(len(sounds)))
        random.Random(args.seed).shuffle(order)
        args.out.mkdir(parents=True, exist_ok=True)
        cards = []
        for lab, idx in zip(LABELS, order):
            path, sha = sounds[idx]
            m = mm.measure_sfx(np, path, KIND_SYNC[args.kind])
            x, _ = mm.load_sfx(np, path)
            gain = SFX_LEVEL - 20 * math.log10(loudest_100ms(np, x))
            place = args.at - w0 - m["sync_s"]  # where the file starts inside the window
            pre = f"atrim=start={-place:.4f},asetpts=PTS-STARTPTS," if place < 0 else ""
            delay = f"adelay={max(place, 0.0) * 1000:.0f}:all=1,"
            chain = (f"[1:a:0]aformat=sample_rates=48000:channel_layouts=stereo,{pre}{delay}volume={gain:.2f}dB,"
                     f"apad=whole_dur={length:.3f},atrim=end={length:.3f}")
            if args.video:
                name = f"option-{lab}.mp4"
                if args.keep_film_audio:
                    fc = (f"{chain}[s];[0:a:0]aformat=sample_rates=48000:channel_layouts=stereo[f];"
                          f"[f][s]amix=inputs=2:duration=first:normalize=0,alimiter=limit={LIMIT}:level=false[a]")
                else:
                    fc = f"{chain},alimiter=limit={LIMIT}:level=false[a]"
                run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", f"{w0:.3f}", "-t", f"{length:.3f}", "-i", str(args.video),
                     "-i", str(path), "-filter_complex", fc, "-map", "0:v:0", "-map", "[a]", "-t", f"{length:.3f}",
                     "-vf", f"scale=-2:{args.height}", "-c:v", "libx264", "-preset", "veryfast", "-crf", "28",
                     "-pix_fmt", "yuv420p", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
                     str(args.out / name)])
            else:
                name = f"option-{lab}.m4a"
                run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "lavfi", "-t", f"{length:.3f}", "-i", "anullsrc=r=48000:cl=stereo",
                     "-i", str(path), "-filter_complex", f"{chain},alimiter=limit={LIMIT}:level=false[a]", "-map", "[a]",
                     "-c:a", "aac", "-b:a", "192k", str(args.out / name)])
            cards.append({"label": lab, "file": name, "sound": path.name, "path": str(path.resolve()), "sha256": sha,
                          "sync_s": m["sync_s"], "sync_rule": m["sync_rule"], "gain_db": round(gain, 2),
                          "starts_at_s": round(args.at - m["sync_s"], 3)})
            print(f"{name}: sync {m['sync_s']} s ({m['sync_rule']}), gain {gain:+.1f} dB")
    except FfmpegError as exc:
        sys.stderr.write(f"error: {exc}\n")
        return 1
    (args.out / "options.json").write_text(json.dumps({
        "version": 1, "mode": "sfx", "blind": True, "kind": args.kind, "moment": args.moment, "at_s": args.at,
        "picture": str(args.video or ""), "window_start_s": round(w0, 3), "length_s": round(length, 3),
        "level_dbfs_loudest_100ms": SFX_LEVEL, "options": cards}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    (args.out / "compare.html").write_text(sfx_page([c["label"] for c in cards], bool(args.video), args.moment, True), encoding="utf-8")
    print(f"wrote {args.out / 'compare.html'} (blind: the key is in options.json; do not tell the listener which is which)")
    return 0


def apply_choice(options_file: Path, choice: dict) -> dict:
    """Write the user's blind pick and bans into the taste file; return what changed. Raises ValueError on a bad choice."""
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    import match_music as mm
    opts = json.loads(options_file.read_text(encoding="utf-8"))
    if opts.get("mode") != "sfx":
        raise ValueError(f"{options_file} is not an sfx options file")
    by = {c["label"]: c for c in opts["options"]}
    pick, ban = choice.get("pick"), choice.get("ban") or []
    if not isinstance(ban, list) or any(b not in by for b in ban) or (pick is not None and pick not in by):
        raise ValueError(f"labels must be among {', '.join(by)}")
    if pick in ban:
        raise ValueError("a sound cannot be picked and banned")
    taste = mm.load_taste()
    from datetime import date
    def row(c: dict, old: dict | None) -> dict:
        return {"name": c["sound"], "path": c["path"], "kind": opts.get("kind"), "moment": opts.get("moment", ""),
                "date": date.today().isoformat(), "count": int((old or {}).get("count", 0)) + 1}
    if pick:
        c = by[pick]
        taste["love"][c["sha256"]] = row(c, taste["love"].get(c["sha256"]))
        taste["ban"].pop(c["sha256"], None)
    for b in ban:
        c = by[b]
        taste["ban"][c["sha256"]] = row(c, taste["ban"].get(c["sha256"]))
        taste["love"].pop(c["sha256"], None)
    f = mm.taste_path()
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(json.dumps(taste, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    result = {"pick": by[pick]["sound"] if pick else None, "ban": [by[b]["sound"] for b in ban], "taste_file": str(f)}
    (options_file.parent / "choice.json").write_text(json.dumps({"labels": choice, **result}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return result


def run_serve(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(prog="preview_options.py serve",
                                 description="Serve an sfx compare.html on 127.0.0.1; the first saved choice goes to the taste file, then the server stops.")
    ap.add_argument("folder", type=Path, help="the --out folder of preview_options.py sfx")
    ap.add_argument("--port", type=int, default=0, help="port (default: a free one)")
    ap.add_argument("--timeout", type=float, default=1800, help="stop after this many seconds without a choice (default 1800)")
    args = ap.parse_args(argv)
    options_file = args.folder / "options.json"
    if not options_file.is_file():
        sys.stderr.write(f"error: no options.json in {args.folder}: run preview_options.py sfx first\n")
        return 2
    from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
    import threading
    state: dict = {}

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *a):
            pass

        def do_GET(self):
            name = self.path.split("?")[0].lstrip("/") or "compare.html"
            f = args.folder / name
            if not SERVED.match(name) or not f.is_file():
                self.send_error(404)
                return
            data = f.read_bytes()
            kind = {"html": "text/html; charset=utf-8", "mp4": "video/mp4", "m4a": "audio/mp4"}[name.rsplit(".", 1)[1]]
            self.send_response(200)
            self.send_header("Content-Type", kind)
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(data)

        def do_POST(self):
            if self.path != "/choice":
                self.send_error(404)
                return
            try:
                body = json.loads(self.rfile.read(min(int(self.headers.get("Content-Length") or 0), 4096)) or b"{}")
                state["result"] = apply_choice(options_file, body if isinstance(body, dict) else {})
            except (ValueError, OSError) as exc:
                self.send_error(400, str(exc))
                return
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"ok": true}')
            threading.Thread(target=srv.shutdown, daemon=True).start()

    srv = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    print(f"listening page: http://127.0.0.1:{srv.server_address[1]}/ (open it, pick by ear; it stops after the choice)", flush=True)
    timer = threading.Timer(args.timeout, srv.shutdown)
    timer.daemon = True
    timer.start()
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        timer.cancel()
        srv.server_close()
    if "result" not in state:
        print("no choice saved: place the best by measurement and name the others in the delivery note")
        return 0
    r = state["result"]
    print(f"saved: pick {r['pick'] or 'none'}, ban {', '.join(r['ban']) or 'none'} -> {r['taste_file']}")
    return 0


def run_taste(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(prog="preview_options.py taste", description="Read or change the SFX taste file.")
    sub = ap.add_subparsers(dest="action", required=True)
    pk = sub.add_parser("pick", help="save a blind choice the user told in the chat")
    pk.add_argument("options", type=Path, help="options.json of preview_options.py sfx")
    pk.add_argument("label", help="the picked label (A, B, C) or none")
    pk.add_argument("--ban", action="append", default=[], help="a label the user never wants again (repeatable)")
    sub.add_parser("show", help="print the loved and banned sounds")
    fg = sub.add_parser("forget", help="drop a sound from the taste file, by file name or SHA-256")
    fg.add_argument("sound")
    args = ap.parse_args(argv)
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    import match_music as mm
    if args.action == "pick":
        try:
            r = apply_choice(args.options, {"pick": None if args.label.lower() == "none" else args.label.upper(),
                                            "ban": [b.upper() for b in args.ban]})
        except (ValueError, OSError) as exc:
            sys.stderr.write(f"error: {exc}\n")
            return 2
        print(f"saved: pick {r['pick'] or 'none'}, ban {', '.join(r['ban']) or 'none'} -> {r['taste_file']}")
        return 0
    taste = mm.load_taste()
    if args.action == "show":
        for part in ("love", "ban"):
            for sha, row in taste[part].items():
                print(f"{part}\t{row.get('name')}\t{row.get('kind')}\t{row.get('moment')}\t{row.get('date')}\t{sha}")
        print(f"taste file: {mm.taste_path()}")
        return 0
    gone = [(p, s) for p in ("love", "ban") for s, row in taste[p].items() if args.sound in (s, row.get("name"))]
    for p, s in gone:
        del taste[p][s]
    if gone:
        mm.taste_path().write_text(json.dumps(taste, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"forgot {len(gone)} entr{'y' if len(gone) == 1 else 'ies'}")
    return 0


def main(argv: list[str] | None = None) -> int:
    argv = sys.argv[1:] if argv is None else argv
    modes = {"sfx": run_sfx, "serve": run_serve, "taste": run_taste}
    if argv and argv[0] in modes:
        return modes[argv[0]](argv[1:])
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
    ap.add_argument("--project", type=Path, help="the user's project folder (reads music_options from its ice/sources.json)")
    args = ap.parse_args(argv)

    if not 2 <= len(args.tracks) <= 3:
        sys.stderr.write("error: give 2 or 3 tracks\n")
        return 2
    want, origin = music_options(args.project)
    if len(args.tracks) > want:
        print(f"music_options is {want} ({origin}): laying the best {want}, leaving out {', '.join(p.name for p in args.tracks[want:])}")
        args.tracks = args.tracks[:want]
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
