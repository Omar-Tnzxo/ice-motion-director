# Adapted from Omar-Tnzxo/video-production-studio tools/master_audio.py (founder-owned, licensed here under Apache-2.0). Changes: ffmpeg runs with stdin closed, clear error when ffmpeg or ffprobe is missing, --music-start (back-timing offset into the track), --music-fade-in (default 0: the music starts at full level), --music-fade-out (0 = keep the track's own ending) and --music-loop added, the applied music edges recorded in master.json, an unreadable video duration is an input error instead of a silent 10 s guess, usage path updated; loudnorm replaced by a measured linear gain plus a 4x oversampled true-peak limiter, output forced to 48 kHz, the exported file re-measured with ffmpeg ebur128 and re-rendered until the true peak meets the target (exit 1 when it cannot).
# 2026-10-29 (0.2.5): voice or SFX energy cut at the film end is reported in master.json ("cut_at_end") and on screen, and a
# cut voice fails the master (exit 1); a looped or short music track is recorded as before and also printed as a warning.
"""Master and normalize audio for video with multi-track mixing, loudness gain and a true-peak limiter.

Method: mix, measure integrated loudness with ffmpeg ebur128, apply the linear gain to the target, limit
true peaks with alimiter at 4x the sample rate (192 kHz), resample to 48 kHz, encode AAC 48 kHz, then
measure the exported file with ebur128=peak=true. If the measured true peak is above the target, the
limiter ceiling is lowered and the file rendered again (at most 5 renders). The script exits 1 when the
exported file still misses the true-peak target, is not 48 kHz, or is more than 1 LU off the loudness target.

Works on Windows, macOS and Linux (pathlib paths, no shell); needs ffmpeg and ffprobe on PATH.

Usage:
  python master_audio.py --video IN.mp4 --out OUT.mp4 [options]

Inputs:
  --video IN.mp4: Source video file path (required)
  --out OUT.mp4: Output video file path (required)
  --vo full.wav: Voiceover audio file path (optional)
  --vo-offset SEC: Delay offset in seconds for voiceover (default: 0.0)
  --keep-video-audio: Mix original audio track from source video
  --music FILE: Background music audio track (optional)
  --music-gain dB: Gain in dB for music track (default: -18.0)
  --music-start SEC: Start this many seconds into the music file (back-timing offset, default: 0.0)
  --music-fade-in SEC: Music fade-in length at the film start; 0 = none, the music starts at full level (default: 0.0)
  --music-fade-out SEC: Music fade-out length at the film end; 0 keeps the track's own ending (default: 1.5)
  --music-loop / --no-music-loop: Restart the music from its top when it is shorter than the film (default: loop);
      with --no-music-loop the music simply ends and the film continues without it
  --duck / --no-duck: Duck music under voiceover (default: true when both exist)
  --sfx sfx.json: JSON list of SFX cues [{"file": str, "at": float, "gain_db": float}]
  --target-lufs LUFS: Target integrated loudness (default: -14.0)
  --true-peak TP: Maximum true peak in dBTP, measured on the exported file (default: -1.5)
  --lra LRA: Accepted for old command lines and ignored; LRA is measured and reported

Music edges: these four flags are the only things that change the start or end of the music. Nothing else
fades, trims or delays it; voiceover and SFX are never faded. Every applied value is written to master.json
under "music_edges", with "looped" true when the track really restarted inside the film; a looped or short
track also prints a warning (it goes on the ear list of qc.py --audit).

Cut at the end: the voiceover and every SFX stop at the last frame. When one of them still carries sound after
it (a peak over -40 dBFS), master.json records it under "cut_at_end" and a line says so; a cut voice is a
problem (status fail, exit 1): end the line earlier or lengthen the picture.

Outputs:
  OUT.mp4: Mastered video file with copied video stream and AAC audio at 48 kHz
  master.json: Metrics file saved next to the output video ("status": "pass" or "fail", every render tried, "music_edges")

Exit codes:
  0: Success, 2: Bad input or invalid arguments, 1: Execution failure or a missed target
"""

import argparse
import json
import pathlib
import re
import shutil
import subprocess
import sys
from typing import Any

SAMPLE_RATE = 48000
OVERSAMPLE = 4
MAX_RENDERS = 5
LUFS_TOLERANCE = 1.0
FIRST_CEILING_MARGIN_DB = 1.0  # AAC at 192k adds about 0.5 to 1.4 dB of inter-sample overshoot; start below the target


def run_command(cmd: list[str]) -> subprocess.CompletedProcess[str]:
    """Execute a subprocess command safely without shell=True (stdin closed so ffmpeg never waits)."""
    return subprocess.run(
        cmd, capture_output=True, text=True, encoding="utf-8", errors="replace", stdin=subprocess.DEVNULL
    )


def probe_video(video_path: pathlib.Path) -> dict[str, Any]:
    """Probe video format and streams using ffprobe."""
    cmd = ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", str(video_path)]
    res = run_command(cmd)
    if res.returncode != 0:
        raise RuntimeError(f"ffprobe failed on {video_path}: {res.stderr}")

    try:
        data = json.loads(res.stdout)
    except Exception as exc:
        raise RuntimeError(f"Failed to parse ffprobe JSON output: {exc}") from exc

    video_stream: dict[str, Any] | None = None
    has_audio = False
    for stream in data.get("streams", []):
        if stream.get("codec_type") == "video" and video_stream is None:
            video_stream = stream
        elif stream.get("codec_type") == "audio":
            has_audio = True

    if not video_stream:
        raise ValueError(f"Input file contains no video stream: {video_path}")

    duration = 0.0
    for key in (video_stream.get("duration"), data.get("format", {}).get("duration")):
        try:
            if key is not None and float(key) > 0.0:
                duration = float(key)
                break
        except (ValueError, TypeError):
            pass

    r_frame_rate = video_stream.get("r_frame_rate", "30/1")
    try:
        fps = (
            float(r_frame_rate.split("/")[0]) / float(r_frame_rate.split("/")[1])
            if "/" in r_frame_rate
            else float(r_frame_rate)
        )
    except Exception:
        fps = 30.0

    raw_frames = video_stream.get("nb_frames")
    nb_frames: int | None = None
    if raw_frames and raw_frames != "N/A":
        try:
            nb_frames = int(raw_frames)
        except ValueError:
            pass
    if nb_frames is None and duration > 0.0:
        nb_frames = round(duration * fps)

    return {
        "codec_name": video_stream.get("codec_name", "unknown"),
        "nb_frames": nb_frames if nb_frames is not None else 0,
        "duration": duration,
        "fps": fps,
        "has_audio": has_audio,
    }


def parse_ebur128(stderr_text: str) -> dict[str, float]:
    """Read integrated loudness, LRA and true peak from the ebur128 summary printed on stderr."""
    tail = stderr_text[stderr_text.rfind("Summary:"):] if "Summary:" in stderr_text else stderr_text

    def grab(pattern: str) -> float:
        m = re.search(pattern, tail)
        if not m:
            raise RuntimeError(f"Could not read the ebur128 summary from ffmpeg output:\n{stderr_text[-2000:]}")
        return float(m.group(1))

    return {
        "lufs": grab(r"I:\s*(-?[\d.]+|-inf)\s*LUFS"),
        "lra": grab(r"LRA:\s*(-?[\d.]+)\s*LU"),
        "true_peak": grab(r"Peak:\s*(-?[\d.]+|-inf)\s*dBFS"),
    }


def measure_mix(ffmpeg_inputs: list[str], base_filter: str) -> dict[str, float]:
    """Loudness and true peak of the unprocessed mix."""
    graph = f"{base_filter};[a_mix]ebur128=peak=true:framelog=quiet[a_meas]"
    res = run_command(["ffmpeg", "-nostats", "-y"] + ffmpeg_inputs + ["-filter_complex", graph, "-map", "[a_meas]", "-f", "null", "-"])
    if res.returncode != 0:
        raise RuntimeError(f"FFmpeg loudness measurement of the mix failed:\n{res.stderr}")
    return parse_ebur128(res.stderr)


def measure_file(path: pathlib.Path) -> dict[str, Any]:
    """ebur128 (true peak on) of the exported file's audio, plus its sample rate from ffprobe."""
    res = run_command(["ffmpeg", "-nostats", "-i", str(path), "-map", "0:a:0", "-af", "ebur128=peak=true:framelog=quiet", "-f", "null", "-"])
    if res.returncode != 0:
        raise RuntimeError(f"FFmpeg measurement of {path} failed:\n{res.stderr}")
    out: dict[str, Any] = dict(parse_ebur128(res.stderr))
    probe = run_command(["ffprobe", "-v", "quiet", "-select_streams", "a:0", "-show_entries", "stream=sample_rate",
                         "-of", "default=noprint_wrappers=1:nokey=1", str(path)])
    try:
        out["sample_rate"] = int(probe.stdout.strip().splitlines()[0])
    except (ValueError, IndexError):
        out["sample_rate"] = 0
    return out


def master_chain(gain_db: float, ceiling_db: float) -> str:
    """Linear gain, 4x oversampled lookahead limiter (true-peak approximation), back to 48 kHz."""
    limit = min(1.0, max(0.0625, 10.0 ** (ceiling_db / 20.0)))
    hi = SAMPLE_RATE * OVERSAMPLE
    return (
        f"volume={gain_db:.3f}dB,aresample={hi},"
        f"alimiter=limit={limit:.6f}:attack=1.5:release=80:level=disabled:latency=1,"
        f"aresample={SAMPLE_RATE},aformat=sample_rates={SAMPLE_RATE}"
    )


def build_filter_graph(
    video_path: pathlib.Path,
    video_duration: float,
    video_has_audio: bool,
    keep_video_audio: bool,
    vo_path: pathlib.Path | None,
    vo_offset: float,
    music_path: pathlib.Path | None,
    music_gain: float,
    duck: bool,
    sfx_items: list[dict[str, Any]],
    music_start: float = 0.0,
    music_fade_out: float = 1.5,
    music_fade_in: float = 0.0,
    music_loop: bool = True,
) -> tuple[list[str], str]:
    """Construct FFmpeg input argument list and base audio filter complex."""
    ffmpeg_inputs: list[str] = ["-i", str(video_path)]
    current_input_idx = 1

    music_idx: int | None = None
    if music_path:
        music_idx = current_input_idx
        music_seek = ["-ss", f"{music_start:.4f}"] if music_start > 0 else []
        music_looping = ["-stream_loop", "-1"] if music_loop else []
        ffmpeg_inputs.extend([*music_looping, *music_seek, "-i", str(music_path)])
        current_input_idx += 1

    vo_idx: int | None = None
    if vo_path:
        vo_idx = current_input_idx
        ffmpeg_inputs.extend(["-i", str(vo_path)])
        current_input_idx += 1

    sfx_spec: list[tuple[int, dict[str, Any]]] = []
    for item in sfx_items:
        ffmpeg_inputs.extend(["-i", str(pathlib.Path(item["file"]))])
        sfx_spec.append((current_input_idx, item))
        current_input_idx += 1

    filter_chains: list[str] = []
    mix_inputs: list[str] = []

    # 1. Original video audio track
    if keep_video_audio or (not vo_path and not music_path and not sfx_items):
        if video_has_audio:
            filter_chains.append(
                f"[0:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,"
                f"atrim=0:{video_duration:.4f},asetpts=PTS-STARTPTS[a_vid]"
            )
            mix_inputs.append("[a_vid]")
        elif keep_video_audio:
            sys.stderr.write("Notice: --keep-video-audio requested but video has no audio stream.\n")

    # 2. Voiceover track
    if vo_path and vo_idx is not None:
        if vo_offset > 0:
            vo_timing = f"adelay={int(round(vo_offset * 1000.0))}|{int(round(vo_offset * 1000.0))}:all=1,"
        elif vo_offset < 0:
            vo_timing = f"atrim=start={abs(vo_offset):.4f},asetpts=PTS-STARTPTS,"
        else:
            vo_timing = ""
        filter_chains.append(
            f"[{vo_idx}:a]{vo_timing}aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,"
            f"atrim=0:{video_duration:.4f},asetpts=PTS-STARTPTS[a_vo_base]"
        )

    # 3. Background music track: full level from the first sample unless a fade-in is asked for; a fade-out
    # unless the track's own ending is kept. Each fade is capped at half the film.
    if music_path and music_idx is not None:
        fades = ""
        if music_fade_in > 0:
            in_d = min(music_fade_in, max(0.001, video_duration / 2.0))
            fades += f"afade=t=in:st=0:d={in_d:.3f},"
        if music_fade_out > 0:
            out_d = min(music_fade_out, max(0.1, video_duration / 2.0))
            fades += f"afade=t=out:st={max(0.0, video_duration - out_d):.2f}:d={out_d:.2f},"
        filter_chains.append(
            f"[{music_idx}:a]volume={music_gain:.2f}dB,atrim=0:{video_duration:.4f},asetpts=PTS-STARTPTS,"
            f"{fades}aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo[a_mus_base]"
        )

    # 4. Ducking (sidechain compression)
    if music_path and vo_path and duck:
        filter_chains.extend([
            "[a_vo_base]asplit=2[a_vo_mix][a_vo_sc_in]",
            "[a_vo_sc_in]apad[a_vo_sc]",
            f"[a_mus_base][a_vo_sc]sidechaincompress=threshold=0.125:ratio=4:attack=50:release=300,"
            f"atrim=0:{video_duration:.4f},asetpts=PTS-STARTPTS[a_mus_ducked]",
        ])
        mix_inputs.extend(["[a_vo_mix]", "[a_mus_ducked]"])
    else:
        if vo_path:
            mix_inputs.append("[a_vo_base]")
        if music_path:
            mix_inputs.append("[a_mus_base]")

    # 5. SFX tracks
    for idx, (in_idx, item) in enumerate(sfx_spec):
        at_sec = float(item.get("at", 0.0))
        gain_db = float(item.get("gain_db", 0.0))
        if at_sec > 0:
            sfx_timing = f"adelay={int(round(at_sec * 1000.0))}|{int(round(at_sec * 1000.0))}:all=1,"
        elif at_sec < 0:
            sfx_timing = f"atrim=start={abs(at_sec):.4f},asetpts=PTS-STARTPTS,"
        else:
            sfx_timing = ""
        filter_chains.append(
            f"[{in_idx}:a]volume={gain_db:.2f}dB,{sfx_timing}"
            f"aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,"
            f"atrim=0:{video_duration:.4f},asetpts=PTS-STARTPTS[a_sfx_{idx}]"
        )
        mix_inputs.append(f"[a_sfx_{idx}]")

    if not mix_inputs:
        raise ValueError("No audio sources available to master.")

    if len(mix_inputs) == 1:
        filter_chains.append(f"{mix_inputs[0]}anull[a_mix]")
    else:
        filter_chains.append(
            f"{''.join(mix_inputs)}amix=inputs={len(mix_inputs)}:duration=first:dropout_transition=0:normalize=0[a_mix]"
        )

    return ffmpeg_inputs, ";".join(filter_chains)


def media_duration(path: pathlib.Path) -> float | None:
    """Duration in seconds of any media file from ffprobe, or None when it cannot be read."""
    res = run_command(["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
                       "-of", "default=noprint_wrappers=1:nokey=1", str(path)])
    try:
        value = float(res.stdout.strip().splitlines()[0])
    except (ValueError, IndexError):
        return None
    return value if value > 0 else None


def describe_music_edges(
    music: pathlib.Path | None,
    video_duration: float,
    music_start: float,
    music_fade_in: float,
    music_fade_out: float,
    music_loop: bool,
) -> dict[str, Any] | None:
    """Record exactly what happens at the start and end of the music, so a reviewer never has to guess."""
    if not music:
        return None
    half = max(0.001, video_duration / 2.0)
    length = media_duration(music)
    remaining = None if length is None else max(0.0, length - music_start)
    short = remaining is not None and remaining < video_duration
    return {
        "start_sec": music_start,
        "fade_in_sec": round(min(music_fade_in, half), 3) if music_fade_in > 0 else 0.0,
        "fade_out_sec": round(min(music_fade_out, half), 3) if music_fade_out > 0 else 0.0,
        "loop": music_loop,
        "music_duration_sec": length,
        "looped": bool(short and music_loop),
        "ends_before_film": bool(short and not music_loop),
    }


CUT_TAIL_DB = -40.0  # a peak over this after the last frame counts as sound that the end cuts


def tail_peak_db(path: pathlib.Path, start_sec: float, gain_db: float = 0.0) -> float | None:
    """Peak level in dBFS of a file from start_sec to its end (ffmpeg volumedetect), or None when nothing is left."""
    length = media_duration(path)
    if length is None or start_sec >= length - 0.02:
        return None
    res = run_command(["ffmpeg", "-nostats", "-ss", f"{max(0.0, start_sec):.4f}", "-i", str(path), "-map", "0:a:0",
                       "-af", "volumedetect", "-f", "null", "-"])
    m = re.search(r"max_volume:\s*(-?[\d.]+|-inf) dB", res.stderr or "")
    if res.returncode != 0 or not m or m.group(1) == "-inf":
        return None
    return float(m.group(1)) + gain_db


def describe_cuts_at_end(
    vo: pathlib.Path | None, vo_offset: float, sfx_items: list[dict[str, Any]], video_duration: float,
) -> dict[str, Any]:
    """Voice and SFX sound that the film end cuts (both are trimmed at the last frame)."""
    out: dict[str, Any] = {"voice": None, "sfx": []}
    if vo:
        start = video_duration - vo_offset  # the file time that meets the last frame
        peak = tail_peak_db(vo, start)
        length = media_duration(vo)
        after = None if length is None else round(max(0.0, length - start), 3)
        out["voice"] = {"cut": peak is not None and peak > CUT_TAIL_DB, "seconds_after_end": after,
                        "peak_db": None if peak is None else round(peak, 1)}
    for item in sfx_items:
        start = video_duration - float(item.get("at", 0.0))
        peak = tail_peak_db(pathlib.Path(item["file"]), start, float(item.get("gain_db", 0.0)))
        if peak is not None and peak > CUT_TAIL_DB:
            length = media_duration(pathlib.Path(item["file"])) or 0.0
            out["sfx"].append({"file": str(item["file"]), "seconds_after_end": round(max(0.0, length - start), 3),
                               "peak_db": round(peak, 1)})
    return out


def master_audio(
    video: pathlib.Path,
    out: pathlib.Path,
    vo: pathlib.Path | None = None,
    vo_offset: float = 0.0,
    keep_video_audio: bool = False,
    music: pathlib.Path | None = None,
    music_gain: float = -18.0,
    duck: bool | None = None,
    sfx: pathlib.Path | None = None,
    target_lufs: float = -14.0,
    true_peak: float = -1.5,
    lra: float = 11.0,
    music_start: float = 0.0,
    music_fade_out: float = 1.5,
    music_fade_in: float = 0.0,
    music_loop: bool = True,
) -> dict[str, Any]:
    """Execute two-pass loudness normalization and audio mix for video."""
    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        raise RuntimeError("ffmpeg and ffprobe must be installed and on PATH.")
    if not video.exists():
        raise FileNotFoundError(f"Video file not found: {video}")
    if vo and not vo.exists():
        raise FileNotFoundError(f"Voiceover file not found: {vo}")
    if music and not music.exists():
        raise FileNotFoundError(f"Music file not found: {music}")
    for name, value in (("--music-start", music_start), ("--music-fade-in", music_fade_in), ("--music-fade-out", music_fade_out)):
        if value < 0:
            raise ValueError(f"{name} must be 0 or more, got {value}")

    sfx_items: list[dict[str, Any]] = []
    if sfx:
        if not sfx.exists():
            raise FileNotFoundError(f"SFX JSON file not found: {sfx}")
        with sfx.open("r", encoding="utf-8") as f:
            raw_sfx = json.load(f)
        if not isinstance(raw_sfx, list):
            raise ValueError(f"SFX file must contain a JSON array: {sfx}")
        for item in raw_sfx:
            if not isinstance(item, dict) or "file" not in item:
                raise ValueError(f"SFX entry missing required 'file' property: {item}")
            sfx_file = pathlib.Path(item["file"])
            if not sfx_file.is_absolute():
                sfx_file = sfx.parent / sfx_file
            if not sfx_file.exists():
                raise FileNotFoundError(f"Referenced SFX file does not exist: {sfx_file}")
            sfx_items.append({"file": sfx_file, "at": float(item.get("at", 0.0)), "gain_db": float(item.get("gain_db", 0.0))})

    if duck is None:
        duck = bool(vo and music)

    vid_info = probe_video(video)
    if vid_info["duration"] <= 0.0:
        raise ValueError(f"Could not read the duration of {video}; remux it (ffmpeg -i IN -c copy OUT) and try again.")
    video_duration = vid_info["duration"]
    out.parent.mkdir(parents=True, exist_ok=True)
    music_edges = describe_music_edges(music, video_duration, music_start, music_fade_in, music_fade_out, music_loop)
    cut_at_end = describe_cuts_at_end(vo, vo_offset, sfx_items, video_duration)

    ffmpeg_inputs, base_filter = build_filter_graph(
        video_path=video, video_duration=video_duration, video_has_audio=vid_info["has_audio"],
        keep_video_audio=keep_video_audio, vo_path=vo, vo_offset=vo_offset, music_path=music,
        music_gain=music_gain, duck=duck, sfx_items=sfx_items,
        music_start=music_start, music_fade_out=music_fade_out,
        music_fade_in=music_fade_in, music_loop=music_loop,
    )

    # Pass 1: measure the mix
    measured_in = measure_mix(ffmpeg_inputs, base_filter)
    if measured_in["lufs"] <= -60.0:
        raise RuntimeError(f"The mix is silent or nearly silent ({measured_in['lufs']} LUFS); check the inputs.")
    gain = target_lufs - measured_in["lufs"]
    ceiling = true_peak - FIRST_CEILING_MARGIN_DB

    # Pass 2 and later: render, measure the exported file, tighten until the true peak meets the target
    renders: list[dict[str, Any]] = []
    final: dict[str, Any] = {}
    for _attempt in range(MAX_RENDERS):
        graph = f"{base_filter};[a_mix]{master_chain(gain, ceiling)}[a_out]"
        res = run_command(["ffmpeg", "-y"] + ffmpeg_inputs + [
            "-filter_complex", graph, "-map", "0:v", "-map", "[a_out]",
            "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", str(SAMPLE_RATE), str(out),
        ])
        if res.returncode != 0:
            raise RuntimeError(f"FFmpeg rendering failed:\n{res.stderr}")
        final = measure_file(out)
        renders.append({"gain_db": round(gain, 3), "limiter_ceiling_db": round(ceiling, 3), **final})
        tp_over = final["true_peak"] - true_peak
        lufs_off = target_lufs - final["lufs"]
        if tp_over > 0:
            ceiling -= tp_over + 0.1
        elif abs(lufs_off) > 0.5:
            gain += lufs_off
        else:
            break

    problems = []
    if final["true_peak"] > true_peak:
        problems.append(f"true peak {final['true_peak']} dBTP is above the {true_peak} dBTP target")
    if final["sample_rate"] != SAMPLE_RATE:
        problems.append(f"audio sample rate is {final['sample_rate']} Hz, not {SAMPLE_RATE}")
    if abs(final["lufs"] - target_lufs) > LUFS_TOLERANCE:
        problems.append(f"integrated loudness {final['lufs']} LUFS is more than {LUFS_TOLERANCE} LU from {target_lufs}")
    if cut_at_end["voice"] and cut_at_end["voice"]["cut"]:
        problems.append(f"the voiceover is cut at the film end ({cut_at_end['voice']['seconds_after_end']} s after the "
                        f"last frame, peak {cut_at_end['voice']['peak_db']} dBFS): end the line earlier or lengthen the picture")

    out_info = probe_video(out)
    master_summary = {
        "status": "fail" if problems else "pass",
        "problems": problems,
        "target_lufs": target_lufs,
        "true_peak": true_peak,
        "meter": "ffmpeg ebur128=peak=true on the exported file",
        "measured_input": measured_in,
        "measured_output": final,
        "renders": renders,
        "music_edges": music_edges,
        "cut_at_end": cut_at_end,
        "video_stream": {"codec_name": out_info["codec_name"], "nb_frames": out_info["nb_frames"], "duration": out_info["duration"]},
        "output_file": str(out.resolve()),
    }

    with (out.parent / "master.json").open("w", encoding="utf-8") as f:
        json.dump(master_summary, f, ensure_ascii=False, indent=2)

    return master_summary


def main() -> int:
    """CLI entry point for master_audio."""
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

    parser = build_parser()

    try:
        args = parser.parse_args()
    except SystemExit as exc:
        return 2 if exc.code != 0 else 0

    try:
        summary = master_audio(
            video=args.video, out=args.out, vo=args.vo, vo_offset=args.vo_offset,
            keep_video_audio=args.keep_video_audio, music=args.music, music_gain=args.music_gain,
            duck=args.duck, sfx=args.sfx, target_lufs=args.target_lufs, true_peak=args.true_peak, lra=args.lra,
            music_start=args.music_start, music_fade_out=args.music_fade_out,
            music_fade_in=args.music_fade_in, music_loop=args.music_loop,
        )
        sys.stdout.write(json.dumps(summary, ensure_ascii=False) + "\n")
        edges = summary.get("music_edges") or {}
        if edges.get("looped") or edges.get("ends_before_film"):
            sys.stderr.write("WARNING: the music track is shorter than the film ("
                             + ("it loops from its top" if edges.get("looped") else "it ends before the film")
                             + "); it goes on the ear list of qc.py --audit: fix the edit or the cue first "
                             "(mix-and-master.md section 6)\n")
        cut = summary.get("cut_at_end") or {}
        if (cut.get("voice") or {}).get("cut"):
            sys.stderr.write(f"CUT: the voiceover still speaks {cut['voice']['seconds_after_end']} s after the last frame\n")
        for s in cut.get("sfx") or []:
            sys.stderr.write(f"CUT: {pathlib.Path(s['file']).name} still sounds {s['seconds_after_end']} s after the last frame\n")
        if summary["status"] != "pass":
            sys.stderr.write("FAIL: " + "; ".join(summary["problems"]) + "\n")
            return 1
        return 0
    except (FileNotFoundError, ValueError) as err:
        sys.stderr.write(f"Input error: {err}\n")
        return 2
    except Exception as err:
        sys.stderr.write(f"Processing error: {err}\n")
        return 1


def build_parser() -> argparse.ArgumentParser:
    """Command line options (kept separate so tests can read the defaults)."""
    parser = argparse.ArgumentParser(
        description="Master and normalize audio for video with multi-track mixing and two-pass loudness.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--video", required=True, type=pathlib.Path, help="Input video file path.")
    parser.add_argument("--out", required=True, type=pathlib.Path, help="Mastered output video path.")
    parser.add_argument("--vo", type=pathlib.Path, default=None, help="Voiceover audio file path.")
    parser.add_argument("--vo-offset", type=float, default=0.0, help="Offset in seconds for voiceover.")
    parser.add_argument("--keep-video-audio", action="store_true", help="Mix original audio from video.")
    parser.add_argument("--music", type=pathlib.Path, default=None, help="Background music audio file path.")
    parser.add_argument("--music-gain", type=float, default=-18.0, help="Music gain in dB (default: -18.0).")
    parser.add_argument("--music-start", type=float, default=0.0,
                        help="Seconds into the music file where the film starts (back-timing offset).")
    parser.add_argument("--music-fade-in", type=float, default=0.0,
                        help="Music fade-in seconds at the start (default: 0, the music starts at full level).")
    parser.add_argument("--music-fade-out", type=float, default=1.5,
                        help="Music fade-out seconds at the end; 0 keeps the track's own ending.")
    parser.add_argument(
        "--music-loop", dest="music_loop", action=argparse.BooleanOptionalAction, default=True,
        help="Restart the music from its top when it is shorter than the film (default: on).",
    )
    parser.add_argument(
        "--duck", dest="duck", action=argparse.BooleanOptionalAction, default=None,
        help="Duck music under voiceover (default: true when both exist).",
    )
    parser.add_argument("--sfx", type=pathlib.Path, default=None, help="Path to sfx.json list.")
    parser.add_argument("--target-lufs", type=float, default=-14.0, help="Target integrated loudness in LUFS.")
    parser.add_argument("--true-peak", type=float, default=-1.5, help="Maximum true peak in dBTP on the exported file.")
    parser.add_argument("--lra", type=float, default=11.0, help="Ignored (kept for old command lines); LRA is measured and reported.")
    return parser


if __name__ == "__main__":
    sys.exit(main())
