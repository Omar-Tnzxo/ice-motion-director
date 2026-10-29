#!/usr/bin/env python
# Written for Ice Motion Director (0.2.6, 2026-10-29), ported from the tested prototype ice_fetch.py of the sources
# research (stdlib Python, 2026-10-29). Changes from the prototype: search and download are separate steps, so the
# agent ranks candidates by fit before it fetches one item (sourcing-and-licenses.md section 1a); route names are the
# route ids of section 4 (openverse, wikimedia, internet_archive, nasa, youtube_official); the official-channel route
# through the pinned yt-dlp is added (one clip per call, its channel checked); files land in the user's project with
# the sidecar, manifest row and credits row of project-folders.md sections 3, 3b and 4; ICE_OFFLINE and sources.json
# are read before any network call; 90 s timeouts, 3 tries, a cache in temp/cache/, the 1 KB range probe and Ice's own
# User-Agent (section 5); a `record` step for local files. The prototype's Wikidata portrait and flag commands were not
# ported: Commons search (--type image or svg) reaches the same files.
"""fetch_media.py: find and fetch real footage, photos and sound from the routes that need no key, with their records.

Steps (the ice-assets skill, references/sourcing-and-licenses.md sections 1a, 4 and 5):
  search  list candidates from one route; nothing is downloaded.
          python fetch_media.py search <route> --terms "<words>" --terms-from "<script line or brief slot>" [--type <type>]
          The words come only from the scene's script line or a brief slot and the runtime date (ice-direction,
          references/research.md section 3). This script holds no query of its own.
  get     fetch ONE chosen item into the project with its sidecar, manifest row and credits row.
          python fetch_media.py get <route> <id> --project <folder> [--type <type>] [--height <H>] [--window <start>-<end>]
          Video needs --height: the output height, or the larger height the zoom rule needs (section 5).
          Route youtube_official also needs --channel <the official channel URL>, --official-from <the owner's page
          that links that channel, or "verified mark"> and --owner-kind agency|other: one clip per call, never a
          channel, a playlist or a search page (section 7).
  record  write the same records for a local file (a file from assets/inbox/, a file the user downloaded).
  doctor  the settings in force (ICE_OFFLINE, sources.json), the tools found and the User-Agent; no network.

Routes (no key): openverse (image, audio), wikimedia (image, svg, video, audio), internet_archive (video, audio,
image), nasa (image, video, audio), youtube_official (video through the pinned yt-dlp).

Exit codes: 0 done; 1 failed (network, no result, a tool error); 2 usage error; 3 not done because of the user's
settings or a sourcing rule (offline, route off, a yes needed, over the size cap, not one official clip, disk space).
Downloads are data: never opened as code, never executed. Standard library only; ffmpeg and ffprobe for windows,
scaling and the probe facts; yt-dlp only for youtube_official.
"""
import argparse
import datetime
import hashlib
import importlib.util
import json
import os
import re
import shutil
import subprocess
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
VERSIONS = HERE.parents[1] / "ice-engines" / "references" / "versions.json"
REPO_URL = "https://github.com/Omar-Tnzxo/ice-motion-director"
TIMEOUT_S = 90
TRIES = 3
MAX_CANDIDATES = 20
OK, FAIL, USAGE, REFUSED = 0, 1, 2, 3

ROUTES = {
    "openverse": ("image", "audio"),
    "wikimedia": ("image", "svg", "video", "audio"),
    "internet_archive": ("video", "audio", "image"),
    "nasa": ("image", "video", "audio"),
    "youtube_official": ("video",),
}
SITES = {"openverse": "Openverse", "wikimedia": "Wikimedia Commons", "internet_archive": "Internet Archive",
         "nasa": "NASA Image and Video Library", "youtube_official": "official channel on a video platform (yt-dlp)",
         "user-download": "the user's download"}
FOLDER = {"image": "images", "svg": "images", "video": "footage", "audio": "audio"}
DEFAULT_ROLE = {"image": "photo", "svg": "icon", "video": "footage", "audio": "sfx"}
ROLES = ("footage", "photo", "music", "sfx", "texture", "icon")
EXT_KIND = {**{e: "video" for e in ("mp4", "mov", "m4v", "webm", "mkv", "ogv", "avi", "mpg", "mpeg")},
            **{e: "audio" for e in ("wav", "mp3", "flac", "ogg", "oga", "m4a", "aac", "opus", "aif", "aiff")},
            **{e: "image" for e in ("jpg", "jpeg", "png", "webp", "tif", "tiff", "gif")}, "svg": "svg"}
CREDITS_HEADER = ("| File | Site | Original URL | Owner | License status (`licensed` with id and version, `unknown`, "
                  "`needs purchase`) | Author / attribution text | Changes | Used in | Checked |")
DELIVERY_LINE = ("Downloaded from {platform} with yt-dlp; the platform's terms do not allow downloads; "
                 "listed under Needs a license before publishing.")


class Stop(Exception):
    def __init__(self, code, message):
        super().__init__(message)
        self.code = code


def log(msg):
    print(msg, file=sys.stderr)


def today():
    return datetime.date.today().isoformat()


def ice_version():
    try:
        m = re.search(r"^\s+version:\s*\"?([0-9][0-9A-Za-z.+-]*)", (HERE.parent / "SKILL.md").read_text(encoding="utf-8"), re.M)
        return m.group(1) if m else "dev"
    except OSError:
        return "dev"


UA = f"IceMotionDirector/{ice_version()} (+{REPO_URL})"


def host(url):
    return urllib.parse.urlparse(url).netloc or url


def text_of(v):
    if isinstance(v, list):
        return ", ".join(str(x) for x in v if x)
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", str(v or ""))).strip()


def https(url):
    url = str(url or "").strip()
    return "https://" + url[7:] if url.startswith("http://") else url


# ---------------------------------------------------------------- settings: ICE_OFFLINE and sources.json (section 0)

def offline_env():
    return os.environ.get("ICE_OFFLINE", "").strip().lower() in ("1", "true", "yes")


def load_settings(project):
    """downloads, max_download_mb and per-route switches; the project's ice/sources.json overrides the home file."""
    s = {"downloads": "allowed", "max_download_mb": 500.0, "routes": {},
         "origin": {"downloads": "default", "max_download_mb": "default"}}
    if offline_env():
        s["downloads"], s["origin"]["downloads"] = "off", "ICE_OFFLINE=1"
        return s
    files = [Path.home() / ".ice-motion-director" / "sources.json"]
    if project:
        files.append(Path(project) / "ice" / "sources.json")
    for f in files:
        if not f.is_file():
            continue
        try:
            data = json.loads(f.read_text(encoding="utf-8-sig"))
        except (OSError, ValueError) as e:
            log(f"warning: {f} is not readable JSON ({e}); its settings are ignored")
            continue
        if not isinstance(data, dict):
            continue
        if data.get("downloads") in ("allowed", "ask", "off"):
            s["downloads"], s["origin"]["downloads"] = data["downloads"], f"{f} downloads"
        cap = data.get("max_download_mb")
        if isinstance(cap, (int, float)) and not isinstance(cap, bool) and cap > 0:
            s["max_download_mb"], s["origin"]["max_download_mb"] = float(cap), f"{f} max_download_mb"
        if isinstance(data.get("routes"), dict):
            for k, v in data["routes"].items():
                if v is True or v is False or v == "ask":
                    s["routes"][k] = (v, f"{f} routes.{k}")
    return s


def gate(s, route, action, yes=False):
    """Refuse before any network call when the user's settings say so (sourcing-and-licenses.md section 0)."""
    if s["downloads"] == "off":
        raise Stop(REFUSED, f"downloads are off ({s['origin']['downloads']}): no network at all. Take the next local or "
                            "bundled rung of the ladder (sourcing-and-licenses.md section 1) and name the item in the delivery note")
    value, origin = s["routes"].get(route, (True, "default"))
    if value is False:
        raise Stop(REFUSED, f"the route {route} is switched off ({origin}): take the next route of the ladder (section 1)")
    if action == "get" and not yes:
        why = s["origin"]["downloads"] if s["downloads"] == "ask" else (origin if value == "ask" else None)
        if why:
            raise Stop(REFUSED, f"this download needs a yes ({why}: ask). Put the item, its site and its size in the stage 01 "
                                "message or the review card (ice-motion-director/SKILL.md section 5, \"Stops\"); after a yes, "
                                "run again with --yes. Meanwhile the scene takes the next rung")


def check_size(s, nbytes, yes, what):
    cap = s["max_download_mb"] * 1_000_000
    if nbytes and nbytes > cap and not yes:
        raise Stop(REFUSED, f"{what} is about {nbytes / 1e6:.1f} MB, over max_download_mb {s['max_download_mb']:g} "
                            f"({s['origin']['max_download_mb']}): take a smaller rendition or a shorter --window (section 5), "
                            "or ask with its size in the stops and run again with --yes")


def check_disk(folder, nbytes):
    probe = Path(folder)
    while not probe.exists() and probe != probe.parent:
        probe = probe.parent
    free = shutil.disk_usage(probe).free
    if nbytes and free < nbytes * 1.2 + 200_000_000:
        raise Stop(REFUSED, f"not enough free disk space on {probe} ({free / 1e9:.1f} GB free for about {nbytes / 1e9:.2f} GB): "
                            "run node <ice-motion-director>/scripts/ice-state.mjs space --need <GB> and follow the \"Disk space\" "
                            "subsection of ice-engines/references/engine-choice.md section 7")


# ---------------------------------------------------------------- network (section 5: 90 s, 3 tries, cache, honest UA)

def open_url(url, headers=None):
    hdrs = {"User-Agent": UA, **(headers or {})}
    last = ""
    for attempt in range(1, TRIES + 1):
        wait = 5 * attempt
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=hdrs), timeout=TIMEOUT_S)
        except urllib.error.HTTPError as e:
            last = f"HTTP {e.code}"
            if e.code == 429:
                try:
                    wait = min(int(e.headers.get("Retry-After") or 20), 90)
                except ValueError:
                    wait = 20
            elif e.code in (401, 403, 407):
                raise Stop(FAIL, f"{host(url)} answered HTTP {e.code} (a sign-in, a key or a bot wall): never fake a browser or "
                                 "sign in; this item becomes a FETCH-LIST.md entry for the user (project-folders.md section 4b)")
            elif e.code < 500:
                raise Stop(FAIL, f"{host(url)} answered HTTP {e.code} for {url}")
        except (urllib.error.URLError, TimeoutError, ConnectionError, OSError) as e:
            last = str(getattr(e, "reason", e))
        if attempt < TRIES:
            log(f"  {last} from {host(url)}; try {attempt + 1} of {TRIES} in {wait} s")
            time.sleep(wait)
    raise Stop(FAIL, f"no answer from {host(url)} after {TRIES} tries ({last}): take the next route of the ladder (section 1)")


def get_json(url, cache=None):
    key = cache / (hashlib.sha1(url.encode("utf-8")).hexdigest() + ".json") if cache else None
    if key and key.is_file():
        try:
            return json.loads(key.read_text(encoding="utf-8"))
        except ValueError:
            pass
    for attempt in range(1, TRIES + 1):
        with open_url(url, {"Accept": "application/json"}) as r:
            raw = r.read()
        try:
            data = json.loads(raw.decode("utf-8"))
        except ValueError:
            raise Stop(FAIL, f"{host(url)} did not answer with JSON (an error page or a bot wall): take the next route")
        err = data.get("error") if isinstance(data, dict) else None
        if not err:
            break
        # An API error inside a 200 answer (a busy search cluster, a rate limit) is retried and never cached.
        info = (err.get("info") or err.get("code")) if isinstance(err, dict) else str(err)
        if attempt == TRIES:
            raise Stop(FAIL, f"{host(url)} answered an error after {TRIES} tries ({info}): take the next route of the ladder")
        log(f"  {host(url)}: {info}; try {attempt + 1} of {TRIES} in {10 * attempt} s")
        time.sleep(10 * attempt)
    if key:
        key.parent.mkdir(parents=True, exist_ok=True)
        key.write_text(json.dumps(data), encoding="utf-8")
    return data


def probe_ranges(url):
    """(serves byte ranges, total size or 0) from a 1 KB range request: 206 means a window can be cut from the URL."""
    with open_url(url, {"Range": "bytes=0-1023"}) as r:
        r.read(1024)
        m = re.search(r"/(\d+)\s*$", r.headers.get("Content-Range", ""))
        total = int(m.group(1)) if m else int(r.headers.get("Content-Length") or 0) if r.status == 200 else 0
        return r.status == 206, total


def download(url, dest, s, yes, what):
    last = ""
    for attempt in range(1, TRIES + 1):
        part = dest.with_name(dest.name + ".part")
        try:
            with open_url(url) as r:
                if r.headers.get("Content-Type", "").lower().startswith("text/html"):
                    raise Stop(FAIL, f"{host(url)} answered with a web page, not the file (a sign-in, a captcha or a bot wall): "
                                     "this item becomes a FETCH-LIST.md entry (project-folders.md section 4b)")
                length = int(r.headers.get("Content-Length") or 0)
                check_size(s, length, yes, what)
                check_disk(dest.parent, length)
                cap, n = s["max_download_mb"] * 1_000_000, 0
                with open(part, "wb") as f:
                    while True:
                        chunk = r.read(1 << 20)
                        if not chunk:
                            break
                        n += len(chunk)
                        if n > cap and not yes:
                            raise Stop(REFUSED, f"{what} passed max_download_mb {s['max_download_mb']:g} while downloading: "
                                                "take a smaller rendition or ask with its size in the stops")
                        f.write(chunk)
            if n == 0:
                raise Stop(FAIL, f"{host(url)} sent an empty file")
            os.replace(part, dest)
            return
        except Stop:
            part.unlink(missing_ok=True)
            raise
        except (OSError, urllib.error.URLError) as e:
            part.unlink(missing_ok=True)
            last = str(e)
            if attempt < TRIES:
                log(f"  download broke ({last}); try {attempt + 1} of {TRIES}")
                time.sleep(5 * attempt)
    raise Stop(FAIL, f"the download from {host(url)} failed after {TRIES} tries ({last})")


# ---------------------------------------------------------------- ffmpeg, ffprobe, records

def ffmpeg(args):
    if not shutil.which("ffmpeg"):
        raise Stop(FAIL, "ffmpeg is not on PATH: install FFmpeg (ice-engines references/engine-choice.md section 7), then retry")
    r = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *args], capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    return r.returncode == 0, r.stderr.strip()[-400:]


def cut_window(src, out, window, video, exact, remote):
    a, b = window
    pre = ["-rw_timeout", str(TIMEOUT_S * 1_000_000), "-user_agent", UA] if remote else []
    codec = (["-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k"]
             if exact and video else ["-c", "copy"])
    err = ""
    for attempt in range(1, (TRIES if remote else 1) + 1):
        out.unlink(missing_ok=True)
        ok, err = ffmpeg([*pre, "-ss", f"{a:g}", "-i", str(src), "-t", f"{b - a:g}", *codec, str(out)])
        if ok and out.is_file() and out.stat().st_size > 0:
            return
        if attempt < TRIES and remote:
            time.sleep(3 * attempt)
    raise Stop(FAIL, f"the {a:g}-{b:g} s window could not be cut: {err}")


def probe_file(path):
    facts = {}
    if shutil.which("ffprobe"):
        r = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                            "format=duration:stream=codec_type,codec_name,width,height,avg_frame_rate,r_frame_rate",
                            "-of", "json", str(path)], capture_output=True, text=True, encoding="utf-8", errors="replace")
        try:
            j = json.loads(r.stdout) if r.returncode == 0 else {}
        except ValueError:
            j = {}
        streams = j.get("streams") or []
        v = next((x for x in streams if x.get("codec_type") == "video"), None)
        main = v or next((x for x in streams if x.get("codec_type") == "audio"), None)
        if main:
            facts["codec"] = main.get("codec_name")
        if v:
            facts["width"], facts["height"] = v.get("width"), v.get("height")
            num, _, den = (v.get("avg_frame_rate") or v.get("r_frame_rate") or "0/0").partition("/")
            try:
                fps = float(num) / float(den or 1)
                if 0 < fps < 1000:
                    facts["fps"] = round(fps, 3)
            except (ValueError, ZeroDivisionError):
                pass
        try:
            facts["duration_s"] = round(float((j.get("format") or {}).get("duration")), 3)
        except (TypeError, ValueError):
            pass
        if not j:
            facts["note"] = "ffprobe could not read the file"
    else:
        facts["note"] = "ffprobe is not on PATH: only the size was recorded"
    facts["bytes"] = path.stat().st_size
    return facts


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    os.replace(tmp, path)


def cell(v):
    return re.sub(r"\s+", " ", str(v or "")).replace("|", "\\|").strip()


def manifest_row(side, role, label, changes):
    rights = {"owner": side["owner"], "license_status": side["license_status"]}
    if side["license"] != "none":
        rights["license"] = side["license"]
    if side["license_url"] != "none":
        rights["license_url"] = side["license_url"]
    if side.get("attribution"):
        rights["attribution"] = side["attribution"]
    name = Path(side["file"]).name
    if side["source_url"].startswith("https://"):
        source = {"type": "web-found", "url": side["source_url"]}
    else:
        source = {"type": "user-provided", "url": side["source_url"] if side["source_url"].startswith("user-provided://")
                  else f"user-provided://{name}"}
    source.update({"route": side["route"], "media_url": side["media_url"], "sidecar": f"ice/assets/sources/{name}.json"})
    return {"id": Path(name).stem, "role": role, "label": label, "path": side["file"], "source": source,
            "checked": side["fetched"], "rights": rights, "sha256": side["sha256"], "used_in": [], "changes": changes or "none"}


def write_records(project, side, role, label, changes):
    """The sidecar (project-folders.md 3b), the manifest row (3) and the CREDITS.md row (4); a second run replaces them."""
    name = Path(side["file"]).name
    write_json(project / "ice" / "assets" / "sources" / f"{name}.json", side)
    mpath = project / "ice" / "assets" / "manifest.json"
    manifest = {"version": 1, "assets": []}
    if mpath.is_file():
        try:
            manifest = json.loads(mpath.read_text(encoding="utf-8-sig"))
        except ValueError:
            raise Stop(FAIL, f"{mpath} is not valid JSON: fix it before recording new files")
    assets = manifest.setdefault("assets", [])
    row = manifest_row(side, role, label, changes)
    old = next((i for i, x in enumerate(assets) if isinstance(x, dict) and x.get("path") == row["path"]), None)
    if old is not None:
        row["id"], row["used_in"] = assets[old].get("id") or row["id"], assets[old].get("used_in") or []
        assets[old] = row
    else:
        ids, base, k = {x.get("id") for x in assets if isinstance(x, dict)}, row["id"], 2
        while row["id"] in ids:
            row["id"], k = f"{base}-{k}", k + 1
        assets.append(row)
    write_json(mpath, manifest)

    cpath = project / "ice" / "assets" / "CREDITS.md"
    lines = cpath.read_text(encoding="utf-8-sig").splitlines() if cpath.is_file() else ["# Credits", ""]
    head = next((i for i, l in enumerate(lines) if l.startswith("| File |")), None)
    if head is None:
        if lines and lines[-1].strip():
            lines.append("")
        lines += [CREDITS_HEADER, "|---|---|---|---|---|---|---|---|---|"]
        head = len(lines) - 2
    status = side["license_status"] + (f" ({side['license']}, {side['license_url']})" if side["license"] != "none" else "")
    prefix = f"| {cell(name)} |"
    at = next((i for i, l in enumerate(lines) if l.startswith(prefix)), None)
    used = ""
    if at is not None:
        cells = re.split(r"(?<!\\)\|", lines[at])
        used = cells[8].strip() if len(cells) > 9 else ""
    line = "| " + " | ".join(cell(x) for x in (name, SITES.get(side["route"], side["route"]), side["source_url"], side["owner"],
                                                status, side.get("attribution") or side["author"], changes or "none", used,
                                                side["fetched"])) + " |"
    if at is not None:
        lines[at] = line
    else:
        end = head + 2
        while end < len(lines) and lines[end].startswith("|"):
            end += 1
        lines.insert(end, line)
    cpath.parent.mkdir(parents=True, exist_ok=True)
    cpath.write_text("\n".join(lines) + "\n", encoding="utf-8")


# ---------------------------------------------------------------- licenses (section 2, ids the asset gate reads)

CC_URL = re.compile(r"creativecommons\.org/(licenses|publicdomain)/([a-z+-]+)/(\d+(?:\.\d+)?)", re.I)
CC_NAME = re.compile(r"^cc[\s-]*(by(?:[\s-]+(?:nc|nd|sa))*)[\s-]*(\d+(?:\.\d+)?)", re.I)
GIVEN_IDS = re.compile(r"^(CC0-1\.0|PDM|public-domain|CC-BY(-NC)?(-ND|-SA)?-\d+(\.\d+)?|OFL-1\.1|MIT|Apache-2\.0|ISC|"
                       r"BSD-[0-9A-Za-z-]+|Unlicense|Pixabay|Pexels|Unsplash|Mixkit|Coverr|Kenney)$", re.I)


def license_id(name="", url=""):
    """An SPDX-style id (CC-BY-4.0, CC0-1.0, PDM, public-domain) read from a license URL or name; '' when unknown."""
    m = CC_URL.search(url or "")
    if m:
        kind, code, ver = m.group(1).lower(), m.group(2).lower(), m.group(3)
        if kind == "publicdomain":
            return {"zero": "CC0-1.0", "mark": "PDM"}.get(code, "")
        return f"CC-{code.upper()}-{ver}" if re.fullmatch(r"by(-nc)?(-nd|-sa)?", code) else ""
    n = re.sub(r"\s+", " ", str(name or "").strip().lower())
    if n in ("cc0", "cc0 1.0", "cc0-1.0", "cc-0", "cc zero"):
        return "CC0-1.0"
    if n in ("pdm", "public domain mark", "pdm 1.0"):
        return "PDM"
    if n == "pd" or n.startswith(("public domain", "pd-", "pd ")):
        return "public-domain"
    m = CC_NAME.match(n)
    if not m:
        return ""
    code = re.sub(r"[\s-]+", "-", m.group(1)).upper()
    return f"CC-{code}-{m.group(2)}"


def commercial_use(project):
    try:
        return str(json.loads((project / "ice" / "state.json").read_text(encoding="utf-8-sig")).get("commercial_use") or "yes")
    except (OSError, ValueError, AttributeError):
        return "yes"


def status_for(lic, project):
    """licensed when the license is known; noncommercial in a commercial or unknown use is needs purchase (section 3 item 9)."""
    if not lic:
        return "unknown"
    if "-NC" in lic.upper() and commercial_use(project) != "no":
        return "needs purchase"
    return "licensed"


def attribution_for(item):
    lic = item["license"]
    if not (lic.upper().startswith("CC-BY") or lic.upper().startswith("ODBL")):
        return ""
    if item.get("attribution"):
        return item["attribution"]
    return f"\"{item['title']}\" by {item['author'] or item['owner']}, {lic} ({item['license_url']}), via {SITES[item['route']]}: {item['source_url']}"


# ---------------------------------------------------------------- routes: search and resolve one item

OV = "https://api.openverse.org/v1/"
COMMONS = "https://commons.wikimedia.org/w/api.php"
EXT_META = "LicenseShortName|LicenseUrl|Artist|Credit|DateTimeOriginal|UsageTerms"
COMMONS_FILETYPE = {"image": "filetype:bitmap", "svg": "filetype:drawing", "video": "filetype:video", "audio": "filetype:audio"}
IA_ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.-]{0,99}$")
IA_FORMATS = {"video": ("h.264", "h.264 IA", "MPEG4", "512Kb MPEG4", "HiRes MPEG4"),
              "audio": ("Flac", "24bit Flac", "WAVE", "VBR MP3", "Ogg Vorbis", "128Kbps MP3", "64Kbps MP3"),
              "image": ("JPEG", "PNG")}
NASA = "https://images-api.nasa.gov/"
NASA_LICENSE_URL = "https://www.nasa.gov/nasa-brand-center/images-and-media/"


def ov_url(kind):
    return OV + ("audio/" if kind == "audio" else "images/")


def ov_item(r, kind):
    lic = license_id(r.get("license"), r.get("license_url")) or license_id(f"cc {r.get('license', '')} {r.get('license_version') or ''}")
    if not lic and str(r.get("license", "")).lower() == "pdm":
        lic = "PDM"
    media = r.get("url") or ""
    return {"id": r.get("id"), "kind": kind, "title": r.get("title") or r.get("id"), "author": text_of(r.get("creator")),
            "license": lic, "license_name": f"{r.get('license', '')} {r.get('license_version') or ''}".strip(),
            "license_url": https(r.get("license_url")), "source_url": https(r.get("foreign_landing_url")), "media_url": media,
            "width": r.get("width"), "height": r.get("height"),
            "duration_s": round(r["duration"] / 1000, 2) if isinstance(r.get("duration"), (int, float)) else None,
            "via": f"openverse/{r.get('source') or r.get('provider')}", "attribution": r.get("attribution") or "",
            "rendition": "preview" if "/previews/" in media else "original",
            "ext": (r.get("filetype") or media.rsplit(".", 1)[-1] or "bin").lower()[:5]}


def commons_item(page, kind=None):
    ii = (page.get("imageinfo") or [{}])[0]
    em = ii.get("extmetadata") or {}
    v = lambda k: text_of((em.get(k) or {}).get("value", ""))
    mime = ii.get("mime") or ""
    kind = kind or ("svg" if mime == "image/svg+xml" else mime.split("/")[0] if mime.split("/")[0] in ("video", "audio") else "image")
    return {"id": page.get("title"), "kind": kind, "title": (page.get("title") or "").split(":", 1)[-1].rsplit(".", 1)[0],
            "author": v("Artist") or v("Credit"), "license": license_id(v("LicenseShortName"), v("LicenseUrl")),
            "license_name": v("LicenseShortName"), "license_url": https(v("LicenseUrl")), "published": v("DateTimeOriginal")[:40],
            "source_url": https(ii.get("descriptionurl")), "media_url": (ii.get("url") or "").split("?")[0],
            "width": ii.get("width"), "height": ii.get("height"), "duration_s": ii.get("duration"), "bytes": ii.get("size"),
            "rendition": "original", "thumb": ii.get("thumburl"), "thumbwidth": ii.get("thumbwidth"), "mime": mime}


def search(a, cache):
    n = max(1, min(a.n, MAX_CANDIDATES))
    kind = a.type or ROUTES[a.route][0]
    if a.route == "openverse":
        params = {"q": a.terms, "page_size": n, "filter_dead": "false"}
        params.update({k: v for k, v in (("license", a.license), ("source", a.source)) if v})
        data = get_json(ov_url(kind) + "?" + urllib.parse.urlencode(params), cache)
        return [ov_item(r, kind) for r in data.get("results", [])]
    if a.route == "wikimedia":
        data = get_json(COMMONS + "?" + urllib.parse.urlencode({
            "action": "query", "format": "json", "generator": "search", "gsrnamespace": "6", "gsrlimit": n,
            "gsrsearch": f"{a.terms} {COMMONS_FILETYPE[kind]}", "prop": "imageinfo", "iiprop": "url|size|mime|extmetadata",
            "iiextmetadatafilter": EXT_META}), cache)
        pages = sorted((data.get("query") or {}).get("pages", {}).values(), key=lambda p: p.get("index", 0))
        return [commons_item(p, kind) for p in pages]
    if a.route == "internet_archive":
        if a.collection and not IA_ID.match(a.collection):
            raise Stop(USAGE, "--collection takes an Internet Archive collection id (letters, digits, '_', '.', '-')")
        mediatype = {"video": "movies", "audio": "audio", "image": "image"}[kind]
        query = f"({a.terms}) AND mediatype:{mediatype}" + (f" AND collection:{a.collection}" if a.collection else "")
        data = get_json("https://archive.org/advancedsearch.php?" + urllib.parse.urlencode(
            [("q", query), *[("fl[]", f) for f in ("identifier", "title", "creator", "date", "licenseurl")], ("rows", n),
             ("output", "json")]), cache)
        return [{"id": d.get("identifier"), "kind": kind, "title": text_of(d.get("title")), "author": text_of(d.get("creator")),
                 "license": license_id(url=d.get("licenseurl") or ""), "published": text_of(d.get("date"))[:10],
                 "source_url": f"https://archive.org/details/{d.get('identifier')}"} for d in (data.get("response") or {}).get("docs", [])]
    if a.route == "nasa":
        data = get_json(NASA + "search?" + urllib.parse.urlencode({"q": a.terms, "media_type": kind, "page_size": max(n, 1)}), cache)
        out = []
        for it in ((data.get("collection") or {}).get("items") or [])[:n]:
            d = (it.get("data") or [{}])[0]
            out.append({"id": d.get("nasa_id"), "kind": kind, "title": d.get("title"),
                        "author": d.get("photographer") or d.get("secondary_creator") or d.get("center"),
                        "license": "public-domain", "published": (d.get("date_created") or "")[:10],
                        "source_url": f"https://images.nasa.gov/details/{urllib.parse.quote(d.get('nasa_id') or '')}"})
        return out
    return search_youtube(a, n)


def resolve(a, cache):
    """One item's facts and the media URL to fetch, from the route's own metadata."""
    if a.route == "openverse":
        if not re.fullmatch(r"[0-9a-fA-F-]{36}", a.id):
            raise Stop(USAGE, "an Openverse id is the 36-character id printed by search")
        kind = a.type or "image"
        return ov_item(get_json(ov_url(kind) + a.id + "/", cache), kind)
    if a.route == "wikimedia":
        title = a.id if a.id.startswith("File:") else f"File:{a.id}"
        params = {"action": "query", "format": "json", "titles": title, "prop": "imageinfo", "iiprop": "url|size|mime|extmetadata",
                  "iiextmetadatafilter": EXT_META, "iiurlwidth": str(a.width)}
        pages = (get_json(COMMONS + "?" + urllib.parse.urlencode(params), cache).get("query") or {}).get("pages", {})
        page = next(iter(pages.values()), {})
        if "missing" in page or not page.get("imageinfo"):
            raise Stop(FAIL, f"{title} is not a file on Wikimedia Commons")
        item = commons_item(page, a.type)
        if item["kind"] == "image" and item.get("thumb") and (item.get("width") or 0) > a.width:
            item["notes"] = [f"original {item['width']}x{item['height']} at {item['media_url']}"]
            item["media_url"], item["rendition"] = item["thumb"].split("?")[0], f"{item.get('thumbwidth') or a.width}px wide"
        item["ext"] = item["media_url"].rsplit(".", 1)[-1].lower()
        return item
    if a.route == "internet_archive":
        return resolve_archive(a, cache)
    return resolve_nasa(a, cache)


def resolve_archive(a, cache):
    if not IA_ID.match(a.id):
        raise Stop(USAGE, "an Internet Archive id is the item identifier printed by search")
    m = get_json(f"https://archive.org/metadata/{a.id}", cache)
    md = m.get("metadata") or {}
    if not md:
        raise Stop(FAIL, f"{a.id} is not an item on the Internet Archive")
    kind = a.type or {"movies": "video", "audio": "audio", "image": "image"}.get(md.get("mediatype"))
    if kind not in IA_FORMATS:
        raise Stop(FAIL, f"{a.id} is a '{md.get('mediatype')}' item, not footage, sound or a still")
    files = m.get("files") or []
    if a.file:
        files = [f for f in files if f.get("name") == a.file]
        if not files:
            raise Stop(FAIL, f"{a.id} has no file named {a.file}")
    else:
        files = [f for f in files if f.get("format") in IA_FORMATS[kind]]
        if not files:
            raise Stop(FAIL, f"{a.id} has no {kind} file in a format this script reads; name one with --file")
        size = lambda f: int(f.get("size") or 0)
        if kind == "video":
            h = lambda f: int(float(f.get("height") or 0))
            tall = [f for f in files if a.height and h(f) >= a.height]
            files = [min(tall, key=h)] if tall else [max(files, key=lambda f: (h(f), size(f)))]
        else:
            files = [max(files, key=lambda f: (f.get("source") == "original", IA_FORMATS[kind].index(f["format"]) * -1, size(f)))]
    f = files[0]
    lic_url = https(md.get("licenseurl"))
    creator = text_of(md.get("creator"))
    item = {"id": a.id, "kind": kind, "title": text_of(md.get("title")) or a.id, "author": creator,
            "owner": creator or "not stated on the archive item", "license": license_id(url=lic_url),
            "license_name": lic_url or text_of(md.get("rights"))[:200] or "not stated", "license_url": lic_url,
            "published": text_of(md.get("date"))[:10], "source_url": f"https://archive.org/details/{a.id}",
            "media_url": f"https://archive.org/download/{a.id}/{urllib.parse.quote(f['name'])}",
            "rendition": "original" if f.get("source") == "original" else f"{f.get('format')}", "bytes": int(f.get("size") or 0),
            "ext": f["name"].rsplit(".", 1)[-1].lower()}
    if md.get("rights"):
        item["notes"] = [f"rights field: {text_of(md.get('rights'))[:300]}"]
    return item


def resolve_nasa(a, cache):
    q = urllib.parse.quote(a.id, safe="")
    items = ((get_json(NASA + f"search?nasa_id={q}", cache).get("collection") or {}).get("items") or [])
    if not items:
        raise Stop(FAIL, f"{a.id} is not an item in the NASA Image and Video Library")
    d = (items[0].get("data") or [{}])[0]
    kind = a.type or d.get("media_type")
    hrefs = [urllib.parse.quote(https(x.get("href") or ""), safe=":/~%") for x in
             (get_json(NASA + f"asset/{q}", cache).get("collection") or {}).get("items", [])]
    if a.file:
        prefs = [a.file]
    elif kind == "video":
        h = a.height or 1080
        prefs = (["~large.mp4", "~orig.mp4", "~medium.mp4"] if h >= 1080 else ["~medium.mp4", "~large.mp4", "~orig.mp4"]
                 if h >= 720 else ["~small.mp4", "~mobile.mp4", "~medium.mp4"]) + ["~small.mp4", "~mobile.mp4", "~preview.mp4"]
    elif kind == "audio":
        prefs = ["~orig.wav", "~orig.mp3", "~128k.mp3", "~orig.m4a"]
    else:
        prefs = ["~large.jpg", "~orig.jpg", "~medium.jpg", "~orig.png", "~large.png"]
    media = next((u for p in prefs for u in hrefs if u.endswith(urllib.parse.quote(p, safe="~."))), None)
    if not media:
        raise Stop(FAIL, f"{a.id} has no usable {kind} rendition; the files are: {', '.join(u.rsplit('/', 1)[-1] for u in hrefs)[:600]}")
    author = d.get("photographer") or d.get("secondary_creator") or ""
    return {"id": a.id, "kind": kind, "title": d.get("title") or a.id, "author": author,
            "owner": "NASA" + (f" ({d['center']})" if d.get("center") else ""), "license": "public-domain",
            "license_name": "NASA media guidelines (generally not copyrighted)", "license_url": NASA_LICENSE_URL,
            "published": (d.get("date_created") or "")[:10], "source_url": f"https://images.nasa.gov/details/{q}",
            "media_url": media, "rendition": "original" if "~orig." in media else media.rsplit("~", 1)[-1].rsplit(".", 1)[0],
            "ext": media.rsplit(".", 1)[-1].lower(),
            "notes": ["NASA media guidelines: an item credited to a non-NASA source keeps that source's rights; read its credit line"]}


# ---------------------------------------------------------------- official channels through the pinned yt-dlp

def ytdlp_pin():
    try:
        return json.loads(VERSIONS.read_text(encoding="utf-8"))["pip"]["yt-dlp"]["version"]
    except (OSError, ValueError, KeyError):
        return "the version in ice-engines references/versions.json"


def ytdlp():
    exe = shutil.which("yt-dlp")
    if exe:
        return [exe]
    if importlib.util.find_spec("yt_dlp"):
        return [sys.executable, "-m", "yt_dlp"]
    raise Stop(FAIL, "yt-dlp is not installed. Install the pinned version into the project virtual environment, no question "
                     f"needed (ice-engines references/engine-choice.md section 7.6): python -m pip install yt-dlp=={ytdlp_pin()}")


def run_ytdlp(args):
    r = subprocess.run([*ytdlp(), "--no-warnings", "--socket-timeout", str(TIMEOUT_S), *args], capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    return r.returncode, r.stdout, r.stderr.strip()[-600:]


def search_youtube(a, n):
    code, out, err = run_ytdlp(["--flat-playlist", "--print", "%(id)s\t%(title)s\t%(channel)s\t%(channel_url)s\t%(upload_date)s\t%(duration)s",
                                f"ytsearch{min(n, 10)}:{a.terms}"])
    if code != 0:
        raise Stop(FAIL, f"yt-dlp search failed: {err}")
    rows = []
    for line in out.splitlines():
        p = (line.split("\t") + [""] * 6)[:6]
        rows.append({"id": p[0], "kind": "video", "title": p[1], "author": p[2], "channel_url": p[3],
                     "published": p[4] if p[4] != "NA" else "", "duration_s": p[5] if p[5] != "NA" else None,
                     "source_url": f"https://www.youtube.com/watch?v={p[0]}"})
    return rows


def single_clip_url(s):
    """One video's URL, or a refusal: a channel, playlist or search page is never fetched (section 7)."""
    s = s.strip()
    if re.fullmatch(r"[A-Za-z0-9_-]{11}", s):
        return f"https://www.youtube.com/watch?v={s}"
    u = urllib.parse.urlparse(s)
    if u.scheme not in ("http", "https") or not u.netloc:
        raise Stop(USAGE, "give the clip's URL (or an 11-character video id)")
    qs = urllib.parse.parse_qs(u.query)
    path = u.path.rstrip("/")
    clip = re.search(r"/(watch|shorts/[^/]+|live/[^/]+|embed/[^/]+)$", path) or "youtu.be" in u.netloc or "/status/" in path
    if "list" in qs or "search_query" in qs or re.search(r"/(playlist|results|channel|c|user|feed)(/|$)", path) \
            or re.match(r"^/@[^/]+(/(videos|streams|shorts|featured|playlists))?$", path) or ("youtube" in u.netloc and not clip):
        raise Stop(REFUSED, "that is a channel, a playlist or a search page: Ice takes one clip at a time from an official "
                            "channel (sourcing-and-licenses.md sections 1a and 7); give the clip's own URL")
    return s


def same_channel(given, info):
    norm = lambda u: re.sub(r"^https?://(www\.|m\.)?", "", str(u or "").strip().lower()).rstrip("/")
    g = norm(given)
    known = {norm(info.get("channel_url")), norm(info.get("uploader_url"))}
    for key, fmt in (("channel_id", "youtube.com/channel/{}"), ("uploader_id", "youtube.com/{}")):
        if info.get(key):
            known |= {norm(fmt.format(info[key])), str(info[key]).lower()}
    known.discard("")
    return g in known


def youtube_size(info, height, window):
    fmts = info.get("formats") or []
    size = lambda f: f.get("filesize") or f.get("filesize_approx") or 0
    vids = [f for f in fmts if f.get("vcodec") not in (None, "none") and (f.get("height") or 0) <= height and size(f)]
    auds = [f for f in fmts if f.get("vcodec") in (None, "none") and f.get("acodec") not in (None, "none") and size(f)]
    total = (max((size(f) for f in vids), default=0) + max((size(f) for f in auds), default=0)) or info.get("filesize_approx") or 0
    dur = info.get("duration") or 0
    if window and dur:
        total = total * (window[1] - window[0]) / dur
    return int(total)


def get_youtube(a, project, s, cache):
    url = single_clip_url(a.id)
    gate(s, "youtube_official", "get", a.yes)
    code, out, err = run_ytdlp(["--no-playlist", "--skip-download", "-J", url])
    if code != 0:
        raise Stop(FAIL, f"yt-dlp could not read the clip: {err}")
    try:
        info = json.loads(out)
    except ValueError:
        raise Stop(FAIL, "yt-dlp did not print the clip's facts as JSON")
    if info.get("_type") == "playlist" or info.get("entries"):
        raise Stop(REFUSED, "that URL is a list of clips: one clip at a time (sourcing-and-licenses.md section 7)")
    if not same_channel(a.channel, info):
        raise Stop(REFUSED, f"the clip is from {info.get('channel') or info.get('uploader')} ({info.get('channel_url') or info.get('uploader_url')}), "
                            f"not the official channel given ({a.channel}): section 1a takes clips only from the owner's or an "
                            "agency's or broadcaster's official channel")
    est = youtube_size(info, a.height, a.window)
    check_size(s, est, a.yes, "this clip")
    check_disk(project / "temp" / "dl", est)
    lic_raw = str(info.get("license") or "")
    lic = "CC-BY-3.0" if "creative commons" in lic_raw.lower() else ""
    platform = {"youtube": "YouTube"}.get(str(info.get("extractor_key") or "").lower(), info.get("extractor_key") or "a video platform")
    item = {"id": info.get("id"), "kind": "video", "title": info.get("title") or info.get("id"),
            "author": info.get("channel") or info.get("uploader") or "", "owner": info.get("channel") or info.get("uploader") or "",
            "license": lic, "license_name": lic_raw or "not stated (the platform's standard license)",
            "license_url": "https://creativecommons.org/licenses/by/3.0/legalcode" if lic else "",
            "status": "licensed" if lic else ("needs purchase" if a.owner_kind == "agency" else "unknown"),
            "published": re.sub(r"^(\d{4})(\d\d)(\d\d)$", r"\1-\2-\3", str(info.get("upload_date") or "")),
            "source_url": https(info.get("webpage_url") or url), "media_url": https(info.get("webpage_url") or url),
            "rendition": "height-capped", "ext": "mp4", "channel_url": info.get("channel_url") or info.get("uploader_url") or "", "official_from": a.official_from,
            "delivery_line": (DELIVERY_LINE.format(platform=platform) if not lic else
                              f"Downloaded from {platform} with yt-dlp; the platform's terms do not allow downloads.")}
    fmt = f"bv*[height<={a.height}][vcodec^=avc1]+ba[ext=m4a]/bv*[height<={a.height}]+ba/b[height<={a.height}]"
    stem = hashlib.sha1(f"{url}{a.window}".encode("utf-8")).hexdigest()[:12]
    for attempt in range(1, TRIES + 1):
        work = project / "temp" / "dl" / f"{stem}-try{attempt}"
        shutil.rmtree(work, ignore_errors=True)
        work.mkdir(parents=True)
        args = ["--no-playlist", "-f", fmt, "--merge-output-format", "mp4", "-o", str(work / "clip.%(ext)s")]
        if a.window:
            args += ["--download-sections", f"*{a.window[0]:g}-{a.window[1]:g}"] + (["--force-keyframes-at-cuts"] if a.exact else [])
        code, _, err = run_ytdlp([*args, url])
        done = work / "clip.mp4"
        if code == 0 and done.is_file() and done.stat().st_size > 0:
            return item, done
        log(f"  yt-dlp try {attempt} of {TRIES} failed: {err[-200:]}")
    raise Stop(FAIL, f"yt-dlp could not download the clip after {TRIES} tries: {err}")


# ---------------------------------------------------------------- commands

def parse_window(text):
    m = re.fullmatch(r"\s*(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*", text or "")
    if not m or float(m.group(2)) <= float(m.group(1)):
        raise Stop(USAGE, f"--window takes <start>-<end> in seconds with end after start, got '{text}'")
    return float(m.group(1)), float(m.group(2))


def slug(text, limit=40):
    t = unicodedata.normalize("NFKD", str(text or "")).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")[:limit].strip("-")


def target(project, kind, role, subject, variant, route, ext, media_url, window):
    """assets/<folder>/<role>_<subject>_<variant>_<source>.<ext> (project-folders.md section 2); an existing file with
    the same media URL and window is the same item."""
    folder = project / "assets" / FOLDER[kind]
    base = slug(subject) or "item"
    for k in range(1, 100):
        name = f"{role}_{base}{'' if k == 1 else f'-{k}'}_{slug(variant, 24) or 'full'}_{slug(route.replace('_', '-'))}.{ext}"
        path = folder / name
        side = project / "ice" / "assets" / "sources" / f"{name}.json"
        if not path.exists():
            return path, False
        try:
            old = json.loads(side.read_text(encoding="utf-8"))
            if old.get("media_url") == media_url and old.get("window") == window:
                return path, True
        except (OSError, ValueError):
            pass
    raise Stop(FAIL, f"too many files named {role}_{base}_*: pass --subject")


def finish(a, project, item, work_file, changes):
    """Scale, move into assets/, probe, hash and write the records."""
    kind = item["kind"]
    facts = probe_file(work_file)
    if kind == "video" and a.height and (facts.get("height") or 0) > a.height:
        scaled = work_file.with_name(work_file.stem + "-scaled.mp4")
        ok, err = ffmpeg(["-i", str(work_file), "-vf", f"scale=-2:{a.height}", "-c:v", "libx264", "-preset", "medium", "-crf", "18",
                          "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", str(scaled)])
        if not ok:
            raise Stop(FAIL, f"scaling to {a.height}p failed: {err}")
        changes.append(f"scaled from {facts.get('height')}p to {a.height}p")
        work_file, facts = scaled, probe_file(scaled)
    elif kind == "video" and a.height and facts.get("height") and facts["height"] < a.height:
        item.setdefault("notes", []).append(f"{facts['height']}p is under the output height {a.height}p: never upscaled to fake detail; "
                                            "look for a larger rendition (--file) or another item")
    window = f"{a.window[0]:g}-{a.window[1]:g}" if a.window else "full"
    if a.window:
        variant = window.replace(".", "p") + "s"
    elif kind == "video":
        variant = "full"
    else:
        variant = "orig" if item["rendition"] == "original" else item["rendition"]
    if kind == "video" and facts.get("height"):
        variant += f"-{facts['height']}p"
    role = a.role or DEFAULT_ROLE[kind]
    ext = work_file.suffix.lstrip(".").lower() or item.get("ext") or "bin"
    dest, same = target(project, kind, role, a.subject or item["title"] or item["id"], variant, a.route, ext, item["media_url"], window)
    if same and not a.force:
        log(f"already fetched: {dest.relative_to(project).as_posix()} (pass --force to fetch again)")
        return OK
    dest.parent.mkdir(parents=True, exist_ok=True)
    os.replace(work_file, dest)
    facts = probe_file(dest)
    lic = item.get("license") or ""
    rendition = item["rendition"]
    if kind == "video" and facts.get("height") and rendition != "original":
        rendition = f"{facts['height']}p"
    side = {"file": dest.relative_to(project).as_posix(), "route": a.route, "title": item["title"],
            "author": item.get("author") or "not stated at the source", "license": lic or "none",
            "license_url": item.get("license_url") or "none",
            "license_status": item.get("status") or status_for(lic, project), "source_url": item["source_url"],
            "media_url": item["media_url"], "rendition": rendition, "window": window, "probe": facts, "fetched": today(),
            "sha256": sha256(dest), "owner": item.get("owner") or item.get("author") or f"not stated on {SITES[a.route]}"}
    optional = {"license_name": item.get("license_name"), "published": item.get("published"),
                "attribution": attribution_for({**item, **side, "route": a.route, "license": lic}),
                **{k: item.get(k) for k in ("channel_url", "official_from", "delivery_line", "notes")}}
    side.update({k: v for k, v in optional.items() if v})
    write_records(project, side, role, item["title"], "; ".join(changes))
    print(json.dumps(side, ensure_ascii=False, indent=2))
    if side.get("delivery_line"):
        print(f"delivery note line: {side['delivery_line']}")
    return OK


def need_project(path):
    project = Path(path).resolve()
    if not project.is_dir():
        raise Stop(USAGE, f"--project must be the user's project folder, and {project} is not a folder")
    return project


def cmd_search(a):
    if a.type and a.type not in ROUTES[a.route]:
        raise Stop(USAGE, f"route {a.route} has types {', '.join(ROUTES[a.route])}, not {a.type}")
    if not a.terms.strip() or not a.terms_from.strip():
        raise Stop(USAGE, "--terms and --terms-from must not be empty: the words come from the scene's script line or a brief slot")
    project = need_project(a.project) if a.project else None
    gate(load_settings(project), a.route, "search")
    rows = search(a, project / "temp" / "cache" if project else None)
    print(json.dumps({"search": a.route, "terms": a.terms, "terms_from": a.terms_from, "date": today(), "found": len(rows)},
                     ensure_ascii=False))
    for r in rows:
        r["license_status"] = "licensed" if r.get("license") else "unknown"
        print(json.dumps({k: v for k, v in r.items() if v not in (None, "") and k not in ("thumb", "thumbwidth", "kind")},
                         ensure_ascii=False))
    return OK if rows else FAIL


def cmd_get(a):
    if a.type and a.type not in ROUTES[a.route]:
        raise Stop(USAGE, f"route {a.route} has types {', '.join(ROUTES[a.route])}, not {a.type}")
    a.window = parse_window(a.window) if a.window else None
    video = a.type == "video" or a.route == "youtube_official"
    if video and not a.height:
        raise Stop(USAGE, "--height is required for video: the output height, or the larger height the zoom rule needs "
                          "(sourcing-and-licenses.md section 5)")
    if a.window and a.type in ("image", "svg"):
        raise Stop(USAGE, "--window is for video and sound, not stills")
    if a.route == "youtube_official":
        missing = [f for f, v in (("--channel", a.channel), ("--official-from", a.official_from), ("--owner-kind", a.owner_kind)) if not v]
        if missing:
            raise Stop(USAGE, f"youtube_official needs {', '.join(missing)}: the official channel, where it was found official, "
                              "and whether the owner is an agency or broadcaster (sourcing-and-licenses.md section 1a, rung 3)")
    project = need_project(a.project)
    s = load_settings(project)
    cache = project / "temp" / "cache"
    changes = []
    if a.route == "youtube_official":
        item, work_file = get_youtube(a, project, s, cache)
        if a.window:
            changes.append(f"window {a.window[0]:g}-{a.window[1]:g} s (yt-dlp download sections)")
        try:
            return finish(a, project, item, work_file, changes)
        finally:
            shutil.rmtree(work_file.parent, ignore_errors=True)
    gate(s, a.route, "get", a.yes)
    item = resolve(a, cache)
    kind = item["kind"]
    if kind == "video" and not a.height:
        raise Stop(USAGE, "this item is video: run again with --height (the output height, section 5)")
    if a.window and kind not in ("video", "audio"):
        raise Stop(USAGE, "--window is for video and sound, not stills")
    work = project / "temp" / "dl" / hashlib.sha1(f"{item['media_url']}{a.window}".encode("utf-8")).hexdigest()[:12]
    shutil.rmtree(work, ignore_errors=True)
    work.mkdir(parents=True)
    ext = item.get("ext") or "bin"
    if a.window:
        out = work / f"window.{'mp4' if a.exact and kind == 'video' else ext}"
        ranged, total = probe_ranges(item["media_url"])
        if ranged:
            cut_window(item["media_url"], out, a.window, kind == "video", a.exact, remote=True)
            check_size(s, out.stat().st_size, a.yes, "the cut window")
            changes.append(f"window {a.window[0]:g}-{a.window[1]:g} s cut over byte ranges")
        else:
            whole = work / f"whole.{ext}"
            download(item["media_url"], whole, s, a.yes, "the whole file (the host does not serve byte ranges)")
            cut_window(whole, out, a.window, kind == "video", a.exact, remote=False)
            whole.unlink(missing_ok=True)
            changes.append(f"window {a.window[0]:g}-{a.window[1]:g} s cut locally")
        if a.exact and kind == "video":
            changes.append("re-encoded for a frame-exact in point")
    else:
        out = work / f"file.{ext}"
        download(item["media_url"], out, s, a.yes, "this file")
    try:
        return finish(a, project, item, out, changes)
    finally:
        shutil.rmtree(work, ignore_errors=True)


def cmd_record(a):
    src = Path(a.file).resolve()
    if not src.is_file():
        raise Stop(USAGE, f"{a.file} is not a file")
    project = need_project(a.project)
    kind = a.type or EXT_KIND.get(src.suffix.lstrip(".").lower())
    if not kind:
        raise Stop(USAGE, f"cannot tell the media type of {src.name}: pass --type")
    lic = ""
    if a.license:
        lic = license_id(a.license) or (a.license if GIVEN_IDS.match(a.license) else "")
        if not lic:
            raise Stop(USAGE, f"--license '{a.license}' is not a license id the asset gate reads (CC ids such as CC-BY-4.0, CC0-1.0, "
                              "PDM, public-domain, OFL-1.1, MIT, Apache-2.0, or a platform name); use --license-status instead")
    status = a.license_status or (status_for(lic, project) if lic else None)
    if not status:
        raise Stop(USAGE, "give --license <id> or --license-status licensed|unknown|needs purchase")
    role = a.role or DEFAULT_ROLE[kind]
    assets = (project / "assets").resolve()
    if assets in src.parents:
        dest = src
    else:
        ext = src.suffix.lstrip(".").lower() or "bin"
        dest, _ = target(project, kind, role, a.subject or a.title or src.stem, "orig", a.route, ext, a.media_url or a.source_url, "full")
        dest.parent.mkdir(parents=True, exist_ok=True)
        (shutil.move if a.move else shutil.copy2)(str(src), str(dest))
    side = {"file": dest.relative_to(project).as_posix(), "route": a.route, "title": a.title or src.stem,
            "author": a.author or a.owner, "license": lic or "none", "license_url": https(a.license_url) or "none",
            "license_status": status, "source_url": a.source_url, "media_url": a.media_url or a.source_url, "rendition": "original",
            "window": "full", "probe": probe_file(dest), "fetched": today(), "sha256": sha256(dest), "owner": a.owner}
    credit = a.attribution or attribution_for({"license": lic, "title": side["title"], "author": side["author"], "owner": a.owner,
                                               "license_url": side["license_url"], "route": a.route if a.route in SITES else "user-download",
                                               "source_url": a.source_url})
    if credit:
        side["attribution"] = credit
    write_records(project, side, role, side["title"], a.changes)
    print(json.dumps(side, ensure_ascii=False, indent=2))
    return OK


def cmd_doctor(a):
    project = need_project(a.project) if a.project else None
    s = load_settings(project)
    print(f"User-Agent: {UA}")
    print(f"downloads: {s['downloads']} ({s['origin']['downloads']}); max_download_mb: {s['max_download_mb']:g} "
          f"({s['origin']['max_download_mb']})")
    for r in ROUTES:
        v, origin = s["routes"].get(r, (True, "default"))
        if s["downloads"] == "off" or v is False:
            state, origin = "off", origin if v is False else s["origin"]["downloads"]
        elif v == "ask" or s["downloads"] == "ask":
            state, origin = "ask (search runs; a download needs --yes after the user's yes)", origin if v == "ask" else s["origin"]["downloads"]
        else:
            state = "on"
        print(f"route {r}: {state} ({origin})")
    for tool in ("ffmpeg", "ffprobe"):
        print(f"{tool}: {'found' if shutil.which(tool) else 'not on PATH'}")
    try:
        code, out, _ = run_ytdlp(["--version"])
        have = out.strip() if code == 0 else "not runnable"
    except Stop:
        have = "not installed"
    pin = ytdlp_pin()
    print(f"yt-dlp: {have} (pin {pin}{'' if have == pin else '; install the pin without a question, engine-choice.md section 7.6'})")
    return OK


def main(argv=None):
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0], epilog=__doc__.split("\n\n", 1)[1],
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    se = sub.add_parser("search", help="list candidates from one route; nothing is downloaded")
    se.add_argument("route", choices=list(ROUTES))
    se.add_argument("--terms", required=True, help="the search words, built from the scene's script line or a brief slot")
    se.add_argument("--terms-from", required=True, help="the script line or brief slot the words come from (printed back for the log)")
    se.add_argument("--type", choices=("image", "svg", "video", "audio"), help="media type (default: the route's first type)")
    se.add_argument("--n", type=int, default=5, help=f"how many candidates (at most {MAX_CANDIDATES})")
    se.add_argument("--license", help="openverse only: license codes the route filters by, comma separated")
    se.add_argument("--source", help="openverse only: one source the route indexes")
    se.add_argument("--collection", help="internet_archive only: a collection id")
    se.add_argument("--project", help="the user's project folder (answers are cached in its temp/cache/)")
    ge = sub.add_parser("get", help="fetch ONE chosen item into the project with its records")
    ge.add_argument("route", choices=list(ROUTES))
    ge.add_argument("id", help="the id printed by search (youtube_official: the clip's URL or video id)")
    ge.add_argument("--project", required=True, help="the user's project folder")
    ge.add_argument("--type", choices=("image", "svg", "video", "audio"), help="media type (openverse: image or audio)")
    ge.add_argument("--height", type=int, help="video: the output height, or the larger height the zoom rule needs")
    ge.add_argument("--width", type=int, default=2000, help="wikimedia stills: the widest rendition to take (default 2000)")
    ge.add_argument("--window", help="video or sound: <start>-<end> in seconds, cut over byte ranges when the host allows")
    ge.add_argument("--exact", action="store_true", help="re-encode the window so its in point is frame exact")
    ge.add_argument("--file", help="internet_archive or nasa: the exact file or rendition name to take")
    ge.add_argument("--role", choices=ROLES, help="manifest role (default by type: footage, photo, icon, sfx)")
    ge.add_argument("--subject", help="the subject slot of the file name (project-folders.md section 2)")
    ge.add_argument("--channel", help="youtube_official: the official channel URL the clip must come from")
    ge.add_argument("--official-from", help="youtube_official: the owner's page that links the channel, or 'verified mark'")
    ge.add_argument("--owner-kind", choices=("agency", "other"), help="youtube_official: agency or broadcaster (needs purchase) or other (unknown)")
    ge.add_argument("--yes", action="store_true", help="the user agreed in a stop (downloads ask, a route set to ask, over the size cap)")
    ge.add_argument("--force", action="store_true", help="fetch again even when the same item is already in the project")
    re_ = sub.add_parser("record", help="write the sidecar, manifest row and credits row for a local file")
    re_.add_argument("file")
    re_.add_argument("--project", required=True, help="the user's project folder")
    re_.add_argument("--title", required=True, help="the item's title at its source")
    re_.add_argument("--owner", required=True, help="who made or holds the item")
    re_.add_argument("--source-url", required=True, help="the page the item came from (https), or user-provided://<original name>")
    re_.add_argument("--media-url", help="the file URL, when it differs from the page")
    re_.add_argument("--author", help="the creator, when it differs from the owner")
    re_.add_argument("--license", help="a license id the asset gate reads, such as a CC id")
    re_.add_argument("--license-url", help="the license text's link")
    re_.add_argument("--license-status", choices=("licensed", "unknown", "needs purchase"))
    re_.add_argument("--attribution", help="paste-ready credit (written for CC BY items when not given)")
    re_.add_argument("--route", default="user-download", help="a route id of sourcing-and-licenses.md section 4, or user-download")
    re_.add_argument("--type", choices=("image", "svg", "video", "audio"))
    re_.add_argument("--role", choices=ROLES)
    re_.add_argument("--subject", help="the subject slot of the file name")
    re_.add_argument("--changes", default="", help="changes already made to the file")
    re_.add_argument("--move", action="store_true", help="move the file into assets/ instead of copying it (files from assets/inbox/)")
    do = sub.add_parser("doctor", help="settings, tools and User-Agent; no network")
    do.add_argument("--project", help="the user's project folder (reads its ice/sources.json)")
    a = ap.parse_args(argv)
    if a.cmd == "record" and not re.fullmatch(r"[a-z][a-z0-9_-]*", a.route):
        ap.error("--route takes a route id such as user-download")
    try:
        return {"search": cmd_search, "get": cmd_get, "record": cmd_record, "doctor": cmd_doctor}[a.cmd](a)
    except Stop as e:
        log(("not fetched: " if e.code == REFUSED else "error: ") + str(e))
        return e.code


if __name__ == "__main__":
    sys.exit(main())
